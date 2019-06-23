import perlinNoise from "./modules/perlin.js";
import { outlineCircle, solidCircle, Color } from "./modules/drawing.js";

document.addEventListener("DOMContentLoaded", startApp); 
  
function startApp() {
  const div = document.getElementById("box");
  const canvas = document.createElement("canvas");
  div.appendChild(canvas);
  canvas.id = "canvas1";
  const W = canvas.width = 512;
  const H = canvas.height = W;
  const ctx = canvas.getContext("2d");
  const RADIUS = W/3;
  const STEPS = 360;
  let step = 0;

  let imageData = ctx.getImageData(0, 0, W, H);
  let data = imageData.data;
  let elev = perlinNoise(W, H, 16, 16);  //Uint8Array(W * H);
  console.log(elev);

  window.setInterval(tick, 20);
  function findCircleX() {return RADIUS * Math.cos(Math.PI * step/STEPS) + W/2;}
  function findCircleY() {return RADIUS * Math.sin(Math.PI * step/STEPS) + H/2;}

  function tick() {
    step++;
    if (step >= STEPS*2) step = 0;
    ctx.clearRect(0, 0, W, H);
    printBackground();
    let x = Math.floor(findCircleX());
    let y = Math.floor(findCircleY());
    solidCircle(x, y, 5, new Color(255, 255, 255).returnRGB(), ctx);
    let gN = elev[y * W + x];
    let color = new Color(gN, gN, gN);
    document.querySelector("body").style.backgroundColor = color.returnRGB();
  }

  function printBackground() {
    for (let i = 0; i < data.length; i += 4) {
      //    this puts a red grid overlay so you can see the unit grid
      //    if ((i/4) % 32 === 0 || Math.floor((i/4)/512) % 32 === 0) {
      //      data[i] = 255;
      //      data[i + 1] = 0;
      //      data[i + 2] = 0;
      //    } else {
      data[i] = data[i + 1] = data[i + 2] = elev[i/4];
      //    }
      data[i + 3] = 255;
    };
    ctx.putImageData(imageData, 0, 0);
  }
}
