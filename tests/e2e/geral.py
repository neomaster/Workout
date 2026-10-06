import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio, os
from playwright.async_api import async_playwright
URL="file://"+os.path.join(RAIZ, "index.html")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        erros=[]
        for nome,vp in [("desk",{"width":1280,"height":900}),("cel",{"width":390,"height":844})]:
            pg=await b.new_page(viewport=vp)
            pg.on("pageerror", lambda e: erros.append(nome+": "+str(e)))
            pg.on("console", lambda m: m.type=="error" and erros.append(nome+" console: "+m.text))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            for t in ["hoje","plano","biblioteca","progresso","lab","ajustes"]:
                await pg.evaluate(f"ir('{t}')"); await pg.wait_for_timeout(250)
                sw=await pg.evaluate("document.documentElement.scrollWidth"); 
                if sw>vp["width"]+1: erros.append(f"{nome} {t}: overflow horizontal {sw}")
                await pg.screenshot(path=f"{SHOTS}/{nome}-{t}.png", full_page=(nome=="desk"))
            if nome=="desk":
                # fluxo de treino
                await pg.evaluate("ir('hoje')")
                if await pg.query_selector("#rotinaLivre"):
                    await pg.select_option("#rotinaLivre", index=1); await pg.click("[data-acao=iniciar-escolhido]")
                else:
                    await pg.click("#tela-hoje [data-acao=iniciar]")
                await pg.wait_for_timeout(300)
                oks=await pg.query_selector_all("[data-acao=serie-ok]")
                print("séries no treino:", len(oks))
                await oks[0].click(); await pg.wait_for_timeout(200)
                # aumentar carga na série 2 para forçar recorde
                kg=await pg.query_selector_all('[data-k=kg]')
                await kg[1].fill("200"); await kg[1].dispatch_event("change")
                await pg.click('[data-acao=serie-ok][data-i="0"][data-s="1"]'); await pg.wait_for_timeout(200)
                print("toast:", await pg.inner_text("#toast"))
                await pg.screenshot(path=SHOTS+"/desk-treino.png")
                await pg.click("[data-acao=finalizar]"); await pg.wait_for_timeout(200)
                await pg.click("[data-acao=confirmar-ok]"); await pg.wait_for_timeout(300)
                await pg.screenshot(path=SHOTS+"/desk-resumo.png")
                print("treinos:", await pg.evaluate("S.treinos.length"), "ativo:", await pg.evaluate("S.ativo"))
                await pg.click("[data-acao=fechar-folha]")
                # detalhe de exercício
                await pg.evaluate("ir('biblioteca')"); await pg.click("#listaBib [data-ex=supino-reto]"); await pg.wait_for_timeout(200)
                await pg.screenshot(path=SHOTS+"/desk-detalhe.png")
                await pg.click("[data-acao=fechar-folha]")
                # clique no mapa
                await pg.click('#tela-biblioteca .corpo-svg [data-musc="gluteo-maximo"]'); await pg.wait_for_timeout(200)
                print(await pg.inner_text("#listaBib .secao-titulo"))
                # csv import
                await pg.evaluate("ir('ajustes')")
                await pg.fill("#areaDados", "title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe\n\"Legs\",\"15 Jan 2026, 18:30\",\"15 Jan 2026, 19:30\",\"\",\"Squat (Barbell)\",,\"\",1,normal,100,5,,,8")
                await pg.click("[data-acao=importar]"); await pg.wait_for_timeout(200)
                print("import toast:", await pg.inner_text("#toast"))
            else:
                await pg.evaluate("iniciarTreino(Object.keys(S.rotinas)[0])"); await pg.wait_for_timeout(300)
                await pg.click('[data-acao=serie-ok][data-i="0"][data-s="0"]'); await pg.wait_for_timeout(700)
                await pg.screenshot(path=SHOTS+"/cel-treino.png")
                sw=await pg.evaluate("document.documentElement.scrollWidth"); print("cel treino largura", sw)
        print("ERROS:", erros if erros else "nenhum")
        await b.close()
asyncio.run(main())
