// ==UserScript==
// @name         youtube - live chat iframe
// @namespace    https://github.com/steventheworker
// @version      0.1
// @description  drag drop reposition live chat
// @author       steventheworker
// @grant        none
// @icon         https://www.youtube.com/s/desktop/f73a46b5/img/favicon.ico
// @match        https://www.youtube.com/live_chat*
// ==/UserScript==

const globalCSS = `
	 .markReadChatBtn {
		 position: absolute;
		 top: 0;
		 left: 0;
		 z-index: 1;
		 display: none;
	 }
    yt-live-chat-header-renderer {cursor: pointer;}
`;
function addStyleSheet(css = "", id) {
	let style;
	if (id) style = doc.getElementById(id);
	if (!style) {
		style = doc.createElement("style");
		if (id) style.id = id;
		const head = doc.head || doc.getElementsByTagName("head")[0];
		head.appendChild(style);
	}
	style.type = "text/css";
	style.appendChild(doc.createTextNode(css || globalCSS));
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
	win.addEventListener("keyup", (e) => {
		if (e.key === "Escape" && doc.activeElement.id !== "input") {
			if (win.top.document.activeElement.nodeName === "IFRAME")
				win.top.document.activeElement.blur();
		}
	});
	win.addEventListener("keydown", function (e) {
		if (e.key === "k" && e.metaKey) {
			e.preventDefault(); //prev firefox shortcut (cmd+k: focus search/location bar)
			markAsRead();
		}
	});
	//mouse events
	win.addEventListener("click", function (e) {
		// if (e.target.classList.contains("markReadChatBtn")) {
		// 	//markRead chat
		// 	return;
		// }
		setTimeout(() => (btn.style.display = "none"), 1000);
	});
	let cursorResizeOrientation = "";
	win.addEventListener("mousedown", function (e) {
		btn.style.display = "none";
		mouseDown = { target: e.target, pageX: e.pageX, pageY: e.pageY };
		mouseDown.cursorResizeOrientation = cursorResizeOrientation;
	});
	const RSX = 10; //how far into a container resizing is enabled
	win.addEventListener("mousemove", function (e) {
		const liveChat = window.top.document.querySelector(
			"ytd-live-chat-frame"
		);
		cursorResizeOrientation = "";
		const rect = liveChat.getBoundingClientRect();
		if (e.pageY >= 0 /* + rect.top */ && e.pageY <= RSX /* + rect.top */) {
			//resize top (north)
			cursorResizeOrientation += "n";
		}
		if (
			e.pageY >= /* rect.top + */ rect.height - RSX &&
			e.pageY <= /* rect.top + */ rect.height
		) {
			//resize bottom (south)
			cursorResizeOrientation += "s";
		}
		if (
			e.pageX >= 0 /* + rect.left */ &&
			e.pageX <= RSX /* + rect.left */
		) {
			//resize left (east)
			cursorResizeOrientation += "w";
		}
		if (
			e.pageX >= /* rect.left + */ rect.width - RSX &&
			e.pageX <= /* rect.left + */ rect.width
		) {
			//resize right (west)
			cursorResizeOrientation += "e";
		}
		if (cursorResizeOrientation)
			addStyleSheet(
				`* {cursor: ${cursorResizeOrientation}-resize !important;}`,
				"globalCursor"
			);
		const cachedCursorResizeOrientation =
			mouseDown?.cursorResizeOrientation;
		if (cachedCursorResizeOrientation) {
			let dX = e.pageX - mouseDown.pageX,
				dY = e.pageY - mouseDown.pageY;
			if (
				cachedCursorResizeOrientation.endsWith("w") ||
				cachedCursorResizeOrientation.endsWith("e")
			) {
				if (cachedCursorResizeOrientation.endsWith("w")) {
					let x = parseFloat(liveChat.style.left || 0) + dX;
					liveChat.style.left = (x < 0 ? 0 : x) + "px";
					dX = dX * -1;
				} else mouseDown.pageX = e.pageX;
				let w = rect.width + dX;
				console.log(w);
				const setArgs = [
					"width",
					(w < RSX * 2 ? RSX * 2 : w) + "px",
					"important",
				];
				liveChat.style.setProperty.apply(liveChat.style, setArgs);
				liveChat.children[0].style.setProperty.apply(
					liveChat.children[0].style,
					setArgs
				);
			}
			if (
				cachedCursorResizeOrientation.startsWith("n") ||
				cachedCursorResizeOrientation.startsWith("s")
			) {
				if (cachedCursorResizeOrientation.startsWith("n")) {
					let y = parseFloat(liveChat.style.top || 0) + dY;
					liveChat.style.top = (y < 0 ? 0 : y) + "px";
					dY = dY * -1;
				} else mouseDown.pageY = e.pageY;
				let h = rect.height + dY;
				liveChat.style.setProperty("min-height", "auto", "important");
				liveChat.style.setProperty("flex", "unset", "important");
				const setArgs = [
					"height",
					(h < RSX * 2 ? RSX * 2 : h) + "px",
					"important",
				];
				liveChat.style.setProperty.apply(liveChat.style, setArgs);
				liveChat.children[0].style.setProperty.apply(
					liveChat.children[0].style,
					setArgs
				);
			}
		}
		if (!mouseDown && !cursorResizeOrientation)
			doc.getElementById("globalCursor")?.remove();

		//move live chat
		if (
			cachedCursorResizeOrientation ||
			!mouseDown ||
			!mouseDown.target.classList.contains("yt-live-chat-header-renderer")
		)
			return;
		const dX = e.pageX - mouseDown.pageX,
			dY = e.pageY - mouseDown.pageY;
		let x = parseFloat(liveChat.style.left || 0) + dX;
		let y = parseFloat(liveChat.style.top || 0) + dY;
		liveChat.style.left = (x < -40 ? -40 : x) + "px";
		liveChat.style.top = (y < -30 ? -30 : y) + "px";
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
	win.top.addEventListener("keydown", (e) => {
		if (e.key === "k" && e.metaKey) {
			e.preventDefault(); //prev firefox shortcut (cmd+k: focus search/location bar)
			markAsRead();
		}
	});
}
