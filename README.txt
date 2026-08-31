PROJETO POTENGI — REFINO FINAL DIRETO DA ABA REGISTROS
Data: 27/08/2026

ARQUIVOS A SUBSTITUIR/ADICIONAR

Substituir:
- app/registros/page.tsx
- app/globals.css
- src/components/RecordsGallery.tsx
- src/components/RecordLightbox.tsx
- src/data/records.ts
- tests/portal.test.mjs

Adicionar:
- src/components/RecordsNarrativeGallery.tsx

MUDANÇAS DESTA RODADA

1. Hero:
   - remove o painel retangular sobreposto;
   - transforma a abertura em uma única capa fotográfica horizontal;
   - integra título/texto à fotografia por gradiente lateral controlado;
   - mantém Fazenda Mundo Novo e a legenda São Tomé.

2. Fluxo:
   - remove os círculos/ícones com aparência de stepper;
   - cria um percurso territorial em SVG, com linha sinuosa e cinco pontos;
   - mantém Reconhecer, Validar, Mobilizar, Recuperar e Monitorar.

3. Filtros:
   - removidos de verdade da implementação pública;
   - o novo componente chama-se RecordsNarrativeGallery;
   - RecordsGallery.tsx vira apenas um re-export, impedindo o código antigo de filtros de voltar.

4. Mosaico:
   - tamanhos são definidos por fotografia/ID, e não ciclicamente;
   - preserva o caráter assimétrico sem ampliar indevidamente imagens mais fracas.

5. Lightbox:
   - mantém a foto completa;
   - usa a própria fotografia desfocada/escurecida como fundo da área visual;
   - elimina a percepção de grandes faixas pretas;
   - corrige o regex dos anchors das metas;
   - neutraliza o aro amarelo de foco do X para mouse e preserva focus-visible acessível.

6. Permanências:
   - 17 registros públicos;
   - item de baixa resolução "preparo-terreno-renques-eaj" continua removido;
   - Home, Mapas e WebGIS não são alterados;
   - footer institucional permanece.

VALIDAÇÃO LOCAL APÓS COPIAR OS ARQUIVOS

npm run lint
npm test
npm run build

Depois revisar:
- topo/hero;
- fluxo;
- mosaico inteiro;
- lightbox com fotografias horizontal, vertical e quadrada;
- mobile.

Nenhum commit, push ou deploy foi realizado.
