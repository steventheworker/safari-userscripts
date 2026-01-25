// ==UserScript==
// @name               globalSettingsContentScript
// @description        content script example ("from changes to `@grant` and `@inject-into`" issue on userscripts github)
// @author             steventheworker
// @version            1.0
// @license            GPL-3.0-or-later
// @match              *://*.example.com/*
// @grant              GM_xmlhttpRequest
// @grant              GM.deleteValue
// @grant              GM.getValue
// @grant              GM.setValue
// @inject-into        content
// @run-at             document-start
// ==/UserScript==

(function () {
	alert(333);
	//listen to actions: (called via:   window.postMessage({ action: "applySetting", ...the action data...}, "*");   )
	window.addEventListener("message", (event) => {
		if (event.source !== window) return; // Ensure the message is coming from a trusted source (optional but recommended)
		const { data /*, source, target, currentTarget*/ } = event;
		const { action } = data;
		if (action === "exampleAction") {
			const { param1 } = data;
			console.log(`triggered exampleAction1 w/ param1: ${param1}`);
		} else if (action === "exampleAction2") {
			console.log(`triggered exampleAction2`);
		} else console.log(`action "${action}" is not a valid action`);
	});

	//@ts-ignore
	GM_xmlhttpRequest({
		method: "GET",
		url: "https://api.github.com/users/mralexgray/repos",
		responseType: "json",
		onload: function (response: any) {
			console.log(response); // Execute the JavaScript code (w/ @inject-into === "content" context)
		},
	});

	//send an action
	window.postMessage({ action: "exampleAction", param1: true }, "*");
	window.postMessage({ action: "exampleAction2" }, "*");
})();
