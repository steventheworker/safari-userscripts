// ==UserScript==
// @name         instagram downloader
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  ((dl)) download a grid (eg: saved, tagged, posts) by scrolling to end / load as many as you'd like to download, ((dl1)) download the current item open in presentation mode, ((dlauto)) download EVERYTHING (scrolls for you)
// @author       steventheworker
// @grant        none
// @icon         https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/768px-Instagram_logo_2016.svg.png
// @match        https://www.instagram.com/*
// ==/UserScript==

let gridElements, dlIndex, dlStopIndex;
let downloadedOnce;

const downloadables = (pres) =>
	Array.from(pres.querySelectorAll("img, video")).filter((el, i) => {
		if (el.nodeName === "IMG" && !el.alt.startsWith("Photo by "))
			return false;
		return true;
	});
const getPres = () => doc.querySelector('article[role="presentation"]');
function downloadFromOverlay(pres) {
	console.log("download img/video");
	if (!pres) pres = getPres();
	const nextBtn = pres.querySelector('button[aria-label="Next"]');
	downloadedOnce = true;
	if (nextBtn) nextBtn.click();
	else {
		downloadedOnce = false;
		nextDL();
		gridElements[dlIndex].click();
	}
}
function presLoaded(pres) {
	const isGallery =
		gridElements[dlIndex].children[1] &&
		gridElements[dlIndex].children[1].children[0].children[0].ariaLabel ===
			"Carousel";
	const galleryLoaded = pres.querySelector('button[aria-label="Next"]');
	console.log(isGallery, !!galleryLoaded);
	if (!isGallery || galleryLoaded) return true;
	return false;
}
function downloadLoop() {
	pres = getPres();
	if (pres && (presLoaded(pres) || downloadedOnce)) {
		window.pres = pres; //debug line
		downloadFromOverlay(pres);
		if (dlIndex == dlStopIndex - 1) return setTimeout(closeDLUI, 500);
	} else gridElements[dlIndex].click();
	setTimeout(downloadLoop, 125);
}
function downloadGrid(startIndex, endIndex) {
	gridElements = Array.from(doc.querySelectorAll("article a"));
	window.gridElements = gridElements; //debug line
	dlIndex = startIndex || 0;
	dlStopIndex = endIndex || gridElements.length;
	$dlUI();
	downloadLoop();
}

// init
(function () {
	"use strict";
	addStyleSheet();
	addEventListeners();
	window.dl = downloadGrid;
	window.dl2 = downloadFromOverlay;
	window.downloadFromOverlay = downloadFromOverlay;
	// window.dl1 = downloadFromOverlay;
	// window.dlauto = //todo:
	// setTimeout(dl, 4000);
})();

// style / UI
function addEventListeners() {
	// doc.body.addEventListener(
	// 	"load",
	// 	function (e) {
	// 		const $script = doc.querySelector(
	// 			"img[src='myResource.js'], video[src='']"
	// 		);
	// 		if (!e.target.isEqualNode($script)) return;
	// 		// Callback code
	// 	},
	// 	true
	// );
}
function addStyleSheet() {
	const css = `
		#dlContainer {
         z-index: 2147483645;
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
         background: rgba(0, 255, 0, 0.15);
         pointer-events: none;
         text-shadow: 0 0 1 black;
      }
      .dlState {
         width: 3em;
         margin-top: 1em;
         margin-left: auto;
         margin-right: auto;
         font-size: 3em;
         text-align: center;
      }
	`,
		head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(css));
}

const closePres = () =>
	doc.querySelector('svg[aria-label="Close"]').parentNode.click();
const closeDLUI = () => doc.getElementById("dlContainer").remove();
const nextDL = () => {
	doc.getElementsByClassName("dlIndex")[0].textContent = ++dlIndex + 1;
};

function $state() {
	const container = doc.createElement("div");
	container.classList.add("dlState");

	//variables - UI references
	const $dlIndex = doc.createElement("span");
	$dlIndex.classList.add("dlIndex");
	$dlIndex.appendChild(doc.createTextNode(dlIndex + 1));
	const $dlStopIndex = doc.createElement("span");
	$dlStopIndex.classList.add("dlStopIndex");
	$dlStopIndex.appendChild(doc.createTextNode(dlStopIndex));

	//add to container
	container.appendChild($dlIndex);
	container.appendChild(doc.createTextNode("/"));
	container.appendChild($dlStopIndex);
	return container;
}
function $dlUI() {
	if (doc.getElementById("dlContainer")) return;
	const container = doc.createElement("div");
	container.id = "dlContainer";
	container.appendChild($state());
	doc.body.appendChild(container);
}
