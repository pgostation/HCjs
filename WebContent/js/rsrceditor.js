"use strict";

function openRsrcEditor(title, iconTargetBtnId){
	document.getElementById('cardBack').parentNode.style.display = 'none';

	changeRsrc();//保存(undo用)
	rsrcEditorIconSelectId = iconTargetBtnId;
	//titleList構築
	{
		var rsrcTitleListElm = document.getElementById("rsrcTitleList");
		//消去
		for(var i=rsrcTitleListElm.childNodes.length-1; i>=0; i--){
			rsrcTitleListElm.removeChild(rsrcTitleListElm.childNodes[i]);
		}

		if(!rsrcData.sound) rsrcData.sound = {};	
		if(!rsrcData.icon) rsrcData.icon = {};	
		if(!rsrcData.picture) rsrcData.picture = {};
		if(!rsrcData.external) rsrcData.external = [];

		var btn = document.createElement('button');
		(function(x){
			btn.onclick = function(){
				var type = prompt(alertTranslate("Input Resource Type"));
				if(type){
					if(type.length!=4){
						alert(alertTranslate("Resource Type should be 4 characters."));
						return;	
					}
					rsrcData[type] = {};
					openRsrcEditor(type);
				}
			};
		})(x);
		btn.textContent = alertTranslate("Add Type");
		rsrcTitleListElm.appendChild(btn);
		//リソースにあるものを追加
		for(var x in rsrcData){
			if(iconTargetBtnId && x!='icon') continue;
			if(",ics4,ICN#,icl4,ics8,ics#,".indexOf(","+x+",")!=-1)continue;

			var btn = document.createElement('button');
			btn.style.width = "100%";
			(function(x){
				btn.onclick = function(){selectRsrcTitle(x);};
			})(x);
			btn.textContent = x;
			btn.id = 'rsrcTitle-'+x;
			rsrcTitleListElm.appendChild(btn);
		}
	}

	//表示
	document.getElementById('resourceEditor').style.display = "";
	document.getElementById("rsrcListCenterDiv").style.display = "";
	document.getElementById("ref_menu1").style.display = "";
	document.getElementById("ref_menu2").style.display = "none";
	document.getElementById("colorPalette").style.zIndex = "202";


	if(iconTargetBtnId){
		document.getElementById('ref_btn_close').style.display = "none";
		document.getElementById('ref_btn_select').style.display = "";
		document.getElementById('ref_btn_none').style.display = "";
	}else{
		document.getElementById('ref_btn_close').style.display = "";
		document.getElementById('ref_btn_select').style.display = "none";
		document.getElementById('ref_btn_none').style.display = "none";
	}

	setTimeout(function(){
		$("#rsrcTitleList button").button();
		selectRsrcTitle(title);
	}, 0);

	saveSelectTool = selectedTool;
	changeTool("browse");
	paint.elem = "rsrcBack";
	paint.picElem = "rsrcCanv";
	changeTool("pencil");
	//mmsgSyncProperty("system","selectedTool",""); //idleを停止する
	touchInitClear();
}

var saveSelectTool;
function rsrcEditorClose(){
	mmsgSendSystemEvent("save");
	changeTool("browse");
	paint.elem = "cardBack";
	paint.picElem = "picture";
	changeTool(saveSelectTool);
	//mmsgSyncProperty("system","selectedTool",selectedTool); 
	touchInit();

	document.getElementById('resourceEditor').style.display = "none";
	document.getElementById("colorPalette").style.zIndex = "102";

	paint.width = stackData1.width;
	paint.height = stackData1.height;
	paint.zwidth = stackData1.width;
	paint.zheight = stackData1.height;

	document.getElementById('cardBack').parentNode.style.display = '';
}

var rsrcEditorIconSelectId;
function rsrcEditorIconSelect(optStr){
	if(!rsrcEditorIconSelectId) return;
	var data = getBtnData(rsrcEditorIconSelectId);
	if(optStr=="none"){
		data.icon = 0;
	}
	else {
		data.icon = selectedRsrcItemId;
	}
	changeObject2(data,"icon");
}

function selectRsrcTitle(title){
	if(!title){
		title = document.getElementById("rsrcListCenter").rsrcTitle;
	}
	else{
		document.getElementById("rsrcListCenter").rsrcTitle = title;
	}
	$("#rsrcTitleList button").removeClass('ui-state-active-ever');
	$("#rsrcTitleList button[id='rsrcTitle-"+title+"']").addClass('ui-state-active-ever');

	document.getElementById("ref_btn_close").style.display = "";

	$("#ref_btn0").button({disabled: false});
	
	if(",icon,picture,icl8,cicn,ppat,cursor,font,".indexOf(","+title+",")!=-1){
		createRsrcListPicture(title);
	}else if(title=="external"){
		createRsrcListXCMD(title);
	}else{
		createRsrcListText(title);
	}

	/*console.log(typeof rsrcData[title]);
	if(title!="external" && (typeof rsrcData[title] == "object")){
		console.log(rsrcData[title]);
		var saved = rsrcData[title];
		rsrcData[title] = {};
		for(var i in saved){
		//for(var i=0; i<saved.length; i++){
			if(saved[i] && saved[i].id){
				rsrcData[title][i] = saved[i];
			}
		}
	}*/

	document.getElementById('rsrcListCenterDiv').style.display = "";
	document.getElementById('rsrcListLeftDiv').style.display = "none";
	document.getElementById('rsrcMain').style.display = "none";
	document.getElementById("ref_menu1").style.display = "";
	document.getElementById("ref_menu2").style.display = "none";
}

function createRsrcListPicture(title){
	//rsrcListCenter構築
	{
		var rsrcListLeftElm = document.getElementById("rsrcListLeft");
		var rsrcListCenterElm = document.getElementById("rsrcListCenter");
		//消去
		for(var i=rsrcListLeftElm.childNodes.length-1; i>=0; i--){
			rsrcListLeftElm.removeChild(rsrcListLeftElm.childNodes[i]);
		}
		for(var i=rsrcListCenterElm.childNodes.length-1; i>=0; i--){
			rsrcListCenterElm.removeChild(rsrcListCenterElm.childNodes[i]);
		}
		rsrcListCenterElm.rsrcTitle = title;
		rsrcListCenterElm.lineCount = null;

		var left=0;
		var top=48;
		var count = 0;
		var xlist = [];
		for(var x in rsrcData[title]){
			xlist[xlist.length] = x;
		}
		xlist.sort(function(a,b) {return a-b;});

		//Center
		for(var i=0; i<xlist.length; i++){
			var x = xlist[i];

			var btn = document.createElement('button');
			btn.style.position = "absolute";
			btn.style.width = "96px";
			btn.style.height = "96px";
			btn.style.left = left+"px";
			btn.style.top = top+"px";
			(function(x){
				btn.onclick = function(e){selectRsrcItem(title,x,e,this);};
			})(x);
			var imgElm = document.createElement('img');
			imgElm.height = 72;
			imgElm.width = 72;
			btn.rsrcId = x;
			btn.appendChild(imgElm);
			btn.appendChild(document.createElement('br'));
			if(rsrcData[title] && rsrcData[title][x] && rsrcData[title][x].name && rsrcData[title][x].name!=""){
				btn.appendChild(document.createTextNode(rsrcData[title][x].name));
			}else{
				btn.appendChild(document.createTextNode(x));
			}
			rsrcListCenterElm.appendChild(btn);

			left += 100;
			if(left+100>600){
				if(!rsrcListCenterElm.lineCount) rsrcListCenterElm.lineCount = count+1;
				left=0;
				top += 100;
				rsrcListCenterElm.appendChild(document.createElement('br'));
			}

			count++;
		}

		//Left
		rsrcListLeftElm.innerHTML ="";
		for(var i=0; i<xlist.length; i++){
			var x = xlist[i];

			var btn = document.createElement('button');
			btn.id = "rsrcList-"+x;
			btn.style.width = "100%";
			(function(x){
				btn.onclick = function(e){rsrcItemEditOpen(x);};
			})(x);
			if(rsrcData[title] && rsrcData[title][x] && rsrcData[title][x].name && rsrcData[title][x].name!=""){
				btn.appendChild(document.createTextNode(rsrcData[title][x].name));
			}else{
				btn.appendChild(document.createTextNode(x));
			}
			rsrcListLeftElm.appendChild(btn);

			//mouseOverでrsrcThumb更新
			(function(x){
				btn.onmouseover = function(){
					var rsrc = rsrcData[title][x];
					var imgPath = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.file);
					if(rsrc.fileLocal!=null){
						imgPath = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.fileLocal);
					}
					var rsrcThumbElm = document.getElementById("rsrcThumb");
					rsrcThumbElm.imgsrc = imgPath;
					var elm = rsrcThumbElm.childNodes[0];
					elm.onload = function(){
						elm.style.padding = "0px";
						rsrcImgOnLoad(elm,150,158);
					};
					elm.src = imgPath;
				};
			})(x);
		}
	}
	setTimeout(function(){
		$("#rsrcListCenter button").button();
		$("#rsrcListLeft button").button();
		$("#rsrcListCenter").selectable();
		$("#rsrcListCenter button span").css("padding","0px 12px 0px 12px");
		$("#rsrcListCenter button span").css("line-height","16px");
		setTimeout(rsrcListCenterScroll,0);
	}, 0);

	//rsrcThumb構築
	{
		var rsrcThumbElm = document.getElementById("rsrcThumb");
		//消去
		for(var i=rsrcThumbElm.childNodes.length-1; i>=0; i--){
			rsrcThumbElm.removeChild(rsrcThumbElm.childNodes[i]);
		}
		var textElm = document.createTextNode("Item count:"+count);
		rsrcThumbElm.appendChild(textElm);
		textElm = document.createElement("br");
		rsrcThumbElm.appendChild(textElm);
		textElm = document.createElement("br");
		rsrcThumbElm.appendChild(textElm);
		textElm = document.createElement("span");
		textElm.id = "Thumb_id";
		rsrcThumbElm.appendChild(textElm);
	}
	document.getElementById("rsrcThumb").onmouseover = null;
}

function createRsrcListXCMD(title){
	//rsrcListCenter構築
	{
		var rsrcListLeftElm = document.getElementById("rsrcListLeft");
		var rsrcListCenterElm = document.getElementById("rsrcListCenter");
		//消去
		for(var i=rsrcListLeftElm.childNodes.length-1; i>=0; i--){
			rsrcListLeftElm.removeChild(rsrcListLeftElm.childNodes[i]);
		}
		//消去
		for(var i=rsrcListCenterElm.childNodes.length-1; i>=0; i--){
			rsrcListCenterElm.removeChild(rsrcListCenterElm.childNodes[i]);
		}
		rsrcListCenterElm.rsrcTitle = title;
		rsrcListCenterElm.lineCount = null;

		var btnWidth = 150;

		var left=0;
		var top=48;
		var count = 0;
		var xlist = getXCMDList();
		xlist.sort();

		var isContain = function(x){
			for(var i=0; i<xcmdData.length; i++){
				if(xcmdData[i].name.toLowerCase() == x.toLowerCase())return true;
			}
			return false;
		};
		var isSupport = function(x){
			for(var i=0; i<xlist.length; i++){
				if(xlist[i].toLowerCase() == x.toLowerCase())return true;
			}
			return false;
		};

		for(var i=0; i<xlist.length; i++){
			var x = xlist[i];

			var div = document.createElement('div');
			div.style.position = "absolute";
			div.style.left = left+"px";
			div.style.top = top+"px";
			div.style.width = btnWidth+"px";
			div.style.height = "32px";
			rsrcListCenterElm.appendChild(div);

			var btn = document.createElement('input');
			btn.type = "checkbox";
			btn.checked = isContain(x);
			btn.id = "xcmd-"+i;
			(function(i){
				btn.onchange = function(){
					if(document.getElementById("xcmd-"+i).checked){
						xcmdData[xcmdData.length] = {name:xlist[i]};
					}
					else{
						for(var j=0; j<xcmdData.length; j++){
							if(xcmdData[j].name.toLowerCase() == xlist[i].toLowerCase()){
								xcmdData[j] = xcmdData[xcmdData.length-1];
								xcmdData.length--;
							}
						}
					}
					scWorker.postMessage({event:"changeXCMD",content:JSON.stringify(xcmdData)});
				};
			})(i);
			div.appendChild(btn);

			var label = document.createElement('label');
			label.textContent = x;
			label.style.color = "#ffffff";
			label.style.fontFamily = "sans-serif";
			label.style.fontWeight = "bold";
			label.htmlFor = "xcmd-"+i;
			div.appendChild(label);

			left += btnWidth;
			if(left+btnWidth>600){
				if(!rsrcListCenterElm.lineCount) rsrcListCenterElm.lineCount = count+1;
				left=0;
				top += 32;
				rsrcListCenterElm.appendChild(document.createElement('br'));
			}

			count++;
			btn=null;
			label=null;
			div=null;
		}

		for(var i=0; i<xcmdData.length; i++){
			if(isSupport(xcmdData[i].name)) continue;

			var div = document.createElement('div');
			div.style.position = "absolute";
			div.style.left = left+"px";
			div.style.top = top+"px";
			div.style.width = btnWidth+"px";
			div.style.height = "32px";
			div.textContent = xcmdData[i].name;
			div.style.color = "#bbbbbb";
			div.style.fontFamily = "sans-serif";
			div.style.fontWeight = "bold";
			rsrcListCenterElm.appendChild(div);

			left += btnWidth;
			if(left+btnWidth>600){
				if(!rsrcListCenterElm.lineCount) rsrcListCenterElm.lineCount = count+1;
				left=0;
				top += 32;
				rsrcListCenterElm.appendChild(document.createElement('br'));
			}

			div=null;
		}

		div = document.createElement('div');
		div.style.color = "#ffcccc";
		div.style.position = "absolute";
		div.style.top = top+32+"px";
		div.style.fontWeight = "bold";
		div.textContent = alertTranslate("To use new extenal, to Reload/Reopen this stack.");
		rsrcListCenterElm.appendChild(div);
		div=null;
	}

	//rsrcThumb構築
	{
		var rsrcThumbElm = document.getElementById("rsrcThumb");
		//消去
		for(var i=rsrcThumbElm.childNodes.length-1; i>=0; i--){
			rsrcThumbElm.removeChild(rsrcThumbElm.childNodes[i]);
		}
		var textElm = document.createTextNode("Item count:"+count);
		rsrcThumbElm.appendChild(textElm);
		rsrcThumbElm.onmouseover = null;
		rsrcThumbElm=null;
	}
	
	//メニューdisable
	$("#ref_btn0").button({disabled: true});

	rsrcListLeftElm=null;
	rsrcListCenterElm=null;
}

function createRsrcListText(title){
	//rsrcListCenter構築
	{
		var rsrcListLeftElm = document.getElementById("rsrcListLeft");
		var rsrcListCenterElm = document.getElementById("rsrcListCenter");
		//消去
		for(var i=rsrcListLeftElm.childNodes.length-1; i>=0; i--){
			rsrcListLeftElm.removeChild(rsrcListLeftElm.childNodes[i]);
		}
		//消去
		for(var i=rsrcListCenterElm.childNodes.length-1; i>=0; i--){
			rsrcListCenterElm.removeChild(rsrcListCenterElm.childNodes[i]);
		}
		rsrcListCenterElm.rsrcTitle = title;
		rsrcListCenterElm.lineCount = null;

		var btnWidth = 96;
		if(title=="sound"){
			btnWidth = 256;
		}

		var left=0;
		var count = 0;
		var xlist = [];
		for(var x in rsrcData[title]){
			xlist[xlist.length] = x;
		}
		xlist.sort(function(a,b) {return a-b;});
		for(var i=0; i<xlist.length; i++){
			var x = xlist[i];

			var btn = document.createElement('button');
			btn.style.width = btnWidth+"px";
			btn.style.height = "96px";
			(function(x){
				btn.onclick = function(e){selectRsrcItem(title,x,e,this);};
			})(x);
			btn.rsrcId = x;
			if(title=="sound"){
				var rsrc = rsrcData[title][x];
				var sndPath = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.file);
				if(rsrc.fileLocal!=null){
					sndPath = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.fileLocal);
				}
				sndPath = sndPath.replace(/.aiff$/,".wav");
				var audioElm = document.createElement('audio');
				audioElm.controls = true;
				audioElm.src = sndPath;
				btn.appendChild(audioElm);
				btn.appendChild(document.createElement('br'));
				audioElm=null;
			}
			btn.appendChild(document.createTextNode("id:"+x));
			btn.appendChild(document.createElement('br'));
			if(rsrcData[title][x].name && rsrcData[title][x].name!=""){
				btn.appendChild(document.createTextNode(rsrcData[title][x].name));
			}
			rsrcListCenterElm.appendChild(btn);

			left += btnWidth;
			if(left+btnWidth>600){
				if(!rsrcListCenterElm.lineCount) rsrcListCenterElm.lineCount = count+1;
				left=0;
				rsrcListCenterElm.appendChild(document.createElement('br'));
			}

			count++;
			btn=null;
		}
	}

	//Left
	rsrcListLeftElm.innerHTML ="";
	for(var i=0; i<xlist.length; i++){
		var x = xlist[i];

		var btn = document.createElement('button');
		btn.id = "rsrcList-"+x;
		btn.style.width = "100%";
		(function(x){
			btn.onclick = function(e){rsrcItemEditOpen(x);};
		})(x);
		if(rsrcData[title][x].name && rsrcData[title][x].name!=""){
			btn.appendChild(document.createTextNode(rsrcData[title][x].name));
		}else{
			btn.appendChild(document.createTextNode(x));
		}
		rsrcListLeftElm.appendChild(btn);
	}

	setTimeout(function(){
		$("#rsrcListCenter button").button();
		$("#rsrcListLeft button").button();
	}, 0);

	//rsrcThumb構築
	{
		var rsrcThumbElm = document.getElementById("rsrcThumb");
		//消去
		for(var i=rsrcThumbElm.childNodes.length-1; i>=0; i--){
			rsrcThumbElm.removeChild(rsrcThumbElm.childNodes[i]);
		}
		var textElm = document.createTextNode("Item count:"+count);
		rsrcThumbElm.appendChild(textElm);
		rsrcThumbElm.onmouseover = null;
		rsrcThumbElm=null;
	}

	rsrcListLeftElm=null;
	rsrcListCenterElm=null;
}

function rsrcListCenterScroll(){
	//表示されているリストの分の画像を読み込む
	var rsrcListCenterElm = document.getElementById("rsrcListCenter");
	var title = rsrcListCenterElm.rsrcTitle;

	var list = rsrcListCenterElm.getElementsByTagName("img");
	var scroll = rsrcListCenterElm.parentNode.scrollTop;
	for(var i in list){
		var imgElm = list[i];
		var btn = imgElm.parentNode;
		if(!btn)continue;
		if(!btn.rsrcId) btn = btn.parentNode;
		if(btn.offsetTop-scroll>=0 && btn.offsetTop-scroll<=window.innerHeight){
			if(!imgElm.src){
				var rsrc = rsrcData[title][btn.rsrcId];
				if(!rsrc)return;
				imgElm.onload = function(){rsrcImgOnLoad(this,72,72);};
				imgElm.onerror = function(e){
					/*ajaxLoginOpen((browserLang=="ja")?"ログイン":"Log in", function(status){
						$('#loginDialog').dialog('close');
						createRsrcListPicture(title);
					});*/
				};
				imgElm.src = "getthumbnail?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.file);
				if(rsrc.fileLocal!=null){
					imgElm.src = "getthumbnail?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.fileLocal);
				}
			}
		}
	}
	rsrcListCenterElm=null;
	list=null;
}

function rsrcImgOnLoad(elm,Mw,Mh){
	var rate = 1;
	if(elm.naturalWidth>Mw){
		rate = Mw/elm.naturalWidth;
	}
	if(elm.naturalHeight>Mh && Mh/elm.naturalHeight<rate){
		rate = Mh/elm.naturalHeight;
	}
	if(rate<1){
		elm.width = elm.naturalWidth*rate;
		elm.height = elm.naturalHeight*rate;
	}else{
		elm.width=elm.naturalWidth;
		elm.height=elm.naturalHeight;
	}
	if(elm.width<Mw){
		elm.style.paddingLeft = (Mw-elm.width)/2+"px";
		elm.style.paddingRight = (Mw-elm.width)/2+"px";
	}
	if(elm.height<Mh){
		elm.style.paddingTop = (Mh-elm.height)/2+"px";
		elm.style.paddingBottom = (Mh-elm.height)/2+"px";
	}
}

var selectedRsrcItemId;
var rsrcDialogTimer;
function selectRsrcItem(title,rsrcId,event,elm){
	var xtop = elm.offsetTop;
	var rsrcListCenterDiv = document.getElementById("rsrcListCenterDiv");
	var scrTop = rsrcListCenterDiv.scrollTop;
	if(scrTop>xtop || scrTop+rsrcListCenterDiv.offsetHeight-48<xtop){
		rsrcListCenterDiv.scrollTop = Math.max(1,xtop-300);
	}

	if(rsrcEditorIconSelectId){
		//ICON選択
		selectedRsrcItemId = rsrcId;
		$("#rsrcListCenter button").removeClass("ui-selected");
		elm.className += " ui-selected";
	}
	else if(event.shiftKey&&selectedRsrcItemId){
		//ここまで選択
		var rsrcListCenterElm = document.getElementById("rsrcListCenter");
		for(var i=0; i<rsrcListCenterElm.childNodes.length; i++){
			var elm2 = rsrcListCenterElm.childNodes[i];

			if(((elm2.rsrcId>selectedRsrcItemId) == (rsrcId>selectedRsrcItemId)) &&
					((rsrcId>elm2.rsrcId) == (rsrcId>selectedRsrcItemId)))
			{
				if(elm2&&elm2.className&&elm2.className.indexOf("ui-selected")==-1){
					elm2.className += " ui-selected";
				}
			}
		}
		selectedRsrcItemId = rsrcId;
	}
	else if(event.altKey){
		//(ドラッグで)複製
		elm.style.cursor = "copy";
	}
	else if(event.metaKey||event.ctrlKey){
		//選択追加/解除
		selectedRsrcItemId = rsrcId;
		if(elm.className.indexOf("ui-selected")!=-1){
			elm.className = elm.className.substring(0,elm.className.indexOf("ui-selected"));
			if(selectedRsrcItemId == rsrcId){
				selectedRsrcItemId = null;
			}
		}else{
			elm.className += " ui-selected";
			selectedRsrcItemId = rsrcId;
		}
	}
	else if(selectedRsrcItemId == rsrcId && rsrcDialogTimer){
		//ダブルクリック
		clearTimeout(rsrcDialogTimer);
		rsrcDialogTimer = null;
		$("#rsrcItemDialog").dialog('close');
		rsrcItemEditOpen();
	}
	else{
		//選択
		selectedRsrcItemId = rsrcId;
		$("#rsrcListCenter button").removeClass("ui-selected");
		elm.className += " ui-selected";

		var rsrc = rsrcData[title][rsrcId];
		if(rsrc){
			document.getElementById('rsrcItemName').value = rsrc.name;
		}
		document.getElementById('rsrcItemId').value = rsrcId;
		var info = "";
		if(rsrc && rsrc.file) info += "File:"+rsrc.file+"\n";

		document.getElementById('rsrcItemInfo').textContent = info;

		rsrcDialogTimer = setTimeout(function(){
			rsrcDialogTimer = null;
		},500);

		if(document.getElementById("Thumb_id")){
			document.getElementById("Thumb_id").textContent = "selected ID:"+selectedRsrcItemId;
		}
	}
}

function selectRsrcItemArrow(dir,e){
	var rsrcListCenter = document.getElementById("rsrcListCenter");
	var lineCount = rsrcListCenter.lineCount;
	var btns = rsrcListCenter.getElementsByTagName("button");
	if(selectedRsrcItemId){
		for(var i=0; i<btns.length; i++){
			if(btns[i].rsrcId==selectedRsrcItemId){
				switch(dir){
				case "left":
					if(btns[i-1]){
						btns[i-1].onclick(e);
					}
					break;
				case "right":
					if(btns[i+1]){
						btns[i+1].onclick(e);
					}
					break;
				case "up":
					if(lineCount && i-lineCount>=0){
						btns[i-lineCount].onclick(e);
					}
					break;
				case "down":
					if(lineCount && btns[i+lineCount]){
						btns[i+lineCount].onclick(e);
					}
					break;
				}
				return;
			}
		}
	}

	{
		if(dir=="right"||dir=="down"){
			btns[0].onclick(e);
		}
		if(dir=="left"||dir=="up"){
			btns[btns.length-1].onclick(e);
		}
	}
}

function rsrcInfoChange(){
	var title = document.getElementById("rsrcListCenter").rsrcTitle;
	var id = selectedRsrcItemId;
	var r = rsrcData[title][id];

	//エラーチェック
	var newid = document.getElementById('rsrcItemId').value;
	if(newid=="" || newid!=parseInt(newid) || newid<-32768 || newid>=32768){
		alert((browserLang=="ja")?"IDが不正です":"Illegal ID.");
		return;
	}
	if(newid!=id && rsrcData[title][newid]){
		alert((browserLang=="ja")?"そのIDは使用されています":"Duplicate ID.");
		return;
	}

	//新しいidに移動
	r.name = document.getElementById('rsrcItemName').value;
	rsrcData[title][newid] = r;
	if(newid!=id)delete rsrcData[title][id];

	selectRsrcTitle(title);
	changeRsrc();//保存
}

function newRsrcFile(file){
	var rsrcListCenterElm = document.getElementById("rsrcListCenter");
	var title = rsrcListCenterElm.rsrcTitle;

	var id = 1000;
	while(rsrcData[title][id]){
		id++;
	}

	rsrcData[title][id] = {type:title, id:id, name:file.name, file:file.name};
	selectRsrcTitle(title);
	changeRsrc();//保存

	var btns = rsrcListCenterElm.getElementsByTagName("button");
	for(var i=0; i<btns.length; i++){
		if(btns[i].rsrcId==id){
			btns[i].onclick({});
		}
	}
}

function newRsrcItem(){
	var title = document.getElementById("rsrcListCenter").rsrcTitle;

	var ext = ".txt";
	if(",icon,picture,icl8,cicn,ppat,cursor,font,".indexOf(","+title+",")!=-1){
		ext = ".png";
	}
	else if(title=="sound"){
		ext = ".wav";
	}

	var id = 1001;
	while(rsrcData[title][id]){
		id++;
	}
	rsrcData[title][id] = {type:title, id:id, name:"", file:title.toUpperCase()+"_"+id+ext};

	selectRsrcTitle(title);
	changeRsrc();//保存

	rsrcItemEditOpen(id);
	if(",icon,picture,icl8,cicn,ppat,cursor,font,".indexOf(","+title+",")!=-1){
		$('#rsrcImageSizeDialog').dialog('open');
	}
}

function getSelectedRsrcItems(){
	var res = [];
	var rsrcListCenterElm = document.getElementById("rsrcListCenter");
	for(var i in rsrcListCenterElm.childNodes){
		var elm2 = rsrcListCenterElm.childNodes[i];

		if(elm2.className && elm2.className.indexOf("ui-selected")!=-1){
			res[res.length] = elm2.rsrcId;
		}
	}
	return res;
}

function cutRsrcItem(copyOpt){
	var title = document.getElementById("rsrcListCenter").rsrcTitle;
	var resList = getSelectedRsrcItems();
	if(resList.length==0)return;

	//XHRでコピー
	var alertflag=false;
	var count=0;
	for(var i=0; i<resList.length; i++){
		var rsrc = rsrcData[title][resList[i]];
		var ext = "";
		var li = rsrc.file.lastIndexOf(".");
		if(li!=-1){
			ext = rsrc.file.substring(li);
		}
		var srcFile = rsrc.file;
		var dstFile = title.toUpperCase()+"_"+resList[i]+"-"+parseInt(Math.random()*9999)+ext;
		rsrc.file = dstFile;
		delete rsrc.cache;
		var request = new XMLHttpRequest();
		var url = "copyrsrc";
		var data = "user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+
		"&rsrctitle="+title+
		"&rsrcjson="+JSON.stringify(rsrc)+
		"&srcfile="+encodeURI(srcFile).replace(/\+/g,"%2b").replace(/&/g,"%26")+
		"&dstfile="+encodeURI(dstFile).replace(/\+/g,"%2b").replace(/&/g,"%26");
		if(i==0){
			data += "&clear=true";
		}
		rsrc.file = srcFile;

		request.open('POST', url, false);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send(data);
		(function(request,i){
			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200) {
					if(copyOpt!="copy"){
						//コピーできたら削除
						delete rsrcData[title][resList[i]];
						selectRsrcTitle(title);
					}
					count++;
					if(count==resList.length){
						//すべて成功
						document.getElementById("rsrcListCenter").style.background = "#abf";
						setTimeout(function(){
							document.getElementById("rsrcListCenter").style.background = "";
						},50);
						changeRsrc();//保存
					}
					request.abort();
				}
				else if (request.readyState == 4 && request.status != 200) {
					//失敗
					if(!alertflag){
						alert(alertTranslate("Resource item operation failure.")+" HTTPstatus:"+request.status);
						alertflag = true;
					}
					request.abort();
				}
			};
		})(request,i);
	}
}

function copyRsrcItem(){
	cutRsrcItem("copy");
}

function pasteRsrcItem(){
	var title = document.getElementById("rsrcListCenter").rsrcTitle;
	//XHRで読み込む
	var url = "pastersrc?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26");
	var request = new XMLHttpRequest();
	request.open('GET', url, false);

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			var data = (request.response+"").split("\n");
			for(var i=0; i<data.length; i++){
				if(data[i].length==0)continue;
				var rsrc = JSON.parse(data[i]);
				while(rsrcData[title][rsrc.id]){
					rsrc.id++; 
				}
				rsrcData[title][rsrc.id] = rsrc;
			}
			selectRsrcTitle(title);
			changeRsrc();//保存
			request.abort();
		}
		else if (request.readyState == 4 && request.status != 200) {
			//失敗
			alert(alertTranslate("Resource item operation failure.")+" HTTPstatus:"+request.status);
			request.abort();
		}
		rsrc=null;
	};
}

function deleteRsrcItem(){
	var title = document.getElementById("rsrcListCenter").rsrcTitle;
	var resList = getSelectedRsrcItems();
	if(resList.length==0)return;

	for(var i=0; i<resList.length; i++){
		//削除
		delete rsrcData[title][resList[i]];
	}
	selectRsrcTitle(title);
	changeRsrc();//保存
}

function rsrcItemEditOpen(rsrcId){
	var title = document.getElementById("rsrcListCenter").rsrcTitle;

	document.getElementById("ref_btn_close").style.display = "none";

	if(!rsrcId){
		rsrcId = selectedRsrcItemId;
		document.getElementById("rsrcListLeft").scrollTop = 0;
		setTimeout(function(){
			var xtop = document.getElementById("rsrcList-"+rsrcId).offsetTop;
			document.getElementById("rsrcListLeft").scrollTop = Math.max(1,xtop-300);//なぜか0ではスクロールしない場合がある
		},0);
	}else{
		selectedRsrcItemId = rsrcId;
	}

	//選択IDを反転
	$("#rsrcListLeft button").removeClass('ui-state-active-ever');
	$("#rsrcListLeft button[id='rsrcList-"+rsrcId+"']").addClass('ui-state-active-ever');

	if(",icon,picture,icl8,cicn,ppat,cursor,font,".indexOf(","+title+",")!=-1){
		var rsrc = rsrcData[title][rsrcId];
		if(rsrc.file.lastIndexOf(".")!=-1){
			var ext = rsrc.file.substring(rsrc.file.lastIndexOf(".")).toLowerCase();
			if(ext!=".png"){
				if(!confirm(alertTranslate("File type is not PNG. Do you edit this image?"))){
					return;
				}
			}
		}
		rsrcItemEditOpenPicture(title,rsrcId);
	}else if(title=="sound"){
		rsrcItemEditOpenAudio(title,rsrcId);
	}

	//表示
	document.getElementById('rsrcListCenterDiv').style.display = "none";
	document.getElementById('rsrcListLeftDiv').style.display = "";
	document.getElementById('rsrcMain').style.display = "";
	document.getElementById("ref_menu1").style.display = "none";
	document.getElementById("ref_menu2").style.display = "";
}

function rsrcItemEditOpenPicture(title,rsrcId){
	var rsrc = rsrcData[title][rsrcId];
	var imgPath = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.file);
	if(rsrc.fileLocal!=null){
		imgPath = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.fileLocal);
	}
	var img = new Image();
	img.onload = function(){
		//
		//main
		var ctx = canvElm.getContext('2d');
		canvElm.width = img.width;
		canvElm.height = img.height;
		ctx.drawImage(img, 0, 0, canvElm.width, canvElm.height);

		paint.scale = 16.0;
		while(paint.scale>=2 && (img.width*paint.scale>rsrcMainElm.offsetWidth || img.height*paint.scale>rsrcMainElm.offsetHeight-48)){
			paint.scale /= 2;
		}

		var width = img.width*paint.scale;
		var height = img.height*paint.scale;
		paint.width = img.width;
		paint.height = img.height;
		paint.zwidth = width;
		paint.zheight = height;
		if(rsrcMainElm.offsetWidth-2 < width) width = rsrcMainElm.offsetWidth-2;
		if(rsrcMainElm.offsetHeight-48-2 < height) height = rsrcMainElm.offsetHeight-48-2;
		var left = rsrcMainElm.offsetWidth/2 - width/2;
		var top = (rsrcMainElm.offsetHeight-48)/2 - height/2;
		divElm.style.left = left+"px";
		divElm.style.top = top+"px";
		divElm.style.width = width+"px";
		divElm.style.height = height+"px";

		changeZoom();
		changeTool(selectedTool);
		img = null;
	};
	img.onerror = function(e){
		if(document.getElementById('rsrcImageSizeDialog').style.display=="none"){
			alert(alertTranslate("Can't load this image.")+" HTTPstatus:"+request.status);
		}
		img = null;
	};
	img.src = imgPath;

	//rsrcMain構築
	{
		var rsrcMainElm = document.getElementById("rsrcMain");
		rsrcMainElm.style.padding = "0px 0px 48px 0px";
		//消去
		for(var i=rsrcMainElm.childNodes.length-1; i>=0; i--){
			rsrcMainElm.removeChild(rsrcMainElm.childNodes[i]);
		}

		var divElm = document.createElement("div");
		divElm.id = "rsrcBack";
		divElm.style.position = "absolute";
		divElm.style.left = "0px";
		divElm.style.top = "0px";
		rsrcMainElm.appendChild(divElm);
		var canvElm = document.createElement("canvas");
		canvElm.id = "rsrcCanv";
		divElm.appendChild(canvElm);
		rsrcMainElm.style["-webkit-user-select"]="none";
		rsrcMainElm.onselectstart=function(){return false;};
	}

	//rsrcThumb構築
	var thumbFunc = function(){
		var rsrcThumbElm = document.getElementById("rsrcThumb");
		if(imgPath==rsrcThumbElm.imgsrc){
			return;
		}
		rsrcThumbElm.imgsrc = imgPath;
		//消去
		for(var i=rsrcThumbElm.childNodes.length-1; i>=0; i--){
			rsrcThumbElm.removeChild(rsrcThumbElm.childNodes[i]);
		}
		var thumbImgElm = document.createElement("img");
		thumbImgElm.src = imgPath;
		thumbImgElm.onload = function(){
			rsrcThumbElm.style.padding = "0px";
			rsrcImgOnLoad(thumbImgElm,150,158);
		};
		thumbImgElm.onclick = function(){
			this.style.background = ["#000","#666","#aaa","#fff"][parseInt(Math.random()*4)];
		};
		rsrcThumbElm.appendChild(thumbImgElm);
	};
	thumbFunc();
	document.getElementById("rsrcThumb").onmouseover = thumbFunc;

	rsrc=null;
}

function rsrcImageSizeDialogOpened(){
	var title = document.getElementById("rsrcListCenter").rsrcTitle;
	var rsrcId = selectedRsrcItemId;
	var rsrc = rsrcData[title][rsrcId];

	var imgPath = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file;
	if(rsrc.fileLocal!=null){
		imgPath = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.fileLocal);
	}
	var img = new Image();
	document.getElementById("rsrcImageWidth").value = "";
	document.getElementById("rsrcImageHeight").value = "";
	img.onload = function(){
		document.getElementById("rsrcImageWidth").value = img.width;
		document.getElementById("rsrcImageHeight").value = img.height;
		img = null;
	};
	img.onerror = function(){
		document.getElementById("rsrcImageWidth").value = "32";
		document.getElementById("rsrcImageHeight").value = "32";
		img = null;
	};
	img.src = imgPath;
	rsrc=null;
}

function rsrcImageSizeChange(){
	var w = document.getElementById("rsrcImageWidth").value;
	var h = document.getElementById("rsrcImageHeight").value;
	//XHRで画像サイズ変更
	var title = document.getElementById("rsrcListCenter").rsrcTitle;
	var rsrcId = selectedRsrcItemId;
	var rsrc = rsrcData[title][rsrcId];
	var imgPath = "stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file;
	if(rsrc.fileLocal!=null){
		imgPath = "data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.fileLocal);
	}
	var url = "rsrcimgsize?user="+userParameter+"&path="+imgPath+
	"&rsrcType="+title+"&rsrcId="+rsrcId+"&width="+w+"&height="+h;
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			rsrcItemEditOpen(rsrcId);
		}
		else if (request.readyState == 4 && request.status != 200) {
			//失敗
			alert(alertTranslate("Change image size failure.")+" HTTPstatus:"+request.status);
		}
	};
	request.open('GET', url, false);
	request.send(null);

	$('#rsrcImageSizeDialog').dialog('close');
	rsrc=null;
}

var rsrcEditAudioData;
function rsrcItemEditOpenAudio(title,rsrcId){
	var ctx = gAudioContext;
	if(!ctx) return;

	var rsrc = rsrcData[title][rsrcId];
	var audioPath = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.file);
	if(rsrc.fileLocal!=null){
		audioPath = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(rsrc.fileLocal);
	}

	//XHRで読み込む
	var request = new XMLHttpRequest();
	request.open('GET', audioPath, true);
	request.responseType = 'arraybuffer';
	request.send();

	request.onload = function(){
		ctx.decodeAudioData(request.response, function(buffer){
			rsrcEditAudioData = buffer;
			rsrcEditAudioView();
		},function(){
			console.log("can't decode audio data");
		});
		request.abort();
	};

	//rsrcMain構築
	{
		var rsrcMainElm = document.getElementById("rsrcMain");
		rsrcMainElm.style.padding = "0px 0px 48px 0px";
		//消去
		for(var i=rsrcMainElm.childNodes.length-1; i>=0; i--){
			rsrcMainElm.removeChild(rsrcMainElm.childNodes[i]);
		}

		//canvas作成
		var canvElm = document.createElement("canvas");
		canvElm.id = "rsrcCanv";
		canvElm.width = rsrcMainElm.offsetWidth;
		canvElm.height = 256;
		canvElm.style.background = "#fff";
		rsrcMainElm.appendChild(canvElm);
		var divElm = document.createElement("div");
		divElm.id = "audioLine";
		divElm.style.position = "absolute";
		divElm.style.top = "0px";
		divElm.style.height = "256px";
		divElm.style.border = "1px solid #0c0";
		rsrcMainElm.appendChild(divElm);
		/*//周波数canvas作成
		var canvElm2 = document.createElement("canvas");
		canvElm2.id = "rsrcCanv2";
		canvElm2.width = rsrcMainElm.offsetWidth;
		canvElm2.height = 256;
		canvElm2.style.background = "#fff";
		rsrcMainElm.appendChild(canvElm2);*/
	}

	//rsrcThumb構築
	{
		var rsrcThumbElm = document.getElementById("rsrcThumb");
		//消去
		for(var i=rsrcThumbElm.childNodes.length-1; i>=0; i--){
			rsrcThumbElm.removeChild(rsrcThumbElm.childNodes[i]);
		}
	}
}

function rsrcEditAudioView(){
	var ctx = gAudioContext;
	var buffer = rsrcEditAudioData;

	//波形表示
	{
		var canvElm = document.getElementById("rsrcCanv");
		/*var audioLength = */audioView(buffer, canvElm);
	}

	//再生のみ
	{
		var src = ctx.createBufferSource();
		src.buffer = buffer;
		src.looping = false;
		src.connect(ctx.destination);
		src.noteOn(0);
	}

	//周波数表示
	/*var analyser = ctx.createAnalyser();
	var jsProcessor = ctx.createJavaScriptNode(2048,1,1);
	var count = 0;
	var freqByteData = new Uint8Array(analyser.frequencyBinCount);
	jsProcessor.onaudioprocess = function(e) {
		analyser.getByteTimeDomainData(freqByteData);
		var canvElm2 = document.getElementById("rsrcCanv2");
		if(count*2048<audioLength){
			freqView(freqByteData, canvElm2, audioLength, count++);
		}

        var outdata = e.outputBuffer.getChannelData(0);
        var indata = e.inputBuffer.getChannelData(0);
        for (var i = 0; i < outdata.length; i++) {
        	outdata[i] = indata[i];
        }
	};
	{
		var src = ctx.createBufferSource();
		src.buffer = buffer;
		src.looping = false;
		src.connect(analyser);
		analyser.connect(jsProcessor);
		jsProcessor.connect(ctx.destination);
		src.noteOn(0);
	}*/

	/*
    var source = ctx.createBufferSource();
	//gSoundSource = source;
    source.buffer = data;
    var node = ctx.createJavaScriptNode(512, 1, 1);
    source.connect(node);
	var canvElm = document.getElementById("rsrcCanv");
	canvElm.dataTime = 0;
    node.onaudioprocess = function(e){
    	audioView(e.inputBuffer, canvElm);
        var outdata = e.outputBuffer.getChannelData(0);
        var indata = e.inputBuffer.getChannelData(0);
        for (var i = 0; i < outdata.length; i++) {
        	outdata[i] = indata[i];
        }
    };
    node.connect(ctx.destination);

    source.noteOn(0);*/
}

function audioView(buf, canv){
	var width = canv.width;
	var ctx = canv.getContext('2d');

	var b = buf.getChannelData(0);
	ctx.beginPath();
	for(var i=0; i<width*4; i++){
		var y = b[b.length*i/(width*4)|0]*128+128;
		ctx.lineTo(i/4, y);
	}
	ctx.clearRect(0,0,width,canv.height);
	ctx.moveTo(0,128);
	ctx.closePath();
	ctx.lineWidth = 0.4;
	ctx.stroke();

	var audioLine = document.getElementById("audioLine");
	var start = +new Date();
	var timer = null;
	timer = setInterval(function(){
		var secs = (+new Date()-start)/1000;
		var left = (secs*44000/b.length*width|0);
		audioLine.style.left = left+"px";
		if(left>width){
			clearInterval(timer);
		}
	},50);

	return b.length;
}

function freqView(b, canv, length, count){
	//var width = canv.width;
	var ctx = canv.getContext('2d');
	var srcData = ctx.getImageData(0,0,count+1,canv.height);

	//ctx.clearRect(0,0,width,canv.height);
	var x = count;
	for(var y=0; y<256; y++){
		//var c = b[b.length*y/256|0];
		var c = b[b.length*y/1024|0];
		srcData.data[y*(count+1)*4+x*4+0]=c;
		srcData.data[y*(count+1)*4+x*4+1]=c;
		srcData.data[y*(count+1)*4+x*4+2]=c;
		srcData.data[y*(count+1)*4+x*4+3]=255;
	}
	ctx.putImageData(srcData, count,0);
}
