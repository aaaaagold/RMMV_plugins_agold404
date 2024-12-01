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
const cf=(p,k,f,tbl,is_putDeepest,is_notUsingOri,moduleName)=>{
	const pre=p.__proto__&&p.__proto__.constructor.prototype;
	if(is_putDeepest && p[k] && p[k].ori && !(pre&&pre[k]===p[k])){
		let fp=p[k],fc=p[k].ori,fs=new Set();
		do{
			if(fs.has(fc)) throw new Error('f.ori repeated');
			fs.add(fc);
			if(fc.ori && !(pre&&pre[k]===fc)){
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
	//if(f._funcName && f!==none) console.warn("already having '_funcName' proterty for",f);
	f._funcName=k;
	f._moduleName=moduleName;
	f._super=pre;
	return p;
};
const a=function cfc(p){
	if(this===window || (typeof globalThis!=='undefined'&&this===globalThis)) throw new Error('call a constructor without new');
	this._p=p;
}
const p=a.prototype;
p.constructor=a;
p.add=function(key,f,t,d,u,m){
	cf(this._p,key,f,t,d,u,m);
	return this;
};
p.addBase=function(key,f,t){
	cf(this._p,key,f,t,true,true);
	return this;
};
p.getP=function(){ return this._p; };
window[a.name]=a;
}


(()=>{ // lib


// Array
(()=>{ const p=Array.prototype;
Object.defineProperties(p,{
back:{
	set:function(rhs){ const len=this.length; return len?(this[len-1]=rhs):undefined; },
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
p.lower_bound=function(val){
	let l=0,h=this.length;
	while(l+1<h){
		const m=(l+h)>>>1;
		if(this[m]<val) h=m;
		else l=m;
	}
	return l;
};
p.upper_bound=function(val){
	return this.length?this.lower_bound(val)+1:0;
};
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
new cfc(p).addBase('uniqueSort',function f(cmpFn=undefined){
	const arr=this.slice();
	this.uniqueClear();
	arr.sort.apply(arr,arguments).forEach(f.tbl[0],this);
	return this;
},[
function(x){ this.uniquePush(x); },
]).add('sort',function f(cmpFn=undefined){
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
p.kvGetKey=function(idx){
	return this[idx][1];
};
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


// Queue
(()=>{ let k,r,t;

{ const w=window; if(!w.Queue){
	w.Queue=function(){ this.initialize.apply(this,arguments); };
	const p=w.Queue.prototype;
	p.constructor=w.Queue;
	p.initialize=function(init_size_or_array,kargs){
		if(init_size_or_array instanceof Array){
			this._data=init_size_or_array;
			this._initSize=null;
			const len=init_size_or_array.length;
			let v=len+1;
			v |= v >>> 1;
			v |= v >>> 2;
			v |= v >>> 4;
			v |= v >>> 8;
			v |= v >>> 16;
			this.clear(v+1,kargs);
			this._ende=this._len=len;
		}else{
			this._data=[];
			this.clear(this._initSize=init_size_or_array,kargs);
		}
	};
	p.objcnt=function(){return this._len;};
	p.arrsize=function(){return this._data.length;};
	p._lastIdx=function(){
		let tmp=this._ende-1;
		return (tmp<0)*this._data.length+tmp;
	};
	p.clear=function(init_size,kargs){
		if(init_size===undefined) init_size=this._initSize;
		if(!(init_size>=8)) init_size=8;
		this._ende=this._strt=0;
		this._len=0;
		this._data.length=init_size;
	};
	Object.defineProperties(p,{
		length: {
			get:function(){
				return this._len;
			},
			set:function(rhs){
				if(rhs) throw new Error('\'Queue\' not support setting \'length\' to non-zero');
				else this.clear();
			},
		configurable: false},
		front: {
			get:function(){
				return this._ende===this._strt?undefined:this._data[this._strt];
			},
			set:function(rhs){
				return this._ende===this._strt?this._data[this.push(rhs)]:(this._data[this._strt]=rhs);
			},
		configurable: false},
		0: {
			get:function(){ return this.front; },
			set:function(rhs){ return this.front=rhs; },
		configurable: false},
		back: {
			get:function(){
				return this._ende===this._strt?undefined:this._data[this._lastIdx()]; },
			set:function(rhs){
				return this._ende===this._strt?this._data[this.push(rhs)]:(this._data[this._lastIdx()]=rhs);
			},
		configurable: false}
	});
	p._enlargeIfNeeded=function(padFrontN){
		padFrontN|=0;
		const minLen=this._len+padFrontN+2;
		if(this._data.length<minLen){
			const currLen=this._data.length;
			this._data.length<<=1; // 'currLen' same as delta
			if(this._data.length<minLen) this._data.length=minLen.ceilPow2();
			this._strt-=padFrontN;
			this._strt+=(this._strt<0)*this._data.length;
			if(this._ende<this._strt){
				if(currLen-this._strt<this._ende){
					for(let x=this._strt;x!==currLen;++x) this._data[currLen+x]=this._data[x];
					this._strt+=currLen;
				}else{
					for(let x=0;x!==this._ende;++x) this._data[currLen+x]=this._data[x];
					this._ende+=currLen;
				}
			}
			this._strt+=padFrontN;
			this._strt-=(this._strt>=this._data.length)*this._data.length;
		}
	};
	p._addUintBracketProperty=function(){
		if(!Object.getOwnPropertyDescriptor(p,this.length)){
			const n=this.length;
			Object.defineProperty(p,n,{
				get:function(){ return this.getnth(n); },
				set:function(rhs){ return this.setnth(n,rhs); },
			});
		}
	};
	r=p.push=function(obj){
		this._addUintBracketProperty();
		this._enlargeIfNeeded();
		++this._len;
		let rtv=0;
		this._data[rtv=this._ende++]=obj;
		this._ende-=(this._ende>=this._data.length)*this._data.length;
		return rtv;
	};
	p.push_back=r;
	p.push_front=function(obj){
		this._addUintBracketProperty();
		this._enlargeIfNeeded(1);
		++this._len;
		--this._strt;
		const rtv=this._strt+=(this._strt<0)*this._data.length;
		this._data[rtv]=obj;
		return rtv;
	};
	r=w.Queue.prototype.pop=function(){
		if(this._ende===this._strt) return false;
		if(0===--this._len){ this.clear(); return true; }
		++this._strt;
		this._strt-=(this._strt>=this._data.length)*this._data.length;
		return true;
	};
	p.pop_front=r;
	p.shift=function f(){
		const rtv=this[0];
		this.pop_front();
		return rtv;
	};
	p.pop_back=function(){
		if(this._ende===this._strt) return false;
		if(0===--this._len){ this.clear(); return true; }
		--this._ende;
		this._ende+=(this._ende<0)*this._data.length;
		return true;
	};
	p._toValidIdx=function(n){
		n=Number(n); if(isNaN(n)||n>=this._len||this._len<-n) return undef;
		if(n<0){ n+=this._ende; n+=(n<0)*this._data.length; }
		else{ n+=this._strt; n-=(n>=this._data.length)*this._data.length; }
		return n;
	};
	p.getnth=function(n){ return this._data[this._toValidIdx(n)]; }; // 0-base
	p.setnth=function(n,rhs){
		let idx=this._toValidIdx(n); if(idx===undef) return undefined;
		this._data[idx]=rhs;
		return true;
	}; // 0-base
	p.forEach=function(func,asThis){
		const self=arguments.length<2?null:asThis;
		if(this._ende>=this._strt) this._data.slice(this._strt,this._ende).forEach(func,self);
		else{
			const p1=this._data.slice(this._strt),p2=this._data.slice(0,this._ende);
			p1.forEach(func,self);
			p2.forEach(func,self);
		}
	};
} }

})(); // Queue


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
		this._float(idx);
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
		_searchTbl: {
			get:function(){
				if(!this.__searchTbl||this.__searchTbl.constructor!==Map) this._buildSearchTbl(this.__searchTbl=new Map());
				return this.__searchTbl;
			},
			set:function(rhs){return this.__searchTbl=rhs;},
		configurable: true},
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
		while(idx!==1 && idx<arr.length && lt(arr[idx>>1],arr[idx])){
			const st=this._searchTbl,idx0=idx;
			idx>>=1;
			const tmp=arr[idx]; arr[idx]=arr[idx0]; arr[idx0]=tmp;
			st.set(arr[idx0],idx0);
			st.set(arr[idx ],idx );
		}
		return idx;
	};
	w.Heap.prototype._buildSearchTbl=function(m){
		m=m||this._searchTbl;
		const arr=this._data; for(let x=arr.length;--x;) m.set(arr[x],x);
	};
	w.Heap.prototype.makeHeap=function(){
		const arr=this._data;
		this._buildSearchTbl();
		for(let x=arr.length;--x;) this._sink(x);
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

})(); // Heap


// LruCache
(()=>{ let k,r,t;

const a=class LruCache{
static supportedMaxItemCount=(1<<23)-1;
constructor(maxItemCount,maxItemSize,popCallback){
	// popCallback( item=info.data , info=info ): optional, as destructor if needed
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
	this._popCallback=(popCallback instanceof Function)?popCallback:undefined;
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
	if(this._popCallback) this._popCallback(info.data,info);
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

})(); // LruCache


// OccupiedTable
(()=>{ let k,r,t;

const a=class OccupiedTable{
constructor(width,height,offsetX,offsetY){
	this._width=width|=0;
	this._height=height|=0;
	if(!width||!height) throw new Error('width and height for '+this.constructor.name+' should be non-zero');
	this._offsetX=offsetX|=0;
	this._offsetY=offsetY|=0;
	
	this.clearAll();
}
clearAll(){
	for(let y=0,arr=this._tbl=[],ys=this._height;y!==ys;++y) arr.push([]);
	this._obj2coords=new Map(); // inner coord
}
_getVec(x,y){
	let rtv=this._tbl[y][x]; if(!rtv) rtv=this._tbl[y][x]=[];
	return rtv;
}
_getVec_rawXy(rx,ry){
	return this._getVec(rx-this._offsetX,ry-this._offsetY);
}
_getCoords(obj){
	let coords=this._obj2coords.get(obj); if(!coords) this._obj2coords.set(obj,coords=[]);
	return coords;
}
_getBound_rawXy(obj,r){
	if(r===undefined) r=Math.abs(obj.r);
	const x0=Math.max(Math.floor(obj.x-r)-this._offsetX,0),y0=Math.max(Math.floor(obj.y-r)-this._offsetY,0),xL=Math.min(Math.ceil(obj.x+r)-this._offsetX,this._width-1),yL=Math.min(Math.ceil(obj.y+r)-this._offsetY,this._height-1);
	return [x0,y0,xL,yL];
}
_chooseNearest_2(obj,x,y){
	const arr=this._getVec(x,y);
	const xs=arr.length; if(!xs) return;
	let tmp=arr[0],d2=xyDist2(obj,tmp); for(let x=1;x!==xs;++x){ let tmpD2=xyDist2(obj,arr[x]); if(tmpD2<d2){ d2=tmpD2; tmp=arr[x]; } }
	return tmp;
}
clear(obj){
	const coords=this._getCoords(obj);
	for(let i=0,sz=coords.length;i!==sz;++i) this._getVec(coords[i][0],coords[i][1]).uniquePop(obj);
	coords.length=0;
	return coords;
}
clearBound(obj){
	const r=Math.abs(obj.r); if(!r) return rtv;
	const bound=this._getBound_rawXy(obj,r);
	const x0=bound[0],y0=bound[1],xL=bound[2],yL=bound[3];
	for(let y=y0;y<=yL;++y){ for(let x=x0;x<=xL;++x){
		this._getVec(x,y).uniqueClear();
	} }
}
add(obj){
	const coords=this.clear(obj);
	const r=Math.abs(obj.r); if(!r) return;
	const bound=this._getBound_rawXy(obj,r);
	const x0=bound[0],y0=bound[1],xL=bound[2],yL=bound[3];
	for(let y=y0;y<=yL;++y){ for(let x=x0;x<=xL;++x){
		coords.push([x,y]);
		this._getVec(x,y).uniquePush(obj);
	} }
}
investigate(obj,nearestOnly){
	const rtv=[];
	const r=Math.abs(obj.r)||0;
	const bound=this._getBound_rawXy(obj,r);
	const x0=bound[0],y0=bound[1],xL=bound[2],yL=bound[3];
	if(xL<x0||yL<y0) return rtv;
	if(nearestOnly&=3){
		const yc=(y0+yL)/2,xc=(x0+xL)/2;
		const x00=Math.floor(xc),y00=Math.floor(yc),x0L=Math.ceil(xc),y0L=Math.ceil(yc);
		for(let y=y00;y<=y0L;++y){ for(let x=x00;x<=x0L;++x){
			const tmp=this._chooseNearest_2(obj,x,y); if(tmp) rtv.uniquePush(tmp);
		} }
		let found=rtv.length;
		for(let s=1,z=Math.ceil(r);s<=z;++s){
			const xr0=Math.max(x0,x00-s),xrL=Math.min(xL,x0L+s),yr0=Math.max(y0,y00-s),yrL=Math.min(yL,y0L+s);
			for(let x=xr0,y=yr0;x!==xrL;++x){
				const tmp=this._chooseNearest_2(obj,x,y); if(tmp) rtv.uniquePush(tmp);
			}
			for(let x=xrL,y=yr0;y!==yrL;++y){
				const tmp=this._chooseNearest_2(obj,x,y); if(tmp) rtv.uniquePush(tmp);
			}
			for(let y=yrL,x=xrL;x!==xr0;--x){
				const tmp=this._chooseNearest_2(obj,x,y); if(tmp) rtv.uniquePush(tmp);
			}
			for(let x=xr0,y=yrL;y!==yr0;--y){
				const tmp=this._chooseNearest_2(obj,x,y); if(tmp) rtv.uniquePush(tmp);
			}
			if(found) return rtv;
			found=rtv.length;
		}
	}else{
		for(let y=y0;y<=yL;++y){ for(let x=x0;x<=xL;++x){
			for(let i=0,arr=this._getVec(x,y),sz=arr.length;i!==sz;++i) rtv.uniquePush(arr[i]);
		} }
	}
	return rtv;
}
delete(obj){
	this.clear(obj);
	this._obj2coords.delete(obj);
}
};
window[a.name]=a;

})(); // OccupiedTable


// extend Set
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
})(); // extend Set


// shorthand HTMLElement
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
p.ra=function(a){ this.removeAttribute(a); return this; };
p.ga=p.getAttribute;
p.sa=function(a,v){ this.setAttribute(a,v); return this; };
p.ae=function(t,f,o){ this.addEventListener.apply(this,arguments); return this; };
p.re=function(t,f,o){ this.removeEventListener.apply(this,arguments); return this; };
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
p.mirror_h=function(){
	const rtv=document.ce('canvas'); rtv.width=this.width; rtv.height=this.height;
	const ctx=rtv.getContext('2d');
	ctx.translate(this.width,0);
	ctx.scale(-1,1);
	ctx.drawImage(this,0,0);
	return rtv;
};
p.mirror_v=function(){
	const rtv=document.ce('canvas'); rtv.width=this.width; rtv.height=this.height;
	const ctx=rtv.getContext('2d');
	ctx.translate(0,this.height);
	ctx.scale(1,-1);
	ctx.drawImage(this,0,0);
	return rtv;
};
p.scale=function(r,y){
	// return another canvas
	if(isNaN(r)) r=1;
	if(isNaN(y)) y=r;
	let src=this;
	if(r<0){ r=-r; src=this.mirror_h(); }
	if(y<0){ y=-y; src=this.mirror_v(); }
	const w=this.width , h=this.height;
	return src.ptcp(0,0,this.width,this.height,{w:Math.ceil(w*r)||1,h:Math.ceil(h*r)||1});
};
}

const xyDist1=window.xyDist1=(a,b)=>{
	let dx=a.x-b.x,dy=a.y-b.y;
	return Math.abs(dx)+Math.abs(dy);
};
const xyDist2=window.xyDist2=(a,b)=>{
	let dx=a.x-b.x,dy=a.y-b.y;
	return dx*dx+dy*dy;
};
const useDefaultIfIsNaN=window.useDefaultIfIsNaN=(n,d)=>{
	const rtv=n-0;
	return isNaN(rtv)?d:rtv;
};
const getWiderPoints=window.getWiderPoints=(pt3,width,isNormalToCoordinates,dim)=>{
	// currently only support dim===2
	width=width-0||0;
	if(!width) return pt3.slice();
	const vec1=[pt3[1][0]-pt3[0][0],pt3[1][1]-pt3[0][1],];
	const vec2=[pt3[2][0]-pt3[1][0],pt3[2][1]-pt3[1][1],];
	const A=vec1[0]*vec2[1]-vec2[0]*vec1[1];
	if(!A) return pt3.slice();
	const len1=Math.sqrt(vec1[0]*vec1[0]+vec1[1]*vec1[1]);
	const len2=Math.sqrt(vec2[0]*vec2[0]+vec2[1]*vec2[1]);
	const u1=[vec1[0]/len1*width,vec1[1]/len1*width,];
	const u2=[vec2[0]/len2*width,vec2[1]/len2*width,];
	const rtv=[
		[pt3[0][0]-u1[0],pt3[0][1]-u1[1],],
		[pt3[1][0]+u1[0]-u2[0],pt3[1][1]+u1[1]-u2[1],],
		[pt3[2][0]+u2[0],pt3[2][1]+u2[1],],
	];
	//console.log(pt3,'->',rtv);
	return rtv;
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
	let w=window;
	while(w.parent && w.parent!==w){
		try{ w.parent._w=w; }catch(e){ break; }
		w=w.parent;
	}
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
	return img;
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
const splitUrlQueryHash=window.splitUrlQueryHash=path=>{ if(!path) return ['','',''];
	const idx_sharp=path.indexOf("#");
	const rtv=idx_sharp<0?[path,'','',]:[path.slice(0,idx_sharp),'',path.slice(idx_sharp),];
	const idx_question=rtv[0].indexOf("?");
	if(idx_question>=0){
		rtv[1]=rtv[0].slice(idx_question);
		rtv[0]=rtv[0].slice(0,idx_question);
	}
	return rtv;
};
const parseQs_uqh=window.parseQs_uqh=function f(uqh,idx){
	idx=idx===undefined?1:idx;
	const rtv={};
	if(uqh&&uqh[idx]) uqh[idx].slice(1).split("&").forEach(f.tbl[0],rtv);
	return rtv;
};
parseQs_uqh.tbl=[
function(x){
	const idxe=x.indexOf('=');
	if(idxe===-1) this[x]=true;
	else this[x.slice(0,idxe)]=decodeURIComponent(x.slice(idxe+1));
}, // 0: forEach
];
const getUrlParamVal=window.getUrlParamVal=key=>{
	const h0=window.splitUrlQueryHash(location.href);
	const ht=window.splitUrlQueryHash(getTopFrameWindow().location.href);
	let r;
	if(r===undefined) r=window.parseQs_uqh(ht,2)[key];
	if(r===undefined) r=window.parseQs_uqh(ht,1)[key];
	if(r===undefined) r=window.parseQs_uqh(h0,2)[key];
	if(r===undefined) r=window.parseQs_uqh(h0,1)[key];
	return r;
};
const addUrlParamVal_qs=window.addUrlParamVal_qs=(key,val,isSetToTop)=>{
	const loc=isSetToTop?getTopFrameWindow().location:location;
	let newHref=loc.pathname;
	newHref+="?"; if(loc.search) newHref+=loc.search;
	newHref+=(loc.search&&newHref.slice(-1)!=="&"?"&":"")+key; if(val!==undefined) newHref+='='+val;
	newHref+="#"; if(loc.hash) newHref+=loc.hash;
	loc.href=newHref;
};
const addUrlParamVal_hash=window.addUrlParamVal_hash=(key,val,isSetToTop)=>{
	const loc=isSetToTop?getTopFrameWindow().location:location;
	let newHash=loc.hash;
	if(newHash&&newHash.slice(-1)!=="&") newHash+="&";
	newHash+=key; if(val!==undefined) newHash+='='+val;
	loc.hash=newHash;
};

})(); // shorthand HTMLElement


// jurl
(()=>{ let k,r,t;

window.jurl=(url, method, header, data, resType, callback, callback_all_h, callback_state4_all_t, callback_all_t, timeout_ms)=>{
	const argv=[];
	resType=resType||'';
	let xhttp=new XMLHttpRequest();
	if(0<timeout_ms) xhttp.timeout=timeout_ms;
	xhttp.onreadystatechange=function(){
		//if(callback_all_h&&callback_all_h.constructor===Function) ; // wtf
		if((typeof callback_all_h)==="function"){
			callback_all_h(this,argv);
		}
		//if(callback&&callback.constructor===Function) ; // wtf
		if((typeof callback)==="function"){
			if(this.readyState===4){
				let s=this.status.toString();
				if (s.length===3 && s.slice(0, 1)==='2'){
					callback(this.response,this,argv);
				}
				if((typeof callback_state4_all_t)==="function"){
					callback_state4_all_t(this,argv);
				}
			}
		}
		if((typeof callback_all_t)==="function"){
			callback_all_t(this,argv);
		}
	}
	;
	xhttp.open(method, url, true);
	xhttp.responseType=resType;
	if(header) for(let i in header) xhttp.setRequestHeader(i,header[i]);
	data=method === "GET" ? undefined : data;
	argv.push(url,method,header,data,);
	xhttp.send(data);
	return xhttp;
};

})(); // jurl

// getProperty
(()=>{ let k,r,t;

const getPropertyValue=window.getPropertyValue=function f(obj,key,defaultVal){
	if(obj&&(key in obj)) return obj[key];
	else return defaultVal;
};

})(); // getProperty

// math
(()=>{ let k,r,t;

// bit order
const bitRev8=window.bitRev8=function f(n){
	if(!f.tbl){ f.tbl=[]; for(let x=256;x--;){
		let idx=0,n=x; for(let i=8;i--;n>>>=1) idx=(idx<<1)|(n&1);
		f.tbl[idx]=x;
	} }
	return f.tbl[n&0xFF];
},bitRev32=window.bitRev32=n=>{
	return (window.bitRev8(n)<<24)|(window.bitRev8(n>>>8)<<16)|(window.bitRev8(n>>>16)<<8)|window.bitRev8(n>>>24);
},printHex32=window.printHex32=n=>'0x'+(n>>>0).toString(16).padStart(8,'0');

// byte to number
const bytesToInt=window.bytesToInt=(byteData,byteLen,byteOffset,isBigEndian)=>{
	// support byteLen <= 4
	byteOffset=byteOffset-0||0;
	if(byteData.buffer) byteData=new Uint8Array(byteData.buffer,byteData.byteOffset+byteOffset,byteData.byteLength-byteOffset);
	let rtv=0;
	if(isBigEndian){ for(let x=0,xs=byteLen;x<xs;++x){
		rtv=(rtv<<8)|byteData[x];
	} }else{ for(let x=byteLen;x--;){
		rtv=(rtv<<8)|byteData[x];
	} }
	return rtv;
};

// crc32
const crc32=window.crc32=function f(byteData,poly,invIn,invOut,isRf8){
	poly|=0; if(!poly||!byteData||!byteData.length) return 0;
	if(byteData.buffer) byteData=new Uint8Array(byteData.buffer,byteData.byteOffset,byteData.byteLength);
	
	if(!f.tbl) f.tbl={};
	let tbl=f.tbl[poly]; if(!tbl){ tbl=f.tbl[poly]=[]; for(let x=256,b,i;x--;){ b=x; for(i=8;i--;) b=(b&1?poly:0)^(b>>>1); tbl[x]=b; } }
	
	let rtv=invIn;
	const func=isRf8?window.bitRev8:parseInt;
	for(let x=0,xs=byteData.length;x!==xs;++x) rtv=(rtv>>>8)^tbl[((func(byteData[x]))^rtv)&0xFF];
	return rtv^invOut;
};
if(0){
//for(let x=256;x--;) console.log(x.toString(16),printHex32(bitRev8(x)));
const data=[ 
	// Offset 0x00 to 0x039 
 0x4F, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, 
 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
 /*0x54, 0x25, 0x0F, 0x37,*/0,0,0,0, 
 0x01, 0x1E, 0x01, 0x76, 0x6F, 0x72, 
 0x62, 0x69, 0x73, 0x00, 0x00, 0x00, 0x00, 0x02, 
 0x44, 0xAC, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 
 0x00, 0xFA, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 
 0xB8, 0x01, 
],poly=0x04C11DB7;
console.log(' 0  0 r r\t',printHex32( bitRev32(crc32(data, bitRev32(poly),0,0,true)) ),); // ogg, res=littleEndian
console.log('-1 -1    \t',printHex32( crc32(data, bitRev32(poly),-1,-1,) ),); // 7z
}
const mul32gf2=window.mul32gf2=function f(n1,n2,poly,revPoly){
	if(!f.zero32) f.zero32=[0|0,0|0,0|0,0|0,];
	// a number is equals to 1 when only the highest bit (i.e. bit31) is 1.
	if(revPoly) poly=window.bitRev32(poly);
	let res64_h=0,res64_l=(n2&1)?n1:0; // bit63..bit0 = -1..62
	for(let b=32;--b;){ if((n2>>>b)&1){
		res64_l^=(n1<<b);
		res64_h^=(n1>>>(32-b));
	} }
	// <<=1 ( -1..62 =output=> 0..63 )
	res64_h<<=1;
	res64_h|=res64_l>>>31;
	res64_l<<=1;
	const rtv=window.crc32(f.zero32,poly,res64_l,res64_h);
	//console.log(printHex32(n1),printHex32(n2),printHex32(res64_l),printHex32(res64_h),printHex32(rtv));
	return rtv;
};
const pow32gf2=window.pow32gf2=(b,e,poly,revPoly)=>{
	e|=0;
	if(revPoly) poly=window.bitRev32(poly);
	if(e<0) throw new Error("TODO: negtive e for pow32gf2");
	let rtv=0x80000000;
	for(;e;e>>>=1,b=window.mul32gf2(b,b,poly)) if(e&1) rtv=window.mul32gf2(rtv,b,poly);
	return rtv;
};

})(); // math

// empty
(()=>{ let k,r,t;


})(); // empty


})(); // lib

const undef=undefined,none=()=>{},filterArg0=x=>x,isNum=n=>!isNaN(n),cmpFunc_num=(a,b)=>a-b;
const re_allR=/\r/g;
const EVAL=s=>{ return eval(s); };
const PNG_HEADER=new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ]);
const PNG_CHUNK_HEADER_IHDR=new Uint8Array([0, 0, 0, 13, 73, 72, 68, 82, ]);
const PNG_16B_HEADER=new Uint8Array(16);
PNG_16B_HEADER.set(PNG_HEADER,0);
PNG_16B_HEADER.set(PNG_CHUNK_HEADER_IHDR,8);
const OGG_HEADER=new Uint8Array([79, 103, 103, 83, ]);
const OGG_VERSION_HEADER=new Uint8Array([0, ]);
const OGG_HEADERTYPE_HEADER=new Uint8Array([2, ]);
const OGG_GRANULEPOSITION_HEADER=new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, ]);
const OGG_STREAMSERIAL_HEADER=new Uint8Array([0, 0, 0, 0, ]);
const OGG_PAGESEQ_HEADER=new Uint8Array([0, 0, 0, 0, ]);
const OGG_22B_HEADER=new Uint8Array(22);
const OGG_PAGECHKSUM_PAGEOFFSET=OGG_22B_HEADER.byteLength;
const OGG_PAGECHKSUM_BYTESIZE=4;
OGG_22B_HEADER.set(OGG_HEADER,0);
OGG_22B_HEADER.set(OGG_VERSION_HEADER,4);
OGG_22B_HEADER.set(OGG_HEADERTYPE_HEADER,5);
OGG_22B_HEADER.set(OGG_GRANULEPOSITION_HEADER,6);
OGG_22B_HEADER.set(OGG_STREAMSERIAL_HEADER,14);
OGG_22B_HEADER.set(OGG_PAGESEQ_HEADER,18);
const OGG_16B_HEADER=new Uint8Array(OGG_22B_HEADER.buffer,0,16);
const CRC32_POLY_OGG=0x04C11DB7;
const CRC32_POLY_OGG_rev=bitRev32(CRC32_POLY_OGG);
const FILE_FORMATS={
ogg:{
	getPageByteSize:(arrayBuffer,byteOffset,isOmitOggs)=>{
		// get a page's size in bytes
		byteOffset=(byteOffset-0||0)|0;
		const segCountOffset=26;
		const segCountBytes=1;
		const segLenBytes=1;
		if(arrayBuffer.buffer) arrayBuffer=arrayBuffer.buffer;
		if(arrayBuffer.byteLength-byteOffset<segCountOffset+segCountBytes) return 0;
		if(!isOmitOggs&&new Uint8Array(arrayBuffer,byteOffset,4).toString()!==OGG_HEADER.toString()) return 0;
		const segCount=new Uint8Array(arrayBuffer,byteOffset+segCountOffset,segCountBytes)[0];
		const segLens=new Uint8Array(arrayBuffer,byteOffset+segCountOffset+segCountBytes,Math.min(arrayBuffer.byteLength-(byteOffset+segCountOffset+segCountBytes),segLenBytes*segCount));
		let pageBytes=segCountOffset+segCountBytes+segLenBytes*segCount;
		for(let x=0,xs=segLens.length;x!==xs;++x) pageBytes+=segLens[x];
		return pageBytes;
	},
}, // ogg
};

