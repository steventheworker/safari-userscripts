// ==UserScript==
// @name         yelp search results pagination
// @namespace    https://yelp.com/
// @version      0.1
// @description  prev result, next result
// @author       steventheworker
// @icon         https://s3-media0.fl.yelpcdn.com/assets/public/favicon.yji-118ff475a341620f50dfbaddb83efb25.ico
// @include      /^http(s|):\/\/(www\.|)yelp\.(com|net|de|ru|co\.uk)\/search\?.*$/
// @grant        none
// ==/UserScript==

function $els() {
	const query = document.querySelectorAll(
		'div[aria-label="Pagination navigation"] div div div a'
	);
	return Array.prototype.slice.call(query);
}
function $prev() {
	return $els()[0];
}
function $next() {
	return $els()[$els().length - 1];
}
function init() {
	console.log(666, "steventheworker", 666);
	//prev & next arrow keys
	window.addEventListener("keydown", function (e) {
		const nn = document.activeElement.nodeName;
		if (nn === "INPUT" || nn === "TEXTAREA") return;
		if (e.key === "ArrowRight" && !e.metaKey)
			window.location = $next().href;
		if (e.key === "ArrowLeft" && !e.metaKey) window.location = $prev().href;
	});
}

(function () {
	"use strict";
	init();
})();
