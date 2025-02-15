"use strict";
/*:
 * @plugindesc let an event can be triggered by another event.
 * @author agold404
 * 
 * @help in event's note: <triggeredByEvents>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_EventTriggersEvents";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined,
params, // 1: plugin params
function(evt){
	if(!evt.isStarting()&&evt.getMeta().triggeredByEvents) evt.start(this);
}, // 2: forEach events start
];

new cfc(Game_Event.prototype).
addBase('startEventAt',function f(x,y,p){
	$gameMap.eventsXy(x,y,p).forEach(f.tbl[2],this);
},t).
add('updateMove_1stepDone',function f(){
	this.startEventAt(this.x,this.y,0);
	this.startEventAt(this.x,this.y,2);
	return f.ori.apply(this,arguments);
}).
add('moveFailOn',function f(lastX,lastY,d){
	const x=$gameMap.roundXWithDirection(lastX,d);
	const y=$gameMap.roundYWithDirection(lastY,d);
	this.startEventAt(x,y,1);
	return f.ori.apply(this,arguments);
}).
add('updateJump_1stepDone',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.startEventAt(this.x,this.y,0);
	this.startEventAt(this.x,this.y,2);
	return rtv;
}).
getP;


})();
