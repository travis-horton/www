;(function() {
  var pong = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 700, 500);

    var paddle1 = {
      y: 220,
      draw: function() {
        ctx.fillStyle = "rgb(255," + Math.floor(100+Math.random()*60) + ",0)"
        ctx.fillRect(0, this.y, 8, 60);
      },
      down: false,
      up: false,
    };

    var paddle2 = {
      y: 220,
      draw: function() {
        ctx.fillStyle = "rgb(0," + Math.floor(100+Math.random()*60) + ",255)"
        ctx.fillRect(692, this.y, 8, 60);
      },
      down: false,
      up: false,
    }

    var ball = {
      x: 350,
      y: 250,
      vx: Math.floor(4+Math.random()*2)*Math.sign(Math.random()-.5),
      vy: Math.floor(4+Math.random()*2)*Math.sign(Math.random()-.5),
      radius: 10,
      draw: function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        ctx.fillStyle = "rgb(255,0,255)";
        ctx.fill();
      },
      update: function() {
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.y + 6 > canvas.height || ball.y + ball.vy - 6 < 0) {
          ball.vy = -ball.vy;
        };
        if (ball.x  < 18 && ball.y > paddle1.y && ball.y < paddle1.y + 60) {
          ball.vx = -ball.vx;
        };
        if (ball.x > 682 && ball.y > paddle2.y && ball.y < paddle2.y + 60) {
          ball.vx = -ball.vx;
        };
      }
    };

    paddle1.draw();
    paddle2.draw();
    ball.draw();

    function draw() {
      ball.update();

      if (ball.x + 10 > canvas.width || ball.x - 10 < 0) {
        window.cancelAnimationFrame(draw);
        return;
      };

      //paddle updates
      if (paddle1.up === true) {
        paddle1.y -= 8;
      };
      if (paddle1.down === true) {
        paddle1.y += 8;
      };
      if (paddle2.up === true) {
        paddle2.y -= 8;
      };
      if (paddle2.down === true) {
        paddle2.y += 8;
      };

      ctx.clearRect(0, 0, 700, 500);
      paddle1.draw();
      paddle2.draw();
      ball.draw();

      window.requestAnimationFrame(draw);
    };

    window.addEventListener("keydown", function(e) {
      if (e.keyCode === 38) {
        paddle2.up = true;
      };
      if (e.keyCode === 40) {
        paddle2.down = true;
      };
      if (e.keyCode === 87) {
        paddle1.up = true;
      };
      if (e.keyCode === 83) {
        paddle1.down = true;
      }
    });

    window.addEventListener("keyup", function(e) {
      if (e.keyCode === 38) {
        paddle2.up = false;
      };
      if (e.keyCode === 40) {
        paddle2.down = false;
      };
      if (e.keyCode === 87) {
        paddle1.up = false;
      };
      if (e.keyCode === 83) {
        paddle1.down = false;
      }
    });

    window.addEventListener("keypress", function(e) {
      if (e.keyCode === 32) {
        draw();
      }
    }, {once: true})
  };

  pong();

  window.addEventListener("keypress", function(e) {
    if (e.keyCode === 32) {
      pong();
    }
  })

})();
