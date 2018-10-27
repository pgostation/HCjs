package nyoicard;

import java.io.*;
import java.net.URLEncoder;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;

import javabeans.dirsize;
import javabeans.environment;

import javax.servlet.*;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import org.apache.commons.fileupload.*;
import org.apache.commons.fileupload.disk.*;
import org.apache.commons.fileupload.servlet.*;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipFile;

@WebServlet("/fileupload")
@MultipartConfig(fileSizeThreshold=5000000,maxFileSize=10000000,location="/tmp/stack/")
public class fileupload extends HttpServlet {
	private static final long serialVersionUID = 1L;
	public static final String longVersion="4.0";
	convhypertalk ttalk = new convhypertalk();

	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response)
	throws IOException, ServletException
	{
		response.setStatus(500);
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		out.println("<doctype html><html lang=jp>");
		out.println("<head>");
		out.println("<meta charset=utf-8>");
		out.println("<title>");
		out.println("error");
		out.println("</title>");
		out.println("</head>");
		out.println("<body>");
		out.println("<h1>Use POST method for file upload.</h1>");
		out.println("</body>");
		out.println("</html>");
		out.close();
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("fileupload doPost");
		String resultStr = null;
		String formStr = "";
		OStack stack = null;
		File binfile = null;

		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String remoteuserStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), remoteuserStr, request.getRemoteAddr(), sid));

		String userStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		if(userStr==null){userStr = remoteuserStr;} //userがない場合は自分ところ
		String stacknameStr = request.getParameter("name"); //パラメータがURLに含まれない場合はnull
		String mimetype = request.getParameter("mime");
		String fnameStr = request.getParameter("fname");
		String jsStr = request.getParameter("js");
		
		if(stacknameStr!=null){
			stacknameStr = new String(stacknameStr.getBytes("ISO-8859-1"),"UTF-8");
		}
		if(fnameStr!=null){
			fnameStr = new String(fnameStr.getBytes("ISO-8859-1"),"UTF-8");
		}

		String tmpPath = getServletContext().getRealPath("..")+"/user/_tmp/";
		{
			File tmpdir = new File(tmpPath);
			if(!tmpdir.exists()){
				tmpdir.mkdir();
			}
		}
		if(remoteuserStr==null){
			System.out.println("fileupload remoteuserStr==null");
			response.sendError(403);
			return;
		}
		if(!remoteuserStr.equals(userStr)){
			System.out.println("fileupload 403 remoteuserStr:"+remoteuserStr+" userStr:"+userStr);
			response.sendError(403);
			return;
		}
		
		long filesizeMax;
		filesizeMax = environment.getUserDiskSpace(remoteuserStr) 
				- dirsize.readSize(getServletContext().getRealPath("..")+"/user/"+remoteuserStr+"/_dirsize");;
		if(100*1000 > filesizeMax){
			System.out.println("fileupload disk full");
			response.sendError(500);
			return;
		}
		
		System.out.println("ServletFileUpload.isMultipartContent(request):"+ServletFileUpload.isMultipartContent(request));
		if (ServletFileUpload.isMultipartContent(request)) {
			// ファクトリー生成
			DiskFileItemFactory factory = new DiskFileItemFactory();
			factory.setSizeThreshold(1426);
			factory.setRepository(new File(tmpPath)); //一時的に保存する際のディレクトリ

			ServletFileUpload upload = new ServletFileUpload(factory);
			upload.setSizeMax(40 * 1024 * 1024);
			upload.setFileSizeMax(filesizeMax);

			@SuppressWarnings("rawtypes")
			List items;
			try {
				items = upload.parseRequest(request);
			} catch (FileUploadException e) {
				// エラー処理
				System.out.println(e.getMessage());
				e.printStackTrace();
				throw new ServletException(e);
			}

			// 全フィールドに対するループ
			for (Object val : items) {
				System.out.println("fileupload loop1");
				FileItem item = (FileItem) val;
				if (item.isFormField()) {
					// type="file"以外のフィールド
					formStr += item.getFieldName() +":"+processFormField(item);
					if(item.getFieldName().equals("user")){
						userStr = processFormField(item);
					}
					if(item.getFieldName().equals("user")){
						userStr = processFormField(item);
					}
					//else if(item.getFieldName().equals("stackname")){
					//	stacknameStr = processFormField(item);;
					//}
				}
			}
			
			System.out.println("formStr:"+formStr);
			
			if(!userStr.matches("[_a-zA-Z0-9]{3,15}")){
				System.out.println("fileupload !userStr.matches");
				response.sendError(500);
				//response.sendRedirect("error/500.html");
				return;
			}

			// 全フィールドに対するループ
			System.out.println("loop start");
			System.out.println("mimetype:"+mimetype);
			for (Object val : items) {
				System.out.println("fileupload loop");
				FileItem item = (FileItem) val;
				if (!item.isFormField()) {
					// type="file"のフィールド
					if(mimetype!=null && mimetype.startsWith("image")){
						try{
							binfile = processUploadedImageFile(item,userStr,stacknameStr,fnameStr);
						}
						catch(Exception e){
							e.printStackTrace();
							System.out.println("fileupload.java processUploadedImageFile error");
						}
					}
					else{
						//System.out.println("fileupload new OStack");
						try{
							stack = new OStack(formStr);
							resultStr = processUploadedZipOrStackFile(item,stack,tmpPath,userStr);
						}
						catch(Exception e){
							e.printStackTrace();
							System.out.println("fileupload.java processUploadedStackFile error");
						}
					}
				}
			}
		}

		/**String stackName = "undefined";
		if(resultStr==null){
			String stackNameBase = new File(stack.path).getName();
			stackName = stackNameBase;
			int counter = 2;
			//stackNameディレクトリ作成
			while(true){
				File stackdir = new File(new File(tmpPath).getParent()+File.separatorChar+stackName);
				if(!stackdir.exists()){
					stackdir.mkdir();
					break;
				}
				stackName = stackNameBase + " " + Integer.toString(counter);
				counter++;
			}
		}*/

		//完了処理
		System.out.println("fileupload 3");
		if(resultStr!=null && resultStr.equals("json")){
			System.out.println("fileupload json");

			//フォルダ容量を保存
			dirsize.set(getServletContext().getRealPath(".."), userStr, "stack/"+stack.path);
			
			response.sendRedirect("stackinfo.jsp?author="+userStr+"&name="+URLEncoder.encode(stack.path, "UTF-8"));
		}
		else if(stack!=null && stack.path!=null){
			//スタックの場合
			System.out.println("fileupload 4");
			String stackName = new File(new File(stack.path).getParent()).getName();

			if(resultStr!=null){
				response.sendRedirect("error/freemsg.jsp?msg="+URLEncoder.encode(resultStr,"UTF-8"));
				return;
			}
			else{
				response.sendRedirect("stackinfo.jsp?author="+userStr+"&name="+URLEncoder.encode(stackName, "UTF-8"));
			}

			//フォルダ容量を保存
			dirsize.set(getServletContext().getRealPath(".."), userStr, "stack/"+stackName);
		}
		else if(jsStr!=null && jsStr.equals("true")){
			//スタックではない場合で、javascriptでparentに通知する
			response.setContentType("text/html");
			PrintWriter out = response.getWriter();
			out.println("<html><body><script>parent.document.getElementById('uploadFileDialog').fname='"+binfile.getName()+"';</script><div style='background:#fff'>Upload OK</div></body></html>");
			out.close();
		}
		else{
			//スタックではない場合
			System.out.println("fileupload 5");
			if(binfile==null){
				System.out.println("fileupload fail : binfile is null");
				response.sendError(500);
				//response.sendRedirect("error/500.html");
				return;
			}
			response.setContentType(mimetype);
			ServletOutputStream binOut = response.getOutputStream();

			DataInputStream dis = null;
			try {
				FileInputStream fis = new FileInputStream(binfile);
				dis = new DataInputStream(fis);
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}
			
			if(dis==null){
				System.out.println("fileupload fail : DataInputStream is null");
				response.sendError(500);
				//response.sendRedirect("error/500.html");
				return;
			}

			while(true)
			{
				byte[] b = new byte[2048];
				//for(int i=0; i<2048; i++){
					int s = dis.read(b);
					//int di = dis.read();
					if(s<2048){
						binOut.write(b,0,s);
						break;
					}
					//b[i] = (byte)di;
				//}
				binOut.write(b);
			}
			
			//フォルダ容量を保存
			dirsize.set(getServletContext().getRealPath(".."), userStr, "stack/"+new File(binfile.getParent()).getName());

			dis.close();
			
			response.setContentType("text/html");
			//PrintWriter out = response.getWriter();
			//out.println("OK");
			//out.close();
			
			return;
		}

	}

    /*private String getFilename(Part part) {
        for (String cd : part.getHeader("Content-Disposition").split(";")) {
            if (cd.trim().startsWith("filename")) {
                return cd.substring(cd.indexOf('=') + 1).trim().replace("\"", "");
            }
        }
        return null;
    }*/
	private String processFormField(FileItem item) throws ServletException {
		String resultStr="";
		try {
			System.out.println(item.getString("UTF-8"));
			resultStr = item.getString("UTF-8");
		} catch (UnsupportedEncodingException e) {
			throw new ServletException(e);
		}
		return resultStr;
	}

	private String processUploadedZipOrStackFile(FileItem item, OStack stack, String tmpPath, String userStr) throws IOException, ServletException {
		String x = item.getName();
		File uploadedFile = new File(x);
		String resultStr="failure";
		String main_fpath=tmpPath+x; //スタックファイルのファイル名
		System.out.println("filename:"+x);

		//ファイルをディスクに保存
		try {
			item.write(new File(tmpPath, uploadedFile.getName()));
			resultStr = null;
		} catch (IOException e) {
			throw e;
		} catch (Exception e) {
			throw new ServletException(e);
		}

		String stackTmpPath = getServletContext().getRealPath("..")+"/user/"+userStr+"/tmp/";
		{
			//tmpディレクトリ作成
			File tmpdir = new File(stackTmpPath);
			System.out.println("getAbsolutePath:"+tmpdir.getAbsolutePath());
			if(!tmpdir.exists()){
				tmpdir.mkdir();
			}else{
				//tmpの中は全削除
			    File[] files = tmpdir.listFiles();
			    for (int i = 0; i < files.length; i++) {
			        files[i].delete();
			    }
			}
		}

		//ファイルをZIP展開
		boolean jsonFlag = false;
		if((resultStr==null) && uploadedFile.getName().endsWith(".zip")){
			try{
				ZipFile zf = new ZipFile(new File(tmpPath, uploadedFile.getName()), "UTF-8"); //osx以外のzipではMS932を使う
				for (
					@SuppressWarnings("rawtypes")
					Enumeration e = zf.getEntries(); e.hasMoreElements();)
				{
					ZipEntry ze = (ZipEntry) e.nextElement();
					if (ze.isDirectory()) {
						continue;
					}
            		if(ze.getName().matches(".*/_stack2.json")){
            			jsonFlag = true; 
            		}
				}
				zf.close();
			} catch (Exception e) {
			}
		}
		if(jsonFlag){
			stack.path = processUploadedZipFile(getServletContext().getRealPath(".."),
					userStr, new ZipFile(new File(tmpPath, uploadedFile.getName()), "UTF-8"));
			return "json";
		}

		//ファイルをZIP展開
		System.out.println((resultStr==null)+" 1");
		System.out.println(uploadedFile.getName().endsWith(".zip")+" 2");
		if((resultStr==null) && uploadedFile.getName().endsWith(".zip")){
			try{
				ZipFile zf = new ZipFile(new File(tmpPath, uploadedFile.getName()), "UTF-8"); //osx以外のzipではMS932を使う
				for (
					@SuppressWarnings("rawtypes")
					Enumeration e = zf.getEntries(); e.hasMoreElements();)
				{
					ZipEntry ze = (ZipEntry) e.nextElement();
					// System.out.println(ze.getName());
					if (ze.isDirectory() && !ze.getName().contains("..")) {
						File dir = new File(stackTmpPath+ze.getName());
						dir.mkdir();
						continue;
					}
            		System.out.println(ze.getName()+" 3");
	                if(!ze.getName().startsWith(".") && !ze.getName().startsWith("__MACOSX")){
	            		System.out.println(ze.getName()+" 4");
	                	main_fpath = stackTmpPath+ze.getName();
	                }

					InputStream is = zf.getInputStream((ZipArchiveEntry) ze);
					byte[] buf = new byte[50*1024]; //50k
					//bufを使って処理
			        BufferedOutputStream fis = null;
			        try {
			            // 出力先ファイル
			            File file = new File(stackTmpPath+ze.getName());
			            fis = new BufferedOutputStream(new FileOutputStream(file));
			            for (;;) {
			            	int len = is.read(buf);
							if (len < 0) break;
			                fis.write(buf,0,len);
			            }
			        } catch (IOException e1) {
			            e1.printStackTrace();
			        } finally {
		                try {
		                    if (fis != null) {
		                        fis.close();
		                    }
		                } catch (IOException e1) {
		                }
		            }
					is.close();
				}
				zf.close();
			} catch (Exception e) {
				resultStr = "zip failure";
			}
		}
		
		Stack2json s2j = new Stack2json();
		stack.path = main_fpath;
			
		// stack/tmpディレクトリからstack名のディレクトリに移動
		{
			File stacktmp = new File(stackTmpPath);
			String newPath = stacktmp.getParent() +"/stack/"+ new File(main_fpath).getName() +"/";
			for(int count=2; ; count++){
				if(true==stacktmp.renameTo(new File(newPath))){
					stack.path = newPath+ new File(main_fpath).getName();
					break;
				}
				if(count>=100){
					System.out.println("cannot renameTo");
					break;
				}
				newPath = stacktmp.getParent() +"/stack/"+ new File(main_fpath).getName() +" "+count +"/";
			}
		}
		
		if(!s2j.loadStack(stack.path, stack)){
			resultStr = "HyperCard stack load failure";
		}
		else{
			ttalk.HyperTalk2EasyJS(stack);
			
			if(!s2j.saveJson(stack)){
				resultStr = "Convert stack failure";
			}
			
			//ピクチャの変換を開始
			new convertPictureThread(stack).start();
		}
		
		return resultStr;
	}

	private File processUploadedImageFile(FileItem item, String userStr, String stacknameStr, String fname) throws IOException, ServletException {
		if(fname==null || fname.length()==0) {
			fname = item.getName();
			if(fname.lastIndexOf("/")!=-1){
				fname = fname.substring(fname.lastIndexOf("/"));
			}
			if(fname.length()<=1) fname = "untitled";
		}
		String tmpPath = getServletContext().getRealPath("..")+"/user/"+userStr+"/stack/"+stacknameStr+"/";
		File file = new File(tmpPath, fname);

		System.out.println("processUploadedImageFile");
		System.out.println(new File(tmpPath).exists());
		System.out.println(file.getAbsolutePath());
		
		if(!file.exists()){
			file.createNewFile();
		}

        InputStream content = item.getInputStream();

		BufferedOutputStream bos = null;
		try {
			bos = new BufferedOutputStream(new FileOutputStream(file));
			while(true){
				int bi = content.read();
				if(bi==-1) break;
				bos.write((byte)bi);
			}
			//resultStr = null;
		} catch (IOException e) {
			throw e;
		} catch (Exception e) {
			throw new ServletException(e);
		} finally {
			if(bos!=null) bos.close();
		}

		return file;
	}
	
	private String processUploadedZipFile(String homeDir, String userStr, ZipFile zf){
		String stackName = "";
		try{
			for (
				@SuppressWarnings("rawtypes")
				Enumeration e = zf.getEntries(); e.hasMoreElements();)
			{
				ZipEntry ze = (ZipEntry) e.nextElement();
				// System.out.println(ze.getName());
				if (ze.isDirectory() && !ze.getName().contains("..")) {
					stackName = ze.getName();
					File dir = new File(homeDir+"/user/"+userStr+"/stack/"+ze.getName());
					if(dir.exists()){
						//古いディレクトリは移動
						int cnt = 2;
						File renameDir = new File(dir.getAbsolutePath()+" old");
						while(renameDir.exists()){
							renameDir = new File(dir.getAbsolutePath()+" old"+cnt);
							cnt++;
						}
						dir.renameTo(renameDir);
					}
					dir.mkdir();
					continue;
				}

				InputStream is = zf.getInputStream((ZipArchiveEntry) ze);
				byte[] buf = new byte[10*1024]; //10k
				//bufを使って処理
		        BufferedOutputStream fis = null;
		        try {
		            // 出力先ファイル
		            File file = new File(homeDir+"/user/"+userStr+"/stack/"+ze.getName());
		            fis = new BufferedOutputStream(new FileOutputStream(file));
		            for (;;) {
		            	int len = is.read(buf);
						if (len < 0) break;
		                fis.write(buf,0,len);
		            }
		        } catch (IOException e1) {
		            e1.printStackTrace();
		        } finally {
	                try {
	                    if (fis != null) {
	                        fis.close();
	                    }
	                } catch (IOException e1) {
	                }
	            }
				is.close();
			}
			zf.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return stackName;
	}
}




