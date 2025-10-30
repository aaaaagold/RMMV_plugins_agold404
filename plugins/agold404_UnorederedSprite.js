"use strict";
/*:
 * @plugindesc a sprite whose .children will not keep the order.
 * @author agold404
 * @help new Sprite_UnorderedChildren
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const a=function Sprite_UnorderedChildren(){
	this.initialize.apply(this,arguments);
};
a.ori=Sprite;
t=[
a.ori.prototype, // 0: prototype of parent class
{
updateChild:sp=>sp.update&&sp.update(),

}, // 1: update sub-funcs
];
window[a.name]=a;
const p=a.prototype=Object.create(t[0]);
p.constructor=a;
for(let ki=0,kv=['addChildAt','removeChildAt','setChildIndex','swapChildren',];ki!==kv.length;++ki){
k=kv[ki];
new cfc(p).add(k,function f(){
	console.warn('not supported: '+f.tbl[0]);
},[
k,
],false,true);
}
new cfc(p).
_addBaseIfNotOwn('initialize',t).
addBase('update',function f(){
	this.children.slice().forEach(f.tbl[1].updateChild);
},t).add('removeChild',function f(c){
	const argumentsLength=arguments.length;
	if(1<argumentsLength) for(let i=0;i!==argumentsLength;++i) this.removeChild(arguments[i]);
	else{
		if(!c) return null;
		// not used
		//var index = this.children.indexOf(child);
		//if(index === -1) return null;
		if(this.children.uniquePop(c)===undefined) return null;
		
		c.parent=null;
		// ensure child transform will be recalculated
		c.transform._parentID=-1;
		
		// ensure bounds will be recalculated
		this._boundsID++;
		
		//this.onChildrenChange(index); // empty func
		c.emit('removed',this);
	}
	
        return c;
},undefined,false,true).
addBase('addChild',function f(c){
	const argumentsLength=arguments.length;
	if(1<argumentsLength) for(let i=0;i!==argumentsLength;++i) this.addChild(arguments[i]);
	else{
		if(!c) return null;
		// if the child has a parent then lets remove it as PixiJS objects can only exist in one place
		if(c.parent) child.parent.removeChild(c);
		
		c.parent=this;
		// ensure child transform will be recalculated
		c.transform._parentID=-1;
		
		this.children.uniquePush(c);
		
		// ensure bounds will be recalculated
		this._boundsID++;
		
		// TODO - lets either do all callbacks or all events.. not both!
		//this.onChildrenChange(this.children.length-1); // empty func
		c.emit('added',this);
	}
	
	return c;
});

})();
