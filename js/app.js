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

import { Node, Wire, Switch, Button, NotGate, AndGate, OrGate, NandGate, NorGate, XorGate, XnorGate, Light } from './type.js';

export function create(list) {
	let wires = [];
	let elements = [];
	list.wire = wires;
	list.element = elements;

	let node = new Node(100, 100);
	elements.push(node);
	let node2 = new Node(300, 150);
	elements.push(node2);
	let node3 = new Node(400, 150);
	elements.push(node3);
	let node4 = new Node(350, 250);
	elements.push(node4);
	let node5 = new Node(550, 100);
	elements.push(node5);
	let node6 = new Node(350, 350);
	elements.push(node6);

	let toggle = new Switch(100, 500);
	elements.push(toggle);
	let toggle2 = new Switch(550, 450);
	elements.push(toggle2);
	let toggle3 = new Switch(550, 700);
	elements.push(toggle3);
	let toggle4 = new Switch(550, 600);
	elements.push(toggle4);

	let button = new Button(650, 250);
	elements.push(button);

	let notGate = new NotGate(250, 400);
	elements.push(notGate);
	let norGate = new XnorGate(700, 650);
	elements.push(norGate);

	let light = new Light(750, 100);
	elements.push(light);

	wires.push(new Wire(node, node2));
	wires.push(new Wire(node2, node3));
	wires.push(new Wire(node2, node4));
	wires.push(new Wire(node3, node4));
	wires.push(new Wire(node3, node5));
	wires.push(new Wire(node4, node6));
	wires.push(new Wire(toggle.node[0], notGate.node[1]));
	wires.push(new Wire(toggle2.node[0], node3));
	wires.push(new Wire(button.node[0], node5));
	wires.push(new Wire(notGate.node[0], node6));
	wires.push(new Wire(norGate.node[2], toggle3.node[0]));
	wires.push(new Wire(norGate.node[1], toggle4.node[0]));
	wires.push(new Wire(node5, light.node));
}
