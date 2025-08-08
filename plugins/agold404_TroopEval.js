"use strict";
/*:
 * @plugindesc run an event page of a troop BEFORE entering battle scene
 * @author agold404
 * 
 * @help in a troop
 * with (at-sign)BEFORE in first line of comment, the whole page will be run (by Game_Interpreter) AT THE BEGINING of troop setup.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_TroopEval";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined, // 0: dev-reserve
params, // 1: plugin params
'$dataCommonEvents', // 2: common events name
undefined, // 3: dev-reserve
troopd=>{ if(!troopd) return;
	const idxv=troopd._troopEval_runBeforeSetupPageIdxv=[];
	for(let pgi=0,pgs=troopd.pages,pgsz=pgs.length;pgi!==pgsz;++pgi){
		const pg=pgs[pgi],noteLines=[];
		for(let li=0,L=pg.list,lsz=L.length;li!==lsz;++li){
			const cmd=L[li];
			if(cmd.code===108 && cmd.parameters[0]==="@BEFORE"){
				pg._troopEval_runBeforeSetup=true;
				idxv.push(pgi);
				break;
			}
		}
	}
}, // 4: forEach troopd
troopd=>{ if(!troopd) return;
	const idxv=troopd._troopEval_runOnSetupPageIdxv=[];
	for(let pgi=0,pgs=troopd.pages,pgsz=pgs.length;pgi!==pgsz;++pgi){
		const pg=pgs[pgi],noteLines=[];
		for(let li=0,L=pg.list,lsz=L.length;li!==lsz;++li){
			const cmd=L[li];
			if(cmd.code===108 && cmd.parameters[0]==="@ONSETUP"){
				pg._troopEval_runOnSetup=true;
				idxv.push(pgi);
				break;
			}
		}
	}
}, // 5: forEach troopd
];

DataManager._pasteCommonEvents_pendingOnLoads=[];
new cfc(DataManager).
add('onLoad_before_troop',function f(obj,name,src,msg){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_troop_runBefore.apply(this,arguments);
	this.onLoad_troop_runOnSetup.apply(this,arguments);
	return rtv;
}).
addBase('onLoad_troop_runBefore',function f(obj,name,src,msg){
	obj.forEach(f.tbl[4],this);
},t).
addBase('onLoad_troop_runOnSetup',function f(obj,name,src,msg){
	obj.forEach(f.tbl[5],this);
},t).
getP;

new cfc(Game_Troop.prototype).
add('setup',function f(troopId){
	this.troopEval_runBeforeSetup.apply(this,arguments);
	const rtv=f.ori.apply(this,arguments);
	this.troopEval_runOnSetup.apply(this,arguments);
	return;
}).
addBase('troopEval_runBeforeSetup',function f(troopId){
	this._troopId=troopId;
	const troopd=$dataTroops[troopId]; if(!troopd) return console.warn('[TroopEval]','[WARNING]','skipped due to using non-existing troop');
	this._troopEval_common(troopd,troopd._troopEval_runBeforeSetupPageIdxv);
}).
addBase('troopEval_runOnSetup',function f(troopId){
	const troopd=$dataTroops[troopId]; if(!troopd) return console.warn('[TroopEval]','[WARNING]','skipped due to using non-existing troop');
	this._troopEval_common(troopd,troopd._troopEval_runOnSetupPageIdxv);
}).
addBase('_troopEval_common',function f(troopd,idxv){
	const itp=this._interpreter;
	for(let arr=idxv,x=0,xs=arr.length;x!==xs;++x){
		itp.clear();
		itp.setup(troopd.pages[arr[x]].list);
		while(itp.isRunning()) itp.update();
	}
}).
getP;


})();
