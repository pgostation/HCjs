package nyoicard;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;

import javabeans.stackInfo;
import javabeans.xmapString;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/sharedText")
public class sharedText extends HttpServlet {
	private static final long serialVersionUID = 124;
       
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("author"); //パラメータがURLに含まれない場合はnull
		String stackName = request.getParameter("name"); //パラメータがURLに含まれない場合はnull
		String fileStr = request.getParameter("file"); //パラメータがURLに含まれない場合はnull
		String userStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String textStr = request.getParameter("text"); //パラメータがURLに含まれない場合はnull
		
		String sid = request.getSession().getId();
		String userStr2 = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());

		if(authorStr==null || stackName==null || userStr==null || fileStr==null){
			response.sendError(404);
			return;
		}
		if(!userStr.equals("_all") && !userStr.equals(userStr2)){
			response.sendError(403);
			return;
		}

		if(fileStr.length()>100 || fileStr.indexOf("..")!=-1 || fileStr.indexOf("/")!=-1){
			response.sendError(500);
			return;
		}

		String jaStackName = new String(stackName.getBytes("ISO-8859-1"),"UTF-8");
		fileStr = new String(fileStr.getBytes("ISO-8859-1"),"UTF-8");
		if(textStr!=null){
			textStr = new String(textStr.getBytes("ISO-8859-1"),"UTF-8");
		}

		String pathStr = getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+jaStackName+"/sharedText_"+fileStr+".xmap";

		FileOutputStream fo=null;
		try {
		    File lockFile = new File(pathStr+".lock");
		    lockFile.deleteOnExit();

		    fo = new FileOutputStream(lockFile);//lockのためのダミー
		    FileChannel fc = fo.getChannel();

		    FileLock lock = fc.tryLock();
		    
		    if (lock == null) {
		        new RuntimeException("locking now");
		    }
		
			//xmap取得
			xmapString xmap = new stackInfo().getInfo2(pathStr);
			if(xmap==null){
				if(authorStr.equals(userStr2)){
					xmap = new xmapString("");
				}else{
					response.sendError(500);
					return;
				}
			}
	
			if(textStr==null){
				if(userStr.equals("_all")){
					//すべてのxmap取得
					String[] keyList = xmap.getAllKeys();
					
					response.setContentType("text/plain; charset=utf-8");
					PrintWriter out = response.getWriter();
					for(int i=0; i<keyList.length; i++){
						String value = xmap.get(keyList[i]);
						if(value==null) continue;
						out.println(keyList[i]);
						out.println(value.replaceAll("\n", "\\n"));
					}
				}else{
					//xmap取得
					String getStr = xmap.get(userStr);
					
					response.setContentType("text/plain; charset=utf-8");
					PrintWriter out = response.getWriter();
					out.println(getStr);
				}
			}else{
				//xmap変更
				xmap.set(userStr, textStr);
				//xmap保存
				xmap.save(pathStr);
				response.setContentType("text/plain");
				PrintWriter out = response.getWriter();
				out.println("ok");
			}
		} catch (Exception e) {
		    e.printStackTrace();
		} finally {
		    if(fo!=null){fo.close();}
		}
		
	}

}
