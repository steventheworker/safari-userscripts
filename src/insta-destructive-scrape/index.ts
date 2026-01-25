// ==UserScript==
// @name         insta-destructive-scrape
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  visit /saved/all-posts/ & execute window.dl_saved_posts()    (download media/metadata + unsaves the grid then refreshes the page to download next batch)
// @author       steventheworker
// @grant        none
// @icon         https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/768px-Instagram_logo_2016.svg.png
// @match        https://www.instagram.com/*
// ==/UserScript==

import { SavedPostsDownloader } from "./SavedPostsDownloader";

(function () {
	if (!window.location.pathname.endsWith("/saved/all-posts/"))
		return console.log(`not on /saved/all-posts/`);

	setTimeout(() => {
		const downloader = new SavedPostsDownloader();
		(window as any).saved_posts_downloader = downloader;
		(window as any).dl_saved_posts = () => {
			downloader.startAutoStart();
			downloader.start();
		};
		(window as any).stop_dl_saved_posts = () => {
			downloader.stopAutoStart();
			downloader.stop();
			downloader.downloadCSV();
		};
		(window as any).get_unresolved_blobs = () => {
			const unresolved_post_medias = downloader.posts.map((el) =>
				el.media.filter((el) => el.startsWith("blob")),
			);
			return unresolved_post_medias;
		};

		// downloader.start(); //comment this out
	}, 5000);
})();
