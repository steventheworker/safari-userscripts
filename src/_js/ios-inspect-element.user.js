// ==UserScript==
// @name         ios-inspect-element
// @namespace
// @version      0.0.1
// @description  inject console (eruda) on-demand
// @author       steventheworker
// @match        *://*/*
// @grant        GM_addElement
// @run-at       document-body
// @license      WTFPL
// ==/UserScript==

(function () {
	const script = document.createElement("script");

	script.src = "//cdn.jsdelivr.net/npm/eruda";
	script.async = true;
	script.onload = () => {
		const initScript = document.createElement("script");
		initScript.textContent = "eruda.init();";
		document.body.appendChild(initScript);
	};
	document.body.appendChild(script);

	completion(location.href);
})();
