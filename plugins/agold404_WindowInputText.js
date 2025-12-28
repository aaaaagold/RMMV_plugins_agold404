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
	const root=this.windowInputText_updateCanvas_ensureTextareaRoot();
	for(let arr=root.childNodes,x=arr.length;x--;){
		const ta=arr[x];
		ta._lastScroll=({
			l:ta.scrollLeft,
			t:ta.scrollTop,
		});
	}
	root.rf(0);
	// textareas blur automatically if reomved from parentNode
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
	const css=ta.style;
	for(let arr=f.tbl[0],x=arr.length;x--;) css[arr[x][0]]=arr[x][1];
	for(let arr=f.tbl[1],x=arr.length;x--;) ta.addEventListener(arr[x][0],arr[x][1],arr[x][2]);
	ta._wnd=this;
	if(opt){
		this._updatePolling=opt.updatePolling;
		if((ta._line1=opt.line1||"")) css['scrollbar-width']='none';
		{ const m=ta._line1.match(f.tbl[3]); if(m){
			ta._arrowsToAdjustNumber=useDefaultIfIsNaN(m[2]-0,1);
		} }
		if(opt.align) css['text-align']=opt.align;
		ta._enterAsOk=opt.enterAsOk;
		ta._escAsCancel=opt.escAsCancel;
		ta._okCallback=opt.okCallback;
		ta._cancelCallback=opt.cancelCallback;
	}
},[
[
['white-space','pre'],
['color','#FFF'],
['background-color','rgba(0,0,0,0)'],
['padding','0px 2px 0px 2px'],
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
},
],
['focus',t=e=>{
	// also 'touchstart' , 'pointerdown'
	if(window.isTest()) console.log('[WindowInputText]','on textarea',e.type);
	TouchInput.clear();
	Input.isTexting_set();
},
],
['touchstart',
t,
],
['pointerdown',
t,
],
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
},
],
['keydown',e=>{
	const dom=e.target;
	if(!dom._wnd.isOpen()){
		e.preventDefault();
		return;
	}
	const kc=e.keyCode;
	if(dom._okCallback){
		if(dom._enterAsOk&&kc===13){
			dom._okCallback(e);
		}
	}
	if(dom._cancelCallback){
		if(dom._escAsCancel&&kc===27){
			dom._cancelCallback(e);
		}
	}
	if(dom._arrowsToAdjustNumber&&(kc===38||kc===40)){
		const v0=dom.value-0;
		if(!isNaN(v0)){
			const unit=e.shiftKey?dom._arrowsToAdjustNumber:1;
			if(kc===38) dom.value=v0+unit;
			if(kc===40) dom.value=v0-unit;
		}
		e.preventDefault();
	}
	if(kc===13){
		if(dom._line1) e.preventDefault();
		return;
	}
},
],
], // 1: event listeners
({
okCallbackAndLine1:e=>e.target.okCallback(),
}), // 2: default opt callbacks
/^arrowsToAdjustNumber(:([0-9]+|0x[0-9A-Fa-f]+|0o[0-7]+))?/, // 3: shift ratio, using line1 option
]).
addWithBaseIfNotOwn('onclosed',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._textarea.blur();
	return rtv;
}).
addWithBaseIfNotOwn('onopened',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._textarea.focus();
	return rtv;
}).
addWithBaseIfNotOwn('destroy',function f(opt){
	this._textarea.parentNode && this._textarea.parentNode.removeChild(this._textarea);
	return f.ori.apply(this,arguments);
}).
addWithBaseIfNotOwn('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.windowInputText_updateTextarea.apply(this,arguments);
	if(this._updatePolling) this._updatePolling.apply(this,arguments);
	return rtv;
}).
addBase('windowInputText_updateTextarea',function f(){
	const ta=this._textarea;
	if(!ta.parentNode){
		Graphics.windowInputText_updateCanvas_ensureTextareaRoot().appendChild(ta);
		if(ta._lastScroll){
			ta.scrollTo(
				ta._lastScroll.l,
				ta._lastScroll.t,
			);
		}
	}
	const ref=this._windowSpriteContainer||this;
	const localRect=ref.getRect_local();
	const pad=this.padding;
	const p0={x:localRect.x+pad,y:localRect.y+pad,};
	const p1={x:localRect.x+localRect.width-pad,y:localRect.y+localRect.height-pad,};
	const g0=ref.toGlobal(p0);
	const g1=ref.toGlobal(p1);
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
