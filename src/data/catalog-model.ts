export type EditorialStatus = "aprovado" | "aprovado_condicionado" | "colecao_aprovada" | "aguarda_camada";

export type CatalogFilter = {
  key: string;
  label: string;
  options: string[];
};

export type CatalogItemBase = {
  id: string;
  title: string;
  description?: string;
  meta: string;
  metas?: string[];
  year?: string;
  source: string;
  credit?: string;
  originalUrl?: string;
  localAsset?: string;
  altText?: string;
  status: EditorialStatus;
  searchText?: string;
  primaryAction?: {
    label: string;
    href: string;
    external?: boolean;
  };
  secondaryActions?: {
    label: string;
    href: string;
    external?: boolean;
  }[];
  details?: {
    label: string;
    value: string;
  }[];
  statusNote?: string;
};
