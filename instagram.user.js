// ==UserScript==
// @name         instagram
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  wasd
// @author       steventheworker
// @grant        none
// @icon         https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/768px-Instagram_logo_2016.svg.png
// @match        https://www.instagram.com/*

// ==/UserScript==
//- Wasd dashScrollUp dashScrollDown leftPhoto rightPhoto (if multi-photo pic)
//&&&&&&& - Never show me the same pictures again (only remove the one’s you’ve scrolled past / visibly scrolled past)

function prevPhoto() {}
function nextPhoto() {}

function handleKeys() {
	let old = window.scrollY;
	let scrollY = window.scrollY;
	for (let k in keysdown) {
		if (k === "w" || k === "i") scrollY -= 300; //pgup
		if (k === "a" || k === "j") prevPhoto(); //prev photo (multiple photos) (topmost visible post)
		if (k === "s" || k === "k") scrollY += 300; //pgdn
		if (k === "d" || k === "l") nextPhoto(); //next photo (multiple photos) (topmost visible post)
	}
	window.scroll({ left: 0, top: scrollY, behavior: "smooth" });
}

let runningPg;
const keysdown = {};
function startRunningPg() {
	runningPg = setInterval(handleKeys, 128);
	handleKeys();
}

/* double escape key (w/ timeout) = default esc
	
	don't exit full screen mode w/ esc (unless it's a double esc!)
*/
//config
const DBL_ESC_TIMEOUT = 333;
let dblEscTimeout; //setTimeout
function newEscape(e) {
	// either simulate the default escape functionality   OR   do whatever
	//exit any overlays/popups (comment view / picture view)
	console.log("new escape", e);
	doc.querySelector('div[role="presentation"] button')?.click();
	//send virtual escape!?!??!??
}
function dbl_esc_key(e) {
	if (!dblEscTimeout && e.type === "keydown") e.preventDefault();
	if (dblEscTimeout && e.type === "keyup") {
		//perform default esc
		console.log("default escape?");
		if (dblEscTimeout) clearTimeout(dblEscTimeout);
		dblEscTimeout = undefined;
		return true;
	}
	//block default esc
	e.stopImmediatePropagation();
	// e.stopPropagation();
	if (e.type === "keyup") {
		newEscape(e);
		dblEscTimeout = setTimeout(() => {
			if (dblEscTimeout) clearTimeout(dblEscTimeout);
			dblEscTimeout = undefined;
		}, DBL_ESC_TIMEOUT);
	}
	return false;
}

//init
(function () {
	"use strict";
	window.addEventListener("keydown", function (e) {
		if (e.key === "Escape") return dbl_esc_key(e);
		if (isInput(document.activeElement)) return;
		keysdown[e.key] = 1;
		if (runningPg) return;
		startRunningPg();
	}),
		true;
	window.addEventListener(
		"keyup",
		function (e) {
			if (e.key === "Escape") return dbl_esc_key(e);
			if (isInput(document.activeElement)) return;
			delete keysdown[e.key];
			if (!Object.keys(keysdown).length)
				runningPg = clearInterval(runningPg);
		},
		true
	);
})();
