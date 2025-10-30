"use strict";
/*:
 * @plugindesc SceneManager.gathering_gen / SceneManager.集氣_gen 
 * @author agold404
 * @help .
 *
SceneManager.集氣_gen(345,234,0.5,4,Graphics.boxWidth>>1,Graphics.boxHeight>>1,"img/pictures/3_石頭.png",[[1.0/2,"img/pictures/3_石頭.png"],[1.0/2,"img/pictures/3_布.png"],[1.0/2,"img/pictures/3_剪刀.png"]],64,16);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(SceneManager).
addBase('集氣_getCont',function f(){
	let rtv=this._集氣; if(!rtv) rtv=this._集氣=[];
	return rtv;
}).
addBase('集氣_gen',function f(totalFrames,newChildFrames,childrenPerFrame,finalScale,x0,y0,mainPicPath,otherPicPaths,fadeOutFrames,fadeInFrames,initScale,opt){
	/*
	mainPicPath: string
	otherPicPaths: [[scale,string], ... ]
	*/
	const sc=this._scene; if(!sc) return -1;
	
	totalFrames|=0;
	newChildFrames|=0;
	childrenPerFrame-=0;
	fadeOutFrames|=0;
	fadeInFrames|=0;
	if(!(totalFrames>=fadeOutFrames+fadeInFrames)||!(0<childrenPerFrame)||!otherPicPaths||!otherPicPaths.length) return -2;
	opt=opt||{};
	
	const bmp=ImageManager.loadNormalBitmap(mainPicPath);
	const info={
		mainPicPath:mainPicPath,
		otherPicPaths:otherPicPaths,
		scene:sc,
		currFrame:0,
		totalFrames:totalFrames,
		newChildFrames:newChildFrames,
		fadeOutFrames:fadeOutFrames,
		fadeInFrames:fadeInFrames,
		initScale:initScale||0,
		finalScale:finalScale,
		childrenPerFrame_config:childrenPerFrame,
		childrenPerFrame_curr:0,
		x0:x0,
		y0:y0,
		childStartDist:opt.childStartDist||f.tbl[0].childStartDist,
		childFrames_2:(opt.childFrames||f.tbl[0].childFrames)>>1,
		childSpeed:opt.childSpeed||f.tbl[0].childSpeed,
		childMaxAlpha:opt.childMaxAlpha||f.tbl[0].childMaxAlpha,
		follow:opt.follow,
		opt:opt,
		sp:new Sprite(bmp),
		root:new Sprite(),
	};
	bmp.addLoadListener(this.集氣_onload.bind(info.sp));
	this.集氣_getCont().push(info);
	info.sp.alpha=0;
	info.root.position.set(x0,y0);
	info.root.addChild(info.sp);
	info.root.addChild(info.root._cs=new Sprite());
	sc.addChild(info.root);
	// TODO: rtv
	return info;
},[
{
childStartDist:[0.25,1.125],
childFrames:64,
childSpeed:[1.0/256,1.0/16],
childMaxAlpha:[0.25,0.75],
},
]).
addBase('集氣_update_rootPosition',function f(info){
	if(info.follow){ const xy=info.follow.getGlobalPosition(); info.root.position.set(info.x0+(xy.x||0),info.y0+(xy.y||0)); }
}).
addBase('集氣_update',function f(){
	let i=0,j=0,arr=this.集氣_getCont();
	for(const sc=this._scene,sz=arr.length,pi2=Math.PI*2;j!==sz;++j){ const info=arr[j];
		const sp=info.sp;
		const r=(++info.currFrame/info.totalFrames);
		if(sc!==info.scene||!(1>=r)){ info.root.destroy(); continue; }
		const fadingFrames=info.totalFrames-info.currFrame;
		if(info.currFrame<info.fadeInFrames) info.sp.alpha=info.currFrame/info.fadeInFrames;
		else if(fadingFrames<info.fadeOutFrames) info.sp.alpha=fadingFrames/info.fadeOutFrames;
		else if(info.sp.alpha!==1) info.sp.alpha=1;
		if(info.sp.bitmap.isReady()){
			this.集氣_update_rootPosition(info);
			const distScale=info.finalScale-info.initScale;
			const scale=info.initScale+r*distScale;
			if(scale){ info.sp.visible=true; info.sp.scale.set(scale); }
			else info.sp.visible=false;
			const childFrames=info.childFrames_2<<1;
			if(info.newChildFrames>=info.currFrame){ for(info.childrenPerFrame_curr+=info.childrenPerFrame_config;info.childrenPerFrame_curr>=0;--info.childrenPerFrame_curr){
				const choice=info.otherPicPaths.rnd1();
				const bmp=ImageManager.loadNormalBitmap(choice[1]);
				const newsp=new Sprite(bmp);
				bmp.addLoadListener(this.集氣_onload.bind(newsp));
				newsp.scale.set(choice[0]);
				const dist1=info.sp._r;
				const d=(Math.random()*(info.childStartDist[1]-info.childStartDist[0])+info.childStartDist[0])*dist1*Math.max(scale,1);
				const r=Math.random()*pi2;
				const sin=Math.sin(r),cos=Math.cos(r);
				newsp.position.set(sin*d,cos*d);
				newsp._curr=childFrames;
				let spd=(Math.random()*(info.childSpeed[1]-info.childSpeed[0])+info.childSpeed[0])*dist1;
				if(d<spd*newsp._curr) spd=d/newsp._curr;
				newsp._spdx=-sin*spd;
				newsp._spdy=-cos*spd;
				newsp._maxAlpha=Math.random()*(info.childMaxAlpha[1]-info.childMaxAlpha[0])+info.childMaxAlpha[0];
				info.root._cs.addChild(newsp);
			} }
			// update children
			const delList=[];
			for(let x=0,cs=info.root._cs.children,xs=cs.length;x!==xs;++x){
				const c=cs.getnth(x); if(!(0<--c._curr)){ delList.push(c); continue; }
				c.position.set(c.x+c._spdx,c.y+c._spdy);
				c.alpha=((info.childFrames_2-Math.abs(c._curr-info.childFrames_2))/info.childFrames_2)*c._maxAlpha;
			}
			for(let c;c=delList.pop();) c.destroy();
		}
		arr[i++]=info;
	}
	arr.length=i;
}).
addBase('集氣_onload',function f(bmp){
	this.anchor.set(0.5);
	this._r=Math.max(bmp.width,bmp.height);
}).add('updateScene',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.集氣_update();
	return rtv;
}).
addBase('gathering_gen',function f(
	totalFrames,newChildFrames,childrenPerFrame,finalScale,
	x0,y0,
	mainPicPath,otherPicPaths,
	fadeOutFrames,fadeInFrames,initScale,
	opt,
){
	return this.集氣_gen.apply(this,arguments);
});

t=[]; t.length=2;
new cfc(Sprite.prototype).
addBase('集氣_gen',t[0]=function f(
	totalFrames,newChildFrames,childrenPerFrame,finalScale,
	x0,y0,
	mainPicPath,otherPicPaths,
	fadeOutFrames,fadeInFrames,initScale,
	opt,
){
	const a=SceneManager;
	const rtv=a.集氣_gen.apply(a,arguments);
	rtv.follow=this;
	return rtv;
}).
addBase('gathering_gen',t[1]=function f(
	totalFrames,newChildFrames,childrenPerFrame,finalScale,
	x0,y0,
	mainPicPath,otherPicPaths,
	fadeOutFrames,fadeInFrames,initScale,
	opt,
){
	return this.集氣_gen.apply(this,arguments);
});

Window_Base.prototype.集氣_gen=t[0];
Window_Base.prototype.gathering_gen=t[1];

})();
