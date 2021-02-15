import styles from './Header.module.css';

const Header = () => {
	return (
		<header className={styles.header}>
			<nav className={styles.navBar}>
				<a className={styles.navItem} href='/'>About</a>
				<a className={styles.navItem} href='/Portfolio'>Portfolio</a>
				<a className={styles.navItem} href='/Blog'>Blog</a>
				<a className={styles.navItem} href='/Contact'>Contact</a>
			</nav>
		</header>
	);
}

export default Header;
