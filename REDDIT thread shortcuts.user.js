// ==UserScript==
// @name         REDDIT thread shortcuts
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  T N O C B - top new old controversial best
// @author       steventheworker
// @grant        none
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png
// @match        https://www.reddit.com/r/*/comments/*

// ==/UserScript==

function addGlobalStyle(css) {
	//https://greasyfork.org/en/scripts/405073-wide-new-reddit-userscript
	var head, style;
	head = document.getElementsByTagName("head")[0];
	if (!head) {
		return;
	}
	style = document.createElement("style");
	style.type = "text/css";
	style.innerHTML = css;
	head.appendChild(style);
}

function menuClick(select) {
	//open menu, then click menu-item
	document.querySelector("button#CommentSort--SortPicker").click();
	Array.prototype.slice
		.call(document.querySelectorAll('div[role="menu"] button'))
		[select].click();
}

(function () {
	"use strict";
	addGlobalStyle(
		"._1OVBBWLtHoSPfGCRaPzpTf._3nSp9cdBpqL13CqjdMr2L_ { width: 90% !important;}"
	);
	addGlobalStyle("div { max-width: none !important; }");
	window.addEventListener("keydown", function (e) {
		const nn = document.activeElement.nodeName;
		if (
			nn === "INPUT" ||
			nn === "TEXTAREA" ||
			(nn == "DIV" && document.activeElement.contentEditable === "true")
		)
			return;
		//sort
		if (e.key === "B") menuClick(0);
		if (e.key === "T") menuClick(1);
		if (e.key === "N") menuClick(2);
		if (e.key === "O") menuClick(4);
		if (e.key === "C") menuClick(3);
		if (e.key === "Q") menuClick(5);
	});
})();
