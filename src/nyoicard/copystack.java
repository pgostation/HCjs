package nyoicard;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.channels.FileChannel;

import javabeans.dirsize;
import javabeans.environment;
import javabeans.stackInfo;
import javabeans.xmapString;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/copystack")
public class copystack extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request,response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("author"); //パラメータがURLに含まれない場合はnull
		String stackName = request.getParameter("name"); //パラメータがURLに含まれない場合はnull

		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));

		if(authorStr==null || stackName==null){
			System.out.println("authorStr:"+authorStr);
			System.out.println("stackName:"+stackName);
			response.sendError(404);
			return;
		}
		if(userStr==null){
			System.out.println("userStr:"+userStr);
			response.sendError(403);
			return;
		}
		
		authorStr = new String(authorStr.getBytes("ISO-8859-1"),"UTF-8");
		stackName = new String(stackName.getBytes("ISO-8859-1"),"UTF-8");

		//コピー不許可
		String pathStr = getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+stackName+"/_stackinfo.xmap";
		xmapString xmap = new stackInfo().getInfo2(pathStr);
		String copyStr = "";
		if(xmap!=null) copyStr = xmap.get("copy");
		String statusStr = "";
		if(xmap!=null) statusStr = xmap.get("status");
		if(copyStr==null || !copyStr.equals("copy_public") || (!userStr.equals(authorStr) && statusStr.equals("private"))){
			System.out.println("not copy_public");
			response.sendError(500);
			return;
		}
		
		//ディスク容量制限
		long filesizeMax;
		filesizeMax = environment.getUserDiskSpace(userStr) 
				- dirsize.readSize(getServletContext().getRealPath("..")+"/user/"+userStr+"/_dirsize");
		long stackSize = dirsize.readSize(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+stackName+"/_dirsize");
		if(stackSize > filesizeMax){
			System.out.println("copystack disk full");
			response.sendError(500);
			return;
		}
		
		//ディレクトリごとコピー
		String dstName = stackName;
		if(userStr.equals(authorStr)){
			dstName = stackName +" 2";
		}
		String dstPath = getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/"+dstName;
		int i=2;
		while(new File(dstPath).exists()){
			dstName = stackName+" "+i;
			dstPath = getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/"+dstName;
			i++;
		}
		try{
		copyDirectory(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+stackName,
				dstPath);
		}catch(Exception e){
			System.out.println("copystack: copy error");
			response.sendError(500);
			return;
		}
		
		//xmapで「非公開」「公開日なし」にする
		{
		//xmap取得
			String xmapPathStr = getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/"+dstName+"/_stackinfo.xmap";
			xmapString xmap2 = new stackInfo().getInfo2(xmapPathStr);
			if(xmap2==null){
				System.out.println("copystack: xmapfile not found");
				response.sendError(500);
				return;
			}
	
			//xmap変更
			xmap.set("status", "private");
			xmap.set("author", userStr);
			{
				String origAuthorStr = xmap.get("origAuthor");
				if(origAuthorStr==null) origAuthorStr = "";
				if(!authorStr.equals(userStr)){
					if(origAuthorStr.length()>0){
						origAuthorStr = origAuthorStr +":"+ authorStr;
					}else{
						origAuthorStr = authorStr;
					}
				}
				if(origAuthorStr.length()>0){
					xmap.set("origAuthor", origAuthorStr);
				}
			}

			//stackid変更
			xmap.set("stackid", Integer.toString((int)(Math.random()*100000)));
			
			//xmap保存
			xmap.save(xmapPathStr);
		}
		
		//
		response.sendRedirect("stackinfo.jsp?author="+userStr+"&name="+URLEncoder.encode(dstName,"UTF-8"));
	}

	private static void copyDirectory(String srcPath, String destPath) throws Exception {
		//サブディレクトリ内までたどってコピーする
		File srcDir = new File(srcPath);
		File destDir = new File(destPath);
		if(!srcDir.exists() || !srcDir.isDirectory()) return;
		File[] files = srcDir.listFiles();
		if(!destDir.mkdir()) throw new Exception("mkdir error");
		for(File f:files){
			if(f.isDirectory()){
				copyDirectory(f.getAbsolutePath(), destDir+"/"+f.getName());
			}else{
				copyTransfer(f.getAbsolutePath(), destDir+"/"+f.getName());
			}
		}
	}

	private static void copyTransfer(String srcPath, String destPath) 
			throws IOException {

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
