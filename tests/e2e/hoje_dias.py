"""Hoje em dois dias: sábado de descanso e terça com treino. Botão primário certo, ordem de foco das abas e alvos de 40 px."""
import asyncio, datetime, os, sys
from playwright.async_api import async_playwright
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(__file__),"..","..","index.html"))
ALVOS = """[...document.querySelectorAll('a[href],button,input,select,summary')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&!e.closest('[hidden]')&&!['checkbox','radio','range'].includes(e.type)&&e.tabIndex>=0&&!e.closest('p')})
  .filter(e=>{const r=e.getBoundingClientRect(); return r.height<40||r.width<40}).map(e=>e.outerHTML.slice(0,90))"""
async def main():
    falhas=[]
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for rot,quando in [("sábado de descanso",datetime.datetime(2026,10,10,19,38)),("terça com treino",datetime.datetime(2026,10,13,7,0))]:
            for vp in [{"width":1280,"height":900},{"width":390,"height":844}]:
                ctx=await b.new_context(viewport=vp, locale="pt-BR"); await ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort()); pg=await ctx.new_page()
                await pg.clock.set_fixed_time(quando); await pg.goto(URL); await pg.wait_for_timeout(400)
                prim=await pg.evaluate("[...document.querySelectorAll('#tela-hoje .heroi .btn.primario')].map(b=>b.textContent.trim())")
                if any("Treinar mesmo assim" in x for x in prim): falhas.append(f"{rot}: primário {prim}")
                if rot.startswith("terça") and prim!=["Começar treino"]: falhas.append(f"{rot}: primário {prim}")
                ordem=[]
                for i in range(6):
                    await pg.keyboard.press("Tab"); ordem.append(await pg.evaluate("document.activeElement.textContent.trim()"))
                if ordem!=["Hoje","Plano","Biblioteca","Progresso","Laboratório" if vp["width"]>1000 else "Lab","Ajustes"]: falhas.append(f"{rot} {vp['width']}: foco {ordem}")
                peq=[]
                for t in ["hoje","plano","biblioteca","progresso","lab","ajustes"]:
                    await pg.evaluate(f"ir('{t}')"); await pg.wait_for_timeout(200); peq+=await pg.evaluate(ALVOS)
                if peq: falhas.append(f"{rot} {vp['width']}: {len(peq)} alvos < 40 px, ex.: {peq[:3]}")
                print(rot, vp["width"], "primário:", prim, "| foco:", ordem, "| alvos pequenos:", len(peq))
                await ctx.close()
        await b.close()
    print("falhas:", falhas); sys.exit(1 if falhas else 0)
asyncio.run(main())
