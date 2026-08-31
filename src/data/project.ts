export const navItems = [
  { href: "/", label: "Início" },
  { href: "/projeto", label: "Projeto" },
  { href: "/resultados", label: "Resultados" },
  { href: "/webgis", label: "WebGIS" },
  { href: "/mapas", label: "Mapas" },
  { href: "/registros", label: "Registros" },
  { href: "/documentos", label: "Documentos" }
];

export const projectSummary =
  "Pesquisa para desenvolvimento de ações de recuperação ambiental de áreas de recarga da Bacia Hidrográfica do Rio Potengi.";

export const recoveryAreas = [
  { area: "Nascentes do Potengi", municipality: "Cerro Corá", hectares: 2.28 },
  { area: "APP do Açude Eloy de Souza", municipality: "Cerro Corá", hectares: 3.11 },
  { area: "Fazenda Mundo Novo", municipality: "São Tomé", hectares: 5.05 },
  { area: "Açude do Bêbado - Escola Agrícola de Jundiaí", municipality: "Macaíba", hectares: 5.81 }
];

export const recoveryTotalHectares = recoveryAreas.reduce((sum, item) => sum + item.hectares, 0);

export const formatHectares = (value: number) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha`;

export const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

export const projectPeriod = {
  agreement: "TED nº 23/2021/MDR",
  start: "29/12/2021",
  end: "30/04/2026"
};

export const projectInvestmentByGoal = [
  { id: "meta-1", label: "Meta 1", shortTitle: "Diagnóstico", value: 380000 },
  { id: "meta-2", label: "Meta 2", shortTitle: "Educação ambiental", value: 320000 },
  { id: "meta-3", label: "Meta 3", shortTitle: "Validação", value: 200000 },
  { id: "meta-4", label: "Meta 4", shortTitle: "Recuperação", value: 1900000 },
  { id: "meta-5", label: "Meta 5", shortTitle: "Monitoramento", value: 60000 },
  { id: "meta-6", label: "Meta 6", shortTitle: "Saneamento", value: 20000 },
  { id: "meta-7", label: "Meta 7", shortTitle: "Comunicação", value: 120000 }
];

export const projectInvestmentTotal = projectInvestmentByGoal.reduce((sum, item) => sum + item.value, 0);

export const openingIndicators = [
  { value: "7", label: "metas concluídas" },
  { value: "25", label: "municípios no diagnóstico de saneamento" },
  { value: "4", label: "áreas de recuperação" },
  { value: formatHectares(recoveryTotalHectares), label: "de recuperação ambiental" },
  { value: "R$ 3,0 mi", label: "recursos aplicados nas sete metas" }
];

export const institutions = [
  "Universidade Federal do Rio Grande do Norte",
  "Fundação Norte-Rio-Grandense de Pesquisa e Cultura",
  "Ministério da Integração e do Desenvolvimento Regional",
  "Secretaria do Meio Ambiente e dos Recursos Hídricos do Rio Grande do Norte"
];

export const timeline = [
  { year: "2021", event: "Início da vigência em 29 de dezembro de 2021." },
  { year: "2022", event: "Início operacional em fevereiro e estruturação dos levantamentos." },
  { year: "2023-2025", event: "Diagnósticos, validações em campo, ações de recuperação e produção acadêmica." },
  { year: "2026", event: "Encerramento da vigência e consolidação pública dos resultados." }
];

export const goals = [
  {
    id: "meta-1",
    shortTitle: "Diagnóstico territorial",
    title: "Meta 1 - Diagnóstico socioeconômico e ambiental",
    objective: "Caracterizar a bacia e definir áreas prioritárias para conservação e recuperação.",
    actions: [
      "Levantamentos climáticos, hidrológicos, geológicos, pedológicos e geomorfológicos.",
      "Análise de uso e cobertura da terra, população, usos da água e doenças de veiculação hídrica.",
      "Diagnóstico de nascentes e APPs, análise multicritério e álgebra de mapas."
    ],
    results: [
      "Base territorial organizada para orientar a priorização espacial das intervenções.",
      "Mapa de vulnerabilidade ambiental consolidado como referência central do WebGIS."
    ],
    areas: ["Bacia Hidrográfica do Rio Potengi", "Nascentes", "Áreas de Preservação Permanente", "Áreas vulneráveis e prioritárias"],
    products: ["Relatório de diagnóstico socioeconômico e ambiental", "Mapas temáticos", "Camada de vulnerabilidade ambiental"]
  },
  {
    id: "meta-2",
    shortTitle: "Educação ambiental",
    title: "Meta 2 - Ações de educação ambiental",
    objective: "Mobilizar comunidades e fortalecer conhecimentos sobre conservação de nascentes, recuperação ambiental e saneamento básico.",
    actions: [
      "Diálogo com gestores, lideranças, associações, sindicatos e movimentos sociais.",
      "Seminários, oficinas participativas, palestras e atividades de campo.",
      "Produção e distribuição de materiais didáticos."
    ],
    results: ["Comunidades e agentes locais mobilizados em torno da conservação e recuperação ambiental."],
    areas: ["Municípios da bacia", "Comunidades envolvidas nas oficinas e atividades de campo"],
    products: ["Relatório final", "Cartilha", "Caderno de atividades", "Vídeo das oficinas", "Compilado de legislação ambiental"]
  },
  {
    id: "meta-3",
    shortTitle: "Validação em campo",
    title: "Meta 3 - Validação das áreas de recuperação",
    objective: "Verificar em campo as áreas críticas apontadas pelo diagnóstico.",
    actions: [
      "Visitas técnicas e levantamentos com veículo aéreo não tripulado.",
      "Produção de imagens aéreas de alta resolução.",
      "Confirmação, dimensionamento e planejamento das áreas selecionadas."
    ],
    results: ["Áreas críticas verificadas em campo para orientar a execução da recuperação."],
    areas: ["Nascentes do Potengi", "APP do Açude Eloy de Souza", "Fazenda Mundo Novo", "Açude do Bêbado - EAJ"],
    products: ["Relatório de validação", "Registros fotográficos", "Imagens aéreas"]
  },
  {
    id: "meta-4",
    shortTitle: "Recuperação ambiental",
    title: "Meta 4 - Recuperação de áreas de recarga",
    objective: "Executar ações de recuperação em áreas prioritárias da bacia.",
    actions: [
      "Cercamento, placas, controle de espécies invasoras, preparo do terreno, abertura de covas, adubação e plantio.",
      "Condução da regeneração natural, plantio adensado, nucleação, renques com palma e barramentos de pedra.",
      "Capacitação, oficinas de plantio e cooperação entre UFRN e SEMARH."
    ],
    results: [`Quatro áreas de recuperação destacadas em novembro de 2025, totalizando ${formatHectares(recoveryTotalHectares)}.`],
    areas: ["Cerro Corá", "São Tomé", "Macaíba"],
    products: ["PRADs", "Diagnóstico de nascentes", "Mapas", "Registros de execução", "Acordo de Cooperação Técnica"]
  },
  {
    id: "meta-5",
    shortTitle: "Monitoramento",
    title: "Meta 5 - Proposição de monitoramento",
    objective: "Definir como acompanhar a efetividade das ações de recuperação.",
    actions: [
      "Proposição de visitas periódicas, registro fotográfico e levantamentos aerofotogramétricos.",
      "Acompanhamento de mortalidade, crescimento, espécies, cobertura do solo e diâmetro médio das copas.",
      "Monitoramento de argila, matéria orgânica, densidade do solo e estoque de carbono orgânico."
    ],
    results: ["Estrutura de monitoramento definida para acompanhar a evolução das áreas recuperadas."],
    areas: ["Áreas de recuperação e parcelas de monitoramento"],
    products: ["Plano ou relatório de proposição de monitoramento", "Registros de campo"]
  },
  {
    id: "meta-6",
    shortTitle: "Saneamento",
    title: "Meta 6 - Proposição de soluções de saneamento básico",
    objective: "Apresentar alternativas para os 25 municípios da bacia.",
    actions: [
      "Análise de abastecimento de água, esgotamento sanitário, resíduos sólidos e drenagem urbana.",
      "Definição de diretrizes para fortalecimento institucional, mobilização social, educação ambiental e infraestrutura."
    ],
    results: ["Proposições indicativas para apoiar o planejamento municipal e institucional nos quatro eixos do saneamento."],
    areas: ["25 municípios abrangidos pelo diagnóstico de saneamento da bacia"],
    products: ["Relatório final com proposições de saneamento básico"]
  },
  {
    id: "meta-7",
    shortTitle: "Comunicação social",
    title: "Meta 7 - Comunicação social",
    objective: "Divulgar atividades e resultados e preservar o conhecimento produzido.",
    actions: [
      "Manutenção do antigo site institucional e publicações no Instagram.",
      "Produção de folders, cartilhas, materiais educativos e divulgação de eventos, oficinas e atividades de campo.",
      "Elaboração de relatórios de comunicação social."
    ],
    results: ["Catálogos públicos organizados para ampliar o acesso aos resultados e às evidências do projeto."],
    areas: ["Perfil @projetopotengiufrn", "Eventos, oficinas e atividades de campo"],
    products: ["Cinco relatórios de comunicação", "Materiais educativos", "Registros de divulgação"]
  }
];
