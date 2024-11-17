"use strict";
/*:
 * @plugindesc 立繪
 * @author agold404
 * 
 * 
 * @help \PICBEHIND[左|右|換邊,"pictures開始的圖路徑不含附檔名"]
 * 
 * $gameSystem.messageWithPictureBehind_firstLoc_set(L|R);
 * $gameSystem.messageWithPictureBehind_offsetY_set(offsetY);
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Window_Base.prototype).add('convertEscapeCharacters',function f(text){
	if(arguments&&arguments[0]) arguments[0]=this.convertEscapeCharacters_withPictureBehind.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).addBase('convertEscapeCharacters_withPictureBehind',function f(txt,strt,ende){
	// \PICBEHIND[左|右|換邊,"pictures開始的圖路徑不含附檔名"]
	if(!txt) return;
	if(strt===undefined) strt=0;
	if(ende===undefined) ende=txt.length-0||0;
	let arr=this._withPictureBehind_infos; if(!arr) arr=this._withPictureBehind_infos=[];
	const state={strt:strt,ende:ende,txt:txt,out:"",_infos:arr,};
	for(let x=strt;x<ende;){ x=this.convertEscapeCharacters_withPictureBehind1(state); state.strt=x; }
	return state.out;
}).addBase('convertEscapeCharacters_withPictureBehind1',function f(state){
	const idx=state.txt.indexOf(f.tbl[0],state.strt);
	if(!(idx>=0)){ state.out+=state.txt.slice(state.strt,state.ende); return state.ende; }
	let err=false;
	let op;
	let x=idx+f.tbl[0].length;
	for(let t;x<state.ende;){
		if(t=state.txt[x].match(f.tbl[1])) x+=t[0].length;
		else{ const m=state.txt[x].match(f.tbl[2]); if(m){
			op=m[0];
			x+=m[0].length;
			while( x<state.ende && (t=state.txt[x].match(f.tbl[1])) ) x+=t[0].length;
			if(t=state.txt[x].match(f.tbl[3])) x+=t[0].length;
			else err=true;
			break;
		}else{ err=true; break; } }
	}
	if(!op) err=true;
	
	const res=getCStyleStringStartAndEndFromString(state.txt,x,state.ende);
	if(!(0<res.end)) err=true;
	
	const endSymbolIdx=state.txt.indexOf(f.tbl[4],res.end);
	if(!(0<endSymbolIdx)) err=true;
	
	if(err){
		state.out+=state.txt.slice(state.strt,idx+1);
		console.warn("withPictureBehind err:",state);
		return idx+1;
	}
	const path=JSON.parse(state.txt.slice(res.start,res.end));
	state.out+=state.txt.slice(state.strt,idx);
	state.out+=f.tbl[5];
	state.out+=op;
	const id=state._infos.length;
	state.out+='[';
	state.out+=id;
	state.out+=']';
	state._infos.push({id:id,op:op,path:path,});
	return endSymbolIdx+1;
},t=[
"\\PICBEHIND[", // 0: prefix to trigger
/[ ]/, // 1: omitted CHRs
/[LRXC]/, // 2: op CHRs
/[,]/, // 3: sep1 CHRs
']', // 4: end
"\\PICBEHIND", // 5: raplaced prefix: \\PICBEHIND{op}[infoIdx]
]).add('processEscapeCharacter',function f(code, textState){
	const m=code.match(f.tbl[0]);
	if(m) return this.processEscapeCharacter_withPictureBehind(code,textState,m);
	return f.ori.apply(this,arguments);
},[
new RegExp(t[5].slice(1)+"("+t[2].toString().slice(1,-1)+")"), // 0: matched
]).addBase('processEscapeCharacter_withPictureBehind',function f(code,textState,m){
	const param=this.obtainEscapeParam(textState);
	const infos=this._withPictureBehind_infos; if(!infos) return;
	this._processEscapeCharacter_withPictureBehind(param,infos,textState,m);
}).addBase('_processEscapeCharacter_withPictureBehind',function f(id,infos,textState,m){
	const funcs=f.tbl[0][m[1]==="X"?f.tbl[1][this._withPictureBehind_lastLoc]||$gameSystem.messageWithPictureBehind_firstLoc_get()||f.tbl[1]._default:m[1]];
	const func=funcs&&funcs.func; if(func) func(this,infos,id,textState,funcs.load);
},t=[
{
L:{
	func:(self,infos,id,textState,bmpListener)=>{
		let sp=self._withPictureBehind_picL; if(!sp){
			self.addChildAt(sp=self._withPictureBehind_picL=new Sprite(),0);
			sp.position.set(0,self.height+$gameSystem.messageWithPictureBehind_offsetY_get());
			sp.anchor.set(0,1);
		}
		self._withPictureBehind_lastLoc="L";
		self.processEscapeCharacter_withPictureBehind_common(sp,infos[id],bmpListener);
	},
},
R:{
	func:(self,infos,id,textState,bmpListener)=>{
		let sp=self._withPictureBehind_picR; if(!sp){
			self.addChildAt(sp=self._withPictureBehind_picR=new Sprite(),0);
			sp.position.set(self.width,self.height+$gameSystem.messageWithPictureBehind_offsetY_get());
			sp.anchor.set(1,1);
		}
		self._withPictureBehind_lastLoc="R";
		self.processEscapeCharacter_withPictureBehind_common(sp,infos[id],bmpListener);
	},
},
C:{
	func:self=>{
		const spL=self._withPictureBehind_picL; if(spL) spL.visible=false;
		const spR=self._withPictureBehind_picR; if(spR) spR.visible=false;
	},
},
}, // 0: call picture funcs
{L:"R",R:"L",_default:"L",}, // 1: L->R ; R->L
]).add('processEscapeCharacter_withPictureBehind_common',function f(sp,info,bmpListener){
	sp.visible=true;
	const bmp=sp.bitmap=ImageManager.loadPicture(info.path);
	if(bmpListener) bmp.addLoadListener(bmpListener);
}).addBase('messageWithPictureBehind_clear',function f(){
	f.tbl[0].C.func(this);
},t).add('startMessage',function f(){
	this.messageWithPictureBehind_clear();
	return f.ori.apply(this,arguments);
}).add('close',function f(){
	this.messageWithPictureBehind_clear();
	return f.ori.apply(this,arguments);
});

new cfc(Game_System.prototype).addBase('messageWithPictureBehind_firstLoc_get',function f(){
	if(!this._messageWithPictureBehind_firstLoc) this._messageWithPictureBehind_firstLoc="L";
	return this._messageWithPictureBehind_firstLoc;
}).addBase('messageWithPictureBehind_firstLoc_set',function f(val){
	this._messageWithPictureBehind_firstLoc=val;
	return this;
}).addBase('messageWithPictureBehind_offsetY_get',function f(){
	return this._messageWithPictureBehind_offsetY||0;
}).addBase('messageWithPictureBehind_offsetY_set',function f(offsetY){
	this._messageWithPictureBehind_offsetY=offsetY;
	return this;
});

})();
