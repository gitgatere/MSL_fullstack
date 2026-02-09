import { NavLink } from "react-router-dom";
import styles from "./Layout.module.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.icon}>M</span>
          <span className={styles.brand}>MSL</span>
        </div>
        <ul className={styles.links}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/live"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Live
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
