import type { Metadata } from "next";
import Image from "next/image";
import { Instagram } from "lucide-react";
import RecordsNarrativeGallery from "@/src/components/RecordsNarrativeGallery";
import { heroRecord, records } from "@/src/data/records";

export const metadata: Metadata = {
  title: "Registros | Projeto Potengi",
  description: "Memória visual do Projeto Potengi em campo."
};

const journey = [
  { number: "01", label: "Reconhecer" },
  { number: "02", label: "Validar" },
  { number: "03", label: "Mobilizar" },
  { number: "04", label: "Recuperar" },
  { number: "05", label: "Monitorar" }
];

export default function RecordsPage() {
  if (!heroRecord) {
    throw new Error("Imagem principal de Registros não encontrada.");
  }

  return (
    <main className="records-page">
      <section className="records-hero" aria-labelledby="records-title">
        <figure className="records-hero-photo">
          <Image
            src={heroRecord.localAsset}
            alt={heroRecord.altText}
            fill
            sizes="(max-width: 820px) 100vw, 1220px"
            priority
          />
          <span className="records-hero-scrim" aria-hidden="true" />

          <div className="records-hero-copy">
            <p className="records-eyebrow">REGISTROS</p>
            <h1 id="records-title">
              O Projeto Potengi
              <span>em campo</span>
            </h1>
            <p>
              Uma memória visual das ações realizadas no território, do reconhecimento das áreas ao monitoramento da
              recuperação.
            </p>
          </div>

          <figcaption>
            <strong>Fazenda Mundo Novo</strong>
            <span>São Tomé</span>
          </figcaption>
        </figure>
      </section>

      <section className="records-process" aria-label="Do território à recuperação">
        <div className="records-process-copy">
          <p className="records-eyebrow">DO TERRITÓRIO À RECUPERAÇÃO</p>
          <p>
            Os registros acompanham diferentes momentos das atividades realizadas pelo Projeto Potengi nas áreas de
            estudo e de intervenção.
          </p>
        </div>

        <div className="records-journey">
          <svg
            className="records-journey-line"
            viewBox="0 0 1000 92"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="recordsJourneyGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0a8199" />
                <stop offset="58%" stopColor="#318562" />
                <stop offset="100%" stopColor="#d0a722" />
              </linearGradient>
            </defs>
            <path
              d="M 28 58 C 128 22, 215 72, 308 48 S 494 20, 590 48 S 768 79, 870 43 S 950 34, 974 28"
              fill="none"
              stroke="url(#recordsJourneyGradient)"
              strokeWidth="2.25"
              strokeLinecap="round"
            />
            <circle cx="28" cy="58" r="5.2" fill="#f8f8f4" stroke="#0a8199" strokeWidth="2" />
            <circle cx="260" cy="57" r="5.2" fill="#f8f8f4" stroke="#16818a" strokeWidth="2" />
            <circle cx="500" cy="31" r="5.2" fill="#f8f8f4" stroke="#2d856a" strokeWidth="2" />
            <circle cx="738" cy="68" r="5.2" fill="#f8f8f4" stroke="#5f9252" strokeWidth="2" />
            <circle cx="974" cy="28" r="5.2" fill="#f8f8f4" stroke="#c6a329" strokeWidth="2" />
          </svg>

          <ol className="records-journey-labels" aria-label="Sequência editorial do trabalho">
            {journey.map((item) => (
              <li key={item.number}>
                <b>{item.number}</b>
                <strong>{item.label}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <RecordsNarrativeGallery items={records} />

      <section className="records-closing" aria-label="Encerramento da memória visual">
        <span>MEMÓRIA DO PROJETO</span>
        <p>Uma memória visual das ações realizadas na Bacia do Rio Potengi.</p>
      </section>

      <footer className="rpf-footer records-footer">
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
            <span>Portal público de resultados do Projeto Potengi.</span>
          </div>
        </div>

        <p className="rpf-footer-credits">
          Créditos: Projeto Potengi/UFRN/Funpec; registros, documentos e bases geoespaciais do projeto.
        </p>

        <div className="rpf-footer-meta">
          <a
            className="rpf-footer-instagram"
            href="https://www.instagram.com/projetopotengiufrn/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram do Projeto Potengi"
          >
            <Instagram size={21} strokeWidth={2} aria-hidden="true" />
            <span>@projetopotengiufrn</span>
          </a>
          <small>Portal Projeto Potengi · 2026</small>
        </div>
      </footer>
    </main>
  );
}
