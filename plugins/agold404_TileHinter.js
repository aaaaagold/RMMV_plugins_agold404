"use strict";
/*:
 * @plugindesc hints for the type of tiles
 * @author agold404
 * 
 * 
 * @param HintSwitchBtn
 * @type text
 * @text button for showing or hiding hints
 * @desc Input a keyCode number to indicate a button on the keyboard. The others will not be guaranteed to work properly.
 * @default 72
 * 
 * @param HintGlobalAlpha
 * @type text
 * @text global alpha value for specified color
 * @desc a fraction number between 0 and 1 (both inclusive). When it is not a number, a default value 0.5 is used.
 * @default 0.5
 * 
 * @param HintColorBase
 * @type text
 * @text color: hint background
 * @desc CSS color hint's background.
 * @default rgba(255,255,0,0.5)
 * 
 * @param HintColorPassage
 * @type text
 * @text color: walk can pass border
 * @desc CSS color for border which can be passed by player in walking case.
 * @default rgba(0,255,0,0.5)
 * 
 * 
 * @help hint what type the tile is with a specified color
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_TileHinter";
const params=PluginManager.parameters(pluginName)||{};
params._hintGlobalAlpha=params.HintGlobalAlpha-0; if(isNaN(params._hintGlobalAlpha)) params._hintGlobalAlpha=0.5;
params._hintSwitchBtn=params.HintSwitchBtn-0||0;
params._hintColorBase=params.HintColorBase||'rgba(255,255,0,0.5)';
params._hintColorPassage=params.HintColorPassage||'rgba(0,255,0,0.5)';

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
"tileHinter", // 3: keyName
[32,32], // 4: 1 hint's width , height
[16,1], // 5: bmp's width cnt , height cnt
];


new cfc(SceneManager).
addBase('tileHinter_getBmp',function f(){
	let bmp=this._tileHinter_bmp; if(bmp) return bmp;
	const w=Math.min(f.tbl[4][0],$gameMap.tileWidth  ());
	const h=Math.min(f.tbl[4][1],$gameMap.tileHeight ());
	const rects=[
		[[0,h>>1,w,h-(h>>1)], 	[f.tbl[1]._hintColorBase,f.tbl[1]._hintColorPassage,],true,  [[w,h],[0,h]],],
		[[0,0,w>>1,h],        	[f.tbl[1]._hintColorPassage,f.tbl[1]._hintColorBase,],false ,[[0,h],[0,0]],],
		[[w>>1,0,w-(w>>1),h], 	[f.tbl[1]._hintColorBase,f.tbl[1]._hintColorPassage,],false ,[[w,0],[w,h]],],
		[[0,0,w,h>>1],        	[f.tbl[1]._hintColorPassage,f.tbl[1]._hintColorBase,],true  ,[[0,0],[w,0]],],
	];
	bmp=this._tileHinter_bmp=new Bitmap(w*f.tbl[5][0],h*f.tbl[5][1]);
	bmp.fillAll(f.tbl[1]._hintColorBase);
	const ctx=bmp.context;
	for(let M=rects.length,n=1<<M;n--;){
		const x0=w*n;
		for(let i=M;i--;){
			// set bit means it can be passed
			if(!(n&(1<<i))) continue;
			const rect=rects[i];
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x0+(w>>1),(h>>1));
			ctx.lineTo(x0+rect[3][0][0],rect[3][0][1]);
			ctx.lineTo(x0+rect[3][1][0],rect[3][1][1]);
			ctx.clip();
			ctx.globalCompositeOperation='copy';
			bmp.gradientFillRect(x0+rect[0][0],rect[0][1],rect[0][2],rect[0][3],rect[1][0],rect[1][1],rect[2]);
			ctx.restore();
		}
	}
	bmp._tileW=w;
	bmp._tileH=h;
	return bmp;
},t).
add('onSceneChange',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.onSceneChange_tileHinter();
	return rtv;
}).
addBase('onSceneChange_tileHinter',function f(){
	this._tileHinter_isSceneMap=(this._scene instanceof Scene_Map);
},t).
add('renderScene',function f(){
	this.tileHinter_update();
	return f.ori.apply(this,arguments);
}).
addBase('tileHinter_update',function f(){
	if(!this._tileHinter_isSceneMap) return;
	const tm=SceneManager.getTilemap(); if(!tm) return; // wait for tilemap, so spRoot can appear after tilemap
	const spRoot=this.tileHinter_getSpRoot(); if(!spRoot) return;
	const isBtnPressed=Input.isPressed(f.tbl[3]);
	if(isBtnPressed&&!spRoot._tileHinter_isBtnPressed) spRoot.visible=this._tileHinter_isShowing=!this._tileHinter_isShowing;
	spRoot._tileHinter_isBtnPressed=isBtnPressed;
	if(!spRoot.visible) return;
	// last return before frameCount
	if(spRoot._fc===Graphics.frameCount) return; // skip
	spRoot._fc=Graphics.frameCount;
	const tmw=tm.width;
	const tmh=tm.height;
	const tw=tm.tileWidth;
	const th=tm.tileHeight;
	const wn=~~(Math.ceil(tmw/tw)+1);
	const hn=~~(Math.ceil(tmh/th)+1);
	const n=wn*hn;
	const bmp=this.tileHinter_getBmp();
	for(let x=spRoot.children.length;x<n;++x){
		const sp0=new Sprite(bmp);
		const sp1=new Sprite();
		sp1.addChild(sp0);
		sp0.position.set((tw-bmp._tileW)/2,(th-bmp._tileH)/2);
		const top=sp1;
		top._sp0=sp0;
		spRoot.addChild(top);
	}
	for(let x=n,xs=spRoot.children.length;x<xs;++x) spRoot.children[x].visible=false;
	let i=0;
	const displayX0=Math.floor($gameMap._displayX);
	const displayY0=Math.floor($gameMap._displayY);
	const x0=tw*(displayX0-$gameMap._displayX);
	const y0=th*(displayY0-$gameMap._displayY);
	for(let y=0;y<hn;++y){
		for(let x=0;x<wn;++x){
			const sp=spRoot.children[i++];
			sp.visible=true;
			sp.position.set(x0+tw*x,y0+th*y);
			let idx=0;
			for(let d=10;d-=2;){
				idx<<=1;
				idx|=!!$gamePlayer.canPass(displayX0+x,displayY0+y,d);
			}
			sp._sp0.setFrame(bmp._tileW*idx,0,bmp._tileW,bmp._tileH);
		}
	}
},t).
addBase('tileHinter_getSpRoot',function f(){
	const sc=this._scene; if(!sc) return;
	let spRoot=sc._tileHinter_spRoot; if(!spRoot){
		sc.addChild(spRoot=sc._tileHinter_spRoot=new Sprite());
		sc._tileHinter_spRoot.alpha=f.tbl[1]._hintGlobalAlpha;
		spRoot.visible=!!this._tileHinter_isShowing;
	}
	return spRoot;
},t).
getP().
_tileHinter_isSceneMap=false;


if(params._hintSwitchBtn) Input.addKeyName(params._hintSwitchBtn,t[3]);


})();
