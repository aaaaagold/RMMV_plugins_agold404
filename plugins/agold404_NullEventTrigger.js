"use strict";
/*:
 * @plugindesc can make event not to be triggered: set event data page's 'trigger' to null
 * @author agold404
 * @help starting with (at-sign)NULLTRIGGER in comment (event command) without leading and tailing spaces
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(DataManager).add('onLoad_after_map',function f(obj){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_after_map_setNullTriggers(obj);
	return rtv;
}).
addBase('onLoad_after_map_setNullTriggers',function f(obj){
	obj.events.forEach(f.tbl[0]);
},t=[
evtd=>{ if(!evtd) return;
	for(let p=0,pgv=evtd.pages,pe=pgv.length;p!==pe;++p){
		for(let c=0,cmdv=pgv[p].list,ce=cmdv.length;c!==ce;++c){
			if(cmdv[c].code===108 && cmdv[c].parameters[0]==="@NULLTRIGGER"){
				pgv[p].trigger=null;
				break;
			}
		}
	}
},
]);

})();
