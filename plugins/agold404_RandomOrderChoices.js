"use strict";
/*:
 * @plugindesc randomizing the order of chioces
 * @author agold404
 * 
 * 
 * @help (in event commands page) `this.randomOrderChoices_setNextChiocesRandomOrder();`
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Trait_statesStackTimes";
const params=PluginManager.parameters(pluginName)||{};
params._globalChanges=JSON.parse(params.GlobalChanges||"0");


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
(x,i)=>[x,i], // 3: map
];


new cfc(Game_Interpreter.prototype).
addBase('randomOrderChoices_setNextChiocesRandomOrder',function f(isNextChiocesDefaultChoiceTracking){
	this._randomOrderChoices_isNextRandomOrder=true;
	this._randomOrderChoices_isNextChiocesDefaultChoiceTracking=!!isNextChiocesDefaultChoiceTracking;
	return this;
}).
addBase('randomOrderChoices_getNextChiocesRandomOrder',function f(){
	return this._randomOrderChoices_isNextRandomOrder;
}).
addBase('randomOrderChoices_getNextChiocesDefaultChoiceTracking',function f(){
	return this._randomOrderChoices_isNextChiocesDefaultChoiceTracking;
}).
addBase('randomOrderChoices_clearNextChiocesSettings',function f(){
	this._randomOrderChoices_isNextRandomOrder=undefined;
	this._randomOrderChoices_isNextChiocesDefaultChoiceTracking=undefined;
	return this;
}).
addRoof('setupChoices',function f(params){
	const rtv=f.ori.apply(this,arguments);
	this.randomOrderChoices_applySettings();
	return rtv;
}).
addBase('randomOrderChoices_applySettings',function f(){
	if(this.randomOrderChoices_getNextChiocesRandomOrder()){
		const rmp=this._randomOrderChoices_choicesCallbackRemapper=[];
		const src=$gameMessage._choices.map(f.tbl[3]);
		const dst=$gameMessage._choices=[];
		for(let x=0,xs=src.length;x<xs;++x){
			const srcIdx=~~(Math.random()*src.length);
			const info=src[srcIdx];
			src[srcIdx]=src.back;
			src.pop();
			dst[x]=info[0];
			const cmdListIdx=rmp[x]=info[1];
			if(this.randomOrderChoices_getNextChiocesDefaultChoiceTracking()&&$gameMessage._choiceDefaultType===cmdListIdx){
				$gameMessage._choiceDefaultType=x;
				this.randomOrderChoices_clearNextChiocesSettings();
			}
		}
	}else this._randomOrderChoices_choicesCallbackRemapper=undefined;
	this.randomOrderChoices_clearNextChiocesSettings();
},t).
add('setupChoices_callback',function f(n){
	const rmp=this._randomOrderChoices_choicesCallbackRemapper;
	if(rmp){
		this._randomOrderChoices_choicesCallbackRemapper=undefined;
		if(n in rmp) arguments[0]=rmp[n];
	}
	return f.ori.apply(this,arguments);
}).
getP;


})();
