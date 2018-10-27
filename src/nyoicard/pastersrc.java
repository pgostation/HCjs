package nyoicard;

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

@WebServlet("/pastersrc")
public class pastersrc extends HttpServlet{
	private static final long serialVersionUID = 4L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String pathStr = request.getParameter("path"); //パラメータがURLに含まれない場合はnull
		
		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));

		if(authorStr==null || pathStr==null){
			response.sendError(404);
			return;
		}
		if(!authorStr.matches("^[_a-zA-Z0-9]{3,15}$") || pathStr.matches("..")){
			response.sendError(404);
			return;
		}

		pathStr = new String(pathStr.getBytes("ISO-8859-1"),"UTF-8");
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
		if(!clipDir.exists()){
			System.out.println("clip dir is not exist");
			return;
		}

		File jsonfile = new File(clipDir.getAbsolutePath()+"/json.txt");
		if(!jsonfile.exists()){
			System.out.println("clip json is not exist");
			return;
		}

		//JSON読み込み
		byte[] b = new byte[(int)jsonfile.length()];
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
		
		//ファイルのコピー
		{
			File[] delFiles = clipDir.listFiles();
			for(int i=0; i<delFiles.length; i++){
				File srcFile = delFiles[i];
				String destPath = getServletContext().getRealPath("..")+"/user/"+userStr+"/"+pathStr+"/"+srcFile.getName();
				FileChannel srcChannel = null;
				FileChannel destChannel = null;
				try {
					srcChannel = new FileInputStream(srcFile.getAbsolutePath()).getChannel();
					destChannel = new FileOutputStream(destPath).getChannel();
					srcChannel.transferTo(0, srcChannel.size(), destChannel);
				} finally {
					srcChannel.close();
					destChannel.close();
				}
			}
		}
		
		response.setContentType("text/plain");
		PrintWriter out = response.getWriter();
		out.println(new String(b,"UTF-8"));
		
		//フォルダ容量を保存
		dirsize.set(getServletContext().getRealPath(".."), authorStr, pathStr);
	}
}
