package nyoicard;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URLEncoder;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import javabeans.stackInfo;
import javabeans.xmapString;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/getfile")
public class getfile extends HttpServlet {
	private static final long serialVersionUID = 3L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String pathStr = request.getParameter("path"); //パラメータがURLに含まれない場合はnull
		String downloadStr = request.getParameter("download"); //パラメータがURLに含まれない場合はnull
		String modifiedSinceStr = request.getHeader("If-Modified-Since");

		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));
		
		if(authorStr==null || pathStr==null){
			response.sendError(404);
			return;
		}
		pathStr = new String(pathStr.getBytes("ISO-8859-1"),"UTF-8");
		if(pathStr.indexOf("?")!=-1){
			pathStr = pathStr.substring(0,pathStr.indexOf("?"));
		}

		if(!authorStr.matches("^[_a-zA-Z0-9]{3,15}$") || pathStr.matches(".*\\.\\..*")){
			response.sendError(404);
			return;
		}

		if(pathStr.startsWith("/")){
			pathStr = pathStr.substring(1);
		}
		pathStr = pathStr.replaceAll("/\\./","/");

		if(pathStr.startsWith("/") || pathStr.startsWith(".")){
			response.sendError(404);
			return;
		}

		File file = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/"+pathStr);
		if(!file.exists() || file.isDirectory()){
			response.sendError(404);
			return;
		}

		if(pathStr.startsWith("stack/") && !authorStr.equals(userStr)){
			String stackStr = pathStr.substring(6);
			if(stackStr.indexOf("/")!=-1){
				stackStr = stackStr.substring(0,stackStr.indexOf("/"));
			}
			xmapString xmap = new stackInfo().getInfo2(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+stackStr+"/_stackinfo.xmap");

			if(xmap==null || xmap.get("status")==null || !xmap.get("status").matches("public.*")){
				response.sendError(403);
				return;
			}
		}

		if(modifiedSinceStr!=null){
			//キャッシュが使える？
			SimpleDateFormat sdf = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", Locale.US);
			try {
				Date sinceDate = sdf.parse(modifiedSinceStr);
				Date modifyDate = new Date(file.lastModified());
				if(!sinceDate.before(modifyDate)){
					response.sendError(304);
					return;
				}
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}

		//ファイル名を変える
		if(request.getHeader("User-Agent").matches(".*(Safari).*")){
			//Safari
			response.addHeader("Content-Disposition", "attachment; filename="
				    + new String(file.getName().getBytes("UTF-8"), "ISO-8859-1"));
		} else {
			//Safari以外 (IEは知らない)
			response.setHeader("Content-Disposition", 
					"attachment; filename=" + URLEncoder.encode(file.getName(),"UTF-8"));
		}

		if(downloadStr!=null && downloadStr.equals("true")){
			response.setContentType("application/octet-stream");
		}
		else if(pathStr.matches(".*\\.txt$")){
			response.setContentType("text/plain");
		}
		else if(pathStr.matches(".*\\.json$")){
			response.setContentType("application/json");
		}
		else if(pathStr.matches(".*\\.xml$")){
			response.setContentType("application/xml");
		}
		else if(pathStr.matches(".*\\.htm$") || pathStr.matches(".*\\.html$")){
			response.setContentType("text/html");
		}
		else if(pathStr.matches(".*\\.js$")){
			response.setContentType("application/javascript");
		}
		else if(pathStr.matches(".*\\.css$")){
			response.setContentType("text/css");
		}
		else if(pathStr.matches(".*\\.png$")){
			response.setContentType("image/png");
		}
		else if(pathStr.matches(".*\\.jpg$") || pathStr.matches(".*\\.jpeg$")){
			response.setContentType("image/jpeg");
		}
		else if(pathStr.matches(".*\\.gif$")){
			response.setContentType("image/gif");
		}
		else if(pathStr.matches(".*\\.pict$")){
			response.setContentType("image/pict");
		}
		else if(pathStr.matches(".*\\.mp3$") || pathStr.matches(".*\\.mpa$")){
			response.setContentType("audio/mpeg");
		}
		else if(pathStr.matches(".*\\.mp4a$")){
			response.setContentType("audio/mp4");
		}
		else if(pathStr.matches(".*\\.oga$") || pathStr.matches(".*\\.ogg$")){
			response.setContentType("audio/ogg");
		}
		else if(pathStr.matches(".*\\.wav$")){
			response.setContentType("audio/x-wav");
		}
		else if(pathStr.matches(".*\\.aiff$")){
			response.setContentType("audio/x-aiff");
		}
		else if(pathStr.matches(".*\\.h264$")){
			response.setContentType("video/h264");
		}
		else if(pathStr.matches(".*\\.ogv$")){
			response.setContentType("video/ogg");
		}
		else if(pathStr.matches(".*\\.mov$")){
			response.setContentType("video/quicktime");
		}
		else if(pathStr.matches(".*\\.pdf$")){
			response.setContentType("application/pdf");
		}
		else{
			response.setContentType("text/plain");
		}
		
		SimpleDateFormat sdf = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", Locale.US);
		//System.out.println("After Format : " + sdf.format(file.lastModified()));
		response.setHeader("Last-Modified",sdf.format(file.lastModified()));
		
		int rangeStart = -1;
		int rangeEnd = -1;
		if(request.getHeader("Range")==null){
			response.setHeader("Content-Length",file.length()+"");
		}else{
			//System.out.println("Range:"+request.getHeader("Range"));
			String x = request.getHeader("Range");
			String r1 = x.substring(x.indexOf("=")+1,x.indexOf("-"));
			String r2 = x.substring(x.indexOf("-")+1);
			rangeStart = Integer.valueOf(r1);
			rangeEnd = Integer.valueOf(r2);
			response.setStatus(206);
			response.setHeader("Accept-Ranges","bytes");
			response.setHeader("Content-Range","bytes "+rangeStart+"-"+rangeEnd+"/"+(file.length()));
			response.setHeader("Content-Length",""+(rangeEnd-rangeStart+1));
		}
		
		ServletOutputStream binOut = response.getOutputStream();

		DataInputStream dis = null;
		try {
			dis = new DataInputStream(new FileInputStream(file));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		
		if(dis==null){
			response.sendError(500);
			//response.sendRedirect("error/500.html");
			return;
		}

		if(rangeStart==-1){
			while(true)
			{
				byte[] b = new byte[4096];
				int size = dis.read(b);
				if(size==-1) break;
				binOut.write(b,0,size);
			}
		}else{
			if(rangeStart>0){
				byte[] b = new byte[rangeStart];
				dis.read(b);
			}
			while(true)
			{
				byte[] b = new byte[rangeEnd-rangeStart];
				int size = dis.read(b);
				if(size==-1) break;
				binOut.write(b,0,size);
			}
		}
		dis.close();
		binOut.close();
		
		if(new File(file.getParent()).getAbsolutePath().equals(getServletContext().getRealPath("..")+"/user/"+authorStr+"/tmp")){
			//tmpファイルにおいてある場合は削除する
			file.delete();
		}
		
		return;
	}
}
