"use strict";
/*:
 * @plugindesc 複製事件
 * @author agold404
 * @help $gameMap.cpevt(evtId,x,y,direction=undefined);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_System.prototype).add('cpevt_loadevt',function(mapid){
	if(!this._cpevt) this._cpevt={ mapid:0 , evts:[] , };
	if(this._cpevt.mapid!==mapid){
		this._cpevt.mapid=mapid;
		this._cpevt.evts.length=0;
	}
	for(let x=0,arr=this._cpevt.evts;x!==arr.length;++x) $dataMap.events[arr[x].id]=arr[x];
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
		const newobjd=JSON.parse(JSON.stringify(evtds[evtid]));
		newobjd.id=newid;
		newobjd.x=x;
		newobjd.y=y;
		evtds[newid]=newobjd;
		$gameSystem._cpevt.evts.push(newobjd);
	}
	const newevt=new Game_Event(this._mapId,newid);
	if(d) newevt._direction=d;
	this._events[newid]=newevt;
	let sc=SceneManager._scene,sp;
	if(sc.constructor===Scene_Map && (sp=sc._spriteset)){
		const spc=new Sprite_Character(newevt);
		sp._characterSprites.push(spc);
		sp._tilemap.addChild(spc);
	}
	return newid;
});

new cfc(Game_Event.prototype).add('update',function f(){
	return this.event()&&f.ori.apply(this,arguments);
});

})();
