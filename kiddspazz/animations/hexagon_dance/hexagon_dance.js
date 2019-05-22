const H = 480;
const W = 480;
const canvasCenter = {x: W/2, y: H/2};
let canvas = document.getElementById('canvas');
canvas.width = W;
canvas.height = H;
let ctx = canvas.getContext('2d');
//turn canvas into a cartesian coordinate grid
ctx.translate(0, H);
ctx.scale(1, -1);
const shapeSize = 84;
let step = 0;
let color = 'rgb(255,85,50)';

let V = function(){}
V.distance = function(v1, v2) {
	return (Math.sqrt(Math.abs(Math.pow((v2.x-v1.x),2)+Math.pow((v2.y-v1.y),2))));
}

let shapes = [];

class Hectagon {
	constructor(center, size, orient, color, ring) {
		this.center = center;
		this.size = size;
		this.orient = orient;
		this.color = color;
		this.ring = ring;
	}

	draw() {
		ctx.beginPath();
		for (let i = 0; i <= 6; i ++) {
			let x = this.center.x + findX(i, 6, this.orient) * this.size;
			let y = this.center.y + findY(i, 6, this.orient) * this.size;
			ctx.lineTo(x, y);
		};
		ctx.fillStyle = this.color;
		ctx.fill();
	}
};

let rows = Math.ceil(W/shapeSize) + 3;
let columns = Math.ceil(H/(shapeSize - 8) + 3);
let zeroRow = canvasCenter.x % shapeSize - shapeSize;
let zeroColumn = canvasCenter.y % shapeSize - shapeSize;

for (let i = 0; i < rows; i ++) {
	for (let j = 0; j < columns; j ++) {
		let center = {
			x: (zeroColumn  + (i % rows * shapeSize)),
			y: (zeroRow + (j % columns * (shapeSize * 7/8)))
		};
		if (j % 2 === 1) {
			center.x += shapeSize/2;
		}
		let ring = Math.ceil(V.distance(canvasCenter, center)/shapeSize);
		shapes.push(new Hectagon(center, shapeSize/2, (step%6)/6, color, ring));
	};
};

function findX(i, sides, orient) {
	let mult = (2 * i/sides) - orient;
	let answer = Math.round(100000 * Math.sin(mult * Math.PI))/100000;
	return answer
};

function findY(i, sides, orient) {
	let mult = (2 * i/sides) - orient;
	let answer = Math.round(100000 * Math.cos(mult * Math.PI))/100000;
	return answer;
};

function tick() {
	ctx.beginPath();
	ctx.rect(0,0,W,H);
	ctx.fillStyle = 'rgb(255,253,208)';
	ctx.fill();
	shapes.forEach(function(item, index, shapes) {
		item.draw();
		if (item.ring === step % 7) {
			item.orient += 1/6
		}
	});
	step ++;
};

tick();

window.setInterval(tick, 200);
