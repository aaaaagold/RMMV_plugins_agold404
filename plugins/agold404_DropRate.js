"use strict";
/*:
 * @plugindesc adjust drop rate in a trait-available way
 * @author agold404
 * @help write
 * <dropRateAdd: ... > 
 * <partyGainDropRateAdd: ... > 
 * <dropRateMul: ... > 
 * <partyGainDropRateMul: ... > 
 * in note of trait-available items like: actor,class,weapon,armor,state,enemy.
 * 
 * <dropRateAdd: ... > 
 * <dropRateMul: ... > 
 * modify one's drop rate. only effect on enemies.
 * 
 * <partyGainDropRateAdd: ... > 
 * <partyGainDropRateMul: ... > 
 * modify whole enemies drop rate against player's party.
 * 
 * ... can be:
 * number: a constant modifier to drop rate.
 *         add or multiply depending on note suffix.
 * string: use js `eval()` to evaluate the value of modifier to drop rate.
 *         add or multiply depending on note suffix.
 * 
 * calculation:
 * multiply first, and then add.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_DropRate";
const params=PluginManager.parameters(pluginName)||{};


const gbb=Game_BattlerBase;
if(!gbb._enumMax) gbb._enumMax=404;
if(!gbb.addEnum) gbb.addEnum=window.addEnum;
gbb.addEnum('__END__');

const kwps=['dropRate','partyGainDropRate',];
const kwpts=kwps.map(kw=>[kw,'TRAIT_'+kw]);
kwpts._key2content={};
kwpts.forEach((info,i,a)=>{
	gbb.addEnum(info[1]);
	info.push(gbb[info[1]]);
	a._key2content[info[0]]=info;
});


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
kwpts, // 3: keyNames: [ [note,TRAIT_*] , ... ]
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.dropRate_evalSetting(dataobj,i,arr);
	return rtv;
}).
addBase('dropRate_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	let hasData=false;
	for(let arr=f.tbl[3],x=arr.length;x--;){
		const noteKey=arr[x][0];
		const traitCode=arr[x][2];
		if(meta[noteKey+'Add']){
			hasData=true;
			const data=JSON.parse(meta[noteKey+'Add']);
			traits.push({code:traitCode,dataId:0,value:data-0||0,});
		}
		if(meta[noteKey+'Mul']){
			hasData=true;
			const data=JSON.parse(meta[noteKey+'Mul'])-0;
			if(!isNaN(data)) traits.push({code:traitCode,dataId:1,value:data,});
		}
	}
	if(hasData&&arr===$dataStates) meta.keepWhenDead=true;
},t).
getP;

new cfc(Game_BattlerBase.prototype).
addBase('dropRate_getSelf',function f(isMultiply){
	const code=f.tbl[3]._key2content.dropRate[2];
	return isMultiply?this.traitsPi(code,1):this.traitsSum(code,0);
},t).
addBase('dropRate_getPartyGain',function f(isMultiply){
	const code=f.tbl[3]._key2content.partyGainDropRate[2];
	return isMultiply?this.traitsPi(code,1):this.traitsSum(code,0);
},t).
getP;

new cfc(Game_Unit.prototype).
addBase('dropRate_getPartyGain',function f(isMultiply){
	return isMultiply?this.members().reduce(f.tbl[1],1):this.members().reduce(f.tbl[0],0);
},[
(r,n)=>r+n.dropRate_getPartyGain(false), // add
(r,n)=>r*n.dropRate_getPartyGain(true), // mul
]).
getP;

new cfc(Game_Enemy.prototype).
add('dropItemRate',function f(){
	let rtv=f.ori.apply(this,arguments);
	rtv*=this.dropRate_getSelf(true);
	rtv*=this.opponentsUnit().dropRate_getPartyGain(true);
	rtv+=this.dropRate_getSelf(false);
	rtv+=this.opponentsUnit().dropRate_getPartyGain(false);
	return rtv;
},t).
getP;


})();
