"use strict";
/*:
 * @plugindesc Much more useful timer
 * @author agold404
 * @help $gameTimer.pause(); / $gameTimer.resume(); / $gameTimer.setInc(); / $gameTimer.setDec(); / $gameTimer.start(strtC,isInc,paused);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_Timer.prototype).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._paused=false;
	this._isInc=false;
	return rtv;
}).add('pause',function f(){
	this._paused=true;
}).add('resume',function f(){
	this._paused=false;
}).add('setInc',function f(){
	this._isInc=true;
}).add('setDec',function f(){
	this._isInc=false;
}).add('start',function f(count,isInc,paused){
	const rtv=f.ori.apply(this,arguments);
	this._paused=!!paused;
	this._isInc=!!isInc;
	const sc=SceneManager._scene;
	const sps=sc&&sc._spriteset;
	const sp=sps&&sps._timerSprite;
	if(sp) sp.redraw();
	return rtv;
}).add('update',function f(sceneActive){
	if(sceneActive && this._working && !this._paused){
		if(this._isInc) ++this._frames;
		else if(0<this._frames){
			--this._frames;
			if(this._frames===0) this.onExpire();
		}
	}
},undefined,false,true);

})();
