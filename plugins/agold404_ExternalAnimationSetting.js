"use strict";
/*:
 * @plugindesc 動畫接動畫 ; 動畫帶圖 ; 動畫帶音效
 * @author agold404
 * @help 外部 note 路徑: custom/Animations/AniNote-動畫編號.txt
 * 動畫編號前面不補0
 * 
 * 
 * 
 * <concatAnimationsFrame:動畫id>
 * 或
 * <concatAnimationsFrame:[動畫id,動畫id,...]>
 * 
 * 
 * 
 * <pictures>
[
{
"id":"自訂辨識該圖的名稱，之後使用同樣名稱的話不會再產生新的圖片",
"animationFrames":[0,123],
"endType":"keep",
"imgPath":"img/圖片路徑/圖片名稱.png",
"imgOrigin":"center",
"imgReflect":true,
"positionReference":"target",
"imgFrame":[[0,0,200,100],[0,200,200,100]],
"position":[[0,0],[234,123]],
"scale":[[1,1],[2,3]],
"alpha":[0,1],
"rotate":[0,720],
"skew":[[360,360],[330,300]],
"dz":0.1,
},
{
"id":"自訂辨識該圖的名稱，之後使用同樣名稱的話不會再產生新的圖片",
"animationFrames":[124,134],
"其他欄位":"下略"
}
]
animationFrames: 數字為動畫第幾格。第幾個數字對應到下面其他陣列ㄉ欄位第幾個。線性變化。
endType: "keep" or "remove", any unsupported value is treated as "remove"
imgOrigin: "center" or "100,200" (x座標100,y座標200的地方) or "10%,20%" (圖片x座標10%,y座標20%的地方(左邊、上面是0%；右邊、下面是100%)). default "center"
imgReflect: true or false, false-like or true-like will be accepted. default false.
positionReference: "target" or "screen", any unsupported value is treated as "screen"
imgFrame: [ [0,0,"100%","100%"] ,...] 或 [ [0,0,234,123] ,...]
position: [ [0,0] ,...] // offset x and y
scale: [ [1,1] ,...] // scale x and y
rotate: [ 0 ,...] // rotate degree. 360 per cycle.
skew: [ [360,360] ,...] // skew x and y. 360 per cycle.
dz: [ 1 ,...] // z軸要比動畫多多少。預設1。<0表示在下面；>0表示在上面；0的話則戰鬥和地圖中會有不同。

[
"imgFrame",
"position",
"scale",
"alpha",
"rotate",
"skew",
"dz",
]
可接上 _loop 來指定：[從0開始數的第幾框的設定開始選,到從0開始數的第幾框的設定為止,循環貼到第幾框開始,循環貼到第幾框開始結束]
例如：
[
...
{
原參數名: ...
原參數名_loop: [[從0開始數的第幾框的設定開始選,到從0開始數的第幾框的設定為止,循環貼到第幾框開始,循環貼到第幾框開始結束]],
},
...
]
 * 
 * 
 * 
 * <seAudios>
[
[frame_from_0,audio_file_path,pan,pitch,volume]
]
pan: 0 is balanced ; -1: left ; 1: right
pitch: 1 is normal
volume: 1 is normal
 * 
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Sprite_Animation.prototype).add('setup',function f(target, animation, mirror, delay, rate){
	const rtv=f.ori.apply(this,arguments);
	this.concatAnimationFrame(animation);
	return rtv;
}).add('concatAnimationFrame',function f(ani,currSet){
	const meta=ani&&ani.meta;
	const raw=meta&&meta[f.tbl[0]]; if(!raw) return;
	meta[f.tbl[0]]=undefined;
	currSet=currSet||[];
	if(currSet.uniqueHas(ani)){ throw new Error(f.tbl[1]+ani.id); return; }
	currSet.uniquePush(ani);
	const arr=[].concat_inplace(JSON.parse(raw));
	for(let x=0,xs=arr.length;x!==xs;++x){
		const nxt=$dataAnimations[arr[x]]; if(!nxt) continue;
		f.call(this,nxt,currSet);
		const oriTotalFrame=ani.frames.length;
		for(let t=0,tarr=nxt.timings,ts=tarr.length;t!==ts;++t){
			const info={}; for(let k in tarr[t]) info[k]=tarr[t][k];
			info.frame+=oriTotalFrame;
			ani.timings.push(info);
		}
		ani.frames.concat_inplace(nxt.frames);
	}
},[
"concatAnimationsFrame",
"動畫接動畫接到循環了: ",
]);

})();



(()=>{ let k,r,t;

new cfc(DataManager).add('parseAnimationPictures',function f(animation){
	const meta=animation&&animation.meta;
	if(!meta||!meta.pictures) return;
	let arr=animation.pictures;
	if(!arr){
		arr=animation.pictures=JSON.parse(meta.pictures);
		const xs=arr.length; if(!(0<xs)) return;
		const imgs=arr._imgs=[];
		const byFrames=arr._byFrames=[];
		{ let maxFrame=0; for(let x=0;x!==xs;++x) maxFrame=Math.max(maxFrame,Math.max.apply(null,arr[x].animationFrames)+1||0);
		const frms=animation.frames; if(frms&&frms.push) while(maxFrame>=frms.length) frms.push([]);
		for(let frm=maxFrame+1;frm--;) (byFrames[frm]=[])._ids=new Map(); // +1 above and +1 here for end mark
		}
		// put data per animation frame
		for(let x=0;x!==xs;++x){ const info=arr[x]; if(!info||!info.imgPath) continue;
			const frms=info.animationFrames;
			const timePointCnt=frms&&frms.length;
			if(!timePointCnt) continue;
			if(!info.imgFrame ) info.imgFrame =[f.tbl[0].imgFrame ];
			if(!info.position ) info.position =[f.tbl[0].position ];
			if(!info.scale    ) info.scale    =[f.tbl[0].scale    ];
			if(!info.alpha    ) info.alpha    =[f.tbl[0].alpha    ];
			if(!info.rotate   ) info.rotate   =[f.tbl[0].rotate   ];
			if(!info.skew     ) info.skew     =[f.tbl[0].skew     ];
			if(!info.dz       ) info.dz       =[f.tbl[0].dz       ];
			if( JSON.stringify(frms)!==JSON.stringify(frms.sort(f.tbl[1])) ) alert(f.tbl[2].replace("{}",x+''));
			{ const tbl=f.tbl[3];
			tbl._func(tbl,'endType',info);
			tbl._func(tbl,'positionReference',info);
			}
			info.imgReflect=!!info.imgReflect;
			imgs.uniquePush(info.imgPath);
			frms.push(frms.back-0+1);
			for(let tp=1;tp<=timePointCnt;++tp){
				if(null==info.imgFrame[tp]) info.imgFrame[tp]=info.imgFrame[tp-1];
				if(null==info.position[tp]) info.position[tp]=info.position[tp-1];
				if(null==info.scale   [tp]) info.scale   [tp]=info.scale   [tp-1];
				if(null==info.alpha   [tp]) info.alpha   [tp]=info.alpha   [tp-1];
				if(null==info.rotate  [tp]) info.rotate  [tp]=info.rotate  [tp-1];
				if(null==info.skew    [tp]) info.skew    [tp]=info.skew    [tp-1];
				if(null==info.dz      [tp]) info.dz      [tp]=info.dz      [tp-1];
				for(let strtFrm=frms[tp-1]-0,endFrm=frms[tp]-0,widthFrm=endFrm-strtFrm,frm=strtFrm;frm!==endFrm;++frm){
					const r=(frm-strtFrm)/widthFrm;
					byFrames[frm].push({
						id:info.id,
						endType:info.endType,
						imgPath:info.imgPath,
						imgOrigin:info.imgOrigin,
						imgReflect:info.imgReflect,
						positionReference:info.positionReference,
						imgFrame:f.tbl[4](info.imgFrame[tp-1],info.imgFrame[tp],r),
						position:f.tbl[4](info.position[tp-1],info.position[tp],r),
						scale:f.tbl[4](info.scale[tp-1],info.scale[tp],r),
						alpha:f.tbl[4](info.alpha[tp-1],info.alpha[tp],r),
						rotate:f.tbl[4](info.rotate[tp-1],info.rotate[tp],r),
						skew:f.tbl[4](info.skew[tp-1],info.skew[tp],r),
						dz:f.tbl[4](info.dz[tp-1],info.dz[tp],r),
					});
					const m=byFrames[frm]._ids;
					if(m.get(info.id)!=="keep") m.set(info.id,info.endType);
				}
			}
			frms.pop(); // restore for doing it again (debug purpose)
		}
		// mark remove
		byFrames[0]._removes=new Set();
		for(let frm=1,endFrm=byFrames.length;frm!==endFrm;++frm){
			const s=byFrames[frm]._removes=new Set();
			const m0=byFrames[frm-1]._ids;
			const m1=byFrames[frm]._ids;
			m0.forEach(f.tbl[5].bind(f.tbl[3].endType,s,m1));
		}
		this.parseAnimationPictures_loop(arr);
	}
	return arr;
},[
{
imgFrame:[0,0,"100%","100%"],
position:[0,0],
scale:[1,1],
alpha:1,
rotate:0,
skew:[0,0],
dz:1,
}, // 0: default value
(a,b)=>a-b, // 1: cmp
"WARNING: 從 0 開始數的第 {} 個動畫設定的 animationFrames 不是遞增\n這可能導致非預期的呈現結果", // 2: warning string
{
_func:(tbl,key,info)=>{
	const defaultInfo=tbl[key];
	if(!defaultInfo[0].has(info[key])) info[key]=defaultInfo[1];
}, // 3-_func
endType:[new Set(t=["keep","remove"]),"remove"], // 3-endType: supported values, default value
positionReference:[new Set(t=["target","screen"]),"screen"], // 3-positionReference: supported values, default value
}, // 3: default values
function f(a,b,r){ if(b==null) b=a;
	if(a===b) return b;
	let rtv;
	if(a instanceof Array){ rtv=[]; for(let x=0,xs=a.length;x!==xs;++x) rtv[x]=f(a[x],b[x],r); }
	else{
		let tmp;
		tmp=a-0; if(!isNaN(tmp)) a=tmp;
		tmp=b-0; if(!isNaN(tmp)) b=tmp;
		const fa=a!=null&&(a.constructor===String);
		if(fa!==(b!=null&&(b.constructor===String))) throw new Error("using Number then String or vice versa is not supported.\n"+a+'\n'+b);
		if(fa){
			if(!f.tbl) f.tbl=[DataManager._re_parsePercent];
			const ma=a.match(DataManager._re_parsePercent); if(!ma) throw new Error("invalid string in animation note: <pictures: ... >\n"+a);
			const mb=b.match(DataManager._re_parsePercent); if(!mb) throw new Error("invalid string in animation note: <pictures: ... >\n"+b);
			return (ma[1]*(1-r)+mb[1]*r)+"%";
		}else rtv=a*(1-r)+b*r;
	}
	return rtv;
}, // 4: interpolate
function f(s,m1,v,k){ if(v===this[1]&&!m1.has(k)) s.add(k); }, // 5: add it to set if it is "remove" and not presented in m1
],false,true).add('parseAnimationPictures_loop',function f(arr,forced){
	if(!forced&&arr._looped) return; // already set
	arr._looped=true;
	const byFrames=arr._byFrames,endFrm=byFrames.length;
	for(let frm=0;frm!==endFrm;++frm){
		const infoArr=byFrames[frm]; if(!infoArr) continue;
		if(!infoArr._id2setting) infoArr._id2setting=new Map(infoArr.map(f.tbl[0]));
	}
	const alrt=Utils.isOptionValid('test')?alert:none;
	for(let x=0,xs=arr.length;x!==xs;++x){ const info=arr[x]; if(!info||!info.imgPath) continue;
		const id=info.id;
		const frms=info.animationFrames;
		const timePointCnt=frms&&frms.length;
		if(!timePointCnt) continue;
		for(let ki=0,keys=f.tbl[1],ks=keys.length;ki!==ks;++ki){
			const key=keys[ki];
			const loopInfov=info[key+'_loop']; if(!loopInfov) continue;
			for(let li=0,ls=loopInfov.length;li!==ls;++li){
				const loopInfo=loopInfov[li];
				const frmSrcStrt=loopInfo[0]-0,mFrmSrc=loopInfo[1]-frmSrcStrt+1,frmDstStrt=loopInfo[2]-0,frmDstLast=loopInfo[3]-0;
				if(!(frmSrcStrt>=0&&0<mFrmSrc&&frmDstStrt>=0)){
					alrt(f.tbl[2].replace("{}",id).replace("{}",key));
					continue;
				}
				for(let frm=frmDstStrt;frm<=frmDstLast;++frm){ if(!(frm<endFrm)) break;
					const idxSrc=(frm-frmDstStrt)%mFrmSrc+frmSrcStrt; if(!(idxSrc<endFrm)) break;
					const infoDst=byFrames[frm    ]&&byFrames[frm    ]._id2setting.get(id); if(!infoDst) continue;
					const infoSrc=byFrames[idxSrc ]&&byFrames[idxSrc ]._id2setting.get(id); if(!infoSrc) continue;
					infoDst[key]=infoSrc[key];
				}
			}
		}
	}
},[
info=>[info.id,info], // map
[
"imgFrame",
"position",
"scale",
"alpha",
"rotate",
"skew",
"dz",
], // 1: loop keys
"動畫帶圖 id={} key={}_loop 框數設定異常", // 2: error msg
],undefined,false,true).add('parseAnimationPictures_number',function f(bmp,x,y){
	const rtv=[x,y];
	rtv[0]=f.tbl[0](bmp.width,x);
	rtv[1]=f.tbl[0](bmp.height,y);
	return rtv;
},[
function f(ref,s){
	if(s===undefined) return;
	if(!f.tbl) f.tbl=[DataManager._re_parsePercent];
	if(s&&s.constructor===String){ const m=s.match(f.tbl[0]); if(m){
		return m[1]/100*ref;
	} }
	return s;
},
],false,true).add('parseAnimationPictures_apply',function f(sp,bmp,info){
	bmp.addLoadListener(f.tbl[0].bind(this,info,f.tbl[1],sp,bmp));
},[
function f(info,tbl,spRoot,bmp){
	const origin=info.imgOrigin;
	const frm=info.imgFrame;
	const scale=info.scale;
	const alpha=info.alpha;
	const rotate=info.rotate;
	const skew=info.skew;
	const imgReflect=info.imgReflect;
	let imgOrigin=info.imgOrigin;
	//const loc=info.position; // set in updatePosition
	const sp=spRoot.children[0];
	
	let tmp;
	tmp=DataManager.parseAnimationPictures_number(bmp,frm[0],frm[1]); frm[0]=tmp[0]; frm[1]=tmp[1];
	tmp=DataManager.parseAnimationPictures_number(bmp,frm[2],frm[3]); frm[2]=tmp[0]; frm[3]=tmp[1];
	
	sp.setFrame(frm[0],frm[1],frm[2],frm[3]);
	//sp.position.set(loc[0],loc[1]); // set in updatePosition
	sp.scale.set(!imgReflect&&this._mirror?-scale[0]:scale[0],scale[1]);
	sp.alpha=alpha;
	sp.rotation=rotate/180.0*Math.PI;
	sp.skew.set(skew[0]/180.0*Math.PI,skew[1]/180.0*Math.PI);
	if(!f.tbl) f.tbl=["center",];
	if(!origin||origin===f.tbl[0]) sp.anchor.set(0.5);
	else if(origin){
		let xy=origin.split(',');
		xy=DataManager.parseAnimationPictures_number(bmp,xy[0],xy[1]);
		sp.anchor.set(xy[0]/bmp.width,xy[1]/bmp.height);
	}
	spRoot.scale.x=this._mirror?-1:1;
},
DataManager.parseAnimationPictures.tbl[3].positionReference,
],false,true).getP()._re_parsePercent=/[ \t]*([0-9]+(\.[0-9]+)?)%[ \t]*/;

new cfc(Sprite_Animation.prototype).add('setup',function f(target, animation, mirror, delay, rate){
	const rtv=f.ori.apply(this,arguments);
	this.setupPictures(animation);
	return rtv;
}).add('setupPictures',function f(animation){
	const arr=this._pictureArr=DataManager.parseAnimationPictures(animation);
	if(!arr) return;
	arr._bmp=new Map();
	for(let x=0,xs=arr._imgs.length;x!==xs;++x) arr._bmp.set(arr._imgs[x],ImageManager.loadNormalBitmap(arr._imgs[x]));
	this.setupDuration();
}).add('findTimingData',function f(frameIndex){
	const rtv=f.ori.apply(this,arguments);
	this.findTimingData_pictures(frameIndex);
	return rtv;
}).add('findTimingData_pictures',function f(frameIndex){
	if(!this._pictureArr) return;
	if(!this._pictures) this._pictures=new Map(); // id -> sp
	const byFrames=this._pictureArr._byFrames;
	const infos=byFrames&&byFrames[frameIndex];
	if(!infos) return;
	
	this._pictures.forEach(f.tbl[0].bind(this,infos));
	for(let x=0,xs=infos.length;x!==xs;++x){ const info=infos[x];
		const id=info.id;
		let sp=this._pictures.get(id);
		if(!sp){ this._pictures.set(id,sp=new Sprite()); this.parent.addChild(sp); sp.addChild(new Sprite()); }
		const bmp=sp.children[0].bitmap=this._pictureArr._bmp.get(info.imgPath); if(!bmp) continue;
		DataManager.parseAnimationPictures_apply.call(this,sp,bmp,info);
		sp._currInfo=info;
		sp.z=this.z+info.dz;
	}
	this.updatePosition_pictures();
},[
function f(infos,v,k){
	if(infos._removes.has(k)){
		this._pictures.delete(k);
		if(v) v.destroy();
	}
},
],false,true).add('updatePosition',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updatePosition_pictures();
	return rtv;
}).add('updatePosition_pictures',function f(){
	if(this._pictures){
		if(0<this._duration) this._pictures.forEach(f.tbl[0].bind(this,f.tbl[1]));
		else this._pictures.forEach(f.tbl[2]);
	}
},[
function f(tbl,v,k){
	const info=v._currInfo; if(!info) return;
	const loc=info.position;
	let x,y;
	if(tbl[1]===info.positionReference){ // screen
		if(this._mirror) x=Graphics.boxWidth  -loc[0];
		else x=loc[0];
		y=loc[1];
	}else{
		const ref=this._target;
		if(this._mirror) x=ref.x-loc[0];
		else x=ref.x+loc[0];
		y=ref.y+loc[1];
	}
	v.position.set(x,y);
},
DataManager.parseAnimationPictures.tbl[3].positionReference,
(v,k)=>v.destroy(),
],false,true);

})();



(()=>{ let k,r,t;

new cfc(DataManager).add('parseAnimationSeAudios',function f(animation){
	const meta=animation&&animation.meta;
	if(!meta||!meta.seAudios) return;
	let arr=animation.seAudios;
	if(!arr){
		arr=animation.seAudios=JSON.parse(meta.seAudios);
		const xs=arr.length; if(!(0<xs)) return;
		const byFrames=arr._byFrames=[];
		for(let x=0;x!==xs;++x){
			const info=arr[x];
			const frmInfos=byFrames[info[0]]=byFrames[info[0]]||[];
			frmInfos.push(info);
		}
		for(let x=0,frms=byFrames.length;x!==frms;++x) byFrames[x]=byFrames[x]||[];
	}
	return arr;
});

new cfc(Sprite_Animation.prototype).add('updateFrame',function f(){
	this.updateFrame_seAudios();
	return f.ori.apply(this,arguments);
}).add('updateFrame_seAudios',function f(){
	const seAudios=DataManager.parseAnimationSeAudios(this._animation); if(!seAudios) return;
	const byFrames=seAudios._byFrames;
	const infos=byFrames&&byFrames[this.currentFrameIndex()]; if(!infos) return;
	for(let x=0,xs=infos.length;x!==xs;++x){
		const info=infos[x];
		const pan=info[2]*100||0;
		const pitch=isNaN(info[3])?100:info[3]*100;
		const volume=isNaN(info[4])?100:info[4]*100;
		AudioManager.playSe({name:info[1],pan:pan,pitch:pitch,volume:volume});
	}
});

})();
