"use strict";
/*:
 * @plugindesc extend info displayed in a window
 * @author agold404
 * 
 * 
 * @param DefaultExtInfoText
 * @type note
 * @text default eval()-ed text
 * @desc a text to be eval()-ed and then be (conceptually) put into <extInfoText> ... </extInfoText>
 * @default ""
 * 
 * 
 * @help <extInfoText> ... </extInfoText>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Note_dataobjExtInfo";
const params=PluginManager.parameters(pluginName)||{};
params._defaultExtInfoText=JSON.parse(params.DefaultExtInfoText||'""').replace(re_allR,'');
params._windowOpenKey='shift';
params._windowFloatKey='70'; // F


t=[
undefined,
params,
window.isTest(),
[{}], // 3: dummy info
["<extInfoText>","</extInfoText>"], // 4: the mark
];


new cfc(Scene_Boot.prototype).
add('modAll1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.dataobjExtInfo_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('dataobjExtInfo_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	
	{
		const xmlMark=f.tbl[4];
		if(xmlMark){
			const codes=window.getXmlLikeStyleContent(dataobj.note,xmlMark);
			for(let ci=0,cs=codes.length,tmp;ci<cs;++ci){
				codes[ci]=codes[ci].join('\n');
			}
			dataobj[xmlMark[0]]=codes.join('\n');
		}
	}
	
	return;
},t).
getP;

new cfc(DataManager).
addBase('dataobjExtInfo_getDefaultExtInfo',function f(item,self){
	let rtv;
	{ const isTest=f.tbl[2],s=f.tbl[1]._defaultExtInfoText;
	if(s){ let f,k,r,t; {
		let tmp;
		if(isTest){
			try{
				tmp=eval(s);
			}catch(e){
				console.log(s);
				console.warn(e);
				tmp=undefined;
			}
		}else{ tmp=eval(s); }
		rtv=tmp;
	} }
	}
	return rtv;
},t).
getP;


new cfc(Window_Selectable.prototype).
addBase('dataobjExtInfo_hasFunc',function f(){
	return false;
}).
add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.dataobjExtInfo_initSubWindows.apply(this,arguments);
	return rtv;
}).
addBase('dataobjExtInfo_initSubWindows',function f(){
	if(!this.dataobjExtInfo_hasFunc()) return;
	this.dataobjExtInfo_getSubWindow_note(); // getter also init
}).
addBase('dataobjExtInfo_getSubWindow_note',function f(){
	let rtv=this._dataobjExtInfo_getSubWindow_note;
	if(!rtv){
		this.addChild(rtv=this._dataobjExtInfo_getSubWindow_note=new Window_Base(0,0,1,1));
		rtv.alpha=0.984375;
	}
	return rtv;
}).
addBase('dataobjExtInfo_adjustWindowSize',function f(wnd,infoText){
	if(!wnd) return;
	let rtv;
	const textState={};
	wnd.measure_drawTextEx(infoText+"\n",0,0,undefined,undefined,textState);
	const p2=this.standardPadding()*2;
	const cw=textState.right-textState.left;
	const ch=textState.y;
	rtv=wnd.clear_recreateContentsIfOriginallySmaller(cw,ch);
if(0){
	const cc=wnd.contents;
	const newCw=Math.max(cw,cc.width);
	const newCh=Math.max(ch,cc.height);
	if(cc.width<newCw||cc.height<newCh){
		wnd._width=newCw+p2;
		wnd._height=newCh+p2;
		wnd._refreshAllParts();
		wnd.createContents();
		rtv=true;
	}
}
	wnd._width=cw+p2;
	wnd._height=ch+p2;
	wnd._refreshAllParts();
	return rtv;
}).
addRoof('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.dataobjExtInfo_adjustSubWindows.apply(this,arguments);
	return rtv;
}).
addBase('dataobjExtInfo_adjustSubWindows',function f(){
	if(!this.dataobjExtInfo_hasFunc()) return;
	this.dataobjExtInfo_adjustSubWindowNote.apply(this,arguments);
}).
addBase('dataobjExtInfo_adjustSubWindowNote',function f(){
	if(!this.item) return; // not usable
	if(Input.isTriggered(f.tbl[1]._windowOpenKey)) this._dataobjExtInfo_showNote^=1;
	const item=this.item();
	let extInfoText;
	if(this._dataobjExtInfo_showNote){
		extInfoText=item&&item[f.tbl[4][0]];
		if(!extInfoText) extInfoText=DataManager.dataobjExtInfo_getDefaultExtInfo(item,this);
	}
	if(extInfoText){
		const wnd=this.dataobjExtInfo_getSubWindow_note();
		if(!wnd.isOpen()&&!wnd.isOpening()) wnd.open();
		if(this._lastDraw!==item){
			this._lastDraw=item;
			wnd.drawTextExInfo_setItem(item);
			if(!this.dataobjExtInfo_adjustWindowSize(wnd,extInfoText)){
				wnd.contents.clearRect(0,0,wnd.contentsWidth(),wnd.contentsHeight());
				wnd.resetFontSettings();
			}
			wnd.drawTextEx(extInfoText,0,0);
		}
			const pad=this.standardPadding();
			const rect=this.itemRect_curr();
			wnd.x=rect.x+rect.width+pad-wnd.width;
			wnd.y=rect.y+rect.height+pad;
			const gp=wnd.getGlobalPosition();
if(!Input.isPressed(f.tbl[1]._windowFloatKey)){
			if(gp.y<0){
				wnd.y-=gp.y;
				gp.y=0;
			}
			const overY=gp.y+wnd.height-Graphics.height;
			if(0<overY){
				wnd.y-=Math.min(gp.y,overY);
			}
			if(gp.x<0) wnd.x-=gp.x;
}
	}else{
		this.dataobjExtInfo_getSubWindow_note().close();
	}
},t).
getP;

new cfc(Window_SkillList.prototype).
addBase('dataobjExtInfo_hasFunc',function f(){
	return true;
}).
getP;

new cfc(Window_ItemList.prototype).
addBase('dataobjExtInfo_hasFunc',function f(){
	return true;
}).
getP;

new cfc(Window_ShopBuy.prototype).
addBase('dataobjExtInfo_hasFunc',function f(){
	return true;
}).
getP;


})();
