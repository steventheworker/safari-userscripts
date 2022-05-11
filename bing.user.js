// ==UserScript==
// @name         bing
// @namespace    https://bing.com/
// @version      0.1
// @description  wasd navigation, (sitedomains shortcuts) (sort shortcuts)
// @author       steventheworker
// @icon         https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png
// @include      /^http(s|):\/\/(www\.|)bing\.(com|net|de|ru|co\.uk)\/search\?.*$/
// @grant        none
// ==/UserScript==

function listenEvents() {
	window.addEventListener("keydown", function (e) {
		const nn = doc.activeElement.nodeName;
		if (nn === "INPUT" || nn === "TEXTAREA") return;
		//Arrow Left+Right
		if (e.key === "ArrowLeft")
			doc.querySelector(`.b_pag a[title="Previous page"]`).click();
		if (e.key === "ArrowRight")
			doc.querySelector(`.b_pag a[title="Next page"]`).click();
		//sort by: D W M Y
		if (e.key === "D") clickTimeMenu(1);
		if (e.key === "W") clickTimeMenu(2);
		if (e.key === "M") clickTimeMenu(3);
		if (e.key === "Y") clickTimeMenu(4);
		//wasd ijkl
		const scrollKeys = {
			a: -1,
			d: 1,
			j: -1,
			l: 1,
			w: -1,
			s: 1,
			i: -1,
			k: 1,
		};
		if (scrollKeys[e.key])
			window.scroll({
				left: 0,
				top: window.scrollY + scrollKeys[e.key] * 300,
				behavior: "smooth",
			}); //pgdn
		//site searching (eg: site:example.com)
		if (site_dict[e.key]) {
			removeOtherSitesFromQuery();
			add2query(" site:" + site_dict[e.key]);
			searchBtn().click();
		}
	});
}
/* init */
(function () {
	("use strict");
	listenEvents();
})();
/* helper fns */
function clickTimeMenu(i) {
	//show menu
	doc.querySelector('#b_tween a[role="button"]').click();
	//click at index
	doc.querySelectorAll('#b_tween .b_dropdown a[role="menuitem"]')[i].click();
}
function removeOtherSitesFromQuery() {
	const el = doc.querySelector("input");
	const val = el.value;
	const ray = val.split("site:");
	el.value = ray[0] + ((ray[1] || "").split(" ")[1] || "");
}
function add2query(txt) {
	doc.querySelector("input").value += txt;
}
const searchBtn = () => {
	return doc.querySelector("#sb_search input");
};
