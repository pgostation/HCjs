"use strict";

//--
//システム、マウス

var stackData1 = {userLevel:1};

var system = {
	lockedScreen:false,
	userLevel:5,
};

var _mouse = {
		button:"up",
		_click:false,
		rightClick:false,
		mouseH:0,
		mouseV:0,
		clickH:0,
		clickV:0,
		clickchunk:"",
		clickline:"",
		clicktext:"",
		clickobj:"",
		isDoubleClick:false,
		lastClickTime:0,
		setLoc:function(e){
			var x = (e.pageX - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
			var y = (e.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;
			this.mouseH = parseInt(x);//e.pageX-document.getElementById('cardBack').parentNode.offsetLeft;
			this.mouseV = parseInt(y);//e.pageY-document.getElementById('cardBack').parentNode.offsetTop;
			this.sync();
		},
		setClickDown:function(e,tgtid){
			this.setLoc(e);
			if((e.button&2)==0) this._click = true;
			if((e.button&2)==2) this.rightClick = true;
			this.button = "down";
			this.sync();
		},
		setClick:function(e,tgtid){
			this.isDoubleClick=false;
			if(new Date()-this.lastClickTime<500 && Math.abs(this.clickH-e.pageX)<3 && Math.abs(this.clickV-e.pageY)<3){
				this.isDoubleClick=true;
			}
			var obj = document.getElementById(tgtid);
			this.button = "up";
			var xx = (e.pageX - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
			var yy = (e.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;
			this.clickH = parseInt(xx);//e.pageX-document.getElementById('cardBack').offsetLeft;
			this.clickV = parseInt(yy);//e.pageY-document.getElementById('cardBack').offsetTop;
			this.clickobj = obj;
			this.lastClickTime = +new Date();
			if(e.srcElement==obj){ var y = e.offsetY+(obj?obj.scrollTop:0); }
			else { y = e.offsetY; }
			if(tgtid!=undefined && tgtid.indexOf("field")!=-1){
				var cline = ((y)/obj.style.lineHeight.match(/[0-9]+/)+1|0);
				this.clickline = "line "+cline+" of card field id "+tgtid.match(/[0-9]+/);
				var linetext = obj.innerHTML.replace(/\<[\/]*span[^\>]*\>/g,"").split("<br>")[cline-1];
				if(linetext){
					var clickstart = (e.offsetX/(parseInt(obj.style.fontSize)*0.6)+1|0); //てきとう canvasのmeasuretextとか使う？
					var ary = linetext.split(" ");
					var i=0;var cstart=0;
					for(var j=0;j<ary.length;j++){
						i+=ary[j].length+1;
						if(i>clickstart-1)break;
						cstart = i;
					}
					if(j>=ary.length)j--;
					this.clicktext = ary[j];
					this.clickchunk = "char "+(cstart+1)+" to "+(cstart+(this.clicktext+"").length)+" of "+this.clickline;
				}
				else{
					this.clicktext = "";
					this.clickchunk = "";
				}
			}
			this.sync();
		},
		sync:function(){
			//前回の状態と変わったプロパティを通知
			for(var prop in this){
				if((typeof(this[prop])=="string" || typeof(this[prop])=="number" || typeof(this[prop])=="boolean")){
					if(this[prop]!=this.last[prop]){
						mmsgSyncProperty("mouse", prop, this[prop]);
					}
					//今回の状態を保存
					this.last[prop] = this[prop];
				}
			}
			this._click = false;
			this.last._click = false;
		},
		last:{},
};
function myClone(obj){
	return JSON.parse(JSON.stringify(obj));
}
/*
function clickline(){
	return mouse.clickline;
}*/

//--
//キー入力
var keys = []; //workerのほうも持っている
var keycode_shift=16;
var keycode_meta=91;//cmd(L)
var keycode_rightmeta=93;//cmd(R)
var keycode_alt=18;//opt
var keycode_ctrl=17;//ctrl

function keysInit(){
	for(var i=0;i<128;i++){
		keys[i]=false;
	}
	document.addEventListener('keydown', sysKeyDown, false);
	document.addEventListener('keyup', sysKeyUp, false);

	//現在フォーカスしているエレメントを
	if (typeof(document.activeElement)=='undefined'){
		document.activeElement = null;
		var allTags = document.getElementsByTagName('input');
		for(var i=0,l=allTags.length;i<l;i++){
			allTags[i].onfocus = function(){document.activeElement = this;};
			allTags[i].onblue = function(){document.activeElement = null;};
		}
	}
}

function sysKeyDown(e){
	var ev=e;
	keys[ev.keyCode] = true;
	mmsgSyncProperty("keys",ev.keyCode,true);
	if(document.getElementById("scriptEditor").style.display!='none'){
		if(document.activeElement.id!=null){
			if(document.activeElement.tagName=="INPUT"){
				return true;
			}
		}
		if(!scriptKeyboadShortcut(ev.keyCode,true)){
			e.preventDefault();
			return false;
		}
	}
	if(document.activeElement.id!=null){
		if(document.activeElement.tagName=="TEXTAREA"||document.activeElement.tagName=="INPUT"||document.activeElement.contentEditable=="true"){
			return true;
		}
	}
	if(document.getElementById("rsrcMain").style.display=='none' && document.getElementById('resourceEditor').style.display!='none'){
		if(!resourceKeyboadShortcut(ev.keyCode,true,ev)){
			e.preventDefault();
			return false;
		}
	}
	else if(document.getElementById('overrayBack').style.display!='none'){
		if(ev.keyCode==13){
			if(document.getElementById("answerDialog").style.display!="none"){
				document.getElementById("answerBtn1").className += " ui-state-active";
			}else if(document.getElementById("askDialog").style.display!="none"){
				document.getElementById("askBtn1").className += " ui-state-active";
			}
		}
		return;
	}
	if(inPaintMode){
		setPaintCursor(e);
	}
	var sk=isMacOS()?keycode_meta:keycode_ctrl;
	if(keys[sk]&&ev.keyCode==190){
		mmsgSyncProperty("stop","","");
	}
	if(!inRunning && !keyboadShortcut(ev.keyCode,true)){
		e.preventDefault();
		return false;
	}
}

function sysKeyUp(e){
	var ev=e;
	keys[ev.keyCode] = false;
	mmsgSyncProperty("keys",ev.keyCode,false);
	if(document.getElementById("scriptEditor").style.display!='none'){
		if(!scriptKeyboadShortcut(ev.keyCode,false)){
			e.preventDefault();
			return false;
		}
	}
	if(document.activeElement.id!=null){
		if(document.activeElement.tagName=="TEXTAREA"||document.activeElement.tagName=="INPUT"||document.activeElement.contentEditable=="true"){
			return true;
		}
	}
	if(document.getElementById('resourceEditor').style.display!='none'){
		if(!resourceKeyboadShortcut(ev.keyCode,false,ev)){
			e.preventDefault();
			return false;
		}
	}
	else if(document.getElementById('overrayBack').style.display!='none'){
		if(ev.keyCode==13){
			if(document.getElementById("answerDialog").style.display!="none"){
				var btn = document.getElementById("answerBtn1");
				btn.click();
				if(btn.className.indexOf("ui-state-active")!=-1){
					btn.className = btn.className.substring(0,btn.className.length-16);
				}
			}else if(document.getElementById("askDialog").style.display!="none"){
				var btn = document.getElementById("askBtn1");
				btn.click();
				if(btn.className.indexOf("ui-state-active")!=-1){
					btn.className = btn.className.substring(0,btn.className.length-16);
				}
			}
		}
		return;
	}
	if(inPaintMode){
		setPaintCursor(e);
	}
	if(!inRunning && !keyboadShortcut(ev.keyCode,false)){
		e.preventDefault();
		return false;
	}
}

var inRunning = false;
var ObjectHover=false;

function keyboadShortcut(k,d){
	var c = String.fromCharCode(k);
	//console.log("key:"+c+"  keycode:"+k);
	var sk=isMacOS()?keycode_meta:keycode_ctrl;

	if(keys[sk]&&c=="Q"){
		if(d)execMenu("quit");
	}
	else if(keys[sk]&&c=="S"){
		if(d)execMenu("save");
	}
	else if(keys[sk]&&c=="M"){
		if(d)execMenu("message");
	}
	else if(keys[sk]&&c=="N"){
		if(d)execMenu("new card");
	}
	else if(keys[sk]&&c=="B"){
		if(d)execMenu("background");
	}
	else if(keys[keycode_shift]&&keys[sk]&&c=="Z"){
		if(d)execMenu("redo");
	}
	else if(keys[sk]&&c=="Z"){
		if(d)execMenu("undo");
	}
	else if(keys[sk]&&c=="X"){
		if(d)execMenu("cut");
	}
	else if(keys[sk]&&c=="C"){
		if(d)execMenu("copy");
	}
	else if(keys[sk]&&c=="V"){
		if(d)execMenu("paste");
	}
	else if(keys[sk]&&c=="A" && inPaintMode){
		if(d)execMenu("select all");
	}
	else if(keys[sk]&&c=="F"){
		if(d)execMenu("find…");
	}
	else if(keys[sk]&&c=="k" && inPaintMode){ //+
		if(d)execMenu("zoom in");
	}
	else if(keys[sk]&&c=="m" && inPaintMode){ //-
		if(d)execMenu("zoom out");
	}
	else if(keys[sk]&&(c=="0"||k==96)){
		if(d)execMenu("menubar");
	}
	else if(keys[keycode_alt]&&c=="\t"){
		if(d) changeVisibleToolPalette();
	}
	else if(ObjectHover && (c=="1"||c=="C" || k==97)){
		if(system.userLevel<=4)return false;
		setHoverObject(false);scriptEditorObj(currentCardObj);
	}
	else if(ObjectHover && (c=="2"||c=="B" || k==98)){
		if(system.userLevel<=4)return false;
		setHoverObject(false);scriptEditorObj(currentBgObj);
	}
	else if(ObjectHover && (c=="3"||c=="S" || k==99)){
		if(system.userLevel<=4)return false;
		setHoverObject(false);scriptEditorObj(stackData1);
	}
	else if(keys[sk]&&k==190){
		if(d)mmsgSyncProperty("stop","","");
	}
	else if(keys[sk]&&c=="%"){
		if(d)execMenu("arrowkey left withCmd");
	}
	else if(keys[sk]&&c=="'"){
		if(d)execMenu("arrowkey right withCmd");
	}
	else if(c=="%"){
		if(d)execMenu("arrowkey left");
	}
	else if(c=="'"){
		if(d)execMenu("arrowkey right");
	}
	else if(c=="&"){
		if(d)execMenu("arrowkey up");
	}
	else if(c=="("){
		if(d)execMenu("arrowkey down");
	}
	else if(k==8||k==46){//bs delete
		if(d&&inPaintMode){
			var floatElem = document.getElementById('floatingCanvas');
			if(floatElem!=undefined){
				floatElem.parentNode.removeChild(floatElem);
				var svg = document.getElementById('floatingSvg');
				if(svg!=undefined)svg.parentNode.removeChild(svg);

				var canv = document.getElementById('picture');
				canv.getContext('2d').clearRect(0,0,1,1);
				saveCanvas();
			}
		}
	}
	else if((keys[sk]&&keys[keycode_alt])==!ObjectHover && !inPaintMode){
		setHoverObject(!ObjectHover);
	}
	else return true;
	return false;
}

function scriptKeyboadShortcut(k,d){
	var c = String.fromCharCode(k);
	//console.log("key:"+c+"  keycode:"+k);
	var sk=isMacOS()?keycode_meta:keycode_ctrl;

	if(keys[sk]&&c=="S"){
		if(d)convertHT2('');
	}
	else if(keys[sk]&&c=="W"){
		if(d)convertHT2('close');
	}
	else if(keys[keycode_shift]&&keys[sk]&&c=="Z"){
		if(d)execMenu("redo");
	}
	else if(keys[sk]&&c=="Z"){
		if(d)execMenu("undo");
	}
	else if(k==13){
		//if(!d)setTimeout(scriptIndent,0); //カーソル位置がずれるので、returnでの自動インデントは無しで
		return true;
	}
	else if((keys[sk]&&keys[keycode_alt])&&(c=="1"||c=="C" || k==97)){
		scriptEditorObj(currentCardObj);
	}
	else if((keys[sk]&&keys[keycode_alt])&&(c=="2"||c=="B" || k==98)){
		scriptEditorObj(currentBgObj);
	}
	else if((keys[sk]&&keys[keycode_alt])&&(c=="3"||c=="S" || k==99)){
		scriptEditorObj(stackData1);
	}
	else if(k==9){ //tab
		if(d)scriptIndent();
	}
	else return true;
	return false;
}

function resourceKeyboadShortcut(k,d,e){
	var c = String.fromCharCode(k);
	//console.log("key:"+c+"  keycode:"+k);
	var sk=isMacOS()?keycode_meta:keycode_ctrl;

	if(keys[sk]&&c=="W"){
		if(d)rsrcEditorClose();
	}
	else if(keys[sk]&&c=="X"){
		if(d)execMenu("cut item");
	}
	else if(keys[sk]&&c=="C"){
		if(d)execMenu("copy item");
	}
	else if(keys[sk]&&c=="V"){
		if(d)execMenu("paste");
	}
	else if(keys[sk]&&c=="Z"){
		if(d)execMenu("undo rsrcitem");
	}
	else if(keys[sk]&&c=="D"){
		if(d)execMenu("cut item");
		if(d)execMenu("paste");
	}
	else if(keys[sk]&&c=="I"){
		if(d)execMenu("show information…");
	}
	else if(keys[sk]&&c=="N"){
		if(d)execMenu("new item");
	}
	else if(k==8||k==46){//bs delete
		if(d)execMenu("delete item");
	}
	else if(c=="%"){
		if(d)selectRsrcItemArrow("left",e);
	}
	else if(c=="'"){
		if(d)selectRsrcItemArrow("right",e);
	}
	else if(c=="&"){
		if(d)selectRsrcItemArrow("up",e);
	}
	else if(c=="("){
		if(d)selectRsrcItemArrow("down",e);
	}
	else return true;
	return false;
}

function changeVisibleToolPalette(){
	openMenu('Tools','menubtn4');
}

function setHoverObject(x){
	if(stackData1.cantPeek) x=false;
	ObjectHover = x;
	mmsgSendSystemEvent("setHoverObject",x);
}

function innerSetHoverObject(x){
	ObjectHover=x;
	if(ObjectHover){buttonDef=buttonDef3;fieldDef=fieldDef3;
	}else{execMenu("tb_"+selectedTool);}
	var bgObj=currentBgObj;
	for(var i=0;i<bgObj.parts.length;i++){
		var elm=document.getElementById("bg-"+bgObj.parts[i].type+"-"+bgObj.parts[i].id);
		elm.style.outline=ObjectHover?"1px dotted #006":"0px solid #000";
	}
	for(i=0;i<currentCardObj.parts.length;i++){
		elm=document.getElementById(currentCardObj.parts[i].type+"-"+currentCardObj.parts[i].id);
		if(elm)elm.style.outline=ObjectHover?"1px dotted #006":"0px solid #000";
	}
}

//--
//オブジェクト

function cardWindow(){
	return null;
}

function palette(name){ //windowではfirefoxで衝突する
	if(name=='tool'){
		//return toolPltData;
	}
	return null;
}

function findCard(name,dataAry){
	if(typeof(name)=='number'){
		return dataAry[name];
	}
	else{
		for(var i=0; i<dataAry.length; i++){
			if(dataAry[i].name==name){
				return dataAry[i];
			}
		}
	}
	return undefined;
}

function findParts(name,dataAry,type){
	if(typeof(name)=='number'){
		var num=0;
		var len=dataAry.length;
		for(var i=0; i<len; i++){
			if(dataAry[i].type==type){
				num++;
				if(num==name){
					return dataAry[i];
				}
			}
		}
	}
	else{
		var len=dataAry.length;
		for(var i=0; i<len; i++){
			if(dataAry[i].name==name && dataAry[i].type==type){
				return dataAry[i];
			}
		}
	}
	return undefined;
}
function findPartsById(id,dataAry,type){
	var len=dataAry.length;
	for(var i=0; i<len; i++){
		if(dataAry[i].id==id && dataAry[i].type==type){
			return dataAry[i];
		}
	}
	return undefined;
}

var changePropQ = new Array();
var chagePropTimer;
function changePropFrame(obj, prop, isbg){
	changePropQ[changePropQ.length] = {obj:obj, prop:prop, isbg:isbg};
	popPropFrame();
}

function pushPropFrame(obj, prop, isbg){ //lockscreen用に変更を保存し続ける
	changePropQ[changePropQ.length] = {obj:obj, prop:prop, isbg:isbg};
}

function popPropFrame(){
	if(!chagePropTimer){
		//requestAnimationFrameはwebkit nightlyで使える
		if(window.requestAnimationFrame){
			chagePropTimer = true;
			requestAnimationFrame(changePropRun);
		}else{
			chagePropTimer = setTimeout(function(){
				chagePropTimer = null;
				changePropRun();
			},0);
		}
	}
}

function resetPropFrame(){
	changePropQ = new Array();
}


var setRectFlag;
function changePropRun(){
	var len = changePropQ.length;
	for(var i=0; i<len; i++){
		var q = changePropQ[i];
		if(1 == changePropFunc(q.obj,q.prop,q.isbg)){
			break;
		}
	}
	changePropQ = new Array();
	mmsgSyncProperty("changeObjCountReset", "", "");
	if(chagePropTimer){
		clearTimeout(chagePropTimer);
		chagePropTimer = null;
		if(setRectFlag){
			setPartsRect();
		}
	}
}

function changePropFunc(obj, prop, isbg){
	if(isbg=="bg"&&obj.parentId!=currentCardObj.background)return;
	else if(isbg!="bg"&&obj.parentId!=currentCardObj.id)return;
	if(isbg=="bg")isbg="bg-";

	switch(prop){
	case "name":
		if(obj.type=="button"){
			if(obj.style=="popup" || obj.style=="radio" || obj.style=="checkbox"){
				if(obj.showName) document.getElementById(isbg+obj.type+'-'+obj.id+"l").textContent = obj[prop];
			}else{
				if(obj.showName) document.getElementById(isbg+obj.type+'-'+obj.id).textContent = obj[prop];
				if(obj.icon==-1){
					var btnId = isbg+obj.type+'-'+obj.id;
					var iconElem = document.getElementById(btnId+'icon');
					if(iconElem==undefined){
						iconElem = document.createElement('canvas');
						iconElem.id = btnId+'icon';
						iconElem.width = 32;
						iconElem.height = 32;
						document.getElementById(isbg+obj.type+'-'+obj.id).appendChild(iconElem);
					}
					var rsrc=GetResource(obj.name,"picture");
					loadImageIcon(btnId,rsrc?(rsrc.fileLocal?rsrc.fileLocal:rsrc.file):null,rsrc);
				}
				break;
			}
		}
		break;
	case "left":
		document.getElementById(isbg+obj.type+'-'+obj.id).style.left = obj[prop]+"px";
		setRectFlag = true;
		break;
	case "top":
		document.getElementById(isbg+obj.type+'-'+obj.id).style.top = obj[prop]+"px";
		setRectFlag = true;
		break;
	case "topLeft":
		var elmStyle = document.getElementById(isbg+obj.type+'-'+obj.id).style;
		elmStyle.top = obj.top+"px";
		elmStyle.left = obj.left+"px";
		setRectFlag = true;
		break;
	case "rect":
		var elmStyle = document.getElementById(isbg+obj.type+'-'+obj.id).style;
		elmStyle.top = obj.top+"px";
		elmStyle.left = obj.left+"px";
		elmStyle.width = obj.width+"px";
		elmStyle.height = obj.height+"px";
		setRectFlag = true;
		break;
	case "width":
		document.getElementById(isbg+obj.type+'-'+obj.id).style.width = obj[prop]+"px";
		setRectFlag = true;
		break;
	case "height":
		document.getElementById(isbg+obj.type+'-'+obj.id).style.height = obj[prop]+"px";
		setRectFlag = true;
		break;
	case "icon":
		var btnId = isbg+obj.type+'-'+obj.id;
		var icon = obj[prop];
		var iconElem = document.getElementById(btnId+'icon');
		if(iconElem==undefined){
			iconElem = document.createElement('canvas');
			iconElem.id = btnId+'icon';
			iconElem.width = 32;
			iconElem.height = 32;
			document.getElementById(btnId).appendChild(iconElem);
		}
		if(icon>0){
			var rsrc=GetResourceById(icon,"icon");
			loadImageIcon(btnId,rsrc?(rsrc.fileLocal?rsrc.fileLocal:rsrc.file):null,rsrc);
		}
		else if(icon==-1){
			var rsrc=GetResource(obj.name,"picture");
			loadImageIcon(btnId,rsrc?(rsrc.fileLocal?rsrc.fileLocal:rsrc.file):null,rsrc);
		}
		else{
			iconElem.width = 0;
			iconElem.height = 0;
		}
		break;
	case "visible":
		document.getElementById(isbg+obj.type+'-'+obj.id).style.visibility = obj[prop]?'':'hidden';
		setRectFlag = true;
		break;
	case "style":
		drawGoCard(currentCardObj, currentBgObj);
		return 1;
		break;
	case "titleWidth":
		drawGoCard(currentCardObj, currentBgObj);
		return 1;
		break;
	case "iconScaling":
		drawGoCard(currentCardObj, currentBgObj);
		return 1;
		break;
	case "showName":
		drawGoCard(currentCardObj, currentBgObj);
		return 1;
		break;
	case "opacity":
		document.getElementById(isbg+obj.type+'-'+obj.id).style.opacity = obj[prop];
		break;
	case "vertically":
		document.getElementById(isbg+obj.type+'-'+obj.id).style['-webkit-writing-mode'] = obj[prop]?'vertical-rl':'';
		break;
	case "family":
		break;
	case "autoHilite":
		break;
	case "hilite":
		switch(obj.style){
		case "transparent":
		case "oval":
			if(obj[prop]){
				buttonDef1.hiliteTrans(isbg+obj.type+'-'+obj.id);
			}else{
				buttonDef1.unhiliteTrans(isbg+obj.type+'-'+obj.id);
			}
			break;
		case "opaque":
		case "rectangle":
			if(obj[prop]){
				buttonDef1.hiliteRect(isbg+obj.type+'-'+obj.id);
			}else{
				buttonDef1.unhiliteRect(isbg+obj.type+'-'+obj.id);
			}
			break;
		case "roundrect":
		case "shadow":
			if(obj[prop]){
				buttonDef1.hiliteRRect(isbg+obj.type+'-'+obj.id);
			}else{
				buttonDef1.unhiliteRRect(isbg+obj.type+'-'+obj.id);
			}
			break;
		case "standard":
		case "default":
			if(obj[prop]){
				buttonDef1.hiliteStandard(isbg+obj.type+'-'+obj.id);
			}else{
				buttonDef1.unhiliteStandard(isbg+obj.type+'-'+obj.id);
			}
			break;
		case "radio":
		case "checkbox":
			document.getElementById(isbg+obj.type+'-'+obj.id+"i").checked = obj[prop];
			break;
		}
		break;
	case "text":
		if(obj.type=="field"){
			document.getElementById(isbg+obj.type+'-'+obj.id).innerHTML = (obj[prop]+"").replace(/\n/g,"<br>");
		}
		else if(obj.style=="popup"){
			var text = obj._text.replace(/\n/g,"<br>");
			var retStr = "";
			var textAry = text.split('<br>');
			for(var i=0; i<textAry.length;i++){
				retStr += "<option value=\""+escapeHTML(textAry[i])+"\">"+escapeHTML(textAry[i])+"</option>\n";
			}
			document.getElementById(isbg+obj.type+'-'+obj.id+"i").innerHTML = retStr;
		}
		break;
	case "script":
		break;
	case "sharedHilite":
		break;
	case "textAlign":
		document.getElementById(isbg+obj.type+'-'+obj.id).style['text-align'] = obj[prop];
		break;
	case "textFont":
		document.getElementById(isbg+obj.type+'-'+obj.id).style['font-family'] = obj[prop];
		break;
	case "textHeight":
		document.getElementById(isbg+obj.type+'-'+obj.id).style['line-height'] = obj[prop]+"px";
		break;
	case "textSize":
		document.getElementById(isbg+obj.type+'-'+obj.id).style['font-size'] = obj[prop]+"pt";
		document.getElementById(isbg+obj.type+'-'+obj.id).style['line-height'] = obj[prop]+"px";
		break;
	case "textStyle":
		var textStyle = obj[prop];
		document.getElementById(isbg+obj.type+'-'+obj.id).style['font-weight'] = "";
		document.getElementById(isbg+obj.type+'-'+obj.id).style['font-style'] = "";
		document.getElementById(isbg+obj.type+'-'+obj.id).style['text-decoration'] = "";
		document.getElementById(isbg+obj.type+'-'+obj.id).style['color'] = "";
		document.getElementById(isbg+obj.type+'-'+obj.id).style['text-shadow'] = "";
		document.getElementById(isbg+obj.type+'-'+obj.id).style['letter-spacing'] = "";
		if(textStyle!=0){
			if(textStyle & 0x01){
				document.getElementById(isbg+obj.type+'-'+obj.id).style['font-weight'] = "bold";
			}
			if(textStyle & 0x02){
				document.getElementById(isbg+obj.type+'-'+obj.id).style['font-style'] = "italic";
			}
			if(textStyle & 0x04){
				document.getElementById(isbg+obj.type+'-'+obj.id).style['text-decoration'] = "underline";
			}
			if(textStyle & 0x08){//outline
				document.getElementById(isbg+obj.type+'-'+obj.id).style['color'] = "#fff";
				document.getElementById(isbg+obj.type+'-'+obj.id).style['text-shadow'] = "1px 0px 1px #000,-1px 0px 1px #000,0px 1px 1px #000,0px -1px 1px #000";
			}
			if(textStyle & 0x10){//shadow
				document.getElementById(isbg+obj.type+'-'+obj.id).style['color'] = "#fff";
				document.getElementById(isbg+obj.type+'-'+obj.id).style['text-shadow'] = "1px 1px 2px #000,1px 1px 2px #000";
			}
			if(textStyle & 0x20){
				document.getElementById(isbg+obj.type+'-'+obj.id).style['letter-spacing'] = "-1px";
			}
			if(textStyle & 0x40){
				document.getElementById(isbg+obj.type+'-'+obj.id).style['letter-spacing'] = "1px";
			}
		}
		break;
	case "locktext":
		if(obj.type=="field"){
			document.getElementById(isbg+obj.type+'-'+obj.id).contentEditable = !obj[prop];
		}
		break;
	case "selectedline":
		if(obj.type=="field"){
			document.getElementById(isbg+obj.type+'-'+obj.id).contentEditable = obj[prop];
		}
		else if(obj.type=="button" && obj.style=="popup"){
			document.getElementById(isbg+obj.type+'-'+obj.id).selectedIndex = obj[prop]-1;
		}
		break;
	case "enabled":
		document.getElementById(isbg+obj.type+'-'+obj.id).disabled = !obj[prop];
		break;
	case "showPict":
		if(obj.type=="card") document.getElementById('card-picture').display = obj[prop]?"":"none";
		else document.getElementById('bg-picture').display = obj[prop]?"":"none";
		break;
	}
}

function showSpinAnim(idx){
	if(idx==null && !('createTouch' in document))return;
	var cardBack = document.getElementById((idx!=null)?idx:'cardBack');
	var x = document.createElement('img');
	x.style.position = "absolute";
	x.style.left = ((idx!=null)?window.innerWidth/2:stackData1.width/2)-16+"px";
	x.style.top = ((idx!=null)?window.innerHeight/2:stackData1.height/2)-16+"px";
	x.style.opacity = "0.7";
	x.src = "img/spin.gif";
	x.id = "spin_gif";
	cardBack.appendChild(x);
}

function hideSpinAnim(){
	var x = document.getElementById('spin_gif');
	if(!x)return;
	x.parentNode.removeChild(x);
}
