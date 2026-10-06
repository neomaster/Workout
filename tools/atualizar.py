#!/usr/bin/env python3
"""Atualização semanal do "em alta" do Torquímetro Gym.

Uso:  python3 tools/atualizar.py alta.json bruto.json > alta_nova.json

bruto.json — o que as buscas da semana devolveram, sem tratamento:
{
  "data": "2026-10-12",
  "termos": {
    "<id do exercício>": {"tiktok": ["url", ...], "youtube": ["url", ...]}
  },
  "novos": [   # opcional: exercícios que apareceram em alta e ainda não existem
    {"id": "...", "nome": "nome em português", "baseId": "id de um exercício parecido",
     "grupo": "...", "busca": "termo em inglês", "resumo": "...", "temas": ["..."],
     "promessa": "alongado|meio|encurtado|null", "alias": ["..."],
     "tiktok": ["url", ...], "youtube": ["url", ...]}
  ]
}
Inclua em "tiktok" todos os links que a busca restrita a tiktok.com devolveu (vídeos e páginas
/discover/); em "youtube", todos os links da busca restrita a youtube.com. Omitir "youtube" mantém
o exercício sem YouTube pesquisado. Nenhum número é inventado: tudo sai dos links.
"""
import json, re, sys, datetime as dt

RE_TT = re.compile(r"tiktok\.com/@([\w.\-]+)/video/(\d{15,20})")
RE_YT = re.compile(r"youtube\.com/(?:watch\?v=|shorts/)([\w\-]{6,})|youtu\.be/([\w\-]{6,})")
HIST_MAX = 104   # o app guarda até dois anos de semanas

def meses(ym, ref):
    y, m = map(int, ym.split("-")); Y, M = map(int, ref.split("-")[:2]); return (Y - y) * 12 + (M - m)

def termometro(s, ref):
    """Mesma conta do app (alta.js, sinaisDe), só para o resumo impresso."""
    tt = s.get("tt") or {"v": 0, "p": 0, "d": []}; d = tt.get("d") or []
    pres_tt = min(1, (tt["v"] + 0.4 * tt["p"]) / 11)
    u24 = sum(1 for m in d if meses(m, ref) <= 24)
    ult = d[-1] if d else None
    rec = 0 if ult is None else 1 if meses(ult, ref) <= 12 else 0.5 if meses(ult, ref) <= 24 else 0
    mom = 0.6 * (u24 / len(d)) + 0.4 * rec if d else 0.2
    yt = s.get("yt")
    if yt is None: return round(100 * (0.6 * pres_tt + 0.4 * mom))
    pres_yt = min(1, yt["r"] / 10 * 0.8 + min(yt["s"], 4) / 4 * 0.2)
    return round(100 * (0.45 * pres_tt + 0.30 * mom + 0.25 * pres_yt))

def sinais(links):
    tt_urls = links.get("tiktok") or []
    videos = {}
    for u in tt_urls:
        m = RE_TT.search(u)
        if m: videos[m.group(2)] = m.group(1)
    paginas = len({u.split("?")[0] for u in tt_urls if re.search(r"tiktok\.com/(discover|tag|channel)/", u)})
    datas = sorted(dt.datetime.fromtimestamp(int(i) >> 32, dt.timezone.utc) for i in videos)
    tt = {"v": len(videos), "p": paginas, "d": [d.strftime("%Y-%m") for d in datas]}
    yt = None
    if "youtube" in links:
        ids, shorts = set(), 0
        for u in links["youtube"] or []:
            m = RE_YT.search(u)
            if m and (m.group(1) or m.group(2)) not in ids:
                ids.add(m.group(1) or m.group(2)); shorts += "/shorts/" in u
        yt = {"r": min(len(ids), 10), "s": shorts}
    refs = []
    for vid, autor in sorted(videos.items(), key=lambda kv: int(kv[0]), reverse=True)[:2]:
        refs.append(["TikTok", f"https://www.tiktok.com/@{autor}/video/{vid}", "@" + autor])
    for u in links.get("youtube") or []:
        m = RE_YT.search(u)
        if m:
            vid = m.group(1) or m.group(2)
            refs.append(["YouTube", f"https://www.youtube.com/watch?v={vid}" if "/shorts/" not in u else f"https://www.youtube.com/shorts/{vid}", ""]); break
    return tt, yt, refs

def main():
    atual = json.load(open(sys.argv[1], encoding="utf-8"))
    bruto = json.load(open(sys.argv[2], encoding="utf-8"))
    data = bruto["data"]; dt.date.fromisoformat(data)
    pesq = atual["pesquisa"]; exs = atual.get("exercicios", [])
    ids_ex = {e["id"] for e in exs}
    for n in bruto.get("novos", []):
        if n["id"] in pesq: continue
        if not n.get("baseId"): print(f"aviso: {n['id']} sem baseId, ignorado", file=sys.stderr); continue
        e = {k: n[k] for k in ("id", "nome", "baseId", "grupo", "alias") if n.get(k)}
        e.setdefault("alias", [n["busca"]] if n.get("busca") else [])
        if e["id"] not in ids_ex: exs.append(e)
        pesq[n["id"]] = {"temas": n.get("temas", []), "promessa": n.get("promessa"), "resumo": n.get("resumo", ""),
                         "busca": n.get("busca", ""), "tags": [re.sub(r"[^a-z0-9]", "", n.get("busca", "").lower())] if n.get("busca") else [],
                         "tt": {"v": 0, "p": 0, "d": []}, "yt": None, "refs": []}
        bruto.setdefault("termos", {})[n["id"]] = {k: n[k] for k in ("tiktok", "youtube") if k in n}
    semana = {}
    for id_, P in pesq.items():
        links = bruto.get("termos", {}).get(id_)
        if links is None:   # não pesquisado nesta semana: repete os sinais da semana anterior
            semana[id_] = {"tt": P["tt"], "yt": P.get("yt")}; continue
        tt, yt, refs = sinais(links)
        if "youtube" not in links: yt = P.get("yt")
        P["tt"], P["yt"] = tt, yt
        if refs: P["refs"] = refs
        semana[id_] = {"tt": tt, "yt": yt}
    hist = [h for h in atual.get("historico", []) if h["data"] != data] + [{"data": data, "feita": data, "fonte": "pesquisa", "sinais": semana}]
    hist.sort(key=lambda h: h["data"])
    atual.update({"versao": 2, "levantamento": data, "pesquisa": pesq, "exercicios": exs, "historico": hist[-HIST_MAX:]})
    json.dump(atual, sys.stdout, ensure_ascii=False, separators=(",", ":"))
    # resumo para quem rodou
    agora = {k: termometro(v, data) for k, v in semana.items()}
    antes = {k: termometro(v, hist[-2]["data"]) for k, v in hist[-2]["sinais"].items()} if len(hist) > 1 else {}
    top = sorted(agora.items(), key=lambda kv: -kv[1])[:10]
    print(f"semana {data}: {len(agora)} exercícios, {len(hist)} semana(s) no histórico", file=sys.stderr)
    for i, (k, t) in enumerate(top, 1):
        d = "" if k not in antes else f" ({t - antes[k]:+d})"
        print(f"  {i:2}. {k} {t}{d}{' NOVO' if antes and k not in antes else ''}", file=sys.stderr)

if __name__ == "__main__":
    main()
