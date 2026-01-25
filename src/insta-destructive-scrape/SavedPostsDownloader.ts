import { Post, downloadCSV } from "./Post";
import * as uiScripting from "./ui-scripting";
import * as resources from "./resource";

const MINUTES_TO_WAIT_BEFORE_RELOAD = 10;
// const POSTS_UNTIL_WAIT_AND_RELOAD = 5; // currently it just downloads the entire visible grid
const BASE_ACTION_DELAY = 666 * 3;

export class SavedPostsDownloader {
	//config
	shouldDownloadMedia = true;
	shouldUnsavePost = true;

	downloaderRunning: Boolean;
	posts: Array<Post>;
	$postAnchors: Array<Element>;
	// post currently being processed
	currentPostIndex: number;
	currentPostItemIndex: number;
	$postItemDots: Array<Element>;
	postLoaded: Boolean;
	postLoadedCounter: number; //loading post – polling counter

	constructor() {
		this.downloaderRunning = false;
		this.currentPostIndex = 0;
		this.currentPostItemIndex = 0;
		this.posts = [];
		this.$postAnchors = uiScripting.getPostAnchors();
		this.$postItemDots = [document.body]; // add dummy since post ≥ 1 item
		this.postLoaded = false;
		this.postLoadedCounter = 0;

		// auto-start if already runnning
		if (JSON.parse(localStorage.getItem("dl-started") || "false"))
			this.start();
	}

	start() {
		if (this.downloaderRunning) return;
		this.downloaderRunning = true;
		this.$postAnchors = uiScripting.getPostAnchors();
		// this.startAutoStart();
		console.log(`downloading the grid.`);

		this.beginPost();
		this.loopBody();
		this.loop();
	}
	startAutoStart() {
		localStorage.setItem("dl-started", "true");
		console.log(`downloading will auto-start onpageload.`);
	}
	stopAutoStart() {
		localStorage.setItem("dl-started", "false");
		console.log(`downloading will no longer auto-start.`);
	}
	shouldAutoStart() {
		return JSON.parse(localStorage.getItem("dl-started") || "false");
	}
	stop() {
		// this.stopAutoStart();
		this.downloaderRunning = false;
	}
	loop() {
		if (!this.downloaderRunning) return;
		if (this.postsFinished() && this.postFinished())
			return this.onfinished();
		setTimeout(() => {
			this.loopBody();
			this.loop();
		}, BASE_ACTION_DELAY);
	}

	beginPost() {
		const anchor = this.$postAnchors[
			this.currentPostIndex
		] as HTMLAnchorElement;
		this.posts[this.currentPostIndex] = new Post(anchor.href);
		//click the post (viewer pops up)
		anchor.click();
		this.currentPostItemIndex = 0;
		this.$postItemDots = [document.body]; // add dummy since post ≥ 1 item
		this.postLoaded = false;
		this.postLoadedCounter = 0;
	}
	processPostItem(testOnPostWithIndex?: number) {
		//for testing — click a post & call saved_posts_downloader.processPostItem(i)   --with corresponding i (postIndex) to trigger a download
		if (testOnPostWithIndex !== undefined) {
			this.currentPostIndex = testOnPostWithIndex;
			this.posts[this.currentPostIndex] = new Post("testOnPostWithIndex");
		}

		const popup = uiScripting.getPopup()!;
		let vids = Array.from(popup.querySelectorAll("video"));
		let imgs = Array.from(popup.querySelectorAll("img"));
		let focusedMedias = [...vids, ...imgs];
		// ^^^ to do :  you may want to only use only the first ($postItemDots.length - vids.length) imgs (afterwards are only comment profile photos) //todo:
		let focusedMedia: HTMLVideoElement | HTMLImageElement =
			focusedMedias[0];
		//sort by x
		focusedMedias = focusedMedias.sort((a, b) => {
			const rectA = a.getClientRects()[0];
			const rectB = b.getClientRects()[0];
			return rectA && rectB ? rectA.x - rectB.x : 0;
		});
		//find 1st img/video with non-negative .getClientRects().x (this is the focused media)
		for (const i in focusedMedias) {
			if (focusedMedias[i].getClientRects()[0].x > 0) {
				focusedMedia = focusedMedias[i];
				break;
			}
		}
		//add media item url to post
		const post = this.posts[this.currentPostIndex];
		post.media.push(focusedMedia.src); // image is fine, blob video url as placeholder
		//video blob url's need fetch instagram api
		if (
			focusedMedia instanceof HTMLVideoElement &&
			(focusedMedia.src === null || resources.isBlobURL(focusedMedia.src))
		) {
			const postMediaIndex = post.media.length - 1;
			setTimeout(async () => {
				console.log(`helloooxo`);
				// console.log(
				// 	`val`,
				// 	await resources.postGetURL(
				// 		uiScripting.getPopup() as HTMLElement,
				// 	),
				// );
				let res = await resources.getUrlFromInfoApi(
					popup as HTMLElement,
					postMediaIndex,
				);
				post.media[postMediaIndex] =
					res?.url ||
					/*
					(await resources.fetchVideoURL(
						uiScripting.getPopup() as HTMLElement,
						focusedMedia,
					)) ||
					 */
					focusedMedia.src;
				if (this.shouldDownloadMedia)
					resources.downloadResource(post.media[postMediaIndex]);
			}, 0);
		} else {
			if (this.shouldDownloadMedia)
				resources.downloadResource(focusedMedia.src);
		}
	}
	loopBody() {
		if (this.postFinished()) {
			console.log(`processed media`, [
				...this.posts[this.posts.length - 1].media,
			]);
			this.currentPostIndex++;
			return this.beginPost();
		} else {
			if (!this.postLoaded)
				return this.checkIfPostLoaded() ? this.onPostLoaded() : null;
			this.processPostItem();
			this.currentPostItemIndex++;
			return uiScripting.nextItem();
		}
	}

	checkIfPostLoaded() {
		if (uiScripting.checkIfPopupPostLoaded()) return true;
		console.log(`post hasn't loaded...`);
		// return ++this.postLoadedCounter == 5;
	}
	onPostLoaded() {
		this.postLoaded = true;
		this.$postItemDots = uiScripting.getPopupPostItemDots();
		if (this.shouldUnsavePost)
			uiScripting.getPopupPostSaveButton()?.click(); //unsave post (SOME POSTS DONT SHOW UNSAVE BUTTON!)
		const post = this.posts[this.currentPostIndex];
		post.url = resources.posterUrlWithArticle(
			uiScripting.getPopup() as HTMLElement,
		);
		[post.user, post.metadata] = uiScripting.getPopupPostUserAndMetadata();
		post.date = uiScripting.getPopupPostDate();
		post.caption = uiScripting.getPopupPostCaption();
	}
	postsFinished() {
		return this.posts.length == this.$postAnchors.length;
	}
	postFinished() {
		return (
			this.postLoaded &&
			(this.posts[this.currentPostIndex]?.media || []).length ==
				this.$postItemDots.length
		);
	}
	downloadCSV() {
		if (
			this.posts.filter((post) => {
				for (const i in post.media)
					if (resources.isBlobURL(post.media[i])) return true;
				return false;
			}).length > 0
		)
			return setTimeout(() => this.downloadCSV(), 333);
		const rows = [Post.csv_cols, ...this.posts.map((el) => el.csvRow())];
		downloadCSV(rows.map((row) => row.join(",")).join("\n"));
	}
	onfinished() {
		console.log(`Finished downloading ${this.posts.length} posts.`);
		this.stop();
		this.waitAndReload();
		this.downloadCSV();
	}
	waitAndReload() {
		console.log(
			`waiting for ${MINUTES_TO_WAIT_BEFORE_RELOAD} minutes before reloading.`,
		);
		setTimeout(
			() => {
				if (this.shouldAutoStart()) location.href = location.href;
			},
			1000 * 60 * MINUTES_TO_WAIT_BEFORE_RELOAD,
		);
	}
}
