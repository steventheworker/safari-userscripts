const str = `
    ytd-watch-flexy .title {font-size: 2.2em !important;}

    ytd-compact-video-renderer:not([watch-feed-big-thumbs]) ytd-thumbnail.ytd-compact-video-renderer {width: 146.1px;}

    /* comment body - increase font-size */
    #content-text.ytd-comment-renderer {font-size: 1.61rem;line-height:2.3rem;}
        /* comment replies (nested) */
    ytd-comment-replies-renderer #content-text.ytd-comment-renderer {
         font-size: 1.5rem;line-height: 2.14rem;
    }
    ytd-comment-replies-renderer #main {margin-top: -15px;margin-left: -15px;}
    ytd-comment-replies-renderer ytd-comment-renderer {margin-top: 10px;}
             /* increase profile photo size */
    yt-img-shadow.ytd-comment-renderer {
        width: 75px !important;height: 75px !important;
        margin-top: -10px;margin-left: -10px;
    }
             /* increase (nested) profile photo size */
    ytd-comment-renderer:not([comment-style=backstage-comment])[is-reply] #author-thumbnail.ytd-comment-renderer yt-img-shadow.ytd-comment-renderer {
            width: 50px !important;height: 50px !important;
         margin-top: -10px;margin-left: -10px;
    }
             /* make comments show leftmost (undo margin-left/padding-left) */
    #author-thumbnail.ytd-comment-renderer yt-img-shadow.ytd-comment-renderer {width: 69px; height: 69px;margin-left: -14.5px;margin-top: -14.5px;}
    tp-yt-paper-button.ytd-button-renderer {font-size: 1.6rem;}

    /* related */
    #related #video-title.ytd-compact-video-renderer {font-size: 1.22rem;}
    #related  {
      max-height: 100px;
      overflow: hidden;
      opacity: 0.3;
      outline: 1px dashed silver;
      cursor: pointer;
    }
    #related #items {pointer-events: none;}
    #related:active {opacity: 0.666;}
    @media (min-width: 1016px)  {
      #related #items {pointer-events: inherit;}
      #related {max-height: inherit;opacity: inherit;cursor: inherit;outline: inherit;}
    }
    #related.cancelSpoiler #items {
      pointer-events: inherit;
    }
    #related.cancelSpoiler {
      max-height: inherit;
      opacity: 0.45;
    }

    /* live chat */
    ytd-live-chat-frame {
      position: fixed;
      left: calc(100% - 500px);
      top: 0;
      z-index: 99999;
      transform: scale(1, 1);
      opacity: 0.77;
    }
    ytd-live-chat-frame #show-hide-button {
      position: absolute;
      top: 0;
      right: 6em;
    }
    ytd-live-chat-frame  iframe, ytd-live-chat-frame {width: 500px !important;}

     /* darker mode */
     .darkSearchResults {background: black !important;}
     .darkSearchResults li span, .darkSearchResults li:hover {color: grey !important;}
     .darkSearchResults li {color: white !important;}
     .darkSearchResults ul li:last-child div {background: black!important;} /* report search item */

     /* outline focused thumbnail (search results) */
     .ytd-search a:focus {text-decoration: underline;}
     
     
	/*
		https://www.reddit.com/r/uBlockOrigin/comments/1qwr4cx/youtube_make_theater_mode_fullwindow_fullscreen/
		Youtube - make "theater" mode "full-window" (fullscreen limited to the window) 
	*/
	/* Hide banner & recover space */
	ytd-app[is-watch-page]:has(ytd-watch-flexy[theater]) #masthead-container {
	display: none !important;
	}
	
	/* Recover space from hidden banner */
	ytd-app[is-watch-page] ytd-page-manager:has(ytd-watch-flexy[theater]) {
	margin-top: 0 !important;
	}
	
	/* Occupy full viewport */
	ytd-watch-flexy[theater] #full-bleed-container {
	min-height: 100vh !important;
	height: 100vh !important;
	}
	
	ytd-watch-flexy[theater] video {
	top: unset !important;
	left: unset !important;
	height: 100vh !important;
	width: 100vw !important;
	object-fit: contain !important;
	}
	
	/* Hide video when ended */
	ytd-watch-flexy[theater] video[style*=" top: -"] {
	display: none !important;
	}
	
	/* Thumbnail fitting */
	ytd-watch-flexy[theater] .ytp-cued-thumbnail-overlay-image {
	background-size: contain;
	}
	
	/* Hide scrollbar – WebKit */
	body:has(ytd-watch-flexy[theater])::-webkit-scrollbar {
	display: none !important;
	}
	
	/* Hide scrollbar – Firefox */
	:is(body, html):has(ytd-watch-flexy[theater]) {
	scrollbar-width: none !important;
	}
`;
export function addStylesheet() {
	const head = doc.head || doc.getElementsByTagName("head")[0],
		style = doc.createElement("style");
	head.appendChild(style);
	style.type = "text/css";
	style.appendChild(doc.createTextNode(str));
}
