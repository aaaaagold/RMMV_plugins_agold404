"use strict";
/*:
 * @plugindesc prevent player exiting full-screen mode when pressing F5
 * @author agold404
 * @help .
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

if( (()=>{

if(!Utils.isNwjs()) return true; // web has no such issue.
try{
	const w=window;
	if(w.parent && w.parent!==w) return true; // current window is not root frame. thus we can handle other things.
}catch(e){
}

const cssInner="position:fixed; left:0px; top:0px; width:100%; height:100%; margin: 0px; border: 0px solid black; padding: 0px;";
const cssHere="background-color:black; overflow:hidden;";

SceneManager.run=()=>{};
const path=location.pathname+"?"+location.search+"#"+location.hash;
const d=document;
{ const p=HTMLElement.prototype;
if(!p.rf) p.rf=function(i){
	const arr=this.childNodes;
	while(arr.length>i) this.removeChild(arr[arr.length-1]);
	return this;
};
if(!p.ac) p.ac=function(c){ this.appendChild(c); return this; };
if(!d.ce) d.ce=d.createElement;
if(!p.sa) p.sa=function(a,v){ this.setAttribute(a,v); return this; };
}
d.body.rf(0).ac(d.ce('iframe').sa('style',cssInner).sa('src',path)).sa('style',cssHere);

})()){
// has layer. add some other functions


const parentWindow=(typeof getTopFrameWindow)==='function'?getTopFrameWindow():window.parent; // or say root frame


Graphics._requestFullScreen=function(){
	const element = parentWindow.document.body;
	if(element.requestFullScreen) element.requestFullScreen();
	else if(element.mozRequestFullScreen) element.mozRequestFullScreen();
	else if(element.webkitRequestFullScreen) element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	else if(element.msRequestFullscreen) element.msRequestFullscreen();
};
Graphics._isFullScreen=function(){
	// means "can get in full screen". thus current state is NOT fullscreen if return true.
	const d=parentWindow.document;
	return ( !d.fullScreenElement && !d.mozFullScreen && !d.webkitFullscreenElement && !d.msFullscreenElement );
};
Graphics._cancelFullScreen=function(){
	const d=parentWindow.document;
	if(d.cancelFullScreen) d.cancelFullScreen();
	else if(d.mozCancelFullScreen) d.mozCancelFullScreen();
	else if(d.webkitCancelFullScreen) d.webkitCancelFullScreen();
	else if(d.msExitFullscreen) d.msExitFullscreen();
};

Scene_Boot.prototype.updateDocumentTitle=()=>{
	parentWindow.document.title=$dataSystem.gameTitle;
};

{ const r=window.moveBy;
(window.moveBy=function f(w,h){
	if(Graphics._isFullScreen()){
		return parentWindow.moveBy.apply(parentWindow,arguments);
	}
	// omitted
})._dbg=r;
}
{ const r=window.resizeBy;
(window.resizeBy=function f(w,h){
	if(Graphics._isFullScreen()){
		return parentWindow.resizeBy.apply(parentWindow,arguments);
	}
	// omitted
})._dbg=r;
}
{ const r=window.close;
(window.close=function f(w,h){
	return parentWindow.close.apply(parentWindow,arguments);
})._dbg=r;
}


} // has layer. add some other functions

})();

