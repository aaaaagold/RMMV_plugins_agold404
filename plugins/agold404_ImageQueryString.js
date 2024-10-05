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

new cfc(Game_Battler.prototype).addNew('_battlerName_grayscalize',function f(n){
	const stat=this.states().find(f.tbl[0]);
	if(stat && n) n=tuneN(n,stat.meta);
	return n;
},[
stat=>stat.meta.grayscale, // 0: find
]);

new cfc(Game_Event.prototype).addNew('_characterName_grayscalize',function f(n){
	const meta=this.getMeta();
	if(meta.grayscale && n) n=tuneN(n,meta);
	return n;
}).add('characterName',function f(){
	return this._characterName_grayscalize(f.ori.apply(this,arguments));
});

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

new cfc(ImageManager).addNew('_parseQs_uqh',function f(uqh,idx){
	idx=idx===undefined?1:idx;
	const rtv={};
	if(uqh&&uqh[idx]) uqh[idx].slice(1).split("&").forEach(f.tbl[0],rtv);
	return rtv;
},[
function(x){
	const idxe=x.indexOf('=');
	if(idxe===-1) this[x]=true;
	else this[x.slice(0,idxe)]=decodeURIComponent(x.slice(idxe+1));
}, // 0: forEach
]).addNew('_parseQs',function(path){
	return this._parseQs_uqh(ImageManager.splitUrlQueryHash(path),1);
}).addNew('_parseHs',function(path){
	return this._parseQs_uqh(ImageManager.splitUrlQueryHash(path),2);
}).add('loadNormalBitmap',function f(){ // (path, hue)
	const uqh=ImageManager.splitUrlQueryHash(arguments[0]);
	if(uqh[1]){
		const key = this._generateCacheKey(arguments[0], arguments[1]);
		let bitmap = this._imageCache.get(key);
		if(!bitmap){
			const arg0=arguments[0];
			arguments[0]=uqh[0];
			bitmap=this.loadNormalBitmap.apply(this,arguments);
			arguments[0]=arg0;
			for(let x=0,arr=this._addedUqhListeners,xs=arr.length;x!==xs;++x) bitmap=arr[x].bind(this,bitmap,uqh)();
			//bitmap=this.loadNormalBitmap_addListener_grayScale(bitmap_base,uqh);
			this._imageCache.add(key,bitmap);
		}else if(!bitmap.isReady()){
			if(bitmap._baseBitmap) bitmap._baseBitmap.decode();
			else{ bitmap.decode(); bitmap._loadingState='loaded'; }
		}
		return bitmap;
	}else return f.ori.apply(this,arguments);
}).addNew('loadNormalBitmap_addNewUqhListener',function f(func,key){
	// func: function(uqh,newBmp,baseBmp){ ... }
	this._addedUqhListeners.push(function(bitmap_base,uqh){
		const args=this._parseQs_uqh(uqh);
		if(!args[key]) return bitmap_base;
		const bitmap=new Bitmap(1,1);
		bitmap._baseBitmap=bitmap_base._baseBitmap||bitmap_base;
		bitmap._loadingState='';
		bitmap_base.addLoadListener(func.bind(this,uqh,bitmap));
		return bitmap;
	});
	return this;
}).getP()._addedUqhListeners=[];


ImageManager.loadNormalBitmap_addNewUqhListener(function(uqh,newBmp,baseBmp){
	const w=baseBmp.width,h=baseBmp.height;
	const c=document.createElement('canvas'); c.width=w; c.height=h;
	const ctx=c.getContext('2d');
	const args=this._parseQs_uqh(uqh);
	ctx.globalCompositeOperation='copy';
	ctx.drawImage(baseBmp._canvas,0,0);
	// if(args.grayscale) // guarantee
	{
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
	newBmp.resize(w,h);
	newBmp.clear();
	newBmp.bltImage({width:w,height:h,_image:ctx.canvas},0,0,w,h,0,0);
	newBmp._loadingState='loaded';
	newBmp._callLoadListeners();
},'grayscale').loadNormalBitmap_addNewUqhListener(function(uqh,newBmp,baseBmp){
	const w=baseBmp.width,h=baseBmp.height;
	const c=document.createElement('canvas'); c.width=w; c.height=h;
	const ctx=c.getContext('2d');
	const args=this._parseQs_uqh(uqh);
	ctx.globalCompositeOperation='copy';
	ctx.drawImage(baseBmp._canvas,0,0);
	const scale=JSON.parse('['+args.scale+']');
	if(!scale[1]&&isNaN(scale[1])) scale[1]=scale[0];
	const sw=~~(Math.abs(scale[0])*w);
	const sh=~~(Math.abs(scale[1])*h);
	newBmp.resize(sw,sh);
	newBmp.clear();
	newBmp.bltImage({width:w,height:h,_image:ctx.canvas.scale(scale[0],scale[1])},0,0,w,h,0,0,sw,sh);
	newBmp._loadingState='loaded';
	newBmp._callLoadListeners();
},'scale');

})();
