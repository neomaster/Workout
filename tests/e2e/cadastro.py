"""Página de cadastro com um Supabase falso no lugar da biblioteca (sem rede, sem Google)."""
import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio, subprocess, time
from playwright.async_api import async_playwright
srv = subprocess.Popen(["python3","-m","http.server","8768"], cwd=RAIZ, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
URL="http://127.0.0.1:8768/cadastro.html"
FALSO = r"""
window.__log = [];
const BANCO = JSON.parse(sessionStorage.getItem("falso") || '{"sessao":null,"perfil":null,"treinos":3}');
const grava = () => sessionStorage.setItem("falso", JSON.stringify(BANCO));
window.supabase = { createClient: (url, chave, op) => { __log.push(["createClient", url, op.auth.flowType]); return {
  auth: {
    getSession: async () => ({data:{session: BANCO.sessao}}),
    signInWithOAuth: async o => { __log.push(["oauth", o.provider, o.options.redirectTo]);
      if(window.ERRO_PROVEDOR) return {error:{message:"Unsupported provider: provider is not enabled"}};
      BANCO.sessao = {user:{id:"u1", email:"ana@gmail.com", user_metadata:{full_name:"Ana Souza"}}};
      BANCO.perfil = {id:"u1", email:"ana@gmail.com", nome:"Ana Souza", foto_url:null, cadastro_completo:false}; grava(); location.reload(); return {error:null}; },
    signOut: async () => { BANCO.sessao = null; grava(); __log.push(["signOut"]); }
  },
  from: t => { const q = {_t:t, _op:"select", _dados:null,
      select(c, o){ this._op = o && o.head ? "count" : "select"; return this; }, eq(){ return this; },
      update(d){ this._op = "update"; this._dados = d; return this; }, delete(){ this._op = "delete"; return this; },
      maybeSingle(){ return this; },
      then(res){ __log.push([this._t, this._op, this._dados]);
        if(this._t==="perfis" && this._op==="select") return res({data:BANCO.perfil, error:null});
        if(this._t==="perfis" && this._op==="update"){ Object.assign(BANCO.perfil, this._dados); grava(); return res({error:null}); }
        if(this._t==="treinos" && this._op==="count") return res({count:BANCO.treinos, error:null});
        if(this._op==="delete"){ if(this._t==="treinos") BANCO.treinos = 0; grava(); return res({error:null}); }
        return res({data:null, error:null}); } };
    return q; } }; } };
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        for nome, vp in [("desk",{"width":1280,"height":860}),("cel",{"width":390,"height":844})]:
            ctx=await b.new_context(viewport=vp, locale="pt-BR")
            await ctx.route("**/vendor/supabase-*.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=FALSO))
            await ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
            pg=await ctx.new_page(); pg.on("pageerror", lambda e: erros.append(str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(2200)
            print(nome, "etapa 1 visível:", await pg.is_visible("#etapa1"), "| overflow:", await pg.evaluate("document.documentElement.scrollWidth-innerWidth"))
            await pg.screenshot(path=f"{SHOTS}/cad-{nome}-1.png", full_page=True)
            if nome=="cel": await ctx.close(); continue
            # erro de provedor desligado
            await pg.evaluate("window.ERRO_PROVEDOR=true"); await pg.click("#entrarGoogle"); await pg.wait_for_timeout(200)
            print("erro provedor:", await pg.inner_text("#erroGeral"))
            await pg.evaluate("window.ERRO_PROVEDOR=false"); await pg.click("#entrarGoogle"); await pg.wait_for_load_state(); await pg.wait_for_timeout(1500)
            print("etapa 2 visível:", await pg.is_visible("#etapa2"), "| apelido:", await pg.input_value("#apelido"))
            # enviar incompleto
            await pg.click("#salvar"); await pg.wait_for_timeout(100); print("validação:", await pg.inner_text("#erroForm"))
            await pg.fill("#altura","178"); await pg.fill("#massa","82.5"); await pg.check("input[name=objetivo][value=hipertrofia]", force=True)
            await pg.check("input[name=nivel][value=intermediario]", force=True); await pg.check("input[name=dias][value='5']", force=True); await pg.check("#aceite")
            await pg.screenshot(path=f"{SHOTS}/cad-desk-2.png", full_page=True)
            await pg.click("#salvar"); await pg.wait_for_timeout(400)
            print("enviado:", await pg.evaluate("JSON.stringify(__log.filter(l=>l[1]==='update')[0][2])"))
            print("etapa 3:", (await pg.inner_text("#etapa3")).replace("\n"," | ")[:220])
            await pg.screenshot(path=f"{SHOTS}/cad-desk-3.png", full_page=True)
            await pg.reload(); await pg.wait_for_timeout(1200); print("após recarregar vai direto ao pronto:", await pg.is_visible("#etapa3"))
            await pg.click("text=Apagar meus dados da nuvem"); await pg.click("#apagar"); await pg.click("#apagar"); await pg.wait_for_timeout(300)
            print("apagar:", await pg.inner_text("#okMsg"), "|", await pg.inner_text("#contagem"))
            await pg.click("#etapa3 [data-sair]"); await pg.wait_for_timeout(200); print("saiu → etapa 1:", await pg.is_visible("#etapa1"))
            await ctx.close()
        print("erros:", erros); await b.close()
try: asyncio.run(main())
finally: srv.terminate()
