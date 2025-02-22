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
 * <nondetectedEval />
 * specify what to do (by eval() ) if not detecting a target
 * 
 * <onDetectedEval />
 * specify what to do (by eval() ) if changing from not detecting a target to detecting a target
 * 
 * <onNondetectedEval />
 * specify what to do (by eval() ) if changing from detecting a target to not detecting a target
 * 
 * selfSwitch=A,B,C,D,...
 * specify what self-switches will be turned on when detecting a target
 * 
 * blockR=id,id,id
 * specify what ids in R region blocks the vision
 * 
 * showHint=(any)
 * specify wheather to vision hint
 * anything besides an empty string indicates to show the hint
 * needs agold404_CopyEvent.js
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
		const txt=txtv.join('\n');
		if(txt) pgv[p].inChrVisions.push(txt);
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
		else if(line==="<targetsEval>") x=this._inVision_parseFromRaw_targetsEval(rtv,lines,x+1);
		else if(line==="<detectedEval>") x=this._inVision_parseFromRaw_detectedEval(rtv,lines,x+1);
		else if(line==="<nondetectedEval>") x=this._inVision_parseFromRaw_nondetectedEval(rtv,lines,x+1);
		else if(line==="<onDetectedEval>") x=this._inVision_parseFromRaw_onDetectedEval(rtv,lines,x+1);
		else if(line==="<onNondetectedEval>") x=this._inVision_parseFromRaw_onNondetectedEval(rtv,lines,x+1);
		else{
			const eqIdx=lines[x].indexOf('=');
			if(eqIdx<0) continue;
			const key=lines[x].slice(0,eqIdx);
			if(!reservedKeys.has(key)) rtv[key]=lines[x].slice(eqIdx+1);
		}
	}
	return rtv;
},[
new Set(["<shapeDraw>","<shapeEval>","<targetsEval>","<detectedEval>",]), // 0: avoid set
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
}).addBase('_inVision_parseFromRaw_nondetectedEval',function f(rtv,lines,strt){
	const ende=this._inVision_parseFromRaw_common(rtv,lines,strt,"nondetectedEval");
	rtv["<nondetectedEval>"]=rtv["<nondetectedEval>"].join('\n');
	return ende;
}).addBase('_inVision_parseFromRaw_onDetectedEval',function f(rtv,lines,strt){
	const ende=this._inVision_parseFromRaw_common(rtv,lines,strt,"onDetectedEval");
	rtv["<onDetectedEval>"]=rtv["<onDetectedEval>"].join('\n');
	return ende;
}).addBase('_inVision_parseFromRaw_onNondetectedEval',function f(rtv,lines,strt){
	const ende=this._inVision_parseFromRaw_common(rtv,lines,strt,"onNondetectedEval");
	rtv["<onNondetectedEval>"]=rtv["<onNondetectedEval>"].join('\n');
	return ende;
}).addBase('inVision_setFromRaws',function f(raws){
	this._inChrVisions=this.inVision_parseFromRaws(raws);
	return this;
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_inVision();
	return rtv;
}).addBase('update_inVision',function f(){
	const posKeys=this._update_inVision();
	this.inVision_updateHint(posKeys);
}).addBase('_update_inVision',function f(){
	const all=this.inVision_getAll(); if(!all||!all.length) return;
	const tbl=f.tbl[0][this.direction()]; if(!tbl) return;
	const dFront=tbl[0],dRight=tbl[1];
	const x0=this.x,y0=this.y;
	const posKeys=[];
	for(let x=0,xs=all.length;x!==xs;++x) posKeys.uniquePushContainer(this._update_inVision1(all[x],tbl,x0,y0));
	return posKeys;
},[
{
2:[[ 0, 1],[-1, 0]],
4:[[-1, 0],[ 0,-1]],
6:[[ 1, 0],[ 0, 1]],
8:[[ 0,-1],[ 1, 0]],
}, // 0: dir->[dFront,dRight]
]).addBase('_update_inVision1',function f(inChrVision,dTbl,x0,y0){
	const lastDetectState=this._inVision_isDetected;
	const rtv=[]; // seen points
	if(!inChrVision) return rtv;
	const targets=this._inVision_getDetectTargets(inChrVision);
	const isDetectingPlayer=targets.uniqueHas($gamePlayer);
	const blockedRs=this._inVision_getBlockedRs(inChrVision);
	const showHint=$gameMap&&this._inVision_getShowHint(inChrVision);
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
			const x1r=$gameMap.roundX(x1),y1r=$gameMap.roundY(y1);
			
			const curr=$gameMap.eventsXy(x1r,y1r);
			for(let z=0,zs=curr.length;z!==zs;++z) if(targets.uniqueHas(curr[z])) detecteds.uniquePush(curr[z]);
			if(showHint) rtv.push($gameMap.getPosKey(x1,y1));
		}
	}else{
		for(let i=points.length;i--;){
			const x1=points[i][0],y1=points[i][1];
			const x1r=$gameMap.roundX(x1),y1r=$gameMap.roundY(y1);
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
			
			const curr=$gameMap.eventsXy(x1r,y1r);
			for(let z=0,zs=curr.length;z!==zs;++z) if(targets.uniqueHas(curr[z])) detecteds.uniquePush(curr[z]);
			if(isDetectingPlayer && $gamePlayer.pos(x1r,y1r)) detecteds.uniquePush($gamePlayer);
			if(showHint) rtv.push($gameMap.getPosKey(x1,y1));
		}
	}
	if(!detecteds.length){
		if(lastDetectState&&inChrVision["<onNondetectedEval>"]) this._inVision_doDetectedEval(detecteds,inChrVision["<onNondetectedEval>"]);
		if(inChrVision["<nondetectedEval>"]) this._inVision_doDetectedEval(detecteds,inChrVision["<nondetectedEval>"]);
		this._inVision_isDetected=false;
		return rtv;
	}
	if(this.eventId){ for(let letters=this._inVision_getSelfSwitches(inChrVision),x=letters.length,tmp=[$gameMap.mapId(),this.eventId(),undefined];x--;){
		if(!(tmp[2]=letters[x])) continue;
		$gameSelfSwitches.setValue(tmp,true);
	} }
	if(!lastDetectState&&inChrVision["<onDetectedEval>"]) this._inVision_doDetectedEval(detecteds,inChrVision["<onDetectedEval>"]);
	this._inVision_doDetectedEval(detecteds,inChrVision["<detectedEval>"]);
	this._inVision_isDetected=true;
	return rtv;
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
]).addBase('_inVision_getSelfSwitches',function f(inChrVision){
	return inChrVision.selfSwitch&&inChrVision.selfSwitch.split(f.tbl[0])||[];
},[
/[^A-Z]+/,
]).addBase('_inVision_getShowHint',function f(inChrVision){
	return inChrVision.showHint;
}).addBase('inVision_getFrontPoints',function f(n){
	const rtv=[];
	const d=this._direction;
	const N=Math.abs(n)|0;
	let x=this.x,y=this.y;
	if(0<N){
		if(n<0) this._direction=f.tbl[0][d];
		for(let _=N;_--;){
			const xy=this.frontPos(x,y,true);
			rtv.push([x=xy.x,y=xy.y]);
		}
		this._direction=d;
	}
	return rtv;
},t=[
{
2:8,
4:6,
6:4,
8:2,
}, // 0: 
]).addBase('inVision_getRightPoints',function f(n){
	const rtv=[];
	const d=this._direction;
	const N=Math.abs(n)|0;
	let x=this.x,y=this.y;
	if(0<N){
		if(n<0) this._direction=f.tbl[0][d];
		for(let _=N;_--;){
			const xy=this.rightPos(x,y,true);
			rtv.push([x=xy.x,y=xy.y]);
		}
		this._direction=d;
	}
	return rtv;
},t).addBase('inVision_updateHint',function f(posKeys){
	this.inVision_updateHint_hideLast();
	this.inVision_updateHint_placing(posKeys);
}).addBase('inVision_updateHint_hideLast',function f(){
	const last=this._inVision_lastHintEvts;
	if(last) for(let x=last.length;x--;) last[x].locate(-8,-8);
}).addBase('inVision_updateHint_placing',function f(posKeys){
	if(!posKeys||!posKeys.length||!$gameMap||!$gameMap.cpevt) return;
	const newEvts=[];
	const last=this._inVision_lastHintEvts;
	for(let i=posKeys.length;i--;){
		const xy=$gameMap.posKeyToXy(posKeys[i]); if(!xy) continue;
		const evt=last&&last.length?last.pop():$gameMap.event($gameMap.cpevt('_template',xy.x,xy.y));
		newEvts.push(evt);
		evt.setChrIdxName(0,f.tbl[0],0,false);
		evt.setOpacity(f.tbl[1]);
		evt.setPriorityType(0);
		evt.locate(xy.x,xy.y);
	}
	this._inVision_lastHintEvts=last?last.concat_inplace(newEvts):newEvts;
},[
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAEAAQMAAACAuTMkAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAADUExURf8AABniCTcAAAAjSURBVGje7cExAQAAAMKg9U9tDQ+gAAAAAAAAAAAAAAAAvg0xAAABNYQU4gAAAABJRU5ErkJggg==", // 0: 384x256 red
127, // 1: opacity
]);

})();

