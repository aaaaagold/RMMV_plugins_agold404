"use strict";
/*:
 * @plugindesc get event can be triggered when overlapped with player and player hits OK.
 * @author agold404
 * @help use comment (event command)
 * write (at-sign)TRIGGERHERE
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(DataManager).add('onLoad_after_map',function f(obj){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_after_map_setTriggerHere(obj);
	return rtv;
}).add('onLoad_after_map_setTriggerHere',function f(obj){
	obj.events.forEach(f.tbl[0]);
},t=[
evtd=>{ if(!evtd) return;
	for(let p=0,pgv=evtd.pages,pe=pgv.length;p!==pe;++p){
		for(let c=0,cmdv=pgv[p].list,ce=cmdv.length;c!==ce;++c){
			if(cmdv[c].code===108 && cmdv[c].parameters[0]==="@TRIGGERHERE"){
				pgv[p].triggerHere=true;
				break;
			}
		}
	}
},
]);

new cfc(Game_Event.prototype).add('isTriggerIn',function f(triggers){
	return triggers._here?this._triggerHere&&(Input.isTriggered(f.tbl[0])||TouchInput.isTriggered(f.tbl[0])):f.ori.apply(this,arguments);
},[
'ok',
]).add('setupPageSettings',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.triggerHere_set(rtv&&rtv.triggerHere);
	return rtv;
}).add('triggerHere_set',function(val){
	this._triggerHere=val;
	return this;
},undefined,true,true);

new cfc(Game_Player.prototype).add('checkEventTriggerHere',function f(triggers){
	this.checkEventTrigger_triggerHere(this.x,this.y,triggers);
	return f.ori.apply(this,arguments);
}).add('checkEventTriggerTouch',function f(x,y){
	this.checkEventTrigger_triggerHere(x,y,[0,]);
	return f.ori.apply(this,arguments);
}).add('checkEventTrigger_triggerHere',function f(x,y,triggers){
	if(this.x===x&&this.y===y&&this.canStartLocalEvents()) this.checkEventTrigger_triggerHere_do(x,y,triggers);
},undefined,true,true).add('checkEventTrigger_triggerHere_do',function f(x,y,triggers){
	const ori=triggers._here;
	triggers._here=true;
	this.startMapEvent(x,y,triggers,true);
	triggers._here=ori;
},undefined,true,true);

})();
