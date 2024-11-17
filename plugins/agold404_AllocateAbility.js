"use strict";
/*:
 * @plugindesc 能力分配，掛JS屬性到被配點的角色身上
 * @author agold404
 * 
 * @help A abilities allocating system which can leveling up custom properties.
 * there're two parts of the setting. AllocatingAbilities and DisplayedItems
 * to enter the scene: SceneManager.push(Scene_AllocateAbility);
 * 
 * 
 * CostPoint:
 * leveling up an Ability needs some cost. this is to setting the cost.
 * - name:
 *      set what name of the cost to be displayed on the screen.
 *      the string will be sent to eval(),
 *      so you can give different names for different actors.
 * - property:
 *      set what property name of the cost to be put on actor (Javascript) object.
 *      the string will NOT be sent to eval().
 *      Technical detail:
 *        the property name will be set using Object.defineProperty with the string you fill above.
 *        the actual property on the Object will starting with another "_".
 *        providing that getting undefined property gets 0 for you.
 *        for example:
 *          if you set to "_allocPointProperty", then the actual property is "__allocPointProperty".
 *          however, you use "_allocPointProperty" to get the value, so you won't get undefined.
 * 
 * 
 * for AllocatingAbilities, which is left half of the scene, for each item there are 4 sub-items:
 * 1. eval string item name:
 *      line 1 is the item name displayed in the game.
 *      the line will be sent to eval()
 *      then convert the value from above to a String.
 * 2. property name:
 *      line 2 is the property name (of a Javascript Object) that the item's will value be set to an (Javascript) object.
 *      Technical detail:
 *        the property name will be set using Object.defineProperty with the string you fill above.
 *        the actual property on the Object will starting with another "_".
 *        providing that getting undefined property gets 0 for you.
 *        for example:
 *          if you set to "_exampleAbilityProperty", then the actual property is "__exampleAbilityProperty".
 *          however, you use "_exampleAbilityProperty" to get the value, so you won't get undefined.
 * 3. eval string for condition ok:
 *      this line specifies wheather it is ok to allocate this ability.
 *      true-like value means ok, and this ability can be allocated.
 * 4. eval string for cost function:
 *      (itemLv,actor)=>{}
 *      the rest of lines are for eval(), executed when retreiving costs.
 *      you SHOULD assume the function will be called MANY times.
 *      the function should NOT change any other things, or you might need to take your own risk.
 *      if result of eval() is not a function, "()=>1" is used.
 * the allocated amount is an integer. the default unallocated value is 0 (the underlying code treats undefined here as 0).
 * 
 * 
 * for ShowingResults, which is right half of the scene, for each item there are 2 sub-items:
 * 1. eval string item name:
 *      line 1 is the item name displayed in the game.
 *      the line will be sent to eval()
 *      then convert the value from above to a String.
 * 2. eval string for value:
 *      line 2 is the value for this item.
 *      the line will be sent to eval()
 *      then convert the value from above to a String, printing it on the screen.
 *      use actor or a to indicate the current actor.
 * the rest of lines will be truncated.
 * 
 * 
 * 
 * @param AllocatingCostPointRoot
 * @text CostPoint 
 * @desc texts here has no effects
 * 
 * @param AllocatingCostPointName
 * @parent AllocatingCostPointRoot
 * @type string
 * @text CostPoint name 
 * @desc Set CostPoint name for allocation point displayed on the screen
 * @default "point name"
 * 
 * @param AllocatingCostPointProperty
 * @parent AllocatingCostPointRoot
 * @type string
 * @text CostPoint property 
 * @desc Set CostPoint property for allocation point on an actor. this is casted to Number via String-0
 * @default _allocPointProperty
 * 
 * 
 * 
 * @param AllocatingAbilitiesRoot
 * @text Allocating Abilities
 * @desc texts here has no effects
 * 
 * @param AllocatingAbilities
 * @parent AllocatingAbilitiesRoot
 * @type note[]
 * @text Abilities
 * @desc Set custom entries. format: item name \n object property name \n eval for cond. \n eval for alloc.
 * @default ["\"\\\"a item 1 \\\"+Date.now()\\n_exampleAbilityProperty\\ntrue\\n(itemLv,actor)=>itemLv\""]
 * 
 * @param AllocatingAbilityLevelWidth
 * @parent AllocatingAbilitiesRoot
 * @type number
 * @text Ability lv. num. width
 * @desc width reserved for displaying the level number.
 * @default 64
 * 
 * 
 * 
 * @param ShowingResultsRoot
 * @text Showing Results
 * @desc texts here has no effects
 * 
 * @param ShowingResults
 * @parent ShowingResultsRoot
 * @type note[]
 * @text Result items to be shown
 * @desc Set custom entries. format: item name \n eval for value. 
 * @default ["\"\\\"atk\\\"\\na.atk\\nthis is an example item\"","\"\\\"def\\\"\\nactor.def\\nthis is an example item\""]
 * 
 * @param ResultNumberWidth
 * @parent ShowingResultsRoot
 * @type number
 * @text Result num. width
 * @desc width reserved for displaying the number.
 * @default 64
 * 
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_AllocateAbility";
const params=PluginManager._parameters[pluginName];

{ const dp=params.AllocatingCostPointProperty.replace(re_allR,''),np="_"+dp;
Object.defineProperty(Game_BattlerBase.prototype,dp,{
set:function(val){
	return this[np]=val;
},get:function(){
	return this[np]-0||0;
},configurable: true,
});
params._costPointProperty=dp;
}

new cfc(params).addBase('getAllocItemsSetting',function f(){
	if(f.tbl[0]) return f.tbl[0];
	const rtv=[],obj=f.tbl[1];
	const raw=JSON.parse(obj&&obj.AllocatingAbilities||"[]");
	const genFunc=f.tbl[2],defaultFunc=f.tbl[3];
	for(let x=0,xs=raw.length;x<xs;++x){
		const s=JSON.parse(raw[x]).replace(re_allR,'');
		const idx1=s.indexOf('\n'); if(!(idx1>=0)) continue;
		const idx2=s.indexOf('\n',idx1+1); if(!(idx2>=0)) continue;
		let idx3=s.indexOf('\n',idx2+1); if(idx3<0) idx3=s.length;
		const ext={
			text:s.slice(0,idx1),
			key:s.slice(idx1+1,idx2),
			cond:s.slice(idx2+1,idx3),
			cost:s.slice(idx3+1),
		};
		let func=genFunc(ext.cost); if(!(func instanceof Function)){
			func=defaultFunc;
			console.warn('[',pluginName,']',':','cost function eval failm using default cost point function. fail string:\n',ext.cost,'\n in',ext);
		}
		ext.cost=func;
		rtv.push(ext);
	}
	return f.tbl[0]=rtv;
},[
undefined, // 0: cache
params, // 1: PluginManager.parameters(pluginName)
_s=>{
	let t,params;
	{ return eval(_s); }
}, // 2: get func
params._defaultCostPointFunction=()=>1, // 3: default cost func
]).add('getResultItemsSetting',function f(){
	if(f.tbl[0]) return f.tbl[0];
	const rtv=[],obj=f.tbl[1];
	const raw=JSON.parse(obj&&obj.ShowingResults||"[]");
	for(let x=0,xs=raw.length;x<xs;++x){
		const s=JSON.parse(raw[x]).replace(re_allR,'');
		const idx1=s.indexOf('\n'); if(!(idx1>=0)) continue;
		let idx2=s.indexOf('\n',idx1+1); if(idx2<0) idx2=s.length;
		rtv.push({
			text:s.slice(0,idx1),
			get:s.slice(idx1+1,idx2),
		});
	}
	return rtv;
},[
undefined, // 0: cache
params, // 1: PluginManager.parameters(pluginName)
]);

params.getAllocItemsSetting().forEach(ext=>{
const np="_"+ext.key;
Object.defineProperty(Game_BattlerBase.prototype,ext.key,{
set:function(val){
	return this[np]=val;
},get:function(){
	return this[np]-0||0;
},configurable: true,
});
});

Window_Command.prototype._allocateAbility_getText_termsCommand=function f(key,defaultValue){
	const obj=$dataSystem.temrs&&$dataSystem.temrs.commands;
	return obj&&obj[key]||defaultValue;
};

{
const a=class Window_AllocateAbility_Actions extends Window_HorzCommand{
initSelect(){ this.select(1); }
windowWidth(){ return Graphics.boxWidth; }
maxCols(){ return 5; }
makeCommandList(){
	this.addCommand("<", 'prevActor');
	this.addCommand(this.getText_adjust(), 'adjust');
	this.addCommand(this.getText_confirm(), 'confirm');
	this.addCommand(TextManager.cancel, 'cancel');
	this.addCommand(">", 'nextActor');
}

};
a.ori=Window_HorzCommand;
window[a.name]=a;
t=[
a.ori.prototype, // 0: 
];
new cfc(a.prototype).addBase('initialize',function f(x,y){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.initSelect();
	return rtv;
},t).addBase('getText_adjust',function f(){
	return this._allocateAbility_getText_termsCommand(f.tbl[0],f.tbl[1]);
},[
'adjust', // 0: key
'Adjust', // 1: default string
]).addBase('getText_confirm',function f(){
	return this._allocateAbility_getText_termsCommand(f.tbl[0],f.tbl[1]);
},[
'confirm', // 0: key
'Confirm', // 1: default string
]).addBase('getText_quitWithoutSaving',function f(){
	return this._allocateAbility_getText_termsCommand(f.tbl[0],f.tbl[1]);
},[
'quitWithoutSaving', // 0: key
'Quit w/o saving', // 1: default string
]);
}

{
const a=class Window_AllocateAbility_FinCmd extends Window_Command{
makeCommandList(){
	this.addCommand(this.getText_confirm(), 'confirm');
	this.addCommand(TextManager.cancel, 'cancel');
}
};
a.ori=Window_Command;
window[a.name]=a;
a.prototype.getText_confirm=Window_AllocateAbility_Actions.prototype.getText_confirm;
}

{
const a=class Window_AllocateAbility_Allocate extends Window_Command{
};
a.ori=Window_Command;
window[a.name]=a;
t=[
a.ori.prototype, // 0:
params, // 1: PluginManager.parameters(pluginName)
pluginName, // 2: 
];
a.prototype.getText_confirm=Window_AllocateAbility_Actions.prototype.getText_confirm;
new cfc(a.prototype).addBase('initialize',function f(x,y,w,h){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.width=w;
	this.height=h;
	return rtv;
},t).addBase('makeCommandList',function f(){
	const conf=this.getSetting();
	for(let x=0,xs=conf.length;x!==xs;++x) this.addCommand(eval(conf[x].text)+'',conf[x].key,eval(conf[x].cond),conf[x]);
}).addBase('getSetting',function f(){
	return f.tbl[1].getAllocItemsSetting();
},t).addBase('getLevelNumberWidth',function f(idx){
	return f.tbl[1].AllocatingAbilityLevelWidth-0||0;
},t).addBase('itemRectForText',function f(idx){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	rtv.width-=this.getLevelNumberWidth.apply(this,arguments);
	return rtv;
},t).addBase('drawItem',function f(idx){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.drawItem_level(idx);
	return rtv;
},t).addBase('drawItem_level',function f(idx){
	if(!this._actor) return;
	const rect=this.itemRectForText(idx);
	this.drawText(this._actor[this.commandExt(idx).key],rect.x+rect.width,rect.y,this.getLevelNumberWidth(),'right');
}).addBase('setActor',function f(actor){
	if(this._actor===actor) return;
	this._actor=actor;
	this.refresh();
});
}

{
const a=class Window_AllocateAbility_Header extends Window_Help{
};
a.ori=Window_Help;
window[a.name]=a;
t=[
a.ori.prototype, // 0:
params, // 1: PluginManager.parameters(pluginName)
pluginName, // 2: 
params=>{
	let k,r,t,p,a;
	const s=params.AllocatingCostPointName; 
	{ let params; { return eval(s); } }
}, // 3: eval CostPoint name
];
new cfc(a.prototype).addBase('setActor',function f(actor,isForcedRefresh){
	if(!isForcedRefresh&&!this.setActor_refreshCondOk(actor)) return;
	this.setActor_refreshCondUpdate(actor);
	this.setText(this.getActorString(actor));
}).addBase('setActor_refreshCondOk',function f(actor){
	if(this._actor!==actor) return true;
	const costPoint=this.getActorAbilityPoints(actor);
	if(this._costPoint!==costPoint) return true;
}).addBase('setActor_refreshCondUpdate',function f(actor){
	this._actor=actor;
	this._costPoint=this.getActorAbilityPoints(actor);
}).addBase('getActorString',function f(actor){
	return actor.name()+'\n'+
		f.tbl[3](f.tbl[1])+" : "+this.getActorAbilityPoints(actor);
},t).addBase('getActorAbilityPoints',function f(actor){
	return actor[params._costPointProperty];
});
}

{
const a=class Window_AllocateAbility_Results extends Window_Base{
};
a.ori=Window_Base;
window[a.name]=a;
t=[
a.ori.prototype, // 0:
params, // 1: PluginManager.parameters(pluginName)
pluginName, // 2: 
(conf1,actr)=>{
	const a=actr,actor=a,s=conf1.text;
	{ let k,r,t,params,conf1,actr; { return eval(s); } }
}, // 3: eval result name
(conf1,actr)=>{
	const a=actr,actor=a,s=conf1.get;
	{ let k,r,t,params,conf1,actr; { return eval(s); } }
}, // 4: eval result num
];
new cfc(a.prototype).addBase('setActor',function f(futureActor,isForcedRefresh){
	if(!isForcedRefresh&&!this.setActor_refreshCondOk(futureActor)) return;
	this.setActor_refreshCondUpdate(futureActor);
	this.redraw();
}).addBase('setActor_refreshCondOk',function f(futureActor){
	if(this._futureActor!==futureActor) return true;
}).addBase('setActor_refreshCondUpdate',function f(futureActor){
	this._actor=futureActor;
}).addBase('redraw',function f(){
	const bmp=this.contents; if(!bmp) return;
	bmp.clear();
	const a=this._actor,actor=a; if(!a) return;
	const conf=f.tbl[1].getResultItemsSetting();
	const numWidth=this.getResultNumberWidth(),tp=this.textPadding();
	const W=~~(this.contentsWidth()-tp*2);
	const w1=W-numWidth;
	let y=tp;
	for(let x=0,xs=conf.length;x!==xs;++x,y+=this.lineHeight()){
		this.drawText(f.tbl[3](conf[x],a)+'',0   ,y,w1);
		this.drawText(f.tbl[4](conf[x],a)+'',0+w1,y,numWidth,'right');
	}
	return y;
},t).addBase('getResultNumberWidth',function f(){
	return f.tbl[1].ResultNumberWidth-0||0;
},t);
}

{
const a=class Scene_AllocateAbility extends Scene_MenuBase{
};
a.ori=Scene_MenuBase;
window[a.name]=a;
t=[
a.ori.prototype,
params,
];
new cfc(a.prototype).addBase('initialize',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.initialize_bgBmp();
	return rtv;
},t).addBase('initialize_bgBmp',function f(){
	const bmp=this._backgroundBitmap=SceneManager.snap();
	bmp.blur();
	return bmp;
}).addBase('createBackground',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	const bgSp=this._backgroundSprite; bgSp.bitmap=this._backgroundBitmap;
	return rtv;
},t).addBase('create',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.create_windows();
	this.create_windows_setHandlers();
	return rtv;
},t).addBase('create_windows',function f(){
	let last,tmp,sp;
	this.addChild(sp=this._layoutRoot=new Sprite());
	sp.addChild(tmp=this._window_header=new Window_AllocateAbility_Header(2)); last=tmp;
	sp.addChild(tmp=this._window_actions=new Window_AllocateAbility_Actions(last.x,last.y+last.height)); last=tmp;
	sp.addChild(tmp=this._window_selects=new Window_AllocateAbility_Allocate(last.x,last.y+last.height,Graphics.boxWidth>>1,Graphics.boxHeight-(last.y+last.height))); last=tmp;
	tmp.deactivate();
	sp.addChild(tmp=this._window_results=new Window_AllocateAbility_Results(last.x+last.width,last.y,Graphics.boxWidth-last.width,last.height)); last=tmp;
	
	this.addChild(this._window_finCmd=new Window_AllocateAbility_FinCmd(0,0));
	this._window_finCmd.openness=0;
	this._window_finCmd.position.set(
		(Graphics.boxWidth-this._window_finCmd.width)>>1,
		(Graphics.boxHeight-this._window_finCmd.height)>>1,
	);
}).addBase('create_windows_setHandlers',function f(){
	let tmp;
	this._window_actions.setHandler('prevActor', tmp=this.userInput_actionPrevActor.bind(this));
	this._window_actions.setHandler('pageup',tmp);
	this._window_actions.setHandler('adjust',    this.userInput_actionAdjust.bind(this));
	this._window_actions.setHandler('confirm',   this.userInput_actionConfirm.bind(this));
	this._window_actions.setHandler('cancel',    this.popScene.bind(this));
	this._window_actions.setHandler('nextActor', tmp=this.userInput_actionNextActor.bind(this));
	this._window_actions.setHandler('pagedown',tmp);
	
	this._window_selects.setHandler('cancel',    this.userInput_selectCancel.bind(this));
	this._window_selects.setHandler('ok',        this.userInput_selectOk.bind(this));
	
	this._window_finCmd.setHandler('cancel',     this.userInput_finCmdCancel.bind(this));
}).addBase('update',function f(){
	this.update_input();
	this.update_actor();
	return f.tbl[0][f._funcName].apply(this,arguments);
},t).addBase('update_input',function f(){
	
}).addBase('update_actor',function f(){
	this.update_actorHeader();
	this.update_actorAbilities();
	this.update_actorResults();
}).addBase('update_actorHeader',function f(){
	const actr=this.actor();
	this._window_header.setActor(actr);
}).addBase('update_actorAbilities',function f(){
	const actr=this.actor();
	this._window_selects.setActor(actr);
}).addBase('update_actorResults',function f(){
	const wnd=this._window_results;
	const actr=this.actor();
	this._window_results.setActor(actr);
},t).addBase('userInput_updateFocus',function f(wnd){
	if(this._nowFocusOn) this._nowFocusOn.deactivate();
	this._nowFocusOn=wnd;
	wnd.activate();
}).addBase('userInput_actionAdjust',function f(){
	this.userInput_updateFocus(this._window_selects);
}).addBase('userInput_actionConfirm',function f(){
	this._window_finCmd.open();
	this._layoutRoot.alpha=0.75;
	this.userInput_updateFocus(this._window_finCmd);
}).addBase('userInput_actionPrevActor',function f(){
	this.previousActor();
	this.userInput_updateFocus(this._window_actions);
}).addBase('userInput_actionNextActor',function f(){
	this.nextActor();
	this.userInput_updateFocus(this._window_actions);
}).addBase('userInput_selectCancel',function f(){
	this.userInput_updateFocus(this._window_actions);
}).addBase('userInput_selectGetCost',function f(itemLv,actor){
	let func=this._window_selects.currentExt().cost;
	if(!(func instanceof Function)) func=f.tbl[1]._defaultCostPointFunction;
	return func(itemLv,actor);
},t).addBase('userInput_selectLevelUp',function f(itemExt,actor){
	if(!itemExt) return;
	actor[f.tbl[1]._costPointProperty]-=this.userInput_selectGetCost(actor[itemExt.key],actor);
	++actor[itemExt.key];
},t).addBase('userInput_selectLevelDown',function f(itemExt,actor){
	if(!itemExt) return;
	--actor[itemExt.key];
	actor[f.tbl[1]._costPointProperty]+=this.userInput_selectGetCost(actor[itemExt.key],actor);
},t).addBase('userInput_selectOk',function f(){
	const ext=this._window_selects.currentExt();
	this.userInput_selectLevelUp(ext,this._actor);
	this.userInput_updateFocus(this._window_selects);
}).addBase('userInput_finCmdCancel',function f(){
	this._window_finCmd.close();
	this._layoutRoot.alpha=1;
	this.userInput_updateFocus(this._window_actions);
});
}

})();
