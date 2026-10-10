import asyncio, json, os, sys
from playwright.async_api import async_playwright
"""Auditoria WCAG 2 A/AA (axe-core) em todas as telas, nos temas claro e escuro. Requer `npm install`."""
R=os.path.abspath(os.path.join(os.path.dirname(__file__),"..",".."))
AXE=open(os.path.join(R,"node_modules","axe-core","axe.min.js")).read()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); res={}
        for tema in ["light","dark"]:
            ctx=await b.new_context(viewport={"width":1280,"height":900}, color_scheme=tema); await ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
            await ctx.route("**/vendor/supabase-*.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body="window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}})}})}"))
            pg=await ctx.new_page()
            alvos=[("index.html",t) for t in ["hoje","plano","biblioteca","progresso","lab","ajustes"]]+[("cadastro.html",None)]
            for arq,t in alvos:
                await pg.goto("file://"+R+"/"+arq); await pg.wait_for_timeout(500)
                if t: await pg.evaluate(f"ir('{t}')"); await pg.wait_for_timeout(300)
                if t=="biblioteca": await pg.evaluate("BIB.grupo='Bíceps'; renderBiblioteca(); abrirExercicio('rosca-bayesiana'); document.querySelectorAll('.analise-grupo details, .cinesio-analise details').forEach(d=>d.open=true)"); await pg.wait_for_timeout(300)
                await pg.add_script_tag(content=AXE)
                r=await pg.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa']}}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,40).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').split('\\n').slice(1,2).join(''))})))")
                for v in r:
                    k=(v['id'],v['impact']); res.setdefault(k,[]).append((tema,arq,t,v['n'],v['ex']))
            await ctx.close()
        for k,vs in sorted(res.items(), key=lambda kv:-sum(x[3] for x in kv[1])):
            print(k, sum(x[3] for x in vs))
            import re
            cores=set(re.findall(r"foreground color: (#[0-9a-f]+), background color: (#[0-9a-f]+)", " ".join(e for x in vs for e in x[4])))
            print("   por tela:", [(x[0],x[2] or x[1],x[3]) for x in vs]); print("   cores:", cores); [print("     ",e[:170]) for x in vs for e in x[4] if "eddddc" in e or "e0a21c" in e or x[0]=="light"][:6]
        await b.close()
        print("violações:", sum(len(v) for v in res.values()))
        if res: sys.exit(1)
asyncio.run(main())
