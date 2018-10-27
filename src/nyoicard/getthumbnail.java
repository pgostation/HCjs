package nyoicard;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/getthumbnail")
public class getthumbnail extends HttpServlet {
	private static final long serialVersionUID = 3L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String pathStr = request.getParameter("path"); //パラメータがURLに含まれない場合はnull
		//String downloadStr = request.getParameter("download"); //パラメータがURLに含まれない場合はnull
		String modifiedSinceStr = request.getHeader("If-Modified-Since");
		
		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		//log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));

		if(authorStr==null || pathStr==null || userStr==null){
			response.sendError(404);
			return;
		}
		/*if(!userStr.equals(authorStr)){//サムネイルを見るのは自分だけだし
			response.sendError(403);
			return;
		}*/
		pathStr = new String(pathStr.getBytes("ISO-8859-1"),"UTF-8");
		if(pathStr.indexOf("?")!=-1){
			pathStr = pathStr.substring(0,pathStr.indexOf("?"));
		}

		if(!authorStr.matches("^[_a-zA-Z0-9]{3,15}$") || pathStr.matches(".*\\.\\..*")){
			response.sendError(404);
			return;
		}

		if(pathStr.startsWith("/")){
			pathStr = pathStr.substring(1);
		}
		pathStr = pathStr.replaceAll("/\\./","/");

		if(pathStr.startsWith("/") || pathStr.startsWith(".")){
			response.sendError(404);
			return;
		}

		File file = new File(getServletContext().getRealPath("..")+"/user/"+authorStr+"/"+pathStr);
		if(!file.exists() || file.isDirectory()){
			response.sendError(404);
			return;
		}

		/*if(pathStr.startsWith("stack/") && !authorStr.equals(userStr)){
			String stackStr = pathStr.substring(6);
			if(stackStr.indexOf("/")!=-1){
				stackStr = stackStr.substring(0,stackStr.indexOf("/"));
			}
			xmapString xmap = new stackInfo().getInfo2(getServletContext().getRealPath("..")+"/user/"+authorStr+"/stack/"+stackStr+"/_stackinfo.xmap");

			if(xmap==null || xmap.get("status")==null || !xmap.get("status").matches("public.*")){
				response.sendError(403);
				return;
			}
		}*/

		System.out.println(modifiedSinceStr);
		if(modifiedSinceStr!=null){
			//キャッシュが使える？
			SimpleDateFormat sdf = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", Locale.US);
			try {
				Date sinceDate = sdf.parse(modifiedSinceStr);
				Date modifyDate = new Date(file.lastModified());
				if(!sinceDate.before(modifyDate)){
					response.sendError(304);
					return;
				}
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}

		File thumbDir = new File(file.getParent()+"/_thumb/");
		if(!thumbDir.exists()){
			// _thumbディレクトリを作る
			thumbDir.mkdir();
		}
		
		//サムネイルを生成する
		File thumbFile = new File(file.getParent()+"/_thumb/"+file.getName());
		if(!thumbFile.exists() || thumbFile.lastModified() < file.lastModified()){
			BufferedImage bi = javax.imageio.ImageIO.read(file);
			if(bi==null){
				response.sendError(404);
				return;
			}
			if(bi.getWidth()<=160 && bi.getHeight()<=160 && bi.getWidth()==bi.getHeight()){
				//そのままでOK
				FileChannel srcChannel = null;
				FileChannel destChannel = null;
				try {
					srcChannel = new FileInputStream(file).getChannel();
					destChannel = new FileOutputStream(thumbFile).getChannel();
					srcChannel.transferTo(0, srcChannel.size(), destChannel);
				} finally {
					srcChannel.close();
					destChannel.close();
				}
			}
			else{
				//縮小する(あるいは拡大)
				double rate = Math.min(160.0/bi.getWidth(), 160.0/bi.getHeight());
				int nw = (int)(bi.getWidth()*rate);
				int nh = (int)(bi.getHeight()*rate);
				//Image img = bi.getScaledInstance(nw, -1, Image.SCALE_FAST );
				BufferedImage newbi = new BufferedImage(160,160,BufferedImage.TYPE_INT_ARGB);
				Graphics2D g2 = (Graphics2D)newbi.getGraphics();
				g2.drawImage(bi, 80-nw/2, 80-nh/2, nw, nh, null);
				javax.imageio.ImageIO.write(newbi, "png", thumbFile);
			}
		}
		
		//サムネイルは必ずpng
		response.setContentType("image/png");
		
		SimpleDateFormat sdf = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", Locale.US);
		//System.out.println("After Format : " + sdf.format(file.lastModified()));
		response.setHeader("Last-Modified",sdf.format(thumbFile.lastModified()));
		
		response.setHeader("Content-Length",thumbFile.length()+"");
		
		ServletOutputStream binOut = response.getOutputStream();

		DataInputStream dis = null;
		try {
			dis = new DataInputStream(new FileInputStream(thumbFile));
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
		
		/*if(new File(file.getParent()).getAbsolutePath().equals(getServletContext().getRealPath("..")+"/user/"+authorStr+"/tmp")){
			//tmpファイルにおいてある場合は削除する
			file.delete();
		}*/
		
		return;
	}
}
