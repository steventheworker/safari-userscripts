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

//global definitions
if (!window.doc) window.doc = document;
window.site_dict = {
	A: "apple.stackexchange.com",
	R: "reddit.com",
	Q: "quora.com",
	T: "twitter.com",
	S: "stackoverflow.com",
	U: "unix.stackexchange.com",
};

//init
(function () {
	"use strict";
})();
