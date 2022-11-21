// ==UserScript==
// @name         github pagination (search results)
// @namespace    https://github.com/
// @version      0.1
// @description  prev result, next result
// @author       steventheworker
// @icon         https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fgithub-logo_25231&psig=AOvVaw2PndnVzeLRx_D_pX8PdmTR&ust=1643250249057000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCNCirbquzvUCFQAAAAAdAAAAABAa
// @include      https://github.com/search?*
// ==/UserScript==

//.next_page, .previous_page
(function () {
	"use strict";
	window.addEventListener("keydown", function (e) {
		if ($isInput(doc.activeElement)) return;
		if (e.key === "ArrowRight" && !e.metaKey)
			document.querySelector(".next_page").click();
		if (e.key === "ArrowLeft" && !e.metaKey)
			document.querySelector(".previous_page").click();
	});
})();
