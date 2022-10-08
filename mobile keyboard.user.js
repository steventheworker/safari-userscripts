// ==UserScript==
// @name         mobile keyboard shortcuts
// @namespace    github.com/steventheworker
// @version      0.1
// @description  add input, and redirect shortcuts sent to it (mobile only)
// @author       Steven G.
// @match        *://*/*
// @grant        none
// ==/UserScript==

const modifierBtns = { "^": "ctrl", "⌥": "opt", "⌘": "cmd" };
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
			bottom: 0;
			box-sizing: border-box;
			padding: 0.5rem;
			background: black;
		 }
		 .mkb-modifiers {
			position: absolute;
			bottom: 0;
			margin: 0.5rem;
			margin-left: 50%;
			width: 25%;
			height: 1.9rem;
		 }
		 .mkb-modifiers button {
			float: right;
			width: 33%;
			height: 100%;
			background: black;
			color: white;
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
let _input, _container; //dom references
const isShowing = () => _container.style.display !== "none";
function toggleMKB() {
	const willShow = !isShowing();
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
function getModifierObj() {
	const modObj = {};
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
	el.onblur = toggleMKB;
	el.setAttribute("autocomplete", "off");
	el.onkeyup = function (e) {
		el.blur();
		triggerKeyDown(e.key, getModifierObj());
		if (e.key !== "/") toggleMKB(); // don't let MKB steal the focus ("/" used to focus an input (AutoScroll.user.js))
		setTimeout(() => (this.value = ""), 167);
	};
	return el;
}
function $modifierBtns() {
	const el = doc.createElement("div");
	el.classList.add("mkb-modifiers");
	for (const label in modifierBtns) {
		const btn = doc.createElement("button");
		btn.innerHTML = label;
		btn.addEventListener("click", (e) => {
			if (!btn.classList.contains("_modSelected"))
				btn.classList.add("_modSelected");
			else btn.classList.remove("_modSelected");
		});
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
	addStyleSheet();
	_container = $container();
	_container.style.display = "none";
	bod.appendChild(_container);
	// _container.style.display = "block"; // # force show on page load
	listenGlobalEvents();
})();

/* triggering keys */
function triggerKeyDown(key, modifiers = {}) {
	const keyCode = key.charCodeAt(0);
	const ev = new KeyboardEvent("keydown", {
		altKey: modifiers.alt || modifiers.opt ? true : false,
		bubbles: true,
		cancelBubble: false,
		cancelable: false,
		charCode: keyCode,
		code: key,
		composed: true,
		ctrlKey: modifiers.ctrl ? true : false,
		currentTarget: null,
		defaultPrevented: true,
		detail: 0,
		eventPhase: 0,
		isComposing: false,
		isTrusted: true,
		key,
		keyCode,
		location: 0,
		metaKey: modifiers.meta || modifiers.cmd ? true : false,
		repeat: false,
		returnValue: false,
		shiftKey: key === key.toUpperCase() ? true : false,
		type: "keydown",
		which: keyCode,
	});
	document.body.dispatchEvent(ev);
}
