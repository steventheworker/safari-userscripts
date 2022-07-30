// ==UserScript==
// @name         tiktok
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  tiktok downloader, (mobile) login prompt remover
// @author       steventheworker
// @grant        none
// @icon         https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-common-sg/mtact/static/images/logo_144c91a.png
// @match        https://www.tiktok.com/*
// ==/UserScript==

//helper fns
function addStyleSheet() {
	const css = `
		@media only screen and (min-width: 320px) and (max-width: 414px) {
			.footer-guide,
			.tiktok-dialog {
				display: none !important;
			}
		}
	`,
		head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(css));
}
const removeByTesting = () => {
	Array.from(doc.getElementsByClassName("tiktok-bottom")).forEach(
		(el) => (el.style.bottom = "0px")
	);
	Array.from(doc.getElementsByClassName("guide-container")).forEach((el) => {
		if (el.classList.contains("middle"))
			return el.parentNode.parentNode.remove();
		el.remove();
	});
	setTimeout(removeByTesting, 333);
};
function removeLoginPrompts() {
	if (!(bod.clientWidth >= 320 && bod.clientWidth <= 414)) return; //desktop/tablet should be logged in (this fn is mobile only) (iphone se - 8plus dimensions)
	waitForEl(`button.not-now`, true).then((el) => el.click());
	removeByTesting(); //setTimeout loop
}

//init
(function () {
	console.log("tiktok userscript loaded 🍿");
	addStyleSheet();
	removeLoginPrompts();
	//the downloader
	/*
	create tiktoks.txt (one link per line) & paste (joined) output string into it
	, FINALLY run the download command in terminal:

	download command:
			yt-dlp  --verbose -ci --download-archive dl-log.txt  --batch-file=tiktoks.txt

Check if downloads succeeded by:
- comparing line numbers: dl-log.txt vs tiktoks.txt
	- if dl-log < lines than tiktoks.txt:
		- rerun download command in terminal
		- Check for red console errors and download manually
		(happens when title too long / private vids)
*/
	const getLikedVids = () =>
		Array.prototype.slice
			.call(
				doc.querySelectorAll(
					'div[data-e2e="user-liked-item-list"] div[data-e2e="user-liked-item"] a'
				)
			)
			.map((el, i) => el.href);
	const dlOutput = () => {
		document.write(`<small>
		${JSON.stringify(getLikedVids())}
		<br />.join("\\n")</small>
		<br /><br />
		<b>download command:</b><br />
		&emsp;&emsp;yt-dlp  --verbose -ci --download-archive dl-log.txt  --batch-file=tiktoks.txt`);
	};
	window.download = dlOutput;
	window.downloader = dlOutput;
	window.dl = dlOutput;
	window.dllikes = dlOutput;
	window.downloadAll = dlOutput;
	window.downloadLikes = dlOutput;
	window.getLikes = dlOutput;
})();

// wait for element to exist
// https://stackoverflow.com/a/61511955
function waitForEl(selector, dc) {
	return new Promise((resolve) => {
		if (document.querySelector(selector))
			return resolve(document.querySelector(selector));
		const observer = new MutationObserver((mutations) => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				if (dc) observer.disconnect();
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}
