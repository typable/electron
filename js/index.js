import { Electron } from './app.js';

const app = new Electron();
document.body.append(app.canvas);
app.start();

import { html } from 'https://git.typable.dev/std/js/render.js';
import * as Components from './type.js';
import GameEngine from './deps.js';

const sidebar = document.querySelector('.component-list');

const SelectCategory = ({label, components}) => {
	return html`<ul class="component-category">
		<span class="component-category__label">${label}</span>
		${components}
	</ul>`;
};

document.addEventListener('mouseup', () => {
	sidebar.style.zIndex = "1";
});

const SelectItem = type => {
	let down = false;
	const onClick = () => {
		if(down) {
			const {x, y} = app.view.get(app.width / 2, app.height / 2);
			const element = new type(x, y);
			app.groups.element.add(element); 
		}
		down = false;
	};
	const onMouseDown = () => {
		down = true;
	}
	const onMouseMove = (event) => {
		if(down) {
			const {x, y} = app.view.get(event.pageX, event.pageY);
			const element = new type(x, y);
			element.interactive = false;
			element.draggable = true;
			if(element.shape instanceof GameEngine.Shape.Rect) {	
				element.offset = {
					x: -(element.shape.width / 2),
					y: -(element.shape.width / 2) 
				};
				element.nodes.forEach((node) => {
					let nodes_offset = {
						x: (x + (element.shape.width / 2)) - node.x,
						y: (y + (element.shape.width / 2)) - node.y
					};
					element.nodes_offset.push(nodes_offset);
				});
			}
			else {
				element.offset = {
					x: 0,
					y: 0
				};
				if(element.nodes) {
					element.nodes.forEach((node) => {
						let nodes_offset = {
							x: x - node.x,
							y: y - node.y
						};
						element.nodes_offset.push(nodes_offset);
					});
				}
			}

			app.groups.element.add(element);
			down = false;
			sidebar.style.zIndex = "-1";
		}
	}
	return html`<li class="component-item" onclick=${onClick} onmousedown=${onMouseDown} onmousemove=${onMouseMove}>
		${type.name}
	</li>`;
};

const tools = document.querySelectorAll('.header__toolbar .tool');
const [view, move] = tools;

for(const tool of tools) {
	tool.addEventListener('click', function() {
		tools.forEach(n => n.classList.remove('tool--active'));
		if(tool === view) {
			tool.classList.add('tool--active');
			app.state.mode = 'view';
		}
		if(tool === move) {
			tool.classList.add('tool--active');
			app.state.mode = 'move';
		}
	});
}

const component = document.querySelector('.action-components');
const sidebar = document.querySelector('.component-list');

component.addEventListener('click', function() {
	component.classList.toggle('action--active');
	sidebar.classList.toggle('component-list--active');
});


import * as Components from './type.js';

const {Node, Button} = Components;

const interactive = SelectCategory({
	label: 'Interactive Components',
	components: [Node, Button].map(SelectItem)
})
sidebar.appendChild(interactive);

const {NOTGate, ANDGate, ORGate, NANDGate, NORGate, XORGate, XNORGate} = Components;

const gate = SelectCategory({
	label: 'Gate Components',
	components: [NOTGate, ANDGate, ORGate, NANDGate, NORGate, XORGate, XNORGate].map(SelectItem)
})
sidebar.appendChild(gate);

const {Light, Relais} = Components;

const other = SelectCategory({
	label: 'Other Components',
	components: [Light, Relais].map(SelectItem)
})
sidebar.appendChild(other);
