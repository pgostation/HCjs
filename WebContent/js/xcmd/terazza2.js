"use strict";

var terazzaAry;
function terazza2(){

	//postMessage("terazza2 "+arguments[0]);
	if(arguments.length>=1){
		if(arguments[0]=="init"){
			terazzaAry = [];
		}
		else if(arguments[0]=="pal"){
			//palette?
		}
		else if(arguments[0]=="make"){
			//Example) get terazza2("make",2,0,"pict-name","348:3",,,,)
			//postMessage("arguments.length "+arguments.length);
			if(arguments.length>=7){
				var id = parseInt(arguments[1]);
				var speed = parseInt(arguments[2]);
				var pictnum = 0;
				var pictnums = 0;
				var pictnume = 0;
				if(arguments[3].indexOf("/")!=-1){
					var picStr = arguments[3].split("/");
					if(picStr.length>0 && picStr[0].length>0){
						pictnums = 1000+parseInt(picStr[0]);
					}
					if(picStr.length>1 && picStr[1].length>0){
						pictnum = 1000+parseInt(picStr[1]);
					}
					if(picStr.length>2 && picStr[2].length>0){
						pictnume = 1000+parseInt(picStr[2]);
					}
				}else if(arguments[3].match(/^[0-9]+$/)){
					pictnum = 1000+parseInt(arguments[3]);
					pictnums = pictnum;
					pictnume = pictnum;
				}else{
					pictnum = arguments[3];
					pictnums = pictnum;
					pictnume = pictnum;
				}
				var pointh = parseInt(arguments[4].split(/[,:]/)[0]);
				var pointv = parseInt(arguments[4].split(/[,:]/)[1]);
				var pointeh = 0;
				var pointev = 0;
				if(arguments[6].length>0) {
					pointeh = parseInt(arguments[6].split(/[,:]/)[0]);
					pointev = parseInt(arguments[6].split(/[,:]/)[1]);
				}
				var visible = (arguments[8]=="true");

				var trz = {};
				trz.id = id;
				trz.speed = speed;
				trz.time = 0;
				trz.pictnum = pictnum;
				trz.pictnums = pictnums;
				trz.pictnume = pictnume;
				trz.h = pointh;
				trz.v = pointv;
				trz.eh = pointeh;
				trz.ev = pointev;
				trz.visible = visible;
				postMessage(trz);
				terazzaAry.push(trz);
			}
		}
		else if(arguments[0]=="start"){
			for(var i=1; i<arguments.length; i++){
				var id = parseInt(arguments[i]);
				postMessage("start id:"+id);
				for(var j=0; j<terazzaAry.length; j++){
					var trz = terazzaAry[j];
					if(trz.id == id) {
						//postMessage("addcolor colorPict:"+trz.pictnum);
						postMessage({cmd:"addcolor", mode:"colorPict", pict:trz.pictnum, point:{x:trz.h, y:trz.v}, paintmode:"o", effect:null, time:null});
						trz.visible = true;
						trz.time = new Date().getTime();
						break;
					}
				}
			}
		}
		else if(arguments[0]=="move"){
			//
		}
		else if(arguments[0]=="quit"){
			postMessage({cmd:"addcolor", mode:"remove"});
			terazzaAry = null;
		}
	}
}