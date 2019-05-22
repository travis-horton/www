;(function() {
	document.addEventListener("DOMContentLoaded", function() {

		const H = 300;
		const W = 300;

		const canvasCenter = {x: W/2, y: H/2};
		let canvas = document.getElementById('canvas');
		canvas.width = W;
		canvas.height = H;
		let ctx = canvas.getContext('2d');
		//turn canvas into a cartesian coordinate grid
		ctx.translate(0, H);
		ctx.scale(1, -1);
		let cPerLine = 60;
		let circSeparate = H/cPerLine;
		let circles = [];
		let step = 0;

		class Circle {
			constructor(radius, x, y) {
				this.radius = radius;
				this.center = new V(x, y);
			}

			draw() {
				ctx.beginPath();
				ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2);
				ctx.fillStyle = 'rgb(255,255,255)';
				ctx.fill();
			}

			update() {
				this.center = move(this.center, step);
			}
		}

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

		for (let i = 0; i < (W / circSeparate); i ++) {
			for (let j = 0; j < (H / circSeparate); j ++) {
				let x = j * circSeparate;
				let y = i * circSeparate;
				let circRadius = (
					(Math.random() * ((H/cPerLine)/2))
				);
				circles.push(new Circle(
					circRadius, x + (1/2 * circSeparate),
					y + (1/2 * circSeparate)
				));
			}
		};

		circles.forEach(function(e) {
			e.draw();
		});

		function tick() {
			ctx.clearRect(0,0,H,W);
			circles.forEach(function(e) {
				e.update();
				e.draw();
			});
			step ++;
			if (step > 2000) {step = 0};
			window.requestAnimationFrame(tick);
		};

		tick();

		function move(v, step) {
			if (step < 200) {
				return v;
			} else if (step < 800) {
				return v.plus(
					new V(
						0, v.y * 2
					).minus(
						v
					)
					.times(1/600)
				)
			} else if (step < 1200) {
				return v;
			} else if (step < 1800) {
					return v.plus(
						new V(
							0, v.y * -2
						).minus(
							v
						)
						.times(1/600)
					)
			} else {
				return v;
			}
		}

	});
})();
