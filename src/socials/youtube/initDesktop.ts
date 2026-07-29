import {
	vID,
	prevScrollY,
	setPrevScrollY,
	initCommon,
	getVidID,
	waitForEls,
	transformShortsLink,
	isPlaylistVideo,
	playlistToggle,
	autoLoadComments,
	getcommentsbreakpoint,
	commentSortType,
	getRelatedSection,
	YTPlayer,
	sortByNew,
	scrollToComments,
	sortByTop,
	setVID,
	setCommentSortType,
} from "./common";

// remove buttons
let areButtonsGone = false;
function removeButtons() {
	if (areButtonsGone) return;
	areButtonsGone = true;
	// auto disable & remove autoplay button
	const btn: HTMLButtonElement = doc.querySelector(
		".ytp-right-controls button",
	)!.nextSibling! as HTMLButtonElement;
	if (btn.title.endsWith("on")) btn.click();
	btn.remove();
	// auto remove playnext button
	doc.querySelector(".ytp-play-button")!.nextSibling!.remove();
}

// events
function onVideoChange() {
	console.log("video loaded: ", vID);
	console.log("start autoscroll logic");

	//hide the stuff that blocks the comments section
	if (doc.body.clientWidth < 1016 && isPlaylistVideo()) playlistToggle();
	document.querySelector("#related")!.classList.remove("cancelSpoiler");

	setPrevScrollY(window.scrollY);
	autoLoadComments();
}

function onMediaLoad() {
	if (win.location.pathname !== "/watch") return;
	removeButtons();
	getcommentsbreakpoint();
	const newVidID = getVidID();
	if (newVidID === vID) return;
	//set vars / reset defaults
	setCommentSortType("default");
	if (vID) setTimeout(() => setPrevScrollY(0)); //reset prevScroll if new vid (after the vid that's already been loaded)
	setVID(newVidID);
	onVideoChange();
}

let alreadyLoaded = false;

function mainFn() {
	if (alreadyLoaded) return; //init, runs once (ever) on first load
	alreadyLoaded = true;
	ListenEvents();
	console.log("listening for new events...");
}

//events
function ListenEvents() {
	//youtube shorts links -> regular link (/shorts/vID => /watch?v=vID)
	win.addEventListener("mousedown", (e) => {
		Array.from(doc.elementsFromPoint(e.pageX, e.pageY)).filter((el) => {
			if (el.nodeName === "A")
				transformShortsLink(el as HTMLAnchorElement);
		});
	});
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
			if (!(e.target instanceof HTMLMediaElement)) return;
			if (YTPlayer()) onMediaLoad();
		},
		true,
	);

	let shortcutPassthroughTimeout: number;
	let shortcutPassthroughTimeoutElapsed: boolean;
	//shortcuts WATCH VIDEO / channel page
	win.addEventListener(
		"keydown",
		function (e) {
			if ($isInput(doc.activeElement)) return;

			//autofocus (it's starting to get iffy, it only seems to work ("/") on the homepage, otherwise does nothing)
			if (e.key === "/")
				(doc.querySelector("input#search") as HTMLInputElement).focus();
			//remap keys WASD IJKL
			if (e.key === "w" || e.key === "i") {
				win.scroll({
					left: 0,
					top: win.scrollY - 300,
					behavior: "smooth",
				}); //pgup
				if (e.key === "i") e.stopImmediatePropagation();
			}
			if (e.key === "a" || e.key === "j") win.triggerKeyDown("ArrowLeft"); //map to rewind
			if ((e.key === "s" || e.key === "k") && !e.metaKey) {
				if (e.key === "k") e.stopImmediatePropagation();
				win.scroll({
					left: 0,
					top: win.scrollY + 300,
					behavior: "smooth",
				}); //pgdn
			}
			if (e.key === "d" || e.key === "l")
				win.triggerKeyDown("ArrowRight"); //map to forward
			if (e.key === "l" || e.key === "j" || e.key === "d")
				e.stopPropagation(); //prevent default / map to Arrow's (5 sec fast-forward/rewind, rather than 10 sec)

			//[ ] playback speed
			if (e.key === "[") win.triggerKeyDown(",", { shift: true });
			if (e.key === "]") win.triggerKeyDown(".", { shift: true });

			//T N sort
			if (e.key === "T") {
				e.stopPropagation(); // triggerKeyDown("t"); //since t = toggle theater mode       we undo the toggle
				if (commentSortType === "default") return;
				scrollToComments();
				sortByTop();
			}
			if (e.key === "N") {
				if (shortcutPassthroughTimeoutElapsed)
					shortcutPassthroughTimeoutElapsed = false;
				else {
					//if key has been held for a second you can run the original youtube shortcut
					if (!shortcutPassthroughTimeout)
						shortcutPassthroughTimeout = setTimeout(
							() => (shortcutPassthroughTimeoutElapsed = true),
							1000,
						);
					e.stopImmediatePropagation();
				}
				if (commentSortType === "new") return;
				scrollToComments();
				sortByNew();
			}
		},
		true,
	);
	win.addEventListener("keyup", function (e) {
		if (e.key === "N") {
			clearTimeout(shortcutPassthroughTimeout);
			shortcutPassthroughTimeout = 0;
		}
	});
	//shortcuts search results page // @match        https://www.youtube.com/results?search_query=*
	win.addEventListener("keydown", function (e) {
		if (win.location.pathname !== "/results") return;
		function clickItem(menuIndex: number, itemIndex: number) {
			(doc.querySelector("#filter-menu a") as HTMLAnchorElement).click();
			doc.querySelectorAll(
				"#filter-menu ytd-search-filter-group-renderer",
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
		const $relatedSection = getRelatedSection(e.target as HTMLElement);
		if ($relatedSection) {
			//toggle class .cancelSpoiler
			$relatedSection.classList[
				$relatedSection.classList.contains("cancelSpoiler")
					? "remove"
					: "add"
			]("cancelSpoiler");
		}
	});
	(
		doc.querySelector("input.yt-searchbox-input") as HTMLElement
	).addEventListener(
		"keydown",
		(e: KeyboardEvent) => {
			if (e.key === "Enter" && e.metaKey) {
				e.preventDefault();
				e.stopImmediatePropagation();
				const query = encodeURIComponent(
					(e.target as HTMLInputElement).value,
				);
				win.open(
					`https://www.youtube.com/results?search_query=${query}`,
					"_blank",
				);
			}
		},
		true,
	);
}

export function initDesktop() {
	initCommon();
	if (window.location.pathname === "/live_chat") return; //don't run userscript in liveChat iframe
	mainFn();
	//check if finished loading new video
	win.onPageLoaded(onMediaLoad);
	doc.addEventListener("yt-navigate-start", function () {
		doc.querySelector(
			"ytd-comments-header-renderer #count span",
		)!.textContent = "-1"; //hackish way to "empty" comments section virtually, for the next video to be able to autoScroll, otherwise numComments() will return the old video's count
	});
	doc.addEventListener("yt-navigate-finish", onMediaLoad); //this gets called instead of load event on safari, so that's cool i guess 🤷‍♀️
	window.addEventListener("load", onMediaLoad); //chrome doesn't seem to use yt-navigate-finish or yt-navigate-start on pageload... at least @ timing userscript is loaded at right now
	waitForEls();
}
