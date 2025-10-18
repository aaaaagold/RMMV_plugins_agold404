"use strict";
/*:
 * @plugindesc play an animation pictures specifying only img,wait_frames,row_num,column_num
 * @author agold404
 * 
 * 
 * @help play an image frame-by-frame automatically as animation image. using
 * PIXI.Container.addImgAutoAni(img_path,wait_frames,{loop:loop_bool, delayStartFrame:delay_frames_to_start, row:row_num,col:column_num, frameIdxFirst:img_frame_idx_first,frameIdxLast:img_frame_idx_last, mirror:mirror_bool, scalex:scalex_num,scaley:scaley_num, rotate:radius_360, alpha:alpha_num, blendMode:blend_mode, dx:dx_int,dy:dy_int, });
 * which will add an ImgAutoAni sprite to `this` PIXI.Container as one of the children.
 * 
 * wait_frames: wait how many frames to switch to the next image frames
 * 
 * default loop_bool is false.
 * if result loop gets false, the created ImgAutoAni sprite will be removed from parent after last frame is played.
 * 
 * delay_frames_to_start: delay how many frames before starting playing
 * 
 * if column_num is null or undefined, default value 5 is used.
 * frame width = floor(image width / column_num)
 * 
 * if row_num is undefined, deduce frame height is as the same as frame width.
 * if row_num is undefined, the sprite ends the animation playing if the image frame is out of bound.
 * if row_num is NOT undefined, the sprite ends the animation playing after reaching the NEXT of the last row.
 * 
 * img_frame_idx_first: idx starting from 0
 * img_frame_idx_last:  idx starting from 0
 * 
 * mirror:mirror_bool
 * 
 * scalex: scale of x-aixs. *-1 if mirror_bool is true-like
 * scaley: scale of y-aixs
 * 
 * rotate: rotate the created ImgAutoAni sprite. *-1 if mirror_bool is true-like
 * 
 * alpha_num: alpha value for the ImgAutoAni sprite.
 * blend_mode: blendMode for the ImgAutoAni sprite.
 * 
 * dx,dy: x,y offset under the parent sprite. default value = 0.
 * dx: *-1 if mirror_bool is true-like
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
		delayStartFrames:opt&&opt.delayStartFrames+1,
		rowMax:opt&&opt.row,
		colMax:opt&&opt.col,
		frameWidth:opt&&opt.frameWidth,
		frameHeight:opt&&opt.frameHeight,
		frameIdxFirst:opt&&opt.frameIdxFirst-0||0,
		frameIdxLast:opt&&opt.frameIdxLast-0,
		loop:opt&&opt.loop,
		loopCnt:opt&&opt.loopCnt,
		
		waitFramesCurr:waitFrames-1, // -1 for first time update in this constructor
		frameIdxOffset:-1, // -1 for first time update in this constructor
		
		rowCurr:0, // calc. from colMax,frameIdxFirst,frameIdxLast,frameIdxCurr
		colCurr:0, // calc. from colMax,frameIdxFirst,frameIdxLast,frameIdxCurr
		frameIdxCurr:opt&&opt.frameIdxFirst-0||0, // calc. from frameIdxFirst,frameIdxLast,frameIdxCurr
		isEnd:false,
	};
	this.updateFrameParams_updateParamsValid.apply(this,arguments);
	if(!info.isValid) return;
	
	this.updateFrameParams_updateFrame.apply(this,arguments);
	if(opt&&opt.anchor) this.anchor.set(opt.anchor.x,opt.anchor.y,);
	else this.anchor.set(0.5);
	const signMul=opt&&opt.mirror?-1:1;
	const scalex=signMul*(useDefaultIfIsNaN(opt&&opt.scalex-0,1));
	const scaley=         useDefaultIfIsNaN(opt&&opt.scaley-0,1) ;
	this.scale.set(scalex,scaley);
	this.rotation=signMul*(opt&&(opt.rotate-0)*Math.PI*2/360||0);
	const dx=signMul*(opt&&opt.dx-0||0);
	const dy=         opt&&opt.dy-0||0 ;
	this.position.set(dx,dy);
	this.alpha=useDefaultIfIsNaN(opt&&opt.alpha,1);
	this.blendMode=opt&&opt.blendMode-0||0;
	
	{ const loopCnt=info.loopCnt,isEnd=info.isEnd;
	bmp.addLoadListener(bmp=>this.updateFrameParams_setFrame());
	info.loopCnt=loopCnt;
	info.isEnd=isEnd;
	}
}).
addBase('updateFrameParams_updateParamsValid',function f(){
	const info=this._imgAutoAniInfo; if(!info) return; // for flexibility usage
	if(!this.updateFrameParams_checkWaitFramesOk.apply(this,arguments)) info.isValid=false;
	info.colMax=useDefaultIfIsNone(info.colMax,5); if(isNaN(info.colMax)||(0>=(info.colMax|=0))) info.isValid=false;
	if((info.frameIdxFirst|=0)<0) info.isValid=false;
	if(info.frameIdxLast<0) info.isValid=false; else if(!isNaN(info.frameIdxLast)) info.frameIdxLast|=0;
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
	if(!(this.visible=!(0<--info.delayStartFrames))) return; // not yet to display
	if(++info.waitFramesCurr>=info.waitFramesMax){
		info.waitFramesCurr%=info.waitFramesMax;
		this.updateFrameParams_gotoNextFrame.apply(this,arguments);
		this.updateFrameParams_setFrame.apply(this,arguments);
	}
}).
addBase('updateFrameParams_gotoNextFrame',function f(){
	const info=this._imgAutoAniInfo; if(!info) return; // for flexibility usage
	++info.frameIdxOffset;
	const frameIdx=info.frameIdxLast<info.frameIdxFirst?info.frameIdxFirst-info.frameIdxOffset:info.frameIdxFirst+info.frameIdxOffset;
	info.frameIdxCurr=frameIdx;
	info.colCurr=frameIdx%info.colMax;
	info.rowCurr=Math.floor(frameIdx/info.colMax); // need to get value<0
}).
addBase('updateFrameParams_setFrame',function f(){
	const info=this._imgAutoAniInfo; if(!info) return; // for flexibility usage
	const bmp=this.bitmap; if(!bmp.isReady()) return;
	const frameWidth=isNaN(info.frameWidth)?bmp.width/info.colMax:info.frameWidth;
	const frameHeight=useDefaultIfIsNaN(info.frameHeight,isNaN(info.rowMax)?frameWidth:bmp.height/info.rowMax);
	const y=frameHeight*info.rowCurr;
	if(y+frameHeight>=bmp.height||info.rowCurr<0||(info.frameIdxLast<info.frameIdxFirst?info.frameIdxCurr<info.frameIdxLast:info.frameIdxLast<info.frameIdxCurr)){
		if(!info.loop || 0>=--info.loopCnt) info.isEnd=true;
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

