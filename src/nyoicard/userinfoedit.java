package nyoicard;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javabeans.stackInfo;
import javabeans.xmapString;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/userinfoedit")
public class userinfoedit extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String urlStr = request.getParameter("url"); //パラメータがURLに含まれない場合はnull
		String mailStr = request.getParameter("mailaddr"); //パラメータがURLに含まれない場合はnull
		String profileStr = request.getParameter("profile"); //パラメータがURLに含まれない場合はnull
		String changepassStr = request.getParameter("changepass"); //パラメータがURLに含まれない場合はnull
		String oldpassStr = request.getParameter("oldpass"); //パラメータがURLに含まれない場合はnull
		String newpassStr = request.getParameter("newpass"); //パラメータがURLに含まれない場合はnull

		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());

		if(userStr==null || userStr.equals("") || userStr.startsWith("_")){
			response.sendError(404);
			return;
		}

		if(urlStr==null || profileStr==null || mailStr==null || oldpassStr==null || newpassStr==null){
			response.sendError(500);
			return;
		}

		if(!mailStr.matches("^.+@.+$")){
			String errStr="mail address failure";
			if(errStr!=null){
				response.sendError(500);
				return;
			}
		}

		if(urlStr.equals("http://")){
			urlStr="";
		}
		
		mailStr = new String(mailStr.getBytes("ISO-8859-1"),"UTF-8");
		urlStr = new String(urlStr.getBytes("ISO-8859-1"),"UTF-8");
		profileStr = new String(profileStr.getBytes("ISO-8859-1"),"UTF-8");
		oldpassStr = new String(oldpassStr.getBytes("ISO-8859-1"),"UTF-8");
		newpassStr = new String(newpassStr.getBytes("ISO-8859-1"),"UTF-8");

		//パスワード更新
		if(changepassStr!=null){
			if(!newpassStr.matches("^.{6,32}$")){
				response.setStatus(500);
				String errMsg = new String("そのパスワードは短すぎます".getBytes("UTF-8"),"ISO-8859-1");
				response.sendRedirect("error/freemsg.jsp?msg="+new javabeans.HTMLescape().escape(errMsg));
				return;
			}
			//古いパスワードで認証する
			byte[] hash = null;
			try {
				MessageDigest digest = MessageDigest.getInstance("MD5");
				hash = digest.digest(("HCjs"+oldpassStr).getBytes());
			} catch (NoSuchAlgorithmException e) {
				e.printStackTrace();
			}
			if(hash==null){
				response.sendError(500);
				return;
			}
			String inputHashStr = login.hashToStr(hash);

			//ユーザID, パスワードのハッシュで認証する
			File hashFile = new File(getServletContext().getRealPath("..")+"/user/"+userStr+"/_password.hash");
			if(!hashFile.exists() || hashFile.isDirectory()){
				//ハッシュファイルが無い
				response.setStatus(500);
				String errMsg = new String("アカウントが壊れています(パスワードファイルが行方不明です)".getBytes("UTF-8"),"ISO-8859-1");
				response.sendRedirect("error/freemsg.jsp?msg="+new javabeans.HTMLescape().escape(errMsg));
				return;
			}
			String correctHashStr = "";
			try {
				BufferedReader br = new BufferedReader(new FileReader(hashFile));
				correctHashStr = br.readLine();
				br.close();
			}catch(FileNotFoundException e){
				return;
			}catch(IOException e){
				System.out.println(e);
			}
			if(!inputHashStr.equals(correctHashStr)){
				//認証失敗
				response.setStatus(500);
				String errMsg = new String("パスワードが異なります".getBytes("UTF-8"),"ISO-8859-1");
				response.sendRedirect("error/freemsg.jsp?msg="+new javabeans.HTMLescape().escape(errMsg));
				return;
			}

			//新しいhash計算
			byte[] newhash = null;
			try {
				MessageDigest digest = MessageDigest.getInstance("MD5");
				newhash = digest.digest(("HCjs"+newpassStr).getBytes());
			} catch (NoSuchAlgorithmException e) {
				e.printStackTrace();
			}
			if(newhash==null){
				System.out.println("hash get error");
				response.sendError(500);
				return;
			}
			String newHashStr = login.hashToStr(newhash);

			//_password.hash作成
			File tmpfile = new File(getServletContext().getRealPath("..")+"/user/"+userStr+"/_password.hash");
		    try{
		    	FileWriter filewriter = new FileWriter(tmpfile);
		    	filewriter.write(newHashStr);
		    	filewriter.close();
		    }catch(IOException e){
		    	System.out.println(e);
		    }
		}

		//xmap取得
		String pathStr = getServletContext().getRealPath("..")+"/user/"+userStr+"/_userinfo.xmap";
		xmapString xmap = new stackInfo().getInfo2(pathStr);
		if(xmap==null){
			response.setStatus(500);
			String errMsg = new String("ユーザ設定ファイルがありません".getBytes("UTF-8"),"ISO-8859-1");
			response.sendRedirect("error/freemsg.jsp?msg="+new javabeans.HTMLescape().escape(errMsg));
			return;
		}
		
		//xmap変更
		xmap.set("mailaddr", mailStr);
		xmap.set("url", urlStr);
		xmap.set("profile", profileStr);

		//xmap保存
		xmap.save(pathStr);
		
		
		response.sendRedirect("user.jsp?back&user="+userStr);
	}

}
