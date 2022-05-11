// ==UserScript==
// @name         Escape INPUTS & TEXTAREAs (Esc) & AutoFocus (/)
// @namespace    github.com/steventheworker
// @version      0.1
// @description  Unfocus INPUTs & TEXTAREAs with the Escape key on every page
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
	"use strict";
	const escBlacklist = {
		//these websites commonly have userscripts / sites already blurring input/textarea on escape key
		"play.pokemonshowdown.com": 1,
	};
	window.addEventListener("keyup", function (e) {
		const loc = window.location.host;
		const nn = doc.activeElement.nodeName;
		const isInput =
			nn === "INPUT" ||
			nn === "TEXTAREA" ||
			(nn === "DIV" && doc.activeElement.contentEditable === "true");
		if (e.key === "Escape" && isInput && !escBlacklist[loc])
			doc.activeElement.blur();
		if (e.key === "/" && !isInput) {
			//autofocus
			let rayQuery;
			if (loc === "www.yelp.com" || loc === "www.reddit.com") {
				rayQuery = 'input, textarea, div[contenteditable="true"]'; //nondefault query - yelp uses a lot of hidden fields & non-labeled inputs
			} else
				rayQuery =
					'input[type="search"], input[type="text"], textarea, div[contenteditable="true"]'; //default query
			/*
				|| loc === "stackoverflow.com" ||
				loc === "apple.stackexchange.com" ||
				loc === "askubuntu.com";
*/
			console.log(rayQuery);
			const ray = Array.prototype.slice
				.call(doc.querySelectorAll(rayQuery))
				.filter((el, i) => !el.disabled); //no disabled elements
			/* //used when a website uses the first input element as the search box */
			const inputIndexDict = {
				//first result (in the "ray" query)
				"www.amazon.com": 0,
				"www.bing.com": 0,
				"www.google.com": 0,
				"www.ebay.com": 0,
				"www.yelp.com": 0,
				"www.reddit.com": 0,
				"portal.edd.ca.gov": 0,
				"www.fakespot.com": 0,
				"www.vons.com": 0,
				"www.netflix.com": 0,
				"apple.stackexchange.com": 0,
				"askubuntu.com": 0,
				"stackoverflow.com": 0,
				//second result
				"www.aliexpress.com": 1,
				"www.walmart.com": 1,
			};
			if (loc === "www.netflix.com")
				doc.querySelector(".icon-search").click(); //input is hidden until icon clicked
			const lastIndex = ray.length - 1;
			let i = inputIndexDict[loc];
			if ((isNaN(i) && !i) || i > lastIndex) i = lastIndex; //default = last input element in ray
			if (i !== -1) ray[i].focus();
			console.log(i === -1 ? "input DNE" : ray[i]);
		}
	});
})();
