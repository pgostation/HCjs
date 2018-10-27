//"use strict";

//--
//システム、マウス

var startUpDate = new Date();

var system = {
		version:function(){return "4.0";},
		shortversion:function(){return "4.0";},
		_lockedScreen:false,
		get lockScreen(){
			return this._lockedScreen;
		},
		set lockScreen(x){
			this._lockedScreen = x;
			postMessage({cmd:"changeProp", obj:"system", prop:"lockedScreen", value:x});
			//wait(0.5);
		},
		_lockMessages:false,
		get lockMessages(){
			return this._lockMessages;
		},
		set lockMessages(x){
			this._lockMessages = x;
			postMessage({cmd:"changeProp", obj:"system", prop:"lockedMessages", value:x});
		},
		lockRecent:false,
		_editBackground:false,
		get editBkgnd(){
			return this._editBackground;
		},
		set editBkgnd(x){
			this._editBackground = x;
			postMessage({cmd:"changeProp", obj:"system", prop:"editBackground", value:x});
		},
		_userlevel:5,
		get userLevel(){
			return this._userlevel;
		},
		set userLevel(x){
			this._userlevel = x;
			postMessage({cmd:"changeProp", obj:"system", prop:"userLevel", value:x});
		},
		_cursor:"hand",
		get cursor(){
			return this._cursor;
		},
		set cursor(x){
			this._cursor = x;
			postMessage({cmd:"changeProp", obj:"system", prop:"cursor", value:x});
		},
		visual:[],
		_selectedtext:"",
		itemDelimiter:",",
		environment:"development",
		ticks:function(){return parseInt((new Date()-startUpDate)/1000*60);},
		optionkey:function(){
			extractQueue();//キー入力を更新
			return (keys[keycode_alt])?"down":"up";
		},
		shiftkey:function(){
			extractQueue();//キー入力を更新
			return (keys[keycode_shift])?"down":"up";
		},
		commandkey:function(){
			return this.cmdkey();
		},
		cmdkey:function(){
			extractQueue();//キー入力を更新
			return (keys[keycode_meta])?"down":"up";
		},
		_result:"",
		result:function(){
			return system._result;
		},
		annuity:function(rate,periods){
			return (1-(1+rate)-periods)/rate;
		},
		average:function(){
			var a = arguments;
			if(arguments.length==1){
				a = (arguments[0]+"").split(",");
			}
			var sum=0;
			for(var i=0; i<a.length; i++){
				sum+=a[i];
			}
			return sum/a.length;
		},
		chartonum:function(x){
			return x.charCodeAt(0);
		},
		compound:function(rate,periods){
			return Math.pow(rate+1,periods);
		},
		date:function(){
			var d = new Date();
			return (d.getFullYear()%100)+"."+(d.getMonth()+1)+"."+d.getDate();
		},
		shortdate:function(){
			var d = new Date();
			var month = d.getMonth()+1;
			if(month<=9) month = "0"+month;
			var day = d.getDate();
			if(day<=9) day = "0"+day;
			return (d.getFullYear()%100)+"."+month+""+day;
		},
		longdate:function(){
			var d = new Date();
			if(browserLang=="ja"){
				var r = d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 "+
				["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"][d.getDay()];
			}else{
				var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
				var dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
				r = dayOfWeek+", "+month+" "+d.getDate()+". "+d.getFullYear();
			}
			return r;
		},
		diskspace:function(){
			return 49999999;//てきとう
		},
		exp1:function(v){
			return Math.exp(v)-1;
		},
		exp2:function(v){
			return Math.pow(2,v);
		},
		_foundChunk:"",
		foundchunk:function(){
			return this._foundChunk;
		},
		_foundField:"",
		foundfield:function(){
			return this._foundField;
		},
		_foundLine:"",
		foundline:function(){
			return this._foundLine;
		},
		_foundText:"",
		foundtext:function(){
			return this._foundText;
		},
		heapspace:function(){
			return 49999999;//てきとう
		},
		length:function(v){
			return v.length;
		},
		ln:function(v){
			return Math.log(v);
		},
		ln1:function(v){
			return Math.log(1+v);
		},
		log2:function(v){
			return Math.log(v)/Math.log(2);
		},
		menus:function(v){
			var r = "";
			for(var i=0; i<browseMenus.length; i++){
				if(i>0) r+="\n";
				r += browseMenus[i].name;
			}
			return r;
		},
		numberOfCards:function(){
			return cardData.length;
		},
		numberOfBgs:function(){
			return bgData.length;
		},
		numberOfMenus:function(){
			return browseMenus.length;
		},
		numberOfMenuitems:function(){
			return "!";
		},
		numberOfWindows:function(){
			return "!";
		},
		numberOfChars:function(v){
			return v.length;
		},
		numberOfItems:function(v){
			return v.split(system.itemDelimiter).length;
		},
		numberOfWords:function(v){
			postMessage(v.replace(/\t\n/g," "));
			return v.replace(/\t\n/g," ").split(" ").length;
		},
		numberOfLines:function(v){
			return v.split("\n").length;
		},
		numtochar:function(v){
			return String.fromCharCode(v);
		},
		offset:function(v1,v2){
			return (v2+"").indexOf(v1)+1;
		},
		screenrect:function(){
			return rect(0,0,this.innerWidth,this.innerHeight);
		},
		secs:function(){
			return parseInt((new Date()-(Date.parse("1904/1/1")-Date.parse("1970/1/1")))/1000);
		},
		seconds:function(){
			return parseInt((new Date()-(Date.parse("1904/1/1")-Date.parse("1970/1/1")))/1000);
		},
		_selectedElm:"",
		_selectedText:"",
		selection:function(){
			postMessage("selection:"+this._selectedElm);
			return this._selectedElm; //むー
		},
		selectedbutton:function(fam){
			var type = (fam.indexOf("bg")==-1)?"card":"background";
			var famnum = parseInt(fam.substring(fam.lastIndexOf(" ")+1));
			var parts = (type=="card")?currentCardObj.parts:currentBgObj.parts;
			for(var i=0; i<parts.length; i++){
				if(parts[i].type=="button" && parts[i].family==famnum){
					if(parts[i].hilite==true){
						return type +" button id "+ parts[i].id;
					}
				}
			}
			return "";
		},
		selectedchunk:function(){
			postMessage({cmd:"getSelectedProps"});
			/*while(true){
			var ret = extractQueue("selectedProps");
			if(ret!=undefined){
				break;
			}
		}*/
			postMessage("selectedchunk:"+this._selectedElm);
			postMessage(this._selectedText);
		},
		params:function(){
			if(vmArgs){
				return vmMsg+" "+vmArgs.join(",");
			}
			else{
				return vmMsg;
			}
		},
		playingSound:"",
		sound:function(){
			extractQueue();//更新
			if(this.playingSound==""){
				return "done";
			}
			return this.playingSound;
		},
		stacks:function(){
			return stackName;
		},
		sum:function(){
			var a = arguments;
			if(arguments.length==1){
				a = (arguments[0]+"").split(",");
			}
			var sum=0;
			for(var i=0; i<a.length; i++){
				sum+=a[i];
			}
			return sum;
		},
		systemversion:function(){
			return 10; //漢字Talk10に固定
		},
		target:function(){
			return target();
		},
		time:function(){
			return this.htTime("short");
		},
		shorttime:function(){
			return this.htTime("short");
		},
		longtime:function(){
			return this.htTime("long");
		},
		htTime:function(fmt){
			var d = new Date();
			var hours = d.getHours();
			var minutes = d.getMinutes();
			var seconds = d.getSeconds();
			var ampm = "AM";
			if(hours>=12){
				hours -=12;
				ampm = "PM";
			}
			if(minutes<10) minutes="0"+minutes;
			if(seconds<10) seconds="0"+seconds;

			if(fmt=="long"){
				return hours+":"+minutes+":"+seconds+" "+ampm;
			}
			else if(fmt=="short"){
				return hours+":"+minutes+" "+ampm;
			}
		},
		selectedTool:"browse",
		selectedtext:"",
		selectedText:function(){
			extractQueue();//更新
			return this.selectedtext;
		},
		tool:function(){
			return this.selectedTool+" tool";
		},
		trunc:function(v){
			return (v>=0)?Math.floor(v):-Math.floor(-v);
		},
		value:function(v){

		},
		_windows:[],
		windows:function(){
			var ret = stackName;
			for(var i=0; i<_windows.length; i++){
				ret += "\n" + _windows[i].name;
			}
			return ret;
		},
		min:function(){
			var a = arguments;
			if(arguments.length==1){
				a = (arguments[0]+"").split(",");
			}
			var min=a[0];
			for(var i=1; i<a.length; i++){
				if(a[i]<min) min=a[i];
			}
			return min;
		},
		max:function(){
			var a = arguments;
			if(arguments.length==1){
				a = (arguments[0]+"").split(",");
			}
			var max=a[0];
			for(var i=1; i<a.length; i++){
				if(a[i]>max) max=a[i];
			}
			return max;
		},
};

var mouse = {
		button:"up",
		_click:false,
		click:function(){
			extractQueue();//更新
			var ret = this._click;
			this._click = false;
			return ret;
		},
		rightClick:false,
		_mouseH:0,
		_mouseV:0,
		mouseH:function(){
			extractQueue();//更新
			return +this._mouseH;
		},
		mouseV:function(){
			extractQueue();//更新
			return +this._mouseV;
		},
		mouseLoc:function(){
			extractQueue();//更新
			return point(+this._mouseH,+this._mouseV);
		},
		_clickH:0,
		_clickV:0,
		clickH:function(){
			extractQueue();//更新
			return +this._clickH;
		},
		clickV:function(){
			extractQueue();//更新
			return +this._clickV;
		},
		clickLoc:function(){
			extractQueue();//更新
			return point(+this._clickH,+this._clickV);
		},
		clickChunk:function(){
			extractQueue();//更新
			return this.clickchunk;
		},
		clickLine:function(){
			extractQueue();//更新
			return this.clickline;
		},
		clickText:function(){
			extractQueue();//更新
			return this.clicktext;
		},
		clickchunk:"",
		clickline:"",
		clicktext:"",
		clickobj:"",
		isDoubleClick:false,
		lastClickTime:0,
		setLoc:function(e){
			this.mouseH = e.pageX;
			this.mouseV = e.pageY;
		},
};

function clickline(){
	return mouse.clickline;
}
//--
//キー入力
var keys = new Array(); //表のほうも持っている
var keycode_shift=16;
var keycode_meta=91;//cmd(L)
var keycode_rightmeta=93;//cmd(R)
var keycode_alt=18;//opt
var keycode_ctrl=17;//ctrl

keysInit();
function keysInit(){
	for(var i=0;i<128;i++){
		keys[i]=false;
	}
}

//--
//Util

function makePoint(x,y){
	return {x:x, y:y};
}
function point(_x,_y){
	if((_x+"").indexOf(",")!=-1){
		_y = parseInt((_x+"").substring((_x+"").indexOf(",")+1));
		_x = parseInt(_x);
	}
	return {
		x:_x,
		y:_y,
		within:function(r){
			//postMessage(_x+","+_y+" within "+r.left+","+r.top+","+r.width+","+r.height);
			return _x>=r.left && _y>=r.top && _x<r.left+r.width && _y<r.top+r.height;
		},
		toString:function(){
			return this.x+","+this.y;
		}
	};
}

function rect(_x,_y,_w,_h){
	if((_x+"").indexOf(",")!=-1){
		var a = _x.split(",");
		_x = parseInt(a[0]);
		_y = parseInt(a[1]);
		_w = parseInt(a[2]);
		_h = parseInt(a[3]);
	}
	return {
		left:_x,
		top:_y,
		width:_w,
		height:_h,
		toString:function(){
			return this.left+","+this.top+","+(this.left+this.width)+","+(this.top+this.height);
		}
	};
}

//--
//オブジェクト
function target(){
	return vmTargetObj;
}

function thisCard(){
	return currentCardObj;
}

function nextCard(){
	var i;
	for(i=0;i<cardData.length; i++){
		if(currentCardObj.id == cardData[i].id) break;
	}
	return cardData[(i+1)%(cardData.length)];
}

function prevCard(){
	var i;
	for(i=0;i<cardData.length; i++){
		if(currentCardObj.id == cardData[i].id) break;
	}
	return cardData[(i+cardData.length-1)%(cardData.length)];
}

function thisBg(){
	return getBgData(currentCardObj.background);
}

function thisStack(){
	return stackData;
}

function stack(stackName){
	return {name:stackName, type:"stack"};
}

function getCardNum(cardId){
	for(var i=0; i<cardData.length; i++){
		if(cardData[i].id == cardId){
			return i;
		}
	}
	return null;
}

function getBgNum(bgId){
	for(var i=0; i<bgData.length; i++){
		if(bgData[i].id == bgId){
			return i;
		}
	}
	return null;
}

function getBgData(bgId){
	for(var i=0; i<bgData.length; i++){
		if(bgData[i].id == bgId){
			return bgData[i];
		}
	}
	return null;
}

var menuBarData = {
		_visible:true,
		set visible(x){
			postMessage("menuBarData");
			this._visible = x;
			postMessage({cmd:"menuBarVisible", prop:x});
		},
		get visible(){
			return this._visible;
		},
};
function menubar(){
	return menuBarData;
}

var titlebarData = {

};
function titlebar(){
	return titlebarData;
}

var browseMenus = {};
var browseMenuItems = {};
function menu(v){
	if((v+"").match(/^[0-9]+$/)){
		if(browseMenus[v]){
			return {
				text: browseMenus[v].name,
				numberOfMenuitems: function(){
					return browseMenuItems[browseMenus[v].name.toLowerCase()].length;
				}
			};
		}
	}
	else{
		for(var i=0; i<browseMenus.length; i++){
			if(browseMenus[i].name.toLowerCase()==v.toLowerCase()){
				return {
					text: (i+1)+"",
					numberOfMenuitems: function(){
						return browseMenuItems[browseMenus[i].name.toLowerCase()].length;
					}
				};
			}
		}
	}
	return {text:"", numberOfMenuitems: function(){return 0;}};
}

var messageData = {
		set text(x){
			this._text = x+"";
			postMessage({cmd:"changeSysObj", obj:operaCloneObj(this), prop:"text"});
		},
		get text(){ return this._text; },
		type:"message",
		_text:"",
};
function message(){
	return messageData;
}

var cardWindow = function(){
	return {
		set loc(x){
		},
		get loc(){
			return point(stackData.width/2,stackData.height/2);
		}
	};
};

var cardPicture = function(){
	return {
		set visible(x){
			return currentCardObj.showPict = x;
		},
		get visible(){
			return currentCardObj.showPict;
		}
	};
};

var toolPltData = {
};
function palette(name){ //windowではfirefoxで衝突する
	if(name=='tool'){
		return toolPltData;
	}
	for(var i in system._windows){
		if( system._windows[i].name.toLowerCase() == (name+"").toLowerCase() ){
			return {
				set visible(x){
					if(x!=system._windows[i].visible){
						postMessage({cmd:"paletteVisible", obj:name, prop:x});
						system._windows[i].visible = x;
					}
				},
				get visible(){
					if(!system._windows[i].visible)return true;
					return system._windows[i].visible;
				},
				set loc(x){
					if(x!=system._windows[i].loc){
						postMessage({cmd:"paletteLoc", obj:name, prop:x});
						system._windows[i].loc = x;
					}
				},
				get loc(){
					if(!system._windows[i].loc)return {x:200,y:200};//てきとう
					return system._windows[i].loc;
				},
			};
		}
	}
	return {};
}

function getBgData(bgid){
	for(var i in bgData){
		if(bgid==bgData[i].id){
			return bgData[i];
		}
	}
	return null;
}

function card(name){
	if(typeof name=="number"){
		return cardData[name-1];
	}
	var cd = findCard(name,cardData);
	if(!cd) return cardData[name-1];
	return cd;
}
function cardById(id){
	for(var i=0; i<cardData.length; i++){
		if(cardData[i].id==id){
			return cardData[i];
		}
	}
	return undefined;
}

function bg(name){
	if(typeof name=="number"){
		return bgData[name-1];
	}
	var cd = findCard(name,bgData);
	if(!cd) return bgData[name-1];
	return cd;
}
function bgById(id){
	for(var i=0; i<bgData.length; i++){
		if(bgData[i].id==id){
			return bgData[i];
		}
	}
	return undefined;
}

function findCard(name,dataAry){
	if(typeof(name)=='number'){
		return dataAry[name];
	}
	else if(name!=""){
		for(var i=0; i<dataAry.length; i++){
			if(dataAry[i].name.toLowerCase()==(name+"").toLowerCase()){
				return dataAry[i];
			}
		}
	}
	return undefined;
}

function cdBtn(name){
	return findParts(name,currentCardObj.parts,"button");
}
function cdBtnById(id){
	return findPartsById(id,currentCardObj.parts,"button");
}
function bgBtn(name){
	return findParts(name,getBgData(currentCardObj.background).parts,"button");
}
function bgBtnById(id){
	return findPartsById(id,getBgData(currentCardObj.background).parts,"button");
}

function cdFld(name){
	return findParts(name,currentCardObj.parts,"field");
}
function cdFldById(id){
	return findPartsById(id,currentCardObj.parts,"field");
}
function bgFld(name){
	return findParts(name,getBgData(currentCardObj.background).parts,"field");
}
function bgFldById(id){
	return findPartsById(id,getBgData(currentCardObj.background).parts,"field");
}

function findParts(name,dataAry,type){
	if(typeof(name)!='number'){
		var len=dataAry.length;
		for(var i=0; i<len; i++){
			if((dataAry[i].name+"").toLowerCase()==(name+"").toLowerCase() && dataAry[i].type==type){
				return dataAry[i];
			}
		}
	}
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
	//これをやるとthere is a cd btn xがいなくてもtrueになってしまう
	//var dummyObj = {type:type,text:""};
	//return dummyObj;
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

function getPartNum(partid,dataAry,type){
	var num=1;
	var len=dataAry.length;
	for(var i=0; i<len; i++){
		if(dataAry[i].type==type && dataAry[i].id == partid){
			return num;
		}
		if(dataAry[i].type==type){
			num++;
		}
	}
	return undefined;
}
//--
//プロパティ
function hcStackDefine(obj){
	if(obj.numberOfCards)return;

	obj.numberOfCards = function(){return cardData.length;};
	obj.numberOfBgs = function(){return bgData.length;};

	obj.showNavigator = obj.showNavigator;
	Object.defineProperty( obj, "showNavigator", (function() {
		var showNavigator = (obj.showNavigator!=null)?obj.showNavigator:true;
		return {
			set: function(x){
				showNavigator = x;
				postMessage({cmd:"changeObj", obj:JSON.stringify(obj), prop:"showNavigator"});
			},
			get: function() {
				return showNavigator;
			}
		};
	} )() );
}

function hcCardbaseDefine(obj){
	if(obj.btnById)return;

	var pre = "bg";
	if(obj.type=="card") pre ="cd";

	obj[pre+"Btn"] = function(id){return this.btn(id);};
	obj[pre+"Fld"] = function(id){return this.fld(id);};
	obj.btn = function(name){return findParts(name,obj.parts,"button");};
	obj.fld = function(name){return findParts(name,obj.parts,"field");};
	obj[pre+"BtnById"] = function(id){return this.btnById(id);};
	obj[pre+"FldById"] = function(id){return this.fldById(id);};
	obj.btnById = function(id){return findPartsById(id,obj.parts,"button");};
	obj.fldById = function(id){return findPartsById(id,obj.parts,"field");};
	obj.numberOfBtns = function(){return numberOfParts(obj,"button");};
	obj.numberOfFlds = function(){return numberOfParts(obj,"field");};
	if(pre=="bg"){
		obj.prevCard = function(){
			var i;
			for(i=0;i<cardData.length; i++){
				if(currentCardObj.id == cardData[i].id) break;
			}
			for(;i>=0; i--){
				if(obj.id == cardData[i].background){
					return cardData[i];
				}
			}
			for(i=cardData.length-1;i>=0; i--){
				if(obj.id == cardData[i].background){
					return cardData[i];
				}
			}
		};
		obj.nextCard = function(){
			var i;
			for(i=0;i<cardData.length; i++){
				if(currentCardObj.id == cardData[i].id) break;
			}
			for(;i<cardData.length; i++){
				if(obj.id == cardData[i].background){
					return cardData[i];
				}
			}
			for(i=0;i<cardData.length; i++){
				if(obj.id == cardData[i].background){
					return cardData[i];
				}
			}
		};
	}

	Object.defineProperty( obj, "number", (function() {
		return {
			set: function(){},
			get: function() { 
				var dataAry = obj.type=="card"?cardData:bgData;
				var len=dataAry.length;
				for(var i=0; i<len; i++){
					if(dataAry[i].id == obj.id){
						return i+1;
					}
				}
			}
		};
	} )() );

	Object.defineProperty( obj, "rect", (function() {
		return {
			set: function(){},
			get: function() { 
				return rect(0,0,stackData.width,stackData.height);
			}
		};
	} )() );

	Object.defineProperty( obj, "shortname", (function() {
		return {
			set: function(){},
			get: function() { 
				return obj.name;
			}
		};
	} )() );

	if(obj.showPict==null) obj.showPict = true;
	Object.defineProperty( obj, "showPict", (function() {
		var showPict = obj.showPict;
		return {
			set: function(x){
				showPict = (x==true||x=="true");;
				postMessage({cmd:"changeObj", obj:JSON.stringify(obj), prop:"showPict"});
			},
			get: function() { 
				return showPict;
			}
		};
	} )() );
}

function numberOfParts(obj,type){
	var num=0;
	var parts=obj.parts;
	var len=parts.length;
	for(var i=0; i<len; i++){
		if(parts[i].type==type){
			num++;
		}
	}
	return num;
}

function markedCard(v){
	var num=0;
	for(var i=0; i<cardData.length; i++){
		if(cardData[i].marked){
			num++;
			if(num==v){
				return cardData[i];
			}
		}
	}
}

function hcPartDefine(obj){
	if(obj.set!=undefined)return;
	if(obj.text==undefined) obj.text=""; //textをString型オブジェクトにしておく

	Object.defineProperty( obj, "set", (function() { //チャンクへの代入用
		return {
			get: function() { 
				return function(x,y){
					return new chunkObject(this,x,y);
				};
			}
		};
	} )() );
	Object.defineProperty( obj, "set2", (function() { //チャンクへの代入用
		return {
			get: function() { 
				return function(x,y,x2,y2){
					return new chunkObject2(this,x,y,x2,y2);
				};
			}
		};
	} )() );
	Object.defineProperty( obj, "name", (function() {
		var name=obj.name;
		return {
			set: function( x ) {
				name = x;
				if(obj.parent=="card" && currentCardObj.id == obj.parentId || obj.parent=="background" && currentCardObj.background == obj.parentId){
					postMessage({cmd:"changeObj", obj:JSON.stringify(obj), prop:"name"});
				}
				changedStack=true;
			},
			get: function() { return name; }
		};
	} )() );
	Object.defineProperty( obj, "shortname", (function() {
		return {
			get: function() { return obj.name; }
		};
	} )() );
	Object.defineProperty( obj, "visible", (function() {
		var visible=obj.visible;
		return {
			set: function( x ) {
				visible = (x==true||x=="true");;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "visible");
				}
			},
			get: function() { return visible; }
		};
	} )() );
	Object.defineProperty( obj, "left", (function() {
		var left=obj.left;
		return {
			set: function( x ) {
				left = +x;
				if(this.lock!=true && (this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId)){
					changeObj(this, "left");
				}
				changedStack=true;
			},
			get: function() { return +left|0; }
		};
	} )() );
	Object.defineProperty( obj, "right", (function() {
		return {
			set: function( x ) {
				obj.left = x - obj.width;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "left");
				}
				changedStack=true;
			},
			get: function() { return (this.left)+(this.width)|0; }
		};
	} )() );
	Object.defineProperty( obj, "top", (function() {
		var top=obj.top;
		return {
			set: function( x ) {
				top = +x;
				if(this.lock!=true && (this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId)){
					changeObj(this, "top");
				}
				changedStack=true;
			},
			get: function() { return +top|0; }
		};
	} )() );
	Object.defineProperty( obj, "bottom", (function() {
		return {
			set: function( x ) {
				obj.top = x - obj.height;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "top");
				}
				changedStack=true;
			},
			get: function() { return (this.top)+(this.height)|0; }
		};
	} )() );
	var topLeftA = new Array("topleft","topLeft");
	for(var i=0; i<topLeftA.length; i++){
		Object.defineProperty( obj, topLeftA[i], (function() {
			//var topLeft=obj.topLeft;
			return {
				set: function( i,j ) {
					if(!j){
						if(i.x){j=i.y;i=i.x;}
						else if(i.split(",").length==2){
							j=+i.split(",")[1];
							i=+i.split(",")[0];
						}
					}
					this.lock=true;
					this.left = +i;
					this.top = +j;
					delete this.lock;
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "topLeft");
					}
					changedStack=true;
				},
				get: function() { return point(obj.left, obj.top); }
			};
		} )() );
	}
	Object.defineProperty( obj, "bottomRight", (function() {
		//var bottomRight=obj.bottomRight;
		return {
			set: function( i,j ) {
				if(!j){
					if(i.x){j=i.y;i=i.x;}
					else if(i.split(",").length==2){
						j=+i.split(",")[1];
						i=+i.split(",")[0];
					}
				}
				this.lock=true;
				this.left = i-width;
				this.top = j-height;
				delete this.lock;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "topleft");
				}
				changedStack=true;
			},
			get: function() { return point(left+width, top+height); }
		};
	} )() );
	Object.defineProperty( obj, "loc", (function() {
		//var loc=obj.loc;
		return {
			set: function( i,j ) {
				if(!j){
					if(i.x){j=i.y;i=i.x;}
					else if(i.split(",").length==2){
						j=+i.split(",")[1];
						i=+i.split(",")[0];
					}
				}
				this.lock=true;
				this.left = i-this.width/2|0;
				this.top = j-this.height/2|0;
				delete this.lock;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "topLeft");
	    		}
	    		changedStack=true;
			},
			get: function() { return point(parseInt((this.left)+this.width/2), parseInt((this.top)+this.height/2)); }
		};
	} )() );
	Object.defineProperty( obj, "rect", (function() {
		//var rect=obj.rect;
		return {
			set: function( i ) {
				this.lock=true;
				if(!i.left){
					if(i.split(",").length==4){
						obj.left = +i.split(",")[0];
						obj.top = +i.split(",")[1];
						obj.width = +i.split(",")[2];
						obj.height = +i.split(",")[3];
					}
				}
				else{
					obj.left = +i.left;
					obj.top = +i.top;
					obj.width = +i.width;
					obj.height = +i.height;
				}
				delete this.lock;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
	    			changeObj(this, "rect");
	    		}
	    		changedStack=true;
			},
			get: function() { return rect(+obj.left, +obj.top, +obj.width, +obj.height); }
		};
	} )() );
	Object.defineProperty( obj, "width", (function() {
		var width=obj.width;
		return {
			set: function( x ) {
				width = +x;
				if(this.lock!=true && (this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId)){
					changeObj(this, "width");
				}
				changedStack=true;
			},
			get: function() { return +width; }
		};
	} )() );
	Object.defineProperty( obj, "height", (function() {
		var height=obj.height;
		return {
			set: function( x ) {
				height = +x;
				if(this.lock!=true && (this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId)){
					changeObj(this, "height");
				}
				changedStack=true;
			},
			get: function() { return +height; }
		};
	} )() );
	Object.defineProperty( obj, "icon", (function() {
		var icon=obj.icon;
		return {
			set: function( x ) {
				if(!(x+"").match(/^[-0-9]*$/)){
					var rdata = rsrcData1["icon"];
					var lx = x.toLowerCase();
					for(var rs in rdata){
						if((rdata[rs].name).toLowerCase()==lx){
							x = rs;
						}
					}
				}
				icon = x;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "icon");
				}
				changedStack=true;
			},
			get: function() { return +icon; }
		};
	} )() );
	Object.defineProperty( obj, "visible", (function() {
		var visible=obj.visible;
		return {
			set: function( x ) {
				visible = (x==true||x=="true");;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "visible");
				}
				changedStack=true;
			},
			get: function() { return visible; }
		};
	} )() );
	Object.defineProperty( obj, "style", (function() {
		var style=obj.style;
		return {
			set: function( x ) {
				style = (x+"").replace(/[^A-Za-z]/g,"");
				if(this.type=="button"){
					switch(style.toLowerCase()){
					case "transparent":
					case "opaque":
					case "rectangle":
					case "roundrect":
					case "shadow":
					case "standard":
					case "default":
					case "oval":
					case "radio":
					case "checkbox":
					case "popup":
						break;
					default:
						style = "roundrect";
					}
				}else{
					switch(style.toLowerCase()){
					case "transparent":
					case "opaque":
					case "rectangle":
					case "shadow":
					case "scrolling":
						break;
					default:
						style = "rect";
					}
				}
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "style");
				}
			},
			get: function() { return style; }
		};
	} )() );
	Object.defineProperty( obj, "text", (function() {
		var text=obj.text;
		return {
			set: function( x ) {
				if(this.parent!="card" && this.type=="field" && !this.sharedText){
					if(currentCardObj.background == this.parentId){
						var bgpdata = currentCardObj.bgparts[this.id];
						if(!bgpdata){
							bgpdata = {};
							currentCardObj.bgparts[this.id] = bgpdata;
						}
						bgpdata.text = x;
						if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
							changeBgObj(bgpdata, this.id, "text");
						}
					}
				}
				else{
					text = x;
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "text");
					}
				}
				changedStack = true;
			},
			get: function() { 
				if(this.parent!="card" && !this.sharedText){
					if(currentCardObj.background == this.parentId){
						var bgpdata = currentCardObj.bgparts[this.id];
						if(bgpdata){
							return (bgpdata.text+"").replace(/<br>/g,"\n");
						}
					}else{
						return (text+"").replace(/<br>/g,"\n"); //とりあえず
					}
				}
				return (text+"").replace(/<br>/g,"\n");
			}
		};
	} )() );
	if(!obj.vertically) obj.vertically=false;
	Object.defineProperty( obj, "vertically", (function() {
		var vertically=obj.vertically;
		return {
			set: function( x ) {
				vertically = (x==true||x=="true");;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "vertically");
				}
			},
			get: function() { return vertically; }
		};
	} )() );
	Object.defineProperty( obj, "textStyle", (function() {
		var textStyle=obj.textStyle;
		return {
			set: function( x ) {
				textStyle = +x;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "textStyle");
				}
			},
			get: function() { return textStyle; }
		};
	} )() );
	Object.defineProperty( obj, "textSize", (function() {
		var textSize=obj.textSize;
		return {
			set: function( x ) {
				textSize = +x;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "textSize");
				}
			},
			get: function() { return textSize; }
		};
	} )() );
	Object.defineProperty( obj, "number", (function() {
		return {
			get: function() { 
				var parent;
				if(obj.parent=="card") parent = cardById(obj.parentId);
				else parent = bgById(obj.parentId);
				if(!parent) return undefined;
				return getPartNum(obj.id, parent.parts, obj.type);
			}
		};
	} )() );
	//button
	if(obj.type=="button"){
		Object.defineProperty( obj, "hilite", (function() {
			var hilite=obj.hilite;
			return {
				set: function( x ) {
					if(this.parent!="card" && !this.sharedHilite){
						if(currentCardObj.background == this.parentId){
							var bgpdata = currentCardObj.bgparts[this.id];
							if(!bgpdata){
								bgpdata = {};
								currentCardObj.bgparts[this.id] = bgpdata;
							}
							bgpdata.hilite = (x==true||x=="true");;
							if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
								changeBgObj(bgpdata, this.id, "hilite");
							}
						}
					}
					else{
						hilite = (x==true||x=="true");;
						if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
							changeObj(this, "hilite");
						}
					}

					if(x==true && this.family>0){
						if(this.parent!="card" && !this.sharedHilite){
						}
						else{
							var parts = (this.parent=="card")?cardById(this.parentId).parts:bgById(this.parentId).parts;
							for(var i=0; i<parts.length; i++){
								if(parts[i].type=="button" && parts[i].family==this.family){
									if(parts[i].hilite==true && parts[i].id!=this.id){
										parts[i].hilite = false;
									}
								}
							}
						}
					}
				},
				get: function() {
					if(this.parent!="card" && !this.sharedHilite){
						if(currentCardObj.background == this.parentId){
							var bgpdata = currentCardObj.bgparts[this.id];
							if(bgpdata){
								return bgpdata.hilite;
							}
						}else{
							return hilite; //とりあえず
						}
					}
					return hilite;
				}
			};
		} )() );
		Object.defineProperty( obj, "autoHilite", (function() {
			var autoHilite=obj.autoHilite;
			return {
				set: function( x ) {
					autoHilite = (x==true||x=="true");;
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "autoHilite");
					}
				},
				get: function() { return autoHilite; }
			};
		} )() );
		Object.defineProperty( obj, "enabled", (function() {
			var enabled=obj.enabled;
			return {
				set: function( x ) {
					enabled = (x==true||x=="true");;
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "enabled");
					}
				},
				get: function() { return enabled; }
			};
		} )() );
		Object.defineProperty( obj, "family", (function() {
			var family=obj.family;
			return {
				set: function( x ) {
					family = x;
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "family");
					}
				},
				get: function() { return family; }
			};
		} )() );
		if(!obj.iconScaling) obj.iconScaling=false;
		Object.defineProperty( obj, "iconScaling", (function() {
			var iconScaling=obj.iconScaling;
			return {
				set: function( x ) {
					iconScaling = (x==true||x=="true");;

					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "iconScaling");
					}
				},
				get: function() { 
					return iconScaling; }
			};
		} )() );
		Object.defineProperty( obj, "titleWidth", (function() {
			var titleWidth=obj.titleWidth;
			return {
				set: function( x ) {
					titleWidth = +x;
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "titleWidth");
					}
				},
				get: function() { return titleWidth; }
			};
		} )() );
		Object.defineProperty( obj, "showName", (function() {
			var showName=obj.showName;
			return {
				set: function( x ) {
					showName = (x==true||x=="true");
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "showName");
					}
				},
				get: function() { return showName; }
			};
		} )() );
	}
	if(obj.opacity==null){
		if(obj.type=="button") obj.opacity=1.0;
		else  obj.opacity="";
	}
	Object.defineProperty( obj, "opacity", (function() {
		var opacity=obj.opacity;
		return {
			set: function( x ) {
				opacity = +x;

				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "opacity");
				}
			},
			get: function() { 
				return opacity; }
		};
	} )() );
	Object.defineProperty( obj, "selectedLine", (function() {
		var selectedline=obj.selectedLine;
		return {
			set: function( x ) {
				if(x.indexOf("force")!=-1){
					selectedline = x.substring(5);
					return;
				}
				if(obj.type!="field"&&obj.style!="popup"){
					return;
				}
				selectedline = x;
				if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
					changeObj(this, "selectedLine");
				}
			},
			get: function() { 
				extractQueue();//更新
				return "line "+selectedline+" of "+this.parent+" "+this.type+" id "+this.id;
			}
		};
	} )() );
	Object.defineProperty( obj, "selectedText", (function() {
		return {
			get: function() {
				extractQueue();//更新
				return this.text.replace(/<br>/g,"\n").split("\n")[word(this.selectedLine,2)-1];
			}
		};
	} )() );
	//field
	if(obj.type=="field"){
		Object.defineProperty( obj, "lockText", (function() {
			var lockText=obj.lockText;
			return {
				set: function( x ) {
					lockText = (x==true||x=="true");;
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "lockText");
					}
				},
				get: function() { return lockText; }
			};
		} )() );
		Object.defineProperty( obj, "scroll", (function() {
			var scroll=0;
			return {
				set: function( x ) {
					scroll = +x;
					if(this.parent=="card" && currentCardObj.id == this.parentId || this.parent=="background" && currentCardObj.background == this.parentId){
						changeObj(this, "scroll");
					}
				},
				get: function() { return scroll; }
			};
		} )() );
	}
};

var changeObjCount = 0;
function changeObj(o,p){
	postMessage({cmd:"changeObj", obj:JSON.stringify(o), prop:p});
	changeObjCount++;
	extractQueue();
	if(changeObjCount>50){
		wait(1);
	}
}
function changeBgObj(o,id,p){
	postMessage({cmd:"changeBgObj", obj:JSON.stringify(o), id:id, prop:p});
}
/**/
function character(x,start,end){
	return char(x,start,end);
}
function char(x,start,end){
	if(end==undefined){
		var txt = (x+"").charAt(start-1);
		return (txt!=undefined)?txt:"";
	}
	txt = (x+"").substring(start-1,end);
	return txt?txt:"";
}

function line(x,start,end){
	if(!end) end = start;
	if(!x)return "";
	linetxt = (x+"").split("\n").slice(start-1,end);
	return linetxt?linetxt.join("\n"):"";
}

function item(x,start,end){
	if(!end) end = start;
	if(!x)return "";
	linetxt = (x+"").split(system.itemDelimiter).slice(start-1,end);
	return linetxt?linetxt.join(system.itemDelimiter):"";
}

function word(x,start,end){
	if(!end) end = start;
	if(!x)return "";
	linetxt = (x+"").split(" ").slice(start-1,end);
	return linetxt?linetxt.join(" "):"";
}


function setcharacter(tgt,v,start,end){
	return setchar(tgt,v,start,end);
}
function setchar(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt:"")+"";
	return x.substring(0,start-1)+v+x.substring(end);
}

function setline(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?(tgt+"").replace(/<br>/g,"\n"):"");
	var d = "\n";

	var sp = x.split(d);
	while(start>sp.length){
		x += d;
		sp = x.split(d);
	}

	var hd = "";
	if(start>=2) hd = sp.slice(0,start-1).join(d)+d;

	var ft = "";
	if(sp.length>end) ft = d+sp.slice(end).join(d);

	return hd+v+ft;
}

function setitem(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt+"":"");
	var d = system.itemDelimiter;

	var sp = x.split(d);
	while(start>sp.length){
		x += d;
		sp = x.split(d);
	}

	var hd = "";
	if(start>=2) hd = sp.slice(0,start-1).join(d)+d;

	var ft = "";
	if(sp.length>end) ft = d+sp.slice(end).join(d);

	return hd+v+ft;
}

function setword(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt+"":"");
	var sp = x.split(" ");

	var hd = "";
	if(start>=2) hd = sp.slice(0,start-1).join(" ")+" ";

	var ft = "";
	if(sp.length>end) ft = " "+sp.slice(end).join(" ");

	return hd+v+ft;
}

function addcharacter(tgt,v,start,end){
	return addchar(tgt,v,start,end);
}

function addchar(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt+"":"");

	return x.substring(0,start-1)+((char(x,start,end)|0)+(v|0))+x.substring(end);
}

function addline(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt:"")+"";
	while(start>x.split("\n").length){
		x += "\n";
	}
	var ret = "";
	if(start>1){
		ret = x.split("\n").slice(0,start-1).join("\n")+"\n";
	}
	ret += ((line(x,start,end)|0)+(v|0));
	if(x.split("\n").length>end){
		ret += "\n"+x.split("\n").slice(end).join("\n");
	}
	return ret;
}

function additem(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt:"")+"";
	while(start>x.split(",").length){
		x += ",";
	}
	var ret = "";
	if(start>1){
		ret = x.split(",").slice(0,start-1).join(",")+",";
	}
	ret += ((item(x,start,end)|0)+(v|0));
	if(x.split(",").length>end){
		ret += ","+x.split(",").slice(end).join(",");
	}
	return ret;
}

function addword(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt:"")+"";
	var ret = "";
	if(start>1){
		ret = x.split(" ").slice(0,start-1).join(" ")+" ";
	}
	ret += ((word(x,start,end)|0)+(v|0));
	if(x.split(" ").length>end){
		ret += " "+x.split(" ").slice(end).join(" ");
	}
	return ret;
}

function subtractchar(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt:"")+"";
	return x.substring(0,start-1)+((char(x,start,end)|0)+(v|0))-x.substring(end);
}

function subtractline(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt:"")+"";
	while(start>x.split("\n").length){
		x += "\n";
	}
	var ret = "";
	if(start>1){
		ret = x.split("\n").slice(0,start-1).join("\n")+"\n";
	}
	ret += ((line(x,start,end)|0)-(v|0));
	if(x.split("\n").length>end){
		ret += "\n"+x.split("\n").slice(end).join("\n");
	}
	return ret;
}

function subtractitem(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt:"")+"";
	while(start>x.split(",").length){
		x += ",";
	}
	var ret = "";
	if(start>1){
		ret = x.split(",").slice(0,start-1).join(",")+",";
	}
	ret += ((item(x,start,end)|0)-(v|0));
	if(x.split(",").length>end){
		ret += ","+x.split(",").slice(end).join(",");
	}
	return ret;
}

function subtractword(tgt,v,start,end){
	if(!end) end = start;
	var x = (tgt?tgt:"")+"";
	var ret = "";
	if(start>1){
		ret = x.split(" ").slice(0,start-1).join(" ")+" ";
	}
	ret += ((word(x,start,end)|0)-(v|0));
	if(x.split(" ").length>end){
		ret += " "+x.split(" ").slice(end).join(" ");
	}
	return ret;
}

