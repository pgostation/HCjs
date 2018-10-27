<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%@ page import="javabeans.xmapString" %>
<%@ page import="javabeans.log" %>
<%@ page import="java.net.URLEncoder" %>
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
	return;
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

		//
		String pathStr = getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+jaNamePath+"/_stackinfo.xmap";
		xmapString xmap = sInfo.getInfo2(pathStr);
if(xmap==null){
	response.sendError(500);
	return;
}

if(userId==null || !userId.equals(authorStr)){
	response.sendError(403);
	return;
}

String categoryStr = HTMLesc.escape(xmap.get("category"));
if(categoryStr==null) categoryStr = "tool";
String versionStr = HTMLesc.escape(xmap.get("version"));
if(versionStr==null) versionStr = "1.00";
String statusStr = HTMLesc.escape(xmap.get("status"));
if(statusStr==null) statusStr = "-";
String copyStr = HTMLesc.escape(xmap.get("copy"));
if(copyStr==null) copyStr = "cantcopy";
String textStr = HTMLesc.escape(xmap.get("text"));
if(textStr==null) textStr = "";
String protectStr = HTMLesc.escape(xmap.get("protect"));
if(protectStr==null) protectStr = "";
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
<div data-role="page" data-add-back-btn="true">
	<div data-role="header"> 
		<h1><%= jaNameHTML %></h1>
		<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
	</div>
	<div id="main00">
		<form action="stackinfoedit" method="post" data-ajax="false">
		<input name="author" type="hidden" value="<%= authorStr %>" /></dd>
		<input name="name" type="hidden" value="<%= jaNameHTML %>" /></dd>
        <h3><%= HTMLesc.escapeTrans("Edit ", lang) %><%= jaNameHTML %><%= HTMLesc.escapeTrans("'s Info ", lang) %></h3>
		<div>
			<dt><%= HTMLesc.escapeTrans("Name", lang) %>:
				<dd><input name="rename" type="text" value="<%= jaNameHTML %>" required pattern=".+" <%= protectStr.equals("protect")?"disabled":"" %> /></dd>
			</dt>
			<div data-role="fieldcontain">
				<fieldset data-role="controlgroup">
				<legend><%= HTMLesc.escapeTrans("Category", lang) %>:</legend>
				   <input type="radio" id="tool" name="category" value="tool" <%= (categoryStr.equals("tool")?"CHECKED":"") %> />
				   <label for="tool"><%= HTMLesc.escapeTrans("tool", lang) %></label>
				   <input type="radio" id="network" name="category" value="network" <%= (categoryStr.equals("network")?"CHECKED":"") %> />
				   <label for="network"><%= HTMLesc.escapeTrans("network", lang) %></label>
				   <input type="radio" id="development" name="category" value="development" <%= (categoryStr.equals("development")?"CHECKED":"") %> />
				   <label for="development"><%= HTMLesc.escapeTrans("development", lang) %></label>
				   <input type="radio" id="business" name="category" value="business" <%= (categoryStr.equals("business")?"CHECKED":"") %> />
				   <label for="business"><%= HTMLesc.escapeTrans("business", lang) %></label>
				   <input type="radio" id="game" name="category" value="game" <%= (categoryStr.equals("game")?"CHECKED":"") %> />
				   <label for="game"><%= HTMLesc.escapeTrans("game", lang) %></label>
				   <input type="radio" id="home" name="category" value="home" <%= (categoryStr.equals("home")?"CHECKED":"") %> />
				   <label for="home"><%= HTMLesc.escapeTrans("home", lang) %></label>
				   <input type="radio" id="education" name="category" value="education" <%= (categoryStr.equals("education")?"CHECKED":"") %> />
				   <label for="education"><%= HTMLesc.escapeTrans("education", lang) %></label>
				   <input type="radio" id="other" name="category" value="other" <%= (categoryStr.equals("other")?"CHECKED":"") %> />
				   <label for="other"><%= HTMLesc.escapeTrans("other", lang) %></label>
			   </fieldset>
			</div>
			<dt><%= HTMLesc.escapeTrans("Version", lang) %>:
				<dd><input name="version" type="text" value="<%= versionStr %>" /></dd>
			</dt>
			<!-- <dt>言語:
				<dd><input type="checkbox"/>日本語  <input type="checkbox"/>英語  その他の言語:<input type="text" value="" /></dd>
			</dt>-->
			<div data-role="fieldcontain">
				<label for="protect"><%= HTMLesc.escapeTrans("Protect", lang) %></label>
				<select name="protect" id="protect" data-role="slider" <% if(userId.startsWith("_")){ %> disabled <% } %>
				onChange="var it=this.value=='protect'?'enable':'disable'; $('#public').checkboxradio(it);$('#public_dontsearch').checkboxradio(it);  if(this.value=='noprotect'){$('#private').attr('checked','checked'); $('#private').checkboxradio('refresh');$('#public').checkboxradio('refresh');$('#public_dontsearch').checkboxradio('refresh');}" 
				<%= (userId.startsWith("_"))?"disabled":"" %>>
					<option value="noprotect"<%= (protectStr.equals("noprotect")?"SELECTED":"") %>>
					<%= HTMLesc.escapeTrans("OFF", lang) %></option>
					<option value="protect"<%= (protectStr.equals("protect")?"SELECTED":"") %>>
					<%= HTMLesc.escapeTrans("ON", lang) %></option>
				</select>
				<p>&nbsp;&nbsp;&nbsp;&nbsp;<%= HTMLesc.escapeTrans("Protect-ON: You can't change Stack data. Your change is saved in personal area.", lang) %></p>
			</div>
			<div data-role="fieldcontain">
				  <fieldset id="copy" data-role="controlgroup">
					<legend><%= HTMLesc.escapeTrans("Status", lang) %>:</legend>
				   <input <% if(!protectStr.equals("protect")){ %> disabled <% } %>
				   type="radio" id="public" name="status" value="public" <%= (statusStr.equals("public")?"CHECKED":"") %> />
				   <label for="public"><%= HTMLesc.escapeTrans("public", lang) %></label>
				   <input <% if(!protectStr.equals("protect")){ %> disabled <% } %>
				    type="radio" id="public_dontsearch" name="status" value="public_dontsearch" <%= (statusStr.equals("public_dontsearch")?"CHECKED":"") %> />
				   <label for="public_dontsearch"><%= HTMLesc.escapeTrans("public_dontsearch", lang) %></label>
				   <input type="radio" id="private" name="status" value="private" <%= (statusStr.equals("private")?"CHECKED":"") %> />
				   <label for="private"><%= HTMLesc.escapeTrans("private", lang) %></label>
				  </fieldset>
				  <p>&nbsp;&nbsp;&nbsp;&nbsp;<%= HTMLesc.escapeTrans("To public, protect switch turn-ON", lang) %></p>
			</div>
			<div data-role="fieldcontain">
				  <fieldset data-role="controlgroup">
					<legend><%= HTMLesc.escapeTrans("Copy", lang) %>:</legend>
				   <input type="radio" id="copy_public" name="copy" value="copy_public" <%= (copyStr.equals("copy_public")?"CHECKED":"") %> />
				   <label for="copy_public"><%= HTMLesc.escapeTrans("copy_public", lang) %></label>
				   <input type="radio" id="cantcopy" name="copy" value="cantcopy" <%= (copyStr.equals("cantcopy")?"CHECKED":"") %> />
				   <label for="cantcopy"><%= HTMLesc.escapeTrans("cantcopy", lang) %></label>
				  </fieldset>
			</div>
			<div>
	        	<h3><%= HTMLesc.escapeTrans("Detail", lang) %></h3>
				<textarea name="text" rows=5 cols=52><%= textStr%></textarea><br>
				<input type="submit"  data-transition="flip" value="<%= HTMLesc.escapeTrans("Submit", lang) %>" data-theme="b">
			</div>
		</form>
		<hr>
        <!-- <h3>アイコン</h3>
		<div>
			<img src="/img/logo.png" width="128" height="128"><br>
			<span style="nowrap">
				<button data-theme="b">画像を変更</button>
			</span>
		</div>
		<hr>
        <h3>スクリーンショット</h3>
			<img src="/img/logo.png" width="512" height="384"><br>
			<span style="nowrap">
				<button data-theme="b">画像を変更</button>
			</span> -->
        <h3><%= HTMLesc.escapeTrans("Delete this Stack", lang) %></h3>
			<a href="#" data-role="button" data-theme="e" 
			onclick="if(confirm('<%= HTMLesc.escapeTrans("Delete this Stack?", lang) %>')){location.href='stackdelete?author=<%= authorStr %>&name=<%= jaNameURL %>'}">
			<%= HTMLesc.escapeTrans("Delete this Stack", lang) %></a>
			
    </div>
</div>
</body>
</html>
