export function addLink() {
	doc.querySelector(".oldUILink")?.remove();
	const a = document.createElement("a");
	a.href = location.href.replace("www.reddit.com", "new.reddit.com");
	a.appendChild(doc.createTextNode("Open in old UI: " + a.href));
	a.style.color = "yellow";
	a.style.whiteSpace = "nowrap";
	a.className = "oldUILink";
	doc.querySelector("#right-sidebar-container aside")?.prepend(a);
}

//https://violentmonkey.github.io/api/matching/#matching-spa-sites-like-fb-github-twitter-youtube
//@ts-ignore
navigation.addEventListener("navigatesuccess", () => {
	setTimeout(addLink, 1000);
});
