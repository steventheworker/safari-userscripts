// ==UserScript==
// @name         askubuntu - accept cookies
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  remove accept cookies popup
// @author       steventheworker
// @grant        none
// @match        https://askubuntu.com/*

// ==/UserScript==

(function () {
	"use strict";

	// remove accept cookies popup
	document.querySelector(".js-consent-banner").remove();
})();
