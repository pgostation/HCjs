package nyoicard;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javabeans.dirsize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/setjson")
public class setjson extends HttpServlet{
	private static final long serialVersionUID = 4L;

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authorStr = request.getParameter("user"); //パラメータがURLに含まれない場合はnull
		String pathStr = request.getParameter("path"); //パラメータがURLに含まれない場合はnull
		String typeStr = request.getParameter("type"); //パラメータがURLに含まれない場合はnull
		String numStr = request.getParameter("num"); //パラメータがURLに含まれない場合はnull
		String remainStr = request.getParameter("remain"); //パラメータがURLに含まれない場合はnull
		String textStr = request.getParameter("text"); //パラメータがURLに含まれない場合はnull
		String firstStr = request.getParameter("first"); //パラメータがURLに含まれない場合はnull

		//String userStr = request.getRemoteUser();
		String sid = request.getSession().getId();
		String userStr = new javabeans.session().getUserId(sid, getServletContext().getRealPath(".."), request.getCookies());
		log(javabeans.log.make(request.getRequestURI(), request.getQueryString(), userStr, request.getRemoteAddr(), sid));

		if(authorStr==null || pathStr==null || typeStr==null || numStr==null || remainStr==null || firstStr==null || textStr==null){
			response.sendError(404);
			//response.sendRedirect("error/404.html");
			return;
		}
		if(!authorStr.matches("^[_a-zA-Z0-9]{3,15}$") || pathStr.matches("..")){
			response.sendError(404);
			//response.sendRedirect("error/404.html");
			return;
		}

		if(!authorStr.equals(userStr)){
			response.sendError(403);
			return;
		}

		System.out.println("pathStr1 "+pathStr);
		//pathStr = new String(pathStr.getBytes("ISO-8859-1"),"UTF-8");
		//System.out.println("pathStr2 "+pathStr);

		//ディレクトリ作成 (ローカルデータ保存の場合)
		String loadFilePath = getServletContext().getRealPath("..")+"/user/"+userStr+"/"+pathStr;
		if(pathStr.startsWith("data/") && !new File(loadFilePath).getParentFile().exists()){
			File stackDir = new File(loadFilePath).getParentFile();
			File authorDir = stackDir.getParentFile();
			File dataDir = new File(getServletContext().getRealPath("..")+"/user/"+userStr+"/data");
			if(!dataDir.exists()){
				dataDir.mkdir();
			}
			if(!authorDir.exists()){
				authorDir.mkdir();
			}
			if(!stackDir.exists()){
				stackDir.mkdir();
			}
		}
		
		String tmpFilePath = loadFilePath+"_tmp";
		String saveFilePath = loadFilePath+(remainStr.equals("0")?"":"_tmp");
		File saveFile = new File(saveFilePath);
		String saveFilePath2 = loadFilePath+(remainStr.equals("0")?"":"_tmp")+remainStr;
		File saveFile2 = new File(saveFilePath2);
		if(!saveFile.exists()||firstStr.equals("true")){
			System.out.println("saveFile "+saveFile.getAbsolutePath());
			saveFile.createNewFile();
		}
		if(!saveFile.canWrite() || saveFile.isDirectory()){
			response.sendError(404);
			//response.sendRedirect("error/404.html");
			return;
		}

		//JSONデータを読み込む
		//StringBuilder loadStr = new StringBuilder(10000);
		File loadFile = new File(tmpFilePath);
		if(!loadFile.exists()||firstStr.equals("true")){
			loadFile = new File(loadFilePath);
		}

		/*
		try {
			BufferedReader br = new BufferedReader(new FileReader(loadFile));
			String str;
			while((str = br.readLine()) != null){ loadStr.append(str);}
			br.close();
		}catch(FileNotFoundException e){
			//return;
		}catch(IOException e){
			System.out.println(e);
		}*/

		byte[] b = new byte[0];
		if(loadFile.exists()){
			b = new byte[(int)loadFile.length()];
			try {
	            FileInputStream in = new FileInputStream(loadFile);
	            in.read(b);
	            in.close();
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
		}

		String loadString = new String(b,"UTF-8");
		myjsonObj stackObj = new myjsonObj(loadString);
		String checkStr = stackObj.encode();
		if(loadString.length()>0 && !checkStr.equals(loadString)){
			System.out.println("NG "+remainStr);

			if(loadString.length()>100){
				System.out.println("loadString:"+loadString.substring(0,100));
			}else{
				System.out.println("loadString:"+loadString);
			}
			if(checkStr.length()>100){
				System.out.println("checkStr:"+checkStr.substring(0,100));
			}else{
				System.out.println("checkStr:"+checkStr);
			}

			BufferedOutputStream bos = null;
			try {
				bos = new BufferedOutputStream(new FileOutputStream(new File(loadFilePath+"ng")));
				bos.write(checkStr.getBytes("UTF-8"));
			} catch (IOException e) {
				throw e;
			} catch (Exception e) {
				throw new ServletException(e);
			} finally {
				if(bos!=null) bos.close();
			}
			
			response.sendError(500);
			return;
		}

		//JSONデータを再構築する
		if(typeStr.equals("cardData")||typeStr.equals("bgData")){
			myjsonList baseData = new myjsonList(stackObj.get(typeStr));
			baseData.set(Integer.valueOf(numStr), textStr);
			stackObj.set(typeStr, baseData.encode());
		}else{
			stackObj.set(typeStr, textStr);
		}

		//JSONデータを保存する
		String jsonStr = stackObj.encode();

		BufferedOutputStream bos = null;
		try {
			bos = new BufferedOutputStream(new FileOutputStream(saveFile));
			bos.write(jsonStr.getBytes("UTF-8"));
		} catch (IOException e) {
			throw e;
		} catch (Exception e) {
			throw new ServletException(e);
		} finally {
			if(bos!=null) bos.close();
		}
		
		//途中経過
		BufferedOutputStream bos2 = null;
		try {
			bos2 = new BufferedOutputStream(new FileOutputStream(saveFile2));
			bos2.write(jsonStr.getBytes("UTF-8"));
		} catch (IOException e) {
			throw e;
		} catch (Exception e) {
			throw new ServletException(e);
		} finally {
			if(bos2!=null) bos2.close();
		}

		//チェック
		{
			myjsonObj stackObj2 = new myjsonObj(jsonStr);
			String jsonStr2 = stackObj2.encode();
			if(jsonStr.equals(jsonStr2)){
				System.out.println("OK "+remainStr);
			}else{
				System.out.println("NG "+remainStr);
				if(jsonStr.length()>100){
					System.out.println("jsonStr:"+jsonStr.substring(0,100));
				}else{
					System.out.println("jsonStr:"+jsonStr);
				}
				if(jsonStr2.length()>100){
					System.out.println("jsonStr2:"+jsonStr2.substring(0,100));
				}else{
					System.out.println("jsonStr2:"+jsonStr2);
				}
			}
		}

		response.setContentType("text/plain");
		PrintWriter out = response.getWriter();
		out.println("<doctype html><html><head><title>ok</title></head></html>");

		//フォルダ容量を保存
		dirsize.set(getServletContext().getRealPath(".."), authorStr, pathStr);
	}

class myjsonObj{
	private HashMap<String,String> map = new HashMap<String,String>();
	myjsonObj(String str){
		if(str==null){
			return;
		}
		char[] ca = str.toCharArray();
		//{"name1":(.*),"name2":(.*)}をHashMapにしたい。ネストは無視してすべて文字列とする
		StringBuffer nameStr = new StringBuffer("");
		StringBuffer valueStr = new StringBuffer("");
		boolean inName = false;
		int nest = 0;

		for(int c=0; c<ca.length; c++){
			char ch = ca[c];
			if( ch=='{' ){
				inName = true;
				nest++;
				if(nest>1){
					valueStr.append(ch);
				}
			}
			else if( ch=='}' ){
				nest--;
				if(nest==0){
					map.put(nameStr.toString(), valueStr.toString());
					nameStr.setLength(0);
					valueStr.setLength(0);
				}
				else if(nest>0){
					valueStr.append(ch);
				}
			}
			else if( ch=='[' ){
				nest++;
				valueStr.append(ch);
			}
			else if( ch==']' ){
				nest--;
				valueStr.append(ch);
			}
			else if( ch==',' && nest==1 ){
				inName = true;
				map.put(nameStr.toString(), valueStr.toString());
				nameStr.setLength(0);
				valueStr.setLength(0);
			}
			else if( ch=='\"' ){
				if( inName && nest==1 ){
				}else{
					valueStr.append(ch);
				}
				c++;
				for(;c<str.length(); c++){
					char ch2 = ca[c];
					if( ch2 == '\\' ){
						valueStr.append(ch2);
						c++;
						ch2 = ca[c];
						valueStr.append(ch2);
						continue;
					}
					if( ch2 == '\"' ){
						if( inName && nest==1 ){
							c++;
						}else{
							valueStr.append(ch2);
						}
						inName = false;
						break;
					}
					if( inName && nest==1 ){
						nameStr.append(ch2);
					}else{
						valueStr.append(ch2);
					}
				}
			}
			else{
				valueStr.append(ch);
			}
		}
	}

	public String encode() {
		StringBuffer str = new StringBuffer("");
		String[] keys = new String[9];
		keys[0] = "stackjsonver";
		keys[1] = "stackData";
		keys[2] = "bgData";
		keys[3] = "cardData";
		keys[4] = "rsrcData";
		keys[5] = "xcmdData";
		keys[6] = "addcolorData";
		keys[7] = "list";
		keys[8] = "time";

		str.append("{");
		for(int i=0; i<keys.length; i++){
			if(map.containsKey(keys[i])) {
				String key = keys[i];
				if(key.length()>0){
					str.append("\"");
					str.append(key);
					str.append("\":");
					str.append(map.get(key));
				}
				str.append(",");
			}
		}
		if( str.length()>0 && str.charAt(str.length()-1)==','){//最後のコンマが余計
			str.deleteCharAt(str.length()-1);
		}
		str.append("}");
		
		String str2 = str.toString();
		return str2;
	}

	public void set(String typeStr, String textStr) {
		map.put(typeStr, textStr);
	}

	String get(String typeStr){
		return map.get(typeStr);
	}
}

class myjsonList{
	private ArrayList<String> list = new ArrayList<String>();
	myjsonList(String str){
		if(str==null){
			return;
		}
		if(str.startsWith("{")){
			str = str.substring(1);
		}
		char[] ca = str.toCharArray();
		//[(.*),(.*)]をArrayListにしたい。ネストは無視してすべて文字列とする
		StringBuffer valueStr = new StringBuffer("");
		int nest = 0;

		for(int c=0; c<ca.length; c++){
			char ch = ca[c];
			if( ch=='{' ){
				nest++;
				valueStr.append(ch);
			}
			else if( ch=='}' ){
				nest--;
				valueStr.append(ch);
			}
			else if( ch=='[' ){
				nest++;
				if(nest>1){
					valueStr.append(ch);
				}
			}
			else if( ch==']' ){
				nest--;
				//c++;
				if(nest==0){
					list.add(valueStr.toString());
					valueStr.setLength(0);
				}else{
					valueStr.append(ch);
				}
			}
			else if( ch==',' ){
				if(nest==1){
					//c++;
					list.add(valueStr.toString());
					valueStr.setLength(0);
				}else{
					valueStr.append(ch);
				}
			}
			else if( ch=='\"' ){
				valueStr.append(ch);
				c++;
				for(;c<str.length(); c++){
					char ch2 = ca[c];
					valueStr.append(ch2);
					if( ch2 == '\\' ){
						c++;
						ch2 = ca[c];
						valueStr.append(ch2);
						continue;
					}
					if( ch2 == '\"' ){
						//c++;
						break;
					}
				}
			}
			else{
				valueStr.append(ch);
			}
		}
	}

	public String encode() {
		StringBuffer str = new StringBuffer("");
		str.append("[");
		for(String s : list) {
			str.append(s);
			str.append(",");
		}
		if( str.length()>0 && str.charAt(str.length()-1)==','){//最後のコンマが余計
			str.deleteCharAt(str.length()-1);
		}
		str.append("]");
		return str.toString();
	}

	public void set(int num, String textStr) {
		while(list.size()<num+1){
			list.add("");
		}
		list.set(num,textStr);
	}
}
}