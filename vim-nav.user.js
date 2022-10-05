// ==UserScript==
// @name         vim-navigation
// @namespace    github.com/steventheworker
// @version      0.1
// @description  use j=pgDown & k=pgUp to scroll, open the blacklist/settings:  cmd+opt+ctrl+comma
// @author       Steven G.
// @match        *://*/*
// @grant        none
// @icon         https://github.com/televator-apps/vimari/raw/master/assets/logo.svg
// ==/UserScript==

const DEFAULT_F_STEPS = 750; //scroll rate for pageUp (F) & pageDown (f)
const DEFAULT_STEPS = 300; //scroll rate for down (j) & up (k)

//"website": true,   --no vim bindings
//"website": {letter: true}   --disable specific binding
//"website": {letter: {exception: "type"}}   --disable specific binding (with exception eg: www.youtube.com)
const blacklistJSON = {
	"www.youtube.com": { j: true, k: true, f: { path: "/watch" } },
	"www.reddit.com": { fSteps: 600, j: true, k: true },
	"www.twitter.com": { j: true, k: true },
	"www.google.com": { j: true, k: true },
};

//todo: use blacklistJSON instead of hardcoding
function checkBlacklisted(e) {
	if (
		(win.location.hostname === "www.youtube.com" &&
			((e.key === "f" && win.location.pathname === "/watch") ||
				e.key === "j" ||
				e.key === "k")) ||
		(win.location.hostname === "www.reddit.com" &&
			(e.key === "j" || e.key === "k")) ||
		(win.location.hostname === "www.twitter.com" &&
			(e.key === "j" || e.key === "k")) ||
		(win.location.hostname === "www.google.com" &&
			(e.key === "j" || e.key === "k"))
	)
		return true;
}
(function () {
	"use strict";
	window.addEventListener("keydown", (e) => {
		if (checkBlacklisted(e)) return;
		const siteSettings = blacklistJSON[win.location.hostname];
		if (e.key === "j" || e.key === "k" || e.key === "F" || e.key === "f") {
			win.scroll({
				left: 0,
				top:
					win.scrollY +
					(e.key === "j" || e.key === "f" ? 1 : -1) *
						(e.key === "F" || e.key === "f"
							? siteSettings?.fSteps || DEFAULT_F_STEPS
							: siteSettings?.jkSteps || DEFAULT_STEPS),
				behavior: "smooth",
			});
		}
	});
})();
