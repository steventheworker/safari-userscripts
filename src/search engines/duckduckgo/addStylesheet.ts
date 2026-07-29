export function addStylesheet() {
	const style = doc.createElement("style");
	style.innerHTML = `
#react-duckbar a { transition: color ease-in-out 333ms; }
#react-duckbar a:hover { color: #AA6600 !important; }
.focusedResult { outline: 1px dashed black; }
.focusedResult a:visited { color: purple !important; }
.focusedResult a:hover { color: inherit !important; }
li[data-layout="about"] { display: none !important; }
`;
	doc.body.appendChild(style);
}
