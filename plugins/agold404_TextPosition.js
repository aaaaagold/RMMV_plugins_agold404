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


new cfc(Window_Base.prototype).
add('processEscapeCharacter',function f(code,textState){
	const m=code.match(f.tbl[0]);
	if(m){
		textState._textPosition_match=m;
		return this.processEscapeCharacter_textPosition.apply(this,arguments);
	}
	return f.ori.apply(this,arguments);
},[
/^TXT(LEFT|CENTER|RIGHT|(A|D)POS)$/, // TXTLEFT TXTCENTER TXTRIGHT TXTAPOS
]).
addBase('processEscapeCharacter_textPosition',function f(code,textState){
	const m=textState._textPosition_match; if(m==null) return;
	delete textState._textPosition_match;
	// parse new
	if(textState.text[textState.index]!==":") return console.warn(code,f.tbl[1][0]);
	const strt=textState.index+1;
	const strPos=getCStyleStringStartAndEndFromString(textState.text,strt);
	if(strPos.start!==strt) return console.warn(code,f.tbl[1][0]);
	const txt=JSON.parse(textState.text.slice(strPos.start,strPos.end));
	const func=f.tbl[0][code];
	//const br=textState.boundaryRight;
	//const isMeasureOnly=textState.isMeasureOnly;
	//if(isMeasureOnly) textState.boundaryRight=Math.max(br||0,textState.right,this.contentsWidth()); // incorrect
	const res=func&&func.call(this,this.duplicateTextState(textState,{
		text:txt,
		index:0,
	}),textState);
	//if(isMeasureOnly) textState.boundaryRight=br; // incorrect
	textState.index=strPos.end;
	return res||this.processSubtext(txt,textState,({prefix:"\\"+code+":",suffix:"",arrange:JSON.stringify,}));
},[
{
TXTLEFT:function(tmpState,textState){
	textState.x=useDefaultIfIsNaN(textState.boundaryLeft,0);
},
TXTCENTER:function(tmpState,textState){
	const left=useDefaultIfIsNaN(textState.boundaryLeft,0);
	const right=useDefaultIfIsNaN(textState.boundaryRight,Math.max(this.contentsWidth(),0));
	textState.x=(right-this.measure_drawTextEx(
		tmpState.text,
		tmpState.x,tmpState.y,
		undefined,undefined,
		tmpState
	)+left)/2;
},
TXTRIGHT:function(tmpState,textState){
	const right=useDefaultIfIsNaN(textState.boundaryRight,Math.max(this.contentsWidth(),0));
	textState.x=(right-this.measure_drawTextEx(
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
	const arr=[]; for(let x=2;x--;) arr[x]=isNaN(pos[x])?"z":pos[x];
	return !textState.isMeasureOnly&&"\\TXTAPOS:"+JSON.stringify(JSON.stringify(arr));
},
TXTDPOS:function(tmpState,textState){
	const pos=EVAL.call(this,tmpState.text); if(!pos) return;
	if(!isNaN(pos[0]-=0)) textState.x+=pos[0];
	if(!isNaN(pos[1]-=0)) textState.y+=pos[1];
	const arr=[]; for(let x=2;x--;) arr[x]=isNaN(pos[x])?"z":pos[x];
	return !textState.isMeasureOnly&&"\\TXTDPOS:"+JSON.stringify(JSON.stringify(arr));
},
}, // 0: functionalities
[
" should be followed by an colon(:), then a double quote (\"), and ends with a double quote (\")", // 1-0: warn 
"error: TextPosition: not support for nested TextPosition", // 1-1: err
], // 1: err msg
]).
getP;

})();
