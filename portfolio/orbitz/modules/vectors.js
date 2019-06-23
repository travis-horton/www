module.exports = vector;

function V(x, y) {
	this.x = x;
	this.y = y;
	this._minus = function(v) {
		return new V(this.x - v.x, this.y - v.y);
	};
	this._plus = function(v) {
		return new V(this.x + v.x, this.y + v.y)
	};
	this._times = function(v, int) {
		return V(v.x * int, v.y * int)
	};
	this._norm = function(v) {
		return V(v.x/v.length(), v.y/v.length())
	};
	this._length = function(v) {
		return (Math.sqrt((v.x*v.x)+(v.y*v.y)));
	};
	this._rotate = function(v, angle) {
		return V(
			v.x * (Math.cos(angle)) - v.y * (Math.sin(angle)),
			v.y * (Math.cos(angle)) + v.x * (Math.sin(angle))
		)
	};
};
