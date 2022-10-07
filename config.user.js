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

function defineGlobals() {
	if (!window.win) window.win = window;
	else if (win.document !== window.document)
		alert("houston, we have an issue: @steventheworker/safari-userscripts");
	//search a site with shift + Letter (eg: append site:website.com to search query on search engines)
	win.site_dict = {
		A: "apple.stackexchange.com",
		R: "reddit.com",
		Q: "quora.com",
		T: "twitter.com",
		S: "stackoverflow.com",
		U: "unix.stackexchange.com",
	};
	if (!win.doc) win.doc = document;
	//set bod (after doc ready (body isn't defined until DOMContentLoaded))
	if (doc.readyState !== "loading") win.bod = doc.body;
	else doc.addEventListener("DOMContentLoaded", () => (win.bod = doc.body));

	//helper fn's
	win.isInput = isInput;
}

let settingsDrawn = false;
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

function listenKeys() {
	//open settings with cmd+opt+ctrl+Comma
	window.addEventListener("keydown", (e) => {
		if (e.key === "," && e.metaKey && e.altKey && e.ctrlKey) openSettings();
	});
}
//init
(function () {
	"use strict";
	defineGlobals();
	listenKeys();
})();

//helper fn's
function isInput(el) {
	const nn = el.nodeName;
	if (
		nn === "INPUT" ||
		nn === "TEXTAREA" ||
		(nn === "DIV" && el.contentEditable)
	)
		return true;
	return false;
}
