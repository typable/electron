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
		return item.point.x < point.x && item.point.x + 50 > point.x && item.point.y < point.y && item.point.y + 50 > point.y;
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
