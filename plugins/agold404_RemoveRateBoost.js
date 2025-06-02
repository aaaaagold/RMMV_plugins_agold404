"use strict";
/*:
 * @plugindesc adjust (state or buff or debuff) in-comming removal rate in a trait-available way
 * @author agold404
 * @help write
 * <removeRateBoostInState: ... >
 * <removeRateBoostInBuff: ... >
 * <removeRateBoostInDebuff: ... >
 * <removeRateBoostInStateAll: ... >
 * <removeRateBoostInBuffAll: ... >
 * <removeRateBoostInDebuffAll: ... >
 * <removeRateBoostOutState: ... >
 * <removeRateBoostOutBuff: ... >
 * <removeRateBoostOutDebuff: ... >
 * <removeRateBoostOutStateAll: ... >
 * <removeRateBoostOutBuffAll: ... >
 * <removeRateBoostOutDebuffAll: ... >
 * in note of trait-available items like: actor,class,weapon,armor,state,enemy.
 * ( in short: <removeRateBoost[In|Out][State|Buff|Debuff](All)?: ... > )
 * 
 * ... can be:
 * number: used WITH `All` suffix. apply to all.
 * JSON object: used WITHOUT `All` suffix. stateId or buffId or debuffId as keys.
 * 
 * value x means to boost (plus(+)) x*100% probability. e.g. value 0.25 means boost 25%.
 * 
 * a negtive x is allowed.
 * 
 * 
 * e.g.
 * <removeRateBoostStateAll:-1>
 * <removeRateBoostState:{"404":1}>
 * <removeRateBoostBuff:{"2",-0.25}>
 * <removeRateBoostDebuff:{"3",0.5}>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_RemoveRateBoost";
const params=PluginManager.parameters(pluginName)||{};


const gbb=Game_BattlerBase,kwp='removeRateBoost';
const kwpt='TRAIT_'+kwp;

if(!gbb._enumMax) gbb._enumMax=404;
if(!gbb.addEnum) gbb.addEnum=window.addEnum;
t=[]; t._key2content={};
for(let arr=['Buff','Debuff','State',],x=arr.length,dv=['In','Out',];x--;){
	for(let di=dv.length;di--;){
		const type=dv[di]+arr[x];
		const info=[kwp+type,kwpt+type];
		t.push(info);
		t._key2content[type]=info;
		gbb.addEnum(info[1]);
		info.push(gbb[info[1]]);
	}
}
gbb.addEnum('__END__');


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
t, // 3: keyNames: [ [note,TRAIT_*] , ... ]
'all', // 4: special dataId
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.removeRateBoost_evalSetting(dataobj,i,arr);
	return rtv;
}).
addBase('removeRateBoost_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	for(let arr=f.tbl[3],x=arr.length;x--;){
		const noteKey=arr[x][0];
		const traitCode=arr[x][2];
		if(meta[noteKey]){
			const data=JSON.parse(meta[noteKey]);
			for(let k in data){
				traits.push({code:traitCode,dataId:k-0,value:data[k],});
			}
		}
		if(meta[noteKey+'All']){
			const data=JSON.parse(meta[noteKey+'All']);
			traits.push({code:traitCode,dataId:f.tbl[4],value:data,});
		}
	}
},t).
getP;

new cfc(Game_BattlerBase.prototype).
addBase('removeRateBoost_getBuffIn',function f(type){
	return this.traitsSum(f.tbl[3]._key2content.InBuff[2],type);
},t).
addBase('removeRateBoost_getDebuffIn',function f(type){
	return this.traitsSum(f.tbl[3]._key2content.InDebuff[2],type);
},t).
addBase('removeRateBoost_getStateIn',function f(type){
	return this.traitsSum(f.tbl[3]._key2content.InState[2],type);
},t).
addBase('removeRateBoost_getBuffOut',function f(type){
	return this.traitsSum(f.tbl[3]._key2content.OutBuff[2],type);
},t).
addBase('removeRateBoost_getDebuffOut',function f(type){
	return this.traitsSum(f.tbl[3]._key2content.OutDebuff[2],type);
},t).
addBase('removeRateBoost_getStateOut',function f(type){
	return this.traitsSum(f.tbl[3]._key2content.OutState[2],type);
},t).
getP;

new cfc(Game_Action.prototype).
add('itemEffectRemoveBuff_calChance',function f(target,effect){
	let rtv=f.ori.apply(this,arguments);
	rtv+=target.removeRateBoost_getBuffIn(f.tbl[4]);
	rtv+=target.removeRateBoost_getBuffIn(effect.dataId);
	const s=this.subject();
	rtv+=s.removeRateBoost_getBuffOut(f.tbl[4]);
	rtv+=s.removeRateBoost_getBuffOut(effect.dataId);
	return rtv;
},t).
add('itemEffectRemoveDebuff_calChance',function f(target,effect){
	let rtv=f.ori.apply(this,arguments);
	rtv+=target.removeRateBoost_getDebuffIn(f.tbl[4]);
	rtv+=target.removeRateBoost_getDebuffIn(effect.dataId);
	const s=this.subject();
	rtv+=s.removeRateBoost_getDebuffOut(f.tbl[4]);
	rtv+=s.removeRateBoost_getDebuffOut(effect.dataId);
	return rtv;
},t).
add('itemEffectRemoveState_calChance',function f(target,effect){
	let rtv=f.ori.apply(this,arguments);
	rtv+=target.removeRateBoost_getStateIn(f.tbl[4]);
	rtv+=target.removeRateBoost_getStateIn(effect.dataId);
	const s=this.subject();
	rtv+=s.removeRateBoost_getStateOut(f.tbl[4]);
	rtv+=s.removeRateBoost_getStateOut(effect.dataId);
	return rtv;
},t).
getP;


})();
