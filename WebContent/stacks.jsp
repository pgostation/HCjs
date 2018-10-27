<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.log" %>
<%@ page import="java.net.URLEncoder" %>
<%@ page import="javabeans.environment" %>
<%@ page import="java.io.File" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.FileReader" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="userInfo" scope="page" class="javabeans.userInfo"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
	String sid = request.getSession().getId();
	String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
	log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
if(userId==null || userId.length()==0 ){
	response.sendError(403);
}
String lang = "en";
String langStr = request.getHeader("accept-language");
if (langStr != null && langStr.startsWith("ja")) {
  lang = "ja";
}
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title>HCjs</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
	<link rel="stylesheet" href="css/dashboard.css" />
</head>
<body> 
<div data-role="page">
	<div data-role="header"> 
		<a href="./" data-icon="arrow-l" class="ui-btn-left" data-transition="slide" data-direction="reverse">Back</a>
		<h1><%= HTMLesc.escapeTrans("My Stacks", lang) %></h1>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
	</div>
	<div data-role="content">
		<div id="main00">
			<ul data-role="listview" data-inset="true">
<%@ page import="javabeans.xmapString" %>
<jsp:useBean id="fList" scope="page" class="javabeans.fileList"/>
<jsp:useBean id="sInfo" scope="page" class="javabeans.stackInfo"/>
<%
String files = fList.userFileAlphabet(getServletContext().getRealPath(".."), userId,"stack/");

String[] list = files.split("\n");
for(int i=0;i<list.length && i<100;i++){
	if(list[i].length()==0 || list[i].equals("tmp") || list[i].equals("_dirsize")) continue;

    String jaNameURL = URLEncoder.encode(list[i],"UTF-8");
    String jaNameHTML = HTMLesc.escape(list[i]);
	String stackPathStr = getServletContext().getRealPath("..")+"/user/"+userId+"/stack/"+list[i]+"/_stackinfo.xmap";
	xmapString stackXmap = sInfo.getInfo2(stackPathStr);
	String statusStr = "";
	String categoryStr = "";
	String infoStr = "";
	if(stackXmap!=null){
    	statusStr = HTMLesc.escapeTrans(stackXmap.get("status"), lang);
    	categoryStr = HTMLesc.escapeTrans(stackXmap.get("category"), lang);
    	if(categoryStr==null) categoryStr="";
    	infoStr = HTMLesc.escape(stackXmap.get("text"));
    	if(infoStr==null) infoStr="";
	}
	out.println(
		"<li><a href=\"stackinfo.jsp?author="+
		userId+"&name="+ jaNameURL+"\">"+jaNameHTML+""+
		"<br><br><p>"+categoryStr+"  "+""+statusStr+"</p>"+
		"<p>"+infoStr+"</p></a></li>\n"
	);
}

//3個以上で実績解除
if(list.length>=3){
String pathStr = getServletContext().getRealPath("..")+"/user/"+userId+"/_userinfo.xmap";
xmapString xmap = userInfo.getInfo(pathStr);
int userLevel = 0;
	if(xmap!=null){
		String str = xmap.get("userLevel");
		if(str!=null){
			userLevel = Integer.valueOf(str);
		}
		if(userLevel<=2){
			userLevel = 3;
			xmap.set("userLevel","3");
			xmap.save(pathStr);
		}
	}
}
%>
			</ul>
		</div>
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
<%
File f = new File(getServletContext().getRealPath("..") +"/user/"+userId+"/");
long dirSize = 0;
if(f.isDirectory()){
	dirSize = readSize(f.getAbsolutePath()+"/_dirsize")+1000;
}
//容量表示、保存
if(dirSize<1000*1000){
	out.println(HTMLesc.escapeTrans("Folder Size", lang)+":"+dirSize/1000+"KB");
}else{
	out.println(HTMLesc.escapeTrans("Folder Size", lang)+":"+dirSize/1000000+"."+(dirSize%1000000)/100000+"MB");
}
out.println(" / "+environment.getUserDiskSpace(userId)/1000000+".0MB");
%>
	</div>
</div>
<!-- フォルダ容量更新のため -->
<a href="finder.jsp" data-prefetch></a>
<a href="finder.jsp?path=/stack" data-prefetch></a>
</body>	
</html>