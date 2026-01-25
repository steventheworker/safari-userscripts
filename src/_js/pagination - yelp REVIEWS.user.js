// ==UserScript==
// @name         yelp REVIEWS pagination
// @namespace    https://www.yelp.com/
// @version      0.1
// @description  next page, prev page, etc.
// @author       steventheworker
// @match       https://*.yelp.com/biz/*
// @run-at      document-idle
// @grant       none
// @icon         https://s3-media0.fl.yelpcdn.com/assets/public/favicon.yji-118ff475a341620f50dfbaddb83efb25.ico
// ==/UserScript==

const $ = (window.$ = (sel) => {
	if (sel === window || sel === document || sel === document.body) return sel;
	return Array.from(document.querySelectorAll(sel));
});
function EventListeners() {
	$(window).addEventListener("keydown", function (e) {
		if ($isInput(doc.activeElement)) return;
		//^^^ (above) prevent's shortcut's within Text Input's
		const query = $(".prev-link, .next-link");
		if (e.key === "ArrowLeft" && !e.metaKey) query[0].click(); //previous page
		if (e.key === "ArrowRight" && !e.metaKey)
			query[query.length - 1].click(); //next page
		if (e.key === "Y") sortBy(0); //yelp recommended sort
		if (e.key === "N") sortBy(1); //new
		if (e.key === "O") sortBy(2); //old
		if (e.key === "H") sortBy(3); //highest
		if (e.key === "L") sortBy(4); //lowest
		if (e.key === "E") sortBy(5); //by yelp elite
	});
}

const clickSortBtn = () => {
	document
		.querySelector(
			'section[aria-label="Recommended Reviews"] button[type="button"]'
		)
		.click();
};
const makeMenuExist = () => {
	clickSortBtn(); //open & close popup
	clickSortBtn();
};
const sortBy = (i) => {
	makeMenuExist(); //popup menu is deleted after every sort
	//click menu item w/ index i
	document
		.querySelectorAll(
			'section[aria-label="Recommended Reviews"] menu button'
		)
		[i].click();
};

(function () {
	("use strict");
	EventListeners();
	setTimeout(() => sortBy(1), 4000); //sort by (new): on page load
})();
