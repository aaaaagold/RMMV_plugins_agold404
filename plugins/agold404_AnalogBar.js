"use strict";
/*:
 * @plugindesc 類比條
 * @author agold404
 * @help 'SceneManager.add類比條(id,afterThis,x,y,width,height,func_ratioGetter,color01,rot);'
 * rot === 0 時為水平，正值往順時針轉， 2 pi 一圈， xy 定位直接無腦 = ， xy 定位與旋轉中心在正中央。
 * color01 為長度 2~3 的陣列，內填 CSS 顏色。 越 0 偏 color01[0] ，越 1 偏 color01[1] 。 color01[2] 是背景，預設透明。
 * func_ratioGetter 必須是函式，不做型態錯誤檢查。 回傳值 0~1 ，超過範圍會自動切掉縮進範圍內，當不了數字會當 0 。
 * afterThis 為 false like 時會用 'SceneManager._scene.addChild(類比條)' ；其他情形 'afterThis.parent.addChildAt(類比條,afterThis.parent.getChildIndex(afterThis)+1);'
 * id 是拿來:
 *   'SceneManager.get類比條(id)' 拿 sprite 用的。
 *   'SceneManager.del類比條(id)' 刪 sprite 用的。
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

{ const a=function Window_類比條(){
	this.initialize.apply(this,arguments);
};
a.ori=Window_Base;
window[a.name]=a;
const p=a.prototype=Object.create(a.ori.prototype);
p.constructor=a;
makeDummyWindowProto(p); // disable _updateContents
new cfc(p).add('contentsWidth',function(){
	return this.width;
}).add('contentsHeight',function(){
	return this.height;
}). // remove padding
add('initialize',function f(x,y,w,h){
	const rtv=f.ori.apply(this,arguments);
	this.initBars.apply(this,arguments);
	return rtv;
}).
addBase('initBars',function f(x,y,w,h){
	w|=0;
	h|=0;
	if(!(0<w&&0<h)){
		// 0-size bar
		this._barBackSprite=new Sprite();
		this._barFrontSprite=new Sprite();
		return;
	}
	this.addChild(
		this._barBackSprite=new Sprite(new Bitmap(w,h)),
	);
	this.addChild(
		this._barFrontSprite=new Sprite(new Bitmap(w,h)),
	);
	this._barBackSprite.anchor.set(1,0.5);
	this._barFrontSprite.anchor.set(0,0.5);
	this._barFrontSprite.x=(this._barBackSprite.x=w>>1)-w;
}).
addBase('setRatio',function f(r){
	let cut=this.width*r;
	this._barFrontSprite.setFrame(0,0,cut,this.height);
	cut|=0;
	this._barBackSprite.setFrame(cut,0,this.width-cut,this.height);
}).
getP;
}

{ const p=SceneManager;
r=Window_Base; (t=function f(){
	if(!this.contents || this._lastFc===Graphics.frameCount) return;
	this._lastFc=Graphics.frameCount;
	let curr=(this.getRatio()-0).clamp(0,1)||0;
	if(this._lastValue===curr) return;
	this._lastValue=curr;
	
	
	if(!this._barFilled){
		this._barFilled=true;
		
	this.contents.clear();
		
	if(this._color01[2]) this._barBackSprite.bitmap.fillRect(0,0,this.width,this.height,this._color01[2]);
		
		const context=this._barFrontSprite.bitmap._context;
		const grad=this._lastCtx===context?this._lastGrad:context.createLinearGradient(0, 0, this.width, this.height);
		grad.addColorStop(0, this._color01[0]);
		grad.addColorStop(1, this._color01[1]);
		context.save();
		context.fillStyle=grad;
		context.fillRect(0,0, this.width, this.height);
		context.restore();
		this._barFrontSprite.bitmap._setDirty();
		this._lastCtx=context;
		this._lastGrad=grad;
	}
	
	
	this.setRatio(curr);
}).ori=r.prototype.update;
new cfc(p).add('add類比條',function f(id,afterThis,x,y,width,height,func_ratioGetter,color01,rot){
	const sp=new Window_類比條(x,y,width,height);
	makeDummyWindowProto(sp);
	sp.children.map(f.tbl[0]);
	sp._barBackSprite.visible=true;
	sp._barFrontSprite.visible=true;
	//{ const cc=sp._windowContentsSprite; cc.y=cc.x=0; f.tbl[1](cc); cc.visible=true; }
	sp.update=f.tbl[2];
	sp.getRatio=func_ratioGetter;
	sp._color01=color01;
	sp.rotation=rot||0;
	let p;
	if(afterThis){
		p=afterThis.parent;
		p.addChildAt(sp,p.getChildIndex(afterThis)+1);
	}else if(this._scene) (p=this._scene).addChild(sp);
	if(p){
		let m=this._scene._類比條; if(!m) m=this._scene._類比條=new Map();
		if(m.has(id)) this.del類比條(id,sp);
		else m.set(id,sp);
	}
},[x=>x.visible=false, x=>x.anchor && (x.anchor.y=x.anchor.x=0.5), t, ]).add('get類比條',function(id){
	const sc=this._scene;
	const m=sc&&sc._類比條;
	return m&&m.get(id);
}).add('del類比條',function(id,replaceTo){
	const sp=this.get類比條(id); if(!sp) return;
	if(replaceTo) this._scene._類比條.set(id,replaceTo);
	if(sp.parent) sp.parent.removeChild(sp);
});
}

})();
