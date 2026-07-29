export let vID: string, //vid currently playing...  eg: ?v=
	commentSortType: "default" | "new" = "default",
	commentsbreakpoint: number,
	prevScrollY: number = window.scrollY;

// setters
export const setVID = (vid: string) => (vID = vid);
export const setCommentSortType = (t: string) => commentSortType;
export const setPrevScrollY = (scrollY: number) => (prevScrollY = scrollY);

// common
export function initCommon(): void {
	console.log("youtube.user.js has been loaded. 👩🏿‍💻");
}

export function getVidID() {
	return win.location.search.replace("?v=", "");
}

export function YTPlayer() {
	return (
		doc.getElementById("movie_player") ||
		doc.getElementsByClassName("html5-video-player")[0]
	);
}

export function getVidDescSection(): {
	scrollHeight: number;
	offsetTop: number;
} {
	const _: HTMLElement = doc.querySelector("#content #meta.ytd-watch-flexy")!;
	return {
		scrollHeight: _ ? _.scrollHeight : 0,
		offsetTop: _ ? _.offsetTop : 0,
	};
}

export function getRelatedSection(tar: HTMLElement) {
	if (tar.id === "related") return tar;
	if (!tar) return null;
	return getRelatedSection(tar.parentNode as HTMLElement);
}

//shorts
export function transformShortsLink(tar: HTMLAnchorElement) {
	const href = tar.getAttribute("href") ?? "";
	if (!href.startsWith("/shorts/")) return;
	tar.setAttribute("href", "/watch?v=" + href.slice(8));
}

//playlists
export function isPlaylistVideo() {
	const playlist = doc.querySelector("ytd-playlist-panel-renderer");
	return !playlist || (playlist as any).hidden ? false : true;
}

export function playlistToggle() {
	(
		doc.querySelector(
			"ytd-playlist-panel-renderer #expand-button",
		)! as HTMLButtonElement
	).click();
}

function videoFixed(sticky = true) {
	function $missingVidSpace(player: HTMLElement) {
		const el = doc.createElement("div");
		el.id = "missingVidSpace";
		el.style.height = player.clientHeight + "px";
		el.style.width = player.clientWidth + "px";
		return el;
	}
	const theaterContainer = doc.getElementById("player-full-bleed-container");
	if (!theaterContainer) return;
	const player = theaterContainer.innerHTML
		? theaterContainer
		: doc.getElementById("player");
	if (!player) return;
	if (sticky) {
		player.style.top =
			doc.getElementById("masthead-container")!.clientHeight + "px";
		player.style.position = "fixed";
		player.style.zIndex = "301";
		if (!doc.getElementById("missingVidSpace"))
			player.parentNode!.prepend($missingVidSpace(player));
	} else {
		player.style.position = "";
		player.style.top = "";
		doc.getElementById("missingVidSpace")!.remove();
	}
}

//comments
export function sortByNew(sortByOld: "default" | "new" = "new") {
	commentSortType = sortByOld ? "default" : "new";
	const isWatching = win.location.pathname === "/watch";
	(
		doc.querySelectorAll("#sort-menu a")[
			sortByOld || isWatching ? 1 : 2
		] as HTMLAnchorElement
	).click();
}

export function sortByTop() {
	commentSortType = "default";
	(doc.querySelectorAll("#sort-menu a")[0] as HTMLAnchorElement).click();
}

export function getcommentsbreakpoint() {
	const desc = getVidDescSection();
	return (commentsbreakpoint =
		(doc.body.clientWidth > 1016 ? 0 : 165) +
		desc.scrollHeight +
		desc.offsetTop);
}

export function scrollToComments() {
	console.log("scrolled to " + commentsbreakpoint);
	win.scroll(0, commentsbreakpoint);
}

export function numComments() {
	return (
		parseFloat(
			(
				doc.querySelector(
					"ytd-comments-header-renderer #count span",
				)! || {}
			).textContent,
		) | 0
	);
}

export function autoLoadComments() {
	if (!doc.querySelector('.ytp-live-badge[disabled="true"]')) return; //no comments exist until the live is over
	const commentsHeader = doc.querySelector("#comments #contents #header"); //comments section is not closed if exists
	const headerMessage =
		(doc.querySelector("#comments #contents #message span") as HTMLElement)
			?.textContent || "";
	if (
		numComments() >= 0 ||
		commentsHeader ||
		headerMessage === "Comments are turned off. "
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

// waitForEls
export function waitForEls() {
	waitForEl('ul[role="listbox"]').then((el) =>
		(el.parentNode as HTMLElement).classList.add("darkSearchResults"),
	);
	waitForEl("#panels-full-bleed-container").then((el) => el.remove());
}

/* helper fn's
	wait for element to exist
	https://stackoverflow.com/a/61511955
*/
export function waitForEl(selector: string): Promise<HTMLElement> {
	return new Promise((resolve) => {
		if (document.querySelector(selector))
			return resolve(document.querySelector(selector) as HTMLElement);
		const observer = new MutationObserver((mutations) => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector) as HTMLElement);
				observer.disconnect();
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}
