import { html } from 'https://raw.githack.com/typable/html-build/main/render.js';
import GameEngine from './deps.js';
import { Electron } from './app.js';
import * as Components from './type.js';

const app = new Electron();
document.body.append(app.canvas);
app.start();
let mode;

document.addEventListener('mouseup', () => {
	if(app.state.mode === 'move' && sidebar.style.zIndex === '-1') {
		app.state.mode = mode;
	}
	sidebar.style.zIndex = '1';
});

document.addEventListener('keydown', event => {
	for(const tool of tools) {
		if(event.code === 'KeyV') {
			if(tool === view) {
				tools.forEach(n => n.classList.remove('tool--active'));
				tool.classList.add('tool--active');
				app.state.mode = 'view';
			}
		}
		if(event.code === 'KeyM') {
			if(tool === move) {
				tools.forEach(n => n.classList.remove('tool--active'));
				tool.classList.add('tool--active');
				app.state.mode = 'move';
			}
		}
	}
});

const SelectCategory = ({label, components}) => {
	return html`<ul class="component-category">
		<span class="component-category__label">${label}</span>
		${components}
	</ul>`;
};

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
		mode = app.state.mode;
		if(mode === 'view') {
			app.state.mode = 'move';
		}
	}
	const onMouseMove = event => {
		if(down) {
			const {x, y} = app.view.get(event.pageX, event.pageY);
			const element = new type(x, y);
			if(element.interactive !== undefined) {
				element.interactive = false;
			}
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
			sidebar.style.zIndex = '-1';
		}
	}
	return html`<li class="component-item" onclick=${onClick} onmousedown=${onMouseDown} onmousemove=${onMouseMove}>
		<span>${type.name}</span>
		<i class="ico">bookmark_border</i>
		<i class="ico">calendar_view_month</i>
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
