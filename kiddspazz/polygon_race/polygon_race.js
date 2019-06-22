window.onload = init();

const H = window.innerHeight - 36 - 28;
const W = window.innerWidth;
const c = {x: W/2, y: H/2};
const colors = [
	'rgb(255, 0, 0)',
	'rgb(255, 127, 0)',
	'rgb(255, 255, 0)',
	'rgb(0, 255, 0)',
	'rgb(0, 255, 255)',
	'rgb(0, 0, 255)',
	'rgb(127, 0, 255)'
];
const steps = 12;

let canvas = document.getElementById('canvas');
canvas.width = W;
canvas.height = H;
let ctx = canvas.getContext('2d');
//turn it into a cartesian coordinate grid
ctx.translate(0, H);
ctx.scale(1, -1);

let u = 80;
let circum = 2 * Math.PI
let step = 0;
ctx.lineWidth = 3;

let polygons = new Array(16).fill(0);

function tick() {
	ctx.clearRect(0,0,W,H);
	polygons.forEach(function(e, idx, a) {
		if (!(idx < 3)) {
			draw(idx);
			drawDot(e/steps, idx, step);
			a[idx] ++;
			if (a[idx] === idx * steps) {a[idx] = 0}
		}
	})
	step ++;
	if (step === steps) {step = 0}
	window.requestAnimationFrame(tick);
};

function findX(i, sides) {
	let mult = (2 * i/sides)
	let answer = Math.round(100000 * Math.sin(mult * Math.PI))/100000;
	return answer * u;
};

function findY(i, sides) {
	let mult = (2 * i/sides);
	let answer = Math.round(100000 * Math.cos(mult * Math.PI))/100000;
	return answer * u;
};

function distance(a, b) {
	return (Math.sqrt(Math.pow((b[0] - a[0]), 2) + Math.pow((b[1] + a[1]), 2)));
}

function betweenPoint(a, b, step) {
	let d = step/steps
	let between = [];
	between[0] = a[0] + d * (b[0] - a[0]);
	between[1] = a[1] + d * (b[1] - a[1]);
	return between;
}

function draw(sides) {
	ctx.beginPath();
	for (let i = 0; i <= sides; i ++) {
		let x = c.x + findX(i, sides) * sides/3;
		let y = c.y + findY(i, sides) * sides/3;
		ctx.lineTo(x, y);
	};
	ctx.strokeStyle = colors[(sides)%colors.length] //(sides+cycle)%colors.length
	ctx.stroke();

};

function drawDot(e, sides, step) {
	let thisSideStart = Math.floor(e);
	let thisSideEnd = thisSideStart + 1;
	let a = [
		c.x + findX(thisSideStart, sides) * sides/3,
		c.y + findY(thisSideStart, sides) * sides/3
	];
	let b = [
		c.x + findX(thisSideEnd, sides) * sides/3,
		c.y + findY(thisSideEnd, sides) * sides/3
	];
	if (sides === 3) {
	};
	let between = betweenPoint(a, b, step);
	ctx.beginPath();
	ctx.arc(between[0], between[1], 7, 0, circum);
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.fill();
}

//window.setInterval(draw,1200);

/*

	let dotX = c.x + findX(cycle%sides,sides) * sides/3;
	let dotY = c.y + findY(cycle%sides,sides) * sides/3;
	ctx.beginPath();
	ctx.arc(dotX, dotY, 7, 0, circum);
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.fill();
*/

function init() {
	window.requestAnimationFrame(tick);
};
