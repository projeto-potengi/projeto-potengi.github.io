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
  documentSummary: Array<{ label: string; value: number }>;
  academicSummary: Array<{ label: string; value: number }>;
  otherDocumentSummary: Array<{ label: string; value: number }>;
  featuredBook?: { title: string; meta: string };
};

function boundedIndex(current: number, delta: number, total: number) {
  if (total <= 1) return 0;
  return (current + delta + total) % total;
}

export default function HomeArchiveShowcase({ maps, records, documentSummary, academicSummary, otherDocumentSummary, featuredBook }: Props) {
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
              <Image src={activeMap.src} alt={activeMap.alt} fill sizes="(max-width: 720px) 94vw, 1180px" />
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
        <div className="rpf-archive-toolbar">
          <span className="rpf-archive-label">
            <Images size={17} aria-hidden="true" /> Registros
          </span>
          {records.length > 1 && (
            <div className="rpf-carousel-controls" aria-label="Navegar pelos registros fotográficos">
              <button type="button" onClick={() => setRecordIndex((value) => boundedIndex(value, -1, records.length))} aria-label="Registro anterior">
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <span>{recordIndex + 1}/{records.length}</span>
              <button type="button" onClick={() => setRecordIndex((value) => boundedIndex(value, 1, records.length))} aria-label="Próximo registro">
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        {activeRecord && (
          <>
            <div className="rpf-record-strip-layout">
              <div className="rpf-record-strip-main">
                <Image src={activeRecord.src} alt={activeRecord.alt} fill sizes="(max-width: 720px) 94vw, 760px" />
                <div className="rpf-record-overlay">
                  <strong>{activeRecord.title}</strong>
                  {activeRecord.meta && <small>{activeRecord.meta}</small>}
                </div>
              </div>
              <nav className="rpf-record-thumbs" aria-label="Outros registros fotográficos em destaque">
                {records.filter((_, index) => index !== recordIndex).map((record) => {
                  const index = records.findIndex((item) => item.id === record.id);
                  return (
                    <button key={record.id} type="button" onClick={() => setRecordIndex(index)} aria-label={`Ver ${record.title}`}>
                      <Image src={record.src} alt="" fill sizes="(max-width: 720px) 22vw, 180px" />
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="rpf-record-strip-footer">
              <p>Uma leitura fotográfica das ações realizadas no território.</p>
              <Link href="/registros" className="rpf-record-link">Ver registros <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </>
        )}
      </article>

      <article className="rpf-doc-showcase rpf-doc-showcase-wide">
        <div className="rpf-doc-content">
          <div className="rpf-doc-copy">
            <span className="rpf-archive-label">
              <FileText size={17} aria-hidden="true" /> Documentos
            </span>
            <strong>Produção técnica, acadêmica e institucional do Projeto Potengi.</strong>
          </div>
          <dl className="rpf-doc-summary" aria-label="Síntese do catálogo de documentos">
            {documentSummary.map((item) => (
              <div key={item.label}>
                <dt>{item.value}</dt>
                <dd>{item.label}</dd>
              </div>
            ))}
          </dl>
          <div className="rpf-doc-academic">
            <span>Produção acadêmica</span>
            <ul>
              {academicSummary.map((item) => <li key={item.label}><strong>{item.value}</strong> {item.label}</li>)}
            </ul>
          </div>
          <dl className="rpf-doc-other" aria-label="Outros grupos do catálogo de documentos">
            {otherDocumentSummary.map((item) => <div key={item.label}><dt>{item.value}</dt><dd>{item.label}</dd></div>)}
          </dl>
          <Link href="/documentos" className="rpf-archive-link rpf-doc-link">
            Consultar documentos <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {featuredBook && (
          <aside className="rpf-doc-book">
            <span>{featuredBook.meta}</span>
            <div className="rpf-doc-book-cover">
              <Image
                src="/media/home/documents/diagnostico-socioeconomico-ambiental-bhrp-capa.png"
                alt={`Capa do livro ${featuredBook.title}`}
                width={641}
                height={943}
              />
            </div>
            <div>
              <strong>{featuredBook.title}</strong>
            </div>
          </aside>
        )}
      </article>
    </div>
  );
}
