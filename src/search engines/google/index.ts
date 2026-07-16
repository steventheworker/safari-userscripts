// ==UserScript==
// @name         https://google.com/* - home / search results / etc.
// @namespace    https://google.com/
// @version      0.1
// @description  prev result, next result, remove chrome ad, shift+I => Images (hotkey), cmd+shift+y = youtube query, YMWDH etc.
// @author       steventheworker
// @icon         https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png
// @include      /^https?:\/\/(www\.)?google\.(com|net|de|ru|co\.uk)\/.*$/
// @grant        none
// ==/UserScript==

import { initPage, addStylesheet, addEventListeners } from "./common";
(function () {
	console.log(`google userscript started`);
	addStylesheet();
	setTimeout(() => {
		addEventListeners();
		initPage();
	}, 500);
})();
