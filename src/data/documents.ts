import type { CatalogFilter, CatalogItemBase, EditorialStatus } from "./catalog-model";
import documentsCatalog from "@/fontes/fase-2/catalogo_documentos_fase2.json";

export type DocumentItem = CatalogItemBase & {
  category: string;
  format: "PDF" | "DOCX" | "PPTX" | "XLSX" | "ZIP" | "MP4" | "Pasta" | "Link";
  authorship?: string;
  actionLabel: "Abrir" | "Visualizar" | "Acessar pasta" | "Baixar";
  accessStatus?: string;
};

const metaLabel = (value: number) => `Meta ${value}`;

const categoryLabel = (category: string) => {
  const normalized = category.toLocaleLowerCase("pt-BR");
  if (normalized.includes("material")) return "Materiais educativos";
  if (normalized.includes("prad") || normalized.includes("diagnóstico")) return "PRADs e diagnósticos";
  if (normalized.includes("comunicação")) return "Comunicação social";
  if (normalized.includes("gestão")) return "Relatório de execução física e financeira";
  if (normalized.includes("apresentação")) return "Apresentações";
  if (normalized.includes("vídeo")) return "Fotografias e vídeos";
  return "Relatórios por meta";
};

const inferYear = (item: (typeof documentsCatalog.items)[number]) => {
  const match = item.title.match(/20\d{2}/);
  if (match) return match[0];
  if (item.id.includes("meta-1") || item.id.includes("meta-2") || item.id.includes("meta-3") || item.id.includes("meta-6")) {
    return "2025";
  }
  if (item.id.includes("2022")) return "2022";
  if (item.id.includes("2023")) return "2023";
  if (item.id.includes("2024")) return "2024";
  return undefined;
};

const actionForFormat = (format: string): DocumentItem["actionLabel"] => {
  if (format === "PPTX") return "Baixar";
  if (format === "MP4") return "Visualizar";
  return "Abrir";
};

export const documents: DocumentItem[] = documentsCatalog.items.map((item) => {
  const metas = item.meta.map(metaLabel);
  const href = item.publicPath ?? item.sourceUrl ?? "#";
  const year = inferYear(item);
  const category = categoryLabel(item.category);
  const isExternal = Boolean(item.sourceUrl);

  return {
    id: item.id,
    title: item.title,
    description: `${category}. Link individual informado no catálogo editorial da Fase 2.`,
    meta: metas.join(", "),
    metas,
    category,
    format: item.format as DocumentItem["format"],
    year,
    authorship: undefined,
    actionLabel: actionForFormat(item.format),
    source: isExternal ? "Google Drive do Projeto Potengi" : "Arquivo local autorizado no portal",
    originalUrl: href,
    status: item.editorialStatus as EditorialStatus,
    statusNote:
      item.accessStatus === "testar_em_janela_anonima"
        ? "Acesso externo a confirmar em navegação pública."
        : item.accessStatus === "confirmar_publicacao"
          ? "Publicação direta em conferência institucional."
          : undefined,
    accessStatus: item.accessStatus,
    primaryAction: {
      label: actionForFormat(item.format),
      href,
      external: isExternal
    },
    details: [
      { label: "Categoria", value: category },
      { label: "Formato", value: item.format },
      year ? { label: "Ano", value: year } : undefined,
      { label: "Acesso", value: isExternal ? "Externo" : "Local" }
    ].filter(Boolean) as DocumentItem["details"],
    searchText: [item.title, category, item.format, year, metas.join(" "), item.sourceUrl, item.publicPath].join(" ")
  };
});

export const documentFilters: CatalogFilter[] = [
  { key: "meta", label: "Meta", options: ["Meta 1", "Meta 2", "Meta 3", "Meta 4", "Meta 5", "Meta 6", "Meta 7"] },
  {
    key: "category",
    label: "Categoria",
    options: [
      "Relatórios por meta",
      "Relatório de execução física e financeira",
      "Materiais educativos",
      "Produção técnica e acadêmica",
      "PRADs e diagnósticos",
      "Legislação e instrumentos de cooperação",
      "Apresentações",
      "Dados geoespaciais",
      "Comunicação social"
    ]
  },
  { key: "year", label: "Ano", options: ["2022", "2023", "2024", "2025", "2026"] },
  { key: "format", label: "Formato", options: ["PDF", "MP4", "PPTX"] }
];
