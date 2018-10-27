"use strict";

function colorizehc(){
	//postMessage("colorizehc "+arguments[0]+" "+arguments[1]+" "+arguments[2]);
	
	if(arguments[0].toLowerCase()=="add"){
		var p = {x:0, y:0};
		var r = null;
		if(arguments[2]){
			if(arguments[2].x){
				p = null;
				r = arguments[2];
			}else{
				var sp = (arguments[2]+"").split(",");
				p = null;
				r = {x:sp[0], y:sp[1], width:sp[2]-sp[0], height:sp[3]-sp[1]};
			}
		}
		postMessage({cmd:"addcolor", mode:"colorPict", pict:arguments[1], point:p, rect:r, paintmode:"", effect:"", time:0});
	}
	else if(arguments[0].toLowerCase()=="dispose"){
		postMessage({cmd:"addcolor", mode:"removeAfter"}); //removeだとすぐに消えてしまう。カード移動時に消したい
	}
	else{
		postMessage(arguments);
	}
}