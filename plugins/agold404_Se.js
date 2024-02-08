"use strict";
/*:
 * @plugindesc overwrite AudioManager.playSe, stopSe, StaticSe
 * @author agold404
 * @help .
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const maxSameCntInSameFrame=2;

AudioManager._seBuffers=new Queue(64);
AudioManager._seCurrentFrame=new Map();
AudioManager._staticBufferMap=new Map();
new cfc(AudioManager).add('playSe',function f(se){
	const n=se&&se.name;
	if(n){
		if(!this.seCurrentFrame_add(n)) return;
		if(this._seBuffers.constructor!==Queue) this._seBuffers=new Queue(this._seBuffers);
		const q=this._seBuffers;
		while(q.length && q[0] && (q[0].isError()||( q[0].isReady()&&!q[0].isPlaying() )) ) q.pop();
		const buffer = this.createBuffer('se', n);
		this.updateSeParameters(buffer, se);
		buffer.play(false);
		this._seBuffers.push(buffer);
	}
},undefined,false,true).add('stopSe',function f(){
	this._seBuffers.forEach(f.tbl[0]);
	this._seBuffers.length=0;
},[
function(buffer){ buffer.stop(); },
],false,true).add('playStaticSe',function f(se){
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

setInterval(()=>AudioManager.seCurrentFrame_clear(),1.0/64);

})();
