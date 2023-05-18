// ==UserScript==
// @name         youtube
// @namespace    https://github.com/steventheworker
// @version      0.1
// @description  modify style, shortcuts WASD IJKL, sort by T N, autoload new comments, [] playback speed
// @author       steventheworker
// @grant        none
// @icon         https://www.youtube.com/s/desktop/f73a46b5/img/favicon.ico
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// ==/UserScript==

let vID, //vid currently playing...  eg: ?v=
	commentSortType,
	commentsbreakpoint;

function YTPlayer() {
	return (
		doc.getElementById("movie_player") ||
		doc.getElementsByClassName("html5-video-player")[0]
	);
}
let areButtonsGone = false;
function removeButtons() {
	if (areButtonsGone) return;
	areButtonsGone = true;
	// auto disable & remove autoplay button
	const btn = doc.querySelector(".ytp-right-controls button");
	if (btn.title.endsWith("on")) btn.click();
	btn.remove();
	// auto remove playnext button
	doc.querySelector(".ytp-play-button").nextSibling.remove();
}
function onMediaLoad() {
	if (win.location.pathname !== "/watch") return;
	removeButtons();
	getcommentsbreakpoint();
	const newVidID = getVidID();
	if (newVidID === vID) return;
	//set vars / reset defaults
	commentSortType = "top";
	if (vID) setTimeout(() => (window.prevScrollY = 0)); //reset prevScroll if new vid (after the vid that's already been loaded)
	vID = newVidID;
	onVideoChange();
}
function getVidID() {
	return win.location.search.replace("?v=", "");
}
function numComments() {
	return (
		parseFloat(
			(
				doc.querySelector("ytd-comments-header-renderer #count span") ||
				{}
			).textContent
		) | 0
	);
}
function videoFixed(sticky = true) {
	function $missingVidSpace(player) {
		const el = doc.createElement("div");
		el.id = "missingVidSpace";
		el.style.height = player.clientHeight + "px";
		el.style.width = player.clientWidth + "px";
		return el;
	}
	const theaterContainer = doc.getElementById("player-theater-container");
	const player = theaterContainer.innerHTML
		? theaterContainer
		: doc.getElementById("player");
	if (sticky) {
		player.style.top =
			doc.getElementById("masthead-container").clientHeight + "px";
		player.style.position = "fixed";
		player.style.zIndex = 301;
		if (!doc.getElementById("missingVidSpace"))
			player.parentNode.prepend($missingVidSpace(player));
	} else {
		player.style.position = "";
		player.style.top = "";
		doc.getElementById("missingVidSpace").remove();
	}
}
window.vf = videoFixed;
function autoLoadComments() {
	if (!doc.querySelector('.ytp-live-badge[disabled="true"]')) return; //no comments exist until the live is over
	const commentsHeader = doc.querySelector("#comments #contents #header"); //comments section is not closed if exists
	const headerMessageNode =
		doc.querySelector("#comments #contents #message span") || {};
	if (
		numComments() >= 0 ||
		commentsHeader ||
		headerMessageNode.textContent === "Comments are turned off. "
	) {
		videoFixed(false);
		win.scroll(0, prevScrollY);
		setTimeout(sortByNew, 1500);
	} else {
		setTimeout(() => autoLoadComments(), 500);
		if (win.scrollY >= commentsbreakpoint * 0.8) return; // user has already shown themselves the comments //todo: add || !isCommentsSectionEmpty
		videoFixed();
		scrollToComments();
	}
}
function onVideoChange(params) {
	console.log("video loaded: ", vID);
	console.log("start autoscroll logic");

	//hide the stuff that blocks the comments section
	if (doc.body.clientWidth < 1016 && isPlaylistVideo()) playlistToggle();
	document.querySelector("#related").classList.remove("cancelSpoiler");

	window.prevScrollY = window.scrollY;
	autoLoadComments();
}

//comments
function sortByNew(sortByOld) {
	commentSortType = sortByOld ? "old" : "new";
	const isWatching = win.location.pathname === "/watch";
	doc.querySelectorAll("#sort-menu a")[
		sortByOld || isWatching ? 1 : 2
	].click();
}
function sortByTop() {
	commentSortType = "top";
	doc.querySelectorAll("#sort-menu a")[0].click();
}
function getcommentsbreakpoint() {
	const desc = getVidDescSection();
	return (commentsbreakpoint =
		(doc.body.clientWidth > 1016 ? 0 : 165) +
		desc.scrollHeight +
		desc.offsetTop);
}
function scrollToComments() {
	console.log("scrolled to " + commentsbreakpoint);
	win.scroll(0, commentsbreakpoint);
}

//vid description
function getVidDescSection(params) {
	return (
		doc.querySelector("#content #meta.ytd-watch-flexy") || {
			scrollHeight: 0,
			offsetTop: 0,
		}
	);
}

//playlists
function isPlaylistVideo() {
	const playlist = doc.querySelector("ytd-playlist-panel-renderer");
	return !playlist || playlist.hidden ? false : true;
}
function playlistToggle() {
	doc.querySelector("ytd-playlist-panel-renderer #expand-button").click();
}

//shorts
function transformShortsLink(tar) {
	const href = tar.getAttribute("href");
	if (!href.startsWith("/shorts/")) return;
	tar.setAttribute("href", "/watch?v=" + href.slice(8));
}
function shortsTraversal(tar) {
	if (tar.id === "content") return; //reached a dead-end
	const videoComponentEls = [
		"YTD-COMPACT-VIDEO-RENDERER",
		"YTD-VIDEO-RENDERER",
		"YTD-GRID-VIDEO-RENDERER",
		"YTD-REEL-ITEM-RENDERER",
	];
	if (videoComponentEls.indexOf(tar.nodeName) === -1)
		return shortsTraversal(tar.parentNode); // traverse until reach a videoComponent
	// found a videoComponent! ==> transform all links
	Array.from(tar.querySelectorAll("a")).forEach((el) =>
		transformShortsLink(el)
	);
}
//events
function ListenEvents() {
	//youtube shorts links -> regular link (/shorts/vID => /watch?v=vID)
	win.addEventListener("mousedown", (e) => shortsTraversal(e.target));
	win.addEventListener("mouseup", (e) => {
		setTimeout(() => {
			//check if clicked a shorts link & redirect
			const path = window.location.pathname;
			if (!path.startsWith("/shorts/")) return;
			window.location.href = "/watch?v=" + path.slice(8);
		});
	});

	//Listen to the youtube player for video loads
	win.addEventListener(
		"loadstart",
		function (e) {
			if (!(e.target instanceof win.HTMLMediaElement)) return;
			if (YTPlayer()) onMediaLoad();
		},
		true
	);
	//shortcuts WATCH VIDEO / channel page
	win.addEventListener(
		"keydown",
		function (e) {
			if ($isInput(doc.activeElement)) return;

			//autofocus (it's starting to get iffy, it only seems to work ("/") on the homepage, otherwise does nothing)
			if (e.key === "/") doc.querySelector("input#search").focus();
			//remap keys WASD IJKL
			if (e.key === "w" || e.key === "i") {
				win.scroll({
					left: 0,
					top: win.scrollY - 300,
					behavior: "smooth",
				}); //pgup
				if (e.key === "i") e.stopImmediatePropagation();
			}
			if (e.key === "a" || e.key === "j") triggerKeyDown("ArrowLeft"); //map to rewind
			if ((e.key === "s" || e.key === "k") && !e.metaKey) {
				if (e.key === "k") e.stopImmediatePropagation();
				win.scroll({
					left: 0,
					top: win.scrollY + 300,
					behavior: "smooth",
				}); //pgdn
			}
			if (e.key === "d" || e.key === "l") triggerKeyDown("ArrowRight"); //map to forward
			if (e.key === "l" || e.key === "j" || e.key === "d")
				e.stopPropagation(); //prevent default / map to Arrow's (5 sec fast-forward/rewind, rather than 10 sec)

			//[ ] playback speed
			if (e.key === "[") triggerKeyDown(",", { shift: true });
			if (e.key === "]") triggerKeyDown(".", { shift: true });

			//T N O sort
			if (e.key === "O") sortByNew(true); //sort by old
			if (e.key === "T") {
				e.stopPropagation(); // triggerKeyDown("t"); //since t = toggle theater mode       we undo the toggle
				if (commentSortType === "top") return;
				scrollToComments();
				sortByTop();
			}
			if (e.key === "N") {
				if (window.waitedAllowYoutube) delete window.waitedAllowYoutube;
				else {
					//if key has been held for a second you can run the original youtube shortcut
					if (!window.waiting4u)
						window.waiting4u = setTimeout(
							() => (window.waitedAllowYoutube = 1),
							1000
						);
					e.stopImmediatePropagation();
				}
				if (commentSortType === "new") return;
				scrollToComments();
				sortByNew();
			}
		},
		true
	);
	win.addEventListener("keyup", function (e) {
		if (e.key === "N") window.waiting4u = clearTimeout(window.waiting4u);
	});
	//shortcuts search results page // @match        https://www.youtube.com/results?search_query=*
	win.addEventListener("keydown", function (e) {
		if (win.location.pathname !== "/results") return;
		function clickItem(menuIndex, itemIndex) {
			doc.querySelector("#filter-menu a").click();
			doc.querySelectorAll(
				"#filter-menu ytd-search-filter-group-renderer"
			)
				[menuIndex].querySelectorAll("a")
				[itemIndex].click();
		}
		if ($isInput(doc.activeElement)) return;
		//shortcuts
		if (e.key === "H") clickItem(0, 0);
		if (e.key === "D") clickItem(0, 1); //Today = "Day" (D)
		if (e.key === "W") clickItem(0, 2);
		if (e.key === "M") clickItem(0, 3);
		if (e.key === "Y") clickItem(0, 4);
		if (e.key === "U" || e.key === "N") clickItem(4, 1); //Upload Date = "New" (N)
		if (e.key === "V" || e.key === "T" || e.key === "P") clickItem(4, 2); //View Count = "Top" (T) = "Popular" (P)
		if (e.key === "R") clickItem(4, 3);
	});
	win.addEventListener("dblclick", function (e) {
		const $relatedSection = getRelatedSection(e.target);
		if ($relatedSection) {
			//toggle class .cancelSpoiler
			$relatedSection.classList[
				$relatedSection.classList.contains("cancelSpoiler")
					? "remove"
					: "add"
			]("cancelSpoiler");
		}
	});
	doc.querySelector('input[id="search"]').addEventListener("keydown", (e) => {
		if (e.key === "Enter" && e.metaKey) {
			e.preventDefault();
			e.stopImmediatePropagation();
			const query = encodeURIComponent(e.target.value);
			win.open(
				`https://www.youtube.com/results?search_query=${query}`,
				"_blank"
			);
		}
	});
}

function getRelatedSection(tar) {
	if (tar.id === "related") return tar;
	if (!tar) return null;
	return getRelatedSection(tar.parentNode);
}

//style
function addStyleSheet() {
	const css = `
    ytd-watch-flexy .title {font-size: 2.2em !important;}

    ytd-compact-video-renderer:not([watch-feed-big-thumbs]) ytd-thumbnail.ytd-compact-video-renderer {width: 146.1px;}

    /* comment body - increase font-size */
    #content-text.ytd-comment-renderer {font-size: 1.61rem;line-height:2.3rem;}
		/* comment replies (nested) */
    ytd-comment-replies-renderer #content-text.ytd-comment-renderer {
         font-size: 1.5rem;line-height: 2.14rem;
    }
    ytd-comment-replies-renderer #main {margin-top: -15px;margin-left: -15px;}
    ytd-comment-replies-renderer ytd-comment-renderer {margin-top: 10px;}
	 		/* increase profile photo size */
	yt-img-shadow.ytd-comment-renderer {
		width: 75px !important;height: 75px !important;
		margin-top: -10px;margin-left: -10px;
	}
	 		/* increase (nested) profile photo size */
    ytd-comment-renderer:not([comment-style=backstage-comment])[is-reply] #author-thumbnail.ytd-comment-renderer yt-img-shadow.ytd-comment-renderer {
			width: 50px !important;height: 50px !important;
         margin-top: -10px;margin-left: -10px;
    }
	 		/* make comments show leftmost (undo margin-left/padding-left) */
    #author-thumbnail.ytd-comment-renderer yt-img-shadow.ytd-comment-renderer {width: 69px; height: 69px;margin-left: -14.5px;margin-top: -14.5px;}
    tp-yt-paper-button.ytd-button-renderer {font-size: 1.6rem;}

    /* related */
    #related #video-title.ytd-compact-video-renderer {font-size: 1.22rem;}
    #related  {
      max-height: 100px;
      overflow: hidden;
      opacity: 0.3;
      outline: 1px dashed silver;
      cursor: pointer;
    }
    #related #items {pointer-events: none;}
    #related:active {opacity: 0.666;}
    @media (min-width: 1016px)  {
      #related #items {pointer-events: inherit;}
      #related {max-height: inherit;opacity: inherit;cursor: inherit;outline: inherit;}
    }
    #related.cancelSpoiler #items {
      pointer-events: inherit;
    }
    #related.cancelSpoiler {
      max-height: inherit;
      opacity: 0.45;
    }

    /* live chat */
    ytd-live-chat-frame {
      position: fixed;
      left: calc(100% - 500px);
      top: 0;
      z-index: 99999;
      transform: scale(1, 1);
      opacity: 0.77;
    }
    ytd-live-chat-frame #show-hide-button {
      position: absolute;
      top: 0;
      right: 6em;
    }
    ytd-live-chat-frame  iframe, ytd-live-chat-frame {width: 500px !important;}

	 /* darker mode */
	 .darkSearchResults {background: black !important;}
	 .darkSearchResults li span, .darkSearchResults li:hover {color: grey !important;}
	 .darkSearchResults li {color: white !important;}
	 .darkSearchResults ul li:last-child div {background: black!important;} /* report search item */

	 /* theater mode (not fullscreen) full height */
	 ytd-watch-flexy[theater-requested_]:not([fullscreen]) #player-theater-container {
		 height:calc(100vh - 56px) !important; max-height:calc(100vh - 56px) !important;min-height:calc(100vh - 56px) !important;
	 }

	 /* outline focused thumbnail (search results) */
	 .ytd-search a:focus {text-decoration: underline;}
`,
		head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(css));
}
function shouldMainRun() {
	//run mainFn only once
	if (window.alreadyLoaded) return false;
	return (window.alreadyLoaded = true);
}

//init
function mainFn() {
	//init, runs once (ever) on first load
	if (!shouldMainRun()) return;
	ListenEvents();
	console.log("listening for new events...");
	addStyleSheet();
}
function waitForEls() {
	waitForEl('ul[role="listbox"]').then((el) =>
		el.parentNode.classList.add("darkSearchResults")
	);
}

function commonInit() {
	console.log("userscript has been loaded. 👩🏿‍💻");
}
function mobileInit() {
	if (commonInit() === false) return;
	function checkOpenYoutubeBanner() {
		if (window.scrollY > 0) return;
		window.scroll(0, 65); //hide top banner (open in youtube)
		//force bottom bar to be shown (eg: Home | Shorts | Subscriptions | Library)
		const bar = document.getElementsByClassName("pivot-bar-slide-out")[0];
		const showBB = () => bar?.classList.remove("pivot-bar-slide-out");
		return setTimeout(showBB, 500);
	}
	function trytrytry(tries = 0) {
		//retry checkOpenYoutubeBanner for 1500ms (after page finished loading / scrolling)
		if (tries === 3) return;
		setTimeout(() => {
			if (!checkOpenYoutubeBanner())
				trytrytry((tries.target ? 0 : tries) + 1);
		}, 500);
	}
	// let new page finish loading
	window.addEventListener("click", trytrytry);
	// let finish scrolling
	window.addEventListener("touchend", trytrytry);
	setTimeout(checkOpenYoutubeBanner, 500);
}
function desktopInit() {
	if (commonInit() === false) return;
	if (window.location.pathname === "/live_chat") return; //don't run userscript in liveChat iframe
	mainFn();
	//check if finished loading new video
	doc.addEventListener("DOMContentLoaded", onMediaLoad);
	doc.addEventListener("yt-navigate-start", function () {
		(
			doc.querySelector("ytd-comments-header-renderer #count span") || {}
		).textContent = NaN; //hackish way to "empty" comments section virtually, for the next video to be able to autoScroll, otherwise numComments() will return the old video's count
	});
	doc.addEventListener("yt-navigate-finish", onMediaLoad); //this gets called instead of load event on safari, so that's cool i guess 🤷‍♀️
	window.addEventListener("load", onMediaLoad); //chrome doesn't seem to use yt-navigate-finish or yt-navigate-start on pageload... at least @ timing userscript is loaded at right now
	waitForEls();
}
(function () {
	("use strict");
	if (window.location.host.startsWith("m")) mobileInit();
	else desktopInit();
})();

/* helper fn's




	wait for element to exist
	https://stackoverflow.com/a/61511955
*/
function waitForEl(selector) {
	return new Promise((resolve) => {
		if (document.querySelector(selector))
			return resolve(document.querySelector(selector));
		const observer = new MutationObserver((mutations) => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}
