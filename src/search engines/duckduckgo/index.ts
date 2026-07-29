// ==UserScript==
// @name         https://duckduckgo.com/* - home / search results / etc.
// @namespace    https://duckduckgo.com/
// @version      0.1
// @description  prev result, next result, remove chrome ad, shift+I => Images (hotkey), cmd+shift+y = youtube query, YMWDH etc., (cmd+shift+g to open in google)
// @author       steventheworker
// @icon         https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png
// @match        https://duckduckgo.com/*
// @grant        none
// ==/UserScript==

import { addStylesheet } from "./addStylesheet";
import { initDesktop } from "./initDesktop";
import { addEventListeners } from "./events";

(function () {
	console.log(`duckduckgo userscript started`);
	addStylesheet();
	setTimeout(() => {
		addEventListeners();
		initDesktop();
	}, 500);
})();
