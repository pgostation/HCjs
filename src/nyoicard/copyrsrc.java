package nyoicard;

import java.io.BufferedOutputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.channels.FileChannel;

import javabeans.dirsize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/copyrsrc")
public class copyrsrc extends HttpServlet{
	private static final long serialVersionUID = 4L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String pathStr = request.getParameter("path"); //パラメータがURLに含まれない場合はnull
		String rsrcTitleStr = request.getParameter("rsrctitle"); //パラメータがURLに含まれない場合はnull
		String rsrcJsonStr = request.getParameter("rsrcjson"); //パラメータがURLに含まれない場合はnull
		String srcFileStr = request.getParameter("srcfile"); //パラメータがURLに含まれない場合はnull
		String dstFileStr = request.getParameter("dstfile"); //パラメータがURLに含まれない場合はnull
		String clearStr = request.getParameter("clear"); //パラメータがURLに含まれない場合はnull
		
		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));

		if(authorStr==null || pathStr==null || rsrcTitleStr==null || rsrcJsonStr==null || srcFileStr==null || dstFileStr==null){
			System.out.println("parameter null");
			response.sendError(404);
			return;
		}
		if(!authorStr.matches("^[_a-zA-Z0-9]{3,15}$") || pathStr.matches("..") || srcFileStr.matches("..")){
			response.sendError(404);
			return;
		}

		pathStr = new String(pathStr.getBytes("ISO-8859-1"),"UTF-8");
		if(pathStr.indexOf("?")!=-1){
			pathStr = pathStr.substring(0,pathStr.indexOf("?"));
		}

		rsrcJsonStr = new String(rsrcJsonStr.getBytes("ISO-8859-1"),"UTF-8");
		/*if(pathStr.startsWith("stack/") && !authorStr.equals(userStr)){
			String stackStr = pathStr.substring(6);
			stackStr = stackStr.substring(0,stackStr.indexOf("/")-1);
			xmapString xmap = new stackInfo().getInfo2(getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/"+stackStr+"/_stackinfo.xmap");
			if(xmap!=null && "private".equals(xmap.get("status"))){
				response.sendError(403);
				return;
			}
		}*/
		if(!authorStr.equals(userStr)){
			response.sendError(403);
			return;
		}

		File clipDir = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/_clip");
		if(clearStr!=null && clearStr.equals("true")){
			//clipboardディレクトリを空にする
			if(!clipDir.exists()){
				clipDir.mkdir();
			}
			File[] delFiles = clipDir.listFiles();
			for(int i=0; i<delFiles.length; i++){
				delFiles[i].delete();
			}
		}

		File jsonfile = new File(clipDir.getAbsolutePath()+"/json.txt");
		if(!jsonfile.exists()){
			jsonfile.createNewFile();
		}
		if(!jsonfile.canWrite() || jsonfile.isDirectory()){
			response.sendError(500);
			return;
		}

		{
			//JSON読み込み
			rsrcJsonStr = "\n"+rsrcJsonStr;
			byte[] b = new byte[(int)jsonfile.length()+rsrcJsonStr.getBytes("UTF-8").length];
			{
				DataInputStream dis = null;
				try {
					dis = new DataInputStream(new FileInputStream(jsonfile));
				} catch (FileNotFoundException e) {
					e.printStackTrace();
				}
				
				if(dis==null){
					response.sendError(500);
					return;
				}
		
				while(true)
				{
					int size = dis.read(b);
					if(size==-1) break;
				}
				dis.close();
			}
	
			//JSON追記
			byte[] jb = rsrcJsonStr.getBytes("UTF-8");
			int j = (int)jsonfile.length();
			for(int i=0; i<jb.length; i++){
				b[j+i] = jb[i];
			}
			
			//JSON書き込み
			BufferedOutputStream bos = null;
			try {
				bos = new BufferedOutputStream(new FileOutputStream(jsonfile));
				bos.write(b);
			} catch (IOException e) {
				throw e;
			} catch (Exception e) {
				throw new ServletException(e);
			} finally {
				if(bos!=null) bos.close();
			}
		}
		
		//ファイルのコピー
		{
			String srcPath = getServletContext().getRealPath("..")+"/user/"+userStr+"/"+pathStr+"/"+srcFileStr;
			if(new File(srcPath).exists()){
				String destPath = clipDir.getAbsolutePath()+"/"+dstFileStr;
				FileChannel srcChannel = null;
				FileChannel destChannel = null;
				try {
					srcChannel = new
							FileInputStream(srcPath).getChannel();
					destChannel = new
							FileOutputStream(destPath).getChannel();
					srcChannel.transferTo(0, srcChannel.size(), destChannel);
				} finally {
					srcChannel.close();
					destChannel.close();
				}
			}else{
				System.out.println("no file:"+srcFileStr);
			}
		}
		
		response.setContentType("text/plain");
		PrintWriter out = response.getWriter();
		out.println("ok");
		
		//フォルダ容量を保存
		dirsize.set(getServletContext().getRealPath(".."), authorStr, pathStr);
	}
}
