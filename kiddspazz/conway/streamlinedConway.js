;(function(){

  var newGameOfLife = function(canvasId) {

    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    var cellSize = 3;
    var gridSize = { x: Math.floor(canvas.width/cellSize), y: Math.floor(canvas.height/cellSize) };
    var clickTime = 10;

    this.x = []

    for (let i = 0; i < gridSize.x * gridSize.y; i ++) {
      this.x.push(Math.floor(Math.random()*1.1));
    }

    var printGrid = function(screen, gridSize, cellSize, x) {
      for (let i = 0; i < x.length; i ++) {
        if (x[i] === 1) {
          screen.fillRect(
            (i % gridSize.x) * cellSize,
            Math.floor(i/gridSize.x) * cellSize,
            cellSize,
            cellSize
          )
        };
      };
    };

    this.y = deadOrAlive(this.x, gridSize, cellSize)


    var self = this

    var tick = function () {
      self.draw(screen, gridSize, cellSize, canvas);
      self.update(gridSize, cellSize)
    };

    tick();

    window.setInterval(tick, clickTime);

  };

  newGameOfLife.prototype = {
    update: function(gridSize, cellSize) {
      this.x = this.y;
      this.y = deadOrAlive(this.x, gridSize, cellSize);
    },

    draw: function(screen, gridSize, cellSize, canvas) {
      screen.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < this.x.length; i ++) {
        if (this.x[i] === 1) {
          screen.fillStyle = "#FFFF00"
          screen.fillRect(
            (i % gridSize.x) * cellSize,
            Math.floor(i/gridSize.x) * cellSize,
            cellSize - 2,
            cellSize - 2
          )
        };
      };
    }
  }

  function deadOrAlive(x, gridSize, cellSize) {

    var y = []

    for (let i = 0; i < x.length; i ++) {
      if (
        i % gridSize.x === 0 ||
        i % gridSize.x === gridSize.x - 1 ||
        Math.floor(i/gridSize.x) === 0 ||
        Math.floor(i/gridSize.x) === gridSize.y - 1
      ) {
        y[i] = 0
      } else {

        var numberOfCellsOnASide = gridSize.x

        liveNeighbors = []

        liveNeighbors =
        [
          x[i - numberOfCellsOnASide - 1],
          x[i - numberOfCellsOnASide],
          x[i - numberOfCellsOnASide + 1],
          x[i - 1],
          x[i + 1],
          x[i + numberOfCellsOnASide - 1],
          x[i + numberOfCellsOnASide],
          x[i + numberOfCellsOnASide + 1]
        ].reduce(function(sum, value) { return sum + value; }, 0);

        if (x[i] === 1 && (liveNeighbors === 2 || liveNeighbors === 3)) {
          y[i] = 1;
        } else if (x[i] === 0 && liveNeighbors === 3) {
          y[i] = 1;
        } else {
          y[i] = 0;
        };
      };
    };
    return y;
  };

  window.onload = function() {
    new  newGameOfLife("screen");
  };


})();
