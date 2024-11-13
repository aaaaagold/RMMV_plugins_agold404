"use strict";
/*:
 * @plugindesc 能力分配，掛JS屬性到被配點的角色身上
 * @author agold404
 * 
 * @help there're two parts of the setting. AllocatingAbilities and DisplayedItems
 * to enter the scene: SceneManager.push(Scene_AllocateAbility);
 * 
 * for AllocatingAbilities, which is left half of the scene, for each item there are 4 sub-items:
 * 1. item name:
 *      line 1 is the item name displayed in the game.
 *      the line will be sent to eval()
 *      then convert the value above to String.
 * 2. property name:
 *      line 2 is the property name that the item's will value be set to an (Javascript) object.
 * 3. eval string for condition ok:
 *      this line specifies wheather it is ok to allocate this ability.
 *      true-like value means ok, and this ability can be allocated.
 * 4. eval string for allocating:
 *      the rest of lines are for eval(), executed when allocating an ability point to (or say level up) this item.
 *      that is, consuming a point must be handled by the plugin user.
 * the allocated amount is an integer. the default unallocated value is 0 (the underlying code treats undefined here as 0).
 * 
 * 
 * @param AllocatingAbilities
 * @type note[]
 * @text Allocating Abilities
 * @desc Set custom entries. format: item name \n object property name \n eval for cond. \n eval for alloc.
 * @default ["\"\\\"item name 1 \\\"+Date.now()\\nexampleAbility\\ntrue\\nconsole.warn(\\\"allocating to exampleAbility\\\")\""]
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_AllocateAbility";

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
undefined, // 1: cache
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
	// first try plugin. then use default ( = empty ) if fail.
	if(f.tbl[1]) return f.tbl[1];
	const rtv=[],obj=PluginManager.parameters(f.tbl[2]);
	const raw=JSON.parse(obj&&obj.AllocatingAbilities||"[]");
	for(let x=0,xs=raw.length;x<xs;++x){
		const s=JSON.parse(raw[x]);
		const idx1=s.indexOf('\n'); if(!(idx1>=0)) continue;
		const idx2=s.indexOf('\n',idx1+1); if(!(idx2>=0)) continue;
		let idx3=s.indexOf('\n',idx2+1); if(idx3<0) idx3=s.length;
		rtv.push({
			text:s.slice(0,idx1),
			key:s.slice(idx1+1,idx2),
			cond:s.slice(idx2+1,idx3),
			eval:s.slice(idx3+1),
		});
	}
	return f.tbl[1]=rtv;
},t);
}

{
const a=class Scene_AllocateAbility extends Scene_MenuBase{
};
a.ori=Scene_MenuBase;
window[a.name]=a;
t=[
a.ori.prototype,
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
	sp.addChild(tmp=this._window_header=new Window_Help(2)); last=tmp;
	sp.addChild(tmp=this._window_actions=new Window_AllocateAbility_Actions(last.x,last.y+last.height)); last=tmp;
	sp.addChild(tmp=this._window_selects=new Window_AllocateAbility_Allocate(last.x,last.y+last.height,Graphics.boxWidth>>1,Graphics.boxHeight-(last.y+last.height))); last=tmp;
	tmp.deactivate();
	sp.addChild(tmp=this._window_ability=new Window_Base(last.x+last.width,last.y,Graphics.boxWidth-last.width,last.height)); last=tmp;
	
	this.addChild(this._window_finCmd=new Window_AllocateAbility_FinCmd(0,0));
	this._window_finCmd.openness=0;
	this._window_finCmd.position.set(
		(Graphics.boxWidth-this._window_finCmd.width)>>1,
		(Graphics.boxHeight-this._window_finCmd.height)>>1,
	);
}).addBase('create_windows_setHandlers',function f(){
	this._window_actions.setHandler('prevActor', this.userInput_actionPrevActor.bind(this));
	this._window_actions.setHandler('adjust',    this.userInput_actionAdjust.bind(this));
	this._window_actions.setHandler('confirm',   this.userInput_actionConfirm.bind(this));
	this._window_actions.setHandler('cancel',    this.popScene.bind(this));
	this._window_actions.setHandler('nextActor', this.userInput_actionNextActor.bind(this));
	
	this._window_selects.setHandler('cancel',    this.userInput_selectCancel.bind(this));
	this._window_selects.setHandler('ok',        this.userInput_selectOk.bind(this));
	
	this._window_finCmd.setHandler('cancel',     this.userInput_finCmdCancel.bind(this));
}).addBase('update',function f(){
	this.update_input();
	this.update_actorInfo();
	return f.tbl[0][f._funcName].apply(this,arguments);
},t).addBase('update_input',function f(){
	
}).addBase('update_actorInfo',function f(){
	this._window_header.setText(this.update_actorInfo_getHeaderString());
}).addBase('update_actorInfo_getHeaderString',function f(){
	return this.actor().name();
}).addBase('userInput_updateFocus',function f(wnd){
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
}).addBase('userInput_selectOk',function f(){
	const ext=this._window_selects.currentExt();
	{ eval(ext&&ext.eval); }
	this.userInput_updateFocus(this._window_selects);
}).addBase('userInput_finCmdCancel',function f(){
	this._window_finCmd.close();
	this._layoutRoot.alpha=1;
	this.userInput_updateFocus(this._window_actions);
});
}

})();
