export function outlineCircle(x, y, r, color, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

export function solidCircle(x, y, r, color, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export class Color {
  constructor(r, g, b, a) {
    if (!this.rgbIsValid(r, g, b)) {
     throw new Error("rgb is not an integer");
    }
    this.r = r
    this.g = g
    this.b = b
    this.a = Number.isInteger(a) ? a : 255
  }

  rgbIsValid(r, g, b) {
    return (Number.isInteger(r) && Number.isInteger(g) && Number.isInteger(b));
  }

  returnRGB() {
    return (`rgb(${this.r},${this.g},${this.b})`);
  }
}
