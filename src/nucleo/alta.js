/* =====================================================================
   CLASSIFICAÇÃO "EM ALTA" — termômetro, presença por rede, tendência,
   temas e veredito da física. Dados de uma varredura feita em 05/10/2026:
   buscas restritas a tiktok.com e youtube.com. O ID de cada vídeo do
   TikTok traz a data de publicação (32 bits altos = segundos Unix).
   O Instagram não deixa buscadores indexarem reels: não entra na conta.
   ===================================================================== */
let LEVANTAMENTO = "2026-10-05";   /* trocado quando chega um alta.json mais novo */

/* exercícios que apareceram na varredura e ainda não estavam no acervo */
const EXTRA_ALTA = [
 {id:"jefferson-curl",nome:"Jefferson curl",grupo:"Posterior e glúteo",carga:10,tipo:"corporal",frac:0.45,bi:false,equip:"Halteres",
  juntas:[{j:"Lombar",seg:"tronco",f:0.6,b0:-90,db:150,g:-90,off:0}],
  alias:["jefferson curl","jefferson curls"],
  nota:"Coluna enrolando vértebra por vértebra com carga leve. O torque na lombar é máximo com o tronco na horizontal, no meio do caminho."},
 {id:"prancha-copenhagen",nome:"Prancha Copenhagen",grupo:"Adutores",carga:0,tipo:"corporal",frac:0.5,bi:false,equip:"Peso corporal",modo:"tempo",
  juntas:[{j:"Quadril",seg:"coxa",f:1.0,b0:0,db:-4,g:-90,off:0}],
  alias:["copenhagen plank","copenhagen","prancha copenhague","plancha copenhague"],
  nota:"Prancha lateral com a perna de cima no banco: os adutores seguram meio corpo pela alavanca da perna inteira."},
 {id:"aducao-maquina",nome:"Adução de quadril na máquina",grupo:"Adutores",carga:45,tipo:"externa",bi:false,equip:"Máquina",
  juntas:[{j:"Quadril",seg:"coxa",f:0.9,b0:-55,db:-38,g:-90,off:0.05}],
  alias:["hip adduction","hip adductor machine","adductor machine","cadeira adutora","adutora","aductores"],
  nota:"Mais carga com as pernas abertas, onde o adutor está alongado; perto de nada com as coxas juntas."},
 {id:"agachamento-zercher",nome:"Agachamento Zercher",grupo:"Quadríceps",carga:70,tipo:"externa",bi:false,equip:"Barra",
  juntas:[{j:"Joelho",seg:"perna",f:0.6,b0:-33,db:-57,g:-90,off:0},
          {j:"Quadril",seg:"tronco",f:0.42,b0:-30,db:-60,g:-90,off:0}],
  alias:["zercher squat","sentadilla zercher"],
  nota:"Barra na dobra dos cotovelos: o tronco fica ereto como no frontal e o core trabalha para segurar a carga à frente."},
 {id:"elevacao-lu",nome:"Elevação Lu (até acima da cabeça)",grupo:"Ombro",carga:4,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Ombro",seg:"braco",f:1.5,b0:-90,db:175,g:-90,off:0}],
  alias:["lu raise","lu raises","elevacion lu"],
  nota:"Leva os braços até o alto. O torque no ombro é máximo na horizontal e cai a zero lá em cima; o fim fica para trapézio e serrátil."},
 {id:"elevacao-y-inclinado",nome:"Elevação em Y no banco inclinado",grupo:"Ombro",carga:4,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Ombro",seg:"braco",f:1.5,b0:-60,db:110,g:-90,off:0}],
  alias:["incline y raise","incline dumbbell y raise","y raise incline","chest supported y raise"],
  nota:"Deitado de bruços no banco, braços abrindo em Y: pico na metade, com o braço paralelo ao chão."},
 {id:"rosca-drag",nome:"Rosca drag (arrastando a barra)",grupo:"Bíceps",carga:22,tipo:"externa",bi:true,equip:"Barra",
  juntas:[{j:"Cotovelo",seg:"antebraco",f:0.85,b0:-90,db:125,g:-90,off:0}],
  alias:["drag curl","drag curls","barbell drag curl","curl arrastrado"],
  nota:"Cotovelos para trás e barra rente ao corpo: o antebraço fica mais vertical e o braço de momento diminui."},
 {id:"rosca-scott-martelo",nome:"Rosca Scott com pegada martelo",grupo:"Bíceps",carga:12,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Cotovelo",seg:"antebraco",f:1.15,b0:-45,db:105,g:-90,off:0}],
  alias:["preacher hammer curl","hammer preacher curl","curl martillo en banco scott"],
  nota:"Mesma alavanca da Scott; a pegada neutra só muda quem divide o trabalho, com mais braquial e braquiorradial."},
 {id:"stiff-b-stance",nome:"Stiff B-stance (pé de apoio atrás)",grupo:"Posterior e glúteo",carga:36,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Quadril",seg:"tronco",f:0.85,b0:-12,db:-75,g:-90,off:0}],
  alias:["b stance rdl","b-stance rdl","kickstand rdl","peso muerto b stance"],
  nota:"Uns 70–80% do peso na perna da frente: quase unilateral, com equilíbrio de bilateral."},
 {id:"ponte-kas",nome:"Ponte de glúteo Kas",grupo:"Posterior e glúteo",carga:70,tipo:"externa",bi:false,equip:"Barra",
  juntas:[{j:"Quadril",seg:"tronco",f:0.55,b0:-28,db:28,g:-90,off:0}],
  alias:["kas glute bridge","kas bridge","puente kas"],
  nota:"Só a metade de cima da elevação pélvica, sem impulso: tensão concentrada no glúteo encurtado."},
 {id:"afundo-smith-elevado",nome:"Afundo no Smith com pé da frente elevado",grupo:"Posterior e glúteo",carga:40,tipo:"externa",bi:false,equip:"Smith",
  juntas:[{j:"Quadril",seg:"tronco",f:0.6,b0:-15,db:-72,g:-90,off:0},
          {j:"Joelho",seg:"perna",f:0.5,b0:-40,db:-50,g:-90,off:0}],
  alias:["front foot elevated smith lunge","smith machine lunge","front foot elevated lunge","deficit lunge","zancada en smith"],
  nota:"O degrau sob o pé da frente aprofunda a flexão do quadril: o glúteo trabalha mais alongado."},
 {id:"remada-kroc",nome:"Remada Kroc (unilateral pesada)",grupo:"Costas",carga:45,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Ombro",seg:"braco",f:1.3,b0:-92,db:62,g:-90,off:0}],
  alias:["kroc row","kroc rows","remo kroc"],
  nota:"Remada unilateral com halter pesado e muitas repetições, aceitando um pouco de impulso do tronco."},
 {id:"roda-abdominal",nome:"Rolamento com roda abdominal",grupo:"Abdômen",carga:0,tipo:"corporal",frac:0.65,bi:false,equip:"Peso corporal",
  juntas:[{j:"Tronco",seg:"tronco",f:1.6,b0:0,db:55,g:-90,off:0}],
  alias:["ab wheel","ab wheel rollout","ab rollout","rueda abdominal"],
  nota:"O abdômen segura o corpo quase na horizontal: torque máximo na extensão total."},
 /* segunda leva do acervo (varredura de 05/10/2026, noite) */
 {id:"agachamento-cinto",nome:"Agachamento com cinto (belt squat)",grupo:"Quadríceps",carga:100,tipo:"externa",bi:false,equip:"Máquina",
  juntas:[{j:"Joelho",seg:"perna",f:0.6,b0:-32,db:-58,g:-90,off:0},{j:"Quadril",seg:"tronco",f:0.25,b0:-15,db:-45,g:-90,off:0}],
  alias:["belt squat","belt squats","agachamento no cinto","sentadilla con cinturón"],
  nota:"A carga fica pendurada no quadril: o joelho leva quase todo o torque e a coluna não segura peso."},
 {id:"agachamento-cossaco",nome:"Agachamento cossaco",grupo:"Adutores",carga:16,tipo:"externa",bi:false,equip:"Kettlebell",
  juntas:[{j:"Joelho",seg:"perna",f:0.55,b0:-30,db:-70,g:-90,off:0},{j:"Quadril",seg:"coxa",f:0.5,b0:-50,db:-35,g:-90,off:0}],
  alias:["cossack squat","cossack squats","sentadilla cosaca","agachamento lateral profundo"],
  nota:"Agachamento lateral fundo: a perna esticada leva os adutores ao alongado enquanto a outra desce até o fim."},
 {id:"press-landmine",nome:"Desenvolvimento landmine",grupo:"Ombro",carga:25,tipo:"externa",bi:false,equip:"Barra",
  juntas:[{j:"Ombro",seg:"braco",f:1,b0:-20,db:-60,g:-120,off:0}],
  alias:["landmine press","landmine shoulder press","press landmine","press en mina"],
  nota:"A barra presa no chão empurra em arco, para cima e para a frente: o ombro trabalha num ângulo mais fechado que no desenvolvimento."},
 {id:"hiperextensao-reversa",nome:"Hiperextensão reversa",grupo:"Posterior e glúteo",carga:20,tipo:"externa",bi:false,equip:"Máquina",
  juntas:[{j:"Quadril",seg:"coxa",f:0.9,b0:-90,db:85,g:-90,off:0}],
  alias:["reverse hyper","reverse hyperextension","reverse hypers","hiperextensión inversa"],
  nota:"As pernas sobem com o tronco apoiado: torque zero com elas penduradas e máximo na horizontal, com o glúteo encurtado."},
 {id:"afundo-deficit",nome:"Afundo reverso com déficit",grupo:"Posterior e glúteo",carga:30,tipo:"externa",bi:false,equip:"Halteres",
  juntas:[{j:"Joelho",seg:"perna",f:0.55,b0:-40,db:-60,g:-90,off:0},{j:"Quadril",seg:"tronco",f:0.5,b0:-30,db:-70,g:-90,off:0}],
  alias:["deficit reverse lunge","deficit lunge","afundo no step","zancada inversa con déficit"],
  nota:"Pé da frente sobre um step: o quadril desce mais fundo e o glúteo termina mais alongado que no afundo comum."},
 {id:"glute-ham-raise",nome:"Glute ham raise (GHR)",grupo:"Posterior e glúteo",carga:0,tipo:"corporal",frac:0.75,bi:false,equip:"Máquina",
  juntas:[{j:"Joelho",seg:"tronco",f:1.05,b0:75,db:-75,g:-90,off:0}],
  alias:["glute ham raise","ghr","glute-ham raise","elevación glúteo isquio"],
  nota:"Parente do flexor nórdico com apoio na coxa: os isquiotibiais flexionam o joelho segurando o corpo na horizontal."},
 {id:"kettlebell-swing",nome:"Kettlebell swing",grupo:"Posterior e glúteo",carga:24,tipo:"externa",bi:false,equip:"Kettlebell",
  juntas:[{j:"Quadril",seg:"tronco",f:0.9,b0:-50,db:50,g:-90,off:0}],
  alias:["kettlebell swing","kb swing","swing com kettlebell","balanço com kettlebell","swing ruso"],
  nota:"Dobradiça explosiva. A curva aqui mostra só o torque da gravidade; no movimento real o impulso aumenta o pico embaixo."}
];
EXTRA_ALTA.forEach(e=>{ if(!BASE.some(b=>b.id===e.id)) BASE.push(e); });

/* temas que agrupam as modas */
const TEMAS = {
  alongado:{nome:"Ênfase no alongado", desc:"Exercícios que prometem carregar o músculo esticado, o tema mais discutido nos vídeos de ciência do treino."},
  cabos:{nome:"Cabo no lugar certo", desc:"Polias e máquinas montadas para pôr a resistência onde o halter não põe."},
  joelhos:{nome:"Joelhos e tendões", desc:"Movimentos de reabilitação e prevenção que viraram treino, muitos do método Knees Over Toes."},
  gluteo:{nome:"Treino de glúteo", desc:"Variações de ponte, afundo e dobradiça que dominam os vídeos de glúteo."},
  oldschool:{nome:"Força old school", desc:"Exercícios antigos do powerlifting e do fisiculturismo clássico que voltaram com os vídeos curtos."},
  corpo:{nome:"Peso do corpo", desc:"Desafios e progressões sem carga externa."}
};
/* pesquisa: tt = vídeos do TikTok encontrados, páginas de busca e meses de publicação;
   yt = resultados no YouTube (até 10) e quantos eram shorts; null = rede não pesquisada para o termo.
   promessa = região da amplitude que os vídeos dizem carregar (null quando a promessa é outra). */
const ALTA_PESQUISA = {
 "rosca-bayesiana":{temas:["alongado","cabos"], promessa:"alongado", tt:{v:5,p:4,d:["2024-06","2024-08","2024-11","2025-05","2025-07"]}, yt:{r:10,s:4},
   resumo:"Rosca com o cabo vindo de trás, vendida como a rosca que carrega o bíceps alongado sem ser Scott.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7440121843832442158","@tylerpath"],["TikTok","https://www.tiktok.com/@quanbfit/video/7528213690978553101","@quanbfit"],["YouTube","https://www.youtube.com/watch?v=8PXe7YNOfb4",""]]},
 "encolhimento-kelso":{temas:["oldschool"], promessa:null, tt:{v:4,p:6,d:["2023-12","2024-01","2024-03","2025-10"]}, yt:{r:10,s:3},
   resumo:"Encolhimento com o peito apoiado e escápulas indo para trás; defendido como o melhor isolamento de trapézio.",
   refs:[["TikTok","https://www.tiktok.com/@harleyalexander.fit/video/7565957428206980374","@harleyalexander.fit"],["TikTok","https://www.tiktok.com/@tonymcaleavey/video/7342110222128925985","@tonymcaleavey"],["YouTube","https://www.youtube.com/watch?v=m20ipynXkx4",""]]},
 "nordico-reverso":{temas:["joelhos","alongado","corpo"], promessa:"alongado", tt:{v:7,p:3,d:["2022-10","2022-11","2023-07","2023-09","2023-11","2024-01","2024-04"]}, yt:{r:10,s:1},
   resumo:"A “extensora do pobre”: quadríceps e reto femoral alongados, muito usado em reabilitação de joelho.",
   refs:[["TikTok","https://www.tiktok.com/@qedfitness/video/7358806757478567175","@qedfitness"],["TikTok","https://www.tiktok.com/@sportschiroluke/video/7322763457634274562","@sportschiroluke"],["YouTube","https://www.youtube.com/watch?v=zl1m3DoiAec",""]]},
 "tibial-tib-bar":{temas:["joelhos"], promessa:null, tt:{v:3,p:7,d:["2022-07","2023-04","2024-10"]}, yt:{r:10,s:1},
   resumo:"Fortalecer a frente da canela para joelhos e tornozelos; virou padrão nos vídeos de Knees Over Toes.",
   refs:[["TikTok","https://www.tiktok.com/@kneesovertoesguy/video/7430939873554468138","@kneesovertoesguy"],["YouTube","https://www.youtube.com/watch?v=NXTqaKtA4OY",""]]},
 "jm-press":{temas:["oldschool"], promessa:"alongado", tt:{v:8,p:2,d:["2023-03","2023-06","2023-06","2023-07","2025-03","2025-04","2025-05","2025-07"]}, yt:{r:10,s:1},
   resumo:"Híbrido de tríceps testa e supino fechado, com muita carga para o tríceps alongado.",
   refs:[["TikTok","https://www.tiktok.com/@drmikeisraetel/video/7510607046098701614","@drmikeisraetel"],["TikTok","https://www.tiktok.com/@tylerpath/video/7483312314335251758","@tylerpath"],["YouTube","https://www.youtube.com/watch?v=hOCW9cE-GJg",""]]},
 "crucifixo-polia-sentado":{temas:["cabos","alongado"], promessa:"alongado", tt:{v:3,p:6,d:["2023-01","2023-05","2024-07"]}, yt:{r:9,s:2},
   resumo:"Crucifixo com banco no meio do crossover: tronco preso e cabo alinhado com o braço.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7388922908648705323","@tylerpath"],["TikTok","https://www.tiktok.com/@petermiljak/video/7228000299783408901","@petermiljak"],["YouTube","https://www.youtube.com/watch?v=VgKCIZgca58",""]]},
 "elevacao-y-polia":{temas:["cabos"], promessa:"alongado", tt:{v:3,p:7,d:["2023-05","2023-05","2023-10"]}, yt:null,
   resumo:"Cabos cruzados e braços abrindo em Y; prometem tensão desde o começo do movimento.",
   refs:[["TikTok","https://www.tiktok.com/@petarklancir/video/7293169161478343968","@petarklancir"],["TikTok","https://www.tiktok.com/@fitfoodiesinc/video/7229074739216534789","@fitfoodiesinc"]]},
 "lat-prayer":{temas:["cabos","alongado"], promessa:"alongado", tt:{v:2,p:7,d:["2022-11","2025-03"]}, yt:null,
   resumo:"Pullover ajoelhado na polia alta; a dica mais repetida é abaixar o cabo para alongar mais o dorsal.",
   refs:[["TikTok","https://www.tiktok.com/@willbickleyfitness/video/7485670980635987222","@willbickleyfitness"],["TikTok","https://www.tiktok.com/@balwynanytimefitness/video/7171290508717722923","@balwynanytimefitness"]]},
 "agachamento-pendular":{temas:["alongado"], promessa:"alongado", tt:{v:7,p:2,d:["2023-04","2023-06","2023-07","2023-07","2024-04","2025-09","2025-12"]}, yt:{r:10,s:2},
   resumo:"Máquina em arco apontada como a melhor para quadríceps pela flexão profunda do joelho.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7585636823683058999","@tylerpath"],["TikTok","https://www.tiktok.com/@drmikeisraetel/video/7249535508823412010","@drmikeisraetel"],["YouTube","https://www.youtube.com/watch?v=Nmq-8AK-GJQ",""]]},
 "jefferson-curl":{temas:["joelhos"], promessa:null, alerta:"Controverso: há quem use para mobilidade da coluna e quem alerte que não é solução para dor nas costas.", tt:{v:6,p:4,d:["2023-09","2023-11","2023-11","2024-01","2024-05","2024-11"]}, yt:{r:10,s:1},
   resumo:"Flexão lenta da coluna com carga leve, popular em vídeos de mobilidade.",
   refs:[["TikTok","https://www.tiktok.com/@kneesovertoesguy/video/7276859541000604971","@kneesovertoesguy"],["TikTok","https://www.tiktok.com/@squatuniversity/video/7298186466608368927","@squatuniversity"],["YouTube","https://www.youtube.com/watch?v=UpSXywh9OW0",""]]},
 "prancha-copenhagen":{temas:["corpo","joelhos"], promessa:null, tt:{v:5,p:5,d:["2024-03","2025-01","2025-05","2025-07","2025-09"]}, yt:{r:10,s:3},
   resumo:"Prancha lateral com apoio no banco para os adutores; “mais odiada que o búlgaro”, segundo um dos vídeos.",
   refs:[["TikTok","https://www.tiktok.com/@meg_squats/video/7346648585401847071","@meg_squats"],["TikTok","https://www.tiktok.com/@dr.allynelson.dpt/video/7463585265190292782","@dr.allynelson.dpt"],["YouTube","https://www.youtube.com/watch?v=5cTh21BfXzI",""]]},
 "agachamento-zercher":{temas:["oldschool"], promessa:null, tt:{v:7,p:2,d:["2023-01","2024-08","2024-08","2024-09","2024-09","2025-06","2026-03"]}, yt:{r:10,s:4},
   resumo:"Barra na dobra dos cotovelos; muito usado por atletas de luta pela força de tronco.",
   refs:[["TikTok","https://www.tiktok.com/@hberryyy_/video/7620629114373934350","@hberryyy_"],["TikTok","https://www.tiktok.com/@darustrong/video/7512577595519683871","@darustrong"],["YouTube","https://www.youtube.com/watch?v=-1iRwWOGTlk",""]]},
 "elevacao-lu":{temas:["oldschool"], promessa:"encurtado", tt:{v:3,p:7,d:["2022-06","2024-08","2025-08"]}, yt:{r:10,s:2},
   resumo:"Elevação até acima da cabeça vinda do levantamento olímpico; promete ombros fortes no alto.",
   refs:[["TikTok","https://www.tiktok.com/@squatuniversity/video/7543473425071770911","@squatuniversity"],["YouTube","https://www.youtube.com/watch?v=FfDy-4HN_PU",""]]},
 "hip-thrust":{temas:["gluteo"], promessa:"encurtado", tt:{v:8,p:2,d:["2023-02","2024-03","2024-06","2024-06","2025-04","2025-04","2025-06","2025-08"]}, yt:null,
   resumo:"O exercício de glúteo mais repetido nas redes, com tensão máxima no topo.",
   refs:[["TikTok","https://www.tiktok.com/@jeremyethier/video/7343366085023911174","@jeremyethier"],["TikTok","https://www.tiktok.com/@gluteguy/video/7382965519470562606","@gluteguy"]]},
 "sissy-squat":{temas:["joelhos","corpo"], promessa:"alongado", tt:{v:6,p:1,d:["2022-10","2023-02","2023-08","2024-03","2025-02","2026-05"]}, yt:null,
   resumo:"Joelhos bem à frente e quadríceps muito alongado; há quem alerte que não serve para quem tem dor no joelho.",
   refs:[["TikTok","https://www.tiktok.com/@squatuniversity/video/7473158342005787935","@squatuniversity"],["TikTok","https://www.tiktok.com/@thechrishinton/video/7642860164302785805","@thechrishinton"]]},
 "frog-pump":{temas:["gluteo","corpo"], promessa:"encurtado", tt:{v:4,p:6,d:["2024-02","2024-07","2024-12","2025-09"]}, yt:null,
   resumo:"Muitas repetições curtas para o glúteo; os próprios vídeos o tratam como finalizador, não como base.",
   refs:[["TikTok","https://www.tiktok.com/@venusfit/video/7554912937035517197","@venusfit"],["TikTok","https://www.tiktok.com/@xtinefit/video/7450173540071935237","@xtinefit"]]},
 "dragon-flag":{temas:["corpo"], promessa:null, tt:{v:1,p:6,d:["2025-10"]}, yt:null,
   resumo:"Desafio clássico de abdômen da calistenia, com várias progressões ensinadas nas redes.",
   refs:[["TikTok","https://www.tiktok.com/@mas.barras/video/7563768778656435463","@mas.barras"]]},
 "remada-meadows":{temas:["oldschool","alongado"], promessa:"alongado", tt:{v:1,p:9,d:["2025-11"]}, yt:{r:10,s:1},
   resumo:"Remada na landmine chamada de “subestimada”; muitas páginas de busca no TikTok sobre como montar.",
   refs:[["TikTok","https://www.tiktok.com/@drmikeisraetel/video/7574788957053930766","@drmikeisraetel"],["YouTube","https://www.youtube.com/watch?v=G-jU1aPVhnY",""]]},
 "agachamento-espanhol":{temas:["joelhos"], promessa:null, tt:{v:6,p:4,d:["2022-04","2023-01","2023-01","2023-05","2023-05","2024-03"]}, yt:null,
   resumo:"Faixa atrás dos joelhos e canela vertical; queridinho de fisioterapeutas para o tendão patelar.",
   refs:[["TikTok","https://www.tiktok.com/@themovementsystem/video/7230940163063418155","@themovementsystem"],["TikTok","https://www.tiktok.com/@sportschiroluke/video/7348003636825312513","@sportschiroluke"]]},
 "pull-through":{temas:["gluteo","cabos"], promessa:"encurtado", alerta:"Dividido: uns ensinam como exercício de glúteo, outros dizem que dá sensação mas pouca carga no alongado.", tt:{v:4,p:5,d:["2022-01","2023-10","2024-05","2026-04"]}, yt:null,
   resumo:"Dobradiça de quadril com o cabo entre as pernas, ensinada para sentir o glúteo no topo.",
   refs:[["TikTok","https://www.tiktok.com/@quanbfit/video/7626531231072587021","@quanbfit"],["TikTok","https://www.tiktok.com/@coachjackhallows/video/7371716123697417480","@coachjackhallows"]]},
 "rosca-drag":{temas:["oldschool"], promessa:"encurtado", tt:{v:7,p:3,d:["2022-11","2023-02","2023-08","2023-09","2023-10","2024-02","2024-07"]}, yt:null,
   resumo:"Rosca da era de ouro do fisiculturismo, vendida para o “pico” do bíceps na contração.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7202409641391787307","@tylerpath"],["TikTok","https://www.tiktok.com/@petarklancir/video/7274918848921406752","@petarklancir"]]},
 "stiff-b-stance":{temas:["gluteo"], promessa:"alongado", tt:{v:7,p:3,d:["2022-10","2023-07","2023-09","2024-02","2025-03","2025-04","2026-02"]}, yt:null,
   resumo:"Stiff com o pé de trás só de apoio; aparece muito em treinos de glúteo e posterior.",
   refs:[["TikTok","https://www.tiktok.com/@stefaniemariefit/video/7608364812900355359","@stefaniemariefit"],["TikTok","https://www.tiktok.com/@squatuniversity/video/7284338156982258986","@squatuniversity"]]},
 "ponte-kas":{temas:["gluteo"], promessa:"encurtado", tt:{v:6,p:4,d:["2023-01","2023-08","2023-12","2025-03","2025-04","2025-10"]}, yt:null,
   resumo:"Metade de cima da elevação pélvica, sem impulso; apresentada como o isolamento de glúteo no topo.",
   refs:[["TikTok","https://www.tiktok.com/@misscarriejune/video/7566525486101269773","@misscarriejune"],["TikTok","https://www.tiktok.com/@spen_fitness/video/7264623632784100640","@spen_fitness"]]},
 "afundo-smith-elevado":{temas:["gluteo","alongado"], promessa:"alongado", tt:{v:2,p:8,d:["2023-08","2023-09"]}, yt:null,
   resumo:"Afundo no Smith com o pé da frente num degrau, para aprofundar o glúteo.",
   refs:[["TikTok","https://www.tiktok.com/@atfpersonaltraining/video/7269051049544125739","@atfpersonaltraining"]]},
 "elevacao-lateral-deitado":{temas:["alongado"], promessa:"alongado", tt:{v:1,p:9,d:["2025-01"]}, yt:null,
   resumo:"Elevação lateral deitado de lado; nas redes, a versão mais vista é na polia.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7460315536837348654","@tylerpath"]]},
 "elevacao-lateral-polia-tras":{temas:["cabos","alongado"], promessa:"alongado", tt:{v:4,p:6,d:["2023-07","2023-08","2023-12","2024-06"]}, yt:null,
   resumo:"Cabo por trás do corpo para alongar mais o deltoide lateral no começo.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7383324947101273387","@tylerpath"],["TikTok","https://www.tiktok.com/@yusifmash/video/7259495784100465946","@yusifmash"]]},
 "agachamento-atg":{temas:["joelhos","alongado"], promessa:"alongado", tt:{v:7,p:2,d:["2022-02","2022-06","2022-12","2023-02","2024-04","2024-07","2025-05"]}, yt:null,
   resumo:"Divisão profunda com joelho além da ponta do pé, carro-chefe do método Knees Over Toes.",
   refs:[["TikTok","https://www.tiktok.com/@kneesovertoesguy/video/7509144336265710879","@kneesovertoesguy"],["TikTok","https://www.tiktok.com/@kneesovertoesguy/video/7362277318888394027","@kneesovertoesguy"]]},
 "triceps-cruzado":{temas:["cabos"], promessa:null, tt:{v:7,p:4,d:["2023-02","2023-03","2023-11","2024-03","2024-05","2024-09","2024-09"]}, yt:{r:7,s:2},
   resumo:"Extensão cruzando o corpo; a dica que mais se repete é alinhar o cabo com o braço.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7374955928304553259","@tylerpath"],["TikTok","https://www.tiktok.com/@petermiljak/video/7200918006338194693","@petermiljak"],["YouTube","https://www.youtube.com/watch?v=sR5eui_GL50",""]]},
 "flexao-deficit":{temas:["corpo","alongado"], promessa:"alongado", tt:{v:3,p:6,d:["2023-10","2024-06","2025-01"]}, yt:null,
   resumo:"Flexão com as mãos elevadas para o peito descer mais.",
   refs:[["TikTok","https://www.tiktok.com/@jessejameswest/video/7457619919589412142","@jessejameswest"]]},
 "aducao-maquina":{temas:["gluteo"], promessa:null, tt:{v:3,p:4,d:["2023-03","2023-09","2023-09"]}, yt:null,
   resumo:"A “cadeira de dentro da coxa”, com vídeos ensinando controle e pausa no fechamento.",
   refs:[["TikTok","https://www.tiktok.com/@haydensteelefit/video/7216411324924890411","@haydensteelefit"]]},
 "elevacao-y-inclinado":{temas:["oldschool"], promessa:null, tt:{v:0,p:9,d:[]}, yt:null,
   resumo:"Muitas páginas de busca no TikTok, mas poucos vídeos indexados com o nome exato.",
   refs:[["TikTok","https://www.tiktok.com/discover/incline-y-raises","busca"]]},
 "remada-kroc":{temas:["oldschool"], promessa:null, tt:{v:1,p:6,d:["2025-03"]}, yt:null,
   resumo:"Remada unilateral pesada para muitas repetições, herança do powerlifting.",
   refs:[["TikTok","https://www.tiktok.com/@movementismotive/video/7478349716082724139","@movementismotive"]]},
 "nordico":{temas:["joelhos","corpo"], promessa:null, tt:{v:2,p:7,d:["2023-12","2025-08"]}, yt:null,
   resumo:"Excêntrico de posterior com o peso do corpo, presente em quase todo vídeo de prevenção de lesão.",
   refs:[["TikTok","https://www.tiktok.com/@kneesovertoesguy/video/7539967890972232990","@kneesovertoesguy"],["TikTok","https://www.tiktok.com/@themovementsystem/video/7308782185283210539","@themovementsystem"]]},
 "remada-apoiada":{temas:["cabos"], promessa:null, tt:{v:3,p:7,d:["2022-10","2023-11","2025-02"]}, yt:null,
   resumo:"Remada com o peito apoiado (seal row), defendida por tirar o impulso e a lombar.",
   refs:[["TikTok","https://www.tiktok.com/@oneplateclub/video/7306617010899799301","@oneplateclub"],["TikTok","https://www.tiktok.com/@benwilcoxfitness/video/7470980963158330629","@benwilcoxfitness"]]},
 "triceps-katana":{temas:["cabos","alongado"], promessa:"alongado", tt:{v:1,p:9,d:["2023-04"]}, yt:null,
   resumo:"Extensão unilateral acima da cabeça com o cabo cruzando o corpo.",
   refs:[["TikTok","https://www.tiktok.com/@petermiljak/video/7223919722755017990","@petermiljak"]]},
 "puxada-unilateral":{temas:["cabos","alongado"], promessa:"alongado", tt:{v:8,p:2,d:["2022-06","2022-06","2023-03","2023-08","2023-09","2024-02","2025-03","2025-05"]}, yt:null,
   resumo:"Puxada com um braço, vendida para alongar mais o dorsal no topo.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7482570481950870827","@tylerpath"],["TikTok","https://www.tiktok.com/@petermiljak/video/7275863264511266053","@petermiljak"]]},
 "remada-pendlay":{temas:["oldschool"], promessa:null, tt:{v:7,p:3,d:["2022-03","2023-05","2023-11","2024-02","2024-04","2025-10","2026-04"]}, yt:null,
   resumo:"Remada saindo do chão a cada repetição, comparada nas redes com a remada curvada comum.",
   refs:[["TikTok","https://www.tiktok.com/@marcusfilly/video/7626377487202766110","@marcusfilly"],["TikTok","https://www.tiktok.com/@darustrong/video/7562357865160166686","@darustrong"]]},
 "crucifixo-inverso-maquina":{temas:["cabos"], promessa:null, tt:{v:6,p:4,d:["2023-10","2023-11","2024-03","2024-07","2025-05","2026-05"]}, yt:null,
   resumo:"Peck deck invertido para o deltoide posterior; a dica do momento é fazer de lado, um braço por vez.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7639896083832917262","@tylerpath"],["TikTok","https://www.tiktok.com/@tylerpath/video/7508389089062751531","@tylerpath"]]},
 "rosca-scott-martelo":{temas:["oldschool"], promessa:null, alerta:"Debatida: há vídeos defendendo e vídeos dizendo que a pegada martelo não combina com o banco Scott.", tt:{v:7,p:3,d:["2023-07","2023-09","2023-10","2024-08","2024-10","2024-12","2025-04"]}, yt:null,
   resumo:"Rosca Scott com pegada neutra para braquial e braquiorradial.",
   refs:[["TikTok","https://www.tiktok.com/@hazzytrainer/video/7255942079329651974","@hazzytrainer"],["TikTok","https://www.tiktok.com/@tylerpath/video/7488724872273661227","@tylerpath"]]},
 "roda-abdominal":{temas:["corpo"], promessa:"alongado", tt:{v:1,p:9,d:["2022-09"]}, yt:null,
   resumo:"A roda abdominal, com muitas páginas de busca do tipo “antes e depois”.",
   refs:[["TikTok","https://www.tiktok.com/@boxingscience/video/7138659012064578822","@boxingscience"]]},
 "agachamento-cinto":{temas:["joelhos","oldschool"], promessa:null, tt:{v:3,p:6,d:["2021-11","2023-02","2024-07"]}, yt:{r:10,s:0},
   resumo:"Agachamento sem barra nas costas, vendido como o jeito de treinar perna pesado sem dor lombar.",
   refs:[["TikTok","https://www.tiktok.com/@red5performance/video/7393121200253291822","@red5performance"],["TikTok","https://www.tiktok.com/@kathryn.mueller/video/7202260512237800750","@kathryn.mueller"],["YouTube","https://www.youtube.com/watch?v=oAK7QmugOzU",""]]},
 "agachamento-cossaco":{temas:["corpo","alongado"], promessa:"alongado", tt:{v:4,p:6,d:["2023-05","2024-01","2024-08","2025-05"]}, yt:{r:10,s:1},
   resumo:"Mobilidade e força de quadril no mesmo exercício; muitas progressões com kettlebell.",
   refs:[["TikTok","https://www.tiktok.com/@squatuniversity/video/7504696404007193887","@squatuniversity"],["TikTok","https://www.tiktok.com/@jeremyfunctionalfit/video/7407519297297222943","@jeremyfunctionalfit"],["YouTube","https://www.youtube.com/watch?v=shYSWbqBJPM",""]]},
 "press-landmine":{temas:["oldschool"], promessa:null, tt:{v:5,p:5,d:["2023-08","2023-10","2025-03","2026-01","2026-02"]}, yt:{r:10,s:1},
   resumo:"Desenvolvimento em arco, defendido como a opção amigável para ombros que doem no press acima da cabeça.",
   refs:[["TikTok","https://www.tiktok.com/@squatuniversity/video/7603231587118992670","@squatuniversity"],["TikTok","https://www.tiktok.com/@deltabolic/video/7269115051636804870","@deltabolic"],["YouTube","https://www.youtube.com/watch?v=n1NSt-h-tHA",""]]},
 "hiperextensao-reversa":{temas:["gluteo"], promessa:"encurtado", tt:{v:3,p:6,d:["2023-09","2023-11","2025-03"]}, yt:{r:10,s:1},
   resumo:"Dobradiça ao contrário, com as pernas subindo; aparece em vídeos de dor lombar e de glúteo, inclusive versões caseiras.",
   refs:[["TikTok","https://www.tiktok.com/@twstraining/video/7481676476421639430","@twstraining"],["TikTok","https://www.tiktok.com/@ssanar.wellness/video/7282547777362709806","@ssanar.wellness"],["YouTube","https://www.youtube.com/watch?v=EDc-baOIRKY",""]]},
 "afundo-deficit":{temas:["gluteo","alongado"], promessa:"alongado", tt:{v:4,p:5,d:["2023-04","2023-05","2023-05","2023-08"]}, yt:{r:10,s:1},
   resumo:"O afundo dos programas de glúteo: o step embaixo do pé da frente aumenta a descida.",
   refs:[["TikTok","https://www.tiktok.com/@coachrauve/video/7263150511744978219","@coachrauve"],["TikTok","https://www.tiktok.com/@red5performance/video/7222792506193284398","@red5performance"],["YouTube","https://www.youtube.com/watch?v=Z1uNGL0Tisk",""]]},
 "glute-ham-raise":{temas:["joelhos","corpo"], promessa:null, tt:{v:4,p:6,d:["2023-04","2024-01","2024-01","2024-05"]}, yt:{r:10,s:0},
   resumo:"Isquiotibiais no joelho e no quadril; os vídeos discutem como manter o quadril estendido para não roubar.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7328231256758471966","@tylerpath"],["TikTok","https://www.tiktok.com/@lift_edu/video/7220845659526548778","@lift_edu"],["YouTube","https://www.youtube.com/watch?v=c2pWqsHR7FU",""]]},
 "kettlebell-swing":{temas:["gluteo","corpo"], promessa:null, tt:{v:3,p:7,d:["2023-08","2023-10","2024-03"]}, yt:{r:10,s:3},
   resumo:"O swing aparece mais em buscas sobre músculos trabalhados e cardio do que em vídeos novos.",
   refs:[["TikTok","https://www.tiktok.com/@squatuniversity/video/7289085890612268334","@squatuniversity"],["TikTok","https://www.tiktok.com/@priscilla_bc/video/7347722410554035488","@priscilla_bc"],["YouTube","https://www.youtube.com/watch?v=bDCeXbMJVNs",""]]},
 "elevacao-lateral-polia":{temas:["cabos","alongado"], promessa:"alongado", tt:{v:1,p:3,d:["2024-10"]}, yt:{r:10,s:4},
   resumo:"A elevação lateral na polia virou a base das “parciais alongadas” de ombro.",
   refs:[["TikTok","https://www.tiktok.com/@tylerpath/video/7429938814682139950","@tylerpath"],["YouTube","https://www.youtube.com/watch?v=U6zUvir78EA",""]]}
};
/* o tema “parciais alongadas” como assunto, com os dois lados do debate */
const DEBATE_ALONGADO = {tt:{v:6,p:4}, refs:[
  ["TikTok","https://www.tiktok.com/@jeffnippardfitness/video/7423771365225876741","@jeffnippardfitness","a favor: em quais exercícios usar"],
  ["TikTok","https://www.tiktok.com/@tylerpath/video/7429938814682139950","@tylerpath","escolha o exercício com pico no alongado"],
  ["YouTube","https://www.youtube.com/watch?v=kjv8jkSrpwk","","contra: parciais alongadas não seriam hipertrofia por alongamento"]]};

/* ---------- cálculo ---------- */
const mesesAte = (ym, ref) => { const [y,m]=ym.split("-").map(Number); const [Y,M]=ref.split("-").map(Number); return (Y-y)*12+(M-m); };
const CLASS_CACHE = new Map();
/* o cálculo do termômetro isolado: serve para a semana atual e para as anteriores do histórico */
function sinaisDe(P, ref){
  const tt = P.tt||{v:0,p:0,d:[]}, d = [...(tt.d||[]), ...((P.yt&&P.yt.d)||[])].sort();   /* datas de publicação: TikTok + YouTube coletado */
  const presTT = Math.min(1, (tt.v + 0.4*tt.p)/11);
  const ult12 = d.filter(m=>mesesAte(m,ref)<=12).length, ult24 = d.filter(m=>mesesAte(m,ref)<=24).length;
  const ultimo = d.length ? d[d.length-1] : null;
  const recente = ultimo==null ? 0 : mesesAte(ultimo,ref)<=12 ? 1 : mesesAte(ultimo,ref)<=24 ? 0.5 : 0;
  const momento = d.length ? 0.6*(ult24/d.length) + 0.4*recente : 0.2;
  const presYT = P.yt ? Math.min(1, P.yt.r/10*0.8 + Math.min(P.yt.s,4)/4*0.2) : null;
  const termometro = Math.round(100 * (presYT==null ? (0.6*presTT + 0.4*momento) : (0.45*presTT + 0.30*momento + 0.25*presYT)));
  return {presTT, presYT, momento, termometro, ult12, ult24, ultimo, recente};
}
function classificar(ex){
  if(!ex) return null;
  if(CLASS_CACHE.has(ex.id)) return CLASS_CACHE.get(ex.id);
  const P = ALTA_PESQUISA[ex.id];
  if(!P){ CLASS_CACHE.set(ex.id, null); return null; }
  const s = sinaisDe(P, LEVANTAMENTO);
  const tt = P.tt, d = tt.d||[];
  const {presTT, presYT, momento, termometro, ult12, ult24, ultimo, recente} = s;
  const rotulo = termometro>=70 ? "viral" : termometro>=58 ? "em alta" : termometro>=45 ? "nicho" : "pouco visto";
  const tendencia = ult12>0 || recente===1 ? "subindo" : ult24/(d.length||1)>=0.3 ? "estável" : "esfriando";
  /* promessa × física */
  let veredito = {tipo:"neutro", txt:"A promessa nos vídeos não é sobre a amplitude, então a curva não confirma nem desmente."};
  const pf = perfil(ex);
  if(P.promessa && pf){
    const idx = NOMES_REGIAO.indexOf(P.promessa), fr = pf.fracoes[idx];
    if(pf.regiao===P.promessa) veredito = {tipo:"confirma", txt:`Os vídeos prometem carga no ${P.promessa} e a curva confirma: o pico está lá (${Math.round(fr*100)}% do trabalho nessa fatia).`};
    else if(fr>=0.3) veredito = {tipo:"parcial", txt:`Os vídeos prometem carga no ${P.promessa}; a curva dá ${Math.round(fr*100)}% do trabalho ali, mas o pico fica no ${pf.regiao}.`};
    else veredito = {tipo:"nao", txt:`Os vídeos prometem carga no ${P.promessa}, mas a curva diz outra coisa: só ${Math.round(fr*100)}% do trabalho cai ali e o pico fica no ${pf.regiao}.`};
  }
  const out = {termometro, rotulo, tendencia, presTT, presYT, momento, ult12, ult24, ultimo, n:d.length, paginas:tt.p,
    yt:P.yt, temas:P.temas||[], promessa:P.promessa, veredito, resumo:P.resumo, alerta:P.alerta||null,
    refs:(P.refs||[]).map(([rede,url,autor])=>({rede,url,autor}))};
  CLASS_CACHE.set(ex.id, out); return out;
}
/* hashtags e resumo dos que entraram nesta varredura */
const TAGS_ALTA = {"jefferson-curl":["jeffersoncurl"],"prancha-copenhagen":["copenhagenplank"],"aducao-maquina":["hipadduction"],"agachamento-zercher":["zerchersquat"],
  "elevacao-lu":["luraises"],"elevacao-y-inclinado":["inclineyraise"],"rosca-drag":["dragcurl"],"rosca-scott-martelo":["preacherhammercurl"],"stiff-b-stance":["bstancerdl"],
  "ponte-kas":["kasglutebridge"],"afundo-smith-elevado":["smithmachinelunge"],"remada-kroc":["krocrow"],"roda-abdominal":["abwheel"],
  "agachamento-cinto":["beltsquat"],"agachamento-cossaco":["cossacksquat"],"press-landmine":["landminepress"],"hiperextensao-reversa":["reversehyper"],
  "afundo-deficit":["deficitreverselunge"],"glute-ham-raise":["glutehamraise","ghr"],"kettlebell-swing":["kettlebellswing"]};
EXTRA_ALTA.forEach(e=>{ e.fonte = {tags:TAGS_ALTA[e.id]||[], origem:(ALTA_PESQUISA[e.id]||{}).resumo||""}; });
function rankingAlta(filtro){
  return lib().filter(e=>ALTA_PESQUISA[e.id] && (!filtro || filtro(e, classificar(e))))
    .map(e=>({ex:e, c:classificar(e)})).sort((a,b)=>b.c.termometro-a.c.termometro || a.ex.nome.localeCompare(b.ex.nome));
}

/* =====================================================================
   AUTOSSUGESTÃO
   sugerir(q): o que mostrar enquanto a pessoa digita.
   sugestoesEmAlta(ctx): trocas e acréscimos das redes que fazem sentido
   para uma rotina, um treino ou um exercício.
   ===================================================================== */
let PRIORIZAR_ALTA = true;
function bonusAlta(ex){ const c = classificar(ex); return c && PRIORIZAR_ALTA ? c.termometro/100*0.12 : 0; }
function sugerir(q, opts){
  opts = opts||{}; const lim = opts.limite||8;
  const nq = semAcento(q||"").replace(/[^a-z0-9 #]/g," ").replace(/\s+/g," ").trim();
  if(!nq){
    /* campo vazio: as mais quentes das redes e os temas */
    const top = rankingAlta(opts.filtro).slice(0, lim-2).map(({ex,c})=>({tipo:"ex", ex, motivo:`${c.rotulo} · ${c.tendencia}`, score:c.termometro/100}));
    const temas = opts.semTemas ? [] : Object.entries(TEMAS).slice(0,2).map(([k,t])=>({tipo:"tema", id:k, nome:t.nome, motivo:"tema das redes"}));
    return top.concat(temas);
  }
  const res = new Map();
  const add = (ex, s, motivo) => { if(opts.filtro && !opts.filtro(ex)) return; const o = res.get(ex.id); if(!o || o.score<s) res.set(ex.id, {tipo:"ex", ex, score:s, motivo}); };
  for(const ex of lib()){
    const nome = semAcento(ex.nome);
    if(nome.startsWith(nq)) add(ex, 1.0+bonusAlta(ex), "");
    else if(nome.split(/[^a-z0-9]+/).some(w=>w.startsWith(nq))) add(ex, 0.86+bonusAlta(ex), "");
    else if(nome.includes(nq)) add(ex, 0.8+bonusAlta(ex), "");
  }
  /* nomes em inglês ou espanhol, gírias e apelidos: o mesmo casamento do leitor de posts */
  for(const c of casarExercicio(q).slice(0,10)){
    if(c.score<0.5) continue;
    const via = (c.ex.alias||[]).concat(Object.keys(ALIAS_EN).filter(k=>ALIAS_EN[k]===c.ex.id), Object.keys(ALIAS_ES).filter(k=>ALIAS_ES[k]===c.ex.id), Object.keys(ALIAS_PT).filter(k=>ALIAS_PT[k]===c.ex.id))
      .filter(a=>semAcento(a).includes(nq) || nq.includes(semAcento(a))).sort((x,y)=>x.length-y.length)[0];
    /* apelido que começa com o que foi digitado vale mais, e o mais curto vence */
    const apelidos = (c.ex.alias||[]).concat(Object.keys(ALIAS_EN).filter(k=>ALIAS_EN[k]===c.ex.id), Object.keys(ALIAS_ES).filter(k=>ALIAS_ES[k]===c.ex.id), Object.keys(ALIAS_PT).filter(k=>ALIAS_PT[k]===c.ex.id)).map(semAcento);
    const bonusApelido = Math.max(0, ...apelidos.filter(x=>x.startsWith(nq)).map(x=>0.05+0.4*nq.length/x.length));
    add(c.ex, 0.55 + 0.4*c.score + bonusApelido + bonusAlta(c.ex), via && !semAcento(c.ex.nome).includes(nq) ? `também chamado “${via}”` : "");
  }
  /* grupo e tema */
  const extras = [];
  grupos().forEach(g=>{ if(semAcento(g).startsWith(nq) && !opts.semGrupos) extras.push({tipo:"grupo", id:g, nome:g, motivo:`${lib().filter(e=>e.grupo===g).length} exercícios`, score:0.9}); });
  Object.entries(TEMAS).forEach(([k,t])=>{ if(!opts.semTemas && (semAcento(t.nome).includes(nq) || ("#"+k).startsWith(nq) || (nq.length>=4 && semAcento(t.desc).includes(nq)))) extras.push({tipo:"tema", id:k, nome:t.nome, motivo:"tema das redes", score:0.85}); });
  return [...res.values()].sort((a,b)=>b.score-a.score || a.ex.nome.length-b.ex.nome.length).slice(0, lim - Math.min(extras.length,2)).concat(extras.slice(0,2));
}
/* sugestões das redes para um conjunto de exercícios (rotina ou treino) */
function sugestoesEmAlta(exIds, limite){
  limite = limite||3;
  const presentes = new Set(exIds), exs = exIds.map(porId).filter(Boolean);
  const porGrupo = {};
  exs.forEach(e=>{ const pf = perfil(e); if(!pf || ehTempo(e)) return; const g = porGrupo[e.grupo] = porGrupo[e.grupo]||{fr:[0,0,0], n:0}; pf.fracoes.forEach((f,i)=>g.fr[i]+=f); g.n++; });
  const out = [];
  for(const [g, v] of Object.entries(porGrupo)){
    const fr = v.fr.map(x=>x/v.n), falta = fr.indexOf(Math.min(...fr));
    const cands = rankingAlta((e)=>e.grupo===g && !presentes.has(e.id) && temPerfil(e) && !ehTempo(e));
    let melhor = null, nota = -1;
    for(const {ex,c} of cands){
      const pf = perfil(ex);
      const s = pf.fracoes[falta]*0.55 + c.termometro/100*0.35 + (c.veredito.tipo==="confirma"?0.1:0);
      if(s>nota){ nota=s; melhor={ex, c, falta}; }
    }
    if(melhor) out.push({ex:melhor.ex, c:melhor.c, grupo:g, motivo:`${melhor.c.rotulo} nas redes e carrega o ${NOMES_REGIAO[melhor.falta]}, a parte que ${g.toLowerCase()} menos recebe aqui (${Math.round(fr[melhor.falta]*100)}%).`, score:nota});
  }
  return out.sort((a,b)=>b.score-a.score).slice(0, limite);
}
/* alternativas em alta para um exercício: mesmo grupo, termômetro alto */
function alternativasEmAlta(ex, limite){
  return rankingAlta(e=>e.grupo===ex.grupo && e.id!==ex.id).slice(0, limite||3);
}

/* =====================================================================
   ATUALIZAÇÃO SEMANAL
   Os sinais de cada semana ficam em HISTORICO_ALTA. A página publicada
   busca "alta.json" ao abrir; se houver uma versão mais nova que a
   embutida, ela substitui a pesquisa, acrescenta exercícios novos e
   passa a mostrar quem subiu, caiu ou entrou na parada.
   ===================================================================== */
const BUSCAS_ALTA = {"rosca-bayesiana":"bayesian curl","encolhimento-kelso":"kelso shrug","nordico-reverso":"reverse nordic","tibial-tib-bar":"tibialis raise",
  "jm-press":"jm press","crucifixo-polia-sentado":"seated cable fly","elevacao-y-polia":"cable y raise","lat-prayer":"lat prayer cable","agachamento-pendular":"pendulum squat",
  "jefferson-curl":"jefferson curl","prancha-copenhagen":"copenhagen plank","agachamento-zercher":"zercher squat","elevacao-lu":"lu raise shoulders","hip-thrust":"hip thrust glutes",
  "sissy-squat":"sissy squat","frog-pump":"frog pumps glutes","dragon-flag":"dragon flag","remada-meadows":"meadows row","agachamento-espanhol":"spanish squat",
  "pull-through":"cable pull through","rosca-drag":"drag curl biceps","stiff-b-stance":"b stance rdl","ponte-kas":"kas glute bridge",
  "afundo-smith-elevado":"front foot elevated smith machine lunge","elevacao-lateral-deitado":"side lying lateral raise","elevacao-lateral-polia-tras":"behind the back cable lateral raise",
  "agachamento-atg":"atg split squat knees over toes","triceps-cruzado":"cross body tricep extension cable","flexao-deficit":"deficit push up","aducao-maquina":"hip adduction machine",
  "elevacao-y-inclinado":"incline dumbbell y raise","remada-kroc":"kroc row","nordico":"nordic hamstring curl","remada-apoiada":"chest supported row seal row",
  "triceps-katana":"katana tricep extension","puxada-unilateral":"single arm lat pulldown","remada-pendlay":"pendlay row","crucifixo-inverso-maquina":"reverse pec deck rear delts",
  "rosca-scott-martelo":"preacher hammer curl","roda-abdominal":"ab wheel rollout","elevacao-lateral-polia":"cable lateral raise lengthened",
  "agachamento-cinto":"belt squat","agachamento-cossaco":"cossack squat","press-landmine":"landmine press","hiperextensao-reversa":"reverse hyperextension",
  "afundo-deficit":"deficit reverse lunge","glute-ham-raise":"glute ham raise","kettlebell-swing":"kettlebell swing"};
Object.entries(BUSCAS_ALTA).forEach(([id,b])=>{ if(ALTA_PESQUISA[id]) ALTA_PESQUISA[id].busca = b; });
/* cada semana guarda só os sinais (tt e yt); o resto da pesquisa é descritivo */
const sinaisAtuais = () => Object.fromEntries(Object.entries(ALTA_PESQUISA).map(([id,P])=>[id,{tt:P.tt, yt:P.yt}]));
let HISTORICO_ALTA = [{data:LEVANTAMENTO, semana:LEVANTAMENTO, feita:LEVANTAMENTO, fonte:"pesquisa", sinais:sinaisAtuais()}];
const ALTA_ORIGEM = {fonte:"embutida", carregado:null};
function termometrosDe(semana){
  const out = {};
  Object.entries(semana.sinais||{}).forEach(([id,s])=>{ if(porId(id)) out[id] = sinaisDe(s, semana.data).termometro; });
  return out;
}
function posicoesDe(termos){
  const ord = Object.entries(termos).sort((a,b)=>b[1]-a[1] || (porId(a[0]).nome.localeCompare(porId(b[0]).nome)));
  return Object.fromEntries(ord.map(([id],i)=>[id,i+1]));
}
let VAR_CACHE = null;
/* variação em relação à semana anterior: {novo} ou {dt, dpos}; null na primeira medição */
function variacaoAlta(id){
  if(HISTORICO_ALTA.length<2) return null;
  if(!VAR_CACHE){
    const atual = termometrosDe(HISTORICO_ALTA[HISTORICO_ALTA.length-1]), antes = termometrosDe(HISTORICO_ALTA[HISTORICO_ALTA.length-2]);
    const pa = posicoesDe(atual), pb = posicoesDe(antes);
    VAR_CACHE = {};
    Object.keys(atual).forEach(k=>{ VAR_CACHE[k] = antes[k]==null ? {novo:true} : {dt:atual[k]-antes[k], dpos:pb[k]-pa[k]}; });
    VAR_CACHE.__saiu = Object.keys(antes).filter(k=>atual[k]==null);
    VAR_CACHE.__antes = HISTORICO_ALTA[HISTORICO_ALTA.length-2].data;
  }
  return VAR_CACHE[id]||null;
}
function resumoSemana(){
  if(HISTORICO_ALTA.length<2) return null;
  variacaoAlta("");
  const ids = Object.keys(VAR_CACHE).filter(k=>!k.startsWith("__"));
  const sub = ids.filter(k=>!VAR_CACHE[k].novo && VAR_CACHE[k].dt>0).sort((a,b)=>VAR_CACHE[b].dt-VAR_CACHE[a].dt);
  const cai = ids.filter(k=>!VAR_CACHE[k].novo && VAR_CACHE[k].dt<0).sort((a,b)=>VAR_CACHE[a].dt-VAR_CACHE[b].dt);
  return {antes:VAR_CACHE.__antes, subiram:sub, cairam:cai, novos:ids.filter(k=>VAR_CACHE[k].novo), sairam:VAR_CACHE.__saiu};
}
/* exercício novo vindo da atualização: copia a alavanca de um parecido (baseId) */
function exercicioDeAtualizacao(e){
  const base = porId(e.baseId);
  if(!e.id || !e.nome || (!base && !(Array.isArray(e.juntas)&&e.juntas.length))) return null;
  const ex = Object.assign({}, base ? {grupo:base.grupo, carga:base.carga, tipo:base.tipo, frac:base.frac, bi:base.bi, equip:equipamento(base),
    juntas:JSON.parse(JSON.stringify(base.juntas))} : {}, e);
  delete ex.baseId; ex.atualizacao = true;
  ex.nota = ex.nota || (base ? `Entrou pela varredura semanal; alavanca copiada de “${base.nome}”.` : "Entrou pela varredura semanal.");
  return ex;
}
function aplicarDadosAlta(j){
  if(!j || typeof j!=="object" || !j.pesquisa || !j.levantamento) return false;
  const antes = JSON.stringify([LEVANTAMENTO, HISTORICO_ALTA.map(h=>[h.semana,h.fonte,h.feita])]);
  (j.exercicios||[]).forEach(e=>{ if(porId(e.id)) return; const ex = exercicioDeAtualizacao(e); if(ex){ BASE.push(ex); } });
  /* soma, nunca retira: quem já estava na pesquisa continua */
  Object.entries(j.pesquisa).forEach(([id,P])=>{ if(!porId(id)) return;
    if(!ALTA_PESQUISA[id] || j.levantamento >= LEVANTAMENTO) ALTA_PESQUISA[id] = Object.assign({}, ALTA_PESQUISA[id]||{}, P, {busca:P.busca||(ALTA_PESQUISA[id]||{}).busca}); });
  Object.entries(ALTA_PESQUISA).forEach(([id,P])=>{ const ex = porId(id); if(ex && !ex.fonte && P.tags) ex.fonte = {tags:P.tags, origem:P.resumo||""}; });
  const hist = Array.isArray(j.historico) && j.historico.length ? j.historico : [{data:j.levantamento, fonte:"arquivo", sinais:Object.fromEntries(Object.entries(j.pesquisa).map(([id,P])=>[id,{tt:P.tt,yt:P.yt}]))}];
  HISTORICO_ALTA = mesclarHistorico(HISTORICO_ALTA, hist.map(h=>Object.assign({fonte:"arquivo"}, h)));
  /* a semana mais recente define os sinais em vigor */
  const ult = HISTORICO_ALTA[HISTORICO_ALTA.length-1];
  Object.entries(ult.sinais).forEach(([id,s])=>{ if(ALTA_PESQUISA[id]){ ALTA_PESQUISA[id].tt = s.tt; ALTA_PESQUISA[id].yt = s.yt; } });
  LEVANTAMENTO = ult.data;
  CLASS_CACHE.clear(); VAR_CACHE = null; INDICE = null; STATS_CACHE = {};
  return JSON.stringify([LEVANTAMENTO, HISTORICO_ALTA.map(h=>[h.semana,h.fonte,h.feita])]) !== antes;
}
