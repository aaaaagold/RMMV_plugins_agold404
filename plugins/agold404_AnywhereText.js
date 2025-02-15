"use strict";
/*:
 * @plugindesc text anywhere api
 * @author agold404
 * 
 * @help $gameTemp.anywhereText(id,msg,x,y)
 * 
 * id is the id you give to the text.
 * msg is the content of the text.
 * x is the x location in the game screen.
 * y is the y location in the game screen.
 * 
 * if id not exists: create new
 * if msg is undefined: don't change msg (default "")
 * if msg is true: forced re-draw last
 * if x is undefined: don't change x (default 0)
 * if y is undefined: don't change y (default 0)
 * 
 * all texts will be disappeared after scene changed.
 * this includes: open menu, battle, load game, etc.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_AnywhereText";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined,
params, // 1: plugin params
];

new cfc(Game_Temp.prototype).addBase('anywhereText',function f(id,msg,x,y){
	const cont=this._anywhereText_getCont(),sc=SceneManager._scene;
	let sp=cont.get(id); if(!sp||sp.parent!==sc) sc.addChild(sp=this._anywhereText_createNew());
	if(sp.transform) sp.position.set(x===undefined?sp.x:x,y===undefined?sp.y:y);
	else cont._waitForPositioning.push([sp,x,y]);
	if(msg===true) sp._anywhereText_txt.reApplyText();
	else if(msg!==undefined) sp._anywhereText_txt.setText(msg);
	cont.set(id,sp);
}).addBase('_anywhereText_getCont',function f(){
	let rtv=this._anywhereText_cont; if(!rtv) (rtv=this._anywhereText_cont=new Map())._waitForPositioning=new Queue();
	return rtv;
}).addBase('_anywhereText_createNew',function f(){
	const sp=new Sprite();
	sp.addChild(sp._anywhereText_txt=new Window_Text());
	return sp;
});

new cfc(SceneManager).add('updateMain_final',function f(){
	this.updateMain_anywhereText_positioning();
	return f.ori.apply(this,arguments);
}).addBase('updateMain_anywhereText_positioning',function f(){
	if(!$gameTemp) return; // init is null
	const cont=$gameTemp._anywhereText_getCont();
	const q=cont._waitForPositioning;
	for(let ctr=q.length;ctr--;){
		const curr=q.front; q.pop(); if(!curr) continue;
		if(curr[0].transform) curr[0].position.set(curr[1]===undefined?curr[0].x:curr[1],curr[2]===undefined?curr[0].y:curr[2]);
		else q.push(curr);
	}
});


})();
