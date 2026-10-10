/* Carga da semana e medidas corporais. */
const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={cargaSemanal,registrarMedidas,resumoMedidas,indicesCorporais,gerarExemplo,estadoVazio,mesclarEstadoPrimeiraVez,estadoParaNuvem};`);
const a=require('assert');
const S=T.gerarExemplo(); const ult=new Date(Math.max(...S.treinos.map(t=>new Date(t.data).getTime())));
const c=T.cargaSemanal(S, ult);
a.ok(c.razao>0.5 && c.razao<2, 'razão '+c.razao); a.ok(['baixa','faixa','alta','pico'].includes(c.zona), c.zona);   /* o exemplo depende do dia da semana */ a.ok(c.sessoes>=1 && c.series>0);
/* semana dobrada vira pico */
const S2=JSON.parse(JSON.stringify(S)); const ini7=new Date(ult); ini7.setDate(ini7.getDate()-6);
S2.treinos.filter(t=>new Date(t.data.slice(0,10)+'T12:00')>=ini7).forEach(t=>S2.treinos.push(Object.assign({},t,{id:t.id+'x'}),Object.assign({},t,{id:t.id+'y'})));
const c2=T.cargaSemanal(S2, ult); a.strictEqual(c2.zona,'pico'); a.ok(c2.razao>1.5);
const v=T.estadoVazio(); a.strictEqual(T.cargaSemanal(v).zona,'parado');
/* medidas */
a.strictEqual(T.registrarMedidas(v,'2026-09-01',{cintura:'',coxa:'abc'}),null);
T.registrarMedidas(v,'2026-09-01',{cintura:'84,5',quadril:98}); T.registrarMedidas(v,'2026-10-01',{cintura:82,braco:36.2,gordura:18});
T.registrarMedidas(v,'2026-10-01',{coxa:58});   /* mesmo dia: soma ao registro */
a.strictEqual(v.medidas.length,2); a.deepStrictEqual(v.medidas[1],{data:'2026-10-01',cintura:82,braco:36.2,gordura:18,coxa:58});
const r=T.resumoMedidas(v); a.strictEqual(r.cintura.delta,-2.5); a.strictEqual(r.cintura.atual,82); a.strictEqual(r.quadril.delta,null);
v.perfil.altura=175; const i=T.indicesCorporais(v); a.strictEqual(i.cinturaAltura,0.47); a.strictEqual(i.cinturaQuadril,0.84);
/* viajam com a nuvem e somam na primeira vez */
a.ok('medidas' in T.estadoParaNuvem(v));
const m=T.mesclarEstadoPrimeiraVez({medidas:[{data:'2026-10-01',cintura:82}]},{medidas:[{data:'2026-09-01',cintura:85}]}); a.strictEqual(m.medidas.length,2);
console.log('carga:',c.razao.toFixed(2),c.zona,'| pico:',c2.razao.toFixed(2),'| cintura',r.cintura.delta,'cm'); console.log('OK');
