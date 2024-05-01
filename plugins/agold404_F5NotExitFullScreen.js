"use strict";
/*:
 * @plugindesc prevent player exiting full-screen mode when pressing F5
 * @author agold404
 * @help .
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

if(window!==getTopFrameWindow()) return;

const cssInner="position:fixed; left:0px; top:0px; width:100%; height:100%; margin: 0px; border: 0px solid black; padding: 0px;";
const cssHere="background-color:black; overflow:hidden;";

SceneManager.run=()=>{};
const path=location.pathname+"?"+location.search+"#"+location.hash;
const d=document;
d.body.rf(0).ac(d.ce('iframe').sa('style',cssInner).sa('src',path)).sa('style',cssHere);

})();
