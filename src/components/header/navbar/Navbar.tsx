import type { FC, MouseEvent } from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Header.module.css";
import { SettingsMenu } from "@/components/header/navbar/SettingsMenu";
import { NavBarItem } from "@/components/header/navbar/NavBarItem";
import { DarkModeToggle } from "@/components/header/navbar/DarkModeToggle";
import { IconMenu2 } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { ICON_SIZES } from "@/constants/design.constants";

export const Navbar: FC = () => {
  const { t } = useTranslation();

  const router = useRouter();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [visibility, setVisibility] = useState<boolean>(false);
  const navbarRef = useRef<HTMLUListElement>(null);
  const iconMenuNavbarRef = useRef<HTMLDivElement>(null);

  const navItems = useMemo(
    () => [
      { id: 0, name: t("nav.home"), href: "/" },
      { id: 1, name: t("nav.about"), href: "/about" },
      { id: 2, name: t("nav.projects"), href: "/projects" },
      { id: 3, name: t("nav.contact"), href: "/contact" },
    ],
    [t]
  );

  const navItemsMapped = navItems.map((item) => {
    return (
      <NavBarItem
        key={item.id}
        href={item.href}
        id={item.id}
        activeId={activeId}
      >
        {item.name}
      </NavBarItem>
    );
  });

  useEffect(() => {
    const currentPath = router.asPath;
    const activeIndex = navItems.findIndex((item) => item.href === currentPath);
    setActiveId(activeIndex !== -1 ? activeIndex : null);
  }, [navItems, router.asPath]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | Event) => {
      const target = event.target as Node;
      if (
        navbarRef.current &&
        !navbarRef.current.contains(target) &&
        iconMenuNavbarRef.current &&
        !iconMenuNavbarRef.current.contains(target)
      ) {
        setVisibility(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const ulNavbarMobileStyles = Object.assign(
    {},
    {
      height: visibility ? "180px" : "0",
    },
    {
      overflow: visibility ? "auto" : "hidden",
    },
    {
      border: visibility ? "var(--border-nav)" : "none",
    }
  );

  return (
    <div className={styles.headerContainer}>
      <nav className={styles.navbar}>
        <ul ref={navbarRef} className={styles.ulNavbar}>
          {navItemsMapped}
        </ul>
        <ul
          ref={navbarRef}
          style={ulNavbarMobileStyles}
          className={styles.ulNavbarMobile}
        >
          {navItemsMapped}
        </ul>
        <div
          ref={iconMenuNavbarRef}
          className={styles.menuIconContainer}
          onClick={() => setVisibility(!visibility)}
        >
          <IconMenu2 size={ICON_SIZES.lg} className={styles.menuIcon} />
        </div>
      </nav>
      <div className={styles.buttonColorPickerContainer}>
        <DarkModeToggle></DarkModeToggle>
        <SettingsMenu></SettingsMenu>
      </div>
    </div>
  );
};
