import styles from './Header.module.css';

const Header = () => {
	return (
		<header className={styles.header}>
			<nav className={styles.navBar}>
				<a classname={styles.navItem} href='/'>about me</a>
				<a classname={styles.navItem} href='/software-engineer'>software engineer</a>
				<a classname={styles.navItem} href='/pianist'>pianist</a>
				<a classname={styles.navItem} href='/accountant'>accountant</a>
				<a classname={styles.navItem} href='/blog'>blog</a>
			</nav>
		</header>
	);
}

export default Header;
