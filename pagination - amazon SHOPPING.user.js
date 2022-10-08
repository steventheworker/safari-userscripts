// ==UserScript==
// @name         amazon SHOPPING pagination
// @namespace    https://www.amazon.com/
// @version      0.1
// @description  in order, matching: search page, product page
// @author       steventheworker
// @include     /^https:\/\/(www)\.amazon\.com\/(s\/(?k=)|(.*?\/)?dp)\/.+/
// @include     /^https:\/\/(www)\.amazon\.co\.uk\/(gp\/(video|product)|(.*?\/)?dp)\/.+/
// @match       https://*.amazon.com/s?k=*
// @match       https://*.amazon.com/*/dp/*
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
		const query = $(".s-pagination-strip a");
		if (e.key === "ArrowLeft" && !e.metaKey) query[0].click(); //previous episode
		if (e.key === "ArrowRight" && !e.metaKey)
			query[query.length - 1].click(); //next episode
	});
}
(function () {
	"use strict";
	EventListeners();
})();
