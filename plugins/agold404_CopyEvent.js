"use strict";
/*:
 * @plugindesc 複製事件
 * @author agold404
 * @help $gameMap.cpevt(evtId,x,y,direction=undefined);
 * $gameMap.cpevtFromTemplate(evtIdOnTheTemplateMap,x,y,direction=undefined);
 * $gameMap.cpevtFromIdTemplate(id,evtIdOnTheTemplateMap,x,y,direction=undefined);
 * 
 * 回傳值皆為玩家所在的地圖上的新增事件的 id 。
 * 
 * template map path: 指定的地圖檔案路徑，預設空字串。只要不是填空字串，都會在一開始遊戲時去讀取，
 * 沒讀到就不能使用 $gameMap.cpevtFromTemplate ， playtest 時會在遊戲一開始讀取沒讀到時，以 alert 來提醒沒讀到。
 * 例如填 data/Map001.json 
 * 
 * template map ids: 指定一堆地圖 id 當模板，預設沒東西。
 * 在 $gameMap.cpevtFromIdTemplate 中第一欄填地圖 id 。
 * 在遊戲一開始讀取沒讀到時，以 alert 來提醒沒讀到。
 * 在遊戲中使用沒設定為模板的地圖時，以 alert 來提醒沒讀到。
 * 
 * 
 * @param TemplateMapPath
 * @type text
 * @text template map path
 * @desc map path for using as the template map
 * 
 * @param TemplateMapIds
 * @type number[]
 * @text template map ids
 * @desc map ids for using as a template map
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_CopyEvent";
const params=PluginManager.parameters(pluginName)||{};
params._templateMapPath=params.TemplateMapPath||"";
params._templateMapIdPaths=[...new Set(JSON.parse(params.TemplateMapIds||"[]").map(x=>x|0))].sort(cmpFunc_num).map(x=>["data/Map"+(""+x).padStart(3,'0')+".json",x]);

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

new cfc(Game_System.prototype).
addBase('cpevt_loadevt',function(mapid){
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
	if(!DataManager._templateMapData) return f.tbl[3]&&alert(f.tbl[2].noTemplate);
	const evtd=DataManager._templateMapData.events[evtid];
	const idx=$dataMap.events.push(evtd)-1;
	arguments[0]=idx;
	const rtv=this.cpevt.apply(this,arguments);
	arguments[0]=evtid;
	return rtv;
},t).
addBase('cpevtFromIdTemplate',function f(mapid,evtid,x,y,d){
	const mapd=DataManager._templateMapIdsData[mapid];
	if(!mapd) return f.tbl[3]&&alert(f.tbl[2].noTemplate+": "+mapid);
	const evtd=mapd.events[evtid];
	const idx=$dataMap.events.push(evtd)-1;
	const args=[...arguments].slice(1);
	args[0]=idx;
	return this.cpevt.apply(this,args);
},t).
getP;

new cfc(Game_Event.prototype).add('update',function f(){
	return this.event()&&f.ori.apply(this,arguments);
}).add('findProperPageIndex',function f(){
	return this.event()?f.ori.apply(this,arguments):-1;
});


new cfc(Scene_Boot.prototype).
add('start',function f(){
	this.cpevt_loadTemplateMaps();
	return f.ori.apply(this,arguments);
}).
addBase('cpevt_loadTemplateMaps',function f(){
	if(f.tbl[1]._templateMapPath) ImageManager.otherFiles_addLoad(f.tbl[1]._templateMapPath);
	for(let arr=f.tbl[1]._templateMapIdPaths,xs=arr.length,x=0;x!==xs;++x) ImageManager.otherFiles_addLoad(arr[x][0]);
},t).
addBase('cpevt_parseLoadedTemplateMaps',function f(){
if(f.tbl[1]._templateMapPath){
	const raw=ImageManager.otherFiles_getData(f.tbl[1]._templateMapPath);
	const isTest=f.tbl[3];
if(raw===undefined) isTest&&alert(f.tbl[2].notFound+": "+f.tbl[1]._templateMapPath);
else{
	const oriMap=$dataMap;
	try{
		$dataMap=DataManager._templateMapData=JSON.parse(raw);
		DataManager.onLoad($dataMap,'$dataMap',f.tbl[1]._templateMapPath,'cpevt',);
	}catch(e){
		isTest&&alert(f.tbl[2].notJson+": "+f.tbl[1]._templateMapPath);
	}
	$dataMap=oriMap;
}
} // ._templateMapPath

// ._templateMapIdPaths BEG
	DataManager._templateMapIdsData={};
	const oriMap=$dataMap;
	for(let arr=f.tbl[1]._templateMapIdPaths,xs=arr.length,x=0;x!==xs;++x){
		const raw=ImageManager.otherFiles_getData(arr[x][0]);
if(raw===undefined) isTest&&alert(f.tbl[2].notFound+": "+arr[x][0]);
else{
		try{
			$dataMap=DataManager._templateMapIdsData[arr[x][1]]=JSON.parse(raw);
			DataManager.onLoad($dataMap,'$dataMap',arr[x][0],'cpevt',);
		}catch(e){
			isTest&&alert(f.tbl[2].notJson+": "+arr[x][0]);
		}
}
	}
	$dataMap=oriMap;
// ._templateMapIdPaths END
},t).
add('terminate',function f(){
	this.cpevt_parseLoadedTemplateMaps();
	return f.ori.apply(this,arguments);
}).
getP;

})();
