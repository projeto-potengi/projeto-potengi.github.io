import Image from "next/image";
import { ExternalLink } from "lucide-react";
import styles from "@/app/projeto/projeto-multiescala.module.css";

const leaders = [
  {
    name: "Paulo Eduardo Vieira Cunha",
    role: "Coordenador Geral",
    profession: "Engenheiro Civil",
    department: "Departamento de Engenharia Civil e Ambiental · UFRN",
    photo: "/media/project/coordination/paulo-eduardo-vieira-cunha.jpg",
    sigaa: "https://sigaa.ufrn.br/sigaa/public/docente/disciplinas.jsf?siape=2550052",
    lattes: "https://lattes.cnpq.br/8375470571725379"
  },
  {
    name: "Carlos Wilmer Costa",
    role: "Vice Coordenador",
    profession: "Geógrafo",
    department: "Departamento de Engenharia Civil e Ambiental · UFRN",
    photo: "/media/project/coordination/carlos-wilmer-costa.jpg",
    sigaa: "https://sigaa.ufrn.br/sigaa/public/docente/disciplinas.jsf?siape=3060504",
    lattes: "https://lattes.cnpq.br/6913631503818679"
  }
];

export default function ProjectLeadership() {
  return (
    <section className={styles.leadership} aria-labelledby="leadership-title">
      <header className={styles.leadershipHeader}>
        <p className={styles.kicker}>COORDENAÇÃO DO PROJETO</p>
        <h2 id="leadership-title">Coordenação científica e técnica</h2>
        <p>
          Docentes do Departamento de Engenharia Civil e Ambiental da
          Universidade Federal do Rio Grande do Norte.
        </p>
      </header>

      <div className={styles.leaderGrid}>
        {leaders.map((leader) => (
          <article className={styles.leaderCard} key={leader.name}>
            <div className={styles.leaderPhoto}>
              <Image
                src={leader.photo}
                alt={`Retrato de ${leader.name}`}
                width={640}
                height={640}
                sizes="(max-width: 760px) 112px, 132px"
              />
            </div>

            <div className={styles.leaderInfo}>
              <span>{leader.role}</span>
              <h3>{leader.name}</h3>
              <p className={styles.leaderProfession}>{leader.profession}</p>
              <p className={styles.leaderDepartment}>{leader.department}</p>

              <div className={styles.leaderLinks}>
                <a href={leader.sigaa} target="_blank" rel="noreferrer">
                  SIGAA UFRN
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
                <a href={leader.lattes} target="_blank" rel="noreferrer">
                  Currículo Lattes
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
