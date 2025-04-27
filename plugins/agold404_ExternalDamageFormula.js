"use strict";
/*:
 * @plugindesc Write damage formula outside of the RMMV editor.
 * @author agold404
 * 
 * 
 * @help purpose:
 * 1-line damage formula field is hard to code,
 * and one's lazy to create a function to be called in the damage formula.
 * 
 * use <extDmgFormula: ... > in note of skills or items to use external file filling the damage formula field.
 * e.g.
 *  write the following in the note of skill 404:
 *   <extDmgFormula:path/to/my/skill_ex.txt>
 *  this reads the file at path/to/my/skill_ex.txt , use replacing original damage formula text with the file's content.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_ExternalDamageFormula";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
"extDmgFormula", // 3: meta tag name
{
"item":"item",
"skill":"skill",
}, // 4: err msg - item type
];


new cfc(Scene_Boot.prototype).
addBase('extDmgFormula_prepareLoadings',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta;
	const path=meta&&meta[f.tbl[3]];
	if(!path) return;
	let loadings=this._extDmgFormula_loadings; if(!loadings) loadings=this._extDmgFormula_loadings=[];
	loadings.push([dataobj,path]);
	ImageManager.otherFiles_addLoad(path);
},t).
add('modEffect1',function f(dataobj,i,arr){
	this.extDmgFormula_prepareLoadings.apply(this,arguments);
	return f.ori.apply(this,arguments);
},t).
addBase('extDmgFormula_onApplyError',function f(info,i,arr){
	if(!f.tbl[2]) return;
	let msg="[ERROR][ExternalDamageFormula] "+f.tbl[3]+" of ";
	if(DataManager.isSkill(info[0])){
		msg+=f.tbl[4].skill;
	}else if(DataManager.isItem(info[0])){
		msg+=f.tbl[4].item;
	}
	msg+=' '+info[0].id+" cannot be loaded\n";
	msg+=" path: "+info[1];
	throw new Error(msg);
},t).
addBase('extDmgFormula_apply1',function f(info,i,arr){
	// called from Array.forEach in extDmgFormula_applyAll
	const dataobj=info[0];
	const dmg=dataobj.damage;
	if(!dmg) return;
	const raw=ImageManager.otherFiles_getData(info[1]);
	if('string'!==typeof raw) this.extDmgFormula_onApplyError.apply(this,arguments);
	dmg.formula=raw;
},t).
addBase('extDmgFormula_applyAll',function f(){
	const loadings=this._extDmgFormula_loadings; if(!loadings) return;
	loadings.forEach(this.extDmgFormula_apply1,this);
}).
add('terminate_before',function f(){
	this.extDmgFormula_applyAll.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
getP;


})();
