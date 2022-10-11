//config
// ==UserScript==
// @name         Config (Globals) / Debugging
// @namespace    github.com/steventheworker
// @version      0.1
// @description  High priority global userscript with debug helper functions
// @author       steventheworker
// @match        *://*/*
// @grant        none
// @priority     1
// @run-at       document-start
// ==/UserScript==

const DefaultConfig = {
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

// init fn (first fn to run)
function defineGlobals() {
	if (!window.win) window.win = window;
	else if (win.document !== window.document)
		alert("houston, we have an issue: @steventheworker/safari-userscripts");
	//search a site with shift + Letter (eg: append site:website.com to search query on search engines)
	win.site_dict = Config.site_dict;
	if (!win.doc) win.doc = document;
	//set bod (after doc ready (body isn't defined until DOMContentLoaded))
	if (doc.readyState !== "loading") win.bod = doc.body;
	else doc.addEventListener("DOMContentLoaded", () => (win.bod = doc.body));
	addGlobalFns();
}
// add global fn's to window
function addGlobalFns() {
	win.$isInput = $isInput;
	win.triggerKeyDown = triggerKeyDown;
}

/*
	settings UI (cmd + opt + ctrl + Comma)
*/
let settingsDrawn = false;
const loadConfig = () => Object.assign(Config, DefaultConfig);
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
function globalEvents() {
	//open settings with (cmd+opt+ctrl+Comma)
	win.addEventListener("keydown", (e) => {
		if (e.key === "," && e.metaKey && e.altKey && e.ctrlKey) openSettings();
	});
}

//userscript init
(function () {
	"use strict";
	loadConfig();
	defineGlobals();
	globalEvents();
})();

/*
	utilities fn's -  global fn dependencies
*/
/* triggering keys */
const KeyCodeDict = {" ": "Space", "Tab": "Tab", "`": "Backquote", "~": "Backquote", "-": "Minus", "_": "Minus", "=": "Equal", "+": "Equal", "Delete": "Delete", "Backspace": "Backspace", "[": "BracketLeft", "{": "BracketLeft", "]": "BracketLeft", "}": "BracketLeft", "\\": "Backslash", "|": "Backslash", ";": "Semicolon", ":": "Semicolon", "'": "Quote", "\"": "Quote", ",": "Comma", "<": "Comma", ".": "Period", ">": "Period", "/": "Slash", "?": "Slash", "ArrowLeft": "ArrowLeft", "ArrowUp": "ArrowUp", "ArrowRight": "ArrowRight", "ArrowDown": "ArrowDown" }; // prettier-ignore
const CharCodeDict = {" ": 32, "Tab": 9, "`": 192, "~": 192, "-": 173, "_": 173, "=": 61, "+": 61, "Delete": 46, "Backspace": 8, "[": 219, "{": 219, "]": 221, "}": 221, "\\": 220, "|": 220, ";": 59, ":": 59, "'": 222, "\"": 222, ",": 188, "<": 188, ".": 190, ">": 190, "/": 191, "?": 191, "ArrowLeft": 37, "ArrowUp": 38, "ArrowRight": 39, "ArrowDown": 40 }; // prettier-ignore
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
/* ... */

/*
	global fn's
*/
function triggerKeyDown(key, modifiers = {}) {
	console.log(key);
	const keyCode = getCharCode(key); // wrong for .,
	const ev = new KeyboardEvent("keydown", {
		altKey: modifiers.alt || modifiers.opt ? true : false,
		bubbles: true,
		cancelBubble: false,
		cancelable: true,
		charCode: keyCode,
		code: getKeyCode(key),
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
	(lastActiveEl && lastActiveEl !== doc.activeElement
		? lastActiveEl
		: document.body
	).dispatchEvent(ev);
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
