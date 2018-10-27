package nyoicard;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/rsrcimgsize")
public class rsrcimgsize extends HttpServlet {
	private static final long serialVersionUID = 3L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String pathStr = request.getParameter("path"); //パラメータがURLに含まれない場合はnull
		String rsrcTypeStr = request.getParameter("rsrcType"); //パラメータがURLに含まれない場合はnull
		String rsrcIdStr = request.getParameter("rsrcId"); //パラメータがURLに含まれない場合はnull
		String widthStr = request.getParameter("width"); //パラメータがURLに含まれない場合はnull
		String heightStr = request.getParameter("height"); //パラメータがURLに含まれない場合はnull
		
		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		//log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));

		if(authorStr==null || pathStr==null || userStr==null || rsrcTypeStr==null || rsrcIdStr==null || widthStr==null || heightStr==null){
			response.sendError(404);
			return;
		}
		if(!userStr.equals(authorStr)){
			response.sendError(403);
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
		if(/*!file.exists() ||*/ file.isDirectory()){
			response.sendError(404);
			return;
		}

		/*if(pathStr.startsWith("stack/") && !authorStr.equals(userStr)){
			String stackStr = pathStr.substring(6);
			if(stackStr.indexOf("/")!=-1){
				stackStr = stackStr.substring(0,stackStr.indexOf("/"));
			}
			xmapString xmap = new stackInfo().getInfo2(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+stackStr+"/_stackinfo.xmap");

			if(xmap==null || xmap.get("status")==null || !xmap.get("status").matches("public.*")){
				response.sendError(403);
				return;
			}
		}*/
		
		int width = Integer.valueOf(widthStr);
		int height = Integer.valueOf(heightStr);

		//
		{
			BufferedImage bi = null;
			if(file.exists()){
				bi = javax.imageio.ImageIO.read(file);
			}else{
				bi = new BufferedImage(width, height, BufferedImage.TYPE_4BYTE_ABGR);
				javax.imageio.ImageIO.write(bi, "png", file);
			}
			if(bi==null){
				response.sendError(404);
				return;
			}
			if(bi.getWidth()==width && bi.getHeight()==height){
				//そのままでOK
			}
			else{
				//サイズ変更する
				BufferedImage newbi = new BufferedImage(width,height,BufferedImage.TYPE_INT_ARGB);
				Graphics2D g2 = (Graphics2D)newbi.getGraphics();
				g2.drawImage(bi, 0, 0, null);
				javax.imageio.ImageIO.write(newbi, "png", file);
			}
		}

		response.setContentType("text/plain");
		PrintWriter out = response.getWriter();
		out.println("ok");
		out.close();
		
		return;
	}
}
