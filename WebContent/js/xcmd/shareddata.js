"use strict";


//var sharedTextXMLObj;

function shareddata(cmd,file,txt){
	//cmd: get, all, set

	if(txt!=null && cmd!="set"){
		return "Error: Illegal arguments";
	}
	if(txt==null && cmd=="set"){
		txt = "";
	}
	if(file==null){
		file = "";
	}
	if(cmd!="set" && cmd!="get" && cmd!="all"  ){
		return "Error: First argument must be 'get/set/all'.";
	}
	if(cmd=="all") var user = "_all";
	else user = userId;
	file = encodeURI(file).replace(/\+/g,"%2b").replace(/&/g,"%26").replace(/\//g,"x2f");
	if(txt!=null) txt = encodeURI(txt).replace(/\+/g,"%2b").replace(/&/g,"%26");
	var url = "sharedText?author="+userName+"&name="+stackName+"&file="+file+"&user="+user+((txt!=null)?"&text="+txt:"");
	
	extractQueue();//先にキューを空にしておく
	postMessage({cmd:"ajaxget", url:url, postdata:null});
	var last = +new Date();
	var ret = null;
	while(+new Date()<=last+10*1000/60){
		ret = extractQueue("ajaxget");
		if(ret!=undefined){
			break;
		}
		if(vmStopFlag)break;
	}
	
	if(ret==null) return "Error: Timeout";
	return ret;
}
/*
function sharedtextResponse(){
	if(sharedTextXMLObj.respHandler==null) return;
	if(sharedTextXMLObj.readyState == 4){
		sendCommand2(currentCardObj, sharedTextXMLObj.respHandler, [sharedTextXMLObj.status, sharedTextXMLObj.responseText]);
	}
}*/