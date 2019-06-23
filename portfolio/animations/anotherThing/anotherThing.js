let doc = document;
let body = doc.querySelector('body');
let div = doc.getElementById('canvasDiv')
let canvas = doc.createElement('canvas');
const SIZE = canvas.width = canvas.height = 840;
div.appendChild(canvas);
let ctx = canvas.getContext('2d');
canvas.style = "border: solid 2px black; background-color: rgb(90,90,90)";


let step = Math.PI/(180*(256/360));
let i = -128;
let j = -141;

let draw = function() {
  ctx.strokeStyle = "rgb(" + (256 * Math.abs((j/141))) + "," + (120 * (Math.abs(i/128))) + "," + (160 + Math.abs(i/(512*8))) + ")";
  ctx.beginPath();
  ctx.arc(SIZE/2+(Math.sin(Math.PI * (j/141))*100), SIZE/2+(Math.cos(Math.PI * (j/141))*100), SIZE/3, step*i, step*i+1);
  ctx.stroke();
  i += 1;
  j += 1;
  if (i > 128) {i = -128};
  if (j > 141) {j = -141};
};

setInterval(draw, 1000/600)
