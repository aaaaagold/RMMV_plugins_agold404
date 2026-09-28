"use strict";
/*:
 * @plugindesc APIs to record the play
 * @author agold404
 * 
 * 
 * @param RecordKey
 * @type number
 * @text keycode of record/stop key
 * @desc enter the keycode. default use F9
 * @default 120
 * 
 * 
 * @help APIs:
 * Graphics.recordingAPIs_start();
 * Graphics.recordingAPIs_stop();
 * Graphics.recordingAPIs_videoRecords_delFromIdx(idx,cnt=1);
 * Graphics.recordingAPIs_videoRecords_downloadFromIdx(idx);
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_RecordingAPIs";
const params=PluginManager.parameters(pluginName)||{};
params._recordKey=useDefaultIfIsNaN(params.RecordKey,120);
params._recordKeyName="recordingStartStop";


t=[
undefined,
params,
window.isTest(),
undefined,
{
"zh-TW":[
 "錄影開始",
 "錄影結束",
],
_:[
 "record started",
 "record stopped",
],
}, // 4: recordKey msg
{
showFrame:31,
}, // 5: recordKey msg opt
];


new cfc(Graphics).
addBase('recordingAPIs_getTmpCanvas',function f(){
	return f.tbl[0];
},[
document.ce('canvas'), // 0: tmp canvas
]).
addBase('recordingAPIs_videoRecords_getCont',function f(){
	let rtv=this._recordingAPIs_videoRecords_cont; if(!rtv) rtv=this._recordingAPIs_videoRecords_cont=[];
	return rtv;
}).
add('pasteCanvas',function f(){
	this.recordingAPIs_copyCanvas();
	return f.ori.apply(this,arguments);
}).
addBase('recordingAPIs_copyCanvas',function f(){
	if(!this._recordingAPIs_isRecording) return;
	const ctx=this.recordingAPIs_getTmpCanvas().getContext('2d');
	ctx.drawImage(this._canvas,0,0);
}).
addBase('recordingAPIs_videoRecords_add',function f(recordBlobUrl,previewCanvas){
	const cont=this.recordingAPIs_videoRecords_getCont();
	const info={
		url:recordBlobUrl,
		timeMs:Date.now(),
		timeStr:new Date().toISOString(),
		preview:previewCanvas&&previewCanvas.ptcp(),
	};
	cont.push(info);
}).
addBase('recordingAPIs_videoRecords_delFromIdx',function f(idx,cnt){
	const cont=this.recordingAPIs_videoRecords_getCont();
	if(cnt==null) cnt=1;
	const arr=cont.splice(idx,cnt);
	arr.forEach(f.tbl[0]);
	return arr;
},[
info=>URL.revokeObjectURL(info.url), // 0: revoke blob url
]).
addBase('recordingAPIs_videoRecords_downloadFromIdx',function f(idx){
	const cont=this.recordingAPIs_videoRecords_getCont();
	if(idx<0){
		idx%=cont.length;
		idx+=cont.length;
		idx%=cont.length;
	}
	if(idx>=0&&idx<cont.length){
		const info=cont[idx];
		const a=document.ce('a');
		a.download='record-'+info.timeMs+'.webm';
		a.textContent='download the video - '+info.timeMs;
		a.href=info.url;
		a.click();
		return info.url;
	}
}).
addBase('recordingAPIs_clearLastRecord',function f(){
	(this._recordingAPIs_chunks=this._recordingAPIs_chunks||[]).length=0;
	const c=this.recordingAPIs_getTmpCanvas();
	if(c._mr && c._mr.onstop){
		let ctr=2|0;
		const foo=()=>{
			if(!--ctr) this._recordingAPIs_addListenerAndStart();
		};
		const rtv=!!c._mr.ondataavailable;
		c._mr.ondataavailable=foo; // fired after `.stop()` is called
		c._mr.onstop=foo; // fired after `.stop()` is called
		c._mr.stop();
		return rtv;
	}
}).
addBase('recordingAPIs_start',function f(){
	const isConsequentStart=this.recordingAPIs_clearLastRecord();
	
	const c=this.recordingAPIs_getTmpCanvas();
	{
		const srcc=this._canvas;
		c.width=srcc.width;
		c.height=srcc.height;
	}
	
	if(!c._mr){
		let vtracks=[];
		let atracks=[];
		try{
			vtracks=c.captureStream(60).getVideoTracks();
		}catch(e){
		}
		try{
			const adst=WebAudio._context.createMediaStreamDestination();
			WebAudio._masterGainNode.connect(adst);
			atracks=adst.stream.getAudioTracks();
		}catch(e){
		}
		const stream=new MediaStream([
			...vtracks,
			...atracks,
		]);
		c._mr=new MediaRecorder(stream,{mimeType:'video/webm',});
		//c._mr._canvas=c;
		c._mr._chunks=this._recordingAPIs_chunks;
	}
	
	if(!isConsequentStart) this._recordingAPIs_addListenerAndStart();
	
	this._recordingAPIs_isRecording=true;
}).
addBase('_recordingAPIs_addListenerAndStart',function f(){
	const c=this.recordingAPIs_getTmpCanvas();
	c._mr.ondataavailable=f.tbl[0];
	c._mr.onstop=f.tbl[1];
	c._mr.start();
},[
function(e){
	this._chunks.push(e.data);
}, // 0: ondataavailable
function(e){
	const c=Graphics.recordingAPIs_getTmpCanvas();
	Graphics.recordingAPIs_addVideoRecordFromChunks(this._chunks,c);
	// disable remove callbacks
	c._mr.ondataavailable=
	c._mr.onstop=
	null;
}, // 1: onstop
]).
addBase('recordingAPIs_addVideoRecordFromChunks',function f(chunks,refCanvas){
	const blob=new Blob(chunks,{type:'video/webm'});
	this.recordingAPIs_videoRecords_add(URL.createObjectURL(blob),refCanvas);
}).
addBase('recordingAPIs_stop',function f(){
	const c=this.recordingAPIs_getTmpCanvas();
	if(c._mr) c._mr.stop();
	this._recordingAPIs_isRecording=false;
}).
addBase('recordingAPIs_isRecording',function f(){
	return !!this._recordingAPIs_isRecording;
}).
getP;


const key='r',keyName='openFlashback';
const f=function f(){
	if(f._lastKey!==f.tbl[1]._recordKey){
		if(f._lastKey!=null) delete Input.keyMapper[f._lastKey];
		Input.addKeyName(f.tbl[1]._recordKey,f.tbl[1]._recordKeyName);
	}
	if(Input.isTriggered(f.tbl[1]._recordKeyName)){
		const locale=DataManager.getLocale();
		const msgs=f.tbl[4][locale]||f.tbl[4]._;
		if(Graphics.recordingAPIs_isRecording()){
			Graphics.recordingAPIs_stop();
			if($gameTemp.popupMsg) $gameTemp.popupMsg(msgs[1],f.tbl[5],);
		}else{
			if($gameTemp.popupMsg) $gameTemp.popupMsg(msgs[0],f.tbl[5],);
			Graphics.recordingAPIs_start();
		}
	}
};
f.ori=undefined;
f.tbl=t;
new cfc(Scene_Boot.prototype).
add('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.recordingAPIs_addKeySensor();
	return rtv;
}).
addBase('recordingAPIs_addKeySensor',function f(){
	if(f._called) return;
	if(SceneManager.additionalUpdate_renderScene_add) SceneManager.additionalUpdate_renderScene_add(f.tbl[0],true);
	f._called=true;
},[f]).
getP;


})();

