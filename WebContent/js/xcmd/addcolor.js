"use strict";

function addcolor(){
	//postMessage("addcolor "+arguments[0]);
	if(arguments.length>=1 && arguments[0]=="install"){
	}
	else if(arguments.length>=1 && arguments[0]=="remove"){
		AddColor2.remove();
	}
	else if(arguments.length>1 && arguments[0]=="disableobject"){
		var number = 1;
		if(arguments.length>2){
			number = arguments[2];
		}
		AddColor2.setEnabledACObj(number-1, false);
	}
	else if(arguments.length>1 && arguments[0]=="enableobject"){
		var number = 1;
		if(arguments.length>2){
			number = Integer.valueOf(arguments[2]);
		}
		AddColor2.setEnabledACObj(number-1, true);
	}
	else if(arguments.length>1 && arguments[0]=="colorcard"){
		var time = 30;
		if(arguments.length>2){
			time = arguments[2];
		}
		if(arguments.length>1){
			AddColor2.colorCard(arguments[1], time);
		}
		else{
			AddColor2.colorCard("fromtop", 0);
		}
	}
	else if(arguments.length>=1 && arguments[0]=="colorpict"){
		if(arguments.length>=2 && arguments[1]=="cd"){
			
		}
		var pict = "";
		if(arguments.length>=3){
			pict = arguments[2];
		}
		var p = point(0,0);
		if(arguments.length>=4){
			var points = arguments[3].split(",");
			if(points.length==2){
				p.x = points[0];
				p.y = points[1];
			}
		}
		var mode = "o";
		if(arguments.length>=5){
			 mode = arguments[4];
		}
		var effect = "fromtop";
		if(arguments.length>=6){
			effect = arguments[5];
		}
		var time = 0;
		if(arguments.length>=7){
			time = arguments[6];
		}
		AddColor2.colorPict(pict, p, null, mode, effect, time);
	}
	else{
		postMessage(arguments);
	}
	system._result = "";
	return "";
}

var AddColor2 = {
	remove:function(){
		postMessage({cmd:"addcolor", mode:"remove"});
	},
	setEnabledACObj:function(i,enabled){
		postMessage({cmd:"addcolor", mode:"enabled", id:i, value:enabled});
	},
	colorCard:function(effect,time){
		postMessage({cmd:"addcolor", mode:"colorCard", effect:effect, time:time});
		wait(time);
	},
	colorPict:function(pict, p, xxx, mode, effect, time){
		postMessage({cmd:"addcolor", mode:"colorPict", pict:pict, point:p, paintmode:mode, effect:effect, time:time});
		wait(time);
	},
};

