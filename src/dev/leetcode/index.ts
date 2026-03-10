// ==UserScript==
// @name         leetcode
// @namespace    https://leetcode.com/
// @version      0.1
// @description  CMD+R to run (prevent refresh)
// @author       steventheworker
// @icon         https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png
// @include      /^https?:\/\/(www\.)?leetcode\.(com|net|de|ru|co\.uk)\/.*$/
// @grant        none
// ==/UserScript==

const pageType = {
	problem: {
		onKeyDown: (e: KeyboardEvent) => {
			if (!location.pathname.startsWith("/problems")) return;
			// CMD + R to run
			console.log(e.key, e.metaKey);
			if (e.key === "r" && e.metaKey) {
				e.preventDefault(); // prevent refresh
				const runBtn = document.querySelector(
					'button[aria-label="Run"]',
				);
				(runBtn as HTMLButtonElement)?.click();
			}
		},
	},
};

function onKeyDown(e: KeyboardEvent) {
	pageType.problem.onKeyDown(e);
}

function addEventListeners() {
	document.addEventListener("keydown", onKeyDown);
}

(function () {
	console.log(`leetcode userscript started`);
	addEventListeners();
})();
