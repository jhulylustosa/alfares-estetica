'use strict';

/* =========================================================
   1) CONFIGURAÇÕES — o que você vai trocar pelos dados reais
   ========================================================= */
const CONFIG = {
  nomeClinica: 'Alfares Estética Avançada',
  whatsapp: '5583991324120',

  // Endereço da planilha onde as respostas são guardadas (Google Apps Script).
  // ATENÇÃO: enquanto estiver vazio, as respostas NÃO são salvas em lugar nenhum.
  urlPlanilha: 'https://script.google.com/macros/s/AKfycbwGGt3ZYP-QJy-eoGTJBIDEsLd_802W2SvAPb1UetNGVivDxreQVoh-OazQENayX6wn/exec',
};

/* =========================================================
   2) OS 6 PERFIS (resultado do questionário)
   A resposta da pergunta 2 (letras A a F) escolhe o perfil.
   Os textos usam "costuma-se avaliar" de propósito: o site orienta,
   quem indica o procedimento é o profissional, na avaliação.
   ========================================================= */
const PERFIS = {
  A: {
    nome: 'Expressão',
    procedimento: 'Toxina botulínica',
    resumo: 'Relaxa a musculatura e suaviza as linhas sem apagar a sua expressão.',
    titulo: 'Seu rosto pede mais suavidade na expressão',
    texto:
      'As linhas que te incomodam nascem do movimento repetido dos músculos do rosto. ' +
      'Com o tempo, ficam marcadas mesmo em repouso e passam um ar de cansaço ou de braveza ' +
      'que não combina com você. Nesses casos, costuma-se avaliar a toxina botulínica, que ' +
      'relaxa a musculatura e suaviza as linhas sem apagar a sua expressão.',
  },
  B: {
    nome: 'Olhar',
    procedimento: 'Preenchimento de olheiras',
    resumo: 'Com ácido hialurônico, avaliado quando a causa é perda de volume na região.',
    titulo: 'Seu olhar pede descanso',
    texto:
      'Olheiras fundas dão aparência de cansaço mesmo depois de uma boa noite de sono, e a ' +
      'maquiagem nem sempre resolve. Quando a causa é perda de volume na região, costuma-se ' +
      'avaliar o preenchimento de olheiras com ácido hialurônico. Nem toda olheira tem a ' +
      'mesma origem, por isso a avaliação vem antes de qualquer indicação.',
  },
  C: {
    nome: 'Volume',
    procedimento: 'Preenchimento malar e zigomático',
    resumo: 'Devolve o apoio do terço médio do rosto de forma discreta.',
    titulo: 'Seu rosto pede sustentação',
    texto:
      'Com os anos, o rosto perde apoio na região das maçãs. Isso pesa a expressão e ' +
      'aprofunda o bigode chinês. Nesses casos, costuma-se avaliar o preenchimento malar e ' +
      'zigomático, que devolve o apoio do terço médio do rosto de forma discreta.',
  },
  D: {
    nome: 'Lábios',
    procedimento: 'Preenchimento labial',
    resumo: 'Trabalha volume, contorno e simetria na medida que você escolher.',
    titulo: 'Seus lábios pedem definição',
    texto:
      'Volume, contorno e simetria dos lábios mudam o equilíbrio do rosto inteiro. O ' +
      'preenchimento labial permite trabalhar cada um desses pontos na medida que você ' +
      'escolher, do mais discreto ao mais marcado.',
  },
  E: {
    nome: 'Sustentação',
    procedimento: 'Fios de PDO',
    resumo: 'Dão sustentação e estimulam a produção de colágeno.',
    titulo: 'Seu rosto pede firmeza',
    texto:
      'A flacidez muda o contorno do rosto e da mandíbula e é difícil de disfarçar. Nesses ' +
      'casos, costuma-se avaliar os fios de PDO, que dão sustentação e estimulam a produção ' +
      'de colágeno. Em alguns casos, o plano combina os fios com preenchimento para repor volume.',
  },
  F: {
    nome: 'Avaliação completa',
    procedimento: 'Plano facial combinado',
    resumo: 'Uma avaliação facial completa mostra o que faz diferença no seu caso.',
    titulo: 'Seu rosto pede um olhar por inteiro',
    texto:
      'Você percebe que algo mudou, mas não sabe dizer o quê. Isso é comum: quase sempre é a ' +
      'soma de pequenos fatores. O caminho é uma avaliação facial completa, que mostra o que ' +
      'faz diferença no seu caso e evita gastar com o que você não precisa.',
  },
};

const FRASE_FECHAMENTO =
  'O próximo passo é uma avaliação individual, em que o profissional confirma o que é indicado para você.';

/* =========================================================
   3) AS PERGUNTAS
   - "texto": o que a pessoa lê.
   - "valor": o que fica guardado quando ela escolhe.
   - Pergunta 3 é "multipla" (até 2 opções) e depende da pergunta 2.
   ========================================================= */
const EXP_NAO_GOSTEI = 'Já fiz e não gostei do resultado';
const RES_MARCANTE = 'Uma mudança marcante';

// Cria a lista de opções quando o valor é o próprio texto
const lista = (...textos) => textos.map((t) => ({ texto: t, valor: t }));

// Pergunta 2: a letra (A a F) é o que escolhe o perfil
const OPCOES_INCOMODO = [
  { valor: 'A', texto: 'Linhas e rugas na testa, entre as sobrancelhas ou ao redor dos olhos' },
  { valor: 'B', texto: 'Olheiras fundas e aparência de cansaço' },
  { valor: 'C', texto: 'Rosto “murcho”, maçãs sem volume ou bigode chinês marcado' },
  { valor: 'D', texto: 'Lábios finos, sem contorno ou assimétricos' },
  { valor: 'E', texto: 'Flacidez, rosto “caindo” ou contorno da mandíbula indefinido' },
  { valor: 'F', texto: 'Não sei apontar; só sinto que não estou na minha melhor versão' },
];

// Pergunta 4: "frase" é a linha que abre o resultado, devolvendo a resposta da pessoa
const OPCOES_DIA_A_DIA = [
  { texto: 'Evito fotos ou só posto com filtro',
    frase: 'Você contou que evita fotos ou só posta com filtro.' },
  { texto: 'Ouço que pareço cansada(o) ou brava(o), mesmo estando bem',
    frase: 'Você contou que ouve que parece cansada(o) ou brava(o), mesmo estando bem.' },
  { texto: 'Sinto que aparento mais idade do que tenho',
    frase: 'Você contou que sente que aparenta mais idade do que tem.' },
  { texto: 'Gasto tempo e maquiagem tentando disfarçar',
    frase: 'Você contou que gasta tempo e maquiagem tentando disfarçar.' },
  { texto: 'Não me atrapalha; quero prevenir ou realçar o que já gosto',
    frase: 'Você contou que isso não te atrapalha e que quer prevenir ou realçar o que já gosta.' },
];

// Tela final: "temperatura" ajuda a clínica a priorizar o atendimento
const OPCOES_PRAZO = [
  { texto: 'O quanto antes, ou tenho um evento chegando', temperatura: 'Quente' },
  { texto: 'Nos próximos 30 dias', temperatura: 'Quente' },
  { texto: 'Nos próximos 3 meses', temperatura: 'Morno' },
  { texto: 'Estou só pesquisando', temperatura: 'Frio' },
];

const PERGUNTAS = [
  {
    id: 'idade',
    texto: 'Qual é a sua faixa de idade?',
    opcoes: lista('18 a 24 anos', '25 a 34 anos', '35 a 44 anos', '45 a 54 anos', '55 anos ou mais'),
  },
  {
    id: 'incomodo',
    texto: 'Quando você se olha no espelho, o que mais te incomoda hoje?',
    opcoes: OPCOES_INCOMODO,
  },
  {
    id: 'secundario',
    multipla: true,
    max: 2,
    texto: 'Tem mais alguma coisa que também te incomoda?',
    // As opções A a E, sem a que já foi escolhida na pergunta 2
    opcoes: (r) => [
      ...OPCOES_INCOMODO.filter((o) => o.valor !== 'F' && o.valor !== r.incomodo),
      { texto: 'Não, é só isso', valor: 'nenhum' },
    ],
  },
  {
    id: 'diaADia',
    texto: 'Como isso aparece no seu dia a dia?',
    opcoes: lista(...OPCOES_DIA_A_DIA.map((o) => o.texto)),
  },
  {
    id: 'tempo',
    texto: 'Há quanto tempo isso te incomoda?',
    opcoes: lista('Menos de 6 meses', 'De 6 meses a 2 anos', 'Mais de 2 anos'),
  },
  {
    id: 'resultado',
    texto: 'Que tipo de resultado você procura?',
    opcoes: lista(
      'Bem natural: quero que ninguém perceba que fiz algo',
      'Visível, mas harmônico',
      RES_MARCANTE,
      'Prefiro que o profissional me oriente'
    ),
  },
  {
    id: 'experiencia',
    texto: 'Você já fez algum procedimento estético no rosto?',
    opcoes: lista(
      'Nunca; seria a minha primeira vez',
      'Já fiz e gostei',
      EXP_NAO_GOSTEI,
      'Faço com frequência'
    ),
  },
  {
    id: 'objecao',
    texto: 'O que te impediu de resolver isso até agora?',
    opcoes: lista(
      'Medo de ficar artificial',
      'Medo de dor ou de complicações',
      'Não sei qual procedimento é o certo para mim',
      'O valor',
      'Falta de tempo',
      'Ainda não encontrei um profissional de confiança',
      'Nada; estou pronta(o) para começar'
    ),
  },
];

// 8 perguntas + a tela de contato
const TOTAL_ETAPAS = PERGUNTAS.length + 1;

/* =========================================================
   4) ESTADO DO QUIZ (o que está acontecendo agora)
   ========================================================= */
let respostas = {}; // ex: { idade: '35 a 44 anos', incomodo: 'A', secundario: ['B','C'], ... }
let etapa = 0;      // 0 a 7 = perguntas; 8 = tela de contato

const caixa = document.getElementById('quiz-caixa');

/* Pequena ferramenta para criar elementos HTML pelo JavaScript */
function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

const minuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);

function perguntaPorId(id) {
  return PERGUNTAS.find((p) => p.id === id);
}

// As opções podem ser uma lista fixa ou uma função (caso da pergunta 3)
function opcoesDe(pergunta) {
  return typeof pergunta.opcoes === 'function' ? pergunta.opcoes(respostas) : pergunta.opcoes;
}

// Transforma o valor guardado (ex.: 'A') no texto da opção
function textoDe(id, valor) {
  const opcao = opcoesDe(perguntaPorId(id)).find((o) => o.valor === valor);
  return opcao ? opcao.texto : valor;
}

// Letras da pergunta 3 que continuam valendo (A a E, diferentes da pergunta 2)
function secundariosAtuais() {
  return (respostas.secundario || []).filter(
    (v) => 'ABCDE'.includes(v) && v !== respostas.incomodo
  );
}

/* Depois de trocar de tela: foca o título e, se preciso, rola até o quiz */
function aoTrocarTela(titulo) {
  titulo.tabIndex = -1;
  titulo.focus({ preventScroll: true });
  const topo = caixa.getBoundingClientRect().top;
  if (topo < 80) window.scrollTo({ top: window.scrollY + topo - 90, behavior: 'smooth' });
}

function cabecalho(textoContador, fracao) {
  const trilho = el('div', 'progresso');
  const barra = el('div', 'progresso-barra');
  barra.style.width = fracao * 100 + '%';
  trilho.append(barra);
  return [trilho, el('p', 'contador', textoContador)];
}

function botaoVoltar(acao) {
  const botao = el('button', 'voltar', '← Voltar');
  botao.type = 'button';
  botao.addEventListener('click', acao);
  return botao;
}

/* =========================================================
   5) TELAS DO QUIZ
   ========================================================= */

/* Tela de abertura */
function mostrarAbertura(primeiraVez) {
  caixa.replaceChildren();

  const titulo = el('h3', 'pergunta-titulo', 'Descubra em 1 minuto o que o seu rosto está pedindo');
  const subtitulo = el(
    'p',
    'subtitulo',
    'Responda 8 perguntas rápidas e receba uma orientação personalizada, sem compromisso.'
  );
  const comecar = el('button', 'botao', 'Começar');
  comecar.type = 'button';
  comecar.addEventListener('click', () => {
    etapa = 0;
    mostrarEtapa();
  });

  caixa.append(titulo, subtitulo, comecar);
  if (!primeiraVez) aoTrocarTela(titulo); // na abertura da página não mexe no foco
}

function mostrarEtapa() {
  if (etapa < PERGUNTAS.length) mostrarPergunta();
  else mostrarContato();
}

function avancar() {
  etapa += 1;
  mostrarEtapa();
}

function voltar() {
  if (etapa === 0) {
    mostrarAbertura();
  } else {
    etapa -= 1;
    mostrarEtapa();
  }
}

/* Uma pergunta por tela */
function mostrarPergunta() {
  const pergunta = PERGUNTAS[etapa];
  const opcoes = opcoesDe(pergunta);

  caixa.replaceChildren();
  caixa.append(...cabecalho(`Pergunta ${etapa + 1} de ${PERGUNTAS.length}`, etapa / TOTAL_ETAPAS));

  const titulo = el('h3', 'pergunta-titulo', pergunta.texto);
  caixa.append(titulo);

  if (pergunta.multipla) caixa.append(...blocoMultipla(pergunta, opcoes));
  else caixa.append(blocoUnica(pergunta, opcoes));

  caixa.append(botaoVoltar(voltar));
  aoTrocarTela(titulo);
}

/* Escolha única: clicou, guardou, foi para a próxima */
function blocoUnica(pergunta, opcoes) {
  const listaOpcoes = el('div', 'opcoes');
  opcoes.forEach((opcao) => {
    const botao = el('button', 'opcao', opcao.texto);
    botao.type = 'button';
    if (respostas[pergunta.id] === opcao.valor) botao.classList.add('selecionada');
    botao.addEventListener('click', () => {
      respostas[pergunta.id] = opcao.valor;
      avancar();
    });
    listaOpcoes.append(botao);
  });
  return listaOpcoes;
}

/* Escolha múltipla (pergunta 3): até 2 opções, ou "Não, é só isso" */
function blocoMultipla(pergunta, opcoes) {
  const ajuda = el('p', 'ajuda', `Escolha até ${pergunta.max} opções.`);
  const listaOpcoes = el('div', 'opcoes');
  const continuar = el('button', 'botao', 'Continuar');
  continuar.type = 'button';

  // Só mantém respostas antigas que ainda existem nesta lista
  let escolhidas = (respostas[pergunta.id] || []).filter((v) => opcoes.some((o) => o.valor === v));
  const botoes = [];

  function atualizar() {
    const nenhum = escolhidas.includes('nenhum');
    const cheio = !nenhum && escolhidas.length >= pergunta.max;
    botoes.forEach(({ botao, opcao }) => {
      const marcada = escolhidas.includes(opcao.valor);
      botao.classList.toggle('selecionada', marcada);
      botao.setAttribute('aria-pressed', String(marcada));
      botao.disabled = cheio && !marcada && opcao.valor !== 'nenhum';
    });
    continuar.disabled = escolhidas.length === 0;
  }

  opcoes.forEach((opcao) => {
    const botao = el('button', 'opcao', opcao.texto);
    botao.type = 'button';
    botao.addEventListener('click', () => {
      if (opcao.valor === 'nenhum') {
        escolhidas = escolhidas.includes('nenhum') ? [] : ['nenhum'];
      } else {
        escolhidas = escolhidas.filter((v) => v !== 'nenhum');
        if (escolhidas.includes(opcao.valor)) {
          escolhidas = escolhidas.filter((v) => v !== opcao.valor);
        } else if (escolhidas.length < pergunta.max) {
          escolhidas.push(opcao.valor);
        }
      }
      atualizar();
    });
    botoes.push({ botao, opcao });
    listaOpcoes.append(botao);
  });

  continuar.addEventListener('click', () => {
    respostas[pergunta.id] = escolhidas;
    avancar();
  });

  atualizar();
  const acoes = el('div', 'acoes-quiz');
  acoes.append(continuar);
  return [ajuda, listaOpcoes, acoes];
}

/* Deixa o telefone no formato (83) 99999-9999 enquanto a pessoa digita */
function formatarTelefone(valor) {
  let d = valor.replace(/\D/g, '');
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2); // se colou com +55
  d = d.slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* Tela final: prazo + nome + WhatsApp + consentimento */
function mostrarContato() {
  caixa.replaceChildren();
  caixa.append(...cabecalho('Último passo', etapa / TOTAL_ETAPAS));

  const titulo = el('h3', 'pergunta-titulo', 'Quando você gostaria de começar?');
  caixa.append(titulo);

  // Prazo (escolha única, sem avançar sozinho)
  const listaPrazo = el('div', 'opcoes');
  const botoesPrazo = [];
  OPCOES_PRAZO.forEach((opcao) => {
    const botao = el('button', 'opcao', opcao.texto);
    botao.type = 'button';
    botao.addEventListener('click', () => {
      respostas.prazo = opcao.texto;
      botoesPrazo.forEach((b) => b.classList.toggle('selecionada', b === botao));
    });
    if (respostas.prazo === opcao.texto) botao.classList.add('selecionada');
    botoesPrazo.push(botao);
    listaPrazo.append(botao);
  });
  caixa.append(listaPrazo);

  // Formulário
  const form = el('form', 'formulario');
  form.noValidate = true;

  const campoNome = el('input');
  campoNome.type = 'text';
  campoNome.autocomplete = 'name';
  campoNome.maxLength = 80;
  campoNome.value = respostas.nome || '';
  campoNome.addEventListener('input', () => (respostas.nome = campoNome.value));

  const campoZap = el('input');
  campoZap.type = 'tel';
  campoZap.inputMode = 'numeric';
  campoZap.autocomplete = 'tel-national';
  campoZap.placeholder = '(00) 00000-0000';
  campoZap.value = respostas.whatsapp || '';
  campoZap.addEventListener('input', () => {
    campoZap.value = formatarTelefone(campoZap.value);
    respostas.whatsapp = campoZap.value;
  });

  const rotuloNome = el('label', 'campo');
  rotuloNome.append(el('span', null, 'Seu nome'), campoNome);
  const rotuloZap = el('label', 'campo');
  rotuloZap.append(el('span', null, 'Seu WhatsApp (com DDD)'), campoZap);

  const caixinha = el('input');
  caixinha.type = 'checkbox';
  caixinha.checked = !!respostas.consentimento;
  caixinha.addEventListener('change', () => (respostas.consentimento = caixinha.checked));
  const rotuloConsent = el('label', 'consentimento');
  rotuloConsent.append(
    caixinha,
    el('span', null, 'Autorizo o contato pelo WhatsApp e o uso das minhas respostas para o meu atendimento.')
  );

  const erro = el('p', 'erro');
  erro.setAttribute('role', 'alert');

  const enviar = el('button', 'botao', 'Ver meu resultado');
  enviar.type = 'submit';

  form.append(rotuloNome, rotuloZap, rotuloConsent, erro, enviar);

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const nome = campoNome.value.trim();
    let digitos = campoZap.value.replace(/\D/g, '');
    if (digitos.length > 11 && digitos.startsWith('55')) digitos = digitos.slice(2);

    if (!respostas.prazo) return (erro.textContent = 'Escolha quando você gostaria de começar.');
    if (nome.length < 2) return (erro.textContent = 'Informe o seu nome.');
    if (digitos.length < 10 || digitos.length > 11) {
      return (erro.textContent = 'Informe um WhatsApp válido, com DDD.');
    }
    if (!caixinha.checked) {
      return (erro.textContent = 'Para ver o resultado, marque a autorização de contato.');
    }

    respostas.nome = nome;
    respostas.whatsapp = formatarTelefone(digitos);
    respostas.consentimento = true;
    finalizar();
  });

  caixa.append(form, botaoVoltar(voltar));
  aoTrocarTela(titulo);
}

/* =========================================================
   6) RESULTADO, WHATSAPP E REGISTRO DAS RESPOSTAS
   ========================================================= */
function montarMensagem() {
  const perfil = PERFIS[respostas.incomodo];
  const secundarios = secundariosAtuais().map((v) => textoDe('secundario', v));
  return [
    'Olá! Fiz a avaliação no site.',
    `${respostas.nome}.`,
    `Meu resultado: ${perfil.nome}.`,
    `O que mais me incomoda: ${textoDe('incomodo', respostas.incomodo)}.`,
    `Também me incomoda: ${secundarios.length ? secundarios.join('; ') : 'Não, é só isso'}.`,
    `No dia a dia: ${respostas.diaADia}.`,
    `Procuro um resultado: ${respostas.resultado}.`,
    `Experiência: ${respostas.experiencia}.`,
    `O que me segurou até agora: ${respostas.objecao}.`,
    `Quero começar, ${respostas.prazo}`,
  ].join('\n');
}

function linkWhatsApp(mensagem) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/* Tudo o que vai para a planilha (inclui o que não vai na mensagem) */
function montarDados() {
  const perfil = PERFIS[respostas.incomodo];
  const secundarios = secundariosAtuais().map((v) => textoDe('secundario', v));
  const prazo = OPCOES_PRAZO.find((o) => o.texto === respostas.prazo);

  const atencao = [];
  if (respostas.experiencia === EXP_NAO_GOSTEI) atencao.push('Ouvir antes de qualquer oferta');
  if (respostas.resultado === RES_MARCANTE) atencao.push('Alinhar expectativas logo no início');

  return {
    dataHora: new Date().toISOString(),
    nome: respostas.nome,
    whatsapp: respostas.whatsapp,
    consentimento: 'Sim',
    perfil: perfil.nome,
    idade: respostas.idade,
    incomodoPrincipal: textoDe('incomodo', respostas.incomodo),
    tambemIncomoda: secundarios.length ? secundarios.join(' | ') : 'Não, é só isso',
    diaADia: respostas.diaADia,
    tempo: respostas.tempo,
    resultadoProcurado: respostas.resultado,
    experiencia: respostas.experiencia,
    objecao: respostas.objecao,
    prazo: respostas.prazo,
    temperatura: prazo ? prazo.temperatura : '',
    atencao: atencao.join('; '),
  };
}

/* Envia as respostas para a planilha, se o endereço estiver configurado */
function salvarRespostas(dados) {
  if (!CONFIG.urlPlanilha) return;
  try {
    fetch(CONFIG.urlPlanilha, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true, // continua enviando mesmo se a pessoa já abrir o WhatsApp
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(dados),
    }).catch(() => {});
  } catch (e) {
    /* se falhar, a pessoa ainda vê o resultado normalmente */
  }
}

function finalizar() {
  salvarRespostas(montarDados()); // salva NO MOMENTO em que clica em "Ver meu resultado"
  mostrarResultado();
}

function mostrarResultado() {
  const perfil = PERFIS[respostas.incomodo];
  const dor = OPCOES_DIA_A_DIA.find((o) => o.texto === respostas.diaADia);
  const secundarios = secundariosAtuais().map((v) => minuscula(textoDe('secundario', v)));

  caixa.replaceChildren();
  caixa.append(...cabecalho('Seu resultado', 1));

  const titulo = el('h3', 'pergunta-titulo', perfil.titulo);
  caixa.append(el('span', 'selo', `Perfil ${perfil.nome}`), titulo);

  // Todo resultado abre devolvendo o que a pessoa respondeu na pergunta 4
  if (dor) caixa.append(el('p', 'dor', dor.frase));
  caixa.append(el('p', 'texto-resultado', perfil.texto));

  if (secundarios.length) {
    caixa.append(
      el(
        'p',
        'texto-resultado',
        `Você também mencionou ${secundarios.join(' e ')}. Isso entra na mesma avaliação.`
      )
    );
  }

  caixa.append(el('p', 'fechamento', FRASE_FECHAMENTO));

  const acoes = el('div', 'acoes');
  const cta = el('a', 'botao', 'Quero minha avaliação pelo WhatsApp');
  cta.href = linkWhatsApp(montarMensagem());
  cta.target = '_blank';
  cta.rel = 'noopener';

  const refazer = el('button', 'botao botao-contorno', 'Refazer o questionário');
  refazer.type = 'button';
  refazer.addEventListener('click', iniciarQuiz);

  acoes.append(cta, refazer);
  caixa.append(acoes);
  aoTrocarTela(titulo);
}

function iniciarQuiz(primeiraVez) {
  respostas = {};
  etapa = 0;
  mostrarAbertura(primeiraVez === true);
}

/* =========================================================
   7) VITRINE DE PROCEDIMENTOS NA PÁGINA
   Usa a mesma lista de perfis lá de cima.
   ========================================================= */
function montarGrade() {
  const grade = document.getElementById('grade-procedimentos');
  Object.values(PERFIS).forEach((perfil) => {
    const cartao = el('article', 'cartao');
    cartao.append(
      el('span', 'etiqueta', `Perfil ${perfil.nome}`),
      el('h3', null, perfil.procedimento),
      el('p', null, perfil.resumo)
    );
    grade.append(cartao);
  });
}

/* =========================================================
   8) LIGAR TUDO QUANDO A PÁGINA ABRIR
   ========================================================= */
montarGrade();
iniciarQuiz(true);

document.getElementById('ano').textContent = new Date().getFullYear();
document.getElementById('botao-whatsapp').href =
  linkWhatsApp(`Olá! Gostaria de agendar uma avaliação na ${CONFIG.nomeClinica}.`);