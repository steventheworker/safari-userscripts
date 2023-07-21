// ==UserScript==
// @name        (quoid) userscripts manager globals
// @description 2nd priority userscript, config loader, exposes 1st prio script to GM variables (monkey userscript managers GM exposing is done within the userscript manager (you can find it as "monkey userscript manager globals"))
// @namespace   github.com/steventheworker
// @match       *://*/*
// @version     1.0
// @author      steventheworker
// @priority     1
// @grant        GM.xmlHttpRequest
// ==/UserScript==

const script = document.createElement("script");
script.textContent = `_GM_xmlHttpRequest = ${GM.xmlHttpRequest};`;
document.head.appendChild(script);
