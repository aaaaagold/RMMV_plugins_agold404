"use strict";
/*:
 * @plugindesc eval a piece of js code to string in Window_Base.drawTextEx
 * @author agold404
 * @help \EVALTOSTR:"..." where the code is executed when showing the text and is TRANSFORM to eval()-ed text
 * \EVALJSCODE:"..." where the code is executed when showing the text and is ONLY affected in Window_Message
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;


Window_Base.
escapeFunction_set('EVALTOSTR',function f(code,textState){
	if(textState.text[textState.index]!==":") return console.warn(code,f.tbl[1][0]);
	++textState.index;
	this.processSubtext(
		EVAL.call(this,this.processCStyleStringContent(textState)),
		textState,
	);
}).
escapeFunction_set('EVALJSCODE',function f(code,textState){
	; // do nothing
}).
getP;

Window_Message.
escapeFunction_set('EVALJSCODE',function f(code,textState){
	if(textState.text[textState.index]!==":") return console.warn(code,f.tbl[1][0]);
	++textState.index;
	EVAL.call(this,this.processCStyleStringContent(textState));
}).
getP;


})();
