/* =====================================================================
   INTERFACE "EM ALTA" + AUTOSSUGESTÃO
   ===================================================================== */
function destacar(nome, q){
  const nq = semAcento(q||"").trim(); if(!nq) return esc(nome);
  const n = semAcento(nome); const partes = nq.split(/\s+/).filter(p=>p.length>=2);
  const marcas = new Array(nome.length).fill(false);
  partes.forEach(p=>{ let i = n.indexOf(p); while(i>=0){ for(let k=i;k<i+p.length;k++) marcas[k]=true; i = n.indexOf(p, i+1); } });
  let s = "", aberto = false;
  for(let i=0;i<nome.length;i++){ if(marcas[i]&&!aberto){ s+="<mark>"; aberto=true; } if(!marcas[i]&&aberto){ s+="</mark>"; aberto=false; } s+=esc(nome[i]); }
  return s + (aberto?"</mark>":"");
}
const ALTA_UI = {tema:"", ordem:"termometro"};
const SETA = {subindo:"▲", "estável":"▬", esfriando:"▼"};
const COR_ROTULO = {viral:"var(--rosa)", "em alta":"var(--mostarda)", nicho:"var(--azul)", "pouco visto":"var(--tinta-suave)"};
const VEREDITO_UI = {confirma:["✓ a física confirma","ok"], parcial:["≈ confirma em parte","alerta"], nao:["✗ a física não confirma","critico"], neutro:["· promessa sem amplitude","neutro"]};
const dataMes = ym => { if(!ym) return "—"; const [y,m]=ym.split("-").map(Number); return MESES_C[m-1]+"/"+String(y).slice(2); };

function seloAlta(ex){
  const c = classificar(ex);
  if(!c) return emAlta(ex) ? `<span class="selo em-alta">em alta</span>` : "";
  return `<span class="selo termo-selo" style="--c:${COR_ROTULO[c.rotulo]}" title="Termômetro ${c.termometro} de 100, tendência ${c.tendencia}">${SETA[c.tendencia]} ${c.rotulo} · ${c.termometro}</span>`;
}
function barraTermo(c){
  return `<div class="termo" role="img" aria-label="Termômetro ${c.termometro} de 100"><i style="width:${c.termometro}%;background:${COR_ROTULO[c.rotulo]}"></i></div>`;
}
function pips(nivel){ /* 0–1 → três bolinhas */
  if(nivel==null) return `<span class="pips nada" title="não medido">— — —</span>`;
  const n = nivel>=0.8 ? 3 : nivel>=0.5 ? 2 : nivel>0 ? 1 : 0;
  return `<span class="pips">${[0,1,2].map(i=>`<i class="${i<n?"on":""}"></i>`).join("")}</span>`;
}
function presencaRedes(c){
  return `<div class="presenca">
    <span title="${c.n} vídeos e ${c.paginas} páginas de busca encontrados">TikTok ${pips(c.presTT)}</span>
    <span title="${c.yt?c.yt.r+" resultados, "+c.yt.s+" shorts":"não pesquisado para este exercício"}">YouTube ${pips(c.presYT)}</span>
    <span title="O Instagram não deixa buscadores indexarem reels">Instagram ${pips(null)}</span></div>`;
}
function chipVeredito(c){ const [t,k] = VEREDITO_UI[c.veredito.tipo]; return `<span class="selo veredito ${k}" title="${esc(c.veredito.txt)}">${t}</span>`; }
function linksRefs(c){
  return c.refs.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.rede)}${r.autor?" "+esc(r.autor):""} ↗</a>`).join("");
}

/* ---------- cartão do catálogo em alta ---------- */
function cartaoAlta(ex, pos){
  const c = classificar(ex), n = videosDe(ex.id).length;
  return `<article class="cartao"><button type="button" class="cartao-abrir" data-acao="ver-ex" data-ex="${ex.id}">${capaEx(ex)}<div class="miolo">
      <div class="linha entre" style="gap:6px">${pos?`<span class="posicao">#${pos} ${deltaHtml(ex.id, true)}</span>`:""}${seloAlta(ex)}</div>
      <h3>${esc(ex.nome)}</h3>
      ${barraTermo(c)}
      <div class="meta"><span>${esc(ex.grupo)}</span><span>${equipamento(ex)}</span><span>último vídeo ${dataMes(c.ultimo)}</span>${n?`<span><b>▶ ${n}</b> salvo${n>1?"s":""}</span>`:""}</div>
      <p class="pequeno suave corta3" style="margin:0">${esc(c.resumo)}</p>
      <div>${chipVeredito(c)}</div></div></button>
    <div class="links-rede">${linksRefs(c)}</div></article>`;
}

/* ---------- seção da biblioteca ---------- */
function secaoEmAlta(){
  const filtro = ALTA_UI.tema ? (e,c)=>c.temas.includes(ALTA_UI.tema) : null;
  let lista = rankingAlta(filtro);
  if(ALTA_UI.ordem==="recente") lista = lista.slice().sort((a,b)=>(b.c.ultimo||"").localeCompare(a.c.ultimo||""));
  if(ALTA_UI.ordem==="confirma") lista = lista.filter(x=>x.c.veredito.tipo==="confirma");
  if(ALTA_UI.ordem==="nao") lista = lista.filter(x=>x.c.veredito.tipo==="nao"||x.c.veredito.tipo==="parcial");
  const todos = rankingAlta();
  const conta = {}; todos.forEach(x=>conta[x.c.rotulo]=(conta[x.c.rotulo]||0)+1);
  const subindo = todos.filter(x=>x.c.tendencia==="subindo").length;
  const top = lista.slice(0,10), resto = lista.slice(10, 22);
  const tema = ALTA_UI.tema && TEMAS[ALTA_UI.tema];
  return `<section class="secao" id="secAlta">
    <div class="secao-titulo"><h2>Em alta nas redes</h2><button class="link" type="button" data-acao="bib-redes-todos">filtrar a biblioteca →</button></div>
    ${cabecalhoAtualizacao()}
    <p class="suave" style="margin:0;max-width:74ch">Sinais em vigor desde ${new Date(LEVANTAMENTO+"T12:00").toLocaleDateString("pt-BR")}: ${todos.length} exercícios, ${conta.viral||0} virais, ${conta["em alta"]||0} em alta, ${subindo} com vídeos novos no último ano. O veredito compara o que os vídeos prometem com a curva de torque calculada aqui.</p>
    <div class="chips" role="group" aria-label="Tema">${[["","Todos"]].concat(Object.entries(TEMAS).map(([k,t])=>[k,t.nome])).map(([k,n])=>`<button type="button" class="chip" data-acao="alta-tema" data-t="${k}" aria-pressed="${ALTA_UI.tema===k}">${esc(n)}</button>`).join("")}</div>
    <div class="chips" role="group" aria-label="Ordem"><span class="rot" style="align-self:center">mostrar</span>${[["termometro","mais quentes"],["recente","vídeos mais recentes"],["confirma","promessa confirmada"],["nao","promessa contestada"]].map(([k,n])=>`<button type="button" class="chip" data-acao="alta-ordem" data-o="${k}" aria-pressed="${ALTA_UI.ordem===k}">${n}</button>`).join("")}</div>
    ${!ALTA_UI.tema && ALTA_UI.ordem==="termometro" ? mudancasDaSemana() : ""}
    ${tema?`<p class="pequeno" style="margin:0"><b>${esc(tema.nome)}.</b> ${esc(tema.desc)}</p>`:""}
    ${ALTA_UI.tema==="alongado"?debateAlongado():""}
    ${lista.length?`<div class="grade g-12" style="align-items:start">
      <div class="painel"><div class="cab"><h3>Parada</h3><span class="rot">top ${top.length}</span></div><div class="corpo" style="gap:0">
        <ol class="parada">${top.map(({ex,c},i)=>`<li><button type="button" data-acao="ver-ex" data-ex="${ex.id}">
          <span class="pos">${i+1}</span><span class="nm"><b>${esc(ex.nome)} ${deltaHtml(ex.id, true)}</b><span>${esc(ex.grupo)} · ${SETA[c.tendencia]} ${c.tendencia}</span></span>
          <span class="tm" style="--c:${COR_ROTULO[c.rotulo]}">${c.termometro}</span></button></li>`).join("")}</ol></div></div>
      <div class="catalogo">${top.slice(0,4).map(({ex},i)=>cartaoAlta(ex,i+1)).join("")}</div></div>
      ${top.length>4||resto.length?`<div class="catalogo">${top.slice(4).concat(resto).map(({ex},i)=>cartaoAlta(ex,i+5)).join("")}</div>`:""}`
      :`<div class="vazio">Nenhum exercício com esse filtro.</div>`}
    ${arquivoSemanas()}
    <details class="mais"><summary>Como o termômetro é calculado</summary><div class="pequeno" style="margin-top:8px;max-width:76ch">
      <p>Para cada exercício foram feitas buscas restritas ao TikTok e ao YouTube. Do TikTok contam os vídeos encontrados com o nome do exercício e as páginas de busca que o próprio TikTok cria quando muita gente procura o termo. O ID de cada vídeo do TikTok guarda a data de publicação, e daí sai a tendência: <b>subindo</b> quando há vídeo do último ano, <b>estável</b> quando pelo menos 30% são dos últimos dois anos, <b>esfriando</b> no resto.</p>
      <p>A renovação é feita pelo próprio app: na primeira abertura de cada semana (a semana começa na segunda) ele renova sozinho e grava a data. Se o app estiver aberto no Claude para computador, ele abre as buscas do YouTube no navegador do Claude e lê visualizações e idade dos vídeos; sem isso, recalcula o termômetro na data de hoje com o último sinal medido. O TikTok pede verificação a navegadores automatizados, então o sinal do TikTok só muda nas varreduras completas. Cada semana fica guardada com seus exercícios; nenhum sai do acervo. A parada compara a semana atual com a anterior: <b>▲/▼</b> é a mudança de posição, <b>novo</b> é quem entrou.</p>
      <p>Termômetro = 45% presença no TikTok + 30% momento + 25% presença no YouTube (sem YouTube pesquisado, 60% TikTok e 40% momento). Viral a partir de 70, em alta a partir de 58, nicho a partir de 45.</p>
      <p>O Instagram fica de fora da conta porque não deixa buscadores indexarem reels; os atalhos do app abrem a hashtag direto lá. Os números medem presença em buscas, não visualizações.</p></div></details>
  </section>`;
}
function debateAlongado(){
  return `<div class="leve pilha" style="gap:6px"><b>O debate das parciais alongadas</b>
    <p class="pequeno" style="margin:0">É o assunto que move boa parte desta lista. Os vídeos se dividem entre quem recomenda repetições parciais na parte alongada e quem diz que o efeito não é o que parece. A física daqui só responde uma parte: em quais exercícios o torque realmente está no alongado.</p>
    <div class="links-rede" style="padding:0">${DEBATE_ALONGADO.refs.map(([r,u,a,t])=>`<a href="${u}" target="_blank" rel="noopener">${r}${a?" "+a:""}: ${esc(t)} ↗</a>`).join("")}</div></div>`;
}

/* ---------- folha do exercício ---------- */
function blocoNasRedes(ex){
  const c = classificar(ex);
  const alts = alternativasEmAlta(ex, 3);
  if(!c) return alts.length ? `<div class="pilha" style="gap:6px"><h3>Em alta no mesmo grupo</h3><div class="chips">${alts.map(({ex:e,c:cc})=>`<button type="button" class="chip" data-acao="ver-ex" data-ex="${e.id}">${SETA[cc.tendencia]} ${esc(e.nome)} · ${cc.termometro}</button>`).join("")}</div></div>` : "";
  return `<div class="pilha nas-redes" style="gap:10px"><div class="linha entre"><h3>Nas redes</h3><span class="linha" style="gap:6px">${deltaHtml(ex.id)}${seloAlta(ex)}</span></div>
    ${barraTermo(c)}
    <div class="grade g2" style="gap:12px">
      <div class="pilha" style="gap:6px">${presencaRedes(c)}
        <p class="pequeno" style="margin:0">${c.n} vídeo${c.n===1?"":"s"} no TikTok, de ${dataMes((ALTA_PESQUISA[ex.id].tt.d||[])[0])} a ${dataMes(c.ultimo)}; ${c.ult12} no último ano.${c.yt?` ${c.yt.r} resultados no YouTube, ${c.yt.s} shorts.`:""}</p>
        <p class="pequeno suave" style="margin:0">${esc(c.resumo)}</p></div>
      <div class="pilha" style="gap:6px">${chipVeredito(c)}<p class="pequeno" style="margin:0">${esc(c.veredito.txt)}</p>
        ${c.alerta?`<div class="aviso pequeno">${esc(c.alerta)}</div>`:""}</div>
    </div>
    <div class="linha" style="gap:6px"><span class="rot">vídeos encontrados</span><span class="links-rede" style="padding:0">${linksRefs(c)}</span></div>
    ${alts.length?`<div class="linha" style="gap:6px"><span class="rot">também em alta</span>${alts.map(({ex:e,c:cc})=>`<button type="button" class="chip" data-acao="ver-ex" data-ex="${e.id}">${SETA[cc.tendencia]} ${esc(e.nome)} · ${cc.termometro}</button>`).join("")}</div>`:""}
  </div>`;
}

/* ---------- sugestões contextuais ---------- */
function cartaoSugestao(s, rotinaId, rotuloAcao){
  return `<div class="sugestao">
    <button type="button" class="sug-nome" data-acao="ver-ex" data-ex="${s.ex.id}">${miniCurva(s.ex,64,22)}<span><b>${esc(s.ex.nome)}</b><span class="pequeno suave">${esc(s.motivo)}</span></span></button>
    <div class="linha" style="gap:6px">${seloAlta(s.ex)}${rotinaId?`<button class="btn mini" type="button" data-acao="add-sugestao" data-rotina="${rotinaId}" data-ex="${s.ex.id}">${rotuloAcao||"adicionar"}</button>`:""}</div></div>`;
}
function secaoSugestoesHoje(rid){
  if(!S.ajustes.priorizarAlta) return "";
  const R0 = S.rotinas[rid]; if(!R0) return "";
  const sug = sugestoesEmAlta(R0.itens.map(i=>i.exId), 3);
  if(!sug.length) return "";
  return `<section class="secao"><div class="secao-titulo"><h2>Em alta para o treino de hoje</h2><a href="#biblioteca" data-ir="biblioteca">ver a parada →</a></div>
    <div class="painel"><div class="corpo">${sug.map(s=>cartaoSugestao(s, rid, "adicionar à rotina")).join("")}
      <p class="pequeno suave" style="margin:0">Escolhidas entre os exercícios em alta do mesmo grupo, pela parte da amplitude que a rotina de hoje menos carrega.</p></div></div></section>`;
}
function linhaSugestaoRotina(r){
  if(!S.ajustes.priorizarAlta || !r.itens.length) return "";
  const s = sugestoesEmAlta(r.itens.map(i=>i.exId), 1)[0];
  return s ? `<div class="sug-rotina"><span class="rot">sugestão das redes</span>${cartaoSugestao(s, r.id)}</div>` : "";
}

/* ---------- autossugestão (combobox) ---------- */
const AUTO = {alvo:null, itens:[], ativo:-1, modo:""};
function itemSugestao(it, i, q){
  const id = `sug-${i}`;
  if(it.tipo==="ex"){ const c = classificar(it.ex);
    return `<li role="option" id="${id}" class="${i===AUTO.ativo?"ativo":""}" data-i="${i}" aria-selected="${i===AUTO.ativo}">
      ${letraEx(it.ex)}<span class="t"><b>${destacar(it.ex.nome, q)}</b><span>${esc(it.ex.grupo)}${it.motivo?" · "+esc(it.motivo):""}</span></span>${c?`<span class="tm" style="--c:${COR_ROTULO[c.rotulo]}">${SETA[c.tendencia]} ${c.termometro}</span>`:seloRegiao(it.ex)}</li>`; }
  return `<li role="option" id="${id}" class="${i===AUTO.ativo?"ativo":""} extra" data-i="${i}" aria-selected="${i===AUTO.ativo}">
    <span class="ic" aria-hidden="true">${it.tipo==="tema"?"#":"▦"}</span><span class="t"><b>${esc(it.nome)}</b><span>${esc(it.motivo||"")}</span></span></li>`;
}
function abrirSugestoes(input){
  const caixa = document.getElementById(input.getAttribute("aria-controls")); if(!caixa) return;
  AUTO.alvo = input; AUTO.modo = input.dataset.sugere;
  AUTO.itens = sugerir(input.value, {limite:8, semGrupos: AUTO.modo==="seletor", semTemas: AUTO.modo==="seletor"});
  if(!input.value.trim() && AUTO.modo==="bib") AUTO.itens.unshift({tipo:"cab"});
  AUTO.ativo = -1;
  const q = input.value;
  const itens = AUTO.itens.filter(x=>x.tipo!=="cab");
  AUTO.itens = itens;
  caixa.innerHTML = itens.length ? `${!q.trim()?`<div class="sug-cab">Em alta agora</div>`:""}<ul>${itens.map((it,i)=>itemSugestao(it,i,q)).join("")}</ul>` : `<div class="sug-cab">Nada parecido com “${esc(q)}”. Tente o nome em inglês ou espanhol.</div>`;
  caixa.hidden = false; input.setAttribute("aria-expanded","true");
}
function fecharSugestoes(){
  if(!AUTO.alvo) return;
  const caixa = document.getElementById(AUTO.alvo.getAttribute("aria-controls"));
  if(caixa){ caixa.hidden = true; caixa.innerHTML = ""; }
  AUTO.alvo.setAttribute("aria-expanded","false"); AUTO.alvo.removeAttribute("aria-activedescendant");
  AUTO.alvo = null; AUTO.itens = []; AUTO.ativo = -1;
}
function moverSugestao(d){
  if(!AUTO.itens.length) return;
  AUTO.ativo = (AUTO.ativo + d + AUTO.itens.length) % AUTO.itens.length;
  const caixa = document.getElementById(AUTO.alvo.getAttribute("aria-controls"));
  caixa.querySelectorAll("li").forEach((li,i)=>{ li.classList.toggle("ativo", i===AUTO.ativo); li.setAttribute("aria-selected", i===AUTO.ativo); });
  AUTO.alvo.setAttribute("aria-activedescendant", "sug-"+AUTO.ativo);
  const li = caixa.querySelector("li.ativo"); li && li.scrollIntoView({block:"nearest"});
}
function escolherSugestao(i){
  const it = AUTO.itens[i]; const modo = AUTO.modo; fecharSugestoes(); if(!it) return;
  if(modo==="bib"){
    if(it.tipo==="ex") abrirExercicio(it.ex.id);
    else if(it.tipo==="grupo"){ BIB.grupo = it.id; BIB.busca = ""; BIB.limite = 24; renderBiblioteca(); const l=$("listaBib"); l && l.scrollIntoView({behavior:"smooth", block:"start"}); }
    else if(it.tipo==="tema"){ ALTA_UI.tema = it.id; BIB.busca = ""; renderBiblioteca(); const s=$("secAlta"); s && s.scrollIntoView({behavior:"smooth", block:"start"}); }
  }
}
document.addEventListener("focusin", e=>{ const el = e.target.closest && e.target.closest("[data-sugere]"); if(el) abrirSugestoes(el); });
document.addEventListener("input", e=>{ const el = e.target.closest && e.target.closest("[data-sugere]"); if(el) abrirSugestoes(el); });
document.addEventListener("keydown", e=>{
  const el = e.target.closest && e.target.closest("[data-sugere]"); if(!el || AUTO.alvo!==el) return;
  if(e.key==="ArrowDown"){ e.preventDefault(); moverSugestao(1); }
  else if(e.key==="ArrowUp"){ e.preventDefault(); moverSugestao(-1); }
  else if(e.key==="Enter"){ if(AUTO.ativo>=0){ e.preventDefault(); escolherSugestao(AUTO.ativo); } else fecharSugestoes(); }
  else if(e.key==="Escape"){ e.stopPropagation(); fecharSugestoes(); }
});
document.addEventListener("mousedown", e=>{
  const li = e.target.closest(".sugestoes li[data-i]");
  if(li){ e.preventDefault(); escolherSugestao(+li.dataset.i); return; }
  if(AUTO.alvo && !e.target.closest(".campo-sugere")) fecharSugestoes();
});
function campoBuscaBib(){
  return `<div class="campo-sugere"><input type="search" id="buscaBib" placeholder="Buscar: nome em português, inglês ou espanhol" value="${esc(BIB.busca)}" data-campo="bib-busca" data-sugere="bib"
    role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="sugBib" aria-label="Buscar exercício" autocomplete="off">
    <div class="sugestoes" id="sugBib" role="listbox" hidden></div></div>`;
}

/* ---------- seletor de exercícios com ranking e sugestões ---------- */
function listaSeletorAlta(){
  const q = seletorBusca.trim();
  const filtroG = seletorGrupo ? (e=>e.grupo===seletorGrupo) : null;
  let topo = "";
  if(!q && S.ativo && S.ajustes.priorizarAlta){
    const sug = sugestoesEmAlta(S.ativo.itens.map(i=>i.exId), 3).filter(s=>!filtroG||filtroG(s.ex));
    if(sug.length) topo = `<div class="sug-cab">Em alta para este treino</div>${sug.map(s=>`<button type="button" class="item-ex" data-acao="seletor-escolher" data-ex="${s.ex.id}">${letraEx(s.ex)}<span class="t"><b>${esc(s.ex.nome)}</b><span>${esc(s.motivo)}</span></span><span class="dir">${seloAlta(s.ex)}</span></button>`).join("")}<div class="sug-cab">Todos</div>`;
  }
  const lista = q ? sugerir(q, {limite:40, filtro:filtroG, semGrupos:true, semTemas:true}).filter(x=>x.tipo==="ex").map(x=>x.ex)
                  : lib().filter(e=>!filtroG||filtroG(e)).sort((a,b)=>((classificar(b)||{}).termometro||0)-((classificar(a)||{}).termometro||0) || a.nome.localeCompare(b.nome)).slice(0,80);
  return topo + (lista.map(ex=>`<button type="button" class="item-ex" data-acao="seletor-escolher" data-ex="${ex.id}">${letraEx(ex)}<span class="t"><b>${destacar(ex.nome, q)}</b><span>${esc(ex.grupo)} · ${equipamento(ex)}</span></span><span class="dir">${seloAlta(ex)||miniCurva(ex,70,24)}${seloRegiao(ex)}</span></button>`).join("") || `<div class="vazio">Nada encontrado. Tente o nome em inglês ou espanhol.</div>`);
}

const ACOES_ALTA = {
  "alta-tema": el=>{ ALTA_UI.tema = el.dataset.t; renderBiblioteca(); const s=$("secAlta"); s && s.scrollIntoView({block:"start"}); },
  "alta-ordem": el=>{ ALTA_UI.ordem = el.dataset.o; renderBiblioteca(); const s=$("secAlta"); s && s.scrollIntoView({block:"start"}); }
};

/* ---------- atualização semanal: carregar alta.json publicado ao lado da página ---------- */
const CHAVE_ALTA = "torquimetro-gym.alta";
function proximaSegunda(iso){ const d = deIso(iso); const n = somaDias(d, ((8 - d.getDay()) % 7) || 7); return n; }
function deltaHtml(id, compacto){
  const v = variacaoAlta(id); if(!v) return "";
  if(v.novo) return `<span class="delta novo" title="Entrou na parada nesta semana">novo</span>`;
  if(!v.dpos && !v.dt) return compacto ? "" : `<span class="delta igual" title="Sem mudança desde a semana anterior">=</span>`;
  const sobe = v.dpos>0 || (v.dpos===0 && v.dt>0);
  const txt = v.dpos ? `${sobe?"▲":"▼"}${Math.abs(v.dpos)}` : `${v.dt>0?"+":""}${v.dt}`;
  return `<span class="delta ${sobe?"sobe":"cai"}" title="${v.dpos?`${Math.abs(v.dpos)} posição(ões) ${sobe?"acima":"abaixo"}; `:""}termômetro ${v.dt>0?"+":""}${v.dt} desde a semana anterior">${txt}</span>`;
}
function mudancasDaSemana(){
  const r = resumoSemana();
  if(!r) return `<p class="pequeno suave" style="margin:0">Primeira medição. A partir da próxima atualização, a parada mostra quem subiu, caiu ou entrou.</p>`;
  const nome = id => esc((porId(id)||{nome:id}).nome);
  const lista = (ids, cls) => ids.slice(0,4).map(id=>`<button type="button" class="chip" data-acao="ver-ex" data-ex="${id}">${nome(id)} ${deltaHtml(id)}</button>`).join("") || `<span class="pequeno suave">nenhum</span>`;
  return `<div class="grade g3 mudancas">
    <div class="leve pilha" style="gap:6px"><span class="rot">subiram desde ${deIso(r.antes).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</span><div class="chips">${lista(r.subiram)}</div></div>
    <div class="leve pilha" style="gap:6px"><span class="rot">caíram</span><div class="chips">${lista(r.cairam)}</div></div>
    <div class="leve pilha" style="gap:6px"><span class="rot">entraram${r.sairam.length?" e saíram":""}</span><div class="chips">${lista(r.novos)}${r.sairam.length?r.sairam.map(id=>`<span class="selo">${nome(id)} saiu</span>`).join(""):""}</div></div></div>`;
}
