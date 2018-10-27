package nyoicard;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import javabeans.dirsize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.arnx.jsonic.util.Base64;

//import org.apache.commons.codec.binary.Base64;

@WebServlet("/setfile")
public class setfile extends HttpServlet{
	private static final long serialVersionUID = 4L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String pathStr = request.getParameter("path"); //パラメータがURLに含まれない場合はnull
		String textStr = request.getParameter("text"); //パラメータがURLに含まれない場合はnull
		String mimeStr = request.getParameter("mime"); //パラメータがURLに含まれない場合はnull

		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));

		if(authorStr==null || pathStr==null || textStr==null){
			response.sendError(404);
			//response.sendRedirect("error/404.html");
			return;
		}
		if(!authorStr.matches("^[_a-zA-Z0-9]{3,15}$") || pathStr.matches("..")){
			response.sendError(404);
			//response.sendRedirect("error/404.html");
			return;
		}

		pathStr = new String(pathStr.getBytes("ISO-8859-1"),"UTF-8");
		
		/*if(pathStr.startsWith("stack/") && !authorStr.equals(userStr)){
			String stackStr = pathStr.substring(6);
			stackStr = stackStr.substring(0,stackStr.indexOf("/")-1);
			xmapString xmap = new stackInfo().getInfo2(getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/"+stackStr+"/_stackinfo.xmap");
			if(xmap!=null && "private".equals(xmap.get("status"))){
				response.sendError(403);
				return;
			}
		}*/
		if(!authorStr.equals(userStr)){
			response.sendError(403);
			return;
		}
		 
		
		byte[] b = textStr.getBytes("UTF-8");
		if(mimeStr!=null && mimeStr.equals("base64png")){
			//base64変換(カードピクチャ用)
			String base64text = textStr.substring("data:image/png;base64,".length());
			base64text = base64text.replaceAll(" ","+");
			b = Base64.decode(base64text);
		}

		File file = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/"+pathStr);
		if(!file.exists()){
			if(!file.getParentFile().getParentFile().getParentFile().exists()){
				if(!file.getParentFile().getParentFile().getParentFile().getParentFile().exists()){
					response.sendError(500); //そんな深いディレクトリは要らないはず
					return;
				}
				file.getParentFile().getParentFile().getParentFile().mkdir();
			}
			if(!file.getParentFile().getParentFile().exists()){
				file.getParentFile().getParentFile().mkdir();
			}
			if(!file.getParentFile().exists()){
				file.getParentFile().mkdir();
			}
			file.createNewFile();
		}
		if(!file.canWrite() || file.isDirectory()){
			response.sendError(404);
			//response.sendRedirect("error/404.html");
			return;
		}

		BufferedOutputStream bos = null;
		try {
			bos = new BufferedOutputStream(new FileOutputStream(file));
			bos.write(b);
		} catch (IOException e) {
			throw e;
		} catch (Exception e) {
			throw new ServletException(e);
		} finally {
			if(bos!=null) bos.close();
		}
		
		response.setContentType("text/plain");
		PrintWriter out = response.getWriter();
		out.println("<doctype html><html>");
		out.println("<head>");
		out.println("<title>ok</title>");
		out.println("</head>");
		out.println("<body>");
		out.println("<div>ok</div>");
		out.println("</body>");
		out.println("</html>");
		
		//フォルダ容量を保存
		dirsize.set(getServletContext().getRealPath(".."), authorStr, pathStr);
	}
}
