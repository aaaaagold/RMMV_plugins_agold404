"use strict";
/*:
 * @plugindesc Customize default line number for Window_Help
 * @author agold404
 * 
 * 
 * @param Lines
 * @type number
 * @text default line number of Window_Help
 * @desc a number >= 2^31 or <= -2^31 will be buggy. fractions will be truncated. numbers <= 0 has no effects.
 * @default 3
 * 
 * 
 * use <description> ... </description> to overwrite built-in "description" field.
 * starts with a line with only <description>
 * and ends with a line with only </description>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_WindowHelpDefaultNumLines";
const params=PluginManager.parameters(pluginName)||{};
params._lines=~~JSON.parse(params.Lines||"3");

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
];


new cfc(Scene_Boot.prototype).
add('modDescription1',function f(dataobj){
	this.loadDescriptionFromNote.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('loadDescriptionFromNote',function f(dataobj){
	const note=dataobj&&dataobj.note.replace(re_allR,''); if(!note) return;
	let strt=0;
	for(;;){
		strt=note.indexOf(f.tbl[0][0],strt);
		if(strt<0) return;
		if(strt===0||note[strt-1]==='\n') break;
		++strt;
	}
	let ende=strt;
	for(;;){
		ende=note.indexOf(f.tbl[0][1],ende);
		if(ende<0) return;
		const e=f.tbl[0][1].length+ende;
		if(e>=note.length||note[e]==='\n') break;
		++ende;
	}
	dataobj.description=note.slice(f.tbl[0][0].length+strt,ende);
},[
["<description>\n","\n</description>"], // 0: start/end  keywords
]).
getP;


if(!(0<params._lines)) return;
new cfc(Window_Help.prototype).
addBase('initialNumLines',function f(){
	return f.tbl[1]._lines;
},t).
getP;


})();
