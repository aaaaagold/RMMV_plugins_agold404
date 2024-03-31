"use strict";
/*:
 * @plugindesc Splitting Spriteset
 * @author agold404
 * @help SceneManager.splittedRenderedSpriteset_start(dur,holdDur,ptx,pty,slope,width,height,endFlashDur,endFlashColor);
 * SceneManager.splittedRenderedSpriteset_gen(order,dur,holdDur,ptx,pty,slope,width,height,endFlashDur,endFlashColor);
 * 
 * SceneManager.splittedRenderedSpriteset_start(33,16,444,222,3,123/3,123,16,[0,0,0,255]);
 * SceneManager.splittedRenderedSpriteset_gen(4,33,16,444,222,3,123/3,123,16,[0,0,0,255]);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const p=Spriteset_Base.prototype,pp=Sprite.prototype;
new cfc(p).add('renderCanvas',p.renderCanvas===pp.renderCanvas?function(renderer){
	return this._renderCanvas_split(Sprite.prototype.renderCanvas,arguments);
}:function f(renderer){
	return this._renderCanvas_split(f.ori,arguments);
}).add('renderWebGL',p.renderWebGL===pp.renderWebGL?function(renderer){
	return this._renderWebGL_split(Sprite.prototype.renderWebGL,arguments);
}:function f(renderer){
	return this._renderWebGL_split(f.ori,arguments);
});
t=[
[
undefined, // 0-0: screen center
[[1,1],[-1,1],[-1,-1],[1,-1],], // 0-1: corners
new Uint16Array([0,2,4,1,3,5,]), // 0-2: point indices for vertical split line // [0,2,4] [1,3,5]
new Float32Array([
	-1, -4,-4,
	 1, -4,-4,
	-1,  4, 4,
	 1,  4, 4,
	-1, -4,-4,
	 1,  4, 4,
]), // 0-3: point template
document.ce('canvas'), // 0-4: Canvas Mode tmpc
], // 0:
[
{
getVertexAttrib:['VERTEX_ATTRIB_ARRAY_SIZE','VERTEX_ATTRIB_ARRAY_TYPE','VERTEX_ATTRIB_ARRAY_NORMALIZED','VERTEX_ATTRIB_ARRAY_STRIDE',],
bindBuffer:['ARRAY_BUFFER','ELEMENT_ARRAY_BUFFER',],
}, // 1-0:
], // 1:
];
t[1][0].getParameter=t[1][0].bindBuffer.map(s=>(s+'_BINDING'));
new cfc(p).add('_renderCanvas_split',function f(renderFunc,argv){
	const rtv=renderFunc.apply(this,argv);
	this._renderCanvas_splitTest(renderFunc,argv);
	this._renderCanvas_splits(renderFunc,argv);
	return rtv;
},undefined,true,true).add('_renderCanvas_splitTest',function f(renderFunc,argv){
	return this._renderCanvas_split1(this._render_splitInfo_getTest(),renderFunc,argv);
},undefined,true,true).add('_renderCanvas_splits',function f(renderFunc,argv){
	const arr=this._render_splitInfo_getCont(),PI_2=Math.PI*0.5;
	for(let x=0,xs=arr.length;x!==xs;++x){
		const info=arr[x];
		const r=Math.sin(Math.min(1,info.dur/info.durMax)*PI_2);
		this._renderCanvas_split1({pt:info.pt,slope:info.slope,width:r*info.widthMax,height:r*info.heightMax,},renderFunc,argv);
	}
},undefined,true,true).add('_renderCanvas_split1',function f(opt,renderFunc,argv){
	// return -1 if fail
	opt=opt||{};
	if(!f.tbl[0]) f.tbl[0]={x:Graphics.boxWidth>>1,y:Graphics.boxHeight>>1,};
	const pt=opt.pt||f.tbl[0],slope=opt.slope||0,width=opt.width||0,height=opt.height||0;
	if(!width&&!height) return -1;
	
	const renderer=argv[0];
	const ctx=renderer.context;
	const c=ctx.canvas,tmpc=f.tbl[4];
	tmpc.width=c.width; tmpc.height=c.height;
	const tmpctx=tmpc.getContext('2d');
	tmpctx.drawImage(c,0,0);
	c.height=c.height; // clear
	
	const isInf=1/slope===0;
	const points=isInf?
		[[pt.x,0],[pt.x,Graphics.boxHeight],]:
		[[0,pt.y-pt.x*slope],[Graphics.boxWidth,pt.y+(Graphics.boxWidth-pt.x)*slope],];
	{
		points.length=2;
		if(isInf){
			const x=slope<0?0:Graphics.boxWidth;
			points.push([x,Graphics.boxHeight]);
			points.push([x,0]);
		}else{
			if(0<points.back[1]) points.push([Graphics.boxWidth,0]);
			if(0<points[0][1]) points.push([0,0]);
		}
		this._renderCanvas_clipByPath(ctx,tmpctx,points,-width,-height,renderFunc,argv);
	}
	{
		points.length=2;
		if(isInf){
			const x=slope<0?Graphics.boxWidth:0;
			points.push([x,Graphics.boxHeight]);
			points.push([x,0]);
		}else{
			if(points.back[1]<Graphics.boxHeight) points.push([Graphics.boxWidth,Graphics.boxHeight]);
			if(points[0][1]<Graphics.boxHeight) points.push([0,Graphics.boxHeight]);
		}
		this._renderCanvas_clipByPath(ctx,tmpctx,points,width,height,renderFunc,argv);
	}
},t[0],true,true).add('_renderCanvas_clipByPath',function f(ctx,tmpctx,points,dx,dy,renderFunc,argv){
	// save before clipping
	ctx.save();
	ctx.transform.apply(ctx,[1,0,0,1,dx,dy,]);
	ctx.beginPath();
	ctx.moveTo(points[0][0],points[0][1]);
	for(let i=1,sz=points.length;i!==sz;++i) ctx.lineTo(points[i][0],points[i][1]);
	ctx.clip();
	ctx.drawImage(tmpctx.canvas,0,0);
	//ctx.resetTransform(); // restored by ctx.restore();
	// restore clipping
	ctx.restore();
}).add('_renderWebGL_split',function f(renderFunc,argv){
	const gl=argv&&argv[0]&&argv[0].gl; if(!gl) return;
	const rtv=renderFunc.apply(this,argv);
	const oldShaderInfo=this._renderWebGL_split_saveShader(gl);
	this._renderWebGL_split_applySplitShaderTest(gl,renderFunc,argv);
	this._renderWebGL_split_applySplitShaders(gl,renderFunc,argv);
	this._renderWebGL_split_restoreShader(gl,oldShaderInfo);
	return rtv;
}).add('_renderWebGL_split_saveShader',function f(gl){
	const info={
		getParameter:[],getVertexAttrib:[],
		getVertexAttrib:[],
	};
	for(let x=0,arr=f.tbl[0].getParameter,xs=arr.length;x!==xs;++x) info.getParameter.push(gl.getParameter(gl[arr[x]]));
	const prog=info.CURRENT_PROGRAM=gl.getParameter(gl.CURRENT_PROGRAM);
	// get attribute infos
	const cnt=info.ACTIVE_ATTRIBUTES=gl.getProgramParameter(prog,gl.ACTIVE_ATTRIBUTES);
	for(let i=0;i!==cnt;++i){
		const attr=gl.getActiveAttrib(prog,i);
		if(!attr){ info.getVertexAttrib.push(undefined); continue; }
		const vertexAttrs=[],idx=gl.getAttribLocation(prog,attr.name);
		vertexAttrs.push(vertexAttrs._idx=idx);
		for(let x=0,arr=f.tbl[0].getVertexAttrib,xs=arr.length;x!==xs;++x) vertexAttrs.push(gl.getVertexAttrib(idx,gl[arr[x]]));
		vertexAttrs.push(vertexAttrs._offset=gl.getVertexAttribOffset(idx,gl.VERTEX_ATTRIB_ARRAY_POINTER));
		info.getVertexAttrib.push(vertexAttrs);
	}
	return info;
},t[1],true,true).add('_renderWebGL_split_applySplitShaderTest',function f(gl,renderFunc,argv){
	return this._renderWebGL_split_applySplitShader1(this._render_splitInfo_getTest(),gl,renderFunc,argv);
},t[1],true,true).add('_renderWebGL_split_applySplitShaders',function f(gl,renderFunc,argv){
	const arr=this._render_splitInfo_getCont(),PI_2=Math.PI*0.5;
	for(let x=0,xs=arr.length;x!==xs;++x){
		const info=arr[x];
		const r=Math.sin(Math.min(1,info.dur/info.durMax)*PI_2);
		this._renderWebGL_split_applySplitShader1({pt:info.pt,slope:info.slope,width:r*info.widthMax,height:r*info.heightMax,},gl,renderFunc,argv);
	}
},t[1],true,true).add('_renderWebGL_split_applySplitShader1',function f(opt,gl,renderFunc,argv){
	opt=opt||{};
	if(!f.tbl[0]) f.tbl[0]={x:Graphics.boxWidth>>1,y:Graphics.boxHeight>>1,_W2:2.0/Graphics.boxWidth,_H2:-2.0/Graphics.boxHeight,r:Graphics.boxHeight/Graphics.boxWidth};
	const pt=opt.pt||f.tbl[0],slope=-opt.slope||0,width=opt.width||0,height=opt.height||0;
	if(!width&&!height) return;
	
	const shaderInfo=this._renderWebGL_split_getSplitShader(gl); if(!shaderInfo) return;
	
	const isInf=1/slope===0;
	const vecT=isInf?[1,0]:[slope*f.tbl[0]._H2,f.tbl[0]._W2]; // scaled, then turning PI/2, cmp in shader
	const ptx=pt.x*f.tbl[0]._W2-1;
	const pty=pt.y*f.tbl[0]._H2+1;
	
	const attrCnt_dir=1,attrCnt_point=2;
	const attrsCnt=attrCnt_dir+attrCnt_point;
	const ab_idxv=f.tbl[2].slice();
	const ab_data=f.tbl[3].slice();
	{
		const c=-(ptx*vecT[0]+pty*vecT[1]);
		const dirs=[]; for(let x=0,arr=f.tbl[1],xs=arr.length;x!==xs;++x) dirs.push(vecT[0]*arr[x][0]+vecT[1]*arr[x][1]+c);
		const slopeAbs=Math.abs(slope);
		if(f.tbl[0].r<slopeAbs){ // almost vertical
			const xOverY=vecT[1]/vecT[0],cOverVecT0=-c/vecT[0];
			const x0=cOverVecT0+xOverY,x1=cOverVecT0-xOverY;
			/*
			const x0=-(c-vecT[1])/vecT[0]; // y=-1
			const x1=-(c+vecT[1])/vecT[0]; // y=1
			*/
			const dx=(x1-x0)*0.5;
			if(0<slope){ for(let x=0,xs=ab_data.length;x<xs;x+=attrsCnt) ab_data[x]=-ab_data[x]; }
			ab_data[ 1]=ab_data[ 4]=x0-dx*3;
			ab_data[ 7]=ab_data[10]=x1+dx*3;
			ab_data[14]=ab_data[17]=0;
			// ab_points=new Float32Array([[x0-dx*3,-4],[x1+dx*3,4],[-4,0],[4,0]].flat());
			//ab_data[1]=1; ab_data[2]=1; ab_data[4]=0; ab_data[5]=1; ab_data[7]=0; ab_data[8]=0; ab_data[10]=1; ab_data[11]=0; // debug test
		}else{ // almost horizontal
			const yOverX=vecT[0]/vecT[1],cOverVecT1=-c/vecT[1];
			const y0=cOverVecT1-yOverX,y1=cOverVecT1+yOverX;
			/*
			const y0=-(c-vecT[0])/vecT[1]; // x=-1
			const y1=-(c+vecT[0])/vecT[1]; // x=1
			*/
			const dy=(y1-y0)*0.5;
			ab_data[ 2]=ab_data[ 5]=y0-dy*3;
			ab_data[ 8]=ab_data[11]=y1+dy*3;
			ab_data[13]=ab_data[16]=0;
			// ab_points=new Float32Array([[-4,y0-dy*3],[4,y1+dy*3],[0,-4],[0,4]].flat());
		}
	}
	
	gl.bindTexture(gl.TEXTURE_2D,shaderInfo.texture);
	const refc=Graphics._canvas;
	gl.copyTexImage2D(gl.TEXTURE_2D,0,gl.RGBA,0,0,refc.width,refc.height,0);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	const prog=shaderInfo.prog;
	gl.useProgram(prog);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shaderInfo.glbuf_i);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ab_idxv, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.glbuf);
	gl.bufferData(gl.ARRAY_BUFFER, ab_data, gl.STATIC_DRAW);
	
	const loc_dxy=gl.getUniformLocation(prog,"u_dxy");
	gl.uniform2f(loc_dxy,width*f.tbl[0]._W2,height*f.tbl[0]._H2);
	const loc_tex=gl.getUniformLocation(prog,"u_texture");
	gl.uniform1i(loc_tex,0);
	
	const loc_dir=gl.getAttribLocation(prog,"a_dir");
	const loc_pxy=gl.getAttribLocation(prog,"a_pxy");
	if(!shaderInfo.enabled){
		shaderInfo.enabled=true;
		gl.enableVertexAttribArray(loc_dir);
		gl.enableVertexAttribArray(loc_pxy);
	}
	gl.vertexAttribPointer(loc_dir, 1, gl.FLOAT, false, attrsCnt * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.vertexAttribPointer(loc_pxy, 2, gl.FLOAT, false, attrsCnt * Float32Array.BYTES_PER_ELEMENT, 4);
	
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, ab_idxv.length, gl.UNSIGNED_SHORT, 0);
},t[0]).add('_renderWebGL_split_getSplitShader',function f(gl){
	const progInfo=f.tbl[0]; if(progInfo.prog) return progInfo;
	
	const shaderV=progInfo.shaderV||(progInfo.shaderV=gl.createShader(gl.VERTEX_SHADER));
	const shaderF=progInfo.shaderF||(progInfo.shaderF=gl.createShader(gl.FRAGMENT_SHADER));
	
	gl.shaderSource(shaderV, progInfo.shaderSrcV);
	gl.shaderSource(shaderF, progInfo.shaderSrcF);
	
	gl.compileShader(shaderV);
	gl.compileShader(shaderF);
	
	const prog=progInfo.prog=gl.createProgram();
	gl.attachShader(prog, shaderV); 
	gl.attachShader(prog, shaderF);
	gl.linkProgram(prog);
	
	gl.deleteShader(shaderV);
	gl.deleteShader(shaderF);
	
	if(!progInfo.glbuf){
		progInfo.glbuf   =gl.createBuffer();
		progInfo.glbuf_i =gl.createBuffer();
		progInfo.texture =gl.createTexture();
	}
	
	return progInfo;
},[
{
shaderSrcV:"precision lowp float;\n\nuniform vec2 u_dxy;\n\nattribute float a_dir;\nattribute vec2 a_pxy;\n\nvarying vec2 v_texcoord,v_dxy;\n\nvoid main(){\n\tgl_Position=vec4((a_dir<0.0?u_dxy:-u_dxy)+a_pxy,1.0,1.0); v_texcoord=(a_pxy+1.0)*0.5; v_dxy=a_dir<0.0?u_dxy:-u_dxy; \n}\n",
shaderSrcF:"precision lowp float;\n\nuniform sampler2D u_texture;\n\nvarying vec2 v_texcoord,v_dxy;\n\nvoid main(){\n\tif(v_texcoord.x<0.0||1.0<v_texcoord.x||v_texcoord.y<0.0||1.0<v_texcoord.y) gl_FragColor.xyz=vec3(0.0,0.0,0.0); else gl_FragColor=texture2D(u_texture,v_texcoord); \n}",
shaderV:undefined,
shaderF:undefined,
prog:undefined,
glbuf:undefined,
glbuf_i:undefined,
texture:undefined,
enabled:false,
}
]).add('_renderWebGL_split_restoreShader',function f(gl,info){
	if(!info) return;
	gl.useProgram(info.CURRENT_PROGRAM);
	for(let arr=f.tbl[0].bindBuffer,x=arr.length;x--;) gl.bindBuffer(gl[arr[x]], info.getParameter[x], gl.STATIC_DRAW);
	for(let i=0,arrv=info.getVertexAttrib,sz=arrv.length;i!==sz;++i) if(arrv[i]) gl.vertexAttribPointer.apply(gl,arrv[i]);
},t[1],undefined,true,true);
new cfc(p).add('_render_splitInfo_getTest',function f(){
	return ({pt:this._splitPoint,slope:this._splitSlope,width:this._splitWidth,height:this._splitHeight,});
},undefined,true,true).add('render_splitInfo_add',function f(order,dur,holdDur,ptx,pty,slope,width,height,endFlashDur,endFlashColor){
	const info={
		order:order,
		dur:0,
		durMax:dur,
		durTotal:dur+holdDur,
		pt:{x:ptx,y:pty},
		slope:slope,
		widthMax:width,
		heightMax:height,
		endFlashDur:endFlashDur,
		endFlashColor:Array.from(endFlashColor||[]),
		shouldReset:false,
	};
	if(!(0<info.durMax)||!(0<info.durTotal)) return;
	this._render_splitInfo_getCont().push(info);
	return info;
},undefined,true,true).add('_render_splitInfo_getCont',function f(){
	let rtv=this._splitInfos; if(!rtv) rtv=this._splitInfos=[];
	return rtv;
},undefined,true,true).add('_render_splitInfo_getSorted',function f(){
	return this._render_splitInfo_getCont().sort(f.tbl[0]);
},[
(a,b)=>a.order-b.order,
],true,true).add('render_splitInfo_clear',function f(){
	this._render_split_getInfos().length=0;
},undefined,true,true).add('update_splitInfo',function f(){
	const cont=this._render_splitInfo_getSorted(),keep=[];
	for(let x=0,xs=cont.length;x!==xs;++x){
		const info=cont[x];
		if(info.shouldReset) continue;
		if(info.dur<info.durTotal) ++info.dur;
		else{ info.shouldReset=true; $gameScreen.startFlash(info.endFlashColor,info.endFlashDur); }
		keep.push(info);
	}
	if(keep.length!==cont.length){ cont.length=0; cont.concat_inplace(keep); }
},undefined,true,true).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_splitInfo();
	return rtv;
});


new cfc(SceneManager).add('splittedRenderedSpriteset_start',function f(dur,holdDur,ptx,pty,slope,width,height,endFlashDur,endFlashColor){
	const sc=this._scene;
	const sps=sc&&sc._spriteset; if(!sps) return;
	sps._splitDur=0;
	sps._splitDurMax=dur;
	sps._splitDurTotal=dur+holdDur;
	sps._splitPoint={x:ptx,y:pty};
	sps._splitSlope=slope;
	sps._splitWidthMax=width;
	sps._splitHeightMax=height;
	sps._splitEndFlashDur=endFlashDur;
	sps._splitEndFlashColor=Array.from(endFlashColor||[]);
},undefined,true,true).add('splittedRenderedSpriteset_gen',function f(order,dur,holdDur,ptx,pty,slope,width,height,endFlashDur,endFlashColor){
	const sc=this._scene;
	const sps=sc&&sc._spriteset; if(!sps) return;
	return sps.render_splitInfo_add.apply(sps,arguments);
}).add('splittedRenderedSpriteset_update',function f(){
	const sc=this._scene;
	const sps=sc&&sc._spriteset; if(!sps) return;
	if(this._splittedRenderedSpriteset_shouldReset){ this._splittedRenderedSpriteset_shouldReset=false; sps._splitHeight=sps._splitWidth=0; }
	if(!(0<sps._splitDurMax)||!(0<sps._splitDurTotal)) return;
	if(!(sps._splitDur<sps._splitDurTotal)){
		sps._splitDurTotal=0;
		if(sps._splitEndFlashColor) $gameScreen.startFlash(sps._splitEndFlashColor,sps._splitEndFlashDur);
		this._splittedRenderedSpriteset_shouldReset=true;
		return;
	}
	const r=Math.sin(Math.min(1,++sps._splitDur/sps._splitDurMax)*(Math.PI/2));
	sps._splitWidth=r*sps._splitWidthMax;
	sps._splitHeight=r*sps._splitHeightMax;
}).add('updateScene',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.splittedRenderedSpriteset_update();
	return rtv;
});

})();
