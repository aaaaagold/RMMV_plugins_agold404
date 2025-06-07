"use strict";
/*:
 * @plugindesc add skill or item effect of a piece of js code
 * @author agold404
 * @help write
 * <effect_javascript> 
 * //#order X
 *  // your code here
 * </effect_javascript> 
 * in notes of skills or items
 * 
 * multiple <effect_javascript> are accepted. all of them will be effective.
 * one can use `//#order X` in lines to arrange the order of the effect block. the effect block is INSERT to X-th position (X starts from 0)
 *   e.g.
 *     a skill already has two effects: add state 2, add state 3.
 *     you write effect block <effect_javascript> ... </effect_javascript> in the note of this skill.
 *     you wants to make this block affect BETWEEN "add state 2" and "add state 3".
 *     so the wanted position is 1 (starting from 0)
 *     so you add `//#order 1` in this effect block like following:
 * <effect_javascript>
 * //#order 1
 *   // your code here
 * </effect_javascript>
 * 
 * `//#order X`, `<effect_javascript>`, `</effect_javascript>` must be at line start. otherwise it takes no effect.
 * multiple effect blocks <effect_javascript> ... </effect_javascript> are accepted.
 * if multiple `//#order X` appears, the FIRST is taken.
 * `//#order X` is not affected by "your code" since it is executed before "your code" is executed.
 * if `//#order X` is not appeared in effect block <effect_javascript> ... </effect_javascript>, the block is appended to the last.
 * if X in `//#order X` is not a number >= 0, nothing happens and will try next `//#order X`.
 * if X in `//#order X` is a fraction, the value is truncated to integer.
 * 
 * 
 * keyword `return` can be used in "your code" since this plugin use new Function()
 * return non-false-like value to indicate the effect failed.
 * the arguments are: target, effect. as same as original arguments of Game_Action.prototype.applyItemEffect
 * the function generated from new Function() is called via func.apply(this,arguments)
 * the argument names of generated function are from Game_Action.prototype.itemEffectJavascript_funcArgsNames
 * 
 * 
 * in short:
 * Game_Action.prototype.itemEffectJavascript=function(target,effect){
 *   const your_func=function(target,effect){
 *     // your code here
 *   };
 *   your_func.apply(this,arguments);
 * };
 * 
 * 
 * a simple example of note shown below:
 * <effect_javascript>
 * //#order 0
 * console.log(target,effect);
 * return !(1<target.hp);
 * </effect_javascript>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_ItemEffectJavascript";
const params=PluginManager.parameters(pluginName)||{};


const ga=Game_Action;
if(!ga._enumMax) ga._enumMax=404;
if(!ga.addEnum) ga.addEnum=window.addEnum;
ga.addEnum('__END__');

const kwps=['/effect_javascript',];
const kwpes=kwps.map(kw=>[kw,'EFFECT_'+kw]);
kwpes._key2content={};
kwpes.forEach((info,i,a)=>{
	if(info[0][0]==='/'){
		// is xml style
		const pure=info[0].slice(1);
		info[1]=info[1].slice(0,info[1].length-info[0].length)+pure;
		info._xmlMark=["<"+pure+">","<"+info[0]+">"];
		info[0]=pure;
	}
	ga.addEnum(info[1]);
	info.push(ga[info[1]]);
	a._key2content[info[0]]=info;
});


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
kwpes, // 3: keyNames: [ [note,EFFECT_*] , ... ]
'//#order ', // 4: order pragma
['target','effect',], // 5: func args names
{'empty':'empty js code','effectNotSet':'an effect is not set'}, // 6: warn or err msg
];


new cfc(Scene_Boot.prototype).
add('modEffect1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.itemEffectJavascript_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('itemEffectJavascript_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const effects=dataobj.effects||(dataobj.effects=[]);
	
	for(let arr=f.tbl[3],x=arr.length;x--;){
		const code=arr[x][2];
		const xmlMark=arr[x]._xmlMark;
		if(xmlMark){
			const lines=dataobj.note&&dataobj.note.split('\n');
			if(!lines) continue;
			const tmp=[],effectBlocks=[];
			for(let li=0,ls=lines.length,opened=false;li<ls;++li){
				if(opened){
					if(lines[li].slice(0,xmlMark[1].length)===xmlMark[1]){
						opened=false;
						effectBlocks.push(tmp.slice());
						tmp.length=0;
					}else tmp.push(lines[li]);
				}else{
					if(lines[li].slice(0,xmlMark[0].length)===xmlMark[0]){
						opened=true;
						if(xmlMark[0].length<lines[li].length) tmp.push(lines[li].slice(xmlMark[0].length));
					}
				}
			}
			const orderMark=f.tbl[4];
			for(let ei=0,es=effectBlocks.length;ei<es;++ei){
				const lines=effectBlocks[ei];
				let order;
				for(let li=0,ls=lines.length;li<ls;++li){
					if(lines[li].slice(0,orderMark.length)!==orderMark) continue;
					const val=lines[li].slice(orderMark.length)-0;
					if(isNaN(val)||!(val>=0)) continue;
					order=~~val;
					break;
				}
				const effect={code:code,dataId:0,value1:0,value2:0,txt:lines.join('\n'),};
				// lazy implement, TODO: performance
				if(order>=0) effects.splice(order,0,effect);
				else effects.push(effect);
			}
			continue;
		}
		const noteKey=arr[x][0];
	}
	
	return;
},t).
getP;

new cfc(ga.prototype).
addBase('itemEffectJavascript_funcArgsNames',function f(target,effect){
	return f.tbl[5].slice();
},t).
addBase('itemEffectJavascript',function f(target,effect){
	if(!effect.txt){
		if(f.tbl[2]) console.warn(f.tbl[6].empty,this.item());
		return;
	}
	if(!effect.func||!effect.func._ok){
		const args=[...this.itemEffectJavascript_funcArgsNames.apply(this,arguments)];
		args.push(effect.txt);
		(effect.func=new Function(...args))._ok=true;
	}
	if(!effect.func.apply(this,arguments)) this.makeSuccess(target);
}).
addBase('_itemEffectJavascript',function f(target,effect){
	return this.itemEffectJavascript.apply(this,arguments);
}).
getP;
ga.prototype.applyItemEffect.tbl[0].set(ga.EFFECT_effect_javascript,ga.prototype._itemEffectJavascript);


kwpes.forEach(kwpe=>{
	const func=ga.prototype.applyItemEffect.tbl[0].get(ga[kwpe[1]]);
	if(!func||func.constructor!==Function){
		throw new Error(t[6].effectNotSet+' '+kwpe[1]);
	}
});


})();
