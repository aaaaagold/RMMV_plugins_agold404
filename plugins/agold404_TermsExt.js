"use strict";
/*:
 * @plugindesc extends $dataSystem.terms with locale.
 * @author agold404
 *
 * @help all formats are 2+n*2 lines:
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
	const parameters=PluginManager.parameters(f.tbl[0]); if(!parameters) return;
	const locale=DataManager.getLocale();
	const tCmds=this.termExt_pasrseSetting1(parameters.TermsCommands);
	const tMsgs=this.termExt_pasrseSetting1(parameters.TermsMessages);
	const tParams=this.termExt_pasrseSetting1(parameters.TermsParams);
	const tBasic=this.termExt_pasrseSetting1(parameters.TermsBasic);
	const infos=[
		['commands',tCmds],
		['messages',tMsgs],
		['params',tParams],
		['basic',tBasic],
	];
	for(let x=0,xs=infos.length;x!==xs;++x) this.termExt_updateDataSystemTerms(locale,infos[x][0],infos[x][1]);
},t).addBase('termExt_pasrseSetting1',function f(setting){
	// rtv = [ [key,{locale:textWithTheLocale, ... },text], ... ]
	const rtv=[];
	const raw=JSON.parse(setting);
	for(let x=0,xs=raw.length;x<xs;++x){
		const lines=JSON.parse(raw[x]).replace(re_allR,'').split('\n').filter(filterArg0);
		if(lines.length<2||!lines[0]) continue;
		const curr=[lines[0],{},lines[1]];
		for(let i=0,sz=lines.length;sz>=(i+=2);) curr[1][lines[i-2]]=lines[i-1];
		rtv.push(curr);
	}
	return rtv;
}).addBase('termExt_updateDataSystemTerms',function f(locale,category,parsedInfo){
	const obj=$dataSystem.terms&&$dataSystem.terms[category];
	for(let x=0,xs=parsedInfo.length;x!==xs;++x) obj[parsedInfo[x][0]]=(locale in parsedInfo[x][1])?parsedInfo[x][1][locale]:parsedInfo[x][2];
	return obj;
});
}

})();
