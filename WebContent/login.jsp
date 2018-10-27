<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
    String lang = "en";
    String langStr = request.getHeader("accept-language");
    if (langStr != null && langStr.startsWith("ja")) {
	  lang = "ja";
    }
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title>HCjs</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link href="favicon.ico" rel="icon" type="image/x-icon" />
    <link href="favicon.ico" rel="shortcut icon" type="image/x-icon" />
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<link rel="stylesheet" href="css/dashboard.css" />
</head>
<body class="ui-mobile-viewport ui-overlay-c">
<div data-role="page">
	<div data-role="header" class="ui-header ui-bar-a" role="banner"> 
		<h1 class="ui-title" role="heading" aria-level="1">HCjs</h1>
	</div>
	<div data-role="content" class="ui-content" role="main">
		<div id="main0">
			<form action="login" method="post">
				<dt><%= HTMLesc.escapeTrans("User ID", lang) %>:
				</dt><dd>
					<input type="text" name="user" value="" maxlength="15" style="ime-mode:inactive;" class="ui-input-text ui-body-c ui-corner-all ui-shadow-inset" />
				</dd>
				<dt><%= HTMLesc.escapeTrans("Password", lang) %>:
				</dt><dd>
					<input type="password" name="password" value="" class="ui-input-text ui-body-c ui-corner-all ui-shadow-inset" />
				</dd>
				<div data-corners="true" data-shadow="true" data-iconshadow="true" 
				data-wrapperels="span" data-icon="null" data-iconpos="null" data-theme="b" 
				data-inline="true" data-mini="false" class="ui-btn ui-btn-inline ui-shadow ui-btn-corner-all ui-fullsize ui-btn-up-b" aria-disabled="false">
				<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">
				<%= HTMLesc.escapeTrans("Login", lang) %></span></span>
				<input type="submit" data-theme="b" value="<%= HTMLesc.escapeTrans("Login", lang) %>"
				 data-inline="true" class="ui-btn-hidden" aria-disabled="false"></div><br>
			</form>
			<a href="newaccount.jsp"><%= HTMLesc.escapeTrans("Create new account", lang) %></a><br>
		</div>
	</div>
</div>
</body>
</html>