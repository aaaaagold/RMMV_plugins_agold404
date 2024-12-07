"use strict";
/*:
 * @plugindesc name field
 * @author agold404
 * 
 * @help showing name field near by message window
 * \NAMEFIELD:" name "
 * name drawn is evaluated LIKE: eval('" name "')
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_StartupEval";
const params=PluginManager.parameters(pluginName);

t=[
undefined,
params, // 1: plugin params
/(?<![\\])(\\\\)*(\\NAMEFIELD:("((\\\\)*\\"|[^"\\]|\\[^"])*"))/, // 2: pattern
];

new cfc(Game_Interpreter.prototype).add('command101_text',function f(){
	const texts=$gameMessage._texts;
	const strt=texts.length;
	const rtv=f.ori.apply(this,arguments);
	$gameMessage._nameField=undefined;
	for(let x=0,xs=rtv.length;x!==xs;++x){
		const src=rtv[x];
		const m=src.match(f.tbl[2]); if(!m) continue;
		let res="";
		res+=src.slice(0,m.index+(m[1]?m[1].length:0));
		res+=src.slice(m.index+m[0].length);
		rtv[x]=texts[strt+x]=res;
		$gameMessage._nameField=EVAL.call(this,m[3]);
		break;
	}
	return rtv;
},t);

new cfc(Window_Message.prototype).add('startMessage',function f(){
	if($gameMessage._nameField!=null){
		let w=this.textWidth($gameMessage._nameField);
		if(w<Window_Base._faceWidth) w=Window_Base._faceWidth;
		const pad=((this.standardPadding()+this.textPadding())<<1)+1;
		w+=pad;
		if(this.width<w) w=this.width;
		if(!this._nameField){
			this._nameField=new Window_Help(1);
			this._nameField.y=-this._nameField.height;
			this._nameField.openness=0;
		}
		this._nameField.width=w;
		this._nameField.contents.clear();
		this._nameField.drawText($gameMessage._nameField,this.textPadding(),0,w-pad,'center');
		this._nameField.enabled=1;
		this.addChild(this._nameField);
	}else if(this._nameField) this._nameField.enabled=0;
	return f.ori.apply(this,arguments);
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_nameField();
	return rtv;
}).add('update_nameField',function f(){
	if(this._nameField){
		//this._nameField.openness=this.openness;
		if(!this._nameField.enabled||this.isClosing()||this.isClosed()) this._nameField.close();
		else if(this.isOpening()||this.isOpen()) this._nameField.open();
	}
}).add('onclosed',function f(){
	if(this._nameField) this._nameField.openness=this._nameField.enabled=0;
	return f.ori.apply(this,arguments);
});

})();
