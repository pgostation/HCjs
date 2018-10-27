"use strict";

function scriptEditorBtn(targetElemId){
	var data = getBtnData(targetElemId);
	scriptEditorObj(data);
}

function scriptEditorFld(targetElemId){
	var data = getFldData(targetElemId);
	scriptEditorObj(data);
}

var scriptDataObj = {};
var currentSelectScriptTab;

function selectScriptEditorTab(event, ui){
	for(var i=0; i<$("#scriptEditorTab div").get().length; i++){
		if(($('#scriptEditorTab div').get(i).id+"").match(/scriptAreaDummy.*/)){
			if(parseInt((i)/3) == ui.index){
				currentSelectScriptTab = $('#scriptEditorTab div').get(i).id;
			}
		}
	}
}

function closeScriptTab(id){
	for(var i=0; i<$("#scriptEditorTab div").get().length; i++){
		if($('#scriptEditorTab div').get(i).id==id){
			$("#scriptEditorTab").tabs("remove",parseInt((i)/3));
			delete scriptDataObj[id];
			break;
		}
	}
	if($("#scriptEditorTab").tabs("length")==0){
		hideInfoDialog();
	}
}

function scriptEditorObj(data, option){
	//親情報
	if((data.type=="button"||data.type=="field") && option!="javascript"){
		if(currentCardObj.parts.indexOf(data)!=-1){
			data.parent="card";
			data.parentId=currentCardObj.id;
		}else if(currentBgObj.parts.indexOf(data)!=-1){
			data.parent="background";
			data.parentId=currentBgObj.id;
		}else console.log(data);
	}
	else{
		/*if(cardData.indexOf(data)!=-1) data.type="card";
		else if(bgData.indexOf(data)!=-1) data.type="background";
		else if(stackData==data) data.type="stack";
		else console.log(data);*/
	}

	//重複している場合はアクティブにするだけ
	for(var id in scriptDataObj){
		if(scriptDataObj[id].parent == data.parent && scriptDataObj[id].parentId == data.parentId &&
				scriptDataObj[id].type == data.type && scriptDataObj[id].id == data.id &&
				scriptDataObj[id].option == option )
		{
			for(var i=0; i<$("#scriptEditorTab div").get().length; i++){
				if($('#scriptEditorTab div').get(i).id==id){
					$("#scriptEditorTab").tabs("select",parseInt((i)/3));
					break;
				}
			}

			//スクリプトエディタ表示
			var scriptEditor = document.getElementById('scriptEditor');
			scriptEditor.style.display = '';

			document.getElementById('overrayBack').style.display = '';
			document.getElementById('overrayBack').onclick = function(){hideInfoDialog(data);};

			touchInitClear();

			var scriptEditorPanel = document.getElementById("scriptEditorPanel");
			if(scriptEditorPanel.style.display!="none"){
				toggleScriptPanel();
			}
			return;
		}
	}

	//タブ追加
	var title = data.type +" "+((data.name!="")?("'"+data.name+"'"):("id "+data.id));
	for(var i=0; i<9999; i++){
		if(document.getElementById("scriptAreaDummy"+i)==null){
			break;
		}
	}
	
	currentSelectScriptTab = "scriptAreaDummy"+i;

	$("#scriptEditorTab").tabs("add","#scriptAreaDummy"+i,title);
	$("#scriptEditorTab").tabs("select",$("#scriptEditorTab").tabs('length')-1);
	$("#scriptEditorTab a[href='#scriptAreaDummy"+i+"']").parent().append("<a id='"+i+"scriptTabClose' style='padding-right:5px;padding-left:0px;'><span class='ui-icon ui-icon-circle-close'></span></a>");
	$("#"+i+"scriptTabClose").bind("click",function(){
		for(var i=0; i<=$("#scriptEditorTab div").get().length; i++){
			//console.log($('#scriptEditorTab div').get(i).id+"==?"+this.id);
			if($('#scriptEditorTab div').get(i).id == 'scriptAreaDummy'+parseInt(this.id)){
				closeScriptTab($('#scriptEditorTab div').get(i).id);
			}
		}
	});
	

	//scriptDataObjに追加
	scriptDataObj["scriptAreaDummy"+i] = {
			script:data.script,
			ejavascript:data.ejavascript,
			type:data.type,
			id:data.id,
			name:data.name,
			parent:data.parent,
			parentId:data.parentId,
			//未実装 changed:false,
			option:option,
	};

	//スクリプトをscriptAreaエレメントに入れる
	var htscript = "";
	if(option=="javascript"){
		if(data.ejavascript != undefined){ //PseudoJavaScript
			htscript = data.ejavascript;
		}
	}else{
		if(data.script != undefined){ //HyperTalk
			htscript = data.script;
		}
		if(htscript=="" && data.type=="button"){
			htscript = "on mouseUp\n\nend mouseUp";
		}
	}

	var elm2 = document.getElementById("scriptAreaDummy"+i);
	elm2.innerHTML = "<div translate=no style='overflow:scroll;margin:-13px -20px -5px -20px; padding:2px 2px 2px 2px; background:#fff;color:#000;border-radius:6px;'><div class='contEdit' contentEditable=true style='font-size:18px' spellcheck=false>"+
	escapeHTML(htscript).replace(/\n/g,"<br>")+"</div></div>";
	setTimeout(function(){
		var elm2 = document.getElementById("scriptAreaDummy"+i);
		var menuHeight = document.getElementById("footer1").offsetHeight;
		var scriptEditorPanel = document.getElementById("scriptEditorPanel");
		var panelHeight = scriptEditorPanel.offsetHeight;
		if(scriptEditorPanel.style.display=="none") panelHeight=0;
		elm2.childNodes[0].style.height = window.innerHeight-elm2.offsetTop-menuHeight-panelHeight-10+"px";
		elm2.childNodes[0].onclick = function(){this.childNodes[0].focus();};
		elm2.childNodes[0].onchange = function(){
			if(scriptDataObj[this.parentNode.id].option=="javascript"){
				scriptDataObj[this.parentNode.id].ejavascript = unescapeHTML(this.innerHTML);
			}else{
				scriptDataObj[this.parentNode.id].script = unescapeHTML(this.innerHTML);
			}
		};
	},0);

	setTimeout(function(){
		var activeElms = elm2.getElementsByClassName("contEdit");
		if(activeElms && activeElms[0]){
			activeElms[0].focus();
		}
	},0);

	//スクリプトエディタ表示
	var scriptEditor = document.getElementById('scriptEditor');
	scriptEditor.style.display = '';

	document.getElementById('overrayBack').style.display = '';
	document.getElementById('overrayBack').onclick = function(){hideInfoDialog(data);};

	touchInitClear();

	var scriptEditorPanel = document.getElementById("scriptEditorPanel");
	if(scriptEditorPanel.style.display!="none"){
		toggleScriptPanel();
	}

	keys[keycode_alt] = false; //ポップアップボタンのスクリプトを見たときにキー押し下げ状態のままになるのを回避
	keys[keycode_meta] = false; 
	keys[keycode_ctrl] = false; 
	setTimeout(scriptIndent,0);
}

function saveScript2(id){
	var data = scriptDataObj[id];
	scWorker.postMessage({event:"changeObj",content:data,editBackground:data.parent=="background"});
	if(data.type=="stack"){
		mmsgSendSystemEvent("getStackData");
	}
}

var httpHTObj;
function convertHT2(toClose){
	if(scriptDataObj[currentSelectScriptTab]==null){
		console.log("script is null");
		return;
	}
	if(scriptDataObj[currentSelectScriptTab].option=="javascript"){
		saveScript2(currentSelectScriptTab);
		return;
	}
	var hypertalkStr = (document.getElementById(currentSelectScriptTab).childNodes[0].childNodes[0].innerHTML);
	hypertalkStr = unescapeHTML(hypertalkStr.replace(/(<br>)|(<div>)/g,"\n").replace(/<[^<>]*>/g,""));
	scriptDataObj[currentSelectScriptTab].script = hypertalkStr;
	httpHTObj = createXMLHttpRequest(displayConvScript2);
	if (httpHTObj)
	{
		var xfcnStr = "";
		for(var i in xcmdData){
			xfcnStr += xcmdData[i].name+",";
		}

		httpHTObj.toClose = toClose;
		httpHTObj.setId = currentSelectScriptTab;
		//httpHTObj.loadCount = 0;
		httpHTObj.open("POST","convertht",true);
		httpHTObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		httpHTObj.send("hypertalk="+encodeURI(hypertalkStr).replace(/\+/g,"%2b").replace(/&/g,"%26")+"&xfcn="+encodeURI(xfcnStr).replace(/&/g,"%26"));
	}
}

function displayConvScript2(){
	var selectScriptTab = httpHTObj.setId;
	if ((httpHTObj.readyState == 4) && (httpHTObj.status == 200)) {
		scriptDataObj[selectScriptTab].ejavascript = httpHTObj.responseText;
		saveScript2(selectScriptTab);
		if(httpHTObj.toClose=="close"){
			closeScriptTab(selectScriptTab);
		}
		else if(httpHTObj.toClose=="show"){
			scriptEditorObj(scriptDataObj[selectScriptTab], "javascript");
		}
	}
	else if ((httpHTObj.readyState == 4) && (httpHTObj.status == 500)) {
		alert("error");
	}
}

function scriptIndent(){
	if(scriptDataObj[currentSelectScriptTab]==null){
		//console.log("script is null");
		return;
	}
	if(scriptDataObj[currentSelectScriptTab].option=="javascript"){
		//console.log("script is not hypertalk");
		return;
	}
	var hypertalkStr = (document.getElementById(currentSelectScriptTab).childNodes[0].childNodes[0].innerHTML);
	//console.log(hypertalkAry);
	//console.log(hypertalkStr);
	hypertalkStr = hypertalkStr.replace(/<div[^<>]*>/g,"<div>");

	//インデント
	var hypertalkAry = unescapeHTML(hypertalkStr.replace(/<div>/g,"\n").replace(/<\/div><span>/g,"\n").replace(/<br>/g,"\n").replace(/<[^<>]*>/g,"")).split("\n");
	//console.log(hypertalkAry);
	var hypertalkAry2 = [];
	var indent = 0;
	var handlerName = "";
	var lastThen=false;
	for(var i=0; i<hypertalkAry.length; i++){
		var x = hypertalkAry[i].replace(/".*"/g,"\"\"").replace(/--.*$/g,"")/*.replace(/<[^<>]*>/g,"")*/;
		x = x.trim().toLowerCase();

		if(x.match(/^end if$/)) indent--;
		if(x.match(/^else .*$/)&&!lastThen) indent--;
		if(x.match(/^else$/)&&!lastThen) indent--;
		if(x.match(/^end repeat$/)) indent--;
		if(indent==1 && x==("end "+handlerName)) indent--;
		if(indent<0)indent=0;

		hypertalkAry2[i] = "";
		for(var j=0; j<indent; j++){
			hypertalkAry2[i] += "&nbsp;&nbsp;";
		}
		hypertalkAry2[i] += (hypertalkAry[i]).trim();

		if(x.match(/^repeat( .*|)$/)) indent++;
		if(x.match(/^.* then$/)) indent++;
		if(x.match(/^then$/)) indent++;
		if(x.match(/^.* else$/)) indent++;
		if(x.match(/^else$/)) indent++;
		if(indent==0 && x.match(/^(functi|)on .*$/)){
			indent++;
			handlerName = x.substring(x.indexOf(" ")+1);
			if(handlerName.indexOf(" ")!=-1){
				handlerName = handlerName.substring(0,handlerName.indexOf(" "));
			}
		}
		lastThen = x.match(/.*then .*$/);
	}

	//色付け
	for(var i=0; i<hypertalkAry2.length; i++){
		var x = hypertalkAry2[i];

		//時間がかかるのでコメントアウト
		/*//制御構造
		console.log(x);
		if(x.match(/^(&nbsp;)*repeat( .*)*$/)){
			x = "<span style='font-weight:bold;'>"+x.substring(0,x.indexOf("repeat")+6)+"</span>"+x.substring(x.indexOf("repeat")+6);
		}
		if(x.match(/^(&nbsp;)*if( .*)$/)){
			x = "<span style='font-weight:bold;'>"+x.substring(0,x.indexOf("if")+2)+"</span>"+x.substring(x.indexOf("if")+2);
		}
		if(x.match(/^(&nbsp;)*(.* )*then( .*)*$/)){
			x = x.substring(0,x.indexOf("then"))+"<span style='font-weight:bold;'>"+x.substring(x.indexOf("then"),x.indexOf("then")+4)+"</span>"+x.substring(x.indexOf("then")+4);
		}
		if(x.match(/^(&nbsp;)*(.* )*else if( .*)*$/)){
			x = x.substring(0,x.indexOf("else if"))+"<span style='font-weight:bold;'>"+x.substring(x.indexOf("else if"),x.indexOf("else if")+7)+"</span>"+x.substring(x.indexOf("else")+7);
		}
		if(x.match(/^(&nbsp;)*(.* )*else( .*)*$/)){
			x = x.substring(0,x.indexOf("else"))+"<span style='font-weight:bold;'>"+x.substring(x.indexOf("else"),x.indexOf("else")+4)+"</span>"+x.substring(x.indexOf("else")+4);
		}
		if(x.match(/^(&nbsp;)*end if/)){
			x = "<span style='font-weight:bold;'>"+x.substring(0,x.indexOf("end if")+6)+"</span>"+x.substring(x.indexOf("end if")+6);
		}
		if(x.match(/^(&nbsp;)*end repeat/)){
			x = "<span style='font-weight:bold;'>"+x.substring(0,x.indexOf("end repeat")+10)+"</span>"+x.substring(x.indexOf("end repeat")+10);
		}
		if(x.match(/^(&nbsp;)*on( .*)/)){
			x = "<span style='font-weight:bold;'>"+x.substring(0,x.indexOf("on")+2)+"</span>"+x.substring(x.indexOf("on")+2);
		}
		if(x.match(/^(&nbsp;)*end( .*)/)){
			x = "<span style='font-weight:bold;'>"+x.substring(0,x.indexOf("end")+3)+"</span>"+x.substring(x.indexOf("end")+3);
		}
		hypertalkAry2[i] = x;*/

		var x2 = x.split("\"");
		for(var j=0; j<x2.length; j+=2){
			//コメント
			if(x2[j].indexOf("--")!=-1){
				var s = x2[j].indexOf("--");
				x2[j] = x2[j].substring(0,s)+"<span style='color:#060'>"+x2[j].substring(s);
				x2[x2.length-1] += "</span>";
				hypertalkAry2[i] = x2.join("\"");
			}
		}
	}

	hypertalkStr = hypertalkAry2.join("<br>");
	document.getElementById(currentSelectScriptTab).childNodes[0].childNodes[0].innerHTML = hypertalkStr;
}

function toggleScriptPanel(){
	var scriptEditorPanel = document.getElementById("scriptEditorPanel");
	if(scriptEditorPanel.style.display!="none"){
		scriptEditorPanel.style.display="none";
		windowResize();
		var div = document.getElementById("sePanelLine");
		if(div){
			div.parentNode.removeChild(div);
		}
		var cur = document.getElementById(currentSelectScriptTab);
		if(!cur || !cur.childNodes[0])return;
		var elm = cur.childNodes[0].childNodes[0];
		if(!elm)return;
		elm.onclick = null;
		elm.ontouchstart = null;
		return;
	}
	scriptEditorPanel.style.display="";
	windowResize();
	
	seShowLine();
	/*//キャレットの場所に応じて表示内容を変える
	document.getElementById(currentSelectScriptTab).childNodes[0].childNodes[0].focus();
	var sel = getSelection();
	var txt = "";
	if(sel.anchorNode.childElementCount){
		var childs = sel.anchorNode.childNodes;
		for(var i=0; i<sel.anchorNode.childElementCount; i++){
			if(childs[i].data) txt += childs[i].data;
		}
	}else{
		var childs = sel.anchorNode.childNodes;
	sel.anchorOffset;
	}*/

	var xlist = getXCMDList();
	seCmdList.externals = xlist;

	showPanelClick();
}

function seShowLine(e){
	scriptIndent();
	var sel = getSelection();
	var txt = "";
	var line = 0;
	if(e!=null && (e.touches!=null || sel==null || sel.anchorNode==null)){
		var y=0;
		if(e.pageY!=null){
			y = e.pageY-52;
		}else if(e.touches){
			y = e.touches[0].pageY-52;
		}
		var cur = document.getElementById(currentSelectScriptTab);
		if(!cur || !cur.childNodes[0])return;
		var elm = cur.childNodes[0].childNodes[0];
		var lineHeight = parseInt(elm.style.lineHeight);
		if(lineHeight==0) lineHeight = parseInt(parseInt(elm.style.fontSize)*1.15);
		line = y/lineHeight|0;
	}
	else if(sel!=null && sel.anchorNode!=null) {
		var childs = sel.anchorNode?sel.anchorNode.childNodes:null;
		for(var i=0; i<sel.anchorOffset; i++){
			if(childs[i] && childs[i].data) txt += childs[i].data;
			else txt+="\n";
		}
		line = (txt=="")?0:txt.split("\n").length-1;
	}
	seShowLine2(line);
}

function seShowLine2(line){
	var div = document.getElementById("sePanelLine");
	if(div){
		div.parentNode.removeChild(div);
	}
	var cur = document.getElementById(currentSelectScriptTab);
	if(!cur || !cur.childNodes[0])return;
	var elm = cur.childNodes[0].childNodes[0];
	if(!elm)return;
	var lineHeight = parseInt(parseInt(elm.style.fontSize)*1.15);
	elm.style.lineHeight = lineHeight+"px";
	var div = document.createElement("div");
	div.id = "sePanelLine";
	div.xline = line;
	div.style.position = "absolute";
	div.style.left = "10px";
	div.style.top = line*lineHeight+elm.scrollTop+elm.parentNode.offsetTop+1+"px";
	div.style.width = "95%";
	div.style.height = lineHeight-1+"px";
	div.style.border = "2px solid #00f";
	div.style.borderRadius = "4px";
	elm.parentNode.appendChild(div);
	elm.parentNode.onscroll = function(){
		div.style.top = line*lineHeight-elm.parentNode.scrollTop+elm.parentNode.offsetTop+"px";
	};
	elm.onclick = seShowLine;
	elm.ontouchstart = seShowLine;
}

function setPanelBtnStyle(div){
	div.style.minWidth = "40px";
	div.style.textAlign = "center";
	div.style.color = "#000";
	div.style.background = "#ccf";
	div.obackground = "#ccf";
	div.style.fontSize = "1.2em";
	div.style.float = "left";
	div.style.padding = "2px";
	div.style.margin = "2px";
	div.style.border = "1px solid #000";
	div.style.borderRadius = "3px";
	div.style.cursor = "pointer";
	div.onmouseover = overPanelBtn;
	div.onmousedown = hilitePanelBtn;
	div.onmouseout = unhilitePanelBtn;
	div.ontouchstart = hilitePanelBtn;
	div.ontouchend = unhilitePanelBtn;
}

function overPanelBtn(){
	this.style.background = "#aac";
}

function hilitePanelBtn(){
	this.style.background = "#000";
}

function unhilitePanelBtn(){
	this.style.background = this.obackground;
}

function showPanelClick(){
	var elm = document.getElementById("scriptEditorPanelIn");
	for(var i=elm.childNodes.length-1; i>=0; i--){
		elm.removeChild(elm.childNodes[i]);
	}
	
	for(var tag in seCmdList){
		var div = document.createElement("div");
		div.appendChild(document.createTextNode(tag));
		setPanelBtnStyle(div);
		(function(tag){
			div.onclick = function(){sePanelClick(tag);};
		})(tag);
		elm.appendChild(div);
	}

	var div = document.createElement("button");
	div.appendChild(document.createTextNode("insert line"));
	setPanelBtnStyle(div);
	div.style.background = "#fff";
	div.obackground = "#fff";
	div.style.border = "1px solid #025";
	div.onclick = sePanelAddLine;
	elm.appendChild(div);
}

function sePanelClick(tag){
	var elm = document.getElementById("scriptEditorPanelIn");
	for(var i=elm.childNodes.length-1; i>=0; i--){
		elm.removeChild(elm.childNodes[i]);
	}

	var div = document.createElement("div");
	div.appendChild(document.createTextNode("△"));
	setPanelBtnStyle(div);
	div.style.background = "#fff";
	div.obackground = "#fff";
	div.onclick = function(){showPanelClick();};
	elm.appendChild(div);
	
	var tags = seCmdList[tag];
	if(!tags)return;
	for(var i=0; i<tags.length; i++){
		var div = document.createElement("div");
		div.appendChild(document.createTextNode(tags[i]));
		setPanelBtnStyle(div);
		(function(x){
			div.onclick = function(){sePanelClick2(x,tag);};
		})(tags[i]);
		elm.appendChild(div);
	}
}

function sePanelClick2(tag,ptag){
	var elm = document.getElementById("scriptEditorPanelIn");
	for(var i=elm.childNodes.length-1; i>=0; i--){
		elm.removeChild(elm.childNodes[i]);
	}

	var div = document.createElement("div");
	div.appendChild(document.createTextNode("△"));
	setPanelBtnStyle(div);
	div.style.background = "#fff";
	div.obackground = "#fff";
	div.onclick = function(){sePanelClick(ptag);};
	elm.appendChild(div);

	var tags = seCmdSubList[tag];
	if(!tags){
		tags = tag;
	}
	console.log(tags);
	console.log(typeof tags);
	if(typeof tags=="string"){
		tags = [tag];
	}
	if(tags.length==1){
		sePanelLine(tags[0],null,ptag);
		return;
	}
	for(var i=0; i<tags.length; i++){
		var div = document.createElement("div");
		div.appendChild(document.createTextNode(tags[i]));
		setPanelBtnStyle(div);
		(function(x){
			div.onclick = function(){sePanelLine(x,tag,ptag);};
		})(tags[i]);
		elm.appendChild(div);
	}
}

function sePanelLine(tag,ptag,pptag){
	var elm = document.getElementById("scriptEditorPanelIn");
	for(var i=elm.childNodes.length-1; i>=0; i--){
		elm.removeChild(elm.childNodes[i]);
	}

	var div = document.createElement("div");
	div.appendChild(document.createTextNode("△"));
	setPanelBtnStyle(div);
	div.style.background = "#fff";
	div.obackground = "#fff";
	div.onclick = function(){
		if(ptag!=null){sePanelClick2(ptag,pptag);}
		else{sePanelClick(pptag);}
	};
	elm.appendChild(div);

	var tabindex = 1;
	var tags = tag.split(" ");
	for(var i=0; i<tags.length; i++){
		var div = document.createElement("div");
		div.style.color = "#000";
		div.style.float = "left";
		div.style.padding = "2px";
		div.style.margin = "2px";
		if(tags[i]=="~"){
		}
		else if(tags[i][0]=="["){
			var input = document.createElement("input");
			input.id = "sepanel-"+i;
			input.type = "text";
			input.style.cursor = "text";
			input.style.width = "128px";
			input.placeholder = tags[i];
			div.appendChild(input);
			if(tabindex==1){
				(function(input){
					setTimeout(function(){input.focus();},0);
				})(input);
			}
			input.tabindex = tabindex;
			tabindex++;
			var list = null;
			switch(tags[i]){
			case "[new-handler]":
				list = ",mouseUp,mouseStillDown,mouseDown,mouseEnter,mouseWithin,mouseLeave,openCard,closeCard,openStack,openField,closeField".split(",");
				break;
			case "[effect]":
				list = ",dissolve,push left,push right,push up,push down,wipe left,wipe right,wipe up,wipe down,scroll left,scroll right,scroll up,scroll down,iris open,iris close,zoom open,zoom close,stretch from bottom,stretch from top,stretch from center,shrink to bottom,shrink to top,shrink to center,barn door open,barn door close,venetian blinds,checkerboard,fade".split(",");
				break;
			case "[speed]":
				list = ",very fast,fast,slow,very slow".split(",");
				break;
			case "[card]":
				list = ",card id ,card \"\",first card,last card".split(",");
				break;
			case "[obj]":
				list = ",cd btn ,bg btn ,cd fld ,bg fld ,card ,bg ,this stack".split(",");
				break;
			case "[button]":
				list = ",cd btn ,bg btn ".split(",");
				break;
			case "[part]":
				list = ",cd btn ,bg btn ,cd fld ,bg fld ".split(",");
				break;
			case "[property]":
				list = ",left,right,top,bottom,loc,topLeft,rect,width,height,name,icon,visible,style,hilite,family,opacity,selectedLine,selectedText,lockText,scroll".split(",");
				break;
			case "[tool]":
				list = ",browse tool,button tool,field tool,select tool,lasso tool,magicwand tool,pencil tool,brush tool,eraser tool,line tool,rect tool,oval tool,bucket tool,text tool".split(",");
				break;
			case "[picture-resource]":
				list = getResourceList('picture');
				break;
			case "[icon-resource]":
				list = getResourceList('icon');
				break;
			case "[sound-resource]":
				list = ("\nHarpsichord\nflute\nBoing\n"+getResourceList('sound').join("\n")).split("\n");
				break;
			case "[window-style]":
				list = ",zoom,plain,roundrect,windoid,rect,shadow,dialog".split(",");
				break;
			case "[visible]":
				list = ",true,false".split(",");
				break;
			case "[ascending/descending]":
				list = ",ascending,descending".split(",");
				break;
			case "[on/off]":
				list = ",on,off".split(",");
				break;
			case "[expr]":
				list = escapeHTML(",=,>,<,>=,<=,<>,is,is not,is in,is not in,contains,is within,is not within,there is a,there is not a,".split(","));
				break;
			}
			if(list!=null){
				var select = sePanelAppendSelect(input,list,elm);
				select.tabindex = tabindex;
				tabindex++;
				div.appendChild(select);
			}
		}
		else{
			div.appendChild(document.createTextNode(tags[i]));
			div.style.marginTop = "8px";
			div.id = "sepanel-"+i;
		}
		elm.appendChild(div);
	}

	var div = document.createElement("button");
	div.appendChild(document.createTextNode("OK"));
	setPanelBtnStyle(div);
	div.style.background = "#cdf";
	div.obackground = "#cdf";
	div.style.border = "1px solid #025";
	div.onclick = sePanelPutLine;
	div.tabindex = tabindex;
	elm.appendChild(div);
}

function sePanelAppendSelect(input, list, elm){
	var select = document.createElement("select");
	select.style.position = "absolute";
	setTimeout(function(){
		select.style.left = input.offsetLeft+"px";
		select.style.maxWidth = input.offsetWidth+"px";
		select.style.top = elm.offsetTop+input.offsetHeight+8+"px";
	},0);
	select.onchange = function(){input.value = this.xlist[this.selectedIndex];};
	select.xlist = list;
	for(var i=0; i<list.length; i++){
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(list[i]));
		select.appendChild(option);
	}
	return select;
}

function sePanelPutLine(){
	var sePanelLine = document.getElementById("sePanelLine");
	if(!sePanelLine){
		alert("Can't find inserting line.");
		return;
	}
	var line = sePanelLine.xline;
	var elm = document.getElementById(currentSelectScriptTab).childNodes[0].childNodes[0];
	var childs = elm.childNodes;
	for(var i=0,j=0; i<childs.length&&j<line; i++){
		if(childs[i].tagName=="BR") j++;
	}
	var txt = "";
	for(var n=0; n<99; n++){
		var sepanel = document.getElementById("sepanel-"+n);
		if(!sepanel)break;
		if(sepanel.tagName=="DIV"){
			txt += " "+sepanel.childNodes[0].data;
		}else if(sepanel.tagName=="INPUT"){
			var v = sepanel.value;
			if(!v.match(/^[-a-z0-9 \"()'&+\/*^=<>.,_]*$/i) && !v.match(/\"/)){
				v = "\""+v+"\"";
			}
			txt += " "+v;
		}
	}
	var newelm = document.createTextNode(txt);
	if(childs[i] && childs[i].tagName!="BR"){
		elm.removeChild(childs[i]);
		if(i-1>=0) i--;
	}
	var c = childs[i]?childs[i].nextSibling:null;
	if(i-1<0) c = childs[0];
	elm.insertBefore(newelm, c);
	elm.insertBefore(document.createElement("br"), c);
	
	setTimeout(scriptIndent,0);
	setTimeout(function(){seShowLine2(line+1);},0);
	showPanelClick();
}

function sePanelAddLine(){
	var sePanelLine = document.getElementById("sePanelLine");
	if(!sePanelLine){
		alert("Can't find inserting line.");
		return;
	}
	var line = sePanelLine.xline;
	var elm = document.getElementById(currentSelectScriptTab).childNodes[0].childNodes[0];
	var childs = elm.childNodes;
	for(var i=0,j=0; i<childs.length&&j<line; i++){
		if(childs[i].tagName=="BR") j++;
	}
	var newelm = document.createTextNode("");
	if(childs[i] && childs[i].tagName!="BR"){
		if(i-1>=0) i--;
	}
	var c = childs[i]?childs[i].nextSibling:null;
	if(i-1<0) c = childs[0];
	elm.insertBefore(newelm, c);
	elm.insertBefore(document.createElement("br"), c);
	
	setTimeout(scriptIndent,0);
	setTimeout(function(){seShowLine2(line+1);},0);
}

var seCmdList = {
"controls":["on","function","end","if","repeat","exit","return","send","pass","--"],
"objects":["set","show/hide","enable/disable","select"],
"variable":["put","get","+-×÷","delete"],
"go":["go","visual","lock/unlock","mark/unmark","push/pop"],
"UI":["answer","ask","flash","click at","choose","picture"],
"menu":["doMenu","create menu","reset menu"],
"file":["open file","close file","read from file","write to file"],
"others":["wait","play","find","sort","do","debug","edit script","arrowkey","convert"],
"externals":[],
};
var seCmdSubList = {
"on":["on [new-handler]","on [new-handler] [parameters]"],
"function":["function [new-handler]","function [new-handler] [parameters]"],
"end":["end [handler]"],
"if":["if [expr] then ~","if [expr] then\n ~","else ~","end if"],
"repeat":["repeat", "repeat [value]", "repeat while [expr]", "repeat until [expr]", "repeat with [container] = [value] to [value]", "repeat with [container] = [value] down to [value]"],
"exit":["exit repeat","next repeat","exit [handler]","exit to hypercard"],
"return":["return", "return [value]"],
"send":["send [text]","send [text] to [obj]"],
"pass":["pass [handler]"],
"--":["-- [text]"],
//--
"set":["set [property] to [value]", "set [property] of [obj] to [value]"],
"show/hide":["show [obj]", "show [obj] at [point]", "hide [obj]"],
"enable/disable":["enable [button]", "disable [button]"],
"select":["select line [value] of [part]"],
//--
"put":["put [value] into [container]", "put [value] after [container]", "put [value] before [container]", "put [text] into msg"],
"get":["get [value]"],
"+-×÷":["add [value] to [container]", "subtract [value] from [container]", "multiply [container] by [value]", "divide [container] by [value]"],
"global":["global [parameters]"],
"delete":["delete [chunk]"],
//--
"go":["go prev card","go next card","go [card]"],
"visual":["visual effect [effect] [speed]"],
"lock/unlock":["lock screen","unlock screen","lock messages","unlock messages","lock recent","unlock recent"],
"mark/unmark":["mark [card]","unmark [card]"],
"push/pop":["push card","pop card"],
//--
"answer":["answer [text]", "answer [text] with [text]", "answer [text] with [text] or [text]", "answer [text] with [text] or [text] or [text]"],
"ask":["ask [text]", "ask [text] with [text]"],
"flash":["flash","flash [value]"],
"click at":["click at [point]"],
"choose":["choose [tool]"],
"picture":["picture [picture-resource] , \"resource\", [window-style] , [visible]"],
//--
"doMenu":["doMenu [text]"],
"create menu":["create menu [text]"],
"reset menubar":["reset menubar"],
//--
"open file":["open file [text]"],
"close file":["close file [text]"],
"read from file":["read from file [text] until [text]"],
"write to file":["write [value] to file [text]", "write [value] to file [text] at [value]"],
//--
"wait":["wait [value]","wait [value] seconds","wait until [expr]","wait while [expr]"],
"play":["play [sound-resource]","play [sound-resource] [text]"],
"find":["find string [text]"],
"sort":["sort items of [container] [ascending/descending]","sort lines of [container] [ascending/descending]"],
"do":["do [text]"],
"debug":["debug sound [on/off]"],
"edit script":["edit script of [obj]"],
"arrowkey":["arrowkey [text]"],
"convert":["convert [container] to [text]"],
//--
"UxAnswer":["UxAnswer [text]", "UxAnswer [text] with [text]", "UxAnswer [text] with [text] or [text]", "UxAnswer [text] with [text] or [text] or [text]"],
"UxBack":["UxBack [text]","UxBack \"ICON\", [icon-resource]","UxBack \"ICON\", [icon-resource] , [value]","UxBack \"close\""],
"PgColorX":["PgColorX \"new\", [value] , [text]",
            "PgColorX \"copyBits\", [value] , [value] , [value] , [value]",
            "PgColorX \"tiling\", [value] , [value] , [value] , [value]",
            "PgColorX \"pict\", [value] , [pict-resource] , [text]",
            "PgColorX \"string\", [value] , [text] , [text] , [text]",
            "PgColorX \"kill\", [value]",
            ],
"HttpGet":["HttpGet [resp-handler] , [url]","HttpGet [resp-handler] , [url] , [post-data]"],
//--
};
