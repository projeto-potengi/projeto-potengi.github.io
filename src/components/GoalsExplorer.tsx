"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, FileText, Images, Layers3, MapPinned, Sprout } from "lucide-react";
import { documents } from "@/src/data/documents";
import { staticMaps } from "@/src/data/maps";
import { goals } from "@/src/data/project";
import { records } from "@/src/data/records";

const detailIcons = {
  actions: CheckCircle2,
  results: Sprout,
  areas: MapPinned,
  products: Layers3
};

export default function GoalsExplorer() {
  const [activeId, setActiveId] = useState(goals[0].id);
  const activeGoal = goals.find((goal) => goal.id === activeId) ?? goals[0];
  const activeMeta = `Meta ${goals.findIndex((goal) => goal.id === activeGoal.id) + 1}`;
  const relatedDocuments = documents.filter((item) => item.metas?.includes(activeMeta)).slice(0, 4);
  const relatedMaps = staticMaps.filter((item) => item.metas?.includes(activeMeta)).slice(0, 4);
  const relatedRecords = records.filter((item) => item.metas?.includes(activeMeta)).slice(0, 4);

  return (
    <section className="goals-explorer" aria-label="Explorador das sete metas">
      <div className="goals-rail">
        {goals.map((goal, index) => (
          <button
            key={goal.id}
            id={`meta-${index + 1}`}
            className={goal.id === activeId ? "active" : ""}
            type="button"
            onClick={() => setActiveId(goal.id)}
          >
            <span>Meta {index + 1}</span>
            <strong>{goal.shortTitle}</strong>
          </button>
        ))}
      </div>
      <article className="goal-detail">
        <p className="eyebrow">Detalhamento da meta</p>
        <h2>{activeGoal.title}</h2>
        <p className="goal-objective">{activeGoal.objective}</p>
        <div className="goal-detail-grid">
          <DetailList title="Ações" items={activeGoal.actions} icon={detailIcons.actions} />
          <DetailList title="Resultados" items={activeGoal.results} icon={detailIcons.results} />
          <DetailList title="Áreas" items={activeGoal.areas} icon={detailIcons.areas} />
          <DetailList title="Produtos" items={activeGoal.products} icon={detailIcons.products} />
        </div>
        <div className="goal-evidence">
          <FileText size={18} />
          <span>{activeGoal.products.join(" · ")}</span>
        </div>
        <div className="goal-catalog-links" aria-label={`Evidências da ${activeMeta}`}>
          <CatalogLinkGroup title="Documentos" href="/documentos" icon={FileText} items={relatedDocuments.map((item) => item.title)} />
          <CatalogLinkGroup title="Mapas" href="/mapas" icon={MapPinned} items={relatedMaps.map((item) => item.title)} />
          <CatalogLinkGroup title="Registros" href="/registros" icon={Images} items={relatedRecords.map((item) => item.title)} />
        </div>
      </article>
    </section>
  );
}

function CatalogLinkGroup({
  title,
  href,
  items,
  icon: Icon
}: {
  title: string;
  href: string;
  items: string[];
  icon: typeof FileText;
}) {
  return (
    <Link href={href} className="goal-catalog-group">
      <span>
        <Icon size={16} aria-hidden="true" />
        {title}
      </span>
      {items.length ? (
        <small>{items.join(" · ")}</small>
      ) : (
        <small>Sem item relacionado no catálogo publicado.</small>
      )}
    </Link>
  );
}

function DetailList({
  title,
  items,
  icon: Icon
}: {
  title: string;
  items: string[];
  icon: typeof CheckCircle2;
}) {
  return (
    <div className="detail-list">
      <h3>
        <Icon size={18} />
        {title}
      </h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
