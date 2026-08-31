"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, Images, MapPinned } from "lucide-react";

type PreviewItem = {
  id: string;
  title: string;
  src: string;
  alt: string;
  meta?: string;
};

type Props = {
  maps: PreviewItem[];
  records: PreviewItem[];
};

const documentPreviews = [
  {
    src: "/media/home/documents/relatorio-execucao-fisico-financeiro.jpg",
    alt: "Primeira página do Relatório de Execução Físico-Financeiro do Projeto Potengi",
    short: "Execução físico-financeira"
  },
  {
    src: "/media/home/documents/relatorio-resultado-4.jpg",
    alt: "Primeira página do relatório referente ao Resultado número 4 do Projeto Potengi",
    short: "Resultado nº 4"
  },
  {
    src: "/media/home/documents/relatorio-resultado-1.jpg",
    alt: "Primeira página do relatório referente ao Resultado número 1 do Projeto Potengi",
    short: "Resultado nº 1"
  }
];

function boundedIndex(current: number, delta: number, total: number) {
  if (total <= 1) return 0;
  return (current + delta + total) % total;
}

export default function HomeArchiveShowcase({ maps, records }: Props) {
  const [mapIndex, setMapIndex] = useState(0);
  const [recordIndex, setRecordIndex] = useState(0);

  const activeMap = maps[Math.min(mapIndex, Math.max(0, maps.length - 1))];
  const activeRecord = records[Math.min(recordIndex, Math.max(0, records.length - 1))];

  return (
    <div className="rpf-archive-grid">
      <article className="rpf-archive-map">
        <div className="rpf-archive-toolbar">
          <span className="rpf-archive-label">
            <MapPinned size={17} aria-hidden="true" /> Mapas
          </span>
          {maps.length > 1 && (
            <div className="rpf-carousel-controls" aria-label="Navegar pelos mapas em destaque">
              <button
                type="button"
                onClick={() => setMapIndex((value) => boundedIndex(value, -1, maps.length))}
                aria-label="Mapa anterior"
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <span>{mapIndex + 1}/{maps.length}</span>
              <button
                type="button"
                onClick={() => setMapIndex((value) => boundedIndex(value, 1, maps.length))}
                aria-label="Próximo mapa"
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {activeMap && (
          <>
            <div className="rpf-map-stage">
              <Image src={activeMap.src} alt={activeMap.alt} width={1280} height={800} priority={false} />
            </div>
            <div className="rpf-archive-copy">
              <div>
                <strong>{activeMap.title}</strong>
                {activeMap.meta && <small>{activeMap.meta}</small>}
              </div>
              <Link href="/mapas" className="rpf-archive-link">
                Explorar mapas <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </article>

      <article className="rpf-record-showcase rpf-record-showcase-large">
        {activeRecord && (
          <>
            <Image src={activeRecord.src} alt={activeRecord.alt} width={980} height={720} />
            <div className="rpf-record-overlay">
              <div className="rpf-record-topline">
                <span className="rpf-archive-label rpf-archive-label-light">
                  <Images size={17} aria-hidden="true" /> Registros
                </span>
                {records.length > 1 && (
                  <div
                    className="rpf-carousel-controls rpf-carousel-controls-dark"
                    aria-label="Navegar pelos registros fotográficos"
                  >
                    <button
                      type="button"
                      onClick={() => setRecordIndex((value) => boundedIndex(value, -1, records.length))}
                      aria-label="Registro anterior"
                    >
                      <ArrowLeft size={16} aria-hidden="true" />
                    </button>
                    <span>{recordIndex + 1}/{records.length}</span>
                    <button
                      type="button"
                      onClick={() => setRecordIndex((value) => boundedIndex(value, 1, records.length))}
                      aria-label="Próximo registro"
                    >
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
              <strong>{activeRecord.title}</strong>
              {activeRecord.meta && <small>{activeRecord.meta}</small>}
              <Link href="/registros" className="rpf-record-link">
                Ver registros <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </article>

      <article className="rpf-doc-showcase rpf-doc-showcase-wide">
        <div className="rpf-doc-copy">
          <span className="rpf-archive-label">
            <FileText size={17} aria-hidden="true" /> Documentos
          </span>
          <strong>Relatórios, materiais educativos, produção acadêmica e documentos institucionais.</strong>
          <Link href="/documentos" className="rpf-archive-link">
            Consultar documentos <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="rpf-doc-gallery rpf-doc-gallery-equal" aria-label="Documentos em destaque do Projeto Potengi">
          {documentPreviews.map((document) => (
            <figure key={document.src}>
              <Image
                src={document.src}
                alt={document.alt}
                width={420}
                height={595}
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
              <figcaption>{document.short}</figcaption>
            </figure>
          ))}
        </div>
      </article>
    </div>
  );
}
