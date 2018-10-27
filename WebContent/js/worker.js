"use strict";

//Web SQL Databaseを使う。Indexed APIにそのうち対応(今は同期APIが無い)
//同期APIをメッセージングに使うだけにする。

//stackObjは両方のスレッドで持つ。どちらかで変更したら変更を伝える。
//基本的にオーサリングのときは表からworkerへ、ブラウジング時は逆というだけ。

//workerとしてはscriptWorkerだけがある。特にsharedWorkerじゃなくても良かろう。

var userId,userName,stackName,browserLang;
var stackData,cardData,bgData,rsrcData,xcmdData;
var currentCardObj;
var uniqId,workerDB;
var authClipboard;
var masterEditMode;
var localStorageData;
var browserCheck;

importScripts("commandsWorker.js?"+(Math.random()*10000|0));
importScripts("propertyWorker.js?"+(Math.random()*10000|0));
importScripts("menuWorker.js?"+(Math.random()*10000|0));
importScripts("stackObject.js?"+(Math.random()*10000|0));
importScripts("vm.js?"+(Math.random()*10000|0));
importScripts("doWorker.js?"+(Math.random()*10000|0));

addEventListener("message", function(event){
	//if(navigator.userAgent.indexOf("Opera")!=-1)console.log("worker.js/"+event.data.event);
	switch(event.data.event){
	case "loadStackData":
		loadStackData();
		workerDB = openDatabaseSync('sq-'+uniqId, '1.0.0', 'stackQueue-'+uniqId, 1*1024);
		if (!workerDB) {
			postMessage("Can't open worker DB.");
			return;
		}
		break;
	case "localStorageData":
		localStorageData = event.data.content;
		break;
	case "getStackData":
		postMessage({cmd:"stackData1", arg:
		{
			userLevel:stackData.userLevel,
			width:stackData.width,
			height:stackData.height,
			script:stackData.script,
			ejavascript:stackData.ejavascript,
			showNavigator:stackData.showNavigator,
			type:"stack",
		}});
		break;
	case "browserCheck":
		browserCheck = event.data.content;
		break;
	case "userId"://author id
		userId = event.data.content;
		break;
	case "userName":
		userName = event.data.content;
		global.username = userName;
		break;
	case "stackName":
		stackName = event.data.content;
		break;
	case "browserLang":
		browserLang = event.data.content;
		break;
	case "menu":
		wexecMenu(event.data.content);
		break;
	case "uniqId":
		uniqId = event.data.content;
		break;
	case "command":
		var msg = event.data.msg;
		var obj = getObjectFromMain(event);
		doScript(msg, obj);
		break;
	case "msg":
		if(system.lockedMessages) break;
		mouse._click = false;
		var msg = event.data.msg;//.toLowerCase();
		var obj = getObjectFromMain(event);
		//postMessage("eventlisterner msg "+msg);
		sendCommand2(obj, msg, event.data.args, "msg");
		postMessage({cmd:"endRun"});
		break;
	case "go":
		var cardId = event.data.content;
		if(currentCardObj!=undefined){
			cardHistory[cardHistory.length] = currentCardObj.id;
			cardForward = [];
		}
		currentCardObj = cardById(cardId);
		if(!currentCardObj){
			currentCardObj = cardData[0];
		}
		postMessage({cmd:"go", arg:operaCloneObj(currentCardObj), arg2:operaCloneObj(bgById(currentCardObj.background)), arg3:false});
		break;
	case "changeProperty":
		extractQueue();
		break;
	case "changeRsrc":
		rsrcData1 = JSON.parse(event.data.content);
		changedStack = true;
		saveStackData();
		break;
	case "save":
		saveStackData("force");
		break;
	case "changeXCMD":
		xcmdData = JSON.parse(event.data.content);
		changedStack = true;
		saveStackData();
		break;
	case "getCardNum":
		postMessage({cmd:"getCardNum", arg:getCardNum(currentCardObj.id)});
		break;
	case "getBgNum":
		postMessage({cmd:"getBgNum", arg:getBgNum(currentCardObj.background)});
		break;
	case "createNewButton":
		var baseObj = event.data.content.editBackground?getBgData(currentCardObj.background):currentCardObj;
		if(baseObj.cantModify) break;
		var btn = new hcButton(baseObj);
		btn.style = event.data.content.style;
		btn.showName=true;
		btn.autoHilite=true;
		btn.left = event.data.content.x;
		btn.top = event.data.content.y;
		if(btn.left<0) btn.left=0;
		if(btn.top<0) btn.top=0;
		if(event.data.content.width!=undefined)	btn.width = event.data.content.width;
		if(event.data.content.height!=undefined) btn.height = event.data.content.height;
		btn.icon = event.data.content.icon;
		if(event.data.content.showName!=undefined){
			btn.showName = event.data.content.showName;
		}
		btn.name = (browserLang=="ja")?"新規ボタン":"New Button";
		baseObj.parts[baseObj.parts.length] = btn;
		changedStack = true;
		saveStackData();
		innerGoCard(currentCardObj);
		waitGo();
		break;
	case "createNewField":
		var baseObj = event.data.content.editBackground?getBgData(currentCardObj.background):currentCardObj;
		if(baseObj.cantModify) break;
		var fld = new hcField(baseObj);
		fld.style = event.data.content.style;
		fld.left = event.data.content.x;
		fld.top = event.data.content.y;
		if(fld.left<0) fld.left=0;
		if(fld.top<0) fld.top=0;
		if(event.data.content.width!=undefined)	fld.width = event.data.content.width;
		if(event.data.content.height!=undefined) fld.height = event.data.content.height;
		fld.name = "";
		baseObj.parts[baseObj.parts.length] = fld;
		changedStack = true;
		saveStackData();
		innerGoCard(currentCardObj);
		waitGo();
		break;
	case "changeObj":
		var data = event.data.content;
		var editBackground = event.data.editBackground;
		if(data.type=="button" || data.type=="field"){
			var baseObj = editBackground?bgById(currentCardObj.background):currentCardObj;
			if(!baseObj.cantModify){
				var obj = findPartsById(data.id, baseObj.parts, data.type);
				var prop = event.data.prop;
				if(!prop){
					for(var p in data){
						obj[p] = data[p];
					}
				}else{
					obj[prop] = data[prop];
				}
			}
		}
		else if(data.type=="card"){
			var baseObj = currentCardObj;
			if(data.id != currentCardObj.id){
				baseObj = cardById(data.id);
			}
			if(!baseObj.cantModify){
				for(var prop in data){
					baseObj[prop] = data[prop];
				}
			}
		}
		else if(data.type=="background"){
			var baseObj = bgById(data.id);
			if(!baseObj.cantModify){
				for(var prop in data){
					baseObj[prop] = data[prop];
				}
			}
		}
		else if(data.type=="stack"){
			for(var prop in data){
				stackData[prop] = data[prop];
			}
		}
		objectSetting();
		ejavascript2exec();
		changedStack = true;
		saveStackData();
		if(event.data.option!="noRefresh"){
			innerGoCard(currentCardObj);
			waitGo();
		}
		break;
	case "changeBgObj":
		var data = event.data.content;
		var id = event.data.id;
		var cardid = event.data.cardid;
		//var prop = event.data.prop;
		var baseObj = currentCardObj;
		if(cardid != currentCardObj.id){
			baseObj = cardById(cardid);
		}
		if(!baseObj.bgparts[id]) baseObj.bgparts[id] = {};
		baseObj.bgparts[id] = data;
		if(data.hilite){
			if(currentCardObj.id == cardid){
				var parts = bgById(currentCardObj.background).parts;
				var btn = bgBtnById(id);
				for(var i=0; i<parts.length; i++){
					if(parts[i].type=="button" && parts[i].family==btn.family && id!=parts[i].id){
						var bgpdata = currentCardObj.bgparts[parts[i].id];
						if(bgpdata){
							bgpdata.hilite = false;
							changeBgObj(bgpdata, parts[i].id, "hilite");
						}
					}
				}
			}
		}
		changedStack = true;
		saveStackData();
		break;
	case "copyObj":
		var baseData = (event.data.content.basetype=="card")?currentCardObj:getBgData(currentCardObj.background);
		var data=undefined;
		if(event.data.content.type=="button") data = baseData.btnById(event.data.content.id);
		else if(event.data.content.type=="field") data = baseData.fldById(event.data.content.id);
		authClipboard = myClone(data);
		break;
	case "deleteObj":
		var baseData = (event.data.content.basetype=="card")?currentCardObj:getBgData(currentCardObj.background);
		var data=undefined;
		if(event.data.content.type=="button") data = baseData.btnById(event.data.content.id);
		else if(event.data.content.type=="field") data = baseData.fldById(event.data.content.id);
		var i = baseData.parts.indexOf(data);
		if(!baseData.cantModify){
			if(i!=undefined){
				baseData.parts.splice(i,1);//削除
				changedStack=true;
				saveStackData();
				innerGoCard(currentCardObj);
				waitGo();
			}
		}
		break;
	case "pasteObj":
		if(authClipboard!=undefined&&(authClipboard.type=='button'||authClipboard.type=='field')){
			var baseData = (event.data.content.basetype=="card")?currentCardObj:getBgData(currentCardObj.background);
			if(!baseData.cantModify){
				authPastePart(baseData, event.data.content.type, event.data.content.id);
			}
		}
		break;
	case "sendfartherObj":
	case "bringcloserObj":
		var baseData = (event.data.content.basetype=="card")?currentCardObj:getBgData(currentCardObj.background);
		var data=undefined;
		if(event.data.content.type=="button") data = baseData.btnById(event.data.content.id);
		else if(event.data.content.type=="field") data = baseData.fldById(event.data.content.id);
		var i = baseData.parts.indexOf(data);
		if(!baseData.cantModify){
			if(event.data.event=="sendfartherObj"){
				if(i!=undefined && i-1>=0){
					//入れ替え
					var x = baseData.parts[i];
					baseData.parts[i] = baseData.parts[i-1];
					baseData.parts[i-1] = x;
				}
			}else{
				if(i!=undefined && i+1<baseData.parts.length){
					//入れ替え
					var x = baseData.parts[i];
					baseData.parts[i] = baseData.parts[i+1];
					baseData.parts[i+1] = x;
				}
			}
			changedStack=true;
			saveStackData();
			innerGoCard(currentCardObj);
			waitGo();
		}
		break;
	case "setHoverObject":
		postMessage({cmd:"innerSetHoverObject", arg:event.data.content});
		break;
	case "find":
		var cardData2 = operaCloneObj(cardData);
		var bgData2 = operaCloneObj(bgData);
		postMessage({cmd:"find", opt:"string", string:event.data.content, fld:null, cds:cardData2, bgs:bgData2});
		break;
	case "menus":
		browseMenus = event.data.content;
		break;
	case "menuitems":
		browseMenuItems[event.data.content.name.toLowerCase()] = event.data.content.elem;
		break;
	case "masterEditMode":
		masterEditMode = event.data.content.masterEditMode;
		break;
	}
}, false);

function getObjectFromMain(event){
	var type = event.data.type;
	var id = event.data.id;
	var parent = event.data.parent;
	var parentId = event.data.parentId;
	return getObjectByParam(type,id,parent,parentId);
}

function getObjectByParam(type,id,parent,parentId){
	var obj = null;
	switch(type){
	case "stack":
		obj = stackData;
		break;
	case "background":
		obj = bgById(id);
		break;
	case "card":
		obj = cardById(id);
		break;
	case "button":
		if(parent=="card"){
			if(cardById(parentId)) obj = cardById(parentId).cdBtnById(id);
		}else{
			if(bgById(parentId)) obj = bgById(parentId).bgBtnById(id);
		}
		break;
	case "field":
		if(parent=="card"){
			if(cardById(parentId)) obj = cardById(parentId).cdFldById(id);
		}else{
			if(bgById(parentId)) obj = bgById(parentId).bgFldById(id);
		}
		break;
	}
	return obj;
}

var rcvCardId;
function sendCommand(obj, msg, arg1, arg2){
	var args = ["","","","","","","",""];
	for(var i=2; i<arguments.length; i++){
		args[i-2] = arguments[i];
	}
	sendCommand2(obj, msg, args, false);
}

function sendCommand2(obj, msg, args, flag){
	if(msg!="idle"){
		//postMessage("sendCommand "+msg+" to "+obj.type+" id "+obj.id+" flag:"+flag);
	}
	if(!args){
		args = [];
	}
	extractQueue();//強制停止のため
	if(vmStopFlag)return;
	if(!obj) {
		return;
	}
	while(!obj.exec || !obj.exec[msg]){
		switch(obj.type){
		case "stack":
			obj = null;
			break;
		case "background":
			obj = stackData;
			break;
		case "card":
			rcvCardId = obj.id;
			//postMessage("rcvCardId:"+rcvCardId);
			obj = bgById(obj.background);
			break;
		case "button":
		case "field":
			if(obj.parent=="card") obj = cardById(obj.parentId);
			else obj = bgById(obj.parentId);
			break;
		default:
			obj = null;
		break;
		}
		if(!obj){
			//postMessage("currentCardObj.id:"+currentCardObj.id+" rcvCardId:"+rcvCardId);
			/*if(",opencard,closecard,mousedown,mouseup,mouseleave,mouseenter,mousestilldown,openstack,".indexOf(","+msg+",")!=-1){
				//postMessage("sendCommand can't receive:"+msg+" "+arg);
			}
			else */if(!flag==true&&rcvCardId!=currentCardObj.id){
				//postMessage("!flag ");
				sendCommand2(cardById(currentCardObj.id), msg, args, true);
			}
			return;
		}
	}
	if(flag=="msg"){
		postMessage({cmd:"startRun"});
	}
	vmExec(obj, msg, args);
	return;
}

function pass(){
	if(vmStopFlag)return;
	if(!me) return;
	var obj = me;
	//postMessage("1pass "+me.type+" "+vmMsg);
	switch(obj.type){
	case "stack":
		return;
	case "background":
		obj = stackData;
		break;
	case "card":
		obj = bgById(obj.background);
		break;
	case "button":
	case "field":
		if(obj.parent=="card") obj = cardById(obj.parentId);
		else obj = bgById(obj.parentId);
		if(!obj)return;
		break;
	default:
		return;
	}
	//postMessage("2pass "+obj.type+" "+vmMsg);
	sendCommand2(obj,vmMsg,vmArgs,true);
}

function authPastePart(baseData,type,id){
	var data=undefined;
	if(type=="button") data = baseData.btnById(id);
	else if(type=="field") data = baseData.fldById(id);
	var i = baseData.parts.length-1;
	if(data!=undefined) i = baseData.parts.indexOf(data);
	if(i!=undefined){
		//追加
		var newdata = myClone(authClipboard);
		newdata.id = newBtnId(baseData);
		newdata.left = newdata.left-0+8;
		newdata.top = newdata.top-0+8;
		newdata.width -=0;
		newdata.height -=0;
		if(baseData.background!=undefined){//cardの場合
			if(newdata.sharedHilite!=undefined) delete newdata.sharedHilite;
			if(newdata.sharedText!=undefined) delete newdata.sharedText;
		}
		else{//bgの場合
			if(newdata.sharedHilite==undefined) newdata.sharedHilite=false;
			if(newdata.sharedText==undefined) newdata.sharedText=false;
		}
		if(baseData.parts.length>i+1){
			baseData.parts.splice(i+1,0,newdata);//途中に追加
		}else{
			baseData.parts[i+1] = newdata;//最後に追加
		}
		saveStackData();
		innerGoCard(currentCardObj);
		waitGo();
		//makeObjectsWindow();
	}
}

function authPasteCard(baseData){
	var i = cardData.indexOf(baseData);
	if(i!=undefined){
		//追加
		var newdata = myClone(authClipboard);
		newdata.id = newCardId();
		delete newdata.type;
		if(cardData.length>i+1){
			cardData.splice(i+1,0,newdata);//途中に追加
		}else{
			cardData[i+1] = newdata;//最後に追加
		}
		saveStackData();
		innerGoCard(newdata);
		waitGo();
		//makeObjectsWindow();
	}
}

function myClone(obj){
	return JSON.parse((JSON.stringify(obj)));
}

var vmStopFlag = false;
function extractQueue(opt){
	var result=undefined;
	workerDB.transaction(function(tx){
		//実行
		var rs = tx.executeSql("select * from eventQ");
		// eventQテーブルに格納されている全ての値を列挙
		var rows = rs.rows;
		for (var i = 0, n = rows.length; i < n; i++) {
			var row = rows.item(i);
			switch(row.event){
			case "keys":
				keys[row.opt] = row.arg=="true";
				break;
			case "mouse":
				if(row.opt=="mouseH"||row.opt=="mouseV"||row.opt=="clickH"||row.opt=="clickV"||row.opt=="mouseLoc"||row.opt=="clickLoc"||row.opt=="click"){
					mouse["_"+row.opt] = row.arg;
				}else{
					mouse[row.opt] = row.arg;
				}
				break;
			case "system":
				//postMessage(row.opt);
				system[row.opt] = row.arg;
				if(opt=="system"){
					result = "";
					return;
				}
				break;
			case "answer":
				if(opt=="answer"){
					result = it = row.arg;
					system._result = "";
					return;
				}
				break;
			case "ask":
				if(opt=="ask"){
					result = it = row.arg;
					system._result = row.opt;
					return;
				}
				break;
			case "find":
				var obj = JSON.parse(row.arg);
				system._foundChunk = obj.foundChunk;
				system._foundField = obj.foundField;
				system._foundLine = obj.foundLine;
				system._foundText = obj.foundText;
				if(opt=="find"){
					result = obj.result;
					system._result = row.opt;
					return;
				}
				break;
			case "selectedProps":
				var elm = "";
				if(row.arg) elm = JSON.parse(row.arg);
				var txt = "";
				if(row.opt) txt = JSON.parse(row.opt);
				system._selectedElm = elm;
				system._selectedTxt = txt;
				if(opt=="selectedProps"){
					return "";
				}
				break;
			case "stop":
				postMessage("user-stop");
				vmStopFlag = true;
				break;
			case "objpropchange":
				//postMessage(row.arg);
				var carg = JSON.parse(row.arg);
				var type = carg.type;
				var id = carg.id;
				var parent = carg.parent;
				var parentId = carg.parentId;
				var obj = getObjectByParam(type,id,parent,parentId);
				if(obj){
					if(row.opt=="selectedLine") obj[row.opt] = "force"+carg.value;
					else obj[row.opt] = carg.value;
				}
				break;
			case "changeObjCountReset":
				changeObjCount=0;
				break;
			case "go":
				if(opt=="go"){
					result = "1";
					return;
				}
				break;
			case "img":
				if(opt=="img"){
					result = "1";
					return;
				}
				break;
			case "ajaxget":
				if(opt=="ajaxget"){
					result = row.arg;
					system._result = "";
					return;
				}
				break;
			}
			tx.executeSql("delete from eventQ where event = ?",[row.event]);
		}
	}, function(){
		//エラー
		postMessage("worker db transaction error.");
	});

	return result;
}

function innerGoCard(cardObj, notUseHistory, lockMsg){
	if(notUseHistory!=true && currentCardObj!=undefined && !system.lockRecent){
		cardHistory[cardHistory.length] = currentCardObj.id;
		cardForward = [];
	}
	currentCardObj = cardObj;
	if(currentCardObj==undefined){
		//初回はundefined
		postMessage({cmd:"go", arg:undefined});
		return;
	}
	var visObj = system.visual.shift();
	postMessage({cmd:"go", arg:operaCloneObj(currentCardObj), arg2:operaCloneObj(bgById(currentCardObj.background)), visual:visObj, lockMsg:lockMsg});
	//wait(1);
	//postMessage("innerGoCard:"+cardObj.id);
}

function operaCloneObj(obj){
	if(!obj)return "";
	//scriptなどの不要な情報をのぞいてcloneする
	//if(navigator.userAgent.indexOf("Opera")!=-1){
	return JSON.parse(JSON.stringify(obj));
	//}else{
	//	return obj;
	//}
}

//function makeObjectsWindow(){
//postMessage({cmd:"makeObjectsWindow", arg:operaCloneObj(cardData), bgdata:operaCloneObj(bgData)});

//}

function idle(){
	if(system.selectedTool=="browse"&&currentCardObj&&!inRunVm){
		if(system.cursor!="hand"){
			system.cursor = "hand";
		}
		sendCommand(currentCardObj,"idle");

		if(changedStack){
			saveStackData();
		}
	}
}
