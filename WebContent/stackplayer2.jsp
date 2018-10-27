<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.*" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="sInfo" scope="page" class="javabeans.stackInfo"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
//セッションIDでユーザIDを認証する
String sid = request.getSession().getId();
String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
if(userId==null || userId.equals("")){
	userId = sidBean.newGuestId(application.getRealPath(".."), request.getRemoteAddr(), request.getHeader("User-Agent"));
	response.addCookie(new Cookie("userId", userId));
}

//トラップ
if(request.getParameter("author")==null || request.getParameter("name")==null ||
   request.getParameter("author")=="" || request.getParameter("name")=="" ||
   !request.getParameter("author").matches("[_a-zA-Z0-9]{3,15}") || request.getParameter("name").contains("..") ){
	response.sendError(404);
}

String lang = "en";
String langStr = request.getHeader("accept-language");
if (langStr != null && langStr.startsWith("ja")) {
  lang = "ja";
}

// パラメータの日本語変換
String enName = request.getParameter("name");
String jaNamePath = new String( enName.getBytes( "8859_1" ), "UTF-8" );
String jaNameHTML = HTMLesc.escape(jaNamePath);
String authorStr = request.getParameter("author");
String pathStr = getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+jaNamePath+"/_stackinfo.xmap";
xmapString xmap = sInfo.getInfo2(pathStr);
if(xmap==null){
	xmap = new xmapString("");
}
else{
	//リファラー付きでアクセスしてきたらカウンター増やす
	if(!authorStr.equals(userId) && request.getHeader("Referer")!=null){
		int counter = 0;
		String counterStr = xmap.get("counter");
		if(counterStr!=null){
			counter = Integer.valueOf(counterStr);
		}
		counter++;
		xmap.set("counter",Integer.toString(counter));
		xmap.save(pathStr);
	}
}
String publicStatusStr = xmap.get("status");
if(publicStatusStr==null) publicStatusStr="private";
boolean masterEditMode = false;
if(!"protect".equals(xmap.get("protect")) && authorStr.equals(userId)){
	masterEditMode = true;
}
String cssStr = "default";//xmap.get("css");

//String initialWidthStr = xmap.get("width");
//if(initialWidthStr==null) initialWidthStr = "512";
//String initialHeightStr = xmap.get("height");
//if(initialHeightStr==null) initialHeightStr = "384";


String iconStr=xmap.get("icon");
if(iconStr!=null){
	iconStr="img/logo.png";
}else{
	iconStr="getfile?user="+authorStr+"&path=stack/"+iconStr;
}
%>
<!DOCTYPE html>
<html lang="ja">
<head>
<script>
var userId = "<%= userId %>";
var userParameter = "<%= authorStr %>";
var nameParameter = "<%= jaNamePath.replaceAll("\\\\","\\\\\\\\").replaceAll("\"","\\\\\"") %>";
var browserLang = "<%= lang %>";
var publicStatus = "<%= publicStatusStr %>";
var masterEditMode = <%= masterEditMode %>;
</script>
<link rel="shortcut icon" href="favicon.ico"> 
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"> 
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>
<script src="js/jquery-ui-touch-punch.js"></script>

<link rel="stylesheet" href="css/<%= cssStr %>/jquery-ui-1.8.19.custom.css" />
<link rel="stylesheet" href="css/<%= cssStr %>/stack.css" />

<script defer src="js/stack.js"></script>
<script defer src="js/menu.js"></script>
<script async src="js/authoring.js"></script>
<script defer src="js/commands.js"></script>
<script defer src="js/property.js"></script>
<script defer src="js/rsrc.js"></script>
<script async src="js/paint.js"></script>
<script defer src="js/mainMsg.js"></script>
<script async src="js/scripteditor.js"></script>
<script async src="js/rsrceditor.js"></script>

<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="apple-touch-icon" href="<%= iconStr %>" />

<title><%= jaNameHTML %></title>

</head>

<body onLoad="onLoadExec();" onscroll="windowResize();" draggable=false>
<div id="par" style="width:100%;height:100%;">

	<div id="page" draggable="false">
		
		<canvas id="tempCanvas" style="position:absolute;visibility:hidden;" width=32 height=32></canvas>
		
		<div id='dontclick' style="display:none"></div>
		
		<div id="main">
			<section class="cardBack" style="width: 0px; height: 0px; margin-left: -0px; margin-top: -0px;">
				<div class="cardBack" id="cardBack" style="width:  0px; height: 0px;"></div>
			</section>
		</div><!-- / #main -->

	</div><!-- / #content -->
	
	<div id="footer1" class="<%= masterEditMode?"H Footer":"Footer" %>" style="display:none;user-select:none;" onSelectStart="return false;" >
		<div id="findstring" style="display:none;width:100%">
			<input type=search id="findtext" placeholder="<%= HTMLesc.escapeTrans("Find String", lang) %>"
			onchange="mmsgSendSystemEvent('find',this.value);" ontouchend="this.focus();" spellcheck=false />
			<button id="findnext" onClick="menubtn();execMenu('findnext');" onmousedown=""><%= HTMLesc.escapeTrans("Find Next", lang) %></button>
			<button id="findclose" onClick="menubtn();document.getElementById('findstring').style.display = 'none';" onmousedown="">x</button>
		</div>
		<div id="mainmenu" style="margin-top:6px;width:100%;white-space:nowrap;cursor:default;">
			<button id="menubtn1" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Stack','menubtn1');"><%= HTMLesc.escapeTrans("Stack", lang) %></button>
			<button id="menubtn2" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Edit','menubtn2');"><%= HTMLesc.escapeTrans("Edit", lang) %></button>
			<button id="menubtn3" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Go','menubtn3');"><%= HTMLesc.escapeTrans("Go", lang) %></button>
			<button id="menubtn4" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Tools','menubtn4');"><%= HTMLesc.escapeTrans("Tools", lang) %></button>
			<button id="menubtn5" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('5','menubtn5');" style="display:none">5</button>
			<button id="menubtn6" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('6','menubtn6');" style="display:none">6</button>
			<button id="menubtn7" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('7','menubtn7');" style="display:none">7</button>
			<button id="menubtn8" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('8','menubtn8');" style="display:none">8</button>
			<span id="ipadnav" style="margin-left:50px;text-align:right;">
				<button id="menubtn10" onClick="menubtn();execMenu('first');">|◀</button>
				<button id="menubtn11" onClick="menubtn();execMenu('prev');">◀</button>
				<button id="menubtn12" onClick="menubtn();execMenu('next');">▶</button>
				<button id="menubtn13" onClick="menubtn();execMenu('last');">▶|</button>
			</span>
		</div>
		<div id="navmenu" style="display:none;margin-top:6px;">
			<button id="navbtn1" onClick="menubtn();openMenu('Menu');" onmousedown=""><%= HTMLesc.escapeTrans("Menu", lang) %></button>
				<button id="navbtn2" onClick="menubtn();execMenu('first');" onmousedown="">|◀</button>
				<button id="navbtn3" onClick="menubtn();execMenu('prev');" onmousedown="">◀</button>
				<button id="navbtn4" onClick="menubtn();execMenu('next');" onmousedown="">▶</button>
				<button id="navbtn5" onClick="menubtn();execMenu('last');" onmousedown="">▶|</button>
		</div>
	</div>

<!-- ■BUTTON PALETTE -->
<div class="dragPalette" id="button-palette" onSelectStart="return false;" style="z-index:102; display:none; position: absolute; width:100%; text-align:center; height:40px; ">
<div id="button-palette1" style="position:absolute;width:400px;">
<button class="transparent" style="padding:0px; position:absolute; left:0px; top:0px; width:40px; height:40px;white-space:normal;"><%= HTMLesc.escapeTrans("Transparent", lang) %></button>
<div id="btn-plt-transparent" style="position:absolute; left:0px; top:0px; width:40px; height:40px;"></div>
<button class="opaque" style="padding:0px; position:absolute; left:40px; top:0px; width:40px; height:40px;white-space:normal;"><%= HTMLesc.escapeTrans("Opaque", lang) %></button>
<div id="btn-plt-opaque" style="position:absolute; left:40px; top:0px; width:40px; height:40px;"></div>
<button class="rectangle" style="padding:0px; position:absolute; left:80px; top:0px; width:40px; height:40px;white-space:normal;"><%= HTMLesc.escapeTrans("Rect", lang) %></button>
<div id="btn-plt-rectangle" style="position:absolute; left:80px; top:0px; width:40px; height:40px;"></div>
<button class="roundrect" style="padding:0px; position:absolute; left:120px; top:0px; width:40px; height:40px;white-space:normal;"><small><%= HTMLesc.escapeTrans("RoundRect", lang) %></small></button>
<div id="btn-plt-roundrect"  style="position:absolute; left:120px; top:0px; width:40px; height:40px;"></div>
<button class="shadow" style="padding:0px; position:absolute; left:160px; top:0px; width:40px; height:40px;white-space:normal;"><%= HTMLesc.escapeTrans("Shadow", lang) %></button>
<div id="btn-plt-shadow" style="position:absolute; left:160px; top:0px; width:40px; height:40px;"></div>
<button class="standard" style="padding:0px; position:absolute; left:200px; top:0px; width:40px; height:40px;white-space:normal;"><%= HTMLesc.escapeTrans("Standard", lang) %></button>
<div id="btn-plt-standard" style="position:absolute; left:200px; top:0px; width:40px; height:40px;"></div>
<input type="radio" class="radio" style="padding:0px; position:absolute; left:250px; top:12px;" checked>
<div id="btn-plt-radio" style="position:absolute; left:240px; top:0px; width:40px; height:40px;"></div>
<input type="checkbox" class="checkbox" style="padding:0px; position:absolute; left:290px; top:12px;" checked>
<div id="btn-plt-checkbox" style="position:absolute; left:280px; top:0px; width:40px; height:40px;"></div>
<select class="popup" style="padding:0px; position:absolute; left:320px; top:8px;"></select>
<div id="btn-plt-popup" style="position:absolute; left:320px; top:0px; width:40px; height:40px;"></div>
<!-- <input type="range" class="range" style="padding:0px; position:absolute; left:360px; top:8px; width:40px;">
<div id="btn-plt-range" style="position:absolute; left:360px; top:0px; width:40px; height:40px;"></div>-->
</div>
</div>

<!-- ■FIELD PALETTE -->
<div class="dragPalette" id="field-palette" onSelectStart="return false;" style="z-index:102; display:none; position: absolute; width: 100%; height:60px; ">
<div id="field-palette1" style="position:absolute;width:320px;">
<div class="transparent" id="fld-plt-transparent" 
 style="position:absolute; left:0px; top:0px; width:60px; height:60px;"><%= HTMLesc.escapeTrans("Transparent", lang) %></div>
<div class="opaque" id="fld-plt-opaque" 
 style="position:absolute; left:60px; top:0px; width:60px; height:60px;" ><%= HTMLesc.escapeTrans("Opaque", lang) %></div>
<div class="rectangle" id="fld-plt-rectangle" 
 style="position:absolute; left:120px; top:0px; width:60px; height:60px;"><%= HTMLesc.escapeTrans("Rect", lang) %></div>
<div class="shadow" id="fld-plt-shadow" 
 style="position:absolute; left:180px; top:0px; width:60px; height:60px;"><%= HTMLesc.escapeTrans("Shadow", lang) %></div>
<div class="scrolling" id="fld-plt-scrolling" 
 style="position:absolute; left:240px; top:0px; width:60px; height:60px;"><%= HTMLesc.escapeTrans("Scroll", lang) %></div>
</div>
</div>

<!--■MSG BOX-->
<div id="messageboxDiv" class="messageBox" onSelectStart="return false;" style="z-index:102; display:none; position: absolute; height:40px; ">
	<div class="smallTitleBar">
	</div>
	<div style="top: 0%;">
	<input type="text" id="messagebox" name="messageBox" style="position: absolute; height:24px; top: 16px; left:0%; border-width:0px;font-size:120%;
	 width:500px; border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;"
	 onchange="sendCommand(currentCardObj,this.value);" ontouchend="this.focus();event.preventDefault();" spellcheck=false>
	</div>
</div>

<!--  overrayBack -->
<div id="overrayBack" style="position:absolute; width:100%; height:100%; background-color:#666;opacity:0.1; display:none; z-index:2000;"  oncontextmenu="return false;" ontouchend="if(this.onclick){this.onclick();}"></div>

<!--  dropArea -->
<div id="dropArea" style="position:absolute; width:100%; height:100%; display:none; opacity:0.1;"></div>

<!--  dummy menu -->
<div id="dummy_menu" class="ui-dialog ui-widget ui-widget-content ui-corner-all" style="display:none;z-index:2002;position:absolute;width:300px;box-shadow:2px 2px 20px #000;">
	<div id="menu_select-menu2" class="ui-dialog-content ui-widget-content ui-menu" style="width:100%;padding-left:0px;">
	</div>
</div>

<!--■BUTTON INFO-->
<div id="buttonInfo" class="infoBack" style="display:none;">
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Button Information", lang) %></h3>
	<div class="infoDiv">
		<input type=text id=btnName size=32 style="font-size:1em;">
		<span style="white-space:nowrap;"><input type=checkbox id=btnShowname /><label for=btnShowname><%= HTMLesc.escapeTrans("Show Name", lang) %></label></span>
		<br>
		<span id=btnObjectType>&nbsp;</span>    <%= HTMLesc.escapeTrans("Number", lang) %>:<span id=btnNumber>1</span>  ID:<span id=btnId>1</span>
		<br>
		<button id=btnFont onclick="hideInfoDialog();fontDialog(tbSelectedButton);event.preventDefault();"><%= HTMLesc.escapeTrans("Font…", lang) %></button>
		<button id=btnIcon onclick="hideInfoDialog();openRsrcEditor('icon',tbSelectedButton);event.preventDefault();"><%= HTMLesc.escapeTrans("Icon…", lang) %></button>
		<br>
		<button id=btnScript onclick="hideInfoDialog();scriptEditorBtn(tbSelectedButton);event.preventDefault();"><%= HTMLesc.escapeTrans("Script…", lang) %></button>
		<button id=btnContent onclick="hideInfoDialog();contentOfBtn(tbSelectedButton);event.preventDefault();"><%= HTMLesc.escapeTrans("Content…", lang) %></button>
	</div>
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Property", lang) %></h3>
	<div class="infoDiv">
		<select id=btnStyle>
			<option><%= HTMLesc.escapeTrans("Standard", lang) %>
			<option><%= HTMLesc.escapeTrans("Transparent", lang) %>
			<option><%= HTMLesc.escapeTrans("Opaque", lang) %>
			<option><%= HTMLesc.escapeTrans("Rect", lang) %>
			<option><%= HTMLesc.escapeTrans("Shadow", lang) %>
			<option><%= HTMLesc.escapeTrans("RoundRect", lang) %>
			<option><%= HTMLesc.escapeTrans("Default", lang) %>
			<option><%= HTMLesc.escapeTrans("Oval", lang) %>
			<option><%= HTMLesc.escapeTrans("Popup", lang) %>
			<option><%= HTMLesc.escapeTrans("Checkbox", lang) %>
			<option><%= HTMLesc.escapeTrans("Radio", lang) %>
		</select>
		<input type=number min=0 id="btnTitleWidth" style="width:0px;display:none;width:0px;">
		<br>
		<%= HTMLesc.escapeTrans("Family", lang) %>:
		<select id=btnFamily><option><%= HTMLesc.escapeTrans("None", lang) %><option>1<option>2<option>3<option>4<option>5<option>6<option>7<option>8<option>9<option>10<option>11<option>12<option>13<option>14<option>15</select>
		<br>
		<span style="float:left;width:9em;"><input type=checkbox id=btnEnabled><label for=btnEnabled><%= HTMLesc.escapeTrans("Enabled", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=btnAutoHilite><label for=btnAutoHilite><%= HTMLesc.escapeTrans("Auto Hilite", lang) %></label></span>
		<br>
		<span style="float:left;width:9em;"><input type=checkbox id=btnIconScaling><label for=btnIconScaling><%= HTMLesc.escapeTrans("Scale Icon", lang) %></label></span>
		<span id="sharedHiliteSpan" style="float:left;width:10em;"><input type=checkbox id=btnSharedHilite><label for=btnSharedHilite><%= HTMLesc.escapeTrans("Shared Hilite", lang) %></label></span>
	</div>
	<h3 style="display:none" class="infoH"><%= HTMLesc.escapeTrans("Location", lang) %></h3>
	<div style="display:none" class="infoDiv">
		<%= HTMLesc.escapeTrans("Left", lang) %>:<input type=number id=btnLeft size=4 style="font-size:1.1em;"/>
		<button id=btnLm onclick="$('#btnLeft').get(0).value--;$('#btnLeft').click();">-</button>
		<button id=btnLp onclick="$('#btnLeft').get(0).value++;$('#btnLeft').click();">+</button>
		<br>
		<%= HTMLesc.escapeTrans("Top", lang) %>:<input type=number id=btnTop size=4 style="font-size:1.1em;"/>
		<button id=btnTm onclick="$('#btnTop').get(0).value--;$('#btnTop').click();">-</button>
		<button id=btnTp onclick="$('#btnTop').get(0).value++;$('#btnTop').click();">+</button>
		<br>
		<%= HTMLesc.escapeTrans("Width", lang) %>:<input type=number id=btnWidth size=4 style="font-size:1.1em;"/>
		<button id=btnWm onclick="$('#btnWidth').get(0).value--;$('#btnWidth').click();">-</button>
		<button id=btnWp onclick="$('#btnWidth').get(0).value++;$('#btnWidth').click();">+</button>
		<br>
		<%= HTMLesc.escapeTrans("Height", lang) %>:<input type=number id=btnHeight size=4 style="font-size:1.1em;"/>
		<button id=btnHm onclick="$('#btnHeight').get(0).value--;$('#btnHeight').click();">-</button>
		<button id=btnHp onclick="$('#btnHeight').get(0).value++;$('#btnHeight').click();">+</button>
	</div>
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Edit", lang) %></h3>
	<div class="infoDiv">
		<button id=btnCut onclick="cutPart(tbSelectedButton);hideInfoDialog();"><%= HTMLesc.escapeTrans("Cut", lang) %></button>
		<button id=btnCopy onclick="copyPart(tbSelectedButton);"><%= HTMLesc.escapeTrans("Copy", lang) %></button>
		<button id=btnDelete onclick="deletePart(tbSelectedButton);hideInfoDialog();"><%= HTMLesc.escapeTrans("Delete", lang) %></button>
		<br>
		<button id=btnBringCloser onclick="bringcloserPart(tbSelectedButton);"><%= HTMLesc.escapeTrans("Bring Closer", lang) %></button>
		<button id=btnSendFarther onclick="sendfartherPart(tbSelectedButton);"><%= HTMLesc.escapeTrans("Send Farther", lang) %></button>
	</div>
</div>

<!--■FIELD INFO-->
<div id="fieldInfo" class="infoBack" style="display:none;">
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Field Information", lang) %></h3>
	<div class="infoDiv">
		<input type=text id=fldName size=32 style="font-size:1em;">
		<br>
		<span id=fldObjectType>&nbsp;</span>    <%= HTMLesc.escapeTrans("Number", lang) %>:<span id=fldNumber>1</span>  ID:<span id=fldId>1</span>
		<br>
		<button id=fldFont onclick="hideInfoDialog();fontDialog(tbSelectedField);event.preventDefault();"><%= HTMLesc.escapeTrans("Font…", lang) %></button>
		<button id=fldScript onclick="hideInfoDialog();scriptEditorFld(tbSelectedField);event.preventDefault();"><%= HTMLesc.escapeTrans("Script…", lang) %></button>
	</div>
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Property", lang) %></h3>
	<div class="infoDiv">
		<select id=fldStyle size=1>
			<option><%= HTMLesc.escapeTrans("Transparent", lang) %></option>
			<option><%= HTMLesc.escapeTrans("Opaque", lang) %></option>
			<option><%= HTMLesc.escapeTrans("Rect", lang) %></option>
			<option><%= HTMLesc.escapeTrans("Shadow", lang) %></option>
			<option><%= HTMLesc.escapeTrans("Scroll", lang) %></option>
		</select>
		<br>
		<span style="float:left;width:9em;"><input type=checkbox id=fldLockedtext><label for=fldLockedtext><%= HTMLesc.escapeTrans("Lock Text", lang) %></label></span>
		<!-- <span style="float:left;width:9em;"><input type=checkbox id=fldVisible><label for=fldVisible>表示する</label></span>-->
		<span style="float:left;width:11em;"><input type=checkbox id=fldDontwrap><label for=fldDontwrap><%= HTMLesc.escapeTrans("Don't Wrap", lang) %></label></span>
		<span style="float:left;width:9em;"><input type=checkbox id=fldAutoselect><label for=fldAutoselect><%= HTMLesc.escapeTrans("Auto Select", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=fldWidemargins><label for=fldWidemargins><%= HTMLesc.escapeTrans("Wide Margins", lang) %></label></span>
		<span style="float:left;width:9em;"><input type=checkbox id=fldMultiplelines><label for=fldMultiplelines><%= HTMLesc.escapeTrans("Multiple Lines", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=fldFixedlineheight><label for=fldFixedlineheight><%= HTMLesc.escapeTrans("Fixed Line Height", lang) %></label></span>
		<span style="float:left;width:9em;"><input type=checkbox id=fldAutotab><label for=fldAutotab><%= HTMLesc.escapeTrans("Auto Tab", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=fldShowlines><label for=fldShowlines><%= HTMLesc.escapeTrans("Show Lines", lang) %></label></span>
		<span style="float:left;width:9em;"><input type=checkbox id=fldDontsearch><label for=fldDontsearch><%= HTMLesc.escapeTrans("Don't Search", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=fldVertically><label for=fldVertically><%= HTMLesc.escapeTrans("Vertically Text", lang) %></label></span>
		<span id="sharedTextSpan" style="float:left;width:9em;"><input type=checkbox id=fldSharedText><label for=fldSharedText><%= HTMLesc.escapeTrans("Shared Text", lang) %></label></span>
	</div>
	<h3  style="display:none" class="infoH"><%= HTMLesc.escapeTrans("Location", lang) %></h3>
	<div  style="display:none" class="infoDiv">
		<%= HTMLesc.escapeTrans("Left", lang) %>:<input type=number id=fldLeft size=4 style="font-size:1.1em;"/>
		<button id=fldLm onclick="$('#fldLeft').get(0).value--;$('#fldLeft').click();">-</button>
		<button id=fldLp onclick="$('#fldLeft').get(0).value++;$('#fldLeft').click();">+</button>
		<br>
		<%= HTMLesc.escapeTrans("Top", lang) %>:<input type=number id=fldTop size=4 style="font-size:1.1em;"/>
		<button id=fldTm onclick="$('#fldTop').get(0).value--;$('#fldTop').click();">-</button>
		<button id=fldTp onclick="$('#fldTop').get(0).value++;$('#fldTop').click();">+</button>
		<br>
		<%= HTMLesc.escapeTrans("Width", lang) %>:<input type=number id=fldWidth size=4 style="font-size:1.1em;"/>
		<button id=fldWm onclick="$('#fldWidth').get(0).value--;$('#fldWidth').click();">-</button>
		<button id=fldWp onclick="$('#fldWidth').get(0).value++;$('#fldWidth').click();">+</button>
		<br>
		<%= HTMLesc.escapeTrans("Height", lang) %>:<input type=number id=fldHeight size=4 style="font-size:1.1em;"/>
		<button id=fldHm onclick="$('#fldHeight').get(0).value--;$('#fldHeight').click();">-</button>
		<button id=fldHp onclick="$('#fldHeight').get(0).value++;$('#fldHeight').click();">+</button>
	</div>
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Edit", lang) %></h3>
	<div class="infoDiv">
		<button id=fldCut onclick="cutPart(tbSelectedField);hideInfoDialog();"><%= HTMLesc.escapeTrans("Cut", lang) %></button>
		<button id=fldCopy onclick="copyPart(tbSelectedField);"><%= HTMLesc.escapeTrans("Copy", lang) %></button>
		<button id=fldDelete onclick="deletePart(tbSelectedField);hideInfoDialog();"><%= HTMLesc.escapeTrans("Delete", lang) %></button>
		<br>
		<button id=fldBringCloser onclick="bringcloserPart(tbSelectedField);"><%= HTMLesc.escapeTrans("Bring Closer", lang) %></button>
		<button id=fldSendFarther onclick="sendfartherPart(tbSelectedField);"><%= HTMLesc.escapeTrans("Send Farther", lang) %></button>
	</div>
</div>

<!--■CARD INFO-->
<div id="cardInfo" class="infoBack" style="display:none;">
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Card Information", lang) %></h3>
	<div class="infoDiv">
		<input type=text id=cardName size=32 style="font-size:1em;">
		<br>
		<span id=cardObjectType>&nbsp;</span>    <%= HTMLesc.escapeTrans("Number", lang) %>:<span id=cardNumber>1</span>  ID:<span id=cardId>1</span>
		<br>
		<button id=cardScript onclick="hideInfoDialog();scriptEditorObj(currentCardObj);"><%= HTMLesc.escapeTrans("Script…", lang) %></button>
	</div>
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Property", lang) %></h3>
	<div class="infoDiv">
		<span style="float:left;width:10em;"><input type=checkbox id=cardShowPicture><label for=cardShowPicture><%= HTMLesc.escapeTrans("Show Picture", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=cardMarked><label for=cardMarked><%= HTMLesc.escapeTrans("Marked", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=cardCantDelete><label for=cardCantDelete><%= HTMLesc.escapeTrans("Can't Delete", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=cardDontsearch><label for=cardDontsearch><%= HTMLesc.escapeTrans("Don't Search", lang) %></label></span>
	</div>
</div>

<!--■BACKGROUND INFO-->
<div id="bkgndInfo" class="infoBack" style="display:none;">
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Background Information", lang) %></h3>
	<div class="infoDiv">
		<input type=text id=bkgndName size=32 style="font-size:1em;">
		<br>
		<span id=bkgndObjectType>&nbsp;</span>    <%= HTMLesc.escapeTrans("Number", lang) %>:<span id=bkgndNumber>1</span>  ID:<span id=bkgndId>1</span>
		<br>
		<button id=bkgndScript onclick="hideInfoDialog();scriptEditorObj(currentBgObj);"><%= HTMLesc.escapeTrans("Script…", lang) %></button>
	</div>
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Property", lang) %></h3>
	<div class="infoDiv">
		<span style="float:left;width:11em;"><input type=checkbox id=bkgndShowPicture><label for=bkgndShowPicture><%= HTMLesc.escapeTrans("Show Picture", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=bkgndCantDelete><label for=bkgndCantDelete><%= HTMLesc.escapeTrans("Can't Delete", lang) %></label></span>
		<span style="float:left;width:11em;"><input type=checkbox id=bkgndDontsearch><label for=bkgndDontsearch><%= HTMLesc.escapeTrans("Don't Search", lang) %></label></span>
	</div>
</div>

<!--■STACK INFO-->
<div id="stackInfo" class="infoBack" style="display:none;">
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Stack Information", lang) %></h3>
	<div class="infoDiv">
		<span id=stackName style="font-size:110%;"></span>
		<br>
		<br>
		<%= HTMLesc.escapeTrans("Created By Version", lang) %>:<span id=stkCreatedByVersion></span>  <%= HTMLesc.escapeTrans("Modify Version", lang) %>:<span id=stkModifyVersion></span>
		<br>
		<button id=stackScript onclick="hideInfoDialog();scriptEditorObj(stackData1);"><%= HTMLesc.escapeTrans("Script…", lang) %></button>
	</div>
	<h3 class="infoH"><%= HTMLesc.escapeTrans("Property", lang) %></h3>
	<div class="infoDiv">
		<%= HTMLesc.escapeTrans("Width", lang) %>:<input type=number id=stkWidth size=2 style="font-size:1em;width:64px;">px
		&nbsp;&nbsp;<%= HTMLesc.escapeTrans("Height", lang) %>:<input type=number id=stkHeight size=2 style="font-size:1em;width:64px;">px
		<br>
		<%= HTMLesc.escapeTrans("UserLevel", lang) %>:
		<select id=stkUserLevel size=1>
			<option>5</option>
			<option>4</option>
			<option>3</option>
			<option>2</option>
			<option>1</option>
		</select>
		<br>
		<span style="float:left;width:11em;"><input type=checkbox id=stkCantAbort><label for=stkCantAbort><%= HTMLesc.escapeTrans("Can't Abort", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=stkCantModify><label for=stkCantModify><%= HTMLesc.escapeTrans("Can't Modify", lang) %></label></span>
		<span style="float:left;width:11em;"><input type=checkbox id=stkCantPeek><label for=stkCantPeek><%= HTMLesc.escapeTrans("Can't Peek", lang) %></label></span>
		<span style="float:left;width:10em;"><input type=checkbox id=stkShowNav><label for=stkShowNav><%= HTMLesc.escapeTrans("Show Navigator", lang) %></label></span>
	</div>
</div>

<!-- FONT DIALOG -->
<div id="fontDialog" style="display:none;">
<div id=fdDiv>
	<select id="fdName" style="width:170px;margin-left:10px;" onchange="fdChangeFont();">
		<option>serif
		<option selected>sans-serif
		<option>cursive
		<option>monospace
		<option>-
		<option>other…
	</select>
	<br>
	<%= HTMLesc.escapeTrans("Size", lang) %>:<input type="number" id="fdSize" style="width:50px;" min=3 max=255 value=12 onchange="fdChangeFont();" onclick="fdChangeFont();" />
	<br>
	<span id=fdLineHeightSpan><%= HTMLesc.escapeTrans("LineHeight", lang) %>:<input type="number" id="fdLineHeight" style="width:50px;" min=3 max=255 value=12 onchange="fdChangeFont();" onclick="fdChangeFont();" />
	<br></span>
	<fieldset><legend><%= HTMLesc.escapeTrans("Style", lang) %>:</legend>
	<input type="checkbox" id="fd-font-bold" onchange="fdChangeFont();" /><label for="fd-font-bold"><%= HTMLesc.escapeTrans("Bold", lang) %></label><br>
	<input type="checkbox" id="fd-font-italic" onchange="fdChangeFont();" /><label for="fd-font-italic"><%= HTMLesc.escapeTrans("Italic", lang) %></label><br>
	<input type="checkbox" id="fd-font-underline" onchange="fdChangeFont();" /><label for="fd-font-underline"><%= HTMLesc.escapeTrans("Underline", lang) %></label><br>
	<input type="checkbox" id="fd-font-outline" onchange="fdChangeFont();" /><label for="fd-font-outline"><%= HTMLesc.escapeTrans("Outline", lang) %></label><br>
	<input type="checkbox" id="fd-font-shadow" onchange="fdChangeFont();" /><label for="fd-font-shadow"><%= HTMLesc.escapeTrans("Shadow", lang) %></label><br>
	<input type="checkbox" id="fd-font-condensed" onchange="fdChangeFont();" /><label for="fd-font-condensed"><%= HTMLesc.escapeTrans("Condensed", lang) %></label><br>
	<input type="checkbox" id="fd-font-extend" onchange="fdChangeFont();" /><label for="fd-font-extend"><%= HTMLesc.escapeTrans("Extend", lang) %></label>
	</fieldset>
	<br>
	<fieldset>
	<legend><%= HTMLesc.escapeTrans("TextAlign", lang) %>:</legend>
	   <input type="radio" id="fd-font-left" name="fd-font-dir" value="left" onchange="fdChangeFont();" />
	   <label for="fd-font-left"><%= HTMLesc.escapeTrans("Left", lang) %></label>
	   <input type="radio" id="fd-font-center" name="fd-font-dir" value="center" onchange="fdChangeFont();" />
	   <label for="fd-font-center"><%= HTMLesc.escapeTrans("Center", lang) %></label>
	   <input type="radio" id="fd-font-right" name="fd-font-dir" value="right" onchange="fdChangeFont();" />
	   <label for="fd-font-right"><%= HTMLesc.escapeTrans("Right", lang) %></label>
   </fieldset>
</div>
<br>
<button id="fontDialogOK" onClick="fontDialogOK();">OK</button>
</div>

<!-- CONTENT EDITOR -->
<div id="contentEditor" style="display:none;">
<div>
<textarea id=contentEditorArea style="width:300px; height:300px;"></textarea>
</div><br>
<button id="contentEditorOK" onClick="contentEditorOK();">Save</button>
</div>


<!-- PAINT SCALE SELECTION DIALOG -->
<div id="paintScaleDialog" style="display:none">
Width: <input type="number" id="paintScaleWidth" onChange="paintScaleChange()" onKeyUp="paintScaleChange()"/>%<br>
Height: <input type="number" id="paintScaleHeight" onChange="paintScaleChange()" onKeyUp="paintScaleChange()"/>%<br>
<button onClick="paintScaleCancel()">Cancel</button>
<button onClick="paintScaleOK()">OK</button>
</div>

<!-- RESOURCE EDITOR -->
<div id="resourceEditor" style="z-index:200;display:none;position:absolute;left:50%;margin-left:-384px;height:100%;width:768px;-webkit-box-shadow:0px -48px 16px #000;">
<div id=rsrcTitleListDiv class="ui-widget-content" style="position:absolute;width:152px;left:0px;height:100%;top:-207px;padding-top:207px;padding-right:12px;box-sizing:border-box;overflow-y:scroll">
	<div id="rsrcTitleList">
	</div>
</div>
<div id=rsrcListLeftDiv class="ui-widget-content" style="display:none;position:absolute;width:152px;left:0px;height:100%;top:-207px;padding-top:207px;box-sizing:border-box;">
	<div style="height:100%;">
		<button id=rsrcListReturn onClick='selectRsrcTitle();event.preventDefault();'>Return</button>
		<div id="rsrcListLeft" style="height:100%;overflow-y:scroll">
		</div>
	</div>
</div>
<div id=rsrcListCenterDiv class="ui-widget-content" style="position:absolute;width:618px;height:100%;top:-48px;padding-top:48px;left:151px;box-sizing:border-box;overflow-y:scroll;white-space:nowrap;" onScroll="rsrcListCenterScroll();">
	<div id="rsrcListCenter">
	</div>
</div>
<div id=rsrcThumb class="ui-widget-content" style="position:absolute;left:0px;top:100%;margin-top:-208px;height:160px;width:152px;box-sizing:border-box;">
</div>
<div id=rsrcMain class="ui-widget-content" style="display:none;position:absolute;width:617px;height:100%;top:0px;left:151px;box-sizing:border-box;overflow:scroll;">
</div>
<div id="rsrcFooter" class="<%= masterEditMode?"H Footer":"Footer" %>">
	<div id="ref_main" style="margin-top:6px;width:100%;">
		<span id=ref_menu1>
			<button id="ref_btn0" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Edit3','ref_btn0');">Edit</button>
		</span>
		<span id=ref_menu2>
			<button id="ref_btn1" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Edit4','ref_btn1');">Edit</button>
			<button id="ref_btn2" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Tools2','ref_btn2');">Tools</button>
			<button id="ref_btn3" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Palette','ref_btn3');">Palette</button>
			<button id="ref_btn4" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Effect','ref_btn4');">Effect</button>
		</span>
		<span style="margin-left:50px;text-align:right;">
			<button id="ref_btn_close" onClick="rsrcEditorClose();">Close</button>
			<button id="ref_btn_select" onClick="rsrcEditorIconSelect();rsrcEditorClose();">Select</button>
			<button id="ref_btn_none" onClick="rsrcEditorIconSelect('none');rsrcEditorClose();">None</button>
		</span>
	</div>
</div>
</div>

<!-- RSRC ITEM DIALOG -->
<div id="rsrcItemDialog" style="display:none">
<span id="loginDialogMsg"></span><br>
Name: <input type="text" id="rsrcItemName" spellcheck=false onChange="rsrcInfoChange()" /><br>
ID: <input type="number" id="rsrcItemId" onChange="rsrcInfoChange()" /><br>
<span id="rsrcItemInfo"></span><br><br>
</div>

<!-- RSRC IMAGE SIZE DIALOG -->
<div id="rsrcImageSizeDialog" style="display:none;">
<span id="loginDialogMsg"></span><br>
Width: <input type="number" id="rsrcImageWidth" style="width:100px" />px<br>
Height: <input type="number" id="rsrcImageHeight" style="width:100px" />px<br>
<button onClick="rsrcImageSizeChange()">OK</button>
</div>

<!--■SCRIPT EDITOR-->
<div id="scriptEditor" class="scriptEditorBack" style="display:none;">
	<div id="scriptEditorTab">
		<ul>
		</ul>
	</div>
	<div id="scriptEditorPanel" class="ui-widget ui-widget-content ui-corner-all" style="height:120px;padding:4px;display:none;">
		<div id="scriptEditorPanelIn" style="background-color:#fff;border-radius:6px;width:100%;height:100%;overflow-y:scroll;"></div>
	</div>
	<div id="scriptEditorFooter" class="<%= masterEditMode?"H Footer":"Footer" %>">
		<div id="sef_main" style="margin-top:6px;width:100%;">
			<button id="sef_btn1" ontouchstart="this.onmousedown(event);event.preventDefault();" onmousedown="menubtn();openMenu('Script','sef_btn1');">Script</button>
			<span style="margin-left:50px;text-align:right;">
				<button id="sef_btn6" ontouchstart="toggleScriptPanel();event.preventDefault();" onmousedown="toggleScriptPanel();">Panel</button>
				<button id="sef_btn7" onClick="convertHT2('close');">Save</button>
			</span>
		</div>
	</div>
</div>
<div id="scriptAreaDummy" style="display:none;"><div contentEditable=true></div></div>

<!--■ANSWER DIALOG-->
<div id="answerDialog" class="info" style="display:none;padding:5px;padding-bottom:50px;">
	<div style="width:100%;overflow-y:scroll;">
		<div id="answerMsg"></div>
		<div style="position:absolute;width:100%;top:100%;margin-top:-40px;text-align:center;">
			<button id=answerBtn3 onClick="hideAnswerDialog(this.childNodes[0].textContent);" ontouchend="event.preventDefault();"></button>
			<button id=answerBtn2 onClick="hideAnswerDialog(this.childNodes[0].textContent);" ontouchend="event.preventDefault();"></button>
			<button id=answerBtn1 onClick="hideAnswerDialog(this.childNodes[0].textContent);" ontouchend="event.preventDefault();">OK</button>
		</div>
	</div>
</div>

<!--■ASK DIALOG-->
<div id="askDialog" class="info" style="display:none">
	<div style="width:100%;overflow-y:scroll;padding:10px;">
		<div id="askMsg"></div>
		<input type="text" id="askValue" style="margin-left:5%; width:90%;" />
		<div style="text-align:center;">
			<button id=askBtn2 onClick="hideAskDialog(this.childNodes[0].textContent);" ontouchend="event.preventDefault();">Cancel</button>
			<button id=askBtn1 onClick="hideAskDialog(this.childNodes[0].textContent);" ontouchend="event.preventDefault();">OK</button>
		</div>
	</div>
</div>

<!--■COLOR PALETTE-->
<div class="messageBox" id="colorPalette" style="z-index:102; cursor:default; display:none; position: absolute; width:200px; height:340px; left:0px; top:0px;">
<div class="smallTitleBar" style="position:absolute; width:200px; height: 18px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<div id="colorPaletteMain" style="overflow:hidden;margin-top:16px;">
	<div style="position:abosolute; background:#888; width:200px;height:20px;"></div>
	<div style="float:left; margin-top:-18px;">
		<div id=plt-stroke style="float:left; text-align:center; background:#eee; margin-left:1px; width:65px;height:18px;border-radius:4px 4px 0px 0px;" onclick="setColorPaletteTab('stroke');drawColorPalette();">Stroke</div>
		<div id=plt-fill style="float:left; text-align:center; background:#aaa; margin-left:1px; width:0px;height:18px;border-radius:4px 4px 0px 0px;" onclick="setColorPaletteTab('fill');drawColorPalette();">Fill</div>
		<div id=plt-brush style="float:left; text-align:center; background:#aaa; margin-left:1px; width:0px;height:18px;border-radius:4px 4px 0px 0px;" onclick="setColorPaletteTab('brush');drawColorPalette();">Style</div>
		<div id=plt-font style="float:left; text-align:center; background:#aaa; margin-left:1px; width:0px;height:18px;border-radius:4px 4px 0px 0px;" onclick="setColorPaletteTab('font');">Font</div>
	</div>
	<div id=pltTabColor style="position:absolute">
		<div>
			<button id="plt-tab-color" style="background-color:#8cf; width:24px;height:24px;" onclick="setColorPaletteColorMode('color');">&nbsp;</button>
			<button id="plt-tab-linear" style="background:-webkit-gradient(linear, left top, right bottom, from(#999), to(#8df)); background:-moz-linear-gradient(top, #999, #8df); width:24px;height:24px;" onclick="setColorPaletteColorMode('linear');">&nbsp;</button>
			<button id="plt-tab-radial" style="background:-webkit-gradient(radial, center center, 2, center center, 12, from(#999), to(#8cf)); background:-moz-radial-gradient(center 45deg, circle closest-side, #999 0%, #8df 100%); width:24px;height:24px;" onclick="setColorPaletteColorMode('radial');">&nbsp;</button>
			<button id="plt-tab-pattern" style="background:url('img/plt_pattern.png'); width:24px;height:24px;"  onclick="setColorPaletteColorMode('pattern');">&nbsp;</button>
			<button id="plt-tab-nofill" style="background:#fff; width:24px;height:24px;"  onclick="setColorPaletteColorMode('nofill');">&nbsp;</button>
		</div>
		<canvas id="plt-grad" width=180 height=180 style="margin-left:10px;position:absolute;top:30px;"></canvas>
		<span id=grad-colors style="overflow:visible; position:absolute;top:30px;margin-left:10px;width:180px;height:180px;"></span>
		<span id=grad-buttons style="position:absolute;top:220px;margin-left:10px;font-size:0.8em;width:180px;height:60px;">
			<input type="button" value="remove point" onclick="removeGradPoint()" />
			<input type="button" value="add point" onclick="addGradPoint()" /><br>
			<span id=radialwidth>
			Start width:<input type="range" id="radialWidth-start" style="width:100px;" max=255 onchange="changeRadialWidth('start')" />
			End width:<input type="range" id="radialWidth-end" style="width:100px;" max=255 onchange="changeRadialWidth('end')" />
			</span>
		</span>
		
		<div id="plt-patterns" style="overflow-y:scroll;position:absolute;top:30px;width:200px;height:180px;"></div>
		<span id=plt-ptn-btns style="position:absolute;top:220px;margin-left:10px;font-size:0.8em;width:180px;height:60px;">
			<input type="button" value="New Texture" onclick="createNewTexture()" disabled /><br>
			<input type="checkbox" id="ptn-scaleToFit" onchange="changeScaleToFitPattern()" /><label for="ptn-scaleToFit">Scale to fit</label><br>
			Scale:<input type="range" id="ptn-scale" style="width:100px;" min=0.2 max=8.0 step=0.1 onchange="changeScalePattern()" />
		</span>

		<canvas id="plt-canvas" width=180 height=180 style="margin-left:10px;top:36px;"></canvas>
		<span id=backcolor style="z-index:103;position:absolute;top:30px;width:11px;height:11px;"><svg><circle cx="5" cy="5" r=5 stroke="#ffffff" width="10" height="10"/><circle cx="5" cy="5" r=5 fill="#ffff00" stroke="#000000" width="10" height="10" stroke-dasharray="1 2"/></svg></span>
		<span id=forecolor style="z-index:103;position:absolute;top:30px;width:11px;height:11px;"><svg><circle cx="5" cy="5" r=5 stroke="#ffffff" width="10" height="10"/><circle cx="5" cy="5" r=5 fill="#ffff00" stroke="#000000" width="10" height="10" stroke-dasharray="2 1"/></svg></span>
		<span style="white-space:nowrap">■<input type="range" id="plt-brightness" min=0 max=255 value=255 style="width:160px;" onchange="changeBrightness(this.value,'plt-canvas');"/>□</span>
		<input type="range" id="plt-opacity" style="width:180px;margin-left:10px;" min=0 max=255 value=255 onchange="changeOpacity('plt-canvas');" />
		<div style="float:left; margin-left:10px; width:70px;white-space:nowrap;">
			<span id="forecolorRect">■</span><input id="forecolorStr" style="font-family:monospace;font-size:10px;width:50px;" value=#000000 onchange="changeColorStr('forecolor');" ontouchstart="this.focus();" spellcheck=false><br>
			<span id="backcolorRect">■</span><input id="backcolorStr" style="font-family:monospace;font-size:10px;width:50px;" value=#ffffff onchange="changeColorStr('backcolor');" ontouchstart="this.focus();" spellcheck=false>
		</div>
		<div style="float:left;width:100px;">
			<select id="plt-level" style="width:90px;margin-left:10px;" onchange="changeLevel('plt-canvas');">
				<option>4level
				<option>8level
				<option selected>256level
				<option>vivid
				<option>pastel
				<option>sepia
			</select>
		</div>
	</div>
	<div id=pltTabBrush style="position:absolute">
		Size:<input type="number" id="plt-brushSize" style="width:50px;" min=1 max=64 value=3 onchange="changeBrush();" onclick="changeBrush();" />
		<br>
		Style:<select id="plt-brushStyle" style="width:90px;margin-left:10px;" onchange="changeBrush();">
			<option>butt
			<option selected>round
			<option>square
		</select>
		<br>
		Texture:<select id="plt-brushTexture" style="width:90px;margin-left:10px;" onchange="changeBrush();">
			<option selected>none
			<option>paper
			<option>hairline
			<option>cloth
			<option>1
			<option>2
			<option>3
			<option>4
			<option>5
			<option>6
			<option>7
			<option>8
			<option>9
			<option>10
			<option>11
			<option>12
			<option>13
			<option>14
			<option>15
			<option>16
			<option>17
			<option>18
			<option>19
			<option>20
			<option>21
			<option>22
			<option>23
			<option>24
			<option>25
			<option>26
			<option>27
			<option>28
			<option>29
			<option>30
			<option>31
			<option>32
			<option>33
			<option>34
			<option>35
			<option>36
			<option>37
			<option>38
			<option>39
			<option>40
		</select><br>
		<canvas id=textureCanvas width=32 height=32></canvas>
	</div>
	<div id=pltTabFont style="position:absolute">
		<select id="plt-fontname" style="width:170px;margin-left:10px;" onchange="changeFont();">
			<option>serif
			<option selected>sans-serif
			<option>cursive
			<option>monospace
			<option>-
			<option>other…
		</select>
		<br>
		Size:<input type="number" id="plt-fontSize" style="width:50px;" min=3 max=255 value=12 onchange="changeFont();" onclick="changeFont();" />
		<br>
		<fieldset><legend>Style:</legend>
		<input type="checkbox" id="font-bold" onchange="changeFont()" /><label for="font-bold">bold</label><br>
		<input type="checkbox" id="font-italic" onchange="changeFont()" /><label for="font-italic">italic</label><br>
		<input type="checkbox" id="font-outline" onchange="changeFont()" /><label for="font-outline">outline</label><br>
		<input type="checkbox" id="font-shadow" onchange="changeFont()" /><label for="font-shadow">shadow</label>
		</fieldset>
	</div>
</div>
</div>

<!-- UPLOAD FILE DIALOG -->
<div id="uploadFileDialog" style="display:none">
<iframe id="uploadFileFrame">
</iframe>
</div>

<!-- HELP DIALOG -->
<div id="helpDialog" style="display:none">
<a href="./help.jsp" ontouchstart="this.click();" target="helpWindow"><%= HTMLesc.escapeTrans("Open Help Page", lang) %></a><br>
<a href="./scriptreference/" ontouchstart="this.click();" target="helpWindow2"><%= HTMLesc.escapeTrans("Open Script Reference", lang) %></a>
</div>

<!-- AJAX LOGIN DIALOG -->
<div id="loginDialog" style="display:none">
<form id="loginForm" action="login" method="post">
<span id="loginDialogMsg"></span><br>
<input id="ajaxlogin" type="text" name="user" value="" maxlength="15" spellcheck=false  placeholder="<%= HTMLesc.escapeTrans("User ID", lang) %>" /><br>
<input type="password"  name="password" value="" placeholder="<%= HTMLesc.escapeTrans("Password", lang) %>" /><br>
<input type="submit" value="<%= HTMLesc.escapeTrans("Login", lang) %>" />
</form>
</div>

</div>
</body>
</html>


