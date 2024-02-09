"use strict";
/*:
 * @plugindesc runtime 調整圖片
 * @author agold404
 * @help ????
 * 灰階: 狀態<grayscale:灰階程度,rgb偏向,偏向程度>
 * *灰階程度: 0~1 ，跟原本的顏色線性比例
 * *rgb偏向: [紅色0到255,綠色0到255,藍色0到255] ，灰階後與此顏色加權平均
 * *偏向程度: 0~1 ，偏向的權重
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const tuneN=(n,meta)=>{
	const uqh=ImageManager.splitUrlQueryHash(n);
	uqh[1]+=(uqh[1]?"&":"?")+"grayscale";
	if(meta.grayscale!==true) uqh[1]+='='+encodeURIComponent(meta.grayscale);
	return uqh.join('');
};

{ const p=Game_Battler.prototype;
(p._battlerName_grayscalize=function f(n){
	const stat=this.states().find(f.forEach);
	if(stat && n) n=tuneN(n,stat.meta);
	return n;
}).forEach=stat=>stat.meta.grayscale;
}

{ const p=Game_Event.prototype;
p._characterName_grayscalize=function f(n){
	const data=this.event();
	if(data && data.meta.grayscale && n) n=tuneN(n,data.meta);
	return n;
};
k='characterName';
r=p[k]; (p[k]=function f(){
	return this._characterName_grayscalize(f.ori.apply(this,arguments));
}).ori=r;
}

k='battlerName';
{ const p=Game_Actor.prototype;
r=p[k]; (p[k]=function f(){
	return this._battlerName_grayscalize(f.ori.apply(this,arguments));
}).ori=r;
}
{ const p=Game_Enemy.prototype;
r=p[k]; (p[k]=function f(){
	return this._battlerName_grayscalize(f.ori.apply(this,arguments));
}).ori=r;
}

k='svBattlerName';
{ const p=Game_Enemy.prototype;
if(p[k]) new cfc(p).add(k,function f(){
    return this._battlerName_grayscalize(f.ori.apply(this,arguments));
});
}

{ const p=ImageManager;
(p._parseQs_uqh=function f(uqh,idx){
	idx=idx===undefined?1:idx;
	const rtv={};
	if(uqh&&uqh[idx]) uqh[idx].slice(1).split("&").forEach(f.forEach,rtv);
	return rtv;
}).forEach=function(x){
	const idxe=x.indexOf('=');
	if(idxe===-1) this[x]=true;
	else this[x.slice(0,idxe)]=decodeURIComponent(x.slice(idxe+1));
};
p._parseQs=function(path){
	return this._parseQs_uqh(ImageManager.splitUrlQueryHash(path),1);
};
p._parseHs=function(path){
	return this._parseQs_uqh(ImageManager.splitUrlQueryHash(path),2);
};
k='loadNormalBitmap';
r=p[k]; (p[k]=function f(){ // (path, hue)
	const uqh=ImageManager.splitUrlQueryHash(arguments[0]);
	if(uqh[1]){
		const key = this._generateCacheKey(arguments[0], arguments[1]);
		let bitmap = this._imageCache.get(key);
		if(!bitmap){
			const bitmap_base=this.loadNormalBitmap(uqh[0],arguments[1]);
			bitmap=new Bitmap(1,1);
			bitmap._baseBitmap=bitmap_base;
			bitmap._loadingState='';
			bitmap_base.addLoadListener(bm=>{
				const w=bm.width,h=bm.height;
				const c=document.createElement('canvas'); c.width=w; c.height=h;
				const ctx=c.getContext('2d');
				const args=this._parseQs_uqh(uqh);
				ctx.globalCompositeOperation='copy';
				ctx.drawImage(bm._canvas,0,0);
				if(args.grayscale){
					const grayscale=JSON.parse('['+args.grayscale+']');
					const grayRate=grayscale[0], toColor=grayscale[1] , toColorRate=grayscale[2];
					const tmp=ctx.getImageData(0,0,w,h);
					for(let x=0,xs=w*h<<2,gsc=1-grayRate;x!==xs;x+=4){
						let sum=0;
						for(let c=0;c!==3;++c) sum+=tmp.data[x+c];
						for(let c=0,v=grayRate*~~(sum/3);c!==3;++c) tmp.data[x+c]=tmp.data[x+c]*gsc+v;
					}
					if(!isNaN(toColorRate)){
						for(let x=0,xs=w*h<<2,tcrc=1-toColorRate;x!==xs;x+=4){
							for(let c=0;c!==3;++c) tmp.data[x+c]=tmp.data[x+c]*tcrc+toColorRate*toColor[c];
						}
					}
					ctx.putImageData(tmp,0,0);
				}
				bitmap.resize(w,h);
				bitmap.clear();
				bitmap.bltImage({width:w,height:h,_image:ctx.canvas},0,0,w,h,0,0);
				bitmap._loadingState='loaded';
			});
			this._imageCache.add(key, bitmap);
		}else if(!bitmap.isReady()){
			if(bitmap._baseBitmap) bitmap._baseBitmap.decode();
			else{ bitmap.decode(); bitmap._loadingState='loaded'; }
		}
		return bitmap;
	}else return f.ori.apply(this,arguments);
}).ori=r;
}

})();
