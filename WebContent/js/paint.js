"use strict";

var paintCursor ={
		select:"crosshair",
		lasso:"url(img/cr_Lasso.cur),auto",
		magicwand:"url(img/cr_MagicWand.cur),auto",
		pencil:"url(img/cr_Pencil.cur),auto",
		brush:"default",
		eraser:"url(img/cr_Eraser.cur),auto",
		line:"crosshair",
		rect:"crosshair",
		oval:"crosshair",
		paintbucket:"url(img/cr_PaintBucket.cur),auto",
		type:"text",
		spoit:"url(img/cr_Spoit.cur),auto",
};
var paintDownFunction ={
		select:selectDownFunc,
		lasso:lassoDownFunc,
		magicwand:magicwandDownFunc,
		pencil:pencilDownFunc,
		brush:brushDownFunc,
		eraser:eraserDownFunc,
		line:lineDownFunc,
		rect:rectDownFunc,
		oval:ovalDownFunc,
		paintbucket:paintbucketDownFunc,
		type:typeDownFunc,
};
var paintUpFunction ={
		select:selectUpFunc,
		lasso:lassoUpFunc,
		magicwand:magicwandUpFunc,
		pencil:pencilUpFunc,
		brush:brushUpFunc,
		eraser:eraserUpFunc,
		line:lineUpFunc,
		rect:rectUpFunc,
		oval:ovalUpFunc,
		paintbucket:paintbucketUpFunc,
		type:typeUpFunc,
};
var paintMoveFunction ={
		select:selectMoveFunc,
		lasso:lassoMoveFunc,
		magicwand:magicwandMoveFunc,
		pencil:pencilMoveFunc,
		brush:brushMoveFunc,
		eraser:eraserMoveFunc,
		line:lineMoveFunc,
		rect:rectMoveFunc,
		oval:ovalMoveFunc,
		paintbucket:paintbucketMoveFunc,
		type:typeMoveFunc,
};
var paintEndFunction ={
		select:selectEndFunc,
		lasso:selectEndFunc,
		magicwand:selectEndFunc,
		type:typeEndFunc,
};
/*var paintDoubleClickFunction ={
	select:selectAllFunc,
	lasso:lassoAllFunc,
	//magicwand:magicwandAllFunc,
	pencil:zoomInOutFunc,
	eraser:eraseAllFunc,
	rect:fillShapeOnOffFunc,
	oval:fillShapeOnOffFunc,
};*/

var paint = {
		elem:"cardBack",
		picElem:"picture",
		toolname:"",
		//描画用
		path:[],
		strokeColor:"",
		//アンドゥ
		undoBuf:undefined,
		redoBuf:undefined,
		//拡大
		scale:1.0,
		scroll:{x:0,y:0,},
		//カラー
		paletteTab:"stroke",
		foreColor:"#000000",//strokeColor
		backColor:"#ffffff",
		opacity:1.0,
		selectedColorId:"forecolor",
		colorMode:"color", //fillColor
		fillColor:"#000000",
		fillOpacity:1.0,
		linearPoints:[{loc:0,x:80,y:0,color:"rgba(0,0,0,0.5)"},{loc:1,x:80,y:160,color:"rgba(255,255,255,1.0)"}],
		radialPoints:[{loc:0,x:80,y:80,r:0,color:"rgba(0,0,0,0.5)"},{loc:1,x:80,y:81,r:80,color:"rgba(255,255,255,1.0)"}],
		colorLevel:256,//4,8,256
		paletteColor:undefined,//vivid,pastel,sepia
		inGradColorSelect:undefined,
		//バケツ
		patternId:null,//塗り用。ブラシ用はbrush.texture
		patternImg:[],
		patternScale:1.0,
		scaleToFit:false,
		ptnForeColor:"rgba(255,255,255,1.0)",
		ptnBackColor:"rgba(0,0,0,1.0)",
		//マジックワンド
		distance:8,
		//長方形、楕円
		fillShape:true,
		//選択領域
		floatMask:undefined,
};

var brush = {
		size:3,
		shapeSize:1,
		style:"round",
		texture:"none",
		textureImg:undefined,
};

function colorRGB(r,g,b,a){
	if(a==0){r=255;g=255;b=255;}
	r = +r;
	g = +g;
	b = +b;
	a = +a;
	return "#"+("0"+r.toString(16)).slice(-2)+("0"+g.toString(16)).slice(-2)+("0"+b.toString(16)).slice(-2);
}

function rgbColor(color){
	if(color.charAt(0)=="#"){
		return {r:parseInt(color.substring(1,3),16), 
			g:parseInt(color.substring(3,5),16), 
			b:parseInt(color.substring(5,7),16),};
	}
	if(color.substring(0,5)=="rgba("){
		var myRe = /rgba\((.*),(.*),(.*),(.*)\)/;
		var myArray = myRe.exec(color);
		return {r:myArray[1], g:myArray[2], b:myArray[3], opacity:myArray[4],};
	}
	return undefined;
}

function rgbaColor(color,opacity){
	var rgb = rgbColor(color);
	return "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+opacity+")";
}

function downCmdKey(evt){
	if(isMacOS()) return evt.metaKey;
	return evt.altKey;
}

function downCopyKey(evt){
	if(isMacOS()) return evt.altKey;
	return evt.ctrlKey;
}

//--
//保存
var paintHttpRequest;
function saveCanvas(){
	if(stackData1.cantModify) return;//変更不可なので何もしない
	var canvas = document.getElementById(paint.picElem);
	if(canvas==undefined)return;
	var data = canvas.toDataURL();
	var filename = "";
	var baseObj = null;
	var baseRsrc = null;
	if(paint.elem=="cardBack"){
		baseObj = system.editBackground?currentBgObj:currentCardObj;
		filename = "BMAP_"+baseObj.id+" 2.png";
	}else{
		var rsrcT = rsrcData[document.getElementById("rsrcListCenter").rsrcTitle];
		baseRsrc = rsrcT[selectedRsrcItemId];
		filename = baseRsrc.file.split(/[2]*\..{1,3}$/)[0]+"2.png";
		for(var rid in rsrcT){
			if(rid!=selectedRsrcItemId && rsrcT[rid].file==filename){
				filename = baseRsrc.file.split(/[2]*\..{1,3}$/)[0]+((Math.random()*9899|0)+100)+".png";
			}
		}
	}

	if(paintHttpRequest!=undefined){
		paintHttpRequest.abort();//通信が残っていればキャンセル
	}
	paintHttpRequest = new XMLHttpRequest();
	var request = paintHttpRequest;
	request.drawCnt = 0;
	request.endFlag = false;
	request.baseObj = baseObj;
	request.baseRsrc = baseRsrc;
	request.upload.onprogress = function(e){
		//document.getElementById('messagebox').value = ((e.loaded / e.total) * 100 + "%");
	};
	request.upload.onload = function(e){
		//document.getElementById('messagebox').value = 'finished';
	};
	request.onreadystatechange = function() {
		//var msg = document.getElementById('messagebox');
		if (request.readyState == 4) {
			if (request.status == 200) {
				request.endFlag = true;
				//msg.value = "";
				if(request.baseObj){
					if(!request.baseObj.showPict) request.baseObj.showPict = true;
					if(!masterEditMode) request.baseObj.bitmapLocal = filename+"?"+(+new Date());
					else request.baseObj.bitmap = filename+"?"+(+new Date());//キャッシュが効くのを防止
					changeObject2(request.baseObj, "bitmap", "noRefresh");
				}
				if(request.baseRsrc){
					if(!masterEditMode) request.baseRsrc.fileLocal = filename;
					else request.baseRsrc.file = filename;
					changeRsrc();
				}
				//changedStack = true;
				//mmsgSendStackObj();
				paintHttpRequest = undefined;
			} else {
				request.endFlag = true;
				//msg.value = "通信に失敗しました。";
			}
		} else {
			//msg.value = "通信中…";
		}
	};

	var hd = "setfile?user="+userId+"&path=data/"+userParameter+"/";
	if(masterEditMode){
		hd = "setfile?user="+userParameter+"&path=stack/";
	}
	request.open('post', hd+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/"+encodeURI(filename)+"&mime=base64png", true );
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send("text="+data);

	/*if(window.sessionStorage){
		//古い画像がキャッシュされているため、sessionStorageに新しい画像を覚えておく
	    sessionStorage.setItem(filename,data);
	}*/


	drawScaledCanvas();
}

//--
//パレット
function drawColorPalette(){
	if(paint.paletteTab=="brush"){
		if(selectedTool=="brush"){
			document.getElementById("plt-brushSize").value=brush.size;
		}else{
			document.getElementById("plt-brushSize").value=brush.shapeSize;
		}
		for(var i=0; i<document.getElementById("plt-brushStyle").childNodes.length; i++){
			if(document.getElementById("plt-brushStyle").childNodes[i].textContent==brush.style){
				document.getElementById("plt-brushStyle").selectedIndex=i;
			}
		}
		for(var i=0; i<document.getElementById("plt-brushTexture").childNodes.length; i++){
			if(document.getElementById("plt-brushTexture").childNodes[i].textContent==brush.texture){
				document.getElementById("plt-brushTexture").selectedIndex=i;
			}
		}
	}
	else if(paint.colorMode=="color" || paint.paletteTab=="stroke"){
		var brightness = document.getElementById("plt-brightness").value;
		var opacity = (paint.paletteTab=="stroke")?paint.opacity:paint.fillOpacity;
		drawPaletteCanvas(brightness,opacity*255,paint.colorLevel,"plt-canvas");
		var color = paint.foreColor;
		if(paint.paletteTab=="fill") color = paint.fillColor;
		drawPalettePoint("forecolor","plt-canvas",color);
		if(paint.paletteTab=="stroke"){
			drawPalettePoint("backcolor","plt-canvas",paint.backColor);
		}
		document.getElementById("plt-brightness").value=brightness;
		document.getElementById("plt-opacity").value=opacity*255;
	}
	else if(paint.colorMode=="linear"){
		drawLinearCanvas("plt-grad");
	}
	else if(paint.colorMode=="radial"){
		drawRadialCanvas("plt-grad");
		document.getElementById("radialWidth-start").value=paint.radialPoints[0].r;
		document.getElementById("radialWidth-end").value=paint.radialPoints[paint.radialPoints.length-1].r;
	}
	else if(paint.colorMode=="pattern"){
		drawPatternCanvas("plt-patterns");
		document.getElementById("ptn-scaleToFit").checked = paint.scaleToFit;
		document.getElementById("ptn-scale").value = paint.patternScale;
		document.getElementById("ptn-scale").disabled = paint.scaleToFit?false:true;
	}
	if(selectedTool=="rect"||selectedTool=="oval"){
		document.getElementById("plt-tab-nofill").style.visibility = "";
	}else{
		document.getElementById("plt-tab-nofill").style.visibility = "hidden";
	}
}

function setColorPaletteColorMode(mode){
	paint.colorMode=mode;
	drawColorPalette();
	updateColorPaletteColorMode();
	if(mode=="nofill"){
		paint.fillShape = false;
	}else{
		paint.fillShape = true;
	}
}

function updateColorPaletteColorMode(){
	document.getElementById("plt-tab-color").style.borderWidth="0px";
	document.getElementById("plt-tab-linear").style.borderWidth="0px";
	document.getElementById("plt-tab-radial").style.borderWidth="0px";
	document.getElementById("plt-tab-pattern").style.borderWidth="0px";
	document.getElementById("plt-tab-nofill").style.borderWidth="0px";
	document.getElementById("plt-tab-"+paint.colorMode).style.border='2px solid #008';
	if(paint.paletteTab=="brush"||paint.paletteTab=="font"){
		setColorPaletteVisibility("hidden",3);
	}
	else if(paint.inGradColorSelect!=undefined || paint.colorMode=="color" || paint.paletteTab=="stroke"){
		if(document.getElementById("grad-colors").childNodes[0]){
			//このsvgを消さないと、plt-canvasのmousedownが反応しない
			document.getElementById("grad-colors").removeChild(document.getElementById("grad-colors").childNodes[0]);
		}

		setColorPaletteVisibility("visible",3);
		if(paint.paletteTab=="fill"){
			document.getElementById("backcolor").style.visibility="hidden";
			document.getElementById("backcolorRect").style.visibility="hidden";
			document.getElementById("backcolorStr").style.visibility="hidden";
		}

		if(!('createTouch' in document)){
			document.getElementById("forecolor").onmousedown=setColorPoint;
			document.getElementById("backcolor").onmousedown=setColorPoint;
			document.getElementById("plt-canvas").onmousedown=setColorPoint;
			document.getElementById("forecolor").onmousemove=moveColorPoint;
			document.getElementById("backcolor").onmousemove=moveColorPoint;
			document.getElementById("plt-canvas").onmousemove=moveColorPoint;
			document.getElementById("forecolor").onmouseup=endColorPoint;
			document.getElementById("backcolor").onmouseup=endColorPoint;
			document.getElementById("plt-canvas").onmouseup=endColorPoint;
		}else{
			document.getElementById("forecolor").ontouchstart=setColorPoint;
			document.getElementById("backcolor").ontouchstart=setColorPoint;
			document.getElementById("plt-canvas").ontouchstart=setColorPoint;
			document.getElementById("forecolor").ontouchmove=moveColorPoint;
			document.getElementById("backcolor").ontouchmove=moveColorPoint;
			document.getElementById("plt-canvas").ontouchmove=moveColorPoint;
			document.getElementById("forecolor").ontouchend=endColorPoint;
			document.getElementById("backcolor").ontouchend=endColorPoint;
			document.getElementById("plt-canvas").ontouchend=endColorPoint;
		}

		document.getElementById("backcolor").oncontextmenu=function(){return false;};
		//document.getElementById("plt-canvas").oncontextmenu=function(){return false;};
	}
	else if(paint.colorMode=="linear"){
		setColorPaletteVisibility("hidden",1);
		setColorPaletteVisibility("hidden",2);
		document.getElementById("plt-grad").style.visibility="";
		document.getElementById("grad-colors").style.visibility="";
		document.getElementById("grad-buttons").style.visibility="";
		document.getElementById("radialwidth").style.visibility="hidden";
		if(!('createTouch' in document)){
			document.getElementById("grad-colors").onmousemove=moveLinearPoint;
			document.getElementById("grad-colors").onmouseup=upLinearPoint;
		}else{
			//document.getElementById("grad-svg").ontouchmove=moveLinearPoint;
			document.getElementById("grad-colors").ontouchmove=moveLinearPoint;
			document.getElementById("grad-colors").ontouchend=upLinearPoint;
		}
	}
	else if(paint.colorMode=="radial"){
		setColorPaletteVisibility("hidden",1);
		setColorPaletteVisibility("hidden",2);
		document.getElementById("plt-grad").style.visibility="";
		document.getElementById("grad-colors").style.visibility="";
		document.getElementById("grad-buttons").style.visibility="";
		document.getElementById("radialwidth").style.visibility="";
		if(!('createTouch' in document)){
			document.getElementById("grad-colors").onmousemove=moveRadialPoint;
			document.getElementById("grad-colors").onmouseup=upLinearPoint;
		}else{
			//document.getElementById("grad-svg").ontouchmove=moveRadialPoint;
			document.getElementById("grad-colors").ontouchmove=moveRadialPoint;
			document.getElementById("grad-colors").ontouchend=upLinearPoint;
		}
	}
	else if(paint.colorMode=="pattern"){
		setColorPaletteVisibility("hidden",3);
		document.getElementById("plt-patterns").style.visibility="";
		document.getElementById("plt-ptn-btns").style.visibility="";
	}
	else if(paint.colorMode=="nofill"){
		setColorPaletteVisibility("hidden",1);
		setColorPaletteVisibility("hidden",2);
		setColorPaletteVisibility("hidden",3);
	}
}

function setColorPaletteTab(tab){
	paint.paletteTab=tab;
	document.getElementById("pltTabColor").style.visibility="hidden";
	document.getElementById("pltTabBrush").style.visibility="hidden";
	document.getElementById("pltTabFont").style.visibility="hidden";
	if(tab=="brush"){
		document.getElementById("pltTabBrush").style.visibility="";
	}else if(tab=="font"){
		document.getElementById("pltTabFont").style.visibility="";
		makeFontSelect();
	}else{
		document.getElementById("pltTabColor").style.visibility="";
	}
	document.getElementById("plt-stroke").style.background="#aaa";
	document.getElementById("plt-fill").style.background="#aaa";
	document.getElementById("plt-brush").style.background="#aaa";
	document.getElementById("plt-font").style.background="#aaa";
	document.getElementById("plt-"+tab).style.background="#eee";
	if(tab=="fill"){
		document.getElementById("plt-tab-color").parentNode.style.visibility="";
		updateColorPaletteColorMode();
	}else{
		document.getElementById("plt-tab-color").parentNode.style.visibility="hidden";
		updateColorPaletteColorMode();
	}
	//drawColorPalette();
}

function getFontNameList(){
	return ["AcademyEngravedLetPlain",
	        "AmericanTypewriter",
	        "AppleColorEmoji",
	        "AppleSDGothicNeo-Medium",
	        "Arial",
	        "ArialHebrew",
	        "ArialRoundedMTBold",
	        "BanglaSangamMN",
	        "Baskerville",
	        "BodoniSvtyTwoITCTT-Book",
	        "BodoniSvtyTwoOSITCTT-Book",
	        "BodoniSvtyTwoSCITCTT-Book",
	        "BodoniOrnamentsITCTT",
	        "BradleyHandITCTT-Bold",
	        "ChalkboardSE-Regular",
	        "Chalkduster",
	        "Cochin",
	        "Copperplate",
	        "Courier",
	        "CourierNewPSMT",
	        "DBLCDTempBlack",
	        "DevanagariSangamMN",
	        "Didot",
	        "EuphemiaUCAS",
	        "Futura-Medium",
	        "GeezaPro",
	        "Georgia",
	        "GillSans-Light",
	        "GillSans",
	        "GujaratiSangamMN",
	        "GurmukhiMN",
	        "STHeitiSC-Medium",
	        "STHeitiTC-Medium",
	        "Helvetica-Oblique",
	        "HelveticaNeue",
	        "HiraKakuProN-W3",
	        "HiraKakuProN-W6",
	        "HiraMinProN-W3",
	        "HiraMinProN-W6",
	        "HoeflerText-Regular",
	        "Kailasa",
	        "KannadaSangamMN",
	        "MalayalamSangamMN",
	        "Marion-Regular",
	        "MarkerFelt-Thin",
	        "MarkerFelt-Wide",
	        "Noteworthy-Light",
	        "Optima-Regular",
	        "OriyaSangamMN",
	        "Palatino-Roman",
	        "Papyrus",
	        "Party LET",
	        "PartyLetPlain",
	        "SinhalaSangamMN",
	        "SnellRoundhand",
	        "TamilSangamMN",
	        "TeluguSangamMN",
	        "Thonburi",
	        "TimesNewRomanPSMT",
	        "TrebuchetMS",
	        "Verdana",
	        "ZapfDingbatsITC",
	        "Zapfino",
	        ];
}

function makeFontSelect(){
	var fonts = getFontNameList();
	var fontnameElm = document.getElementById("plt-fontname");
	for(var i=0; i<fonts.length; i++){
		var optionElm = document.createElement('option');
		optionElm.textContent = fonts[i];
		fontnameElm.appendChild(optionElm);
	}
}

function setColorPaletteVisibility(prop,type){
	if(type&1){
		document.getElementById("plt-canvas").style.visibility=prop;
	}
	if(type&2){
		document.getElementById("forecolor").style.visibility=prop;
		document.getElementById("forecolorRect").style.visibility=prop;
		document.getElementById("forecolorStr").style.visibility=prop;
		document.getElementById("backcolor").style.visibility=prop;
		document.getElementById("backcolorRect").style.visibility=prop;
		document.getElementById("backcolorStr").style.visibility=prop;
		document.getElementById("plt-brightness").parentNode.style.visibility=prop;
		document.getElementById("plt-opacity").style.visibility=prop;
		document.getElementById("plt-level").parentNode.style.visibility=prop;
	}
	document.getElementById("plt-grad").style.visibility="hidden";
	document.getElementById("grad-colors").style.visibility="hidden";
	document.getElementById("grad-buttons").style.visibility="hidden";

	document.getElementById("plt-patterns").style.visibility="hidden";
	document.getElementById("plt-ptn-btns").style.visibility="hidden";

}

function getHSVValue(rgb){
	return Math.max(rgb.r,rgb.g,rgb.b);
}
function getHSVSaturation(rgb,V){
	if(V==0) return 0;
	return (V-Math.min(rgb.r,rgb.g,rgb.b))/V;
}
function getHSVTrueHue(rgb,V){
	if(V==0) return 0;
	var min = Math.min(rgb.r,rgb.g,rgb.b);
	if(V==min) return 0;
	if(V==rgb.r){
		return 60*(rgb.g-rgb.b)/(V-min);
	}else if(V==rgb.g){
		return 60*(rgb.b-rgb.r)/(V-min)+120;
	}else{
		return 60*(rgb.r-rgb.g)/(V-min)+240;
	}
}

function getHSVHue(rgb,V){
	var hue = getHSVTrueHue(rgb,V);

	if(hue<0) hue+=360;
	//R周辺2:1.25   0- 20:   0- 25
	//            20- 30:  25- 35
	//R周辺3:0.7   30- 70:  35- 63
	//            70-100:  63- 93
	//G周辺2:1.5  100-140:  93-153
	//           140-170: 153-183
	//B周辺1:0.8  170-210: 183-215
	//           210-270: 215-275
	//R周辺1:0.8  270-300: 275-299
	//end  :1.4  300-360: 299-383

	//逆変換
	hue *= 383/360;
	if(hue<25) hue = (hue)/1.25;
	else if(hue<35) hue = 20+(hue-25);
	else if(hue<63) hue = 30+(hue-35)/0.7;
	else if(hue<93) hue = 70+(hue-63);
	else if(hue<153) hue = 100+(hue-93)/1.5;
	else if(hue<183) hue = 140+(hue-153);
	else if(hue<215) hue = 170+(hue-183)/0.8;
	else if(hue<275) hue = 210+(hue-215);
	else if(hue<299) hue = 270+(hue-275)/0.8;
	else hue = 300+(hue-299)/1.4;

	/*if(hue<20) hue = (hue)*1.25;
	else if(hue<30) hue = 25+(hue-20);
	else if(hue<70) hue = 35+(hue-30)*0.7;
	else if(hue<100) hue = 63+(hue-70);
	else if(hue<140) hue = 93+(hue-100)*1.5;
	else if(hue<170) hue = 153+(hue-140);
	else if(hue<210) hue = 183+(hue-170)*0.8;
	else if(hue<270) hue = 215+(hue-210);
	else if(hue<300) hue = 275+(hue-270)*0.8;
	else hue = 299+(hue-300)*1.4;
	hue*=360/383;*/
	return hue;
}

/*function getBrightness(color){
	var rgb = rgbColor(color);
	return (rgb.r*0.3+rgb.g*0.582+rgb.b*0.12)|0;
}*/

function drawPaletteCanvas(V,opacity,level,canvasId){
	var r=90;
	var ctx = document.getElementById(canvasId).getContext('2d');
	var srcData = ctx.getImageData(0,0,r*2,r*2);
	var len=r*2*4;

	var red=0,green=0,blue=0;
	for(var y=0;y<=2*r;y++){
		for(var x=0;x<=2*r;x++){
			var dr = Math.sqrt((x-r)*(x-r)+(y-r)*(y-r));
			if(dr>r) continue;
			//彩度saturation: dr/r
			var hue=0;
			if(x-r!=0){
				hue = Math.atan((y-r)/(x-r));
			}
			if(x<r) hue+=Math.PI;
			if((y-r<0&&(x==r))) hue-=Math.PI/2;
			if((y-r>0&&(x==r))) hue+=Math.PI/2;
			hue *= 180/Math.PI;
			//R周辺2:1.25   0- 20:   0- 25
			//            20- 30:  25- 35
			//R周辺3:0.7   30- 70:  35- 63
			//            70-100:  63- 93
			//G周辺2:1.5  100-140:  93-153
			//           140-170: 153-183
			//B周辺1:0.8  170-210: 183-215
			//           210-270: 215-275
			//R周辺1:0.8  270-300: 275-299
			//end  :1.4  300-360: 299-383

			var S = dr/r+0.01;
			if(S>1)S=1;
			if(hue<0) hue+=360;

			if(level<256){
				var lv = level-1;
				S = ((+S+0.5/lv)/(1/lv)|0)*(1/lv);
				V = ((+V+127/lv)/(255/lv)|0)*(255/lv);
				hue = ((+hue+45/lv)/(90/lv)|0)*(90/lv);
				if(hue>=360) hue-=360;
				opacity = (opacity/(255/lv)|0)*(255/lv);
			}
			if(paint.paletteColor=="vivid"){
				if(S>0.3) S=1;
				else S=0;
			}
			else if(paint.paletteColor=="pastel"){
				V=255;
				S *= 0.5;
			}
			else if(paint.paletteColor=="sepia"){
				S *= 0.5;
			}

			//人の色覚に合わせた色相
			if(hue<20) hue = (hue)*1.25;
			else if(hue<30) hue = 25+(hue-20);
			else if(hue<70) hue = 35+(hue-30)*0.7;
			else if(hue<100) hue = 63+(hue-70);
			else if(hue<140) hue = 93+(hue-100)*1.5;
			else if(hue<170) hue = 153+(hue-140);
			else if(hue<210) hue = 183+(hue-170)*0.8;
			else if(hue<270) hue = 215+(hue-210);
			else if(hue<300) hue = 275+(hue-270)*0.8;
			else hue = 299+(hue-300)*1.4;
			hue*=360/383;
			//HSVからRGBに変換
			if(dr==0){
				red=V;green=V;blue=V;
			}else{
				var Hi = (hue/60|0)%6;
				var f = hue/60-Hi;
				var p = V*(1-S);
				var q = V*(1-f*S);
				var t = V*(1-(1-f)*S);
				switch(Hi){
				case 0: red=V;green=t,blue=p;break;
				case 1: red=q;green=V,blue=p;break;
				case 2: red=p;green=V,blue=t;break;
				case 3: red=p;green=q,blue=V;break;
				case 4: red=t;green=p,blue=V;break;
				case 5: red=V;green=p,blue=q;break;
				}
			}

			srcData.data[y*len+x*4+0]=red;
			srcData.data[y*len+x*4+1]=green;
			srcData.data[y*len+x*4+2]=blue;
			if(dr>r-1){
				srcData.data[y*len+x*4+3]=opacity*(1-(dr-(r-1)));
			}
			else srcData.data[y*len+x*4+3]=opacity;
		}
	}
	ctx.clearRect(0,0,1,1);
	ctx.putImageData(srcData, 0, 0);
}

function drawPalettePoint(svgId,canvasId,color,opacity,changeV){
	var canvas = document.getElementById(canvasId);
	if(svgId=="fillcolor")svgId="forecolor";
	var svg = document.getElementById(svgId);
	var r = 90;
	var pointR = 3;

	//colorからHSVを求める
	var rgb = rgbColor(color);
	var V = getHSVValue(rgb);
	var S = getHSVSaturation(rgb,V);
	var H = getHSVHue(rgb,V);

	var x = r+S*r*Math.cos(H/180*Math.PI);
	var y = r+S*r*Math.sin(H/180*Math.PI);

	svg.style.left = canvas.offsetLeft+x-pointR/2-4+"px";
	svg.style.top = canvas.offsetTop-canvas.parentNode.parentNode.offsetTop+y+4+"px";
	svg.innerHTML='<svg style="z-index:102;">'+
	'<rect x="0.5" y="0.5" stroke="#ffffff" width="10" height="10"/><rect x="0.5" y="0.5" fill="'+color+'" stroke="#000000" width="10" height="10" stroke-dasharray="2 1"/></svg>';

	if(changeV){
		document.getElementById("plt-brightness").value=V;
		document.getElementById("plt-opacity").value=opacity;
		drawPaletteCanvas(V,opacity,paint.colorLevel,canvasId);
	}

	document.getElementById(svgId+'Rect').style.color=color;
	document.getElementById(svgId+'Str').value=color;

	if(brush.textureImg!=undefined&&brush.textureImg.complete) brush.textureImg.onload();
}

function drawLinearCanvas(canvasId){
	//グラデーション塗る
	var x1 = paint.linearPoints[0].x;
	var x2 = paint.linearPoints[paint.linearPoints.length-1].x;
	var y1 = paint.linearPoints[0].y;
	var y2 = paint.linearPoints[paint.linearPoints.length-1].y;
	var ctx = document.getElementById(canvasId).getContext("2d");
	var grd = ctx.createLinearGradient(x1, y1, x2, y2);
	for(var i=0; i<paint.linearPoints.length; i++){
		grd.addColorStop(paint.linearPoints[i].loc, paint.linearPoints[i].color);
	}
	ctx.clearRect(0, 0, 180, 180);
	ctx.fillStyle = grd;
	ctx.fillRect(10, 10, 160, 160);

	//ラインSVG
	var svg = "<svg>";
	svg += "<line x1="+(x1+10.5)+" y1="+(y1+10.5)+" x2="+(x2+10.5)+" y2="+(y2+10.5)+" stroke=#000 />";

	//ポイントSVG
	for(var i=0; i<paint.linearPoints.length; i++){
		var x = (1-paint.linearPoints[i].loc)*x1 + (paint.linearPoints[i].loc)*x2 +10;
		var y = (1-paint.linearPoints[i].loc)*y1 + (paint.linearPoints[i].loc)*y2 +10;
		svg += "<rect x="+(x-4.5)+" y="+(y-4.5)+" width=10 height=10 stroke-width=1 stroke=#000 fill="+paint.linearPoints[i].color;
		if(!('createTouch' in document)){
			svg += " onmousedown='downLinearPoint("+i+");' onmouseup='upLinearPoint(event);' />";
		}else{
			svg += " ontouchstart='downLinearPoint("+i+");' ontouchmove='moveLinearPoint(event);' ontouchend='upLinearPoint(event);' />";
		}
	}

	document.getElementById("grad-colors").innerHTML = svg+"</svg>";
}

function drawRadialCanvas(canvasId){
	//グラデーション塗る
	var x1 = paint.radialPoints[0].x+10;
	var x2 = paint.radialPoints[paint.radialPoints.length-1].x+10;
	var y1 = paint.radialPoints[0].y+10;
	var y2 = paint.radialPoints[paint.radialPoints.length-1].y+10;
	var r1 = paint.radialPoints[0].r;
	var r2 = paint.radialPoints[paint.radialPoints.length-1].r;
	var ctx = document.getElementById(canvasId).getContext("2d");
	var grd = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
	for(var i=0; i<paint.radialPoints.length; i++){
		grd.addColorStop(paint.radialPoints[i].loc, paint.radialPoints[i].color);
	}
	ctx.clearRect(0, 0, 180, 180);
	ctx.fillStyle = grd;
	ctx.fillRect(10, 10, 160, 160);

	//ラインSVG
	var svg = "<svg>";
	svg += "<line x1="+(x1+0.5)+" y1="+(y1+0.5)+" x2="+(x2+0.5)+" y2="+(y2+0.5)+" stroke=#000 />";

	//ポイントSVG
	for(var i=0; i<paint.radialPoints.length; i++){
		var x = (1-paint.radialPoints[i].loc)*x1 + (paint.radialPoints[i].loc)*x2 +0;
		var y = (1-paint.radialPoints[i].loc)*y1 + (paint.radialPoints[i].loc)*y2 +0;
		svg += "<rect x="+(x-4.5)+" y="+(y-4.5)+" width=10 height=10 stroke-width=1 stroke=#000 fill="+paint.radialPoints[i].color;
		if(!('createTouch' in document)){
			svg += " onmousedown='downLinearPoint("+i+");' onmouseup='upLinearPoint(event);' />";
		}else{
			svg += " ontouchstart='downLinearPoint("+i+");' ontouchmove='moveLinearPoint(event);' ontouchend='upLinearPoint(event);' />";
		}
	}

	document.getElementById("grad-colors").innerHTML = svg+"</svg>";

}

function addGradPoint(){
	if(paint.colorMode=="linear"){
		var newpoint = {};
		newpoint.color = "rgba(0,0,0,255)";
		var prev = paint.linearPoints[paint.linearPoints.length-2];
		var next = paint.linearPoints[paint.linearPoints.length-1];
		newpoint.loc = (prev.loc+next.loc)/2;
		paint.linearPoints[paint.linearPoints.length] = next;
		paint.linearPoints[paint.linearPoints.length-2] = newpoint;
		drawLinearCanvas('plt-grad');
	}
	else{
		var newpoint = {};
		newpoint.color = "rgba(0,0,0,255)";
		var prev = paint.radialPoints[paint.radialPoints.length-2];
		var next = paint.radialPoints[paint.radialPoints.length-1];
		newpoint.loc = (prev.loc+next.loc)/2;
		paint.radialPoints[paint.radialPoints.length] = next;
		paint.radialPoints[paint.radialPoints.length-2] = newpoint;
		drawRadialCanvas('plt-grad');
	}
}

function removeGradPoint(){
	if(paint.colorMode=="linear"){
		if(paint.linearPoints.length>=3){
			paint.linearPoints[paint.linearPoints.length-2] = paint.linearPoints[paint.linearPoints.length-1];
			paint.linearPoints.length--;
			drawLinearCanvas('plt-grad');
		}
	}
	else{
		if(paint.radialPoints.length>=3){
			paint.radialPoints[paint.radialPoints.length-2] = paint.radialPoints[paint.radialPoints.length-1];
			paint.radialPoints.length--;
			drawRadialCanvas('plt-grad');
		}
	}
}

var gradPoint=undefined;
var gradPointMove=false;
var gradPointDblclk=false;

function downLinearPoint(i){
	_mouse.button="down";
	if(!gradPointMove&&gradPoint==i){
		gradPointDblclk = true;
	}
	else gradPointDblclk = false;
	gradPoint = i;
	gradPointMove=false;
}

function upLinearPoint(){
	_mouse.button="up";
	if(gradPointDblclk){
		setColorLinearPoint(gradPoint);
		gradPointDblclk = false;
		return;
	}
	setTimeout(function(){
		gradPointDblclk = false;
		gradPoint = undefined;
	},500);
}

function moveLinearPoint(evt){
	gradPointMove = true;
	if(_mouse.button!="down" && !evt.touches) return;
	if(gradPoint==undefined) return;

	if(evt.changedTouches){
		var x = evt.changedTouches[0].pageX;
		var y = evt.changedTouches[0].pageY;
	}else{
		x = evt.pageX;
		y = evt.pageY;
	}
	x = x - document.getElementById("plt-grad").offsetLeft - document.getElementById("plt-grad").parentNode.parentNode.parentNode.offsetLeft;
	y = y - document.getElementById("plt-grad").offsetTop - document.getElementById("plt-grad").parentNode.parentNode.parentNode.offsetTop - document.getElementById("plt-grad").parentNode.offsetTop;
	x-=10;
	y-=10;
	if(x<0)x=0;
	if(y<0)y=0;
	if(x>160)x=160;
	if(y>160)y=160;

	paint.linearPoints[gradPoint].x = x;
	paint.linearPoints[gradPoint].y = y;
	if(gradPoint==0) paint.linearPoints[gradPoint].loc = 0;
	else if(gradPoint==paint.linearPoints.length-1) paint.linearPoints[gradPoint].loc = 1;
	else{
		var dx = Math.abs(paint.linearPoints[paint.linearPoints.length-1].x - paint.linearPoints[0].x);
		var dy = Math.abs(paint.linearPoints[paint.linearPoints.length-1].y - paint.linearPoints[0].y);
		if(dx>dy){
			var loc = (x-paint.linearPoints[0].x)/(paint.linearPoints[paint.linearPoints.length-1].x - paint.linearPoints[0].x);
			if(loc<0)loc=0;
			if(loc>1)loc=1;
			if(!(loc>=0&&loc<=1))loc=0;
			paint.linearPoints[gradPoint].loc = loc;
			paint.linearPoints[gradPoint].y = loc*paint.linearPoints[paint.linearPoints.length-1].y + (1-loc)*paint.linearPoints[0].y;
		}else{
			var loc = (y-paint.linearPoints[0].y)/(paint.linearPoints[paint.linearPoints.length-1].y - paint.linearPoints[0].y);
			if(loc<0)loc=0;
			if(loc>1)loc=1;
			if(!(loc>=0&&loc<=1))loc=0;
			paint.linearPoints[gradPoint].loc = loc;
			paint.linearPoints[gradPoint].x = loc*paint.linearPoints[paint.linearPoints.length-1].x + (1-loc)*paint.linearPoints[0].x;
		}
	}
	if(paint.linearPoints[0].x==paint.linearPoints[paint.linearPoints.length-1].x &&paint.linearPoints[0].y==paint.linearPoints[paint.linearPoints.length-1].y){
		paint.linearPoints[0].x--;
		paint.linearPoints[1].x++;
	}

	drawLinearCanvas('plt-grad');

	return false;
}

function moveRadialPoint(evt){
	gradPointMove = true;
	if(_mouse.button!="down" && !evt.touches) return;
	if(gradPoint==undefined) return;

	var x = evt.pageX - document.getElementById("plt-grad").offsetLeft - document.getElementById("plt-grad").parentNode.parentNode.parentNode.offsetLeft;
	var y = evt.pageY - document.getElementById("plt-grad").offsetTop - document.getElementById("plt-grad").parentNode.parentNode.parentNode.offsetTop - document.getElementById("plt-grad").parentNode.offsetTop;
	x-=10;
	y-=10;
	if(x<0)x=0;
	if(y<0)y=0;
	if(x>160)x=160;
	if(y>160)y=160;

	paint.radialPoints[gradPoint].x = x;
	paint.radialPoints[gradPoint].y = y;
	if(gradPoint==0) paint.radialPoints[gradPoint].loc = 0;
	else if(gradPoint==paint.radialPoints.length-1) paint.radialPoints[gradPoint].loc = 1;
	else{
		var dx = Math.abs(paint.radialPoints[paint.radialPoints.length-1].x - paint.radialPoints[0].x);
		var dy = Math.abs(paint.radialPoints[paint.radialPoints.length-1].y - paint.radialPoints[0].y);
		if(dx>dy){
			var loc = (x-paint.radialPoints[0].x)/(paint.radialPoints[paint.radialPoints.length-1].x - paint.radialPoints[0].x);
			if(loc<0)loc=0;
			if(loc>1)loc=1;
			if(!(loc>=0&&loc<=1))loc=0;
			paint.radialPoints[gradPoint].loc = loc;
			paint.radialPoints[gradPoint].y = loc*paint.radialPoints[paint.radialPoints.length-1].y + (1-loc)*paint.radialPoints[0].y;
		}else{
			var loc = (y-paint.radialPoints[0].y)/(paint.radialPoints[paint.radialPoints.length-1].y - paint.radialPoints[0].y);
			if(loc<0)loc=0;
			if(loc>1)loc=1;
			if(!(loc>=0&&loc<=1))loc=0;
			paint.radialPoints[gradPoint].loc = loc;
			paint.radialPoints[gradPoint].x = loc*paint.radialPoints[paint.radialPoints.length-1].x + (1-loc)*paint.radialPoints[0].x;
		}
	}
	if(paint.radialPoints[0].x==paint.radialPoints[paint.radialPoints.length-1].x &&paint.radialPoints[0].y==paint.radialPoints[paint.radialPoints.length-1].y){
		paint.radialPoints[0].x--;
		paint.radialPoints[1].x++;
	}

	drawRadialCanvas('plt-grad');

	return false;
}

function setColorLinearPoint(i){
	paint.inGradColorSelect=i;
	document.getElementById("plt-tab-color").parentNode.style.visibility="hidden";
	var color = paint.radialPoints[paint.inGradColorSelect].color;
	if(paint.colorMode=="radial") color = paint.radialPoints[paint.inGradColorSelect].color;
	var brightness = getHSVValue(rgbColor(color));
	var opacity = rgbColor(color).opacity;
	drawPaletteCanvas(brightness,opacity*255,paint.colorLevel,"plt-canvas");
	document.getElementById("plt-brightness").value=brightness;
	document.getElementById("plt-opacity").value=opacity*255;
	drawPalettePoint("forecolor","plt-canvas",colorRGB(rgbColor(color).r,rgbColor(color).g,rgbColor(color).b));

	updateColorPaletteColorMode();
}

var patternsAry = [
                   "paper","hairline","cloth",1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,
                   ];
function drawPatternCanvas(canvasParentId){
	//パターン用のcanvas作って描画
	var canvAry = [];
	for(var i=0; i<patternsAry.length; i++){
		var canvElm = document.getElementById("plt-ptn-canv"+i);
		if(canvElm==undefined){
			canvElm = document.createElement('canvas');
			canvElm.id = "plt-ptn-canv"+i;
			canvElm.width = 32;
			canvElm.height = 32;
			canvElm.style.margin = "1px";
			canvElm.style.border = "1px solid #aaa";
			canvElm.onclick = function(){return selectPltPattern(this.id);};
			if(paint.patternId==i){
				canvElm.style.outline = "2px solid #88f";
			}
			document.getElementById("plt-patterns").appendChild(canvElm);
		}
		canvAry[i]=canvElm;
		paint.patternImg[i] = new Image();
		paint.patternImg[i].canvas = canvElm;
		paint.patternImg[i].onload=function(){
			var canv = this.canvas;
			var ctx = canv.getContext('2d');
			ctx.save();
			var scalex = paint.patternScale;
			var scaley = paint.patternScale;
			if(paint.scaleToFit){
				scalex = canv.width/this.width;
				scaley = canv.height/this.height;
			}
			ctx.scale(scalex,scaley);
			ctx.drawImage(this,0,0);
			ctx.restore();
			var buf = ctx.getImageData(0,0,canv.width,canv.height);
			var r = rgbColor(paint.fillColor).r;
			var g = rgbColor(paint.fillColor).g;
			var b = rgbColor(paint.fillColor).b;
			var br = 255;//rgbColor(paint.ptnBackColor).r;
			var bg = 255;//rgbColor(paint.ptnBackColor).g;
			var bb = 255;//rgbColor(paint.ptnBackColor).b;
			for(var y=canv.height-1; y>=0; y--){
				for(var x=canv.width-1; x>=0; x--){
					var t = buf.data[((y%(this.height*scalex|0))*canv.width+x%(this.width*scaley|0))*4+0]/255;
					buf.data[(y*canv.width+x)*4+0] = t*r+(1-t)*br;
					buf.data[(y*canv.width+x)*4+1] = t*g+(1-t)*bg;
					buf.data[(y*canv.width+x)*4+2] = t*b+(1-t)*bb;
					buf.data[(y*canv.width+x)*4+3] = 255;
				}
			}
			ctx.putImageData(buf,0,0);
		};
		if((patternsAry[i]+"").match(/^[0-9]*$/)){
			paint.patternImg[i].src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/PAT_"+patternsAry[i]+".png";
		}else{
			paint.patternImg[i].src = 'img/texture_'+patternsAry[i]+'.png';
		}
	}
}

function selectPltPattern(id){
	var i = id.substring(12);
	paint.patternId = i;
	for(var j=0;j<patternsAry.length;j++){
		document.getElementById("plt-ptn-canv"+j).style.outline = "";
	}
	if(paint.patternId==i){
		document.getElementById(id).style.outline = "2px solid #88f";
	}
}

function changeScaleToFitPattern(){
	paint.scaleToFit = document.getElementById("ptn-scaleToFit").checked;
	paint.patternScale = 1.0;
	drawColorPalette();
	drawPatternCanvas("plt-patterns");
}

function changeScalePattern(){
	paint.patternScale = document.getElementById("ptn-scale").value;
	drawPatternCanvas("plt-patterns");
}

function changeRadialWidth(dir){
	var i=0;
	if(dir=='end')i=paint.radialPoints.length-1;
	paint.radialPoints[i].r = document.getElementById("radialWidth-"+dir).value;
	drawRadialCanvas('plt-grad');
}

function changeBrightness(V,canvasId){
	var opacity = (paint.paletteTab=="stroke")?paint.opacity:paint.fillOpacity;
	drawPaletteCanvas(V,opacity*255,paint.colorLevel,canvasId);
}

function changeOpacity(canvasId){
	var opacity = document.getElementById('plt-opacity').value/255;
	if(paint.paletteTab=="fill") paint.fillOpacity = opacity;
	else paint.opacity = opacity;
	var V = document.getElementById('plt-brightness').value;
	drawPaletteCanvas(V,opacity*255,paint.colorLevel,canvasId);
}

function changeColorStr(id){
	var color = document.getElementById(id+'Str').value;
	drawPalettePoint(id,'plt-canvas',color,document.getElementById("plt-opacity").value,true);
}

function changeLevel(canvasId){
	var select = document.getElementById('plt-level');
	var selval = select.options.item(select.selectedIndex).value;
	paint.colorLevel = +selval.match(/[0-9]*/);
	paint.paletteColor = undefined;
	if(selval.match(/vivid/))paint.paletteColor = "vivid";
	if(selval.match(/pastel/))paint.paletteColor = "pastel";
	if(selval.match(/sepia/))paint.paletteColor = "sepia";
	if(paint.paletteColor!=undefined) paint.colorLevel=256;
	var opacity = document.getElementById('plt-opacity').value;
	var V = document.getElementById('plt-brightness').value;
	drawPaletteCanvas(V,opacity,paint.colorLevel,canvasId);
}

function changeBrush(){
	if(selectedTool=="brush"){
		brush.size = +document.getElementById("plt-brushSize").value;
	}else{
		//brush.shapeSize = +document.getElementById("plt-brushSize").value;
	}
	var i = document.getElementById("plt-brushStyle").selectedIndex;
	brush.style=document.getElementById("plt-brushStyle").childNodes[i+1].textContent.match(/[a-zA-Z]*/);
	i = document.getElementById("plt-brushTexture").selectedIndex;
	brush.texture=document.getElementById("plt-brushTexture").childNodes[i+1].textContent.match(/[0-9a-zA-Z]*/);
	var canv = document.getElementById("textureCanvas");
	var ctx = canv.getContext('2d');
	if(brush.texture=="none") {
		ctx.clearRect(0,0,canv.width,canv.height);
		brush.textureImg=undefined;
	}else{
		brush.textureImg = new Image();
		brush.textureImg.onload=function(){
			ctx.drawImage(brush.textureImg,0,0);
			var buf = ctx.getImageData(0,0,canv.width,canv.height);
			var r = rgbColor(paint.foreColor).r;
			var g = rgbColor(paint.foreColor).g;
			var b = rgbColor(paint.foreColor).b;
			var br = rgbColor(paint.backColor).r;
			var bg = rgbColor(paint.backColor).g;
			var bb = rgbColor(paint.backColor).b;
			for(var y=canv.height-1; y>=0; y--){
				for(var x=canv.width-1; x>=0; x--){
					var t = buf.data[((y%brush.textureImg.height)*canv.width+x%brush.textureImg.width)*4+0]/255;
					buf.data[(y*canv.width+x)*4+0] = t*r+(1-t)*br;
					buf.data[(y*canv.width+x)*4+1] = t*g+(1-t)*bg;
					buf.data[(y*canv.width+x)*4+2] = t*b+(1-t)*bb;
					buf.data[(y*canv.width+x)*4+3] = 255;
				}
			}
			ctx.putImageData(buf,0,0);
		};
		if((brush.texture+"").match(/^[0-9]*$/)){
			brush.textureImg.src = "getfile?user="+userParameter+"&path=stack/"+encodeURI(nameParameter).replace(/\+/g,"%2b").replace(/&/g,"%26")+"/PAT_"+brush.texture+".png";
		}else{
			brush.textureImg.src = 'img/texture_'+brush.texture+'.png';
		}
	}
}

var pfont ={};
function changeFont(){
	pfont.size = document.getElementById("plt-fontSize").value;
	var i = document.getElementById("plt-fontname").selectedIndex;
	pfont.fontname=document.getElementById("plt-fontname").childNodes[i+1].textContent.match(/[^\n]*/)+"";
	//console.log(pfont.fontname);
	if(pfont.fontname.match(/other./)){
		var fname=window.prompt("Input font name", "Arial");
		pfont.fontname="'"+fname+"', sans-serif";
		if(fname.length>0){
			var fontnameElm = document.getElementById("plt-fontname");
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

	pfont.bold = document.getElementById("font-bold").checked;
	pfont.italic = document.getElementById("font-italic").checked;
	pfont.outline = document.getElementById("font-outline").checked;
	pfont.shadow = document.getElementById("font-shadow").checked;

	var areaElm = document.getElementById("typeInputArea");
	if(areaElm!=undefined){
		areaElm.style.font = makeFontStr(pfont);
		areaElm.style.lineHeight = (pfont.size*1.5|0)+"px";
		areaElm.style.color = pfont.outline?"transparent":paint.foreColor;
		areaElm.style.opacity = paint.opacity;
		areaElm.style["-webkit-text-stroke"] = pfont.outline?"1px "+paint.foreColor:"";
		areaElm.style["text-shadow"]="";
		if(pfont.shadow){
			areaElm.style["text-shadow"] = (1+pfont.size/15|0)+"px "+(1+pfont.size/15|0)+"px "+(1+pfont.size/15|0)+"px "+"#000000";
		}
	}
}

function setColorPoint(evt,move){
	_mouse.button="down";
	var x = evt.pageX - document.getElementById("plt-canvas").offsetLeft - document.getElementById("plt-canvas").parentNode.parentNode.parentNode.offsetLeft;
	var y = evt.pageY - document.getElementById("plt-canvas").offsetTop - document.getElementById("plt-canvas").parentNode.parentNode.parentNode.offsetTop - document.getElementById("plt-canvas").parentNode.offsetTop;
	x = parseInt(x);
	y = parseInt(y);

	var canvas = document.getElementById('plt-canvas');
	var ctx = canvas.getContext('2d');
	var srcData = ctx.getImageData(x,y,1,1);
	if(srcData.data[3]>0){
		var color = colorRGB(srcData.data[0],srcData.data[1],srcData.data[2],srcData.data[3]);
		if(!move){
			paint.setColor = this.id;
		}
		if(paint.setColor=="plt-canvas" && paint.paletteTab=="stroke"){
			if(evt.button&2) paint.setColor="backcolor";
			else paint.setColor="forecolor";
		}
		if(paint.paletteTab=="fill"){
			if(paint.inGradColorSelect!=undefined){
				if(paint.colorMode=="linear"){
					paint.linearPoints[paint.inGradColorSelect].color=rgbaColor(color,document.getElementById('plt-opacity').value/255);
					drawLinearCanvas('plt-grad');
				}else{
					paint.radialPoints[paint.inGradColorSelect].color=rgbaColor(color,document.getElementById('plt-opacity').value/255);
					drawRadialCanvas('plt-grad');
				}
			}
			else{
				paint.fillColor=color;
			}
			drawPalettePoint("forecolor","plt-canvas",color);
		}
		else if(paint.setColor=="forecolor"){
			paint.foreColor=color;
			drawPalettePoint(paint.setColor,"plt-canvas",color);
		}
		else if(paint.setColor=="backcolor"){
			paint.backColor=color;
			drawPalettePoint(paint.setColor,"plt-canvas",color);
		}
	}
	return false;
}

function moveColorPoint(evt){
	if(_mouse.button!="down") return;
	if(paint.setColor==undefined) return;
	return setColorPoint(evt,true);
}

function endColorPoint(evt){
	_mouse.button="up";
	paint.setColor=null;

	if(paint.inGradColorSelect!=null){
		paint.inGradColorSelect=null;
		setColorPaletteTab('fill');
	}
	return false;
}

//--
//Util
/*function navBtnDoubleClick(tgt){
	if(tgt.indexOf('button-nav2-')!=-1){
		navBtnDoubleClick2(tgt.substring(12));
	}
}
function navBtnDoubleClick2(tool){
	if(paintDoubleClickFunction[tool]!=undefined){
		paintDoubleClickFunction[tool]();
	}
}*/

function paintMoveFunc(x,y){
	var i = paint.path.length-1;
	if(i<0)return;
	var x1 = paint.path[i].x;
	var y1 = paint.path[i].y;
	paint.path[i+1] = {x:x,y:y};
	var cardwidth = paint.width;
	var cardheight = paint.height;
	paint.scroll.x += (x1-x)/paint.scale;
	paint.scroll.y += (y1-y)/paint.scale;
	if(paint.scroll.x<0)paint.scroll.x=0;
	if(paint.scroll.x>=cardwidth*(paint.scale-1)/paint.scale)paint.scroll.x=cardwidth*(paint.scale-1)/paint.scale;
	if(paint.scroll.y<0)paint.scroll.y=0;
	if(paint.scroll.y>=cardheight*(paint.scale-1)/paint.scale)paint.scroll.y=cardheight*(paint.scale-1)/paint.scale;
	var scl = paint.scale;
	document.getElementById(paint.elem).style["MozTransitionDuration"] = "0s";
	document.getElementById(paint.elem).style["-webkit-transition-duration"] = "0s";
	document.getElementById(paint.elem).style["-webkit-transform"] = "translate("+(-scl*(paint.scroll.x)+(cardwidth*(scl-1))/2|0)+"px,"
	+(-scl*(paint.scroll.y)+(cardheight*(scl-1))/2|0)+"px) scale("+scl+")";
	document.getElementById(paint.elem).style["MozTransform"] = "translate("+(-scl*(paint.scroll.x)+(cardwidth*(scl-1))/2|0)+"px,"
	+(-scl*(paint.scroll.y)+(cardheight*(scl-1))/2|0)+"px) scale("+scl+")";

	drawScaledCanvas();
}

function floatMoveFunc(x,y){
	var i = paint.path.length-1;
	var x1 = paint.path[i].x;
	var y1 = paint.path[i].y;
	if(paint.shiftKey){
		if(i==1){
			if(Math.abs(x1-x)>Math.abs(y1-y)){ paint.shiftDir="x"; }
			else if(Math.abs(x1-x)<Math.abs(y1-y)){ paint.shiftDir="y"; }
			else return;
		}
		if(paint.shiftDir=="x"){y = y1;}
		else{x = x1;}
	}
	paint.path[i+1] = {x:x,y:y};

	var floatElem = document.getElementById('floatingCanvas');
	floatElem.style.left = floatElem.offsetLeft + (x-x1)+"px";
	floatElem.style.top = floatElem.offsetTop + (y-y1)+"px";

	var svg = document.getElementById('floatingSvg');
	if(svg!=undefined){
		svg.style.left = parseInt(svg.style.left) + (x-x1)*paint.scale+"px";
		svg.style.top = parseInt(svg.style.top) + (y-y1)*paint.scale+"px";
		svg.style.zIndex = 101;
	}

	drawScaledCanvas();
}

function myDrawImage(dstCanvas, srcCanvas, left, top){
	//putImageDataだと透明部分までコピーして透明にしてしまうので、合成するルーチン
	var dstCtx = dstCanvas.getContext('2d');
	var dstData = dstCtx.getImageData(0,0,dstCanvas.width, dstCanvas.height);
	var dstLen = dstCanvas.width*4;
	var srcCtx = srcCanvas.getContext('2d');
	var srcData = srcCtx.getImageData(0,0,srcCanvas.width,srcCanvas.height);
	var srcLen = srcCanvas.width*4;
	for(var sy=0; sy<srcCanvas.height; sy++){
		for(var sx=0; sx<srcCanvas.width; sx++){
			if(top+sy<0||top+sy>=dstCanvas.height) continue;
			if(left+sx<0||left+sx>=dstCanvas.width) continue;
			var op = srcData.data[(sy)*srcLen+sx*4+3]/255;
			var dstop = dstData.data[(top+sy)*dstLen+(left+sx)*4+3]/255;
			if(dstop+op==0){
				dstData.data[(top+sy)*dstLen+(left+sx)*4+0] = 0;
				dstData.data[(top+sy)*dstLen+(left+sx)*4+1] = 0;
				dstData.data[(top+sy)*dstLen+(left+sx)*4+2] = 0;
				dstData.data[(top+sy)*dstLen+(left+sx)*4+3] = 0;
				continue;
			}
			var dr = dstData.data[(top+sy)*dstLen+(left+sx)*4+0];
			var dg = dstData.data[(top+sy)*dstLen+(left+sx)*4+1];
			var db = dstData.data[(top+sy)*dstLen+(left+sx)*4+2];
			if(dstop==0){
				dr=255; dg=255; db=255;
			}
			dstData.data[(top+sy)*dstLen+(left+sx)*4+0] = (1-op)*dr + op*srcData.data[sy*srcLen+sx*4+0];
			dstData.data[(top+sy)*dstLen+(left+sx)*4+1] = (1-op)*dg + op*srcData.data[sy*srcLen+sx*4+1];
			dstData.data[(top+sy)*dstLen+(left+sx)*4+2] = (1-op)*db + op*srcData.data[sy*srcLen+sx*4+2];
			dstData.data[(top+sy)*dstLen+(left+sx)*4+3] = ((1-op)*dstop+op)*255;
		}
	}
	dstCtx.putImageData(dstData, 0, 0);
}

function spoitFunc(x,y,id){
	var canvas = document.getElementById(paint.picElem);
	var ctx = canvas.getContext('2d');
	var srcData = ctx.getImageData(x,y,1,1);
	var color = colorRGB(srcData.data[0],srcData.data[1],srcData.data[2],srcData.data[3]);
	drawPalettePoint(id,"plt-canvas",color,srcData.data[3],true);
	if(id=='forecolor') {
		paint.foreColor = color;
		paint.opacity = srcData.data[3]/255;
	}
	if(id=='fillcolor') {
		paint.fillColor = color;
		paint.fillOpacity = srcData.data[3]/255;
	}
}

function setPaintCursor(evt){
	var cursor = null;

	switch(selectedTool){
	case "select":
	case "lasso":
	case "magicwand":
		if(document.getElementById(paint.elem).style.cursor=="move" || document.getElementById(paint.elem).style.cursor=="copy"){
			if(downCopyKey(evt)) cursor="copy";
			else cursor="move";
		}
		break;
	case "pencil":
		if(evt.altKey) cursor=paintCursor["spoit"];
		else if( keys[' '.charCodeAt(0)]){
			cursor="-webkit-grab";
		}
		else if(downCmdKey(evt)){
			if(paint.scale<=2.0)cursor="-webkit-zoom-in";
			else cursor="-webkit-zoom-out";
		}
		else cursor=paintCursor["pencil"];
		break;
	case "eraser":
		break;
	default:
		if(evt.altKey) cursor=paintCursor["spoit"];
		else if(keys[' '.charCodeAt(0)]){
			cursor="-webkit-grab";
		}
		else cursor=paintCursor[selectedTool];
	}

	if(cursor!=null) setCursorFunc(cursor);
}
//--

function selectDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var floatElem = document.getElementById('floatingCanvas');
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		if(floatElem!=undefined && x>=floatElem.offsetLeft && x<floatElem.offsetLeft+floatElem.offsetWidth &&
				y>=floatElem.offsetTop && y<floatElem.offsetTop+floatElem.offsetHeight)
		{
			if(downCopyKey(evt)){
				//選択範囲を複製(=固定して移動)
				var canv = document.getElementById(paint.picElem);
				myDrawImage(canv, floatElem, floatElem.offsetLeft, floatElem.offsetTop);
			}
			{
				//選択範囲を移動
				_mouse.button="down";
				paint.moveFloating = true;
				paint.path = [];
				paint.path[0] = {x:x,y:y};
				paint.shiftKey = evt.shiftKey;
				floatMoveFunc(x,y);
			}
		}else if(floatElem!=undefined && !evt.shiftKey){
			//選択範囲を固定
			selectEndFunc();
			var canv = document.getElementById(paint.picElem);
			canv.getContext('2d').clearRect(0,0,1,1);
			saveCanvas();
		}else{
			//選択範囲を作成(追加)
			_mouse.button="down";
			paint.makeFloating = true;
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			if(floatElem==undefined){
				/*var svg = document.createElement('div');
				svg.id = "floatingSvg";
				svg.style.position="absolute";
				svg.style.left="0px";
				svg.style.top="0px";
				svg.style["pointer-events"] = "none";
				svg.style.width=paint.width+"px";
				svg.style.height=paint.height+"px";
				svg.innerHTML = "<svg></svg>";
				document.getElementById(paint.elem).appendChild(svg);*/
				newFloatingSvg();
			}else{
				//選択範囲の追加
				alert('未実装');
			}
			selectMoveFunc(evt);
		}
	}
}

var floatingSvgTimer = null;

function selectUpFunc(evt){
	if(paint.makeFloating){
		//選択範囲のcanvasを作成(すでにあれば追加)
		var canvElm = document.getElementById('floatingCanvas');
		if(canvElm==undefined){
			var canvas = document.getElementById(paint.picElem);
			var ctx = canvas.getContext('2d');
			paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
			paint.redoBuf = undefined;
			//新規canvas
			var i = paint.path.length-1;
			var left = Math.min(paint.path[i].x,paint.path[0].x);
			var top = Math.min(paint.path[i].y,paint.path[0].y);
			var width = Math.abs(paint.path[i].x-paint.path[0].x);
			var height = Math.abs(paint.path[i].y-paint.path[0].y);
			if(left<0) left=0;
			if(top<0) top=0;
			if(width>paint.width) width=paint.width;
			if(height>paint.height) height=paint.height;
			if(width>0&&height>0){
				canvElm = newFloatingCanvas(left,top,width,height);
				//canvasに描画
				var ctx = document.getElementById(paint.picElem).getContext('2d');
				var buf = ctx.getImageData(left,top,width,height);
				ctx.clearRect(left,top,width,height);
				canvElm.getContext('2d').putImageData(buf, 0, 0);
			}

			//アリの行進を動かす
			if(floatingSvgTimer!=null)clearInterval(floatingSvgTimer);
			floatingSvgTimer=setInterval(function(){
				var svgrect = document.getElementById('floatingSvgRect');
				if(svgrect!=null){
					svgrect.setAttribute("stroke-dashoffset",new Date()/200%4);
				}else{
					clearInterval(floatingSvgTimer);
					floatingSvgTimer=null;
				}
			},200);

			//選択範囲のマスク(矩形)
			var mask = new Int8Array(width*height);
			var maskwidth = width;
			for(var y=0; y<height; y++){
				for(var x=0; x<width; x++){
					mask[x+y*width] = 1;
				}
			}
			paint.floatMask = mask;
			paint.floatMaskWidth = maskwidth;
		}
	}
	_mouse.button="up";
	_mouse.rightclick=false;
	paint.moveFloating = false;
	paint.makeFloating = false;
	paint.path = [];
	//saveCanvas();固定するまでsaveしてはいけない
}

function selectMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down"){
		if(paint.moveFloating){
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			floatMoveFunc(x,y);
		}
		else if(paint.makeFloating){
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			var i = paint.path.length-1;
			paint.path[i+1] = {x:x,y:y};
			var svg = document.getElementById('floatingSvg');
			var left = Math.min(x,paint.path[0].x);
			var top = Math.min(y,paint.path[0].y);
			var width = Math.abs(x-paint.path[0].x);
			var height = Math.abs(y-paint.path[0].y);
			if(svg!=undefined) {
				svg.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\"><rect x="+(left+0.5)+" y="+(top+0.5)+" width="+width+" height="+height+" fill=none stroke=#fff stroke-width=1></rect>"+
				"<rect id=floatingSvgRect x="+(left+0.5)+" y="+(top+0.5)+" width="+width+" height="+height+" fill=none stroke=#000 stroke-width=1 stroke-dasharray='2 2' stroke-dashoffset=0 ></rect></svg>";
				if(paint.scale!=1){
					var cardwidth = paint.width;
					var cardheight = paint.height;
					var scl = paint.scale;
					if(paint.elem=="cardBack"){
						svg.style["-webkit-transform"] = "translate("+(-scl*(paint.scroll.x)+(cardwidth*(scl-1))/2|0)+"px,"
						+(-scl*(paint.scroll.y)+(cardheight*(scl-1))/2|0)+"px) scale("+scl+")";
						svg.style["MozTransform"] = "translate("+(-scl*(paint.scroll.x)+(cardwidth*(scl-1))/2|0)+"px,"
						+(-scl*(paint.scroll.y)+(cardheight*(scl-1))/2|0)+"px) scale("+scl+")";
					}else{
						var xx = (paint.scroll.x*scl);
						var yy = (paint.scroll.y*scl);
						xx -= -paint.width/2*paint.scale;
						yy -= -paint.height/2*paint.scale;
						xx*=1/(scl);
						yy*=1/(scl);
						svg.style["-webkit-transform"] = "translate("+(-scl*(xx)+(cardwidth*(scl-1))/2|0)+"px,"
						+(-scl*(yy)+(cardheight*(scl-1))/2|0)+"px) scale("+scl+")";
						svg.style["MozTransform"] = "translate("+(-scl*(xx)+(cardwidth*(scl-1))/2|0)+"px,"
						+(-scl*(yy)+(cardheight*(scl-1))/2|0)+"px) scale("+scl+")";
					}
				}
			}
		}
	}
	else if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem!=undefined && 
				(x>=floatElem.offsetLeft && x<floatElem.offsetLeft+floatElem.offsetWidth &&
						y>=floatElem.offsetTop && y<floatElem.offsetTop+floatElem.offsetHeight)
		)
		{
			if(downCopyKey(evt)) setCursorFunc("copy");
			else setCursorFunc("move");
		}
		else{
			setCursorFunc(paintCursor["select"]);
		}
	}
}

function selectEndFunc(){
	var floatElem = document.getElementById('floatingCanvas');
	if(floatElem!=undefined){
		var canv = document.getElementById(paint.picElem);
		myDrawImage(canv, floatElem, floatElem.offsetLeft, floatElem.offsetTop);
		canv.getContext('2d').clearRect(0,0,1,1);
		floatElem.parentNode.removeChild(floatElem);
		paint.floatMask = undefined;
	}
	var svg = document.getElementById('floatingSvg');
	if(svg!=undefined)svg.parentNode.removeChild(svg);
	saveCanvas();
}


function newFloatingCanvas(left,top,width,height,cursor,outline){
	//新規canvas
	var canvElm = document.createElement('canvas');
	canvElm.id = "floatingCanvas";
	canvElm.style.position = "absolute";
	canvElm.style.left = left+"px";
	canvElm.style.top = top+"px";
	canvElm.style.cursor = (cursor==undefined)?"default":cursor;
	canvElm.style.outline = (outline==undefined)?"1px dotted #000":outline;
	canvElm.width = width;
	canvElm.height = height;
	if(paint.elem!="cardBack"){
		canvElm.style['-webkit-transform']="scale("+paint.scale+")";
	}
	canvElm.oncontextmenu = function(){return false;};
	var pictElm = document.getElementById(paint.picElem);
	pictElm.parentNode.insertBefore(canvElm,pictElm.nextSibling);

	return canvElm;
}

function selectAllFunc(){
	//setTimeout(function(){
		paint.makeFloating=true;
		paint.path = [];
		paint.path[0] = {x:0,y:0};
		paint.path[1] = {x:paint.width,y:paint.height};
		var evt = {};
		selectUpFunc(evt);
	//},100);
}
//--

function lassoDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var floatElem = document.getElementById('floatingCanvas');
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		if(floatElem!=undefined && inFloatElemImage(x,y))
		{
			if(downCopyKey(evt)){
				//選択範囲を複製(=固定して移動)
				var canv = document.getElementById(paint.picElem);
				myDrawImage(canv, floatElem, floatElem.offsetLeft, floatElem.offsetTop);
			}
			{
				//選択範囲を移動
				_mouse.button="down";
				paint.moveFloating = true;
				paint.path = [];
				paint.path[0] = {x:x,y:y};
				paint.shiftKey = evt.shiftKey;
				floatMoveFunc(x,y);
			}
		}else if(floatElem!=undefined && !evt.shiftKey){
			//選択範囲を固定
			selectEndFunc();
			var canv = document.getElementById(paint.picElem);
			canv.getContext('2d').clearRect(0,0,1,1);
			saveCanvas();
		}else{
			//選択範囲を作成(追加)
			_mouse.button="down";
			paint.makeFloating = true;
			if(floatElem==undefined){
				paint.path = [];
				paint.path[0] = {x:x,y:y};
				newFloatingSvg();
			}else{
				//選択範囲の追加
				paint.path = paint.savePath;
				paint.path[paint.path.length] = {x:null,y:null};
				var svg = document.getElementById('floatingSvg');
				svg.style.left = "0px";
				svg.style.top = "0px";
			}
			lassoMoveFunc(evt);
		}
	}
}

function lassoUpFunc(evt){
	if(paint.makeFloating&& paint.path.length>0){
		//選択範囲のcanvasを作成(すでにあれば追加)
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem!=undefined){
			//書き戻す
			var canv = document.getElementById(paint.picElem);
			myDrawImage(canv, floatElem, 0, 0);
			canv.getContext('2d').clearRect(0,0,1,1);
			floatElem.parentNode.removeChild(floatElem);
		}
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
		paint.redoBuf = undefined;
		//新規canvas
		var left=0;
		var top=0;
		var width=paint.width;
		var height=paint.height;
		floatElem = newFloatingCanvas(left,top,width,height,paintCursor["lasso"],"");
		//canvasに描画
		var buf = getLassoImageData(document.getElementById(paint.picElem),!downCmdKey(evt));
		floatElem.getContext('2d').putImageData(buf, 0, 0);
		paint.savePath = paint.path;

		var svg = document.getElementById('floatingSvg');
		//アリの行進表示
		if(svg!=undefined) svg.innerHTML = makeLassoPath2();
		if(svg.innerHTML=="") selectEndFunc();//何も選ばれていない場合
	}
	_mouse.button="up";
	_mouse.rightclick=false;
	paint.moveFloating = false;
	paint.makeFloating = false;
	paint.path = [];
	//saveCanvas();固定するまでsaveしてはいけない
}

function lassoMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && (keys[' '.charCodeAt(0)])){
		//移動
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down"){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		if(paint.moveFloating){
			floatMoveFunc(x,y);
		}
		else if(paint.makeFloating && paint.path.length>0){
			var i = paint.path.length-1;
			paint.path[i+1] = {x:x,y:y};
			var svg = document.getElementById('floatingSvg');
			svg.innerHTML = makeLassoPath(false);
		}
	}
	else if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		var floatElem = document.getElementById('floatingCanvas');
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		if(floatElem!=undefined && inFloatElemImage(x,y)){
			if(downCopyKey(evt)) setCursorFunc("copy");
			else setCursorFunc("move");
		}
		else{
			setCursorFunc(paintCursor["lasso"]);
		}
	}
}

function newFloatingSvg(){
	if(document.getElementById('floatingSvg')!=undefined){
		var svg = document.getElementById('floatingSvg');
		svg.style.left="0px";
		svg.style.top="0px";
		return;
	}
	var svg = document.createElement('div');
	svg.id = "floatingSvg";
	svg.style.position="absolute";
	svg.style.left="0px";
	svg.style.top="0px";
	svg.style.width=paint.width+"px";
	svg.style.height=paint.height+"px";
	svg.style.zIndex = 101;
	svg.style.pointerEvents = "none";
	if(paint.elem!="cardBack"){
		svg.style['-webkit-transform']="scale("+paint.scale+")";
		svg.style.marginLeft = parseInt(document.getElementById("rsrcBack").style.left) + paint.width*paint.scale/2+(-paint.width/2)+"px";
		svg.style.marginTop = parseInt(document.getElementById("rsrcBack").style.top) + paint.height*paint.scale/2+(-paint.height/2)+"px";
	}
	svg.innerHTML = "<svg></svg>";
	svg.addEventListener("touchstart",pseudoPaintDown,false);
	svg.addEventListener("touchend",pseudoPaintUp,false);
	svg.addEventListener("touchmove",pseudoPaintMove,false);
	document.getElementById(paint.elem).parentNode.appendChild(svg);
}

function makeLassoPath(endFlag){
	var pathStr = "<svg><path ";
	pathStr += " d='M"+(paint.path[0].x+0.5)+","+(paint.path[0].y+0.5);
	var len=paint.path.length;
	for(var j=1;j<len; j++){
		if(paint.path[j].x==null){
			j++;
			pathStr += " M"+(paint.path[j].x+0.5)+","+(paint.path[j].y+0.5);
		}else{
			pathStr += " L"+(paint.path[j].x+0.5)+","+(paint.path[j].y+0.5);
		}
	}
	if(endFlag){ pathStr += " Z";}
	pathStr += "' fill=none stroke=#000 stroke-width=1 stroke-dasharray='2 2'></path></svg>";
	return pathStr;
}

function makeLassoPath2(){
	var pathStr = "";

	var floatElem = document.getElementById('floatingCanvas');
	//var ctx = floatElem.getContext('2d');
	//var srcData = ctx.getImageData(0,0,floatElem.width,floatElem.height);

	var lineDat = new Int8Array(floatElem.height*floatElem.width);

	for(var v=1;v<floatElem.height;v++){
		for(var h=1;h<floatElem.width;h++){
			//var it = srcData.data[v*floatElem.width*4+h*4+3];
			//var left = srcData.data[v*floatElem.width*4+(h-1)*4+3];
			//var up = srcData.data[(v-1)*floatElem.width*4+h*4+3];
			var it = paint.floatMask[v*paint.floatMaskWidth+h];
			var left = paint.floatMask[v*paint.floatMaskWidth+(h-1)];
			var up = paint.floatMask[(v-1)*paint.floatMaskWidth+h];
			lineDat[v*floatElem.width+h] = (it!=left || it!=up)?1:0;
		}
	}

	for(var v=1;v<floatElem.height;v++){
		for(var h=1;h<floatElem.width;h++){
			if(lineDat[v*floatElem.width+h]==1){
				pathStr += makeLassoPath2Sub(lineDat, h, v, floatElem.width, floatElem.height);
			}
		}
	}
	if(pathStr=="") return "";

	pathStr += "' fill=none stroke-width=1 ";

	pathStr = "<svg><path d='"+pathStr+" stroke=#fff /><path id=floatingSvgRect d='"+pathStr+" stroke=#000 stroke-dasharray='2 2' /></svg>";

	if(floatingSvgTimer!=null)clearInterval(floatingSvgTimer);
	floatingSvgTimer=setInterval(function(){
		var svgrect = document.getElementById('floatingSvgRect');
		if(svgrect!=null){
			svgrect.setAttribute("stroke-dashoffset",new Date()/200%4);
		}else{
			clearInterval(floatingSvgTimer);
			floatingSvgTimer=null;
		}
	},200);

	return pathStr;
}

function makeLassoPath2Sub(lineDat, h, v, width, height){
	var pathStr = " M"+(h+0.5)+","+(v+0.5);
	lineDat[v*width+h]=0;
	while(true){
		if(h+1<width && lineDat[v*width+(h+1)]==1){
			for(var dh=1; dh<width-h; dh++){
				if(lineDat[v*width+(h+dh)]==0){
					dh--;
					break;
				}
				lineDat[v*width+(h+dh)]=0;
			}
			pathStr += " L"+(h+dh+0.5)+","+(v+0.5);
			h+=dh;
		}
		else if(h>0 && v+1<height && lineDat[(v+1)*width+(h-1)]==1){
			for(var dh=1; h-dh>=0&&v+dh<height; dh++){
				if(lineDat[(v+dh)*width+(h-dh)]==0){
					dh--;
					break;
				}
				lineDat[(v+dh)*width+(h-dh)]=0;
			}
			pathStr += " L"+(h-dh+0.5)+","+(v+dh+0.5);
			h-=dh;v+=dh;
		}
		else if(v+1<height && lineDat[(v+1)*width+h]==1){
			for(var dv=1; dv<height-v; dv++){
				if(lineDat[(v+dv)*width+h]==0){
					dv--;
					break;
				}
				lineDat[(v+dv)*width+h]=0;
			}
			pathStr += " L"+(h+0.5)+","+(v+dv+0.5);
			v+=dv;
		}
		else if(h+1<width && v+1<height && lineDat[(v+1)*width+(h+1)]==1){
			for(var dh=1; h+dh<width&&v+dh<height; dh++){
				if(lineDat[(v+dh)*width+(h+dh)]==0){
					dh--;
					break;
				}
				lineDat[(v+dh)*width+(h+dh)]=0;
			}
			pathStr += " L"+(h+dh+0.5)+","+(v+dh+0.5);
			h+=dh;v+=dh;
		}
		else{
			break;
		}
	}
	return pathStr;
}

function inFloatElemImage(x,y){
	var floatElem = document.getElementById('floatingCanvas');
	if(x>=floatElem.offsetLeft && x<floatElem.offsetLeft+floatElem.offsetWidth &&
			y>=floatElem.offsetTop && y<floatElem.offsetTop+floatElem.offsetHeight)
	{
		var xx = x-floatElem.offsetLeft;
		var yy = y-floatElem.offsetTop;

		//var ftx = floatElem.getContext('2d');
		//var Data = ftx.getImageData(xx,yy,1,1);
		//return (Data.data[3]>0);
		if('createTouch' in document){
			for(var y1=-5; y1<=5; y1++){
				for(var x1=-5; x1<=5; x1++){
					if(yy+y1<0 || xx+x1<0 || yy+y1>floatElem.offsetHeight || xx+x1>floatElem.offsetWidth) continue;
					if(paint.floatMask[(yy+y1)*paint.floatMaskWidth+xx+x1]>0){
						return true;
					}
				}
			}
			return false;
		}else{
			return (paint.floatMask[yy*paint.floatMaskWidth+xx]>0);
		}
	}
	return false;
}

function getLassoImageData(canvas, tight){
	//pathで囲まれた領域を投げ縄で抜く

	//元のデータを保持
	var ctx = canvas.getContext('2d');
	var tmpData = ctx.getImageData(0,0,canvas.width,canvas.height);
	var tmpData2 = ctx.getImageData(0,0,canvas.width,canvas.height);

	//領域のイメージデータ
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.beginPath();
	ctx.moveTo(paint.path[0].x, paint.path[0].y);
	var len=paint.path.length;
	for(var i=1; i<len; i++){
		if(paint.path[i].x==null){
			i++;
			ctx.moveTo(paint.path[i].x, paint.path[i].y);
		}
		else{
			ctx.lineTo(paint.path[i].x, paint.path[i].y);
		}
	}
	ctx.closePath();
	//ctx.stroke();
	ctx.fill();
	var pathData = ctx.getImageData(0,0,canvas.width,canvas.height);

	//囲まれた領域以外と白色を締め付け候補として透明度を128にする。それ以外は0。
	if(tight){
		for(var v=0;v<canvas.height;v++){
			for(var h=0;h<canvas.width;h++){
				if(pathData.data[v*canvas.width*4+h*4+3]>=127 &&
						(tmpData.data[v*canvas.width*4+h*4+0]!=255||(tmpData.data[v*canvas.width*4+h*4+1]!=255)||(tmpData.data[v*canvas.width*4+h*4+2]!=255)))
				{
					tmpData.data[v*canvas.width*4+h*4+3]=0;
				}
				else{
					tmpData.data[v*canvas.width*4+h*4+3]=128;
				}
			}
		}
	}else{
		paint.floatMask = new Int8Array(canvas.width*canvas.height);
		paint.floatMaskWidth = canvas.width;
		for(var v=0;v<canvas.height;v++){
			for(var h=0;h<canvas.width;h++){
				if(pathData.data[v*canvas.width*4+h*4+3]<127)
				{
					tmpData.data[v*canvas.width*4+h*4+3]=0;
				}
				else{
					paint.floatMask[v*paint.floatMaskWidth+h] = 1;
				}
			}
		}
	}

	//領域の締め付け
	if(tight){
		paint.floatMask = new Int8Array(canvas.width*canvas.height);
		paint.floatMaskWidth = canvas.width;
		tmpData = seedFillFunc(tmpData, canvas.width, canvas.height, 0, 0);
		for(var v=0;v<canvas.height;v++){
			for(var h=0;h<canvas.width;h++){
				if(tmpData.data[v*canvas.width*4+h*4+3]==255){
					tmpData.data[v*canvas.width*4+h*4+3]=0;
				}
				else{
					if(pathData.data[v*canvas.width*4+h*4+3]==0){
						tmpData.data[v*canvas.width*4+h*4+3]=0;
					}else{
						var it = tmpData2.data[v*canvas.width*4+h*4+3];
						tmpData.data[v*canvas.width*4+h*4+3]=it;
						paint.floatMask[v*paint.floatMaskWidth+h] = (it>0)?1:0;
					}
				}
			}
		}
	}

	//picture側は選択範囲が抜かれたイメージデータにする
	for(var v=0;v<canvas.height;v++){
		for(var h=0;h<canvas.width;h++){
			if(paint.floatMask[v*paint.floatMaskWidth+h]==0)
			{
				;
			}
			else{
				tmpData2.data[v*canvas.width*4+h*4+3]=0;
			}
		}
	}
	ctx.putImageData(tmpData2,0,0);

	//選択領域のデータを返す
	return tmpData;
}

function lassoAllFunc(){
	setTimeout(function(){
		paint.makeFloating=true;
		paint.path = [];
		paint.path[0] = {x:0,y:0};
		paint.path[1] = {x:paint.width,y:0};
		paint.path[2] = {x:paint.width,y:paint.height};
		paint.path[3] = {x:0,y:paint.height};
		newFloatingSvg();
		var svg = document.getElementById('floatingSvg');
		svg.innerHTML = makeLassoPath(false);
		var evt = {};
		lassoUpFunc(evt);
	},100);
}
//--

function magicwandDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var floatElem = document.getElementById('floatingCanvas');
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		if(floatElem!=undefined && inFloatElemImage(x,y))
		{
			if(downCopyKey(evt)){
				//選択範囲を複製(=固定して移動)
				var canv = document.getElementById(paint.picElem);
				myDrawImage(canv, floatElem, floatElem.offsetLeft, floatElem.offsetTop);
			}
			{
				//選択範囲を移動
				_mouse.button="down";
				paint.moveFloating = true;
				paint.path = [];
				paint.path[0] = {x:x,y:y};
				paint.shiftKey = evt.shiftKey;
				floatMoveFunc(x,y);
			}
		}else if(floatElem!=undefined && !evt.shiftKey){
			//選択範囲を固定
			selectEndFunc();
			var canv = document.getElementById(paint.picElem);
			canv.getContext('2d').clearRect(0,0,1,1);
			saveCanvas();
		}else{
			//選択範囲を作成(追加)
			_mouse.button="down";
			paint.makeFloating = true;
			if(floatElem==undefined){
				paint.path = [];
				paint.path[0] = {x:x,y:y};
				newFloatingSvg();
			}else{
				//選択範囲の追加
				paint.path = paint.savePath;
				paint.path[paint.path.length] = {x:null,y:null};
				var svg = document.getElementById('floatingSvg');
				svg.style.left = "0px";
				svg.style.top = "0px";
			}
			magicwandMoveFunc(evt);
		}
	}
}

function magicwandUpFunc(evt){
	if(paint.makeFloating&& paint.path.length>0){
		//選択範囲のcanvasを作成(すでにあれば追加)
		var floatElem = document.getElementById('floatingCanvas');
		if(floatElem!=undefined){
			//書き戻す
			var canv = document.getElementById(paint.picElem);
			myDrawImage(canv, floatElem, 0, 0);
			canv.getContext('2d').clearRect(0,0,1,1);
			floatElem.parentNode.removeChild(floatElem);
		}
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
		paint.redoBuf = undefined;
		//新規canvas
		var left=0;
		var top=0;
		var width=paint.width;
		var height=paint.height;
		floatElem = newFloatingCanvas(left,top,width,height,paintCursor["magicwand"],"");
		//canvasに描画
		var buf = getMagicWandImageData(document.getElementById(paint.picElem), !downCopyKey(evt), paint.distance);
		floatElem.getContext('2d').putImageData(buf, 0, 0);
		paint.savePath = paint.path;

		var svg = document.getElementById('floatingSvg');
		//アリの行進表示
		svg.innerHTML = makeLassoPath2();
	}
	_mouse.button="up";
	_mouse.rightclick=false;
	paint.moveFloating = false;
	paint.makeFloating = false;
	paint.path = [];
	//saveCanvas();固定するまでsaveしてはいけない
}

function magicwandMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && (keys[' '.charCodeAt(0)])){
		//移動
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down"){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		if(paint.moveFloating){
			floatMoveFunc(x,y);
		}
		else if(paint.makeFloating && paint.path.length>0){
			var i = paint.path.length-1;
			if(paint.path[i].x!=null){
				//間を補完
				var add = (Math.abs(paint.path[i].x-x)+Math.abs(paint.path[i].y-y))/4;
				for(var j=0; j<add; j++){
					paint.path[i+j+1] = {x:(paint.path[i].x*(add-j)+j*x)/add|0,y:(paint.path[i].y*(add-j)+j*y)/add|0};
				}
				i+=j;
			}
			paint.path[i+1] = {x:x,y:y};
			var svg = document.getElementById('floatingSvg');
			svg.innerHTML = makeLassoPath(false);
		}
	}
	else if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		var floatElem = document.getElementById('floatingCanvas');
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		if(floatElem!=undefined && inFloatElemImage(x,y)){
			if(downCopyKey(evt)) setCursorFunc("copy");
			else setCursorFunc("move");
		}
		else{
			setCursorFunc(paintCursor["magicwand"]);
		}
	}
}


function getMagicWandImageData(canvas, neighborOnly, distance){
	//canvasの中のpaint.pathの同じ色の領域の画像を取得

	//元のデータを保持
	var ctx = canvas.getContext('2d');
	var tmpData = ctx.getImageData(0,0,canvas.width,canvas.height);
	var tmpData2 = ctx.getImageData(0,0,canvas.width,canvas.height);

	//各点の色の配列を作る
	//var pRGBA = [];
	//var pRed = [];
	//var pGreen = [];
	//var pBlue = [];
	//var pAlpha = [];
	var pRGBA = [];
	var pHue = [];
	var pSatur = [];
	var pValue = [];
	var pAlpha = [];
	for(var i=0; i<paint.path.length; i++){
		var px = paint.path[i].x;
		var py = paint.path[i].y;
		if(px==null) continue;
		var rgb = {
				r:tmpData.data[py*canvas.width*4+px*4+0],
				g:tmpData.data[py*canvas.width*4+px*4+1],
				b:tmpData.data[py*canvas.width*4+px*4+2],
		};
		pAlpha[i] = tmpData.data[py*canvas.width*4+px*4+3];
		pValue[i] = getHSVValue(rgb);
		pSatur[i] = getHSVSaturation(rgb,pValue[i])*256;
		pHue[i] = getHSVTrueHue(rgb,pValue[i]);
		pRGBA[i] = rgb.r*16777216 + rgb.g*65536 + rgb.b*256 + pAlpha[i];
	}
	//同じ色を削除
	for(var i=pRGBA.length-1; i>=0; i--){
		if(pRGBA.indexOf(pRGBA[i])!=i){
			pRGBA[i] = pRGBA[pRGBA.length-1]; pRGBA.length--;
			pHue[i] = pHue[pHue.length-1]; pHue.length--;
			pSatur[i] = pSatur[pSatur.length-1]; pSatur.length--;
			pValue[i] = pValue[pValue.length-1]; pValue.length--;
			pAlpha[i] = pAlpha[pAlpha.length-1]; pAlpha.length--;
		}
	}
	//点が多すぎる場合は高速化のために間引く量を多くする
	distance*=1.2;
	if(pRGBA.length>100) distance*=1.5;
	else if(pRGBA.length>10) distance*=1.2;

	for(var i=pHue.length-1; i>=0; i--){
		for(var j=pHue.length-1; j>i; j--){
			var H = pHue[j];
			var S = pSatur[j];
			var V = pValue[j];
			var a = pAlpha[j];
			var dValue = (pValue[i]-V);
			var dSatu = (pSatur[i]+S)/2/256*(pSatur[i]+S)/2/256 * (pValue[i]+V)/2/256*(pValue[i]+V)/2/256;
			if((pHue[i]-H)*(pHue[i]-H)*8 * dSatu + (pSatur[i]-S)*(pSatur[i]-S) * (pValue[i]+V)/2/256*(pValue[i]+V)/2/256 + dValue*dValue + (pAlpha[i]-a)*(pAlpha[i]-a) <= distance*distance/8){
				//pRGBA[i] = pRGBA[pRGBA.length-1]; pRGBA.length--;
				pHue[i] = pHue[pHue.length-1]; pHue.length--;
				pSatur[i] = pSatur[pSatur.length-1]; pSatur.length--;
				pValue[i] = pValue[pValue.length-1]; pValue.length--;
				pAlpha[i] = pAlpha[pAlpha.length-1]; pAlpha.length--;
			}
		}
	}

	//候補を明るさでソートする
	for(var i=pHue.length-1; i>=0; i--){
		for(var j=pHue.length-1; j>i; j--){
			var vi = /*pHue[i]+*/pSatur[i]/256*pValue[i]+pValue[i]+pAlpha[i];
			var vj = /*pHue[j]+*/pSatur[j]/256*pValue[j]+pValue[i]+pAlpha[j];
			if(vi>vj){
				var t;
				//t=pRGBA[i]; pRGBA[i]=pRGBA[j]; pRGBA[j]=t;
				t=pHue[i]; pHue[i]=pHue[j]; pHue[j]=t;
				t=pSatur[i]; pSatur[i]=pSatur[j]; pSatur[j]=t;
				t=pValue[i]; pValue[i]=pValue[j]; pValue[j]=t;
				t=pAlpha[i]; pAlpha[i]=pAlpha[j]; pAlpha[j]=t;
			}
		}
	}

	//256段階の各明るさのdistance内にあるデータをテーブルに保持する
	var startTable = [], endTable = [];
	for(var k=0; k<256; k++){
		//start
		startTable[k] = pHue.length;
		var i=0;
		if(k>0) i=startTable[k-1];
		for(; i<pHue.length; i++){
			var vi = (/*pHue[i]+*/pSatur[i]/256*pValue[i]+pValue[i]+pAlpha[i])/4;
			if(vi>k-distance){
				startTable[k] = i;
				break;
			}
		}
		//end
		endTable[k] = pHue.length;
		//var i=0;
		if(k>0) i=endTable[k-1]-1;
		for(; i<pHue.length; i++){
			var vi = (/*pHue[i]+*/pSatur[i]/256*pValue[i]+pValue[i]+pAlpha[i])/4;
			if(vi>k+distance){
				endTable[k] = i+1;
				break;
			}
		}
	}

	//候補の透明度を128、それ以外を0にする
	var lasti = -1;
	var canvH = canvas.height;
	var canvW = canvas.width;
	for(var v=0;v<canvH;v++){
		for(var h=0;h<canvW;h++){
			var z = v*canvW*4+h*4;
			var rgb = {
					r:tmpData.data[z+0],
					g:tmpData.data[z+1],
					b:tmpData.data[z+2]
			};
			var a = tmpData.data[z+3];

			var V = getHSVValue(rgb);
			var S = getHSVSaturation(rgb,V)*256;
			var H = getHSVTrueHue(rgb,V);

			var dHue = (pHue[lasti]-H);
			if(dHue>180) dHue -= 360;
			if(dHue<-180) dHue += 360;
			var dValue = (pValue[lasti]-V);
			var dSatu = (pSatur[lasti]+S)/2/256*(pSatur[lasti]+S)/2/256 * (pValue[lasti]+V)/2/256*(pValue[lasti]+V)/2/256;
			if(lasti!=-1 && dHue*dHue*8 * dSatu + (pSatur[lasti]-S)*(pSatur[lasti]-S) * (pValue[lasti]+V)/2/256*(pValue[lasti]+V)/2/256 + dValue*dValue + (pAlpha[lasti]-a)*(pAlpha[lasti]-a) <= distance*distance){
				//類似の色がある
				tmpData.data[z+3] = neighborOnly?128:255;
			}
			else{
				lasti=-1;
				tmpData.data[z+3] = 0;
				var k = (S/256*V+V+a)/4|0;
				for(var i=startTable[k]; i<endTable[k]; i++){
					dHue = (pHue[i]-H);
					if(dHue>180) dHue -= 360;
					if(dHue<-180) dHue += 360;
					dValue = (pValue[i]-V);
					var dSatu = (pSatur[i]+S)/2/256*(pSatur[i]+S)/2/256 * (pValue[i]+V)/2/256*(pValue[i]+V)/2/256;
					if(dHue*dHue*8 * dSatu + (pSatur[i]-S)*(pSatur[i]-S) * (pValue[i]+V)/2/256*(pValue[i]+V)/2/256 + dValue*dValue + (pAlpha[i]-a)*(pAlpha[i]-a) <= distance*distance){
						//類似の色がある
						tmpData.data[z+3] = neighborOnly?128:255;
						lasti = i;
						break;
					}
				}
			}
		}
	}

	//各点を開始点にしてシードフィルする
	if(neighborOnly){
		for(var i=0; i<paint.path.length; i++){
			var px = paint.path[i].x;
			var py = paint.path[i].y;
			if(px==null) continue;

			tmpData = seedFillFunc(tmpData, canvas.width, canvas.height, px, py);
		}
	}

	//選択範囲マスクを作る
	paint.floatMask = new Int8Array(canvas.width*canvas.height);
	paint.floatMaskWidth = canvas.width;
	for(var v=0;v<canvH;v++){
		for(var h=0;h<canvW;h++){
			if(tmpData.data[v*canvW*4+h*4+3]==255){
				paint.floatMask[v*canvW+h] = 1;
			}
		}
	}

	//マスクを元にフローティング画像とベース側の画像を作る
	for(var v=0;v<canvH;v++){
		for(var h=0;h<canvW;h++){
			if(tmpData.data[v*canvW*4+h*4+3]==255){
				tmpData.data[v*canvW*4+h*4+3] = tmpData2.data[v*canvW*4+h*4+3];
				tmpData2.data[v*canvW*4+h*4+3]=0;
			}
			else{
				tmpData.data[v*canvW*4+h*4+3] = 0;
			}
		}
	}

	//選択範囲が抜かれたイメージデータに
	ctx.putImageData(tmpData2,0,0);

	return tmpData;
}
//--

function pencilDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		if(evt.button&2) _mouse.rightclick=true;
		if(downCmdKey(evt)){
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			//拡大表示
			zoomInOutFunc(x,y);
			setPaintCursor(evt);
		}
		else if((keys[' '.charCodeAt(0)])&&paint.scale>1.0){
			//移動
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			document.getElementById(paint.elem).style["MozTransitionDuration"] = "0s";
			document.getElementById(paint.elem).style["-webkit-transition-duration"] = "0s";
			pencilMoveFunc(evt);
		}
		else if(evt.altKey||(evt.button&2)){
			//スポイト
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			spoitFunc(x,y,"forecolor");
		}
		else{
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			var canvas = document.getElementById(paint.picElem);
			var ctx = canvas.getContext('2d');
			paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
			paint.redoBuf = undefined;
			paint.shiftKey = evt.shiftKey;
			var srcData = ctx.getImageData(x,y,1,1);
			if(colorRGB(srcData.data[0],srcData.data[1],srcData.data[2],srcData.data[3])!=paint.foreColor){
				paint.strokeColor = paint.foreColor;
			}else{
				paint.strokeColor = paint.backColor;
			}
			pencilMoveFunc(evt);
		}
	}
}

function pencilUpFunc(evt){
	if(_mouse.button=="down" && paint.path.length>0){
		paint.path = [];
		saveCanvas();
	}
	_mouse.button="up";
	_mouse.rightclick=false;
}

function pencilMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && (evt.altKey || keys[' '.charCodeAt(0)])){
		//移動
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down" && paint.path.length>0){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		var i = paint.path.length-1;
		var x1 = paint.path[i].x;
		var y1 = paint.path[i].y;
		if(paint.shiftKey){
			if(i==1){
				if(Math.abs(x1-x)>Math.abs(y1-y)){ paint.shiftDir="x"; }
				else if(Math.abs(x1-x)<Math.abs(y1-y)){ paint.shiftDir="y"; }
				else return;
			}
			if(paint.shiftDir=="x"){y = y1;}
			else{x = x1;}
		}
		paint.path[i+1] = {x:x,y:y};
		var width = Math.abs(x1-x);
		var height = Math.abs(y1-y);
		var r = rgbColor(paint.strokeColor).r;
		var g = rgbColor(paint.strokeColor).g;
		var b = rgbColor(paint.strokeColor).b;
		var srcData = ctx.getImageData(0,0,canvas.width,canvas.height);
		var len = canvas.width*4;
		if(height<width){
			if(x1<x){var t=x1;x1=x;x=t; t=y1;y1=y;y=t;}
			for(var h=x; h<=x1; h++){
				if(h<0||h>=canvas.width)continue;
				var v = (h-x)/(x1-x);
				if(x1-x==0) v=0;
				var v1 = (v*(y1-y)+y+0.5)|0;
				srcData.data[v1*len+h*4+0] = r;
				srcData.data[v1*len+h*4+1] = g;
				srcData.data[v1*len+h*4+2] = b;
				srcData.data[v1*len+h*4+3] = paint.opacity*255;
			}
		}
		else{
			if(y1<y){var t=x1;x1=x;x=t; t=y1;y1=y;y=t;}
			for(var v1=y; v1<=y1; v1++){
				var h1 = (v1-y)/(y1-y);
				if(x1-x==0) h1=0;
				var h = (h1*(x1-x)+x+0.5)|0;
				if(h<0||h>=canvas.width)continue;
				srcData.data[v1*len+h*4+0] = r;
				srcData.data[v1*len+h*4+1] = g;
				srcData.data[v1*len+h*4+2] = b;
				srcData.data[v1*len+h*4+3] = paint.opacity*255;
			}
		}
		ctx.clearRect(0,0,1,1);
		ctx.putImageData(srcData, 0, 0);
		drawScaledCanvas(x,y,width,height);
	}
}

function zoomInOutFunc(x,y){
	var cardwidth = paint.width;
	var cardheight = paint.height;
	if(x==undefined){
		x = cardwidth/2;
		y = cardheight/2;
	}
	if(paint.scale<2.0){
		paint.scale = 8.0;
		paint.scroll = {x:x-cardwidth/(paint.scale*2),y:y-cardheight/(paint.scale*2)};
	}
	else{
		paint.scale = 1.0;
		paint.scroll = {x:0,y:0};
	}
	changeZoom();
}

function changeZoom(){
	var cardwidth = paint.width;
	var cardheight = paint.height;
	if(paint.scroll.x<0)paint.scroll.x=0;
	if(paint.scroll.x>=cardwidth*(paint.scale-1)/paint.scale)paint.scroll.x=cardwidth*(paint.scale-1)/paint.scale;
	if(paint.scroll.y<0)paint.scroll.y=0;
	if(paint.scroll.y>=cardheight*(paint.scale-1)/paint.scale)paint.scroll.y=cardheight*(paint.scale-1)/paint.scale;

	var cardBack = document.getElementById(paint.elem);
	var scl = paint.scale;
	if(paint.elem=="cardBack"){
		var transStr = "translate("+(-scl*(paint.scroll.x)+(cardwidth*(scl-1))/2|0)+"px,"
		+(-scl*(paint.scroll.y)+(cardheight*(scl-1))/2|0)+"px) scale("+scl+")";
		cardBack.style["MozTransitionDuration"] = "0.2s";
		cardBack.style["MozTransform"] = transStr;
		cardBack.style["-webkit-transition-duration"] = "0.2s";
		cardBack.style["-webkit-transform"] = transStr;
	}
	//スクロール位置と拡大の関係
	//スクロール位置: 画面での左上のピクセルの本来の位置
	//スクロール位置{0,0}で8倍に拡大したとすると、
	//そのまま拡大しただけでは中央が拡大表示されるので、
	//その場合の左上のピクセル位置を求めてオフセット分移動する
	//  picwidthはcardwidthの8倍
	//  中心:{picwidth/2,picheight/2}
	//  左上:{picwidth/2-cardwidth/2/8,picheight/2-cardheight/2/8}
	//  →左上:{(cardwidth*(8-1/8))/2,cardheight*(8-1/8)/2}

	//拡大したcanvasを作る
	var scaled = document.getElementById('scaledCanvas');
	if(paint.scale>=2.0){
		if(scaled==undefined){
			scaled = document.createElement('canvas');
			scaled.id = "scaledCanvas";
			if(paint.elem=="cardBack"){
				scaled.width = cardwidth;
				scaled.height = cardheight;
				scaled.style.position = "absolute";
				scaled.style.left = "0px";
				scaled.style.top = "0px";
				scaled.oncontextmenu = function(){return false;};
				document.getElementById(paint.picElem).parentNode.appendChild(scaled);
			}else{
				scaled.width = cardwidth*paint.scale;
				scaled.height = cardheight*paint.scale;
				scaled.className = "backgroundTile";
				scaled.style.position = "absolute";
				scaled.style.border = "1px solid #888";
				var rsrcMainElm = document.getElementById("rsrcMain");
				if(scaled.width>rsrcMainElm.offsetWidth-2) scaled.width = rsrcMainElm.offsetWidth-2;
				if(scaled.height>rsrcMainElm.offsetHeight-2-48) scaled.height = rsrcMainElm.offsetHeight-2-48;
				scaled.onselectstart=function(){return false;};
				document.getElementById(paint.picElem).parentNode.appendChild(scaled);
				document.getElementById(paint.picElem).style.display = "none";
				paint.scroll.x=0;
				paint.scroll.y=0;
			}
		}

		drawScaledCanvas();
	}
	else{
		if(scaled!=undefined) scaled.parentNode.removeChild(scaled);
		document.getElementById(paint.picElem).style.display = "";
	}
}

function drawScaledCanvas(cx,cy,cwidth,cheight){
	var scaled = document.getElementById('scaledCanvas');
	if(scaled==undefined) return;

	var canvas = document.getElementById(paint.picElem);
	var ctx = canvas.getContext('2d');
	var stx = scaled.getContext('2d');
	var srcwidth = canvas.width;
	var srcheight = canvas.height;
	var width = scaled.width;
	var height = scaled.height;
	var scx = paint.scroll.x;
	var scy = paint.scroll.y;
	var scl = paint.scale;
	var all = false;
	if(!cx){
		stx.clearRect(0,0,width,height);
		all = true;
		cx=0; cy=0; cwidth=scaled.width; cheight=scaled.height;
	}
	else{
		cx = cx*scl-1|0;
		cy = cy*scl-1|0;
		cwidth = cwidth*scl+(scl*2)|0;
		cheight = cheight*scl+(scl*2)|0;
	}
	var srcData = ctx.getImageData(0,0,srcwidth,srcheight);
	var dstData = stx.getImageData(0,0,width,height);
	var sy = null;
	for(var v=cy;v<cy+cheight;v++){
		if(sy == (scy + v/scl|0)){ //上のラインをコピーすればOK
			if(!all){
				var s = v*width*4;
				var s1 = (v-1)*width*4;
				for(var i=(cwidth+cx)*4-1; i>=cx; i--){
					dstData.data[s+i] = dstData.data[s1+i];
				}
			}
			continue;
		}
		sy = scy + v/scl|0;
		for(var h=cx;h<cx+cwidth;h++){
			var sx = scx + h/scl|0;
			for(var i=0; i<4; i++){
				dstData.data[v*width*4+h*4+i] = srcData.data[sy*srcwidth*4+sx*4+i];
			}
		}
	}

	var floatElem = document.getElementById('floatingCanvas');
	if(floatElem!=undefined){
		srcData = floatElem.getContext('2d').getImageData(0,0,width,height);
		var fx = floatElem.style.left.match(/[-0-9]*/);
		var fy = floatElem.style.top.match(/[-0-9]*/);
		for(var v=0;v<height;v++){
			var sy = scy + v/scl-fy|0;
			if(sy<0||sy>=height)continue;
			for(var h=0;h<width;h++){
				var sx = scx + h/scl-fx|0;
				if(sx<0||sx>=width)continue;
				var op = srcData.data[sy*width*4+sx*4+3]/255;
				for(var i=0; i<4; i++){
					dstData.data[v*width*4+h*4+i] = dstData.data[v*width*4+h*4+i]*(1-op)+op*srcData.data[sy*width*4+sx*4+i];
				}
			}
		}
	}
	stx.putImageData(dstData,0,0);
	if(scl>=2 && all){
		stx.drawImage(scaled,0,1);
		if(scl>=4){
			stx.drawImage(scaled,0,2);
		}
		if(scl>=8){
			stx.drawImage(scaled,0,4);
		}
		if(scl>=16){
			stx.drawImage(scaled,0,8);
		}
	}

	if(paint.elem=="cardBack"){
		var scl = 1/paint.scale;
		var transStr = "translate("+((paint.scroll.x)-(paint.width)/2*(paint.scale-1)/(paint.scale))+"px,"
		+((paint.scroll.y)-(paint.height)/2*(paint.scale-1)/(paint.scale))+"px) scale("+scl+")";
		scaled.style["-webkit-transform"] = transStr;
		scaled.style["MozTransform"] = transStr;
	}
}

//--

function brushDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		if(evt.button&2) _mouse.rightclick=true;
		if(keys[' '.charCodeAt(0)]&&paint.scale>1.0){
			//移動
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			brushMoveFunc(evt);
		}
		else if(evt.altKey||(evt.button&2)){
			//スポイト
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			spoitFunc(x,y,"forecolor");
		}
		else{
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			var canvas = document.getElementById(paint.picElem);
			var ctx = canvas.getContext('2d');
			paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
			paint.redoBuf = undefined;
			paint.shiftKey = evt.shiftKey;
			var sk=isMacOS()?keycode_meta:keycode_ctrl;
			paint.cmdKey = keys[sk];

			//裏画面
			var tmpCanv = document.getElementById('tmpCanvas');
			var ttx = tmpCanv.getContext('2d');
			//テクスチャ
			if(brush.textureImg!=undefined&&brush.textureImg.complete){
				ttx.drawImage(brush.textureImg,0,0);
				brush.textureBuf = ttx.getImageData(0,0,brush.textureImg.width,brush.textureImg.height);
			}
			ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
			x-=0.01;
			ttx.lineWidth = brush.size;
			ttx.lineCap = brush.style;
			ttx.lineJoin = "round";

			ttx.beginPath();
			ttx.moveTo(x, y);

			brushMoveFunc(evt);
		}
	}
}

function brushUpFunc(evt){
	if(_mouse.button=="down" && paint.path.length>0){
		paint.path = [];
		saveCanvas();
	}
	_mouse.button="up";
	_mouse.rightclick=false;
}

function brushMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && keys[' '.charCodeAt(0)]){
		//移動
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down" && paint.path.length>0){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		var tmpCanv = document.getElementById('tmpCanvas');
		var ttx = tmpCanv.getContext('2d');
		var i = paint.path.length-1;
		var x1 = paint.path[i].x;
		var y1 = paint.path[i].y;
		if(brush.style!="round"&&brush.size>(Math.abs(x1-x)+Math.abs(y1-y))*2){
			return;
		}
		var x2 = x1;//うまく描画できないので、2つ前のも見る
		var y2 = y1;
		if(i-1>0){
			x2 = paint.path[i-1].x;
			y2 = paint.path[i-1].y;
		}
		if(paint.shiftKey){
			if(i==1){
				if(Math.abs(x1-x)>Math.abs(y1-y)){ paint.shiftDir="x"; }
				else if(Math.abs(x1-x)<Math.abs(y1-y)){ paint.shiftDir="y"; }
				else return;
			}
			if(paint.shiftDir=="x"){y = y1;}
			else{x = x1;}
		}
		paint.path[i+1] = {x:x,y:y};

		//半透明とか対応するために、もうひとつcanvasを用意して、線をそちらに書いて、こっちのcanvasに合成する
		//tmpに退避
		var left = Math.min(x,x2)-brush.size|0;
		var top = Math.min(y,y2)-brush.size|0;
		var width = Math.abs(x-x2)+brush.size*2+2|0;
		var height = Math.abs(y-y2)+brush.size*2+2|0;
		//裏画面に線を書く
		ttx.lineTo(x1, y1);
		ttx.stroke();
		//表画面に合成
		var r = rgbColor(paint.foreColor).r;
		var g = rgbColor(paint.foreColor).g;
		var b = rgbColor(paint.foreColor).b;
		var br = rgbColor(paint.backColor).r;
		var bg = rgbColor(paint.backColor).g;
		var bb = rgbColor(paint.backColor).b;
		var lineData = ttx.getImageData(left,top,width,height);
		var dstData = ctx.getImageData(left,top,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				//線が引かれているか
				var f = (lineData.data[v*width*4+h*4+3]<16);
				{
					//まずペンを入れる前の画素を取り出す
					var k = ((top+v)*canvas.width+left+h)*4;
					dstData.data[v*width*4+h*4+3] = paint.undoBuf.data[k+3];
					if(paint.undoBuf.data[k+3]==0){
						dstData.data[v*width*4+h*4+0] = 255;
						dstData.data[v*width*4+h*4+1] = 255;
						dstData.data[v*width*4+h*4+2] = 255;
					}else{
						dstData.data[v*width*4+h*4+0] = paint.undoBuf.data[k+0];
						dstData.data[v*width*4+h*4+1] = paint.undoBuf.data[k+1];
						dstData.data[v*width*4+h*4+2] = paint.undoBuf.data[k+2];
					}
					if(f) continue;
				}
				var stOpa = paint.opacity;
				var dr = r;
				var dg = g;
				var db = b;
				if(brush.texture!="none"){
					//テクスチャ画像を適用する
					var texW=brush.textureImg.width;
					var texH=brush.textureImg.height;
					var tex = brush.textureBuf.data[((top+v)%texH)*texW*4+((left+h)%texW)*4+0]/255;
					dr = tex*r+(1-tex)*br;
					dg = tex*g+(1-tex)*bg;
					db = tex*b+(1-tex)*bb;
					//stOpa *= tex;
				}
				var opacity = stOpa;
				if(paint.cmdKey){
					//cmdKeyは消すブラシ
					opacity *= -1;
					r=255;g=255;b=255;
				}
				dstData.data[v*width*4+h*4+0] = (1-stOpa)*dstData.data[v*width*4+h*4+0]+stOpa*dr;
				dstData.data[v*width*4+h*4+1] = (1-stOpa)*dstData.data[v*width*4+h*4+1]+stOpa*dg;
				dstData.data[v*width*4+h*4+2] = (1-stOpa)*dstData.data[v*width*4+h*4+2]+stOpa*db;
				dstData.data[v*width*4+h*4+3] += opacity*255;
			}
		}
		ctx.clearRect(0,0,1,1);
		//ctx.clearRect(left,top,width,height);
		ctx.putImageData(dstData, left, top);
		drawScaledCanvas();
	}
}

//--

function eraserDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		if(evt.button&2) _mouse.rightclick=true;
		if(keys[' '.charCodeAt(0)]&&paint.scale>1.0){
			//移動
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			eraserMoveFunc(evt);
		}
		else{
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			var canvas = document.getElementById(paint.picElem);
			var ctx = canvas.getContext('2d');
			paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
			paint.redoBuf = undefined;
			paint.shiftKey = evt.shiftKey;

			//裏画面
			var tmpCanv = document.getElementById('tmpCanvas');
			var ttx = tmpCanv.getContext('2d');
			ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
			ttx.lineWidth = 16;
			ttx.lineCap = "round";
			ttx.lineJoin = "round";

			ttx.beginPath();
			ttx.moveTo(x+1, y+1);

			eraserMoveFunc(evt);
		}
	}
}

function eraserUpFunc(evt){
	if(_mouse.button=="down" && paint.path.length>0){
		//終了点を四角で消す
		var i = paint.path.length-1;
		var x1 = paint.path[i].x;
		var y1 = paint.path[i].y;
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		ctx.clearRect(x1-7,y1-7,15,15);

		saveCanvas();
	}
	paint.path = [];
	_mouse.button="up";
	_mouse.rightclick=false;
}

function eraserMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && keys[' '.charCodeAt(0)]){
		//移動
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down" && paint.path.length>0){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		var tmpCanv = document.getElementById('tmpCanvas');
		var ttx = tmpCanv.getContext('2d');
		var i = paint.path.length-1;
		var x1 = paint.path[i].x;
		var y1 = paint.path[i].y;
		var x2 = x1;//うまく描画できないので、2つ前のも見る
		var y2 = y1;
		if(i-1>0){
			x2 = paint.path[i-1].x;
			y2 = paint.path[i-1].y;
		}
		if(paint.shiftKey){
			if(i==1){
				if(Math.abs(x1-x)>Math.abs(y1-y)){ paint.shiftDir="x"; }
				else if(Math.abs(x1-x)<Math.abs(y1-y)){ paint.shiftDir="y"; }
				else return;
			}
			if(paint.shiftDir=="x"){y = y1;}
			else{x = x1;}
		}
		paint.path[i+1] = {x:x,y:y};

		//もうひとつcanvasを用意して、線をそちらに書いて、こっちのcanvasに合成する
		//tmpに退避
		var size=16;
		var left = Math.min(x,x2)-size;
		var top = Math.min(y,y2)-size;
		var width = Math.abs(x-x2)+size*2+1;
		var height = Math.abs(y-y2)+size*2+1;
		//裏画面に線を書く
		ttx.lineTo(x1+1, y1+1);
		ttx.stroke();
		//表画面に合成
		var lineData = ttx.getImageData(left,top,width,height);
		var dstData = ctx.getImageData(left,top,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var f = (lineData.data[v*width*4+h*4+3]<16);
				if(f)continue;
				dstData.data[v*width*4+h*4+0] = 255;
				dstData.data[v*width*4+h*4+1] = 255;
				dstData.data[v*width*4+h*4+2] = 255;
				dstData.data[v*width*4+h*4+3] = 0;
			}
		}
		//開始点を四角で消す
		//ctx.clearRect(left,top,width,height);
		ctx.putImageData(dstData, left, top);
		ctx.clearRect(paint.path[0].x-7,paint.path[0].y-7,15,15);
		drawScaledCanvas();
	}
}

function eraseAllFunc(){
	var canvas = document.getElementById(paint.picElem);
	var ctx = canvas.getContext('2d');
	paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
	ctx.clearRect(0,0,canvas.width,canvas.height);
	saveCanvas();
}

//--

function lineDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		if(evt.button&2) _mouse.rightclick=true;
		if(keys[' '.charCodeAt(0)]&&paint.scale>1.0){
			//移動
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			lineMoveFunc(evt);
		}
		else if(evt.altKey||(evt.button&2)){
			//スポイト
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			spoitFunc(x,y,"forecolor");
		}
		else{
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			var canvas = document.getElementById(paint.picElem);
			var ctx = canvas.getContext('2d');
			paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
			paint.redoBuf = undefined;
			paint.shiftKey = evt.shiftKey;

			//裏画面
			var tmpCanv = document.getElementById('tmpCanvas');
			var ttx = tmpCanv.getContext('2d');
			//テクスチャ
			if(brush.textureImg!=undefined&&brush.textureImg.complete){
				ttx.drawImage(brush.textureImg,0,0);
				brush.textureBuf = ttx.getImageData(0,0,brush.textureImg.width,brush.textureImg.height);
			}
			ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
			x-=0.01;
			ttx.lineWidth = brush.shapeSize;
			ttx.lineCap = brush.style;
			ttx.lineJoin = "round";

			lineMoveFunc(evt);
		}
	}
}

function lineUpFunc(evt){
	if(_mouse.button=="down" && paint.path.length>0){
		paint.path = [];
		saveCanvas();
	}
	_mouse.button="up";
	_mouse.rightclick=false;
}

function lineMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && keys[' '.charCodeAt(0)]){
		//移動
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down" && paint.path.length>0){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		var tmpCanv = document.getElementById('tmpCanvas');
		var ttx = tmpCanv.getContext('2d');
		var x1 = paint.path[0].x;
		var y1 = paint.path[0].y;
		if(paint.shiftKey){
			if(Math.abs(x1-x)>Math.abs(y1-y)*2){
				y = y1;
			}
			else if(Math.abs(x1-x)*2<Math.abs(y1-y)){
				x = x1;
			}
			else if(y-y1>0 == x-x1>0){
				x = x1+(y-y1);
			}
			else{
				x = x1-(y-y1);
			}
		}

		//半透明とか対応するために、もうひとつcanvasを用意して、線をそちらに書いて、こっちのcanvasに合成する
		//undoBufから退避データを持ってくる
		ctx.putImageData(paint.undoBuf, 0, 0);

		var left = Math.min(x,x1)-brush.shapeSize|0;
		var top = Math.min(y,y1)-brush.shapeSize|0;
		var width = Math.abs(x-x1)+brush.shapeSize*2+2|0;
		var height = Math.abs(y-y1)+brush.shapeSize*2+2|0;
		//裏画面に線を書く
		ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
		ttx.beginPath();
		ttx.moveTo(x+0.5, y+0.5);
		ttx.lineTo(x1+0.5, y1+0.5);
		ttx.stroke();
		//表画面に合成
		var r = rgbColor(paint.foreColor).r;
		var g = rgbColor(paint.foreColor).g;
		var b = rgbColor(paint.foreColor).b;
		var br = rgbColor(paint.backColor).r;
		var bg = rgbColor(paint.backColor).g;
		var bb = rgbColor(paint.backColor).b;
		var lineData = ttx.getImageData(left,top,width,height);
		var dstData = ctx.getImageData(left,top,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				//線が引かれているか
				var f = (lineData.data[v*width*4+h*4+3]<128);
				{
					//まずペンを入れる前の画素を取り出す
					var k = ((top+v)*canvas.width+left+h)*4;
					dstData.data[v*width*4+h*4+3] = paint.undoBuf.data[k+3];
					if(paint.undoBuf.data[k+3]==0){
						dstData.data[v*width*4+h*4+0] = 255;
						dstData.data[v*width*4+h*4+1] = 255;
						dstData.data[v*width*4+h*4+2] = 255;
					}else{
						dstData.data[v*width*4+h*4+0] = paint.undoBuf.data[k+0];
						dstData.data[v*width*4+h*4+1] = paint.undoBuf.data[k+1];
						dstData.data[v*width*4+h*4+2] = paint.undoBuf.data[k+2];
					}
					if(f) continue;
				}
				var stOpa = paint.opacity;
				var dr = r;
				var dg = g;
				var db = b;
				if(brush.texture!="none"){
					//テクスチャ画像を適用する
					var texW=brush.textureImg.width;
					var texH=brush.textureImg.height;
					var tex = brush.textureBuf.data[((top+v)%texH)*texW*4+((left+h)%texW)*4+0]/255;
					dr = tex*r+(1-tex)*br;
					dg = tex*g+(1-tex)*bg;
					db = tex*b+(1-tex)*bb;
					//stOpa *= tex;
				}
				var opacity = stOpa;
				if(paint.cmdKey){
					//cmdKeyは消すブラシ
					opacity *= -1;
					r=255;g=255;b=255;
				}
				dstData.data[v*width*4+h*4+0] = (1-stOpa)*dstData.data[v*width*4+h*4+0]+stOpa*dr;
				dstData.data[v*width*4+h*4+1] = (1-stOpa)*dstData.data[v*width*4+h*4+1]+stOpa*dg;
				dstData.data[v*width*4+h*4+2] = (1-stOpa)*dstData.data[v*width*4+h*4+2]+stOpa*db;
				dstData.data[v*width*4+h*4+3] += opacity*255;
			}
		}
		ctx.clearRect(0,0,1,1);
		//ctx.clearRect(left,top,width,height);
		ctx.putImageData(dstData, left, top);
		drawScaledCanvas();
	}
}

//--

function rectDownFunc(evt,oval){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		if(evt.button&2) _mouse.rightclick=true;
		if(keys[' '.charCodeAt(0)]&&paint.scale>1.0){
			//移動
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			rectMoveFunc(evt);
		}
		else if(evt.altKey||(evt.button&2)){
			//スポイト
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			spoitFunc(x,y,"forecolor");
		}
		else{
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			var canvas = document.getElementById(paint.picElem);
			var ctx = canvas.getContext('2d');
			paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
			paint.redoBuf = undefined;
			paint.shiftKey = evt.shiftKey;

			//裏画面
			var tmpCanv = document.getElementById('tmpCanvas');
			var ttx = tmpCanv.getContext('2d');
			//テクスチャ
			if(brush.textureImg!=undefined&&brush.textureImg.complete){
				ttx.drawImage(brush.textureImg,0,0);
				brush.textureBuf = ttx.getImageData(0,0,brush.textureImg.width,brush.textureImg.height);
			}
			ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
			x-=0.01;
			ttx.lineWidth = brush.shapeSize;
			ttx.lineCap = brush.style;

			if(oval)ovalMoveFunc(evt);
			else rectMoveFunc(evt);
		}
	}
}

function rectUpFunc(evt){
	if(_mouse.button=="down" && paint.path.length>0){
		paint.path = [];
		saveCanvas();
	}
	_mouse.button="up";
	_mouse.rightclick=false;
}

function rectMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && keys[' '.charCodeAt(0)]){
		//移動
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down" && paint.path.length>0){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		var tmpCanv = document.getElementById('tmpCanvas');
		var ttx = tmpCanv.getContext('2d');
		var x1 = paint.path[0].x;
		var y1 = paint.path[0].y;
		if(paint.shiftKey){
			if(y-y1>0 == x-x1>0){
				x = x1+(y-y1);
			}
			else{
				x = x1-(y-y1);
			}
		}

		//半透明とか対応するために、もうひとつcanvasを用意して、線をそちらに書いて、こっちのcanvasに合成する
		//undoBufから退避データを持ってくる
		ctx.putImageData(paint.undoBuf, 0, 0);

		var tx = Math.min(x,x1);
		var ty = Math.min(y,y1);
		var twidth = Math.abs(x-x1);
		var theight = Math.abs(y-y1);

		var left = Math.min(x,x1)-brush.shapeSize|0;
		var top = Math.min(y,y1)-brush.shapeSize|0;
		var width = Math.abs(x-x1)+brush.shapeSize*2+2|0;
		var height = Math.abs(y-y1)+brush.shapeSize*2+2|0;
		//裏画面に線を書く
		ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
		ttx.beginPath();
		drawRect(ttx, tx+0.5, ty+0.5, tx+twidth+0.5, ty+theight+0.5);
		ttx.closePath();
		ttx.stroke();

		//表画面に合成
		var r = rgbColor(paint.foreColor).r;
		var g = rgbColor(paint.foreColor).g;
		var b = rgbColor(paint.foreColor).b;
		var br = rgbColor(paint.backColor).r;
		var bg = rgbColor(paint.backColor).g;
		var bb = rgbColor(paint.backColor).b;
		var lineData = ttx.getImageData(left,top,width,height);
		var dstData = ctx.getImageData(left,top,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				//線が引かれているか
				var f = (lineData.data[v*width*4+h*4+3]<80);
				{
					//まずペンを入れる前の画素を取り出す
					var k = ((top+v)*canvas.width+left+h)*4;
					dstData.data[v*width*4+h*4+3] = paint.undoBuf.data[k+3];
					if(paint.undoBuf.data[k+3]==0){
						dstData.data[v*width*4+h*4+0] = 255;
						dstData.data[v*width*4+h*4+1] = 255;
						dstData.data[v*width*4+h*4+2] = 255;
					}else{
						dstData.data[v*width*4+h*4+0] = paint.undoBuf.data[k+0];
						dstData.data[v*width*4+h*4+1] = paint.undoBuf.data[k+1];
						dstData.data[v*width*4+h*4+2] = paint.undoBuf.data[k+2];
					}
					if(f) continue;
				}
				var stOpa = paint.opacity;
				var dr = r;
				var dg = g;
				var db = b;
				if(brush.texture!="none"){
					//テクスチャ画像を適用する
					var texW=brush.textureImg.width;
					var texH=brush.textureImg.height;
					var tex = brush.textureBuf.data[((top+v)%texH)*texW*4+((left+h)%texW)*4+0]/255;
					dr = tex*r+(1-tex)*br;
					dg = tex*g+(1-tex)*bg;
					db = tex*b+(1-tex)*bb;
					//stOpa *= tex;
				}
				var opacity = stOpa;
				if(paint.cmdKey){
					//cmdKeyは消すブラシ
					opacity *= -1;
					r=255;g=255;b=255;
				}
				dstData.data[v*width*4+h*4+0] = (1-stOpa)*dstData.data[v*width*4+h*4+0]+stOpa*dr;
				dstData.data[v*width*4+h*4+1] = (1-stOpa)*dstData.data[v*width*4+h*4+1]+stOpa*dg;
				dstData.data[v*width*4+h*4+2] = (1-stOpa)*dstData.data[v*width*4+h*4+2]+stOpa*db;
				dstData.data[v*width*4+h*4+3] += opacity*255;
			}
		}

		//ctx.clearRect(0,0,1,1);
		ctx.fillStyle = "";
		ctx.putImageData(dstData, left, top);

		//ここから塗り
		if(paint.fillShape){
			//裏画面に面を書く
			ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
			ttx.beginPath();
			drawRect(ttx, tx+0.5, ty+0.5, tx+twidth+0.5, ty+theight+0.5);
			ttx.closePath();
			ttx.fill();

			//
			var fillData = ttx.getImageData(left,top,width,height);
			for(var v=0;v<height;v++){
				for(var h=0;h<width;h++){
					var k = v*width*4+h*4;
					fillData.data[k+0] = dstData.data[k+0];
					fillData.data[k+1] = dstData.data[k+1];
					fillData.data[k+2] = dstData.data[k+2];
				}
			}
			ttx.putImageData(fillData, left, top);

			//領域にfillColorを適用  (:適用箇所以外は完全透明)
			fillColorFunc(tmpCanv);

			//表画面に合成
			ctx.clearRect(0,0,1,1);
			myDrawImage(canvas, tmpCanv, 0, 0);
		}
		drawScaledCanvas();
	}
}

function fillShapeOnOffFunc(){
	paint.fillShape = !paint.fillShape;
	document.getElementById('button-nav-rect').childNodes[0].src = "img/tb_Rect"+(paint.fillShape?"2":"")+".png";
	document.getElementById('button-nav2-rect').childNodes[0].src = "img/tb_Rect"+(paint.fillShape?"2":"")+".png";
	document.getElementById('button-nav-oval').childNodes[0].src = "img/tb_Oval"+(paint.fillShape?"2":"")+".png";
	document.getElementById('button-nav2-oval').childNodes[0].src = "img/tb_Oval"+(paint.fillShape?"2":"")+".png";
}

//--

function ovalDownFunc(evt){
	rectDownFunc(evt,true);
}

function ovalUpFunc(evt){
	rectUpFunc(evt);
}

function ovalMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && keys[' '.charCodeAt(0)]){
		//移動
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down" && paint.path.length>0){
		x = (x/paint.scale + paint.scroll.x)|0;
		y = (y/paint.scale + paint.scroll.y)|0;
		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		var tmpCanv = document.getElementById('tmpCanvas');
		var ttx = tmpCanv.getContext('2d');
		var x1 = paint.path[0].x;
		var y1 = paint.path[0].y;
		if(paint.shiftKey){
			if(y-y1>0 == x-x1>0){
				x = x1+(y-y1);
			}
			else{
				x = x1-(y-y1);
			}
		}

		//半透明とか対応するために、もうひとつcanvasを用意して、線をそちらに書いて、こっちのcanvasに合成する
		//undoBufから退避データを持ってくる
		ctx.putImageData(paint.undoBuf, 0, 0);

		var tx = Math.min(x,x1);
		var ty = Math.min(y,y1);
		var twidth = Math.abs(x-x1);
		var theight = Math.abs(y-y1);

		var left = Math.min(x,x1)-brush.shapeSize|0;
		var top = Math.min(y,y1)-brush.shapeSize|0;
		var width = Math.abs(x-x1)+brush.shapeSize*2+2|0;
		var height = Math.abs(y-y1)+brush.shapeSize*2+2|0;
		//裏画面に線を書く
		ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
		ttx.beginPath();
		drawOval(ttx, tx+twidth/2+0.5, ty+theight/2+0.5, twidth/2, theight/2);
		ttx.closePath();
		ttx.stroke();

		//表画面に合成
		var r = rgbColor(paint.foreColor).r;
		var g = rgbColor(paint.foreColor).g;
		var b = rgbColor(paint.foreColor).b;
		var br = rgbColor(paint.backColor).r;
		var bg = rgbColor(paint.backColor).g;
		var bb = rgbColor(paint.backColor).b;
		var lineData = ttx.getImageData(left,top,width,height);
		var dstData = ctx.getImageData(left,top,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				//線が引かれているか
				var f = (lineData.data[v*width*4+h*4+3]<80);
				{
					//まずペンを入れる前の画素を取り出す
					var k = ((top+v)*canvas.width+left+h)*4;
					dstData.data[v*width*4+h*4+3] = paint.undoBuf.data[k+3];
					if(paint.undoBuf.data[k+3]==0){
						dstData.data[v*width*4+h*4+0] = 255;
						dstData.data[v*width*4+h*4+1] = 255;
						dstData.data[v*width*4+h*4+2] = 255;
					}else{
						dstData.data[v*width*4+h*4+0] = paint.undoBuf.data[k+0];
						dstData.data[v*width*4+h*4+1] = paint.undoBuf.data[k+1];
						dstData.data[v*width*4+h*4+2] = paint.undoBuf.data[k+2];
					}
					if(f) continue;
				}
				var stOpa = paint.opacity;
				var dr = r;
				var dg = g;
				var db = b;
				if(brush.texture!="none"){
					//テクスチャ画像を適用する
					var texW=brush.textureImg.width;
					var texH=brush.textureImg.height;
					var tex = brush.textureBuf.data[((top+v)%texH)*texW*4+((left+h)%texW)*4+0]/255;
					dr = tex*r+(1-tex)*br;
					dg = tex*g+(1-tex)*bg;
					db = tex*b+(1-tex)*bb;
					//stOpa *= tex;
				}
				var opacity = stOpa;
				if(paint.cmdKey){
					//cmdKeyは消すブラシ
					opacity *= -1;
					r=255;g=255;b=255;
				}
				dstData.data[v*width*4+h*4+0] = (1-stOpa)*dstData.data[v*width*4+h*4+0]+stOpa*dr;
				dstData.data[v*width*4+h*4+1] = (1-stOpa)*dstData.data[v*width*4+h*4+1]+stOpa*dg;
				dstData.data[v*width*4+h*4+2] = (1-stOpa)*dstData.data[v*width*4+h*4+2]+stOpa*db;
				dstData.data[v*width*4+h*4+3] += opacity*255;
			}
		}

		//ctx.clearRect(0,0,1,1);
		ctx.fillStyle = "";
		ctx.putImageData(dstData, left, top);

		//ここから塗り
		if(paint.fillShape){
			//裏画面に面を書く
			ttx.clearRect(0,0,tmpCanv.width,tmpCanv.height);
			ttx.beginPath();
			drawOval(ttx, tx+twidth/2+0.5, ty+theight/2+0.5, twidth/2-(brush.shapeSize-1.3)/2, theight/2-(brush.shapeSize-1.3)/2);
			ttx.closePath();
			ttx.fill();

			//
			var fillData = ttx.getImageData(left,top,width,height);
			for(var v=0;v<height;v++){
				for(var h=0;h<width;h++){
					var k = v*width*4+h*4;
					fillData.data[k+0] = dstData.data[k+0];
					fillData.data[k+1] = dstData.data[k+1];
					fillData.data[k+2] = dstData.data[k+2];
				}
			}
			ttx.putImageData(fillData, left, top);

			//領域にfillColorを適用  (:適用箇所以外は完全透明)
			fillColorFunc(tmpCanv);

			//表画面に合成
			ctx.clearRect(0,0,1,1);
			myDrawImage(canvas, tmpCanv, 0, 0);
		}
		drawScaledCanvas();
	}
}

function drawOval(ctx, cx, cy, rx, ry){
	//ベジェ曲線とか使わず直線で書けばええんや！
	for(var a=0; a<6.28; a+=0.0628){
		var x = cx+rx*Math.sin(a);
		var y = cy+ry*Math.cos(a);
		if(a==0)ctx.moveTo(x,y);
		else ctx.lineTo(x,y);
	}
}

function drawRect(ctx, l, t, r, b){
	ctx.moveTo(l,t);
	ctx.lineTo(r,t);
	ctx.lineTo(r,b);
	ctx.lineTo(l,b);
	ctx.lineTo(l,t);
}

//--

function paintbucketDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		if(evt.button&2) _mouse.rightclick=true;
		if(keys[' '.charCodeAt(0)]&&paint.scale>1.0){
			//移動
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			paintbucketMoveFunc(evt);
		}
		else if(evt.altKey||(evt.button&2)){
			//スポイト
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			spoitFunc(x,y,"fillcolor");
		}
		else{
			var canvas = document.getElementById(paint.picElem);
			var ctx = canvas.getContext('2d');
			paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
			paint.redoBuf = undefined;

			//色を取得
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			var srcData = ctx.getImageData(x,y,1,1);
			var color = colorRGB(srcData.data[0],srcData.data[1],srcData.data[2],srcData.data[3]);

			//裏画面
			var tmpCanv = document.getElementById('tmpCanvas');

			//条件の色に合うかで2値にする  (:条件に合うところは半透明)
			colorRangeFunc(tmpCanv, canvas, color, paint.distance);

			//シードフィル  (:塗るところは不透明)
			var srcData = tmpCanv.getContext('2d').getImageData(0,0,tmpCanv.width,tmpCanv.height);
			var dat = seedFillFunc(srcData, tmpCanv.width, tmpCanv.height, x, y);
			tmpCanv.getContext('2d').putImageData(dat,0,0);

			//領域にfillColorを適用  (:適用箇所以外は完全透明)
			fillColorFunc(tmpCanv);

			//表画面に合成
			ctx.clearRect(0,0,1,1);
			myDrawImage(canvas, tmpCanv, 0, 0);
			saveCanvas();
		}
	}
}

function paintbucketUpFunc(evt){
	_mouse.button="up";
}

function paintbucketMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && keys[' '.charCodeAt(0)]){
		//移動
		paintMoveFunc(x,y);
	}
}

//条件の色に合うかで2値にする  (:条件に合うところは不透明)
function colorRangeFunc(dstCanvas, srcCanvas, color, distance){
	var r = rgbColor(color).r;
	var g = rgbColor(color).g;
	var b = rgbColor(color).b;
	var srcWidth = srcCanvas.width;
	var srcHeight = srcCanvas.height;
	var srcData = srcCanvas.getContext('2d').getImageData(0,0,srcWidth,srcHeight);
	var dstData = dstCanvas.getContext('2d').getImageData(0,0,dstCanvas.width,dstCanvas.height);
	var sr=0; var sg=0; var sb=0;
	for(var v=0;v<srcHeight;v++){
		for(var h=0;h<srcWidth;h++){
			var k = v*srcWidth*4+h*4;
			if(srcData.data[k+3]==0){
				sr=255; sg=255; sb=255;
			}
			else{
				sr = srcData.data[k+0];
				sg = srcData.data[k+1];
				sb = srcData.data[k+2];
			}
			var i = v*dstCanvas.width*4+h*4;
			if((sr-r)*(sr-r)+(sg-g)*(sg-g)+(sb-b)*(sb-b)>distance*distance){
				dstData.data[i+3] = 0;
			}
			else{
				dstData.data[i+0] = sr;
				dstData.data[i+1] = sg;
				dstData.data[i+2] = sb;
				dstData.data[i+3] = 128;
			}
		}
	}
	dstCanvas.getContext('2d').putImageData(dstData, 0, 0);
}

//シードフィル  (:塗るところは不透明)
function seedFillFunc(Data, width, height, x, y){
	var seedX = [x];
	var seedY = [y];
	while(seedX.length>0){
		var nx = seedX[seedX.length-1];
		seedX.length--;
		var ny = seedY[seedY.length-1];
		seedY.length--;
		seedFillSub(Data,width*4,seedX,seedY,nx,ny);
	}
	return Data;
}

function seedFillSub(Data,len,seedX,seedY,x,y){
	//左側で塗れる範囲を探す
	for(var xl=x; xl>=0; xl--){
		var i = y*len+xl*4;
		if(Data.data[i+3]==0||Data.data[i+3]==255){
			xl++; break;
		}
		Data.data[i+3]=255;
	}
	//右側で塗れる範囲を探す
	for(var xr=x+1; xr<len/4; xr++){
		i = y*len+xr*4;
		if(Data.data[i+3]==0||Data.data[i+3]==255){
			xr--; break;
		}
		Data.data[i+3]=255;
	}
	if(xr<xl)return;
	if(xr>len/4)xr--;
	//上側のシードピクセルを探す
	if(y-1>=0){
		for(var xu=xl; xu<len/4; xu++){
			i = (y-1)*len+xu*4;
			var next = 0;
			if(xu+1<len/4)next = Data.data[i+4+3];
			if(Data.data[i+3]==128 && next==0){
				seedX[seedX.length] = xu;
				seedY[seedY.length] = y-1;
				if(xu>=xr)break;
			}
			if(xu==xr&&Data.data[i+3]!=128)break;
		}
	}
	//下側のシードピクセルを探す
	if(Data.data[(y+1)*len]!=undefined){
		for(var xd=xl; xd<len/4; xd++){
			i = (y+1)*len+xd*4;
			var next = 0;
			if(xd+1<len/4)next = Data.data[i+4+3];
			if(Data.data[i+3]==128 && next==0){
				seedX[seedX.length] = xd;
				seedY[seedY.length] = y+1;
				if(xd>=xr)break;
			}
			if(xd==xr&&Data.data[i+3]!=128)break;
		}
	}
}

//領域にfillColorを適用  (:適用箇所以外は完全透明)
function fillColorFunc(canvas, fullfill){
	var color = paint.fillColor;
	var r = rgbColor(color).r;
	var g = rgbColor(color).g;
	var b = rgbColor(color).b;
	var op = paint.fillOpacity;
	var width = canvas.width;
	var height = canvas.height;

	var left = width;
	var top = height;
	var right = 0;
	var bottom = 0;

	var Data = canvas.getContext('2d').getImageData(0,0,width,height);
	if(paint.colorMode=="linear"||paint.colorMode=="radial"){
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					Data.data[k+3]=0; 
					continue;
				}
				if(h<left)left=h;
				if(v<top)top=v;
				if(h+1>right)right=h+1;
				if(v+1>bottom)bottom=v+1;
			}
		}
		var ctx = canvas.getContext("2d");
		var x1=0,x2=0,y1=0,y2=0,r1=0,r2=0;
		if(paint.colorMode=="linear"){
			x1 = paint.linearPoints[0].x;
			x2 = paint.linearPoints[paint.linearPoints.length-1].x;
			y1 = paint.linearPoints[0].y;
			y2 = paint.linearPoints[paint.linearPoints.length-1].y;
		}else{
			x1 = paint.radialPoints[0].x;
			x2 = paint.radialPoints[paint.radialPoints.length-1].x;
			y1 = paint.radialPoints[0].y;
			y2 = paint.radialPoints[paint.radialPoints.length-1].y;
			r1 = paint.radialPoints[0].r;
			r2 = paint.radialPoints[paint.radialPoints.length-1].r;
		}
		var dx = (right-left)*Math.abs(x1-x2);
		var dy = (bottom-top)*Math.abs(y1-y2);
		var gx1=0,gy1=0,gx2=0,gy2=0,gr1=0,gr2=0;
		if(dx>dy){
			gx1 = left+x1*(right-left)/160;
			gx2 = left+x2*(right-left)/160;
			gy1 = (top+bottom)/2+(80-y2)*(right-left)/160;
			gy2 = (top+bottom)/2+(80-y1)*(right-left)/160;
			if(paint.colorMode=="radial"){
				gr1 = r1*(right-left)/160;
				gr2 = r2*(right-left)/160;
			}
		}else{
			gy1 = top+y1*(bottom-top)/160;
			gy2 = top+y2*(bottom-top)/160;
			gx1 = (left+right)/2+(80-x2)*(bottom-top)/160;
			gx2 = (left+right)/2+(80-x1)*(bottom-top)/160;
			if(paint.colorMode=="radial"){
				gr1 = r1*(bottom-top)/160;
				gr2 = r2*(bottom-top)/160;
			}
		}
		var grd=null;
		if(paint.colorMode=="linear"){
			grd = ctx.createLinearGradient(gx1,gy1,gx2,gy2);
			for(var i=0; i<paint.linearPoints.length; i++){
				grd.addColorStop(paint.linearPoints[i].loc, paint.linearPoints[i].color);
			}
		}else{
			grd = ctx.createRadialGradient(gx1, gy1, gr1, gx2, gy2, gr2);
			for(var i=0; i<paint.radialPoints.length; i++){
				grd.addColorStop(paint.radialPoints[i].loc, paint.radialPoints[i].color);
			}
		}
		ctx.save();
		ctx.fillStyle = grd;
		ctx.fillRect(left, top, right-left, bottom-top);
		ctx.restore();

		var newData = canvas.getContext('2d').getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					newData.data[k+3]=0; 
					continue;
				}
			}
		}
		canvas.getContext('2d').putImageData(newData, 0, 0);
	}else if(paint.colorMode=="pattern"){
		//パターン
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					Data.data[k+3]=0; 
					continue;
				}
				if(h<left)left=h;
				if(v<top)top=v;
				if(h+1>right)right=h+1;
				if(v+1>bottom)bottom=v+1;
			}
		}

		//パターンデータ
		var tmpCanv = document.getElementById('tmpCanvas');
		var ttx = tmpCanv.getContext('2d');
		var ptnimg = paint.patternImg[paint.patternId];
		var ptnBuf = null;
		if(ptnimg!=undefined&&ptnimg.complete){
			ttx.drawImage(ptnimg,0,0);
			ptnBuf = ttx.getImageData(0,0,ptnimg.width,ptnimg.height);
		}
		else return;

		//scale
		var scalex = paint.patternScale;
		var scaley = paint.patternScale;
		if(paint.scaleToFit){
			scalex = (right-left)/ptnimg.width;
			scaley = (bottom-top)/ptnimg.height;
		}

		r = rgbColor(paint.fillColor).r;
		g = rgbColor(paint.fillColor).g;
		b = rgbColor(paint.fillColor).b;
		var br = 255;//rgbColor(paint.backColor).r;
		var bg = 255;//rgbColor(paint.backColor).g;
		var bb = 255;//rgbColor(paint.backColor).b;

		//パターンを反映
		for(var v=top;v<bottom;v++){
			for(var h=left;h<right;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					Data.data[k+3]=0; 
					continue;
				}
				var px = (h/scalex)%ptnimg.width|0;
				var py = (v/scaley)%ptnimg.height|0;
				op = ptnBuf.data[py*ptnimg.width*4+px*4+3]/255;
				var pr = ptnBuf.data[py*ptnimg.width*4+px*4+0]/255;
				var pg = ptnBuf.data[py*ptnimg.width*4+px*4+1]/255;
				var pb = ptnBuf.data[py*ptnimg.width*4+px*4+2]/255;
				pr = (pr)*r+(1-pr)*br;
				pg = (pg)*g+(1-pg)*bg;
				pb = (pb)*b+(1-pb)*bb;
				Data.data[k+0] = Data.data[k+0]*(1-op)+op*pr;
				Data.data[k+1] = Data.data[k+1]*(1-op)+op*pg;
				Data.data[k+2] = Data.data[k+2]*(1-op)+op*pb;
				Data.data[k+3] = Data.data[k+3]*(1-op)+op*255;
			}
		}

		canvas.getContext('2d').putImageData(Data, 0, 0);
	}else{
		//単色
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					Data.data[k+3]=0; 
					continue;
				}
				Data.data[k+0] = Data.data[k+0]*(1-op)+op*r;
				Data.data[k+1] = Data.data[k+1]*(1-op)+op*g;
				Data.data[k+2] = Data.data[k+2]*(1-op)+op*b;
				Data.data[k+3] = Data.data[k+3]*(1-op)+op*255;
			}
		}
		canvas.getContext('2d').putImageData(Data, 0, 0);
	}
}

//領域に元のイメージを考慮せずfillColorを適用  (:適用箇所以外は完全透明)
function replaceFillColorFunc(canvas, fullfill){
	var color = paint.fillColor;
	var r = rgbColor(color).r;
	var g = rgbColor(color).g;
	var b = rgbColor(color).b;
	var op = paint.fillOpacity;
	var width = canvas.width;
	var height = canvas.height;

	var left = width;
	var top = height;
	var right = 0;
	var bottom = 0;

	var Data = canvas.getContext('2d').getImageData(0,0,width,height);
	if(paint.colorMode=="linear"||paint.colorMode=="radial"){
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					Data.data[k+3]=0;
					continue;
				}
				if(h<left)left=h;
				if(v<top)top=v;
				if(h+1>right)right=h+1;
				if(v+1>bottom)bottom=v+1;
			}
		}
		var ctx = canvas.getContext("2d");
		var x1=0,x2=0,y1=0,y2=0,r1=0,r2=0;
		if(paint.colorMode=="linear"){
			x1 = paint.linearPoints[0].x;
			x2 = paint.linearPoints[paint.linearPoints.length-1].x;
			y1 = paint.linearPoints[0].y;
			y2 = paint.linearPoints[paint.linearPoints.length-1].y;
		}else{
			x1 = paint.radialPoints[0].x;
			x2 = paint.radialPoints[paint.radialPoints.length-1].x;
			y1 = paint.radialPoints[0].y;
			y2 = paint.radialPoints[paint.radialPoints.length-1].y;
			r1 = paint.radialPoints[0].r;
			r2 = paint.radialPoints[paint.radialPoints.length-1].r;
		}
		var dx = (right-left)*Math.abs(x1-x2);
		var dy = (bottom-top)*Math.abs(y1-y2);
		var gx1=0,gy1=0,gx2=0,gy2=0,gr1=0,gr2=0;
		if(dx>dy){
			gx1 = left+x1*(right-left)/160;
			gx2 = left+x2*(right-left)/160;
			gy1 = (top+bottom)/2+(80-y2)*(right-left)/160;
			gy2 = (top+bottom)/2+(80-y1)*(right-left)/160;
			if(paint.colorMode=="radial"){
				gr1 = r1*(right-left)/160;
				gr2 = r2*(right-left)/160;
			}
		}else{
			gy1 = top+y1*(bottom-top)/160;
			gy2 = top+y2*(bottom-top)/160;
			gx1 = (left+right)/2+(80-x2)*(bottom-top)/160;
			gx2 = (left+right)/2+(80-x1)*(bottom-top)/160;
			if(paint.colorMode=="radial"){
				gr1 = r1*(bottom-top)/160;
				gr2 = r2*(bottom-top)/160;
			}
		}
		var grd=null;
		if(paint.colorMode=="linear"){
			grd = ctx.createLinearGradient(gx1,gy1,gx2,gy2);
			for(var i=0; i<paint.linearPoints.length; i++){
				grd.addColorStop(paint.linearPoints[i].loc, paint.linearPoints[i].color);
			}
		}else{
			grd = ctx.createRadialGradient(gx1, gy1, gr1, gx2, gy2, gr2);
			for(var i=0; i<paint.radialPoints.length; i++){
				grd.addColorStop(paint.radialPoints[i].loc, paint.radialPoints[i].color);
			}
		}
		ctx.save();
		ctx.fillStyle = grd;
		ctx.clearRect(left, top, right-left, bottom-top);
		ctx.fillRect(left, top, right-left, bottom-top);
		ctx.restore();

		var newData = canvas.getContext('2d').getImageData(0,0,width,height);
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					newData.data[k+3]=0; 
					continue;
				}
			}
		}
		canvas.getContext('2d').putImageData(newData, 0, 0);
	}else if(paint.colorMode=="pattern"){
		//パターン
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					Data.data[k+3]=0; 
					continue;
				}
				if(h<left)left=h;
				if(v<top)top=v;
				if(h+1>right)right=h+1;
				if(v+1>bottom)bottom=v+1;
			}
		}

		//パターンデータ
		var tmpCanv = document.getElementById('tmpCanvas');
		var ttx = tmpCanv.getContext('2d');
		var ptnimg = paint.patternImg[paint.patternId];
		var ptnBuf = null;
		if(ptnimg!=undefined&&ptnimg.complete){
			ttx.drawImage(ptnimg,0,0);
			ptnBuf = ttx.getImageData(0,0,ptnimg.width,ptnimg.height);
		}
		else return;

		//scale
		var scalex = paint.patternScale;
		var scaley = paint.patternScale;
		if(paint.scaleToFit){
			scalex = (right-left)/ptnimg.width;
			scaley = (bottom-top)/ptnimg.height;
		}

		r = rgbColor(paint.fillColor).r;
		g = rgbColor(paint.fillColor).g;
		b = rgbColor(paint.fillColor).b;
		var br = 255;//rgbColor(paint.backColor).r;
		var bg = 255;//rgbColor(paint.backColor).g;
		var bb = 255;//rgbColor(paint.backColor).b;

		//パターンを反映
		for(var v=top;v<bottom;v++){
			for(var h=left;h<right;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					Data.data[k+3]=0; 
					continue;
				}
				var px = (h/scalex)%ptnimg.width|0;
				var py = (v/scaley)%ptnimg.height|0;
				op = ptnBuf.data[py*ptnimg.width*4+px*4+3]/255;
				var pr = ptnBuf.data[py*ptnimg.width*4+px*4+0]/255;
				var pg = ptnBuf.data[py*ptnimg.width*4+px*4+1]/255;
				var pb = ptnBuf.data[py*ptnimg.width*4+px*4+2]/255;
				pr = (1-pr)*r+pr*br;
				pg = (1-pg)*g+pg*bg;
				pb = (1-pb)*b+pb*bb;
				Data.data[k+0] = pr;
				Data.data[k+1] = pg;
				Data.data[k+2] = pb;
				Data.data[k+3] = op*255;
			}
		}

		canvas.getContext('2d').putImageData(Data, 0, 0);
	}else{
		//単色
		for(var v=0;v<height;v++){
			for(var h=0;h<width;h++){
				var k = v*width*4+h*4;
				if(Data.data[k+3]!=255){
					Data.data[k+3]=0; 
					continue;
				}
				Data.data[k+0] = r;
				Data.data[k+1] = g;
				Data.data[k+2] = b;
				Data.data[k+3] = op*255;
			}
		}
		canvas.getContext('2d').putImageData(Data, 0, 0);
	}
}
//--

function typeDownFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(x>=0 && x<paint.zwidth && y>=0 && y<paint.zheight){
		if(evt.button&2) _mouse.rightclick=true;
		if(keys[' '.charCodeAt(0)]&&paint.scale>1.0){
			//移動
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};
			brushMoveFunc(evt);
		}
		else if(evt.altKey||(evt.button&2)){
			//スポイト
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			spoitFunc(x,y,"forecolor");
		}
		else{
			x = (x/paint.scale + paint.scroll.x)|0;
			y = (y/paint.scale + paint.scroll.y)|0;
			_mouse.button="down";
			paint.path = [];
			paint.path[0] = {x:x,y:y};

			var areaElm = document.getElementById("typeInputArea");
			if(areaElm!=undefined){
				if(x>areaElm.offsetLeft&&y>areaElm.offsetTop){
					return;
				}
				//固定
				typeEndFunc();
			}
			areaElm = document.createElement('textarea');
			areaElm.id = "typeInputArea";
			areaElm.style.position = "absolute";
			areaElm.style.width = paint.width-x+"px";
			areaElm.style.height = paint.height-y+"px";
			areaElm.style.left = x+"px";
			areaElm.style.top = y-12+"px";
			areaElm.style.font = makeFontStr(pfont);
			areaElm.style.lineHeight = (pfont.size*1.5|0)+"px";
			areaElm.style.color = paint.foreColor;
			areaElm.style.opacity = paint.opacity;
			areaElm.style["text-shadow"]="";
			if(pfont.shadow){
				areaElm.style["text-shadow"] = (1+pfont.size/15|0)+"px "+(1+pfont.size/15|0)+"px "+(1+pfont.size/15|0)+"px "+"#000000";
			}
			areaElm.style.background = "transparent";
			document.getElementById(paint.elem).appendChild(areaElm);
			areaElm.focus();
			setTimeout(function(){
				areaElm.focus();
			},0);
		}
	}
}

function typeUpFunc(evt){
	if(_mouse.button=="down" && paint.path.length>0){
		paint.path = [];
		//saveCanvas();
	}
	_mouse.button="up";
	_mouse.rightclick=false;
}

function typeMoveFunc(evt){
	var cardParent = document.getElementById(paint.elem).parentNode;
	var x = evt.xx - cardParent.offsetLeft;
	var y = evt.yy - cardParent.offsetTop;
	if(_mouse.button=="down" && keys[' '.charCodeAt(0)]){
		//移動
		paintMoveFunc(x,y);
	}
	else if(_mouse.button=="down" && paint.path.length>0){

	}
}

function typeEndFunc(){
	var areaElm = document.getElementById("typeInputArea");
	if(areaElm!=undefined){
		//
		//固定
		//

		var canvas = document.getElementById(paint.picElem);
		var ctx = canvas.getContext('2d');
		paint.undoBuf = ctx.getImageData(0,0,canvas.width,canvas.height);
		paint.redoBuf = undefined;

		//font-style
		ctx.save();
		ctx.font = makeFontStr(pfont);

		//shadow
		if(pfont.shadow){
			ctx.shadowBlur = 1+pfont.size/15|0;
			ctx.shadowColor = "#000000";
			ctx.shadowOffsetX = 1+pfont.size/15|0;
			ctx.shadowOffsetY = 1+pfont.size/15|0;
		}

		//color
		ctx.fillStyle=paint.foreColor;
		ctx.strokeStyle=paint.foreColor;

		//描画
		ctx.textBaseline = "top";
		var text = areaElm.value.split("\n");
		for(var i=0; i<text.length; i++){
			if(pfont.outline){
				ctx.strokeText(text[i], areaElm.offsetLeft+3, areaElm.offsetTop+3+i*pfont.size*1.5|0);
			}else{
				ctx.fillText(text[i], areaElm.offsetLeft+3, areaElm.offsetTop+3+i*pfont.size*1.5|0);
			}
		}
		ctx.restore();
		saveCanvas();

		areaElm.parentNode.removeChild(areaElm);
	}
}

function makeFontStr(pfont){
	var fontStr = "";
	fontStr += pfont.italic?"italic ":"";
	fontStr += pfont.bold?"bold ":"";
	fontStr += pfont.size+"pt "+pfont.fontname+" ";
	return fontStr;
}

//--
//選択領域の拡大縮小

var savedFloatElem;
function paintScaleDialogOpened(){
	document.getElementById("paintScaleWidth").value = "100";
	document.getElementById("paintScaleHeight").value = "100";
	//float領域を別保存
	var floatElem = document.getElementById('floatingCanvas');
	if(!floatElem){
		$('#paintScaleDialog').dialog('close');
		return;
	}
	savedFloatElem = document.createElement("canvas");
	savedFloatElem.width = floatElem.width;
	savedFloatElem.height = floatElem.height;
	var stx = savedFloatElem.getContext('2d');
	stx.drawImage(floatElem, 0, 0);
}

function paintScaleChange(){
	var hp = document.getElementById("paintScaleWidth").value;
	var vp = document.getElementById("paintScaleHeight").value;
	var floatElem = document.getElementById('floatingCanvas');
	floatElem.width = savedFloatElem.width*hp/100;
	floatElem.height = savedFloatElem.height*vp/100;
	var ctx = floatElem.getContext('2d');
	ctx.drawImage(savedFloatElem, 0, 0, floatElem.width, floatElem.height);
}

function paintScaleCancel(){
	//保存していたfloat領域に戻す
	var floatElem = document.getElementById('floatingCanvas');
	floatElem.width = savedFloatElem.width;
	floatElem.height = savedFloatElem.height;
	var ctx = floatElem.getContext('2d');
	ctx.drawImage(savedFloatElem, 0, 0);
	savedFloatElem = null;
	$('#paintScaleDialog').dialog('close');
}

function paintScaleOK(){
	savedFloatElem = null;
	$('#paintScaleDialog').dialog('close');
}


