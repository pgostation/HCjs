"use strict";

//--
//JSON読み込み
function createXMLHttpRequest(cbFunc){
	var XMLhttpObject = null;
	try{
		XMLhttpObject = new XMLHttpRequest();
	}catch(e){
		try{
			XMLhttpObject = new ActiveXObject("Msxml2.XMLHTTP");
		}catch(e){
			try{
				XMLhttpObject = new ActiveXObject("Microsoft.XMLHTTP");
			}catch(e){
				return null;
			}
		}
	}
	if (XMLhttpObject) XMLhttpObject.onreadystatechange = cbFunc;
	return XMLhttpObject;
}

var httpObj;
var httpLocalObj;
function loadStackData(){
	loadJSON(userName,'stack/'+encodeURI(stackName).replace(/\+/g,"%2b").replace(/&/g,"%26")+'/_stack2.json?'+(Math.random()*10000|0));
	loadlocalJSON('data/'+userName+"/"+encodeURI(stackName).replace(/\+/g,"%2b").replace(/&/g,"%26")+'/local.json?'+(Math.random()*10000|0));
}

function loadJSON(user,path){
	if(httpObj && httpObj.abort){
		httpObj.abort();
	}
	httpObj = createXMLHttpRequest(displayData);
	if (httpObj)
	{
		httpObj.loadCount = 0;
		httpObj.open("GET","../getfile?user="+user+"&path="+path,true);
		httpObj.send(null);
	}
}

function loadlocalJSON(path){
	if(httpLocalObj && httpLocalObj.abort){
		httpLocalObj.abort();
	}
	httpLocalObj = createXMLHttpRequest(displayLocalData);
	if (httpLocalObj)
	{
		httpLocalObj.loadCount = 0;
		httpLocalObj.open("GET","../getfile?user="+userId+"&path="+path,true);
		httpLocalObj.send(null);
	}
}

function displayData(){
	if((httpObj.readyState == 4) && (httpObj.status == 404)){
		//スタック変換直後の初期データを読み込む
		if(httpObj.loadCount==0){
			httpObj.loadCount = 1;
			httpObj.open("GET","../getfile?user="+userName+"&path="+'stack/'+(encodeURI(stackName).replace(/\+/g,"%2b").replace(/&/g,"%26"))+'/_stack.json',true);
			httpObj.send(null);
			return;
		}
		else{
			postMessage('stackObject.js: Error: cannot load json data.');
			postMessage({cmd:"answer", msg:(browserLang=="ja")?"データを読み込めませんでした":"Can't Load Stack Data."});
			return;
		}
	}
	else if ((httpObj.readyState == 4) && (httpObj.status == 200))
	{
		stackDataLoaded();
	}
	else if((httpObj.readyState == 4) && (httpObj.status == 403)){
		postMessage({cmd:"ajaxLogin"});
	}
}

var localObj;
function displayLocalData(){
	if ((httpLocalObj.readyState == 4) && (httpLocalObj.status == 200)){
		localObj = parseJSON(httpLocalObj.responseText);
		stackDataLoaded();
	}
	else if ((httpLocalObj.readyState == 4) && (httpLocalObj.status != 200)){
		localObj = {};
		stackDataLoaded();
	}
}

function stackDataLoaded(){
	//両方とも読めたら実施する
	if(!localObj||!httpObj.responseText)return;

	var stackObj = parseJSON(httpObj.responseText);
	convertStackObj(stackObj);
	if(!masterEditMode){
		appendLocalObj(localObj);
	}

	//localStorageのdataのほうが新しければそちらを使う
	if(masterEditMode && stackObj.time && localStorageData && localStorageData.time > stackObj.time.dtime){
		stackData = localStorageData.stackData;
		bgData = localStorageData.bgData;
		cardData = localStorageData.cardData;
		rsrcData = localStorageData.rsrcData;
		xcmdData = localStorageData.xcmdData;
		addcolorData = localStorageData.addcolorData;
	}
	if(!masterEditMode && localObj.time && localStorageData && localStorageData.time > localObj.time.dtime){
		stackData = localStorageData.stackData;
		bgData = localStorageData.bgData;
		cardData = localStorageData.cardData;
		rsrcData = localStorageData.rsrcData;
		xcmdData = localStorageData.xcmdData;
		addcolorData = localStorageData.addcolorData;
	}

	objectSetting();
	ejavascript2exec();

	postMessage({cmd:"stackData1", arg:
	{
		userLevel:stackData.userLevel,
		width:stackData.width,
		height:stackData.height,
		script:stackData.script,
		ejavascript:stackData.ejavascript,
		cantPeek:stackData.cantPeek,
		cantAbort:stackData.cantAbort,
		cantModify:stackData.cantModify,
		cantDelete:stackData.cantDelete,
		createdByVersion:stackData.createdByVersion,
		modifyVersion:stackData.modifyVersion,
		freeSize:0,
		showNavigator:stackData.showNavigator,
		type:"stack",
	}});

	postMessage({cmd:"rsrcData", arg:rsrcData1});//表にrsrcDataを送る
	postMessage({cmd:"xcmdData", arg:xcmdData});//表にxcmdDataを送る
	postMessage({cmd:"addcolorData", arg:addcolorData});//表にaddcolorDataを送る

	//xcmd読み込み
	for(var i in xcmdData){
		if(",shareddata,htmlutil,httpget,browsercheck,kstealkeyx,kstealkeyx2,uxanswer,uxgetinkey,uxback,addcolor,colorizehc,terazza,terazza2,pgcolorx,getmem,qtmovie,getmonitor,setmonitor,".indexOf(","+xcmdData[i].name.toLowerCase()+",")!=-1){
			(function(i){
				setTimeout(function(){
					importScripts("xcmd/"+xcmdData[i].name.toLowerCase()+".js?1");
				},0);
			})(i);
		}
		else{
			postMessage("can't importScripts("+"xcmd/"+xcmdData[i].name.toLowerCase()+".js);");
		}
	}

	innerGoCard(undefined);
	if(workerDB){
		setTimeout(function(){
			setInterval(idle,100);
		},1000);
	}
}

function parseJSON(jsData){
	var data;
	if(JSON!=undefined){data = JSON.parse(jsData);}
	else {data = eval("("+jsData+")");}
	return data;
}

var stackData={};
var cardData=[];
var bgData=[];
var rsrcData1={};
var xcmdData=[];
var addcolorData={};
var forJsonDiffData = {};
var forJsonDiffLocalData = {};
function convertStackObj(stackObj){
	var i=0,j;
	if(stackObj[0]!="stackfile" && httpObj.loadCount != 0/*stackObj.stackjsonver==undefined*/){
		//不明ファイル
		postMessage(httpObj.loadCount);
		postMessage("Unknown json stack format");
		return;
	}
	////if(stackObj.stackjsonver!=undefined /*&& stackObj.stackjsonver=="1.0"*/){
	if(httpObj.loadCount == 0){
		//_stack.json2
		stackData = stackObj.stackData;
		cardData = stackObj.cardData;
		bgData = stackObj.bgData;
		rsrcData1 = stackObj.rsrcData;
		if(rsrcData1==undefined) rsrcData1={};
		xcmdData = stackObj.xcmdData;
		if(xcmdData==undefined) xcmdData=[];
		addcolorData = stackObj.addcolorData;
		if(addcolorData==undefined) addcolorData={};
		//差分保存用
		forJsonDiffData = JSON.parse(JSON.stringify(stackObj));
		return;
	}
	//_stack.json形式(HCからの変換直後の形式)
	for(i in stackObj){
		if(stackObj[i]=="stackfile"){
		}
		else if(stackObj[i][0]=="stack"){
			stackData = stackObj[i][1];
			stackData.script = stackObj[i][3][2];
			stackData.ejavascript = stackObj[i][4][2];
		}
		else if(stackObj[i][0]=="patterns"){
		}
		else if(stackObj[i][0]=="font"){
		}
		else if(stackObj[i][0]=="nextStyleID"){
		}
		else if(stackObj[i][0]=="styleentry"){
		}
		else if(stackObj[i][0]=="background"){
			// lastCardBase = "background";
			var k = bgData.length;
			bgData[k] = stackObj[i][1];
			bgData[k].script = stackObj[i][2][2];
			bgData[k].ejavascript = stackObj[i][3][2];
			bgData[k].parts=[];
			for(j=3;stackObj[i][j]!=undefined;j++){
				if(stackObj[i][j][0]=="part"){
					var m = bgData[k].parts.length;
					bgData[k].parts[m] = stackObj[i][j][1];
					bgData[k].parts[m].script = stackObj[i][j][2][2];
					bgData[k].parts[m].ejavascript = stackObj[i][j][3][2];
				}
				else if(stackObj[i][j][0]=="content"){
					var idx = stackObj[i][j][1].id;
					for(var n=0;n<bgData[k].parts.length;n++){
						if(idx != bgData[k].parts[n].id) continue;
						bgData[k].parts[n].text = stackObj[i][j][2][2].replace(/\n/g,"<br>");
						break;
					}
				}
			}
		}
		else if(stackObj[i][0]=="card"){
			// lastCardBase = "card";
			var k = cardData.length;
			cardData[k] = stackObj[i][1];
			cardData[k].script = stackObj[i][2][2];
			cardData[k].ejavascript = stackObj[i][3][2];
			cardData[k].parts=[];
			cardData[k].bgparts={};
			for(j=3;stackObj[i][j]!=undefined;j++){
				if(stackObj[i][j][0]=="part"){
					var m = cardData[k].parts.length;
					cardData[k].parts[m] = stackObj[i][j][1];
					cardData[k].parts[m].script = stackObj[i][j][2][2];
					cardData[k].parts[m].ejavascript = stackObj[i][j][3][2];
				}
				else if(stackObj[i][j][0]=="content"){
					if(stackObj[i][j][1].layer=="card"){
						var idx = stackObj[i][j][1].id;
						for(var n=0;n<cardData[k].parts.length;n++){
							if(idx != cardData[k].parts[n].id) continue;
							if(!stackObj[i][j][2][2]) continue;
							cardData[k].parts[n].text = stackObj[i][j][2][2].replace(/\n/g,"<br>");
							break;
						}
					}
					else{
						cardData[k].bgparts[stackObj[i][j][1].id]={}; //bgpartsはid指定
						cardData[k].bgparts[stackObj[i][j][1].id].text = (stackObj[i][j][2][2]+"").replace(/\n/g,"<br>");
					}
				}
			}
		}
		else if(stackObj[i][0]=="media"){
			if(rsrcData1[stackObj[i][1].type]==undefined){ rsrcData1[stackObj[i][1].type]={}; }
			rsrcData1[stackObj[i][1].type][parseInt(stackObj[i][1].id)] = stackObj[i][1];
		}
		else if(stackObj[i][0]=="externalcommand"){
			xcmdData[xcmdData.length] = stackObj[i][1];
		}
		else if(stackObj[i][0]=="palette"){
			if(rsrcData1["palette"]==undefined) rsrcData1["palette"] = {};
			rsrcData1["palette"][stackObj[i][1].id] = stackObj[i];
		}
		else if(stackObj[i][0]=="addcolorcard"){
			if(addcolorData.cd==undefined) addcolorData.cd = {};
			addcolorData.cd[stackObj[i][1].id] = stackObj[i];
		}
		else if(stackObj[i][0]=="addcolorbackground"){
			if(addcolorData.bg==undefined) addcolorData.bg = {};
			addcolorData.bg[stackObj[i][1].id] = stackObj[i];
		}
	}
}

function appendLocalObj(localObj){
	if(masterEditMode)return;
	//_stack.json2
	appendObj(stackData,localObj.stackData);
	if(localObj.cardData){
		for(var j=0,i=0; i<localObj.cardData.length; j++,i++){
			var cdata = localObj.cardData[i];
			if(!cdata.id) continue;
			if(getCardNum(cdata.id)==null){
				cardData.splice(j,0,cdata); //挿入
			}
			else if(getCardNum(cdata.id)>j){
				//localObjでカードを削除することはできないのでmasterにカードが追加された？
				j += (getCardNum(cdata.id)-j);
			}
			else if(getCardNum(cdata.id)<j){
				//masterのカードが削除された？
				j--;
				continue;
			}
			appendObj(cardData[j],cdata);
		}
	}
	if(localObj.bgData){
		for(var j=0,i=0; i<localObj.bgData.length; j++,i++){
			var cdata = localObj.bgData[i];
			if(!cdata.id) continue;
			if(getBgNum(cdata.id)==null){
				bgData.splice(j,0,cdata); //挿入
			}
			else if(getBgNum(cdata.id)>j){
				//localObjでbgを削除することはできないのでmasterにbgが追加された？
				j += (getBgNum(cdata.id)-j);
			}
			else if(getBgNum(cdata.id)<j){
				//masterのbgが削除された？
				j--;
				continue;
			}
			appendObj(bgData[j],cdata);
		}
	}
	appendObj(rsrcData1,localObj.rsrcData);
	appendObj(xcmdData,localObj.xcmdData);
	appendObj(addcolorData,localObj.addcolorData);
	//差分保存用
	forJsonDiffLocalData = JSON.parse(JSON.stringify(localObj));
	return;
}

function appendObj(masterD,localD){
	for(var x in localD){
		if(typeof localD[x]=="object"){
			if(!masterD[x]) masterD[x] = {};
			appendObj(masterD[x],localD[x]);
		}else if(typeof localD[x]=="array"){
			if(x=="parts"){
				if(!masterD[x]) masterD[x] = [];
				for(var i=0; i<localD[x].length; i++){
					if(typeof localD[x][i]=="object"){
						var m = masterD[x][i];
						if(m && m.id!=localD[x][i].id){
							m = null;
							for(var j=0; j<masterD[x].length; j++){
								if(masterD[x][j].id == localD[x][i].id){
									m = masterD[x][j];
								}
							}
						}
						if(!m) masterD[x][masterD[x].length] = {};
						appendObj(m,localD[x][i]);
					}else{
						postMessage("appendObj Error1 x:"+x);
					}
				}
			}
			else{
				postMessage("appendObj Error2 x:"+x);
			}
		}else{
			masterD[x] = localD[x];
		}
	}
}

function objectSetting(){
	//type設定
	if(!stackData)stackData={};
	stackData.type="stack";
	//bg
	for(var i=0; i<bgData.length; i++){
		bgData[i].type="background";
	}
	//cd
	for(var i=0; i<cardData.length; i++){
		cardData[i].type="card";
	}

	//何かの拍子にカードが重複登録されてしまう
	var idcheck = {};
	for(var i=0; i<cardData.length; i++){
		if(idcheck[cardData[i].id]!=null){
			delete cardData[i];
			continue;
		}
		idcheck[cardData[i].id]=i;
	}
	for(var i=0; i<cardData.length; i++){
		if(cardData[i]==null||cardData[i].parts==null){
			for(var j=i+1; j<cardData.length; j++){
				cardData[j-1] = cardData[j];
			}
			cardData.length--;
		}
	}

	//parent設定
	for(var i=0; i<bgData.length; i++){
		for(var k=0; k<bgData[i].parts.length; k++){
			bgData[i].parts[k].parent="background";
			bgData[i].parts[k].parentId=bgData[i].id;
		}
	}
	for(var i=0; i<cardData.length; i++){
		for(var k=0; k<cardData[i].parts.length; k++){
			cardData[i].parts[k].parent="card";
			cardData[i].parts[k].parentId=cardData[i].id;
		}
	}

	//property
	hcStackDefine(stackData);

	//bg
	for(var i=0; i<bgData.length; i++){
		hcCardbaseDefine(bgData[i]);
		for(var k=0; k<bgData[i].parts.length; k++){
			hcPartDefine(bgData[i].parts[k]);
		}
	}

	//cd
	for(var i=0; i<cardData.length; i++){
		hcCardbaseDefine(cardData[i]);
		for(var k=0; k<cardData[i].parts.length; k++){
			hcPartDefine(cardData[i].parts[k]); 
		}
	}
}

function ejavascript2exec(){
	//スクリプトを実行できるようにする。

	stackData.exec = execScr(stackData.ejavascript,"script of stack",stackData.script);

	for(var i=0; i<bgData.length; i++){
		bgData[i].exec = execScr(bgData[i].ejavascript,"script of bg "+(bgData[i].name.length>0?"\""+bgData[i].name+"\"":i+1),bgData[i].script);
		for(var k=0; k<bgData[i].parts.length; k++){
			bgData[i].parts[k].exec = execScr(bgData[i].parts[k].ejavascript,"script of bg "+bgData[i].parts[k].type+" "+bgData[i].parts[k].name+" of bg "+(bgData[i].name.length>0?"\""+bgData[i].name+"\"":i+1),bgData[i].parts[k].script);
		}
	}

	for(var i=0; i<cardData.length; i++){
		cardData[i].exec = execScr(cardData[i].ejavascript,"script of cd "+(cardData[i].name.length>0?"\""+cardData[i].name+"\"":i+1),cardData[i].script);
		for(var k=0; k<cardData[i].parts.length; k++){
			cardData[i].parts[k].exec = execScr(cardData[i].parts[k].ejavascript,"script of cd "+cardData[i].parts[k].type+" "+cardData[i].parts[k].name+" of cd "+(cardData[i].name.length>0?"\""+cardData[i].name+"\"":i+1),cardData[i].parts[k].script);
		}
	}

	/*for(var id in rsrcData1['palette']){
		var dat = rsrcData1['palette'][id];
		for(i=2; i<dat.length; i++){
			dat[i].exec = execScr(dat[i].ejavascript,"script of palette id "+id);
		}
	}*/
}

function execScr(scr,info,hypertalk){
	if(scr==undefined) return;
	var execjs = scr.replace(/function (.*)\((.*)\){/g,"},\"$1\":function($2){");
	execjs = execjs.replace(/},(.*):function\((.*)\){/,"$1:function($2){");
	execjs = execjs.replace(/},(.*):function\((.*)\){/g,",$1:function($2){");
	//execjs = execjs.replace(/(^| )([^ \n\.]*)\.set\((.*)\)\.(char|line|item|word) = /g,"variableSet(\"$1\",$2).$3 = ");
	//execjs = execjs.replace(/\nvar ([^;,=]+)(.*);/g,"\nvar $1=\"\";$1$2;");
	//execjs = execjs.replace(/(.*)\.text\.set\((.*)\)\.(char|line|item|word) = /g,"$1.set\($2)._$3 = ");
	var x="";
	if(execjs.lenth>0){postMessage("execScr1:"+execjs);}
	try{
		eval("x = {"+execjs+"\n};");//
	}catch(e){
		postMessage(info+"\n"+e.message+"\n"+"x = {"+execjs+"\n}\n};");
		postMessage("hypertalk:\n"+hypertalk);
	}
	return x;
}

function saveJSON2(alldata,diffdata){
	//元のデータと比べて違っているところだけを送信する
	var objs = [];
	var types = [];
	var nums = [];
	for(var t in alldata){
		if(t=="bgData"||t=="cardData"){
			for(var num=0; num<alldata[t].length; num++){
				if(!diffdata[t]) diffdata[t]={};
				if(JSON.stringify(alldata[t][num])!=JSON.stringify(diffdata[t][num])){
					objs[objs.length] = alldata[t][num];
					types[types.length] = t;
					nums[nums.length] = num;
				}
			}
		}else{
			if(JSON.stringify(alldata[t])!=JSON.stringify(diffdata[t])){
				objs[objs.length] = alldata[t];
				types[types.length] = t;
				nums[nums.length] = "";
			}
		}
	}
	saveJSONAjax(objs,types,nums);
}

function saveJSONAjax(objs,types,nums){
	httpSaveObj = createXMLHttpRequest(saveJsonCallback);
	httpSaveObj.objs = objs;
	httpSaveObj.types = types;
	httpSaveObj.nums = nums;
	httpSaveObj.firstFlag = true;
	saveJSONAjaxRun();
}

var httpSaveObj;
function saveJSONAjaxRun(){
	if (httpSaveObj)
	{
		var length = httpSaveObj.objs.length;
		if(length<=0) {
			//保存完了
			postMessage({cmd:"saveLocalStorage", sdata:null});
			return;
		}
		var obj = httpSaveObj.objs[length-1];
		var type = httpSaveObj.types[length-1];
		var num = httpSaveObj.nums[length-1];
		httpSaveObj.objs.length--;
		httpSaveObj.types.length--;
		httpSaveObj.nums.length--;
		var hd = "../setjson?user="+userId+"&path=data/"+userName+"/"+encodeURI(stackName+"/local.json").replace(/\+/g,"%2b").replace(/&/g,"%26");
		if(masterEditMode==true){
			hd = "../setjson?user="+userName+"&path=stack/"+encodeURI(stackName+"/_stack2.json").replace(/\+/g,"%2b").replace(/&/g,"%26");
		}
		httpSaveObj.open("POST",hd+"&type="+type+"&num="+num+"&remain="+(length-1)+"&first="+httpSaveObj.firstFlag,true);
		httpSaveObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		httpSaveObj.send("text="+encodeURI(JSON.stringify(obj)).replace(/\+/g,"%2b").replace(/&/g,"%26"));
		httpSaveObj.firstFlag = false;
	}
}

function saveJsonCallback(){
	if ((httpSaveObj.readyState == 4) && (httpSaveObj.status == 200)){
		saveJSONAjaxRun();//次のデータを送信する
	}
	else if (httpSaveObj.readyState == 1){
	}else if((httpSaveObj.readyState == 4) && (httpSaveObj.status == 403)){
		postMessage({cmd:"ajaxLoginForChange"});
	}
}

var changedStack;
var lastSaveTime;
var saveStackTimer;
function saveStackData(optStr){
	if(stackData.cantModify){
		if(optStr=="force"){
			answer((browserLang=="ja")?"このスタックは変更不可の設定になっています。":"The setting which can't modify of this stack is true.");
		}
		return;//変更不可なので何もしない
	}
	if(optStr!="force" && lastSaveTime && new Date()-lastSaveTime<60*1000){
		var alldata = {
				"stackjsonver":{version:system.version()},
				"stackData":stackData,
				"bgData":bgData,
				"cardData":cardData,
				"rsrcData":rsrcData1,
				"xcmdData":xcmdData,
				"addcolorData":addcolorData,
				"time":+new Date(),
		};
		postMessage({cmd:"saveLocalStorage", sdata:alldata});
		clearTimeout(saveStackTimer);
		saveStackTimer = setTimeout(saveStackData,61*1000);
		return; //60秒経っていない場合は通信せずlocalStorageに保存
	}
	lastSaveTime = +new Date();
	changedStack = false;
	stackData.modifyVersion = system.version();
	if(masterEditMode){
		var alldata = {
				"stackjsonver":{version:system.version()},
				"stackData":stackData,
				"bgData":bgData,
				"cardData":cardData,
				"rsrcData":rsrcData1,
				"xcmdData":xcmdData,
				"addcolorData":addcolorData,
				"time":{dtime:+new Date()},
		};
		saveJSON2(alldata,forJsonDiffData);
	}else{
		stackData.modifyVersion = system.version();
		var cardList = [];
		for(var i=0; i<cardData.length; i++){
			cardList[cardList.length] = cardData[i].id;
		}
		var bgList = [];
		for(var i=0; i<bgData.length; i++){
			bgList[bgList.length] = bgData[i].id;
		}
		var localAllData = {
				"stackData":stackData,
				"bgData":bgData,
				"cardData":cardData,
				"rsrcData":rsrcData1,
				"xcmdData":xcmdData,
				"time":{dtime:+new Date()},
		};
		var localAllData2 = makeLocalData(localAllData,forJsonDiffData);
		localAllData2.list = {cardList:cardList, bgList:bgList};
		saveJSON2(localAllData2,forJsonDiffLocalData);
	}
}

function makeLocalData(allData, diffData){
	//元のデータと違う部分だけをローカルデータとして返す
	var newData = {};
	for(var x in allData){
		if(x=="cardData"||x=="bgData"){
			newData[x] = [];
			var cddataAry = allData[x];
			for(var i=0; i<cddataAry.length; i++){
				var cddata = cddataAry[i];
				if(cddata.id<0){
					newData[x][i] = cddata;
				}else{
					var diffCdData = getDiffCardData(diffData[x],cddata.id);
					newData[x][i] = difData(cddata, diffCdData);
					newData[x][i].id = cddata.id;//idだけは残す
				}
			}
		}else{
			newData[x] = {};
			var cdata = allData[x];
			for(var i in cdata){
				var data = cdata[i];
				var diffObjData = diffData[x][i];
				if(typeof data == "object"){
					var d = difData(data, diffObjData);
					if(d!=null){
						newData[x][i] = d;
					}
				}else{
					if(diffObjData!=data){
						newData[x][i] = data;
					}
				}
			}
		}
	}
	return newData;
}

function getDiffCardData(diffDatax, id){
	for(var i=0; i<diffDatax.length; i++){
		if(diffDatax[i].id == id){
			return diffDatax[i];
		}
	}
}

function difData(localData, masterData){
	var newData = {};
	var flag = false;
	for(var i in localData){
		if(i=="exec")continue;
		var data = localData[i];
		var diffObjData = masterData?masterData[i]:null;
		if(typeof data == "object"){
			var d = difData(data, diffObjData);
			if(d!=null){
				newData[i] = d;
				flag = true;
			}
		}else if(typeof data == "array"){
			newData[i] = [];
			for(var j=0; j<data[j].length; j++){
				var d = difData(data[j], diffObjData[j]);
				if(d!=null){
					newData[i][j] = d;
					flag = true;
				}
			}
		}else{
			if(diffObjData!=data){
				newData[i] = data;
				flag = true;
			}
		}
	}
	if(!flag) return null;
	return newData;
}

//--


function hcButton(basecardObj){
	var btn = {"autoHilite":false,"enabled":true,"family":"0","height":"23","hilite":false,"icon":"0","id":newBtnId(basecardObj),"left":"0","name":"","showName":false,"style":"transparent","textAlign":"center","textFontID":"0","textHeight":"16","textSize":"12","textStyle":"0","titleWidth":"0","top":"0","type":"button","visible":true,"width":"96","script":"","ejavascript":"","iconScaling":false,"parent":basecardObj.type};
	if(basecardObj.type=='background'){
		btn.sharedHilite = true;
	}
	return btn;
}

function hcField(basecardObj){
	var fld = {"lockText":false,"height":"64","id":newBtnId(basecardObj),"left":"0","name":"","style":"transparent","textAlign":"left","textFontID":"0","textHeight":"16","textSize":"12","textStyle":"0","top":"0","type":"field","visible":true,"width":"64","script":"","ejavascript":"","parent":basecardObj.type};
	if(basecardObj.type=='background'){
		fld.sharedText = true;
	}
	return fld;
}

function hcNewCard(baseBg){
	var cd = {"background":baseBg,"bitmap":"","cantDelete":false,"dontSearch":false,"id":newCardId(),"marked":false,"name":"","showPict":true,"type":"card","script":"","ejavascript":"","parts":[],"bgparts":{}};
	return cd;
}

function hcNewBackground(baseBg){
	var bg = {"bitmap":"","dontSearch":false,"id":newBgId(),"name":"","showPict":true,"type":"background","script":"","ejavascript":"","parts":[]};
	return bg;
}

function newBtnId(basecardObj){
	if(masterEditMode) var i=1;
	else i=50000; //ユーザが追加したら50000から
	Label1:
		for(; i<99999; i++){
			for(var pid in basecardObj.parts){
				if(+basecardObj.parts[pid].id==i){
					continue Label1;
				}
			}
			break;
		}
	return i;
}

function newCardId(){
	Label1:
		for(var j=1; j<1000; j++){
			var i = Math.floor(Math.random()*32768+1);
			if(!masterEditMode) i *= -1; //ユーザが追加したら負のid
			for(var pid in cardData){
				if(+cardData[pid].id===i){
					continue Label1;
				}
			}
			return i+"";
		}
return 0;
}

function newBgId(){
	Label1:
		for(var j=1; j<1000; j++){
			var i = Math.floor(Math.random()*32767+1);
			if(!masterEditMode) i *= -1; //ユーザが追加したら負のid
			for(var pid in bgData){
				if(+bgData[pid].id===i){
					continue Label1;
				}
			}
			return i+"";
		}
return 0;
}

var getmonitor;//bug patch H10
