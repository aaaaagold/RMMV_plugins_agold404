"use strict";
/*:
 * @plugindesc eval a piece of js code to string in Window_Base.drawTextEx
 * @author agold404
 * @help \EVALTOSTR:"..."
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

})();
