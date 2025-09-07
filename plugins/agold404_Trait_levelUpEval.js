"use strict";
/*:
 * @plugindesc make number of save files be infinity
 * @author agold404
 * 
 * 
 * @param GlobalEvalBefore
 * @type note
 * @text globally eval, before actor levelUp eval
 * @desc enter valid js code here
 * @default ""
 * 
 * 
 * @param GlobalEvalAfter
 * @type note
 * @text globally eval, after actor levelUp eval
 * @desc enter valid js code here
 * @default ""
 * 
 * 
 * @help <levelUpEval>
 * ...
 * </levelUpEval>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Trait_levelUpEval";
const params=PluginManager.parameters(pluginName)||{};
params._globalEvalBefore=JSON.parse(params.GlobalEvalAfter||"\"\"");
params._globalEvalAfter=JSON.parse(params.GlobalEvalAfter||"\"\"");


const gbb=Game_BattlerBase;
const kwps=['/levelUpEval',];
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
kwpts, // 3: keyNames: [ [note,TRAIT_*,dataCode,[immDataCode,immTRAIT_*]] , ... ]
/[\t\n\r ]+/g,
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.levelUpEval_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('levelUpEval_evalSetting',function f(dataobj,i,arr){
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
				const trait={code:dataCode,dataId:0,value:lines.join('\n'),};
				if(trait.value.replace(f.tbl[4],'')) traits.push(trait);
			}
			continue;
		}
		const noteKey=arr[x][0];
	}
	
	return;
},t).
getP;

new cfc(Game_Actor.prototype).
add('levelUp',function f(){
	this.levelUpEval_before.apply(this,arguments);
	const rtv=f.ori.apply(this,arguments);
	this.levelUpEval_actor.apply(this,arguments);
	this.levelUpEval_after.apply(this,arguments);
	return rtv;
}).
addBase('levelUpEval_before',function f(){
	EVAL.call(this,f.tbl[1]._globalEvalBefore);
},t).
addBase('levelUpEval_actor',function f(){
	const traits=this._traitsWithId(f.tbl[3]._key2content.levelUpEval[2],0);
	for(let x=traits.length;x--;){
		EVAL.call(this,traits[x].value);
	}
},t).
addBase('levelUpEval_after',function f(){
	EVAL.call(this,f.tbl[1]._globalEvalAfter);
},t).
getP;


})();
