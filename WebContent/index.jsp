<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.log" %>
<%@ page import="java.io.File" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="java.io.FileInputStream" %>
<%@ page import="javabeans.xmapString" %>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="userInfo" scope="page" class="javabeans.userInfo"/>
<%
	String sid = request.getSession().getId();
	String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
	if(userId==null || userId.equals("")){
		userId = "";
		//userId = sidBean.newGuestId(sidBean.newGuestId(application.getRealPath("..")));
		//response.addCookie(new Cookie("userId", userId));
	}
	log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
    String lang = "en";
    String langStr = request.getHeader("accept-language");
    if (langStr != null && langStr.startsWith("ja")) {
	  lang = "ja";
    }

    int userLevel = 1;
	String pathStr = getServletContext().getRealPath("..")+"/user/"+userId+"/_userinfo.xmap";
	xmapString xmap = userInfo.getInfo(pathStr);
	if(xmap!=null){
		String str = xmap.get("userLevel");
		if(str!=null){
			userLevel = Integer.valueOf(str);
		}
	}
	
	String userAgentStr = request.getHeader("User-Agent");
	if(userAgentStr==null) userAgentStr = "Safari";
%>
<!DOCTYPE html>
<html>
<head>
	<title>HCjs</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="description" content="HCjs is Web-based HyperCard clone (JavaScript and HTML5) for OSX and iPad. HCjs can play/run and make stacks with Authoring tools, Painting tools and Script editor. It can convert HyperCard stacks.">
	<meta name="keywords" content="HCjs, HyperCard, HyperTalk, JavaScript, iPad, Authoring, HTML5, dot paint, HyperCard Clone, Convert">
    <link href="favicon.ico" rel="icon" type="image/x-icon" />
    <link href="favicon.ico" rel="shortcut icon" type="image/x-icon" />
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
	<link rel="stylesheet" href="css/dashboard.css" />
</head>
<body>
<!-- facebook -->
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/ja_JP/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<!-- /facebook -->
<div data-role="page">
	<div data-role="header"> 
		<h1>HCjs</h1>
	</div>
	<div data-role="content">
		<div id="main1">
			<% if(userId==null || userId.length()==0 || userId.startsWith("_")){ %>
			<form action="login" method="post" data-ajax="false">
				<dt><%= HTMLesc.escapeTrans("User ID", lang) %>:
				<dd>
					<input type="text" name="user" value="" maxlength=15 style="ime-mode:inactive;" />
				</dd>
				</dt>
				<dt><%= HTMLesc.escapeTrans("Password", lang) %>:
				<dd>
					<input type="password" name="password" value="" />
				</dd>
				</dt>
				<input type="submit" data-theme="b" value="<%= HTMLesc.escapeTrans("Login", lang) %>" data-inline="true"><br>
			</form>
			<a href="newaccount.jsp"><%= HTMLesc.escapeTrans("Create new account", lang) %></a><br><br>
			<ul data-role="listview" data-inset="true">
				<li><a href="tutorial.jsp" data-ajax="false"><%= HTMLesc.escapeTrans("Tutorial", lang) %></a></li>
				<li data-icon="false"><span style="color:gray"><%= HTMLesc.escapeTrans("User Settings", lang) %></span></li>
			<% } else { %>
			<%= HTMLesc.escapeTrans("Logged in", lang) %>:<a href="user.jsp?user=<%= userId %>"><%= userId %></a><br>
			<a href="logout.jsp"><%= HTMLesc.escapeTrans("Logout", lang) %></a><br><br>
			<ul data-role="listview" data-inset="true">
				<% if(userLevel<=5){ %>
				<li><a href="tutorial.jsp" data-ajax="false"><%= HTMLesc.escapeTrans("Tutorial", lang) %></a></li>
				<% } %>
				<li><a href="useredit.jsp"><%= HTMLesc.escapeTrans("User Settings", lang) %></a></li>
			<% } %>
				<% if(userLevel>=1){ %>
				<li><a href="newstack.jsp"><%= HTMLesc.escapeTrans("New Stack", lang) %></a></li>
				<% }else{ %>
				<li><span style="color:gray"><%= HTMLesc.escapeTrans("New Stack", lang) %></span></li>
				<% } %>
				<% if(userLevel>=2){ %>
				<li><a href="stacks.jsp"><%= HTMLesc.escapeTrans("Stack List", lang) %></a></li>
				<li><a href="finder.jsp"><%= HTMLesc.escapeTrans("File Manager", lang) %></a></li>
				<% }else{ %>
				<li><span style="color:gray"><%= HTMLesc.escapeTrans("Stack List", lang) %></span></li>
				<li><span style="color:gray"><%= HTMLesc.escapeTrans("File Manager", lang) %></span></li>
				<% } %>
				<% if(userLevel>=1){ %>
				<li><a href="special.jsp"><%= HTMLesc.escapeTrans("Import HyperCard stack", lang) %></a></li>
				<% }else{ %>
				<li><span style="color:gray"><%= HTMLesc.escapeTrans("Import HyperCard stack", lang) %></span></li>
				<% } %>
			</ul>
			<ul data-role="listview" data-inset="true">
				<li><a href="search.jsp" ><%= HTMLesc.escapeTrans("Search Stacks", lang) %></a></li>
				<li><a href="help.jsp" ><%= HTMLesc.escapeTrans("Help", lang) %></a></li>
			</ul>
		</div>
		<div id="main2">
			<% 
			if(userAgentStr.indexOf("Chrome")!=-1 || userAgentStr.indexOf("Safari")==-1 ){
				%><span style='color:red'><%= HTMLesc.escapeTrans("HCjs supports Safari web browser.", lang) %></span><br><%
			}
			%>
			<!-- お知らせ -->
			<h3 style="color:#04a"><%= HTMLesc.escapeTrans("Information", lang) %></h3>
			<% 
			String infoPath = application.getRealPath("..")+"/user/__info/"+lang+".txt";
			File infoFile = new File(infoPath);
			String tmpStr = "";
			try {
	            InputStreamReader in = new InputStreamReader(new FileInputStream(infoPath), "UTF-8");
	            char[] cbuf = new char[(int)infoFile.length()];
	            in.read(cbuf);
	            tmpStr = new String(cbuf);
	            in.close();
	        } catch (Exception e) {
	            System.out.println(e);
	        }
			out.println(tmpStr);
			%>
		</div>
	</div>
	<div data-role="footer">
		<div style="text-align:center;">
			<span>&nbsp;© <a href="user.jsp?user=pgo" data-role="none" style="color:white">pgo</a>&nbsp;</span>
			<a href="privacy.jsp" style="color:#8bf"><%= HTMLesc.escapeTrans("Privacy policy", lang) %></a>&nbsp;&nbsp;
			<a href="terms.jsp" style="color:#8bf"><%= HTMLesc.escapeTrans("Terms", lang) %></a>
		</div>
	</div>
</div>
</body>
</html>