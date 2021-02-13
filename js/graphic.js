const DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;

export class Point {
	x = null;
	y = null;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	add(x = 0, y = 0) {
		return new Point(this.x + x, this.y + y);
	}
	equals(point) {
		return this.x === point.x && this.y === point.y;
	}
}

export function createCanvas(width, height) {
	let canvas = document.createElement('canvas');
	let g = canvas.getContext('2d');
	scaleCanvas(canvas, width, height);
	return { canvas, g };
}

export function scaleCanvas(canvas, width, height) {
	const g = canvas.getContext('2d');
	const backingStoreRatio = g.webkitBackingStorePixelRatio || 1;
	const ratio = DEVICE_PIXEL_RATIO / backingStoreRatio;
	if(DEVICE_PIXEL_RATIO != backingStoreRatio) {
		canvas.width = width * ratio;
		canvas.height = height * ratio;
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
	}
	else {
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = '';
		canvas.style.height = '';
	}
	g.scale(ratio, ratio);
}
