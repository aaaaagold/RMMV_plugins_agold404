"use strict";
/*:
 * @plugindesc specifying a state can be stacked multiple times
 * @author agold404
 * @help fractions of resulting numbers are rounded toward 0 to integer. the minimum final calculation result is 0.
 * 
 * 
 * in notes of states:
 * 
 * <initStackTimesAdd:a_number_here>
 * 
 * this value do NOT accumulate due to multiple same states.
 * 
 * 
 * in notes of things with TRAITs available:
 * 
 * <changeStatesStackTimesAdd>
 * JSON_FORMAT_HERE
 * </changeStatesStackTimesAdd>
 * 
 * JSON_FORMAT_HERE: (key,value) = (stateId , stack times change)
 * 
 * 
 * 
 * a simple example of note shown below:
 * 
 * <changeStatesStackTimesAdd>
 * {"4":1,"5":-2}
 * </changeStatesStackTimesAdd>
 * 
 * this increase state 4 to be stacked MORE 1 time, and state 5 to be stacked LESS 2 times.
 * 
 * 
 * 
 * also, use `global change stacked times` to make EVERY states to be stacked more or less.
 * 
 * 
 * @param GlobalChanges
 * @type note
 * @text global change stacked times
 * @desc input a valid json
 * @default "0"
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Trait_statesStackTimes";
const params=PluginManager.parameters(pluginName)||{};
params._globalChanges=JSON.parse(params.GlobalChanges||"0");


const gbb=Game_BattlerBase;
const kwps=['/changeStatesStackTimesAdd',];
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
params, // 1: plugin params
window.isTest(), // 2: isTest
kwpts, // 3: keyNames: [ [note,TRAIT_*,dataCode,[immDataCode,immTRAIT_*]] , ... ]
null,
'string',
key=>(key!==~~key), // 6: is invalid JSON key
'initStackTimesAdd', // 7: static self meta key
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.traitMultiStates_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('traitMultiStates_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	
	for(let arr=f.tbl[3],x=arr.length;x--;){
		const dataCode=arr[x][2];
		const immInfo=arr[x][3];
		const xmlMark=arr[x]._xmlMark;
		if(xmlMark){
			const codes=window.getXmlLikeStyleContent(dataobj.note,xmlMark);
			for(let ci=0,cs=codes.length,tmp;ci<cs;++ci){
				const lines=codes[ci];
				const info=JSON.parse(lines.join('\n'));
				for(let k in info){
					tmp=k-0;
					if(f.tbl[6](tmp)) continue;
					const stateId=~~tmp;
					
					const delta=info[k];
					let trait;
					if(!immInfo||(typeof delta)==='string'){
						trait={code:dataCode,dataId:stateId,value:delta,};
					}else{
						trait={code:immInfo[0],dataId:stateId,value:delta-0||0,};
					}
					if(trait.value) traits.push(trait);	
				}
			}
			continue;
		}
		const noteKey=arr[x][0];
	}
	
	return;
},t).
getP;


new cfc(gbb.prototype).
addBase('traitMultiStates_getMaxStackTimes',function f(stateId){
	let rtv=this.traitsSum(f.tbl[3]._key2content.changeStatesStackTimesAdd[3][0],stateId);
	const arr=this.traitsWithId(f.tbl[3]._key2content.changeStatesStackTimesAdd[2],stateId);
	for(let x=0,xs=arr.length;x<xs;++x) rtv+=EVAL.call(this,arr[x].value)-0||0;
	rtv+=EVAL.call(this,f.tbl[1]._globalChanges[stateId])-0||0;
	{
		const dataobj=$dataStates[stateId];
		const meta=dataobj&&dataobj.meta;
		if(meta) rtv+=meta[f.tbl[7]]-0||0;
	}
	return 1+~~rtv;
},t).
getP;

new cfc(Game_Battler.prototype).
addBase('addNewState_condOk',function f(stateId){
	return this.traitMultiStates_getMaxStackTimes(stateId)>=this.statesContainer_cntStateId(stateId)+1;
}).
getP;

new cfc(Game_BattlerBase.prototype).
add('eraseState',function f(stateId){
	const rtv=f.ori.apply(this,arguments);
	if(0<this.statesContainer_cntStateId(stateId)) this.resetStateCounts(stateId);
	return rtv;
}).
getP;


new cfc(Window_Base.prototype).
add('drawStateIcon_drawMoreInfos_contents',function f(actor,stateId,x,y){
	const rtv=f.ori.apply(this,arguments);
	const fontSize=this.currentFontSize();
	const lineHeight=this.lineHeight();
	const padding=this.drawActorIcons_drawMoreInfos_padding.apply(this,arguments);
	this.drawText('x'+actor.statesContainer_cntStateId(stateId),
		x+padding,
		y+padding-((lineHeight-fontSize)>>1),
		Window_Base._iconWidth-(padding<<1),'right',
	);
	return rtv;
}).
getP;

new cfc(Sprite_StateIcon.prototype).
add('updateIcon_updateByInfos_state',function f(type,iconIndex,turns,stacks){
	const rtv=f.ori.apply(this,arguments);
	this._iconStacks=stacks;
	return rtv;
}).
getP;


})();
