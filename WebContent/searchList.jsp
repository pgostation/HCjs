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
<%
String sid = request.getSession().getId();
String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
String lang = "en";
String langStr = request.getHeader("accept-language");
if (langStr != null && langStr.startsWith("ja")) {
	lang = "ja";
}

String categoryStr = request.getParameter("category");
if(categoryStr==null)
{
	response.sendError(404);
}
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title>HCjs <%= HTMLesc.escapeTrans("Search Stacks", lang) %> [<%= HTMLesc.escapeTrans(categoryStr, lang) %>]</title>
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
		<h1><%= HTMLesc.escapeTrans("Search Stacks", lang) %> [<%= HTMLesc.escapeTrans(categoryStr, lang) %>]</h1>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
	</div>
	<div data-role="content">
		<div id="main00">
			<ul data-role="listview" data-inset="true" data-filter="true" <%= HTMLesc.escapeTrans("data-filter-placeholder='Filter Items...'", lang) %>>
<jsp:useBean id="sSearch" scope="page" class="javabeans.stacksearch"/>
<%
xmapString xmap = sSearch.getXmap(getServletContext().getRealPath(".."));

//ソート
ArrayList<sortList> sortList = new ArrayList<sortList>();
for(int i=0;i<10000;i++){
	if(xmap.get("stackName"+i)==null) break;
	if(!xmap.get("category"+i).equals(categoryStr)) continue;
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



for(int j=0;j<sortArray.length&&j<200;j++){
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