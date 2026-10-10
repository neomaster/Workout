/* Modelo cinesiológico e análise de vídeo com quadros sintéticos (os 33 pontos do MediaPipe Pose). */
const fs=require('fs'); eval(fs.readFileSync(__dirname+'/../dist/nucleo.js','utf8')+`
;globalThis.T={lib,porId,padraoMovimento,modeloCinesiologico,oQueObservar,analisarVideoMovimento,anguloEntre,PADROES};`);
const a=require('assert');
/* todo exercício tem padrão e modelo; os com pose têm início e concêntrica coerentes */
for(const e of T.lib()){ const m=T.modeloCinesiologico(e); a.ok(m && T.PADROES[m.padrao], e.id); a.ok(m.passos.length>=2 && m.erros.length>=1, e.id);
  if(m.pose){ a.ok(['max','min'].includes(m.pose.inicio), e.id); a.ok(m.pose.alvoMin<m.pose.alvoMax, e.id); } }
a.strictEqual(T.padraoMovimento(T.porId('agachamento-livre')),'agachamento');
a.strictEqual(T.padraoMovimento(T.porId('rosca-direta')),'rosca');
a.strictEqual(T.padraoMovimento(T.porId('stiff')),'dobradica');
a.strictEqual(T.padraoMovimento(T.porId('remada-unilateral')),'puxar_h');
a.strictEqual(T.padraoMovimento(T.porId('triceps-coice')),'triceps');
a.strictEqual(T.modeloCinesiologico(T.porId('agachamento-livre')).cadencia.codigo,'3-1-1-0');   /* pico no alongado */
a.ok(T.oQueObservar(T.porId('rosca-bayesiana')).length>=3);
a.ok(Math.abs(T.anguloEntre({x:1,y:0},{x:0,y:0},{x:0,y:1})-90)<1e-9);

/* boneco de lado: tornozelo fixo, canela e coxa formam o ângulo do joelho pedido */
function quadroJoelho(theta, tronco){
  const P=i=>({x:0,y:0,z:0,visibility:0.95}); const lm=Array.from({length:33},P);
  const ank={x:0.5,y:0.9}, canela=0.22, coxa=0.24, incl=(180-theta)/2*Math.PI/180;
  const knee={x:ank.x+canela*Math.sin(incl), y:ank.y-canela*Math.cos(incl)};
  const rad=(180-theta)*Math.PI/180, dirCanela=Math.atan2(knee.y-ank.y, knee.x-ank.x); const dirCoxa=dirCanela+Math.PI-rad*0 - (Math.PI - (theta*Math.PI/180));
  const hip={x:knee.x+coxa*Math.cos(dirCanela - (Math.PI - theta*Math.PI/180)), y:knee.y+coxa*Math.sin(dirCanela - (Math.PI - theta*Math.PI/180))};
  const sh={x:hip.x+0.3*Math.sin((tronco||20)*Math.PI/180), y:hip.y-0.3*Math.cos((tronco||20)*Math.PI/180)};
  for(const [l,r,p] of [[23,24,hip],[25,26,knee],[27,28,ank],[11,12,sh]]){ lm[l]={...p,z:0,visibility:0.95}; lm[r]={...p,z:0.001,visibility:0.95}; }
  lm[31]={x:ank.x-0.08,y:0.92,visibility:0.9}; lm[32]={...lm[31]};
  lm[13]={x:sh.x+0.1,y:sh.y+0.1,visibility:0.9}; lm[14]=lm[13]; lm[15]={x:sh.x+0.2,y:sh.y,visibility:0.9}; lm[16]=lm[15];
  return lm;
}
const ang=lm=>T.anguloEntre(lm[23],lm[25],lm[27]);
a.ok(Math.abs(ang(quadroJoelho(170))-170)<0.5 && Math.abs(ang(quadroJoelho(90))-90)<0.5, 'gerador de quadros');
/* 3 repetições: desce 170→fundo em 2 s, sobe em 1 s, pausa 0,5 s em cima; 10 quadros por segundo */
function video(fundo, desce, sobe){ const qs=[]; let t=0; const push=th=>{ qs.push({t:+t.toFixed(2), lm:quadroJoelho(th)}); t+=0.1; };
  for(let i=0;i<5;i++) push(170);
  for(let r=0;r<3;r++){ for(let i=0;i<desce*10;i++) push(170-(170-fundo)*i/(desce*10)); for(let i=0;i<sobe*10;i++) push(fundo+(170-fundo)*i/(sobe*10)); for(let i=0;i<5;i++) push(170); }
  return qs; }
const bom=T.analisarVideoMovimento(video(88,2.5,1), T.porId('agachamento-livre'));
a.ok(!bom.erro, bom.erro); a.strictEqual(bom.reps.length,3,JSON.stringify(bom.reps));
a.ok(bom.reps.every(r=>r.min<=95 && r.excentrica>=2 && r.excentrica<=3.2 && r.concentrica<=1.6), JSON.stringify(bom.reps));
a.strictEqual(bom.notas.find(n=>n.criterio==='Amplitude').status,'ok'); a.strictEqual(bom.notas.find(n=>n.criterio==='Cadência').status,'ok');
const raso=T.analisarVideoMovimento(video(130,0.6,0.6), T.porId('agachamento-livre'));
a.strictEqual(raso.notas.find(n=>n.criterio==='Amplitude').status,'problema'); a.notStrictEqual(raso.notas.find(n=>n.criterio==='Cadência').status,'ok');
a.ok(/alongado|pico de torque/.test(raso.notas.find(n=>n.criterio==='Amplitude').texto));
a.ok(T.analisarVideoMovimento([],T.porId('agachamento-livre')).erro);
a.ok(T.analisarVideoMovimento(video(88,2,1).map(q=>({t:q.t,lm:null})),T.porId('agachamento-livre')).erro);
console.log('bom:',bom.reps.map(r=>`${r.min}°–${r.max}° ${r.excentrica}s/${r.concentrica}s`).join(' | '),'→',bom.geral,'| raso →',raso.geral); console.log('OK');
