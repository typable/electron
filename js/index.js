import { Electron } from './app.js';

const app = new Electron();
document.body.append(app.canvas);
app.start();

import { html } from 'https://git.typable.dev/std/js/render.js';
import * as Components from './type.js';

const sidebar = document.querySelector('.component-list');

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
		${type.name}
	</li>`;
};

const components = Object.values(Components).map(SelectItem);

const category = SelectCategory({
	label: 'Gate Components',
	components
});

sidebar.appendChild(category);
