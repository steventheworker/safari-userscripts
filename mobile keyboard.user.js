// ==UserScript==
// @name         mobile keyboard shortcuts
// @namespace    github.com/steventheworker
// @version      0.1
// @description  add input, and redirect shortcuts sent to it (mobile only)
// @author       Steven G.
// @match        *://*/*
// @grant        none
// ==/UserScript==

const namedKeys = ["Enter", "Tab", "Delete", "Backspace"];
const modifierBtns = { "⌘": "cmd", "⌥": "opt", "^": "ctrl", shift: "shift" };
const lowerCaseDict = ["`", "-", "=", "[", "]", "\\", ";", "'", ",", ".", "/", " ", "Enter", "Tab", "Delete", "Backspace"]; // prettier-ignore
// const upperCaseDict = ["~", "_", "+", "{", "}", "|", ":", '"', "<", ">", "?", " ", "Enter", "Tab", "Delete", "Backspace"]; // prettier-ignore

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
	mkb (mobile keyboard)
*/
let _input, _container, lastActiveEl; //dom references
const isShowing = () => _container.style.display !== "none";
function toggleMKB() {
	const willShow = !isShowing();
	if (willShow) {
		// if (doc.activeElement !== _input)
		lastActiveEl = doc.activeElement;
	}
	_container.style.display = willShow ? "block" : "none";
	_input[willShow ? "focus" : "blur"]();
}
function listenGlobalEvents() {
	win.addEventListener("touchstart", (e) => {
		if (e.touches.length >= 3) {
			toggleMKB();
			e.preventDefault();
		}
	});
}
function getModifierObj(e) {
	const modObj = {};
	//determine if shifted char
	if (e.code.startsWith("Digit"))
		modObj.shift = e.code.slice(-1) === e.key ? false : true;
	else if (e.code.startsWith("Key"))
		modObj.shift = e.key.toUpperCase() === e.key ? true : false;
	else modObj.shift = lowerCaseDict.indexOf(e.key) === -1 ? true : false;
	if (e.shiftKey) modObj.shift = true;

	//other modifiers
	const btnsSelected = Array.from(doc.getElementsByClassName("_modSelected"));
	btnsSelected.forEach((el, i) => {
		modObj[modifierBtns[el.innerHTML]] = true;
		el.classList.remove("_modSelected");
	});
	return modObj;
}
function $input() {
	const el = doc.createElement("input");
	el.classList.add("mkb-input");
	el.placeholder = "Enter a shortcut...";
	el.addEventListener("blur", toggleMKB);
	el.addEventListener("keyup", (e) => {
		if (e.key === "Shift") return;
		el.blur();
		if (lastActiveEl && lastActiveEl.nodeName === "INPUT")
			lastActiveEl.focus();
		console.log(doc.activeElement);
		const mods = getModifierObj(e);
		//key casing:  key combo's w/ modifiers don't trigger unless lowercase...
		triggerKeyDown(
			(mods.cmd || mods.opt || mods.ctrl) &&
				namedKeys.indexOf(e.key) === -1
				? e.key.toLowerCase()
				: (mods.shift && e.key.toUpperCase()) || e.key,
			mods
		);
		if (e.key !== "/") toggleMKB(); // don't let MKB steal the focus ("/" used to focus an input (AutoScroll.user.js))
		setTimeout(() => (el.value = ""), 167);
	});
	return el;
}
function $modifierBtns() {
	const el = doc.createElement("div");
	el.classList.add("mkb-modifiers");
	for (const label in modifierBtns) {
		const btn = doc.createElement("button");
		btn.innerHTML = label;
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

/* init */
(function () {
	("use strict");
	console.log("⌨️💪📱");
	win.toggleMKB = toggleMKB;
	addStyleSheet();
	_container = $container();
	_container.style.display = "none";
	bod.appendChild(_container);
	listenGlobalEvents();
	setTimeout(() => toggleMKB(), 2000); // # force show on page load
})();

/* triggering keys */
function triggerKeyDown(key, modifiers = {}) {
	const keyCode = key.charCodeAt(0);
	const ev = new KeyboardEvent("keydown", {
		altKey: modifiers.alt || modifiers.opt ? true : false,
		bubbles: true,
		cancelBubble: false,
		cancelable: true,
		charCode: keyCode,
		code: isNaN(key) ? "Key" + key.toUpperCase() : "Digit" + key,
		composed: true,
		ctrlKey: modifiers.ctrl ? true : false,
		currentTarget: lastActiveEl || null,
		defaultPrevented: true,
		detail: 0,
		eventPhase: 0,
		isComposing: true,
		isTrusted: true,
		key,
		keyCode,
		location: 0,
		metaKey: modifiers.meta || modifiers.cmd ? true : false,
		repeat: false,
		returnValue: false,
		shiftKey: modifiers.shift ? true : false,
		type: "keydown",
		which: keyCode,
	});
	(lastActiveEl !== doc.activeElement
		? lastActiveEl
		: document.body
	).dispatchEvent(ev);
}
