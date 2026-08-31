"use client";

import Link from "next/link";
import { ArrowRight, FileText, Images, Map, Search, Target, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchSite, type SiteSearchCategory } from "@/src/data/site-search";
import styles from "./header-utilities.module.css";

const categoryIcon: Record<SiteSearchCategory, typeof Search> = {
  Página: Search,
  Resultado: Target,
  Mapa: Map,
  Registro: Images,
  Documento: FileText
};

export default function GlobalSearchDialog({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchSite(query), [query]);

  useEffect(() => {
    if (!open) return;

    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.documentElement.dataset.overlayOpen = "true";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      delete document.documentElement.dataset.overlayOpen;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <button
        className={styles.overlayBackdrop}
        type="button"
        onClick={onClose}
        aria-label="Fechar busca"
      />

      <section
        className={styles.searchDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-search-title"
      >
        <header className={styles.dialogHeader}>
          <div>
            <span>BUSCA GLOBAL</span>
            <h2 id="site-search-title">Buscar no Projeto Potengi</h2>
          </div>

          <button
            className={styles.iconButton}
            type="button"
            onClick={onClose}
            aria-label="Fechar busca"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <label className={styles.searchField}>
          <Search size={19} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: Cerro Corá, vulnerabilidade, saneamento, Meta 4..."
            autoComplete="off"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")}>
              Limpar
            </button>
          ) : null}
        </label>

        {!query.trim() ? (
          <div className={styles.searchIntro}>
            <p>
              Pesquise páginas, metas, mapas, registros e documentos do Projeto Potengi.
            </p>
            <div className={styles.searchSuggestions}>
              <span>Sugestões</span>
              {["vulnerabilidade", "Cerro Corá", "Meta 4", "saneamento"].map((term) => (
                <button key={term} type="button" onClick={() => setQuery(term)}>
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : results.length ? (
          <div className={styles.searchResults} aria-live="polite">
            <p className={styles.resultCount}>
              {results.length} {results.length === 1 ? "resultado" : "resultados"}
            </p>

            <ul>
              {results.map((item) => {
                const Icon = categoryIcon[item.category];

                return (
                  <li key={item.id}>
                    <Link href={item.href} onClick={onClose}>
                      <span className={styles.resultIcon}>
                        <Icon size={17} aria-hidden="true" />
                      </span>

                      <span className={styles.resultCopy}>
                        <small>{item.category}{item.meta ? ` · ${item.meta}` : ""}</small>
                        <strong>{item.title}</strong>
                        {item.description ? <em>{item.description}</em> : null}
                      </span>

                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className={styles.noResults} aria-live="polite">
            <strong>Nenhum conteúdo encontrado.</strong>
            <p>Tente outro termo ou uma expressão mais curta.</p>
          </div>
        )}

        <footer className={styles.searchFooter}>
          <span>Pressione Esc para fechar</span>
        </footer>
      </section>
    </div>
  );
}
