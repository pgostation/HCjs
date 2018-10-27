<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
String lang = "en";
String langStr = request.getHeader("accept-language");
if (langStr != null && langStr.startsWith("ja")) {
  lang = "ja";
}

String enAuthor = request.getParameter("author");
if(enAuthor==null)enAuthor="";
String jaAuthor = new String( enAuthor.getBytes( "8859_1" ), "UTF-8" );
String jaAuthorHTML = HTMLesc.escape(jaAuthor);

String enName = request.getParameter("name");
if(enName==null)enName="";
String jaNamePath = new String( enName.getBytes( "8859_1" ), "UTF-8" );
String jaNameHTML = HTMLesc.escape(jaNamePath);
%>
<!DOCTYPE html>
<html lang="ja">
<head>
<link rel="stylesheet" href="css/default/jquery-ui-1.8.19.custom.css" />
<link rel="stylesheet" href="css/default/stack.css" />
</head>
<body>
<form action="fileupload?js=true&user=<%= jaAuthorHTML %>&name=<%= jaNameHTML %>&mime=image_xxx" method="post" enctype="multipart/form-data" id="uploadFileForm">
	<input type="file" name="uploadFile" id="uploadFile" /><br>
	<input type="submit" name="<%= HTMLesc.escapeTrans("Upload", lang) %>" />
</form>
</body>