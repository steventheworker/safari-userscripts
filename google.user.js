// ==UserScript==
// @name         google home
// @namespace    https://google.com/
// @version      0.1
// @description  remove chrome ad, (shift+I => Images (hotkey))
// @author       steventheworker
// @icon         https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png
// @include      /^http(s|):\/\/(www\.|)google\.(com|net|de|ru|co\.uk).*$/
// @grant        none
// ==/UserScript==

const remove_chrome_ad = () =>
	doc.querySelector("mobile-promo")?.parentNode.parentNode.remove();

(function () {
	("use strict");
	remove_chrome_ad();
	win.addEventListener("keypress", (e) => {
		if (e.key === "I" && doc.activeElement.nodeName !== "INPUT") {
			//(shift+I => Images (hotkey))
			doc.querySelector('a[data-pid="2"]').click();
		}
	});
})();
