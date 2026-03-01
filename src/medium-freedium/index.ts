// ==UserScript==
// @name         medium-freedium
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  check if content="Medium" for a meta tag ? if so, add UI (freedium btn)
// @author       steventheworker
// @grant        none
// @icon         https://miro.medium.com/v2/resize:fit:720/format:webp/1*jfdwtvU6V6g99q3G7gq7dQ.png
// @match        *://*/*
// ==/UserScript==

function redirectToFreedium() {
	window.location.href = "https://freedium.cfd/" + window.location.href;
}
function MediumPage() {
	const freediumBtn = doc.createElement("button");
	freediumBtn.setAttribute(
		"style",
		"position: fixed; top: 0; left: 0; z-index: 99999;",
	);
	window.addEventListener("click", (e: Event) => {
		if (e.target === freediumBtn) redirectToFreedium();
	});
	// label
	const freediumBtnLabel = doc.createTextNode("Freedium");
	freediumBtn.appendChild(freediumBtnLabel);
	//add container
	doc.body.appendChild(freediumBtn);
}

(function () {
	setTimeout(() => {
		const headChildren = document.head.children;
		let isMedium = false;
		for (const i in headChildren) {
			const child = headChildren[i];
			if (child.tagName !== "META") continue;
			if (child.getAttribute("content") == "Medium") {
				isMedium = true;
				break;
			}
		}
		if (!isMedium) return;
		MediumPage();
	}, 2000);
})();
