"use strict";
/*:
 * @plugindesc <longDistDetection> makes event movable from player locating in the map everywhere
 * @author agold404
 * @help <longDistDetection>
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_Event.prototype).
addWithBaseIfNotOwn('isNearTheScreen',function f(){
	return (f.tbl[0] in this.getMeta())||f.ori.apply(this,arguments);
},t=[
'longDistDetection',
]).add('isNearThePlayer',function f(){
	return (f.tbl[0] in this.getMeta())||f.ori.apply(this,arguments);
},t);

})();
