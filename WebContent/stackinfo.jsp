<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.xmapString" %>
<%@ page import="javabeans.log" %>
<%@ page import="java.io.File" %>
<%@ page import="java.net.URLEncoder" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.FileReader" %>
<%@ page import="java.io.FileWriter" %>
<%@ page import="java.net.URL" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<jsp:useBean id="sInfo" scope="page" class="javabeans.stackInfo"/>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
	String sid = request.getSession().getId();
	String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
	log(log.make(request.getRequestURI(), request.getQueryString(), userId, request.getRemoteAddr(), sid));
//トラップ
if(request.getParameter("author")==null || request.getParameter("name")==null ||
   request.getParameter("author")=="" || request.getParameter("name")=="" ||
   !request.getParameter("author").matches("[_a-zA-Z0-9]{3,15}") || request.getParameter("name").contains("..") ){
	response.sendError(404);
}

		String lang = "en";
		String langStr = request.getHeader("accept-language");
		if (langStr != null && langStr.startsWith("ja")) {
		  lang = "ja";
		}

		// パラメータの日本語変換
		String enName = request.getParameter("name");
	    String jaNamePath = new String( enName.getBytes( "8859_1" ), "UTF-8" );
	    String jaNameURL = URLEncoder.encode(jaNamePath,"UTF-8");
        String jaNameHTML = HTMLesc.escape(jaNamePath);
		String authorStr = request.getParameter("author");
		if(authorStr==null) authorStr = "";
		boolean backToUp = request.getParameter("back")!=null;

		//
		String pathStr = getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+jaNamePath+"/_stackinfo.xmap";
		xmapString xmap = sInfo.getInfo2(pathStr);
if(xmap==null){
	File stackDir = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+jaNamePath);
	if(!stackDir.exists() || !stackDir.getParentFile().getName().equals("stack")){
		response.sendError(404);
		return;
	}
	xmap = new xmapString("");
	{
		File file = new File(pathStr);
		file.createNewFile();
	}
}
		String iconStr = HTMLesc.escape(xmap.get("icon"));
		if(iconStr==null) iconStr = "/img/icon.png";
		String categoryStr = HTMLesc.escapeTrans(xmap.get("category"), lang);
		if(categoryStr==null) categoryStr = "none";
		String versionStr = HTMLesc.escape(xmap.get("version"));
		if(versionStr==null) versionStr = "-";
		String languageStr = HTMLesc.escape(xmap.get("language"));
		if(languageStr==null) languageStr = "-";
		String tAuthorStr = HTMLesc.escape(xmap.get("author"));
		if(tAuthorStr==null) tAuthorStr = authorStr;
		String oAuthorStr = HTMLesc.escape(xmap.get("origAuthor"));
		String authorTag = /*HTMLesc.escape*/(xmap.get("authorTag")); //管理者が要請によって作成する。作者が複数の場合とか。
		if(authorTag==null) authorTag ="<a href=\"user.jsp?user="+authorStr+"\">"+tAuthorStr+"</a>";
		String canCopyStr = HTMLesc.escapeTrans(xmap.get("copy"), lang);
		if(canCopyStr==null) canCopyStr = "-";
		String canChangeStr = HTMLesc.escape(xmap.get("canChange"));
		if(canChangeStr==null) canChangeStr = "-";
		String statusEn = xmap.get("status");
		if(statusEn==null) statusEn = "-";
		String statusStr = HTMLesc.escapeTrans(statusEn, lang);
		if(statusStr==null) statusStr = "-";
		String textStr = HTMLesc.escapeBR(xmap.get("text"));
		if(textStr==null) textStr = "-";
		String screenshotStr = HTMLesc.escape(xmap.get("screenshot"));
		if(screenshotStr==null) screenshotStr = "";
		String counterStr = HTMLesc.escape(xmap.get("counter"));
		if(counterStr==null) counterStr = "0";
		String commentStr = "";
		for(int i=0;i<100;i++){
			String cmtStr = HTMLesc.escape(xmap.get("comment"+i));
			String cmtNameStr = HTMLesc.escape(xmap.get("commentName"+i));
			String cmtDateStr = HTMLesc.escape(xmap.get("commentDate"+i));
			String cmtUserIDStr = HTMLesc.escape(xmap.get("commentUser"+i));
			if(cmtStr==null)break;
			if(cmtNameStr==null) cmtNameStr="";
			if(cmtDateStr==null) cmtDateStr="";
			if(cmtUserIDStr==null) cmtUserIDStr="";
			if(cmtUserIDStr.equals("")){
				commentStr+="<div>"+cmtNameStr;
			}else{
				commentStr+="<div><a href=\"user.jsp?user="+cmtUserIDStr+"\">"+cmtNameStr+"</a>";
			}
			commentStr += ": "+cmtStr+" <small style=\"font-size:0.8em\">("+cmtDateStr+")</small>"+"</div><br>";	
		}
		String seedStr = Integer.toString((int)Math.random()*55535+10000);
		
		if(!authorStr.equals(userId) && (xmap.get("status")+"").equals("private")){
			//非公開設定
			response.sendError(404);
			return;
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
<%
String dirSizeStr = null;
if(authorStr.equals(userId)){ //作者本人が見ている場合
	long dirSize = 0;
	String thisPath = "stack/"+jaNamePath;
	{
		File f = new File(getServletContext().getRealPath("..") +"/user/"+userId+"/"+thisPath);
		long size = 0;
		if(f.isDirectory()){
			//jaNameHTML+="/";
			size = readSize(f.getAbsolutePath()+"/_dirsize")+1000;
		}
		/*else if(f.exists()){
			size = f.length()+1000;
		}*/
		dirSize += size;
	}
	//容量表示、保存
	if(dirSize<1000*1000){
		dirSizeStr = HTMLesc.escapeTrans("Size", lang)+":"+dirSize/1000+"KB";
	}else{
		dirSizeStr = HTMLesc.escapeTrans("Size", lang)+":"+dirSize/1000000+"."+(dirSize%1000000)/100000+"MB";
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
}
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title><%= jaNameHTML %></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
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
<div data-role="page" data-add-back-btn="true">
	<div data-role="header"> 
		<h1><%= HTMLesc.escapeTrans("Stack Info", lang) %></h1>
		<% if(backToUp || authorStr.equals(userId)){ %><a href="stacks.jsp" data-icon="arrow-l" class="ui-btn-left">Back</a><% } %>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
	</div>
	<div id="main00">
		<div data-role="content">
	<%
	if(authorStr.equals(userId)){ //作者本人が見ている場合
	%>
				<a data-role="button" data-transition="turn"
				href="stackinfoedit.jsp?author=<%= authorStr %>&name=<%= jaNameURL %>"><%= HTMLesc.escapeTrans("Edit ", lang) %><%= jaNameHTML %><%= HTMLesc.escapeTrans("'s Info ", lang) %></a><br>
	<%
	}else{
	%>
        <h3><%= jaNameHTML %><%= HTMLesc.escapeTrans("'s Info", lang) %></h3>
	<%
	}
	%>
			<div class="ui-grid-a">
				<!-- <div style="float:left; width:140px; text-align:center;">
					<img src="<%= iconStr %>" width="128" height="128">
				</div> -->
				<div class="ui-block-a">
					<%= HTMLesc.escapeTrans("Category", lang) %>:  <%= categoryStr %><br>
					<%= HTMLesc.escapeTrans("Version", lang) %>:  <%= versionStr %><br>
					<!-- 言語:  <%= languageStr %><br> -->
					<%= HTMLesc.escapeTrans("Author", lang) %>:  <%= authorTag %><br>
					<%= (oAuthorStr!=null)?HTMLesc.escapeTrans("Original Author",lang)+":"+oAuthorStr+"<br>":"" %>
					<%= HTMLesc.escapeTrans("Status", lang) %>:  <%= statusStr %><br>
					<%= HTMLesc.escapeTrans("Copy:",lang)%> <%= canCopyStr %><!--    変更: <%= canChangeStr %> --><br>
				</div>
				<div class="ui-block-b">
					<%= HTMLesc.escapeTrans("Counter:", lang) %>  <%= counterStr %><br>
					<%= (dirSizeStr!=null)?dirSizeStr+"<br>":"" %>
				</div>
			</div>
			<div class="ui-grid-a">
				<div class="ui-block-a">
					<button data-theme="b" data-ajax="false" onclick="document.cookie='sname_cdid=';window.location.href='stackplayer2.jsp?author=<%= authorStr %>&name=<%= jaNameURL %>';"
					><%= HTMLesc.escapeTrans("Open",lang)%></button>
				</div>
				<div class="ui-block-b">
					<% if(!(xmap.get("copy")+"").equals("copy_public")){ %>
						<button disabled><%= HTMLesc.escapeTrans("Copy",lang)%></button>
					<% }else{ %>
					<a data-role="button" href="copystack?author=<%= authorStr %>&name=<%= jaNameURL %>"><%= HTMLesc.escapeTrans("Copy",lang)%></a>
					<% } %>
				</div>
			</div>
	        <h3><%= HTMLesc.escapeTrans("Detail",lang)%></h3>
			<div style="height:64px;">
				<%= textStr %>
			</div>
			<br>
			<br>
<% if(!statusEn.equals("private")){ %>
			<a href="https://twitter.com/share" class="twitter-share-button"><%= HTMLesc.escapeTrans("Tweet",lang)%></a>
			<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
	<%
	String fileUrl = request.getRequestURI();
	if (request.getQueryString() != null) {
		fileUrl += '?' + request.getQueryString();
	}
	URL reconstructedURL = new URL(request.getScheme(),
	                               request.getServerName(),
	                               request.getServerPort(),
	                               fileUrl);
	%>
			<div class="fb-like" data-href="<%= reconstructedURL.toString() %>" data-send="true" data-width="450" data-show-faces="true"></div>
<% } %>
			<!--  
			<hr>
	        <h3>コメント</h3>
			<div style="min-height:16px;">
				<%= commentStr %>
			</div>
	        <h3>コメントする</h3>
			<div><form data-ajax="false" method="post" action="commentAdd?author=<%= authorStr %>&stackname=<%= jaNameURL %>" id="commentForm">
	<%
	if(userId!=null && !userId.startsWith("_") && !userId.equals("")){
	%>
				<input name="commentName" value="<%= userId %>">
	<%
	}else{
	%>
				<input name="commentName" value="" placeholder="名前">
	<%
	}
	%>
				<br>
				<textarea name="commentText" placeholder="コメント入力"></textarea><br>		
	<jsp:useBean id="capt" scope="page" class="javabeans.captcha"/>
				<div>
					<%= capt.newCaptchaHTML(seedStr) %>
					<input type="hidden" name="seed" value="<%= seedStr %>">
					<input name="captcha" placeholder="上の数字を入力してください">
				</div><br>
				<button
					 onclick="document.getElementbyId('commentForm').submit();">書き込み</button>
				</form>
			</div> -->
	    </div>
	</div>
</div>
</body>
</html>
