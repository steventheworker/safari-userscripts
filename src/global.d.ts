declare const doc: HTMLDocument;
declare const win: Window;
declare const bod: HTMLElement;
interface Window {
  onPageLoaded: any;
  NSLog: any;
  $isInput: any;
  $isSafari: any;
  $isSafariPWA: any;
  triggerKeyDown: any;
  triggerKeyUp: any;
  triggerKeyPress: any;
  isShortcut: any;
  win: Window;
  doc: HTMLDocument;
  bod: HTMLElement;
  site_dict: SiteDict | undefined;
  lastActiveEl: HTMLElement;

  //postmessage shortcuts
  clearUserScriptCache: () => void;
  refreshUserScriptCache: () => void;

  loadUserscript: (name: string) => void;
  enableUserscript: (name: string) => void;
  disableUserscript: (name: string) => void;

  logInjectedUserscripts: () => void;
  getInjectedUserscripts: () => void;
  listInjectedUserscripts: () => void;
}

interface Navigator {
  standalone: boolean;
}

declare const $isInput: (el: Element | null) => HTMLElement;
declare const $isSafari: () => void;
declare const $isSafariPWA: () => void;

type SiteDict = { [key: string]: string };
declare const site_dict: SiteDict;
