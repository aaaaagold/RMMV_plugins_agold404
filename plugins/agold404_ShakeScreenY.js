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
	this._shakeDurationYMax=undefined;
	this._shakeMode=undefined;
	this._shakeY=0;
}).add('startShakeY',function f(power,speed,duration,mode){
	power=Math.abs(power);
	speed=speed-0||0;
	duration-=0;
	this._shakePowerY=power;
	this._shakeSpeedY=speed;
	this._shakeDurationY=duration;
	this._shakeDurationYMax=duration;
	this._shakeMode=mode;
}).add('updateShake',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updateShakeY();
	return rtv;
}).add('updateShakeY',function f(){
	if(this._shakeDurationY>0||this._shakeY!==0){
		const delta=(this._shakePowerY*this._shakeSpeedY*this._shakeDirectionY)/10;
		if(this._shakeMode && this._shakeMode in f.tbl[0]){
			this[f.tbl[0][this._shakeMode]](delta);
			--this._shakeDurationY;
			return;
		}
		if(!(1<this._shakeDurationY) && this._shakeY*(this._shakeY+delta)<0) return this.clearShake();
		else this._shakeY+=delta;
		if(this._shakeY>this._shakePowerY*2) this._shakeDirectionY=-1;
		if(this._shakeY<-this._shakePowerY*2) this._shakeDirectionY=1;
		--this._shakeDurationY;
	}
},[
{
sin:'updateShakeY_sin',
}, // 0: map
]).add('updateShakeY_sin',function f(delta){
	delta=Math.abs(delta);
	const P_4=Math.floor(this._shakePowerY*2/delta)+1;
	const P_2=P_4<<1;
	this._shakeY=Math.sin(Math.PI*(this._shakeDurationYMax-this._shakeDurationY)/P_2)*delta*P_4*((P_2+this._shakeDurationY)/P_2).clamp(0,1);
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
