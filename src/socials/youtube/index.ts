// ==UserScript==
// @name         youtube
// @namespace    https://github.com/steventheworker
// @version      0.1
// @description  modify style, shortcuts WASD IJKL, sort by T N O, autoload new comments, [] playback speed
// @author       steventheworker
// @grant        none
// @icon         https://www.youtube.com/s/desktop/f73a46b5/img/favicon.ico
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// ==/UserScript==

import * as Style from "./style";
import { initDesktop } from "./initDesktop";
import { initMobile } from "./initMobile";

(function () {
	Style.addStylesheet();
	if (window.location.host.startsWith("m")) initMobile();
	else initDesktop();
})();
