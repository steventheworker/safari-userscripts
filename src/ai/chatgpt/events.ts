//get dom elements
const getSidebarToggleButton = () =>
	doc.querySelector(
		'button[aria-label="Close sidebar"]',
	) as HTMLButtonElement;
const getMessageSendBtn = () =>
	doc.querySelector('button[aria-label="Send prompt"]') as HTMLButtonElement;

//handlers
let nonInputOnDown = false;
const keyHandler = (e: KeyboardEvent) => {
	if (!win.$isInput(e.target) && e.type === "keydown") nonInputOnDown = true;
	if (nonInputOnDown) regularShortcuts(e);
	else textareaBindings(e);
	if (
		e.type === "keyup" &&
		!e.metaKey &&
		!e.altKey &&
		!e.ctrlKey &&
		!e.shiftKey
	)
		nonInputOnDown = false;
};

function textareaBindings(e: KeyboardEvent) {
	//these are only called when textarea's have focus
	if (e.key === "Enter" && !e.metaKey && !e.shiftKey && !e.altKey) {
		e.preventDefault();
		if (e.type === "keydown") getMessageSendBtn().click();
	}
}

function regularShortcuts(e: KeyboardEvent) {
	//these are called when no textarea's have focus
	if (
		(e.key === "s" || e.key === "b") &&
		e.metaKey &&
		!e.shiftKey &&
		!e.altKey
	) {
		e.preventDefault();
		if (e.type === "keydown") getSidebarToggleButton().click();
	}
}

//add listeners
function keyListeners() {
	window.addEventListener("keydown", keyHandler);
	window.addEventListener("keyup", keyHandler);
}
//main method
export default function addEventListeners() {
	keyListeners();
}
