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
	el.value = el.value.replace("site:" + querySite, "");
	return querySite;
}

export function add2query(txt: string) {
	const el = searchInput();
	if (el) el.value += txt;
}

// search input
export const searchInput = () =>
	doc.querySelector<HTMLInputElement>("#search_form_input");

export const searchBtn = () =>
	doc.querySelector<HTMLButtonElement>(
		'button[type="submit"][aria-label="search"]',
	);

export function focusInputToEnd(input: HTMLInputElement) {
	const end = input.value.length;
	input.focus();
	input.setSelectionRange(end, end);
}

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
