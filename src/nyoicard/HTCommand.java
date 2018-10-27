package nyoicard;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/HTCommand")
public class HTCommand extends HttpServlet {
	private static final long serialVersionUID = 3L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String nameStr = request.getParameter("name"); //パラメータがURLに含まれない場合はnull
		String cmdStr = request.getParameter("cmd"); //パラメータがURLに含まれない場合はnull
		String optStr = request.getParameter("opt"); //パラメータがURLに含まれない場合はnull
		String opt2Str = request.getParameter("opt2"); //パラメータがURLに含まれない場合はnull
		String opt3Str = request.getParameter("opt3"); //パラメータがURLに含まれない場合はnull
		
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));

		if(authorStr==null || nameStr==null || userStr==null || cmdStr==null || optStr==null || opt2Str==null || opt3Str==null){
			response.sendError(404);
			return;
		}
		nameStr = new String(nameStr.getBytes("ISO-8859-1"),"UTF-8");
		optStr = new String(optStr.getBytes("ISO-8859-1"),"UTF-8");
		opt2Str = new String(opt2Str.getBytes("ISO-8859-1"),"UTF-8");
		opt3Str = new String(opt3Str.getBytes("ISO-8859-1"),"UTF-8");

		if(!authorStr.matches("^[_a-zA-Z0-9]{3,15}$") || nameStr.matches(".*\\.\\..*")){
			response.sendError(404);
			return;
		}

		File stackDir = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+nameStr);
		if(!stackDir.exists() || !stackDir.isDirectory()){
			response.sendError(404);
			return;
		}
		
		if(cmdStr.equals("openfile")){
			File file = new File(stackDir.getAbsolutePath()+"/"+optStr);
			if(file.isDirectory()){
				response.sendError(404);
				return;
			}
		}
		else if(cmdStr.equals("readfile")){
			File file = new File(stackDir.getAbsolutePath()+"/"+optStr);
			if(!file.exists() || file.isDirectory()){
				response.sendError(404);
				return;
			}

			response.setHeader("Content-Length",file.length()+"");
			
			ServletOutputStream binOut = response.getOutputStream();

			DataInputStream dis = null;
			try {
				dis = new DataInputStream(new FileInputStream(file));
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}
			
			if(dis==null){
				response.sendError(500);
				//response.sendRedirect("error/500.html");
				return;
			}

			while(true)
			{
				byte[] b = new byte[4096];
				int size = dis.read(b);
				if(size<=0) break;
				binOut.write(b,0,size);
			}
			dis.close();
			binOut.close();
		}
		else if(cmdStr.equals("writefile")){
			File file = new File(stackDir.getAbsolutePath()+"/"+optStr);
			if(file.isDirectory()){
				response.sendError(404);
				return;
			}if(!file.exists()){
				file.createNewFile();
			}
			
			int at = 0;
			if(opt2Str.matches("^[-0-9]+$")){
				at = Integer.valueOf(opt2Str);
			}
			String text = opt3Str;
			
			if(at==0){
				//最初から書き込む
				FileWriter filewriter = new FileWriter(file);
				filewriter.write(text);
		        filewriter.close();
			}
			else if(at==-1){
				//続きに書き込む
				FileWriter filewriter = new FileWriter(file, true);
				filewriter.write(text);
		        filewriter.close();
			}
		}
		
		return;
	}
}
