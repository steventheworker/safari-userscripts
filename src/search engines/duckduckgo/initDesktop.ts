import { refocusResult } from "./common";

export function initDesktop() {
	const focusedCached = doc.activeElement;
	refocusResult();
	if (focusedCached instanceof HTMLElement) focusedCached.focus();
}
