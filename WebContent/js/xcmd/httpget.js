"use strict";

var httpGetXCMDObj;

function httpget(respHandler, url, post){
	if(httpGetXCMDObj && httpGetXCMDObj.abort){
		httpGetXCMDObj.abort();
		httpGetXCMDObj.respHandler = null;
	}
	httpGetXCMDObj = createXMLHttpRequest(httpgetResponse);
	httpGetXCMDObj.respHandler = respHandler.toLowerCase();
	if(httpGetXCMDObj){
		httpGetXCMDObj.loadCount = 0;
		httpGetXCMDObj.open((post!=null)?"POST":"GET","../httpget?url="+url,true);
		httpGetXCMDObj.send((post!=null)?"post="+encodeURI(post).replace(/\+/g,"%2b").replace(/&/g,"%26"):null);
	}
}

function httpgetResponse(){
	if(httpGetXCMDObj.respHandler==null) return;
	if(httpGetXCMDObj.readyState == 4){
		sendCommand2(currentCardObj, httpGetXCMDObj.respHandler, [httpGetXCMDObj.status, httpGetXCMDObj.responseText]);
	}
}