// ==UserScript==
// @name        script0
// @namespace   steventheworker/safari-userscripts
// @match       *://*/*
// @exclude     https://www.youtube.com/embed/*
// @exclude     https://accounts.youtube.com/RotateCookiesPage*
// @exclude     https://accounts.google.com/RotateCookiesPage*
// @exclude     /^https?:\/\/ogs\.google\..*$/
// @exclude     https://www.google.com/recaptcha/enterprise/anchor*
// @exclude     https://duckduckgo.com/post3.html
// @exclude     https://www.facebook.com/instagram/login_sync/
// @exclude     https://entra.microsoft.com/*
// @exclude     https://*.reactblade.portal.azure.net/*
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_addElement
// @version     1.0
// @author      steventheworker
// @description 6/6/2024, 11:21:37 PM -- A mini userscript manager for your userscript manager. Loads all userscript found in the webindex (which is shown when there's no index.html on a webserver)    --NOTE: THIS userscript does not have access to the window w/o postMessage (e.source)
// ==/UserScript==

const SERVER_PORT = 80; // https://localhost/userscripts/scriptName.user.js
const BASE_URL =
	"https://localhost" +
	(SERVER_PORT == 80 ? "" : ":" + SERVER_PORT) +
	"/userscripts";

// refreshes avail. userscripts: via nginx 'autoindex' (folder index displayed when no index.html exist)
let registry;
const UserScriptURL = (name) =>
	`${BASE_URL}/${escape(name)}.user.js?t=${new Date().getTime()}`;

//source: quoid/userscripts/src/ext/background/main.js - userscriptSort - first sorts files by run-at value, then by weight value
function userscriptSort(a, b) {
	const runAtValues = {
		"document-start": 1,
		"document-end": 2,
		"document-idle": 3,
	};
	const runAtA = a.scriptObject["run-at"];
	const runAtB = b.scriptObject["run-at"];
	if (runAtA !== runAtB && runAtValues[runAtA] && runAtValues[runAtB])
		return runAtValues[runAtA] > runAtValues[runAtB];
	return Number(a.scriptObject.weight) < Number(b.scriptObject.weight);
}

class RegistryScript {
	constructor(
		name,
		match = [],
		include = [],
		weight = 0,
		runAt = "document-start",
		injectInto = "page",
		disabled,
	) {
		this.name = name;
		this.match = match;
		this.include = include;
		this.weight = weight;
		this.runAt = runAt;
		this.injectInto = injectInto;
		this.disabled = disabled;
	}
	get scriptObject() {
		return { ...this, "run-at": this.runAt };
	} //make compatible with quoid userscriptSort
	setDisabled(disable) {
		this.disabled = disable;
		GM_setValue("registry", registry);
	}
	findPatterns(onFinish) {
		GM_xmlhttpRequest({
			url: UserScriptURL(this.name),
			onload: (response) => {
				this.analyzeUserScripHeader(response.responseText);
				if (onFinish) onFinish();
			},
		});
	}
	analyzeUserScripHeaderLine(line) {
		line = line.substr(2).trim();
		if (line.startsWith("@match")) this.match.push(line.substr(6).trim());
		if (line.startsWith("@include"))
			this.include.push(line.substr(8).trim());
		if (line.startsWith("@weight")) this.weight = parseInt(line.substr(7));
		if (line.startsWith("@run-at")) this.runAt = line.substr(7).trim();
		if (line.startsWith("@inject-into"))
			this.injectInto = line.substr(12).trim();
	}
	analyzeUserScripHeader(contents) {
		if (contents.startsWith("// ==/UserScript==")) return; //no information here
		contents = contents.split("\n");
		if (contents[0].startsWith("//"))
			this.analyzeUserScripHeaderLine(contents[0]);
		contents.shift();
		this.analyzeUserScripHeader(contents.join("\n"));
	}
	matchPatternToRegExp(pattern) {
		try {
			let regex = pattern
				.replace(/([.+^=!:${}()|[\]\/\\])/g, "\\$1")
				.replace(/\*/g, ".*")
				.replace(/\?/g, ".");
			if (pattern.startsWith("*://"))
				regex = regex.replace("^\\*:\\/\\/", "^https?://");
			else if (pattern.startsWith("http*://"))
				regex = regex.replace("^http\\*:\\/\\/", "^https?://");
			else regex = "^" + regex;
			regex = regex
				.replace(/\\\.\\*\\\./g, "(?:.*\\.)?")
				.replace(/\/\\\*/g, "/.*");
			return new RegExp(regex + "$");
		} catch (e) {
			console.error(
				"match pattern error\n\tpattern: " +
					pattern +
					"\n\terror:   " +
					e.message,
			);
			return new RegExp("^$"); //^$ matches only empty string
		}
	}
	includePatternToRegExp(pattern) {
		try {
			pattern = pattern.slice(1, -1); // remove //
			if (!pattern.endsWith("$")) pattern += "$";
			return new RegExp(pattern); // return new RegExp('^${pattern}$');
		} catch (e) {
			console.error(
				"include pattern error\n\tpattern:  " +
					pattern +
					"\n\terror:    " +
					e.message,
			);
			return new RegExp("^$"); //^$ matches only empty string
		}
	}
	nonRegexTest(url, pattern) {
		// Firefox/Violentmonkey can expose a development URL such as
		// http://localhost:8000/. A portless localhost match is intended to
		// cover that URL, while an explicitly ported match remains specific.
		if (/^[^:]+:\/\/localhost\//i.test(pattern)) {
			try {
				const parsedURL = new URL(url);
				if (parsedURL.hostname.toLowerCase() === "localhost" && parsedURL.port) {
					parsedURL.port = "";
					url = parsedURL.href;
				}
			} catch (_) {
				// Keep the normal wildcard comparison for non-URL values.
			}
		}

		// pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// pattern = pattern.replace(/\\\*/g, '.*');

		// treat as "a normal string" --https://violentmonkey.github.io/api/matching/#include--exclude
		// If there are wildcards (*), each of them matches any characters.
		// The host part accepts .tld to match top level domain suffix.
		// If there is no wildcard in the string, the rule matches the entire URL.
		const wildcards = pattern.split("*");
		if (!wildcards.length) return pattern === url;

		let isMatch = true;
		let startPos = 0;
		for (let wildcard of wildcards) {
			const index = url.indexOf(wildcard, startPos);
			if (index === -1) {
				isMatch = false;
				break;
			} else {
				startPos = index + wildcard.length; // Move start position to end of matched wildcard
			}
		}
		// Check if the last wildcard is at the end of the URL
		if (
			wildcards[wildcards.length - 1] !== "" &&
			!url.endsWith(wildcards[wildcards.length - 1])
		) {
			isMatch = false;
		}
		return isMatch;
	}
	test(win) {
		//does window get injected (location regex match/include)
		// for (let i in this.match)
		//   if (this.matchPatternToRegExp(this.match[i]).test(win.location.href))
		//     return true;
		for (let i in this.match) {
			const pattern = this.match[i];
			// console.log('match ' + pattern)
			if (pattern.startsWith("/") && pattern.endsWith("/")) {
				//treat as regex
				if (
					this.matchPatternToRegExp(this.match[i]).test(
						win.location.href,
					)
				)
					return true;
			} else {
				if (this.nonRegexTest(win.location.href, pattern)) return true;
			}
		}
		for (let i in this.include) {
			const pattern = this.include[i];
			// console.log('include ' + pattern)
			if (pattern.startsWith("/") && pattern.endsWith("/")) {
				//treat as regex
				if (
					this.includePatternToRegExp(pattern).test(win.location.href)
				)
					return true;
			} else {
				if (this.nonRegexTest(win.location.href, pattern)) return true;
			}
		}
		return false;
	}
}

const resetRegistry = (cb) =>
	GM_xmlhttpRequest({
		url: BASE_URL /* ¿USERSCRIPTS_URL? */,
		onload: (response) =>
			initRegistry(response.responseText, (created) => {
				if (cb) created = cb(created) ?? created;
				registry = created;
				registry.sort(userscriptSort);
				GM_setValue("registry", created);
			}),
	});
const initRegistry = (webindex, onFinishedAnalyzingHeaders) => {
	const scriptNames = [];
	webindex = webindex.split("\n");
	while (webindex.length) {
		const line = webindex[webindex.length - 1];
		const nameParts = line.substr(9).split('.user.js">'); //.substr('<a href="'.length)
		if (nameParts.length - 1 > 0) scriptNames.push(unescape(nameParts[0]));
		webindex.pop();
	}
	let numHeadersAnalyzed = 0;
	const created = scriptNames.map((scriptName) => {
		const registryScript = new RegistryScript(scriptName);
		registryScript.findPatterns(() => {
			if (++numHeadersAnalyzed === scriptNames.length)
				onFinishedAnalyzingHeaders(created);
		});
		return registryScript;
	});
};
const deserializeScripts = (store) => {
	if (!store) return;
	return store.map((registryScriptObj) => {
		const { name, match, include, weight, runAt, injectInto, disabled } =
			registryScriptObj;
		return new RegistryScript(
			name,
			match,
			include,
			weight,
			runAt,
			injectInto,
			disabled,
		);
	});
};

function loadScript(win, registryScript, cb = function () {}) {
	const evalCode = () =>
		GM_xmlhttpRequest({
			url: UserScriptURL(registryScript.name),
			onload: (response) => {
				try {
					// eval(response.responseText);
					GM_addElement("script", {
						textContent: response.responseText,
					});
					console.log(
						`${registryScript.name}.user.js injected  (context="${registryScript.injectInto}")`,
					);
				} catch (e) {
					console.log(
						`${registryScript.name}.user.js injected (context=${registryScript.injectInto})\n\terr: ${e.message}`,
					);
				}
				cb();
			},
		});
	try {
		if (registryScript.injectInto === "content") evalCode();
		else {
			(function () {
				// evalCode(); //bcos eval blocked by CSP (eg: instagram.com), we use GM_addElement
				// GM_addElement('script', {src: UserScriptURL(registryScript.name)}); //win.eval(code) //even safer: (new win.Function(response.responseText))();
				evalCode();
			})();
			console.log(
				`${registryScript.name}.user.js injected  (context="${registryScript.injectInto}")`,
			);
			cb();
		}
	} catch (e) {
		if (registryScript.injectInto === "auto")
			evalCode(); //page failed, try content now
		else {
			console.log(
				`${registryScript.name}.user.js injected (context=${registryScript.injectInto})\n\terr: ${e.message}`,
			);
			cb();
		}
	}
}
function loadScripts(win, i) {
	if (i >= registry.length) return;
	const registryScript = registry[i];
	if (registryScript.disabled || !registryScript.test(win))
		return loadScripts(win, i + 1);
	loadScript(win, registryScript, () => loadScripts(win, i + 1));
}

(function () {
	console.log("script0.user.js init", location.href);
	registry = deserializeScripts(GM_getValue("registry"));
	if (!registry) resetRegistry();

	window.addEventListener("message", (e) => {
		//window in this context is special 'content' window
		const { data /* source, target, currentTarget */ } = e;
		const { action } = data;

		if (!action) return;
		else
			console.log(
				"script0.user.js window message handler: ",
				location.href,
			);

		if (action === "clearUserScriptCache") {
			// GM_deleteValue("registry")
			const disabled = registry
				.filter((el) => el.disabled)
				.map((el) => el.name);
			resetRegistry((created) => {
				created.forEach(
					(el) => (el.disabled = disabled.includes(el.name)),
				);
				console.log(created);
			});
		} else if (action === "injectApplicable") {
			console.log("script0 injectApplicable");
			if (!registry)
				return setTimeout(
					() =>
						e.source.postMessage(
							{ action: "injectApplicable" },
							"*",
						),
					500,
				); // initRegistry is slower than GM_getValue
			loadScripts(e.source, 0);
		} else if (action === "loadUserscript") {
			const { name } = data;
			let registryScript;
			for (let x in registry) if (x.name == name) registryScript = x;
			if (!registryScript)
				return console.log(`no userscript named ${name}`);
			loadScript(e.source, registryScript);
		} else if (
			action === "enableUserscript" ||
			action === "disableUserscript"
		) {
			let { name } = data;
			if (name.endsWith(".user.js"))
				name = name.substr(0, name.length - ".user.js".length);
			let found = false;
			registry.forEach((script) => {
				if (script.name === name) {
					found = true;
					return script.setDisabled(action === "disableUserscript");
				}
			});
			if (found) return;
			const registryScript = new RegistryScript(name);
			registryScript.findPatterns((registryScript) => {
				registry.push(registryScript);
				registry.sort(userscriptSort);
				GM_setValue("registry", created);
				return registryScript;
			});
		} else if (action === "logInjectedUserscripts") {
			let buff = [];
			registry.forEach((registryScript) => {
				const injected = !(
					registryScript.disabled || !registryScript.test(e.source)
				);
				buff.push(`${injected ? "✅" : "🅾️"} ${registryScript.name}`);
			});
			e.source.console.log(buff.join("\n"));
		}
		setTimeout(
			() =>
				console.log(
					`script0 received action '${action} ${location.href}'`,
				),
			0,
		);
	});
})();
