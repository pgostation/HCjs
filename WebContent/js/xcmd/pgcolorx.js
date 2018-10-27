"use strict";

var PgColorXSizes = [];

function pgcolorx(){
	var getSize = function(v){
		var sp = (v+"").split(",");
		if(sp.length==2) return {x:sp[0]|0, y:sp[1]|0,};
		if(sp.length==4) return {x:sp[2]-sp[0]|0, y:sp[3]-sp[1]|0,};
	};
	var getRect = function(v){
		var sp = (v+"").split(",");
		if(sp.length==2) return {x:sp[0]|0, y:sp[1]|0,};
		if(sp.length==4) return {x:sp[0]|0, y:sp[1]|0, width:sp[2]-sp[0]|0, height:sp[3]-sp[1]|0,};
	};
	var rgb2color = function(r,g,b){
		var rr = (r<10)?"0":"";
		var gg = (g<10)?"0":"";
		var bb = (b<10)?"0":"";
		return "#"+rr+r.toString(16)+gg+g.toString(16)+bb+b.toString(16);
	};
	var getColor = function(v){
		v = v+"";
		if(v.charAt(0)=="#"){
			return v;
		}
		var sp = v.split(",");
		if(sp.length==3) return rgb2color(sp[0]/256|0, sp[1]/256|0, sp[2]/256|0);
		switch(v.toLowerCase()){
		case "white":return "#ffffff";
		case "black":return "#000000";
		case "red":return "#ff0000";
		case "green":return "#00ff00";
		case "blue":return "#0000ff";
		case "yellow":return "#ffff00";
		case "orange":return "#ffff00";
		case "gray":return "#808080";
		case "pink":return "#ffffff";
		}
		return "#000000";
	};
	var getPort = function(v){
		v = (v+"").toLowerCase();
		switch(v){
		case "cd":case "card":case "direct":case "dir":
			return -1;
		case "cd buf":
			return -2;
		case "pri":
			return -3;
		case "cd alpha":
			return -4;
		case "":
			return 0;
		}
		return v|0;
	};
	var newPgColorXBuf = function(p,v,pict){
		postMessage({cmd:"newPgColorXBuf", port:p, size:v, pict:pict});
		PgColorXSizes[p] = v;
	};
	var CopyBits = function(port,p){
		var srcport = getPort(p[1]);
		var dstport = getPort(p[2]);
		
		var srcRect = null;
		if(p.length>=4 && p[3].length>0){
			srcRect = getRect(p[3]);
		}
		else{
			//srcRect = new Rectangle(0,0,PgColorX[srcport].bi.getWidth(),PgColorX[srcport].bi.getHeight());
		}

		var dstRect = srcRect;
		if(p.length>=5 && p[4].length>0){
			dstRect = getRect(p[4]);
		}
		
		var mode = "copy";
		if(p.length>=6 && p[5].length>0){
			mode = p[5];
		}
		
		/*BufferedImage srcbi=null;
		if(srcport>=0){
			srcbi = PgColorX[srcport].bi;
		}
		else if(srcport==-1){
			VEffect.setOldOff();
			srcbi = VEffect.oldoff;
		}*/
		
		/*Graphics2D dstGraphics=null;
		if(dstport>=0){
			dstGraphics = PgColorX[dstport].bi.createGraphics();
			PgColorX[dstport].colorKey = null;
		}
		else if(dstport==-1){
			dstGraphics = (Graphics2D) PCARD.pc.mainPane.getGraphics();
		}*/
		
		/*if(mode.toLowerCase()=="transparent" && PgColorX[srcport].colorKey==null){
			PgColorX[srcport].colorKey = Color.WHITE;
			PgColorX[srcport].setTransparent();
		}*/
		
		//dstGraphics.drawImage(srcbi, 
		//		dstRect.x,dstRect.y,dstRect.x+dstRect.width,dstRect.y+dstRect.height,
		//		srcRect.x,srcRect.y,srcRect.x+srcRect.width,srcRect.y+srcRect.height, PCARD.pc);
		postMessage({cmd:"PgColorXCopyBits", port:srcport, dport:dstport, src:srcRect, dst:dstRect, mode:mode});
	};

	if(arguments.length==0) return;

	if(arguments[0].toLowerCase()=="new"){
		var port = parseInt(arguments[1]);
		var p;
		if(p = getSize(arguments[2])){
			//rect/size
			newPgColorXBuf(port,p);
		}
		else {
			newPgColorXBuf(port,p,arguments[2]);
			var last = +new Date();
			while(+new Date()<=last+5*1000/60){
				var retx = extractQueue("img");
				if(retx){
					break;
				}
				if(vmStopFlag)break;
			}
			/*var bi = null;
			if(arguments[2].matches("^[0-9]*$")){
				bi = PCARD.pc.stack.rsrc.getImage(Integer.valueOf(arguments[2]), "picture");
			}
			else{
				var id = PCARD.pc.stack.rsrc.getRsrcIdAll(arguments[2], "picture");
				bi = PCARD.pc.stack.rsrc.getImage(id, "picture");
			}
			if(bi!=null){
				var p = {};
				p.x = bi.getWidth();
				p.y = bi.getHeight();
				newPgColorXBuf(port,p,arguments[2]);
			}
			else{
				result.theResult = "Error: Can't read Picture resource "+arguments[2]+".";
			}*/
		}
	}
	else if(arguments[0].toLowerCase()=="copybits" || arguments[0].toLowerCase()=="buftobuf"){
		//PgColorX "CopyBits",転送元port,転送先port,<*転送元rect>,<*転送先topleft/rect>,<*mode>,<*opColor>

		if(arguments.length>=5 && arguments[4].split("\n").length>=2){
			//改行で繋げて高速化とか厄介なことを・・・
			var srcparam = arguments[4].split("\n");
			var newarguments = new Array(arguments.length);
			for(var i=0; i<srcparam.length; i++){
				var tmpparam = arguments[1].split("\n");
				newarguments[1] = tmpparam[i%tmpparam.length];
				tmpparam = arguments[2].split("\n");
				newarguments[2] = tmpparam[i%tmpparam.length];
				if(arguments.length>=4 && arguments[3]!=null){
					tmpparam = arguments[3].split("\n");
					newarguments[3] = tmpparam[i%tmpparam.length];
				}
				if(arguments.length>=5 && arguments[4]!=null){
					tmpparam = arguments[4].split("\n");
					newarguments[4] = tmpparam[i%tmpparam.length];
				}
				if(arguments.length>=6 && arguments[5]!=null){
					tmpparam = arguments[5].split("\n");
					newarguments[5] = tmpparam[i%tmpparam.length];
				}
				if(arguments.length>=7 && arguments[6]!=null){
					tmpparam = arguments[6].split("\n");
					newarguments[6] = tmpparam[i%tmpparam.length];
				}
				CopyBits(0,newarguments);
			}
		}
		else{
			CopyBits(0,arguments);
		}
		wait(0.5);
	}
	else if(arguments[0].toLowerCase()=="ondraw"){
		//PgColorX "OnDraw",転送元port,<*転送元rect>,<*転送先topleft/rect>,<*mode>,<*opColor>
		var srcport = getPort(arguments[1]);

		var srcRect;
		if(arguments.length>=3 && arguments[2].length>0){
			srcRect = getRect(arguments[2]);
		}
		else{
			//srcRect = new Rectangle(0,0,PgColorX[srcport].bi.getWidth(),PgColorX[srcport].bi.getHeight());
			srcRect = null;
		}

		var dstRect = null;
		if(srcRect) dstRect = {x:0, y:0, width:srcRect.width, height:srcRect.height};
		if(arguments.length>=4 && arguments[3].length>0){
			dstRect = getRect(arguments[3]);
		}

		var mode = "copy";
		if(arguments.length>=5 && arguments[4].length>0){
			mode = arguments[4];
		}

		srcport = getPort(srcport);
		/*var srcbi=null;
		if(srcport>=0){
			srcbi = srcport;
		}
		else if(srcport==-1){
			//VEffect.setOldOff();
			//srcbi = VEffect.oldoff;
			srcbi = srcport;
		}*/

		//var dstGraphics=null;
		//dstGraphics = (Graphics2D) PCARD.pc.mainPane.getGraphics();

		if(mode.toLowerCase()=="transparent" /*&& PgColorX[srcport].colorKey==null*/){
			//PgColorX[srcport].colorKey = Color.WHITE;
			//PgColorX[srcport].setTransparent();
			//postMessage({cmd:"PgColorXTransparent", port:srcport});
		}

		postMessage({cmd:"PgColorXCopyBits", port:srcport, dport:-1, dst:dstRect, src:srcRect, mode:mode});
		//dstGraphics.drawImage(srcbi, 
		//		dstRect.x,dstRect.y,dstRect.x+dstRect.width,dstRect.y+dstRect.height,
		//		srcRect.x,srcRect.y,srcRect.x+srcRect.width,srcRect.y+srcRect.height, PCARD.pc);
		wait(0.5);
	}
	else if(arguments[0].toLowerCase()=="tiling"){
		//PgColorX "Tiling",転送元port,転送先port,<*転送元rect>,<*転送先topleft/rect>,<*mode>,<*opColor>
		var srcport = getPort(arguments[1]);
		var dstport = getPort(arguments[2]);

		var srcRect;
		if(arguments.length>=4 && arguments[3].length>0){
			srcRect = getRect(arguments[3]);
		}
		else{
			srcRect = null;//new Rectangle(0,0,PgColorX[srcport].bi.getWidth(),PgColorX[srcport].bi.getHeight());
		}

		var dstRect = null;
		/*if(dstport>=0){
			dstRect = new Rectangle(0,0,PgColorX[dstport].bi.getWidth(),PgColorX[dstport].bi.getHeight());
		}
		else{
			dstRect = new Rectangle(0,0,PCARD.pc.mainPane.getWidth(),PCARD.pc.mainPane.getHeight());
		}*/
		if(arguments.length>=5 && arguments[4].length>0){
			dstRect = getRect(arguments[4]);
		}

		var mode = "copy";
		if(arguments.length>=6 && arguments[5].length>0){
			mode = arguments[5];
		}

		srcport = getPort(srcport);
		/*var srcbi=null;
		if(srcport>=0){
			srcbi = srcport;
		}
		else if(srcport==-1){
			//VEffect.setOldOff();
			//srcbi = VEffect.oldoff;
			srcbi = srcport;
		}*/

		dstport = getPort(dstport);
		/*var dstGraphics=null;
		if(dstport>=0){
			dstGraphics = PgColorX[dstport].bi.createGraphics();
			PgColorX[dstport].colorKey = null;
		}
		else if(dstport==-1){
			dstGraphics = (Graphics2D) PCARD.pc.mainPane.getGraphics();
		}*/

		/*if(mode.toLowerCase()=="transparent" && PgColorX[srcport].colorKey==null){
			PgColorX[srcport].colorKey = Color.WHITE;
			PgColorX[srcport].setTransparent();
		}*/

		postMessage({cmd:"PgColorXCopyBits", port:srcport, dport:dstport, dst:dstRect, src:srcRect, mode:mode, tile:true});
		/*for(var y=dstRect.y; y<dstRect.y+dstRect.height; y+=srcRect.height){
			for(var x=dstRect.x; x<dstRect.x+dstRect.width; x+=srcRect.width){
				dstGraphics.drawImage(srcbi, 
						x,y,x+srcRect.width,y+srcRect.height,
						srcRect.x,srcRect.y,srcRect.x+srcRect.width,srcRect.y+srcRect.height, PCARD.pc);
			}
		}*/
		wait(0.5);
	}
	/*else if(arguments[0].toLowerCase()=="picfont"){
		//PgColorX "PicFont",転送元port,転送先port,string,<*転送先topleft>,<*mode>,<*opColor>
		var srcport = getPort(arguments[1]);
		var dstport = getPort(arguments[2]);

		var text = "";
		if(arguments.length>=4 && arguments[3].length>0){
			text = arguments[3];
		}
		var srcRect = new Rectangle(0,0,PgColorX[srcport].bi.getWidth(),PgColorX[srcport].bi.getHeight());

		var dstRect;
		if(dstport>=0){
			dstRect = new Rectangle(0,0,PgColorX[dstport].bi.getWidth(),PgColorX[dstport].bi.getHeight());
		}
		else{
			dstRect = new Rectangle(0,0,PCARD.pc.mainPane.getWidth(),PCARD.pc.mainPane.getHeight());
		}
		if(arguments.length>=5 && arguments[4].length>0){
			getRect(arguments[4],dstRect);
		}

		var mode = "copy";
		if(arguments.length>=6 && arguments[5].length>0){
			mode = arguments[5];
		}

		var srcbi=null;
		if(srcport>=0){
			srcbi = PgColorX[srcport].bi;
		}
		else if(srcport==-1){
			VEffect.setOldOff();
			srcbi = VEffect.oldoff;
		}

		var dstGraphics=null;
		if(dstport>=0){
			dstGraphics = PgColorX[dstport].bi.createGraphics();
			PgColorX[dstport].colorKey = null;
		}
		else if(dstport==-1){
			dstGraphics = (Graphics2D) PCARD.pc.mainPane.getGraphics();
		}

		if(mode.toLowerCase()=="transparent" && PgColorX[srcport].colorKey==null){
			PgColorX[srcport].colorKey = Color.WHITE;
			PgColorX[srcport].setTransparent();
		}

		for(var i=0; i<text.length(); i++){
			var c = text.charAt(i);
			if(c<32||c>=128) continue;
			dstGraphics.drawImage(srcbi,
					dstRect.x, dstRect.y, dstRect.x+srcRect.width/8, dstRect.y+srcRect.height/12,
					c%8*srcRect.width/8,(c-32)/8*srcRect.height/12,(c%8+1)*srcRect.width/8,((c-32)/8+1)*srcRect.height/12, PCARD.pc);
			dstRect.x += srcRect.width/8;
		}
	}*/
	else if(arguments[0].toLowerCase()=="pict" || arguments[0].toLowerCase()=="add" || arguments[0].toLowerCase()=="loadpict"){
		//PgColorX "Pict",port,<PICT Name/ID>,<*topleft/rect/"original">
		var port = getPort(arguments[1]);
		//var bi = null;

		/*if(arguments[2].matches("^[0-9]*$")){
			bi = PCARD.pc.stack.rsrc.getImage(Integer.valueOf(arguments[2]), "picture");
		}
		else{
			var id = PCARD.pc.stack.rsrc.getRsrcIdAll(arguments[2], "picture");
			bi = PCARD.pc.stack.rsrc.getImage(id, "picture");
		}*/

		//if(bi!=null){
			var rect = null;
			//rect = new Rectangle(0,0,bi.getWidth(),bi.getHeight());
			if(arguments.length>=4 && arguments[3].length>0){
				rect = getRect(arguments[3]);
			}

			port = getPort(port);
			/*var dstGraphics=null;
			if(port>=0){
				dstGraphics = PgColorX[port].bi.createGraphics();
				PgColorX[port].colorKey = null;
			}
			else if(port==-1){
				dstGraphics = (Graphics2D) PCARD.pc.mainPane.getGraphics();
			}*/

			postMessage({cmd:"newPgColorXBuf", pict:arguments[2], port:port, size:rect});
			var last = +new Date();
			while(+new Date()<=last+5*1000/60){
				var retx = extractQueue("img");
				if(retx){
					break;
				}
				if(vmStopFlag)break;
			}
			/*dstGraphics.drawImage(bi, 
					rect.x,rect.y,rect.x+rect.width,rect.y+rect.height,
					0,0,bi.getWidth(),bi.getHeight(), PCARD.pc);*/
		//}
	}
	else if(arguments[0].toLowerCase()=="string" || arguments[0].toLowerCase()=="drawstring"){
		//PgColorX "String",port,<text>,<color>,<topleft>,<*mode>,<*opColor>
		//PgColorX "DrawString",<text>,<color>,<topleft>,<*mode>,<*opColor>

		var offset = 0;
		var port = -1;
		if(arguments[0].toLowerCase()=="string") {
			port = getPort(arguments[1]);
			offset++;
		}
		var text = arguments[offset+1];
		var color = getColor(arguments[offset+2]);

		var topleft = {x:0, y:0};
		if(arguments.length>=offset+4){
			topleft = getSize(arguments[offset+3]);
		}
		var mode = "copy";
		if(arguments.length>=offset+5){
			mode = arguments[offset+4];
		}

		port = getPort(port);
		/*var dstGraphics=null;
		if(port>=0){
			dstGraphics = PgColorX[port].bi.createGraphics();
			PgColorX[port].colorKey = null;
		}
		else if(port==-1){
			dstGraphics = (Graphics2D) PCARD.pc.mainPane.getGraphics();
		}*/

		//var font = new Font(PCARD.pc.textFont, PCARD.pc.textStyle, PCARD.pc.textSize);
		//dstGraphics.setFont(font);

		/*if(mode.toLowerCase()=="copy"){
			var fo = dstGraphics.getFontMetrics();
			var strWidth = fo.stringWidth(text);
			dstGraphics.setColor(Color.WHITE);
			dstGraphics.fillRect(topleft.x, topleft.y, topleft.x+strWidth, topleft.y+PCARD.pc.textSize);
		}*/

		//dstGraphics.setColor(color);
		//dstGraphics.drawString(text, topleft.x, topleft.y+PCARD.pc.textSize);
		postMessage({cmd:"PgColorXDrawString", text:text, port:port, topleft:topleft, color:color, mode:mode, font:system.textFont, fontsize:system.textSize, fontstyle:system.textStyle});

		wait(0.5);
	}
	else if(arguments[0].toLowerCase()=="kill"){
		/*if(arguments.length>=2){
			var port = getPort(arguments[1]);
			PgColorX[port] = null;
		}
		else{
			for(var port=0; port<PgColorX.length; port++){
				PgColorX[port] = null;
			}
		}*/
	}
	else{
		postMessage("PgColorX:未実装のコマンド:"+arguments[0]);
	}
}