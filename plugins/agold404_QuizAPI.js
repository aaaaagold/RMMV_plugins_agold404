"use strict";
/*:
 * @plugindesc easy APIs to show a multiple-choices quiz from a pre-defined quizzes set
 * @author agold404
 * 
 * 
 * @param QuizzesSetJsonGetter
 * @type note
 * @text quizzes set
 * @desc the text here will be parsed by `eval()`. expected format is as default example
 * @default "[\n {\n  id:'unique id',\n  description:'quiz description',\n  answer:'the answer',\n  otherChoices:['other choice 1','other choice 2','other choice 3',],\n },\n]"
 * 
 * 
 * @help .
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_QuizAPI";
const params=PluginManager.parameters(pluginName)||{};
params._quizzesSetJsonGetter=JSON.parse(params.QuizzesSetJsonGetter||"null");
params._quizzesSetJsonParsed=undefined;


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
function(quizData){
	return quizData&&!this.quizApi_isQuizBanned(quizData.id);
}, // 3: filter out banned quizzes
function f(choices,n){
	const choiceData=choices[n];
	this.quizApi_setLastQuizCancelled(false).quizApi_setLastQuizCorrectness(false);
	if(!choiceData) this.quizApi_setLastQuizCancelled(true);
	else this.quizApi_setLastQuizCorrectness(choiceData.isAnswer);
}, // 4: choices callback to be bind.
];


new cfc(Scene_Boot.prototype).
add('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.quizApi_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('quizApi_evalSetting',function f(){
	if(f.tbl[1]._quizzesSetJsonParsed) return;
	f.tbl[1]._quizzesSetJsonParsed=EVAL.call(this,f.tbl[1]._quizzesSetJsonGetter);
},t).
getP;


new cfc(Game_Party.prototype).
addBase('_quizApi_getBanQuizCont',function f(){
	let rtv=this._quizApi_banQuizCont; if(!rtv) rtv=this._quizApi_banQuizCont=[];
	return rtv;
}).
addBase('quizApi_banQuiz',function f(quizId){
	const cont=this._quizApi_getBanQuizCont();
	cont.uniquePush(quizId);
	return this;
}).
addBase('quizApi_debanQuiz',function f(quizId){
	const cont=this._quizApi_getBanQuizCont();
	cont.uniquePop(quizId);
	return this;
}).
addBase('quizApi_debanAllQuiz',function f(){
	const cont=this._quizApi_getBanQuizCont();
	cont.uniqueClear();
	return this;
}).
addBase('quizApi_isQuizBanned',function f(quizId){
	const cont=this._quizApi_getBanQuizCont();
	return cont.uniqueHas(quizId);
}).
addBase('quizApi_getQuiz',function f(){
	const allQuizzes=f.tbl[1]._quizzesSetJsonParsed;
	const quizCandidates=allQuizzes&&allQuizzes.filter(f.tbl[3],this);
	return quizCandidates&&quizCandidates.rnd1();
},t).
getP;


new cfc(Game_Interpreter.prototype).
addBase('quizApi_getLastQuizId',function f(){
	return this._quizApi_quizId;
}).
addBase('quizApi_setLastQuizId',function f(quizId){
	this._quizApi_quizId=quizId;
	return this;
}).
addBase('quizApi_getLastQuizExists',function f(){
	return this.quizApi_getLastQuizId()!=null;
}).
addBase('quizApi_getLastQuizCancelled',function f(){
	return this._quizApi_quizCancelled;
}).
addBase('quizApi_setLastQuizCancelled',function f(cancelled){
	this._quizApi_quizCancelled=!!cancelled;
	return this;
}).
addBase('quizApi_getLastQuizCorrectness',function f(){
	return this._quizApi_quizCorrect;
}).
addBase('quizApi_setLastQuizCorrectness',function f(correctness){
	this._quizApi_quizCorrect=!!correctness;
	return this;
}).
addBase('quizApi_startQuiz',function f(quizData){
	if(!quizData) quizData=$gameParty.quizApi_getQuiz();
	this.quizApi_setLastQuizId(quizData&&quizData.id);
	if(!quizData) return; // no quiz
	this.quizApi_setLastQuizCancelled(false).quizApi_setLastQuizCorrectness(false);
	const choices=[
		{text:quizData.answer,isAnswer:true,},
	];
	for(let arr=quizData.otherChoices.slice(),_=arr.length;_--;){
		const idx=~~(Math.random()*arr.length);
		choices.push({text:arr[idx],isAnswer:false});
		arr[idx]=arr[arr.length-1];
		arr.pop();
	}
	{ const idx=~~(Math.random()*choices.length);
	const tmp=choices[0];
	choices[0]=choices[idx];
	choices[idx]=tmp;
	}
	const callback=f.tbl[4].bind(this,choices);
	$gameMessage.add(quizData.description);
	$gameMessage.setChoices(choices.map(info=>info.text),-1,-2);
	$gameMessage.setChoiceCallback(callback);
	this.setWaitMode('message');
	return quizData;
},t).
getP;


})();

