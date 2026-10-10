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
/* exemplo envelhecido (gerado há uma semana) volta a terminar ontem: a carga da semana deixa de dar 0 treinos */
{ const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+';globalThis.E={gerarExemplo,exemploEmDia,semExemplo,cargaSemanal,isoDia,somaDias};');
  const a=require('assert'); const hoje=new Date('2026-10-10T18:00:00');
  const velho=E.gerarExemplo(E.somaDias(hoje,-9)); velho.perfil.nome='Teste';
  a.strictEqual(E.cargaSemanal(velho,hoje).sessoes,0,'exemplo velho fica sem treinos na semana');
  const novo=E.exemploEmDia(velho,hoje); a.strictEqual(novo.exemploDia,E.isoDia(hoje)); a.strictEqual(novo.perfil.nome,'Teste');
  const c=E.cargaSemanal(novo,hoje); a.ok(c.sessoes>=2 && c.series>0 && c.razao>0, JSON.stringify(c));
  const ult=novo.treinos[novo.treinos.length-1].data.slice(0,10), pesoUlt=novo.peso[novo.peso.length-1].data;
  a.ok(ult<E.isoDia(hoje) && ult>=E.isoDia(E.somaDias(hoje,-3)), 'último treino recente: '+ult); a.ok(pesoUlt>=E.isoDia(E.somaDias(hoje,-3)), 'peso recente: '+pesoUlt);
  a.strictEqual(E.exemploEmDia(novo,hoje), novo, 'mesmo dia não regenera');
  const rot=Object.keys(novo.rotinas).length; const m=E.semExemplo(novo,true);
  a.ok(!m.exemplo && !m.treinos.length && !m.peso.length && Object.keys(m.rotinas).length===rot, 'manter o plano');
  const z=E.semExemplo(E.gerarExemplo(hoje),false); a.ok(!z.exemplo && !Object.keys(z.rotinas).length, 'apagar tudo');
  console.log('exemplo em dia: carga', c.razao.toFixed(2)+'×', c.sessoes, 'treinos;', 'último treino', ult); console.log('OK'); }
/* dado real sem treino nos últimos 7 dias: sem 0,00×, zona "pausa" com o último treino; exemplo antigo sem marca volta a ser exemplo */
{ const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+';globalThis.F={gerarExemplo,exemploEmDia,cargaSemanal,somaDias,isoDia};');
  const a=require('assert'); const hoje=new Date('2026-10-10T18:00:00');
  const S=F.gerarExemplo(F.somaDias(hoje,-9)); S.exemplo=false; S.treinos.forEach(t=>t.id=t.id.replace('t-ex-','u-'));
  const c=F.cargaSemanal(S,hoje); a.strictEqual(c.zona,'pausa'); a.strictEqual(c.razao,null); a.ok(c.ultimo && c.mediaJ>0, JSON.stringify(c));
  const V=F.gerarExemplo(F.somaDias(hoje,-9)); V.exemplo=false; delete V.exemploDia;
  const N=F.exemploEmDia(V,hoje); a.ok(N.exemplo && F.cargaSemanal(N,hoje).razao>0.5, 'exemplo antigo sem marca é refeito');
  console.log('pausa: último', c.ultimo); console.log('OK'); }
/* a carga semanal do exemplo não depende do dia da semana: sábado de descanso e terça com treino */
{ const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+';globalThis.G={gerarExemplo,cargaSemanal,rotinaDoDia};');
  const a=require('assert');
  for(const [rot,iso] of [['sábado de descanso','2026-10-10T19:38:00'],['terça com treino','2026-10-13T07:00:00']]){
    const h=new Date(iso), S=G.gerarExemplo(h), c=G.cargaSemanal(S,h);
    a.strictEqual(!!G.rotinaDoDia(S,h), rot.startsWith('terça'), rot);
    a.ok(c.sessoes>=3 && c.razao>0.6 && c.razao<1.3 && ['baixa','faixa'].includes(c.zona), rot+': '+JSON.stringify(c));
    console.log(rot+':', c.razao.toFixed(2)+'×', c.zona, c.sessoes,'treinos'); }
  console.log('OK'); }
