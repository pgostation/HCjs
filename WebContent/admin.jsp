<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.environment" %>
<%@ page import="java.net.URLEncoder" %>
<%@ page import="java.io.File" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.FileReader" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.Calendar" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="java.io.FileInputStream" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session" />
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape" />
<jsp:useBean id="fList" scope="page" class="javabeans.fileList" />
<%
String lang = "en";
String langStr = request.getHeader("accept-language");
if (langStr != null && langStr.startsWith("ja")) {
  lang = "ja";
}

	String sid = request.getSession().getId();
	String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
	if(userId==null || !userId.equals("admin"))
	{
		response.sendError(404);
	}

	String guestStr = request.getParameter("guest");
	if(guestStr==null) guestStr = "";

	String users = fList.getListAlphabet(getServletContext().getRealPath("..") +"/user/");
	String[] userlist = users.split("\n");
	int guestCnt = 0;
	for(int user_idx=0; user_idx<userlist.length; user_idx++){
		String userStr = new File(userlist[user_idx]).getName();
		if(userStr.startsWith("_")) 
		{
			guestCnt++;
			continue;
		}
	}
%>
<%!
private long readSize(String path){
	File f = new File(path);
	if(!f.exists()) return 0;
	
	String text = "0";
	try {
		BufferedReader br = new BufferedReader(new FileReader(f));
		text = br.readLine();
		br.close();
	}catch(Exception e){
		System.out.println(e);
	}
	long l = Long.valueOf(text);
	return l;
}
%>
<!DOCTYPE html>
<html lang="ja">
<head>
<title>HC.js <%= HTMLesc.escapeTrans("Admin Page", lang) %></title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet"
	href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
<script
	src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
<link rel="stylesheet" href="css/dashboard.css" />
</head>
<body>
	<div data-role="page">
		<div data-role="header" data-position="fixed">
			<h1><%= HTMLesc.escapeTrans("Admin Page", lang) %></h1>
			<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
		</div>
		<div data-role="content">
			<div id="main01">
<%
        File diskfile = new File("/");
        out.println(" &nbsp;total space: "+diskfile.getTotalSpace()/1024/1024/100/10.0+"GB");
        out.println(" &nbsp;free space: "+diskfile.getFreeSpace()/1024/1024/100/10.0+"GB");
        out.println(" &nbsp;usable space: "+diskfile.getUsableSpace()/1024/1024/100/10.0+"GB<br>");
%>
<%
		Runtime rt = Runtime.getRuntime();
        out.println(" &nbsp;total memory: "+ rt.totalMemory()/1024/1024 +"MB");
        out.println(" &nbsp;free memory: "+ rt.freeMemory()/1024/1024 +"MB");
        out.println(" &nbsp;max memory: "+ rt.maxMemory()/1024/1024 +"MB<br><br>");
        rt.gc();
%>
<%
		String blackList = (String)application.getAttribute("blackList");
		if(blackList==null) blackList="";
        out.println(" &nbsp;blackList: "+ blackList+"<br>");
        String[] blackLists = blackList.split(" ");
        for(int i=0; i<blackLists.length; i++){
        	out.println(" &nbsp;&nbsp;"+blackLists[i]+": "+ application.getAttribute("blackList"+blackLists[i])+"<br>");
        }
%>
				<a data-role="button" href="deleteGuest" data-ajax="false">Delete old guests (all guest id count=<%= guestCnt %>)</a><br>
			</div>
			<div id="main01">
				<ul data-role="listview" data-inset="true">
<%


String hdr_path = getServletContext().getRealPath("..") +"/user/";
for(int user_idx=0; user_idx<userlist.length; user_idx++){
	String userStr = new File(userlist[user_idx]).getName();
	if(guestStr.equals("true")){
		if(!userStr.startsWith("_guest")){
			continue;
		}
	}
	else{
		if(userStr.startsWith("_") || userStr.startsWith("."))
		{
			continue;
		}
	}
	long size = readSize(hdr_path+userlist[user_idx]+"/_dirsize");
	File sidFile = new File(hdr_path+userlist[user_idx]+"/_sessionId");
	if(!sidFile.exists()){
		sidFile = new File(hdr_path+userlist[user_idx]+"/");
	}
	String dateStr = "";
	if(sidFile.exists()){
		Date date = new Date(sidFile.lastModified());
		Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		dateStr = "Last login: "+(cal.get(Calendar.YEAR))+"/"+(cal.get(Calendar.MONTH)+1)+"/"+cal.get(Calendar.DATE) +" "+ cal.get(Calendar.HOUR_OF_DAY) +":"+ (cal.get(Calendar.MINUTE)<10?"0":"")+cal.get(Calendar.MINUTE);
	}
	File stackDir = new File(hdr_path+userlist[user_idx]+"/stack/");
	int stackNum = 0;
	if(stackDir.exists()){
		stackNum = stackDir.list().length;
	}
	String infoStr = "";
	File uaFile = new File(hdr_path+userlist[user_idx]+"/_remoteAddr_userAgent");
	if(uaFile.exists()){
		try {
	        InputStreamReader in = new InputStreamReader(new FileInputStream(uaFile), "UTF-8");
	        char[] cbuf = new char[(int)uaFile.length()];
	        in.read(cbuf);
	        infoStr = new String(cbuf);
	        in.close();
	    } catch (Exception e) {
	        System.out.println(e);
	    }
	}
	
    out.println("<li><!--<a href=\"adminid.jsp?id="+userStr+"\">-->");
   	{
   		out.println("<h4>"+userStr+"</h4><p>"+size/1024/100/10.0+"MB "+dateStr+"<br>"+infoStr+"</p><span class=\"ui-li-count\">"+stackNum+"</span>");
   	}
    out.println("<!--</a>--></li>");
}
%>
				</ul>
<% if(guestStr.equals("true")){ %>
				<a href="admin.jsp">show registered users</a>
<% }else{ %>
				<a href="admin.jsp?guest=true">show guests</a>
<% } %>
			</div>
		</div>
	</div>
</body>
</html>
