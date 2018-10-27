package javabeans;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Calendar;
import java.util.Date;

import javax.servlet.http.Cookie;

public class session {
	private static final int MULTI_SESSIONID = 5;
	//ユーザIDを取得
	public String getUserId(String sid, String homeDir, Cookie[] cookies) {
		String userId = null;
		if (cookies != null) {
			for (int i = 0; i < cookies.length; i++) {
				if (cookies[i].getName().equals("userId")) {
					userId = cookies[i].getValue();
				}
			}
		}

		//System.out.println(sid +","+userId);
		
		if(sid==null) return userId;
		if(userId==null) return null;

		if(userId.startsWith("_")){ // _guest** はそのまま返す
			return userId;
		}

		File sessionFile = new File(homeDir+"/user/"+userId+"/_sessionId");
		String[] fileSessionStr = new String[MULTI_SESSIONID];
		try {
			BufferedReader br = new BufferedReader(new FileReader(sessionFile));
			for(int i=0;i<MULTI_SESSIONID;i++){
				fileSessionStr[i] = br.readLine();
			}
			br.close();
		}catch(FileNotFoundException e){
			return null;
		}catch(IOException e){
			System.out.println(e);
		}

		//System.out.println("fileSessionStr="+fileSessionStr);
		for(int i=0; i<MULTI_SESSIONID; i++){
			if(sid.length()>0 && sid.equals(fileSessionStr[i])){
				if(new Date().getTime() - sessionFile.lastModified() > 10*60*1000 ){
					sessionFile.setLastModified(new Date().getTime());
				}
				return userId;
			}
		}
		return null;
	}

	//セッションIDを各ユーザのファイルに記録する
	public void setSessionId(String sid, String homeDir, String userStr, String remoteAddrStr, String userAgentStr) {
		{
			File sessionFile = new File(homeDir+"/user/"+userStr+"/_sessionId");

			//セッションID上2個を取得する
			String fileSessionStr = "";
			try {
				BufferedReader br = new BufferedReader(new FileReader(sessionFile));
				for(int i=0;i<MULTI_SESSIONID-1;i++){
					String str = br.readLine();
					if((str!=null)){
						fileSessionStr += "\n"+str;
					}
				}
				br.close();
			}catch(FileNotFoundException e){
			}catch(IOException e){
			}
			
			//セッションIDを上に一つ追加
		    FileWriter filewriter=null;
		    try {
			    //書き込み
		    	filewriter = new FileWriter(sessionFile);
		    	filewriter.write(sid+fileSessionStr);
		    } catch(IOException e){
		    	System.out.println(e);
		    } finally {
		    	if(filewriter!=null){
					try {
						filewriter.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
		    	}
		    }
		}
	    
	    //--
		saveRemoteAddrUserAgent(homeDir, userStr, remoteAddrStr, userAgentStr);
	}

	private void saveRemoteAddrUserAgent(String homeDir, String userStr, String remoteAddrStr, String userAgentStr)
	{
		if(remoteAddrStr.length()>0){
			File remoteAddrUAFile = new File(homeDir+"/user/"+userStr+"/_remoteAddr_userAgent");
			//IPアドレスとUserAgent上2個を取得する
			String fileIpStr = "";
			try {
				BufferedReader br = new BufferedReader(new FileReader(remoteAddrUAFile));
				for(int i=0;i<MULTI_SESSIONID-1;i++){
					String str = br.readLine();
					if((str!=null)){
						fileIpStr += "\n"+str;
					}
				}
				br.close();
			}catch(FileNotFoundException e){
			}catch(IOException e){
			}
			
			//IPアドレスとUserAgentを上に一つ追加
		    FileWriter filewriter=null;
		    try {
			    //書き込み
		    	filewriter = new FileWriter(remoteAddrUAFile);
		    	filewriter.write(remoteAddrStr+" "+userAgentStr+fileIpStr);
		    } catch(IOException e){
		    	System.out.println(e);
		    } finally {
		    	if(filewriter!=null){
					try {
						filewriter.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
		    	}
		    }
		}
	}
	
	//新しいゲストIDを生成
	public String newGuestId(String homeDir, String remoteAddrStr, String userAgentStr) {
		String guestId = "";
		File dir;
		while(true){
			int cnt = (int)(Math.random()*100000);
			Calendar cal = Calendar.getInstance();
			guestId = get2(cal.get(Calendar.MONTH)+1)+get2(cal.get(Calendar.DATE))+get5(cnt);
			dir = new File(homeDir+"/user/"+"_guest"+guestId);
			if(!dir.exists()) break;
			//if(dir.delete()) break;//空ディレクトリの場合
		}
		dir.mkdir();
		saveRemoteAddrUserAgent(homeDir, "_guest"+guestId, remoteAddrStr, userAgentStr);
		
		return "_guest"+guestId;
	}
	
	private String get2(int i){
		if(i<10) return "0"+i;
		return i+"";
	}
	
	private String get5(int i){
		if(i<10) return "0000"+i;
		if(i<100) return "000"+i;
		if(i<1000) return "00"+i;
		if(i<10000) return "0"+i;
		return i+"";
	}
}
