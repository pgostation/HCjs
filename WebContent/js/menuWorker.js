"use strict";

var cardHistory = [];
var cardForward = [];

function wexecMenu(menuName){
	var menuLower = menuName.toLowerCase();
	//ファイル
	if(menuLower=="about hcjs…"){
		answer("         HCjs\n"+
				"      beta version "+system.version+"\n"+
				"\n"+
		"       (c)2012 pgo");
		return true;
	}
	//編集
	if(menuLower=="new card"){
		var newCardObj = hcNewCard(currentCardObj.background);
		var i;
		for(i=0;i<cardData.length; i++){
			if(currentCardObj.id == cardData[i].id) break;
		}
		var newCardAry = cardData.slice(0,i+1);
		newCardAry[i+1] = newCardObj;
		cardData = newCardAry.concat(cardData.slice(i+1,cardData.length));

		hcCardbaseDefine(newCardObj);

		innerGoCard(cardData[i+1]);
		waitGo();
		//makeObjectsWindow();
		changedStack = true;
		saveStackData();
		return true;
	}
	if(menuLower=="new background"){
		var newBgObj = hcNewBackground();
		bgData[bgData.length] = newBgObj;
		var newCardObj = hcNewCard(newBgObj.id);
		var i;
		for(i=0;i<cardData.length; i++){
			if(currentCardObj.id == cardData[i].id) break;
		}
		var newCardAry = cardData.slice(0,i+1);
		newCardAry[i+1] = newCardObj;
		cardData = newCardAry.concat(cardData.slice(i+1,cardData.length));
		innerGoCard(cardData[i+1]);
		waitGo();
		//makeObjectsWindow();
		changedStack = true;
		saveStackData();
		return true;
	}
	if(menuLower=="new button"||menuLower=="new field"){
		var baseData = (system.editBkgnd)?currentBgObj:currentCardObj;
		var newdata = (menuLower=="new button")?hcButton(baseData):hcField(baseData);
		newdata.id = newBtnId(baseData);
		newdata.left = stackData.width/2-newdata.width/2|0;
		newdata.top = stackData.height/2-newdata.height/2|0;
		baseData.parts[baseData.parts.length] = newdata;//最後に追加
		innerGoCard(thisCard());
		waitGo();
		changedStack = true;
		saveStackData();
		return true;
	}
	if(menuLower=="delete card"){
		if(currentCardObj.cantDelete){
			answer((browserLang=="ja")?"カードのプロパティが削除不可です":"This card's property is 'can't delete'");
		}else if(cardData.length==1){
			answer((browserLang=="ja")?"カードが1枚しかありません":"This card is last one");
		}else{
			for(var i=0;i<cardData.length; i++){
				if(currentCardObj.id == cardData[i].id){
					cardData.splice(i,1);//削除
					changedStack = true;
					saveStackData();
					innerGoCard(cardData[i%cardData.length]);
					waitGo();
				}
			}
		}
		return true;
	}
	if(menuLower=="background"){
		system.editBkgnd = !system.editBkgnd;
		/*var tool = selectedTool;
	  changeTool('browse');
	  changeTool(tool);*/
		return true;
	}
	//ゴー
	if(menuLower=="arrowkey left"){
		if(stackData.showNavigator!=false){
			menuLower = "prev";
		}
	}
	if(menuLower=="arrowkey right"){
		if(stackData.showNavigator!=false){
			menuLower = "next";
		}
	}
	if(menuLower=="arrowkey up"){
		if(stackData.showNavigator!=false){
			menuLower = "back";
		}
	}
	if(menuLower=="arrowkey down"){
		if(stackData.showNavigator!=false){
			menuLower = "forward";
		}
	}
	if(menuLower=="arrowkey left withCmd"){
		if(stackData.showNavigator!=false){
			menuLower = "first";
		}
	}
	if(menuLower=="arrowkey right withCmd"){
		if(stackData.showNavigator!=false){
			menuLower = "last";
		}
	}
	if(menuLower=="prev"){
		var i;
		for(i=0;i<cardData.length; i++){
			if(currentCardObj.id == cardData[i].id) break;
		}
		var nextLoadCardObj = cardData[(i+cardData.length-2)%(cardData.length)];
		//visualEffect("wipe right fast");
		innerGoCard(cardData[(i+cardData.length-1)%(cardData.length)],nextLoadCardObj);
		waitGo();
		return true;
	}
	if(menuLower=="next"){
		var i;
		for(i=0;i<cardData.length; i++){
			if(currentCardObj.id == cardData[i].id) break;
		}
		var nextLoadCardObj = cardData[(i+2)%(cardData.length)];
		//visualEffect("wipe left fast");
		innerGoCard(cardData[(i+1)%(cardData.length)],nextLoadCardObj);
		waitGo();
		return true;
	}
	if(menuLower=="first"){
		innerGoCard(cardData[0]);
		waitGo();
		return true;
	}
	if(menuLower=="last"){
		innerGoCard(cardData[cardData.length-1]);
		waitGo();
		return true;
	}
	if(menuLower=="back"){
		if(cardHistory.length>0){
			cardForward[cardForward.length] = currentCardObj.id;
			innerGoCard(cardById(cardHistory[cardHistory.length-1]),undefined,true);
			waitGo();
			cardHistory.pop(cardHistory.length-1);
		}
		return true;
	}
	if(menuLower=="forward"){
		if(cardForward.length>0){
			innerGoCard(cardById(cardForward.pop(cardForward.length-1)),undefined,true);
			waitGo();
			cardHistory[cardHistory.length] = currentCardObj.id;
		}
		return true;
	}
	if(menuLower=="recent…"){
		var cardData2 = [];
		cardData2[currentCardObj.id] = operaCloneObj(currentCardObj);
		for(var i=0; i<cardHistory.length; i++){
			cardData2[cardHistory[i]] = operaCloneObj(cardById(cardHistory[i]));
		}
		postMessage({cmd:"recent", arg:cardHistory, arg2:cardData2});
		return true;
	}
	if(menuLower=="full screen"){
		if(document.getElementById('cardBack').webkitRequestFullScreen!=undefined){
			document.getElementById('cardBack').webkitRequestFullScreen();
		}
		else if(document.getElementById('cardBack').mozRequestFullScreen!=undefined){
			document.getElementById('cardBack').mozRequestFullScreen();
		}
		else alert("Browser isn't support fullscreen API.");
		return true;
	}
	if(menuLower=="find…"){
		var cardData2 = operaCloneObj(cardData);
		var bgData2 = operaCloneObj(bgData);
		postMessage({cmd:"find", opt:"string", string:"", fld:null, cds:cardData2, bgs:bgData2});
		return true;
	}
	if(menuLower=="findnext"){
		postMessage({cmd:"findnext"});
		return true;
	}
	//ツール
	if(menuLower=="tb_browse"){
		changeTool('browse');
		return true;
	}
	if(menuLower=="tb_button"){
		changeTool('button');
		return true;
	}
	if(menuLower=="tb_field"){
		changeTool('field');
		return true;
	}
	if(menuLower=="tb_select"){
		changeTool('select');
		return true;
	}
	if(menuLower=="tb_lasso"){
		changeTool('lasso');
		return true;
	}
	if(menuLower=="tb_magicwand"){
		changeTool('magicwand');
		return true;
	}
	if(menuLower=="tb_pencil"){
		changeTool('pencil');
		return true;
	}
	if(menuLower=="tb_brush"){
		changeTool('brush');
		return true;
	}
	if(menuLower=="tb_eraser"){
		changeTool('eraser');
		return true;
	}
	if(menuLower=="tb_line"){
		changeTool('line');
		return true;
	}
	if(menuLower=="tb_rect"){
		changeTool('rect');
		return true;
	}
	if(menuLower=="tb_oval"){
		changeTool('oval');
		return true;
	}
	if(menuLower=="tb_paintbucket"){
		changeTool('paintbucket');
		return true;
	}
	if(menuLower=="tb_type"){
		changeTool('type');
		return true;
	}
	//objects menu
	//if(menuLower=="objects window…"){
	//makeObjectsWindow();
	//}
	//その他
	if(menuLower=="menubar"){
		menubar().visible = !menubar().visible;
		return true;
	}
}


function changeTool(toolname){
	postMessage({cmd:"tool", arg:toolname});
}

