<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.xmapString" %>
<%@ page import="javabeans.log" %>
<%@ page import="javabeans.sortList" %>
<%@ page import="javabeans.sortComparator" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.text.DateFormat" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Arrays" %>
<%@ page import="java.util.Comparator" %>
<%@ page import="java.net.URLEncoder" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<jsp:useBean id="sSearch" scope="page" class="javabeans.stacksearch"/>
<%
String sid = request.getSession().getId();
String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
xmapString xmap = sSearch.getXmap(getServletContext().getRealPath(".."));
%>
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
	<title>HCjs  <%= HTMLesc.escapeTrans("Search Stacks", lang) %></title>
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
		<h1><%= HTMLesc.escapeTrans("Search Stacks", lang) %></h1>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
	</div>
	<div data-role="content">
		<div id="main00">
<%
int[] counts = {0,0,0,0,0,0,0,0,0,0};
for(int i=0;i<10000;i++){
	if(xmap.get("stackName"+i)==null) break;
    String categoryStr = xmap.get("category"+i);
	if(categoryStr.equals("tool")) counts[0]++;
	if(categoryStr.equals("network")) counts[1]++;
	if(categoryStr.equals("development")) counts[2]++;
	if(categoryStr.equals("business")) counts[3]++;
	if(categoryStr.equals("game")) counts[4]++;
	if(categoryStr.equals("home")) counts[5]++;
	if(categoryStr.equals("education")) counts[6]++;
	if(categoryStr.equals("other")) counts[7]++;
}
%>
			<ul data-role="listview" data-inset="true">
			<li data-role="list-divider" style="text-align:center;"><%= HTMLesc.escapeTrans("Category", lang) %></li>
			<li><a href="searchList.jsp?category=tool" data-transition="slide"><%= HTMLesc.escapeTrans("tool", lang) %>
				<span class="ui-li-count"><%= counts[0] %></span></a></li>
			<li><a href="searchList.jsp?category=network" data-transition="slide"><%= HTMLesc.escapeTrans("network", lang) %>
				<span class="ui-li-count"><%= counts[1] %></span></a></li>
			<li><a href="searchList.jsp?category=development" data-transition="slide"><%= HTMLesc.escapeTrans("development", lang) %>
				<span class="ui-li-count"><%= counts[2] %></span></a></li>
			<li><a href="searchList.jsp?category=business" data-transition="slide"><%= HTMLesc.escapeTrans("business", lang) %>
				<span class="ui-li-count"><%= counts[3] %></span></a></li>
			<li><a href="searchList.jsp?category=game" data-transition="slide"><%= HTMLesc.escapeTrans("game", lang) %>
				<span class="ui-li-count"><%= counts[4] %></span></a></li>
			<li><a href="searchList.jsp?category=home" data-transition="slide"><%= HTMLesc.escapeTrans("home", lang) %>
				<span class="ui-li-count"><%= counts[5] %></span></a></li>
			<li><a href="searchList.jsp?category=education" data-transition="slide"><%= HTMLesc.escapeTrans("education", lang) %>
				<span class="ui-li-count"><%= counts[6] %></span></a></li>
			<li><a href="searchList.jsp?category=other" data-transition="slide"><%= HTMLesc.escapeTrans("other", lang) %>
				<span class="ui-li-count"><%= counts[7] %></span></a></li>
			</ul>
			<br>
			<ul data-role="listview" data-inset="true">
			<li data-role="list-divider" style="text-align:center;"><%= HTMLesc.escapeTrans("Newer 10 Stacks", lang) %></li>
<%
//ソート
ArrayList<sortList> sortList = new ArrayList<sortList>();
for(int i=0;i<10000;i++){
	if(xmap.get("stackName"+i)==null) break;
    String publicDateMill = xmap.get("publicDate"+i);
    Date publicDate = new Date();
	sortList s = new sortList();
	s.id = i;
	s.date = 0L;
    if(publicDateMill!=null && publicDateMill.length()>0){
    	s.date = Long.valueOf(publicDateMill);
    }
	sortList.add(s);
}
Object[] sortArray = sortList.toArray();
Arrays.sort(sortArray, new sortComparator());



for(int j=0;j<sortArray.length&&j<10;j++){
	int i = ((sortList)sortArray[j]).id;
	if(xmap.get("stackName"+i)==null) continue;

    String jaName = xmap.get("stackName"+i);
    String stackText = HTMLesc.escape(xmap.get("stackText"+i));
    String authorId = HTMLesc.escape(xmap.get("authorId"+i));
    String trueAuthor = HTMLesc.escape(xmap.get("trueAuthor"+i));
    if(trueAuthor==null||trueAuthor.length()==0) trueAuthor=authorId;
    String category = HTMLesc.escapeTrans(xmap.get("category"+i), lang);
    String publicDateMill = xmap.get("publicDate"+i);
    String publicDateStr = "-";
    if(publicDateMill!=null && publicDateMill.length()>0){
    	Date publicDate = new Date(Long.valueOf(publicDateMill));
    	DateFormat df = new SimpleDateFormat("yyyy/MM/dd");
    	publicDateStr = df.format(publicDate);
    }
	out.println(
		"<li><a href=\"stackinfo.jsp?author="+
		authorId+"&name="+URLEncoder.encode(jaName,"UTF-8")+"\" data-transition=slide>"+HTMLesc.escape(jaName)+
		"<p><br>"+HTMLesc.escapeTrans("Author", lang)+":"+trueAuthor+"  "
		+HTMLesc.escapeTrans("Category", lang)+":"+category+"  "
		+HTMLesc.escapeTrans("Public Date", lang)+":"+publicDateStr+"</p>"+
		"<p>"+stackText+"</p></a></li>\n"
	);
}
%>
			</ul>
		</div>
	</div>
</div>
</body>	
</html>