"use strict";
/*:
 * @plugindesc example quests
 * @author agold404
 * 
 * 
 * @help example quests using QuestAPI
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const QuestClassId=0;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"questExample";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
];


const questApis=DataManager._questApis;  // DO NOT EDIT

if(window.isTest()){
if(!questApis){  // DO NOT EDIT
	const msg='[ERROR] window._questApis not detected.\n place this plugin AFTER agold404_QuestAPI.js';
	alert(msg);
	throw new Error(msg);
}  // DO NOT EDIT
// window.isTest()
}

const detailTemplateIdxs=[
questApis.pushDetail(questApis.dupDetail(0)),
];

// using questApis.getDetail(detailTemplateIdxs[x]) to get the detail template if you need to change it or access it


const arr=questApis._questGeneratorsByQuestClassId[QuestClassId]=[
{
	id:undefined,
	getRewards:function f(questInfo,givenItems){
		$gameParty.members()[0].gainExp(1);
	},
	getBonus:function f(questInfo,givenItems){
		if(Math.random()<0.5) $gameParty.members()[0].gainExp(2);
	},
	generate:function f(){
		const questInfo={
			cid:QuestClassId,       // DO NOT EDIT
			qid:this.id,            // DO NOT EDIT
			name:"example quest",
			details:[],             // DO NOT CHANGE OBJECT TYPE
			description:" /* description here */ ",
		};
		const detailTemplate=questApis.getDetail(detailTemplateIdxs[0]);
		const details=questInfo.details;
		details.push(detailTemplate.generate("requirement 1: nothing needed"));
		{ const cnt=2+~~(Math.random()*2);
		details.push(detailTemplate.generate("requirement 2: hunt enemy1 *"+cnt,{
			huntingList:[1,],
			requireCnt:cnt,
		}));
		}
		{ const cnt=2+~~(Math.random()*2);
		details.push(detailTemplate.generate("requirement 3: hunt enemy with questTag = exampleTag *"+cnt,{
			huntingTagList:["exampleTag",],
			requireCnt:cnt,
		}));
		}
		return questInfo;
	},
},
];
for(let x=arr.length;x--;) arr[x].id=x;


})();
