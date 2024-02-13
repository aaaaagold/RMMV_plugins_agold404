"use strict";
/*:
 * @plugindesc black holes visual effect api
 * @author agold404
 * @help $gameScreen.renderBlackHolesEffect_genHole({x:384,y:256,r:0,},{x:512,y:512,r:128,},0,64,8);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Graphics).add('renderOtherEffects',function f(){
	this.renderBlackHolesEffect();
	return f.ori.apply(this,arguments);
}).add('renderBlackHolesEffect',function f(){
	const d=document;
	if(!f.tbl[1]){
		const div=d.ce('div').sa('style',this._canvas.ga('style'));
		div.width=this._canvas.width;
		div.height=this._canvas.height;
		d.body.ac(div.ac(f.tbl[1]=d.ce('canvas').sa('style','width:100%;height:100%;')));
		this.addAsGameCanvas(div);
	}
	const dstCanvas=f.tbl[1];
	const dstCtx=f.tbl[2]||(f.tbl[2]=dstCanvas.getContext('2d'));
	const dstW=~~(f.tbl[3]*this._canvas.width),dstH=~~(f.tbl[3]*this._canvas.height);
	{ let needClear=true;
	if(dstCanvas.width!==dstW){ dstCanvas.width=dstW; needClear=false; }
	if(dstCanvas.height!==dstH){ dstCanvas.height=dstH; needClear=false; }
	if(needClear) dstCtx.clearRect(0,0,dstW,dstH);
	}
	if(Graphics.frameCount<f.tbl[0]) f.tbl[0]=Graphics.frameCount; // new game or load game
	const dfc=Graphics.frameCount-f.tbl[0];
	f.tbl[0]=Graphics.frameCount;
	
	if(!$gameScreen) return;
	const cont=$gameScreen.renderBlackHolesEffect_getCont(); if(!cont.length) return;
	
	const srcData=this.getImageData(),dstData=dstCtx.getImageData(0,0,dstW,dstH);
	const infos=cont.slice(); cont.length=0;
	for(let i=0,sz=infos.length;i!==sz;++i){
		const info=infos[i];
		const opt=info.opt;
		info.dur+=dfc;
		
		const r1=info.dur/info.fadeOutFc; if(!(1>=r1)) continue;
		const r0=1-r1;
		let refX=0,refY=0,sp;
		if(!isNaN(opt.evtId)){
			if(!SceneManager.isScene_map()) continue;
			const chr=$gameMap._events[opt.evtId]||$gamePlayer;
			sp=chr&&chr.getSprite(); if(!sp) continue;
		}else if(opt.btlr){
			if(!SceneManager.isScene_battle()) continue;
			sp=opt.btlr.getSprite(); if(!sp) continue;
		}
		if(sp){
			refX=sp.x;
			refY=sp.y;
		}
		const holeX=refX+info.holeXyr0.x*r0+info.holeXyr1.x*r1;
		const holeY=refY+info.holeXyr0.y*r0+info.holeXyr1.y*r1;
		const holeR=info.holeXyr0.r*r0+info.holeXyr1.r*r1;
		const alpha=info.dur>=info.fadeInFc?info.keepFc<info.dur?(info.fadeOutFc-info.dur)/(info.fadeOutFc-info.keepFc):1:info.dur/info.fadeInFc;
		
		this.renderBlackHolesEffect_drawHole1(srcData,dstData,f.tbl[3],alpha,holeX,holeY,holeR,opt&&opt.holeCenterColor);
		cont.push(info);
	}
	dstCtx.putImageData(dstData,0,0);
},[
0, // 0: fc
undefined, // 1: canvas
undefined, // 2: ctx
0.25, // 3: dstScale
]).add('renderBlackHolesEffect_drawHole1',function f(srcData,dstData,dstScale,alpha,holeX,holeY,holeR,holeCenterColor){
	if(!(0<dstScale)||!(0<holeR)) return;
	holeCenterColor=holeCenterColor||f.tbl[0];
	
	const r=holeR*dstScale,ox=~~(holeX*dstScale),oy=~~(holeY*dstScale),dstW=dstData.width,srcW=srcData.width,srcW_1=srcW-1,srcH_1=srcData.height-1,isWebGL=this.isWebGL();
	const r2=r*r,yL=Math.min(oy+r,dstData.height-1)|0,xL=Math.min(ox+r,dstW-1)|0,x0=Math.max(ox-r,0)|0;
	for(let y=Math.max(oy-r,0)|0;y<=yL;++y){ for(let x=x0;x<=xL;++x){
		const dx=x-ox,dy=y-oy,dist2=dx*dx+dy*dy; if(r2<dist2) continue;
		const dstIdx=(y*dstW+x)<<2;
		const rad01=Math.sqrt(dist2/r2);
		let dx1=dx/rad01,dy1=dy/rad01;
		const dstX1=ox+dx1,dstY1=oy+dy1;
		const dstX1c=dstX1.clamp(0,xL),dstY1c=dstY1.clamp(0,yL);
		const r1x=(dstX1c-ox)/dx1,r1y=(dstY1c-oy)/dy1;
		const r1c=Math.min(r1x||Infinity,r1y||Infinity);
		dx1*=r1c; dy1*=r1c;
		const dstIdx1=((~~(oy+dy1)).clamp(0,yL)*dstW+(~~(ox+dx1)).clamp(0,xL))<<2;
		const srcX=(~~(holeX+dx1/dstScale)).clamp(0,srcW_1),srcY=(~~(holeY+dy1/dstScale)).clamp(0,srcH_1);
		const srcIdx=((isWebGL?srcH_1-srcY:srcY)*srcW+srcX)<<2,p=rad01;
		const q=1-p,dstAR1=dstData.data[dstIdx1|3]/255;
		const srcAR1=1-dstAR1;
		for(let c=0;c!==4;++c){
			const srcC=(srcAR1*srcData.data[srcIdx|c]+dstAR1*dstData.data[dstIdx1|c]);
			dstData.data[dstIdx|c]=(1-alpha)*dstData.data[dstIdx|c]+alpha*(srcC*p+holeCenterColor[c]*q);
		}
	} }
},[
[0,0,0,255], // 0: default hole center color
]).add('renderBlackHolesEffect_dstScale',()=>0.25);

new cfc(Game_Screen.prototype).add('renderBlackHolesEffect_getCont',function f(){
	let rtv=this._renderBlackHolesEffectv; if(!rtv) rtv=this._renderBlackHolesEffectv=[];
	return rtv;
}).add('renderBlackHolesEffect_genHole',function f(holeXyr0,holeXyr1,fadeInFc,keepFc,fadeOutFc,opt){
	if(!holeXyr0) holeXyr0=holeXyr1;
	if(!holeXyr1) holeXyr1=holeXyr0;
	if(!holeXyr0||!holeXyr1) return;
	const r0=holeXyr0.r|0,r1=holeXyr1.r|0; if(!r0&&!r1) return;
	holeXyr0.x|=0;
	holeXyr0.y|=0;
	holeXyr1.x|=0;
	holeXyr1.y|=0;
	fadeInFc|=0;
	keepFc|=0;
	fadeOutFc|=0;
	keepFc+=fadeInFc;
	fadeOutFc+=keepFc;
	if(!(0<fadeOutFc)) return;
	
	opt=opt||{};
	this.renderBlackHolesEffect_getCont().push({
		holeXyr0:holeXyr0,
		holeXyr1:holeXyr1,
		dur:0,
		fadeInFc:fadeInFc,
		keepFc:keepFc,
		fadeOutFc:fadeOutFc,
		opt:opt,
	});
});
	
})();
