"use strict";
/*:
 * @plugindesc UI for missions
 * @author agold404
 * 
 * 
 * @param IsAddingExampleTemplates
 * @type boolean
 * @text is adding example templates
 * @desc template id = "--plugin-examples-1" , "--plugin-examples-2"
 * @default false
 * 
 * 
 * @help an UI for missions
 * 
 * 
 * an info for a mission template = 
 * {
 *   "templateId":"...",
 *   "titleFunc":function,
 *   "descriptionFunc":function,
 *   "onNewInstance":{ "exeFunc":function, },
 *   "condition":{
 *     "exeFunc":function,
 *     "handInMethods":{
 *       "baskets":[ {"id":"...","textFunc":function,"openFunc":function}, ... ],
 *     },
 *   },
 *   "completion":{ "exeFunc":function, },
 *   "any other customized information": ANY
 * }
 * 
 * use DataManager.missions_template_add( opt , mission template ) to add new template
 * 
 * a mission instance = 
 * {
 *   "instanceId": positive_integer_number , // assigned by this API. the number may be reused. guarantees that each only exists at most 1 at a time.
 *   "templateId":"...", // used for getting the template
 *   "otherData":ANY
 * }
 * 
 * where each function above accepts a single argument which is an info for a mission instance
 * that is, for example, `func( mission instance )`
 * 
 * `$gameSystem.missions_current_add(templateId,otherData)` adds a new mission instance and returns instanceId
 * 
 * 
 * For example settings, see the end of the code.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Ui_missions";
const params=PluginManager.parameters(pluginName)||{};
params._isAddingExampleTemplates=JSON.parse(params.IsAddingExampleTemplates||"false");


// DataManager
// _missions_template_getCont() // get container
// missions_template_add( opt , template info )
// missions_template_get( opt , template id )
// missions_template_del( opt , template id )

// $gameSystem
// _missions_current_getCont() // get container
// missions_current_add( opt , template id , otherData ) -> instance id
// missions_current_get( opt , instance id ) // get complete info
// missions_current_chk( opt , instance id ) // check completion
// missions_current_del( opt , instance id )
// missions_current_getAllInstanceId(opt) // debug

// $gameTemp
// missions_current_show(opt,separator0,matchFunc1,separater1,matchFunc2,separater2,matchFunc3,...) // show missions list with missions that `matchFunc` returns true. show all if arguments.length===0
// // separator can be either undefined,String,Function.
// // matchFunc is a Function. It is called passing mission instance as the first argument.


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
undefined, // 3: rsv
[
(typeof(none)), // 4-0: func type
(typeof("")), // 4-1: string type
], // 4: separater types
undefined, // 5: new Set(t[4])
[], // 6: createAll_parseData - default filters
{isCalledFromMissionsScene:true,}, // 7: opt to hint it is called from the Scene
['mission','sep',], // 8: mission list symbols
[4,4,], // 9: scroll unit
[4,0.875,true,], // 10: $gameSystem.seEcho_opt_set
8, // 11: play delay when no seEcho
];
t[5]=new Set(t[4]);


new cfc(DataManager).
addBase('_missions_template_getCont',function f(){
	let rtv=this._missions_templateCont; if(!rtv) rtv=this._missions_templateCont=new Map();
	return rtv;
}).
addBase('missions_template_add',function f(opt,templateInfo){
	const cont=this._missions_template_getCont();
	for(let x=1,xs=arguments.length;x<xs;++x){
		cont.set(arguments[x].templateId,arguments[x]);
	}
	return this;
}).
addBase('missions_template_get',function f(opt,templateId){
	const cont=this._missions_template_getCont();
	return cont.get(templateId);
}).
addBase('missions_template_del',function f(opt,templateId){
	const cont=this._missions_template_getCont();
	cont.delete(templateId);
	return this;
}).
getP;

new cfc(Game_System.prototype).
addBase('_missions_current_getCont',function f(){
	let rtv=this._missions_currentCont; if(!rtv) rtv=this._missions_currentCont=[];
	return rtv;
}).
addBase('_missions_current_consumeSerail',function f(){
	const cont=this._missions_current_getCont();
	if(!cont._idSet){
		cont._idSet=new Map();
		cont._idSet._serialCurrMax|=0;
		cont._idSet._serialRecycled=[];
		cont.forEach(f.tbl[0],cont._idSet);
	}
	const arr=cont._idSet._serialRecycled;
	if(arr.length){
		const rtv=arr[0];
		arr.uniquePop(rtv);
		return rtv;
	}
	return cont._idSet._serialCurrMax+=1;
},[
function f(instanceInfo,i,a){
	// this===cont._idSet
	for(let x=this._serialCurrMax,xs=instanceInfo.id;++x<xs;){
		this._serialRecycled.uniquePush(x);
	}
	this._serialRecycled.uniquePop(instanceInfo.id); // out of order
	this._serialCurrMax=Math.max(this._serialCurrMax,instanceInfo.id)|0;
}, // 0: forEach
]).
addBase('_missions_current_recycleSerail',function f(serialNum){
	const cont=this._missions_current_getCont();
	cont._idSet._serialRecycled.uniquePush(serialNum);
}).
addBase('missions_current_add',function f(opt,templateId,otherData){
	const cont=this._missions_current_getCont();
	const templateInfo=templateId&&DataManager.missions_template_get(opt,templateId);
	if(!templateInfo) return;
	const res={
		instanceId:this._missions_current_consumeSerail(),
		templateId:templateId,
		otherData:otherData,
	};
	cont.push(res);
	cont._idSet.set(res.instanceId,res);
	
	const onNewInstance=templateInfo.onNewInstance;
	{
		const onNew_func=onNewInstance&&onNewInstance.exeFunc; if(f.tbl[4][0]===typeof onNew_func) onNew_func(res);
	}
	
	return res.instanceId;
},t).
addBase('_missions_current_get',function f(opt,instanceId){
	const cont=this._missions_current_getCont();
	return cont._idSet.get(instanceId);
}).
addBase('missions_current_getTemplateId',function f(opt,instanceId){
	const res=this._missions_current_get(opt,instanceId);
	return res&&res.templateId;
}).
addBase('missions_current_getTemplate',function f(opt,instanceId){
	return DataManager.missions_template_get(opt,this.missions_current_getTemplateId(opt,instanceId));
}).
addBase('missions_current_getInstanceAndTemplate',function f(opt,instanceId){
	return ({
		instance:this._missions_current_get(opt,instanceId),
		template:this.missions_current_getTemplate(opt,instanceId),
	});
}).
addBase('missions_current_getTitle',function f(opt,instanceId){
	const res=this.missions_current_getInstanceAndTemplate(opt,instanceId);
	const func=res.template&&res.template.titleFunc;
	return func(res.instance);
}).
addBase('missions_current_getDescription',function f(opt,instanceId){
	const res=this.missions_current_getInstanceAndTemplate(opt,instanceId);
	const func=res.template&&res.template.descriptionFunc;
	return func(res.instance);
}).
addBase('missions_current_getOtherData',function f(opt,instanceId){
	const res=this._missions_current_get(opt,instanceId);
	return res&&res.otherData;
}).
addBase('missions_current_chkOk',function f(opt,instanceId){
	const res=this.missions_current_getInstanceAndTemplate(opt,instanceId);
	const exeFunc=res.template&&res.template.condition&&res.template.condition.exeFunc;
	if(exeFunc&&exeFunc(res.instance)) return true;
}).
addBase('missions_current_complete',function f(opt,instanceId){
	const res=this.missions_current_getInstanceAndTemplate(opt,instanceId);
	const exeFunc=res.template&&res.template.completion&&res.template.completion.exeFunc;
	if(exeFunc){
		exeFunc(res.instance);
		this.missions_current_del(opt,res.instance.instanceId);
	}
}).
addBase('missions_current_del',function f(opt,instanceId){
	const cont=this._missions_current_getCont();
	let idx=-1;
	for(let x=0,xs=cont.length;x<xs;++x){
		if(cont[x].instanceId===instanceId){
			idx=x;
			break;
		}
	}
	if(idx>=0){
		this._missions_current_recycleSerail(cont[idx].instanceId);
		cont._idSet.delete(instanceId);
		return cont.splice(idx,1)[0];
	}
}).
addBase('missions_current_getAllInstanceId',function f(){
	const cont=this._missions_current_getCont();
	return cont.map(f.tbl[0]);
},[
instanceInfo=>instanceInfo.instanceId, // 0: 
]).
getP;

new cfc(Game_Temp.prototype).
addBase('missions_current_show',function f(opt,separator0,matchFunc1){
	// recommend using Function.apply
	const cont=$gameSystem._missions_current_getCont();
	const arr=this._missions_showList_filters=[];
	for(let x=1,xs=arguments.length;x<xs;x+=2){
		let sep=arguments[x];
		const func=arguments[x+1];
		if(sep&&f.tbl[5].has(typeof(sep))){
			if(f.tbl[4][0]===typeof(sep)) sep=sep();
			arr.push(sep);
		}
		if(f.tbl[4][0]===typeof(func)){
			arr.push(func);
		}
	}
	
	this._missions_showList_opt=opt;
	SceneManager.push(Scene_Missions);
},t).
getP;


{
const a=class Window_MissionsList extends Window_Command{
};
window[a.name]=a;
new cfc(a.prototype).
addWithBaseIfNotOwn('initialize',function f(x,y,itemList,opt){
	const rtv=f.ori.apply(this,arguments);
	this._hiddenZones={};
	this._initData_itemList=itemList;
	this._initData_opt=opt;
	this.resetItems();
	this._drawTextExStartOffsetXTimer=0;
	this.refresh();
	return rtv;
}).
addBase('resetItems',function f(){
	this.clearCommandList();
	const itemList=this._initData_itemList;
	const opt=this._initData_opt;
	for(let x=0,xs=itemList&&itemList.length,currZone=-1;x<xs;++x){
		if(f.tbl[4][1]===typeof itemList[x]){
			// separator
			currZone=x;
			this.addCommand(
				itemList[x],
				f.tbl[8][1],
				undefined,
				currZone,
			);
		}else{
			if(currZone in this._hiddenZones) continue;
			this.addCommand(
				$gameSystem.missions_current_getTitle(opt,itemList[x].instanceId),
				f.tbl[8][0],
				undefined,
				itemList[x].instanceId,
			);
		}
	}
},t).
addBase('refresh',function f(){
	this.createContents();
	Window_Selectable.prototype.refresh.call(this);
}).
addBase('refresh_drawDescription',function f(idx){
	if(idx===undefined) idx=this.index();
	const wndD=this._descriptionWindow;
	if(!wndD) return; // init not done
	wndD.clear_recreateContentsIfOriginallySmaller();
	if(this.commandSymbol(idx)!==f.tbl[8][0]) return;
	const opt=undefined;
	wndD.drawTextEx(
		$gameSystem.missions_current_getDescription(opt,this.commandExt(idx)),
		-wndD._scrollX,-wndD._scrollY,
	);
	wndD.lastScrollX=wndD._scrollX;
	wndD.lastScrollY=wndD._scrollY;
},t).
addBase('onNewSelect',function f(){
	this.onNewSelect_drawDescription();
}).
addBase('onNewSelect_drawDescription',function f(){
	const wndD=this._descriptionWindow;
	if(!wndD) return; // init not done
	wndD._scrollX=0;
	wndD._scrollY=0;
	this.refresh_drawDescription();
}).
addBase('toggleZone',function f(idx){
	if(idx===undefined) idx=this.index();
	if(this.commandSymbol(idx)!==f.tbl[8][1]) return;
	const zoneId=this.commandExt(idx);
	if(zoneId in this._hiddenZones) delete this._hiddenZones[zoneId];
	else this._hiddenZones[zoneId]=true;
	this.resetItems();
	this.refresh();
},t).
getP;
}

{
const a=class Window_MissionsDescription extends Window_Base{
};
window[a.name]=a;
new cfc(a.prototype).
addWithBaseIfNotOwn('initialize',function f(x,y,w,h){
	const rtv=f.ori.apply(this,arguments);
	this._scrollX=0;
	this._scrollY=0;
	this._lastScrollX=0;
	this._lastScrollY=0;
	return rtv;
}).
addWithBaseIfNotOwn('activate',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.contents && this.setCursorRect(0,0,this.contents.width,this.contents.height);
	return rtv;
}).
addWithBaseIfNotOwn('deactivate',function f(){
	const rtv=f.ori.apply(this,arguments);
        this.setCursorRect(0,0,0,0);
	return rtv;
}).
addWithBaseIfNotOwn('refresh',function f(){
	return f.ori.apply(this,arguments);
}).
getP;
}

{
const a=class Scene_Missions extends Scene_MenuBase{
};
window[a.name]=a;
new cfc(a.prototype).
addWithBaseIfNotOwn('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.init();
	return rtv;
}).
addBase('init',function f(){
	this._state='itemList'; // cursor position // others: 'detail'
},t).
addWithBaseIfNotOwn('create',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.createAll();
	return rtv;
}).
addBase('getRoot',function f(){
	return this._root;
}).
addBase('createAll',function f(){
	this.createAll_parseData();
	this.createAll_root();
	this.createWindow_itemListWindow();
	this.createWindow_descriptionWindow();
	this.createAll_finalTune();
}).
addBase('createAll_parseData',function f(){
	// get data from $gameTemp._missions_showList_*
	this._missionsList_opt=$gameTemp._missions_showList_opt;
	const filters=this._missionsList_filters=$gameTemp._missions_showList_filters||f.tbl[6];
	const arr=this._missionsList_list=[];
	const cont=$gameSystem._missions_current_getCont();
	for(let x=0,xs=filters.length;x<xs;++x){
		if(f.tbl[4][0]===typeof filters[x]) arr.concat_inplace(cont.filter(filters[x]));
		else arr.push(filters[x]);
	}
},t).
addBase('createAll_root',function f(){
	this.addChild(this._root=new Sprite());
}).
addBase('createWindow_itemListWindow',function f(){
	const sp=this._itemListWindow=new Window_MissionsList(0,0,this._missionsList_list,this._missionsList_opt);
	sp._scene=this;
	this.getRoot().addChild(sp);
}).
addBase('createWindow_itemListWindow_okHandler',function f(){
	// bind `this` to the scene
	this._itemListWindow.activate();
}).
addBase('createWindow_itemListWindow_onclick_separator',function f(){
	// bind `this` to the scene
	this._itemListWindow.toggleZone();
	this._itemListWindow.activate();
}).
addBase('createWindow_itemListWindow_onclick_mission',function f(){
	// bind `this` to the scene
	this.changeUiState_focusOnDescriptionWnd();
}).
addBase('createWindow_descriptionWindow',function f(){
	const sp=this._descriptionWindow=new Window_MissionsDescription();
	this.getRoot().addChild(sp);
}).
addBase('createWindow_descriptionWindow_refreshContents',function f(){
	;
}).
addBase('createAll_finalTune',function f(){
	// link
	this._itemListWindow._descriptionWindow=this._descriptionWindow; // as help window
	//this._descriptionWindow.refreshHelp=this.createWindow_descriptionWindow_refreshHelp;
	// input
	this._itemListWindow.deactivate();
	this._descriptionWindow.deactivate();
	this._itemListWindow.setHandler('cancel',this.popScene.bind(this));
	this._itemListWindow.setHandler('ok',this.createWindow_itemListWindow_okHandler.bind(this));
	this._itemListWindow.setHandler('sep',this.createWindow_itemListWindow_onclick_separator.bind(this));
	this._itemListWindow.setHandler('mission',this.createWindow_itemListWindow_onclick_mission.bind(this));
	// re-adjust loc
	//   this._missionsList_opt
	const itemListWindowPos={
		x:0,
		y:0,
		width:Graphics.width>>2,
		height:Graphics.height,
	};
	const descriptionWindowPos={
		x:itemListWindowPos.x+itemListWindowPos.width,
		y:0,
		width:Graphics.width-itemListWindowPos.width,
		height:Graphics.height,
	};
	this._itemListWindow.position.set(itemListWindowPos.x,itemListWindowPos.y);
	this._itemListWindow.width=itemListWindowPos.width;
	this._itemListWindow.height=itemListWindowPos.height;
	this._descriptionWindow.position.set(descriptionWindowPos.x,descriptionWindowPos.y);
	this._descriptionWindow.width=descriptionWindowPos.width;
	this._descriptionWindow.height=descriptionWindowPos.height;
	this._itemListWindow.createContents();
	this._descriptionWindow.createContents();
	// display
	this._itemListWindow.refresh();
	this._itemListWindow.refresh_drawDescription();
	//this._descriptionWindow.refresh(); // Window_Base has no such method
	this._itemListWindow.reselect();
	this._itemListWindow.activate();
}).
addWithBaseIfNotOwn('changeUiState_focusOnItemWnd',function f(){
	this._descriptionWindow.deactivate();
	this._itemListWindow.activate();
	this._state='itemList';
}).
addWithBaseIfNotOwn('changeUiState_focusOnDescriptionWnd',function f(){
	this._itemListWindow.deactivate();
	this._descriptionWindow.activate();
	this._state='description';
}).
addWithBaseIfNotOwn('update',function f(){
	this.update_handleDescriptionScroll.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addWithBaseIfNotOwn('update_handleDescriptionScroll',function f(){
	if(!this._descriptionWindow.active) return;
	const wnd=this._descriptionWindow;
	this._update_handleDescriptionScroll_handleInputs.apply(this,arguments);
	let shouldRedraw=false;
	{
		// scroll
		if(wnd._scrollX!==wnd._lastScrollX||wnd._scrollY!==wnd._lastScrollY){
			wnd._lastScrollX=wnd._scrollX;
			wnd._lastScrollY=wnd._scrollY;
			shouldRedraw=true;
			this.update_handleDescriptionScroll_playScrollSe(true);
		}else{
			this.update_handleDescriptionScroll_playScrollSe(false);
		}
		// update per-frame effects
		{
			
		}
	}
	if(shouldRedraw){
		this._itemListWindow.refresh_drawDescription();
	}
}).
addWithBaseIfNotOwn('_update_handleDescriptionScroll_handleInputs',function f(){
	const wnd=this._descriptionWindow;
	const shiftPressed=Input.isPressed('shift');
	const ctrlPressed=Input.isPressed('control');
	let dLR=(Input.isPressed('right')-Input.isPressed('left'))*f.tbl[9][0];
	let dUD=(Input.isPressed('down')-Input.isPressed('up'))*f.tbl[9][1];
	dLR+=TouchInput.wheelX;
	dUD+=TouchInput.wheelY;
	dUD+=wnd.contentsHeight()*(Input.isTriggered('pagedown')-Input.isTriggered('pageup'));
	dLR<<=shiftPressed;
	dUD<<=shiftPressed;
	if(TouchInput.isPressed()){
		let dd=this._update_handleDescriptionScroll_handleInputs_draggingData;
		if(!dd) dd=this._update_handleDescriptionScroll_handleInputs_draggingData={x:TouchInput.x,y:TouchInput.y,};
		dLR+=dd.x-TouchInput.x;
		dUD+=dd.y-TouchInput.y;
		dd.x=TouchInput.x;
		dd.y=TouchInput.y;
	}else this._update_handleDescriptionScroll_handleInputs_draggingData=undefined;
	wnd._scrollX=Math.max(0,wnd._scrollX+dLR);
	wnd._scrollY=Math.max(0,wnd._scrollY+dUD);
	if(Input.isPressed('home')){
		wnd._scrollY=0;
		if(ctrlPressed) wnd._scrollX=0;
	}
	if(TouchInput.isCancelled()||Input.isPressed('cancel')){
		Input.update();
		TouchInput.update();
		SoundManager.playCancel();
		this.changeUiState_focusOnItemWnd();
	}
},t).
addWithBaseIfNotOwn('update_handleDescriptionScroll_playScrollSe',function f(shouldPlay){
	const lastTimePlayed=this._handleDescriptionScroll_playScrollSe_lastTimePlayed;
	if(!shouldPlay) this._handleDescriptionScroll_playScrollSe_lastTimePlayed=undefined;
	const hasSeEcho=$gameSystem&&$gameSystem.seEcho_opt_get;
	const canPlay=lastTimePlayed==null||(!hasSeEcho&&lastTimePlayed+f.tbl[11]<Graphics.getSceneFrameCnt());
	const seEchoBak=canPlay&&hasSeEcho&&$gameSystem.seEcho_opt_get();
	if(hasSeEcho){
		$gameSystem.seEcho_opt_set({delayFrame:f.tbl[10][0],nextVolRate:f.tbl[10][1],affectStaticSe:f.tbl[10][2],});
	}
	if(shouldPlay&&canPlay){
		this._handleDescriptionScroll_playScrollSe_lastTimePlayed=Graphics.getSceneFrameCnt();
		this._itemListWindow.playCursorSe();
	}
	if(hasSeEcho){
		if(seEchoBak) $gameSystem.seEcho_opt_set(seEchoBack);
		else $gameSystem.seEcho_opt_clear();
	}
},t).
getP;
}


DataManager.missions_template_addTestMission=()=>{
if(DataManager.missions_template_get("--plugin-examples-1")) return;
const consoleLogCompletedMsg=info=>{
	console.log('instance',info.instanceId,'which uses template',info.templateId,'completed');
};
DataManager.
missions_template_add(undefined,{
	"templateId":"--plugin-examples-1",
	"titleFunc":()=>"Example-1",
	"descriptionFunc":()=>"This is Example-1.\n This mission's condition has always been completed.",
	"condition":{
		"exeFunc":()=>true,
	},
	"completion":{ "exeFunc":consoleLogCompletedMsg, },
}).
missions_template_add(undefined,{
	"templateId":"--plugin-examples-2",
	"titleFunc":info=>"Example-2 "+info.otherData.timeToComplete,
	"descriptionFunc":info=>{
		let s="this is ";
		s+=$gameSystem.missions_current_getTitle(undefined,info.instanceId);
		s+='.';
		s+='\n';
		const n=Math.max(Math.ceil((info.otherData.timeToComplete-Graphics.getSceneFrameCnt())/60.0),0);
		s+=" This mission can be completed after "+n+" seconds.";
		s+='\n';
		s+="otherData.timeToComplete="+info.otherData.timeToComplete;
		return s;
	},
	"onNewInstance":{
		"exeFunc":info=>{
			if(!info.otherData) info.otherData={};
			info.otherData.timeToComplete=Graphics.getSceneFrameCnt()+6e2;
		},
	},
	"condition":{
		"exeFunc":info=>{
			if(!info.otherData) info.otherData={timeToComplete:0,};
			return Graphics.getSceneFrameCnt()>=info.otherData.timeToComplete;
		},
		"handInMethods":{
			"baskets":[ {"id":"...","textFunc":()=>{},"openFunc":()=>{},}, ],
		},
	},
	"completion":{ "exeFunc":consoleLogCompletedMsg, },
}).
missions_template_add;
};
if(params._isAddingExampleTemplates){
DataManager.missions_template_addTestMission();
}

})();

