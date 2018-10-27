"use strict";

function doScript(str, obj){
	//postMessage("doScript:"+str);

	if(!obj) obj = me;

	var strAry = str.split(" ");
	var args = new Array();
	if(strAry.length>1){
		str = strAry[0].toLowerCase();
		for(var i=1;i<strAry.length;i++){
			args[i-1] = strAry[i].toLowerCase();
		}
	}

	switch(str){
	case "go":
		if(args.length>=1){
			if(args[0]=="cd"||args[0]=="card"){
				var v = args[1];
				if(v.match(/^".*"$/)) v = v.substring(1,v.length-2);
				go(card(v));
			}
			return;
		}
	case "show":
		if(args.length>=1){
			if(args[0]=="cd"||args[0]=="card"){
				doShow(args,1,thisCard());
			}
			else if(args[0]=="bg"||args[0]=="bkgnd"||args[0]=="background"){
				doShow(args,1,thisBg());
			}
			else if(args[0]=="menubar"){
				menubar().visible = true;
			}
			else{
				if(args[0]=="btn"||args[0]=="button") var baseobj = thisCard();
				else baseobj = thisBg();
				doShow(args,0,baseobj);
			}
			return;
		}
		return;
	case "hide":
		if(args.length>=1){
			if(args[0]=="cd"||args[0]=="card"){
				doShow(args,1,thisCard());
			}
			else if(args[0]=="bg"||args[0]=="bkgnd"||args[0]=="background"){
				doShow(args,1,thisBg());
			} 
			else if(args[0]=="menubar"){
				menubar().visible = false;
			}
			else{
				if(args[0]=="btn"||args[0]=="button") var baseobj = thisCard();
				else baseobj = thisBg();
				doShow(args,0,baseobj);
			}
			return;
		}
		return;
	case "answer":
		if(args.length>=1){
			answer(args[0]);
			return;
		}
	}

	sendCommand(obj, str.toLowerCase());	
}

function doShow(args,i,baseobj){
	if(args[i]=="btn"||args[i]=="button"){
		show(baseobj.btn(args[i+1]));
	}
	else if(args[i]=="fld"||args[i]=="field"){
		show(baseobj.fld(args[i+1]));
	}
}
