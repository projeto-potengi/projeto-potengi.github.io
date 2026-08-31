# Guia do Projeto — Painel do Projeto Rio Potengi

## 1. Objetivo

Desenvolver um portal público, profissional e responsivo que consolide os resultados do Projeto Rio Potengi e disponibilize um WebGIS para explorar os principais dados geoespaciais produzidos pelo projeto.

## 2. Prazos

- Versão parcial: **31/08/2026**
- Versão final: **07/09/2026**
- Entrega da interessada: **10/09/2026**

## 3. Produto

O produto será um **site institucional estático com WebGIS integrado**, composto por:

1. **Início** — apresentação e principais resultados;
2. **O Projeto** — contexto, objetivos, instituições, equipe e território;
3. **Resultados** — organização das sete metas, ações, áreas e produtos;
4. **WebGIS** — exploração dos dados geoespaciais relevantes;
5. **Acervo** — produção acadêmica, documentos, fotografias, vídeos e comunicação social.

O site anterior, disponível em `https://painel-rio-potengi.li2t117034.chatgpt.site/`, é apenas uma exploração inicial. Não constitui a versão parcial e não precisa ser preservado como base técnica.

## 4. Solução técnica

- Portal: Next.js, React e TypeScript, com geração de site estático.
- WebGIS: OpenLayers.
- Gráficos: Apache ECharts, somente quando contribuírem para a leitura dos resultados.
- Preparação de dados: R.
- Apoio geoespacial: GDAL executado por scripts e QGIS usado apenas para conferências pontuais.
- Versionamento: Git e GitHub.
- Publicação: hospedagem estática, sem backend e sem banco de dados.

Textos, indicadores e configurações serão armazenados em Markdown, JSON ou CSV. Camadas serão preparadas em formatos adequados à Web. Documentos e mídias extensas poderão permanecer no Google Drive, com acesso organizado pelo portal.

## 5. WebGIS

O WebGIS é uma parte central do produto. Deve utilizar o maior conjunto útil de dados disponível, com prioridade para:

- limite da bacia;
- rede hidrográfica e nascentes;
- municípios e localidades;
- uso e cobertura da terra;
- áreas críticas, de recarga e de recuperação;
- áreas e ações efetivamente trabalhadas;
- resultado da análise multicritério ou álgebra de mapas;
- camada de degradação, vulnerabilidade ou prioridade identificada nos arquivos;
- fotografias ou registros de campo que possam ser relacionados às áreas.

O mapa deverá oferecer consulta de informações, filtros aplicáveis, legenda, transparência, mapas de base, medição, tela cheia e exportação de mapa com título, legenda, escala, fonte e créditos.

## 6. Fluxo operacional

### Etapa 1 — Preparar

- Consolidar as informações das sete metas.
- Selecionar documentos, dados acadêmicos, fotografias e vídeos.
- Examinar a pasta geoespacial e escolher as camadas aplicáveis.
- Identificar a bacia e a camada resultante da álgebra de mapas.
- Definir os conteúdos das cinco áreas do portal.

**Resultado:** conteúdo e dados prontos para entrar no site.

### Etapa 2 — Construir

- Criar o portal e aplicar a identidade visual.
- Inserir o conteúdo real das metas e do acervo.
- Preparar os dados em R e implementar o WebGIS.
- Testar navegação, mapas, links e funcionamento em computador e celular.
- Publicar a versão parcial até 31/08/2026.

**Resultado:** versão parcial navegável e funcional.

### Etapa 3 — Finalizar

- Reunir e priorizar o retorno da interessada.
- Corrigir textos, mapas, interface e links.
- Realizar a conferência final em computador e celular.
- Publicar a versão final até 07/09/2026.
- Entregar endereço público, código, pacote estático e instrução curta de continuidade.

**Resultado:** produto final publicado e documentado.

## 7. Forma de trabalho no ChatGPT

Serão utilizadas somente duas conversas dentro do projeto.

### Conversa 1 — Painel Rio Potengi — Planejamento

Usar o ChatGPT/Work para:

- organizar fontes e conteúdo;
- tomar decisões;
- redigir e revisar textos;
- avaliar versões do portal;
- reunir as correções da interessada.

Esta é a conversa principal do projeto.

### Conversa 2 — Painel Rio Potengi — Desenvolvimento

Usar o Codex para:

- organizar o projeto local;
- processar dados em R e GDAL;
- construir o portal e o WebGIS;
- testar, corrigir e gerar as versões publicáveis.

Não serão abertas conversas separadas para WebGIS, conteúdo ou revisão. O QGIS será usado apenas quando uma camada ou mapa precisar de conferência visual específica.

## 8. Instruções permanentes do projeto

- Trabalhar prioritariamente com as fontes adicionadas ao projeto e os links oficiais fornecidos.
- Não inventar números, resultados, datas, áreas, publicações ou funcionalidades.
- Tratar as metas como concluídas na narrativa final, conforme orientação da interessada, contextualizando documentos antigos que ainda registravam atividades em execução.
- Produzir linguagem institucional, objetiva e específica, sem textos genéricos ou aparência de conteúdo produzido por IA.
- Não realizar auditoria técnica exaustiva. Conferir somente o necessário para publicar informações e mapas corretamente.
- Manter a solução sem backend e sem banco de dados, salvo nova decisão expressa.
- Tratar o WebGIS como parte central do produto, e não como simples controle de camadas.
- Utilizar apenas funcionalidades reais e testadas; não criar botões decorativos, números fictícios ou páginas sem conteúdo.
- Registrar fontes, datas, autoria e créditos dos conteúdos e camadas utilizados.
- Preservar os arquivos originais e trabalhar com cópias processadas.
- Priorizar conteúdo correto, WebGIS funcional, clareza, responsividade e estabilidade.
- Antes de alterar código existente, verificar seu estado e preservar o que estiver funcional.
- Não publicar, fazer commit ou enviar alterações para repositórios sem que a tarefa em execução autorize essas ações.

## 9. Entrega final

A entrega deverá incluir:

- portal publicado;
- WebGIS funcional;
- código-fonte versionado;
- pacote estático do site;
- dados tratados autorizados;
- scripts necessários para preparação dos dados;
- catálogo das fontes utilizadas;
- instrução curta de republicação e atualização;
- créditos, data e identificação da versão final.

