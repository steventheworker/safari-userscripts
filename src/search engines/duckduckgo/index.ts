// ==UserScript==
// @name         https://duckduckgo.com/* - home / search results / etc.
// @namespace    https://duckduckgo.com/
// @version      0.1
// @description  prev result, next result, remove chrome ad, shift+I => Images (hotkey), cmd+shift+y = youtube query, YMWDH etc., (cmd+shift+g to open in google)
// @author       steventheworker
// @icon         https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png
// @match        https://duckduckgo.com/*
// @grant        none
// ==/UserScript==

(function () {
	console.log(`duckduckgo userscript started`);
	addStylesheet();
	setTimeout(() => {
		addEventListeners();
		initPage();
	}, 500);
})();

function addStylesheet() {
	const style = doc.createElement("style");
	style.innerHTML = `
#react-duckbar a { transition: color ease-in-out 333ms; }
#react-duckbar a:hover { color: #AA6600 !important; }
.focusedResult { outline: 1px dashed black; }
.focusedResult a:visited { color: purple !important; }
.focusedResult a:hover { color: inherit !important; }
li[data-layout="about"] { display: none !important; }
`;
	doc.body.appendChild(style);
}

function initPage() {
	const focusedCached = doc.activeElement;
	refocus();
	if (focusedCached instanceof HTMLElement) focusedCached.focus();
}

function addEventListeners() {
	bod.style.transition = "opacity 333ms ease-in-out";
	win.addEventListener("keydown", keydown);
	win.addEventListener("keyup", keyup);
	win.addEventListener("click", click);
	win.addEventListener("keypress", keypress);
	win.addEventListener("focusin", onFocusIn);
}

function keydown(e: KeyboardEvent) {
	if (e.key.toLowerCase() === "g" && e.shiftKey && e.metaKey) {
		e.preventDefault();
		e.stopImmediatePropagation();
		openQueryInGoogle(searchInput()?.value || "");
		return;
	}
	if ($isInput(doc.activeElement)) {
		const input = e.target as HTMLInputElement;
		if (e.key === "Enter" && e.metaKey) {
			e.preventDefault();
			e.stopImmediatePropagation();
			const query = encodeURIComponent(input.value);
			win.open(`${win.location.origin}/?q=${query}&t=h_`, "_blank");
		}
		return;
	}

	if (e.key === "ArrowRight" && !e.metaKey) {
		const next = $next();
		if (next) next.click();
	}
	if (e.key === "ArrowLeft" && !e.metaKey) {
		const prev = $prev();
		if (prev) prev.click();
	}

	if (e.key === "Enter" && doc.activeElement!.nodeName !== "A") {
		const link = ray[i]?.querySelector("a") as HTMLAnchorElement | null;
		if (link) link.click();
	}

	if (e.key === "a") {
		win.scroll({ left: 0, top: win.scrollY - 300, behavior: "smooth" });
	}
	if (e.key === "w") prevResult(e);
	if (e.key === "d") {
		win.scroll({ left: 0, top: win.scrollY + 300, behavior: "smooth" });
	}
	if (e.key === "s") nextResult(e);
	if (e.key === "h") {
		win.scroll({ left: 0, top: win.scrollY - 300, behavior: "smooth" });
	}
	if (e.key === "k") prevResult(e);
	if (e.key === "l") {
		win.scroll({ left: 0, top: win.scrollY + 300, behavior: "smooth" });
	}
	if (e.key === "j") nextResult(e);
	if (e.key === "ArrowUp") prevResult(e);
	if (e.key === "ArrowDown") nextResult(e);
	if (e.key === "Tab") {
		if (e.shiftKey) prevResult(e);
		else nextResult(e);
	}

	const timeFilterByKey: { [key: string]: string } = {
		H: "Past day", // DuckDuckGo has no "past hour" shortcut; use the closest match.
		D: "Past day",
		W: "Past week",
		M: "Past month",
		Y: "Past year",
	};
	if (timeFilterByKey[e.key]) {
		const timeBtn = findTimeFilterButton();
		if (!timeBtn) return;
		timeBtn.click();
		setTimeout(() => {
			const items = Array.from(
				doc.querySelectorAll('[data-testid="dropdown-options"] span'),
			) as HTMLSpanElement[];
			const target = items.find((el) => el.textContent?.trim() === timeFilterByKey[e.key]);
			(target?.closest("div") as HTMLElement | null)?.click();
		}, 333);
	}

	if (site_dict[e.key] && removeSiteFromQuery() !== site_dict[e.key]) {
		add2query(" site:" + site_dict[e.key]);
		searchBtn()?.click();
	}

	if (e.key === "I" || e.key === "V" || e.key === "A") {
		const items = Array.from(doc.querySelectorAll('#react-duckbar a')) as HTMLAnchorElement[];
		for (const el of items) {
			if ((el.textContent || "").startsWith(e.key === "A" ? "All" : e.key === "I" ? "Images" : "Videos")) {
				el.click();
				break;
			}
		}
	}

	if (e.key === "y" && e.shiftKey && e.metaKey) {
		win.open(
			"https://www.youtube.com/results?search_query=" +
				encodeURIComponent(searchInput()?.value || "").replace(/%20/g, "+"),
			"_blank",
		);
	}
}

function keyup(e: KeyboardEvent) {
	if ($isInput(doc.activeElement)) return;
	if (e.key === "Escape") {
		bod.style.opacity = "0.5";
		setTimeout(() => (bod.style.opacity = "1"), 333);
	}
}

function keypress(e: KeyboardEvent) {
	if (location.pathname === "/" && e.key === "I" && doc.activeElement!.nodeName !== "INPUT") {
		const images = Array.from(doc.querySelectorAll('#react-duckbar a')) as HTMLAnchorElement[];
		images.find((el) => (el.textContent || "").trim().startsWith("Images"))?.click();
	}
	return e;
}

function click(e: MouseEvent) {
	if ($isInput(doc.activeElement)) return;
	let tarRes = findParentResult(e.target as HTMLElement);
	if (tarRes && tarRes.classList.contains("focusedResult")) return;
	if (tarRes) {
		const idx = ray.findIndex((el) => el === tarRes);
		if (idx >= 0) i = idx;
		refocus();
	}
}

let query: HTMLElement | HTMLCollectionOf<HTMLElement> | NodeListOf<HTMLElement> | null = null;
let ray: HTMLElement[] = [];
let i = 0;

const searchInput = () => doc.querySelector<HTMLInputElement>("#search_form_input");
const searchBtn = () => doc.querySelector<HTMLButtonElement>('button[type="submit"][aria-label="search"]');

function onFocusIn(e: FocusEvent) {
	const target = e.target;
	if (!(target instanceof HTMLInputElement)) return;
	if (target.id !== "search_form_input") return;
	setTimeout(() => focusInputToEnd(target), 0);
}

function focusInputToEnd(input: HTMLInputElement) {
	const end = input.value.length;
	input.focus();
	input.setSelectionRange(end, end);
}

function openQueryInGoogle(query: string) {
	win.open(`https://www.google.com/search?q=${encodeURIComponent(query).replace(/%20/g, "+")}`, "_blank");
}

function findTimeFilterButton() {
	return Array.from(doc.querySelectorAll('#react-layout [tabindex="0"]')).find((el) => {
		return (el.textContent || "").trim() === "Any time";
	}) as HTMLElement | undefined;
}

function removeSiteFromQuery() {
	const el = searchInput();
	if (!el) return "";
	const val = el.value;
	const ray = val.split("site:");
	const querySite = (ray[1] || "").split(" ")[0] || "";
	el.value = el.value.replace("site:" + querySite, "");
	return querySite;
}

function add2query(txt: string) {
	const el = searchInput();
	if (el) el.value += txt;
}

function $els() {
	return [
		doc.getElementById("more-results") as HTMLButtonElement | null,
		Array.from(doc.querySelectorAll("a,button")).find((el) =>
			/(?:^|\b)previous(?:\b|$)/i.test((el.textContent || "").trim()),
		) as HTMLButtonElement | HTMLAnchorElement | undefined,
	];
}

const $next = () => $els()[0];
const $prev = () => $els()[1];

function prevResult(e?: KeyboardEvent) {
	if (e) e.preventDefault();
	i--;
	if (i < 0) i = 0;
	refocus();
}

function nextResult(e?: KeyboardEvent) {
	if (e) e.preventDefault();
	i++;
	if (i > ray.length - 1) i = ray.length - 1;
	refocus();
}

function findParentResult(tar: HTMLElement | null): HTMLElement | null {
	if (!tar) return null;
	const result = tar.closest('li[data-layout="organic"]') as HTMLElement | null;
	if (result) return result;
	const article = tar.closest('article[data-testid="result"]') as HTMLElement | null;
	if (article) return article;
	return tar.parentElement ? findParentResult(tar.parentElement) : null;
}

function setFocus(tar: HTMLElement) {
	if (!tar) return;
	tar.classList.add("focusedResult");
	const pos = tar.getBoundingClientRect();
	win.scroll({
		left: win.scrollX,
		top: pos.top + win.scrollY - 250,
		behavior: "smooth",
	});
	tar.querySelector("a")?.focus();
}

function refocus() {
	if (!query) {
		query = getResultContainer()?.children as HTMLCollectionOf<HTMLElement> | null;
		ray = query
			? Array.from(query).filter((el) => (el as HTMLElement).dataset.layout === "organic")
			: [];
	}
	const old = doc.getElementsByClassName("focusedResult");
	if (old[0]) old[0].classList.remove("focusedResult");
	if (ray[i]) setFocus(ray[i]);
}

function getResultContainer() {
	return doc.querySelector('section[data-area="mainline"] > ol.react-results--main') ||
		doc.querySelector('ol.react-results--main') ||
		doc.querySelector('section[data-testid="mainline"] ol') ||
		null;
}

export {};
