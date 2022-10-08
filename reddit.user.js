// ==UserScript==
// @name         REDDIT
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  T N O C B - top new old controversial best, auto disable safesearch, auto enable dark mode, remove mobile/incognito popups
// @author       steventheworker
// @grant        none
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png
// @match        https://www.reddit.com/*
// ==/UserScript==

function openThread(el, newTab) {
	if (!el) return;
	if (el.nodeName !== "A")
		return openThread(
			Array.from(el.querySelectorAll("a")).filter(
				(el, i) => el.children[0]?.children[0]?.nodeName === "H3"
			)[0],
			newTab
		);
	// window.open(el.href, newTab ? "_blank" : undefined);
	el.focus();
}

//init
(function () {
	//reddit thread shortcut.user.js
	addGlobalStyle(`
		"._1OVBBWLtHoSPfGCRaPzpTf._3nSp9cdBpqL13CqjdMr2L_ { width: 90% !important;}"
		"div { max-width: none !important; }
	`);
	window.addEventListener("keydown", function (e) {
		if ($isInput(doc.activeElement)) return;
		//sort
		const threadSortPicker = document.querySelector(
			"button#CommentSort--SortPicker"
		);
		if (threadSortPicker) {
			// thread / comment mode
			const sortThreadMap = { B: 0, T: 1, N: 2, O: 4, C: 3, Q: 5 };
			const selectIndex = sortThreadMap[e.key];
			if (selectIndex !== undefined) {
				//open menu, then click menu-item
				threadSortPicker.click();
				Array.prototype.slice
					.call(document.querySelectorAll('div[role="menu"] button'))
					[selectIndex].click();
			}
		} else {
			//subreddit mode
			if (e.shiftKey) {
				if (e.key === "Enter") openThread(doc.activeElement);
			} else if (e.metaKey) {
				if (e.key === "Enter") openThread(doc.activeElement, true);
			}
			const sortRedditdMap = {
				B: "Best" /* sometimes DNE */,
				H: "Hot",
				N: "New",
				T: "Top",
				R: "Rising",
			};
			let links = document.getElementsByClassName(
				"ListingLayout-outerContainer"
			)[0].children[1];
			links = links.children[links.children.length - 1].children[0];

			if (
				links.children[0].children.length > 3 &&
				!links.children[0].children[0]
					.getAttribute("href")
					?.startsWith("/user/")
				// &&
				// !win.location.pathname.startsWith("/r/news")
			)
				links = links.children[0].children[1];
			else links = links.children[1].children[1];

			const linkLabel = sortRedditdMap[e.key];
			const selectIndex = linkLabel
				? (function getSelectIndex() {
						let ret;
						Array.from(links.children).forEach((el, i) => {
							if (el.href.endsWith(linkLabel.toLowerCase() + "/"))
								ret = i;
						});
						return ret;
				  })()
				: null;
			if (selectIndex !== null) links.children[selectIndex].click();
		}
	});

	//reddit.user.js
	addGlobalStyle(`
		.m-slideIn {display: none;}
		/* remove cat sliding popup (open in app) */
		shreddit-drawer,
		shreddit-drawer .content,
		shreddit-experience-tree {
			display: none !important;
		}
	`);
	// auto-Disable safe search (when performing a search)
	waitForEl(`#safe-search-toggle[aria-checked=true]`).then((el) =>
		el.click()
	);

	/*
		incognito mode helpers
	*/
	// remove iframe "Use your google account to sign in to Reddit"(single sign on google)
	waitForEl("#SHORTCUT_FOCUSABLE_DIV iframe").then((sso) =>
		isLoggedIn() ? 0 /* do nothing */ : sso.parentNode.remove()
	);
	//Automatic Dark mode
	function openDropDown(dropDown) {
		//open user settings dropdown
		if (isLoggedIn()) return; //don't run if logged in
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
				//click Dark Mode Btn if it's off
				if (
					settingsCaret.parentNode.parentNode.nextSibling.children[0].children[1].getAttribute(
						"aria-checked"
					) === "false"
				) {
					settingsCaret.parentNode.parentNode.nextSibling.children[0].click();
				}
			}
			//auto close dropDown
			dropDown.click();
		}
	}
	waitForEl("#USER_DROPDOWN_ID").then((dropDown) => openDropDown(dropDown));
	//Auto-Click "View Entire Discussion" - Spoiler button
	const clickDiscussionSpoiler = () => {
		if (isLoggedIn()) return;
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

let cache$isLoggedIn;
const isLoggedIn = () =>
	cache$isLoggedIn
		? cache$isLoggedIn
		: (cache$isLoggedIn = doc.getElementById(
				"email-collection-tooltip-id"
		  ));
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

//other helpers
function addGlobalStyle(css) {
	//https://greasyfork.org/en/scripts/405073-wide-new-reddit-userscript
	var head, style;
	head = document.getElementsByTagName("head")[0];
	if (!head) {
		return;
	}
	style = document.createElement("style");
	style.type = "text/css";
	style.innerHTML = css;
	head.appendChild(style);
}
