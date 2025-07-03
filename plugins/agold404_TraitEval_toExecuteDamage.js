"use strict";
/*:
 * @plugindesc add what to do right before executeDamage, executeHpDamage, executeMpDamage
 * @author agold404
 * @help write
 * <traitEval_toExecuteDamage> 
 * //#order X
 *  // your code here
 * </traitEval_toExecuteDamage> 
 * in notes of trait-available objects. e.g. actor, class, weapon, armor, state, enemy.
 * 
 * <traitEval_toExecuteDamage> ... </traitEval_toExecuteDamage> 
 * can also be
 * <traitEval_toExecuteHpDamage> ... </traitEval_toExecuteHpDamage> or <traitEval_toExecuteMpDamage> ... </traitEval_toExecuteMpDamage> 
 * 
 * <traitEval_toExecuteDamage> ... </traitEval_toExecuteDamage> , <traitEval_toExecuteHpDamage> ... </traitEval_toExecuteHpDamage> , <traitEval_toExecuteMpDamage> ... </traitEval_toExecuteMpDamage> 
 * are called BLOCKs
 * 
 * multiple BLOCKs are accepted. all of them will be effective.
 * one can use `//#order X` in lines to arrange the order of the BLOCKs. two BLOCKs have relative order by the order.
 * the execution order will not be guaranteed with the same order.
 * without this order, it is supposed to be the last.
 * <traitEval_toExecuteDamage> 
 * //#order 1
 *   // your code here
 * </traitEval_toExecuteDamage> 
 * 
 * `//#order X`, `<traitEval_toExecuteDamage>`, `</traitEval_toExecuteDamage> `, `<traitEval_toExecuteHpDamage>`, `</traitEval_toExecuteHpDamage> `, `<traitEval_toExecuteMpDamage>`, `</traitEval_toExecuteMpDamage> `
 * must be at line start. otherwise it takes no effect.
 * if multiple `//#order X` appears, the FIRST is taken.
 * `//#order X` is not affected by "your code" since it is executed before "your code" is executed.
 * if `//#order X` is not appeared in a BLOCK, the BLOCK is appended to the last.
 * if X in `//#order X` is not a number >= 0, nothing happens and will try next `//#order X`.
 * if X in `//#order X` is a fraction, the value is truncated to integer.
 * 
 * 
 * a simple example of note shown below:
 * <traitEval_toExecuteDamage> 
 * //#order 0
 * console.log(target,value);
 * </traitEval_toExecuteDamage> 
 * 
 * 
 * ==== ==== ==== ==== ==== ==== ==== ==== 
 * 
 * 
 * Also there're another <traitEval_gotExecuteDamage> ... </traitEval_gotExecuteDamage> sets which means it is the target to modify the value.
 * They are executed AFTER <traitEval_toExecuteDamage> ... </traitEval_toExecuteDamage> sets.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_TraitEval_toExecuteDamage";
const params=PluginManager.parameters(pluginName)||{};


const gbb=Game_BattlerBase;
if(!gbb._enumMax) gbb._enumMax=404;
if(!gbb.addEnum) gbb.addEnum=window.addEnum;
gbb.addEnum('__END__');

const kwps=[
'/traitEval_toExecuteDamage'  , '/traitEval_toExecuteHpDamage'  , '/traitEval_toExecuteMpDamage'  , 
'/traitEval_gotExecuteDamage' , '/traitEval_gotExecuteHpDamage' , '/traitEval_gotExecuteMpDamage' , 
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
	info.push(gbb[info[1]]);
	a._key2content[info[0]]=info;
});


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
kwpts, // 3: keyNames: [ [note,TRAIT_*] , ... ]
'//#order ', // 4: order pragma // not used. refer to getXmlLikeStyleContent
{
start:kwpts[0][1],
hp:kwpts[1][1],
mp:kwpts[2][1],
start_got:kwpts[3][1],
hp_got:kwpts[4][1],
mp_got:kwpts[5][1],
}, // 5: type2traitKey
function(collects,i,a){
	if(collects) for(let x=0,xs=collects.length;x<xs;++x) this.push(collects[x].txt);
}, // 6: forEach orderedByOrder traits
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.traitEvalToExecuteDamage_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('traitEvalToExecuteDamage_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	
	for(let arr=f.tbl[3],x=arr.length;x--;){
		const dataCode=arr[x][2];
		const xmlMark=arr[x]._xmlMark;
		if(xmlMark){
			const codes=window.getXmlLikeStyleContent(dataobj.note,xmlMark,true,true);
			for(let ci=0,cs=codes.length;ci<cs;++ci){
				const lines=codes[ci];
				const order=lines._orderMarkOrder;
				const trait={code:dataCode,dataId:0,value:order,txt:lines.join('\n'),};
				traits.push(trait);
			}
			continue;
		}
		const noteKey=arr[x][0];
	}
	
	return;
},t).
getP;

new cfc(gbb.prototype).
addBase('traitEvalToExecuteDamage_getCodes',function f(type){
	const traitCode=gbb[f.tbl[5][type]];
	const allTraits=this.traits(traitCode);
	const rtv=[],tmp=[];
	for(let x=0,xs=allTraits.length;x<xs;++x){
		const trait=allTraits[x];
		const order=trait.value;
		if(order>=0){
			if(!tmp[order]) tmp[order]=[];
			tmp[order].push(trait);
		}else rtv.push(trait);
	}
	tmp.push(rtv.slice());
	rtv.length=0;
	tmp.forEach(f.tbl[6],rtv);
	return rtv;
},t).
getP;

new cfc(Game_Action.prototype).
addBase('_traitEvalToExecuteDamage_apply',function f(args){
	let target=args[0];
	let value=args[1];
	const btlr=this._traitEvalToExecuteDamage_tmp_type&&this._traitEvalToExecuteDamage_tmp_type.slice(-4)==='_got'?target:this.subject();
	const codes=btlr.traitEvalToExecuteDamage_getCodes(this._traitEvalToExecuteDamage_tmp_type);
	for(let ci=0,cs=codes.length,f;ci<cs;++ci){ const code=codes[ci]; { let ci,cs,codes,args; {
		eval(code);
	} } }
	args[0]=target;
	args[1]=value;
}).
addBase('traitEvalToExecuteDamage_applyStart',function f(args){
	this._traitEvalToExecuteDamage_tmp_type='start';
	this._traitEvalToExecuteDamage_apply(args);
	this._traitEvalToExecuteDamage_tmp_type='start_got';
	this._traitEvalToExecuteDamage_apply(args);
	this._traitEvalToExecuteDamage_tmp_type=undefined;
}).
addBase('traitEvalToExecuteDamage_applyHp',function f(args){
	this._traitEvalToExecuteDamage_tmp_type='hp';
	this._traitEvalToExecuteDamage_apply(args);
	this._traitEvalToExecuteDamage_tmp_type='hp_got';
	this._traitEvalToExecuteDamage_apply(args);
	this._traitEvalToExecuteDamage_tmp_type=undefined;
}).
addBase('traitEvalToExecuteDamage_applyMp',function f(args){
	this._traitEvalToExecuteDamage_tmp_type='mp';
	this._traitEvalToExecuteDamage_apply(args);
	this._traitEvalToExecuteDamage_tmp_type='mp_got';
	this._traitEvalToExecuteDamage_apply(args);
	this._traitEvalToExecuteDamage_tmp_type=undefined;
}).
add('executeDamage',function f(target,value){
	this.traitEvalToExecuteDamage_applyStart(arguments);
	return f.ori.apply(this,arguments);
}).
add('executeHpDamage',function f(target,value){
	this.traitEvalToExecuteDamage_applyHp(arguments);
	return f.ori.apply(this,arguments);
}).
add('executeMpDamage',function f(target,value){
	this.traitEvalToExecuteDamage_applyMp(arguments);
	return f.ori.apply(this,arguments);
}).
getP;


})();
