"use strict";
/*:
 * @plugindesc 黑洞v2
 * @author agold404
 * @help Graphics.renderBlackholeEffectSettings_add(
    2048,4,32,{
        x:Graphics.width*3/4-32,
        y:Graphics.height/4,
        rad:256,
        dHyperbolaC:1.0/1024,
        dRotate:0.75,
        absorbDelay:123,
        rotateDelay:8,
    }
);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Graphics).add('renderOtherEffects',function f(){
	this.renderBlackholeEffects();
	return f.ori.apply(this,arguments);
}).add('renderBlackholeEffects',function f(){
	const arr=this.renderBlackholeEffectSettings_get(); if(!arr.length&&!this._renderBlackholeEffect_isRendered) return;
	let dstC=this._renderBlackholeEffectDst;
	if(!dstC){
		const div=document.ce('div').sa('style',this._canvas.ga('style'));
		div.width=this._canvas.width;
		div.height=this._canvas.height;
		document.body.ac(
			div.ac(
				dstC=this._renderBlackholeEffectDst=document.ce('canvas').sa('style','width:100%;height:100%;')
			)
		);
		this.addAsGameCanvas(div);
	}
	let mskC=this._renderBlackholeEffectMsk; if(!mskC) mskC=this._renderBlackholeEffectMsk=document.ce('canvas');
	const mskCtx=this._renderBlackholeEffectMskCtx=mskC.getContext('2d');
	const dstCtx=this._renderBlackholeEffectDstCtx=dstC.getContext('2d',f.tbl[0]);
	{
		const rawC=Graphics._canvas;
		const rawCtx=rawC.getContext('2d',f.tbl[0]);
		const shiftBitsNeeded=(~~(arr.reduce(f.tbl[1],0)/f.tbl[2])).toString(2).length;
		const shr=this._renderBlackholeEffectShr=Math.min(f.tbl[3],shiftBitsNeeded,);
		dstC.width=mskC.width=rawC.width>>shr;
		this._renderBlackholeEffect_isRendered=false;
		const H=rawC.height>>shr; if(H!==dstC.height) dstC.height=mskC.height=H;
		dstCtx.drawImage(rawC,0,0,rawC.width,rawC.height,0,0,dstC.width,dstC.height);
	}
	this._renderBlackholeEffectDstData=dstCtx.getImageData(0,0,dstC.width,dstC.height);
	this._renderBlackholeEffectMskData=mskCtx.getImageData(0,0,mskC.width,mskC.height);
	
	arr.forEach(this.renderBlackholeEffect1,(this));
	const keep=[]; arr.forEach(f.tbl[4],(keep));
	if(keep.length!==arr.length){ arr.length=0; arr.concat_inplace(keep); }
	
	mskCtx.putImageData(this._renderBlackholeEffectMskData,0,0);
	dstCtx.putImageData(this._renderBlackholeEffectDstData,0,0);
	dstCtx.save();
	dstCtx.globalCompositeOperation="destination-atop";
	dstCtx.drawImage(mskC,0,0);
	dstCtx.restore();
},[
{imageSmoothingEnabled:true,imageSmoothingQuality:"high",}, // 0: context setting
(r,state)=>r+(state.setting&&state.setting.rad*state.setting.rad-0||0), // 1: reduce: sum total area
1<<15, // 2: shift oneMoreBit threshold
0|3, // 3: max shift bits
function(state){ if(state.dur<state.durTotal) this.push(state); }, // 4: keep
]).add('renderBlackholeEffectSettings_get',function f(){
	let rtv=this._renderBlackholeEffectSettings; if(!rtv) rtv=this._renderBlackholeEffectSettings=[];
	return rtv;
}).add('renderBlackholeEffectSettings_add',function f(totalDur,fadeInDur,fadeOutDur,holeSetting){
	totalDur|=0;
	fadeInDur|=0; if(fadeInDur<0) fadeInDur=0;
	fadeOutDur|=0; if(fadeOutDur<0) fadeOutDur=0;
	if(!(0<totalDur)||totalDur<fadeInDur+fadeOutDur) return -1;
	const info={
		dur:0,
		durTotal:totalDur,
		durFadeOut:fadeOutDur,
		frameFadeIn:fadeInDur,
		frameFadeOutStart:totalDur-fadeOutDur,
		setting:holeSetting,
	};
	this.renderBlackholeEffectSettings_get().push(info);
	return info;
}).add('renderBlackholeEffect1',function f(state,i){
	const setting=state.setting;
	if(!setting) return; // setting is also state
	if(!(state.lastFrame<Graphics.frameCount)) state.lastFrame=Graphics.frameCount-1;
	const df=Graphics.frameCount-state.lastFrame||0; state.lastFrame=Graphics.frameCount;
	state.dur+=df;
	const alpha=(state.dur<state.frameFadeIn?state.dur/state.frameFadeIn:(state.frameFadeOutStart<state.dur?(state.durTotal-state.dur)/state.durFadeOut:1))||0;
	const alpha_1=1-alpha;
	
	const mskData=this._renderBlackholeEffectMskData;
	const dstData=this._renderBlackholeEffectDstData;
	const shr=this._renderBlackholeEffectShr;
	const radRaw=setting.rad-0||0;
	const followXy=setting.follow?(setting.follow.getGlobalPosition?setting.follow.getGlobalPosition():({x:setting.follow.x,y:setting.follow.y})):({x:0,y:0});
	const xRaw=(setting.x-0||0)+(followXy.x-0||0);
	const yRaw=(setting.y-0||0)+(followXy.y-0||0);
	const N=1<<shr;
	const ox=xRaw/N;
	const oy=yRaw/N;
	const rad0=radRaw/N;
	const rad2=rad0*rad0;
	const xMin0=~~Math.max(0,ox-rad0-1),xMax0=~~Math.min(dstData.width-1,ox+rad0+1);
	const yMin0=~~Math.max(0,oy-rad0-1),yMax0=~~Math.min(dstData.height-1,oy+rad0+1);
	const dRotate=setting.dRotate-0||0;
	const rotateDelay=setting.rotateDelay-0||0;
	const dHyperbolaC=setting.dHyperbolaC-0||0;
	const absorbDelay=setting.absorbDelay-0||0;
	const rotateRate=setting.rotateRate-0||0;
	
	if(!setting.rotate) setting.rotate=0;
	if(rotateDelay<state.dur) setting.rotate+=dRotate;
	if(!setting.hyperbolaC) setting.hyperbolaC=0;
	if(absorbDelay<state.dur) setting.hyperbolaC+=dHyperbolaC;
	
	const srcData=dstData.data.slice();
	const rotC=Math.PI/180;
	for(let y=yMin0,tmp;y<=yMax0;++y){ for(let x=xMin0;x<=xMax0;++x){
		const dx=x-ox,dy=y-oy;
		const r2=dx*dx+dy*dy; if(!r2||r2>=rad2) continue;
		const idxB=(y*dstData.width+x)<<2;
		const r1=Math.sqrt(r2);
		const distRate=r1/rad0;
		const rate1=Math.sqrt(setting.hyperbolaC+distRate*distRate);
		const rate=Math.min(rate1,1)/r1*rad0;
		const sx0=dx*rate,sy0=dy*rate;
		tmp=1-distRate;
		const rot=rotC*setting.rotate*(tmp*tmp*tmp);
		const cos=Math.cos(rot),sin=Math.sin(rot);
		const sx1=cos*sx0-sin*sy0,sy1=sin*sx0+cos*sy0;
		
		const sx2=sx1+ox,sy2=sy1+oy;
		const scale=Math.min(sx2.clamp(xMin0,xMax0)/sx2,sy2.clamp(yMin0,yMax0)/sy2);
		const sx3=sx2*scale,sy3=sy2*scale;
		const sx3f=Math.floor(sx3),sx3c=Math.ceil(sx3);
		const sy3f=Math.floor(sy3),sy3c=Math.ceil(sy3);
		const rx=sx3-sx3f,ry=sy3-sy3f;
		const idx3v=[
			(sy3f*dstData.width+sx3f)<<2,
			(sy3f*dstData.width+sx3c)<<2,
			(sy3c*dstData.width+sx3f)<<2,
			(sy3c*dstData.width+sx3c)<<2,
		],rv=[
			(1-rx)*(1-ry),
			(  rx)*(1-ry),
			(1-rx)*(  ry),
			(  rx)*(  ry),
		];
		
		for(let c=4;c--;){
			tmp=0; /* if(1<rate1) tmp=c===3?255:0; else */ for(let t=rv.length;t--;) tmp+=srcData[idx3v[t]|c]*rv[t];
			dstData.data[idxB|c]=srcData[idxB|c]*alpha_1+tmp*alpha;
		}
		mskData.data[idxB|3]=Math.max(mskData.data[idxB|3],255*alpha);
	} }
	this._renderBlackholeEffect_isRendered=true;
});

new cfc(Sprite.prototype).add('renderBlackholeEffectSettings_add',function f(totalDur,fadeInDur,fadeOutDur,holeSetting){
	if(!holeSetting) return;
	const info={}; for(let k in holeSetting) info[k]=holeSetting[k];
	info.follow=this;
	return Graphics.renderBlackholeEffectSettings_add(totalDur,fadeInDur,fadeOutDur,info);
});

new cfc(Game_Actor.prototype).add('renderBlackholeEffectSettings_add',function f(totalDur,fadeInDur,fadeOutDur,holeSetting){
	const sc=SceneManager._scene;
	const m=sc&&sc._btlr2sp;
	const sp=m&&m.get(this); if(!sp) return;
	return sp.renderBlackholeEffectSettings_add.apply(sp,arguments);
});

new cfc(Game_Character.prototype).add('renderBlackholeEffectSettings_add',function f(totalDur,fadeInDur,fadeOutDur,holeSetting){
	const sc=SceneManager._scene;
	const m=sc&&sc._chr2sp;
	const sp=m&&m.get(this); if(!sp) return;
	return sp.renderBlackholeEffectSettings_add.apply(sp,arguments);
});

})();
