<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.log" %>
<%@ page import="javabeans.xmapString" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="userInfo" scope="page" class="javabeans.userInfo"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape" />
<%
String sid = request.getSession().getId();
String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
if(userId==null || userId.equals("")){
	userId = sidBean.newGuestId(application.getRealPath(".."), request.getRemoteAddr(), request.getHeader("User-Agent"));
	response.addCookie(new Cookie("userId", userId));
}
log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));

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
	}
}
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title><%= HTMLesc.escapeTrans("Import HyperCard stack", lang) %></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
	<link rel="stylesheet" href="css/dashboard.css" />
</head>
<body>
<div data-role="page" data-add-back-btn="true">
	<div data-role="header"> 
		<h1><%= HTMLesc.escapeTrans("Import HyperCard stack", lang) %></h1>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
	</div>
	<div id="main00">
	    <div class="card" style="width:80%; margin-left:10%;">
			<h3><%= HTMLesc.escapeTrans("Convert a HyperCard Stack", lang) %></h3>
			<!-- FILE UPLOAD -->
			<form action="fileupload" method="post" enctype="multipart/form-data" data-ajax="false" id="fileuploadform">
			<ol>
			<li><%= HTMLesc.escapeTrans("Compress a HyperCard Stack on MacOSX. (Select 'Compress 〜' at Context Menu)", lang) %></li>
			<li><%= HTMLesc.escapeTrans("Upload .zip File.", lang) %></li>
			<li><%= HTMLesc.escapeTrans("(If converting is failure, try do menu \"Compact Stack...\" on HyperCard.)", lang) %></li>
			</ol>
			<input type="file" name="fileField" id="filesel" style="width:100%">
<% 
		long filesizeMax;
		filesizeMax = javabeans.environment.getUserDiskSpace(userId) 
				- javabeans.dirsize.readSize(getServletContext().getRealPath("..")+"/user/"+userId+"/_dirsize");;
		if(100*1000 > filesizeMax){
%>
		<div style="color:red;"><%= HTMLesc.escapeTrans("Disk Full", lang) %></div>
<%
		}
%>
			<input type="submit" id="submitButton" data-theme="b" value="<%= HTMLesc.escapeTrans("Upload .zip File", lang) %>" onclick="if(document.getElementById('filesel').value==''){alert('ファイルを選択してください');return false;}">
			
			 <br>
			 <br>
			 <select name="langsel" class="popup" data-native-menu="false">
			   <option value="Japanese">日本語(Japanese)
			   <option value="English" <%= (lang.equals("en")?"SELECTED":"") %>>English
			  </select>
			 <!-- <br><input type="checkbox" id="debugchk" name="debugchk"><label for="debugchk">デバッグ出力を使用する</label>-->
			  <!--<input type="hidden" name="debugchk" value="">  -->
			  <input type="hidden" name="user" value="<%= userId %>">
			<!-- / FILE UPLOAD -->
			</form>
		</div>
	</div>
</div>
</body>
</html>