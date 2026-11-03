'use strict';

/* =========================================================
   CARTÕES DE PROCEDIMENTO
   Cada cartão mostra etiqueta, título e resumo. Ao passar o mouse
   (ou tocar / apertar Enter), aparecem a foto e a explicação.
   Cada cartão abre e fecha sozinho, sem mexer nos outros.

   Para mudar um texto ou uma foto, edite a lista abaixo.
   As fotos ficam na pasta "img", ao lado do index.html.
   ========================================================= */
(function () {
  const PROCEDIMENTOS = [
    {
      etiqueta: 'Perfil Expressão',
      titulo: 'Toxina botulínica',
      resumo: 'Relaxa a musculatura e suaviza as linhas sem apagar a sua expressão.',
      fotos: ['img/botox1.jpg', 'img/botox2.jpg', 'img/botox3.jpg'],
      explicacao: 'O resultado aparece gradualmente em 7 a 15 dias. A pele fica lisa, mas você continua fazendo expressões naturalmente. Duração de 4 a 6 meses.',
    },
    {
      etiqueta: 'Perfil Olhar',
      titulo: 'Preenchimento de olheiras',
      resumo: 'Com ácido hialurônico, avaliado quando a causa é perda de volume na região.',
      fotos: ['img/olheira1.jpg', 'img/olheira2.jpg', 'img/olheira3.jpg', 'img/olheira4.jpg'],
      explicacao: 'Devolve o volume perdido e suaviza a transição entre pálpebra e bochecha. O olhar descansa de forma natural, sem aparência de inchado. Resultado imediato.',
    },
    {
      etiqueta: 'Perfil Volume',
      titulo: 'Preenchimento malar e zigomático',
      resumo: 'Devolve o apoio do terço médio do rosto de forma discreta.',
      fotos: ['img/mento1.jpg', 'img/mandibula.jpg', 'img/mento2.jpg','img/mandibula2.jpg', 'img/rinomodelação.jpg'], /*partes do rosto diferentes, se for o caso muda o nome da foto*/
      explicacao: 'Reposiciona o apoio facial, levantando suavemente as maçãs e suavizando o bigode chinês. O rosto ganha harmonia e firmeza com aparência natural.',
    },
    {
      etiqueta: 'Perfil Lábios',
      titulo: 'Preenchimento labial',
      resumo: 'Trabalha volume, contorno e simetria na medida que você escolher.',
      fotos: ['img/labial1.jpg', 'img/labial2.jpg', 'img/labial3.jpg', 'img/labial4.jpg', 'img/labial5.jpg', 'img/labial6.jpg', 'img/labial7.jpg', 'img/labial8.jpg', 'img/labial9.jpg', 'img/labial10.jpg', 'img/labial11.jpg', 'img/labial12.jpg'],
      explicacao: 'Define o contorno, dá volume e equilibra proporções. O resultado é personalizado: do mais discreto ao mais marcante. Aplicação confortável e segura.',
    },
    {
      etiqueta: 'Perfil Sustentação',
      titulo: 'Fios de PDO',
      resumo: 'Dão sustentação e estimulam a produção de colágeno.',
      fotos: ['img/fiosPDO1.jpg', 'img/fiosPDO2.jpg'],
      explicacao: 'Recoloca o tecido no lugar certo e estimula a pele a produzir mais colágeno. A sustentação melhora logo no primeiro dia e continua evoluindo por meses.',
    },
    {
      etiqueta: 'Perfil Avaliação Completa',
      titulo: 'Plano facial combinado',
      resumo: 'Uma avaliação facial completa mostra o que faz diferença no seu caso.',
      fotos: ['img/fullface1.jpg', 'img/fullface2.jpg', 'img/fullface3.jpg'],
      explicacao: 'Um olhar integral sobre o rosto: cada detalhe é avaliado para propor um plano que valoriza o que já existe de melhor em você, de forma personalizada.',
    },
  ];

  const grade = document.getElementById('grade-procedimentos');
  if (!grade) return;

  // Limpa o que o script.js tenha criado antes, para os cartões não ficarem repetidos
  grade.replaceChildren();

  /* Pequena ferramenta para criar elementos HTML */
  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  /* Abre ou fecha SÓ o cartão que foi clicado */
  function alternar(cartao) {
    cartao.classList.toggle('ativo');
  }

  PROCEDIMENTOS.forEach((proc) => {
    const cartao = el('article', 'cartao-procedimento');
    cartao.tabIndex = 0; // permite chegar no cartão com a tecla Tab

        // Carrossel de fotos
    const foto = el('div', 'foto-resultado');
    const faixa = el('div', 'foto-faixa');
    (proc.fotos || []).forEach((src, i) => {
      const img = el('img');
      img.src = src;
      img.alt = `${proc.titulo} - foto ${i + 1}`;
      img.loading = 'lazy';
      img.addEventListener('error', () => img.replaceWith(el('div', 'foto-falta', 'Foto de exemplo')));
      faixa.append(img);
    });
    foto.append(faixa);

    if (faixa.children.length > 1) {
      const esq = el('button', 'foto-seta foto-esq', '‹');
      const dir = el('button', 'foto-seta foto-dir', '›');
      esq.type = dir.type = 'button';
      esq.setAttribute('aria-label', 'Foto anterior');
      dir.setAttribute('aria-label', 'Próxima foto');
      const pontos = el('div', 'foto-pontos');
      [...faixa.children].forEach(() => pontos.append(el('span', 'foto-ponto')));
      pontos.firstChild.classList.add('ativo');

      const ir = (d) => faixa.scrollBy({ left: d * faixa.clientWidth, behavior: 'smooth' });
      esq.addEventListener('click', (e) => { e.stopPropagation(); ir(-1); });
      dir.addEventListener('click', (e) => { e.stopPropagation(); ir(1); });
      faixa.addEventListener('scroll', () => {
        if (!faixa.clientWidth) return;
        const n = Math.round(faixa.scrollLeft / faixa.clientWidth);
        [...pontos.children].forEach((p, k) => p.classList.toggle('ativo', k === n));
      });
      foto.append(esq, dir, pontos);
    }
    foto.addEventListener('click', (e) => e.stopPropagation()); // mexer na foto não fecha o cartão

    cartao.append(
      el('span', 'etiqueta', proc.etiqueta),
      el('h3', null, proc.titulo),
      el('p', 'resumo', proc.resumo),
      foto,
      el('p', 'explicacao', proc.explicacao)
    );

    cartao.addEventListener('click', () => alternar(cartao));
    cartao.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        alternar(cartao);
      }
    });

    grade.append(cartao);
  });
})();
