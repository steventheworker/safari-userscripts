// ==UserScript==
// @name         virtual-status-bar
// @namespace    github.com/steventheworker
// @version      0.2
// @description  Empower yourself with a feature that is solely built into Firefox (within the Apple ecosystem). Use autoscrolling on chrome/Safari with this userscript.
// @author       Steven G.
// @match        *://*/*
// @grant        none
// @icon         https://upload.wikimedia.org/wikipedia/en/7/71/Safari_14_icon.png
// ==/UserScript==

//helpers / boilerplate
const bod = doc.body;
function addStyleSheet() {
	const css = `
		 /* desktop virtual status bar */
		 #virtualStatusBar {
			 position: fixed;
			 bottom: 5px;
			 left: 5px;
			 z-index: 2147483646;
			 font-family: Helvetica !important;
			 font-size: 13px !important;
			 box-sizing: border-box !important;
			 padding: 4px !important;
			 color: #b6b6b6 !important;
			 background-color: rgba(44,44,44, 0.95) !important;
			 white-space: nowrap;
			 opacity: 1;
			 transition: opacity ease-in-out 0.333s;
			 display: none;
			 pointer-events: none;
		 }
		 #virtualStatusBar.rightVSB {left: auto;right: 5px;}
   `,
		head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(css));
}

/* init */
(function () {
	("use strict");
	console.log("virtual status bar added ... :) ... :) ... :) ...");
	addStyleSheet();
	bod.appendChild($virtualStatusBar());
})();

/* virtual status bar */
function $virtualStatusBar() {
	const el = doc.createElement("div");
	el.id = "virtualStatusBar";
	const maxRecursion = 7;
	function setTextFromLink(tar, currentRecursion) {
		if (tar && tar.nodeName === "A") {
			el.style.display = "block";
			el.style.opacity = 1;
			el.innerHTML = tar.href;
			return true;
		}
		if (currentRecursion == maxRecursion) return;
		if (tar.parentNode)
			return setTextFromLink(tar.parentNode, currentRecursion + 1);
	}
	win.addEventListener("mouseover", (e) => {
		if (!setTextFromLink(e.target, 1))
			el.style.opacity = 0; //hide statusbar
		else {
			if (
				e.pageX >= el.offsetLeft &&
				e.pageX <= el.offsetLeft + el.clientWidth &&
				e.pageY - win.scrollY >= el.offsetTop &&
				e.pageY - win.scrollY <= el.offsetTop + el.clientHeight
			) {
				//mouse is on statusbar
				el.classList.add("rightVSB"); //statusbar on right side
			} else el.classList.remove("rightVSB");
		}
	});
	el.addEventListener("transitionend", () => {
		if (el.style.opacity === 0 && el.style.display === "block") {
			el.style.display = "";
			el.style.opacity = "";
		}
	});
	return el;
}
