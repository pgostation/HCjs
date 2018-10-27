"use strict";

function menuInit(){
	setMenu("Stack", [
	                  "About HCjs…",
	                  "-",
	                  "Save",
	                  "-",
	                  "Quit",
	                  ]);
	setMenu("Paint", [
	                  "About HCjs…",
	                  "-",
	                  "Save",
	                  "-",
	                  "Quit",
	                  ]);
	//Browse
	setMenu("Edit", [
	                 "Undo",
	                 "-",
	                 "Paste",
	                 "-",
	                 "New Card",
	                 "New Background",
	                 "Delete Card",
	                 "-",
	                 "Scaling Card",
	                 "Master Edit Mode",
	                 "Background",
	                 "-",
	                 "Resource Editor…",
	                 ]);
	//Paint
	setMenu("Edit2", [
	                  "Undo",
	                  "-",
	                  "Cut",
	                  "Copy",
	                  "Paste",
	                  "-",
	                  "New Card",
	                  "New Background",
	                  "Delete Card",
	                  "-",
	                  "Scaling Card",
	                  "Master Edit Mode",
	                  "Background",
	                  "-",
	                  "Upload File Paint…",
	                  "Resource Editor…",
	                  ]);
	//Rsrc Editor
	setMenu("Edit3", [
	                  "Undo RsrcItem",
	                  "-",
	                  "Cut Item",
	                  "Copy Item",
	                  "Paste",
	                  "-",
	                  "Delete Item",
	                  "-",
	                  "New Item",
	                  "Upload File Rsrc…",
	                  "Show Information…",
	                  ]);
	//Rsrc Editor Paint
	setMenu("Edit4", [
	                  "Undo",
	                  "-",
	                  "Cut",
	                  "Copy",
	                  "Paste",
	                  "-",
	                  "Image Size…",
	                  ]);
	setMenu("Go", [
	               "Back",
	               "-",
	               "Help…",
	               "Recent…",
	               "-",
	               "First",
	               "Prev",
	               "Next",
	               "Last",
	               "-",
	               "Find…",
	               "Message",
	               "Navigator",
	               ]);
	setMenu("Tools", [
	                  "#Tools",
	                  ["Browse","Button","Field"],
	                  ["Select","Lasso","MagicWand"],
	                  ["Pencil","Brush","Eraser"],
	                  ["Line","Rect","Oval"],
	                  ["PaintBucket","Type"],
	                  ]);
	setMenu("Tools2", [
	                   "#Tools",
	                   ["Select","Lasso","MagicWand"],
	                   ["Pencil","Brush","Eraser"],
	                   ["Line","Rect","Oval"],
	                   ["PaintBucket","Type"],
	                   ]);
	setMenu("Objects", [
	                    "Card Info…",
	                    "Background Info…",
	                    "Stack Info…",
	                    ]);
	setMenu("Effect", [
	                   "Zoom in",
	                   "Zoom out",
	                   "-",
	                   "Select All",
	                   "Delete All",
	                   "Reverse Selection",
	                   "Expand Selection",
	                   //"Convert Color…",
	                   //"Filter…",
	                   "Scale Selection…",
	                   //"Rotate Selection…",
	                   "-",
	                   "Fill",
	                   "Invert",
	                   "Pickup",
	                   //"Darken",
	                   //"Lighten",
	                   "Flip Horizontal",
	                   "Flip Vertical",
	                   "-",
	                   "Opaque",
	                   "Transparent",
	                   ]);
	setMenu("Script", [
	                   "Open Card Script",
	                   "Open Background Script",
	                   "Open Stack Script",
	                   "-",
	                   "Show as JavaScript…",
	                   "Correct Indentation",
	                   ]);
	setMenu("Fonts", [
	                  "#Fonts",
	                  ]);
	setMenu("Nav", [
	                "!Nav",
	                ]);
	setMenu("Menu", [
	                 "!Menu",
	                 ]);
	setMenu("Palette", [
	                    "!Palette",
	                    ]);

	if(userId != userParameter){
		setEnabledMenuItem("Edit","Master Edit Mode",false);
		setEnabledMenuItem("Edit2","Master Edit Mode",false);
	}
}

var menuElem = {};

var browseMenus = [];

function resetMenubarInit(){ //起動時に呼ぶ
	browseMenus = 
		[
		 {name:"Stack", enabled:true},
		 {name:"Edit", enabled:true},
		 {name:"Go", enabled:true},
		 {name:"Tools", enabled:true},
		 {name:"Objects", enabled:true}
		 ];
	mmsgSendSystemEvent("menus",browseMenus);
	for(var i=0; i<browseMenus.length; i++){
		var name = browseMenus[i].name;
		mmsgSendSystemEvent("menuitems",{name:name, elem:menuElem[name]});
	}
	changeMenuTitles(browseMenus);
}

function setMenu(menuTitle, menuAry){
	menuElem[menuTitle] = [];
	for(var i=0; i<menuAry.length; i++){
		menuElem[menuTitle][i] = {name:menuAry[i], enabled:true};
	}
}

function setEnabledMenuItem(menuTitle, menuItem, b){
	var menuAry = menuElem[menuTitle];
	if(!menuAry){
		for(var t in menuElem){
			if(menuTranslate(t) == menuTitle){
				menuAry = menuElem[t];
			}
		}
	}
	if(!menuAry) return;
	for(var i=0; i<menuAry.length; i++){
		if(menuAry[i].name == menuItem || menuitemTranslate(menuAry[i].name) == menuItem){
			menuAry[i].enabled = b;
			break;
		}
	}
}

function setUserLevel(lv){
	//userLevelが3以下ならオブジェクトメニューdisable
	setEnabledMenuItem("Objects","Card Info…",(lv>=4));
	setEnabledMenuItem("Objects","Background Info…",(lv>=4));
	setEnabledMenuItem("Objects","Stack Info…",(lv>=5||masterEditMode));
}

function makeMenu(menuTitle,btnid){
	var menuAry = menuElem[menuTitle];
	if(menuAry[0].name.match(/#.+/)){
		//ツールメニュー用
		$("#overrayBack").get(0).onclick = function(){$("#overrayBack").hide();$("#dummy_menu").fadeOut("fast");};
		$("#overrayBack").show();
		//
		$("#menu_select-menu2").html("");
		var width = $("#dummy_menu").width();
		for(var i=0; i<menuAry.length-1; i++){
			var menuLine = menuAry[1+i].name;
			for(var j=0; j<menuLine.length; j++){
				var menuBtn = menuLine[j];
				$("#menu_select-menu2").append(
						"<div id='menu_select2_"+i+"_"+j+"' class='ui-menu-item2 ui-state-none "+((menuBtn.toLowerCase()==selectedTool)?"ui-state-active":"")+"' style='width:"+(width/3-2)+"px;text-align:center;font-size:80%;'>"+
						"<img src='img/tb_"+menuBtn+".png' height=24 width=24 />"+
						"<a >"+
						menuitemTranslate(menuBtn)+"</a></div>");
			}
			$("#menu_select-menu2").append("<div style='float:left;clear:left;width:0px;'></div>");
		}
		setTimeout(function(){
			var menuCmd = {};
			for(var i=0; i<menuAry.length-1; i++){
				var menuLine = menuAry[1+i].name;
				for(var j=0; j<menuLine.length; j++){
					menuCmd["menu_select2_"+i+"_"+j] = menuLine[j];
					if(system.userLevel<=3 && (menuLine[j]=="Button"||menuLine[j]=="Field")){
						$("#menu_select2_"+i+"_"+j).get(0).style.opacity = "0.7";
						continue;
					}else if(system.userLevel<=2 && (menuLine[j]!="Browse")){
						$("#menu_select2_"+i+"_"+j).get(0).style.opacity = "0.7";
						continue;
					}else{
						$("#menu_select2_"+i+"_"+j).bind("click",function(){
							$("#overrayBack").hide();$("#dummy_menu").fadeOut("fast");
							changeTool(menuCmd[this.id].toLowerCase());
						});
					}

					$("#menu_select2_"+i+"_"+j).bind("touchstart",menuitemtouchstart);
					$("#menu_select2_"+i+"_"+j).bind("touchmove",menuitemtouchmove);
					$("#menu_select2_"+i+"_"+j).bind("touchend",menuitemtouchend);
					$("#menu_select2_"+i+"_"+j).hover(
							function(){
								$('#'+this.id).addClass('ui-state-hover');
								$('#'+this.id).removeClass('ui-state-none');
							},function(){
								$('#'+this.id).removeClass('ui-state-hover');
								$('#'+this.id).addClass('ui-state-none');
							}
					);
				}
			}
		},0);
		//
		setTimeout(function(){
			$("#dummy_menu").css("top",($(window).height()-$("#dummy_menu").height()-40)+"px");
			if($("#dummy_menu").offset().top < 0){
				$("#dummy_menu").css("top","0px");
			}
			if($("#dummy_menu").offset().left+$("#dummy_menu").width()+20>$(window).width()){
				$("#dummy_menu").css("left",($(window).width()/2-$("#dummy_menu").width()/2)+"px");
			}
		},0);
		setTimeout(function(){
			window.scroll(0, 1);
		},0);
		$("#dummy_menu").show();
		$("#dummy_menu").css("top","-9999px");
		$("#dummy_menu").css("left",$('#'+btnid).offset().left+"px");
	}
	else if(menuAry[0].name=="!Nav"){
		$("#mainmenu").fadeOut("fast",function(){$("#navmenu").show();});
	}
	else if(menuAry[0].name=="!Menu"){
		$("#navmenu").fadeOut("fast",function(){$("#mainmenu").show();});
	}
	else if(menuAry[0].name=="!Palette"){
		if(document.getElementById("colorPalette").style.display=="none"){
			document.getElementById("colorPalette").style.display="";
			if(document.getElementById("colorPalette").offsetLeft<0){
				document.getElementById("colorPalette").style.left = "0px";
			}
			else if(document.getElementById("colorPalette").offsetLeft + document.getElementById("colorPalette").offsetWidth > window.innerWidth){
				document.getElementById("colorPalette").style.left = window.innerWidth - document.getElementById("colorPalette").offsetWidth + "px";
			}
			if(document.getElementById("colorPalette").offsetTop<0){
				document.getElementById("colorPalette").style.top = "0px";
			}
			else if(document.getElementById("colorPalette").offsetTop + document.getElementById("colorPalette").offsetHeight > window.innerHeight-48){
				document.getElementById("colorPalette").style.top = window.innerHeight-48 - document.getElementById("colorPalette").offsetHeight + "px";
			}
		}else{
			document.getElementById("colorPalette").style.display="none";
		}
	}
	else{
		$("#overrayBack").get(0).onclick = function(){$("#overrayBack").hide();$("#dummy_menu").fadeOut("fast");};
		$("#overrayBack").show();
		//
		$("#menu_select-menu2").html("");
		var width = $("#dummy_menu").width();
		for(var i=0; i<menuAry.length; i++){
			var menuLine = menuitemTranslate(menuAry[i].name);
			var enabled = menuAry[i].enabled;
			if(menuLine=="-"){
				$("#menu_select-menu2").append("<hr />");
				continue;
			}
			$("#menu_select-menu2").append("<li id='menu_select2_"+i+"' class='ui-menu-item ui-state-none"+(enabled?"":" ui-state-disabled")+"'><a >"+
					menuLine+"</a></li>");
		}
		setTimeout(function(){
			var menuCmd = {};
			for(var i=0; i<menuAry.length; i++){
				var menuLine = menuAry[i];
				if(menuLine.enabled){
					menuCmd["menu_select2_"+i] = menuLine.name;
					$("#menu_select2_"+i).bind("click",function(e){
						$("#overrayBack").hide();$("#dummy_menu").fadeOut("fast");
						execMenu(menuCmd[this.id]);
						e.preventDefault();
					});
				}

				$("#menu_select2_"+i).bind("touchstart",menuitemtouchstart);
				$("#menu_select2_"+i).bind("touchmove",menuitemtouchmove);
				$("#menu_select2_"+i).bind("touchend",menuitemtouchend);
				$("#menu_select2_"+i).hover(
						function(){
							$('#'+this.id).addClass('ui-state-hover');
							$('#'+this.id).removeClass('ui-state-none');
						},function(){
							$('#'+this.id).removeClass('ui-state-hover');
							$('#'+this.id).addClass('ui-state-none');
						}
				);
			}
		},0);
		//
		setTimeout(function(){
			$("#dummy_menu").css("top",($(window).height()-$("#dummy_menu").height()-40)+"px");
			if($("#dummy_menu").offset().top < 0){
				$("#dummy_menu").css("top","0px");
			}
			if($("#dummy_menu").offset().left+$("#dummy_menu").width()+20>$(window).width()){
				$("#dummy_menu").css("left",($(window).width()/2-$("#dummy_menu").width()/2)+"px");
			}
		},0);
		setTimeout(function(){
			window.scroll(0, 1);
		},0);
		$("#dummy_menu").show();
		$("#dummy_menu").css("top","-9999px");
		$("#dummy_menu").css("left",$('#'+btnid).offset().left+"px");
	}
}

function openMenu(menuTitle,btnid){
	if('createTouch' in document /*&& document.activeElement.blur */&& document.activeElement.tagName!="BODY"){
		//iOSでかつキーボードが開いていたら閉じる
		//document.activeElement.blur();
		var s = document.getElementById("messageboxDiv").style.display;
		document.getElementById("messageboxDiv").style.display="";
		document.getElementById("messagebox").focus();
		document.getElementById("messageboxDiv").style.display=s;
		setTimeout(function(){document.getElementById("messagebox").blur();},0);
	}
	makeMenu(menuTitle,btnid);
}

function menubtninit(){
	$("button").bind("touchstart",menubtntouchstart);
	$("button").bind("touchmove",menubtntouchmove);
	$("button").bind("touchend",menubtntouchend);
}

function menubtntouchstart(e){
	var target = e.target.parentNode;
	target.touchPoint = {x:event.changedTouches[0].pageX, y:event.changedTouches[0].pageY};
	$("#"+target.id).addClass('ui-state-hover');
}
function menubtntouchmove(e){
	var target = e.target.parentNode;
	if(Math.abs(event.changedTouches[0].pageX - target.touchPoint.x) +
			Math.abs(event.changedTouches[0].pageY - target.touchPoint.y)>20){
		$("#"+target.id).removeClass('ui-state-hover');
	}
}
function menubtntouchend(e){
	var target = e.target.parentNode;

	if($("#"+target.id).hasClass('ui-state-hover')){
		$("#"+target.id).removeClass('ui-state-hover');
		$("#"+target.id).click();
	}
}


function menuitemtouchstart(e){
	var target = e.target;
	if(target.id=="") target = e.target.parentNode;
	target.touchPoint = {x:event.changedTouches[0].pageX, y:event.changedTouches[0].pageY};
	$("#"+target.id).addClass('ui-state-hover');
	$("#"+target.id).removeClass('ui-state-none');
	e.preventDefault();
}
function menuitemtouchmove(e){
	var target = e.target;
	if(target.id=="") target = e.target.parentNode;
	if(Math.abs(event.changedTouches[0].pageX - target.touchPoint.x) +
			Math.abs(event.changedTouches[0].pageY - target.touchPoint.y)>20){
		$("#"+target.id).removeClass('ui-state-hover');
		$("#"+target.id).addClass('ui-state-none');
	}
	e.preventDefault();
}
function menuitemtouchend(e){
	var target = e.target;
	if(target.id=="") target = e.target.parentNode;
	if($("#"+target.id).hasClass('ui-state-hover')){
		$("#"+target.id).removeClass('ui-state-hover');
		$("#"+target.id).addClass('ui-state-none');
		$("#"+target.id).click();
	}
	e.preventDefault();
}

function menubtn(){
	$("button").removeClass('ui-state-hover');
}

//--
//メニュー実行
function execMenu(menuName, menuElem){
	var menuLower = menuName.toLowerCase();
	//スタック
	if(menuLower=="quit"||menuLower=="quit hypercard"){
		location.href="stackinfo.jsp?author="+userParameter+"&name="+(encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26"));
		return true;
	}
	if(menuLower=="save"){
		mmsgSendSystemEvent("save");
		return true;
	}
	//編集
	if(menuLower=="undo"){
		if(inPaintMode){
			if(paint.undoBuf!=undefined){
				var canvas = document.getElementById('picture');
				var ctx = canvas.getContext('2d');
				paint.redoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
				ctx.putImageData(paint.undoBuf, 0, 0);
				ctx.clearRect(0,0,0.1,0.1);
				paint.undoBuf = undefined;
				saveCanvas();
				var floatElem = document.getElementById('floatingCanvas');
				if(floatElem!=undefined){
					floatElem.parentNode.removeChild(floatElem);
				}
				var svg = document.getElementById('floatingSvg');
				if(svg!=undefined)svg.parentNode.removeChild(svg);
			}
			return true;
		}
	}
	if(menuLower=="redo"){
		if(inPaintMode){
			if(paint.redoBuf!=undefined){
				var canvas = document.getElementById('picture');
				var ctx = canvas.getContext('2d');
				paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
				ctx.putImageData(paint.redoBuf, 0, 0);
				ctx.clearRect(0,0,0.1,0.1);
				paint.redoBuf = undefined;
				saveCanvas();
			}
			return true;
		}
	}
	if(menuLower=="copy" || menuLower=="cut"){
		if(inPaintMode){
			var floatElem = document.getElementById('floatingCanvas');
			if(floatElem!=undefined){
				var ctx = floatElem.getContext('2d');
				paint.clipboard = {};
				paint.clipboard.imgdata = ctx.getImageData(0,0,floatElem.width,floatElem.height);
				paint.clipboard.x = floatElem.offsetLeft;
				paint.clipboard.y = floatElem.offsetTop;
				paint.clipboard.width = floatElem.offsetWidth;
				paint.clipboard.height = floatElem.offsetHeight;
				paint.clipboard.floatMask = paint.floatMask;
				paint.clipboard.floatMaskWidth = paint.floatMaskWidth;
				if(menuLower=="cut"){
					floatElem.parentNode.removeChild(floatElem);
					var svg = document.getElementById('floatingSvg');
					if(svg!=undefined)svg.parentNode.removeChild(svg);
					saveCanvas();
				}
			}
			return true;
		}
	}
	if(menuLower=="paste"){
		if(document.getElementById('resourceEditor').style.display!='none' && document.getElementById('rsrcMain').style.display=='none'){
			pasteRsrcItem();
		}
		else if(inPaintMode){
			if(paint.clipboard!=undefined){
				selectEndFunc();
				var canvElm;
				if(paint.clipboard.width==stackData1.width&&paint.clipboard.height==stackData1.height){
					changeTool('lasso');
					canvElm = newFloatingCanvas(paint.clipboard.x, paint.clipboard.y, paint.clipboard.width, paint.clipboard.height,"default","");
					paint.floatMask = paint.clipboard.floatMask;
					paint.floatMaskWidth = paint.clipboard.floatMaskWidth;
				}else{
					changeTool('select');
					canvElm = newFloatingCanvas(paint.clipboard.x, paint.clipboard.y, paint.clipboard.width, paint.clipboard.height);
					paint.floatMask = paint.clipboard.floatMask;
					paint.floatMaskWidth = paint.clipboard.floatMaskWidth;
				}
				//canvasに描画
				var ctx = canvElm.getContext('2d');
				ctx.putImageData(paint.clipboard.imgdata,0,0);
				if(paint.clipboard.width==stackData1.width&&paint.clipboard.height==stackData1.height){
					newFloatingSvg();
					var svg = document.getElementById('floatingSvg');
					svg.style.left=paint.clipboard.x+"px";
					svg.style.top=paint.clipboard.y+"px";
					//アリの更新表示
					svg.innerHTML = makeLassoPath2();
				}
			}
			return true;
		}
		else{
			mmsgSendSystemEvent("pasteObj",{basetype:system.editBackground?"background":"card"});
			return true;
		}
	}
	if(menuLower=="scaling card"){
		if(lockScaling){
			lockScaling = false;
		}
		else{
			lockScaling = true;
			cardScale = 1.0;
		}
		windowResize();
		return true;
	}
	if(menuLower=="master edit mode"){
		if(userId==userParameter){
			masterEditMode = !masterEditMode;
			var elms = document.getElementsByClassName("Footer");
			for(var i=0; i<elms.length; i++){
				elms[i].className = masterEditMode?"H Footer":"Footer";
			}
			mmsgSendSystemEvent("masterEditMode",{masterEditMode:masterEditMode});
			mmsgSendSystemEvent("loadStackData");
		}else{
			alert("Owner of this stack can change Master Edit Mode.");
		}
		return true;
	}
	if(menuLower=="resource editor…"){
		openRsrcEditor('icon');
		return true;
	}
	if(menuLower=="help…"){
		$("#helpDialog").dialog("open");
		return true;
	}
	if(menuLower=="message" || menuLower=="message nofocus"){
		var msg = document.getElementById('messageboxDiv');
		if(msg.style.display=='none'){
			msg.style.display = '';
			msg.style.width = (window.innerWidth<512?window.innerWidth:512) + "px";
			document.getElementById('messagebox').style.width = parseInt(msg.style.width)-(navigator.userAgent.match(/iPad/i)?18:4) + "px";
			msg.style.left = document.body.scrollWidth/2 - msg.offsetWidth/2 + "px";
			msg.style.top = document.getElementById("par").offsetHeight - 40 + "px";
			if(msg.offsetTop + msg.offsetHeight > window.innerHeight){
				msg.style.top = (document.getElementById("par").offsetHeight - msg.offsetHeight) + "px";
			}
			if(menuLower!="message nofocus"){
				document.getElementById('messagebox').focus();
			}
		}
		else{
			msg.style.display='none';
		}
		return true;
	}
	if(menuLower=="navigator"){
		openMenu('Nav');
		return true;
	}
	//objects menu
	if(menuLower=="card info…"){
		if(keys[keycode_shift]) scriptEditorObj(currentCardObj);
		else showCardInfo(currentCardObj);
		return true;
	}
	if(menuLower=="background info…"){
		if(keys[keycode_shift]) scriptEditorObj(currentBgObj);
		else showBackgroundInfo(currentBgObj);
		return true;
	}
	if(menuLower=="stack info…"){
		if(keys[keycode_shift]) scriptEditorObj(stackData);
		else showStackInfo();
		return true;
	}
	//paint menu
	if(menuLower=="select all"){
		if(selectedTool=="lasso") lassoAllFunc();
		else {
			changeTool('select');
			selectAllFunc();
		}
		return true;
	}
	if(menuLower=="delete all"){
		changeTool('select');
		selectAllFunc();
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem!=undefined){
			floatElem.parentNode.removeChild(floatElem);
			var svg = document.getElementById('floatingSvg');
			if(svg!=undefined)svg.parentNode.removeChild(svg);
	
			var canv = document.getElementById('picture');
			canv.getContext('2d').clearRect(0,0,1,1);
			//saveCanvas();
			if(!masterEditMode){
				if(system.editBackground){
					currentBgObj.bitmapLocal = null;
					changeObject2(currentBgObj, "bitmapLocal");
				}else{
					currentCardObj.bitmapLocal = null;
					changeObject2(currentCardObj, "bitmapLocal");
				}
				var bitmap = system.editBackground?currentBgObj.bitmap:currentCardObj.bitmap;
				var img = new Image();
				var url = null;
				if(bitmap!=""){
					url = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(bitmap);
					/*if(window.sessionStorage!=undefined){
						if(sessionStorage[bitmap]!=undefined) url = sessionStorage[bitmap];
					}*/
					img.onload = function() {
						document.getElementById('picture').getContext('2d').drawImage(img, 0, 0);
						//saveCanvas();
					};
					img.src = url;
				}
			}else{
				if(system.editBackground){
					currentBgObj.bitmap = null;
					changeObject2(currentBgObj, "bitmap");
				}else{
					currentCardObj.bitmap = null;
					changeObject2(currentCardObj, "bitmap");
				}
			}
		}
		return true;
	}
	if(menuLower=="zoom in"){
		paint.scale *= 2.0;
		changeZoom();
		return true;
	}
	if(menuLower=="zoom out"){
		paint.scale /= 2.0;
		changeZoom();
		return true;
	}
	if(menuLower=="reverse selection"){
		if(selectedTool!="lasso"&&selectedTool!="magicwand"){
			alert("select tool lasso or magicwand.");
			return true;
		}
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			alert("no selection");
			return true;
		}
		//スワップ
		var pic = document.getElementById('picture');
		picture.id = "floatingCanvas";
		floatElem.id = "picture";
		floatElem.style.left = "0px";
		floatElem.style.top = "0px";
		pic.parentNode.removeChild(floatElem);
		pic.parentNode.insertBefore(floatElem,pic);
		//選択範囲の反転
		for(var i=0; i<paint.floatMask.length; i++){
			paint.floatMask[i] = paint.floatMask[i]>0?0:1;
		}
		//アリの行進表示
		var svg = document.getElementById('floatingSvg');
		svg.innerHTML = makeLassoPath2();
		return true;
	}
	if(menuLower=="expand selection"){
		if(selectedTool!="lasso"&&selectedTool!="magicwand"){
			alert("select tool lasso or magicwand.");
			return true;
		}
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			alert("no selection");
			return true;
		}
		var width = paint.floatMaskWidth;
		var height = paint.floatMask.length/paint.floatMaskWidth;
		var floatMask2 = new Int8Array(paint.floatMask.length);
		for(var i=0; i<floatMask2.length; i++){
			floatMask2[i] = paint.floatMask[i];
		}
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var op = floatMask2[v*width+h];
				if(op==0){
					if(v>0 && floatMask2[(v-1)*width+h]!=0 ||
							v<height-1 && floatMask2[(v+1)*width+h]!=0 ||
							h>0 && floatMask2[v*width+h-1]!=0 ||
							h<width-1 && floatMask2[v*width+h+1]!=0 )
					{
						paint.floatMask[v*width+h] = 1;
					}
				}
			}
		}
		//アリの行進表示
		var svg = document.getElementById('floatingSvg');
		svg.innerHTML = makeLassoPath2();
		return true;
	}
	if(menuLower=="fill"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			execMenu('select all');
			floatElem = document.getElementById('floatingCanvas');
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = paint.floatMask[v*width+h];
				if(mask>0){
					fltData.data[v*width*4+h*4+3] = 255;
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData,0,0);
		replaceFillColorFunc(floatElem);
		return true;
	}
	if(menuLower=="invert"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			execMenu('select all');
			floatElem = document.getElementById('floatingCanvas');
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = paint.floatMask[v*width+h];
				if(mask>0){
					for(i=0;i<3;i++){
						fltData.data[v*width*4+h*4+i] = 255-fltData.data[v*width*4+h*4+i];
					}
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData,0,0);
		return true;
	}
	if(menuLower=="pickup"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			return true;
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		var pic = document.getElementById('picture');
		var offLeft = floatElem.offsetLeft;
		var offTop = floatElem.offsetTop;
		var srcWidth = pic.width;
		var srcData = pic.getContext('2d').getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = paint.floatMask[v*width+h];
				if(mask>0){
					for(i=0;i<4;i++){
						fltData.data[v*width*4+h*4+i] = srcData.data[(offTop+v)*srcWidth*4+(offLeft+h)*4+i];
					}
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData,0,0);
		return true;
	}
	if(menuLower=="darken"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			execMenu('select all');
			floatElem = document.getElementById('floatingCanvas');
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = paint.floatMask[v*width+h];
				if(mask>0){
					for(i=0;i<3;i++){
						var d = fltData.data[v*width*4+h*4+i]-20;
						if(d<0) d=0;
						fltData.data[v*width*4+h*4+i] = d;
					}
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData,0,0);
		return true;
	}
	if(menuLower=="lighten"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			execMenu('select all');
			floatElem = document.getElementById('floatingCanvas');
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = paint.floatMask[v*width+h];
				if(mask>0){
					for(i=0;i<3;i++){
						var d = fltData.data[v*width*4+h*4+i]+20;
						if(d>255) d=255;
						fltData.data[v*width*4+h*4+i] = d;
					}
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData,0,0);
		return true;
	}
	if(menuLower=="flip horizontal"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			execMenu('select all');
			floatElem = document.getElementById('floatingCanvas');
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		var fltData2 = ftx.getImageData(0,0,width,height);
		var width = paint.floatMaskWidth;
		var height = paint.floatMask.length/paint.floatMaskWidth;
		var floatMask2 = new Int8Array(paint.floatMask.length);
		for(var i=0; i<floatMask2.length; i++){
			floatMask2[i] = paint.floatMask[i];
		}
		//真の高さと幅を求める
		var tleft=width;
		var ttop=height;
		var tright=0;
		var tbottom=0;
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = floatMask2[v*width+h];
				if(mask>0){
					if(tleft>h)tleft=h;
					if(ttop>v)ttop=v;
					if(tright<h)tright=h;
					if(tbottom<v)tbottom=v;
				}
			}
		}
		var twidth = tright-tleft+1;
		var theight = tbottom-ttop+1;
		for(var v=ttop;v<ttop+theight;v++){
			for(var h=tleft;h<tleft+twidth;h++){
				var mask = floatMask2[v*width+h];
				paint.floatMask[v*width+(tleft+twidth-1-(h-tleft))]=mask;
				for(i=0;i<4;i++){
					fltData2.data[v*width*4+(tleft+twidth-1-(h-tleft))*4+i] = fltData.data[v*width*4+h*4+i];
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData2,0,0);
		//アリの行進表示
		var svg = document.getElementById('floatingSvg');
		svg.innerHTML = makeLassoPath2();
		return true;
	}
	if(menuLower=="flip vertical"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			execMenu('select all');
			floatElem = document.getElementById('floatingCanvas');
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		var fltData2 = ftx.getImageData(0,0,width,height);
		var width = paint.floatMaskWidth;
		var height = paint.floatMask.length/paint.floatMaskWidth;
		var floatMask2 = new Int8Array(paint.floatMask.length);
		for(var i=0; i<floatMask2.length; i++){
			floatMask2[i] = paint.floatMask[i];
		}
		//真の高さと幅を求める
		var tleft=width;
		var ttop=height;
		var tright=0;
		var tbottom=0;
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = floatMask2[v*width+h];
				if(mask>0){
					if(tleft>h)tleft=h;
					if(ttop>v)ttop=v;
					if(tright<h)tright=h;
					if(tbottom<v)tbottom=v;
				}
			}
		}
		var twidth = tright-tleft+1;
		var theight = tbottom-ttop+1;
		for(var v=ttop;v<ttop+theight;v++){
			for(var h=tleft;h<tleft+twidth;h++){
				var mask = floatMask2[v*width+h];
				paint.floatMask[(ttop+theight-1-(v-ttop))*width+h]=mask;
				for(i=0;i<4;i++){
					fltData2.data[(ttop+theight-1-(v-ttop))*width*4+h*4+i] = fltData.data[v*width*4+h*4+i];
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData2,0,0);
		//アリの行進表示
		var svg = document.getElementById('floatingSvg');
		svg.innerHTML = makeLassoPath2();
		return true;
	}
	if(menuLower=="opaque"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			execMenu('select all');
			floatElem = document.getElementById('floatingCanvas');
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = paint.floatMask[v*width+h];
				if(mask>0){
					if(fltData.data[v*width*4+h*4+3]==0){
						for(i=0;i<3;i++){
							fltData.data[v*width*4+h*4+i] = 255;
						}
					}
					fltData.data[v*width*4+h*4+3] = 255;
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData,0,0);
		return true;
	}
	if(menuLower=="transparent"){
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem==undefined){
			execMenu('select all');
			floatElem = document.getElementById('floatingCanvas');
		}
		var ftx = floatElem.getContext('2d');
		var width = floatElem.width;
		var height = floatElem.height;
		var fltData = ftx.getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var mask = paint.floatMask[v*width+h];
				if(mask>0){
					if(fltData.data[v*width*4+h*4+0]==255 && fltData.data[v*width*4+h*4+1]==255 && fltData.data[v*width*4+h*4+2]==255){
						fltData.data[v*width*4+h*4+3] = 0;
					}
				}
			}
		}
		ftx.clearRect(0,0,1,1);
		ftx.putImageData(fltData,0,0);
		return true;
	}
	if(menuLower=="scale selection…"){
		$("#paintScaleDialog").dialog('open');
		return true;
	}
	//script editor
	if(menuLower=="show as javascript…"){
		convertHT2("show");
	}
	if(menuLower=="open card script"){
		scriptEditorObj(currentCardObj);
	}
	if(menuLower=="open background script"){
		scriptEditorObj(currentBgObj);
	}
	if(menuLower=="open stack script"){
		scriptEditorObj(stackData1);
	}
	if(menuLower=="correct indentation"){
		scriptIndent();
	}
	//rsrc editor
	if(menuLower=="new item"){
		newRsrcItem();
		return true;
	}
	if(menuLower=="cut item"){
		cutRsrcItem();
		return true;
	}
	if(menuLower=="copy item"){
		copyRsrcItem();
		return true;
	}
	if(menuLower=="delete item"){
		deleteRsrcItem();
		return true;
	}
	if(menuLower=="show information…"){
		$("#rsrcItemDialog").dialog('open');
		return true;
	}
	if(menuLower=="image size…"){
		$("#rsrcImageSizeDialog").dialog('open');
		return true;
	}
	if(menuLower=="undo rsrcitem"){
		var x = rsrcData;
		rsrcData = JSON.parse(JSON.stringify(undoRsrc2));
		undoRsrc = x;
		undoRsrc2 = x;
		var title = document.getElementById("rsrcListCenter").rsrcTitle;
		selectRsrcTitle(title);
		return true;
	}
	if(menuLower=="upload file paint…"){
		$("#uploadFileDialog").dialog('open');
		return true;
	}
	if(menuLower=="upload file rsrc…"){
		$("#uploadFileDialog").dialog('open');
		return true;
	}
	//return false;
	mmsgSendSystemEvent("menu",menuLower);
	return true;
}

function changeClipBoard(waited){
	var clipWindowMain = document.getElementById('clipWindowMain');
	if(clipWindowMain.childNodes.length>0){
		for(var i=0; i<clipWindowMain.childNodes.length; i++){
			var clipChild = clipWindowMain.childNodes[i];
			if(clipChild.tagName=="P"){
				clipChild = clipWindowMain.childNodes[i].childNodes[0];
				if(clipChild==undefined) continue;
			}
			if(clipChild.tagName=="IMG"){
				//画像貼付け
				if(!clipChild.complete && waited!=true){
					setTimeout(function(){changeClipBoard(true);},200);
				}
				clipWindowMain.blur();
				alert('security error.');
				//セキュリティエラーになる。getImageDataできない。
				/*var canvElm = document.createElement("canvas");
				canvElm.id = "tmpClipCanvas";
				canvElm.width = clipWindowMain.childNodes[0].width;
				canvElm.height = clipWindowMain.childNodes[0].height;
				clipWindowMain.appendChild(canvElm);
				var ctx = canvElm.getContext('2d');
				ctx.drawImage(clipChild,0,0);
				paint.clipboard = {};
				paint.clipboard.imgdata = ctx.getImageData(0,0,canvElm.width,canvElm.height);
				paint.clipboard.x = 0;
				paint.clipboard.y = 0;*/
			}
		}
	}
}



function showRecent(cardHistory, cardData){
	var currentCardElem = document.getElementById('cardBack');
	var offset = 30;
	var cnt=0;
	var saveElm = [];
	for(var i=Math.max(0,cardHistory.length-16); i<=cardHistory.length; i++){
		saveElm[cnt] = i;
		setTimeout(function(){
			//icon表示がおかしくならないように、一枚ずつ出力して終わったのはchildNodesのidを消す
			var prevElem = document.getElementById("recent"+saveElm.length);
			if(prevElem!=null){
				for(var j=0; j<prevElem.childNodes.length; j++){
					prevElem.childNodes[j].id='';
					if(prevElem.childNodes[j].childNodes[0]!=undefined){
						prevElem.childNodes[j].childNodes[0].id='';
					}
				}
			}
			//html出力
			var i = saveElm.pop(0);
			var id;
			if(cardHistory.length==i) id = currentCardObj.id;
			else id = cardHistory[i];
			var newElem = makenewhtml(cardData[id]);
			newElem.id = "recent"+saveElm.length;
			newElem.cardid = id;
			newElem.style.marginTop = offset+"px";
			newElem.style.marginLeft = -stackData1.width/2+"px";
			newElem.style.left = "50%";
			newElem.style['-webkit-transform'] = "scale(0.5)";
			newElem.style.boxShadow = "4px 4px 8px #000";
			newElem.onmouseover = function(){this.style.outline="4px solid #88F";};
			newElem.onmouseout = function(){this.style.outline="0px solid #88F";};
			newElem.onmousedown = function(){
				document.getElementById("footer1").style.display = "";
				innerGoCard(cardData[this.cardid]);
				currentCardElem.parentNode.style.height=stackData1.height+'px';
				for(var cnt=0; cnt<16; cnt++){
					var recent = document.getElementById("recent"+cnt);
					var recentName = document.getElementById("recentName"+cnt);
					if(recent!=undefined){
						recent.parentNode.removeChild(recent);
						recentName.parentNode.removeChild(recentName);
					}
				}
				touchInit();
			};

			var cardNameElm = document.createElement("div");
			cardNameElm.id = "recentName"+saveElm.length;
			cardNameElm.style.position = "absolute";
			cardNameElm.style.color = "#FFF";
			cardNameElm.style.top = offset+stackData1.height/2-20+"px";
			cardNameElm.style.left = "50%";
			cardNameElm.style.marginLeft = stackData1.width/4+20+"px";
			cardNameElm.style['-webkit-text-shadow'] = "0px 1px 2px #000";
			cardNameElm.style['text-shadow'] = "0px 1px 2px #000";
			if(cardData[id].name!=""){
				cardNameElm.textContent = "card \""+cardData[id].name+"\"";
			}
			else{
				cardNameElm.textContent = "card id "+id;
			}
			currentCardElem.parentNode.parentNode.appendChild(cardNameElm);
			//DOM追加
			currentCardElem.parentNode.parentNode.insertBefore(newElem,currentCardElem.parentNode);
			offset += stackData1.height/2+16;
		},cnt*100);
		cnt++;
	}

	setTimeout(function(){
		for(var i=1; i<=16; i++){
			var newElemId = "recent"+i;
			var newElem = document.getElementById(newElemId);
			if(newElem==null) break;
			newElem.ontouchstart = function(){this.onmouseover();};
			newElem.ontouchmove = function(){this.onmouseout();};
			newElem.ontouchend = function(){this.onmousedown();};
		}
	},500);

	document.getElementById("footer1").style.display = "none";
	touchInitClear();

	currentCardElem.parentNode.style.height='0px';
}

var inPaintMode=false;
function changeTool(toolname){
	if(toolname=="text"){ toolname = "type"; }
	if(toolname=="bucket"){ toolname = "paintbucket"; }//hyperzebra側に合わせてるけど、hypertalkに合わせるべきか？

	var cardBack = document.getElementById(paint.elem);
	var icardBack = cardBack;
	if(paint.elem!="cardBack"){
		icardBack = document.getElementById('scaledCanvas');
	}
	if(icardBack){
		icardBack.removeEventListener("mousedown",xPaintDown,false);
		icardBack.removeEventListener("touchstart",pseudoPaintDown,false);
		icardBack.removeEventListener("touchend",pseudoPaintUp,false);
		icardBack.removeEventListener("touchmove",pseudoPaintMove,false);
	}
	document.body.removeEventListener("mouseup",xPaintUp,false);
	document.body.removeEventListener("mousemove",xPaintMove,false);


	hideBtnAnchor();

	if(paintEndFunction[selectedTool]!=undefined){
		paintEndFunction[selectedTool]();
	}

	var lastSelectedTool = selectedTool;
	selectedTool = toolname;
	var innerGoCardFlag = false;

	if(lastSelectedTool!="browse"&&lastSelectedTool!="button"&&lastSelectedTool!="field"&&
			(toolname=="browse"||toolname=="button"||toolname=="field"))
	{
		innerGoCardFlag = true;
		innerGoCard(currentCardObj);
		document.getElementById("colorPalette").style.display="none";
		setColorPaletteVisibility("hidden",3);
		paint.scale = 1.0;
		paint.scroll.x = 0;
		paint.scroll.y = 0;
		inPaintMode = false;
	}

	buttonDef=buttonDef0;
	fieldDef=fieldDef0;
	document.getElementById('button-palette').style.display = 'none';
	document.getElementById('field-palette').style.display = 'none';

	touchInitClear();

	if(toolname=="browse"){
		if(!innerGoCardFlag) innerGoCard(currentCardObj);
		buttonDef=buttonDef1;
		fieldDef=fieldDef1;

		windowResize();

		changeMenuTitles(browseMenus);
		touchInit();

		//disabledを元に戻す
		//var childs = document.getElementById('cardBack').childNodes;
		//for(var i in childs){
		//	if((childs[i].id+"").match(/button-.*/) && childs[i].xdisabled){
		//		childs[i].disabled = true;
		//		delete childs[i].xdisabled;
		//		childs[i].style.color = "";
		//	}
		//}
	}
	else if(toolname=="button"){
		if(!innerGoCardFlag) innerGoCard(currentCardObj);
		buttonDef=buttonDef2;

		var nav = document.getElementById('button-palette');
		nav.style.display = 'block';
		document.getElementById('button-palette1').style.left = window.innerWidth/2-document.getElementById('button-palette1').offsetWidth/2+"px";
		windowResize();
		$('#button-palette1 div').draggable({
			revert:true,
			start:setDropArea,
			stop:clearDropArea,
		});

		changeMenuTitles("Stack","Edit","Go","Tools","Objects");
		touchInit();

		setTimeout(function(){
			//disabledだとmouseoverも何も発生しないので・・・
			var childs = document.getElementById('cardBack').childNodes;
			for(var i in childs){
				if((childs[i].id+"").match(/(bg-)*button-.+/) && childs[i].disabled){
					childs[i].disabled = false;
					//childs[i].xdisabled = true;
					childs[i].style.color = "#888";
				}
			}
			for(var i in childs){
				if((childs[i].id+"").match(/(bg-)*button-.+/)){
					if(childs[i].className.indexOf("opaque")!=-1 || childs[i].className.indexOf("transparent")!=-1){
						childs[i].style.border = "1px dotted #000";
					}
				}
			}
		},300);
	}
	else if(toolname=="field"){
		if(!innerGoCardFlag) innerGoCard(currentCardObj);
		fieldDef=fieldDef2;

		var nav = document.getElementById('field-palette');
		nav.style.display = 'block';
		document.getElementById('field-palette1').style.left = window.innerWidth/2-document.getElementById('field-palette1').offsetWidth/2+"px";
		windowResize();
		$('#field-palette1 div').draggable({
			revert:true,
			start:setDropArea,
			stop:clearDropArea,
		});

		changeMenuTitles("Stack","Edit","Go","Tools","Objects");
		touchInit();

		setTimeout(function(){
			var childs = document.getElementById('cardBack').childNodes;
			for(var i in childs){
				if((childs[i].id+"").match(/(bg-)*field-.+/)){
					if(childs[i].className.indexOf("opaque")!=-1 || childs[i].className.indexOf("transparent")!=-1){
						childs[i].style.border = "1px dotted #000";
					}
				}
			}
		},300);
	}
	else{
		inPaintMode = true;
		paint.toolname=toolname;
		windowResize();

		//イベントリスナー設定
		var icardBack = cardBack;
		if(paint.elem!="cardBack"){
			icardBack = document.getElementById('scaledCanvas');
		}
		if(icardBack){
			if(!('createTouch' in document)){
				icardBack.addEventListener("mousedown",xPaintDown,false);
				document.body.addEventListener("mouseup",xPaintUp,false);
				document.body.addEventListener("mousemove",xPaintMove,false);
			}
			else{
				icardBack.addEventListener("touchstart",pseudoPaintDown,false);
				icardBack.addEventListener("touchend",pseudoPaintUp,false);
				icardBack.addEventListener("touchmove",pseudoPaintMove,false);
			}
		}

		if(document.getElementById('picture')==undefined){
			//canvas用意
			var canvElm = document.createElement('canvas');
			canvElm.id = "picture";
			canvElm.width = stackData1.width;
			canvElm.height = stackData1.height;
			canvElm.style.position = "absolute";
			canvElm.style.top = "0px";
			canvElm.style.left = "0px";
			//canvElm.draggable = false;
			canvElm.oncontextmenu = function(){return false;};
			var base = system.editBackground?"bg":"card";
			var imgElm = document.getElementById(base+'-picture');
			if(imgElm){
				imgElm.parentNode.insertBefore(canvElm,imgElm);
				imgElm.parentNode.removeChild(imgElm);
			}

			var bitmap = system.editBackground?currentBgObj.bitmap:currentCardObj.bitmap;
			var bitmapLocal = null;
			if(!masterEditMode){
				bitmapLocal = system.editBackground?currentBgObj.bitmapLocal:currentCardObj.bitmapLocal;
			}
			var img = new Image();
			var url = null;
			if(bitmap!=""||bitmapLocal!=null){
				if(bitmapLocal!=null){
					url = "getfile?user="+userId+"&path=data/"+userParameter+"/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(bitmap);
				}
				else{
					url = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(bitmap);
				}
				/*if(window.sessionStorage!=undefined){
					if(sessionStorage[bitmap]!=undefined) url = sessionStorage[bitmap];
				}*/
				img.onload = function() {
					document.getElementById('picture').getContext('2d').drawImage(img, 0, 0);
					saveCanvas();
				};
				img.src = url;
			}

			//temporaryのcanvas
			var canvElm2 = document.createElement('canvas');
			canvElm2.id = "tmpCanvas";
			canvElm2.width = stackData1.width;
			canvElm2.height = stackData1.height;
			canvElm2.style.visibility = "hidden";
			canvElm.parentNode.insertBefore(canvElm2,canvElm);
		}

		var cursor = paintCursor[toolname];
		if(isChrome()&&cursor.indexOf("url(")!=-1){
			cursor = "default";//chromeでcursorのhotspotが効かない
		}
		setCursorFunc(cursor);

		if(cardBack){
			cardBack.style["-webkit-user-select"]="none";
			cardBack.onselectstart=function(){return false;};
			for(var i=0; i<cardBack.childNodes.length; i++){
				//フィールド
				if(cardBack.childNodes[i].style!=undefined){
					cardBack.childNodes[i].contentEditable=false;
					cardBack.childNodes[i].style["-webkit-user-select"]="none";
					cardBack.childNodes[i].style.overflow="hidden";
					cardBack.childNodes[i].onmouseup="";
					cardBack.childNodes[i].onmousedown="";
					cardBack.childNodes[i].onmouseout="";
					cardBack.childNodes[i].onmouseover="";
					cardBack.draggable=false;
				}
			}
		}

		changeMenuTitles("Paint","Edit2","Tools","Palette","Effect");

		//plt
		document.getElementById('plt-stroke').style.visibility = "";
		document.getElementById('plt-stroke').style.width = "65px";
		document.getElementById('plt-fill').style.visibility = "";
		document.getElementById('plt-fill').style.width = "65px";
		document.getElementById('plt-brush').style.visibility = "hidden";
		document.getElementById('plt-brush').style.width = "0px";
		document.getElementById('plt-font').style.visibility = "hidden";
		document.getElementById('plt-font').style.width = "0px";
		switch(toolname){
		case "eraser":
			//document.getElementById("colorPalette").style.visibility="hidden";
			setColorPaletteVisibility("hidden",3);
			break;
		case "brush":
		case "line":
			document.getElementById('plt-brush').style.visibility = "";
			document.getElementById('plt-brush').style.width = "65px";
			changeBrush();
		case "pencil":
		case "type":
			if(toolname=="type"||toolname=="text"){
				document.getElementById('plt-font').style.visibility = "";
				document.getElementById('plt-font').style.width = "65px";
				changeFont();
			}
			setColorPaletteTab("stroke");
			//document.getElementById('colorPalette').style.visibility='visible';
			document.getElementById('plt-fill').style.visibility = "hidden";
			document.getElementById('plt-fill').style.width = "0px";
			drawColorPalette();
			break;
		case "rect":
		case "oval":
			document.getElementById('plt-brush').style.visibility = "";
			document.getElementById('plt-brush').style.width = "65px";
			changeBrush();
			setColorPaletteTab("stroke");
			//document.getElementById('colorPalette').style.visibility='visible';
			document.getElementById('plt-fill').style.visibility = "";
			drawColorPalette();
			break;
		case "select":
		case "lasso":
		case "magicwand":
		case "paintbucket":
			setColorPaletteTab("fill");
			document.getElementById('plt-stroke').style.visibility = "hidden";
			document.getElementById('plt-stroke').style.width = "0px";
		default:
			//document.getElementById('colorPalette').style.visibility='visible';
			document.getElementById('plt-fill').style.visibility = "";
		drawColorPalette();
		}

		if(document.getElementById('colorPalette').style.top=="0px"){
			document.getElementById('colorPalette').style.top=window.innerHeight-48-document.getElementById('colorPalette').offsetHeight+"px";
			document.getElementById('colorPalette').style.left=window.innerWidth/2-document.getElementById('colorPalette').offsetWidth/2+"px";
		}
		setTimeout(function(){
			if(document.getElementById('colorPalette').offsetTop<0){
				document.getElementById('colorPalette').style.top = "0px";
			}
			if(document.getElementById('colorPalette').offsetLeft+document.getElementById('colorPalette').offsetWidth > window.innerWidth){
				document.getElementById('colorPalette').style.left = window.innerWidth-document.getElementById('colorPalette').offsetWidth+"px";
			}
		},0);
	}
	mmsgSyncProperty("system","selectedTool",selectedTool);
}

function xPaintDown(e){
	if(paint.elem=="cardBack"){
		e.xx = (e.pageX - $('#par').width()/2)/getCardScale()+$('#par').width()/2;
		e.yy = (e.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#par').height()/2+ - getCardTop();
	}
	else{
		e.xx = (e.pageX - document.getElementById("rsrcBack").offsetLeft - document.getElementById("resourceEditor").offsetLeft- document.getElementById("rsrcMain").offsetLeft);
		e.yy = (e.pageY - document.getElementById("rsrcBack").offsetTop);
		e.xx += document.getElementById("rsrcMain").offsetLeft - paint.scale*0.25;
		e.yy += document.getElementById("rsrcMain").offsetTop - paint.scale*0.25;
	}
	paintDownFunction[paint.toolname](e);
}
function xPaintUp(e){
	if(paint.elem=="cardBack"){
		e.xx = (e.pageX - $('#par').width()/2)/getCardScale()+$('#par').width()/2;
		e.yy = (e.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#par').height()/2+ - getCardTop();
	}
	else{
		e.xx = (e.pageX - document.getElementById("rsrcBack").offsetLeft - document.getElementById("resourceEditor").offsetLeft- document.getElementById("rsrcMain").offsetLeft);
		e.yy = (e.pageY - document.getElementById("rsrcBack").offsetTop);
		e.xx += document.getElementById("rsrcMain").offsetLeft - paint.scale*0.25;
		e.yy += document.getElementById("rsrcMain").offsetTop - paint.scale*0.25;
	}
	paintUpFunction[paint.toolname](e);
}
function xPaintMove(e){
	if(paint.elem=="cardBack"){
		e.xx = (e.pageX - $('#par').width()/2)/getCardScale()+$('#par').width()/2;
		e.yy = (e.pageY - $('#par').height()/2 - getCardTop())/getCardScale()+$('#par').height()/2+ - getCardTop();
	}
	else{
		e.xx = (e.pageX - document.getElementById("rsrcBack").offsetLeft - document.getElementById("resourceEditor").offsetLeft- document.getElementById("rsrcMain").offsetLeft);
		e.yy = (e.pageY - document.getElementById("rsrcBack").offsetTop);
		e.xx += document.getElementById("rsrcMain").offsetLeft - paint.scale*0.25;
		e.yy += document.getElementById("rsrcMain").offsetTop - paint.scale*0.25;
	}
	paintMoveFunction[paint.toolname](e);
	e.preventDefault();
	return false;
}

var pseudoPaintObj = {identifier:"",x:0,y:0};

function pseudoPaintDown(event){
	if(event.touches.length==1){
		pseudoPaintObj.identifier = event.touches[0].identifier;
		pseudoPaintObj.x = event.touches[0].pageX;
		pseudoPaintObj.y = event.touches[0].pageY;
		event.pageX = pseudoPaintObj.x;
		event.pageY = pseudoPaintObj.y;
		xPaintDown(event);
		event.preventDefault();
	}
}
function pseudoPaintUp(event){
	for(var i=0; i<event.touches.length; i++){
		if(event.touches[i].identifier==pseudoPaintObj.identifier){
			return; //まだこの指は離してない
		}
	}
	event.pageX = pseudoPaintObj.x;
	event.pageY = pseudoPaintObj.y;
	pseudoPaintObj.identifier = "";
	xPaintUp(event);
	event.preventDefault();
}
function pseudoPaintMove(event){
	for(var i=0; i<event.touches.length; i++){
		if(event.touches[i].identifier==pseudoPaintObj.identifier){
			pseudoPaintObj.x = event.touches[0].pageX;
			pseudoPaintObj.y = event.touches[0].pageY;
			event.pageX = pseudoPaintObj.x;
			event.pageY = pseudoPaintObj.y;
			xPaintMove(event);
			event.preventDefault();
		}
	}
}

function clearDropArea(){
	$('#dropArea').droppable("destroy");
	$('#dropArea').hide();
}
function setDropArea(){
	$('#dropArea').droppable("destroy");
	$('#dropArea').droppable({
		hoverClass:"cardBackHover",
		drop:cardDrop,
	});
	var cardBack = $('#cardBack').parent();
	$('#dropArea').css("left",window.innerWidth/2-cardBack.width()*getCardScale()/2+"px");
	$('#dropArea').css("top",$('#par').height()/2+getCardTop()-cardBack.height()*getCardScale()/2+"px");
	$('#dropArea').css("width",cardBack.width()*getCardScale()+"px");
	$('#dropArea').css("height",cardBack.height()*getCardScale()+"px");
	$('#dropArea').show();
}

function changeMenuTitles(x){
	var args = [];
	if(typeof x == "object"){
		args = x;
	}else{
		for(var i=0; i<arguments.length; i++){
			args[i] = {name:arguments[i], enabled:true};
		}
	}
	var menuname = {};
	for(var i=0; i<8; i++){
		if(!args[i]){
			document.getElementById('menubtn'+(i+1)).style.display = "none";
			continue;
		}
		document.getElementById('menubtn'+(i+1)).style.display = "";
		menuname['menubtn'+(i+1)] = args[i].name;
		document.getElementById('menubtn'+(i+1)).childNodes[0].childNodes[0].textContent = menuTranslate(args[i].name);
		document.getElementById('menubtn'+(i+1)).onmousedown = function(){menubtn();openMenu(menuname[this.id],this.id);};
		document.getElementById('menubtn'+(i+1)).childNodes[0].className = "ui-button-text" + (!args[i].enabled?" ui-state-disabled":"");
	}
}

function setCursorFunc(cursor){
	if(!inPaintMode){
		var cardBack = document.getElementById("cardBack").parentNode;
	}
	else if(paint.elem=="cardBack"){
		var picElem = document.getElementById(paint.picElem);
		if(!picElem) return;
		cardBack = picElem.parentNode;
		if(!cardBack)return;
	}else{
		cardBack = document.getElementById("scaledCanvas");
		if(!cardBack)return;
	}
	cardBack.style.cursor = cursor;
	for(var i=0; i<cardBack.childNodes.length; i++){
		//カーソル
		if(!cardBack.childNodes[i].style)continue;
		cardBack.childNodes[i].style.cursor = cursor;
		for(var j=0; j<cardBack.childNodes[i].childNodes.length; j++){
			if(cardBack.childNodes[i].childNodes[j].style!=undefined){
				cardBack.childNodes[i].childNodes[j].style.cursor = cursor;
			}
		}
	}
}

function menuTranslate(v){
	if(browserLang=="ja"){
		switch(v){
		case "Stack":
			return "スタック";
		case "Edit":
			return "編集";
		case "Tools":
			return "ツール";
		case "Go":
			return "ゴー";
		case "Fonts":
			return "文字";
		case "Paint":
			return "ペイント";
		case "Edit2":
			return "編集";
		case "Palette":
			return "パレット";
		case "Effect":
			return "効果";
		case "Objects":
			return "オブジェクト";
		}
	}
	else{
		switch(v){
		case "Edit2":
			return "Edit";
		}
	}
	return v;
}

function menuitemTranslate(v, forceLang){
	if(forceLang=="ja" || browserLang=="ja"){
		switch(v){
		case "Browse":
			return "ブラウズ";
		case "Button":
			return "ボタン";
		case "Field":
			return "フィールド";
		case "Select":
			return "選択";
		case "Lasso":
			return "投げ縄";
		case "MagicWand":
			return "同色選択";
		case "Pencil":
			return "鉛筆";
		case "Brush":
			return "ブラシ";
		case "Eraser":
			return "消しゴム";
		case "Line":
			return "直線";
		case "Rect":
			return "四角形";
		case "Oval":
			return "楕円";
		case "PaintBucket":
			return "バケツ";
		case "Type":
			return "文字";

		case "About HCjs…":
			return "HCjsについて…";
		case "Save":
			return "保存";
		case "Quit":
			return "終了";

		case "Undo":
			return "取り消し";
		case "Cut":
			return "カット";
		case "Copy":
			return "コピー";
		case "Paste":
			return "ペースト";
		case "New Card":
			return "新規カード";
		case "New Background":
			return "新規バックグラウンド";
		case "Delete Card":
			return "カード削除";
		case "Scaling Card":
			return "画面の拡大縮小";
		case "Master Edit Mode":
			return "マスター編集モード";
		case "Background":
			return "バックグラウンド";
		case "Resource Editor…":
			return "リソース編集…";

		case "Back":
			return "バック";
		case "Help…":
			return "ヘルプ…";
		case "Recent…":
			return "履歴…";
		case "First":
			return "最初";
		case "Prev":
			return "前";
		case "Next":
			return "次";
		case "Last":
			return "最後";
		case "Find…":
			return "検索…";
		case "Message":
			return "メッセージ";
		case "Navigator":
			return "ナビゲーター";

		case "Card Info…":
			return "カード情報…";
		case "Background Info…":
			return "バックグラウンド情報…";
		case "Stack Info…":
			return "スタック情報…";

		case "Zoom in":
			return "ズームイン";
		case "Zoom out":
			return "ズームアウト";
		case "Select All":
			return "すべてを選択";
		case "Delete All":
			return "すべてを削除";
		case "Reverse Selection":
			return "選択範囲を反転";
		case "Expand Selection":
			return "選択範囲を広げる";
		case "Convert Color…":
			return "色変換…";
		case "Filter…":
			return "フィルター…";
		case "Scale Selection…":
			return "選択範囲の拡大縮小…";
		case "Rotate Selection…":
			return "選択範囲の回転…";
		case "Fill":
			return "塗りつぶし";
		case "Invert":
			return "色反転";
		case "Pickup":
			return "ピックアップ";
		case "Flip Horizontal":
			return "横反転";
		case "Flip Vertical":
			return "縦反転";
		case "Opaque":
			return "不透明";
		case "Transparent":
			return "透明";
		case "Upload File Paint…":
			return "ファイルをアップロード…";

		case "New Item":
			return "新規アイテム";
		case "Show Information…":
			return "情報を見る…";
		case "Cut Item":
			return "カット";
		case "Copy Item":
			return "コピー";
		case "Delete Item":
			return "削除";
		case "Image Size…":
			return "画像サイズ…";
		case "Undo RsrcItem":
			return "取り消し";
		case "Upload File Rsrc…":
			return "ファイルをアップロード…";

		case "Open Card Script":
			return "カードスクリプトを開く";
		case "Open Background Script":
			return "バックグラウンドスクリプトを開く";
		case "Open Stack Script":
			return "スタックスクリプトを開く";
		case "Show as JavaScript…":
			return "JavaScriptとして表示…";
		case "Correct Indentation":
			return "インデントを合わせる";

		}
	}
	else{
		switch(v){
		case "Undo RsrcItem":
			return "Undo";
		case "Upload File Rsrc…":
			return "Upload File…";
		case "Upload File Paint…":
			return "Upload File…";
		}
	}
	return v;
}

function alertTranslate(v){
	if(browserLang=="ja"){
		switch(v){
		case "Resource item operation failure.":
			return "リソース項目の操作に失敗しました";
		case "Add Type":
			return "Type追加";
		case "Input Resource Type":
			return "リソースタイプを入力してください";
		case "Resource Type should be 4 characters.":
			return "リソースタイプは4文字です";
		case "Change image size failure.":
			return "画像サイズの変更に失敗しました";
		case "Can't load this image.":
			return "画像を読み込めませんでした";
		case "File type is not PNG. Do you edit this image?":
			return "PNG画像ではありませんが、編集しますか?元画像の情報が失われてしまう恐れがあります。";
		case "To use new extenal, to Reload/Reopen this stack.":
			return "新しいexternalを使用するにはスタックを開き直してください。";
		case "This stack is protected. So HCjs save changes at personal area.":
			return "このスタックは保護されているため、変更はパーソナルエリアに保存されます。";
		}
	}
	return v;
}