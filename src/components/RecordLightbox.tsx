"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { RecordItem } from "@/src/data/records";

type RecordLightboxProps = {
  item: RecordItem;
  index: number;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

const metaAnchor = (meta: string) => `meta-${meta.replace(/\D+/g, "")}`;

export default function RecordLightbox({
  item,
  index,
  total,
  onClose,
  onPrevious,
  onNext
}: RecordLightboxProps) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  return (
    <div
      className="record-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-lightbox-title"
    >
      <button
        className="record-lightbox-backdrop"
        type="button"
        aria-label="Fechar visualização"
        onClick={onClose}
      />

      <div className="record-lightbox-shell">
        <div className="record-lightbox-photo">
          <img
            className="record-lightbox-image"
            src={item.localAsset}
            alt={item.altText}
          />

          <button
            className="record-lightbox-nav record-lightbox-previous"
            type="button"
            onClick={onPrevious}
            aria-label="Registro anterior"
          >
            <ChevronLeft size={23} aria-hidden="true" />
          </button>

          <button
            className="record-lightbox-nav record-lightbox-next"
            type="button"
            onClick={onNext}
            aria-label="Próximo registro"
          >
            <ChevronRight size={23} aria-hidden="true" />
          </button>
        </div>

        <aside className="record-lightbox-context">
          <button
            ref={closeButton}
            className="record-lightbox-close"
            type="button"
            onClick={onClose}
            aria-label="Fechar visualização"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <span className="record-lightbox-count">
            {index + 1} / {total}
          </span>

          <h2 id="record-lightbox-title">{item.title}</h2>

          <dl>
            <div>
              <dt>Atividade</dt>
              <dd>{item.activity}</dd>
            </div>

            {item.municipality ? (
              <div>
                <dt>Município</dt>
                <dd>{item.municipality}</dd>
              </div>
            ) : null}

            {item.date ? (
              <div>
                <dt>Data</dt>
                <dd>{item.date}</dd>
              </div>
            ) : null}

            {item.metas.length ? (
              <div>
                <dt>Metas</dt>
                <dd>{item.metas.join(item.metas.length > 1 ? " e " : "")}</dd>
              </div>
            ) : null}

            {item.credit ? (
              <div>
                <dt>Crédito</dt>
                <dd>{item.credit}</dd>
              </div>
            ) : null}
          </dl>

          {item.metas.length ? (
            <nav className="record-lightbox-links" aria-label="Metas relacionadas">
              {item.metas.map((meta) => (
                <a href={`/resultados#${metaAnchor(meta)}`} key={meta}>
                  Ver {meta} →
                </a>
              ))}
            </nav>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
