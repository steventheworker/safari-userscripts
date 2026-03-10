// ==UserScript==
// @name         Globals (Config / Debugging)
// @namespace    github.com/steventheworker
// @version      0.1
// @description  Highest priority global userscript with global variables, debug / helper functions
// @author       steventheworker
// @match        *://*/*
// @grant        none
// @priority     2
// @weight		  999
// @run-at       document-start
// ==/UserScript==

(function () {
  const DefaultConfig = {
    ControlPanel: {
      shortcut: ["ctrl", "opt", "cmd", ","], //  AKA ["ctrl", "alt", "meta", ","]       OR      CTRL + ALT + META + ,   AKA   CTRL + OPT + CMD + ,
    },
    PWALocation: {
      shortcut: ["cmd", "l"],
    },
    MKB: {
      shortcut: ["ctrl", "opt", "cmd", "k"],
    },
    site_dict: {
      A: "apple.stackexchange.com",
      R: "reddit.com",
      Q: "quora.com",
      T: "twitter.com",
      S: "stackoverflow.com",
      U: "unix.stackexchange.com",
    },
  };

  const Config: { site_dict: undefined | {} } = {
    site_dict: undefined,
  }; //todo: somehow load config from localStorage? cloud? drive?
  const loadConfig = () => Object.assign(Config, DefaultConfig);
  // keyboard constants / MKB definitions
  const CONVERTWEBMODS: Record<string, string> = {cmd: "meta", meta: "meta", opt: "alt", alt: "alt", ctrl: "ctrl", shift: "shift"}; // prettier-ignore
  const CONVERTMACMODS: Record<string, string> = {
		cmd: "cmd",
		meta: "cmd",
		opt: "opt",
		alt: "opt",
		ctrl: "ctrl",
		shift: "shift",
	}; // prettier-ignore
  const KeyCodeDict:Record<string, string> = {"Escape": "Escape", "`": "Backquote", "~": "Backquote", "Tab": "Tab", " ": "Space", "-": "Minus", "_": "Minus", "=": "Equal", "+": "Equal", "Delete": "Delete", "Backspace": "Backspace", "[": "BracketLeft", "{": "BracketLeft", "]": "BracketLeft", "}": "BracketLeft", "\\": "Backslash", "|": "Backslash", ";": "Semicolon", ":": "Semicolon", "'": "Quote", "\"": "Quote", ",": "Comma", "<": "Comma", ".": "Period", ">": "Period", "/": "Slash", "?": "Slash", "ArrowLeft": "ArrowLeft", "ArrowUp": "ArrowUp", "ArrowRight": "ArrowRight", "ArrowDown": "ArrowDown" }; // prettier-ignore
  const CharCodeDict: Record<string, number> = {
		Escape: 27,
		"`": 192,
		"~": 192,
		Tab: 9,
		" ": 32,
		"-": 173,
		_: 173,
		"=": 61,
		"+": 61,
		Delete: 46,
		Backspace: 8,
		"[": 219,
		"{": 219,
		"]": 221,
		"}": 221,
		"\\": 220,
		"|": 220,
		";": 59,
		":": 59,
		"'": 222,
		'"': 222,
		",": 188,
		"<": 188,
		".": 190,
		">": 190,
		"/": 191,
		"?": 191,
		ArrowLeft: 37,
		ArrowUp: 38,
		ArrowRight: 39,
		ArrowDown: 40,
	}; // prettier-ignore
  let settingsDrawn = false;

  // add global fn's to window
  function addGlobalFns() {
    win.onPageLoaded = onPageLoaded;
    win.NSLog = (...a: any[]) => console.log.apply(null, a); // easier to autocomplete nickname
    win.$isInput = $isInput; // is? input, textarea, div[contenteditable=true]
    win.$isSafari = $isSafari;
    win.$isSafariPWA = $isSafariPWA;
    win.triggerKeyDown = triggerKeyDown; // used to remap keys / sending keyboard shortcuts on mobile (AKA mobile keyboarding)
    win.triggerKeyUp = triggerKeyUp;
    win.triggerKeyPress = triggerKeyPress;
    win.isShortcut = isShortcut; // check if event triggers a shortcut (w/ path format (eg: "MKB.shortcut" => Config.MKB.shortcut ))

    //firefox mini userscript manager/script0 fn's
    window.clearUserScriptCache = () =>
      window.postMessage({ action: "clearUserScriptCache" }, "*");
    window.refreshUserScriptCache = window.clearUserScriptCache; //nickname for clearUserScriptCache

    window.loadUserscript = (name: string) =>
      window.postMessage({ action: "loadUserscript", name }, "*");
    window.enableUserscript = (name: string) =>
      window.postMessage({ action: "enableUserscript", name }, "*");
    window.disableUserscript = (name: string) =>
      window.postMessage({ action: "disableUserscript", name }, "*");

    window.logInjectedUserscripts = () =>
      window.postMessage({ action: "logInjectedUserscripts" }, "*");
    window.getInjectedUserscripts = window.logInjectedUserscripts; //nickname for logInjectedUserscripts
    window.listInjectedUserscripts = window.logInjectedUserscripts; //nickname for logInjectedUserscripts
  }
  // init fn (first fn to run)
  function defineGlobals() {
    let _win = window;
    // try { // iframes - make all windows target the top window
    // 	_win = window.self !== window.top ? window.top : window;
    // } catch (e) {
    // 	// Browsers can block access to window.top due to same origin policy. IE bugs also take place. Here's the working code:
    // 	_win = window;
    // }
    if (window !== _win) return; // if (iframe && tarWin === topmost) break all iframe userscripts (w/o globals)
    window.win = _win;
    window.doc = win.document;
    if (!win.win) win.win = win;
    if (!win.doc) win.doc = win.document;
    //define constants
    loadConfig();
    //search a site with shift + Letter (eg: append site:website.com to search query on search engines)
    win.site_dict = Config.site_dict;
    //set bod (after doc ready (body isn't defined until DOMContentLoaded))
    onPageLoaded(() => {
      window.bod = doc.body;
      win.bod = doc.body;
    });
    addGlobalFns();
  }

  /*
      Control Panel UI (cmd + opt + ctrl + Comma)
   */
  function settingsContents() {
    const container = doc.createElement("div");
    //todo: container.append setting 1.. setting 2.. etc...
    return container;
  }
  function settingsCloseBtn() {
    const container: any = doc.createElement("span");
    container.appendChild(doc.createTextNode("x"));
    container.style =
      "color: red; font-weight: bold; cursor: pointer; position: absolute; margin-top: -0.5em; margin-left: -0.25em; font-size: 1.5em; text-shadow: 0 0 2px black";
    container.addEventListener("click", toggleSettings);
    return container;
  }
  function drawSettings() {
    settingsDrawn = true;
    const settingsContainer: any = doc.createElement("div");
    settingsContainer.style =
      "display: block; position: fixed; top: 50%; left: 50%; margin-left: -175px; margin-top: -175px; width: 350px; height: 350px; outline: 1px solid red; background: rgba(0, 255, 255, 0.5); z-index: 2147483645;";
    settingsContainer.id = "dotUserSettingsContainer";
    const relativeContainer: any = doc.createElement("div");
    relativeContainer.style = "position: relative; width: 100%; height: 100%;";
    relativeContainer.appendChild(settingsCloseBtn());
    relativeContainer.appendChild(settingsContents());
    settingsContainer.appendChild(relativeContainer);
    bod.appendChild(settingsContainer);
  }
  const toggleSettings = () =>
    (doc.getElementById("dotUserSettingsContainer")!.style.display =
      doc.getElementById("dotUserSettingsContainer")!.style.display === "block"
        ? "none"
        : "block");
  function openSettings() {
    if (settingsDrawn) return toggleSettings();
    drawSettings();
  }

  /*
      global event listeners
   */
  const onPageLoaded = (cb: any) => doc.readyState !== "loading" ? cb() : doc.addEventListener("DOMContentLoaded", cb); // prettier-ignore
  function globalEvents() {
    //open settings with (cmd+opt+ctrl+Comma)
    win.addEventListener("keydown", (e) => {
      if (isShortcut(e, "ControlPanel.shortcut")) openSettings();
      if ($isSafariPWA() && isShortcut(e, "PWALocation.shortcut")) {
        const url = prompt("url:", location.href);
        if (!url) return;
        location.href = url;
      }
    });
  }

  /*
      utilities fn's -  global fn dependencies
   */
  /* triggering keys */
  function getKeyCode(key: any) {
    const dict = KeyCodeDict[key];
    if (dict) return dict;
    return isNaN(key) ? "Key" + key.toUpperCase() : "Digit" + key;
  }
  function getCharCode(key: any) {
    const dict = CharCodeDict[key];
    if (dict) return dict;
    return key.charCodeAt(0);
  }

  /*
      global fn's
   */
  const triggerKeyUp = (key: string) => triggerKeyDown.apply(null, [key, true]);
  const triggerKeyPress = (key: string) => {
    triggerKeyDown.apply(null, [key]);
    triggerKeyUp.apply(null, [key]);
  };
  function triggerKeyDown(key: string, modifiers: any = {}) {
    const type = arguments[2] ? "keyup" : "keydown";
    const tar = modifiers.target || win.lastActiveEl;
    const keyCode = getCharCode(key); // wrong for .,
    const ev = new KeyboardEvent(type, {
      altKey: modifiers.alt || modifiers.opt ? true : false,
      bubbles: true,
      cancelBubble: false,
      cancelable: true,
      charCode: keyCode,
      code: getKeyCode(key),
      composed: true,
      ctrlKey: modifiers.ctrl ? true : false,
      currentTarget: tar || null,
      defaultPrevented: true,
      detail: 0,
      eventPhase: 0,
      isComposing: true,
      isTrusted: true,
      key,
      keyCode,
      location: 0,
      metaKey: modifiers.meta || modifiers.cmd ? true : false,
      repeat: false,
      returnValue: false,
      shiftKey: modifiers.shift ? true : false,
      type,
      which: keyCode,
    } as any);
    if (modifiers.target) return tar.dispatchEvent(ev); // force a target
    (tar && tar !== doc.activeElement ? tar : document.body).dispatchEvent(ev);
  }

  function $isInput(el: HTMLElement) {
    const nn = el.nodeName;
    if (
      nn === "INPUT" ||
      nn === "TEXTAREA" ||
      (nn === "DIV" && el.contentEditable === "true")
    )
      return true;
    return false;
  }

  const $isSafari = () =>
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const $isSafariPWA = () =>
    $isSafari() && window.navigator.standalone === true;

  interface extendedKeyboardEvent extends KeyboardEvent {
    [key: string]: any;
  }

  function isShortcut(
    e: extendedKeyboardEvent,
    path: string,
    virtualMods: Record<string, string> = {},
  ) {
    let shortcut: any = readConfig(path);
    if (!shortcut) return;
    shortcut = [...shortcut]; // create copy, don't modify reference
    return (
      e.key === shortcut.pop() && // shortcuts begin with modifier keys (last in shortcut is always the e.key)
      !shortcut.filter((modifier: string) =>
        e[CONVERTWEBMODS[modifier] + "Key"] ||
        virtualMods[CONVERTMACMODS[modifier]]
          ? false
          : true,
      ).length
    );
  }

  /* miscellaneous */
  function objKeyPath(
    obj: any = {},
    keyPath: string,
    val = null,
    remove: boolean,
  ) {
    const paths = keyPath.split(".");
    // const numPaths = paths.length;
    for (let i in paths) {
      const p = paths[i];
      if (Number(i) == paths.length - 1) {
        if (remove) delete obj[p];
        else if (val) obj[p] = val;
      }
      if (obj) obj = obj[p];
    }
    return obj;
  }

  const readKeyPath = (obj: any, keyPath: string) =>
    objKeyPath.apply(null, [obj, keyPath, undefined, false]);
  // const setKeyPath = (
  // 	obj: any = {},
  // 	keyPath: string,
  // 	val: null | undefined
  // ) => objKeyPath.apply(null, [obj, keyPath, val, false]);
  // const deleteKeyPath = (obj: any, keyPath: string) =>
  // 	objKeyPath.apply(null, [obj, keyPath, null, true]);
  const readConfig = (keyPath: string) => readKeyPath(Config, keyPath);
  // const setConfig = (keyPath: string, val: null | undefined) =>
  // 	setKeyPath(Config, keyPath, val);
  // const deleteConfig = (keyPath: string) => deleteKeyPath(Config, keyPath);

  //userscript init
  defineGlobals();
  loadConfig();
  globalEvents();
})();
