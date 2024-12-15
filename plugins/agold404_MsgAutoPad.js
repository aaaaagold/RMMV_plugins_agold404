"use strict";
/*:
 * @plugindesc auto padding for Game_Message.prototype.allText
 * @author agold404
 * 
 * @help $gameSystem.msgAutoPad_set(msg,isFront,isEvalStr);
 * 
 * 'msg' can be:
 *   undefined
 *     this ignores the value of 'isEvalStr'
 *   String
 *     plain string if isEvalStr is false-like.
 *     sent to eval() otherwise.
 *       'text' is the original value got from '$gameMessage.allText()'
 *       'this' will be '$gameMessage'
 *       the evaluated value is added to the 'text' variable according to 'isFront'
 *       The front one will be evaluated first, then the back one.
 * 
 * 'isFront' and 'isEvalStr' is taken to if()
 * so you can concern only about their boolean value.
 * 
 * 
 * use
 * $gameSystem.msgAutoPad_get(isFront);
 * can get the current setting
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_MsgAutoPad";
const params=PluginManager.parameters(pluginName);

new cfc(Game_System.prototype).addBase('msgAutoPad_getCont',function f(){
	let rtv=this._msgAutoPad; if(!rtv) rtv=this._msgAutoPad={front:undefined,back:undefined,}; 
	return rtv;
}).addBase('msgAutoPad_get',function f(isFront){
	const cont=this.msgAutoPad_getCont();
	return isFront?cont.front:cont.back;
}).addBase('msgAutoPad_set',function f(msg,isFront,isEvalStr){
	const cont=this.msgAutoPad_getCont();
	const info=isFront?(cont.front={}):(cont.back={});
	info.msg=msg;
	info.isEvalStr=1^!isEvalStr;
	return this;
});

new cfc(Game_Message.prototype).add('allText',function f(){
	let text=f.ori.apply(this,arguments);
	const sys=$gameSystem; if(!sys) return text;
	const infoF=sys.msgAutoPad_get(true);
	const infoB=sys.msgAutoPad_get();
	{ let f;
		if(infoF){
			const res=infoF.isEvalStr?eval(infoF.msg):infoF.msg;
			text=res+text;
		}
		if(infoB){
			const res=infoB.isEvalStr?eval(infoB.msg):infoB.msg;
			text+=res;
		}
	}
	return text;
});

})();
