//home page
export function init() {}
export function keypress(e: KeyboardEvent) {
	if (e.key === "I" && doc.activeElement!.nodeName !== "INPUT") {
		//(shift+I => Images (hotkey))
		(doc.querySelector('a[data-pid="2"]')! as HTMLButtonElement).click();
	}
}
export function keydown(e: KeyboardEvent) {
	return e;
}
export function keyup(e: KeyboardEvent) {
	return e;
}
export function click(e: MouseEvent) {
	return e;
}

/* helper fn's */
