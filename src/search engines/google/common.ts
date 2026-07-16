import * as Home from "./Home";
import * as Search from "./Search";

export const routes: { [key: string]: any } = {
	"/": Home,
	"/search": Search,
};
export function addStylesheet() {
	const style = doc.createElement("style");
	style.innerHTML = `
	form {position: relative;} /* first form = search container */
.g:hover a {color: #AA6600 !important;}
.g a {transition: color ease-in-out 333ms;}
.focusedResult {outline: 1px dashed black;}
.focusedResult a:visited {color: purple !important;}
.focusedResult a:hover {color: inehrit !important;}
`;
	const node = doc.createElement("p");
	bod.appendChild(node);
	node.after(style);
}

export function initPage() {
	routes[location.pathname].init();
}

export function addEventListeners() {
	bod.style.transition = "opacity 333ms ease-in-out";
	win.addEventListener("keydown", function (e) {
		return routes[location.pathname].keydown(e);
	});
	win.addEventListener("keyup", function (e) {
		return routes[location.pathname].keyup(e);
	});
	win.addEventListener("click", function (e) {
		return routes[location.pathname].click(e);
	});
	win.addEventListener("keypress", (e) => {
		return routes[location.pathname].keypress(e);
	});
}
