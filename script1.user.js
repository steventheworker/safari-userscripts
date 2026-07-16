// ==UserScript==
// @name        script1
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @exclude     https://www.youtube.com/embed/*
// @exclude     https://accounts.youtube.com/RotateCookiesPage*
// @exclude     https://accounts.google.com/RotateCookiesPage*
// @exclude     /^https?:\/\/ogs\.google\..*$/
// @exclude     https://www.google.com/recaptcha/enterprise/anchor*
// @exclude     https://duckduckgo.com/post3.html
// @exclude     https://www.facebook.com/instagram/login_sync/
// @exclude     https://entra.microsoft.com/*
// @exclude     https://*.reactblade.portal.azure.net/*
// @grant       none
// @version     1.0
// @author      -
// @description 6/6/2024, 11:32:13 PM -- requests injection into the page context
// @run-at      document-start
// ==/UserScript==

function initInject() {
	console.log(`injectApplicable 1️⃣ - ${location.href}`);
	setTimeout(() => {
		// source: "safari-userscripts",
		postMessage({ action: "injectApplicable" }, "*"); //request USERSCRIPTS_URL folder be injected
		// checkInjectCompleted();
	}, 0);
}
if (document.readyState !== "loading") initInject();
else document.addEventListener("DOMContentLoaded", initInject);

/*
    whatever your first running script is, should add the following to the window (see globals.user.js):
        clearUserScriptCache  &  refreshUserScriptCache
        loadUserscript
        enableUserscript      &  disableUserscript
        logInjectedUserscripts
*/
