export function checkIfPopupPostLoaded() {
	const popup = getPopup();
	return !popup
		? false
		: popup.querySelectorAll('div[data-visualcompletion="loading-state"]')
				.length == 0;
}

export const getPostAnchors = () => {
	return Array.from(doc.querySelectorAll("article a")); // anchor elements (.click() opens popup viewer) of the grid
};
export const articleWithPostAnchor: (postAnchor: HTMLElement) => HTMLElement = (
	postAnchor: HTMLElement,
) => {
	if (
		postAnchor.tagName.toLowerCase() === "article" ||
		postAnchor.tagName.toLowerCase() === "body"
	)
		return postAnchor;
	return articleWithPostAnchor(postAnchor.parentNode as HTMLElement);
};

/* popup viewer */
export const getPopup = () => doc.querySelector('article[role="presentation"]');

export const getPopupPostItemDots = () => {
	let container = getPopup()?.children[0].children[0].children[0];
	container = container?.children[container.children.length - 1]; //the last one here is the container of the individual dots
	return (container && Array.from(container.children)) || [document.body]; // add dummy (document.body) since post ≥ 1 item
};

export const nextItem = () => {
	const nextBtn: HTMLButtonElement = getPopup()?.querySelector(
		'button[aria-label="Next"]',
	)!;
	if (nextBtn) nextBtn.click();
};

/* other csv columns */
export const getPopupPostUserAndMetadata = () => {
	const header = getPopup()?.querySelector("header")!;
	const container = header.children[1]!;
	const followUserContainer = container.children[0]!;
	const metadataContainer = container.children[1]!;
	return [
		followUserContainer.children[0]!.textContent!,
		metadataContainer.children[1]!.textContent!,
	];
};
export const getPopupPostDate = () => {
	const times = getPopup()?.querySelectorAll("time")!;
	return times[times.length - 1].getAttribute("datetime")!;
};
export const getPopupPostCommentsSection = () => {
	return getPopup()!.children[0].children[1].querySelector("div ul"); //list of comments
};
export const getPopupPostCaption = () => {
	const commentsSection = getPopupPostCommentsSection()!;
	if (!commentsSection) return "";
	const firstCommentContainer = commentsSection.querySelector(
		'div[role="button"] li',
	)!.children[0].children[0];
	const firstComment = firstCommentContainer.children[1]; // firstCommentContainer.children[0] = profile pic
	return firstComment.children[1].textContent!; // firstComment.children[0] = username
};
export const getPopupPostSaveButton = () => {
	const buttonsRow = getPopup()?.querySelector("section");
	const saveButtonContainer =
		buttonsRow?.children[buttonsRow.children.length - 1];
	const btn = saveButtonContainer?.querySelector('div[role="button"]');
	return btn ? (btn.children[0] as HTMLButtonElement) : null;
};
