;(function() {
	document.addEventListener("DOMContentLoaded", function() {

	  let doc = document
	  let div = doc.getElementById("box");
	  div.style = "margin: 0"
	  let c = doc.createElement("canvas");
	  let ctx = c.getContext("2d");
	  let radian = function(degree) {return ((Math.PI/180) * degree)}
	  div.appendChild(c);
	  var WIDTH = c.width = window.innerWidth - 12;
	  var HEIGHT = c.height = window.innerHeight;
	  window.onresize = function() {
	    WIDTH = c.width = window.innerWidth;
	    HEIGHT = c.height = window.innerHeight;
	    ctx.translate(c.width/2, c.height/2);
	  }
	  ctx.translate(c.width/2, c.height/2);

	  let makePicture = function(xTimes, length) {
	    let x = xTimes
	  	for (let i = 0; i < x; i ++) {
	      ctx.save();
	  		ctx.rotate(radian(i*(360/x)));
	      draw(length, i, x);
	      ctx.restore()
	    };
	    x = x*(3/5)
	    for (let i = 0; i < x; i ++) {
	      ctx.save();
	      ctx.rotate(radian(i*(360/x)));
	      draw2(length, i, x);
	      ctx.restore()
	    };
	  }

	  let draw = function(length, i, x) {
	    ctx.strokeStyle = "rgb(200,200,0)";

	    ctx.beginPath();
	    ctx.moveTo(0,0);
	    ctx.lineTo(length*.6+12, length*.6);
	    ctx.lineTo(length*.6+12, length*.4);
	    ctx.lineTo(0,0);
	    ctx.stroke();

	    ctx.beginPath();
	    ctx.arc(length/2, length/2, length/2, radian(-30), radian(120));
	    ctx.stroke();
	  }

	  let draw2 = function(length, i, x) {
	    ctx.strokeStyle = "rgb(200,200,0)";
	    for (let j = 0; j < 31; j += 6) {
	      ctx.beginPath();
	      ctx.arc(length, length, j+5, 0, 2*Math.PI);
	      ctx.stroke();
	    }
	  }

	  let tick = function() {
	    ctx.fillStyle = "rgba(0,0,0,1)";
	    ctx.fillRect(-c.width/2-200, -c.height/2-200, c.width+400, c.height+400);
	    ctx.fillStyle = "rgb(0,100,40)";
	    ctx.beginPath();
	    ctx.arc(0, 0, Math.min(HEIGHT, WIDTH)*.42, 0, radian(360));
	    ctx.fill();
	    makePicture(48, Math.min(HEIGHT, WIDTH)*.25);
	    ctx.rotate(radian(.1));
	    requestAnimationFrame(tick);
	  };

	  tick();
  });
})();
