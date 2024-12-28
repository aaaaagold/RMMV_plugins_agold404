"use strict";
/*:
 * @plugindesc a trait for eval() per frame
 * @author agold404
 * 
 * @help usage:
 * in note for things with traits
 * 
 * <perFrameEval_map>
 * ...
 * </perFrameEval_map>
 * 
 * <perFrameEval_battle>
 * ...
 * </perFrameEval_battle>
 * 
 * <perFrameEval_all>
 * ...
 * </perFrameEval_all>
 * 
 * 'this' for the battler.
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_NameField";
const params=PluginManager.parameters(pluginName);

const gbb=Game_BattlerBase,kw='perFrameEval';
const kwt='TRAIT_'+kw;

if(!gbb._enumMax) gbb._enumMax=404;
if(!gbb.addEnum) gbb.addEnum=window.addEnum;
gbb.
	addEnum(kwt).
	addEnum('__END__',true);


new cfc(Scene_Boot.prototype).add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.traitPerFrameEval(dataobj,i,arr);
	return rtv;
}).addBase('traitPerFrameEval',function f(dataobj,i,arr){
	if(!dataobj||!dataobj.traits||!dataobj.note) return;
	const ts=dataobj.traits,xs=dataobj.note.length,pl=f.tbl[0][0].length;
	for(let x=0;x<xs;){
		const idx=dataobj.note.indexOf(f.tbl[0][0],x); if(!(idx>=0)) break;
		const strt=x=idx+pl;
		const m=dataobj.note.slice(strt).match(f.tbl[0][1]); if(!m) continue;
		const endText=f.tbl[0][2]+m[0];
		const endTextPos=dataobj.note.indexOf(endText,strt);
		if(!(endTextPos>=0)) throw new Error(f.tbl[1]+"\n tag = "+endText+"\n id = "+dataobj.id+"\n\n==== full note ====\n"+dataobj.note+"\n");
		x=endTextPos+endText.length;
		const evalText=dataobj.note.slice(strt+m[0].length,endTextPos);
		this._traitPerFrameEval_addText(dataobj,m,evalText);
	}
},[
["<"+kw,/^_(map|battle|all)\>/,"</"+kw,], // 0: 
"tag not closure.", // 1: err msg
]).addBase('_traitPerFrameEval_addText',function f(dataobj,m,text){
	const ts=dataobj.traits;
	if(m[1]==='all'||m[1]==='map')    ts.push({code:f.tbl[0],dataId:'map',    value:text,});
	if(m[1]==='all'||m[1]==='battle') ts.push({code:f.tbl[0],dataId:'battle', value:text,});
},t=[
gbb[kwt], // 0: code
function(trait){ EVAL.call(this,trait.value); }, // 1: eval
]);

k='update_traitPerFrameEval';
new cfc(Scene_Base.prototype).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_traitPerFrameEval();
	return rtv;
}).addBase(k,none);
new cfc(Scene_Map.prototype).addBase(k,function f(){
	const members=$gameParty.members();
	for(let x=0,xs=members.length;x!==xs;++x){
		const btlr=members[x];
		btlr.traitsWithId(f.tbl[0],'map').forEach(f.tbl[1].bind(btlr));
	}
},t);
new cfc(Scene_Battle.prototype).addBase(k,function f(){
	const members=BattleManager.allBattleMembers();
	for(let x=0,xs=members.length;x!==xs;++x){
		const btlr=members[x];
		btlr.traitsWithId(f.tbl[0],'battle').forEach(f.tbl[1].bind(btlr));
	}
},t);


})();
