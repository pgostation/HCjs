package javabeans;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;

public class fileList {
	public String getList(String pathStr)
	{
		String filelist = "";
	    File dir = new File(pathStr);
	    File[] files = dir.listFiles();
	    for (int i = 0; i < files.length; i++) {
	    	if(filelist.length()>0) filelist+= '\n';
	        filelist += files[i];
	    }
	    return filelist;
	}
	public String getListAlphabet(String pathStr)
	{
	    File dir = new File(pathStr);
	    File[] files = dir.listFiles();
	    if(files==null) return "";
	    for (int i = 0; i < files.length-1; i++) {
		    for (int j = i+1; j < files.length; j++) {
		    	if(files[i].getName().compareTo(files[j].getName())>0){
		    		File tmpFile = files[i];
		    		files[i] = files[j];
		    		files[j] = tmpFile;
		    	}
		    }
	    }
		String filelist = "";
	    for (int i = 0; i < files.length; i++) {
	    	if(files[i].getName().startsWith(".")) continue;
	    	if(filelist.length()>0) filelist+= '\n';
	        filelist += files[i].getName();
	    }
	    return filelist;
	}

	public String userFile2(String homeDir, String userStr, String pathStr)
	{
		String filelist = "";
	    File dir = new File(homeDir+"/user/"+userStr+"/"+pathStr);
	    File[] files = dir.listFiles();
	    if(files==null) return "";
	    for (int i = 0; i < files.length; i++) {
	    	if(files[i].getName().startsWith(".")) continue;
	    	if(filelist.length()>0) filelist+= '\n';
	        filelist += files[i].getName();
	    }
	    return filelist;
	}

	class DateFile {
		File file;
		long date;
	};

	//アルファベット順のファイルリスト
	public String userFileAlphabet(String homeDir, String userStr, String pathStr)
	{
	    File dir = new File(homeDir+"/user/"+userStr+"/"+pathStr);
	    File[] files = dir.listFiles();
	    if(files==null) return "";
	    for (int i = 0; i < files.length-1; i++) {
		    for (int j = i+1; j < files.length; j++) {
		    	if(files[i].getName().compareTo(files[j].getName())>0){
		    		File tmpFile = files[i];
		    		files[i] = files[j];
		    		files[j] = tmpFile;
		    	}
		    }
	    }
		String filelist = "";
	    for (int i = 0; i < files.length; i++) {
	    	if(files[i].getName().startsWith(".")) continue;
	    	if(filelist.length()>0) filelist+= '\n';
	        filelist += files[i].getName();
	    }
	    return filelist;
	}
	
	//日付順のファイルリスト
	@SuppressWarnings("unchecked")
	public String userFileNewer2(String homeDir, String userStr, String pathStr)
	{
		String filelist = "";
	    File dir = new File(homeDir+"/user/"+userStr+"/"+pathStr);
	    if(!dir.exists()) return "";
	    File[] files = dir.listFiles();
	    ArrayList<DateFile> datefiles = new ArrayList<DateFile>(files.length+1);
	    
	    if(files.length==0) return "";

	    for (int i = 0; i < files.length; i++) {
	    	if(files[i].getName().startsWith(".")) continue;
			long lastModifytime = files[i].lastModified();
			DateFile datefile = new DateFile();
			datefile.date = lastModifytime;
			datefile.file = files[i];
			datefiles.add(datefile);
	    }

		@SuppressWarnings("rawtypes")
		class DataComparator implements Comparator{
	    	  public int compare(Object o1, Object o2){
	    	    return (int) (((DateFile)o2).date - ((DateFile)o1).date);
	    	  }
	    	}

	    java.util.Collections.sort(datefiles, new DataComparator()); 
	    for (int i = 0; i < datefiles.size(); i++) {
	    	if(filelist.length()>0) filelist+= '\n';
	        filelist += datefiles.get(i).file.getName();
	    }

	    return filelist;
	}

	public boolean isFile(String homeDir, String userStr, String pathStr)
	{
	    File dir = new File(homeDir+"/user/"+userStr+"/"+pathStr);
	    if(!dir.exists()) return false;
	    return !dir.isDirectory();
	}
	
	public String readTextFile(String homeDir, String userStr, String pathStr)
	{
	    File file = new File(homeDir+"/user/"+userStr+"/"+pathStr);
		
	    String tmpStr = "";
		try {
			BufferedReader br = new BufferedReader(new FileReader(file));
			String str;
			while((str = br.readLine()) != null){ tmpStr += str+"\n";}
			br.close();
		}catch(FileNotFoundException e){
			return null;
		}catch(IOException e){
			System.out.println(e);
		}
		
		return tmpStr;
	}
}
