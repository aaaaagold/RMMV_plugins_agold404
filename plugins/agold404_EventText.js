"use strict";
/*:
 * @plugindesc display texts on events
 * @author agold404
 * @help starting with (at-sign)EVENTTEXT in comment (event command) without leading and tailing spaces
 * the following lines will be the texts displayed on the event
 * 
 * the next (at-sign)EVENTTEXT in comment (event command) in the same event page will be the next lines of texts
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(DataManager).add('onLoad_after_map',function f(obj){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_after_map_setEventTexts(obj);
	return rtv;
}).add('onLoad_after_map_setEventTexts',function f(obj){
	obj.events.forEach(f.tbl[0]);
},t=[
evtd=>{ if(!evtd) return;
	for(let p=0,pgv=evtd.pages,pe=pgv.length;p!==pe;++p){
		const txtv=pgv[p].textv=[];
		let isTextComment=false;
		for(let c=0,cmdv=pgv[p].list,ce=cmdv.length;c!==ce;++c){
			const cmd=cmdv[c];
			const code=cmd.code;
			if(isTextComment){
				if(code===108||code===408) txtv.push(cmd.parameters[0]);
				else isTextComment=false;
			}else if(code===108 && cmd.parameters[0]==="@EVENTTEXT") isTextComment=true;
		}
	}
},
]);

new cfc(Game_Character.prototype).add('getTextv',function f(){
	return this._textv;
}).add('setTextv',function f(arr,isAutoUpdateSprite){
	this._textv=arr;
	if(isAutoUpdateSprite){
		const sp=SceneManager.getSprite(this);
		if(sp) sp.setChrTextv(arr);
	}
	return this;
});

new cfc(Sprite_Character.prototype).add('setCharacter',function f(chr){
	const rtv=f.ori.apply(this,arguments);
	this.setChrTextv(chr.getTextv());
	return rtv;
}).add('setChrTextv',function f(arr){
	if(arr){
		arr=arr.slice(); arr.push(""); // take use of y
	}else arr=f.tbl[0];
	return this.setChrTxt(arr.join('\n'));
},[
[], // 0: empty textv
]).add('setChrTxt',function f(txt){
	let wt=this._textWnd;
	if(!wt){
		const c=new PIXI.Container();
		c.addChild(wt=this._textWnd=new Window_Text(0,0,1,1));
		this.addChild(c);
	}
	// const stdpad=wt.standardPadding(); // is 0
	const txtpad=wt.textPadding(),textState={};
	const measure=wt.drawTextEx(txt,0,0,undefined,undefined,textState);
	
	const width=Math.max(0,1+~~textState.right);
	const widthp=width+(txtpad<<1);
	const w=wt.width=widthp;
	const h=wt.height=textState.y;
	wt.position.set(-(w>>>1),-h);
	wt.createContents();
	wt.drawTextEx(txt,txtpad,0);
	//console.log(measure,textState); // debug
	return this;
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updateText();
	return rtv;
}).add('updateText',function f(){
	const p=this._textWnd&&this._textWnd.parent; if(!p) return;
	p.y=-this.height*this.anchor.y;
});

new cfc(Game_Event.prototype).add('setupPageSettings',function f(){
	const page=f.ori.apply(this,arguments);
	this.setTextv(page.textv&&page.textv.length?page.textv:undefined,true);
	return page;
});

})();
