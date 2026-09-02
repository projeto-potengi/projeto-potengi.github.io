import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";
import HomeArchiveShowcase from "@/src/components/HomeArchiveShowcase";
import HomeWebgisPreview from "@/src/components/HomeWebgisPreview";
import { documentCatalog } from "@/src/data/documents";
import { staticMaps } from "@/src/data/maps";
import { records } from "@/src/data/records";
import { formatHectares, recoveryAreas, recoveryTotalHectares } from "@/src/data/project";

const indicators = [
  {
    value: "7",
    label: "metas",
    description: "Do diagnóstico territorial à comunicação social."
  },
  {
    value: "25",
    label: "municípios",
    description: "Abrangidos pelo diagnóstico de saneamento."
  },
  {
    value: "4",
    label: "áreas de recuperação",
    description: "Em Cerro Corá, São Tomé e Macaíba."
  },
  {
    value: formatHectares(recoveryTotalHectares),
    label: "recuperação ambiental",
    description: "Nas quatro áreas trabalhadas pelo projeto."
  }
];

const fronts = [
  {
    number: "01",
    title: "Conhecer e priorizar",
    metas: "Metas 1 e 3",
    text: "Diagnóstico territorial, análise ambiental e validação das áreas prioritárias."
  },
  {
    number: "02",
    title: "Recuperar e monitorar",
    metas: "Metas 4 e 5",
    text: "Recuperação ambiental, manejo das áreas trabalhadas e proposição de monitoramento."
  },
  {
    number: "03",
    title: "Educar, sanear e comunicar",
    metas: "Metas 2, 6 e 7",
    text: "Educação ambiental, proposições de saneamento básico e comunicação social."
  }
];

function itemTitle(item: { id: string } & Record<string, unknown>) {
  const title = typeof item.title === "string" ? item.title.trim() : "";
  const name = typeof item.name === "string" ? item.name.trim() : "";
  return title || name || item.id.replace(/-/g, " ");
}


function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

const homeMapIds = [
  "vulnerabilidade-erosao",
  "areas-prioritarias",
  "uso-cobertura-terra",
  "agua-indice-seguranca-hidrica",
  "drenagem-vulnerabilidade-apps"
];

const mapHighlights = homeMapIds
  .map((id) => staticMaps.find((item) => item.id === id))
  .filter(Boolean) as typeof staticMaps;

const curatedMapHighlights = mapHighlights
  .filter((item) => Boolean(item.localAsset))
  .map((item) => ({
    id: item.id,
    title: itemTitle(item as typeof item & Record<string, unknown>),
    src: item.localAsset as string,
    alt: item.altText ?? "Mapa temático da Bacia do Rio Potengi",
    meta: item.theme
  }));

// Curadoria da Home baseada no catálogo real de registros do projeto.
// O carrossel não repete o hero nem as imagens usadas para representar as quatro áreas de recuperação.
const preferredRecordIds = [
  "olheiro-capela-11",
  "implantacao-renques-2024",
  "oficina-educacao-ambiental-cerro-cora-2023",
  "regeneracao-vegetacao-2024",
  "cercamento-monitorado-2025"
];

const excludedHomeRecordIds = new Set([
  "rio-potengi-sao-tome-2022",
  "oficina-plantio-eaj",
  "area-recuperacao-eaj-visao-aerea",
  "fazenda-mundo-novo-visao-aerea",
  "equipe-nascente-potengi-2022"
]);

const preferredRecords = preferredRecordIds
  .map((id) => records.find((item) => item.id === id))
  .filter(Boolean) as typeof records;

const fallbackRecords = records.filter(
  (item) =>
    Boolean(item.localAsset) &&
    !excludedHomeRecordIds.has(item.id) &&
    !preferredRecordIds.includes(item.id)
);

function recordMeta(item: Record<string, unknown>) {
  const municipality = typeof item.municipality === "string" ? item.municipality.trim() : "";
  const activity = typeof item.activity === "string" ? item.activity.trim() : "";
  return municipality || activity || undefined;
}

const recordHighlights = uniqueById([...preferredRecords, ...fallbackRecords])
  .filter((item) => Boolean(item.localAsset) && !excludedHomeRecordIds.has(item.id))
  .slice(0, 5)
  .map((item) => ({
    id: item.id,
    title: itemTitle(item as typeof item & Record<string, unknown>),
    src: item.localAsset as string,
    alt: item.altText ?? "Registro fotográfico do Projeto Potengi",
    meta: recordMeta(item as typeof item & Record<string, unknown>)
  }));

function countDocuments(category: string) {
  return documentCatalog.items.filter((item) => item.category.toLocaleLowerCase("pt-BR") === category.toLocaleLowerCase("pt-BR")).length;
}

const documentSummary = [
  { label: "documentos públicos", value: documentCatalog.items.length },
  { label: "produções acadêmicas", value: documentCatalog.items.filter((item) => item.group === "producao_academica").length },
  { label: "relatórios de campo", value: documentCatalog.items.filter((item) => item.group === "relatorios_de_campo").length },
  { label: "materiais educativos", value: documentCatalog.items.filter((item) => item.group === "materiais_educativos").length }
];

const academicSummary = [
  { label: "artigos em periódicos", value: countDocuments("artigo em periódico") },
  { label: "dissertações de mestrado", value: countDocuments("dissertação de mestrado") },
  { label: "trabalhos de conclusão de curso", value: countDocuments("Trabalho de Conclusão de Curso") },
  { label: "trabalhos em eventos", value: countDocuments("trabalho em evento") },
  { label: "livro / e-book", value: countDocuments("livro / e-book") }
];

const otherDocumentSummary = [
  { label: "documentos de comunicação social", value: documentCatalog.items.filter((item) => item.group === "comunicacao_social").length },
  { label: "documentos de recuperação ambiental / PRADs", value: documentCatalog.items.filter((item) => item.group === "recuperacao_ambiental").length },
  { label: "relatórios técnicos", value: documentCatalog.items.filter((item) => item.group === "relatorios_tecnicos").length },
  { label: "plano de monitoramento", value: documentCatalog.items.filter((item) => item.group === "monitoramento").length }
];

const featuredBook = documentCatalog.items.find((item) => item.category === "livro / e-book");

const hectareKeys = ["hectares", "areaHectares", "recoveredHectares", "hectaresRecovered", "areaHa", "ha"];

function recoveryHectares(item: unknown) {
  if (!item || typeof item !== "object") return null;
  const source = item as Record<string, unknown>;
  for (const key of hectareKeys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  }
  return null;
}

const recoveryBreakdown = recoveryAreas.map((item) => ({
  area: item.area,
  municipality: item.municipality,
  hectares: recoveryHectares(item)
}));

const breakdownValues = recoveryBreakdown.map((item) => item.hectares);
const breakdownSum = breakdownValues.reduce<number>((sum, value) => sum + (value ?? 0), 0);
const hasValidatedBreakdown =
  recoveryBreakdown.length > 0 &&
  breakdownValues.every((value) => value !== null) &&
  Math.abs(breakdownSum - recoveryTotalHectares) <= 0.05;

const recoveryVisuals = [
  {
    area: "Nascentes do Potengi",
    municipality: "Cerro Corá",
    hectares: 2.28,
    src: "/media/home/recovery/nascentes-potengi-cerro-cora.jpg",
    alt: "Vista aérea da área das Nascentes do Potengi em Cerro Corá"
  },
  {
    area: "APP do Açude Eloy de Souza",
    municipality: "Cerro Corá",
    hectares: 3.11,
    src: "/media/home/recovery/app-acude-eloy-cerro-cora.jpg",
    alt: "Vista aérea da área de recuperação da APP do Açude Eloy de Souza em Cerro Corá"
  },
  {
    area: "Fazenda Mundo Novo",
    municipality: "São Tomé",
    hectares: 5.05,
    src: "/media/home/recovery/fazenda-mundo-novo-sao-tome.jpg",
    alt: "Vista aérea da Fazenda Mundo Novo em São Tomé"
  },
  {
    area: "Açude do Bêbado · EAJ/UFRN",
    municipality: "Macaíba",
    hectares: 5.81,
    src: "/media/home/recovery/acude-bebado-eaj-macaiba.jpg",
    alt: "Vista aérea da área de recuperação do Açude do Bêbado na EAJ/UFRN em Macaíba"
  }
];

const institutionalBrands = [
  { key: "ufrn", src: "/media/home/brands/ufrn.png", alt: "Universidade Federal do Rio Grande do Norte" },
  { key: "funpec", src: "/media/home/brands/funpec.png", alt: "Fundação Norte-Rio-Grandense de Pesquisa e Cultura" },
  {
    key: "midr",
    src: "/media/home/brands/midr.png",
    alt: "Ministério da Integração e do Desenvolvimento Regional"
  },
];

export default function Home() {
  return (
    <main className="rpf-home">
      <section className="rpf-hero" aria-labelledby="rpf-home-title">
        <div className="rpf-hero-main">
          <div className="rpf-hero-copy">
            <p className="rpf-kicker">Da bacia aos resultados</p>
            <h1 id="rpf-home-title">Conhecimento e recuperação ambiental na Bacia do Rio Potengi</h1>
            <p className="rpf-lead">
              Resultados, áreas de atuação, documentos e dados territoriais produzidos pelo Projeto Potengi reunidos
              em um único portal.
            </p>
            <div className="rpf-actions">
              <Link href="/webgis" className="rpf-button rpf-button-primary">
                Explorar o WebGIS <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/resultados" className="rpf-button rpf-button-secondary">
                Conhecer os resultados
              </Link>
            </div>
          </div>

          <figure className="rpf-hero-media">
            <Image
              src="/media/photos/rio-potengi-encontro-litoral.jpg"
              alt="Vista aérea da foz do Rio Potengi, com a Ponte Newton Navarro e a faixa litorânea"
              fill
              sizes="(max-width: 900px) 100vw, 72vw"
              priority
            />
            <figcaption>Foz do Rio Potengi e Ponte Newton Navarro · Projeto Potengi</figcaption>
          </figure>
        </div>

        <div className="rpf-stats" aria-label="Indicadores principais">
          {indicators.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <div>
                <span>{item.label}</span>
                <small>{item.description}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rpf-section rpf-fronts" aria-labelledby="rpf-fronts-title">
        <header className="rpf-section-heading">
          <p className="rpf-kicker">Sete metas em três frentes</p>
          <h2 id="rpf-fronts-title">Do diagnóstico territorial à comunicação dos resultados</h2>
        </header>

        <div className="rpf-front-grid">
          {fronts.map((front) => (
            <article className={`rpf-front rpf-front-${front.number}`} key={front.number}>
              <div className="rpf-front-meta">
                <span>{front.number}</span>
                <small>{front.metas}</small>
              </div>
              <h3>{front.title}</h3>
              <p>{front.text}</p>
            </article>
          ))}
        </div>

        <Link href="/resultados" className="rpf-inline-link">
          Ver resultados do projeto <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section className="rpf-webgis" aria-labelledby="rpf-webgis-title">
        <div className="rpf-webgis-inner">
          <div className="rpf-webgis-copy">
            <p className="rpf-kicker rpf-kicker-light">Território navegável</p>
            <h2 id="rpf-webgis-title">Explore a Bacia do Rio Potengi</h2>
            <p>
              Consulte diretamente no mapa o limite da bacia, a rede hidrográfica, áreas prioritárias e elementos das
              ações de recuperação disponíveis no portal.
            </p>
            <Link href="/webgis" className="rpf-button rpf-button-accent">
              Abrir WebGIS completo <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <HomeWebgisPreview />
        </div>
      </section>

      <section className="rpf-section rpf-recovery" aria-labelledby="rpf-recovery-title">
        <header className="rpf-section-heading rpf-section-heading-compact">
          <p className="rpf-kicker">Resultado de recuperação</p>
          <h2 id="rpf-recovery-title">Recuperação ambiental em quatro áreas da bacia</h2>
        </header>

        <div className="rpf-recovery-data" aria-label="Síntese das ações de recuperação ambiental">
          {hasValidatedBreakdown ? (
            <>
              <div className="rpf-recovery-bars" aria-label="Distribuição da recuperação ambiental por área">
                {recoveryBreakdown.map((item, index) => {
                  const hectares = item.hectares ?? 0;
                  const percentage = recoveryTotalHectares > 0 ? (hectares / recoveryTotalHectares) * 100 : 0;
                  return (
                    <div
                      key={item.area}
                      className={`rpf-recovery-segment rpf-recovery-segment-${index + 1}`}
                      style={{ "--segment-width": `${percentage}%` } as CSSProperties}
                    >
                      <span>{item.area}</span>
                      <small>{item.municipality}</small>
                      <strong>{formatHectares(hectares)}</strong>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rpf-recovery-bridge">
              <div>
                <strong>4</strong>
                <span>áreas trabalhadas</span>
              </div>
              <i aria-hidden="true" />
              <div>
                <strong>3</strong>
                <span>municípios</span>
              </div>
            </div>
          )}
        </div>

        <div className="rpf-recovery-feature">
          <div className="rpf-recovery-gallery" aria-label="Registros visuais das quatro áreas de recuperação">
            {recoveryVisuals.map((item) => (
              <figure key={item.area}>
                <Image src={item.src} alt={item.alt} width={1600} height={1000} />
                <figcaption>
                  <span>{item.area}</span>
                  <small>{item.municipality} · {formatHectares(item.hectares)}</small>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="rpf-recovery-copy">
            <p className="rpf-kicker">Quatro áreas, três municípios</p>
            <div className="rpf-recovery-total-panel" aria-label={`Total recuperado: ${formatHectares(recoveryTotalHectares)}`}>
              <small>Total recuperado</small>
              <strong>{formatHectares(recoveryTotalHectares)}</strong>
              <span>de recuperação ambiental</span>
            </div>
            <h3>Quatro áreas trabalhadas pelo Projeto Potengi</h3>
            <p>
              Os registros mostram as quatro áreas de recuperação trabalhadas em Cerro Corá, São Tomé e Macaíba.
            </p>
            <Link href="/resultados" className="rpf-inline-link">
              Ver detalhamento em Resultados <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rpf-section rpf-archive" aria-labelledby="rpf-archive-title">
        <header className="rpf-section-heading rpf-section-heading-compact">
          <p className="rpf-kicker">Mapas, registros e documentos</p>
          <h2 id="rpf-archive-title">Explore o acervo do projeto</h2>
        </header>
        <HomeArchiveShowcase
          maps={curatedMapHighlights}
          records={recordHighlights}
          documentSummary={documentSummary}
          academicSummary={academicSummary}
          otherDocumentSummary={otherDocumentSummary}
          featuredBook={featuredBook ? { title: featuredBook.title, meta: `Publicação em destaque · ${featuredBook.year}` } : undefined}
        />
      </section>

      <section className="rpf-brand-strip" aria-label="Instituições vinculadas ao Projeto Potengi">
        <div className="rpf-brand-strip-inner">
          <div className="rpf-brand-institutions">
            <span className="rpf-brand-heading">Instituições vinculadas ao projeto</span>
            <div className="rpf-brand-logos">
              {institutionalBrands.map((brand) => (
                <div className={`rpf-brand-logo rpf-brand-logo-${brand.key}`} key={brand.key}>
                  <Image src={brand.src} alt={brand.alt} width={520} height={180} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="rpf-footer">
        <div className="rpf-footer-project">
          <Image
            className="rpf-footer-project-mark"
            src="/brand/projeto-potengi-logo.png"
            alt="Projeto Potengi"
            width={74}
            height={88}
          />
          <div>
            <strong>Projeto Potengi</strong>
            <span>Portal público de resultados do Projeto Potengi.</span>
          </div>
        </div>

        <p className="rpf-footer-credits">
          Créditos: Projeto Potengi/UFRN/Funpec; registros, documentos e bases geoespaciais do projeto.
        </p>

        <div className="rpf-footer-meta">
          <a
            className="rpf-footer-instagram"
            href="https://www.instagram.com/projetopotengiufrn/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram do Projeto Potengi"
          >
            <Instagram size={21} strokeWidth={2} aria-hidden="true" />
            <span>@projetopotengiufrn</span>
          </a>
          <small>Portal Projeto Potengi · 2026</small>
        </div>
      </footer>
    </main>
  );
}
