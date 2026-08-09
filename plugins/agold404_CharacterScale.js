"use strict";
/*:
 * @plugindesc set scale for character objects
 * @author agold404
 * 
 * 
 * @help 
 * chr.chrScale_set({x: ... , y: ... });
 * the "..." part is the exactly scale value.
 * 
 * or
 * 
 * <scaleX: ... >
 * <scaleY: ... >
 * or
 * <scaleX> ... </scaleX>
 * <scaleY> ... </scaleY>
 * in event note.
 * the "..." part will be sent to eval().
 * THIS OVERWRITES THE PREVIOUS ONE.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_CharacterScale";
const params=PluginManager.parameters(pluginName)||{};


t=[
undefined,
params,
window.isTest(),
];


new cfc(Game_CharacterBase.prototype).
addBase('chrScale_get',function f(){
	return this._chrScale;
}).
addBase('chrScale_set',function f(val){
	this._chrScale=val;
	return this;
}).
getP;

new cfc(Game_Event.prototype).
addWithBaseIfNotOwn('chrScale_get',function f(){
	let rtv=f.ori.apply(this,arguments);
	const meta=this.getMeta();
	if('scaleX' in meta){
		if(!rtv) rtv={};
		rtv.x=EVAL.call(this,meta.scaleX);
	}
	if('scaleY' in meta){
		if(!rtv) rtv={};
		rtv.y=EVAL.call(this,meta.scaleY);
	}
	return rtv;
}).
getP;

new cfc(Sprite_Character.prototype).
add('update',function f(){
	this.update_chrScale.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('update_chrScale',function f(){
	const chr=this._character; if(!chr) return;
	const scl=chr.chrScale_get();
	const x=scl&&scl.x;
	const y=scl&&scl.y;
	if(x!=null&&y!=null) this.scale.set(x,y);
	else{
		if(x!=null) this.scale.x=x;
		if(y!=null) this.scale.x=y;
	}
}).
getP;


})();

