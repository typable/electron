export class Group {
	list = [];
	update() {
		for(let item of this.list) {
			item.update();
		}
	}
	render(g) {
		for(let item of this.list) {
			g.save();
			item.render(g);
			g.restore();
		}
	}
	add(type) {
		this.list.push(type);
	}
}

export function createStream(source) {
	return {
		source,
		index: 1,
		on: false
	};
}

export function adoptStream(stream) {
	let adopted = createStream(stream.source);
	adopted.index += stream.index;
	return adopted;
}

export function contains(stream, list) {
	for(let item of list) {
		if(stream.source === item.source) {
			return true;
		}
	}
	return false;
}

export function get(stream, list) {
	for(let item of list) {
		if(stream.source === item.source) {
			return item;
		}
	}
	return null;
}

export function collide(item, point) {
	if(item && item.point && point) {
		let { x, y } = item.point;
		if(item.size) {
			let { width, height } = item.size;
			return x < point.x && x + width > point.x && y < point.y && y + height > point.y;
		}
		if(item.radius) {
			let { radius } = item;
			return Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)) < radius;
		}
	}
	return false;
}

export function polyline(g, array) {
	let first = array[0];
	g.moveTo(first[0], first[1]);
	for(let i = 1; i <array.length; i++) {
		g.lineTo(array[i][0], array[i][1]);
	}
}

export function polygon(g, array) {
	polyline(g, array);
	g.closePath();
}

export function transform(a, scale) {
	return a * 1 / scale;
}

export function translate(a, scale, b) {
	return a / scale - b;
}
