# Curadoria editorial e visual — Portal e WebGIS do Projeto Potengi

**Versão:** 1.0  
**Data:** 25/08/2026  
**Decisão oficial:** total de **16,25 ha** confirmado pela equipe técnica.

## 1. Mudança de abordagem

A próxima versão não deve ser produzida por seleção automática de imagens e mapas durante a programação. O desenvolvimento passa a obedecer a esta ordem:

1. curadoria e validação das fontes;
2. definição da função editorial de cada material;
3. organização e nomeação dos ativos aprovados;
4. desenho das páginas a partir do conteúdo real;
5. implementação pelo Codex;
6. revisão visual e funcional.

O Codex deve implementar escolhas fechadas neste documento. Não deve escolher fotografias, mapas, números, títulos ou documentos por conta própria.

## 2. Diagnóstico da versão atual

A versão atual não deve ser tratada como base visual final. Os principais problemas são:

- títulos muito grandes, excesso de espaço vazio e baixa densidade informacional;
- abertura genérica e fotografia vertical que enfatiza solo exposto, sem apresentar a bacia e o alcance do projeto;
- exposição de expressões internas como “candidatas para validação editorial”, “imagem extraída”, “captura de mapa” e referências a slides;
- fotografias concentradas quase exclusivamente nas metas 4 e 5;
- mapas exibidos como capturas de tela do Drive, PowerPoint ou leitor de PDF;
- repetição dos mesmos mapas em Resultados e Acervo;
- Acervo em cartões longos, assimétricos e pouco pesquisáveis;
- documentos agrupados apenas por pasta, sem catálogo individual;
- resultados descritos de forma genérica, com pouca conexão direta às evidências;
- gráfico com nomes truncados e inconsistência visual entre a soma das quatro áreas e o total oficial.

## 3. Princípios editoriais obrigatórios

- Nenhuma captura com navegador, Drive, PowerPoint, PDF ou interface de sistema será publicada.
- Nenhum rótulo de produção ou validação aparecerá no site público.
- Fotografias serão usadas para narrar ações, não como inventário integral.
- Mapas serão publicados como pranchas limpas ou composições cartográficas novas.
- Resultados apresentarão síntese, evidência e acesso direto ao documento correspondente.
- O Acervo será um catálogo filtrável, não uma galeria infinita de cartões.
- A página inicial usará apenas quatro indicadores executivos: 7 metas, 25 municípios, 4 áreas e 16,25 ha.
- O número de 20 relatórios não será usado como indicador de abertura; os relatórios serão catalogados individualmente.
- Valores quantitativos só entram após comprovação documental. Não serão criadas estimativas.

## 4. Seleção fotográfica inicial

Os arquivos abaixo são mídias originais incorporadas à apresentação “Resultados Potengi — Novembro de 2025”. Devem ser copiados para o projeto com os novos nomes indicados, preservando o original em `fontes/`.

| Prioridade | Origem | Nome público sugerido | Uso editorial | Situação |
|---|---|---|---|---|
| 1 | `image72.JPG` | `rio-potengi-encontro-litoral.jpg` | imagem principal da página inicial; corte horizontal amplo | selecionada |
| 2 | `image35.JPG` | `area-recuperacao-eaj-visao-aerea.jpg` | apresentação das quatro áreas / Meta 4 | selecionada |
| 3 | `image24.png` | `equipe-atividade-plantio-eaj.png` | equipe e ação de campo | selecionada |
| 4 | `image26.png` | `oficina-plantio-eaj.png` | oficina e capacitação prática | selecionada |
| 5 | `image31.png` | `monitoramento-em-campo.png` | Meta 5 / acompanhamento | selecionada |
| 6 | `image49.jpeg` | `barramento-pedras-eaj.jpg` | técnica de controle erosivo | selecionada |
| 7 | `image60.png` | `fazenda-mundo-novo-visao-aerea.png` | São Tomé / Fazenda Mundo Novo | selecionada |
| 8 | `image33.jpeg` | `parcelas-plantio-visao-aerea.jpg` | implantação e leitura espacial das intervenções | selecionada |

### Materiais que não devem ser publicados como imagens

- `image11.png`: contém tabela com total antigo de 17,05 ha;
- `image12.png`, `image14.png` e `image59.png`: capturas de interfaces de PDF/Drive/apresentação;
- séries repetitivas de portões e placas: manter no acervo documental, usando no máximo uma fotografia se houver função narrativa;
- fotografias sem local, data, atividade e crédito mínimos;
- imagens que dupliquem a mesma ação sem acrescentar informação.

### Lacunas a preencher no Drive

Para equilibrar o portal, devem ser escolhidas ainda:

- uma fotografia da educação ambiental ou uma imagem do vídeo da Meta 2;
- uma fotografia de validação com equipe ou VANT da Meta 3;
- uma fotografia de evento, divulgação ou mobilização da Meta 7;
- uma fotografia representativa de cada uma das quatro áreas, sem repetir enquadramentos.

O portal final não deve ser visualmente dominado pela Meta 4.

## 5. Curadoria de mapas

### Galeria pública: máximo de quatro mapas

1. **Localização da Bacia Hidrográfica do Rio Potengi**  
   Produzir uma prancha limpa com limite da bacia, Rio Grande do Norte, municípios de referência, escala, norte, legenda, fonte e créditos. A imagem antiga da apresentação pode orientar o conteúdo, mas não deve ser publicada sem revisão.

2. **Vulnerabilidade ambiental da bacia**  
   Mapa central da Meta 1 e da álgebra de mapas/CREPANI. Deve ser extraído do produto cartográfico original ou recomposto a partir da camada final. Não usar captura do Drive.

3. **Áreas prioritárias e áreas críticas**  
   Mostrar as classes de prioridade e a relação entre o diagnóstico e a seleção das áreas. Incluir explicação curta da metodologia.

4. **Áreas de recuperação do projeto**  
   Nova composição com Nascentes do Potengi, APP do Açude Eloy de Souza, Fazenda Mundo Novo e Açude do Bêbado/EAJ, total oficial de 16,25 ha.

### Mapas e PDFs complementares

Os documentos “Cercamento da nascente do Potengi.pdf” e “Eloy de Souza.pdf” devem ser ligados às respectivas áreas. Não devem ocupar a galeria principal como capturas de tela.

### Distribuição no portal

- **Resultados:** galeria editorial dos quatro mapas, com texto interpretativo.
- **WebGIS:** camadas interativas e ferramentas de exploração.
- **Acervo:** links para abrir ou baixar as pranchas e os dados; sem repetir a galeria completa.

## 6. Arquitetura editorial das páginas

### Início

1. cabeçalho institucional compacto;
2. hero com `rio-potengi-encontro-litoral.jpg`;
3. título: **Resultados e território do Projeto Potengi**;
4. subtítulo: **Conhecimento aplicado à recuperação ambiental da Bacia Hidrográfica do Rio Potengi.**;
5. botões: **Explorar o território**, **Conhecer os resultados** e **Acessar o acervo**;
6. quatro indicadores: 7 metas, 25 municípios, 4 áreas e 16,25 ha;
7. síntese “Do diagnóstico à recuperação”;
8. acesso compacto às sete metas;
9. quatro áreas de recuperação;
10. mosaico de até seis fotografias validadas;
11. chamada forte para o WebGIS;
12. instituições, créditos e rodapé.

### O Projeto

Apresentar contexto, objetivo, território, metodologia, instituições, coordenação e linha do tempo. Usar uma composição editorial contínua, evitando grandes blocos vazios e cartões repetitivos.

### Resultados

Cada meta deve conter:

- objetivo em uma frase;
- síntese das ações;
- resultados comprovados;
- produtos e evidências;
- um elemento visual relevante, quando existir;
- links diretos para relatório, produto e pasta da meta.

Depois das metas, incluir a seção das quatro áreas de recuperação e a galeria de quatro mapas. Não repetir o Acervo.

### WebGIS

Página própria, com mapa ocupando a maior parte da tela, painel lateral compacto, camada de vulnerabilidade em destaque, filtros territoriais, consulta de atributos, medição, legenda dinâmica, indicadores espaciais e exportação cartográfica.

### Acervo

Organizar como catálogo com busca e filtros por meta, categoria, ano e tipo. Categorias:

- Relatórios por meta;
- Materiais educativos;
- Produção acadêmica;
- Mapas e dados;
- Fotografias e vídeos;
- Comunicação social.

Cada item deve exibir título, autoria ou instituição, ano, tipo, meta relacionada, descrição curta e ação “Abrir” ou “Baixar”. Fotografias devem formar uma galeria própria; não serão listadas em uma coluna interminável.

## 7. Documentos e links já confirmados

### Meta 2

- relatório: https://drive.google.com/file/d/1o9wE6wc7etfWisF-F5iDD3IE-vW4ypuT/view
- cartilha digital: https://drive.google.com/file/d/1NJh4P_fU4gFxG3h2WEzEhYiSliQlnKBU/view
- cartilha para impressão: https://drive.google.com/file/d/13NQNmjGRXXSBBTHOzd7XwV7Zs0pKZOJD/view
- caderno de atividades: https://drive.google.com/file/d/1slDzlaP-07-0fpNDdsRt0sKGBBYm53xq/view
- vídeo das oficinas: https://drive.google.com/file/d/1Hb8kWPNydOsbspX3e1aUJ0Tx6Ee05UHK/view

### Meta 3

- relatório de validação: https://drive.google.com/file/d/1oThjaiN5gN8moDbtsGLfB3SQMZkspoZi/view
- fotografias: manter o acesso pela pasta da Meta 3 até resolver o destino do atalho.

### Meta 4

- mapa — nascente do Potengi: https://drive.google.com/file/d/1WRGOQgGQk7HQMvvm969jiyP1BU3XtsxW/view
- mapa — Açude Eloy de Souza: https://drive.google.com/file/d/1xT2y-p63yZfQH_yBEahj-JZaYp6qSla5/view
- PRAD — Nascentes do Potengi: https://drive.google.com/file/d/1vlI0BNfGveXk9-BpjeQVXPCcWPROckHP/view
- PRAD — Açude do Bêbado/EAJ: https://drive.google.com/file/d/1QiZNhybPzUQYvyfkgH7CERzHGpbZ4GE6/view
- PRAD — APP do Açude Eloy de Souza: https://drive.google.com/file/d/1S57Hyj4PR0q7WUJQVts_T14DqYIAS-tY/view
- diagnóstico ambiental das nascentes: https://drive.google.com/file/d/1JHbXpamGFlo8x2g0Yr9DiDei29ifzQtc/view

### Meta 7

- 1º relatório de comunicação — 2022: https://drive.google.com/file/d/144-2VEcCoHF3ye0KV5PdOOBQEDUhdsEj/view
- 2º relatório de comunicação — 2022: https://drive.google.com/file/d/1ZvSuQ6Z5sXS3XWoIPznfodcpW3jSJr3D/view
- 3º relatório de comunicação — 2023: https://drive.google.com/file/d/1KnHa7uPt9LW72WA235i9ZOIoxffOneos/view
- 4º relatório de comunicação — 2023: https://drive.google.com/file/d/1SPNHDQE8yvgwkJx8gwpeVPVj9uhJfQok/view
- 5º relatório de comunicação — 2024: https://drive.google.com/file/d/1ZW0ah09PnRsS4LRfHlcvI_FCW4XNRATP/view

## 8. Indicadores e visualizações

### Indicadores executivos confirmados

- 7 metas;
- 25 municípios no diagnóstico de saneamento;
- 4 áreas de recuperação;
- 16,25 ha recuperados, conforme confirmação da equipe técnica.

### Indicadores a extrair dos relatórios

- oficinas e ações de educação ambiental;
- participantes alcançados;
- atividades de campo;
- materiais educativos produzidos;
- ações de comunicação;
- pontos e áreas monitorados.

### Indicadores espaciais no WebGIS

- feições visíveis por camada;
- pontos de campo;
- extensão de cercamentos, se o dado permitir;
- área por classe de vulnerabilidade;
- área por classe prioritária;
- áreas e municípios abrangidos pela seleção atual.

### Gráficos recomendados

- quatro áreas de recuperação: barras horizontais com nomes completos e nota de que o total oficial é 16,25 ha;
- composição das classes de vulnerabilidade, após validação dos valores;
- linha do tempo das ações, se houver datas estruturadas;
- síntese por meta, usando contagens documentadas.

## 9. Entrega ao Codex

O próximo pedido de implementação deve ser limitado a uma página por vez. Ordem recomendada:

1. reorganizar os ativos com os nomes aprovados;
2. reconstruir somente a página inicial;
3. revisar a página inicial em desktop e celular;
4. reconstruir Resultados com links por meta;
5. reconstruir o Acervo como catálogo;
6. incorporar mapas estáticos limpos;
7. fortalecer o WebGIS;
8. executar revisão final integrada.

O Codex não deverá inserir materiais adicionais sem que o item esteja previsto no catálogo ou aprovado durante a revisão.
