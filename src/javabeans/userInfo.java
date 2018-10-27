package javabeans;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Date;

public class userInfo {
	public xmapString getInfo(String pathStr)
	{
		String tmpStr = "";

		//ファイルから_userinfo.xmapデータを読み込む
		File infoFile = new File(pathStr);
		try {
			BufferedReader br = new BufferedReader(new FileReader(infoFile));
			String str;
			while((str = br.readLine()) != null){ tmpStr += str+"\n";}
			br.close();
		}catch(FileNotFoundException e){
			return null;
		}catch(IOException e){
			System.out.println(e);
		}
	    return new xmapString(tmpStr);
	}

	public void createInfo(String pathStr)
	{
	    //xmapに情報追加
	    {
		    File xmapfile = new File(pathStr);
		    String outStr="";

		    //読み込み
		    try{
		    	BufferedReader br = new BufferedReader(new FileReader(xmapfile));
		    	String str;
		    	while((str = br.readLine()) != null){
		    		outStr += str+"\n";
		    	}
		    	br.close();
		    }catch(FileNotFoundException e){
		    	System.out.println(e);
		    }catch(IOException e){
		    	System.out.println(e);
		    }
			
		    //
		    outStr += "\ncreatedate:"+new Date().toString();
		    outStr += "\nurl:";
		    outStr += "\ntext:";
		    
		    //書き込み
		    try{
		    	FileWriter filewriter = new FileWriter(xmapfile);
		    	filewriter.write(outStr);
		    	filewriter.close();
		    }catch(IOException e){
		    	System.out.println(e);
		    }
		}
	}
}

