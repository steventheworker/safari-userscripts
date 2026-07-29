import { initCommon } from "./common";

export function initMobile() {
	initCommon();
	function checkOpenYoutubeBanner() {
		if (window.scrollY > 0) return;
		window.scroll(0, 65); //hide top banner (open in youtube)
		//force bottom bar to be shown (eg: Home | Shorts | Subscriptions | Library)
		const bar = document.getElementsByClassName("pivot-bar-slide-out")[0];
		const showBB = () => bar?.classList.remove("pivot-bar-slide-out");
		return setTimeout(showBB, 500);
	}
	function trytrytry(tries: MouseEvent | TouchEvent | number = 0) {
		//retry checkOpenYoutubeBanner for 1500ms (after page finished loading / scrolling)
		if (tries === 3) return;
		setTimeout(() => {
			if (!checkOpenYoutubeBanner())
				trytrytry(
					((tries as MouseEvent).target ? 0 : (tries as number)) + 1,
				);
		}, 500);
	}
	// let new page finish loading
	window.addEventListener("click", trytrytry);
	// let finish scrolling
	window.addEventListener("touchend", trytrytry);
	setTimeout(checkOpenYoutubeBanner, 500);
}
