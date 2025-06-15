"use strict";
/*:
 * @plugindesc press P to pause
 * @author agold404
 * @help .
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_PressPToPause";
const params=PluginManager.parameters(pluginName)||{};

const keyCode=80; // P

new cfc(SceneManager).add('requestUpdate',function f(){
	if(this._isPressPPaused) return;
	return f.ori.apply(this,arguments);
}).getP()._isPressPPaused=false;

const f=window._pressPToPause=e=>{ if(e.keyCode!==keyCode) return;
	if((SceneManager._isPressPPaused=!SceneManager._isPressPPaused)){
		if($gameSystem) $gameSystem.saveBg();
		AudioManager.stopAll();
		return;
	}
	if($gameSystem) $gameSystem.replayBg(true);
	SceneManager.resume();
};
document.addEventListener('keydown',f);

})();
