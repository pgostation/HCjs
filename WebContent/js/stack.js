//"use strict";

//--
//init
function onLoadExec(){
	/*if(window.sessionStorage==undefined){
    	alert("This application can't run on this web browser.");
    	return;
    }*/
	window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

	document.getElementById("page").addEventListener("mousemove", mouseMove, true);
	//document.getElementById("page").onmouseup = function(){mouse.button="up";};
	//document.getElementById("page").onmousedown = function(){mouse.button="down";}; //これ入れるとブラシの動作がおかしくなる
	document.getElementById("overrayBack").onmouseup = function(){_mouse.setClick(event);};
	document.getElementById("overrayBack").onmousedown = function(){_mouse.setClickDown(event);};
	keysInit();
	touchInit();
	menuInit();
	uniqId = 1;//Math.random()*100000|0;
	workerInit1();
	mmsgSendSystemEvent("masterEditMode",{masterEditMode:masterEditMode});
	var localData = localStorage?localStorage[userParameter+":"+nameParameter+":data"]:null;
	if(localData) localData = JSON.parse(localData);
	mmsgSendSystemEvent("localStorageData",localData);
	mmsgSendSystemEvent("loadStackData");
	mmsgSendSystemEvent("browserCheck", {
		webaudioapi: window.webkitAudioContext!=null,
	});

	window.addEventListener('resize', windowResize);
	windowResize();

	UIButtonInit();

	resetMenubarInit();

	if((userId==userParameter) && (masterEditMode==false)){
		answer(alertTranslate("This stack is protected. So HCjs save changes at personal area."));
	}

	if('createTouch' in document && window.innerWidth<=480){ //iOS5では使えない
		var x = document.getElementById("par");
		if(x.webkitRequestFullScreen) x.webkitRequestFullScreen();
	}
	showSpinAnim("page");
}

function workerInit1(){
	scWorker = new Worker("js/worker.js?"+(Math.random()*10000|0));
	scWorker.addEventListener("message", mmsgRecieveEvent, true);
	scWorker.onerror = function(error){
		hideSpinAnim();
		if(currentCardObj==null && error.message.indexOf("openDatabaseSync")==-1){
			//読み込み前のエラーはalert表示
			alert(error.message+"\n"+error.filename+"\n line:"+error.lineno);
		}else{
			console.log(error.message+"\n"+error.filename+"\n line:"+error.lineno);
		}
	};
	workerInit();
	window.onunload = function(event){
		scWorker.terminate();
	};
}

var lockScaling = false;
var cardScale = 1.0;
var cardTopOffset = 0;
var lastCardX,lastCardY;
var keyBoardHeight = null;
function windowResize(){
	var h = window.innerHeight;
	var w = window.innerWidth;
	if(document.getElementById('scriptEditor').style.display!="none" && 'createTouch' in document && document.activeElement && document.activeElement.tagName=="DIV"){
		if(keyBoardHeight==null){
			keyBoardHeight = -1;
		}else if(keyBoardHeight==-1){
			keyBoardHeight = 0;
			setTimeout(function(){
				window.scroll(0, 400);
				setTimeout(function(){
					keyBoardHeight = window.scrollY;
					window.scroll(0, 0);
				},0);
			},0);
		}
		else{
			h -= keyBoardHeight;
		}
	}
	if(document.getElementById('scriptEditor').style.display=="none" && 'createTouch' in document && document.activeElement && document.activeElement.tagName=="DIV"){
		return;
	}
	if('createTouch' in document && document.activeElement && document.activeElement.tagName=="TEXTAREA"){
		return;
	}
	if(h<50||w<50)return;
	var d = 0;
	var t = 0;
	if(document.getElementById("footer1").style.display!="none"){
		d += document.getElementById("footer1").offsetHeight;
	}
	if(document.getElementById("button-palette").style.display!="none"){
		d += document.getElementById("button-palette").offsetHeight;
		t += document.getElementById("button-palette").offsetHeight;
	}
	if(document.getElementById("field-palette").style.display!="none"){
		d += document.getElementById("field-palette").offsetHeight;
		t += document.getElementById("field-palette").offsetHeight;
	}
	cardTopOffset = t;

	document.getElementById("par").style.height = (h-d)+"px";
	document.getElementById("page").style.height = (h-d)+"px";
	document.getElementById("par").style.width = (w)+"px";
	document.getElementById("page").style.width = (w)+"px";

	document.getElementById("footer1").style.top = (h)+"px";
	document.getElementById("scriptEditorFooter").style.top = (h)+"px";

	if(!lockScaling&&stackData1){
		cardScale = Math.min((w)/stackData1.width, (h-d)/stackData1.height);
		if(cardScale>2.0) cardScale=2.0;
		if(cardScale<0.25) cardScale=0.25;
	}
	document.getElementById('cardBack').parentNode.style['MozTransform'] = "scale("+cardScale+")";
	document.getElementById('cardBack').parentNode.style['-webkit-transform'] = "scale("+cardScale+")";

	//pictureウィンドウの拡大と移動
	var cardX = document.getElementById('cardBack').parentNode.offsetLeft+document.getElementById('cardBack').parentNode.offsetWidth/2;
	var cardY = document.getElementById('cardBack').parentNode.offsetTop+document.getElementById('cardBack').parentNode.offsetHeight/2;
	if(lastCardX==null){
		lastCardX = cardX;
		lastCardY = cardY;
	}
	var elms = document.getElementsByClassName("Picture");
	for(var i=0; i<elms.length; i++){
		elms[i].style['MozTransform'] = "scale("+cardScale+")";
		elms[i].style['-webkit-transform'] = "scale("+cardScale+")";
		elms[i].style.left = parseInt(elms[i].style.left)+(cardX-lastCardX)+"px";
		elms[i].style.top = parseInt(elms[i].style.top)+(cardY-lastCardY)+"px";
	}
	lastCardX = cardX;
	lastCardY = cardY;

	var cardParent = document.getElementById("cardBack").parentNode;
	cardParent.style.marginLeft = -stackData1.width/2+"px";
	cardParent.style.marginTop = -stackData1.height/2+t+"px";

	var menuHeight = document.getElementById("footer1").offsetHeight;
	var scriptEditorPanel = document.getElementById("scriptEditorPanel");
	var panelHeight = scriptEditorPanel.offsetHeight;
	if(scriptEditorPanel.style.display=="none") panelHeight=0;
	document.getElementById("scriptEditorTab").style.height = h-menuHeight-panelHeight+"px";
	var elm2 = document.getElementById(currentSelectScriptTab);
	if(elm2 && elm2.childNodes[0]){
		elm2.childNodes[0].style.height = h-elm2.offsetTop-menuHeight-panelHeight-10+"px";
	}
	//screenRectやgetmonitor用
	mmsgSyncProperty("system","innerWidth",window.innerWidth);
	mmsgSyncProperty("system","innerHeight",window.innerHeight);
}

function getCardTop(){
	return cardTopOffset;
}

function getCardScale(){
	return cardScale;
}

function UIButtonInit(){
	$("#footer1 button").button();
	$("#answerDialog div div button").button();
	$("#askDialog div div button").button();
	$('#footer1').fadeIn('slow');

	infoDialogInit("#buttonInfo");
	infoDialogInit("#fieldInfo");
	infoDialogInit("#cardInfo");
	infoDialogInit("#bkgndInfo");
	infoDialogInit("#stackInfo");

	$("#scriptEditorTab").tabs({
		select: selectScriptEditorTab,
	});
	$("#scriptEditor button").button();

	$("button").bind("touchstart",menubtntouchstart);
	$("button").bind("touchmove",menubtntouchmove);
	$("button").bind("touchend",menubtntouchend);

	$("#messageboxDiv").draggable();
	$("#helpDialog").dialog({
		autoOpen:false,
		modal:true,
		open:function(event,ui){touchInitClear();},
		close:function(event,ui){touchInit();},
	}).hide();

	$("#loginDialog input[type='submit']").button();
	$("#loginDialog").dialog({
		autoOpen:false,
		modal:true,
		title:(browserLang=="ja")?"HCjs ログイン":"Login",
				open:function(event,ui){touchInitClear();},
				close:function(event,ui){touchInit();},
	}).hide();
	$('#loginForm').submit(function(){
		var postData = $("#loginForm").serialize();
		$.post('./login',postData,loginCallback);
		return false;
	});


	$("#colorPalette").draggable({
		handle:".smallTitleBar",
		//cancel:"svg,input,select,canvas,span",
	});

	$("#contentEditor button").button();
	$("#contentEditor").dialog({
		autoOpen:false,
		modal:false, //モーダルにすると２回目からキー入力が効かなくなる
		title:"Button Content",
		open:function(event,ui){touchInitClear();},
		close:function(event,ui){touchInit();},
	});

	$("#fontDialog button").button();
	$("#fontDialog").dialog({
		autoOpen:false,
		modal:true,
		title:"Font",
		open:function(){
			$(".ui-dialog-titlebar-close").hide();
			var fonts = getFontNameList();
			var fontnameElm = document.getElementById("fdName");
			for(var i=0; i<fonts.length; i++){
				var optionElm = document.createElement('option');
				optionElm.textContent = fonts[i];
				fontnameElm.appendChild(optionElm);
			}
		},
		close:function(event,ui){touchInit();},
	});

	$("#rsrcFooter div button").button();
	$("#rsrcItemDialog").dialog({
		autoOpen:false,
		modal:true,
		title:"Resource Information",
	});
	$("#rsrcItemDialog button").button();
	$("#rsrcImageSizeDialog").dialog({
		autoOpen:false,
		modal:true,
		title:"Image Size",
		open:rsrcImageSizeDialogOpened,
	});
	$("#rsrcImageSizeDialog button").button();
	$("#rsrcListReturn").button();

	$("#uploadFileDialog").dialog({
		autoOpen:false,
		modal:true,
		title:"File Upload",
		open:function(){
			document.getElementById('uploadFileFrame').src="fileframe.jsp?author="+userParameter+"&name="+nameParameter;
		},
		close:function(){
			var fname = document.getElementById("uploadFileDialog").fname;
			if(fname){
				if(document.getElementById('resourceEditor').style.display!='none'){
					newRsrcFile({name:fname});
				}else{
					uploadPaintFile(null,{name:fname});
				}
				delete document.getElementById("uploadFileDialog").fname;
			}
		}
	});
	$("#uploadFileDialog button").button();

	$("#paintScaleDialog button").button();
	$("#paintScaleDialog").dialog({
		autoOpen:false,
		modal:true,
		title:"Scale Selection",
		open:paintScaleDialogOpened,
	});
}

function infoDialogInit(dialogId){
	$(dialogId).accordion({
		header: "h3",
		collapsible:true,
		autoHeight:false,
		active:0
	});
	$(dialogId+" input[type='button']").button();
	$(dialogId+" button").button();
	$(dialogId+" input[type='text']").bind('blur',function(){windowResize();});
}

function tapstartEvent(){
	if(('ontouchstart' in window)){
		return "touchstart";
	}else{
		return "mousedown";
	}
}/*
function tapEvent(){
	if(('ontouchstart' in window)){
		return "touchend";
	}else{
		return "mouseup";
	}
}*/

var uniqId;
var scWorker;
var tbDragObj = null;

//--
//ログイン
var loginCallback;
function loginCallback(data){
	alert(data.status);
	loginCallback(data.status);
}

function ajaxLoginOpen(msg, callback){
	$('#loginDialogMsg').html("");
	$('#loginDialogMsg').append(msg);
	loginCallback = callback;
	$('#loginDialog').dialog('open');
}

//--
//ユーティリティ関数
function escapeHTML(str) {
	if(str==undefined) return str;
	return str.replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/\n/g, "<br>").replace(/\s/g, "&nbsp;");
}
function unescapeHTML(str) {
	if(str==undefined) return str;
	return str.replace(/<div><br><\/div>/g,"\n").replace(/<\/div>/g,"").replace(/<div>/g,"\n").replace(/<br>/g,"\n").replace(/&nbsp;/g," ").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&quot;/g,"\"").replace(/&amp;/g,"&");
}

function isChrome(){
	return (navigator.userAgent.indexOf('Chrome/')!=-1);
}

function isWebKit(){
	return (navigator.userAgent.indexOf('WebKit')!=-1);
}

function isMacOS(){
	return (navigator.userAgent.indexOf('Mac')!=-1);
}

function isFirefox(){
	return (navigator.userAgent.indexOf('Firefox')!=-1);
}


//--
//パーツの位置

var partsAry = [];
var btnsAry = [];
var fldsAry = [];
//var navbtnsAry = [];

function setPartsRect(){
	partsAry = [];
	btnsAry = [];
	fldsAry = [];
	//navbtnsAry = [];
	var i,tags,len;
	tags = document.getElementsByClassName("Parts");
	for(i=0, len=tags.length; i<len; i++){
		if (tags[i].id.match(/button-.*[0-9]s{0,1}$/)) {
			partsAry[partsAry.length]=tags[i];
			btnsAry[btnsAry.length]=tags[i];
		}
		if (tags[i].id.match(/field-.*[0-9]s{0,1}$/)) {
			partsAry[partsAry.length]=tags[i];
			fldsAry[fldsAry.length]=tags[i];
		}
		/*if (tags[i].id.match(/button-nav-/)) {
      navbtnsAry[navbtnsAry.length]=tags[i];
    }*/
	}
}


function getButtonAtPoint(xx,yy){
	//var x = xx - document.getElementById("cardBack").parentNode.offsetLeft;
	//var y = yy - document.getElementById("cardBack").parentNode.offsetTop;
	var x = (xx - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
	var y = (yy - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;

	if(x<0 || y<0 || x > $('#cardBack').width() || y > $('#cardBack').height()){
		return null;
	}

	var i,btn;
	for(i=btnsAry.length-1; i>=0; i--){
		btn = btnsAry[i];
		if(btn.style.visibility!="hidden" && x>=btn.offsetLeft && x<=btn.offsetLeft+btn.offsetWidth && y>=btn.offsetTop && y<=btn.offsetTop+btn.offsetHeight){
			if(btn.tagName=="div"){
				btn = btn.childNodes[0];
			}
			return btn;
		}
	}

	return null;
}

function getFieldAtPoint(xx,yy){
	var x = (xx - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
	var y = (yy - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;

	if(x<0 || y<0 || x > $('#cardBack').width() || y > $('#cardBack').height()){
		return null;
	}

	var i,fld;
	for(i=fldsAry.length-1; i>=0; i--){
		fld = fldsAry[i];
		if(fld.style.visibility!="hidden" && x>=fld.offsetLeft && x<=fld.offsetLeft+fld.offsetWidth && y>=fld.offsetTop && y<=fld.offsetTop+fld.offsetHeight){
			if(fld.tagName=="div"){
				fld = fld.childNodes[0];
			}
			return fld;
		}
	}

	return null;
}

//--
//タッチイベント

var startY=[]; var endY=[]; var startX=[]; var endX=[]; //タッチされた位置を記憶して、位置がずれた場合はタップイベントにしない
var hiliteBtn=[]; var downBtn=[];var startTouch=[];
//var hiliteMenu=null;

function nowdown(){
	/*var msg='';
  var identifier=0;
  for(identifier in downBtn){
    msg += downBtn[identifier].id+' ';
  }
  document.getElementById("messagebox").value=msg;*/
}

function touchStart(e){
	if(document.getElementById("overrayBack").style.display!="none"){
		if('createTouch' in document && document.activeElement.tagName=="INPUT" && e.target==document.activeElement){
			e.preventDefault();
			//askダイアログのときにキーボードが隠れないようにする
			//ボタン情報ダイアログで閉じれるようにする
			//など色々な条件を満足すること。
		}
		return;
	}
	var i, btn/*, menu*/;
	for(i=0; i<e.touches.length; i++){
		finger = e.touches[i];
		identifier = finger.identifier+'_';
		if(startX[identifier]!=undefined) continue;
		startTouch[identifier] = new Date()-0;
		startX[identifier] = endX[identifier] = finger.pageX;
		startY[identifier] = endY[identifier] = finger.pageY;
		if((btn= getButtonAtPoint(startX[identifier],startY[identifier])) !=null){
			if(e.touches.length==1 && (selectedTool=="button")){
				btn.onmouseover(e);
				e.pageX = startX[identifier];
				e.pageY = startY[identifier];
			}
			btn.onmousedown(e);
			downBtn[identifier]=btn;
			hiliteBtn[identifier]=btn;
		}
		else if((btn= getFieldAtPoint(startX[identifier],startY[identifier])) !=null){
			if(e.touches.length==1 && (selectedTool=="field")){
				btn.onmouseover(e);
				e.pageX = startX[identifier];
				e.pageY = startY[identifier];
			}
			btn.onmousedown(e);
			downBtn[identifier]=btn;
			nowdown();
			e.preventDefault();
			if(btn.isContentEditable && selectedTool=="browse"){
				btn.focus();
				btn.addEventListener('blur', function(){
					closeKeyboard();
					touchInit();
				}, false);
				touchInitClear();
			}
			return;
		}
		else if(document.getElementById('dontclick').style.visibility=='visible'){
			//clearMenuDown();
		}
		else{
			/*closeKeyboard();
			if(document.activeElement.blur){
				document.activeElement.blur();
			}*/
			windowResize();
		}
	}
	nowdown();
	e.preventDefault();
}

function touchMove(e){
	if(e.touches.length==1){
		var identifier = e.touches[0].identifier;
		e.pageX = endX[identifier];
		e.pageY = endY[identifier];
		_mouse.setLoc(e);
	}
	var i,finger,btn;
	for(i=0; i<e.touches.length; i++){
		finger = e.touches[i];
		identifier = finger.identifier+'_';
		endX[identifier] = finger.pageX;
		endY[identifier] = finger.pageY;
		btn = getButtonAtPoint(endX[identifier],endY[identifier]);
		if(btn!=hiliteBtn[identifier] && hiliteBtn[identifier]!=null){
			hiliteBtn[identifier].onmouseout(e);
			hiliteBtn[identifier]=null;
		}
		else if(btn!=null&&btn==downBtn[identifier] && hiliteBtn[identifier]==null){
			btn.onmouseover(e);
			hiliteBtn[identifier]=btn;
		}
		else if(tbOverObj!=null && document.getElementById("overrayBack").style.display=="none"){
			if(Math.abs(endX[identifier]-startX[identifier])>20 || Math.abs(endY[identifier]-startY[identifier])>20){
				if(tbDragObj)tbDragObj.style.outline = "2px dotted #88f";
				tbOverObj.style.cursor = "move";
			}
			e.pageX = endX[identifier];
			e.pageY = endY[identifier];
			mouseMove(e);
		}
		if((btn= getFieldAtPoint(startX[identifier],startY[identifier]))!=null && downBtn[identifier]==btn){
			//
			return;
		}
	}
	nowdown();
	e.preventDefault();
}

//var doubleTap = {};

function touchEnd(e){
	lastDate = new Date();
	var ids = [];
	var i,identifier=0;
	for(i=0; i<e.touches.length; i++){
		ids[e.touches[i].identifier+'_']=true;
	}
	for(identifier in startX){
		if(ids[identifier] == undefined){
			btn = getButtonAtPoint(endX[identifier],endY[identifier]);
			if(selectedTool=="field" || btn==null){
				btn = getFieldAtPoint(endX[identifier],endY[identifier]);
			}
			if(btn==downBtn[identifier] && btn!=null){
				var o2 = $("#"+btn.id).offset().top;
				e.offsetY = endY[identifier] - o2-8;
				btn.onmouseup(e);
				//doubleTap.btn = btn;
				if(Math.abs(endX[identifier]-startX[identifier]) + Math.abs(endY[identifier]-startY[identifier])<5 &&
						new Date()-startTouch[identifier] < 500)
				{
					if(!document.getElementById("anchor-0")){
						if(selectedTool=="button" && tbSelectedButton!=null){
							showButtonInfo(tbSelectedButton);
						}
						else if(selectedTool=="field" && tbSelectedField!=null){
							showFieldInfo(tbSelectedField);
						}
						else{
							btn.focus();
						}
					}
				}
			}
			else if(hiliteBtn[identifier]!=null){
				hiliteBtn[identifier].onmouseout(e);
			}
			/*if(doubleTap.btn!=null && (new Date() - doubleTap.time) <= 500 &&
      	Math.abs(doubleTap.x - endX[identifier])<10 && Math.abs(doubleTap.y - endY[identifier])<10)
      {
      	//doubleTap
      	if(selectedTool=="button"){
      		showButtonInfo(tbSelectedButton);
      	}
      	else if(selectedTool=="field"){
      		showFieldInfo(tbSelectedField);
      	}
      }
      if(e.touches.length==0){
	      doubleTap.time = new Date();
	      doubleTap.x = endX[identifier];
	      doubleTap.y = endY[identifier];
      }*/
			delete downBtn[identifier];
			delete hiliteBtn[identifier];
			delete startX[identifier];
			delete startY[identifier];
			delete endX[identifier];
			delete endY[identifier];
			delete startTouch[identifier];
		}
	}
	nowdown();
}

function touchCancel(e){
	/*startX = endX = [];
  startY = endY = [];
  downBtn=[];
  hiliteBtn=[];*/
}

function closeKeyboard(){
	if('createTouch' in document && document.activeElement.blur && document.activeElement.tagName!="BODY"){
		//iOSでかつキーボードが開いていたら閉じる
		document.activeElement.blur();
		var s = document.getElementById("messageboxDiv").style.display;
		document.getElementById("messageboxDiv").style.display="";
		document.getElementById("messagebox").focus();
		document.getElementById("messageboxDiv").style.display=s;
		setTimeout(function(){document.getElementById("messagebox").blur();},0);
		windowResize();
		//iPadのキーボードを閉じたときにスクロールしているのでスクロール修正。テキスト入力中は動かさないようにしたい。
		if(Math.abs(window.orientation) === 90){
			//横方向では大画面モード
			//var cardBack = document.getElementById('cardBack').parentNode;
			//window.scroll(cardBack.offsetLeft, cardBack.offsetTop);
			window.scroll(0, 1);
		}
		else{
			var timerid=0;
			//clearInterval(timerid);
			timerid = setInterval(function(){ //アニメーションさせる
				window.scroll(window.pageXOffset/2,window.pageYOffset/2+1);
				if(window.pageXOffset==0 && window.pageYOffset<=2){
					clearInterval(timerid);
				}
			},50);
		}
	}
}

/*function ptouchStart(e){
	e.touches = [];
	e.touches[0] = {finger:{identifier:"123",pageX:e.pageX,pageX:e.pageY}};
	return touchStart(e);
}
function ptouchMove(e){
	e.touches = [];
	e.touches[0] = {finger:{identifier:"123",pageX:e.pageX,pageX:e.pageY}};
	return touchMove(e);
}
function ptouchEnd(e){
	e.touches = [];
	e.touches[0] = {finger:{identifier:"123",pageX:e.pageX,pageX:e.pageY}};
	return touchEnd(e);
}*/
function touchInit(){
	// タッチイベントの初期化
	/*document.addEventListener('mousedown', ptouchStart, false);
	 document.addEventListener('mousemove', ptouchMove, false);
	 document.addEventListener('mouseup', ptouchEnd, false);*/
	document.addEventListener('touchstart', touchStart, false);
	document.addEventListener('touchmove', touchMove, false);
	document.addEventListener('touchend', touchEnd, false);
	document.addEventListener('touchcancel', touchCancel, false);
	//画面向き検出
	document.addEventListener('orientationchange', orientationChange, false);
	//ボタンの位置登録
	setPartsRect();

	closeKeyboard();
}
function touchInitClear(){
	document.removeEventListener('touchstart', touchStart);
	document.removeEventListener('touchmove', touchMove);
	document.removeEventListener('touchend', touchEnd);
	document.removeEventListener('touchcancel', touchCancel);
	document.removeEventListener('orientationchange', orientationChange);
}

var downBtnId=[];

//--
function imgMouseDown(e){
	var btn;
	if((btn= getButtonAtPoint(e.pageX,e.pageY)) !=null){
		return btn.onmousedown(e);
	}
	else{
		sendEvent(currentCardObj,"mousedown");
	}
	_mouse.setClickDown(e);
}

function imgMouseUp(e){
	var btn;
	if((btn= getButtonAtPoint(e.pageX,e.pageY)) !=null){
		return btn.onmouseup(e);
	}
	else{
		sendEvent(currentCardObj,"mouseup");
	}
	_mouse.setClick(e);
}

//--
//各ボタン

var buttonDef0 = {
		name:"buttonDef0",
		returnFunc:function(){ return false; },
		contextmenu:function(){ return true; },

		mouseDownTrans:function(event,tgt){},
		mouseOverTrans:function(event,tgt){},
		mouseOutTrans:function(event,tgt){},
		mouseUpTrans:function(event,tgt){},

		mouseDownRect:function(event,tgt){},
		mouseOverRect:function(event,tgt){},
		mouseOutRect:function(event,tgt){},
		mouseUpRect:function(event,tgt){},

		mouseDownRRect:function(event,tgt){},
		mouseOverRRect:function(event,tgt){},
		mouseOutRRect:function(event,tgt){},
		mouseUpRRect:function(event,tgt){},

		mouseDownStandard:function(event,tgt){},
		mouseOverStandard:function(event,tgt){},
		mouseOutStandard:function(event,tgt){},
		mouseUpStandard:function(event,tgt){}
}; //buttonDef0

var buttonDef1 = {
		name:"buttonDef1",
		returnFunc:function(){ return true; },
		contextmenu:function(){ return true; },

		mouseDownTrans:function(event,tgt){
			_mouse.setClickDown(event,tgt);
			if(!downBtnId[tgt]){
				downBtnId[tgt]=true;
				sendEvent(getBtnData(tgt),"mousedown");
				setMouseStillDown(currentCardObj.id, tgt);
			}
			var btnData = getBtnData(tgt);
			if(btnData.autoHilite){
				this.hiliteTrans(tgt);
			}
		},
		mouseOverTrans:function(event,tgt){
			if(downBtnId[tgt]){
				this.mouseDownTrans(event,tgt);
			}
			sendEvent(getBtnData(tgt),"mouseenter");
		},
		mouseOutTrans:function(event,tgt){
			if(downBtnId[tgt]){
				var btnData = getBtnData(tgt);
				if(btnData.autoHilite){
					this.unhiliteTrans(tgt);
				}
				clearMouseStillDown(currentCardObj.id, tgt);
			}
			sendEvent(getBtnData(tgt),"mouseleave");
		},
		mouseUpTrans:function(event,tgt){
			_mouse.setClick(event,tgt);
			this.mouseOutTrans(event,tgt);
			if(_mouse.isDoubleClick){
				sendEvent(getBtnData(tgt),"mousedoubleclick");
			}
			sendEvent(getBtnData(tgt),"mouseup");
		},
		hiliteTrans:function(tgt){
			if(document.getElementById(tgt+'icon')==null || document.getElementById(tgt).className=='opaque'){
				document.getElementById(tgt).style.backgroundColor = '#000';
				if(document.getElementById(tgt).savedColor==undefined){
					document.getElementById(tgt).savedColor = document.getElementById(tgt).style.color;
					document.getElementById(tgt).style.color = '#fff';
				}
			}
			if(document.getElementById(tgt+'icon')!=null){
				var btnData = getBtnData(tgt);
				if(btnData.autoHilite) iconHilite(tgt);
			}
		},
		unhiliteTrans:function(tgt){
			document.getElementById(tgt).style.backgroundColor = 'transparent';
			if(document.getElementById(tgt).savedColor!=undefined){
				document.getElementById(tgt).style.color = document.getElementById(tgt).savedColor;
				document.getElementById(tgt).savedColor = undefined;
			}else{
				document.getElementById(tgt).style.color = "#000";
			}
			if(btnIconAry[tgt]!=undefined){
				var btnData = getBtnData(tgt);
				loadImageIcon(tgt, btnIconAry[tgt].icon, btnIconAry[tgt].rsrc, btnData.iconScaling);
			}
		},

		mouseDownRect:function(event,tgt){
			_mouse.setClickDown(event,tgt);
			if(!downBtnId[tgt]){
				downBtnId[tgt]=true;
				sendEvent(getBtnData(tgt),"mousedown");
				setMouseStillDown(currentCardObj.id, tgt);
			}
			var btnData = getBtnData(tgt);
			if(btnData.autoHilite){
				this.hiliteRect(tgt);
			}
		},
		mouseOverRect:function(event,tgt){
			if(downBtnId[tgt]){
				this.mouseDownRect(event,tgt);
			}
			sendEvent(getBtnData(tgt),"mouseenter");
		},
		mouseOutRect:function(event,tgt){
			if(document.getElementById(tgt)==null) return;
			if(downBtnId[tgt]){
				var btnData = getBtnData(tgt);
				if(btnData.autoHilite){
					this.unhiliteRect(tgt);
				}
				clearMouseStillDown(currentCardObj.id, tgt);
			}
			sendEvent(getBtnData(tgt),"mouseleave");
		},
		mouseUpRect:function(event,tgt){
			_mouse.setClick(event,tgt);
			this.mouseOutRect(event,tgt);
			if(_mouse.isDoubleClick){
				sendEvent(getBtnData(tgt),"mousedoubleclick");
			}
			sendEvent(getBtnData(tgt),"mouseup");
		},
		hiliteRect:function(tgt){
			document.getElementById(tgt).savedColor = document.getElementById(tgt).style.color;
			document.getElementById(tgt).style.backgroundColor = '#000';
			document.getElementById(tgt).style.color = '#fff';
			if(document.getElementById(tgt+'icon')!=null){
				var btnData = getBtnData(tgt);
				if(btnData.autoHilite) iconHilite(tgt);
			}
		},
		unhiliteRect:function(tgt){
			document.getElementById(tgt).style.backgroundColor = '#fff';
			document.getElementById(tgt).style.color = '#000';
			/*if(document.getElementById(tgt).savedColor!=undefined){
			document.getElementById(tgt).style.color = document.getElementById(tgt).savedColor;
			document.getElementById(tgt).savedColor = undefined;
		}*/
			if(btnIconAry[tgt]!=undefined){
				var btnData = getBtnData(tgt);
				loadImageIcon(tgt, btnIconAry[tgt].icon, btnIconAry[tgt].rsrc, btnData.iconScaling);
			}
		},

		mouseDownRRect:function(event,tgt){
			_mouse.setClickDown(event,tgt);
			if(!downBtnId[tgt]){
				downBtnId[tgt]=true;
				sendEvent(getBtnData(tgt),"mousedown");
				setMouseStillDown(currentCardObj.id, tgt);
			}
			var btnData = getBtnData(tgt);
			if(btnData.autoHilite){
				this.hiliteRRect(tgt);
			}
		},
		mouseOverRRect:function(event,tgt){
			if(downBtnId[tgt]){
				this.mouseDownRRect(event,tgt);
			}
			sendEvent(getBtnData(tgt),"mouseenter");
		},
		mouseOutRRect:function(event,tgt){
			if(document.getElementById(tgt)==null) return;
			if(downBtnId[tgt]){
				var btnData = getBtnData(tgt);
				if(btnData.autoHilite){
					this.unhiliteRRect(tgt);
				}
				clearMouseStillDown(currentCardObj.id, tgt);
			}
			sendEvent(getBtnData(tgt),"mouseleave");
		},
		mouseUpRRect:function(event,tgt){
			_mouse.setClick(event,tgt);
			this.mouseOutRRect(event,tgt);
			if(_mouse.isDoubleClick){
				/*if(tgt.indexOf("button-nav")!=-1){
				navBtnDoubleClick(tgt);
				return;
			}*/
				sendEvent(getBtnData(tgt),"mousedoubleclick");
			}
			sendEvent(getBtnData(tgt),"mouseup");
		},
		hiliteRRect:function(tgt){
			var clname = document.getElementById(tgt).className.split(" ")[0];
			if(!clname.match(/H$/)){document.getElementById(tgt).className = clname+'H';}
			if(document.getElementById(tgt+'icon')!=null){
				var btnData = getBtnData(tgt);
				if(btnData.autoHilite) iconHiliteStandard(tgt);
			}
		},
		unhiliteRRect:function(tgt){
			var clname = document.getElementById(tgt).className.split(" ")[0];
			if(clname.match(/H$/)){document.getElementById(tgt).className = clname.slice(0,clname.length-1);}
			if(btnIconAry[tgt]!=undefined){
				var btnData = getBtnData(tgt);
				loadImageIcon(tgt, btnIconAry[tgt].icon, btnIconAry[tgt].rsrc, btnData.iconScaling);
			}
			document.getElementById(tgt).style.color="#000";
		},

		mouseDownStandard:function(event,tgt){
			_mouse.setClickDown(event,tgt);
			if(!downBtnId[tgt]){
				downBtnId[tgt]=true;
				sendEvent(getBtnData(tgt),"mousedown");
				setMouseStillDown(currentCardObj.id, tgt);
			}
			var btnData = getBtnData(tgt);
			if(btnData.autoHilite){
				this.hiliteStandard(tgt);
			}
		},
		mouseOverStandard:function(event,tgt){
			if(downBtnId[tgt]){
				this.mouseDownStandard(event,tgt);
			}
			sendEvent(getBtnData(tgt),"mouseenter");
		},
		mouseOutStandard:function(event,tgt){
			if(downBtnId[tgt]){
				var btnData = getBtnData(tgt);
				if(btnData.autoHilite){
					this.unhiliteStandard(tgt);
				}
				clearMouseStillDown(currentCardObj.id, tgt);
			}
			sendEvent(getBtnData(tgt),"mouseleave");
		},
		mouseUpStandard:function(event,tgt){
			_mouse.setClick(event,tgt);
			this.mouseOutStandard(event,tgt);
			if('createTouch' in document){
				//仮想クリック (ラジオボタンやチェックボックスのon/off)
				event.pageX = 0;
				event.pageY = 0;
				if(document.getElementById(tgt).click){
					document.getElementById(tgt).click();
				}else if(document.getElementById(tgt+"i").click){
					document.getElementById(tgt+"i").click();
				}else if(document.getElementById(tgt+"i").focus){
					document.getElementById(tgt+"i").focus();
				}
			}
			//radioとcheckboxのオートハイライト
			var data = getBtnData(tgt);
			if(data.autoHilite){
				if(data.parent!="background" || data.sharedHilite){
					if(data.style=="radio"){
						data.hilite = true;
						changeObject2(data,"hilite","noRefresh");
					}
					else if(data.style=="checkbox"){
						data.hilite = !data.hilite;
						changeObject2(data,"hilite","noRefresh");
					}
				}else{
					var cd = currentCardObj;
					if(!cd.bgparts[data.id]) cd.bgparts[data.id] = {};
					if(data.style=="radio"){
						cd.bgparts[data.id].hilite = true;
						changeBgObject2(cd.bgparts[data.id],data.id,"hilite",cd.id);
					}
					else if(data.style=="checkbox"){
						cd.bgparts[data.id].hilite = !cd.bgparts[data.id].hilite;
						changeBgObject2(cd.bgparts[data.id],data.id,"hilite",cd.id);
					}
				}
			}
			if(_mouse.isDoubleClick){
				sendEvent(getBtnData(tgt),"mousedoubleclick");
			}
			sendEvent(getBtnData(tgt),"mouseup");
		},
		hiliteStandard:function(tgt){
			if(document.getElementById(tgt+'icon')!=null){
				var btnData = getBtnData(tgt);
				if(btnData.autoHilite) iconHiliteStandard(tgt);
			}
		},
		unhiliteStandard:function(tgt){
			if(btnIconAry[tgt]!=undefined){
				var btnData = getBtnData(tgt);
				loadImageIcon(tgt, btnIconAry[tgt].icon, btnIconAry[tgt].rsrc, btnData.iconScaling);
			}
		},
}; //buttonDef1

//buttonDef2はauthoring.jsに

var buttonDef=buttonDef1;

var fieldDef0 = {
		returnFunc:function(){ return false; },
		contextmenu:function(){ return true; },

		mouseDownStandard:function(event,tgt){},
		mouseOverStandard:function(event,tgt){},
		mouseOutStandard:function(event,tgt){},
		mouseUpStandard:function(event,tgt){},
		blur:function(event,tgt){},
		focus:function(event,tgt){},
}; //fieldDef0

var fieldDef1 = {
		returnFunc:function(){ return false; },
		contextmenu:function(){ return true; },

		mouseDownStandard:function(event,tgt){
			if(getFldData(tgt).lockText) {
				_mouse.setClickDown(event,tgt);
				document.getElementById(tgt).blur();
				sendEvent(getFldData(tgt),"mousedown");
			}
		},
		mouseOverStandard:function(event,tgt){
			sendEvent(getFldData(tgt),"mouseenter");
		},
		mouseOutStandard:function(event,tgt){
			sendEvent(getFldData(tgt),"mouseleave");
		},
		mouseUpStandard:function(event,tgt){
			_mouse.setClick(event,tgt);
			var obj = getFldData(tgt);
			if(obj.lockText && obj.autoSelect) {
				var y = event.offsetY/*+(document.getElementById(tgt)?document.getElementById(tgt).scrollTop:0)*/;
				var line = (y/obj.textHeight+1|0);
				selectLineCmd(obj, line);
			}
			if(getFldData(tgt).lockText) {
				if(_mouse.isDoubleClick){
					sendEvent(obj,"mousedoubleclick");
				}
				sendEvent(obj,"mouseup");
			}
		},
		focus:function(event,tgt){
			var obj = getFldData(tgt);
			sendEvent(obj,"openfield");
		},
		blur:function(event,tgt){
			var obj = getFldData(tgt);
			sendEvent(obj,"closefield");
		},
}; //fieldDef1

var fieldDef = fieldDef1;

var btnIconAry = [];

var stillDownTimer;
function clearMouseStillDown(cardid, tgt){
	if(stillDownTimer!=undefined) clearInterval(stillDownTimer);
}
function setMouseStillDown(cardid, tgt){
	if(stillDownTimer!=undefined) clearInterval(stillDownTimer);
	stillDownTimer = setInterval(function(){
		if(cardid!=currentCardObj.id){
			clearInterval(stillDownTimer);
		}
		sendEvent(getBtnData(tgt),"mousestilldown");
	}, 50);
}

function loadImageIcon(idx, iconfilename, rsrc, scalingIcon){
	var loadFunc = function(img) {
		var btn = document.getElementById(idx);
		var btncanvas = document.getElementById(idx+'icon');
		if(!btncanvas)return;
		var ctx = btncanvas.getContext('2d');
		if(scalingIcon){
			btncanvas.width = btn.offsetWidth;
			btncanvas.height = btn.offsetHeight;
		}else{
			btncanvas.width = img.width;
			btncanvas.height = img.height;
		}
		var xh = btncanvas.width - btn.offsetWidth;
		var yh = btncanvas.height - btn.offsetHeight;
		btncanvas.style.marginLeft = "0px";
		btncanvas.style.marginTop = "0px";
		if(xh>1){
			btncanvas.style.marginLeft = -xh/2+"px";
		}
		if(yh>1){
			btncanvas.style.marginTop = -yh/2+"px";
		}
		ctx.drawImage(img, 0, 0, btncanvas.width, btncanvas.height);
		var btnData = getBtnData(idx);
		if(btnData && btnData.hilite) iconHilite(idx);
	};

	var btncanvas = document.getElementById(idx+'icon');
	if(btncanvas==null || btncanvas.getContext==undefined || iconfilename==null) {
		btnIconAry[idx] = undefined;
		return;
	}
	if(rsrc&&rsrc.cache&&rsrc.cache.complete){
		loadFunc(rsrc.cache);
	}
	else{
		var img = new Image();
		if(iconfilename.indexOf("icon/ICON_")==0){
			img.src = iconfilename;
		}else if(iconfilename.indexOf("@")==0){
			img.src = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(iconfilename.substring(1));
		}else{
			img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(iconfilename);
		}
		btnIconAry[idx] = {icon:iconfilename, rsrc:rsrc};
		if(rsrc) rsrc.cache = img;
		//ctx.clearRect(0, 0, btncanvas.offsetWidth, btncanvas.offsetHeight);
		//ctx.drawImage(img, 0, 0);
		img.onload = function(){loadFunc(img);};
	}
}

function iconHilite(tgtid){
	var canvas = document.getElementById(tgtid+'icon');
	var ctx = document.getElementById(tgtid+'icon').getContext('2d');
	var srcData = ctx.getImageData(0,0,canvas.width,canvas.height);
	var i,j;
	var len = srcData.data.length;
	for (i=0; i<len; i+=4){ //invert
		for (j=0; j<3; j++){
			srcData.data[i+j] = 255-srcData.data[i+j];
		}
	}
	ctx.clearRect(0, 0, 1,1);//なぜか最初はクリアしないと反映されない
	ctx.putImageData(srcData, 0, 0);
}

function iconHiliteStandard(tgtid){
	var canvas = document.getElementById(tgtid+'icon');
	var ctx = document.getElementById(tgtid+'icon').getContext('2d');
	if(canvas.width==0)return;
	var srcData = ctx.getImageData(0,0,canvas.width,canvas.height);
	var i,j;
	var len = srcData.data.length;
	for (i=0; i<len; i+=4){ //darken
		var h = (len-i)/(canvas.width*32);
		for (j=0; j<3; j++){
			srcData.data[i+j] = srcData.data[i+j]-48-h;
		}
	}
	ctx.clearRect(0, 0, 1,1);//なぜか最初はクリアしないと反映されない
	ctx.putImageData(srcData, 0, 0);
}

//iOSイベント
function orientationChange(e){
	//viewport
	setTimeout(function(){
		//var viewport = document.querySelector("meta[name=viewport]");
		//var browserWidth=window.innerWidth;
		//var browserHeight=window.innerHeight;
		/*var initialWidth = stackData.width;
		if(stackData.height+24 > browserHeight){ //高さが足りない場合
			initialWidth *= (parseInt(stackData.height)+24)/browserHeight;
			initialWidth = Math.floor(initialWidth);
		}
		viewport.setAttribute('content', 'width='+initialWidth);*/
		if(Math.abs(window.orientation) === 90){
			//横方向では大画面モード
			var cardBack = document.getElementById('cardBack').parentNode;
			window.scroll(cardBack.offsetLeft, cardBack.offsetTop);
			//document.getElementById('menus').style.left = cardBack.offsetLeft+20+"px"; //時計タップでメニューも使える
			//setMenusRect();
		}
		else{
			window.scroll(0,1);
			//document.getElementById('menus').style.left = '';
			//setMenusRect();
		}
		windowResize();
	},0);
}

function cardResize(){
	var cardParent = document.getElementById("cardBack").parentNode;
	cardParent.style.width = stackData1.width+"px";
	cardParent.style.height = stackData1.height+"px";
	if(paint.elem=="cardBack"){
		paint.width = stackData1.width;
		paint.height = stackData1.height;
		paint.zwidth = stackData1.width;
		paint.zheight = stackData1.height;
	}
	// windowResizeの中でやる
	// cardParent.style.marginLeft = -stackData1.width/2+"px";
	// cardParent.style.marginTop = -stackData1.height/2-document.getElementById('footer1').offsetHeight/2+24+"px";
	windowResize();
}

//カード移動
var currentCardObj;
var currentBgObj;
//var visualRemainTime = 0;
var openStackFlag = false;
var addColorRemoveFlag = false;
var goInlockScreen = false;

function innerGoCard(nextCardObj, nextLoadCardObj){
	if(addColorRemoveFlag){
		addColorRemove();
		addColorRemoveFlag = false;
	}

	mmsgSendSystemEvent("go", nextCardObj.id);

	//次の画像を読み込み
	if(nextLoadCardObj!=undefined && nextLoadCardObj.bitmap!=""){
		var preload = new Image();
		preload.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+nextLoadCardObj.bitmap;
	}
}

function drawGoCard(nextCardObj, bgObj, visObj){
	if(paintHttpRequest && paintHttpRequest.endFlag==false && paintHttpRequest.drawCnt<=6){
		//ペイント画像保存待ち
		paintHttpRequest.drawCnt++;
		setTimeout(function(){
			drawGoCard(nextCardObj, bgObj, visObj);
		},500);
		return;
	}

	if(system.lockedScreen){
		var prevCardId = currentCardObj.id;
		//console.log("drawGoCard lockedScreen!");
		goInlockScreen = true;
		if(!inPaintMode && !system.lockedMessages && selectedTool=="browse"){
			if(prevCardId!=nextCardObj.id){
				sendEvent(currentCardObj,"closecard");
			}
		}
		currentCardObj = nextCardObj;
		currentBgObj = bgObj;
		if(!inPaintMode && !system.lockedMessages && selectedTool=="browse"){
			if(prevCardId!=currentCardObj.id){
				sendEvent(currentCardObj,"opencard");
			}
		}
		return;
	}
	//console.log("drawGoCard "+nextCardObj);
	if(nextCardObj==undefined){
		//初回

		hideSpinAnim();
		{
			var cardParent = document.getElementById("cardBack").parentNode;
			cardParent.style['MozTransition'] = "all 0.5s ease-in";
			cardParent.style['-webkit-transition'] = "all 0.5s ease-in";
			setTimeout(function(){
				cardResize();
			},0);

			if(stackData1.showNavigator==false){
				document.getElementById("ipadnav").style.display = "none";
			}

			//var viewport = document.querySelector("meta[name=viewport]");
			//viewport.setAttribute('content', 'width=1024; initial-scale=1.0; maximum-scale=3.0; user-scalable=0;');
			var browserWidth=window.innerWidth;
			var browserHeight=window.innerHeight;
			var initialScale = browserWidth/stackData1.width;
			if((browserHeight-40)/stackData1.height < initialScale){ initialScale = (browserHeight-40)/stackData1.height; }
			//viewport.setAttribute('content', 'width='+stackData.width+'; initial-scale='+initialScale+'; maximum-scale=3.0; user-scalable=0;');
			//var nextLoadCardObj = undefined;
			if(location.hash!=undefined&&location.hash!=""/*&&cardById(location.hash.substring(1))!=undefined*/){
				//アドレスのハッシュ部分のidのカードに移動
				//innerGoCard(cardById(location.hash.substring(1)));
				mmsgSendSystemEvent("go", location.hash.substring(1));
			}
			else if(document.cookie==undefined || document.cookie==""){
				//cookieが無い場合は最初のカード
				//if(cardData[1]!=undefined) nextLoadCardObj = cardData[1];
				//innerGoCard(cardData[0],nextLoadCardObj);
				mmsgSendSystemEvent("go", null);
				openStackFlag = true;
			}
			else{
				//cookieに保存してあるカードに移動
				{
					var cookie = document.cookie;
					//var cardobj = cardData[0];
					var cardid = null;
					if(cookie.match(/sname_cdid=(.+)_([0-9]+)(;.*|)$/)){
						var stackname = RegExp.$1;
						if(stackname==userParameter+"/"+encodeURI(nameParameter)){
							cardid = RegExp.$2;
							//cardobj = cardData[getCardNum(cardid)];
						}
					}
					mmsgSendSystemEvent("go", cardid);
					openStackFlag = true;
				}
			}
			if('createTouch' in document){ window.scroll(0,1); }//safariのアドレスバーを消す
		}
		return;
	}


	//cookieに現在のカードを保持
	if(navigator.cookieEnabled){
		var cookie;
		cookie = "sname_cdid="+userParameter+"/"+encodeURI(nameParameter)+"_"+nextCardObj.id;
		document.cookie = cookie;
	}

	var prevCardId = currentCardObj?currentCardObj.id:null;

	//移動するカードのHTML生成
	var newElem = makenewhtml(nextCardObj, bgObj);
	//var visObj = system.visual.shift();
	var time = visObj?visObj.time:0;
	//setTimeout(function(){

	var addcolor = document.getElementById('addcolor');
	if(addcolor){
		addcolor.parentNode.removeChild(addcolor);
	}

	//現在のページに追加
	var currentCardElem = document.getElementById('cardBack');
	if(!currentCardElem){ //消えてしまうとは情けない
		currentCardElem = document.createElement("div");
		currentCardElem.id = "cardBack";
		document.getElementsByClassName('cardBack')[0].appendChild(currentCardElem);
	}
	currentCardElem.parentNode.insertBefore(newElem,currentCardElem);
	for(var m in document.getElementById('cardBack').childNodes){
		document.getElementById('cardBack').childNodes[m].id = "_";
		for(var n in document.getElementById('cardBack').childNodes[m].childNodes){
			document.getElementById('cardBack').childNodes[m].childNodes[n].id = "__";
		}
	}
	//エフェクト
	if(visObj){
		cardEffect(visObj.mode,visObj.dir,visObj.to,time+'s');
	}

	//前のカードを削除
	setTimeout(function(){
		var prevCard = document.getElementById('cardBack');
		var nextCard = document.getElementById('nextCardBack');
		prevCard.parentNode.removeChild(prevCard);
		if(nextCard){
			nextCard.id = 'cardBack';
			nextCard.style['MozTransitionDuration'] = '0s';
			nextCard.style['-webkit-transition-duration'] = '0s';
			nextCard.style.zIndex = "100";
		}
		var dummyCard = document.getElementById('dummyCardBack');
		if(dummyCard!=undefined){
			if(nextCard){
				nextCard.parentNode.removeChild(nextCard);
				dummyCard.parentNode.appendChild(nextCard);
			}
			dummyCard.parentNode.removeChild(dummyCard);
		}
		//
		/*if(!system.lockedScreen){
				vmCardBack = document.getElementById('cardBack');
			}*/
		//
		setPartsRect();
		//visualRemainTime -= time*1050;

		//アドレスの#以降を変更
		location.hash = currentCardObj.id;

		if(!inPaintMode && !system.lockedMessages && selectedTool=="browse"){
			if(openStackFlag){
				sendEvent(currentCardObj,"openstack");
				openStackFlag = false;
			}
			if(prevCardId!=currentCardObj.id){
				sendEvent(currentCardObj,"opencard");
			}
		}
		if(inPaintMode){
			changeTool(selectedTool);
		}
		if(addcolor){
			var xcardBack = document.getElementById("nextCardBack");
			if(!xcardBack) xcardBack = document.getElementById("cardBack");
			xcardBack.appendChild(addcolor);
		}

		document.getElementById("cardBack").addEventListener("mouseup",function(){
			//downBtnId=[];
			if(inRunning && !_mouse.click&&_mouse.button=="down"){
				sendEvent(currentCardObj,"mouseup");
			}
			_mouse.setClick(event);
			tbDragObj = null;
		}, true);
		document.getElementById("cardBack").addEventListener("mousedown",function(){
			if(inRunning && !_mouse.click){
				sendEvent(currentCardObj,"mousedown");
				_mouse.setClickDown(event);
			}
		}, true);
		
		mmsgSyncProperty("go", currentCardObj.id, "");
	},time*1000+16);

	if(!inPaintMode && !system.lockedMessages && selectedTool=="browse"){
		if(prevCardId!=nextCardObj.id){
			sendEvent(currentCardObj,"closecard");
		}
	}

	currentCardObj = nextCardObj;
	currentBgObj = bgObj;
	//},visualRemainTime);
	//visualRemainTime += time*1050;

	nextCardObj = null;
	bgObj = null;
}

function makenewhtml(nextCardObj, bgObj){
	var i=0;
	var newHtml = "";
	//var bgObj = getBgData(nextCardObj.background);
	if(bgObj!=null ){
		if(bgObj.bitmap!=undefined && bgObj.bitmap!="" && bgObj.showPict){
			var url = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(bgObj.bitmap);
			if(!masterEditMode && nextCardObj.bitmapLocal!=null){
				url = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(bgObj.bitmapLocal);
			}
			/*if(window.sessionStorage!=undefined){
				if(sessionStorage[bgObj.bitmap]!=undefined) url = sessionStorage[bgObj.bitmap];
			}*/
			newHtml += "<div id='bg-picture' style='background-image:url("+url+"); width:100%; height:100%;border-radius:4px;' "+
			"onmousedown='return imgMouseDown(event);' onmouseup='return imgMouseUp(event);'"+
			"></div>";
		}
		else{
			newHtml += "<div id='bg-picture'></div>";
		}
		if(bgObj.parts!=undefined){
			for(i in bgObj.parts){
				var part = bgObj.parts[i];
				if(part==null) continue;
				if(part.type=='button'){
					newHtml += createButton(part,nextCardObj);
				}
				else if(part.type=='field'){
					newHtml += createField(part,nextCardObj);
				}
			}
		}
	}
	if(!system.editBackground){
		if(nextCardObj.bitmap!=undefined && nextCardObj.bitmap!="" && nextCardObj.showPict){
			//newHtml += "<div style='background:transparent;background-image:url(getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter)+"/"+nextCardObj.bitmap+"); position:absolute; top:0%; width:100%; height:100%;border-radius:4px'></div>";
			var url = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(nextCardObj.bitmap);
			if(!masterEditMode && nextCardObj.bitmapLocal!=null){
				url = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(nextCardObj.bitmapLocal);
			}
			/*if(window.sessionStorage!=undefined){
				if(sessionStorage[nextCardObj.bitmap]!=undefined) url = sessionStorage[nextCardObj.bitmap];
			}*/
			newHtml += "<img id='card-picture' src=\""+url+"\" draggable=false ";
			newHtml += "onmousedown='return imgMouseDown(event);' onmouseup='return imgMouseUp(event);' ontouchstart='event.preventDefault();return imgMouseDown(event);' ontouchend='event.preventDefault();return imgMouseUp(event);' ";
			newHtml += "style=\"position:absolute; top:0%; width:100%; height:100%;border-radius:4px;-moz-user-select:nonepointer;pointer-events:none;\" />";
		}
		else{
			newHtml += "<div id='card-picture'></div>";
		}
		if(nextCardObj.parts!=undefined){
			for(i in nextCardObj.parts){
				var part = nextCardObj.parts[i];
				if(part==null) continue;
				if(part.type=='button'){
					newHtml += createButton(part,null);
				}
				else if(part.type=='field'){
					newHtml += createField(part,null);
				}
			}
		}
	}
	newHtml += '</div>';
	//documentに追加
	var newElem = document.createElement('div');
	newElem.className = 'cardBack';
	newElem.id = 'nextCardBack';
	newElem.style.width = stackData1.width+"px";
	newElem.style.height = stackData1.height+"px";
	newElem.innerHTML = newHtml;
	return newElem;
}

var dummyrsrc = {};
function createButton(btnData,card){
	var btnId = (card==null?"":"bg-")+"button-"+btnData.id;
	var scriptStyle={"transparent":"Trans","opaque":"Rect","rectangle":"Rect","roundrect":"RRect","shadow":"RRect","standard":"Standard","default":"Standard","oval":"Rect","search":"Standard","range":"Standard"};

	var hilite = btnData.hilite;
	if(btnData.parent=="background" && btnData.sharedHilite==false){
		if(card!=null && card.bgparts[btnData.id]!=null){
			hilite = card.bgparts[btnData.id].hilite;
		}
	}

	var styleStr="";
	if(btnData.textFont && btnData.textFont!=""){
		styleStr += "font-family:\""+btnData.textFont+"\";";
	}
	if(btnData.textStyle!=0){
		if(btnData.textStyle & 0x01) styleStr+="font-weight:bold;";
		if(btnData.textStyle & 0x02) styleStr+="font-style:italic;";
		if(btnData.textStyle & 0x04) styleStr+="text-decoration:underline;";
		if(btnData.textStyle & 0x08) styleStr+="color:white; text-shadow:1px 0px 1px #000,-1px 0px 1px #000,0px 1px 1px #000,0px -1px 1px #000;";//outline
		if(btnData.textStyle & 0x10) styleStr+="color:white; text-shadow:1px 1px 2px #000,1px 1px 2px #000;";//shadow
		if(btnData.textStyle & 0x20) styleStr+="letter-spacing:-1px;";//condensed
		if(btnData.textStyle & 0x40) styleStr+="letter-spacing:1px;";//extend
	}
	if(btnData.style!="radio"&&btnData.style!="checkbox"&&btnData.style!="popup"){
		if(btnData.textAlign=="left"){ styleStr+="text-align:left;"; }
		if(btnData.textAlign=="center"){ styleStr+="text-align:center;"; }
		if(btnData.textAlign=="right"){ styleStr+="text-align:right;"; }
	}
	if(btnData.vertically){ styleStr+="-webkit-writing-mode:vertical-rl;"; }
	if(btnData.style=="radio"){
		return "<div class='radio Parts' id='"+btnId+"' onclick=\"return buttonDef.returnFunc();\" onmousedown=\"return buttonDef.mouseDownStandard(event,'"+btnId+"');\" onmouseup=\"return buttonDef.mouseUpStandard(event,'"+btnId+
		"');\" oncontextmenu=\"return buttonDef.contextmenu(event,'"+btnId+"');\" onmouseover=\"return buttonDef.mouseOverStandard(event,'"+btnId+"');\" onmouseout=\"return buttonDef.mouseOutStandard(event,'"+btnId+"');\""+
		" style='"+styleStr+"left:"+btnData.left+"px; top:"+btnData.top+"px; width:"+btnData.width+"px; height:"+btnData.height+
		"px; visibility:"+(btnData.visible?"visible;":"hidden;")+(btnData.opacity?"opacity:"+btnData.opacity+";":"")+"padding:0; font-size:"+btnData.textSize+"px;'><input type='radio' class='radio' id='"+btnId+"i' "+(btnData.enabled?"":"disabled")+" "+(hilite?"checked":"")+"><label id='"+btnId+"l' for='"+btnId+"i'>"+btnData.name+"</label></div>";
	}
	else if(btnData.style=="checkbox"){
		return "<div class='checkbox Parts' id='"+btnId+"'  onclick=\"return buttonDef.returnFunc();\" onmousedown=\"return buttonDef.mouseDownStandard(event,'"+btnId+"');\" onmouseup=\"return buttonDef.mouseUpStandard(event,'"+btnId+
		"');\" oncontextmenu=\"return buttonDef.contextmenu(event,'"+btnId+"');\" onmouseover=\"return buttonDef.mouseOverStandard(event,'"+btnId+"');\" onmouseout=\"return buttonDef.mouseOutStandard(event,'"+btnId+"');\""+
		" style='"+styleStr+"left:"+btnData.left+"px; top:"+btnData.top+"px; width:"+btnData.width+"px; height:"+btnData.height+
		"px; visibility:"+(btnData.visible?"visible;":"hidden;")+(btnData.opacity?"opacity:"+btnData.opacity+";":"")+"padding:0; font-size:"+btnData.textSize+"px;'><input type='checkbox' class='checkbox' id='"+btnId+"i' "+(btnData.enabled?"":"disabled")+" "+(hilite?"checked":"")+"><label id='"+btnId+"l' for='"+btnId+"i'>"+btnData.name+"</label></div>";
	}
	else if(btnData.style=="popup"){
		var retStr = "<div class='popup Parts' id='"+btnId+"'  onclick=\"return buttonDef.returnFunc();\" onmousedown=\"return buttonDef.mouseDownStandard(event,'"+btnId+"');\" onmouseup=\"changePopup(event,'"+btnId+"');return buttonDef.mouseUpStandard(event,'"+btnId+
		"');\" oncontextmenu=\"return buttonDef.contextmenu(event,'"+btnId+"');\" onmouseover=\"return buttonDef.mouseOverStandard(event,'"+btnId+"');\" onmouseout=\"return buttonDef.mouseOutStandard(event,'"+btnId+"');\""+
		" style='"+styleStr+"left:"+btnData.left+"px; top:"+btnData.top+"px; width:"+btnData.width+"px; height:"+btnData.height+
		"px; visibility:"+(btnData.visible?"visible;":"hidden;")+(btnData.opacity?"opacity:"+btnData.opacity+";":"")+"padding:0; font-size:"+btnData.textSize+"px;'>"+
		((btnData.titleWidth>0)?"<label id='"+btnId+"l' for='"+btnId+"i'>"+(btnData.showName?btnData.name:"")+"</label>":"")+
		"<select class='popup' id='"+btnId+"i' style='margin-left:"+btnData.titleWidth+"px; width:"+(btnData.width-btnData.titleWidth)+"px; height:"+btnData.height+"px;' "+(btnData.enabled?"":"disabled")+" onchange=\"changePopup(event,'"+btnId+"');\" >";
		if(btnData.text!=undefined){
			var splittxt = btnData.text.split('\n');
			for(var i=0; i<splittxt.length;i++){
				retStr += "<option value=\""+escapeHTML(splittxt[i])+"\">"+escapeHTML(splittxt[i])+"</option>\n";
			}
		}
		retStr += "</select></div>";
		return retStr;
	}
	else{
		var iconStr = "";
		var textSize = btnData.textSize;
		var textHeight = btnData.textHeight;
		if(btnData.icon>0){
			textSize = 9;
			textHeight = 9;
			iconStr = "<canvas id=\""+btnId+"icon\" width='32' height='32' ></canvas><br>";
			setTimeout(function(){
				var rsrc=GetResourceById(btnData.icon,"icon");
				if(rsrc!=null){
					loadImageIcon(btnId,rsrc?(rsrc.fileLocal?"@"+rsrc.fileLocal:rsrc.file):null,rsrc,btnData.iconScaling);
				}else{
					//標準アイコンを使う
					if(!dummyrsrc[btnData.icon]) dummyrsrc[btnData.icon] = {};
					loadImageIcon(btnId,"icon/ICON_"+btnData.icon+".png",dummyrsrc[btnData.icon],btnData.iconScaling);
				}
			},/*visualRemainTime+*/30);
		}
		if(btnData.icon==-1){
			iconStr = "<canvas id=\""+btnId+"icon\" width='32' height='32' ></canvas><br>";
			setTimeout(function(){
				var rsrc=GetResource(btnData.name,"picture");
				loadImageIcon(btnId,rsrc?(rsrc.fileLocal?"@"+rsrc.fileLocal:rsrc.file):null,rsrc,btnData.iconScaling);
			},/*visualRemainTime+*/50);
		}
		var classStr = btnData.style;
		if(hilite){
			if(classStr=="roundrect") classStr+="H";
			else{
				styleStr += "background-color:#000;color:#fff;";
			}
		}
		return "<button type='button' class='"+classStr+" Parts' id='"+btnId+
		"' "+(classStr=='default'?"autofocus ":"")+" oncontextmenu=\"return buttonDef.contextmenu(event,'"+btnId+"');\" onmousedown=\"return buttonDef.mouseDown"+scriptStyle[btnData.style]+"(event,'"+btnId+"');\""+
		" onmouseup=\"return buttonDef.mouseUp"+scriptStyle[btnData.style]+"(event,'"+btnId+"');\""+
		" onmouseover=\"return buttonDef.mouseOver"+scriptStyle[btnData.style]+"(event,'"+btnId+"');\""+
		" onmouseout=\"return buttonDef.mouseOut"+scriptStyle[btnData.style]+"(event,'"+btnId+"');\""+
		" style='"+styleStr+"left:"+btnData.left+"px; top:"+btnData.top+"px; width:"+btnData.width+"px; height:"+btnData.height+
		"px; visibility:"+(btnData.visible?"visible;":"hidden;")+(btnData.opacity?"opacity:"+btnData.opacity+";":"")+"padding:0; font-size:"+textSize+"px; line-height:"+textHeight+"px;' value='"+btnData.text+"' "+(btnData.enabled?"":"disabled")+">"+iconStr+(btnData.showName?btnData.name:"")+"</button>";
	}
}

function createField(fldData,card){
	var fldId = (card==undefined?"":"bg-")+"field-"+fldData.id;
	var styleStr="";
	var svgStr="";
	if(fldData.textFont && fldData.textFont!=""){
		styleStr += "font-family:'"+fldData.textFont+"';";
	}
	if(fldData.textStyle!=0){
		if(fldData.textStyle & 0x01) styleStr+="font-weight:bold;";
		if(fldData.textStyle & 0x02) styleStr+="font-style:italic;";
		if(fldData.textStyle & 0x04) styleStr+="text-decoration:underline;";
		//if(fldData.textStyle & 0x08) styleStr+="color:white; text-shadow:0px 0px 1px #000;";//outline
		if(fldData.textStyle & 0x08) styleStr+="-webkit-text-stroke:0.3px #000;font-weight:bold; -webkit-text-fill-color:white;text-shadow:1px 0px 0px #000;"; //こっちだと黒背景で見えない
		if(fldData.textStyle & 0x10) styleStr+="color:white; text-shadow:1px 1px 2px #000;";//shadow
		if(fldData.textStyle & 0x20) styleStr+="letter-spacing:-1px;";//condensed
		if(fldData.textStyle & 0x40) styleStr+="letter-spacing:1px;";//extend
		if(fldData.textStyle & 0x80) styleStr+="text-decoration:underline;";//group
	}
	if(fldData.textAlign=="left"){ styleStr+="text-align:left;"; }
	if(fldData.textAlign=="center"){ styleStr+="text-align:center;"; }
	if(fldData.textAlign=="right"){ styleStr+="text-align:right;"; }
	if(fldData.dontWrap) styleStr+="white-space:nowrap;";
	if(fldData.wideMargins) styleStr+="padding:8px;box-sizing:border-box;";
	if(fldData.showLines){
		var offset = 0;
		if(fldData.wideMargins) offset = 8;
		var textheight = fldData.textHeight;
		if(textheight==0) textheight=fldData.textSize+2;
		svgStr = "<svg style='position:absolute;left:0px;top:0px;z-index:-1;' onclick='document.getElementById(\""+fldId+"\").focus();' width="+fldData.width+" height="+fldData.height+" "+
		"xmlns=\"http://www.w3.org/2000/svg\""+
		"xmlns:xlink=\"http://www.w3.org/1999/xlink\">";
		for(var i=1; i<fldData.height/textheight;i++){
			svgStr+="<line x1=0 y1="+(textheight*i+offset)+" x2=1000 y2="+(textheight*i+offset)+" stroke=#ddd stroke-width=1 />";
		}
		svgStr+="</svg>";
		//フィールドの高さ分しか線を用意していないが、onscrollでsetScrollFldを呼んで場所移動している。
	}
	if(fldData.lockText) {
		styleStr+="outline: 0;";
	}
	else{
		styleStr+="cursor:text;";
	}
	if(fldData.vertically){ styleStr+="-webkit-writing-mode:vertical-rl;"; }
	var text = fldData.text;//.replace(/\n/g,"<br>");
	if(fldData.parent=="background" && fldData.sharedText==false){
		if(card!=undefined && card.bgparts[fldData.id]!=undefined){
			text = card.bgparts[fldData.id].text;//.replace(/\n/g,"<br>");
		}else{
			text = "";
		}
	}
	else if(fldData.text!=undefined){
		//text = fldData.text;//.replace(/\n/g,"<br>");
	}
	if(text==undefined) text="";

	return "<div class='"+fldData.style+" Parts' id='"+fldId+"' "+((fldData.lockText||selectedTool!="browse")?"":"contenteditable=true")+
	"  style=\""+styleStr+"left:"+fldData.left+"px; top:"+fldData.top+"px; width:"+fldData.width+"px; height:"+fldData.height+
	"px; visibility:"+(fldData.visible?"visible":"hidden")+";"+((fldData.opacity&&fldData.opacity!="")?"opacity:"+fldData.opacity:"")+" font-size:"+fldData.textSize+"px; line-height:"+fldData.textHeight+"px;\" "+
	" oncontextmenu=\"return fieldDef.contextmenu(event,'"+fldId+"');\" onmousedown=\"return fieldDef.mouseDownStandard(event,'"+fldId+"');\" onmouseup=\"return fieldDef.mouseUpStandard(event,'"+fldId+
	"');\" onmouseover=\"return fieldDef.mouseOverStandard(event,'"+fldId+"');\" onmouseout=\"return fieldDef.mouseOutStandard(event,'"+fldId+"');\" "+
	"onscroll=\"setScrollFld('"+fldId+"');\" "+
	"onblur=\"setFldContent('"+fldId+"');touchInit();fieldDef.blur(event,'"+fldId+"');\" onfocus=\"fieldDef.focus(event,'"+fldId+"');\" >"+(text+"").split(/\n/).join("<br>")+""+svgStr+"</div>";
}

function changePopup(event,btnid){
	var selLine = document.getElementById(btnid+"i").selectedIndex;
	var obj = getBtnData(btnid);
	if(!obj) return;
	obj.selectedLine = selLine+1;
	mmsgSyncProperty("objpropchange", "selectedLine",  JSON.stringify({type:obj.type, id:obj.id, parent:obj.parent, parentId:obj.parentId, value:obj.selectedLine}));
}

function setScrollFld(fldid){
	var scroll=document.getElementById(fldid).scrollTop;
	var svg=document.getElementById(fldid).getElementsByTagName("svg")[0];
	if(svg && svg.className.baseVal=="select"){
		//
	}
	else if(svg) {
		var a = getFldData(fldid).textHeight;
		if(a==undefined)a=getFldData(fldid).textSize+2;
		svg.style.top=(scroll/a|0)*a+"px";
	}
}

function setTranstionTime(prevCard,nextCard,time){
	/*prevCard.style['MozTransitionDuration'] = time;
	prevCard.style['-webkit-transition-duration'] = time;
	nextCard.style['MozTransitionDuration'] = time;	
	nextCard.style['-webkit-transition-duration'] = time;*/
	prevCard.style['MozTransition'] = "all "+time+" linear";
	prevCard.style['-webkit-transition'] = "all "+time+" linear";
	nextCard.style['MozTransition'] = "all "+time+" linear";
	nextCard.style['-webkit-transition'] = "all "+time+" linear";
}
function clearTranstionTime(prevCard,nextCard){
	setTimeout(function(){
		prevCard.style['MozTransitionDuration'] = "0s";
		prevCard.style['-webkit-transition-duration'] = "0s";
		nextCard.style['MozTransitionDuration'] = "0s";
		nextCard.style['-webkit-transition-duration'] = "0s";
	},0);
}

function cardEffect(effect, direction, toColor, time){ //視覚効果
	var prevCard = document.getElementById('cardBack');
	var nextCard = document.getElementById('nextCardBack');
	if(effect=='dissolve' && isWebKit()){
		var canvas = document.getElementById('tempCanvas');
		canvas.width=8;
		canvas.height=2;
		var i=0;
		var dissolvefunc = function(){
			var imageData = canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
			var maskData;
			maskData = [ [ 0,14,10,4,1,15,11,5 ] , [ 8,6,2,12,9,7,3,13 ] ];
			//prev
			for(var y=0; y<canvas.height; y++){
				for(var x=0; x<canvas.width; x++){
					imageData.data[y*4*canvas.width+x*4+0] = 255;
					imageData.data[y*4*canvas.width+x*4+3] = (maskData[y][x]>i)?255:0;
				}
			}
			canvas.getContext('2d').clearRect(0,0,1,1);
			canvas.getContext('2d').putImageData(imageData,0,0);
			prevCard.style['-webkit-mask-image'] = "url("+canvas.toDataURL()+")";
			//next
			for(var y=0; y<canvas.height; y++){
				for(var x=0; x<canvas.width; x++){
					imageData.data[y*4*canvas.width+x*4+3] = (maskData[y][x]>i)?0:255;
				}
			}
			canvas.getContext('2d').clearRect(0,0,1,1);
			canvas.getContext('2d').putImageData(imageData,0,0);
			nextCard.style['-webkit-mask-image'] = "url("+canvas.toDataURL()+")";
			i++;
		};
		for(var j=0; j<16; j++){
			setTimeout(dissolvefunc,parseFloat(time)*1000*j/16|0);
		}
		setTimeout(function(){
			nextCard.style['-webkit-mask-image'] = '';
		},parseFloat(time)*1000);
	}
	else if(effect=='venetian blinds' && isWebKit()){
		var canvas = document.getElementById('tempCanvas');
		canvas.width=stackData1.width;
		canvas.height=stackData1.height;
		var i=0;
		var venetianfunc = function(){
			var ctx = canvas.getContext('2d');
			//prev
			ctx.fillRect(0,0,canvas.width,canvas.height);
			for(var y=0; y<canvas.height; y+=32){
				ctx.clearRect(0,y,canvas.width,i*2);
			}
			prevCard.style['-webkit-mask-image'] = "url("+canvas.toDataURL()+")";
			//next
			ctx.clearRect(0,0,canvas.width,canvas.height);
			for(var y=0; y<canvas.height; y+=32){
				ctx.fillRect(0,y,canvas.width,i*2);
			}
			nextCard.style['-webkit-mask-image'] = "url("+canvas.toDataURL()+")";
			i++;
		};
		for(var j=0; j<16; j++){
			setTimeout(venetianfunc,parseFloat(time)*1000*j/16|0);
		}
		setTimeout(function(){
			nextCard.style['-webkit-mask-image'] = '';
		},parseFloat(time)*1000);
	}
	else if(effect=='checkerboard' && isWebKit()){
		var canvas = document.getElementById('tempCanvas');
		canvas.width=stackData1.width;
		canvas.height=stackData1.height;
		var i=0;
		var checkerboard = function(){
			var ctx = canvas.getContext('2d');
			//prev
			ctx.fillRect(0,0,canvas.width,canvas.height);
			for(var y=0; y<canvas.height; y+=64){
				for(var x=0; x<canvas.width; x+=64){
					ctx.clearRect(x,y,32,i*4);
				}
				for(var x=0; x<canvas.width; x+=64){
					ctx.clearRect(x+32,y-32,32,i*4);
				}
			}
			prevCard.style['-webkit-mask-image'] = "url("+canvas.toDataURL()+")";
			//next
			ctx.clearRect(0,0,canvas.width,canvas.height);
			for(var y=0; y<canvas.height; y+=64){
				for(var x=0; x<canvas.width; x+=64){
					ctx.fillRect(x,y,32,i*4);
				}
				for(var x=0; x<canvas.width; x+=64){
					ctx.fillRect(x+32,y-32,32,i*4);
				}
			}
			nextCard.style['-webkit-mask-image'] = "url("+canvas.toDataURL()+")";
			i++;
		};
		for(var j=0; j<16; j++){
			setTimeout(checkerboard,parseFloat(time)*1000*j/16|0);
		}
		setTimeout(function(){
			nextCard.style['-webkit-mask-image'] = '';
		},parseFloat(time)*1000);
	}
	else if(effect=='dissolve' || effect=='fade' || effect=='venetian blinds' || effect=='checkerboard' ){
		prevCard.style.opacity = "1.0";
		nextCard.style.opacity = "1.0";
		//setTranstionTime(prevCard,nextCard,time);
		setTimeout(function(){
			setTranstionTime(prevCard,nextCard,time);
			prevCard.style.opacity = "0.0";
			nextCard.style.opacity = "1.0";
			//clearTranstionTime(prevCard,nextCard);
		},10);
	}
	else if(effect=='wipe'){
		nextCard.style.zIndex = "101";
		if(direction=='left'){
			nextCard.style.left = prevCard.offsetWidth+"px";
		}
		if(direction=='right'){
			nextCard.style.left = '-'+prevCard.offsetWidth+"px";
		}
		if(direction=='up'){
			nextCard.style.top = prevCard.offsetHeight+"px";
		}
		if(direction=='down'){
			nextCard.style.top = '-'+prevCard.offsetHeight+"px";
		}
		setTimeout(function(){
			setTranstionTime(prevCard,nextCard,time);
			nextCard.style.left = "0px";
			nextCard.style.top = "0px";
			clearTranstionTime(prevCard,nextCard);
		},0);
	}
	else if(effect=='push'){
		if(direction=='left'){
			nextCard.style.marginLeft = prevCard.offsetWidth+"px";
			setTimeout(function(){
				setTranstionTime(prevCard,nextCard,time);
				nextCard.style.marginLeft = "0px";
				prevCard.style.marginLeft = "-"+prevCard.offsetWidth+"px";
				clearTranstionTime(prevCard,nextCard);
			},0);
		}
		if(direction=='right'){
			nextCard.style.marginLeft = -prevCard.offsetWidth+"px";
			setTimeout(function(){
				setTranstionTime(prevCard,nextCard,time);
				nextCard.style.marginLeft = "0px";
				prevCard.style.marginLeft = prevCard.offsetWidth+"px";
				clearTranstionTime(prevCard,nextCard);
			},0);
		}
		if(direction=='up'){
			nextCard.style.marginTop = prevCard.offsetHeight+"px";
			setTimeout(function(){
				setTranstionTime(prevCard,nextCard,time);
				nextCard.style.marginTop = "0px";
				prevCard.style.marginTop = "-"+prevCard.offsetHeight+"px";
				clearTranstionTime(prevCard,nextCard);
			},0);
		}
		if(direction=='down'){
			nextCard.style.marginTop = -prevCard.offsetHeight+"px";
			setTimeout(function(){
				setTranstionTime(prevCard,nextCard,time);
				nextCard.style.marginTop = "0px";
				prevCard.style.marginTop = prevCard.offsetHeight+"px";
				clearTranstionTime(prevCard,nextCard);
			},0);
		}
	}
	else if(effect=='scroll'){
		if(direction=='left'){
			setTimeout(function(){
				setTranstionTime(prevCard,nextCard,time);
				prevCard.style.width = "0px";
				clearTranstionTime(prevCard,nextCard);
			},0);
		}
		if(direction=='right'){
			nextCard.style.zIndex = "101";
			nextCard.style.width = "0px";
			setTimeout(function(){
				setTranstionTime(prevCard,nextCard,time);
				nextCard.style.width = prevCard.offsetWidth+"px";
				clearTranstionTime(prevCard,nextCard);
			},0);
		}
		if(direction=='up'){
			setTimeout(function(){
				setTranstionTime(prevCard,nextCard,time);
				prevCard.style.height = "0px";
				clearTranstionTime(prevCard,nextCard);
			},0);
		}
		if(direction=='down'){
			nextCard.style.zIndex = "101";
			nextCard.style.height = "0px";
			setTimeout(function(){
				setTranstionTime(prevCard,nextCard,time);
				nextCard.style.height = prevCard.offsetHeight+"px";
				clearTranstionTime(prevCard,nextCard);
			},0);
		}
	}
	else if(effect=='stretch'){
		if(direction=='center'){
		}
		if(direction=='top'){
			nextCard.style.marginTop = "-"+prevCard.offsetHeight/2+"px";
		}
		if(direction=='bottom'){
			nextCard.style.marginTop = prevCard.offsetHeight/2+"px";
		}
		nextCard.style['MozTransitionDuration'] = "0s";
		nextCard.style['-webkit-transition-duration'] = "0s";
		setTimeout(function(){
			nextCard.style["MozTransform"] = "scale(1.0,0.0)";
			nextCard.style["-webkit-transform"] = "scale(1.0,0.0)";
			nextCard.style.zIndex = "101";
			setTimeout(function(){
				nextCard.style['MozTransitionDuration'] = time;
				nextCard.style['-webkit-transition-duration'] = time;
				nextCard.style["MozTransform"] = "scale(1.0)";
				nextCard.style["-webkit-transform"] = "scale(1.0)";
				nextCard.style.marginTop = '0px';
			},0);
		},0);
	}
	else if(effect=='shrink'){
		prevCard.style['MozTransitionDuration'] = "0s";
		prevCard.style['-webkit-transition-duration'] = "0s";
		setTimeout(function(){
			prevCard.style["MozTransform"] = "scale(1.0)";
			prevCard.style["-webkit-transform"] = "scale(1.0)";
			setTimeout(function(){
				prevCard.style['MozTransitionDuration'] = time;
				prevCard.style['-webkit-transition-duration'] = time;
				prevCard.style["MozTransform"] = "scale(1.0,0.0)";
				prevCard.style["-webkit-transform"] = "scale(1.0,0.0)";
				if(direction=='center'){
				}
				if(direction=='top'){
					prevCard.style.marginTop = "-"+prevCard.offsetHeight/2+"px";
				}
				if(direction=='bottom'){
					prevCard.style.marginTop = prevCard.offsetHeight/2+"px";
				}
			},0);
		},0);
	}
	else if(effect=='zoom'){
		if(direction=='open' || direction=='in'){
			nextCard.style['MozTransitionDuration'] = "0s";
			nextCard.style['-webkit-transition-duration'] = "0s";
			setTimeout(function(){
				nextCard.style["MozTransform"] = "scale(0.0)";
				nextCard.style["-webkit-transform"] = "scale(0.0)";
				nextCard.style.zIndex = "101";
				setTimeout(function(){
					nextCard.style['MozTransitionDuration'] = time;
					nextCard.style['-webkit-transition-duration'] = time;
					nextCard.style["-webkit-transform"] = "scale(1.0)";
					nextCard.style["MozTransform"] = "scale(1.0)";
				},0);
			},0);
		}
		if(direction=='close' || direction=='out'){
			prevCard.style['MozTransitionDuration'] = "0s";
			prevCard.style['-webkit-transition-duration'] = "0s";
			setTimeout(function(){
				prevCard.style["MozTransform"] = "scale(1.0)";
				prevCard.style["-webkit-transform"] = "scale(1.0)";
				setTimeout(function(){
					prevCard.style['MozTransitionDuration'] = time;
					prevCard.style['-webkit-transition-duration'] = time;
					prevCard.style["-webkit-transform"] = "scale(0.0)";
					prevCard.style["MozTransform"] = "scale(0.0)";
				},0);
			},0);
		}
	}
	else if(effect=='iris'){
		if(direction=='open'){
			var clip = document.createElement("div");
			clip.className = "cardBack";
			clip.id = "dummyCardBack";
			clip.style.position = "absolute";
			clip.style.overflow = "hidden";
			clip.style['z-index'] = 101;
			nextCard.parentNode.appendChild(clip);
			nextCard.parentNode.removeChild(nextCard);
			clip.appendChild(nextCard);
			clip.style['MozTransitionDuration'] = time;
			clip.style['-webkit-transition-duration'] = time;
			nextCard.style.marginLeft = "-"+prevCard.offsetWidth/2+"px";
			nextCard.style.marginTop = "-"+prevCard.offsetHeight/2+"px";
			clip.style.marginLeft = prevCard.offsetWidth/2+"px";
			clip.style.marginTop = prevCard.offsetHeight/2+"px";
			clip.style.width = "0px";
			clip.style.height = "0px";
			setTimeout(function(){
				nextCard.style.marginLeft = "0px";
				nextCard.style.marginTop = "0px";
				clip.style.marginLeft = "0px";
				clip.style.marginTop = "0px";
				clip.style.width = prevCard.offsetWidth+"px";
				clip.style.height = prevCard.offsetHeight+"px";
			},0);
		}
		if(direction=='close'){
			var clip = document.createElement("div");
			clip.className = "cardBack";
			clip.id = "dummyCardBack";
			clip.style.position = "absolute";
			clip.style.overflow = "hidden";
			clip.style['z-index'] = 101;
			prevCard.parentNode.appendChild(clip);
			prevCard.parentNode.removeChild(prevCard);
			clip.appendChild(prevCard);
			clip.style['MozTransitionDuration'] = time;
			clip.style['-webkit-transition-duration'] = time;
			prevCard.style.marginLeft = "0px";
			prevCard.style.marginTop = "0px";
			clip.style.marginLeft = "0px";
			clip.style.marginTop = "0px";
			clip.style.width = prevCard.offsetWidth+"px";
			clip.style.height = prevCard.offsetHeight+"px";
			setTimeout(function(){
				prevCard.style.marginLeft = "-"+prevCard.offsetWidth/2+"px";
				prevCard.style.marginTop = "-"+prevCard.offsetHeight/2+"px";
				clip.style.marginLeft = prevCard.offsetWidth/2+"px";
				clip.style.marginTop = prevCard.offsetHeight/2+"px";
				clip.style.width = "0px";
				clip.style.height = "0px";
			},0);
		}
	}
	else if(effect=='barn door'){
		if(direction=='open'){
			var clip = document.createElement("div");
			clip.className = "cardBack";
			clip.id = "dummyCardBack";
			clip.style.position = "absolute";
			clip.style.overflow = "hidden";
			clip.style['z-index'] = 101;
			nextCard.parentNode.appendChild(clip);
			nextCard.parentNode.removeChild(nextCard);
			clip.appendChild(nextCard);
			clip.style['MozTransitionDuration'] = time;
			clip.style['-webkit-transition-duration'] = time;
			nextCard.style.marginLeft = "-"+prevCard.offsetHeight/2+"px";
			clip.style.marginLeft = prevCard.offsetWidth/2+"px";
			clip.style.width = "0px";
			clip.style.height = prevCard.offsetHeight+"px";
			setTimeout(function(){
				nextCard.style.marginLeft = "0px";
				clip.style.marginLeft = "0px";
				clip.style.width = prevCard.offsetWidth+"px";
			},0);
		}
		if(direction=='close'){
			var clip = document.createElement("div");
			clip.className = "cardBack";
			clip.id = "dummyCardBack";
			clip.style.position = "absolute";
			clip.style.overflow = "hidden";
			clip.style['z-index'] = 101;
			prevCard.parentNode.appendChild(clip);
			prevCard.parentNode.removeChild(prevCard);
			clip.appendChild(prevCard);
			clip.style['MozTransitionDuration'] = time;
			clip.style['-webkit-transition-duration'] = time;
			prevCard.style.marginLeft = "0px";
			clip.style.marginLeft = "0px";
			clip.style.width = prevCard.style.width;
			clip.style.height = prevCard.style.height;
			setTimeout(function(){
				prevCard.style.marginLeft = "-"+prevCard.offsetWidth/2+"px";
				clip.style.marginLeft = prevCard.offsetWidth/2+"px";
				clip.style.width = "0px";
			},0);
		}
	}
}

//--
//画像ファイル

window.addEventListener('dragover', function(event) {
	event.stopPropagation();
	event.preventDefault(); //勝手にファイル開くな
	if(document.getElementById('resourceEditor').style.display!="none"){
		var elms = document.getElementById('resourceEditor').getElementsByClassName("ui-widget-content");
		for(var i=0;i<elms.length;i++){
			elms[i].style.backgroundColor = '#88f';
		}
	}else{
		document.documentElement.style.backgroundColor='#88f';
		document.getElementById('page').style.backgroundColor='#88f';
	}
}, false);

window.addEventListener('dragleave', function(event) {
	event.stopPropagation();
	event.preventDefault();
	if(document.getElementById('resourceEditor').style.display!="none"){
		var elms = document.getElementById('resourceEditor').getElementsByClassName("ui-widget-content");
		for(var i=0;i<elms.length;i++){
			elms[i].style.backgroundColor='';
		}
	}else{
		document.documentElement.style.backgroundColor='';
		document.getElementById('page').style.backgroundColor='';
	}
}, false);

window.addEventListener('dragenter', function(event) {
	event.stopPropagation();
	event.preventDefault();
}, false);

window.addEventListener('drop', function(event) {
	event.stopPropagation();
	event.preventDefault();
	var rsrcDrop = document.getElementById('resourceEditor').style.display!="none";
	if(rsrcDrop){
		var elms = document.getElementById('resourceEditor').getElementsByClassName("ui-widget-content");
		for(var i=0;i<elms.length;i++){
			elms[i].style.backgroundColor='';
		}
	}else{
		document.documentElement.style.backgroundColor='';
		document.getElementById('page').style.backgroundColor='';
	}

	var files = event.dataTransfer.files;

	if(files.length>0){
		for(var i = 0; i < files.length; i++){
			var file = files[i];
			//document.getElementById('messagebox').value = ('name=' + file.name + ' type=' +file.type + ' size=' + file.size);

			// ファイルタイプ(MIME)で対応しているファイルか判定
			if (!file.type.match(/image\/\w+/) && !file.type.match(/audio\/\w+/)) {
				alert('画像/音声ファイル以外は利用できません');
				return;
			}
			var request = new XMLHttpRequest();
			request.upload.onprogress = function(e){
				var msg = document.getElementById('messageboxDiv');
				if(msg.style.display=='none'){
					msg.style.display='';
					msg.style.left = document.body.scrollWidth/2 - msg.offsetWidth/2 + "px";
					msg.style.top = document.getElementById("par").offsetHeight - 40 + "px";
				}
				document.getElementById('messagebox').value = parseInt(((e.loaded / e.total)*100) + "%");
			};
			request.upload.onload = function(e){
				document.getElementById('messagebox').value = 'finished';
				document.getElementById('messageboxDiv').style.display='none';
			};
			request.onreadystatechange = function() {
				//var msg = document.getElementById('messagebox');
				if (request.readyState == 4) {
					if (request.status == 200) {
						if(rsrcDrop){
							newRsrcFile(file);
						}
						else if(selectedTool=='button'){
							var img = new Image();
							img.onload = function() {
								var rsrc = new Rsrc('icon');
								if(masterEditMode){
									rsrc.file = file.name;
								}else{
									rsrc.fileLocal = file.name;
								}
								addResource(rsrc);
								var x = (event.pageX - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
								var y = (event.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;
								//var x = (event.pageX - document.getElementById('cardBack').parentNode.offsetLeft);
								//var y = (event.pageY - document.getElementById('cardBack').parentNode.offsetTop);
								if(x<0) x=0;
								if(y<0) y=0;
								mmsgSendSystemEvent("createNewButton",{icon:rsrc.id, x:x,y:y, width:img.width, height:img.height, showName:false, editBackground:system.editBackground,style:'transparent'});
							};
							img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+file.name;
						}
						else if(inPaintMode){
							uploadPaintFile(event,file);
						}else{
							changeTool("select");
							setTimeout(function(){
								uploadPaintFile(event,file);
							},200);
						}
					} else if (request.status == 403) {
						ajaxLoginOpen((browserLang=="ja")?"ファイルのアップロードに失敗しました":"Upload file failure", function(status){
							$('#loginDialog').dialog('close');
							//console.log(status);
							/*if(status.indexOf("logout.jsp")>0)*/{alert((browserLang=="ja")?"ログイン成功しました。もう一度ファイルをアップロードしてください":"Logged in. Please retry to upload file.");}
							//else{alert("ログインに失敗しました");}
						});
					} else {
						alert('通信に失敗しました。');
						//msg.value = "通信に失敗しました。";
					}
				} else {
					//msg.value = "通信中…";
				}
			};

			var formdata = new FormData();
			//formdata.append("test", "testtext");
			formdata.append("file", files[i]);
			var url = "fileupload?user="+userParameter+"&name="+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"&mime="+escapeHTML(file.type)+"&fname="+encodeURI(file.name);
			if(!masterEditMode){
				url = "fileupload?user="+userId+"&name=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"&mime="+escapeHTML(file.type)+"&fname="+encodeURI(file.name);
				//これではアップロードできないが・・・
			}
			request.open('post', url, true );
			request.send(formdata);
		}
	}
}, false);

function uploadPaintFile(event,file){
	execMenu('tb_select');
	var img = new Image();
	img.onload = function() {
		var canvElm = document.createElement('canvas');
		canvElm.id = "floatingCanvas";
		var left = 0;
		var top = 0;
		if(event){
			left = (event.pageX - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2-img.width/2;
			top = (event.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2-img.height/2;
			//var left = (event.pageX - document.getElementById('cardBack').parentNode.offsetLeft);
			//var top = (event.pageY - document.getElementById('cardBack').parentNode.offsetTop);
			if(left<0) left=0;
			if(top<0) top=0;
			if(left>stackData1.width-10) left=stackData1.width-10;
			if(top>stackData1.height-10) top=stackData1.height-10;
		}
		canvElm.style.position = "absolute";
		canvElm.style.left = left+"px";
		canvElm.style.top = top+"px";
		canvElm.style.cursor = "default";
		canvElm.style.outline = "1px dotted #000";
		canvElm.width = img.width;
		canvElm.height = img.height;
		canvElm.oncontextmenu = function(){return false;};
		var pictElm = document.getElementById('picture');
		pictElm.parentNode.insertBefore(canvElm,pictElm.nextSibling);
		var ctx = canvElm.getContext('2d');
		ctx.drawImage(img, 0, 0);
	};
	img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(file.name);
	if(!masterEditMode){
		img.src = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(file.name);
	}
}

function cardDrop(event,option) {
	var x = (event.pageX - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
	var y = (event.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;
	//var x = event.pageX/getCardScale() +- document.getElementById('cardBack').parentNode.offsetLeft;
	//var y = event.pageY/getCardScale() +- document.getElementById('cardBack').parentNode.offsetTop;
	if(x>0 && y>0 && x<stackData1.width && y<stackData1.height){
		var objid = option.draggable.get(0).id;
		if(objid!=undefined && objid.match("btn-plt-(.*)")){
			var btnstyle = RegExp.$1;
			mmsgSendSystemEvent("createNewButton",{x:x,y:y,editBackground:system.editBackground,style:btnstyle});
		}
		else if(objid.match("fld-plt-(.*)")){
			var fldstyle = RegExp.$1;
			mmsgSendSystemEvent("createNewField",{x:x,y:y,editBackground:system.editBackground,style:fldstyle});
		}
		else{
			alert('drop object unknown');
		}
	}
}

//--

var winDragObj = null;
var winDragPoint = {};

function startMoveWindow(event,target){
	winDragObj = target.parentNode;
	winDragPoint.x = event.pageX ;//+ winDragObj.offsetLeft;
	winDragPoint.y = event.pageY ;//+ winDragObj.offsetTop;
	winDragPoint.inx = event.pageX;
	winDragPoint.iny = event.pageY;
	winDragPoint.styleleft = parseInt(winDragObj.style.left.match("[-0-9]*"));
	winDragPoint.styletop = parseInt(winDragObj.style.top.match("[-0-9]*"));
}

function endMoveWindow(){
	winDragObj = null;
}

function mouseMove (event){
	if(document.getElementById('overrayBack').style.display!="block"){
		_mouse.setLoc(event);
	}
	if(tbDragObj!=null){
		if(authBtnDownTimer){
			clearTimeout(authBtnDownTimer);
			authBtnDownTimer=null;
		}
		if(tbOverObj.style.cursor=="copy"){
			var id = tbOverObj.id;
			if(id.indexOf("button")!=-1) var data = getBtnData(id);
			else data = getFldData(id);
			mmsgSendSystemEvent("copyObj",{basetype:data.parent, type:data.type, id:data.id});
			mmsgSendSystemEvent("pasteObj",{basetype:system.editBackground?"background":"card"});
			tbOverObj.style.cursor="";
			/*setTimeout(function(){
				var parts = system.editBackground?currentBgObj.parts:currentCardObj.parts;
				var p = parts[parts.length-1];
				tbOverObj = document.getElementById((system.editBackground?"bg-":"")+p.type+"-"+p.id);
				if(tbOverObj) tbOverObj.style.cursor="move";
				tbDragObj = tbOverObj;
			},100);*/
			hideInfoDialog();
			tbOverObj = null;
			tbDragObj = null;
		}
		if(tbOverObj.style.cursor=="move"){
			if(event.shiftKey && tbOverObj.sx){
				var dx = parseInt(tbOverObj.sx) - (tbDownPoint.offsetLeft + (event.pageX - tbDownPoint.inbtnx)/getCardScale());
				var dy = parseInt(tbOverObj.sy) - (tbDownPoint.offsetTop + (event.pageY - tbDownPoint.inbtny)/getCardScale());
				if(dx*dx > dy*dy){
					tbDragObj.style.left = tbDownPoint.offsetLeft + (event.pageX - tbDownPoint.inbtnx)/getCardScale() +"px";
					tbDragObj.style.top = tbOverObj.sy;
				}else{
					tbDragObj.style.left = tbOverObj.sx;
					tbDragObj.style.top = tbDownPoint.offsetTop + (event.pageY - tbDownPoint.inbtny)/getCardScale() +"px";
				}
			}else{
				tbDragObj.style.left = tbDownPoint.offsetLeft + (event.pageX - tbDownPoint.inbtnx)/getCardScale() +"px";
				tbDragObj.style.top = tbDownPoint.offsetTop + (event.pageY - tbDownPoint.inbtny)/getCardScale() +"px";
			}
			if(document.getElementById("anchor-0")) hideBtnAnchor();
		}
		if(tbOverObj.style.cursor.match("n.*-resize")){
			if(tbDownPoint.offsetHeight - (event.pageY - tbDownPoint.inbtny) >= 0){
				tbDragObj.style.top = tbDownPoint.offsetTop + (event.pageY - tbDownPoint.inbtny)/getCardScale() +"px";
				tbDragObj.style.height = tbDownPoint.offsetHeight - (event.pageY - tbDownPoint.inbtny)/getCardScale() +"px";
			}
		}
		if(tbOverObj.style.cursor.match("s.*-resize")){
			tbDragObj.style.height = tbDownPoint.offsetHeight + (event.pageY - tbDownPoint.inbtny)/getCardScale() +"px";
		}
		if(tbOverObj.style.cursor.match(".*w-resize")){
			if(tbDownPoint.offsetWidth - (event.pageX - tbDownPoint.inbtnx) >= 0){
				tbDragObj.style.left = tbDownPoint.offsetLeft + (event.pageX - tbDownPoint.inbtnx)/getCardScale() +"px";
				tbDragObj.style.width = tbDownPoint.offsetWidth - (event.pageX - tbDownPoint.inbtnx)/getCardScale() +"px";
			}
		}
		if(tbOverObj.style.cursor.match(".*e-resize")){
			tbDragObj.style.width = tbDownPoint.offsetWidth + (event.pageX - tbDownPoint.inbtnx)/getCardScale() +"px";
		}
		if(tbOverObj.style.cursor.match(".*e-resize")){
			tbDragObj.style.width = tbDownPoint.offsetWidth + (event.pageX - tbDownPoint.inbtnx)/getCardScale() +"px";
		}
		var btnData = getBtnData(tbDragObj.id);
		if(btnData && btnData.icon!=0){
			var canvas = document.getElementById(tbDragObj.id+"icon");
			if(canvas!=null){
				if(tbOverObj.style.cursor.match(".*-resize"))
				{
					var xh = canvas.width - tbDragObj.offsetWidth;
					var yh = canvas.height - tbDragObj.offsetHeight;
					if(xh>1){
						canvas.style.marginLeft = -xh/2+"px";
					}
					if(yh>1){
						canvas.style.marginTop = -yh/2+"px";
					}
				}
			}
			canvas = null;
		}
		return;
	}
	if(tbOverObj!=null){
		var x=0, y=0;
		var pagex = (event.pageX - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
		var pagey = (event.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;
		var px = pagex - tbOverObj.offsetLeft - tbOverObj.parentNode.offsetLeft /*- tbOverObj.parentNode.parentNode.offsetLeft*/;
		var py = pagey - tbOverObj.offsetTop - tbOverObj.parentNode.offsetTop /*- tbOverObj.parentNode.parentNode.offsetTop*/;
		if(py <= tbOverObj.offsetHeight/4 && py<4){
			y = -1;
		}
		else if(py >= tbOverObj.offsetHeight/4 && py>tbOverObj.offsetHeight-4){
			y = 1;
		}
		if(px <= tbOverObj.offsetWidth/4 && px<4){
			x = -1;
		}
		else if(px >= tbOverObj.offsetWidth/4 && px>tbOverObj.offsetWidth-4){
			x = 1;
		}
		if(event.altKey && !event.metaKey){
			tbOverObj.style.cursor = "copy";
		}
		else if(event.shiftKey){
			tbOverObj.sx = tbOverObj.style.left;
			tbOverObj.sy = tbOverObj.style.top;
			tbOverObj.style.cursor = "move";
		}
		else if(x==-1){
			if(y==-1){ tbOverObj.style.cursor = "nw-resize"; }
			if(y==0){ tbOverObj.style.cursor = "w-resize"; }
			if(y==1){ tbOverObj.style.cursor = "sw-resize"; }
		}
		else if(x==0){
			if(y==-1){ tbOverObj.style.cursor = "n-resize"; }
			if(y==0){ 
				tbOverObj.sx = null;
				tbOverObj.sy = null;
				tbOverObj.style.cursor = "move";
			}
			if(y==1){ tbOverObj.style.cursor = "s-resize"; }
		}
		else if(x==1){
			if(y==-1){ tbOverObj.style.cursor = "ne-resize"; }
			if(y==0){ tbOverObj.style.cursor = "e-resize"; }
			if(y==1){ tbOverObj.style.cursor = "se-resize"; }
		}
		return;
	}
	if(winDragObj!=null){
		var point = {};
		point.x = event.pageX;
		point.y = event.pageY;
		//var obj = event.target;
		//while(obj){
		//if(typeof(obj.offsetLeft)=='number'){
		//point.x += obj.offsetLeft;
		//point.y += obj.offsetTop;
		//}
		//obj = obj.offsetParent;
		//}
		winDragObj.style.left = winDragPoint.styleleft + (point.x - winDragPoint.x) +"px";
		winDragObj.style.top = winDragPoint.styletop + (point.y - winDragPoint.y) +"px";
	}
}

var VirtualPadInstalled = {};
function VirtualPadInstall(keys){
	if(!('createTouch' in document)) return;

	var root = document.getElementById("virtualPad");
	if(!root){
		root = document.createElement("div");
		root.id = "virtualPad";
		root.style.position = "absolute";
		root.style.width = "100%";
		root.style.height = "100%";
		root.style.pointerEvents = "none";
		document.getElementById("par").appendChild(root);

		var sw = document.createElement("div");
		sw.id = "vpad-sw";
		sw.style.position = "absolute";
		sw.style.width = "48px";
		sw.style.height = "48px";
		sw.style.left = "0px";
		sw.style.top = "0px";
		sw.style.border = "1px solid #000000";
		sw.style.background = "#ffffff";
		sw.style.opacity = "0.5";
		sw.textContent = "[move]";
		sw.style.zIndex = 103; //msgより前
		sw.style.pointerEvents = "auto";
		sw.ontouchstart = function(){
			var sw = document.getElementById("vpad-sw");
			sw.style.border = "4px solid #ff0000";
		};
		sw.ontouchend = function(){
			var sw = document.getElementById("vpad-sw");
			sw.style.border = "1px solid #000000";
			if(sw.textContent=="[move]") sw.textContent = "[lock]";
			else sw.textContent = "[move]";
		};
		sw.ontouchmove = function(e){
			if(event.touches.length==1){
				var elm = document.getElementById("vpad-sw");
				elm.style.left = e.pageX+"px";
				elm.style.top = e.pageY+"px";
			}
		};
		root.appendChild(sw);
		sw = null;
	}

	var left = 0;
	for(var x in keys){
		if(VirtualPadInstalled[x]) continue;
		var btn = document.createElement("div");
		btn.id = "vpad-"+x;
		btn.style.position = "absolute";
		btn.style.width = "48px";
		btn.style.height = "48px";
		btn.style.left = left+"px";
		left += 48;
		btn.style.top = window.innerHeight-48-48+"px";
		btn.style.border = "1px solid #000000";
		btn.style.background = "#ffffff";
		btn.style.opacity = "0.5";
		btn.textContent = fromCharcode(x);
		btn.style.zIndex = 103; //msgより前
		btn.style.pointerEvents = "auto";
		(function(x){
			btn.ontouchstart = function(){
				keys[x] = true;
				document.getElementById("vpad-"+x).style.border = "4px solid #ff0000";
				mmsgSyncProperty("keys",x,true);
			};
			btn.ontouchend = function(){
				keys[x] = false;
				document.getElementById("vpad-"+x).style.border = "1px solid #000000";
				mmsgSyncProperty("keys",x,false);
			};
			btn.ontouchmove = function(e){
				if(document.getElementById("vpad-sw").textContent=="[move]"){
					if(event.touches.length==1){
						var elm = document.getElementById("vpad-"+x);
						elm.style.left = (e.pageX-24)+"px";
						elm.style.top = (e.pageY-24)+"px";
					}
				}
				else{
					for(var i in VirtualPadInstalled){
						var pushed = false;
						var btni = document.getElementById("vpad-"+i);
						for(var j=0; j<event.touches.length; j++){
							var t = event.touches[j];
							if(t.pageX>=btni.offsetLeft && t.pageX<btni.offsetLeft+btni.offsetWidth &&
									t.pageY>=btni.offsetTop && t.pageY<btni.offsetTop+btni.offsetHeight)
							{
								pushed = true;
							}
						}
						if(keys[i]!=pushed){
							keys[i] = pushed;
							btni.style.border = (pushed)?"4px solid #ff0000":"1px solid #000000";
							mmsgSyncProperty("keys",i,pushed);
						}
					}
				}
			};
		})(x);
		root.appendChild(btn);
		VirtualPadInstalled[x] = true;
	}

	btn = null;
	root = null;
}

function fromCharcode(x){
	switch(x+""){
	case "16": return "shift";
	case "91": return "cmd";
	case "93": return "r cmd";
	case "18": return "option";
	case "13": return "return";
	case "38": return "↑";
	case "40": return "↓";
	case "37": return "←";
	case "39": return "→";
	case "17": return "ctrl";
	case "20": return "caps";
	case "8": return "backspace";
	case "46": return "delete";
	case "27": return "esc";
	case "96": return "t0";
	case "97": return "t1";
	case "98": return "t2";
	case "99": return "t3";
	case "100": return "t4";
	case "101": return "t5";
	case "102": return "t6";
	case "103": return "t7";
	case "104": return "t8";
	case "105": return "t9";
	}
	if(x>46 && x<96){
		return String.fromCharcode(x);
	}
	return "???";
}
