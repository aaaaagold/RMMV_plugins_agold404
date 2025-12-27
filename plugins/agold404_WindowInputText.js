"use strict";
/*:
 * @plugindesc Window_InputText: text input using textarea
 * @author agold404
 * 
 * 
 * @help new Window_InputText(x,y,w,h,opt)
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_WindowInputText";
const params=PluginManager.parameters(pluginName)||{};
params._onWheel_fontSizeMinRemainedRatio=0.9375;
params._onWheel_textareaMinRemainedRatio=0.75;


t=[
undefined,
params,
window.isTest(),
[{}], // 3: dummy info
];


new cfc(Graphics).
add('_updateCanvas',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.windowInputText_updateCanvas_ensureTextareaRoot.apply(this,arguments);
	return rtv;
}).
addWithBaseIfNotOwn('windowInputText_updateCanvas_ensureTextareaRoot',function f(){
	const rtv=f.ori&&f.ori.apply(this,arguments);
	let div=this._windowInputText_textareaRoot;
	if(div) return div;
	div=this._windowInputText_textareaRoot=document.ce('div').sa('style',this._canvas.ga('style'));
	div.width=this._canvas.width;
	div.height=this._canvas.height;
	document.body.ac(div);
	this.addAsGameCanvas(div);
	div.style.zIndex=f.tbl[0];
	div.id="root-Window_InputText";
	return rtv;
},[
4, // 0: zIndex
]).
addBase('windowInputText_clearTextareaRoot',function f(){
	this.windowInputText_updateCanvas_ensureTextareaRoot().rf(0);
	return this;
}).
getP;

{ const a=class Window_InputText extends Window_Base{
};
new cfc(a.prototype).
addBase('initialize',function f(x,y,w,h,opt){
	f._super[f._funcName].apply(this,arguments);
	this.windowInputText_initOpt.apply(this,arguments);
}).
addBase('windowInputText_initOpt',function f(x,y,w,h,opt){
	this.windowInputText_initTextarea.apply(this,arguments);
}).
addBase('windowInputText_initTextarea',function f(x,y,w,h,opt){
	const ta=this._textarea=document.ce('textarea');
	for(let arr=f.tbl[0],x=arr.length;x--;) ta.style[arr[x][0]]=arr[x][1];
	for(let arr=f.tbl[1],x=arr.length;x--;) ta.addEventListener(arr[x][0],arr[x][1]);
	ta._wnd=this;
},[
[
['white-space','pre'],
['color','#FFF'],
['background-color','rgba(0,0,0,0)'],
['padding','0px 0px 0px 2px'],
['border-width','0px'],
['margin','0px'],
['position','absolute'],
['resize','none'],
['scrollbar-width','thin'],
], // 0: css [ [key,val] ]
[
['blur',e=>{
	if(window.isTest()) console.log('[WindowInputText]','on textarea blur');
	Input.isTexting_clear();
},],
['focus',t=e=>{
	// also 'touchstart'
	if(window.isTest()) console.log('[WindowInputText]','on textarea focus');
	TouchInput.clear();
	Input.isTexting_set();
},],
['touchstart',
t,],
['wheel',e=>{
	const dom=e.target;
	const wndFontSize=useDefaultIfIsNaN(dom._wnd&&dom._wnd._taFontSize,1);
	const minRemained=Math.ceil(wndFontSize*params._onWheel_fontSizeMinRemainedRatio);
	const cw=dom.clientWidth;
	const ch=dom.clientHeight;
	const r=params._onWheel_textareaMinRemainedRatio;
	const maxDx=Math.max(1,Math.min(~~(cw*r),cw-minRemained,));
	const maxDy=Math.max(1,Math.min(~~(ch*r),ch-minRemained,));
	const dx=e.deltaX;
	const dy=e.deltaY;
	const dxa=Math.abs(dx);
	const dya=Math.abs(dy);
	if(maxDx<dxa||maxDy<dya){
		dom.scrollBy(dx/dxa*maxDx,dy/dya*maxDy);
		e.preventDefault();
	}
},],
], // 1: event listeners
]).
addWithBaseIfNotOwn('destroy',function f(opt){
	this._textarea.parentNode && this._textarea.parentNode.removeChild(this._textarea);
	return f.ori.apply(this,arguments);
}).
addWithBaseIfNotOwn('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.windowInputText_updateTextarea.apply(this,arguments);
	return rtv;
}).
addBase('windowInputText_updateTextarea',function f(){
	const ta=this._textarea;
	if(!ta.parentNode){
		Graphics.windowInputText_updateCanvas_ensureTextareaRoot().appendChild(ta);
	}
	const localRect=this.getRect_local();
	const pad=this.padding;
	const p0={x:localRect.x+pad,y:localRect.y+pad,};
	const p1={x:localRect.x+localRect.width-pad,y:localRect.y+localRect.height-pad,};
	const g0=this.toGlobal(p0);
	const g1=this.toGlobal(p1);
	const css=ta.style;
	const C=Graphics._canvas;
	css.left=g0.x*100/C.width+'%';
	css.top=g0.y*100/C.height+'%';
	css.width=(g1.x-g0.x)*100/C.width+'%';
	css.height=(g1.y-g0.y)*100/C.height+'%';
	css.fontSize=(this._taFontSize=this.standardFontSize()*ta.parentNode.offsetWidth/C.width)+'px';
	//if(this.contents) css.fontFamily=this.contents.fontFace; // will be GameFont
}).
getP;
window[a.name]=a;
}

new cfc(SceneManager).
addRoof('changeScene_do_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	Graphics.windowInputText_clearTextareaRoot();
	return rtv;
}).
getP;


})();
