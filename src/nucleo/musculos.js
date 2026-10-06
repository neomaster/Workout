const MUSCULOS = {
  "peitoral-maior":{nome:"Peitoral maior", zona:"tronco", lado:"frente", funcao:"Aduz e flexiona o ombro — empurra o braço para a frente e para o centro do corpo."},
  "deltoide-anterior":{nome:"Deltoide anterior", zona:"braco", lado:"frente", funcao:"Flexiona o ombro — eleva o braço para a frente, domina em presses e desenvolvimentos."},
  "deltoide-lateral":{nome:"Deltoide lateral", zona:"braco", lado:"frente", funcao:"Abduz o ombro — afasta o braço do corpo para o lado, o que dá a largura do ombro."},
  "deltoide-posterior":{nome:"Deltoide posterior", zona:"braco", lado:"costas", funcao:"Estende horizontalmente o ombro — puxa o braço para trás, equilibra a postura do ombro."},
  "triceps-braquial":{nome:"Tríceps braquial", zona:"braco", lado:"costas", funcao:"Estende o cotovelo — a cabeça longa também ajuda a estender o ombro."},
  "biceps-braquial":{nome:"Bíceps braquial", zona:"braco", lado:"frente", funcao:"Flexiona o cotovelo e supina o antebraço — gira a palma da mão para cima."},
  "braquial-braquiorradial":{nome:"Braquial e braquiorradial", zona:"braco", lado:"frente", funcao:"Flexores do cotovelo que trabalham mais com a pegada neutra ou pronada (pegada de martelo)."},
  "grande-dorsal":{nome:"Grande dorsal (latíssimo)", zona:"tronco", lado:"costas", funcao:"Estende, aduz e roda internamente o ombro — o músculo que faz a 'largura das costas'."},
  "trapezio":{nome:"Trapézio", zona:"tronco", lado:"costas", funcao:"Porção superior eleva a escápula; porção média e inferior a retraem e estabilizam."},
  "romboides":{nome:"Romboides", zona:"tronco", lado:"costas", funcao:"Retraem a escápula — aproximam as omoplatas da coluna em puxadas e remadas."},
  "eretores-espinha":{nome:"Eretores da espinha", zona:"tronco", lado:"costas", funcao:"Estendem e estabilizam a coluna — resistem à flexão do tronco sob carga."},
  "quadriceps-femoral":{nome:"Quadríceps femoral", zona:"perna", lado:"frente", funcao:"Estende o joelho — o grupo de 4 músculos na frente da coxa."},
  "isquiotibiais":{nome:"Isquiotibiais (posterior de coxa)", zona:"perna", lado:"costas", funcao:"Flexionam o joelho e estendem o quadril — dominam em exercícios de dobradiça de quadril."},
  "gluteo-maximo":{nome:"Glúteo máximo", zona:"perna", lado:"costas", funcao:"Estende e roda externamente o quadril — o maior extensor de quadril do corpo."},
  "gluteo-medio":{nome:"Glúteo médio (abdutores)", zona:"perna", lado:"costas", funcao:"Abduz o quadril e estabiliza a pelve lateralmente — afasta a coxa do corpo."},
  "adutores":{nome:"Adutores do quadril", zona:"perna", lado:"frente", funcao:"Aproximam a coxa da linha do corpo e estabilizam a pelve; o adutor magno também ajuda a estender o quadril."},
  "tibial-anterior":{nome:"Tibial anterior", zona:"perna", lado:"frente", funcao:"Flexiona dorsalmente o tornozelo — puxa a ponta do pé para cima e freia a pisada."},
  "panturrilha":{nome:"Tríceps sural (gastrocnêmio e sóleo)", zona:"perna", lado:"costas", funcao:"Flexiona plantarmente o tornozelo — o gastrocnêmio perde alavanca com o joelho dobrado, sobra para o sóleo."},
  "reto-abdominal":{nome:"Reto abdominal", zona:"tronco", lado:"frente", funcao:"Flexiona a coluna — aproxima o tórax da pelve."},
  "obliquos":{nome:"Oblíquos", zona:"tronco", lado:"frente", funcao:"Rodam e flexionam lateralmente o tronco — resistem e produzem rotação do tronco."},
  "flexores-punho":{nome:"Flexores do punho", zona:"braco", lado:"frente", funcao:"Flexionam o punho — fecham a palma da mão em direção ao antebraço."},
  "extensores-punho":{nome:"Extensores do punho", zona:"braco", lado:"costas", funcao:"Estendem o punho — levam o dorso da mão em direção ao antebraço."}
};

/* Regras por grupo: ponto de partida antes do ajuste fino por palavras-chave do nome/id.
   Isso é o "acervo lógico": a identificação não é um texto fixo por exercício, é deduzida. */
const REGRA_GRUPO = {
  "Peito": {p:["peitoral-maior"], s:["deltoide-anterior","triceps-braquial"]},
  "Costas": {p:["grande-dorsal"], s:["biceps-braquial","trapezio","romboides"]},
  "Bíceps": {p:["biceps-braquial"], s:["braquial-braquiorradial"]},
  "Tríceps": {p:["triceps-braquial"], s:[]},
  "Ombro": {p:["deltoide-lateral"], s:["trapezio"]},
  "Quadríceps": {p:["quadriceps-femoral"], s:["gluteo-maximo"]},
  "Posterior e glúteo": {p:["isquiotibiais","gluteo-maximo"], s:["eretores-espinha"]},
  "Panturrilha": {p:["panturrilha"], s:[]},
  "Abdômen": {p:["reto-abdominal"], s:[]},
  "Antebraço": {p:["flexores-punho"], s:[]},
  "Trapézio": {p:["trapezio"], s:[]},
  "Tibial": {p:["tibial-anterior"], s:[]},
  "Adutores": {p:["adutores"], s:[]}
};

/* identificarMusculos(ex): parte da regra do grupo e refina por palavras-chave do nome/id —
   o mesmo grupo "Ombro" ou "Costas" cobre padrões de movimento bem diferentes. */
function identificarMusculos(ex){
  const n = (ex.nome||"").toLowerCase(), id = ex.id||"";
  const tem = (...ks) => ks.some(k => n.includes(k) || id.includes(k));
  let base = REGRA_GRUPO[ex.grupo] || {p:["peitoral-maior"], s:[]};
  let p = base.p.slice(), s = base.s.slice();
  const def = (P,S) => { p=P; s=S; };

  if(ex.grupo==="Peito"){
    if(tem("crucifixo","crossover","peck")) def(["peitoral-maior"],["deltoide-anterior"]);
    else if(tem("flexão","flexao")) def(["peitoral-maior"],["deltoide-anterior","triceps-braquial","reto-abdominal"]);
    else def(["peitoral-maior"],["deltoide-anterior","triceps-braquial"]);
  } else if(ex.grupo==="Costas"){
    if(tem("face-pull")) def(["deltoide-posterior"],["trapezio","romboides"]);
    else if(tem("pullover")) def(["grande-dorsal"],["triceps-braquial"]);
    else if(tem("remada")) def(["grande-dorsal","romboides"],["biceps-braquial","trapezio"]);
    else if(tem("puxada","barra-fixa","chin-up")) def(["grande-dorsal"],["biceps-braquial","trapezio"]);
    else def(["grande-dorsal"],["biceps-braquial","trapezio","romboides"]);
  } else if(ex.grupo==="Bíceps"){
    if(tem("martelo","inversa")) def(["biceps-braquial","braquial-braquiorradial"],[]);
    else def(["biceps-braquial"],["braquial-braquiorradial"]);
  } else if(ex.grupo==="Tríceps"){
    if(tem("paralelas","mergulho","fechad")) def(["triceps-braquial"],["peitoral-maior","deltoide-anterior"]);
    else def(["triceps-braquial"],[]);
  } else if(ex.grupo==="Ombro"){
    if(tem("press","desenvolvimento","arnold","frontal")) def(["deltoide-anterior"],["triceps-braquial","trapezio"]);
    else if(tem("crucifixo-inverso","inverso")) def(["deltoide-posterior"],["trapezio","romboides"]);
    else if(tem("alta")) def(["deltoide-lateral","trapezio"],["biceps-braquial"]);
    else def(["deltoide-lateral"],["trapezio"]);
  } else if(ex.grupo==="Quadríceps"){
    if(tem("extensora")) def(["quadriceps-femoral"],[]);
    else if(tem("sissy","nordico-reverso","nórdico reverso","espanhol")) def(["quadriceps-femoral"],[]);
    else def(["quadriceps-femoral"],["gluteo-maximo","isquiotibiais"]);
  } else if(ex.grupo==="Posterior e glúteo"){
    if(tem("hip-thrust","elevação pélvica","elevacao pelvica","elevação pelvica","frog")) def(["gluteo-maximo"],["isquiotibiais"]);
    else if(tem("pull-through")) def(["gluteo-maximo","isquiotibiais"],["eretores-espinha"]);
    else if(tem("jefferson")) def(["eretores-espinha","isquiotibiais"],["gluteo-maximo"]);
    else if(tem("afundo","b-stance")) def(["gluteo-maximo"],["isquiotibiais","quadriceps-femoral"]);
    else if(tem("reversa","reverse hyper")) def(["gluteo-maximo"],["isquiotibiais","eretores-espinha"]);
    else if(tem("glute ham","ghr")) def(["isquiotibiais"],["gluteo-maximo","panturrilha"]);
    else if(tem("kettlebell","swing")) def(["gluteo-maximo","isquiotibiais"],["eretores-espinha","reto-abdominal"]);
    else if(tem("kas")) def(["gluteo-maximo"],[]);
    else if(tem("abdução","abducao")) def(["gluteo-medio"],[]);
    else if(tem("flexora","nórdico","nordico")) def(["isquiotibiais"],[]);
    else if(tem("coice")) def(["gluteo-maximo"],["isquiotibiais"]);
    else if(tem("extensão lombar","extensao lombar","bom dia","bom-dia")) def(["eretores-espinha"],["gluteo-maximo","isquiotibiais"]);
    else if(tem("stiff","romeno")) def(["isquiotibiais"],["gluteo-maximo","eretores-espinha"]);
    else if(tem("terra")) def(["gluteo-maximo","isquiotibiais"],["eretores-espinha","quadriceps-femoral"]);
    else def(["isquiotibiais","gluteo-maximo"],["eretores-espinha"]);
  } else if(ex.grupo==="Abdômen"){
    if(tem("rotação","rotacao","lenhador")) def(["obliquos"],["reto-abdominal"]);
    else if(tem("dragon")) def(["reto-abdominal"],["obliquos","grande-dorsal"]);
    else if(tem("prancha")) def(["reto-abdominal"],["obliquos"]);
    else def(["reto-abdominal"],[]);
  } else if(ex.grupo==="Antebraço"){
    if(tem("extensão","extensao","invertida")) def(["extensores-punho"],[]);
    else def(["flexores-punho"],[]);
  } else if(ex.grupo==="Trapézio"){
    if(tem("kelso")) def(["trapezio","romboides"],[]); else def(["trapezio"],[]);
  } else if(ex.grupo==="Adutores"){
    if(tem("cossaco","cossack")) def(["adutores","quadriceps-femoral"],["gluteo-maximo"]);
  }
  return {primarios:p.filter(m=>MUSCULOS[m]), secundarios:s.filter(m=>MUSCULOS[m] && !p.includes(m))};
}

/* dicasExecucao(ex): 2-3 avisos técnicos deduzidos do grupo + do equipamento/pegada citados no nome.
   De novo: regra lógica, não um texto fixo guardado por exercício. */
const DICAS_GRUPO = {
  "Peito":["Retraia e deprima as escápulas antes de iniciar — o ombro fica mais estável e protegido.","Controle a descida; evite que a carga perca tensão no ponto mais alongado."],
  "Costas":["Puxe pelo cotovelo, não pela mão — pense em levar o cotovelo ao bolso de trás.","Evite usar o balanço do tronco para compensar o peso."],
  "Bíceps":["Mantenha o cotovelo fixo ao lado do corpo durante toda a subida.","Desça controlado: a fase excêntrica também constrói força."],
  "Tríceps":["Deixe só o antebraço se mover — o cotovelo fica parado no espaço.","Não abra o cotovelo para os lados durante a extensão."],
  "Ombro":["Contraia o abdômen antes de empurrar para proteger a lombar.","Evite usar impulso das pernas ou do tronco para completar a subida."],
  "Quadríceps":["O joelho acompanha a direção dos pés — evite que ele colapse para dentro.","Desça até onde a lombar se mantém neutra, sem arredondar."],
  "Posterior e glúteo":["O movimento começa no quadril, não na lombar.","Mantenha a coluna neutra — evite arredondar durante a fase de descida."],
  "Panturrilha":["Busque amplitude completa: alongue embaixo e contraia forte em cima.","Uma pausa de 1 segundo no topo aumenta o pico de tensão."],
  "Abdômen":["O movimento vem da flexão da coluna, não da flexão do quadril inteiro.","Expire no pico da contração para ativar melhor a musculatura."],
  "Antebraço":["Use amplitude curta e controlada — o punho tem bem menos mobilidade que o cotovelo."],
  "Trapézio":["Suba os ombros em linha reta, sem rodar — e evite usar os braços para 'ajudar'."],
  "Adutores":["Quadril encaixado: o movimento sai da coxa, não da lombar.","Controle a abertura; é nela que o adutor está alongado e mais vulnerável."],
  "Tibial":["Calcanhar fixo: só a ponta do pé sobe, sem dobrar o joelho.","Desça devagar até o pé apontar para baixo; a volta controlada conta."]
};
function dicasExecucao(ex){
  const n = (ex.nome||"").toLowerCase(), id = ex.id||"";
  const tem = (...ks) => ks.some(k => n.includes(k) || id.includes(k));
  const out = (DICAS_GRUPO[ex.grupo]||[]).slice(0,2);
  if(tem("unilateral","-unilateral")) out.push("Carga assimétrica: trave o tronco contra a rotação em vez de deixar ela girar.");
  if(tem("polia","cabo","corda")) out.push("A polia mantém tensão constante — não deixe a carga 'descansar' no ponto alongado.");
  if(tem("smith")) out.push("A trajetória é travada no trilho: ajuste a posição dos pés para não forçar o ombro ou o joelho.");
  if(ex.tipo==="corporal") out.push("Para ajustar a dificuldade, mude a alavanca (apoio de mãos/pés), não só o número de repetições.");
  return out.slice(0,3);
}

/* fichaMuscular(ex): HTML compacto — pílulas de músculo primário/secundário + dicas de execução,
   usado tanto no painel da alavanca (seção 6) quanto no navegador de músculos (seção 7). */
