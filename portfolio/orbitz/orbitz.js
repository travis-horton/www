const H = window.innerHeight;
const W = window.innerWidth;
let canvas = document.getElementById('canvas');
canvas.width = W;
canvas.height = H;
let ctx = canvas.getContext('2d');
//turn it into a cartesian coordinate grid
ctx.translate(0, H);
ctx.scale(1, -1);

let circum = 2 * Math.PI;

let objects = [];

class Sphere {
	constructor(x, y, mass, v) {
		this.center = new V(x, y);
		this.r = 10 + Math.min(25,mass/400);
		this.mass = mass;
		this.color = 'rgb(' + Math.min(255,(Math.floor(255 * this.mass/1000))) + ',0,0)';
		this.v = v;
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.center.x, this.center.y, this.r, 0, circum);
		ctx.fillStyle = this.color;
		ctx.fill();
	}

	update(o) {
		let self = this;
		self.center = self.center.plus(self.v);
		let totalG = new V(0,0);
		o.forEach(function(e) {
			let d = determineDistance(self, e)
			if (d.dis > 0) {
				let g = d.dir.times(.01*e.mass/Math.pow(d.dis,2))
				totalG = totalG.plus(g);
			};
		});
		this.v = this.v.minus(totalG);
		objects.push(this);
	}
}

function determineDistance(a, b) {
	let d = {dis: null, dir: null}
	let dir = a.center.minus(b.center)
	d.dir = dir.norm();
	d.dis = dir.length();
	return d;
}

function tick() {
	ctx.clearRect(0,0,W,H);
	ctx.beginPath();
	let oldObjects = objects;
	objects = [];
	oldObjects.forEach(function(e) {
		e.draw();
		e.update(oldObjects);
	});
	window.requestAnimationFrame(tick);
};

class V {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	minus(v) {
		return new V(this.x - v.x, this.y - v.y);
	};
	plus(v) {
		return new V(this.x + v.x, this.y + v.y)
	};
	times(int) {
		return new V(this.x * int, this.y * int)
	};
	norm() {
		return new V(this.x/this.length(), this.y/this.length())
	};
	length() {
		return (Math.sqrt((this.x*this.x)+(this.y*this.y)));
	};
	rotate(angle) {
		return new V(
			this.x * (Math.cos(angle)) - this.y * (Math.sin(angle)),
			this.y * (Math.cos(angle)) + this.x * (Math.sin(angle))
		)
	};
};

let sun = new Sphere(W/2, H/2, 60000, new V(0,0));
let planet1 = new Sphere(W/2 - 200, H/2 - 200, 400, new V(-1,1));
let planet2 = new Sphere(W/2 + 100, H/2 + 100, 400, new V(-1.4,1.4));

objects.push(sun);
objects.push(planet1);
objects.push(planet2);

window.requestAnimationFrame(tick);
