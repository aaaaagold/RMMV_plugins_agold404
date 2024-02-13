"use strict";
/*:
 * @plugindesc 數字板
 * @author agold404
 *
 * @help SceneManager.showNumBoard(id,num,option)
 * SceneManager.closeNumBoard(id)
 * 
 * option:
 * {
 *  width: a number or leave undefined,
 *  height: a number or leave undefined,
 *  loc: LU|UL|UR|RU|DR|RD|LD|DL or leave undefined
 * }
 *
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r;

{ const p=SceneManager;
p._numBoard_map=function(){
	return this._scene._umBoards||(this._scene._umBoards=new Map());
};
p._numBoard_gen=function(w,h){
	const rtv=new Window_Help(2);
	if(isNaN(w)) w=Graphics._boxWidth>>1;
	rtv.width=w;
	if(!isNaN(h)) rtv.height=h;
	const fs=~~(rtv.standardFontSize()*1.25);
	rtv.standardFontSize=()=>fs;
	rtv._dy=16;
	return rtv;
};
p._numBoard_loc=function(bd,loc){
	switch(loc){
	case "DR":
	case "RD":
		bd.x=Graphics._boxWidth-bd.width;
		bd.y=Graphics._boxHeight-bd.height;
	break;
	default:
	case "UL":
	case "LU":
		bd.x=0;
		bd.y=0;
	break;
	case "DL":
	case "LD":
		bd.x=0;
		bd.y=Graphics._boxHeight-bd.height;
	break;
	case "UR":
	case "RU":
		bd.x=Graphics._boxWidth-bd.width;
		bd.y=0;
	break;
	}
};
p._numBoard_num=function(bd,num,title,color){
	if(bd._num!==num||bd._color!==color||bd._title!==title){
		bd._num=num;
		bd._color=color;
		bd._title=title;
		const isNeg=num<0;
		if(isNeg) num=-num;
		bd.setText(title);
		if(bd._dmg) bd.removeChild(bd._dmg);
		bd.addChild(bd._dmg=new Sprite_Damage());
		if(isNaN(bd._maxShiftWidth)) bd._dmg.y=50; else bd._dmg.y=71; // ????
		bd._dmg.createDigits(color,num);
		const W=bd._dmg.digitWidth();
		const txtsh=isNaN(bd._maxShiftWidth)?bd.contentsWidth()-W*bd._dmg.children.length-(W>>1):bd._maxShiftWidth+bd.contentsWidth(); // ????
		for(let arr=bd._dmg.children,sh=txtsh+32+(W*isNeg)+((arr.length*W)>>1),x=0;x!==arr.length;++x) arr[x].x+=sh;
		//bd.setText(isNeg?"-":"");//(isNeg?"\n￣":"");
	}
	bd._dmg._duration=1<<30;
};
p.showNumBoard=function(id,num,opt){
	num=num-0||0;
	opt=opt||{};
	const sc=this._scene; if(!sc) return;
	let tmp;
	const map=this._numBoard_map();
	tmp=map.get(id); if(!tmp){
		map.set(id,tmp=this._numBoard_gen(opt.width,opt.height));
		sc.addChild(tmp);
	}
	const bd=tmp;
	const title=opt.title===undefined?"":opt.title+"";
	this._numBoard_num(bd,num,title,opt.color&3);
	this._numBoard_loc(bd,opt.loc);
};
p.closeNumBoard=function(id){
	const sc=this._scene; if(!sc) return;
	const bd=this._numBoard_map().get(id);
	this._numBoard_map().delete(id);
	if(!bd) return;
	const dmg=bd._dmg;
	const dmgp=dmg&&dmg.parent;
	if(dmgp) dmgp.removeChild(dmg);
	const p=bd.parent;
	if(p) p.removeChild(bd);
};
}

})();
