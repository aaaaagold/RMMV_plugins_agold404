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


t=[
undefined,
params,
window.isTest(),
[{}], // 3: dummy info
];


new cfc(Graphics).
add('_updateCanvas',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._updateCanvas_InputText_textareaRoot.apply(this,arguments);
	return rtv;
}).
addWithBaseIfNotOwn('_updateCanvas_InputText_textareaRoot',function f(){
	const rtv=f.ori&&f.ori.apply(this,arguments);
	if(this._inputText_textareaRoot) return;
	const div=this._inputText_textareaRoot=document.ce('div').sa('style',this._canvas.ga('style'));
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
getP;

{ const a=class Window_InputText extends Window_Base{
};
new cfc(a.prototype).
addBase('initialize',function f(x,y,w,h,opt){
	f._super[f._funcName].apply(this,arguments);
	this.initialize_opt.apply(this,arguments);
}).
addBase('initialize_opt',function f(x,y,w,h,opt){
	this.initialize_textarea.apply(this,arguments);
}).
addBase('initialize_textarea',function f(x,y,w,h,opt){
	const ta=this._textarea=document.ce('textarea');
	for(let arr=f.tbl[0],x=arr.length;x--;) ta.style[arr[x][0]]=arr[x][1];
},[
[
['white-space','pre'],
['color','#FFF'],
['background-color','rgba(0,0,0,0)'],
['padding','0px'],
['border-width','0px'],
['margin','0px'],
['position','absolute'],
], // 0: css [ [key,val] ]
]).
addBase('destroy',function f(opt){
	this._textarea.parentNode && this._textarea.parentNode.removeChild(this._textarea);
	return f._super[f._funcName].apply(this,arguments);
}).
addBase('update',function f(){
	f._super[f._funcName].apply(this,arguments);
	this.update_textarea.apply(this,arguments);
}).
addBase('update_textarea',function f(){
	const ta=this._textarea;
	if(!ta.parentNode) Graphics._inputText_textareaRoot.appendChild(ta);
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
	css.fontSize=this.standardFontSize()*ta.parentNode.offsetWidth/C.width+'px';
	//if(this.contents) css.fontFamily=this.contents.fontFace; // will be GameFont
}).
getP;
window[a.name]=a;
}


})();
