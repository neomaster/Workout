/* =====================================================================
   MODELO CINESIOLÓGICO
   Para cada exercício: padrão de movimento, ações articulares e planos,
   tipo de cadeia, papel de cada músculo, amplitude, cadência sugerida pela
   curva de torque, execução passo a passo e erros comuns. O mesmo modelo
   diz qual ângulo acompanhar num vídeo e o que se espera dele.
   Tudo por regra a partir dos dados do exercício (nome, grupo, alavanca),
   não por texto fixo por exercício.
   ===================================================================== */

/* ângulos que o analisador de vídeo sabe medir (articulação entre três pontos do corpo)
   aberto = maior valor do ângulo; a "concêntrica" diz se o ângulo abre ou fecha ao vencer a carga */
const ANGULOS_POSE = {
  joelho:   {nome:"joelho",   pontos:[[23,25,27],[24,26,28]], desc:"quadril–joelho–tornozelo"},
  quadril:  {nome:"quadril",  pontos:[[11,23,25],[12,24,26]], desc:"ombro–quadril–joelho"},
  cotovelo: {nome:"cotovelo", pontos:[[11,13,15],[12,14,16]], desc:"ombro–cotovelo–punho"},
  ombro:    {nome:"ombro",    pontos:[[23,11,13],[24,12,14]], desc:"quadril–ombro–cotovelo"},
  tornozelo:{nome:"tornozelo",pontos:[[25,27,31],[26,28,32]], desc:"joelho–tornozelo–ponta do pé"}
};

/* padrões de movimento: o que se reconhece pelo nome e pelo grupo */
const PADROES = {
  agachamento:{nome:"Agachamento", cadeia:"fechada",
    acoes:[["Quadril","flexão → extensão","sagital"],["Joelho","flexão → extensão","sagital"],["Tornozelo","dorsiflexão → flexão plantar","sagital"]],
    estab:["eretores da espinha","abdômen (bracing)","glúteo médio (joelho alinhado)"],
    pose:{angulo:"joelho", concentrica:"abre", inicio:"max", alvoMin:95, alvoMax:165, vista:"de lado"},
    passos:["Pés na largura dos ombros ou um pouco mais, pontas levemente para fora.","Inspire e trave o abdômen antes de descer.","Desça levando quadril para trás e joelhos para a frente ao mesmo tempo, joelhos na direção da ponta dos pés.","Vá até onde a coluna continua neutra; para o quadríceps, coxa pelo menos paralela ao chão.","Suba empurrando o chão com o pé inteiro, quadril e ombros subindo juntos."],
    erros:[["Joelhos caindo para dentro","Empurre os joelhos para fora, na linha do segundo dedo do pé."],["Calcanhar saindo do chão","Abra um pouco a base ou use calço; mantenha o peso no meio do pé."],["Lombar arredondando no fundo","Pare a descida antes desse ponto e trabalhe mobilidade de quadril e tornozelo."],["Quadril subindo antes dos ombros","Pense em subir o peito junto; reduza a carga."]]},
  afundo:{nome:"Afundo / unilateral de pernas", cadeia:"fechada",
    acoes:[["Quadril","flexão → extensão","sagital"],["Joelho","flexão → extensão","sagital"],["Quadril (perna de apoio)","estabilização contra adução","frontal"]],
    estab:["glúteo médio","abdômen e oblíquos","adutores"],
    pose:{angulo:"joelho", concentrica:"abre", inicio:"max", alvoMin:95, alvoMax:165, vista:"de lado"},
    passos:["Base em trilho, não em linha única: os pés afastados na largura do quadril.","Desça na vertical, tronco levemente inclinado à frente para mais glúteo, mais ereto para mais quadríceps.","Joelho da frente acompanha a ponta do pé; o de trás quase encosta no chão.","Suba empurrando com a perna da frente, sem impulsionar com a de trás."],
    erros:[["Joelho da frente desabando para dentro","Pense em abrir o joelho; reduza a carga até controlar."],["Empurrar com a perna de trás","Coloque o peso no calcanhar e no meio do pé da frente."],["Passo curto demais","O joelho de trás deve descer sob o quadril, não atrás dele."]]},
  extensora:{nome:"Extensão de joelho", cadeia:"aberta",
    acoes:[["Joelho","flexão → extensão","sagital"]], estab:["segure as alças: quadril colado ao banco"],
    pose:{angulo:"joelho", concentrica:"abre", inicio:"min", alvoMin:80, alvoMax:170, vista:"de lado"},
    passos:["Eixo da máquina alinhado ao joelho; rolo acima do tornozelo.","Estenda até quase travar, sem chutar.","Desça controlando até o joelho dobrar bem, onde o reto femoral fica mais alongado."],
    erros:[["Quadril saindo do banco","Segure as alças e reduza a carga."],["Usar embalo","Pause 1 s em cima e desça em 2–3 s."]]},
  flexao_joelho:{nome:"Flexão de joelho", cadeia:"aberta",
    acoes:[["Joelho","extensão → flexão","sagital"]], estab:["glúteo e abdômen fixando a pelve"],
    pose:{angulo:"joelho", concentrica:"fecha", inicio:"max", alvoMin:60, alvoMax:170, vista:"de lado"},
    passos:["Eixo alinhado ao joelho, rolo logo acima do calcanhar.","Flexione puxando o calcanhar em direção ao glúteo, quadril parado.","Volte até quase estender, sem deixar a carga bater."],
    erros:[["Quadril levantando do banco","Contraia o glúteo contra o banco; menos carga."],["Amplitude curta no fim","Estenda quase por completo: é onde o isquiotibial está alongado."]]},
  dobradica:{nome:"Dobradiça de quadril", cadeia:"fechada",
    acoes:[["Quadril","flexão → extensão","sagital"],["Coluna","mantida neutra (isometria)","sagital"]],
    estab:["eretores da espinha","grande dorsal (barra perto do corpo)","abdômen"],
    pose:{angulo:"quadril", concentrica:"abre", inicio:"max", alvoMin:95, alvoMax:170, vista:"de lado"},
    passos:["Joelhos levemente flexionados e fixos.","Leve o quadril para trás como quem fecha uma porta com o bumbum.","Carga desliza rente às coxas; coluna neutra durante toda a descida.","Desça até sentir o posterior alongar sem a lombar arredondar.","Suba empurrando o quadril à frente, sem hiperestender a lombar no topo."],
    erros:[["Lombar arredondando","Encurte a descida e mantenha o peito aberto."],["Agachar em vez de dobrar","O joelho quase não muda: o movimento é do quadril."],["Barra longe do corpo","Puxe a barra contra as coxas ativando o dorsal."]]},
  ponte:{nome:"Extensão de quadril em ponte", cadeia:"fechada",
    acoes:[["Quadril","flexão → extensão","sagital"]], estab:["abdômen (costelas para baixo)","isquiotibiais"],
    pose:{angulo:"quadril", concentrica:"abre", inicio:"min", alvoMin:100, alvoMax:175, vista:"de lado"},
    passos:["Canelas verticais no topo do movimento; queixo levemente recolhido.","Suba empurrando pelos calcanhares até o quadril alinhar com o tronco.","Segure 1 s contraindo o glúteo, com as costelas para baixo.","Desça controlando, sem apoiar a carga entre as repetições."],
    erros:[["Arquear a lombar no topo","Pare quando quadril e tronco alinharem; retroverta a pelve."],["Pés longe demais","Ajuste até a canela ficar vertical em cima."]]},
  abducao:{nome:"Abdução de quadril", cadeia:"aberta",
    acoes:[["Quadril","adução → abdução","frontal"]], estab:["abdômen"], pose:null,
    passos:["Tronco levemente inclinado à frente para mais glúteo médio e máximo superior.","Abra até o limite sem a pelve girar.","Volte devagar, sem deixar o peso encostar."],
    erros:[["Balançar o tronco","Segure as alças e reduza a carga."]]},
  aducao:{nome:"Adução de quadril", cadeia:"aberta",
    acoes:[["Quadril","abdução → adução","frontal"]], estab:["abdômen"], pose:null,
    passos:["Comece com as pernas o mais abertas que der sem dor.","Feche controlando; o trabalho maior é com as pernas abertas.","Volte devagar até o alongamento."],
    erros:[["Amplitude curta na abertura","É ali que o adutor trabalha mais: use toda a abertura confortável."]]},
  empurrar_h:{nome:"Empurrar na horizontal", cadeia:"aberta",
    acoes:[["Ombro","extensão horizontal → flexão horizontal","transversal"],["Cotovelo","flexão → extensão","sagital"],["Escápula","retraída e deprimida (estabilização)","—"]],
    estab:["romboides e trapézio médio (escápulas fixas)","manguito rotador"],
    pose:{angulo:"cotovelo", concentrica:"abre", inicio:"max", alvoMin:80, alvoMax:165, vista:"de lado"},
    passos:["Escápulas juntas e para baixo, peito alto, pés firmes.","Cotovelos a 45–70° do tronco, não abertos a 90°.","Desça até a barra ou os halteres chegarem perto do peito, sob controle.","Empurre para cima e um pouco para trás, sem perder a posição das escápulas."],
    erros:[["Cotovelos a 90° do tronco","Feche para 45–70°: protege o ombro."],["Quicar no peito","Encoste de leve e pause meio segundo."],["Escápulas soltando no topo","Pare antes de protrair o ombro."]]},
  crucifixo:{nome:"Adução horizontal do ombro", cadeia:"aberta",
    acoes:[["Ombro","abdução horizontal → adução horizontal","transversal"],["Cotovelo","levemente flexionado e fixo","—"]],
    estab:["manguito rotador","escápulas retraídas"],
    pose:null,
    passos:["Cotovelos levemente dobrados e fixos durante toda a série.","Abra os braços em arco até sentir o peitoral alongar, sem passar da linha do ombro.","Feche como quem abraça uma árvore."],
    erros:[["Dobrar e esticar o cotovelo","Isso vira supino: mantenha o ângulo fixo."],["Descer além do ombro","Pare no alongamento confortável."]]},
  empurrar_v:{nome:"Empurrar na vertical", cadeia:"aberta",
    acoes:[["Ombro","flexão/abdução","sagital e frontal"],["Cotovelo","flexão → extensão","sagital"],["Escápula","rotação superior","frontal"]],
    estab:["abdômen e glúteos","trapézio superior e serrátil"],
    pose:{angulo:"cotovelo", concentrica:"abre", inicio:"min", alvoMin:75, alvoMax:165, vista:"de lado"},
    passos:["Glúteos e abdômen contraídos; costelas para baixo.","Antebraços verticais na posição de baixo.","Empurre em linha reta, levando a cabeça para a frente da barra quando ela passa.","Termine com a carga sobre o meio do pé."],
    erros:[["Arquear a lombar","Contraia o glúteo e o abdômen; reduza a carga."],["Barra longe da linha do corpo","Leve a barra rente ao rosto."]]},
  puxar_v:{nome:"Puxar na vertical", cadeia:"fechada ou aberta",
    acoes:[["Ombro","flexão/abdução → extensão/adução","sagital e frontal"],["Cotovelo","extensão → flexão","sagital"],["Escápula","elevação → depressão e retração","frontal"]],
    estab:["abdômen","manguito rotador"],
    pose:{angulo:"cotovelo", concentrica:"fecha", inicio:"max", alvoMin:60, alvoMax:165, vista:"de frente"},
    passos:["Comece com os braços estendidos e os ombros subindo: é o alongamento do dorsal.","Inicie descendo as escápulas, depois puxe os cotovelos para baixo e para os lados do tronco.","Leve o peito em direção à barra, sem balançar.","Volte até o alongamento completo, controlando."],
    erros:[["Balanço do tronco","Pausa no alongamento e menos carga."],["Puxar só com o braço","Pense em levar o cotovelo ao bolso."],["Meia repetição em cima","Estenda os braços por completo entre as repetições."]]},
  puxar_h:{nome:"Puxar na horizontal", cadeia:"aberta",
    acoes:[["Ombro","flexão → extensão","sagital"],["Cotovelo","extensão → flexão","sagital"],["Escápula","protração → retração","transversal"]],
    estab:["eretores da espinha","abdômen"],
    pose:{angulo:"cotovelo", concentrica:"fecha", inicio:"max", alvoMin:65, alvoMax:165, vista:"de lado"},
    passos:["Tronco firme na inclinação escolhida, coluna neutra.","Deixe as escápulas abrirem na frente: é o alongamento.","Puxe o cotovelo para trás junto ao corpo até a mão chegar perto do abdômen.","Aperte as escápulas por um instante e volte controlando."],
    erros:[["Usar o tronco para puxar","Apoie o peito ou reduza a carga."],["Encolher os ombros","Ombros longe das orelhas durante a puxada."]]},
  pullover:{nome:"Extensão de ombro com braço estendido", cadeia:"aberta",
    acoes:[["Ombro","flexão → extensão","sagital"],["Cotovelo","fixo, quase estendido","—"]],
    estab:["abdômen (costelas para baixo)"],
    pose:{angulo:"ombro", concentrica:"fecha", inicio:"max", alvoMin:20, alvoMax:150, vista:"de lado"},
    passos:["Cotovelos levemente dobrados e fixos.","Leve os braços acima da cabeça até o dorsal alongar, sem arquear as costas.","Traga os braços de volta até a linha do quadril."],
    erros:[["Arquear a lombar no alongamento","Costelas para baixo; limite a amplitude."],["Dobrar o cotovelo","Isso vira tríceps: mantenha fixo."]]},
  ombro_isolado:{nome:"Elevação do braço (ombro isolado)", cadeia:"aberta",
    acoes:[["Ombro","adução → abdução (ou flexão)","frontal ou sagital"],["Escápula","rotação superior","frontal"]],
    estab:["trapézio (sem encolher)","abdômen"],
    pose:{angulo:"ombro", concentrica:"abre", inicio:"min", alvoMin:15, alvoMax:95, vista:"de frente"},
    passos:["Cotovelo levemente dobrado e fixo; leve inclinação do tronco à frente.","Eleve o braço conduzindo pelo cotovelo até a altura do ombro.","Desça em 2–3 s sem deixar o peso descansar ao lado do corpo."],
    erros:[["Encolher o trapézio","Ombro longe da orelha; pare na linha do ombro."],["Embalo do tronco","Menos carga, mais controle."]]},
  posterior_ombro:{nome:"Abdução horizontal (deltoide posterior)", cadeia:"aberta",
    acoes:[["Ombro","adução horizontal → abdução horizontal","transversal"]], estab:["romboides","trapézio médio"],
    pose:{angulo:"ombro", concentrica:"abre", inicio:"min", alvoMin:30, alvoMax:100, vista:"de frente"},
    passos:["Braços quase estendidos, polegares levemente para baixo ou neutros.","Abra os braços para trás em arco, sem juntar demais as escápulas.","Volte até os braços se cruzarem à frente."],
    erros:[["Puxar com as costas","Pense em levar as mãos para longe, não para trás."]]},
  rosca:{nome:"Flexão de cotovelo", cadeia:"aberta",
    acoes:[["Cotovelo","extensão → flexão","sagital"],["Antebraço","supinação (pegada supinada)","transversal"]],
    estab:["deltoide anterior (cotovelo fixo)","abdômen e glúteos"],
    pose:{angulo:"cotovelo", concentrica:"fecha", inicio:"max", alvoMin:45, alvoMax:160, vista:"de lado"},
    passos:["Cotovelos fixos ao lado do corpo (ou atrás dele, para mais alongamento).","Suba sem levar o cotovelo à frente.","Desça até quase estender o braço, em 2–3 s."],
    erros:[["Balançar o tronco","Encoste as costas numa parede ou reduza a carga."],["Cotovelo avançando no topo","Pare quando o antebraço chegar perto da vertical."],["Não estender embaixo","Estenda: é onde o bíceps está mais alongado."]]},
  triceps:{nome:"Extensão de cotovelo", cadeia:"aberta",
    acoes:[["Cotovelo","flexão → extensão","sagital"]], estab:["ombro fixo","abdômen"],
    pose:{angulo:"cotovelo", concentrica:"abre", inicio:"min", alvoMin:55, alvoMax:170, vista:"de lado"},
    passos:["Braço fixo na posição escolhida; só o antebraço se move.","Estenda até travar sem bater a articulação.","Volte até o cotovelo dobrar bem; acima da cabeça, a cabeça longa do tríceps fica mais alongada."],
    erros:[["Cotovelos abrindo","Mantenha-os apontados para a frente ou para cima."],["Ombro participando","Fixe o braço; reduza a carga."]]},
  mergulho:{nome:"Mergulho (paralelas)", cadeia:"fechada",
    acoes:[["Ombro","extensão → flexão","sagital"],["Cotovelo","flexão → extensão","sagital"]], estab:["depressores da escápula","abdômen"],
    pose:{angulo:"cotovelo", concentrica:"abre", inicio:"max", alvoMin:85, alvoMax:170, vista:"de lado"},
    passos:["Ombros longe das orelhas no apoio.","Desça até o braço ficar paralelo ao chão, sem dor no ombro.","Suba estendendo os cotovelos."],
    erros:[["Descer demais","Pare com o braço paralelo ao chão."],["Ombros subindo","Empurre as barras para baixo."]]},
  panturrilha:{nome:"Flexão plantar", cadeia:"fechada",
    acoes:[["Tornozelo","dorsiflexão → flexão plantar","sagital"]], estab:["fibulares (tornozelo alinhado)"],
    pose:{angulo:"tornozelo", concentrica:"abre", inicio:"max", alvoMin:70, alvoMax:140, vista:"de lado"},
    passos:["Apoie a ponta do pé num degrau para descer abaixo da linha.","Pause 1–2 s no alongamento embaixo, sem quicar.","Suba o mais alto possível e segure 1 s."],
    erros:[["Quicar embaixo","O tendão faz o trabalho no lugar do músculo: pause."],["Amplitude curta","Use toda a descida e toda a subida."]]},
  tibial:{nome:"Dorsiflexão", cadeia:"aberta",
    acoes:[["Tornozelo","flexão plantar → dorsiflexão","sagital"]], estab:["—"], pose:null,
    passos:["Calcanhar apoiado, ponta do pé solta.","Puxe a ponta do pé em direção à canela.","Desça devagar até o fim."],
    erros:[["Movimento curto","Use toda a amplitude do tornozelo."]]},
  abdominal:{nome:"Flexão de tronco", cadeia:"aberta",
    acoes:[["Coluna","extensão → flexão","sagital"]], estab:["flexores do quadril (não devem dominar)"],
    pose:{angulo:"quadril", concentrica:"fecha", inicio:"max", alvoMin:90, alvoMax:170, vista:"de lado"},
    passos:["Enrole a coluna aproximando costelas e pelve.","Expire na subida.","Volte devagar sem perder a tensão."],
    erros:[["Puxar o pescoço","Mãos sem puxar a cabeça; olhar para cima."],["Subir só com o quadril","Pense em enrolar vértebra por vértebra."]]},
  anti_extensao:{nome:"Anti-extensão do tronco", cadeia:"fechada",
    acoes:[["Coluna","resistir à extensão (isometria ou excêntrica)","sagital"],["Ombro","flexão sob carga","sagital"]], estab:["glúteos","serrátil"], pose:null,
    passos:["Pelve retrovertida e glúteos contraídos.","Avance apenas até onde a lombar não cede.","Volte puxando com o abdômen, não com o quadril."],
    erros:[["Lombar afundando","Diminua a amplitude; ajoelhado antes de em pé."]]},
  rotacao:{nome:"Rotação de tronco", cadeia:"aberta",
    acoes:[["Coluna torácica","rotação","transversal"],["Quadril","rotação acompanhando","transversal"]], estab:["abdômen"], pose:null,
    passos:["Braços quase estendidos, a força sai do tronco.","Gire em diagonal controlando a volta."],
    erros:[["Girar só os braços","O tronco conduz; os braços só seguram."]]},
  encolhimento:{nome:"Elevação da escápula", cadeia:"aberta",
    acoes:[["Escápula","depressão → elevação (e retração no Kelso)","frontal"]], estab:["—"], pose:null,
    passos:["Braços soltos, sem dobrar o cotovelo.","Leve os ombros às orelhas (ou para trás no Kelso) e segure 1 s.","Desça até alongar o trapézio."],
    erros:[["Girar os ombros","Movimento é só para cima (ou para trás)."]]},
  punho:{nome:"Punho", cadeia:"aberta",
    acoes:[["Punho","flexão ou extensão","sagital"]], estab:["antebraço apoiado"], pose:null,
    passos:["Antebraço apoiado, só o punho se move.","Use toda a amplitude, devagar."],
    erros:[["Mover o cotovelo","Apoie o antebraço numa superfície."]]},
  isometria:{nome:"Isometria", cadeia:"fechada",
    acoes:[["Tronco","estabilização","todos"]], estab:["abdômen","glúteos"], pose:null,
    passos:["Alinhe cabeça, tronco e quadril.","Respire curto mantendo a tensão.","Pare quando a posição começar a se perder."],
    erros:[["Quadril caindo ou subindo","Contraia glúteos e abdômen; reduza o tempo."]]}
};

/* reconhece o padrão a partir do nome, do grupo e da articulação principal */
function padraoMovimento(ex){
  if(!ex) return null;
  const n = normNome(ex.nome + " " + ex.id), g = ex.grupo, j = ((ex.juntas||[])[0]||{}).j;
  const tem = (...ps) => ps.some(p=>n.includes(p));
  if(ehTempo(ex) || tem("prancha")) return "isometria";
  if(tem("roda abdominal","dragon","rollout")) return "anti_extensao";
  if(tem("lenhador","rotac")) return "rotacao";
  if(g==="Abdômen") return "abdominal";
  if(g==="Antebraço") return "punho";
  if(g==="Trapézio" || tem("encolhimento","kelso")) return "encolhimento";
  if(g==="Tibial") return "tibial";
  if(g==="Panturrilha") return "panturrilha";
  if(tem("aducao","cossaco")) return tem("cossaco") ? "afundo" : "aducao";
  if(tem("abducao")) return "abducao";
  if(tem("extensora","nordico reverso","sissy","espanhol")) return tem("sissy","espanhol","nordico reverso") ? "agachamento" : "extensora";
  if(tem("flexora","nordico","glute ham")) return "flexao_joelho";
  if(g==="Posterior e glúteo" && tem("hip thrust","elevacao pelvica","ponte","frog","coice","kas")) return "ponte";
  if(tem("stiff","terra","bom dia","swing","pull through","jefferson","extensao lombar","hiperextensao")) return "dobradica";
  if(tem("afundo","bulgaro","step","lunge","passada")) return "afundo";
  if(g==="Quadríceps" || tem("agachamento","leg press","hack","pendular","cinto")) return "agachamento";
  if(g==="Posterior e glúteo") return j==="Joelho" ? "flexao_joelho" : "dobradica";
  if(tem("paralelas","mergulho")) return "mergulho";
  if(g==="Tríceps") return "triceps";
  if(g==="Bíceps") return "rosca";
  if(tem("pullover","lat prayer")) return "pullover";
  if(tem("crucifixo inverso","face pull","posterior","peck deck invertido") || (tem("crucifixo") && g==="Ombro")) return "posterior_ombro";
  if(tem("crucifixo","crossover","peck","fly")) return "crucifixo";
  if(g==="Peito") return "empurrar_h";
  if(g==="Ombro" && tem("elevacao","remada alta","y raise")) return "ombro_isolado";
  if(g==="Ombro") return tem("remada alta") ? "ombro_isolado" : "empurrar_v";
  if(g==="Costas") return tem("barra fixa","puxada","chin","pulldown") ? "puxar_v" : "puxar_h";
  return j==="Cotovelo" ? "rosca" : j==="Joelho" ? "agachamento" : "isometria";
}

/* cadência sugerida a partir de onde fica o pico da curva de torque */
function cadenciaSugerida(ex){
  const pf = perfil(ex), r = pf ? pf.regiao : "meio";
  if(ehTempo(ex)) return {txt:"Tempo sob tensão contínuo; pare quando a técnica começar a se perder.", codigo:null};
  if(r==="alongado") return {codigo:"3-1-1-0", txt:"Desça em 3 s, pause 1 s no alongamento (onde o torque é máximo), suba em 1 s, sem pausa em cima. Não quique no fundo: é ali que a carga mais pesa."};
  if(r==="encurtado") return {codigo:"2-0-1-1", txt:"Desça em 2 s, suba em 1 s e segure 1 s na contração, onde a curva tem o pico. O começo é leve: não use embalo para chegar ao topo."};
  return {codigo:"2-0-1-0", txt:"Desça em 2 s e suba em 1 s com velocidade constante; o pico fica no meio, então não acelere para passar por ele."};
}

/* modelo completo para mostrar na ficha */
function modeloCinesiologico(ex){
  const k = padraoMovimento(ex); if(!k) return null;
  const P = PADROES[k], musc = identificarMusculos(ex), pf = perfil(ex), j0 = (ex.juntas||[])[0];
  const nomeM = m => (MUSCULOS[m]||{nome:m}).nome;
  const amplitude = j0 && j0.db ? Math.round(Math.abs(j0.db)) : null;
  const regiao = pf ? pf.regiao : null;
  const fr = pf ? pf.fracoes.map(v=>Math.round(v*100)) : null;
  const dica = regiao ? (regiao==="alongado" ? "O torque é máximo com o músculo alongado: controle a descida e use a amplitude toda." : regiao==="encurtado" ? "O torque é máximo perto da contração: a parte final da subida é a que mais conta." : "O torque é máximo no meio do movimento: velocidade constante, sem embalo para atravessá-lo.") : "";
  return {padrao:k, nome:P.nome, cadeia:P.cadeia, acoes:P.acoes.map(([a,acao,plano])=>({articulacao:a, acao, plano})),
    agonistas:musc.primarios.map(nomeM), sinergistas:musc.secundarios.map(nomeM), estabilizadores:P.estab,
    amplitude, regiao, fracoes:fr, dica, cadencia:cadenciaSugerida(ex), passos:P.passos, erros:P.erros, pose:P.pose,
    respiracao: k==="isometria" ? "Respiração curta, sem soltar o abdômen." : "Inspire e trave o abdômen antes da fase difícil; solte o ar ao passar o ponto mais pesado."};
}

/* checklist para assistir a um vídeo de referência com olho crítico */
function oQueObservar(ex){
  const m = modeloCinesiologico(ex); if(!m) return [];
  const out = [];
  if(m.pose) out.push(`Amplitude do ${m.pose.angulo}: o movimento completo vai de cerca de ${m.pose.alvoMax}° a ${m.pose.alvoMin}°.`);
  out.push(`Cadência: ${m.cadencia.codigo ? m.cadencia.codigo+" — " : ""}${m.cadencia.txt.split(".")[0]}.`);
  m.erros.slice(0,2).forEach(([e])=>out.push(`Se aparecer “${e.toLowerCase()}”, a execução do vídeo não é a ideal.`));
  if(m.regiao) out.push(m.dica);
  return out;
}

/* ---------------------------------------------------------------------
   ANÁLISE DE VÍDEO (pura): recebe quadros com os 33 pontos do corpo
   (formato do MediaPipe Pose) e devolve repetições, amplitude, cadência,
   simetria e estabilidade do tronco, comparados com o modelo.
   --------------------------------------------------------------------- */
function anguloEntre(a, b, c){
  if(!a || !b || !c) return null;
  const v1 = [a.x-b.x, a.y-b.y, (a.z||0)-(b.z||0)], v2 = [c.x-b.x, c.y-b.y, (c.z||0)-(b.z||0)];
  const d = v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2], n = Math.hypot(...v1)*Math.hypot(...v2);
  if(!n) return null;
  return Math.acos(Math.max(-1, Math.min(1, d/n)))*180/Math.PI;
}
const visivel = (lm, idx, min) => idx.every(i=>lm[i] && (lm[i].visibility==null || lm[i].visibility>=(min||0.5)));
/* ângulo de um lado (0 esquerdo, 1 direito) num quadro */
function anguloQuadro(lm, chave, lado){
  const tri = ANGULOS_POSE[chave].pontos[lado];
  if(!visivel(lm, tri, 0.45)) return null;
  return anguloEntre(lm[tri[0]], lm[tri[1]], lm[tri[2]]);
}
/* inclinação do tronco em relação à vertical (meio dos ombros → meio dos quadris), em graus */
function inclinacaoTronco(lm){
  if(!visivel(lm,[11,12,23,24],0.4)) return null;
  const om = {x:(lm[11].x+lm[12].x)/2, y:(lm[11].y+lm[12].y)/2}, qu = {x:(lm[23].x+lm[24].x)/2, y:(lm[23].y+lm[24].y)/2};
  return Math.abs(Math.atan2(om.x-qu.x, -(om.y-qu.y))*180/Math.PI);   /* y cresce para baixo na imagem */
}
const suavizar = (xs, k) => xs.map((_,i)=>{ const j = xs.slice(Math.max(0,i-k), i+k+1).filter(v=>v!=null); return j.length ? j.reduce((a,b)=>a+b,0)/j.length : null; });

/* acha repetições: ciclos entre extremos com proeminência mínima */
function acharRepeticoes(ts, vs, prom){
  prom = prom || 25;
  const ext = [];   /* alternância de picos (max) e vales (min) */
  let busca = null, cand = null;
  for(let i=0;i<vs.length;i++){ const v = vs[i]; if(v==null) continue;
    if(cand==null){ cand = {i, v, tipo:null}; continue; }
    if(busca==null){ if(v-cand.v>=prom){ ext.push({i:cand.i,v:cand.v,tipo:"min"}); busca="max"; cand={i,v}; } else if(cand.v-v>=prom){ ext.push({i:cand.i,v:cand.v,tipo:"max"}); busca="min"; cand={i,v}; } else if(Math.abs(v-cand.v)<1e-9){} continue; }
    if(busca==="max"){ if(v>cand.v) cand={i,v}; else if(cand.v-v>=prom){ ext.push({i:cand.i,v:cand.v,tipo:"max"}); busca="min"; cand={i,v}; } }
    else { if(v<cand.v) cand={i,v}; else if(v-cand.v>=prom){ ext.push({i:cand.i,v:cand.v,tipo:"min"}); busca="max"; cand={i,v}; } }
  }
  if(cand && busca) ext.push({i:cand.i, v:cand.v, tipo:busca});
  return ext.map(e=>({t:ts[e.i], v:e.v, tipo:e.tipo, i:e.i}));
}

function analisarVideoMovimento(quadros, ex){
  const m = modeloCinesiologico(ex);
  if(!m || !m.pose) return {erro:"Este exercício não tem um ângulo principal que dê para medir em vídeo."};
  if(!quadros || quadros.length<8) return {erro:"Vídeo curto demais ou sem pessoa detectada: grave pelo menos uma repetição inteira."};
  const P = m.pose, ts = quadros.map(q=>q.t);
  const lados = [0,1].map(l=>quadros.map(q=>q.lm ? anguloQuadro(q.lm, P.angulo, l) : null));
  const cobertura = lados.map(s=>s.filter(v=>v!=null).length/quadros.length);
  if(Math.max(...cobertura)<0.4) return {erro:`Não deu para ver o ${P.angulo} na maior parte do vídeo. Grave ${P.vista}, com o corpo inteiro no quadro e boa luz.`};
  /* série principal: média dos lados visíveis em cada quadro */
  const serie = suavizar(quadros.map((_,i)=>{ const a = lados[0][i], b = lados[1][i]; return a!=null&&b!=null ? (a+b)/2 : (a!=null?a:b); }), 2);
  const ext = acharRepeticoes(ts, serie, 25);
  /* uma repetição = parte da posição inicial, vai ao extremo oposto e volta */
  const idaConcentrica = (P.inicio==="min" && P.concentrica==="abre") || (P.inicio==="max" && P.concentrica==="fecha");
  const reps = [];
  for(let k=0;k+2<ext.length;k++){
    const a = ext[k], b = ext[k+1], c = ext[k+2];
    if(a.tipo!==P.inicio) continue;
    const ida = b.t-a.t, volta = c.t-b.t;
    const vals = [a.v,b.v,c.v], lo = Math.min(...vals), hi = Math.max(...vals);
    reps.push({min:Math.round(lo), max:Math.round(hi), amplitude:Math.round(hi-lo),
      concentrica:+(idaConcentrica?ida:volta).toFixed(2), excentrica:+(idaConcentrica?volta:ida).toFixed(2), t0:a.t, t1:c.t});
    k++;
  }
  const notas = [];
  const media = xs => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null;
  if(!reps.length) notas.push({criterio:"Repetições", status:"atencao", texto:"Não encontrei um ciclo completo de descida e subida. Grave ao menos duas repetições inteiras."});
  else {
    const minMed = media(reps.map(r=>r.min)), maxMed = media(reps.map(r=>r.max)), ampMed = media(reps.map(r=>r.amplitude));
    const faltaFechar = Math.max(0, minMed-P.alvoMin), faltaAbrir = Math.max(0, P.alvoMax-maxMed), falta = Math.max(faltaFechar, faltaAbrir);
    const fundo = falta<=10 ? "ok" : falta<=25 ? "atencao" : "problema";
    const ponta = faltaFechar>=faltaAbrir ? `fecha só até ${Math.round(minMed)}° (o completo chega perto de ${P.alvoMin}°)` : `abre só até ${Math.round(maxMed)}° (o completo chega perto de ${P.alvoMax}°)`;
    const pontaAlongada = (faltaFechar>=faltaAbrir) === (P.inicio==="max" ? P.concentrica==="abre" : P.concentrica==="fecha");
    notas.push({criterio:"Amplitude", status:fundo, texto: fundo==="ok" ? `Amplitude completa: o ${P.angulo} vai de ${Math.round(maxMed)}° a ${Math.round(minMed)}°, dentro do esperado (${P.alvoMax}° a ${P.alvoMin}°).`
      : `O ${P.angulo} ${ponta}. ${m.regiao==="alongado"&&pontaAlongada?"Nesta curva o pico de torque está justamente nessa ponta: a parte cortada é a que mais estimula.":"Use a amplitude toda que a técnica permitir."}`});
    const desvio = Math.sqrt(media(reps.map(r=>(r.amplitude-ampMed)**2)));
    if(reps.length>=3) notas.push({criterio:"Consistência", status: desvio<=8 ? "ok" : desvio<=15 ? "atencao" : "problema",
      texto: desvio<=8 ? `As ${reps.length} repetições têm amplitude parecida (variação de ${Math.round(desvio)}°).` : `A amplitude varia ${Math.round(desvio)}° entre repetições; as últimas costumam encurtar com a fadiga.`});
    const exc = media(reps.map(r=>r.excentrica)), con = media(reps.map(r=>r.concentrica));
    const alvoExc = m.cadencia.codigo ? +m.cadencia.codigo.split("-")[0] : 2;
    notas.push({criterio:"Cadência", status: exc>=alvoExc*0.7 ? "ok" : exc>=alvoExc*0.4 ? "atencao" : "problema",
      texto:`Descida em ${exc.toFixed(1).replace(".",",")} s e subida em ${con.toFixed(1).replace(".",",")} s. ${exc>=alvoExc*0.7 ? "Descida controlada." : `Para este exercício a descida sugerida é de ~${alvoExc} s (${m.cadencia.codigo}).`}`});
  }
  /* simetria: só quando os dois lados aparecem bem */
  if(Math.min(...cobertura)>=0.6){
    const amp = s => { const v = s.filter(x=>x!=null); return Math.max(...v)-Math.min(...v); };
    const dif = Math.abs(amp(suavizar(lados[0],2))-amp(suavizar(lados[1],2)));
    notas.push({criterio:"Simetria", status: dif<=10 ? "ok" : dif<=20 ? "atencao" : "problema",
      texto: dif<=10 ? `Os dois lados se movem parecido (diferença de ${Math.round(dif)}°).` : `Um lado se move ${Math.round(dif)}° a mais que o outro. Confira se não é o ângulo da câmera; se não for, comece as séries pelo lado mais fraco.`});
  }
  /* tronco: deve ficar estável em exercícios de cadeia aberta para membros superiores */
  const tronco = quadros.map(q=>q.lm?inclinacaoTronco(q.lm):null).filter(v=>v!=null);
  if(tronco.length>=quadros.length*0.5){
    const var_ = Math.max(...tronco)-Math.min(...tronco);
    const isolado = ["rosca","triceps","ombro_isolado","posterior_ombro","crucifixo","empurrar_v","puxar_v"].includes(m.padrao);
    const maxIncl = Math.max(...tronco);
    if(isolado) notas.push({criterio:"Tronco", status: var_<=10 ? "ok" : var_<=20 ? "atencao" : "problema",
      texto: var_<=10 ? `Tronco estável (oscila ${Math.round(var_)}°).` : `O tronco balança ${Math.round(var_)}°: parte da carga sobe com embalo. Reduza o peso ou apoie as costas.`});
    else if(m.padrao==="agachamento") notas.push({criterio:"Tronco", status: maxIncl<=50 ? "ok" : "atencao",
      texto: maxIncl<=50 ? `Inclinação máxima do tronco de ${Math.round(maxIncl)}°, compatível com o agachamento.` : `O tronco inclina até ${Math.round(maxIncl)}°: o quadril assume mais trabalho que o joelho. Para enfatizar quadríceps, mantenha o peito mais alto.`});
  }
  const ordem = {problema:0, atencao:1, ok:2};
  const geral = notas.length ? notas.reduce((a,n)=>ordem[n.status]<ordem[a] ? n.status : a, "ok") : "atencao";
  return {angulo:P.angulo, vista:P.vista, reps, notas, geral, serie:ts.map((t,i)=>[t, serie[i]]), cobertura:Math.round(Math.max(...cobertura)*100), modelo:m};
}

/* ---------------------------------------------------------------------
   VÍDEO DE REDE SOCIAL: do link ao player incorporado
   A página não consegue baixar o vídeo dessas redes; ela o mostra num
   player incorporado e analisa a imagem que aparece na tela, com a
   permissão de captura da aba dada pela pessoa.
   --------------------------------------------------------------------- */
function videoIncorporavel(url){
  const u = urlValida(url); if(!u) return {erro:"Cole um link completo, começando com https://."};
  let x; try{ x = new URL(u); }catch(e){ return {erro:"Link inválido."}; }
  const h = x.hostname.replace(/^(www|m|mobile)\./,""), p = x.pathname;
  let m;
  if(/(^|\.)youtube\.com$/.test(h) || h==="youtu.be" || h==="youtube-nocookie.com"){
    const id = h==="youtu.be" ? p.slice(1).split("/")[0]
      : (m = p.match(/^\/(?:shorts|embed|live|v)\/([\w-]{6,})/)) ? m[1] : x.searchParams.get("v");
    if(!id || !/^[\w-]{6,20}$/.test(id)) return {erro:"Não achei o código do vídeo neste link do YouTube."};
    const t = parseInt(x.searchParams.get("t")||x.searchParams.get("start")||"0",10)||0;
    const curto = /^\/shorts\//.test(p);
    return {rede:"YouTube", id, vertical:curto, embed:`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1${t?`&start=${t}`:""}`, original:u};
  }
  if(/(^|\.)tiktok\.com$/.test(h)){
    m = p.match(/\/video\/(\d{8,25})/) || p.match(/\/embed\/(?:v2\/)?(\d{8,25})/);
    if(!m) return {erro:/^vm\.|^vt\./.test(x.hostname) ? "Links curtos do TikTok (vm.tiktok.com) não trazem o código do vídeo. Abra o link e copie o endereço completo, com /video/ e o número." : "Não achei o código do vídeo neste link do TikTok."};
    return {rede:"TikTok", id:m[1], vertical:true, embed:`https://www.tiktok.com/embed/v2/${m[1]}`, original:u};
  }
  if(/(^|\.)instagram\.com$/.test(h) || h==="instagr.am"){
    m = p.match(/^\/(p|reel|reels|tv)\/([\w-]{5,})/);
    if(!m) return {erro:"Use o link de um post ou reel (instagram.com/reel/… ou /p/…)."};
    const tipo = m[1]==="reels" ? "reel" : m[1];
    return {rede:"Instagram", id:m[2], vertical:true, embed:`https://www.instagram.com/${tipo}/${m[2]}/embed/`, original:u};
  }
  return {erro:"Por enquanto dá para avaliar vídeos do YouTube, TikTok e Instagram."};
}
