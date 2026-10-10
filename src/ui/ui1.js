/* =====================================================================
   INTERFACE — estado, utilidades, gráficos e mapa do corpo
   ===================================================================== */
const CHAVE = "torquimetro-gym.v1";
const LINK_TORQUIMETRO = "https://claude.ai/code/artifact/058e4ba8-a1cf-4a66-afbf-d87bbb31e5ec";
let S = null;
let tela = "hoje";
const $ = id => document.getElementById(id);
const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nf = (v,d=0) => (+v||0).toLocaleString("pt-BR",{maximumFractionDigits:d, minimumFractionDigits:0});
const nfFix = (v,d=1) => (+v||0).toLocaleString("pt-BR",{maximumFractionDigits:d, minimumFractionDigits:d});
const fmtJ = J => J>=1000 ? nfFix(J/1000, J>=100000?0:1)+" kJ" : nf(J)+" J";
const fmtKg = v => v==null||v==="" ? "—" : nf(v,2)+" kg";
const fmtT = kg => kg>=1000 ? nfFix(kg/1000,1)+" t" : nf(kg)+" kg";
const dataLonga = d => { d=new Date(d); return DIAS[d.getDay()]+", "+d.getDate()+" de "+["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"][d.getMonth()]; };
const dataCurta = iso => { const d = typeof iso==="string" ? deIso(iso.slice(0,10)) : new Date(iso); return DIAS_C[d.getDay()]+", "+d.getDate()+" "+MESES_C[d.getMonth()]; };
const uid = p => p+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

/* ---------- persistência (neste navegador) ---------- */
function migrar(o){
  const b = estadoVazio();
  const out = Object.assign(b, o);
  out.perfil = Object.assign(estadoVazio().perfil, o.perfil||{});
  out.ajustes = Object.assign(estadoVazio().ajustes, o.ajustes||{});
  out.semana = Object.assign(estadoVazio().semana, o.semana||{});
  ["rotinas","trocas","notas"].forEach(k=>{ if(!out[k]||typeof out[k]!=="object") out[k]={}; });
  ["treinos","peso","medidas","custom","videos"].forEach(k=>{ if(!Array.isArray(out[k])) out[k]=[]; });
  return out;
}
function carregar(){
  try{
    const t = localStorage.getItem(CHAVE);
    if(t){ S = migrar(JSON.parse(t)); aplicarEstado(); return; }
  }catch(e){}
  S = gerarExemplo(new Date());
  aplicarEstado();
}
function aplicarEstado(){
  CUSTOM = S.custom;
  PRIORIZAR_ALTA = S.ajustes.priorizarAlta!==false;
  sincronizarMassa();
  definirCtx(S.perfil);
}
function sincronizarMassa(){
  if(S.perfil.sincronizarMassa && S.peso.length){
    const ult = S.peso.slice().sort((a,b)=>a.data<b.data?-1:1).pop();
    S.perfil.massa = ult.kg;
  }
}
let salvarT = null;
/* grava o que estiver pendente na hora (ao fechar ou trocar de aba, o atraso de 200 ms perderia a última edição) */
function salvarAgora(){ if(!salvarT || !S) return; clearTimeout(salvarT); salvarT = null; try{ localStorage.setItem(CHAVE, JSON.stringify(S)); }catch(e){} }
window.addEventListener("pagehide", salvarAgora);
document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="hidden") salvarAgora(); });
function salvar(){
  clearTimeout(salvarT);
  salvarT = setTimeout(()=>{
    const el = $("estadoSalvo");
    try{
      salvarT = null;
      localStorage.setItem(CHAVE, JSON.stringify(S));
      el.textContent = "salvo neste navegador"; el.classList.remove("erro");
    }catch(e){
      el.textContent = "não salvou — exporte em Ajustes"; el.classList.add("erro");
    }
  }, 200);
}

/* ---------- avisos e folha ---------- */
let toastT = null;
function aviso(txt, comemora){
  const t = $("toast"); t.textContent = txt; t.classList.toggle("comemora", !!comemora); t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(()=>{ t.hidden = true; }, comemora ? 3600 : 2600);
}
let folhaAoFechar = null;
function abrirFolha(titulo, html, aoFechar){
  $("folhaTitulo").textContent = titulo;
  $("folhaCorpo").innerHTML = html;
  $("folha").hidden = false;
  folhaAoFechar = aoFechar || null;
  $("folhaCorpo").scrollTop = 0; $("folha").querySelector(".folha-caixa").scrollTop = 0;
}
function fecharFolha(){
  $("folha").hidden = true; $("folhaCorpo").innerHTML = "";
  const f = folhaAoFechar; folhaAoFechar = null; if(f) f();
}
/* confirmação dentro da página (o visualizador não mostra confirm()) */
let confirmarAcao = null;
function confirmar(titulo, texto, rotuloOk, fn, perigoso){
  confirmarAcao = fn;
  abrirFolha(titulo, `<p>${texto}</p>
    <div class="linha"><button class="btn ${perigoso?"perigo":"primario"}" type="button" data-acao="confirmar-ok">${esc(rotuloOk)}</button>
    <button class="btn fantasma" type="button" data-acao="fechar-folha">Voltar</button></div>`);
}

/* ---------- pequenos componentes ---------- */
/* verde → mostarda → vermelho, relativo ao pico do próprio exercício (igual ao Torquímetro) */
const corTensao = t => {
  t = Math.max(0,Math.min(1,t));
  const stops=[[74,168,74],[224,162,28],[217,43,43]];
  const i = t<0.5 ? 0 : 1, f = t<0.5 ? t*2 : (t-0.5)*2;
  const a=stops[i], b=stops[i+1];
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*f)},${Math.round(a[1]+(b[1]-a[1])*f)},${Math.round(a[2]+(b[2]-a[2])*f)})`;
};
function seloRegiao(ex){
  const pf = perfil(ex); if(!pf) return `<span class="selo">sem perfil</span>`;
  return `<span class="selo ${pf.regiao}" title="Onde fica o pico de torque">pico ${pf.regiao}</span>`;
}
function letraEx(ex){
  const av = avaliar(ex); if(!av) return `<span class="nota-letra" style="background:var(--papel2);color:var(--tinta-suave)" title="Sem perfil de torque">?</span>`;
  return `<span class="nota-letra ${av.letra}" title="Boletim ${nfFix(av.nota,1)} de 10 dentro de ${esc(ex.grupo)}">${av.letra}</span>`;
}
/* curva de torque em miniatura: cada trecho pintado com a tensão daquele ponto */
function miniCurva(ex, w=96, h=30){
  const pf = perfil(ex);
  if(!pf) return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><line x1="2" y1="${h-3}" x2="${w-2}" y2="${h-3}" stroke="var(--tinta-suave)" stroke-dasharray="3 3"/></svg>`;
  const f = pf.forma, n = f.length;
  const P = f.map((v,i)=>[2+(w-4)*i/(n-1), h-3-(h-6)*v]);
  let seg = "";
  for(let i=0;i<n-1;i++) seg += `<line x1="${P[i][0].toFixed(1)}" y1="${P[i][1].toFixed(1)}" x2="${P[i+1][0].toFixed(1)}" y2="${P[i+1][1].toFixed(1)}" stroke="${corTensao((f[i]+f[i+1])/2)}" stroke-width="3" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Curva de torque: pico ${pf.regiao}"><path d="M2 ${h-3} ${P.map(p=>"L"+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ")} L${w-2} ${h-3}Z" fill="var(--papel2)"/>${seg}</svg>`;
}
/* ---------- capas geradas: a própria curva de torque vira a "foto" do cartão ---------- */
const COR_GRUPO = {"Peito":"#e0326e","Costas":"#2b7fc4","Bíceps":"#7a4fbf","Tríceps":"#d9541f","Ombro":"#c98a0e","Quadríceps":"#1f9d63",
  "Posterior e glúteo":"#b0305c","Panturrilha":"#1f7a8c","Abdômen":"#4a5bd6","Antebraço":"#8a6d3b","Trapézio":"#5b6b7a","Tibial":"#6a7f2a","Adutores":"#8a4fa8"};
const corGrupo = g => COR_GRUPO[g] || "#5b616b";
let capaN = 0;
function arteCurvas(formas, cor, w, h, rotulo, alto){
  const id = "cg"+(capaN++);
  let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cor}"/><stop offset=".95" stop-color="#101216"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#${id})"/>`;
  for(let i=1;i<8;i++) g += `<line x1="${w*i/8}" y1="0" x2="${w*i/8}" y2="${h}" stroke="#fff" stroke-opacity=".07"/>`;
  for(let i=1;i<4;i++) g += `<line x1="0" y1="${h*i/4}" x2="${w}" y2="${h*i/4}" stroke="#fff" stroke-opacity=".07"/>`;
  if(rotulo) g += `<text x="${w-10}" y="${h*0.42}" text-anchor="end" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="${Math.round(Math.min(h*0.34, (w-20)/(Math.max(rotulo.length,1)*0.5)))}" fill="#fff" fill-opacity=".1">${esc(rotulo.toUpperCase())}</text>`;
  formas.forEach((f,k)=>{
    if(!f || !f.length) return;
    const n=f.length, base=alto?h*0.58:h-8, alt=alto?h*0.42:h*0.62;
    const P = f.map((v,i)=>[(w*i/(n-1)).toFixed(1), (base-alt*v).toFixed(1)]);
    const d = "M"+P.map(p=>p.join(" ")).join(" L");
    if(k===0) g += `<path d="${d} L${w} ${h} L0 ${h}Z" fill="#fff" fill-opacity=".14"/>`;
    g += `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${k===0?.95:.45}" stroke-width="${k===0?3.2:2}" stroke-linejoin="round" stroke-linecap="round"/>`;
    if(k===0){ const iMax=f.indexOf(Math.max(...f)); g += `<circle cx="${P[iMax][0]}" cy="${P[iMax][1]}" r="5" fill="#fff"/>`; }
  });
  if(alto) g += `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id}s)"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${g}</svg>`;
}
function capaEx(ex){
  const pf = perfil(ex);
  return `<div class="capa">${arteCurvas([pf?pf.forma:null], corGrupo(ex.grupo), 320, 140, ex.grupo)}<div class="sobre">${letraEx(ex)}</div><div class="sobre-d">${seloRegiao(ex)}</div></div>`;
}
function capaRotina(itens, rotulo){
  const exs = itens.map(i=>porId(i.exId)).filter(Boolean);
  const cont = {}; exs.forEach(e=>cont[e.grupo]=(cont[e.grupo]||0)+1);
  const dom = Object.keys(cont).sort((a,b)=>cont[b]-cont[a])[0];
  const formas = exs.filter(temPerfil).slice(0,3).map(e=>perfil(e).forma);
  return `<div class="capa">${arteCurvas(formas, corGrupo(dom), 320, 140, rotulo||dom||"")}</div>`;
}
function arteHeroi(){
  const formas = ["supino-reto","crucifixo","rosca-inclinada"].map(id=>porId(id)).filter(temPerfil).map(e=>perfil(e).forma);
  const w=1200, h=420;
  let g = `<defs><radialGradient id="brilhoH" cx=".85" cy=".1" r=".75"><stop offset="0" stop-color="#e0326e" stop-opacity=".55"/><stop offset="1" stop-color="#e0326e" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#brilhoH)"/>`;
  for(let i=1;i<12;i++) g += `<line x1="${w*i/12}" y1="0" x2="${w*i/12}" y2="${h}" stroke="#fff" stroke-opacity=".04"/>`;
  formas.forEach((f,k)=>{ const n=f.length; const d="M"+f.map((v,i)=>`${(w*i/(n-1)).toFixed(1)} ${(h-20-(h*0.55)*v-k*18).toFixed(1)}`).join(" L");
    g += `<path d="${d}" fill="none" stroke="${["#ff4f86","#5cb2ec","#f0bd4a"][k]}" stroke-opacity=".28" stroke-width="3"/>`; });
  return `<div class="arte"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${g}</svg></div>`;
}
function fichaMusc(ex, compacta){
  const {primarios, secundarios} = identificarMusculos(ex);
  const pill = (m,f) => `<span class="pillm${f?" forte":""}" title="${esc((MUSCULOS[m]||{}).funcao||"")}">${esc((MUSCULOS[m]||{}).nome||m)}</span>`;
  if(compacta) return primarios.map(m=>pill(m,true)).join(" ");
  return `<div class="pilha" style="gap:6px">
    <div class="linha"><span class="rot">alvo</span>${primarios.map(m=>pill(m,true)).join(" ")}</div>
    ${secundarios.length?`<div class="linha"><span class="rot">auxiliam</span>${secundarios.map(m=>pill(m,false)).join(" ")}</div>`:""}
  </div>`;
}
const tresFatias = fr => `<div class="tres" role="img" aria-label="Trabalho: ${Math.round(fr[0]*100)}% alongado, ${Math.round(fr[1]*100)}% meio, ${Math.round(fr[2]*100)}% encurtado">${fr.map(v=>`<i style="width:${(v*100).toFixed(1)}%"></i>`).join("")}</div>`;
const legendaFatias = `<div class="legenda"><span><i style="background:var(--rosa)"></i>alongado</span><span><i style="background:var(--mostarda)"></i>meio</span><span><i style="background:var(--azul)"></i>encurtado</span></div>`;
function opcoesExercicios(sel, filtro){
  return grupos().map(g=>`<optgroup label="${esc(g)}">${lib().filter(e=>e.grupo===g && (!filtro||filtro(e))).map(e=>`<option value="${esc(e.id)}"${e.id===sel?" selected":""}>${esc(e.nome)}</option>`).join("")}</optgroup>`).join("");
}

/* ---------- gráficos SVG ---------- */
function ticksBons(min, max, n){
  if(max-min<1e-9){ max = min+1; }
  const passoBruto = (max-min)/Math.max(1,n);
  const mag = Math.pow(10, Math.floor(Math.log10(passoBruto)));
  const passo = [1,2,2.5,5,10].map(m=>m*mag).find(p=>p>=passoBruto) || 10*mag;
  const a = Math.floor(min/passo)*passo, b = Math.ceil(max/passo)*passo;
  const out=[]; for(let v=a; v<=b+passo/2; v+=passo) out.push(Math.round(v*1e6)/1e6);
  return out;
}
/* linhas no tempo: series [{nome, cor, pts:[[Date, y]], tracejado}] */
function grafLinha(series, o){
  o = Object.assign({w:640, h:230, yRot:"", fmtY:v=>nf(v,1), meta:null, area:false}, o||{});
  const todos = series.flatMap(s=>s.pts);
  if(todos.length<2) return `<div class="vazio">Ainda não há pontos suficientes para o gráfico.</div>`;
  const L=46, Rm=12, T=12, B=26, W=o.w-L-Rm, H=o.h-T-B;
  const xs = todos.map(p=>+p[0]); let x0=Math.min(...xs), x1=Math.max(...xs); if(x1===x0) x1=x0+(o.fmtX?1:86400000);
  const ys = todos.map(p=>p[1]).concat(o.meta!=null?[o.meta]:[]);
  let y0=Math.min(...ys), y1=Math.max(...ys); const pad=(y1-y0)*0.12||1; y0-=pad; y1+=pad;
  const tk = ticksBons(y0,y1,4); y0=tk[0]; y1=tk[tk.length-1];
  const X = x => L+(x-x0)/(x1-x0)*W, Y = y => T+H-(y-y0)/(y1-y0)*H;
  let g = tk.map(v=>`<line x1="${L}" x2="${L+W}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--papel2)" stroke-width="1"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${o.fmtY(v)}</text>`).join("");
  const nX = Math.min(5, Math.max(2, Math.round(W/120)));
  for(let i=0;i<=nX;i++){ const t=x0+(x1-x0)*i/nX, d=new Date(t);
    g += `<text x="${X(t)}" y="${o.h-6}" text-anchor="${i===0?"start":i===nX?"end":"middle"}">${o.fmtX ? o.fmtX(t) : d.getDate()+" "+MESES_C[d.getMonth()]}</text>`; }
  if(o.meta!=null) g += `<line x1="${L}" x2="${L+W}" y1="${Y(o.meta)}" y2="${Y(o.meta)}" stroke="var(--ok)" stroke-width="2" stroke-dasharray="6 4"/><text x="${L+W-4}" y="${Y(o.meta)-5}" text-anchor="end" style="fill:var(--ok)">meta ${o.fmtY(o.meta)}</text>`;
  series.forEach(s=>{
    if(!s.pts.length) return;
    const pts = s.pts.slice().sort((a,b)=>a[0]-b[0]);
    const d = pts.map((p,i)=>(i?"L":"M")+X(+p[0]).toFixed(1)+" "+Y(p[1]).toFixed(1)).join(" ");
    if(o.area && !s.tracejado) g += `<path d="${d} L${X(+pts[pts.length-1][0]).toFixed(1)} ${T+H} L${X(+pts[0][0]).toFixed(1)} ${T+H}Z" fill="${s.cor}" opacity=".13"/>`;
    g += `<path d="${d}" fill="none" stroke="${s.cor}" stroke-width="${s.tracejado?2:2.6}" ${s.tracejado?'stroke-dasharray="5 4"':""} stroke-linejoin="round"/>`;
    if(!s.tracejado){ const u=pts[pts.length-1]; g += `<circle cx="${X(+u[0])}" cy="${Y(u[1])}" r="4.5" fill="${s.cor}" stroke="var(--caixa)" stroke-width="2"/>`;
      if(s.pontos!==false && pts.length<40) pts.slice(0,-1).forEach(p=>{ g+=`<circle cx="${X(+p[0])}" cy="${Y(p[1])}" r="2.6" fill="${s.cor}"><title>${dataCurta(new Date(p[0]))}: ${o.fmtY(p[1])}</title></circle>`; }); }
  });
  const leg = series.length>1 ? `<div class="legenda">${series.map(s=>`<span><i style="background:${s.cor}"></i>${esc(s.nome)}</span>`).join("")}</div>` : "";
  return `<div class="rolar"><svg class="grafico" viewBox="0 0 ${o.w} ${o.h}" role="img" aria-label="${esc(o.aria||"Gráfico")}">${g}${o.yRot?`<text x="4" y="10">${esc(o.yRot)}</text>`:""}</svg></div>${leg}`;
}
/* barras verticais: itens [{rot, v, dica}] */
function grafBarras(itens, o){
  o = Object.assign({w:640, h:200, fmtY:v=>nf(v), cor:"var(--rosa)", faixa:null}, o||{});
  if(!itens.length) return `<div class="vazio">Sem dados no período.</div>`;
  const L=46, Rm=8, T=12, B=26, W=o.w-L-Rm, H=o.h-T-B;
  const max = Math.max(...itens.map(i=>i.v), o.faixa?o.faixa[1]:0, 1e-9);
  const tk = ticksBons(0,max,4), y1 = tk[tk.length-1];
  const Y = v => T+H-v/y1*H, bw = W/itens.length;
  let g = tk.map(v=>`<line x1="${L}" x2="${L+W}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--papel2)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${o.fmtY(v)}</text>`).join("");
  if(o.faixa) g += `<rect x="${L}" y="${Y(o.faixa[1])}" width="${W}" height="${Y(o.faixa[0])-Y(o.faixa[1])}" fill="var(--ok)" opacity=".12"/>`;
  const salto = Math.ceil(itens.length/12);
  itens.forEach((it,i)=>{
    const x = L+i*bw+bw*0.15, h = Math.max(0, T+H-Y(it.v));
    g += `<rect x="${x.toFixed(1)}" y="${Y(it.v).toFixed(1)}" width="${(bw*0.7).toFixed(1)}" height="${h.toFixed(1)}" fill="${it.cor||o.cor}" stroke="var(--linha)" stroke-width="1"><title>${esc(it.dica||it.rot+": "+o.fmtY(it.v))}</title></rect>`;
    if(i%salto===0) g += `<text x="${(L+i*bw+bw/2).toFixed(1)}" y="${o.h-6}" text-anchor="middle">${esc(it.rot)}</text>`;
  });
  return `<div class="rolar"><svg class="grafico" viewBox="0 0 ${o.w} ${o.h}" role="img" aria-label="${esc(o.aria||"Gráfico de barras")}">${g}</svg></div>`;
}
/* curva de torque grande (biblioteca e laboratório) */
function grafTorque(curvas, o){
  o = Object.assign({w:680, h:280, capacidade:false}, o||{});
  const L=50, Rm=12, T=14, B=34, W=o.w-L-Rm, H=o.h-T-B;
  const max = Math.max(...curvas.map(c=>c.r.pico), 0.01);
  const tk = ticksBons(0, max, 4), y1 = tk[tk.length-1];
  const X = p => L+p*W, Y = v => T+H-v/y1*H;
  let g = tk.map(v=>`<line x1="${L}" x2="${L+W}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--papel2)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${nf(v)}</text>`).join("");
  [0,1/3,2/3,1].forEach(p=>g+=`<line x1="${X(p)}" x2="${X(p)}" y1="${T}" y2="${T+H}" stroke="var(--papel2)" stroke-dasharray="${p>0&&p<1?"3 4":"0"}"/>`);
  g += `<text x="${X(1/6)}" y="${o.h-8}" text-anchor="middle">alongado</text><text x="${X(.5)}" y="${o.h-8}" text-anchor="middle">meio</text><text x="${X(5/6)}" y="${o.h-8}" text-anchor="middle">encurtado</text>`;
  g += `<text x="4" y="11">N·m</text>`;
  curvas.forEach((c,ci)=>{
    const pts = c.r.pontos;
    const d = pts.map((pt,i)=>(i?"L":"M")+X(pt.p).toFixed(1)+" "+Y(pt.tau).toFixed(1)).join(" ");
    g += `<path d="${d} L${X(1)} ${T+H} L${X(0)} ${T+H}Z" fill="${c.cor}" opacity="${curvas.length>1?.12:.18}"/>`;
    if(curvas.length===1){
      for(let i=0;i<pts.length-1;i+=2){ const a=pts[i], b=pts[Math.min(i+2,pts.length-1)];
        g += `<line x1="${X(a.p).toFixed(1)}" y1="${Y(a.tau).toFixed(1)}" x2="${X(b.p).toFixed(1)}" y2="${Y(b.tau).toFixed(1)}" stroke="${corTensao(c.r.pico?((a.tau+b.tau)/2/c.r.pico):0)}" stroke-width="4" stroke-linecap="round"/>`; }
    } else g += `<path d="${d}" fill="none" stroke="${c.cor}" stroke-width="3" stroke-linejoin="round"/>`;
    const pk = pts.reduce((m,pt)=>pt.tau>m.tau?pt:m, pts[0]);
    g += `<circle cx="${X(pk.p)}" cy="${Y(pk.tau)}" r="6" fill="${c.cor}" stroke="var(--caixa)" stroke-width="2.5"><title>pico ${nf(pk.tau)} N·m</title></circle>`;
    if(o.capacidade && ci===0){
      const ad = aderencia(c.r);
      const dc = ad.serie.map((s,i)=>(i?"L":"M")+X(s.p).toFixed(1)+" "+Y(s.cap*c.r.pico).toFixed(1)).join(" ");
      g += `<path d="${dc}" fill="none" stroke="var(--tinta-suave)" stroke-width="2" stroke-dasharray="6 5"/>`;
      g += `<line x1="${X(ad.pAderencia)}" x2="${X(ad.pAderencia)}" y1="${T}" y2="${T+H}" stroke="var(--critico)" stroke-width="2"/><text x="${X(ad.pAderencia)+(ad.pAderencia>.75?-5:5)}" y="${T+12}" text-anchor="${ad.pAderencia>.75?"end":"start"}" style="fill:var(--critico)">onde a série trava</text>`;
    }
  });
  return `<div class="rolar"><svg class="grafico" viewBox="0 0 ${o.w} ${o.h}" role="img" aria-label="${esc(o.aria||"Curva de torque ao longo da amplitude")}">${g}</svg></div>`;
}
/* calendário de um ano, colorido pelo trabalho mecânico do dia */
function grafCalor(porDia, inicioSemana){
  const hoje = new Date(); const fim = somaDias(hoje, 0);
  const deslocamento = (hoje.getDay() - inicioSemana + 7) % 7;
  const primeiro = somaDias(fim, -(52*7) - deslocamento);
  const max = Math.max(1, ...Object.values(porDia).map(v=>v.J));
  const c = 11, gap = 2, L = 24, T = 16;
  let g = ""; let mesAnt = -1;
  for(let i=0;; i++){
    const d = somaDias(primeiro, i); if(d>fim) break;
    const col = Math.floor(i/7), lin = i%7, k = isoDia(d), v = porDia[k];
    const x = L+col*(c+gap), y = T+lin*(c+gap);
    const t = v ? 0.25+0.75*Math.min(1, v.J/max) : 0;
    const fill = v ? `color-mix(in srgb, var(--rosa) ${Math.round(t*100)}%, var(--papel2))` : "var(--papel2)";
    g += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${fill}"><title>${dataCurta(k)}${v?": "+v.n+" treino(s), "+fmtJ(v.J):": sem treino"}</title></rect>`;
    if(lin===0 && d.getMonth()!==mesAnt){ const primeiroMes = mesAnt===-1; mesAnt=d.getMonth(); if(!primeiroMes && col<52) g += `<text x="${x}" y="${T-5}">${MESES_C[mesAnt]}</text>`; }
  }
  const ordem = ordemSemana(inicioSemana);
  [1,3,5].forEach(l=>g+=`<text x="0" y="${T+l*(c+gap)+9}">${DIAS_C[ordem[l]]}</text>`);
  const w = L+53*(c+gap), h = T+7*(c+gap)+2;
  return `<div class="rolar"><svg class="grafico heatmap" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:820px;min-width:560px" role="img" aria-label="Calendário de treinos do último ano">${g}</svg></div>`;
}

/* ---------- mapa do corpo por músculo (frente e costas) ---------- */
/* Formas simplificadas, desenhadas à mão sobre um boneco de 200×420: é mapa de navegação, não anatomia. */
const espelho = z => z.t==="e" ? {...z, cx:200-z.cx} : z.t==="r" ? {...z, x:200-z.x-z.w} : {...z, p:z.p.map(([x,y])=>[200-x,y])};
const Z = (m, z, par) => par ? [{m,...z},{m,...espelho(z)}] : [{m,...z}];
const ZF = [].concat(
  Z("deltoide-lateral",{t:"e",cx:55,cy:76,rx:9,ry:12},1), Z("deltoide-anterior",{t:"e",cx:67,cy:78,rx:8,ry:11},1),
  Z("peitoral-maior",{t:"r",x:71,y:72,w:28,h:30,rx:9},1),
  Z("biceps-braquial",{t:"r",x:42,y:90,w:15,h:50,rx:7},1), Z("braquial-braquiorradial",{t:"r",x:39,y:150,w:15,h:28,rx:6},1),
  Z("flexores-punho",{t:"r",x:37,y:180,w:15,h:36,rx:6},1),
  Z("reto-abdominal",{t:"r",x:87,y:106,w:26,h:78,rx:8}), Z("obliquos",{t:"r",x:73,y:110,w:12,h:68,rx:6},1),
  Z("quadriceps-femoral",{t:"r",x:77,y:210,w:21,h:88,rx:9},1),
  Z("tibial-anterior",{t:"r",x:80,y:310,w:13,h:58,rx:6},1),
  Z("adutores",{t:"e",cx:95,cy:236,rx:3.5,ry:20},1)
);
const ZC = [].concat(
  Z("trapezio",{t:"p",p:[[100,54],[126,68],[108,90],[100,96],[92,90],[74,68]]}),
  Z("deltoide-posterior",{t:"e",cx:58,cy:77,rx:11,ry:12},1), Z("romboides",{t:"r",x:89,y:92,w:22,h:22,rx:5}),
  Z("grande-dorsal",{t:"p",p:[[72,96],[87,112],[96,152],[82,166],[70,134]]},1),
  Z("triceps-braquial",{t:"r",x:42,y:90,w:15,h:52,rx:7},1), Z("extensores-punho",{t:"r",x:37,y:152,w:15,h:62,rx:6},1),
  Z("eretores-espinha",{t:"r",x:89,y:118,w:9,h:68,rx:4},1),
  Z("gluteo-medio",{t:"e",cx:77,cy:197,rx:9,ry:10},1), Z("gluteo-maximo",{t:"e",cx:89,cy:214,rx:13,ry:15},1),
  Z("isquiotibiais",{t:"r",x:77,y:232,w:21,h:68,rx:9},1), Z("panturrilha",{t:"r",x:79,y:306,w:18,h:56,rx:9},1)
);
const SILHUETA = `<circle class="sil" cx="100" cy="32" r="19"/><rect class="sil" x="91" y="49" width="18" height="14"/>
  <polygon class="sil" points="62,64 138,64 133,140 125,204 75,204 67,140"/>
  <rect class="sil" x="40" y="66" width="20" height="82" rx="10"/><rect class="sil" x="140" y="66" width="20" height="82" rx="10"/>
  <rect class="sil" x="36" y="148" width="19" height="72" rx="9"/><rect class="sil" x="145" y="148" width="19" height="72" rx="9"/>
  <circle class="sil" cx="45" cy="230" r="9"/><circle class="sil" cx="155" cy="230" r="9"/>
  <rect class="sil" x="75" y="200" width="24" height="104" rx="10"/><rect class="sil" x="101" y="200" width="24" height="104" rx="10"/>
  <rect class="sil" x="77" y="300" width="20" height="96" rx="9"/><rect class="sil" x="103" y="300" width="20" height="96" rx="9"/>
  <ellipse class="sil" cx="84" cy="402" rx="13" ry="6"/><ellipse class="sil" cx="116" cy="402" rx="13" ry="6"/>`;
function formaZona(z, fill, extra){
  const a = `class="m${extra.clic?" clic":""}${extra.ativo===z.m?" ativo":""}" data-musc="${z.m}" fill="${fill}"${extra.clic?' tabindex="0" role="button"':""}`;
  const tit = `<title>${esc((MUSCULOS[z.m]||{}).nome||z.m)}${extra.dica?" — "+esc(extra.dica(z.m)):""}</title>`;
  if(z.t==="e") return `<ellipse ${a} cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}">${tit}</ellipse>`;
  if(z.t==="r") return `<rect ${a} x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="${z.rx||5}">${tit}</rect>`;
  return `<polygon ${a} points="${z.p.map(p=>p.join(",")).join(" ")}">${tit}</polygon>`;
}
/* corDe(m) devolve a cor de preenchimento de cada músculo */
function mapaCorpo(corDe, extra){
  extra = extra||{};
  const um = (zs, rot) => `<figure><svg class="corpo-svg" viewBox="20 10 160 400" role="${extra && extra.clic?"group":"img"}" aria-label="Mapa muscular, ${rot}">${SILHUETA}${zs.map(z=>formaZona(z, corDe(z.m), extra)).join("")}</svg><figcaption>${rot}</figcaption></figure>`;
  return `<div class="corpos">${um(ZF,"frente")}${um(ZC,"costas")}</div>`;
}
const misturar = (cor, pct) => `color-mix(in srgb, ${cor} ${Math.round(Math.max(0,Math.min(100,pct)))}%, var(--papel2))`;
