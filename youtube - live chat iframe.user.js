// ==UserScript==
// @name         youtube - live chat iframe
// @namespace    https://github.com/steventheworker
// @version      0.1
// @description  drag drop reposition live chat
// @author       steventheworker
// @grant        none
// @icon         https://www.youtube.com/s/desktop/f73a46b5/img/favicon.ico
// @match        https://www.youtube.com/*
// ==/UserScript==

function addStyleSheet() {
	const css = `
	 .markReadChatBtn {
		 position: absolute;
		 top: 0;
		 left: 0;
		 z-index: 1;
		 display: none;
	 }
    yt-live-chat-header-renderer {cursor: pointer;}
`,
		head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(css));
}

//globals
let mouseDown;
(function () {
	"use strict";
	addStyleSheet();
	addListeners(initPage().btn);
})();

//function findLiveChat() {
//    const q = doc.getElementsByTagName('ytd-live-chat-frame');
//    console.log('finding live chat...' + (q.length ? '\nfound live chat' : ''));
//    if (q.length) liveChat = q[0];
//    else setTimeout(findLiveChat, 1000);
//    //window.liveChat = liveChat;
//}
function markAsRead() {
	const $logs = doc.querySelector(
		"yt-live-chat-item-list-renderer #items"
	).children;
	for (let i = 0; i < $logs.length; i++) {
		$logs[i].style.opacity = 0.2;
	}
}
function initPage() {
	const btn = doc.createElement("button");
	btn.innerHTML = "Mark all as read";
	btn.className = "markReadChatBtn";
	btn.onmousedown = markAsRead;
	bod.prepend(btn); //add btn
	return { btn };
}
function addListeners(btn) {
	//keyboard events
	win.addEventListener("keypress", function (e) {
		if (e.key === "k" && e.metaKey) markAsRead();
	});
	//mouse events
	win.addEventListener("click", function (e) {
		// if (e.target.classList.contains("markReadChatBtn")) {
		// 	//markRead chat
		// 	return;
		// }
		setTimeout(() => (btn.style.display = "none"), 1000);
	});
	win.addEventListener("mousedown", function (e) {
		btn.style.display = "none";
		mouseDown = e;
	});
	win.addEventListener("mousemove", function (e) {
		if (
			!mouseDown ||
			!mouseDown.target.classList.contains("yt-live-chat-header-renderer")
		)
			return;
		const dX = e.pageX - mouseDown.pageX,
			dY = e.pageY - mouseDown.pageY;
		const liveChat = window.top.document.querySelector(
			"ytd-live-chat-frame"
		);
		let x = parseFloat(liveChat.style.left || 0) + dX;
		let y = parseFloat(liveChat.style.top || 0) + dY;
		liveChat.style.left = (x < 0 ? 0 : x) + "px";
		liveChat.style.top = (y < 0 ? 0 : y) + "px";
		console.log(liveChat.style.left, liveChat.style.top);
	});
	win.addEventListener("mouseup", function (e) {
		mouseDown = false;
	});
	// (on context menu) - popup markRead chat button
	win.addEventListener("contextmenu", function (e) {
		btn.style.display = "block";
		btn.style.top = e.pageY - 50 + "px";
		btn.style.left = e.pageX + "px";
	});

	//parent events
	if (win.top === window) return;
	win.top.addEventListener("keypress", function (e) {
		if (e.key === "k" && e.metaKey) markAsRead();
	});
}
