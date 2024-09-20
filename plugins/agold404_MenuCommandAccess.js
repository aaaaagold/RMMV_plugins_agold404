"use strict";
/*:
 * @plugindesc api to switch accessibility of menu commands
 *
 * $gameSystem.menuCommand_setOptionsExists(options,isEnabled)
 * $gameSystem.menuCommand_setOptionsEnabled(options,isEnabled)
 *
 * options: an array of some cases in Window_MenuCommand.prototype.needsCommand
 * isEnabled: true, false, undefined(=not using this record)
 *
 *
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_System.prototype).add('_menuCommand_setOptions_common',function f(cont,options,isEnabled){
	options.forEach(f.tbl[0].bind(cont,isEnabled));
	return this;
},[
function(isEnabled,key){ this[key]=isEnabled; }, // 0: forEach
],true,true).add('_menuCommand_getCont',function f(){
	let rtv=this._menuCommandOptions; if(!rtv) rtv=this._menuCommandOptions={exists:{},enabled:{},};
	return rtv;
},undefined,true,true).add('menuCommand_setOptionsExists',function f(options,isEnabled){
	return this._menuCommand_setOptions_common(this._menuCommand_getCont().exists,options,isEnabled);
},undefined,true,true).add('menuCommand_setOptionsEnabled',function f(options,isEnabled){
	return this._menuCommand_setOptions_common(this._menuCommand_getCont().enabled,options,isEnabled);
},undefined,true,true).add('menuCommand_getOptionExists',function f(option){
	return this._menuCommand_getCont().exists[option];
},undefined,true,true).add('menuCommand_getOptionEnabled',function f(option){
	return this._menuCommand_getCont().enabled[option];
},undefined,true,true);

new cfc(Window_MenuCommand.prototype).add('needsCommand',function f(name){
	let isExist;
	if(!$gameSystem||(isExist=$gameSystem.menuCommand_getOptionExists(name))===undefined) return f.ori.apply(this,arguments);
	return isExist;
}).add('isConfEnabledCommand',function f(name){
	const isEnabled=$gameSystem.menuCommand_getOptionEnabled(name);
	return isEnabled===undefined?f.ori.apply(this,arguments):isEnabled;
});

})();
