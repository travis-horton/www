;(function() {
  var Animation = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var animationSize = { x: canvas.width, y: canvas.height }
    this.keyboarder = new Keyboarder();

    this.bodies = [new Circle(this, animationSize)]

    var self = this;
    var tick = function() {
      self.update();
      self.draw(screen, animationSize);
      requestAnimationFrame(tick);
    };

    tick();
  };

  Animation.prototype = {
    update: function() {
      for (var i = 0; i < this.bodies.length; i++) {
        this.bodies[i].update();
      }
    },

    draw: function(screen, animationSize) {
      if (Math.random() > .999) {
      screen.clearRect(0, 0, animationSize.x, animationSize.y);
    };
      for (var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i] instanceof Circle) {
          drawCircle(screen, this.bodies[i]);
        }
      }
    },

    addBody: function(body) {
      this.bodies.push(body);
    }
  };

  var Circle = function(animation, animationSize) {
    this.animation = animation;
    this.size = { r: 15 };
    this.center = { x: animationSize.x / 2,
                    y: animationSize.y / 2 };
    this.color = {r: 0, g: 120, b: 171}
    this.keyboarder = new Keyboarder();
  };

  Circle.prototype = {

    update: function () {

      if (this.color.g > 255) {
        this.color.g = 120
      } else {
        this.color.g = this.color.g+1 };

      var randomSize = { r: (Math.random() * 40) + 10 }

      this.size = { r: randomSize.r };

      if (this.center.x > 700) {
        this.center.x = 0;
      } else if (this.center.x < 0) {
        this.center.x = 700;
      } else if (this.center.y > 700) {
        this.center.y = 0;
      } else if (this.center.y < 0) {
        this.center.y = 700;
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.center.x -= 1;
        this.center.y -= 1;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.center.x += 1;
        this.center.y -= 1;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
        this.center.x -= 1;
        this.center.y += 1;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
        this.center.x += 1;
        this.center.y += 1;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.center.x -= 1
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.center.x += 1
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.center.y -= 1
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
        this.center.y += 1
      };
    }
  };

  var drawCircle = function(screen, body) {
    screen.strokeStyle =  'rgb(' + body.color.r + ',' + body.color.g + ',' + body.color.b +')'
    screen.beginPath();
    screen.arc(body.center.x, body.center.y, body.size.r, 0, 2 * Math.PI);
    screen.stroke();
  };


  var Keyboarder = function() {
    var keyState = {};

    window.onkeydown = function(e) {
      keyState[e.keyCode] = true;
    };

    window.onkeyup = function(e) {
      keyState[e.keyCode] = false;
    };

    this.isDown = function(keyCode) {
      return keyState[keyCode] === true
    };

    this.KEYS = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, SPACE: 32};
  };


	window.addEventListener("keydown", function(e) {
		if ([37,38,39,40,32].indexOf(e.keyCode) > -1) {
			e.preventDefault();
		}
	}, false);

  window.onload = function() {
    new Animation("screen");
  };
})();
