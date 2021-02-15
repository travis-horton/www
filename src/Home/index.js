import styles from './Home.module.css';
import headshot from '../media/headshot.png';

const Home = () => {
	return (
		<div className={styles.main}>
			<h1>Travis Horton, Software Developer</h1>
			<img class={styles.profilepic} src={ headshot } alt="profile pic"/>
			<p>
				I'm Travis.
				I attended the Recurse Center  Spring 1, 2019 batch: February 18 - May 9.
				It was a great time, I met a lot of amazing people, and I learned a ton.
				Here  are some of the projects I worked on while I was there and before.
			</p>
			<p>
				Last year, my wife and I decided to leave our 7 year home of Brooklyn for the road, and we bought an RV and did just that.
				I studied programming part time during that year while I worked half-time as an accountant for the Brooklyn Youth Chorus.
			</p>
			<p>
				I studied piano for 6 years at UNC-School of the Arts and 2 more years at the New England Conservatory.
				I moved to New York City in 2011 and worked as a pianist there for 7 years&mdash;played Carnegie Hall, Joe's Pub, off-Broadway shows, worked for NYU and the Brooklyn Youth Chorus as a vocal coach and staff pianist.
				I rode my bicycle a lot.
			</p>
		</div>
	);
}

export default Home;
