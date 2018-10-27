<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8" %>
<%

String msgStr = request.getParameter("msg");
if(msgStr==null) msgStr="";
msgStr = new String(msgStr.getBytes("ISO-8859-1"), "UTF-8");
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title><%= msgStr %></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
    <link href="/HC.js/css/dashboard.css" rel="stylesheet" type="text/css" />
</head>
<body>
	<div data-role="page" data-add-back-btn="true">
		<div data-role="header" data-position="fixed">
			<h1>Error</h1>
			<a href="/" data-icon="arrow-l" data-rel="back" >Back</a>
		</div>
		<div data-role="content">
			<div id="main00">
				<%= msgStr %>
			</div>
		</div>
	</div>	
</body>
</html>
