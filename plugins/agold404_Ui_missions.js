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
[], // 6: createAll_parseData - default list
{isCalledFromMissionsScene:true,}, // 7: opt to hint it is called from the Scene
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
	const cont=this._missions_current_getCont();
	const arr=this._missions_showList_list=[];
	for(let x=1,xs=arguments.length;x<xs;x+=2){
		let sep=arguments[x];
		const func=arguments[x+1];
		if(f.tbl[5].has(typeof(sep))){
			if(f.tbl[4][0]===typeof(sep)) sep=sep();
			arr.push(sep);
		}
		if(f.tbl[4][0]===typeof(func)){
			arr.concat_inplace(cont.filter(func));
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
addWithBaseIfNotOwn('initialize',function f(x,y,allList){
	const rtv=f.ori.apply(this,arguments);
	this.initSel(allList);
	this._drawTextExStartOffsetXTimer=0;
	this.refresh();
	return rtv;
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
	this._state='itemList'; // 'amounts'
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
	const arr=this._missionsList_list=$gameTemp._missions_showList_list||f.tbl[6];
	return;
	this._missionsList_isSeparator=[];
	for(let x=0,xs=arr.length;x<xs;++x){
		this._missionsList_isSeparator[x]=f.tbl[4][1]===typeof arr[x];
		continue;
		if(f.tbl[4][1]===typeof arr[x]){
			this._missionsList_isSeparator[x]=true;
			this._missionsList_isCompleted[x]=false;
			this._missionsList_title[x]=arr[x];
		}else{
			this._missionsList_isCompleted[x]=$gameSystem.missions_current_chkOk(opt,arr[x].instanceId);
			this._missionsList_title[x]=$gameSystem.missions_current_getTitle(opt,arr[x].instanceId);
		}
	}
},t).
addBase('createAll_root',function f(){
	this.addChild(this._root=new Sprite());
}).
addBase('createWindow_itemListWindow',function f(){
	const sp=this._itemListWindow=new Window_MissionsList(0,0,this._missionsList_list,this._missionsList_opt);
	this.getRoot().addChild(sp);
}).
addBase('createWindow_itemListWindow_okHandler',function f(){
	// bind `this` to scene
}).
addBase('createWindow_desciptionWindow',function f(){
	const sp=this._desciptionWindow=new Window_Base();
	this.getRoot().addChild(sp);
}).
addBase('createWindow_desciptionWindow_refreshContents',function f(){
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
	// re-adjust loc
	//   this._missionsList_opt
	const itemListWindowPos={
		x:0,
		y:0,
		width:Graphics.width>>1,
		height:Graphics.height,
	};
	const descriptionWindowPos={
		x:itemListWindowPos.x+itemListWindowPos.width,
		y:0,
		width:Graphics.width>>1,
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
	this._descriptionWindow.refresh();
	this._itemListWindow.reselect();
	this._itemListWindow.activate();
}).
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
	"titleFunc":()=>"Example-2",
	"descriptionFunc":info=>{
		let s="this is ";
		s+=$gameSystem.missions_current_getTitle(undefined,info.instanceId);
		s+='.';
		s+='\n';
		const n=Math.max(Math.ceil((info.otherData.timeToComplete-Graphics.getSceneFrameCnt())/60.0),0);
		s+=" This mission can be completed after "+n+" seconds.";
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

