"use strict";
/*:
 * @plugindesc 上下搖
 * @author agold404
 * @help $gameScreen.startShakeY(power,speed,dur);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_Screen.prototype).add('clearShake',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.clearShakeY();
	return rtv;
}).add('clearShakeY',function f(){
	this._shakePowerY=0;
	this._shakeSpeedY=0;
	this._shakeDurationY=0;
	this._shakeDirectionY=1;
	this._shakeY=0;
}).add('startShakeY',function f(power,speed,duration){
	this._shakePowerY=power;
	this._shakeSpeedY=speed;
	this._shakeDurationY=duration;
}).add('updateShake',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updateShakeY();
	return rtv;
}).add('updateShakeY',function f(){
	if(this._shakeDurationY>0||this._shakeY!==0){
		const delta=(this._shakePowerY*this._shakeSpeedY*this._shakeDirectionY)/10;
		if(this._shakeDurationY<=1 && this._shakeY*(this._shakeY+delta)<0) this._shakeY = 0;
		else this._shakeY+=delta;
		if(this._shakeY>this._shakePowerY*2) this._shakeDirectionY=-1;
		if(this._shakeY<-this._shakePowerY*2) this._shakeDirectionY=1;
		--this._shakeDurationY;
	}
}).add('shakeY',function f(){
	if(!(f.tbl[0] in this)) this.clearShake();
	return this._shakeY;
},[
'_shakeY',
]);

new cfc(Spriteset_Base.prototype).add('updatePosition',function f(){
	const rtv=f.ori.apply(this,arguments);
	const screen=$gameScreen;
	this.updatePosition_deltaY(screen);
	return rtv;
},undefined,true).add('updatePosition_deltaY',function f(screen){
	this.y+=Math.round(screen.shakeY());
});

})();
