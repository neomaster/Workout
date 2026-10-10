"""Cinesiologia: bloco da ficha, checklist dos vídeos e analisador com um detector de pose simulado."""
import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio
from playwright.async_api import async_playwright
URL="file://"+_os.path.join(RAIZ,"index.html")
VIDEO=_os.path.join(RAIZ,"tests","e2e","midia","teste.webm")
FALSO = r"""
/* agachamento sintético: 2 repetições em 6 s (desce 1,8 s até 90°, sobe 0,9 s) */
function anguloEm(t){ const ciclo=[[0,170],[0.5,170],[2.3,90],[3.2,170],[3.4,170],[5.2,90],[6.1,170]];
  for(let i=1;i<ciclo.length;i++){ const [t0,a0]=ciclo[i-1],[t1,a1]=ciclo[i]; if(t<=t1) return a0+(a1-a0)*(t-t0)/(t1-t0); } return 170; }
function corpo(theta){ const lm=Array.from({length:33},()=>({x:0.5,y:0.5,z:0,visibility:0.2}));
  const ank={x:0.5,y:0.9}, canela=0.22, coxa=0.24, incl=(180-theta)/2*Math.PI/180;
  const knee={x:ank.x+canela*Math.sin(incl), y:ank.y-canela*Math.cos(incl)};
  const dc=Math.atan2(knee.y-ank.y, knee.x-ank.x)-(Math.PI-theta*Math.PI/180);
  const hip={x:knee.x+coxa*Math.cos(dc), y:knee.y+coxa*Math.sin(dc)}, sh={x:hip.x+0.1, y:hip.y-0.28};
  const v=p=>({x:p.x,y:p.y,z:0,visibility:0.95});
  [[23,24,hip],[25,26,knee],[27,28,ank],[11,12,sh]].forEach(([l,r,p])=>{ lm[l]=v(p); lm[r]=v({x:p.x+0.002,y:p.y}); });
  lm[31]=lm[32]=v({x:ank.x-0.08,y:0.92}); lm[13]=lm[14]=v({x:sh.x+0.1,y:sh.y+0.12}); lm[15]=lm[16]=v({x:sh.x+0.2,y:sh.y+0.05});
  return lm; }
window.__DETECTOR_POSE = {detectar:(video, ms)=>{ const lm=corpo(anguloEm(ms/1000)); return {mundo:lm, tela:lm}; }};
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        for nome,vp in [("desk",{"width":1280,"height":900}),("cel",{"width":390,"height":844})]:
            ctx=await b.new_context(viewport=vp, locale="pt-BR"); await ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
            await ctx.add_init_script(FALSO)
            pg=await ctx.new_page(); pg.on("pageerror", lambda e: erros.append(str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(500)
            await pg.evaluate("abrirExercicio('agachamento-livre')"); await pg.wait_for_timeout(200)
            txt = await pg.inner_text("#folha .cinesio")
            print(nome, "ficha:", txt.replace("\n"," | ")[:260])
            el = await pg.query_selector("#folha .cinesio"); await el.screenshot(path=f"{SHOTS}/cin-{nome}-ficha.png")
            await pg.click("#folha .cinesio [data-acao=cinesio-video]"); await pg.wait_for_timeout(200)
            await pg.set_input_files("#cinesioArquivo", VIDEO)
            await pg.wait_for_selector(".notas-cinesio", timeout=60000)
            print(nome, "resultado:", (await pg.inner_text("#cinesioArea")).replace("\n"," | ")[:420])
            print(nome, "reps:", await pg.evaluate("JSON.stringify(CINE.resultado.reps.map(r=>[r.min,r.max,r.excentrica,r.concentrica]))"), "geral:", await pg.evaluate("CINE.resultado.geral"))
            print(nome, "overflow:", await pg.evaluate("document.documentElement.scrollWidth-innerWidth"))
            folha = await pg.query_selector("#folha .folha-corpo, #folha"); await folha.screenshot(path=f"{SHOTS}/cin-{nome}-analise.png")
            if nome=="desk":
                await pg.evaluate("fecharFolha(); abrirExercicio('rosca-bayesiana')"); await pg.wait_for_timeout(200)
                print("observar:", (await pg.inner_text("#folha .observar")).replace("\n"," | ")[:300])
                await pg.evaluate("fecharFolha(); abrirExercicio('prancha')"); await pg.wait_for_timeout(200)
                print("prancha sem vídeo:", await pg.evaluate("!document.querySelector('#folha .cinesio [data-acao=cinesio-video]')"))
            await ctx.close()
        print("erros:", erros); await b.close()
asyncio.run(main())
