import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio, subprocess, time
from playwright.async_api import async_playwright
srv = subprocess.Popen(["python3","-m","http.server","8767"], cwd=RAIZ, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
URL="http://127.0.0.1:8767/index.html"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        ctx=await b.new_context(viewport={"width":1280,"height":900}, locale="pt-BR")
        pg=await ctx.new_page(); pg.on("pageerror", lambda e: erros.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        # rampa de aquecimento
        await pg.evaluate("iniciarTreino(null); S.ativo.itens.push(novoItemAtivo('supino-reto')); renderTreino()")
        await pg.fill("[data-campo=serie][data-i='0'][data-s='0'][data-k=kg]", "100"); await pg.press("[data-campo=serie][data-i='0'][data-s='0'][data-k=kg]", "Tab")
        await pg.click("[data-acao=serie-aquec][data-i='0']"); await pg.wait_for_timeout(200)
        print("rampa:", await pg.evaluate("S.ativo.itens[0].series.map(s=>(s.tipo==='aquec'?'aq ':'')+s.kg+'×'+s.reps)"))
        await pg.click("[data-acao=serie-aquec][data-i='0']"); await pg.wait_for_timeout(100)
        print("de novo (não duplica):", await pg.evaluate("S.ativo.itens[0].series.filter(s=>s.tipo==='aquec').length"))
        # nota fixa
        await pg.fill("#telaTreino .nota-ex", "banco no furo 3"); await pg.press("#telaTreino .nota-ex", "Tab")
        await pg.screenshot(path=SHOTS+"/x-rampa.png")
        await pg.evaluate("descartarTreino(true)"); await pg.wait_for_timeout(100)
        await pg.reload(); await pg.wait_for_timeout(600)
        print("nota após recarregar:", await pg.evaluate("S.notas['supino-reto']"))
        await pg.evaluate("abrirExercicio('supino-reto')"); await pg.wait_for_timeout(200)
        print("nota na ficha:", await pg.input_value("#folha .nota-ex")); await pg.evaluate("fecharFolha()")
        # plano × feito
        await pg.evaluate("ir('progresso')"); await pg.wait_for_timeout(300)
        t = await pg.inner_text(".pf-linha >> nth=0"); print("plano×feito:", await pg.evaluate("document.querySelectorAll('.pf-linha').length"), "linhas; 1ª:", t.replace("\n"," "))
        el = await pg.query_selector(".plano-feito"); await el.scroll_into_view_if_needed(); await pg.screenshot(path=SHOTS+"/x-planofeito.png")
        # CSV
        await pg.evaluate("ir('ajustes')"); await pg.click("[data-acao=exportar-csv]")
        csv = await pg.input_value("#areaDados"); print("csv:", csv.split("\n")[0][:60], "…", len(csv.split("\n"))-2, "linhas")
        # rotina por link
        await pg.evaluate("ir('plano')"); await pg.click("[data-acao=rotina-compartilhar] >> nth=0"); await pg.wait_for_timeout(200)
        link = await pg.input_value("#linkRotina"); print("link:", link[:70]+"…", len(link), "caracteres")
        pg2 = await ctx.new_page(); pg2.on("pageerror", lambda e: erros.append(str(e)))
        await pg2.goto(URL); await pg2.wait_for_timeout(500); antes = await pg2.evaluate("Object.keys(S.rotinas).length")
        await pg2.goto(link); await pg2.reload(); await pg2.wait_for_timeout(800)
        print("pergunta:", (await pg2.inner_text("#folha")).split("\n")[0:2])
        await pg2.click("[data-acao=confirmar-ok]"); await pg2.wait_for_timeout(300)
        print("rotinas:", antes, "→", await pg2.evaluate("Object.keys(S.rotinas).length"), "| hash:", await pg2.evaluate("location.hash"))
        # offline
        await pg.reload(); await pg.wait_for_timeout(1500)
        print("service worker:", await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!(r&&(r.active||r.installing||r.waiting)))"))
        await ctx.set_offline(True); await pg.reload(); await pg.wait_for_timeout(800)
        print("abre offline:", await pg.evaluate("!!document.querySelector('#tela-hoje') && typeof S==='object'"))
        await ctx.set_offline(False)
        print("erros:", erros)
        await b.close()
try: asyncio.run(main())
finally: srv.terminate()
