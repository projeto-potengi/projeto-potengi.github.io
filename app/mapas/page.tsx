import type { Metadata } from "next";
import CatalogBrowser from "@/src/components/CatalogBrowser";
import { mapFilters, staticMaps, type StaticMapItem } from "@/src/data/maps";

export const metadata: Metadata = {
  title: "Mapas | Projeto Potengi",
  description: "Atlas cartográfico digital do Projeto Potengi."
};

export default function MapsPage() {
  return (
    <main className="page-main">
      <section className="page-hero compact-hero">
        <p className="eyebrow">Mapas</p>
        <h1>Atlas cartográfico digital do Projeto Potengi.</h1>
        <p className="lead">
          Explore os produtos cartográficos produzidos pelo Projeto Potengi e acesse, quando disponível, os dados
          correspondentes no WebGIS.
        </p>
      </section>

      <CatalogBrowser<StaticMapItem>
        title={`Acervo cartográfico — ${staticMaps.length} produtos`}
        description="Busque por título, tema, território ou palavra-chave e combine filtros por conjunto, meta, tema, território e disponibilidade no WebGIS."
        searchLabel="Buscar mapas"
        searchPlaceholder="Título, tema, território ou palavra-chave"
        filters={mapFilters}
        items={staticMaps}
        emptyTitle="Nenhum mapa encontrado."
        emptyMessage="Ajuste a busca ou remova algum filtro para consultar os mapas publicados."
        showSource={false}
      />
    </main>
  );
}
