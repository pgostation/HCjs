"use strict";

var nowExecObjType;
var nowExecObjId;
var it = "";
var theResult = "";

//a
function answer(msg,str1,str2,str3){
	if(!msg) msg="";
	msg+="";
	document.getElementById('answerMsg').innerHTML = escapeHTML(msg).replace(/\n/g,"<br>");
	document.getElementById('overrayBack').onclick = undefined;
	document.getElementById('overrayBack')[tapstartEvent()] = undefined;
	document.getElementById('overrayBack').style.display = 'block';
	document.getElementById('answerDialog').style['-webkit-transition'] = 'opacity 0.2s linear';
	document.getElementById('answerDialog').style['MozTransition'] = 'opacity 0.2s linear';
	document.getElementById('answerDialog').style.left="-9999px";
	document.getElementById('answerDialog').style.maxHeight=window.innerHeight-20+"px";
	document.getElementById('answerDialog').style.display='';
	setTimeout(function(){
		document.getElementById('answerDialog').style.opacity='0.95';
		document.getElementById('answerDialog').style.left=document.getElementById('par').offsetWidth/2 -document.getElementById('answerDialog').offsetWidth/2+"px";
		document.getElementById('answerDialog').style.top=Math.max(0,document.getElementById('par').offsetHeight/2 -document.getElementById('answerDialog').offsetHeight/2)+"px";
		if(str1==undefined){
			document.getElementById('answerBtn1').style.display='inline';
			document.getElementById('answerBtn1').style.position='';
			document.getElementById('answerBtn1').style.marginRight='20px';
			document.getElementById('answerBtn2').style.display='none';
			document.getElementById('answerBtn2').style.position='absolute';
			document.getElementById('answerBtn3').style.display='none';
			document.getElementById('answerBtn3').style.position='absolute';
			$('#answerBtn1').button({label:"OK"});
			$('#answerBtn1').addClass("ui-state-hover");
		}
		else if(str2==undefined){
			document.getElementById('answerBtn1').style.display='inline';
			document.getElementById('answerBtn1').style.position='';
			document.getElementById('answerBtn1').style.marginRight='20px';
			document.getElementById('answerBtn2').style.display='none';
			document.getElementById('answerBtn2').style.position='absolute';
			document.getElementById('answerBtn3').style.display='none';
			document.getElementById('answerBtn3').style.position='absolute';
			$('#answerBtn1').button({label:str1});
			$('#answerBtn1').addClass("ui-state-hover");
		}
		else if(str3==undefined){
			document.getElementById('answerBtn1').style.display='inline';
			document.getElementById('answerBtn1').style.position='';
			document.getElementById('answerBtn1').style.marginRight='0px';
			document.getElementById('answerBtn2').style.display='inline';
			document.getElementById('answerBtn2').style.position='';
			document.getElementById('answerBtn3').style.display='none';
			document.getElementById('answerBtn3').style.position='absolute';
			$('#answerBtn1').button({label:str2});
			$('#answerBtn2').button({label:str1});
			$('#answerBtn1').addClass("ui-state-hover");
		}
		else{
			document.getElementById('answerBtn1').style.display='inline';
			document.getElementById('answerBtn1').style.position='';
			document.getElementById('answerBtn1').style.marginRight='0px';
			document.getElementById('answerBtn2').style.display='inline';
			document.getElementById('answerBtn2').style.position='';
			document.getElementById('answerBtn3').style.display='inline';
			document.getElementById('answerBtn3').style.position='';
			$('#answerBtn1').button({label:str3});
			$('#answerBtn2').button({label:str2});
			$('#answerBtn3').button({label:str1});
			$('#answerBtn1').addClass("ui-state-hover");
		}
	},0);
}

var hideAnswerDialog = function(result){
	document.getElementById('overrayBack').style.display = 'none';
	document.getElementById('answerDialog').style['-webkit-transition'] = 'all 0.2s linear';
	document.getElementById('answerDialog').style['MozTransition'] = 'all 0.2s linear';
	setTimeout(function(){
		document.getElementById('answerDialog').style.opacity='0.0';
		document.getElementById('answerDialog').style.display='none';
	},0);

	mmsgSyncProperty("answer", "", result);
};

function ask(msg,defStr){
	if(!msg) msg="";
	if(!defStr) defStr="";
	msg+="";
	document.getElementById('askMsg').innerHTML = escapeHTML(msg).replace(/\n/g,"<br>");
	document.getElementById('askValue').type = "text";
	document.getElementById('askValue').value = defStr;
	document.getElementById('overrayBack').onclick = undefined;
	document.getElementById('overrayBack')["ontouchend"] = function(){
		if(document.activeElement.blur){document.activeElement.blur();}};
		document.getElementById('overrayBack').style.display = 'block';
		document.getElementById('askDialog').style['-webkit-transition'] = 'opacity 0.2s linear';
		document.getElementById('askDialog').style['MozTransition'] = 'opacity 0.2s linear';
		document.getElementById('askDialog').style.left="-9999px";
		document.getElementById('askDialog').style.display='';
		$('#askBtn1').addClass("ui-state-hover");
		$('#askValue').bind("touchstart",function(e){$(this).focus();});
		setTimeout(function(){
			document.getElementById('askDialog').style.opacity='0.95';
			document.getElementById('askDialog').style.left=document.getElementById('par').offsetWidth/2 -document.getElementById('askDialog').offsetWidth/2+"px";
			document.getElementById('askDialog').style.top=document.getElementById('par').offsetHeight/2 -document.getElementById('askDialog').offsetHeight/2+"px";
		},0);
}

function askPassword(msg,defStr){
	ask(msg,defStr);
	document.getElementById('askValue').type = "password";
}

var hideAskDialog = function(result){
	document.getElementById('overrayBack')["ontouchend"] = undefined;
	if(document.activeElement.blur){document.activeElement.blur();}
	window.scroll(window.pageXOffset/2,window.pageYOffset/2+1);

	document.getElementById('overrayBack').style.display = 'none';
	document.getElementById('askDialog').style['-webkit-transition'] = 'all 0.2s linear';
	document.getElementById('askDialog').style['MozTransition'] = 'all 0.2s linear';
	setTimeout(function(){
		document.getElementById('askDialog').style.opacity='0.0';
		document.getElementById('askDialog').style.display='none';
	},0);

	var value = document.getElementById('askValue').value;
	if(document.getElementById('askValue').type == "password"){
		var hash = "B".charCodeAt(0)+"i".charCodeAt(0)+"l".charCodeAt(0)+"l".charCodeAt(0);
		if(value.length>0){
			var seed = value.charCodeAt(0)+value.length;
			for(var i=0; i<value.length; i++){
				for (var m = 0x80; m != 0; m>0) {
					var newSeed = (seed & 0xFFFFFFFF) * 0x41A7;
					while (newSeed >= 0x80000000) {
						newSeed = (newSeed & 0x7FFFFFFF) + (newSeed >> 31);
					}
					seed = (newSeed == 0x7FFFFFFF) ? 0 : newSeed;
					if ((b & m) != 0){
						hash += seed;
					}
					m = m/2|0;
				}
			}
		}
		value = hash;
	}
	mmsgSyncProperty("ask", result, result=="OK"?value:"");
	value = null;
};

//b
function beep(){
	//beepをどうやって鳴らそう。iOSェ
	document.getElementById('cardBack').style.opacity="0.5";
	var save = document.getElementById('page').style.background;
	document.getElementById('page').style.background="#000000";
	setTimeout(function(){
		document.getElementById('page').style.background=save;
		document.getElementById('cardBack').style.opacity="";
	},200);
	navigator.vibrate = navigator.vibrate || navigator.mozVibrate;
	if(navigator.vibrate){
		navigator.vibrate(200);
	}
}

//c
function clickAt(ix,iy){
	var x = (ix - $('#cardBack').width()/2)*getCardScale()+$('#par').width()/2;
	var y = (iy - $('#cardBack').height()/2)*getCardScale()+$('#par').height()/2+getCardTop();

	var e = document.createEvent("MouseEvent");
	e.initMouseEvent("click",true,true,window,1,0,0,x,y,false,false,false,false,0,null);

	_mouse.setLoc(e);
	_mouse.setClick(e);

	var btn;
	if((btn=getButtonAtPoint(x,y)) !=null){
		if(selectedTool=="button"){
			btn.onmouseover(e);
			e.pageX = x;
			e.pageY = y;
		}
		if(btn.onmousedown) btn.onmousedown(e);
		if(btn.onmouseup) btn.onmouseup(e);
		if(btn.onmouseout) btn.onmouseout(e);
	}
	else if((btn=getFieldAtPoint(x,y)) !=null){
		if(selectedTool=="field"){
			btn.onmouseover(e);
			e.pageX = x;
			e.pageY = y;
		}
		if(btn.onmousedown) btn.onmousedown(e);
		if(btn.onmouseup) btn.onmouseup(e);
		if(btn.onmouseout) btn.onmouseout(e);
	}
	else{
		sendEvent(currentCardObj,"mousedown");
		sendEvent(currentCardObj,"mouseup");
	}

}

function createMenu(menu){
	browseMenus[browseMenus.length] = {name:menu, enabled:true};
	if(selectedTool=="browse"){
		changeMenuTitles(browseMenus);
	}
	mmsgSendSystemEvent("menus",browseMenus);
}

//d
function debugCommand(opt, value){
	gDebugSound = (value.toLowerCase()=="off")?false:true;
	if(!gDebugSound) playCmd("stop");
}

function deleteMenu(menu){
	for(var i in browseMenus){
		if(browseMenus[i].name==menu || menuTranslate(browseMenus[i].name)==menu){
			browseMenus.splice(i,1);
		}
	}
	if(selectedTool=="browse"){
		changeMenuTitles(browseMenus);
	}
	mmsgSendSystemEvent("menus",browseMenus);
}

function disableMenu(menu){
	for(var i in browseMenus){
		if(browseMenus[i].name==menu || menuTranslate(browseMenus[i].name)==menu){
			browseMenus[i].enabled = false;
		}
	}
	changeMenuTitles(browseMenus);
}

function disableMenuitem(menu, menuitem){
	setEnabledMenuItem(menu, menuitem, false);
}

function doMenuCmd(x){
	for(var t in menuElem){
		var menuAry = menuElem[t];
		for(var i=0; i<menuAry.length; i++){
			if(typeof menuAry[i].name=="object")continue;
			if(!menuAry[i].name)continue;
			if((menuAry[i].name).toLowerCase() == x.toLowerCase()){
				execMenu(x);
				return;
			}
			if(menuitemTranslate(menuAry[i].name, "ja").toLowerCase() == x.toLowerCase()){
				execMenu(menuAry[i].name);
				return;
			}
		}
	}
	execMenu(x);
}

//e
function editScript(obj){
	scriptEditorObj(obj);
}

function enableMenu(menu){
	for(var i in browseMenus){
		if(browseMenus[i].name==menu || menuTranslate(browseMenus[i].name)==menu){
			browseMenus[i].enabled = true;
		}
	}
	changeMenuTitles(browseMenus);
}

function enableMenuitem(menu, menuitem){
	setEnabledMenuItem(menu, menuitem, true);
}

//f
var findCards, findBgs, findStr, findCardNum, findPart, findStart, findBgPart;
function findString(opt, str, fld, cds, bgs){
	findCards = cds;
	findBgs = bgs;
	findStr = str;
	findCardNum = null;
	findPart = null;
	findBgPart = null;
	findStart = null;
	findNext();
}

function findNext(){
	if(document.getElementById('findstring').style.display!="block"){
		document.getElementById('findstring').style.display = "block";
		document.getElementById('findtext').value = findStr;
		document.getElementById('findtext').focus();
		if(window.innerWidth>480){
			document.getElementById('findtext').style['MozTransform'] = "scale(1.8)";
			document.getElementById('findtext').style['-webkit-transform'] = "scale(1.8)";
			document.getElementById('findtext').style.marginRight = "50px";
		}
	}
	//strが''なら何も検索しない
	if(findStr=="") return;
	//strがあれば、最初の文字を選択する
	mmsgSendSystemEvent("getStackData");
	setTimeout(function(){
		var result = "not found";
		var foundHtml = "";
		var text = "";
		//現在のカード(bgfld,cdfld)→次のカード・・・で元のカードに戻ってくるまで探す
		//バックグラウンドは探せないバグが。
		var nowCardNum = 0;
		for(var i=0; i<findCards.length; i++){
			if(currentCardObj.id == findCards[i].id){
				nowCardNum = i;
				break;
			}
		}
		loop: for(var i=nowCardNum; i<nowCardNum+findCards.length; i++){
			var j = i%findCards.length;
			for(var k=0; k<findCards[j].parts.length + 1; k++){
				var bgpartid = null;
				if(k<findCards[j].parts.length){
					if(findCards[j].parts[k].type!="field") continue;
					if(findCards[j].parts[k].visible==false) continue;
					if(findCards[j].parts[k].dontSearch==true) continue;
					foundHtml = findCards[j].parts[k].text;
					text = foundHtml.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
				}else{
					text = "";
					for(bgpartid in findCards[j].bgparts){
						if(!findCards[j].bgparts[bgpartid] || !findCards[j].bgparts[bgpartid].text) continue;
						for(var bgnum=0;bgnum<findBgs.length;bgnum++){
							if(findBgs[bgnum].id == findCards[j].background) break;
						}
						if(!findBgs[bgnum]) continue;
						for(var bgpartnum=0;bgpartnum<findBgs[bgnum].parts;bgpartnum++){
							if(findBgs[bgnum].parts[bgpartnum].id == bgpartid){
								findBgPart = bgnum;
								break;
							}
						}
						if(findBgs[bgnum].parts[bgpartnum].visible==false) continue;
						if(findBgs[bgnum].parts[bgpartnum].dontSearch==true) continue;
						foundHtml = findCards[j].bgparts[bgpartid].text;
						text = foundHtml.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
						start = ((text+"").toLowerCase()).indexOf(findStr.toLowerCase());
						if(start!=-1){
							break;
						}
						//1カード内のbgpartsで複数候補がある場合に先頭しか採用されないバグがあるけど、まあいいや
					}
				}
				var start = ((text+"").toLowerCase()).indexOf(findStr.toLowerCase());
				if(start!=-1){
					//あったので、そのカードに移動してフィールドの文字を選択する
					if(j==findCardNum && k<findPart){
						//これはまだ、次候補ではないので次のパーツを探す
						continue;
					}
					if(j==findCardNum && k==findPart && start<=findStart){
						//パーツ内で次を探す
						var start2 = ((text+"").substring(findStart+1).toLowerCase()).indexOf(findStr.toLowerCase());
						if(start2==-1){
							continue;
						}
						start = findStart+1+start2;
					}
					findCardNum=j;
					findPart=k;
					findStart=start;
					innerGoCard(findCards[j]);

					setTimeout(function(){
						if(k<findCards[j].parts.length){
							var fldElems = document.getElementById('field-'+findCards[j].parts[k].id).childNodes;
						}else{
							fldElems = document.getElementById('bg-field-'+bgpartid).childNodes;
						}
						var cnt1 = 0;
						for(var i=0; i<fldElems.length && start > cnt1 + fldElems[i].textContent.length; i++){
							cnt1 += fldElems[i].textContent.length;
						}
						var cnt2 = cnt1;
						for(var m=i; m<fldElems.length && start+findStr.length > cnt2 + fldElems[m].textContent.length; m++){
							cnt2 += fldElems[m].textContent.length;
						}
						var elm = fldElems[i];
						if(!elm) return;
						if(elm.childNodes && elm.childNodes.length>0){
							var i2 = 0;
							elm = fldElems[i].childNodes[i2];
							while(i<fldElems.length && (!elm || !elm.textContent || elm.textContent.length<=start-cnt1)){
								/*console.log("--");
								console.log(fldElems[i]);
								console.log(elm);
								console.log("i:"+i);
								console.log("i2:"+i2);*/
								/*if(!elm){
									i++; i2=0;
									continue;
								}*/
								if(elm.textContent){
									cnt1+=elm.textContent.length;
								}
								i2++;
								while(!fldElems[i].childNodes[i2]){
									i++; i2=0;
									/*while(fldElems[i] && !fldElems[i].childNodes){
										i++;
									}*/
								}
								elm = fldElems[i].childNodes[i2];
							}
						}
						var elm2 = fldElems[m];
						if(elm2.childNodes && elm2.childNodes.length>0){
							var m2 = 0;
							elm2 = fldElems[m].childNodes[m2];
							while(!elm2.textContent || elm2.textContent.length<start+findStr.length-cnt2){
								elm2 = fldElems[m].childNodes[m2];
								if(!elm2){
									i++; i2=0;
									continue;
								}
								if(elm2.textContent){
									cnt2+=elm2.textContent.length;
								}
								m2++;
								elm2 = fldElems[m].childNodes[m2];
							}
						}

						var range = document.createRange();
						range.setStart(elm, start-cnt1);
						range.setEnd(elm2, start+findStr.length-cnt2);
						var sel = getSelection();
						sel.removeAllRanges();
						sel.addRange(range);

						if(elm){}
					},200);
					result = "";
					break loop;
				}
			}
		}
		if(result==""){
			if(findCardNum!=null && findPart<findCards[findCardNum].parts.length){
				var foundField = "card field "+findPart;
			}else{
				foundField = "bkgnd field "+findBgPart;
			}
			var foundChunk = "char "+(findStart+1)+((findStr.length>1)?(" to "+((findStart+1)+findStr.length-1)):"")+" of "+ foundField;
			var foundLine = "line "+getFoundLine(foundHtml, findStart)+" of "+foundField;
			var foundText = text.substring(findStart, findStr.length);
			var obj = {foundChunk:foundChunk, foundField:foundField, foundLine:foundLine, foundText:foundText, result:result};
			var arg = JSON.stringify(obj);
			mmsgSyncProperty("find", "find", arg);
		}
		else{
			findCardNum = null;
			findPart = null;
			findBgPart = null;
			findStart = null;
			var obj = {foundChunk:null, foundField:null, foundLine:null, foundText:null, result:result};
			var arg = JSON.stringify(obj);
			mmsgSyncProperty("find", "find", arg);
		}
	},100);
}

function getFoundLine(html, start){
	var html2 = html.replace(/<br>/g, "\n");
	var text = html2.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
	var lineCount = text.substring(0,start).split("\n").length;
	while(lineCount2!=lineCount){
		var lineCount2 = lineCount;
		lineCount = text.substring(0,start+lineCount2).split("\n").length;
	}
	return lineCount;
}

function flash(){
	//beepをどうやって鳴らそう。iOSェ
	document.getElementById('cardBack').style.opacity="0.5";
	var save = document.getElementById('page').style.background;
	document.getElementById('page').style.background="#000000";
	setTimeout(function(){
		document.getElementById('page').style.background=save;
		document.getElementById('cardBack').style.opacity="";
	},100);
}

//m
function menuBarVisible(v){
	document.getElementById("footer1").style.height = v?"":"0px";
	windowResize();
}

//p
function paletteCmd(plteData, point){
	var oldElm = document.getElementById("palette-"+plteData[1].name);
	if(oldElm){
		return;
	}
	var img = new Image();
	img.onload = function(){paletteLoad(plteData, point, img);};
	var rsrc = GetResource(plteData[1].id, "picture");
	if(!rsrc){
		rsrc = GetResourceById(plteData[1].pictureid, "picture");
	}
	img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file;
}
function paletteLoad(plteData, point, img){
	//すでにあれば戻る//削除
	var oldElm = document.getElementById("palette-"+plteData[1].name);
	if(oldElm){
		paletteVisible(plteData[1].name,true);
		return;
		//oldElm.parentNode.removeChild(oldElm);
	}

	//エレメントを追加
	var newElm = document.createElement('div');
	newElm.id = "palette-"+plteData[1].name;
	newElm.style.position = "absolute";
	newElm.style.boxShadow = "2px 4px 10px #000";
	newElm.style.borderRadius = "4px";
	document.getElementById('messageboxDiv').parentNode.insertBefore(newElm,document.getElementById('messageboxDiv'));

	var elmid = newElm.id;
	setTimeout(function(){$("#"+elmid).draggable();},0);

	//タイトルバー
	var title = document.createElement('div');
	title.className = "smallTitleBar";
	newElm.appendChild(title);

	//画像
	var imgElm = document.createElement('div');
	var width = img.width-plteData[1].horizontaloffset;
	var height = img.height-plteData[1].verticaloffset;
	imgElm.style.background = '#fff';
	imgElm.style.backgroundImage = 'url("'+img.src+'")';
	imgElm.style.borderRadius = "0px 0px 4px 4px";
	imgElm.style.backgroundPosition = -plteData[1].horizontaloffset-5+"px "+(-plteData[1].verticaloffset)+"px";
	if(width<=0||height<=0){
		width = img.width;
		height = img.height;
		imgElm.style.backgroundPosition = "";
	}
	imgElm.style.width = width+"px";
	imgElm.style.height = height+"px";
	newElm.appendChild(imgElm);

	//ボタン
	for(var i=2; i<plteData.length; i++){
		var dat = plteData[i][1];
		var btnElm = document.createElement('div');
		btnElm.style.position = "absolute";
		btnElm.style.width = dat.width+"px";
		btnElm.style.height = dat.height+"px";
		btnElm.style.left = dat.left-plteData[1].horizontaloffset+"px";
		btnElm.style.top = dat.top-plteData[1].verticaloffset+16+"px";
		(function(msg){
			btnElm.onclick = function(){sendCommand(currentCardObj,msg.toLowerCase());};
		})(dat.message.replace(/^\s+/, ""));
		btnElm.onmousedown = function(){this.style.background="#000";};
		btnElm.onmouseup = function(){this.style.background="";};
		btnElm.ontouchstart = function(){this.style.background="#000";};
		btnElm.ontouchend = function(){this.style.background="";};
		imgElm.appendChild(btnElm);
		btnElm = null;
	}

	var cardBack = document.getElementById("cardBack");
	if(!point){
		var left = cardBack.parentNode.offsetWidth/2 - width/getCardScale()/2;
		var top = cardBack.parentNode.offsetHeight-(height+16)/getCardScale();
		point = {x:left, y:top};
	}else if(point.indexOf(",")!=-1){
		point = {x:point.split(",")[0], y:point.split(",")[1]};
	}

	newElm.style.left = window.innerWidth/2+(-cardBack.parentNode.offsetWidth/2+point.x)*getCardScale() + "px";
	newElm.style.top = window.innerHeight/2+(-cardBack.parentNode.offsetHeight/2+point.y)*getCardScale() + "px";
	if(parseInt(newElm.style.left) + (width) > window.innerWidth){
		newElm.style.left = (document.getElementById("par").offsetWidth - (width)) + "px";
	}
	if(parseInt(newElm.style.left)<0){
		newElm.style.left = "0px";
	}
	if(parseInt(newElm.style.top) + (height+16) > window.innerHeight){
		newElm.style.top = (document.getElementById("par").offsetHeight - (height+16)) + "px";
	}
	if(parseInt(newElm.style.top)<0){
		newElm.style.top = "0px";
	}

	newElm = null;
	imgElm = null;
	title = null;
	cardBack = null;
}

function paletteVisible(name, prop, isRetry){
	var id = "palette-"+name;
	var elm = document.getElementById(id);
	if(!elm){
		id = "picture-"+name;
		elm = document.getElementById(id);
	}
	if(!elm){
		if(!isRetry){
			setTimeout(function(){paletteVisible(name,prop,true);},1000);
		}
		return;
	}
	elm.style.display = prop?"":"none";
}

function paletteLoc(name, point, isRetry){
	var id = "palette-"+name;
	var elm = document.getElementById(id);
	if(!elm){
		id = "picture-"+name;
		elm = document.getElementById(id);
	}
	if(!elm){
		if(!isRetry){
			setTimeout(function(){paletteLoc(name,point,true);},1000);
		}
		return;
	}

	var cardBack = document.getElementById("cardBack");
	var width = parseInt(elm.childNodes[0].style.width);
	var height = parseInt(elm.childNodes[0].style.height);
	elm.style.left = window.innerWidth/2+(-cardBack.parentNode.offsetWidth/2+point.x)*getCardScale()+width/2*(getCardScale()-1) + "px";
	elm.style.top = document.getElementById("par").offsetHeight/2+(-cardBack.parentNode.offsetHeight/2+point.y)*getCardScale()+height/2*(getCardScale()-1) + "px";
	if(parseInt(elm.style.top) + (height+16) > window.innerHeight){
		elm.style.top = (document.getElementById("par").offsetHeight - (height+16)) + "px";
	}
}

function pictureCmd(fileName, fileType, windowStyle, visible){
	var img = new Image();
	img.onload = function(){pictureLoad(fileName, windowStyle, visible, img);};
	if(fileType==null || fileType.toLowerCase()=="file"){
		img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(fileName);
	}
	else if(fileType.toLowerCase()=="resource"){
		var rsrc = GetResource(fileName, "picture");
		if(!rsrc){
			rsrc = GetResourceById(fileName, "picture");
		}
		if(!rsrc){
			console.log("resource not found: picture ("+fileName+")");
			return;
		}
		img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file;
	}
	else if(fileType.toLowerCase()=="clipboard"){
		console.log("Error: Unsupported - picture from clipboard");
	}
	else{
		console.log("Error: Unknown picture command file type");
	}
}

function pictureLoad(fileName, windowStyle, visible, img){
	windowStyle = (windowStyle+"").toLowerCase();

	//すでにあれば削除
	var oldElm = document.getElementById("picture-"+fileName);
	if(oldElm){
		oldElm.parentNode.removeChild(oldElm);
		oldElm = null;
	}

	//エレメントを追加
	var newElm = document.createElement('div');
	newElm.id = "picture-"+fileName;
	newElm.className = "Picture";
	newElm.style.display = visible?"":"none";
	newElm.style.position = "absolute";
	newElm.style['MozTransform'] = "scale("+getCardScale()+")";
	newElm.style['-webkit-transform'] = "scale("+getCardScale()+")";
	if(windowStyle=="zoom" || windowStyle=="plain" || windowStyle=="roundrect" || windowStyle=="windoid"){
		newElm.style.boxShadow = "2px 4px 10px #000";
		newElm.style.borderRadius = "4px";
		newElm.style.background = "#fff";
	}
	else if(windowStyle=="rect"){
		newElm.style.border = "1px solid #000";
		newElm.style.background = "#fff";
	}
	else if(windowStyle=="shadow"){
		newElm.style.boxShadow = "2px 4px 10px #000";
		newElm.style.background = "#fff";
	}
	else if(windowStyle=="dialog"){
		newElm.style.boxShadow = "2px 4px 10px #000";
		newElm.style.border = "3px ridge #cdf";
		newElm.style.background = "#fff";
	}
	document.getElementById('messageboxDiv').parentNode.insertBefore(newElm,document.getElementById('messageboxDiv'));

	//タイトルバー
	if(windowStyle=="zoom" || windowStyle=="plain" || windowStyle=="roundrect" || windowStyle=="windoid"){
		var title = document.createElement('div');
		if(windowStyle!="windoid"){
			title.innerHTML = fileName;
		}
		if(windowStyle=="roundrect"){
			title.style.background = "#000";
			title.style.color = "#fff";
			title.style.textShadow = "0px 1px 0px #000";
		}
		title.className = "smallTitleBar";
		newElm.appendChild(title);

		var closeBox = document.createElement('a');
		closeBox.className = "closeBox";
		closeBox.onclick = function(){
			var elm = document.getElementById("picture-"+fileName);
			elm.parentNode.removeChild(elm);
		};
		title.appendChild(closeBox);

		(function(id){
			setTimeout(function(){$("#"+id).draggable();},0);
		})(newElm.id);
	}

	//画像
	var imgElm = document.createElement('div');
	var width = img.width;
	var height = img.height;
	imgElm.style.width = width+"px";
	imgElm.style.height = height+"px";
	imgElm.style.background = '#fff';
	imgElm.style.backgroundImage = 'url("'+img.src+'")';
	if(newElm.style.borderRadius == "4px"){
		imgElm.style.borderRadius = "0px 0px 4px 4px";
	}
	newElm.appendChild(imgElm);

	//メッセージ
	imgElm.onmousedown = function(e){sendEvent(currentCardObj,"mousedowninpicture",[fileName,{x:e.offsetX,y:e.offsetY}]);};
	imgElm.onmouseup = function(e){sendEvent(currentCardObj,"mouseupinpicture",[fileName,{x:e.offsetX,y:e.offsetY}]);};
	imgElm.ontouchstart = function(e){sendEvent(currentCardObj,"mousedowninpicture",[fileName,{x:e.offsetX,y:e.offsetY}]);};
	imgElm.ontouchend = function(e){sendEvent(currentCardObj,"mouseupinpicture",[fileName,{x:e.offsetX,y:e.offsetY}]);};

	//位置
	var cardBack = document.getElementById("cardBack");
	{
		var left = cardBack.parentNode.offsetWidth/2-width/2;
		var top = cardBack.parentNode.offsetHeight/2-height/2;
		var point = {x:left, y:top};
	}

	newElm.style.left = window.innerWidth/2+(-cardBack.parentNode.offsetWidth/2+point.x/getCardScale()) + "px";
	newElm.style.top = window.innerHeight/2+(-cardBack.parentNode.offsetHeight/2+point.y/getCardScale()) + "px";
	if(parseInt(newElm.style.top) + (height+16) > window.innerHeight){
		newElm.style.top = (document.getElementById("par").offsetHeight - (height+16)) + "px";
	}

	newElm = null;
	imgElm = null;
	closeBox = null;
	title = null;
	cardBack = null;
}

var audioRsrc = {};
var gAudioContext = window.webkitAudioContext?new webkitAudioContext():null;
var gSoundSource;
var gDebugSound = true;

function playCmd(str){
	var strAry = str.split(" ");
	var soundName = strAry[0].toLowerCase();

	if(soundName=="stop"){
		if(window.webkitAudioContext!=null){
			if(gSoundSource) gSoundSource.noteOff(0);
			return;
		}else{
			var audio = audioRsrc[(strAry[1]+"").toLowerCase()];
			if(audio) audio.pause();
			return;
		}
	}

	if(!gDebugSound) return;
	
	var url = "";
	var rsrc = GetResource(soundName, "sound");
	if(!rsrc){
		rsrc = GetResourceById(soundName, "sound");
	}
	if(rsrc){ 
		url = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file;
		url = url.replace(/.aiff$/,".wav");
	}else{
		url = "snd/"+encodeURI(soundName)+".mp3";
	}

	if(window.webkitAudioContext!=null){
		if(audioRsrc[soundName]){
			//音声データはすでにある場合
			playWAA(soundName, str);
		}
		else{
			//XHRで読み込む
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';
			request.send();

			request.onload = function(){
				gAudioContext.decodeAudioData(request.response, function(buffer){
					audioRsrc[soundName] = buffer;
					playWAA(soundName, str);
				});
				request.abort();
			};
		}
	}
	else{
		//すでにあればplay
		if(audioRsrc[soundName]){
			playLoad(str);
			return;
		}

		//エレメントを追加
		var audio = new Audio("");
		audio.autoplay = false;
		setTimeout(function(){playLoad(str);},0);
		if(audio.canPlayType && !audio.canPlayType("audio/mpeg")){url.replace(".mp3",".ogg");}
		audio.src = url;
		audioRsrc[soundName] = audio;
	}
}

function playLoad(str){
	var strAry = str.split(" ");
	var soundName = strAry[0].toLowerCase();

	playSnd(soundName);
}

function playSnd(soundName, ary){
	var audio = audioRsrc[soundName];
	audio.load();
	audio.play();
	//mmsgSyncProperty("system","playingSound",soundName);
	audio.addEventListener("ended", function(){
		mmsgSyncProperty("system","playingSound","");
	}, false);
}

function playWAA(soundName, str){
	var strAry = str.split(" ");

	//play文のフォーマットに従って演奏する
	var defaultCode = 48;
	var tempo = 120;
	var time = 0;
	var reg = /([a-grA-GR]{0,1})([#b]{0,1})([0-7]{0,1})([whqestx]{0,1})([3]{0,1}[\\.]*)([pf]{0,2})[ ]*/i;
	for(var i=1; i<strAry.length; i++){
		if(strAry[i].toLowerCase()=="tempo"){
			i++;
			tempo = strAry[i]-0;
			if(typeof tempo!="number") tempo=120;
			continue;
		}
		var notes = reg.exec(strAry[i]);
		var ret = playWAAPlay(soundName, notes, time, tempo, defaultCode);
		time = ret.time;
		defaultCode = ret.defaultCode;
		//mmsgSyncProperty("system","playingSound",soundName);
		setTimeout(function(){
			mmsgSyncProperty("system","playingSound","");
		},time);
	}

	if(strAry.length==1){
		var source = gAudioContext.createBufferSource();
		gSoundSource = source;
		source.buffer = audioRsrc[soundName];
		source.connect(gAudioContext.destination);
		source.noteOn(0);
		//mmsgSyncProperty("system","playingSound",soundName);
		time = source.buffer.length/source.buffer.sampleRate*1000;
		setTimeout(function(){
			mmsgSyncProperty("system","playingSound","");
		},time);
	}
}

var note_freq = [];
function setNoteFreq() {
	// 半音(2の12乗根)を計算
	var r = Math.pow(2.0, 1.0 / 12.0);
	note_freq[0] = 1.0;
	for (var i = 1; i < 12; i++) {
		note_freq[i] = note_freq[i-1] * r;
	}
	for (var i = 12; i < 96; i++) {
		note_freq[i] = note_freq[i-12] * 2.0;
	}
}

function playWAAPlay(soundName, notes, time, tempo, defaultCode){
	if(note_freq[0]!=1.0) setNoteFreq();
	var source = gAudioContext.createBufferSource();

	notes[6] = notes[6].toLowerCase();
	if(notes[6]=="p"){
		//gainのコントロールをしたい
	}
	else if(notes[6]=="f"){
		//gainのコントロールをしたい
	}
	if(notes[5].indexOf("3")!=-1){
		//3連符なので関数をあと2回呼ぶ
		if(notes[5].indexOf("....")!=-1) notes[5] = "....";
		else if(notes[5].indexOf("...")!=-1) notes[5] = "...";
		else if(notes[5].indexOf("..")!=-1) notes[5] = "..";
		else if(notes[5].indexOf(".")!=-1) notes[5] = ".";
		time = playWAAPlay(soundName, notes, time, tempo, defaultCode).time;
		time = playWAAPlay(soundName, notes, time, tempo, defaultCode).time;
	}

	//長さ計算(秒)
	var length = 0.0;
	notes[4] = notes[4].toLowerCase();
	if(notes[4]=="w") length = 240.0/tempo;
	else if(notes[4]=="h") length = 120.0/tempo;
	else if(notes[4]=="q") length = 60.0/tempo;
	else if(notes[4]=="e") length = 30.0/tempo;
	else if(notes[4]=="s") length = 15.0/tempo;
	else if(notes[4]=="t") length = 7.5/tempo;
	else if(notes[4]=="x") length = 3.75/tempo;
	else if(notes[1]!="") length = 60.0/tempo;
	if(notes[5]=="....") length *= 1.5*1.5*1.5*1.5;
	if(notes[5]=="...") length *= 1.5*1.5*1.5;
	if(notes[5]=="..") length *= 1.5*1.5;//1.75倍じゃないようだ。
	if(notes[5]==".") length *= 1.5;

	//音程
	var code = 0;
	notes[1] = notes[1].toLowerCase();
	if(notes[1]=="r") code = -1;
	else{
		if(notes[1]=="c") code = 0;
		else if(notes[1]=="d") code = 2;
		else if(notes[1]=="e") code = 4;
		else if(notes[1]=="f") code = 5;
		else if(notes[1]=="g") code = 7;
		else if(notes[1]=="a") code = 9;
		else if(notes[1]=="b") code = 11;
		if(notes[2]=="#") code += 1;
		if(notes[2]=="b") code -= 1;
		if(notes[3]=="") code += defaultCode;
		else {
			code += 12*notes[3];
			defaultCode = 12*notes[3];
		}
	}

	setTimeout(function(){
		if(code==-1){
			source.noteOff(0);
		}
		else{
			source.buffer = audioRsrc[soundName];
			source.connect(gAudioContext.destination);
			if(note_freq[code]){
				source.playbackRate.value = note_freq[code]/note_freq[48];
			}
			source.noteOn(0);
		}
	},time);
	time += length*1000;
	return {time:time, defaultCode:defaultCode};
}
//r
function resetMenubar(){
	resetMenubarInit();
	changeMenuTitles(browseMenus);
}

//s
function selectLineCmd(obj,line){
	if(obj && obj.type=="field"){
		//行反転
		var oelm = document.getElementById((obj.parent=="background"?"bg-":"")+"field-"+obj.id);
		var textAry = oelm.innerHTML.replace(/\<[\/]*span[^\>]*\>/g,"").split("<br>");
		/*if(obj.lockText){
			oelm.innerHTML = "<span>"+textAry.join("</span><br><span>")+"</span>";
			oelm.childNodes[(line-1)*2].style.cssText += ";padding-right:100%;background-color:#24D;background:-webkit-gradient(linear,left top,left bottom,from(#68f),to(#24d));color:#FFF;";
			//document.body.style.cssText = "div"+":nth-child("+line+"){color:#00F;}";
			system.selectedtext = oelm.innerHTML.replace(/\<[\/]*span[^\>]*\>/g,"").split("<br>")[line];
		}
		else*/{
			system.selectedtext = oelm.innerHTML.replace(/\<[\/]*span[^\>]*\>/g,"").split("<br>")[line-1];
			mmsgSyncProperty("system", "selectedtext", system.selectedtext);

			var findStr = textAry[line]+"";
			var start = 0;
			if(line-1>0) start = textAry.slice(0,line-1).join("").length;

			var fldElems = oelm.childNodes;
			var cnt1 = 0;
			for(var i=0; i<fldElems.length && start > cnt1 + fldElems[i].textContent.length; i++){
				cnt1 += fldElems[i].textContent.length;
			}
			var cnt2 = cnt1;
			for(var m=i; m<fldElems.length && start+findStr.length > cnt2 + fldElems[m].textContent.length; m++){
				cnt2 += fldElems[m].textContent.length;
			}
			var elm = fldElems[i];
			if(!elm) return;
			if(elm.childNodes && elm.childNodes.length>0){
				var i2 = 0;
				elm = fldElems[i].childNodes[i2];
				while(i<fldElems.length && (!elm || !elm.textContent || elm.textContent.length<=start-cnt1)){
					if(elm.textContent){
						cnt1+=elm.textContent.length;
					}
					i2++;
					while(!fldElems[i].childNodes[i2]){
						i++; i2=0;
					}
					elm = fldElems[i].childNodes[i2];
				}
			}
			var elm2 = fldElems[m];
			if(elm2 && elm2.childNodes && elm2.childNodes.length>0){
				var m2 = 0;
				elm2 = fldElems[m].childNodes[m2];
				while(!elm2.textContent || elm2.textContent.length<start+findStr.length-cnt2){
					elm2 = fldElems[m].childNodes[m2];
					if(!elm2){
						i++; i2=0;
						continue;
					}
					if(elm2.textContent){
						cnt2+=elm2.textContent.length;
					}
					m2++;
					elm2 = fldElems[m].childNodes[m2];
				}
			}

			if(obj.lockText){
				var oldelm = oelm.getElementsByClassName("select");
				if(oldelm && oldelm[0]) oelm.removeChild(oldelm[0]);

				var textheight = obj.textHeight;
				var offset = -textheight/2;
				var svgStr = "<svg class=select style='position:absolute;left:0px;top:0px;z-index:-1;' width="+obj.width+" height="+Math.max(obj.height,textAry.length*textheight)+" "+
				"xmlns=\"http://www.w3.org/2000/svg\""+
				"xmlns:xlink=\"http://www.w3.org/1999/xlink\">";
				svgStr+="<line x1=0 y1="+(textheight*line+offset)+" x2=1000 y2="+(textheight*line+offset)+" stroke=#8ad stroke-width="+textheight+" />";
				svgStr+="</svg>";
				oelm.innerHTML += svgStr;
				//プロパティ反映
				obj.selectedLine = line;
				mmsgSyncProperty("objpropchange", "selectedLine",  JSON.stringify({type:obj.type, id:obj.id, parent:obj.parent, parentId:obj.parentId, value:obj.selectedLine}));
			}else{
				var range = document.createRange();
				range.setStart(elm, start-cnt1);
				range.setEnd(elm2, start+findStr.length-cnt2);
				var sel = getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				//プロパティ反映
				obj.selectedLine = 0;
				mmsgSyncProperty("objpropchange", "selectedLine",  JSON.stringify({type:obj.type, id:obj.id, parent:obj.parent, parentId:obj.parentId, value:obj.selectedLine}));
			}
		}
	}
	else{
		system.selectedtext = "";
		mmsgSyncProperty("system", "selectedtext", system.selectedtext);
	}
}

//XCMD
function addColorRemove(){
	var addelm = document.getElementById("addcolor");
	if(addelm){
		addelm.parentNode.removeChild(addelm);
	}
}

function addColorObjEnabled(id, v){
	var addelm = document.getElementById("addcolor");
	if(addelm){
		addelm.parentNode.removeChild(addelm);
	}
}

function addColorCard(effect, time, parentType){
	var addelm = document.getElementById("addcolor");
	if(!addelm){
		addColorInstall();
		addelm = document.getElementById("addcolor");
	}

	var ctx = addelm.getContext('2d');

	var data = addcolorData.cd[currentCardObj.id];
	if(!data){
		ctx.clearRect(0,0,parseInt(addelm.width),parseInt(addelm.height));
		return;
	}

	for(var i=2; i<data.length; i++){
		if(data[i][0]=="addcolorobject"){
			var o = data[i][1];
			if(o.type=="picture"){
				//PICTを描画
				if(o.visible!="false"){
					(function(o){
						var rsrc=GetResource(o.name,"picture");
						if(!rsrc)rsrc=GetResourceById(o.name,"picture");
						if(!rsrc) return;
						var img = new Image();
						img.onload = function(){
							ctx.drawImage(img, o.left, o.top, o.width, o.height);
							//o.transparent
						};
						img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file;
					})(o);
				}
			}
			else if(o.type=="button"){
				if(o.visible!="false"){
					var dataAry = (parentType=="cd")?currentCardObj.parts:currentBgObj.parts;
					var btn = findPartsById(o.id,dataAry,"button");
					if(btn.visible){
						ctx.fillStyle = "rgba("+o.red+", "+o.green+", "+o.blue+",0.4)";
						ctx.fillRect(btn.left, btn.top, btn.width, btn.height);
						ctx.strokeStyle = "rgb("+Math.max(0,o.red-20)+", "+Math.max(0,o.green-20)+", "+Math.max(0,o.blue-20)+")";
						ctx.strokeRect(btn.left, btn.top, btn.width, btn.height);
					}
				}
			}
			else if(o.type=="field"){
				if(o.visible!="false"){
					var dataAry = (parentType=="cd")?currentCardObj.parts:currentBgObj.parts;
					var fld = findPartsById(o.id,dataAry,"field");
					if(fld.visible){
						ctx.fillStyle = "rgba("+o.red+", "+o.green+", "+o.blue+",0.4)";
						ctx.fillRect(fld.left, fld.top, fld.width, fld.height);
						ctx.strokeStyle = "rgb("+Math.max(0,o.red-20)+", "+Math.max(0,o.green-20)+", "+Math.max(0,o.blue-20)+")";
						ctx.strokeRect(fld.left, fld.top, fld.width, fld.height);
					}
				}
			}
			else{
				console.log(o.type);
				console.log(o);
			}
		}
	}
}

function addColorPict(pict, p, r, paintmode, effect, time){
	//console.log("addColorPict");

	//PICTを描画
	var rsrc=GetResource(pict,"picture");
	if(!rsrc)rsrc=GetResourceById(pict,"picture");
	//console.log(rsrc);
	if(!rsrc) return;
	var img = new Image();
	img.onload = function(){
		var addelm = document.getElementById("addcolor");
		if(!addelm){
			//console.log("addColorInstall");
			addColorInstall();
			addelm = document.getElementById("addcolor");
		}
		var ctx = addelm.getContext('2d');
		//console.log("p:"+p+" r:"+r);
		if(p){
			//console.log(p);
			ctx.drawImage(img, p.x, p.y);
		}
		else if(r){
			//console.log(r);
			ctx.drawImage(img, r.x, r.y, r.width, r.height);
		}

		addelm.style['MozTransition'] = "all "+(time/60)+"s ease-in";
		addelm.style['-webkit-transition'] = "all "+(time/60)+"s ease-in";
	};
	img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file;
}

function addColorInstall(){
	var addelm = document.createElement("canvas");
	addelm.id = "addcolor";
	addelm.width = stackData1.width;
	addelm.height = stackData1.height;
	addelm.style.position = "absolute";
	addelm.style.left = "0px";
	addelm.style.top = "0px";
	addelm.onmousedown = function(){imgMouseDown(event);};
	addelm.onmouseup = function(){imgMouseUp(event);};
	addelm.ontouchstart = function(){event.preventDefault();imgMouseDown(event);};
	addelm.ontouchend = function(){event.preventDefault();imgMouseUp(event);};
	var cardBack = document.getElementById("nextCardBack");
	if(!cardBack) cardBack = document.getElementById("cardBack");
	cardBack.appendChild(addelm);
}

function UxBack(mode,opt1,opt2){
	//UxBack "Black"
	//UxBack 65535*MIN((the ticks - TIMEX)/120,1)
	//UxBack "ICON",1010+N,2
	//UxBack "ppat","裏"
	//UxBack close
	var page = document.getElementById('page');
	mode = (mode+"").toLowerCase();
	if(mode=="icon"){
		var rsrc=GetResource(opt1,"icon");
		if(!rsrc)rsrc=GetResourceById(opt1,"icon");
		if(rsrc){
			var src = "url(getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file+")";
			page.style.background = src;
			if(opt2&&opt2!=""){
				page.style['background-size'] = (opt2*32)+"px "+(opt2*32)+"px";
				page.style['-webkit-background-size'] = (opt2*32)+"px "+(opt2*32)+"px";
			}
		}
	}else if(mode=="close"){
		page.style.background = "";
	}else if(mode=="ppat"){
		var rsrc=GetResource(opt1,"ppat");
		if(!rsrc)rsrc=GetResourceById(opt1,"ppat");
		if(rsrc){
			var src = "url(getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file+")";
			page.style.background = src;
		}
	}else if(mode.match(/^[0-9]+$/)){
		var c = mode/256;
		page.style.background = "#"+c+c+c;
	}else if(mode.match(/^[a-z]+$/)){
		page.style.background = mode;
	}
}


var PgColorXElm = [];

function newPgColorXBuf(port, size, pict){
	//console.log("newPgColorXBuf port:"+port+" size:"+size+" pict:"+pict);

	if(port==null){
		mmsgSyncProperty("img", "", "");
		return;
	}

	if(port==-1){
		var addelm = document.getElementById("addcolor");
		if(!addelm){
			addColorInstall();
			addelm = document.getElementById("addcolor");
		}
		var canvas = addelm;
	}else{
		if(!PgColorXElm[port]){
			PgColorXElm[port] = document.createElement("canvas");
		}
		canvas = PgColorXElm[port];
		//console.log(canvas);
	}

	if(pict){
		//PICTを描画
		var ctx = canvas.getContext('2d');
		var rsrc=GetResource(pict,"picture");
		if(!rsrc)rsrc=GetResourceById(pict,"picture");
		//console.log(rsrc);
		if(!rsrc) {
			mmsgSyncProperty("img", "", "");
			return;
		}
		var img = new Image();
		img.onload = function(){
			//console.log("p:"+p+" r:"+r);
			if(size && !size.width){
				//console.log(p);
				ctx.drawImage(img, size.x, size.y);
			}
			else if(size){
				ctx.drawImage(img, size.x, size.y, size.width, size.height);
			}
			else{
				canvas.width = img.width;
				canvas.height = img.height;
				ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);
			}
			mmsgSyncProperty("img", "", "");
		};
		img.onerror = function(){
			mmsgSyncProperty("img", "", "");
		};
		img.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+rsrc.file;
	}
	else{
		//sizeの大きさのcanvasを確保
		canvas.width = size.x;
		canvas.height = size.y;
		//console.log(canvas.width +","+ canvas.height);
	}
}

function PgColorXCopyBits(srcPort, dstPort, srcRect, dstRect, mode, tile){
	//console.log("PgColorXCopyBits srcPort:"+srcPort+" dstPort:"+dstPort+" tile:"+tile+" srcRect:"+srcRect+" dstRect:"+dstRect+" mode:"+mode);

	if(srcPort==-1){
		var addelm = document.getElementById("addcolor");
		if(!addelm){
			addColorInstall();
			addelm = document.getElementById("addcolor");
		}
		var srcCanvas = addelm;
	}else{
		if(!PgColorXElm[srcPort]){
			//console.log("PgColorXCopyBits srcPort("+srcPort+") is none.");
			return;
		}
		srcCanvas = PgColorXElm[srcPort];
	}

	if(dstPort==-1){
		var addelm = document.getElementById("addcolor");
		if(!addelm){
			addColorInstall();
			addelm = document.getElementById("addcolor");
		}
		var dstCanvas = addelm;
	}else{
		if(!PgColorXElm[dstPort]){
			//console.log("PgColorXCopyBits dstPort("+dstPort+") is none.");
			return;
		}
		dstCanvas = PgColorXElm[dstPort];
	}

	if(!srcRect){
		srcRect = {x:0, y:0, width:srcCanvas.width, height:srcCanvas.height};
	}
	else if(!srcRect.width){
		srcRect.width = srcCanvas.width;
		srcRect.height = srcCanvas.height;
	}

	if(!dstRect){
		dstRect = {x:0, y:0, width:srcCanvas.width, height:srcCanvas.height};
	}
	else if(!dstRect.width){
		dstRect.width = srcCanvas.width;
		dstRect.height = srcCanvas.height;
	}

	if((mode+"").toLowerCase()=="transparent" && !srcCanvas.isTransparent){
		//イメージの白色部分のアルファ値をゼロにする
		srcCanvas.isTransparent = true;
		var sctx = srcCanvas.getContext('2d');
		var width = srcCanvas.width;
		var height = srcCanvas.height;
		var data = sctx.getImageData(0, 0, srcCanvas.width, height);
		for(var y=0; y<height; y++){
			for(var x=0; x<width; x++){
				if(data[y*4*width+4*x+0]==255 && data[y*4*width+4*x+1]==255 && data[y*4*width+4*x+2]==255){
					data[y*4*width+4*x+3] = 0;
				}
			}
		}
		sctx.putImageData(data, 0, 0);
	}

	var ctx = dstCanvas.getContext('2d');
	ctx.drawImage(srcCanvas, srcRect.x, srcRect.y, srcRect.width, srcRect.height, dstRect.x, dstRect.y, dstRect.width, dstRect.height);
}



function PgColorXDrawString(port, text, topleft, color, mode, font, fontsize, fontstyle){
	//console.log("PgColorXDrawString port:"+port+" text:"+text+" topleft:"+topleft+" color:"+color+" mode:"+mode);
	//console.log("　 font:"+font+" fontsize:"+fontsize+" fontstyle:"+fontstyle);

	if(port==-1){
		var addelm = document.getElementById("addcolor");
		if(!addelm){
			addColorInstall();
			addelm = document.getElementById("addcolor");
		}
		var canvas = addelm;
	}else{
		if(!PgColorXElm[port]){
			//console.log("PgColorXCopyBits srcPort("+srcPort+") is none.");
			return;
		}
		canvas = PgColorXElm[port];
	}

	if(!topleft){
		topleft = {x:0, y:0};
	}

	var ctx = canvas.getContext('2d');
	if(color) ctx.fillStyle = color;
	if(font || fontsize || fontstyle){
		if(!font) font = "sans-serif";
		if(!fontsize) fontsize = 12;
		if(!fontstyle) fontstyle = "";
		if(fontstyle=="plain") fontstyle = "";
		ctx.font = fontstyle+" "+fontsize+"px '"+font+"', sans-serif";
	}
	if(!fontsize) fontsize = 12;
	ctx.fillText(text, topleft.x, topleft.y+fontsize+2);
}

var ajaxGetCommandObj;
function ajaxGetCommand(url, postdata){
	if(ajaxGetCommandObj && ajaxGetCommandObj.abort){
		ajaxGetCommandObj.abort();
	}
	ajaxGetCommandObj = createXMLHttpRequest(ajaxGetResponse);
	if(ajaxGetCommandObj){
		ajaxGetCommandObj.loadCount = 0;
		ajaxGetCommandObj.open((postdata==null)?"GET":"POST",url,true);
		ajaxGetCommandObj.send(postdata);
	}
	else{
		mmsgSyncProperty("ajaxget", "", "Error: Can't start XMLHttpRequest");
	}
}

function ajaxGetResponse(){
	if(ajaxGetCommandObj.readyState == 4){
		if(ajaxGetCommandObj.status==200){
			mmsgSyncProperty("ajaxget", "", ajaxGetCommandObj.responseText);
		}else{
			mmsgSyncProperty("ajaxget", "", "Error: status("+ajaxGetCommandObj.status+")");
		}
	}
}

