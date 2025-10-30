"use strict";
/*:
 * @plugindesc 能力分配，掛JS屬性到被配點的角色身上
 * @author agold404
 * 
 * @help An abilities allocating system which can leveling up custom properties.
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
 * @param AllocatingCostPointCondFunc
 * @parent AllocatingCostPointRoot
 * @type string
 * @text CostPoint condition
 * @desc Set script how an actor can cost points to allocate an ability. use actor or a to represent the actor.
 * @default lv>=0&&a._allocPointProperty>=0
 * 
 * @param AllocatingCostPointLevelUpGain
 * @parent AllocatingCostPointRoot
 * @type string
 * @text CostPoint level up gain
 * @desc Set script how an actor can get points to allocate an ability when leveling up. use actor or a to represent the actor.
 * @default a.name().length
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
 * @param AllocatingAbilityPrevLevelWidth
 * @parent AllocatingAbilitiesRoot
 * @type number
 * @text Ability previous lv. num. width
 * @desc width reserved for displaying the previous level number.
 * @default 64
 * 
 * @param AllocatingAbilityNextArrowWidth
 * @parent AllocatingAbilitiesRoot
 * @type number
 * @text Ability next arrow width
 * @desc width reserved for displaying the next level arrow.
 * @default 32
 * 
 * @param AllocatingAbilityLevelWidth
 * @parent AllocatingAbilitiesRoot
 * @type number
 * @text Ability lv. num. width
 * @desc width reserved for displaying the level number.
 * @default 64
 * 
 * @param AllocatingAbilityWindowWidth
 * @parent AllocatingAbilitiesRoot
 * @type number
 * @text Ability items window width
 * @desc width reserved for displaying the ability items window.
 * @default 512
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
 * @default ["\"\\\"atk\\\"\\na.atk\\nthis is an example item\"","\"\\\"def\\\"\\nactor.def\\nthis is an example item\"","\"\\\"example\\\"\\nactor._exampleAbilityProperty\\nthe corresponding example property\""]
 * 
 * @param ResultPrevNumberWidth
 * @parent ShowingResultsRoot
 * @type number
 * @text Result previous num. width
 * @desc width reserved for displaying the previous number.
 * @default 64
 * 
 * @param ResultNextArrowWidth
 * @parent ShowingResultsRoot
 * @type number
 * @text Result next arrow width
 * @desc width reserved for displaying the next arrow.
 * @default 32
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

// set default
{
if(isNaN(params.AllocatingAbilityLevelWidth-=0))     params.AllocatingAbilityLevelWidth=64;
if(isNaN(params.AllocatingAbilityPrevLevelWidth-=0)) params.AllocatingAbilityPrevLevelWidth=64;
if(isNaN(params.AllocatingAbilityNextArrowWidth-=0)) params.AllocatingAbilityNextArrowWidth=32;
if(isNaN(params.AllocatingAbilityWindowWidth-=0))    params.AllocatingAbilityWindowWidth=512;
}
{
if(isNaN(params.ResultNumberWidth-=0))     params.ResultNumberWidth=64;
if(isNaN(params.ResultPrevNumberWidth-=0)) params.ResultPrevNumberWidth=64;
if(isNaN(params.ResultNextArrowWidth-=0))  params.ResultNextArrowWidth=32;
}

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

params._arrowText=" -> ";

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
]).
addBase('getResultItemsSetting',function f(){
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
	const obj=$dataSystem.terms&&$dataSystem.terms.commands;
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
	this.addCommand(this.getText_quitWithoutSaving(), 'cancel');
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
	this.addCommand(this.getText_quitWithoutSaving(), 'quit');
}
};
a.ori=Window_Command;
window[a.name]=a;
const p=a.prototype;
p.getText_confirm=Window_AllocateAbility_Actions.prototype.getText_confirm;
p.getText_quitWithoutSaving=Window_AllocateAbility_Actions.prototype.getText_quitWithoutSaving;
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
},t).addBase('getPrevLevelNumberWidth',function f(idx){
	return f.tbl[1].AllocatingAbilityPrevLevelWidth-0||0;
},t).addBase('getNextArrowWidth',function f(idx){
	return f.tbl[1].AllocatingAbilityNextArrowWidth-0||0;
},t).addBase('getLevelNumberWidth',function f(idx){
	return f.tbl[1].AllocatingAbilityLevelWidth-0||0;
},t).addBase('itemRectForText',function f(idx){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	rtv.width-=this.getPrevLevelNumberWidth.apply(this,arguments)+this.getNextArrowWidth.apply(this,arguments)+this.getLevelNumberWidth.apply(this,arguments);
	return rtv;
},t).addBase('drawItem',function f(idx){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.drawItem_level(idx);
	return rtv;
},t).addBase('drawItem_level',function f(idx){
	if(!this._actor) return;
	const rect=this.itemRectForText(idx);
	const prevNumWidth=this.getPrevLevelNumberWidth.apply(this,arguments);
	const arrowWidth=this.getNextArrowWidth.apply(this,arguments);
	const numWidth=this.getLevelNumberWidth.apply(this,arguments);
	let ende=rect.x+rect.width,w;
	const v=this._actor[this.commandExt(idx).key];
	const pv=this._previewActor[this.commandExt(idx).key];
	this.resetTextColor();
	if(pv===v){
		ende+=prevNumWidth+arrowWidth;
		this.drawText(v,ende,rect.y,w=numWidth,'right');
		ende+=w;
	}else{
		this.drawText(v,ende,rect.y,w=prevNumWidth,'right');
		ende+=w;
		this.changeTextColor(this.paramchangeTextColor(pv-v));
		const arrowText=f.tbl[1]._arrowText;
		this.drawText(arrowText,ende,rect.y,w=arrowWidth,'center');
		ende+=w;
		this.drawText(pv,ende,rect.y,w=numWidth,'right');
		ende+=w;
		this.resetTextColor();
	}
},t).addBase('setActor',function f(isForcedRefresh,actor,previewActor){
	if(!isForcedRefresh&&!this.setActor_refreshCondOk(actor,previewActor)) return;
	this.setActor_refreshCondUpdate(actor,previewActor);
	this.refresh();
}).addBase('setActor_refreshCondOk',function f(actor){
	if(this._actor!==actor) return true;
}).addBase('setActor_refreshCondUpdate',function f(actor,previewActor){
	this._actor=actor;
	this._previewActor=previewActor;
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
new cfc(a.prototype).addBase('setActor',function f(isForcedRefresh,actor,previewActor){
	if(!isForcedRefresh&&!this.setActor_refreshCondOk(actor,previewActor)) return;
	this.setActor_refreshCondUpdate(actor,previewActor);
	this.setText(this.getActorString(actor,previewActor));
}).addBase('setActor_refreshCondOk',function f(actor,previewActor){
	if(this._actor!==actor) return true;
	const costPoint=this.getActorAbilityPoints(previewActor);
	if(this._costPoint!==costPoint) return true;
}).addBase('setActor_refreshCondUpdate',function f(actor,previewActor){
	this._actor=actor;
	this._previewActor=previewActor;
	this._costPoint=this.getActorAbilityPoints(previewActor);
}).addBase('getActorString',function f(actor,previewActor){
	const oriPoints=this.getActorAbilityPoints(actor);
	let rtv=actor.name()+'\n'+
		f.tbl[3](f.tbl[1])+" : "+oriPoints;
	const previewPoints=this.getActorAbilityPoints(previewActor);
	if(previewPoints===oriPoints) return rtv;
	rtv+=f.tbl[1]._arrowText;
	rtv+=previewPoints;
	return rtv;
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
}, // 4: eval result value 
];
new cfc(a.prototype).addBase('setActor',function f(isForcedRefresh,actor,previewActor){
	if(!isForcedRefresh&&!this.setActor_refreshCondOk(actor,previewActor)) return;
	this.setActor_refreshCondUpdate(actor,previewActor);
	this.redraw();
}).addBase('setActor_refreshCondOk',function f(actor,previewActor){
	if(this._actor!==actor) return true;
}).addBase('setActor_refreshCondUpdate',function f(actor,previewActor){
	this._actor=actor;
	this._previewActor=previewActor;
}).addBase('redraw',function f(){
	const bmp=this.contents; if(!bmp) return;
	bmp.clear();
	const a=this._actor;
	const pa=this._previewActor;
	if(!a||!pa) return;
	const conf=f.tbl[1].getResultItemsSetting();
	const prevNumWidth=this.getResultPrevNumberWidth();
	const arrowWidth=this.getResultNextArrowWidth();
	const arrowText=f.tbl[1]._arrowText;
	const numWidth=this.getResultNumberWidth(),tp=this.textPadding();
	const W=~~(this.contentsWidth()-tp*2);
	const w1=W-(prevNumWidth+arrowWidth+numWidth);
	let padX=0;
	let y=tp;
	this.resetTextColor();
	for(let x=0,xs=conf.length;x!==xs;++x,y+=this.lineHeight()){
		let ende=w1,w;
		this.drawText(f.tbl[3](conf[x],a)+'', padX+0,y,ende);
		const v=f.tbl[4](conf[x],a);
		const pv=f.tbl[4](conf[x],pa);
		if(pv===v){
			ende+=prevNumWidth+arrowWidth;
			this.drawText(v+'',  padX+ende,y,w=numWidth,     'right');
		}else{
			this.drawText(v+'',  padX+ende,y,w=prevNumWidth, 'right');
			ende+=w;
			this.changeTextColor(this.paramchangeTextColor(pv-v));
			this.drawText(arrowText+'',   padX+ende,y,w=arrowWidth,'center');
			ende+=w;
			this.drawText(pv+'', padX+ende,y,w=numWidth,     'right');
			ende+=w;
			this.resetTextColor();
		}
	}
	return y;
},t).addBase('getResultPrevNumberWidth',function f(){
	return f.tbl[1].ResultPrevNumberWidth-0||0;
},t).addBase('getResultNextArrowWidth',function f(){
	return f.tbl[1].ResultNextArrowWidth-0||0;
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
}).addBase('initialize_previewActors',function f(){
	const rtv=this._previewActors=new Map();
	rtv._rev=new Map();
	return rtv;
}).addBase('previewActors_getCont',function f(){
	const rtv=this._previewActors;
	if(!rtv) return this.initialize_previewActors();
	return rtv;
}).addBase('previewActors_getMapped',function f(actor){
	if(!actor) return;
	const cont=this.previewActors_getCont();
	let rtv=cont.get(actor);
	if(!rtv){
		cont.set(actor,rtv=JsonEx.makeDeepCopy(actor));
		cont._rev.set(rtv,actor);
	}
	return rtv;
}).addBase('initialize_allocLog',function f(){
	return this._allocLog=new Map();
}).addBase('allocLog_getCont',function f(){
	const rtv=this._allocLog;
	if(!rtv) return this.initialize_allocLog();
	return rtv;
}).addBase('allocLog_clearAll',function f(){
	this.allocLog_getCont().clear();
}).addBase('allocLog_getList',function f(actor){
	const cont=this.allocLog_getCont();
	let rtv=cont.get(actor);
	if(!rtv) cont.set(actor,rtv=[]);
	return rtv;
}).addBase('allocLog_clear1',function f(actor){
	this.allocLog_getList(actor).length=0;
}).addBase('allocLog_addLog',function f(actor,itemExt,delta){
	const arr=this.allocLog_getList(actor);
	if(arr.back&&arr.back[0]===itemExt) arr.back[1]+=delta;
	else arr.push([itemExt,delta]);
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
	let last,tmp,sp,val;
	this.addChild(sp=this._layoutRoot=new Sprite());
	sp.addChild(tmp=this._window_header=new Window_AllocateAbility_Header(2)); last=tmp;
	sp.addChild(tmp=this._window_actions=new Window_AllocateAbility_Actions(last.x,last.y+last.height)); last=tmp;
	val=f.tbl[1].AllocatingAbilityWindowWidth; if(isNaN(val)) val=Graphics.boxWidth>>1;
	sp.addChild(tmp=this._window_selects=new Window_AllocateAbility_Allocate(last.x,last.y+last.height,val,Graphics.boxHeight-(last.y+last.height))); last=tmp;
	tmp.deactivate();
	sp.addChild(tmp=this._window_results=new Window_AllocateAbility_Results(last.x+last.width,last.y,Graphics.boxWidth-last.width,last.height)); last=tmp;
	
	this.addChild(this._window_finCmd=new Window_AllocateAbility_FinCmd(0,0));
	this._window_finCmd.openness=0;
	this._window_finCmd.position.set(
		(Graphics.boxWidth-this._window_finCmd.width)>>1,
		(Graphics.boxHeight-this._window_finCmd.height)>>1,
	);
},t).addBase('create_windows_setHandlers',function f(){
	let tmp;
	this._window_actions.setHandler('prevActor', tmp=this.userInput_actionPrevActor.bind(this));
	this._window_actions.setHandler('pageup',tmp);
	this._window_actions.setHandler('adjust',    this.userInput_actionAdjust.bind(this));
	this._window_actions.setHandler('confirm',   this.userInput_actionConfirm.bind(this));
	this._window_actions.setHandler('cancel',    this.userInput_actionCancel.bind(this));
	this._window_actions.setHandler('nextActor', tmp=this.userInput_actionNextActor.bind(this));
	this._window_actions.setHandler('pagedown',tmp);
	
	this._window_selects.setHandler('cancel',    this.userInput_selectCancel.bind(this));
	this._window_selects.setHandler('ok',        this.userInput_selectOk.bind(this));
	
	this._window_finCmd.setHandler('confirm',    this.userInput_finCmdConfirm.bind(this));
	this._window_finCmd.setHandler('cancel',     this.userInput_finCmdCancel.bind(this));
	this._window_finCmd.setHandler('quit',       this.userInput_finCmdQuit.bind(this));
}).addBase('update',function f(){
	this.update_input();
	this.update_actor();
	return f.tbl[0][f._funcName].apply(this,arguments);
},t).addBase('update_input',function f(){
	
}).addBase('update_actor',function f(isForcedRefresh){
	this.update_actorHeader(isForcedRefresh);
	this.update_actorAbilities(isForcedRefresh);
	this.update_actorResults(isForcedRefresh);
}).addBase('update_actorHeader',function f(isForcedRefresh){
	const actr=this.actor();
	const preview=this.previewActors_getMapped(actr);
	this._window_header.setActor(isForcedRefresh,actr,preview);
}).addBase('update_actorAbilities',function f(isForcedRefresh){
	const actr=this.actor();
	const preview=this.previewActors_getMapped(actr);
	this._window_selects.setActor(isForcedRefresh,actr,preview);
}).addBase('update_actorResults',function f(isForcedRefresh){
	const actr=this.actor();
	const preview=this.previewActors_getMapped(actr);
	this._window_results.setActor(isForcedRefresh,actr,preview);
},t).addBase('userInput_updateFocus',function f(wnd){
	if(this._nowFocusOn) this._nowFocusOn.deactivate();
	this._nowFocusOn=wnd;
	wnd.activate();
}).addBase('userInput_actionAdjust',function f(){
	this.userInput_updateFocus(this._window_selects);
}).addBase('userInput_actionConfirm',function f(){
	const wnd=this._window_finCmd;
	wnd.select(wnd.findSymbol('confirm'));
	wnd.open();
	this._layoutRoot.alpha=0.75;
	this.userInput_updateFocus(wnd);
}).addBase('userInput_actionCancel',function f(){
	const wnd=this._window_finCmd;
	wnd.select(wnd.findSymbol('quit'));
	wnd.open();
	this._layoutRoot.alpha=0.75;
	this.userInput_updateFocus(wnd);
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
},t).addBase('userInput_selectLevel_condOk',function f(actor,itemLv){
	const a=actor,lv=itemLv,s=f.tbl[1].AllocatingCostPointCondFunc;
	{ let f; if(!eval(s)) return false; }
	return true;
},t).addBase('userInput_selectLevelUp',function f(itemExt,actor,isPreview){
	if(!itemExt) return;
	const oriActor=actor;
	if(isPreview) actor=this.previewActors_getMapped(actor);
	const cost=this.userInput_selectGetCost(actor[itemExt.key],actor);
	actor[f.tbl[1]._costPointProperty]-=cost;
	++actor[itemExt.key];
	if(!this.userInput_selectLevel_condOk(actor,actor[itemExt.key])){
		SoundManager.playBuzzer();
		// restore
		--actor[itemExt.key];
		actor[f.tbl[1]._costPointProperty]+=cost;
		return;
	}
	this.allocLog_addLog(actor,itemExt,1);
	if(isPreview) this.update_actor(true);
	return true;
},t).addBase('userInput_selectLevelDown',function f(itemExt,actor,isPreview){
	// internal use
	if(!itemExt) return;
	const oriActor=actor;
	if(isPreview) actor=this.previewActors_getMapped(actor);
	--actor[itemExt.key];
	const cost=this.userInput_selectGetCost(actor[itemExt.key],actor);
	actor[f.tbl[1]._costPointProperty]+=cost;
	if(!this.userInput_selectLevel_condOk(actor,actor[itemExt.key])){
		SoundManager.playBuzzer();
		// restore
		actor[f.tbl[1]._costPointProperty]-=cost;
		++actor[itemExt.key];
		return;
	}
	this.allocLog_addLog(actor,itemExt,-1);
	if(isPreview) this.update_actor(true);
	return true;
},t).addBase('userInput_selectOk',function f(){
	const ext=this._window_selects.currentExt();
	this.userInput_selectLevelUp(ext,this._actor,true);
	this.userInput_updateFocus(this._window_selects);
}).addBase('userInput_finCmdConfirm',function f(){
	this._replayAllocLogToActualActors();
	this.userInput_finCmdQuit();
}).addBase('_replayAllocLogToActualActors',function f(){
	const previewRev=this.previewActors_getCont()._rev;
	const allocLogs=this.allocLog_getCont();
	const unpacked=[];
	allocLogs.forEach((v,k)=>unpacked.push([k,v]));
	unpacked.forEach(info=>{
		const actr=previewRev.get(info[0]); if(!actr) return;
		const arr=info[1];
		for(let x=0,xs=arr.length;x<xs;++x){
			const itemExt=arr[x][0];
			const delta=arr[x][1]-0;
			if(!delta) continue;
			if(delta<0) for(let d=0|-delta;d--;) this.userInput_selectLevelDown(itemExt,actr);
			else for(let d=0|delta;d--;) this.userInput_selectLevelUp(itemExt,actr);
		}
		this.allocLog_clear1(actr);
	});
}).addBase('userInput_finCmdCancel',function f(){
	this._window_finCmd.close();
	this._layoutRoot.alpha=1;
	this.userInput_updateFocus(this._window_actions);
}).addBase('userInput_finCmdQuit',function f(){
	this.popScene();
});
}

{
new cfc(Game_Actor.prototype).add('levelUp',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.allocating_getLevelUpPoints();
	return rtv;
}).addBase('allocating_getLevelUpPoints',function f(){
	this.allocating_getPoints(f.tbl[2](this,f.tbl[1]));
},t=[
undefined, // 0: 
params, // 1: 
(a,params)=>{
	const actor=a,s=params.AllocatingCostPointLevelUpGain;
	{ let k,r,t,params; { return eval(s); } }
}, // 2: get gain points number 
]).addBase('allocating_getPoints',function f(n){
	this[f.tbl[1]._costPointProperty]+=n-0||0;
},t);
}

})();
