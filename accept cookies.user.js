// ==UserScript==
// @name         accept cookies
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  remove accept cookies popup
// @author       steventheworker
// @grant        none
// @match        *://*/*
// ==/UserScript==

const jsConsentBannerMatches = {
	// @match        https://apple.stackexchange.com/*
	// @match        https://unix.stackexchange.com/*
	// @match        https://askubuntu.com/*
	// @match        https://stackoverflow.com/*
	// @match        https://superuser.com/*
	// @match        https://vi.stackexchange.com
	//https://vi.stackexchange.com
};

(function () {
	"use strict";

	// remove accept cookies popup
	document.getElementById("onetrust-consent-sdk")?.remove();
	document.getElementsByClassName("js-consent-banner")[0]?.remove();
})();
