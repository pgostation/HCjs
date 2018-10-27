package nyoicard;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.channels.FileChannel;
import java.util.Date;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/createstack")
public class createstack extends HttpServlet{
	private static final long serialVersionUID = 5L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		RequestDispatcher dispatcher = request.getServletContext().getRequestDispatcher("/");
		dispatcher.forward(request,response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String lang = "en";
		String langStr = request.getHeader("accept-language");
		if (langStr != null && langStr.startsWith("ja")) {
			lang = "ja";
		}

    	System.out.println("lang+"+lang);
		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());

		String enStacknameStr = request.getParameter("stackname");
		String stacknameStr = enStacknameStr;
		//String categoryStr = request.getParameter("category");
		String cardsizeStr = request.getParameter("cardsize");

		if(userStr==null || enStacknameStr==null || /*categoryStr==null ||*/ cardsizeStr==null){
			RequestDispatcher dispatcher = request.getServletContext().getRequestDispatcher("/");
			dispatcher.forward(request,response);
			return;
		}

		if(enStacknameStr!=null){
			stacknameStr = new String(enStacknameStr.getBytes("ISO-8859-1"),"UTF-8");
		}

		if(!userStr.matches("^[_a-zA-Z0-9]{3,15}$")){
			//response.sendError(404);
			String errMsg = new javabeans.HTMLescape().escapeTrans("UserID failure.", lang);
			errMsg = new String(errMsg.getBytes("UTF-8"),"ISO-8859-1");
			response.sendRedirect("error/freemsg.jsp?msg="+errMsg);
			return;
		}

		if(stacknameStr.matches("..") || stacknameStr.matches("/")){
			//response.sendError(404);
			String errMsg = new javabeans.HTMLescape().escapeTrans("StackName failure.", lang);
			errMsg = new String(errMsg.getBytes("UTF-8"),"ISO-8859-1");
			response.sendRedirect("error/freemsg.jsp?msg="+errMsg);
			return;
		}
		if(stacknameStr.length()==0){
			String errMsg = new javabeans.HTMLescape().escapeTrans("StackName is empty.", lang);
			errMsg = new String(errMsg.getBytes("UTF-8"),"ISO-8859-1");
			response.sendRedirect("error/freemsg.jsp?msg="+errMsg);
			return;
		}

		String width="",height="";
	    try{
			width = cardsizeStr.split("\\*")[0];
			height = cardsizeStr.split("\\*")[1];
	    }
	    catch(Exception e){
	    	System.out.println(e);
	    }

		File userDir = new File(getServletContext().getRealPath("..")+"/user/"+userStr);
		if(!userDir.exists()){
			userDir.mkdir();
		}
		File parentDir = new File(getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/");
		if(!parentDir.exists()){
			parentDir.mkdir();
		}

		File file = new File(getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/"+stacknameStr);
		if(!file.exists()){
			file.mkdir();
		}
		else{
			String errMsg = new javabeans.HTMLescape().escapeTrans("The stack's name is duplicate.", lang);
			errMsg = new String(errMsg.getBytes("UTF-8"),"ISO-8859-1");
			response.sendRedirect("error/freemsg.jsp?msg="+errMsg);
			return;
		}
		if(!file.canWrite() || !file.isDirectory()){
			//response.sendError(404);
			String errMsg = new javabeans.HTMLescape().escapeTrans("Couldn't cleate a stack file.", lang);
			errMsg = new String(errMsg.getBytes("UTF-8"),"ISO-8859-1");
			response.sendRedirect("error/freemsg.jsp?msg="+errMsg);
			return;
		}
		

	    File dir = new File(getServletContext().getRealPath("..")+"/user/_newstack/");
	    File[] fnames = dir.listFiles();

	    //_newstackの内容をコピー
	    for(int i=0; i<fnames.length; i++){
		    String srcPath = dir.getAbsolutePath()+"/"+fnames[i].getName();
			String dstPath = file.getAbsolutePath()+"/"+fnames[i].getName();
			copyTransfer(srcPath,dstPath);
	    }

	    //idとカードサイズを置換
	    {
		    File jsonfile = new File(file.getAbsolutePath()+"/_stack2.json");
		    String outStr="";

		    //読み込み
		    try{
		    	BufferedReader br = new BufferedReader(new FileReader(jsonfile));
		    	String str;
		    	while((str = br.readLine()) != null){
		    		outStr += str;
		    	}
		    	br.close();
		    }catch(FileNotFoundException e){
		    	System.out.println(e);
		    }catch(IOException e){
		    	System.out.println(e);
		    }
			
		    //置換
		    int bgid = (int) (Math.random()*32768);
		    int cdid = (int) (Math.random()*32768);
		    outStr = outStr.replaceAll("_2742",bgid+"");
		    outStr = outStr.replaceAll("_14181",cdid+"");
		    outStr = outStr.replaceAll("_480",height);
		    outStr = outStr.replaceAll("_640",width);
		    
		    //書き込み
		    try{
		    	FileWriter filewriter = new FileWriter(jsonfile);
		    	filewriter.write(outStr);
		    	filewriter.close();
		    }catch(IOException e){
		    	System.out.println(e);
		    }
		}

	    //xmapに情報追加
	    {
		    File xmapfile = new File(file.getAbsolutePath()+"/_stackinfo.xmap");
		    String outStr="";

		    //読み込み
		    try{
		    	BufferedReader br = new BufferedReader(new FileReader(xmapfile));
		    	String str;
		    	while((str = br.readLine()) != null){
		    		outStr += str+"\n";
		    	}
		    	br.close();
		    }catch(FileNotFoundException e){
		    	System.out.println(e);
		    }catch(IOException e){
		    	System.out.println(e);
		    }
			
		    //置換
		    String statusStr = "private";
		    outStr = outStr.replaceAll("_480",height);
		    outStr = outStr.replaceAll("_640",width);
		    outStr += "\ncreatedate:"+new Date().toString();
		    outStr += "\nauthor:"+userStr;
		    //outStr += "\ncategory:"+categoryStr;
		    outStr += "\nstatus:"+statusStr;
		    
		    //書き込み
		    try{
		    	FileWriter filewriter = new FileWriter(xmapfile);
		    	filewriter.write(outStr);
		    	filewriter.close();
		    }catch(IOException e){
		    	System.out.println(e);
		    }
		}

	    //ページ移動
	    response.sendRedirect(response.encodeURL("stackinfo.jsp?author="+userStr+"&name="+URLEncoder.encode(stacknameStr, "UTF-8")));
	}

	private void copyTransfer(String srcPath, String destPath) throws IOException
	{
	    FileChannel srcChannel = null;
	    FileChannel destChannel = null;
	    try {
		    srcChannel = new FileInputStream(srcPath).getChannel();
			destChannel = new FileOutputStream(destPath).getChannel();
	        srcChannel.transferTo(0, srcChannel.size(), destChannel);
	    } finally {
	        srcChannel.close();
	        destChannel.close();
	    }
	}
}
