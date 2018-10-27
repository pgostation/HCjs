<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.xmapString" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="userInfo" scope="page" class="javabeans.userInfo"/>
<%
String sid = request.getSession().getId();
String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
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

int userLevel = 0;
if(xmap!=null){
	String str = xmap.get("userLevel");
	if(str!=null){
		userLevel = Integer.valueOf(str);
	}
	if(userLevel<=0){
		userLevel = 1;
		xmap.set("userLevel","1");
		xmap.save(pathStr);
	}
}
%>
<!DOCTYPE html>
<html lang="ja">
<body>
</body>
<script>
<% if(lang=="ja"){ %>
	window.location.href='stackplayer2.jsp?author=pgo&name=Tutorial';
<% }else{ %>
	window.location.href='stackplayer2.jsp?author=pgo&name=Tutorial_en';
<% } %>
</script>
</html>
