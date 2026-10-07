"""Sincronização do app com a nuvem, usando um Supabase falso com banco em memória (dois 'aparelhos')."""
import os as _os
RAIZ=_os.path.abspath(_os.path.join(_os.path.dirname(__file__),"..",".."))
SHOTS=_os.path.join(RAIZ,"tests","e2e","shots"); _os.makedirs(SHOTS, exist_ok=True)
import asyncio, subprocess, time, json
from playwright.async_api import async_playwright
srv = subprocess.Popen(["python3","-m","http.server","8769"], cwd=RAIZ, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
URL="http://127.0.0.1:8769/index.html"
FALSO = r"""
const DB = () => JSON.parse(localStorage.getItem("falsodb") || '{"treinos":[],"estado_app":[],"perfis":[{"id":"u1","nome":"Ana Souza","apelido":"Ana","altura_cm":168,"massa_kg":61,"cadastro_completo":true}]}');
const grava = d => localStorage.setItem("falsodb", JSON.stringify(d));
window.supabase = { createClient: () => ({
  auth: { getSession: async () => ({data:{session: localStorage.getItem("sb-pfyldwzlnvhjuzvtyise-auth-token") ? {user:{id:"u1", email:"ana@gmail.com"}} : null}}),
          signOut: async () => localStorage.removeItem("sb-pfyldwzlnvhjuzvtyise-auth-token") },
  from: t => { const q = {op:"select", rows:null, filtros:[], unico:false,
      select(){ return this; }, eq(c,v){ this.filtros.push([c,v]); return this; }, order(){ return this; }, range(){ return this; },
      maybeSingle(){ this.unico = true; return this; },
      upsert(rows){ this.op = "upsert"; this.rows = Array.isArray(rows) ? rows : [rows]; return this; },
      then(res){ const d = DB(); d[t] = d[t] || [];
        const chave = r => t==="treinos" ? r.usuario_id+"|"+r.id : (r.usuario_id||r.id);
        if(this.op==="upsert"){ for(const r of this.rows){ const i = d[t].findIndex(x=>chave(x)===chave(r)); const nova = Object.assign({}, i>=0?d[t][i]:{}, r, {atualizado_em:new Date().toISOString()}); if(i>=0) d[t][i]=nova; else d[t].push(nova); } grava(d); return res({error:null}); }
        let out = d[t].filter(r=>this.filtros.every(([c,v])=>r[c]===v));
        return res(this.unico ? {data: out[0]||null, error:null} : {data: out, error:null}); } };
    return q; } }) };
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); erros=[]
        async def aparelho(db=None):
            ctx=await b.new_context(viewport={"width":1280,"height":900}, locale="pt-BR")
            await ctx.route("**/vendor/supabase-*.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=FALSO))
            await ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
            await ctx.add_init_script("localStorage.setItem('sb-pfyldwzlnvhjuzvtyise-auth-token','x');" + (f"if(!localStorage.getItem('falsodb')) localStorage.setItem('falsodb', {json.dumps(json.dumps(db))});" if db else ""))
            pg=await ctx.new_page(); pg.on("pageerror", lambda e: erros.append(str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(1500); return ctx, pg
        # aparelho 1: tinha exemplo; ao entrar, o exemplo sai e o cadastro preenche o perfil
        c1, a = await aparelho()
        print("A: exemplo?", await a.evaluate("S.exemplo"), "| treinos:", await a.evaluate("S.treinos.length"), "| perfil:", await a.evaluate("[S.perfil.nome,S.perfil.altura,S.perfil.massa]"))
        # registra um treino e uma rotina
        await a.evaluate("""iniciarTreino(null); S.ativo.itens.push(novoItemAtivo('supino-reto')); S.ativo.itens[0].series.forEach(s=>{s.kg=60;s.reps=8;s.feito=true}); finalizarTreino(true);
          const id=uid('r'); S.rotinas[id]={id,nome:'Peito A',itens:[{exId:'supino-reto',series:3,repsMin:8,repsMax:12}]}; S.semana[1]=id; salvar();""")
        await a.wait_for_timeout(1200)
        await a.evaluate("sincronizarNuvem()"); await a.wait_for_timeout(600)
        db = await a.evaluate("JSON.parse(localStorage.getItem('falsodb'))")
        print("nuvem após A:", len(db["treinos"]), "treino(s);", "rotinas:", [r["nome"] for r in db["estado_app"][0]["dados"]["rotinas"].values()])
        await a.evaluate("ir('ajustes')"); await a.wait_for_timeout(200)
        print("painel:", (await a.inner_text("#painelNuvem")).replace("\n"," | ")[:200])
        el = await a.query_selector("#painelNuvem"); await el.screenshot(path=SHOTS+"/nuvem-painel.png")
        # aparelho 2 recebe tudo
        c2, bb = await aparelho(db)
        print("B recebeu:", await bb.evaluate("S.treinos.length"), "treino(s) e rotinas", await bb.evaluate("Object.values(S.rotinas).map(r=>r.nome)"))
        # B exclui o treino; A recebe a exclusão
        tid = await bb.evaluate("S.treinos[0].id")
        await bb.evaluate(f"S.treinos=S.treinos.filter(t=>t.id!=='{tid}'); marcarApagadoNuvem('{tid}'); salvar(); sincronizarNuvem()"); await bb.wait_for_timeout(600)
        db = await bb.evaluate("JSON.parse(localStorage.getItem('falsodb'))")
        await a.evaluate(f"localStorage.setItem('falsodb', {json.dumps(json.dumps(db))})"); await a.evaluate("sincronizarNuvem()"); await a.wait_for_timeout(600)
        print("A depois da exclusão em B:", await a.evaluate("S.treinos.length"), "| linha marcada apagada:", [r["apagado"] for r in db["treinos"]])
        # sair
        await a.evaluate("fecharFolha(); ir('ajustes')"); await a.click("[data-acao=nuvem-sair]"); await a.click("[data-acao=confirmar-ok]"); await a.wait_for_timeout(300)
        print("depois de sair:", (await a.inner_text("#painelNuvem")).replace("\n"," | ")[:120])
        print("erros:", erros); await b.close()
try: asyncio.run(main())
finally: srv.terminate()
