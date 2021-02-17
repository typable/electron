import { DEBUG } from './env.js';
import { Timer, createStream, adoptStream, get, contains, polygon } from './util.js';

export class Node {
	constructor(x, y) {
		this.point = { x, y };
		this.radius = 5;
		this.on = false;
		this.stream = [];
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
		g.fillStyle = 'white';
		g.beginPath();
		g.arc(x, y, this.radius, 2 * Math.PI, 0);
		g.fill();
		g.beginPath();
		g.arc(x, y, this.radius, 2 * Math.PI, 0);
		g.fillStyle = 'black';
		g[this.on ? 'fill' : 'stroke']();
		if(DEBUG) {
			g.font = '14px monospace';
			let list = [];
			for(let stream of this.stream) {
				list.push(stream.index + (stream.on ? '*' : ''));
			}
			g.fillText(`[${list.join(',')}]`, x + 8, y - 8);
		}
	}
}

export class Source extends Node {
	constructor(x, y) {
		super(x, y);
		this.stream.push(createStream(this));
	}
}

export class Wire {
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

export class Element {
	constructor(x, y, size, radius) {
		this.point = { x, y };
		this.size = size;
		this.radius = radius;
		this.node = [];
	}
	update() {
		for(let node of this.node) {
			node.update();
		}
	}
	render(g) {
		let { x, y } = this.point;
		let { width, height } = this.size;
		g.fillStyle = 'lightgrey';
		g.beginPath();
		g.rect(x, y, width, height);
		g.fill();
		g.beginPath();
		g.rect(x, y, width, height);
		g.stroke();
		for(let node of this.node) {
			node.render(g);
		}
	}
}

export class Switch extends Element {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 });
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.interact = true;
	}
	render(g) {
		super.render(g);
		let px = this.point.x + this.size.width / 2;
		let py = this.point.y + this.size.height / 2;
		let flip = this.stream.on ? 1 : -1;
		let array = [
			[px - 12, py - 15 * flip],
			[px + 12, py - 15 * flip],
			[px + 10, py + 15 * flip],
			[px - 10, py + 15 * flip]
		];
		g.fillStyle = 'grey';
		g.beginPath();
		polygon(g, array);
		g.fill();
		g.beginPath();
		polygon(g, array);
		g.stroke();
	}
	onclick() {
		this.stream.on = !this.stream.on;
	}
}

export class Button extends Element {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 });
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.interact = true;
	}
	render(g) {
		super.render(g);
		let { x, y } = this.point;
		let { width, height } = this.size;
		g.fillStyle = 'grey';
		g.beginPath();
		g.arc(x + width / 2, y + height / 2, (this.stream.on ? 12 : 14), 2 * Math.PI, 0);
		g.fill();
		g.beginPath();
		g.arc(x + width / 2, y + height / 2, (this.stream.on ? 12 : 14), 2 * Math.PI, 0);
		g.stroke();
	}
	onpress() {
		this.stream.on = true;
	}
	onrelease() {
		this.stream.on = false;
	}
}

export class Gate extends Element {
	constructor(x, y, size, name) {
		super(x, y, size);
		this.name = name;
	}
	render(g) {
		super.render(g);
		let { x, y } = this.point;
		let { width, height } = this.size;
		g.font = '12px Roboto Mono';
		g.textBaseline = 'middle';
		g.textAlign = 'center';
		g.fillStyle = 'black';
		g.fillText(this.name, x + width / 2, y + height / 2);
	}
}

export class NotGate extends Gate {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 }, 'NOT');
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.node.push(new Node(x, y + 25));
	}
	update() {
		super.update();
		this.stream.on = !this.node[1].on;
	}
}

export class AndGate extends Gate {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 }, 'AND');
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.node.push(new Node(x, y + 15));
		this.node.push(new Node(x, y + 35));
	}
	update() {
		super.update();
		this.stream.on = this.node[1].on && this.node[2].on;
	}
}

export class NandGate extends Gate {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 }, 'NAND');
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.node.push(new Node(x, y + 15));
		this.node.push(new Node(x, y + 35));
	}
	update() {
		super.update();
		this.stream.on = !(this.node[1].on && this.node[2].on);
	}
}

export class OrGate extends Gate {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 }, 'OR');
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.node.push(new Node(x, y + 15));
		this.node.push(new Node(x, y + 35));
	}
	update() {
		super.update();
		this.stream.on = this.node[1].on || this.node[2].on;
	}
}

export class NorGate extends Gate {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 }, 'NOR');
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.node.push(new Node(x, y + 15));
		this.node.push(new Node(x, y + 35));
	}
	update() {
		super.update();
		this.stream.on = !(this.node[1].on || this.node[2].on);
	}
}

export class XorGate extends Gate {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 }, 'XOR');
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.node.push(new Node(x, y + 15));
		this.node.push(new Node(x, y + 35));
	}
	update() {
		super.update();
		this.stream.on = (!this.node[1].on && this.node[2].on) || (this.node[1].on && !this.node[2].on);
	}
}

export class XnorGate extends Gate {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 }, 'XNOR');
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.node.push(new Node(x, y + 15));
		this.node.push(new Node(x, y + 35));
	}
	update() {
		super.update();
		this.stream.on = !((!this.node[1].on && this.node[2].on) || (this.node[1].on && !this.node[2].on));
	}
}

export class Light extends Element {
	constructor(x, y) {
		super(x, y, null, 18);
		this.node.push(new Node(x - this.radius, y));
	}
	render(g) {
		let { x, y } = this.point;
		g.fillStyle = this.node[0].on ? 'yellow' : 'white';
		g.beginPath();
		g.arc(x, y, this.radius, 2 * Math.PI, 0);
		g.fill();
		g.beginPath();
		g.arc(x, y, this.radius, 2 * Math.PI, 0);
		g.stroke();
		g.beginPath();
		let angle = 1 / 4 * Math.PI;
		g.moveTo(x + this.radius * Math.cos(-angle), y + this.radius * Math.sin(-angle));
		g.lineTo(x + this.radius * Math.cos(3 * angle), y + this.radius * Math.sin(3 * angle));
		g.stroke();
		g.beginPath();
		g.moveTo(x + this.radius * Math.cos(angle), y + this.radius * Math.sin(angle));
		g.lineTo(x + this.radius * Math.cos(3 * -angle), y + this.radius * Math.sin(3 * -angle));
		g.stroke();
		g.fillStyle = 'black';
		for(let node of this.node) {
			node.render(g);
		}
	}
}

export class Clock extends Element {
	constructor(x, y) {
		super(x, y, { width: 50, height: 50 });
		let source = new Source(x + 50, y + 25);
		this.node.push(source);
		this.stream = source.stream[0];
		this.timer = new Timer(30);
		this.on = false;
		this.interact = true;
	}
	update() {
		super.update();
		if(this.on) {
			if(this.timer.count()) {
				this.stream.on = !this.stream.on;
			}
		}
	}
	render(g) {
		super.render(g);
		let { x, y } = this.point;
		let { width, height } = this.size;
		let size = this.on ? 22 : 30;
		g.fillStyle = 'grey';
		g.beginPath();
		g.rect(x + width / 2 - size / 2, y + height / 2 - size / 2, size , size );
		g.fill();
		g.beginPath();
		g.rect(x + width / 2 - size / 2, y + height / 2 - size / 2, size , size );
		g.stroke();
	}
	onclick() {
		this.on = !this.on;
		if(!this.on) {
			this.timer.reset();
			this.stream.on = false;
		}
	}
}
