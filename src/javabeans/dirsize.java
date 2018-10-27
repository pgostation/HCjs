package javabeans;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;

public class dirsize{
	static int filePad = 1000; //1KBおまけ
	static int dirPad = 1000; //1KBおまけ

	public static void set(String homeDir, String authorStr, String pathStr){
		//ディレクトリ内
		if(pathStr.lastIndexOf("/")<=0) return;
		String thisPath = pathStr.substring(0,pathStr.lastIndexOf("/"));
		
		String files = new fileList().userFile2(homeDir, authorStr, thisPath);
		String[] list = files.split("\n");
		long dirSize = 0;
		for(int i=0;i<list.length && i<10000;i++){
			if(list[i].length()==0 || list[i].equals("tmp")) continue;

			String jaName = list[i];
			if(!jaName.startsWith("_")){
				File f = new File(homeDir +"/user/"+authorStr+"/"+thisPath+"/"+jaName);
				if(f.isDirectory()){
					dirSize += readSize(f.getAbsolutePath()+"/_dirsize")+dirPad;
				}
				else if(f.exists()){
					dirSize += f.length()+filePad;
				}
			}
		}

		//容量を保存
		File f = new File(homeDir +"/user/"+authorStr+"/"+thisPath+"/_dirsize");
		try{
			FileWriter filewriter = new FileWriter(f);
			filewriter.write(Long.toString(dirSize));
			filewriter.close();
		}catch(Exception e){
			System.out.println(e);
		}
		
		//親ディレクトリも変更
		if(pathStr.lastIndexOf("/")>0){
			set(homeDir, authorStr, pathStr.substring(0,pathStr.lastIndexOf("/")));
		}
	}
	
	public static long readSize(String path){
		File f = new File(path);
		if(!f.exists()) return 0;
		
		String text = "0";
		try {
			BufferedReader br = new BufferedReader(new FileReader(f));
			text = br.readLine();
			br.close();
		}catch(Exception e){
			System.out.println(e);
		}
		long l = Long.valueOf(text);
		return l;
	}
}