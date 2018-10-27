<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.xmapString" %>
<%@ page import="javabeans.log" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="userInfo" scope="page" class="javabeans.userInfo"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
	String sid = request.getSession().getId();
	String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
	log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
	if(userId==null || userId.equals("") || userId.startsWith("_") ||
	   !userId.matches("[_a-zA-Z0-9]{3,15}"))
	{
		response.sendError(403);
		return;
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
		userInfo.createInfo(pathStr);
		xmap = userInfo.getInfo(pathStr);
	}

	String mailStr = HTMLesc.escape(xmap.get("mailaddr"));
	if(mailStr==null) mailStr = "";
	String urlStr = HTMLesc.escape(xmap.get("url"));
	if(urlStr==null) urlStr = "http://";
	String profileStr = HTMLesc.escape(xmap.get("profile"));
	if(profileStr==null) profileStr = "";
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title><%= HTMLesc.escapeTrans("User Settings", lang) %></title>
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
		<h1><%= HTMLesc.escapeTrans("User Settings", lang) %></h1>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right"><%= HTMLesc.escapeTrans("Home", lang) %></a>
	</div>
	<div id="main00">
		<div data-role="content">
            <!-- <h3><%= userId %>のアイコン</h3>
			<div>
				<img src="/img/logo.png" width="128" height="128"><br>
				<span style="nowrap">
					<button class="grade" style="border-radius:16px; height:24px; font-size:14px;padding-left:20px;padding-right:20px;">画像を変更</button>
				</span>
			</div>-->
            <h3><%= userId %><%= HTMLesc.escapeTrans("'s Info", lang) %></h3>
			<div>
				<form action="userinfoedit" method="POST" data-ajax="false">
					<dt><%= HTMLesc.escapeTrans("User ID", lang) %>:
						<dd><%= userId %></dd><br>
					</dt>
					<!-- <dt>ユーザ名:
						<dd><input type="text" value="" /></dd>
					</dt> -->
					<dt><%= HTMLesc.escapeTrans("Mail Address (Not Public)", lang) %>:
						<dd><input type="email" value="<%= mailStr %>" name="mailaddr" style="width:100%;" required /><br>
							<!-- <input type="checkbox"/>重要なお知らせをメールで通知する<br>
							<input type="checkbox"/>コメントをメールで通知する -->
						</dd>
					</dt>
					<dt><%= HTMLesc.escapeTrans("Web Site", lang) %>:
						<dd><input type="url" value="<%= urlStr %>" name="url" style="width:100%;" /></dd>
					</dt>
					<dt><%= HTMLesc.escapeTrans("Profile", lang) %>:
						<dd><textarea name="profile"><%= profileStr %></textarea></dd>
					</dt>
					<br>
					<input type="checkbox" id="changepass" name="changepass"
					onchange="document.getElementById('change_password').style.visibility=this.checked?'visible':'hidden';document.getElementById('change_password').style.height=this.checked?'':'0px';"/>
					<label for="changepass"><%= HTMLesc.escapeTrans("Change Password", lang) %></label>
					<p id="change_password" style="visibility:hidden;height:0px;margin-left:20px;">
						<%= HTMLesc.escapeTrans("Old Password", lang) %>: <input type="password" name="oldpass" pattern=".{6,32}" value="" /><br>
						<%= HTMLesc.escapeTrans("New Password", lang) %>: <input type="password" name="newpass" pattern=".{6,32}" value="" />
					</p>
					<dt>&nbsp;
						<dd>
							<input type="submit" data-theme="b" value=<%= HTMLesc.escapeTrans("Submit", lang) %>>
						</dd>
					</dt>
				</form>
				
           		<h3><%= HTMLesc.escapeTrans("Delete Your Account", lang) %></h3>
				<dt>
					<dd>
						<a href="#" data-role="button" data-theme="e" onclick="if(confirm('<%= HTMLesc.escapeTrans("Delete Your Account?", lang) %>')){location.href='userdelete'}"><%= HTMLesc.escapeTrans("Delete Your Account", lang) %></a>
					</dd>
				</dt>
			</div>
		</div>
    </div>
</div>
</body>
</html>