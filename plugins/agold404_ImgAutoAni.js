"use strict";
/*:
 * @plugindesc play an animation pictures specifying only img,wait_frames,row_num,column_num
 * @author agold404
 * 
 * 
 * @help play an image frame-by-frame automatically as animation image. using
 * PIXI.Container.addImgAutoAni(img_path,wait_frames,{loop:loop_bool,row:row_num,col:column_num,dx:dx_int,dy:dy_int,rotate:PI_radius});
 * which will add an ImgAutoAni sprite to `this` PIXI.Container as one of the children.
 * 
 * wait_frames: wait how many frames to switch to the next image frames
 * 
 * default loop_bool is false.
 * if result loop gets false, the created ImgAutoAni sprite will be removed from parent after last frame is played.
 * 
 * if column_num is null or undefined, default value 5 is used.
 * frame width = floor(image width / column_num)
 * 
 * if row_num is null or undefined, deduce frame height is as the same as frame width.
 * if row_num is null or undefined, the sprite ends the animation playing if the image frame is out of bound.
 * if row_num is NOT (null or undefined), the sprite ends the animation playing after reaching the NEXT of the last row.
 * 
 * dx,dy: x,y offset under the parent sprite. default value = 0.
 * 
 * rotate: rotate the created ImgAutoAni sprite.
 * 
 * 
 * ImgAutoAni sprite will start playing when created, even if the image is not loaded yet.
 * 
 * 
 * e.g.
 * $gamePlayer.getSprite().addImgAutoAni('img/animations/Explosion1.png',1,{row:3,});
 * which will play the image in the following order:
 *  0  1  2  3  4
 *  5  6  7  8  9
 * 10 11 12 13 14
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_ImgAutoAni";
const params=PluginManager.parameters(pluginName)||{};


t=[
undefined,
params,
window.isTest(),
[{}], // 3: dummy info
];


{ const a=class Sprite_ImgAutoAni extends Sprite{
};
new cfc(a.prototype).
addBase('initialize',function f(bmp,waitFrames,opt){
	arguments[1]=
	arguments[2]=
		undefined;
	f._super.initialize.apply(this,arguments);
	const info=this._imgAutoAniInfo={
		isValid:true,
		waitFramesMax:waitFrames,
		opt:opt,
		rowMax:opt&&opt.row,
		colMax:opt&&opt.col,
		frameWidth:opt&&opt.frameWidth,
		frameHeight:opt&&opt.frameHeight,
		loop:opt&&opt.loop,
		
		waitFramesCurr:waitFrames, // first time update
		rowCurr:0,
		colCurr:0,
		isEnd:false,
	};
	this.updateFrameParams_updateParamsValid.apply(this,arguments);
	if(!info.isValid) return;
	
	this.updateFrameParams_updateFrame.apply(this,arguments);
	if(opt&&opt.anchor) this.anchor.set(opt.anchor.x,opt.anchor.y,);
	else this.anchor.set(0.5);
	const dx=opt&&opt.dx-0||0;
	const dy=opt&&opt.dy-0||0;
	this.position.set(dx,dy);
	this.rotation=opt&&opt.rotate-0||0;
}).
addBase('updateFrameParams_updateParamsValid',function f(){
	const info=this._imgAutoAniInfo; if(!info) return; // for flexibility usage
	if(!this.updateFrameParams_checkWaitFramesOk.apply(this,arguments)) info.isValid=false;
	info.colMax=useDefaultIfIsNone(info.colMax,5); if(isNaN(info.colMax)||(0>=(info.colMax|=0))) info.isValid=false;
}).
addBase('updateFrameParams_checkWaitFramesOk',function f(){
	const info=this._imgAutoAniInfo;
	return info&&info.waitFramesMax>=1;
}).
addBase('update',function f(){
	const rtv=f._super.update.apply(this,arguments);
	this.updateFrameParams.apply(this,arguments);
	return rtv;
}).
addBase('updateFrameParams',function f(){
	const info=this._imgAutoAniInfo; if(!info) return; // not yet. might be caused by other plugins
	if(!info.isValid){
		this.updateFrameParams_removeFromParent.apply(this,arguments);
		return;
	}
	this.updateFrameParams_updateFrame.apply(this,arguments);
	if(this.updateFrameParams_checkEnd.apply(this,arguments)){
		this.updateFrameParams_removeFromParent.apply(this,arguments);
		return;
	}
}).
addBase('updateFrameParams_updateFrame',function f(){
	const info=this._imgAutoAniInfo; if(!info) return; // for flexibility usage
	if(++info.waitFramesCurr>=info.waitFramesMax){
		info.waitFramesCurr%=info.waitFramesMax;
		this.updateFrameParams_gotoNextFrame.apply(this,arguments);
		this.updateFrameParams_setFrame.apply(this,arguments);
	}
}).
addBase('updateFrameParams_gotoNextFrame',function f(){
	const info=this._imgAutoAniInfo; if(!info) return; // for flexibility usage
	if(++info.colCurr<info.colMax) return;
	else info.colCurr%=info.colMax;
	++info.rowCurr;
	if(isNaN(info.rowMax)){
	}else if(info.rowCurr<info.rowMax) return;
	else info.rowCurr%=info.rowMax;
}).
addBase('updateFrameParams_setFrame',function f(){
	const info=this._imgAutoAniInfo; if(!info) return; // for flexibility usage
	const bmp=this.bitmap; if(!bmp.isReady()) return;
	const frameWidth=isNaN(info.frameWidth)?bmp.width/info.colMax:info.frameWidth;
	const frameHeight=useDefaultIfIsNaN(info.frameHeight,isNaN(info.rowMax)?frameWidth:bmp.height/info.rowMax);
	const y=frameHeight*info.rowCurr;
	if(y+frameHeight>=bmp.height){
		if(info.loop) info.rowCurr=0;
		else info.isEnd=true;
	}else this.setFrame(frameWidth*info.colCurr,y,frameWidth,frameHeight);
}).
addBase('updateFrameParams_checkEnd',function f(){
	const info=this._imgAutoAniInfo;
	return info&&info.isEnd;
}).
addBase('updateFrameParams_removeFromParent',function f(){
	if(this.parent) this.parent.removeChild(this);
}).
getP;
window[a.name]=a; }


new cfc(PIXI.Container.prototype).
addBase('addImgAutoAni',function f(imgPath,waitFrames,opt){
	this.addChild(new Sprite_ImgAutoAni(ImageManager.loadNormalBitmap(imgPath),waitFrames,opt));
}).
getP;


})();
