// ==UserScript==
// @name         mobile keyboard shortcuts
// @namespace    github.com/steventheworker
// @version      0.1
// @description  add input, and redirect shortcuts sent to it (mobile only)
// @author       Steven G.
// @match        *://*/*
// @grant        none
// ==/UserScript==

const modifierBtns = { shift: "shift", "^": "ctrl", "⌥": "opt", "⌘": "cmd" };
// const lowerCaseDict = ["`", "-", "=", "[", "]", "\\", ";", "'", ",", ".", "/"]; // prettier-ignore
const upperCaseDict = ["~", "_", "+", "{", "}", "|", ":", '"', "<", ">", "?"]; // prettier-ignore
const namedKeys = [" ", "Enter", "Tab", "Delete", "Backspace", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Escape"]; // prettier-ignore
let _input, _container, h0, scrollYWhenMKBOpened, lastScrollY, keyboardHeight; //dom references
const iosBottomGreynessBuffer = 88;

function addStyleSheet() {
	const css = `
		 /* mobile keyboard */
       #mkb-container {
			 position: fixed !important;
			 top: 0;
			 left: 0;
			 width: 100%;
			 height: 100vh;
			 z-index: 2147483647;
		 }
		 .mkb-overlay {
			 width: 100%;
			 height: 100%;
			 background: rgba(0, 127.5, 127.5, 0.3);
		 }
		 .mkb-input {
			font-size: 1.9rem;
			width: 50%;
			margin-left: 25%;
			position: absolute;
			top: 25%;
			box-sizing: border-box;
			padding: 0.5rem;
			background: black;
			color: white;
		 }

		 /* Shift Ctrl Opt Cmd  &  key buttons (Esc, Tab, F1-F12) */
		 .mkb-modifiers, .mkb-keyBtns {
			position: absolute;
			top: 25%;
			margin: 0.5rem;
			margin-left: 50%;
			width: 25%;
			height: 1.9rem;
			text-align: right;
		 }
		 .mkb-modifiers button, .mkb-keyBtns button {
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
		 .mkb-modifiers button:last-child, .mkb-keyBtns button { /* shift key btn */
			padding-left: 0.75em;
			text-align: left;
		 }
		 ._modSelected {background: darkgreen !important;}
		 .mkb-keyBtns {
			top: calc(25% - 1.9rem);
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
	win.addEventListener("resize", (e) => {
		const kbH = $isInput(doc.activeElement) ? keyboardHeight : 0;
		h0 = win.visualViewport.height + kbH;
	});
	win.addEventListener("scroll", (e) => {
		if (!isShowing() || keyboardHeight === null) return;
		console.log(_container.style.top);
		let top = window.scrollY - lastScrollY || scrollYWhenMKBOpened;
		const h = parseFloat(_container.style.height);
		lastScrollY = window.scrollY;
		if (top < 0) {
			// console.log("going up");
			if (top <= -h) top = -h;
		} else {
			// console.log("Going down");
			top = h - iosBottomGreynessBuffer;
			if (top >= h) top = h;
			if (win.visualViewport.width > h0)
				top = win.visualViewport.height + iosBottomGreynessBuffer + 30; //bottom addressbar is hidden
			console.log(top);
		}
		if (!top) return;
		_container.style.top = top + "px";

		// let diff = 0;
		// _container.style.top = diff + "px";
	});
}
function toggleMKB() {
	const willShow = !isShowing();
	if (willShow) {
		adjustToKeyboard();
		if (doc.activeElement !== _input) lastActiveEl = doc.activeElement;
		_container.style.top = "0px";
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
		console.log(e);
		if (isShortcut(e, "MKB.shortcut", mods)) return toggleMKB();
		el.blur(); //triggers toggleMKB (without endless loop)
		if (lastActiveEl && lastActiveEl.nodeName === "INPUT")
			lastActiveEl.focus();
		// console.log(doc.activeElement);
		//key casing:  key combo's w/ modifiers don't trigger unless lowercase...
		const isNamedKey = !(namedKeys.indexOf(e.key) === -1);
		triggerKeyPress(
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
function addMKNKeyBtnListeners(btn) {
	const btnDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		btn.style.background = "darkred";
	};
	const btnUp = (e) => {
		btn.style.background = "";
		e.preventDefault();
		e.stopPropagation();
		triggerKeyPress(btn.dataset.key, getModifierObj());
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
		btn.appendChild(doc.createTextNode(label));
		addMKNModBtnListeners(btn);
		el.appendChild(btn);
	}
	return el;
}
function makeKeyBtn(key) {
	const btn = doc.createElement("button");
	btn.appendChild(doc.createTextNode(key.slice(0, 3).toLowerCase()));
	btn.setAttribute("data-key", key);
	addMKNKeyBtnListeners(btn);
	return btn;
}
function $keyBtns() {
	const el = doc.createElement("div");
	el.classList.add("mkb-keyBtns");
	el.appendChild(makeKeyBtn("Escape"));
	el.appendChild(makeKeyBtn("Tab"));
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
	el.appendChild($keyBtns());
	return el;
}

/*
	utilities
*/
const isShowing = () => _container.style.display !== "none";
function getModifierObj(e) {
	const modObj = {};
	if (e) {
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
		if (e.ctrlKey) modObj.ctrl = true;
		if (e.altKey) modObj.opt = true;
		if (e.metaKey) modObj.cmd = true;
	}
	//button modifiers
	Array.from(doc.getElementsByClassName("_modSelected")).forEach((el, i) => {
		modObj[modifierBtns[el.innerHTML]] = true;
		el.classList.remove("_modSelected");
	});
	return modObj;
}
function adjustContainer(dH) {
	const newH = h0 - dH;
	_container.style.height = newH + "px";
}
function adjustToKeyboard() {
	setTimeout(() => {
		const dH = h0 - win.visualViewport.height;
		if (dH) adjustContainer(dH);
		keyboardHeight = dH || null;
		scrollYWhenMKBOpened = window.scrollY;
		lastScrollY = window.scrollY;
	}, 750);
}

/* userscript init */
(function () {
	("use strict");
	console.log("⌨️💪📱");
	onPageLoaded(() => {
		addStyleSheet();
		_container = $container();
		_container.style.display = "none";
		bod.appendChild(_container);
		listenGlobalEvents();
		let maxWrong = 0;
		(function pollForHeight() {
			const h1 = win.visualViewport.height;
			console.log(h0, h1, h1 - h0, maxWrong);
			const diff = h0 ? h1 - h0 : h1;
			h0 = h1;
			if (!diff) if (maxWrong++ == 2) return;
			setTimeout(pollForHeight, 100);
		})();
		// setTimeout(toggleMKB, 333); // reveal on page load
	});
})();
