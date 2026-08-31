# Especificação de navegação e catálogos — Portal do Projeto Rio Potengi

**Versão:** 25 de agosto de 2026  
**Situação:** definição aprovada para a próxima versão do portal  
**Documento complementar:** `CATALOGO_EDITORIAL_VALIDADO_RIO_POTENGI.md`

## 1. Decisão central

O portal deixará de concentrar mapas, fotografias, vídeos e documentos em uma única página de Acervo. Esses conteúdos serão organizados em áreas próprias, conectadas às metas e ao WebGIS.

Navegação principal aprovada:

1. **Início**
2. **O Projeto**
3. **Resultados**
4. **WebGIS**
5. **Mapas**
6. **Registros**
7. **Documentos**

Em telas menores, a navegação deverá ser apresentada em menu recolhível. O WebGIS continuará destacado como acesso prioritário.

## 2. Função de cada área

### Início

Apresentação institucional sintética, com uma fotografia real de forte valor visual, indicadores confirmados, síntese das sete metas e acessos para Resultados, WebGIS, Mapas, Registros e Documentos.

A página não deve funcionar como galeria nem repetir o conteúdo completo das demais áreas.

### O Projeto

Objetivo geral, contexto, metodologia, instituições, coordenação, abrangência territorial e linha do tempo.

### Resultados

Organização navegável das sete metas, com ações, resultados, áreas, produtos, indicadores comprovados e links para documentos, mapas e registros relacionados.

O valor institucional de área recuperada é **16,25 ha**. O valor de 17,05 ha não deve aparecer no portal.

### WebGIS

Aplicação cartográfica principal, em página própria e com maior destaque visual. Deve integrar as camadas geoespaciais disponíveis, especialmente vulnerabilidade ambiental, áreas prioritárias, bacia, hidrografia, APPs, áreas de recuperação, cercamentos e pontos de campo.

Os mapas estáticos não substituem o WebGIS. Eles formam um produto complementar.

### Mapas

Atlas cartográfico digital com mapas estáticos produzidos pelo projeto.

Funcionalidades mínimas:

- busca por título, município, área e palavra-chave;
- filtros por meta, tema, município, ano e tipo;
- miniaturas proporcionais e padronizadas;
- visualização ampliada;
- título, descrição, fonte, ano, meta e abrangência territorial;
- acesso ao arquivo original;
- botão **Explorar no WebGIS** quando existir camada correspondente;
- mensagem objetiva quando nenhum item atender aos filtros.

Temas iniciais:

- localização e abrangência territorial;
- vulnerabilidade ambiental;
- áreas prioritárias;
- uso e cobertura da terra;
- hidrografia;
- Áreas de Preservação Permanente;
- relevo, declividade e modelo de elevação;
- áreas críticas;
- áreas e intervenções de recuperação;
- saneamento básico.

Não publicar capturas de tela do Google Drive, navegador, PowerPoint ou leitor de PDF quando houver mapa original ou imagem cartográfica extraível.

### Registros

Memória visual do projeto, formada por fotografias e vídeos reais.

Funcionalidades mínimas:

- busca textual;
- filtros por meta, município, área, atividade, ano e tipo de mídia;
- galerias temáticas;
- visualização ampliada das fotografias;
- reprodução ou acesso aos vídeos;
- legenda contextualizada;
- identificação de local, atividade, data, meta, fonte e crédito;
- vínculo com a meta relacionada;
- carregamento progressivo para preservar o desempenho.

Galerias iniciais:

- diagnóstico e reconhecimento territorial;
- educação ambiental;
- validação em campo;
- recuperação ambiental;
- oficinas e plantio;
- monitoramento;
- cercamentos e estruturas de recuperação;
- comunicação social.

Não utilizar no produto final expressões como “fotografia candidata”, “imagem extraída” ou “aguardando validação editorial”. Somente itens aprovados devem ser exibidos publicamente.

### Documentos

Substitui a atual página Acervo e funciona como biblioteca técnica do projeto.

Categorias iniciais:

- relatórios por meta;
- relatório de execução física e financeira;
- materiais educativos;
- produção técnica e acadêmica;
- PRADs e diagnósticos;
- legislação e instrumentos de cooperação;
- apresentações;
- dados geoespaciais para acesso ou download;
- comunicação social.

Funcionalidades mínimas:

- busca textual;
- filtros por meta, categoria, ano e formato;
- título, descrição, autoria, ano, formato, meta e fonte;
- ação clara: abrir, visualizar, acessar pasta ou baixar;
- links individuais quando disponíveis, sem limitar o acesso a uma pasta genérica.

## 3. Tratamento dos arquivos

- Incorporar ao portal versões otimizadas das fotografias e dos mapas selecionados.
- Preservar, no catálogo, o link do arquivo ou pasta original no Google Drive.
- Não carregar imagens públicas diretamente por links temporários do Drive.
- Manter os originais intactos nas fontes.
- Gerar miniaturas próprias para as listagens.
- Utilizar nomes de arquivos estáveis, descritivos e sem caracteres problemáticos.
- Registrar texto alternativo para imagens e mapas.
- Confirmar autorização de publicação e crédito antes da versão final.

## 4. Modelo estático de dados

A solução continuará sem backend e sem banco de dados. Os catálogos serão arquivos estáticos TypeScript ou JSON.

Estrutura recomendada:

- `src/data/maps.ts` — mapas e produtos cartográficos;
- `src/data/records.ts` — fotografias e vídeos;
- `src/data/documents.ts` — relatórios e demais documentos;
- `public/media/maps/` — imagens e miniaturas de mapas;
- `public/media/photos/` — fotografias selecionadas;
- `public/media/videos/` — apenas vídeos incorporados localmente, quando aplicável;
- `public/acervo/` — documentos autorizados para distribuição direta.

Campos mínimos comuns:

- identificador;
- título;
- descrição;
- meta relacionada;
- categoria ou tema;
- ano;
- município ou área;
- fonte;
- crédito;
- URL original;
- caminho do ativo local;
- texto alternativo;
- situação editorial.

Os filtros e a busca funcionarão no navegador. Não será criada API apenas para esses catálogos.

## 5. Integração entre as páginas

- Cada meta em Resultados deve apresentar links para seus documentos, mapas e registros.
- Cada mapa deve indicar a meta relacionada e, quando possível, abrir o mesmo tema no WebGIS.
- Cada registro deve conduzir à meta correspondente.
- Documentos devem indicar metas e produtos associados.
- A página inicial deve mostrar somente seleções editoriais representativas e direcionar para os catálogos completos.

## 6. Diretrizes para implementação pelo Codex

1. Não selecionar novos materiais de forma autônoma.
2. Utilizar exclusivamente os itens aprovados no catálogo editorial validado.
3. Não publicar capturas de tela quando existir arquivo original.
4. Não inventar título, local, data, autoria, crédito ou indicador.
5. Não criar números estimados.
6. Manter **16,25 ha** em todos os componentes.
7. Não misturar mapas estáticos com a interface do WebGIS.
8. Não transformar a página Registros em uma sequência vertical extensa de cartões.
9. Utilizar grade responsiva, filtros compactos, modal de visualização e paginação ou carregamento progressivo.
10. Não realizar deploy, commit, push ou merge sem autorização expressa.

## 7. Próxima execução

A próxima intervenção no código deverá:

1. criar as rotas `/mapas`, `/registros` e `/documentos`;
2. substituir `/acervo` por `/documentos`, preservando redirecionamento quando necessário;
3. atualizar o cabeçalho e a navegação móvel;
4. estruturar os três catálogos estáticos;
5. incorporar somente uma primeira seleção aprovada de ativos;
6. integrar as metas aos respectivos materiais;
7. testar busca, filtros, links, acessibilidade, responsividade e desempenho;
8. apresentar a revisão local antes de ampliar o catálogo.

