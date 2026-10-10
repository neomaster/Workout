/* =====================================================================
   CINESIOLOGIA NA INTERFACE: bloco da ficha, checklist dos vídeos das
   indicações e o analisador de vídeo (MediaPipe Pose no navegador)
   ===================================================================== */
const MP_VERSAO = "1.1.0";
const MP_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSAO}`;
const MP_MODELO = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const CINE = {detector:null, carregando:null, cancelar:false, ex:null, resultado:null, quadros:null, video:null, url:null};

function blocoCinesiologia(ex){
  const m = modeloCinesiologico(ex); if(!m) return "";
  const lista = xs => xs.length ? xs.map(esc).join(", ") : "—";
  return `<details class="mais cinesio" open><summary>Cinesiologia: como executar</summary>
    <div class="pilha" style="gap:12px;margin-top:8px">
      <p class="pequeno" style="margin:0"><b>${esc(m.nome)}</b> · cadeia cinética ${esc(m.cadeia)}${m.pose?` · ${esc(m.pose.angulo)} de ~${m.pose.alvoMax}° a ~${m.pose.alvoMin}° no movimento completo`:""}.</p>
      <div class="rolar"><table class="tabela-cinesio"><thead><tr><th>articulação</th><th>ação (excêntrica → concêntrica)</th><th>plano</th></tr></thead>
        <tbody>${m.acoes.map(a=>`<tr><td>${esc(a.articulacao)}</td><td>${esc(a.acao)}</td><td>${esc(a.plano)}</td></tr>`).join("")}</tbody></table></div>
      <dl class="papeis"><div><dt>agonistas</dt><dd>${lista(m.agonistas)}</dd></div><div><dt>sinergistas</dt><dd>${lista(m.sinergistas)}</dd></div><div><dt>estabilizadores</dt><dd>${lista(m.estabilizadores)}</dd></div></dl>
      ${m.regiao?`<div class="leve pilha" style="gap:4px"><b>Curva de torque</b><p class="pequeno" style="margin:0">${esc(m.dica)}${m.fracoes?` Trabalho: ${m.fracoes[0]}% alongado, ${m.fracoes[1]}% meio, ${m.fracoes[2]}% encurtado.`:""}</p></div>`:""}
      <div class="leve pilha" style="gap:4px"><b>Cadência${m.cadencia.codigo?` ${esc(m.cadencia.codigo)}`:""}</b><p class="pequeno" style="margin:0">${esc(m.cadencia.txt)}${m.cadencia.codigo?" Os números são segundos de descida, pausa embaixo, subida e pausa em cima.":""}</p></div>
      <div><b class="pequeno">A melhor forma, passo a passo</b><ol class="passos-exec">${m.passos.map(p=>`<li>${esc(p)}</li>`).join("")}</ol>
        <p class="pequeno suave" style="margin:4px 0 0">${esc(m.respiracao)}</p></div>
      <div><b class="pequeno">Erros comuns e como corrigir</b><ul class="erros-exec">${m.erros.map(([e,c])=>`<li><b>${esc(e)}.</b> ${esc(c)}</li>`).join("")}</ul></div>
      ${m.pose?`<div class="linha"><button class="btn primario mini" type="button" data-acao="cinesio-video" data-ex="${ex.id}">Avaliar um vídeo da execução</button><span class="pequeno suave">Grave ${esc(m.pose.vista)}, corpo inteiro no quadro; o vídeo é analisado no seu aparelho e não sai dele.</span></div>`
        :`<p class="pequeno suave" style="margin:0">Este movimento não tem um ângulo principal que a câmera meça com segurança, então fica fora do analisador de vídeo.</p>`}
    </div></details>${blocoAnaliseCompleta(ex)}`;
}

/* ---------- análise cinesiológica completa do exercício (sem precisar de vídeo) ---------- */
const PAPEL_ROT = {agonista:"agonista", sinergista:"sinergista", estabilizador:"estabilizador", antagonista:"antagonista"};
function tabelaAnatomia(lista){
  return `<div class="rolar"><table class="tabela-cinesio tabela-anat"><thead><tr><th>músculo</th><th>origem</th><th>inserção</th><th>inervação</th><th>ação</th><th>plano</th></tr></thead>
    <tbody>${lista.map(a=>`<tr><td><b>${esc(a.nome)}</b></td><td>${esc(a.origem)}</td><td>${esc(a.insercao)}</td><td>${esc(a.inervacao)}</td><td>${esc(a.acao)}</td><td>${esc(a.planos)}</td></tr>`).join("")}</tbody></table></div>`;
}
const listaFontes = fontes => `<details class="mais fontes-cinesio"><summary>Fontes</summary><ul class="pequeno suave">${fontes.map(f=>`<li>${esc(f)}</li>`).join("")}</ul>
  <p class="pequeno suave" style="margin:0">Os textos do app resumem essas obras com palavras próprias.</p></details>`;
function blocoAnaliseCompleta(ex){
  const A = analiseCinesiologica(ex); if(!A) return "";
  const card = (t, x) => x ? `<div class="leve pilha" style="gap:4px"><b>${t}</b><p class="pequeno" style="margin:0">${esc(x)}</p></div>` : "";
  return `<details class="mais cinesio cinesio-analise" open><summary>Análise cinesiológica</summary>
    <div class="pilha" style="gap:14px;margin-top:8px">
      <div class="rolar"><table class="tabela-cinesio"><caption class="pequeno suave">Movimento articular: planos, eixos e amplitude anatômica de referência</caption>
        <thead><tr><th>articulação</th><th>concêntrica</th><th>excêntrica</th><th>plano · eixo</th><th>amplitude de referência</th></tr></thead>
        <tbody>${A.movimentos.map(m=>`<tr><td>${esc(m.articulacao)}</td>${m.iso?`<td colspan="2">isometria: ${esc(m.iso)}</td>`:`<td>${esc(m.conc)}</td><td>${esc(m.exc)}</td>`}<td>${esc(m.plano)}${m.eixo?` · ${esc(m.eixo)}`:""}</td><td>${esc(m.amplitude||"—")}</td></tr>`).join("")}</tbody></table></div>
      <div class="grade-biomec">
        ${card("Cadeia cinética", A.cadeia.txt)}${card("Alavanca", A.alavanca)}${card("Braço de momento da resistência", A.bm)}${card("Componente translatório", A.transl)}
      </div>
      ${card("Intenção e foco", A.foco)}
      <div><b class="pequeno">Músculos no movimento</b>
        <div class="rolar"><table class="tabela-cinesio tabela-musc"><thead><tr><th>músculo</th><th>papel</th><th>ação neste exercício</th><th>contração</th><th>comprimento</th></tr></thead>
          <tbody>${A.musculos.map(m=>`<tr class="papel-${m.papel}"><td><b>${esc(m.nome)}</b>${m.componentes.length>1?`<br><span class="suave">${esc(m.componentes.map(c=>c.split(" (")[0]).join(", "))}</span>`:""}</td><td><span class="selo-papel">${PAPEL_ROT[m.papel]}</span></td><td>${esc(m.acao)}</td><td>${esc(m.contracao)}</td><td>${esc(m.comprimento)}</td></tr>`).join("")}</tbody></table></div></div>
      ${A.torque.txt?`<div class="leve pilha" style="gap:4px"><b>Torque × força-comprimento</b><p class="pequeno" style="margin:0">${esc(A.torque.txt)}</p>${A.torque.momentos.map(t=>`<p class="pequeno suave" style="margin:0">${esc(t)}</p>`).join("")}</div>`:""}
      ${A.biarticulares.length?`<div><b class="pequeno">Biarticulares: insuficiência ativa e passiva</b><ul class="pequeno lista-cinesio">${A.biarticulares.map(b=>`<li><b>${esc(b.nome)}</b> (${esc(b.juntas.join(" e "))}, ${esc(NOMES_ESTADO[b.estado]||b.estado)}): ${esc(b.txt)}</li>`).join("")}</ul></div>`:""}
      ${(A.cadeias.myers.length||A.cadeias.souchard.length)?`<div><b class="pequeno">Cadeias musculares</b><ul class="pequeno lista-cinesio">
        ${A.cadeias.myers.map(c=>`<li><b>${esc(c.nome)}</b> (${esc(c.membros.join(", "))}): ${esc(c.funcao)}. Desequilíbrio: ${esc(c.compensacao)}.</li>`).join("")}
        ${A.cadeias.souchard.map(c=>`<li><b>${esc(c.nome)}</b> (Souchard), quando encurtada, limita este exercício: ${esc(c.efeito)}.</li>`).join("")}
        ${A.cadeias.gds?`<li>${esc(A.cadeias.gds)}</li>`:""}</ul></div>`:""}
      ${A.seguranca.length?`<div><b class="pequeno">Compensações e segurança</b><ul class="pequeno lista-cinesio">${A.seguranca.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}
      ${A.anatomia.length?`<details class="mais"><summary>Anatomia dos agonistas: origem, inserção e inervação</summary>${tabelaAnatomia(A.anatomia)}</details>`:""}
      ${listaFontes(A.fontes)}
    </div></details>`;
}

/* ---------- análise de um grupo muscular ou de um músculo (Biblioteca) ---------- */
function blocoAnaliseGrupo(chave){
  const G = analiseGrupo(chave); if(!G) return "";
  const r = G.porRegiao, tot = Math.max(1, r.alongado + r.meio + r.encurtado);
  const barra = (rot, v, cls) => `<div class="linha entre pequeno"><span>${rot}</span><span class="mono">${v}</span></div><div class="trilho"><i class="${cls}" style="width:${Math.round(v/tot*100)}%"></i></div>`;
  const musc = m => `<details class="mais"><summary>${esc(m.nome)}: anatomia, ações e cadeias</summary><div class="pilha" style="gap:10px;margin-top:8px">
      ${m.nota?`<p class="pequeno" style="margin:0">${esc(m.nota)}</p>`:""}${m.momento?`<p class="pequeno suave" style="margin:0">${esc(m.momento)}</p>`:""}
      <div class="rolar"><table class="tabela-cinesio"><thead><tr><th>ação</th><th>amplitude de referência</th><th>exercícios do grupo</th><th>em outros grupos</th><th>exemplo</th></tr></thead>
        <tbody>${m.acoes.map(a=>`<tr><td>${esc(a.texto)}</td><td>${esc(a.amplitude||"—")}</td><td class="mono">${a.exercicios}</td><td class="mono">${a.fora}</td><td>${esc(a.exemplo||"—")}</td></tr>`).join("")}</tbody></table></div>
      ${m.bi?`<p class="pequeno" style="margin:0"><b>Biarticular (${esc(m.bi.nome)}):</b> alongado com ${esc(m.bi.alonga)}; encurtado com ${esc(m.bi.encurta)}.${m.comprimentos&&m.comprimentos.length?" Na biblioteca: "+m.comprimentos.map(c=>`${c.exercicios} ${c.exercicios>1?"exercícios":"exercício"} com ele ${esc(c.nome)} (ex.: ${esc(c.exemplo)})`).join("; ")+".":""}</p>`:""}
      <p class="pequeno" style="margin:0"><b>Antagonistas:</b> ${esc(m.antagonistas.join(", ")||"—")}${m.sinergia.length?` · <b>sinergista em</b> ${m.sinergia.slice(0,4).map(s=>`${s.exercicios} de ${esc(s.grupo)}`).join(", ")}`:""}</p>
      ${m.myers.length||m.souchard.length?`<ul class="pequeno lista-cinesio">${m.myers.map(c=>`<li><b>${esc(c.nome)}</b>: ${esc(c.percurso)}. ${esc(c.funcao)}.</li>`).join("")}${m.souchard.map(c=>`<li><b>${esc(c.nome)}</b> (Souchard): ${esc(c.musculos)}; encurtada, gera ${esc(c.efeito)}.</li>`).join("")}${m.gds?`<li>${esc(m.gds)}</li>`:""}</ul>`:""}
      ${m.componentes.length?tabelaAnatomia(m.componentes):""}
    </div></details>`;
  return `<details class="painel analise-grupo" open><summary class="cab"><h3>Análise cinesiológica: ${esc(G.titulo)}</h3></summary><div class="corpo pilha" style="gap:14px">
      <p style="margin:0">${esc(G.resumo)}</p>
      <div class="grade-biomec">
        <div class="leve pilha" style="gap:6px"><span class="rot">onde fica o pico de torque (${G.total} exercícios)</span>${barra("músculo alongado", r.alongado, "reg-al")}${barra("meio do arco", r.meio, "reg-me")}${barra("músculo encurtado", r.encurtado, "reg-en")}</div>
        <div class="leve pilha" style="gap:4px"><span class="rot">padrões de movimento</span>${G.porPadrao.map(p=>`<div class="linha entre pequeno"><span>${esc(p.nome)}</span><span class="mono">${p.exercicios}</span></div>`).join("")}
          <span class="pequeno suave">${Object.entries(G.porCadeia).map(([c,q])=>`${q} em cadeia ${esc(c)}`).join(" · ")}</span></div>
      </div>
      ${G.recomendacao.length?`<div class="pilha" style="gap:6px"><b class="pequeno">Para cobrir o grupo inteiro, combine</b><div class="chips">${G.recomendacao.map(x=>`<button type="button" class="chip" data-acao="ver-ex" data-ex="${esc(x.id)}">${esc(x.nome)} <span class="suave">· ${esc(x.motivo)}</span></button>`).join("")}</div></div>`:""}
      ${G.lacunas.length?`<p class="pequeno suave" style="margin:0"><b>Sem exercício dedicado na biblioteca:</b> ${esc(G.lacunas.join("; "))}.</p>`:""}
      ${G.musculos.map(musc).join("")}
      <details class="mais"><summary>Por que o corpo compensa</summary><p class="pequeno">${esc(G.principios)}</p>
        <ul class="pequeno lista-cinesio">${G.fatores.map(([t,x])=>`<li><b>${esc(t)}:</b> ${esc(x)}</li>`).join("")}</ul></details>
      ${listaFontes(G.fontes)}
    </div></details>`;
}

/* checklist para os vídeos das indicações (TikTok, YouTube, Instagram e os salvos) */
function blocoObservarVideos(ex){
  const itens = oQueObservar(ex), m = modeloCinesiologico(ex);
  if(!itens.length) return "";
  return `<div class="leve pilha observar" style="gap:6px"><b>O que observar nos vídeos indicados</b>
    <ul class="pequeno" style="margin:0;padding-left:18px">${itens.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>
    ${m && m.pose ? (()=>{ const refs = videosParaAvaliar(ex);
      return `<div class="linha" style="gap:6px">${refs.map(r=>`<button class="btn mini" type="button" data-acao="cinesio-video" data-ex="${ex.id}" data-url="${esc(r.url)}">Avaliar ${esc(r.rot)}</button>`).join("")}
        <button class="btn mini fantasma" type="button" data-acao="cinesio-video" data-ex="${ex.id}">Outro vídeo ou link</button></div>`; })() : ""}
  </div>`;
}

/* vídeos das indicações que dá para abrir no avaliador: os da pesquisa em alta e os salvos */
function videosParaAvaliar(ex){
  const out = [], vistos = new Set();
  const add = (url, rot) => { const v = videoIncorporavel(url); if(v.erro || vistos.has(v.embed)) return; vistos.add(v.embed); out.push({url, rot}); };
  const c = typeof classificar==="function" ? classificar(ex) : null;
  if(c) c.refs.forEach(r=>add(r.url, r.rede + (r.autor ? " " + r.autor : "")));
  videosDe(ex.id).forEach(v=>add(v.url, v.rede + " salvo"));
  return out.slice(0, 5);
}

/* ---------- carregar o detector de pose ---------- */
async function detectorPose(){
  if(window.__DETECTOR_POSE) return window.__DETECTOR_POSE;        /* gancho dos testes */
  if(CINE.detector) return CINE.detector;
  if(!CINE.carregando) CINE.carregando = (async ()=>{
    const {FilesetResolver, PoseLandmarker} = await import(MP_BASE + "/vision_bundle.mjs");
    const vision = await FilesetResolver.forVisionTasks(MP_BASE + "/wasm");
    const criar = delegate => PoseLandmarker.createFromOptions(vision, {baseOptions:{modelAssetPath:MP_MODELO, delegate}, runningMode:"VIDEO", numPoses:1, minPoseDetectionConfidence:0.5, minTrackingConfidence:0.5});
    let pl; try{ pl = await criar("GPU"); }catch(e){ pl = await criar("CPU"); }
    let ultimo = 0;   /* o MediaPipe exige carimbos de tempo sempre crescentes, entre análises também */
    CINE.detector = {detectar:(fonte, ms)=>{ ultimo = Math.max(ultimo + 1, Math.round(ms)); const r = pl.detectForVideo(fonte, ultimo);
      return (r.worldLandmarks && r.worldLandmarks[0]) ? {mundo:r.worldLandmarks[0], tela:r.landmarks[0]} : (r.landmarks && r.landmarks[0] ? {mundo:null, tela:r.landmarks[0]} : null); }};
    return CINE.detector;
  })().catch(e=>{ CINE.carregando = null; throw e; });
  return CINE.carregando;
}
const AVISO_MODELO = `<div class="aviso pequeno">Não foi possível carregar o modelo de pose aqui. Ele vem da internet (jsDelivr e Google) e funciona no app aberto pelo GitHub Pages ou por <code>npm run serve</code>; dentro do Claude, a página não tem acesso a esses arquivos.</div>`;

function abrirAnalisador(exId, url){
  const ex = porId(exId), m = modeloCinesiologico(ex);
  if(!m || !m.pose){ aviso("Este exercício não tem análise de vídeo."); return; }
  pararCaptura();
  CINE.ex = ex; CINE.resultado = null; CINE.fonte = url ? "link" : (CINE.fonte || "link");
  abrirFolha("Avaliar a execução", `
    <p class="pequeno" style="margin:0"><b>${esc(ex.nome)}</b>: o analisador acompanha o ângulo do <b>${esc(m.pose.angulo)}</b> (${esc(ANGULOS_POSE[m.pose.angulo].desc)}) quadro a quadro e compara com o modelo: amplitude, cadência, consistência, simetria e tronco. Funciona melhor com o vídeo feito ${esc(m.pose.vista)}, corpo inteiro no quadro.</p>
    <div class="chips" role="tablist" aria-label="De onde vem o vídeo">
      <button type="button" class="chip" role="tab" data-acao="cinesio-fonte" data-f="link" aria-selected="${CINE.fonte==="link"}" aria-pressed="${CINE.fonte==="link"}">Link do YouTube, TikTok ou Instagram</button>
      <button type="button" class="chip" role="tab" data-acao="cinesio-fonte" data-f="arquivo" aria-selected="${CINE.fonte==="arquivo"}" aria-pressed="${CINE.fonte==="arquivo"}">Arquivo do aparelho</button></div>
    <div id="cinesioFonte">${CINE.fonte==="link" ? painelLink(url) : painelArquivo()}</div>
    <div id="cinesioArea"></div>`);
  if(url) carregarLink(url);
}
function painelArquivo(){
  return `<ul class="pequeno suave" style="margin:0;padding-left:18px"><li>De 2 a 60 segundos, uma pessoa só, boa luz, câmera parada.</li><li>Tudo roda neste aparelho: o vídeo não é enviado a lugar nenhum.</li></ul>
    <label class="campo">Vídeo<input type="file" accept="video/*" id="cinesioArquivo" data-campo="cinesio-arquivo"></label>`;
}
function painelLink(url){
  return `<form class="linha" data-form="cinesio-link" style="align-items:flex-end"><label class="campo" style="flex:1">Link do vídeo<input type="url" id="cinesioLink" inputmode="url" placeholder="https://www.youtube.com/watch?v=…  ·  tiktok.com/@…/video/…  ·  instagram.com/reel/…" value="${esc(url||"")}"></label>
      <button class="btn" type="submit">Carregar</button></form>
    <div id="cinesioPlayerArea"></div>`;
}
function carregarLink(url){
  const area = $("cinesioPlayerArea"); if(!area) return;
  const v = videoIncorporavel(url);
  if(v.erro){ area.innerHTML = `<div class="aviso pequeno">${esc(v.erro)}</div>`; return; }
  CINE.link = v;
  const podeCapturar = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  area.innerHTML = `
    <div class="player-incorporado${v.vertical?" vertical":""}" id="cinesioMoldura"><iframe id="cinesioPlayer" src="${esc(v.embed)}" title="Vídeo do ${esc(v.rede)} para avaliação" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    ${podeCapturar ? `<ol class="pequeno" style="margin:0;padding-left:20px">
        <li>Deixe o vídeo no ponto em que a série começa.</li>
        <li>Toque em <b>Começar a análise</b> e autorize o navegador a mostrar <b>esta aba</b>. O ${esc(v.rede)} não deixa a página ler o vídeo, então ela lê a imagem que aparece na tela, só a área do player.</li>
        <li>Dê play e deixe a série inteira passar; depois toque em <b>Parar e avaliar</b>.</li></ol>
      <div class="linha"><button class="btn primario" type="button" data-acao="cinesio-capturar">Começar a análise</button><a class="btn mini fantasma" href="${esc(v.original)}" target="_blank" rel="noopener">Abrir no ${esc(v.rede)} ↗</a></div>`
    : `<div class="aviso pequeno">Este navegador não permite que a página leia a imagem do vídeo (a captura de aba só existe no Chrome, Edge e Firefox de computador). Assista daqui com o checklist da ficha, ou salve o vídeo no aparelho e use <b>Arquivo do aparelho</b>.</div>`}`;
}

/* ---------- captura da aba: analisa o player enquanto o vídeo toca ---------- */
async function iniciarCaptura(){
  const area = $("cinesioArea"), moldura = $("cinesioMoldura"); if(!area || !moldura) return;
  let stream;
  try{ /* o pedido de captura precisa vir logo depois do toque, antes de qualquer espera */
    stream = await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:15, max:30}}, audio:false, preferCurrentTab:true, selfBrowserSurface:"include", surfaceSwitching:"exclude"});
  }catch(e){ area.innerHTML = `<div class="aviso pequeno">${e && e.name==="NotAllowedError" ? "A captura foi recusada. Sem ela a página não enxerga o vídeo do " + esc(CINE.link.rede) + "." : "Este navegador não conseguiu capturar a aba."}</div>`; return; }
  const track = stream.getVideoTracks()[0];
  const sup = (track.getSettings && track.getSettings().displaySurface) || "browser";
  let recortada = false;
  try{ if(window.CropTarget && track.cropTo){ await track.cropTo(await CropTarget.fromElement(moldura)); recortada = true; } }catch(e){}
  area.innerHTML = `<p class="pequeno" id="cinesioStatus" role="status">Carregando o modelo de pose…</p>`;
  let det; try{ det = await detectorPose(); }catch(e){ track.stop(); area.innerHTML = AVISO_MODELO; return; }
  const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.srcObject = stream;
  try{ await v.play(); }catch(e){}
  const cv = document.createElement("canvas"), g = cv.getContext("2d", {willReadFrequently:true});
  const quadros = [], miniaturas = [], t0 = performance.now();
  CINE.captura = {track, timer:null, v};
  area.innerHTML = `<div class="linha"><p class="pequeno" id="cinesioStatus" role="status" style="margin:0;flex:1">Dê play no vídeo. Lendo a imagem…</p><button class="btn primario" type="button" data-acao="cinesio-parar">Parar e avaliar</button></div>
    ${sup!=="browser"?`<div class="aviso pequeno">Você escolheu ${sup==="monitor"?"a tela inteira":"uma janela"}. Para a leitura ficar certa, escolha <b>esta aba</b> na próxima vez.</div>`:""}`;
  const passo = ()=>{
    if(!CINE.captura || !v.videoWidth) return;
    let sx = 0, sy = 0, sw = v.videoWidth, sh = v.videoHeight;
    if(!recortada && sup==="browser"){   /* sem recorte nativo: corta a área do player pela posição na janela */
      const r = moldura.getBoundingClientRect(), k = v.videoWidth / window.innerWidth;
      sx = Math.max(0, r.left*k); sy = Math.max(0, r.top*k); sw = Math.min(v.videoWidth - sx, r.width*k); sh = Math.min(v.videoHeight - sy, r.height*k);
    }
    if(sw<20 || sh<20) return;
    const esc_ = Math.min(1, 640/sw); cv.width = Math.round(sw*esc_); cv.height = Math.round(sh*esc_);
    g.drawImage(v, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
    const t = (performance.now()-t0)/1000;
    let r = null; try{ r = det.detectar(cv, performance.now()); }catch(e){}
    quadros.push({t:+t.toFixed(2), lm: r ? (r.mundo || r.tela) : null, tela: r ? r.tela : null});
    miniaturas.push(r ? cv.toDataURL("image/jpeg", 0.6) : null);
    const ok = quadros.filter(q=>q.lm).length;
    const el = $("cinesioStatus"); if(el) el.textContent = `${t.toFixed(0)} s lidos, pessoa detectada em ${Math.round(ok/quadros.length*100)}% dos quadros.`;
    if(t>=75) pararCaptura(true);
  };
  CINE.captura.timer = setInterval(passo, 100);
  CINE.captura.fim = ()=>{
    const res = analisarVideoMovimento(quadros.map(q=>({t:q.t, lm:q.lm})), CINE.ex);
    CINE.resultado = res; CINE.quadros = quadros;
    if(res.erro){ area.innerHTML = `<div class="aviso pequeno">${esc(res.erro)}</div>`; return; }
    const i = quadroReferencia(res, quadros), img = new Image();
    img.onload = ()=>desenharEsqueleto($("cinesioCanvas"), img, quadros[i].tela, res.angulo);
    mostrarResultado(area, res, `do ${CINE.link.rede}`);
    if(miniaturas[i]) img.src = miniaturas[i];
  };
  track.addEventListener("ended", ()=>pararCaptura(true));
}
function pararCaptura(avaliar){
  const c = CINE.captura; if(!c) return;
  CINE.captura = null; clearInterval(c.timer);
  try{ c.track.stop(); }catch(e){}
  if(avaliar && c.fim) c.fim();
}

/* ---------- arquivo do aparelho ---------- */
async function analisarArquivoVideo(arquivo){
  const area = $("cinesioArea"); if(!area || !arquivo) return;
  const ex = CINE.ex, m = modeloCinesiologico(ex);
  if(CINE.url) URL.revokeObjectURL(CINE.url);
  CINE.url = URL.createObjectURL(arquivo); CINE.cancelar = false;
  area.innerHTML = `<p class="pequeno" id="cinesioStatus" role="status">Carregando o modelo de pose…</p><button class="btn mini fantasma" type="button" data-acao="cinesio-cancelar">Cancelar</button>`;
  const status = t => { const el = $("cinesioStatus"); if(el) el.textContent = t; };
  let det;
  try{ det = await detectorPose(); }catch(e){ area.innerHTML = AVISO_MODELO; return; }
  const video = document.createElement("video");
  video.muted = true; video.playsInline = true; video.preload = "auto"; video.src = CINE.url;
  try{ await new Promise((ok, falha)=>{ video.onloadeddata = ok; video.onerror = ()=>falha(new Error("video")); setTimeout(()=>falha(new Error("tempo")), 15000); }); }
  catch(e){ area.innerHTML = `<div class="aviso pequeno">Este navegador não abriu o vídeo. Tente MP4 (H.264) ou WebM.</div>`; return; }
  const dur = Math.min(video.duration||0, 60), passo = 0.1, quadros = [];
  if(!(dur>0.5)){ area.innerHTML = `<div class="aviso pequeno">O vídeo é curto demais.</div>`; return; }
  const ir = t => new Promise(ok=>{ const f = ()=>{ video.removeEventListener("seeked", f); ok(); }; video.addEventListener("seeked", f); video.currentTime = t; });
  for(let t=0; t<=dur && !CINE.cancelar; t+=passo){
    await ir(Math.min(t, dur-0.01));
    let r = null; try{ r = det.detectar(video, Math.round(t*1000)); }catch(e){}
    quadros.push({t:+t.toFixed(2), lm: r ? (r.mundo || r.tela) : null, tela: r ? r.tela : null});
    if(quadros.length % 5 === 0) status(`Analisando ${Math.round(t/dur*100)}%…`);
    if(quadros.length % 20 === 0) await new Promise(r=>setTimeout(r));
  }
  if(CINE.cancelar){ area.innerHTML = `<p class="pequeno suave">Análise cancelada.</p>`; return; }
  /* a análise usa as coordenadas 3D do corpo; a tela só serve para desenhar o esqueleto */
  const res = analisarVideoMovimento(quadros.map(q=>({t:q.t, lm:q.lm})), ex);
  CINE.resultado = res; CINE.quadros = quadros; CINE.video = video;
  if(res.erro){ area.innerHTML = `<div class="aviso pequeno">${esc(res.erro)}</div>`; return; }
  const i = quadroReferencia(res, quadros);
  await ir(quadros[i].t);
  mostrarResultado(area, res, "do vídeo");
  desenharEsqueleto($("cinesioCanvas"), video, quadros[i].tela, m.pose.angulo);
}

/* quadro de referência: o ponto mais fechado da primeira repetição */
function quadroReferencia(res, quadros){
  if(!res.reps.length) return Math.floor(quadros.length/2);
  let b = null;
  quadros.forEach((q,i)=>{ const v = (res.serie[i]||[])[1]; if(v!=null && q.t>=res.reps[0].t0 && q.t<=res.reps[0].t1 && (b==null || v<res.serie[b][1])) b = i; });
  return b==null ? Math.floor(quadros.length/2) : b;
}

function mostrarResultado(area, res, origem){
  const m = res.modelo;
  const cor = {ok:"var(--ok)", atencao:"var(--alerta)", problema:"var(--critico)"}, rot = {ok:"bom", atencao:"atenção", problema:"corrigir"};
  const pts = res.serie.filter(p=>p[1]!=null);
  area.innerHTML = `
    <div class="cinesio-res">
      <figure class="cinesio-quadro"><canvas id="cinesioCanvas" aria-label="Quadro do vídeo com o esqueleto detectado"></canvas><figcaption class="pequeno suave">Ponto mais fechado da 1ª repetição, lido ${esc(origem)}</figcaption></figure>
      <div class="pilha" style="gap:8px">
        <div class="linha" style="gap:10px;align-items:baseline"><span class="mc-valor" style="color:${cor[res.geral]}">${res.reps.length}</span><b>repetiç${res.reps.length===1?"ão":"ões"} · ${rot[res.geral]}</b></div>
        <ul class="notas-cinesio">${res.notas.map(n=>`<li><span class="selo" style="background:${cor[n.status]};color:var(--sobre-acento);border-color:transparent">${rot[n.status]}</span><div><b>${esc(n.criterio)}</b><p class="pequeno" style="margin:2px 0 0">${esc(n.texto)}</p></div></li>`).join("")}</ul>
      </div>
    </div>
    ${pts.length>3?`<div class="pilha" style="gap:4px"><span class="rot">ângulo do ${esc(res.angulo)} ao longo do vídeo</span>${grafLinha([{nome:"ângulo",cor:"var(--rosa)",pts}],{h:170,fmtX:v=>nf(v,1)+" s",fmtY:v=>Math.round(v)+"°",yRot:"graus",aria:"Ângulo da articulação ao longo do vídeo"})}
      <p class="pequeno suave" style="margin:0">Faixa esperada: de ${m.pose.alvoMax}° a ${m.pose.alvoMin}°. ${res.cobertura}% dos quadros com a articulação visível.</p></div>`:""}
    ${res.reps.length?`<div class="rolar"><table class="tabela-pct"><thead><tr><th>rep</th><th>amplitude</th><th>de → até</th><th>descida</th><th>subida</th></tr></thead><tbody>${res.reps.map((r,i)=>`<tr><td class="num">${i+1}</td><td class="num">${r.amplitude}°</td><td class="num">${r.max}° → ${r.min}°</td><td class="num">${nfFix(r.excentrica,1)} s</td><td class="num">${nfFix(r.concentrica,1)} s</td></tr>`).join("")}</tbody></table></div>`:""}
    <p class="pequeno suave" style="margin:0">A estimativa de pose erra alguns graus, principalmente com roupa larga, pouca luz, cortes de edição ou o corpo de frente para a câmera quando o movimento é de lado. Em vídeos de redes, vinhetas e textos na tela também atrapalham. Use como segunda opinião, não como laudo.</p>`;
}

const LIGACOES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],[27,31],[28,32]];
function desenharEsqueleto(cv, fonte, tela, angulo){
  if(!cv) return;
  const w = fonte.videoWidth || fonte.naturalWidth || 640, h = fonte.videoHeight || fonte.naturalHeight || 360, esc_ = Math.min(1, 480/w);
  cv.width = Math.round(w*esc_); cv.height = Math.round(h*esc_);
  const g = cv.getContext("2d");
  try{ g.drawImage(fonte, 0, 0, cv.width, cv.height); }catch(e){ g.fillStyle = "#1d2026"; g.fillRect(0,0,cv.width,cv.height); }
  if(!tela) return;
  const P = i => ({x:tela[i].x*cv.width, y:tela[i].y*cv.height});
  g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,.9)";
  for(const [a,b] of LIGACOES){ if(!tela[a]||!tela[b]) continue; const A=P(a), B=P(b); g.beginPath(); g.moveTo(A.x,A.y); g.lineTo(B.x,B.y); g.stroke(); }
  const destaque = ANGULOS_POSE[angulo].pontos.flat();
  for(let i=11;i<33;i++){ if(!tela[i]) continue; const p = P(i); g.beginPath(); g.arc(p.x,p.y, destaque.includes(i)?7:4, 0, Math.PI*2); g.fillStyle = destaque.includes(i) ? "#e0326e" : "#fff"; g.fill(); }
}

const ACOES_CINESIO = {
  "cinesio-video": el=>abrirAnalisador(el.dataset.ex, el.dataset.url||""),
  "cinesio-fonte": el=>{ pararCaptura(); CINE.fonte = el.dataset.f; abrirAnalisador(CINE.ex.id); },
  "cinesio-capturar": ()=>iniciarCaptura(),
  "cinesio-parar": ()=>pararCaptura(true),
  "cinesio-cancelar": ()=>{ CINE.cancelar = true; }
};
const CAMPOS_CINESIO = {
  "cinesio-arquivo": (el, e)=>{ if(e.type==="change" && el.files && el.files[0]) analisarArquivoVideo(el.files[0]); return false; }
};
