// ==UserScript==
// @name         ios-inspect-element
// @namespace
// @version      0.0.7
// @description  inject console (eruda) on-demand
// @author       steventheworker
// @match        *://*/*
// @grant        GM_addElement
// @run-at       document-body
// @license      WTFPL
// ==/UserScript==

let erudaActive = false;

function toggleInspectElementElement() {
	if (document.querySelector("#toggleInspectElementElement")) {
		// erudaActive is true when Eruda is currently open, so hide it first
		eruda[erudaActive ? "hide" : "show"]();
		erudaActive = !erudaActive;
		return;
	}

	erudaActive = true;
	const script = document.createElement("script");
	script.id = "toggleInspectElementElement";
	script.src = "//cdn.jsdelivr.net/npm/eruda";
	script.async = true;
	script.onload = () => {
		const initScript = document.createElement("script");
		initScript.textContent = `
          eruda.init({
             defaults: {
                displaySize: 80,
                transparency: 95
             }
          });
          eruda.show();
          if (eruda._entryBtn) eruda._entryBtn.hide();
       `;
		document.body.appendChild(initScript);
	};
	document.body.appendChild(script);
	if (typeof completion === "function") completion(location.href);
}

(function () {
	if (typeof window.$isSafari === "function" && !window.$isSafari()) return;

	window.addEventListener("keydown", (e) => {
		if (
			(e.key === "`" && e.metaKey) ||
			(e.key === "i" && e.metaKey && e.altKey)
		) {
			const w0 = document.body.clientWidth;
			const h0 = document.body.clientHeight;
			setTimeout(() => {
				if (
					document.body.clientWidth === w0 &&
					document.body.clientHeight === h0
				) {
					toggleInspectElementElement();
				}
			}, 333);
		}
	});
})();
