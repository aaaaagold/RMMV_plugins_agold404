"use strict";
/*:
 * @plugindesc set js code to be executed right after a scene started.
 * @author agold404
 * 
 * 
 * @param DefaultOnStartTitle
 * @type note
 * @text onSceneStart additional codes for Scene_Title
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Title
 * @default ""
 * 
 * @param DefaultOnStartMap
 * @type note
 * @text onSceneStart additional codes for Scene_Map
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Map
 * @default ""
 * 
 * @param DefaultOnStartBattle
 * @type note
 * @text onSceneStart additional codes for Scene_Battle
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Battle
 * @default ""
 * 
 * @param DefaultOnStartMenu
 * @type note
 * @text onSceneStart additional codes for Scene_Menu
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Menu
 * @default ""
 * 
 * @param DefaultOnStartItem
 * @type note
 * @text onSceneStart additional codes for Scene_Item
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Item
 * @default ""
 * 
 * @param DefaultOnStartSkill
 * @type note
 * @text onSceneStart additional codes for Scene_Skill
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Skill
 * @default ""
 * 
 * @param DefaultOnStartEquip
 * @type note
 * @text onSceneStart additional codes for Scene_Equip
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Equip
 * @default ""
 * 
 * @param DefaultOnStartStatus
 * @type note
 * @text onSceneStart additional codes for Scene_Status
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Status
 * @default ""
 * 
 * @param DefaultOnStartOptions
 * @type note
 * @text onSceneStart additional codes for Scene_Options
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Options
 * @default ""
 * 
 * @param DefaultOnStartGameEnd
 * @type note
 * @text onSceneStart additional codes for Scene_GameEnd
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_GameEnd
 * @default ""
 * 
 * @param DefaultOnStartShop
 * @type note
 * @text onSceneStart additional codes for Scene_Shop
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Shop
 * @default ""
 * 
 * @param DefaultOnStartSave
 * @type note
 * @text onSceneStart additional codes for Scene_Save
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Save
 * @default ""
 * 
 * @param DefaultOnStartLoad
 * @type note
 * @text onSceneStart additional codes for Scene_Load
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Load
 * @default ""
 * 
 * @param DefaultOnStartGameover
 * @type note
 * @text onSceneStart additional codes for Scene_Gameover
 * @desc write js codes here. executed if `SceneManager._scene` is an instance of Scene_Gameover
 * @default ""
 * 
 * @param DefaultOnStartDefault
 * @type note
 * @text onSceneStart additional codes for non of the above instances
 * @desc write js codes here. executed if `SceneManager._scene` is not an instance in the above.
 * @default ""
 * 
 * @param DefaultOnStartCommonBefore
 * @type note
 * @text common onSceneStart additional codes before the above
 * @desc write js codes here
 * @default ""
 * 
 * @param DefaultOnStartCommonAfter
 * @type note
 * @text common onSceneStart additional codes after the above
 * @desc write js codes here
 * @default ""
 * 
 * 
 * @help set js code to be executed right after a scene started by scenes.
 * for startup eval, use agold404_StartupEval instead.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_OnSceneStartEval.";
const params=PluginManager.parameters(pluginName)||{};
params._defaultOnStartTitle    =JSON.parse(params.DefaultOnStartTitle    ||"0");
params._defaultOnStartMap      =JSON.parse(params.DefaultOnStartMap      ||"0");
params._defaultOnStartBattle   =JSON.parse(params.DefaultOnStartBattle   ||"0");
params._defaultOnStartMenu     =JSON.parse(params.DefaultOnStartMenu     ||"0");
params._defaultOnStartItem     =JSON.parse(params.DefaultOnStartItem     ||"0");
params._defaultOnStartSkill    =JSON.parse(params.DefaultOnStartSkill    ||"0");
params._defaultOnStartEquip    =JSON.parse(params.DefaultOnStartEquip    ||"0");
params._defaultOnStartStatus   =JSON.parse(params.DefaultOnStartStatus   ||"0");
params._defaultOnStartOptions  =JSON.parse(params.DefaultOnStartOptions  ||"0");
params._defaultOnStartGameEnd  =JSON.parse(params.DefaultOnStartGameEnd  ||"0");
params._defaultOnStartShop     =JSON.parse(params.DefaultOnStartShop     ||"0");
params._defaultOnStartSave     =JSON.parse(params.DefaultOnStartSave     ||"0");
params._defaultOnStartLoad     =JSON.parse(params.DefaultOnStartLoad     ||"0");
params._defaultOnStartGameover =JSON.parse(params.DefaultOnStartGameover ||"0");
params._defaultOnStartDefault  =JSON.parse(params.DefaultOnStartDefault  ||"0");
params._defaultOnStartCommonBefore=JSON.parse(params.DefaultOnStartCommonBefore||"0");
params._defaultOnStartCommonAfter=JSON.parse(params.DefaultOnStartCommonAfter||"0");


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
];


{ const p=SceneManager;
new cfc(SceneManager).
addRoof('onSceneStart',function f(){
	this.onSceneStartEval_before.apply(this,arguments);
	const rtv=f.ori.apply(this,arguments);
	this.onSceneStartEval_byScene.apply(this,arguments);
	this.onSceneStartEval_after.apply(this,arguments);
	return rtv;
}).
addBase('onSceneStartEval_before',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartCommonBefore);
},t).
addBase('onSceneStartEval_after',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartCommonAfter);
},t).
addBase('onSceneStartEval_byScene_title',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartTitle);
},t).
addBase('_onSceneStartEval_byScene_title',function f(){
	return this.onSceneStartEval_byScene_title.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_map',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartMap);
},t).
addBase('_onSceneStartEval_byScene_map',function f(){
	return this.onSceneStartEval_byScene_map.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_battle',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartBattle);
},t).
addBase('_onSceneStartEval_byScene_battle',function f(){
	return this.onSceneStartEval_byScene_battle.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_menu',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartMenu);
},t).
addBase('_onSceneStartEval_byScene_menu',function f(){
	return this.onSceneStartEval_byScene_menu.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_item',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartItem);
},t).
addBase('_onSceneStartEval_byScene_item',function f(){
	return this.onSceneStartEval_byScene_item.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_skill',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartSkill);
},t).
addBase('_onSceneStartEval_byScene_skill',function f(){
	return this.onSceneStartEval_byScene_skill.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_equip',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartEquip);
},t).
addBase('_onSceneStartEval_byScene_equip',function f(){
	return this.onSceneStartEval_byScene_equip.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_status',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartStatus);
},t).
addBase('_onSceneStartEval_byScene_status',function f(){
	return this.onSceneStartEval_byScene_status.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_options',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartOptions);
},t).
addBase('_onSceneStartEval_byScene_options',function f(){
	return this.onSceneStartEval_byScene_options.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_gameEnd',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartGameEnd);
},t).
addBase('_onSceneStartEval_byScene_gameEnd',function f(){
	return this.onSceneStartEval_byScene_gameEnd.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_shop',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartShop);
},t).
addBase('_onSceneStartEval_byScene_shop',function f(){
	return this.onSceneStartEval_byScene_shop.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_save',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartSave);
},t).
addBase('_onSceneStartEval_byScene_save',function f(){
	return this.onSceneStartEval_byScene_save.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_load',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartLoad);
},t).
addBase('_onSceneStartEval_byScene_load',function f(){
	return this.onSceneStartEval_byScene_load.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene_gameover',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartGameover);
},t).
addBase('_onSceneStartEval_byScene_gameover',function f(){
	return this.onSceneStartEval_byScene_gameover.apply(this,arguments);
}).
addBase('onSceneStartEval_byScene',function f(){
	const func=f.tbl[0].get(this._scene&&this._scene.constructor)||this.onSceneStartEval_byScene_default;
	return func.apply(this,arguments);
},[
new Map([
	[ Scene_Title,    p._onSceneStartEval_byScene_title,    ],
	[ Scene_Map,      p._onSceneStartEval_byScene_map,      ],
	[ Scene_Battle,   p._onSceneStartEval_byScene_battle,   ],
	[ Scene_Menu,     p._onSceneStartEval_byScene_menu,     ],
	[ Scene_Item,     p._onSceneStartEval_byScene_item,     ],
	[ Scene_Skill,    p._onSceneStartEval_byScene_skill,    ],
	[ Scene_Equip,    p._onSceneStartEval_byScene_equip,    ],
	[ Scene_Status,   p._onSceneStartEval_byScene_status,   ],
	[ Scene_Shop,     p._onSceneStartEval_byScene_shop,     ],
	[ Scene_Options,  p._onSceneStartEval_byScene_options,  ],
	[ Scene_Save,     p._onSceneStartEval_byScene_save,     ],
	[ Scene_Load,     p._onSceneStartEval_byScene_load,     ],
	[ Scene_Gameover, p._onSceneStartEval_byScene_gameover, ],
]), // 0: tbl
]).
addBase('onSceneStartEval_byScene_default',function f(){
	return EVAL.call(this,f.tbl[1]._defaultOnStartDefault);
},t).
getP;
}


})();

