let body = document.querySelector("body");
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
body.appendChild(canvas);

let Vector = function(x, y) {
  this.x = x;
  this.y = y;
};

Vector.prototype = {
  plus(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  },
  normalize() {
    let newX = this.x/this.x * Math.sign(this.x);
    let newY = this.y/this.y * Math.sign(this.y);
    if (isNaN(newX)) {newX = 0}
    if (isNaN(newY)) {newY = 0}
    return new Vector(newX, newY)
  }
  //i know--this is not a REAL normalization;
};

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
};

//still needs to be built!!
let determineChar = function(m) {
  let chars = {w: .0145, r: .000387, h: .00008};

  for (i = 0; i < m.space.length; i++) {
    let x = Math.random();
    if (x < chars.w) {m.space[i] = "w"}
    else if (x < chars.w + chars.r) {
      m.space[i] = "r"
    } else if (x < chars.w + chars.r + chars.h) {
      m.space[i] = "h"
    } else (m.space[i] = "g")
  };

  return m;

/*  let numberOfChars = function (ch, m) {
    return m.space.reduce(function(s, e) {
      if (e === ch) {s += 1};
      return s;
    }, 0)
  };

  for (i = 0; i < m.space.length; i++) {
    if (numberOfChars("w", m)/i < chars.w) {
      m.space[i] = "w";
    } else if (numberOfChars("g", m)/i < chars.g) {
      m.space[i] = "g";
    } else if (numberOfChars("r", m)/i < chars.r) {
      m.space[i] = "r";
    } else if (numberOfChars("h", m)/i < chars.h) {
      m.space[i] = "h";
    } else {
      m.space[i] = null;
    }
  }
  */
};

function elementFromChar(legend, ch) {
  if (!(ch in legend)) {return null};
  var element = new legend[ch]();
  element.originChar = ch;
  return element;
};

function charFromElement(element) {
  if (element === null) {return null};
  return element.originChar
}

function makeLocalMap(map, viewDepth, v) {
  let view = 1 + (2 * viewDepth);
  let localMap = new Map(view, view);
  for (let i = 0; i < view; i++) {
    for (let j = 0; j < view; j++) {
      let rowsOffset = (j - viewDepth);
      let columnsOffset = (i - viewDepth);
      let offsetV = new Vector(columnsOffset, rowsOffset);
      if (!(map.isInside(v.plus(offsetV)))) {
        localMap.set(new Vector(i, j), "w")
      } else {
        let char = map.get(v.plus(offsetV))
        if (char === null) {char = {originChar: " "}}
        localMap.set(new Vector(i, j), char);
      };
    };
  };
  return localMap;
}

function surrounded(v, map, exclude) {
  let empty = []
  for (let count = -1; count < 2; count++) {
    for (let count2 = -1; count2 < 2; count2++) {
      let item = map.get(v.plus(new Vector(count, count2)));
      if (
        item !== undefined && (
          item === null ||
          item.originChar === exclude
        )
      ) {empty.push(item)};
    };
  };
  if (empty.length === 0) {return true}
  return false;
}

let GameState = function(w, h, legend) {
  this.legend = legend;
  this.map = new Map(w, h);

  this.map = determineChar(this.map);

  canvas.width = w * legend.sprite.size;
  canvas.height = h * legend.sprite.size;
  canvas.style = "border: 1pt black solid; background-color: #EEEEEE";

  for (let i = 0; i < this.map.space.length; i++) {
    this.map.set(
      new Vector(i % this.map.w, Math.floor(i / this.map.w)),
      elementFromChar(legend, this.map.space[i])
    );
  }
};
GameState.prototype = {
  print() {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, this.map.w * legend.sprite.size, this.map.h * legend.sprite.size);
    let m = this.map;
    for (e in m.space) {
      if (m.space[e] !== null) {
        let x = (e % m.w * this.legend.sprite.size);
        let y = (Math.floor(e / m.w) * this.legend.sprite.size);
        m.space[e].print(new Vector(x, y));
      }
    };
  },
  //this will be worth making an update & an act...to improve effeciency
  updateAndAct() {
    let m = this.map;
    let acted = [];
    for (let e = 0; e < m.space.length; e++) {
      let thing = m.space[e];
      if (
        thing !== null &&
        thing.update &&
        acted.indexOf(thing) === -1
      ) {
        let v = new Vector(e % m.w, Math.floor(e / m.w))
        if (
          thing.update(v, m) && //update
          !surrounded(v, m, m.space[e].exclude) &&
          thing.act
        ) {
          thing.act(v, m); //act
          acted.push(thing)
        }
      }
    };
  }
};

let Map = function(w, h) {
  this.w = w;
  this.h = h;
  this.space = new Array(w * h);
};
Map.prototype = {
  isInside(v) {
    return (v.x >= 0 && v.y >= 0 && v.x < this.w && v.y < this.h);
  },
  get(v) {
    return (this.space[v.x + (v.y * this.w)]);
  },
  set(v, value) {
    this.space[v.x + (v.y * this.w)] = value;
  },
  forEach(f, context) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let value = this.space[x + (y * this.w)];
        if (value !== null) {
          f.call(context, value, (x + (y * this.w)));
        };
      };
    };
  }
};

let Wall = function() {
  this.originChar = "w"
};
Wall.prototype = {
  print(v) {
    ctx.fillStyle = "#222222"
    ctx.fillRect(v.x, v.y, legend.sprite.size,legend.sprite.size);
  }
};

let Living = function() {};
Living.prototype = {
  actions: {
    reproduce(v, map, context) {
      let baby = elementFromChar(legend, context.originChar);
      baby.energy *= .1
      map.set(v, baby)
    }
  },
  view: {
    findAll(ch, map, context) {
      let found = [];
      map.forEach(function(spot, y) {
        if (spot.originChar === ch) {
          let offsetX = (y % map.w) - ((map.w - 1) / 2)
          let offsetY = (Math.floor(y / map.w)) - ((map.w - 1) / 2)
          found.push(new Vector(offsetX, offsetY));
        };
      });
      return found;
    },
    find(ch, m, context) {
      let found = context.view.findAll(ch, m, context);
      if (ch === "r" && found.length > 0) {
        return found.reduce(function(m, c) {
          if (Math.max(m.x, m.y) < Math.max(c.x, c.y)) {return m}
          else if (Math.max(m.x, m.y) > Math.max(c.x, c.y)) {return c}
          else if (Math.random() > .5) {return c} else {return m}
        });
      }
      return randomElement(found);
    }
  },
  print(v) {
    ctx.fillStyle = this.color
    ctx.fillRect(v.x, v.y, legend.sprite.size,legend.sprite.size);
  },
};

let Grass = function() {
  this.energy =  Math.floor(1 + Math.random() * 2);
  this.viewDepth = 1;
  this.color = "#00FF33";
  this.originChar = "g"
};
Grass.prototype = {
  __proto__: Living.prototype,
  update(v, map) {
    if (this.energy < 5) {
      this.energy += .05;
    }
    return true;
  },
  act(v, map) {
    if (this.energy >= 4.5) {
      let m = makeLocalMap(map, this.viewDepth, v);
      let space = this.view.find(" ", m, this);
      if (space) {
        this.actions.reproduce(v.plus(space), map, this);
        this.energy *= .1
      };
    }
  }
}

let Animal = function() {};
Animal.prototype = {
  __proto__: Living.prototype,
  animalActions: {
    move(v, d, map, context) {
      map.set(v, null);
      map.set(v.plus(d), context);
    },
    eat(v, d, map, context) {
      let f = map.get(v.plus(d));
      context.energy += f.energy/2.5;
      map.set(v.plus(d), null);
    }
  }
};

let Rabbit = function() {
  this.energy = 25;
  this.color = "#999999";
  this.viewDepth = 5;
  this.walkEnergy = .001;
  this.originChar = "r";
  this.exclude = "g";
}
Rabbit.prototype = {
  __proto__: Animal.prototype,
  update(v, map) {
    this.energy -= .001;
    if (this.energy <= 0) {
      map.set(v, null);
      return false;
    };
    return true;
  },
  act(v, map) {
    let m = makeLocalMap(map, 1, v);
    let food = this.view.find("g", m, this);
    let space = this.view.find(" ", m, this);

    if (food) {
      this.animalActions.eat(v, food, map, this);
    } else if (space && this.energy > 120) {
      this.actions.reproduce(v.plus(space), map, this);
      this.energy = 12;
    } else if (space) {
      let m = makeLocalMap(map, this.viewDepth, v);
      let d = this.view.find("g", m, this);
      if (d) {d = d.normalize()} else {d = space};
      if (charFromElement(map.get(v.plus(d))) !== null) {d = space};
      this.animalActions.move(v, d, map, this);
      this.energy -= this.walkEnergy;
      this.walkEnergy += .002;
    }
  }
}

let Hawk = function() {
  this.energy = 40;
  this.color = "#FF0000";
  this.viewDepth = 15;
  this.walkEnergy = .001;
  this.exclude = "g";
  this.originChar = "h";
};
Hawk.prototype = {
  __proto__: Animal.prototype,
  update(v, map) {
    this.energy -= .001;
    if(this.energy <= 0) {
      map.set(v, null);
      return false;
    }
    return true;
  },
  act(v, map) {
    let m = makeLocalMap(map, 1, v);
    let food = this.view.find("r", m, this);

    if (food) {
      this.animalActions.eat(v, food, map, this);
    } else if (this.energy > 2000) {
      this.actions.reproduce(v.plus(new Vector(1,1)), map, this);
      this.energy = 20;
    } else {
      let m = makeLocalMap(map, this.viewDepth, v);
      let d = this.view.find("r", m, this);
      if (d) {
        d = d.normalize()
        this.animalActions.move(v, d, map, this);
      };
    }
  }
};


let legend = {"sprite": {size: 8}, "w": Wall, "g": Grass, "r": Rabbit, "h": Hawk}

let gameState = new GameState(180, 130, legend)

let tick = function() {
gameState.print();
gameState.updateAndAct();
};

setInterval(tick, 30)
