<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.log" %>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<%
String sid = request.getSession().getId();
String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));

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
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
	<link rel="stylesheet" href="css/dashboard.css" />
</head> 
<body>
<div data-role="page" data-add-back-btn="true">
	<div data-role="header" data-position="fixed">
		<h1><%= HTMLesc.escapeTrans("Create New Account", lang) %></h1>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
	</div>
	<div id="main00" data-role="content">
		<form action="newaccount" method="post" data-ajax="false">
			<dt><%= HTMLesc.escapeTrans("User ID", lang) %>:
			<dd>
				<input type="text" name="user" value="" pattern=".{3,15}" maxlength=15 required />
				<small><%= HTMLesc.escapeTrans("minimum 3 characters, alphabet, number or underbar", lang) %></small>
			</dd>
			</dt>
			<dt><%= HTMLesc.escapeTrans("Mail Address", lang) %>:
			<dd>
				<input type="email" name="mail" value="" size=64 required />
			</dd>
			</dt>
			<dt><%= HTMLesc.escapeTrans("Password", lang) %>:
			<dd>
				<input type="password" name="password" pattern=".{6,32}" value="" required />
				<small><%= HTMLesc.escapeTrans("minimum 6 characters", lang) %></small>
			</dd>
			</dt>
			<div id="botdiv">
				右に表示されている文字列を削除してください:<input name="bot" id="bot" type="text" value="bot" />
			</div>
			<script type="text/javascript">
					//BOT対策の文字を消す
					document.getElementById('bot').value = '';
					if (document.getElementById('bot').value == '') {
						document.getElementById('botdiv').style.visibility = 'hidden';
						document.getElementById('botdiv').style.height = '0';
					}
				</script>
			<div>
			</dt>
				<input type="checkbox" name="terms_accept" id="c1" /><label for="c1"><%= HTMLesc.escapeTrans("Accept Terms", lang) %></label>
			<dd>
				<a href="terms.jsp" style="color: #016" target="_blank" ><%= HTMLesc.escapeTrans("Terms", lang) %></a>
			</dd>
			</dt>
			</div>
			<input type="submit" data-theme="b" value="<%= HTMLesc.escapeTrans("Create", lang) %>" data-inline="true"><br>
		</form>
	</div><!-- content -->
</div>
</body>
</html>
