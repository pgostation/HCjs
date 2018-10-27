package nyoicard;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

import javabeans.fileList;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/deleteGuest")
public class deleteGuest extends HttpServlet {
	private static final long serialVersionUID = 2L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		//login.loginRun("", "", getServletContext().getRealPath(".."), request, response);

		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		if(!userStr.equals("admin")){
			response.sendError(403);
			return;
		}

		int cnt = deleteOld();

		response.setContentType("text/plain");
		PrintWriter out = response.getWriter();
		out.println("Deleted "+cnt+" guest id");
		out.close();
	}

	private int deleteOld()
	{
		int cnt = 0;
		String users = new fileList().getList(getServletContext().getRealPath("..") +"/user/");
		String[] userlist = users.split("\n");
		for(int user_idx=0; user_idx<userlist.length; user_idx++){
			String userStr = new File(userlist[user_idx]).getName();
			//guest発見
			if(userStr.startsWith("_guest")){
				//古ければ消す
				long mod = new File(userlist[user_idx]).lastModified();
				if(new Date().getTime() - mod > 7*24*60*60*1000){ //1週間より前に作られたguestは削除
					new File(userlist[user_idx]).delete();
					cnt++;
				}
			}
		}
		
		return cnt;//削除数
	}
}
