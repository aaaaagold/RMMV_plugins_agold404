"use strict";
/*:
 * @plugindesc text position
 * @author agold404
 * 
 * @help Align left / center / right, or even specifying the xy offset.
 * 
 * Format:
 *   align left:   \TXTLEFT:" your text here "
 *   align center: \TXTCENTER:" your text here "
 *   align right:  \TXTRIGHT:" your text here "
 * For inputting a double qoute (") in aligned text, use \"
 * The text is NOT parsed from JSON.parse()
 * The text is still the text, however, printed from different position.
 * 
 * Format:
 *   specify an absolute (in the window) offset: \TXTAPOS:"eval()-ed text to get an array of length=2"
 *   specify an difference offset from current position: \TXTDPOS:"eval()-ed text to get an array of length=2" 
 * The value is parsed from eval().
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_TextPosition";
const params=PluginManager.parameters(pluginName);

new cfc(Window_Base.prototype).add('processEscapeCharacter',function f(code,textState){
	const m=code.match(f.tbl[0]);
	if(m) return this.processEscapeCharacter_textPosition(code,textState,m);
	return f.ori.apply(this,arguments);
},[
/^TXT(LEFT|CENTER|RIGHT|(A|D)POS)$/, // TXTLEFT TXTCENTER TXTRIGHT TXTAPOS
]).addBase('processEscapeCharacter_textPosition',function f(code,textState,m){
	// parse new
	if(textState.text[textState.index]!==":") return console.warn(code,f.tbl[1][0]);
	const strt=textState.index+1;
	const strPos=getCStyleStringStartAndEndFromString(textState.text,strt);
	if(strPos.start!==strt) return console.warn(code,f.tbl[1][0]);
	const tailPos=strPos.end-1;
	if(tailPos>=this.textPosition_tailPos_getLastPos()) throw new Error(f.tbl[1][1]);
	this.textPosition_tailPos_push(tailPos);
	textState.index=strPos.start+1;
	const func=f.tbl[0][code];
	if(func) return func.call(this,this.duplicateTextState(textState,{
		text:textState.text.slice(strPos.start+1,strPos.end-1),
		index:0,
	}),textState);
},[
{
TXTLEFT:function(tmpState,textState){
	textState.x=0;
},
TXTCENTER:function(tmpState,textState){
	textState.x=(this.contentsWidth()-this.measure_drawTextEx(
		tmpState.text,
		tmpState.x,tmpState.y,
		undefined,undefined,
		tmpState
	))/2;
},
TXTRIGHT:function(tmpState,textState){
	textState.x=(this.contentsWidth()-this.measure_drawTextEx(
		tmpState.text,
		tmpState.x,tmpState.y,
		undefined,undefined,
		tmpState
	))-1;
},
TXTAPOS:function(tmpState,textState){
	const pos=EVAL.call(this,tmpState.text); if(!pos) return;
	if(!isNaN(pos[0]-=0)) textState.x=pos[0];
	if(!isNaN(pos[1]-=0)) textState.y=pos[1];
	textState.index+=tmpState.text.length+1;
},
TXTDPOS:function(tmpState,textState){
	const pos=EVAL.call(this,tmpState.text); if(!pos) return;
	if(!isNaN(pos[0]-=0)) textState.x+=pos[0];
	if(!isNaN(pos[1]-=0)) textState.y+=pos[1];
	textState.index+=tmpState.text.length+1;
},
}, // 0: functionalities
[
" should be followed by an colon(:), then a double quote (\"), and ends with a double quote (\")", // 1-0: warn 
"error: TextPosition: not support for nested TextPosition", // 1-1: err
], // 1: err msg
]).add('processCharacter',function f(textState){
	this.processCharacter_textPosition_consumeTailPos(textState);
	return textState.index<textState.text.length&&f.ori.apply(this,arguments);
}).addBase('processCharacter_textPosition_consumeTailPos',function f(textState){
	while(this.textPosition_tailPos_getLastPos()===textState.index){
		++textState.index;
		this.textPosition_tailPos_pop();
	}
}).addBase('textPosition_tailPos_getCont',function f(){
	let rtv=this._textPosition_tailPos; if(!rtv) (rtv=this._textPosition_tailPos=[])._widths={};
	return rtv;
}).addBase('textPosition_tailPos_getLastPos',function f(){
	return this.textPosition_tailPos_getCont().back;
}).addBase('textPosition_tailPos_getLastWidth',function f(){
	const cont=this.textPosition_tailPos_getCont();
	return cont._widths[cont.back];
}).addBase('textPosition_tailPos_push',function f(idx,width){
	const cont=this.textPosition_tailPos_getCont();
	if(idx in cont._widths) throw new Error(f.tbl[0]);
	idx-=0; if(isNaN(idx)) throw new Error(f.tbl[1]);
	cont._widths[idx]=width;
	cont.push(idx);
	return this;
},[
"error: TextPosition: repeated index", // 0: 
"error: TextPosition: index should be a Number", // 1: 
]).addBase('textPosition_tailPos_pop',function f(){
	const cont=this.textPosition_tailPos_getCont();
	const rtv=cont.pop();
	delete cont._widths[rtv];
	return rtv;
});

})();
