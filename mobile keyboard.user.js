// ==UserScript==
// @name         mobile keyboard shortcuts
// @namespace    github.com/steventheworker
// @version      0.1
// @description  add input, and redirect shortcuts sent to it (mobile only)
// @author       Steven G.
// @match        *://*/*
// @grant        none
// ==/UserScript==

//helpers / boilerplate
const doc = document,
	win = window,
	bod = doc.body;
function addStyleSheet() {
	const css = `
		 /* desktop virtual status bar */
		 #virtualStatusBar {
			 position: fixed;
			 bottom: 5px;
			 left: 5px;
			 z-index: 2147483646;
			 font-family: Helvetica !important;
			 font-size: 13px !important;
			 box-sizing: border-box !important;
			 padding: 4px !important;
			 color: #b6b6b6 !important;
			 background-color: rgba(44,44,44, 0.95) !important;
			 white-space: nowrap;
			 opacity: 1;
			 transition: opacity ease-in-out 0.333s;
			 display: none;
			 pointer-events: none;
		 }
		 #virtualStatusBar.rightVSB {left: auto;right: 5px;}


		 /* mobile keyboard */
       #mkb-container {
			 position: fixed;
			 bottom: 0;
			 left: 0;
			 width: 100%;
			 height: 100%;
			 z-index: 2147483647;
		 }
		 .mkb-input {
			font-size: 1.9rem;
			width: 50%;
			margin-left: 25%;
			position: absolute;
			bottom: 0;
			box-sizing: border-box;
			padding: 0.5rem;
		 }
		 .mkb-overlay {
			 width: 100%;
			 height: 100%;
			 background: rgba(255, 0, 0, 0.0333);
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
function $input() {
	const el = doc.createElement("input");
	el.classList.add("mkb-input");
	el.placeholder = "Enter a shortcut...";
	el.onblur = toggleMKB;
	el.setAttribute("autocomplete", "off");
	el.onkeyup = function (e) {
		el.blur();
		triggerKeyDown(e.key);
		if (e.key !== "/") toggleMKB(); // don't let MKB steal the focus ("/" used to focus an input (AutoScroll.user.js))
		setTimeout(() => (this.value = ""), 167);
	};
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
	bod.appendChild($virtualStatusBar());
	listenGlobalEvents();
})();

/* virtual status bar */
function $virtualStatusBar() {
	const el = doc.createElement("div");
	el.id = "virtualStatusBar";
	const maxRecursion = 7;
	function setTextFromLink(tar, currentRecursion) {
		if (tar && tar.nodeName === "A") {
			el.style.display = "block";
			el.style.opacity = 1;
			el.innerHTML = tar.href;
			return true;
		}
		if (currentRecursion == maxRecursion) return;
		if (tar.parentNode)
			return setTextFromLink(tar.parentNode, currentRecursion + 1);
	}
	win.addEventListener("mouseover", (e) => {
		if (!setTextFromLink(e.target, 1))
			el.style.opacity = 0; //hide statusbar
		else {
			if (
				e.pageX >= el.offsetLeft &&
				e.pageX <= el.offsetLeft + el.clientWidth &&
				e.pageY - win.scrollY >= el.offsetTop &&
				e.pageY - win.scrollY <= el.offsetTop + el.clientHeight
			) {
				//mouse is on statusbar
				el.classList.add("rightVSB"); //statusbar on right side
			} else el.classList.remove("rightVSB");
		}
	});
	el.addEventListener("transitionend", () => {
		if (el.style.opacity === 0 && el.style.display === "block") {
			el.style.display = "";
			el.style.opacity = "";
		}
	});
	return el;
}

/* triggering keys */
function triggerKeyDown(key, modifiers = {}) {
	const keyCode = key.charCodeAt(0);
	const ev = new KeyboardEvent("keydown", {
		altKey: modifiers.alt || modifiers.opt ? true : false,
		bubbles: true,
		cancelBubble: false,
		cancelable: true,
		charCode: 0,
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
		shiftKey: modifiers.shift ? true : false,
		type: "keydown",
		which: keyCode,
	});
	document.body.dispatchEvent(ev);
}
