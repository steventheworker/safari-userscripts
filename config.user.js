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
}

let settingsDrawn = false;
function drawSettings() {
	settingsDrawn = true;
	const settingsContainer = doc.createElement("div");
	settingsContainer.style =
		"position: absolute; top: 50%; left: 50%; margin-left: -175px; margin-top: -175px; width: 350px; height: 350px; outline: 1px solid red; background: rgba(0, 255, 255, 0.5);";
	settingsContainer.id = "dotUserSettingsContainer";
	bod.appendChild(settingsContainer);
}
const showSettings = () =>
	(doc.getElementById("createElement").style.display = "block");
function openSettings() {
	if (settingsDrawn) return showSettings();
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
