<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<jsp:useBean id="sidBean" scope="page" class="javabeans.session"/>
<%
	String sid = request.getSession().getId();
	String userId = sidBean.getUserId(sid, application.getRealPath(".."), request.getCookies());
	if(userId==null){
		//
	}
	else{
		sidBean.setSessionId(sid, application.getRealPath(".."), "", "", "");
		response.addCookie(new Cookie("userId", ""));
	}
	response.sendRedirect("./"); 
%>