"use strict";
/*:
 * @plugindesc preload images on map load
 * @author agold404
 * @help 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(DataManager).add('onLoad_before_map',function f(obj,name,src,msg){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_map_preloadImages(obj,name,src,msg);
	return rtv;
}).add('onLoad_map_preloadImages',function f(obj,name,src,msg){
	const S=new Set(),paths=[];
	for(let ende=0,idx;(idx=obj.note.indexOf(f.tbl[0][0],ende))>=0;){
		// they're paths, no '<' or '>'
		ende=obj.note.indexOf(f.tbl[0][1],idx); if(ende<0) ende=obj.note.length;
		paths.concat_inplace(obj.note.slice(idx+f.tbl[0][0].length,ende).replace(f.tbl[1][0],f.tbl[1][1]).split('\n'));
	}
	while(paths.length){
		const s=paths.pop();
		if(S.has(s)) continue;
		S.add(s);
		const hue=s.match(f.tbl[2]);
		ImageManager.loadNormalBitmap(hue?s.slice(0,-hue[0].length):s,hue?hue[1]-0:0);
	}
},[
['<preloadImages>','</preloadImages>'], // 0: start , end 
[/\r/g,''], // 1: \r -> ''
/:([0-9]+)$/, // 2: hue info
]);

})();
