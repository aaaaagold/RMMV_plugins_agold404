"use strict";
/*:
 * @plugindesc 技能樹
 * @author agold404
 * @help actors' note:
 * 
 * <skillTree:[
 *  [ skill_id, skill_id, ... ],
 *  [ false-like, skill_id, ... ],
 *  [],
 *  0,
 *  [ [skill_id,"cond","callback",connection_lines], ]
 *  ...
 * ]>
 * 
 * cond: text for condition evaluate using eval()
 * use 'a' or 'actor' to represent the current actor.
 * 
 * callback: text for callback evaluate using eval() after the skill is learnt
 * 
 * connection_lines: the lines drew
 *   8
 * 4   6
 *   2
 * =>
 *   8
 * 4  16
 *   2
 * 
 * 
 * @param ShowSkillPoint
 * @type boolean
 * @text showing skill point?
 * @desc Set wheather showing skill point in skill tree window
 * @default true
 * 
 * @param SkillPointEvalText
 * @type boolean
 * @text skill point infos
 * @desc Showing skill points info with eval()
 * @default "SP: "+a.skillTreePoint_get()
 * 
 * @param SkillPointTextX
 * @type number
 * @text x offset of skill point infos
 * @desc x offset of skill point infos
 * @default 168
 * 
 * @param SkillPointTextY
 * @type number
 * @text y offset of skill point infos
 * @desc y offset of skill point infos
 * @default 100
 * 
 * @param SkillPointTotalWidth
 * @type number
 * @text width of skill point infos
 * @desc width of skill point infos
 * @default 128
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SkillTree";
const params=PluginManager._parameters[pluginName]||{};
params._showSkillPoint=JSON.parse(params.ShowSkillPoint);
params._skillPointEvalText=params.SkillPointEvalText||"''";
params._skillPointTextX=params.SkillPointTextX-0||0;
params._skillPointTextY=params.SkillPointTextY-0||0;
params._skillPointTotalWidth=params.SkillPointTotalWidth-0||0;


const itemAct_use="使用";
const itemAct_learn="學習";
const itemAct_cancel="取消";


new cfc(Scene_Boot.prototype).add('start_before',function f(){
	this.start_before_skillTree();
	return f.ori.apply(this,arguments);
}).add('start_before_skillTree',function f(actrIdx,classIdx){
	let idx;
	
	idx=actrIdx;
	if(idx===undefined) $dataActors.forEach(f.tbl[0],this);
	else if($dataActors[idx]) f.tbl[0].call(this,$dataActors[idx]);
	
	idx=classIdx
	if(idx===undefined) $dataClasses.forEach(f.tbl[0],this);
	else if($dataClasses[idx]) f.tbl[0].call(this,$dataClasses[idx]);
},[
dataobj=>{ const meta=dataobj&&dataobj.meta; if(!meta) return;
	dataobj.skillTree=meta.skillTree?JSON.parse(meta.skillTree):[];
},
]);

new cfc(Scene_ItemBase.prototype).add('create_tunePositions',function f(){
	this._isInitingItemActionWindow=false;
	let y=0;
	if(this._categoryWindow){
		this._categoryWindow.y=0;
		y=Math.max(y,this._categoryWindow.y+this._categoryWindow.height);
	}
	if(this._skillTypeWindow){
		this._skillTypeWindow.y=0;
		y=Math.max(y,this._skillTypeWindow.y+this._skillTypeWindow.height);
	}
	if(this._statusWindow){
		this._statusWindow.y=0;
		y=Math.max(y,this._statusWindow.y+this._statusWindow.height);
	}
	this._itemWindow.y=y;
	this._helpWindow.y=Graphics.height-this._helpWindow.height;
	this.addChild(this._actorWindow);
});
//Window_ItemList.prototype.maxCols=()=>4;
new cfc(Scene_Item.prototype).add('create',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.create_tunePositions();
	return rtv;
});
new cfc(Window_SkillType.prototype).add('makeCommandList',function f(itemListPrefix){
	// itemListPrefix === [name,'skill',enabled,stypeId]
	if(this._actor){
		if(this._skillTree_skillTreeAtFirst){
			if(!this._skillTree_noSkillTree) (itemListPrefix=itemListPrefix||f.tbl[0]).forEach(f.tbl[1],this);
		}
		this._actor.addedSkillTypes().sort(cmpFunc_num).forEach(f.tbl[2],this);
		if(!this._skillTree_skillTreeAtFirst){
			if(!this._skillTree_noSkillTree) (itemListPrefix=itemListPrefix||f.tbl[0]).forEach(f.tbl[1],this);
		}
	}
},[
[
["技能樹",'skill',true,-1],
], // 0: default itemListPrefix
function(prefixItem){ this.addCommand.apply(this,prefixItem); }, // 1: forEach prefixItem this.addCommand
function(stypeId){this.addCommand($dataSystem.skillTypes[stypeId], 'skill', true, stypeId); }, // 2: forEach skillType this.addCommand
]);
{ const p=Window_SkillList.prototype;
const pp=p.__proto__;
let t=[pp];
new cfc(p).add('isTree',function f(){
	return !(this._stypeId>=0);
}).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._isSimpleTreeMode=!ConfigManager._skilltree_detailedTreeMode;
	return rtv;
}).addBase('isSimpleTreeMode',function f(){
	return this._isSimpleTreeMode;
}).add('itemSpacingY',function f(){
	return this.isTree()?this.lineHeight():f.ori.apply(this,arguments);
}).add('itemWidth',(p.itemWidth===pp.itemWidth?(function f(){
	if(this.isTree() && this.isSimpleTreeMode()) return Math.max(this.lineHeight(),Window_Base._iconWidth);
	return f.tbl[0][f._funcName].apply(this,arguments);
}):(function f(){
	if(this.isTree() && this.isSimpleTreeMode()) return Math.max(this.lineHeight(),Window_Base._iconWidth);
	return f.ori.apply(this,arguments);
})),t,true).add('itemHeight',(p.itemHeight===pp.itemHeight?(function f(){
	if(this.isTree()){
		if(this.isSimpleTreeMode()) return Math.max(this.lineHeight(),Window_Base._iconHeight);
		return this.lineHeight()<<1;
	}
	return f.tbl[0][f._funcName].apply(this,arguments);
}):(function f(){
	if(this.isTree()){
		if(this.isSimpleTreeMode()) return Math.max(this.lineHeight(),Window_Base._iconHeight);
		return this.lineHeight()<<1;
	}
	return f.ori.apply(this,arguments);
})),t,true).add('includes',function f(){
	return this.isTree() || f.ori.apply(this,arguments);
}).add('drawItem',function f(){
	return this.isTree()?this.drawItem_tree.apply(this,arguments):f.ori.apply(this,arguments);
}).add('drawItem_tree',function f(index){
	const skill = this._data[index];
	if(skill){
		const costHeight = this.costHeight();
		const rect=this.itemRect(index);
		rect.width-=this.textPadding();
		this.changePaintOpacity(!this._actor||this._actor.hasSkill(skill.id));
		this.drawItemName(skill, rect.x, rect.y, rect.width);
		if(!this.isSimpleTreeMode()) this.drawSkillCost(skill, rect.x, rect.y + costHeight, rect.width);
		this.changePaintOpacity(true);
	}
	return skill;
},undefined,true,false).add('costHeight',function f(){
	return this.lineHeight();
},undefined,true,false).add('makeItemList',function f(){
	this._maxCols=undefined;
	this._skillTree_learnMeta=undefined;
	return this.isTree()?this.makeItemList_tree():f.ori.apply(this,arguments);
}).add('makeItemList_tree',function f(){
	const rtv=this._data=[];
	if(!this._actor) return rtv;
	const arrv=this._skillTree=this._actor.getData().skillTree.slice();
	const classObj=this._actor.currentClass();
	if(classObj.skillTree && classObj.skillTree.length){
		if(arrv.length) arrv.push(undefined);
		arrv.concat_inplace(classObj.skillTree);
	}
	this._skillTree_learnMeta=[];
	if(!arrv||!arrv.length) return rtv;
	const ys=arrv.length;
	const xs=Math.max.apply(null,arrv.map(f.tbl[0]));
	this._maxCols=xs;
	for(let y=0;y!==ys;++y){
		for(let x=0;x!==xs;++x){
			const info=this.makeItemList_tree_getSkillInfo(arrv,x,y);
			rtv.push($dataSkills[info.id]||undefined);
			this._skillTree_learnMeta.push(info);
		}
	}
	return rtv;
},[
arr=>arr&&arr.length||0,
]).add('maxCols',function f(){
	return this._maxCols===undefined?f.tbl[0]:this._maxCols;
},[
4,
]).add('makeItemList_tree_getSkillInfo',function f(arrv,x,y){
	arrv=arrv||this._skillTree;
	if(!arrv) return;
	const info=arrv[y]&&arrv[y][x];
	let id=info,cond,consume,connect,condFailMsg;
	if(info instanceof Array){
		id=info[0];
		cond=(info[1] instanceof Array)?info[1][0]:info[1];
		consume=info[2];
		connect=(info[3] instanceof String)?eval(info[3]):info[3];
		condFailMsg=(info[1] instanceof Array)?info[1][1]:info[4];
	}
	return {id:id,cond:cond,consume:consume,connect:connect,condFailMsg:condFailMsg,};
}).add('skillTree_getPrevSkillIdx',function f(idx){
	const arrv=this._skillTree; if(!arrv) return;
	if(!this._prevSkills) this._prevSkills=[];
	if(this._prevSkills._data!==this._data){
		this._prevSkills._data=this._data;
		this._prevSkills.length=0;
		const numCols=arrv.length;
		const prevSkills=[]; for(let x=0,xs=prevSkills.length=numCols;x!==xs;++x) prevSkills[x]=undefined;
		for(let idx=0,y=0,ys=~~((this._data.length+numCols-1)/numCols)||0;y!==ys;++y){
			for(let x=0,xs=numCols;x!==xs;++x){
				this._prevSkills[idx]=prevSkills[x];
				const skill=$dataSkills[this.makeItemList_tree_getSkillInfo(arrv,x,y).id]||undefined;
				if(skill) prevSkills[x]=idx;
				++idx;
			}
		}
	}
	return this._prevSkills[idx];
}).add('isEnabled_ori',p.isEnabled).add('isEnabled',function f(item){
	return this.isTree()?this.isEnabled_tree.apply(this,arguments):this.isEnabled_ori.apply(this,arguments);
}).add('isEnabled_tree',function f(item){
	return !!item;
}).add('refresh',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.refreshStatusWindow();
	if(!this.isTree()) return rtv;
	// const padding1=this.standardPadding(); // already in-padding view
	const maxCols=this.maxCols();
	const maxRows=this.maxRows();
	const ctx=this.contents.context;
	const linkWidth=this.skillTree_linkWidth();
	const linkColor=this.skillTree_linkColor();
	ctx.save();
		ctx.lineWidth=linkWidth;
		ctx.strokeStyle=linkColor;
	for(let idx=this._data.length;idx-->0;){
		const item=this.item(idx);
		const info=this._skillTree_learnMeta[idx]; if(!info||!info.connect) continue;
		const infoU=this._skillTree_learnMeta[idx-maxCols];
		const infoD=this._skillTree_learnMeta[idx+maxCols];
		const infoL=this._skillTree_learnMeta[idx-1];
		const infoR=this._skillTree_learnMeta[idx+1];
		const rect=this.itemRect(idx);
		const rectU=this.itemRect(idx-maxCols);
		const rectD=this.itemRect(idx+maxCols);
		const rectL=this.itemRect(idx-1);
		const rectR=this.itemRect(idx+1);
		
		let mid,mid2,mid4,mid6,mid8;
{
		mid={
			x:((rect.x)+(rectR.x+rectR.width))>>1,
			y:((rect.y+(rect.height/2))+(rectR.y+(rectR.height/2)))>>1,
		};
		mid2={
			x:mid.x,
			y:((rect.y+rect.height)+(rectD.y))>>1,
		};
		mid4={
			x:rect.x+rect.width,
			y:mid.y,
		};
		mid6={
			x:rectR.x,
			y:mid.y,
		};
		mid8={
			x:mid.x,
			y:((rect.y)+(rectU.y+rectU.height))>>1,
		};
}
		if(info.connect&2){
			ctx.beginPath();
			ctx.moveTo(mid.x,mid.y);
			ctx.lineTo(mid2.x,mid2.y);
			ctx.stroke();
		}
		if(info.connect&4){
			ctx.beginPath();
			ctx.moveTo(mid.x,mid.y);
			if(!item && infoL.connect&16) ctx.lineTo(rect.x,rect.y+(rect.height>>1));
			ctx.lineTo(mid4.x,mid4.y);
			ctx.stroke();
		}
		if(info.connect&8){
			ctx.beginPath();
			ctx.moveTo(mid.x,mid.y);
			ctx.lineTo(mid8.x,mid8.y);
			ctx.stroke();
		}
		if(info.connect&16){
			ctx.beginPath();
			ctx.moveTo(mid.x,mid.y);
			ctx.lineTo(mid6.x,mid6.y);
			ctx.stroke();
		}
		
		
		continue;
if(0){
		const midU={x:(rectU.x+(rectU.width>>1)+rect.x+(rect.width>>1))>>1,y:(rectU.y+rectU.height+rect.y)>>1,};
		const midUL={x:(rectL.x+rectL.width+rect.x)>>1,y:midU.y};
		const midUR={x:(rect.x+rect.width+rectR.x)>>1,y:midU.y};
}
		if(info.connect&2){
			ctx.beginPath();
			ctx.moveTo(midU.x,midU.y);
			if(!item && infoD.connect&8) ctx.lineTo(rect.x+(rect.width>>1),rect.y+rect.height);
			else ctx.lineTo(rect.x+(rect.width>>1),rect.y);
			ctx.stroke();
		}
		if(info.connect&4&&idx%maxCols){
			ctx.beginPath();
			ctx.moveTo(midU.x,midU.y);
			ctx.lineTo(midUL.x,midUL.y);
			ctx.stroke();
		}
		if(info.connect&8){
			ctx.beginPath();
			ctx.moveTo(midU.x,midU.y);
			ctx.lineTo(rectU.x+(rectU.width>>1),rectU.y+rectU.height);
			ctx.stroke();
		}
		if(info.connect&16&&(idx+1)%maxCols){
			ctx.beginPath();
			ctx.moveTo(midU.x,midU.y);
			ctx.lineTo(midUR.x,midUR.y);
			ctx.stroke();
		}
	}
if(0)	for(let idx=this._data.length;idx--;){
		const item=this.item(idx); if(!item) continue;
		const prevIdx=this.skillTree_getPrevSkillIdx(idx);
		if(!(prevIdx>=0)) continue;
		const rect=this.itemRect(idx);
		const rect0=this.itemRect(prevIdx);
		ctx.beginPath();
		ctx.moveTo(rect0.x+(rect0.width>>1),rect0.y+rect0.height);
		ctx.lineTo(rect.x+(rect.width>>1),rect.y);
		ctx.stroke();
	}
	ctx.restore();
	this.refreshItemNameWindow();
	return rtv;
}).add('skillTree_linkWidth',function f(){
	return f.tbl[0];
},[
4,
]).add('skillTree_linkColor',function f(){
	return f.tbl[0];
},[
'rgba(234,234,234,0.75)',
]).add('update_active',(p.update_active===pp.update_active?(function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.update_switchSimpleTreeMode();
	return rtv;
}):(function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_switchSimpleTreeMode();
	return rtv;
})),t,true).addBase('update_switchSimpleTreeMode',function f(){
	if(!this.isTree()||!Input.isTriggered('control')) return;
	this._isSimpleTreeMode^=1;
	this.updateCursor();
	this.refresh();
	SoundManager.playCursor();
}).add('onSelect',(p.onSelect===pp.onSelect?(function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.refreshItemNameWindow();
	return rtv;
}):(function f(){
	const rtv=f.ori.apply(this,arguments);
	this.refreshItemNameWindow();
	return rtv;
})),t).addBase('refreshItemNameWindow',function f(){
	const wnd=this._itemNameWindow,item=this.item(); if(!wnd) return;
	if(this.isSimpleTreeMode() && this.isTree() && item){
		wnd.show();
		const textState={};
		wnd.setText(item.name,true,textState);
		if(!f.tbl[1]) f.tbl[1]=Math.ceil(wnd.textWidth(f.tbl[0]));
		const width=Math.max(textState.right,f.tbl[1]);
		if(textState && textState.right>=0) wnd.width=Math.ceil(width+wnd.textPadding()+(wnd.standardPadding()<<1));
		wnd._actor=this._actor; this.drawSkillCost.call(wnd,item,0,textState.y+textState.height,width);
		const rect=this.itemRect_curr(),c=this._windowContentsSprite;
		wnd.position.set(
			c.x+rect.x+rect.width,
			(c.y+rect.y).clamp(0,this.height-wnd.height)
		);
		if(wnd.x>=this.width-wnd.width) wnd.x=c.x+rect.x-wnd.width;
		if(wnd.x<0) wnd.x=0;
	}else wnd.hide();
},[
'000 000 000',
undefined,
]).addBase('refreshStatusWindow',function f(){
	if(!this.refreshStatusWindow_condOk()) return -1;
	this._statusWindow.refresh();
}).addBase('refreshStatusWindow_condOk',function f(){
	if(!this._statusWindow) return false;
	const lastIsTree=this._refreshStatusWindow_lastIsTree;
	const isTree=this._refreshStatusWindow_lastIsTree=this.isTree();
	if(!isTree&&isTree===lastIsTree) return false;
	return true;
});
} // Window_SkillList
const a=class Window_ItemActions extends Window_Command{
	initialize(x,y,chMethods){
		this._skillTree_bothUseAndLearn=chMethods._scene._skillTree_bothUseAndLearn;
		if(chMethods) for(let k in chMethods) this[k]=chMethods[k];
		return Window_Command.prototype.initialize.apply(this,arguments);
	}
};
window[a.name]=a;
new cfc(Scene_Skill.prototype).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._skillTree_showTree=$gameTemp._skillTree_showTree;
	this._skillTree_bothUseAndLearn=$gameTemp._skillTree_bothUseAndLearn;
	this._skillTree_skillTreeAtFirst=$gameTemp._skillTree_skillTreeAtFirst;
	return rtv;
}).add('create',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.create_tunePositions();
	this.create_itemNameWindow();
	this.create_itemActionWindow();
	this.create_tuneParams();
	this.create_addLink();
	return rtv;
}).addBase('create_itemNameWindow',function f(){
	const wnd=this._itemActionWindow=new Window_Help(2);
	wnd.hide();
	this._itemWindow.addChild(wnd);
	this._itemWindow._itemNameWindow=wnd;
}).add('create_itemActionWindow',function f(){
	this._isInitingItemActionWindow=true;
	const wnd=this._itemActionWindow=new Window_ItemActions(0,0,{_scene:this,makeCommandList:this.itemActionWindow_makeCommandList,});
	this._isInitingItemActionWindow=false;
	wnd.deactivate();
	wnd.hide();
	wnd.setHandler('ok',this.itemActionWindow_ok.bind(this));
	wnd.setHandler('learn',this.itemActionWindow_learn.bind(this));
	wnd.setHandler('cancel',this.itemActionWindow_cancel.bind(this));
	this._itemWindow.addChild(wnd);
}).addBase('create_tuneParams',function f(){
	this._skillTypeWindow._skillTree_skillTreeAtFirst=this._skillTree_skillTreeAtFirst;
	this._skillTypeWindow._skillTree_noSkillTree=!this._skillTree_showTree;
}).addBase('create_addLink',function f(){
	this._statusWindow._itemWindow=this._itemWindow;
	this._itemWindow._statusWindow=this._statusWindow;
}).add('itemActionWindow_makeCommandList',function f(){
	for(let x=0,arr=f.tbl[1],xs=arr.length;x!==xs;++x){
		if(!this._skillTree_bothUseAndLearn){
			if(this._scene._skillTypeWindow.currentExt()<0){
				if(arr[x][1]==='ok') continue;
			}else{
				if(arr[x][1]==='learn') continue;
			}
		}
		this.addCommand(arr[x][0],arr[x][1],arr[x][2]!=null?this._scene&&arr[x][2].constructor===String?this._scene[arr[x][2]]():arr[x][2]:true);
	}
},[
new Set([
'learn',
]), // 0: tree-only keys
[
[itemAct_use,"ok","itemActionWindow_canUse"],
[itemAct_learn,"learn","itemActionWindow_canLearn"],
[itemAct_cancel,"cancel"],
], // 1: cmds
]).add('itemActionWindow_hasSkill',function f(item){
	const w=this._itemWindow;
	return w._actor && w._actor._skills.uniqueHas(item&&item.id);
}).add('itemActionWindow_canUse',function f(idx){
	const w=this._itemWindow;
	const item=w.item(idx);
	return this.itemActionWindow_hasSkill(item) && w._actor.canUse(item);
}).add('itemActionWindow_canLearn',function f(idx,ignoreIsTree){
	const w=this._itemWindow;
	if(!ignoreIsTree && !w.isTree()) return false;
	if(idx===undefined) idx=w.index();
	const prevIdx=w.skillTree_getPrevSkillIdx(idx);
	const item=w.item(idx);
	const cond=w._skillTree_learnMeta[idx].cond;
	let condOk=true;
	const a=w._actor;
	const self=a;
	const actor=a;
	{ const w=undefined; {
		const res=eval(cond&&(cond instanceof Array)?cond[0]:cond); // "condJs" or ["condJs","condFailMsg"]
		condOk=res;
	} }
	return item && w._actor && (
		condOk ||
		(condOk==null&&( prevIdx===undefined || !w.item(prevIdx) || this.itemActionWindow_hasSkill(w.item(prevIdx)) ))
	) && !this.itemActionWindow_hasSkill(item);
}).add('itemActionWindow_ok',function f(){
	this.actor().setLastMenuSkill(this.item());
	this.determineItem();
}).add('itemActionWindow_learn',function f(idx){
	const w=this._itemWindow;
	if(idx===undefined) idx=w.index();
	const item=w.item(idx);
	const a=w._actor;
	const self=a;
	const actor=a;
	if(item && a){
		a.learnSkill(item.id);
		const consume=w._skillTree_learnMeta[idx].consume;
		if(consume){ eval(consume); }
		this.refreshInfoWindows();
	}
	this._itemActionWindow.activate();
}).add('itemActionWindow_cancel',function f(){
	this._itemActionWindow.deactivate();
	this._itemActionWindow.hide();
	this._itemWindow.activate();
}).add('itemActionWindow_updatePlacement',function f(){
	const iw=this._itemWindow;
	const iaw=this._itemActionWindow;
	const rect=iw.itemRect(iw.index());
	const newLoc={x:rect.x,y:rect.y};
	newLoc.x=rect.x;
	const dx=newLoc.x+iaw.width-iw.contentsWidth(); if(0<dx) newLoc.x-=dx;
	newLoc.y=rect.y+rect.height;
	const dy=newLoc.y+iaw.height-iw.contentsHeight(); if(0<dy) newLoc.y=rect.y-iaw.height;
	iaw.position.set(newLoc.x+iw._padding,newLoc.y+iw._padding);
}).add('onActorCancel',function f(){
	this._actorWindow.deactivate();
	this._actorWindow.hide();
	this._itemActionWindow.activate();
},undefined,false,true).add('onItemOk',function f(){
	this._itemWindow.deactivate();
	this.itemActionWindow_updatePlacement();
	this._itemActionWindow.show();
	this._itemActionWindow.activate();
},undefined,false,true).addBase('refreshInfoWindows',function f(){
	this._itemWindow.refresh(); // refresh others
});


new cfc(Window_SkillStatus.prototype).add('refresh_hasActor',function f(){
	const rtv=f.ori.apply(this,arguments);
	if(f.tbl[1]._showSkillPoint) this.drawSkillPoint();
	return rtv;
},t=[
undefined,
params, // 1: plugin params
]).addBase('drawSkillPoint',function f(){
	const a=this._actor,actor=a;
	if(!this.drawSkillPoint_condOk(a)) return -1;
	this.drawText(
		eval(f.tbl[1]._skillPointEvalText),
		f.tbl[1]._skillPointTextX,
		f.tbl[1]._skillPointTextY,
		f.tbl[1]._skillPointTotalWidth,
	);
},t).addBase('drawSkillPoint_condOk',function f(actor){
	if(!actor) return false;
	if(!this._itemWindow||!this._itemWindow.isTree()) return false;
	return true;
});


new cfc(Game_Actor.prototype).addBase('skillTreePoint_get',function f(){
	return this._skillTreePoint-0||0;
}).addBase('skillTreePoint_set',function f(val){
	return this._skillTreePoint=val;
}).addBase('skillTreePoint_gain',function f(val){
	const rtv=this.skillTreePoint_get()+val;
	this.skillTreePoint_set(rtv);
	return rtv;
});


new cfc(Game_Temp.prototype).addBase('openSkillTree',function f(){
	//this._skillTree_skillTreeAtFirst=false;
	//this._skillTree_bothUseAndLearn=false;
	this._skillTree_showTree=true;
	SceneManager.push(Scene_Skill);
	this._skillTree_showTree=undefined;
});


})();
