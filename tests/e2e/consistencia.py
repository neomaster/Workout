"""Hoje × Progresso com os mesmos números; Biblioteca: músculo, ficha corrigida e painel que fecha; exemplo antigo continua exemplo."""
import asyncio, datetime, os, sys
from playwright.async_api import async_playwright
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(__file__),"..","..","index.html"))
async def main():
    f=[]; ok=lambda c,m: c or f.append(m)
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":1280,"height":900}, locale="pt-BR"); await ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
        pg=await ctx.new_page(); er=[]; pg.on("pageerror", lambda e: er.append(str(e)))
        await pg.clock.set_fixed_time(datetime.datetime(2026,10,10,20,1))
        await pg.goto(URL); await pg.wait_for_timeout(400)
        # exemplo salvo por versão antiga, sem a marca: continua exemplo e é refeito
        await pg.evaluate("localStorage.setItem(CHAVE, JSON.stringify((()=>{const v=gerarExemplo(somaDias(new Date(),-9)); v.exemplo=false; delete v.exemploDia; return v})()))")
        await pg.reload(); await pg.wait_for_timeout(400)
        ok(not await pg.evaluate("$('faixaExemplo').hidden"), "banner sumiu com exemplo antigo")
        heroi = await pg.evaluate("Object.fromEntries([...document.querySelectorAll('#tela-hoje .numeros > div')].map(d=>[d.querySelector('span').textContent, d.querySelector('b').textContent]))")
        carga_h = (await pg.inner_text("#tela-hoje .mc-leitura")).split("\n")[0]
        await pg.evaluate("ir('progresso')"); await pg.wait_for_timeout(300)
        kp = await pg.evaluate("Object.fromEntries([...document.querySelectorAll('#tela-progresso .kpis-periodo .kpi')].map(d=>[d.querySelector('.rot').textContent.toLowerCase(), d.querySelector('.v').textContent]))")
        carga_p = (await pg.inner_text("#tela-progresso .mc-leitura")).split("\n")[0]
        print("Hoje:", heroi, carga_h, "| Progresso:", kp, carga_p)
        ok(heroi.get("treinos em 4 semanas")==kp.get("treinos em 4 semanas")=="16", "treinos em 4 semanas diferente")
        ok(heroi.get("séries por semana")==kp.get("séries por semana")=="69", "séries por semana diferente")
        ok(carga_h==carga_p, "carga da semana diferente")
        # Biblioteca: músculo, painel, ficha
        await pg.evaluate("ir('biblioteca')"); await pg.wait_for_timeout(300)
        await pg.locator("#tela-biblioteca [data-musc='quadriceps-femoral']:visible").first.click(); await pg.wait_for_timeout(300)
        ok("QUADRÍCEPS" in (await pg.inner_text("#painelAnalise h3")).upper(), "painel do músculo não abriu")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(150); ok(not await pg.query_selector("#painelAnalise"), "Esc não fechou")
        await pg.click("[data-acao=analise-abrir]"); await pg.wait_for_timeout(150)
        await pg.click("#tela-biblioteca h1"); await pg.wait_for_timeout(150); ok(not await pg.query_selector("#painelAnalise"), "clique fora não fechou")
        fichas = {"agachamento-livre":["alonga no quadril (que estende) e encurta no joelho","quadril aberto, joelho ou calcâneo em varo ou valgo"],
                  "extensora":["Comece com o joelho a 90°","insuficiência ativa"],
                  "puxada-frontal":["depressão","adução","posição do livro","recomendação","puxada pela frente"],
                  "crossover":["protrusão horizontal"], "rosca-inclinada":["Linha profunda anterior do braço"]}
        for ex,txts in fichas.items():
            await pg.evaluate(f"fecharFolha(); abrirExercicio('{ex}')"); await pg.wait_for_timeout(150)
            t = await pg.inner_text("#folha .cinesio-analise")
            for x in txts: ok(x in t, f"{ex}: falta “{x}”")
        await pg.evaluate("fecharFolha(); abrirExercicio('puxada-frontal')"); await pg.wait_for_timeout(150)
        t = await pg.inner_text("#folha .cinesio-analise"); ok("concêntrica" in t and "depressão" in t.split("Músculos no movimento")[0], "puxada: escápula sem depressão na tabela")
        await b.close()
    print("erros:", er, "| falhas:", f); sys.exit(1 if f or er else 0)
asyncio.run(main())
