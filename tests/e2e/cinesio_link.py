"""Avaliação por link (YouTube/TikTok/Instagram): player incorporado + captura da aba, com captura e detector simulados."""
import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio
from playwright.async_api import async_playwright
URL="file://"+_os.path.join(RAIZ,"index.html")
FALSO = open(_os.path.join(RAIZ,"tests","e2e","cinesiologia.py"),encoding="utf-8").read().split('FALSO = r"""')[1].split('"""')[0]
FALSO = FALSO.replace("window.__DETECTOR_POSE = {detectar:(video, ms)=>{ const lm=corpo(anguloEm(ms/1000)); return {mundo:lm, tela:lm}; }};",
 "let t0=null; window.__DETECTOR_POSE = {detectar:(fonte, ms)=>{ if(t0==null) t0=ms; const lm=corpo(anguloEm(((ms-t0)/1000)%6.2)); return {mundo:lm, tela:lm}; }};")
CAPTURA = r"""
window.__capturas = 0;
if(navigator.mediaDevices) navigator.mediaDevices.getDisplayMedia = async (op)=>{ window.__capturas++; window.__opcoes = op;
  const c=document.createElement('canvas'); c.width=1280; c.height=900; const g=c.getContext('2d'); let k=0;
  setInterval(()=>{ g.fillStyle=`hsl(${(k++*7)%360} 60% 40%)`; g.fillRect(0,0,1280,900); }, 50);
  return c.captureStream(20); };
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        ctx=await b.new_context(viewport={"width":1280,"height":900}, locale="pt-BR")
        await ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
        for padrao in ["**/youtube-nocookie.com/**","**/tiktok.com/embed/**","**/instagram.com/**/embed/**"]:
            await ctx.route(padrao, lambda r: r.fulfill(status=200, content_type="text/html", body="<body style='margin:0;background:#222;color:#fff;font:20px sans-serif;display:grid;place-items:center;height:100vh'>player</body>"))
        await ctx.add_init_script(FALSO + CAPTURA)
        pg=await ctx.new_page(); pg.on("pageerror", lambda e: erros.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        # botões "Avaliar" nos vídeos das indicações
        await pg.evaluate("abrirExercicio('agachamento-zercher')"); await pg.wait_for_timeout(200)
        botoes = await pg.evaluate("[...document.querySelectorAll('#folha .observar [data-acao=cinesio-video]')].map(b=>b.textContent.trim()+' | '+(b.dataset.url||'—'))")
        print("botões nas indicações:", botoes)
        await pg.click("#folha .observar [data-acao=cinesio-video][data-url]")
        await pg.wait_for_selector("#cinesioPlayer")
        print("embed:", await pg.get_attribute("#cinesioPlayer","src"), "| vertical:", await pg.evaluate("document.getElementById('cinesioMoldura').classList.contains('vertical')"))
        # links inválidos e válidos digitados
        for link in ["https://vm.tiktok.com/ZMabc/","https://vimeo.com/1","https://youtu.be/8PXe7YNOfb4"]:
            await pg.fill("#cinesioLink", link); await pg.click("form[data-form=cinesio-link] button[type=submit]"); await pg.wait_for_timeout(150)
            print(link, "→", (await pg.inner_text("#cinesioPlayerArea")).split("\n")[0][:110])
        await pg.screenshot(path=SHOTS+"/link-player.png")
        # captura simulada: 7 s de vídeo
        await pg.click("[data-acao=cinesio-capturar]"); await pg.wait_for_timeout(7000)
        print("status:", await pg.inner_text("#cinesioStatus"), "| opções:", await pg.evaluate("JSON.stringify(window.__opcoes)"))
        await pg.click("[data-acao=cinesio-parar]"); await pg.wait_for_selector(".notas-cinesio", timeout=10000)
        print("resultado:", (await pg.inner_text("#cinesioArea")).replace("\n"," | ")[:360])
        print("reps:", await pg.evaluate("JSON.stringify(CINE.resultado.reps.map(r=>[r.min,r.max,r.excentrica,r.concentrica]))"), "| captura encerrada:", await pg.evaluate("CINE.captura===null"))
        await pg.wait_for_timeout(300); el = await pg.query_selector("#folha"); await el.screenshot(path=SHOTS+"/link-resultado.png")
        # trocar para arquivo e voltar; fechar a folha durante captura encerra
        await pg.click("[data-acao=cinesio-fonte][data-f=arquivo]"); print("aba arquivo:", await pg.is_visible("#cinesioArquivo"))
        await pg.click("[data-acao=cinesio-fonte][data-f=link]"); await pg.fill("#cinesioLink","https://www.instagram.com/reel/C9xYz12AbCd/"); await pg.click("form[data-form=cinesio-link] button[type=submit]"); await pg.wait_for_timeout(150)
        await pg.click("[data-acao=cinesio-capturar]"); await pg.wait_for_timeout(800); await pg.evaluate("fecharFolha()"); print("fechar encerra captura:", await pg.evaluate("CINE.captura===null"))
        # vídeo salvo com botão avaliar
        await pg.evaluate("S.videos.push({id:'v1',url:'https://www.tiktok.com/@x/video/7440121843832442158',rede:'TikTok',tipo:'vídeo',exId:'agachamento-livre'}); abrirExercicio('agachamento-livre')"); await pg.wait_for_timeout(200)
        print("salvo com avaliar:", await pg.evaluate("!!document.querySelector('#folha .linha-video [data-acao=cinesio-video]')"))
        print("erros:", erros); await b.close()
asyncio.run(main())
