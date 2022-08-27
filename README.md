steven's userscripts &nbsp; &nbsp; &nbsp; &nbsp; -- targeting macOS Firefox and Safari (iOS too), but works on all platforms

### <u>Setup</u>

[<u>**Userscripts extension**</u>](https://itunes.apple.com/us/app/userscripts/id1463298887) (recommended): &nbsp; no setup required & works on iOS!

or using <u>**Tampermonkey**</u>: &nbsp; step 1, open config.user.js in the built-in editor and open the settings tab. Set the position to 1, and "run at" to document-start.

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; step 2 (<u>**OPTIONAL) + (Firefox ONLY**</u>): &nbsp; host this folder as http://localhost/userscripts (port 80) with any web server and import tampermonkey-export.zip (allows you to use "git pull" to live patch updates from this GitHub; edit these userscripts from your filesystem / favorite editor)

&nbsp;

## <u>Global / Mobile / Other Features</u>

safari specific

-   AutoScroll.user.js (middle mouse scroll click drag wheel)
-   desktop virtual status bar (eg: Command+/)) (helps with Dock Exposé (sometimes the status bar is treated as a window!))
-   Instagram - require double escape key to run default escape (prevents exiting fullscreen mode when closing the popup picture viewer)

other features:

-   mobile keyboard.user.js (mobile virtual keyboard shortcuts)
    -   three finger tap on any page to trigger a shortcut like on desktop
-   pagination with arrow keys (big sites I use: E-Commerce, Google, etc.)
-   delete accept cookies popup (Currently only for programming websites (eg: stackoverflow))
-   autofocus text inputs (with / ) and blur with escape key
-   scrolling with keys: wsik (aka the home rows: wasd, ijkl) (ad jl usually do something too)
-   social media (instagram, reddit, tiktok, youtube, yelp)

&nbsp;

# (Domain Specific) Userscripts features:

Google / Bing / Search Engines

-   sort search results by H(our) D(ay) M(onth) Y(ear) (ie: Shift + Y to sort by Year)
-   **cmd+enter (on search result)**: open in new tab
-   **cmd+shift+y**: open search query on YouTube
-   search by sites (eg: R(site:reddit.com) Q(site:quora.com), etc. --defined in config.user.js as "site_dict")

Reddit

-   **cmd+enter**: open focused thread (new tab) &nbsp; &nbsp; **--shift+enter** (window)
-   sort thread comments by T(op) N(ew) O(old) C(ontroversial) B(est) Q(&A)
-   incognito auto dark mode

Instagram

-   scroll with i k w s (can use s & k at the same time (2x speed))

YouTube

-   **cmd+k**: Mark live chat as read and right click
-   **cmd+enter (on YouTube search input)**: open query in new tab
-   [] = increase/decrease playback rate
-   Increase commenter profile picture size
-   scroll with i k w s
-   Sort search results by H(our) T(oday) W(eek) M(onth) Y(ear) R(ating) U(pload Date) V(iew Count)
-   channel videos sort by T(op) N(ew) O(ld)
-   Comments sort by T(op) N(ew)
-   fullscreen theater mode, auto load comments
-   change all shorts links to regular video player
-   (mobile) keep scrolled past “Open in App” banner

TikTok

-   (mobile) make it usable while logged out
-   export your likes using yt-dlp enter “javascript:dl()” in address bar once you’ve scrolled to the bottom
