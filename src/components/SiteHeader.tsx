"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderUtilities from "@/src/components/HeaderUtilities";
import { navItems } from "@/src/data/project";
import styles from "./header-utilities.module.css";

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);

    const main = document.querySelector("main");
    if (main && !main.id) {
      main.id = "main-content";
    }
  }, [pathname]);

  const skipToContent = () => {
    const main = document.querySelector("main");
    if (!(main instanceof HTMLElement)) return;

    if (!main.id) main.id = "main-content";
    main.tabIndex = -1;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <button className={styles.skipLink} type="button" onClick={skipToContent}>
        Pular para o conteúdo
      </button>

      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="Projeto Potengi — Início">
            <Image
              src="/brand/projeto-potengi-logo.png"
              alt=""
              width={62}
              height={72}
              priority
            />
            <span>
              <strong>Projeto Potengi</strong>
              <small>Bacia Hidrográfica do Rio Potengi</small>
            </span>
          </Link>

          <nav
            id="main-navigation"
            className={`${styles.navigation}${menuOpen ? ` ${styles.navigationOpen}` : ""}`}
            aria-label="Navegação principal"
          >
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? styles.navActive : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className={styles.mobileUtilities}>
              <HeaderUtilities />
            </div>
          </nav>

          <div className={styles.desktopUtilities}>
            <HeaderUtilities />
          </div>

          <button
            className={styles.menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </header>
    </>
  );
}
