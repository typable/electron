/*
G O L D E N   R U L E S   O F   E L E C T R O N
- every source creates its own stream
- every node counts up from the origin of the source
- a stream sends its state only to the next higher index
- all not indexed nodes are 0
- a index can only be set to not indexed nodes
- a node is on if at least one stream is active

Date 13. Feb 2021
*/

const DEBUG = false;

class Node {
	point = null;
	on = false;
	stream = [];
	constructor(x, y) {
		this.point = { x, y };
	}
	update() {
		let active = false;
		for(let stream of this.stream) {
			if(stream.on) {
				active = true;
				break;
			}
		}
		this.on = active;
	}
	render(g) {
		let { x, y } = this.point;
		g.beginPath();
		g.arc(x, y, 6, 2 * Math.PI, 0);
		g[this.on ? 'fill' : 'stroke']();
		if(DEBUG) {
			g.font = '14px monospace';
			let list = [];
			for(let stream of this.stream) {
				list.push(stream.index + (stream.on ? '*' : ''));
			}
			g.fillText(`[${list.join(', ')}]`, x + 8, y - 8);
		}
	}
}

class Wire {
	node = [];
	constructor(...node) {
		if(node.length !== 2) {
			throw new Error('A wire requires two Nodes!');
		}
		if(node[0] === node[1]) {
			throw new Error('A wire requires two different Nodes!');
		}
		this.node = node;
	}
	update() {
		let [ begin, end ] = this.node;
		if(begin.stream.length > 0) {
			for(let stream of begin.stream) {
				if(!contains(stream, end.stream)) {
					end.stream.push(adoptStream(stream));
				}
			}
		}
		if(end.stream.length > 0) {
			for(let stream of end.stream) {
				if(!contains(stream, begin.stream)) {
					begin.stream.push(adoptStream(stream));
				}
			}
		}
		for(let stream of begin.stream) {
			let current = get(stream, end.stream);
			if(current) {
				if(stream.index < current.index) {
					current.on = stream.on;
				}
			}
		}
		for(let stream of end.stream) {
			let current = get(stream, begin.stream);
			if(current) {
				if(stream.index < current.index) {
					current.on = stream.on;
				}
			}
		}
	}
	render(g) {
		let [ begin, end ] = this.node;
		g.beginPath();
		g.moveTo(begin.point.x, begin.point.y);
		g.lineTo(end.point.x, end.point.y);
		g.stroke();
	}
}

class Source {
	stream = null;
	constructor() {
		this.stream = createStream(this);
	}
}

class Switch extends Source {
	point = null;
	node = null;
	constructor(x, y) {
		super();
		this.point = { x, y };
		this.node = new Node(x + 50, y + 25);
		this.node.stream.push(this.stream);
	}
	render(g) {
		let { x, y } = this.point;
		g.beginPath();
		g.rect(x, y, 50, 50);
		g.lineWidth = this.stream.on ? 4 : 1;
		g.stroke();
	}
	onclick(point) {
		this.stream.on = !this.stream.on;
	}
}

class Button extends Source {
	point = null;
	node = null;
	constructor(x, y) {
		super();
		this.point = { x, y };
		this.node = new Node(x + 50, y + 25);
		this.node.stream.push(this.stream);
	}
	render(g) {
		let { x, y } = this.point;
		g.beginPath();
		g.rect(x, y, 50, 50);
		g.lineWidth = this.stream.on ? 4 : 1;
		g.stroke();
	}
	onpress(point) {
		this.stream.on = true;
	}
	onrelease(point) {
		this.stream.on = false;
	}
}

export function create(list) {
	let node = new Node(100, 100);
	list.push(node);
	let node2 = new Node(300, 150);
	list.push(node2);
	let node3 = new Node(400, 150);
	list.push(node3);
	let node4 = new Node(350, 250);
	list.push(node4);
	let node5 = new Node(550, 100);
	list.push(node5);
	let node6 = new Node(350, 350);
	list.push(node6);

	// create method that 'spawns' elements
	let toggle = new Switch(100, 500);
	list.push(toggle);
	list.push(toggle.node);
	let toggle2 = new Switch(550, 450);
	list.push(toggle2);
	list.push(toggle2.node);

	let button = new Button(650, 250);
	list.push(button);
	list.push(button.node);

	let wire = new Wire(node, node2);
	list.push(wire);
	let wire2 = new Wire(node2, node3);
	list.push(wire2);
	let wire3 = new Wire(node2, node4);
	list.push(wire3);
	let wire4 = new Wire(node3, node4);
	list.push(wire4);
	let wire5 = new Wire(node3, node5);
	list.push(wire5);
	let wire6 = new Wire(node4, node6);
	list.push(wire6);
	let wire7 = new Wire(toggle.node, node6);
	list.push(wire7);
	let wire8 = new Wire(toggle2.node, node3);
	list.push(wire8);
	let wire9 = new Wire(button.node, node5);
	list.push(wire9);

	window.toggle = toggle;
}

function createStream(source) {
	return {
		source,
		index: 1,
		on: false
	};
}

function adoptStream(stream) {
	let adopted = createStream(stream.source);
	adopted.index += stream.index;
	return adopted;
}

function contains(stream, list) {
	for(let item of list) {
		if(stream.source === item.source) {
			return true;
		}
	}
	return false;
}

function get(stream, list) {
	for(let item of list) {
		if(stream.source === item.source) {
			return item;
		}
	}
	return null;
}
