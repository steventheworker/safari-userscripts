const str = `
	:root {
		--color-input-plain: #151515; /* color for search */
	}
	body {
		background: black;
	}
	header {
		background: black !important;
	}
	.bg-\\[color\\:var\\(--shreddit-content-background\\)\\] {
		background-color: black;
	}
	#left-sidebar {
		background-color: black;
	}
	shreddit-comment:nth-child(odd) {
		background-color: black;
	}
`;
export function addStylesheet() {
	const head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(str));
}
