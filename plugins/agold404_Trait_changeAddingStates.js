"use strict";
/*:
 * @plugindesc traits that change states on addState
 * @author agold404
 * 
 * 
 * @param MaxChangesDepthGetter
 * @type note
 * @text max changes depth getter
 * @desc input a valid function
 * @default "(function(){\n  return 44;\n})\n"
 * 
 * 
 * @help write note in trait-available things
 * 
 * 
 * to change add state effect
 * 
<changeAddingStates>
({

stateId_on_addState:{
 "del":[ stateId , ... ],
 "add":[ stateId , ... ],
},

// ...

})
</changeAddingStates>
 * 
 * or to change erase state effect
 * 
<changeErasingStates>
({

stateId_on_addState:{
 "del":[ stateId , ... ],
 "add":[ stateId , ... ],
},

// ...

})
</changeErasingStates>
 * 
 * 
 * parse via `eval()` at the starting (start running) of the game
 * 
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Trait_changeAddingStates";
const params=PluginManager.parameters(pluginName)||{};
params._maxChangesDepthGetter=EVAL.call(null,JSON.parse(useDefaultIfIsNone(params.MaxChangesDepthGetter,"\"function(){\\n  return 44;\\n}\\n\"")));
if(!(params._maxChangesDepthGetter instanceof Function)) params._maxChangesDepthGetter=()=>0;


const gbb=Game_BattlerBase;
const kwps=[
'/changeAddingStates',
'/changeErasingStates',
];
const kwpts=kwps.map(kw=>[kw,'TRAIT_'+kw]);
kwpts._key2content={};
kwpts.forEach((info,i,a)=>{
	if(info[0][0]==='/'){
		// is xml style
		const pure=info[0].slice(1);
		info[1]=info[1].slice(0,info[1].length-info[0].length)+pure;
		info._xmlMark=["<"+pure+">","<"+info[0]+">"];
		info[0]=pure;
	}
	gbb.addEnum(info[1]);
	info.push(gbb[info[1]]); // [2]
	if(info._xmlMark){
		const immKey=info[1]+'-immutable'; // i.e. always being evaluated to the same result
		gbb.addEnum(immKey);
		info.push([gbb[immKey],immKey]);
	}else info.push(undefined);
	a._key2content[info[0]]=info;
});


t=[
undefined,
params,
window.isTest(),
kwpts, // 3: keyNames: [ [metaTag_pure,TRAIT_*,dataCode,[immDataCode,immTRAIT_*]] , ... ]
[
'['+pluginName+']', // 4-0: msg prefix tag
], // 4: err msgs
'kvc', // 5: traitsCacheOp
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.changeAddingStates_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('changeAddingStates_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	
	for(let arr=f.tbl[3],x=arr.length;x--;){
		const metaTag=arr[x][0];
		const dataCode=arr[x][2];
		const immInfo=arr[x][3];
		const settingAll=meta[metaTag];
		if(settingAll==null) continue;
		
		const ctrs=new Map();
		if(settingAll.forEach){ settingAll.forEach(settingRaw=>{ const setting=EVAL.call(null,settingRaw);
		for(let k in setting){
			const stateObj=$dataStates[k];
			if(!stateObj&&f.tbl[2]) console.warn(f.tbl[4][0],'detecting non-existing state',k,'at','[',i,']','of',dataobj,);
			const stateId=stateObj?stateObj.id:k;
			
			const ctr=ctrs.get(stateId)||new Map();
			ctrs.set(stateId,ctr);
			const info=setting[k];
			for(let arr=info.add,x=arr&&arr.length;x--;){
				const stateObj=$dataStates[arr[x]];
				if(!stateObj&&f.tbl[2]) console.warn(f.tbl[4][0],'adding non-existing state',arr[x],'at','[',i,']','of',dataobj,);
				const stateId=stateObj?stateObj.id:arr[x];
				const newC=(ctr.get(stateId)||0n)+1n;
				if(newC) ctr.set(stateId,newC);
				else ctr.delete(stateId);
			}
			for(let arr=info.del,x=arr&&arr.length;x--;){
				const stateObj=$dataStates[arr[x]];
				if(!stateObj&&f.tbl[2]) console.warn(f.tbl[4][0],'deleting non-existing state',arr[x],'at','[',i,']','of',dataobj,);
				const stateId=stateObj?stateObj.id:arr[x];
				const newC=(ctr.get(stateId)||0n)-1n;
				if(newC) ctr.set(stateId,newC);
				else ctr.delete(stateId);
			}
		}
		}); ctrs.forEach((v,k)=>{ traits.push({code:dataCode,dataId:k,value:v,}); }); }
	}
},t).
getP;

new cfc(Game_Battler.prototype).
addBase('changeAddingStates_isExecuting_set',function f(val){
	return this._changeAddingStates_isExecuting=1^!val;
}).
addBase('changeAddingStates_isExecuting_get',function f(){
	return !!this._changeAddingStates_isExecuting;
}).
addRoof('addState',function f(stateId){
	if(this.changeAddingStates_isExecuting_get()) return f.ori.apply(this,arguments);
	this.changeAddingStates_isExecuting_set(true);
	const rtv=this.changeAddingStates_onAddState.apply(this,arguments);
	this.changeAddingStates_isExecuting_set(false);
	return rtv;
}).
addBase('_changeAddingStates_onAddState_getInfo',function f(stateId){
	const code=f.tbl[3]._key2content.changeAddingStates[2];
	const dataId=stateId;
	if(!this.traitsOpCache_hasUsedOp(code,dataId,f.tbl[5])){
		this.traitsOpCache_addUsedOp(code,dataId,f.tbl[5]);
		const traits=this._traitsWithId(code,dataId);
		for(let x=traits.length;x--;){
			this.traitsOpCache_updateVal_kvc_add(traits[x]);
		}
	}
	return this.traitsOpCache_getCacheVal_kvc(code,dataId);
},t).
addBase('changeAddingStates_onAddState',function f(stateId){
	const arg0=arguments[0];
	arguments[0]=[stateId,1n,];
	const rtv=this._changeAddingStates_onChangeState.apply(this,arguments);
	arguments[0]=arg0;
	return rtv;
}).
addRoof('eraseState',function f(stateId){
	if(this.changeAddingStates_isExecuting_get()) return f.ori.apply(this,arguments);
	this.changeAddingStates_isExecuting_set(true);
	const rtv=this.changeAddingStates_onEraseState.apply(this,arguments);
	this.changeAddingStates_isExecuting_set(false);
	return rtv;
}).
addBase('_changeAddingStates_onEraseState_getInfo',function f(stateId){
	const code=f.tbl[3]._key2content.changeErasingStates[2];
	const dataId=stateId;
	if(!this.traitsOpCache_hasUsedOp(code,dataId,f.tbl[5])){
		this.traitsOpCache_addUsedOp(code,dataId,f.tbl[5]);
		const traits=this._traitsWithId(code,dataId);
		for(let x=traits.length;x--;){
			this.traitsOpCache_updateVal_kvc_add(traits[x]);
		}
	}
	return this.traitsOpCache_getCacheVal_kvc(code,dataId);
},t).
addBase('changeAddingStates_onEraseState',function f(stateId){
	const arg0=arguments[0];
	arguments[0]=[stateId,-1n,];
	const rtv=this._changeAddingStates_onChangeState.apply(this,arguments);
	arguments[0]=arg0;
	return rtv;
}).
addBase('_changeAddingStates_onChangeState',function f(stateIdInfo){
	if(!stateIdInfo) return;
	let lastStateIds=[]; lastStateIds.kvPush(stateIdInfo[0],stateIdInfo[1]);
	let nextStateIds=[];
	const directly=[];
	const maxDepth=Math.max(useDefaultIfIsNaN(f.tbl[1]._maxChangesDepthGetter.call(this),0),0);
	for(let d=maxDepth;d-->=0;){
		directly.length=0;
		const stateIds=[]; for(let x=0,xs=lastStateIds.length;x<xs;++x) stateIds.push(lastStateIds.kvGetKeyByIdx(x)); stateIds.sort(DataManager.arrSortFunc_mostImportantStateAtFirst);
		nextStateIds.kvClear();
		for(let x=0,xs=stateIds.length;x<xs;++x){
			const stateId=stateIds[x];
			const cnt=lastStateIds.kvGetVal(stateId);
			if(!cnt) continue;
			const cntA=cnt<0n?-cnt:cnt;
			const info=cnt<0n?this._changeAddingStates_onEraseState_getInfo(stateId):this._changeAddingStates_onAddState_getInfo(stateId);
			if(!info){
				if(cnt) directly.push([cnt,stateId,]);
				continue;
			}
			info.forEach((v,k)=>nextStateIds.kvPush(k,(nextStateIds.kvGetVal(k)||0n)+v*cntA));
		}
		for(let x=0,xs=directly.length;x<xs;++x){
			arguments[0]=directly[x][1];
			if(directly[x][0]<0n) for(let _=-directly[x][0];_--;) this.eraseState.apply(this,arguments);
			else for(let _=directly[x][0];_--;) this.addState.apply(this,arguments);
		}
		{ const tmp=lastStateIds; lastStateIds=nextStateIds; nextStateIds=tmp; }
	}
},t).
getP;


})();

