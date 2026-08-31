# Pacote editorial — Fase 2 do Portal e WebGIS do Projeto Rio Potengi

**Versão:** 25 de agosto de 2026  
**Situação:** concluído para implementação, com pendências humanas explicitadas  
**Documentos vinculados:** `CATALOGO_EDITORIAL_VALIDADO_RIO_POTENGI.md` e `ESPECIFICACAO_NAVEGACAO_E_CATALOGOS_RIO_POTENGI.md`

## 1. Decisões fechadas

- Navegação: **Início | O Projeto | Resultados | WebGIS | Mapas | Registros | Documentos**.
- Arquitetura estática, sem backend e sem banco de dados.
- Área recuperada institucional: **16,25 ha**. O valor de 17,05 ha é vedado.
- A seleção editorial é definida neste pacote; o Codex implementa, mas não escolhe novos materiais.
- Mapas estáticos e WebGIS são produtos complementares.
- Capturas de Drive, navegador, PowerPoint ou leitor de PDF não devem ser publicadas quando houver original.
- Nenhum indicador numérico será estimado.

## 2. Entregáveis deste pacote

| Arquivo | Função |
|---|---|
| `catalogo_mapas_fase2.json` | Seleção cartográfica para a rota `/mapas`, com temas, metas, formatos, links e integração prevista com o WebGIS. |
| `catalogo_registros_fase2.json` | Seleção de fotografias para a rota `/registros`, com finalidade editorial e estado de autorização/crédito. |
| `catalogo_documentos_fase2.json` | Biblioteca inicial de documentos individualizados e links rastreáveis para a rota `/documentos`. |

Os JSONs são fonte de verdade editorial. Na implementação podem ser convertidos para TypeScript sem alterar conteúdo, ids ou estados.

## 3. Pacote inicial para publicação

### Mapas

Publicar inicialmente os mapas de prioridade A: vulnerabilidade à erosão, áreas prioritárias, uso e cobertura da terra, localização, rede de drenagem, APPs por trecho, cercamento da nascente e APP do Açude Eloy de Souza. A página `/mapas` também deve oferecer as coleções técnicas de contexto, nove áreas críticas e saneamento.

O **Mapa de Vulnerabilidade à Erosão** é o protagonista cartográfico. Deve aparecer:

1. como destaque do atlas;
2. na Meta 1 em Resultados;
3. associado às nove áreas críticas da Meta 3;
4. no WebGIS, somente quando a camada completa for processada e validada.

### Registros

Usar **Rio Potengi em São Tomé — 26/07/2022** como hero da página inicial. As demais imagens aprovadas entram em galerias por meta/atividade. Oito registros estão editorialmente selecionados; a publicação de pessoas e os créditos permanecem sujeitos à confirmação humana indicada no catálogo.

### Documentos

A biblioteca inicial contém links individuais para os relatórios finais das Metas 1, 2, 3 e 6; materiais educativos da Meta 2; PRADs, diagnóstico de nascentes e mapas da Meta 4; e os cinco relatórios de comunicação da Meta 7. O relatório físico-financeiro e a apresentação de resultados podem ser distribuídos localmente no portal, preservando os originais em `fontes/`.

Os 20 relatórios técnicos/acadêmicos só devem gerar indicador público após catálogo individual comprobatório. Não usar um cartão genérico como substituto desse catálogo.

## 4. Estados editoriais

| Estado | Significado | Ação do Codex |
|---|---|---|
| `aprovado` | Seleção, finalidade e origem definidas. | Incorporar conforme destino indicado. |
| `aprovado_condicionado` | Seleção aprovada, mas há validação humana de crédito, autorização ou acesso público. | Preparar no código; não publicar definitivamente sem confirmação. |
| `colecao_aprovada` | Coleção ampla aprovada; itens devem ser apresentados por filtro/paginação. | Implementar como catálogo, não como sequência vertical extensa. |
| `aguarda_camada` | Mapa estático aprovado, mas equivalente interativo não está pronto. | Publicar mapa estático; omitir botão WebGIS até validar a camada. |

## 5. Regras para ativos locais

- Baixar originais do Drive e criar derivados web; não usar hotlink temporário.
- Fotografias: WebP/AVIF, largura de 1.600 a 2.000 px, miniatura própria e original preservado.
- Mapas: imagem de visualização legível e PDF original para download; não recortar legenda, escala, norte ou créditos.
- Nomes estáveis em kebab-case.
- Registrar `alt`, fonte, meta, ano, município/área e crédito.
- Preferir carregamento progressivo nas galerias.

Estrutura esperada:

```text
src/data/maps.ts
src/data/records.ts
src/data/documents.ts
public/media/maps/
public/media/photos/
public/media/videos/
public/acervo/
```

## 6. Ligações obrigatórias

- Resultados → documentos, mapas, registros e WebGIS de cada meta.
- Mapas → meta relacionada, original e WebGIS quando houver camada validada.
- Registros → meta e atividade relacionada.
- Documentos → meta, categoria, formato e fonte.
- Início → somente seleções representativas e chamadas para os catálogos completos.

## 7. Validações humanas restantes

Estas pendências não impedem a implementação estrutural, mas impedem a publicação final dos itens afetados:

1. autorização de uso de imagem de pessoas;
2. crédito/autoria fotográfica;
3. teste dos links do Drive em janela anônima;
4. confirmação de autoria/ano quando ausentes no documento;
5. definição dos documentos administrativos autorizados para acesso público;
6. validação do conjunto geoespacial final da vulnerabilidade.

## 8. Critério de aceite da Fase 2

A Fase 2 está editorialmente concluída quando o Codex:

- consumir os três catálogos sem selecionar novos itens;
- substituir capturas e imagens inadequadas pelos originais indicados;
- implementar busca, filtros, grade responsiva e visualização ampliada;
- manter 16,25 ha em todas as páginas;
- apresentar links individuais onde disponíveis;
- indicar claramente itens condicionados na revisão interna, sem mensagens de bastidor no portal público;
- passar lint, testes, build e revisão visual desktop/mobile.

