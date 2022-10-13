//config
// ==UserScript==
// @name         Config (Globals) / Debugging
// @namespace    github.com/steventheworker
// @version      0.1
// @description  Highest priority global userscript with global variables, debug / helper functions
// @author       steventheworker
// @match        *://*/*
// @grant        none
// @priority     1
// @weight		  999
// @run-at       document-start
// ==/UserScript==

const DefaultConfig = {
	ControlPanel: {
		shortcut: ["ctrl", "opt", "cmd", ","], //  AKA ["ctrl", "alt", "meta", ","]       OR      CTRL + ALT + META + ,   AKA   CTRL + OPT + CMD + ,
	},
	MKB: {
		shortcut: ["ctrl", "opt", "cmd", "k"],
	},
	site_dict: {
		A: "apple.stackexchange.com",
		R: "reddit.com",
		Q: "quora.com",
		T: "twitter.com",
		S: "stackoverflow.com",
		U: "unix.stackexchange.com",
	},
};

const Config = {}; //todo: somehow load config from localStorage? cloud? drive?
const loadConfig = () => Object.assign(Config, DefaultConfig);
// keyboard constants / MKB definitions
const CONVERTWEBMODS = {cmd: "meta", meta: "meta", opt: "alt", alt: "alt", ctrl: "ctrl", shift: "shift"}; // prettier-ignore
const CONVERTMACMODS = {cmd: "cmd", meta: "cmd", opt: "opt", alt: "opt", ctrl: "ctrl", shift: "shift"}; // prettier-ignore
const KeyCodeDict = {"Escape": "Escape", "`": "Backquote", "~": "Backquote", "Tab": "Tab", " ": "Space", "-": "Minus", "_": "Minus", "=": "Equal", "+": "Equal", "Delete": "Delete", "Backspace": "Backspace", "[": "BracketLeft", "{": "BracketLeft", "]": "BracketLeft", "}": "BracketLeft", "\\": "Backslash", "|": "Backslash", ";": "Semicolon", ":": "Semicolon", "'": "Quote", "\"": "Quote", ",": "Comma", "<": "Comma", ".": "Period", ">": "Period", "/": "Slash", "?": "Slash", "ArrowLeft": "ArrowLeft", "ArrowUp": "ArrowUp", "ArrowRight": "ArrowRight", "ArrowDown": "ArrowDown" }; // prettier-ignore
const CharCodeDict = {"Escape": 27, "`": 192, "~": 192, "Tab": 9, " ": 32, "-": 173, "_": 173, "=": 61, "+": 61, "Delete": 46, "Backspace": 8, "[": 219, "{": 219, "]": 221, "}": 221, "\\": 220, "|": 220, ";": 59, ":": 59, "'": 222, "\"": 222, ",": 188, "<": 188, ".": 190, ">": 190, "/": 191, "?": 191, "ArrowLeft": 37, "ArrowUp": 38, "ArrowRight": 39, "ArrowDown": 40}; // prettier-ignore
let settingsDrawn = false;

// add global fn's to window
function addGlobalFns() {
	win.onPageLoaded = onPageLoaded;
	win.NSLog = (...a) => win.console.log.apply(null, a); // easier to autocomplete nickname
	win.$isInput = $isInput; // is? input, textarea, div[contenteditable=true]
	win.triggerKeyDown = triggerKeyDown; // used to remap keys / sending keyboard shortcuts on mobile (AKA mobile keyboarding)
	win.triggerKeyUp = triggerKeyUp;
	win.triggerKeyPress = triggerKeyPress;
	win.isShortcut = isShortcut; // check if event triggers a shortcut (w/ path format (eg: "MKB.shortcut" => Config.MKB.shortcut ))
}
// init fn (first fn to run)
function defineGlobals() {
	let _win = window;
	// try { // iframes - make all windows target the top window
	// 	_win = window.self !== window.top ? window.top : window;
	// } catch (e) {
	// 	// Browsers can block access to window.top due to same origin policy. IE bugs also take place. Here's the working code:
	// 	_win = window;
	// }
	if (window !== _win) return; // if (iframe && tarWin === topmost) break all iframe userscripts (w/o globals)
	window.win = _win;
	window.doc = win.document;
	if (!win.win) win.win = win;
	if (!win.doc) win.doc = win.document;
	//define constants
	loadConfig();
	//search a site with shift + Letter (eg: append site:website.com to search query on search engines)
	win.site_dict = Config.site_dict;
	//set bod (after doc ready (body isn't defined until DOMContentLoaded))
	onPageLoaded(() => {
		window.bod = doc.body;
		win.bod = doc.body;
	});
	addGlobalFns();
}

/*
	Control Panel UI (cmd + opt + ctrl + Comma)
*/
function settingsContents() {
	const container = doc.createElement("div");
	//todo: container.append setting 1.. setting 2.. etc...
	return container;
}
function settingsCloseBtn() {
	const container = doc.createElement("span");
	container.appendChild(doc.createTextNode("x"));
	container.style =
		"color: red; font-weight: bold; cursor: pointer; position: absolute; margin-top: -0.5em; margin-left: -0.25em; font-size: 1.5em; text-shadow: 0 0 2px black";
	container.addEventListener("click", toggleSettings);
	return container;
}
function drawSettings() {
	settingsDrawn = true;
	const settingsContainer = doc.createElement("div");
	settingsContainer.style =
		"display: block; position: fixed; top: 50%; left: 50%; margin-left: -175px; margin-top: -175px; width: 350px; height: 350px; outline: 1px solid red; background: rgba(0, 255, 255, 0.5); z-index: 2147483645;";
	settingsContainer.id = "dotUserSettingsContainer";
	const relativeContainer = doc.createElement("div");
	relativeContainer.style = "position: relative; width: 100%; height: 100%;";
	relativeContainer.appendChild(settingsCloseBtn());
	relativeContainer.appendChild(settingsContents());
	settingsContainer.appendChild(relativeContainer);
	bod.appendChild(settingsContainer);
}
const toggleSettings = () =>
	(doc.getElementById("dotUserSettingsContainer").style.display =
		doc.getElementById("dotUserSettingsContainer").style.display === "block"
			? "none"
			: "block");
function openSettings() {
	if (settingsDrawn) return toggleSettings();
	drawSettings();
}

/*
	global event listeners
*/
const onPageLoaded = (cb) => doc.readyState !== "loading" ? cb() : doc.addEventListener("DOMContentLoaded", cb); // prettier-ignore
function globalEvents() {
	//open settings with (cmd+opt+ctrl+Comma)
	win.addEventListener("keydown", (e) => {
		if (isShortcut(e, "ControlPanel.shortcut")) openSettings();
	});
}

/*
	utilities fn's -  global fn dependencies
*/
/* triggering keys */
function getKeyCode(key) {
	const dict = KeyCodeDict[key];
	if (dict) return dict;
	return isNaN(key) ? "Key" + key.toUpperCase() : "Digit" + key;
}
function getCharCode(key) {
	const dict = CharCodeDict[key];
	if (dict) return dict;
	return key.charCodeAt(0);
}

/*
	global fn's
*/
const triggerKeyUp = (...a) => triggerKeyDown.apply(null, [...a, true]);
const triggerKeyPress = (...a) => {
	triggerKeyDown.apply(null, a);
	triggerKeyUp.apply(null, a);
};
function triggerKeyDown(key, modifiers = {}) {
	const type = arguments[2] ? "keyup" : "keydown";
	const tar = modifiers.target || win.lastActiveEl;
	const keyCode = getCharCode(key); // wrong for .,
	const ev = new KeyboardEvent(type, {
		altKey: modifiers.alt || modifiers.opt ? true : false,
		bubbles: true,
		cancelBubble: false,
		cancelable: true,
		charCode: keyCode,
		code: getKeyCode(key),
		composed: true,
		ctrlKey: modifiers.ctrl ? true : false,
		currentTarget: tar || null,
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
		type,
		which: keyCode,
	});
	if (modifiers.target) return tar.dispatchEvent(ev); // force a target
	(tar && tar !== doc.activeElement ? tar : document.body).dispatchEvent(ev);
}
function $isInput(el) {
	const nn = el.nodeName;
	if (
		nn === "INPUT" ||
		nn === "TEXTAREA" ||
		(nn === "DIV" && el.contentEditable === "true")
	)
		return true;
	return false;
}
function isShortcut(e, path, virtualMods = {}) {
	let shortcut = readConfig(path);
	if (!shortcut) return;
	shortcut = [...shortcut]; // create copy, don't modify reference
	return (
		e.key === shortcut.pop() && // shortcuts begin with modifier keys (last in shortcut is always the e.key)
		!shortcut.filter((modifier, i) =>
			e[CONVERTWEBMODS[modifier] + "Key"] ||
			virtualMods[CONVERTMACMODS[modifier]]
				? false
				: true
		).length
	);
}

/* miscellaneous */
function objKeyPath(obj = {}, keyPath, val = null, remove) {
	const paths = keyPath.split(".");
	const numPaths = paths.length;
	for (let i in paths) {
		const p = paths[i];
		if (i == paths.length - 1) {
			if (remove) delete obj[p];
			else if (val) obj[p] = val;
		}
		if (obj) obj = obj[p];
	}
	return obj;
}
const readKeyPath = (obj, keyPath) => objKeyPath.apply(null, [obj, keyPath]);
const setKeyPath = (obj = {}, keyPath, val) =>
	objKeyPath.apply(null, ...arguments);
const deleteKeyPath = (obj, keyPath) =>
	objKeyPath.apply(null, [...arguments, null, true]);
const readConfig = (keyPath) => readKeyPath(Config, keyPath);
const setConfig = (keyPath, val) => setKeyPath(Config, keyPath, val);
const deleteConfig = (keyPath) => deleteKeyPath(Config, keyPath, null, true);

//userscript init
(function () {
	"use strict";
	defineGlobals();
	loadConfig();
	globalEvents();
})();
