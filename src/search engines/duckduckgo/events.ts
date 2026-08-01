import {
	$next,
	$prev,
	add2query,
	findParentResult,
	findTimeFilterButton,
	focusInputToEnd,
	refocusResult,
	nextResult,
	openQueryInGoogle,
	prevResult,
	removeSiteFromQuery,
	searchInput,
	submitSearch,
	results,
	setFocusedResultIndex,
	focusedResultIndex,
} from "./common";

export function addEventListeners() {
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
	// Use e.target (the event origin) rather than doc.activeElement: DDG's own
	// React onKeyDown submits and blurs the input before this window-level
	// listener runs, so activeElement is no longer the input — and the Enter
	// handler below would click the focused result, racing the real submit.
	if ($isInput(e.target as HTMLElement)) {
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
		const link = results[focusedResultIndex]?.querySelector(
			"a",
		) as HTMLAnchorElement | null;
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
			const target = items.find(
				(el) => el.textContent?.trim() === timeFilterByKey[e.key],
			);
			(target?.closest("div") as HTMLElement | null)?.click();
		}, 333);
	}

	if (site_dict[e.key] && removeSiteFromQuery() !== site_dict[e.key]) {
		add2query(" site:" + site_dict[e.key]);
		submitSearch();
	}

	if (e.key === "I" || e.key === "V" || e.key === "A") {
		const items = Array.from(
			doc.querySelectorAll("#react-duckbar a"),
		) as HTMLAnchorElement[];
		for (const el of items) {
			if (
				(el.textContent || "").startsWith(
					e.key === "A" ? "All" : e.key === "I" ? "Images" : "Videos",
				)
			) {
				el.click();
				break;
			}
		}
	}

	if (e.key === "y" && e.shiftKey && e.metaKey) {
		win.open(
			"https://www.youtube.com/results?search_query=" +
				encodeURIComponent(searchInput()?.value || "").replace(
					/%20/g,
					"+",
				),
			"_blank",
		);
	}
}

function keyup(e: KeyboardEvent) {
	if ($isInput(e.target as HTMLElement)) return;
	if (e.key === "Escape") {
		bod.style.opacity = "0.5";
		setTimeout(() => (bod.style.opacity = "1"), 333);
	}
}

function keypress(e: KeyboardEvent) {
	if (
		location.pathname === "/" &&
		e.key === "I" &&
		!$isInput(e.target as HTMLElement)
	) {
		const images = Array.from(
			doc.querySelectorAll("#react-duckbar a"),
		) as HTMLAnchorElement[];
		images
			.find((el) => (el.textContent || "").trim().startsWith("Images"))
			?.click();
	}
	return e;
}

function click(e: MouseEvent) {
	if ($isInput(e.target as HTMLElement)) return;
	let tarRes = findParentResult(e.target as HTMLElement);
	if (tarRes && tarRes.classList.contains("focusedResult")) return;
	if (tarRes) {
		const idx = results.findIndex((el) => el === tarRes);
		if (idx >= 0) setFocusedResultIndex(idx);
		refocusResult();
	}
}

// DDG's / shortcut focuses the search input with the whole query selected;
// move the caret to the end instead (was dropped in 964cc56, reintroducing
// the regression this fixes). Run after DDG's own focus handling settles.
function onFocusIn(e: FocusEvent) {
	const target = e.target;
	if (!(target instanceof HTMLInputElement)) return;
	if (target.id !== "search_form_input" && target.id !== "search_form_input_homepage")
		return;
	setTimeout(() => focusInputToEnd(target), 0);
}
