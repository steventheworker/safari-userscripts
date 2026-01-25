export function isBlobURL(src: string) {
	return src.startsWith("blob:");
}
export function posterUrlWithArticle(articleNode: HTMLElement) {
	const timeNodes = articleNode.querySelectorAll("time");
	return (timeNodes[timeNodes.length - 1].parentNode!.parentNode as any).href;
}

/* stolen from: @TheKonka/instagram-download-browser-extension src/content/utils.ts */
const mediaInfoCache: Map<string, any> = new Map(); // key: media id, value: info json
const mediaIdCache: Map<string, string> = new Map(); // key: post id, value: media id

const findAppId = () => {
	const appIdPattern = /"X-IG-App-ID":"([\d]+)"/;
	const bodyScripts: NodeListOf<HTMLScriptElement> =
		document.querySelectorAll("body > script");
	for (let i = 0; i < bodyScripts.length; ++i) {
		const match = bodyScripts[i].text.match(appIdPattern);
		if (match) return match[1];
	}
	console.log("Cannot find app id");
	return null;
};

function findPostId(articleNode: HTMLElement) {
	const pathname = window.location.pathname;
	if (pathname.startsWith("/reels/")) {
		return pathname.split("/")[2];
	} else if (pathname.startsWith("/stories/")) {
		return pathname.split("/")[3];
	} else if (pathname.startsWith("/reel/")) {
		return pathname.split("/")[2];
	}
	const postIdPattern = /^\/p\/([^/]+)\//;
	const aNodes = articleNode.querySelectorAll("a");
	for (let i = 0; i < aNodes.length; ++i) {
		const link = aNodes[i].getAttribute("href");
		if (link) {
			const match = link.match(postIdPattern);
			if (match) return match[1];
		}
	}
	return null;
}

const findMediaId = async (postId: string) => {
	const mediaIdPattern =
		/instagram:\/\/media\?id=(\d+)|["' ]media_id["' ]:["' ](\d+)["' ]/;
	const match = window.location.href.match(
		/www.instagram.com\/stories\/[^/]+\/(\d+)/,
	);
	if (match) return match[1];
	if (!mediaIdCache.has(postId)) {
		const postUrl = `https://www.instagram.com/p/${postId}/`;
		const resp = await fetch(postUrl);
		const text = await resp.text();
		console.log("xxx", text, postId, match);
		const idMatch = text.match(mediaIdPattern);
		if (!idMatch) return null;
		let mediaId = null;
		for (let i = 0; i < idMatch.length; ++i) {
			if (idMatch[i]) mediaId = idMatch[i];
		}
		if (!mediaId) return null;
		mediaIdCache.set(postId, mediaId);
	}
	return mediaIdCache.get(postId);
};

const getImgOrVideoUrl = (item: Record<string, any>) => {
	if ("video_versions" in item) {
		return item.video_versions[0].url;
	} else {
		return item.image_versions2.candidates[0].url;
	}
};

export const getUrlFromInfoApi = async (
	articleNode: HTMLElement,
	mediaIdx = 0,
): Promise<Record<string, any> | null> => {
	try {
		const appId = findAppId();
		if (!appId) {
			console.log("Cannot find appid");
			return null;
		}
		const postId = findPostId(articleNode);
		if (!postId) {
			console.log("Cannot find post id");
			return null;
		}
		const mediaId = await findMediaId(postId);
		if (!mediaId) {
			console.log("Cannot find media id");
			return null;
		}
		if (!mediaInfoCache.has(mediaId)) {
			const url =
				"https://i.instagram.com/api/v1/media/" + mediaId + "/info/";
			const resp = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "*/*",
					"X-IG-App-ID": appId,
				},
				credentials: "include",
				mode: "cors",
			});

			if (resp.status !== 200) {
				console.log(
					`Fetch info API failed with status code: ${resp.status}`,
				);
				return null;
			}
			const respJson = await resp.json();
			mediaInfoCache.set(mediaId, respJson);
		}
		const infoJson = mediaInfoCache.get(mediaId);
		const data = infoJson.items[0];
		if ("carousel_media" in data) {
			// multi-media post
			const item = data.carousel_media[Math.max(mediaIdx, 0)];
			return {
				...item,
				url: getImgOrVideoUrl(item),
				taken_at: data.taken_at,
				owner: item.owner?.username || data.owner.username,
				coauthor_producers:
					data.coauthor_producers?.map((i: any) => i.username) || [],
				origin_data: data,
			};
		} else {
			// single media post
			return {
				...data,
				url: getImgOrVideoUrl(data),
				owner: data.owner.username,
				coauthor_producers:
					data.coauthor_producers?.map((i: any) => i.username) || [],
			};
		}
	} catch (e: any) {
		console.log(`Uncaught in getUrlFromInfoApi(): ${e}\n${e.stack}`);
		return null;
	}
};
export async function fetchVideoURL(
	articleNode: HTMLElement,
	videoElem: HTMLVideoElement,
) {
	const poster = videoElem.getAttribute("poster");
	const posterUrl = posterUrlWithArticle(articleNode);
	const posterPattern = /\/([^/?]*)\?/;
	const posterMatch = poster?.match(posterPattern);
	const postFileName = posterMatch?.[1];
	const resp = await fetch(posterUrl);
	const content = await resp.text();
	console.log("debugging:", postFileName, posterMatch, posterUrl);
	const pattern = new RegExp(
		`${postFileName}.*?video_versions.*?url":("[^"]*")`,
		"s",
	);
	const match = content.match(pattern);
	let videoUrl = JSON.parse(match?.[1] ?? "");
	videoUrl = videoUrl.replace(
		/^(?:https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/?\n]+)/g,
		"https://scontent.cdninstagram.com",
	);
	videoElem.setAttribute("videoURL", videoUrl);
	return videoUrl;
}
export function getMediaName(url: string) {
	const name = url.split("?")[0].split("/").pop();
	return name ? name.substring(0, name.lastIndexOf(".")) : url;
}
export function forceDownload(
	blob: string,
	filename: string = "vid",
	extension: string,
) {
	const a = document.createElement("a");
	a.download = filename + "." + extension;
	a.href = blob;
	document.body.appendChild(a);
	a.click();
	a.remove();
	// const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	// const link = document.createElement("a");
	// const url = URL.createObjectURL(blob);
	// link.href = URL.createObjectURL(blob);
	// link.download = filename + "." + extension;
	// document.body.appendChild(link);
	// link.click();
	// document.body.removeChild(link);
	// URL.revokeObjectURL(url); // Clean up
}
export function downloadResource(url: string) {
	if (url.startsWith("blob:")) {
		forceDownload(url, getMediaName(url), "mp4");
		return;
	}
	fetch(url, {
		headers: new Headers({
			Origin: location.origin,
		}),
		mode: "cors",
	})
		.then((response) => response.blob())
		.then((blob) => {
			const extension = blob.type.split("/").pop();
			const blobUrl = window.URL.createObjectURL(blob);
			forceDownload(blobUrl, getMediaName(url), extension || "jpg");
		})
		.catch((e) => console.error(e));
}

export const checkType = () => {
	if (
		navigator &&
		navigator.userAgent &&
		/Mobi|Android|iPhone/i.test(navigator.userAgent)
	) {
		if (
			navigator &&
			navigator.userAgent &&
			/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)
		) {
			return "ios";
		} else {
			return "android";
		}
	} else {
		return "pc";
	}
};

/* stolen from: @TheKonka/instagram-download-browser-extension src/content/post.ts */
const getVideoSrc = async (
	articleNode: HTMLElement,
	videoElem: HTMLVideoElement,
) => {
	let url = videoElem.getAttribute("src");
	if (videoElem.hasAttribute("videoURL")) {
		url = videoElem.getAttribute("videoURL");
	} else if (url === null || url.includes("blob")) {
		url = await fetchVideoURL(articleNode, videoElem);
	}
	return url;
};
export async function postGetURL(articleNode: HTMLElement) {
	let url, res;
	let mediaIndex = -1;

	if (articleNode.querySelectorAll("li[style][class]").length === 0) {
		// single img or video
		res = await getUrlFromInfoApi(articleNode);
		url = res?.url;
		if (!url) {
			const videoElem = articleNode.querySelector<HTMLVideoElement>(
				"article  div > video",
			);
			const imgElem = articleNode.querySelector<HTMLImageElement>(
				"article  div[role] div > img",
			);
			if (videoElem) {
				// media type is video
				if (videoElem) {
					url = await getVideoSrc(articleNode, videoElem);
				}
			} else if (imgElem) {
				// media type is image
				url = imgElem.getAttribute("src");
			} else {
				console.log("Err: not find media at handle post single");
			}
		}
	} else {
		// multiple img or videos
		const isPostView = window.location.pathname.startsWith("/p/");
		let dotsList: any;
		if (isPostView) {
			dotsList = articleNode.querySelectorAll(
				`:scope > div > div > div > div:nth-child(2)>div`,
			);
		} else {
			if (checkType() === "pc") {
				dotsList =
					articleNode.querySelector("ul")?.parentElement
						?.parentElement?.parentElement?.parentElement
						?.parentElement?.nextElementSibling?.childNodes || [];
			} else {
				dotsList = articleNode.querySelectorAll(
					`:scope > div > div:nth-child(2) > div>div>div>div>div>div:nth-child(2)>div`,
				);
			}
		}

		// if get dots list fail, try get img url from img element attribute
		if (dotsList.length === 0) {
			const imgList = articleNode.querySelectorAll(
				`${isPostView ? ":scope>div>div:nth-child(1)" : ""} li img`,
			);
			const { x, right } = articleNode.getBoundingClientRect();
			for (const item of [...imgList]) {
				const rect = item.getBoundingClientRect();
				if (rect.x > x && rect.right < right) {
					url = item.getAttribute("src");
					return { url };
				}
			}
			return null;
		}

		mediaIndex = [...dotsList].findIndex((i) => i.classList.length === 2);
		if (mediaIndex === -1) {
			const idx = new URLSearchParams(window.location.search).get(
				"img_index",
			);
			if (idx) {
				mediaIndex = +idx - 1;
			} else {
				mediaIndex = 0;
			}
		}
		res = await getUrlFromInfoApi(articleNode, mediaIndex);
		url = res?.url;
		if (!url) {
			const listElements = [
				...articleNode.querySelectorAll(
					`:scope > div > div:nth-child(${isPostView ? 1 : 2}) > div > div:nth-child(1) ul li[style*="translateX"]`,
				),
			] as HTMLLIElement[];
			const listElementWidth = Math.max(
				...listElements.map((element) => element.clientWidth),
			);
			const positionsMap = listElements.reduce<
				Record<string, HTMLLIElement>
			>((result, element) => {
				const position = Math.round(
					Number(element.style.transform.match(/-?(\d+)/)?.[1]) /
						listElementWidth,
				);
				return { ...result, [position]: element };
			}, {});

			const node = positionsMap[mediaIndex];
			const videoElem = node.querySelector("video");
			const imgElem = node.querySelector("img");
			if (videoElem) {
				// media type is video
				url = await getVideoSrc(articleNode, videoElem);
			} else if (imgElem) {
				// media type is image
				url = imgElem.getAttribute("src");
			}
		}
	}
	return { url, res, mediaIndex };
}
