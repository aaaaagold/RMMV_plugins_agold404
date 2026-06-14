"use strict";
/*:
 * @plugindesc Show Custom Cursor in the game
 * @author agold404
 * 
 * 
 * @param ImagePath
 * @type text
 * @text Cursor Image Path
 * @desc relative path to the image
 * @default img/characters/!Flame.png
 * 
 * @param ImageRects
 * @type note
 * @text Cursor Image Array of Rectangles (x,y,width,height)
 * @desc fill an array to represent an animated cursor
 * @default "[\n[384,240,48,48],\n[384,288,48,48],\n]"
 * 
 * @param ImageAnchor
 * @type note
 * @text Cursor Image Center Ratio (anchor)
 * @desc ratio of center point inside the width and inside the height
 * @default "[0.5,0.5]"
 * 
 * @param ImageAnimatedDelay
 * @type note
 * @text Cursor Image Delay
 * @desc a delay to switch to the next rectangle. minimum effect equals 1.
 * @default 16
 * 
 * 
 * @help APIs:
 *  // TODO
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_CustomCursor";
const params=PluginManager.parameters(pluginName)||{};
params._imagePath=params.ImagePath;
params._imageRects=EVAL.call(undefined,JSON.parse(params.ImageRects||'""'));
params._imageAnchor=EVAL.call(undefined,JSON.parse(params.ImageAnchor||'[0.5,0.5]'));
params._imageAnimatedDelay=useDefaultIfIsNaN(params.ImageAnimatedDelay,16);
params._isSettingOk=!!(params._imagePath&&params._imageRects&&params._imageAnchor);


t=[
undefined,
params,
window.isTest(),
undefined,
'none', // 4: style.cursor
'', // 5: style.cursor
];


{ const p=SceneManager;
new cfc(p).
addBase('_customCursorUpdater_setCss_cursor',function f(val){
	document.body.style.cursor=val;
	const c=Graphics._canvas; if(c) c.style.cursor=val;
}).
addBase('_customCursorUpdater_createObject',function f(){
	if(!f.tbl[1]._isSettingOk) return;
	const sc=SceneManager._scene;
	if(!sc) return;
	let sp=sc._customCursor; if(!sp){
		sp=sc._customCursor=new Sprite(ImageManager.loadNormalBitmap(f.tbl[1]._imagePath));
		sp._customCursorData={
			frameIdxCurr:f.tbl[1]._imageRects.length-1, // last frame
			frameIdxMax:f.tbl[1]._imageRects.length,
			frameDelayCurr:1, // update instantly
			frameDelayMax:f.tbl[1]._imageAnimatedDelay,
		};
		const a=f.tbl[1]._imageAnchor;
		sp.anchor.set(a[0],a[1]);
	}
},t).
addBase('_customCursorUpdater_preFrame',function f(){
	const c=Graphics._canvas;
	const sc=SceneManager._scene;
	const sp=sc&&sc._customCursor;
	if(!sp||!sp.bitmap.isReady()){
		SceneManager._customCursorUpdater_setCss_cursor(f.tbl[5]);
		return;
	}
	if(sp&&sc.children.back!==sp) sc.addChild(sp);
	const info=sp._customCursorData;
	if(!(0<--info.frameDelayCurr)){
		info.frameDelayCurr=info.frameDelayMax;
		info.frameIdxCurr=(info.frameIdxCurr+1)%info.frameIdxMax;
	}
	SceneManager._customCursorUpdater_setCss_cursor(f.tbl[4]);
},t).
addBase('_customCursorUpdater_movePosition',function f(){
	const sc=SceneManager._scene;
	const sp=sc&&sc._customCursor;
	if(!sp||!sp.bitmap.isReady()) return;
	;
	{
		const info=sp._customCursorData;
		const rect=f.tbl[1]._imageRects[info.frameIdxCurr];
		if(rect){
			sp.visible=true;
			sp.setFrame.apply(sp,rect);
		}else sp.visible=false;
	}
	{
		const ti=TouchInput;
		sp.position.set(ti.x,ti.y);
	}
},t).
addBase('_customCursorUpdater_visiblility',function f(){
	// `this` might not be `SceneManager` 
	const sc=SceneManager._scene;
	const sp=sc&&sc._customCursor;
	if(!sp) return;
	const vis=sp.visible=SceneManager._customCursor_isVisible;
	SceneManager._customCursorUpdater_setCss_cursor(vis?f.tbl[4]:f.tbl[5]);
},t).
addBase('_customCursorUpdater_handlePaused',function f(){
	// `this` might not be `SceneManager` 
	if(SceneManager._stopped||SceneManager._isPressPPaused) SceneManager._customCursorUpdater_setCss_cursor(f.tbl[5]);
	requestAnimationFrame(f);
},t).
addBase('_customCursorUpdater_show',function f(){
	this._customCursor_isVisible=true;
},t).
addBase('_customCursorUpdater_hide',function f(){
	this._customCursor_isVisible=false;
},t).
getP().
additionalUpdate_changeScene_add(p._customCursorUpdater_createObject,  true).
additionalUpdate_updateScene_add(p._customCursorUpdater_preFrame,     false).
// the order will be stable
additionalUpdate_renderScene_add(p._customCursorUpdater_movePosition, false).
additionalUpdate_renderScene_add(p._customCursorUpdater_visiblility,  false).
getP;
}

for(let evts=[
'pointerdown',
'pointermove',
],x=evts.length;x--;){ const evt=evts[x]; document.addEventListener(evt,function f(){
	SceneManager._customCursorUpdater_show();
	document.removeEventListener(evt,f);
}); }
setTimeout(SceneManager._customCursorUpdater_handlePaused,1); // ?_? 


})();

