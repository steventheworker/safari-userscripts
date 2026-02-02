const dropdownItems = () =>
	doc.querySelector("shreddit-sort-dropdown")?.children[2]!.children!;

const sortMaps: { [key: string]: { [key: string]: number | string } } = {
	thread: { B: 0, T: 1, N: 2, O: 4, C: 3, Q: 5 },
	subreddit: { B: 0, H: 1, N: 2, T: 3, R: 4 },
	subreddit2: {
		B: "Best" /* sometimes DNE */,
		H: "Hot",
		N: "New",
		T: "Top",
		R: "Rising",
	},
};

export function keydown(e: KeyboardEvent) {
	if (win.$isInput(doc.activeElement)) return e;

	const parts = win.location.pathname.split("/");

	//r/subreddit/comments/thread
	if (parts[1] === "r" && parts[3] === "comments") {
		const selectIndex: number = sortMaps.thread[e.key] as number;
		if (selectIndex === undefined) return;
		dropdownItems()[selectIndex].querySelector("div")!.click();
	} else {
		//homepage (reddit.com/)
		//AND
		//r/subreddit
		const isHomepage =
			win.location.pathname === "/" ||
			Object.values(sortMaps.subreddit2)
				.map((el) => (el as string).toLowerCase())
				.includes(parts[1].toLowerCase());
		const isSubreddit = parts[1] === "r";
		if (!isHomepage && !isSubreddit) return;
		let selectIndex: number = sortMaps.subreddit[e.key] as number;
		if (selectIndex === undefined) return;
		if (isSubreddit) {
			console.log(dropdownItems()[0].textContent!.trim());
		}
		if (isSubreddit /* handle subreddit w/o 'Best' sort option */) {
			if (dropdownItems()[0].textContent!.trim() !== "Best") {
				if (e.key === "B") return; //can't
				selectIndex--;
			}
		}
		dropdownItems()[selectIndex].querySelector("a")!.click();
	}
}
