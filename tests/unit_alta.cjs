const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={lib,porId,perfil,classificar,rankingAlta,sugerir,sugestoesEmAlta,alternativasEmAlta,emAlta,ALTA_PESQUISA,EXTRA_ALTA,identificarMusculos,grupos,avaliar,lerPost,casarExercicio};`);
const a=require('assert');
const ids=T.lib().map(e=>e.id); a.strictEqual(new Set(ids).size, ids.length,'ids duplicados');
for(const k of Object.keys(T.ALTA_PESQUISA)) a.ok(T.porId(k), 'pesquisa sem exercício: '+k);
console.log('total', ids.length, '| em alta', T.lib().filter(T.emAlta).length, '| com pesquisa', Object.keys(T.ALTA_PESQUISA).length, '| grupos', T.grupos().length);
console.log('\n— novos —');
for(const e of T.EXTRA_ALTA){ const p=T.perfil(e), m=T.identificarMusculos(e); a.ok(p&&p.W1>0,e.id); console.log(e.id.padEnd(22), p.regiao.padEnd(9), p.fracoes.map(v=>v.toFixed(2)).join('/'), T.avaliar(e).letra, m.primarios.join('+')); }
console.log('\n— ranking —');
const vered={confirma:0,parcial:0,nao:0,neutro:0};
T.rankingAlta().forEach(({ex,c},i)=>{ vered[c.veredito.tipo]++; console.log(String(i+1).padStart(2), String(c.termometro).padStart(3), c.rotulo.padEnd(11), c.tendencia.padEnd(9), ex.id.padEnd(28), 'TT', c.presTT.toFixed(2), 'YT', c.presYT==null?' -- ':c.presYT.toFixed(2), 'últ', c.ultimo, '|', c.veredito.tipo); });
console.log('vereditos', vered);
const nao = T.rankingAlta().filter(x=>x.c.veredito.tipo==='nao'); nao.forEach(x=>console.log('  ✗', x.ex.nome, '—', x.c.veredito.txt));
console.log('\n— autossugestão —');
for(const q of ["", "ros", "kelso", "bench", "sentadilla", "remo", "glu", "alongado", "abdu", "lat pray", "puxada", "zercher", "#joelhos", "cop"]) {
  const r=T.sugerir(q,{limite:6}); console.log(JSON.stringify(q).padEnd(12), r.map(x=>x.tipo==='ex'?x.ex.id+(x.motivo?' ('+x.motivo+')':''):'['+x.tipo+':'+x.nome+']').join(' | ')); }
console.log('\n— sugestões para uma rotina —');
const rot=['supino-reto','crossover','remada-curvada','puxada-frontal','elevacao-lateral','rosca-direta','triceps-polia'];
T.sugestoesEmAlta(rot,4).forEach(s=>console.log(' ▸', s.ex.nome, '|', s.motivo));
console.log('\n— alternativas para rosca direta —', T.alternativasEmAlta(T.porId('rosca-direta')).map(x=>x.ex.nome+' '+x.c.termometro).join(', '));
console.log('\nleitor com nomes novos:', T.lerPost('Jefferson curl 3x8\nCopenhagen plank 3x20s\nKas glute bridge 4x12\nZercher squat 4x6\nDrag curl 3x10\nB-stance RDL 3x10\nKroc row 2x20\nAb wheel 3x10').rotinas[0].itens.map(i=>i.exId+':'+i.confianca.toFixed(2)).join(' '));
console.log('OK');
