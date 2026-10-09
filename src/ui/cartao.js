/* =====================================================================
   CARTÃO DO TREINO: imagem 1080 × 1350 para postar ou mandar
   ===================================================================== */
const CARTAO = {url:null, blob:null, nome:""};
const corCss = (nome, reserva) => { try{ const v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim(); return v || reserva; }catch(e){ return reserva; } };

async function desenharCartaoTreino(d){
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  try{ if(document.fonts){ await Promise.race([Promise.all(["800 80px 'Barlow Condensed'","500 30px 'Barlow'"].map(f=>document.fonts.load(f))), new Promise(r=>setTimeout(r,1500))]); } }catch(e){}
  const TIT = "'Barlow Condensed', 'Arial Narrow', sans-serif", CORPO = "'Barlow', system-ui, sans-serif";
  const rosa = "#e0326e", giz = "#eef0f3", suave = "#a9b0bb", grafite = "#1d2026", linha = "#2e333b";
  const ok = "#3cc488", mostarda = "#e0a21c", azul = "#5cb2ec";
  g.fillStyle = grafite; g.fillRect(0,0,W,H);
  /* faixa rosa à esquerda: a marca do app */
  g.fillStyle = rosa; g.fillRect(0,0,18,H);
  const M = 84;
  g.textBaseline = "alphabetic";
  g.fillStyle = suave; g.font = `500 30px ${CORPO}`;
  const quando = new Date(d.data.length>10 ? d.data : d.data+"T12:00");
  g.fillText(quando.toLocaleDateString("pt-BR",{weekday:"long", day:"numeric", month:"long"}) + (d.apelido ? ` · ${d.apelido}` : ""), M, 120);
  /* título com quebra */
  g.fillStyle = giz; g.font = `800 112px ${TIT}`;
  const linhasTit = quebrar(g, d.nome.toUpperCase(), W-2*M).slice(0,2);
  linhasTit.forEach((l,i)=>g.fillText(l, M, 236 + i*104));
  let y = 236 + (linhasTit.length-1)*104 + 70;
  /* números */
  const kpis = [[String(d.series),"séries"],[nfFix(d.volume/1000,1),"toneladas"],[nfFix(d.J/1000,1),"kJ de trabalho"]].concat(d.duracaoMin?[[String(d.duracaoMin),"minutos"]]:[]);
  const larg = (W-2*M)/kpis.length;
  kpis.forEach(([v,r],i)=>{ const x = M + i*larg;
    g.fillStyle = giz; g.font = `800 92px ${TIT}`; g.fillText(v, x, y+80);
    g.fillStyle = suave; g.font = `500 28px ${CORPO}`; g.fillText(r, x, y+120); });
  y += 205;
  /* onde caiu a tensão */
  const tot = d.regioes.reduce((a,b)=>a+b,0);
  if(tot>0){
    g.fillStyle = suave; g.font = `500 28px ${CORPO}`; g.fillText("onde caiu a tensão", M, y); y += 22;
    const cores = [rosa, mostarda, azul], nomes = ["alongado","meio","encurtado"]; let x = M; const bw = W-2*M;
    d.regioes.forEach((v,i)=>{ const w = bw*v/tot; g.fillStyle = cores[i]; g.fillRect(x, y, Math.max(0,w-4), 22); x += w; });
    y += 60; x = M;
    d.regioes.forEach((v,i)=>{ g.fillStyle = cores[i]; g.fillRect(x, y-20, 18, 18); g.fillStyle = giz; g.font = `500 28px ${CORPO}`;
      const t = `${nomes[i]} ${Math.round(v/tot*100)}%`; g.fillText(t, x+28, y-2); x += 28 + g.measureText(t).width + 40; });
    y += 40;
  }
  /* exercícios */
  g.strokeStyle = linha; g.lineWidth = 2; g.beginPath(); g.moveTo(M, y); g.lineTo(W-M, y); g.stroke(); y += 58;
  const lista = d.exercicios.slice(0, 7);
  for(const e of lista){
    g.fillStyle = giz; g.font = `700 44px ${TIT}`;
    const nome = encurtar(g, e.nome, W-2*M-330);
    g.fillText(nome, M, y);
    if(e.pr){ const w = g.measureText(nome).width; g.fillStyle = rosa; g.font = `700 30px ${CORPO}`; g.fillText("★ recorde", M + w + 18, y-4); }
    g.textAlign = "right"; g.fillStyle = suave; g.font = `500 32px ${CORPO}`;
    const melhor = e.tempo ? `${e.melhor.reps} s` : `${e.corporal && !e.melhor.kg ? "" : nf(e.melhor.kg,2)+" kg × "}${e.melhor.reps}`;
    g.fillText(`${e.series}× · ${melhor}`, W-M, y); g.textAlign = "left";
    y += 70;
  }
  if(d.exercicios.length > lista.length){ g.fillStyle = suave; g.font = `500 28px ${CORPO}`; g.fillText(`+ ${d.exercicios.length-lista.length} exercício(s)`, M, y); }
  /* rodapé */
  g.fillStyle = rosa; g.font = `800 40px ${TIT}`; g.fillText("TORQUÍMETRO GYM", M, H-78);
  g.fillStyle = suave; g.font = `500 26px ${CORPO}`; g.textAlign = "right"; g.fillText("torque, trabalho e tensão de cada série", W-M, H-82); g.textAlign = "left";
  return await new Promise(ok=>c.toBlob(b=>ok(b), "image/png"));
}
function quebrar(g, txt, max){
  const out = []; let atual = "";
  for(const p of txt.split(/\s+/)){ const t = atual ? atual+" "+p : p; if(g.measureText(t).width > max && atual){ out.push(atual); atual = p; } else atual = t; }
  if(atual) out.push(atual); return out;
}
function encurtar(g, txt, max){ if(g.measureText(txt).width <= max) return txt; let t = txt; while(t.length>3 && g.measureText(t+"…").width > max) t = t.slice(0,-1); return t.trimEnd()+"…"; }

async function abrirCartaoTreino(id){
  const t = S.treinos.find(x=>x.id===id); if(!t) return;
  abrirFolha("Imagem do treino", `<p class="suave">Montando a imagem…</p>`);
  const blob = await desenharCartaoTreino(dadosCartaoTreino(t, S));
  if(!blob){ abrirFolha("Imagem do treino", `<p>Este navegador não conseguiu gerar a imagem.</p>`); return; }
  if(CARTAO.url) URL.revokeObjectURL(CARTAO.url);
  CARTAO.blob = blob; CARTAO.url = URL.createObjectURL(blob);
  CARTAO.nome = "treino-" + t.data.slice(0,10) + "-" + normNome(t.nome).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + ".png";
  const arquivo = typeof File==="function" ? new File([blob], CARTAO.nome, {type:"image/png"}) : null;
  const podeEnviar = !!(arquivo && navigator.canShare && (()=>{ try{ return navigator.canShare({files:[arquivo]}); }catch(e){ return false; } })());
  abrirFolha("Imagem do treino", `
    <img src="${CARTAO.url}" alt="Resumo do treino ${esc(t.nome)} em imagem" class="cartao-img" width="1080" height="1350">
    <div class="linha">${podeEnviar?`<button class="btn primario" type="button" data-acao="cartao-enviar">Enviar…</button>`:""}
      ${podeBaixar()?`<button class="btn${podeEnviar?"":" primario"}" type="button" data-acao="cartao-baixar">Baixar imagem</button>`:`<span class="pequeno suave">Para salvar, toque e segure a imagem.</span>`}</div>
    <p class="pequeno suave" style="margin:0">1080 × 1350, o formato vertical do feed do Instagram.</p>`);
}
const ACOES_CARTAO = {
  "cartao-treino": el=>abrirCartaoTreino(el.dataset.id),
  "cartao-enviar": async ()=>{ if(!CARTAO.blob) return; try{ await navigator.share({files:[new File([CARTAO.blob], CARTAO.nome, {type:"image/png"})], title:"Treino"}); }catch(e){} },
  "cartao-baixar": ()=>{ if(CARTAO.blob) baixarArquivo(CARTAO.nome, CARTAO.blob, "image/png"); }
};
