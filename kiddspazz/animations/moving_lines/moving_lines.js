const H = 800;
const W = H/2;

makeArt('canvas1');
makeArt('canvas2');
makeArt('canvas3');

function makeArt(canvasId) {
	let canvas = document.getElementById(canvasId);
	canvas.width = W;
	canvas.height = H;
	let ctx = canvas.getContext('2d');
	//turn canvas into a cartesian coordinate grid
	ctx.translate(0, H);
	ctx.scale(1, -1);

	let lineHeight = 10;
	let incline = 100;
	let numOfLines = (H + incline)/lineHeight;
	let numOfCircles = 28;
	let circleLineWidth = 4;
	let circles = [];
	let lines = [];
	let counter = 0;
	let interval = 100;

	for (let i = 1; i < numOfLines; i ++) {
		lines.push(new Line(i));
	}

	function makeCircles() {
		circles = [];
		for (let j = 0; j < numOfCircles; j ++) {
			circles.push(new Circle())
		}
	}

	function Circle() {
		let colorRandom = Math.floor((Math.random() * 100)) + 60
		this.radius = Math.floor(Math.random() * 40);
		this.center = {
			x: Math.floor(Math.random() * (W - this.radius * 2)) + this.radius,
			y: Math.floor(Math.random() * (H - this.radius * 2)) + this.radius
		};
		this.lineWidth = circleLineWidth * (Math.random() + 1);
		this.color = 'rgb(0,' + (colorRandom/2) + ',' + colorRandom  + ')';

		this.draw = function() {
			ctx.beginPath();
			ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.color;
			ctx.stroke();
		}
	}

	function Line(i) {
		this.startPoint = {x: -20, y: i * lineHeight};
		this.endPoint = {x: W + 20, y: i * lineHeight - incline};

		this.draw = function() {
			ctx.beginPath();
			ctx.moveTo(this.startPoint.x, this.startPoint.y);
			ctx.lineTo(this.endPoint.x, this.endPoint.y);
			ctx.lineWidth = lineHeight/2;
			ctx.strokeStyle = 'rgb(0,0,0)';
			ctx.stroke();
		}

	};

	function tick() {
		if (counter%(lineHeight) === 0) {
			lines.unshift(new Line(0));
		};
		if (counter%(interval) === 0) {
			makeCircles();
		};
		lines.forEach(function(line, i) {
			line.startPoint.y += 1;
			line.endPoint.y += 1;
			if (line.endPoint.y > H) {
				lines.pop();
			}
		});
		ctx.clearRect(0, 0, W, H);
		lines.forEach(line => line.draw());
		circles.forEach(circle => circle.draw());
		counter ++;
	};

	console.log(circles);

	window.setInterval(tick, interval);
};
