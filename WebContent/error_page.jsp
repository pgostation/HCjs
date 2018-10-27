<%@ page isErrorPage="true" contentType="text/html; charset=UTF-8" isErrorPage="true" %>
<%
// リモートIPアドレスがローカルIPでなかったら errro_message.jsp へ転送
if(!request.getRemoteAddr().startsWith("192.168.")&&!request.getRemoteAddr().startsWith("127.0.0.1")) {
%><jsp:forward page="error_message.jsp" /><%
}
%>
<!DOCTYPE html>
<html lang="ja">
<head>
   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
   <title>page error</title>
</head>
<body>
  次のようなエラーが発生しました。
  <b><%= exception %></b><br>
  <hr>
  <pre>
    <% exception.printStackTrace(new java.io.PrintWriter(out)); %>
  </pre>
</body>
</html>