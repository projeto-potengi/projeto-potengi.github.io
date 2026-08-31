export type LayerKind = "polygon" | "line" | "point";

export type LayerGroup =
  | "Território"
  | "Hidrografia"
  | "Diagnóstico ambiental"
  | "Vulnerabilidade e áreas prioritárias"
  | "Recuperação ambiental"
  | "Saneamento";

export type LayerConfig = {
  id: string;
  title: string;
  group: LayerGroup;
  description: string;
  source: string;
  credit: string;
  url: string;
  kind: LayerKind;
  color: string;
  fill?: string;
  visible: boolean;
  opacity: number;
  fieldLabels?: Record<string, string>;
};

export const layerGroups: LayerGroup[] = [
  "Território",
  "Hidrografia",
  "Diagnóstico ambiental",
  "Vulnerabilidade e áreas prioritárias",
  "Recuperação ambiental",
  "Saneamento"
];

export const layerConfigs: LayerConfig[] = [
  {
    id: "limite-bacia",
    title: "Bacia Hidrográfica do Rio Potengi",
    group: "Território",
    description: "Limite espacial da área de atuação do Projeto Potengi.",
    source: "Base geoespacial do Projeto Potengi, camada de limite da bacia.",
    credit: "Projeto Potengi/UFRN/FUNPEC",
    url: "/data/geospatial/limite-bacia.geojson",
    kind: "polygon",
    color: "#0f8aa8",
    fill: "rgba(15, 138, 168, 0.14)",
    visible: true,
    opacity: 0.92,
    fieldLabels: {
      Nome: "Nome",
      Area: "Área",
      Shape_Area: "Área calculada",
      Shape_Leng: "Perímetro calculado"
    }
  },
  {
    id: "rios",
    title: "Rede hidrográfica",
    group: "Hidrografia",
    description: "Rios e drenagens disponíveis na base geoespacial do projeto.",
    source: "Base geoespacial do Projeto Potengi, camada de rios.",
    credit: "Projeto Potengi/UFRN/FUNPEC",
    url: "/data/geospatial/rios.geojson",
    kind: "line",
    color: "#149bd7",
    visible: true,
    opacity: 0.86,
    fieldLabels: {
      Nome: "Curso d'água",
      NOME: "Curso d'água",
      Shape_Leng: "Comprimento calculado"
    }
  },
  {
    id: "areas-prioritarias-alta",
    title: "Áreas prioritárias - alta",
    group: "Vulnerabilidade e áreas prioritárias",
    description: "Áreas classificadas como prioritárias em nível alto nos dados do projeto.",
    source: "Base geoespacial do Projeto Potengi, camada de áreas prioritárias.",
    credit: "Projeto Potengi/UFRN/FUNPEC",
    url: "/data/geospatial/areas-prioritarias-alta.geojson",
    kind: "polygon",
    color: "#e0a529",
    fill: "rgba(224, 165, 41, 0.36)",
    visible: true,
    opacity: 0.74,
    fieldLabels: {
      gridcode: "Código da classe",
      Area: "Área",
      Shape_Area: "Área calculada"
    }
  },
  {
    id: "areas-prioritarias-extrema",
    title: "Áreas prioritárias - extrema alta",
    group: "Vulnerabilidade e áreas prioritárias",
    description: "Áreas de maior criticidade disponíveis nos dados geoespaciais processados.",
    source: "Base geoespacial do Projeto Potengi, camada de áreas prioritárias.",
    credit: "Projeto Potengi/UFRN/FUNPEC",
    url: "/data/geospatial/areas-prioritarias-extrema.geojson",
    kind: "polygon",
    color: "#bf3b37",
    fill: "rgba(191, 59, 55, 0.42)",
    visible: true,
    opacity: 0.8,
    fieldLabels: {
      gridcode: "Código da classe",
      Area: "Área",
      Shape_Area: "Área calculada"
    }
  },
  {
    id: "app-wallace",
    title: "Áreas de preservação permanente",
    group: "Recuperação ambiental",
    description: "APPs associadas aos dados de recuperação e acompanhamento ambiental.",
    source: "Base geoespacial do Projeto Potengi, camada APP Wallace.",
    credit: "Projeto Potengi/UFRN/FUNPEC",
    url: "/data/geospatial/app-wallace.geojson",
    kind: "polygon",
    color: "#359c58",
    fill: "rgba(53, 156, 88, 0.24)",
    visible: false,
    opacity: 0.68,
    fieldLabels: {
      Shape_Area: "Área calculada",
      Shape_Leng: "Perímetro calculado"
    }
  },
  {
    id: "app-wallace-efemero",
    title: "APPs de rios efêmeros",
    group: "Recuperação ambiental",
    description: "Áreas de preservação relacionadas a rios efêmeros na base de recuperação.",
    source: "Base geoespacial do Projeto Potengi, camada APP Wallace Efêmero.",
    credit: "Projeto Potengi/UFRN/FUNPEC",
    url: "/data/geospatial/app-wallace-efemero.geojson",
    kind: "polygon",
    color: "#70b84f",
    fill: "rgba(112, 184, 79, 0.22)",
    visible: false,
    opacity: 0.66,
    fieldLabels: {
      Shape_Area: "Área calculada",
      Shape_Leng: "Perímetro calculado"
    }
  },
  {
    id: "cercas",
    title: "Cercamentos de recuperação",
    group: "Recuperação ambiental",
    description: "Trechos de cercamento associados às intervenções de recuperação ambiental.",
    source: "Base geoespacial do Projeto Potengi, camadas de cercas.",
    credit: "Projeto Potengi/UFRN/FUNPEC",
    url: "/data/geospatial/cercas.geojson",
    kind: "line",
    color: "#6f7b2f",
    visible: false,
    opacity: 0.9,
    fieldLabels: {
      Nome: "Identificação",
      Shape_Leng: "Comprimento calculado"
    }
  },
  {
    id: "coletas",
    title: "Pontos de coleta e campo",
    group: "Recuperação ambiental",
    description: "Pontos de campo disponíveis na base geoespacial do projeto.",
    source: "Base geoespacial do Projeto Potengi, camada de coletas.",
    credit: "Projeto Potengi/UFRN/FUNPEC",
    url: "/data/geospatial/coletas.geojson",
    kind: "point",
    color: "#255f71",
    visible: false,
    opacity: 0.95,
    fieldLabels: {
      Nome: "Identificação",
      Municipio: "Município",
      Data: "Data"
    }
  }
];

export const vulnerabilityLegend = [
  { label: "Muito baixa", color: "#2f9c67" },
  { label: "Baixa", color: "#92bf54" },
  { label: "Moderada", color: "#ffd45a" },
  { label: "Alta", color: "#f28a2e" },
  { label: "Muito alta", color: "#b8173f" }
];
