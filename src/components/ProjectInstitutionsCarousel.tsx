"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useRef } from "react";
import styles from "@/app/projeto/projeto-multiescala.module.css";

const institutions = [
  {
    name: "Universidade Federal do Rio Grande do Norte",
    short: "UFRN",
    logo: "/media/home/brands/ufrn.png",
    url: "https://www.ufrn.br/"
  },
  {
    name: "Fundação Norte-Rio-Grandense de Pesquisa e Cultura",
    short: "Funpec",
    logo: "/media/home/brands/funpec.png",
    url: "https://funpec.br/"
  },
  {
    name: "Ministério da Integração e do Desenvolvimento Regional",
    short: "MIDR",
    logo: "/media/home/brands/midr.png",
    url: "https://www.gov.br/mdr/pt-br"
  },
  {
    name: "Secretaria de Estado do Meio Ambiente e dos Recursos Hídricos",
    short: "SEMARH-RN",
    logo: "/media/home/brands/semarh-rn.png",
    url: "http://www.semarh.rn.gov.br"
  }
];

export default function ProjectInstitutionsCarousel() {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.min(rail.clientWidth * 0.74, 430),
      behavior: "smooth"
    });
  };

  return (
    <section
      className={styles.institutionStrip}
      aria-labelledby="institutions-title"
    >
      <div className={styles.institutionStripHeader}>
        <div>
          <p className={styles.kicker}>INSTITUIÇÕES PARCEIRAS</p>
          <h2 id="institutions-title">Articulação institucional</h2>
        </div>

        <div className={styles.carouselControls} aria-label="Navegação das instituições">
          <button type="button" onClick={() => scroll(-1)} aria-label="Instituições anteriores">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Próximas instituições">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.institutionRail} ref={railRef}>
        {institutions.map((institution) => (
          <a
            className={styles.institutionSlide}
            href={institution.url}
            target="_blank"
            rel="noreferrer"
            key={institution.short}
            aria-label={`Acessar site oficial — ${institution.name}`}
          >
            <div className={styles.institutionSlideLogo}>
              <Image
                src={institution.logo}
                alt={institution.name}
                fill
                sizes="(max-width: 760px) 68vw, 245px"
                className={
                  institution.short === "UFRN"
                    ? styles.institutionLogoUfrn
                    : undefined
                }
              />
            </div>

            <div className={styles.institutionSlideMeta}>
              <strong>{institution.short}</strong>
              <span>
                Site oficial
                <ExternalLink size={13} aria-hidden="true" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
