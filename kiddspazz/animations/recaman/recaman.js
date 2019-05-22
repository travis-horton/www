let div = document.getElementById('canvasDiv');
let c = document.createElement("canvas");
let ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = 750;
c.style = 'border-top: 1pt solid black; border-bottom: 1pt solid black;background-color: rgb(100,100,100); margin: auto; padding: 0';
div.appendChild(c);
let x = 1;
let nextX = 0;
let a = [0, 1];
let i = 1;
let strokestyle = ['rgb(180,0,0)','rgb(0,0,180)','rgb(0,220,0)'];
ctx.lineWidth = 4;

function circle(x, y, r, s, e, updown) {
  ctx.beginPath();
  ctx.arc(x, y, r, s, e, updown);
  ctx.stroke();
};

function recaman() {
  if (x - i < 0 || a.includes(x - i)) {
    nextX = x + i;
  } else {
    nextX = x - i;
  };
  let horiz = (x + nextX)/2
  ctx.strokeStyle = strokestyle[i%3];
  circle(horiz*8, 325, (Math.abs(nextX - x))*8/2, 0, Math.PI, i%2);
  x = nextX;
  i += 1;
  a.push(x);
  console.log(x);
  if (i > 10000) {clearInterval(recamanInterval)}
};

let recamanInterval = setInterval(recaman, 400);

recamanInterval;
