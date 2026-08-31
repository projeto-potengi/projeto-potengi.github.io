import type { CatalogFilter, CatalogItemBase, EditorialStatus } from "./catalog-model";
import mapsCatalog from "@/fontes/fase-2/catalogo_mapas_completude_2026-08-26.json";

export type StaticMapItem = CatalogItemBase & {
  theme: string;
  territory?: string;
  group: string;
  webgisRelation?: string;
  webgisAvailable?: "Sim";
  previewUrl?: string;
  downloadUrl?: string;
  alternateUrls?: string[];
  featured?: boolean;
  featuredOrder?: number;
  featuredDescription?: string;
  featuredLabel?: string;
  featuredMethod?: {
    title: string;
    text: string;
    flow: string[];
    factors: string[];
  };
};

type MapCatalogItem = (typeof mapsCatalog.items)[number];

const metaLabel = (value: number) => `Meta ${value}`;

const titleCase = (value: string) =>
  value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1);

const formatMeta = (metas: number[]) => metas.map(metaLabel);

const webgisRelationsWithAccess = new Set(["camada_prioritaria", "camada_disponivel", "camada_parcial"]);

const featuredContent: Record<
  string,
  {
    order: number;
    label: string;
    description: string;
    method?: StaticMapItem["featuredMethod"];
  }
> = {
  "vulnerabilidade-erosao": {
    order: 1,
    label: "Vulnerabilidade ambiental à erosão",
    description:
      "Produto-síntese do diagnóstico ambiental da bacia. O mapa resulta da integração de variáveis físico-bióticas e antrópicas por análise multicritério e álgebra de mapas, apoiando a identificação das áreas mais vulneráveis e a definição de prioridades para recuperação.",
    method: {
      title: "Como este mapa foi construído",
      text:
        "O diagnóstico reuniu informações climáticas, hidrológicas, geológicas, pedológicas, geomorfológicas, de relevo e de uso e cobertura da terra. A integração dessas informações permitiu construir uma leitura espacial da vulnerabilidade ambiental da bacia.",
      flow: ["variáveis territoriais", "análise multicritério / álgebra de mapas", "vulnerabilidade ambiental"],
      factors: [
        "clima e precipitação",
        "relevo e declividade",
        "geologia",
        "geomorfologia",
        "solos",
        "uso e cobertura da terra"
      ]
    }
  },
  "areas-prioritarias": {
    order: 2,
    label: "Áreas prioritárias para recuperação",
    description:
      "Apresenta a hierarquização territorial utilizada para orientar a conservação e a recuperação de nascentes, matas ciliares, corpos d’água e demais áreas degradadas. A priorização deriva da leitura integrada das condições ambientais e das pressões sobre o território."
  },
  "uso-cobertura-terra": {
    order: 3,
    label: "Uso e cobertura da terra",
    description:
      "Mostra os padrões de uso e ocupação do território da Bacia do Rio Potengi. A classificação foi produzida a partir de imagens orbitais e integrou o diagnóstico das áreas degradadas, com amostras das classes verificadas em campo."
  },
  "drenagem-vulnerabilidade-apps": {
    order: 4,
    label: "Vulnerabilidade das APPs",
    description:
      "Aproxima o diagnóstico de vulnerabilidade das Áreas de Preservação Permanente da bacia, permitindo observar espacialmente os trechos mais sensíveis dessas áreas protegidas e sua relação com a priorização das ações ambientais."
  },
  "drenagem-apps-criticas-ocupadas": {
    order: 5,
    label: "APPs críticas e ocupadas",
    description:
      "Evidencia Áreas de Preservação Permanente identificadas como críticas e com ocupações irregulares, contribuindo para a leitura dos conflitos entre proteção ambiental, ocupação territorial e drenagem."
  },
  "drenagem-alagamento-erosao": {
    order: 6,
    label: "Alagamento e erosão",
    description:
      "Localiza os municípios representados no levantamento de alagamentos e processos erosivos, oferecendo uma leitura regional de ocorrências relacionadas à drenagem e às dinâmicas erosivas na área de estudo."
  },
  "agua-indice-seguranca-hidrica": {
    order: 7,
    label: "Índice de Segurança Hídrica",
    description:
      "Integra o conjunto cartográfico de abastecimento de água da Meta 6 e apresenta espacialmente o Índice de Segurança Hídrica no território analisado, ampliando a leitura das condições relacionadas ao abastecimento hídrico."
  },
  "agua-sistemas-produtores-adutoras": {
    order: 8,
    label: "Sistemas produtores e adutoras",
    description:
      "Representa elementos da infraestrutura associada ao abastecimento de água, com destaque para sistemas produtores e adutoras no território analisado pela Meta 6."
  }
};

const groupFor = (item: MapCatalogItem) => {
  const metas = item.meta ?? [];
  const theme = item.theme ?? "";

  if (metas.includes(6)) return "Saneamento básico";
  if (theme === "recuperação ambiental") return "Recuperação ambiental";
  if (theme === "áreas críticas" || theme === "áreas prioritárias") return "Áreas críticas e prioritárias";
  return "Diagnóstico territorial e ambiental";
};

const territoryFor = (territory?: string | null) => {
  if (!territory) return undefined;
  if (territory === "25 municípios da Bacia Hidrográfica do Rio Potengi") {
    return "Bacia Hidrográfica do Rio Potengi";
  }

  return territory;
};

const primaryUrlFor = (item: MapCatalogItem) => item.downloadUrl ?? item.sourceUrl ?? item.previewUrl;

const toMapItem = (item: MapCatalogItem): StaticMapItem => {
  const metas = formatMeta(item.meta ?? []);
  const originalUrl = primaryUrlFor(item);
  const theme = titleCase(item.theme);
  const webgisAvailable = webgisRelationsWithAccess.has(item.webgisRelation);
  const featured = featuredContent[item.id];
  const secondaryActions = [
    webgisAvailable ? { label: "Ver no WebGIS", href: "/webgis" } : undefined,
    ...(item.alternateUrls ?? []).map((href, index) => ({
      label: `Arquivo alternativo ${index + 1}`,
      href,
      external: true
    }))
  ].filter(Boolean) as NonNullable<StaticMapItem["secondaryActions"]>;

  return {
    id: item.id,
    title: item.title,
    meta: metas.join(", "),
    metas,
    theme,
    territory: territoryFor(item.territory),
    group: groupFor(item),
    source: "Projeto Rio Potengi",
    originalUrl,
    previewUrl: item.previewUrl ?? undefined,
    downloadUrl: item.downloadUrl ?? undefined,
    alternateUrls: item.alternateUrls ?? [],
    localAsset: `/media/maps/previews/${item.id}.jpg`,
    altText: item.title,
    status: "aprovado" as EditorialStatus,
    primaryAction: originalUrl
      ? {
          label: "Abrir original",
          href: originalUrl,
          external: originalUrl.startsWith("http")
        }
      : undefined,
    secondaryActions,
    webgisRelation: item.webgisRelation,
    webgisAvailable: webgisAvailable ? "Sim" : undefined,
    featured: Boolean(featured),
    featuredOrder: featured?.order,
    featuredDescription: featured?.description,
    featuredLabel: featured?.label,
    featuredMethod: featured?.method,
    details: [
      territoryFor(item.territory) ? { label: "Território", value: territoryFor(item.territory) as string } : undefined
    ].filter(Boolean) as StaticMapItem["details"],
    searchText: [
      item.title,
      item.theme,
      territoryFor(item.territory),
      item.webgisRelation,
      metas.join(" "),
      groupFor(item),
      webgisAvailable ? "disponível no webgis" : undefined
    ].join(" ")
  };
};

const uniqueOptions = (values: Array<string | undefined>) =>
  Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"));

export const staticMaps: StaticMapItem[] = mapsCatalog.items.map(toMapItem);

export const featuredMaps: StaticMapItem[] = staticMaps
  .filter((item) => item.featured)
  .sort((a, b) => (featuredContent[a.id]?.order ?? 0) - (featuredContent[b.id]?.order ?? 0));

export const mapFilters: CatalogFilter[] = [
  {
    key: "group",
    label: "Conjunto",
    options: [
      "Diagnóstico territorial e ambiental",
      "Áreas críticas e prioritárias",
      "Recuperação ambiental",
      "Saneamento básico"
    ]
  },
  { key: "metas", label: "Meta", options: ["Meta 1", "Meta 3", "Meta 4", "Meta 6"] },
  { key: "theme", label: "Tema", options: uniqueOptions(staticMaps.map((item) => item.theme)) },
  { key: "territory", label: "Território", options: uniqueOptions(staticMaps.map((item) => item.territory)) },
  { key: "webgisAvailable", label: "Disponível no WebGIS", options: ["Sim"] }
];
