import type { FC } from 'react';
import {  useContext  } from 'react';
import styles from "@/styles/modules/Header.module.css";
import { ColorContext } from "@/components/Layout";
import Link from "next/link";

interface NavBarItemProps {
  href: any;
  id: any;
  activeId: any;
  children: any;
}

export const NavBarItem: FC<NavBarItemProps> = ({ href, id, activeId, children  }) => {
	const { color } = useContext(ColorContext);

	const spanStyles = Object.assign(
		{},
		{ backgroundColor: color },
		{ width: activeId === id ? "35px" : "0" }
	);

	return (
		<li className={styles.navItem}>
			<Link
				href={href}
				style={{ fontWeight: activeId === id ? "600" : "400" }}
			>
				{children}
				<span style={spanStyles} className={styles.navItemBar}></span>
			</Link>
		</li>
	);
};
