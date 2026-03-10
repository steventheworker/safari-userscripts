// ==UserScript==
// @name         REDDIT (OLD)
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  auto-reopen single comment view in new reddit, open links in new tab on new reddit, normalize link styles
// @author       steventheworker
// @grant        none
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png
// @match        https://old.reddit.com/*
// ==/UserScript==

function pathParts() {
	const path = win.location.pathname.split("/");
	path.splice(0, 1);
	return path;
}
(function () {
	// // auto-reopen single comment view in new reddit
	// if (pathParts()[2] === "comments") {
	// 	win.location.href = win.location.href.replace("old.", "");
	// }

	addGlobalStyle(`
		a {color: white !important;}
		a:visited {color: #800080 !important;}
		a:hover {color: blue !important;}
		li a {color: grey !important;}

		@media (max-device-width: 414px) {
			a {font-size: 2em !important;}
			.thumbnail, .thumbnail img {width: 200px;height: 138px;}
			.next-button a, .prev-button a {padding: 25px;}
			.nav-buttons {margin-top: 7em;}
		}
	`);
	doc.addEventListener("click", (e) => {
		if (e.target.nodeName === "A") {
			if (
				e.target.innerHTML === "next ›" ||
				e.target.innerHTML === "‹ prev"
			)
				return;
			e.target.setAttribute("target", "_BLANK");

			if (
				e.target.classList.contains("title") &&
				e.target.parentNode.classList.contains("title")
			) {
				const flatListUL = e.target.parentNode.nextSibling.nextSibling;
				e.target.setAttribute(
					"href",
					flatListUL.querySelector("a").href,
				);
			}

			e.target.setAttribute("href", e.target.href.replace("old.", ""));
		}
	});
})();

function addGlobalStyle(css) {
	//https://greasyfork.org/en/scripts/405073-wide-new-reddit-userscript
	var head, style;
	head = doc.getElementsByTagName("head")[0];
	if (!head) {
		return;
	}
	style = doc.createElement("style");
	style.type = "text/css";
	style.innerHTML = css;
	head.appendChild(style);
}
