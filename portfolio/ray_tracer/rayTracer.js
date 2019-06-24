var div = document.getElementById('canvasDiv')
var c = document.createElement("canvas");
div.appendChild(c);
c.id = "c"
var width = 800;
var height = 600;
c.width = width;
c.height = height;
c.style = "border: 1px solid black; margin: auto;"
var ctx = c.getContext("2d");
var imageData = ctx.getImageData(0, 0, c.width, c.height);
var data = imageData.data;

var scene = {};

scene.camera = {p: {x: 0, y: 0, z: 0}};

scene.objects = [];

scene.light = {x: -10, y: 20, z: -40};

scene.ambient = new Color(35,15,25);

function render(scene) {
  let objects = scene.objects;
  let camera = scene.camera;
  let light = scene.light;

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let px = (i + (j*width));
      let p = normalize({
        x: ((2*(i+.5)/width)-1)*(width/height),
        y: (1-(2*(j+.5)/height)),
        z: -3
      });

      let t = Infinity;
      let objectT = Infinity;
      for (let k = 0; k < objects.length; k++) {
        objectT = Math.min(objects[k].intersect(p, camera), objectT);
        if (objectT < t) {
          let n = objects[k].computeNormal(vMultiply(p, objectT));
          let l = lightVector(light, vMultiply(p, objectT));
          let directLight = Math.max(dotProduct(n,l),0)
          let objectColor = {
            r: objects[k].c.r * directLight,
            g: objects[k].c.g * directLight,
            b: objects[k].c.b * directLight
          }
          colorPx(px, objectColor)
        }
        t = objectT;
      };
       if (objectT === Infinity) {
        colorPx(px,scene.ambient);
      };
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function Sphere(center, radius, color) {
  this.p = center;
  this.r = radius;
  this.c = color;
};
Sphere.prototype = {
  intersect(ray, camera) {
    let oMinusP = vMinus(camera.p, this.p);
    let a = dotProduct(ray, ray);
    let b = 2*(dotProduct(ray, oMinusP));
    let c = dotProduct(oMinusP,oMinusP) - square(this.r);
    let d = b*b - 4*a*c;
    let solution = Infinity;
    if (d > 0) {
      solution = Math.max(
        (-b + Math.sqrt(d))/(2*a),
        (-b - Math.sqrt(d))/(2*a)
      );
    }

    return solution;
    //does the ray intersect this sphere...?
    //return Infinity or distance to intersection.
  },
  computeNormal(pHit) {
    let n = normalize(vMinus(pHit, this.p));
    return n;
  }
}

function Color(r,g,b) {
  this.r = r;
  this.g = g;
  this.b = b;
};
Color.prototype = {
  rgb: function() {return "rgb("+this.r+", "+this.g+", "+this.b+")";}
};

function dotProduct(v1, v2) {
  return (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z)
};
function vMinus(v1,v2) {
  let newVector = {};
  newVector.x = (v1.x-v2.x);
  newVector.y = (v1.y-v2.y);
  newVector.z = (v1.z-v2.z);
  return newVector;
};
function vMultiply(v1, factor) {
  let newVector = {};
  newVector.x = (v1.x*factor);
  newVector.y = (v1.y*factor);
  newVector.z = (v1.z*factor);
  return newVector;
};
function square(x) {
  return x*x;
};
function normalize(v) {
  normalV = {}
  normalV.x = v.x/(vLength(v));
  normalV.y = v.y/(vLength(v));
  normalV.z = v.z/(vLength(v));
  return normalV;
};
function vLength(v) {
  return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
};
function colorPx(px, color) {
  data[px*4] = color.r;
  data[px*4+1] = color.g;
  data[px*4+2] = color.b;
  data[px*4+3] = 255;
};
function lightVector(light, pHit) {
  let l = normalize(vMinus(light, pHit));
  return l;
};
function crossProduct(v1, v2) {
  return {
    x: (v1[1]*v2[2])-(v1[2]*v2[1]),
		y: (v1[2]*v2[0])-(v1[0]*v2[2]),
		z: (v1[0]*v2[1])-(v1[1]*v2[0])
  }
};

scene.objects.push(new Sphere(
  {x: 2.5, y: 2, z: -9},
  1,
  new Color(0,255,255)
));
scene.objects.push(new Sphere(
  {x: 0, y: -2, z: -13},
  2,
  new Color(255,0,0)
));
scene.objects.push(new Sphere(
  {x: -5, y: 3, z: -17.5},
  3,
  new Color(0,0,255)
));
scene.objects.push(new Sphere(
  {x: 4, y: -2, z: -9},
  1,
  new Color(0,255,0)
));

render(scene);
