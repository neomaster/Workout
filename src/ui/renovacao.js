/* =====================================================================
   RENOVAÇÃO: interface, coleta pelo navegador do Claude e persistência
   ===================================================================== */
const RENOV = {estado:"", txt:"", motivo:"", db:null};
const SERV_NAV = "host:claude_browser";
const hojeIso = () => (typeof window!=="undefined" && window.HOJE_TESTE) || isoDia(new Date());
const espera = ms => new Promise(r=>setTimeout(r, ms));
const dataLocal = iso => iso.length>10 ? new Date(iso) : deIso(iso);
const fmtDataLonga = iso => dataLocal(iso).toLocaleDateString("pt-BR",{weekday:"long", day:"2-digit", month:"2-digit", year:"numeric"});
const fmtCurta = iso => deIso(iso.slice(0,10)).toLocaleDateString("pt-BR",{day:"2-digit", month:"2-digit"});
const fmtHora = iso => iso && iso.length>10 ? new Date(iso).toLocaleTimeString("pt-BR",{hour:"2-digit", minute:"2-digit"}) : "";
function salvarAltaLocal(){ try{ localStorage.setItem(CHAVE_ALTA, JSON.stringify(exportarDadosAlta())); }catch(e){} }

function cabecalhoAtualizacao(){
  const u = ultimaRenovacao(), f = FONTES_RENOV[u.fonte] || FONTES_RENOV.pesquisa;
  const n = HISTORICO_ALTA.length, prox = isoDia(somaDias(deIso(u.semana), 7));
  const h = fmtHora(u.feita), rodando = RENOV.estado==="coletando";
  return `<div class="pilha" style="gap:4px" id="renovCab">
    <div class="atualizacao ${rodando?"rodando":""}"><span class="ponto" aria-hidden="true"></span>
    <span>Renovado em <b>${fmtDataLonga(u.feita)}</b>${h?` às ${h}`:""} · <span title="${esc(f.desc)}">${f.nome}${u.fonte==="navegador"?` (${u.medidos} buscas lidas)`:""}</span> · ${n} semana${n>1?"s":""} no arquivo · ${rodando?"<b>renovando agora</b>":S && S.ajustes && S.ajustes.renovarAuto===false?"renovação automática desligada nos Ajustes":`próxima renovação automática a partir de ${fmtCurta(prox)}`}</span></div>
    ${RENOV.txt?`<p class="pequeno suave" style="margin:0" role="status">${esc(RENOV.txt)}</p>`:""}</div>`;
}
function atualizarCab(){ const el = $("renovCab"); if(el) el.outerHTML = cabecalhoAtualizacao(); }

function arquivoSemanas(){
  const semanas = semanasArquivo();
  return `<details class="mais arquivo" ${semanas.length>1?"open":""}><summary>Arquivo de renovações · ${semanas.length} semana${semanas.length>1?"s":""}</summary>
    <p class="pequeno suave" style="margin:8px 0 0">Cada semana guarda a parada do dia da renovação. Nenhum exercício sai do acervo: quem entrou numa semana continua na biblioteca e aparece nas semanas seguintes.</p>
    ${semanas.map((s,k)=>{ const f = FONTES_RENOV[s.fonte]||FONTES_RENOV.pesquisa, h = fmtHora(s.feita), primeira = k===semanas.length-1;
      return `<details class="semana-arq" ${k===0?"open":""}><summary><b>Semana de ${fmtCurta(s.semana)} a ${deIso(s.ate).toLocaleDateString("pt-BR")}</b>
        <span class="pequeno suave">renovada em ${fmtDataLonga(s.feita)}${h?` às ${h}`:""} · ${f.nome} · ${s.itens.length} exercícios${s.entraram.length&&!primeira?` · ${s.entraram.length} entraram`:""}</span></summary>
        ${s.entraram.length&&!primeira?`<div class="chips" style="margin:6px 0"><span class="rot" style="align-self:center">entraram nesta semana</span>${s.entraram.map(id=>`<button type="button" class="chip" data-acao="ver-ex" data-ex="${id}">${esc(porId(id).nome)}</button>`).join("")}</div>`:""}
        <ol class="arq-lista">${s.itens.map(it=>{ const ex = porId(it.id); return ex?`<li><button type="button" data-acao="ver-ex" data-ex="${it.id}"><span class="pos">${it.pos}</span><span class="nm">${esc(ex.nome)}${it.novo&&!primeira?` <span class="delta novo">novo</span>`:""}</span><span class="tm-mini">${it.termometro}</span></button></li>`:""; }).join("")}</ol></details>`; }).join("")}
  </details>`;
}

/* ---- coleta pelo navegador do app Claude (só no app para computador) ---- */
const MOTIVO_SEM_NAV = {
  server_not_connected:"O navegador do Claude só responde com a página aberta no app Claude para computador.",
  server_not_found:"O navegador do Claude não está disponível aqui.",
  not_granted:"O acesso ao navegador não foi liberado para esta página.",
  consent_required:"O acesso ao navegador não foi liberado para esta página.",
  cancelled:"A abertura do YouTube foi recusada.",
  approval_required:"A abertura do YouTube precisa ser aprovada.",
  blocked_by_policy:"A organização bloqueia o navegador para esta página.",
  not_in_manifest:"O navegador não está liberado nesta versão da página.",
  capability_disabled:"O acesso a conectores está desligado.", capability_removed:"O acesso a conectores foi retirado.",
  server_unavailable:"O navegador do Claude não respondeu.", rate_limited:"Muitas chamadas seguidas; a coleta parou."
};
function textoResultado(r){
  if(!r) return "";
  if(typeof r.payload==="string") return r.payload;
  return (r.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
}
async function coletarYouTube(dia){
  RENOV.motivo = "";
  if(typeof window==="undefined" || !window.claude || !window.claude.use){ RENOV.motivo = "Fora do Claude não há navegador para coletar."; return {}; }
  let mcp = null; try{ mcp = await window.claude.use("mcp"); }catch(e){}
  if(!mcp){ RENOV.motivo = "Sem acesso ao navegador do Claude nesta visualização."; return {}; }
  const ids = Object.keys(ALTA_PESQUISA).filter(id=>ALTA_PESQUISA[id].busca && porId(id));
  const out = {};
  for(let k=0; k<ids.length; k++){
    const id = ids[k];
    RENOV.txt = `Renovando: lendo a busca do YouTube ${k+1} de ${ids.length} (${porId(id).nome})…`; atualizarCab();
    try{
      await mcp.callTool(SERV_NAV, "navigate", {url:"https://www.youtube.com/results?search_query="+encodeURIComponent(ALTA_PESQUISA[id].busca)}, {cache:false});
      let yt = null;
      for(let t=0; t<4 && !yt; t++){
        await espera(t ? 1500 : 900);
        yt = lerBuscaYouTube(textoResultado(await mcp.callTool(SERV_NAV, "get_page_text", {max_chars:8000}, {cache:false})), dia);
      }
      if(yt) out[id] = {yt};
    }catch(e){
      const c = e && e.code;
      if(c && c!=="tool_error" && c!=="upstream_error" && c!=="transform_error"){ RENOV.motivo = MOTIVO_SEM_NAV[c] || "O navegador do Claude não pôde ser usado."; break; }
      /* falha numa busca só: segue para a próxima */
    }
  }
  return out;
}

/* ---- banco compartilhado: a coleta feita por quem tem o navegador vale para todos ---- */
async function abrirBanco(){
  if(RENOV.db!==null) return RENOV.db;
  RENOV.db = false;
  if(typeof window==="undefined" || !window.claude || !window.claude.use) return false;
  try{ RENOV.db = (await window.claude.use("db")) || false; }catch(e){ RENOV.db = false; }
  return RENOV.db;
}
async function lerSemanasBanco(){
  const db = await abrirBanco(); if(!db) return false;
  try{ const q = await db.collection("renovacoes").get(); return incorporarSemanas(q.docs.filter(d=>d.exists).map(d=>JSON.parse(JSON.stringify(d.data())))); }
  catch(e){ return false; }
}
async function gravarSemanaBanco(ent){
  if(ent.fonte!=="navegador") return;   /* o recálculo automático cada um refaz igual; só a coleta real vale gravar */
  const db = await abrirBanco(); if(!db) return;
  try{ await db.collection("renovacoes").doc(ent.semana).set(JSON.parse(JSON.stringify(ent))); }catch(e){ /* sem permissão de escrita: fica só neste navegador */ }
}

/* ---- o caso da renovação: chamado ao abrir o app ---- */
async function renovacaoAutomatica(dia, forcar){
  dia = dia || hojeIso();
  if(RENOV.estado==="coletando" || !precisaRenovar(dia)) return null;
  if(!forcar && S && S.ajustes && S.ajustes.renovarAuto===false) return null;
  RENOV.estado = "coletando"; RENOV.txt = "Renovando a semana…"; atualizarCab();
  let coletas = {};
  if(!S || !S.ajustes || S.ajustes.coletarNav!==false){ try{ coletas = await coletarYouTube(dia); }catch(e){ coletas = {}; } }
  else RENOV.motivo = "A leitura do YouTube está desligada nos Ajustes.";
  const ent = renovar(dia, coletas);
  RENOV.estado = "";
  RENOV.txt = ent.fonte==="navegador"
    ? `Renovação de hoje feita pelo app: ${ent.medidos} buscas do YouTube lidas agora; o TikTok mantém o último sinal medido.`
    : `Renovação automática de hoje: termômetro recalculado na data de hoje com o último sinal medido de cada rede.${RENOV.motivo?" "+RENOV.motivo:""}`;
  salvarAltaLocal();
  gravarSemanaBanco(ent);
  renderAtual();
  return ent;
}

async function carregarAltaRemota(){
  let mudou = false;
  prepararDownloads();
  try{ const c = localStorage.getItem(CHAVE_ALTA); if(c && aplicarDadosAlta(JSON.parse(c))){ ALTA_ORIGEM.fonte = "cache"; mudou = true; } }catch(e){}
  if(location.protocol!=="file:"){
    try{
      const r = await fetch("alta.json", {cache:"no-cache"});
      if(r.ok && aplicarDadosAlta(await r.json())){ ALTA_ORIGEM.fonte = "arquivo"; mudou = true; }
    }catch(e){ /* sem o arquivo: fica a pesquisa embutida */ }
  }
  if(await lerSemanasBanco()) mudou = true;
  ALTA_ORIGEM.carregado = new Date();
  if(mudou){ salvarAltaLocal(); renderAtual(); }
  await renovacaoAutomatica();
}

/* ---- arquivos para o usuário: pelo visualizador do Claude quando houver, senão download comum ---- */
const BAIXAR = {ns:null};
async function prepararDownloads(){
  if(typeof window==="undefined" || !window.claude || !window.claude.use) return;
  try{ BAIXAR.ns = (await window.claude.use("downloads")) || null; }catch(e){ BAIXAR.ns = null; }
  if(BAIXAR.ns && typeof tela!=="undefined" && tela==="ajustes") renderAtual();
}
async function baixarArquivo(nome, texto){
  if(BAIXAR.ns){
    try{ const r = await BAIXAR.ns.save({filename:nome, data:texto}); if(r && r.status==="saved") aviso("Arquivo salvo."); return; }
    catch(e){ if(e && e.code==="cancelled") return; if(e && e.code==="unavailable") BAIXAR.ns = null; else { aviso("Não deu para salvar o arquivo. Use Exportar e copie."); return; } }
  }
  try{ const b = new Blob([texto], {type:"application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(b);
    a.download = nome; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 500);
    aviso("Se o download não começar, use Exportar e copie o texto."); }catch(e){ aviso("O navegador bloqueou o download. Use Exportar e copie."); }
}

/* ---- painel nos Ajustes ---- */
function painelRenovacaoAjustes(){
  const u = ultimaRenovacao(), f = FONTES_RENOV[u.fonte] || FONTES_RENOV.pesquisa, h = fmtHora(u.feita);
  const navegador = HISTORICO_ALTA.filter(x=>x.fonte==="navegador").length;
  return `<div class="grade g3" style="gap:8px">
    <div class="leve pilha" style="gap:2px"><span class="rot">última renovação</span><b>${dataLocal(u.feita).toLocaleDateString("pt-BR")}${h?` · ${h}`:""}</b><span class="pequeno suave">${f.nome}</span></div>
    <div class="leve pilha" style="gap:2px"><span class="rot">semanas no arquivo</span><b>${HISTORICO_ALTA.length}</b><span class="pequeno suave">${navegador} com coleta no YouTube</span></div>
    <div class="leve pilha" style="gap:2px"><span class="rot">exercícios acompanhados</span><b>${Object.keys(ALTA_PESQUISA).filter(id=>porId(id)).length}</b><span class="pequeno suave">nenhum sai do acervo</span></div></div>`;
}
function importarSemanas(o){
  const antes = HISTORICO_ALTA.length;
  const mudou = aplicarDadosAlta(o);
  salvarAltaLocal(); renderAtual();
  aviso(mudou ? `Arquivo de semanas somado: ${HISTORICO_ALTA.length - antes >= 0 ? HISTORICO_ALTA.length - antes : 0} semana(s) nova(s), ${HISTORICO_ALTA.length} no total.` : "Essas semanas já estavam aqui.");
}
Object.assign(ACOES_ALTA, {
  "renovar-agora": async ()=>{ const e = await renovacaoAutomatica(null, true); if(e) aviso("Semana renovada."); },
  "exportar-semanas": ()=>{ const el = $("areaDados"); if(!el) return; el.value = JSON.stringify(exportarDadosAlta()); el.select(); aviso("Arquivo de semanas na caixa de “Seus dados”. Copie para levar a outro aparelho."); },
  "baixar-semanas": ()=>baixarArquivo("torquimetro-semanas-"+isoDia(new Date())+".json", JSON.stringify(exportarDadosAlta(), null, 1))
});
