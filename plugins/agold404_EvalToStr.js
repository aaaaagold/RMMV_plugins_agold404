"use strict";
/*:
 * @plugindesc eval a piece of js code to string in Window_Base.drawTextEx
 * @author agold404
 * @help \EVALTOSTR:"..." where the code is executed BEFORE showing the text
 * \EVALJSCODE:"..." where the code is executed WHEN showing the text and is ONLY affected in Window_Message
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Window_Base.prototype).add('drawTextEx',function f(text, x, y, _3, _4, out_textState){
	arguments[0]=(arguments[0]+'').replace(f.tbl[0],f.tbl[1].bind(this));
	return f.ori.apply(this,arguments);
},t=[
/(?<!\\)((\\\\)*)\\EVALTOSTR:("((\\\\)*\\"|[^"\\]|\\[^"])*")/g,
function(){ return arguments[1]+eval(JSON.parse(arguments[3])); },
]);

// message didn't use drawText nor drawTextEx
new cfc(Game_Message.prototype).add('add',function f(txt){
	arguments[0]=(arguments[0]+'').replace(f.tbl[0],f.tbl[1].bind(this));
	return f.ori.apply(this,arguments);
},t);


new cfc(Window_Base.prototype).add('convertEscapeCharacters',function f(text){
	if(arguments&&arguments[0]) arguments[0]=this.convertEscapeCharacters_evalJsCode.apply(this,arguments);
	return f.ori.apply(this,arguments);
},undefined,true).addBase('convertEscapeCharacters_evalJsCode',function f(txt,strt,ende){
	// \EVALJSCODE:" ... "
	if(!txt) return;
	if(strt===undefined) strt=0;
	if(ende===undefined) ende=txt.length-0||0;
	let arr=this._evalJsCode_infos; if(!arr) arr=this._evalJsCode_infos=[];
	const state={strt:strt,ende:ende,txt:txt,out:"",_infos:arr,};
	for(let x=strt;x<ende;){ x=this.convertEscapeCharacters_evalJsCode1(state); state.strt=x; }
	return state.out;
}).addBase('convertEscapeCharacters_evalJsCode1',function f(state){
	const idx=state.txt.indexOf(f.tbl[0],state.strt);
	if(!(idx>=0)){ state.out+=state.txt.slice(state.strt,state.ende); return state.ende; }
	let err=false;
	let x=idx+f.tbl[0].length;
	
	const res=getCStyleStringStartAndEndFromString(state.txt,x,state.ende);
	if(!(0<res.end)) err=true;
	
	const endIdx=res.end;
	
	if(err){
		state.out+=state.txt.slice(state.strt,idx+1);
		console.warn("evalJsCode err:",state);
		return idx+1; // +1 for not parsing again
	}
	state.out+=state.txt.slice(state.strt,idx);
	const jscode=JSON.parse(state.txt.slice(res.start,res.end));
	state.out+=f.tbl[1];
	const id=state._infos.length;
	state.out+='[';
	state.out+=id;
	state.out+=']';
	state._infos.push(jscode);
	return endIdx;
},t=[
"\\EVALJSCODE:", // 0: prefix to trigger
"\\EVALJSCODEARR", // 1: raplaced prefix: \\EVALJSCODEARR[infoIdx]
]).addBase('_processEscapeCharacter_evalJsCode',function f(id,infos,textState){
	return EVAL.call(this,infos[id]);
}).addBase('_processEscapeCharacter_evalJsCode_condOk',function f(infos){
	const sm=SceneManager;
	const sc=sm&&sm._scene;
	const trgt=sc&&sc._messageWindow;
	return infos&&trgt===this;
});

Window_Message.escapeFunction_set(t[1].slice(1),function(code,textState){
	const param=this.obtainEscapeParam(textState);
	const infos=this._evalJsCode_infos;
	if(!this._processEscapeCharacter_evalJsCode_condOk(infos)) return;
	this._processEscapeCharacter_evalJsCode(param,infos,textState);
});
Window_Base.escapeFunction_set(t[1].slice(1),function(code,textState){
	const param=this.obtainEscapeParam(textState);
});


})();
