"use strict";

authoringInit();

var tbSelectedButton;
var tbSelectedField;
var tbDownPoint = {};
//var tbDragObj = null;
var tbOverObj = null;
var selectedTool = 'browse';

function authoringInit(){
	var divs = document.getElementsByTagName("div");
	for(var i=0; i<divs.length; i++){
		if(divs[i].id.match(/btn-plt-.*/)){
			divs[i].onmouseover = function(){this.style.border="1px solid #048";};
			divs[i].onmousedown = function(){this.style.width="96px";this.style.height="22px";this.style.marginLeft=event.offsetX-3+"px";this.style.marginTop=event.offsetY-3+"px";};
			divs[i].onmouseout = function(){this.style.width="40px";this.style.height="40px";this.style.margin="0px 0px 0px 0px";this.style.borderWidth="0px";};
			divs[i].ontouchend = function(){this.style.width="40px";this.style.height="40px";this.style.margin="0px 0px 0px 0px";this.style.borderWidth="0px";};
		}
		if(divs[i].id.match(/fld-plt-.*/)){
			divs[i].onmouseover = function(){this.style.border="1px solid #048";};
			divs[i].onmousedown = function(){this.style.width="64px";this.style.height="64px";this.style.marginLeft=event.offsetX-3+"px";this.style.marginTop=event.offsetY-3+"px";};
			divs[i].onmouseout = function(){this.style.width="60px";this.style.height="60px";this.style.margin="0px 0px 0px 0px";this.style.borderWidth="0px";};
			divs[i].ontouchend = function(){this.style.width="60px";this.style.height="60px";this.style.margin="0px 0px 0px 0px";this.style.borderWidth="0px";};
		}
	}
	divs = null;
}

var authBtnDownTimer;
var buttonDef2 = {
		returnFunc:function(){ return false; },
		contextmenu:function(){ return false; },

		mouseDownTrans:function(event,tgt){
			tbSelectedButton=tgt;
			var tgtobj = document.getElementById(tgt);
			tbDownPoint.x = event.pageX - tgtobj.offsetLeft - tgtobj.parentNode.offsetLeft - tgtobj.parentNode.parentNode.offsetLeft;
			tbDownPoint.y = event.pageY - tgtobj.offsetTop - tgtobj.parentNode.offsetTop - tgtobj.parentNode.parentNode.offsetTop;
			tbDownPoint.x = (tbDownPoint.x - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
			tbDownPoint.y = (tbDownPoint.y - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;
			tbDownPoint.inbtnx = event.pageX;
			tbDownPoint.inbtny = event.pageY;
			tbDownPoint.offsetLeft = tgtobj.offsetLeft;
			tbDownPoint.offsetTop = tgtobj.offsetTop;
			tbDownPoint.offsetWidth = tgtobj.offsetWidth;
			tbDownPoint.offsetHeight = tgtobj.offsetHeight;
			tbDownPoint.rightClick=((event.button&2)>0 || event.ctrlKey&&isMacOS);//右クリック
			if(tbDownPoint.rightClick){
				//右クリックメニュー表示
				//var data = getBtnData(tgt);
				//var type = tgt.match(/^bg/)?"bg":"card";
				//var baseid = type=="bg"?currentCardObj.background:currentCardObj.id;
				//owPartPop("ow"+type+baseid+"button"+data.id);
				tbSelectedButton=undefined;
			}
			else{
				tbDragObj = tgtobj;
			}
			if(authBtnDownTimer){
				clearTimeout(authBtnDownTimer);
				authBtnDownTimer = null;
			}
			authBtnDownTimer = setTimeout(showBtnAnchor,600);
			hideBtnAnchor();
			return false;
		},
		mouseOverTrans:function(event,tgt){
			if(document.getElementById(tgt)==null) return;
			if(tgt.match('btn-plt-')) return;
			if(tgt.match('button-nav-')) return;
			if(tbDragObj!=null) return;
			document.getElementById(tgt).style.outline = "2px dotted #88f";
			tbOverObj = document.getElementById(tgt);
			//object window
			var data = getBtnData(tgt);
			var type = tgt.match(/^bg/)?"bg":"card";
			var baseid = type=="bg"?currentCardObj.background:currentCardObj.id;
			var elm = document.getElementById("ow"+type+baseid+"button"+data.id);
			if(elm){
				elm.style.color="#448";
				elm.style.backgroundColor="#ddf";
			}
			return false;
		},
		mouseOutTrans:function(event,tgt){
			if(document.getElementById(tgt)==null) return;
			if(tbDragObj==null){
				document.getElementById(tgt).style.outline = "";
				if(tbOverObj!=null) tbOverObj.style.cursor = "pointer";
				tbOverObj = null;
			}
			//object window
			var data = getBtnData(tgt);
			var type = tgt.match(/^bg/)?"bg":"card";
			var baseid = type=="bg"?currentCardObj.background:currentCardObj.id;
			var elm = document.getElementById("ow"+type+baseid+"button"+data.id);
			if(elm){
				elm.style.color="#000";
				elm.style.backgroundColor="#fff";
			}
			if(authBtnDownTimer){
				clearTimeout(authBtnDownTimer);
				authBtnDownTimer = null;
			}
			return false;
		},
		mouseUpTrans:function(event,tgtid){
			if(tbSelectedButton==tgtid){
				tbDragObj = null;
				if((event.pageX - tbDownPoint.inbtnx)==0 && (event.pageY - tbDownPoint.inbtny)==0){
					if(!document.getElementById("anchor-0")){
						if(tbDownPoint.rightClick){
						}
						else{
							//情報ダイアログ表示
							showButtonInfo(tgtid);
						}
						tbOverObj = null;
					}
				}
				else if(!document.getElementById("anchor-0")){
					var data = getBtnData(tgtid);
					var btn = document.getElementById(tgtid);
					data.left = btn.style.left.match("[-0-9]*");
					data.top = btn.style.top.match("[-0-9]*");
					data.width = btn.style.width.match("[-0-9]*");
					data.height = btn.style.height.match("[-0-9]*");
					changeObject2(data,null);
					//changedStack = true;
					//saveStackData();
					//mmsgSendStackObj();
				}
				return false;
			}
		},
		hiliteTrans:function(){},
		unhiliteTrans:function(){},

		mouseDownRect:function(event,tgt){return this.mouseDownTrans(event,tgt);},
		mouseOverRect:function(event,tgt){return this.mouseOverTrans(event,tgt);},
		mouseOutRect:function(event,tgt){return this.mouseOutTrans(event,tgt);},
		mouseUpRect:function(event,tgt){return this.mouseUpTrans(event,tgt);},
		hiliteRect:function(){},
		unhiliteRect:function(){},

		mouseDownRRect:function(event,tgt){return this.mouseDownTrans(event,tgt);},
		mouseOverRRect:function(event,tgt){return this.mouseOverTrans(event,tgt);},
		mouseOutRRect:function(event,tgt){return this.mouseOutTrans(event,tgt);},
		mouseUpRRect:function(event,tgt){return this.mouseUpTrans(event,tgt);},
		hiliteRRect:function(){},
		unhiliteRRect:function(){},

		mouseDownStandard:function(event,tgt){return this.mouseDownTrans(event,tgt);},
		mouseOverStandard:function(event,tgt){return this.mouseOverTrans(event,tgt);},
		mouseOutStandard:function(event,tgt){return this.mouseOutTrans(event,tgt);},
		mouseUpStandard:function(event,tgt){return this.mouseUpTrans(event,tgt);},
		hiliteStandard:function(){},
		unhiliteStandard:function(){},
}; //buttonDef2

var fieldDef2 = {
		returnFunc:function(){ return false; },
		contextmenu:function(){ return false; },
		focus:function(event,tgt){},
		blur:function(event,tgt){},

		mouseDownStandard:function(event,tgt){
			tbSelectedField=tgt;
			var tgtobj = document.getElementById(tgt);
			tbDownPoint.x = event.pageX - tgtobj.offsetLeft - tgtobj.parentNode.offsetLeft - tgtobj.parentNode.parentNode.offsetLeft;
			tbDownPoint.y = event.pageY - tgtobj.offsetTop - tgtobj.parentNode.offsetTop - tgtobj.parentNode.parentNode.offsetTop;
			tbDownPoint.x = (tbDownPoint.x - $('#par').width()/2)/getCardScale()+$('#cardBack').width()/2;
			tbDownPoint.y = (tbDownPoint.y - $('#par').height()/2 - getCardTop())/getCardScale()+$('#cardBack').height()/2;
			tbDownPoint.inbtnx = event.pageX;
			tbDownPoint.inbtny = event.pageY;
			tbDownPoint.offsetLeft = tgtobj.offsetLeft;
			tbDownPoint.offsetTop = tgtobj.offsetTop;
			tbDownPoint.offsetWidth = tgtobj.offsetWidth;
			tbDownPoint.offsetHeight = tgtobj.offsetHeight;
			tbDownPoint.rightClick=((event.button&2)>0 || event.ctrlKey&&isMacOS);//右クリック
			if(tbDownPoint.rightClick){
				//右クリックメニュー表示
				//var data = getFldData(tgt);
				//var type = tgt.match(/^bg/)?"bg":"card";
				//var baseid = type=="bg"?currentCardObj.background:currentCardObj.id;
				//owPartPop("ow"+type+baseid+"field"+data.id);
				tbSelectedField=undefined;
			}
			else{
				tbDragObj = tgtobj;
			}
			if(authBtnDownTimer){
				clearTimeout(authBtnDownTimer);
				authBtnDownTimer = null;
			}
			authBtnDownTimer = setTimeout(showBtnAnchor,600);
			hideBtnAnchor();
			return false;
		},
		mouseOverStandard:function(event,tgt){
			if(document.getElementById(tgt)==null) return;
			if(tgt.match('fld-plt-')) return;
			if(tbDragObj!=null) return;
			document.getElementById(tgt).style.outline = "2px dotted #88f";	 
			tbOverObj = document.getElementById(tgt);
			return false;
		},
		mouseOutStandard:function(event,tgt){
			if(document.getElementById(tgt)==null) return;
			if(tbDragObj==null){
				document.getElementById(tgt).style.outline = "";
				if(tbOverObj!=null){
					tbOverObj.style.cursor = "pointer";
					tbOverObj = null;
				}
			}
			if(authBtnDownTimer){
				clearTimeout(authBtnDownTimer);
				authBtnDownTimer = null;
			}
			return false;
		},
		mouseUpStandard:function(event,tgtid){
			if(tbSelectedField==tgtid){
				tbDragObj = null;
				if((event.pageX - tbDownPoint.inbtnx)==0 && (event.pageY - tbDownPoint.inbtny)==0){
					if(!document.getElementById("anchor-0")){
						if(tbDownPoint.rightClick){
						}
						else{
							//情報ダイアログ表示
							showFieldInfo(tgtid);
						}
						tbOverObj = null;
					}
				}
				else if(!document.getElementById("anchor-0")){
					var data = getFldData(tgtid);
					var fld = document.getElementById(tgtid);
					data.left = fld.style.left.match("[-0-9]*");
					data.top = fld.style.top.match("[-0-9]*");
					data.width = fld.style.width.match("[-0-9]*");
					data.height = fld.style.height.match("[-0-9]*");
					changeObject2(data,null);
					//changedStack = true;
					//saveStackData();
					//mmsgSendStackObj();
				}
				return false;
			}
		}
}; //fieldDef2

var buttonDef3 = {
		returnFunc:function(){ return false; },

		mouseDownTrans:function(event,tgt){if(system.userLevel<=4)return;setHoverObject(false);scriptEditorObj(getBtnData(tgt));},
		mouseOverTrans:function(event,tgt){},
		mouseOutTrans:function(event,tgt){},
		mouseUpTrans:function(event,tgt){},

		mouseDownRect:function(event,tgt){buttonDef3.mouseDownTrans(event,tgt);},
		mouseOverRect:function(event,tgt){},
		mouseOutRect:function(event,tgt){},
		mouseUpRect:function(event,tgt){},

		mouseDownRRect:function(event,tgt){buttonDef3.mouseDownTrans(event,tgt);},
		mouseOverRRect:function(event,tgt){},
		mouseOutRRect:function(event,tgt){},
		mouseUpRRect:function(event,tgt){},

		mouseDownStandard:function(event,tgt){buttonDef3.mouseDownTrans(event,tgt);},
		mouseOverStandard:function(event,tgt){},
		mouseOutStandard:function(event,tgt){},
		mouseUpStandard:function(event,tgt){}
}; //buttonDef3

var fieldDef3 = {
		returnFunc:function(){ return false; },

		mouseDownStandard:function(event,tgt){if(system.userLevel<=4)return;execMenu("tb_"+selectedTool);setHoverObject(false);scriptEditorObj(getFldData(tgt));},
		mouseOverStandard:function(event,tgt){},
		mouseOutStandard:function(event,tgt){},
		mouseUpStandard:function(event,tgt){}
}; //fieldDef3

function hideBtnAnchor(){
	if(document.getElementById("anchor-0")){
		for(var i=0; i<4; i++){
			var x = document.getElementById("anchor-"+i);
			x.parentNode.removeChild(x);
		}
	}
}

function showBtnAnchor(){
	//hideBtnAnchor();
	if(!tbOverObj) return;
	if(tbOverObj.style.cursor.match(".*-resize")) return;
	for(var i=0; i<4; i++){
		var div = document.getElementById("anchor-"+i);
		if(!div){
			div = document.createElement("div");
			div.id = "anchor-"+i;
		}
		div.style.position = "absolute";
		div.style.background = "#d22";
		div.style.width = "12px";
		div.style.height = "12px";
		setBtnAnchor(div,i,tbOverObj);
		if('createTouch' in document){
			div.ontouchstart = anchorDown;
			div.ontouchmove = anchorMove;
			div.ontouchend = anchorUp;
		}else{
			div.onmousedown = anchorDown;
			div.onmousemove = anchorMove;
			div.onmouseup = anchorUp;
		}
		tbOverObj.parentNode.appendChild(div);
	}
	if(document.getElementById("anchor-0")){
		document.getElementById("anchor-0").objid = tbOverObj.id;
	}
}

function setBtnAnchor(div,i,obj){
	if(i==0 || i==2){
		div.style.left = parseInt(obj.style.left)-6+"px";
	}else{
		div.style.left = parseInt(obj.style.left)+parseInt(obj.style.width)-6+"px";
	}
	if(i==0 || i==1){
		div.style.top = parseInt(obj.style.top)-6+"px";
	}else{
		div.style.top = parseInt(obj.style.top)+parseInt(obj.style.height)-6+"px";
	}
}

function anchorDown(e){
	if(!event.touches || event.touches.length==1){
		this.downFlag = true;
		this.style.background = "#d2d";
		this.style.padding = "16px";
		this.style.left = parseInt(this.style.left)-16+"px";
		this.style.top = parseInt(this.style.top)-16+"px";
		if(!event.touches){
			this.x = e.pageX;
			this.y = e.pageY;
		}else{
			this.x = e.touches[0].pageX;
			this.y = e.touches[0].pageY;
		}
		this.left = parseInt(this.style.left);
		this.top = parseInt(this.style.top);
	}
	e.preventDefault();
}

function anchorUp(e){
	if(this.downFlag){
		this.downFlag = null;
		this.style.background = "#d22";
		this.style.padding = "0px";
		this.style.left = parseInt(this.style.left)+16+"px";
		this.style.top = parseInt(this.style.top)+16+"px";

		var objid = document.getElementById("anchor-0").objid;
		if(selectedTool=="button"){
			var data = getBtnData(objid);
		}else{
			data = getFldData(objid);
		}
		var btn = document.getElementById(objid);
		data.left = btn.style.left.match("[-0-9]*");
		data.top = btn.style.top.match("[-0-9]*");
		data.width = btn.style.width.match("[-0-9]*");
		data.height = btn.style.height.match("[-0-9]*");
		changeObject2(data,null,"noRefresh");
	}
	e.preventDefault();
}

function anchorMove(e){
	if(!this.downFlag) return;
	if(!event.touches || event.touches.length==1){
		if(!document.getElementById("anchor-0"))return;
		var objid = document.getElementById("anchor-0").objid;
		var obj = document.getElementById(objid);
		if(!event.touches){
			var left = (e.pageX - this.x)/getCardScale();
			var top = (e.pageY - this.y)/getCardScale();
		}else{
			left = (e.touches[0].pageX - this.x)/getCardScale();
			top = (e.touches[0].pageY - this.y)/getCardScale();
		}
		this.style.left = this.left+left+"px";
		this.style.top = this.top+top+"px";
		switch(this.id){
		case "anchor-0":
		case "anchor-2":
			obj.style.width = parseInt(obj.style.width)-(parseInt(this.style.left)+16+6)+parseInt(obj.style.left)+"px";
			obj.style.left = parseInt(this.style.left)+16+6+"px";
			break;
		case "anchor-1":
		case "anchor-3":
			obj.style.width = parseInt(this.style.left)+16+6-parseInt(obj.style.left)+"px";
			break;
		}
		switch(this.id){
		case "anchor-0":
		case "anchor-1":
			obj.style.height = parseInt(obj.style.height)-(parseInt(this.style.top)+16+6)+parseInt(obj.style.top)+"px";
			obj.style.top = parseInt(this.style.top)+16+6+"px";
			break;
		case "anchor-2":
		case "anchor-3":
			obj.style.height = parseInt(this.style.top)+16+6-parseInt(obj.style.top)+"px";
			break;
		}
		for(var i=0; i<4; i++){
			if("anchor-"+i == this.id) continue;
			var div = document.getElementById("anchor-"+i);
			setBtnAnchor(div,i,obj);
		}
	}
}

function hideInfoDialog(data){
	//if(document.activeElement){
	//	document.activeElement.blur();
	//}
	//contentEditableだとactiveElement効かないしblurもない。
	//下のようなこと(contentEditable=false)してもダメ
	/*var contEdit = document.getElementsByClassName('contEdit');
	for(var x in contEdit){
		contEdit[x].contentEditable = false;
		var a = function(x){setTimeout(function(){contEdit[x].contentEditable = true;},100);};
		a(x);
	}*/
	//というわけでこんなことに。
	if($('#scriptEditor').is(':visible')){
		document.getElementById('cardInfo').style.display="";
		document.getElementById('cardName').focus();
		setTimeout(function(){
			document.getElementById('cardInfo').style.display="none";
			document.getElementById('cardName').blur();
		},0);
	}

	if($('#scriptEditor').is(':visible')){
		$('#scriptEditor').css("-webkit-transition","all 0.5s ease-in");
		$('#scriptEditor').css("top",window.innerHeight+"px");
		setTimeout(function(){
			$('#scriptEditor').hide();
			$('#scriptEditor').css("-webkit-transition","none");
			$('#scriptEditor').css("top","0px");
		},500);
		touchInit();
	}

	document.getElementById('overrayBack').style.display='none';
	document.getElementById('buttonInfo').style['-webkit-transition'] = 'all 0.0s linear';
	document.getElementById('buttonInfo').style.display='none';
	document.getElementById('fieldInfo').style['-webkit-transition'] = 'all 0.0s linear';
	document.getElementById('fieldInfo').style.display='none';
	document.getElementById('cardInfo').style['-webkit-transition'] = 'all 0.0s linear';
	document.getElementById('cardInfo').style.display='none';
	document.getElementById('bkgndInfo').style['-webkit-transition'] = 'all 0.0s linear';
	document.getElementById('bkgndInfo').style.display='none';
	document.getElementById('stackInfo').style['-webkit-transition'] = 'all 0.0s linear';
	document.getElementById('stackInfo').style.display='none';
	if(tbSelectedButton!=null){
		document.getElementById(tbSelectedButton).style.outline='';
		document.getElementById(tbSelectedButton).style.cursor = "pointer";
	}
	if(tbSelectedField!=null && document.getElementById(tbSelectedField)!=null){
		document.getElementById(tbSelectedField).style.outline='';
		document.getElementById(tbSelectedField).style.cursor = "";
	}
	setTimeout(function(){
		tbSelectedButton=null;
		tbSelectedField=null;
	},0);
	if(data!=undefined){
		changeObject2(data,null);
	}
	//changedStack = true;
	//saveStackData();
	//mmsgSendStackObj();
}

function changeObject2(data, prop, option){
	var obj = data;
	if(data.type=="button"||data.type=="field"){
		var baseObj = null;
		switch(data.parent){
		case "card":
			baseObj = currentCardObj;
			break;
		case "background":
			baseObj = currentBgObj;
			break;
		default:
			console.log('?');
		}
		obj = findPartsById(data.id, baseObj.parts, data.type);
		for(var p in data){
			obj[p] = data[p];
		}
	}
	scWorker.postMessage({event:"changeObj",content:obj, prop:prop, editBackground:obj.parent=="background", option:option});
}

function changeBgObject2(data, id, prop, cardid){
	scWorker.postMessage({event:"changeBgObj",content:data, id:id, prop:prop, cardid:cardid});
}

//ボタン情報の表示
function showButtonInfo(tgtid){
	var target = document.getElementById(tgtid);
	var overray = document.getElementById('buttonInfo');

	//ダイアログの表示
	document.getElementById('overrayBack').style.display='';
	document.getElementById('overrayBack').onclick = function(){hideInfoDialog(data);event.preventDefault();};

	overray.style.display='';
	overray.onmouseover=function(){var x=document.getElementById(tgtid);if(x)x.style.outline='2px dotted #88f';};
	overray.onmouseout=function(){var x=document.getElementById(tgtid);if(x)x.style.outline='';};
	var savedWidth = overray.offsetWidth;
	var savedHeight = overray.offsetHeight;
	if(savedHeight<100) savedHeight=260;
	overray.style['-webkit-transition'] = '0.0s';
	//ダイアログの位置
	var cardBack = document.getElementById('cardBack');
	if(target.offsetTop<cardBack.offsetHeight/2){//下側に表示
		overray.style.left = window.innerWidth/2+(-cardBack.parentNode.offsetWidth/2 + target.offsetLeft + target.offsetWidth/2)*getCardScale() - savedWidth/2 +"px";
		overray.style.top = window.innerHeight/2+(-cardBack.parentNode.offsetHeight/2 + target.offsetTop + target.offsetHeight)*getCardScale() +"px";
		overray.style['-webkit-transform'] = 'scale(1.0,0.0) translate(0,-200px)';
	}else{//上側に表示
		overray.style.left = window.innerWidth/2+(-cardBack.parentNode.offsetWidth/2 + target.offsetLeft + target.offsetWidth/2)*getCardScale() - savedWidth/2 +"px";
		overray.style.top = window.innerHeight/2+(-cardBack.parentNode.offsetHeight/2 + target.offsetTop)*getCardScale() - savedHeight-6 + "px";
		overray.style['-webkit-transform'] = 'scale(1.0,0.0) translate(0,200px)';
	}
	setTimeout(function(){
		if(overray.offsetLeft < 0){overray.style.left="0px";}
		if(overray.offsetLeft+savedWidth > window.innerWidth){overray.style.left=window.innerWidth-savedWidth+"px";}
		if(overray.offsetTop < 0){overray.style.top="0px";}
		if(overray.offsetTop+savedHeight > window.innerHeight){overray.style.top=window.innerHeight-savedHeight+"px";}

		setTimeout(function(){
			overray.style['-webkit-transition'] = 'all 0.3s linear';
			overray.style['-webkit-transform'] = 'scale(1.0) translate(0,0)';
			overray = null;
		},0);
	},0);

	$("#btnScript").button({disabled: (system.userLevel<=4)});
	
	//プロパティ表示
	var data = getBtnData(target.id);
	var parentType = target.id.match(/^bg/)?"bg":"cd";
	var dataAry = parentType=="cd"?currentCardObj.parts:currentBgObj.parts;
	var btnnum = getBtnNum(dataAry, target.id);
	document.getElementById("btnName").value = data.name;
	document.getElementById("btnShowname").checked = data.showName;
	if(target.id.match("bg-")){
		document.getElementById("btnObjectType").textContent = (browserLang=="ja")?"バックグラウンドボタン":"Background Button";
	}else{
		document.getElementById("btnObjectType").textContent = (browserLang=="ja")?"カードボタン":"Card Button";
	}
	document.getElementById("btnNumber").textContent = btnnum;
	document.getElementById("btnId").textContent = data.id;
	document.getElementById("btnStyle").selectedIndex = getBtnStyleNum(data.style);
	if(data.style=='popup'){
		document.getElementById("btnTitleWidth").value = data.titleWidth;
		document.getElementById("btnTitleWidth").style.visibility = '';
		document.getElementById("btnTitleWidth").style.width = '40px';
	}
	else {
		document.getElementById("btnTitleWidth").style.visibility = 'hidden';
		document.getElementById("btnTitleWidth").style.width = '1px';
	}
	document.getElementById("btnFamily").selectedIndex = data.family;
	document.getElementById("btnEnabled").checked = data.enabled;
	document.getElementById("btnAutoHilite").checked = data.autoHilite;
	document.getElementById("btnIconScaling").checked = data.iconScaling;
	if(parentType=="bg"){
		document.getElementById("btnSharedHilite").checked = data.sharedHilite;
	}
	document.getElementById("sharedHiliteSpan").style.display = parentType=="bg"?"":"none";
	document.getElementById("btnLeft").value = data.left;
	document.getElementById("btnTop").value = data.top;
	document.getElementById("btnWidth").value = data.width;
	document.getElementById("btnHeight").value = data.height;

	//onchange登録
	document.getElementById("btnName").onchange = function(){ data.name = this.value; changeObject2(data,"name"); };
	document.getElementById("btnShowname").onchange = function(){ data.showName = this.checked; changeObject2(data,"showName"); };
	document.getElementById("btnStyle").onchange = function(){ data.style = getBtnStyleName(this.selectedIndex); changeObject2(data,"style"); };
	document.getElementById("btnTitleWidth").onchange = function(){ data.titleWidth = this.value; changeObject2(data,"titleWidth"); };
	document.getElementById("btnFamily").onchange = function(){ data.family = this.selectedIndex; changeObject2(data,"family"); };
	document.getElementById("btnEnabled").onchange = function(){ data.enabled = this.checked; changeObject2(data,"enabled"); };
	document.getElementById("btnAutoHilite").onchange = function(){ data.autoHilite = this.checked; changeObject2(data,"autoHilite"); };
	document.getElementById("btnIconScaling").onchange = function(){ data.iconScaling = this.checked; changeObject2(data,"iconScaling"); };
	document.getElementById("btnSharedHilite").onchange = function(){ data.sharedHilite = this.checked; changeObject2(data,"sharedHilite"); };
	document.getElementById("btnLeft").onchange = function(){ data.left = this.value; changeObject2(data,"left"); };
	document.getElementById("btnTop").onchange = function(){ data.top = this.value; changeObject2(data,"top"); };
	document.getElementById("btnWidth").onchange = function(){ data.width = this.value; changeObject2(data,"width"); };
	document.getElementById("btnHeight").onchange = function(){ data.height = this.value; changeObject2(data,"height"); };
	document.getElementById("btnLeft").onclick = function(){ data.left = this.value; changeObject2(data,"left"); };
	document.getElementById("btnTop").onclick = function(){ data.top = this.value; changeObject2(data,"top"); };
	document.getElementById("btnWidth").onclick = function(){ data.width = this.value; changeObject2(data,"width"); };
	document.getElementById("btnHeight").onclick = function(){ data.height = this.value; changeObject2(data,"height"); };

	target = null;
	cardBack = null;
	dataAry = null;
}

function getBtnStyleNum(styleName){
	switch(styleName){
	case "standard": return 0;
	case "transparent": return 1;
	case "opaque": return 2;
	case "rectangle": return 3;
	case "shadow": return 4;
	case "roundrect": return 5;
	case "default": return 6;
	case "oval": return 7;
	case "popup": return 8;
	case "checkbox": return 9;
	case "radio": return 10;
	case "search": return 11;
	case "range": return 12;
	}
}

function getBtnStyleName(styleNum){
	switch(styleNum){
	case 0: return "standard";
	case 1: return "transparent";
	case 2: return "opaque";
	case 3: return "rectangle";
	case 4: return "shadow";
	case 5: return "roundrect";
	case 6: return "default";
	case 7: return "oval";
	case 8: return "popup";
	case 9: return "checkbox";
	case 10: return "radio";
	case 11: return "search";
	case 12: return "range";
	}
}

function getBtnNum(dataAry, targetElemId){
	var id = parseInt(targetElemId.match(/[0-9]+/));
	var num=1;
	for(var i=0; i<dataAry.length; i++){
		if(dataAry[i].type=="button" && dataAry[i].id == id){
			return num;
		}
		if(dataAry[i].type=="button"){
			num++;
		}
	}
	return null;
}

function getBtnData(targetElemId){
	if(targetElemId.match(/nav/))return null;
	var parentType = targetElemId.match(/^bg/)?"bg":"cd";
	var id = parseInt(targetElemId.match(/[0-9]+/));
	var dataAry = (parentType=="cd")?currentCardObj.parts:currentBgObj.parts;
	for(var i=0; i<dataAry.length; i++){
		if(dataAry[i].id == id){
			return dataAry[i];
		}
	}
	return null;
}

//フィールド情報の表示
function showFieldInfo(tgtid){
	var target = document.getElementById(tgtid);
	var overray = document.getElementById('fieldInfo');

	//ダイアログの表示
	document.getElementById('overrayBack').style.display='';
	document.getElementById('overrayBack').onclick = function(){hideInfoDialog(data);event.preventDefault();};

	overray.style.display='';
	overray.onmouseover=function(){var x=document.getElementById(tgtid);if(x)x.style.outline='2px dotted #88f';};
	overray.onmouseout=function(){var x=document.getElementById(tgtid);if(x)x.style.outline='';};
	var savedWidth = overray.offsetWidth;
	var savedHeight = overray.offsetHeight;
	if(savedHeight<280) savedHeight=280;
	overray.style['-webkit-transition'] = '0.0s';
	//ダイアログの位置
	var cardBack = document.getElementById('cardBack');
	if(target.offsetTop<cardBack.offsetHeight/2){//下側に表示
		overray.style.left = window.innerWidth/2+(-cardBack.parentNode.offsetWidth/2 + target.offsetLeft + target.offsetWidth/2)*getCardScale() - savedWidth/2 +"px";
		overray.style.top = window.innerHeight/2+(-cardBack.parentNode.offsetHeight/2 + target.offsetTop + target.offsetHeight)*getCardScale() +"px";
		overray.style['-webkit-transform'] = 'scale(1.0,0.0) translate(0,-200px)';
	}else{//上側に表示
		overray.style.left = window.innerWidth/2+(-cardBack.parentNode.offsetWidth/2 + target.offsetLeft + target.offsetWidth/2)*getCardScale() - savedWidth/2 +"px";
		overray.style.top = window.innerHeight/2+(-cardBack.parentNode.offsetHeight/2 + target.offsetTop)*getCardScale() - savedHeight-6 + "px";
		overray.style['-webkit-transform'] = 'scale(1.0,0.0) translate(0,200px)';
	}
	if(overray.offsetLeft < 0){overray.style.left=0;}
	if(overray.offsetLeft+savedWidth > window.innerWidth){overray.style.left=window.innerWidth-savedWidth+"px";}
	if(overray.offsetTop < 0){overray.style.top=0;}
	if(overray.offsetTop+savedHeight > window.innerHeight){overray.style.top=window.innerHeight-savedHeight+"px";}

	setTimeout(function(){
		overray.style['-webkit-transition'] = 'all 0.3s linear';
		overray.style['-webkit-transform'] = 'scale(1.0) translate(0,0)';
		overray = null;
	},0);

	$("#fldScript").button({disabled: (system.userLevel<=4)});

	//プロパティ表示
	var data = getFldData(target.id);
	var parentType = target.id.match(/^bg/)?"bg":"cd";
	var dataAry = parentType=="cd"?currentCardObj.parts:currentBgObj.parts;
	var fldnum = getFldNum(dataAry,target.id);
	document.getElementById("fldName").value = data.name;
	if(target.id.match("bg-")){
		document.getElementById("fldObjectType").textContent = (browserLang=="ja")?"バックグラウンドフィールド":"Background Field";
	}else{
		document.getElementById("fldObjectType").textContent = (browserLang=="ja")?"カードフィールド":"Card Field";
	}
	document.getElementById("fldNumber").textContent = fldnum;
	document.getElementById("fldId").textContent = data.id;
	document.getElementById("fldStyle").selectedIndex = getFldStyleNum(data.style);
	document.getElementById("fldLockedtext").checked = data.lockText;
	//document.getElementById("fldVisible").checked = data.visible;
	document.getElementById("fldDontwrap").checked = data.dontWrap;
	document.getElementById("fldFixedlineheight").checked = data.fixedLineHeight;
	document.getElementById("fldAutotab").checked = data.autoTab;
	document.getElementById("fldDontsearch").checked = data.dontSearch;
	document.getElementById("fldShowlines").checked = data.showLines;
	document.getElementById("fldMultiplelines").checked = data.multipleLines;
	document.getElementById("fldWidemargins").checked = data.wideMargins;
	document.getElementById("fldAutoselect").checked = data.autoSelect;
	document.getElementById("fldVertically").checked = data.vertically;
	if(parentType=="bg"){
		document.getElementById("fldSharedText").checked = data.sharedText;
	}
	document.getElementById("sharedTextSpan").style.display = parentType=="bg"?"":"none";
	document.getElementById("fldLeft").value = data.left;
	document.getElementById("fldTop").value = data.top;
	document.getElementById("fldWidth").value = data.width;
	document.getElementById("fldHeight").value = data.height;

	//onchange登録
	document.getElementById("fldName").onchange = function(){ data.name = this.value; changeObject2(data,"name"); };
	document.getElementById("fldStyle").onchange = function(){ data.style = getFldStyleName(this.selectedIndex); changeObject2(data,"style"); };
	document.getElementById("fldLockedtext").onchange = function(){ data.lockText = this.checked; changeObject2(data,"lockText"); };
	document.getElementById("fldDontwrap").onchange = function(){ data.dontWrap = this.checked; changeObject2(data,"dontWrap"); };
	document.getElementById("fldFixedlineheight").onchange = function(){ data.fixedLineHeight = this.checked; changeObject2(data,"fixedLineHeight"); };
	document.getElementById("fldAutotab").onchange = function(){ data.autoTab = this.checked; changeObject2(data,"autoTab"); };
	document.getElementById("fldDontsearch").onchange = function(){ data.dontSearch = this.checked; changeObject2(data,"dontSearch"); };
	document.getElementById("fldShowlines").onchange = function(){ data.showLines = this.checked;
	if(this.checked){
		data.fixedLineHeight=true;
		document.getElementById("fldFixedlineheight").checked=true;
	}else{
		setTimeout(function(){
			while(true){
				var svg = document.getElementById(tgtid).getElementsByTagName('svg');
				//console.log(svg[0]);
				if(svg[0]){
					svg[0].parentNode.removeChild(svg[0]);
				}
				else break;
			}
		},200);
	}
	changeObject2(data,"showLines");
	};
	document.getElementById("fldMultiplelines").onchange = function(){ data.multipleLines = this.checked; changeObject2(data,"multipleLines"); };
	document.getElementById("fldWidemargins").onchange = function(){ data.wideMargins = this.checked; changeObject2(data,"wideMargins"); };
	document.getElementById("fldAutoselect").onchange = function(){ data.autoSelect = this.checked;
	if(this.checked){
		data.lockText=true;
		document.getElementById("fldLockedtext").checked=true;
		data.fixedLineHeight=true;
		document.getElementById("fldFixedlineheight").checked=true;
	} changeObject2(data,"autoSelect"); };
	document.getElementById("fldVertically").onchange = function(){ data.vertically = this.checked; changeObject2(data,"vertically"); };
	document.getElementById("fldSharedText").onchange = function(){ data.sharedText = this.checked; changeObject2(data,"sharedText"); };
	document.getElementById("fldLeft").onchange = function(){ data.left = this.value; changeObject2(data,"left"); };
	document.getElementById("fldTop").onchange = function(){ data.top = this.value; changeObject2(data,"top"); };
	document.getElementById("fldWidth").onchange = function(){ data.width = this.value; changeObject2(data,"width"); };
	document.getElementById("fldHeight").onchange = function(){ data.height = this.value; changeObject2(data,"height"); };
	document.getElementById("fldLeft").onclick = function(){ data.left = this.value; changeObject2(data,"left"); };
	document.getElementById("fldTop").onclick = function(){ data.top = this.value; changeObject2(data,"top"); };
	document.getElementById("fldWidth").onclick = function(){ data.width = this.value; changeObject2(data,"width"); };
	document.getElementById("fldHeight").onclick = function(){ data.height = this.value; changeObject2(data,"height"); };

	target = null;
	cardBack = null;
	dataAry = null;
}

function getFldStyleNum(styleName){
	switch(styleName){
	case "transparent": return 0;
	case "opaque": return 1;
	case "rectangle": return 2;
	case "shadow": return 3;
	case "scrolling": return 4;
	}
}

function getFldStyleName(styleNum){
	switch(styleNum){
	case 0: return "transparent";
	case 1: return "opaque";
	case 2: return "rectangle";
	case 3: return "shadow";
	case 4: return "scrolling";
	}
}

function getFldNum(dataAry, targetElemId){
	var id = parseInt(targetElemId.match(/[0-9]+/));
	var num=1;
	for(var i=0; i<dataAry.length; i++){
		if(dataAry[i].type=="field" && dataAry[i].id == id){
			return num;
		}
		if(dataAry[i].type=="field"){
			num++;
		}
	}
	return null;
}

function getFldData(targetElemId){
	var parentType = targetElemId.match(/^bg/)?"bg":"cd";
	var baseObj = parentType=="cd"?currentCardObj:currentBgObj;
	return inGetFldData(targetElemId,baseObj);
}

function inGetFldData(targetElemId,baseObj){
	var id = parseInt(targetElemId.match(/[0-9]+/));
	var dataAry = baseObj.parts;
	for(var i=0; i<dataAry.length; i++){
		if(dataAry[i].id == id){
			return dataAry[i];
		}
	}
	return null;
}

function setFldContent(fldId){
	var parentType = fldId.match(/^bg/)?"bg":"cd";
	var baseObj = parentType=="cd"?currentCardObj:currentBgObj;
	inSetFldContent(fldId,baseObj,currentCardObj);
}

//フィールドのテキストを保存
function inSetFldContent(fldId,baseObj,cd){
	var data = inGetFldData(fldId,baseObj,cd);
	var text = document.getElementById(fldId).innerHTML;
	text = changeStyledTag(text);
	document.getElementById(fldId).innerHTML = text;
	if(fldId.match(/^bg-/)){
		if(data.sharedText==true){
			//bgのpartsに保存
			data.text = text;
			changeObject2(data,"text");
		}
		else{
			//cdのbgpartsに保存
			if(cd.bgparts[data.id]==null){
				cd.bgparts[data.id] = {};
			}
			cd.bgparts[data.id].text = text;
			changeBgObject2(cd.bgparts[data.id],data.id,"text",currentCardObj.id);
		}
	}else{
		//cdのpartsに保存
		data.text = text;
		changeObject2(data,"text");
	}
}

function changeStyledTag(text){
	//<div>は<br>にする
	text = text.replace(/<div>/g,"<br>");
	text = text.replace(/<\/div>/g,"");
	text = text.replace(/<br><\/span>/g,"<\/span><br>");
	text = text.replace(/<svg.*$/,"");

	//テキストのタグを入れ子にしない
	var reg = /(.*)<span>(<span>.*<\/span>)<\/span>(.*)/;
	var res;
	while((res = reg.exec(text))){
		text = res[1]+res[2]+res[3];
	}

	var reg = /(.*)<span><\/span>(.*)/;
	var res;
	while((res = reg.exec(text))){
		text = res[1]+res[2];
	}

	return text;
}

//カード情報の表示
function showCardInfo(tgtObj){
	var overray = document.getElementById('cardInfo');

	//ダイアログの表示
	document.getElementById('overrayBack').style.display='';
	document.getElementById('overrayBack').onclick = function(){hideInfoDialog(data);};

	overray.style.display='';
	var savedWidth = overray.offsetWidth;
	var savedHeight = overray.offsetHeight;
	overray.style['-webkit-transition'] = '0.0s';
	//ダイアログの位置
	var cardBack = document.getElementById('cardBack');
	overray.style.left = cardBack.parentNode.offsetLeft + cardBack.parentNode.offsetWidth/2 - savedWidth/2 +"px";
	overray.style.top = cardBack.parentNode.offsetTop +"px";
	overray.style['-webkit-transform'] = 'scale(1.0,0.0) translate(0,-200px)';
	if(overray.offsetLeft < 0){overray.style.left=0;}
	if(overray.offsetLeft+savedWidth > window.innerWidth){overray.style.left=window.innerWidth-savedWidth+"px";}
	if(overray.offsetTop < 0){overray.style.top=0;}
	if(overray.offsetTop+savedHeight > window.innerHeight){overray.style.top=window.innerHeight-savedHeight+"px";}

	setTimeout(function(){
		overray.style['-webkit-transition'] = 'all 0.3s linear';
		overray.style['-webkit-transform'] = 'scale(1.0) translate(0,0)';
		overray = null;
	},0);

	$("#cardScript").button({disabled: (system.userLevel<=4)});

	//プロパティ表示
	var data = currentCardObj;
	mmsgSendSystemEvent("getCardNum");
	document.getElementById("cardName").value = data.name;
	document.getElementById("cardObjectType").textContent = (browserLang=="ja")?"カード":"Card";
	document.getElementById("cardId").textContent = data.id;
	document.getElementById("cardShowPicture").checked = data.showPict;
	document.getElementById("cardMarked").checked = data.marked;
	document.getElementById("cardCantDelete").checked = data.cantDelete;
	document.getElementById("cardDontsearch").checked = data.dontSearch;

	//onchange登録
	document.getElementById("cardName").onchange = function(){ data.name = this.value; changeObject2(data,"name"); };
	document.getElementById("cardShowPicture").onchange = function(){ data.showPict = this.checked; changeObject2(data,"showPict"); };
	document.getElementById("cardMarked").onchange = function(){ data.marked = this.checked; changeObject2(data,"marked"); };
	document.getElementById("cardCantDelete").onchange = function(){ data.cantDelete = this.checked; changeObject2(data,"cantDelete"); };
	document.getElementById("cardDontsearch").onchange = function(){ data.dontSearch = this.checked; changeObject2(data,"dontSearch"); };

	cardBack = null;
	//data = null;
}

//バックグラウンド情報の表示
function showBackgroundInfo(tgtObj){
	var overray = document.getElementById('bkgndInfo');

	//ダイアログの表示
	document.getElementById('overrayBack').style.display='';
	document.getElementById('overrayBack').onclick = function(){hideInfoDialog(data);};

	overray.style.display='';
	var savedWidth = overray.offsetWidth;
	var savedHeight = overray.offsetHeight;
	overray.style['-webkit-transition'] = '0.0s';
	//ダイアログの位置
	var cardBack = document.getElementById('cardBack');
	overray.style.left = cardBack.parentNode.offsetLeft + cardBack.parentNode.offsetWidth/2 - savedWidth/2 +"px";
	overray.style.top = cardBack.parentNode.offsetTop +"px";
	overray.style['-webkit-transform'] = 'scale(1.0,0.0) translate(0,-200px)';
	if(overray.offsetLeft < 0){overray.style.left=0;}
	if(overray.offsetLeft+savedWidth > window.innerWidth){overray.style.left=window.innerWidth-savedWidth+"px";}
	if(overray.offsetTop < 0){overray.style.top=0;}
	if(overray.offsetTop+savedHeight > window.innerHeight){overray.style.top=window.innerHeight-savedHeight+"px";}

	setTimeout(function(){
		overray.style['-webkit-transition'] = 'all 0.3s linear';
		overray.style['-webkit-transform'] = 'scale(1.0) translate(0,0)';
		overray = null;
	},0);

	$("#bkgndScript").button({disabled: (system.userLevel<=4)});

	//プロパティ表示
	var data = currentBgObj;
	mmsgSendSystemEvent("getBgNum");
	document.getElementById("bkgndName").value = data.name;
	document.getElementById("bkgndObjectType").textContent = (browserLang=="ja")?"バックグラウンド":"Background";
	document.getElementById("bkgndId").textContent = data.id;
	document.getElementById("bkgndShowPicture").checked = data.showPict;
	document.getElementById("bkgndCantDelete").checked = data.cantDelete;
	document.getElementById("bkgndDontsearch").checked = data.dontSearch;

	//onchange登録
	document.getElementById("bkgndName").onchange = function(){ data.name = this.value; changeObject2(data,"name"); };
	document.getElementById("bkgndShowPicture").onchange = function(){ data.showPict = this.checked; changeObject2(data,"showPict"); };
	document.getElementById("bkgndCantDelete").onchange = function(){ data.cantDelete = this.checked; changeObject2(data,"cantDelete"); };
	document.getElementById("bkgndDontsearch").onchange = function(){ data.dontSearch = this.checked; changeObject2(data,"dontSearch"); };

	cardBack = null;
	//data = null;
}

//スタック情報の表示
function showStackInfo(tgtObj){
	var overray = document.getElementById('stackInfo');

	//ダイアログの表示
	document.getElementById('overrayBack').style.display='';
	document.getElementById('overrayBack').onclick = function(){hideInfoDialog();};

	overray.style.display='';
	var savedWidth = overray.offsetWidth;
	var savedHeight = overray.offsetHeight;
	overray.style['-webkit-transition'] = '0.0s';
	//ダイアログの位置
	var cardBack = document.getElementById('cardBack');
	overray.style.left = cardBack.parentNode.offsetLeft + cardBack.parentNode.offsetWidth/2 - savedWidth/2 +"px";
	overray.style.top = cardBack.parentNode.offsetTop +"px";
	overray.style['-webkit-transform'] = 'scale(1.0,0.0) translate(0,-200px)';
	if(overray.offsetLeft < 0){overray.style.left=0;}
	if(overray.offsetLeft+savedWidth > window.innerWidth){overray.style.left=window.innerWidth-savedWidth+"px";}
	if(overray.offsetTop < 0){overray.style.top=0;}
	if(overray.offsetTop+savedHeight > window.innerHeight){overray.style.top=window.innerHeight-savedHeight+"px";}

	setTimeout(function(){
		overray.style['-webkit-transition'] = 'all 0.3s linear';
		overray.style['-webkit-transform'] = 'scale(1.0) translate(0,0)';
		overray = null;
	},0);

	$("#stackScript").button({disabled: (system.userLevel<=4)});

	//プロパティ表示
	var data = stackData1;
	document.getElementById("stackName").textContent = nameParameter;
	document.getElementById("stkCreatedByVersion").textContent = data.createdByVersion;
	document.getElementById("stkModifyVersion").textContent = data.modifyVersion;
	document.getElementById("stkUserLevel").selectedIndex = 5-data.userLevel;
	document.getElementById("stkCantAbort").checked = data.cantAbort;
	document.getElementById("stkCantModify").checked = data.cantModify;
	document.getElementById("stkCantPeek").checked = data.cantPeek;
	document.getElementById("stkShowNav").checked = (data.showNavigator!=null)?data.showNavigator:true;
	document.getElementById("stkWidth").value = data.width;
	document.getElementById("stkHeight").value = data.height;

	//onchange登録
	document.getElementById("stkUserLevel").onchange = function(){ var lv = 5-this.selectedIndex; data.userLevel = lv; system.userLevel=lv; setUserLevel(lv); changeObject2(data,"userLevel"); };
	document.getElementById("stkCantAbort").onchange = function(){ data.cantAbort = this.checked; changeObject2(data,"cantAbort"); };
	document.getElementById("stkCantModify").onchange = function(){ data.cantModify = this.checked; changeObject2(data,"cantModify"); };
	document.getElementById("stkCantPeek").onchange = function(){ data.cantPeek = this.checked; changeObject2(data,"cantPeek"); };
	document.getElementById("stkShowNav").onchange = function(){ data.showNavigator = this.checked; changeObject2(data,"showNavigator"); };
	document.getElementById("stkWidth").onchange = function(){ data.width = Math.min(4096,Math.max(64,this.value)); changeObject2(data,"width"); cardResize(); };
	document.getElementById("stkHeight").onchange = function(){ data.height = Math.min(4096,Math.max(64,this.value)); changeObject2(data,"height"); cardResize(); };

	cardBack = null;
}

/*function getBgData(bgId){
	for(var i=0; i<bgData.length; i++){
		if(bgData[i].id == bgId){
			return bgData[i];
		}
	}
	return null;
}*/

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

function cutPart(v){
	copyPart(v);
	deletePart(v);
}

function copyPart(v){
	if(v.indexOf("button")!=-1)	var data = getBtnData(v);
	else data = getFldData(v);
	mmsgSendSystemEvent("copyObj",{basetype:data.parent, type:data.type, id:data.id});
}

function deletePart(v){
	if(v.indexOf("button")!=-1)	var data = getBtnData(v);
	else data = getFldData(v);
	mmsgSendSystemEvent("deleteObj",{basetype:data.parent, type:data.type, id:data.id});
}

function sendfartherPart(v){
	if(v.indexOf("button")!=-1)	var data = getBtnData(v);
	else data = getFldData(v);
	mmsgSendSystemEvent("sendfartherObj",{basetype:data.parent, type:data.type, id:data.id});
}

function bringcloserPart(v){
	if(v.indexOf("button")!=-1)	var data = getBtnData(v);
	else data = getFldData(v);
	mmsgSendSystemEvent("bringcloserObj",{basetype:data.parent, type:data.type, id:data.id});
}

function contentOfBtn(targetElemId){
	var data = getBtnData(targetElemId);

	var area = document.getElementById('contentEditorArea');
	area.targetId = targetElemId;
	area.value = data.text?data.text:"";

	//エディタ表示
	$("#contentEditor").dialog("open");
	document.getElementById('contentEditor').parentNode.removeEventListener("");
}

function contentEditorOK(){
	var contentEditorArea = document.getElementById('contentEditorArea');
	var data = getBtnData(contentEditorArea.targetId);
	data.text = contentEditorArea.value;
	changeObject2(data,"text");

	$("#contentEditor").dialog('close');
}

var fontDialogObjId;
function fontDialog(obj){
	fontDialogObjId = obj;
	var data = getBtnData(fontDialogObjId);

	document.getElementById("fdSize").value = data.textSize;
	for(var i=0; i<document.getElementById("fdName").childNodes.length-1; i++){
		if(data.textFont == document.getElementById("fdName").childNodes[i+1].textContent.match(/[^\n]*/)+""){
			document.getElementById("fdName").selectedIndex = i;
			break;
		}
	}

	document.getElementById("fdLineHeightSpan").style.display = (data.type=="field")?"":"none";
	document.getElementById("fdLineHeight").value = data.textHeight;

	document.getElementById("fd-font-bold").checked = ((data.textStyle&0x1)>0);
	document.getElementById("fd-font-italic").checked = ((data.textStyle&0x2)>0);
	document.getElementById("fd-font-underline").checked = ((data.textStyle&0x4)>0);
	document.getElementById("fd-font-outline").checked = ((data.textStyle&0x8)>0);
	document.getElementById("fd-font-shadow").checked = ((data.textStyle&0x10)>0);
	document.getElementById("fd-font-condensed").checked = ((data.textStyle&0x20)>0);
	document.getElementById("fd-font-extend").checked = ((data.textStyle&0x40)>0);

	document.getElementById("fd-font-left").checked = (data.textAlign=="left");
	document.getElementById("fd-font-center").checked = (data.textAlign=="center");
	document.getElementById("fd-font-right").checked = (data.textAlign=="right");

	$("#fontDialog").dialog('open');
	touchInitClear();
}

function fdChangeFont(){
	var data = getBtnData(fontDialogObjId);

	data.textSize = document.getElementById("fdSize").value;
	if(data.type=="field"){
		data.textHeight = document.getElementById("fdLineHeight").value;
	}

	var i = document.getElementById("fdName").selectedIndex;
	data.textFont = document.getElementById("fdName").childNodes[i+1].textContent.match(/[^\n]*/)+"";

	if(data.textFont.match(/other./)){
		var fname = window.prompt("Input font name", "Arial");
		data.textFont = "'"+fname+"', sans-serif";
		if(fname.length>0){
			var fontnameElm = document.getElementById("fdName");
			for(var j=0; j<fontnameElm.childNodes.length; j++){
				if(fname==fontnameElm.childNodes[j].textContent){
					j=0;break;
				}
			}
			if(j>0){
				var optionElm = document.createElement('option');
				optionElm.textContent = fname;
				fontnameElm.appendChild(optionElm);
				fontnameElm.selectedIndex = fontnameElm.childNodes.length-2;
			}
		}
	}

	data.textStyle = 0;
	data.textStyle += document.getElementById("fd-font-bold").checked?0x1:0x0;
	data.textStyle += document.getElementById("fd-font-italic").checked?0x2:0x0;
	data.textStyle += document.getElementById("fd-font-underline").checked?0x4:0x0;
	data.textStyle += document.getElementById("fd-font-outline").checked?0x8:0x0;
	data.textStyle += document.getElementById("fd-font-shadow").checked?0x10:0x0;
	data.textStyle += document.getElementById("fd-font-condensed").checked?0x20:0x0;
	data.textStyle += document.getElementById("fd-font-extend").checked?0x40:0x0;

	data.textAlign = "";
	data.textAlign += document.getElementById("fd-font-left").checked?"left":"";
	data.textAlign += document.getElementById("fd-font-center").checked?"center":"";
	data.textAlign += document.getElementById("fd-font-right").checked?"right":"";

	changeObject2(data,"textFont","noRefresh");
	changeObject2(data,"textSize","noRefresh");
	changeObject2(data,"textStyle","noRefresh");
	if(data.type=="field"){
		changeObject2(data,"textHeight","noRefresh");
	}
	changeObject2(data,"textAlign");
}

function fontDialogOK(){
	fdChangeFont();

	$("#fontDialog").dialog('close');
}
