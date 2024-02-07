"use strict";
/*:
 * @plugindesc 走到底的 BFS 尋路。
 * @author agold404
 * @help chr.findDirTo([[x,y],...],otherOpts,...) -> direction
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

{ const a=Game_CharacterBase;
//       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
a.dir_h =[0, 4, 0, 6, 4, 0, 6, 4, 0, 6];
a.dir_v =[0, 2, 2, 2, 0, 0, 0, 8, 8, 8];
a.dir_dx=[0,-1, 0, 1,-1, 0, 1,-1, 0, 1];
a.dir_dy=[0, 1, 1, 1, 0, 0, 0,-1,-1,-1];
a.dir_dyx2dir=[ // [dy+1][dx+1]
[7,8,9],
[4,5,6],
[1,2,3],
];
a.dir_turn=[
	[0,1,2,3,4,5,6,7,8,9], // (dir>>1) => new dir
	[2,2,2,2,4,0,6,4,8,6],
	[4,4,2,2,4,0,6,4,8,8],
	[6,2,2,6,4,0,6,8,8,6],
	[8,4,2,6,4,0,6,8,8,8],
	[],
];
new cfc(a.prototype).add('canPass',function f(x,y,d){
	return d&1?this.canPassDiagonally(Game_CharacterBase.dir_h[d],Game_CharacterBase.dir_v[d]):f.ori.apply(this,arguments);
}).add('moveStraight',function f(d){
	return d&1?this.moveDiagonally(Game_CharacterBase.dir_h[d],Game_CharacterBase.dir_v[d]):f.ori.apply(this,arguments);
}).add('moveDiagonally',function f(horz,vert){
	const dir0=this.direction();
	const rtv=this.canPassDiagonally(this._x, this._y, horz, vert)?4:(!!this.canPass(this._x,this._y,horz))|((!!this.canPass(this._x,this._y,vert))<<1);
	f.tbl[0][rtv].apply(this,arguments);
	if(rtv){
		this.moveDiagonally_turnDir(dir0,f.tbl[1][horz],f.tbl[2][vert]);
		if(rtv===3) this.moveForward();
	}
	return rtv;
},[
[
none,
function f(horz,vert){
	this.moveStraight(horz);
}, // h
function f(horz,vert){
	this.moveStraight(vert);
}, // v
none, // either h or v, but not diagonal
function f(horz,vert){
	this.setMovementSuccess(true);
	this._x=$gameMap.roundXWithDirection(this._x,horz);
	this._y=$gameMap.roundYWithDirection(this._y,vert);
	this._realX=$gameMap.xWithDirection(this._x,this.reverseDir(horz));
	this._realY=$gameMap.yWithDirection(this._y,this.reverseDir(vert));
	this.increaseSteps();
}, // diag
], // 0: doing the move
a.dir_dx,
a.dir_dy,
],false,true).add('moveDiagonally_turnDir',function f(dir0,dx,dy){
	let d=f.tbl[0][dy+1]; d=(d&&d[dx+1])|0;
	const dir1=f.tbl[1][dir0>>1][d];
	dir1 && this.setDirection(dir1);
},[
a.dir_dyx2dir,
a.dir_turn,
]);
}

{ const a=Game_Character;
{ const ra=Game_CharacterBase;
a.dir_h =ra.dir_h;
a.dir_v =ra.dir_v;
a.dir_dx=ra.dir_dx;
a.dir_dy=ra.dir_dy;
a.dir_dyx2dir=ra.dir_dyx2dir;
a.dir_turn=ra.dir_turn;
}
const p=a.prototype;
t=[
a.dir_h,
a.dir_v,
a.dir_turn,
]
new cfc(p).add('canPassDiagNumpad',function f(x,y,dir){
	return this.canPassDiagonally(x,y,f.tbl[0][dir],f.tbl[1][dir]);
},t).add('moveDiagNumpad',function f(d){ d|=0; if(!d) return 0;
	return this.moveDiagonally(f.tbl[0][d],f.tbl[1][d]);
},t).add('moveTowardCharacter_findDirTo',function f(chr){
	return this.moveDiagNumpad(this.findDirTo([[chr.x,chr.y]]));
}).add('moveTowardCharacters_findDirTo',function f(chrs){
	return this.moveDiagNumpad(this.findDirTo(chrs.map(f.tbl[0])));
},[
chr=>[chr.x,chr.y],
]).getP().findDirTo=function f(goals,disables,kargs){
	// goals = [ [x,y,costAdd] , ... ]
	// kargs:
	// 	tileOnly: check pass only on tiles = '$gameMap.isPassable', not 'chr.canPass'
	// 	noNear: near grid will not be counted in goals.
	// 	noDiag: not returning diagonal direction
	if(f.inited===undefined){
		f.inited=1;
		f.chooseX=(self,c_and_deltaX,costs,newIdx,mapWidth,test_passable=0)=>{
			// rtv{} , arr , const , const
			// &&+x
			let newx=$gameMap.roundXWithDirection(self._x,6);
			//console.log(1,goalx,goaly,newx,newx<mapWidth,costs[newIdx-self._x+newx]); // debug
			if((!test_passable||self.canPass(self._x,self._y,6)) && newx<mapWidth && (newc=costs[newIdx-self._x+newx])<c_and_deltaX.c){
				c_and_deltaX.c=newc;
				c_and_deltaX.d=1;
			}
			// &&-x
			newx=$gameMap.roundXWithDirection(self._x,4);
			//console.log(2,goalx,goaly,newx,newx>=0,costs[newIdx-self._x+newx]); // debug
			if((!test_passable||self.canPass(self._x,self._y,4)) && newx>=0 && (newc=costs[newIdx-self._x+newx])<c_and_deltaX.c){
				c_and_deltaX.c=newc;
				c_and_deltaX.d=-1;
			}
		};
	}
	if(!goals||goals.length===0) return 0;
	const mapWidth = $gameMap.width() , mapHeight = $gameMap.height();
	const strtIdx=this._y*mapWidth+this._x;
	disables=disables?new Set(disables.map(p=>p.y*mapWidth+p.x)):new Set();
	kargs=kargs||{};
	const tileOnly=kargs.tileOnly;
	const noNear=kargs.noNear;
	const cd=!kargs.noDiag; // !!this.canDiag; // boolean
	
	// reversed search: goal -> start
	// - bfs: mark costs
	const cacheKey=JSON.stringify({goals:goals,disables:disables})+(tileOnly?"-tileOnly":"");
	if(!$dataMap.cache_findDirTo) $dataMap.cache_findDirTo=new Map();
	let cache=$dataMap.cache_findDirTo.get(cacheKey);
	let costs,queue;
	if(cache&&( tileOnly?(cache.rs===DataManager.resetSerial):(cache.fc===Graphics.frameCount) )){ // suppose not much different
		costs=cache;
		queue=cache.Q;
	}else{
		cache=undefined; // later use 'cache===undefined' to determine wheather to set new cache
		costs=[]; costs.length=mapWidth*mapHeight; for(let x=0;x!==costs.length;++x) costs[x]=costs.length;
		costs.P=[];
		
		const tmparr=[];
		// - init cost near goals
		for(let gid=0;gid!==goals.length;++gid){
			const goal=goals[gid];
			const goalx=goal[0]=$gameMap.roundX(goal[0]),goaly=$gameMap.roundY(goal[1]);
			if(!$gameMap.isValid(goalx,goaly)) continue;
			const newIdx=goaly*mapWidth+goalx;
			costs.P[newIdx]=4;
			if(!disables.has(newIdx))
				tmparr.push({x:goalx,y:goaly,c:(goal[2]^0)+(0^0)});
		}
		// - - surroundings, prevent from 'clicking on events causes no effect'
		if(!noNear){ for(let gid=0;gid!==goals.length;++gid){
			const goal=goals[gid];
			const goalx=goal[0],goaly=goal[1];
			for(let dir=10;dir-=2;){
				const newx=$gameMap.roundXWithDirection(goalx,dir);
				const newy=$gameMap.roundYWithDirection(goaly,dir);
				if(!$gameMap.isValid(newx,newy)) continue;
				const newIdx=newy*mapWidth+newx;
				costs.P[newIdx]=4;
				if(!disables.has(newIdx))
					tmparr.push({x:newx,y:newy,c:(goal[2]^0)+(1^0)});
			}
		} }
		
		tmparr.sort((a,b)=>a.c-b.c);
		queue=new Queue(tmparr);
	}
	const pushed=costs.P;
	
	// - strt / resume : log frameCount or resetSerial (tileOnly)
	if(costs[strtIdx]===costs.length){ if(tileOnly) costs.rs=DataManager.resetSerial; else costs.fc=Graphics.frameCount; while(queue.length){
		const curr=queue.front; queue.pop();
		const currIdx=curr.y*mapWidth+curr.x;
		if(curr.c>=costs[currIdx]||disables.has(currIdx)) continue;
		const newCost=(costs[currIdx]=curr.c)+1;
		for(let dir=10;dir-=2;){
			const newx=$gameMap.roundXWithDirection(curr.x,dir);
			const newy=$gameMap.roundYWithDirection(curr.y,dir);
			if(!$gameMap.isValid(newx,newy)) continue;
			const newIdx=newy*mapWidth+newx;
			if( pushed[newIdx]>3 || 
				!(tileOnly?$gameMap.isPassable(newx,newy,10-dir):this.canPass(newx,newy,10-dir)) // reversed search
				){
				pushed[newIdx]|=0; ++pushed[newIdx];
				continue;
			}
			if(newCost<costs[newIdx]){
				pushed[newIdx]=4;
				queue.push({x:newx,y:newy,c:newCost});
			}
		}
		if(currIdx===strtIdx&&!kargs.fullSearch) break;
	} }
	
	// costs is not from cache, add: costs , time slot (@bfs_strt) , remained queue
	if(!cache){ 
		costs.Q=queue;
		$dataMap.cache_findDirTo.set(cacheKey,costs);
	}
	
	// tell direction
	const dx=goals[0][0]-this.x,dy=goals[0][1]-this.y;
	let c_and_dir={c:costs[strtIdx],dir:0},newc=0;
	// value of dir : direction on numpad
	// +-x
	{
		const c_and_deltaX={c:costs[strtIdx],d:0};
		f.chooseX(this,c_and_deltaX,costs,strtIdx,mapWidth,costs[strtIdx]>1); c_and_deltaX.d+=5;
		if( (costs[strtIdx]===1||this.canPass(this._x,this._y,c_and_deltaX.d)) && c_and_deltaX.c<c_and_dir.c ){
			c_and_dir.c=c_and_deltaX.c;
			c_and_dir.dir=c_and_deltaX.d;
		}
	}
	// +y
	let newy=$gameMap.roundYWithDirection(this._y,2);
	if(newy<mapHeight){
		const newIdx=strtIdx+(newy-this._y)*mapWidth;
		if( (costs[strtIdx]===1||this.canPass(this._x,this._y,2)) ){
			newc=costs[newIdx];
			if( costs[newIdx]<c_and_dir.c || (costs[newIdx]!==costs.length && costs[newIdx]===c_and_dir.c && dx*dx<dy*dy) ){
				c_and_dir.c=newc;
				c_and_dir.dir=2;
			}
		}
		if(cd){
			const c_and_deltaX={c:costs[strtIdx],d:0};
			f.chooseX(this,c_and_deltaX,costs,newIdx,mapWidth);
			let newDir=c_and_deltaX.d+2;
			if(c_and_deltaX.c<c_and_dir.c && this.canPassDiagNumpad(this._x,this._y,newDir)){
				c_and_dir.c=c_and_deltaX.c;
				c_and_dir.dir=newDir;
			}
		}
	}
	// -y
	newy=$gameMap.roundYWithDirection(this._y,8);
	if(newy>=0){
		const newIdx=strtIdx+(newy-this._y)*mapWidth;
		if( (costs[strtIdx]===1||this.canPass(this._x,this._y,8)) ){
			newc=costs[newIdx];
			if( costs[newIdx]<c_and_dir.c || (costs[newIdx]!==costs.length && costs[newIdx]===c_and_dir.c && dx*dx<dy*dy) ){
				c_and_dir.c=newc;
				c_and_dir.dir=8;
			}
		}
		if(cd){
			const c_and_deltaX={c:costs[strtIdx],dir:0};
			f.chooseX(this,c_and_deltaX,costs,newIdx,mapWidth);
			let newDir=c_and_deltaX.d+8;
			if(c_and_deltaX.c<c_and_dir.c && this.canPassDiagNumpad(this._x,this._y,newDir)){
				c_and_dir.c=c_and_deltaX.c;
				c_and_dir.dir=newDir;
			}
		}
	}
	return c_and_dir.dir;
};
p.findDirTo.tbl=[
	[2,8,4,6],
];
}

new cfc(Game_Player.prototype).add('findDirectionTo',function f(){
	return this.findDirTo([[arguments[0],arguments[1]]])||f.ori.apply(this,arguments);
}).add('getInputDirection',function f(){
	return Input.dir8;
},undefined,false,true);

new cfc(Game_Map.prototype).add('xWithDirection',function f(x,d){
	return x+(Game_Character.dir_dx[d]|0);
},undefined,false,true).add('yWithDirection',function f(y,d){
	return y+(Game_Character.dir_dy[d]|0);
},undefined,false,true).add('roundXWithDirection',function f(x,d){
	return this.roundX(this.xWithDirection(x,d));
},undefined,false,true).add('roundYWithDirection',function f(y,d){
	return this.roundY(this.yWithDirection(y,d));
},undefined,false,true);

})();
