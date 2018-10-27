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
	<title>HCjs <%= HTMLesc.escapeTrans("Privacy policy", lang) %></title>
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
			<h1><%= HTMLesc.escapeTrans("Privacy policy", lang) %></h1>
			<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
		</div>
		<div id="main00" data-role="content">
<% if(!lang.equals("ja")){ %>
1.  HCjs administrator uses or holds only in the range required for offer of this service about the personal information dealt with with offer of this service. <br>
2.  However, when the necessity for the personal information disclosure by a statute is accepted, the confidentiality of information of the preceding clause shall not undertake.<br><br>	
<% } %>
1. HCjs管理者は、本サービスの提供に伴って取り扱う個人情報について、本サービスの提供に必要な範囲でのみ使用または保持します。<br>
2. ただし、法令による個人情報開示の必要性が認められる場合において、前項の守秘義務は負わないものとします。<br>
<!-- メールアドレス、パスワード、IPアドレスなどの個人情報もしくは個人の特定につながる情報を扱うので、漏らしたり、パウワードをメールで送ったりしません -->
<!-- でも、httpsとか使わないのでアレ -->
</div>
</div>
</body>
</html>
