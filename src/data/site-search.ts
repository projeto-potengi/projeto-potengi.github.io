import { documents } from "@/src/data/documents";
import { staticMaps } from "@/src/data/maps";
import { goals } from "@/src/data/project";
import { records } from "@/src/data/records";

export type SiteSearchCategory =
  | "Página"
  | "Resultado"
  | "Mapa"
  | "Registro"
  | "Documento";

export type SiteSearchItem = {
  id: string;
  title: string;
  category: SiteSearchCategory;
  description: string;
  href: string;
  searchText: string;
  meta?: string;
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

const pageItems: SiteSearchItem[] = [
  {
    id: "inicio",
    title: "Início",
    category: "Página",
    description: "Síntese do Projeto Potengi, resultados principais e acessos ao portal.",
    href: "/",
    meta: "Portal",
    searchText: "inicio projeto potengi resultados territorio bacia"
  },
  {
    id: "projeto",
    title: "O Projeto",
    category: "Página",
    description: "Contexto, objetivo, metodologia, território, coordenação e instituições.",
    href: "/projeto",
    meta: "Institucional",
    searchText: "projeto objetivo metodologia territorio coordenacao instituicoes"
  },
  {
    id: "resultados",
    title: "Resultados",
    category: "Página",
    description: "Síntese das sete metas e dos principais resultados do projeto.",
    href: "/resultados",
    meta: "7 metas",
    searchText: "resultados sete metas recuperacao saneamento diagnostico"
  },
  {
    id: "webgis",
    title: "WebGIS",
    category: "Página",
    description: "Exploração interativa dos dados geoespaciais da Bacia do Rio Potengi.",
    href: "/webgis",
    meta: "Mapa interativo",
    searchText: "webgis mapa camadas dados geoespaciais bacia"
  },
  {
    id: "mapas",
    title: "Mapas",
    category: "Página",
    description: "Produtos cartográficos produzidos no âmbito do Projeto Potengi.",
    href: "/mapas",
    meta: "Acervo cartográfico",
    searchText: "mapas cartografia produtos cartograficos"
  },
  {
    id: "registros",
    title: "Registros",
    category: "Página",
    description: "Memória visual das atividades realizadas no território.",
    href: "/registros",
    meta: "Fotografias",
    searchText: "registros fotos fotografias campo atividades"
  },
  {
    id: "documentos",
    title: "Documentos",
    category: "Página",
    description: "Relatórios, materiais educativos, apresentações e documentos técnicos.",
    href: "/documentos",
    meta: "Acervo documental",
    searchText: "documentos relatorios materiais pdf apresentacoes"
  }
];

const goalItems: SiteSearchItem[] = goals.map((goal) => ({
  id: goal.id,
  title: goal.title,
  category: "Resultado",
  description: goal.objective,
  href: `/resultados#${goal.id}`,
  meta: goal.shortTitle,
  searchText: [
    goal.title,
    goal.shortTitle,
    goal.objective,
    ...goal.actions,
    ...goal.results,
    ...goal.areas,
    ...goal.products
  ]
    .map(normalize)
    .join(" ")
}));

const mapItems: SiteSearchItem[] = staticMaps.map((item) => ({
  id: `mapa-${item.id}`,
  title: item.title,
  category: "Mapa",
  description: [item.theme, item.territory].filter(Boolean).join(" · "),
  href: "/mapas",
  meta: item.meta || item.group,
  searchText: normalize(
    [
      item.title,
      item.theme,
      item.territory,
      item.group,
      item.meta,
      item.searchText
    ].join(" ")
  )
}));

const recordItems: SiteSearchItem[] = records.map((item) => ({
  id: `registro-${item.id}`,
  title: item.title,
  category: "Registro",
  description: [item.municipality, item.category, item.activity]
    .filter(Boolean)
    .join(" · "),
  href: "/registros",
  meta: item.metas.join(", "),
  searchText: normalize(
    [
      item.title,
      item.municipality,
      item.category,
      item.activity,
      item.metas.join(" "),
      "searchText" in item ? item.searchText : ""
    ].join(" ")
  )
}));

const documentItems: SiteSearchItem[] = documents.map((item) => ({
  id: `documento-${item.id}`,
  title: item.title,
  category: "Documento",
  description: [item.category, item.format, item.year].filter(Boolean).join(" · "),
  href: "/documentos",
  meta: item.meta,
  searchText: normalize(
    [
      item.title,
      item.description,
      item.category,
      item.format,
      item.year,
      item.meta,
      item.searchText
    ].join(" ")
  )
}));

export const siteSearchIndex: SiteSearchItem[] = [
  ...pageItems,
  ...goalItems,
  ...mapItems,
  ...recordItems,
  ...documentItems
];

export function searchSite(query: string, limit = 18) {
  const normalized = normalize(query).trim();
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);

  return siteSearchIndex
    .map((item) => {
      const title = normalize(item.title);
      const haystack = normalize(
        [item.title, item.description, item.meta, item.searchText].join(" ")
      );

      let score = 0;

      if (title === normalized) score += 100;
      if (title.startsWith(normalized)) score += 45;
      if (title.includes(normalized)) score += 30;

      for (const term of terms) {
        if (title.includes(term)) score += 12;
        if (haystack.includes(term)) score += 4;
      }

      if (terms.every((term) => haystack.includes(term))) score += 18;

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "pt-BR"))
    .slice(0, limit)
    .map(({ item }) => item);
}
