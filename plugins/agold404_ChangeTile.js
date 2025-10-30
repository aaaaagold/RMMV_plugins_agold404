"use strict";
/*:
 * @plugindesc change tiles in runtime
 * @author agold404
 * @help 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const P=Tilemap;

new cfc(P).
addBase('_generateProperTileId',function f(mapd,dstx,dsty,lv,tileIdAsBase,borderIsNotEnd){
	if(!mapd||!mapd.data||typeof Tilemap==='undefined'||Tilemap.isAutotile===undefined||!Tilemap.isAutotile(tileIdAsBase)) return;
	const w=mapd.width,h=mapd.height,sz=w*h;
	const toBase=f.tbl[0],getTile=(x,y,lv)=>mapd.data[lv*sz+y*w+x],isEnd=(x,y)=>{
		// TODO
	};
	const rx=x=>mapd.scrollType&2?(x+w)%w:x;
	const ry=y=>mapd.scrollType&1?(y+h)%h:y;
	const validX=x=>0<=x&&x<w;
	const validY=y=>0<=y&&y<h;
	let tmp;
	lv|=0;
	tileIdAsBase=toBase(tileIdAsBase);
	// 以河道來思考
	let cnt_end=0,bitmsk_end=0; // 數下右上左(8421)是岸的數量
	
	bitmsk_end<<=1;
	tmp=validY(tmp=ry(dsty+1)) ? toBase(getTile(dstx,tmp,lv))!==tileIdAsBase : borderIsNotEnd;
	cnt_end+=tmp;
	bitmsk_end|=tmp;
	
	bitmsk_end<<=1;
	tmp=validX(tmp=rx(dstx+1)) ? toBase(getTile(tmp,dsty,lv))!==tileIdAsBase : borderIsNotEnd;
	cnt_end+=tmp;
	bitmsk_end|=tmp;
	
	bitmsk_end<<=1;
	tmp=validY(tmp=ry(dsty-1)) ? toBase(getTile(dstx,tmp,lv))!==tileIdAsBase : borderIsNotEnd;
	cnt_end+=tmp;
	bitmsk_end|=tmp;
	
	bitmsk_end<<=1;
	tmp=validX(tmp=rx(dstx-1)) ? toBase(getTile(tmp,dsty,lv))!==tileIdAsBase : borderIsNotEnd;
	cnt_end+=tmp;
	bitmsk_end|=tmp;
	
	switch(cnt_end){
	case 0:{ // 0..15
		let bitmsk=0,tmpx,tmpy;
		
		bitmsk<<=1;
		tmpx=rx(dstx-1); tmpy=ry(dsty+1);
		bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
		
		bitmsk<<=1;
		tmpx=rx(dstx+1); tmpy=ry(dsty+1);
		bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
		
		bitmsk<<=1;
		tmpx=rx(dstx+1); tmpy=ry(dsty-1);
		bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
		
		bitmsk<<=1;
		tmpx=rx(dstx-1); tmpy=ry(dsty-1);
		bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
		
		return tileIdAsBase|bitmsk;
	}break;
	case 1:{ // 16..31
		let bitAt=4,bitmsk=0,tmpx,tmpy;
		while( bitAt && (bitmsk_end&(1<<--bitAt))===0 )
			;
		switch(bitAt){
		case 0: // 左岸
			bitmsk<<=1;
			tmpx=rx(dstx+1); tmpy=ry(dsty+1);
			bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
			
			bitmsk<<=1;
			tmpx=rx(dstx+1); tmpy=ry(dsty-1);
			bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
		break;
		case 1: // 上岸
			bitmsk<<=1;
			tmpx=rx(dstx-1); tmpy=ry(dsty+1);
			bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
			
			bitmsk<<=1;
			tmpx=rx(dstx+1); tmpy=ry(dsty+1);
			bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
		break;
		case 2: // 右岸
			bitmsk<<=1;
			tmpx=rx(dstx-1); tmpy=ry(dsty-1);
			bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
			
			bitmsk<<=1;
			tmpx=rx(dstx-1); tmpy=ry(dsty+1);
			bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
		break;
		case 3: // 下岸
			bitmsk<<=1;
			tmpx=rx(dstx+1); tmpy=ry(dsty-1);
			bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
			
			bitmsk<<=1;
			tmpx=rx(dstx-1); tmpy=ry(dsty-1);
			bitmsk|=validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd;
		break;
		}
		tileIdAsBase|=bitAt<<2;
		tileIdAsBase|=bitmsk;
		tileIdAsBase+=16; // (%48) don't use "|"
	}break;
	default:{ // 32..47
		let offset=0,tmpx,tmpy;
		switch(bitmsk_end){
		case 0x0:
		case 0x1:
		case 0x2:
		case 0x4:
		case 0x8: break;
		case 0x3: { // 左上
			offset=2;
			tmpx=rx(dstx+1); tmpy=ry(dsty+1);
			offset|=(validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd);
		}break;
		case 0x5: { // 左右
			offset=0;
		}break;
		case 0x6: { // 上右
			offset=4;
			tmpx=rx(dstx-1); tmpy=ry(dsty+1);
			offset|=(validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd);
		}break;
		case 0x7: { // 左上右
			offset=10;
		}break;
		case 0x9: { // 左下
			offset=8;
			tmpx=rx(dstx+1); tmpy=ry(dsty-1);
			offset|=(validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd);
		}break;
		case 0xA: { // 上下
			offset=1;
		}break;
		case 0xB: { // 左上下
			offset=11;
		}break;
		case 0xC: { // 右下
			offset=6;
			tmpx=rx(dstx-1); tmpy=ry(dsty-1);
			offset|=(validX(tmpx)&&validY(tmpy) ? toBase(getTile(tmpx,tmpy,lv))!==tileIdAsBase : borderIsNotEnd);
		}break;
		case 0xD: { // 左右下
			offset=12;
		}break;
		case 0xE: { // 上右下
			offset=13;
		}break;
		case 0xF: { // 左上右下
			offset=15;
		}break;
		}
		tileIdAsBase|=offset;
		tileIdAsBase+=32; // (%48) don't use "|"
	}break;
	}
	return tileIdAsBase;
},[
t=>(48*~~((t-2048)/48))+2048, // 0: [func] to autotile base
]).
addBase('generateProperTileId',function f(x,y,lv,tileIdAsBase,borderIsNotEnd){
	return this._generateProperTileId($dataMap,x,y,lv,tileIdAsBase,borderIsNotEnd)-0||0;
}).
getP;

new cfc(Game_Map.prototype).
addBase('changeTile',function f(val,x,y,z,opt){
	// return true if changed
	if(!$dataMap) return;
	opt=opt||{};
	const borderIsNotEnd=opt.borderIsNotEnd;
	const isAutotile=Tilemap.isAutotile(val);
	if(isAutotile) val=Tilemap.generateProperTileId(x,y,z,val,borderIsNotEnd);
	
	const cont=this.changeTile_getCont();
	const w=$gameMap.width();
	const h=$gameMap.height();
	const key=(z*h+y)*w+x;
	const rtv=cont[key]!==val;
	cont[key]=val;
	if(Tilemap.isAutotile(val)){
		for(let dy=-1;dy<=1;++dy){ const ddx=1+!dy; for(let dx=-1;dx<=1;dx+=ddx){
			const i=$gameMap.roundX(x+dx),j=$gameMap.roundY(y+dy);
			if($gameMap.isValid(i,j)){
				const k=key+dy*w+dx;
				cont[k]=Tilemap.generateProperTileId(i,j,z,cont[k],borderIsNotEnd);
			}
		} }
	}
	
	$dataMap._changeTile_bak_data=$dataMap._changeTile_bak_data||$dataMap.data;
	$dataMap.data=cont;
	const tm=SceneManager.getTilemap();
	if(tm) tm._mapData=cont;
	if(rtv) this.changeTile_setChanged(true);
	return rtv;
}).
addBase('changeTile_syncScreen',function f(){
	if(!this.changeTile_isChanged()) return;
	this.changeTile_setChanged(false);
	const tm=SceneManager.getTilemap();
	if(tm){
		tm.refresh();
		tm._needsRepaint=true;
	}
	return this;
}).
addBase('changeTile_syncData',function f(){
	if(!$dataMap) return;
	const cont=this.changeTile_getCont();
	$dataMap._changeTile_bak_data=$dataMap._changeTile_bak_data||$dataMap.data.slice();
	if($dataMap.data!==cont) this.changeTile_setChanged(true);
	$dataMap.data=cont;
	const tm=SceneManager.getTilemap();
	if(tm) tm._mapData=cont;
}).
addBase('_changeTile_getInfo',function f(){
	if(!$dataMap) return; // called too early
	let info=this._changedTile; if(!info) info=this._changedTile={isChangedAndNotRefreshed:false,};
	const mpd=$gameMap.data();
	const mapId=$gameMap.mapId();
	if(info._mapId!==mapId){
		info._mapId=mapId;
		info.cont=mpd;
		info.isChangedAndNotRefreshed=false;
	}
	if(info.cont!==mpd) info.isChangedAndNotRefreshed=true;
	return info;
},[
[], // used when called without $dataMap being set
]).
addBase('changeTile_getCont',function f(){
	return this._changeTile_getInfo().cont;
}).
addBase('changeTile_sync',function f(){
	this.changeTile_syncData();
	this.changeTile_syncScreen();
}).
addBase('changeTile_isChanged',function f(){
	const info=this._changeTile_getInfo();
	return info.isChangedAndNotRefreshed;
}).
addBase('changeTile_setChanged',function f(val){
	const info=this._changeTile_getInfo();
	return info.isChangedAndNotRefreshed=val;
});

})();
