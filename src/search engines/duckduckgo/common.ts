export let query:
		| HTMLElement
		| HTMLCollectionOf<HTMLElement>
		| NodeListOf<HTMLElement>
		| null = null,
	results: HTMLElement[] = [],
	focusedResultIndex = 0;

// setters
export const setFocusedResultIndex = (x: number) => (focusedResultIndex = x);

// query
export function openQueryInGoogle(query: string) {
	win.open(
		`https://www.google.com/search?q=${encodeURIComponent(query).replace(/%20/g, "+")}`,
		"_blank",
	);
}

export function removeSiteFromQuery() {
	const el = searchInput();
	if (!el) return "";
	const val = el.value;
	const ray = val.split("site:");
	const querySite = (ray[1] || "").split(" ")[0] || "";
	if (querySite)
		setSearchInputValue(val.replace("site:" + querySite, "").trim());
	return querySite;
}

export function add2query(txt: string) {
	const el = searchInput();
	if (el)
		setSearchInputValue((el.value + " " + txt).replace(/\s+/g, " ").trim());
}

// The DDG search input is a React-controlled component — writing .value
// directly leaves React's state stale, so the next re-render reverts the
// input to the previous query. Set the value through the native setter and
// dispatch an input event so React's onChange keeps its state in sync.
export function setSearchInputValue(value: string) {
	const el = searchInput();
	if (!el) return;
	const setter = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	if (setter) setter.call(el, value);
	else el.value = value;
	el.dispatchEvent(new Event("input", { bubbles: true }));
}

// Submit the current search query the way a real user would: click the search
// button (its onClick reads the input's DOM value), falling back to dispatching
// Enter on the input so DDG's own submit handler runs.
export function submitSearch() {
	const btn = searchBtn();
	if (btn) {
		btn.click();
		return;
	}
	const input = searchInput();
	if (input) {
		input.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	}
}

// search input
export const searchInput = () =>
	doc.querySelector<HTMLInputElement>("#search_form_input") ||
	doc.querySelector<HTMLInputElement>("#search_form_input_homepage");

export const searchBtn = () =>
	doc.querySelector<HTMLElement>(
		'button[type="submit"][aria-label="search"]',
	) ||
	doc.querySelector<HTMLElement>("#search_button_homepage");

export function getResultContainer() {
	return (
		doc.querySelector(
			'section[data-area="mainline"] > ol.react-results--main',
		) ||
		doc.querySelector("ol.react-results--main") ||
		doc.querySelector('section[data-testid="mainline"] ol') ||
		null
	);
}

export function refocusResult() {
	if (!query) {
		query = getResultContainer()
			?.children as HTMLCollectionOf<HTMLElement> | null;
		results = query
			? Array.from(query).filter(
					(el) => (el as HTMLElement).dataset.layout === "organic",
				)
			: [];
	}
	const old = doc.getElementsByClassName("focusedResult");
	if (old[0]) old[0].classList.remove("focusedResult");
	if (results[focusedResultIndex]) focusResult(results[focusedResultIndex]);
}

// extra controls
export function findTimeFilterButton() {
	return Array.from(
		doc.querySelectorAll('#react-layout [tabindex="0"]'),
	).find((el) => {
		return (el.textContent || "").trim() === "Any time";
	}) as HTMLElement | undefined;
}

// results
export function $resultButtons() {
	return [
		doc.getElementById("more-results") as HTMLButtonElement | null,
		Array.from(doc.querySelectorAll("a,button")).find((el) =>
			/(?:^|\b)previous(?:\b|$)/i.test((el.textContent || "").trim()),
		) as HTMLButtonElement | HTMLAnchorElement | undefined,
	];
}
export const $next = () => $resultButtons()[0];
export const $prev = () => $resultButtons()[1];

export function prevResult(e?: KeyboardEvent) {
	if (e) e.preventDefault();
	focusedResultIndex--;
	if (focusedResultIndex < 0) setFocusedResultIndex(0);
	refocusResult();
}

export function nextResult(e?: KeyboardEvent) {
	if (e) e.preventDefault();
	focusedResultIndex++;
	if (focusedResultIndex > results.length - 1)
		setFocusedResultIndex(results.length - 1);
	refocusResult();
}

export function findParentResult(tar: HTMLElement | null): HTMLElement | null {
	if (!tar) return null;
	const result = tar.closest(
		'li[data-layout="organic"]',
	) as HTMLElement | null;
	if (result) return result;
	const article = tar.closest(
		'article[data-testid="result"]',
	) as HTMLElement | null;
	if (article) return article;
	return tar.parentElement ? findParentResult(tar.parentElement) : null;
}

export function focusResult(tar: HTMLElement) {
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
