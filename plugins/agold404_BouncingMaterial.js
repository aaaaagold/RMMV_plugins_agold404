"use strict";
/*:
 * @plugindesc make a Sprite with a single bitmap bouncing
 * @author agold404
 * @help .
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Sprite.prototype).addBase('bouncingMaterial_isUnitRoot',function f(){
	return false;
}).addBase('bouncingMaterial_isUnitComponent',function f(){
	return false;
});

// ==== ==== ==== ==== 

{
const a=class Sprite_BouncingMaterial_unitRoot extends Sprite{
};
a.ori=Sprite;
window[a.name]=a;
new cfc(a.prototype).addBase('initialize',function f(bmp,separateType,frame,maxPadding){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.bouncingMaterial_setUnitRoot(separateType,frame,maxPadding);
	return rtv;
},t=[
a.ori.prototype,
]).addBase('update',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.bouncingMaterial_updateUnitRoot();
	return rtv;
},t).addBase('bouncingMaterial_isUnitRoot',function f(){
	return !!this._bouncingMaterial_unit_bmpBak;
}).addBase('bouncingMaterial_resetUnitRoot',function f(){
	if(!this.bouncingMaterial_isUnitRoot()) return;
	
	this.bitmap=this._bouncingMaterial_unitRoot_bmpBak||this.bitmap;
	for(let arr=this._bouncingMaterial_unitRoot_children,x=arr.length;x--;) this.removeChild(x);
	
	this._bouncingMaterial_unitRoot_children=
	this._bouncingMaterial_unitRoot_corners=
	this._bouncingMaterial_unitRoot_bmpBak=
	undefined;
	
	return this;
}).addBase('bouncingMaterial_setUnitRoot',function f(separateType,frame,maxPadding){
	// separateType: LU->RD or RU->LD
	separateType=0|!!separateType;
	if(!this.bitmap || this.children.length) return -1; // fail: not suitable
	const bmp=this.bitmap;
	if(!bmp.isReady()){
		bmp.addLoadListener(f.tbl[0].bind(this,separateType,frame,maxPadding));
		return 1; // later
	}
	const w=frame&&frame.width  >=2?frame.width  :this.width  ;
	const h=frame&&frame.height >=2?frame.height :this.height ;
	if(Math.min(w,h)<2) return -1; // fail: not suitable
	this._bouncingMaterial_unitRoot_bmpBak=bmp;
	
	const x=(frame?frame.x:this.x)||0;
	const y=(frame?frame.y:this.y)||0;
	const anchor=this.anchor;
	const x0=x-w*anchor.x,x1=x0+w;
	const y0=y-h*anchor.y,y1=y0+h;
	const corners=this._bouncingMaterial_unitRoot_corners={
		separateType:separateType,
		points:[],
		x0:x0,x1:x1,
		y0:y0,y1:y1,
	}; // 2-level obj
	this._bouncingMaterial_unitRoot_corners.points.push(
		[x0,y0,],
		[x1,y0,],
		[x1,y1,],
		[x0,y1,],
	);
	
	const arr=this._bouncingMaterial_unitRoot_children=[];
	if(!separateType) frame.x=this.width-(frame.x+frame.width);
	for(let x=2;x--;){
		const sp=new Sprite_BouncingMaterial_unitComponent(separateType?bmp:bmp.mirror_h(),(x<<1)|separateType,frame,maxPadding); // [0 , sp._bouncingMaterial_updateUnitComponentFrame.tbl.length)
		//const sp=new Sprite_BouncingMaterial_unitComponent(bmp,(x<<1)|separateType,frame,maxPadding); // [0 , sp._bouncingMaterial_updateUnitComponentFrame.tbl.length)
		arr.push(sp);
		this.addChild(sp);
	}
	
	this.bitmap=null;
},[
function f(...lastArgIsBmp){
	if(arguments&&arguments[arguments.length-1]!==bmp) return; // changed
	this.bouncingMaterial_setUnitRoot.apply(this,argument);
}, // 0: bmp.loadListener
]).addBase('bouncingMaterial_getCorners',function f(){
	return this._bouncingMaterial_unitRoot_corners;
},t).addBase('bouncingMaterial_updateUnitRoot',function f(){
	if(!this.bouncingMaterial_isUnitRoot()) return;
	return this;
}).addBase('bouncingMaterial_getMaxSpeed',function f(){
	if(!this.bouncingMaterial_isUnitRoot()) return 0;
	return Math.min.apply(null,this._bouncingMaterial_unitRoot_children.map(f.tbl[0]));
},[
c=>c.bouncingMaterial_getMaxSpeed(), // 0: map
]).addBase('bouncingMaterial_setMaxPadding',function f(val){
	if(!this.bouncingMaterial_isUnitRoot()) return;
	this._bouncingMaterial_unitRoot_children.forEach(f.tbl[0],val);
},[
function(sp){ this._maxPadding=this; }, // 0: forEach
]);
}

// ==== ==== ==== ==== 

{
const a=class Sprite_BouncingMaterial_unitComponent extends Sprite{
static bouncingMaterial_getDefaultMaxPadding(){
	return 1;
}
static bouncingMaterial_getDefaultMaxSpeed(padding){
	if(padding<0) return 0;
	return (isNaN(padding)?Sprite_BouncingMaterial_unitComponent.bouncingMaterial_getDefaultMaxPadding():padding)>>>2;
}
};
a.ori=Sprite;
window[a.name]=a;
new cfc(a.prototype).addBase('initialize',function f(bmp,unitComponentType,frame,maxPadding){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.anchor.set(0); // 0..1 = width or height , however it should be width-1 or height-1 => using different anchor may leave gaps between components
	this.bouncingMaterial_setUnitComponent(unitComponentType,frame,maxPadding);
	return rtv;
},t=[
a.ori.prototype,
]).addBase('update',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.bouncingMaterial_updateUnitComponent();
	return rtv;
},t).addBase('bouncingMaterial_isParentUnitRoot',function f(){
	return this.parent instanceof Sprite_BouncingMaterial_unitRoot;
}).addBase('bouncingMaterial_isUnitComponent',function f(){
	return this.bouncingMaterial_getId()>=0;
}).addBase('bouncingMaterial_resetUnitComponent',function f(){
	if(!this.bouncingMaterial_isUnitComponent()) return;
	this.bouncingMaterial_setId(-1);
	return this;
}).addBase('bouncingMaterial_setUnitComponent',function f(unitComponentId,frame,maxPadding){
	if(this.bouncingMaterial_isUnitComponent()) return -1; // already
	this._bouncingMaterial_isUnitComponent=true;
	this.bouncingMaterial_setId(unitComponentId);
	this.bouncingMaterial_setMaxPadding(maxPadding);
	const p1=Graphics.isWebGL()?0:this.bouncingMaterial_getMaxPadding(),p2=p1<<1;
	//const p1=1,p2=p1<<1;
	let x0=Math.max(frame.x-p1,0);
	let y0=Math.max(frame.y-p1,0);
	const bmp=this.bitmap;
	const w=Math.min(frame.width+p2,bmp.width-x0);
	const h=Math.min(frame.height+p2,bmp.height-y0);
	if(unitComponentId&1){
		this.setFrame(x0,y0,w,h);
		this.anchor.set((frame.x-x0)/w,(frame.y-y0)/h);
	}else{ // mirror
		this.setFrame(x0,y0,w,h);
		this.anchor.set((frame.x-x0)/w,(frame.y-y0)/h);
	}
	const sz=this._bouncingMaterial_componentSize=frame;
	//this.bouncingMaterial_setUnitComponent_webgl(unitComponentId,sz); // too slow
	return this;
}).addBase('bouncingMaterial_setUnitComponent_webgl',function f(unitComponentId,componentSize){
	if(!Graphics.isWebGL()) return;
	const myId=unitComponentId>=0?unitComponentId:this.bouncingMaterial_getId();
	componentSize=componentSize||this._bouncingMaterial_componentSize;
	if(!componentSize||!(myId>=0)) return;
	const reso=f.tbl[1];
	if(!f.tbl[0]){
		const bmp=f.tbl[0]=new Bitmap(reso,reso);
		const ctx=bmp._canvas.getContext('2d');
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(reso+1,0);
		ctx.lineTo(0,reso+1);
		ctx.closePath();
		ctx.fillStyle='#FFFFFF';
		ctx.fill();
	}
	{
		const sp=new Sprite(f.tbl[0]);
		//sp.setFrame(reso-componentSize.width,0,componentSize.width,componentSize.height);
		const r=1;
		this.addChild(sp);
		switch(myId){
		case 0:
			sp.anchor.set(1,1);
			sp.rotation=Math.PI;
			sp.scale.set(componentSize.width/reso,componentSize.height/reso);
			break;
		case 1:
			sp.anchor.set(1,0);
			sp.rotation=-Math.PI/2;
			sp.scale.set(componentSize.height/reso,componentSize.width/reso);
			break;
		case 2:
			sp.anchor.set(0,0);
			sp.rotation=0;
			sp.scale.set(componentSize.width/reso,componentSize.height/reso);
			break;
		case 3:
			sp.anchor.set(0,1);
			sp.rotation=Math.PI/2;
			sp.scale.set(componentSize.height/reso,componentSize.width/reso);
			break;
		}
		this.mask=sp;
	}
	return;
	
	const m=this._webgl_mask=new PIXI.Graphics();
	m.isMask=true;
	m.beginFill(0xFFFFFF, 1);
	if(myId){
		m.moveTo(0,0);
		if(myId!==1) m.lineTo(1,0);
		if(myId!==2) m.lineTo(1,1);
		if(myId!==3) m.lineTo(0,1);
		m.lineTo(0,0);
	}else{
		m.moveTo(1,0);
		m.lineTo(1,1);
		m.lineTo(0,1);
		m.lineTo(1,0);
	}
	m.endFill();
	m.scale.set(componentSize.width,componentSize.height);
	
	//this._webgl_maskRect=m.graphicsData[0].shape;
	this.filterArea=new PIXI.Rectangle();
	//this.filters=[WindowLayer.voidFilter];
	
	this.on('removed', this.removeChildren);
},[
undefined, // 0: mask bmp
4096, // reso
]).addBase('bouncingMaterial_setMaxPadding',function f(val){
	this._maxPadding=val;
}).addBase('bouncingMaterial_getMaxPadding',function f(){
	return isNaN(this._maxPadding)?Sprite_BouncingMaterial_unitComponent.bouncingMaterial_getDefaultMaxPadding():this._maxPadding-0;
}).addBase('bouncingMaterial_getMaxSpeed',function f(){
	return Sprite_BouncingMaterial_unitComponent.bouncingMaterial_getDefaultMaxPadding(this.bouncingMaterial_getMaxPadding());
}).addBase('bouncingMaterial_getComponentSize',function f(){
	return this._bouncingMaterial_componentSize;
}).addBase('bouncingMaterial_setId',function f(val){
	return this._bouncingMaterial_unitComponentId=val;
}).addBase('bouncingMaterial_getId',function f(){
	return this._bouncingMaterial_unitComponentId;
}).addBase('bouncingMaterial_updateUnitComponent',function f(){
	if(!this.bouncingMaterial_isUnitComponent()||!this.bouncingMaterial_isParentUnitRoot()) return;
	this._bouncingMaterial_updateUnitComponentFrame();
	return this;
}).addBase('_bouncingMaterial_updateUnitComponentFrame',function f(){
	const corners=this.parent.bouncingMaterial_getCorners();
	const funcs=f.tbl[0];
	const j=this.bouncingMaterial_getId()&f.tbl[1];
	if(this._lastCornersAllPoints!==corners.points){ // need to sync points
		const allPoints=this._lastCornersAllPoints=corners.points;
		const sz=allPoints.length,myPoints=this._lastMyPoints=[];
		for(let i=0;i!==sz;++i) if(i!==j) myPoints.push(allPoints[i]);
		this.setClipPoints(this._lastMyPoints,f.tbl[2]);
	}
	funcs[j](this,this._lastMyPoints,corners);
	return this;
},t=[
[
(self,points,corners)=>{
	const scale=self.scale;
	const vec1=[points[1][0]-points[0][0],points[1][1]-points[0][1],];
	const vec2=[points[2][0]-points[1][0],points[2][1]-points[1][1],];
	const A=vec1[0]*vec2[1]-vec2[0]*vec1[1];
	if(!A){
		self.visible=false;
		return;
	}
		self.visible=true;
	const H=Math.sqrt(vec1[0]*vec1[0]+vec1[1]*vec1[1]);
	const W=Math.sqrt(vec2[0]*vec2[0]+vec2[1]*vec2[1]);
	const vec2N=[-vec2[1],vec2[0],];
	
	//self.anchor.set(0); // all same and will not be changed
	const sizeInfo=self.bouncingMaterial_getComponentSize();
	const scaleX=W/sizeInfo.width,scaleY=H/sizeInfo.height;
	self.scale.set(-scaleX,scaleY); // mirror
	//self.position.set(points[0][0]+vec2[0],points[0][1]+vec2[1]);
	self.position.set(points[0][0],points[0][1]); // mirror
	const rad=Math.acos((-vec2[0]/W).clamp(-1,1));
	if(0>=vec2[1]) self.rotation=rad;
	else self.rotation=-rad;
	const rad1=Math.asin(((vec2N[0]*vec1[1]-vec1[0]*vec2N[1])/(W*H)).clamp(-1,1));
	if(vec2N[0]*vec1[0]+vec2N[1]*vec1[1]<0) self.skew.x=rad1;
	else self.skew.x=Math.PI-rad1;
}, // 0-0: type0  /d 
(self,points,corners)=>{
	const scale=self.scale;
	const vec1=[points[2][0]-points[1][0],points[2][1]-points[1][1],];
	const vec2=[points[0][0]-points[2][0],points[0][1]-points[2][1],];
	const A=vec1[0]*vec2[1]-vec2[0]*vec1[1];
	if(!A){
		self.visible=false;
		return;
	}
		self.visible=true;
	const W=Math.sqrt(vec1[0]*vec1[0]+vec1[1]*vec1[1]);
	const H=Math.sqrt(vec2[0]*vec2[0]+vec2[1]*vec2[1]);
	const vec1N=[-vec1[1],vec1[0],];
	
	//self.anchor.set(0); // all same and will not be changed
	const sizeInfo=self.bouncingMaterial_getComponentSize();
	const scaleX=W/sizeInfo.width,scaleY=H/sizeInfo.height;
	self.scale.set(scaleX,scaleY);
	self.position.set(points[0][0],points[0][1]);
	const rad=Math.acos((-vec1[0]/W).clamp(-1,1));
	if(0>=vec1[1]) self.rotation=rad;
	else self.rotation=-rad;
	const rad1=Math.asin(((vec2[0]*vec1N[1]-vec1N[0]*vec2[1])/(W*H)).clamp(-1,1));
	if(0<vec1N[0]*vec2[0]+vec1N[1]*vec2[1]) self.skew.x=rad1;
	else self.skew.x=Math.PI-rad1;
}, // 0-1: type1  \d 
(self,points,corners)=>{
	const scale=self.scale;
	const vec1=[points[0][0]-points[2][0],points[0][1]-points[2][1],];
	const vec2=[points[1][0]-points[0][0],points[1][1]-points[0][1],];
	const A=vec1[0]*vec2[1]-vec2[0]*vec1[1];
	if(!A){
		self.visible=false;
		return;
	}
		self.visible=true;
	const H=Math.sqrt(vec1[0]*vec1[0]+vec1[1]*vec1[1]);
	const W=Math.sqrt(vec2[0]*vec2[0]+vec2[1]*vec2[1]);
	const vec2N=[-vec2[1],vec2[0],];
	
	//self.anchor.set(0); // all same and will not be changed
	const sizeInfo=self.bouncingMaterial_getComponentSize();
	const scaleX=W/sizeInfo.width,scaleY=H/sizeInfo.height;
	self.scale.set(-scaleX,scaleY); // mirror
	//self.position.set(points[0][0],points[0][1]);
	self.position.set(points[0][0]+vec2[0],points[0][1]+vec2[1]); // mirror
	const rad=Math.acos((vec2[0]/W).clamp(-1,1));
	if(vec2[1]>=0) self.rotation=rad;
	else self.rotation=-rad;
	const rad1=Math.asin(((vec2N[0]*vec1[1]-vec1[0]*vec2N[1])/(W*H)).clamp(-1,1));
	if(vec2N[0]*vec1[0]+vec2N[1]*vec1[1]<0) self.skew.x=rad1;
	else self.skew.x=Math.PI-rad1;
}, // 0-2: type2  /u 
(self,points,corners)=>{
	const vec1=[points[1][0]-points[0][0],points[1][1]-points[0][1],];
	const vec2=[points[2][0]-points[1][0],points[2][1]-points[1][1],];
	const A=vec1[0]*vec2[1]-vec2[0]*vec1[1];
	if(!A){
		self.visible=false;
		return;
	}
		self.visible=true;
	const W=Math.sqrt(vec1[0]*vec1[0]+vec1[1]*vec1[1]);
	const H=Math.sqrt(vec2[0]*vec2[0]+vec2[1]*vec2[1]);
	const vec1N=[-vec1[1],vec1[0],];
	
	//self.anchor.set(0); // all same and will not be changed
	const sizeInfo=self.bouncingMaterial_getComponentSize();
	const scaleX=W/sizeInfo.width,scaleY=H/sizeInfo.height;
	self.scale.set(scaleX,scaleY);
	self.position.set(points[0][0],points[0][1]);
	const rad=Math.acos((vec1[0]/W).clamp(-1,1));
	if(vec1[1]>=0) self.rotation=rad;
	else self.rotation=-rad;
	const rad1=Math.asin(((vec2[0]*vec1N[1]-vec1N[0]*vec2[1])/(W*H)).clamp(-1,1));
	if(0<vec1N[0]*vec2[0]+vec1N[1]*vec2[1]) self.skew.x=rad1;
	else self.skew.x=Math.PI-rad1;
}, // 0-3: type3  \u 
], // 0: adjust position scale skew 
3, // 1: "id to type" bitmask
4, // 2: widerPoints width
]).addBase('calculateVertices_getNextId',function f(i){
	return (i+1)&f.tbl[1];
},t).add('calculateVertices',function f(){
	const rtv=f.ori.apply(this,arguments);
	const vv=this.vertexData; if(!vv||!this.bouncingMaterial_isUnitComponent()) return rtv;
	const myId=this.bouncingMaterial_getId()&f.tbl[1];
	const nextId=this.calculateVertices_getNextId(myId);
	if(!(myId&1)) for(let x=2;x--;) vv[(nextId<<1)|x]=vv[(myId<<1)|x]; // mirror
	else for(let x=2;x--;) vv[(myId<<1)|x]=vv[(nextId<<1)|x];
	return rtv;
},t);
}

// ==== ==== ==== ==== 

{
const a=class Sprite_BouncingMaterial_root extends Sprite{
};
a.ori=Sprite;
window[a.name]=a;
new cfc(a.prototype).addBase('initialize',function f(bmp,opt){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.bouncingMaterial_setRoot(bmp,opt);
	this.z=15; // prevent performance drop when it is a child of ShaderTilemap
	return rtv;
},t=[
a.ori.prototype,
]).addBase('update',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.bouncingMaterial_updateRoot();
	return rtv;
},t).addBase('bouncingMaterial_isRoot',function f(){
	return !!this._bouncingMaterial_root_bmpBak;
}).addBase('bouncingMaterial_resetRoot',function f(){
	if(!this._bouncingMaterial_isRoot()) return;
	this.bitmap=this._bouncingMaterial_root_bmpBak||this.bitmap;
	
	this._bouncingMaterial_root_bmpBak=
	this._bouncingMaterial_root_units=
	undefined;
	
	return this;
}).addBase('bouncingMaterial_setRoot',function f(bmp,opt){
	this.bitmap=bmp||this.bitmap;
	if(bmp&&!bmp.isReady()){
		bmp.addLoadListener(f.tbl[0].bind(this,opt));
		return 1; // later
	}
	const w=bmp.width,h=bmp.height;
	if(Math.min(w,h)<2) return -1; // fail: not suitable
	this._bouncingMaterial_root_bmpBak=bmp;
	this._bouncingMaterial_root_units=[];
	
	const nw=((opt&&opt.nw>=2?Math.min(opt.nw,w):2)>>>1<<1)|1;
	const nh=((opt&&opt.nh>=2?Math.min(opt.nh,h):2)>>>1<<1)|1;
	//this.anchor.set(0.5);
	const optAnchor=opt&&opt.anchor;
	const ax=optAnchor?optAnchor.x:this.anchor.x;
	const ay=optAnchor?optAnchor.y:this.anchor.y;
	const x0=-ax*w,x1=x0+w;
	const y0=-ay*h,y1=y0+h;
	const ptTbl=this._bouncingMaterial_pointsTbl=[[]]; // [y][x] -> point
	//const xv=this._bouncingMaterial_pointsRawX=[0|0,];
	//const yv=this._bouncingMaterial_pointsRawY=[0|0,];
	const maxSpeed=(opt&&opt.maxSpeed)>=0?(opt&&opt.maxSpeed)-0:Sprite_BouncingMaterial_unitComponent.bouncingMaterial_getDefaultMaxPadding();
	const maxPadding=this._maxPadding=(maxSpeed+3)>>>1<<3;
	this.bouncingMaterial_setMaxPadding(maxPadding);
	for(let y=1|0,ys=nh|0,xs=nw|0,x=1|0,lastX=0|0,lastY=0|0;y!==ys;++y){ if(!ptTbl[y]) ptTbl[y]=[]; const nextY=~~(h*y/(nh-1)); for(x=1|0,lastX=0|0;x!==xs;++x){
		const nextX=~~(w*x/(nw-1)); 
		if(!ptTbl[y-1][x-1]) ptTbl[y-1][x-1]=[x0+lastX,y0+lastY]; if(ptTbl[y-1][x-1].length<4) ptTbl[y-1][x-1].push(nextX-lastX,nextY-lastY);
		if(!ptTbl[y-1][x]) ptTbl[y-1][x]=[x0+nextX,y0+lastY]; if(ptTbl[y-1][x].length<4) ptTbl[y-1][x].push(nextX-lastX,nextY-lastY);
		if(!ptTbl[y][x]) ptTbl[y][x]=[x0+nextX,y0+nextY,nextX-lastX,nextY-lastY]; 
		if(!ptTbl[y][x-1]) ptTbl[y][x-1]=[x0+lastX,y0+nextY];  if(ptTbl[y][x-1].length<4) ptTbl[y][x-1].push(nextX-lastX,nextY-lastY);
		if(nextX===lastX) continue; 
		if(nextY===lastY) continue; 
		
		const sp=new Sprite_BouncingMaterial_unitRoot(bmp,(x^y^1)&1,new Rectangle(lastX,lastY,nextX-lastX,nextY-lastY),maxPadding);
		this.addChild(sp);
		this._bouncingMaterial_root_units.push(sp);
		
		const unitPoints=sp._bouncingMaterial_unitRoot_corners.points;
		unitPoints[0]=ptTbl[y-1][x-1]; 
		unitPoints[1]=ptTbl[y-1][x]; 
		unitPoints[2]=ptTbl[y][x]; 
		unitPoints[3]=ptTbl[y][x-1]; 
		
		lastX=nextX;
		/* xv.uniquePush(x0+lastX); */
	} lastY=nextY; /* yv.uniquePush(y0+lastY); */ }
	const points=this._bouncingMaterial_pointsList=[];
	for(let y=0|0,ys=nh|0,xs=nw|0,x=0|0;y!==ys;++y) for(x=0|0;x!==xs;++x) points.push(ptTbl[y][x]);
	
	this.bitmap=null;
},[
function f(opt,bmp){
	if(this.bitmap!==bmp) return; // changed
	this.bouncingMaterial_setRoot(bmp,opt);
},
]).addBase('bouncingMaterial_getMaxSpeed',function f(){
	return Sprite_BouncingMaterial_unitComponent.bouncingMaterial_getDefaultMaxSpeed(this._maxPadding);
}).addBase('bouncingMaterial_setMaxPadding',function f(val){
	if(val<0) val=0;
	if(!this._bouncingMaterial_root_units||this._maxPadding===val) return;
	this._bouncingMaterial_root_units.forEach(f.tbl[0].bind(this._maxPadding=val));
},[
function(sp){ sp.bouncingMaterial_setMaxPadding(this); }, // 0: forEach
]).addBase('bouncingMaterial_updateRoot',function f(){
	if(!this.bouncingMaterial_isRoot()) return;
	return this._bouncingMaterial_updateRoot();
}).addBase('_bouncingMaterial_updateRoot',function f(){
	const ptTbl=this._bouncingMaterial_pointsTbl; if(!ptTbl) return;
	const maxSpeed=this.bouncingMaterial_getMaxSpeed();
	const dxy=[];
	let dbg_maxDs=0; // debug
	for(let y=ptTbl.length;y--;){ dxy[y]=[]; if(ptTbl[y]) for(let x=ptTbl[y].length;x--;){
		const pt=ptTbl[y][x];
		let ptU=ptTbl[y-1]&&ptTbl[y-1][x]; // ||[pt[0],pt[1]-pt[3]];
		let ptD=ptTbl[y+1]&&ptTbl[y+1][x]; // ||[pt[0],pt[1]+pt[3]];
		let ptL=ptTbl[y]&&ptTbl[y][x-1]; // ||[pt[0]-pt[2],pt[1]];
		let ptR=ptTbl[y]&&ptTbl[y][x+1]; // ||[pt[0]+pt[2],pt[1]];
		if(!ptL&&ptR){
			ptL=[pt[0]-ptR[0],pt[1]-ptR[1],];
			const c=pt[2]/Math.sqrt(ptL[0]*ptL[0]+ptL[1]*ptL[1]);
			ptL[0]=ptL[0]*c+pt[0];
			ptL[1]=ptL[1]*c+pt[1];
		}
		if(!ptR&&ptL){
			ptR=[pt[0]-ptL[0],pt[1]-ptL[1],];
			const c=pt[2]/Math.sqrt(ptR[0]*ptR[0]+ptR[1]*ptR[1]);
			ptR[0]=ptR[0]*c+pt[0];
			ptR[1]=ptR[1]*c+pt[1];
		}
		if(!ptU&&ptD){
			ptU=[pt[0]-ptD[0],pt[1]-ptD[1],];
			const c=pt[3]/Math.sqrt(ptU[0]*ptU[0]+ptU[1]*ptU[1]);
			ptU[0]=ptU[0]*c+pt[0];
			ptU[1]=ptU[1]*c+pt[1];
		}
		if(!ptD&&ptU){
			ptD=[pt[0]-ptU[0],pt[1]-ptU[1],];
			const c=pt[3]/Math.sqrt(ptD[0]*ptD[0]+ptD[1]*ptD[1]);
			ptD[0]=ptD[0]*c+pt[0];
			ptD[1]=ptD[1]*c+pt[1];
		}
		if(pt._fixedPos) dxy[y][x]=[0,0];
		else dxy[y][x]=[(((ptU[0]+ptD[0]+ptL[0]+ptR[0])/4)-pt[0])/2,(((ptU[1]+ptD[1]+ptL[1]+ptR[1])/4)-pt[1])/2];
		const dx=dxy[y][x][0];
		const dy=dxy[y][x][1];
		const ds=Math.sqrt(dx*dx+dy*dy);
		if(maxSpeed<ds){
			const r=maxSpeed/ds;
			dxy[y][x][0]*=r;
			dxy[y][x][1]*=r;
		}else if(ds<0.0625) dxy[y][x][1]=dxy[y][x][0]=0;
		dbg_maxDs=Math.max(dbg_maxDs,ds);
	} }
	for(let y=ptTbl.length;y--;){ if(ptTbl[y]) for(let x=ptTbl[y].length;x--;){
		ptTbl[y][x][0]+=dxy[y][x][0];
		ptTbl[y][x][1]+=dxy[y][x][1];
	} }
	return;
}).addBase('bouncingMaterial_findNearestPoints_local',function f(x,y){
	return this._bouncingMaterial_pointsList.map(f.tbl[0].bind(this,x,y)).sort(f.tbl[1]).map(f.tbl[2]);
},[
function f(x,y,point){
	const dx=x-point[0];
	const dy=y-point[1];
	return [dx*dx+dy*dy,point];
}, // 0: map
(a,b)=>a[0]-b[0], // 1: cmp
info=>info[1], // 2: map2
]).addBase('bouncingMaterial_findNearestPoints_parent',function f(x,y){
	const pt=this.toLocal({x:x,y:y},this.parent);
	return this.bouncingMaterial_findNearestPoints_local(pt.x,pt.y);
}).addBase('bouncingMaterial_findNearestPoints_global',function f(x,y,n){
	const pt=this.toLocal({x:x,y:y});
	return this.bouncingMaterial_findNearestPoints_local(pt.x,pt.y);
});
}

// ==== ==== ==== ==== 

new cfc(Sprite.prototype).addBase('bouncingMaterial_set',function f(opt){
	let sp=this._bouncingMaterialRoot;
	if(sp) sp.destroy();
	this._bouncingMaterial_bmpBak=this.bitmap;
	opt=Object.assign({anchor:this.anchor,},opt);
	sp=this._bouncingMaterialRoot=new Sprite_BouncingMaterial_root(this.bitmap,opt);
	this.addChild(sp);
	this.bitmap=null;
}).addBase('bouncingMaterial_reset',function f(){
	const sp=this._bouncingMaterialRoot; if(!sp) return;
	sp.destroy();
	this._bouncingMaterialRoot=undefined;
	this.bitmap=this._bouncingMaterial_bmpBak;
});

})();
