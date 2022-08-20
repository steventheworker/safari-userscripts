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

//init
(function () {
	"use strict";
	defineGlobals();
})();
