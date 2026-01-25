// ==UserScript==
// @name         REDDIT
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  T N O C B - top new old controversial best, auto disable safesearch, auto enable dark mode, remove mobile/incognito popups
// @author       steventheworker
// @grant        none
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png
// @match        https://www.reddit.com/*
// ==/UserScript==

import * as Style from "./style";
import * as ThreadShortcuts from "./thread-shortcuts";
import * as newReddit from "./newreddit-link";

function onload() {
	Style.addStylesheet();
	win.addEventListener("keydown", ThreadShortcuts.keydown);
	newReddit.addLink();
}
function init() {
	win.onPageLoaded(onload);
}
(function () {
	setTimeout(init, 1000);
})();
