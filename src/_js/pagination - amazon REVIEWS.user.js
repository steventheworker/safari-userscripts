// ==UserScript==
// @name         amazon REVIEWS pagination
// @namespace    https://www.amazon.com/
// @version      0.1
// @description  next page, prev page, etc.
// @author       steventheworker
// @match       https://*.amazon.com/product-reviews/*
// @run-at      document-idle
// @grant       none
// @icon        https://www.amazon.com/favicon.ico
// ==/UserScript==

const $ = (window.$ = (sel) => {
	if (sel === window || sel === document || sel === document.body) return sel;
	return Array.from(document.querySelectorAll(sel));
});
function EventListeners() {
	$(window).addEventListener("keydown", function (e) {
		if ($isInput(doc.activeElement)) return;
		//^^^ (above) prevent's shortcut's within Text Input's
		const query = $(".a-pagination li");
		if (e.key === "ArrowLeft" && !e.metaKey) query[0].children[0].click(); //previous episode
		if (e.key === "ArrowRight" && !e.metaKey)
			query[query.length - 1].children[0].click(); //next episode
	});
}
(function () {
	"use strict";
	EventListeners();
})();
