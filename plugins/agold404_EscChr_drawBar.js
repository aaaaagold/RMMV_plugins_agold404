"use strict";
/*:
 * @plugindesc draw bars (e.g. HP,MP,TP bars) using drawTextEx
 * @author agold404
 * 
 * 
 * @help \BAR:" ... JSON format settings, it is parsed via `eval()` ... "
 * 
 * properties in above JSON format should have:
 *   width // use 0 if not given
 *   height // use lineHeight()-4 if not given
 *   gaugeColor1
 *   gaugeColor2 // color left-to-right = gaugeColor1 .. gaugeColor2 in linear
 *   barRate // 0 to 1, clamped
 *   valCurr // current value // aligned to right, use empty string if not given
 *   valMax // max value // aligned to right, use empty string if not given
 * options:
 *   x // use textState.x if not given
 *   y // use textState.y if not given
 *   gaugeBackColor // if not given, default value is used // see `Window_Base.prototype.gaugeBackColor`
 *   sepChr // default '/' // text = valCurr / valMax
 *   sepXRatio // 0 to 1, clamped , default = 0.5
 *   align // 'btm' or 'top'. default 'btm'
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_EscChr_drawBar";
const params=PluginManager.parameters(pluginName)||{};


t=[
undefined,
params,
window.isTest(),
[{}], // 3: dummy info
];


Window_Base.
escapeFunction_set('BAR',function f(code,textState){
	if(textState.text[textState.index]!==":") return;
	const idxRange=getCStyleStringStartAndEndFromString(textState.text,textState.index+1);
	const setting=EVAL.call(this,"("+textState.text.slice(idxRange.start+1,idxRange.end-1)+")")||{};
	
	this.drawBarFromSetting(setting,textState);
	textState.index=idxRange.end;
	console.log(code,textState.index,setting,);
},t).
escapeFunction_set;
new cfc(Window_Base.prototype).
addBase('drawBarFromSetting',function f(setting,textState){
	if(!setting) return;
	const w=setting.width-0||0;
	const h=useDefaultIfIsNaN(setting.height-0,this.lineHeight()-4);
	if(!(0<w)) return; // 0-size bar
	const gc1=setting.gaugeColor1;
	const gc2=setting.gaugeColor2;
	const barRate=(setting.barRate-0).clamp(0,1)||0;
	const valCurr=setting.valCurr==null?"":setting.valCurr;
	const valMax=setting.valMax==null?"":setting.valMax;
	
	const x=('x' in setting)?setting.x:textState.x;
	const y=('y' in setting)?setting.y:textState.y;
	const gbgc=setting.gaugeBackColor||this.gaugeBackColor();
	const sepChr=('sepChr' in setting)?setting.sepChr:'/';
	const sepXRatio=useDefaultIfIsNaN(setting.sepXRatio,0.5);
	const align=setting.align; // default value handled by lower-level API
	
	this.drawActorP_common(
		this.contents.textColor,
		gc1,gc2,
		barRate,"",valCurr,valMax,
		undefined,x,y,w,h,align,
	);
	
	textState.x+=w;
}).
getP;


})();
