/* =====================================================================
   BASE ANATÔMICA E DE CADEIAS MUSCULARES
   Dados resumidos (com palavras nossas) de três obras de referência:
   - CAMPOS, M. A. Biomecânica da Musculação. Rio de Janeiro: Sprint, 2000.
   - Como funcionam as cadeias musculares (e-book, Pilates QC).
   - Músculo: origem e inserção (quadros de anatomia por região).
   Os músculos anatômicos (ANAT) se agrupam nos "músculos do app" (MUSCULOS),
   que são o que a biblioteca usa para classificar os exercícios.
   ===================================================================== */

const FONTES_CINESIO = {
  campos:{curta:"Campos (2000)", ref:"CAMPOS, M. A. Biomecânica da Musculação. Rio de Janeiro: Sprint, 2000.", uso:"cinemática e cinética, braço de momento, insuficiência ativa e passiva e a análise biomecânica de cada exercício"},
  cadeias:{curta:"Cadeias musculares (Pilates QC)", ref:"Como funcionam as cadeias musculares. E-book, Pilates QC.", uso:"trilhos miofasciais de Myers, cadeias de Souchard e do método GDS, fatores de compensação"},
  anatomia:{curta:"Músculo: origem e inserção", ref:"Músculo: origem e inserção. Quadros de anatomia por região do corpo.", uso:"origem, inserção, inervação, ação e plano de cada músculo"}
};

/* ---------- músculos anatômicos ---------- */
const M_ = (nome, origem, insercao, inervacao, acao, planos) => ({nome, origem, insercao, inervacao, acao, planos});
const ANAT = {
  /* tórax e ombro */
  "peitoral-maior":M_("Peitoral maior","borda anterior da clavícula, face anterior do esterno e cartilagens até a 7ª costela","crista do tubérculo maior do úmero","nervos peitorais lateral e medial","adução, rotação medial e flexão do ombro; adução horizontal","transverso e frontal"),
  "peitoral-menor":M_("Peitoral menor","face externa da 3ª à 5ª costela","processo coracoide","nervo peitoral medial","depressão do ombro, rotação inferior da escápula e elevação das costelas","transverso e frontal"),
  "serratil-anterior":M_("Serrátil anterior","face externa das 8–9 primeiras costelas","borda medial da escápula (face costal)","nervo torácico longo","abdução (protração), rotação superior e depressão da escápula; auxilia a inspiração","transverso e frontal"),
  "subescapular":M_("Subescapular","fossa subescapular","tubérculo menor do úmero (manguito rotador)","nervo subescapular","rotação medial e adução do ombro","transverso"),
  "supraespinhal":M_("Supraespinhal","fossa supraespinhal da escápula","tubérculo maior do úmero (manguito rotador)","nervo supraescapular","abdução do ombro, principalmente no início","frontal"),
  "infraespinhal":M_("Infraespinhal","face posterior da escápula","tubérculo maior do úmero (manguito rotador)","nervo supraescapular","rotação lateral e adução do ombro","transverso"),
  "redondo-menor":M_("Redondo menor","borda lateral da escápula","tubérculo maior do úmero (manguito rotador)","nervo axilar","rotação lateral e adução do ombro","transverso"),
  "redondo-maior":M_("Redondo maior","ângulo inferior da escápula (face posterior)","lábio medial do sulco intertubercular do úmero","nervo subescapular","rotação medial, adução e extensão do ombro","sagital, frontal e transverso"),
  "deltoide-ant":M_("Deltoide — porção anterior (clavicular)","terço lateral da clavícula","tuberosidade deltoidea do úmero","nervo axilar","flexão, adução horizontal e rotação medial do ombro","sagital e transverso"),
  "deltoide-med":M_("Deltoide — porção média (acromial)","acrômio","tuberosidade deltoidea do úmero","nervo axilar","abdução do ombro","frontal"),
  "deltoide-post":M_("Deltoide — porção posterior (espinal)","espinha da escápula","tuberosidade deltoidea do úmero","nervo axilar","extensão, abdução horizontal e rotação lateral do ombro","sagital e transverso"),
  "coracobraquial":M_("Coracobraquial","processo coracoide","terço médio do úmero","nervo musculocutâneo","flexão e adução do ombro","transverso"),
  /* braço e antebraço */
  "biceps-braquial":M_("Bíceps braquial","tubérculo supraglenoidal (cabeça longa) e processo coracoide (cabeça curta)","tuberosidade do rádio","nervo musculocutâneo","flexão do cotovelo e supinação do antebraço; a cabeça longa ajuda a flexionar o ombro","sagital, transverso e frontal"),
  "braquial":M_("Braquial","metade distal da face anterior do úmero","processo coronoide da ulna","nervo musculocutâneo","flexão do cotovelo em qualquer posição do antebraço","sagital"),
  "braquiorradial":M_("Braquiorradial","crista supraepicondilar lateral do úmero","processo estiloide do rádio","nervo radial","flexão do cotovelo, mais forte com o antebraço em posição neutra","sagital e transverso"),
  "triceps-braquial":M_("Tríceps braquial","tubérculo infraglenoidal (cabeça longa) e face posterior do úmero (cabeças lateral e medial)","olécrano da ulna","nervo radial","extensão do cotovelo; a cabeça longa também estende e aduz o ombro","sagital, frontal e transverso"),
  "pronador-redondo":M_("Pronador redondo","epicôndilo medial do úmero e processo coronoide da ulna","metade da face lateral do rádio","nervo mediano","pronação e flexão do antebraço","transverso e sagital"),
  "flexor-radial-carpo":M_("Flexor radial do carpo","epicôndilo medial do úmero","base do 2º metacarpal","nervo mediano","flexão e desvio radial do punho","sagital, frontal e transverso"),
  "flexor-ulnar-carpo":M_("Flexor ulnar do carpo","epicôndilo medial e olécrano","pisiforme, hamato e base do 5º metacarpal","nervo ulnar","flexão e desvio ulnar do punho","sagital e frontal"),
  "palmar-longo":M_("Palmar longo","epicôndilo medial do úmero","aponeurose palmar","nervo mediano","flexão do punho","sagital"),
  "flexor-superficial-dedos":M_("Flexor superficial dos dedos","epicôndilo medial e processo coronoide da ulna","falanges médias do 2º ao 5º dedo","nervo mediano","flexão dos dedos e do punho","sagital"),
  "extensor-radial-longo":M_("Extensor radial longo do carpo","crista supraepicondilar lateral do úmero","base do 2º metacarpal","nervo radial","extensão e desvio radial do punho","sagital e frontal"),
  "extensor-radial-curto":M_("Extensor radial curto do carpo","epicôndilo lateral do úmero","base do 3º metacarpal","nervo radial","extensão do punho","sagital e frontal"),
  "extensor-ulnar-carpo":M_("Extensor ulnar do carpo","epicôndilo lateral do úmero","base do 5º metacarpal","nervo radial","extensão e desvio ulnar do punho","sagital e frontal"),
  "extensor-dedos":M_("Extensor dos dedos","epicôndilo lateral do úmero","falanges média e distal do 2º ao 5º dedo","nervo radial","extensão dos dedos e do punho","sagital"),
  /* dorso */
  "trapezio":M_("Trapézio","linha nucal superior, ligamento nucal e processos espinhosos de C7 a T12","terço lateral da clavícula, acrômio e espinha da escápula","nervo acessório","fibras superiores elevam, médias aduzem e inferiores deprimem a escápula; superiores e inferiores juntas fazem a rotação superior","frontal, sagital e transverso"),
  "latissimo":M_("Latíssimo do dorso (grande dorsal)","processos espinhosos torácicos baixos e lombares, fáscia toracolombar e crista ilíaca","sulco intertubercular do úmero","nervo toracodorsal","extensão, adução e rotação medial do ombro; depressão da cintura escapular","sagital, frontal e transverso"),
  "romboides":M_("Romboides","processos espinhosos de C7 a T5","borda medial da escápula","nervo dorsal da escápula","adução (retração), rotação inferior e elevação da escápula","transverso e frontal"),
  "levantador-escapula":M_("Levantador da escápula","processos transversos do atlas até C4","ângulo superior da escápula","nervo dorsal da escápula","elevação e adução da escápula","frontal"),
  "eretor-espinha":M_("Eretor da espinha (iliocostal, longuíssimo e espinhal)","sacro, crista ilíaca e processos espinhosos e transversos ao longo da coluna","costelas, processos vertebrais acima e base do crânio","ramos dorsais dos nervos espinhais","extensão da coluna; de um lado só, flexão lateral; as fibras que chegam à pelve fazem anteversão","sagital, frontal e transverso"),
  "multifido-rotadores":M_("Multífido e rotadores","processos transversos das vértebras","lâminas e processos espinhosos das vértebras acima","ramos dorsais dos nervos espinhais","estabilização segmentar, rotação e flexão lateral da coluna","transverso e frontal"),
  /* abdome e pelve */
  "reto-abdome":M_("Reto do abdome","processo xifoide e cartilagens da 5ª à 7ª costela","púbis e sínfise púbica","nervos intercostais","flexão do tronco e retroversão da pelve","sagital e frontal"),
  "obliquo-externo":M_("Oblíquo externo do abdome","face externa das 7 últimas costelas","metade anterior da crista ilíaca, púbis e linha alba","nervos intercostais","flexão, flexão lateral e rotação do tronco para o lado oposto","sagital, frontal e transverso"),
  "obliquo-interno":M_("Oblíquo interno do abdome","fáscia toracolombar, crista ilíaca e ligamento inguinal","últimas costelas e linha alba","nervos intercostais","flexão, flexão lateral e rotação do tronco para o mesmo lado","sagital, frontal e transverso"),
  "transverso-abdome":M_("Transverso do abdome","cartilagens costais, fáscia toracolombar, crista ilíaca e ligamento inguinal","linha alba e púbis","nervos intercostais","aumenta a pressão intra-abdominal e estabiliza a lombar; não move articulação","transverso"),
  "quadrado-lombar":M_("Quadrado lombar","crista ilíaca","12ª costela e processos transversos de L1 a L4","nervos intercostal e lombares","flexão lateral do tronco para o mesmo lado e depressão da 12ª costela","frontal e sagital"),
  "iliopsoas":M_("Iliopsoas (ilíaco e psoas maior)","fossa ilíaca e sacro (ilíaco); processos transversos e discos lombares (psoas)","trocânter menor do fêmur","nervo femoral e nervos lombares","flexão do quadril, anteversão da pelve e tração da lombar para a frente","sagital e transverso"),
  /* quadril */
  "gluteo-maximo":M_("Glúteo máximo","face posterior do ílio, sacro e cóccix","trato iliotibial e tuberosidade glútea do fêmur","nervo glúteo inferior","extensão e rotação lateral do quadril; retroversão da pelve","sagital, frontal e transverso"),
  "gluteo-medio":M_("Glúteo médio","face lateral do ílio","trocânter maior do fêmur","nervo glúteo superior","abdução e rotação medial do quadril; fixa a pelve no apoio de uma perna","frontal, sagital e transverso"),
  "gluteo-minimo":M_("Glúteo mínimo","face lateral do ílio, abaixo do médio","trocânter maior do fêmur","nervo glúteo superior","abdução e rotação medial do quadril","frontal, sagital e transverso"),
  "tensor-fascia-lata":M_("Tensor da fáscia lata","espinha ilíaca anterossuperior","trato iliotibial","nervo glúteo superior","flexão, abdução e rotação medial do quadril","sagital, frontal e transverso"),
  "rotadores-laterais":M_("Rotadores laterais profundos (piriforme, gêmeos, obturatórios, quadrado femoral)","sacro, ísquio e forame obturado","trocânter maior e crista intertrocantérica","ramos do plexo sacral e nervo obturatório","rotação lateral do quadril e centragem da cabeça do fêmur","transverso"),
  /* coxa */
  "sartorio":M_("Sartório","espinha ilíaca anterossuperior","face medial da tíbia (pata de ganso)","nervo femoral","flexão, abdução e rotação lateral do quadril; flexão do joelho","sagital, frontal e transverso"),
  "reto-femoral":M_("Reto femoral","espinha ilíaca anteroinferior","patela e tuberosidade da tíbia (tendão patelar)","nervo femoral","extensão do joelho e flexão do quadril (biarticular)","sagital"),
  "vasto-lateral":M_("Vasto lateral","trocânter maior e linha áspera do fêmur","patela e tuberosidade da tíbia","nervo femoral","extensão do joelho","sagital"),
  "vasto-medial":M_("Vasto medial","linha intertrocantérica e lábio medial da linha áspera","patela e tuberosidade da tíbia","nervo femoral","extensão do joelho","sagital"),
  "vasto-intermedio":M_("Vasto intermédio","faces anterior e lateral do fêmur","patela e tuberosidade da tíbia","nervo femoral","extensão do joelho","sagital"),
  "biceps-femoral":M_("Bíceps femoral","tuberosidade isquiática (cabeça longa) e linha áspera (cabeça curta)","cabeça da fíbula e côndilo lateral da tíbia","nervo isquiático","extensão do quadril (cabeça longa), flexão e rotação lateral do joelho","sagital e transverso"),
  "semitendinoso":M_("Semitendinoso","tuberosidade isquiática","face medial da tíbia (pata de ganso)","nervo isquiático","extensão do quadril, flexão e rotação medial do joelho","sagital e transverso"),
  "semimembranoso":M_("Semimembranoso","tuberosidade isquiática","côndilo medial da tíbia","nervo isquiático","extensão do quadril, flexão e rotação medial do joelho","sagital e transverso"),
  "gracil":M_("Grácil","ramo inferior do púbis","face medial da tíbia (pata de ganso)","nervo obturatório","adução do quadril, flexão e rotação medial do joelho","frontal, sagital e transverso"),
  "pectineo":M_("Pectíneo","ramo superior do púbis","linha pectínea do fêmur","nervo femoral","flexão e adução do quadril","sagital, frontal e transverso"),
  "adutor-longo":M_("Adutor longo","face anterior do púbis, junto à sínfise","linha áspera do fêmur","nervo obturatório","adução do quadril","frontal e sagital"),
  "adutor-curto":M_("Adutor curto","ramo inferior do púbis","linha áspera do fêmur","nervo obturatório","adução do quadril","frontal, transverso e sagital"),
  "adutor-magno":M_("Adutor magno","ramos do púbis e do ísquio e tuberosidade isquiática","linha áspera e tubérculo adutor do fêmur","nervos obturatório e isquiático","adução do quadril; as fibras ligadas ao ísquio ajudam a estendê-lo","frontal, transverso e sagital"),
  /* perna */
  "tibial-anterior":M_("Tibial anterior","côndilo lateral e metade proximal da face lateral da tíbia","cuneiforme medial e base do 1º metatarsal","nervo fibular profundo","dorsiflexão e inversão do pé","sagital e frontal"),
  "extensor-longo-dedos":M_("Extensor longo dos dedos","côndilo lateral da tíbia, fíbula e membrana interóssea","falanges média e distal do 2º ao 5º dedo","nervo fibular profundo","dorsiflexão, eversão do pé e extensão dos dedos","sagital e frontal"),
  "fibulares":M_("Fibulares longo e curto","cabeça e face lateral da fíbula","1º metatarsal e cuneiforme medial (longo); base do 5º metatarsal (curto)","nervo fibular superficial","flexão plantar e eversão do pé; estabilidade lateral do tornozelo","frontal e sagital"),
  "gastrocnemio":M_("Gastrocnêmio (medial e lateral)","côndilos medial e lateral do fêmur","calcâneo (tendão do calcâneo)","nervo tibial","flexão plantar do tornozelo e flexão do joelho (biarticular)","sagital"),
  "soleo":M_("Sóleo","face posterior da tíbia e cabeça da fíbula","calcâneo (tendão do calcâneo)","nervo tibial","flexão plantar do tornozelo, com qualquer posição do joelho","sagital"),
  "tibial-posterior":M_("Tibial posterior","faces posteriores da tíbia e da fíbula","navicular, cuneiformes, cuboide e bases do 2º ao 4º metatarsal","nervo tibial","flexão plantar e inversão do pé; sustenta o arco","frontal e sagital"),
  "popliteo":M_("Poplíteo","côndilo lateral do fêmur","face posterior da tíbia","nervo tibial","flexão e rotação medial do joelho (destrava o joelho estendido)","transverso e sagital")
};

/* ---------- grupos do app → músculos anatômicos, ações por articulação e relações ----------
   art: ações (concêntricas) por articulação, com o vocabulário que a análise usa
   bi: músculos que cruzam duas articulações (insuficiência ativa e passiva)
   momento: onde o próprio músculo tem a maior alavanca (Campos, 2000) */
const GRUPOS_ANAT = {
  "peitoral-maior":{comp:["peitoral-maior","peitoral-menor","serratil-anterior"], art:{ombro:["adução horizontal","adução","rotação medial","flexão","extensão"]},
    antag:["deltoide-posterior","romboides","trapezio"], myers:["braco-sup-ant","funcional-ant"], souchard:["antero-medial-ombro","respiratoria"],
    nota:"A porção clavicular trabalha mais com o ombro flexionado (inclinado); a esternal e a abdominal, com ele mais estendido (declinado). Partindo da flexão, as fibras esternais também estendem o ombro.",
    momento:"Numa máquina com came, a resistência cresce justamente onde o peitoral tem a maior alavanca."},
  "deltoide-anterior":{comp:["deltoide-ant","coracobraquial"], art:{ombro:["flexão","adução horizontal","rotação medial","abdução"]},
    antag:["deltoide-posterior","grande-dorsal"], myers:["braco-sup-post"], souchard:["antero-medial-ombro"],
    nota:"Sinergista de quase todo empurrar; no supino, divide a adução horizontal com o peitoral."},
  "deltoide-lateral":{comp:["deltoide-med","supraespinhal"], art:{ombro:["abdução"]},
    antag:["grande-dorsal","peitoral-maior"], myers:["braco-sup-post"], souchard:["anterior-braco"],
    nota:"O supraespinhal começa a abdução e mantém a cabeça do úmero centrada; sem ele, o deltoide puxa o úmero para cima contra o acrômio.",
    momento:"A alavanca do deltoide cresce com a abdução e é maior por volta de 60°; a rotação superior da escápula evita que ele chegue à insuficiência ativa no alto."},
  "deltoide-posterior":{comp:["deltoide-post","infraespinhal","redondo-menor"], art:{ombro:["abdução horizontal","extensão","rotação lateral"]},
    antag:["peitoral-maior","deltoide-anterior"], myers:["braco-sup-post","braco-prof-post"], souchard:[],
    nota:"Somar rotação lateral à abdução horizontal recruta também infraespinhal e redondo menor, do manguito rotador."},
  "triceps-braquial":{comp:["triceps-braquial"], art:{cotovelo:["extensão"], ombro:["extensão","adução"]},
    bi:{nome:"cabeça longa do tríceps", juntas:["ombro","cotovelo"], alonga:"ombro flexionado (braço acima da cabeça) com cotovelo flexionado", encurta:"ombro estendido (braço atrás do tronco) com cotovelo estendido"},
    antag:["biceps-braquial","braquial-braquiorradial"], myers:["braco-prof-post"], souchard:[],
    nota:"Insere-se na ulna: girar a pegada (pronada ou supinada) não muda o tríceps, muda o trabalho dos músculos do punho."},
  "biceps-braquial":{comp:["biceps-braquial"], art:{cotovelo:["flexão"], radioulnar:["supinação"], ombro:["flexão"]},
    bi:{nome:"cabeça longa do bíceps", juntas:["ombro","cotovelo"], alonga:"ombro estendido (braço atrás do tronco) com cotovelo estendido", encurta:"ombro flexionado (braço à frente) com cotovelo flexionado"},
    antag:["triceps-braquial"], myers:["braco-prof-ant"], souchard:["anterior-braco"],
    nota:"Supinar o antebraço durante a flexão completa a ação do bíceps; com a pegada pronada ele perde vantagem e o braquiorradial assume.",
    momento:"A alavanca do bíceps é máxima com o cotovelo a cerca de 90°."},
  "braquial-braquiorradial":{comp:["braquial","braquiorradial","pronador-redondo"], art:{cotovelo:["flexão"]},
    antag:["triceps-braquial"], myers:[], souchard:["anterior-braco"],
    nota:"O braquial flexiona o cotovelo com qualquer pegada; o braquiorradial rende mais com a pegada neutra (martelo) e leva o antebraço de volta à posição neutra, venha ele da pronação ou da supinação.",
    momento:"O braquial tem a maior alavanca perto de 100° de flexão do cotovelo."},
  "grande-dorsal":{comp:["latissimo","redondo-maior"], art:{ombro:["extensão","adução","rotação medial"], escapula:["depressão"]},
    antag:["deltoide-anterior","deltoide-lateral"], myers:["braco-sup-ant","funcional-post"], souchard:[],
    nota:"O redondo maior só ajuda de verdade com a escápula fixada pelos adutores (romboides). Antebraço perpendicular ao chão mantém o ombro em rotação lateral e deixa o dorsal mais alongado.",
    momento:"Na remada, depois que o cotovelo passa a linha do tronco, a extensão que sobra é do tríceps e do deltoide posterior, não do dorsal."},
  "trapezio":{comp:["trapezio","levantador-escapula"], art:{escapula:["elevação","adução","rotação superior","depressão"]},
    antag:["grande-dorsal","peitoral-maior"], myers:["braco-sup-post"], souchard:["anterior-braco"],
    nota:"O antagonista direto da adução da escápula é o serrátil anterior (protração); o grande dorsal deprime a escápula contra a elevação do trapézio superior. Na elevação lateral e no desenvolvimento, as porções superior e inferior, com o serrátil anterior, fixam e giram a escápula para o úmero subir."},
  "romboides":{comp:["romboides","trapezio"], art:{escapula:["adução","rotação inferior","elevação"]},
    antag:["peitoral-maior"], myers:["braco-prof-post","espiral"], souchard:[],
    nota:"O serrátil anterior, que protrai a escápula, é o antagonista deles. Nas remadas, aduzem a escápula de forma isotônica no começo e isométrica no fim, servindo de base fixa para o dorsal e o redondo maior."},
  "eretores-espinha":{comp:["eretor-espinha","multifido-rotadores","quadrado-lombar"], art:{coluna:["extensão","flexão lateral"], pelve:["anteversão"]},
    antag:["reto-abdominal","obliquos"], myers:["sup-post","espiral"], souchard:["posterior"],
    nota:"Seguram a pelve contra a retroversão quando glúteo e isquiotibiais contraem; fracos, deixam a lombar arredondar no agachamento, no leg press e na flexora.",
    momento:"Quanto mais o tronco se inclina, maior o braço de momento da carga na lombar e maior a compressão nos discos."},
  "quadriceps-femoral":{comp:["reto-femoral","vasto-lateral","vasto-medial","vasto-intermedio"], art:{joelho:["extensão"], quadril:["flexão"], pelve:["anteversão"]},
    bi:{nome:"reto femoral", juntas:["quadril","joelho"], alonga:"quadril estendido com joelho flexionado", encurta:"quadril flexionado com joelho estendido"},
    antag:["isquiotibiais"], myers:["sup-ant","funcional-post"], souchard:[],
    nota:"Dos quatro, só o reto femoral cruza o quadril. A patela funciona como polia: afasta a linha de ação do eixo do joelho e aumenta a alavanca.",
    momento:"A maior alavanca do quadríceps fica entre 45° e 60° de flexão do joelho; nos últimos 15° da extensão ele perde vantagem mecânica e fisiológica."},
  "isquiotibiais":{comp:["biceps-femoral","semitendinoso","semimembranoso"], art:{quadril:["extensão"], joelho:["flexão"], pelve:["retroversão"]},
    bi:{nome:"isquiotibiais", juntas:["quadril","joelho"], alonga:"quadril flexionado com joelho estendido", encurta:"quadril estendido com joelho flexionado"},
    antag:["quadriceps-femoral"], myers:["sup-post","espiral"], souchard:["posterior"],
    nota:"A cabeça curta do bíceps femoral só cruza o joelho; os exercícios de flexão de joelho pegam mais a parte distal do grupo.",
    momento:"A alavanca dos isquiotibiais no quadril cresce até cerca de 35° de flexão e diminui depois; é sempre menor que a do glúteo máximo."},
  "gluteo-maximo":{comp:["gluteo-maximo","rotadores-laterais"], art:{quadril:["extensão","rotação lateral","abdução"], pelve:["retroversão"]},
    antag:["quadriceps-femoral","adutores"], myers:["lateral","funcional-post"], souchard:["posterior"],
    nota:"É monoarticular: com o joelho flexionado (ponte, coice) os isquiotibiais entram em insuficiência ativa e o glúteo assume a extensão do quadril.",
    momento:"É o extensor do quadril com a maior alavanca, máxima na posição neutra (de pé) e menor quanto mais o quadril flexiona."},
  "gluteo-medio":{comp:["gluteo-medio","gluteo-minimo","tensor-fascia-lata"], art:{quadril:["abdução","rotação medial"]},
    antag:["adutores"], myers:["lateral"], souchard:[],
    nota:"A função mais importante é fixar a pelve quando o corpo apoia numa perna só (afundo, step-up, corrida).",
    momento:"Os abdutores têm a maior alavanca com o quadril levemente aduzido: comece a abdução um pouco cruzado e termine perto de 45°."},
  "adutores":{comp:["adutor-longo","adutor-curto","adutor-magno","pectineo","gracil"], art:{quadril:["adução","flexão","extensão"]},
    bi:{nome:"grácil", juntas:["quadril","joelho"], alonga:"quadril abduzido com joelho estendido", encurta:"quadril aduzido com joelho flexionado"},
    antag:["gluteo-medio"], myers:["prof-ant","funcional-ant"], souchard:["antero-medial-quadril"],
    nota:"O quadril só aduz cerca de 10° além da posição anatômica; o trabalho útil vem da volta desde a abdução. Encurtados, puxam o joelho para dentro (valgo) no agachamento aberto."},
  "tibial-anterior":{comp:["tibial-anterior","extensor-longo-dedos"], art:{tornozelo:["dorsiflexão","inversão"]},
    antag:["panturrilha"], myers:["sup-ant","espiral"], souchard:[],
    nota:"Par antagonista do tríceps sural: o equilíbrio de força entre os dois protege o tornozelo e freia a pisada."},
  "panturrilha":{comp:["gastrocnemio","soleo","fibulares","tibial-posterior"], art:{tornozelo:["flexão plantar"], joelho:["flexão"]},
    bi:{nome:"gastrocnêmio", juntas:["joelho","tornozelo"], alonga:"joelho estendido com tornozelo em dorsiflexão", encurta:"joelho flexionado com tornozelo em flexão plantar"},
    antag:["tibial-anterior"], myers:["sup-post"], souchard:["posterior"],
    nota:"Gastrocnêmio e sóleo bombeiam o sangue venoso de volta ao coração. Com o joelho flexionado o gastrocnêmio perde eficiência e o sóleo trabalha quase sozinho."},
  "reto-abdominal":{comp:["reto-abdome","transverso-abdome"], art:{coluna:["flexão"], pelve:["retroversão"]},
    antag:["eretores-espinha"], myers:["sup-ant","funcional-ant"], souchard:[],
    nota:"O primeiro movimento ao contrair o abdome é a retroversão da pelve, seguida da flexão da lombar. A parte infraumbilical ganha ênfase quando a pelve sobe em direção ao tórax.",
    momento:"Na flexão de tronco, o braço de momento da resistência é máximo quando os ombros saem do chão; braços mais longe da coluna aumentam a intensidade."},
  "obliquos":{comp:["obliquo-externo","obliquo-interno","quadrado-lombar"], art:{coluna:["rotação","flexão lateral","flexão"]},
    antag:["obliquos"], myers:["lateral","espiral","funcional-ant"], souchard:[],
    nota:"Na rotação, o oblíquo externo de um lado trabalha com o interno do outro. Rodar no fim de uma flexão de tronco enfatiza o oblíquo externo do lado oposto ao giro."},
  "flexores-punho":{comp:["flexor-radial-carpo","flexor-ulnar-carpo","palmar-longo","flexor-superficial-dedos"], art:{punho:["flexão","desvio ulnar","desvio radial"]},
    antag:["extensores-punho"], myers:["braco-sup-ant"], souchard:["anterior-braco"],
    nota:"Também estabilizam o punho em quase todo exercício de membro superior; com o punho dobrado para trás eles perdem força-comprimento e a articulação fica exposta."},
  "extensores-punho":{comp:["extensor-radial-longo","extensor-radial-curto","extensor-ulnar-carpo","extensor-dedos"], art:{punho:["extensão","desvio radial","desvio ulnar"]},
    antag:["flexores-punho"], myers:["braco-sup-post"], souchard:[],
    nota:"Trabalham isometricamente para segurar o punho em roscas com pegada pronada e em pegadas supinadas no tríceps."}
};

/* ---------- articulações: movimentos, planos e amplitudes médias (Campos, 2000) ---------- */
const ARTICULACOES = {
  tornozelo:{nome:"Tornozelo", amp:{"dorsiflexão":"15–20° (15° com joelho estendido, 20° com ele flexionado)","flexão plantar":"≈45°"}, obs:"Inversão e eversão acontecem na subtalar, mas costumam ser contadas como do tornozelo."},
  joelho:{nome:"Joelho", amp:{"flexão":"≈140°","extensão":"até 0°"}, obs:"Dobradiça modificada: a rotação acompanha a flexão e a extensão. A estabilidade depende de ligamentos e músculos, não do encaixe ósseo."},
  quadril:{nome:"Quadril", amp:{"flexão":"≈125°","extensão":"≈10°","abdução":"≈45°","adução":"≈10°"}, obs:"Esferoide com três graus de liberdade; amplitudes maiores que essas só com a pelve e a coluna ajudando."},
  pelve:{nome:"Pelve", amp:{}, obs:"Anteversão vem junto com hiperextensão lombar e flexão do quadril; retroversão, com flexão lombar e extensão do quadril."},
  coluna:{nome:"Coluna", amp:{}, obs:"Flexão, extensão, flexão lateral e rotação, com amplitudes diferentes em cada região. 'Encaixar o quadril' em pé é retroverter a pelve: flexiona a lombar e reduz a capacidade de suportar carga."},
  escapula:{nome:"Escápula", amp:{}, obs:"Abdução, adução, elevação, depressão e rotações superior e inferior; as rotações acompanham a abdução e a adução do ombro (ritmo escapuloumeral)."},
  ombro:{nome:"Ombro", amp:{"flexão":"≈120° na glenoumeral","extensão":"≈45°","rotação medial":"≈70°","rotação lateral":"≈90°","abdução horizontal":"≈90° a partir do braço à frente","adução horizontal":"≈40° a partir do braço à frente"}, obs:"Além dessas amplitudes, a escápula e a coluna completam o movimento."},
  cotovelo:{nome:"Cotovelo", amp:{"flexão":"≈145°"}, obs:"Dobradiça; o antebraço fica alguns graus abduzido em relação ao braço (≈5° em homens, 10–15° em mulheres)."},
  radioulnar:{nome:"Radioulnar", amp:{"pronação":"≈90°","supinação":"≈90°"}, obs:"Na pronação e na supinação gira o rádio; na rotação do ombro gira o úmero."},
  punho:{nome:"Punho", amp:{"flexão":"≈80°","extensão":"≈70°","desvio ulnar":"≈35°","desvio radial":"≈20°"}, obs:""}
};
/* plano → eixo em que o movimento gira */
const EIXO_DO_PLANO = {sagital:"eixo frontal (látero-lateral)", frontal:"eixo sagital (ântero-posterior)", transverso:"eixo longitudinal (vertical)"};

/* ---------- cadeias musculares ----------
   Trilhos miofasciais de Myers: músculos ligados pela fáscia que transmitem tensão entre si.
   ids = músculos do app que participam do trilho */
const CADEIAS_MYERS = {
  "sup-post":{nome:"Linha superficial posterior", ids:["panturrilha","isquiotibiais","eretores-espinha"], percurso:"fáscia plantar → tríceps sural → isquiotibiais → ligamento sacrotuberoso → fáscia toracolombar → eretores → crânio", funcao:"impede que o corpo caia para a frente; estende a coluna e o quadril, flexiona o joelho e faz a flexão plantar", compensacao:"encurtada, limita a dobradiça e o fundo do agachamento e leva à retroversão da pelve com a lombar arredondando"},
  "sup-ant":{nome:"Linha superficial anterior", ids:["tibial-anterior","quadriceps-femoral","reto-abdominal"], percurso:"dorso do pé → tibial anterior → quadríceps (reto femoral) → reto do abdome → esternocleidomastóideo", funcao:"impede que o corpo caia para trás; faz a dorsiflexão, estende o joelho e flexiona o quadril, o tronco e a cabeça", compensacao:"encurtada, puxa a pelve para anteversão e aumenta a lordose"},
  "lateral":{nome:"Linha lateral", ids:["gluteo-medio","gluteo-maximo","obliquos"], percurso:"fibulares → trato iliotibial → tensor da fáscia lata e glúteos → oblíquos → intercostais", funcao:"alinha o corpo no plano frontal para ele não cair para os lados; flexão lateral da coluna, abdução do quadril e eversão do pé", compensacao:"fraca, deixa a pelve cair e o joelho desabar para dentro no apoio unilateral"},
  "prof-ant":{nome:"Linha profunda anterior", ids:["adutores"], percurso:"tibial posterior → adutores → iliopsoas → quadrado lombar → transverso do abdome → diafragma", funcao:"é a base das outras linhas: trabalho estático de sustentação e estabilização (arco do pé, quadril, lombar, respiração) para que as demais se movam", compensacao:"desequilibrada, altera o alinhamento do joelho e a postura da lombar"},
  "funcional-ant":{nome:"Linha funcional anterior", ids:["peitoral-maior","reto-abdominal","obliquos","adutores"], percurso:"peitoral maior → reto do abdome e oblíquo externo → adutor longo do lado oposto", funcao:"forma um X na frente do tronco: aproxima o ombro do quadril oposto, com rotação e flexão da coluna", compensacao:"trabalha junto com a funcional posterior e a espiral; não se isola"},
  "funcional-post":{nome:"Linha funcional posterior", ids:["grande-dorsal","gluteo-maximo","quadriceps-femoral"], percurso:"grande dorsal → fáscia toracolombar → glúteo máximo do lado oposto → vasto lateral", funcao:"forma um X atrás do tronco: liga o braço à perna oposta, com rotação e extensão da coluna", compensacao:"rigidez de um lado transmite tensão ao quadril do lado oposto"},
  "espiral":{nome:"Linha espiral", ids:["romboides","obliquos","tibial-anterior","isquiotibiais","eretores-espinha"], percurso:"esplênio → romboides → serrátil anterior → oblíquos → tensor da fáscia lata → tibial anterior → fibular longo → bíceps femoral → eretores", funcao:"faz as rotações e torções da coluna, ajuda na marcha e no equilíbrio em qualquer plano", compensacao:"desequilíbrios aparecem como rotação do tronco ou da pelve em exercícios unilaterais"},
  "braco-prof-ant":{nome:"Linha profunda anterior do braço", ids:["biceps-braquial"], percurso:"peitoral menor → bíceps → periósteo do rádio → região tenar", funcao:"postural; participa da flexão do ombro acima de 90°", compensacao:"tensão excessiva mantém os ombros elevados e projetados (protrusão vertical)"},
  "braco-sup-ant":{nome:"Linha superficial anterior do braço", ids:["peitoral-maior","grande-dorsal","flexores-punho"], percurso:"peitoral maior e grande dorsal → septo medial do braço → flexores do punho e dedos", funcao:"equilibra a linha superficial posterior do braço; leva os ombros à frente", compensacao:"tensão excessiva mantém os ombros projetados à frente (protrusão horizontal)"},
  "braco-prof-post":{nome:"Linha profunda posterior do braço", ids:["romboides","deltoide-posterior","triceps-braquial"], percurso:"romboides e levantador da escápula → manguito rotador → tríceps → ulna → dedo mínimo", funcao:"estabiliza o ombro: rotações interna e externa e tração da escápula", compensacao:"equilibra a linha profunda anterior do braço; se perde, o ombro perde estabilidade"},
  "braco-sup-post":{nome:"Linha superficial posterior do braço", ids:["trapezio","deltoide-anterior","deltoide-lateral","deltoide-posterior","extensores-punho"], percurso:"trapézio → deltoide → septo lateral do braço → extensores do punho", funcao:"postural; equilibra a linha superficial anterior do braço", compensacao:"desequilibrada em relação à anterior, muda a postura do ombro"}
};
/* cadeias de Souchard (RPG): grupos que, encurtados, geram atitudes posturais típicas */
const CADEIAS_SOUCHARD = {
  "posterior":{nome:"Cadeia posterior", musculos:"espinhais, glúteo máximo, isquiotibiais, poplíteo, tríceps sural e músculos da planta do pé", efeito:"cabeça projetada, desequilíbrio das curvas da coluna, quadril aberto, joelho ou calcâneo em varo ou valgo e ângulo tibiotársico aberto ou fechado"},
  "antero-medial-quadril":{nome:"Cadeia ântero-medial do quadril", musculos:"iliopsoas e adutores pubianos (pectíneo, adutores curto e longo, grácil, parte anterior do adutor magno)", efeito:"aumento da lordose, quadril flexionado, aduzido e rodado para dentro, joelhos em valgo"},
  "antero-medial-ombro":{nome:"Cadeia ântero-medial do ombro", musculos:"subescapular, coracobraquial e peitoral maior", efeito:"ombros aduzidos e rodados para dentro"},
  "anterior-braco":{nome:"Cadeia anterior do braço", musculos:"trapézio superior, deltoide médio, coracobraquial, bíceps, braquiorradial, pronador redondo, palmares e flexores dos dedos", efeito:"ombros elevados, cotovelo flexionado, antebraço pronado, punho e dedos flexionados"},
  "respiratoria":{nome:"Cadeia respiratória", musculos:"escalenos, peitorais maior e menor, intercostais e diafragma", efeito:"ombros e cabeça projetados, tórax em inspiração e lordose aumentada"}
};
/* GDS: tendências de raiz de membro (só as que mexem com exercício) */
const CADEIAS_GDS = {
  anterolateral:"A cadeia anterolateral (AL) favorece adução, flexão e rotação interna na raiz dos membros.",
  posterolateral:"A cadeia posterolateral (PL) favorece abdução e rotação externa na raiz dos membros."
};
/* fatores que levam o corpo a compensar dentro de uma cadeia */
const FATORES_COMPENSACAO = [
  ["Comprimento muscular","Um músculo já encurtado ou tenso antes do movimento muda o braço de alavanca e reduz a eficiência."],
  ["Velocidade de contração","Músculos que passam muito tempo esticados ou comprimidos resistem mais à deformação e perdem resposta e força inicial."],
  ["Ativação neural","Atraso ou dificuldade para ativar um grupo leva o corpo a recrutar outro no lugar dele."],
  ["Fadiga","Estruturas cansadas suportam menos a contração: é quando a técnica se perde e o risco de lesão sobe."]
];
const PRINCIPIOS_CADEIAS = "O corpo compensa seguindo três princípios: equilíbrio, conforto (fugir da dor) e economia de energia. A fáscia distribui a tensão de um músculo desequilibrado pelos vizinhos da cadeia, e quem faz o trabalho no lugar dele acaba sobrecarregado.";

/* cadeias de Myers de que um músculo do app participa */
function cadeiasDoMusculo(id){ return Object.entries(CADEIAS_MYERS).filter(([,c])=>c.ids.includes(id)).map(([k])=>k); }
/* eixo a partir do texto de plano ("sagital", "frontal", "transversal"...) */
function eixoDoPlano(plano){
  const p = normNome(plano||"");
  if(p.startsWith("sagital")) return EIXO_DO_PLANO.sagital;
  if(p.startsWith("frontal")) return EIXO_DO_PLANO.frontal;
  if(p.startsWith("transvers")) return EIXO_DO_PLANO.transverso;
  return "";
}
