"""Imagem de compartilhamento do treino e tabela de % do 1RM."""
import os as _os, base64
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio
from playwright.async_api import async_playwright
URL="file://"+_os.path.join(RAIZ,"index.html")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        ctx=await b.new_context(viewport={"width":1280,"height":900}, locale="pt-BR")
        pg=await ctx.new_page(); pg.on("pageerror", lambda e: erros.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(700)
        tid = await pg.evaluate("S.treinos[S.treinos.length-1].id")
        await pg.evaluate(f"abrirTreinoSalvo('{tid}')"); await pg.wait_for_timeout(200)
        await pg.click("#folha [data-acao=cartao-treino]"); await pg.wait_for_selector("#folha .cartao-img", timeout=8000)
        info = await pg.evaluate("({tam:CARTAO.blob.size, tipo:CARTAO.blob.type, nome:CARTAO.nome})"); print("cartão:", info)
        dados = await pg.evaluate("new Promise(r=>{const f=new FileReader(); f.onload=()=>r(f.result.split(',')[1]); f.readAsDataURL(CARTAO.blob);})")
        open(SHOTS+"/cartao-treino.png","wb").write(base64.b64decode(dados))
        print("botões:", await pg.evaluate("[...document.querySelectorAll('#folha .linha button, #folha .linha span')].map(b=>b.textContent.trim())"))
        await pg.evaluate("fecharFolha(); abrirExercicio('supino-reto')"); await pg.wait_for_timeout(200)
        await pg.click("text=Cargas por % do 1RM"); await pg.wait_for_timeout(100)
        print("tabela:", (await pg.inner_text(".tabela-pct")).replace("\n"," | ")[:200])
        print("erros:", erros); await b.close()
asyncio.run(main())
