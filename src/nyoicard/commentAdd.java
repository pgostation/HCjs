package nyoicard;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javabeans.captcha;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/commentAdd")
public class commentAdd extends HttpServlet{
	private static final long serialVersionUID = 6L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		RequestDispatcher dispatcher = request.getServletContext().getRequestDispatcher("/");
		dispatcher.forward(request,response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String commentName = request.getParameter("commentName");
		String commentText = request.getParameter("commentText");
		String ipAddrStr = request.getRemoteAddr();
		String authorStr = request.getParameter("author");
		String stacknameStr = request.getParameter("stackname");
		String seedStr = request.getParameter("seed");
		String captchaStr = request.getParameter("captcha");

		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());

		if(commentName==null || commentText==null || stacknameStr==null || authorStr==null || seedStr==null || captchaStr==null){
			RequestDispatcher dispatcher = request.getServletContext().getRequestDispatcher("/");
			dispatcher.forward(request,response);
			return;
		}

		commentName = new String(commentName.getBytes("ISO-8859-1"),"UTF-8");
		commentText = new String(commentText.getBytes("ISO-8859-1"),"UTF-8");
		stacknameStr = new String(stacknameStr.getBytes("ISO-8859-1"),"UTF-8");
		authorStr = new String(authorStr.getBytes("ISO-8859-1"),"UTF-8");

		if(userStr!=null && !userStr.matches("^[_a-zA-Z0-9]{3,15}$")){
			response.sendError(404);
			return;
		}

		if(!new captcha().isCorrect(seedStr,captchaStr)){
			response.setContentType("text/html");
			PrintWriter out = response.getWriter();
			out.println("<!doctype html><html lang=ja><head><meta charset=utf-8>");
			out.println("<title>comment add</title>");
			out.println("<script type='text/javascript'>setTimeout(function(){window.history.back();},2000);</script>");
			out.println("</head>");
			out.println("<div>"+new String("数字が一致しません".getBytes("UTF-8"),"ISO-8859-1")+"</div>");
			out.println("</body></html>");
			return;
		}
		
		boolean writeOK = false;
		File file = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+stacknameStr);

	    //xmapに情報追加
	    File xmapfile = new File(file.getPath()+"/_stackinfo.xmap");
	    String outStr="";

	    //読み込み
	    BufferedReader br=null;
	    try{
	    	br = new BufferedReader(new FileReader(xmapfile));
	    	String str;
	    	int i=-1;
	    	Pattern p = Pattern.compile("^comment([0-9]*):.*");
	    	while((str = br.readLine()) != null){
	    		outStr += str+"\n";
	    		System.out.println(str);
		    	Matcher m = p.matcher(str);
		    	if(m.matches()){
		    		i = Integer.valueOf(m.group(1));
		    	}
	    	}
	    	
	    	i++;
		    outStr += "\ncomment"+Integer.toString(i)+":"+commentText.replaceAll("%","%%").replaceAll("(\\r\\n)|(\\n)","%n");
		    outStr += "\ncommentName"+Integer.toString(i)+":"+commentName.replaceAll("%","%%").replaceAll("(\\r\\n)|(\\n)","%n");
		    outStr += "\ncommentDate"+Integer.toString(i)+":"+new Date().toString();
		    outStr += "\ncommentHost"+Integer.toString(i)+":"+ipAddrStr;
		    outStr += "\ncommentUser"+Integer.toString(i)+":"+(userStr!=null?userStr:"");
	    }catch(IOException e){
	    	System.out.println(e);
	    }finally{
	    	if(br!=null)br.close();
	    }

		FileOutputStream fo=null;
		try {
		    File lockFile = new File((file.getPath()+"/_stackinfo.xmap"));
		    lockFile.deleteOnExit();

		    fo = new FileOutputStream(lockFile);//lockのためのダミー
		    FileChannel fc = fo.getChannel();

		    FileLock lock = fc.tryLock();
		    
		    if (lock == null) {
		        new RuntimeException("ロック中");
		    }

		    FileWriter filewriter=null;
		    try {
			    //書き込み
		    	filewriter = new FileWriter(xmapfile);
		    	filewriter.write(outStr);
		    	writeOK=true;
		    } catch(IOException e){
		    	System.out.println(e);
		    } finally {
		        // ロックの開放
		        if(lock!=null)lock.release();
		    	if(filewriter!=null)filewriter.close();
		    }
		} catch (Exception e) {
		    e.printStackTrace();
		} finally {
		    if(fo!=null){fo.close();}
		}

	    //ページ移動
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		out.println("<!doctype html><html lang=ja><head><meta charset=utf-8>");
		out.println("<title>comment add</title>");
		out.println("<script type='text/javascript'>setTimeout(function(){location.href=\"./stackinfo.jsp?author="+authorStr+"&name="+URLEncoder.encode(stacknameStr, "UTF-8")+"\";},100);</script>");
		out.println("</head>");
		out.println("<div>"+(writeOK?"ok":"ng")+"</div>");
		out.println("</body></html>");
	}
}