"use strict";
/*:
 * @plugindesc concatenate several choices (event) command (Show Choices)
 * @author agold404
 * @help 1-line comment: (at-sign)CONCAT between two concequent "Show Choices"
 * default choice setting will be set to:
 *  1. the first Show Choices cmds' default choice settings, if the rest are all None.
 *  2. the first Show Choices cmds' default choice settings, which is not None.
 * cancel type setting will be set to:
 *  1. the first Show Choices cmds' cancel type settings, if the rest are all either Branch or Disallow.
 *  2. the first Show Choices cmds' cancel type settings, which is not Branch nor Disallow.
 * 
 * @CONCAT
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

/*
## build-in flow ##
when choose:
	set ($gameMessage) this._branch[this._indent] = n;
		// cancel: n=-2 ; others: from 0
*/

new cfc(Game_Interpreter.prototype).add('setupChoices',function f(params){
	this._setupChoices_concat(arguments);
	return f.ori.apply(this,arguments);
}).addBase('_setupChoices_concat_findCmdEnd',function f(strt,indent,setCmd402Param0From){
	// no error check
	// setCmd402Param0From:
	//	Expected to be int.
	//	if >=0, set following cmd402's param0 from 'setCmd402Param0From'.
	// 	i.e. the first encounting cmd402's param0 will be set to setCmd402Param0From, the second will be set to setCmd402Param0From+1, and so on.
	// cmd404 === cmd_ShowChoices's end
	let rtv=strt;
	for(const arr=this._list;arr[rtv]&&(indent<arr[rtv].indent||404!==arr[rtv].code);++rtv){
		if(setCmd402Param0From>=0 && indent===arr[rtv].indent && arr[rtv].code===402){
			arr[rtv].parameters[0]=setCmd402Param0From++;
		}
	}
	return rtv;
}).addBase('_setupChoices_concat',function f(args){
	// suppose params=args[0] and is the cmd object's parameters in '$dataMap'
	let b=this._index;
	const strt=b,indent=this._indent,cmds=this._list;
	if(cmds[strt]._setupChoices_concat_isDetected) return; // another detecting guard: not modifying again
	
	let params=args[0];
if(0){
	// prevent modifying oringinal data
	args[0]=params=params.slice();
	params[0]=params[0].slice();
}
	let cancelChoice=params[1];
	let defaultChoice=params[2];
	
	const setIndentTo=indent+1; // Math.max(999999,this._indent+99999); // match the behavior of 'skipBranch'
	for(let choicesCnt;;){
		b=this._setupChoices_concat_findCmdEnd(b,indent,choicesCnt)+1;
		//console.log(b); // debug
		if(!cmds[b-1] || cmds[b-1].indent!==indent || !cmds[b] || cmds[b].code!==108 || !cmds[b].parameters || cmds[b].parameters[0]!==f.tbl[0] || !cmds[b+1] || cmds[b+1].code!==102) break;
		choicesCnt=params[0].length;
		++b;
		cmds[b].parameters[0].forEach(f.tbl[1],params[0]);
		// modify so that it won't be detected again.
		{
			// [... cmd0, chEnd, comment, ...]
			//                   ^b
			for(let x=3;x--;){
				cmds[b-x].code=0;
				cmds[b-x].indent=setIndentTo;
			}
		}
		//set first options
		// set cancel if needed
		if(!(cancelChoice>=0)&&cmds[b].parameters[1]>=0) cancelChoice=cmds[b].parameters[1]-(-choicesCnt);
		// set default if needed
		if(!(defaultChoice>=0)&&cmds[b].parameters[2]>=0) defaultChoice=cmds[b].parameters[2]-(-choicesCnt);
	}
	params[1]=cancelChoice;
	params[2]=defaultChoice;
	cmds[strt]._setupChoices_concat_isDetected=true; // another detecting guard
	return b;
},[
"@CONCAT", // 0: marker
function(chLabel){ this.push(chLabel); }, // 1: cmd102.param0.forEach
]);

})();
