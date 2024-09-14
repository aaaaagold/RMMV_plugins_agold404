"use strict";
/*:
 * @plugindesc overwrite AudioManager.playSe, stopSe, StaticSe
 * @author agold404
 * @help se echo api: 
 * 
 * $gameSystem.seEcho_opt_set({delayFrame:21,nextVolRate:0.875});
 * $gameSystem.seEcho_opt_clear();
 * $gameSystem.seEcho_echos_clear();
 * 
 * AudioManager.playSe({name:"Attack3",pitch:100,volume:100,});
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const maxSameCntInSameFrame=2;

AudioManager._seBuffers=new Queue(64); // only used for stopSe
AudioManager._seCurrentFrame=new Map();
AudioManager._staticBufferMap=new Map();
new cfc(AudioManager).add('playSe',function f(se){
	const n=se&&se.name;
	if(n){
		//if(!this.seCurrentFrame_add(n)) return; // wait until actual played
		if(this._seBuffers.constructor!==Queue) this._seBuffers=new Queue(this._seBuffers);
		const q=this._seBuffers;
		while(q.length && q[0] && (q[0].isError()||( q[0].isReady()&&!q[0].isPlaying() )) ) q.pop();
		const buffer = this.createBuffer('se', n);
		this.updateSeParameters(buffer, se);
		buffer.play(false);
		this._seBuffers.push(buffer);
	}
},undefined,true,true).add('updateSeParameters',function f(buffer,se){
	buffer.setSeId(se.name);
	return f.ori.apply(this,arguments);
}).add('stopSe',function f(){
	this._seBuffers.forEach(f.tbl[0]);
	this._seBuffers.length=0;
},[
function(buffer){ buffer.stop(); },
],true,true).add('playStaticSe',function f(se){
	const buffer=this.loadStaticSe(se);
	if(buffer){
		buffer.stop();
		this.updateSeParameters(buffer,se);
		buffer.play(false);
	}
},undefined,false,true).add('loadStaticSe',function f(se){
	const n=se&&se.name;
	let buffer=this._staticBufferMap.get(n);
	if(buffer) return buffer;
	buffer=this.createBuffer('se', n);
	buffer._reservedSeName=n;
	this._staticBufferMap.set(n,buffer);
	if(this.shouldUseHtml5Audio()) Html5Audio.setStaticSe(buffer._url);
	return buffer;
},undefined,false,true).add('isStaticSe',function f(se){
	const n=se&&se.name; if(!n) return;
	return this._staticBufferMap.has(n);
},undefined,false,true).add('seCurrentFrame_add',function f(n){
	const scf=this._seCurrentFrame;
	const c=scf.get(n)|0; if(c>=f.tbl[0]) return false;
	scf.set(n,c+1);
	return true;
},[
maxSameCntInSameFrame,
],false,true).add('seCurrentFrame_clear',function f(){
	this._seCurrentFrame.clear();
});
new cfc(WebAudio.prototype).add('_startPlaying',function f(isLoop,offset){
	if(!this._checkNotSeOrPlayable()) return;
	return f.ori.apply(this,arguments);
}).add('_checkNotSeOrPlayable',function f(){
	if(this._seId&&!AudioManager.seCurrentFrame_add(this._seId)) return false;
	return true;
},undefined,true,true).add('setSeId',function f(id){
	this._seId=id;
},undefined,true,true);

new cfc(SceneManager).add('updateManagers',function f(){
	this.updateManagers_audio();
	return f.ori.apply(this,arguments);
}).add('updateManagers_audio',t=function f(){
	AudioManager.seCurrentFrame_clear();
},undefined,true,true);
setInterval(t,1000/64);


new cfc(Game_System.prototype).add('seEcho_opt_clear',function(){
	this._seEcho_opt=undefined;
}).add('seEcho_opt_set',function f(opt){
	this._seEcho_opt={
		delayFrame:Math.max(opt&&opt.delayFrame,1)||f.tbl[0].delayFrame,
		minVol:opt&&opt.minVol||f.tbl[0].minVol,
		nextVolRate:opt&&opt.nextVolRate||f.tbl[0].nextVolRate,
	};
},[
{
delayFrame:4,
minVol:1.0/128,
nextVolRate:0.75,
},
]).add('seEcho_opt_get',function f(){
	return this._seEcho_opt;
}).add('seEcho_opt_getDelayFrame',function f(opt){
	opt=opt||this._seEcho_opt;
	return opt&&opt.delayFrame;
}).add('seEcho_opt_getMinVol',function f(opt){
	opt=opt||this._seEcho_opt;
	return opt&&opt.minVol;
}).add('seEcho_opt_getNextVolRate',function f(opt){
	opt=opt||this._seEcho_opt;
	return opt&&opt.nextVolRate;
}).add('seEcho_echos_getCont',function f(){
	let c=this._seEcho_echos; if(!c) c=this._seEcho_echos=new Heap(f.tbl[0]);
	if(c.constructor!==Heap){
		c=Object.assign(new Heap(f.tbl[0]),c);
		c._searchTbl=new Map();
		c.makeHeap();
	}
	return c;
},[
(a,b)=>b._echoFrame-a._echoFrame, // 0: cmp3 for max heap
]).add('seEcho_echos_add',function f(se){
	const opt=se._echoOpt||this.seEcho_opt_get(); if(!opt) return;
	const info=Object.assign({},se);
	info._echoOpt=opt;
	info.volume*=this.seEcho_opt_getNextVolRate(opt); if(!(info.volume>=this.seEcho_opt_getMinVol(opt))) return;
	info._echoFrame=(se._echoFrame||Graphics.frameCount)+this.seEcho_opt_getDelayFrame(opt); if(!info._echoFrame) return;
	this.seEcho_echos_getCont().push(info);
	return info;
}).add('seEcho_echos_clear',function f(){
	this.seEcho_echos_getCont().clear();
}).add('seEcho_echos_play',function f(){
	for(const h=this.seEcho_echos_getCont(),currFrame=Graphics.frameCount;h.length&&currFrame>=h.top._echoFrame;){
		const curr=h.top; h.pop();
		AudioManager.playSe(curr); // will add an echo
	}
});
const p=AudioManager;
new cfc(p).add('playSe',function f(se){
	$gameSystem&&$gameSystem.seEcho_echos_add(se);
	return f.ori.apply(this,arguments);
});
p.playSe_ori=p.playSe.ori;
new cfc(SceneManager).add('updateScene',function f(){
	const rtv=f.ori.apply(this,arguments);
	$gameSystem&&$gameSystem.seEcho_echos_play();
	return rtv;
});

})();
