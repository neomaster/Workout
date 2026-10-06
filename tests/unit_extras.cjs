/* Rampa de aquecimento, plano × feito, CSV de ida e volta e rotina por link. */
const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={porId,rampaAquecimento,seriesPlanejadas,planoVsFeito,exportarCSV,importarCSV,codificarRotina,decodificarRotina,gerarExemplo,estadoVazio,aplicarPlano,definirCtx};`);
const a=require('assert');
const sup=T.porId('supino-reto'), rosca=T.porId('rosca-direta'), barra=T.porId('barra-fixa'), hal=T.porId('supino-halteres');
const r100=T.rampaAquecimento(sup,100,{barra:20,passo:2.5});
a.deepStrictEqual(r100.map(s=>s.kg),[20,40,60,80]); a.deepStrictEqual(r100.map(s=>s.reps),[10,8,5,3]);
const r180=T.rampaAquecimento(T.porId('agachamento-livre'),180,{barra:20,passo:2.5});
a.ok(r180.length===5 && r180.at(-1).kg<180 && r180.every((s,i)=>!i||s.kg>r180[i-1].kg), JSON.stringify(r180));
a.deepStrictEqual(T.rampaAquecimento(hal,24,{passo:2}),[{kg:12,reps:10}]);
a.deepStrictEqual(T.rampaAquecimento(sup,25,{barra:20,passo:2.5}).map(s=>s.kg),[20]);
a.deepStrictEqual(T.rampaAquecimento(barra,20,{}),[]); a.deepStrictEqual(T.rampaAquecimento(rosca,0,{}),[]);
/* plano × feito */
const S=T.gerarExemplo();
const pp=T.seriesPlanejadas(S); a.ok(Object.keys(pp).length>5);
const pf=T.planoVsFeito(S, new Date(Math.max(...S.treinos.map(t=>t.inicio||0))));
a.ok(pf.aderencia>0 && pf.aderencia<=1, 'aderência '+pf.aderencia);
a.ok(pf.linhas.every(l=>l.plano>=0 && l.feito>=0));
const vazio=T.estadoVazio(); a.strictEqual(T.planoVsFeito(vazio).aderencia,null);
/* CSV de ida e volta */
const csv=T.exportarCSV(S); const linhas=csv.trim().split('\n');
a.ok(linhas[0].startsWith('title,start_time')); 
const nSeries=S.treinos.reduce((n,t)=>n+t.itens.reduce((m,it)=>m+(T.porId(it.exId)?it.series.length:0),0),0);
a.strictEqual(linhas.length-1,nSeries);
const volta=T.importarCSV(csv,'kg');
a.strictEqual(volta.formato,'Hevy'); a.strictEqual(volta.novos.length,0,'todos os exercícios voltam pelo id');
a.strictEqual(volta.treinos.length,S.treinos.length);
const t0=S.treinos.slice().sort((x,y)=>x.data<y.data?-1:1)[0], v0=volta.treinos[0];
a.deepStrictEqual(v0.itens.map(i=>i.exId), t0.itens.map(i=>i.exId));
a.deepStrictEqual(v0.itens[0].series.map(s=>[s.kg,s.reps]), t0.itens[0].series.map(s=>[+s.kg,+s.reps]));
/* rotina por link, com acentos */
const pac={tipo:'rotina',app:'Torquímetro Gym',rotina:{nome:'Pernas — ênfase no alongado',itens:[{exId:'agachamento-livre',series:3,repsMin:6,repsMax:8}]},exercicios:[]};
const cod=T.codificarRotina(pac); a.ok(/^[A-Za-z0-9_-]+$/.test(cod));
a.deepStrictEqual(T.decodificarRotina(cod),pac); a.strictEqual(T.decodificarRotina('xx!!'),null);
console.log('rampa 100 kg:',r100.map(s=>s.kg+'×'+s.reps).join(' '),'| aderência exemplo',Math.round(pf.aderencia*100)+'% | CSV',linhas.length-1,'séries');
console.log('OK');
