/* =====================================================================
   TELAS — Hoje, Plano, Biblioteca, Progresso, Laboratório, Ajustes
   ===================================================================== */

/* ---------- HOJE ---------- */
function linhaAlvo(item, ex){
  const alvo = alvoProgressao(item, historicoEx(S, item.exId), ex);
  const faixa = item.repsMin===item.repsMax ? item.repsMin : item.repsMin+"–"+item.repsMax;
  const un = ehTempo(ex) ? " s" : "";
  const kgTxt = alvo.kg!=null && !ehTempo(ex) ? (ex.tipo==="corporal" ? (alvo.kg>0?" · +"+nf(alvo.kg,2)+" kg":" · corpo") : " · "+nf(alvo.kg,2)+" kg") : "";
  return {alvo, txt:`${item.series} × ${faixa}${un}${kgTxt}`};
}
function numerosHeroi(){
  const hoje = new Date(), corte30 = isoDia(somaDias(hoje,-29));
  const ordem = ordemSemana(S.ajustes.inicioSemana);
  const iniSem = isoDia(somaDias(hoje, -((hoje.getDay()-ordem[0]+7)%7)));
  let n30=0, Jsem=0, seriesSem=0;
  const semanasCom = new Set();
  for(const t of S.treinos){
    const k=t.data.slice(0,10);
    if(k>=corte30) n30++;
    if(k>=iniSem){ const r=resumoTreino(t); Jsem+=r.J; seriesSem+=r.series; }
    semanasCom.add(semanaDe(deIso(k)));
  }
  let seq=0; for(let i=0;i<104;i++){ const w=semanaDe(somaDias(hoje,-7*i)); if(semanasCom.has(w)) seq++; else if(i>0) break; }
  return `<div class="numeros">
    <div><b>${n30}</b><span>treinos em 30 dias</span></div>
    <div><b>${nfFix(Jsem/1000,1)}</b><span>kJ nesta semana</span></div>
    <div><b>${seriesSem}</b><span>séries nesta semana</span></div>
    <div><b>${seq}</b><span>semana${seq===1?"":"s"} seguida${seq===1?"":"s"}</span></div></div>`;
}
function cartoesSessao(rid){
  const R0 = S.rotinas[rid]; let Jest = 0;
  const cards = R0.itens.map(item=>{
    const ex = porId(item.exId); if(!ex) return "";
    const {alvo, txt} = linhaAlvo(item, ex);
    const kg = alvo.kg!=null ? alvo.kg : (ex.tipo==="corporal" ? 0 : (ex.carga||0)*0.6);
    Jest += trabalhoSerie(ex, kg, alvo.reps)*item.series;
    const seta = alvo.tipo==="subir" ? `<span class="selo" style="background:var(--ok);color:var(--sobre-acento);border-color:transparent">▲ sobe a carga</span>`
               : alvo.tipo==="deload" ? `<span class="selo" style="background:var(--critico);color:var(--sobre-acento);border-color:transparent">▼ deload</span>` : "";
    return `<button type="button" class="cartao" data-acao="ver-ex" data-ex="${ex.id}">${capaEx(ex)}<div class="miolo">
      <h3>${esc(ex.nome)}</h3><div class="meta"><b class="mono">${txt}</b></div>
      <p class="pequeno suave" style="margin:0">${esc(alvo.porque)}</p>${seta?`<div>${seta}</div>`:""}</div></button>`;
  }).join("");
  return {cards, Jest};
}
function renderHoje(){
  const hoje = new Date(), k = isoDia(hoje);
  const rid = rotinaDoDia(S, hoje), R0 = rid && S.rotinas[rid];
  const feitos = S.treinos.filter(t=>t.data.slice(0,10)===k);
  const prox = proximaSessao(S, hoje);
  const opcoesRot = Object.values(S.rotinas).map(r=>`<option value="${r.id}">${esc(r.nome)}</option>`).join("");
  let titulo, texto, acoes, sessao = null;
  if(S.ativo){
    titulo = S.ativo.nome; texto = `Treino em andamento desde ${new Date(S.ativo.inicio).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}. As séries marcadas já estão guardadas.`;
    acoes = `<button class="btn primario grande" type="button" data-acao="abrir-treino">Continuar treino</button>`;
  } else if(R0){
    sessao = cartoesSessao(rid);
    titulo = R0.nome;
    texto = `${R0.itens.length} exercícios. Trabalho mecânico previsto com as cargas sugeridas: ${fmtJ(sessao.Jest)}.${feitos.length?" Você já registrou um treino hoje.":""}`;
    acoes = `<button class="btn primario grande" type="button" data-acao="iniciar" data-rotina="${rid}">Começar treino</button>
      <button class="btn" type="button" data-acao="mover-sessao" data-rotina="${rid}">Mover para outro dia</button>`;
  } else {
    titulo = feitos.length ? "Treino feito" : "Dia de descanso";
    texto = feitos.length ? `Registrado hoje: ${feitos.map(t=>esc(t.nome)).join(", ")}.`
      : prox ? `Próxima sessão: ${esc(S.rotinas[prox.rotinaId].nome)} ${prox.emDias===1?"amanhã":"em "+prox.emDias+" dias"} (${DIAS[prox.data.getDay()].toLowerCase()}).` : "Monte sua semana em Plano ou escolha um programa pronto.";
    acoes = `<select id="rotinaLivre" aria-label="Rotina" style="max-width:260px"><option value="">Treino livre (sem rotina)</option>${opcoesRot}</select>
      <button class="btn primario" type="button" data-acao="iniciar-escolhido">Treinar mesmo assim</button>`;
  }
  /* semana */
  const ordem = ordemSemana(S.ajustes.inicioSemana);
  const ini = somaDias(hoje, -((hoje.getDay() - ordem[0] + 7) % 7));
  const diasSem = ordem.map((_,i)=>{
    const d = somaDias(ini,i), kk = isoDia(d), r = rotinaDoDia(S,d);
    const feito = S.treinos.some(t=>t.data.slice(0,10)===kk);
    return `<div class="dia${kk===k?" hoje":""}${feito?" feito":""}" title="${feito?"treino registrado":""}"><div class="d">${DIAS_C[d.getDay()]} ${d.getDate()}</div><div class="n">${r&&S.rotinas[r]?esc(S.rotinas[r].nome):"—"}</div></div>`;
  }).join("");
  /* peso */
  const pesos = S.peso.slice().sort((a,b)=>a.data<b.data?-1:1);
  const ult = pesos[pesos.length-1];
  const ref7 = pesos.filter(p=>p.data<=isoDia(somaDias(hoje,-7))).pop();
  const delta = ult && ref7 ? ult.kg-ref7.kg : null;
  const pts = pesos.filter(p=>p.data>=isoDia(somaDias(hoje,-60))).map(p=>[deIso(p.data), p.kg]);
  /* recuperação */
  const rec = recuperacao(S, hoje);
  const corRec = m => { const r=rec[m]; if(!r||r.diasSem==null) return "var(--papel2)";
    return r.recuperado<50 ? misturar("var(--critico)",80) : r.recuperado<85 ? misturar("var(--alerta)",75) : misturar("var(--ok)",65); };
  const recuperando = Object.entries(rec).filter(([,v])=>v.diasSem!=null && v.recuperado<85).sort((a,b)=>a[1].recuperado-b[1].recuperado).slice(0,4);
  const ultimos = S.treinos.slice().sort((a,b)=>a.data<b.data?1:-1).slice(0,4);
  $("tela-hoje").innerHTML = `
    <section class="heroi">${arteHeroi()}
      <div><span class="rot">${dataLonga(hoje)}${S.perfil.nome?" · "+esc(S.perfil.nome):""}</span>
        <h1>${esc(titulo)}</h1><p>${texto}</p><div class="acoes">${acoes}</div></div>
      ${numerosHeroi()}
    </section>
    ${sessao?`<section class="secao"><div class="secao-titulo"><h2>Exercícios de hoje</h2><a href="#plano" data-ir="plano">editar rotina →</a></div>
      <div class="catalogo">${sessao.cards}</div>
      <details class="mais"><summary>Trocar a rotina só hoje</summary><div class="linha" style="margin-top:8px">
        <select id="trocaHoje" aria-label="Rotina para hoje" style="max-width:280px"><option value="">Descanso</option>${opcoesRot}</select>
        <button class="btn mini" type="button" data-acao="trocar-hoje">Aplicar</button></div></details></section>`:""}
    ${R0 && !S.ativo ? secaoSugestoesHoje(rid) : ""}
    <section class="secao"><div class="secao-titulo"><h2>Sua semana</h2><a href="#plano" data-ir="plano">ver plano →</a></div>
      <div class="painel"><div class="corpo"><div class="semana">${diasSem}</div></div></div></section>
    <div class="grade g-21" style="margin-top:34px">
      <div class="pilha" style="gap:14px">
        <div class="secao-titulo"><h2>Últimos treinos</h2><a href="#progresso" data-ir="progresso">histórico completo →</a></div>
        ${ultimos.length?`<div class="catalogo largo">${ultimos.map(t=>{const r=resumoTreino(t); return `<button type="button" class="cartao" data-acao="ver-treino" data-id="${t.id}">${capaRotina(t.itens, dataCurta(t.data))}<div class="miolo">
          <h3>${esc(t.nome)}</h3><div class="meta"><span>${dataCurta(t.data)}</span><span><b>${r.series}</b> séries</span><span><b>${fmtT(r.volume)}</b></span><span><b>${fmtJ(r.J)}</b></span></div>${tresFatias(r.regioes)}</div></button>`;}).join("")}</div>`
          :`<div class="vazio">Nenhum treino registrado ainda. O primeiro aparece aqui assim que você finalizar.</div>`}
      </div>
      <div class="pilha" style="gap:18px">
        ${painelCargaSemana()}
        <div class="painel"><div class="cab"><h3>Peso corporal</h3><span class="rot">${ult?dataCurta(ult.data):""}</span></div><div class="corpo">
          <div><span class="kpi" style="display:inline;border:0;padding:0;box-shadow:none;background:none"><span class="v">${ult?nfFix(ult.kg,1):"—"}</span> <span class="u">kg</span></span>
            <div class="pequeno suave">${delta!=null?(delta>0?"+":"")+nfFix(delta,1)+" kg em 7 dias":"registre para acompanhar"}${S.perfil.metaPeso?` · meta ${nf(S.perfil.metaPeso,1)} kg`:""}</div></div>
          ${pts.length>1?grafLinha([{nome:"peso",cor:"var(--azul)",pts}],{w:440,h:170,meta:S.perfil.metaPeso||null,fmtY:v=>nf(v,1),aria:"Peso corporal nos últimos 60 dias"}):""}
          <form class="linha" data-form="peso" style="align-items:flex-end"><label class="campo" style="flex:1">Peso de hoje (kg)<input type="number" id="pesoHoje" step="0.1" min="20" max="400" inputmode="decimal" placeholder="${ult?nfFix(ult.kg,1).replace(",","."):"78.0"}"></label>
            <button class="btn" type="submit">Registrar</button></form>
        </div></div>
        <div class="painel"><div class="cab"><h3>Recuperação</h3><span class="rot">estimativa</span></div><div class="corpo">
          ${mapaCorpo(corRec,{dica:m=>{const r=rec[m]; return r.diasSem==null?"sem registro":Math.round(r.recuperado)+"% recuperado, último treino há "+r.diasSem+" dia(s)";}})}
          <div class="legenda"><span><i style="background:${misturar("var(--critico)",80)}"></i>&lt;50%</span><span><i style="background:${misturar("var(--alerta)",75)}"></i>50–85%</span><span><i style="background:${misturar("var(--ok)",65)}"></i>recuperado</span></div>
          <p class="pequeno">${recuperando.length?"Ainda recuperando: "+recuperando.map(([m,v])=>`${esc(MUSCULOS[m].nome)} (${Math.round(v.recuperado)}%)`).join(", ")+".":"Tudo recuperado para a próxima sessão."}</p>
        </div></div>
      </div>
    </div>`;
}

/* ---------- PLANO ---------- */
function analisePlano(){
  const musc = {}, cob = {};
  let sessoes = 0;
  for(let d=0; d<7; d++){
    const r = S.rotinas[S.semana[d]]; if(!r) continue; sessoes++;
    for(const item of r.itens){
      const ex = porId(item.exId); if(!ex) continue;
      const {primarios, secundarios} = identificarMusculos(ex);
      primarios.forEach(m=>musc[m]=(musc[m]||0)+item.series);
      secundarios.forEach(m=>musc[m]=(musc[m]||0)+item.series*0.5);
      const pf = perfil(ex); if(!pf || ehTempo(ex)) continue;
      const h = historicoEx(S, ex.id)[0];
      const kg = h ? Math.max(...h.series.map(s=>+s.kg||0)) : (ex.tipo==="corporal"?0:(ex.carga||0)*0.6);
      const J = trabalhoSerie(ex, kg, (item.repsMin+item.repsMax)/2)*item.series;
      const g = cob[ex.grupo] = cob[ex.grupo] || {J:0, fr:[0,0,0], exs:new Set(), rotinas:new Set()};
      g.J += J; pf.fracoes.forEach((f,i)=>g.fr[i]+=f*J); g.exs.add(ex.id); g.rotinas.add(r.id);
    }
  }
  Object.values(cob).forEach(g=>{ const t=g.fr[0]+g.fr[1]+g.fr[2]||1; g.fr=g.fr.map(v=>v/t); });
  return {musc, cob, sessoes};
}
function estimarPrograma(P){
  let J=0; const fr=[0,0,0];
  for(const k of Object.values(P.semana)){ const r=P.rotinas[k]; if(!r) continue;
    for(const item of r.itens){ const ex=porId(item.exId); if(!ex||ehTempo(ex)) continue; const pf=perfil(ex); if(!pf) continue;
      const kg = ex.tipo==="corporal" ? 0 : (ex.carga||0)*0.6;
      const j = trabalhoSerie(ex, kg, (item.repsMin+item.repsMax)/2)*item.series; J+=j; pf.fracoes.forEach((f,i)=>fr[i]+=f*j); } }
  const t=fr[0]+fr[1]+fr[2]||1; return {J, fr:fr.map(v=>v/t)};
}
function cartaoPrograma(k, P){
  const est = estimarPrograma(P);
  const todos = Object.values(P.rotinas).flatMap(r=>r.itens);
  return `<article class="cartao">${capaRotina(todos, P.objetivo)}<div class="miolo">
    <div class="linha" style="gap:6px"><span class="selo cheio">${esc(P.objetivo)}</span>${P.redes?`<span class="selo em-alta">das redes</span>`:""}${(P.tags||[]).slice(0,1).map(t=>`<a class="selo" href="https://www.instagram.com/explore/tags/${encodeURIComponent(t)}/" target="_blank" rel="noopener" title="Buscar no Instagram">#${esc(t)} ↗</a>`).join("")}</div>
    <h3>${esc(P.nome)}</h3>
    <div class="ficha-prog"><div><span>Nível</span><b>${esc(P.nivel)}</b></div><div><span>Dias por semana</span><b>${P.dias}</b></div>
      <div><span>Sessão</span><b>${esc(P.duracao)}</b></div><div><span>Trabalho semanal</span><b>≈ ${fmtJ(est.J)}</b></div></div>
    <p class="pequeno suave" style="margin:0">${esc(P.desc)} Rotinas: ${Object.values(P.rotinas).map(r=>esc(r.nome)).join(", ")}.</p>
    <div class="pilha" style="gap:4px"><span class="rot">onde cai a tensão</span>${tresFatias(est.fr)}</div>
    <div class="acao"><button class="btn primario mini" type="button" data-acao="plano-aplicar-conf" data-k="${k}">Usar programa</button><button class="btn mini" type="button" data-acao="programa-ver" data-k="${k}">Ver rotinas</button></div>
  </div></article>`;
}
function renderPlano(){
  const ordem = ordemSemana(S.ajustes.inicioSemana);
  const rotinas = Object.values(S.rotinas);
  const opc = sel => `<option value="">Descanso</option>`+rotinas.map(r=>`<option value="${r.id}"${r.id===sel?" selected":""}>${esc(r.nome)}</option>`).join("");
  const hojeK = isoDia(new Date());
  const trocas = Object.entries(S.trocas||{}).filter(([k])=>k>=hojeK).sort();
  const regra = {dupla:"dupla progressão", linear:"linear", nenhuma:"sem regra"};
  const cards = rotinas.map(r=>`
    <div class="painel" id="rot-${r.id}"><div style="height:86px;overflow:hidden;border-radius:var(--raio) var(--raio) 0 0">${capaRotina(r.itens, r.nome).replace('class="capa"','class="capa" style="aspect-ratio:auto;height:86px;border-radius:0"')}</div>
      <div class="cab"><input type="text" value="${esc(r.nome)}" data-campo="rotina-nome" data-rotina="${r.id}" aria-label="Nome da rotina" style="font-family:var(--f-display);font-weight:700;text-transform:uppercase;font-size:20px;max-width:340px">
      <span class="linha" style="gap:8px">${r.fonte&&r.fonte.url?`<a class="selo cheio" href="${esc(r.fonte.url)}" target="_blank" rel="noopener">post no ${esc(r.fonte.rede)} ↗</a>`:r.fonte?`<span class="selo em-alta">do post</span>`:""}<span class="rot">${r.itens.length} exercícios</span></span></div>
    <div class="corpo">
      ${r.itens.length?`<div class="rolar"><table class="tabela-rotina"><thead><tr><th>exercício</th><th>séries</th><th>reps (mín–máx)</th><th>descanso s</th><th>progressão</th><th>+kg</th><th>superset</th><th></th></tr></thead><tbody>
      ${r.itens.map((item,i)=>{ const ex=porId(item.exId); if(!ex) return "";
        const inp=(k,w,extra)=>`<input type="number" value="${item[k]==null?"":item[k]}" data-campo="item" data-rotina="${r.id}" data-i="${i}" data-k="${k}" style="width:${w}px" ${extra||""} aria-label="${k}">`;
        return `<tr><td style="min-width:200px"><div class="linha" style="flex-wrap:nowrap">${letraEx(ex)}<button type="button" class="btn fantasma mini" data-acao="ver-ex" data-ex="${ex.id}" style="text-align:left;font-family:var(--f-corpo);font-size:13.5px;letter-spacing:0;border:0;padding:2px 0">${esc(ex.nome)}</button></div><div class="linha" style="gap:4px;margin-top:2px">${seloRegiao(ex)}</div></td>
          <td>${inp("series",52,'min="1" max="12"')}</td><td style="white-space:nowrap">${inp("repsMin",52,'min="1"')}–${inp("repsMax",52,'min="1"')}</td>
          <td>${inp("descanso",64,`min="0" step="15" placeholder="${S.ajustes.descansoPadrao}"`)}</td>
          <td><select data-campo="item" data-rotina="${r.id}" data-i="${i}" data-k="progressao" aria-label="Regra de progressão" style="width:auto">${Object.entries(regra).map(([v,t])=>`<option value="${v}"${(item.progressao||"dupla")===v?" selected":""}>${t}</option>`).join("")}</select></td>
          <td>${inp("incremento",58,'min="0" step="0.5"')}</td>
          <td><input type="text" maxlength="1" value="${esc(item.superset||"")}" data-campo="item" data-rotina="${r.id}" data-i="${i}" data-k="superset" style="width:40px;text-transform:uppercase" aria-label="Letra do superset"></td>
          <td style="white-space:nowrap"><button class="btn mini fantasma" type="button" data-acao="item-mover" data-rotina="${r.id}" data-i="${i}" data-d="-1" aria-label="Subir">↑</button><button class="btn mini fantasma" type="button" data-acao="item-mover" data-rotina="${r.id}" data-i="${i}" data-d="1" aria-label="Descer">↓</button><button class="btn mini fantasma perigo" type="button" data-acao="item-remover" data-rotina="${r.id}" data-i="${i}" aria-label="Remover">✕</button></td></tr>`;}).join("")}
      </tbody></table></div>`:`<div class="vazio">Sem exercícios ainda.</div>`}
      ${linhaSugestaoRotina(r)}
      <div class="linha"><button class="btn primario mini" type="button" data-acao="item-adicionar" data-rotina="${r.id}">+ exercício</button>
        <button class="btn mini" type="button" data-acao="iniciar" data-rotina="${r.id}">Treinar agora</button>
        <button class="btn mini" type="button" data-acao="rotina-duplicar" data-rotina="${r.id}">Duplicar</button>
        <button class="btn mini" type="button" data-acao="rotina-compartilhar" data-rotina="${r.id}">Compartilhar</button>
        <button class="btn mini perigo" type="button" data-acao="rotina-excluir" data-rotina="${r.id}">Excluir</button></div>
      <p class="pequeno suave">Letras iguais em “superset” encadeiam os exercícios sem descanso entre eles. A regra de progressão decide a carga sugerida no próximo treino.</p>
    </div></div>`).join("");
  const an = analisePlano();
  const muscOrd = Object.keys(MUSCULOS).filter(m=>an.musc[m]).sort((a,b)=>an.musc[b]-an.musc[a]);
  const lacunas = Object.entries(an.cob).map(([g,v])=>{ const i=v.fr.indexOf(Math.min(...v.fr)); return {g,v,i,falta:v.fr[i]<0.15}; });
  $("tela-plano").innerHTML = `
    <div class="tela-cab"><div><h1>Plano</h1><p class="suave">Uma rotina por dia da semana. A análise no fim confere volume por músculo e onde, na amplitude, cada grupo recebe tensão.</p></div>
      <div class="linha"><button class="btn primario" type="button" data-acao="rotina-nova">Nova rotina</button><button class="btn" type="button" data-acao="rotina-importar">Importar rotina</button></div></div>
    <section class="secao" style="margin-top:0"><div class="secao-titulo"><h2>Programas prontos</h2><span class="pequeno suave">trabalho estimado com as cargas de referência da biblioteca</span></div>
      <div class="catalogo quatro">${Object.entries(PLANOS_PRONTOS).map(([k,P])=>cartaoPrograma(k,P)).join("")}</div></section>
    ${secaoImportarPost()}
    <div class="secao-titulo" style="margin-top:34px;margin-bottom:14px"><h2>Sua semana</h2></div>
    <div class="pilha" style="gap:18px">
      <div class="painel"><div class="cab"><h3>Dias de treino</h3><span class="rot">${an.sessoes} sessões</span></div><div class="corpo">
        <div class="campos" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">${ordem.map(d=>`<label class="campo">${DIAS[d]}<select data-campo="semana" data-dia="${d}">${opc(S.semana[d])}</select></label>`).join("")}</div>
        ${trocas.length?`<div class="pilha" style="gap:4px"><span class="rot">mudanças pontuais</span>${trocas.map(([k,v])=>`<div class="linha pequeno"><span class="mono">${dataCurta(k)}</span><span>${v&&S.rotinas[v]?esc(S.rotinas[v].nome):"descanso"}</span><button class="btn mini fantasma" type="button" data-acao="troca-desfazer" data-dia="${k}">desfazer</button></div>`).join("")}</div>`:""}
      </div></div>
      <div class="secao-titulo" style="margin-top:16px"><h2>Suas rotinas</h2><button class="link" type="button" data-acao="rotina-nova">+ nova rotina</button></div>
      ${cards || `<div class="vazio">Nenhuma rotina. Crie uma ou use um programa pronto acima.</div>`}
      <div class="secao-titulo" style="margin-top:16px"><h2>Análise do plano</h2></div>
      <div class="painel"><div class="cab"><h3>Volume e amplitude</h3><span class="rot">por semana</span></div><div class="corpo">
        ${muscOrd.length?`<div class="grade g2">
          <div class="pilha"><span class="rot">séries semanais por músculo (secundário conta meia)</span>
            ${grafBarras(muscOrd.map(m=>({rot:MUSCULOS[m].nome.split(" ")[0].slice(0,9), v:an.musc[m], dica:`${MUSCULOS[m].nome}: ${nf(an.musc[m],1)} séries`, cor: an.musc[m]<10?"var(--mostarda)":an.musc[m]>20?"var(--critico)":"var(--ok)"})),{h:220,faixa:[10,20],fmtY:v=>nf(v),aria:"Séries semanais por músculo"})}
            <p class="pequeno suave">A faixa verde marca 10–20 séries semanais, intervalo comum em recomendações de hipertrofia. Amarelo fica abaixo, vermelho acima.</p></div>
          <div class="pilha"><span class="rot">onde cai o trabalho de cada grupo</span>${legendaFatias}
            ${lacunas.map(({g,v,i,falta})=>{ const sug = falta ? sugerirParaRegiao(g,i,v.exs) : null; const rotAlvo=[...v.rotinas][0];
              return `<div class="pilha" style="gap:3px"><div class="linha entre pequeno"><b>${esc(g)}</b><span class="mono suave">${fmtJ(v.J)}</span></div>${tresFatias(v.fr)}
              ${sug?`<div class="linha pequeno"><span>Pouca tensão no <b>${NOMES_REGIAO[i]}</b>. ${esc(sug.nome)} carrega essa parte.</span><button class="btn mini" type="button" data-acao="add-sugestao" data-rotina="${rotAlvo}" data-ex="${sug.id}">adicionar a ${esc(S.rotinas[rotAlvo].nome)}</button></div>`:""}</div>`;}).join("")}
          </div></div>`:`<div class="vazio">Coloque rotinas na semana para ver a análise.</div>`}
      </div></div>
    </div>`;
}

/* ---------- BIBLIOTECA ---------- */
const BIB = {busca:"", grupo:"", equip:"", musc:"", meus:false, redes:false, limite:24};
function filtrarBiblioteca(){
  const meus = BIB.meus && S.ajustes.equipFiltro.length ? new Set(S.ajustes.equipFiltro) : null;
  /* a busca usa o mesmo motor da autossugestão: nome, apelidos em inglês e espanhol, gírias */
  let ordem = null;
  if(BIB.busca.trim()){
    ordem = new Map(sugerir(BIB.busca, {limite:80, semGrupos:true, semTemas:true}).filter(x=>x.tipo==="ex").map((x,i)=>[x.ex.id, i]));
    const q = normNome(BIB.busca);
    lib().forEach(e=>{ if(!ordem.has(e.id) && (normNome(e.nome).includes(q) || normNome(e.grupo).includes(q))) ordem.set(e.id, 900+ordem.size); });
  }
  let l = lib().filter(ex=>{
    if(BIB.grupo && ex.grupo!==BIB.grupo) return false;
    if(BIB.redes && !emAlta(ex)) return false;
    if(BIB.equip && equipamento(ex)!==BIB.equip) return false;
    if(meus && !meus.has(equipamento(ex))) return false;
    if(ordem && !ordem.has(ex.id)) return false;
    if(BIB.musc){ const m=identificarMusculos(ex); if(!m.primarios.includes(BIB.musc) && !m.secundarios.includes(BIB.musc)) return false; }
    return true;
  });
  if(ordem) l.sort((a,b)=>ordem.get(a.id)-ordem.get(b.id));
  else if(BIB.redes) l.sort((a,b)=>((classificar(b)||{}).termometro||0)-((classificar(a)||{}).termometro||0));
  if(BIB.musc && !ordem) l.sort((a,b)=>(identificarMusculos(b).primarios.includes(BIB.musc)?1:0)-(identificarMusculos(a).primarios.includes(BIB.musc)?1:0));
  return l;
}
function listaBibliotecaHtml(){
  const l = filtrarBiblioteca();
  return `<div class="secao-titulo" style="margin-bottom:12px"><h2>${BIB.grupo?esc(BIB.grupo):BIB.musc?esc(MUSCULOS[BIB.musc].nome):BIB.redes?"Em alta nas redes":"Todos os exercícios"}</h2>
      <span class="pequeno suave">${l.length} de ${lib().length}${BIB.musc&&BIB.grupo?` · trabalham ${esc(MUSCULOS[BIB.musc].nome)}`:""}</span></div>
    <div class="catalogo">${l.slice(0,BIB.limite).map(ex=>`<button type="button" class="cartao" data-acao="ver-ex" data-ex="${ex.id}">${capaEx(ex)}<div class="miolo">
      <h3>${esc(ex.nome)}</h3><div class="meta"><span>${esc(ex.grupo)}</span><span>${equipamento(ex)}</span>${ehTempo(ex)?"<span>por tempo</span>":""}${seloAlta(ex)}${videosDe(ex.id).length?`<span><b>▶ ${videosDe(ex.id).length}</b></span>`:""}</div>
      <div>${fichaMusc(ex,true)}</div></div></button>`).join("") || `<div class="vazio">Nada com esses filtros.</div>`}</div>
    ${l.length>BIB.limite?`<div class="linha" style="justify-content:center;margin-top:18px"><button class="btn" type="button" data-acao="bib-mais">Mostrar mais ${Math.min(24,l.length-BIB.limite)} de ${l.length-BIB.limite} restantes</button></div>`:""}`;
}
const FAQ = [
  ["O que é torque num exercício?","É a tendência de uma carga girar a articulação: força vezes a distância perpendicular entre a linha da força e o eixo. Essa distância, o braço de momento, muda a cada ângulo da repetição. Por isso o mesmo peso pesa diferente no começo e no fim do movimento."],
  ["Por que medir o treino em joules e não só em quilos?","Volume em quilos (carga × repetições) ignora a alavanca. Cem quilos num encolhimento e cem quilos num supino pedem trabalhos muito diferentes da articulação. O trabalho em joules é a área sob a curva de torque, então leva em conta amplitude e braço de momento."],
  ["O que significam pico alongado, meio e encurtado?","São três fatias da amplitude. Alongado é o começo da subida, com o músculo esticado; encurtado é o fim, com ele contraído. O selo mostra onde está o pico de torque. Combinar exercícios com picos diferentes cobre a amplitude inteira."],
  ["Como a nota de A a E é calculada?","Ela compara o exercício com os outros do mesmo grupo: metade vem do estímulo por quilo de carga, um quarto da consistência da curva (tensão bem distribuída) e um quarto do aproveitamento da amplitude articular disponível."],
  ["Como a carga sugerida é decidida?","Pela regra de progressão de cada exercício na rotina. Na dupla progressão, a carga sobe quando todas as séries chegam ao topo da faixa de repetições. Na linear, sobe quando todas batem o alvo. Repetição perdida nunca soma carga, e três sessões seguidas abaixo do alvo disparam um deload de 10%."],
  ["O que são RIR e RPE?","RIR é quantas repetições ainda sobravam no fim da série. RPE é a mesma ideia numa escala de 0 a 10, em que 10 é a falha. O app guarda RIR e converte quando você prefere RPE; o valor entra na estimativa de 1RM."],
  ["Como o 1RM é estimado?","Pela fórmula de Epley: carga × (1 + repetições ÷ 30), somando às repetições as que sobraram (RIR) quando você as registra. Em exercícios com peso do corpo, a conta usa a fração do seu peso mais a carga extra."],
  ["O mapa de recuperação é uma medida do corpo?","Não. Cada série deixa uma fadiga que diminui com o tempo, com meia-vida de cerca de 21 horas. É uma contabilidade para ajudar a planejar, não um diagnóstico."],
  ["Dá para assistir aos reels dentro do app?","Não. Instagram e TikTok não deixam outros sites lerem ou incorporarem os vídeos. O app guarda o link, abre a busca da hashtag na rede e lê o texto da legenda que você colar em Plano, em “Do post para a rotina”."],
  ["Como entram os exercícios que viralizam?","Cada um ganha uma alavanca (articulação, ângulos e direção da força) e passa pela mesma conta de torque dos outros. Por isso dá para comparar no laboratório se a moda carrega mesmo o músculo alongado, como costuma prometer."],
  ["Onde ficam meus dados?","Neste navegador, sem servidor. Use Ajustes para exportar um backup em JSON ou importar treinos do Strong, Hevy e FitNotes."]
];
function renderBiblioteca(){
  const cont = {}; lib().forEach(e=>cont[e.grupo]=(cont[e.grupo]||0)+1);
  const corM = m => m===BIB.musc ? "var(--rosa)" : "var(--papel2)";
  const tile = (g, n) => { const ex = lib().filter(e=>e.grupo===g && temPerfil(e)).sort((a,b)=>(avaliar(b)||{nota:0}).nota-(avaliar(a)||{nota:0}).nota)[0];
    return `<button type="button" class="tile" data-acao="bib-grupo" data-g="${esc(g)}" aria-pressed="${BIB.grupo===g}">${arteCurvas([ex?perfil(ex).forma:null], corGrupo(g), 200, 150, "", true)}<span class="txt"><b>${esc(g)}</b><small>${n} exercícios</small></span></button>`; };
  $("tela-biblioteca").innerHTML = `
    <div class="tela-cab"><div><span class="rot">${lib().length} exercícios com curva de torque</span><h1>Biblioteca de exercícios</h1>
      <p class="suave">Cada capa é a curva de torque do exercício, calculada para o seu corpo. A letra é o boletim dentro do grupo e o selo mostra onde fica o pico.</p></div>
      <button class="btn" type="button" data-acao="criar-ex">Criar exercício</button></div>
    <section class="secao" style="margin-top:0"><div class="secao-titulo"><h2>Categorias</h2>${BIB.grupo?`<button class="link" type="button" data-acao="bib-grupo" data-g="${esc(BIB.grupo)}">limpar categoria</button>`:""}</div>
      <div class="tiles">${Object.entries(cont).map(([g,n])=>tile(g,n)).join("")}</div></section>
    ${secaoEmAlta()}
    <div class="biblio" style="margin-top:30px">
      <aside class="lateral pilha" style="gap:16px">
        ${campoBuscaBib()}
        <div class="painel"><div class="cab"><h3>Equipamento</h3></div><div class="corpo">
          <div class="chips" role="group" aria-label="Equipamento"><button type="button" class="chip" data-acao="bib-equip" data-e="" aria-pressed="${!BIB.equip}">todos</button>${EQUIPAMENTOS.map(e=>`<button type="button" class="chip" data-acao="bib-equip" data-e="${e}" aria-pressed="${BIB.equip===e}">${e}</button>`).join("")}
          ${S.ajustes.equipFiltro.length?`<button type="button" class="chip" data-acao="bib-meus" aria-pressed="${BIB.meus}">só o que eu tenho</button>`:""}</div>
          <div class="chips"><button type="button" class="chip" data-acao="bib-redes" aria-pressed="${!!BIB.redes}">só os em alta nas redes</button></div></div></div>
        <div class="painel"><div class="cab"><h3>Por músculo</h3>${BIB.musc?`<button class="btn mini fantasma" type="button" data-acao="bib-musc" data-musc="">limpar</button>`:""}</div><div class="corpo">
          ${mapaCorpo(corM,{clic:true, ativo:BIB.musc})}
          <p class="pequeno suave">${BIB.musc?esc(MUSCULOS[BIB.musc].funcao):"Toque num músculo para ver os exercícios que o trabalham."}</p></div></div>
      </aside>
      <div id="listaBib" style="scroll-margin-top:80px">${listaBibliotecaHtml()}</div>
    </div>
    ${secaoVideosSalvos()}
    <section class="secao"><div class="secao-titulo"><h2>Perguntas frequentes</h2></div>
      <div class="painel"><div class="corpo faq">${FAQ.map(([q,r])=>`<details><summary>${esc(q)}</summary><p>${esc(r)}</p></details>`).join("")}</div></div></section>`;
}
function detalheGrafHtml(ex, kg){
  if(!temPerfil(ex)) return `<div class="aviso">Este exercício ainda não tem perfil de torque. Escolha abaixo um exercício parecido para copiar a alavanca.</div>`;
  const r = amostrar(ex, 0, kg, 0, 121), av = avaliar(ex), ad = aderencia(r);
  const eixo = (n,v) => `<div><div class="linha entre pequeno"><span>${n}</span><span class="mono">${Math.round(v)}</span></div><div class="trilho"><i style="width:${v}%"></i></div></div>`;
  return `${grafTorque([{r, cor:"var(--rosa)"}],{capacidade:true})}
    <div class="legenda"><span><i style="background:${corTensao(0.1)}"></i>pouca tensão</span><span><i style="background:${corTensao(1)}"></i>pico</span><span><i style="border-style:dashed;background:none"></i>capacidade típica do músculo (gabarito)</span></div>
    <div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">
      <div class="kpi"><div class="rot">pico</div><span class="v">${nf(r.pico)}</span> <span class="u">N·m</span></div>
      <div class="kpi"><div class="rot">trabalho por rep</div><span class="v">${nf(r.W)}</span> <span class="u">J</span></div>
      <div class="kpi"><div class="rot">tensão ≥70% do pico</div><span class="v">${Math.round(r.zona*100)}</span> <span class="u">% da amplitude</span></div>
      <div class="kpi"><div class="rot">casamento c/ capacidade</div><span class="v">${Math.round(ad.casamento)}</span> <span class="u">%</span></div>
    </div>
    <div class="grade g2"><div class="leve pilha" style="gap:8px"><div class="linha">${letraEx(ex)}<b>Boletim ${nfFix(av.nota,1)} / 10</b><span class="pequeno suave">dentro de ${esc(ex.grupo)}</span></div>
      ${eixo("estímulo por kg (50%)",av.eixos.estimulo)}${eixo("consistência da curva (25%)",av.eixos.consistencia)}${eixo("aproveitamento da amplitude (25%)",av.eixos.amplitude)}</div>
      <div class="leve pilha" style="gap:6px"><span class="rot">fatias do trabalho</span>${tresFatias(perfil(ex).fracoes)}${legendaFatias}
        <p class="pequeno">${esc(ex.nota||"")}</p></div></div>`;
}
function abrirExercicio(id){
  const ex = porId(id); if(!ex) return;
  const hist = historicoEx(S, id);
  const best = melhorMarca(S, id);
  const kg0 = hist[0] ? Math.max(...hist[0].series.map(s=>+s.kg||0)) : (ex.carga||0);
  const pts = hist.map(h=>[new Date(h.data.length>10?h.data:h.data+"T12:00"), Math.max(...h.series.map(s=>e1rm(cargaTotal(ex,s.kg), s.reps, s.rir)))]).filter(p=>p[1]>0);
  const opcRot = Object.values(S.rotinas).map(r=>`<option value="${r.id}">${esc(r.nome)}</option>`).join("");
  const custom = CUSTOM.some(c=>c.id===id);
  abrirFolha(ex.nome, `
    <div class="linha">${letraEx(ex)}<span class="mono pequeno">${esc(ex.grupo)} · ${equipamento(ex)}${ex.tipo==="corporal"?` · ${Math.round((ex.frac||1)*100)}% do peso do corpo`:""}</span>${seloRegiao(ex)}</div>
    ${fichaMusc(ex)}
    <label class="campo">Sua nota fixa para este exercício<input class="nota-ex" type="text" maxlength="120" value="${esc((S.notas||{})[ex.id]||"")}" placeholder="banco 3, pino 5, pegada fechada…" data-campo="nota-ex" data-ex="${ex.id}"></label>
    <ul class="pequeno" style="margin:0;padding-left:18px">${dicasExecucao(ex).map(d=>`<li>${esc(d)}</li>`).join("")}</ul>
    ${blocoCinesiologia(ex)}
    ${temPerfil(ex)?`<label class="campo" style="max-width:220px">${ex.tipo==="corporal"?"Carga extra (kg)":"Carga (kg)"} para a curva<input type="number" id="detCarga" value="${kg0}" min="0" step="0.5" data-campo="det-carga" data-ex="${ex.id}"></label>`:""}
    <div id="detGraf">${detalheGrafHtml(ex, kg0)}</div>
    ${!temPerfil(ex)||custom?`<div class="linha"><label class="campo" style="flex:1">Copiar a alavanca de<select id="copiarDe">${opcoesExercicios("", e=>temPerfil(e))}</select></label><button class="btn mini" type="button" data-acao="copiar-perfil" data-ex="${ex.id}" style="align-self:flex-end">Copiar</button></div>`:""}
    ${blocoNasRedes(ex)}
    ${blocoVideos(ex)}
    <div class="pilha"><h3>Seu histórico</h3>
      ${hist.length?`<div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">
        ${ehTempo(ex)?`<div class="kpi"><div class="rot">maior tempo</div><span class="v">${best.reps}</span> <span class="u">s</span></div>`:`<div class="kpi"><div class="rot">1RM estimado</div><span class="v">${nf(best.e1rm,1)}</span> <span class="u">kg${ex.tipo==="corporal"?" (com corpo)":""}</span></div>
        <div class="kpi"><div class="rot">maior carga</div><span class="v">${nf(best.kg,2)}</span> <span class="u">kg</span></div>`}
        <div class="kpi"><div class="rot">sessões</div><span class="v">${hist.length}</span></div></div>
        ${pts.length>1?grafLinha([{nome:"1RM estimado",cor:"var(--rosa)",pts}],{h:180,yRot:"kg",aria:"1RM estimado por sessão",area:true}):""}
        ${!ehTempo(ex)&&best.e1rm?(()=>{ const tab = tabelaPercentuais(best.e1rm, S.ajustes.passo||2.5, ex); return `<details class="mais"><summary>Cargas por % do 1RM</summary>
          <div class="rolar"><table class="tabela-pct"><thead><tr><th>% do 1RM</th><th>${ex.tipo==="corporal"?"carga extra":"carga"}</th><th>reps possíveis</th></tr></thead>
          <tbody>${tab.map(l=>`<tr><td class="num">${l.p}%</td><td class="num">${nf(l.carga,2)} kg</td><td class="num">${l.p===100?"1":"≈ "+l.reps}</td></tr>`).join("")}</tbody></table></div>
          <p class="pequeno suave" style="margin:0">A partir do 1RM estimado de ${nf(best.e1rm,1)} kg, arredondado ao passo das suas anilhas. As repetições saem da fórmula de Epley e valem como ponto de partida.</p></details>`; })():""}
        <div class="lista-ex">${hist.slice(0,5).map(h=>`<div><span class="mono pequeno" style="width:92px;flex:none">${dataCurta(h.data)}</span><span class="nome mono pequeno">${h.series.map(s=>`${ex.tipo==="corporal"&&!s.kg?"":nf(s.kg,2)+"×"}${s.reps}${ehTempo(ex)?"s":""}`).join("  ")}</span><span class="mono pequeno suave">${fmtJ(h.series.reduce((a,s)=>a+trabalhoSerie(ex,s.kg,s.reps),0))}</span></div>`).join("")}</div>`
      :`<p class="suave">Você ainda não registrou este exercício.</p>`}</div>
    <div class="linha">
      ${opcRot?`<select id="detRotina" aria-label="Rotina" style="max-width:220px">${opcRot}</select><button class="btn mini primario" type="button" data-acao="det-add-rotina" data-ex="${ex.id}">Adicionar à rotina</button>`:""}
      ${S.ativo?`<button class="btn mini" type="button" data-acao="det-add-treino" data-ex="${ex.id}">Adicionar ao treino em andamento</button>`:""}
      <button class="btn mini" type="button" data-acao="det-lab" data-ex="${ex.id}">Comparar no laboratório</button>
      ${custom?`<button class="btn mini perigo" type="button" data-acao="ex-excluir" data-ex="${ex.id}">Excluir exercício</button>`:""}
    </div>`);
}
const ytBusca = nome => "https://www.youtube.com/results?search_query="+encodeURIComponent(nome+" execução técnica musculação");
function abrirCriarExercicio(){
  abrirFolha("Criar exercício", `
    <p class="pequeno suave">Para ter curva de torque, o exercício copia a alavanca de outro parecido (articulação, ângulos e direção da força). Ajuste os ângulos se quiser.</p>
    <div class="campos">
      <label class="campo">Nome<input type="text" id="nNome" placeholder="Ex.: Remada no TRX"></label>
      <label class="campo">Grupo<input type="text" id="nGrupo" list="listaGrupos" placeholder="Costas"><datalist id="listaGrupos">${grupos().map(g=>`<option value="${esc(g)}">`).join("")}</datalist></label>
      <label class="campo">Tipo de carga<select id="nTipo"><option value="externa">Peso externo</option><option value="corporal">Peso do corpo</option></select></label>
      <label class="campo">Fração do corpo (se corporal)<input type="number" id="nFrac" value="0.6" min="0.05" max="1" step="0.05"></label>
      <label class="campo">Equipamento<select id="nEquip">${EQUIPAMENTOS.map(e=>`<option>${e}</option>`).join("")}</select></label>
      <label class="campo">Registrar por<select id="nModo"><option value="reps">repetições</option><option value="tempo">tempo (s)</option></select></label>
    </div>
    <label class="campo">Copiar alavanca de<select id="nBase">${opcoesExercicios("remada-invertida", e=>temPerfil(e))}</select></label>
    <details class="mais"><summary>Ajuste fino da alavanca</summary><div class="campos" style="margin-top:8px">
      <label class="campo">Ângulo inicial b0 (°)<input type="number" id="nB0" placeholder="do exercício base"></label>
      <label class="campo">Giro total db (°)<input type="number" id="nDb" placeholder="do exercício base"></label>
      <label class="campo">Direção da força γ (°)<input type="number" id="nG" placeholder="−90 = gravidade"></label>
      <label class="campo">Braço extra (cm)<input type="number" id="nOff" placeholder="0"></label></div>
      <p class="pequeno suave">0° é o segmento na horizontal à frente; −90° aponta para baixo. γ = −90 é a gravidade, 90 uma polia acima, 180 uma polia à frente.</p></details>
    <div class="linha"><button class="btn primario" type="button" data-acao="salvar-ex">Salvar exercício</button></div>`);
}

/* ---------- PROGRESSO ---------- */
const PROG = {semanas:12, mapa:"volume", ex:"", hist:12, medida:""};
function semanaDe(d){ const ordem=ordemSemana(S.ajustes.inicioSemana); d=new Date(d); return isoDia(somaDias(d, -((d.getDay()-ordem[0]+7)%7))); }
function renderProgresso(){
  const hoje = new Date();
  const corte = isoDia(somaDias(hoje, -PROG.semanas*7+1));
  const noPeriodo = S.treinos.filter(t=>t.data.slice(0,10)>=corte);
  let series=0, volume=0, J=0, prs=0;
  const porDia = {}, porSem = {};
  for(const t of S.treinos){
    const r = resumoTreino(t), k = t.data.slice(0,10);
    porDia[k] = porDia[k]||{n:0,J:0}; porDia[k].n++; porDia[k].J+=r.J;
    if(k>=corte){ series+=r.series; volume+=r.volume; J+=r.J; prs += t.itens.reduce((a,it)=>a+it.series.filter(s=>s.pr).length,0);
      const w = semanaDe(deIso(k)); porSem[w]=porSem[w]||{J:0,n:0,series:0}; porSem[w].J+=r.J; porSem[w].n++; porSem[w].series+=r.series; }
  }
  const semanas=[]; for(let i=PROG.semanas-1;i>=0;i--){ const w=semanaDe(somaDias(hoje,-i*7)); semanas.push({rot:deIso(w).getDate()+"/"+(deIso(w).getMonth()+1), v:(porSem[w]||{J:0}).J/1000, dica:`semana de ${dataCurta(w)}: ${fmtJ((porSem[w]||{J:0}).J)}, ${(porSem[w]||{n:0}).n} treino(s), ${(porSem[w]||{series:0}).series} séries`}); }
  /* mapa muscular em três modos */
  const vol = cargaMuscular(S, 7, hoje), rec = recuperacao(S, hoje);
  const maxVol = Math.max(1, ...Object.values(vol).map(v=>v.series));
  const corMapa = m => {
    if(PROG.mapa==="volume"){ const v=vol[m]; return v ? misturar("var(--rosa)", 25+75*v.series/maxVol) : "var(--papel2)"; }
    if(PROG.mapa==="recuperacao"){ const r=rec[m]; if(r.diasSem==null) return "var(--papel2)"; return r.recuperado<50?misturar("var(--critico)",80):r.recuperado<85?misturar("var(--alerta)",75):misturar("var(--ok)",60); }
    const r=rec[m]; if(r.diasSem==null||r.diasSem>=14) return misturar("var(--critico)",80); if(r.diasSem>=7) return misturar("var(--alerta)",75); return misturar("var(--ok)",50);
  };
  const dicaMapa = m => PROG.mapa==="volume" ? (vol[m]?nf(vol[m].series,1)+" séries e "+fmtJ(vol[m].J)+" em 7 dias":"nada em 7 dias")
    : PROG.mapa==="recuperacao" ? (rec[m].diasSem==null?"sem registro":Math.round(rec[m].recuperado)+"% recuperado") : (rec[m].diasSem==null?"nunca treinado":"há "+rec[m].diasSem+" dia(s)");
  const legMapa = PROG.mapa==="volume" ? `<span><i style="background:${misturar("var(--rosa)",30)}"></i>pouco</span><span><i style="background:${misturar("var(--rosa)",100)}"></i>mais séries</span>`
    : PROG.mapa==="recuperacao" ? `<span><i style="background:${misturar("var(--critico)",80)}"></i>&lt;50%</span><span><i style="background:${misturar("var(--alerta)",75)}"></i>50–85%</span><span><i style="background:${misturar("var(--ok)",60)}"></i>recuperado</span>`
    : `<span><i style="background:${misturar("var(--ok)",50)}"></i>&lt;7 dias</span><span><i style="background:${misturar("var(--alerta)",75)}"></i>7–13 dias</span><span><i style="background:${misturar("var(--critico)",80)}"></i>14+ dias</span>`;
  const esquecidos = Object.entries(rec).filter(([,v])=>v.diasSem==null||v.diasSem>=14).map(([m])=>MUSCULOS[m].nome);
  /* cobertura */
  const cob = coberturaGrupos(S, 28, hoje);
  /* força */
  const usados = {}; S.treinos.forEach(t=>t.itens.forEach(it=>{ if(seriesValidas(it).length) usados[it.exId]=(usados[it.exId]||0)+1; }));
  const exsUsados = Object.keys(usados).filter(id=>porId(id)&&!ehTempo(porId(id))).sort((a,b)=>usados[b]-usados[a]);
  if(!PROG.ex || !usados[PROG.ex]) PROG.ex = exsUsados[0]||"";
  let forcaHtml = `<div class="vazio">Registre treinos para ver a curva de força.</div>`;
  if(PROG.ex){
    const ex = porId(PROG.ex), hist = historicoEx(S, PROG.ex).filter(h=>h.data.slice(0,10)>=corte);
    const pts = hist.map(h=>[new Date(h.data.slice(0,10)+"T12:00"), Math.max(...h.series.map(s=>e1rm(cargaTotal(ex,s.kg),s.reps,s.rir)))]).filter(p=>p[1]>0);
    const pesoMax = hist.map(h=>[new Date(h.data.slice(0,10)+"T12:00"), cargaTotal(ex, Math.max(...h.series.map(s=>+s.kg||0)))]);
    forcaHtml = `<label class="campo" style="max-width:340px">Exercício<select data-campo="prog-ex">${exsUsados.map(id=>`<option value="${id}"${id===PROG.ex?" selected":""}>${esc(porId(id).nome)} (${usados[id]})</option>`).join("")}</select></label>
      ${grafLinha([{nome:"1RM estimado",cor:"var(--rosa)",pts},{nome:"carga de trabalho",cor:"var(--azul)",pts:pesoMax,tracejado:true}],{yRot:"kg",aria:"1RM estimado e carga de trabalho"})}
      <p class="pequeno suave">1RM estimado pela fórmula de Epley, somando as repetições que sobraram (RIR) quando você registra o esforço.${ex.tipo==="corporal"?" Para este exercício a conta inclui a fração do seu peso corporal.":""}</p>`;
  }
  const marca = id => { const m=melhorMarca(S,id); return m.e1rm; };
  const pares = [["supino-reto","agachamento-livre",0.75,"Supino ÷ Agachamento"],["terra","agachamento-livre",1.2,"Terra ÷ Agachamento"],["press-militar","supino-reto",0.65,"Desenvolvimento ÷ Supino"],["remada-curvada","supino-reto",0.75,"Remada curvada ÷ Supino"]];
  const equilibrio = pares.map(([a,b,ref,rot])=>{ const va=marca(a), vb=marca(b); const r = va&&vb ? va/vb : null;
    const desvio = r ? (r/ref-1)*100 : null;
    return `<tr><td>${rot}</td><td class="num">${va?nf(va):"—"} / ${vb?nf(vb):"—"}</td><td class="num">${r?nfFix(r,2):"—"}</td><td class="num">${nfFix(ref,2)}</td><td class="num" style="color:${desvio==null?"inherit":Math.abs(desvio)<10?"var(--ok)":Math.abs(desvio)<20?"var(--alerta)":"var(--critico)"}">${desvio==null?"—":(desvio>0?"+":"")+Math.round(desvio)+"%"}</td></tr>`; }).join("");
  /* peso corporal */
  const pesos = S.peso.slice().sort((a,b)=>a.data<b.data?-1:1).filter(p=>p.data>=corte);
  const media7 = pesos.map((p,i)=>{ const j=pesos.filter(q=>q.data<=p.data && q.data>=isoDia(somaDias(deIso(p.data),-6))); return [deIso(p.data), j.reduce((a,q)=>a+q.kg,0)/j.length]; });
  const lista = S.treinos.slice().sort((a,b)=>a.data<b.data?1:-1);
  $("tela-progresso").innerHTML = `
    <div class="tela-cab"><div><h1>Progresso</h1><p class="suave">Volume em quilos e trabalho mecânico em joules contam histórias diferentes: o primeiro ignora a alavanca, o segundo não.</p></div>
      <div class="chips" role="group" aria-label="Período">${[[4,"4 semanas"],[12,"12 semanas"],[26,"6 meses"],[52,"1 ano"]].map(([n,t])=>`<button type="button" class="chip" data-acao="prog-periodo" data-n="${n}" aria-pressed="${PROG.semanas===n}">${t}</button>`).join("")}</div></div>
    <div class="pilha" style="gap:18px">
      <div class="kpis">
        <div class="kpi"><div class="rot">treinos</div><span class="v">${noPeriodo.length}</span></div>
        <div class="kpi"><div class="rot">séries válidas</div><span class="v">${series}</span></div>
        <div class="kpi"><div class="rot">volume</div><span class="v">${nfFix(volume/1000,1)}</span> <span class="u">toneladas</span></div>
        <div class="kpi"><div class="rot">trabalho mecânico</div><span class="v">${nf(J/1000)}</span> <span class="u">kJ</span></div>
        <div class="kpi"><div class="rot">recordes</div><span class="v">${prs}</span> <span class="u">no período</span></div>
      </div>
      ${painelPlanoFeito()}
      <div class="painel"><div class="cab"><h3>Calendário</h3><span class="rot">último ano · cor = trabalho do dia</span></div><div class="corpo">${grafCalor(porDia, S.ajustes.inicioSemana)}</div></div>
      <div class="grade g2">
        <div class="painel"><div class="cab"><h3>Trabalho por semana</h3><span class="rot">kJ</span></div><div class="corpo">${grafBarras(semanas,{fmtY:v=>nf(v),aria:"Trabalho mecânico por semana"})}</div></div>
        <div class="painel"><div class="cab"><h3>Mapa muscular</h3><span class="rot">${PROG.mapa==="volume"?"últimos 7 dias":PROG.mapa==="recuperacao"?"agora":"dias sem treinar"}</span></div><div class="corpo">
          <div class="chips" role="group" aria-label="Modo do mapa"><button type="button" class="chip" data-acao="prog-mapa" data-m="volume" aria-pressed="${PROG.mapa==="volume"}">onde foi o volume</button><button type="button" class="chip" data-acao="prog-mapa" data-m="recuperacao" aria-pressed="${PROG.mapa==="recuperacao"}">o que recupera</button><button type="button" class="chip" data-acao="prog-mapa" data-m="destreino" aria-pressed="${PROG.mapa==="destreino"}">o que ficou de lado</button></div>
          ${mapaCorpo(corMapa,{dica:dicaMapa})}<div class="legenda">${legMapa}</div>
          ${PROG.mapa==="destreino"&&esquecidos.length?`<p class="pequeno">Sem treino há 14 dias ou mais: ${esquecidos.map(esc).join(", ")}.</p>`:""}
        </div></div>
      </div>
      <div class="painel"><div class="cab"><h3>Cobertura da amplitude</h3><span class="rot">últimas 4 semanas</span></div><div class="corpo">
        <p class="pequeno suave">Para cada grupo, a fatia do trabalho que caiu com o músculo alongado, no meio e encurtado, somando a curva de torque de cada série que você fez.</p>${legendaFatias}
        ${Object.keys(cob).length?`<div class="grade g2">${Object.entries(cob).sort((a,b)=>b[1].J-a[1].J).map(([g,v])=>{ const i=v.fr.indexOf(Math.min(...v.fr)); const sug = v.fr[i]<0.15 ? sugerirParaRegiao(g,i,v.exs) : null;
          return `<div class="pilha" style="gap:3px"><div class="linha entre pequeno"><b>${esc(g)}</b><span class="mono suave">${fmtJ(v.J)}</span></div>${tresFatias(v.fr)}${sug?`<span class="pequeno">Faltou o <b>${NOMES_REGIAO[i]}</b>: <button class="btn mini fantasma" type="button" data-acao="ver-ex" data-ex="${sug.id}">${esc(sug.nome)}</button></span>`:""}</div>`;}).join("")}</div>`:`<div class="vazio">Sem treinos nas últimas 4 semanas.</div>`}
      </div></div>
      <div class="grade g2">
        <div class="painel"><div class="cab"><h3>Força</h3><span class="rot">1RM estimado</span></div><div class="corpo">${forcaHtml}</div></div>
        <div class="painel"><div class="cab"><h3>Equilíbrio estrutural</h3><span class="rot">razões entre 1RMs</span></div><div class="corpo">
          <div class="rolar"><table><thead><tr><th>razão</th><th>1RMs (kg)</th><th>sua</th><th>referência</th><th>desvio</th></tr></thead><tbody>${equilibrio}</tbody></table></div>
          <p class="pequeno suave">Referências aproximadas, populares em academias e no powerlifting amador. Servem para notar um elo fraco, não como norma.</p></div></div>
      </div>
      <div class="grade g-21">
        <div class="painel"><div class="cab"><h3>Peso corporal</h3><span class="rot">média de 7 dias</span></div><div class="corpo">
          ${grafLinha([{nome:"registros",cor:"var(--tinta-suave)",pts:pesos.map(p=>[deIso(p.data),p.kg]),tracejado:true},{nome:"média de 7 dias",cor:"var(--azul)",pts:media7,pontos:false}],{meta:S.perfil.metaPeso||null,fmtY:v=>nf(v,1),yRot:"kg",aria:"Peso corporal"})}
        </div></div>
        <div class="painel"><div class="cab"><h3>Registros de peso</h3></div><div class="corpo"><div class="lista-ex" style="max-height:300px;overflow-y:auto">
          ${S.peso.slice().sort((a,b)=>a.data<b.data?1:-1).slice(0,40).map(p=>`<div><span class="nome mono pequeno">${dataCurta(p.data)}</span><span class="mono">${nfFix(p.kg,1)} kg</span><button class="btn mini fantasma perigo" type="button" data-acao="peso-remover" data-d="${p.data}" aria-label="Remover registro">✕</button></div>`).join("")||`<div class="suave">Nenhum registro.</div>`}</div></div></div>
      </div>
      ${painelMedidas()}
      <div class="painel"><div class="cab"><h3>Histórico</h3><button class="btn mini" type="button" data-acao="treino-manual">Registrar treino passado</button></div><div class="corpo">
        <div class="lista-ex">${lista.slice(0,PROG.hist).map(t=>{ const r=resumoTreino(t); return `<div><div class="nome"><b>${esc(t.nome)}</b><span class="mono pequeno suave">${dataCurta(t.data)}${r.duracaoMin?` · ${r.duracaoMin} min`:""} · ${r.series} séries · ${fmtT(r.volume)} · ${fmtJ(r.J)}${t.origem?` · importado do ${esc(t.origem)}`:""}</span></div><button class="btn mini" type="button" data-acao="ver-treino" data-id="${t.id}">abrir</button></div>`; }).join("")||`<div class="vazio">Nenhum treino ainda.</div>`}</div>
        ${lista.length>PROG.hist?`<div class="linha"><span class="pequeno suave">Mostrando ${PROG.hist} de ${lista.length}.</span><button class="btn mini" type="button" data-acao="prog-hist">Mostrar mais</button></div>`:""}
      </div></div>
    </div>`;
}
function abrirTreinoSalvo(id){
  const t = S.treinos.find(x=>x.id===id); if(!t) return;
  const r = resumoTreino(t);
  abrirFolha(t.nome, `
    <span class="rot">${dataLonga(deIso(t.data.slice(0,10)))}${r.duracaoMin?` · ${r.duracaoMin} min`:""}</span>
    <div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">
      <div class="kpi"><div class="rot">séries</div><span class="v">${r.series}</span></div>
      <div class="kpi"><div class="rot">volume</div><span class="v">${nf(r.volume)}</span> <span class="u">kg</span></div>
      <div class="kpi"><div class="rot">trabalho</div><span class="v">${nfFix(r.J/1000,1)}</span> <span class="u">kJ</span></div>
      ${r.impulso?`<div class="kpi"><div class="rot">isometria</div><span class="v">${nf(r.impulso/1000,1)}</span> <span class="u">kN·m·s</span></div>`:""}
    </div>
    <div class="pilha" style="gap:4px"><span class="rot">onde caiu a tensão nesta sessão</span>${tresFatias(r.regioes)}${legendaFatias}</div>
    <div class="lista-ex">${t.itens.map(it=>{ const ex=porId(it.exId)||{nome:it.exId}; const sv=seriesValidas(it);
      return `<div><div class="nome"><b>${esc(ex.nome)}</b><span class="mono pequeno">${it.series.map(s=>`${s.tipo==="aquec"?"(aq) ":""}${ex.tipo==="corporal"&&!s.kg?"":nf(s.kg,2)+"×"}${s.reps}${ehTempo(ex)?"s":""}${s.rir!=null?" @"+s.rir:""}${s.pr?" ★":""}`).join("  ")}</span></div><span class="mono pequeno suave">${fmtJ(sv.reduce((a,s)=>a+trabalhoSerie(ex,s.kg,s.reps),0))}</span></div>`; }).join("")}</div>
    <p class="pequeno suave">@ = repetições em reserva (RIR). ★ = recorde no dia.</p>
    <div class="linha"><button class="btn" type="button" data-acao="cartao-treino" data-id="${t.id}">Imagem para compartilhar</button><button class="btn" type="button" data-acao="treino-editar" data-id="${t.id}">Editar</button><button class="btn perigo" type="button" data-acao="treino-excluir" data-id="${t.id}">Excluir</button></div>`);
}

/* ---------- LABORATÓRIO ---------- */
const LAB = {a:"supino-reto", b:"crucifixo", ka:null, kb:null, grupo:"Peito"};
function renderLab(){
  const A = porId(LAB.a)||porId("supino-reto"), B = porId(LAB.b)||porId("crucifixo");
  const ka = LAB.ka!=null ? LAB.ka : (A.carga||0), kb = LAB.kb!=null ? LAB.kb : (B.carga||0);
  let duelo = `<div class="aviso">Um dos exercícios não tem perfil de torque.</div>`;
  if(temPerfil(A) && temPerfil(B)){
    const rA = amostrar(A,0,ka,0,121), rB = amostrar(B,0,kb,0,121), aA = avaliar(A,rA), aB = avaliar(B,rB);
    const linhas = [
      ["pico de torque", rA.pico, rB.pico, v=>nf(v)+" N·m", 1],
      ["trabalho por repetição", rA.W, rB.W, v=>nf(v)+" J", 1],
      ["trabalho por kg de carga", rA.W/rA.cargaRef, rB.W/rB.cargaRef, v=>nfFix(v,1)+" J/kg", 1],
      ["amplitude sob tensão alta", rA.zona*100, rB.zona*100, v=>Math.round(v)+"%", 1],
      ["consistência da curva", rA.consistencia, rB.consistencia, v=>Math.round(v)+"/100", 1],
      ["nota do boletim", aA.nota, aB.nota, v=>nfFix(v,1), 1]
    ];
    const tab = linhas.map(([n,a,b,f])=>`<tr><td>${n}</td><td class="num" style="${a>b*1.02?"background:color-mix(in srgb, var(--rosa) 18%, transparent);font-weight:700":""}">${f(a)}</td><td class="num" style="${b>a*1.02?"background:color-mix(in srgb, var(--azul) 18%, transparent);font-weight:700":""}">${f(b)}</td></tr>`).join("");
    const maisW = rA.W>=rB.W ? A : B, rel = Math.max(rA.W,rB.W)/Math.max(1e-9,Math.min(rA.W,rB.W));
    const porKgA = rA.W/rA.cargaRef, porKgB = rB.W/rB.cargaRef;
    const veredito = `Com essas cargas, <b>${esc(maisW.nome)}</b> pede ${nfFix(rel,1)}× mais trabalho por repetição. Por quilo na barra, quem rende mais é <b>${esc(porKgA>=porKgB?A.nome:B.nome)}</b>. `+
      (rA.regiao===rB.regiao ? `Os dois têm o pico no ${rA.regiao}.` : `${esc(A.nome)} carrega o ${rA.regiao}; ${esc(B.nome)}, o ${rB.regiao}: combinados, cobrem mais da amplitude.`);
    duelo = `${grafTorque([{r:rA,cor:"var(--rosa)"},{r:rB,cor:"var(--azul)"}],{aria:"Curvas de torque dos dois exercícios"})}
      <div class="legenda"><span><i style="background:var(--rosa)"></i>${esc(A.nome)}</span><span><i style="background:var(--azul)"></i>${esc(B.nome)}</span></div>
      <p>${veredito}</p>
      <div class="rolar"><table><thead><tr><th></th><th style="color:var(--rosa)">${esc(A.nome)}</th><th style="color:var(--azul)">${esc(B.nome)}</th></tr></thead><tbody>${tab}</tbody></table></div>`;
  }
  const rank = lib().filter(e=>e.grupo===LAB.grupo && temPerfil(e)).map(e=>{ const r=amostrar(e,0,e.carga||0,0,81); return {e,r,av:avaliar(e,r)}; }).sort((x,y)=>y.av.nota-x.av.nota);
  const P = S.perfil;
  const slider = (id, rot, v) => `<label class="campo">${rot} <span class="mono">${v>0?"+":""}${v}%</span><input type="range" min="-15" max="15" step="1" value="${v}" data-campo="cfg" data-path="perfil.${id}" data-tipo="num"></label>`;
  $("tela-lab").innerHTML = `
    <div class="tela-cab"><div><h1>Laboratório de alavancas</h1><p class="suave">O núcleo do Torquímetro. Tudo o que você muda aqui (altura, massa, proporções) também muda o trabalho em joules calculado nos seus treinos.</p></div>
      <a class="btn" href="${LINK_TORQUIMETRO}" target="_blank" rel="noopener">Torquímetro completo ↗</a></div>
    <div class="pilha" style="gap:18px">
      <div class="painel"><div class="cab"><h3>Seu corpo define as alavancas</h3></div><div class="corpo">
        <div class="campos">
          <label class="campo">Altura (cm)<input type="number" value="${P.altura}" min="120" max="230" data-campo="cfg" data-path="perfil.altura" data-tipo="num"></label>
          <label class="campo">Massa (kg)<input type="number" value="${P.massa}" min="30" max="250" step="0.1" data-campo="cfg" data-path="perfil.massa" data-tipo="num" ${P.sincronizarMassa&&S.peso.length?"disabled title='Vem do último peso registrado'":""}></label>
          ${slider("propCoxa","Coxa",P.propCoxa)}${slider("propTronco","Tronco",P.propTronco)}${slider("propBraco","Braço",P.propBraco)}
        </div>
        ${P.sincronizarMassa&&S.peso.length?`<p class="pequeno suave">A massa segue o último peso registrado. Desligue em Ajustes para fixar um valor.</p>`:""}
      </div></div>
      <div class="painel"><div class="cab"><h3>O duelo</h3><span class="rot">mesma física, dois exercícios</span></div><div class="corpo">
        <div class="campos">
          <label class="campo" style="color:var(--rosa)">Exercício A<select data-campo="lab" data-k="a">${opcoesExercicios(A.id, temPerfil)}</select></label>
          <label class="campo">Carga A (kg${A.tipo==="corporal"?" extra":""})<input type="number" value="${ka}" min="0" step="0.5" data-campo="lab" data-k="ka"></label>
          <label class="campo" style="color:var(--azul)">Exercício B<select data-campo="lab" data-k="b">${opcoesExercicios(B.id, temPerfil)}</select></label>
          <label class="campo">Carga B (kg${B.tipo==="corporal"?" extra":""})<input type="number" value="${kb}" min="0" step="0.5" data-campo="lab" data-k="kb"></label>
        </div>
        <div class="chips">${DUELOS.map(([a,b,t])=>`<button type="button" class="chip" data-acao="lab-duelo" data-a="${a}" data-b="${b}">${esc(t)}</button>`).join("")}</div>
        ${duelo}
      </div></div>
      <div class="painel"><div class="cab"><h3>Ranking do grupo</h3><span class="rot">carga de referência</span></div><div class="corpo">
        <label class="campo" style="max-width:260px">Grupo<select data-campo="lab" data-k="grupo">${grupos().map(g=>`<option${g===LAB.grupo?" selected":""}>${esc(g)}</option>`).join("")}</select></label>
        <div class="rolar"><table><thead><tr><th>exercício</th><th>nota</th><th>J/rep</th><th>pico N·m</th><th>região do pico</th><th>tensão alta</th></tr></thead><tbody>
          ${rank.map(({e,r,av})=>`<tr><td><button type="button" class="btn fantasma mini" data-acao="ver-ex" data-ex="${e.id}" style="border:0;font-family:var(--f-corpo);letter-spacing:0;font-size:13.5px;text-align:left;padding:0">${esc(e.nome)}</button></td><td class="num"><span class="nota-letra ${av.letra}" style="width:24px;height:24px;font-size:13px">${av.letra}</span> ${nfFix(av.nota,1)}</td><td class="num">${nf(r.W)}</td><td class="num">${nf(r.pico)}</td><td>${seloRegiao(e)}</td><td class="num">${Math.round(r.zona*100)}%</td></tr>`).join("")}
        </tbody></table></div>
        <p class="pequeno suave">Recrutamento de fibras não entra na conta. Torque e trabalho são a demanda mecânica; a resposta do músculo depende também de proximidade da falha, velocidade e fadiga.</p>
      </div></div>
    </div>`;
}

/* plano × feito: séries por músculo nos últimos 7 dias contra o que a semana do plano prevê */
function painelPlanoFeito(){
  const pf = planoVsFeito(S);
  const linhas = pf.linhas.filter(l=>l.plano>0).sort((a,b)=>b.plano-a.plano).slice(0,12);
  if(!linhas.length) return "";
  const extras = pf.linhas.filter(l=>!l.plano && l.feito>=1);
  const cor = p => p>=0.9 ? "var(--ok)" : p>=0.6 ? "var(--alerta)" : "var(--critico)";
  const max = Math.max(...linhas.map(l=>Math.max(l.plano,l.feito)));
  const faltam = linhas.filter(l=>l.pct<0.6).map(l=>MUSCULOS[l.m].nome.split(" (")[0]);
  return `<div class="painel"><div class="cab"><h3>Plano × feito</h3><span class="rot">séries nos últimos 7 dias</span></div><div class="corpo">
    <div class="linha" style="gap:14px;align-items:baseline"><span class="mono" style="font-size:28px;font-weight:700;color:${cor(pf.aderencia)}">${Math.round(pf.aderencia*100)}%</span>
      <span class="pequeno suave">do volume planejado para a semana foi feito${faltam.length?`; ficou para trás: ${faltam.slice(0,4).map(esc).join(", ")}`:""}.</span></div>
    <div class="plano-feito" role="list">${linhas.map(l=>`<div role="listitem" class="pf-linha" title="${esc(MUSCULOS[l.m].nome)}: ${nf(l.feito,1)} de ${nf(l.plano,1)} séries">
      <span class="pf-nome">${esc(MUSCULOS[l.m].nome.split(" (")[0])}</span>
      <span class="pf-trilho"><i style="width:${l.feito/max*100}%;background:${cor(l.pct)}"></i><b style="left:${l.plano/max*100}%"></b></span>
      <span class="mono pequeno">${nf(l.feito,1)}/${nf(l.plano,1)}</span></div>`).join("")}</div>
    <p class="pequeno suave" style="margin:0">Barra = séries feitas; traço = o que o plano prevê (secundário conta meia).${extras.length?` Fora do plano: ${extras.slice(0,4).map(l=>esc(MUSCULOS[l.m].nome.split(" (")[0])+" "+nf(l.feito,1)).join(", ")}.`:""}</p>
  </div></div>`;
}

/* ---------- medidor de carga da semana ---------- */
/* ponteiro de 0 a 2× a média das 4 semanas anteriores; faixas de cor = zonas */
function medidorCarga(razao, w){
  w = w||260; const h = w*0.58, cx = w/2, cy = h-8, r = w/2-18, max = 2;
  const ang = v => Math.PI*(1 - Math.min(max, Math.max(0, v))/max);
  const ponto = (v, rr) => [cx + rr*Math.cos(ang(v)), cy - rr*Math.sin(ang(v))];
  const arco = (a, b, cor) => { const [x1,y1] = ponto(a, r), [x2,y2] = ponto(b, r); return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${cor}" stroke-width="16" fill="none"/>`; };
  const faixas = [[0,0.8,"var(--mostarda)"],[0.8,1.3,"var(--ok)"],[1.3,1.5,"var(--alerta)"],[1.5,2,"var(--critico)"]];
  const marcas = [0,0.8,1.3,1.5,2].map(v=>{ const [x,y] = ponto(v, r+14); return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" class="mc-marca">${String(v).replace(".",",")}</text>`; }).join("");
  const agulha = razao==null ? "" : (()=>{ const [x,y] = ponto(razao, r-24); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="mc-agulha"/><circle cx="${cx}" cy="${cy}" r="7" class="mc-eixo"/>`; })();
  return `<svg viewBox="0 0 ${w} ${h+4}" class="medidor-carga" role="img" aria-label="${razao==null?"Sem comparação ainda":"Carga da semana: "+nfFix(razao,2)+" vezes a média recente"}">
    ${faixas.map(([a,b,c])=>arco(a,b,c)).join("")}${marcas}${agulha}</svg>`;
}
function painelCargaSemana(){
  const c = cargaSemanal(S), z = ZONAS_CARGA[c.zona];
  return `<div class="painel"><div class="cab"><h3>Carga da semana</h3><span class="rot">últimos 7 dias</span></div><div class="corpo">
    <div class="mc-topo">${medidorCarga(c.razao)}
      <div class="mc-leitura"><span class="mc-valor zona-${c.zona}">${c.razao==null?"—":nfFix(c.razao,2).replace(".",",")+"×"}</span><b>${z.nome}</b></div></div>
    <p class="pequeno" style="margin:0">${z.txt}</p>
    <p class="pequeno suave" style="margin:0">${c.sessoes} treino${c.sessoes===1?"":"s"}, ${c.series} séries e ${fmtJ(c.J)} nesta semana${c.mediaJ?`, contra ${nf(c.mediaSeries,1)} séries e ${fmtJ(c.mediaJ)} por semana no mês anterior`:""}.</p>
  </div></div>`;
}

/* ---------- medidas corporais ---------- */
function painelMedidas(){
  const res = resumoMedidas(S), idx = indicesCorporais(S), chave = PROG.medida || (Object.keys(res)[0] || "cintura");
  const [, nomeSel, unSel] = MEDIDAS.find(m=>m[0]===chave) || MEDIDAS[0];
  const pts = (S.medidas||[]).filter(m=>m[chave]!=null).map(m=>[deIso(m.data), m[chave]]);
  return `<div class="painel"><div class="cab"><h3>Medidas corporais</h3><span class="rot">${(S.medidas||[]).length} registro(s)</span></div><div class="corpo">
    ${Object.keys(res).length?`<div class="medidas-grade">${MEDIDAS.filter(([k])=>res[k]).map(([k,n,u])=>{ const r=res[k];
      return `<button type="button" class="medida${k===chave?" ativa":""}" data-acao="prog-medida" data-m="${k}" aria-pressed="${k===chave}"><span>${n}</span><b>${nfFix(r.atual,1)} ${u}</b><small>${r.delta==null?"1 registro":(r.delta>0?"+":"")+nfFix(r.delta,1)+" "+u+" desde "+dataCurta(r.desde)}</small></button>`; }).join("")}</div>
      ${pts.length>1?`<div class="grafico-medida">${grafLinha([{nome:nomeSel,cor:"var(--rosa)",pts}],{w:640,h:220,fmtY:v=>nf(v,1),yRot:unSel,aria:nomeSel+" ao longo do tempo"})}</div>`:""}
      ${idx.cinturaAltura||idx.cinturaQuadril?`<p class="pequeno suave" style="margin:0">${idx.cinturaAltura?`Cintura ÷ altura: <b>${nfFix(idx.cinturaAltura,2)}</b> (abaixo de 0,5 é a referência usual). `:""}${idx.cinturaQuadril?`Cintura ÷ quadril: <b>${nfFix(idx.cinturaQuadril,2)}</b>.`:""}</p>`:""}`
      :`<p class="pequeno suave" style="margin:0">Meça com fita, sempre no mesmo ponto e de manhã. Pode preencher só as medidas que quiser acompanhar.</p>`}
    <form data-form="medidas" class="pilha" style="gap:10px">
      <div class="campos medidas-campos">${MEDIDAS.map(([k,n,u])=>`<label class="campo">${n} (${u})<input type="number" name="${k}" step="0.1" min="0" inputmode="decimal"></label>`).join("")}
        <label class="campo">Data<input type="date" name="data" value="${isoDia(new Date())}" max="${isoDia(new Date())}"></label></div>
      <div class="linha"><button class="btn primario mini" type="submit">Registrar medidas</button>
        ${(S.medidas||[]).length?`<button class="btn mini fantasma perigo" type="button" data-acao="medida-remover">Apagar o último registro</button>`:""}</div>
    </form>
  </div></div>`;
}

/* ---------- AJUSTES ---------- */
/* fora do visualizador (arquivo aberto direto no navegador) o download funciona; dentro dele, só copiar */
function podeBaixar(){ if(BAIXAR.ns) return true; try{ return window.top===window; }catch(e){ return false; } }
function renderAjustes(){
  const P = S.perfil, A = S.ajustes;
  const num = (path, rot, v, extra) => `<label class="campo">${rot}<input type="number" value="${v==null?"":v}" data-campo="cfg" data-path="${path}" data-tipo="num" ${extra||""}></label>`;
  const sel = (path, rot, v, ops) => `<label class="campo">${rot}<select data-campo="cfg" data-path="${path}" data-tipo="${typeof ops[0][0]==="number"?"num":"txt"}">${ops.map(([val,t])=>`<option value="${val}"${String(v)===String(val)?" selected":""}>${t}</option>`).join("")}</select></label>`;
  const chk = (path, rot, v) => `<label class="linha pequeno" style="gap:8px;flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" ${v?"checked":""} data-campo="cfg" data-path="${path}" data-tipo="bool"> ${rot}</label>`;
  const pesos = ["25","20","15","10","5","2.5","1.25"];
  $("tela-ajustes").innerHTML = `
    <div class="tela-cab"><div><h1>Ajustes</h1><p class="suave">Tudo fica neste navegador. Exporte de vez em quando para ter uma cópia.</p></div></div>
    <div class="grade g2">
      <div class="painel"><div class="cab"><h3>Você</h3></div><div class="corpo"><div class="campos">
        <label class="campo">Nome<input type="text" value="${esc(P.nome)}" data-campo="cfg" data-path="perfil.nome" data-tipo="txt" placeholder="Como quer ser chamado"></label>
        ${num("perfil.altura","Altura (cm)",P.altura,'min="120" max="230"')}
        ${num("perfil.massa","Massa (kg)",P.massa,'min="30" max="250" step="0.1"')}
        ${num("perfil.metaPeso","Meta de peso (kg)",P.metaPeso,'min="30" max="250" step="0.1"')}
      </div>${chk("perfil.sincronizarMassa","Usar o último peso registrado como massa nas contas de torque",P.sincronizarMassa)}</div></div>
      <div class="painel"><div class="cab"><h3>Treino</h3></div><div class="corpo"><div class="campos">
        ${sel("ajustes.inicioSemana","Semana começa na",A.inicioSemana,[[1,"segunda"],[0,"domingo"]])}
        ${sel("ajustes.esforco","Coluna de esforço",A.esforco,[["RIR","RIR (reps em reserva)"],["RPE","RPE (0–10)"],["off","desligada"]])}
        ${num("ajustes.descansoPadrao","Descanso padrão (s)",A.descansoPadrao,'min="0" step="15"')}
        ${num("ajustes.passo","Arredondar cargas a (kg)",A.passo,'min="0.25" step="0.25"')}
      </div>${chk("ajustes.priorizarAlta","Sugerir exercícios em alta nas redes (Hoje, Plano, treino e busca)",A.priorizarAlta)}${chk("ajustes.som","Bipe no fim do descanso",A.som)}${chk("ajustes.piscar","Piscar a tela no fim do descanso (academia barulhenta)",A.piscar)}</div></div>
      <div class="painel"><div class="cab"><h3>Anilhas e barra</h3></div><div class="corpo">
        <div class="campos">${num("ajustes.barra","Barra (kg)",A.barra,'min="0" step="0.5"')}</div>
        <span class="rot">pares de anilhas disponíveis</span>
        <div class="campos" style="grid-template-columns:repeat(auto-fit,minmax(80px,1fr))">${pesos.map(p=>num("ajustes.anilhas."+p, p.replace(".",",")+" kg", A.anilhas[p]||0,'min="0" max="12"')).join("")}</div>
        <span class="rot">equipamento que você tem</span>
        <div class="chips">${EQUIPAMENTOS.map(e=>`<button type="button" class="chip" data-acao="equip-toggle" data-e="${e}" aria-pressed="${A.equipFiltro.includes(e)}">${e}</button>`).join("")}</div>
        <p class="pequeno suave">Com equipamento marcado, a biblioteca ganha o filtro “só o que eu tenho”.</p>
      </div></div>
      ${painelNuvem()}
      <div class="painel"><div class="cab"><h3>Renovação semanal (em alta)</h3></div><div class="corpo">
        ${painelRenovacaoAjustes()}
        ${chk("ajustes.renovarAuto","Renovar sozinho na primeira abertura de cada semana",A.renovarAuto)}
        ${chk("ajustes.coletarNav","Ao renovar, ler o YouTube pelo navegador do Claude (só no app para computador)",A.coletarNav)}
        <div class="linha">${precisaRenovar(hojeIso())?`<button class="btn primario mini" type="button" data-acao="renovar-agora">Renovar esta semana agora</button>`:""}<button class="btn mini" type="button" data-acao="exportar-semanas">Exportar semanas (JSON)</button>${podeBaixar()?`<button class="btn mini" type="button" data-acao="baixar-semanas">Baixar semanas</button>`:""}</div>
        <p class="pequeno suave">Para levar o arquivo de semanas a outro aparelho, exporte aqui e cole na caixa de “Seus dados” do outro aparelho: as semanas se somam às que já existem, nada é apagado.</p>
      </div></div>
      <div class="painel"><div class="cab"><h3>Seus dados</h3></div><div class="corpo">
        <div class="linha"><button class="btn mini" type="button" data-acao="exportar">Exportar tudo (JSON)</button>${podeBaixar()?`<button class="btn mini" type="button" data-acao="baixar">Baixar arquivo</button>`:""}<button class="btn mini" type="button" data-acao="exportar-csv">Treinos em CSV</button>${podeBaixar()?`<button class="btn mini" type="button" data-acao="baixar-csv">Baixar CSV</button>`:""}</div>
        <textarea id="areaDados" placeholder="Cole aqui um JSON exportado deste app, ou o conteúdo de um CSV do Strong, Hevy ou FitNotes." aria-label="Dados para exportar ou importar"></textarea>
        <div class="linha"><label class="campo" style="flex:1">Ou escolha um arquivo<input type="file" id="arquivoDados" accept=".json,.csv,text/csv,application/json" data-campo="arquivo"></label>
          <label class="campo">Unidade do CSV<select id="unidadeCSV"><option value="kg">kg</option><option value="lb">lb</option></select></label></div>
        <div class="linha"><button class="btn primario mini" type="button" data-acao="importar">Importar o que está na caixa</button><button class="btn mini" type="button" data-acao="copiar-dados">Copiar</button></div>
        <p class="pequeno suave">O CSV sai no formato do Hevy, com uma coluna a mais com o id de cada exercício. Importar JSON substitui tudo. Importar CSV acrescenta os treinos ao histórico e cria exercícios para nomes que não reconhecer.</p>
        <hr style="border:0;border-top:2px dashed var(--linha);width:100%">
        <div class="linha"><button class="btn mini perigo" type="button" data-acao="comecar-zero">Apagar tudo e começar do zero</button><button class="btn mini" type="button" data-acao="restaurar-exemplo">Carregar dados de exemplo</button></div>
      </div></div>
    </div>
    <div class="painel" style="margin-top:18px"><div class="cab"><h3>Sobre</h3></div><div class="corpo pequeno">
      <p>O escopo de aplicativo (semana de rotinas, treino guiado com descanso, progressão explicada, 1RM, mapa muscular em três modos, calendário, peso corporal, importação do Strong, Hevy e FitNotes) segue o <a href="https://github.com/DuarteSantos8/openGym" target="_blank" rel="noopener">openGym</a>, projeto livre sob AGPL-3.0. Nenhum código dele foi copiado: este é um arquivo único escrito do zero, sem servidor.</p>
      <p>A física vem do Torquímetro: cada exercício é uma alavanca τ(θ) = F·|L·sen(θ−γ)| + d₀, com L proporcional à sua altura. O trabalho de uma repetição é a área sob essa curva, e o de uma série é esse valor vezes as repetições. É um modelo de demanda mecânica no segmento principal: não mede fibras, músculos individuais nem o custo energético do treino.</p>
      <p>Recuperação usa um decaimento simples por série (meia-vida de cerca de 21 horas). É contabilidade para orientar, não diagnóstico.</p>
    </div></div>`;
}
