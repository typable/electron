import GameEngine from '../deps.js';
import { Element } from './element.js';
import { Node, Source } from './node.js';

export class Gate extends Element {
	constructor(x, y, width, height, name) {
		super(x, y, new GameEngine.Shape.Rect(width, height));
		this.name = name;
	}
	render(g) {
		super.render(g);
		const {x, y, shape: {width, height}} = this;
		g.font = '500 14px Roboto';
		g.textBaseline = 'middle';
		g.textAlign = 'center';
		g.fillStyle = '#212121';
		g.fillText(this.name, x + width / 2, y + height / 2);
	}
}

export class NotGate extends Gate {
	constructor(x, y) {
		super(x, y, 54, 54, 'NOT');
		this.add(new Node(x, y + 27), 'x');
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
		const {x, c} = this.symbols;
		c.active = !x.on;
	}
}

export class AndGate extends Gate {
	constructor(x, y) {
		super(x, y, 54, 54, 'AND');
		this.add(new Node(x, y + 15), 'x');
		this.add(new Node(x, y + 39), 'y');
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
		const {x, y, c} = this.symbols;
		c.active = x.on && y.on;
	}
}

export class NandGate extends Gate {
	constructor(x, y) {
		super(x, y, 54, 54, 'NAND');
		this.add(new Node(x, y + 15), 'x');
		this.add(new Node(x, y + 39), 'y');
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
		const {x, y, c} = this.symbols;
		c.active = !(x.on && y.on);
	}
}

export class OrGate extends Gate {
	constructor(x, y) {
		super(x, y, 54, 54, 'OR');
		this.add(new Node(x, y + 15), 'x');
		this.add(new Node(x, y + 39), 'y');
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
		const {x, y, c} = this.symbols;
		c.active = x.on || y.on;
	}
}

export class NorGate extends Gate {
	constructor(x, y) {
		super(x, y, 54, 54, 'NOR');
		this.add(new Node(x, y + 15), 'x');
		this.add(new Node(x, y + 39), 'y');
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
		const {x, y, c} = this.symbols;
		c.active = !(x.on || y.on);
	}
}

export class XorGate extends Gate {
	constructor(x, y) {
		super(x, y, 54, 54, 'XOR');
		this.add(new Node(x, y + 15), 'x');
		this.add(new Node(x, y + 39), 'y');
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
		const {x, y, c} = this.symbols;
		c.active = (!x.on && y.on) || (x.on && !y.on);
	}
}

export class XnorGate extends Gate {
	constructor(x, y) {
		super(x, y, 54, 54, 'XNOR');
		this.add(new Node(x, y + 15), 'x');
		this.add(new Node(x, y + 39), 'y');
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
		const {x, y, c} = this.symbols;
		c.active = !((!x.on && y.on) || (x.on && !y.on));
	}
}

export class Relais extends Gate {
	constructor(x, y) {
		super(x, y, 54, 54, 'REL');
		this.add(new Node(x, y + 27), 'x');
		this.add(new Node(x + 27, y), 'y');
		this.add(new Source(x + 15, y + 54), 'c');
		this.add(new Source(x + 39, y + 54), 's');
	}
	update() {
		super.update();
		const {x, y, c, s} = this.symbols;
		c.active = x.on ? false : y.on;
		s.active = x.on ? y.on : false;
	}
}