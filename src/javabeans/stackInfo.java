package javabeans;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

public class stackInfo {
	public xmapString getInfo2(String pathStr)
	{
		//String tmpStr = "";

		//ファイルから_stackinfo.xmapデータを読み込む
		File infoFile = new File(pathStr);
		/*try {
			BufferedReader br = new BufferedReader(new FileReader(infoFile,));
			String str;
			while((str = br.readLine()) != null){ tmpStr += str+"\n";}
			br.close();
		}catch(FileNotFoundException e){
			return null;
		}catch(IOException e){
			System.out.println(e);
		}*/

		byte[] b = new byte[0];
		if(infoFile.exists()){
			b = new byte[(int)infoFile.length()];
			try {
	            FileInputStream in = new FileInputStream(infoFile);
	            in.read(b);
	            in.close();
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
		}
		String tmpStr = "";
		try {
			tmpStr = new String(b,"UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		
	    return new xmapString(tmpStr);
	}
}

