package javabeans;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class captcha {
	static private miniDB db = new miniDB();
	
	public String newCaptchaHTML(String seedStr)
	{
		String numberStr = Integer.toString((int)(Math.random()*8999+1000));
		db.qput(seedStr+"$"+numberStr);
		return generateCaptchaHTML(numberStr);
	}

	public boolean isCorrect(String seedStr, String numberStr)
	{
		String res = db.getHashMap(seedStr);
		if(res!=null){
			return res.equals(numberStr);
		}
		return false;
	}
	
	private String generateCaptchaHTML(String numberStr){
		String outStr = "<svg width=100 height=32 "+
				"xmlns=\"http://www.w3.org/2000/svg\""+
				"xmlns:xlink=\"http://www.w3.org/1999/xlink\">";
		for(int i=0; i<numberStr.length(); i++){
			int width=25;
			int height=32;
			int top=0;
			int left=width*i;
			switch(numberStr.charAt(i)){
			case '0':
				outStr += "<line x1="+(left+0.8*width)+" y1="+(top+0.2*height)+" x2="+(left+0.2*width)+" y2="+(top+0.8*height);
				outStr += " stroke=#000 stroke-width=1 />";
				outStr += "<ellipse rx="+0.42*width+" ry="+0.38*height+" cx="+(left+0.5*width)+" cy="+(top+0.5*height);
				outStr += " stroke=#000 stroke-width=1 fill=none />";
				break;
			case '1':
				outStr += "<line x1="+(left+0.53*width)+" y1="+(top+0.1*height)+" x2="+(left+0.49*width)+" y2="+(top+0.9*height);
				outStr += " stroke=#000 stroke-width=1 />";
				outStr += "<line x1="+(left+0.53*width)+" y1="+(top+0.1*height)+" x2="+(left+0.42*width)+" y2="+(top+0.15*height);
				outStr += " stroke=#000 stroke-width=1 />";
				break;
			case '2':
				outStr += "<path d=\"M"+(left+0.1*width)+" "+(top+0.3*height)+" A"+0.3*width+","+0.3*height+" 0 0,1 "+(left+width*0.8)+","+(top+height*0.4);
				outStr += " A"+(0.8*width)+","+(0.8*height)+" 0 0,0 "+(left+width*0.1)+","+(top+height*0.9);
				outStr += " L"+(left+width*0.8)+" "+(top+height*0.85)+"\" stroke=#000 stroke-width=1 fill=none />";
				break;
			case '3':
				outStr += "<path d=\"M"+(left+0.1*width)+" "+(top+0.3*height)+" A"+0.3*width+","+0.2*height+" 0 1,1 "+(left+width*0.2)+","+(top+height*0.4);
				outStr += " L"+(left+0.4*width)+","+(0.45*height);
				outStr += " A"+(0.35*width)+","+(0.25*height)+" 0 1,1 "+(left+width*0.1)+","+(top+height*0.8);
				outStr += " \" stroke=#000 stroke-width=1 fill=none />";
				break;
			case '4':
				outStr += "<line x1="+(left+0.53*width)+" y1="+(top+0.1*height)+" x2="+(left+0.05*width)+" y2="+(top+0.6*height);
				outStr += " stroke=#000 stroke-width=1 />";
				outStr += "<line x1="+(left+0.53*width)+" y1="+(top+0.1*height)+" x2="+(left+0.42*width)+" y2="+(top+0.9*height);
				outStr += " stroke=#000 stroke-width=1 />";
				outStr += "<line x1="+(left+0.1*width)+" y1="+(top+0.6*height)+" x2="+(left+0.8*width)+" y2="+(top+0.55*height);
				outStr += " stroke=#000 stroke-width=1 />";
				break;
			case '5':
				outStr += "<line x1="+(left+0.1*width)+" y1="+(top+0.1*height)+" x2="+(left+0.8*width)+" y2="+(top+0.1*height);
				outStr += " stroke=#000 stroke-width=1 />";
				outStr += "<line x1="+(left+0.1*width)+" y1="+(top+0.1*height)+" x2="+(left+0.1*width)+" y2="+(top+0.4*height);
				outStr += " stroke=#000 stroke-width=1 />";
				outStr += "<path d=\"M"+(left+0.1*width)+" "+(top+0.4*height);
				outStr += " A"+0.5*width+","+0.2*height+" 0 1,1 "+(left+width*0.1)+","+(top+height*0.9);
				outStr += "\" stroke=#000 stroke-width=1 fill=none />";
				break;
			case '6':
				outStr += "<line x1="+(left+0.8*width)+" y1="+(top+0.1*height)+" x2="+(left+0.2*width)+" y2="+(top+0.6*height);
				outStr += " stroke=#000 stroke-width=1 />";
				outStr += "<ellipse rx="+0.42*width+" ry="+0.23*height+" cx="+(left+0.5*width)+" cy="+(top+0.75*height);
				outStr += " stroke=#000 stroke-width=1 fill=none />";
				break;
			case '7':
				outStr += "<line x1="+(left+0.1*width)+" y1="+(top+0.1*height)+" x2="+(left+0.8*width)+" y2="+(top+0.1*height);
				outStr += " stroke=#000 stroke-width=1 />";
				outStr += "<line x1="+(left+0.8*width)+" y1="+(top+0.1*height)+" x2="+(left+0.42*width)+" y2="+(top+0.9*height);
				outStr += " stroke=#000 stroke-width=1 />";
				break;
			case '8':
				outStr += "<ellipse rx="+0.36*width+" ry="+0.21*height+" cx="+(left+0.5*width)+" cy="+(top+0.28*height);
				outStr += " stroke=#000 stroke-width=1 fill=none />";
				outStr += "<ellipse rx="+0.40*width+" ry="+0.23*height+" cx="+(left+0.5*width)+" cy="+(top+0.74*height);
				outStr += " stroke=#000 stroke-width=1 fill=none />";
				break;
			case '9':
				outStr += "<ellipse rx="+0.42*width+" ry="+0.23*height+" cx="+(left+0.5*width)+" cy="+(top+0.25*height);
				outStr += " stroke=#000 stroke-width=1 fill=none />";
				outStr += "<line x1="+(left+0.2*width)+" y1="+(top+0.9*height)+" x2="+(left+0.8*width)+" y2="+(top+0.4*height);
				outStr += " stroke=#000 stroke-width=1 />";
				break;
			}
		}
		
		return outStr+"</svg>";
	}
}


class miniDB extends Thread {
	static miniDB dbthread;
	private LinkedList<String> captchaQ;
	private LinkedList<Box> getMsgQ;
	private HashMap<String,String> captchaMap;

	miniDB(){
		captchaQ = new LinkedList<String>();
		getMsgQ = new LinkedList<Box>();
		captchaMap = new HashMap<String,String>();
		dbthread = this;
		dbthread.start();
	}

	public void run(){
		while(true){
			String str = qget();
			if(str==null){
				try {Thread.sleep(10000);} catch (InterruptedException e) {}
				continue;
			}
			
			Pattern p = Pattern.compile("(.*)\\$(.*)");
			Matcher m = p.matcher(str);
			if(!m.matches()){
				//取得処理
				Box box = getMsgQ.removeFirst();
				if(box!=null){
					box.msg = captchaMap.get(str);
					try{
						box.thread.interrupt();//起きろ
					}catch(Exception e){
					}
				}
				continue;
			}
			String seedStr = m.group(1);
			String numberStr = m.group(2);
			if(numberStr.equals("")){
				//削除処理
				captchaMap.remove(seedStr);
			}
			else{
				//追加処理
				captchaMap.put(seedStr,numberStr);
			}
		}
	}
	
	private class Box {
		String msg;
		Thread thread;
	};

	synchronized public String getHashMap(String userStr){
		Box box = new Box();
		box.msg=null;
		box.thread = Thread.currentThread();
		captchaQ.addFirst(userStr);
		getMsgQ.addFirst(box);
		dbthread.interrupt(); //スレッド起きろ
		if(box.msg==null){
			try {wait(1000);} catch (InterruptedException e) {}
		}
		return box.msg;
	}

	synchronized public void qput(String obj) {
		captchaQ.addFirst(obj);
		dbthread.interrupt(); //スレッド起きろ
	}
	synchronized public String qget() {
		if(captchaQ.isEmpty()) return null;
		String obj = captchaQ.removeFirst();
		return obj;
	}
}

