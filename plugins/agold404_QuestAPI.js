"use strict";
/*:
 * @plugindesc api for quests
 * @author agold404
 * 
 * 
 * @help .
 * 
 * <questTags:tag1,tag2,...>
 * 
 * 
 * use `DataManager._questApis.getAvailQuestGenerators([ classId, classId, ... ]).rnd1();` to get a questInfo
 * use `$gamePlayer.questAPI_addQuest( the above questInfo );` to add a quest to be quest
 * use `$gamePlayer.questAPI_getCont();` to get the ongoing quests container
 * use `$gamePlayer.questAPI_completeQuestByIdx( idx );` to complete a quest. return true if it is completable.
 * use `$gamePlayer.questAPI_delQuestByIdx( idx );` to delete an ongoing quest.
 * use `$gamePlayer.questAPI_isQuestCompletedByIdx( idx );` to investigate if a quest can be completed.
 * 
 * for quest info, please refer to agold404_QuestAPI_exampleQuest.js
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_QuestAPI";
const params=PluginManager.parameters(pluginName)||{};


const root=DataManager._questApis=DataManager._questApis||({
_details:[],
pushDetail:function f(detailInfo){
	const idx=this._details.length;
	detailInfo=Object.assign({},detailInfo);
	detailInfo.detailId=idx;
	this._details.push(detailInfo);
	return idx;
},
dupDetail:function f(detailIdx){
	if(!this._details[detailIdx]) return;
	return Object.assign({},this._details[detailIdx]);
},
getDetail:function f(detailIdx){
	return this._details[detailIdx];
},
_questGeneratorsByQuestClassId:[],
getQuestTemplate:function f(cid,qid){
	const arr=this._questGeneratorsByQuestClassId[cid];
	return arr&&arr[qid];
},
getAvailQuestGenerators:function f(availQuestClassIds){
	// availQuestClassIds is expected to be an array. if availQuestClassIds is false-like, return all
	const rtv=[];
	const arr=availQuestClassIds||this._questGeneratorsByQuestClassId;
	for(let x=arr.length;x--;){
		const garr=this._questGeneratorsByQuestClassId[availQuestClassIds?arr[x]:x]; // if availQuestClassIds, arr===availQuestClassIds
		if(garr) for(let i=garr.length;i--;) rtv.push(garr[i].generate.bind(garr[i]));
	}
	return rtv;
},
});


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
root, // 3: QuestApi
];


new cfc(Scene_Boot.prototype).
addBase('modAll1',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const tags=[];
	if(meta.questTags) tags.uniquePushContainer(meta.questTags.split(','));
	dataobj.questTags=tags;
}).
getP;


const details=root._details;
details[0]={
generate:function f(displayedText,additionalInfo){
	return ({
		display:displayedText,
		additionalInfo:Object.assign(({
			itemList:[], // [ ['i',id], ... ]
			itemTagList:[], // [ "quest tag value", ... ]
			huntingList:[], // [ enemyId, ... ]
			huntingTagList:[], // [ "quest tag value", ... ]
			requireCnt:0,
			progressCnt:0,
		}),additionalInfo), // progressCnt++ when one of conditions matches
		detailId:0, // matches the idx in the arr ( `details` )
	});
},	
updateHunting:function f(detail){
	// called after battle
	const huntingSet=new Set(detail.additionalInfo.huntingList);
	for(let arr=$gameTroop.members(),x=arr.length;x--;){
		const btlr=arr[x];
		const dataobj=DataManager.duplicatedDataobj_getSrc(btlr.getData());
		const btlrId=dataobj.id;
		if(huntingSet.has(btlrId)){
			++detail.additionalInfo.progressCnt;
			continue; // 1 enemy counts once in a detail at most
		}
		const tagList=detail.additionalInfo.huntingTagList;
		for(let i=tagList&&tagList.length;i--;){
			const tag=tagList[i];
			if(!dataobj.questTags.uniqueHas(tag)) continue;
			++detail.additionalInfo.progressCnt;
			break; // 1 enemy counts once in a detail at most
		}
	}
},	
filterItems:function f(detail,item){
	item=DataManager.duplicatedDataobj_getSrc(item);
	const itemCont=$gameParty.itemContainer(item); if(!itemCont) return false;
	const mapping={i:$dataItems,w:$dataWeapons,a:$dataArmors,};
	const itemList=detail.additionalInfo.itemList;
	for(let x=itemList&&itemList.length;x--;){
		const itemNeeded=mapping[itemList[x][0]][itemList[x][1]];
		if(item===itemNeeded) return true;
	}
	const itemTagList=detail.additionalInfo.itemTagList;
	for(let x=itemTagList&&itemTagList.length;x--;){
		const tag=itemTagList[x][0];
		if(item.questTags.uniqueHas(tag)) return true;
	}
	return false;
},	
check:function f(detail,givenItems){
	if(detail.requireCnt&&detail.additionalInfo.progressCnt<detail.additionalInfo.requireCnt) return false;
	givenItems=givenItems||[]; // givenItems=[ [item,cnt], ... ]
	let rtv=true;
	// chk item
	if(rtv){
		let cnt=0;
		const itemNeededSet=new Set();
		{ const itemList=detail.additionalInfo.itemList;
		const mapping={i:$dataItems,w:$dataWeapons,a:$dataArmors,};
		for(let arr=itemList,x=arr.length;x--;) itemNeededSet.add(mapping[itemList[x][0]][itemList[x][1]]||null);
		itemNeededSet.delete(null);
		}
		const itemTagList=detail.additionalInfo.itemTagList;
		for(let arr=givenItems,x=arr.length;x--;){
			const item=arr[x][0];
			if(itemNeededSet.has(item)){
				++cnt;
				continue;
			}
			for(let x=itemTagList&&itemTagList.length;x--;){
				const tag=itemTagList[x];
				if(item.questTags.uniqueHas(tag)){
					++cnt;
					break;
				}
			}
		}
		if(!(cnt+detail.additionalInfo.progressCnt>=detail.additionalInfo.requireCnt)) rtv=false;
	}
	//
	return rtv;
},	
getProgressText:function f(detail,givenItems){
	const rtv=[];
	rtv.push(detail.display);
	if(0<detail.additionalInfo.requireCnt) rtv.push(detail.additionalInfo.progressCnt+" / "+detail.additionalInfo.requireCnt);
	rtv.push(details[detail.detailId].check(detail,givenItems)?"completed":"ongoing");
	return rtv;
},	
complete:function f(detail,givenItems){
	// TODO: $gameParty.loseItem() , maybe
},	
}; // pre-defined example


new cfc(Game_Player.prototype).
addBase('questAPI_getCont',function f(){
	let rtv=this._ongoingQuests; if(!rtv) rtv=this._ongoingQuests=[];
	return rtv;
}).
addBase('questAPI_getOngoingQuestCnt',function f(){
	return this.questAPI_getCont().length;
}).
addBase('questAPI_clearAll',function f(){
	const cont=this.questAPI_getCont();
	cont.length=0;
	return this;
}).
addBase('questAPI_delQuestByIdx',function f(idx){
	const cont=this.questAPI_getCont();
	return cont.splice(idx,1);
}).
addBase('questAPI_addQuest',function f(quest){
	if(!quest) return;
	const cont=this.questAPI_getCont();
	cont.push(quest);
	return this;
}).
addBase('questAPI_isQuestCompletedByIdx',function f(idx,givingItems){
	const cont=this.questAPI_getCont();
	const quest=cont[idx]; if(!quest) return false;
	const details=quest.details;
	let rtv=true;
	for(let d=details.length;d--;){
		const detailId=details[d].detailId;
		if(!f.tbl[3].getDetail(detailId).check(details[d],givingItems)){
			rtv=false;
			break;
		}
	}
	return rtv;
},t).
addBase('questAPI_getProgressTexts',function f(idx,givingItems){
	const rtv=[];
	const cont=this.questAPI_getCont();
	const quest=cont[idx]; if(!quest) return;
	const details=quest.details;
	for(let d=0,ds=details.length;d<ds;++d){
		const detailId=details[d].detailId;
		rtv.push(f.tbl[3].getDetail(detailId).getProgressText(details[d],givingItems));
	}
	return rtv;
},t).
addBase('questAPI_completeQuestByIdx',function f(idx,givingItems){
	if(!this.questAPI_isQuestCompletedByIdx.apply(this,arguments)) return false;
	const cont=this.questAPI_getCont();
	const quest=cont[idx]; if(!quest) return false;
	const details=quest.details;
	for(let d=details.length;d--;){
		const detailId=details[d].detailId;
		!f.tbl[3].getDetail(detailId).complete(details[d],givingItems);
	}
	const cid=quest.cid;
	const qid=quest.qid;
	const questTemplate=f.tbl[3].getQuestTemplate(cid,qid);
	if(questTemplate.getRewards) questTemplate.getRewards(quest,givingItems);
	if(questTemplate.getBonus) questTemplate.getBonus(quest,givingItems);
	this.questAPI_delQuestByIdx(idx);
	return true;
},t).
getP;

new cfc(BattleManager).
add('endBattle',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.questAPI_endBattle.apply(this,arguments);
	return rtv;
}).
addBase('questAPI_endBattle',function f(){
	const cont=$gamePlayer.questAPI_getCont();
	for(let q=cont.length;q--;){
		const quest=cont[q];
		const details=quest.details;
		for(let d=details.length;d--;){
			const detailId=details[d].detailId;
			f.tbl[3].getDetail(detailId).updateHunting(details[d]);
		}
	}
},t).
getP;


})();
