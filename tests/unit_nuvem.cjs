/* Mescla de treinos e estado com a nuvem (sem rede). */
const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={hashTexto,linhaDeTreino,treinoDeLinha,assinaturaTreino,mesclarTreinosNuvem,estadoParaNuvem,mesclarEstadoPrimeiraVez,gerarExemplo};`);
const a=require('assert');
const t=(id,dia,kg)=>({id,data:'2026-10-0'+dia+'T18:30',nome:'Push',rotinaId:'r1',inicio:new Date(2026,9,+dia,18,30).getTime(),fim:new Date(2026,9,+dia,19,30).getTime(),itens:[{exId:'supino-reto',series:[{tipo:'normal',kg,reps:8,rir:2,feito:true,pr:false}]}]});
/* ida e volta preserva o treino */
const x=t('a','1',80); const volta=T.treinoDeLinha(JSON.parse(JSON.stringify(T.linhaDeTreino(x))));
a.deepStrictEqual(volta,x); a.strictEqual(T.assinaturaTreino(volta),T.assinaturaTreino(x));
const L=o=>JSON.parse(JSON.stringify(T.linhaDeTreino(o)));
/* 1. aparelho novo recebe tudo; nada a enviar */
let r=T.mesclarTreinosNuvem([], [L(t('a','1',80)),L(t('b','2',82))], {});
a.strictEqual(r.treinos.length,2); a.strictEqual(r.recebidos,2); a.strictEqual(r.enviar.length,0);
/* 2. local novo sobe */
r=T.mesclarTreinosNuvem([t('a','1',80),t('c','3',85)], [L(t('a','1',80))], {});
a.deepStrictEqual(r.enviar.map(x=>x.id),['c']);
/* 3. editado lá, intocado aqui → vem de lá */
const h={a:T.assinaturaTreino(t('a','1',80))};
r=T.mesclarTreinosNuvem([t('a','1',80)], [L(t('a','1',90))], {hashes:h});
a.strictEqual(r.treinos[0].itens[0].series[0].kg,90); a.strictEqual(r.enviar.length,0);
/* 4. editado aqui, igual lá ao último sincronizado → fica o daqui e sobe */
r=T.mesclarTreinosNuvem([t('a','1',95)], [L(t('a','1',80))], {hashes:h});
a.strictEqual(r.treinos[0].itens[0].series[0].kg,95); a.deepStrictEqual(r.enviar.map(x=>x.id),['a']);
/* 5. apagado lá → sai daqui; apagado aqui → não volta e sobe a exclusão */
r=T.mesclarTreinosNuvem([t('a','1',80),t('b','2',82)], [Object.assign(L(t('a','1',80)),{apagado:true}),L(t('b','2',82))], {hashes:h});
a.deepStrictEqual(r.treinos.map(x=>x.id),['b']); a.strictEqual(r.removidos,1);
r=T.mesclarTreinosNuvem([t('b','2',82)], [L(t('a','1',80)),L(t('b','2',82))], {hashes:h,apagados:['a']});
a.deepStrictEqual(r.treinos.map(x=>x.id),['b']); a.deepStrictEqual(r.apagar,['a']);
/* 6. o exemplo inteiro sobe e volta igual */
const S=T.gerarExemplo(); const linhas=S.treinos.map(L);
r=T.mesclarTreinosNuvem(S.treinos, linhas, {}); a.strictEqual(r.enviar.length,0); a.strictEqual(r.recebidos,0);
/* 7. estado: primeira vez soma rotinas e peso */
const m=T.mesclarEstadoPrimeiraVez({rotinas:{r1:{id:'r1'}},peso:[{data:'2026-10-01',kg:80}],semana:{1:null},notas:{x:'a'}},{rotinas:{r2:{id:'r2'}},peso:[{data:'2026-09-01',kg:81}],semana:{1:'r2'},ajustes:{barra:15}});
a.deepStrictEqual(Object.keys(m.rotinas).sort(),['r1','r2']); a.strictEqual(m.peso.length,2); a.strictEqual(m.semana[1],'r2'); a.strictEqual(m.ajustes.barra,15); a.strictEqual(m.notas.x,'a');
a.ok(T.hashTexto('abc')!==T.hashTexto('abd'));
console.log('nuvem: ida e volta, recebe, envia, conflitos, exclusões e primeira vez'); console.log('OK');
