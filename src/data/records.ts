import recordsCatalog from "@/fontes/completude-2026-08-26/catalogo_registros_completude_2026-08-26.json";

export type RecordCategory = "Território" | "Campo" | "Educação" | "Recuperação" | "Monitoramento";

export type RecordItem = {
  id: string;
  title: string;
  metas: string[];
  group: string;
  category: RecordCategory;
  activity: string;
  municipality?: string;
  date?: string;
  credit?: string;
  rights: string;
  localAsset: string;
  altText: string;
  imageWidth: number;
  imageHeight: number;
};

const narrativeOrder = [
  "rio-potengi-sao-tome-2022", "equipe-nascente-potengi-2022", "oficina-educacao-ambiental-cerro-cora-2023",
  "area-recuperacao-eaj-visao-aerea", "cercamento-app-eloy-cerro-cora", "implantacao-renques-2024",
  "oficina-plantio-eaj", "palma-implantada-2024", "barramento-pedras-eaj",
  "parcelas-plantio-visao-aerea", "fazenda-mundo-novo-visao-aerea", "olheiro-capela-11", "monitoramento-em-campo",
  "regeneracao-vegetacao-2024", "cercamento-monitorado-2025", "equipe-atividade-plantio-eaj", "foz-potengi-ponte-newton-navarro"
] as const;

const publicCategories: Record<string, RecordCategory> = {
  "território": "Território",
  "validação em campo": "Campo",
  "educação e mobilização": "Educação",
  "áreas trabalhadas": "Recuperação",
  "recuperação ambiental": "Recuperação",
  "monitoramento": "Monitoramento"
};

const formatDate = (date: string | null) => date
  ? new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))
  : undefined;

const catalogById = new Map(recordsCatalog.items.map((item) => [item.id, item]));

const imageDimensions: Record<string, readonly [number, number]> = {
  "area-recuperacao-eaj-visao-aerea": [5280, 2970],
  "barramento-pedras-eaj": [520, 693],
  "foz-potengi-ponte-newton-navarro": [5280, 3956],
  "equipe-nascente-potengi-2022": [3840, 2160],
  "rio-potengi-sao-tome-2022": [3840, 2160],
  "equipe-atividade-plantio-eaj": [4080, 2296],
  "palma-implantada-2024": [4080, 1836],
  "fazenda-mundo-novo-visao-aerea": [1920, 1080],
  "parcelas-plantio-visao-aerea": [2112, 1583],
  "regeneracao-vegetacao-2024": [4080, 1836],
  "olheiro-capela-11": [5280, 3956],
  "oficina-educacao-ambiental-cerro-cora-2023": [4128, 3096],
  "monitoramento-em-campo": [960, 1280],
  "cercamento-app-eloy-cerro-cora": [960, 1280],
  "cercamento-monitorado-2025": [4000, 3000],
  "oficina-plantio-eaj": [960, 1280],
  "implantacao-renques-2024": [4080, 1836]
};

export const records: RecordItem[] = narrativeOrder.map((id) => {
  const item = catalogById.get(id);
  if (!item) throw new Error(`Registro editorial ausente: ${id}`);
  const municipality = item.municipality ?? undefined;
  const credit = item.credit && item.credit.toLocaleLowerCase("pt-BR") !== ["a", "confirmar"].join(" ") ? item.credit : undefined;
  const metas = item.metas.map((meta) => `Meta ${meta}`);
  const [imageWidth, imageHeight] = imageDimensions[item.id] ?? [1600, 1200];

  return {
    id: item.id,
    title: item.title,
    metas,
    group: item.group,
    category: publicCategories[item.group],
    activity: item.activity,
    municipality,
    date: formatDate(item.date),
    credit,
    rights: item.rights,
    localAsset: `/media/records/${item.publicFile}`,
    altText: item.alt,
    imageWidth,
    imageHeight
  };
});

export const heroRecord = records.find((item) => item.id === "fazenda-mundo-novo-visao-aerea");
