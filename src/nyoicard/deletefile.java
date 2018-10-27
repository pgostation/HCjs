package nyoicard;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/deletefile")
public class deletefile extends HttpServlet {
	private static final long serialVersionUID = 4L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String pathStr = request.getParameter("name"); //パラメータがURLに含まれない場合はnull

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
		if(!authorStr.equals(userStr)){
			response.sendError(403);
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
		
		file.delete();

		response.sendRedirect("finder.jsp?path="+URLEncoder.encode(pathStr,"UTF-8"));
		
		return;
	}
}
