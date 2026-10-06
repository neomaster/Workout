const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={lib,porId,perfil,trabalhoSerie,e1rm,alvoProgressao,calcularAnilhas,gerarExemplo,resumoTreino,recuperacao,cargaMuscular,coberturaGrupos,sugerirParaRegiao,importarCSV,avaliar,equipamento,historicoEx,rotinaDoDia,proximaSessao,definirCtx,isoDia,impulsoIsometrico,EQUIPAMENTOS,grupos};`);
const a=require('assert');
// ids únicos
const ids=T.lib().map(e=>e.id); a.strictEqual(new Set(ids).size, ids.length,'ids duplicados');
console.log('exercícios', ids.length, 'grupos', T.grupos().length);
// equipamentos
const eq={}; T.lib().forEach(e=>{const q=T.equipamento(e); eq[q]=(eq[q]||[]).concat(e.id)}); for(const k in eq) console.log(k, eq[k].length); if(eq.Outro) console.log('OUTRO:',eq.Outro);
// física: trabalho linear na carga
const sup=T.porId('supino-reto'); const j1=T.trabalhoSerie(sup,60,10), j2=T.trabalhoSerie(sup,120,10);
a.ok(Math.abs(j2/j1-2)<1e-9); console.log('supino 60kg×10 =', j1.toFixed(0),'J', T.perfil(sup).regiao, T.perfil(sup).fracoes.map(v=>v.toFixed(2)));
console.log('barra fixa +0×8', T.trabalhoSerie(T.porId('barra-fixa'),0,8).toFixed(0),'J');
console.log('prancha 60s impulso', T.impulsoIsometrico(T.porId('prancha'),0,60).toFixed(0), 'trabalho', T.trabalhoSerie(T.porId('prancha'),0,60));
// e1rm
a.strictEqual(T.e1rm(100,1),100); a.ok(Math.abs(T.e1rm(100,10)-133.33)<0.01); a.ok(Math.abs(T.e1rm(100,8,2)-133.33)<0.01);
// anilhas
let r=T.calcularAnilhas(100,20,{"25":2,"20":2,"15":2,"10":2,"5":2,"2.5":2,"1.25":2}); a.deepStrictEqual(r.lado,[25,15]); a.ok(r.ok);
r=T.calcularAnilhas(101,20,{"25":2,"20":2,"1.25":2}); console.log('101kg ->',r);
r=T.calcularAnilhas(15,20,{}); a.ok(!r.ok);
// progressão dupla
const item={series:3,repsMin:8,repsMax:12,progressao:'dupla',incremento:2.5};
const S=(reps,kg=60)=>({data:'x',series:reps.map(x=>({kg,reps:x,feito:true}))});
let p=T.alvoProgressao(item,[S([12,12,12])],sup); a.strictEqual(p.kg,62.5); a.strictEqual(p.reps,8); console.log(p.porque);
p=T.alvoProgressao(item,[S([12,11,10])],sup); a.strictEqual(p.kg,60); a.strictEqual(p.reps,11); console.log(p.porque);
p=T.alvoProgressao(item,[S([9,7,6]),S([9,7,6]),S([8,7,7])],sup); a.strictEqual(p.tipo,'deload'); a.strictEqual(p.kg,54); console.log(p.porque);
p=T.alvoProgressao(item,[S([9,7,6]),S([12,12,12],57.5)],sup); a.strictEqual(p.tipo,'manter'); console.log(p.porque);
p=T.alvoProgressao({...item,progressao:'linear',repsMin:5,repsMax:5,series:5},[S([5,5,5,5,5],100)],sup); a.strictEqual(p.kg,102.5); console.log(p.porque);
p=T.alvoProgressao({...item,progressao:'linear',repsMin:5,repsMax:5,series:5},[S([5,5,5,4,3],100)],sup); a.strictEqual(p.kg,100); console.log(p.porque);
p=T.alvoProgressao(item,[],sup); a.strictEqual(p.tipo,'novo');
p=T.alvoProgressao({series:3,repsMin:30,repsMax:60},[S([45,40,35],0)],T.porId('prancha')); console.log('prancha',p);
// exemplo
const hoje=new Date(2026,9,4,14,0);
const E=T.gerarExemplo(hoje); console.log('treinos exemplo', E.treinos.length, 'pesos', E.peso.length);
const res=T.resumoTreino(E.treinos[E.treinos.length-1]); console.log('último', E.treinos.at(-1).nome, res.series,'séries', Math.round(res.volume),'kg', Math.round(res.J),'J', res.regioes.map(v=>v.toFixed(2)), res.duracaoMin);
const h=T.historicoEx(E,'supino-reto'); console.log('supino hist', h.slice(0,4).map(x=>x.data.slice(0,10)+' '+x.series.map(s=>s.kg+'x'+s.reps).join(',')));
const rec=T.recuperacao(E,hoje); console.log('rec', Object.entries(rec).slice(0,6).map(([k,v])=>k+':'+Math.round(v.recuperado)+'%/'+v.diasSem+'d').join(' '));
const cm=T.cargaMuscular(E,7,hoje); console.log('7d', Object.entries(cm).map(([k,v])=>k+':'+v.series.toFixed(1)).join(' '));
const cob=T.coberturaGrupos(E,28,hoje); for(const [g,v] of Object.entries(cob)) { const i=v.fr.indexOf(Math.min(...v.fr)); const s=T.sugerirParaRegiao(g,i,v.exs); console.log(g, v.fr.map(x=>x.toFixed(2)).join('/'), '→', s&&s.nome); }
console.log('hoje rotina', T.rotinaDoDia(E,hoje), T.proximaSessao(E,hoje));
// CSV
const strong=`Date;Workout Name;Duration;Exercise Name;Set Order;Weight;Reps;Distance;Seconds;Notes;Workout Notes;RPE
2024-01-15 18:30:00;"Push A";1h;"Bench Press (Barbell)";1;60;10;0;0;;;8
2024-01-15 18:30:00;"Push A";1h;"Bench Press (Barbell)";2;60;9;0;0;;;9
2024-01-15 18:30:00;"Push A";1h;"Weird Machine Thing";1;30;12;0;0;;;`;
const im=T.importarCSV(strong,'kg'); console.log(im.formato, im.treinos.length, im.treinos[0].itens.map(i=>i.exId+':'+i.series.map(s=>s.kg+'x'+s.reps+'@rir'+s.rir)), im.novos.map(n=>n.nome));
const hevy=`title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe
"Legs","15 Jan 2024, 18:30","15 Jan 2024, 19:30","","Squat (Barbell)",,"",0,warmup,60,5,,,
"Legs","15 Jan 2024, 18:30","15 Jan 2024, 19:30","","Squat (Barbell)",,"",1,normal,100,5,,,8`;
const ih=T.importarCSV(hevy); console.log(ih.formato, ih.treinos[0].data, ih.treinos[0].itens[0].series);
console.log('OK');
