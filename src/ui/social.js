/* =====================================================================
   INTERFACE DAS REDES — vídeos salvos, exercícios em alta, leitor de posts
   ===================================================================== */
const POST = {texto:"", url:"", leitura:null};
const fmtDataCurta = iso => iso ? dataCurta(iso) : "";
function videosDe(exId){ return (S.videos||[]).filter(v=>v.exId===exId); }

/* ---------- vídeos por exercício (folha do exercício) ---------- */
function linhaVideo(v){
  const ex = v.exId ? porId(v.exId) : null, rot = v.rotinaId && S.rotinas[v.rotinaId];
  return `<div class="linha-video"><span class="selo cheio">${esc(v.rede)}</span><span class="selo">${esc(v.tipo||"link")}</span>
    <span class="t">${esc(v.nota || (ex?ex.nome:rot?rot.nome:"Vídeo"))}</span>
    <a class="btn mini" href="${esc(v.url)}" target="_blank" rel="noopener">Abrir ↗</a>
    ${ex && modeloCinesiologico(ex) && modeloCinesiologico(ex).pose && !videoIncorporavel(v.url).erro ? `<button class="btn mini" type="button" data-acao="cinesio-video" data-ex="${ex.id}" data-url="${esc(v.url)}">Avaliar</button>` : ""}
    <button class="btn mini fantasma perigo" type="button" data-acao="video-remover" data-id="${v.id}" aria-label="Remover vídeo">✕</button></div>`;
}
function blocoVideosLista(ex){
  const vs = videosDe(ex.id);
  return vs.length ? `<div class="pilha" style="gap:6px">${vs.map(linhaVideo).join("")}</div>`
    : `<p class="pequeno suave" style="margin:0">Nenhum vídeo salvo para este exercício. Cole abaixo o link de um reel, TikTok ou vídeo do YouTube que mostre a execução.</p>`;
}
function blocoVideos(ex){
  return `<div class="pilha" style="gap:10px"><h3>Vídeos</h3>
    ${typeof classificar==="function" && classificar(ex) ? "" : blocoObservarVideos(ex)}
    <div class="linha">${linksBusca(ex).map(l=>`<a class="btn mini" href="${l.url}" target="_blank" rel="noopener">${l.rede} · ${esc(l.rot)} ↗</a>`).join("")}</div>
    ${ex.fonte && !classificar(ex)?`<p class="pequeno" style="margin:0"><span class="selo em-alta">em alta</span> ${esc(ex.fonte.origem)}</p>`:""}
    <div id="detVideos">${blocoVideosLista(ex)}</div>
    <div class="campos" style="grid-template-columns:2fr 1.4fr auto;align-items:end">
      <label class="campo">Link do vídeo<input type="text" id="vidUrl" inputmode="url" placeholder="https://www.instagram.com/reel/…"></label>
      <label class="campo">Nota (opcional)<input type="text" id="vidNota" maxlength="80" placeholder="Ex.: ótima dica de pegada"></label>
      <button class="btn mini primario" type="button" data-acao="video-salvar" data-ex="${ex.id}">Salvar vídeo</button>
    </div></div>`;
}

/* ---------- biblioteca: em alta e vídeos salvos ---------- */
function cartaoVideo(v){
  const ex = v.exId ? porId(v.exId) : null, rot = v.rotinaId && S.rotinas[v.rotinaId];
  const cor = {Instagram:"#c13584",TikTok:"#111318",YouTube:"#c4302b",X:"#24292f",Facebook:"#2d5bd1",Kwai:"#e86a17"}[v.rede] || "#5b616b";
  return `<article class="cartao">
    <a class="capa capa-video" href="${esc(v.url)}" target="_blank" rel="noopener" style="background:linear-gradient(135deg, ${cor}, #101216)">
      <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>
      <span class="rede-nome">${esc(v.rede)}</span><span class="rede-tipo">${esc(v.tipo||"link")} · abrir ↗</span></a>
    <div class="miolo">
      ${ex?`<button type="button" class="link-ex" data-acao="ver-ex" data-ex="${ex.id}">${esc(ex.nome)}</button>`:rot?`<b>${esc(rot.nome)}</b>`:`<b>Vídeo</b>`}
      ${v.nota?`<p class="pequeno" style="margin:0">${esc(v.nota)}</p>`:""}
      <div class="acao"><span class="pequeno suave">salvo ${fmtDataCurta(v.data)}</span><button class="btn mini fantasma perigo" type="button" data-acao="video-remover" data-id="${v.id}" aria-label="Remover vídeo">✕</button></div>
    </div></article>`;
}
function secaoVideosSalvos(){
  const vs = (S.videos||[]).slice().sort((a,b)=>(a.data||"")<(b.data||"")?1:-1);
  const porRede = {}; vs.forEach(v=>porRede[v.rede]=(porRede[v.rede]||0)+1);
  return `<section class="secao" id="secVideos"><div class="secao-titulo"><h2>Seus vídeos salvos</h2>
      <span class="pequeno suave">${vs.length?Object.entries(porRede).map(([r,n])=>`${n} ${esc(r)}`).join(" · "):"nenhum ainda"}</span></div>
    ${vs.length?`<div class="catalogo">${vs.map(cartaoVideo).join("")}</div>`
      :`<div class="vazio">Abra qualquer exercício e cole em <b>Vídeos</b> o link de um reel, TikTok ou vídeo do YouTube. Ele aparece aqui, ligado ao exercício, para você rever a execução antes da série.</div>`}
  </section>`;
}

/* ---------- plano: do post para a rotina ---------- */
function linhaPrevia(it, ri, ii){
  const ex = it.exId ? porId(it.exId) : null;
  const sugeridos = it.alternativas.filter(id=>porId(id)).slice(0,5);
  const opts = `<option value="">— ignorar esta linha —</option>`
    + (sugeridos.length?`<optgroup label="Mais parecidos">${sugeridos.map(id=>`<option value="${id}"${id===it.exId?" selected":""}>${esc(porId(id).nome)}</option>`).join("")}</optgroup>`:"")
    + `<optgroup label="Todos">${lib().filter(e=>!sugeridos.includes(e.id)).map(e=>`<option value="${e.id}"${e.id===it.exId?" selected":""}>${esc(e.nome)}</option>`).join("")}</optgroup>`;
  const confere = !it.exId ? `<span class="selo alerta-selo">sem par</span>` : it.confianca<0.7 ? `<span class="selo alerta-selo">confira</span>` : "";
  const num = (k,w,extra) => `<input type="number" value="${it[k]}" data-campo="post-item" data-r="${ri}" data-i="${ii}" data-k="${k}" style="width:${w}px" ${extra||""} aria-label="${k}">`;
  return `<tr class="${it.exId?"":"ignorada"}">
    <td style="min-width:220px"><div class="pequeno suave">«${esc(it.linha)}»</div>
      <div class="linha" style="gap:6px;flex-wrap:nowrap;margin-top:3px"><select data-campo="post-item" data-r="${ri}" data-i="${ii}" data-k="exId" aria-label="Exercício" style="min-width:0">${opts}</select>${confere}</div></td>
    <td>${num("series",52,'min="1" max="12"')}</td>
    <td style="white-space:nowrap">${num("repsMin",56,'min="1"')}–${num("repsMax",56,'min="1"')}${it.tempo?` <span class="pequeno suave">s</span>`:""}${it.falha?` <span class="pequeno suave">falha</span>`:""}</td>
    <td><input type="text" maxlength="1" value="${esc(it.superset||"")}" data-campo="post-item" data-r="${ri}" data-i="${ii}" data-k="superset" style="width:40px;text-transform:uppercase" aria-label="Superset"></td>
    <td>${num("descanso",64,`min="0" step="15" placeholder="${S.ajustes.descansoPadrao}"`).replace('value="null"','value=""')}</td>
    <td>${ex?seloRegiao(ex):""}</td></tr>`;
}
function previaPostHtml(){
  const L = POST.leitura;
  if(!L) return `<div class="vazio">Cole a legenda de um post de treino e toque em <b>Ler treino</b>. O leitor entende português, espanhol e inglês: “4x8-10”, “3 séries de 12”, “3 sets of 10”, “3x45s”, “12-10-8”, supersets “A1/A2”, “descanso 90s” e títulos de dia como “Dia 1 – Peito” ou “Day 2: Pull”.</div>`;
  if(!L.rotinas.length) return `<div class="aviso">Não encontrei nenhuma linha com séries e repetições. Confira se o texto tem algo como “4x10” ou “3 séries de 12”.</div>`;
  const nEx = L.rotinas.reduce((n,r)=>n+r.itens.filter(i=>i.exId).length,0);
  const nConf = L.rotinas.reduce((n,r)=>n+r.itens.filter(i=>!i.exId||i.confianca<0.7).length,0);
  return `<div class="pilha" style="gap:16px">
    <div class="linha entre"><span><b>${L.rotinas.length}</b> rotina${L.rotinas.length>1?"s":""} · <b>${nEx}</b> exercícios reconhecidos${nConf?` · <b style="color:var(--alerta)">${nConf}</b> para conferir`:""}</span>
      ${L.tags.length?`<span class="chips">${L.tags.slice(0,8).map(t=>`<span class="selo">#${esc(t)}</span>`).join("")}</span>`:""}</div>
    ${L.rotinas.map((r,ri)=>`<div class="leve pilha" style="gap:8px">
      <label class="campo">Nome da rotina<input type="text" value="${esc(r.nome)}" data-campo="post-rot" data-r="${ri}"></label>
      <div class="rolar"><table><thead><tr><th>linha do post → exercício</th><th>séries</th><th>reps</th><th>superset</th><th>descanso s</th><th>pico</th></tr></thead>
      <tbody>${r.itens.map((it,ii)=>linhaPrevia(it,ri,ii)).join("")}</tbody></table></div></div>`).join("")}
    ${L.ignoradas.length?`<details class="mais"><summary>${L.ignoradas.length} linha${L.ignoradas.length>1?"s":""} sem séries nem exercício</summary><ul class="pequeno suave" style="margin:8px 0 0;padding-left:18px">${L.ignoradas.map(l=>`<li>${esc(l)}</li>`).join("")}</ul></details>`:""}
    <div class="linha"><button class="btn primario" type="button" data-acao="post-criar">Criar ${L.rotinas.length} rotina${L.rotinas.length>1?"s":""}</button>
      <span class="pequeno suave">${POST.url&&urlValida(POST.url)?`O link do post (${esc(redeDe(urlValida(POST.url)))}) fica salvo junto.`:"Cole o link do post acima para guardá-lo junto com a rotina."}</span></div>
  </div>`;
}
function secaoImportarPost(){
  return `<section class="secao" id="secPost"><div class="secao-titulo"><h2>Do post para a rotina</h2><span class="pequeno suave">legendas de Instagram, TikTok ou qualquer rede</span></div>
    <div class="painel"><div class="corpo">
      <div class="grade" style="grid-template-columns:minmax(0,1fr)">
        <label class="campo">Texto do treino (copie a legenda do post)<textarea id="postTexto" data-campo="post-texto" rows="9" placeholder="Supino inclinado 4x8-10&#10;Remada apoiada 4x10&#10;Elevação lateral 3x15…">${esc(POST.texto)}</textarea></label>
        <div class="campos" style="grid-template-columns:minmax(0,2fr) auto;align-items:end">
          <label class="campo">Link do post (opcional)<input type="text" id="postUrl" data-campo="post-url" inputmode="url" value="${esc(POST.url)}" placeholder="https://www.instagram.com/p/…"></label>
          <div class="linha"><button class="btn primario" type="button" data-acao="post-ler">Ler treino</button><button class="btn" type="button" data-acao="post-exemplo">Colar exemplo</button>${POST.texto||POST.leitura?`<button class="btn fantasma" type="button" data-acao="post-limpar">Limpar</button>`:""}</div>
        </div>
      </div>
      <div id="postPrevia">${previaPostHtml()}</div>
    </div></div></section>`;
}

/* ---------- ações e campos ---------- */
const ACOES_SOCIAL = {
  "video-salvar": el=>{
    const ex = porId(el.dataset.ex), url = urlValida($("vidUrl").value);
    if(!url){ aviso("Cole um link completo, começando com https://"); return; }
    if((S.videos||[]).some(v=>v.url===url && v.exId===ex.id)){ aviso("Esse link já está salvo neste exercício."); return; }
    S.videos = S.videos||[];
    S.videos.push({id:uid("v"), exId:ex.id, url, rede:redeDe(url), tipo:tipoLink(url), nota:($("vidNota").value||"").trim().slice(0,80), data:isoDia(new Date())});
    salvar(); $("detVideos").innerHTML = blocoVideosLista(ex); $("vidUrl").value=""; $("vidNota").value="";
    if(tela==="biblioteca") renderBiblioteca();
    aviso("Vídeo salvo em "+ex.nome+".", true);
  },
  "video-remover": el=>{
    const v = (S.videos||[]).find(x=>x.id===el.dataset.id); if(!v) return;
    S.videos = S.videos.filter(x=>x.id!==v.id); salvar();
    const det = $("detVideos"); if(det && v.exId) det.innerHTML = blocoVideosLista(porId(v.exId));
    if(tela==="biblioteca") renderBiblioteca();
    aviso("Vídeo removido.");
  },
  "bib-redes": ()=>{ BIB.redes = !BIB.redes; BIB.limite = 24; renderBiblioteca(); },
  "bib-redes-todos": ()=>{ BIB.redes = true; BIB.grupo = ""; BIB.limite = 48; renderBiblioteca(); const l=$("listaBib"); l && l.scrollIntoView({behavior:"smooth", block:"start"}); },
  "post-exemplo": ()=>{ POST.texto = POST_EXEMPLO; POST.leitura = lerPost(POST.texto); renderPlano(); const s=$("secPost"); s && s.scrollIntoView({block:"start"}); aviso("Exemplo de legenda carregado. Ajuste o que quiser antes de criar."); },
  "post-limpar": ()=>{ POST.texto = ""; POST.url = ""; POST.leitura = null; renderPlano(); const s=$("secPost"); s && s.scrollIntoView({block:"start"}); },
  "post-ler": ()=>{
    POST.texto = $("postTexto").value; POST.url = $("postUrl").value.trim();
    if(!POST.texto.trim()){ aviso("Cole primeiro o texto do post."); return; }
    POST.leitura = lerPost(POST.texto);
    $("postPrevia").innerHTML = previaPostHtml();
    const n = POST.leitura.rotinas.length; aviso(n ? `${n} rotina${n>1?"s":""} encontrada${n>1?"s":""}. Confira os exercícios marcados.` : "Nenhuma série encontrada no texto.");
  },
  "post-criar": ()=>{
    const L = POST.leitura; if(!L) return;
    const url = urlValida(POST.url), rede = url ? redeDe(url) : null;
    const criadas = [];
    L.rotinas.forEach(r=>{
      const itens = r.itens.filter(i=>i.exId && porId(i.exId)).map(i=>{ const ex=porId(i.exId);
        return Object.assign({}, ITEM_PADRAO, {exId:i.exId, series:+i.series||3, repsMin:+i.repsMin||8, repsMax:Math.max(+i.repsMin||8, +i.repsMax||+i.repsMin||12),
          descanso: i.descanso==null||i.descanso===""?null:+i.descanso, superset:(i.superset||"").toUpperCase(), incremento: ex.tipo==="corporal"||ehTempo(ex)?0:2.5}); });
      if(!itens.length) return;
      const id = uid("r");
      S.rotinas[id] = {id, nome:r.nome||"Treino do post", itens, fonte:{url, rede, tags:L.tags.slice(0,12)}};
      criadas.push(id);
    });
    if(!criadas.length){ aviso("Nenhuma linha está ligada a um exercício. Escolha os exercícios na prévia."); return; }
    if(url){ S.videos = S.videos||[]; S.videos.push({id:uid("v"), exId:null, rotinaId:criadas[0], url, rede, tipo:tipoLink(url), nota:"Post do treino “"+S.rotinas[criadas[0]].nome+"”", data:isoDia(new Date())}); }
    salvar(); POST.texto=""; POST.url=""; POST.leitura=null; renderPlano();
    const el = document.getElementById("rot-"+criadas[0]); el && el.scrollIntoView({behavior:"smooth", block:"start"});
    aviso(`${criadas.length} rotina${criadas.length>1?"s":""} criada${criadas.length>1?"s":""}. Coloque na semana em Dias de treino.`, true);
  }
};
const CAMPOS_SOCIAL = {
  "post-texto": el=>{ POST.texto = el.value; return false; },
  "post-url": el=>{ POST.url = el.value.trim(); return false; },
  "post-rot": el=>{ POST.leitura.rotinas[+el.dataset.r].nome = el.value; return false; },
  "post-item": el=>{
    const it = POST.leitura.rotinas[+el.dataset.r].itens[+el.dataset.i], k = el.dataset.k;
    if(k==="exId"){ it.exId = el.value; it.confianca = el.value ? 1 : 0; $("postPrevia").innerHTML = previaPostHtml(); return false; }
    if(k==="superset") it.superset = el.value.toUpperCase().slice(0,1);
    else it[k] = el.value==="" ? (k==="descanso"?null:"") : +el.value;
    return false;
  }
};
