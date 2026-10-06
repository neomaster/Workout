/* =====================================================================
   ACERVO DAS REDES — exercícios em alta em vídeos curtos, programas
   populares, vídeos salvos e leitura de treinos escritos em legendas.
   Instagram e TikTok não deixam o app ler posts: o app guarda o link,
   abre a busca na rede e lê o texto que você colar.
   ===================================================================== */

/* fonte.tags: hashtags usadas na busca; fonte.origem: de onde o exercício ficou conhecido */
const EXTRA_REDES = [
 {id:"encolhimento-kelso",nome:"Encolhimento Kelso (tronco inclinado)",grupo:"Trapézio",carga:30,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Escápula",seg:"fixo",f:0.02,b0:-25,db:35,g:-90,off:0.07}],
  alias:["kelso shrug","encogimiento kelso","chest supported shrug"],
  fonte:{tags:["kelsoshrug","encolhimentokelso"], origem:"Vem do powerlifting dos anos 1980 e voltou com força nos vídeos curtos: braços passivos, escápulas para trás e para cima."},
  nota:"Tronco inclinado faz a retração entrar na conta: o trapézio médio trabalha junto com o superior."},
 {id:"elevacao-lateral-deitado",nome:"Elevação lateral deitado de lado",grupo:"Ombro",carga:6,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Ombro",seg:"braco",f:1.5,b0:0,db:80,g:-90,off:0}],
  alias:["side lying lateral raise","lying lateral raise","elevacion lateral acostado"],
  fonte:{tags:["sidelyinglateralraise","lateralraise"], origem:"Favorita de quem defende treinar o músculo alongado: deitado de lado, o pico de torque vai para o começo."},
  nota:"Curva espelhada à da elevação em pé: máximo na saída, perto de zero com o braço vertical."},
 {id:"elevacao-y-polia",nome:"Elevação em Y na polia",grupo:"Ombro",carga:7,tipo:"externa",bi:false,equip:"Polia",
  juntas:[{j:"Ombro",seg:"braco",f:1.5,b0:-95,db:120,g:-25,off:0}],
  alias:["cable y raise","y raise","elevacion en y"],
  fonte:{tags:["cableyraise","yraise"], origem:"Cabos cruzados à frente do corpo e braços abrindo em Y; virou padrão nas listas de melhores exercícios de deltoide."},
  nota:"O cabo vindo de baixo e cruzado mantém torque desde o início e leva a abertura acima da linha do ombro."},
 {id:"elevacao-lateral-polia-tras",nome:"Elevação lateral na polia por trás do corpo",grupo:"Ombro",carga:7,tipo:"externa",bi:false,equip:"Polia",
  juntas:[{j:"Ombro",seg:"braco",f:1.5,b0:-105,db:105,g:-40,off:0}],
  alias:["behind the back cable lateral raise","behind the back lateral raise","cuffed cable lateral raise"],
  fonte:{tags:["behindthebacklateralraise","cablelateralraise"], origem:"O cabo passa por trás do quadril: o braço começa cruzado e o deltoide sai alongado."},
  nota:"Começar com o braço atrás do corpo adiciona amplitude justamente onde o halter não carrega nada."},
 {id:"crucifixo-inverso-maquina",nome:"Crucifixo inverso no peck deck",grupo:"Ombro",carga:30,tipo:"externa",bi:false,equip:"Máquina",
  juntas:[{j:"Ombro",seg:"braco",f:0.7,b0:170,db:-85,g:180,off:0.14}],
  alias:["reverse pec deck","reverse fly machine","rear delt fly machine","pec deck invertido"],
  fonte:{tags:["reversepecdeck","reardelts"], origem:"Aparece no topo das listas de deltoide posterior: máquina estável, fácil de levar perto da falha."},
  nota:"A came achata a curva: tensão parecida do começo ao fim da abertura."},
 {id:"remada-meadows",nome:"Remada Meadows (landmine unilateral)",grupo:"Costas",carga:40,tipo:"externa",bi:false,equip:"Barra",
  juntas:[{j:"Ombro",seg:"braco",f:1.3,b0:-95,db:65,g:-80,off:0}],
  alias:["meadows row","remo meadows","landmine row"],
  fonte:{tags:["meadowsrow","landminerow"], origem:"Remada com a ponta da barra presa no canto (landmine), pegada pela lateral da manga."},
  nota:"O arco da landmine inclina a força alguns graus e estica um pouco mais o dorsal embaixo."},
 {id:"remada-pendlay",nome:"Remada Pendlay",grupo:"Costas",carga:70,tipo:"externa",bi:true,equip:"Barra",
  juntas:[{j:"Ombro",seg:"braco",f:1.2,b0:-90,db:60,g:-90,off:0},
          {j:"Quadril/lombar",seg:"tronco",f:0.5,b0:0,db:-6,g:-90,off:0.05}],
  alias:["pendlay row","remo pendlay","deficit pendlay row"],
  fonte:{tags:["pendlayrow"], origem:"Cada repetição sai do chão com o tronco paralelo: popular entre quem treina força."},
  nota:"Com o tronco na horizontal, a lombar segura um torque maior que na remada curvada comum."},
 {id:"remada-apoiada",nome:"Remada apoiada no banco inclinado",grupo:"Costas",carga:26,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Ombro",seg:"braco",f:1.25,b0:-90,db:58,g:-90,off:0}],
  alias:["chest supported row","chest supported dumbbell row","incline dumbbell row","seal row","remo apoyado","remada no banco inclinado"],
  fonte:{tags:["chestsupportedrow","sealrow"], origem:"Peito apoiado tira a lombar e o impulso: favorita das listas de melhores exercícios de costas."},
  nota:"Mesma alavanca da remada unilateral, sem a lombar e sem roubar com o tronco."},
 {id:"puxada-unilateral",nome:"Puxada unilateral na polia",grupo:"Costas",carga:30,tipo:"externa",bi:false,equip:"Polia",
  juntas:[{j:"Ombro",seg:"braco",f:1.1,b0:100,db:-110,g:110,off:0.03}],
  alias:["single arm lat pulldown","one arm lat pulldown","jalon unilateral","puxada unilateral"],
  fonte:{tags:["singlearmlatpulldown","latpulldown"], origem:"Uma mão de cada vez permite levar o cotovelo mais longe e alongar mais no topo."},
  nota:"O cabo alinhado com o braço no topo zera o torque ali; a tensão cresce no meio da puxada."},
 {id:"lat-prayer",nome:"Pullover ajoelhado na polia (lat prayer)",grupo:"Costas",carga:25,tipo:"externa",bi:false,equip:"Polia",
  juntas:[{j:"Ombro",seg:"braco",f:1.5,b0:150,db:-110,g:70,off:0}],
  alias:["lat prayer","cable lat prayer","kneeling cable pullover","pullover en polea arrodillado"],
  fonte:{tags:["latprayer","cablepullover"], origem:"Ajoelhado de frente para a polia alta, braços estendidos descendo até os quadris."},
  nota:"Isola o dorsal sem bíceps; o cabo vindo de cima e da frente carrega o meio do arco."},
 {id:"crucifixo-polia-sentado",nome:"Crucifixo sentado na polia",grupo:"Peito",carga:14,tipo:"externa",bi:false,equip:"Polia",
  juntas:[{j:"Ombro",seg:"braco",f:1.5,b0:190,db:-100,g:100,off:0}],
  alias:["seated cable fly","seated cable pec fly","seated cable flye","aperturas en polea sentado"],
  fonte:{tags:["seatedcablefly","cablefly"], origem:"Banco no meio do crossover com os cabos vindo de trás: aparece no topo das listas de peitoral."},
  nota:"Com o cabo vindo de trás, o pico cai com o peitoral alongado: o oposto do crossover em pé."},
 {id:"supino-inclinado-halteres",nome:"Supino inclinado com halteres",grupo:"Peito",carga:26,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Ombro",seg:"braco",f:1.1,b0:12,db:-88,g:-90,off:0}],
  alias:["incline dumbbell press","incline db press","press inclinado con mancuernas"],
  fonte:{tags:["inclinedumbbellpress","supinoinclinado"], origem:"Clássico que nunca sai das listas: halteres descem mais que a barra."},
  nota:"Os halteres passam da linha do peito e somam amplitude no alongado."},
 {id:"flexao-deficit",nome:"Flexão com déficit (mãos elevadas)",grupo:"Peito",carga:0,tipo:"corporal",frac:0.65,bi:false,equip:"Peso corporal",
  juntas:[{j:"Ombro",seg:"braco",f:1.0,b0:18,db:-83,g:-90,off:0}],
  alias:["deficit push up","deficit pushup","flexiones con deficit","flexao deficit"],
  fonte:{tags:["deficitpushup","flexaodebraco"], origem:"Mãos sobre anilhas ou blocos para o peito descer abaixo das mãos."},
  nota:"Os graus a mais embaixo caem justamente onde o torque já é máximo."},
 {id:"triceps-cruzado",nome:"Tríceps cruzado na polia",grupo:"Tríceps",carga:10,tipo:"externa",bi:false,equip:"Polia",
  juntas:[{j:"Cotovelo",seg:"antebraco",f:1.1,b0:150,db:-115,g:175,off:0}],
  alias:["cross body cable tricep extension","cross body triceps extension","cable cross tricep extension","extension cruzada en polea"],
  fonte:{tags:["crossbodytricepextension","tricepsextension"], origem:"Cabo vindo do lado oposto na altura do ombro, braço alinhado com o cabo."},
  nota:"Com o cabo horizontal, o torque é alto com o cotovelo dobrado e cai no travamento."},
 {id:"triceps-katana",nome:"Tríceps katana na polia",grupo:"Tríceps",carga:10,tipo:"externa",bi:false,equip:"Polia",
  juntas:[{j:"Cotovelo",seg:"antebraco",f:1.1,b0:165,db:-95,g:-105,off:0}],
  alias:["katana extension","katana cable triceps extension","katana tricep extension"],
  fonte:{tags:["katanaextension","tricepsworkout"], origem:"Extensão unilateral acima da cabeça com o cabo cruzando o corpo, como quem saca uma espada."},
  nota:"Braço acima da cabeça deixa a cabeça longa do tríceps alongada durante a parte pesada."},
 {id:"jm-press",nome:"JM press no Smith",grupo:"Tríceps",carga:40,tipo:"externa",bi:true,equip:"Smith",
  juntas:[{j:"Cotovelo",seg:"antebraco",f:0.9,b0:175,db:-80,g:-90,off:0.02}],
  alias:["jm press","smith machine jm press","smith jm press"],
  fonte:{tags:["jmpress"], origem:"Meio caminho entre tríceps testa e supino fechado; ganhou fama no powerlifting e nos vídeos de tríceps."},
  nota:"O antebraço começa quase horizontal: braço de momento grande com o tríceps alongado."},
 {id:"agachamento-pendular",nome:"Agachamento pendular",grupo:"Quadríceps",carga:80,tipo:"externa",bi:false,equip:"Máquina",
  juntas:[{j:"Joelho",seg:"perna",f:0.7,b0:-22,db:-68,g:-90,off:0.02},
          {j:"Quadril",seg:"tronco",f:0.3,b0:-30,db:-50,g:-90,off:0}],
  alias:["pendulum squat","sentadilla pendular"],
  fonte:{tags:["pendulumsquat"], origem:"Máquina de trajeto em arco, presente nas listas de melhores exercícios de quadríceps."},
  nota:"O arco da máquina leva o joelho bem à frente: muito torque no fundo, pouco na lombar."},
 {id:"agachamento-espanhol",nome:"Agachamento espanhol (com faixa)",grupo:"Quadríceps",carga:0,tipo:"corporal",frac:0.8,bi:false,equip:"Peso corporal",
  juntas:[{j:"Joelho",seg:"perna",f:0.6,b0:-12,db:-72,g:-90,off:0.03}],
  alias:["spanish squat","sentadilla espanola","sentadilla española"],
  fonte:{tags:["spanishsquat"], origem:"Uma faixa atrás dos joelhos segura a canela na vertical; comum em vídeos de reabilitação de joelho."},
  nota:"Canela vertical e tronco ereto concentram quase todo o torque no joelho."},
 {id:"nordico-reverso",nome:"Nórdico reverso",grupo:"Quadríceps",carga:0,tipo:"corporal",frac:0.7,bi:false,equip:"Peso corporal",
  juntas:[{j:"Joelho",seg:"tronco",f:1.1,b0:135,db:-45,g:-90,off:0}],
  alias:["reverse nordic","reverse nordic curl","nordico reverso","nórdico inverso"],
  fonte:{tags:["reversenordic","kneesovertoes"], origem:"Popularizado pelo método Knees Over Toes: ajoelhado, o corpo inclina para trás como uma peça só."},
  nota:"Sem nenhuma carga, o quadríceps segura o corpo inteiro no ponto mais alongado."},
 {id:"agachamento-atg",nome:"Agachamento dividido ATG",grupo:"Quadríceps",carga:20,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Joelho",seg:"perna",f:0.55,b0:-15,db:-70,g:-90,off:0},
          {j:"Quadril",seg:"tronco",f:0.5,b0:-25,db:-50,g:-90,off:0}],
  alias:["atg split squat","knees over toes split squat","split squat atg"],
  fonte:{tags:["atgsplitsquat","kneesovertoes"], origem:"Divisão profunda com o joelho passando bem da ponta do pé, marca registrada do método Knees Over Toes."},
  nota:"O joelho à frente aumenta o braço de momento no fundo, onde o quadríceps está mais alongado."},
 {id:"step-up-patrick",nome:"Step-up Patrick (calcanhar elevado)",grupo:"Quadríceps",carga:0,tipo:"corporal",frac:0.95,bi:false,equip:"Peso corporal",
  juntas:[{j:"Joelho",seg:"perna",f:0.6,b0:-35,db:-45,g:-90,off:0.02}],
  alias:["patrick step","patrick step up","peterson step up","petersen step up"],
  fonte:{tags:["patrickstep","petersonstepup"], origem:"Degrau baixo, calcanhar elevado e joelho avançando sobre os dedos; muito usado no método Knees Over Toes."},
  nota:"Amplitude curta perto da extensão, com o peso de uma perna inteira."},
 {id:"tibial-tib-bar",nome:"Elevação de tíbia (tib bar)",grupo:"Tibial",carga:8,tipo:"externa",bi:false,equip:"Tib bar",
  juntas:[{j:"Tornozelo",seg:"pe",f:0.8,b0:-35,db:50,g:-90,off:0.02}],
  alias:["tibialis raise","tib bar raise","tib raise","elevacion de tibial","elevação de tibial"],
  fonte:{tags:["tibialisraise","tibbar"], origem:"Fortalecer a frente da canela virou moda com o método Knees Over Toes."},
  nota:"Carga leve na ponta do pé: braço de momento longo para um músculo pequeno."},
 {id:"pull-through",nome:"Pull-through na polia",grupo:"Posterior e glúteo",carga:30,tipo:"externa",bi:false,equip:"Polia",
  juntas:[{j:"Quadril",seg:"tronco",f:0.5,b0:-75,db:75,g:-150,off:0}],
  alias:["cable pull through","pull through","tiron entre las piernas"],
  fonte:{tags:["cablepullthrough","glutes"], origem:"Dobradiça de quadril com o cabo passando entre as pernas: comum em treinos de glúteo nas redes."},
  nota:"O cabo puxa para trás e para baixo: o pico fica com o quadril flexionado, ao contrário da elevação pélvica."},
 {id:"frog-pump",nome:"Elevação pélvica frog pump",grupo:"Posterior e glúteo",carga:0,tipo:"corporal",frac:0.6,bi:false,equip:"Peso corporal",
  juntas:[{j:"Quadril",seg:"tronco",f:0.4,b0:-25,db:25,g:-90,off:0}],
  alias:["frog pump","frog pumps","puente rana"],
  fonte:{tags:["frogpumps","glutes"], origem:"Plantas dos pés juntas, joelhos abertos e muitas repetições curtas: viral em treinos de glúteo."},
  nota:"Amplitude curta e braço de momento quase constante: curva achatada, feita para volume alto."},
 {id:"dragon-flag",nome:"Dragon flag",grupo:"Abdômen",carga:0,tipo:"corporal",frac:0.85,bi:false,equip:"Peso corporal",
  juntas:[{j:"Tronco",seg:"tronco",f:2.6,b0:0,db:65,g:-90,off:0}],
  alias:["dragon flag","bandera del dragon"],
  fonte:{tags:["dragonflag","abs"], origem:"Ficou famoso em filmes de artes marciais e segue entre os desafios de abdômen mais compartilhados."},
  nota:"O corpo inteiro vira alavanca: o maior torque de toda a lista de abdômen, no ponto mais baixo."}
];
EXTRA_REDES.forEach(e=>{ if(!BASE.some(b=>b.id===e.id)) BASE.push(e); });

/* hashtags de quem já estava na biblioteca */
const TAGS_BASE = {
  "supino-reto":["benchpress","supinoreto"],"agachamento-livre":["squat","agachamento"],"terra":["deadlift","levantamentoterra"],
  "stiff":["romaniandeadlift","stiff"],"hip-thrust":["hipthrust","elevacaopelvica"],"rosca-bayesiana":["bayesiancurl"],
  "elevacao-lateral":["lateralraise","elevacaolateral"],"elevacao-lateral-polia":["cablelateralraise"],"barra-fixa":["pullups","barrafixa"],
  "puxada-frontal":["latpulldown","puxadafrontal"],"bulgaro":["bulgariansplitsquat","agachamentobulgaro"],"nordico":["nordichamstringcurl","nordiccurl"],
  "sissy-squat":["sissysquat"],"face-pull":["facepull"],"hack":["hacksquat"],"leg-press":["legpress"],"extensora":["legextension","cadeiraextensora"],
  "mesa-flexora":["legcurl","mesaflexora"],"rosca-scott":["preachercurl","roscascott"],"triceps-corda-alta":["overheadtricepsextension"],
  "crucifixo":["dumbbellfly","crucifixo"],"peck-deck":["pecdeck","voador"],"remada-curvada":["barbellrow","remadacurvada"],"prancha":["plank","prancha"]
};
const STOP_TAG = /\b(com|na|no|de|do|da|dos|das|em|e|o|a)\b/g;
function tagsDe(ex){
  if(!ex) return [];
  if(ex.fonte && ex.fonte.tags) return ex.fonte.tags;
  if(TAGS_BASE[ex.id]) return TAGS_BASE[ex.id];
  return [normNome(ex.nome).replace(/\(.*?\)/g,"").replace(STOP_TAG," ").replace(/[^a-z0-9]/g,"")];
}
const emAlta = ex => !!(ex && (ex.fonte || ALTA_PESQUISA[ex.id]));  /* ALTA_PESQUISA vem de alta.js; só é lido depois que tudo carregou */
function linksBusca(ex){
  const t = tagsDe(ex)[0], q = encodeURIComponent(ex.nome);
  return [
    {rede:"Instagram", rot:"#"+t, url:"https://www.instagram.com/explore/tags/"+encodeURIComponent(t)+"/"},
    {rede:"TikTok", rot:"busca", url:"https://www.tiktok.com/search?q="+q},
    {rede:"YouTube", rot:"vídeos curtos", url:"https://www.youtube.com/results?search_query="+q+"+execu%C3%A7%C3%A3o&sp=EgIYAQ%253D%253D"}
  ];
}
function redeDe(url){
  let h = ""; try{ h = new URL(url).hostname.replace(/^www\./,""); }catch(e){ return null; }
  if(/(^|\.)instagram\.com$|(^|\.)instagr\.am$/.test(h)) return "Instagram";
  if(/(^|\.)tiktok\.com$/.test(h)) return "TikTok";
  if(/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(h)) return "YouTube";
  if(/(^|\.)(x|twitter)\.com$/.test(h)) return "X";
  if(/(^|\.)facebook\.com$|(^|\.)fb\.watch$/.test(h)) return "Facebook";
  if(/(^|\.)kwai\.com$/.test(h)) return "Kwai";
  return "Link";
}
function urlValida(s){ try{ const u = new URL((s||"").trim()); return /^https?:$/.test(u.protocol) ? u.href : null; }catch(e){ return null; } }
/* tipo do conteúdo: reel, post, vídeo curto... só pelo caminho do link */
function tipoLink(url){
  try{ const p = new URL(url).pathname;
    if(/\/reels?\//.test(p)) return "reel"; if(/\/p\//.test(p)) return "post"; if(/\/shorts\//.test(p)) return "short";
    if(/\/video\//.test(p)) return "vídeo"; if(/watch|youtu\.be/.test(url)) return "vídeo";
  }catch(e){} return "link";
}

/* ---------- programas populares nas redes ---------- */
Object.assign(PLANOS_PRONTOS, {
  arnold:{objetivo:"Hipertrofia", nivel:"Avançado", dias:6, duracao:"75–90 min", redes:true, tags:["arnoldsplit"],
    nome:"Divisão Arnold", desc:"Peito com costas, ombros com braços e pernas, duas vezes na semana. Divisão clássica dos anos 70 que voltou com os vídeos de fisiculturismo.",
    rotinas:{
      pc:{nome:"Arnold — peito e costas", itens:[it("supino-reto",4,6,10,{descanso:150}),it("barra-fixa",4,6,10,{descanso:150}),it("supino-inclinado-halteres",3,8,12,{incremento:2}),it("remada-curvada",3,8,12),it("crucifixo",3,10,15,{incremento:1,superset:"A"}),it("pullover-halter",3,10,15,{incremento:2,superset:"A"})]},
      ob:{nome:"Arnold — ombros e braços", itens:[it("press-militar",4,6,10),it("elevacao-lateral",4,12,20,{incremento:1}),it("crucifixo-inverso",3,12,20,{incremento:1}),it("rosca-barra-w",3,8,12,{superset:"A"}),it("triceps-testa",3,8,12,{superset:"A"}),it("rosca-inclinada",3,10,12,{incremento:1,superset:"B"}),it("triceps-corda-alta",3,10,15,{superset:"B"})]},
      pe:{nome:"Arnold — pernas", itens:[it("agachamento-livre",4,6,10,{incremento:5,descanso:180}),it("stiff",4,8,10,{incremento:5}),it("leg-press",3,10,15,{incremento:10}),it("mesa-flexora",3,10,15),it("panturrilha-pe",5,10,20,{incremento:5}),it("elevacao-pernas",3,10,15,{incremento:0})]}
    }, semana:{1:"pc",2:"ob",3:"pe",4:"pc",5:"ob",6:"pe"}},
  phul:{objetivo:"Força e hipertrofia", nivel:"Intermediário", dias:4, duracao:"60–75 min", redes:true, tags:["phul"],
    nome:"PHUL", desc:"Power Hypertrophy Upper Lower: dois dias pesados de força e dois de hipertrofia, alternando metade de cima e de baixo.",
    rotinas:{
      fs:{nome:"PHUL — força superior", itens:[it("supino-reto",4,3,5,{progressao:"linear",descanso:180}),it("remada-pendlay",4,3,5,{progressao:"linear",descanso:180}),it("press-militar",3,5,8,{descanso:150}),it("barra-fixa",3,6,10),it("rosca-barra-w",2,6,10),it("supino-fechado",2,6,10)]},
      fi:{nome:"PHUL — força inferior", itens:[it("agachamento-livre",4,3,5,{progressao:"linear",incremento:5,descanso:180}),it("terra",3,3,5,{progressao:"linear",incremento:5,descanso:180}),it("leg-press",3,10,15,{incremento:10}),it("mesa-flexora",3,6,10),it("panturrilha-pe",4,6,10,{incremento:5})]},
      hs:{nome:"PHUL — hipertrofia superior", itens:[it("supino-inclinado-halteres",3,8,12,{incremento:2}),it("crucifixo-polia-sentado",3,12,15,{incremento:1}),it("remada-apoiada",3,8,12,{incremento:2}),it("puxada-unilateral",3,10,12),it("elevacao-y-polia",3,12,20,{incremento:1}),it("rosca-bayesiana",3,10,15,{incremento:1,superset:"A"}),it("triceps-katana",3,10,15,{incremento:1,superset:"A"})]},
      hi:{nome:"PHUL — hipertrofia inferior", itens:[it("agachamento-frontal",3,8,12),it("bulgaro",3,8,12,{incremento:2}),it("extensora",3,10,15),it("flexora-sentada",3,10,15),it("panturrilha-sentada",4,10,15,{incremento:5})]}
    }, semana:{1:"fs",2:"fi",4:"hs",5:"hi"}},
  bro:{objetivo:"Hipertrofia", nivel:"Intermediário", dias:5, duracao:"60 min", redes:true, tags:["brosplit"],
    nome:"Um grupo por dia (bro split)", desc:"Cinco dias, cada um dedicado a um grupo. Muito volume por sessão e uma semana inteira de descanso para cada grupo.",
    rotinas:{
      pt:{nome:"Peito", itens:[it("supino-reto",4,6,10),it("supino-inclinado-halteres",4,8,12,{incremento:2}),it("crucifixo-polia-sentado",3,12,15,{incremento:1}),it("peck-deck",3,12,15),it("flexao-deficit",2,10,20,{incremento:0})]},
      ct:{nome:"Costas", itens:[it("barra-fixa",4,6,10),it("remada-pendlay",4,6,10),it("puxada-neutra",3,10,12),it("remada-meadows",3,8,12),it("lat-prayer",3,12,15),it("encolhimento-kelso",3,10,15,{incremento:2})]},
      om:{nome:"Ombros", itens:[it("desenvolvimento-halteres",4,8,12,{incremento:2}),it("elevacao-lateral-polia-tras",4,12,20,{incremento:1}),it("elevacao-lateral-deitado",3,12,20,{incremento:1}),it("crucifixo-inverso-maquina",3,12,20),it("face-pull",3,15,20)]},
      pn:{nome:"Pernas", itens:[it("agachamento-livre",4,6,10,{incremento:5,descanso:180}),it("agachamento-pendular",3,8,12,{incremento:5}),it("stiff",3,8,12,{incremento:5}),it("extensora",3,12,15),it("mesa-flexora",3,10,15),it("panturrilha-pe",4,10,15,{incremento:5})]},
      br:{nome:"Braços", itens:[it("rosca-barra-w",4,8,12,{superset:"A"}),it("jm-press",4,8,12,{superset:"A"}),it("rosca-bayesiana",3,10,15,{incremento:1,superset:"B"}),it("triceps-cruzado",3,12,15,{incremento:1,superset:"B"}),it("rosca-martelo",3,10,12,{incremento:2})]}
    }, semana:{1:"pt",2:"ct",3:"om",4:"pn",5:"br"}},
  alongado:{objetivo:"Hipertrofia", nivel:"Intermediário", dias:4, duracao:"60 min", redes:true, tags:["lengthenedpartials","stretchmediatedhypertrophy"],
    nome:"Ênfase no alongado", desc:"Superior e inferior com exercícios cujo pico de torque cai com o músculo alongado, a tendência mais discutida dos vídeos de ciência do treino. Escolhidos pela curva calculada aqui.",
    rotinas:{
      sA:{nome:"Alongado — superior A", itens:[it("crucifixo-polia-sentado",3,10,15,{incremento:1}),it("supino-inclinado-halteres",3,8,12,{incremento:2}),it("pullover-halter",3,10,15,{incremento:2}),it("elevacao-lateral-deitado",3,12,20,{incremento:1}),it("triceps-katana",3,10,15,{incremento:1})]},
      iA:{nome:"Alongado — inferior A", itens:[it("agachamento-atg",3,8,12,{incremento:2}),it("stiff",3,8,10,{incremento:5}),it("nordico-reverso",3,6,10,{incremento:0}),it("pull-through",3,12,15),it("panturrilha-sentada",4,12,15,{incremento:5})]},
      sB:{nome:"Alongado — superior B", itens:[it("flexao-deficit",3,8,15,{incremento:0}),it("crucifixo",3,10,15,{incremento:1}),it("jm-press",3,8,12),it("triceps-testa",3,8,12),it("rosca-bayesiana",3,10,15,{incremento:1})]},
      iB:{nome:"Alongado — inferior B", itens:[it("agachamento-pendular",3,8,12,{incremento:5}),it("bulgaro",3,8,12,{incremento:2}),it("terra-romeno-halteres",3,8,12,{incremento:2}),it("agachamento-espanhol",3,12,20,{incremento:0}),it("dragon-flag",3,5,10,{incremento:0})]}
    }, semana:{1:"sA",2:"iA",4:"sB",5:"iB"}},
  kot:{objetivo:"Joelhos e mobilidade", nivel:"Iniciante", dias:3, duracao:"40 min", redes:true, tags:["kneesovertoes","atgsplitsquat"],
    nome:"Joelhos à frente (estilo ATG)", desc:"Inspirado no método Knees Over Toes: tibial, quadríceps alongado e posterior com o peso do corpo, três vezes na semana.",
    rotinas:{
      k1:{nome:"Joelhos — sessão A", itens:[it("tibial-tib-bar",2,15,25,{incremento:1}),it("step-up-patrick",2,15,25,{incremento:0}),it("agachamento-atg",3,6,10,{incremento:2}),it("nordico-reverso",3,6,10,{incremento:0}),it("nordico",3,3,6,{incremento:0}),it("panturrilha-unilateral",2,15,20,{incremento:0})]},
      k2:{nome:"Joelhos — sessão B", itens:[it("tibial-tib-bar",2,15,25,{incremento:1}),it("agachamento-espanhol",3,12,20,{incremento:0}),it("sissy-squat",3,8,12,{incremento:0}),it("pull-through",3,10,15),it("frog-pump",2,20,40,{incremento:0}),it("prancha",2,30,60,{incremento:0})]}
    }, semana:{1:"k1",3:"k2",5:"k1"}}
});

/* =====================================================================
   LEITOR DE POSTS — transforma a legenda de um treino em rotinas.
   Entende português, espanhol e inglês: "4x8-10", "3 séries de 12",
   "3 sets of 10", "3x45s", "12-10-8", "A1/A2" (superset), "descanso 90s",
   cabeçalhos de dia ("Dia 1 – Peito", "Day 2: Pull", "Lunes").
   ===================================================================== */
const ALIAS_ES = {
  "press banca":"supino-reto","press de banca":"supino-reto","press banca con barra":"supino-reto","press inclinado":"supino-inclinado","press inclinado con barra":"supino-inclinado",
  "press inclinado con mancuernas":"supino-inclinado-halteres","press con mancuernas":"supino-halteres","press plano con mancuernas":"supino-halteres","press declinado":"supino-declinado",
  "aperturas":"crucifixo","aperturas con mancuernas":"crucifixo","cruces en polea":"crossover","cruce de poleas":"crossover","pec deck":"peck-deck","contractora":"peck-deck","flexiones":"flexao-braco",
  "dominadas":"barra-fixa","dominada":"barra-fixa","dominadas supinas":"chin-up","jalon al pecho":"puxada-frontal","jalon":"puxada-frontal","jalon agarre neutro":"puxada-neutra","remo con barra":"remada-curvada",
  "remo con mancuerna":"remada-unilateral","remo en polea":"remada-sentada","remo sentado":"remada-sentada","remo gironda":"remada-sentada","remo en maquina":"remada-maquina","remo t":"remada-cavalinho","remo en t":"remada-cavalinho",
  "pullover":"pullover-halter","face pull":"face-pull","encogimientos":"encolhimento-barra","encogimientos con mancuernas":"encolhimento",
  "press militar":"press-militar","press de hombro":"desenvolvimento-halteres","press con mancuernas sentado":"desenvolvimento-halteres","press arnold":"arnold","elevaciones laterales":"elevacao-lateral",
  "elevaciones laterales en polea":"elevacao-lateral-polia","elevaciones frontales":"elevacao-frontal","pajaros":"crucifixo-inverso","pajaro":"crucifixo-inverso","remo al menton":"remada-alta",
  "curl de biceps":"rosca-direta","curl con mancuernas":"rosca-direta","curl con barra":"rosca-barra-w","curl con barra z":"rosca-barra-w","curl martillo":"rosca-martelo","curl predicador":"rosca-scott",
  "curl scott":"rosca-scott","curl inclinado":"rosca-inclinada","curl concentrado":"rosca-concentrada","curl en polea":"rosca-polia-baixa","curl bayesiano":"rosca-bayesiana",
  "extension de triceps en polea":"triceps-polia","jalon de triceps":"triceps-polia","extension de triceps con cuerda":"triceps-polia","press frances":"triceps-testa","rompecraneos":"triceps-testa",
  "extension de triceps tras nuca":"triceps-corda-alta","extension de triceps por encima de la cabeza":"triceps-corda-alta","patada de triceps":"triceps-coice","fondos":"paralelas","fondos en banco":"mergulho-banco","press cerrado":"supino-fechado",
  "sentadilla":"agachamento-livre","sentadilla libre":"agachamento-livre","sentadilla con barra":"agachamento-livre","sentadilla frontal":"agachamento-frontal","sentadilla hack":"hack","sentadilla bulgara":"bulgaro",
  "sentadilla goblet":"goblet","sentadilla en smith":"agachamento-smith","sentadilla sissy":"sissy-squat","prensa":"leg-press","prensa de piernas":"leg-press","prensa 45":"leg-press","prensa horizontal":"leg-press-horizontal",
  "extension de cuadriceps":"extensora","extension de piernas":"extensora","extensiones de cuadriceps":"extensora","zancadas":"afundo","zancada":"afundo","estocadas":"afundo","subidas al banco":"step-up",
  "peso muerto":"terra","peso muerto rumano":"stiff","peso muerto con mancuernas":"terra-romeno-halteres","peso muerto sumo":"terra-sumo","buenos dias":"bom-dia","hip thrust":"hip-thrust","puente de gluteo":"hip-thrust",
  "curl femoral":"mesa-flexora","curl femoral tumbado":"mesa-flexora","curl femoral acostado":"mesa-flexora","curl femoral sentado":"flexora-sentada","curl nordico":"nordico","nordicos":"nordico",
  "abduccion de cadera":"abducao-maquina","abductores":"abducao-maquina","patada de gluteo":"coice-polia","hiperextensiones":"extensao-lombar-45","extension lumbar":"extensao-lombar-45",
  "gemelos":"panturrilha-pe","gemelos de pie":"panturrilha-pe","elevacion de talones":"panturrilha-pe","gemelos sentado":"panturrilha-sentada","pantorrillas":"panturrilha-pe",
  "plancha":"prancha","crunch":"abdominal-solo","abdominales":"abdominal-solo","crunch en polea":"abdominal-polia","elevacion de piernas":"elevacao-pernas","elevaciones de piernas colgado":"elevacao-pernas","lenadores":"lenhador",
  "curl de muneca":"rosca-punho"
};
const ALIAS_PT = {
  "supino":"supino-reto","supino reto":"supino-reto","supino com barra":"supino-reto","supino reto com halteres":"supino-halteres","supino com halteres":"supino-halteres","supino inclinado":"supino-inclinado",
  "supino inclinado com barra":"supino-inclinado","supino declinado":"supino-declinado","supino fechado":"supino-fechado","supino maquina":"supino-maquina","voador":"peck-deck","fly":"peck-deck","peck deck":"peck-deck",
  "crucifixo reto":"crucifixo","crossover":"crossover","cross over":"crossover","flexao":"flexao-braco","flexoes":"flexao-braco","flexao de braco":"flexao-braco",
  "barra fixa":"barra-fixa","barra":"barra-fixa","barra pronada":"barra-fixa","barra supinada":"chin-up","puxada":"puxada-frontal","puxada alta":"puxada-frontal","puxada aberta":"puxada-frontal","pulley":"puxada-frontal",
  "puxada triangulo":"puxada-neutra","puxada neutra":"puxada-neutra","puxada fechada":"puxada-neutra","remada baixa":"remada-sentada","remada sentada":"remada-sentada","remada curvada":"remada-curvada",
  "remada unilateral":"remada-unilateral","serrote":"remada-unilateral","remada serrote":"remada-unilateral","remada cavalinho":"remada-cavalinho","remada maquina":"remada-maquina","pulldown":"pullover",
  "encolhimento":"encolhimento-barra","encolhimento com halteres":"encolhimento",
  "desenvolvimento":"desenvolvimento-halteres","desenvolvimento com halteres":"desenvolvimento-halteres","desenvolvimento militar":"press-militar","desenvolvimento com barra":"press-militar",
  "desenvolvimento maquina":"desenvolvimento-maquina","elevacao lateral":"elevacao-lateral","elevacao lateral na polia":"elevacao-lateral-polia","elevacao frontal":"elevacao-frontal","crucifixo inverso":"crucifixo-inverso",
  "voador inverso":"crucifixo-inverso-maquina","peck deck invertido":"crucifixo-inverso-maquina","remada alta":"remada-alta",
  "rosca":"rosca-direta","rosca direta":"rosca-direta","rosca alternada":"rosca-direta","rosca com barra":"rosca-barra-w","rosca w":"rosca-barra-w","rosca martelo":"rosca-martelo","rosca scott":"rosca-scott",
  "rosca concentrada":"rosca-concentrada","rosca inclinada":"rosca-inclinada","rosca bayesiana":"rosca-bayesiana","rosca na polia":"rosca-polia-baixa","rosca inversa":"rosca-inversa",
  "triceps corda":"triceps-polia","triceps pulley":"triceps-polia","triceps polia":"triceps-polia","triceps barra":"triceps-polia","triceps testa":"triceps-testa","triceps frances":"triceps-frances",
  "triceps coice":"triceps-coice","triceps banco":"mergulho-banco","mergulho":"paralelas","paralelas":"paralelas","triceps acima da cabeca":"triceps-corda-alta",
  "agachamento":"agachamento-livre","agachamento livre":"agachamento-livre","agacho":"agachamento-livre","agachamento frontal":"agachamento-frontal","agachamento smith":"agachamento-smith","hack":"hack",
  "agachamento hack":"hack","agachamento bulgaro":"bulgaro","bulgaro":"bulgaro","agachamento sumo":"goblet","goblet":"goblet","leg press":"leg-press","leg 45":"leg-press","leg press 45":"leg-press",
  "leg horizontal":"leg-press-horizontal","extensora":"extensora","cadeira extensora":"extensora","afundo":"afundo","passada":"afundo","avanco":"afundo","subida no banco":"step-up",
  "terra":"terra","levantamento terra":"terra","stiff":"stiff","rdl":"stiff","terra romeno":"stiff","sumo":"terra-sumo","terra sumo":"terra-sumo","bom dia":"bom-dia","elevacao pelvica":"hip-thrust","hip thrust":"hip-thrust",
  "flexora":"mesa-flexora","mesa flexora":"mesa-flexora","flexora deitada":"mesa-flexora","cadeira flexora":"flexora-sentada","flexora sentada":"flexora-sentada","nordico":"nordico",
  "abdutora":"abducao-maquina","cadeira abdutora":"abducao-maquina","coice":"coice-polia","coice na polia":"coice-polia","gluteo maquina":"coice-maquina","extensao lombar":"extensao-lombar-45","hiperextensao":"extensao-lombar-45",
  "panturrilha":"panturrilha-pe","panturrilha em pe":"panturrilha-pe","gemeos":"panturrilha-pe","panturrilha sentado":"panturrilha-sentada","panturrilha sentada":"panturrilha-sentada","panturrilha no leg":"panturrilha-leg-press",
  "prancha":"prancha","abdominal":"abdominal-solo","abdominal supra":"abdominal-solo","abdominal crunch":"abdominal-solo","abdominal na polia":"abdominal-polia","abdominal infra":"elevacao-pernas","elevacao de pernas":"elevacao-pernas"
};
/* frases de várias palavras viram um termo só antes de comparar */
const FRASES = [
  [/\bpeso muerto\b/g,"terra"],[/\bdead ?lifts?\b/g,"terra"],[/\bleg press\b/g,"legpress"],[/\bpress (de )?banca\b/g,"supino"],[/\bbench press\b/g,"supino"],[/\bbench\b/g,"supino"],
  [/\bpull ?ups?\b|\bdominadas?\b|\bchin ?ups?\b/g,"barrafixa"],[/\bbarra fixa\b/g,"barrafixa"],[/\blat pull ?downs?\b|\bpull ?downs?\b|\bjalon\b/g,"puxada"],[/\bhip thrusts?\b|\belevacao pelvica\b/g,"pelvica"],
  [/\bface pulls?\b/g,"facepull"],[/\bgood mornings?\b|\bbom dia\b|\bbuenos dias\b/g,"bomdia"],[/\bjm press\b/g,"jmpress"],[/\bskull ?crushers?\b|\brompecraneos\b/g,"testa"],
  [/\bleg extensions?\b|\bextension de (cuadriceps|piernas)\b/g,"extensora"],[/\bleg curls?\b|\bcurl femoral\b|\bhamstring curls?\b/g,"flexora"],[/\bcalf raises?\b/g,"panturrilha"],
  [/\boverhead press\b|\bshoulder press\b|\bpress militar\b|\bmilitary press\b/g,"desenvolvimento"],[/\bsplit squats?\b/g,"divisao agachamento"],[/\bromanian\b|\brumano\b|\brdl\b/g,"stiff"],
  [/\bpec ?deck\b|\bvoador\b/g,"peckdeck"],[/\bpush ?ups?\b|\bflexiones\b/g,"flexao"],[/\bpull ?through\b/g,"pullthrough"],[/\bdragon flag\b/g,"dragonflag"],[/\bfrog pumps?\b/g,"frogpump"],
  [/\blat prayers?\b/g,"latprayer"],[/\breverse nordic\b|\bnordico reverso\b/g,"nordicoreverso"],[/\bkelso\b/g,"kelso"],[/\btib(ialis)? (bar )?raises?\b|\btib bar\b/g,"tibial"],[/\bpendlay\b/g,"pendlay"],[/\bmeadows\b/g,"meadows"],
  [/\bsissy\b/g,"sissy"],[/\bhack squat\b/g,"hack"],[/\bpendulum\b|\bpendular\b/g,"pendular"],[/\bt bar\b/g,"cavalinho"]
];
const SINONIMOS = {
  halter:"halteres",halteres:"halteres",dumbbell:"halteres",dumbbells:"halteres",db:"halteres",mancuerna:"halteres",mancuernas:"halteres",
  barbell:"barra",bb:"barra",ez:"barra",polia:"polia",cabo:"polia",cable:"polia",cables:"polia",polea:"polia",poleas:"polia",pulley:"polia",
  maquina:"maquina",machine:"maquina",aparelho:"maquina",smith:"smith",corda:"corda",rope:"corda",cuerda:"corda",
  inclinado:"inclinado",inclinada:"inclinado",incline:"inclinado",inclined:"inclinado",declinado:"declinado",decline:"declinado",
  unilateral:"unilateral",single:"unilateral",one:"unilateral",sentado:"sentado",sentada:"sentado",seated:"sentado",
  supino:"supino",press:"supino",agachamento:"agachamento",squat:"agachamento",squats:"agachamento",sentadilla:"agachamento",agacho:"agachamento",
  remada:"remada",row:"remada",rows:"remada",remo:"remada",rosca:"rosca",curl:"rosca",curls:"rosca",triceps:"triceps",tricep:"triceps",
  elevacao:"elevacao",raise:"elevacao",raises:"elevacao",elevaciones:"elevacao",elevacion:"elevacao",lateral:"lateral",laterales:"lateral",laterals:"lateral",
  crucifixo:"crucifixo",fly:"crucifixo",flye:"crucifixo",flyes:"crucifixo",flies:"crucifixo",aperturas:"crucifixo",apertura:"crucifixo",
  panturrilha:"panturrilha",calf:"panturrilha",calves:"panturrilha",gemelos:"panturrilha",abdominal:"abdominal",crunch:"abdominal",abs:"abdominal",
  prancha:"prancha",plank:"prancha",plancha:"prancha",afundo:"afundo",lunge:"afundo",lunges:"afundo",zancada:"afundo",zancadas:"afundo",passada:"afundo",
  bulgaro:"bulgaro",bulgarian:"bulgaro",bulgara:"bulgaro",encolhimento:"encolhimento",shrug:"encolhimento",shrugs:"encolhimento",encogimientos:"encolhimento",
  frontal:"frontal",front:"frontal",martelo:"martelo",hammer:"martelo",martillo:"martelo",testa:"testa",frances:"frances",francesa:"frances",
  scott:"scott",preacher:"scott",predicador:"scott",concentrada:"concentrada",concentration:"concentrada",concentrado:"concentrada",
  bayesiana:"bayesiana",bayesian:"bayesiana",bayesiano:"bayesiana",pullover:"pullover",dips:"paralelas",dip:"paralelas",fondos:"paralelas",mergulho:"paralelas",
  reverse:"inverso",inverso:"inverso",invertido:"inverso",inversa:"inverso",rear:"inverso",overhead:"cabeca",cabeca:"cabeca",kickback:"coice",kickbacks:"coice",coice:"coice",patada:"coice",
  neutra:"neutra",neutral:"neutra",neutro:"neutra",triangulo:"neutra",fechada:"fechada",close:"fechada",cerrado:"fechada",aberta:"aberta",wide:"aberta",
  wrist:"punho",punho:"punho",muneca:"punho",extensao:"extensao",extension:"extensao",extensiones:"extensao",
  deficit:"deficit",spanish:"espanhol",espanol:"espanhol",espanola:"espanhol",espanhol:"espanhol",atg:"atg",patrick:"patrick",peterson:"patrick",petersen:"patrick",
  goblet:"goblet",sumo:"sumo",cadeira:"cadeira",mesa:"mesa",deitado:"deitado",lying:"deitado",acostado:"deitado",tumbado:"deitado",prone:"deitado",
  y:"y",katana:"katana",cruzado:"cruzado",cross:"cruzado",body:"",apoiada:"apoiada",supported:"apoiada",chest:"",apoyado:"apoiada",seal:"apoiada"
};
const STOP = new Set("de do da dos das com na no nas nos em e a o os as the with on in con en el la los las del al para pra por y and of to tipo exercicio exercise ejercicio maquina".split(" ").filter(w=>w!=="maquina"));
const semAcento = s => (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/ñ/g,"n");
function tokens(s){
  let t = " "+semAcento(s).replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ")+" ";
  FRASES.forEach(([re,v])=>{ t = t.replace(re, " "+v+" "); });
  return t.trim().split(/\s+/).filter(w=>w && !STOP.has(w)).map(w=>SINONIMOS[w]!==undefined ? SINONIMOS[w] : w).filter(Boolean);
}
let INDICE = null;
function indice(){
  if(INDICE && INDICE.n===lib().length) return INDICE.l;
  const extra = {};
  const soma = (m) => Object.entries(m).forEach(([k,id])=>{ (extra[id]=extra[id]||[]).push(k); });
  soma(ALIAS_EN); soma(ALIAS_ES); soma(ALIAS_PT);
  const l = lib().map(ex=>({ex, toks:new Set(tokens(ex.nome+" "+ex.id.replace(/-/g," "))), frases:[ex.nome].concat(ex.alias||[], extra[ex.id]||[]).map(semAcento).map(s=>s.replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim())}));
  INDICE = {n:lib().length, l}; return l;
}
/* devolve candidatos {ex, score} do mais provável ao menos provável */
function casarExercicio(nome){
  const q = semAcento(nome).replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  if(!q) return [];
  const qt = tokens(nome); const qs = new Set(qt);
  const out = [];
  for(const it of indice()){
    let s = 0;
    for(const f of it.frases){
      if(f===q){ s = Math.max(s, 1); break; }
      if(f.length>=4 && (" "+q+" ").includes(" "+f+" ")) s = Math.max(s, 0.72 + 0.25*f.length/Math.max(q.length,1));
    }
    if(qs.size){
      let inter = 0; qs.forEach(t=>{ if(it.toks.has(t)) inter++; });
      const dice = 2*inter/(qs.size+it.toks.size);
      const cabeca = qt[0] && it.toks.has(qt[0]) ? 0.12 : 0;
      s = Math.max(s, dice + cabeca);
    }
    if(s>0) out.push({ex:it.ex, score:Math.min(1,s)});
  }
  return out.sort((a,b)=>b.score-a.score || a.ex.nome.length-b.ex.nome.length);
}

const RE_DIA = /^(dia|day|dias?|d[ií]a|treino|workout|entrenamiento|rutina|sess[aã]o|session|semana|week|parte)\b|^(segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo|lunes|martes|mi[eé]rcoles|jueves|viernes|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|^(push|pull|legs?|pernas?|upper|lower|superior|inferior|full ?body|corpo inteiro|peito|costas|ombros?|bra[cç]os|gl[uú]teos?|posterior|quadr[ií]ceps|pierna|piernas|espalda|pecho|hombros?|brazos)\b/i;
const RE_EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu;
function lerSeriesReps(t){
  /* devolve {series, repsMin, repsMax, tempo, falha, resto} ou null */
  let m, r = null;
  const un = u => u && /^(s|seg|segs|segundos|sec|secs|seconds|"|''|min|mins|minutos|minutes|')$/.test(u) ? (/^(min|mins|minutos|minutes|')$/.test(u) ? 60 : 1) : 0;
  if((m = t.match(/(\d{1,2})\s*[x×*]\s*((?:\d{1,3}\s*[,\/]\s*){2,}\d{1,3})/i))){
    const v = m[2].split(/[,\/]/).map(Number); r = {series:+m[1], repsMin:Math.min(...v), repsMax:Math.max(...v)};
  } else if((m = t.match(/(\d{1,2})\s*[x×*]\s*(?:(\d{1,3})(?:\s*(?:-|–|—|a|to|\/|ou|or|ate|até)\s*(\d{1,3}))?\s*(segundos|segs|seg|sec|secs|seconds|s|"|min|mins|minutos|minutes|')?|(falha|failure|fallo|amrap|max|m[aá]ximo))/i))){
    if(m[5]) r = {series:+m[1], repsMin:8, repsMax:15, falha:true};
    else { const f = un(m[4]); r = {series:+m[1], repsMin:+m[2]*(f||1), repsMax:+(m[3]||m[2])*(f||1), tempo:!!f}; }
  } else if((m = t.match(/(\d{1,2})\s*(?:s[eé]ries|series|serie|sets?|rounds?|vueltas)\s*(?:de|of|x|con|com|:)?\s*(?:(\d{1,3})(?:\s*(?:-|–|a|to|\/|ou|or)\s*(\d{1,3}))?\s*(segundos|segs|seg|sec|secs|seconds|s|"|min|minutos|minutes|')?|(falha|failure|fallo|amrap|max))/i))){
    if(m[5]) r = {series:+m[1], repsMin:8, repsMax:15, falha:true};
    else if(m[2]){ const f = un(m[4]); r = {series:+m[1], repsMin:+m[2]*(f||1), repsMax:+(m[3]||m[2])*(f||1), tempo:!!f}; }
  } else if((m = t.match(/(?:^|\s)((?:\d{1,2}\s*[-–\/]\s*){2,}\d{1,2})(?:\s*(?:reps?|repeti\w*))?(?:\s|$)/i))){
    const v = m[1].split(/[-–\/]/).map(Number); r = {series:v.length, repsMin:Math.min(...v), repsMax:Math.max(...v)};
  }
  if(!r) return null;
  r.trecho = m[0];
  if(r.repsMin>r.repsMax) [r.repsMin,r.repsMax] = [r.repsMax,r.repsMin];
  if(!(r.series>=1 && r.series<=12 && r.repsMax>=1 && r.repsMax<=600)) return null;
  return r;
}
function lerDescanso(t){
  const m = t.match(/(?:descanso|descansar|rest|pausa|intervalo|recupera[cç][aã]o)\s*(?:de|of)?\s*:?\s*(\d{1,3})\s*(?:(?::|'|’)\s*(\d{2})|\s*(segundos|seg|s|sec|secs|seconds|min|mins|minutos|minutes|m)\b)?/i);
  if(!m) return null;
  let s = +m[1];
  if(m[2]) s = s*60 + +m[2];
  else if(m[3] && /^m/i.test(m[3])) s = s*60;
  else if(!m[3] && s<=5) s = s*60;
  return {seg:s, trecho:m[0]};
}
function limparNome(t, tirar){
  let s = t;
  tirar.forEach(x=>{ if(x) s = s.replace(x," "); });
  s = s.replace(/\((?:[^)]*)\)/g," ").replace(/\b(reps?|repeti[cç][oõ]es|repeticiones|repetitions)\b/gi," ")
       .replace(/\b(s[eé]ries|series|sets)\b/gi," ").replace(/\bcada\b|\beach\b|\bpor lado\b|\bper side\b|\bpor perna\b|\bcada lado\b/gi," ")
       .replace(/[:|–—=>\-]+\s*$/,"").replace(/^\s*[:|–—=>\-]+/,"").replace(/\s{2,}/g," ").trim();
  return s.replace(/[.,;:!]+$/,"").trim();
}
function lerPost(texto){
  const tags = [...new Set(((texto||"").match(/#[\p{L}\p{N}_]+/gu)||[]).map(t=>t.slice(1).toLowerCase()))];
  const linhas = (texto||"").replace(/\r/g,"").split(/\n|•|·|•|;|\s\|\s/).map(l=>l.replace(RE_EMOJI," ").replace(/#[\p{L}\p{N}_]+/gu," ").replace(/[*_~`]+/g," ").replace(/\s+/g," ").trim()).filter(Boolean);
  const rotinas = []; let atual = null, titulo = null, descGlobal = null; const ignoradas = [];
  const nova = nome => { atual = {nome, itens:[]}; rotinas.push(atual); return atual; };
  for(let i=0;i<linhas.length;i++){
    let l = linhas[i];
    let sup = null, mm;
    if((mm = l.match(/^\s*([A-Ha-h])\s*([1-9])\s*[\.\):\-–]?\s+/))){ sup = mm[1].toUpperCase(); l = l.slice(mm[0].length); }
    else l = l.replace(/^\s*(?:\d{1,2}\s*[\.\)º°\-–:]|[\-–—*>+✓✔]+|\(\d{1,2}\))\s*/,"");
    const sr = lerSeriesReps(l);
    const ds = lerDescanso(l);
    if(!sr){
      /* linha só com descanso vale para o dia atual inteiro (ou para o post, se vier antes de tudo) */
      if(ds && limparNome(l,[ds.trecho]).length<3){ if(atual){ atual.desc = ds.seg; atual.itens.forEach(x=>{ if(x.descanso==null) x.descanso = ds.seg; }); } else descGlobal = ds.seg; continue; }
      const curto = l.length <= 48;
      const cand = casarExercicio(l)[0];
      if(curto && RE_DIA.test(semAcento(l).replace(/^[^a-z]+/,"")) && !(cand && cand.score>=0.9)){ nova(l.replace(/[:\-–—]+\s*$/,"").trim()); continue; }
      if(curto && /[:]\s*$/.test(l)){ nova(l.replace(/[:]+\s*$/,"").trim()); continue; }
      if(cand && cand.score>=0.75 && curto){
        /* exercício sem séries escritas: entra com o padrão 3 × 8–12 */
        if(!atual) nova(titulo||"Treino do post");
        atual.itens.push(itemDoPost(l, l, {series:3, repsMin:8, repsMax:12, semNumeros:true}, sup, atual.desc||null)); continue;
      }
      if(!titulo && !rotinas.length && l.replace(/\(.*?\)/g,"").trim().length<=48) { titulo = l.replace(/\(.*?\)/g,"").replace(/[!.]+$/,"").trim(); continue; }
      ignoradas.push(linhas[i]); continue;
    }
    const nome = limparNome(l, [sr.trecho, ds && ds.trecho]);
    if(!nome || nome.length<2){ ignoradas.push(linhas[i]); continue; }
    if(!atual) nova(titulo||"Treino do post");
    atual.itens.push(itemDoPost(linhas[i], nome, sr, sup, ds ? ds.seg : (atual.desc||null)));
  }
  /* cabeçalho seguido de outro cabeçalho é o título do post, não um dia */
  while(rotinas.length>1 && !rotinas[0].itens.length){ const r0 = rotinas.shift(); if(!titulo) titulo = r0.nome; }
  const comItens = rotinas.filter(r=>r.itens.length);
  rotinas.forEach(r=>{
    if(titulo && comItens.length>1 && r.nome!==titulo) r.nome = titulo+" — "+r.nome;
    /* supersets só valem quando a mesma letra aparece em dois ou mais itens */
    const c = {}; r.itens.forEach(x=>{ if(x.superset) c[x.superset]=(c[x.superset]||0)+1; });
    r.itens.forEach(x=>{ if(x.superset && c[x.superset]<2) x.superset = ""; if(x.descanso==null && descGlobal) x.descanso = descGlobal; });
  });
  rotinas.forEach(r=>delete r.desc);
  return {titulo, rotinas:rotinas.filter(r=>r.itens.length), ignoradas, tags};
}
function itemDoPost(linha, nome, sr, sup, desc){
  const cands = casarExercicio(nome).slice(0,6);
  const top = cands[0];
  return {linha, nome, exId: top && top.score>=0.45 ? top.ex.id : "", confianca: top ? top.score : 0,
    alternativas: cands.map(c=>c.ex.id), series:sr.series, repsMin:sr.repsMin, repsMax:sr.repsMax, tempo:!!sr.tempo, falha:!!sr.falha,
    semNumeros:!!sr.semNumeros, superset: sup||"", descanso: desc};
}
const POST_EXEMPLO = `TREINO SUPERIOR / INFERIOR 🔥 (salva pra não perder!)

Dia 1 – Superior
A1) Supino inclinado com halteres 4x8-10
A2) Remada apoiada no banco 4x8-10
B1) Elevação lateral na polia 3x12-15
B2) Rosca bayesiana 3x10-12
Tríceps corda 3 séries de 12
Descanso 90s

Dia 2 – Inferior
Agachamento livre 4x6-8 (descanso 2min)
Stiff 3x8-10
Cadeira extensora 3x12/15
Mesa flexora 12-10-8
Panturrilha em pé 4x15
Prancha 3x45s

#treino #musculacao #upperlower`;
