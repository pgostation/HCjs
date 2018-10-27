"use strict";

function htmlutil(txt, cmd, sub){
	switch((cmd+"").toLowerCase()){
	case "text":
		return htmlutilText(txt);
	}
}

function htmlutilText(txt){
	var ret = txt.replace(/<script.*>(.|\n)*<\/script>/g,"").replace(/\n[ \t]*/g,"").replace(/<[^>]*>/g,"");
	return ret;
}