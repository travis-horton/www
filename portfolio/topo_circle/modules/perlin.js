import { Vector, dotProduct, indexFromVector, vectorFromIndex, bilinearInterpolation } from "./vectors.js"

/*
perlin noise: random noise where each point is related to the points around it
  three steps:
  1. create grid
    the grid has to be fewer points than the end result array (a 256x256 end result would want something between 8x8 and 64x64)
    this grid needs random normalized vectors on each node
  2. dot products for each point
    each point in the end result must have dot product for the surrounding 4 and the directional vector from large grid node to specific end result square (in 2d space) calculated (four dot products):
      dot product of two vectors = v1.x * v2.x + v1.y * v2.y
  3. bilinear interpolation of the four dot products to the end result point (better images with cosine interpolation)
  4. perlin noise actually uses a fade function--after final color is determined it is faded by the function: 6t^5 - 15t^4 + 10t^3
*/

function perlinNoiseForPoint(v, unitGrid, gridWidth) {
  //calculate grid cell
  let X = Math.floor(v.x);
  let Y = Math.floor(v.y);

  //calculate relative x, y
  let x = v.x - X;
  let y = v.y - Y;

  let timesY = gridWidth + 1;
  //calculate noise from for corners
  let n00 = dotProduct(unitGrid[X + (Y * (timesY))], new Vector(x, y));
  let n01 = dotProduct(unitGrid[X + 1 + (Y * (timesY))], new Vector(x - 1, y));
  let n10 = dotProduct(unitGrid[X + ((Y + 1) * (timesY))], new Vector(x, y - 1));
  let n11 = dotProduct(unitGrid[X + 1 + ((Y + 1) * (timesY))], new Vector(x - 1, y -1));

  //compute fade for x and y
  x = fade(x);
  y = fade(y);

  //interpolate results
  return bilinearInterpolation(new Vector(x, y), [n00, n01, n10, n11]); 
}


function perlinNoise(w, h, overlayWidth, overlayHeight) {
  //create overlay grid one row and one column bigger than oW and oH respectively
  //fill it with random one of 8 directions
  let unitGrid = createUnitGrid(overlayWidth, overlayHeight);

  //determine how many pixels per unitGrid
  let widthDivisions = w / overlayWidth;
  let heightDivisions = h / overlayHeight;
  //instantiate the perlin grid
  let perlin = new Uint8Array(w * h);
 
  let largeUnitGrid = createUnitGrid(overlayWidth/2, overlayHeight/2);
  for (let i = 0; i < perlin.length; i++) {
    let v = vectorFromIndex(i, w);

    let noiseValue = perlinNoiseForPoint(new Vector(v.x/widthDivisions/2, v.y/heightDivisions/2), largeUnitGrid, overlayWidth/2);
    noiseValue = noiseValue * .5 + .5;
    perlin[i] = Math.floor((perlin[i] + (noiseValue * 255))/2)
  }

 
  for (let i = 0; i < perlin.length; i++) {
    let v = vectorFromIndex(i, w);
    
    let noiseValue = perlinNoiseForPoint(new Vector(v.x/widthDivisions, v.y/heightDivisions), unitGrid, overlayWidth);
    noiseValue = noiseValue * .5 + .5;
    perlin[i] = Math.floor(255 * noiseValue);
  }
  return perlin;
}

function fade(n) {
  return n*n*n*(n*(n*6-15)+10);
}

function createUnitGrid(w, h) {
  let grid = new Array((w + 1) * (h +1));
  let randomVecs = {
    0: new Vector(1, 0), 
    1: new Vector(-1, 0), 
    2: new Vector(0, 1),
    3: new Vector(0, -1),
    4: new Vector(Math.sqrt(.5), Math.sqrt(.5)),
    5: new Vector(-Math.sqrt(.5), Math.sqrt(.5)),
    6: new Vector(Math.sqrt(.5), -Math.sqrt(.5)),
    7: new Vector(-Math.sqrt(.5), -Math.sqrt(.5))
  };

  for (let i = 0; i < grid.length; i++) {
    grid[i] = randomVecs[Math.floor(8 * Math.random())];
  }

  return grid;
}

export default perlinNoise;
