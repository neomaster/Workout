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
        # Hoje: sugestões em alta
        n = await pg.evaluate("document.querySelectorAll('#tela-hoje .sugestao').length"); print("sugestões no Hoje:", n)
        await pg.screenshot(path=SHOTS+"/a-hoje.png", full_page=True)
        if n:
            nome = await pg.inner_text('#tela-hoje .sugestao b'); itens0 = await pg.evaluate("S.rotinas[rotinaDoDia(S,new Date())].itens.length")
            await pg.click('#tela-hoje .sugestao [data-acao=add-sugestao]'); await pg.wait_for_timeout(200)
            print("adicionou", nome, itens0, "→", await pg.evaluate("S.rotinas[rotinaDoDia(S,new Date())].itens.length"))
        # Biblioteca: autossugestão
        await pg.evaluate("ir('biblioteca')"); await pg.wait_for_timeout(300)
        await pg.focus('#buscaBib'); await pg.wait_for_timeout(150)
        print("vazio →", await pg.evaluate("[...document.querySelectorAll('#sugBib li b')].map(x=>x.textContent).slice(0,5)"))
        await pg.keyboard.type("sentadilla"); await pg.wait_for_timeout(200)
        print("sentadilla →", await pg.evaluate("[...document.querySelectorAll('#sugBib li')].map(x=>x.querySelector('b').textContent).slice(0,5)"))
        await pg.screenshot(path=SHOTS+"/a-sugestoes.png")
        await pg.fill('#buscaBib', ''); await pg.keyboard.type("kelso"); await pg.wait_for_timeout(150)
        await pg.keyboard.press("ArrowDown"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print("folha aberta:", await pg.inner_text("#folhaTitulo"))
        el = await pg.query_selector('.nas-redes'); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(100)
        await pg.screenshot(path=SHOTS+"/a-nasredes.png")
        await pg.click("[data-acao=fechar-folha]"); await pg.wait_for_timeout(150)
        await pg.fill('#buscaBib', ''); await pg.keyboard.type("#joel"); await pg.wait_for_timeout(150)
        txt = await pg.evaluate("[...document.querySelectorAll('#sugBib li')].map(x=>x.textContent.trim().slice(0,30))"); print("#joel →", txt)
        await pg.keyboard.press("ArrowDown"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        print("tema:", await pg.evaluate("ALTA_UI.tema"))
        await pg.evaluate("document.getElementById('secAlta').scrollIntoView()"); await pg.wait_for_timeout(150)
        await pg.screenshot(path=SHOTS+"/a-secao.png")
        await pg.click('[data-acao=alta-tema][data-t=""]'); await pg.click('[data-acao=alta-ordem][data-o=nao]'); await pg.wait_for_timeout(200)
        print("contestados:", await pg.evaluate("[...document.querySelectorAll('.parada .nm b')].map(x=>x.textContent)"))
        await pg.click('[data-acao=alta-ordem][data-o=termometro]'); await pg.wait_for_timeout(150)
        await pg.evaluate("document.getElementById('secAlta').scrollIntoView()"); await pg.wait_for_timeout(150)
        await pg.screenshot(path=SHOTS+"/a-parada.png")
        # Plano: sugestão por rotina
        await pg.evaluate("ir('plano')"); await pg.wait_for_timeout(200)
        print("sugestões nas rotinas:", await pg.evaluate("document.querySelectorAll('.sug-rotina').length"))
        # Treino: seletor com sugestões
        await pg.evaluate("iniciarTreino(Object.keys(S.rotinas)[0])"); await pg.wait_for_timeout(200)
        await pg.click('[data-acao=ativo-add]'); await pg.wait_for_timeout(250)
        print("seletor topo:", await pg.evaluate("[...document.querySelectorAll('#seletorLista .sug-cab')].map(x=>x.textContent)"), await pg.evaluate("document.querySelectorAll('#seletorLista .item-ex').length"))
        await pg.fill('#seletorBusca','pendulum'); await pg.dispatch_event('#seletorBusca','input'); await pg.wait_for_timeout(150)
        print("seletor 'pendulum':", await pg.evaluate("[...document.querySelectorAll('#seletorLista .item-ex b')].map(x=>x.textContent).slice(0,3)"))
        await pg.screenshot(path=SHOTS+"/a-seletor.png")
        await pg.click("[data-acao=fechar-folha]"); await pg.evaluate("descartarTreino(true)"); await pg.wait_for_timeout(150)
        # Ajustes: desligar
        await pg.evaluate("ir('ajustes')"); await pg.wait_for_timeout(150)
        await pg.click('input[data-path="ajustes.priorizarAlta"]'); await pg.wait_for_timeout(150)
        await pg.evaluate("ir('hoje')"); await pg.wait_for_timeout(150)
        print("com toggle desligado, sugestões no Hoje:", await pg.evaluate("document.querySelectorAll('#tela-hoje .sugestao').length"))
        # celular
        cel=await b.new_page(viewport={"width":390,"height":844}); cel.on("pageerror", lambda e: erros.append("cel "+str(e)))
        await cel.goto(URL); await cel.wait_for_timeout(300)
        for t in ["hoje","biblioteca","plano"]:
            await cel.evaluate(f"ir('{t}')"); await cel.wait_for_timeout(200)
            print("cel", t, await cel.evaluate("document.documentElement.scrollWidth"))
        await cel.focus('#buscaBib'); await cel.keyboard.type("rem"); await cel.wait_for_timeout(200)
        await cel.screenshot(path=SHOTS+"/a-cel-sug.png")
        print("cel sug largura", await cel.evaluate("document.documentElement.scrollWidth"))
        print("ERROS:", erros or "nenhum")
        await b.close()
asyncio.run(main())
