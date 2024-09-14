"use strict";
/*:
 * @plugindesc expand event trigger / collide range
 * @author agold404
 * @help page note
 * <expandRange:positive_integer_size>
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_Event.prototype).add('getPosKeys',function f(dx,dy){
	const er=this.getExpandRange()|0; if(!(0<er)) return [this.getPosKey(dx,dy)];
	const rtv=[];
	dx|=0;
	dy|=0;
	for(let y=-er;y<=er;++y){ for(let x=-er;x<=er;++x){
		rtv.push(this.getPosKey(dx+x,dy+y));
	} }
	return rtv;
}).add('setupPageSettings',function f(){
	const page=f.ori.apply(this,arguments);
	const meta=page&&page.meta; if(!meta) return page;
	this._expandRange=meta.expandRange|0;
	return page;
}).add('getExpandRange',function f(){
	return this._expandRange;
}).add('isNearTheScreen',function f(){
	return (f.tbl[0] in this.event().meta)||f.ori.apply(this,arguments);
},t=[
'longDistDetection',
]).add('isNearThePlayer',function f(){
	return (f.tbl[0] in this.event().meta)||f.ori.apply(this,arguments);
},t).add('_canPass_expandRange',function f(x,y,d,thePointOnly,oriFunc){
	const er=this.getExpandRange(); if(thePointOnly||!(0<er)) return oriFunc.apply(this,arguments);
	const dx0=d===6?0:-er,dx1=d===4?0:er;
	const dy0=d===2?0:-er,dy1=d===8?0:er;
	for(let dy=dy0;dy<=dy1;++dy){ for(let dx=dx0;dx<=dx1;++dx){
		arguments[0]=x+dx;
		arguments[1]=y+dy;
		if(!oriFunc.apply(this,arguments)) return false;
	} }
	arguments[0]=x;
	arguments[1]=y;
	return true;
},[
],true,true);
{ const p=Game_Event.prototype,ref=Game_Character.prototype;
k='canPass';
if(p[k]===ref[k]) new cfc(p).add(k,function f(x,y,d,thePointOnly,reservedForPassingOriFunc){
	const arg4=arguments[4],argc=arguments.length;
	arguments.length=5;
	arguments[4]=Game_Character.prototype.canPass;
	const rtv=this._canPass_expandRange.apply(this,arguments);
	if(4>=argc) arguments[4]=arg4;
	arguments.length=argc;
	return rtv;
},undefined,false,true);
else new cfc(p).add(k,function f(x,y,d,thePointOnly,reservedForPassingOriFunc){
	const arg4=arguments[4],argc=arguments.length;
	arguments[4]=f.ori;
	const rtv=this._canPass_expandRange.apply(this,arguments);
	if(4>=argc) arguments[4]=arg4;
	return rtv;
});
}

new cfc(Game_Map.prototype).add('update_locTbl_addEvt',function f(evt,coord){
	if(!coord) return;
	if(!(0<evt.getExpandRange())) return f.ori.apply(this,arguments);
	evt.getPosKeys().forEach(f.tbl[0],arguments);
},[
function f(key){
	const evt=this[0],coord=this[1];
	let cont=coord.get(key); if(!cont) coord.set(key,cont=[]);
	cont.uniquePush(evt);
},
]).add('update_locTbl_delEvt',function f(evt,coord,x,y){
	const er=evt.getExpandRange(); if(!(0<er)) return f.ori.apply(this,arguments);
	for(let dy=-er;dy<=er;++dy){ for(let dx=-er;dx<=er;++dx){
		arguments[2]=x+dx;
		arguments[3]=y+dy;
		f.ori.apply(this,arguments);
	} }
	arguments[2]=x;
	arguments[3]=y;
});

})();
