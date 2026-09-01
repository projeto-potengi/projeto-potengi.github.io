import documentsCatalog from "@/fontes/catalogo_documentos_FINAL_IMPLEMENTACAO_2026-08-31.json";

export type DocumentAccessType = "drive" | "publication" | "local_file" | "reference_only";

export type DocumentCatalogItem = {
  id: string;
  title: string;
  group: string;
  category: string;
  format: string;
  meta: number[];
  year: number;
  authors: string[];
  vehicle: string | null;
  accessType: DocumentAccessType;
  accessUrl: string | null;
  accessLabel: string;
  secondaryUrl: string | null;
};

export type DocumentCatalogGroup = {
  id: string;
  label: string;
  editorialPriority: number;
  featured?: boolean;
  secondaryCollection?: boolean;
};

export const documentCatalog = documentsCatalog as {
  version: string;
  stats: {
    totalItems: number;
  };
  groups: DocumentCatalogGroup[];
  items: DocumentCatalogItem[];
};

// Mantém os consumidores institucionais existentes (busca global e vínculos por meta)
// apontando para o mesmo catálogo final, sem reutilizar a interface visual de Mapas.
export const documents = documentCatalog.items.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.vehicle ?? item.category,
  meta: item.meta.map((value) => `Meta ${value}`).join(", "),
  metas: item.meta.map((value) => `Meta ${value}`),
  category: item.category,
  format: item.format,
  year: String(item.year),
  searchText: [item.title, ...item.authors, item.vehicle, item.category, item.year, ...item.meta.map((value) => `Meta ${value}`)]
    .filter(Boolean)
    .join(" ")
}));
