package nyoicard;

import java.io.File;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/stackdelete")
public class stackdelete extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("author"); //パラメータがURLに含まれない場合はnull
		String stackName = request.getParameter("name"); //パラメータがURLに含まれない場合はnull
		
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());

		if(authorStr==null || stackName==null){
			response.sendError(404);
			return;
		}
		if(!authorStr.equals(userStr)){
			response.sendError(403);
			return;
		}
		

		stackName = new String(stackName.getBytes("ISO-8859-1"),"UTF-8");
		
		//このディレクトリを移動する
		String pathStr = getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+stackName;
		File dir = new File(pathStr);
		if(!dir.exists()){
			response.sendError(404);
			return;
		}

		//ゴミ箱ディレクトリ作成
		String newPathStr2 = getServletContext().getRealPath("..")+"/user/_deletedStack";
		File newdir2 = new File(newPathStr2);
		if(!newdir2.exists()){
			newdir2.mkdir();
		}
		String newPathStr1 = getServletContext().getRealPath("..")+"/user/_deletedStack/"+authorStr;
		File newdir1 = new File(newPathStr1);
		if(!newdir1.exists()){
			newdir1.mkdir();
		}

		//rename
		String newPathStr = getServletContext().getRealPath("..")+"/user/_deletedStack/"+authorStr+"/"+stackName;
		while(new File(newPathStr).exists()){
			newPathStr += "_";
		}
		File newdir = new File(newPathStr);
		dir.renameTo(newdir);

		response.sendRedirect("stacks.jsp");

	}

}
