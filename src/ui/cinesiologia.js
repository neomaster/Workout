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
    </div></details>`;
}

/* checklist para os vídeos das indicações (TikTok, YouTube, Instagram e os salvos) */
function blocoObservarVideos(ex){
  const itens = oQueObservar(ex), m = modeloCinesiologico(ex);
  if(!itens.length) return "";
  return `<div class="leve pilha observar" style="gap:6px"><b>O que observar nos vídeos indicados</b>
    <ul class="pequeno" style="margin:0;padding-left:18px">${itens.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>
    ${m && m.pose?`<div class="linha" style="gap:8px"><button class="btn mini" type="button" data-acao="cinesio-video" data-ex="${ex.id}">Avaliar um vídeo</button><span class="pequeno suave">TikTok, Instagram e YouTube não deixam a página ler o vídeo direto: salve-o no aparelho (ou grave a sua execução) e abra aqui.</span></div>`:""}
  </div>`;
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
    CINE.detector = {detectar:(video, ms)=>{ const r = pl.detectForVideo(video, ms); return (r.worldLandmarks && r.worldLandmarks[0]) ? {mundo:r.worldLandmarks[0], tela:r.landmarks[0]} : (r.landmarks && r.landmarks[0] ? {mundo:null, tela:r.landmarks[0]} : null); }};
    return CINE.detector;
  })().catch(e=>{ CINE.carregando = null; throw e; });
  return CINE.carregando;
}

function abrirAnalisador(exId){
  const ex = porId(exId), m = modeloCinesiologico(ex);
  if(!m || !m.pose){ aviso("Este exercício não tem análise de vídeo."); return; }
  CINE.ex = ex; CINE.resultado = null;
  abrirFolha("Avaliar a execução", `
    <p class="pequeno" style="margin:0"><b>${esc(ex.nome)}</b>: o analisador acompanha o ângulo do <b>${esc(m.pose.angulo)}</b> (${esc(ANGULOS_POSE[m.pose.angulo].desc)}) quadro a quadro e compara com o modelo: amplitude, cadência, consistência, simetria e tronco.</p>
    <ul class="pequeno suave" style="margin:0;padding-left:18px"><li>Grave ${esc(m.pose.vista)}, com o corpo inteiro no quadro, de 2 a 60 segundos.</li><li>Uma pessoa só no vídeo, boa luz, câmera parada.</li><li>Tudo roda neste aparelho: o vídeo não é enviado a lugar nenhum.</li></ul>
    <label class="campo">Vídeo<input type="file" accept="video/*" id="cinesioArquivo" data-campo="cinesio-arquivo"></label>
    <div id="cinesioArea"></div>`);
}

async function analisarArquivoVideo(arquivo){
  const area = $("cinesioArea"); if(!area || !arquivo) return;
  const ex = CINE.ex, m = modeloCinesiologico(ex);
  if(CINE.url) URL.revokeObjectURL(CINE.url);
  CINE.url = URL.createObjectURL(arquivo); CINE.cancelar = false;
  area.innerHTML = `<p class="pequeno" id="cinesioStatus" role="status">Carregando o modelo de pose…</p><button class="btn mini fantasma" type="button" data-acao="cinesio-cancelar">Cancelar</button>`;
  const status = t => { const el = $("cinesioStatus"); if(el) el.textContent = t; };
  let det;
  try{ det = await detectorPose(); }
  catch(e){ area.innerHTML = `<div class="aviso pequeno">Não foi possível carregar o modelo de pose aqui. Ele vem da internet (jsDelivr e Google) e funciona no app aberto pelo GitHub Pages ou por <code>npm run serve</code>; dentro do Claude, a página não tem acesso a esses arquivos.</div>`; return; }
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
  /* quadro de referência: o ponto mais fechado da primeira repetição */
  const alvo = res.reps.length ? quadros.reduce((b,q,i)=>{ const v = (res.serie[i]||[])[1]; return v!=null && q.t>=res.reps[0].t0 && q.t<=res.reps[0].t1 && (b==null || v<res.serie[b][1]) ? i : b; }, null) : null;
  const iRef = alvo!=null ? alvo : Math.floor(quadros.length/2);
  await ir(quadros[iRef].t);
  const cor = {ok:"var(--ok)", atencao:"var(--alerta)", problema:"var(--critico)"}, rot = {ok:"bom", atencao:"atenção", problema:"corrigir"};
  const pts = res.serie.filter(p=>p[1]!=null).map(([t,v])=>[t, v]);
  area.innerHTML = `
    <div class="cinesio-res">
      <figure class="cinesio-quadro"><canvas id="cinesioCanvas" aria-label="Quadro do vídeo com o esqueleto detectado"></canvas><figcaption class="pequeno suave">Ponto mais ${m.pose.inicio==="max"?"fechado":"aberto"} da 1ª repetição</figcaption></figure>
      <div class="pilha" style="gap:8px">
        <div class="linha" style="gap:10px;align-items:baseline"><span class="mc-valor" style="color:${cor[res.geral]}">${res.reps.length}</span><b>repetiç${res.reps.length===1?"ão":"ões"} · ${rot[res.geral]}</b></div>
        <ul class="notas-cinesio">${res.notas.map(n=>`<li><span class="selo" style="background:${cor[n.status]};color:var(--sobre-acento);border-color:transparent">${rot[n.status]}</span><div><b>${esc(n.criterio)}</b><p class="pequeno" style="margin:2px 0 0">${esc(n.texto)}</p></div></li>`).join("")}</ul>
      </div>
    </div>
    ${pts.length>3?`<div class="pilha" style="gap:4px"><span class="rot">ângulo do ${esc(res.angulo)} ao longo do vídeo</span>${grafLinha([{nome:"ângulo",cor:"var(--rosa)",pts:pts.map(([t,v])=>[t,v])}],{h:170,fmtX:v=>nf(v,1)+" s",fmtY:v=>Math.round(v)+"°",yRot:"graus",aria:"Ângulo da articulação ao longo do vídeo",numerico:true})}
      <p class="pequeno suave" style="margin:0">Faixa esperada: de ${m.pose.alvoMax}° a ${m.pose.alvoMin}°. ${res.cobertura}% dos quadros com a articulação visível.</p></div>`:""}
    ${res.reps.length?`<div class="rolar"><table class="tabela-pct"><thead><tr><th>rep</th><th>amplitude</th><th>de → até</th><th>descida</th><th>subida</th></tr></thead><tbody>${res.reps.map((r,i)=>`<tr><td class="num">${i+1}</td><td class="num">${r.amplitude}°</td><td class="num">${r.max}° → ${r.min}°</td><td class="num">${nfFix(r.excentrica,1)} s</td><td class="num">${nfFix(r.concentrica,1)} s</td></tr>`).join("")}</tbody></table></div>`:""}
    <p class="pequeno suave" style="margin:0">A estimativa de pose erra alguns graus, principalmente com roupa larga, pouca luz ou o corpo de frente para a câmera quando o movimento é de lado. Use como segunda opinião, não como laudo.</p>`;
  desenharEsqueleto($("cinesioCanvas"), video, quadros[iRef].tela, m.pose.angulo);
}

const LIGACOES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],[27,31],[28,32]];
function desenharEsqueleto(cv, video, tela, angulo){
  if(!cv) return;
  const w = video.videoWidth || 640, h = video.videoHeight || 360, esc_ = Math.min(1, 480/w);
  cv.width = Math.round(w*esc_); cv.height = Math.round(h*esc_);
  const g = cv.getContext("2d");
  try{ g.drawImage(video, 0, 0, cv.width, cv.height); }catch(e){ g.fillStyle = "#1d2026"; g.fillRect(0,0,cv.width,cv.height); }
  if(!tela) return;
  const P = i => ({x:tela[i].x*cv.width, y:tela[i].y*cv.height});
  g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,.9)";
  for(const [a,b] of LIGACOES){ if(!tela[a]||!tela[b]) continue; const A=P(a), B=P(b); g.beginPath(); g.moveTo(A.x,A.y); g.lineTo(B.x,B.y); g.stroke(); }
  const destaque = ANGULOS_POSE[angulo].pontos.flat();
  for(let i=11;i<33;i++){ if(!tela[i]) continue; const p = P(i); g.beginPath(); g.arc(p.x,p.y, destaque.includes(i)?7:4, 0, Math.PI*2); g.fillStyle = destaque.includes(i) ? "#e0326e" : "#fff"; g.fill(); }
}

const ACOES_CINESIO = {
  "cinesio-video": el=>abrirAnalisador(el.dataset.ex),
  "cinesio-cancelar": ()=>{ CINE.cancelar = true; }
};
const CAMPOS_CINESIO = {
  "cinesio-arquivo": (el, e)=>{ if(e.type==="change" && el.files && el.files[0]) analisarArquivoVideo(el.files[0]); return false; }
};
