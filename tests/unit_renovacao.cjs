/* Renovação semanal: semanas, leitura do YouTube, arquivo e permanência no acervo. */
const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={segundaDe,precisaRenovar,lerBuscaYouTube,numeroViews,idadeMeses,renovar,semanasArquivo,mesclarHistorico,aplicarDadosAlta,exportarDadosAlta,
  incorporarSemanas,classificar,porId,ALTA_PESQUISA,get HIST(){return HISTORICO_ALTA}};`);
const a=require('assert');
a.strictEqual(T.segundaDe('2026-10-11'),'2026-10-05'); a.strictEqual(T.segundaDe('2026-10-12'),'2026-10-12');
a.strictEqual(T.numeroViews('686 mil'),686000); a.strictEqual(T.numeroViews('3,6 mil visualizações'),3600);
a.strictEqual(T.numeroViews('1.2M views'),1200000); a.strictEqual(T.numeroViews('12.345'),12345);
a.strictEqual(T.idadeMeses('há 2 anos'),24); a.strictEqual(T.idadeMeses('3 months ago'),3); a.strictEqual(T.idadeMeses('há 2 semanas'),14/30);
const yt=T.lerBuscaYouTube('Tudo\nShorts\nPatrocinado\nLoja\nA\n686 mil\nhá 6 anos\nCanal\nShorts\nB\n367 mil visualizações\nC\n3,6 mil visualizações\nD\n253 mil\nhá 5 anos\nE\n1.2M views\n3 months ago','2026-10-12');
a.deepStrictEqual([yt.n,yt.s,yt.r],[5,2,8]); a.deepStrictEqual(yt.d,['2020-10','2021-10','2026-07']);
a.strictEqual(T.lerBuscaYouTube('',''),null);
const n0=Object.keys(T.ALTA_PESQUISA).length;
a.ok(!T.precisaRenovar('2026-10-07')); a.ok(T.precisaRenovar('2026-10-12'));
const e=T.renovar('2026-10-12',{'jm-press':{yt}}, new Date('2026-10-12T12:00:00Z'));
a.strictEqual(e.fonte,'navegador'); a.strictEqual(e.medidos,1); a.strictEqual(T.HIST.length,2);
const e2=T.renovar('2026-10-19',{}); a.strictEqual(e2.fonte,'automática');
const arq=T.semanasArquivo(); a.deepStrictEqual(arq.map(s=>s.semana),['2026-10-19','2026-10-12','2026-10-05']);
a.ok(arq.every(s=>s.itens.length===n0),'toda semana lista todos os exercícios');
/* uma semana importada sem um exercício não o tira do acervo */
const j=JSON.parse(JSON.stringify(T.exportarDadosAlta())); delete j.pesquisa['jm-press'];
j.historico=[{data:'2026-10-26',fonte:'pesquisa',sinais:Object.fromEntries(Object.entries(j.historico.at(-1).sinais).filter(([k])=>k!=='jm-press'))}];
j.levantamento='2026-10-26'; a.ok(T.aplicarDadosAlta(j));
a.ok(T.ALTA_PESQUISA['jm-press'] && T.porId('jm-press'),'jm-press continua no acervo');
a.strictEqual(T.HIST.length,4);
/* mesma semana: vale a fonte mais forte */
const m=T.mesclarHistorico([{data:'2026-10-12',fonte:'automática',sinais:{}}],[{data:'2026-10-13',fonte:'navegador',sinais:{}}]);
a.strictEqual(m.length,1); a.strictEqual(m[0].fonte,'navegador');
console.log('renovação: '+T.HIST.map(h=>h.semana+' '+h.fonte).join(' | ')); console.log('OK');
