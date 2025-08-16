"use strict";
/*:
 * @plugindesc make drawText to use drawTextEx when specified prefix is given
 * @author agold404
 * 
 * 
 * @param ThePrefix
 * @type note
 * @text prefix to trigger
 * @desc !! case sensitive !!
 * @default "\\STYLEDTEXT."
 * 
 * 
 * @help you can use it on skill name, item name, or other maybe.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_MakeStyledText";
const params=PluginManager.parameters(pluginName)||{};
params._thePrefix=JSON.parse(params.ThePrefix||"\"\""); if(!params._thePrefix||params._thePrefix.constructor!==String) params._thePrefix='';


t=[
undefined,
params,
window.isTest(),
[{}], // 3: dummy info
];


new cfc(Window_Base.prototype).
addRoof('makeStyledText_cutPrefix',function f(text){
	if(text&&f.tbl[1]._thePrefix&&text.slice(0,f.tbl[1]._thePrefix.length)===f.tbl[1]._thePrefix) return text.slice(f.tbl[1]._thePrefix.length);
	return text;
},t).
addRoof('drawText',function f(text,x,y,maxWidth,align,opt){
	if(text){
		text+='';
		const oriLen=text&&text.length||0;
		text=this.makeStyledText_cutPrefix(text);
		if(oriLen!==text.length){
			arguments[0]=text;
			return this.drawTextEx.apply(this,arguments);
		}
	}
	return f.ori.apply(this,arguments);
},t).
addRoof('drawTextEx',function f(text, x, y, _3, _4, out_textState){
	arguments[0]=this.makeStyledText_cutPrefix(text);
	return f.ori.apply(this,arguments);
},t).
getP;


})();
