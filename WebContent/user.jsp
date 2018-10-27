<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.xmapString" %>
<%@ page import="javabeans.log" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.text.DateFormat" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.net.URLEncoder" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="userInfo" scope="page" class="javabeans.userInfo"/>
<jsp:useBean id="sInfo" scope="page" class="javabeans.stackInfo"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
	String userStr = request.getParameter("user");
	String sid = request.getSession().getId();
	String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
	log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
	if(userStr==null || userStr.equals("") ||
	   !userStr.matches("[_a-zA-Z0-9]{3,15}"))
	{
		response.sendError(404);
	}
    String lang = "en";
    String langStr = request.getHeader("accept-language");
    if (langStr != null && langStr.startsWith("ja")) {
	  lang = "ja";
    }
	
	//
	String pathStr = getServletContext().getRealPath("..")+"/user/"+userStr+"/_userinfo.xmap";
	xmapString xmap = userInfo.getInfo(pathStr);
	if(xmap==null){
		if(userStr.equals(userId)){
			userInfo.createInfo(pathStr);
			xmap = userInfo.getInfo(pathStr);
		}
		else{
			response.sendError(404);
		}
	}

	String urlStr = HTMLesc.escape(xmap.get("url"));
	if(urlStr==null) urlStr = "";
	String profileStr = HTMLesc.escapeBR(xmap.get("profile"));
	if(profileStr==null) profileStr = "";
	boolean backToUp = request.getParameter("back")!=null;
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title><%= HTMLesc.escapeTrans("User Info", lang) %></title>
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
		<h1><%= HTMLesc.escapeTrans("User Info", lang) %></h1>
		<% if(backToUp){ %><a href="index.jsp" data-icon="arrow-l" class="ui-btn-left">Back</a><% } %>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right"><%= HTMLesc.escapeTrans("Home", lang) %></a>
	</div>
	<div id="main00">
		<div data-role="content">
	<%
	if(userStr.equals(userId) && !userStr.startsWith("_")){ //作者本人が見ている場合
	%>
			<a data-role="button" href="useredit.jsp" data-transition="turn"><%= HTMLesc.escapeTrans("Edit Info", lang) %></a><br>
	<%
	}else{
	%>
       		<h3><%= userStr %><%= HTMLesc.escapeTrans("'s Info", lang) %></h3>
	<%
	}
	%>
            <h3><%= HTMLesc.escapeTrans("User Info", lang) %></h3>
			<div>
				<dt><%= HTMLesc.escapeTrans("User ID", lang) %>:
					<%= userStr %>
				</dt>
				<dt><%= HTMLesc.escapeTrans("Web Site", lang) %>:
					<dd><a href="<%= urlStr %>"><%= urlStr %></a></dd>
				</dt>
				<dt><%= HTMLesc.escapeTrans("Profile", lang) %>:
					<%= profileStr %>
				</dt>
			</div>
			<hr>
            <h3><%= userStr %><%= HTMLesc.escapeTrans("'s Public Stacks", lang) %></h3>
			<ul data-role="listview" data-inset="true">
<jsp:useBean id="fList" scope="page" class="javabeans.fileList"/>
<%
String files = fList.userFileNewer2(getServletContext().getRealPath(".."), userStr,"stack/");

String[] list = files.split("\n");
for(int i=0;i<list.length && i<100;i++){
	if(list[i].length()==0 /*|| list[i].equals("tmp")*/) continue;

    String jaName = list[i];
	String stackPathStr = getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/"+jaName+"/_stackinfo.xmap";
	xmapString stackXmap = sInfo.getInfo2(stackPathStr);
	if(stackXmap!=null){
    	String statusStr = HTMLesc.escape(stackXmap.get("status"));
    	if(statusStr!=null && statusStr.equals("public")){
	    	String categoryStr = HTMLesc.escapeTrans(stackXmap.get("category"), lang);
	    	if(categoryStr==null) categoryStr="";
	    	String infoStr = HTMLesc.escape(stackXmap.get("text"));
	    	if(infoStr==null) infoStr="";
	    	String counterStr = HTMLesc.escape(stackXmap.get("counter"));
	    	if(counterStr==null) counterStr="0";
	        String publicDateMill = stackXmap.get("publicDate");
	        String publicDateStr = "-";
	        if(publicDateMill!=null && publicDateMill.length()>0){
	        	Date publicDate = new Date(Long.valueOf(publicDateMill));
	        	DateFormat df = new SimpleDateFormat("yyyy/MM/dd");
	        	publicDateStr = df.format(publicDate);
	        }
			out.println(
				"<li><a href=\"stackinfo.jsp?author="+
				userStr+"&name="+URLEncoder.encode(jaName,"UTF-8")+"\">"+HTMLesc.escape(jaName)+
				"<br><br><p>"+categoryStr+HTMLesc.escapeTrans("  Release:", lang)+publicDateStr+
				HTMLesc.escapeTrans("  Counter:", lang)+counterStr+"</p>"+
				"<p>"+infoStr+"</p></a></li>\n"
			);
    	}
	}
}
%>
			</ul>
        </div>
    </div>
</div>
</body>
</html>
