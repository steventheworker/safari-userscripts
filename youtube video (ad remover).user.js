// ==UserScript==
// @name         youtube ?v watch video (ad remove)
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  remove advertisement's from all youtube video's
// @author       steventheworker
// @grant        none
// @icon         https://www.youtube.com/s/desktop/f73a46b5/img/favicon.ico
// @match        https://www.youtube.com/watch?v=*

// ==/UserScript==

//advertisement element
//<div class="ytp-play-progress ytp-swatch-background-color" style="left: 0px; transform: scaleX(0.0097676773200648);"></div>
//.ad-interrupting .ytp-play-progress.ytp-swatch-background-color
//background === "#fc0"    (yellow) (ad)
//background === "" (red) (playing)
//document.getElementsByClassName('ytp-play-progress');

(function () {
	"use strict";
})();
