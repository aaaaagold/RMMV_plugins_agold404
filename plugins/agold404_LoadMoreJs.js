"use strict";
/*:
 * @plugindesc load more javascript files specify by this plugin
 * @author agold404
 * 
 * 
 * @param JsList
 * @type note
 * @text javascript files list
 * @desc add more javascript files line by line
 * @default "example-1.js\nexample-2.js# comment after path should start immediately. you should not write something like \"____.js # comment\" since the path to js file will become \"____.js \"\n# a comment line starting with #"
 * 
 * @param JsListFile
 * @type text
 * @text path to javascript files list file
 * @desc for one who thinks specifying js files in plugin params is terrible. chrs starting from # will be omitted.
 * @default custom/js_file_list.txt
 * 
 * 
 * @help load more javascript files AFTER game's first loading done.
 * this plugin treats each line in the list as a path to be loaded.
 * each line is truncated starting from a symbol #.
 * an empty line will be safely omitted.
 * 
 * the format of "javascript files list file" is as same as plugin parameter "javascript files list".
 * the loaded order for all javascript files specified in either way is NOT guaranteed.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_LoadMoreJs";
const params=PluginManager._parameters[pluginName];
params._jsList=JSON.parse(params.JsList||'""');
params._jsListFile=params.JsListFile;


t=[
undefined,
params,
window.isTest(),
lines=>(lines||"").replace(re_allR,'').split('\n').map(line=>{
	const idx=line.indexOf("#");
	return idx>=0?line.slice(0,idx):line;
}).filter(filterArg0),
src=>document.body.ac(document.ce('script').sa('type',"text/javascript").sa('src',src).sa('async','true')),
];


new cfc(SceneManager).
addRoof('run',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.loadMoreJs_addScripts.apply(this,arguments); // avoid chk in `.checkFileAccess()`
	return rtv;
}).
addBase('loadMoreJs_addScripts',function f(){
	if(f.tbl[1]._jsListFile) ImageManager.otherFiles_addLoad(f.tbl[1]._jsListFile);
	f.tbl[3](f.tbl[1]._jsList).forEach(f.tbl[4]);
},t).
getP;

new cfc(Scene_Boot.prototype).
addRoof('start_before',function f(){
	this.loadMoreJs_addScripts.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('loadMoreJs_addScripts',function f(){
	f.tbl[3](ImageManager.otherFiles_getData(f.tbl[1]._jsListFile)).forEach(f.tbl[4]);
},t).
getP;


})();
