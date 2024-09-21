"use strict";
/*:
 * @plugindesc 讓事件可以只穿透事件而不穿透玩家、可在note區設定一事件是否不因離畫面太遠而不行動
 * @author agold404
 *
 * @help this plugin let you set events through only events but not player (nor followers), or also players and followers
 * 
 * syntax: write <throughEventsAll> in note of a event
 * this will let the event can be through all events
 * 
 * syntax: write <throughEventsOnlyOnTags:A_USER_DEFINED_STRING ANOTHER_USER_DEFINED_STRING ...> in note of a event (space separated)
 * this will let the event can be through all events having same 'meta.throughEventsOnlyOnTags' (leaving it empty can be a classification) in notes only
 * leave empty like <throughEventsOnlyOnTags:> for no tags.
 * syntax: write <throughEventsMyTag:A_USER_DEFINED_STRING> in note of a event to set an event's tag to get through by others
 * leave empty like <throughEventsMyTag:> for no tag.
 * <throughPlayers> can go through player
 * 
 * remember to uncheck "through"
 *
 *
 * This plugin can be renamed as you want.
 * 
 * TODO: setting by pages 
 */

(()=>{ let k,r,t;

new cfc(Game_Event.prototype).add('setupPageSettings',function f(){
	const page=f.ori.apply(this,arguments);
	this.setThroughEvents(page);
	return page;
}).add('setThroughEvents',function f(page){
	const meta=this.getMeta();
	this._throughEvents_player=getPropertyValue(meta,'throughPlayers',false);
	this._throughEvents_allEvents=getPropertyValue(meta,'throughEventsAll',false);
	this._throughEvents_myTag=getPropertyValue(meta,'throughEventsMyTag',undefined);
	{
		const tagStr=meta.throughEventsOnlyOnTags;
		page._throughEventsOnlyOnTags=page._throughEventsOnlyOnTags||(tagStr!=null&&tagStr.split&&(tagStr?tagStr.split(' '):f.tbl[0]))||f.tbl[0];
	}
	this._throughEvents_onlyOnTags=getPropertyValue(page,'_throughEventsOnlyOnTags',f.tbl[0]).slice();
},[
[], // 0: empty
'throughPlayers',
'throughEventsAll',
'throughEventsMyTag',
'throughEventsOnlyOnTags',
]).add('isCollidedWithPlayerCharacters',function f(x,y){
	return this.isCollidedWith_isThroughPlayers()?false:f.ori.apply(this,arguments);
}).add('isCollidedWith_isThroughPlayers',function f(){
	return this._throughEvents_player;
}).add('isCollidedWith_throughEvents_isThroughAllEvents',function f(){
	return this._throughEvents_allEvents;
}).add('isCollidedWith_throughEvents_getMyTag',function f(){
	return this._throughEvents_myTag;
}).add('isCollidedWith_throughEvents_getThroughTags',function f(){
	return this._throughEvents_onlyOnTags;
}).add('isCollidedWithEvents',function f(x,y){
	if(this.isCollidedWith_throughEvents_isThroughAllEvents()) return false;
	const tags=this.isCollidedWith_throughEvents_getThroughTags();
	if(tags) return $gameMap.eventsXyNt(x,y).some(f.tbl[0].bind(this,tags,));
	return f.ori.apply(this,arguments);
},[
function f(tags,evt){
	return this!==evt&&!tags.uniqueHas(evt.isCollidedWith_throughEvents_getMyTag());
}, // 0: some collided
],true);

const p=Game_Player.prototype;
new cfc(p).add('isCollidedWithEvents',p.isCollidedWithEvents===Game_Character.prototype.isCollidedWithEvents?function f(x,y){
	const res=Game_Character.prototype.isCollidedWithEvents.apply(this,arguments);
	return res && $gameMap.eventsXyNtNp(x,y).some(f.tbl[0]);
}:function f(x,y){
	const res=f.ori.apply(this,arguments);
	return res && $gameMap.eventsXyNtNp(x,y).some(f.tbl[0]);
},[
evt=>!evt.isCollidedWith_isThroughPlayers(),
]);

})();
