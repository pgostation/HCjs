package javabeans;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.HashMap;
import java.util.Set;

public class xmapString {
	private HashMap<String,String> xmapHash = new HashMap<String,String>();

	public xmapString(String str){
		StringBuffer nameStr = new StringBuffer("");
		StringBuffer valueStr = new StringBuffer("");
		boolean inName = true;
		
		for(int c=0; c<str.length(); c++){
			if(str.charAt(c)=='\n'){ //改行で次の要素へ
				xmapHash.put(nameStr.toString(),valueStr.toString());
				nameStr.setLength(0);
				valueStr.setLength(0);
				inName = true;
			}
			else if(str.charAt(c)=='%'){ // %nと%%の場合
				c++;
				if(inName){nameStr.append(str.charAt(c));}
				else{
					if(str.charAt(c)=='n'){valueStr.append('\n');}
					else{valueStr.append('%');}
				}
			}
			else if(inName && str.charAt(c)==':'){ //名前の終わり
				inName = false;
			}
			else {
				if(inName){nameStr.append(str.charAt(c));}
				else{valueStr.append(str.charAt(c));}
			}
		}
	}
	
	public String get(String attrName){
		return xmapHash.get(attrName);
	}
	
	public String[] getAllKeys(){
		int size = xmapHash.size();
		String[] strAry = new String[size];
		Set<String> set = xmapHash.keySet();
		int i=0;
		for(String s:set){
			if(i>=size) break;
			strAry[i] = s;
			i++;
		}
		return strAry;
	}
	
	public void set(String attrName, String value){
		xmapHash.put(attrName, value);
	}
	
	public void save(String pathStr){
		File file = new File(pathStr);
		String outStr = "";
		
		Set<String> set = xmapHash.keySet();
		for(String str:set){
			outStr += str+":"+xmapHash.get(str).replaceAll("%","%%").replaceAll("(\\r\\n)|(\\n)","%n")+"\n";
		}
		//System.out.println("outStr:"+outStr);

	    /*try{
	    	FileWriter filewriter = new FileWriter(file);
	    	filewriter.write(outStr);
	    	filewriter.close();
	    }catch(IOException e){
	    	System.out.println(e);
	    }*/
		BufferedOutputStream bos = null;
		try {
			bos = new BufferedOutputStream(new FileOutputStream(file));
			bos.write(outStr.getBytes("UTF-8"));
			bos.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}

