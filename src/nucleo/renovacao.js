/* =====================================================================
   RENOVAÇÃO SEMANAL NO PRÓPRIO ALGORITMO
   Cada semana (de segunda a domingo) tem uma renovação. Ao abrir o app
   numa semana ainda sem renovação, ele mesmo a faz:
     · "navegador"  — coletou o YouTube agora, pelo navegador do app Claude;
     · "automática" — sem coleta possível: recalcula o termômetro na data
                      de hoje (vídeos envelhecem, o momento muda) e mantém
                      o último sinal medido de cada rede;
     · "pesquisa" / "arquivo" — levantamento feito fora do app.
   Nada sai do acervo: um exercício que entrou numa semana continua na
   biblioteca e listado na semana em que entrou e nas seguintes.
   ===================================================================== */
const FONTES_RENOV = {
  pesquisa:{nome:"varredura completa", desc:"TikTok, YouTube e Instagram vasculhados fora do app"},
  arquivo:{nome:"arquivo de atualização", desc:"alta.json publicado com a página"},
  navegador:{nome:"coleta no YouTube", desc:"o próprio app abriu as buscas do YouTube no navegador do Claude"},
  "automática":{nome:"renovação automática", desc:"recalculada na data de hoje com o último sinal medido de cada rede"}
};
const PESO_FONTE = {"automática":0, arquivo:1, navegador:2, pesquisa:3};
const segundaDe = iso => { const d = deIso(iso.slice(0,10)); return isoDia(somaDias(d, -((d.getDay()+6)%7))); };
const domingoDe = iso => isoDia(somaDias(deIso(segundaDe(iso)), 6));
/* garante o formato completo em entradas antigas */
function normalizarSemana(s){
  if(!s || !s.data) return null;
  s.semana = s.semana || segundaDe(s.data);
  s.feita = s.feita || s.data;
  s.fonte = s.fonte || "pesquisa";
  s.sinais = s.sinais || {};
  return s;
}
/* uma renovação por semana; dentro da mesma semana vale a de fonte mais forte (ou a mais recente, se empatar) */
function mesclarHistorico(...listas){
  const porSemana = new Map();
  listas.flat().map(normalizarSemana).filter(Boolean).forEach(s=>{
    const a = porSemana.get(s.semana);
    if(!a || (PESO_FONTE[s.fonte]||0) > (PESO_FONTE[a.fonte]||0) || ((PESO_FONTE[s.fonte]||0)===(PESO_FONTE[a.fonte]||0) && s.feita > a.feita)) porSemana.set(s.semana, s);
  });
  const out = [...porSemana.values()].sort((a,b)=>a.semana<b.semana?-1:1);
  /* quem entrou: comparação com a semana anterior */
  out.forEach((s,i)=>{ const ant = i ? out[i-1].sinais : null; s.entraram = ant ? Object.keys(s.sinais).filter(id=>!ant[id]) : Object.keys(s.sinais); });
  return out.slice(-104);
}
const ultimaRenovacao = () => HISTORICO_ALTA[HISTORICO_ALTA.length-1];
const precisaRenovar = hojeIso => !HISTORICO_ALTA.length || segundaDe(hojeIso) > ultimaRenovacao().semana;

/* ---- leitura do texto de uma busca do YouTube (pt-BR ou inglês) ---- */
const MULT_VIEWS = {"":1, mil:1e3, k:1e3, mi:1e6, m:1e6, bi:1e9, b:1e9};
function numeroViews(txt){
  const m = String(txt).trim().toLowerCase().match(/^([\d.,]+)\s*(mil|mi|bi|k|m|b)?\.?(\s+(de\s+)?(visualizações|visualizacoes|views))?$/);
  if(!m) return null;
  let n = m[1];
  if(!m[2]) n = n.replace(/[.,]/g,"");                                  /* 12.345 / 12,345 */
  else if(/^(mil|mi|bi)$/.test(m[2])) n = n.replace(/\./g,"").replace(",",".");   /* 3,6 mil */
  else n = n.replace(/,/g,"");                                          /* 1.2M */
  const v = parseFloat(n) * MULT_VIEWS[m[2]||""];
  return isFinite(v) ? Math.round(v) : null;
}
function idadeMeses(txt){
  const t = String(txt).trim().toLowerCase();
  let m = t.match(/^há\s+(\d+)\s+(segundo|minuto|hora|dia|semana|m[eê]s|meses|ano)s?$/) || t.match(/^(?:streamed\s+)?(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/);
  if(!m) return null;
  const n = +m[1], u = m[2];
  if(/^(segundo|minuto|hora|second|minute|hour)/.test(u)) return 0;
  if(/^(dia|day)/.test(u)) return n/30;
  if(/^(semana|week)/.test(u)) return n*7/30;
  if(/^(m[eê]s|meses|month)/.test(u)) return n;
  return n*12;
}
const mesAntes = (refIso, meses) => { const d = deIso(refIso.slice(0,10)); d.setDate(1); d.setMonth(d.getMonth()-Math.round(meses)); return d.getFullYear()+"-"+pad2(d.getMonth()+1); };
/* devolve {r, s, n, views, d} no mesmo formato de P.yt, ou null se a página não trouxe resultados */
function lerBuscaYouTube(texto, hojeIso){
  if(!texto) return null;
  const linhas = String(texto).split(/\n+/).map(l=>l.trim()).filter(Boolean);
  const vids = []; let emShorts = false;
  linhas.forEach((l,i)=>{
    if(/^shorts$/i.test(l) && i>4) emShorts = true;
    const v = numeroViews(l); if(v==null) return;
    const idade = idadeMeses(linhas[i+1]||"");
    const ehShort = idade==null && /visualiza|views/i.test(l);
    if(idade==null && !ehShort) return;          /* número solto que não é um vídeo */
    if(idade!=null) emShorts = false;
    vids.push({views:v, meses:idade, short:ehShort||emShorts && idade==null});
  });
  if(!vids.length) return null;
  const relevantes = vids.filter(v=>v.views>=20000);
  const longos = vids.filter(v=>v.meses!=null);
  return {r:Math.min(10, relevantes.length*2), s:Math.min(4, vids.filter(v=>v.short).length), n:vids.length,
    views:vids.reduce((a,v)=>a+v.views,0), d:longos.map(v=>mesAntes(hojeIso, v.meses)).sort()};
}

/* ---- a renovação ----
   coletas: {id: {yt}} medido agora (pode ser vazio). Quem não foi medido
   mantém o último sinal. Exercícios anteriores nunca são retirados. */
function renovar(hojeIso, coletas, agora){
  coletas = coletas || {};
  const ant = ultimaRenovacao(), base = ant ? ant.sinais : sinaisAtuais();
  const sinais = {};
  Object.keys(ALTA_PESQUISA).forEach(id=>{ if(base[id] || ALTA_PESQUISA[id]) sinais[id] = JSON.parse(JSON.stringify(base[id] || {tt:ALTA_PESQUISA[id].tt, yt:ALTA_PESQUISA[id].yt})); });
  Object.keys(base).forEach(id=>{ if(!sinais[id]) sinais[id] = base[id]; });
  let medidos = 0;
  Object.entries(coletas).forEach(([id,c])=>{ if(sinais[id] && c && c.yt){ sinais[id].yt = c.yt; medidos++; } });
  const feita = agora || (hojeIso.slice(0,10)===isoDia(new Date()) ? new Date() : new Date(deIso(hojeIso.slice(0,10)).getTime() + 12*36e5));
  const entrada = {data:hojeIso.slice(0,10), semana:segundaDe(hojeIso), feita:feita.toISOString(),
    fonte: medidos ? "navegador" : "automática", medidos, sinais};
  HISTORICO_ALTA = mesclarHistorico(HISTORICO_ALTA, [entrada]);
  /* a pesquisa passa a usar os sinais desta semana */
  Object.entries(sinais).forEach(([id,s])=>{ if(ALTA_PESQUISA[id]){ ALTA_PESQUISA[id].tt = s.tt; ALTA_PESQUISA[id].yt = s.yt; } });
  LEVANTAMENTO = entrada.data;
  CLASS_CACHE.clear(); VAR_CACHE = null; STATS_CACHE = {};
  return entrada;
}

/* ---- arquivo das semanas: cada uma com a data da renovação e seus exercícios ---- */
function semanasArquivo(){
  return HISTORICO_ALTA.map((s,i)=>{
    const termos = termometrosDe(s), pos = posicoesDe(termos);
    const itens = Object.keys(termos).sort((a,b)=>pos[a]-pos[b]).map(id=>({id, termometro:termos[id], pos:pos[id], novo:(s.entraram||[]).includes(id)}));
    return {i, semana:s.semana, ate:domingoDe(s.semana), data:s.data, feita:s.feita, fonte:s.fonte, medidos:s.medidos||0, itens,
      entraram:(s.entraram||[]).filter(id=>porId(id))};
  }).reverse();
}
/* em que semana o exercício entrou na parada */
function semanaDeEntrada(id){
  const s = HISTORICO_ALTA.find(h=>h.sinais && h.sinais[id]);
  return s ? s.semana : null;
}
function exportarDadosAlta(){
  const exercicios = BASE.filter(e=>e.atualizacao).map(e=>{ const c = Object.assign({}, e); delete c.fonte; return c; });
  return {versao:2, levantamento:LEVANTAMENTO, pesquisa:ALTA_PESQUISA, exercicios, historico:HISTORICO_ALTA};
}
/* junta semanas vindas de fora (banco compartilhado, cache) sem perder as locais */
function incorporarSemanas(lista){
  if(!Array.isArray(lista) || !lista.length) return false;
  const antes = JSON.stringify(HISTORICO_ALTA.map(h=>[h.semana,h.fonte,h.feita]));
  HISTORICO_ALTA = mesclarHistorico(HISTORICO_ALTA, lista.filter(h=>h && h.sinais && h.data));
  const ult = ultimaRenovacao();
  Object.entries(ult.sinais).forEach(([id,s])=>{ if(ALTA_PESQUISA[id]){ ALTA_PESQUISA[id].tt = s.tt; ALTA_PESQUISA[id].yt = s.yt; } });
  LEVANTAMENTO = ult.data;
  CLASS_CACHE.clear(); VAR_CACHE = null; STATS_CACHE = {};
  return JSON.stringify(HISTORICO_ALTA.map(h=>[h.semana,h.fonte,h.feita])) !== antes;
}
