import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio, os, subprocess, time
from playwright.async_api import async_playwright
srv = subprocess.Popen(["python3","-m","http.server","8766"], cwd=RAIZ, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
URL="http://127.0.0.1:8766/index.html"
YT = """Title: x - YouTube\n---\nTudo\nShorts\nPatrocinado\nLoja\nAssistir\nVídeo A\n%s\nhá 3 meses\nCanal\nShorts\nCurto\n%s visualizações\nCurto 2\n80 mil visualizações\nVídeo B\n40 mil\nhá 2 anos\n"""
FAKE = """
window.HOJE_TESTE = '2026-10-12';
window.__chamadas = [];
const banco = {};
window.__banco = banco;
let n = 0;
const mcp = Object.freeze({ callTool: async (srv, tool, inp) => { window.__chamadas.push([srv,tool]);
  if(tool==='navigate'){ n++; return {content:[{type:'text',text:'ok'}], payload:'ok'}; }
  const t = `__YT__`.replace('%s', (n*37)+' mil').replace('%s', (n*11)+' mil'); return {content:[{type:'text',text:t}], payload:t}; } });
const db = Object.freeze({ collection: nome => ({
  get: async () => ({docs: Object.entries(Object.assign(banco, window.__PRE||{})).filter(([k])=>k.startsWith(nome+'/')).map(([k,v])=>({id:k, exists:true, data:()=>v}))}),
  doc: id => ({ set: async v => { banco[nome+'/'+id] = v; } }) }) });
window.__salvos=[]; const dl = Object.freeze({save: async r => { window.__salvos.push(r.filename); return {status:'saved'}; }});
window.claude = { use: async nome => nome==='mcp' ? (window.SEM_NAV ? null : mcp) : nome==='db' ? db : nome==='downloads' ? dl : null };
""".replace("__YT__", YT.replace("\n","\\n"))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        ctx = await b.new_context(viewport={"width":1280,"height":900}, locale="pt-BR", timezone_id="America/Sao_Paulo")
        await ctx.add_init_script(FAKE)
        pg=await ctx.new_page(); pg.on("pageerror", lambda e: erros.append(str(e)))
        await pg.goto(URL); await pg.evaluate("ir('biblioteca')")
        await pg.wait_for_function("HISTORICO_ALTA.length>=2 && RENOV.estado===''", timeout=180000)
        await pg.wait_for_timeout(300)
        print("semanas:", await pg.evaluate("HISTORICO_ALTA.map(h=>h.semana+' '+h.fonte+' '+(h.medidos||''))"))
        print("chamadas:", await pg.evaluate("__chamadas.length"), "banco:", await pg.evaluate("Object.keys(__banco)"))
        print("cabeçalho:", (await pg.inner_text("#renovCab")).replace("\n"," | "))
        print("arquivo:", await pg.evaluate("[...document.querySelectorAll('.semana-arq > summary')].map(s=>s.textContent.replace(/\\s+/g,' ').trim())"))
        print("itens por semana:", await pg.evaluate("[...document.querySelectorAll('.semana-arq')].map(d=>d.querySelectorAll('.arq-lista li').length)"))
        el = await pg.query_selector('.arquivo'); await el.scroll_into_view_if_needed()
        await pg.screenshot(path=SHOTS+"/r-arquivo.png")
        await pg.evaluate("document.getElementById('secAlta').scrollIntoView()"); await pg.wait_for_timeout(100)
        await pg.screenshot(path=SHOTS+"/r-cab.png")
        dados = await pg.evaluate("JSON.stringify(__banco)")
        # recarregar: não renova de novo, mantém as semanas
        await pg.reload(); await pg.wait_for_timeout(1500)
        print("após recarregar:", await pg.evaluate("HISTORICO_ALTA.length"), "chamadas:", await pg.evaluate("__chamadas.length"))
        # outro leitor, sem navegador, lê a semana coletada do banco
        pg2 = await ctx.new_page(); pg2.on("pageerror", lambda e: erros.append(str(e)))
        await pg2.add_init_script("window.SEM_NAV=true; window.__PRE=" + dados)
        await pg2.goto(URL); await pg2.evaluate("localStorage.clear()"); await pg2.reload(); await pg2.wait_for_timeout(1500)
        print("debug:", await pg2.evaluate("[Object.keys(window.__PRE||{}), typeof __PRE, RENOV.db===false]"))
        print("leitor sem navegador:", await pg2.evaluate("HISTORICO_ALTA.map(h=>h.semana+' '+h.fonte)"))
        # semana seguinte, sem navegador: renovação automática por recálculo
        await pg2.evaluate("window.HOJE_TESTE='2026-10-19'"); await pg2.evaluate("renovacaoAutomatica()"); await pg2.evaluate("ir('biblioteca')")
        print("semana seguinte:", await pg2.evaluate("HISTORICO_ALTA.map(h=>h.semana+' '+h.fonte)"))
        print("msg:", await pg2.inner_text("#renovCab"))
        # ajustes: desligar a renovação automática, renovar à mão, exportar e baixar
        await pg2.evaluate("ir('ajustes')"); await pg2.wait_for_timeout(200)
        print("painel:", (await pg2.inner_text("text=última renovação >> xpath=../..")).replace("\n"," | "))
        await pg2.click("text=Renovar sozinho na primeira abertura de cada semana")
        print("auto:", await pg2.evaluate("S.ajustes.renovarAuto"))
        await pg2.evaluate("window.HOJE_TESTE='2026-10-26'"); r = await pg2.evaluate("renovacaoAutomatica().then(x=>!!x)")
        print("renovou desligado?", r); await pg2.evaluate("ir('ajustes')"); await pg2.wait_for_timeout(100)
        await pg2.click("[data-acao=renovar-agora]"); await pg2.wait_for_timeout(400)
        print("após renovar à mão:", await pg2.evaluate("HISTORICO_ALTA.map(h=>h.semana+' '+h.fonte)"))
        await pg2.click("[data-acao=baixar-semanas]"); await pg2.wait_for_timeout(200); print("baixados:", await pg2.evaluate("__salvos"))
        await pg2.click("[data-acao=exportar-semanas]"); txt = await pg2.input_value("#areaDados")
        pg3 = await ctx.new_page(); pg3.on("pageerror", lambda e: erros.append(str(e)))
        await pg3.add_init_script("window.SEM_NAV=true"); await pg3.goto(URL); await pg3.evaluate("localStorage.clear()"); await pg3.reload(); await pg3.wait_for_timeout(1200)
        await pg3.evaluate("ir('ajustes')"); await pg3.fill("#areaDados", txt); await pg3.click("[data-acao=importar]"); await pg3.wait_for_timeout(300)
        print("importado em outro aparelho:", await pg3.evaluate("HISTORICO_ALTA.map(h=>h.semana+' '+h.fonte)"))
        await pg2.screenshot(path=SHOTS+"/r-ajustes.png", full_page=True)
        await pg2.evaluate("ir('biblioteca')")
        # celular
        await pg2.set_viewport_size({"width":390,"height":800}); await pg2.wait_for_timeout(200)
        print("overflow celular:", await pg2.evaluate("document.documentElement.scrollWidth - innerWidth"))
        el = await pg2.query_selector('.arquivo'); await el.scroll_into_view_if_needed(); await pg2.screenshot(path=SHOTS+"/r-celular.png")
        print("erros:", erros)
        await b.close()
try: asyncio.run(main())
finally: srv.terminate()
