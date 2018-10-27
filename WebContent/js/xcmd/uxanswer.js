"use strict";

function uxanswer(msg, icon, time, btn1, btn2, btn3){
	//[Are you Muscle?, "1010, 1013, 8", 400, NO!, MUSCLE!]
	var str = arguments[0];
	var icon = new Array();
	if(arguments.length>=2 && arguments[1]!=""){
		var iconsStr = arguments[1].split(",");
		for(var i=0; i<iconsStr.length; i++){
			while(iconsStr[i].charAt(0)==' '){
				iconsStr[i] = iconsStr[i].substring(1);
			}
			while(iconsStr[i].charAt(iconsStr[i].length-1)==' '){
				iconsStr[i] = iconsStr[i].substring(0,iconsStr[i].length-1);
			}
			icon[i] = iconsStr[i];
		}
	}
	/*var iconwait = 0;
	if(icon.length>=3){
		iconwait = icon[icon.length-1];
	}
	var time = 0;
	if(arguments.length>=3 && arguments[2]!=""){
		time = arguments[2];
	}*/
	var Buttons = new Array(arguments.length-3);
	for(var i=0; i<arguments.length-3; i++){
		if(arguments.length>=4+i && arguments[3+i].length!=""){
			Buttons[i] = arguments[3+i];
		}
	}
	
	//it = GUxAnswer(str, null, icon, iconwait, time, Buttons);
	answer(str, Buttons[0], Buttons[1], Buttons[2]);

	return it;
}