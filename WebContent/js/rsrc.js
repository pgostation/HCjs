"use strict";

var rsrcData={};
var xcmdData;
var addcolorData;

function GetResourceById(rsrcId,rsrcType){
	if(rsrcData==undefined||rsrcData[rsrcType]==undefined) return undefined;
	if(rsrcData[rsrcType][rsrcId]) return rsrcData[rsrcType][rsrcId];
	/*for(var rs in rsrcData[rsrcType]){
		if(rsrcData[rsrcType][rs].id==rsrcId){
			return rsrcData[rsrcType][rs];
		}
	}*/
}

function GetResource(rsrcName,rsrcType){
	rsrcName = rsrcName+"";
	if(rsrcData[rsrcType]==undefined) return undefined;
	//if(rsrcData[rsrcType][rsrcName]) return rsrcData[rsrcType][rsrcName];
	for(var rs in rsrcData[rsrcType]){
		if((rsrcData[rsrcType][rs].name).toLowerCase()==rsrcName.toLowerCase()){
			return rsrcData[rsrcType][rs];
		}
	}
	return rsrcData[rsrcType][rsrcName];
}

function GetResourceAry(rsrcType){
	return rsrcData[rsrcType];
}

function addResource(rsrc){
	if(rsrcData[rsrc.type]==undefined){
		rsrcData[rsrc.type] = {};
	}
	/*if(rsrc.name!=""){
		rsrcData[rsrc.type][rsrc.name] = rsrc;
	}else*/{
		rsrcData[rsrc.type][rsrc.id] = rsrc;
	}
	changeRsrc();
}

var undoRsrc;
var undoRsrc2;
function changeRsrc(){
	if(rsrcData.icon){
		for(var x in rsrcData.icon){
			if(rsrcData.icon[x]) delete rsrcData.icon[x].cache;
		}
	}
	if(rsrcData.picture){
		for(var x in rsrcData.picture){
			if(rsrcData.picture[x]) delete rsrcData.picture[x].cache;
		}
	}
	if(rsrcData.audio){
		for(var x in rsrcData.audio){
			if(rsrcData.audio[x]) delete rsrcData.audio[x].cache;
		}
	}
	undoRsrc2 = undoRsrc;
	undoRsrc = JSON.parse(JSON.stringify(rsrcData));
	scWorker.postMessage({event:"changeRsrc",content:JSON.stringify(rsrcData)});
}

var Rsrc = function(intype){
	this.type = intype;
	this.name = "";
	this.file = null;
	this.id = 1001;
	for(var i=this.id; i<32767; i++){
		var flag=true;
		if(rsrcData[intype]==undefined) break;
		for(var rs in rsrcData[intype]){
			if(rsrcData[intype][rs].id==i){
				flag=false;
				break;
			}
		}
		if(flag) break;
	}
	this.id = i;
};

function getXCMDList(){
	return "SharedData,HtmlUtil,HttpGet,BrowserCheck,KStealKeyX,KStealKeyX2,UxAnswer,UxGetInKey,UxBack,AddColor,ColorizeHC,Terazza,Terazza2,PgColorX,GetMem,QTMovie,GetMonitor,SetMonitor".split(",");
}

function getResourceList(intype){
	var list = [];
	for(var rs in rsrcData[intype]){
		if(rs.name && rs.name!=""){
			list.push(rs.name);
		}else{
			list.push(rs.id);
		}
	}
	return list;
}