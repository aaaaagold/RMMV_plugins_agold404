"use strict";
/*:
 * @plugindesc set Window_help's font size
 * @author agold404
 * @help the text will be eval()-ed
 * if text is empty or the result of eval(THE_TEXT) is undefined, the default setting (probably Window_Base.prototype.standardFontSize) is used
 * 
 * @param FontSizeWindowHelp
 * @type note
 * @text Window_Help font size 
 * @desc font size eval()-ed text for Window_Help
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SkillReference";
const params=PluginManager.parameters(pluginName)||{};
params._fontSizeEvalText_windowHelp=JSON.parse(params.FontSizeWindowHelp)||"";
params.clearCache=function f(){
	delete this._fontSizeCache_windowHelp;
};

t=[
undefined, // 0: dev-reserve
params, // 1: plugin params
function f(){
	this[1].clearCache();
}, // 2: clear cache
'_fontSizeCache_windowHelp', // 3: eval()-ed cache key - Window_Help
];
t[2]();


new cfc(Window_Help.prototype).
addWithBaseIfNotOwn('standardFontSize',function f(){
	const rtv=this.standardWindowHelpFontSize();
	return rtv===undefined?f.ori.apply(this,arguments):rtv;
}).
addBase('standardWindowHelpFontSize',function f(){
	if(!(f.tbl[3] in f.tbl[1])) f.tbl[1][f.tbl[3]]=EVAL.call(this,f.tbl[1]._fontSizeEvalText_windowHelp);
	return f.tbl[1][f.tbl[3]];
},t).
getP;


})();
