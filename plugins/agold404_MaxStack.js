"use strict";
/*:
 * @plugindesc set max stack for each item/weapon/armor
 * @author agold404
 * 
 * 
 * @param DefaultMaxStack
 * @text default maxStack
 * @desc if the string you filled cannot be parsed to a number by "-0", nothing will happen.
 * 
 * 
 * @param GlobalAdd
 * @type number
 * @text global max stack num. added
 * @desc add max stack num to all items
 * @default 0
 * 
 * 
 * @help set max stack for each item/weapon/armor
 * 
 * use param of this plugin to set it the default maxStack value.
 * nothing will happen if the string you filled cannot be parsed to a number by "-0".
 * 
 * 
 * write
 * <maxStack:_a_number_>
 * in note of item/weapon/armor to set for it
 * e.g. <maxStack:9999> will set the stack limit of the items/weapons/armors to 9999.
 * if _a_number_ cannot be casted to a number by "-0", 0 is used.
 * fractions will be discarded.
 * max value is limited to 2147483647 ( = max value of int32 ).
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

{
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_MaxStack";
const params=PluginManager.parameters(pluginName)||{};
params._globalAdd=useDefaultIfIsNaN(params.GlobalAdd-0,0);
const paramKey_defaultMaxStack='DefaultMaxStack';

const gbb=Game_BattlerBase,kw='maxStack';
const kwt='TRAIT_'+kw; // built-in

if(!gbb._enumMax) gbb._enumMax=404;
if(!gbb.addEnum) gbb.addEnum=window.addEnum;
gbb.
	addEnum(kwt).
	addEnum('__END__');

t=[
[
"_"+kw,
kw,
kwt,
[
	undefined,
	params,
	window.isTest(),
], // 0-3: [/,params]
], // 0: maxStack
[
[], // 1-0: value cache
pluginName,
paramKey_defaultMaxStack,
], // 1: default
];
}


new cfc(Scene_Boot.prototype).add('modItem1',function f(dataobj,i,arr){
	this.modItem1_maxStack.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).addBase('modItem1_maxStack',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	if(f.tbl[1] in meta) dataobj[f.tbl[0]]=meta[f.tbl[1]]-0||0;
},t[0]);

new cfc(Game_Party.prototype).add('maxItems',function f(dataobj){
	if(dataobj && (f.tbl[0] in dataobj)) return dataobj[f.tbl[0]];
	const res=this.getDefaultMaxStack();
	return (isNaN(res)?f.ori.apply(this,arguments):res)+f.tbl[3][1]._globalAdd;
},t[0]).addBase('getDefaultMaxStack',function f(){
	if(!f.tbl[0].length) f.tbl[0].push(PluginManager.parameters(f.tbl[1])[f.tbl[2]]-0);
	return f.tbl[0][0];
},t[1]);


})();
