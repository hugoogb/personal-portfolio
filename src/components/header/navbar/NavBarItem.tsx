import type { FC, ReactNode } from "react";
import { motion } from "motion/react";

interface NavBarItemProps {
  id: number;
  /** Real fragment target: without an href this is a styled span, not a link,
   *  so it never enters the tab order and screen readers announce nothing. */
  href: string;
  activeId: number | null;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const NavBarItem: FC<NavBarItemProps> = ({ id, href, activeId, children, onClick }) => {
  const isActive = activeId === id;

  return (
    <li className="list-none relative">
      <a
        href={href}
        onClick={onClick}
        aria-current={isActive ? "true" : undefined}
        className={`
          relative z-10 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer
          ${isActive ? "" : "text-muted hover:text-text"}
        `}
        // The pill is the user's exact accent, so the label flips to black or
        // white against it rather than the colour being altered to suit a label.
        style={isActive ? { color: "var(--primary-fg)" } : undefined}
      >
        {children}
      </a>
      {isActive && (
        <motion.div
          layoutId="navbar-active"
          className="absolute inset-0 rounded-full z-0 shadow-sm"
          style={{ backgroundColor: "var(--primary-color)" }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
        />
      )}
    </li>
  );
};
