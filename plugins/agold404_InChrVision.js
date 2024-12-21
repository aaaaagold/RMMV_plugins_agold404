"use strict";
/*:
 * @plugindesc set what to do when an event sees player
 * @author agold404
 * 
 * @help editor comment starting with (at-sign)inView in event command pages
 * 
 * 
 * starting with a single line of a clear <shapeDraw>, <shapeEval>, <targetEval>, or <detectedEval>
 * and ends with a single line of a clear </shapeDraw>, </shapeEval>, </targetEval>, or </detectedEval>, correspondingly.
 * one of each above appears at most once.
 * 
 * <shapeDraw />
 * draw the detecting shape
 *  F
 * LoR
 *  B
 * o: the point the event stands at.
 * F: front
 * B: back
 * L: left
 * R: right
 * 
 * <shapeEval />
 * specify the shape by eval().
 * return an array of xy-points(2-tuples) = [ [x,y] , [x,y] , ... ]
 * 
 * <targetEval />
 * specify an array of character objects
 * default = [$gamePlayer]
 * 
 * <detectedEval />
 * specify what to do (by eval() ) if detecting a target
 * 
 * selfSwitches=A,B,C,D,...
 * specify what self-switches will be turned on when detecting a target
 * 
 * blockR=id,id,id
 * specify what ids in R region blocks the vision
 * 
 * 
 * the later overwrites the former.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_NameField";
const params=PluginManager.parameters(pluginName);

t=[
undefined,
params, // 1: plugin params
];

new cfc(DataManager).add('onLoad_after_map',function f(obj){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_setInChrVision(obj);
	return rtv;
}).add('onLoad_setInChrVision',function f(obj){
	obj.events.forEach(f.tbl[0]);
},t=[
evtd=>{ if(!evtd) return;
	for(let p=0,pgv=evtd.pages,pe=pgv.length;p!==pe;++p){
		const txtv=[];
		let isInVision=false;
		for(let c=0,cmdv=pgv[p].list,ce=cmdv.length;c!==ce;++c){
			const cmd=cmdv[c];
			const code=cmd.code;
			if(isInVision){
				if(code===108||code===408) txtv.push(cmd.parameters[0]);
				else isInVision=false;
			}else if(code===108 && cmd.parameters[0]==="@inVision") isInVision=true;
		}
		if(!pgv[p].inChrVisions) pgv[p].inChrVisions=[];
		const txt=txtv.slice(1).join('\n');
		if(txt) pgv[p].inChrVisions.push(txtv.slice(1).join('\n'));
	}
},
]);

new cfc(Game_Event.prototype).add('setupPageSettings',function f(){
	const page=f.ori.apply(this,arguments);
	this.inVision_setFromRaws(page.inChrVisions);
	return page;
});

new cfc(Game_Character.prototype).addBase('inVision_getAll',function f(){
	return this._inChrVisions;
}).addBase('inVision_parseFromRaws',function f(raws){
	const xs=raws&&raws.length-0; if(!xs) return;
	const arr=[];
	for(let x=0;x!==xs;++x){
		const res=this.inVision_parseFromRaw(raws[x]);
		if(res) arr.push(res);
	}
	return arr;
}).addBase('inVision_parseFromRaw_cutComments',function f(line){
	const s2Idx=line.indexOf("//");
	return s2Idx<0?line:line.slice(0,s2Idx);
}).addBase('inVision_parseFromRaw',function f(raw){
	if(!raw||!raw.length) return undefined;
	const rtv={};
	const lines=raw.replace(re_allR,'').split('\n');
	for(let x=0,xs=lines.length,reservedKeys=f.tbl[0];x!==xs;++x){
		const line=this.inVision_parseFromRaw_cutComments(lines[x]);
		if(line==="<shapeDraw>") x=this._inVision_parseFromRaw_shapeDraw(rtv,lines,x+1);
		else if(line==="<shapeEval>") x=this._inVision_parseFromRaw_shapeEval(rtv,lines,x+1);
		else if(line==="<detectedEval>") x=this._inVision_parseFromRaw_detectedEval(rtv,lines,x+1);
		else if(line==="<targetsEval>") x=this._inVision_parseFromRaw_targetsEval(rtv,lines,x+1);
		else{
			const eqIdx=lines[x].indexOf('=');
			if(eqIdx<0) continue;
			const key=lines[x].slice(0,eqIdx);
			if(!reservedKeys.has(key)) rtv[key]=lines[x].slice(eqIdx+1);
		}
	}
	return rtv;
},[
new Set(["<shapeDraw>","<shapeEval>","<detectedEval>",]), // 1: avoid set
]).addBase('_inVision_parseFromRaw_common',function f(rtv,lines,strt,key){
	let ende=lines.indexOf("</"+key+">",strt); if(ende<0) ende=lines.length;
/*
	let cont=rtv["<"+key+">"]; if(!cont) cont=rtv["<"+key+">"]=[];
	cont.push(lines.slice(strt,ende));
*/
	rtv["<"+key+">"]=lines.slice(strt,ende);
	return ende;
}).addBase('_inVision_parseFromRaw_shapeDraw',function f(rtv,lines,strt){
	const ende=this._inVision_parseFromRaw_common(rtv,lines,strt,"shapeDraw");
	const info=rtv["<shapeDraw>"];
	const matrix=[];
	const ys=info.length;
	let ox,oy,mx=Infinity,my=ys,Mx=0,My=0;
	for(let y=0;y!==ys;++y){
		const arr=[];
		matrix.push(arr);
		const line=this.inVision_parseFromRaw_cutComments(info[y]);
		for(let x=0,xs=line.length;x!==xs;++x){
			if(line[x]==='+'||line[x]==='o'){
				mx=Math.min(mx,x);
				my=Math.min(my,y);
				Mx=Math.max(Mx,x);
				My=Math.max(My,y);
			}
			if(line[x]==='+') arr.push(1);
			else{
				arr.push(0);
				if(line[x]==='o'){
					if((isNaN(ox)||isNaN(oy))){ ox=x; oy=y; }
					else console.warn(f.tbl[0],f.tbl[1]["doubleO"]);
				}
			}
		}
	}
	const m2=[]; for(let y=my;y<=My;++y){ const arr=[]; for(let x=mx;x<=Mx;++x) arr.push(matrix[y][x]); m2.push(arr); }
	rtv["<shapeDraw>"]={
		matrix:m2,
		ox:ox-mx,
		oy:oy-my,
	};
	return ende;
},[
"error: inVision \n", // 1: errMsg header
{
"doubleO":" letter 'o' should appears only once",
}, // 1: errMsg body
]).addBase('_inVision_parseFromRaw_shapeEval',function f(rtv,lines,strt){
	const ende=this._inVision_parseFromRaw_common(rtv,lines,strt,"shapeEval");
	rtv["<shapeEval>"]=rtv["<shapeEval>"].join('\n');
	return ende;
}).addBase('_inVision_parseFromRaw_targetsEval',function f(rtv,lines,strt){
	const ende=this._inVision_parseFromRaw_common(rtv,lines,strt,"targetsEval");
	rtv["<targetsEval>"]=rtv["<targetsEval>"].join('\n');
	return ende;
}).addBase('_inVision_parseFromRaw_detectedEval',function f(rtv,lines,strt){
	const ende=this._inVision_parseFromRaw_common(rtv,lines,strt,"detectedEval");
	rtv["<detectedEval>"]=rtv["<detectedEval>"].join('\n');
	return ende;
}).addBase('inVision_setFromRaws',function f(raws){
	this._inChrVisions=this.inVision_parseFromRaws(raws);
	return this;
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_inVision();
	return rtv;
}).addBase('update_inVision',function f(){
	const all=this.inVision_getAll(); if(!all||!all.length) return;
	const tbl=f.tbl[0][this.direction()]; if(!tbl) return;
	const dFront=tbl[0],dRight=tbl[1];
	const x0=this.x,y0=this.y;
	for(let x=0,xs=all.length;x!==xs;++x) this._update_inVision1(all[x],tbl,x0,y0);
	return;
},[
{
2:[[ 0, 1],[-1, 0]],
4:[[-1, 0],[ 0,-1]],
6:[[ 1, 0],[ 0, 1]],
8:[[ 0,-1],[ 1, 0]],
}, // 0: dir->[dFront,dRight]
]).addBase('_update_inVision1',function f(inChrVision,dTbl,x0,y0){
	if(!inChrVision) return;
	const targets=this._inVision_getDetectTargets(inChrVision);
	const isDetectingPlayer=targets.uniqueHas($gamePlayer);
	const blockedRs=this._inVision_getBlockedRs(inChrVision);
	const dFront=dTbl[0],dRight=dTbl[1];
	const draw=inChrVision["<shapeDraw>"];
	const matrix=draw&&draw.matrix;
	const detecteds=[];
	const points=EVAL.call(this,inChrVision["<shapeEval>"])||[];
	if(matrix){ for(let j=0,ys=matrix.length;j!==ys;++j){ const dj=-(j-draw.oy); for(let i=0,xs=matrix[j].length;i!==xs;++i){
		if(matrix[j][i]){
			const di=i-draw.ox;
			const dx=di*dRight[0]+dj*dFront[0];
			const dy=di*dRight[1]+dj*dFront[1];
			points.push([
				x0+dx,
				y0+dy,
			]);
		}
	} } }
	if(inChrVision.penetrate){
		// mostly for dev-debug
		for(let i=points.length;i--;){
			const x1=points[i][0],y1=points[i][1];
			const curr=$gameMap.eventsXy(x1,y1);
			for(let z=0,zs=curr.length;z!==zs;++z) if(targets.uniqueHas(curr[z])) detecteds.uniquePush(curr[z]);
		}
	}else{
		for(let i=points.length;i--;){
			const x1=points[i][0],y1=points[i][1];
			const dx=x1-x0,dy=y1-y0;
			const dx1=dx<0?-1:1,dy1=dy<0?-1:1;
			let blocked=false;
			if(dy*dy<dx*dx){
				for(let x=x1;x!==x0;x-=dx1){
					const Y=(x-x0)/dx*dy+y1;
					const j0=Math.floor(Y),j1=Math.ceil(Y);
					for(let y=j0;y<=j1;++y) if(blockedRs.uniqueHas($gameMap.regionId($gameMap.roundX(x),$gameMap.roundY(y)))){ blocked=true; break; }
					if(blocked) break;
				}
			}
			if(dx*dx<dy*dy){
				for(let y=y1;y!==y0;y-=dy1){
					const X=(y-y0)/dy*dx+x1;
					const i0=Math.floor(X),i1=Math.ceil(X);
					for(let x=i0;x<=i1;++x) if(blockedRs.uniqueHas($gameMap.regionId($gameMap.roundX(x),$gameMap.roundY(y)))){ blocked=true; break; }
					if(blocked) break;
				}
			}
			if(blocked) continue;
			const curr=$gameMap.eventsXy(x1,y1);
			for(let z=0,zs=curr.length;z!==zs;++z) if(targets.uniqueHas(curr[z])) detecteds.uniquePush(curr[z]);
			if(isDetectingPlayer && $gamePlayer.pos(x1,y1)) detecteds.uniquePush($gamePlayer);
		}
	}
	if(!detecteds.length) return;
	this._inVision_doDetectedEval(detecteds,inChrVision["<detectedEval>"]);
}).addBase('_inVision_getDetectTargets',function f(inChrVision){
	const raw=inChrVision["<targetsEval>"];
	if(raw===undefined) return [$gamePlayer];
	return EVAL.call(this,raw);
},[
arr=>{
	const rtv=[];
	for(let x=0,xs=arr.length;x<xs;++x){
		if(arr[x]==0||arr[x]==='p') rtv.uniquePush($gamePlayer);
		else{
			const chr=$gameMap.event(arr[x]);
			if(chr) rtv.push(chr);
		}
	}
	return rtv;
}, // to chr objs
]).addBase('_inVision_doDetectedEval',function f(detecteds,s){
	eval(s);
}).addBase('_inVision_getBlockedRs',function f(inChrVision){
	return inChrVision.blockedR&&inChrVision.blockedR.match(f.tbl[0]).map(Number)||[];
},[
/([0-9]+)/g,
]);

})();

