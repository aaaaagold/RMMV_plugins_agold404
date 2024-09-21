"use strict";
/*:
 * @plugindesc expand event trigger / collide range
 * @author agold404
 * @help in note
 * <expandRange:positive_integer_size>
 * e.g. <expandRange:2>
 * 
 * expand only front, cumulated with <expandRange:positive_integer_size>
 * <expandRange_F:positive_integer_size>
 * 
 * expand only right, cumulated with <expandRange:positive_integer_size>
 * <expandRange_R:positive_integer_size>
 * 
 * expand only left, cumulated with <expandRange:positive_integer_size>
 * <expandRange_L:positive_integer_size>
 * 
 * expand only back, cumulated with <expandRange:positive_integer_size>
 * <expandRange_B:positive_integer_size>
 * 
 * the resulting range is guaranteed to be a rectangle.
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_Event.prototype).add('_getPosKeys_dxyMinMax',function f(d,isFrontOnly){
	const er=this.getExpandRangeA();
	const dxMinMax={min:-er,max:er};
	const dyMinMax={min:-er,max:er};
	const direction=d||this.direction();
	f.tbl[0](dxMinMax,dyMinMax,f.tbl[1][direction]||f.tbl[1]._,  this.getExpandRangeF());
	f.tbl[0](dxMinMax,dyMinMax,f.tbl[1][direction]||f.tbl[1]._, -this.getExpandRangeB());
	f.tbl[0](dxMinMax,dyMinMax,f.tbl[2][direction]||f.tbl[2]._, -this.getExpandRangeL());
	f.tbl[0](dxMinMax,dyMinMax,f.tbl[2][direction]||f.tbl[2]._,  this.getExpandRangeR());
	if(isFrontOnly){
		const dxyMinMaxInfo=f.tbl[3][direction]||f.tbl[3]._;
		dxMinMax.min=dxMinMax.min.clamp(dxyMinMaxInfo[0][0],dxyMinMaxInfo[0][1]);
		dxMinMax.max=dxMinMax.max.clamp(dxyMinMaxInfo[0][0],dxyMinMaxInfo[0][1]);
		dyMinMax.min=dyMinMax.min.clamp(dxyMinMaxInfo[1][0],dxyMinMaxInfo[1][1]);
		dyMinMax.max=dyMinMax.max.clamp(dxyMinMaxInfo[1][0],dxyMinMaxInfo[1][1]);
	}
	return {x:dxMinMax,y:dyMinMax};
},t=[
(dx,dy,dxy1,times)=>{
	if(!times) return;
	const eX=dxy1[0]*times;
	const eY=dxy1[1]*times;
	// if times<0, then the range will be shrinked
	if(dxy1[0]<0) dx.min+=eX;
	else dx.max+=eX;
	if(dxy1[1]<0) dy.min+=eY;
	else dy.max+=eY;
}, // 0: tuning range
{
_:[  0,  0],
2:[  0,  1],
4:[ -1,  0],
6:[  1,  0],
8:[  0, -1],
}, // 1: front dxy by direction
{
_:[  0,  0],
2:[ -1,  0],
4:[  0, -1],
6:[  0,  1],
8:[  1,  0],
}, // 2: right dxy by direction
{
_:[ [ -Infinity, Infinity, ],[ -Infinity, Infinity, ] ],
2:[ [ -Infinity, Infinity, ],[         0, Infinity, ] ],
4:[ [ -Infinity,        0, ],[ -Infinity, Infinity, ] ],
6:[ [         0, Infinity, ],[ -Infinity, Infinity, ] ],
8:[ [ -Infinity, Infinity, ],[ -Infinity,        0, ] ],
}, // 3: clamp range by direction for frontOnly // [ [[dxMin,dxMax],[dyMin,dyMax]] , ... ] 
],true,true).add('getPosKeys',function f(dx,dy,d,isFrontOnly){
	const dxyMinMax=this._getPosKeys_dxyMinMax(d,isFrontOnly);
	return this._getPosKeys_posKey(0|dx,0|dy,dxyMinMax.x,dxyMinMax.y);
},undefined,true,true).add('_getPosKeys_posKey',function f(dx,dy,dxMinMax,dyMinMax){
	const rtv=[];
	for(let y=dyMinMax.min,yMax=dyMinMax.max,xMin=dxMinMax.min,xMax=dxMinMax.max;y<=yMax;++y){ for(let x=xMin;x<=xMax;++x){
		rtv.push(this.getPosKey(dx+x,dy+y));
	} }
	return rtv;
},undefined,true,true).add('getPosKeys_tuple',function f(dx,dy,d,isFrontOnly){
	const dxyMinMax=this._getPosKeys_dxyMinMax(d,isFrontOnly);
	return this._getPosKeys_tuple(0|dx,0|dy,dxyMinMax.x,dxyMinMax.y);
},undefined,true,true).add('_getPosKeys_tuple',function f(dx,dy,dxMinMax,dyMinMax){
	const rtv=[];
	for(let y=dyMinMax.min,yMax=dyMinMax.max,xMin=dxMinMax.min,xMax=dxMinMax.max;y<=yMax;++y){ for(let x=xMin;x<=xMax;++x){
		rtv.push([dx+x,dy+y]);
	} }
	return rtv;
},undefined,true,true).add('setupPageSettings',function f(){
	const page=f.ori.apply(this,arguments);
	const meta=this.getMeta();
	this._expandRangeA=meta.expandRange|0;
	this._expandRangeF=meta.expandRangeF|0;
	this._expandRangeR=meta.expandRangeR|0;
	this._expandRangeL=meta.expandRangeL|0;
	this._expandRangeB=meta.expandRangeB|0;
	return page;
}).add('getExpandRangeA',function f(){
	return this._expandRangeA||0;
},undefined,true,true).add('getExpandRangeF',function f(){
	return this._expandRangeF||0;
},undefined,true,true).add('getExpandRangeR',function f(){
	return this._expandRangeR||0;
},undefined,true,true).add('getExpandRangeL',function f(){
	return this._expandRangeL||0;
},undefined,true,true).add('getExpandRangeB',function f(){
	return this._expandRangeB||0;
},undefined,true,true).add('_canPass_expandRange',function f(x,y,d,thePointOnly,oriFunc){
	if(thePointOnly) return oriFunc.apply(this,arguments);
	const arr=this.getPosKeys_tuple(x,y,d,true);
	for(let i=arr.length;i--;){
		arguments[0]=arr[i][0];
		arguments[1]=arr[i][1];
		if(!oriFunc.apply(this,arguments)) return false;
	}
	arguments[0]=x;
	arguments[1]=y;
	return true;
},true,true);
{ const p=Game_Event.prototype,ref=Game_Character.prototype;
k='canPass';
if(p[k]===ref[k]) new cfc(p).add(k,function f(x,y,d,thePointOnly,_reservedForPassingOriFunc){
	const arg4=arguments[4],argc=arguments.length;
	arguments.length=5;
	arguments[4]=Game_Character.prototype.canPass;
	const rtv=this._canPass_expandRange.apply(this,arguments);
	arguments[4]=arg4;
	arguments.length=argc;
	return rtv;
},undefined,false,true);
else new cfc(p).add(k,function f(x,y,d,thePointOnly,_reservedForPassingOriFunc){
	const arg4=arguments[4],argc=arguments.length;
	arguments.length=5;
	arguments[4]=f.ori;
	const rtv=this._canPass_expandRange.apply(this,arguments);
	arguments[4]=arg4;
	arguments.length=argc;
	return rtv;
});
}

new cfc(Game_Map.prototype).add('update_locTbl_addEvt',function f(evt,coord){
	evt.getPosKeys().forEach(f.tbl[0],[arguments,this]);
},[
function f(key){
	const evt=this[0][0],coord=this[0][1];
	const map=this[1];
	map._update_locTbl_addEvt_byKey(evt,coord,key);
},
]).add('update_locTbl_delEvt',function f(evt,coord,x,y){
	evt.getPosKeys(x-evt.x,y-evt.y).forEach(f.tbl[0],[arguments,this]);
},[
function f(key){
	const evt=this[0][0],coord=this[0][1];
	const map=this[1];
	map._update_locTbl_delEvt_byKey(evt,coord,key);
},
]);

})();
