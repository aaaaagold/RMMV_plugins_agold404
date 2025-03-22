"use strict";
/*:
 * @plugindesc Preload Bitmap to implement cache, by putting sprites out of the screen at every scene from the game start
 * @author agold404
 * 
 * 
 * @param BitmapPaths
 * @type text[]
 * @text bitmaps to be cached
 * @desc path might be like img/path/to/file.png
 * 
 * 
 * @help add image paths in plugin parameters to load those images at the game start,
 * and this will ensures there will be sprites put in the current scene.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_PreloadBitmapsCache";
const params=PluginManager.parameters(pluginName)||{};
params._bitmapPaths=new Set(JSON.parse(params.BitmapPaths||"[]"));

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
function f(path){
	let hue; { const m=path&&path.match(f.tbl[4]);
	if(m){
		path=path.slice(0,m.index);
		hue=m[1]-0;
	} }
	ImageManager.loadNormalBitmap(path,hue);
}, // 3: forEach path
/:([0-9]+)$/, // 4: hue matcher
];
t[3].tbl=t;


new cfc(ImageManager).
add('loadNormalBitmap',function f(path,hue){
	let bmp;
	if(this.preloadBitmapCache_needCache(path)){
		bmp=this.preloadBitmapCache_getBmp(path,hue);
		if(!bmp){
			bmp=f.ori.apply(this,arguments);
			this.preloadBitmapCache_setBmp(path,hue,bmp);
		}
	}else bmp=f.ori.apply(this,arguments);
	return bmp;
}).
addBase('preloadBitmapCache_needCache',function f(path){
	return f.tbl[1]._bitmapPaths.has(path);
},t).
addBase('preloadBitmapCache_getBmp',function f(path,hue){
	const key=this._generateCacheKey(path,hue);
	return this._preloadBitmapCache_tbl.kvGetVal(key);
},t).
addBase('preloadBitmapCache_setBmp',function f(path,hue,bmp){
	const key=this._generateCacheKey(path,hue);
	this._preloadBitmapCache_tbl.kvPush(key,bmp);
	return this;
},t).
addBase('preloadBitmapCache_delBmp',function f(path,hue){
	const key=this._generateCacheKey(path,hue);
	this._preloadBitmapCache_tbl.kvPop(key);
	return this;
},t).
getP()._preloadBitmapCache_tbl=[];


new cfc(Scene_Boot.prototype).
add('start_before',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.preloadBitmapCache_loadPluginParamBmps();
	return rtv;
}).
addBase('preloadBitmapCache_loadPluginParamBmps',function f(){
	f.tbl[1]._bitmapPaths.forEach(f.tbl[3],this);
},t).
getP;

let lastScene;
SceneManager.additionalUpdate_updateScene_add(()=>{
	const sc=SceneManager._scene; if(!sc||lastScene===sc) return;
	lastScene=sc;
	const root=sc._preloadBitmapCache_spriteRoot=new Sprite();
	sc.addChild(root);
	for(let arr=ImageManager._preloadBitmapCache_tbl,x=arr.length,sp;x--;){
		root.addChild(sp=new Sprite(arr.kvGetVal(arr.kvGetKey(x))));
		sp.anchor.set(0);
		sp.scale.set(-1);
	}
});


})();
