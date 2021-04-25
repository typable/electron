import { Electron } from './app.js';

const app = new Electron();
document.body.append(app.canvas);
app.start();

import { html } from 'https://git.typable.dev/std/js/render.js';

const SelectCategory = ({label, components}) => {
	return html`<ul class="component-category">
		<span class="component-category__label">${label}</span>
		${components}
	</ul>`;
};

const SelectItem = type => {
	const onClick = () => {
		const element = new type(app.width / 2, app.height / 2);
		app.groups.element.add(element);
	};
	return html`<li class="component-item" onclick=${onClick}>
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
