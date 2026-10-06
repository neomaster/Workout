import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio, os
from playwright.async_api import async_playwright
URL="file://"+os.path.join(RAIZ, "index.html")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        pg=await b.new_page(viewport={"width":1280,"height":900})
        pg.on("pageerror", lambda e: erros.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(400)
        await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
        # importador
        await pg.evaluate("ir('plano')"); await pg.wait_for_timeout(200)
        n0 = await pg.evaluate("Object.keys(S.rotinas).length")
        await pg.click("[data-acao=post-exemplo]"); await pg.wait_for_timeout(300)
        linhas = await pg.evaluate("document.querySelectorAll('#postPrevia tbody tr').length"); print("linhas na prévia:", linhas)
        await pg.screenshot(path=SHOTS+"/s-post.png")
        # troca o 1º exercício pela remada pendlay e edita séries
        await pg.select_option('#postPrevia select[data-k=exId]', 'remada-pendlay')
        await pg.fill('#postPrevia input[data-r="0"][data-i="1"][data-k=series]', '5'); await pg.dispatch_event('#postPrevia input[data-r="0"][data-i="1"][data-k=series]','change')
        await pg.fill('#postUrl','https://www.instagram.com/reel/Cexemplo123/'); await pg.dispatch_event('#postUrl','input')
        await pg.click("[data-acao=post-criar]"); await pg.wait_for_timeout(300)
        n1 = await pg.evaluate("Object.keys(S.rotinas).length"); print("rotinas", n0, "→", n1)
        r = await pg.evaluate("(()=>{const r=Object.values(S.rotinas).filter(r=>r.fonte); return r.map(x=>[x.nome, x.itens.map(i=>i.exId+':'+i.series+'x'+i.repsMin+'-'+i.repsMax+(i.superset?'['+i.superset+']':'')).join(', '), x.fonte.rede])})()")
        for x in r: print(" ", x)
        print("vídeo do post:", await pg.evaluate("JSON.stringify(S.videos)"))
        await pg.screenshot(path=SHOTS+"/s-plano-rot.png")
        # vídeo por exercício
        await pg.evaluate("ir('biblioteca')"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=SHOTS+"/s-bib.png", full_page=True)
        await pg.click('.cartao-abrir[data-ex="encolhimento-kelso"]'); await pg.wait_for_timeout(300)
        await pg.fill('#vidUrl','https://www.tiktok.com/@alguem/video/7400000000000000000'); await pg.fill('#vidNota','pegada neutra e tronco a 45°')
        await pg.click('[data-acao=video-salvar]'); await pg.wait_for_timeout(200)
        await pg.fill('#vidUrl','isso não é link'); await pg.click('[data-acao=video-salvar]'); await pg.wait_for_timeout(150)
        print("toast inválido:", await pg.inner_text("#toast"))
        el = await pg.query_selector('#detVideos'); await el.scroll_into_view_if_needed()
        await pg.screenshot(path=SHOTS+"/s-detalhe.png")
        print("vídeos:", await pg.evaluate("S.videos.map(v=>v.rede+'/'+v.tipo+'/'+(v.exId||v.rotinaId)).join(' | ')"))
        await pg.click("[data-acao=fechar-folha]"); await pg.wait_for_timeout(200)
        cards = await pg.evaluate("document.querySelectorAll('#secVideos .cartao').length"); print("cartões em vídeos salvos:", cards)
        await pg.click('#secVideos [data-acao=video-remover]'); await pg.wait_for_timeout(200)
        print("após remover:", await pg.evaluate("S.videos.length"))
        await pg.click('[data-acao=bib-redes]'); await pg.wait_for_timeout(200)
        print(await pg.inner_text("#listaBib .secao-titulo"))
        # celular
        cel=await b.new_page(viewport={"width":390,"height":844}); cel.on("pageerror", lambda e: erros.append("cel "+str(e)))
        await cel.goto(URL); await cel.wait_for_timeout(300)
        for t in ["plano","biblioteca"]:
            await cel.evaluate(f"ir('{t}')"); await cel.wait_for_timeout(200)
            if t=="plano": await cel.click("[data-acao=post-exemplo]"); await cel.wait_for_timeout(200)
            sw = await cel.evaluate("document.documentElement.scrollWidth"); print("cel", t, "largura", sw)
        await cel.evaluate("document.getElementById('secPost').scrollIntoView()"); await cel.wait_for_timeout(200)
        await cel.screenshot(path=SHOTS+"/s-cel-post.png")
        print("ERROS:", erros or "nenhum")
        await b.close()
asyncio.run(main())
