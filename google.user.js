// ==UserScript==
// @name         google home
// @namespace    https://google.com/
// @version      0.1
// @description  remove chrome ad
// @author       steventheworker
// @icon         https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png
// @include      /^http(s|):\/\/(www\.|)google\.(com|net|de|ru|co\.uk)\/\?.*$/
// @grant        none
// ==/UserScript==

(function () {
	("use strict");
	//remove chrome ad
	document.querySelector("mobile-promo").parentNode.parentNode.remove();
})();
