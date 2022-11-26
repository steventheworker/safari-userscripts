// ==UserScript==
// @name         google pagination (search results) + wasd + tab
// @namespace    https://google.com/
// @version      0.1
// @description  prev result, next result
// @author       steventheworker
// @icon         https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png
// @include      /^http(s|):\/\/(www\.|)google\.(com|net|de|ru|co\.uk)\/search\?.*$/
// @grant        none
// ==/UserScript==

//globals
let isMobile = false;
function addStylesheet() {
	const style = doc.createElement("style");
	style.innerHTML = `
	form {position: relative;} /* first form = search container */
.g:hover a {color: #AA6600 !important;}
.g a {transition: color ease-in-out 333ms;}
.focusedResult {outline: 1px dashed black;}
.focusedResult a:visited {color: purple !important;}
.focusedResult a:hover {color: inehrit !important;}
`;
	const node = doc.createElement("p");
	bod.appendChild(node);
	node.after(style);
}

//helper fns
function removeSiteFromQuery() {
	const el = doc.querySelector("input");
	const val = el.value;
	const ray = val.split("site:");
	const querySite = (ray[1] || "").split(" ")[0] || "";
	el.value = el.value.replace("site:" + querySite, "");
	return querySite;
}
function add2query(txt) {
	doc.querySelector("input").value += txt;
}
const searchBtn = () => {
	const el = doc.querySelector("button[type='submit']");
	if (!el || el.disabled) {
		if (el) el.remove(); //replace disabled element
		isMobile = true;
		doc.querySelector("form[role='search']").innerHTML +=
			'<button style="position: absolute;margin-top: -3.5em;right: -0.5rem;width: 2rem;" jsname="Tg7LZd" class="Tg7LZd" aria-label="Google Search" type="submit" data-ved="0ahUKEwiet5KY2aT3AhUDJkQIHdpHAbcQ4dUDCA0"> <div class="zgAlFc"> <span class="z1asCe MZy1Rb"><svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg></span> </div> </button>';
		return searchBtn();
	}
	return el;
};

//next page, prev page (arrow keys)
function $els() {
	const query = doc.querySelectorAll('div[role="navigation"] table td a');
	return Array.prototype.slice.call(query);
}
const $prev = () => $els()[0];
const $next = () => $els()[$els().length - 1];

//focus on results (a & d keys)
let query, ray;
let i = 0;
const $searchForm = () =>
	doc.getElementById("searchform") || doc.getElementsByTagName("header")[0]; //#searchform DNE on mobile
function setFocus(tar) {
	if (!tar) return;
	tar.classList.add("focusedResult"); //add style
	const pos = tar.getBoundingClientRect();
	const searchHeight = $searchForm().clientHeight;
	win.scroll({
		left: win.scrollX,
		top: pos.top + win.scrollY - searchHeight * 2.5,
		behavior: "smooth",
	});
	tar.querySelector("a").focus();
}
function prevResult(e) {
	if (e) e.preventDefault();
	i--;
	if (i < 0) i = 0;
	refocus();
}
function nextResult(e) {
	if (e) e.preventDefault();
	i++;
	if (i > ray.length - 1) i = ray.length - 1;
	refocus();
}
function getResultContainer() {
	const search = doc.getElementById("search") || doc.getElementById("rso");
	if (!search.children.length) return search;
	//query results - in the prefixStyle where prefix is the search words/term
	const ladygagaStyle = search.querySelector(
		'div[role="tabpanel"] #kp-wp-tab-overview'
	);
	if (ladygagaStyle) return ladygagaStyle;
	const quartzStyle =
		search.children[0] &&
		search.children[0].children[0] &&
		search.children[0].children[0];
	if (quartzStyle && quartzStyle.id === "rso") return quartzStyle;
	if (
		search.children[0].children.length &&
		search.children[0].children[1] &&
		search.children[0].children[1].children.length
	)
		return search.children[0].children[1];
	return search;
}
function refocus() {
	if (!query) {
		query = getResultContainer().children;
		ray = Array.prototype.slice
			.call(query)
			.filter((el) =>
				el.nodeName === "SCRIPT" ||
				el.nodeName === "STYLE" ||
				el.nodeName === "HR" ||
				el.nodeName === "SPAN"
					? false
					: true
			);
	}
	//remove focus from styled result
	const old = doc.getElementsByClassName("focusedResult");
	if (old[0]) old[0].classList.remove("focusedResult");
	//style new result
	setFocus(ray[i]);
}
function findParentResult(tar) {
	if (!tar || !tar.parentNode) return null;
	if (!tar.classList.contains("g")) return findParentResult(tar.parentNode);
	return tar;
}

function addEventListeners() {
	win.addEventListener("keydown", function (e) {
		if ($isInput(doc.activeElement)) {
			if (e.key === "Enter" && e.metaKey) {
				e.preventDefault();
				e.stopImmediatePropagation();
				const query = encodeURIComponent(e.target.value);
				win.open(`${win.location.origin}/search?q=${query}`, "_blank");
			}
			return;
		}

		//pagination - prev & next arrow keys
		if (e.key === "ArrowRight" && !e.metaKey) win.location = $next().href;
		if (e.key === "ArrowLeft" && !e.metaKey) win.location = $prev().href;

		if (e.key === "Enter" && doc.activeElement.nodeName !== "A")
			ray[i].querySelector("a").click(); //only virtually "click" link if not already focused on link

		//wasd navigation
		if (e.key === "a")
			win.scroll({
				left: 0,
				top: win.scrollY - 300,
				behavior: "smooth",
			}); //pgup
		if (e.key === "w") prevResult();
		if (e.key === "d")
			win.scroll({
				left: 0,
				top: win.scrollY + 300,
				behavior: "smooth",
			}); //pgdn
		if (e.key === "s") nextResult();
		if (e.key === "h")
			win.scroll({
				left: 0,
				top: win.scrollY - 300,
				behavior: "smooth",
			}); //pgup
		if (e.key === "k") prevResult();
		if (e.key === "l")
			win.scroll({
				left: 0,
				top: win.scrollY + 300,
				behavior: "smooth",
			}); //pgdn
		if (e.key === "j") nextResult();
		if (e.key === "ArrowUp") prevResult(e);
		if (e.key === "ArrowDown") nextResult(e);
		if (e.key === "Tab") {
			if (e.shiftKey) prevResult(e);
			else nextResult(e);
		}

		//YMWDH sort - Month Day Year Week
		const el_index_dict = { Y: 5, M: 4, W: 3, D: 2, H: 1 };
		if (el_index_dict[e.key] !== undefined) {
			if (isMobile) doc.querySelector('g-menu').querySelectorAll('g-menu-item')[el_index_dict[e.key]].querySelector('a').click(); //prettier-ignore
			const toggleMenuBtn = doc.getElementsByClassName("KTBKoe")[0];
			toggleMenuBtn.click();
			setTimeout(() => {
				const toggleMenu =
					doc.getElementById("before-appbar").nextSibling.children[0]
						.children[0];
				toggleMenu.children[
					el_index_dict[e.key]
				].children[0].children[0].click();
			});
		}

		//site searching (eg: site:example.com)
		if (site_dict[e.key] && removeSiteFromQuery() !== site_dict[e.key]) {
			add2query(" site:" + site_dict[e.key]);
			searchBtn().click();
		}

		//google images, google videos, all google results (navigation button shortcuts)
		if (e.key === "I" || e.key === "V" || e.key === "A") {
			const items = Array.prototype.slice.call(
				doc.querySelectorAll('div[role="navigation"] a')
			);
			for (let cur = 0; cur < items.length; cur++) {
				const el = items[cur];
				if (el.textContent.startsWith(e.key)) {
					el.click();
					break;
				}
			}
		}

		//search query on YouTube
		if (e.key === "y" && e.shiftKey && e.metaKey)
			window.open(
				"https://www.youtube.com/results?search_query=" +
					encodeURIComponent(
						doc.querySelector("input").value
					).replace(/%20/g, "+"),
				"_blank"
			);
	});
	bod.style.transition = "opacity 333ms ease-in-out";
	win.addEventListener("keyup", function (e) {
		if ($isInput(doc.activeElement)) return;
		if (e.key === "Escape") {
			bod.style.opacity = 0.5;
			setTimeout(() => (bod.style.opacity = 1), 333);
		}
	});
	win.addEventListener("click", function (e) {
		if ($isInput(doc.activeElement)) return;
		let tarRes = findParentResult(e.target);
		if (tarRes && tarRes.classList.length > 1) tarRes = null; //todo: filter search results //everything with more than 1 class is not a regular search result, so filter them out
		if (tarRes && tarRes.classList.contains("g")) {
			if (tarRes.classList.contains("focusedResult")) return; // already selected do nothing
			ray.map((el, curIndex) => {
				if (el === tarRes) i = curIndex;
			});
		}
		if (tarRes) refocus();
	});
}

(function () {
	"use strict";
	addStylesheet();
	setTimeout(() => {
		//mobile version initialization (searchBtn sets "isMobile")
		searchBtn(); //add search btn if missing (missing on mobile)
		//init UI
		//(focus result's)
		const focusedCached = doc.activeElement;
		refocus();
		focusedCached.focus(); //reset focus on input, if it was there before
		addEventListeners();
	}, 500);
})();
