// ==UserScript==
// @name         pagination - urbandictionary
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  remove accept cookies popup &&& pagination
// @author       steventheworker
// @grant        none
// @match        https://www.urbandictionary.com/*

// ==/UserScript==

// remove accept cookies popup (via polling)
const $cookie_popup = () => document.querySelector("#onetrust-consent-sdk");
function remove_cookie_popup() {
	const el = $cookie_popup();
	if (!el) return setTimeout(remove_cookie_popup, 200);
	el.remove();
}

//events
function addListeners() {
	window.addEventListener("keydown", function (e) {
		const nn = document.activeElement.nodeName;
		if (nn === "INPUT" || nn === "TEXTAREA") return;
		if (e.key === "ArrowRight" && !e.metaKey)
			document.querySelector("a[rel='next']").click();
		if (e.key === "ArrowLeft" && !e.metaKey)
			document.querySelector("a[rel='prev']").click();
	});
}

//init
(function () {
	"use strict";

	remove_cookie_popup();
	addListeners();
})();
