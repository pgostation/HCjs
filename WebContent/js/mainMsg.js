"use strict";

var mmsgDB = undefined;

function mmsgCreateDB(uniqId){
	if (!window.openDatabase) {
		//alert("This web app is not support this web browser yet.");
		return;
	}
	//新規作成
	mmsgDB = openDatabase('sq-'+uniqId, '1.0.0', 'stackQueue-'+uniqId, 1*1024);
	if (!mmsgDB) {
		alert("Can't open DB.");
		return;
	}
	mmsgDB.transaction(function(tx){
		//実行
		tx.executeSql("create table if not exists eventQ (event, opt, arg)");
	}, function(){
		//エラー
		alert("db transaction error.");
		mmsgDB = undefined;
	}, function(){
		//成功
		//alert("db transaction succeed.");
	});
	//保存
}

function mmsgSyncProperty(event, opt, arg){
	//リアルタイムに変更しなければならないイベントをSQLデータベースを通じてworkerに通知
	//  (例)各オブジェクトやシステムのプロパティ変更
	if(!mmsgDB) return;
	mmsgDB.transaction(function(tx){
		//実行
		tx.executeSql("insert into eventQ (event, opt, arg) values (?, ?, ?)", [event, opt, arg], mSPrunOk, mSPrunErr);
	}, mSPerr, mSPok);
	mmsgSendSystemEvent("changeProperty");
}


function mSPrunOk(){
	//成功
	//alert("sql execute succeed. entry inserted.");
}
function mSPrunErr(){
	//エラー
	answer("sql execute error2.");
}
function mSPerr(){
	//エラー
	answer("db transaction error2.");
}
function mSPok(){
	//成功
	//alert("db transaction succeed2.");
}

function sendEvent(obj, msg, args){
	if(obj!=undefined){
		scWorker.postMessage({event:"msg", msg:msg, type:obj.type, id:obj.id, parent:obj.parent, parentId:obj.parentId, args:args});
	}
}

function sendCommand(obj, msg){
	if(obj!=undefined){
		scWorker.postMessage({event:"command", msg:msg, type:obj.type, id:obj.id, parent:obj.parent, parentId:obj.parentId});
	}
}

function mmsgSendSystemEvent(event,content){
	scWorker.postMessage({event:event,content:content});
}

function mmsgRecieveEvent(event){
	if(!event.data){
		console.log(event.data);
	}
	//workerからのイベントを取得
	switch(event.data.cmd){
	case "go":
		var saved = system.lockedMessages;
		if(event.data.lockMsg){
			system.lockedMessages = true;
		}
		drawGoCard(event.data.arg, event.data.arg2, event.data.visual);
		if(event.data.lockMsg){
			system.lockedMessages = saved;
		}
		break;
	case "stackData1":
		stackData1 = event.data.arg;
		paint.width = stackData1.width;
		paint.height = stackData1.height;
		paint.zwidth = stackData1.width;
		paint.zheight = stackData1.height;
		system.userLevel = stackData1.userLevel;
		setUserLevel(system.userLevel);
		break;
	case "rsrcData":
		rsrcData = event.data.arg;
		break;
	case "xcmdData":
		xcmdData = event.data.arg;
		break;
	case "addcolorData":
		addcolorData = event.data.arg;
		break;
		//case "makeObjectsWindow":
		//	makeObjectsWindow(event.data.arg, event.data.bgdata);
		//	break;
	case "getCardNum":
		document.getElementById('cardNumber').textContent = event.data.arg+1;
		break;
	case "getBgNum":
		document.getElementById('bkgndNumber').textContent = event.data.arg+1;
		break;
	case "innerSetHoverObject":
		innerSetHoverObject(event.data.arg);
		break;
	case "tool":
		changeTool(event.data.arg);
		break;
	case "recent":
		showRecent(event.data.arg, event.data.arg2);
		break;
	case "changeProp":
		//console.log("changeProp:"+event.data.obj);
		switch(event.data.obj){
		case "system":
			if(event.data.prop=="lockedScreen" && system.lockedScreen==true && event.data.value==false){
				if(goInlockScreen || changePropQ.length>100){
					var saved = system.lockedMessages;
					system.lockedMessages = true;
					system.lockedScreen=false;
					drawGoCard(currentCardObj,currentBgObj);
					system.lockedMessages = saved;
					resetPropFrame();
					goInlockScreen = false;
				}
				else{
					popPropFrame();
				}
			}
			else if(event.data.prop=="editBackground"){
				var c = document.getElementById('footer1').className.split(" ");
				c[1] = event.data.value?"FooterB":"Footer";
				document.getElementById('footer1').className = c.join(' ');
				innerGoCard(currentCardObj);
			}
			else if(event.data.prop=="userLevel"){
				setUserLevel(event.data.value);
			}
			else if(event.data.prop=="cursor"){
				var x = (event.data.value+"").toLowerCase();
				switch(x){
				case "ibeam":
					setCursorFunc("text");break;
				case "cross":
				case "plus":
					setCursorFunc("crosshair");break;
				case "watch":
					setCursorFunc("wait");
					showSpinAnim();
					break;
				case "hand":
					setCursorFunc("pointer");
					hideSpinAnim();
					break;
				case "busy":
					setCursorFunc("progress");
					showSpinAnim();
					break;
				case "none":
					setCursorFunc("url(img/cr_None.cur),auto");
					hideSpinAnim();
					break;
				case "arrow":
					setCursorFunc("default");break;
				}
			}
			//console.log("system["+event.data.prop+"] = "+event.data.value);
			system[event.data.prop] = event.data.value;
			break;
		}
		break;
	case "changeObj":
		var baseObj=null;
		var isbg = "";
		var obj = null;
		var eobj = JSON.parse(event.data.obj);
		if(eobj.type=="button"||eobj.type=="field"){
			switch(eobj.parent){
			case "card":
				baseObj = currentCardObj;
				break;
			case "background":
				baseObj = currentBgObj;
				isbg = "bg-";
				break;
			default:
				console.log('?');
			}
			obj = findPartsById(eobj.id, baseObj.parts, eobj.type);
		}
		else if(eobj.type=="card"&&eobj.id==currentCardObj.id){
			obj = currentCardObj;
		}
		else if(eobj.type=="stack"){
			if(event.data.prop=="showNavigator"){
				stackData1.showNavigator = eobj["showNavigator"];
				document.getElementById("ipadnav").style.display = stackData1.showNavigator?"":"none";
			}
			break;
		}
		if(!obj) break;
		var eprop = event.data.prop;
		if(obj[eprop] != eobj[eprop] || obj[eprop]==null){
			if(eobj[eprop]!=null) obj[eprop] = eobj[eprop];
			else if(eprop=="topLeft"){
				obj.left = eobj.left;
				obj.top = eobj.top;
			}
			else if(eprop=="rect"){
				obj.left = eobj.left;
				obj.top = eobj.top;
				obj.width = eobj.width;
				obj.height = eobj.height;
			}
			if(!system.lockedScreen){
				changePropFrame(obj, eprop, isbg);
			}
			else{
				pushPropFrame(obj, eprop, isbg);
			}
		}
		break;
	case "changeBgObj":
		var obj = JSON.parse(event.data.obj);
		var id = event.data.id;
		var prop = event.data.prop;
		/*if(prop=="hilite")*/{
			var parts = currentBgObj.parts;
			for(var i=0; i<parts.length; i++){
				if(parts[i].id == id){
					obj.id = id;
					obj.style = parts[i].style;
					obj.type = parts[i].type;
					obj.parentId = currentBgObj.id;
					changePropFrame(obj, prop, "bg");
				}
			}
		}
		break;
	case "changeSysObj":
		switch(event.data.obj.type){
		case "message":
			if(event.data.prop=="text"){
				document.getElementById('messagebox').value = event.data.obj[event.data.prop];
				if(document.getElementById('messagebox').parentNode.parentNode.style.display=='none'){
					execMenu('message nofocus');
				}
			}
			break;
		}
		break;
	case "ajaxLogin":
		ajaxLoginOpen((browserLang=="ja")?"このスタックを見るにはログインが必要です":"Login to view the stack", function(status){
			$('#loginDialog').dialog('close');
			mmsgSendSystemEvent("loadStackData");
		});
		break;
	case "ajaxLoginForChange":
		ajaxLoginOpen((browserLang=="ja")?"このスタックを変更するにはログインが必要です":"Login to edit the stack", function(status){
			$('#loginDialog').dialog('close');
		});
		break;
	case "answer":
		answer(event.data.msg, event.data.str1, event.data.str2, event.data.str3);
		break;
	case "answerFile":
		console.log("answerFile--safari File API待ち");
		break;
	case "ask":
		ask(event.data.msg, event.data.str);
		break;
	case "askPassword":
		askPassword(event.data.msg, event.data.str);
		break;
	case "beep":
		beep();
		break;
	case "click":
		clickAt(event.data.x, event.data.y);
		break;
	case "createMenu":
		createMenu(event.data.menu);
		break;
	case "deleteMenu":
		deleteMenu(event.data.menu);
		break;
	case "disableMenu":
		disableMenu(event.data.menu);
		break;
	case "disableMenuitem":
		disableMenuitem(event.data.menu, event.data.menuitem);
		break;
	case "enableMenu":
		enableMenu(event.data.menu);
		break;
	case "enableMenuitem":
		enableMenuitem(event.data.menu, event.data.menuitem);
		break;
	case "flash":
		flash();
		break;
	case "resetMenubar":
		resetMenubar();
		break;
	case "doMenu":
		doMenuCmd(event.data.menu);
		break;
	case "editScript":
		editScript(event.data.obj);
		break;
	case "find":
		findString(event.data.opt, event.data.string, event.data.fld, event.data.cds, event.data.bgs);
		break;
	case "findnext":
		findNext();
		break;
	case "palette":
		paletteCmd(event.data.opt, event.data.point);
		break;
	case "picture":
		pictureCmd(event.data.opt, event.data.fileType, event.data.windowStyle, event.data.visible);
		break;
	case "play":
		playCmd(event.data.opt);
		break;
	case "selectLine":
		selectLineCmd(event.data.obj, event.data.line);
		break;
	case "getSelectedProps":
		mmsgSyncProperty("selectedProps", JSON.stringify(getSelection()), JSON.stringify(document.getSelection()));
		break;
	case "uxback":
		UxBack(event.data.mode, event.data.opt1, event.data.opt2);
		break;
	case "addcolor":
		var d = event.data;
		//console.log(d.mode);
		if(d.mode=="remove")addColorRemove();
		if(d.mode=="removeAfter") addColorRemoveFlag = true;
		if(d.mode=="enabled")addColorObjEnabled(d.id, d.value);
		if(d.mode=="colorCard")addColorCard(d.effect, d.time, "cd");
		if(d.mode=="colorPict")addColorPict(d.pict, d.point, d.rect, d.paintmode, d.effect, d.time);
		break;
	case "paletteVisible":
		paletteVisible(event.data.obj, event.data.prop);
		break;
	case "paletteLoc":
		paletteLoc(event.data.obj, event.data.prop);
		break;
	case "menuBarVisible":
		menuBarVisible(event.data.prop);
		break;
	case "newPgColorXBuf":
		newPgColorXBuf(event.data.port, event.data.size, event.data.pict);
		break;
	case "PgColorXCopyBits":
		PgColorXCopyBits(event.data.port, event.data.dport, event.data.src, event.data.dst, event.data.mode, event.data.tile);
		break;
	case "PgColorXDrawString":
		PgColorXDrawString(event.data.port, event.data.text, event.data.topleft, event.data.color, event.data.mode, event.data.font, event.data.fontsize, event.data.fontstyle);
		break;
	case "VirtualPadInstall":
		VirtualPadInstall(event.data.keys);
		break;
	case "saveLocalStorage":
		var alldata = event.data.sdata;
		if(alldata==null){
			delete localStorage[userParameter+":"+nameParameter+":data"];
		}else{
			localStorage[userParameter+":"+nameParameter+":data"] = JSON.stringify(alldata);
		}
		break;
	case "debug":
		debugCommand(event.data.opt,event.data.value);
		break;
	case "ajaxget":
		ajaxGetCommand(event.data.url,event.data.postdata);
		break;
	case "startRun":
		inRunning = true;
		break;
	case "endRun":
		inRunning = false;
		break;
	default:
		console.log(event.data);
	}
}

function workerInit(){
	mmsgSendSystemEvent("userId",userId);
	mmsgSendSystemEvent("userName",userParameter);
	mmsgSendSystemEvent("stackName",nameParameter);
	mmsgSendSystemEvent("browserLang",browserLang);
	mmsgSendSystemEvent("uniqId",uniqId);
	mmsgCreateDB(uniqId);
}
