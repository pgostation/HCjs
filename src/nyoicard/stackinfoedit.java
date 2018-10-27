package nyoicard;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;

import javabeans.stackInfo;
import javabeans.xmapString;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/stackinfoedit")
public class stackinfoedit extends HttpServlet {
	private static final long serialVersionUID = 123L;
       
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("author"); //パラメータがURLに含まれない場合はnull
		String stackName = request.getParameter("name"); //パラメータがURLに含まれない場合はnull
		String categoryStr = request.getParameter("category"); //パラメータがURLに含まれない場合はnull
		String versionStr = request.getParameter("version"); //パラメータがURLに含まれない場合はnull
		String statusStr = request.getParameter("status"); //パラメータがURLに含まれない場合はnull
		String textStr = request.getParameter("text"); //パラメータがURLに含まれない場合はnull
		String renameStr = request.getParameter("rename"); //パラメータがURLに含まれない場合はnull
		String copyStr = request.getParameter("copy"); //パラメータがURLに含まれない場合はnull
		String protectStr = request.getParameter("protect"); //パラメータがURLに含まれない場合はnull
		
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());

		if(authorStr==null || stackName==null){
			response.sendError(404);
			return;
		}
		if(!authorStr.equals(userStr)){
			response.sendError(404);
			return;
		}

		if(categoryStr==null || versionStr==null || statusStr==null || textStr==null /*|| renameStr==null*/ || protectStr==null || copyStr==null){
			response.sendError(500);
			return;
		}

		String jaStackName = new String(stackName.getBytes("ISO-8859-1"),"UTF-8");
		categoryStr = new String(categoryStr.getBytes("ISO-8859-1"),"UTF-8");
		versionStr = new String(versionStr.getBytes("ISO-8859-1"),"UTF-8");
		statusStr = new String(statusStr.getBytes("ISO-8859-1"),"UTF-8");
		textStr = new String(textStr.getBytes("ISO-8859-1"),"UTF-8");
		if(renameStr!=null){
			renameStr = new String(renameStr.getBytes("ISO-8859-1"),"UTF-8");
		}
		copyStr = new String(copyStr.getBytes("ISO-8859-1"),"UTF-8");
		protectStr = new String(protectStr.getBytes("ISO-8859-1"),"UTF-8");

		//xmap取得
		String pathStr = getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+jaStackName+"/_stackinfo.xmap";
		xmapString xmap = new stackInfo().getInfo2(pathStr);
		if(xmap==null){
			response.sendError(500);
			return;
		}

		//公開以外から公開に変更したら公開日を変更する
		if(!(xmap.get("status")+"").equals("public") && statusStr.equals("public")){
			xmap.set("publicDate", Long.toString(System.currentTimeMillis()));
		}
		
		System.out.println(protectStr);
		if(protectStr.equals("noprotect")){
			statusStr = "private"; //非保護時は非公開のみ
		}
		
		//xmap変更
		xmap.set("category", categoryStr);
		xmap.set("version", versionStr);
		xmap.set("status", statusStr);
		xmap.set("text", textStr);
		xmap.set("copy", copyStr);
		xmap.set("protect", protectStr);

		//idがないときはid追加
		if(xmap.get("stackid")==null){
			xmap.set("stackid", Integer.toString((int)(Math.random()*100000)));
		}
		
		//xmap保存
		xmap.save(pathStr);
		
		// リネーム
		if(renameStr!=null && !renameStr.equals(jaStackName)){
			File dir = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+jaStackName);
			File renamedir = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+renameStr);
			if(renamedir.exists()){
				response.setStatus(500);
				String errMsg = new String("そのスタック名は使われています".getBytes("UTF-8"),"ISO-8859-1");
				response.sendRedirect("error/freemsg.jsp?msg="+new javabeans.HTMLescape().escape(errMsg));
				return;
			}
			dir.renameTo(renamedir);
		}

		//データベース更新
		File infoFile = new File(getServletContext().getRealPath("..")+"/user/_stacksearch.xmap");
		new javabeans.stacksearch().newXmap(getServletContext().getRealPath(".."), infoFile);
		
		//
		if(renameStr!=null){
			response.sendRedirect("stackinfo.jsp?back&author="+userStr+"&name="+URLEncoder.encode(renameStr,"UTF-8"));
		}else{			
			response.sendRedirect("stackinfo.jsp?back&author="+userStr+"&name="+URLEncoder.encode(jaStackName,"UTF-8"));
		}
	}

}
