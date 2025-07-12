"use strict";
/*:
 * @plugindesc auto update agold404_* plugins
 * @author agold404
 * 
 * @help .
 * default path is https://aaaaagold.github.io/MyLightBalls/js/plugins.js
 * only plugins starting with the string "agold404_" may be updated. 
 * turned-off plugins will NOT be updated automatically. however, unused ones WILL be updated automatically. 
 * update process identify a plugin by its name. if you put two identical named plugins, the last turned-on/off status is used. 
 * update process identify a plugin by its name. if you swap the name of two or more plugins, this process WILL crash. 
 * 
 * 
 * @param Js_Plugins_js_Path
 * @type number
 * @text path for plugins.js
 * @desc full remote path for plugins.js
 * @default https://aaaaagold.github.io/MyLightBalls/js/plugins.js
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const ver='2025-07-13 2',verJudgeKey='_agold404_AutoUpdatePlugins_isVerJudging';
{ const key=verJudgeKey; if(window[key]){
	return ver;
} }
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_AutoUpdatePlugins";
const params=PluginManager.parameters(pluginName)||{};
params._js_plugins_js_Path=getPropertyValue(params,'Js_Plugins_js_Path',"https://aaaaagold.github.io/MyLightBalls/js/plugins.js");
const convertPluginNameToRemotePath=pluginName=>{
	if((typeof params._js_plugins_js_Path)!=="string") return;
	const uqh=window.splitUrlQueryHash(params._js_plugins_js_Path);
	uqh[0]=uqh[0].replace(/js\/plugins\.js/,"js/plugins/"+pluginName+".js");
	return uqh.join('');
};
params._this_plugins_path=convertPluginNameToRemotePath(pluginName);
const pluginConfsToNameStatusPairs=(confs,isTakingAll)=>{
	const rtv=[]; for(let x=0,xs=Math.max(confs&&confs.length|0,0)|0;x!==xs;++x) if(isTakingAll||confs[x].status) rtv.push([confs[x].name,confs[x].status]);
	return rtv;
};

t=[
pluginName,
params, // 1: plugin params
verJudgeKey, // 2: ver judging key
/^agold404_/, // 3: plugin name matching rule
convertPluginNameToRemotePath, // 4: convert pluginName to remote path
tmpPaths=>{
	try{
		const fs=require('node:fs'),xs=Math.max(tmpPaths&&tmpPaths.length,0)|0;
		for(let x=0;x!==xs;++x) fs.renameSync(tmpPaths[x],tmpPaths[x].slice(0,-4));
		if(xs) location.reload();
	}catch(e){}
}, // 5: update files via renaming tmp files to non-tmp files
pluginConfsToNameStatusPairs, // 6: 
];

{ const a=class Scene_AutoUpdatePluginsWaiting extends Scene_Base{ // basically the same as Scene_Waiting but separated for updating the 'base'
};
window[a.name]=a;
new cfc(a.prototype).addBase('initialize',function f(){
	f._super[f._funcName].apply(this,arguments);
	this._nextScene=SceneManager._nextScene.constructor; // use something global to handling the scene arguments
}).addBase('update',function f(){
	f._super[f._funcName].apply(this,arguments);
	this.update_gotoNextScene();
}).addBase('update_gotoNextScene',function f(){
	SceneManager.goto(this._nextScene);
}).addBase('terminate_after',function f(){
	const rtv=f._super[f._funcName].apply(this,arguments);
	try{
		this.writeFiles();
	}catch(e){}
	return rtv;
}).addBase('writeFiles',function f(){
	const arr=this._pluginPaths,xs=arr&&arr.length|0;
	if(arr){ let cnt=arr.length,tmpPaths=[]; for(let x=0;x!==xs;++x){
		const info=arr[x];
		const raw=ImageManager.otherFiles_getData(info[0]);
		const fs=require('node:fs');
		const root=location.pathname.indexOf('/www/')<0?'':'www/';
		const tmpPath=root+'js/plugins/'+info[1]+'.js.tmp';
		fs.writeFile(tmpPath,raw.replace(/\r/g,'').replace(/\n/g,'\r\n'),err=>{
			if(err) return console.warn('[WARNING]',f.tbl[0],"write file fail:",info[1]);
			tmpPaths.push(tmpPath);
			if(!--cnt) f.tbl[5](tmpPaths);
		});
		console.log(info[1],'\n\n',raw); // debug
	} }
},t);
}

new cfc(Scene_Boot.prototype).add('start_before',function f(){
	this.updatePlugins_loadPlugins();
	return f.ori.apply(this,arguments);
}).addBase('updatePlugins_loadPlugins',function f(){
	if(!f.tbl[1]._js_plugins_js_Path) return;
	if(!f.tbl[1]._this_plugins_path) return console.warn('[WARNING]',f.tbl[0],'cannot update plugins due to being unable to get the remote path of this plugin.');
	ImageManager.otherFiles_addLoad(f.tbl[1]._js_plugins_js_Path);
	ImageManager.otherFiles_addLoad(f.tbl[1]._this_plugins_path);
},t).add('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updatePlugins_updateFiles();
	return rtv;
}).addBase('updatePlugins_updateFiles',function f(){
	if(this.updatePlugins_updateFiles_condOk()) this.updatePlugins_updateFiles_getFiles();
}).addBase('updatePlugins_updateFiles_condOk',function f(){
	if(!ImageManager.otherFiles_getData(f.tbl[1]._js_plugins_js_Path)) return;
	const raw=ImageManager.otherFiles_getData(f.tbl[1]._this_plugins_path);
	window[f.tbl[2]]=true;
	const remoteVer=EVAL.call(this,raw);
	delete window[f.tbl[2]];
	return ver<remoteVer;
},t).addBase('updatePlugins_updateFiles_getFiles',function f(){
	const raw=ImageManager.otherFiles_getData(f.tbl[1]._js_plugins_js_Path);
	const pluginConfs=EVAL.call(this,raw+"\n\n$plugins;");
	// console.log(pluginConfs); // debug
	const nextScene=new Scene_AutoUpdatePluginsWaiting();
	SceneManager._nextScene=nextScene;
	const currSet=new Map(f.tbl[6]($plugins,true));
	const arr=nextScene._pluginPaths=[];
	const srcv=nextScene._confs=pluginConfs;
	if(srcv){ for(let x=0,xs=Math.max(srcv&&srcv.length,0)|0;x!==xs;++x){
		if(currSet.get(srcv[x].name)===false) continue;
		if(!srcv[x].name.match||!srcv[x].name.match(f.tbl[3])) continue;
		arr.push([f.tbl[4](srcv[x].name),srcv[x].name]);
	} }
	for(let x=0,xs=arr.length;x!==xs;++x) ImageManager.otherFiles_addLoad(arr[x][0]);
},t);


})();
