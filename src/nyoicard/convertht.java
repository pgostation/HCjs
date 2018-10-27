package nyoicard;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class convertht extends HttpServlet {
	private static final long serialVersionUID = 3L;
	convhypertalk ttalk = new convhypertalk();

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String htStr = request.getParameter("hypertalk"); //パラメータがURLに含まれない場合はnull
		String xfcnStr = request.getParameter("xfcn"); //パラメータがURLに含まれない場合はnull

		if(htStr==null){
			response.sendError(500);
			return;
		}
		//htStr = new String(htStr.getBytes("ISO-8859-1"),"UTF-8");

		if(xfcnStr==null){
			xfcnStr="";
		}
		
		String jsStr = ttalk.convertHTStr2JS(htStr, xfcnStr);

		response.setContentType("text/html; charset=UTF-8");
		PrintWriter out = response.getWriter();
		out.println(jsStr);

		return;
	}
}
