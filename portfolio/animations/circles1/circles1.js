;(function() {
  var Animation = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var animationSize = { x: canvas.width, y: canvas.height }

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
    },

    draw: function(screen, animationSize) {
      if (Math.random() > .99) {
      screen.clearRect(0, 0, 700, 700);
    };
      for (var i = 0; i < this.bodies.length; i++) {
        drawCircle(screen, this.bodies[i]);
      }
    },

    addBody: function(body) {
      this.bodies.push(body);
    }
  };

  var Circle = function(animation, animationSize) {
    this.animation = animation;
    this.size = { r: Math.random() * 10 };
    this.center = { x: 15, y: 15 };
  };

  Circle.prototype = {
    update: function () {

    },

    draw: function() {

    }
  };

  var drawCircle = function(screen, body) {
    screen.strokeStyle =  '#00' + Math.floor(Math.random() * 255).toString(16) + 'AB';
    screen.beginPath();
    screen.arc((Math.random() * 640) + 30, (Math.random() * 640) + 30, (Math.random() * 10) + 20, 0, 2 * Math.PI);
    screen.stroke();
  };

  window.onload = function() {
    new Animation("screen");
  };
})();
