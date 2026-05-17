"use strict";
/*:
 * @plugindesc Scene_Screenshots
 * @author agold404
 * 
 * 
 * @param Keys
 * @type note[]
 * @text keyCodes to trigger
 * @desc they are eval-ed before treating them as an integer.
 * @default ["\"19\""]
 * 
 * 
 * @help set key(s) to create screenshots and view them in Scene_Options
 * setting multiple keys means each of them being pressed alone can create a screenshot.
 * 
 * key codes mapping: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 * 
 * default key is Paause/Break key.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SceneScreenshots";
const params=PluginManager.parameters(pluginName)||{};
params._keys=JSON.parse(params.Keys||"[19]");


t=[
undefined,
params,
window.isTest(),
undefined,
];


{ const a=class Scene_Screenshots extends Scene_Base{
};
window[a.name]=a;
}


const keyName_screenshot='screenshot';
if(params._keys&&params._keys.forEach) params._keys.forEach(x=>{
	x=EVAL(JSON.parse(x)); if(isNaN(x)) return;
	Input.keyMapper[x]=keyName_screenshot;
});
SceneManager.additionalUpdate_renderScene_add(()=>{
	if(Input.isTriggered(keyName_screenshot)) Graphics.createScreenshot(true);
});


})();

