// ==UserScript==
// @name         REDDIT
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  auto disable safesearch, auto enable dark mode, remove mobile/incognito popups
// @author       steventheworker
// @grant        none
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png
// @match        https://www.reddit.com/*
// ==/UserScript==

//todo: integrate REDDIT thread shortcuts userscript

const doc = document,
	win = window,
	bod = doc.body;
function addStyleSheet() {
	const css = `
	 .m-slideIn {display: none;}

	 /* remove cat sliding popup (open in app) */
	 shreddit-drawer,
	 shreddit-drawer .content,
	 shreddit-experience-tree {
		 display: none !important;
	 }
`,
		head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(css));
}

//init
(function () {
	addStyleSheet();
	// auto-Disable safe search (when performing a search)
	waitForEl(`#safe-search-toggle[aria-checked=true]`).then((el) =>
		el.click()
	);

	/*
		incognito mode helpers
	*/
	// remove iframe "Use your google account to sign in to Reddit"(single sign on google)
	waitForEl("#SHORTCUT_FOCUSABLE_DIV iframe").then((sso) =>
		sso.parentNode.remove()
	);
	//Automatic Dark mode
	function openDropDown(dropDown) {
		//open user settings dropdown
		dropDown.click();
		if (dropDown.getAttribute("aria-expanded") === "false")
			setTimeout(() => openDropDown(dropDown), 84);
		else {
			//open Settings submenu
			const carets = doc.getElementsByClassName("icon-caret_down");
			const settingsCaret = carets[10];
			if (
				settingsCaret.parentNode.children[1] &&
				settingsCaret.parentNode.children[1].textContent === "Settings"
			) {
				settingsCaret.click();
				//click Dark Mode Btn
				settingsCaret.parentNode.parentNode.nextSibling.children[0].click();
			}
			//auto close dropDown
			dropDown.click();
		}
	}
	waitForEl("#USER_DROPDOWN_ID").then((dropDown) => openDropDown(dropDown));
	//Auto-Click "View Entire Discussion" - Spoiler button
	const clickDiscussionSpoiler = () => {
		const ray = Array.prototype.slice.call(
			document.querySelectorAll('button[tabindex="0"]')
		);
		ray.forEach((curBtn, i) => {
			if (curBtn.innerHTML.startsWith("View Entire Discussion"))
				curBtn.click();
		});
	};
	document.body.onload = clickDiscussionSpoiler;
})();

// wait for element to exist
// https://stackoverflow.com/a/61511955
function waitForEl(selector) {
	return new Promise((resolve) => {
		if (document.querySelector(selector))
			return resolve(document.querySelector(selector));
		const observer = new MutationObserver((mutations) => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}
