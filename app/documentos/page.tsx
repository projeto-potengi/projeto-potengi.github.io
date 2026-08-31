import type { Metadata } from "next";
import CatalogBrowser from "@/src/components/CatalogBrowser";
import { documentFilters, documents, type DocumentItem } from "@/src/data/documents";

export const metadata: Metadata = {
  title: "Documentos | Projeto Potengi",
  description: "Biblioteca técnica do Projeto Potengi."
};

export default function DocumentsPage() {
  return (
    <main className="page-main">
      <section className="page-hero compact-hero">
        <p className="eyebrow">Documentos</p>
        <h1>Biblioteca técnica e institucional do Projeto Potengi.</h1>
        <p className="lead">
          Dezenove documentos individualizados, com links de acesso, formato, categoria, meta relacionada e estado
          claro de acesso público.
        </p>
      </section>

      <CatalogBrowser<DocumentItem>
        title="Biblioteca técnica"
        description="Pesquise por título, autoria, resumo ou fonte e refine por meta, categoria, ano e formato."
        searchLabel="Buscar documentos"
        searchPlaceholder="Título, autoria, categoria, meta ou palavra-chave"
        filters={documentFilters}
        items={documents}
        emptyTitle="Nenhum documento encontrado."
        emptyMessage="Ajuste a busca ou remova algum filtro para consultar os documentos publicados."
      />
    </main>
  );
}
