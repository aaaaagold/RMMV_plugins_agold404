"use strict";
/*:
 * @plugindesc set camera chasing
 * @author agold404
 * @help $gameMap.cameraChasing_set(chr,smoothFrames,sineFrames,delayFrames);
 * chr: the player or an event
 * smoothFrames: takes locations in how many frames
 *    |= 0 at the start
 *   if < 0 : clear cameraChasing setting
 *   if > 0 : takes `smoothFrames` frames
 *   if == 0 : takes 1 frame and clear cameraChasing setting after sineFrames+delayFrames frames
 * sineFrames: the newest frame will reference init_display_xy (i.e. _displayX and _displayY from the function is called) with a smoothly-sine-wave ratio from 1 to 0
 *    |= 0 at the start
 *   if < 0 : = 0
 *   ratio = (1-cos(PI*Math.min(frames_current/sineFrames,1)))*0.5
 *   current display x,y = (final_display_xy - init_display_xy) * ratio + init_display_xy
 * delayFrames: delays above operation
 *    |= 0 at the start
 *   if < 0 : = 0
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_CameraChasing";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined, // 0: dev-reserve
params, // 1: plugin params
];


new cfc(Game_Map.prototype).
addBase('cameraChasing_get',function f(){
	const info=this._conf_cameraChasing; if(!info) return info;
	if(!(info.xq instanceof Queue)) info.xq=Object.assign(new Queue(),info.xq);
	if(!(info.yq instanceof Queue)) info.yq=Object.assign(new Queue(),info.yq);
	return info;
}).
addBase('cameraChasing_set',function f(target,smoothFrames,sineFrames,delayFrames,
	// autoReleaseOnSineEnd, // auto release when smoothFrames==0
){
	if(!target) target=$gamePlayer;
	smoothFrames|=0;
	if(smoothFrames<0){
		this._conf_cameraChasing=undefined;
		return this;
	}
	sineFrames|=0; if(sineFrames<0) sineFrames=0;
	delayFrames|=0; if(delayFrames<0) delayFrames=0;
	const X=$gameMap._displayX;
	const Y=$gameMap._displayY;
	const amount=Math.max(smoothFrames,1);
	const info=this._conf_cameraChasing={
		target:target,
		smoothFrames:smoothFrames,
		sineFramesCurr:0,
		sineFramesMax:sineFrames,
		//sineFrameEndRelease:!!autoReleaseOnSineEnd,
		delayFrames:delayFrames,
		initDisplayXy:[X,Y],
		xa:X*amount,
		ya:Y*amount,
		xq:new Queue(delayFrames+smoothFrames+f.tbl[0]),
		yq:new Queue(delayFrames+smoothFrames+f.tbl[0]),
	};
	return this;
},[
4, // init padded queue size
]).
add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.cameraChasing_update();
	return rtv;
}).
addBase('cameraChasing_update',function f(){
	const info=this.cameraChasing_get(); if(!info||info.target===$gamePlayer) return;
	return this.cameraChasing_doUpdate(info.target);
}).
addBase('cameraChasing_doUpdate',function f(target){
	const info=this.cameraChasing_get(),p=$gamePlayer;
	
	if(info.sineFramesCurr<info.sineFramesMax) ++info.sineFramesCurr;
	const sineRate=info.sineFramesCurr<info.sineFramesMax?(1-Math.cos(Math.PI*(info.sineFramesCurr)/info.sineFramesMax))*0.5:1;
	const lenMax=info.delayFrames+Math.max(info.smoothFrames,1);
	
	if(info.xq.length<lenMax){
		info.xa-=info.initDisplayXy[0];
	}else{
		info.xa-=info.xq[0];
		info.xq.pop();
	}
	let x=target._realX-p.centerX();
	if(sineRate<1) x=sineRate*(x-info.initDisplayXy[0])+info.initDisplayXy[0];
	info.xq.push(x);
	info.xa+=info.delayFrames<info.xq.length?info.xq[info.xq.length-1-info.delayFrames]:info.initDisplayXy[0];
	
	if(info.yq.length<lenMax){
		info.ya-=info.initDisplayXy[1];
	}else{
		info.ya-=info.yq[0];
		info.yq.pop();
	}
	let y=target._realY-p.centerY();
	if(sineRate<1) y=sineRate*(y-info.initDisplayXy[1])+info.initDisplayXy[1];
	info.yq.push(y);
	info.ya+=info.delayFrames<info.yq.length?info.yq[info.yq.length-1-info.delayFrames]:info.initDisplayXy[1];
	
	if(info.smoothFrames) $gameMap.setDisplayPos(info.xa/info.smoothFrames,info.ya/info.smoothFrames,);
	else{
		$gameMap.setDisplayPos(info.xa,info.ya,);
		if(sineRate===1 && ++info.sineFramesCurr-info.sineFramesMax>info.delayFrames) this.cameraChasing_set(0,-1); // clear
	}
	return this;
}).
getP;

new cfc(Game_Player.prototype).
add('updateScroll',function f(lastScrolledX,lastScrolledY){
	const info=$gameMap&&$gameMap.cameraChasing_get(); if(!info) return f.ori.apply(this,arguments);
	if(info.target!==this) return;
	$gameMap.cameraChasing_doUpdate(this);
}).
getP;


})();
