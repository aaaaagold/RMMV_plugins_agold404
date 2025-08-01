"use strict";
/*:
 * @plugindesc set a group of items to count together when determine hasMaxItem
 * @author agold404
 * @help
 * write
 * <unionCnt:JSON_format_info>
 * in note of item/weapon/armor to specify when judging the stack, use the value of the sum of these items/weapons/armors as current number of items/weapons/armors.
 * JSON_format_info: array of ["type",id]
 * e.g. <unionCnt:[["i",4],["w",16],["a",64]]> will use the number of sum of "item 4", "weapon 16" and "armor 64", as the number of current number of THIS items/weapons/armors.
 * e.g.
 * you wrote the above in "item 1", setting maxStack to 10 in "item 1".
 * when you gain an "item 1", if the sum of the number of "item 4", "weapon 16" and "armor 64" your party holds DO NOT reach 10, then your party gains another "item 1" ; Otherwise, your party gains nothing.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

{
const kw='unionCnt';
t=[
"_"+kw,
kw,
];
}


new cfc(Scene_Boot.prototype).
add('modItem1',function f(dataobj,i,arr){
	this.modItem1_unionCnt.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('modItem1_unionCnt',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	if(f.tbl[1] in meta) dataobj[f.tbl[0]]=JSON.parse(meta[f.tbl[1]]);
},t);

new cfc(Game_Party.prototype).
add('unionCnt',function f(dataobj){
	if(!(dataobj && (f.tbl[0] in dataobj))) return (f.ori||this.numItems).apply(this,arguments);
	let cnt=0;
	for(let x=0,arr=dataobj[f.tbl[0]],cont;x!==arr.length;++x){
		const info=arr[x];
		cont=DataManager.getItemCont(info[0]);
		if(cont) cnt+=this.numItems(cont[info[1]]);
	}
	return cnt;
},t).
addBase('hasMaxItems',function f(dataobj){
	return this.unionCnt(dataobj)>=(this.maxItems(dataobj)|0);
}).
getP;


})();
