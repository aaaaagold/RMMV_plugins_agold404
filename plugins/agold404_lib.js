"use strict";
/*:
 * @plugindesc all necessaries for agold404
 * @author agold404
 * @help as title
 * 
 * This plugin can be renamed as you want.
 */

const _DateNow=Date.now();

{
const cf=(p,k,f,tbl,is_putDeepest,is_notUsingOri)=>{
	if(is_putDeepest && p[k] && p[k].ori){
		let fp=p[k],fc=p[k].ori,fs=new Set();
		do{
			if(fs.has(fc)) throw new Error('f.ori repeated');
			fs.add(fc);
			if(fc.ori){
				fp=fc;
				fc=fc.ori;
			}else break;
		}while(fc);
		f._dbg=fc;
		(fp.ori=f).ori=fc;
	}else{
		const r=p[k];
		p[k]=f;
		f._dbg=r;
		f.ori=r;
	}
	if(is_notUsingOri) f.ori=undefined;
	f.tbl=tbl;
	return p;
};
const a=function cfc(p){
	if(this===window || (typeof globalThis!=='undefined'&&this===globalThis)) throw new Error('call a constructor without new');
	this._p=p;
}
const p=a.prototype;
p.constructor=a;
p.add=function(key,f,t,d,u){
	cf(this._p,key,f,t,d,u);
	return this;
};
p.getP=function(){ return this._p; };
window[a.name]=a;
}


(()=>{

// Array
(()=>{ const p=Array.prototype;
Object.defineProperties(p,{
back:{
	get:function(){ return this[this.length-1]; },
	configurable: true},
});
p.getnth=p.getObjAt=function(i){ return this[i]; };
p.rnd1=function(){ return this[~~(Math.random()*this.length)]; };
p.concat_inplace=function(...items){
	for(let i=0,sz=arguments.length;i!==sz;++i){
		const item=arguments[i];
		if(item instanceof Array) for(let x=0,xs=item.length;x!==xs;++x) this.push(item.getObjAt(x));
		else this.push(item);
	}
	return this;
};
p.pop_back=p.pop;
p.uniqueHas=function(obj){
	if(!this._map){
		this._map=new Map();
		for(let x=0,xs=this.length;x!==xs;++x) this._map.set(this[x],x);
	}
	return this._map.has(obj);
};
p.uniquePush=function( /* obj , ... */ ){
	for(let x=0;x!==arguments.length;++x){
		const obj=arguments[x];
		if(this.uniqueHas(obj)) continue;
		this._map.set(obj,this.length);
		Array.prototype.push.call(this,obj);
	}
	return this.length;
};
p.uniquePushContainer=function(cont){
	// push all cont's elements
	for(let x=0,xs=cont.length;x!==xs;++x) this.uniquePush(cont.getObjAt(x));
	return this;
};
p.uniquePop=function(obj){
	if(!this.uniqueHas(obj)) return;
	const res=this._map.get(obj); if(!(res>=0)) return;
	this._map.delete(obj);
	if(res+1!==this.length) this._map.set(this[res]=this.back,res);
	return Array.prototype.pop.call(this)?obj:undefined;
};
p.uniqueClear=function(){
	if(!this._map) this._map=new Map();
	this._map.clear();
	this.length=0;
};
new cfc(p).add('uniqueSort',function f(cmpFn=undefined){
	const arr=this.slice();
	this.uniqueClear();
	arr.sort.apply(arr,arguments).forEach(f.tbl[0],this);
	return this;
},[
function(x){ this.uniquePush(x); },
],true,true).add('sort',function f(cmpFn=undefined){
	return this._map?this.uniqueSort.apply(this,arguments):f.ori.apply(this,arguments);
}).add('concat_inplace',function f(...items){
	if(!this._map) return f.ori.apply(this,arguments);
	for(let i=0,sz=arguments.length;i!==sz;++i){
		const item=arguments[i];
		if(item instanceof Array) this.uniquePushContainer(item);
		else this.uniquePush(item);
	}
	return this;
});
p.kvHas=function(key){
	if(!this._kvMap) this._kvMap=new Map(this);
	return this._kvMap.has(key);
};
p.kvGetIdx=function(key){
	if(this.kvHas(key)) return this._kvMap.get(key)[0];
};
p.kvGetVal=function(key){
	if(this.kvHas(key)) return this._kvMap.get(key)[2];
};
p.kvPush=function(k,v){
	// this[*] === [idx,key,val]
	if(this.kvHas(k)) this._kvMap.get(k)[2]=v;
	else{
		const info=[this.length,k,v];
		this._kvMap.set(k,info);
		Array.prototype.push.call(this,info);
	}
};
p.kvPop=function(k){
	const rtv=this.kvGetVal(k);
	const idx=this.kvGetIdx(k);
	if(idx>=0){
		this._kvMap.delete(k);
		this.back[0]=idx;
		this[idx]=this.back;
		Array.prototype.pop.call(this);
	}
	return rtv;
};
})();

// Heap
(()=>{ let k,r,t;

{ const w=window; if(!w.Heap){
	let $dddd$;
	w.Heap=function(){ this.initialize.apply(this,arguments); };
	w.Heap.prototype.constructor=w.Heap;
	$dddd$=w.Heap.prototype.initialize=function f(func_cmp3,arr,inPlace){
		{
			const lt=func_cmp3;
			this._lt=(lt&&lt.constructor===Function)?(a,b)=>lt(a,b)<0:f.ori;
		}
		this._searchTbl=new Map();
		if(arr&&arr.constructor===Array){
			if(inPlace){
				arr.push(arr[0]);
				arr[0]=undefined;
				this._data=arr;
			}else this._data=[undefined].concat_inplace(arr);
			this.makeHeap();
		}else this._data=[undefined];
	};
	$dddd$.ori=(a,b)=>a<b;
	w.Heap.prototype.clear=function(){
		this._data.length=1;
		this._searchTbl.clear();
	};
	w.Heap.prototype.remove=function(ele){
		// do not use when 'ele' is basic type: undefined,null,Boolean,Number,String
		const st=this._searchTbl;
		let idx=st.get(ele);
		if(idx===undefined){ debugger; return; }
		st.delete(ele);
		const arr=this._data;
		const rtv=arr[idx];
		arr[idx]=arr.back;
		st.set(arr[idx],idx);
		arr.pop();
		this._sink(idx);
		return rtv;
	};
	Object.defineProperties(w.Heap.prototype,{
		top: {
			get:function(){return this._data[1];},
			set:function(rhs){
				const arr=this._data,st=this._searchTbl;
				st.delete(arr[1]);
				arr[1]=rhs;
				st.set(arr[1],1);
				this._sink();
				return rhs;
			},
		configurable: false},
		length: {
			get:function(){return this._data.length-1;},
		configurable: false}
	});
	w.Heap.prototype._sink=function(strt){
		const arr=this._data;
		if(arr.length===1) return;
		let idx=(strt<<1)||2,lt=this._lt;
		while(idx<arr.length){
			const offset=((idx|1)<arr.length&&lt(arr[idx],arr[idx|1]))^0; // larger
			if(lt(arr[idx>>1],arr[idx|offset])){ // less than larger one
				const idx1=idx>>1,idx2=idx|offset,st=this._searchTbl;
				const tmp=arr[idx1]; arr[idx1]=arr[idx2]; arr[idx2]=tmp;
				st.set(arr[idx1],idx1);
				st.set(arr[idx2],idx2);
			}else break;
			idx|=offset;
			idx<<=1;
		}
		return idx;
	};
	w.Heap.prototype._float=function(strt){
		const arr=this._data;
		if(arr.length===1) return;
		let idx=strt||(arr.length-1),lt=this._lt;
		while(idx!==1 && lt(arr[idx>>1],arr[idx])){
			const st=this._searchTbl,idx0=idx;
			idx>>=1;
			const tmp=arr[idx]; arr[idx]=arr[idx0]; arr[idx0]=tmp;
			st.set(arr[idx0],idx0);
			st.set(arr[idx ],idx );
		}
		return idx;
	};
	w.Heap.prototype.makeHeap=function(){
		const arr=this._data;
		for(let x=arr.length;--x;) this._sink(x);
		for(let x=arr.length;--x;) this._searchTbl.set(arr[x],x);
	};
	w.Heap.prototype.push=function(rhs){
		const arr=this._data;
		arr.push(rhs);
		this._searchTbl.set(arr.back,arr.length-1);
		this._float();
	};
	w.Heap.prototype.pop=function(){
		const arr=this._data;
		if(arr.length===1) return;
		const rtv=arr[1],st=this._searchTbl;
		st.delete(rtv);
		arr[1]=arr.back;
		st.set(arr[1],1);
		arr.pop();
		this._sink();
		return rtv;
	};
	w.Heap.prototype.toArr=function(){return this._data.slice(1);};
	w.Heap.prototype.rsrvTop=function(){
		const arr=this._data;
		if(arr.length===1) return;
		const st=this._searchTbl;
		st.clear();
		arr.length=2;
		st.set(arr[1],1);
		return this.top;
	};
} }

})();

// LruCache
(()=>{ let k,r,t;

const a=class LruCache{
static supportedMaxItemCount=(1<<23)-1;
constructor(maxItemCount,maxItemSize){
	this._count=0;
	this._countMax=maxItemCount|0||this.constructor.supportedMaxItemCount;
	if(this._countMax<0||this.constructor.supportedMaxItemCount<this._countMax) this._countMax=this.constructor.supportedMaxItemCount;
	this._size=0;
	this._sizeMax=maxItemSize-0||Infinity;
	this._serial=0;
	this._serialBase=0;
	this._serialMask=(1<<30)-1; // must > supportedMaxItemCount*2
	this._infoHeap=new Heap((a,b)=>((b.serial-this._serialBase)&this._serialMask)-((a.serial-this._serialBase)&this._serialMask));
	this._key2info=new Map();
}
gc(n){
	const h=this._infoHeap;
	if(h.length&&(this._countMax<this._count || this._sizeMax<this._size)) this.remove(h.top.key);
	if(h.length&&(this._serialMask>>1)<((this._serial-h.top.serial)&this._serialMask)) this.remove(h.top.key);
}
_add(info){
	// and push
	this.gc();
	++this._count;
	this._size+=info.size;
	info.serial=this._serial++;
	this._serial&=this._serialMask;
	this._infoHeap.push(info);
	this._key2info.set(info.key,info);
	this.gc();
}
remove(key){
	const info=this._key2info.get(key); if(!info) return;
	this._key2info.delete(key);
	const h=this._infoHeap;
	h.remove(info);
	--this._count;
	this._size-=info.size;
	if(h.length) this._serialBase=h.top.serial;
	else this._serialBase=this._serial=0;
	return info;
}
setCache(key,data,size){
	const info=this.remove(key)||{
		key:key,
		data:undefined,
		size:0,
		serial:0,
	};
	info.data=data;
	info.size=size;
	this._add(info);
}
getCache(key){
	const info=this.remove(key); if(!info) return;
	this._add(info);
	return info&&info.data;
}
};

window[a.name]=a;

})();


(()=>{ const p=Set.prototype;
p.intersect=function(set2){
	let base,search;
	if(this.size<set2.size){ base=this; search=set2; }
	else{ base=set2; search=this; }
	const rtv=new Set();
	base.forEach(x=>search.has(x)&&rtv.add(x));
	return rtv;
};
p.union_inplaceThat=function(set2){ this.forEach(x=>set2.add(x)); return set2; };
p.union_inplaceThis=function(set2){ return set2.union_inplaceThat(this); };
p.union=function(set2){
	if(this.size<set2.size) return new Set(set2).union_inplaceThis(this);
	else return new Set(this).union_inplaceThis(set2);
};
p.minus_inplace=function(set2){ set2.forEach(x=>this.delete(x)); return this; };
p.minus=function(set2){ return new Set(this).minus_inplace(set2); };
})();


(()=>{

{ const p=HTMLElement.prototype,d=document;
d.ce=d.createElement;
d.ctxt=d.createTextNode;
d.ge=d.getElementById;
p.ac=function(c){ this.appendChild(c); return this; };
p.atxt=function(t){ this.appendChild(d.ctxt(t)); return this; };
p.rc=function(c){ this.removeChild(c); return this; }
p.rf=function(i){
	const arr=this.childNodes;
	while(arr.length>i) this.rc(arr[arr.length-1]);
	return this;
};
p.ga=p.getAttribute;
p.sa=function(a,v){ this.setAttribute(a,v); return this; };
}
//
{ const p=HTMLCanvasElement.prototype;
p.ptcp=function(x,y,w,h,resizeTo){
	// partial copy ; return another canvas
	const rtv=document.ce('canvas');
	let targetW=w,targetH=h;
	if(resizeTo){
		if(resizeTo.w) targetW=resizeTo.w;
		if(resizeTo.h) targetH=resizeTo.h;
	}
	rtv.width  =targetW;
	rtv.height =targetH;
	
	const ctx=rtv.getContext('2d');
	ctx.drawImage(
		this,
		x,y,w,h,
		0,0,targetW,targetH
	);
	return rtv;
};
p.scale=function(r){
	// return another canvas
	if(isNaN(r)) r=1;
	const src=r<0?this.mirror_h().mirror_v():this;
	if(r<0) r=-r;
	const w=this.width , h=this.height;
	return src.ptcp(0,0,this.width,this.height,{w:w*r||1,h:h*r||1});
};
}

const useDefaultIfIsNaN=window.useDefaultIfIsNaN=(n,d)=>{
	const rtv=n-0;
	return isNaN(rtv)?d:rtv;
};
const getCStyleStringStartAndEndFromString=window.getCStyleStringStartAndEndFromString=(s,strt,ende)=>{
	// suppose s is a String
	if(ende===undefined) ende=s.length;
	if(strt===undefined) strt=0;
	while(strt<ende && s[strt] && s[strt]!=='"') ++strt;
	for(let x=strt+1,stat=0;s[x]&&x<ende;++x){
		if(s[x]==='\\') ++x;
		else if(s[x]==='"'){
			ende=x+1;
			break;
		}
	}
	if(s[strt]!=='"'||s[ende-1]!=='"'||strt>=ende) ende=strt=-1;
	return {start:strt,end:ende};
};
const getPrefixPropertyNames=window.getPrefixPropertyNames=(obj,prefix)=>{
	const rtv=[];
	for(let i in obj) if(i.slice(0,prefix.length)===prefix) rtv.push(i);
	return rtv;
};
const getTopFrameWindow=window.getTopFrameWindow=()=>{
	let w=window; while(w.parent && w.parent!==w) w=w.parent;
	return w;
};
const chTitle=window.chTitle=title=>{
	return getTopFrameWindow().document.title=title;
};
const copyToClipboard=window.copyToClipboard=s=>{ const d=document;
	const txtin=d.ce("textarea").sa("class","outofscreen");
	d.body.ac(txtin);
	txtin.value=""+s;
	txtin.select();
	txtin.setSelectionRange(0,txtin.value.length);
	d.execCommand("copy");
	txtin.parentNode.removeChild(txtin);
	if(typeof $gameMessage!=='undefined' && $gameMessage && $gameMessage.popup) $gameMessage.popup("已複製: "+s.replace(/\\/g,"\\\\"),1);
};
const pasteCanvas=window.pasteCanvas=c=>{
	const img=document.createElement('img');
	img.src=c.toDataURL();
	img.setAttribute('style','z-index:404;');
	document.body.appendChild(img);
};
const listMapParents=window.listMapParents=mapId=>{
	const rtv=[],s=new Set(); if(mapId===undefined) mapId=$gameMap.mapId();
	while($dataMapInfos[mapId]&&!s.has(mapId)){
		s.add(mapId);
		rtv.push(mapId);
		mapId=$dataMapInfos[mapId].parentId;
	}
	return rtv.reverse();
};
const getUrlParamVal=window.getUrlParamVal=key=>{
	const h0=ImageManager.splitUrlQueryHash(location.href);
	const ht=ImageManager.splitUrlQueryHash(getTopFrameWindow().location.href);
	let r;
	if(r===undefined) r=ImageManager._parseQs_uqh(ht,2)[key];
	if(r===undefined) r=ImageManager._parseQs_uqh(ht,1)[key];
	if(r===undefined) r=ImageManager._parseQs_uqh(h0,2)[key];
	if(r===undefined) r=ImageManager._parseQs_uqh(h0,1)[key];
	return r;
};

})();


})();

const undef=undefined,none=()=>{},filterArg0=x=>x,isNum=n=>!isNaN(n),cmpFunc_num=(a,b)=>a-b;
