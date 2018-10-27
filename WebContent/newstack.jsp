<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.log" %>
<%@ page import="javabeans.xmapString" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="userInfo" scope="page" class="javabeans.userInfo"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
String sid = request.getSession().getId();
String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
if(userId==null || userId.equals("")){
	userId = sidBean.newGuestId(application.getRealPath(".."), request.getRemoteAddr(), request.getHeader("User-Agent"));
	response.addCookie(new Cookie("userId", userId));
}

String lang = "en";
String langStr = request.getHeader("accept-language");
if (langStr != null && langStr.startsWith("ja")) {
	lang = "ja";
}

//
String pathStr = getServletContext().getRealPath("..")+"/user/"+userId+"/_userinfo.xmap";
xmapString xmap = userInfo.getInfo(pathStr);
if(xmap==null){
	xmap = new xmapString("");
}

int userLevel = 0;
if(xmap!=null){
	String str = xmap.get("userLevel");
	if(str!=null){
		userLevel = Integer.valueOf(str);
	}
	if(userLevel<=1){
		userLevel = 2;
		xmap.set("userLevel","2");
		xmap.save(pathStr);
		//0:初期状態(他のスタック、チュートリアル見れる)
		//1:新規スタック作れる(チュートリアル見たことがある)
		//2:スタック一覧見れる、HyperCardから変換できる(新規スタック作ったことがある)
		//3:Finder見れる。チュートリアル消える(スタックが3個以上になる)
	}
}
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title>HCjs</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
	<link rel="stylesheet" href="css/dashboard.css" />
</head> 
<body>
<div data-role="page" data-add-back-btn="true">
	<div data-role="header" data-position="fixed">
		<h1><%= HTMLesc.escapeTrans("New Stack", lang) %></h1>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right"><%= HTMLesc.escapeTrans("Home", lang) %></a>
	</div>
	<div id="main0" data-role="content">
		<form id="form1" method="POST" action="createstack" data-ajax="false">
		<div>
			<div>
			<%= HTMLesc.escapeTrans("Name", lang) %>:<input type="text" name="stackname" required pattern="^([\./][^\./]|[^\./])+$" />
			</div>
			<!-- <div>
			<%= HTMLesc.escapeTrans("Category", lang) %>:
				  <select name="category" data-native-menu="false">
				   <option value="tool"><%= HTMLesc.escapeTrans("tool", lang) %>
				   <option value="network"><%= HTMLesc.escapeTrans("network", lang) %>
				   <option value="development"><%= HTMLesc.escapeTrans("development", lang) %>
				   <option value="business"><%= HTMLesc.escapeTrans("business", lang) %>
				   <option value="game"><%= HTMLesc.escapeTrans("game", lang) %>
				   <option value="home"><%= HTMLesc.escapeTrans("home", lang) %>
				   <option value="education"><%= HTMLesc.escapeTrans("education", lang) %>
				   <option value="other"><%= HTMLesc.escapeTrans("other", lang) %>
				  </select>
			</div> -->
			<div><%= HTMLesc.escapeTrans("Size", lang) %>:
				  <select name="cardsize" data-native-menu="false">
				   <option value="512*342">512*342
				   <option value="640*480">640*480 - VGA
				   <option value="800*600">800*600 - SVGA
				   <option value="1024*768">1024*768 - XGA
				   <option value="1280*1024">1280*1024 - SXGA
				   <!-- <option value="1366*768">1366*768 - HD -->
				   <!-- <option value="1920*1080">1920*1080 - FullHD -->
				   <!-- <option value="597*844">597*844 - A4 -->
				   <!-- <option value="844*597">844*597 - A4(<%= HTMLesc.escapeTrans("Portlait", lang) %>) -->
				   <!-- <option value="1193*844">1193*844 - A3(横) -->
				   <option value="320*356">320*356 - iPhone
				   <option value="784*960">784*960 - iPad
				   <option value="1024*720">1024*720 - iPad(<%= HTMLesc.escapeTrans("Portlait", lang) %>)
				  </select>
			</div>
			<div>
				<br><input type="submit" data-theme="b" value="<%= HTMLesc.escapeTrans("Create a New Stack", lang) %>" />
			</div>
		</div>
		</form>
	</div>
</div>
</body>
</html>
