"use strict";
/*:
 * @plugindesc preload images on map load
 * @author agold404
 * @help 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

t={
bsR:[/\r/g,''],
};

new cfc(DataManager).add('onLoad_before_map',function f(obj,name,src,msg){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_map_preloadImages(obj,name,src,msg);
	this.onLoad_map_preloadAudios(obj,name,src,msg);
	return rtv;
}).
addBase('onLoad_map_preloadImages',function f(obj,name,src,msg){
	const S=new Set(),paths=[];
	for(let ende=0,idx;(idx=obj.note.indexOf(f.tbl[0][0],ende))>=0;){
		// they're paths, no '<' or '>'
		ende=obj.note.indexOf(f.tbl[0][1],idx); if(ende<0) ende=obj.note.length;
		paths.concat_inplace(obj.note.slice(idx+f.tbl[0][0].length,ende).replace(f.tbl[1][0],f.tbl[1][1]).split('\n'));
	}
	while(paths.length){
		const s=paths.pop();
		if(!s||S.has(s)) continue;
		S.add(s);
		const hue=s.match(f.tbl[2]);
		ImageManager.loadNormalBitmap(hue?s.slice(0,-hue[0].length):s,hue?hue[1]-0:0);
	}
},[
['<preloadImages>','</preloadImages>'], // 0: start , end 
t.bsR, // 1: \r -> ''
/:([0-9]+)$/, // 2: hue info
]).
addBase('onLoad_map_preloadAudios',function f(obj,name,src,msg){
	const S=new Set(),paths=[];
	for(let ende=0,idx;(idx=obj.note.indexOf(f.tbl[0][0],ende))>=0;){
		// they're paths, no '<' or '>'
		ende=obj.note.indexOf(f.tbl[0][1],idx); if(ende<0) ende=obj.note.length;
		paths.concat_inplace(obj.note.slice(idx+f.tbl[0][0].length,ende).replace(f.tbl[1][0],f.tbl[1][1]).split('\n'));
	}
	const rplc=f.tbl[2];
	while(paths.length){
		const s=paths.pop();
		if(!s||S.has(s)) continue;
		S.add(s);
		new WebAudio(s.replace(rplc[0],rplc[1]),true,true);
	}
},[
['<preloadAudios>','</preloadAudios>'], // 0: start , end 
t.bsR, // 1: \r -> ''
[/\.rpgmvo$/,'.ogg'], // 2: replace ext
]);

})();
