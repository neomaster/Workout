/* =====================================================================
   ANÁLISE CINESIOLÓGICA SEM VÍDEO
   Para cada exercício: ações articulares com planos e eixos, alavanca,
   braço de momento da resistência, componente translatório, papel e tipo
   de contração de cada músculo, comprimento (insuficiência ativa e passiva
   dos biarticulares), cadeias musculares e compensações, anatomia e fontes.
   Para cada grupo ou músculo: anatomia, ações, cadeias e como os exercícios
   da biblioteca cobrem as ações e os comprimentos.
   Base: Campos (2000), Myers/Souchard (e-book de cadeias) e quadros de
   origem e inserção. Texto escrito por nós; nada é cópia das obras.
   ===================================================================== */

/* movimento articular de cada padrão: a = articulação, c = ação concêntrica, e = excêntrica, iso = trabalho isométrico */
const MV = (a, c, e, p) => ({a, c, e, p});
const ISO = (a, iso, p) => ({a, iso, p});
const BIOMEC = {
  agachamento:{mov:[MV("quadril","extensão","flexão","sagital"),MV("joelho","extensão","flexão","sagital"),MV("tornozelo","flexão plantar","dorsiflexão","sagital")],
    estab:["eretores-espinha","reto-abdominal","obliquos","gluteo-medio","adutores"],
    alavanca:"Alavancas de 3ª classe no quadril e no joelho: os músculos se inserem perto do eixo e a carga fica longe, o que exige força muito maior que o peso, em troca de amplitude e velocidade.",
    bm:"O braço de momento da carga é máximo no fundo, com quadril e joelho flexionados. Inclinar o tronco aumenta o braço no quadril (mais glúteo e isquiotibiais) e diminui no joelho; ficar mais ereto faz o contrário (mais quadríceps).",
    transl:"Compressão articular em todo o percurso. Na lombar, o tronco inclinado soma torque e a força dos extensores para segurá-lo: a compressão nos discos pode passar de dez vezes o peso levantado.",
    foco:"Em cadeia fechada, a intenção muda quem trabalha: pensar em estender o joelho puxa o quadríceps; pensar em levar o quadril à frente e aproximar as coxas puxa glúteos e adutores. As duas articulações acompanham porque o pé está fixo.",
    seguranca:["Mantenha a curvatura normal da lombar: com a lombar flexionada a compressão na frente do disco aumenta.","No fundo, o glúteo máximo pode chegar à insuficiência passiva e puxar a pelve para retroversão (a lombar 'enrola'); pare a descida antes desse ponto até ganhar mobilidade.","Falta de dorsiflexão (gastrocnêmio curto) obriga o tronco a inclinar mais e carrega a lombar; um calço no calcanhar reduz isso.","Abra os pés girando o quadril, não o joelho: assim o joelho continua flexionando no seu plano."],
    souchard:["posterior","antero-medial-quadril"]},
  afundo:{mov:[MV("quadril","extensão","flexão","sagital"),MV("joelho","extensão","flexão","sagital"),ISO("quadril (perna da frente)","segura a pelve nivelada contra a adução","frontal")],
    estab:["gluteo-medio","obliquos","adutores","eretores-espinha"],
    alavanca:"3ª classe no quadril e no joelho, com metade da base de apoio: o equilíbrio vira parte do exercício.",
    bm:"O braço de momento no joelho da frente é máximo na flexão. Projetar o tronco à frente desloca o torque para o quadril (glúteo e isquiotibiais) e para a lombar; tronco ereto com o peso na perna de trás deixa o trabalho quase só para o quadríceps.",
    transl:"Compressão articular em todo o percurso; como a carga total é menor que no agachamento, a compressão na coluna também é.",
    foco:"É o exercício em que o quadril alcança a maior amplitude. Escolha a ênfase pelo tronco: inclinado para glúteo, ereto para quadríceps.",
    seguranca:["Prefira o passo para trás: no passo à frente o fêmur continua indo quando o pé trava e estressa o ligamento cruzado posterior e o tendão patelar.","A pelve não deve inclinar para o lado: quem segura são os abdutores da perna da frente e os flexores laterais do tronco do lado de trás.","Reto femoral ou iliopsoas curtos na perna de trás puxam a pelve para anteversão e arqueiam a lombar."],
    souchard:["antero-medial-quadril","posterior"]},
  extensora:{mov:[MV("joelho","extensão","flexão","sagital")],
    estab:["reto-abdominal"],
    alavanca:"3ª classe; a patela funciona como polia anatômica e aumenta o braço de momento do quadríceps.",
    bm:"O braço de momento da resistência é máximo entre 45° e 50° de flexão do joelho, perto de onde o quadríceps também tem a maior alavanca (45–60°). Nos últimos 15° da extensão o quadríceps precisa de cerca de 60% mais força.",
    transl:"O quadríceps comprime a articulação, mas o mesmo puxão que gira a tíbia tende a deslizá-la para a frente: quem segura é o ligamento cruzado anterior.",
    foco:"Só o joelho se move; segure as alças e mantenha o fêmur inteiro apoiado no banco.",
    seguranca:["Comece com o joelho a 90°: dobrar mais que isso faz o quadríceps apertar a patela contra o fêmur, o que pesa com cargas altas.","Sem encosto, no fim da série a pessoa joga o tronco para trás para ajudar o reto femoral e hiperestende a lombar; use encosto.","Puxar a ponta do pé durante a extensão pode travar o joelho antes do fim (gastrocnêmio em insuficiência passiva)."],
    souchard:["posterior"]},
  flexao_joelho:{mov:[MV("joelho","flexão","extensão","sagital")],
    estab:["eretores-espinha","reto-abdominal"],
    alavanca:"3ª classe; como quase todos os flexores do joelho são biarticulares, a posição do quadril e do tornozelo muda a força que eles conseguem fazer.",
    bm:"O braço de momento da resistência é máximo com o joelho perto de 90°.",
    transl:"Compressão no começo da flexão e descompressão no fim, quando ligamentos e tendão patelar seguram a articulação.",
    foco:"Leve o calcanhar ao glúteo sem mexer a pelve; o quadril, a lombar e o tornozelo não devem 'ajudar'.",
    seguranca:["Quando cansa, o corpo compensa: pelve em anteversão, lombar em hiperextensão e ponta do pé puxada para usar o gastrocnêmio. Nesse ponto, termine a série.","Paravertebrais fracos deixam a pelve retroverter no começo de cada descida."],
    souchard:["posterior"]},
  dobradica:{mov:[MV("quadril","extensão","flexão","sagital"),ISO("coluna","mantém a curvatura neutra","sagital")],
    estab:["eretores-espinha","reto-abdominal","obliquos","grande-dorsal","trapezio"],
    alavanca:"3ª classe no quadril, com o tronco como um braço longo: quanto mais horizontal o tronco, maior o torque no quadril e na lombar.",
    bm:"O braço de momento da carga é máximo com o tronco paralelo ao chão e diminui ao subir. Manter a carga rente às pernas encurta o braço na lombar.",
    transl:"Compressão na coluna e no quadril em todo o percurso; a dos discos cresce com a inclinação do tronco.",
    foco:"O movimento é do quadril; a coluna só sustenta. Com o joelho quase fixo, os isquiotibiais trabalham alongados.",
    seguranca:["A amplitude termina onde os isquiotibiais chegam à insuficiência passiva: depois disso, a pelve retroverte e a lombar arredonda.","No topo, pare com o quadril em linha; ir além hiperestende a lombar.","Banco muito alto na extensão lombar deixa o quadril flexionar demais e retroverte a pelve antes de começar."],
    souchard:["posterior"]},
  ponte:{mov:[MV("quadril","extensão","flexão","sagital")],
    estab:["reto-abdominal","isquiotibiais","eretores-espinha"],
    alavanca:"3ª classe no quadril; com o joelho flexionado o glúteo máximo vira o extensor principal.",
    bm:"Na ponte e no coice com caneleira ou em quatro apoios, o braço de momento da carga é máximo perto da extensão completa (pico encurtado). No aparelho de extensão de quadril em pé, com o apoio atrás da coxa, ele é máximo com o fêmur na horizontal e diminui conforme o quadril estende.",
    transl:"Compressão na articulação do quadril durante todo o movimento.",
    foco:"Leve o quadril até alinhar com o tronco, com as costelas para baixo; quem termina o movimento é o glúteo, não a lombar.",
    seguranca:["O quadril só estende cerca de 10° além da linha do corpo; daí em diante quem 'sobe' é a lombar, com anteversão da pelve.","Com o joelho flexionado, reto femoral ou iliopsoas curtos podem limitar a extensão antes do alinhamento e arquear a lombar: alongue os flexores do quadril."],
    souchard:["antero-medial-quadril"]},
  abducao:{mov:[MV("quadril","abdução","adução","frontal")],
    estab:["obliquos","reto-abdominal"],
    alavanca:"3ª classe; glúteos médio e mínimo têm a maior alavanca com o quadril um pouco aduzido.",
    bm:"Na cadeira abdutora e no cabo, a resistência tem mais alavanca na saída do que no fim da abertura, justamente onde os abdutores rendem mais.",
    transl:"Compressão articular.",
    foco:"Pelve fixa: o fêmur é que se move. Comece levemente aduzido e vá até cerca de 45°.",
    seguranca:["Com carga alta, a pelve tende a ir até o fêmur (inclinação lateral e flexão lateral do tronco); reduza a carga.","Adutores curtos limitam a abertura; continuar além disso entorta a pelve.","Com elástico, a maior tensão cai no fim, onde os abdutores estão mais fracos (insuficiência ativa)."],
    souchard:[], gds:"posterolateral"},
  aducao:{mov:[MV("quadril","adução","abdução","frontal")],
    estab:["obliquos","reto-abdominal"],
    alavanca:"3ª classe. O quadril só aduz cerca de 10° além da posição anatômica, então o trabalho útil vem da volta desde ~45° de abdução (50–55° de amplitude).",
    bm:"Na cadeira adutora, o braço de momento da resistência cresce conforme as coxas se fecham e é máximo perto da posição anatômica; a came acompanha a alavanca dos adutores.",
    transl:"Compressão articular.",
    foco:"As duas coxas juntas não deixam a pelve inclinar; no cabo, de uma perna só, segure a pelve fixa.",
    seguranca:["A abertura pode ser limitada pela insuficiência passiva dos adutores: respeite o limite e alongue.","No cabo, passar de 10° de adução transfere o trabalho para a outra perna e para os flexores laterais da coluna."],
    souchard:["antero-medial-quadril"], gds:"anterolateral"},
  empurrar_h:{mov:[MV("ombro","adução horizontal","abdução horizontal","transverso"),MV("cotovelo","extensão","flexão","sagital"),ISO("escápula","retraída e deprimida","frontal")],
    estab:["romboides","trapezio","deltoide-posterior","reto-abdominal"],
    alavanca:"3ª classe no ombro e no cotovelo.",
    bm:"Com barra ou halteres, o braço de momento da carga é máximo no fim da descida (carga perto do peito) e some no topo, quando ela fica sobre o ombro.",
    transl:"A força do peitoral maior comprime e estabiliza o ombro em toda a amplitude.",
    foco:"Com as mãos fixas, concentre-se em aproximar os braços do centro (adução horizontal); se a intenção for esticar o cotovelo, o tríceps passa a ser o principal.",
    seguranca:["Na descida, o cotovelo não deve passar muito da linha do ombro: a escápula é prensada contra o banco e a frente do ombro sofre.","O manguito rotador (supraespinhal, infraespinhal, redondo menor, subescapular) precisa estar forte antes de cargas altas."],
    souchard:["antero-medial-ombro","respiratoria"]},
  crucifixo:{mov:[MV("ombro","adução horizontal","abdução horizontal","transverso"),ISO("cotovelo","levemente flexionado e fixo","sagital")],
    estab:["deltoide-posterior","romboides","biceps-braquial"],
    alavanca:"3ª classe com o braço inteiro como alavanca: pouca carga já gera muito torque.",
    bm:"Com halteres, o braço de momento é máximo com os braços abertos, paralelos ao chão. Com cabo ou elástico, é máximo no meio do arco, onde o cabo fica perpendicular ao braço; na máquina de came, ele acompanha a alavanca do peitoral.",
    transl:"O peitoral maior comprime e estabiliza o ombro em toda a amplitude.",
    foco:"Feche os braços em arco; o cotovelo não participa. O cabo dá cerca de 90° de amplitude contra uns 45° do supino com barra.",
    seguranca:["Cotovelo estendido vira o ponto de encontro entre o cabo e o peitoral: mantenha-o semiflexionado.","Abra só até o cotovelo alinhar com o ombro, de lado; além disso a frente do ombro é forçada."],
    souchard:["antero-medial-ombro"]},
  empurrar_v:{mov:[MV("ombro","abdução","adução","frontal"),MV("cotovelo","extensão","flexão","sagital"),MV("escápula","rotação superior","rotação inferior","frontal")],
    estab:["reto-abdominal","obliquos","gluteo-maximo","eretores-espinha"],
    alavanca:"3ª classe; com o cotovelo flexionado, o braço de momento da carga é menor que na elevação lateral, mas há mais músculos trabalhando.",
    bm:"O braço de momento da resistência é máximo com o braço paralelo ao chão; o deltoide tem a maior alavanca por volta de 60° de abdução.",
    transl:"Compressão articular; no começo, a força para cima tende a aproximar a cabeça do úmero do acrômio, e o manguito rotador (menos o supraespinhal) puxa no sentido contrário.",
    foco:"Tríceps, trapézio (porções superior e inferior) e serrátil anterior entram junto: o deltoide não trabalha tão isolado quanto na elevação lateral.",
    seguranca:["Por trás da nuca o risco para o ombro é alto: prefira a barra pela frente ou halteres.","A lombar precisa ficar neutra: pouca consciência postural, eretores fracos ou isquiotibiais curtos fazem a carga escorrer para a coluna."],
    souchard:["antero-medial-ombro"]},
  puxar_v:{mov:[MV("ombro","adução","abdução","frontal"),MV("cotovelo","flexão","extensão","sagital"),MV("escápula","rotação inferior","rotação superior","frontal"),MV("escápula","adução","abdução","transverso")],
    estab:["eretores-espinha","reto-abdominal"],
    alavanca:"3ª classe no ombro e no cotovelo.",
    bm:"O braço de momento da resistência é máximo com o braço paralelo ao chão.",
    transl:"O grande dorsal comprime o ombro no começo e passa a descomprimir no fim do movimento.",
    foco:"Com as mãos fixas na barra, puxar com o cotovelo também aduz o ombro: pense em levar o úmero até o tronco, não a mão até o ombro. A escápula acompanha em rotação inferior e adução.",
    seguranca:["Antebraço perpendicular ao chão mantém o ombro em rotação lateral e o dorsal mais alongado.","Por trás da nuca o peitoral maior participa mais (Campos chega a sugeri-la para iniciantes, para não deslocar o centro de gravidade); a prática atual prefere a puxada pela frente, porque atrás o ombro trabalha em rotação lateral no limite.","Uma só pegada não pega todas as fibras do dorsal: varie a pegada e combine com remadas."],
    souchard:[]},
  puxar_h:{mov:[MV("ombro","extensão","flexão","sagital"),MV("cotovelo","flexão","extensão","sagital"),MV("escápula","adução","abdução","transverso")],
    estab:["eretores-espinha","isquiotibiais","gluteo-maximo","reto-abdominal"],
    alavanca:"3ª classe; o grande dorsal é o principal extensor do ombro.",
    bm:"Com peso livre, o braço de momento é zero com o braço pendurado na vertical e máximo no fim da extensão. No cabo, ainda há torque com o braço à frente, a amplitude cresce cerca de 30° e o dorsal começa mais alongado.",
    transl:"Comprime o ombro quase o tempo todo; só nos últimos graus da extensão passa a tracioná-lo.",
    foco:"O cotovelo dobra porque o ombro estende, não por esforço do bíceps. Puxe até o cotovelo, a 90°, passar ao lado do tronco: dali em diante quem estende o ombro são o tríceps e o deltoide posterior.",
    seguranca:["Lombar neutra: isquiotibiais curtos retrovertem a pelve; flexionar um pouco os joelhos resolve.","Na remada unilateral apoiada, ombros alinhados e banco na altura certa evitam rodar a coluna.","O apoio no peito reduz a exigência dos eretores lombares (a coluna torácica continua por conta própria): boa opção para iniciantes."],
    souchard:[]},
  pullover:{mov:[MV("ombro","extensão","flexão","sagital"),ISO("cotovelo","levemente flexionado e fixo","sagital")],
    estab:["reto-abdominal","obliquos"],
    alavanca:"3ª classe com o braço inteiro como alavanca.",
    bm:"Com halter, o braço de momento é máximo com o braço paralelo ao chão (acima da cabeça, no alongamento) e some quando o braço chega à vertical. No cabo, a tensão continua até a linha do quadril.",
    transl:"Compressão do ombro na maior parte do arco.",
    foco:"O dorsal e as fibras esternais do peitoral estendem o ombro partindo da flexão; a cabeça longa do tríceps ajuda.",
    seguranca:["Costelas para baixo: arquear a lombar no alongamento é compensação de falta de mobilidade do ombro."],
    souchard:["antero-medial-ombro"]},
  ombro_isolado:{mov:[MV("ombro","abdução","adução","frontal"),MV("escápula","rotação superior","rotação inferior","frontal")],
    estab:["trapezio","reto-abdominal","obliquos"],
    alavanca:"3ª classe com o braço inteiro como alavanca: pouca carga gera muito torque.",
    bm:"Com halteres, o braço de momento é máximo com o braço paralelo ao chão; no começo o deltoide tem a melhor relação força-comprimento e sua alavanca cresce à medida que o braço sobe.",
    transl:"Ao abduzir, a compressão do deltoide aumenta e o empurrão do úmero para cima diminui.",
    foco:"Eleve até a linha do ombro. Serrátil anterior e trapézio (superior e inferior) contraem isometricamente para fixar a escápula; sem isso, ela gira para baixo em vez de o braço subir.",
    seguranca:["Acima da linha do ombro, um ritmo escapuloumeral fraco, pouco espaço articular ou manguito deficiente podem prensar o supraespinhal no acrômio.","Cotovelo semiflexionado: estendido, ele vira o eixo entre o peso e o deltoide.","Com carga excessiva o tronco balança (extensão na subida, flexão na descida); reduza a carga ou flexione mais o cotovelo para diminuir o braço de momento."],
    souchard:["anterior-braco"]},
  posterior_ombro:{mov:[MV("ombro","abdução horizontal","adução horizontal","transverso"),MV("escápula","adução","abdução","transverso")],
    estab:["eretores-espinha","trapezio"],
    alavanca:"3ª classe com o braço como alavanca.",
    bm:"O braço de momento da resistência é máximo com os braços paralelos ao chão; com a carga pendurada sob o ombro, não há torque.",
    transl:"A contração do deltoide posterior comprime a articulação.",
    foco:"Abra os braços para trás em arco; somar rotação lateral recruta infraespinhal e redondo menor. Levar o cotovelo acima da linha do tronco chama os adutores da escápula (romboides e trapézio médio).",
    seguranca:["Se o deltoide posterior entra em insuficiência ativa (comum em iniciantes), a escápula aduz antes do fim do movimento: reduza a carga.","No banco inclinado, apoiado, é uma boa opção para iniciantes e trabalha os músculos que seguram a postura da coluna torácica."],
    souchard:[]},
  rosca:{mov:[MV("cotovelo","flexão","extensão","sagital"),MV("radioulnar","supinação","pronação","transverso")],
    estab:["deltoide-anterior","flexores-punho","reto-abdominal"],
    alavanca:"3ª classe clássica: o bíceps se insere a poucos centímetros do cotovelo e a carga fica na mão.",
    bm:"Com peso livre, o braço de momento é máximo com o antebraço paralelo ao chão. Quando a carga passa sobre o cotovelo o torque some e o resto da subida não carrega o bíceps.",
    transl:"Comprime o cotovelo no início da flexão e passa a tracioná-lo no final.",
    foco:"Cotovelo fixo; a força máxima do bíceps é perto de 90° e a do braquial perto de 100°.",
    seguranca:["Na extensão completa com peso livre ainda há torque puxando o cotovelo: desça controlando e não relaxe os flexores embaixo.","Na Scott de máquina, quem está começando não deve estender por completo."],
    souchard:["anterior-braco"]},
  triceps:{mov:[MV("cotovelo","extensão","flexão","sagital")],
    estab:["deltoide-posterior","grande-dorsal","reto-abdominal","flexores-punho"],
    alavanca:"O cotovelo é uma alavanca de 1ª classe na extensão: o olécrano fica atrás do eixo, com a carga do outro lado.",
    bm:"O braço de momento é máximo com o antebraço paralelo ao chão e some quando a carga se alinha com o cotovelo.",
    transl:"A contração do tríceps comprime e estabiliza o cotovelo em toda a amplitude.",
    foco:"Só o antebraço se move; o ombro fica parado. Posicionar a carga um pouco fora da linha do cotovelo mantém torque mesmo na extensão completa.",
    seguranca:["Mexer o ombro junto (estender ombro e cotovelo ao mesmo tempo) leva a cabeça longa à insuficiência ativa e rouba eficiência.","Punho neutro: com ele dobrado para trás o cotovelo sofre mais.","Deitado, abdome contraído para a carga não arquear a lombar."],
    souchard:[]},
  mergulho:{mov:[MV("ombro","flexão","extensão","sagital"),MV("cotovelo","extensão","flexão","sagital"),ISO("escápula","deprimida","frontal")],
    estab:["trapezio","reto-abdominal"],
    alavanca:"Cadeia fechada: as mãos ficam fixas e o corpo se move em torno delas.",
    bm:"O torque no ombro e no cotovelo é máximo no fundo, com o braço paralelo ao chão.",
    transl:"Compressão no cotovelo; no ombro, a descida funda puxa a cabeça do úmero para a frente.",
    foco:"Desça até o braço ficar paralelo ao chão; o tronco ereto dá mais tríceps, inclinado dá mais peitoral.",
    seguranca:["Descer além da linha do braço paralelo força a frente do ombro.","Ombros longe das orelhas: empurre as barras para baixo."],
    souchard:["antero-medial-ombro"]},
  panturrilha:{mov:[MV("tornozelo","flexão plantar","dorsiflexão","sagital")],
    estab:["tibial-anterior","quadriceps-femoral"],
    alavanca:"Com o pé apoiado, a alavanca do tornozelo é de 2ª classe: o eixo fica na ponta do pé, a carga no meio e o tendão do calcâneo puxa o calcanhar.",
    bm:"O braço de momento da resistência é máximo com o pé a 90° da tíbia e diminui acima e abaixo disso.",
    transl:"Grande componente de compressão em todo o percurso, o que estabiliza o tornozelo.",
    foco:"Comece com o calcanhar abaixo da linha (pré-estiramento) e suba o máximo: a amplitude total é o que desenvolve o músculo.",
    seguranca:["Com peso livre e sem apoio, o equilíbrio recruta os estabilizadores e aproxima o exercício do gesto esportivo.","Se não consegue descer o calcanhar, é o gastrocnêmio curto (insuficiência passiva): alongue."],
    souchard:["posterior"]},
  tibial:{mov:[MV("tornozelo","dorsiflexão","flexão plantar","sagital")],
    estab:[],
    alavanca:"3ª classe: com pouco encurtamento do tibial anterior, a ponta do pé percorre uma distância grande.",
    bm:"O braço de momento da resistência é máximo com o pé paralelo ao chão; com elástico a tensão maior cai no fim da dorsiflexão.",
    transl:"Compressão articular.",
    foco:"Parta da flexão plantar: a dorsiflexão sozinha tem só 15–20°, e começar com o pé apontado para baixo soma uns 45°.",
    seguranca:["Joelho levemente flexionado: estendido, o gastrocnêmio limita a dorsiflexão por insuficiência passiva."],
    souchard:[]},
  abdominal:{mov:[MV("coluna","flexão","extensão","sagital"),MV("pelve","retroversão","anteversão","sagital")],
    estab:["obliquos"],
    alavanca:"3ª classe: o tronco e os braços são a resistência; a posição dos braços muda o torque.",
    bm:"No solo, o braço de momento é máximo quando os ombros saem do chão e diminui com a flexão. Na polia é o contrário: quase nulo no começo e crescente, o que pode levar o abdome à insuficiência ativa.",
    transl:"Compressão na coluna em todo o percurso; na polia, o cabo descomprime e o abdome compensa.",
    foco:"O primeiro movimento é retroverter a pelve; depois a coluna enrola vértebra por vértebra. Quando a coluna termina de flexionar, qualquer continuação é flexão do quadril, não abdome.",
    seguranca:["Se a lombar sai do chão, o eixo passa para o quadril e o iliopsoas puxa a pelve para anteversão e a lombar para hiperextensão.","Pés presos aumentam a ação dos flexores do quadril.","Amplitude curta repetida encurta o abdome e favorece postura cifótica: volte a encostar ombros e cabeça."],
    souchard:["antero-medial-quadril"]},
  anti_extensao:{mov:[ISO("coluna","resiste à extensão","sagital"),MV("ombro","extensão","flexão","sagital")],
    estab:["reto-abdominal","obliquos","gluteo-maximo","grande-dorsal"],
    alavanca:"A distância entre mãos e pés é o braço de alavanca: quanto mais longe, maior o torque que o abdome segura.",
    bm:"O torque sobre a coluna é máximo na posição mais estendida (mais longe).",
    transl:"O abdome comprime e estabiliza a coluna contra a tração do peso do corpo.",
    foco:"O abdome trabalha isometricamente para a lombar não ceder; o movimento visível é do ombro.",
    seguranca:["Se a lombar afunda, os flexores do quadril estão puxando a pelve para anteversão: encurte a amplitude."],
    souchard:["antero-medial-quadril"]},
  rotacao:{mov:[MV("coluna","rotação","rotação","transverso")],
    estab:["reto-abdominal","gluteo-medio"],
    alavanca:"Os braços estendidos aumentam a alavanca; mais perto do corpo, menos torque.",
    bm:"O braço de momento é máximo com a carga (ou as pernas) mais perto do chão, longe do eixo.",
    transl:"Compressão na coluna; o controle evita que a força externa caia sobre ligamentos e discos.",
    foco:"O tronco conduz; o reto do abdome quase não participa porque a coluna não flexiona.",
    seguranca:["Conduza o giro o tempo todo: embalo transfere a carga para as articulações da coluna."],
    souchard:[]},
  encolhimento:{mov:[MV("escápula","elevação","depressão","frontal")],
    estab:["flexores-punho","reto-abdominal"],
    alavanca:"A carga pende na vertical: o trabalho é direto contra a gravidade, com amplitude curta.",
    bm:"O braço de momento é praticamente constante; a carga vence a elevação direto.",
    transl:"Tração (descompressão) no ombro com a carga pendurada.",
    foco:"Suba os ombros em linha reta; no Kelso, leve as escápulas para trás (adução).",
    seguranca:["Girar os ombros não acrescenta trabalho e força a articulação."],
    souchard:["anterior-braco"]},
  punho:{mov:[MV("punho","flexão","extensão","sagital")],
    estab:["biceps-braquial","triceps-braquial"],
    alavanca:"3ª classe com a mão como alavanca; com a anilha na ponta da barra, pouco peso gera muito torque.",
    bm:"O braço de momento da resistência é máximo com a barra (ou a mão) paralela ao chão.",
    transl:"Compressão do punho em todo o percurso.",
    foco:"Cotovelo e ombro parados; o antebraço apoiado.",
    seguranca:["Use toda a amplitude devagar: o punho tem bem menos mobilidade que o cotovelo."],
    souchard:["anterior-braco"]},
  isometria:{mov:[ISO("coluna","mantém a posição contra a gravidade","sagital")],
    estab:["reto-abdominal","obliquos","gluteo-maximo","eretores-espinha"],
    alavanca:"O corpo inteiro é a alavanca entre os apoios; afastar os apoios aumenta o torque.",
    bm:"O torque é constante enquanto a posição se mantém.",
    transl:"O abdome comprime e estabiliza a coluna.",
    foco:"Não há fase concêntrica nem excêntrica: o músculo segura o comprimento.",
    seguranca:["Pare quando a posição se perder: é a fadiga transferindo o trabalho para a coluna."],
    souchard:[]}
};

/* ajustes por exercício (pelo nome normalizado): ação diferente, nota a mais, foco */
const AJUSTES_BIOMEC = [
  {se:["elevacao frontal"], pad:["ombro_isolado"], mov:[MV("ombro","flexão","extensão","sagital"),MV("escápula","rotação superior","rotação inferior","frontal")]},
  {se:["y raise","elevacao y"], pad:["ombro_isolado"], nota:"No Y o braço sobe no plano da escápula, uns 30° à frente do plano frontal: a cabeça do úmero se encaixa melhor e as porções inferiores do trapézio entram mais."},
  {se:["copenhagen"], pad:["isometria"], mov:[ISO("quadril","adução isométrica contra o peso do corpo","frontal"),ISO("coluna","mantém o tronco alinhado de lado","frontal")]},
  {se:["remada alta"], pad:["ombro_isolado"], mov:[MV("ombro","abdução","adução","frontal"),MV("escápula","elevação","depressão","frontal"),MV("cotovelo","flexão","extensão","sagital")]},
  {se:["supino fechado"], pad:["triceps"], mov:[MV("cotovelo","extensão","flexão","sagital"),MV("ombro","flexão","extensão","sagital")], nota:"Com a pegada fechada e os cotovelos junto ao corpo, o ombro flexiona em vez de aduzir na horizontal: tríceps lidera, peitoral (porção clavicular) e deltoide anterior ajudam."},
  {se:["kelso"], mov:[MV("escápula","adução","abdução","transverso")]},
  {se:["extensao punho","invertida"], pad:["punho"], mov:[MV("punho","extensão","flexão","sagital")]},
  {se:["martelo","inversa"], pad:["rosca"], mov:[MV("cotovelo","flexão","extensão","sagital")], nota:"Pegada neutra ou pronada: sem supinação, o braquiorradial e o braquial assumem boa parte da flexão."},
  {se:["elevacao pernas","elevacao de pernas"], pad:["abdominal"], mov:[MV("pelve","retroversão","anteversão","sagital"),MV("coluna","flexão","extensão","sagital"),ISO("quadril","flexores seguram as pernas","sagital")], nota:"Subir a pelve em direção ao tórax enfatiza a parte infraumbilical do reto e o oblíquo interno. Os flexores do quadril trabalham isometricamente o tempo todo: com dor lombar ou lordose acentuada, prefira outra variação."},
  {se:["polia"], pad:["abdominal"], nota:"Escápulas deprimidas, cotovelos estendidos e ombros aduzidos: assim tríceps, peitoral e dorsal não entram no movimento. Girar no fim enfatiza o oblíquo externo do lado oposto."},
  {se:["maquina"], pad:["abdominal"], nota:"Com o quadril a 90°, reto femoral e iliopsoas não entram em insuficiência passiva; eles só seguram a pelve isometricamente. Pare quando a coluna terminar de flexionar."},
  {se:["solo"], pad:["abdominal"], nota:"Iniciantes: braços cruzados no peito. Para mais intensidade, segure a carga com os braços estendidos acima da cabeça, longe da coluna."},
  {se:["halteres","halter"], pad:["empurrar_h"], nota:"Com halteres a amplitude chega a ~90°, sem torque quando a carga fica sobre o ombro, e os estabilizadores trabalham mais (por isso a carga é menor). Antebraço sempre vertical."},
  {se:["maquina","peck"], pad:["empurrar_h","crucifixo"], nota:"Na máquina não há exigência de equilíbrio e o ângulo é predeterminado; em troca, o torque continua mesmo com o braço fechado."},
  {se:["inclinado"], pad:["empurrar_h","crucifixo"], nota:"Inclinar o banco desloca a ênfase para a porção clavicular do peitoral (ombro mais flexionado)."},
  {se:["declinado"], pad:["empurrar_h"], nota:"Declinar o banco desloca a ênfase para as fibras esternais e abdominais do peitoral."},
  {se:["nuca"], pad:["puxar_v"], nota:"Por trás da nuca, o ombro trabalha em abdução e rotação lateral extremas; faça só com mobilidade sobrando e carga moderada."},
  {se:["supinada","chin"], pad:["puxar_v"], nota:"A pegada supinada põe o bíceps em posição forte e aumenta a participação dele."},
  {se:["pronada","pendlay"], pad:["puxar_h"], nota:"Pegada pronada e cotovelos abertos transformam a extensão em abdução horizontal: mais deltoide posterior e adutores da escápula."},
  {se:["unilateral","kroc","meadows"], pad:["puxar_h"], nota:"Apoiado num banco: joelho da perna de apoio um pouco flexionado, ombros nivelados e cotovelo de apoio quase estendido para a lombar não rodar."},
  {se:["sentada","maquina","apoiada","cavalinho"], pad:["puxar_h"], nota:"Com o peito apoiado, a lombar fica protegida (a torácica não) e os extensores lombares trabalham bem menos."},
  {se:["leg press"], pad:["agachamento"], nota:"No leg press não há torque na coluna nem exigência de equilíbrio. Pés no alto da plataforma aumentam a amplitude do quadril; banco muito perto flexiona demais e retroverte a pelve."},
  {se:["hack","pendular","smith","cinto"], pad:["agachamento"], nota:"A trajetória guiada tira o equilíbrio do exercício e, com o tronco apoiado, quase zera o torque na lombar."},
  {se:["frontal","goblet","zercher"], pad:["agachamento"], nota:"Com a carga à frente, o tronco fica mais vertical: mais braço de momento no joelho (quadríceps) e menos na lombar."},
  {se:["sumo","cossaco"], nota:"A base aberta chama os adutores. Adutores curtos limitam a descida e empurram o joelho para dentro (valgo)."},
  {se:["sissy","nordico reverso","espanhol"], pad:["agachamento"], nota:"Com o quadril estendido, o reto femoral trabalha alongado na origem e o quadríceps inteiro carrega o joelho."},
  {se:["bulgaro","deficit","elevado"], pad:["afundo"], nota:"O pé de trás apoiado (ou a plataforma) aumenta a amplitude do quadril da frente e alonga o reto femoral da perna de trás."},
  {se:["sentada"], pad:["flexao_joelho"], nota:"Sentado, o quadril flexionado alonga os isquiotibiais na origem: melhor relação força-comprimento que na mesa flexora. Se o posterior for curto, a pelve retroverte; alongue antes."},
  {se:["mesa"], pad:["flexao_joelho"], nota:"Deitado, o quadril quase estendido deixa os isquiotibiais mais curtos: eles chegam à insuficiência ativa no fim da flexão, e o corpo tenta compensar arqueando a lombar. Na mesa reta isso é ainda maior."},
  {se:["nordico","glute ham"], pad:["flexao_joelho"], nota:"Cadeia fechada com o próprio corpo como carga: a fase excêntrica é a mais pesada, com o joelho quase estendido."},
  {se:["romeno","stiff","bom dia"], pad:["dobradica"], nota:"Joelhos quase estendidos: os isquiotibiais trabalham alongados no joelho, o que dá força e também limita a descida."},
  {se:["terra"], nao:["romeno"], pad:["dobradica"], mov:[MV("quadril","extensão","flexão","sagital"),MV("joelho","extensão","flexão","sagital"),ISO("coluna","mantém a curvatura neutra","sagital")], nota:"O joelho também estende: quadríceps entra no começo, glúteo e isquiotibiais terminam."},
  {se:["extensao lombar","hiperextensao 45"], pad:["dobradica"], mov:[MV("coluna","extensão","flexão","sagital"),MV("quadril","extensão","flexão","sagital")], nota:"A coluna estende a partir da flexão, não para a hiperextensão; pare com o corpo alinhado. Braços ao lado do corpo reduzem a intensidade para iniciantes."},
  {se:["jefferson"], pad:["dobradica"], mov:[MV("coluna","extensão","flexão","sagital"),MV("quadril","extensão","flexão","sagital")], nota:"Aqui a coluna flexiona de propósito, vértebra por vértebra: carga leve e progressão lenta."},
  {se:["hiperextensao reversa"], pad:["dobradica"], nota:"As pernas sobem com o tronco fixo; pare quando o quadril alinhar para não hiperestender a lombar."},
  {se:["coice"], pad:["ponte"], nota:"Em pé ou em quatro apoios, o joelho flexionado põe os isquiotibiais em insuficiência ativa e o glúteo máximo assume a extensão. O reto femoral, alongado, pode limitar o fim do movimento."},
  {se:["sentada"], pad:["panturrilha"], nota:"Com o joelho flexionado o gastrocnêmio fica em insuficiência ativa: o sóleo faz quase todo o trabalho. Barra ou apoio perto do joelho é mais eficiente."},
  {se:["leg press","smith","pe","burrinho","unilateral"], pad:["panturrilha"], nota:"Joelho estendido: gastrocnêmio e sóleo trabalham juntos."},
  {se:["scott"], pad:["rosca"], nota:"O apoio impede o ombro de ajudar. Na máquina o braço de momento fica quase constante; com peso livre, a carga perde torque no topo e ainda puxa o cotovelo na extensão completa (o cabo resolve)."},
  {se:["polia","cabo","corda"], pad:["rosca","triceps"], nota:"O cabo mantém torque nos pontos em que o peso livre zera (topo da rosca, extensão completa do tríceps) e muda a curva de tensão."},
  {se:["testa","frances","katana","jm press"], pad:["triceps"], nota:"Com o ombro mais flexionado, a cabeça longa começa alongada: melhor relação força-comprimento. Não deixe o ombro estender junto com o cotovelo."},
  {se:["coice"], pad:["triceps"], nota:"Com o ombro estendido, a cabeça longa já começa encurtada e chega à insuficiência ativa no fim; o cabo acrescenta uns 20° e mantém tensão com o braço vertical."}
];

/* estado dos biarticulares em cada exercício: primeiro ajuste que casa vale */
const BIARTIC = [
  /* isquiotibiais */
  {m:"isquiotibiais", se:["flexora sentada","sentada"], pad:["flexao_joelho"], estado:"alongado", txt:"Quadril flexionado: os isquiotibiais ficam alongados na origem e flexionam o joelho com melhor relação força-comprimento."},
  {m:"isquiotibiais", pad:["flexao_joelho"], estado:"encurtado", txt:"Quadril quase estendido: perto do fim da flexão os isquiotibiais chegam à insuficiência ativa (encurtados nas duas articulações)."},
  {m:"isquiotibiais", pad:["dobradica"], estado:"alongado", txt:"Joelho quase estendido: os isquiotibiais trabalham alongados no joelho enquanto estendem o quadril; o limite da descida é a insuficiência passiva deles."},
  {m:"isquiotibiais", pad:["ponte"], estado:"encurtado", txt:"Joelho flexionado: os isquiotibiais entram em insuficiência ativa e pouco estendem o quadril; o glúteo máximo assume."},
  {m:"isquiotibiais", pad:["agachamento","afundo"], estado:"concorrente", txt:"Encurtam no quadril enquanto alongam no joelho: o comprimento quase não muda e eles ajudam a estender o quadril sem fadigar como agonistas."},
  {m:"isquiotibiais", pad:["extensora"], estado:"alongado", txt:"Com o quadril a 90° e o joelho estendendo, os isquiotibiais podem limitar o fim da extensão por insuficiência passiva (encosto inclinado ajuda)."},
  {m:"isquiotibiais", pad:["puxar_h","ombro_isolado","empurrar_v"], estado:"alongado", txt:"Em pé ou inclinado com joelhos estendidos, isquiotibiais curtos retrovertem a pelve e tiram a lombar do neutro: flexione um pouco os joelhos."},
  /* reto femoral (quadríceps) */
  {m:"quadriceps-femoral", pad:["extensora"], estado:"encurtado", txt:"Quadril a 90°: o reto femoral está encurtado na origem e chega à insuficiência ativa nos últimos graus da extensão; os vastos terminam o movimento. Um encosto um pouco inclinado melhora isso."},
  {m:"quadriceps-femoral", se:["sissy","nordico reverso","espanhol"], estado:"alongado", txt:"Quadril estendido: o reto femoral trabalha alongado na origem e participa de verdade da extensão do joelho."},
  {m:"quadriceps-femoral", pad:["agachamento","afundo"], estado:"concorrente", txt:"Na subida o reto femoral alonga no quadril (que estende) e encurta no joelho (que também estende): o comprimento quase não muda, ele contribui pouco e os vastos fazem a maior parte."},
  {m:"quadriceps-femoral", pad:["flexao_joelho"], estado:"alongado", txt:"A flexão do joelho alonga o reto femoral, que puxa a pelve para anteversão no fim da flexão (insuficiência passiva): alongar o reto femoral ajuda."},
  {m:"quadriceps-femoral", pad:["ponte"], estado:"alongado", txt:"Com o joelho flexionado e o quadril estendendo, o reto femoral é alongado nas duas pontas e pode limitar a extensão do quadril (insuficiência passiva)."},
  /* gastrocnêmio */
  {m:"panturrilha", se:["sentada"], pad:["panturrilha"], estado:"encurtado", txt:"Joelho flexionado: o gastrocnêmio entra em insuficiência ativa e o sóleo, que só cruza o tornozelo, faz o trabalho."},
  {m:"panturrilha", pad:["panturrilha"], estado:"alongado", txt:"Joelho estendido: o gastrocnêmio fica alongado no joelho e trabalha junto com o sóleo; o pré-estiramento embaixo melhora a força."},
  {m:"panturrilha", pad:["tibial"], estado:"alongado", txt:"Com o joelho estendido, o gastrocnêmio limita a dorsiflexão (insuficiência passiva); flexione levemente o joelho."},
  {m:"panturrilha", pad:["agachamento","afundo"], estado:"alongado", txt:"No fundo, o gastrocnêmio curto trava a tíbia (insuficiência passiva) e obriga o tronco a inclinar mais."},
  {m:"panturrilha", pad:["flexao_joelho"], estado:"alongado", txt:"Com o pé puxado para cima (dorsiflexão), o gastrocnêmio fica alongado no tornozelo e ajuda a flexionar o joelho; com a ponta do pé esticada, ele sai do movimento."},
  /* bíceps (cabeça longa) */
  {m:"biceps-braquial", se:["inclinada","bayesiana","drag"], pad:["rosca"], estado:"alongado", txt:"Ombro estendido (braço atrás do tronco): a cabeça longa começa alongada e trabalha no comprimento mais forte."},
  {m:"biceps-braquial", se:["scott","spider","concentrada","polia alta"], pad:["rosca"], estado:"encurtado", txt:"Ombro flexionado (braço à frente): o bíceps já está encurtado no ombro e se aproxima da insuficiência ativa no topo; o braquial ganha participação."},
  {m:"biceps-braquial", pad:["rosca"], estado:"neutro", txt:"Ombro neutro, braço ao lado do corpo: comprimento intermediário da cabeça longa."},
  {m:"biceps-braquial", pad:["puxar_v","puxar_h"], estado:"concorrente", txt:"O ombro estende enquanto o cotovelo flexiona: a cabeça longa alonga numa ponta e encurta na outra. Pense no ombro para o bíceps não dominar."},
  /* tríceps (cabeça longa) */
  {m:"triceps-braquial", se:["testa","frances","corda alta","katana","jm press","cruzado"], pad:["triceps"], estado:"alongado", txt:"Ombro flexionado (braço acima da cabeça ou à frente): a cabeça longa trabalha alongada."},
  {m:"triceps-braquial", se:["coice"], pad:["triceps"], estado:"encurtado", txt:"Ombro estendido: a cabeça longa está encurtada nas duas articulações no fim, perto da insuficiência ativa."},
  {m:"triceps-braquial", pad:["triceps"], estado:"neutro", txt:"Braço ao lado do corpo: comprimento intermediário. Levar o cotovelo para trás durante o movimento aproxima a insuficiência ativa."},
  {m:"triceps-braquial", pad:["mergulho","empurrar_h"], estado:"concorrente", txt:"O ombro flexiona (alongando a cabeça longa) enquanto o cotovelo estende (encurtando): comprimento quase constante."},
  {m:"triceps-braquial", pad:["puxar_h","puxar_v","pullover"], estado:"concorrente", txt:"Ajuda a estender o ombro enquanto o cotovelo flexiona: trabalha como sinergista com comprimento quase constante."},
  /* grácil */
  {m:"adutores", pad:["aducao"], estado:"alongado", txt:"Com o joelho estendido, o grácil participa da adução; a abertura máxima é limitada pela insuficiência passiva dos adutores."}
];

/* ---------- utilitários ---------- */
const ehPlural = nm => /^(isquiotibiais|eretores|adutores|extensores|flexores|oblíquos|romboides|braquial e)/i.test(nm);
const JUNTA_NOMES = {quadril:"quadril", joelho:"joelho", tornozelo:"tornozelo", ombro:"ombro", cotovelo:"cotovelo", escapula:"escápula", "escápula":"escápula", coluna:"coluna", pelve:"pelve", radioulnar:"antebraço", punho:"punho"};
const chaveJunta = a => { const n = normNome(a).split(" ")[0]; return n==="escapula" ? "escapula" : n; };
const casaRegra = (r, n, k) => (!r.pad || r.pad.includes(k)) && (!r.se || r.se.some(s=>n.includes(s))) && !(r.nao && r.nao.some(s=>n.includes(s)));
const daJunta = a => /^(escápula|escapula|coluna|pelve)/.test(a) ? "da" : "do";
function textoAcao(acao, a){ return `${acao} ${daJunta(a)} ${JUNTA_NOMES[chaveJunta(a)] || a}`; }

/* o que cada músculo faz quando só estabiliza */
const ESTAB_TXT = {"eretores-espinha":"segura a coluna neutra contra a flexão","reto-abdominal":"trava o tronco (pressão intra-abdominal) e segura a pelve","obliquos":"impede a rotação e a inclinação do tronco",
  "gluteo-medio":"mantém a pelve nivelada e o joelho alinhado","adutores":"estabilizam o quadril no plano frontal","trapezio":"fixa a escápula","romboides":"mantêm as escápulas aduzidas",
  "deltoide-posterior":"estabiliza o ombro por trás","grande-dorsal":"mantém a carga rente ao corpo e o ombro estável","isquiotibiais":"seguram a pelve contra a anteversão","gluteo-maximo":"segura a pelve contra a anteversão",
  "flexores-punho":"seguram o punho firme na pegada","biceps-braquial":"protege o cotovelo semiflexionado","triceps-braquial":"estabiliza o cotovelo","deltoide-anterior":"mantém o braço fixo à frente",
  "quadriceps-femoral":"mantém o joelho firme","tibial-anterior":"equilibra o tornozelo","panturrilha":"equilibra o tornozelo"};

/* ---------- análise de um exercício ---------- */
const _cacheAnalise = new Map();
function analiseCinesiologica(ex){
  if(!ex) return null;
  const chave = ex.id + "|" + ex.nome + "|" + ex.grupo + "|" + JSON.stringify(ex.juntas||[]);
  if(_cacheAnalise.has(chave)) return _cacheAnalise.get(chave);
  const k = padraoMovimento(ex), B = BIOMEC[k], P = PADROES[k]; if(!B || !P) return null;
  const n = normNome(ex.nome + " " + ex.id);
  const ajustes = AJUSTES_BIOMEC.filter(r=>casaRegra(r, n, k));
  const mov = (ajustes.find(r=>r.mov)||{}).mov || B.mov;
  const musc = identificarMusculos(ex), pf = perfil(ex), regiao = pf ? pf.regiao : null;
  const nomeM = id => (MUSCULOS[id]||{nome:id}).nome;

  /* movimentos com plano, eixo e amplitude de referência */
  const movimentos = mov.map(m=>{ const j = ARTICULACOES[chaveJunta(m.a)];
    return {articulacao:m.a, conc:m.c||null, exc:m.e||null, iso:m.iso||null, plano:m.p, eixo:eixoDoPlano(m.p),
      amplitude: j && m.c ? [[m.e, j.amp[m.e]],[m.c, j.amp[m.c]]].filter(([,v])=>v).map(([a,v])=>`${a} ${v}`).join(" · ") || null : null}; });

  /* ação de um músculo neste exercício: a ação concêntrica dele que casa com o movimento */
  function acaoDe(id){
    const art = (GRUPOS_ANAT[id]||{}).art || {};
    const din = mov.filter(m=>m.c && (art[chaveJunta(m.a)]||[]).includes(m.c));
    if(din.length) return {tipo:"dinamica", m:din[0], txt:din.map(m=>textoAcao(m.c, m.a)).join(" e ")};
    for(const m of mov){ if(m.iso && art[chaveJunta(m.a)]) return {tipo:"iso", m, txt:`${m.iso} (${JUNTA_NOMES[chaveJunta(m.a)]||m.a})`}; }
    return null;
  }
  const biDe = id => { const r = BIARTIC.find(b=>b.m===id && casaRegra(b, n, k)); return r ? {estado:r.estado, txt:r.txt} : null; };
  const musculos = [], vistos = new Set();
  const add = (id, papel) => { if(vistos.has(id) || !MUSCULOS[id]) return; vistos.add(id);
    const G = GRUPOS_ANAT[id] || {}, a = acaoDe(id), bi = G.bi ? biDe(id) : null;
    let acao, contracao, comprimento;
    if(papel==="antagonista"){
      const op = mov.find(m=>m.e && (G.art[chaveJunta(m.a)]||[]).includes(m.e));
      acao = op ? `ação contrária: ${textoAcao(op.e, op.a)}` : "lado oposto da articulação"; contracao = "relaxa e alonga na concêntrica; ajuda a frear e a estabilizar (co-contração)"; comprimento = "alonga enquanto o agonista encurta";
    } else if(a && a.tipo==="dinamica" && papel!=="estabilizador"){
      acao = a.txt; contracao = `concêntrica na ${a.m.c}, excêntrica na ${a.m.e}`;
      comprimento = `mais alongado na ${a.m.e}, mais encurtado no fim da ${a.m.c}`;
    } else if(a){
      acao = a.tipo==="iso" ? a.txt : `segura ${a.txt}`; contracao = "isométrica (estabiliza)"; comprimento = "comprimento quase constante";
    } else if(ESTAB_TXT[id] && papel!=="agonista"){
      acao = ESTAB_TXT[id]; contracao = "isométrica (estabiliza)"; comprimento = "comprimento quase constante";
    } else {
      const j0 = Object.entries(G.art||{})[0];
      acao = papel==="estabilizador" ? (ESTAB_TXT[id] || "estabiliza a postura") : j0 ? `${j0[1][0]} ${daJunta(j0[0])} ${JUNTA_NOMES[j0[0]]||j0[0]} (auxiliar)` : "auxiliar";
      contracao = "isométrica (estabiliza)"; comprimento = "comprimento quase constante";
    }
    if(bi) comprimento = bi.txt;
    musculos.push({id, nome:nomeM(id), papel, acao, contracao, comprimento, biarticular:!!G.bi, componentes:(G.comp||[]).map(c=>ANAT[c].nome)});
  };
  musc.primarios.forEach(id=>add(id,"agonista"));
  musc.secundarios.forEach(id=>add(id,"sinergista"));
  (B.estab||[]).forEach(id=>add(id,"estabilizador"));
  const antag = new Set(); musc.primarios.forEach(id=>((GRUPOS_ANAT[id]||{}).antag||[]).forEach(x=>antag.add(x)));
  const opoe = id => mov.some(m=>m.e && ((GRUPOS_ANAT[id]||{}).art||{})[chaveJunta(m.a)] && GRUPOS_ANAT[id].art[chaveJunta(m.a)].includes(m.e));
  [...antag].filter(id=>!vistos.has(id) && opoe(id)).slice(0,3).forEach(id=>add(id,"antagonista"));

  /* biarticulares relevantes (agonistas, sinergistas e quem limita a amplitude) */
  const biarticulares = [];
  Object.entries(GRUPOS_ANAT).forEach(([id,G])=>{ if(!G.bi) return; const b = biDe(id); if(!b) return;
    if(!vistos.has(id) && b.estado==="concorrente") return;
    biarticulares.push({id, nome:G.bi.nome, juntas:G.bi.juntas, estado:b.estado, txt:b.txt}); });

  /* torque externo (curva do app) × relação força-comprimento dos agonistas */
  const agL = musculos.filter(m=>m.papel==="agonista").map(m=>m.nome.split(" (")[0]);
  const pl = agL.length>1 || agL.some(ehPlural), sfx = pl ? "s" : "";
  const agon = agL.map(nm=>(ehPlural(nm)?"os ":"o ") + nm.charAt(0).toLowerCase() + nm.slice(1)).join(" e ") || "o músculo";
  const m0 = mov.find(m=>m.c), fase = m0 ? textoAcao(m0.c, m0.a) : "";
  const torqueTxt = !regiao ? "" : regiao==="alongado"
    ? `A carga pesa mais com ${agon} alongado${sfx}${fase?`, no começo da ${fase}`:""}. É onde a tensão total do músculo é maior (fibras e tecido elástico somam, até cerca de 120–130% do comprimento de repouso): o pico do exercício coincide com o ponto forte do músculo.`
    : regiao==="encurtado"
    ? `A carga pesa mais com ${agon} encurtado${sfx}${fase?`, no fim da ${fase}`:""}, onde a sobreposição dos filamentos já passou do ótimo. É o trecho em que a insuficiência ativa aparece: controle o topo e não use embalo para chegar lá.`
    : `O pico fica no meio do arco, perto do comprimento de repouso, onde actina e miosina se sobrepõem melhor: velocidade constante sem acelerar no ponto difícil.`;
  const momentos = musc.primarios.map(id=>(GRUPOS_ANAT[id]||{}).momento).filter(Boolean);

  /* cadeias musculares */
  const idsAtivos = musculos.filter(m=>m.papel==="agonista"||m.papel==="sinergista").map(m=>m.id);
  const myers = Object.entries(CADEIAS_MYERS).map(([kk,c])=>({id:kk, ...c, membros:c.ids.filter(i=>idsAtivos.includes(i))}))
    .filter(c=>c.membros.length).sort((a,b)=>b.membros.length-a.membros.length).slice(0,3)
    .map(c=>({id:c.id, nome:c.nome, funcao:c.funcao, compensacao:c.compensacao, membros:c.membros.map(i=>nomeM(i).split(" (")[0])}));
  const souchard = (B.souchard||[]).map(s=>CADEIAS_SOUCHARD[s]).filter(Boolean);
  const gds = B.gds ? CADEIAS_GDS[B.gds] : null;

  const notas = ajustes.map(r=>r.nota).filter(Boolean);
  const anatomia = musc.primarios.flatMap(id=>((GRUPOS_ANAT[id]||{}).comp||[]).map(c=>ANAT[c])).filter(Boolean);
  const cad = P.cadeia;
  const cadeiaTxt = /fechada/.test(cad) && !/aberta/.test(cad)
    ? "Cadeia cinética fechada: a extremidade (pés ou mãos) fica fixa e o corpo se move em relação a ela; as articulações se movem juntas e a intenção decide qual músculo lidera."
    : /aberta/.test(cad) && !/fechada/.test(cad)
    ? "Cadeia cinética aberta: a extremidade se move livre no espaço; a origem do músculo fica fixa e a inserção se aproxima dela."
    : "Pode ser feito em cadeia aberta (máquina, polia) ou fechada (barra fixa): os mesmos músculos, com a extremidade livre ou fixa.";
  const res = {padrao:k, nome:P.nome, cadeia:{tipo:cad, txt:cadeiaTxt}, movimentos, alavanca:B.alavanca, bm:B.bm, transl:B.transl, foco:B.foco,
    musculos, biarticulares, torque:{regiao, txt:torqueTxt, momentos}, cadeias:{myers, souchard, gds},
    seguranca:[...notas, ...(B.seguranca||[])], anatomia, fontes:Object.values(FONTES_CINESIO).map(f=>f.ref)};
  _cacheAnalise.set(chave, res);
  return res;
}

/* ---------- análise de um grupo da biblioteca ou de um músculo ---------- */
const NOMES_ESTADO = {alongado:"alongado", encurtado:"encurtado", concorrente:"comprimento quase constante", neutro:"comprimento intermediário"};
const _cacheGrupo = new Map();
function analiseGrupo(chave){
  const L = lib(), ck = chave + "|" + L.length;
  if(_cacheGrupo.has(ck)) return _cacheGrupo.get(ck);
  const r = _analiseGrupo(chave, L); _cacheGrupo.set(ck, r); return r;
}
function _analiseGrupo(chave, L){
  const ehMusc = !!MUSCULOS[chave];
  const exs = ehMusc ? L.filter(e=>identificarMusculos(e).primarios.includes(chave)) : L.filter(e=>e.grupo===chave);
  if(!exs.length && !ehMusc) return null;
  /* músculos do grupo: os primários que mais aparecem */
  let ids;
  if(ehMusc) ids = [chave];
  else { const cont = {}; exs.forEach(e=>identificarMusculos(e).primarios.forEach(m=>cont[m]=(cont[m]||0)+1));
    ids = Object.entries(cont).sort((a,b)=>b[1]-a[1]).map(([m])=>m).filter((m,i)=>i<4 && (i===0 || cont[m]>=2)); }
  const an = new Map(exs.map(e=>[e.id, analiseCinesiologica(e)]));
  const nota = e => (avaliar(e)||{nota:0}).nota;
  const melhor = l => l.slice().sort((a,b)=>nota(b)-nota(a))[0];

  const musculos = ids.map(id=>{
    const G = GRUPOS_ANAT[id] || {}, M = MUSCULOS[id];
    const acoes = [];
    Object.entries(G.art||{}).forEach(([j,lista])=>lista.forEach(acao=>{
      const alvo = textoAcao(acao, j);
      const usa = e => { const a = analiseCinesiologica(e); return a && a.musculos.some(m=>m.id===id && (m.papel==="agonista"||m.papel==="sinergista") && m.acao.split(" e ").includes(alvo)); };
      const usam = exs.filter(usa), fora = L.filter(e=>!exs.includes(e) && usa(e));
      const ref = ARTICULACOES[j];
      acoes.push({articulacao:JUNTA_NOMES[j]||j, acao, texto:alvo, amplitude: ref ? ref.amp[acao]||null : null, exercicios:usam.length, fora:fora.length,
        exemplo: usam.length ? melhor(usam).nome : fora.length ? melhor(fora).nome : null});
    }));
    /* comprimento em que o biarticular trabalha nos exercícios */
    let comprimentos = null;
    if(G.bi){ const c = {}; exs.forEach(e=>{ const b = (an.get(e.id)||{biarticulares:[]}).biarticulares.find(x=>x.id===id); if(b) (c[b.estado] = c[b.estado]||[]).push(e); });
      comprimentos = Object.entries(c).map(([estado,l])=>({estado, nome:NOMES_ESTADO[estado]||estado, exercicios:l.length, exemplo:melhor(l).nome})); }
    /* onde ele aparece como sinergista fora do grupo */
    const sinergia = {}; L.forEach(e=>{ if(e.grupo===(ehMusc?null:chave)) return; const m = identificarMusculos(e); if(m.secundarios.includes(id)) sinergia[e.grupo]=(sinergia[e.grupo]||0)+1; });
    return {id, nome:M.nome, funcao:M.funcao, nota:G.nota||"", momento:G.momento||"",
      componentes:(G.comp||[]).map(c=>ANAT[c]).filter(Boolean),
      acoes, bi:G.bi||null, comprimentos,
      antagonistas:(G.antag||[]).map(a=>(MUSCULOS[a]||{nome:a}).nome),
      myers:(G.myers||cadeiasDoMusculo(id)).map(c=>CADEIAS_MYERS[c]).filter(Boolean),
      souchard:(G.souchard||[]).map(s=>CADEIAS_SOUCHARD[s]).filter(Boolean),
      gds: G.gds ? CADEIAS_GDS[G.gds] : null,
      sinergia:Object.entries(sinergia).sort((a,b)=>b[1]-a[1]).map(([g,q])=>({grupo:g, exercicios:q}))};
  });

  /* cobertura do grupo: padrões, região do pico, cadeia cinética */
  const conta = f => { const c = {}; exs.forEach(e=>{ const v = f(e); if(v) c[v]=(c[v]||0)+1; }); return c; };
  const porPadrao = Object.entries(conta(e=>(an.get(e.id)||{}).nome)).sort((a,b)=>b[1]-a[1]).map(([nome,q])=>({nome, exercicios:q}));
  const porRegiao = {alongado:0, meio:0, encurtado:0}; exs.forEach(e=>{ const p = perfil(e); if(p) porRegiao[p.regiao]++; });
  const porCadeia = conta(e=>{ const t = PADROES[(an.get(e.id)||{}).padrao]; return t ? (t.cadeia.includes("ou") ? "aberta ou fechada" : t.cadeia) : null; });

  /* recomendação: um exercício por pico de torque + um para cada ação ainda sem exemplo forte */
  const recomendacao = [];
  for(const r of ["alongado","encurtado","meio"]){ const l = exs.filter(e=>{ const p = perfil(e); return p && p.regiao===r; });
    if(l.length){ const b = melhor(l); recomendacao.push({id:b.id, nome:b.nome, motivo: r==="meio" ? "pico no meio do arco" : `pico com o músculo ${r}`}); } }
  musculos.forEach(m=>{ if(!m.comprimentos) return; m.comprimentos.forEach(c=>{ if(c.estado!=="alongado" && c.estado!=="encurtado") return;
    const ex = exs.find(e=>e.nome===c.exemplo); if(ex && !recomendacao.some(r=>r.id===ex.id)) recomendacao.push({id:ex.id, nome:ex.nome, motivo:`${m.bi.nome} em posição ${c.estado==="alongado"?"alongada":"encurtada"} nas duas articulações`}); }); });
  const lacunas = [];
  musculos.forEach(m=>m.acoes.forEach(a=>{ if(!a.exercicios && !a.fora && a.articulacao!=="pelve") lacunas.push(`${a.texto} (${m.nome.split(" (")[0]})`); }));
  if(!porRegiao.alongado && exs.length) lacunas.push("nenhum exercício com pico no músculo alongado");
  if(!porRegiao.encurtado && exs.length) lacunas.push("nenhum exercício com pico no músculo encurtado");

  /* resumo de como o grupo move o corpo */
  const principal = musculos[0];
  const juntas = principal ? [...new Set(principal.acoes.map(a=>a.articulacao).filter(j=>j!=="pelve"))] : [];
  const plural = ehPlural;
  const na = j => (["escápula","coluna","pelve"].includes(j) ? "na " : "no ") + j;
  const resumo = principal ? `${principal.nome} ${plural(principal.nome)?"atuam":"atua"} ${juntas.length>1?"em "+juntas.length+" articulações ("+juntas.join(", ")+")":na(juntas[0]||"corpo")}: ${principal.acoes.map(a=>a.texto).slice(0,5).join(", ")}.`
    + (principal.bi ? ` Por cruzar ${principal.bi.juntas.join(" e ")}, a posição de uma articulação muda a força na outra: ${principal.bi.nome} ${plural(principal.bi.nome)?"ficam alongados":"fica em posição alongada"} com ${principal.bi.alonga} e ${plural(principal.bi.nome)?"encurtados":"encurtada"} com ${principal.bi.encurta}.` : "")
    + (principal.sinergia.length ? ` ${ehMusc?"Também":"Fora do grupo,"} ${plural(principal.nome)?"ajudam":"ajuda"} como sinergista${plural(principal.nome)?"s":""} em ${principal.sinergia.slice(0,3).map(s=>`${s.exercicios} de ${s.grupo}`).join(", ")}.` : "") : "";
  return {chave, titulo: ehMusc ? MUSCULOS[chave].nome : chave, ehMusculo:ehMusc, total:exs.length, resumo, musculos, porPadrao, porRegiao, porCadeia,
    recomendacao:recomendacao.slice(0,5), lacunas, fatores:FATORES_COMPENSACAO, principios:PRINCIPIOS_CADEIAS,
    fontes:Object.values(FONTES_CINESIO).map(f=>f.ref)};
}
