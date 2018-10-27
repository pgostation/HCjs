package nyoicard;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class login extends HttpServlet {
	private static final long serialVersionUID = 1234L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.sendRedirect("./");
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String userStr = request.getParameter("user");
		String passwordStr = request.getParameter("password");
		String homeDir = getServletContext().getRealPath("..");

		ServletContext sc = this.getServletContext();
		Object blackObj = sc.getAttribute("blackList"+request.getRemoteAddr());
		if(blackObj!=null){
			Integer cntInt = (Integer)blackObj;
			if(cntInt>10){ //10回以上失敗していたら
				String errMsg = new javabeans.HTMLescape().escape("( ´・ω・)");
				errMsg = new String(errMsg.getBytes("UTF-8"),"ISO-8859-1");
				response.sendRedirect("error/freemsg.jsp?msg="+errMsg);
				return;
			}
		}
		
		boolean bSuccess = loginRun(userStr, passwordStr, homeDir, request, response);
		if(!bSuccess){
			String blackList = ((String)sc.getAttribute("blackList"));
			if(blackList==null) blackList = "";
			if(blackList.length()>512) blackList = blackList.substring(0,512);
			if(!blackList.contains(request.getRemoteAddr()+" ")){
				//blackListに追加
				sc.setAttribute("blackList",request.getRemoteAddr()+" "+blackList);
			}else{
				//blackListにすでにいる場合、カウントアップ
				Object cntObj = sc.getAttribute("blackList"+request.getRemoteAddr());
				Integer cntInt = new Integer(1);
				if(cntObj!=null){
					cntInt = (Integer)cntObj;
					cntInt++;
				}
				sc.setAttribute("blackList"+request.getRemoteAddr(), cntInt);
			}
		}
		else{
			//成功したらblackListカウントから消す
			if(sc.getAttribute("blackList"+request.getRemoteAddr())!=null){
				sc.removeAttribute("blackList"+request.getRemoteAddr());
			}
		}
	}
	
	public static boolean loginRun(String userStr, String passwordStr, String homeDir,
			HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException{
		if(userStr==null || userStr.startsWith("_") || passwordStr==null){
			//認証失敗
			response.setStatus(403);
			response.sendRedirect("login.jsp");
			return false;
		}

		byte[] hash = null;
		try {
			MessageDigest digest = MessageDigest.getInstance("MD5");
			hash = digest.digest(("HCjs"+passwordStr).getBytes());
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		if(hash==null){
			System.out.println("hash get error");
			response.sendError(500);
			return false;
		}
		String inputHashStr = hashToStr(hash);

		System.out.println("login.java: inputHashStr="+inputHashStr);
		
		//ユーザID, パスワードのハッシュで認証する
		File hashFile = new File(homeDir+"/user/"+userStr+"/_password.hash");
		if(!hashFile.exists()){
			//最初の文字の大文字小文字を変更する
			if(Character.isUpperCase(userStr.charAt(0))){
				userStr = userStr.substring(0,1).toLowerCase() + userStr.substring(1);
			}
			else {
				userStr = userStr.substring(0,1).toUpperCase() + userStr.substring(1);
			}
			hashFile = new File(homeDir+"/user/"+userStr+"/_password.hash");
		}
		if(!hashFile.exists() || hashFile.isDirectory()){
			System.out.println("login.java/hash file error");
			//ハッシュファイルが無い
			response.sendError(500);
			return false;
		}
		String correctHashStr = "";
		try {
			BufferedReader br = new BufferedReader(new FileReader(hashFile));
			correctHashStr = br.readLine();
			br.close();
		}catch(FileNotFoundException e){
			return false;
		}catch(IOException e){
			System.out.println(e);
		}
		System.out.println(inputHashStr);
		System.out.println(correctHashStr);
		if(!inputHashStr.equals(correctHashStr)){
			//認証失敗
			String sid = request.getSession().getId();
			String remoteuserStr = new javabeans.session().getUserId(sid, homeDir, request.getCookies());
			System.out.println(javabeans.log.make(request.getRequestURI(), request.getQueryString(), remoteuserStr, request.getRemoteAddr(), sid));

			/*try {
				Thread.sleep(3000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}*/
			response.setStatus(403);
			response.sendRedirect("login.jsp");
			return false;
		}
		
		//セッションIDを取得
		String sid = request.getSession().getId();
		
		//セッションIDとユーザIDを関連づける
		response.addCookie(new Cookie("userId", userStr));
		new javabeans.session().setSessionId(sid, homeDir, userStr, request.getRemoteAddr(), request.getHeader("User-Agent"));
		
	    response.sendRedirect(response.encodeURL("index.jsp"));
		
	    return true;
	}

	
	public static String hashToStr(byte bytes[]) {
		String str = "";

		for(int i=0; i<bytes.length; i++){
			if(bytes[i]<16)str += "0";
			str += Integer.toHexString(bytes[i]);
		}

		/// 16進数の文字列を返す。
		return str;
	}
}
