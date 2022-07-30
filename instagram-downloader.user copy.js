// // ==UserScript==
// // @name         instagram downloader
// // @namespace    http://github.com/steventheworker
// // @version      0.1
// // @description  download a grid (eg: saved, tagged, posts) by scroll to end / load as far down as you'd like to download
// // @author       steventheworker
// // @grant        none
// // @icon         https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/768px-Instagram_logo_2016.svg.png
// // @match        https://www.instagram.com/*

// // ==/UserScript==

// async function elDownload(el) {
// 	const image = await fetch(el.src);
// 	const imageBlog = await image.blob();
// 	const imageURL = URL.createObjectURL(imageBlog);

// 	const link = document.createElement("a");
// 	link.href = imageURL;
// 	link.download = "tag@filename";
// 	document.body.appendChild(link);
// 	link.click();
// 	document.body.removeChild(link);
// }
// function downloadFromOverlay() {
// 	const items = Array.from(
// 		document.querySelectorAll(
// 			'div[role="dialog"] video, div[role="dialog"] img'
// 		)
// 	).filter((el, i) => {
// 		if (el.nodeName === "IMG" && !el.alt.startsWith("Photo by "))
// 			return false;
// 		return true;
// 	});
// 	// items.forEach(elDownload);
// }
// function downloadGridElement(el, i) {
// 	el.click();
// 	downloadFromOverlay();
// }
// function downloadGrid(startIndex, endIndex) {
// 	const gridElements = Array.from(document.querySelectorAll("article a"));
// 	downloadGridElement(gridElements[0], 0);
// }

// //init
// (function () {
// 	"use strict";
// 	window.dl = downloadGrid;
// 	window.dl1 = downloadFromOverlay;

// 	dl();
// })();
