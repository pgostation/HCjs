<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.*" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="sInfo" scope="page" class="javabeans.stackInfo"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
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
		String cssStr = xmap.get("css");

		String initialWidthStr = xmap.get("width");
		if(initialWidthStr==null) initialWidthStr = "512";
		String initialScaleStr = "1.5";
		{
			int deviceWidth = 768;
			if(request.getHeader("user-agent").contains("iPhone")){deviceWidth=320;}
			if(request.getHeader("user-agent").contains("iPad")){deviceWidth=768;}
			double scale = Double.valueOf(deviceWidth)/Double.valueOf(initialWidthStr);
			initialScaleStr = (Double.toString(scale)+".0").substring(0,3);
		}
		
		String iconStr=xmap.get("icon");
		if(iconStr==null) iconStr="img/logo.png";
		
		if(cssStr==null) cssStr="default";
%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<!--<meta name="viewport" content="width=512, initial-scale=1.5, maximum-scale=2.0, user-scalable=0"/>-->
<!--<meta name="viewport" content="width=512, initial-scale=2.0"/>-->
<meta name="viewport" content="width=<%= initialWidthStr  %>, initial-scale=<%= initialScaleStr %>"/>

<meta name="apple-mobile-web-app-capable" content="yes" />
<!--<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />-->
<link rel="apple-touch-icon" href="<%= iconStr %>" />

<title><%= jaNameHTML %></title>

<link rel="stylesheet" href="css/<%= cssStr %>/stack.css">
<link rel="stylesheet" href="css/<%= cssStr %>/menu.css">
<link rel="stylesheet" href="css/<%= cssStr %>/ios.css">

<script defer src="jsold/stack.js"></script>
<script defer src="jsold/menu.js"></script>
<script async src="jsold/authoring.js"></script>
<script defer src="jsold/commands.js"></script>
<script defer src="jsold/property.js"></script>
<script defer src="jsold/rsrc.js"></script>
<script async src="jsold/paint.js"></script>
<script defer src="jsold/mainMsg.js"></script>

<script>
var userParameter = "<%= authorStr %>";
var nameParameter = "<%= jaNamePath.replaceAll("\\\\","\\\\\\\\").replaceAll("\"","\\\\\"") %>";
//var stackPath = encodeURI("user/"+userParameter+"/stack/"+nameParameter+"/");
var selectedTool = 'browse';
</script>

</head>
<body onLoad="onLoadExec();" draggable=false>

<div id="page" style="width:100%; height:100%;position:absolute;" draggable=false>

<canvas id="tempCanvas" style="position:absolute;visibility:hidden;" width=32 height=32></canvas>
<header id="globalHeader">
<nav onSelectStart="return false;">
<div id="menuback" class="menuback">&nbsp;</div>
<ul id="menus">
<li class="menu" id="file">File
<ul class="menuitems" id="filemenus">
<!--		<li class="menuitem">New Stack…</li>-->
<!--<li class="menuitem">Open Stack…</li>
	<li class="menuitem">Open Recent Stack<span style="text-align:right; font-size:80%; margin-left:5px; margin-right:-16px;">▶</span>
		<ul class="submenu">
		<li class="menuitem">test1</li>
		<li class="menuitem">test2</li>
		<li class="menuitem">test3</li>
		</ul>
	</li>-->
<!--	<li class="menuitem">Close Stack</li>-->
<!--	<li class="menuitem">Save a Copy…</li>-->
<!--	<li class="menuseparetor"></li>-->
<!--	<li class="menuitem">Compact Stack</li>-->
<!--	<li class="menuitem">Protect Stack…</li>-->
<!--	<li class="menuitem">Delete Stack…</li>-->
<!--	<li class="menuseparetor"></li>-->
<!--	<li class="menuitem">Print…</li>-->
<!--	<li class="menuseparetor"></li>-->
	<li class="menuitem">About HCjs…</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Quit</li>
</ul>
</li>
<li class="menu" id="edit">Edit
<ul class="menuitems">
	<li class="menuitem" id="undomenu">Undo</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Cut</li>
	<li class="menuitem">Copy</li>
	<li class="menuitem">Paste</li>
	<li class="menuitem">Delete</li>
	<li class="menuitem">Clipboard</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">New Card</li>
	<li class="menuitem">New Background</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Background</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Icon…</li>
</ul>
</li>
<li class="menu" id="go">Go
<ul class="menuitems">
	<li class="menuitem">Back</li>
<!--	<li class="menuitem">Home</li>-->
	<li class="menuitem">Help</li>
	<li class="menuitem">Recent</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">First</li>
	<li class="menuitem">Prev</li>
	<li class="menuitem">Next</li>
	<li class="menuitem">Last</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Find…</li>
	<li class="menuitem">Message</li>
	<li class="menuitem">Navigator</li>
	<!--<li class="menuitem">Full Screen</li>-->
<!--	<li class="menuitem">Next Window</li>-->
</ul>
</li>
<li class="menu" id="tools">Tools
<div class="messageBox" id="tool-window" onmouseout="toolPltMouseOut(event);" onmousedown="toolPltMouseDown(event);" onmouseup="toolPltMouseDown(event);document.getElementById('tool-window2').style.visibility='hidden';" style="position: absolute; left:140px; top:21px; visibility:hidden; width: 96px; height:160px; ">
<button type="button" class="roundrectH" id="button-nav-browse" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-browse');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-browse');execMenu('tb_browse');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-browse');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-browse');" 
 style="position:absolute; left:0px; top:0px; width:32px; height:32px;padding:0px;"><img src="img/tb_Browse.png"></button>
<button type="button" class="roundrect" id="button-nav-button" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-button');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-button');execMenu('tb_button');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-button');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-button');" 
 style="position:absolute; left:32px; top:0px; width:32px; height:32px;padding:0px;"><img src="img/tb_Button.png"></button>
<button type="button" class="roundrect" id="button-nav-field" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-field');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-field');execMenu('tb_field');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-field');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-field');" 
 style="position:absolute; left:64px; top:0px; width:32px; height:32px;padding:0px;"><img src="img/tb_Field.png"></button>
<button type="button" class="roundrect" id="button-nav-select" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-select');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-select');execMenu('tb_select');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-select');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-select');" 
 style="position:absolute; left:0px; top:32px; width:32px; height:32px;padding:0px;"><img src="img/tb_Select.png"></button>
<button type="button" class="roundrect" id="button-nav-lasso" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-lasso');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-lasso');execMenu('tb_lasso');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-lasso');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-lasso');" 
 style="position:absolute; left:32px; top:32px; width:32px; height:32px;padding:0px;"><img src="img/tb_Lasso.png"></button>
<button type="button" class="roundrect" id="button-nav-magicwand" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-magicwand');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-magicwand');execMenu('tb_magicwand');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-magicwand');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-magicwand');" 
 style="position:absolute; left:64px; top:32px; width:32px; height:32px;padding:0px;"><img src="img/tb_MagicWand.png"></button>
<button type="button" class="roundrect" id="button-nav-pencil" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-pencil');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-pencil');execMenu('tb_pencil');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-pencil');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-pencil');" 
 style="position:absolute; left:0px; top:64px; width:32px; height:32px;padding:0px;"><img src="img/tb_Pencil.png"></button>
<button type="button" class="roundrect" id="button-nav-brush" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-brush');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-brush');execMenu('tb_brush');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-brush');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-brush');" 
 style="position:absolute; left:32px; top:64px; width:32px; height:32px;padding:0px;"><img src="img/tb_Brush.png"></button>
<button type="button" class="roundrect" id="button-nav-eraser" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-eraser');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-eraser');execMenu('tb_eraser');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-eraser');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-eraser');" 
 style="position:absolute; left:64px; top:64px; width:32px; height:32px;padding:0px;"><img src="img/tb_Eraser.png"></button>
<button type="button" class="roundrect" id="button-nav-line" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-line');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-line');execMenu('tb_line');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-line');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-line');" 
 style="position:absolute; left:0px; top:96px; width:32px; height:32px;padding:0px;"><img src="img/tb_Line.png"></button>
<button type="button" class="roundrect" id="button-nav-rect" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-rect');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-rect');execMenu('tb_rect');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-rect');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-rect');" 
 style="position:absolute; left:32px; top:96px; width:32px; height:32px;padding:0px;"><img src="img/tb_Rect2.png"></button>
<button type="button" class="roundrect" id="button-nav-oval" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-oval');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-oval');execMenu('tb_oval');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-oval');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-oval');" 
 style="position:absolute; left:64px; top:96px; width:32px; height:32px;padding:0px;"><img src="img/tb_Oval2.png"></button>
<button type="button" class="roundrect" id="button-nav-paintbucket" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-paintbucket');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-paintbucket');execMenu('tb_paintbucket');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-paintbucket');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-paintbucket');" 
 style="position:absolute; left:0px; top:128px; width:32px; height:32px;padding:0px;"><img src="img/tb_PaintBucket.png"></button>
<button type="button" class="roundrect" id="button-nav-type" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-type');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-type');execMenu('tb_type');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav-type');" onmouseout="if('button-nav-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav-type');" 
 style="position:absolute; left:32px; top:128px; width:32px; height:32px;padding:0px;"><img src="img/tb_Type.png"></button>
</div>
</li>
<li class="menu" id="objectsmenu" style="visibility:hidden">Objects
<ul class="menuitems">
<!--	<li class="menuitem">Button Info…</li>-->
<!--	<li class="menuitem">Field Info…</li>-->
	<li class="menuitem">Card Info…</li>
	<li class="menuitem">Background Info…</li>
	<li class="menuitem">Stack Info…</li>
	<li class="menuseparetor"></li>
<!--		<li class="menuitem">New Button</li>-->
<!--		<li class="menuitem">New Field</li>-->
	<li class="menuitem">Objects Window…</li>
</ul>
</li>
<li class="menu" id="paintmenu" style="visibility:hidden">Paint
<ul class="menuitems">
	<li class="menuitem">Zoom in</li>
	<li class="menuitem">Zoom out</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Select All</li>
	<li class="menuitem">Reverse Selection</li>
	<li class="menuitem">Expand Selection</li>
	<li class="menuitem">Convert Color…</li>
	<li class="menuitem">Filter…</li>
	<li class="menuitem">Scale Selection…</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Fill</li>
	<li class="menuitem">Invert</li>
	<li class="menuitem">Pickup</li>
	<li class="menuitem">Darken</li>
	<li class="menuitem">Lighten</li>
	<li class="menuitem">Rotate Left</li>
	<li class="menuitem">Rotate Right</li>
	<li class="menuitem">Flip Horizontal</li>
	<li class="menuitem">Flip Vertical</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Opaque</li>
	<li class="menuitem">Transparent</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Export Image…</li>
</ul>
</li>
</ul>
<div style="z-index:999;position:absolute; margin-left:-30px;left:100%;top:2px;height:20px;"><img id="onlineIcon" src="img/i_online.svg" width=18 height=18 /></div>
</nav>

<!-- / #globalHeader --></header>

<div id='dontclick'></div>

<div id="main">

<section class="cardBack" style="width: 20px; height: 20px; margin-left: -10px; margin-top: -10px;">
<div class="cardBack" id="cardBack" style="width:  20px; height: 20px;">

<!-- / .cardBack --></div>
</section>

<!-- ■TOOL PALETTE(FLOATING) -->
<div class="messageBox" id="tool-window2"  onSelectStart="return false;" onmousedown="toolPltMouseDown(event);" onmouseup="toolPltMouseDown(event);" style="position: absolute; visibility:hidden; width: 96px; height:172px; z-index:101">
<div class="smallTitleBar" onmousedown="startMoveWindow(event,this);" onmouseup="endMoveWindow();" style="width:100%; height: 12px; visibility=hidden; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<button type="button" class="roundrectH" id="button-nav2-browse" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-browse');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-browse');" onclick="execMenu('tb_browse');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-browse');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-browse');" 
 style="position:absolute; left:0px; top:12px; width:32px; height:32px;padding:0px;"><img src="img/tb_Browse.png"></button>
<button type="button" class="roundrect" id="button-nav2-button" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-button');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-button');" onclick="execMenu('tb_button');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-button');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-button');" 
 style="position:absolute; left:32px; top:12px; width:32px; height:32px;padding:0px;"><img src="img/tb_Button.png"></button>
<button type="button" class="roundrect" id="button-nav2-field" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-field');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-field');" onclick="execMenu('tb_field');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-field');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-field');" 
 style="position:absolute; left:64px; top:12px; width:32px; height:32px;padding:0px;"><img src="img/tb_Field.png"></button>
<button type="button" class="roundrect" id="button-nav2-select" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-select');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-select');" onclick="execMenu('tb_select');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-select');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-select');" 
 style="position:absolute; left:0px; top:44px; width:32px; height:32px;padding:0px;"><img src="img/tb_Select.png"></button>
<button type="button" class="roundrect" id="button-nav2-lasso" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-lasso');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-lasso');" onclick="execMenu('tb_lasso');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-lasso');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-lasso');" 
 style="position:absolute; left:32px; top:44px; width:32px; height:32px;padding:0px;"><img src="img/tb_Lasso.png"></button>
<button type="button" class="roundrect" id="button-nav2-magicwand" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-magicwand');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-magicwand');" onclick="execMenu('tb_magicwand');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-magicwand');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-magicwand');" 
 style="position:absolute; left:64px; top:44px; width:32px; height:32px;padding:0px;"><img src="img/tb_MagicWand.png"></button>
<button type="button" class="roundrect" id="button-nav2-pencil" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-pencil');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-pencil');" onclick="execMenu('tb_pencil');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-pencil');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-pencil');" 
 style="position:absolute; left:0px; top:76px; width:32px; height:32px;padding:0px;"><img src="img/tb_Pencil.png"></button>
<button type="button" class="roundrect" id="button-nav2-brush" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-brush');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-brush');" onclick="execMenu('tb_brush');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-brush');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-brush');" 
 style="position:absolute; left:32px; top:76px; width:32px; height:32px;padding:0px;"><img src="img/tb_Brush.png"></button>
<button type="button" class="roundrect" id="button-nav2-eraser" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-eraser');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-eraser');" onclick="execMenu('tb_eraser');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-eraser');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-eraser');" 
 style="position:absolute; left:64px; top:76px; width:32px; height:32px;padding:0px;"><img src="img/tb_Eraser.png"></button>
<button type="button" class="roundrect" id="button-nav2-line" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-line');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-line');" onclick="execMenu('tb_line');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-line');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-line');" 
 style="position:absolute; left:0px; top:108px; width:32px; height:32px;padding:0px;"><img src="img/tb_Line.png"></button>
<button type="button" class="roundrect" id="button-nav2-rect" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-rect');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-rect');" onclick="execMenu('tb_rect');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-rect');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-rect');" 
 style="position:absolute; left:32px; top:108px; width:32px; height:32px;padding:0px;"><img src="img/tb_Rect2.png"></button>
<button type="button" class="roundrect" id="button-nav2-oval" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-oval');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-oval');" onclick="execMenu('tb_oval');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-oval');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-oval');" 
 style="position:absolute; left:64px; top:108px; width:32px; height:32px;padding:0px;"><img src="img/tb_Oval2.png"></button>
<button type="button" class="roundrect" id="button-nav2-paintbucket" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-paintbucket');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-paintbucket');" onclick="execMenu('tb_paintbucket');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-paintbucket');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-paintbucket');" 
 style="position:absolute; left:0px; top:140px; width:32px; height:32px;padding:0px;"><img src="img/tb_PaintBucket.png"></button>
<button type="button" class="roundrect" id="button-nav2-type" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav2-type');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav2-type');" onclick="execMenu('tb_type');"
 onmouseover="buttonDef1.mouseDownRRect(event,'button-nav2-type');" onmouseout="if('button-nav2-'+selectedTool!=this.id)buttonDef1.mouseOutRRect(event,'button-nav2-type');" 
 style="position:absolute; left:32px; top:140px; width:32px; height:32px;padding:0px;"><img src="img/tb_Type.png"></button>
</div>

<!-- ■BUTTON PALETTE -->
<div class="messageBox" id="button-palette" onSelectStart="return false;" style="z-index:102; visibility:hidden; position: absolute; width: 400px; height:52px; ">
<div class="smallTitleBar" onmousedown="startMoveWindow(event,this);" onmouseup="endMoveWindow();" style="width:100%; height: 12px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<button type="button" class="transparent" style="padding:0px; position:absolute; left:0px; top:12px; width:40px; height:40px;">透明</button>
<div id="btn-plt-transparent"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:0px; top:12px; width:40px; height:40px;" draggable=true></div>
<button type="button" class="opaque" style="padding:0px; position:absolute; left:40px; top:12px; width:40px; height:40px;">不透明</button>
<div id="btn-plt-opaque"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:40px; top:12px; width:40px; height:40px;" draggable=true></div>
<button type="button" class="rectangle" style="padding:0px; position:absolute; left:80px; top:12px; width:40px; height:40px;">長方形</button>
<div id="btn-plt-rectangle"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:80px; top:12px; width:40px; height:40px;" draggable=true></div>
<button type="button" class="roundrect" style="padding:0px; position:absolute; left:120px; top:12px; width:40px; height:40px;"><small>丸みのある長方形</small></button>
<div id="btn-plt-roundrect"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:120px; top:12px; width:40px; height:40px;" draggable=true></div>
<button type="button" class="shadow" style="padding:0px; position:absolute; left:160px; top:12px; width:40px; height:40px;">シャドウ</button>
<div id="btn-plt-shadow"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:160px; top:12px; width:40px; height:40px;" draggable=true></div>
<button type="button" class="standard" style="padding:0px; position:absolute; left:200px; top:12px; width:40px; height:40px;">標準</button>
<div id="btn-plt-standard"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:200px; top:12px; width:40px; height:40px;" draggable=true></div>
<input type="radio" class="radio" style="padding:0px; position:absolute; left:250px; top:24px;" checked>
<div id="btn-plt-radio"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:240px; top:12px; width:40px; height:40px;" draggable=true></div>
<input type="checkbox" class="checkbox" style="padding:0px; position:absolute; left:290px; top:24px;" checked>
<div id="btn-plt-checkbox"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:280px; top:12px; width:40px; height:40px;" draggable=true></div>
<select class="popup" style="padding:0px; position:absolute; left:320px; top:20px;"></select>
<div id="btn-plt-popup"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:320px; top:12px; width:40px; height:40px;" draggable=true></div>
<input type="range" class="range" style="padding:0px; position:absolute; left:360px; top:20px; width:40px;">
<div id="btn-plt-range"  ondragstart="btnDragStart(event);" draggable=true style="position:absolute; left:360px; top:12px; width:40px; height:40px;" draggable=true></div>
</div>

<!-- ■FIELD PALETTE -->
<div class="messageBox" id="field-palette" onSelectStart="return false;" style="z-index:102; visibility:hidden; position: absolute; width: 300px; height:72px; ">
<div class="smallTitleBar" onmousedown="startMoveWindow(event,this);" onmouseup="endMoveWindow();" style="width:100%; height: 12px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<div class="transparent" id="fld-plt-transparent" 
 ondragstart="fldDragStart(event);"  draggable=true
 style="position:absolute; left:0px; top:12px; width:60px; height:60px;" draggable=true>透明</div>
<div class="opaque" id="fld-plt-opaque" 
 ondragstart="fldDragStart(event);"  draggable=true
 style="position:absolute; left:60px; top:12px; width:60px; height:60px;" draggable=true>不透明</div>
<div class="rectangle" id="fld-plt-rectangle" 
 ondragstart="fldDragStart(event);"  draggable=true
 style="position:absolute; left:120px; top:12px; width:60px; height:60px;" draggable=true>長方形</div>
<div class="shadow" id="fld-plt-shadow" 
 ondragstart="fldDragStart(event);"  draggable=true
 style="position:absolute; left:180px; top:12px; width:60px; height:60px;" draggable=true>シャドウ</div>
<div class="scrolling" id="fld-plt-scrolling" 
 ondragstart="fldDragStart(event);"  draggable=true
 style="position:absolute; left:240px; top:12px; width:60px; height:60px;" draggable=true>スクロール</div>
</div>

<!--■NAV Palette-->
<div class="messageBox" id="nav-palette" onSelectStart="return false;" style="z-index:102; visibility:hidden; position: absolute; width: 160px; height:52px; ">
<div class="smallTitleBar" onmousedown="startMoveWindow(event,this);" onmouseup="endMoveWindow();" style="width:100%; height: 12px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<button type="button" class="roundrect" id="button-nav-first" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-first');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-first');execMenu('first');"
 onmouseover="buttonDef1.mouseOverRRect(event,'button-nav-first');" onmouseout="buttonDef1.mouseOutRRect(event,'button-nav-first');" 
 style="position:absolute; left:0px; top:12px; width:40px; height:40px;">|◀</button>
<button type="button" class="roundrect" id="button-nav-prev" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-prev');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-prev');execMenu('prev');"
 onmouseover="buttonDef1.mouseOverRRect(event,'button-nav-prev');" onmouseout="buttonDef1.mouseOutRRect(event,'button-nav-prev');" 
 style="position:absolute; left:40px; top:12px; width:40px; height:40px;">◀</button>
<button type="button" class="roundrect" id="button-nav-next" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-next');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-next');execMenu('next');"
 onmouseover="buttonDef1.mouseOverRRect(event,'button-nav-next');" onmouseout="buttonDef1.mouseOutRRect(event,'button-nav-next');" 
 style="position:absolute; left:80px; top:12px; width:40px; height:40px;">▶</button>
<button type="button" class="roundrect" id="button-nav-last" 
onmousedown="buttonDef1.mouseDownRRect(event,'button-nav-last');" onmouseup="buttonDef1.mouseUpRRect(event,'button-nav-last');execMenu('last');"
 onmouseover="buttonDef1.mouseOverRRect(event,'button-nav-last');" onmouseout="buttonDef1.mouseOutRRect(event,'button-nav-last');" 
 style="position:absolute; left:120px; top:12px; width:40px; height:40px;">▶|</button>
</div>

<!--■MSG BOX-->
<div class="messageBox" onSelectStart="return false;" style="z-index:102; visibility:hidden; position: absolute; width: 512px; height:32px; ">
<div class="smallTitleBar" onmousedown="startMoveWindow(event,this);" onmouseup="endMoveWindow();" style="width:100%; height: 12px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<div style="top: 0%;"><input type="text" id="messagebox" name="messageBox" style="position: absolute; height:16px; top: 11px; left:0%;
 width:500px; border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;"
 onchange="eval(this.value);"></div>
</div>

<div id="overrayBack" style="position:absolute; width:100%; height:100%; background-color:#666;opacity:0.1; visibility:hidden; z-index:2000;"  oncontextmenu="return false;"></div>

<!--■BUTTON INFO-->
<div id="buttonInfo" class="info" style="position:absolute; padding:10px; width:auto; height:auto; background-color:#fff;opacity:0.95; visibility:hidden; z-index:2001; border-radius:4px; box-shadow:1px 1px 10px #000; overflow:hidden;">
	<dl>
	<dt>名前:</dt>
		<dd><input type=text id=btnName size=32 style="font-size:1em;"><input type=checkbox id=btnShowname><label for=btnShowname>表示</label></dd>
	<dt>&nbsp;</dt>
		<dd><span id=btnObjectType>&nbsp;</span>    番号:<span id=btnNumber>1</span>  ID:<span id=btnId>1</span></dd>
	<dt>スタイル:</dt>
		<dd>
			<select id=btnStyle>
				<option>標準
				<option>透明
				<option>不透明
				<option>長方形
				<option>シャドウ
				<option>丸みのある長方形
				<option>省略時設定
				<option>楕円
				<option>ポップアップ
				<option>チェックボックス
				<option>ラジオボタン
				<!-- <option>検索-->
				<option>レンジ
			</select>
			<input type=button value="カスタマイズ…"><input type=number min=0 id="btnTitleWidth" style="width:0px;visibility:hidden;width:0px;">
		</dd>
	<dt>ファミリー:</dt>
		<dd><select id=btnFamily><option>なし<option>1<option>2<option>3<option>4<option>5<option>6<option>7<option>8<option>9<option>10<option>11<option>12<option>13<option>14<option>15</select></dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:10em;"><input type=checkbox id=btnEnabled><label for=btnEnabled>使えるように</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=btnAutoHilite><label for=btnAutoHilite>オートハイライト</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:10em;"><input type=checkbox id=btnVisible><label for=btnVisible>表示する</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=btnIconScaling><label for=btnIconScaling>アイコンの拡大</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:10em;"><input type=checkbox id=btnVertically><label for=btnVertically>縦書き</label></span>
		</dd>
	</dl>
	<div>&nbsp;<br>
		<input type=button id=btnFont value="フォント…">
		<input type=button id=btnIcon value="アイコン…">
		<input type=button id=btnScript value="スクリプト…" onclick="hideInfoDialog();scriptEditorBtn(tbSelectedButton);">
		<input type=button id=btnContent value="内容…">
	</div>
</div>

<!--■FIELD INFO-->
<div id="fieldInfo" class="info" style="position:absolute; padding:10px; width:auto; height:auto; background-color:#fff;opacity:0.95; visibility:hidden; z-index:2001; border-radius:4px; box-shadow:1px 1px 10px #000; overflow:hidden;">
	<dl>
	<dt>名前:</dt>
		<dd><input type=text id=fldName size=32 style="font-size:1em;"></dd>
	<dt>&nbsp;</dt>
		<dd><span id=fldObjectType>&nbsp;</span>    番号:<span id=fldNumber>1</span>  ID:<span id=fldId>1</span></dd>
	<dt>スタイル:</dt>
		<dd>
			<select id=fldStyle size=1>
				<option>標準
				<option>透明
				<option>不透明
				<option>長方形
				<option>シャドウ
				<option>スクロール
			</select>
			<input type=button value="カスタマイズ…">
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=fldLockedtext><label for=fldLockedtext>ロックテキスト</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=fldVisible><label for=fldVisible>表示する</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=fldDontwrap><label for=fldDontwrap>行を回り込ませない</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=fldAutoselect><label for=fldAutoselect>自動的に選択</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=fldWidemargins><label for=fldWidemargins>余白を広く</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=fldMultiplelines><label for=fldMultiplelines>複数行</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=fldFixedlineheight><label for=fldFixedlineheight>行の高さを固定</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=fldAutotab><label for=fldAutotab>オートタブ</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=fldShowlines><label for=fldShowlines>行表示</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=fldDontsearch><label for=fldDontsearch>検索しない</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:10em;"><input type=checkbox id=fldVertically><label for=fldVertically>縦書き</label></span>
		</dd>
	</dl>
	<dl>
	<dt>&nbsp;</dt>
	<dd>
		<span style="float:left;width:20em;">
		<input type=button id=fldFont value="フォント…">
		<input type=button id=fldScript value="スクリプト…" onclick="hideInfoDialog();scriptEditorFld(tbSelectedField);">
		</span>
	</dd>
	</dl>
	</div>
</div>

<!--■CARD INFO-->
<div id="cardInfo" class="info" style="position:absolute; padding:10px; width:auto; height:auto; background-color:#fff;opacity:0.95; visibility:hidden; z-index:2001; border-radius:4px; box-shadow:1px 1px 10px #000; overflow:hidden;">
	<dl>
	<dt>名前:</dt>
		<dd><input type=text id=cardName size=32 style="font-size:1em;"></dd>
	<dt>&nbsp;</dt>
		<dd><span id=cardObjectType>&nbsp;</span>    番号:<span id=cardNumber>1</span>  ID:<span id=cardId>1</span></dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=cardShowPicture><label for=cardShowPicture>ピクチャを表示</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=cardMarked><label for=cardMarked>マーク</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=cardCantDelete><label for=cardCantDelete>削除不可</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=cardDontsearch><label for=cardDontsearch>検索しない</label></span>
		</dd>
	</dl>
	<div>&nbsp;<br><br>	</div>
	<dl>
	<dt>&nbsp;</dt>
	<dd>
		<input type=button id=cardScript value="スクリプト…" onclick="hideInfoDialog();scriptEditorObj(currentCardObj);">
	</dd>
	</dl>
</div>

<!--■BACKGROUND INFO-->
<div id="bkgndInfo" class="info" style="position:absolute; padding:10px; width:auto; height:auto; background-color:#fff;opacity:0.95; visibility:hidden; z-index:2001; border-radius:4px; box-shadow:1px 1px 10px #000; overflow:hidden;">
	<dl>
	<dt>名前:</dt>
		<dd><input type=text id=bkgndName size=32 style="font-size:1em;"></dd>
	<dt>&nbsp;</dt>
		<dd><span id=bkgndObjectType>&nbsp;</span>    番号:<span id=bkgndNumber>1</span>  ID:<span id=bkgndId>1</span></dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=bkgndShowPicture><label for=bkgndShowPicture>ピクチャを表示</label></span>
		</dd>
	<dt>&nbsp;</dt>
		<dd>
			<span style="float:left;width:11em;"><input type=checkbox id=bkgndCantDelete><label for=bkgndCantDelete>削除不可</label></span>
			<span style="float:left;width:10em;"><input type=checkbox id=bkgndDontsearch><label for=bkgndDontsearch>検索しない</label></span>
		</dd>
	</dl>
	<div>&nbsp;<br><br>	</div>
	<dl>
	<dt>&nbsp;</dt>
	<dd>
		<input type=button id=bkgndScript value="スクリプト…" onclick="hideInfoDialog();scriptEditorObj(getBgData(currentCardObj.background));">
	</dd>
	</dl>
</div>

<!--■STACK INFO-->
<div id="stackInfo" class="info" style="position:absolute; padding:10px; width:auto; height:auto; background-color:#fff;opacity:0.95; visibility:hidden; z-index:2001; border-radius:4px; box-shadow:1px 1px 10px #000; overflow:hidden;">
	<dl><dt>名前:</dt>
		<dd><input type=text id=stackName size=32 style="font-size:1em;" readonly></dd>
	</dl>
	<div>&nbsp;<br><br></div>
	<dl>
	<dt>&nbsp;
	<dd>
		<input type=button id=stackScript value="スクリプト…" onclick="hideInfoDialog();scriptEditorObj(stackData);">
		<input type=button id=stackSize value="大きさ…" onclick="hideInfoDialog();showStackSizeDialog();">
	</dl>
</div>

<!--■SCRIPT EDITOR-->
<div id="scriptEditor" class="scriptEditor" style="position:absolute; left:1%; top:30px; width:98%; height:90%; background-color:#fff; visibility:hidden; z-index:2001; border-radius:4px; box-shadow:1px 1px 10px #000; ">
	<div style="width:100%; height:100%;margin:5px;">
		<div class="smallTitleBar" style="margin:-5px; width:100%; height: 20px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom, from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
		<div id=scriptAreaDiv>
		<div id="scriptArea" style="width:97%; height:47%; margin-left:1%; margin-top:1%; overflow:scroll; border:1px solid #000;" contentEditable=true ></div>
		<div id="scriptArea2" style="width:97%; height:47%; margin-left:1%; overflow:scroll; border:1px solid #000;" contentEditable=true></div>
		<!--<span class="scrHand">function mouseUp(){</span><br>
		<span class="indent"></span><span class="scrCmd">goCard(</span><span class="scrObj">next</span><span class="scrCmdEnd">);</span><span class=scrComment>//行をクリック(タップ)すると単語に分解する</span><br>
		<span class="indent"></span><span class="scrIf">if( cdBtn( x ) .hilite == true ){</span><br>
		<span class="indent"></span><span class="indent"></span><span class="scrCmd">wait 10</span><span class=scrComment>//基本的に1行がひとまとまり</span><br>
		<span class="indent"></span><span class="scrEndIf">}</span><br>
		<span class="scrEndHand">}</span>--></div>
		
		<input type=button onclick="saveScript();document.getElementById('scriptEditor').style.visibility='hidden';hideInfoDialog();" value="OK">
		<input type=button onclick="convertHT('scriptArea2','scriptArea');" value="convert">
	</div>
</div>

<!--■ANSWER DIALOG-->
<div id="answerDialog" class="info" style="position:absolute; background-color:#fff; visibility:hidden; z-index:2001; border-radius:4px; box-shadow:1px 1px 10px #000; ">
	<div style="width:400px;overflow-y:scroll;padding:10px;">
		<div id="answerMsg"></div>
		<div style="text-align:center;">
			<input type=button class=dialog id=answerBtn3 onclick="hideAnswerDialog(this.value);" onmousedown="this.className='dialogH';" onmouseup="this.className='dialog';" onmouseout="this.className='dialog';">
			<input type=button class=dialog id=answerBtn2 onclick="hideAnswerDialog(this.value);" onmousedown="this.className='dialogH';" onmouseup="this.className='dialog';" onmouseout="this.className='dialog';">
			<input type=button class=dialogDefault id=answerBtn1 onclick="hideAnswerDialog(this.value);" onmousedown="this.className='dialogH';" onmouseup="this.className='dialogDefault';" onmouseout="this.className='dialogDefault';" value="OK">
		</div>
	</div>
</div>

<!--■ASK DIALOG-->
<div id="askDialog" class="info" style="position:absolute; background-color:#fff; visibility:hidden; z-index:2001; border-radius:4px; box-shadow:1px 1px 10px #000; ">
	<div style="width:400px;overflow-y:scroll;padding:10px;">
		<div id="askMsg"></div>
		<input type="text" id="askValue" style="margin-left:5%; width:90%;"></div>
		<div style="text-align:center;">
			<input type=button class=dialog id=askBtn2 onclick="hideAskDialog(this.value);" onmousedown="this.className='dialogH';" onmouseup="this.className='dialog';" onmouseout="this.className='dialog';" value="Cancel">&nbsp;
			<input type=button class=dialogDefault id=askBtn1 onclick="hideAskDialog(this.value);" onmousedown="this.className='dialogH';" onmouseup="this.className='dialogDefault';" onmouseout="this.className='dialogDefault';" value="OK">
		</div>
	</div>
</div>

<!--■OBJECTS WINDOW-->
<div class="messageBox" id="objectsWindow" style="opacity:0.92; z-index:102; visibility:hidden; position: absolute; width: 320px; height:480px; left:0px; top:30px;">
<div class="smallTitleBar" onmousedown="startMoveWindow(event,this);" onmouseup="endMoveWindow();" style="position:absolute; width:320px; height: 12px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<div id="objectsWindowMain" style="border-radius:0px 0px 4px 4px;overflow-x:hidden;overflow-y:scroll;height:468px;margin-top:12px;"></div>
</div>

<ul id=owStackPop class="menuitems" style="z-index:2002;position:absolute;">
	<li class="menuitem">Information…</li>
	<li class="menuitem">Script…</li>
</ul>

<ul id=owBgPop class="menuitems" style="z-index:2002;position:absolute;">
	<li class="menuitem">Paste</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Information…</li>
	<li class="menuitem">Script…</li>
</ul>

<ul id=owCardPop class="menuitems" style="z-index:2002;position:absolute;">
	<li class="menuitem">Cut</li>
	<li class="menuitem">Copy</li>
	<li class="menuitem">Paste</li>
	<li class="menuitem">Delete</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Information…</li>
	<li class="menuitem">Script…</li>
</ul>

<ul id=owPartPop class="menuitems" style="z-index:2002;position:absolute;">
	<li class="menuitem">Cut</li>
	<li class="menuitem">Copy</li>
	<li class="menuitem">Paste</li>
	<li class="menuitem">Delete</li>
	<li class="menuseparetor"></li>
	<li class="menuitem">Information…</li>
	<li class="menuitem">Script…</li>
</ul>

<!--■COLOR PALETTE-->
<div class="messageBox" id="colorPalette" style="z-index:102; cursor:default; visibility:hidden; position: absolute; width:200px; height:340px; left:0px; top:0px;">
<div class="smallTitleBar" onmousedown="startMoveWindow(event,this);" onmouseup="endMoveWindow();" style="position:absolute; width:200px; height: 12px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<div id="colorPaletteMain" style="overflow:hidden;margin-top:12px;">
	<div style="position:abosolute; background:#888; width:200px;height:20px;"></div>
	<div style="float:left; margin-top:-18px;">
		<div id=plt-stroke style="float:left; text-align:center; background:#eee; margin-left:1px; width:65px;height:18px;border-radius:4px 4px 0px 0px;" onclick="setColorPaletteTab('stroke');drawColorPalette();">Stroke</div>
		<div id=plt-fill style="float:left; text-align:center; background:#aaa; margin-left:1px; width:0px;height:18px;border-radius:4px 4px 0px 0px;" onclick="setColorPaletteTab('fill');drawColorPalette();">Fill</div>
		<div id=plt-brush style="float:left; text-align:center; background:#aaa; margin-left:1px; width:0px;height:18px;border-radius:4px 4px 0px 0px;" onclick="setColorPaletteTab('brush');">Style</div>
		<div id=plt-font style="float:left; text-align:center; background:#aaa; margin-left:1px; width:0px;height:18px;border-radius:4px 4px 0px 0px;" onclick="setColorPaletteTab('font');">Font</div>
	</div>
	<div id=pltTabColor style="position:absolute">
		<div>
			<button id="plt-tab-color" style="background-color:#8cf; width:24px;height:24px;" onclick="setColorPaletteColorMode('color');">&nbsp;</button>
			<button id="plt-tab-linear" style="background:-webkit-gradient(linear, left top, right bottom, from(#999), to(#8df)); background:-moz-linear-gradient(top, #999, #8df); width:24px;height:24px;" onclick="setColorPaletteColorMode('linear');">&nbsp;</button>
			<button id="plt-tab-radial" style="background:-webkit-gradient(radial, center center, 2, center center, 12, from(#999), to(#8cf)); background:-moz-radial-gradient(center 45deg, circle closest-side, #999 0%, #8df 100%); width:24px;height:24px;" onclick="setColorPaletteColorMode('radial');">&nbsp;</button>
			<button id="plt-tab-pattern" style="background:url('img/plt_pattern.png'); width:24px;height:24px;"  onclick="setColorPaletteColorMode('pattern');">&nbsp;</button>
		</div>
		<canvas id="plt-grad" width=180 height=180 style="margin-left:10px;position:absolute;top:30px;"></canvas>
		<span id=grad-colors style="overflow:visible; position:absolute;top:30px;margin-left:10px;width:180px;height:180px;"><svg></svg></span>
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
		<span id=backcolor style="position:absolute;top:30px;width:7px;height:7px;"><svg><circle cx="3" cy="3" r=3 stroke="#ffffff" width="6" height="6"/><circle cx="3" cy="3" r=3 fill="#ffff00" stroke="#000000" width="6" height="6" stroke-dasharray="1 2"/></svg></span>
		<span id=forecolor style="position:absolute;top:30px;width:7px;height:7px;"><svg><circle cx="3" cy="3" r=3 stroke="#ffffff" width="6" height="6"/><circle cx="3" cy="3" r=3 fill="#ffff00" stroke="#000000" width="6" height="6" stroke-dasharray="2 1"/></svg></span>
		<span style="white-space:nowrap">■<input type="range" id="plt-brightness" min=0 max=255 value=255 style="width:160px;" onchange="changeBrightness(this.value,'plt-canvas');"/>□</span>
		<input type="range" id="plt-opacity" style="width:180px;margin-left:10px;" min=0 max=255 value=255 onchange="changeOpacity('plt-canvas');" />
		<div style="float:left; margin-left:10px; width:70px;white-space:nowrap;">
			<span id="forecolorRect">■</span><input id="forecolorStr" style="font-family:monospace;font-size:10px;width:50px;" value=#000000 onchange="changeColorStr('forecolor');" spellcheck=false><br>
			<span id="backcolorRect">■</span><input id="backcolorStr" style="font-family:monospace;font-size:10px;width:50px;" value=#ffffff onchange="changeColorStr('backcolor');" spellcheck=false>
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

<!--■CLIPBOARD-->
<div class="messageBox" id="clipWindow" style="z-index:102; visibility:hidden; position: absolute; width: 320px; height:320px; ">
<div class="smallTitleBar" onmousedown="startMoveWindow(event,this);" onmouseup="endMoveWindow();" style="width:100%; height: 12px; background-color:#ccc; background: -webkit-gradient(linear, left top, left bottom,
 from(#ddd), to(#aaa)); border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
<div style="top: 0%;"><div id="clipWindowMain" contentEditable=true style="height:308px;width:100%;background:white;-webkit-user-select:text;overflow:scroll;" spellcheck=false 
 onfocus="this.select();" onblur="changeClipBoard();"></div>
</div>

	</div>
</div>



<!-- / #main --></div>

<footer id="globalFooter">

<!-- / #globalFooter --></footer>

<!-- / #page --></div>
</body>
</html>