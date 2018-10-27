<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.log" %>
<%@ page import="javabeans.environment" %>
<%@ page import="java.net.URLEncoder" %>
<%@ page import="java.io.File" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.FileReader" %>
<%@ page import="java.io.FileWriter" %>
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
	log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
	if(userId==null || userId.equals("") ||
	   !userId.matches("[_a-zA-Z0-9]{3,15}"))
	{
		response.sendError(404);
	}

	String path = request.getParameter("path");
	if(path==null) path="";
    path = new String( path.getBytes( "8859_1" ), "UTF-8" );
    String pathHTML = HTMLesc.escape(path);
    String pathURL = URLEncoder.encode(path, "UTF-8");
	
%>
<!DOCTYPE html>
<html lang="ja">
<head>
<title>HC.js <%= HTMLesc.escapeTrans("File Manager", lang) %></title>
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
			<h1><%= HTMLesc.escapeTrans("File Manager", lang) %></h1>
<%
boolean isFile = fList.isFile(getServletContext().getRealPath(".."), userId, path);
String thisPath = path;
String upPath = thisPath;
String upPathURL = "";
if(isFile){
	if(path.indexOf("/")!=-1){
		thisPath = path.substring(0, path.lastIndexOf("/"));
	}
}
if(thisPath.indexOf("/")!=-1)
{
	upPath = thisPath.substring(0, thisPath.lastIndexOf("/"));
	upPathURL = URLEncoder.encode(upPath, "UTF-8");
%>
			<a href="finder.jsp?path=<%= upPathURL %>" data-icon="back" class="ui-btn-left" data-transition="slide" data-direction="reverse">
			<%= HTMLesc.escapeTrans("Back", lang) %></a><%
}
%>
			<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
		</div>
		<div data-role="content">
<% 
if(!isFile){
	out.println("<div id=\"main00\">");
}else{
	%>
			<div id="main00">
				<h3><%= HTMLesc.escape(path.substring(path.lastIndexOf("/")+1)) %></h3>
				<!-- 画像ならimg, テキストなら内容、それ以外なら白紙アイコンを表示 -->
<%
				if(path.endsWith(".png") || path.endsWith(".PNG")
				|| path.endsWith(".jpg") || path.endsWith(".JPG")
				|| path.endsWith(".jpeg") || path.endsWith(".JPEG")
				|| path.endsWith(".gif") || path.endsWith(".GIF")
				|| path.endsWith(".pict") || path.endsWith(".PICT")
				|| path.endsWith(".bmp") || path.endsWith(".BMP"))
				{
					%>
					<div class="backgroundTile" style="float:left;border:3px ridge #888;padding:4px;">
						<img id="fdr_img" src="getfile?user=<%= userId %>&path=<%= pathURL %>" 
						onLoad="var it=document.getElementById('fdr_img');var min0=document.getElementById('main00');if(it.width>min0.offsetWidth){it.width=min0.offsetWidth;}" /><br>
					</div> <%
				}
				if(path.endsWith(".txt") || path.endsWith(".TXT")
				|| path.endsWith(".json") || path.endsWith(".JSON"))
				{
					%> <textarea><%= 
					fList.readTextFile(getServletContext().getRealPath(".."), userId, path)
					%></textarea><br> <%
				}
				if(path.endsWith(".wav") || path.endsWith(".aiff")
				|| path.endsWith(".aac") || path.endsWith(".mp3")
				|| path.endsWith(".ogg") || path.endsWith(".oga"))
				{
					%>
					<div class="backgroundTile" style="float:left;border:3px ridge #888;padding:4px;">
						<audio id=snd src="getfile?user=<%= userId %>&amp;path=<%= pathURL %>" controls></audio><br>
					</div> <%
				}
%>
				</div>
			</div>
			<br>
			<div id="main00">
				<% if(!request.getHeader("User-Agent").matches(".*(iPad|iPhone).*")){ %>
					<a href="getfile?user=<%= userId %>&path=<%= pathURL %>&download=true" 
					rel="external" data-role="button" data-inline="true"><%= HTMLesc.escapeTrans("Download", lang) %></a>
				<% } %>
				<a href="#" 
				onclick="if(confirm('<%= HTMLesc.escapeTrans("Delete this File?", lang) %>')){location.href='deletefile?user=<%= userId %>&name=<%= pathURL %>'}"
					rel="external" data-role="button" data-inline="true" data-theme="e"><%= HTMLesc.escapeTrans("Delete File", lang) %></a>
			</div>
			<div id="main00">
	<%
}
String thisPathHTML = HTMLesc.escape(thisPath);
String thisPathURL = URLEncoder.encode(thisPath, "UTF-8");
String files = fList.userFileAlphabet(getServletContext().getRealPath(".."), userId, thisPath);
String[] list = files.split("\n");
%>
				<br>
				<h3>~<%= userId %><%= thisPathHTML %><%= HTMLesc.escapeTrans(" Files", lang) %></h3>
				<ul data-role="listview" data-inset="true" <%= list.length>=10?"data-filter='true' "+HTMLesc.escapeTrans("data-filter-placeholder='Filter Items...'", lang):"" %>>
<%
if(thisPath.indexOf("/")!=-1){
%>
					<li data-icon="back" data-theme="b" ><a href="finder.jsp?path=<%= upPathURL %>"><%= HTMLesc.escapeTrans("Back", lang) %></a></li>
<%
}
%>
<%
//ディレクトリ内のファイルリスト出力
boolean flag = false;
long dirSize = 0;
int thumbCount = 0;
for(int i=0;i<list.length && i<10000;i++){
	if(list[i].length()==0 || list[i].equals("tmp")) continue;

    String jaName = list[i];
    String jaNameHTML = HTMLesc.escape(jaName);
   	if(!jaName.startsWith("_")){
   		File f = new File(getServletContext().getRealPath("..") +"/user/"+userId+"/"+thisPath+"/"+jaName);
   		long size = 0;
   		if(f.isDirectory()){
   			jaNameHTML+="/";
   			size = readSize(f.getAbsolutePath()+"/_dirsize")+1000;
   		}
   		else if(f.exists()){
   			size = f.length()+1000;
   		}
		out.println(
			"<li><a href=\"finder.jsp?path="+thisPathURL+"/"+URLEncoder.encode(jaName,"UTF-8")+
			"\" ");
   		if(f.isDirectory()){
			out.println("data-transition=slide");
   		}
   		else{
			out.println("data-ajax=false");
   		}
		out.println(">");
		if(jaName.endsWith(".png") || jaName.endsWith(".jpg")){
			thumbCount++;
			if(thumbCount<10){
				out.println("<img width=80 height=80 src='getthumbnail?user="+userId+"&path="+thisPathURL+"/"+URLEncoder.encode(jaName,"UTF-8")+"' />");
			}else{
				out.println("<img id=img"+thumbCount+" width=80 height=80 src='' /><script>setTimeout(function(){$('#img"+thumbCount+"').attr('src','getthumbnail?user="+userId+"&path="+thisPathURL+"/"+URLEncoder.encode(jaName,"UTF-8")+"')},"+(thumbCount)*100+")</script>");
			}
		}
		else if(jaName.endsWith(".aiff") || jaName.endsWith(".wav") || jaName.endsWith(".aac") || jaName.endsWith(".mp3") || jaName.endsWith(".ogg")){
			//out.println("<audio id=snd"+i+" src='getfile?user="+userId+"&path="+thisPathURL+"/"+URLEncoder.encode(jaName,"UTF-8")+"' controls ></audio><br>");
		}
		out.println(jaNameHTML+"<p class='ui-li-aside'>"+size/1000+"KB</p></a></li>\n");
		dirSize += size;
		flag = true;
   	}
}
if(flag==false){
	out.println("<li>"+HTMLesc.escapeTrans("This folder is empty", lang)+"</li>");
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
				</ul>
<%
//容量表示、保存
if(dirSize<1000*1000){
	out.println(HTMLesc.escapeTrans("Folder Size", lang)+":"+dirSize/1000+"KB");
}else{
	out.println(HTMLesc.escapeTrans("Folder Size", lang)+":"+dirSize/1000000+"."+(dirSize%1000000)/100000+"MB");
}
if(thisPathURL.equals("")){
	out.println(" / "+environment.getUserDiskSpace(userId)/1000000+".0MB");
}

File f = new File(getServletContext().getRealPath("..") +"/user/"+userId+"/"+thisPath+"/_dirsize");
try{
	f.createNewFile();
	FileWriter filewriter = new FileWriter(f);
	filewriter.write(Long.toString(dirSize));
	filewriter.close();
}catch(Exception e){
	System.out.println(e);
}
%>
<%
//アーカイブダウンロード
if(!thisPathURL.equals("") && 
	(!request.getHeader("User-Agent").matches(".*(iPad|iPhone).*")))
{
	out.println("<br><a data-role='button' data-ajax='false' href='zipdownload?path="+thisPathURL+"'>"+HTMLesc.escapeTrans("Download this folder", lang)+"</a>");
}
%>
			</div>
		</div>
	</div>
</body>
</html>
