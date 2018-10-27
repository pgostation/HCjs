package nyoicard;

import java.io.File;
import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/userdelete")
public class userdelete extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());

		if(userStr==null || userStr.equals("") || userStr.startsWith("_")){
			response.sendError(404);
			return;
		}
		
		//削除
		File dir = new File(getServletContext().getRealPath("..")+"/user/"+userStr);
		File dir2 = new File(getServletContext().getRealPath("..")+"/user/__"+userStr+"_"+Integer.toString((int)(Math.random()*100)));
		dir.renameTo(dir2);

		RequestDispatcher dispatcher = request.getServletContext().getRequestDispatcher("./");
		dispatcher.forward(request,response);
	}

}
