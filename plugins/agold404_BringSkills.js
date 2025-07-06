"use strict";
/*:
 * @plugindesc make an actor only be able to use skills that are brought
 * @author agold404
 * @help providing a global default value and a trait to adjust brought amount.
 * the final amount will not less than 0 and is truncated to an integer.
 * write the following in a note of an item with traits option.
 * <bringSkillsAmount:a_number_here>
 * 
 * 
 * @param GlobalChanges
 * @type text
 * @text Globally change amount of brought skills
 * @desc a NaN value will be seen as Infinity.
 * @default Infinity
 * 
 * @param BroughtSkillTextOpt
 * @type note
 * @text option text
 * @desc used for eval()
 * @default "DataManager.getLocale()==='zh-TW'?\"攜帶技能\":\"Brought Skills\""
 * 
 * @param BroughtSkillTextCap
 * @type note
 * @text capcaity hint text
 * @desc used for eval(). vars: current,total
 * @default "let rtv=\"\";\nif(total<current+1) rtv+=\"\\\\C[10]\";\nif(Window_Base.prototype.processEscapeCharacter_textPosition) rtv+=\" \\\\TXTRIGHT:\"+JSON.stringify(current+' / '+total);\nelse rtv+=current+' / '+total;\nrtv;"
 * 
 * @param BroughtSkillTextSwitchType
 * @type note
 * @text hint text for switch types in BroughtSkill
 * @desc used for eval()
 * @default "DataManager.getLocale()==='zh-TW'?\"按 shift 或點擊右方的 \\\"ALL\\\" 來切換技能類別\":\"press shift or tap text \\\"ALL\\\" on the right to change skill type\""
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Trait_adjustEquipSlots";
const params=PluginManager.parameters(pluginName)||{};
params._globalChanges=params.GlobalChanges-0; if(isNaN(params._globalChanges)) params._globalChanges=Infinity;
params._broughtSkillTextOpt=JSON.parse(params.BroughtSkillTextOpt||"\"\\\"Brought Skills\\\"\"");
params._broughtSkillTextCap=JSON.parse(params.BroughtSkillTextCap||"\"{ let rtv=\\\"\\\";\\nif(total<current+1) rtv+=\\\"\\\\\\\\C[10]\\\";\\nif(Window_Base.prototype.processEscapeCharacter_textPosition) rtv+=\\\" \\\\\\\\TXTRIGHT:\\\"+JSON.stringify(current+' / '+total);\\nelse rtv+=current+' / '+total;\\nrtv; }\"");
params._broughtSkillTextSwitchType=JSON.parse(params.BroughtSkillTextSwitchType||"\"DataManager.getLocale()==='zh-TW'?\\\"按 shift 或點擊右方的 \\\\\\\"ALL\\\\\\\" 來切換技能類別\\\":\\\"press shift or tap text \\\\\\\"ALL\\\\\\\" on the right to change skill type\\\"\"");


const gbb=Game_BattlerBase;
const kwps=['bringSkillsAmount',];
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
none, // 6: this arr's sep.
[
[params._broughtSkillTextOpt,'bringSkills',true,"ext-BringSkills"],
], // 7: default itemListPrefix
function(prefixItem){ const tmp=prefixItem.slice(); tmp[0]=EVAL.call(this,tmp[0]); this.addCommand.apply(this,tmp); }, // 8: forEach this.addCommand
()=>1, // 9: maxCols for Window_BringSkills_commonItems
new Function("current","total","_s","{ return eval(_s); }"), // 10: func
"ALL", // 11: default allItems type
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.bringSkills_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('bringSkills_evalSetting',function f(dataobj,i,arr){
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
					const equipTypeId=~~tmp;
					
					const delta=info[k];
					let trait;
					if(!immInfo||(typeof delta)==='string'){
						trait={code:dataCode,dataId:equipTypeId,value:delta,};
					}else{
						trait={code:immInfo[0],dataId:equipTypeId,value:delta-0||0,};
					}
					if(trait.value) traits.push(trait);	
				}
			}
			continue;
		}
		
		const noteKey=arr[x][0];
		const metaInfo=meta[noteKey];
		
		const val=metaInfo-0;
		if(!val) continue;
		traits.push({code:dataCode,dataId:0,value:val,});
	}
	
	return;
},t).
getP;


new cfc(gbb.prototype).
addBase('bringSkills_getDelta',function f(){
	return this.traitsSumAll(f.tbl[3]._key2content.bringSkillsAmount[2]);
},t).
addBase('bringSkills_getTotalAmount',function f(){
	// final result
	return Math.max(Math.trunc(f.tbl[1]._globalChanges+this.bringSkills_getDelta()),0);
},t).
getP;

new cfc(Game_Actor.prototype).
add('bringSkills_getCont',function f(skillId){
	let rtv=this._bringSkills_cont; if(!rtv) rtv=this._bringSkills_cont=[];
	return rtv;
}).
add('bringSkills_clearBroughtSkills',function f(){
	this.bringSkills_getCont().uniqueClear();
}).
add('bringSkills_bringSkills',function f(skillId){
	if(arguments.length===1){
		// with check
		const arr=this.bringSkills_getCont();
		arr.uniquePush(skillId);
		if(this.bringSkills_getTotalAmount()>=arr.length) return true;
		arr.uniquePop(skillId);
		return;
	}
	for(let x=arguments.length;x--;){
		const skillId=arguments[x]-0; if(!$dataSkills[skillId]) continue;
		this.bringSkills_getCont().uniquePush(skillId);
	}
}).
add('bringSkills_deBringSkills',function f(skillId){
	for(let x=arguments.length;x--;){
		const skillId=arguments[x]-0;
		this.bringSkills_getCont().uniquePop(skillId);
	}
}).
add('bringSkills_isSkillBrought',function f(skillId){
	return this.bringSkills_getCont().uniqueHas(skillId);
}).
add('bringSkills_getList',function f(){
	return this.bringSkills_getCont().slice();
}).
getP;


new cfc(Game_System.prototype).
addBase('bringSkills_setEnableState',function f(enabled){
	this._bringSkills_enabled=!!enabled;
}).
addBase('bringSkills_getEnableState',function f(){
	return !!this._bringSkills_enabled;
}).
getP;


new cfc(Window_SkillType.prototype).
add('makeCommandList',function f(){
	if(this._actor){
		if(!this._bringSkills_optionAtLast){
			if(!this._bringSkills_hideOpt) (f.tbl[7]).forEach(f.tbl[8],this);
		}
		f.ori.apply(this,arguments);
		if(this._bringSkills_optionAtLast){
			if(!this._bringSkills_hideOpt) (f.tbl[7]).forEach(f.tbl[8],this);
		}
	}
},t).
getP;

{ const a=class Window_BringSkills_commonItems extends Window_SkillList{
};
new cfc(a.prototype).
addBase('callUpdateHelp',function f(){
	return f._super[f._funcName].apply(this,arguments);	
}).
add('callUpdateHelp',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updateCntWnd();
	return rtv;
}).
addBase('updateCntWnd_formText',function f(current,total){
if(0){
	// default ref code
	let rtv="";
	if(total<current+1) rtv+="\\C[10]";
	if(Window_Base.prototype.processEscapeCharacter_textPosition) rtv+=" \\TXTRIGHT:"+JSON.stringify(current+' / '+total);
	else rtv+=current+' / '+total;
	return rtv;
}
	return f.tbl[10].call(this,current,total,f.tbl[1]._broughtSkillTextCap);
},t).
addBase('updateCntWnd',function f(){
	const actor=this._actor;
	if(!actor||!this._cntWnd) return;
	this._cntWnd.setText(this.updateCntWnd_formText(
		actor.bringSkills_getCont().length,
		actor.bringSkills_getTotalAmount(),
	));
}).
addBase('maxCols',t[9]).
addBase('toSkillDataobj',function f(skillId){
	return $dataSkills[skillId];
}).
getP;
window[a.name]=a;
}

{ const a=class Window_BringSkills_broughtItems extends Window_BringSkills_commonItems{
};
new cfc(a.prototype).
addBase('makeItemList',function f(){
	const actor=this._actor;
	const arr=this._data=(actor?actor.bringSkills_getList():[]).map(this.toSkillDataobj);
	if(!arr.length) arr.push(null);
}).
addBase('isEnabled',function f(){
	return true;
}).
getP;
window[a.name]=a;
}

{ const a=class Window_BringSkills_allItems extends Window_BringSkills_commonItems{
};
new cfc(a.prototype).
addBase('makeItemList',function f(){
	const actor=this._actor;
	const arr=this._data=(actor?actor.skillIds_selfLearned():[]).map(this.toSkillDataobj).filter(this.includes,this);
	if(!arr.length) arr.push(null);
}).
addBase('isEnabled',function f(item){
	const actor=this._actor;
	return actor&&!actor.bringSkills_isSkillBrought(item.id);
}).
addBase('includes',function f(skill){
	if(!DataManager.isSkill(skill)) return;
	if(undefined===this._lastSkillTypeId||f.tbl[11]===this._lastSkillTypeId) return true;
	return skill.stypeId===this._lastSkillTypeId;
},t).
addBase('setType',function f(skillTypeId){
	if(this._lastSkillTypeId===skillTypeId) return;
	this._lastSkillTypeId=skillTypeId;
	this.refresh();
},t).
getP;
window[a.name]=a;
}

new cfc(Scene_Skill.prototype).
add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._bringSkills_hideOpt=$gameSystem&&!$gameSystem.bringSkills_getEnableState(); // disable bringSkills feature
	this._bringSkills_optionAtLast=false;
	return rtv;
}).
add('createSkillTypeWindow_bringSkills',function f(){
	this._skillTypeWindow.setHandler('bringSkills',this.commandBringSkills.bind(this));
	this._skillTypeWindow._bringSkills_hideOpt=this._bringSkills_hideOpt;
	this._skillTypeWindow._bringSkills_optionAtLast=this._bringSkills_optionAtLast;
}).
add('createSkillTypeWindow',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.createSkillTypeWindow_bringSkills();
	return rtv;
}).
addBase('commandBringSkills',function f(){
	const wndB=this._bringSkills_itemWindowBrought;
	const wndA=this._bringSkills_itemWindowAll;
	wndA.activate();
	wndA.selectLast();
	wndB.deactivate();
	wndB.deselect();
}).
add('create',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.create_bringSkills.apply(this,arguments);
	return rtv;
}).
addBase('create_bringSkills',function f(){
	if(this._bringSkills_hideOpt) return;
	const W=Graphics.width;
	const cx=W>>1;
	const h=this._itemWindow.height;
	const y=this._itemWindow.y;
	const wndB=this._bringSkills_itemWindowBrought=new Window_BringSkills_broughtItems(0,y,cx,h);
	const wndA=this._bringSkills_itemWindowAll=new Window_BringSkills_allItems(cx,y,W-cx,h);
	wndB.setHandler('cancel',this.bringSkills_cmd_goBackToTypes.bind(this));
	wndA.setHandler('cancel',this.bringSkills_cmd_goBackToTypes.bind(this));
	wndB.setHandler('ok',this.bringSkills_cmd_deBring.bind(this));
	wndA.setHandler('ok',this.bringSkills_cmd_bring.bind(this));
	wndA._helpWindow=wndB._helpWindow=this._helpWindow;
	wndA.active=wndB.active=false;
	this.addChild(wndB);
	this.addChild(wndA);
	this._bringSkills_leftToRightWnds=[
		wndB,wndA,
	];
	this._bringSkills_idx=1;
	
	const wndC=this._bringSkills_itemWindowCnt=new Window_Help(1);
	wndB._cntWnd=wndC;
	wndA._cntWnd=wndC;
	this.addChild(wndC);
	
	const wndT=this._bringSkills_itemWindowType=new Window_Help(1);
	this.addChild(wndT);
}).
addBase('bringSkills_cmd_goBackToTypes',function f(){
	const wndB=this._bringSkills_itemWindowBrought;
	const wndA=this._bringSkills_itemWindowAll;
	wndA.deselect();
	wndA.deactivate();
	wndB.deactivate();
	wndB.deselect();
	this._skillTypeWindow.activate();
}).
addBase('bringSkills_cmd_deBring_playSeSucc',function f(){
	SoundManager.playEquip();
}).
addBase('bringSkills_cmd_deBring_playSeFail',function f(){
	SoundManager.playBuzzer();
}).
addBase('bringSkills_cmd_deBring',function f(){
	const wndB=this._bringSkills_itemWindowBrought;
	const wndA=this._bringSkills_itemWindowAll;
	const actor=this._actor;
	const item=wndB.item();
	if(item){
		actor.bringSkills_deBringSkills(item.id);
		this.bringSkills_cmd_deBring_playSeSucc();
		wndA.refresh();
	}else this.bringSkills_cmd_deBring_playSeFail();
	wndB.activate();
}).
addBase('bringSkills_cmd_bring_playSeSucc',function f(){
	SoundManager.playEquip();
}).
addBase('bringSkills_cmd_bring_playSeFail',function f(){
	SoundManager.playBuzzer();
}).
addBase('bringSkills_cmd_bring',function f(){
	const wndB=this._bringSkills_itemWindowBrought;
	const wndA=this._bringSkills_itemWindowAll;
	const actor=this._actor;
	const item=wndA.item();
	if(item){
		if(actor.bringSkills_bringSkills(item.id)){
			this.bringSkills_cmd_bring_playSeSucc();
			wndB.refresh();
		}else this.bringSkills_cmd_bring_playSeFail();
	}else this.bringSkills_cmd_bring_playSeFail();
	wndA.activate();
}).
addBase('bringSkills_isCurrentlyEnabled',function f(){
	if(this._bringSkills_hideOpt) return false;
	const ref=this._itemWindow;
	const enabled=ref&&ref._stypeId===f.tbl[7][0][3];
	return enabled;
},t).
add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_bringSkills.apply(this,arguments);
	return rtv;
}).
addBase('update_bringSkills',function f(){
	this.update_bringSkills_hintText_switchType();
	if(!this.update_bringSkills_active()) return;
	this.update_bringSkills_switchType();
	this.update_bringSkills_size();
	this.refreshActor_bringSkills();
}).
addBase('update_bringSkills_active_playSwitchPaneSe',function f(){
	SoundManager.playCursor();
}).
addBase('update_bringSkills_active',function f(){
	// visible + active(+touch)
	const enabled=this.bringSkills_isCurrentlyEnabled();
	const wndB=this._bringSkills_itemWindowBrought;
	const wndA=this._bringSkills_itemWindowAll;
	const wndC=this._bringSkills_itemWindowCnt;
	const wndT=this._bringSkills_itemWindowType;
	const ref=this._itemWindow;
	
	if(wndB)
	wndB.visible=
	wndA.visible=
	wndC.visible=
	wndT.visible=
	!(ref.visible=!enabled);
	
	if(!enabled) return;
	
	const delta=Input.isTriggered('right')-Input.isTriggered('left');
	if(delta){
		this.update_bringSkills_active_playSwitchPaneSe();
		const wnds=this._bringSkills_leftToRightWnds;
		this._bringSkills_idx=(wnds.length+this._bringSkills_idx+delta)%wnds.length;
		for(let x=wnds.length;x--;){
			if(this._bringSkills_idx!==x){ wnds[x].active=false; continue; }
			wnds[x].active=true;
			if(wnds[x].index()>=0) wnds[x].reselect();
			else wnds[x].select(0);
		}
	}
	
	if(TouchInput.isTriggered()){
		const wnds=this._bringSkills_leftToRightWnds;
		for(let xs=wnds.length,x=xs;x--;){
			if(!wnds[x].containsPoint_global(TouchInput)) continue;
			this._bringSkills_idx=x;
			for(let z=x;z--;){ wnds[z].active=false; continue; }
			for(let z=x;++z<xs;){ wnds[z].active=false; continue; }
			wnds[x].active=true;
			if(wnds[x].index()>=0) wnds[x].reselect();
			else wnds[x].select(0);
			break;
		}
	}
	
	return true;
}).
addBase('update_bringSkills_switchType_playSe',function f(){
	SoundManager.playCursor();
}).
addBase('update_bringSkills_switchType',function f(){
	let isSetTextTrigger=false; // should setText if true
	let isChangeTrigger=false; // should setText if true
	
	const actor=this.actor();
	if(this._bringSkills_skillType_lastActor!==actor){
		this._bringSkills_skillType_lastActor=actor;
		this._bringSkills_skillType_idx=0;
		this._bringSkills_skillTypeIds=[f.tbl[11],].concat_inplace(actor.addedSkillTypes().sort(cmpFunc_num));
		isSetTextTrigger=true;
	}
	
	if(Input.isTriggered('shift')) isSetTextTrigger=isChangeTrigger=true;
	if(TouchInput.isTriggered() && this._bringSkills_itemWindowType.containsPoint_global(TouchInput)) isSetTextTrigger=isChangeTrigger=true;
	
	if(!isSetTextTrigger) return;
	
	const arr=this._bringSkills_skillTypeIds;
	let idx=this._bringSkills_skillType_idx;
	if(isChangeTrigger){
		idx=this._bringSkills_skillType_idx=(idx+1)%arr.length;
		this.update_bringSkills_switchType_playSe();
	}
	this._bringSkills_itemWindowType.setText(idx?DataManager.arrMapFunc_idToSkillType(arr[idx]):arr[0]);
	this._bringSkills_itemWindowAll.setType(arr[idx]);
},t).
addBase('update_bringSkills_size',function f(){
	const enabled=this.bringSkills_isCurrentlyEnabled();
	if(!enabled) return;
	const wndB=this._bringSkills_itemWindowBrought;
	const wndA=this._bringSkills_itemWindowAll;
	const wndC=this._bringSkills_itemWindowCnt;
	const wndT=this._bringSkills_itemWindowType;
	const ref=this._itemWindow;
	const X=ref.x,W=ref.width;
	const Y=ref.y,H=ref.height;
	const CX=X+((W-X)>>1);
	const CY=Y+wndC.height;
	const CYT=Y+wndT.height;
	const rectB=new Rectangle(X,CY,CX-X,H-(CY-Y));
	const rectC=new Rectangle(X,Y,CX-X,CY-Y);
	const rectA=new Rectangle(CX,CYT,W-(CX-X),H-(CYT-Y));
	const rectT=new Rectangle(CX,Y,W-(CX-X),CYT-Y);
	if(!rectB.equals(wndB)){
		wndB.x=rectB.x;
		wndB.y=rectB.y;
		wndB.width  = rectB.width;
		wndB.height = rectB.height;
	}
	if(!rectA.equals(wndA)){
		wndA.x=rectA.x;
		wndA.y=rectA.y;
		wndA.width  = rectA.width;
		wndA.height = rectA.height;
	}
	if(!rectC.equals(wndC)){
		wndC.x=rectC.x;
		wndC.y=rectC.y;
		wndC.width  = rectC.width;
		wndC.height = rectC.height;
	}
	if(!rectT.equals(wndT)){
		wndT.x=rectT.x;
		wndT.y=rectT.y;
		wndT.width  = rectT.width;
		wndT.height = rectT.height;
	}
}).
addBase('update_bringSkills_hintText_switchType',function f(){
	const enabled=this.bringSkills_isCurrentlyEnabled();
	if(!this._bringSkills_hintText_switchType_lastEnabled===!enabled) return;
	this._bringSkills_hintText_switchType_lastEnabled=enabled;
	if(!enabled) return;
	this._helpWindow.setText(EVAL.call(this,t[1]._broughtSkillTextSwitchType));
},t).
add('refreshActor',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.refreshActor_bringSkills.apply(this,arguments);
	return rtv;
}).
addBase('refreshActor_bringSkills',function f(){
	const enabled=this.bringSkills_isCurrentlyEnabled();
	if(!enabled) return -1;
	const actor=this.actor();
	if(this._bringSkills_refreshActor_lastActor===actor) return -2;
	this._bringSkills_refreshActor_lastActor=actor;
	const wndB=this._bringSkills_itemWindowBrought;
	const wndA=this._bringSkills_itemWindowAll;
	const wndC=this._bringSkills_itemWindowCnt;
	wndB.setActor(actor);
	wndA.setActor(actor);
	wndB.updateCntWnd();
}).
getP;


new cfc(Window_BattleSkill.prototype).
addBase('includes',function f(item){
	return f._super[f._funcName].apply(this,arguments);
}).
add('includes',function f(item){
	if(!f.ori.apply(this,arguments)) return false;
	return this.includes_bringSkills.apply(this,arguments);
}).
addBase('includes_bringSkills',function f(item){
	const actor=this._actor; if(!actor) return false;
	if($gameSystem&&!$gameSystem.bringSkills_getEnableState()) return true; // disable bringSkills feature
	return actor&&actor.bringSkills_isSkillBrought(item.id);
}).
getP;


})();
