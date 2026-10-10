/* Análise cinesiológica sem vídeo: cada exercício e cada grupo/músculo da biblioteca. */
const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={lib,porId,analiseCinesiologica,analiseGrupo,REGRA_GRUPO,MUSCULOS,GRUPOS_ANAT,ANAT,CADEIAS_MYERS,CADEIAS_SOUCHARD,BIOMEC,PADROES,ARTICULACOES};`);
const a=require('assert');

/* base anatômica consistente: todo músculo do app tem grupo anatômico, componentes válidos e cadeias conhecidas */
for(const id of Object.keys(T.MUSCULOS)){ const G=T.GRUPOS_ANAT[id]; a.ok(G, 'sem anatomia: '+id);
  a.ok(G.comp.length && G.comp.every(c=>T.ANAT[c] && T.ANAT[c].origem && T.ANAT[c].insercao && T.ANAT[c].inervacao), id);
  a.ok(Object.keys(G.art).length, id); (G.myers||[]).forEach(c=>a.ok(T.CADEIAS_MYERS[c], id+' myers '+c)); (G.souchard||[]).forEach(c=>a.ok(T.CADEIAS_SOUCHARD[c], id+' souchard '+c));
  (G.antag||[]).forEach(x=>a.ok(T.MUSCULOS[x], id+' antagonista '+x)); if(G.bi) a.strictEqual(G.bi.juntas.length,2,id); }
Object.values(T.CADEIAS_MYERS).forEach(c=>c.ids.forEach(i=>a.ok(T.MUSCULOS[i], c.nome+' '+i)));
for(const k of Object.keys(T.PADROES)) a.ok(T.BIOMEC[k] && T.BIOMEC[k].mov.length && T.BIOMEC[k].bm && T.BIOMEC[k].alavanca, 'biomec '+k);

/* todo exercício: movimentos com plano e eixo, todo agonista com ação real, contração e comprimento */
let n=0;
for(const e of T.lib()){ const A=T.analiseCinesiologica(e); a.ok(A, e.id); n++;
  a.ok(A.movimentos.length && A.movimentos.every(m=>m.plano && (m.conc||m.iso)), e.id);
  a.ok(A.movimentos.filter(m=>m.conc).every(m=>m.eixo), e.id+' eixo');
  const ag=A.musculos.filter(m=>m.papel==='agonista'); a.ok(ag.length, e.id+' sem agonista');
  ag.forEach(m=>{ a.ok(!/auxiliar|estabiliza a postura/.test(m.acao), e.id+': '+m.nome+' → '+m.acao); a.ok(m.contracao && m.comprimento, e.id); });
  A.musculos.filter(m=>m.papel!=='antagonista').forEach(m=>a.ok(!/auxiliar/.test(m.acao), e.id+': '+m.nome+' → '+m.acao));
  a.ok(A.alavanca && A.bm && A.transl && A.cadeia.txt, e.id);
  a.ok(A.fontes.length===3 && A.anatomia.length, e.id);
}

/* casos que os livros descrevem explicitamente */
const bi=(id,m)=>T.analiseCinesiologica(T.porId(id)).biarticulares.find(b=>b.id===m)||{};
a.strictEqual(bi('panturrilha-sentada','panturrilha').estado,'encurtado');       /* sóleo isolado: gastrocnêmio em insuficiência ativa */
a.strictEqual(bi('panturrilha-pe','panturrilha').estado,'alongado');
a.strictEqual(bi('extensora','quadriceps-femoral').estado,'encurtado');           /* reto femoral com o quadril a 90° */
a.strictEqual(bi('flexora-sentada','isquiotibiais').estado,'alongado');           /* quadril flexionado alonga os isquiotibiais */
a.strictEqual(bi('mesa-flexora','isquiotibiais').estado,'encurtado');
a.strictEqual(bi('hip-thrust','isquiotibiais').estado,'encurtado');               /* glúteo assume com o joelho flexionado */
a.strictEqual(bi('stiff','isquiotibiais').estado,'alongado');
a.strictEqual(bi('rosca-inclinada','biceps-braquial').estado,'alongado');
a.strictEqual(bi('rosca-scott','biceps-braquial').estado,'encurtado');
a.strictEqual(bi('triceps-frances','triceps-braquial').estado,'alongado');
a.strictEqual(bi('triceps-coice','triceps-braquial').estado,'encurtado');
a.strictEqual(bi('agachamento-livre','isquiotibiais').estado,'concorrente');
const sup=T.analiseCinesiologica(T.porId('supino-reto'));
a.ok(sup.movimentos.some(m=>m.articulacao==='ombro' && m.conc==='adução horizontal' && /transverso/.test(m.plano) && /longitudinal/.test(m.eixo)));
a.ok(/aproximar os braços|adução horizontal/.test(sup.foco));
a.strictEqual(sup.musculos.find(m=>m.id==='triceps-braquial').acao,'extensão do cotovelo');
a.ok(/1ª classe/.test(T.analiseCinesiologica(T.porId('triceps-testa')).alavanca));
a.ok(/2ª classe/.test(T.analiseCinesiologica(T.porId('panturrilha-pe')).alavanca));
const rdl=T.analiseCinesiologica(T.porId('terra-romeno-halteres')); a.ok(!rdl.movimentos.some(m=>m.articulacao==='joelho'), 'romeno não estende joelho');
a.ok(T.analiseCinesiologica(T.porId('terra')).movimentos.some(m=>m.articulacao==='joelho'));
const pux=T.analiseCinesiologica(T.porId('puxada-frontal')).musculos.find(m=>m.id==='grande-dorsal');
a.ok(/adução do ombro/.test(pux.acao), pux.acao);
a.ok(T.analiseCinesiologica(T.porId('elevacao-lateral')).cadeias.myers.some(c=>/superficial posterior do braço/i.test(c.nome)));
a.ok(T.analiseCinesiologica(T.porId('agachamento-livre')).cadeias.souchard.some(c=>c.nome==='Cadeia posterior'));

/* grupos da biblioteca e cada músculo */
for(const k of [...Object.keys(T.REGRA_GRUPO), ...Object.keys(T.MUSCULOS)]){ const G=T.analiseGrupo(k); a.ok(G, k);
  a.ok(G.resumo && G.musculos.length && G.musculos.every(m=>m.acoes.length && m.componentes.length), k);
  a.strictEqual(G.porRegiao.alongado+G.porRegiao.meio+G.porRegiao.encurtado <= G.total, true, k); }
const q=T.analiseGrupo('Quadríceps'); a.ok(q.recomendacao.length>=2 && q.recomendacao.every(r=>T.porId(r.id)), 'recomendação');
const panta=T.analiseGrupo('Panturrilha').musculos[0].comprimentos.map(c=>c.estado).sort(); a.deepStrictEqual(panta,['alongado','encurtado']);
const isq=T.analiseGrupo('isquiotibiais'); a.ok(isq.musculos[0].acoes.find(x=>x.acao==='flexão'&&x.articulacao==='joelho').exercicios>=3);
a.ok(/2 articulações/.test(isq.resumo) && /ajudam como sinergistas/.test(isq.resumo), isq.resumo);
a.ok(T.analiseGrupo('Trapézio').musculos[0].acoes.find(x=>x.acao==='rotação superior').fora>=5, 'trapézio gira a escápula nos exercícios de ombro');
console.log(`${n} exercícios analisados; ${Object.keys(T.REGRA_GRUPO).length} grupos e ${Object.keys(T.MUSCULOS).length} músculos com análise`); console.log('OK');
