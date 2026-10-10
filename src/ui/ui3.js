/* =====================================================================
   TREINO GUIADO, DESCANSO, AÇÕES E INICIALIZAÇÃO
   ===================================================================== */
const ITEM_PADRAO = {series:3, repsMin:8, repsMax:12, progressao:"dupla", incremento:2.5, descanso:null, superset:""};
function novoItemAtivo(exId, ri, antesDe){
  const ex = porId(exId);
  ri = Object.assign({}, ITEM_PADRAO, ehTempo(ex)?{repsMin:30,repsMax:60,incremento:0}:{}, ri||{});
  const alvo = alvoProgressao(ri, historicoEx(S, exId, antesDe), ex);
  const kgIni = alvo.kg!=null ? alvo.kg : (ex.tipo==="corporal" || ehTempo(ex) ? 0 : "");
  return {exId, prog:{series:ri.series, repsMin:ri.repsMin, repsMax:ri.repsMax, progressao:ri.progressao, incremento:ri.incremento, descanso:ri.descanso, superset:(ri.superset||"").toUpperCase()},
    alvo, series:Array.from({length:Math.max(1,+ri.series||1)}, ()=>({tipo:"normal", kg:kgIni, reps:alvo.reps, rir:null, feito:false}))};
}
function iniciarTreino(rotinaId){
  const R0 = rotinaId ? S.rotinas[rotinaId] : null;
  S.ativo = {id:uid("t"), nome:R0?R0.nome:"Treino livre", rotinaId:rotinaId||null, inicio:Date.now(), modo:"ao-vivo",
             itens:R0 ? R0.itens.filter(i=>porId(i.exId)).map(i=>novoItemAtivo(i.exId, i)) : [], descanso:null};
  salvar(); pedirTelaAcesa(); abrirTreino();
}
function iniciarManual(dataISO){
  S.ativo = {id:uid("t"), nome:"Treino registrado depois", rotinaId:null, inicio:deIso(dataISO).setHours(12,0,0,0), dataISO:dataISO+"T12:00",
             modo:"manual", itens:[], descanso:null};
  salvar(); abrirTreino();
}
function iniciarEdicao(id){
  const t = S.treinos.find(x=>x.id===id); if(!t) return;
  const ri = exId => { const r=S.rotinas[t.rotinaId]; return r && r.itens.find(i=>i.exId===exId); };
  S.ativo = {id:t.id, editando:t.id, nome:t.nome, rotinaId:t.rotinaId, inicio:t.inicio, fim:t.fim, dataISO:t.data, modo:"edicao", origem:t.origem, descanso:null,
    itens:t.itens.map(it=>({exId:it.exId, prog:Object.assign({}, ITEM_PADRAO, ri(it.exId)||{}), alvo:null, series:it.series.map(s=>({...s, feito:true}))}))};
  salvar(); fecharFolha(); abrirTreino();
}
function abrirTreino(){ $("telaTreino").hidden = false; document.body.style.overflow="hidden"; renderTreino(); atualizarPilula(); }
function minimizarTreino(){ $("telaTreino").hidden = true; document.body.style.overflow=""; atualizarPilula(); renderAtual(); }
function atualizarPilula(){ $("pilulaTreino").hidden = !S.ativo || !$("telaTreino").hidden; }

function cronoTxt(ms){ const s=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+pad2(m):m)+":"+pad2(x); }
function opcoesEsforco(rir){
  const modo = S.ajustes.esforco;
  if(modo==="RPE"){ const v = rir==null||rir==="" ? "" : String(10-rir);
    return `<option value="">RPE</option>`+["10","9.5","9","8.5","8","7.5","7","6"].map(x=>`<option value="${x}"${x===v?" selected":""}>${x.replace(".",",")}</option>`).join(""); }
  const v = rir==null||rir==="" ? "" : String(Math.min(5,Math.round(rir)));
  return `<option value="">RIR</option>`+["0","1","2","3","4","5"].map(x=>`<option value="${x}"${x===v?" selected":""}>${x==="5"?"5+":x}</option>`).join("");
}
function cartaoItem(it, i, a){
  const ex = porId(it.exId); if(!ex) return "";
  const comEsf = S.ajustes.esforco!=="off";
  const tempo = ehTempo(ex);
  const antesDe = a.modo==="ao-vivo" ? null : (a.dataISO||"").slice(0,10);
  const ult = historicoEx(S, it.exId, antesDe).find(h=>h.treinoId!==a.editando);
  const best = melhorMarca(S, it.exId, antesDe);
  const sv = it.series.filter(s=>s.feito && s.tipo!=="aquec");
  const J = sv.reduce((acc,s)=>acc+trabalhoSerie(ex,s.kg,s.reps),0);
  const e1Sessao = tempo ? 0 : Math.max(0,...sv.map(s=>e1rm(cargaTotal(ex,s.kg),s.reps,s.rir)));
  const prox = a.itens[i+1];
  const emSuperset = it.prog.superset && ((prox && prox.prog.superset===it.prog.superset) || (a.itens[i-1] && a.itens[i-1].prog.superset===it.prog.superset));
  const faixa = it.prog.repsMin===it.prog.repsMax ? it.prog.repsMin : it.prog.repsMin+"–"+it.prog.repsMax;
  return `<article class="cartao-ex${emSuperset?" superset":""}" id="item-${i}">
    <div class="cab-ex"><div style="min-width:0">
      ${emSuperset?`<span class="rot" style="color:var(--azul)">superset ${esc(it.prog.superset)}</span>`:""}
      <h3 data-acao="ver-ex" data-ex="${ex.id}" tabindex="0">${esc(ex.nome)}</h3>
      <div class="meta">${letraEx(ex)}${seloRegiao(ex)}${miniCurva(ex,80,26)}${fichaMusc(ex,true)}</div>
      <input class="nota-ex" type="text" maxlength="120" value="${esc((S.notas||{})[ex.id]||"")}" placeholder="nota fixa: banco 3, pino 5, pegada…" data-campo="nota-ex" data-ex="${ex.id}" aria-label="Nota fixa de ${esc(ex.nome)}"></div>
      <div class="linha" style="gap:4px;justify-content:flex-end">
        ${usaAnilhas(ex)?`<button class="btn mini" type="button" data-acao="anilhas" data-i="${i}" title="Quais anilhas pôr na barra">anilhas</button>`:""}
        <button class="btn mini fantasma" type="button" data-acao="ativo-mover" data-i="${i}" data-d="-1" aria-label="Subir">↑</button>
        <button class="btn mini fantasma" type="button" data-acao="ativo-mover" data-i="${i}" data-d="1" aria-label="Descer">↓</button>
        <button class="btn mini fantasma perigo" type="button" data-acao="ativo-remover" data-i="${i}" aria-label="Remover exercício">✕</button></div></div>
    ${it.alvo?`<div class="alvo ${it.alvo.tipo}"><b class="mono">${it.prog.series} × ${faixa}${tempo?" s":""}${it.alvo.kg!=null&&!tempo?" · "+nf(it.alvo.kg,2)+" kg":""}</b> · ${esc(it.alvo.porque)}</div>`:""}
    ${ult?`<p class="pequeno suave" style="margin:6px 12px 0">Última vez (${dataCurta(ult.data)}): <span class="mono">${ult.series.map(s=>`${ex.tipo==="corporal"&&!s.kg?"":nf(s.kg,2)+"×"}${s.reps}${tempo?"s":""}`).join("  ")}</span></p>`:""}
    <div class="series">
      <div class="serie cab-s${comEsf?"":" sem-esforco"}"><span>série</span><span>${ex.tipo==="corporal"?"kg extra":"kg"}</span><span>${tempo?"segundos":"reps"}</span>${comEsf?`<span>${S.ajustes.esforco}</span>`:""}<span></span></div>
      ${(()=>{ let n=0; return it.series.map((s,j)=>{ const rot = s.tipo==="aquec" ? "aq" : String(++n);
        return `<div class="serie${comEsf?"":" sem-esforco"}${s.feito?" feita":""}">
          <button type="button" class="tipo${s.tipo==="aquec"?" aquec":""}" data-acao="serie-tipo" data-i="${i}" data-s="${j}" title="Alternar entre série válida e aquecimento" aria-label="Série ${rot}, toque para alternar aquecimento">${rot}</button>
          <input type="number" inputmode="decimal" step="0.25" min="0" value="${s.kg}" placeholder="${ex.tipo==="corporal"?"0":"kg"}" data-campo="serie" data-i="${i}" data-s="${j}" data-k="kg" aria-label="Carga da série ${rot}">
          <input type="number" inputmode="numeric" step="1" min="0" value="${s.reps}" data-campo="serie" data-i="${i}" data-s="${j}" data-k="reps" aria-label="${tempo?"Segundos":"Repetições"} da série ${rot}">
          ${comEsf?`<select data-campo="serie" data-i="${i}" data-s="${j}" data-k="rir" aria-label="Esforço da série ${rot}">${opcoesEsforco(s.rir)}</select>`:""}
          <button type="button" class="ok" data-acao="serie-ok" data-i="${i}" data-s="${j}" aria-pressed="${s.feito}" aria-label="Marcar série ${rot} como feita">✓</button>
          ${s.pr?`<span class="pr-tag"><span class="selo pr">★ recorde</span> 1RM estimado ${nf(e1rm(cargaTotal(ex,s.kg),s.reps,s.rir),1)} kg</span>`:""}
        </div>`; }).join(""); })()}
    </div>
    <div class="linha" style="padding:2px 12px 0"><button class="btn mini" type="button" data-acao="serie-add" data-i="${i}">+ série</button>
      ${tempo?"":`<button class="btn mini fantasma" type="button" data-acao="serie-aquec" data-i="${i}" title="Monta a rampa de aquecimento até a carga da primeira série">+ rampa de aquecimento</button>`}
      ${it.series.length>1?`<button class="btn mini fantasma" type="button" data-acao="serie-remover" data-i="${i}">− última</button>`:""}</div>
    <div class="rodape-ex"><span>${tempo?"isometria: sem trabalho, conta o tempo":"trabalho nesta sessão: "+fmtJ(J)}</span>
      ${tempo?"":`<span>1RM est. hoje ${e1Sessao?nf(e1Sessao,1):"—"} · recorde ${best.e1rm?nf(best.e1rm,1):"—"} kg</span>`}</div>
  </article>`;
}
function renderTreino(){
  const a = S.ativo; if(!a){ $("telaTreino").hidden = true; return; }
  const y = $("telaTreino").scrollTop;
  const r = resumoTreino({itens:a.itens.map(it=>({exId:it.exId, series:it.series}))});
  const total = a.itens.reduce((n,it)=>n+it.series.length,0), feitas = a.itens.reduce((n,it)=>n+it.series.filter(s=>s.feito).length,0);
  $("telaTreino").innerHTML = `
    <div class="treino-topo"><div class="in">
      <button class="btn mini" type="button" data-acao="minimizar-treino" aria-label="Minimizar treino">‹</button>
      <h2>${esc(a.nome)}</h2>
      ${a.modo==="ao-vivo"?`<span class="crono" id="crono">${cronoTxt(Date.now()-a.inicio)}</span>`:`<span class="crono">${a.modo==="edicao"?"editando":"registro"}</span>`}
      <button class="btn mini" type="button" data-acao="finalizar" style="background:var(--rosa);color:var(--sobre-acento);border-color:var(--rosa)">${a.modo==="ao-vivo"?"Finalizar":"Salvar"}</button></div></div>
    <div class="treino-corpo">
      ${a.modo!=="ao-vivo"?`<div class="campos"><label class="campo">Data<input type="date" value="${(a.dataISO||"").slice(0,10)}" data-campo="ativo-data"></label><label class="campo">Nome<input type="text" value="${esc(a.nome)}" data-campo="ativo-nome"></label></div>`:""}
      <div class="linha entre pequeno mono"><span>${feitas} de ${total} séries · ${fmtT(r.volume)} · ${fmtJ(r.J)}</span>${r.J?`<span style="flex-basis:220px">${tresFatias(r.regioes)}</span>`:""}</div>
      ${a.itens.map((it,i)=>cartaoItem(it,i,a)).join("") || `<div class="vazio">Treino vazio. Adicione o primeiro exercício.</div>`}
      <div class="linha"><button class="btn primario" type="button" data-acao="ativo-add">+ exercício</button>
        <button class="btn perigo" type="button" data-acao="descartar">${a.modo==="edicao"?"Cancelar edição":"Descartar treino"}</button></div>
    </div>`;
  $("telaTreino").scrollTop = y;
}

/* ---------- descanso ---------- */
let actx = null, alarmeDado = false;
function bip(){
  if(!S.ajustes.som) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    [0,0.28,0.56].forEach(t=>{ const o=actx.createOscillator(), g=actx.createGain(); o.frequency.value = t>0.5?1175:880;
      g.gain.setValueAtTime(0.0001, actx.currentTime+t); g.gain.exponentialRampToValueAtTime(0.35, actx.currentTime+t+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime+t+0.2); o.connect(g).connect(actx.destination); o.start(actx.currentTime+t); o.stop(actx.currentTime+t+0.22); });
  }catch(e){}
}
function iniciarDescanso(seg, proximo){
  if(!S.ativo || S.ativo.modo!=="ao-vivo" || !seg) return;
  S.ativo.descanso = {fim: Date.now()+seg*1000, total: seg, proximo: proximo||""};
  alarmeDado = false; desenharDescanso();
}
function desenharDescanso(){
  const d = S.ativo && S.ativo.descanso, el = $("descanso");
  if(!d){ el.hidden = true; return; }
  const resta = d.fim - Date.now();
  if(resta <= 0 && !alarmeDado){
    alarmeDado = true; bip(); try{ navigator.vibrate && navigator.vibrate([200,100,200]); }catch(e){}
    if(S.ajustes.piscar){ document.body.classList.remove("piscar"); void document.body.offsetWidth; document.body.classList.add("piscar"); }
  }
  if(resta < -15000){ S.ativo.descanso = null; el.hidden = true; salvar(); return; }
  el.hidden = false;
  const pct = Math.max(0, Math.min(100, resta/(d.total*1000)*100));
  el.innerHTML = `<div class="in"><span class="tempo">${resta>0?cronoTxt(resta):"já!"}</span>
    <div style="flex:1;min-width:0"><div class="rot">${resta>0?"descanso":"hora da próxima série"}${d.proximo?" · "+esc(d.proximo):""}</div><div class="barra"><i style="width:${pct}%"></i></div></div>
    <button class="btn" type="button" data-acao="desc-ajuste" data-d="-15">−15</button><button class="btn" type="button" data-acao="desc-ajuste" data-d="15">+15</button><button class="btn" type="button" data-acao="desc-pular">pular</button></div>`;
}
let telaAcesa = null;
async function pedirTelaAcesa(){ try{ if(navigator.wakeLock && S.ativo && S.ativo.modo==="ao-vivo") telaAcesa = await navigator.wakeLock.request("screen"); }catch(e){ telaAcesa = null; } }
function soltarTelaAcesa(){ try{ telaAcesa && telaAcesa.release(); }catch(e){} telaAcesa = null; }
document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="visible" && S && S.ativo) pedirTelaAcesa(); });

/* ---------- finalizar ---------- */
function finalizarTreino(forcar){
  const a = S.ativo; if(!a) return;
  const pend = a.itens.reduce((n,it)=>n+it.series.filter(s=>!s.feito).length,0);
  const feitas = a.itens.reduce((n,it)=>n+it.series.filter(s=>s.feito).length,0);
  if(!feitas){ confirmar("Nenhuma série marcada", "Este treino não tem nenhuma série com ✓. Quer descartá-lo?", "Descartar", ()=>{ descartarTreino(true); }, true); return; }
  if(pend && !forcar){ confirmar("Finalizar treino", `${pend} série(s) sem ✓ serão deixadas de fora. As ${feitas} marcadas ficam salvas.`, "Finalizar assim", ()=>finalizarTreino(true)); return; }
  const fim = a.modo==="ao-vivo" ? Date.now() : (a.fim||null);
  const ini = new Date(a.inicio);
  const t = {id:a.editando||a.id, data: a.dataISO || (isoDia(ini)+"T"+pad2(ini.getHours())+":"+pad2(ini.getMinutes())), nome:a.nome, rotinaId:a.rotinaId,
    inicio:a.inicio, fim, origem:a.origem,
    itens:a.itens.map(it=>({exId:it.exId, series:it.series.filter(s=>s.feito).map(s=>({tipo:s.tipo, kg:+s.kg||0, reps:+s.reps||0, rir:s.rir==null||s.rir===""?null:+s.rir, feito:true, pr:!!s.pr}))})).filter(it=>it.series.length)};
  if(a.editando) S.treinos = S.treinos.filter(x=>x.id!==a.editando);
  S.treinos.push(t); S.treinos.sort((x,y)=>x.data<y.data?-1:1);
  S.ativo = null; salvar(); soltarTelaAcesa();
  $("descanso").hidden = true; $("telaTreino").hidden = true; document.body.style.overflow = "";
  atualizarPilula(); renderAtual();
  abrirResumo(t, !a.editando && a.modo==="ao-vivo");
  nuvemDepoisDeMudar();
}
function descartarTreino(sem){
  const fazer = () => { S.ativo = null; salvar(); soltarTelaAcesa(); $("descanso").hidden = true; $("telaTreino").hidden = true; document.body.style.overflow=""; atualizarPilula(); fecharFolha(); renderAtual(); aviso("Treino descartado."); };
  if(sem) return fazer();
  confirmar(S.ativo.modo==="edicao"?"Cancelar edição":"Descartar treino", S.ativo.modo==="edicao"?"O treino salvo continua como estava.":"As séries deste treino serão apagadas.", S.ativo.modo==="edicao"?"Cancelar edição":"Descartar", fazer, true);
}
function abrirResumo(t, comemora){
  const r = resumoTreino(t);
  const prs = []; t.itens.forEach(it=>it.series.forEach(s=>{ if(s.pr) prs.push({ex:porId(it.exId), s}); }));
  const maxS = Math.max(1, ...Object.values(r.musc).map(v=>v.series));
  const dom = r.regioes.indexOf(Math.max(...r.regioes));
  abrirFolha("Treino salvo", `
    <h2>${esc(t.nome)}</h2>
    <div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">
      ${r.duracaoMin?`<div class="kpi"><div class="rot">duração</div><span class="v">${r.duracaoMin}</span> <span class="u">min</span></div>`:""}
      <div class="kpi"><div class="rot">séries</div><span class="v">${r.series}</span></div>
      <div class="kpi"><div class="rot">volume</div><span class="v">${nf(r.volume)}</span> <span class="u">kg</span></div>
      <div class="kpi"><div class="rot">trabalho mecânico</div><span class="v">${nfFix(r.J/1000,1)}</span> <span class="u">kJ</span></div>
    </div>
    ${r.J?`<div class="pilha" style="gap:4px"><span class="rot">onde caiu a tensão</span>${tresFatias(r.regioes)}${legendaFatias}<p class="pequeno">A maior parte do trabalho de hoje foi com os músculos ${["alongados","na faixa média","encurtados"][dom]}.</p></div>`:""}
    ${prs.length?`<div class="pilha" style="gap:4px"><span class="rot">recordes</span>${prs.map(p=>`<div class="linha pequeno"><span class="selo pr">★</span><b>${esc(p.ex.nome)}</b><span class="mono">${nf(p.s.kg,2)} × ${p.s.reps} → 1RM est. ${nf(e1rm(cargaTotal(p.ex,p.s.kg),p.s.reps,p.s.rir),1)} kg</span></div>`).join("")}</div>`:""}
    <div class="pilha" style="gap:4px"><span class="rot">músculos trabalhados</span>${mapaCorpo(m=>r.musc[m]?misturar("var(--rosa)",25+75*r.musc[m].series/maxS):"var(--papel2)",{dica:m=>r.musc[m]?nf(r.musc[m].series,1)+" séries":"—"})}</div>
    <div class="linha"><button class="btn primario" type="button" data-acao="fechar-folha">Fechar</button><button class="btn" type="button" data-acao="ver-treino" data-id="${t.id}">Ver detalhes</button><button class="btn" type="button" data-acao="cartao-treino" data-id="${t.id}">Imagem para compartilhar</button></div>`);
  if(comemora){ aviso(prs.length?`Treino salvo com ${prs.length} recorde(s).`:"Treino salvo.", true); }
}
function abrirAnilhas(kg){
  const A = S.ajustes, res = calcularAnilhas(kg, A.barra, A.anilhas);
  const corPl = {25:"#c8322b",20:"#2b7fc4",15:"#d6a21c",10:"#2f8a5f",5:"#6b6457",2.5:"#4a4437",1.25:"#8a8170"};
  const placa = p => `<span class="pl" style="height:${Math.round(26+p*1.6)}px;width:${p>=10?16:11}px;background:${corPl[p]||"#4a4437"}">${String(p).replace(".",",")}</span>`;
  abrirFolha("Anilhas na barra", `
    <label class="campo" style="max-width:200px">Carga total (kg)<input type="number" value="${kg||""}" step="0.5" min="0" data-campo="anilhas-alvo"></label>
    ${!kg?`<p class="suave">Digite a carga total.</p>`:res.lado.length||res.ok?`
    <div class="placas" aria-hidden="true"><span class="bar"></span>${res.lado.slice().reverse().map(placa).join("")}<span class="bar" style="width:14px;height:22px;background:var(--linha)"></span>${res.lado.map(placa).join("")}<span class="bar"></span></div>
    <p><b>Por lado:</b> <span class="mono">${res.lado.length?res.lado.map(p=>nf(p,2)).join(" + ")+" kg":"nada, só a barra"}</span></p>
    <p class="pequeno">Barra de ${nf(A.barra,1)} kg. ${res.ok?"Fecha exatamente.":`Com as anilhas cadastradas chega a ${nf(res.total,2)} kg; faltam ${nf(res.sobra,2)} kg.`}</p>`
    :`<p>${res.motivo?"A carga está abaixo do peso da barra ("+nf(A.barra,1)+" kg).":"Não dá para montar com as anilhas cadastradas."}</p>`}
    <p class="pequeno suave">Anilhas e barra se ajustam em Ajustes.</p>`);
}

/* ---------- seletor de exercícios (folha) ---------- */
let seletorCb = null, seletorBusca = "", seletorGrupo = "";
function listaSeletor(){ return listaSeletorAlta(); }

function abrirSeletor(titulo, cb){
  seletorCb = cb; seletorBusca = "";
  abrirFolha(titulo, `<input type="search" placeholder="Buscar exercício" data-campo="seletor-busca" aria-label="Buscar exercício" id="seletorBusca">
    <div class="chips"><button type="button" class="chip" data-acao="seletor-grupo" data-g="" aria-pressed="${!seletorGrupo}">todos</button>${grupos().map(g=>`<button type="button" class="chip" data-acao="seletor-grupo" data-g="${esc(g)}" aria-pressed="${seletorGrupo===g}">${esc(g)}</button>`).join("")}</div>
    <div class="lista-biblio" id="seletorLista">${listaSeletor()}</div>`);
  setTimeout(()=>{ const b=$("seletorBusca"); b && b.focus(); }, 30);
}

/* ---------- navegação ---------- */
const TELAS = ["hoje","plano","biblioteca","progresso","lab","ajustes"];
const RENDER = {hoje:renderHoje, plano:renderPlano, biblioteca:renderBiblioteca, progresso:renderProgresso, lab:renderLab, ajustes:renderAjustes};
function ir(t, semRolar){
  if(!TELAS.includes(t)) t = "hoje";
  tela = t;
  document.querySelectorAll("[data-tela]").forEach(s=>s.hidden = s.dataset.tela!==t);
  document.querySelectorAll("[data-ir]").forEach(a=>{ if(a.closest(".abas,.tabbar")) a.setAttribute("aria-current", a.dataset.ir===t?"page":"false"); });
  try{ history.replaceState(null, "", "#"+t); }catch(e){}
  renderAtual();
  if(!semRolar) window.scrollTo({top:0});
}
function renderAtual(){
  $("faixaExemplo").hidden = !S.exemplo;
  try{ RENDER[tela](); }catch(e){ console.error(e); $("tela-"+tela).innerHTML = `<div class="vazio">Algo deu errado ao desenhar esta tela: ${esc(e.message)}</div>`; }
}
function mudouCorpo(){ definirCtx(S.perfil); }

/* ---------- importação / exportação ---------- */
function importarTexto(txt){
  txt = (txt||"").trim();
  if(!txt){ aviso("A caixa está vazia."); return; }
  if(txt[0]==="{"){
    let o; try{ o = JSON.parse(txt); }catch(e){ aviso("O JSON tem um erro de sintaxe."); return; }
    if(o && o.tipo==="rotina" && o.rotina){ importarRotina(o); return; }
    if(o && o.pesquisa && Array.isArray(o.historico) && o.levantamento){ importarSemanas(o); return; }
    if(!o || !Array.isArray(o.treinos) || !o.perfil){ aviso("Esse JSON não parece uma exportação deste app."); return; }
    confirmar("Importar backup", `O arquivo tem ${o.treinos.length} treinos e ${Object.keys(o.rotinas||{}).length} rotinas. Ele substitui tudo o que está neste navegador.`, "Substituir", ()=>{
      S = migrar(o); S.ativo = null; aplicarEstado(); salvar(); fecharFolha(); renderAtual(); aviso("Backup importado.");
    });
    return;
  }
  const res = importarCSV(txt, ($("unidadeCSV")||{}).value||"kg");
  if(res.erro){ aviso(res.erro); return; }
  const chaves = new Set(S.treinos.map(t=>t.data+"|"+t.nome));
  const novos = res.treinos.filter(t=>!chaves.has(t.data+"|"+t.nome));
  res.novos.forEach(n=>{ if(!porId(n.id)) CUSTOM.push(n); });
  S.custom = CUSTOM;
  if(S.exemplo){ S.treinos = []; S.peso = []; S.exemplo = false; }
  S.treinos = S.treinos.concat(novos).sort((a,b)=>a.data<b.data?-1:1);
  PERFIS.clear(); STATS_CACHE = {};
  salvar(); renderAtual();
  aviso(`${res.formato}: ${novos.length} treinos importados${res.treinos.length-novos.length?`, ${res.treinos.length-novos.length} já existiam`:""}${res.novos.length?`, ${res.novos.length} exercícios novos em “Importados”`:""}.`, true);
}
function importarRotina(o){
  const id = uid("r"); const r = o.rotina;
  const faltam = []; (o.exercicios||[]).forEach(e=>{ if(!porId(e.id)){ CUSTOM.push(e); } });
  S.custom = CUSTOM;
  S.rotinas[id] = {id, nome:(r.nome||"Rotina importada"), itens:(r.itens||[]).filter(i=>porId(i.exId)||faltam.push(i.exId)&&false)};
  salvar(); fecharFolha(); ir("plano"); aviso(`Rotina “${r.nome}” importada${faltam.length?`; ${faltam.length} exercício(s) desconhecido(s) ficaram de fora`:""}.`);
}
function exportarJSON(){ return JSON.stringify(Object.assign({}, S, {exportadoEm:new Date().toISOString(), app:"Torquímetro Gym"}), null, 1); }

/* ---------- ações ---------- */
const A = {
  "tema": ()=>{ const r=document.documentElement; const escuro = r.dataset.theme ? r.dataset.theme==="dark" : matchMedia("(prefers-color-scheme: dark)").matches; r.dataset.theme = escuro?"light":"dark"; try{ localStorage.setItem(CHAVE+".tema", r.dataset.theme); }catch(e){} },
  "fechar-folha": ()=>fecharFolha(),
  "confirmar-ok": ()=>{ const f=confirmarAcao; confirmarAcao=null; fecharFolha(); f && f(); },
  "comecar-zero": ()=>confirmar("Começar do zero", S.exemplo?"Os dados de exemplo somem e o app fica vazio para os seus treinos.":"Isto apaga todos os treinos, rotinas, pesos e exercícios criados neste navegador. Exporte antes se quiser guardar.", "Apagar tudo", ()=>{
      S = estadoVazio(); aplicarEstado(); salvar(); ir("plano"); aviso("Pronto. Comece escolhendo um plano pronto ou criando uma rotina."); }, true),
  "restaurar-exemplo": ()=>confirmar("Dados de exemplo", "Isto substitui o que está aqui por dez semanas fictícias de treino.", "Carregar exemplo", ()=>{ S = gerarExemplo(new Date()); aplicarEstado(); salvar(); ir("hoje"); }, true),
  /* hoje */
  "iniciar": el=>{ if(S.ativo){ aviso("Já há um treino em andamento."); abrirTreino(); return; } iniciarTreino(el.dataset.rotina); },
  "iniciar-escolhido": ()=>{ if(S.ativo){ abrirTreino(); return; } iniciarTreino($("rotinaLivre").value||null); },
  "abrir-treino": ()=>abrirTreino(),
  "minimizar-treino": ()=>minimizarTreino(),
  "trocar-hoje": ()=>{ S.trocas[isoDia(new Date())] = $("trocaHoje").value||null; salvar(); renderAtual(); aviso("Rotina de hoje trocada. O plano semanal não mudou."); },
  "mover-sessao": el=>{
    const hoje = new Date(); const opts = [];
    for(let i=1;i<=6;i++){ const d=somaDias(hoje,i); const r=rotinaDoDia(S,d); opts.push(`<button type="button" class="chip" data-acao="mover-para" data-rotina="${el.dataset.rotina}" data-dia="${isoDia(d)}">${DIAS[d.getDay()]} ${d.getDate()}${r&&S.rotinas[r]?" · já tem "+esc(S.rotinas[r].nome):""}</button>`); }
    abrirFolha("Mover sessão de hoje", `<p>Hoje vira descanso e a sessão vai para o dia escolhido. Se o dia já tiver rotina, ela é substituída só naquela data.</p><div class="chips">${opts.join("")}</div>`);
  },
  "mover-para": el=>{ S.trocas[isoDia(new Date())] = null; S.trocas[el.dataset.dia] = el.dataset.rotina; salvar(); fecharFolha(); renderAtual(); aviso("Sessão movida para "+dataCurta(el.dataset.dia)+"."); },
  "ver-treino": el=>abrirTreinoSalvo(el.dataset.id),
  "treino-editar": el=>{ if(S.ativo){ aviso("Finalize o treino em andamento antes de editar outro."); return; } iniciarEdicao(el.dataset.id); },
  "treino-excluir": el=>confirmar("Excluir treino", "O treino sai do histórico e dos gráficos.", "Excluir", ()=>{ S.treinos = S.treinos.filter(t=>t.id!==el.dataset.id); marcarApagadoNuvem(el.dataset.id); salvar(); renderAtual(); aviso("Treino excluído."); nuvemDepoisDeMudar(); }, true),
  "treino-manual": ()=>{ if(S.ativo){ aviso("Finalize o treino em andamento primeiro."); return; }
    abrirFolha("Registrar treino passado", `<label class="campo" style="max-width:220px">Data<input type="date" id="dataManual" value="${isoDia(somaDias(new Date(),-1))}" max="${isoDia(new Date())}"></label><button class="btn primario" type="button" data-acao="manual-ok">Começar registro</button>`); },
  "manual-ok": ()=>{ const d=$("dataManual").value; if(!d){ aviso("Escolha a data."); return; } fecharFolha(); iniciarManual(d); },
  "prog-medida": el=>{ PROG.medida = el.dataset.m; renderAtual(); },
  "medida-remover": ()=>{ const ult = (S.medidas||[]).slice(-1)[0]; if(!ult) return;
    confirmar("Apagar medidas", `O registro de ${dataCurta(ult.data)} sai do histórico.`, "Apagar", ()=>{ S.medidas = S.medidas.slice(0,-1); salvar(); fecharFolha(); renderAtual(); }, true); },
  "peso-remover": el=>{ S.peso = S.peso.filter(p=>p.data!==el.dataset.d); sincronizarMassa(); mudouCorpo(); salvar(); renderAtual(); },
  /* plano */
  "rotina-nova": ()=>{ const id=uid("r"); S.rotinas[id]={id, nome:"Nova rotina", itens:[]}; salvar(); renderAtual(); const el=document.getElementById("rot-"+id); el && el.scrollIntoView({behavior:"smooth"}); },
  "rotina-duplicar": el=>{ const r=S.rotinas[el.dataset.rotina]; const id=uid("r"); S.rotinas[id]={id, nome:r.nome+" (cópia)", itens:JSON.parse(JSON.stringify(r.itens))}; salvar(); renderAtual(); },
  "rotina-excluir": el=>{ const r=S.rotinas[el.dataset.rotina]; confirmar("Excluir rotina", `“${esc(r.nome)}” sai do plano. Treinos já feitos com ela continuam no histórico.`, "Excluir", ()=>{
      delete S.rotinas[r.id]; for(const d in S.semana) if(S.semana[d]===r.id) S.semana[d]=null; for(const k in S.trocas) if(S.trocas[k]===r.id) delete S.trocas[k]; salvar(); renderAtual(); }, true); },
  "rotina-compartilhar": el=>{ const r=S.rotinas[el.dataset.rotina];
    const pacote = {tipo:"rotina", app:"Torquímetro Gym", rotina:{nome:r.nome, itens:r.itens}, exercicios:CUSTOM.filter(c=>r.itens.some(i=>i.exId===c.id))};
    const link = linkDaPagina() ? linkDaPagina()+"#rotina="+codificarRotina(pacote) : "";
    abrirFolha("Compartilhar rotina", `${link?`<p class="pequeno">Mande o link: quem abrir recebe a rotina pronta para importar.</p><textarea id="linkRotina" readonly rows="3">${esc(link)}</textarea>
      <div class="linha"><button class="btn primario" type="button" data-acao="copiar" data-alvo="linkRotina">Copiar link</button>${navigator.share?`<button class="btn" type="button" data-acao="rotina-share" data-rotina="${r.id}">Enviar…</button>`:""}</div>
      <p class="pequeno suave">Ou o texto, para colar em Plano → Importar rotina:</p>`:`<p class="pequeno">Copie e mande para alguém. Quem receber cola em Plano → Importar rotina.</p>`}
      <textarea id="txtRotina" readonly>${esc(JSON.stringify(pacote))}</textarea><button class="btn${link?"":" primario"}" type="button" data-acao="copiar" data-alvo="txtRotina">Copiar texto</button>`); },
  "rotina-share": async el=>{ const el2 = $("linkRotina"); if(!el2) return; try{ await navigator.share({title:S.rotinas[el.dataset.rotina].nome, text:"Rotina do Torquímetro Gym", url:el2.value}); }catch(e){} },
  "rotina-importar": ()=>abrirFolha("Importar rotina", `<textarea id="txtImportRot" placeholder="Cole aqui o link ou o texto da rotina compartilhada"></textarea><button class="btn primario" type="button" data-acao="rotina-importar-ok">Importar</button>`),
  "rotina-importar-ok": ()=>{ const txt=$("txtImportRot").value.trim(); const m = txt.match(/#rotina=([A-Za-z0-9_-]+)/);
    const o = m ? decodificarRotina(m[1]) : (()=>{ try{ return JSON.parse(txt); }catch(e){ return null; } })();
    if(!o || o.tipo!=="rotina") { aviso("Isso não parece uma rotina compartilhada deste app (texto ou link)."); return; } importarRotina(o); },
  "planos-prontos": ()=>abrirFolha("Planos prontos", `<p class="pequeno">Carregar um plano acrescenta as rotinas dele e substitui a semana. Depois tudo é editável.</p>
    <div class="pilha">${Object.entries(PLANOS_PRONTOS).map(([k,p])=>`<div class="leve linha entre"><div><b>${esc(p.nome)}</b><p class="pequeno suave" style="margin:0">${esc(p.desc)} ${Object.values(p.rotinas).map(r=>esc(r.nome)).join(" · ")}</p></div><button class="btn mini primario" type="button" data-acao="plano-aplicar" data-k="${k}">Usar</button></div>`).join("")}</div>`),
  "plano-aplicar-conf": el=>{ const P=PLANOS_PRONTOS[el.dataset.k];
    confirmar("Usar “"+P.nome+"”", `As ${Object.keys(P.rotinas).length} rotinas do programa entram em Suas rotinas e a semana passa a seguir o programa. Rotinas que você já tem continuam lá.`, "Usar programa", ()=>{ aplicarPlano(S, el.dataset.k); salvar(); renderAtual(); aviso("Programa “"+P.nome+"” carregado."); }); },
  "programa-ver": el=>{ const P=PLANOS_PRONTOS[el.dataset.k]; const ordem=ordemSemana(S.ajustes.inicioSemana);
    abrirFolha(P.nome, `<p class="pequeno suave">${esc(P.objetivo)} · ${esc(P.nivel)} · ${P.dias} dias por semana · ${esc(P.duracao)}</p>
      <div class="semana">${ordem.map(d=>`<div class="dia"><div class="d">${DIAS_C[d]}</div><div class="n">${P.semana[d]?esc(P.rotinas[P.semana[d]].nome):"—"}</div></div>`).join("")}</div>
      ${Object.values(P.rotinas).map(r=>`<div class="pilha" style="gap:4px"><h3>${esc(r.nome)}</h3><div class="lista-ex">${r.itens.map(i=>{ const ex=porId(i.exId); return ex?`<div>${letraEx(ex)}<div class="nome"><b>${esc(ex.nome)}</b><span class="pequeno suave">${i.series} × ${i.repsMin===i.repsMax?i.repsMin:i.repsMin+"–"+i.repsMax}${ehTempo(ex)?" s":""} · ${i.progressao==="linear"?"progressão linear":"dupla progressão"}</span></div>${seloRegiao(ex)}</div>`:""; }).join("")}</div></div>`).join("")}
      <div class="linha"><button class="btn primario" type="button" data-acao="plano-aplicar-conf" data-k="${el.dataset.k}">Usar programa</button></div>`); },
  "plano-aplicar": el=>{ aplicarPlano(S, el.dataset.k); salvar(); fecharFolha(); ir("plano"); aviso("Plano “"+PLANOS_PRONTOS[el.dataset.k].nome+"” carregado."); },
  "item-adicionar": el=>{ const rid=el.dataset.rotina; abrirSeletor("Adicionar à rotina", exId=>{ const ex=porId(exId); S.rotinas[rid].itens.push(Object.assign({}, ITEM_PADRAO, {exId}, ehTempo(ex)?{repsMin:30,repsMax:60,incremento:0}:{})); salvar(); fecharFolha(); renderAtual(); aviso(ex.nome+" adicionado."); }); },
  "item-mover": el=>{ const l=S.rotinas[el.dataset.rotina].itens, i=+el.dataset.i, j=i+(+el.dataset.d); if(j<0||j>=l.length) return; [l[i],l[j]]=[l[j],l[i]]; salvar(); renderAtual(); },
  "item-remover": el=>{ S.rotinas[el.dataset.rotina].itens.splice(+el.dataset.i,1); salvar(); renderAtual(); },
  "troca-desfazer": el=>{ delete S.trocas[el.dataset.dia]; salvar(); renderAtual(); },
  "add-sugestao": el=>{ const r=S.rotinas[el.dataset.rotina]; r.itens.push(Object.assign({}, ITEM_PADRAO, {exId:el.dataset.ex, series:3, repsMin:10, repsMax:15})); salvar(); renderAtual(); aviso(porId(el.dataset.ex).nome+" entrou em "+r.nome+"."); },
  /* biblioteca */
  "ver-ex": el=>abrirExercicio(el.dataset.ex),
  "bib-grupo": el=>{ BIB.limite = 24; BIB.grupo = BIB.grupo===el.dataset.g ? "" : el.dataset.g; renderBiblioteca(); const l=$("listaBib"); l && el.classList.contains("tile") && l.scrollIntoView({behavior:"smooth", block:"start"}); },
  "bib-mais": ()=>{ BIB.limite += 24; $("listaBib").innerHTML = listaBibliotecaHtml(); },
  "bib-equip": el=>{ BIB.limite = 24; BIB.equip = el.dataset.e; renderBiblioteca(); },
  "bib-meus": ()=>{ BIB.limite = 24; BIB.meus = !BIB.meus; renderBiblioteca(); },
  "bib-musc": el=>{ BIB.limite = 24; BIB.musc = el.dataset.musc; renderBiblioteca(); },
  "criar-ex": ()=>abrirCriarExercicio(),
  "salvar-ex": ()=>{
    const v = id => ($(id)||{}).value||"";
    const nome = v("nNome").trim(); if(!nome){ aviso("Dê um nome ao exercício."); return; }
    const base = porId(v("nBase")); const jt = JSON.parse(JSON.stringify(base.juntas[0]));
    if(v("nB0")!=="") jt.b0=+v("nB0"); if(v("nDb")!=="") jt.db=+v("nDb"); if(v("nG")!=="") jt.g=+v("nG"); if(v("nOff")!=="") jt.off=+v("nOff")/100;
    const ex = {id:uid("meu"), nome, grupo:v("nGrupo").trim()||base.grupo, carga:v("nTipo")==="corporal"?0:(base.carga||20), tipo:v("nTipo"), frac:+v("nFrac")||0.6, bi:false,
      equip:v("nEquip"), modo:v("nModo")==="tempo"?"tempo":undefined, juntas:[jt], nota:`Criado por você, com a alavanca de “${base.nome}”.`};
    CUSTOM.push(ex); S.custom = CUSTOM; STATS_CACHE = {}; salvar(); fecharFolha(); renderAtual(); aviso("Exercício criado em "+ex.grupo+".", true); },
  "copiar-perfil": el=>{ const ex=porId(el.dataset.ex), base=porId($("copiarDe").value); if(!ex||!base) return;
    ex.juntas = JSON.parse(JSON.stringify(base.juntas)); if(ex.grupo==="Importados") ex.grupo = base.grupo; if(!ex.carga) ex.carga = base.carga; ex.tipo = base.tipo; ex.frac = base.frac;
    ex.nota = `Alavanca copiada de “${base.nome}”.`; PERFIS.delete(ex.id); STATS_CACHE = {}; salvar(); abrirExercicio(ex.id); renderAtual(); aviso("Perfil de torque copiado."); },
  "ex-excluir": el=>confirmar("Excluir exercício", "Ele sai da biblioteca e das rotinas. Treinos antigos mantêm o registro, mas sem nome.", "Excluir", ()=>{
      const id=el.dataset.ex; CUSTOM.splice(CUSTOM.findIndex(c=>c.id===id),1); S.custom=CUSTOM; Object.values(S.rotinas).forEach(r=>r.itens=r.itens.filter(i=>i.exId!==id)); STATS_CACHE={}; salvar(); renderAtual(); }, true),
  "det-add-rotina": el=>{ const r=S.rotinas[$("detRotina").value]; const ex=porId(el.dataset.ex); r.itens.push(Object.assign({}, ITEM_PADRAO, {exId:ex.id}, ehTempo(ex)?{repsMin:30,repsMax:60,incremento:0}:{})); salvar(); renderAtual(); aviso(ex.nome+" entrou em "+r.nome+"."); },
  "det-add-treino": el=>{ S.ativo.itens.push(novoItemAtivo(el.dataset.ex)); salvar(); fecharFolha(); abrirTreino(); },
  "det-lab": el=>{ LAB.a = el.dataset.ex; LAB.ka = null; const ex=porId(el.dataset.ex); const outro = lib().find(e=>e.grupo===ex.grupo && e.id!==ex.id && temPerfil(e)); if(outro){ LAB.b=outro.id; LAB.kb=null; } LAB.grupo = ex.grupo; fecharFolha(); minimizarSeAberto(); ir("lab"); },
  /* seletor */
  "seletor-escolher": el=>{ const cb=seletorCb; seletorCb=null; cb && cb(el.dataset.ex); },
  "seletor-grupo": el=>{ seletorGrupo = el.dataset.g; document.querySelectorAll('[data-acao="seletor-grupo"]').forEach(b=>b.setAttribute("aria-pressed", b.dataset.g===seletorGrupo)); $("seletorLista").innerHTML = listaSeletor(); },
  /* progresso */
  "prog-periodo": el=>{ PROG.semanas = +el.dataset.n; renderProgresso(); },
  "prog-hist": ()=>{ PROG.hist += 24; renderProgresso(); },
  "prog-mapa": el=>{ PROG.mapa = el.dataset.m; renderProgresso(); },
  /* laboratório */
  "lab-duelo": el=>{ LAB.a=el.dataset.a; LAB.b=el.dataset.b; LAB.ka=null; LAB.kb=null; renderLab(); },
  /* ajustes */
  "equip-toggle": el=>{ const l=S.ajustes.equipFiltro, e=el.dataset.e, i=l.indexOf(e); i>=0?l.splice(i,1):l.push(e); salvar(); renderAjustes(); },
  "exportar": ()=>{ $("areaDados").value = exportarJSON(); $("areaDados").select(); aviso("Backup na caixa. Copie e guarde num lugar seguro."); },
  "copiar-dados": ()=>copiarDe("areaDados"),
  "copiar": el=>copiarDe(el.dataset.alvo),
  "baixar": ()=>baixarArquivo("torquimetro-gym-"+isoDia(new Date())+".json", exportarJSON()),
  "importar": ()=>importarTexto($("areaDados").value),
  "exportar-csv": ()=>{ $("areaDados").value = exportarCSV(S); $("areaDados").select(); aviso("CSV no formato do Hevy na caixa: abre em planilhas e volta para cá pela importação."); },
  "baixar-csv": ()=>baixarArquivo("torquimetro-gym-treinos-"+isoDia(new Date())+".csv", exportarCSV(S), "text/csv"),
  /* treino ativo */
  "finalizar": ()=>finalizarTreino(false),
  "descartar": ()=>descartarTreino(false),
  "ativo-add": ()=>abrirSeletor("Adicionar ao treino", exId=>{ S.ativo.itens.push(novoItemAtivo(exId, null, S.ativo.modo==="ao-vivo"?null:(S.ativo.dataISO||"").slice(0,10))); salvar(); fecharFolha(); renderTreino();
      setTimeout(()=>{ const el=document.getElementById("item-"+(S.ativo.itens.length-1)); el && el.scrollIntoView({behavior:"smooth", block:"start"}); }, 50); }),
  "ativo-mover": el=>{ const l=S.ativo.itens, i=+el.dataset.i, j=i+(+el.dataset.d); if(j<0||j>=l.length) return; [l[i],l[j]]=[l[j],l[i]]; salvar(); renderTreino(); },
  "ativo-remover": el=>{ const it=S.ativo.itens[+el.dataset.i]; const n=it.series.filter(s=>s.feito).length;
    const fazer=()=>{ S.ativo.itens.splice(+el.dataset.i,1); salvar(); renderTreino(); };
    n ? confirmar("Remover exercício", `${porId(it.exId).nome} tem ${n} série(s) marcada(s), que serão apagadas.`, "Remover", fazer, true) : fazer(); },
  "serie-tipo": el=>{ const s=S.ativo.itens[+el.dataset.i].series[+el.dataset.s]; s.tipo = s.tipo==="aquec"?"normal":"aquec"; if(s.tipo==="aquec") s.pr=false; salvar(); renderTreino(); },
  "serie-add": el=>{ const it=S.ativo.itens[+el.dataset.i]; const u=it.series.filter(s=>s.tipo!=="aquec").pop()||it.series[it.series.length-1]; it.series.push({tipo:"normal", kg:u?u.kg:"", reps:u?u.reps:it.prog.repsMin, rir:null, feito:false}); salvar(); renderTreino(); },
  "serie-aquec": el=>{ const it=S.ativo.itens[+el.dataset.i], ex=porId(it.exId);
    const ref=it.series.find(s=>s.tipo!=="aquec"), kgT = ref&&+ref.kg ? +ref.kg : (it.alvo&&it.alvo.kg)||0;
    const rampa = rampaAquecimento(ex, kgT, S.ajustes);
    if(!rampa.length){ const pos = it.series.filter(s=>s.tipo==="aquec").length;
      it.series.splice(pos,0,{tipo:"aquec", kg: kgT ? arred(kgT*0.5, S.ajustes.passo||2.5) : "", reps:8, rir:null, feito:false});
      if(!kgT) aviso("Preencha a carga da primeira série para montar a rampa completa."); }
    else { const feitas = it.series.filter(s=>s.tipo==="aquec" && s.feito);
      it.series = feitas.concat(rampa.filter(r=>!feitas.some(f=>+f.kg===r.kg)).map(r=>({tipo:"aquec", kg:r.kg, reps:r.reps, rir:null, feito:false})), it.series.filter(s=>s.tipo!=="aquec"));
      aviso("Rampa até "+nf(kgT,2)+" kg: "+rampa.map(r=>nf(r.kg,2)+"×"+r.reps).join(", ")+"."); }
    salvar(); renderTreino(); },
  "serie-remover": el=>{ const it=S.ativo.itens[+el.dataset.i]; if(it.series.length>1){ it.series.pop(); salvar(); renderTreino(); } },
  "serie-ok": el=>{
    const a=S.ativo, i=+el.dataset.i, it=a.itens[i], s=it.series[+el.dataset.s], ex=porId(it.exId);
    s.feito = !s.feito; s.pr = false;
    if(s.feito){
      if(s.reps===""||s.reps==null) s.reps = it.alvo ? it.alvo.reps : it.prog.repsMin;
      if(s.tipo!=="aquec" && !ehTempo(ex) && (+s.kg>0 || ex.tipo==="corporal")){
        const antesDe = a.modo==="ao-vivo" ? null : (a.dataISO||"").slice(0,10);
        const hist = melhorMarca(S, it.exId, antesDe).e1rm;
        const sessao = Math.max(0, ...it.series.filter(x=>x!==s && x.feito && x.tipo!=="aquec").map(x=>e1rm(cargaTotal(ex,x.kg),x.reps,x.rir)));
        const v = e1rm(cargaTotal(ex,s.kg), s.reps, s.rir);
        if(hist>0 && v>Math.max(hist,sessao)*1.0005){ s.pr = true; it.series.forEach(x=>{ if(x!==s) x.pr=false; }); aviso(`Recorde em ${ex.nome}: 1RM estimado ${nf(v,1)} kg (antes ${nf(hist,1)}).`, true); }
      }
      if(a.modo==="ao-vivo"){
        const prox = a.itens[i+1];
        const pendNoItem = it.series.some(x=>!x.feito);
        if(it.prog.superset && prox && prox.prog.superset===it.prog.superset){ a.descanso = null; $("descanso").hidden = true; aviso("Superset: agora "+porId(prox.exId).nome+", sem descanso."); }
        else {
          const seg = s.tipo==="aquec" ? 60 : (+it.prog.descanso || +S.ajustes.descansoPadrao || 90);
          const proximo = pendNoItem ? ex.nome : (prox ? porId(prox.exId).nome : "");
          iniciarDescanso(seg, proximo ? "próximo: "+proximo : "");
        }
      }
    }
    salvar(); renderTreino();
  },
  "anilhas": el=>{ const it=S.ativo.itens[+el.dataset.i]; const s=it.series.find(x=>!x.feito)||it.series[it.series.length-1]; abrirAnilhas(+(s&&s.kg)||(it.alvo&&it.alvo.kg)||0); },
  "desc-ajuste": el=>{ const d=S.ativo&&S.ativo.descanso; if(!d) return; d.fim += (+el.dataset.d)*1000; d.total = Math.max(d.total + (+el.dataset.d), 5); alarmeDado = d.fim<=Date.now(); salvar(); desenharDescanso(); },
  "desc-pular": ()=>{ if(S.ativo){ S.ativo.descanso=null; salvar(); } $("descanso").hidden = true; }
};
Object.assign(A, ACOES_SOCIAL, ACOES_ALTA, ACOES_NUVEM, ACOES_CARTAO, ACOES_CINESIO);
function minimizarSeAberto(){ if(!$("telaTreino").hidden) minimizarTreino(); }
async function copiarDe(id){
  const el = $(id); if(!el) return;
  try{ await navigator.clipboard.writeText(el.value); aviso("Copiado."); }
  catch(e){ el.focus(); el.select(); aviso("Selecionei o texto: use Ctrl+C ou Copiar do sistema."); }
}

/* ---------- campos ---------- */
function definirCaminho(obj, path, v){ const p=path.split("."); let o=obj; for(let i=0;i<p.length-1;i++){ o[p[i]] = o[p[i]]||{}; o=o[p[i]]; } o[p[p.length-1]] = v; }
const C = {
  "cfg": (el)=>{
    const t = el.dataset.tipo;
    let v = t==="bool" ? el.checked : t==="num" ? (el.value===""?null:+el.value) : el.value;
    definirCaminho(S, el.dataset.path, v);
    if(el.dataset.path.startsWith("perfil.")){ sincronizarMassa(); mudouCorpo(); }
    if(el.dataset.path==="ajustes.priorizarAlta") PRIORIZAR_ALTA = !!v;
    if(el.dataset.path==="ajustes.renovarAuto" && v) setTimeout(()=>renovacaoAutomatica(), 0);
    salvar();
    if(tela==="lab" && el.type==="range") { const sp=el.parentElement.querySelector(".mono"); sp && (sp.textContent=(v>0?"+":"")+v+"%"); }
    return el.type!=="text";
  },
  "nota-ex": el=>{ S.notas = S.notas||{}; const v = el.value.trim(); if(v) S.notas[el.dataset.ex] = v; else delete S.notas[el.dataset.ex]; salvar(); return false; },
  "semana": el=>{ S.semana[el.dataset.dia] = el.value||null; salvar(); return true; },
  "rotina-nome": el=>{ S.rotinas[el.dataset.rotina].nome = el.value||"Sem nome"; salvar(); return false; },
  "item": el=>{ const item = S.rotinas[el.dataset.rotina].itens[+el.dataset.i]; const k=el.dataset.k;
    item[k] = k==="progressao" ? el.value : k==="superset" ? el.value.toUpperCase().slice(0,1) : (el.value===""?null:+el.value);
    if(k==="repsMin" && item.repsMax!=null && item.repsMin>item.repsMax) item.repsMax=item.repsMin;
    salvar(); return k==="progressao" || k==="series"; },
  "bib-busca": el=>{ BIB.busca = el.value; BIB.limite = 24; $("listaBib").innerHTML = listaBibliotecaHtml(); return false; },
  "seletor-busca": el=>{ seletorBusca = el.value; $("seletorLista").innerHTML = listaSeletor(); return false; },
  "det-carga": el=>{ const ex=porId(el.dataset.ex); $("detGraf").innerHTML = detalheGrafHtml(ex, +el.value||0); return false; },
  "prog-ex": el=>{ PROG.ex = el.value; return true; },
  "lab": el=>{ const k=el.dataset.k; if(k==="ka"||k==="kb") LAB[k] = el.value===""?null:+el.value; else { LAB[k]=el.value; if(k==="a") LAB.ka=null; if(k==="b") LAB.kb=null; } return true; },
  "serie": el=>{ const a=S.ativo, s=a.itens[+el.dataset.i].series[+el.dataset.s], k=el.dataset.k;
    if(k==="rir"){ s.rir = el.value==="" ? null : (S.ajustes.esforco==="RPE" ? Math.max(0,10-(+el.value)) : +el.value); }
    else s[k] = el.value==="" ? "" : +el.value;
    salvar(); return false; },
  "ativo-data": el=>{ if(el.value){ S.ativo.dataISO = el.value+"T12:00"; S.ativo.inicio = deIso(el.value).setHours(12,0,0,0); salvar(); } return false; },
  "ativo-nome": el=>{ S.ativo.nome = el.value||"Treino"; salvar(); return false; },
  "anilhas-alvo": el=>{ const v=+el.value||0; abrirAnilhas(v); const n=document.querySelector('[data-campo="anilhas-alvo"]'); if(n){ n.focus(); const L=n.value.length; try{ n.setSelectionRange && n.type!=="number" && n.setSelectionRange(L,L); }catch(e){} } return false; },
  "arquivo": el=>{ const f=el.files&&el.files[0]; if(!f) return false; const rd=new FileReader(); rd.onload=()=>{ $("areaDados").value = rd.result; importarTexto(rd.result); }; rd.readAsText(f); return false; }
};

Object.assign(C, CAMPOS_SOCIAL, CAMPOS_CINESIO);
/* ---------- eventos ---------- */
document.addEventListener("click", e=>{
  const nav = e.target.closest("[data-ir]");
  if(nav){ e.preventDefault(); minimizarSeAberto(); ir(nav.dataset.ir); return; }
  const z = e.target.closest(".corpo-svg .m.clic");
  if(z){ BIB.musc = BIB.musc===z.dataset.musc ? "" : z.dataset.musc; BIB.limite = 24; renderBiblioteca(); return; }
  const el = e.target.closest("[data-acao]");
  if(el && A[el.dataset.acao]){ e.preventDefault(); A[el.dataset.acao](el, e); }
});
document.addEventListener("keydown", e=>{
  if(e.key==="Escape" && !$("folha").hidden){ fecharFolha(); return; }
  if((e.key==="Enter"||e.key===" ") && e.target.matches(".corpo-svg .m.clic, h3[data-acao]")){ e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click",{bubbles:true})); }
});
$("folha").addEventListener("click", e=>{ if(e.target===$("folha")) fecharFolha(); });
const aoMudar = e=>{
  const el = e.target.closest("[data-campo]"); if(!el || !C[el.dataset.campo]) return;
  const tiposAoVivo = ["bib-busca","seletor-busca","det-carga","serie","rotina-nome","ativo-nome","anilhas-alvo","post-texto","post-url","post-rot"];
  if(e.type==="input" && !tiposAoVivo.includes(el.dataset.campo) && !(el.type==="range")) return;
  if(e.type==="change" && ["bib-busca","seletor-busca","det-carga","anilhas-alvo"].includes(el.dataset.campo)) return;
  const redesenhar = C[el.dataset.campo](el, e);
  if(redesenhar && e.type==="change") renderAtual();
  if(el.type==="range" && e.type==="change") renderAtual();
};
document.addEventListener("input", aoMudar);
document.addEventListener("change", aoMudar);
document.addEventListener("submit", e=>{
  const f = e.target.closest("form[data-form]"); if(!f) return;
  e.preventDefault();
  if(f.dataset.form==="peso"){
    const v = parseFloat(($("pesoHoje").value||"").replace(",","."));
    if(!(v>20 && v<400)){ aviso("Digite o peso em quilos, por exemplo 78.4."); return; }
    const k = isoDia(new Date());
    S.peso = S.peso.filter(p=>p.data!==k).concat([{data:k, kg:Math.round(v*10)/10}]);
    sincronizarMassa(); mudouCorpo(); salvar(); renderAtual(); aviso("Peso registrado: "+nfFix(v,1)+" kg.");
  }
  if(f.dataset.form==="medidas"){
    const val = {}; MEDIDAS.forEach(([k])=>val[k] = f.elements[k].value);
    const data = f.elements.data.value || isoDia(new Date());
    const ok = registrarMedidas(S, data, val);
    if(!ok){ aviso("Preencha pelo menos uma medida, por exemplo cintura 82."); return; }
    salvar(); renderAtual(); aviso("Medidas de "+dataCurta(data)+" registradas: "+Object.entries(ok).map(([k,v])=>MEDIDAS.find(m=>m[0]===k)[1].toLowerCase()+" "+nfFix(v,1)).join(", ")+".");
  }
});
setInterval(()=>{
  if(!S || !S.ativo) return;
  if(S.ativo.modo==="ao-vivo"){
    const c = $("crono"); if(c) c.textContent = cronoTxt(Date.now()-S.ativo.inicio);
    const p = $("pilulaCrono"); if(p) p.textContent = cronoTxt(Date.now()-S.ativo.inicio);
  }
  if(S.ativo.descanso) desenharDescanso();
}, 500);

/* ---------- link da página, rotina recebida por link e modo offline ---------- */
/* só existe link próprio quando a página é servida por http(s) fora do visualizador do Claude */
function linkDaPagina(){
  try{ if(!/^https?:$/.test(location.protocol) || window.top!==window || /(^|\.)claude(usercontent)?\.(ai|com)$/.test(location.hostname)) return ""; }catch(e){ return ""; }
  return location.origin + location.pathname;
}
function receberRotinaDoLink(hash){
  const m = (hash||"").match(/^#rotina=([A-Za-z0-9_-]+)/); if(!m) return;
  const o = decodificarRotina(m[1]);
  try{ history.replaceState(null, "", location.pathname + location.search + "#plano"); }catch(e){}
  if(!o){ aviso("O link de rotina está incompleto ou corrompido."); return; }
  ir("plano");
  const n = o.rotina.itens.length;
  confirmar("Rotina recebida por link", `“${esc(o.rotina.nome)}”, com ${n} exercício${n>1?"s":""}: ${o.rotina.itens.slice(0,6).map(i=>esc((porId(i.exId)||(o.exercicios||[]).find(e=>e.id===i.exId)||{nome:i.exId}).nome)).join(", ")}${n>6?"…":""}. Ela entra em Suas rotinas; nada do que você já tem muda.`, "Importar rotina", ()=>importarRotina(o));
}
function registrarOffline(){
  if(!linkDaPagina() || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}

/* ---------- início ---------- */
(function iniciar(){
  try{ const t = localStorage.getItem(CHAVE+".tema"); if(t) document.documentElement.dataset.theme = t; }catch(e){}
  carregar();
  const lt = $("linkTorq"); if(lt) lt.href = LINK_TORQUIMETRO;
  const hashInicial = location.hash||"", h = hashInicial.replace("#","");
  ir(TELAS.includes(h) ? h : "hoje", true);
  if(S.ativo){ atualizarPilula(); if(S.ativo.descanso) desenharDescanso(); }
  carregarAltaRemota();
  salvar();
  receberRotinaDoLink(hashInicial);
  iniciarNuvem();
  registrarOffline();
})();
