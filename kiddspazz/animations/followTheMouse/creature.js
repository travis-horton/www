window.onload = init;

function init() {
	let body = document.querySelector("body");
	body.style = "margin: 0; padding: 0"
	let c = document.createElement("canvas");
	let ctx = c.getContext("2d");
	window.addEventListener('resize', function() {
		c.height = window.innerHeight;
		c.width = window.innerWidth;
	})
	c.height = window.innerHeight;
	c.width = window.innerWidth;
	c.style = 'background-color: rgb(220,220,200); margin: 0; padding: 0';
	body.appendChild(c);
	let mousePosition = {y: c.height/2, x: c.width/2}


	c.addEventListener('mousemove', function(e) {
		mousePosition = {y: e.clientY, x: e.clientX};
	});

	function Fly() {
		this.x = c.width/2;
		this.y = c.height/2;
		this.dirOfMouse = {x: 0, y: 0}
	}

	Fly.prototype = {
		draw() {
			let x = this.x;
			let y = this.y;
			let dir = this.dirOfMouse
			ctx.beginPath();
			ctx.arc(x, y, 20, 0, Math.PI * 2);
			ctx.fillStyle = 'rgb(248, 24, 148)';
			ctx.fill();

			ctx.beginPath();
			ctx.arc(x + 7, y - 4, 6, 0, Math.PI * 2);
			ctx.fillStyle = 'rgb(255, 255, 255)';
			ctx.fill();
			ctx.beginPath();
			let rPupilx = x + 7 + dir.x * 2;
			if (this.dirOfMouse.x === 0) rPupilx = x + 4;
			ctx.arc(rPupilx, y - 4 + dir.y * 2, 2, 0, Math.PI * 2);
			ctx.fillStyle = 'rgb(0, 0, 0)';
			ctx.fill();

			ctx.beginPath();
			ctx.arc(x - 7, y - 4, 6, 0, Math.PI * 2);
			ctx.fillStyle = 'rgb(255, 255, 255)';
			ctx.fill();
			ctx.beginPath();
			let lPupilx = x - 7 + dir.x * 2;
			if (this.dirOfMouse.x === 0) lPupilx = x - 4;
			ctx.arc(lPupilx, y - 4 + dir.y * 2, 2, 0, Math.PI * 2);
			ctx.fillStyle = 'rgb(0, 0, 0)';
			ctx.fill();
		},

		update() {
			if (this.x !== mousePosition.x || this.y !== mousePosition.y) {
				let xDir = mousePosition.x - this.x;
				let yDir = mousePosition.y - this.y;
				let xSign = Math.sign(xDir);
				let ySign = Math.sign(yDir);
				if (Math.abs(xDir) > 5) {
					this.x += xSign * 4;
					this.dirOfMouse.x = xSign;
				} else {
					this.dirOfMouse.x = 0;
				}
				if (Math.abs(yDir) > 3) {
					this.y += ySign * 2;
					this.dirOfMouse.y = ySign;
				} else {
					this.dirOfMouse.y = 0;
				}
			}
		}
	}

	let fly1 = new Fly();

	tick = function() {
		ctx.rect(0, 0, c.width, c.height);
		ctx.fillStyle = 'rgb(220,220,200)';
		ctx.fill();
		fly1.update();
		fly1.draw();
		window.requestAnimationFrame(tick);
	}

	tick();
}
