"use client";

import { ExternalLink, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { documentCatalog, type DocumentCatalogItem } from "@/src/data/documents";
import styles from "./DocumentsLibrary.module.css";

const normalize = (value: string) =>
  value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const categoryOptions = [...new Set(documentCatalog.items.map((item) => item.category))].sort((a, b) =>
  a.localeCompare(b, "pt-BR")
);
const metaOptions = [...new Set(documentCatalog.items.flatMap((item) => item.meta))].sort((a, b) => a - b);
const yearOptions = [...new Set(documentCatalog.items.map((item) => item.year))].sort((a, b) => b - a);

function DocumentCard({ item }: { item: DocumentCatalogItem }) {
  const hasAccess = Boolean(item.accessUrl?.trim());
  const isExternal = Boolean(item.accessUrl?.startsWith("http"));

  return (
    <article className={styles.card}>
      <div className={styles.cardTopline}>
        <span className={styles.type}>{item.category}</span>
        <span className={styles.year}>{item.year}</span>
      </div>

      <h3>{item.title}</h3>

      <dl className={styles.metadata}>
        {item.authors.length ? (
          <div>
            <dt>{item.authors.length === 1 ? "Autoria" : "Autores"}</dt>
            <dd>{item.authors.join("; ")}</dd>
          </div>
        ) : null}
        {item.vehicle ? (
          <div>
            <dt>Veículo</dt>
            <dd>{item.vehicle}</dd>
          </div>
        ) : null}
      </dl>

      <div className={styles.cardFooter}>
        <div className={styles.metas} aria-label={item.meta.length ? "Metas relacionadas" : "Sem meta relacionada"}>
          {item.meta.map((meta) => (
            <span key={`${item.id}-meta-${meta}`}>Meta {meta}</span>
          ))}
        </div>

        <div className={styles.actions}>
          {hasAccess ? (
            <a
              className={styles.primaryAction}
              href={item.accessUrl!}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
            >
              {item.accessType === "local_file" ? (
                <FileText size={16} aria-hidden="true" />
              ) : (
                <ExternalLink size={16} aria-hidden="true" />
              )}
              {item.accessLabel}
            </a>
          ) : null}
          {item.secondaryUrl ? (
            <a className={styles.secondaryAction} href={item.secondaryUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={13} aria-hidden="true" />
              Fonte complementar
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function FieldReportCard({ item }: { item: DocumentCatalogItem }) {
  const hasAccess = Boolean(item.accessUrl?.trim());
  const isExternal = Boolean(item.accessUrl?.startsWith("http"));

  return (
    <article className={styles.fieldReportCard}>
      <div>
        <span>{item.year}</span>
        <h3>{item.title}</h3>
      </div>
      {hasAccess ? (
        <a
          href={item.accessUrl!}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          <ExternalLink size={14} aria-hidden="true" />
          {item.accessLabel}
        </a>
      ) : null}
    </article>
  );
}

export default function DocumentsLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [meta, setMeta] = useState("");
  const [year, setYear] = useState("");
  const [fieldReportsOpen, setFieldReportsOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return documentCatalog.items.filter((item) => {
      const searchableText = normalize([item.title, ...item.authors].join(" "));
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesCategory = !category || item.category === category;
      const matchesMeta = !meta || item.meta.includes(Number(meta));
      const matchesYear = !year || item.year === Number(year);

      return matchesQuery && matchesCategory && matchesMeta && matchesYear;
    });
  }, [category, meta, query, year]);

  const itemsByGroup = useMemo(() => {
    const grouped = new Map<string, DocumentCatalogItem[]>();
    filteredItems.forEach((item) => grouped.set(item.group, [...(grouped.get(item.group) ?? []), item]));
    return grouped;
  }, [filteredItems]);

  const hasActiveFilters = Boolean(query || category || meta || year);
  const updateAndRevealFieldReports = (update: () => void) => {
    update();
    setFieldReportsOpen(true);
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setMeta("");
    setYear("");
  };

  return (
    <section className={styles.library} aria-label="Catálogo público de documentos">
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>Catálogo público</p>
          <p>Produção acadêmica, relatórios, materiais e documentos públicos do Projeto Potengi.</p>
        </div>
        <strong>{documentCatalog.stats.totalItems} documentos</strong>
      </div>

      <form className={styles.filters} role="search" onSubmit={(event) => event.preventDefault()}>
        <label className={styles.searchField}>
          <span>Buscar por título ou autor</span>
          <span className={styles.searchControl}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => updateAndRevealFieldReports(() => setQuery(event.target.value))}
              placeholder="Título ou autor"
            />
          </span>
        </label>

        <label>
          <span>Tipo</span>
          <select value={category} onChange={(event) => updateAndRevealFieldReports(() => setCategory(event.target.value))}>
            <option value="">Todos</option>
            {categoryOptions.map((option) => (
              <option value={option} key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Meta</span>
          <select value={meta} onChange={(event) => updateAndRevealFieldReports(() => setMeta(event.target.value))}>
            <option value="">Todas</option>
            {metaOptions.map((option) => (
              <option value={option} key={option}>Meta {option}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Ano</span>
          <select value={year} onChange={(event) => updateAndRevealFieldReports(() => setYear(event.target.value))}>
            <option value="">Todos</option>
            {yearOptions.map((option) => (
              <option value={option} key={option}>{option}</option>
            ))}
          </select>
        </label>
      </form>

      <div className={styles.resultSummary} aria-live="polite">
        <p>{filteredItems.length} {filteredItems.length === 1 ? "resultado" : "resultados"}</p>
        {hasActiveFilters ? <button type="button" onClick={resetFilters}>Limpar filtros</button> : null}
      </div>

      {filteredItems.length ? (
        <div className={styles.groups}>
          {documentCatalog.groups.map((group) => {
            const groupItems = itemsByGroup.get(group.id) ?? [];
            if (!groupItems.length) return null;

            if (group.secondaryCollection) {
              return (
                <details
                  className={styles.fieldReports}
                  key={group.id}
                  open={fieldReportsOpen}
                  onToggle={(event) => setFieldReportsOpen(event.currentTarget.open)}
                >
                  <summary>
                    <span>
                      <strong>{group.label}</strong>
                      <small>Coleção secundária · {groupItems.length} documentos</small>
                    </span>
                    <span>{fieldReportsOpen ? "Ocultar coleção" : "Ver coleção"}</span>
                  </summary>
                  <div className={styles.fieldReportGrid}>
                    {groupItems.map((item) => <FieldReportCard item={item} key={item.id} />)}
                  </div>
                </details>
              );
            }

            return (
              <section className={styles.group} key={group.id}>
                <header>
                  <h2>{group.label}</h2>
                  <span>{groupItems.length} {groupItems.length === 1 ? "documento" : "documentos"}</span>
                </header>
                <div className={styles.grid}>
                  {groupItems.map((item) => <DocumentCard item={item} key={item.id} />)}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState} role="status">
          <strong>Nenhum documento encontrado.</strong>
          <p>Ajuste a busca ou remova algum filtro para consultar o catálogo.</p>
        </div>
      )}
    </section>
  );
}
