"use strict";
/*:
 * @plugindesc let skill effects reference an item or another skill
 * @author agold404
 * 
 * @help <refer:itemId> <refer:skillId,s>
 * example:
 * <refer:1>
 * <refer:1,s>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SkillReference";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined, // 0: dev-reserve
params, // 1: plugin params
'_reference', // 2: obj property
'refer', // 3: note meta property
"[ERROR][SkillReference] ",
];


new cfc(Scene_Boot.prototype).
add('modEffect1',function f(dataobj,i,arr){
	this.referenceAnotherItem1_addRef.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('referenceAnotherItem1_addRef',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	if(!meta.refer||meta[f.tbl[3]]===true) return;
	const res=meta[f.tbl[3]].split(',');
	const id=res[0]-0;
	const cont=res[1]==='s'?$dataSkills:$dataItems;
	dataobj[f.tbl[2]]=cont[id];
},t).
add('start_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.referenceAnotherItems_arrange.apply(this,arguments);
	return rtv;
}).
addBase('referenceAnotherItems_arrange',function f(){
	const s=new Set();
	$dataSkills.forEach(this.referenceAnotherItem1_arrange,s);
	$dataItems.forEach(this.referenceAnotherItem1_arrange,s);
}).
addBase('referenceAnotherItem1_arrange',function f(dataobj,i,arr){
	// 'this' should be a Set
	// return deepest reference
	if(!dataobj) return;
	if(!dataobj[f.tbl[2]]){
		dataobj[f.tbl[2]]=undefined;
		return dataobj;
	}
	if(this.has(dataobj)){
		console.error(dataobj,this);
		const contName=arr===$dataItems?'item':'skill';
		throw new Error(f.tbl[4]+contName+" "+dataobj.id);
		return;
	}
	this.add(dataobj);
	const rtv=dataobj[f.tbl[2]]=f.call(this,dataobj[f.tbl[2]],i,arr);
	this.delete(dataobj);
	if(!rtv) console.warn('[ERROR]',pluginName,'algo error');
	return rtv;
},t).
getP;

new cfc(Game_Action.prototype).
add('item',function f(isUsingOriginal){
	const rtv=f.ori.apply(this,arguments);
	return !isUsingOriginal&&rtv&&rtv[f.tbl[2]]||rtv;
},t).
addBase('checkItemScope',function f(list){
	return list.contains(this.item(true).scope);
}).
getP;


})();
