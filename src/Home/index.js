import styles from './Home.module.css';
import headshot from '../media/headshot.png';

const Home = () => {
	return (
		<div className={styles.main}>
			<header className={styles.header}>
				<img class={styles.profilepic} src={ headshot } alt="profile pic"/>
				<h1>travis horton
				</h1>
				<h2>front-end engineer,<br/>pianist,<br/>accountant</h2>
			</header>
			<p>
				i'm travis. i program in react/javascript/css/html and i'm trying to learn rust. i
				play the piano. i do some accounting on the side. i live in boise, idaho with my
				wonderful wife anne and our cat monkey (not pictured). and i've been trying to
				become a runner.
			</p>
			<p>
				i'm a full time front-end engineer for bodybuilding.com; started in march of 
				2020. i recently built <a href='https://www.bodybuilding.com/workout-plans2'
					rel='noreferrer' target='_blank'>this page</a>.
			</p>
			<p>
				i teach the piano at the college of idaho, and also play the piano for their
				choirs and student recitals and juries. i started working with the college of idaho
				in the fall semester of 2019.
			</p>
			<p>
				i do some contract accounting work on the side.
			</p>
			<p>
				i attended the recurse center spring 1, 2019 batch: february 18 - may 9. it was a
				great time, i met a lot of amazing people, and i learned a ton. here are some of
				the projects i worked on while i was there and before.
			</p>
			<p>
				in 2017, my wife and i decided to leave our 7 year home of brooklyn for the road.
				we bought an rv and traveled the country for a year and a half. i studied
				programming part time while i worked half-time as an accountant for the brooklyn
				youth chorus.
			</p>
			<p>
				i studied piano for 6 years at unc-school of the arts and 2 more years at the new
				england conservatory. i moved to new york city in 2011 and worked as a pianist
				there for 7 years&mdash;played carnegie hall, joe's pub, off-broadway shows,
				worked for nyu and the brooklyn youth chorus as a vocal coach and staff pianist. i
				rode my bicycle a lot.
			</p>
		</div>
	);
}

export default Home;
