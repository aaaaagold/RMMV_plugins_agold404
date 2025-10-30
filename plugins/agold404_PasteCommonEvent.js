"use strict";
/*:
 * @plugindesc paste commands in specified common events in a event page
 * @author agold404
 * 
 * @help use 2-line comment in event commands:
 * (at-sign)PASTECOMMONEVENT
 * common event id
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_PasteCommonEvent";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined,
params, // 1: plugin params
'$dataCommonEvents', // 2: common events name
new Set([
'$dataTroops',
]), // 3: editing target names
function f(cmnEvtdSet,cmnEvtd,i,a){ if(!cmnEvtd) return;
	if(cmnEvtd._isPasted) return;
	if(cmnEvtdSet.has(cmnEvtd)){
		const msg="[ERROR] @PASTECOMMONEVENT: cyclic pasting";
		console.error(msg);
		debugger;
		throw new Error(msg);
		return;
	}
	cmnEvtdSet.add(cmnEvtd);
	cmnEvtd.list;
	const newList=[];
	for(let gettingId=false,li=0,L=cmnEvtd.list,lsz=L.length;li!==lsz;++li){
		const cmd=L[li];
		if(cmd.code===108){ if(cmd.parameters[0]==="@PASTECOMMONEVENT") gettingId=true; }
		else if(cmd.code===408){}
		else gettingId=false;
		if(!gettingId){
			newList.push(cmd);
			continue;
		}
		const cmnEvtId=cmd.parameters[0]-0;
		const src=a[cmnEvtId]; if(!src) continue;
		const bak1=arguments[1];
		const bak2=arguments[2];
		arguments[1]=src;
		arguments[2]=cmnEvtId;
		f.apply(this,arguments);
		arguments[1]=bak1;
		arguments[2]=bak2;
		if(!cmd.indent) for(let arr=src.list,x=0,xs=arr.length;x<xs;++x) newList.push(arr[x]);
		else{ for(let arr=src.list,x=0,xs=arr.length;x<xs;++x){
			const tmp=Object.assign({},arr[x]);
			tmp.indent+=cmd.indent;
			newList.push(tmp);
		} }
	}
	cmnEvtd.list.length=0;
	cmnEvtd.list.concat_inplace(newList);
	cmnEvtdSet.delete(cmnEvtd);
	cmnEvtd._isPasted=true;
}, // 4: forEach $dataCommonEvents
function f(argv){
	window[argv[1]]=argv[0];
	this.onLoad.apply(this,argv);
}, // 5: forEach re-onLoad
(oriList,newList)=>{
	const L=oriList;
	newList=newList||[];
	for(let gettingId=false,li=0,lsz=L.length;li!==lsz;++li){
		const cmd=L[li];
		if(cmd.code===108){ if(cmd.parameters[0]==="@PASTECOMMONEVENT") gettingId=true; }
		else if(cmd.code===408){}
		else gettingId=false;
		if(!gettingId){
			newList.push(cmd);
			continue;
		}
		const cmnEvtId=cmd.parameters[0]-0;
		const src=$dataCommonEvents[cmnEvtId]; if(!src) continue;
		if(!cmd.indent) for(let arr=src.list,x=0,xs=arr.length;x<xs;++x) newList.push(arr[x]);
		else{ for(let arr=src.list,x=0,xs=arr.length;x<xs;++x){
			const tmp=Object.assign({},arr[x]);
			tmp.indent+=cmd.indent;
			newList.push(tmp);
		} }
	}
	return newList;
}, // 6: paste cmds from commonEvent
function f(td,i,a){ if(!td) return;
	for(let pgi=0,pgs=td.pages,pgsz=pgs.length;pgi!==pgsz;++pgi){
		const pg=pgs[pgi];
		const newList=f._tbl[6](pg.list);
		pg.list.length=0;
		pg.list.concat_inplace(newList);
	}
}, // 7: forEach $dataTroops / map evtd
];
t.forEach((x,i,a)=>{
	if(typeof x==='function') x._tbl=a;
});

DataManager._pasteCommonEvents_pendingOnLoads=[];
new cfc(DataManager).
add('onLoad',function f(obj,name,src,msg){
	if(!this.onLoad_isPastingCommonEventsPrepared.apply(this,arguments)) return;
	return f.ori.apply(this,arguments);
}).
addBase('onLoad_isPastingCommonEventsPrepared',function f(obj,name,src,msg){
	if(f.tbl[2]===name) return true; // bypass data sourc
	if(f.tbl[3].has(name)&&!$dataCommonEvents){
		this._pasteCommonEvents_pendingOnLoads.push(arguments);
		window[name]=undefined;
		return false;
	}
	return true;
},t).
add('onLoad_before_commonEvent',function f(obj,name,src,msg){
	this.onLoad_pasteCommonEvents.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('onLoad_pasteCommonEvents',function f(obj,name,src,msg){
	obj.forEach(f.tbl[4].bind(this,new Set()));
	this._pasteCommonEvents_pendingOnLoads.forEach(f.tbl[5],this);
},t).
add('onLoad_before_troop',function f(obj,name,src,msg){
	this.onLoad_troop_pasteCommonEvents.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('onLoad_troop_pasteCommonEvents',function f(obj,name,src,msg){
	obj.forEach(f.tbl[7],this);
},t).
add('onLoad_before_map',function f(obj,name,src,msg){
	this.onLoad_map_pasteCommonEvents.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('onLoad_map_pasteCommonEvents',function f(obj,name,src,msg){
	obj.events.forEach(f.tbl[7],this);
},t).
getP;


})();
