/* Tabela de percentuais do 1RM e dados do cartão de treino. */
const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={tabelaPercentuais,dadosCartaoTreino,gerarExemplo,porId,definirCtx};`);
const a=require('assert');
const t=T.tabelaPercentuais(100,2.5,T.porId('supino-reto'));
a.strictEqual(t.length,10); a.deepStrictEqual(t[0],{p:100,carga:100,reps:1});
a.deepStrictEqual(t.find(x=>x.p===80),{p:80,carga:80,reps:8}); a.deepStrictEqual(t.find(x=>x.p===75),{p:75,carga:75,reps:10});
a.ok(t.every((x,i)=>!i||x.carga<t[i-1].carga && x.reps>=t[i-1].reps));
a.deepStrictEqual(T.tabelaPercentuais(0,2.5),[]);
/* barra fixa: tabela da carga extra */
T.definirCtx({altura:175,massa:80,propCoxa:0,propTronco:0,propBraco:0});
const bf=T.tabelaPercentuais(110,1.25,T.porId('barra-fixa')); a.ok(bf[0].carga<110 && bf[0].carga>=0, JSON.stringify(bf[0]));
const S=T.gerarExemplo(); const tr=S.treinos[S.treinos.length-1]; const d=T.dadosCartaoTreino(tr,S);
a.ok(d.exercicios.length>0 && d.series>0 && d.J>0); a.ok(d.exercicios.every(e=>e.series>0 && e.melhor.reps>0));
console.log('80% de 100 kg →',t.find(x=>x.p===80).reps,'reps | cartão:',d.nome,d.exercicios.length,'exercícios'); console.log('OK');
