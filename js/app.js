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

import { Group } from './util.js';
import { Node, Wire, Element } from './type.js';

export default class App {
	constructor() {
		this.group = {
			node: new Group(),
			wire: new Group(),
			element: new Group()
		};
	}
	create() {
		let node = new Node(100, 100);
		this.add(node);
	}
	update() {
		this.group.node.update();
		this.group.wire.update();
		this.group.element.update();
	}
	render(g) {
		this.group.node.render(g);
		this.group.wire.render(g);
		this.group.element.render(g);
	}
	add(type) {
		if(type instanceof Node) {
			this.group.node.add(type);
		}
		if(type instanceof Wire) {
			this.group.wire.add(type);
		}
		if(type instanceof Element) {
			this.group.element.add(type);
		}
	}
}

// import { Node, Wire, Switch, Button, NotGate, XnorGate, Light } from './type.js';

// export function create(list) {
// 	let wires = [];
// 	let elements = [];
// 	list.wire = wires;
// 	list.element = elements;

// 	let node = new Node(100, 100);
// 	elements.push(node);
// 	let node2 = new Node(300, 150);
// 	elements.push(node2);
// 	let node3 = new Node(400, 150);
// 	elements.push(node3);
// 	let node4 = new Node(350, 250);
// 	elements.push(node4);
// 	let node5 = new Node(550, 100);
// 	elements.push(node5);
// 	let node6 = new Node(350, 350);
// 	elements.push(node6);

// 	let toggle = new Switch(100, 500);
// 	elements.push(toggle);
// 	let toggle2 = new Switch(500, 300);
// 	elements.push(toggle2);
// 	let toggle3 = new Switch(400, 550);
// 	elements.push(toggle3);
// 	let toggle4 = new Switch(400, 450);
// 	elements.push(toggle4);

// 	let button = new Button(550, 150);
// 	elements.push(button);

// 	let notGate = new NotGate(250, 400);
// 	elements.push(notGate);
// 	let norGate = new XnorGate(550, 500);
// 	elements.push(norGate);

// 	let light = new Light(650, 100);
// 	elements.push(light);

// 	wires.push(new Wire(node, node2));
// 	wires.push(new Wire(node2, node3));
// 	wires.push(new Wire(node2, node4));
// 	wires.push(new Wire(node3, node4));
// 	wires.push(new Wire(node3, node5));
// 	wires.push(new Wire(node4, node6));
// 	wires.push(new Wire(toggle.node[0], notGate.node[1]));
// 	wires.push(new Wire(toggle2.node[0], node3));
// 	wires.push(new Wire(button.node[0], node5));
// 	wires.push(new Wire(notGate.node[0], node6));
// 	wires.push(new Wire(norGate.node[2], toggle3.node[0]));
// 	wires.push(new Wire(norGate.node[1], toggle4.node[0]));
// 	wires.push(new Wire(node5, light.node));
// }
