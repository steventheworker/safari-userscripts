// ==UserScript==
// @name         tiktok
// @namespace    http://github.com/steventheworker
// @version      0.1
// @description  tiktok downloader, (mobile) login prompt remover, lives enhancement (auto unmute, theater mode, reconnect)
// @author       steventheworker
// @grant        none
// @icon         https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-common-sg/mtact/static/images/logo_144c91a.png
// @match        https://www.tiktok.com/*
// ==/UserScript==

//helper fns
function addStyleSheet() {
  const css = `
		@media only screen and (min-width: 320px) and (max-width: 414px) {
			.footer-guide,
			.tiktok-dialog {
				display: none !important;
			}
		}
	`,
    head = doc.head || doc.getElementsByTagName("head")[0],
    style = doc.createElement("style");
  head.appendChild(style);
  style.type = "text/css";
  style.appendChild(doc.createTextNode(css));
}
const removeByTesting = () => {
  Array.from(doc.getElementsByClassName("tiktok-bottom")).forEach(
    (el) => (el.style.bottom = "0px"),
  );
  Array.from(doc.getElementsByClassName("guide-container")).forEach((el) => {
    if (el.classList.contains("middle"))
      return el.parentNode.parentNode.remove();
    el.remove();
  });
  setTimeout(removeByTesting, 333);
};
function removeLoginPrompts() {
  if (!(bod.clientWidth >= 320 && bod.clientWidth <= 414)) return; //desktop/tablet should be logged in (this fn is mobile only) (iphone se - 8plus dimensions)
  waitForEl(`button.not-now`, true).then((el) => el.click());
  removeByTesting(); //setTimeout loop
}

const $liveVideo = () => doc.querySelector(".xgplayer video");
const foundControls = () => !!doc.querySelector('div[data-e2e="play-icon"]');
const $playBtn = () =>
  doc.querySelector('div[data-e2e="play-icon"]').children[0];
const $volumeBtn = () =>
  doc.querySelector('div[data-e2e="volume-icon"]').children[1]; // .click() doesn't unmute unless u already clicked the page
const $theaterBtn = () =>
  doc.querySelector('div[data-e2e="theater-icon"]').children[0];
function getLiveFrame() {
  const rect = $liveVideo().getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    w: rect.width,
    h: rect.height,
  };
}
function triggerClick(el) {
  //trigger click so that userscript doesn't listen to triggered clicks
  var mEvent = document.createEvent("MouseEvent");
  mEvent.initMouseEvent(
    "click",
    true,
    true,
    window,
    0,
    666,
    666,
    666,
    666,
    false,
    false,
    false,
    false,
    0,
    null,
  );
  el.dispatchEvent(mEvent);
}
function finishLiveInit() {
  // chat input: contentEditable - firefox default value doesn't work
  doc.querySelector(
    'div[data-e2e="comment-text"]',
  ).children[0].contentEditable = "true";

  // remove video overlay (which prevents right-click)
  setTimeout(() => {
    const liveRoomContent = doc.querySelector(
      'div[data-e2e="live-room-content"]',
    );
    Array.from(liveRoomContent.children).forEach((el, i) => {
      if (el.style.zIndex === "5") el.remove();
    });
  }, 5000);

  // controls don't exist / are removed from DOM (only added on mouseover)
  win.CLICK_ASAP_FOUND_CONTROLS = setInterval(() => {
    if (foundControls()) {
      win.CLICK_ASAP_FOUND_CONTROLS = clearInterval(
        win.CLICK_ASAP_FOUND_CONTROLS,
      );
      triggerClick($theaterBtn());
      if (
        initialClick &&
        $volumeBtn().children[0].getAttribute("data-testid") !==
          "volume-larger-id"
      )
        triggerClick($volumeBtn());
    }
  }, 1000);

  //cannot unmute live auto without initial page click
  let initialClick = false;
  doc.addEventListener("click", (e) => {
    if (
      e.pageX === 666 &&
      e.pageY === 666 &&
      e.clientX === 666 &&
      e.clientY === 666 &&
      e.screenX === 666 &&
      e.screenY === 666
    ) {
      return;
    }
    if (!initialClick) {
      if (foundControls()) $volumeBtn().click();
      initialClick = true;
    } else {
      console.log(e.target);
      if (
        e.target.getAttribute("data-e2e") === "control-icon" ||
        e.target.getAttribute("data-e2e") === "volume-icon-id"
      )
        return;
      const liveFrame = getLiveFrame();
      if (
        e.pageX >= liveFrame.x &&
        e.pageX <= liveFrame.x + liveFrame.w &&
        e.pageY >= liveFrame.y &&
        e.pageY <= liveFrame.y + liveFrame.h
      )
        $volumeBtn().click();
    }
  });
}
function liveInit() {
  if (!win.location.pathname.endsWith("live")) return;
  win.liveInitdChecker = setInterval(() => {
    console.log("ch");
    if ($liveVideo()) {
      clearInterval(win.liveInitdChecker);
      setTimeout(finishLiveInit, 2000);
    }
  }, 250);
}
function liveReconnectLoop() {
  setInterval(() => {
    if (!win.location.pathname.endsWith("/live")) return;
    const btn = doc
      .getElementsByTagName("video")[0]
      .parentNode.querySelector("button");
    if (btn && btn.textContent === "Retry") btn.click();
  }, 3000);
}
//init
(function () {
  console.log("tiktok userscript loaded 🍿");
  addStyleSheet();
  removeLoginPrompts();
  liveInit();
  liveReconnectLoop();
  //the downloader
  /*
	create tiktoks.txt (one link per line) & paste (joined) output string into it
	, FINALLY run the download command in terminal:

	download command:
			yt-dlp  --verbose -ci --download-archive dl-log.txt  --batch-file=tiktoks.txt

Check if downloads succeeded by:
- comparing line numbers: dl-log.txt vs tiktoks.txt
	- if dl-log < lines than tiktoks.txt:
		- rerun download command in terminal
		- Check for red console errors and download manually
		(happens when title too long / private vids)
*/
  const getLikedVids = () =>
    Array.prototype.slice
      .call(
        doc.querySelectorAll(
          'div[data-e2e="user-liked-item-list"] div[data-e2e="user-liked-item"] a',
        ),
      )
      .map((el, i) => el.href);
  const dlOutput = () => {
    document.write(`<small>
		${JSON.stringify(getLikedVids())}
		<br />.join("\\n")</small>
		<br /><br />
		<b>download command:</b><br />
		&emsp;&emsp;yt-dlp  --verbose -ci --download-archive dl-log.txt  --batch-file=tiktoks.txt`);
  };
  window.download = dlOutput;
  window.downloader = dlOutput;
  window.dl = dlOutput;
  window.dllikes = dlOutput;
  window.downloadAll = dlOutput;
  window.downloadLikes = dlOutput;
  window.getLikes = dlOutput;
})();

// wait for element to exist
// https://stackoverflow.com/a/61511955
function waitForEl(selector, dc) {
  return new Promise((resolve) => {
    if (document.querySelector(selector))
      return resolve(document.querySelector(selector));
    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        if (dc) observer.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
