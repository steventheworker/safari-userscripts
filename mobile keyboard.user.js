// ==UserScript==
// @name         mobile keyboard shortcuts
// @namespace    github.com/steventheworker
// @version      0.1
// @description  add input, and redirect shortcuts sent to it (mobile only)
// @author       Steven G.
// @match        *://*/*
// @grant        none
// ==/UserScript==

const modifierBtns = { "⌘": "cmd", "⌥": "opt", "^": "ctrl", shift: "shift" };
// const lowerCaseDict = ["`", "-", "=", "[", "]", "\\", ";", "'", ",", ".", "/"]; // prettier-ignore
const upperCaseDict = ["~", "_", "+", "{", "}", "|", ":", '"', "<", ">", "?"]; // prettier-ignore
const namedKeys = [" ", "Enter", "Tab", "Delete", "Backspace", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Escape"]; // prettier-ignore
let _input, _container; //dom references
win.lastActiveEl = null; //used by triggerKeyDown (config.user.js)

function addStyleSheet() {
	const css = `
		 /* mobile keyboard */
       #mkb-container {
			 position: fixed;
			 bottom: 0;
			 left: 0;
			 width: 100%;
			 height: 100%;
			 z-index: 2147483647;
		 }
		 .mkb-overlay {
			 width: 100%;
			 height: 100%;
			 background: rgba(255, 0, 0, 0.0333);
		 }
		 .mkb-input {
			font-size: 1.9rem;
			width: 50%;
			margin-left: 25%;
			position: absolute;
			bottom: 25%;
			box-sizing: border-box;
			padding: 0.5rem;
			background: black;
			color: white;
		 }
		 .mkb-modifiers {
			position: absolute;
			bottom: 25%;
			margin: 0.5rem;
			margin-left: 50%;
			width: 25%;
			height: 1.9rem;
		 }
		 .mkb-modifiers button {
			float: right;
			width: 24%;
			margin: 0;
			margin-right: 0.5%;
			height: 100%;
			background: black;
			color: white;
			text-align: right;
			box-sizing: border-box;
			border: none;
			outline: 1px solid grey !important;
		 }
		 .mkb-modifiers button:last-child { /* shift key btn */
			padding-left: 0.75em;
			text-align: left;
		 }
		 ._modSelected {
			background: darkgreen !important;
		 }
   `,
		head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(css));
}

/*
	event listeners
*/
function listenGlobalEvents() {
	win.addEventListener("keydown", (e) => {
		if ($isInput(doc.activeElement)) return;
		if (isShortcut(e, "MKB.shortcut")) toggleMKB();
	});
	win.addEventListener("touchstart", (e) => {
		if (e.touches.length >= 3) {
			toggleMKB();
			e.preventDefault();
		}
	});
}
function toggleMKB() {
	const willShow = !isShowing();
	if (willShow) {
		if (doc.activeElement !== _input) lastActiveEl = doc.activeElement;
	}
	_container.style.display = willShow ? "block" : "none";
	// console.log("togglemkb", willShow);
	_input[willShow ? "focus" : "blur"]();
}
function addMKBListeners(el) {
	el.addEventListener("blur", toggleMKB);
	el.addEventListener("keydown", (e) => {
		if (
			e.key === "Shift" ||
			e.key === "Meta" ||
			e.key === "Alt" ||
			e.key === "Control"
		)
			return;
		const mods = getModifierObj(e);
		if (isShortcut(e, "MKB.shortcut", mods)) return toggleMKB();
		el.blur(); //triggers toggleMKB (without endless loop)
		if (lastActiveEl && lastActiveEl.nodeName === "INPUT")
			lastActiveEl.focus();
		// console.log(doc.activeElement);
		//key casing:  key combo's w/ modifiers don't trigger unless lowercase...
		const isNamedKey = !(namedKeys.indexOf(e.key) === -1);
		triggerKeyDown(
			(mods.cmd || mods.opt || mods.ctrl) && !isNamedKey
				? e.key.toLowerCase()
				: (mods.shift && !isNamedKey && e.key.toUpperCase()) || e.key,
			mods
		);
		//refocus MKB,  but don't let MKB steal the focus ("/" used to focus an input (AutoScroll.user.js))
		if (!(e.key === "/" && !mods.shift && !mods.ctrl && !mods.opt && !mods.cmd)) toggleMKB(); // prettier-ignore
		setTimeout(() => (el.value = ""), 167);
	});
	el.addEventListener("keyup", (e) => {});
}
function addMKNModBtnListeners(btn) {
	const btnDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};
	const btnUp = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!btn.classList.contains("_modSelected"))
			btn.classList.add("_modSelected");
		else btn.classList.remove("_modSelected");
	};
	btn.addEventListener("touchstart", btnDown);
	btn.addEventListener("touchend", btnUp);
	btn.addEventListener("mousedown", btnDown);
	btn.addEventListener("mouseup", btnUp);
}

/*
	UI
*/

function $input() {
	const el = doc.createElement("input");
	el.classList.add("mkb-input");
	el.placeholder = "Enter a shortcut...";
	addMKBListeners(el);
	return el;
}
function $modifierBtns() {
	const el = doc.createElement("div");
	el.classList.add("mkb-modifiers");
	for (const label in modifierBtns) {
		const btn = doc.createElement("button");
		btn.innerHTML = label;
		addMKNModBtnListeners(btn);
		el.appendChild(btn);
	}
	return el;
}
function $overlay() {
	const el = doc.createElement("div");
	el.classList.add("mkb-overlay");
	return el;
}
function $container() {
	const el = doc.createElement("div");
	el.id = "mkb-container";
	_input = $input();
	el.appendChild($overlay());
	el.appendChild(_input);
	el.appendChild($modifierBtns());
	return el;
}

/*
	utilities
*/
const isShowing = () => _container.style.display !== "none";
function getModifierObj(e) {
	const modObj = {};
	//determine if shifted char
	if (e.code.startsWith("Digit"))
		modObj.shift = e.code.slice(-1) === e.key ? false : true;
	else if (e.code.startsWith("Key"))
		modObj.shift = e.key.toUpperCase() === e.key ? true : false;
	else
		modObj.shift =
			upperCaseDict.indexOf(e.key) !== -1 &&
			namedKeys.indexOf(e.key) === -1;
	if (e.shiftKey) modObj.shift = true;

	//other modifiers
	const btnsSelected = Array.from(doc.getElementsByClassName("_modSelected"));
	btnsSelected.forEach((el, i) => {
		modObj[modifierBtns[el.innerHTML]] = true;
		el.classList.remove("_modSelected");
	});
	return modObj;
}

/* userscript init */
(function () {
	("use strict");
	console.log("⌨️💪📱");
	addStyleSheet();
	_container = $container();
	_container.style.display = "none";
	bod.appendChild(_container);
	listenGlobalEvents();
})();
