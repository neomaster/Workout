// Troca dados sensíveis por •••••• no texto que vai para a TELA.
// Funções puras (nada do Claude Code aqui), para os testes chamarem direto.
//
// Sem barra invertida em lugar nenhum: os padrões são montados com classes como
// [0-9], [.] e [$], e os caracteres especiais vêm de String.fromCharCode.

export const OCULTO = '••••••'

const ASPAS = '"' + "'"
const CRASE = String.fromCharCode(96)
// Espaço, tab, quebras de linha e espaço não separável.
const BRANCO = ' ' + String.fromCharCode(9, 10, 13, 160)
// Começo e fim de "palavra": não colado em letra, número ou sublinhado.
const INI = '(?<![A-Za-z0-9_])'
const FIM = '(?![A-Za-z0-9_])'
// Número não colado em outro número (para telefones e documentos).
const INI_NUM = '(?<![0-9A-Za-z_])'
const FIM_NUM = '(?![0-9A-Za-z_])'

type Troca = (trecho: string, ...grupos: string[]) => string
type Regra = [RegExp, Troca]

const tudo: Troca = () => OCULTO
// Mantém o rótulo (ex.: "senha: ") e esconde só o valor.
const soOValor: Troca = (_trecho, rotulo) => rotulo + OCULTO

const re = (fonte: string, flags = 'g') => new RegExp(fonte, flags)

// ---------- dígitos verificadores ----------

function digitos(texto: string) {
  return texto.split('').map(Number)
}

function cpfValido(n: string): boolean {
  if (n.length !== 11 || n.split('').every(c => c === n[0])) return false
  const d = digitos(n)
  for (const tamanho of [9, 10]) {
    let soma = 0
    for (let i = 0; i < tamanho; i++) soma += (d[i] ?? 0) * (tamanho + 1 - i)
    if (((soma * 10) % 11) % 10 !== d[tamanho]) return false
  }
  return true
}

function cnpjValido(n: string): boolean {
  if (n.length !== 14 || n.split('').every(c => c === n[0])) return false
  const d = digitos(n)
  const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (const tamanho of [12, 13]) {
    let soma = 0
    const p = pesos.slice(pesos.length - tamanho)
    for (let i = 0; i < tamanho; i++) soma += (d[i] ?? 0) * (p[i] ?? 0)
    const resto = soma % 11
    if ((resto < 2 ? 0 : 11 - resto) !== d[tamanho]) return false
  }
  return true
}

// Números colados: celular com DDD (11 dígitos, ou 13 com o 55), CPF ou CNPJ válidos.
const numeroColado: Troca = trecho => {
  if (re('^(?:55)?[1-9]{2}9[0-9]{8}$', '').test(trecho)) return OCULTO
  if (trecho.length === 11 && cpfValido(trecho)) return OCULTO
  if (trecho.length === 14 && cnpjValido(trecho)) return OCULTO
  return trecho
}

// Sequência longa com cara de aleatória (chave, token): letras maiúsculas,
// minúsculas e números misturados o tempo todo. Hash de commit (só minúsculas
// e números) e nomes em CamelCase não entram.
const pareceAleatorio: Troca = trecho => {
  const tipo = (c: string) =>
    c >= '0' && c <= '9' ? 'n' : c >= 'a' && c <= 'z' ? 'm' : c >= 'A' && c <= 'Z' ? 'M' : '-'
  const tipos = trecho.split('').map(tipo)
  if (!tipos.includes('n') || !tipos.includes('m') || !tipos.includes('M')) return trecho
  // Quantas vezes o tipo de caractere muda, e o maior trecho seguido do mesmo tipo
  // (palavras como "Cadastro" deixam trechos longos; chaves quase nunca).
  let trocas = 0
  let seguidos = 1
  let maiorTrecho = 1
  for (let i = 1; i < tipos.length; i++) {
    if (tipos[i] !== tipos[i - 1]) {
      trocas++
      seguidos = 1
    } else {
      seguidos++
      maiorTrecho = Math.max(maiorTrecho, seguidos)
    }
  }
  const taxa = trocas / trecho.length
  return taxa >= 0.5 || (taxa >= 0.3 && maiorTrecho <= 6) ? OCULTO : trecho
}

// ---------- regras (a ordem importa) ----------

const NOME = '[A-Za-z0-9_.-]*'
const ABRE = '[' + ASPAS + CRASE + '*_]*'
const VALOR = '[^' + BRANCO + ASPAS + CRASE + ',;}]+'
const SEP_VALOR = '[' + ASPAS + CRASE + '*_]*[' + BRANCO + ']*[:=][' + BRANCO + ASPAS + CRASE + '*_]*'

// Final de telefone: 9 opcional, depois 4 + 4 dígitos.
const FONE = '(?:9[ .]?)?[0-9]{4}[ .-]?[0-9]{4}'

const REGRAS: Regra[] = [
  // Senha dentro de endereço: postgres://usuario:SENHA@servidor
  [re('(://[^' + BRANCO + ':/@]+:)[^' + BRANCO + '@/]+(?=@)'), soOValor],

  // senha: xxx · password = xxx · "password": "xxx" · DB_PASSWORD=xxx · **Senha:** xxx
  [
    re('(' + ABRE + INI + NOME + '(?:senha|password|passwd|pwd)' + NOME + SEP_VALOR + ')(' + VALOR + ')', 'gi'),
    soOValor,
  ],
  // "a senha é abacaxi99"
  [re('(' + INI + '(?:senha|password)[' + BRANCO + ']+(?:é|eh|is)[' + BRANCO + ']+)([^' + BRANCO + ']+)', 'gi'), soOValor],

  // token / secret / api_key = valor (8 ou mais caracteres, não só números)
  [
    re(
      '(' + ABRE + INI + NOME +
        '(?:secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key)' +
        NOME + SEP_VALOR + ')(?![0-9]+' + FIM + ')([^' + BRANCO + ASPAS + CRASE + ',;}]{8,})',
      'gi',
    ),
    soOValor,
  ],
  // Authorization: Bearer xxxxx
  [re('(' + INI + 'Bearer[' + BRANCO + ']+)[A-Za-z0-9._~+/-]{8,}=*'), soOValor],

  // Chaves com prefixo conhecido (OpenAI, Anthropic, Stripe, GitHub, Slack, AWS, Google...)
  [
    re(
      INI +
        '(?:sk-(?:ant-|proj-)?[A-Za-z0-9_-]{16,}|[spr]k_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{20,}' +
        '|github_pat_[A-Za-z0-9_]{20,}|xox[abprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}' +
        '|glpat-[A-Za-z0-9_-]{20,}|hf_[A-Za-z0-9]{30,}|r8_[A-Za-z0-9]{30,})',
    ),
    tudo,
  ],
  // JWT (eyJ....eyJ....assinatura)
  [re(INI + 'eyJ[A-Za-z0-9_-]{8,}[.][A-Za-z0-9_-]{8,}[.][A-Za-z0-9_-]{8,}'), tudo],
  // Sequências longas com cara de aleatórias
  [re(INI + '[A-Za-z0-9_-]{32,}' + FIM), pareceAleatorio],

  // E-mail
  [re('[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:[.][A-Za-z0-9-]+)*[.][A-Za-z]{2,}'), tudo],

  // Valores em reais: R$ 1.234,56 · R$10 · R$ -50,00
  [re(INI + 'R[$][' + BRANCO + ']?-?[0-9]+(?:[.,][0-9]+)*'), tudo],

  // CNPJ formatado: 12.345.678/0001-90
  [re(INI_NUM + '[0-9]{2}[.][0-9]{3}[.][0-9]{3}/[0-9]{4}-[0-9]{2}' + FIM_NUM), tudo],
  // CPF formatado: 123.456.789-09 · 123456789-09
  [re(INI_NUM + '(?:[0-9]{3}[.][0-9]{3}[.][0-9]{3}|[0-9]{9})-[0-9]{2}' + FIM_NUM), tudo],

  // Telefones
  // (11) 98765-4321 · +55 (11) 3456-7890 · (11) 9 8765-4321
  [re('(?:[+][0-9]{1,3}[ .-]?)?[(][0-9]{2}[)][ ]?' + FONE + FIM_NUM), tudo],
  // +55 11 98765-4321 · +5511987654321
  [re('[+]55[ .-]?[0-9]{2}[ .-]?' + FONE + FIM_NUM), tudo],
  // 11 98765-4321 · 11 3456-7890
  [re(INI_NUM + '[0-9]{2}[ ](?:9[ .]?)?[0-9]{4}[-.][0-9]{4}' + FIM_NUM), tudo],
  // 98765-4321 (celular sem DDD)
  [re(INI_NUM + '9[0-9]{4}-[0-9]{4}' + FIM_NUM), tudo],

  // Números colados: celular, CPF ou CNPJ (só se o dígito verificador bater)
  [re(INI_NUM + '[0-9]{11,14}' + FIM_NUM), numeroColado],
]

/** O texto com os dados sensíveis trocados por ••••••. */
export function mascarar(texto: string): string {
  let saida = texto
  for (const [regex, troca] of REGRAS) saida = saida.replace(regex, troca)
  return saida
}

/** Percorre objetos e listas trocando só os textos; a forma (chaves, números) fica. */
export function mascararTudo<T>(valor: T): T {
  if (typeof valor === 'string') return mascarar(valor) as T
  if (Array.isArray(valor)) return valor.map(item => mascararTudo(item)) as T
  if (valor !== null && typeof valor === 'object') {
    const copia: Record<string, unknown> = {}
    for (const [chave, item] of Object.entries(valor)) copia[chave] = mascararTudo(item)
    return copia as T
  }
  return valor
}
