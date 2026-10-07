/* =====================================================================
   CONTA E NUVEM: login com Google (página cadastro.html) e sincronização
   dos treinos com o Supabase. Só funciona com a página servida por http(s)
   fora do visualizador do Claude; em qualquer outro lugar fica desligado.
   ===================================================================== */
/* NUVEM_CFG vem do build (src/nuvem.config.json) */
const NUV = {sb:null, sessao:null, perfil:null, estado:"", erro:"", ultima:null, carregando:null};
const CHAVE_NUVEM = "torquimetro-gym.nuvem";
const memoNuvem = () => { try{ return JSON.parse(localStorage.getItem(CHAVE_NUVEM)) || {}; }catch(e){ return {}; } };
const gravarMemoNuvem = m => { try{ localStorage.setItem(CHAVE_NUVEM, JSON.stringify(m)); }catch(e){} };
const refNuvem = () => (NUVEM_CFG.url.match(/https:\/\/([a-z0-9]+)\./)||[])[1] || "";
const nuvemPossivel = () => !!(NUVEM_CFG.url && linkDaPagina());
/* há sessão guardada? (evita baixar a biblioteca para quem nunca entrou) */
const temSessaoGuardada = () => { try{ return !!localStorage.getItem("sb-"+refNuvem()+"-auth-token"); }catch(e){ return false; } };

function carregarBibliotecaNuvem(){
  if(NUV.carregando) return NUV.carregando;
  NUV.carregando = new Promise((ok, falha)=>{
    if(window.supabase) return ok();
    const s = document.createElement("script"); s.src = NUVEM_CFG.biblioteca; s.onload = ok; s.onerror = ()=>falha(new Error("biblioteca")); document.head.appendChild(s);
  }).then(()=>{
    NUV.sb = window.supabase.createClient(NUVEM_CFG.url, NUVEM_CFG.chave, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:false, flowType:"pkce"}});
    return NUV.sb;
  });
  return NUV.carregando;
}
async function iniciarNuvem(){
  if(!nuvemPossivel() || !temSessaoGuardada()) return;
  try{
    await carregarBibliotecaNuvem();
    const {data:{session}} = await NUV.sb.auth.getSession();
    NUV.sessao = session;
    if(session) await sincronizarNuvem({silencioso:true});
  }catch(e){ NUV.erro = "Sem conexão com a nuvem agora."; }
  if(typeof tela!=="undefined" && tela==="ajustes") renderAtual();
}

function erroNuvem(e){
  const m = String((e && e.message) || e || "");
  if(/Failed to fetch|NetworkError|Load failed|biblioteca/i.test(m)) return "Sem conexão com a nuvem. Os treinos continuam salvos neste aparelho.";
  if(/JWT|session|token/i.test(m)) return "A sessão expirou. Entre de novo pela página de cadastro.";
  return "A sincronização falhou: " + m;
}

/* lê todas as linhas de uma consulta em páginas de 1000 */
async function lerTudo(montar){
  const out = []; let de = 0;
  for(;;){ const {data, error} = await montar().range(de, de+999); if(error) throw error; out.push(...data); if(data.length<1000) return out; de += 1000; }
}

async function sincronizarNuvem(op){
  op = op || {};
  if(!NUV.sb || !NUV.sessao || NUV.estado==="sincronizando") return null;
  NUV.estado = "sincronizando"; NUV.erro = ""; atualizarPainelNuvem();
  const uid = NUV.sessao.user.id, memo = memoNuvem();
  try{
    /* cadastro: nome e medidas entram no app na primeira sincronização */
    const {data:perfil} = await NUV.sb.from("perfis").select("*").eq("id", uid).maybeSingle();
    NUV.perfil = perfil || null;
    /* dados de exemplo nunca sobem: na primeira sincronização eles saem e entra o que está na conta */
    if(S.exemplo){ const vazio = estadoVazio(); vazio.ajustes = S.ajustes; S = migrar(vazio); S.exemplo = false; memo.hashes = {}; memo.apagados = []; memo.estado = null; }
    const primeiraVez = !memo.estado;
    if(primeiraVez && perfil && perfil.cadastro_completo){
      if(perfil.apelido && !S.perfil.nome) S.perfil.nome = perfil.apelido;
      if(perfil.altura_cm) S.perfil.altura = +perfil.altura_cm;
      if(perfil.massa_kg && !S.peso.length) S.perfil.massa = +perfil.massa_kg;
    }
    /* treinos */
    const remotas = await lerTudo(()=>NUV.sb.from("treinos").select("id,data,nome,rotina_id,inicio,fim,origem,itens,apagado").eq("usuario_id", uid).order("id"));
    const m = mesclarTreinosNuvem(S.treinos, remotas, memo);
    for(let i=0; i<m.enviar.length; i+=200){
      const {error} = await NUV.sb.from("treinos").upsert(m.enviar.slice(i,i+200).map(t=>Object.assign(linhaDeTreino(t), {usuario_id:uid})), {onConflict:"usuario_id,id"});
      if(error) throw error;
    }
    if(m.apagar.length){
      const {error} = await NUV.sb.from("treinos").upsert(m.apagar.map(id=>({usuario_id:uid, id, data:new Date().toISOString(), itens:[], apagado:true})), {onConflict:"usuario_id,id"});
      if(error) throw error;
    }
    S.treinos = m.treinos;
    memo.hashes = Object.fromEntries(S.treinos.map(t=>[t.id, assinaturaTreino(t)]));
    memo.apagados = [];
    /* rotinas, semana, ajustes, peso e notas */
    const {data:linhaEstado, error:eE} = await NUV.sb.from("estado_app").select("dados,atualizado_em").eq("usuario_id", uid).maybeSingle();
    if(eE) throw eE;
    const local = estadoParaNuvem(S), hLocal = hashTexto(local);
    let subir = false;
    if(!linhaEstado) subir = true;
    else if(primeiraVez){ Object.assign(S, mesclarEstadoPrimeiraVez(local, linhaEstado.dados)); subir = true; }
    else if(hLocal===memo.estado){ if(hashTexto(linhaEstado.dados)!==hLocal) Object.assign(S, linhaEstado.dados); }   /* mudou só lá */
    else subir = true;                                                                                                    /* mudou aqui */
    S = migrar(S);
    const final = estadoParaNuvem(S);
    if(subir){ const {error} = await NUV.sb.from("estado_app").upsert({usuario_id:uid, dados:final}, {onConflict:"usuario_id"}); if(error) throw error; }
    memo.estado = hashTexto(final);
    memo.ultima = new Date().toISOString();
    gravarMemoNuvem(memo);
    aplicarEstado(); salvar();
    NUV.ultima = memo.ultima; NUV.estado = "";
    const partes = [m.enviar.length && `${m.enviar.length} enviado(s)`, m.recebidos && `${m.recebidos} recebido(s)`, m.removidos && `${m.removidos} removido(s)`].filter(Boolean);
    if(!op.silencioso || partes.length) aviso(partes.length ? "Nuvem em dia: "+partes.join(", ")+"." : "Nuvem em dia.");
    renderAtual();
    return m;
  }catch(e){
    NUV.estado = ""; NUV.erro = erroNuvem(e); atualizarPainelNuvem();
    if(!op.silencioso) aviso(NUV.erro);
    return null;
  }
}
/* chamado depois de salvar ou apagar um treino */
function nuvemDepoisDeMudar(){ if(NUV.sessao) setTimeout(()=>sincronizarNuvem({silencioso:true}), 400); }
function marcarApagadoNuvem(id){
  if(!temSessaoGuardada()) return;
  const m = memoNuvem(); m.apagados = [...new Set([...(m.apagados||[]), id])]; gravarMemoNuvem(m);
}

/* ---------- painel em Ajustes ---------- */
function painelNuvem(){
  const corpo = (()=>{
    if(!NUVEM_CFG.url) return `<p class="pequeno suave">Nenhum banco configurado nesta cópia do app.</p>`;
    if(!nuvemPossivel()) return `<p class="pequeno suave">A conta com Google funciona no app publicado (GitHub Pages). Aqui os dados ficam só neste navegador; use “Seus dados” para levar um backup.</p>`;
    if(!NUV.sessao) return `<p class="pequeno">Entre com o Google para guardar os treinos na sua conta e abri-los em outro aparelho.</p>
      <div class="linha"><a class="btn primario mini" href="cadastro.html">Entrar ou criar cadastro</a></div>
      ${NUV.erro?`<p class="pequeno" style="color:var(--critico)">${esc(NUV.erro)}</p>`:""}`;
    const u = NUV.sessao.user, p = NUV.perfil || {}, nome = p.apelido || p.nome || u.email;
    const ultima = NUV.ultima || memoNuvem().ultima;
    return `<div class="linha" style="gap:12px">${p.foto_url?`<img src="${esc(p.foto_url)}" alt="" width="40" height="40" referrerpolicy="no-referrer" style="border-radius:50%">`:""}
        <div><b>${esc(nome)}</b><div class="pequeno suave">${esc(u.email||"")}</div></div></div>
      <p class="pequeno ${NUV.erro?"":"suave"}" style="margin:0;${NUV.erro?"color:var(--critico)":""}">${NUV.estado==="sincronizando"?"Sincronizando…":NUV.erro?esc(NUV.erro):ultima?`Última sincronização: ${new Date(ultima).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})}. ${S.treinos.length} treinos nesta conta.`:"Ainda não sincronizado."}</p>
      ${p.cadastro_completo===false?`<p class="pequeno">Falta completar o cadastro. <a href="cadastro.html">Completar agora</a></p>`:""}
      <div class="linha"><button class="btn primario mini" type="button" data-acao="nuvem-sincronizar" ${NUV.estado?"disabled":""}>Sincronizar agora</button><a class="btn mini" href="cadastro.html">Ver cadastro</a><button class="btn mini fantasma" type="button" data-acao="nuvem-sair">Sair da conta</button></div>
      <p class="pequeno suave" style="margin:0">Sincroniza sozinho ao abrir o app e depois de cada treino salvo ou excluído.</p>`;
  })();
  return `<div class="painel" id="painelNuvem"><div class="cab"><h3>Conta e nuvem</h3></div><div class="corpo">${corpo}</div></div>`;
}
function atualizarPainelNuvem(){ const el = $("painelNuvem"); if(el) el.outerHTML = painelNuvem(); }

const ACOES_NUVEM = {
  "nuvem-sincronizar": ()=>sincronizarNuvem(),
  "nuvem-sair": ()=>confirmar("Sair da conta", "Os treinos continuam neste aparelho. Para voltar a sincronizar, entre de novo pela página de cadastro.", "Sair", async ()=>{
    try{ await NUV.sb.auth.signOut(); }catch(e){}
    NUV.sessao = NUV.perfil = null; try{ localStorage.removeItem(CHAVE_NUVEM); }catch(e){}
    fecharFolha(); renderAtual(); aviso("Você saiu da conta.");
  })
};
