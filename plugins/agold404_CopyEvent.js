"use strict";
/*:
 * @plugindesc 複製事件
 * @author agold404
 * @help $gameMap.cpevt(evtId,x,y,direction=undefined);
 * $gameMap.cpevtFromTemplate(evtIdOnTheTemplateMap,x,y,direction=undefined);
 * 
 * 回傳值皆為玩家所在的地圖上的新增事件的 id 。
 * 
 * template map path: 指定的地圖檔案路徑，預設空字串。只要不是填空字串，都會在一開始遊戲時去讀取，
 * 沒讀到就不能使用 $gameMap.cpevtFromTemplate ， playtest 時會在遊戲一開始讀取沒讀到時，以 alert 來提醒沒讀到。
 * 例如填 data/Map001.json 
 * 
 * 
 * @param TemplateMapPath
 * @type text
 * @text template map path
 * @desc map path for using as the template map
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_CopyEvent";
const params=PluginManager.parameters(pluginName)||{};
params._templateMapPath=params.TemplateMapPath||"";

t=[
undefined,
params, // 1: plugin params
{
notFound:"[WARNING] template map not found",
notJson:"[ERROR] template map source data is not JSON format",
noTemplate:"[ERROR] template map not loaded",
}, // 2: err msg
Utils.isOptionValid('test'), // 3: isTest
];

new cfc(Game_System.prototype).add('cpevt_loadevt',function(mapid){
	if(!this._cpevt) this._cpevt={ mapid:0 , evts:[] , };
	if(this._cpevt.mapid!==mapid){
		this._cpevt.mapid=mapid;
		this._cpevt.evts.length=0;
	}
	for(let arr=this._cpevt.evts,x=arr.length;x--;){
		if($dataMap.events[arr[x].id]){
			const evts=$gameMap&&$gameMap._events;
			const oriId=arr[x].id;
			const newId=arr[x].id=Math.max($dataMap.events.length,evts&&evts.length||0);
			const evt=evts[oriId];
			if(evt){
				evt._eventId=newId;
				evts[oriId]=null;
				evts[newId]=evt;
			}
		}
		$dataMap.events[arr[x].id]=arr[x];
	}
	$gameSystem._cpevted=1;
});

new cfc(Scene_Map.prototype).add('onMapLoaded',function f(){
	$gameSystem._cpevted=undefined;
	return f.ori.apply(this,arguments);
}).add('createDisplayObjects',function f(){
	if(!$gameSystem._cpevted) $gameSystem.cpevt_loadevt($gameMap._mapId);
	$gameSystem._cpevted=undefined;
	return f.ori.apply(this,arguments);
});

new cfc(Game_Map.prototype).add('setup',function f(mapid){
	$gameSystem.cpevt_loadevt(mapid);
	return f.ori.apply(this,arguments);
}).add('cpevt',function f(evtid,x,y,d){
	// return new event's id
	const evtds=$dataMap.events;
	if(!evtds[evtid]) return; // no such event
	let newid=evtds.length|0; while(this._events[newid]) ++newid;
	{
		const newobjd=Object.assign({},evtds[evtid]);
		newobjd.id=newid;
		newobjd.x=x;
		newobjd.y=y;
		evtds[newid]=newobjd;
		$gameSystem._cpevt.evts.push(newobjd);
	}
	const newevt=new Game_Event(this._mapId,newid);
	if(d) newevt._direction=d;
	newevt._srcEvtId=evtid;
	this._events[newid]=newevt;
	let sc=SceneManager._scene,sp;
	if(sc.constructor===Scene_Map && (sp=sc._spriteset)){
		const spc=new Sprite_Character(newevt);
		sp._characterSprites.push(spc);
		sp._tilemap.addChild(spc);
	}
	return newid;
},undefined,true,true).
addBase('cpevtFromTemplate',function f(evtid,x,y,d){
	if(!DataManager._templateMapData) return f.tbl[3]&&alert(f.tbl[2].noTemplate)
	const evtd=DataManager._templateMapData.events[evtid];
	const idx=$dataMap.events.push(evtd)-1;
	arguments[0]=idx;
	const rtv=this.cpevt.apply(this,arguments);
	arguments[0]=evtid;
	return rtv;
},t).
getP;

new cfc(Game_Event.prototype).add('update',function f(){
	return this.event()&&f.ori.apply(this,arguments);
}).add('findProperPageIndex',function f(){
	return this.event()?f.ori.apply(this,arguments):-1;
});


new cfc(Scene_Boot.prototype).
add('start',function f(){
	this.cpevt_loadTemplateMap();
	return f.ori.apply(this,arguments);
}).
addBase('cpevt_loadTemplateMap',function f(){
	if(f.tbl[1]._templateMapPath) ImageManager.otherFiles_addLoad(f.tbl[1]._templateMapPath);
},t).
addBase('cpevt_parseLoadedTemplateMap',function f(){
	if(!f.tbl[1]._templateMapPath) return;
	const raw=ImageManager.otherFiles_getData(f.tbl[1]._templateMapPath);
	const isTest=f.tbl[3];
	if(raw===undefined) return isTest&&alert(f.tbl[2].notFound);
	try{
		DataManager._templateMapData=JSON.parse(raw);
	}catch(e){
		isTest&&alert(f.tbl[2].notJson);
	}
},t).
add('terminate',function f(){
	this.cpevt_parseLoadedTemplateMap();
	return f.ori.apply(this,arguments);
}).
getP;

})();
