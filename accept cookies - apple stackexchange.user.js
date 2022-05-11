// ==UserScript==
// @name         apple/unix stackexchange - accept cookies
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  remove accept cookies popup
// @author       steventheworker
// @grant        none
// @match        https://apple.stackexchange.com/*
// @match        https://unix.stackexchange.com/*

// ==/UserScript==

(function () {
	"use strict";

	// remove accept cookies popup
	document.querySelector(".js-consent-banner").remove();
})();
