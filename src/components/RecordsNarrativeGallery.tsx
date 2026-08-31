"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import RecordLightbox from "@/src/components/RecordLightbox";
import type { RecordItem } from "@/src/data/records";

type TileSize = "feature" | "side" | "third" | "half";

const tileSizes: Record<string, TileSize> = {
  "rio-potengi-sao-tome-2022": "feature",
  "equipe-nascente-potengi-2022": "side",
  "oficina-educacao-ambiental-cerro-cora-2023": "side",

  "area-recuperacao-eaj-visao-aerea": "third",
  "cercamento-app-eloy-cerro-cora": "third",
  "implantacao-renques-2024": "third",

  "oficina-plantio-eaj": "feature",
  "palma-implantada-2024": "side",
  "barramento-pedras-eaj": "side",

  "parcelas-plantio-visao-aerea": "third",
  "fazenda-mundo-novo-visao-aerea": "third",
  "olheiro-capela-11": "third",

  "monitoramento-em-campo": "third",
  "regeneracao-vegetacao-2024": "third",
  "cercamento-monitorado-2025": "third",

  "equipe-atividade-plantio-eaj": "half",
  "foz-potengi-ponte-newton-navarro": "half"
};

export default function RecordsNarrativeGallery({ items }: { items: RecordItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const selectedIndex = items.findIndex((item) => item.id === selectedId);
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;

  const close = () => {
    setSelectedId(null);
    requestAnimationFrame(() => opener.current?.focus());
  };

  const move = (direction: number) => {
    if (!items.length || selectedIndex < 0) return;
    const nextIndex = (selectedIndex + direction + items.length) % items.length;
    setSelectedId(items[nextIndex].id);
  };

  return (
    <section className="records-gallery" aria-labelledby="records-gallery-title">
      <header className="records-gallery-heading">
        <div>
          <p className="records-eyebrow">MEMÓRIA VISUAL</p>
          <h2 id="records-gallery-title">Memória visual das ações</h2>
        </div>
        <p>
          Registros selecionados das atividades realizadas nas áreas de estudo e de recuperação do Projeto Potengi.
        </p>
      </header>

      <div className="records-mosaic">
        {items.map((item) => {
          const size = tileSizes[item.id] ?? "third";

          return (
            <button
              key={item.id}
              className={`record-tile record-tile--${size}`}
              type="button"
              aria-label={`Ampliar registro: ${item.title}`}
              onClick={(event) => {
                opener.current = event.currentTarget;
                setSelectedId(item.id);
              }}
            >
              <span className="record-tile-image">
                <Image
                  src={item.localAsset}
                  alt={item.altText}
                  fill
                  sizes={
                    size === "feature"
                      ? "(max-width: 640px) 100vw, (max-width: 960px) 100vw, 58vw"
                      : size === "half"
                        ? "(max-width: 640px) 100vw, 50vw"
                        : "(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                  }
                />
              </span>
              <span className="record-tile-caption">
                <strong>{item.title}</strong>
                <small>{item.municipality ? `${item.municipality} · ${item.category}` : item.category}</small>
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <RecordLightbox
          item={selected}
          index={selectedIndex}
          total={items.length}
          onClose={close}
          onPrevious={() => move(-1)}
          onNext={() => move(1)}
        />
      ) : null}
    </section>
  );
}
