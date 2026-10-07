/* =====================================================================
   FUNÇÕES DE TREINO EXTRAS
   rampa de aquecimento · plano × feito · exportação CSV · rotina por link
   ===================================================================== */

/* Rampa de aquecimento até a carga de trabalho. Com barra, começa na barra vazia.
   Devolve [{kg, reps}] em ordem crescente, sem repetir carga e sempre abaixo do trabalho. */
function rampaAquecimento(ex, kg, aj){
  aj = aj || {}; kg = +kg || 0;
  if(!ex || ex.tipo==="corporal" || ehTempo(ex) || kg<=0) return [];
  const passo = +aj.passo || 2.5, barra = usaAnilhas(ex) ? (aj.barra==null ? 20 : +aj.barra) : 0;
  const passos = kg<=30 ? [[0.5,10]] : kg<=60 ? [[0.5,8],[0.75,4]] : kg<140 ? [[0.4,8],[0.6,5],[0.8,3]] : [[0.4,8],[0.6,5],[0.75,3],[0.88,1]];
  const out = [];
  if(barra && kg >= barra+20) out.push({kg:barra, reps:10});
  for(const [f,reps] of passos){
    const v = Math.max(barra, arred(kg*f, passo));
    if(v>=kg || (out.length && v<=out[out.length-1].kg)) continue;
    out.push({kg:v, reps});
  }
  return out;
}

/* Séries semanais por músculo que o plano prevê (secundário conta meia) */
function seriesPlanejadas(S){
  const musc = {};
  for(let d=0; d<7; d++){
    const r = S.rotinas[S.semana[d]]; if(!r) continue;
    for(const item of r.itens){
      const ex = porId(item.exId); if(!ex) continue;
      const {primarios, secundarios} = identificarMusculos(ex);
      primarios.forEach(m=>musc[m]=(musc[m]||0)+(+item.series||0));
      secundarios.forEach(m=>musc[m]=(musc[m]||0)+(+item.series||0)*0.5);
    }
  }
  return musc;
}
/* Plano × feito nos últimos 7 dias, por músculo. pct = feito ÷ plano. */
function planoVsFeito(S, agora){
  const plano = seriesPlanejadas(S), feito = cargaMuscular(S, 7, agora);
  const ms = new Set([...Object.keys(plano), ...Object.keys(feito)].filter(m=>MUSCULOS[m]));
  const linhas = [...ms].map(m=>{ const p = plano[m]||0, f = (feito[m]||{}).series||0;
    return {m, plano:p, feito:f, pct: p ? f/p : null}; });
  linhas.sort((a,b)=>(a.pct==null?9:a.pct)-(b.pct==null?9:b.pct) || b.plano-a.plano);
  const P = linhas.reduce((s,l)=>s+l.plano,0), F = linhas.reduce((s,l)=>s+Math.min(l.feito,l.plano),0);
  return {linhas, aderencia: P ? F/P : null};
}

/* Exportação em CSV no formato do Hevy (o importador daqui lê de volta, inclusive o id) */
const csvCampo = v => { const s = v==null ? "" : String(v); return /[",\n;]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; };
function exportarCSV(S){
  const cab = ["title","start_time","end_time","description","exercise_title","superset_id","exercise_notes","set_index","set_type","weight_kg","reps","distance_km","duration_seconds","rpe","torquimetro_id"];
  const quando = ms => { const d = new Date(ms); return isoDia(d)+" "+pad2(d.getHours())+":"+pad2(d.getMinutes()); };
  const linhas = [cab.join(",")];
  const treinos = S.treinos.slice().sort((a,b)=>a.data<b.data?-1:1);
  for(const t of treinos){
    const ini = t.inicio || deIso(t.data.slice(0,10)).setHours(12,0,0,0);
    const inicio = t.data.length>10 ? t.data.replace("T"," ") : quando(ini);
    const fim = t.fim ? quando(t.fim) : "";
    for(const it of t.itens){
      const ex = porId(it.exId); if(!ex) continue;
      const tempo = ehTempo(ex);
      it.series.forEach((s,i)=>{
        linhas.push([t.nome, inicio, fim, "", ex.nome, "", (S.notas||{})[ex.id]||"", i, s.tipo==="aquec"?"warmup":"normal",
          +s.kg||0, tempo?"":(+s.reps||0), "", tempo?(+s.reps||0):"", s.rir==null||s.rir===""?"":10-s.rir, ex.id].map(csvCampo).join(","));
      });
    }
  }
  return linhas.join("\n")+"\n";
}

/* Rotina dentro de um link: JSON → UTF-8 → base64url, no fragmento (#rotina=...) */
function codificarRotina(pacote){
  const bytes = new TextEncoder().encode(JSON.stringify(pacote));
  let bin = ""; bytes.forEach(b=>bin+=String.fromCharCode(b));
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function decodificarRotina(txt){
  try{
    let b = String(txt||"").trim().replace(/-/g,"+").replace(/_/g,"/"); while(b.length%4) b+="=";
    const bin = atob(b), bytes = Uint8Array.from(bin, c=>c.charCodeAt(0));
    const o = JSON.parse(new TextDecoder().decode(bytes));
    return o && o.tipo==="rotina" && o.rotina && Array.isArray(o.rotina.itens) ? o : null;
  }catch(e){ return null; }
}

/* =====================================================================
   NUVEM (Supabase): conversão e mescla, sem rede — a rede fica em ui/nuvem.js
   ===================================================================== */
/* hash curto e estável de um valor (FNV-1a sobre o JSON) */
function hashTexto(v){
  const s = typeof v==="string" ? v : JSON.stringify(v);
  let h = 0x811c9dc5;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h>>>0).toString(36);
}
const msParaIso = ms => ms==null || ms==="" ? null : new Date(+ms).toISOString();
const isoParaMs = iso => iso ? new Date(iso).getTime() : null;
/* data local "AAAA-MM-DDTHH:MM" → instante (o fuso do aparelho) e de volta */
const dataLocalParaIso = d => { const [a,h] = String(d).split("T"); const [Y,M,D] = a.split("-").map(Number); const [hh,mm] = (h||"12:00").split(":").map(Number); return new Date(Y,M-1,D,hh||0,mm||0).toISOString(); };
const isoParaDataLocal = iso => { const d = new Date(iso); return isoDia(d)+"T"+pad2(d.getHours())+":"+pad2(d.getMinutes()); };
function linhaDeTreino(t){
  return {id:t.id, data:dataLocalParaIso(t.data), nome:(t.nome||"Treino").slice(0,120), rotina_id:t.rotinaId||null,
    inicio:msParaIso(t.inicio), fim:msParaIso(t.fim), origem:t.origem||null, itens:t.itens||[], apagado:false};
}
function treinoDeLinha(r){
  const t = {id:r.id, data:isoParaDataLocal(r.data), nome:r.nome, rotinaId:r.rotina_id||null, inicio:isoParaMs(r.inicio), fim:isoParaMs(r.fim), itens:r.itens||[]};
  if(r.origem) t.origem = r.origem;
  return t;
}
/* o que importa comparar num treino (a ordem das chaves não pode mudar o hash) */
const assinaturaTreino = t => hashTexto([t.id, t.data, t.nome||"", t.rotinaId||null, t.inicio||null, t.fim||null, t.origem||null, t.itens||[]]);

/* Mescla os treinos da nuvem nos locais.
   memo: {hashes:{id:assinatura enviada/recebida na última sincronização}, apagados:[ids apagados aqui]}
   Regras: apagado lá → sai daqui (a menos que tenha sido editado aqui depois);
           só lá → entra aqui; nos dois e diferente → vence quem mudou desde a última sincronização
           (se os dois mudaram, fica o daqui e ele sobe). */
function mesclarTreinosNuvem(locais, remotas, memo){
  memo = memo || {}; const hashes = memo.hashes || {}, apagadosAqui = new Set(memo.apagados || []);
  const porId = new Map(locais.map(t=>[t.id, t]));
  const resultado = new Map(porId);
  let recebidos = 0, removidos = 0;
  for(const r of remotas){
    const aqui = porId.get(r.id);
    if(r.apagado){
      if(aqui && (!hashes[r.id] || assinaturaTreino(aqui)===hashes[r.id])){ resultado.delete(r.id); removidos++; }
      continue;
    }
    if(apagadosAqui.has(r.id)) continue;                 /* apagado neste aparelho: a exclusão sobe */
    const lá = treinoDeLinha(r), hLa = assinaturaTreino(lá);
    if(!aqui){ resultado.set(r.id, lá); recebidos++; continue; }
    const hAqui = assinaturaTreino(aqui);
    if(hAqui===hLa) continue;
    const mudouAqui = hashes[r.id] && hAqui!==hashes[r.id];
    if(!mudouAqui){ resultado.set(r.id, lá); recebidos++; }
  }
  const treinos = [...resultado.values()].sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:0);
  const remotosPorId = new Map(remotas.filter(r=>!r.apagado).map(r=>[r.id, assinaturaTreino(treinoDeLinha(r))]));
  const enviar = treinos.filter(t=>remotosPorId.get(t.id)!==assinaturaTreino(t));
  return {treinos, enviar, apagar:[...apagadosAqui], recebidos, removidos};
}

/* o restante do estado que viaja junto (sem os treinos, sem o treino em andamento) */
const CHAVES_ESTADO_NUVEM = ["perfil","ajustes","rotinas","semana","trocas","peso","custom","notas","videos"];
const estadoParaNuvem = S => Object.fromEntries(CHAVES_ESTADO_NUVEM.map(k=>[k, S[k]]));
/* primeira sincronização num aparelho que já tem dados: soma em vez de sobrescrever */
function mesclarEstadoPrimeiraVez(local, remoto){
  const out = Object.assign({}, remoto, {
    rotinas: Object.assign({}, remoto.rotinas||{}, local.rotinas||{}),
    trocas: Object.assign({}, remoto.trocas||{}, local.trocas||{}),
    notas: Object.assign({}, remoto.notas||{}, local.notas||{}),
    peso: [...new Map([...(remoto.peso||[]), ...(local.peso||[])].map(p=>[p.data,p])).values()].sort((a,b)=>a.data<b.data?-1:1),
    custom: [...new Map([...(remoto.custom||[]), ...(local.custom||[])].map(c=>[c.id,c])).values()],
    videos: [...new Map([...(remoto.videos||[]), ...(local.videos||[])].map(v=>[v.url||JSON.stringify(v),v])).values()]
  });
  /* a semana local vale se tiver algo marcado */
  if(local.semana && Object.values(local.semana).some(Boolean)) out.semana = local.semana;
  return out;
}
