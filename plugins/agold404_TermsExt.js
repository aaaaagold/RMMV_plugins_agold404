"use strict";
/*:
 * @plugindesc extends $dataSystem.terms with locale.
 * @author agold404
 *
 * @help this plugin adds custom properties to the following:
 * - $dataSystem.terms.commands
 * - $dataSystem.terms.messages
 * - $dataSystem.terms.params
 * - $dataSystem.terms.basic
 * according to locale setting.
 * 
 * 
 * all formats are 2+n*2 lines:
 * 
 * default key, for the text
 * default text
 * (optional) locale
 * (optional) text, with the locale
 * ...
 * 
 * 
 * blank lines will be discarded before parsing locale, so you can add several blank lines between (locale,text,key) tupples,
 * like the following:
 * 
 * default key, for the text
 * default text
 * 
 * (optional) locale
 * (optional) text, with the locale
 * 
 * 
 * One can use DataManager.termExt_updateDataSystemTerms(); to update phrases after $gameSystem.setLocate(SPECIFYING_LOCALE_STRING_HERE);
 * $gameSystem.setLocate(); with no arguments means using default setting,
 * which is Intl.DateTimeFormat().resolvedOptions().locale;
 * 
 * 
 * in short, to sets the locale in game, execute the following in order:
 * 
 * $gameSystem.setLocate(SPECIFYING_LOCALE_STRING_HERE);
 * DataManager.termExt_updateDataSystemTerms();
 * 
 * 
 * About $dataSystem.terms.evals:
 * Automatically adds 'evals' property to $dataSystem.terms
 * Basically as same as the above, except text field is sent to eval and takes its output as final value.
 * // the evaluated value is determined on DataManager.termExt_updateDataSystemTerms is called.
 * 
 * 
 * @param TermsCommands
 * @type note[]
 * @text $dataSystem.terms.commands
 * @desc $dataSystem.terms.commands[key]=text
 * @default ["\"exampleCommand\\nExample default command text\\n\\nen-US\\nExample en-US command text\""]
 * 
 * @param TermsMessages
 * @type note[]
 * @text $dataSystem.terms.messages
 * @desc $dataSystem.terms.messages[key]=text
 * @default ["\"exampleMessage\\nExample default message text\\n\\nen-US\\nExample en-US message text\""]
 * 
 * @param TermsParams
 * @type note[]
 * @text $dataSystem.terms.params
 * @desc $dataSystem.terms.params[key]=text
 * @default ["\"exampleParam\\nExample default param text\\n\\nen-US\\nExample en-US param text\""]
 * 
 * @param TermsBasic
 * @type note[]
 * @text $dataSystem.terms.basic
 * @desc $dataSystem.terms.basic[key]=text
 * @default ["\"exampleBasic\\nExample default basic text\\n\\nen-US\\nExample en-US basic text\""]
 * 
 * @param TermsEvals
 * @type note[]
 * @text $dataSystem.terms.evals
 * @desc $dataSystem.terms.evals[key]=eval(text)
 * @default ["\"exampleEvals\\n\\\"Example default eval text\\\"\\n\\nen-US\\n\\\"Example en-US eval text\\\"\""]
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

{
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_TermExt";
t=[
pluginName, // 0: plugin name
];
new cfc(DataManager).add('onLoad_before_system',function f(obj,name,src,msg){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_before_system_termExt.apply(this,arguments);
	return rtv;
}).addBase('onLoad_before_system_termExt',function f(obj,name,src,msg){
	this.termExt_updateDataSystemTerms(obj);
}).addBase('termExt_updateDataSystemTerms',function f(dataSystem){
	const obj=dataSystem||$dataSystem;
	const parameters=PluginManager.parameters(f.tbl[0]); if(!parameters) return;
	const locale=DataManager.getLocale();
	const tEvals=this.termExt_pasrseSetting1(parameters.TermsEvals);
	const infos=[
		['evals',tEvals],
	];
	{
	const tCmds=this.termExt_pasrseSetting1(parameters.TermsCommands);
	const tMsgs=this.termExt_pasrseSetting1(parameters.TermsMessages);
	const tParams=this.termExt_pasrseSetting1(parameters.TermsParams);
	const tBasic=this.termExt_pasrseSetting1(parameters.TermsBasic);
	infos.push(
		['commands',tCmds],
		['messages',tMsgs],
		['params',tParams],
		['basic',tBasic],
	);
	}
	if(!obj.terms.evals) obj.terms.evals={};
	for(let x=0,xs=infos.length;x!==xs;++x) this._termExt_updateDataSystemTerms(obj,locale,infos[x][0],infos[x][1]);
	this._termExt_updateDataSystemTerms_eval(obj,tEvals);
},t).addBase('termExt_pasrseSetting1',function f(setting){
	// rtv = [ [key,{locale:textWithTheLocale, ... },text], ... ]
	const rtv=[]; if(!setting) return rtv;
	const raw=JSON.parse(setting);
	for(let x=0,xs=raw.length;x<xs;++x){
		const lines=JSON.parse(raw[x]).replace(re_allR,'').split('\n').filter(filterArg0);
		if(lines.length<2||!lines[0]) continue;
		const curr=[lines[0],{},lines[1]];
		for(let i=0,sz=lines.length;sz>=(i+=2);) curr[1][lines[i-2]]=lines[i-1];
		rtv.push(curr);
	}
	return rtv;
}).addBase('_termExt_updateDataSystemTerms',function f($dataSystem,locale,category,parsedInfo){
	const obj=$dataSystem.terms[category];
	for(let x=0,xs=parsedInfo.length;x!==xs;++x) obj[parsedInfo[x][0]]=(locale in parsedInfo[x][1])?parsedInfo[x][1][locale]:parsedInfo[x][2];
	return obj;
}).addBase('_termExt_updateDataSystemTerms_eval',function f($dataSystem,tEvals){
	const obj=$dataSystem.terms.evals,parsedInfo=tEvals;
	for(let x=0,xs=parsedInfo.length;x!==xs;++x) obj[parsedInfo[x][0]]=EVAL(obj[parsedInfo[x][0]]);
	return obj;
});
}

})();
