// ==UserScript==
// @name         pokemonshowdown damage calc
// @namespace    https://calc.pokemonshowdown.com/
// @version      0.1
// @description  try to take over the world!
// @author       ratcatty
// @match        https://calc.pokemonshowdown.com/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?domain=calc.pokemonshowdown.com
// ==/UserScript==

//redefine some globals
const $ = window.jQuery;

//config
const W = 1285;

//add style
$(`<style>
body, html {overflow: hidden; background: rgb(15,15,15);color: white;}
fieldset, .select2-results {background: rgb(30,30,30);color: white;}
nav, .credits {display: none;}
</style>`).appendTo(document.body);

function resize() {
	const w = $(window).width();
	let ratio = w / W;
	const zoom = ratio * 100;
	if (ratio > 1) ratio = 1;
	$("body").css({
		transform: "scale(" + ratio + ")",
		"transform-origin": "top left",
	});
}

let curPlayer = "p1";
let curChoice = "a.select2-choice";
function $choices() {
	return $(`#${curPlayer} ${curChoice}`);
}
function initFocus() {
	const choosePokeInput = $choices().first();
	choosePokeInput.mousedown();
	window.scrollTo(0, 0);
}
function focus1() {
	curPlayer = "p1";
	initFocus();
}
function focus2() {
	curPlayer = "p2";
	initFocus();
}

//init
(function init() {
	"use strict";
	$(function () {
		//initialize dom
		$("hr").first().css({
			height: 0,
			width: 0,
			padding: 0,
			margin: 0,
		});
		resize();
		initFocus();
		initFocus();
	});
	//listen parent window messages
	$(window).on("message", (e) => {
		const { data } = e.originalEvent;
		const type = data.type;
		switch (type) {
			case "ForceFocus":
				initFocus();
				break;
		}
	});
	//listen events
	$(window)
		.on("keydown", function (e) {
			//refresh
			if (e.originalEvent.code === "KeyR" && e.altKey)
				window.location = window.location;

			if (e.key === "-" || e.key === "=") {
				if ($(".select2-drop-mask").css("display") === "block") {
					//blur select
					$("#select2-drop").last().hide();
					$(".select2-drop-mask").hide();
				} else {
					if (e.key === "-") focus1();
					if (e.key === "=") focus2();
				}
			}
		})
		.on("keyup", function (e) {
			if (
				document.activeElement.nodeName === "INPUT" ||
				document.activeElement.nodeName === "TEXTAREA"
			)
				return;
			if (e.key === "Escape" || e.key === "c")
				window.parent.postMessage({ type: "exit" }, "*");
		})
		.on("resize", resize);
	$("body")
		.bind("mousewheel", function (e) {
			const delta = e.originalEvent.wheelDelta;
			window.scrollTo(0, window.scrollY - delta);
		})
		.on("click", function (e) {
			const els = document.elementsFromPoint(e.pageX, e.pageY);
			const el = els
				.filter((el) => $(el).hasClass("select2-choice"))
				.pop();
			if (!el) return;
			curPlayer = $(el).parent().parent().attr("id");
		});
	//add stylesheet
	$(`<style>
    div[aria-label="Settings"] {position: absolute; bottom: 0;}
    .poke-import {margin-bottom: 3em;}
    </style>`).appendTo(bod);
})();
