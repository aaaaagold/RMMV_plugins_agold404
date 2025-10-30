"use strict";
/*:
 * @plugindesc Add enemy drops in note
 * @author agold404
 * @help format:
 * 
 * <dropItemsEval>
 * [
 *  [itemClass,itemId,dropRate,dropNums],
 *  ...,
 *  ...,
 * ]
 * </dropItemsEval>
 * 
 * itemClass will one of the following:
 *   'i': stand for item
 *   'w': stand for weapon
 *   'a': stand for armor
 * 
 * itemId: the id of one of the above according to the setting above.
 * 
 * dropRate: the dropped rate of this item.
 * 
 * dropNums: the dropped numbers of this item.
 * 
 * A setting calculate the rate ONCE.
 * Therefore, for example, setting dropNums be 2, the actual dropped numbers of this setting, will be either 0 or 2.
 * 
 * The entire <dropItemsEval> is eval()-ed in Game_Enemy.prototype.makeDropItems
 * When multiple <dropItemsEval> exists, the first matched <dropItemsEval> one will be used.
 * When multiple <d/ropItemsEval> exists, the first matched </dropItemsEval> following the first <dropItemsEval> will be used.
 * 
 * 
 * for example:
 * 
 * <dropItemsEval>
 * [
 *  ['i',1,0.25,2],
 * ]
 * </dropItemsEval>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_EnemyDropItemsEval";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined, // 0: dev-reserve
params, // 1: plugin params
['<dropItemsEval>','</dropItemsEval>',/[\b\n\r ]+$|^[\b\n\r ]+/g,''], // 2: start string , end string
function f(enemyd){ if(!enemyd) return;
	enemyd._dropsEval=undefined;
	const strt=enemyd.note.indexOf(f.tbl[2][0]);
	if(strt<0) return;
	const ende=enemyd.note.indexOf(f.tbl[2][1],strt+1);
	if(ende<0) return;
	enemyd._dropsEval=enemyd.note.slice(strt+f.tbl[2][0].length,ende).replace(f.tbl[2][2],f.tbl[2][3]);
}, // 3: forEach enemyd. this=Game_Enemy
function f(info){
	if(!f._containers){ f._containers={
		'i':$dataItems,
		'w':$dataWeapons,
		'a':$dataArmors,
	}; }
	const cont=f._containers[info[0]];
	const item=cont&&cont[info[1]];
	const rate=this._ItemDropRate*info[2];
	if(!item||!(info[3]>=1)||Math.random()>=rate) return;
	for(let _=info[3];_-->=1;) this.push(item);
}, // 4: forEach push to drop list. this=dropsArr
[
"\n\n"+"["+pluginName+"]"+" "+"dropsEval error\n", // 5-0
"enemy id: ", // 5-1
"script:\n", // 5-2
], // 5: err msg
];
t[3].tbl=t;


new cfc(DataManager).
add('onLoad_before_enemy',function f(obj,name,src,msg){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_enemy_genDropsEval.apply(this,arguments);
	return rtv;
}).
addBase('onLoad_enemy_genDropsEval',function f(obj,name,src,msg){
	obj.forEach(f.tbl[3],this);
},t).
getP;

new cfc(Game_Enemy.prototype).
add('makeDropItems',function f(troopId){
	const res=f.ori.apply(this,arguments);
	res._ItemDropRate=this.dropItemRate();
	return this.makeDropItems_dropsEval(res);
}).
addBase('makeDropItems_dropsEval',window.isTest()?(function f(dropsArr){
	const d=this.getData();
	if(d._dropsEval){ try{
		const dropsEval=EVAL.call(this,d._dropsEval);
		if(dropsEval&&dropsEval.length&&dropsEval.forEach) dropsEval.forEach(f.tbl[4],dropsArr);
	}catch(e){
		e.message+=f.tbl[5][0];
		e.message+=f.tbl[5][1];
		e.message+=d.id;
		e.message+='\n';
		e.message+=f.tbl[5][2];
		e.message+=d._dropsEval;
		throw e;
	} }
	return dropsArr;
}):(function f(dropsArr){
	const d=this.getData();
	const dropsEval=d._dropsEval&&EVAL.call(this,d._dropsEval);
	if(dropsEval&&dropsEval.length&&dropsEval.forEach) dropsEval.forEach(f.tbl[4],dropsArr);
	return dropsArr;
}),t).
getP;


})();
