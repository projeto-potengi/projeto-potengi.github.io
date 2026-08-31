"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink, FileDown, Instagram, Maximize2, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CatalogFilter, CatalogItemBase } from "@/src/data/catalog-model";

type CatalogBrowserProps<TItem extends CatalogItemBase> = {
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  filters: CatalogFilter[];
  items: TItem[];
  emptyTitle: string;
  emptyMessage: string;
  showSource?: boolean;
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const valueMatches = (value: unknown, selected: string) => {
  if (Array.isArray(value)) {
    return value.some((entry) => normalize(entry) === normalize(selected));
  }

  return normalize(value) === normalize(selected);
};

const pageSize = 24;

const getItemString = (item: CatalogItemBase, key: string) => {
  const value = (item as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
};

const featuredTabLabel = (item: CatalogItemBase) => {
  return getItemString(item, "featuredLabel") ?? item.title;
};



export default function CatalogBrowser<TItem extends CatalogItemBase>({
  title,
  description,
  searchLabel,
  searchPlaceholder,
  filters,
  items,
  emptyTitle,
  emptyMessage,
  showSource = true
}: CatalogBrowserProps<TItem>) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [expandedItem, setExpandedItem] = useState<TItem | null>(null);
  const [activeFeaturedId, setActiveFeaturedId] = useState<string | undefined>();
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [featuredZoom, setFeaturedZoom] = useState(1);
  const [featuredOffset, setFeaturedOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ pointerId: number; x: number; y: number } | null>(null);
  const featuredRailRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalize(query);

    return items.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        normalize(
          [item.title, item.description, item.meta, item.year, item.source, item.credit, item.searchText].join(" ")
        ).includes(normalizedQuery);

      const matchesFilters = filters.every((filter) => {
        const selected = activeFilters[filter.key];
        if (!selected) {
          return true;
        }

        return valueMatches((item as Record<string, unknown>)[filter.key], selected);
      });

      return matchesQuery && matchesFilters;
    });
  }, [activeFilters, filters, items, query]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const featuredItems = items
    .filter((item) => (item as Record<string, unknown>).featured)
    .sort(
      (first, second) =>
        Number((first as Record<string, unknown>).featuredOrder ?? 0) -
        Number((second as Record<string, unknown>).featuredOrder ?? 0)
    );
  const activeFeaturedItem = featuredItems.find((item) => item.id === activeFeaturedId) ?? featuredItems[0];
  const hasMore = visibleCount < filteredItems.length;

  const resetFeaturedView = () => {
    setFeaturedZoom(1);
    setFeaturedOffset({ x: 0, y: 0 });
    setDragStart(null);
  };

  const selectFeatured = (item: TItem) => {
    setActiveFeaturedId(item.id);
    resetFeaturedView();
  };

  const zoomFeaturedIn = () => {
    setFeaturedZoom((current) => Math.min(Number((current + 0.2).toFixed(1)), 3));
  };

  const zoomFeaturedOut = () => {
    setFeaturedZoom((current) => {
      const next = Math.max(Number((current - 0.2).toFixed(1)), 1);
      if (next === 1) {
        setFeaturedOffset({ x: 0, y: 0 });
        setDragStart(null);
      }
      return next;
    });
  };

  const scrollFeaturedRail = (direction: -1 | 1) => {
    featuredRailRef.current?.scrollBy({
      left: direction * Math.min(420, featuredRailRef.current.clientWidth * 0.72),
      behavior: "smooth"
    });
  };

  const updateFilter = (key: string, value: string) => {
    setVisibleCount(pageSize);
    setActiveFilters((current) => {
      const next = { ...current };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  return (
    <section className={`catalog-shell${featuredItems.length ? " catalog-shell-maps" : ""}`} aria-labelledby="catalog-title">
      {featuredItems.length ? (
        <section className="featured-atlas" aria-label="Mapas em destaque">
          <div className="featured-atlas-heading">
            <div>
              <p className="eyebrow">Mapas em destaque</p>
              <h2>Mapas em destaque</h2>
              <p>Uma leitura territorial dos principais resultados cartográficos produzidos pelo Projeto Potengi.</p>
            </div>

            <div className="featured-rail-controls" aria-label="Navegar pelos mapas em destaque">
              <button type="button" onClick={() => scrollFeaturedRail(-1)} aria-label="Destaques anteriores">
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <span>
                {String(Math.max(1, featuredItems.findIndex((item) => item.id === activeFeaturedItem?.id) + 1)).padStart(2, "0")}
                {" / "}
                {String(featuredItems.length).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => scrollFeaturedRail(1)} aria-label="Próximos destaques">
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="featured-filmstrip" ref={featuredRailRef} role="tablist" aria-label="Selecionar mapa em destaque">
            {featuredItems.map((item) => (
              <button
                aria-selected={activeFeaturedItem?.id === item.id}
                className={activeFeaturedItem?.id === item.id ? "active" : undefined}
                key={`featured-tab-${item.id}`}
                onClick={() => selectFeatured(item)}
                role="tab"
                type="button"
              >
                {item.localAsset ? (
                  <span className="featured-filmstrip-thumb">
                    <Image
                      src={item.localAsset}
                      alt=""
                      width={320}
                      height={190}
                    />
                  </span>
                ) : null}
                <span>{featuredTabLabel(item)}</span>
              </button>
            ))}
          </div>

          {activeFeaturedItem ? (
            <div className="featured-showcase">
              <div className="featured-map-stage">
                <div
                  className={`featured-map-viewport${featuredZoom > 1 ? " is-zoomed" : ""}${dragStart ? " is-dragging" : ""}`}
                  onPointerDown={(event) => {
                    if (featuredZoom <= 1) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragStart({ pointerId: event.pointerId, x: event.clientX, y: event.clientY });
                  }}
                  onPointerMove={(event) => {
                    if (!dragStart || dragStart.pointerId !== event.pointerId) return;
                    setFeaturedOffset((current) => ({
                      x: current.x + event.clientX - dragStart.x,
                      y: current.y + event.clientY - dragStart.y
                    }));
                    setDragStart({ pointerId: event.pointerId, x: event.clientX, y: event.clientY });
                  }}
                  onPointerUp={(event) => {
                    if (dragStart?.pointerId === event.pointerId) setDragStart(null);
                  }}
                  onPointerCancel={() => setDragStart(null)}
                >
                  {activeFeaturedItem.localAsset ? (
                    <div
                      className="featured-map-image-layer"
                      role="img"
                      aria-label={activeFeaturedItem.altText ?? activeFeaturedItem.title}
                      style={{
                        backgroundImage: `url("${activeFeaturedItem.localAsset}")`,
                        transform: `translate(${featuredOffset.x}px, ${featuredOffset.y}px) scale(${featuredZoom})`
                      }}
                    />
                  ) : null}
                </div>

                <div
                  className="featured-map-toolbar"
                  aria-label="Controles da prancha em destaque"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={zoomFeaturedOut}
                    disabled={featuredZoom <= 1}
                    aria-label="Afastar mapa"
                    title="Afastar"
                  >
                    <ZoomOut size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={zoomFeaturedIn}
                    disabled={featuredZoom >= 3}
                    aria-label="Aproximar mapa"
                    title="Aproximar"
                  >
                    <ZoomIn size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="featured-fit-button"
                    type="button"
                    onClick={resetFeaturedView}
                    title="Mostrar o mapa completo"
                  >
                    Ajustar
                  </button>
                  <button
                    className="featured-fullscreen-button"
                    type="button"
                    onClick={() => setExpandedItem(activeFeaturedItem)}
                    title="Abrir mapa em tela ampliada"
                  >
                    <Maximize2 size={15} aria-hidden="true" />
                    <span>Tela cheia</span>
                  </button>
                </div>
              </div>

              <div className="featured-editorial">
                <div className="featured-editorial-main">
                  <span className="archive-type">
                    {activeFeaturedItem.meta}
                    {getItemString(activeFeaturedItem, "theme") ? ` · ${getItemString(activeFeaturedItem, "theme")}` : ""}
                  </span>
                  <h3>{activeFeaturedItem.title}</h3>
                  {getItemString(activeFeaturedItem, "featuredDescription") ? (
                    <p>{getItemString(activeFeaturedItem, "featuredDescription")}</p>
                  ) : null}

                  {(activeFeaturedItem as Record<string, unknown>).featuredMethod ? (
                    <details className="featured-method-disclosure">
                      <summary>
                        {((activeFeaturedItem as Record<string, unknown>).featuredMethod as { title: string }).title}
                      </summary>
                      <div className="featured-method">
                        <p>{((activeFeaturedItem as Record<string, unknown>).featuredMethod as { text: string }).text}</p>
                        <ol>
                          {((activeFeaturedItem as Record<string, unknown>).featuredMethod as { flow: string[] }).flow.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                        <ul>
                          {((activeFeaturedItem as Record<string, unknown>).featuredMethod as { factors: string[] }).factors.map((factor) => (
                            <li key={factor}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ) : null}
                </div>

                <aside className="featured-editorial-meta">
                  <dl>
                    {activeFeaturedItem.details?.map((detail) => (
                      <div key={`featured-detail-${activeFeaturedItem.id}-${detail.label}`}>
                        <dt>{detail.label}</dt>
                        <dd>{detail.value}</dd>
                      </div>
                    ))}
                    <div>
                      <dt>Fonte</dt>
                      <dd>{activeFeaturedItem.source}</dd>
                    </div>
                  </dl>

                  <div className="card-actions featured-actions">
                    {activeFeaturedItem.secondaryActions?.map((action) => (
                      <a
                        href={action.href}
                        key={`featured-info-${activeFeaturedItem.id}-${action.label}`}
                        target={action.external ? "_blank" : undefined}
                        rel={action.external ? "noreferrer" : undefined}
                      >
                        {action.external ? <ExternalLink size={15} aria-hidden="true" /> : <FileDown size={15} aria-hidden="true" />}
                        {action.href === "/webgis" ? "Explorar no WebGIS" : action.label}
                      </a>
                    ))}
                    {activeFeaturedItem.primaryAction ? (
                      <a
                        href={activeFeaturedItem.primaryAction.href}
                        target={activeFeaturedItem.primaryAction.external ? "_blank" : undefined}
                        rel={activeFeaturedItem.primaryAction.external ? "noreferrer" : undefined}
                      >
                        <ExternalLink size={15} aria-hidden="true" />
                        Abrir mapa
                      </a>
                    ) : null}
                  </div>
                </aside>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="catalog-intro">
        <p className="eyebrow">Catálogo público</p>
        <h2 id="catalog-title">{featuredItems.length ? "Acervo cartográfico" : title}</h2>
        <p>{description}</p>
      </div>

      <form className="catalog-filters" role="search" aria-label={`Filtros de ${title}`}>
        <label className="search-field catalog-filter-search">
          <span>{searchLabel}</span>
          <span className="search-control">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setVisibleCount(pageSize);
                setQuery(event.target.value);
              }}
              placeholder={searchPlaceholder}
            />
          </span>
        </label>

        {filters.map((filter) =>
          filter.key === "webgisAvailable" ? (
            <label
              className="webgis-only-filter"
              key={filter.key}
              title="Mostrar apenas mapas que podem ser explorados no WebGIS"
            >
              <input
                checked={activeFilters[filter.key] === "Sim"}
                onChange={(event) => updateFilter(filter.key, event.target.checked ? "Sim" : "")}
                type="checkbox"
              />
              <span>WebGIS</span>
            </label>
          ) : (
            <label className="catalog-filter-select" key={filter.key}>
              <span>{filter.label}</span>
              <select
                value={activeFilters[filter.key] ?? ""}
                onChange={(event) => updateFilter(filter.key, event.target.value)}
              >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )
        )}
      </form>

      <p className="catalog-count">
        Exibindo {Math.min(visibleCount, filteredItems.length)} de {filteredItems.length} mapas
      </p>

      <div className="catalog-results" aria-live="polite">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <article className="catalog-card" key={item.id}>
              {item.localAsset ? (
                <button className="catalog-media-button" type="button" onClick={() => setExpandedItem(item)}>
                  <Image src={item.localAsset} alt={item.altText ?? item.title} width={900} height={560} />
                  <span>
                    <Maximize2 size={16} aria-hidden="true" />
                    Ampliar
                  </span>
                </button>
              ) : (
                <div className="catalog-media-empty" aria-label="Miniatura indisponível" />
              )}
              <span className="archive-type">
                {item.meta}
                {(item as Record<string, unknown>).theme ? ` · ${String((item as Record<string, unknown>).theme)}` : ""}
              </span>
              <h3>{item.title}</h3>
              {item.details?.length ? (
                <dl className="catalog-details">
                  {item.details.map((detail) => (
                    <div key={`${item.id}-${detail.label}`}>
                      <dt>{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {showSource ? <small>Fonte: {item.source}</small> : null}
              {item.credit ? <small>Crédito: {item.credit}</small> : null}
              {item.statusNote ? <span className="review-note">{item.statusNote}</span> : null}
              <div className="card-actions">
                {item.primaryAction ? (
                  <a
                    href={item.primaryAction.href}
                    target={item.primaryAction.external ? "_blank" : undefined}
                    rel={item.primaryAction.external ? "noreferrer" : undefined}
                  >
                    {item.primaryAction.external ? (
                      <ExternalLink size={15} aria-hidden="true" />
                    ) : (
                      <FileDown size={15} aria-hidden="true" />
                    )}
                    {showSource ? item.primaryAction.label : "Abrir mapa"}
                  </a>
                ) : null}
                {item.secondaryActions?.map((action) => (
                  <a
                    href={action.href}
                    key={`${item.id}-${action.label}`}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noreferrer" : undefined}
                  >
                    {action.external ? <ExternalLink size={15} aria-hidden="true" /> : <FileDown size={15} aria-hidden="true" />}
                    {action.label}
                  </a>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state" role="status">
            <strong>{emptyTitle}</strong>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>

      {hasMore ? (
        <div className="catalog-more">
          <button type="button" onClick={() => setVisibleCount((current) => current + pageSize)}>
            Carregar mais
          </button>
        </div>
      ) : null}


      {featuredItems.length ? (
        <div className="maps-institutional-close">
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
                <span>Portal público de resultados da Bacia Hidrográfica do Rio Potengi.</span>
              </div>
            </div>

            <p className="rpf-footer-credits">
              Créditos: Projeto Potengi/UFRN/FUNPEC; registros, documentos e bases geoespaciais do projeto.
            </p>

            <div className="rpf-footer-meta">
              <a
                className="rpf-footer-instagram"
                href="https://www.instagram.com/projetopotengiufrn/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram do Projeto Potengi"
              >
                <Instagram size={21} aria-hidden="true" />
                <span>@projetopotengiufrn</span>
              </a>
              <small>Portal Projeto Potengi · 2026</small>
            </div>
          </footer>
        </div>
      ) : null}

      {expandedItem ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={expandedItem.title}>
          <button className="lightbox-backdrop" type="button" aria-label="Fechar visualização" onClick={() => setExpandedItem(null)} />
          <figure className="lightbox-panel">
            <button className="lightbox-close" type="button" onClick={() => setExpandedItem(null)}>
              <X size={20} aria-hidden="true" />
              <span className="sr-only">Fechar</span>
            </button>
            {expandedItem.localAsset ? (
              <Image src={expandedItem.localAsset} alt={expandedItem.altText ?? expandedItem.title} width={1600} height={1000} />
            ) : null}
            <figcaption>
              <strong>{expandedItem.title}</strong>
              {expandedItem.description ? <span>{expandedItem.description}</span> : null}
              {expandedItem.statusNote ? <em>{expandedItem.statusNote}</em> : null}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </section>
  );
}
