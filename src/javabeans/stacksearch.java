package javabeans;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class stacksearch {
	public xmapString getXmap(String homeDir)
	{
		// user/_stacksearch.xmapデータを読み込む
		File infoFile = new File(homeDir+"/user/_stacksearch.xmap");
		
		if(!infoFile.exists()){
			newXmap(homeDir, infoFile);
		}

		// user/_stacksearch.xmapデータを読み込む
		String tmpStr = "";
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
	
	//user/_stacksearch.xmapを新規作成
	public void newXmap(String homeDir, File infoFile)
	{
		File lockFile = new File(infoFile.getAbsolutePath()+".lock");
		if(lockFile.exists()){
			if(lockFile.lastModified()>System.currentTimeMillis()-10*1000){
				//10秒以内にlockfileが作られていたら
				return;
			}
		}else{
			try {
				lockFile.createNewFile();
			} catch (IOException e) {
			}
		}
		
		StringBuilder strb = new StringBuilder();
		
		//すべてのユーザのすべてのpublicスタックを検索
		fileList fList = new fileList();
		stackInfo sInfo = new stackInfo();
		String users = fList.getList(homeDir +"/user/");
		String[] userlist = users.split("\n");
		
		int cnt = 0;
		for(int user_idx=0; user_idx<userlist.length; user_idx++){
			String userStr = new File(userlist[user_idx]).getName();
			String files = fList.userFile2(homeDir, userStr, "stack/");
			String[] stacklist = files.split("\n");
			for(int i=0; i<stacklist.length; i++){
				String stackName = stacklist[i];
				String stackPathStr = homeDir+"/user/"+userStr+"/stack/"+stackName+"/_stackinfo.xmap";
				xmapString stackXmap = sInfo.getInfo2(stackPathStr);
				if(stackXmap!=null){
			    	String trueAuthorStr = stackXmap.get("tAuthor");
			    	if(trueAuthorStr==null) trueAuthorStr="";
			    	String statusStr = stackXmap.get("status");
			    	if(statusStr==null) statusStr="";
			    	String categoryStr = stackXmap.get("category");
			    	if(categoryStr==null) categoryStr="";
			    	String textStr = stackXmap.get("text");
			    	if(textStr==null) textStr="";
			    	String publicDateStr = stackXmap.get("publicDate");
			    	if(publicDateStr==null) publicDateStr="";
			    	if(statusStr.equals("public")){
			    		strb.append("authorId"+Integer.toString(cnt)+":"+userStr+"\n");
			    		strb.append("trueAuthor"+Integer.toString(cnt)+":"+trueAuthorStr+"\n");
			    		strb.append("stackName"+Integer.toString(cnt)+":"+stackName.replaceAll("\\\\","%%").replaceAll("\\n","%n")+"\n");
			    		strb.append("category"+Integer.toString(cnt)+":"+categoryStr+"\n");
			    		strb.append("stackText"+Integer.toString(cnt)+":"+textStr.replaceAll("\\\\","%%").replaceAll("\\n","%n")+"\n");
			    		strb.append("publicDate"+Integer.toString(cnt)+":"+publicDateStr+"\n");
			    		cnt++;
			    	}
				}
			}
		}
		
	    FileWriter filewriter=null;
	    try {
		    //書き込み
	    	filewriter = new FileWriter(infoFile);
	    	filewriter.write(strb.toString());
			filewriter.close();
	    } catch(IOException e){
	    	System.out.println(e);
	    }

	    //lockfile削除
		lockFile.delete();
	}
}


