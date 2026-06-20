"use strict";
/*:
 * @plugindesc gold options in Scene_Shop
 * @author agold404
 * 
 * 
 * @help APIs:
 *  // TODO
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SceneShop_goldOptions";
const params=PluginManager.parameters(pluginName)||{};


t=[
undefined,
params,
window.isTest(),
];


new cfc(Scene_Shop.prototype).
//
add('prepare',function f(goods, purchaseOnly, opts){
	const rtv=f.ori.apply(this,arguments);
	this.goldOptions_initOptions.apply(this,arguments);
	return rtv;
}).
addBase('goldOptions_initOptions',function f(goods, purchaseOnly, opts){
	const goldOptions=opts&&opts.goldOptions||{};
	this._goldOption_moneyGetter=goldOptions.getter;
	this._goldOption_moneySetter=goldOptions.setter;
	this._goldOption_moneyUnit=useDefaultIfIsNone(goldOptions.unit,TextManager.currencyUnit);
	;
	if(f.tbl[2]){
		if((!this._goldOption_moneyGetter!==!this._goldOption_moneySetter)||(this._goldOption_moneyGetter instanceof Function)!==(this._goldOption_moneySetter instanceof Function)){
			let msg=pluginName;
			msg+=": getter and setter should be set or not set to a function at the same time";
			throw msg;
		}
	}
	if(this._goldOption_moneyGetter) this._goldOption_moneyGetter=this._goldOption_moneyGetter.bind(this);
	if(this._goldOption_moneySetter) this._goldOption_moneySetter=this._goldOption_moneySetter.bind(this);
},t).
//
add('createGoldWindow',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.goldOptions_passOptionsToGoldWindow.apply(this,arguments);
	return rtv;
}).
addBase('goldOptions_passOptionsToGoldWindow',function f(){
	const wnd=this._goldWindow;
	wnd._currencyUnit=this._goldOption_moneyUnit;
	if(this._goldOption_moneyGetter) wnd.value=this._goldOption_moneyGetter;
	wnd.refresh();
}).
add('createNumberWindow',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.goldOptions_passOptionsToNumberWindow.apply(this,arguments);
	return rtv;
}).
addBase('goldOptions_passOptionsToNumberWindow',function f(){
	const wnd=this._numberWindow;
	wnd._currencyUnit=this._goldOption_moneyUnit;
}).
add('createBuyWindow',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.goldOptions_passOptionsToBuyWindow.apply(this,arguments);
	return rtv;
}).
addBase('goldOptions_passOptionsToBuyWindow',function f(){
	const wnd=this._buyWindow;
	if(this._goldOption_moneyGetter) wnd.getMoney=this._goldOption_moneyGetter;
}).
//
add('doBuy_setMoney',function f(){
	return this.goldOptions_doBuySetMoney_chkIfUseOri.apply(this,arguments)?f.ori.apply(this,arguments):this.goldOptions_doBuySetMoney_do.apply(this,arguments);
}).
addBase('goldOptions_doBuySetMoney_chkIfUseOri',function f(){
	return !this._goldOption_moneyGetter;
}).
addBase('goldOptions_doBuySetMoney_do',function f(cnt){
	this.goldOptions_setMoney_do(this._goldOption_moneyGetter()-this.buyingPrice()*cnt);
}).
add('doSell_setMoney',function f(){
	return this.goldOptions_doSellSetMoney_chkIfUseOri.apply(this,arguments)?f.ori.apply(this,arguments):this.goldOptions_doSellSetMoney_do.apply(this,arguments);
}).
addBase('goldOptions_doSellSetMoney_chkIfUseOri',function f(){
	return !this._goldOption_moneyGetter;
}).
addBase('goldOptions_doSellSetMoney_do',function f(){
	this.goldOptions_setMoney_do(this._goldOption_moneyGetter()+this.sellingPrice()*cnt);
}).
addBase('goldOptions_setMoney_do',function f(val){
	this._goldOption_moneySetter(val);
}).
//
getP;


})();

