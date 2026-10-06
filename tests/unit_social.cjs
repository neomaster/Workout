const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={lib,porId,perfil,avaliar,lerPost,casarExercicio,lerSeriesReps,lerDescanso,PLANOS_PRONTOS,EXTRA_REDES,identificarMusculos,equipamento,tagsDe,redeDe,tipoLink,POST_EXEMPLO,trabalhoSerie,grupos};`);
const a=require('assert');
const ids=T.lib().map(e=>e.id); a.strictEqual(new Set(ids).size, ids.length,'ids duplicados');
console.log('total', ids.length, 'novos', T.EXTRA_REDES.length, 'grupos', T.grupos().join(', '));
console.log('\n— física dos novos —');
for(const e of T.EXTRA_REDES){ const p=T.perfil(e), av=T.avaliar(e), m=T.identificarMusculos(e);
  a.ok(p && p.W1>0, e.id+' sem trabalho');
  console.log(e.id.padEnd(28), p.regiao.padEnd(9), p.fracoes.map(v=>v.toFixed(2)).join('/'), 'nota', av.nota.toFixed(1), av.letra, '|', T.equipamento(e), '|', m.primarios.join('+'), '| #'+T.tagsDe(e)[0]); }
console.log('\n— programas das redes: todo exercício existe —');
for(const [k,P] of Object.entries(T.PLANOS_PRONTOS)){ for(const r of Object.values(P.rotinas)) for(const i of r.itens) a.ok(T.porId(i.exId), k+': '+i.exId); }
const along = Object.values(T.PLANOS_PRONTOS.alongado.rotinas).flatMap(r=>r.itens).map(i=>[i.exId, T.perfil(T.porId(i.exId)).regiao]);
console.log('alongado:', along.map(x=>x[0]+':'+x[1]).join(', '));
console.log('\n— casamento de nomes —');
const casos = {"Supino reto":"supino-reto","Bench press":"supino-reto","Press banca":"supino-reto","Dominadas":"barra-fixa","Jalón al pecho":"puxada-frontal","Sentadilla búlgara":"bulgaro",
 "Peso muerto rumano":"stiff","Peso muerto":"terra","Voador":"peck-deck","Tríceps corda":"triceps-polia","Tríceps francês":"triceps-frances","Remada baixa":"remada-sentada",
 "Elevaciones laterales":"elevacao-lateral","Cable Y raise":"elevacao-y-polia","Kelso shrug":"encolhimento-kelso","Reverse nordic":"nordico-reverso","Tibialis raise":"tibial-tib-bar",
 "Lat prayer":"lat-prayer","Chest supported row":"remada-apoiada","Seated cable fly":"crucifixo-polia-sentado","JM press":"jm-press","ATG split squat":"agachamento-atg","Leg press 45":"leg-press",
 "Hip thrust":"hip-thrust","Elevação pélvica":"hip-thrust","Curl femoral sentado":"flexora-sentada","Gemelos de pie":"panturrilha-pe","Plancha":"prancha","Romanian deadlift":"stiff",
 "Remada apoiada no banco":"remada-apoiada","Elevação lateral na polia":"elevacao-lateral-polia","Rosca bayesiana":"rosca-bayesiana","Supino inclinado com halteres":"supino-inclinado-halteres",
 "Agachamento livre":"agachamento-livre","Cadeira extensora":"extensora","Mesa flexora":"mesa-flexora","Panturrilha em pé":"panturrilha-pe","Stiff":"stiff","Lateral raise":"elevacao-lateral",
 "Incline DB press":"supino-inclinado-halteres","Hammer curl":"rosca-martelo","Pendulum squat":"agachamento-pendular","Spanish squat":"agachamento-espanhol","Barra fixa":"barra-fixa","Puxada triângulo":"puxada-neutra",
 "Cross body cable tricep extension":"triceps-cruzado","Desenvolvimento com halteres":"desenvolvimento-halteres","Prensa":"leg-press","Curl martillo":"rosca-martelo","Fondos":"paralelas"};
let ok=0; for(const [q,esp] of Object.entries(casos)){ const c=T.casarExercicio(q)[0]; const hit=c&&c.ex.id===esp; if(hit) ok++; else console.log('  ✗', q, '→', c&&c.ex.id, c&&c.score.toFixed(2), '(esperado', esp+')'); }
console.log('acertos', ok, '/', Object.keys(casos).length);
console.log('\n— séries e reps —');
for(const s of ["4x8-10","4 x 12","3x10/12","4x12,10,8,6","3 séries de 12","3 sets of 10-12","4 series de 15 repeticiones","3x45s","3x1min","3x falha","12-10-8","5x5","3 x 8 a 12","sem números"]) { const r=T.lerSeriesReps(s); console.log(s.padEnd(30), r?`${r.series} × ${r.repsMin}-${r.repsMax}${r.tempo?' s':''}${r.falha?' falha':''}`:'—'); }
for(const s of ["Descanso 90s","descanso 2min","rest 1:30","Descanso: 1'30","pausa de 60 segundos"]) { const r=T.lerDescanso(s); console.log(s.padEnd(30), r&&r.seg); }
const show = (txt)=>{ const p=T.lerPost(txt); console.log('título:', p.titulo, '| tags:', p.tags.join(' '), '| ignoradas:', JSON.stringify(p.ignoradas));
  p.rotinas.forEach(r=>{ console.log(' ▸', r.nome); r.itens.forEach(i=>console.log('    ', (i.exId||'??').padEnd(26), i.series+'×'+i.repsMin+(i.repsMax!==i.repsMin?'-'+i.repsMax:'')+(i.tempo?'s':''), i.superset?'['+i.superset+']':'', i.descanso?'desc '+i.descanso:'', i.confianca.toFixed(2), '«'+i.nome+'»')); }); return p; };
console.log('\n— post exemplo (pt) —'); const p1=show(T.POST_EXEMPLO); a.strictEqual(p1.rotinas.length,2);
console.log('\n— post em espanhol —'); const p2=show(`RUTINA DE PIERNA 🦵🔥
- Sentadilla 4x6-8 (descanso 2 min)
- Prensa 3x12
- Peso muerto rumano 3x10
- Extensión de cuádriceps 3x15
- Curl femoral sentado 3x12
- Gemelos de pie 4x15
Sígueme para más rutinas 💪 #gym #pierna`);
console.log('\n— post em inglês, dois dias —'); const p3=show(`Upper/Lower split 💯
Day 1 – Upper
A1) Bench press 4x6-8
A2) Chest supported row 4x8-10
B1) Cable Y raise 3x15-20
B2) Bayesian curl 3x12
Day 2: Lower
Back squat 5x5
Romanian deadlift 3x8
Leg extension 3 sets of 12-15
Plank 3x45s`);
a.strictEqual(p3.rotinas.length,2); a.strictEqual(p3.rotinas[0].itens[0].superset,'A');
console.log('\n— post com lista simples e sem números —'); show(`Treino de glúteo que viralizou
1. Hip thrust 4x10
2. Búlgaro 3x10 cada perna
3. Abdutora 3x20
4. Frog pump 2x falha
5. Pull through`);
console.log('\nredes:', ['https://www.instagram.com/reel/ABC123/','https://instagram.com/p/XYZ/','https://www.tiktok.com/@x/video/1','https://youtu.be/abc','https://www.youtube.com/shorts/abc','https://exemplo.com'].map(u=>T.redeDe(u)+'/'+T.tipoLink(u)).join(' '));
console.log('OK');
