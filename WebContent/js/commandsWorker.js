"use strict";

//var nowExecObjType;
//var nowExecObjId;
var it = "";
//var theResult = "";


//a
function answer(msg,str1,str2,str3){
	if(!msg) msg="";
	msg+="";
	extractQueue();//先にキューを空にしておく
	postMessage({cmd:"answer", msg:msg, str1:str1, str2:str2, str3:str3});
	while(true){
		var ret = extractQueue("answer");
		if(ret!=undefined){
			break;
		}
		if(vmStopFlag)break;
	}
}

function answerWith(msg,str1,str2,str3){
	answer(msg,str1,str2,str3);
}

function answerFile(msg,filetype){
	if(!msg) msg="";
	msg+="";
	extractQueue();//先にキューを空にしておく
	postMessage({cmd:"answerFile", msg:msg, filetype:filetype});
	while(true){
		var ret = extractQueue("answerFile");
		if(ret!=undefined){
			break;
		}
		if(vmStopFlag)break;
	}
}

function ask(msg,defStr){
	if(!msg) msg="";
	msg+="";
	postMessage({cmd:"ask", msg:msg, str:defStr});
	while(true){
		var ret = extractQueue("ask");
		if(ret!=undefined){
			break;
		}
		if(vmStopFlag)break;
	}
}

function askFile(msg,defStr){
	if(!msg) msg="";
	msg+="";
	postMessage({cmd:"askFile", msg:msg, str:defStr});
	while(true){
		var ret = extractQueue("ask");
		if(ret!=undefined){
			break;
		}
		if(vmStopFlag)break;
	}
}

function askPassword(msg,defStr){
	if(!msg) msg="";
	msg+="";
	postMessage({cmd:"askPassword", msg:msg, str:defStr});
	while(true){
		var ret = extractQueue("ask");
		if(ret!=undefined){
			break;
		}
		if(vmStopFlag)break;
	}
}

function askWith(msg,defStr){
	ask(msg,defStr);
}

function arrowkey(direction){
	if(direction.toLowerCase()=="left"){
		wexecMenu("prev");
	}
	else if(direction.toLowerCase()=="right"){
		wexecMenu("next");
	}
	else if(direction.toLowerCase()=="up"){
		wexecMenu("back");
	}
	else if(direction.toLowerCase()=="down"){
		wexecMenu("forward");
	}
}

//b
function beep(){
	postMessage({cmd:"beep"});
}

//c
function callFunc(msg){
	var args = new Array();
	for(var i=1;i<arguments.length;i++){
		args[i-1] = arguments[i];
	}
	var obj = me;
	while(!obj.exec || !obj.exec[msg]){
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
			break;
		default:
			return;
		}
		if(!obj) return;
	}
	return vmExec(obj, msg, args);
}

function chooseTool(toolName){
	var toolLower = "";
	if(typeof toolName == 'number'){
		switch(toolName){
		case 1: toolLower = "browse"; break;
		case 2: toolLower = "button"; break;
		case 3: toolLower = "field"; break;
		case 4: toolLower = "select"; break;
		case 5: toolLower = "lasso"; break;
		case 6: toolLower = "pencil"; break;
		case 7: toolLower = "brush"; break;
		case 8: toolLower = "eraser"; break;
		case 9: toolLower = "line"; break;
		case 10: toolLower = "spray"; break;
		case 11: toolLower = "rect"; break;
		case 12: toolLower = "round rect"; break;
		case 13: toolLower = "bucket"; break;
		case 14: toolLower = "oval"; break;
		case 15: toolLower = "curve"; break;
		case 16: toolLower = "text"; break;
		case 17: toolLower = "reg poly"; break;
		case 18: toolLower = "poly"; break;
		default: toolLower = "";
		}
	}
	else{
		toolLower = toolName.toLowerCase();
	}
	changeTool(toolLower);
	system.selectedTool = toolLower;
}

function clickAt(x,y){
	if(y==null){
		if(x.x){
			y = x.y;
			x = x.x;
		}
		else{
			var a = (x+"").split(",");
			x = a[0];
			y = a[1];
		}
	}
	postMessage({cmd:"click", x:x, y:y});
}

function closeFile(filename){
	system._result = "";
	delete HTtextfiles[filename];
}

function convertTo(value, format, format2){
	var nativeDate;
	//まずvalueをDate形式にする
	if((value+"").match(/^[0-9]+$/)){
		//1904年1月1日からの経過秒を1970年1月1日午前0時からの経過ミリ秒にする
		{
			var v = value;
			v = v*1000 + Date.parse("1904/1/1")-Date.parse("1970/1/1");
		}
		nativeDate = new Date(v);
		postMessage(typeof nativeDate);
	}
	else{
		nativeDate = new Date(value);
		if(nativeDate=="Invalid Date") nativeDate=null;
	}
	if(!nativeDate){
		var reg = /^([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+).*/;
		var res = reg.exec(value);
		if(res){
			//年月日時分秒
			nativeDate = new Date(res[1],res[2]-1,res[3],res[4],res[5],res[6]);
		}
	}
	if(!nativeDate){
		reg = /^([0-9]+)年([0-9]+)月([0-9]+)日(.*)/;
		res = reg.exec(value);
		if(res){
			var sec = getTimeSec(res[4]);
			nativeDate = new Date(res[1],res[2]-1,res[3],0,0,sec);
		}
	}
	if(!nativeDate){
		reg = /^([0-9]+)\.([0-9]+)\.([0-9]+)(.*)/;
		res = reg.exec(value);
		if(res){
			if(res[1]>80) var year = 1900+parseInt(res[1],10);
			else year = 2000+parseInt(res[1],10);
			var sec = getTimeSec(res[4]);
			nativeDate = new Date(year,res[2]-1,res[3],0,0,sec);
		}
	}

	//postMessage(nativeDate);

	//指定formatの形式にする
	if(format=="seconds"){
		it = (nativeDate-(Date.parse("1904/1/1")-Date.parse("1970/1/1")))/1000;
	}
	else if(format=="dateitems"){
		it = nativeDate.getFullYear()+","+
		(nativeDate.getMonth()+1)+","+
		nativeDate.getDate()+","+
		nativeDate.getHours()+","+
		nativeDate.getMinutes()+","+
		nativeDate.getSeconds()+","+
		nativeDate.getDay();
	}
	else if(format=="long date" || format=="abbreviated date"){
		if(browserLang=="ja"){
			var dayOfWeeks = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
			it = nativeDate.getFullYear()+"年"+(nativeDate.getMonth()+1)+"月"+nativeDate.getDate()+"日"+
			dayOfWeeks[nativeDate.getDay()];
		}else{
			//var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
			var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var dayOfWeeks = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			it = dayOfWeeks[nativeDate.getDay()]+", "+months[nativeDate.getMonth()]+" "+nativeDate.getDate()+". "+nativeDate.getFullYear();
		}
	}
	else if(format=="short date"){
		it = nativeDate.getFullYear()+"."+(nativeDate.getMonth()+1)+"."+nativeDate.getDate();
	}
	else{
		it = nativeDate;
		system._result = "Error: Invalid format:"+format;
	}

	var hours = nativeDate.getHours();
	var minutes = nativeDate.getMinutes();
	var seconds = nativeDate.getSeconds();
	var ampm = "AM";
	if(hours>=12){
		hours -=12;
		ampm = "PM";
	}
	if(minutes<10) minutes="0"+minutes;
	if(seconds<10) seconds="0"+seconds;

	if(format2=="long time"){
		it += " "+hours+":"+minutes+":"+seconds+" "+ampm;
	}
	else if(format2=="short time"||format2=="abbreviated time"){
		it += " "+hours+":"+minutes+" "+ampm;
	}
}

function getTimeSec(value){
	//long time AM/PMあり
	var reg = /.* ([0-9]+).([0-9]+).([0-9]+) *(AM|PM)/;
	var res = reg.exec(value);
	if(res){
		postMessage(res[4]);
		return (res[4]=="PM"?12*3600:0) + 3600*res[1] + 60*res[2] + parseInt(res[3],10);
	}

	//short time AM/PMあり
	var reg = /.* ([0-9]+).([0-9]+) *(AM|PM)/;
	var res = reg.exec(value);
	if(res){
		return (res[3]=="PM"?12*3600:0) + 3600*res[1] + 60*res[2];
	}

	//long time AM/PMなし
	reg = /.* ([0-9]+).([0-9]+).([0-9]+)/;
	res = reg.exec(value);
	if(res){
		return 3600*res[1] + 60*res[2] + parseInt(res[3],10);
	}

	//short time AM/PMなし
	var reg = /.* ([0-9]+).([0-9]+)/;
	var res = reg.exec(value);
	if(res){
		return 3600*res[1] + 60*res[2];
	}

	return 0;
}

function convertToAnd(value, format, format2){
	convertTo(value, format, format2);
}

function createMenu(menu){
	postMessage({cmd:"createMenu", menu:menu});
}

//d
function debugSound(v){
	postMessage({cmd:"debug", opt:"sound", value:v});
}

function debugPurequickdraw(){
}

function debugMaxmem(){
}

function debugMaxwindows(){
}

function debugHintbits(){
}

function debugCheckpoint(){
}


function deleteMenu(menu){
	postMessage({cmd:"deleteMenu", menu:menu});
}

function delete_(obj){
	if(obj.type=="button" || obj.type=="field"){
		var baseData = (obj.parent=="card")?cardById(obj.parentId):getBgData(obj.parentId);
		if(obj.parent=="card"&&obj.parentId==currentCardObj.id) baseData = currentCardObj;
		var i = baseData.parts.indexOf(obj);
		if(!baseData.cantModify){
			if(i!=undefined){
				baseData.parts.splice(i,1);//削除
				changedStack=true;
				saveStackData();
				innerGoCard(currentCardObj);
				waitGo();
			}
		}
	}
}

function disable(obj){
	obj.enabled = false;
}

function disableMenu(menu){
	postMessage({cmd:"disableMenu", menu:menu});
}

function disableMenuitemOfMenu(menuitem,menu){
	postMessage({cmd:"disableMenuitem", menu:menu, menuitem:menuitem});
}

function domenu(menu){
	if(!wexecMenu(menu)){
		postMessage({cmd:"doMenu", menu:menu});
	}
}

function waitGo(){
	var last = +new Date();
	while(+new Date()<=last+10*1000/60){
		var retx = extractQueue("go");
		if(retx){
			break;
		}
		if(vmStopFlag)break;
	}
}

function doscriptAsApplescript(v){
}

//e
function editScriptOf(obj){
	postMessage({cmd:"editScript", obj:obj});
}

function enable(obj){
	obj.enabled = true;
}

function enableMenu(menu){
	postMessage({cmd:"enableMenu", menu:menu});
}

function enableMenuitemOfMenu(menuitem,menu){
	postMessage({cmd:"enableMenuitem", menu:menu, menuitem:menuitem});
}

//f
/*
function findText(str){
	postMessage({cmd:"find", opt:"text", string:str});	
}

function findChars(str){
	postMessage({cmd:"find", opt:"chars", string:str});	
}

function findWord(str){
	postMessage({cmd:"find", opt:"word", string:str});	
}

function findWhole(str){
	postMessage({cmd:"find", opt:"whole", string:str});	
}*/

function findString(str){
	system._result = "";
	var cardData2 = operaCloneObj(cardData);
	var bgData2 = operaCloneObj(bgData);
	postMessage({cmd:"find", opt:"string", string:str, fld:null, cds:cardData2, bgs:bgData2});
	while(true){
		var ret = extractQueue("find");
		if(ret!=undefined){
			break;
		}
	}
}

function flash(x){
	if(!x) x=3;
	for(var i=0;i<x;i++){
		postMessage({cmd:"flash"});
		wait(15);
	}
}

//g
function go(cardObj){
	system._result = "";
	extractQueue();//強制停止のため
	if(cardObj==null || cardObj==undefined){
		system._result = "Card is not found.";
		return;
	}
	var time = 0;
	if(system.visual[0]!=undefined){
		time = system.visual[0].time;
	}
	if(cardObj.hasOwnProperty("background")){ //card
		innerGoCard(cardObj);
	}
	if(time>0){
		wait(time*60);
	}
	{
		//wait(0.5);
		//postMessage("extractQueue go");
		var last = +new Date();
		while(+new Date()<=last+10*1000/60){
			var retx = extractQueue("go");
			if(retx){
				//postMessage("extractQueue retx ok");
				break;
			}
			//postMessage("extractQueue retx"+retx);
			if(vmStopFlag)break;
		}
	}
}

//h
function hide(obj){
	obj.visible = false;
}

//i
function initVar(v){
	if(!v) return "";
	return v;
}


//l
function lockMessages(){
	system.lockMessages = true;
}

function lockRecent(){
	system.lockRecent = true;
}

function lockScreen(){
	system.lockScreen = true;
}

//m
function mark(cd){
	cd.marked = true;
}
function markAllCards(){
	for(var i=0; i<cardData.length; i++){
		cardData[i].marked = true;
	}
}

//o
var HTtextfiles = [];
function openFile(filename){
	system._result = "";
	HTtextfiles[filename] = {cnt:0};
	var status = htCommandSend("openfile", filename, null, null, userName, stackName);
	if(status!=200){
		system._result = "Error: openFile status("+status+")";
		return;
	}
}

//同期通信ajaxでコマンドをサーバに投げる
var HThttpObj={};
function htCommandSend(cmd, opt, opt2, opt3, user, path){
	if(HThttpObj && HThttpObj.abort){
		HThttpObj.abort();
	}
	HThttpObj = createXMLHttpRequest(null);
	if (HThttpObj)
	{
		HThttpObj.loadCount = 0;
		HThttpObj.open("GET","../HTCommand?cmd="+encodeURI(cmd)+"&opt="+encodeURI(opt)+"&opt2="+encodeURI(opt2)+"&opt3="+encodeURI(opt3)+"&user="+user+"&name="+encodeURI(path).replace(/\+/g,"%2b").replace(/&/g,"%26"),false);
		HThttpObj.send(null);
		if(HThttpObj.status == 200){
			return HThttpObj.status;
		}
		else{
			return HThttpObj.status;
		}
	}
	return -1;
}

//p
function paletteCmd(name, point){
	var plteData = rsrcData1["palette"];
	for(var id in plteData){
		if(plteData[id][1].name == name) break;
	}
	if(plteData[id][1].name != name){
		system._result = "Error: Palette data is not found.";
		return;
	}
	var plteDataStr = operaCloneObj(plteData[id]);
	postMessage({cmd:"palette", opt:plteDataStr, point:point});
	system._windows.push({name:name,visible:null,loc:null});
}

function picture(fileName, fileType, windowStyle, visible, depth){
	system._result = "";
	postMessage({cmd:"picture", opt:fileName, fileType:fileType, windowStyle:windowStyle, visible:visible});
	system._windows.push({name:fileName,visible:visible,loc:null});
}

function play(str){
	var strAry = str.split(" ");
	system.playingSound = strAry[0].toLowerCase();
	postMessage({cmd:"play", opt:str});
}

function playStop(){
	postMessage({cmd:"play", opt:"stop "+system.playingSound});
}

function popCd(){
	popCard();
}
function popCard(){
	if(pushCardAry.length>0){
		innerGoCard(cardById(pushCardAry[pushCardAry.length-1]));
		waitGo();
		delete pushCardAry[pushCardAry.length-1];
	}
}

var pushCardAry = [];
function pushCd(){
	pushCard();
}
function pushCard(){
	pushCardAry[pushCardAry.length] = currentCardObj.id;
}

//r
function readFromFileUntil(filename, char){
	system._result = "";
	if(HTtextfiles[filename]==null){
		system._result = "Error: file is not open";
		return;
	}
	var status = htCommandSend("readfile", filename, null, null, userName, stackName);
	if(status!=200){
		system._result = "Error: readFromFileUntil status("+status+")";
	}else{
		var text = HThttpObj.responseText;
		text = text.substring(HTtextfiles[filename].cnt);
		if(char!="eof" && text.indexOf(char)!=-1){
			text = text.substring(0,text.indexOf(char));
		}
		it = text;
		HTtextfiles[filename].cnt += text.length;
	}
}

function resetMenubar(){
	postMessage({cmd:"resetMenubar"});
}

function resetPaint(){

}

//s
function sendTo(msg,obj){
	var strAry = msg.split(" ");
	var args = ["","","","","","","",""];
	if(strAry.length>1){
		msg = strAry[0];
		for(var i=1;i<strAry.length;i++){
			args[i-1] = strAry[i];
		}
	}

	sendCommand(obj,msg.toLowerCase(),args);
}

function show(obj){
	obj.visible = true;
}
function showAt(obj,loc){
	obj.loc = loc;
	obj.visible = true;
}

function showCards(x){
	if(x=="all") x = cardData.length;
	else if(typeof x!="number") return;

	var cardnum = getCardNum(currentCardObj.id);
	for(var i=cardnum; i<=cardnum+x; i++){
		innerGoCard(card(i%cardData.length+1), true, true);
		wait(5);
	}
}

function select(v){
	postMessage(v.substring(v.indexOf("card field id ")+14));
	var obj = null;
	if(v.indexOf("card field ")!=-1){
		obj = cdFldById(v.substring(v.indexOf("card field id ")+14));
	}
	var line = word(v,2);
	postMessage({cmd:"selectLine", obj:obj, line:line});
	while(true){
		var ret = extractQueue("system");
		if(ret!=undefined){
			break;
		}
	}
	wait(3);
}

function selectLine(obj, line){
	postMessage({cmd:"selectLine", obj:obj, line:line});
	while(true){
		var ret = extractQueue("system");
		if(ret!=undefined){
			break;
		}
	}
	wait(2);
}

function send(msg){
	sendCommand(me,msg);
}

function sendTo(msg,obj){
	sendCommand(obj,msg);
}

function sort(obj,a,b,c){
	var splitStr = "\n";
	if(a=="lines" || a=="items"){
		if(a=="items")splitStr=",";
	}else{
		c=b;b=a;
	}

	var isAscending = true;
	if(b=="descending" || b=="ascending"){
		if(b=="descending")isAscending=false;
	}else{
		c=b;
	}

	var oldValue = obj;
	if(obj.text)oldValue = obj.text.replace(/\<[\/]*span[^\>]*\>/g,"").split("<br>").join("\n");

	var newValue = "";
	var valAry = oldValue.split(splitStr);
	{
		for(var i=0;i<valAry.length-1;i++){
			for(var k=i+1;k<valAry.length;k++){
				if((valAry[i]>valAry[k]) == isAscending){
					var v = valAry[i];
					valAry[i] = valAry[k];
					valAry[k] = v;
				}
			}
		}
		for(var i=0;i<valAry.length;i++){
			newValue += valAry[i];
			if(i+1<valAry.length) newValue += splitStr;
		}
	}

	if(obj.text){
		obj.text = newValue.replace(/\n/g,"\n");
	}

	return newValue;
}

function sortBy(x,expression){
	postMessage("sortBy unsupported");
}

//u
function unmark(cd){
	cd.marked = false;
}
function unmarkAllCards(){
	for(var i=0; i<cardData.length; i++){
		cardData[i].marked = false;
	}
}

function unlockMessages(){
	system.lockMessages = false;
}

function unlockRecent(){
	system.lockRecent = false;
}

function unlockScreen(){
	system.lockScreen = false;
}

function unlockScreenWith(vis){
	extractQueue();//強制停止のため
	system.visual.length = 0;
	visualEffect(vis);
	system.lockScreen = false;
	var time = 0;
	if(system.visual[0]) time = system.visual[0].time;

	wait(time*60+5);
}


//v

function visualEffect(effect){
	var visObj = {};

	if(effect.match(/dissolve.*/i)){ visObj.mode = "dissolve";}
	else if(effect.match(/push.*/i)){ visObj.mode = "push";}
	else if(effect.match(/wipe.*/i)){ visObj.mode = "wipe";}
	else if(effect.match(/scroll.*/i)){ visObj.mode = "scroll";}
	else if(effect.match(/iris.*/i)){ visObj.mode = "iris";}
	else if(effect.match(/zoom.*/i)){ visObj.mode = "zoom";}
	else if(effect.match(/stretch from.*/i)){ visObj.mode = "stretch";}
	else if(effect.match(/shrink to.*/i)){ visObj.mode = "shrink";}
	else if(effect.match(/barn door.*/i)){ visObj.mode = "barn door";}
	else if(effect.match(/venetian blinds.*/i)){ visObj.mode = "venetian blinds";}
	else if(effect.match(/checkerboard.*/i)){ visObj.mode = "checkerboard";}
	else if(effect.match(/fade.*/i)){ visObj.mode = "fade";}
	else { return;}

	if(effect.match(/.* up.*/i)){ visObj.dir = "up";}
	else if(effect.match(/.* down.*/i)){ visObj.dir = "down";}
	else if(effect.match(/.* left.*/i)){ visObj.dir = "left";}
	else if(effect.match(/.* right.*/i)){ visObj.dir = "right";}
	else if(effect.match(/.* open.*/i)){ visObj.dir = "open";}
	else if(effect.match(/.* in.*/i)){ visObj.dir = "open";}
	else if(effect.match(/.* close.*/i)){ visObj.dir = "close";}
	else if(effect.match(/.* out.*/i)){ visObj.dir = "close";}
	else if(effect.match(/.* center.*/i)){ visObj.dir = "center";}
	else if(effect.match(/.* top.*/i)){ visObj.dir = "top";}
	else if(effect.match(/.* bottom.*/i)){ visObj.dir = "bottom";}

	if(effect.match(/.* very fast.*/i)){ visObj.time = 0.125;}
	else if(effect.match(/.* fast.*/i)){ visObj.time = 0.25;}
	else if(effect.match(/.* very slow.*/i)){ visObj.time = 2.0;}
	else if(effect.match(/.* slow.*/i)){ visObj.time = 1.0;}
	else { visObj.time = 0.5;}

	if(effect.match(/.* to black.*/i)){ visObj.to = "black";}
	if(effect.match(/.* to white.*/i)){ visObj.to = "white";}
	if(effect.match(/.* to gray.*/i)){ visObj.to = "gray";}

	system.visual[system.visual.length] = visObj;
}

//w
function wait(x){
	if(x>=30){
		//postMessage("wait "+x);
	}
	extractQueue();//強制停止のため
	//setTimeout(function(){/*vmFlagClear();*/},x*1000/60);
	//vmStopFlag = true;
	var last = +new Date();
	while(+new Date()<=last+x*1000/60){
		if(vmStopFlag)break;
	}
}
function waitTick(x){
	wait(x);
}
function waitTicks(x){
	wait(x);
}
function waitSecond(x){
	wait(1000/60*x);
}
function waitSeconds(x){
	wait(1000/60*x);
}

function writeToFile(text, filename){
	if(HTtextfiles[filename]==null){
		system._result = "Error: file is not open";
		return;
	}
	htCommandSend("writefile", filename, HTtextfiles[filename].offset, text, userName, stackName);
	HTtextfiles[filename].offset = -1;
}
