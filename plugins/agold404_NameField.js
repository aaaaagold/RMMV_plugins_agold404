"use strict";
/*:
 * @plugindesc name field
 * @author agold404
 * 
 * @help showing name field near by the message window
 * 
 * format: \NAMEFIELD:"name_eval_text"
 * 
 * name drawn is evaluated LIKE: eval(JSON.parse("name_eval_text"))
 * so your input is probably like this:
 * 
 * \NAMEFIELD:"'Character Name'"
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
		$gameMessage._nameField=EVAL.call(this,JSON.parse(m[3]));
		break;
	}
	return rtv;
},t);

new cfc(Window_Message.prototype).add('startMessage_nameField',function f(){
	this.startMessage_nameField_ensureObject();
	if($gameMessage._nameField!=null){
		let w=this.textWidth($gameMessage._nameField);
		if(w<Window_Base._faceWidth) w=Window_Base._faceWidth;
		const pad=((this.standardPadding()+this.textPadding())<<1)+1;
		w+=pad;
		if(this.width<w) w=this.width;
		this._nameField.width=w;
		this._nameField.contents.clear();
		this._nameField.drawTextEx(this._nameField._currentText=$gameMessage._nameField,this.textPadding(),0,w-pad,'center');
		this._nameField.enabled=1;
	}else if(this._nameField) this._nameField.enabled=0;
}).addBase('startMessage_nameField_ensureObject',function f(){
	if(this._nameField) return;
	this._nameField=new Window_Help(1);
	this._nameField.y=-this._nameField.height;
	this._nameField.openness=0;
	this._nameField.enabled=0;
	this.addChild(this._nameField);
	return this._nameField;
}).add('startMessage',function f(){
	this.startMessage_nameField();
	return f.ori.apply(this,arguments);
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_nameField();
	return rtv;
}).add('update_nameField',function f(){
	if(this._nameField){
		this._update_nameField_syncOpenness();
		this._update_nameField_syncBg();
	}
	this.update_nameField_updateText();
}).add('_update_nameField_syncOpenness',function f(){
	//this._nameField.openness=this.openness;
	if(!this._nameField.enabled||this.isClosing()||this.isClosed()) this._nameField.close();
	else if(this.isOpening()||this.isOpen()) this._nameField.open();
}).add('updatePlacement',function f(){
	const pos0=this._positionType;
	const rtv=f.ori.apply(this,arguments);
	if(pos0!==this._positionType) this.updatePlacement_nameField();
	return rtv;
}).addBase('updatePlacement_nameField',function f(){
	if(!this._nameField) return;
	const x0=this._nameField.x,y0=this._nameField.y;
	if(this.toGlobal({x:0,y:-this._nameField.height,}).y<0) this._nameField.y=this.height;
	else this._nameField.y=-this._nameField.height;
}).addBase('_update_nameField_syncBg',function f(){
	if(this._background!==this._nameField._background){
		if(!this._nameField.isClosed()) this._nameField.close(); // re-opened in update_nameField
		else this._nameField.setBackgroundType(this._nameField._background=this._background);
	}
}).add('update_nameField_updateText',function f(){
	this.startMessage_nameField_ensureObject();
	if(this._nameField._currentText!==$gameMessage._nameField){
		if(!this._nameField.isClosed()) this._nameField.close(); // re-opened in update_nameField
		else this.startMessage_nameField();
	}
}).add('onclosed',function f(){
	if(this._nameField) this._nameField.openness=this._nameField.enabled=0;
	return f.ori.apply(this,arguments);
});

new cfc(Window_ChoiceList.prototype).add('updatePlacement',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updatePlacement_avoidNameField();
	return rtv;
}).addBase('updatePlacement_avoidNameField',function f(){
	const msg=this._messageWindow;
	const nf=msg&&msg._nameField; if(!nf||!nf.enabled) return;
	const dxy={x:0,y:0,};
	if(!this.isOverlap(nf,dxy)) return;
	dxy.y=-nf.height;
	if(!this.isOverlap(nf,dxy)) return void(this.y-=nf.height);
	dxy.y=nf.height;
	if(!this.isOverlap(nf,dxy)) return void(this.y+=nf.height);
});

})();
