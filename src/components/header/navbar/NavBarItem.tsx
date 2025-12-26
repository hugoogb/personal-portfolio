import type { FC, ReactNode } from "react";
import { useContext } from "react";
import { ColorContext } from "@/contexts/color.context";
import { motion } from "motion/react";

interface NavBarItemProps {
  id: number;
  activeId: number | null;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const NavBarItem: FC<NavBarItemProps> = ({ id, activeId, children, onClick }) => {
  const { color } = useContext(ColorContext);
  const isActive = activeId === id;

  return (
    <li className="list-none relative">
      <a
        onClick={onClick}
        className={`
          relative z-10 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer
          ${isActive ? "text-white" : "text-muted hover:text-text"}
        `}
      >
        {children}
      </a>
      {isActive && (
        <motion.div
          layoutId="navbar-active"
          className="absolute inset-0 rounded-full z-0 shadow-sm"
          style={{ backgroundColor: color }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
        />
      )}
    </li>
  );
};
