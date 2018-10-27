package nyoicard;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.Date;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/httpget")
public class httpget extends HttpServlet {
	private static final long serialVersionUID = 8L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String urlStr = request.getParameter("url"); //パラメータがURLに含まれない場合はnull
		String postStr = request.getParameter("post"); //パラメータがURLに含まれない場合はnull

		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));
		if(userStr==null){
			response.sendError(403);
			return;
		}

		if(urlStr==null){
			response.sendError(500);
			return;
		}
		urlStr = new String(urlStr.getBytes("ISO-8859-1"),"UTF-8");
		if(urlStr.indexOf("://")<5){
			urlStr = "http://"+urlStr;
		}
		
		if(postStr!=null){
			postStr = new String(postStr.getBytes("ISO-8859-1"),"UTF-8");
		}
		
		ServletContext sc = this.getServletContext();
		Object blackObj = sc.getAttribute("httpgetList"+userStr);
		if(blackObj!=null){
			if(new Date().getTime()-((Long)blackObj)<5*1000){ //5秒以内の連続使用禁止
			    response.setStatus(500);
				return;
			}
		}
		sc.setAttribute("httpgetList"+userStr, new Date().getTime());
		
		getHttp(request, response, urlStr, postStr);

		return;
	}
	
	private void getHttp(HttpServletRequest request, HttpServletResponse response, String urlStr, String postStr) throws IOException{
	    URL url = new URL(urlStr);
	    HttpURLConnection http = (HttpURLConnection)url.openConnection();
	    http.setInstanceFollowRedirects(false);
	    if(request.getHeader("Accept-Language")!=null){
	    	http.setRequestProperty("Accept-Language", request.getHeader("Accept-Language"));
	    }
	    else{
	    	http.setRequestProperty("Accept-Language", "ja;q=0.7,en;q=0.3");
	    }
	    http.setRequestProperty("User-Agent", "Mozilla/5.0 (Java; Intel) AppleWebKit/536.25 (KHTML, like Gecko) Version/6.0 Safari/536.25");

	    //接続
	    if(postStr==null){
	    	http.setRequestMethod("GET");
	    }else{
	    	http.setRequestMethod("POST");
	    }
	    
	    try{
	    	http.connect();
	    }catch(SocketTimeoutException e){
		    response.setStatus(504); //Gateway Timeout
	    	return;
	    }
	    
	    //データを取得
	    BufferedInputStream bis = new BufferedInputStream(http.getInputStream());
	    int totalLen = 0;
	    int len;
	    byte b[] = new byte[500*1024]; //500KBまで
	    while ( (len = bis.read(b,totalLen,b.length-totalLen)) != -1 ){
	    	totalLen += len;
	    }
	    
	    //ヘッダーを設定
	    response.setStatus(http.getResponseCode());
	    for(int i=0; i<32; i++){
	    	if(http.getHeaderFieldKey(i)==null) break;
	    	if(http.getHeaderFieldKey(i).equals("Content-Type")) continue;
	    	response.setHeader(http.getHeaderFieldKey(i), http.getHeaderField(i));
	    }
	    
	    //中身をクライアントに送る
	    if(http.getContentType()!=null && http.getContentType().startsWith("text/")){
	    	if(http.getContentType().toLowerCase().indexOf("utf-8")!=-1 || http.getContentEncoding()==null || http.getContentEncoding().equals("UTF-8")){
		    	response.setContentType(http.getContentType()+"; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.println(new String(b,0,totalLen,"UTF-8"));
	    	}else{
		    	response.setContentType(http.getContentType()+"; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.println(new String(b,0,totalLen,http.getContentEncoding()));
	    	}
		}
	    else{
	    	String contentTypeStr = http.getContentType();
	    	if(contentTypeStr==null) contentTypeStr = "text/html";
	    	response.setContentType(contentTypeStr);
			ServletOutputStream binOut = response.getOutputStream();
			binOut.write(b,0,totalLen);
			binOut.close();
	    }
	}
}
