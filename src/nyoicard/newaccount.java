package nyoicard;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javabeans.xmapString;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/newaccount")
public class newaccount extends HttpServlet {
	private static final long serialVersionUID = 2L;

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String userStr = request.getParameter("user");
		String mailStr = request.getParameter("mail");
		String passwordStr = request.getParameter("password");
		String botStr = request.getParameter("bot");
		String terms_accept = request.getParameter("terms_accept");
		String errStr = null;
		System.out.println("userStr:"+userStr);
		System.out.println("mailStr:"+mailStr);
		System.out.println("passwordStr:"+passwordStr);
		System.out.println("botStr:"+botStr);

		if(userStr==null || mailStr==null || passwordStr==null || terms_accept==null || botStr==null || botStr.length()!=0){
			System.out.println("xx");
			response.sendError(500);
			//response.sendRedirect("error/500.html");
			return;
		}

		if(!userStr.matches("^[_A-Za-z0-9]{3,15}$")){
			errStr="user id failure";
		}
		if(userStr.equals("admin")){
			errStr="user id failure";
		}

		if(!mailStr.matches("^.+@.+$")){
			errStr="mail address failure";
		}

		if(!passwordStr.matches("^.{6,32}$")){
			errStr="password failure";
		}

		if(!create(userStr, passwordStr, mailStr)){
			errStr="user id dupilicate";
		}

		if(errStr!=null){
			String lang = "en";
			String langStr = request.getHeader("accept-language");
			if (langStr != null && langStr.startsWith("ja")) {
				lang = "ja";
			}
		
			String errMsg = new javabeans.HTMLescape().escapeTrans(errStr, lang);
			errMsg = new String(errMsg.getBytes("UTF-8"),"ISO-8859-1");
			response.sendRedirect("error/freemsg.jsp?msg="+errMsg);
			return;
		}

		login.loginRun(userStr, passwordStr, getServletContext().getRealPath(".."), request, response);
		
		//response.sendRedirect("./");
	}

	private boolean create(String userStr, String passwordStr, String mailStr)
	{
		//user名のディレクトリ作成
		String tmpPath = getServletContext().getRealPath("..")+"/user/"+userStr;
		File tmpdir = new File(tmpPath);
		if(tmpdir.exists()){
			return false;
		}
		//最初の文字を大文字小文字変更する
		{
			String userStr2;
			if(Character.isUpperCase(userStr.charAt(0))){
				userStr2 = userStr.substring(0,1).toLowerCase() + userStr.substring(1);
			}
			else {
				userStr2 = userStr.substring(0,1).toUpperCase() + userStr.substring(1);
			}
			String tmpPath2 = getServletContext().getRealPath("..")+"/user/"+userStr2;
			File tmpdir2 = new File(tmpPath2);
			if(tmpdir2.exists()){
				return false;
			}
		}
		tmpdir.mkdir();

		//stackディレクトリ作成
		File tmpdir2 = new File(tmpPath+"/stack");
		if(!tmpdir2.exists()){
			tmpdir2.mkdir();
		}
		
		//hash計算
		byte[] hash = null;
		try {
			MessageDigest digest = MessageDigest.getInstance("MD5");
			hash = digest.digest(("HCjs"+passwordStr).getBytes());
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		if(hash==null){
			System.out.println("hash get error");
			return false;
		}
		String inputHashStr = login.hashToStr(hash);

		//_password.hash作成
		File tmpfile = new File(tmpPath+"/_password.hash");
	    try{
	    	FileWriter filewriter = new FileWriter(tmpfile);
	    	filewriter.write(inputHashStr);
	    	filewriter.close();
	    }catch(IOException e){
	    	System.out.println(e);
	    }
		
		//_mailaddr作成
	    {
			//xmap取得
			String pathStr = getServletContext().getRealPath("..")+"/user/"+userStr+"/_userinfo.xmap";
			xmapString xmap = new xmapString("");//new stackInfo().getInfo2(pathStr);
			
			//xmap変更
			xmap.set("mailaddr", mailStr);
	
			//xmap保存
			xmap.save(pathStr);
		}
	
		return true;//成功
	}
}
