"use strict";
/*:
 * @plugindesc pseudo-random number generator
 * @author agold404
 * 
 * 
 * @help APIs:
 * $gameSystem.prng_get( prng_id , maxOutputVal , isRandInit );
 *   prng_id: id for a prng. you can use multiple prng without interfere another one.
 *   maxOutputVal: `Number` type integer. output value will be in range from 0 to `maxOutputVal`. When it it not a `Number` type integer, the output will be `BigInt` type.
 *   isRandInit: reset internal state to a random number in [0,((1<<30)-1)]
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Prng";
const params=PluginManager.parameters(pluginName)||{};
const one=BigInt(1);
const msk=(one<<BigInt(64))-one;


t=[
undefined,
params,
window.isTest(),
undefined, // 3: rsv for future use
{
bigint:BigInt,
boolean:BigInt,
number:n=>Number.isInteger(n)?BigInt(n):undefined,
string:function f(s){
	if(!f.tbl){ f.tbl=[
		/^[+-]?(?:\d+|0b[01]+|0o[0-7]+|0x[\da-fA-F]+)$/,
	]; }
	return f.tbl[0].test(s)?BigInt(n):undefined;
},
}, // 4: convert method
[
BigInt(13),
-BigInt(7),
BigInt(17),

BigInt(13),
-BigInt(17),
BigInt(5),
].slice(0,3), // 5: updateState shifts
];


new cfc(Game_System.prototype).
addBase('_prng_getStateRoot',function f(){
	let rtv=this._prng_states; if(!rtv) rtv=this._prng_states=new Map();
	return rtv;
}).
addBase('prng_clear',function f(prng_id){
	const root=this._prng_getStateRoot();
	root.delete(prng_id);
	return this;
}).
addBase('_prng_convertToBigInt',function f(x){
	const func=f.tbl[4][typeof x];
	return func&&func(x);
},t).
addBase('_prng_getState',function f(prng_id,resetSeed){
	const root=this._prng_getStateRoot();
	const seed=this._prng_convertToBigInt(resetSeed);
	let rtv=root.get(prng_id); if(!rtv||seed!=null) root.set(prng_id,rtv=seed||1n);
	return rtv;
}).
addBase('_prng_get',function f(prng_id,isToUpdateState){
	const rtv=this._prng_getState(prng_id);
	if(isToUpdateState){
		let t=rtv;
		for(let arr=f.tbl[5],x=0,xs=arr.length;x<xs;++x){
			if(arr[x]<0n) t^=t>>-arr[x];
			else t^=t<<arr[x];
		}
		this._prng_getState(prng_id,t&msk);
	}
	return rtv;
},t).
addBase('prng_get',function f(prng_id,maxOutputVal,isRandInit){
	if(isRandInit) this._prng_getState(prng_id,~~((1<<30)*Math.random()));
	// auto update state
	let rtv=this._prng_get(prng_id,true);
	maxOutputVal=this._prng_convertToBigInt(maxOutputVal);
	if(maxOutputVal!=null) rtv=Number(rtv%(maxOutputVal+1n));
	return rtv;
}).
getP;


})();

