// ==UserScript==
// @name         ebay SHOPPING pagination
// @namespace    https://www.ebay.com/
// @version      0.1
// @description  in order, matching: search page
// @author       steventheworker
// @match       https://*.ebay.com/sch/i.html?*
// @run-at      document-idle
// @grant       none
// @icon        https://pages.ebay.com/favicon.ico
// ==/UserScript==

console.log("steven!!!! SHOPS");
const $ = (window.$ = (sel) => {
	if (sel === window || sel === document || sel === document.body) return sel;
	return Array.from(document.querySelectorAll(sel));
});
function EventListeners() {
	$(window).addEventListener("keydown", function (e) {
		if (isInput(doc.activeElement)) return;
		//^^^ (above) prevent's shortcut's within Text Input's
		const query = $(".pagination a");
		if (e.key === "ArrowLeft" && !e.metaKey) query[0].click(); //previous episode
		if (e.key === "ArrowRight" && !e.metaKey)
			query[query.length - 1].click(); //next episode
	});
}
(function () {
	"use strict";
	EventListeners();
})();
