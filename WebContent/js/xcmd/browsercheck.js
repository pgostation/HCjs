"use strict";

function browsercheck(x){
	x = (x+"").toLowerCase();
	switch(x){
	case "useragent":
		return navigator.userAgent;
	case "webaudioapi":
		return browserCheck.webaudioapi;
	}
	system._result = "";
	return "";
}
