// ==UserScript==
// @name         walmart SHOPPING pagination
// @namespace    https://www.walmart.com/
// @version      0.1
// @description  in order, matching: search page
// @author      steventheworker
// @match       https://*.walmart.com/search/?*query=*
// @run-at      document-idle
// @grant       none
// @icon        https://i5.walmartimages.com/dfw/63fd9f59-49ff/k2-_52fee322-2e60-452a-bccc-1e847f452a13.v1.png
// ==/UserScript==

console.log("steven!!!! SHOPS");
const $ = (window.$ = (sel) => {
	if (sel === window || sel === document || sel === document.body) return sel;
	return Array.from(document.querySelectorAll(sel));
});
function EventListeners() {
	$(window).addEventListener("keydown", function (e) {
		const query = $(".paginator a, .paginator button");
		console.log(query);
		if (e.key === "ArrowLeft" && !e.metaKey) query[0].click(); //previous episode
		if (e.key === "ArrowRight" && !e.metaKey)
			query[query.length - 1].click(); //next episode
	});
}
(function () {
	"use strict";
	EventListeners();
})();
