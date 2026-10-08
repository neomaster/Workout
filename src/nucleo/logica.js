/* =====================================================================
   NÚCLEO DO TREINO — funções puras (sem DOM), testadas em node.
   A física vem do Torquímetro; aqui ela passa a medir o treino real.
   ===================================================================== */

/* ---------- contexto corporal (antes vinha dos inputs da página) ---------- */
const CTX = {H:1.75, M:78, PROP:{coxa:1, perna:1, tronco:1, braco:1, antebraco:1, pe:1, mao:1}};
function definirCtx(perfil){
  perfil = perfil || {};
  CTX.H = (+perfil.altura || 175)/100;
  CTX.M = +perfil.massa || 78;
  const c=(+perfil.propCoxa||0)/100, t=(+perfil.propTronco||0)/100, b=(+perfil.propBraco||0)/100;
  CTX.PROP = {coxa:1+c, perna:1+c*0.45, tronco:1+t, braco:1+b, antebraco:1+b, mao:1+b, pe:1+c*0.3};
  PERFIS.clear(); STATS_CACHE = {};
}
const compr = jt => jt.seg==="fixo" ? jt.f : SEG[jt.seg]*CTX.H*jt.f*(CTX.PROP[jt.seg]||1);

/* ---------- biblioteca: base do Torquímetro + exercícios do usuário ---------- */
let CUSTOM = [];
const MODO_TEMPO = {"prancha":true};               // registrados em segundos, não em repetições
const lib = () => BASE.concat(CUSTOM);
const porId = id => lib().find(e=>e.id===id);
const temPerfil = ex => !!(ex && Array.isArray(ex.juntas) && ex.juntas.length);
const ehTempo = ex => !!(ex && (ex.modo==="tempo" || MODO_TEMPO[ex.id]));
function grupos(){ return [...new Set(lib().map(e=>e.grupo))]; }

/* ---------- física ---------- */
function forcaN(ex, kg){
  if(!ex) return 0;
  const base = ex.tipo==="corporal" ? (CTX.M*(ex.frac||1) + (+kg||0)) : (+kg||0);
  return base*G*(ex.ff||1);
}
/* carga total que a articulação "sente": no exercício com peso do corpo, soma a fração corporal */
const cargaTotal = (ex, kg) => ex && ex.tipo==="corporal" ? CTX.M*(ex.frac||1) + (+kg||0) : (+kg||0);

function amostrar(ex, idxJunta, cargaKg, formaCm, N){
  N = N||121;
  const jt = ex.juntas[Math.min(idxJunta||0, ex.juntas.length-1)];
  const L = compr(jt), off = (jt.off||0) + (formaCm||0)/100;
  const F = forcaN(ex, cargaKg);
  const pontos = [];
  for(let i=0;i<N;i++){
    const p = i/(N-1);
    const beta = jt.b0 + jt.db*p;
    const d = Math.max(0, Math.abs(L*Math.sin((beta - jt.g)*R)) + off);
    pontos.push({p, beta, d, tau: F*d});
  }
  const amplitude = Math.abs(jt.db)*R;
  const dTheta = amplitude/(N-1);
  let W = 0; for(let i=0;i<N-1;i++) W += (pontos[i].tau+pontos[i+1].tau)/2*dTheta;
  let pico = 0, iPico = 0;
  pontos.forEach((pt,i)=>{ if(pt.tau>pico){pico=pt.tau;iPico=i;} });
  const zona = pontos.filter(pt=>pt.tau>=0.7*pico).length/N;
  const pPico = pontos[iPico].p;
  const regiao = pPico<0.35 ? "alongado" : (pPico<0.7 ? "meio" : "encurtado");
  const fatorRegiao = regiao==="alongado"?1.15:(regiao==="meio"?1.0:0.88);
  const IE = W*fatorRegiao*(0.7 + 0.3*zona);
  const cargaRef = Math.max(cargaTotal(ex, cargaKg), 0.1);
  const mediaTau = pontos.reduce((a,pt)=>a+pt.tau,0)/pontos.length;
  const variancia = pontos.reduce((a,pt)=>a+(pt.tau-mediaTau)**2,0)/pontos.length;
  const cv = mediaTau>0 ? Math.sqrt(variancia)/mediaTau : 0;
  const consistencia = Math.max(0, Math.min(100, 100 - cv*70));
  const aproveitamento = Math.max(0, Math.min(100, Math.abs(jt.db)/maxRom(jt.j)*100));
  return {pontos,W,pico,zona,pPico,regiao,IE,IEkg:IE/cargaRef,amplitude,grausROM:Math.abs(jt.db),
          jt,L,off,F,cargaRef,cv,consistencia,aproveitamento};
}

/* Perfil unitário: o torque é proporcional à força, então basta calcular uma vez por exercício
   com 1 N e escalar. W1 = joules por repetição para cada newton de carga. */
const PERFIS = new Map();
function perfil(ex){
  if(!temPerfil(ex)) return null;
  if(PERFIS.has(ex.id)) return PERFIS.get(ex.id);
  const r = amostrar(ex, 0, ex.carga||0, 0, 121);
  const F = r.F || 1;
  const fr = [0,0,0];                       // fatias de trabalho: alongado | meio | encurtado
  const dT = r.amplitude/(r.pontos.length-1);
  for(let i=0;i<r.pontos.length-1;i++){
    const a=r.pontos[i], b=r.pontos[i+1], pm=(a.p+b.p)/2;
    fr[pm<1/3?0:(pm<2/3?1:2)] += (a.tau+b.tau)/2*dT;
  }
  const tot = fr[0]+fr[1]+fr[2] || 1;
  const out = {W1:r.W/F, pico1:r.pico/F, regiao:r.regiao, pPico:r.pPico, fracoes:fr.map(v=>v/tot),
               forma:r.pontos.filter((_,i)=>i%6===0).map(pt=>r.pico>0?pt.tau/r.pico:0), r};
  PERFIS.set(ex.id, out);
  return out;
}
/* trabalho mecânico de uma série, em joules */
function trabalhoSerie(ex, kg, reps){
  const pf = perfil(ex);
  if(!pf || ehTempo(ex)) return 0;
  return pf.W1 * forcaN(ex, kg) * Math.max(0, +reps||0);
}
/* isometria: não há trabalho (sem deslocamento), mas há impulso de torque = torque médio × tempo */
function impulsoIsometrico(ex, kg, seg){
  const pf = perfil(ex); if(!pf) return 0;
  const tauMedio = pf.W1/Math.max(pf.r.amplitude,1e-6) * forcaN(ex,kg);
  return tauMedio * Math.max(0,+seg||0);
}

/* ---------- boletim (nota 0–10 dentro do grupo) ---------- */
let STATS_CACHE = {};
function statsGrupo(grupo){
  if(STATS_CACHE[grupo]) return STATS_CACHE[grupo];
  const base = lib().filter(e=>e.grupo===grupo && temPerfil(e)).map(e=>amostrar(e,0,e.carga||0,0,81));
  return STATS_CACHE[grupo] = {
    maxPico: Math.max(...base.map(r=>r.pico), 0.001),
    maxTrabalho: Math.max(...base.map(r=>r.W), 0.001),
    maxIEkg: Math.max(...base.map(r=>r.IEkg), 0.001)
  };
}
const letraNota = n => n>=8.5 ? "A" : n>=7 ? "B" : n>=5.5 ? "C" : n>=4 ? "D" : "E";
function avaliar(ex, r){
  if(!temPerfil(ex)) return null;
  r = r || amostrar(ex,0,ex.carga||0,0,81);
  const st = statsGrupo(ex.grupo);
  const eixos = {
    pico: Math.min(100, r.pico/st.maxPico*100),
    trabalho: Math.min(100, r.W/st.maxTrabalho*100),
    consistencia: r.consistencia,
    amplitude: r.aproveitamento,
    estimulo: Math.min(100, r.IEkg/st.maxIEkg*100)
  };
  const nota = (eixos.estimulo*0.5 + eixos.consistencia*0.25 + eixos.amplitude*0.25)/10;
  return {nota, letra:letraNota(nota), eixos};
}

/* ---------- equipamento (deduzido do nome, com exceções explícitas) ---------- */
const EQUIP_ID = {
  "crucifixo-inverso":"Halteres","elevacao-lateral-inclinada":"Halteres","elevacao-frontal":"Halteres",
  "rosca-concentrada":"Halteres","rosca-spider":"Halteres","rosca-martelo":"Halteres","rosca-inclinada":"Halteres",
  "bulgaro":"Halteres","step-up":"Halteres","goblet":"Halteres","stiff-unilateral":"Halteres","extensao-punho":"Halteres",
  "triceps-frances":"Halteres","triceps-coice":"Halteres","hip-thrust-unilateral":"Halteres",
  "rosca-scott":"Barra","rosca-inversa":"Barra","rosca-punho":"Barra","rosca-punho-invertida":"Barra","triceps-testa":"Barra",
  "remada-cavalinho":"Barra","supino-inclinado":"Barra","supino-declinado":"Barra","press-militar":"Barra",
  "agachamento-frontal":"Barra","agachamento-livre":"Barra","hip-thrust":"Barra","remada-yates":"Barra","remada-alta":"Barra",
  "bom-dia":"Barra","terra":"Barra","terra-sumo":"Barra","stiff":"Barra","supino-fechado":"Barra","remada-curvada":"Barra",
  "panturrilha-pe":"Máquina","lenhador":"Polia","pullover":"Polia","face-pull":"Polia",
  "puxada-neutra":"Polia","puxada-nuca":"Polia","arnold":"Halteres","crucifixo-inclinado":"Halteres"
};
const EQUIPAMENTOS = ["Barra","Halteres","Kettlebell","Polia","Máquina","Smith","Peso corporal"];
function equipamento(ex){
  if(!ex) return "Outro";
  if(ex.equip) return ex.equip;
  if(EQUIP_ID[ex.id]) return EQUIP_ID[ex.id];
  if(ex.tipo==="corporal") return "Peso corporal";
  const n=(ex.nome||"").toLowerCase();
  if(/smith/.test(n)) return "Smith";
  if(/polia|cabo|crossover|corda/.test(n)) return "Polia";
  if(/m[áa]quina|peck|extensora|flexora|leg press|hack|cadeira|mesa|burrinho|sentada/.test(n)) return "Máquina";
  if(/halter/.test(n)) return "Halteres";
  if(/barra/.test(n)) return "Barra";
  return "Outro";
}
const usaAnilhas = ex => ["Barra","Smith"].includes(equipamento(ex));

/* ---------- datas (sempre no fuso local) ---------- */
const pad2 = n => String(n).padStart(2,"0");
const isoDia = d => { d = new Date(d); return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); };
const deIso = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const somaDias = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const DIAS = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const DIAS_C = ["dom","seg","ter","qua","qui","sex","sáb"];
const MESES_C = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
function ordemSemana(inicio){ return inicio===0 ? [0,1,2,3,4,5,6] : [1,2,3,4,5,6,0]; }

/* ---------- força estimada ---------- */
function e1rm(kg, reps, rir){
  kg = +kg||0; reps = +reps||0;
  if(kg<=0 || reps<=0) return 0;
  const r = reps + (rir!=null && rir!=="" ? Math.max(0,+rir) : 0);
  return r<=1 ? kg : kg*(1+r/30);                       // Epley; com as reps que sobraram (RIR)
}
const seriesValidas = it => (it.series||[]).filter(s=>s.feito && s.tipo!=="aquec");

/* histórico de um exercício: sessões mais recentes primeiro */
function historicoEx(S, exId, antesDe){
  const out = [];
  for(const t of S.treinos){
    if(antesDe && t.data >= antesDe) continue;
    for(const it of t.itens) if(it.exId===exId){
      const sv = seriesValidas(it); if(sv.length) out.push({data:t.data, treinoId:t.id, series:sv});
    }
  }
  return out.sort((a,b)=> a.data<b.data?1:-1);
}
function melhorMarca(S, exId, antesDe){
  const ex = porId(exId);
  let best = {e1rm:0, kg:0, reps:0};
  for(const h of historicoEx(S, exId, antesDe)) for(const s of h.series){
    const kgT = cargaTotal(ex, s.kg);
    const v = ehTempo(ex) ? 0 : e1rm(kgT, s.reps, s.rir);
    if(v>best.e1rm) best.e1rm=v;
    if((+s.kg||0)>best.kg) best.kg=+s.kg||0;
    if((+s.reps||0)>best.reps) best.reps=+s.reps||0;
  }
  return best;
}

/* ---------- progressão: cada alvo explica de onde veio ---------- */
const arred = (v, passo) => Math.round(v/(passo||0.5))*(passo||0.5);
function alvoProgressao(item, hist, ex){
  const regra = item.progressao || "dupla";
  const min = +item.repsMin || 8, max = Math.max(min, +item.repsMax || min);
  const inc = +item.incremento || 2.5;
  const unid = ehTempo(ex) ? "s" : " reps";
  if(!hist || !hist.length){
    return {kg:null, reps:min, tipo:"novo",
      porque: ehTempo(ex) ? `Primeira vez: segure ${min} s com boa forma e anote o tempo real.`
                          : "Primeira vez: escolha uma carga em que sobrem 2–3 repetições no fim da série."};
  }
  const ult = hist[0];
  const kgUlt = Math.max(...ult.series.map(s=>+s.kg||0));
  const topo = ult.series.filter(s=>(+s.kg||0)===kgUlt);
  const repsTopo = topo.map(s=>+s.reps||0);
  const nSeries = +item.series || topo.length;
  const completas = topo.length >= nSeries;
  const kgFmt = v => (Math.round(v*100)/100).toString().replace(".",",")+" kg";

  /* quantas sessões seguidas, na mesma carga, ficaram abaixo do alvo */
  const alvoMin = regra==="linear" ? max : min;
  let falhas = 0;
  for(const h of hist){
    const k = Math.max(...h.series.map(s=>+s.kg||0));
    if(Math.abs(k-kgUlt)>1e-6) break;
    const reps = h.series.filter(s=>(+s.kg||0)===k).map(s=>+s.reps||0);
    if(reps.some(r=>r<alvoMin) || reps.length<nSeries) falhas++; else break;
  }

  if(ehTempo(ex)){
    if(completas && repsTopo.every(r=>r>=max))
      return {kg:kgUlt||null, reps:max+5, tipo:"subir", porque:`Todas as séries passaram de ${max} s: o alvo sobe para ${max+5} s.`};
    return {kg:kgUlt||null, reps:Math.min(max, Math.min(...repsTopo)+5), tipo:"manter",
      porque:`Na última sessão a menor série ficou em ${Math.min(...repsTopo)} s: busque +5 s até chegar a ${max} s.`};
  }
  if(regra==="nenhuma")
    return {kg:kgUlt, reps:min, tipo:"manter", porque:"Sem regra de progressão nesta rotina: repete a última carga."};

  if(falhas>=3 && kgUlt>0){
    const novo = arred(kgUlt*0.9);
    return {kg:novo, reps:min, tipo:"deload",
      porque:`Três sessões seguidas sem completar o alvo com ${kgFmt(kgUlt)}: deload de 10% (${kgFmt(novo)}) para reconstruir.`};
  }
  if(regra==="linear"){
    if(completas && repsTopo.every(r=>r>=max))
      return {kg:kgUlt+inc, reps:max, tipo:"subir",
        porque:`As ${topo.length} séries bateram ${max}${unid} com ${kgFmt(kgUlt)}: soma ${kgFmt(inc)}.`};
    return {kg:kgUlt, reps:max, tipo:"manter",
      porque:`Faltaram repetições na última sessão (falha ${falhas} de 3): carga mantida. Repetição perdida não soma carga.`};
  }
  /* dupla progressão */
  if(completas && repsTopo.every(r=>r>=max))
    return {kg:kgUlt+inc, reps:min, tipo:"subir",
      porque:`Todas as séries chegaram a ${max} reps com ${kgFmt(kgUlt)}: sobe ${kgFmt(inc)} e recomeça em ${min}.`};
  const menor = Math.min(...repsTopo);
  if(menor < min)
    return {kg:kgUlt, reps:min, tipo:"manter",
      porque:`A série mais fraca ficou em ${menor} reps, abaixo da faixa ${min}–${max} (falha ${falhas} de 3): mantém ${kgFmt(kgUlt)}.`};
  return {kg:kgUlt, reps:Math.min(max, menor+1), tipo:"manter",
    porque:`Dentro da faixa ${min}–${max} (série mais fraca: ${menor}): mantém ${kgFmt(kgUlt)} e busca +1 repetição.`};
}

/* ---------- anilhas por lado ---------- */
function calcularAnilhas(alvo, barra, disponiveis){
  alvo=+alvo||0; barra=+barra||0;
  if(alvo<barra) return {ok:false, lado:[], total:barra, sobra:barra-alvo, motivo:"abaixo do peso da barra"};
  let resto = (alvo-barra)/2;
  const lado = [];
  const pesos = Object.keys(disponiveis||{}).map(Number).filter(p=>p>0).sort((a,b)=>b-a);
  for(const p of pesos){
    let n = +disponiveis[p]||0;
    while(n>0 && resto >= p-1e-9){ lado.push(p); resto -= p; n--; }
  }
  const total = barra + 2*lado.reduce((a,b)=>a+b,0);
  return {ok: resto<1e-6, lado, total, sobra: Math.round((alvo-total)*100)/100};
}

/* ---------- sessão: totais, perfil de tensão e músculos ---------- */
function resumoTreino(t){
  let series=0, volume=0, J=0, impulso=0; const regioes=[0,0,0]; const musc={};
  for(const it of t.itens){
    const ex = porId(it.exId); if(!ex) continue;
    const sv = seriesValidas(it); if(!sv.length) continue;
    const pf = perfil(ex);
    const {primarios, secundarios} = identificarMusculos(ex);
    let Jit = 0;
    for(const s of sv){
      series++;
      if(ehTempo(ex)) impulso += impulsoIsometrico(ex, s.kg, s.reps);
      else { volume += (+s.kg||0)*(+s.reps||0); Jit += trabalhoSerie(ex, s.kg, s.reps); }
    }
    J += Jit;
    if(pf) pf.fracoes.forEach((f,i)=>regioes[i]+=f*Jit);
    primarios.forEach(m=>{ musc[m]=musc[m]||{series:0,J:0}; musc[m].series+=sv.length; musc[m].J+=Jit; });
    secundarios.forEach(m=>{ musc[m]=musc[m]||{series:0,J:0}; musc[m].series+=sv.length*0.5; musc[m].J+=Jit*0.5; });
  }
  const totR = regioes[0]+regioes[1]+regioes[2] || 1;
  return {series, volume, J, impulso, regioes:regioes.map(v=>v/totR), musc,
          duracaoMin: t.fim && t.inicio ? Math.round((t.fim-t.inicio)/60000) : null};
}

/* séries fracionadas e trabalho por músculo numa janela de dias */
function cargaMuscular(S, dias, agora){
  agora = agora || new Date();
  const corte = isoDia(somaDias(agora, -dias+1));
  const out = {};
  for(const t of S.treinos){
    if(t.data.slice(0,10) < corte) continue;
    const r = resumoTreino(t);
    for(const [m,v] of Object.entries(r.musc)){
      out[m]=out[m]||{series:0,J:0}; out[m].series+=v.series; out[m].J+=v.J;
    }
  }
  return out;
}
/* recuperação: cada série deixa uma "fadiga" que decai com meia-vida de ~21 h (τ = 30 h).
   É um modelo de contabilidade, não uma medida fisiológica. */
function recuperacao(S, agora){
  agora = agora || new Date();
  const fad = {}, ultimo = {};
  for(const t of S.treinos){
    const quando = new Date(t.fim || t.inicio || deIso(t.data.slice(0,10)));
    const h = (agora - quando)/3600000;
    if(h<0) continue;
    const r = resumoTreino(t);
    for(const [m,v] of Object.entries(r.musc)){
      if(!ultimo[m] || quando>ultimo[m]) ultimo[m]=quando;
      if(h<24*7) fad[m] = (fad[m]||0) + v.series*Math.exp(-h/30);
    }
  }
  const out = {};
  Object.keys(MUSCULOS).forEach(m=>{
    const f = fad[m]||0;
    out[m] = {recuperado: Math.max(0, Math.min(100, 100 - f*12)),
              diasSem: ultimo[m] ? Math.floor((agora-ultimo[m])/86400000) : null};
  });
  return out;
}

/* cobertura da amplitude por grupo muscular: onde caiu o trabalho real das últimas semanas */
function coberturaGrupos(S, dias, agora){
  agora = agora || new Date();
  const corte = isoDia(somaDias(agora, -dias+1));
  const out = {};
  for(const t of S.treinos){
    if(t.data.slice(0,10) < corte) continue;
    for(const it of t.itens){
      const ex = porId(it.exId); const pf = perfil(ex); if(!pf) continue;
      let J=0; seriesValidas(it).forEach(s=>J+=trabalhoSerie(ex,s.kg,s.reps));
      if(!J) continue;
      const g = out[ex.grupo] = out[ex.grupo] || {J:0, fr:[0,0,0], exs:new Set()};
      g.J += J; pf.fracoes.forEach((f,i)=>g.fr[i]+=f*J); g.exs.add(ex.id);
    }
  }
  Object.values(out).forEach(g=>{ const tot=g.fr[0]+g.fr[1]+g.fr[2]||1; g.fr=g.fr.map(v=>v/tot); });
  return out;
}
const NOMES_REGIAO = ["alongado","meio","encurtado"];
/* sugere, no mesmo grupo, o exercício que mais carrega a fatia que está faltando */
function sugerirParaRegiao(grupo, idxRegiao, excluir){
  let melhor=null, nota=-1;
  for(const ex of lib()){
    if(ex.grupo!==grupo || !temPerfil(ex) || (excluir&&excluir.has(ex.id)) || ehTempo(ex)) continue;
    const pf = perfil(ex), av = avaliar(ex);
    /* com "priorizar em alta" ligado, o termômetro das redes desempata */
    const alta = typeof classificar==="function" && PRIORIZAR_ALTA ? ((classificar(ex)||{}).termometro||0)/100*0.15 : 0;
    const v = pf.fracoes[idxRegiao]*0.7 + (av?av.nota/10:0)*0.3 + alta;
    if(v>nota){ nota=v; melhor=ex; }
  }
  return melhor;
}

/* ---------- plano semanal ---------- */
function rotinaDoDia(S, dia){
  const k = typeof dia==="string" ? dia : isoDia(dia);
  if(S.trocas && Object.prototype.hasOwnProperty.call(S.trocas,k)) return S.trocas[k];
  return S.semana[deIso(k).getDay()] || null;
}
function proximaSessao(S, desde){
  for(let i=1;i<=14;i++){
    const d = somaDias(desde, i), r = rotinaDoDia(S, d);
    if(r && S.rotinas[r]) return {data:d, rotinaId:r, emDias:i};
  }
  return null;
}

/* ---------- CSV: Strong, Hevy, FitNotes ---------- */
function parseCSV(txt){
  txt = txt.replace(/^﻿/,"");
  const primeira = txt.split(/\r?\n/)[0]||"";
  const sep = (primeira.split(";").length > primeira.split(",").length) ? ";" : ",";
  const linhas=[]; let campo="", linha=[], aspas=false;
  for(let i=0;i<txt.length;i++){
    const c=txt[i];
    if(aspas){
      if(c==='"'){ if(txt[i+1]==='"'){campo+='"';i++;} else aspas=false; }
      else campo+=c;
    } else if(c==='"') aspas=true;
    else if(c===sep){ linha.push(campo); campo=""; }
    else if(c==="\n"||c==="\r"){ if(c==="\r"&&txt[i+1]==="\n") i++; linha.push(campo); linhas.push(linha); linha=[]; campo=""; }
    else campo+=c;
  }
  if(campo!==""||linha.length){ linha.push(campo); linhas.push(linha); }
  const cab = (linhas.shift()||[]).map(h=>h.trim());
  return {cab, rows: linhas.filter(l=>l.some(v=>v.trim()!=="")).map(l=>Object.fromEntries(cab.map((h,i)=>[h,(l[i]||"").trim()])))};
}
const MES_EN = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
function parseDataLivre(s){
  s=(s||"").trim(); let m;
  if((m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/))) return new Date(+m[1],+m[2]-1,+m[3],+(m[4]||12),+(m[5]||0));
  if((m=s.match(/^(\d{1,2}) (\w{3})\w* (\d{4}),? ?(\d{1,2})?:?(\d{2})?/)) && MES_EN[m[2].toLowerCase()]!=null)
    return new Date(+m[3],MES_EN[m[2].toLowerCase()],+m[1],+(m[4]||12),+(m[5]||0));
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return new Date(+m[3],+m[2]-1,+m[1],12,0);
  const d = new Date(s); return isNaN(d) ? null : d;
}
const normNome = s => (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9 ()]/g," ").replace(/\s+/g," ").trim();
const ALIAS_EN = {
  "bench press (barbell)":"supino-reto","bench press":"supino-reto","incline bench press (barbell)":"supino-inclinado","incline bench press":"supino-inclinado",
  "decline bench press (barbell)":"supino-declinado","bench press (dumbbell)":"supino-halteres","dumbbell bench press":"supino-halteres",
  "chest fly (dumbbell)":"crucifixo","chest fly":"crucifixo","cable crossover":"crossover","cable fly":"crossover","chest fly (machine)":"peck-deck","pec deck":"peck-deck",
  "chest press (machine)":"supino-maquina","push up":"flexao-braco","push ups":"flexao-braco","close grip bench press":"supino-fechado","bench press close grip (barbell)":"supino-fechado",
  "pull up":"barra-fixa","pull ups":"barra-fixa","chin up":"chin-up","chin ups":"chin-up","lat pulldown (cable)":"puxada-frontal","lat pulldown":"puxada-frontal",
  "lat pulldown close grip (cable)":"puxada-neutra","bent over row (barbell)":"remada-curvada","barbell row":"remada-curvada","seated row (cable)":"remada-sentada","seated cable row":"remada-sentada",
  "dumbbell row":"remada-unilateral","bent over one arm row (dumbbell)":"remada-unilateral","t bar row":"remada-cavalinho","face pull (cable)":"face-pull","face pull":"face-pull",
  "pullover (dumbbell)":"pullover-halter","straight arm pulldown (cable)":"pullover","inverted row":"remada-invertida","seated row (machine)":"remada-maquina",
  "bicep curl (dumbbell)":"rosca-direta","dumbbell curl":"rosca-direta","bicep curl (barbell)":"rosca-barra-w","ez bar curl":"rosca-barra-w","hammer curl (dumbbell)":"rosca-martelo","hammer curl":"rosca-martelo",
  "preacher curl (barbell)":"rosca-scott","preacher curl":"rosca-scott","incline curl (dumbbell)":"rosca-inclinada","concentration curl":"rosca-concentrada","bicep curl (cable)":"rosca-polia-baixa","reverse curl (barbell)":"rosca-inversa",
  "triceps pushdown (cable straight bar)":"triceps-polia","triceps pushdown":"triceps-polia","triceps rope pushdown":"triceps-polia","skullcrusher (barbell)":"triceps-testa","skull crusher":"triceps-testa",
  "triceps extension (dumbbell)":"triceps-frances","overhead triceps extension (cable)":"triceps-corda-alta","triceps dip":"paralelas","dip":"paralelas","dips":"paralelas","bench dip":"mergulho-banco","triceps kickback (dumbbell)":"triceps-coice",
  "overhead press (barbell)":"press-militar","overhead press":"press-militar","shoulder press (dumbbell)":"desenvolvimento-halteres","shoulder press (machine)":"desenvolvimento-maquina","arnold press (dumbbell)":"arnold",
  "lateral raise (dumbbell)":"elevacao-lateral","lateral raise":"elevacao-lateral","lateral raise (cable)":"elevacao-lateral-polia","lateral raise (machine)":"elevacao-lateral-maquina","front raise (dumbbell)":"elevacao-frontal",
  "reverse fly (dumbbell)":"crucifixo-inverso","rear delt fly":"crucifixo-inverso","reverse fly (cable)":"crucifixo-inverso-polia","upright row (barbell)":"remada-alta","shrug (barbell)":"encolhimento-barra","shrug (dumbbell)":"encolhimento",
  "squat (barbell)":"agachamento-livre","squat":"agachamento-livre","back squat":"agachamento-livre","front squat (barbell)":"agachamento-frontal","front squat":"agachamento-frontal","squat (smith machine)":"agachamento-smith",
  "goblet squat (kettlebell)":"goblet","goblet squat":"goblet","hack squat":"hack","hack squat (machine)":"hack","leg press":"leg-press","leg press (machine)":"leg-press","leg extension (machine)":"extensora","leg extension":"extensora",
  "bulgarian split squat":"bulgaro","lunge (dumbbell)":"afundo","lunge":"afundo","step up":"step-up","sissy squat":"sissy-squat",
  "deadlift (barbell)":"terra","deadlift":"terra","sumo deadlift (barbell)":"terra-sumo","romanian deadlift (barbell)":"stiff","romanian deadlift":"stiff","stiff leg deadlift (barbell)":"stiff",
  "romanian deadlift (dumbbell)":"terra-romeno-halteres","good morning (barbell)":"bom-dia","hip thrust (barbell)":"hip-thrust","hip thrust":"hip-thrust","glute bridge":"hip-thrust",
  "lying leg curl (machine)":"mesa-flexora","lying leg curl":"mesa-flexora","seated leg curl (machine)":"flexora-sentada","seated leg curl":"flexora-sentada","nordic hamstring curl":"nordico",
  "hip abductor (machine)":"abducao-maquina","hip abduction":"abducao-maquina","back extension":"extensao-lombar-45","hyperextension":"extensao-lombar-45","glute kickback (cable)":"coice-polia",
  "standing calf raise":"panturrilha-pe","standing calf raise (machine)":"panturrilha-pe","seated calf raise":"panturrilha-sentada","seated calf raise (machine)":"panturrilha-sentada","calf press on leg press":"panturrilha-leg-press",
  "plank":"prancha","crunch":"abdominal-solo","cable crunch":"abdominal-polia","hanging leg raise":"elevacao-pernas","decline crunch":"abdominal-declinado","cable woodchop":"lenhador","wrist curl (barbell)":"rosca-punho","wrist curl":"rosca-punho"
};
function mapearNome(nome){
  const n = normNome(nome);
  if(ALIAS_EN[n]) return ALIAS_EN[n];
  const semPar = n.replace(/\s*\(.*?\)\s*/g," ").trim();
  if(ALIAS_EN[semPar]) return ALIAS_EN[semPar];
  const pt = lib().find(e=>normNome(e.nome)===n || normNome(e.nome)===semPar);
  return pt ? pt.id : null;
}
/* devolve {formato, treinos, novos (exercícios sem correspondência), ignoradas} */
function importarCSV(txt, unidade){
  const {cab, rows} = parseCSV(txt);
  const tem = h => cab.includes(h);
  let formato, col;
  if(tem("exercise_title")) { formato="Hevy"; col={data:"start_time",fim:"end_time",nome:"title",ex:"exercise_title",kg:"weight_kg",lb:"weight_lbs",reps:"reps",seg:"duration_seconds",rpe:"rpe",tipo:"set_type",id:tem("torquimetro_id")?"torquimetro_id":null}; }
  else if(tem("Exercise Name")) { formato="Strong"; col={data:"Date",nome:"Workout Name",ex:"Exercise Name",kg:cab.find(h=>/^Weight/.test(h)),reps:"Reps",seg:"Seconds",rpe:"RPE",ordem:"Set Order"}; }
  else if(tem("Exercise") && tem("Category")) { formato="FitNotes"; col={data:"Date",ex:"Exercise",kg:cab.find(h=>/^Weight/.test(h)),reps:"Reps",seg:"Time"}; }
  else return {erro:"Não reconheci o arquivo. Aceito exportações CSV do Strong, Hevy e FitNotes."};
  const fatorLb = (formato==="Hevy" && !tem("weight_kg") && tem("weight_lbs")) || unidade==="lb" || /lbs/i.test(col.kg||"") ? 0.45359237 : 1;
  const sessoes = new Map(), novos = new Map(); let ignoradas=0;
  for(const r of rows){
    const quando = parseDataLivre(r[col.data]);
    const nomeEx = r[col.ex];
    if(!quando || !nomeEx){ ignoradas++; continue; }
    if(formato==="Strong" && /rest timer/i.test(r[col.ordem]||"")) { ignoradas++; continue; }
    let id = col.id && r[col.id] && porId(r[col.id]) ? r[col.id] : mapearNome(nomeEx);
    if(!id){
      const nid = "imp-"+normNome(nomeEx).replace(/[^a-z0-9]+/g,"-").slice(0,40);
      if(!novos.has(nid)) novos.set(nid, {id:nid, nome:nomeEx, grupo:"Importados", carga:0, tipo:"externa", bi:false, juntas:[],
        nota:"Veio de uma importação; ainda sem perfil de torque. Edite para escolher a articulação."});
      id = nid;
    }
    const chave = formato==="FitNotes" ? isoDia(quando) : (quando.toISOString()+"|"+(r[col.nome]||""));
    if(!sessoes.has(chave)) sessoes.set(chave, {
      id:"t-imp-"+(sessoes.size+1)+"-"+quando.getTime().toString(36), data: isoDia(quando)+"T"+pad2(quando.getHours())+":"+pad2(quando.getMinutes()),
      nome: r[col.nome] || "Treino importado", rotinaId:null, inicio: quando.getTime(),
      fim: col.fim && parseDataLivre(r[col.fim]) ? parseDataLivre(r[col.fim]).getTime() : null, itens:[], origem:formato});
    const t = sessoes.get(chave);
    let it = t.itens.find(i=>i.exId===id); if(!it){ it={exId:id, series:[]}; t.itens.push(it); }
    const kgBruto = parseFloat(String(r[col.kg]||r[col.lb]||"0").replace(",","."))||0;
    const reps = parseFloat(r[col.reps])||0, seg = parseFloat(r[col.seg])||0;
    const rpe = parseFloat(r[col.rpe]);
    it.series.push({tipo: /warm/i.test(r[col.tipo]||"") ? "aquec" : "normal",
      kg: Math.round(kgBruto*fatorLb*100)/100, reps: reps || seg, rir: isNaN(rpe)?null:Math.max(0,10-rpe), feito:true});
  }
  return {formato, treinos:[...sessoes.values()].sort((a,b)=>a.data<b.data?-1:1), novos:[...novos.values()], ignoradas};
}

/* ---------- estado inicial, planos prontos e dados de exemplo ---------- */
const it = (exId, series, repsMin, repsMax, extra) => Object.assign({exId, series, repsMin, repsMax, descanso:null, progressao:"dupla", incremento:2.5, superset:""}, extra||{});
const PLANOS_PRONTOS = {
  ppl:{objetivo:"Hipertrofia", nivel:"Intermediário", dias:6, duracao:"60–75 min", nome:"Push / Pull / Pernas", desc:"6 dias, cada grupo duas vezes por semana.",
    rotinas:{
      push:{nome:"Push — empurrar", itens:[it("supino-reto",4,6,10,{incremento:2.5,descanso:150}),it("supino-inclinado",3,8,12),it("desenvolvimento-halteres",3,8,12,{incremento:2}),it("elevacao-lateral-polia",3,12,20,{incremento:1}),it("triceps-polia",3,10,15,{superset:"A",incremento:2.5}),it("triceps-frances",2,10,15,{superset:"A",incremento:2})]},
      pull:{nome:"Pull — puxar", itens:[it("barra-fixa",4,6,10,{incremento:2.5,descanso:150}),it("remada-curvada",3,8,12),it("puxada-neutra",3,10,12),it("face-pull",3,12,20,{incremento:2.5}),it("rosca-inclinada",3,8,12,{incremento:1,superset:"A"}),it("rosca-martelo",2,10,15,{incremento:2,superset:"A"})]},
      pernas:{nome:"Pernas", itens:[it("agachamento-livre",4,5,8,{incremento:5,descanso:180}),it("stiff",3,8,10,{incremento:5}),it("leg-press",3,10,15,{incremento:10}),it("mesa-flexora",3,10,15),it("panturrilha-pe",4,10,15,{incremento:5}),it("elevacao-pernas",3,10,15,{incremento:0})]}
    }, semana:{1:"push",2:"pull",3:"pernas",4:"push",5:"pull",6:"pernas"}},
  ul:{objetivo:"Hipertrofia e força", nivel:"Iniciante a intermediário", dias:4, duracao:"60 min", nome:"Superior / Inferior", desc:"4 dias, alternando metade de cima e de baixo.",
    rotinas:{
      supA:{nome:"Superior A", itens:[it("supino-reto",4,6,8,{descanso:150}),it("remada-curvada",4,6,10),it("press-militar",3,6,10),it("puxada-frontal",3,8,12),it("rosca-direta",2,10,12,{incremento:1}),it("triceps-testa",2,10,12)]},
      infA:{nome:"Inferior A", itens:[it("agachamento-livre",4,5,8,{incremento:5,descanso:180}),it("stiff",3,8,10,{incremento:5}),it("extensora",3,10,15),it("mesa-flexora",3,10,15),it("panturrilha-sentada",4,12,15,{incremento:5})]},
      supB:{nome:"Superior B", itens:[it("supino-inclinado",4,8,10),it("barra-fixa",4,6,10),it("desenvolvimento-halteres",3,8,12,{incremento:2}),it("remada-sentada",3,10,12),it("rosca-scott",2,10,12,{incremento:1}),it("triceps-polia",2,12,15)]},
      infB:{nome:"Inferior B", itens:[it("terra",3,4,6,{incremento:5,descanso:180}),it("bulgaro",3,8,12,{incremento:2}),it("hip-thrust",3,8,12,{incremento:5}),it("flexora-sentada",3,10,15),it("panturrilha-pe",4,10,15,{incremento:5})]}
    }, semana:{1:"supA",2:"infA",4:"supB",5:"infB"}},
  fb:{objetivo:"Condicionamento geral", nivel:"Iniciante", dias:3, duracao:"50–60 min", nome:"Corpo inteiro", desc:"3 dias, todos os grupos em cada sessão.",
    rotinas:{
      fbA:{nome:"Corpo inteiro A", itens:[it("agachamento-livre",3,6,10,{incremento:5,descanso:150}),it("supino-reto",3,6,10),it("remada-curvada",3,8,12),it("elevacao-lateral",2,12,15,{incremento:1}),it("rosca-direta",2,10,12,{incremento:1}),it("prancha",3,30,60,{incremento:0})]},
      fbB:{nome:"Corpo inteiro B", itens:[it("terra",3,4,6,{incremento:5,descanso:180}),it("press-militar",3,6,10),it("barra-fixa",3,6,10),it("afundo",2,10,12,{incremento:2}),it("triceps-polia",2,10,15),it("panturrilha-pe",3,10,15,{incremento:5})]}
    }, semana:{1:"fbA",3:"fbB",5:"fbA"}},
  cinco:{objetivo:"Força", nivel:"Iniciante", dias:3, duracao:"45–60 min", nome:"5×5", desc:"3 dias, progressão linear em cinco séries de cinco.",
    rotinas:{
      cA:{nome:"5×5 — A", itens:[it("agachamento-livre",5,5,5,{progressao:"linear",incremento:2.5,descanso:180}),it("supino-reto",5,5,5,{progressao:"linear",descanso:180}),it("remada-curvada",5,5,5,{progressao:"linear",descanso:150})]},
      cB:{nome:"5×5 — B", itens:[it("agachamento-livre",5,5,5,{progressao:"linear",incremento:2.5,descanso:180}),it("press-militar",5,5,5,{progressao:"linear",descanso:180}),it("terra",1,5,5,{progressao:"linear",incremento:5,descanso:180})]}
    }, semana:{1:"cA",3:"cB",5:"cA"}}
};
function aplicarPlano(S, chave){
  const P = PLANOS_PRONTOS[chave]; if(!P) return;
  const mapa = {};
  for(const [k,r] of Object.entries(P.rotinas)){
    const id = "r-"+chave+"-"+k;
    mapa[k]=id;
    S.rotinas[id] = {id, nome:r.nome, itens:JSON.parse(JSON.stringify(r.itens))};
  }
  S.semana = {0:null,1:null,2:null,3:null,4:null,5:null,6:null};
  for(const [d,k] of Object.entries(P.semana)) S.semana[d]=mapa[k];
  S.trocas = {};
}
function estadoVazio(){
  return {versao:1, exemplo:false,
    perfil:{nome:"", altura:175, massa:78, propCoxa:0, propTronco:0, propBraco:0, metaPeso:null, sincronizarMassa:true},
    ajustes:{inicioSemana:1, esforco:"RIR", descansoPadrao:90, barra:20, passo:0.5,
             anilhas:{"25":2,"20":2,"15":2,"10":2,"5":2,"2.5":2,"1.25":2}, piscar:false, som:true, equipFiltro:[], priorizarAlta:true, renovarAuto:true, coletarNav:true},
    rotinas:{}, semana:{0:null,1:null,2:null,3:null,4:null,5:null,6:null}, trocas:{},
    treinos:[], peso:[], medidas:[], custom:[], videos:[], notas:{}, ativo:null};
}
/* gerador determinístico de exemplo: 10 semanas de Superior/Inferior com progressão plausível */
function gerarExemplo(hoje){
  hoje = hoje || new Date();
  const S = estadoVazio(); S.exemplo = true;
  aplicarPlano(S, "ul");
  let semente = 20261004;
  const rnd = () => (semente = (semente*1103515245+12345) % 2147483648)/2147483648;
  const kgAtual = {};
  const inicio = somaDias(hoje, -70);
  for(let i=0;i<70;i++){
    const d = somaDias(inicio, i);
    if(isoDia(d)>=isoDia(hoje)) break;
    const rid = rotinaDoDia(S, d); if(!rid) continue;
    if(rnd()<0.1) continue;                                   // algumas faltas, como na vida real
    const R0 = S.rotinas[rid];
    const ini = new Date(d); ini.setHours(18, Math.floor(rnd()*40), 0, 0);
    const t = {id:"t-ex-"+i, data:isoDia(d)+"T"+pad2(ini.getHours())+":"+pad2(ini.getMinutes()), nome:R0.nome, rotinaId:rid,
               inicio:ini.getTime(), fim:ini.getTime()+(52+Math.floor(rnd()*25))*60000, itens:[]};
    for(const item of R0.itens){
      const ex = porId(item.exId);
      const hist = historicoEx(S, item.exId);
      let alvo = alvoProgressao(item, hist, ex);
      let kg = alvo.kg;
      if(kg==null) kg = ex.tipo==="corporal" ? 0 : arred((ex.carga||20)*0.62, 2.5);
      if(ehTempo(ex)) kg = 0;
      kgAtual[item.exId]=kg;
      const series = [];
      if(usaAnilhas(ex) && kg>40) series.push({tipo:"aquec", kg:arred(kg*0.5,2.5), reps:8, rir:null, feito:true});
      for(let s=0;s<item.series;s++){
        const fadiga = s*0.35;
        let reps = Math.round(alvo.reps + rnd()*2.6 - 0.2 - fadiga);
        reps = Math.max(ehTempo(ex)?20:Math.max(1,item.repsMin-2), Math.min(item.repsMax+(ehTempo(ex)?10:1), reps));
        series.push({tipo:"normal", kg, reps, rir: Math.max(0, Math.min(4, Math.round(2.4-s*0.6+rnd()))), feito:true});
      }
      t.itens.push({exId:item.exId, series});
    }
    S.treinos.push(t);
  }
  for(let i=70;i>=0;i-=2+Math.floor(rnd()*2)){
    const kg = Math.round((79.6 - (70-i)*0.022 + (rnd()-0.5)*0.8)*10)/10;
    S.peso.push({data:isoDia(somaDias(hoje,-i)), kg});
  }
  S.peso.sort((a,b)=>a.data<b.data?-1:1);
  S.perfil.metaPeso = 77; S.perfil.massa = S.peso[S.peso.length-1].kg;
  return S;
}
