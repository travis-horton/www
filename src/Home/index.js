import styles from './Home.module.css';
import Header from '../SharedComponents/Header';

const Home = () => {
  return (
    <div className={styles.main}>
		<Header />
    </div>
  );
}

export default Home;
