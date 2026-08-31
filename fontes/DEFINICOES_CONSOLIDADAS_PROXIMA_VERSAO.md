# Painel e WebGIS do Projeto Rio Potengi

## Definições consolidadas para a próxima versão

**Data de consolidação:** 25/08/2026  
**Situação:** decisões aprovadas para incorporação ao produto  
**Entrega parcial:** 31/08/2026  
**Entrega final:** 07/09/2026

## 1. Diretriz geral

O produto será um portal institucional responsivo, com WebGIS em página própria e posição de destaque. A versão atual deve ser tratada como protótipo funcional. A próxima etapa não exige nova mudança integral de tecnologia, mas o aperfeiçoamento do conteúdo, da experiência visual, do acervo e, principalmente, da análise territorial.

O portal deve ter aparência institucional e autoral, usar a identidade visual oficial do Projeto Potengi, apresentar informações verificáveis e evitar linguagem genérica, números estimados e elementos meramente decorativos.

## 2. Viabilidade e arquitetura confirmada

Todas as definições abaixo são viáveis sem backend e sem banco de dados.

### Stack

- Next.js, React e TypeScript para o portal;
- OpenLayers para o WebGIS;
- ECharts para gráficos e visualizações quantitativas;
- GeoJSON e arquivos estáticos otimizados para publicação;
- Google Drive como repositório dos documentos originais e dos materiais de maior volume;
- exportação estática para hospedagem pública.

### Funcionamento sem backend

- conteúdos, indicadores e links serão mantidos em arquivos TypeScript ou JSON versionados;
- fotografias selecionadas terão cópias otimizadas no portal, enquanto os originais permanecerão no Drive;
- métricas geoespaciais poderão ser pré-calculadas no processamento dos dados ou calculadas no navegador;
- filtros, consultas, medições, gráficos e exportações funcionarão no front-end;
- não haverá autenticação, edição pública de conteúdo ou necessidade de banco de dados nesta fase.

## 3. Números institucionais aprovados

Os seguintes números podem aparecer nos indicadores principais:

- **7 metas integradas**;
- **25 municípios** abrangidos pelo diagnóstico de saneamento;
- **4 áreas de recuperação destacadas**;
- **16,25 hectares recuperados**, valor confirmado pela equipe técnica;
- **20 relatórios técnicos e acadêmicos reunidos**.

### Regra obrigatória para a área recuperada

O valor anterior divergente deve ser eliminado de todo o portal, gráficos, tabelas, textos, testes e metadados. O total oficial será **16,25 ha**.

O valor deverá ser mantido em uma única fonte de dados e calculado a partir das quatro áreas, evitando divergências entre páginas.

### Indicador descartado

Não será utilizado o indicador “quantidade total de documentos e produtos disponibilizados”. O acervo será apresentado por categorias e por meta, sem transformar a contagem de arquivos em resultado institucional.

## 4. Fotografias e vídeos reais

Serão incorporadas fotografias reais do Projeto Potengi. Não serão usadas imagens de banco, imagens geradas por IA ou ilustrações genéricas para representar ações de campo.

### Aplicações previstas

- substituir, na página inicial, o atual cartão com o desenho isolado da bacia por uma fotografia institucional forte, preferencialmente de nascente, recuperação ambiental, atividade de campo ou mobilização comunitária;
- criar uma seleção fotográfica na página inicial;
- relacionar fotografias às metas, municípios, áreas e tipos de atividade;
- incluir galerias no acervo;
- quando houver correspondência espacial confiável, disponibilizar fotografias nas consultas do WebGIS.

### Requisitos para publicação

- usar apenas registros autorizados para divulgação pública;
- registrar legenda, data, local, meta relacionada e crédito, quando disponíveis;
- criar texto alternativo para acessibilidade;
- gerar versões Web otimizadas, mantendo os originais no Drive;
- evitar galerias excessivas e fotografias repetitivas.

## 5. Indicadores adicionais

Os seguintes temas existem nos materiais do projeto e são adequados como indicadores, mas os totais somente serão publicados após extração e validação nos relatórios:

- oficinas e ações de educação ambiental;
- participantes alcançados;
- atividades de campo;
- materiais educativos produzidos;
- ações de comunicação;
- pontos e áreas efetivamente monitorados.

Os registros fotográficos serão organizados no acervo e nas galerias. Sua quantidade não precisa ser apresentada como indicador principal.

**Regra editorial:** não criar estimativas, somar ocorrências ambíguas nem apresentar como total consolidado aquilo que os relatórios não comprovarem.

## 6. Gráficos e visualizações

Serão acrescentados gráficos somente quando trouxerem uma leitura relevante e estiverem apoiados por dados verificados.

### Visualizações prioritárias

1. áreas de recuperação, com as quatro áreas e total oficial de 16,25 ha;
2. produção técnica e acadêmica por meta, tipo ou ano, após catalogação dos 20 relatórios;
3. resultados e produtos por meta, caso o catálogo permita contagens sem duplicidade;
4. linha do tempo do projeto;
5. educação ambiental e comunicação, caso os relatórios permitam consolidar ações e participantes.

O portal não deverá acumular gráficos redundantes ou decorativos. A recomendação é manter um conjunto enxuto, entre três e cinco visualizações úteis.

## 7. Síntese territorial no WebGIS

A síntese territorial é viável e deve ser uma das funções centrais do WebGIS. Ela será calculada a partir das camadas geoespaciais, sem necessidade de banco de dados.

### Indicadores territoriais previstos

- área e percentual por classe de vulnerabilidade, após incorporação da camada CREPANI completa;
- área e percentual das classes de prioridade alta e extrema alta;
- quatro áreas de recuperação e total oficial de 16,25 ha;
- quantidade de pontos de coleta e campo;
- extensão dos cercamentos de recuperação;
- indicadores atualizados conforme o município, área, filtro ou seleção ativa;
- número de feições visíveis como informação operacional secundária.

### Cuidado semântico

Os **111 pontos de coleta e campo** já presentes na base não devem ser chamados automaticamente de “pontos monitorados”. Essa denominação somente será usada se os atributos ou relatórios confirmarem que representam monitoramento.

### Melhorias obrigatórias no WebGIS

- enquadrar a bacia corretamente ao abrir o mapa e ao trocar o mapa-base;
- impedir que a navegação se perca em extensões regionais inadequadas;
- compactar o painel de camadas e priorizar os controles de uso frequente;
- organizar camadas por tema, com simbologia, legenda e descrições consistentes;
- oferecer consulta de atributos com rótulos compreensíveis;
- destacar vulnerabilidade, áreas prioritárias e áreas de recuperação;
- manter busca, medição, escala, coordenadas, tela cheia e controle de transparência;
- oferecer síntese dinâmica da seleção espacial;
- permitir exportação cartográfica profissional.

### Exportação cartográfica

A exportação deverá oferecer composição pronta para uso, preferencialmente em A4 horizontal e formato 16:9, contendo:

- título editável;
- mapa enquadrado na área de interesse;
- legenda completa das camadas visíveis;
- escala gráfica;
- orientação norte;
- data;
- fontes e créditos;
- identidade visual do Projeto Potengi.

## 8. Mapas estáticos e pranchas temáticas

Além do WebGIS, o portal incorporará uma seleção enxuta de mapas estáticos. Essa solução é complementar: o WebGIS será utilizado para exploração e consulta, enquanto os mapas estáticos apresentarão leituras territoriais já interpretadas, com acabamento cartográfico controlado.

### Estratégia de produção

Será priorizado o reaproveitamento dos mapas já elaborados pela equipe do projeto, desde que apresentem resolução adequada, legenda legível, fonte, escala, orientação, créditos e coerência com os dados finais. Quando o mapa existente não tiver qualidade suficiente para publicação na Web, poderá ser recomposto a partir da camada original, preservando sua interpretação técnica.

Não será necessário recriar todos os mapas. Novas pranchas serão produzidas apenas para temas centrais que não possuam uma versão publicável.

### Mapas prioritários

1. **Vulnerabilidade ambiental da Bacia do Rio Potengi**, resultado final da álgebra de mapas CREPANI e principal mapa temático do diagnóstico;
2. **Áreas prioritárias para recuperação**, destacando as classes alta e extrema alta;
3. **Localização da bacia e rede hidrográfica**, como referência territorial institucional;
4. **Áreas de recuperação do Projeto Potengi**, com as quatro áreas e o total oficial de 16,25 ha;
5. **Áreas de Preservação Permanente e vulnerabilidade**, se a composição puder ser validada com os dados disponíveis;
6. **Uso e cobertura da terra nas áreas críticas**, caso a base permita representar adequadamente a predominância de pastagens identificada nos estudos;
7. **Mapas das áreas trabalhadas já existentes**, incluindo os dois produtos em PDF localizados no acervo da Meta 4.

### Regra de nomenclatura

O mapa derivado da álgebra CREPANI será apresentado prioritariamente como **vulnerabilidade ambiental**. A expressão **degradação** somente será usada quando constar no título, metodologia ou classificação do produto técnico original. Os termos não deverão ser tratados como sinônimos sem confirmação documental.

### Apresentação no portal

- criar uma seção “Mapas temáticos” em Resultados e uma categoria correspondente no Acervo;
- exibir miniatura, título, síntese interpretativa, ano, fonte e meta relacionada;
- permitir ampliação em tela, abertura do arquivo e download em PDF ou PNG;
- relacionar cada mapa às camadas equivalentes do WebGIS por meio da ação “Explorar no WebGIS”;
- usar imagens otimizadas para navegação, mantendo os arquivos de alta resolução disponíveis para download;
- garantir leitura em computador e celular, sem reduzir legendas a tamanhos ilegíveis.

### Padrão cartográfico

Os mapas novos ou recompostos deverão conter título, legenda, escala gráfica, orientação norte, sistema de referência quando pertinente, fontes, autoria ou elaboração, data e créditos institucionais. A composição visual deverá seguir a identidade do Projeto Potengi sem alterar a simbologia técnica necessária à leitura das classes.

## 9. Documentos, relatórios e evidências

Todos os documentos relevantes deverão possuir acesso individual, sempre que houver arquivo público disponível. Links genéricos para pastas continuarão disponíveis como acesso complementar, mas não substituirão a identificação dos itens.

### Organização no portal

- cada meta terá uma seção “Documentos e evidências”;
- o Acervo reunirá todos os itens, com filtros por meta, categoria, tipo e ano;
- relatórios, cartilhas, cadernos, vídeos, mapas, PRADs, acordos, apresentações e registros serão identificados individualmente;
- os 20 relatórios técnicos e acadêmicos deverão receber títulos compreensíveis, autores, ano, meta e tipo, após leitura e catalogação;
- links externos abrirão em nova aba e deverão ser testados em acesso anônimo.

### Catálogo central

Os documentos serão mantidos em uma única estrutura de dados, por exemplo `src/data/documents.ts`, com campos equivalentes a:

- identificador;
- título público;
- meta;
- categoria;
- tipo de arquivo;
- ano;
- descrição curta;
- URL;
- texto da ação, como “Abrir relatório” ou “Assistir ao vídeo”;
- fonte e crédito;
- situação de validação do link.

As páginas de metas e o Acervo deverão ler o mesmo catálogo, eliminando duplicações e divergências.

### Conteúdo mínimo por meta

- **Meta 1:** relatório final, mapas temáticos, relatórios acadêmicos e base do diagnóstico;
- **Meta 2:** relatório final, cartilha, caderno de atividades, vídeo das oficinas e compilado de legislação ambiental;
- **Meta 3:** relatório final, fotografias e imagens de validação;
- **Meta 4:** PRADs, diagnóstico das nascentes, mapas, Acordo de Cooperação Técnica e materiais de oficinas e execução;
- **Meta 5:** registros de campo e documentos de proposição de monitoramento;
- **Meta 6:** relatório final de soluções de saneamento;
- **Meta 7:** cinco relatórios de comunicação social, materiais de divulgação e Instagram institucional.

Também deverão constar o Relatório de Execução Física e Financeira e a apresentação Resultados Potengi - Novembro de 2025.

## 10. Fontes de referência

### Pastas das metas

- [Meta 1 - Diagnóstico socioeconômico e ambiental](https://drive.google.com/drive/folders/1dCcD0-VtNQdpWYraPHo8hTy8D62ZrRo3?usp=sharing)
- [Meta 2 - Ações de educação ambiental](https://drive.google.com/drive/folders/1Eu6o8IEsIm1s5wmqePqP3Epp4DGSedSN?usp=sharing)
- [Meta 3 - Validação das áreas de recuperação](https://drive.google.com/drive/folders/1acwIAzdMLmb0Nl6FF777NFlgZtXbE6j1?usp=drive_link)
- [Meta 4 - Recuperação de áreas de recarga](https://drive.google.com/drive/folders/1EEJUNFg5a39GeqhSLJ9_Yv8PoYjdumYg?usp=drive_link)
- [Meta 5 - Proposição de monitoramento](https://drive.google.com/drive/folders/1L6SoGgJFuwNx9EXt0Q3lnYTrWbIeZvVJ?usp=drive_link)
- [Meta 6 - Soluções de saneamento básico](https://drive.google.com/drive/folders/1IvqVE5oEhJbkeP9lVYoZK437wm1T83gV?usp=drive_link)
- [Meta 7 - Comunicação social](https://drive.google.com/drive/folders/1o1rbw8YyG-Ou4QsqaD_NwjdmE3WJGKm1?usp=drive_link)

### Outras fontes

- [Dados geoespaciais](https://drive.google.com/drive/folders/1G6o5YwF1sAvGBQdoGu_Sms2SFVyUAybo?usp=sharing)
- [Identidade visual](https://drive.google.com/drive/folders/1ZD1tSVsGFlnkVHiYXtit9nTkeZbCKMEw?usp=sharing)
- [Pasta provisória do projeto atualizado](https://drive.google.com/drive/folders/127tlQjxO_BP1E5UkC-c902ySATpi8OUV?usp=sharing)
- [Instagram do Projeto Potengi](https://www.instagram.com/projetopotengiufrn/)

## 11. Diretrizes de interface

- preservar a evolução visual já obtida e evitar outra reconstrução integral sem necessidade;
- reduzir títulos excessivamente grandes, vazios prolongados e repetição de cartões;
- fortalecer a hierarquia entre conteúdo institucional, resultados e território;
- usar fotografias reais para dar materialidade às ações do projeto;
- tornar o WebGIS um produto central, e não apenas uma seção acessória;
- acrescentar rodapé institucional com instituições, créditos, contatos e fontes;
- manter responsividade, acessibilidade, contraste e navegação por teclado.

## 12. Fonte única de verdade

Números, textos, documentos e camadas deverão ser mantidos em estruturas centrais reutilizadas por todas as páginas. Não deverão existir valores duplicados manualmente em componentes diferentes.

Os indicadores derivados deverão ser calculados a partir dos registros de origem. Mudanças aprovadas, como a adoção de 16,25 ha, deverão ser aplicadas primeiro na fonte central e verificadas por busca em todo o projeto.

## 13. Ordem de incorporação

### Etapa A - Estabilização editorial

- substituir o valor anterior divergente por 16,25 ha em todo o projeto;
- centralizar o cálculo das quatro áreas;
- remover o indicador de quantidade total de documentos;
- corrigir a imagem principal da página inicial;
- consolidar o catálogo de documentos e links.

### Etapa B - Conteúdo e evidências

- catalogar individualmente os relatórios e produtos;
- incorporar fotografias reais selecionadas;
- extrair dos relatórios os indicadores adicionais comprováveis;
- criar os novos gráficos aprovados;
- selecionar, revisar e publicar os mapas estáticos prioritários;
- completar as seções de evidências das sete metas.

### Etapa C - Fortalecimento do WebGIS

- incorporar as camadas completas disponíveis, com prioridade para vulnerabilidade CREPANI;
- calcular indicadores territoriais;
- aperfeiçoar filtros, seleção e consulta;
- corrigir enquadramento e hierarquia cartográfica;
- finalizar a exportação profissional de mapas.

## 14. Critérios de aceite da próxima versão

- nenhuma ocorrência pública do valor anterior divergente;
- total oficial de 16,25 ha consistente em indicadores, gráfico e tabela;
- página inicial com fotografia real e composição visual equilibrada;
- documentos e relatórios com links individuais e testados;
- fotografias reais incorporadas com legenda, crédito e acessibilidade;
- mapas estáticos com fonte, legenda, créditos e arquivos de alta resolução acessíveis;
- mapa de vulnerabilidade ambiental apresentado como produto central do diagnóstico;
- indicadores adicionais somente quando comprovados nos relatórios;
- WebGIS abrindo enquadrado na bacia, com camadas legíveis e ferramentas funcionais;
- síntese territorial disponível para as camadas concluídas;
- exportação de mapa com composição cartográfica completa;
- funcionamento em desktop e celular;
- `lint`, testes e `build` concluídos sem erro;
- pacote de entrega sem `node_modules`, `.next`, `out` e arquivos temporários.
