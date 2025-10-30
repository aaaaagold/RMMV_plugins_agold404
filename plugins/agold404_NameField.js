"use strict";
/*:
 * @plugindesc name field
 * @author agold404
 * 
 * @param DefaultFontSize
 * @type text
 * @text default font size
 * @desc .
 * @default 24
 * 
 * @param AutoCenterize
 * @type boolean
 * @text auto centerize name text
 * @desc .
 * @default true
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
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_NameField";
const params=PluginManager.parameters(pluginName);
params._defaultFontSize=useDefaultIfIsNaN(params.DefaultFontSize-0,24);
params._autoCenterize=!useDefaultIfIsNaN(1-params.AutoCenterize,0);

t=[
undefined,
params, // 1: plugin params
/(?<![\\])(\\\\)*(\\NAMEFIELD:("((\\\\)*\\"|[^"\\]|\\[^"])*"))/, // 2: pattern
/(?<![\\])(\\\\)*\\NAMEFIELD:(?=")/, // 3: refined pattern
/(?<![\\])(\\\\)*(\\NF\[([0-9]+|0x[0-9A-Fa-f]+)\])/, // 4: short pattern, using actorName related to actorId
];

new cfc(Game_Interpreter.prototype).add('command101_text',function f(){
	const texts=$gameMessage._texts;
	const strt=texts.length;
	const rtv=f.ori.apply(this,arguments);
	$gameMessage._nameField=undefined;
	for(let x=0,xs=rtv.length;x!==xs;++x){
		const src=rtv[x];
		const m=src.match(f.tbl[4]); if(!m) continue;
		let res="";
		res+=src.slice(0,m.index+(m[1]?m[1].length:0));
		res+=src.slice(m.index+m[0].length);
		rtv[x]=texts[strt+x]=res;
		$gameMessage._nameField=$gameActors.actor(m[3]-0).name();
	}
	for(let x=0,xs=rtv.length;x!==xs;++x){
		const src=rtv[x];
		const m=src.match(f.tbl[3]); if(!m) continue;
		let res="";
		res+=src.slice(0,m.index+(m[1]?m[1].length:0));
		const cStrt=m.index+m[0].length;
		const cRange=getCStyleStringStartAndEndFromString(src,cStrt);
		res+=src.slice(cRange.end);
		$gameMessage._nameField=EVAL.call(this,JSON.parse(src.slice(cRange.start,cRange.end)));
		rtv[x]=texts[strt+x]=res;
	}
if(0){
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
}
	return rtv;
},t);

{ const a=class Window_MessageNameField extends Window_Help{
};
new cfc(a.prototype).
addBase('standardFontSize',function f(){
	return f.tbl[1]._defaultFontSize;
},t).
getP;
window[a.name]=a; }

new cfc(Window_Message.prototype).
addBase('startMessage_nameField',function f(){
	this.startMessage_nameField_ensureObject();
	if($gameMessage._nameField!=null){
		this._nameField._currentText=$gameMessage._nameField;
		let w;
		{ const textState={};
		this._nameField.measure_drawTextEx(this._nameField._currentText,this.textPadding(),0,undefined,'center',textState);
		w=~~(textState.right+1);
		}
		if(w<Window_Base._faceWidth) w=Window_Base._faceWidth;
		const pad=((this.standardPadding()+this.textPadding())<<1)+1;
		w+=pad;
		if(this.width<w) w=this.width;
		this._nameField.width=w;
		this._nameField.contents.clear();
		const txt=params._autoCenterize&&Window_Base.prototype.processEscapeCharacter_textPosition?"\\TXTCENTER:"+JSON.stringify(this._nameField._currentText):this._nameField._currentText;
		this._nameField.drawTextEx(txt,this.textPadding(),0,w-pad,'center');
		this._nameField.enabled=1;
	}else if(this._nameField) this._nameField.enabled=0;
}).addBase('startMessage_nameField_ensureObject',function f(){
	if(this._nameField) return this._nameField;
	this._nameField=new Window_MessageNameField(1);
	this._nameField.y=-this._nameField.height;
	this._nameField.openness=0;
	this._nameField.enabled=0;
	this.addChild(this._nameField);
	return this._nameField;
}).
addBase('standardNamefieldFontSize',function f(){
	// place to this._nameField.standardFontSize
	return f.tbl[1]._defaultFontSize;
},t).
add('startMessage',function f(){
	this.startMessage_nameField();
	return f.ori.apply(this,arguments);
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_nameField();
	return rtv;
}).
addBase('update_nameField',function f(){
	if(this._nameField){
		this._update_nameField_syncOpenness();
		this._update_nameField_syncBg();
	}
	this.update_nameField_updateText();
}).
addBase('_update_nameField_syncOpenness',function f(){
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
}).
addBase('update_nameField_updateText',function f(){
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
