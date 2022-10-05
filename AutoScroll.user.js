// ==UserScript==
// @name         AutoScroll
// @namespace    github.com/steventheworker
// @version      0.2
// @description  a feature that is solely built into Firefox (within the Apple ecosystem). Use autoscrolling on chrome/Safari with this userscript. (ie: hold middle mouse button to AutoScroll)
// @author       Steven G.
// @match        *://*/*
// @grant        none
// @icon         https://upload.wikimedia.org/wikipedia/en/7/71/Safari_14_icon.png
// ==/UserScript==

let millisecs = 33;
let tentativeElement; // the element you want to be scrolling on, other than the window object
let el; //this is equal to tentativeElement, when window won't scroll, resets on mouseup
let scrolling = false;
let refinterval;
let startClick = {};
let cur = {};
let scrollCounter = 0; //every time interval runs +1, resets on mouseup
let initScrollX; //start scrollX, initialized on mousedown
let initScrollY; //start scrollY, initialized on mousedown

function isScrollable(node) {
	const style = getComputedStyle(node);
	const x = style.getPropertyValue("overflow-x");
	const y = style.getPropertyValue("overflow-y");
	return (x !== "visible" && x !== "hidden") ||
		(y !== "visible" && y !== "hidden")
		? true
		: false;
}
function getScrollParent(node) {
	if (!node || node === document) return null;
	if (isScrollable(node)) return node;
	else return getScrollParent(node.parentNode);
}

(function () {
	"use strict";
	window.addEventListener("mousedown", function (e) {
		const isMiddle = e.button === 1;
		if (isMiddle) {
			tentativeElement = getScrollParent(e.target);
			initScrollX = window.scrollX;
			initScrollY = window.scrollY;
			startClick = {
				x: e.pageX - window.scrollX,
				y: e.pageY - window.scrollY,
			};
			scrolling = true;
			//interval
			refinterval = setInterval(function () {
				if (!scrolling) return;
				const SameScrollXY =
					initScrollX === window.scrollX &&
					initScrollY === window.scrollY;
				if (scrollCounter === 3 && SameScrollXY) el = tentativeElement; //if no scroll changes within x intervals, scroll tentativeElement instead
				const dx = cur.x - startClick.x;
				const dy = cur.y - startClick.y;
				scrollCounter++;
				if (el) return el.scrollBy(dx, dy);
				window.scroll(dx, dy);
			}, millisecs);
			addVisual(startClick.x, startClick.y);
		}
	});
	window.addEventListener("mouseup", function (e) {
		const isMiddle = e.button === 1;
		if (!isMiddle) return;
		scrolling = false;
		clearInterval(refinterval);
		scrollCounter = 0;
		el = undefined;
		if (visual) visual = visual.remove();
	});
	window.addEventListener("mousemove", function (e) {
		cur = { x: e.pageX, y: e.pageY };
	});
})();

// visually indicate where autoScroll was started @ x,y coordinate (Grey "point" (cross/x shaped visual))
let visual;
function addVisual(x, y) {
	const old = document.getElementById("autoscroll-visual");
	if (old) old.remove(); //remove any old "point's"
	visual = document.createElement("div");
	visual.id = "autoscroll-visual";
	visual.style.position = "fixed";
	visual.style.top = y + "px";
	visual.style.left = x + "px";
	visual.style.width = "4px";
	visual.style.height = "4px";
	visual.style.marginLeft = "-2px";
	visual.style.marginTop = "-2px";
	visual.style.background = "grey";
	visual.style.display = "inline-block";
	visual.style.pointerEvents = "none";
	visual.style.zIndex = 9999;
	visual.style.outline = "1px dashed black";
	document.body.appendChild(visual);
}
