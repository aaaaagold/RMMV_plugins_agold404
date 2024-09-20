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
 *  ...
 * ]>
 * 
 * This plugin can be renamed as you want.
 */

(()=>{


const itemAct_use="使用";
const itemAct_learn="學習";
const itemAct_cancel="取消";


new cfc(Scene_Boot.prototype).add('start_before',function f(){
	this.start_before_skillTree();
	return f.ori.apply(this,arguments);
}).add('start_before_skillTree',function f(idx){
	if(idx===undefined) $dataActors.forEach(f.tbl[0],this);
	else if($dataActors[idx]) f.tbl[0].call(this,$dataActors[idx]);
},[
dataobj=>{ const meta=dataobj&&dataobj.meta; if(!meta) return;
	dataobj.skillTree=JSON.parse(meta.skillTree);
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
		(itemListPrefix=itemListPrefix||f.tbl[0]).forEach(f.tbl[1],this);
		this._actor.addedSkillTypes().sort(cmpFunc_num).forEach(f.tbl[2],this);
	}
},[
[
["技能樹",'skill',true,-1],
], // 0: default itemListPrefix
function(prefixItem){ this.addCommand.apply(this,prefixItem); }, // 1: forEach prefixItem this.addCommand
function(stypeId){this.addCommand($dataSystem.skillTypes[stypeId], 'skill', true, stypeId); }, // 2: forEach skillType this.addCommand
]);
{ const p=Window_SkillList.prototype;
new cfc(p).add('isTree',function f(){
	return !(this._stypeId>=0);
}).add('itemSpacingY',function f(){
	return this.isTree()?this.lineHeight():0;
},undefined,false,true).add('itemHeight',function f(){
	return this.lineHeight()<<!!this.isTree();
},undefined,false,true).add('includes',function f(){
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
		this.drawSkillCost(skill, rect.x, rect.y + costHeight, rect.width);
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
	const arrv=this._skillTree=this._actor.getData().skillTree;
	this._skillTree_learnMeta=[];
	this._maxCols=arrv.length;
	if(!arrv||!arrv.length) return rtv;
	const ys=Math.max.apply(null,arrv.map(f.tbl[0]));
	for(let y=0;y!==ys;++y){
		for(let x=0,xs=arrv.length;x!==xs;++x){
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
	const info=arrv[x]&&arrv[x][y];
	let id=info,cond,consume;
	if(info instanceof Array){
		id=info[0];
		cond=info[1];
		consume=info[2];
	}
	return {id:id,cond:cond,consume:consume,};
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
	if(!this.isTree()) return rtv;
	// const padding1=this.standardPadding(); // already in-padding view
	const ctx=this.contents.context;
	const linkWidth=this.skillTree_linkWidth();
	const linkColor=this.skillTree_linkColor();
	ctx.save();
		ctx.lineWidth=linkWidth;
		ctx.strokeStyle=linkColor;
	for(let idx=this._data.length;idx--;){
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
	return rtv;
}).add('skillTree_linkWidth',function f(){
	return f.tbl[0];
},[
4,
]).add('skillTree_linkColor',function f(){
	return f.tbl[0];
},[
'rgba(234,234,234,0.75)',
]);
} // Window_SkillList
const a=class Window_ItemActions extends Window_Command{
	initialize(x,y,chMethods){
		if(chMethods) for(let k in chMethods) this[k]=chMethods[k];
		return Window_Command.prototype.initialize.apply(this,arguments);
	}
};
window[a.name]=a;
new cfc(Scene_Skill.prototype).add('create',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.create_tunePositions();
	this.create_itemActionWindow();
	return rtv;
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
}).add('itemActionWindow_makeCommandList',function f(){
	for(let x=0,arr=f.tbl[1],xs=arr.length;x!==xs;++x) this.addCommand(arr[x][0],arr[x][1],arr[x][2]!=null?this._scene&&arr[x][2].constructor===String?this._scene[arr[x][2]]():arr[x][2]:true);
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
	{
		const res=eval(cond&&(cond instanceof Array)?cond[0]:cond);
		condOk=res===undefined||res;
	}
	return condOk && item && w._actor && ( prevIdx===undefined || this.itemActionWindow_hasSkill(w.item(prevIdx)) ) && !this.itemActionWindow_hasSkill(item);
}).add('itemActionWindow_ok',function f(){
	this.actor().setLastMenuSkill(this.item());
	this.determineItem();
}).add('itemActionWindow_learn',function f(idx){
	const w=this._itemWindow;
	if(idx===undefined) idx=w.index();
	const item=w.item(idx);
	if(item && w._actor){
		w._actor.learnSkill(item.id);
		const consume=w._skillTree_learnMeta[idx].consume;
		if(consume){ eval(consume); }
		this._itemWindow.refresh();
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
},undefined,false,true);


})();
