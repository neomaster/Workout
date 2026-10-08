"""Medidor de carga na tela Hoje e medidas corporais em Progresso."""
import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio
from playwright.async_api import async_playwright
URL="file://"+_os.path.join(RAIZ,"index.html")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        for nome,vp in [("desk",{"width":1280,"height":900}),("cel",{"width":390,"height":844})]:
            ctx=await b.new_context(viewport=vp, locale="pt-BR"); await ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
            pg=await ctx.new_page(); pg.on("pageerror", lambda e: erros.append(str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            el = await pg.query_selector(".medidor-carga"); await el.scroll_into_view_if_needed()
            print(nome, "carga:", (await pg.inner_text(".mc-leitura")).replace("\n"," "), "| overflow:", await pg.evaluate("document.documentElement.scrollWidth-innerWidth"))
            painel = await pg.query_selector("text=Carga da semana >> xpath=ancestor::div[contains(@class,'painel')]")
            await painel.screenshot(path=f"{SHOTS}/med-{nome}-carga.png")
            await pg.evaluate("ir('progresso')"); await pg.wait_for_timeout(300)
            f = "form[data-form=medidas]"
            await pg.fill(f+" [name=cintura]", "84.5"); await pg.fill(f+" [name=quadril]", "98"); await pg.fill(f+" [name=data]", "2026-09-07")
            await pg.click(f+" button[type=submit]"); await pg.wait_for_timeout(200)
            await pg.fill(f+" [name=cintura]", "82"); await pg.fill(f+" [name=braco]", "36.5"); await pg.click(f+" button[type=submit]"); await pg.wait_for_timeout(300)
            print(nome, "medidas:", await pg.evaluate("JSON.stringify(S.medidas)"))
            print(nome, "cartões:", (await pg.inner_text(".medidas-grade")).replace("\n"," "))
            painel = await pg.query_selector("text=Medidas corporais >> xpath=ancestor::div[contains(@class,'painel')]")
            await painel.scroll_into_view_if_needed(); await painel.screenshot(path=f"{SHOTS}/med-{nome}-medidas.png")
            print(nome, "overflow progresso:", await pg.evaluate("document.documentElement.scrollWidth-innerWidth"))
            await ctx.close()
        print("erros:", erros); await b.close()
asyncio.run(main())
