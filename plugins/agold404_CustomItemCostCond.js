"use strict";
/*:
 * @plugindesc use eval to specify 'canUse' condition and item/skill cost
 * @author agold404
 * 
 * @help in item/skill notes
 * 
 * eval() condition
 * <evalUseCond> ... </evalUseCond>
 * 
 * eval() cost
 * <evalUseCost> ... </evalUseCost>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_CustomItemCost";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined,
params, // 1: plugin params
['<evalUseCond>','</evalUseCond>'], // 2: customItemUseCond
['<evalUseCost>','</evalUseCost>'], // 3: customItemUseCost
(self,x)=>{
	const a=self,actor=a,user=a;
	const item=x;
	let k,r,t;
	let params;
	const s=item.meta.customItemUseCond;
	try{
		return eval(item.meta.customItemUseCond);
	}catch(e){
		e.message+=' in <evalUseCond> ... </evalUseCond> \n\nScript: \n';
		e.message+=s;
		throw e;
	}
}, // 4: eval use cond
(self,x)=>{
	const a=self,actor=a,user=a;
	const item=x;
	let k,r,t;
	let params;
	const s=item.meta.customItemUseCost;
	try{
		return eval(item.meta.customItemUseCost);
	}catch(e){
		e.message+=' in <evalUseCost> ... </evalUseCost> \nScript: \n';
		e.message+=s;
		throw e;
	}
}, // 5: eval use cost
];

new cfc(Scene_Boot.prototype).
add('modEffect1',function f(dataobj,i,arr){
	this.customItemCostCond.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('customItemCostCond',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta||!dataobj.note) return;
	meta.customItemUseCond=this.customItemCostCond_parseCond(dataobj);
	meta.customItemUseCost=this.customItemCostCond_parseCost(dataobj);
}).
addBase('customItemCostCond_getScope',function f(dataobj,scopeBegEnd){
	let rtv='"use strict"; ';
	let end=0;
	for(;;){
		let beg=dataobj.note.indexOf(scopeBegEnd[0],end);
		if(beg<0) break;
		end=dataobj.note.indexOf(scopeBegEnd[1],beg);
		if(end<0) end=dataobj.note.length;
		rtv+=dataobj.note.slice(beg+scopeBegEnd[0].length,end);
		rtv+='\n';
	}
	return end?rtv:undefined;
},t).
addBase('customItemCostCond_parseCond',function f(dataobj){
	return this.customItemCostCond_getScope(dataobj,f.tbl[2]);
},t).
addBase('customItemCostCond_parseCost',function f(dataobj){
	return this.customItemCostCond_getScope(dataobj,f.tbl[3]);
},t).
getP;

new cfc(Game_BattlerBase.prototype).
add('canUse',function f(item){
	if(!this.canUse_customEvalItemUseCond(item)) return false;
	return f.ori.apply(this,arguments);
}).
addBase('canUse_customEvalItemUseCond',function f(item){
	if(!item||!item.meta||item.meta.customItemUseCond==null) return true; // bypass this condition
	return f.tbl[4](this,item);
},t).
getP;

new cfc(Game_Battler.prototype).
add('useItem',function f(item){
	this.useItem_customEvalItemUseCost(item);
	return f.ori.apply(this,arguments);
}).
addBase('useItem_customEvalItemUseCost',function f(item){
	if(!item||!item.meta||item.meta.customItemUseCost==null) return;
	return f.tbl[5](this,item);
},t).
getP;


})();
