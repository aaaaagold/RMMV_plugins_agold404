"use strict";
/*:
 * @plugindesc press P to pause
 * @author agold404
 * @help .
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const keyCode=80; // P

new cfc(SceneManager).add('requestUpdate',function f(){
	if(this._isPressPPaused) return;
	return f.ori.apply(this,arguments);
}).getP()._isPressPPaused=false;

const f=window._pressPToPause=e=>{ if(e.keyCode!==keyCode) return;
	if((SceneManager._isPressPPaused=!SceneManager._isPressPPaused)){
		$gameSystem.saveBg();
		AudioManager.stopAll();
		return;
	}
	$gameSystem.replayBg(true);
	SceneManager.resume();
};
document.addEventListener('keydown',f);

})();
