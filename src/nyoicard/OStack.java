package nyoicard;

import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.awt.image.DataBuffer;
import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.TreeSet;

import javax.imageio.ImageIO;
import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;

import net.arnx.jsonic.JSON;
import nyoicard.fileupload;

import org.w3c.dom.Document;




class convertPictureThread extends Thread{
	OStack stack;
	
	convertPictureThread(OStack instack){
		stack = instack;
	}
	
	public void run(){
		if(stack.threadList!=null){
			Thread lastp = null;
			//Thread lastp2 = null;
			for(int i=0; i<stack.threadList.size(); i++){
				Thread p = stack.threadList.get(i);
				if(p!=null&&!p.isAlive()){
					p.start();
				}
				//並行2スレッドまで
				while(lastp!=null && lastp.isAlive()){
					try {
						Thread.sleep(20);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}
				//lastp2 = lastp;
				lastp = p;
			}
		}
	}
}

class HCData {
	public boolean readDataFork(DataInputStream dis, OStack stack){
		//System.out.println("==readDataFork==");
		
		boolean result = false;
		boolean isReadStack = false;
		int aligncnt = 0; //for debug
		int errCount = 0;
		
		try {
			while(dis.available()>0){
				int blockSize = readCode(dis, 2); //int blockSize = readCode(dis, 4);ずれるので2個しか読まないようにしてやった
				int typeCode = readCode(dis, 4);
				HCStackDebug.write("\n blockSize:0x"+Integer.toHexString(blockSize));
				HCStackDebug.write("\n typeCode:0x"+Integer.toHexString(typeCode));
				HCStackDebug.write("\n");
				
				while(true){
					String typeStr = "";
					typeStr += (char)(0xFF&(typeCode>>24));
					typeStr += (char)(0xFF&(typeCode>>16));
					typeStr += (char)(0xFF&(typeCode>>8));
					typeStr += (char)(0xFF&(typeCode>>0));
					
					if(typeStr.equals("STAK")){
						if(isReadStack){
							break;
						}
						HCStackDebug.blockstart(typeStr);
						isReadStack = true;
						stack.readStackBlock(stack, dis, blockSize);
					}
					else if(typeStr.equals("STBL")){
						HCStackDebug.blockstart(typeStr);
						stack.readStyleBlock(dis, blockSize);
					}
					else if(typeStr.equals("FTBL")){
						HCStackDebug.blockstart(typeStr);
						stack.readFontBlock(stack, dis, blockSize);
					}
					else if(typeStr.equals("LIST")){
						HCStackDebug.blockstart(typeStr);
						stack.readListBlock(dis, blockSize);
					}
					else if(typeStr.equals("PAGE")){
						HCStackDebug.blockstart(typeStr);
						stack.readPageBlock(dis, blockSize, stack);
					}
					else if(typeStr.equals("CARD")){
						HCStackDebug.blockstart(typeStr);
			    		OCard cd = new OCard(stack);
						if(cd.readCardBlock(dis, blockSize)){
							stack.cdCacheList.add(cd);
						}
						else{
							errCount++;
						}
						java.lang.System.gc();//GCをなるべく呼ぶ
					}
					else if(typeStr.equals("BKGD")){
						HCStackDebug.blockstart(typeStr);
						OBackground bg = new OBackground(stack);
						if(bg.readBackgroundBlock(dis, blockSize)){
							stack.AddNewBg(bg);
						}else{
							errCount++;
						}
					}
					else if(typeStr.equals("MAST")){
						HCStackDebug.blockstart(typeStr);
						stack.readNullBlock(dis, blockSize);
					}
					else if(typeStr.equals("BMAP")){
						HCStackDebug.blockstart(typeStr);
						readPictureBlock(dis, blockSize, stack);
					}
					else if(typeStr.equals("FREE")){
						HCStackDebug.blockstart(typeStr);
						stack.readNullBlock(dis, blockSize);
					}
					else if(typeStr.equals("PRNT")){
						HCStackDebug.blockstart(typeStr);
						stack.readNullBlock(dis, blockSize);
					}
					else if(typeStr.equals("PRST")){
						HCStackDebug.blockstart(typeStr);
						stack.readNullBlock(dis, blockSize);
					}
					else if(typeStr.equals("PRFT")){
						HCStackDebug.blockstart(typeStr);
						stack.readNullBlock(dis, blockSize);
					}
					else if(typeStr.equals("TAIL")){
						HCStackDebug.blockstart(typeStr);
						if(isReadStack){
							result = true;
						}
						break;
					}
					else{
						while(true){
							//アライメントをどうにか合わせてみる
							blockSize = (0x00FFFFFF&blockSize)<<8;
							blockSize += (0x00FF&(typeCode>>24));
							HCStackDebug.write("\n<blockSize:"+blockSize);
							
							typeCode = typeCode<<8;
							int read = readCode(dis, 1);
							if(read == -1) throw new IOException();
							HCStackDebug.write(" read:"+((read>=32)?Character.toString((char)read):read));
							typeCode += read;
							HCStackDebug.write("<typeCode:"+typeCode);
							
							aligncnt++;
							if(aligncnt==32){
								System.out.println("!");
								break;
							}
							
							if((typeCode&0xFF000000)!=0x00000000){
								break;
							}
						}
						if(aligncnt<=32000){
						    continue;
						}
					}
					HCStackDebug.debuginfo("<<end of "+typeStr+">>");
					HCStackDebug.debuginfo("size:"+Integer.toString(blockSize));
					//System.out.println("blockSize:"+blockSize);
					//System.out.println("typeStr:"+typeStr);
					aligncnt=0;
					break;
				}
				if(result == true){
					break;
				}

			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		for(int i=0; i<stack.cardIdList.size(); i++){
			OCard cd = OCard.getOCard(stack,stack.cardIdList.get(i),true);
			if(cd!=null){
				cd.marked = stack.cardMarkedList.get(i);
			}
		}

		if(stack.GetCardbyId(stack.firstCard)!=null && stack.cardIdList.size()>0 && stack.cardIdList.get(0)!=stack.firstCard){
			//firstCardをリストの先頭にする
			ArrayList<Integer> newList = new ArrayList<Integer>();
			int i=0;
			for(; i<stack.cardIdList.size(); i++){
				if(stack.cardIdList.get(i)==stack.firstCard)
				{
					break;
				}
			}
			for(int j=0; j<stack.cardIdList.size(); j++){
				newList.add(stack.cardIdList.get((j+i)%stack.cardIdList.size()));
			}
			stack.cardIdList = newList;
		}

		if(result==true){
			//カードの枚数チェック
			if(stack.optionStr.contains("debugchk")){
				System.out.println(stack.cdCacheList.size()+","+stack.cardIdList.size());
				if(stack.cdCacheList.size()!=stack.cardIdList.size()){
					System.out.println("number of cards check error.");
					//result = false;
				}
			}
			if(errCount>0){
				System.out.println("errCount="+errCount);
				//result = false;
			}
		}

		HCStackDebug.write("--\n");
		for(int i=0; i<stack.cdCacheList.size();i++){
			HCStackDebug.write("card data "+i+" id:"+stack.cdCacheList.get(i).id+"\n");
		}
		HCStackDebug.write("--\n");
		for(int i=0; i<stack.cardIdList.size();i++){
			HCStackDebug.write("card id "+i+" id:"+stack.cardIdList.get(i)+"\n");
		}

		//デバッグ情報出力
		if(stack.optionStr.contains("debugchk")){
			File f = new File(new File(stack.path).getParent()+File.separatorChar+"debug_"+stack.name+".txt");
			try {
				FileOutputStream stream = new FileOutputStream(f);
				stream.write(HCStackDebug.allStr.toString().getBytes());
				stream.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		return result;
	}
	
	final static int readCode(DataInputStream dis, int size){
		byte[] opcode = new byte[size];
		for(int i=0; i<size; i++){
			try {
				int c = dis.read();
				HCStackDebug.read(c);
				opcode[i] = (byte)c;
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		int iop = 0;
		if(size==1){
			iop = (opcode[0])&0xff;
			//System.out.println("code1:"+opcode[0]);
		}
		else if(size==2) {
			iop = (short)((opcode[0]&0xff)<<8)+(opcode[1]&0xff);
			//System.out.println("code2:"+opcode[0]+" "+opcode[1]);
		}
		else if(size==4) {
			iop = ((opcode[0]&0xff)<<24)+((opcode[1]&0xff)<<16)
				+((opcode[2]&0xff)<<8)+(opcode[3]&0xff);
			//System.out.println("code4:"+opcode[0]+" "+opcode[1]+" "+opcode[2]+" "+opcode[3]);
		}
		else{
			//System.out.println("!!!");
		}
		return iop;
	}
	
	final static String readStr(DataInputStream dis, int size){
		StringBuilder str = new StringBuilder(size);
		//String debugStr = "";
		for(int i=0; i<size; i++){
			try {
				int v = dis.read();
				HCStackDebug.read(v);
				str.append((char)v);
				//debugStr += " "+v;
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		//if(debugStr.length()<40){
			//System.out.println("str:"+debugStr);
		//}else{
			//System.out.println("str/:"+debugStr.substring(0,40));
			//System.out.println("/str"+debugStr.substring(debugStr.length()-40));
		//}
		return str.toString();
	}
	
	final static resultStr readText(DataInputStream dis, int maxLen, OStack stack){
		resultStr result = new resultStr();
		if(maxLen<0) {
			result.str="";
			return result;
		}
		byte[] b = new byte[maxLen];
		result.length_in_src = 0;
		
		int i=0;
		int i2 = 0;
		try {
			for(; i+i2<maxLen; i++){
				int c = dis.read();
				HCStackDebug.read(c);
				result.length_in_src++;
				if(c<0) break;
				if(c>=0x00 && c<=0x1f && c!=0x0a && c!=0x0d && c!=0x09 || c==0x7F) {
					i2++;
					i--;
					continue;
				}
				b[i] = (byte)c;
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		try {
			if(stack.optionStr.contains("Japanese")){
				result.str = new String(b, 0, i, "SJIS");
				result.str = macSJIS(result.str, b, i);
			}else{
				result.str = new String(b, 0, i, "x-MacRoman");
			}
			//改行コード変更
			for(int j=0;j<result.str.length(); j++){
				if(result.str.charAt(j)=='\r'){
					result.str = result.str.substring(0,j)+"\n"+result.str.substring(j+1);
				}
			}
			return result;
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		
		result.str = "";
		return result;
	}
	
	final static resultStr readTextToZero(OStack stack, DataInputStream dis, int maxLen){
		resultStr result = new resultStr();
		if(maxLen<0) {
			result.str="";
			result.length_in_src = 0;
			return result;
		}
		byte[] b = new byte[maxLen];
		result.length_in_src = 0;
		
		int i=0;
		try {
			for(; i<maxLen; i++){
				int c = dis.read();
				HCStackDebug.read(c);
				result.length_in_src++;
				if(c<=0) break;
				b[i] = (byte)c;
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		try {
			if(stack.optionStr.contains("Japanese")){
				result.str = new String(b, 0, i, "SJIS");
				result.str = macSJIS(result.str, b, i);
			}else{
				result.str = new String(b, 0, i, "x-MacRoman");
			}
			//改行コード変更
			for(int j=0;j<result.str.length(); j++){
				if(result.str.charAt(j)=='\r'){
					result.str = result.str.substring(0,j)+"\n"+result.str.substring(j+1);
				}
			}
			return result;
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		
		result.str = "";
		return result;
	}

	private static String macSJIS(String str, byte[] sjis, int length) throws UnsupportedEncodingException{
		boolean notAsciiFlag = false;
		boolean hankakuFlag = false;
		for(int i=0;i<str.length();i++){
			if(str.charAt(i)>='ｧ'&&str.charAt(i)<='ﾝ'){
				hankakuFlag = true;
			}else if(str.charAt(i)>=128){
				if(notAsciiFlag)break;//asciiの範囲外の文字が連続して出てくるなら日本語でOK
				notAsciiFlag=true;
			}else{
				notAsciiFlag=false;
			}
			if(i+1==str.length()&&hankakuFlag){
				return new String(sjis, 0, length, "x-MacRoman");
			}
		}
		
		int j=0;
		for(int i=0; i<str.length()&&j<length-1; i++){
			if(str.charAt(i)=='�'){
				char uniChar = 0;
				switch(0xFF&sjis[j]){
					case 0xFD:uniChar=0x00A9;break;
					case 0xFE:uniChar=0x2122;break;
					case 0xFF:uniChar=0x2026;break;
				}
				int sjisChar = ((0x00FF&sjis[j])<<8)+(0xFF&sjis[j+1]);
				//System.out.println("str:"+str);
				//System.out.println("sjisChar:"+sjisChar);
				for(int k=j-4; k<length&&k<j+4; k++){
					if(k<0)k=0;
					//System.out.println("code:"+Integer.toHexString((int)0xFF&sjis[k]));
				}
				switch(0xFFFF&sjisChar){
				case 0x8540:uniChar=0x2460;break;
				case 0x8541:uniChar=0x2461;break;
				case 0x8542:uniChar=0x2462;break;
				case 0x8543:uniChar=0x2463;break;
				case 0x8544:uniChar=0x2464;break;
				case 0x8545:uniChar=0x2465;break;
				case 0x8546:uniChar=0x2466;break;
				case 0x8547:uniChar=0x2467;break;
				case 0x8548:uniChar=0x2468;break;
				case 0x8549:uniChar=0x2469;break;
				
				case 0x854A:uniChar=0x246A;break;
				case 0x854B:uniChar=0x246B;break;
				case 0x854C:uniChar=0x246C;break;
				case 0x854D:uniChar=0x246D;break;
				case 0x854E:uniChar=0x246E;break;
				case 0x854F:uniChar=0x246F;break;
				case 0x8550:uniChar=0x2470;break;
				case 0x8551:uniChar=0x2471;break;
				case 0x8552:uniChar=0x2472;break;
				case 0x8553:uniChar=0x2473;break;

				case 0x855E:uniChar=0x2474;break;//(1)
				case 0x855F:uniChar=0x2475;break;
				case 0x8560:uniChar=0x2476;break;
				case 0x8561:uniChar=0x2477;break;
				case 0x8562:uniChar=0x2478;break;
				case 0x8563:uniChar=0x2479;break;
				case 0x8564:uniChar=0x247A;break;
				case 0x8565:uniChar=0x247B;break;
				case 0x8566:uniChar=0x247C;break;
				case 0x8567:uniChar=0x247D;break;
				case 0x8568:uniChar=0x247E;break;
				case 0x8569:uniChar=0x247F;break;
				case 0x856A:uniChar=0x2480;break;
				case 0x856B:uniChar=0x2481;break;
				case 0x856C:uniChar=0x2482;break;
				case 0x856D:uniChar=0x2483;break;
				case 0x856E:uniChar=0x2484;break;
				case 0x856F:uniChar=0x2485;break;
				case 0x8570:uniChar=0x2486;break;
				case 0x8571:uniChar=0x2487;break;
				
				case 0x857C:uniChar=0x2776;break;
				case 0x857D:uniChar=0x2777;break;
				case 0x857E:uniChar=0x2778;break;
				case 0x8580:uniChar=0x2779;break;
				case 0x8581:uniChar=0x277A;break;
				case 0x8582:uniChar=0x277B;break;
				case 0x8583:uniChar=0x277C;break;
				case 0x8584:uniChar=0x277D;break;
				case 0x8585:uniChar=0x277E;break;
				
				case 0x8592:uniChar=0x2488;break;//1.
				case 0x8593:uniChar=0x2489;break;
				case 0x8594:uniChar=0x248A;break;
				case 0x8595:uniChar=0x248B;break;
				case 0x8596:uniChar=0x248C;break;
				case 0x8597:uniChar=0x248D;break;
				case 0x8598:uniChar=0x248E;break;
				case 0x8599:uniChar=0x248F;break;
				case 0x859A:uniChar=0x2490;break;
				
				case 0x859F:uniChar=0x2160;break;
				case 0x85A0:uniChar=0x2161;break;
				case 0x85A1:uniChar=0x2162;break;
				case 0x85A2:uniChar=0x2163;break;
				case 0x85A3:uniChar=0x2164;break;
				case 0x85A4:uniChar=0x2165;break;
				case 0x85A5:uniChar=0x2166;break;
				case 0x85A6:uniChar=0x2167;break;
				case 0x85A7:uniChar=0x2168;break;
				case 0x85A8:uniChar=0x2169;break;
				case 0x85A9:uniChar=0x216A;break;
				case 0x85AA:uniChar=0x216B;break;
				
				case 0x85B3:uniChar=0x2170;break;
				case 0x85B4:uniChar=0x2171;break;
				case 0x85B5:uniChar=0x2172;break;
				case 0x85B6:uniChar=0x2173;break;
				case 0x85B7:uniChar=0x2174;break;
				case 0x85B8:uniChar=0x2175;break;
				case 0x85B9:uniChar=0x2176;break;
				case 0x85BA:uniChar=0x2177;break;
				case 0x85BB:uniChar=0x2178;break;
				case 0x85BC:uniChar=0x2179;break;
				case 0x85BD:uniChar=0x217A;break;
				case 0x85BE:uniChar=0x217B;break;

				case 0x85DB:uniChar=0x249C;break;//(a)
				case 0x85DC:uniChar=0x249D;break;
				case 0x85DD:uniChar=0x249E;break;
				case 0x85DE:uniChar=0x249F;break;
				case 0x85DF:uniChar=0x24A0;break;
				case 0x85E0:uniChar=0x24A1;break;
				case 0x85E1:uniChar=0x24A2;break;
				case 0x85E2:uniChar=0x24A3;break;
				case 0x85E3:uniChar=0x24A4;break;
				case 0x85E4:uniChar=0x24A5;break;
				case 0x85E5:uniChar=0x24A6;break;
				case 0x85E6:uniChar=0x24A7;break;
				case 0x85E7:uniChar=0x24A8;break;
				case 0x85E8:uniChar=0x24A9;break;
				case 0x85E9:uniChar=0x24AA;break;
				case 0x85EA:uniChar=0x24AB;break;
				case 0x85EB:uniChar=0x24AC;break;
				case 0x85EC:uniChar=0x24AD;break;
				case 0x85ED:uniChar=0x24AE;break;
				case 0x85EE:uniChar=0x24AF;break;
				case 0x85EF:uniChar=0x24B0;break;
				case 0x85F0:uniChar=0x24B1;break;
				case 0x85F1:uniChar=0x24B2;break;
				case 0x85F2:uniChar=0x24B3;break;
				case 0x85F3:uniChar=0x24B4;break;
				case 0x85F4:uniChar=0x24B5;break;//(z)

				case 0x869F:uniChar=0x2664;break;
				case 0x86A0:uniChar=0x2667;break;
				case 0x86A1:uniChar='♡';break;//ハート
				case 0x86A2:uniChar=0x2662;break;
				case 0x86A3:uniChar=0x2660;break;
				case 0x86A4:uniChar=0x2663;break;
				case 0x86A5:uniChar='♥';break;//ハート
				case 0x86A6:uniChar='♦';break;
				case 0x86B3:uniChar=0x3020;break;
				case 0x86B4:uniChar=0x260E;break;
				case 0x86B5:uniChar=0x3004;break;
				case 0x86C7:uniChar=0x261E;break;
				case 0x86C8:uniChar=0x261C;break;
				case 0x86C9:uniChar=0x261D;break;
				case 0x86CA:uniChar=0x261F;break;
				case 0x86CB:uniChar=0x21C6;break;
				case 0x86CC:uniChar=0x21C4;break;
				case 0x86CD:uniChar=0x21C5;break;
				case 0x86CF:uniChar=0x21E8;break;
				case 0x86D0:uniChar=0x21E6;break;
				case 0x86D1:uniChar=0x21E7;break;
				case 0x86D2:uniChar=0x21E9;break;
				
				case 0x8868:uniChar=0x3094;break;
				case 0x886A:uniChar=0x30F7;break;
				case 0x886B:uniChar=0x30F8;break;
				case 0x886C:uniChar=0x30F9;break;
				case 0x886D:uniChar=0x30FA;break;
				
				//途中でくたびれた
				}
				if(uniChar!=0){
					str = str.substring(0,i)+Character.toString(uniChar)+str.substring(i+1);
					//System.out.println("uniChar:"+Character.toString(uniChar));
					if(uniChar=='♦'){
						str = str.substring(0,i)+"♦"+str.substring(i+1);
						//System.out.println("dia:"+str);
					}
					else if(uniChar=='♡'){
						str = str.substring(0,i)+"♡"+str.substring(i+1);
						//System.out.println("heart:"+str);
					}
				}else{
					System.out.println("what:"+Character.toString(uniChar));
				}
			}
			int up = (0xFF&sjis[j]);
			int down = (0xFF&sjis[j+1]);
			if((up>=0x81&&up<=0x9f||up>=0xe0&&up<=0xef)&&down>=0x40&&down<=0xfc&&down!=0x7f){
				j+=2;
			}else{
				j++;
			}
		}
		return str;
	}

	final static String[] readPatterns(DataInputStream dis, String parentPath){
		String[] patAry = new String[40];
		
		for(int i=0; i<40; i++){
			BufferedImage bi = new BufferedImage(8,8,BufferedImage.TYPE_INT_ARGB);
			DataBuffer db = bi.getRaster().getDataBuffer();
			try {
				for(int y=0; y<8; y++){
					int c = dis.read();
					HCStackDebug.read(c);
					for(int x=0; x<8; x++){
						if(((c>>(7-x))&0x01)==0){
							db.setElem(y*8+x, 0xFFFFFFFF);
						}else{
							db.setElem(y*8+x, 0xFF000000);
						}
					}
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
			//PNG形式に変換してファイルに保存
			String filename = "PAT_"+(i+1)+".png";
			File ofile=new File(parentPath+File.separatorChar+filename);
			try {
				ImageIO.write(bi, "png", ofile);
			} catch (IOException e) {
				e.printStackTrace();
			}
			patAry[i] = filename;
		}
		return patAry;
	}
	
	
	private boolean readPictureBlock(DataInputStream dis, int blockSize, OStack stack){
		//System.out.println("readPictureBlock");

		if(blockSize>200000 || blockSize < 0){
			return false;
		}
		
		//ブロックのデータを順次読み込み
		int bitmapId = HCData.readCode(dis, 4);
		HCStackDebug.debuginfo("bitmapId:"+Integer.toString(bitmapId));
		//System.out.println("bitmapId:"+bitmapId);
		/*String filler =*/ HCData.readStr(dis, 12);
		//System.out.println("filler:"+filler);
		
		int top = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("top:"+Integer.toString(top));
		int left = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("left:"+Integer.toString(left));
		int bottom = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("bottom:"+Integer.toString(bottom));
		int right = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("right:"+Integer.toString(right));
		
		int maskTop = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("maskTop:"+Integer.toString(maskTop));
		int maskLeft = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("maskLeft:"+Integer.toString(maskLeft));
		int maskBottom = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("maskBottom:"+Integer.toString(maskBottom));
		int maskRight = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("maskRight:"+Integer.toString(maskRight));
		
		int imgTop = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("imgTop:"+Integer.toString(imgTop));
		int imgLeft = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("imgLeft:"+Integer.toString(imgLeft));
		int imgBottom = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("imgBottom:"+Integer.toString(imgBottom));
		int imgRight = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("imgRight:"+Integer.toString(imgRight));
		
		/*String filler2 =*/ HCData.readStr(dis, 8);
		//System.out.println("filler2:"+filler2);

		int maskSize = HCData.readCode(dis, 4);
		//HCStackDebug.debuginfo("maskSize:"+Integer.toString(maskSize));
		int imgSize = HCData.readCode(dis, 4);
		//HCStackDebug.debuginfo("imgSize:"+Integer.toString(imgSize));

		if(blockSize < 64+maskSize+imgSize){
			//System.out.println("!:");
			return false;
		}
		if(maskSize<0 || imgSize<0){
			//System.out.println("!:");
			return false;
		}

		//マスクをbyte配列にロード
		byte[] mask = null;
		if(maskSize>0){
			mask = new byte[maskSize];
			try {
				//dis.read(mask);
				for(int i=0; i<maskSize; i++){
					int v = dis.read();
					HCStackDebug.read(v);
					mask[i] = (byte)v;
				}
			} catch (IOException e) {
				e.printStackTrace();
			};
		}

		//イメージをbyte配列にロード
		byte[] img = new byte[imgSize];
		try {
			//dis.read(img);
			for(int i=0; i<imgSize; i++){
				int v = dis.read();
				HCStackDebug.read(v);
				img[i] = (byte)v;
			}
		} catch (IOException e) {
			e.printStackTrace();
		};
		
		//イメージの読み込みは最後に別スレッドで行う
		Thread p = new HCData().new saveThread(mask, img, bitmapId,
				top, left, right, bottom, 
				maskLeft, maskTop, maskRight, maskBottom,
				imgLeft, imgTop, imgRight, imgBottom, stack );
		/*if(stack.GetCardbyId(stack.firstCard)!=null &&
				stack.GetCardbyId(stack.firstCard).bitmapName!=null&&
				stack.GetCardbyId(stack.firstCard).bitmapName.equals("BMAP_"+bitmapId+".png")){
			p.start();
		}
		else if(stack.GetBackgroundbyId(stack.firstBg)!=null &&
				stack.GetBackgroundbyId(stack.firstBg).bitmapName!=null &&
				stack.GetBackgroundbyId(stack.firstBg).bitmapName.equals("BMAP_"+bitmapId+".png")){
			p.start();
		}
		else*/{
			stack.threadList.add(p);
		}
		
		
		//アライメント調整
		int remainLength = blockSize - (64+maskSize+imgSize);
		HCStackDebug.debuginfo("remainLength:"+Integer.toString(remainLength));
		//System.out.println("remainLength:"+remainLength);
		/*String padding =*/ HCData.readStr(dis, remainLength);
		//System.out.println("padding:"+padding);
		
		return true;
	}
	
	
	
	private class saveThread extends Thread
	{
		byte[] mask;
		byte[] img;
		int bitmapId;
		int top;
		int left;
		int right;
		int bottom;
		int maskLeft;
		int maskTop;
		int maskRight;
		int maskBottom;
		int imgLeft;
		int imgTop;
		int imgRight;
		int imgBottom;
		OStack stack;
		
		saveThread(byte[] mask, byte[] img, int bitmapId,
				int top, int left, int right, int bottom, 
				int maskLeft, int maskTop, int maskRight, int maskBottom,
				int imgLeft, int imgTop, int imgRight, int imgBottom, OStack stack )
		{
			this.mask = mask;
			this.img = img;
			this.bitmapId = bitmapId;
			this.top = top;
			this.left = left;
			this.right = right;
			this.bottom = bottom;
			this.maskLeft = maskLeft;
			this.maskTop = maskTop;
			this.maskRight = maskRight;
			this.maskBottom = maskBottom;
			this.imgLeft = imgLeft;
			this.imgTop = imgTop;
			this.imgRight = imgRight;
			this.imgBottom = imgBottom;
			this.stack = stack;
			
			setName("BMAP_"+bitmapId+".png");
		}
		
		@Override
		public void run(){
			//bgに登録されているbitmapIDか？(スタックのデータを読み切ってしまわないと見逃してしまう場合あり)
			boolean isBgPicture = false;
			/*for(int i=0; i<stack.bgCacheList.size(); i++){
				if(stack.bgCacheList.get(i).bitmapName!=null && stack.bgCacheList.get(i).bitmapName.equals("BMAP_"+bitmapId+".png")){
					isBgPicture = true;
					break;
				}
			}*/
			
			BufferedImage maskBi = null;
			if(mask!=null){
				maskBi = readWOBA(mask, bitmapId, right, bottom, maskLeft, maskTop, maskRight, maskBottom, false);
			}
			BufferedImage mainBi = readWOBA(img, bitmapId, right, bottom, imgLeft, imgTop, imgRight, imgBottom, isBgPicture);
			
			Graphics2D g = mainBi.createGraphics();
			if(!isBgPicture){
				//範囲外を透明化
				DataBuffer maindb = mainBi.getRaster().getDataBuffer();
				for(int y=0; y<mainBi.getHeight(); y++){
					for(int x=0; x<imgLeft; x++){
						maindb.setElem(x+y*right, 0x00FF0000);
					}
					for(int x=imgRight; x<right; x++){
						maindb.setElem(x+y*right, 0x00FF0000);
					}
				}
				for(int y=0; y<imgTop; y++){
					for(int x=0; x<right; x++){
						maindb.setElem(x+y*right, 0x00FF0000);
					}
				}
				for(int y=imgBottom; y<bottom; y++){
					for(int x=0; x<right; x++){
						maindb.setElem(x+y*right, 0x00FF0000);
					}
				}
			}else{
				//範囲外を白色化
				g.setColor(Color.WHITE);
				g.fillRect(0,0,imgLeft,bottom);
				g.fillRect(imgRight,0,right,bottom);
				g.fillRect(0,0,right,imgTop);
				g.fillRect(0,imgBottom,right,bottom);
			}
			
			//アルファチャンネル付きのイメージに合成
			if(mask!=null){
				DataBuffer maindb = mainBi.getRaster().getDataBuffer();
				DataBuffer maskdb = maskBi.getRaster().getDataBuffer();
				if(imgTop>top || imgBottom<bottom || imgLeft>left || imgRight<right){ //なんかよくわからんけど、範囲が一部のみになっているときだけマスクが逆に思える
					for(int y=top; y<bottom; y++){
						for(int x=left; x<right; x++){
							int v = 0x00FFFFFF&maindb.getElem(x+y*right);
							if((0xFF000000&maindb.getElem(x+y*right))==0){
								continue;
							}
							if(v!=0){
								v = v | (0xFF000000&(maskdb.getElem(x+y*right)<<24));
							}
							else {
								v = v | 0xFF000000;
							}
							maindb.setElem(x+y*right, v);
						}
					}
				}else{
					for(int y=top; y<bottom; y++){
						for(int x=left; x<right; x++){
							int v = 0x00FFFFFF&maindb.getElem(x+y*right);
							if((0xFF000000&maindb.getElem(x+y*right))==0){
								continue;
							}
							if(v!=0){
								v = v | (0xFF000000&(~maskdb.getElem(x+y*right)<<24));
							}
							else {
								v = v | 0xFF000000;
							}
							maindb.setElem(x+y*right, v);
						}
					}
				}
			}
			else if(!isBgPicture){
				DataBuffer maindb = mainBi.getRaster().getDataBuffer();
				for(int y=imgTop; y<imgBottom; y++){
					for(int x=imgLeft; x<imgRight; x++){
						int v = 0x00FFFFFF & maindb.getElem(x+y*right);
						if(v!=0) v = 0xFFFFFFFF;
						else v = 0xFF000000;
						maindb.setElem(x+y*right, v);
					}
				}
			}

			//ファイルに保存(これに時間がかかる)
			String filename = "BMAP_"+bitmapId+".png";
			File file = new File(new File(stack.path).getParent()+File.separatorChar+filename);
			try {
				ImageIO.write(mainBi, "png", file);
			} catch (IOException e) {
				e.printStackTrace();
			}

			for(int i=0; i<stack.threadList.size(); i++){
				Thread p = stack.threadList.get(i);
				if(p==this){
					stack.threadList.set(i, null);
					break;
				}
			}
		}
	

		//HyperCardのピクチャフォーマット(Wrath Of Bill Atkinson)の読み込み
		private BufferedImage readWOBA(byte[] img, int id, int cdWidth, int cdHeight,
				int left, int top, int right, int bottom, boolean isBgPicture)
		{
			BufferedImage bi = new BufferedImage(cdWidth, cdHeight, BufferedImage.TYPE_INT_ARGB);
			if(isBgPicture){
				Graphics2D g = bi.createGraphics();
				g.setColor(Color.WHITE);
				g.fillRect(0,0,cdWidth,cdHeight);
			}
			else{
				Graphics2D g = bi.createGraphics();
				g.setComposite(AlphaComposite.getInstance(AlphaComposite.CLEAR, 0.0f));
				g.fillRect(0,0,cdWidth,cdHeight);
			}
			
			
			DataBuffer db = bi.getRaster().getDataBuffer();
			left = left/32*32;
			right = (right+31)/32*32;
			//String debugStr = "";
			
			byte[] keepArray = new byte[]{(byte) 0xAA, 0x55, (byte) 0xAA, 0x55, (byte) 0xAA, 0x55, (byte) 0xAA, 0x55};
			int dh = 0;
			int dv = 0;
			int repeatInstructionCount = 0;
			int repeatInstructionIndex = 0;
			
			int i=0;
			for(int y=top; y<bottom; y++){
				//debugStr += "\n"+"line "+y;//####
				
				int opcode = 0;
				int x = left;
				for(; i<img.length && x < right; /*i++*/){
					if(repeatInstructionCount>0){
						i = repeatInstructionIndex;
						repeatInstructionCount--;
						//debugStr += "rep ";//####
					}
					opcode = (0x00FF&img[i]);
					i++;
					//System.out.println("opcode("+i+")="+Integer.toHexString(opcode));
					//debugStr += "["+Integer.toHexString(opcode)+"]";//####
					
					if(opcode <= 0x7F){
						int dataBytes = opcode>>4;
						int zeroBytes = opcode & 0x0F;
						
						for(int j=0; j<zeroBytes; j++){
							for(int k=0; k<8 && x<right; k++){
								db.setElem(x+y*cdWidth, 0xFFFFFFFF);
								x++;
							}
						}
						for(int j=0; j<dataBytes && i<img.length; j++){
							for(int k=0; k<8; k++){
								db.setElem(x+y*cdWidth, (0x01&(img[i]>>(7-k)))!=0?0xFF000000:0xFFFFFFFF);
								x++;
							}
							//debugStr += Integer.toHexString((int)(0x00ff&img[i]))+" ";//####
							i++;
						}
					}
					else if(opcode >= 0x80 && opcode <= 0x8F){
						switch(opcode){
						case 0x80: //1行分無圧縮
							while(x<right && i<img.length){
								for(int k=0; k<8; k++){
									db.setElem(x+y*cdWidth, (0x01&(img[i]>>(7-k)))!=0?0xFF000000:0xFFFFFFFF);
									x++;
								}
								//debugStr += Integer.toHexString((int)(0x00FF&img[i]))+" ";//####
								i++;
							}
							break;
						case 0x81: //1行白
							while(x<right){
								db.setElem(x+y*cdWidth, 0xFFFFFFFF);
								x++;
							}
							break;
						case 0x82: //1行黒
							while(x<right){
								db.setElem(x+y*cdWidth, 0xFF000000);
								x++;
							}
							break;
						case 0x83: //1行同一バイト
							while(x<right){
								for(int k=0; k<8; k++){
									db.setElem(x+y*cdWidth, (0x01&(img[i]>>(7-k)))!=0?0xFF000000:0xFFFFFFFF);
									x++;
								}
							}
							//debugStr += Integer.toHexString(img[i])+" ";//####
							keepArray[y%8] = img[i];
							i++;
							break;
						case 0x84: //1行同一バイト,保持配列のデータを使う
							while(x<right){
								for(int k=0; k<8; k++){
									db.setElem(x+y*cdWidth, (0x01&(keepArray[y%8]>>(7-k)))!=0?0xFF000000:0xFFFFFFFF);
									x++;
								}
							}
							//debugStr += "keep "+Integer.toHexString((int)(0x00FF&keepArray[y%8]))+" ";//####
							break;
						case 0x85: //1行上をコピー
							while(x<right){
								for(int k=0; k<8; k++){
									db.setElem(x+y*cdWidth, db.getElem(0, x+(y-1)*cdWidth));
									x++;
								}
							}
							break;
						case 0x86: //2行上をコピー
							while(x<right){
								for(int k=0; k<8; k++){
									db.setElem(x+y*cdWidth, db.getElem(0, x+(y-2)*cdWidth));
									x++;
								}
							}
							break;
						case 0x87: //3行上をコピー
							while(x<right){
								for(int k=0; k<8; k++){
									db.setElem(x+y*cdWidth, db.getElem(0, x+(y-3)*cdWidth));
									x++;
								}
							}
							break;
						case 0x88:
							dh = 16; dv = 0; //16bit右シフトしてXOR
							break;
						case 0x89:
							dh = 0; dv = 0; //
							break;
						case 0x8A:
							dh = 0; dv = 1; //1行上とXOR
							break;
						case 0x8B:
							dh = 0; dv = 2; //2行上とXOR
							break;
						case 0x8C:
							dh = 1; dv = 0; //1bit右シフトしてXOR
							break;
						case 0x8D:
							dh = 1; dv = 1; //1bit右シフト、1行上とXOR
							break;
						case 0x8E:
							dh = 2; dv = 2; //2bit右シフト、2行上とXOR
							break;
						case 0x8F:
							dh = 8; dv = 0; //8bit右シフトしてXOR
							break;
							
						default:
							//System.out.println("!");
							break;
						}
					}
					else if(opcode >= 0xA0 && opcode <= 0xBF){
						//下5bit分、次のバイトのopcodeを繰り返す
						repeatInstructionCount = (0x1F & opcode);
						repeatInstructionIndex = i;
					}
					else if(opcode >= 0xC0 && opcode <= 0xDF){
						//下5bit*8分のデータ
						int count = (0x1F & opcode)*8;
						while(count>0 && x<cdWidth && i<img.length){
							for(int k=0; k<8; k++){
								db.setElem(x+y*cdWidth, (0x01&(img[i]>>(7-k)))!=0?0xFF000000:0xFFFFFFFF);
								x++;
							}
							count--;
							//debugStr += Integer.toHexString((int)(0x00FF&img[i]))+" ";//####
							i++;
						}
					}
					else if(opcode >= 0xE0 && opcode <= 0xFF){
						//下5bit*16分のゼロ
						int count = (0x1F & opcode)*16;
						while(count>0 && x<cdWidth){
							for(int k=0; k<8; k++){
								db.setElem(x+y*cdWidth, 0xFFFFFFFF);
								x++;
							}
							count--;
						}
					}
				}
	
				if(opcode>=0x80 && opcode<=0x87){
					//1行書き換えのときはdh,dvを実施しない
					continue;
				}
				
				//
				//debugStr += " dh="+dh+" dv="+dv;//####
				if( y<bottom ){
					if (dh>0)
					{
						x=left+dh;
						while(x<right){
							//int v = 0xFF000000|0x00FFFFFF&(db.getElem(0, x+y*cdWidth)^db.getElem(0, (x-dh)+y*cdWidth));
							int a1 = db.getElem(0, x+y*cdWidth);
							int a2 = db.getElem(0, (x-dh)+y*cdWidth);
							int a3 = a1^a2;
							int a4 = 0x00FFFFFF&a3;
							int a5 = 0xFF000000|a4;
							int v = a5;
							v = v^(0x00FFFFFF);
							db.setElem(x+y*cdWidth, v);
							x++;
						}
					}
	
					x=left;
					if (dv>0)
					{
						while(x<right && y>=dv){
							db.setElem(x+y*cdWidth, 0x00FFFFFF^(0xFF000000|0x00FFFFFF&(db.getElem(0, x+y*cdWidth)^db.getElem(0, x+(y-dv)*cdWidth))));
							x++;
						}
					}
				}
				
				//go next row
			}
			
			/*File f = new File("./woba_debug_"+id+".txt");
			try {
				FileOutputStream stream = new FileOutputStream(f);
				stream.write(debugStr.getBytes());
				stream.close();
			} catch (IOException e) {
				e.printStackTrace();
			}*/
			
			return bi;
		}
	}
}


class resultStr{
	String str;
	int length_in_src;
}



class HCStackDebug{
	static StringBuilder allStr = new StringBuilder(10000);
	static String hexstr;
	static StringBuilder debugStr = new StringBuilder(100);
	static int all_counter;
	static int block_counter;

	public static void read(int code){
		if(block_counter%16==0){
			allStr.append("\n");
			allStr.append(Integer.toHexString(all_counter));
			allStr.append(" ");
			allStr.append(Integer.toHexString(block_counter));
			allStr.append(" ");
			allStr.append(hexstr);
			hexstr = "";
			allStr.append(" ");
			allStr.append(debugStr);
			debugStr = new StringBuilder(100);
		}
		hexstr += " "+Integer.toHexString(code);
		all_counter+=1;
		block_counter+=1;
	}
	
	static void debuginfo(String str){
		debugStr.append(" ");
		debugStr.append(str);
	}
	
	static void write(String str){
		allStr.append(str);
	}
	
	static void blockstart(String str){
		block_counter = 0;
		debugStr.append("\n\nBLOCK<<");
		debugStr.append(" "+str);
		debugStr.append(">>");
	}
}




class HCResource {	
	//AppleDoubleHeaderFileの中にリソースフォークのデータがある
	boolean readAppleDoubleHeader(DataInputStream dis, OStack stack){
		//System.out.println("readAppleDoubleHeader");
		
		int magic = readCode(dis, 4);
		if (magic!= 0x51607){
			System.out.println("magic!= 0x51607");
		}
		@SuppressWarnings("unused")
		int version = readCode(dis, 4);
		@SuppressWarnings("unused")
		String homefilesystem = readStr(dis, 16);
		int numberOfEntryies = readCode(dis, 2);
		int theOffset = 26;
		for(int i=0; i<numberOfEntryies; i++){
			int entryId = readCode(dis, 4);
			int entryOffset = readCode(dis, 4);
			int entryLength = readCode(dis, 4);
			theOffset += 12;
			
			if(entryId == 2){
				//リソースフォークのID
				
				//リソースフォークまで読み飛ばす
				int length = (entryOffset-theOffset);
				for(int j=0; j<length; j++){
					try {
						dis.read();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
				
				//リソースフォーク部分を読み込む
				byte[] b = new byte[entryLength];
				for(int j=0; j<entryLength; j++){
					try {
						b[j] = (byte)dis.read();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
				
				//リソースフォークのデータを解析
				readResourceFork(b, stack);

				java.lang.System.gc();//GCをなるべく呼ぶ
				
				break;
			}else{
			}
		}
		
		return true;
	}
	
	private final int readCode(DataInputStream dis, int size){
		byte[] opcode = new byte[size];
		for(int i=0; i<size; i++){
			try {
				opcode[i] = (byte)dis.read();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		int iop = 0;
		if(size==1) iop = (opcode[0])&0xff;
		else if(size==2) iop = ((opcode[0]&0xff)<<8)+(opcode[1]&0xff);
		else if(size==4) iop = ((opcode[0]&0xff)<<24)+((opcode[1]&0xff)<<16)
			+((opcode[2]&0xff)<<8)+(opcode[3]&0xff);
		return iop;
	}
	
	private final String readStr(DataInputStream dis, int size){
		StringBuilder str = new StringBuilder(size);
		for(int i=0; i<size; i++){
			try {
				str.append((char)dis.read());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return str.toString();
	}

	
	//リソースフォーク内に各リソースのデータが含まれる
	private boolean readResourceFork(byte[] b, OStack stack){
		//System.out.println("readResourceFork");
		
		if(b.length==0) return true;
		
        int dataOffset = u4(b,0);
        int mapOffset = u4(b,4);
        @SuppressWarnings("unused")
		int dataLength = u4(b,8);
        @SuppressWarnings("unused")
		int mapLength = u4(b,12);
		//System.out.println("dataOffset:"+dataOffset);
		//System.out.println("mapOffset:"+mapOffset);
		//System.out.println("dataLength:"+dataLength);
		//System.out.println("mapLength:"+mapLength);
		
		int offset = mapOffset+16+4+2;
		@SuppressWarnings("unused")
		int attrs = u2(b,offset);
		offset+=2;

        int typeListOffset = u2(b,offset) + mapOffset + 2;
		offset+=2;
        int nameListOffset = u2(b,offset) + mapOffset;
		offset+=2;
        int typesCount = u2(b,offset) + 1;
		offset+=2;
		
        for (int i = 0; i < typesCount && offset+8<=b.length; i++) {
    		//System.out.println("========");
    		//各タイプと個数、位置
    		offset = typeListOffset + 8*i;
        	String type = str4(b,offset);
    		//System.out.println("type:"+type);
        	offset+=4;
        	int count = u2(b,offset) + 1;
    		//System.out.println("count:"+count);
        	offset+=2;
        	int rsrcoffset = u2(b,offset)+ typeListOffset - 2;
        	offset+=2;

        	//各リソースのヘッダー
    		offset = rsrcoffset;
            for (int j=0; j<count; j++) {
        		//System.out.println("====");
            	//ヘッダ部分
            	int id = s2(b,offset);
            	offset+=2;
            	int nameoffset = s2(b,offset);
            	offset+=2;
        		//System.out.println("nameoffset:"+nameoffset);
                if(nameoffset>=0) nameoffset += nameListOffset;
        		//System.out.println("nameoffset:"+nameoffset);
                @SuppressWarnings("unused")
				int rsrcAttr = u1(b,offset);
            	offset+=1;
                int dataoffset = u3(b,offset) + dataOffset;
        		//System.out.println("dataOffset:"+dataOffset);
            	offset+=3;
                offset+=4; //reserved

                //名前
                String name = "";
                if (nameoffset >= 0) {
                    int namelen = u1(b,nameoffset);
            		//System.out.println("namelen:"+namelen);
            		try {
            			if(stack.optionStr.contains("Japanese")){
    						name = new String(b,nameoffset+1,namelen,"SJIS");
            			}else{
            				name = new String(b, nameoffset+1,namelen, "x-MacRoman");
            			}
            		} catch (UnsupportedEncodingException e) {
            			e.printStackTrace();
            		}
                }
        		//System.out.println("name:"+name);
        		
        		//データ
                int datalen = u4(b,dataoffset);
                readResourceData(stack, b, dataoffset+4, datalen, type, id, name);
            }
        }
		
		return true;
	}

	private final String strn(byte[] b, int offset, int length, OStack stack){
		/*StringBuilder str = new StringBuilder(length);
		for(int i=0; i<length; i++){
			str.append((char)b[offset+i]);
		}
		return str.toString();*/
		if(stack.optionStr.contains("Japanese")){
			try {
				return new String(b, offset, length, "SJIS");
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
			return new String(b, offset, length);
		}else{
			try {
				return new String(b, offset, length, "x-MacRoman");
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
			return new String(b, offset, length);
		}
	}
	
	private final String str4(byte[] b, int offset){
		StringBuilder str = new StringBuilder(4);
		str.append((char)b[offset]);
		str.append((char)b[offset+1]);
		str.append((char)b[offset+2]);
		str.append((char)b[offset+3]);
		return str.toString();
	}
	
	private final int u4(byte[] b, int offset){
		return (int) ((((long)(0x7F&b[offset]))<<24)+((0xff&b[offset+1])<<16)+((0xff&b[offset+2])<<8)+(0xff&b[offset+3]));
	}
	
	private final int u3(byte[] b, int offset){
		return ((0x00ff&b[offset])<<16)+((0xff&b[offset+1])<<8)+(0xff&b[offset+2]);
	}
	
	private final int u2(byte[] b, int offset){
		return ((0x000000ff&b[offset])<<8)+(0xff&b[offset+1]);
	}
	
	private final short s2(byte[] b, int offset){
		return (short)(((0x00ff&b[offset])<<8)+(0xff&b[offset+1]));
	}
	
	private final int u1(byte[] b, int offset){
		return 0x00ff&b[offset];
	}
	
	
	//各リソースのデータをファイルに変換する
	private void readResourceData(OStack stack,
			byte[] in_b, int start, int datalen,
			String type, int id, String name)
	{
		String parentPath = new File(stack.path).getParent();
		
		byte[] b = new byte[datalen];
		System.arraycopy(in_b, start, b, 0, datalen);
		
		//ファイルに変換
		String filename = null;
		String mytype = type;
		if(type.equals("ICON")){
			filename = convertICON2PNG(b, parentPath, id);
			mytype = "icon";
		}
		else if(type.equals("cicn") ){
			filename = convertcicn2PNG(b, parentPath, id);
			mytype = "cicn";
		}
		else if(type.equals("ppat") ){
			filename = convertppat2PNG(b, parentPath, id);
			mytype = "ppat";
		}
		else if(type.equals("icl8") ){
			filename = converticl82PNG(b, parentPath, id);
			mytype = "icl8";
		}
		else if(type.equals("PICT") || type.equals("pict") || type.equals("Pdat") ){
			filename = convertPICT2PICTfile(b, parentPath, id);
			mytype = "picture";
		}
		else if(type.equals("snd ")){
			filename = convertSND2AIFF(b, parentPath, id);
			mytype = "sound";
		}
		else if(type.equals("CURS")){
			//CURSは関数内で登録する
			filename = null;
			convertCURS2Cursor(b, parentPath, id, name, stack.rsrc);
		}
		else if(type.equals("FONT") || type.equals("NFNT")){
			convertFONT2PNG(b, parentPath, id, name, stack.rsrc);
		}
		else if(type.equals("HCcd") || type.equals("HCbg")){
			Rsrc.addcolorClass addColorOwner;
			addColorOwner = stack.rsrc.new addcolorClass(Integer.toString(id), type.equals("HCbg"));
			convertAddColorResource(addColorOwner, b, stack);
		    stack.rsrc.addcolorList.add(addColorOwner);
		}
		else if(type.equals("PLTE")){
			Rsrc.PlteClass plteOwner;
			plteOwner = stack.rsrc.new PlteClass(id, name,0,true,0,0, new Point(0,0));
			convertPLTEResource(plteOwner, b, stack.rsrc, stack);
		    stack.rsrc.plteList.add(plteOwner);
		}
		else if(type.equals("XCMD") || type.equals("xcmd") || type.equals("XFCN") || type.equals("xfcn")){
			//XCMDは関数内で登録する
			convertXCMD2file(b, type, id, name, stack);
		}
		else{
			filename = convertRsrc2file(b, type, parentPath, id, name);
			mytype = type;
    		//System.out.println("Error: Unknown resource type \""+type+"\"");
		}
		
		//リソースとして登録
		if(filename!=null){
			stack.rsrc.addResource(id, mytype, name, filename);
		}
	}

	//-----------
	// ICON
	//-----------
	private String convertICON2PNG(byte[] b, String parentPath, int id)
	{
		//アイコンデータの取り込み
		//単なる32*32bitの固定データ
		BufferedImage bi = new BufferedImage(32,32,BufferedImage.TYPE_INT_ARGB);
		DataBuffer db = bi.getRaster().getDataBuffer();
		for(int y=0; y<32; y++){
			for(int x=0; x<32; x++){
				int c = b[y*4+x/8];
				c = 0x01&(c>>(7-x%8));
				db.setElem(x+y*32, (c==0) ? 0xFFFFFFFF:0xFF000000);
			}
		}

		//周辺の白色を透明化
		for(int y=0; y<32; y++){
			int x=0;
			if(db.getElem(0, y*32+x)==0xFFFFFFFF){
				clearPixel(x, y, db);
			}
			x=31;
			if(db.getElem(0, y*32+x)==0xFFFFFFFF){
				clearPixel(x, y, db);
			}
		}
		for(int x=0; x<32; x++){
			int y=0;
			if(db.getElem(0, y*32+x)==0xFFFFFFFF){
				clearPixel(x, y, db);
			}
			y=31;
			if(db.getElem(0, y*32+x)==0xFFFFFFFF){
				clearPixel(x, y, db);
			}
		}
		
		//PNG形式に変換してファイルに保存
		File ofile=new File(parentPath+File.separatorChar+"ICON_"+id+".png");
		try {
			ImageIO.write(bi, "png", ofile);
		} catch (IOException e) {
			e.printStackTrace();
		}

		if(ofile.exists()){
			//変換成功
			return ofile.getName();
		}
		
		return null;
	}
	
	private final void clearPixel(int x, int y, DataBuffer db){
		db.setElem(x+y*32,0x00FFFFFF);
		if(x>0){
			if(db.getElem(0, y*32+x-1)==0xFFFFFFFF){
				clearPixel(x-1, y, db);
			}
		}
		if(x+1<32){
			if(db.getElem(0, y*32+x+1)==0xFFFFFFFF){
				clearPixel(x+1, y, db);
			}
		}
		if(y>0){
			if(db.getElem(0, (y-1)*32+x)==0xFFFFFFFF){
				clearPixel(x, y-1, db);
			}
		}
		if(y+1<32){
			if(db.getElem(0, (y+1)*32+x)==0xFFFFFFFF){
				clearPixel(x, y+1, db);
			}
		}
	}
	

	//-----------
	// cicn
	//-----------
	private String convertcicn2PNG(byte[] b, String parentPath, int id)
	{
		BufferedImage bi;
		int offset = 0;

		//カラーアイコンデータの取り込み
		{
			//iconPMap
			/*int baseAddr =*/ u4(b,offset);
			offset+=4;
			int rowBytes = 0x7FFF & u2(b,offset);
			offset+=2;

			/*int top =*/ u2(b,offset);
			offset+=2;
			/*int left =*/ u2(b,offset);
			offset+=2;
			int bottom = u2(b,offset);
			offset+=2;
			int right = u2(b,offset);
			offset+=2;
			/*int pmVersion =*/ u2(b,offset);
			offset+=2;
			int packType = u2(b,offset);
			offset+=2;
			int packSize = u4(b,offset);
			offset+=4;
			/*int hRes =*/ u4(b,offset);
			offset+=4;
			/*int vRes =*/ u4(b,offset);
			offset+=4;
			/*int pixelType =*/ u2(b,offset);
			offset+=2;
			int pixelSize = u2(b,offset);
			offset+=2;
			/*int cmpCount =*/ u2(b,offset);
			offset+=2;
			/*int cmpSize =*/ u2(b,offset);
			offset+=2;
			/*int planeBytes =*/ u4(b,offset);
			offset+=4;

			/*int ctabhandle =*/ u4(b,offset);
			offset+=4;
			/*int pmreserved =*/ u4(b,offset);
			offset+=4;
			
			//maskBMap
			/*int mbaseAddr =*/ u4(b,offset);
			offset+=4;
			int mrowBytes = 0x7FFF & u2(b,offset);
			offset+=2;

			/*int mtop =*/ u2(b,offset);
			offset+=2;
			/*int mleft =*/ u2(b,offset);
			offset+=2;
			/*int mbottom =*/ u2(b,offset);
			offset+=2;
			/*int mright =*/ u2(b,offset);
			offset+=2;

			//int mrowBytes = (mright+7)/8;
			
			//iconBMap
			/*int ibaseAddr =*/ u4(b,offset);
			offset+=4;
			int irowBytes = 0x7FFF & u2(b,offset);
			offset+=2;

			/*int itop =*/ u2(b,offset);
			offset+=2;
			/*int ileft =*/ u2(b,offset);
			offset+=2;
			/*int ibottom =*/ u2(b,offset);
			offset+=2;
			/*int iright =*/ u2(b,offset);
			offset+=2;

			//int irowBytes = (iright+7)/8;

			//int iconData = u4(b,offset);
			//offset+=4;
			
			//画像データ
			BufferedImage maskbi = new BufferedImage(right,bottom,BufferedImage.TYPE_INT_ARGB);
			DataBuffer maskdb = maskbi.getRaster().getDataBuffer();
			for(int y=0; y<bottom; y++){
				byte[] data = new byte[mrowBytes];
				for(int i=0; i<mrowBytes; i++){
					if(offset>=b.length){
						continue;
					}
					data[i] = b[offset];offset++;
				}
			
				for(int x=0; x<right && x*1/8<mrowBytes; x++){
					int idx = data[x*1/8]&0x00FF;
					idx = (idx>>(7-x%8))&0x01;
					maskdb.setElem((y*right)+x, idx==0?0xFF000000:0xFFFFFFFF);
				}
			}	

			//画像データ
			bi = new BufferedImage(right,bottom,BufferedImage.TYPE_INT_ARGB);
			DataBuffer monodb = bi.getRaster().getDataBuffer();
			for(int y=0; y<bottom; y++){
				byte[] data = new byte[irowBytes];
				for(int i=0; i<irowBytes; i++){
					data[i] = b[offset];offset++;
				}
			
				for(int x=0; x<right && x*1/8<irowBytes; x++){
					int idx = data[x*1/8]&0x00FF;
					idx = (idx>>(x%8))&0x01;
					monodb.setElem((y*right)+x, idx==0?0xFF000000:0xFFFFFFFF);
				}
			}

			if(offset+1<b.length){
				/*int iconData =*/ u4(b,offset);
				offset+=4;
				//cTableヘッダ
				/*int ctSeed =*/ u4(b,offset);
				offset+=4;
				/*int ctFlag =*/ u2(b,offset);
				offset+=2;
				int ctSize = u2(b,offset);
				offset+=2;
				
				//palette
				Integer[] palette;
				if(ctSize==0){
					palette = new Integer[]{0xFF000000, 0xFFFFFFFF};
				}
				else{
					palette = new Integer[256];
					for(int i=0; i<ctSize+1; i++){
						int value = 0x00FF&u2(b,offset);
						offset+=2;
						int red = u2(b,offset);
						offset+=2;
						int green = u2(b,offset);
						offset+=2;
						int blue = u2(b,offset);
						offset+=2;
						palette[value] = 0xFF000000 | (((red/256)<<16) + ((green/256)<<8) + ((blue/256)));
					}
				}
		
				//画像データ
				bi = new BufferedImage(right,bottom,BufferedImage.TYPE_INT_ARGB);
				DataBuffer db = bi.getRaster().getDataBuffer();
				for(int y=0; y<bottom; y++){
					byte[] data = new byte[rowBytes];
					if(packType==0){
						for(int i=0; i<rowBytes && offset<b.length; i++){
							data[i] = b[offset];offset++;
						}
					}
					else{
						//packBitsを展開
						for(int i=0; i<packSize; i++){
							int dsize = 0x00FF&b[offset];offset++;
							int doffset = 0;
							if(dsize>=128) {
								//同じデータが連続する場合
								dsize = 256-dsize+1;
								int src = b[offset];offset++;
								i++;
								for(int j=0; j<dsize && j+doffset<data.length; j++){ data[j+doffset] = (byte)src; }
								doffset += dsize;
							}
							else {
								//データそのまま
								dsize++;
								for(int j=0; j<dsize; j++){
									if(rowBytes<=j+doffset){
										//System.out.println("!");
										continue;
									}
									data[j+doffset] = b[offset];offset++;i++;
								}
								doffset += dsize;
							}
						}
					}
				
					for(int x=0; x<right && x*pixelSize/8<rowBytes; x++){
						int idx = data[x*pixelSize/8]&0x00FF;
						if(pixelSize==1) idx = (idx>>(7-x%8))&0x01;
						if(pixelSize==2) idx = (idx>>(6-2*(x%4)))&0x03;
						if(pixelSize==4) idx = (idx>>(4-4*(x%2)))&0x0F;
						if(idx>=palette.length || palette[idx]==null) idx = 0;
						int pixel = palette[idx];
						db.setElem((y*right)+x, pixel);
					}
				}
				
				bi = OCard.makeAlphaImage(bi, maskbi);
			}
		}
		
	
		
		//PNG形式に変換してファイルに保存
		File ofile=new File(parentPath+File.separatorChar+"cicn_"+id+".png");
		try {
			ImageIO.write(bi, "png", ofile);
		} catch (IOException e) {
			e.printStackTrace();
		}

		if(ofile.exists()){
			//変換成功
			return ofile.getName();
		}
		
		return null;
	}
	

	//-----------
	// ppat
	//-----------
	private String convertppat2PNG(byte[] b, String parentPath, int id)
	{
		BufferedImage bi=null;
		int offset = 0;

		//カラーアイコンデータの取り込み
		{
			//PixPat
			int patType = u2(b,offset);
			offset+=2;
			int patMap = u4(b,offset);
			offset+=4;
			int patData = u4(b,offset);
			offset+=4;
			/*int patXData =*/ u4(b,offset);
			offset+=4;
			/*int patXValid =*/ u2(b,offset);
			offset+=2;
			/*int patXMap =*/ u4(b,offset);
			offset+=4;
			
			if(patType!=1){ //PixMap型以外は非対応
				return null;
			}

			//PixMap
			offset=patMap;
			/*int baseAddr =*/ u4(b,offset);
			offset+=4;
			int rowBytes = 0x7FFF & u2(b,offset);
			offset+=2;

			/*int top =*/ u2(b,offset);
			offset+=2;
			/*int left =*/ u2(b,offset);
			offset+=2;
			int bottom = u2(b,offset);
			offset+=2;
			int right = u2(b,offset);
			offset+=2;
			/*int pmVersion =*/ u2(b,offset);
			offset+=2;
			int packType = u2(b,offset);
			offset+=2;
			int packSize = u4(b,offset);
			offset+=4;
			/*int hRes =*/ u4(b,offset);
			offset+=4;
			/*int vRes =*/ u4(b,offset);
			offset+=4;
			/*int pixelType =*/ u2(b,offset);
			offset+=2;
			int pixelSize = u2(b,offset);
			offset+=2;
			/*int cmpCount =*/ u2(b,offset);
			offset+=2;
			/*int cmpSize =*/ u2(b,offset);
			offset+=2;
			/*int planeBytes =*/ u4(b,offset);
			offset+=4;

			int ctabhandle = u4(b,offset);
			offset+=4;
			/*int pmreserved =*/ u4(b,offset);
			offset+=4;

			//colorPalette
			offset=ctabhandle;
			//cTableヘッダ
			/*int ctSeed =*/ u4(b,offset);
			offset+=4;
			/*int ctFlag =*/ u2(b,offset);
			offset+=2;
			int ctSize = u2(b,offset);
			offset+=2;
			
			//palette
			Integer[] palette;
			if(ctSize==0){
				palette = new Integer[]{0xFF000000, 0xFFFFFFFF};
			}
			else{
				palette = new Integer[256];
				for(int i=0; i<ctSize+1; i++){
					int value = 0x00FF&u2(b,offset);
					offset+=2;
					int red = u2(b,offset);
					offset+=2;
					int green = u2(b,offset);
					offset+=2;
					int blue = u2(b,offset);
					offset+=2;
					palette[value] = 0xFF000000 | (((red/256)<<16) + ((green/256)<<8) + ((blue/256)));
				}
			}
			
			//画像データ
			offset=patData;
			bi = new BufferedImage(right,bottom,BufferedImage.TYPE_INT_ARGB);
			DataBuffer db = bi.getRaster().getDataBuffer();
			for(int y=0; y<bottom; y++){
				byte[] data = new byte[rowBytes];
				if(packType==0){
					for(int i=0; i<rowBytes && offset<b.length; i++){
						data[i] = b[offset];offset++;
					}
				}
				else{
					//packBitsを展開
					for(int i=0; i<packSize; i++){
						int dsize = 0x00FF&b[offset];offset++;
						int doffset = 0;
						if(dsize>=128) {
							//同じデータが連続する場合
							dsize = 256-dsize+1;
							int src = b[offset];offset++;
							i++;
							for(int j=0; j<dsize && j+doffset<data.length; j++){ data[j+doffset] = (byte)src; }
							doffset += dsize;
						}
						else {
							//データそのまま
							dsize++;
							for(int j=0; j<dsize; j++){
								if(rowBytes<=j+doffset){
									//System.out.println("!");
									continue;
								}
								data[j+doffset] = b[offset];offset++;i++;
							}
							doffset += dsize;
						}
					}
				}
				
				//パレットを元に画像イメージ作成
				for(int x=0; x<right && x*pixelSize/8<rowBytes; x++){
					int idx = data[x*pixelSize/8]&0x00FF;
					if(pixelSize==1) idx = (idx>>(7-x%8))&0x01;
					if(pixelSize==2) idx = (idx>>(6-2*(x%4)))&0x03;
					if(pixelSize==4) idx = (idx>>(4-4*(x%2)))&0x0F;
					if(idx>=palette.length || palette[idx]==null) idx = 0;
					int pixel = palette[idx];
					db.setElem((y*right)+x, pixel);
				}
			}
		}
		
		//PNG形式に変換してファイルに保存
		File ofile=new File(parentPath+File.separatorChar+"ppat_"+id+".png");
		try {
			ImageIO.write(bi, "png", ofile);
		} catch (IOException e) {
			e.printStackTrace();
		}

		if(ofile.exists()){
			//変換成功
			return ofile.getName();
		}
		
		return null;
	}
	

	//-----------
	// icl8(icon-large-8bit)
	//-----------
	private String converticl82PNG(byte[] b, String parentPath, int id)
	{
		BufferedImage bi=null;
		int offset = 0;

		//カラーアイコンデータの取り込み
		{
			//colorPalette
			Integer[] palette;
			{
				palette = new Integer[256];
				for(int i=0; i<216; i++){
					int red = 0xFF*(5-(i/36)%6)/5;
					int green = 0xFF*(5-(i/6)%6)/5;
					int blue = 0xFF*(5-i%6)/5;
					palette[i] = 0xFF000000 | (((red)<<16) + ((green)<<8) + ((blue)));
				}
				for(int i=0; i<10; i++){
					int red = 0xFF*(9-i%10)/9;
					int green = 0;
					int blue = 0;
					palette[216+i] = 0xFF000000 | (((red)<<16) + ((green)<<8) + ((blue)));
				}
				for(int i=0; i<10; i++){
					int red = 0;
					int green = 0xFF*(9-i%10)/9;
					int blue = 0;
					palette[226+i] = 0xFF000000 | (((red)<<16) + ((green)<<8) + ((blue)));
				}
				for(int i=0; i<10; i++){
					int red = 0;
					int green = 0;
					int blue = 0xFF*(9-i%10)/9;
					palette[236+i] = 0xFF000000 | (((red)<<16) + ((green)<<8) + ((blue)));
				}
				for(int i=0; i<10; i++){
					int red = 0xFF*(9-i%10)/9;
					int green = 0xFF*(9-i%10)/9;
					int blue = 0xFF*(9-i%10)/9;
					palette[246+i] = 0xFF000000 | (((red)<<16) + ((green)<<8) + ((blue)));
				}
			}
			
			//画像データ
			offset=0;
			bi = new BufferedImage(32,32,BufferedImage.TYPE_INT_ARGB);
			DataBuffer db = bi.getRaster().getDataBuffer();
			for(int y=0; y<32; y++){
				byte[] data = new byte[32];
				for(int i=0; i<32 && offset<b.length; i++){
					data[i] = b[offset];offset++;
				}
				
				//パレットを元に画像イメージ作成
				for(int x=0; x<32; x++){
					int idx = data[x]&0x00FF;
					if(idx>=palette.length || palette[idx]==null) idx = 0;
					int pixel = palette[idx];
					db.setElem((y*32)+x, pixel);
				}
			}
		}
		
		//PNG形式に変換してファイルに保存
		File ofile=new File(parentPath+File.separatorChar+"icl8_"+id+".png");
		try {
			ImageIO.write(bi, "png", ofile);
		} catch (IOException e) {
			e.printStackTrace();
		}

		if(ofile.exists()){
			//変換成功
			return ofile.getName();
		}
		
		return null;
	}

	//-----------
	// PICT
	//-----------
	private String convertPICT2PICTfile(byte[] b, String parentPath, int id)
	{
		byte[] header = new byte[512];
		
		//FileOutputStream作成
		File ofile=new File(parentPath+File.separatorChar+"PICT_"+id+".pict");
		FileOutputStream stream = null;
		try {
			stream = new FileOutputStream(ofile);
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		}
		if(stream == null){
			return null;
		}

		//512byteのヘッダーを追加してファイルに保存
		try {
			stream.write(header);
			stream.write(b);
			stream.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

		if(ofile.exists()){
			//変換成功したら、さらにPNGに変換
			try{
				BufferedImage bi = PictureFile.loadPICT(parentPath+File.separatorChar+ofile.getName());
				File ofile2=new File(parentPath+File.separatorChar+"PICT_"+id+".png");
				if(bi!=null){
					try {
						ImageIO.write(bi, "png", ofile2);
					} catch (IOException e) {
						e.printStackTrace();
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
	
				//変換成功
				return ofile2.getName();
			}
			catch(Exception e){
				e.printStackTrace();
			}
		}
		
		return null;
	}
	
	
	//-----------
	// SND
	//-----------
	//private static final long nullCmd = 0;
	//private static final long quietCmd = 3;
	//private static final long flushCmd = 4;
	//private static final long reInitCmd = 5;
	//private static final long waitCmd = 10;
	//private static final long pauseCmd = 11;
	//private static final long resumeCmd = 12;
	//private static final long callBackCmd = 13;
	//private static final long syncCmd = 14;
	//private static final long availableCmd = 24;
	//private static final long versionCmd = 25;
	//private static final long freqDurationCmd = 40;
	//private static final long ampCmd = 43;
	//private static final long volumeCmd  = 46;
	//private static final long getVolumeCmd = 47;
	private static final long soundCmd = 80;
	private static final long bufferCmd = 81;
	//private static final long rateMultiplierCmd = 86;
	//private static final long getRateMultiplierCmd = 87;

	
	private static final long sampledSynth = 5;
	//private static final long squareWaveSynth = 1;
	//private static final long waveTableSynth = 3;
	//private static final long MACE3snthID = 11;
	//private static final long MACE6snthID = 13;

	private static final long initMono = 0x0080;
	private static final long initStereo = 0x00C0;
	private static final long initMACE3 = 0x0300;
	private static final long initMACE6 = 0x0400;
	
	private String convertSND2AIFF(byte[] b, String parentPath, int id)
	{
		//System.out.println("SND_"+id+".aiff");
		
		//FileInputStream作成
		FileOutputStream stream = null;
		File ofile=new File(parentPath+File.separatorChar+"SND_"+id+".aiff");
		try {
			stream = new FileOutputStream(ofile);
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		}
		if(stream == null){
			return null;
		}
		
		
		//デバッグ表示
		/*for(int i=0; i<b.length; ){
			String str1="";
			String str2="";
			for(int i2=0; i2<4; i++,i2++){
				str1 += " "+ b[i];
				str2 += (char) b[i];
			}
			System.out.println(str1+"    "+str2);
		}*/
		
		int offset = 0;
		
		if(b.length<2){
			return null;
		}
		
		int format = u2(b,offset);
		//System.out.println("format:"+format);
		offset +=2;
		if(format==1){
			int initMACE = 0;
			/*int numModifiers =*/ u2(b,offset);
			//System.out.println("numModifiers:"+numModifiers);
			offset +=2;
			int modNumber = u2(b,offset);
			//System.out.println("modNumber:"+modNumber);
			offset +=2;
			if(modNumber==sampledSynth){
				//System.out.println("sampledSynth!");
			}
			int modInit = u4(b,offset);
			//System.out.println("modInit:"+modInit);
			offset +=4;
			int channel = 1;
			if((modInit&initMono)==initMono){
				//System.out.println("initMono!");
				channel = 1;
			}
			if((modInit&initStereo)==initStereo){
				//System.out.println("initStereo!");
				channel = 2;
			}
			if((modInit&initMACE3)==initMACE3){
				//System.out.println("initMAC3!");
				initMACE = 3;
			}
			if((modInit&initMACE6)==initMACE6){
				//System.out.println("initMAC6!");
				initMACE = 6;
			}
			int numCommands = u2(b,offset);
			//System.out.println("numCommands:"+numCommands);
			offset +=2;
			
			//SndCommand & data
			for(int n=0; n<numCommands; n++){
				//System.out.println("b[0]:"+b[offset]);
				//System.out.println("b[1]:"+b[offset+1]);
				int sndcmd_cmd = s2(b,offset);
				//System.out.println("sndcmd_cmd:"+sndcmd_cmd);
				offset +=2;
				if((0x00FF&sndcmd_cmd)==bufferCmd){
					//System.out.println("bufferCmd!");
				}
				/*int sndcmd_param1 =*/ u2(b,offset);
				//System.out.println("sndcmd_param1:"+sndcmd_param1);
				offset +=2;
				int sndcmd_param2 = u4(b,offset);
				//System.out.println("sndcmd_param2:"+sndcmd_param2);
				offset +=4;
				
				if((0x00FF&sndcmd_cmd)==bufferCmd){
					int in_offset = sndcmd_param2;
					/*int samplePtr =*/ u4(b,in_offset);
					in_offset +=4;
					//System.out.println("samplePtr:"+samplePtr);
					int length = u4(b,in_offset);
					in_offset +=4;
					//System.out.println("length:"+length);
					int sampleRate = u4(b,in_offset);
					in_offset +=4;
					//System.out.println("sampleRate:"+sampleRate);
					/*int loopStart =*/ u4(b,in_offset);
					in_offset +=4;
					//System.out.println("loopStart:"+loopStart);
					/*int loopEnd =*/ u4(b,in_offset);
					in_offset +=4;
					//System.out.println("loopEnd:"+loopEnd);
					/*int encode =*/ u1(b,in_offset);
					in_offset +=1;
					//System.out.println("encode:"+encode);
					/*int baseFrequency =*/ u1(b,in_offset);
					in_offset +=1;
					//System.out.println("baseFrequency:"+baseFrequency);
					int dataOffset = in_offset;

					//AIFF形式に変換
					AudioFormat af = new AudioFormat(sampleRate/65536.0f, 8, channel,
							false/*signed*/, true/*big-endian*/);
					InputStream in = new ByteArrayInputStream(b, dataOffset, length);
					AudioInputStream ais = new AudioInputStream(in, af, length);
					AudioFileFormat.Type type = AudioFileFormat.Type.AIFF;
					try {
						AudioSystem.write(ais, type, ofile);
						ais.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
				if(initMACE>0/* || sndcmd_cmd==-32687*/){
					int sampleRate = 11025*65536;
					int dataOffset = 54;//offset+22;
					int length = b.length - dataOffset;
					//AIFF形式に変換
					AudioFormat af = new AudioFormat(sampleRate/65536.0f, 8, channel,
							false/*signed*/, true/*big-endian*/);
					InputStream in = new ByteArrayInputStream(b, dataOffset, length);
					AudioInputStream ais = new AudioInputStream(in, af, length);
					AudioFileFormat.Type type = AudioFileFormat.Type.AIFF;
					try {
						AudioSystem.write(ais, type, ofile);
						ais.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
					
					//圧縮された音声の場合はデータを書き込み直す
					try {
						RandomAccessFile raf = new RandomAccessFile(ofile,"rw");
						
						//'FORM'のckSizeを圧縮ヘッダ分増やす
						raf.seek(4);
						byte[] ckSizeByte = new byte[4];
						raf.read(ckSizeByte, 0, 4);
						//System.out.println("ckSizeByte:"+ckSizeByte[0]+","+ckSizeByte[1]+","+ckSizeByte[2]+","+ckSizeByte[3]);
						int ckSize = (((int)(0x00FF&ckSizeByte[0]))<<24) +
							(((int)(0x00FF&ckSizeByte[1]))<<16) +
							(((int)(0x00FF&ckSizeByte[2]))<<8) +
							(((int)(0x00FF&ckSizeByte[3]))<<0);
						//System.out.println("ckSize:"+ckSize);
						ckSize += 16;
						raf.seek(4);
						byte[] ckSizeByte2 = new byte[]{
								(byte)(0xFF&(ckSize>>24)), (byte)(0xFF&(ckSize>>16)), (byte)(0xFF&(ckSize>>8)), (byte)(0xFF&ckSize)};
						//System.out.println("ckSizeByte2:"+ckSizeByte2[0]+","+ckSizeByte2[1]+","+ckSizeByte2[2]+","+ckSizeByte2[3]);
						raf.write(ckSizeByte2, 0, 4);
						
						//'AIFF'->'AIFC'
						raf.seek(11);
						raf.write((byte)'C');

						//'COMM'のckSizeを圧縮ヘッダ分増やす
						raf.seek(12+4);
						byte[] cmSizeByte = new byte[4];
						raf.read(cmSizeByte, 0, 4);
						//System.out.println("cmSizeByte:"+cmSizeByte[0]+","+cmSizeByte[1]+","+cmSizeByte[2]+","+cmSizeByte[3]);
						int cmSize = (((int)(0x00FF&cmSizeByte[0]))<<24) +
							(((int)(0x00FF&cmSizeByte[1]))<<16) +
							(((int)(0x00FF&cmSizeByte[2]))<<8) +
							(((int)(0x00FF&cmSizeByte[3]))<<0);
						//System.out.println("cmSize:"+cmSize);
						cmSize += 16;
						raf.seek(12+4);
						byte[] cmSizeByte2 = new byte[]{
								(byte)(0xFF&(cmSize>>24)), (byte)(0xFF&(cmSize>>16)), (byte)(0xFF&(cmSize>>8)), (byte)(0xFF&cmSize)};
						//System.out.println("cmSizeByte2:"+cmSizeByte2[0]+","+cmSizeByte2[1]+","+cmSizeByte2[2]+","+cmSizeByte2[3]);
						raf.write(cmSizeByte2, 0, 4);
						
						//'SSND'の前に圧縮情報を入れる
						raf.seek(38);
						byte[] saveHeader = new byte[16];
						raf.read(saveHeader, 0, 16);
						raf.seek(38);
						byte[] typebyte;
						if(initMACE == 3){
							typebyte = "MAC3MACE 3-to-1\0".getBytes();
						}else{
							typebyte = "MAC6MACE 6-to-1\0".getBytes();
						}
						raf.write(typebyte);
						raf.write(saveHeader);
						
						//音声データを入れる
						//length = Math.min(length, b.length-dataOffset);
						raf.write(b, dataOffset, b.length-dataOffset);
						raf.close();
					} catch (FileNotFoundException e) {
						e.printStackTrace();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
			}
		}
		else{
			//System.out.println("snd resource version 2.");

			/*int referenceCnt =*/ u2(b,offset);
			//System.out.println("reference cnt:"+referenceCnt);
			offset +=2;
			int numCommands = u2(b,offset);
			//System.out.println("numCommands:"+numCommands);
			offset +=2;
			
			//SndCommand & data
			for(int n=0; n<numCommands; n++){
				//System.out.println("b[0]:"+b[offset]);
				//System.out.println("b[1]:"+b[offset+1]);
				int sndcmd_cmd = s2(b,offset);
				//System.out.println("sndcmd_cmd:"+sndcmd_cmd);
				offset +=2;
				if((0x00FF&sndcmd_cmd)==soundCmd){
					//System.out.println("soundCmd!");
				}
				/*int nil =*/ u2(b,offset);
				//System.out.println("nil:"+nil);
				offset +=2;
				
				if((0x00FF&sndcmd_cmd)==soundCmd){
					/*int samplePtr =*/ u4(b,offset);
					offset +=4;
					//System.out.println("samplePtr:"+samplePtr);
					/*int ptrtodata =*/ u4(b,offset);
					offset +=4;
					//System.out.println("ptrtodata:"+ptrtodata);
					int numofSamples = u4(b,offset);
					offset +=4;
					//System.out.println("numofSamples:"+numofSamples);
					int sampleRate = u4(b,offset);
					offset +=4;
					//System.out.println("sampleRate:"+sampleRate);
					/*int startByte =*/ u4(b,offset);
					offset +=4;
					//System.out.println("startByte:"+startByte);
					int endByte = u4(b,offset);
					offset +=4;
					//System.out.println("endByte:"+endByte);
					int baseNote = u2(b,offset);
					offset +=2;
					//System.out.println("baseNote:"+baseNote);
					if(baseNote>32767){
						numofSamples = endByte;
					}
					
					int dataOffset = offset;

					int channel = 1;
					int length = numofSamples;
					
					//AIFF形式に変換
					AudioFormat af = new AudioFormat(sampleRate/65536.0f, 8, channel,
							false/*signed*/, true/*big-endian*/);
					InputStream in = new ByteArrayInputStream(b, dataOffset, length);
					AudioInputStream ais = new AudioInputStream(in, af, length);
					AudioFileFormat.Type type = AudioFileFormat.Type.AIFF;
					if(baseNote>32767){
						//type = AudioFileFormat.Type.AIFC;
					}
					try {
						AudioSystem.write(ais, type, ofile);
						ais.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
					
					if(baseNote>32767){
						//圧縮された音声の場合はデータを書き込み直す
						try {
							RandomAccessFile raf = new RandomAccessFile(ofile,"rw");
							
							//'FORM'のckSizeを圧縮ヘッダ分増やす
							raf.seek(4);
							byte[] ckSizeByte = new byte[4];
							raf.read(ckSizeByte, 0, 4);
							//System.out.println("ckSizeByte:"+ckSizeByte[0]+","+ckSizeByte[1]+","+ckSizeByte[2]+","+ckSizeByte[3]);
							int ckSize = (((int)(0x00FF&ckSizeByte[0]))<<24) +
								(((int)(0x00FF&ckSizeByte[1]))<<16) +
								(((int)(0x00FF&ckSizeByte[2]))<<8) +
								(((int)(0x00FF&ckSizeByte[3]))<<0);
							//System.out.println("ckSize:"+ckSize);
							ckSize += 16;
							raf.seek(4);
							byte[] ckSizeByte2 = new byte[]{
									(byte)(0xFF&(ckSize>>24)), (byte)(0xFF&(ckSize>>16)), (byte)(0xFF&(ckSize>>8)), (byte)(0xFF&ckSize)};
							//System.out.println("ckSizeByte2:"+ckSizeByte2[0]+","+ckSizeByte2[1]+","+ckSizeByte2[2]+","+ckSizeByte2[3]);
							raf.write(ckSizeByte2, 0, 4);
							
							//'AIFF'->'AIFC'
							raf.seek(11);
							raf.write((byte)'C');

							//'COMM'のckSizeを圧縮ヘッダ分増やす
							raf.seek(12+4);
							byte[] cmSizeByte = new byte[4];
							raf.read(cmSizeByte, 0, 4);
							//System.out.println("cmSizeByte:"+cmSizeByte[0]+","+cmSizeByte[1]+","+cmSizeByte[2]+","+cmSizeByte[3]);
							int cmSize = (((int)(0x00FF&cmSizeByte[0]))<<24) +
								(((int)(0x00FF&cmSizeByte[1]))<<16) +
								(((int)(0x00FF&cmSizeByte[2]))<<8) +
								(((int)(0x00FF&cmSizeByte[3]))<<0);
							//System.out.println("cmSize:"+cmSize);
							cmSize += 16;
							raf.seek(12+4);
							byte[] cmSizeByte2 = new byte[]{
									(byte)(0xFF&(cmSize>>24)), (byte)(0xFF&(cmSize>>16)), (byte)(0xFF&(cmSize>>8)), (byte)(0xFF&cmSize)};
							//System.out.println("cmSizeByte2:"+cmSizeByte2[0]+","+cmSizeByte2[1]+","+cmSizeByte2[2]+","+cmSizeByte2[3]);
							raf.write(cmSizeByte2, 0, 4);
							
							//'SSND'の前に圧縮情報を入れる
							raf.seek(38);
							byte[] saveHeader = new byte[16];
							raf.read(saveHeader, 0, 16);
							raf.seek(38);
							byte[] typebyte;
							if(baseNote == 65084){
								typebyte = "MAC6MACE 6-to-1\0".getBytes();
							}else{
								typebyte = "MAC3MACE 3-to-1\0".getBytes();
							}
							raf.write(typebyte);
							raf.write(saveHeader);
							
							//音声データを入れる
							length = Math.min(length, b.length-dataOffset);
							raf.write(b, dataOffset, length);
							raf.close();
						} catch (FileNotFoundException e) {
							e.printStackTrace();
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
			}
		}
		
		try {
			stream.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		if(ofile.exists()){
			//aiffファイルへの変換に成功したので、soxコマンドでwavとoggに変換する
			
			//tmpファイルにコピー
			File tmpFile = new File("/tmp/snd_"+(int)(Math.random()*100)+ofile.getName());
			try {
				FileChannel srcChannel = null;
				FileChannel destChannel = null;
				try {
					srcChannel = new FileInputStream(ofile).getChannel();
					destChannel = new FileOutputStream(tmpFile).getChannel();
					srcChannel.transferTo(0, srcChannel.size(), destChannel);
				} finally {
					srcChannel.close();
					destChannel.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}

			//WAV,OGGファイルへの変換
			String wavName = ofile.getName().substring(0,ofile.getName().lastIndexOf("."))+".wav";
			String oggName = ofile.getName().substring(0,ofile.getName().lastIndexOf("."))+".ogg";
			if(new File("/tmp/"+wavName).exists()){new File("/tmp/"+wavName).delete();}
			if(new File("/tmp/"+oggName).exists()){new File("/tmp/"+oggName).delete();}
			String convCmd = "/usr/bin/sox";
			if(new File("/usr/bin/ffmpeg/").exists()) convCmd = "ffmpeg -y -i";
			{
				String commands = convCmd + " " + tmpFile.getAbsolutePath() +" /tmp/"+ wavName;
				System.out.println(commands);
				String commands2 = convCmd + " " + tmpFile.getAbsolutePath() +" /tmp/"+ oggName;
				try {
					Runtime.getRuntime().exec(commands, null, new File("/"));
					Runtime.getRuntime().exec(commands2, null, new File("/"));
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			
			//変換完了まで待つ
			int cnt = 0;
			while(!new File("/tmp/"+wavName).exists() && cnt<50){
				try {
					Thread.sleep(100);
				} catch (InterruptedException e) {
				}
				cnt++;
			}
			while(!new File("/tmp/"+oggName).exists() && cnt<50){
				try {
					Thread.sleep(100);
				} catch (InterruptedException e) {
				}
				cnt++;
			}

			//tmpファイルから移動
			try {
				tmpFile.delete();
				File wavFile = new File(ofile.getParent()+"/"+wavName);
				new File("/tmp/"+wavName).renameTo(wavFile);
	
				File oggFile = new File(ofile.getParent()+"/"+oggName);
				new File("/tmp/"+oggName).renameTo(oggFile);
			} catch (Exception e) {
				e.printStackTrace();
			}

			return ofile.getName();
		}
		
		return null;
	}


	//-----------
	// CURS
	//-----------
	private void convertCURS2Cursor(byte[] b, String parentPath, int id,
			String name, Rsrc rsrc)
	{
		//カーソルデータの取り込み
		//16*16bitの画像、マスク、Point型
		
		BufferedImage bi = new BufferedImage(16,16,BufferedImage.TYPE_INT_ARGB);
		DataBuffer db = bi.getRaster().getDataBuffer();
		for(int y=0; y<16; y++){
			for(int x=0; x<16; x++){
				int c = b[y*2+x/8];
				c = 0x01&(c>>(7-x%8));
				int m = b[(y+16)*2+x/8];
				m = 0x01&(m>>(7-x%8));
				int v = 0;
				if(c==0&&m!=0) v = 0xFFFFFFFF;
				if(c!=0&&m!=0) v = 0xFF000000;
				if(c==0&&m==0) v = 0x00000000;
				
				db.setElem(x+y*16, v);
			}
		}
		
		//PNG形式に変換してファイルに保存
		File ofile=new File(parentPath+File.separatorChar+"CURS_"+id+".png");
		try {
			ImageIO.write(bi, "png", ofile);
		} catch (IOException e) {
			e.printStackTrace();
		}

		if(ofile.exists()){
			//変換成功
			int y = u2(b,(16*16*2)/8);
			int x = u2(b,(16*16*2)/8);
			rsrc.addResource(id, "cursor", name, ofile.getName(),
					Integer.toString(x), Integer.toString(y));
		}
		
	}
	
	
	//-----------
	// FONT,NFNT
	//-----------
	@SuppressWarnings("unused")
	private void convertFONT2PNG(byte[] b, String parentPath, int id, String name, Rsrc rsrc)
	{
		//フォントデータの取り込み
		int offset = 0;
		
		if(b.length==0) {
			//フォント名のためだけに作られるダミー
			rsrc.addResource(id, "font", name, "", "0", "0");
			return;
		}
		
		Rsrc.FontInfo fontinfo = rsrc.new FontInfo();
		
		fontinfo.fontType = u2(b,offset);
		offset+=2;
		//System.out.println("fontType:"+fontType);
		int firstChar = u2(b,offset);
		fontinfo.firstChar = (char)firstChar;
		offset+=2;
		//System.out.println("firstChar:"+firstChar);
		int lastChar = u2(b,offset);
		fontinfo.lastChar = (char)lastChar;
		offset+=2;
		//System.out.println("lastChar:"+lastChar);
		fontinfo.widMax = u2(b,offset);
		offset+=2;
		//System.out.println("widMax:"+widMax);
		fontinfo.kernMax = u2(b,offset);
		offset+=2;
		//System.out.println("kernMax:"+kernMax);
		fontinfo.nDescent = u2(b,offset);
		offset+=2;
		//System.out.println("nDescent:"+nDescent);
		fontinfo.fRectWidth = u2(b,offset);
		offset+=2;
		//System.out.println("fRectWidth:"+fRectWidth);
		int fRectHeight = u2(b,offset);
		fontinfo.fRectHeight = fRectHeight;
		offset+=2;
		//System.out.println("fRectHeight:"+fRectHeight);
		fontinfo.owTLoc = u2(b,offset);
		offset+=2;
		//System.out.println("owTLoc:"+owTLoc);
		fontinfo.ascent = u2(b,offset);
		offset+=2;
		//System.out.println("ascent:"+ascent);
		fontinfo.descent = u2(b,offset);
		offset+=2;
		//System.out.println("descent:"+descent);
		fontinfo.leading = u2(b,offset);
		offset+=2;
		//System.out.println("leading:"+leading);
		int rowWords = u2(b,offset);
		offset+=2;
		//System.out.println("rowWords:"+rowWords);
		int bitimageOffset = offset;
		offset+=rowWords*2*fRectHeight;
		int loctableOffset = offset;
		offset+=((lastChar-firstChar)+2)*2;
		int owtableOffset = offset;
		offset+=((lastChar-firstChar)+2)*2;

		fontinfo.locs = new int[(lastChar-firstChar)+2];
		fontinfo.offsets = new int[(lastChar-firstChar)+2];
		fontinfo.widthes = new int[(lastChar-firstChar)+2];
		for(int i=0; i<((lastChar-firstChar)+2); i++){
			fontinfo.locs[i] = ((0x00FF&b[loctableOffset+i*2])<<8)+((0x00FF&b[loctableOffset+i*2+1]));
		}
		for(int i=0; i<((lastChar-firstChar)+2); i++){
			fontinfo.offsets[i] = b[loctableOffset+i*2];
			fontinfo.widthes[i] = b[loctableOffset+i*2+1];
		}
		
		//System.out.println("compare:"+(b.length - offset));

		if(rowWords==0) return;
		
		BufferedImage bi = new BufferedImage(rowWords*2*8,fRectHeight,BufferedImage.TYPE_INT_ARGB);
		DataBuffer db = bi.getRaster().getDataBuffer();
		for(int y=0; y<fRectHeight; y++){
			for(int x=0; x<rowWords*2*8; x++){
				int c = b[bitimageOffset+(y*rowWords*2*8+x)/8];
				c = 0x01&(c>>(7-x%8));
				db.setElem(x+y*rowWords*2*8, (c==0) ? 0x00FFFFFF:0xFF000000);
			}
		}
		
		//PNG形式に変換してファイルに保存
		File ofile=new File(parentPath+File.separatorChar+"FONT_"+id+".png");
		try {
			ImageIO.write(bi, "png", ofile);
		} catch (IOException e) {
			e.printStackTrace();
		}

		if(ofile.exists()){
			//変換成功
			int x = firstChar;
			int y = lastChar;
			rsrc.addFontResource(id, "font", name, ofile.getName(),
					fontinfo);
		}
		
	}
	
	
	//-----------
	// XCMD,XFCN
	//-----------
	private void convertXCMD2file(byte[] b,
			String type, int id, String name, OStack stack)
	{
		String funcStr = "";
		if(type.equals("XCMD")||type.equals("xcmd")){
			funcStr = "command";
		}
		else if(type.equals("XFCN")||type.equals("xfcn")){
			funcStr = "function";
		}

		String platform = "";
		if(type.equals("XCMD")||type.equals("XFCN")){
			platform = "68k";
		}
		else if(type.equals("xcmd")||type.equals("xfcn")){
			platform = "ppc";
		}
		
		String path = type+"_"+platform+"_"+id+"_"+name+".data";
		try {
			File file = new File(new File(stack.path).getParent()+File.separatorChar+path);
			FileOutputStream stream = new FileOutputStream(file);
			stream.write(b);
			stream.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		//XCMDマップに追加
		Rsrc.xcmdClass xcmd = stack.rsrc.new xcmdClass(
				Integer.toString(id), funcStr, name, path, "mac"+platform, Integer.toString(b.length));
		stack.rsrc.addXcmd(xcmd);
	}

	
	//-----------
	// AddColor
	//-----------
	private void convertAddColorResource(Rsrc.addcolorClass parent,
			byte[] b, OStack stack)
	{
		int offset = 0;
        
		while(offset+2<b.length)
		{
			int type = b[offset];
			offset++;
			
	        if(type==1){
	        	int btnid = u2(b, offset);
	        	offset += 2;
	        	int bevel = u2(b, offset);
	        	offset += 2;
	        	int red = u2(b, offset);
	        	offset += 2;
	        	int green = u2(b, offset);
	        	offset += 2;
	        	int blue = u2(b, offset);
	        	offset += 2;
	        	parent.addBtnObject(btnid, bevel, new Color(red/256, green/256, blue/256), true);
	        }
	        if(type==2){
	        	int fldid = u2(b, offset);
	        	offset += 2;
	        	int bevel = u2(b, offset);
	        	offset += 2;
	        	int red = u2(b, offset);
	        	offset += 2;
	        	int green = u2(b, offset);
	        	offset += 2;
	        	int blue = u2(b, offset);
	        	offset += 2;
	        	parent.addFldObject(fldid, bevel, new Color(red/256, green/256, blue/256), true);
	        }
	        if(type==3){
	        	int top = u2(b, offset);
	        	offset += 2;
	        	int left = u2(b, offset);
	        	offset += 2;
	        	int bottom = u2(b, offset);
	        	offset += 2;
	        	int right = u2(b, offset);
	        	offset += 2;
	        	Rectangle rect = new Rectangle(left,top,right-left,bottom-top);
	        	int bevel = u2(b, offset);
	        	offset += 2;
	        	int red = u2(b, offset);
	        	offset += 2;
	        	int green = u2(b, offset);
	        	offset += 2;
	        	int blue = u2(b, offset);
	        	offset += 2;
	        	parent.addRectObject(rect, bevel, new Color(red/256, green/256, blue/256), true);
	        }
	        if(type==4 || type==5){
	        	int top = u2(b, offset);
	        	offset += 2;
	        	int left = u2(b, offset);
	        	offset += 2;
	        	int bottom = u2(b, offset);
	        	offset += 2;
	        	int right = u2(b, offset);
	        	offset += 2;
	        	Rectangle rect = new Rectangle(left,top,right-left,bottom-top);
	        	boolean transparent = u1(b, offset)==1;
	        	offset += 1;
	        	int nameLen = u1(b, offset);
	        	offset += 1;
	    		String nameStr = strn(b, offset, nameLen, stack);
	        	offset += nameLen;
	        	parent.addPictObject(nameStr, rect, transparent, true);
	        }
		}
	}


	//-----------
	// PLTE
	//-----------
	private void convertPLTEResource(Rsrc.PlteClass plteOwner, byte[] b, Rsrc rsrc, OStack stack) {
		int offset = 0;
		
    	int windowDef = u4(b, offset);
    	offset += 4;
    	int clearhilite = u2(b, offset);
    	offset += 2;
    	int btnType = u2(b, offset);
    	offset += 2;
    	int pictId = u2(b, offset);
    	offset += 2;
    	int offsetv = u2(b, offset);
    	offset += 2;
    	int offseth = u2(b, offset);
    	offset += 2;
    	@SuppressWarnings("unused")
		int reserved1 = u4(b, offset);
    	offset += 4;
    	@SuppressWarnings("unused")
    	int reserved2 = u4(b, offset);
    	offset += 4;
    	
    	plteOwner.windowDef = windowDef;
    	plteOwner.clearHilite = (clearhilite!=0);
    	plteOwner.btnType = btnType;
    	plteOwner.pictId = pictId;
    	plteOwner.pictHV.x = offseth;
    	plteOwner.pictHV.y = offsetv;
    	
    	int btncount = u2(b, offset);
    	offset += 2;
    	for(int i=0; i<btncount; i++){
    		Rectangle rect = new Rectangle(0,0,0,0);
    		
    		rect.y = u2(b, offset);
        	offset += 2;
    		rect.x = u2(b, offset);
        	offset += 2;
    		rect.height = u2(b, offset)-rect.y;
        	offset += 2;
    		rect.width = u2(b, offset)-rect.x;
        	offset += 2;
        	
        	@SuppressWarnings("unused")
        	int reserved = u2(b, offset);
        	offset += 2;
        	
    		int msgLen = u1(b, offset);
        	offset += 1;
    		String msgStr = strn(b, offset, msgLen, stack);
        	offset += msgLen;
        	if(offset%2==1) offset++;
        	
        	plteOwner.objList.add(rsrc.new plteBtnObject(rect, msgStr));
    	}
	}
	

	//-----------
	// Other Resources
	//-----------
	private String convertRsrc2file(byte[] b,
			String type, String parentPath, int id, String name)
	{
		String path = parentPath+File.separatorChar+type+"_"+id+".data";
		File file = null;
		try {
			file = new File(path);
			FileOutputStream stream = new FileOutputStream(file);
			stream.write(b);
			stream.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		if(file.exists()){
			//変換成功
			return file.getName();
		}
		
		return null;
	}
}



class PictureFile {

	//-------------------------------
	//PICTファイル読み込み
	//-------------------------------
	public static BufferedImage loadPICT(String path) throws Exception
	{
		File file = new File(path);
		if(!file.exists()) return null;
		
		BufferedInputStream stream;
		try {
			stream = new BufferedInputStream(new FileInputStream(path));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			return null;
		}
		
		//サイズ取得
		Dimension size = readPICTv1Size(stream);
		int version = readPICTVer(stream);
		if(version==2) size = readPICTv2Size(stream,version);
		if(size==null) return null;
		if(size.width<=0 || size.height<=0){
			System.out.println("PICT size error");
			return null;
		}

		//各データ
		BufferedImage img = null;
		BufferedImage jpegimg = null;
		int jpgHeight = 0;

		Graphics2D g = null;
		int px = 0;
		int py = 10;
		int fontsize = 12;
		
		while(true){
			int opcode;
			try {
				opcode = readOpcode2(stream,version);
			} catch (IOException e1) {
				break;
			}
			if(opcode==0x0000){ //アライメントずれの暫定措置
				opcode = readOpcode(stream,1);
			}
			boolean bitmap_flag=false;
			boolean packbits_flag=false;
			boolean fullcolor_flag=false;
			boolean rgnmask_flag=false;
			//System.out.println("opcode:0x"+ Integer.toHexString( opcode ));
			if(opcode==0x8200||opcode==0x8201){
				//JPEG
				int filelen = (readOpcode(stream,2)<<16)+readOpcode(stream,2);//00 00 53 60
				for(int i=0; i<100; i++){ //macファイルヘッダ
					readOpcode(stream,1);
				}
				/*int width2 =*/ readOpcode(stream,2);
				/*int height2 =*/ readOpcode(stream,2);
				for(int i=0; i<50; i++){ //macファイルヘッダ2
					readOpcode(stream,1);
				}
				byte[] b = new byte[filelen-154];
				try {
					stream.read(b, 0, filelen-154);
				} catch (IOException e1) {
					e1.printStackTrace();
				}
				try {
					jpegimg = javax.imageio.ImageIO.read(new ByteArrayInputStream(b));
					jpgHeight+=jpegimg.getHeight();
				} catch (Exception e) {
					e.printStackTrace();
				}
				continue;
			}
			else if(opcode==0x0090||opcode==0x0091){
				bitmap_flag = true;
			}
			else if(opcode==0x0098||opcode==0x0099){
				packbits_flag = true;
			}
			else if(opcode==0x009A||opcode==0x009B){
				packbits_flag = true;
				fullcolor_flag = true;
			}
			else if(opcode==0x00a1){
				//ロングコメント
				//ロングコメント
				opcode = readOpcode(stream,2);
				int length = readOpcode(stream,2);
				byte[] b = new byte[length];
				for(int i=0;i<length;i++){b[i] = (byte)readOpcode(stream,1);}
				//String s="";
				try {
					/*s =*/ new String(b, "US-ASCII");
				} catch (UnsupportedEncodingException e) {
				}
				//System.out.println("long comment:"+s);
				continue;
			}
			else if(opcode==0x00ff||opcode==0xffff){
				break; //終了コード
			}
			else if(opcode==0x001e){
				continue; //?
			}
			else if(opcode==0x0001){
				//領域
				int length = readOpcode(stream,2);
				for(int i=0;i<length-2;i++){readOpcode(stream,1);}
				continue;
			}
			else if(opcode==0x001f){
				//OpColor
				readOpcode(stream,2);//r
				readOpcode(stream,2);//g
				readOpcode(stream,2);//b
				continue;
			}
			else if(opcode==0x001e){
				//defHilite
				continue;
			}
			else if(opcode==0x00a0){
				//ショートコメント
				readOpcode(stream,2);
				continue;
			}
			else if(opcode==0x0009){
				//ペンパターン
				int[]penptn = new int[8];
				for(int i=0;i<8;i++){penptn[i] = readOpcode(stream,1);}
				continue;
			}
			else if(opcode==0x0022){
				//ペン位置
				int penX = (short)readOpcode(stream,2);
				int penY = (short)readOpcode(stream,2);
				byte penX2 = (byte)readOpcode(stream,1);
				byte penY2 = (byte)readOpcode(stream,1);
				//System.out.println("penX:"+penX+" penY:"+penY+" penX2:"+penX2+" penY2:"+penY2);
				if(img==null) {
					img = new BufferedImage(size.width, size.height, BufferedImage.TYPE_INT_ARGB);
					g = img.createGraphics();
				}
				g.drawLine(penX, penY, penX+penX2, penY+penY2);
				px = penX+penX2;
				py = penY+penY2;
				continue;
			}
			else if(opcode==0x0007){
				//ペンサイズ
				int penSizeX = readOpcode(stream,2);
				int penSizeY = readOpcode(stream,2);
				if(img==null) {
					img = new BufferedImage(size.width, size.height, BufferedImage.TYPE_INT_ARGB);
					g = img.createGraphics();
				}
				g.setStroke(new BasicStroke((penSizeX+penSizeY)/2, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
				continue;
			}
			else if(opcode==0x001a){
				//RGBcolor｜前景色（RGB）
				int cr = readOpcode(stream,2);
				int cg = readOpcode(stream,2);
				int cb = readOpcode(stream,2);
				if(img==null) {
					img = new BufferedImage(size.width, size.height, BufferedImage.TYPE_INT_ARGB);
					g = img.createGraphics();
				}
				g.setColor(new Color(cr/256,cg/256,cb/256));
				continue;
			}
			else if(opcode==0x001b){
				//RGBcolor｜背景色（RGB）
				int cr = readOpcode(stream,2);
				int cg = readOpcode(stream,2);
				int cb = readOpcode(stream,2);
				if(img==null) {
					img = new BufferedImage(size.width, size.height, BufferedImage.TYPE_INT_ARGB);
					g = img.createGraphics();
				}
				g.setBackground(new Color(cr/256,cg/256,cb/256));
				continue;
			}
			else if(opcode==0x002c){
				//フォント (2+データ長)
				int length = readOpcode(stream,2);
				byte[] b = new byte[length];
				for(int i=0;i<length;i++){b[i] = (byte)readOpcode(stream,1);}
				//String s="";
				try {
					/*s =*/ new String(b, "SJIS");
				} catch (UnsupportedEncodingException e) {
				}
				//System.out.println("font:'"+s+"' at "+px+","+py);
				continue;
			}
			else if(opcode==0x0003){
				//書体ID
				readOpcode(stream,2);
				continue;
			}
			else if(opcode==0x0004){
				//文字形状
				readOpcode(stream,2);
				continue;
			}
			else if(opcode==0x000d){
				//文字サイズ
				fontsize = readOpcode(stream,2);
				g.setFont(new Font("", 0, fontsize));
				continue;
			}
			else if(opcode==0x002e){
				//? 文字に関する何か
				int length = readOpcode(stream,2);
				for(int i=0;i<length;i++){readOpcode(stream,1);}
				px=0;py=0;//###
				continue;
			}
			else if(opcode==0x0028){
				//文字列描画
				int ddx = readOpcode(stream,2);
				int ddy = readOpcode(stream,2);
				int count = readOpcode(stream,1);
				byte[] b = new byte[count];
				for(int i=0;i<count;i++){b[i] = (byte)readOpcode(stream,1);}
				String s="";
				try {
					s = new String(b, "SJIS");
				} catch (UnsupportedEncodingException e) {
				}
				//System.out.println("drawString28:'"+s+"' at "+(ddx)+","+(ddy));
				do{
					String s2 = s;
					if((s.indexOf('\r')>-1)) s2 = s.substring(0,s.indexOf('\r'));
					g.drawString(s2,ddx,ddy+fontsize);
					s = s.substring(s.indexOf('\r')+1);
					ddy = ddy+fontsize;
				}while((s.indexOf('\r')>-1));
				continue;
			}
			else if(opcode==0x0029){
				//文字列描画（水平相対座標）
				int dx = readOpcode(stream,1);
				int count = readOpcode(stream,1);
				byte[] b = new byte[count];
				for(int i=0;i<count;i++){b[i] = (byte)readOpcode(stream,1);}
				String s="";
				try {
					s = new String(b, "SJIS");
				} catch (UnsupportedEncodingException e) {
				}
				//System.out.println("drawString29:'"+s+"' at "+(px+dx)+","+(py));
				do{
					String s2 = s;
					if((s.indexOf('\r')>-1)) s2 = s.substring(0,s.indexOf('\r'));
					g.drawString(s2,px+dx,py+fontsize);
					s = s.substring(s.indexOf('\r')+1);
					py = py+fontsize;
				}while((s.indexOf('\r')>-1));
				continue;
			}
			else if(opcode==0x002a){
				//文字列描画（垂直相対座標）
				int dy = readOpcode(stream,1);
				int count = readOpcode(stream,1);
				byte[] b = new byte[count];
				for(int i=0;i<count;i++){b[i] = (byte)readOpcode(stream,1);}
				String s="";
				try {
					s = new String(b, "SJIS");
				} catch (UnsupportedEncodingException e) {
				}
				//System.out.println("drawString2a:'"+s+"' at "+(px)+","+(py+dy));
				do{
					String s2 = s;
					if((s.indexOf('\r')>-1)) s2 = s.substring(0,s.indexOf('\r'));
					g.drawString(s2,px,py+dy+fontsize);
					s = s.substring(s.indexOf('\r')+1);
					py = py+fontsize;
				}while((s.indexOf('\r')>-1));
				continue;
			}
			else if(opcode==0x002b){
				//文字列描画（水平垂直相対座標）
				int dx = readOpcode(stream,1);
				int dy = readOpcode(stream,1);
				int count = readOpcode(stream,1);
				byte[] b = new byte[count];
				for(int i=0;i<count;i++){b[i] = (byte)readOpcode(stream,1);}
				String s="";
				try {
					s = new String(b, "SJIS");
				} catch (UnsupportedEncodingException e) {
				}
				//System.out.println("drawString2b:'"+s+"' at "+(px+dx)+","+(py+dy));
				do{
					String s2 = s;
					if((s.indexOf('\r')>-1)) s2 = s.substring(0,s.indexOf('\r'));
					g.drawString(s2,px+dx,py+dy+fontsize);
					s = s.substring(s.indexOf('\r')+1);
					py = py+fontsize;
				}while((s.indexOf('\r')>-1));
				continue;
			}
			else if(opcode==0x0c00){
				//バージョン番号
				for(int i=0;i<24;i++){readOpcode(stream,1);}
				continue;
			}
			else{
				//不明
				//System.out.println("opcode:"+opcode);
				continue;
			}

			if(opcode==0x0091||opcode==0x0099||opcode==0x009B){
				rgnmask_flag = true;
			}

			if(img==null) {
				img = new BufferedImage(size.width, size.height, BufferedImage.TYPE_INT_ARGB);
				g = img.createGraphics();
				g.setColor(new Color(255,255,255));
				g.setComposite(AlphaComposite.getInstance(AlphaComposite.CLEAR, 0.0f));
				g.fillRect(0,0, size.width, size.height);
			}
			if(jpegimg!=null){
				//Graphics2D g = img.createGraphics();
				g = img.createGraphics();
				g.drawImage(jpegimg, 0,jpgHeight-jpegimg.getHeight(),null);
			}
			DataBuffer db = img.getRaster().getDataBuffer();

			if(fullcolor_flag){
				readOpcode(stream,2);//ベースアドレス
				readOpcode(stream,2);
			}
			
			int rowBytes = 0x3fff & readOpcode(stream,2);
			
			int btop = readOpcode(stream,2);//左上Ｙ座標
			int bleft = readOpcode(stream,2);
			int bbottom = readOpcode(stream,2);
			int bright = readOpcode(stream,2);
			
			int bpp = 1;
			int[] palette = null;
			if(version==1 || jpegimg!=null){
				palette = new int[]{0xFFFFFFFF, 0xFF000000};
			}
			
			if(!bitmap_flag&&version==2&&jpegimg==null){
				readOpcode(stream,2);//バージョン
				readOpcode(stream,2);//圧縮タイプ
				readOpcode(stream,2);//圧縮サイズ
				readOpcode(stream,2);//圧縮サイズ
				readOpcode(stream,2);//水平解像度
				readOpcode(stream,2);//水平解像度
				readOpcode(stream,2);//垂直解像度
				readOpcode(stream,2);//垂直解像度
				readOpcode(stream,2);//ピクセルタイプ
				bpp = readOpcode(stream,2);//１ピクセルあたりのビット数
				/*int byteoff =*/ readOpcode(stream,2);//次のピクセルまでのバイトオフセット
				/*int pixelbytes =*/ readOpcode(stream,2);//コンポーネントサイズ
				readOpcode(stream,2);//次のカラープレーンまでのオフセット
				readOpcode(stream,2);//次のカラープレーンまでのオフセット
				readOpcode(stream,2);//反転
				readOpcode(stream,2);//反転
				readOpcode(stream,2);//カラーテーブル識別番号
				readOpcode(stream,2);//カラーテーブル識別番号
				if(!fullcolor_flag){
					readOpcode(stream,2);//カラーテーブルID
					readOpcode(stream,2);//カラーテーブルID
					readOpcode(stream,2);//カラーテーブルフラグ
					int palette_cnt = 1+readOpcode(stream,2);//登録されているパレット数
					//if(palette_cnt > 256) return null;
					palette = new int[palette_cnt];
					for(int i=0; i<palette_cnt; i++){
						/*int pidx =*/ readOpcode(stream,2);//パレット番号
						int cr = readOpcode(stream,2)>>8;//パレット色データR
						int cg = readOpcode(stream,2)>>8;//パレット色データG
						int cb = readOpcode(stream,2)>>8;//パレット色データB
						palette[i] = 0xFF000000+(cr<<16)+(cg<<8)+cb;
					}
				}
			}

			if(rowBytes==0) rowBytes = (bright-bleft)*bpp/8;
			if(rowBytes<8) packbits_flag = false;
			
			int dtop = readOpcode(stream,2);//元解像度での左上Ｙ座標
			int dleft = readOpcode(stream,2);
			int dbottom = readOpcode(stream,2);
			int dright = readOpcode(stream,2);
			
			if(dright>size.width || dbottom>size.height){ //無理矢理対応・・・
				dright -= dleft;
				dleft = 0;
				dbottom -= dtop;
				dtop = 0;
				if(dright>size.width || dbottom>size.height){
					break; //無理
				}
			}
			
			readOpcode(stream,2);//72dpiでの左上Ｙ座標
			readOpcode(stream,2);
			readOpcode(stream,2);
			readOpcode(stream,2);
			
			int trans_mode = readOpcode(stream,2);//転送モード
			if(trans_mode!=0){
				//System.out.println("trans_mode:"+trans_mode);
			}
			
			if(rgnmask_flag){
				//System.out.println("rgnmask_flag:"+rgnmask_flag);
				int len = readOpcode(stream,2);
				int rtop = readOpcode(stream,2);//top
				int rleft = readOpcode(stream,2);//left
				readOpcode(stream,2);//bottom
				readOpcode(stream,2);//right
				if(len==10){
					for(int y=0; y<size.height; y++){
						for(int x=0; x<size.width; x++){
							db.setElem(y*size.width+x, 0xFFFFFFFF);
						}
					}
				}
				//for(int i=0; i<len-10;i++){readOpcode(stream,1);}

				//リージョンフォーマット
				//
				//領域の輪郭の線のデータが入っている
				//上から見て行って、輪郭に含まれたら1、もう一度含まれたら0
				//ということをやればビットマップデータに出来る。
				//
				//最初のwordで上からの行数を示す (飛ばした行は上の行と同じ)
				//(繰り返し){
				//  次のwordで輪郭部分の開始位置
				//  次のwordで輪郭部分の終了位置
				//}
				//32767でライン終了
				//リージョンフォーマット
				//
				//領域の輪郭の線のデータが入っている
				//上から見て行って、輪郭に含まれたら1、もう一度含まれたら0
				//ということをやればビットマップデータに出来る。
				//
				//最初のwordで上からの行数を示す (飛ばした行は上の行と同じ)
				//(繰り返し){
				//  次のwordで輪郭部分の開始位置
				//  次のwordで輪郭部分の終了位置
				//}
				//32767でライン終了
				int scanline = 0;
				for(int i=0; i<len-10;){
					int lastscanline = scanline;
					scanline = readOpcode(stream,2);
					i+=2;
					for(int yy=lastscanline+1; yy<scanline; yy++){
						if(yy-rtop<size.height&&yy-rtop>=0){
							for(int xx=0; xx<size.width; xx++){
								db.setElem((yy-rtop)*size.width+xx, db.getElem((yy-rtop-1)*size.width+xx));
							}
						}
					}
					int x=rleft;
					while(i<len-10){
						int xstart = readOpcode(stream,2);
						i+=2;
						if(xstart==32767) {
							if(scanline-rtop<size.height && scanline-rtop>0){
								for(; x-rleft<size.width; x++){
									db.setElem((scanline-rtop)*size.width+(x-rleft), db.getElem((scanline-rtop-1)*size.width+(x-rleft)));
								}
							}
							break;
						}
						int xend = readOpcode(stream,2);
						i+=2;
						if(scanline-rtop<size.height&&scanline-rtop>=0){
							for(; x<xstart; x++){
								if(scanline-rtop>0&&x>0&&x-rleft<size.width){
									db.setElem((scanline-rtop)*size.width+(x-rleft), db.getElem((scanline-rtop-1)*size.width+(x-rleft)));
								}
							}
						}
						if(scanline-rtop<size.height&&scanline-rtop>=0){
							for(; x<xend; x++){
								if(scanline-rtop==0){
									db.setElem((scanline-rtop)*size.width+(x-rleft), 0xFFFFFFFF);
								}else{
									if(db.getElem((scanline-rtop-1)*size.width+(x-rleft))==0x00000000){
										db.setElem((scanline-rtop)*size.width+(x-rleft), 0xFFFFFFFF);
									}
								}
							}
						}
					}
				}
			}
			
			if(bitmap_flag&&!packbits_flag){
				//無圧縮BitMap
				for(int v=0; v<bbottom-btop; v++){
					byte[] data = new byte[rowBytes];
					for(int i=0; i<rowBytes; i++){
						try { data[i] = (byte)stream.read(); }
						catch (IOException e) {}
					}
					for(int h=0; h<bright-bleft; h++){
						int pix = (data[h/8]>>(7-(h%8)))&0x01;
						if(pix!=0) {
							if(trans_mode==1) pix=0xFF000000;//continue; //#srcOr
							else pix=0xFFFFFFFF;
						}
						else if( pix==0 && trans_mode==3 ){ //#srcBic
							pix=0xFFFFFFFF;
						}
						else if(pix==0 && trans_mode==1){
							pix=0xFFFFFFFF;
						}
						if(v-btop>=size.height||h-bleft>=size.width||v-btop<0||h-bleft<0)continue;
						if(rgnmask_flag){
							if(db.getElem((v-btop)*size.width+(h-bleft))==0x00000000){
								continue;
							}
						}
						db.setElem(((v-btop)/*+btop*/)*size.width+((h-bleft)/*+bleft*/), pix);
					}
				}
			}
			else if(bitmap_flag&&packbits_flag){
				//圧縮BitMap
				int dlen = 1;
				if(rowBytes>=251) dlen=2;
				for(int v=0; v<bbottom-btop; v++){
					if(v+dtop>=size.height) break;
					
					byte[] data = new byte[rowBytes];
					int offset = 0;
					//packBitsを展開
					int packsize = readOpcode(stream,dlen);
					for(int i=0; i<packsize; i++){
						int dsize = readOpcode(stream,1);
						if(dsize>=128) {
							//同じデータが連続する場合
							dsize = 256-dsize+1;
							int src = readOpcode(stream,1);
							for(int j=0; j<dsize; j++){
								data[j+offset] = (byte)src;
							}
							offset += dsize;
						}
						else {
							//データそのまま
							dsize++;
							for(int j=0; j<dsize; j++){
								try { data[j+offset] = (byte)stream.read(); }
								catch (IOException e) {}
							}
							offset += dsize;
						}
					}
					for(int h=0; h<bright-bleft; h++){
						int pix = (data[h/8]>>(7-(h%8)))&0x01;
						if(pix!=0){
							if(trans_mode==1) continue; //#srcOr
							else pix=0xFFFFFFFF;
						}
						else if( pix==0 && trans_mode==3 ){ //#srcBic
							pix=0xFFFFFFFF;
						}
						if(rgnmask_flag){
							if(db.getElem(v*size.width+h)==0x00000000){
								continue;
							}
						}
						db.setElem((v+dtop)*size.width+(h+dleft), pix);
					}
				}
			}
			else if(!bitmap_flag&&packbits_flag){
				//圧縮PixMap
				int dlen = 1;
				if(rowBytes>=251) dlen=2;
				for(int v=0; v<bbottom-btop; v++){
					byte[] data = new byte[rowBytes];
					int offset = 0;
					//packBitsを展開
					int packsize = readOpcode(stream,dlen);
					//System.out.println("packsize:"+packsize);
					if(bpp==16){ //16bitのpackbitsは違うらしい
						for(int i=0; i<packsize; i++){
							int dsize = readOpcode(stream,1);
							if(dsize>=128) {	
								//同じデータが連続する場合
								//System.out.println("renzoku dsize:"+dsize);
								dsize = 256-dsize+1;
								int src1 = readOpcode(stream,1);
								int src2 = readOpcode(stream,1);
								i+=2;
								for(int j=0; j<dsize*2 && j+offset<data.length; j++){
									data[j+offset] = (byte)src1;
									j++;
									data[j+offset] = (byte)src2;
								}
								offset += dsize*2;
							}
							else {
								//データそのまま
								//System.out.println("sonomama dsize:"+dsize);
								dsize++;
								for(int j=0; j<dsize*2; j++){
									if(rowBytes<=j+offset){
										//System.out.println("over rowBytes2!");
										continue;
									}
									try { data[j+offset] = (byte)stream.read();i++; }
									catch (IOException e) {}
									//System.out.println("data["+(j+offset)+"]:"+data[j+offset]);
								}
								offset += dsize*2;
							}
						}
					}
					else{ //16bit以外のpackbits
						for(int i=0; i<packsize; i++){
							int dsize = readOpcode(stream,1);
							if(dsize>=128) {
								//System.out.println("renzoku dsize:"+dsize);
								//同じデータが連続する場合
								dsize = 256-dsize+1;
								int src = readOpcode(stream,1);
								//System.out.println("src:"+src);
								i++;
								if(rowBytes<dsize+offset){
									//System.out.println("over rowBytes1!");
									continue;
								}
								for(int j=0; j<dsize && j+offset<data.length; j++){ data[j+offset] = (byte)src; }
								offset += dsize;
							}
							else {
								//データそのまま
								//System.out.println("sonomama dsize:"+dsize);
								dsize++;
								for(int j=0; j<dsize; j++){
									if(rowBytes<=j+offset){
										//System.out.println("over rowBytes2!");
										continue;
									}
									try { data[j+offset] = (byte)stream.read();i++; }
									catch (IOException e) {}
									//System.out.println("data["+(j+offset)+"]:"+data[j+offset]);
								}
								offset += dsize;
							}
						}
					} //packbits終了
					if(v+dtop>=size.height) break;
					for(int h=0; h<bright-bleft; h++){
						if(h+dleft>=size.width) break;
						int pix = 0;
						int idx = 0;
						if(bpp==1){
							idx = (data[h/8]>>(8-(h%8+1)))&0x01;
						}
						else if(bpp==2){
							idx = (data[h/4]>>(8-(h%4*2+2)))&0x03;
						}
						else if(bpp==4){
							idx = (data[h/2]>>(8-(h%2*4+4)))&0x07;
						}
						else if(bpp==8){
							idx = (data[h])&0xFF;
						}
						else if(bpp==16){
							int pix16 = ((0xFF&data[h*2])<<8)+(0xFF&data[h*2+1]);
							int cr = (pix16>>10)&0x1F;
							int cg = (pix16>> 5)&0x1F;
							int cb = (pix16>> 0)&0x1F;
							cr = cr*0xFF/0x1F;
							cg = cg*0xFF/0x1F;
							cb = cb*0xFF/0x1F;
							pix = 0xFF000000+(cr<<16)+(cg<<8)+cb;
						}
						else if(bpp==32){
							pix = 0xFF000000|((0xFF&data[h])<<16)|((0xFF&data[h+(bright-bleft)])<<8)|(0xFF&(data[h+(bright-bleft)*2]));
						}
						if(fullcolor_flag){
							if(trans_mode==36 && pix==0xFFFFFFFF){
								continue;
							}
							else if( pix==0x00000000 && trans_mode==3 ){ //#srcBic
								pix=0xFFFFFFFF;
							}
						}else if(palette!=null){
							if(idx>=palette.length) idx = 0;
							pix = palette[idx];
							if((trans_mode==36 || trans_mode==1) && pix==0xFFFFFFFF){ //#srcOR ,transparent
								continue;
							}
							else if( pix==0x00000000 && trans_mode==3 ){ //#srcBic
								pix=0xFFFFFFFF;
							}
						}else{
							if(pix!=0) {
								if(trans_mode==1) continue; //#srcOr
								else pix=0xFFFFFFFF;
							}
							else if( pix==0 && trans_mode==3 ){ //#srcBic
								pix=0xFFFFFFFF;
							}
						}
						if(rgnmask_flag){
							if(db.getElem((v+dtop)*size.width+(h+dleft))==0x00000000){
								continue;
							}
						}
						if(jpegimg==null){
							db.setElem((v+dtop)*size.width+(h+dleft), pix);
						}
					}
				}
			}
		}
		
		return img;
	}
	
	//PICTヘッダ読み込み
	private static Dimension readPICTv1Size(BufferedInputStream stream){
		int width=0, height=0;
		try {
			//filler
			for(int i=0; i<512; i++){
				stream.read();
			}
			//v1 filesize
			for(int i=0; i<2; i++){
				stream.read();
			}
			//print size
			readOpcode(stream,2);
			readOpcode(stream,2);
			height = readOpcode(stream,2);
			width = readOpcode(stream,2);
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}

		return new Dimension(width,height);
	}
	
	//PICTヘッダ読み込み
	private static int readPICTVer(BufferedInputStream stream){
		int version = 0;

		//バージョン
		int opcode = readOpcode(stream,2);
		if(opcode==0x0011) {//バージョンオプコード2
			opcode = readOpcode(stream,2);
			if(opcode==0x02FF) version = 2;//バージョン2
		}
		else if(opcode==0x1101) version = 1;//バージョン1
		
		return version;
	}

	private static Dimension readPICTv2Size(BufferedInputStream stream, int version){
		int top=0,left=0,bottom=0,right=0;
		
		//バージョン2ヘッダ
		int opcode = readOpcode(stream,version);
		if(opcode==0x0C00);//バージョン2ヘッダーオプコード
		else return null;
		int zahyou = readOpcode(stream,version);//座標位置指定形式
		if(zahyou == 0xfffe){
			readOpcode(stream,version);//予約
			readOpcode(stream,version);//水平解像度
			readOpcode(stream,version);//水平解像度
			readOpcode(stream,version);//垂直解像度
			readOpcode(stream,version);//垂直解像度
			top = readOpcode(stream,version);//左上Ｙ座標
			left = readOpcode(stream,version);//左上Ｘ座標
			bottom = readOpcode(stream,version);//右下Ｙ座標
			right = readOpcode(stream,version);//右下Ｘ座標
			readOpcode(stream,version);//予約（0）
			readOpcode(stream,version);//予約（0）
		}
		else if(zahyou == 0xffff){ //固定小数点座標
			readOpcode(stream,version);//予約(ffff)
			left = readOpcode(stream,version);//左上Ｘ標
			readOpcode(stream,version);//左上Ｘ座標(小数点以下)
			top = readOpcode(stream,version);//左上Ｙ座標
			readOpcode(stream,version);//左上Ｙ座標(小数点以下)
			right = readOpcode(stream,version);//右下Ｘ座標
			readOpcode(stream,version);//右下Ｘ座標(小数点以下)
			bottom = readOpcode(stream,version);//右下Ｙ座標
			readOpcode(stream,version);//右下Ｙ座標(小数点以下)
			readOpcode(stream,version);//予約（0）
			readOpcode(stream,version);//予約（0）
		}
		
		return new Dimension(right-left,bottom-top);
	}

	private final static int readOpcode(BufferedInputStream stream, int version){
		byte[] opcode = new byte[2];
		for(int i=0; i<version; i++){
			try {
				opcode[i] = (byte)stream.read();
			} catch (IOException e) {
			}
		}
		int iop = 0;
		if(version==1) iop = (opcode[0])&0xff;
		else if(version==2) iop = ((opcode[0]&0xff)<<8)+(opcode[1]&0xff);
		//System.out.println(". "+iop);
		return iop;
	}
	
	private final static int readOpcode2(BufferedInputStream stream, int version) throws IOException{
		byte[] opcode = new byte[2];
		for(int i=0; i<version; i++){
			opcode[i] = (byte)stream.read();
		}
		int iop = 0;
		if(version==1) iop = (opcode[0])&0xff;
		else if(version==2) iop = ((opcode[0]&0xff)<<8)+(opcode[1]&0xff);
		return iop;
	}
}



class Rsrc {
	HashMap<String,rsrcClass> rsrcIdMap = new HashMap<String,rsrcClass>();
	private HashMap<String,rsrcClass> rsrcNameMap = new HashMap<String,rsrcClass>();
	HashMap<String,xcmdClass> xcmdNameMap = new HashMap<String,xcmdClass>();
	ArrayList<addcolorClass> addcolorList  = new ArrayList<addcolorClass>();
	ArrayList<PlteClass> plteList  = new ArrayList<PlteClass>();
	//OStack ownerstack;
	
	
	public Rsrc(OStack owner){
		//this.ownerstack = owner;
	}
	
	// XML保存
	public void writeXML(XMLStreamWriter writer) throws XMLStreamException {
		Iterator<rsrcClass> it = rsrcIdMap.values().iterator();
		
		while(it.hasNext()){
        	rsrcClass rsrc = it.next();
        	
        	rsrc.writeXMLOneRsrc(writer);
		}
	}
	
	class rsrcClass{
		int id;
		String type;
		String name;
		String filename;
		int hotsporleft;
		int hotsportop;
		OptionInfo optionInfo;
		public rsrcClass(int id, String type, String name, String filename, String left, String top, OptionInfo optionInfo){
			this.id = id;
			this.type = type;
			this.name = name;
			this.filename = filename;
			this.hotsporleft = Integer.valueOf(left);
			this.hotsportop = Integer.valueOf(top);
			this.optionInfo = optionInfo;
		}
		

		public void writeXMLOneRsrc(XMLStreamWriter writer) throws XMLStreamException
		{
			writer.writeStartElement("media");
		    {
				writer.writeAttribute("id",Integer.toString(id));
				writer.writeAttribute("type",type);
				writer.writeAttribute("name",name);
				writer.writeAttribute("file",filename);
				        
		        if(this.type.equals("cursor")){
					writer.writeStartElement("hotspot");
					writer.writeAttribute("left",Integer.toString(hotsporleft));
					writer.writeAttribute("top",Integer.toString(hotsportop));
			        writer.writeEndElement();
		        }
		
		    	FontInfo fontinfo = (FontInfo)optionInfo;
		        if(type.equals("font") && fontinfo!=null){
		        	writer.writeStartElement("fontinfo");
			        {

						writer.writeAttribute("fontType",Integer.toString(fontinfo.fontType));
						writer.writeAttribute("firstChar",Integer.toString(fontinfo.firstChar));
						writer.writeAttribute("lastChar",Integer.toString(fontinfo.lastChar));
						writer.writeAttribute("widMax",Integer.toString(fontinfo.widMax));
						writer.writeAttribute("kernMax",Integer.toString(fontinfo.kernMax));
						writer.writeAttribute("nDescent",Integer.toString(fontinfo.nDescent));
						writer.writeAttribute("fRectWidth",Integer.toString(fontinfo.fRectWidth));
						writer.writeAttribute("fRectHeight",Integer.toString(fontinfo.fRectHeight));
						writer.writeAttribute("owTLoc",Integer.toString(fontinfo.owTLoc));
						writer.writeAttribute("ascent",Integer.toString(fontinfo.ascent));
						writer.writeAttribute("descent",Integer.toString(fontinfo.descent));
						writer.writeAttribute("leading",Integer.toString(fontinfo.leading));
				        
				        for(int j=0; fontinfo.locs!=null&&j<fontinfo.locs.length; j++){
				        	writer.writeStartElement("loc");
					        writer.writeCharacters(Integer.toString(fontinfo.locs[j]));
					        writer.writeEndElement();
				        }
				        
				        for(int j=0; fontinfo.offsets!=null&&j<fontinfo.offsets.length; j++){
				        	writer.writeStartElement("offset");
					        writer.writeCharacters(Integer.toString(fontinfo.offsets[j]));
					        writer.writeEndElement();
				        }
				        
				        for(int j=0; fontinfo.widthes!=null&&j<fontinfo.widthes.length; j++){
				        	writer.writeStartElement("width");
					        writer.writeCharacters(Integer.toString(fontinfo.widthes[j]));
					        writer.writeEndElement();
				        }
			        }
			        writer.writeEndElement();
		        }
		    }
		    writer.writeEndElement();
		}
		
	}
	
	class OptionInfo{
		
	}
	
	public void addResource(int id, String type, String name, String path){
		rsrcClass rsrc = new rsrcClass(id, type, name, path, "0", "0", null);
		rsrcIdMap.put(type+id, rsrc);
		rsrcNameMap.put(type+name.toLowerCase(), rsrc);
	}
	
	public void addResource(int id, String type, String name, String filename, String leftStr, String topStr){
		rsrcClass rsrc = new rsrcClass(id, type, name, filename, leftStr, topStr, null);
		rsrcIdMap.put(type+id, rsrc);
		rsrcNameMap.put(type+name.toLowerCase(), rsrc);
	}
	
	public void addResource(int id, String type, String name, String filename, String leftStr, String topStr, OptionInfo info){
		rsrcClass rsrc = new rsrcClass(id, type, name, filename, leftStr, topStr, info);
		rsrcIdMap.put(type+id, rsrc);
		rsrcNameMap.put(type+name.toLowerCase(), rsrc);
	}
	
	public void addResource(rsrcClass r){
		rsrcIdMap.put(r.type+r.id, r);
		rsrcNameMap.put(r.type+r.name.toLowerCase(), r);
	}

	
	
	public int getRsrcCount(String type){
		Iterator<rsrcClass> it = rsrcIdMap.values().iterator();
		int i=0;
		rsrcClass rsrc;
		while(it.hasNext()){
			rsrc = it.next();
			if(rsrc.type.equals(type)){
				i++;
			}
		}
		return i;
	}

	public rsrcClass getRsrcByIndex(String type, int index){
		Iterator<rsrcClass> it = rsrcIdMap.values().iterator();
		int i=0;
		rsrcClass rsrc;
		while(it.hasNext()){
			rsrc = it.next();
			if(rsrc.type.equals(type)){
				if(i==index){
					return rsrc;
				}
				i++;
			}
		}
		return null;
	}
	
	//----------------
	// for FONT
	//----------------
	class FontInfo extends OptionInfo{
		int fontType;
		char firstChar;
		char lastChar;
		int widMax;
		int kernMax;
		int nDescent;
		int fRectWidth;
		int fRectHeight;
		int owTLoc;
		int ascent;
		int descent;
		int leading;
		int[] locs;
		int[] offsets;
		int[] widthes;
	}
	
	public void addFontResource(int id, String type, String name, String path, FontInfo info){
		rsrcClass rsrc = new rsrcClass(id, type, name, path, "0", "0", info);
		rsrcIdMap.put(type+id, rsrc);
		rsrcNameMap.put(type+name.toLowerCase(), rsrc);
	}
	
	//----------------
	// XCMD
	//----------------
	public int getxcmdId(String name, String type){
		xcmdClass r = xcmdNameMap.get(type+name.toLowerCase());
		if(r!=null) return r.id;
		return 0;
	}

	public void addXcmd(xcmdClass xcmd){
		xcmdNameMap.put(xcmd.type+xcmd.name.toLowerCase(), xcmd);
	}
		
	public void writeXcmdXML(XMLStreamWriter writer) throws XMLStreamException {
		Iterator<xcmdClass> it = xcmdNameMap.values().iterator();
		xcmdClass xcmd;
		while(it.hasNext()){
        	writer.writeCharacters("\t");
			xcmd = it.next();
        	writer.writeEmptyElement("externalcommand");
        	writer.writeAttribute("type", xcmd.type);
        	writer.writeAttribute("platform", xcmd.platform);
        	writer.writeAttribute("id", Integer.toString(xcmd.id));
        	writer.writeAttribute("size", Integer.toString(xcmd.size));
        	writer.writeAttribute("name", xcmd.name);
        	writer.writeAttribute("file", xcmd.filename);
	        //writer.writeCharacters("\n");
		}
	}

	public TreeSet<String> getXcmds(){
		TreeSet<String> xcmdSet = new TreeSet<String>();
		Iterator<xcmdClass> it = xcmdNameMap.values().iterator();
		xcmdClass xcmd;
		while(it.hasNext()){
			xcmd = it.next();
			xcmdSet.add(xcmd.name);
		}
		return xcmdSet;
	}
	
	
	class xcmdClass{
		int id;
		String type; //command or function
		String name;
		String filename;
		String platform;
		int size;
		public xcmdClass(String id, String type, String name, String filename, String platform, String size){
			this.id = Integer.valueOf(id);
			this.type = type;
			this.name = name;
			this.filename = filename;
			this.platform = platform;
			this.size = Integer.valueOf(size);
		}
	}
	

	//-------------
	//AddColor関連
	//-------------
	
	class addcolorClass{
		int id;
		boolean isBg;
		ArrayList<addcolorObjClass> objList  = new ArrayList<addcolorObjClass>();
		
		public addcolorClass(String id, boolean isBg){
			this.id = Integer.valueOf(id);
			this.isBg = isBg;
		}
		
		public void addPictObject(String name, Rectangle rect, boolean transparent, boolean visible){
			objList.add(new PictObject(name, rect, transparent, visible));
		}
		public void addRectObject(Rectangle rect, int bevel, Color color, boolean visible){
			objList.add(new RectObject(rect, bevel, color, visible));
		}
		public void addBtnObject(int id, int bevel, Color color, boolean visible){
			objList.add(new BtnObject(id, bevel, color, visible));
		}
		public void addFldObject(int id, int bevel, Color color, boolean visible){
			objList.add(new FldObject(id, bevel, color, visible));
		}

		public void writeAddColorXMLOne(XMLStreamWriter writer) throws XMLStreamException {
			if(isBg){
				writer.writeStartElement("addcolorbackground");
			}else{
				writer.writeStartElement("addcolorcard");
			}

		    {
				writer.writeAttribute("id",Integer.toString(id));
		
		    	for(int i=0; i<objList.size(); i++){
			    	writer.writeStartElement("addcolorobject");

			    	addcolorObjClass obj = objList.get(i);
			    	PictObject picto = null;
			    	RectObject recto = null;
			    	BtnObject btno = null;
			    	FldObject fldo = null;;
			    	
			    	if(obj.getClass()==PictObject.class){
						writer.writeAttribute("type","picture");
			    		picto = (PictObject)obj;
			    	}
			    	else if(obj.getClass()==RectObject.class){
						writer.writeAttribute("type","rectangle");
			    		recto = (RectObject)obj;
			    	}
			    	else if(obj.getClass()==BtnObject.class){
						writer.writeAttribute("type","button");
			    		btno = (BtnObject)obj;
			    	}
			    	else if(obj.getClass()==FldObject.class){
						writer.writeAttribute("type","field");
			    		fldo = (FldObject)obj;
			    	}

			        int id = 0;
			        if(btno!=null) id = btno.id;
			        else if(fldo!=null) id = fldo.id;
			        if(id>0){
						writer.writeAttribute("id",Integer.toString(id));
			        }
			    	
			        Rectangle rect = null;
			        if(picto!=null) rect = picto.rect;
			        else if(recto!=null) rect = recto.rect;
			        if(rect!=null){
						writer.writeAttribute("left",Integer.toString(rect.x));
						writer.writeAttribute("top",Integer.toString(rect.y));
						writer.writeAttribute("width",Integer.toString(rect.width));
						writer.writeAttribute("height",Integer.toString(rect.height));
			        }

			        if(picto!=null){
						writer.writeAttribute("name",picto.name);
						writer.writeAttribute("transparent",picto.transparent?"true":"false");
			        }
			        
			        if(picto==null) {
						writer.writeAttribute("bevel",Integer.toString(obj.bevel));
			        }

					writer.writeAttribute("visible",Boolean.toString(obj.visible));
			        
			        if(picto==null) {
						writer.writeAttribute("red",Integer.toString(obj.color.getRed()));
						writer.writeAttribute("green",Integer.toString(obj.color.getGreen()));
						writer.writeAttribute("blue",Integer.toString(obj.color.getBlue()));
			        }
			        
			        writer.writeEndElement();//addcolorobject
		    	}
		    }
		    writer.writeEndElement();
		}
	}
	
	class addcolorObjClass{
		int bevel;
		Color color;
		boolean visible;
		
		public addcolorObjClass(int bevel, Color color, boolean visible){
			this.bevel = bevel;
			this.color = color;
			this.visible = visible;
		}
	}
	
	class PictObject extends addcolorObjClass {
		String name;
		boolean transparent;
		Rectangle rect;

		public PictObject(String name, Rectangle rect, boolean transparent, boolean visible) {
			super(0, null, visible);
			this.name = name;
			this.rect = rect;
			this.transparent = transparent;
		}
	}
	
	class RectObject extends addcolorObjClass {
		Rectangle rect;

		public RectObject(Rectangle rect, int bevel, Color color, boolean visible) {
			super(bevel, color, visible);
			this.rect = rect;
		}
	}
	
	class BtnObject extends addcolorObjClass {
		int id;

		public BtnObject(int id, int bevel, Color color, boolean visible) {
			super(bevel, color, visible);
			this.id = id;
		}
	}
	
	class FldObject extends addcolorObjClass {
		int id;

		public FldObject(int id, int bevel, Color color, boolean visible) {
			super(bevel, color, visible);
			this.id = id;
		}
	}
	

	// XML保存
	public void writeAddColorXML(XMLStreamWriter writer) throws XMLStreamException {
		ArrayList<addcolorClass> cdList = addcolorList;
		for(int i=0; i<cdList.size(); i++){
			cdList.get(i).writeAddColorXMLOne(writer);
		}
	}
	
	
	
	//-------------
	//PLTE関連
	//-------------
	
	
	class PlteClass{
		int id;
		String name;
		int windowDef;
		boolean clearHilite;
		int btnType;
		int pictId;
		Point pictHV;
		
		ArrayList<plteBtnObject> objList  = new ArrayList<plteBtnObject>();
		
		public PlteClass(int id, String name, int windowDef, boolean clearHilite, int btnType, int pictId, Point pictHV){
			this.id = id;
			this.name = name;
			this.windowDef = windowDef;
			this.clearHilite = clearHilite;
			this.btnType = btnType;
			this.pictId = pictId;
			this.pictHV = pictHV;
		}
		
		public void addRectBtn(Rectangle rect, String message){
			objList.add(new plteBtnObject(rect, message));
		}

		public void writePlteXMLOne(XMLStreamWriter writer) throws XMLStreamException {
			writer.writeStartElement("palette");
		    {
		    	writer.writeAttribute("id",Integer.toString(id));
		    	writer.writeAttribute("name",name);
		    	writer.writeAttribute("windowdefinition",Integer.toString(this.windowDef));
		    	writer.writeAttribute("clearhilite",Boolean.toString(this.clearHilite));
		    	writer.writeAttribute("pictureid",Integer.toString(this.pictId));
		    	writer.writeAttribute("verticaloffset",Integer.toString(this.pictHV.y));
		    	writer.writeAttribute("horizontaloffset",Integer.toString(this.pictHV.x));

		    	for(int i=0; i<objList.size(); i++){
			    	writer.writeStartElement("paletteobject");
			        
			    	plteBtnObject obj = objList.get(i);

			        {
				    	writer.writeAttribute("id",Integer.toString(i+1));
			        }
			    	
			        Rectangle rect = obj.rect;
			        
			        {
				    	writer.writeAttribute("left",Integer.toString(rect.x));
				    	writer.writeAttribute("top",Integer.toString(rect.y));
				    	writer.writeAttribute("width",Integer.toString(rect.width));
				    	writer.writeAttribute("height",Integer.toString(rect.height));
			        }

			        {
				    	writer.writeAttribute("message",obj.message);
			        }
			        
			        writer.writeEndElement(); //paletteobject
		    	}
		    }
		    writer.writeEndElement();
		}
	}
	

	// XML保存
	public void writePLTEXML(XMLStreamWriter writer) throws XMLStreamException {
		ArrayList<PlteClass> iplteList = plteList;
		for(int i=0; i<iplteList.size(); i++){
			iplteList.get(i).writePlteXMLOne(writer);
		}
	}
	
	
	class plteBtnObject {
		Rectangle rect;
		String message;

		public plteBtnObject(Rectangle rect, String message) {
			this.rect = rect;
			this.message = message;
		}
	}
}




class OObject {
	OObject parent=null;
	String objectType="";
	int id;
	String name="";
	String text="";
	boolean wrapFlag;
	ArrayList<String> scriptList;
	ArrayList<String> javascriptList;
	boolean visible=true;
	boolean enabled=true;
	
	int left=0; int top=0;
	public int width=0; public int height=0;
}


public class OStack extends OObject {
	String optionStr;
	Rsrc rsrc = new Rsrc(this);
	String[] Pattern = new String[40];
	public String path="";//スタックファイルのパス
	
	//プロパティ
	boolean cantAbort=false;
	boolean cantDelete=false;
	boolean cantModify=false;
	boolean cantPeek=false;
	int firstCard;//toc.xml
	int userLevel;//このレベル以下に制限
	private boolean privateAccess;//toc.xml
	String createdByVersion="";//toc.xml
	String lastCompactedVersion="";//toc.xml
	String lastEditedVersion="";//toc.xml
	String firstEditedVersion="";//toc.xml
	private int fontTableID;//toc.xml
	private int styleTableID;//toc.xml
	int nextStyleID;//toc.xml
	private int listId;//toc.xml
	private int passwordHash;
	Rectangle screenRect;
	Rectangle windowRect;
	Point scroll;
	int firstBg;
	int backgroundCount = 1;
	int totalSize;

	//カード情報
	ArrayList<Integer> cardIdList = new ArrayList<Integer>();
	ArrayList<Boolean> cardMarkedList = new ArrayList<Boolean>();
	ArrayList<OCard> cdCacheList = new ArrayList<OCard>();
	ArrayList<OBackground> bgCacheList = new ArrayList<OBackground>();
	ArrayList<fontClass> fontList = new ArrayList<fontClass>();
	ArrayList<styleClass> styleList = new ArrayList<styleClass>();
	
	//カードピクチャ変換用
	ArrayList<Thread> threadList = new ArrayList<Thread>();
	
	class fontClass{
		int id;
		String name;
		public fontClass(int id, String name){
			this.id = id;
			this.name = name;
		}
	}

	class styleClass{
		int id;
		int style;//-1ならチェンジしない
		int font;//-1ならチェンジしない
		int size;//-1ならチェンジしない
		public styleClass(String id, String style, String font, String size){
			this.id = Integer.valueOf(id);
			this.style=0;
			if(style.equals("")) this.style=-1;
			if(style.contains("plain")) this.style=0;
			if(style.contains("bold")) this.style+=1;
			if(style.contains("italic")) this.style+=2;
			if(style.contains("underline")) this.style+=4;
			if(style.contains("outline")) this.style+=8;
			if(style.contains("shadow")) this.style+=16;
			if(style.contains("condensed")) this.style+=32;
			if(style.contains("extend")) this.style+=64;
			if(style.contains("group")) this.style+=128;
			this.font = Integer.valueOf(font);
			this.size = Integer.valueOf(size);
		}
	}

	//メイン
	public OStack(String inOptionStr) {
		left=0; top=0;
		width=512; height=384;
		
		fontTableID = (int)(20000*Math.random()+1000);
		styleTableID = (int)(20000*Math.random()+1000);
		listId = (int)(20000*Math.random()+1000);
		scriptList = new ArrayList<String>();
		optionStr = inOptionStr;
    }
	
	
	public void writeXML(XMLStreamWriter writer) throws XMLStreamException {
        writer.writeStartElement("stack");

        writer.writeAttribute("stackID","-1");
        writer.writeAttribute("format","11");
        writer.writeAttribute("backgroundCount",Integer.toString(backgroundCount));
        writer.writeAttribute("firstBackgroundID",Integer.toString(firstBg));
        writer.writeAttribute("cardCount",Integer.toString(cardIdList.size()));
        writer.writeAttribute("firstCardID",Integer.toString(firstCard));
        writer.writeAttribute("listID",Integer.toString(listId));
        writer.writeAttribute("password",Integer.toString(passwordHash));
        writer.writeAttribute("userLevel",Integer.toString(userLevel));
        writer.writeAttribute("cantModify",Boolean.toString(cantModify));
        writer.writeAttribute("cantDelete",Boolean.toString(cantDelete));
        writer.writeAttribute("privateAccess",Boolean.toString(privateAccess));
        writer.writeAttribute("cantAbort",Boolean.toString(cantAbort));
        writer.writeAttribute("cantPeek",Boolean.toString(cantPeek));
        writer.writeAttribute("createdByVersion",createdByVersion);
        writer.writeAttribute("lastCompactedVersion",lastCompactedVersion);
        writer.writeAttribute("modifyVersion",fileupload.longVersion);
        writer.writeAttribute("openVersion",firstEditedVersion);
        writer.writeAttribute("fontTableID",Integer.toString(fontTableID));
        writer.writeAttribute("styleTableID",Integer.toString(styleTableID));
        writer.writeAttribute("width",Integer.toString(width));
        writer.writeAttribute("height",Integer.toString(height));

        writer.writeStartElement("patterns");
        for(int i=0; i<40; i++){
	        writer.writeStartElement("pattern");
	        writer.writeCharacters(Pattern[i]);
	        writer.writeEndElement();
		}
        writer.writeEndElement();

        writer.writeStartElement("script");
        for(int i=0; i<scriptList.size(); i++){
        	writer.writeCharacters(scriptList.get(i));
        	if(i<scriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();

        writer.writeStartElement("ejavascript");
        for(int i=0; i<javascriptList.size(); i++){
        	writer.writeCharacters(javascriptList.get(i));
        	if(i<javascriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();

        writer.writeEndElement();
	}

	
	public void writeFontXML(XMLStreamWriter writer) throws XMLStreamException {
        for(int i=0; i<fontList.size(); i++){
        	writer.writeStartElement("font");
        	{
                writer.writeAttribute("id",Integer.toString(fontList.get(i).id));
                writer.writeAttribute("name",fontList.get(i).name);
        	}
	        writer.writeEndElement();
        }
	}

	
	public void writeStyleXML(XMLStreamWriter writer) throws XMLStreamException {
        writer.writeStartElement("nextStyleID");
        writer.writeAttribute("id",Integer.toString(id));
        writer.writeEndElement();

        for(int i=0; i<styleList.size(); i++){
	        writer.writeStartElement("styleentry");
	        {
	            writer.writeAttribute("id",Integer.toString(styleList.get(i).id));
		        
		        if(styleList.get(i).font!=-1){
		            writer.writeAttribute("font",Integer.toString(styleList.get(i).font));
		        }
		        
		        if(styleList.get(i).size!=-1){
		            writer.writeAttribute("size",Integer.toString(styleList.get(i).size));
		        }
		        
		        if(styleList.get(i).style!=-1){
		            writer.writeAttribute("style",Integer.toString(styleList.get(i).style));
		        }
	        }
	        writer.writeEndElement();
        }
	}

	
	//HCのスタックを変換
	public boolean readStackBlock(OStack stack, DataInputStream dis, int blockSize){
		////System.out.println("readStackBlock");

		if(blockSize>200000 || blockSize<50){
			return false;
		}
		
		//ブロックのデータを順次読み込み
		id = HCData.readCode(dis, 4);
		//System.out.println("blockId:"+id); //always -1
		/*String tygersStr =*/ HCData.readStr(dis, 4);
		//System.out.println("tygersStr:"+tygersStr);
		/*int format =*/ HCData.readCode(dis, 4);
		//System.out.println("format:"+format);
		totalSize = HCData.readCode(dis, 4);
		//System.out.println("totalSize:"+totalSize);
		/*int stackSize =*/ HCData.readCode(dis, 4);
		//System.out.println("stackSize:"+stackSize);
		/*int something =*/ HCData.readCode(dis, 4);
		//System.out.println("something:"+something); //wingsでは2、南方では0、鳥でも0、うにょでも0
		/*int tygers1Str =*/ HCData.readCode(dis, 4);
		//System.out.println("tygersStr:"+tygers1Str); //鳥では0、うにょでも0
		backgroundCount = HCData.readCode(dis, 4);
		//System.out.println("numofBgs:"+numofBgs);
		firstBg = HCData.readCode(dis, 4);
		//System.out.println("firstBg:"+firstBg);
		/*int numofCards =*/ HCData.readCode(dis, 4);
		//System.out.println("numofCards:"+numofCards);
		firstCard = HCData.readCode(dis, 4);
		//System.out.println("firstCard:"+firstCard);
		listId = HCData.readCode(dis, 4);
		//System.out.println("listBlockId:"+listId);
		/*int numofFree =*/ HCData.readCode(dis, 4);
		//System.out.println("numofFree:"+numofFree);
		/*int freeSize =*/ HCData.readCode(dis, 4);
		//System.out.println("freeSize:"+freeSize);
		/*int printId =*/ HCData.readCode(dis, 4);
		//System.out.println("printId:"+printId);
		passwordHash = HCData.readCode(dis, 4);
		//System.out.println("passwordHash:"+passwordHash);
		userLevel = HCData.readCode(dis, 2);
		//System.out.println("userLevel:"+userLevel);
		/*String tygers3Str =*/ HCData.readStr(dis, 2);
		//System.out.println("tygers3Str:"+tygers3Str);
		int flags = HCData.readCode(dis, 2);
		//System.out.println("flags:"+flags);
		cantPeek = ((flags>>10)&0x01)!=0;
		cantAbort = ((flags>>11)&0x01)!=0;
		privateAccess = ((flags>>13)&0x01)!=0;
		cantDelete = ((flags>>14)&0x01)!=0;
		cantModify = ((flags>>15)&0x01)!=0;
		/*String tygers4Str =*/ HCData.readStr(dis, 18);
		//System.out.println("tygers4Str:"+tygers4Str);
		
		int createdByV = HCData.readCode(dis, 4);
		createdByVersion = getVers(createdByV);
		//System.out.println("createdVer:"+createdByVersion);
		
		int compactedV = HCData.readCode(dis, 4);
		lastCompactedVersion = getVers(compactedV);
		//System.out.println("compactedVer:"+lastCompactedVersion);
		
		int lastEditedV = HCData.readCode(dis, 4);
		lastEditedVersion = getVers(lastEditedV);
		//System.out.println("lastEditedVer:"+lastEditedVersion);
		
		int lastOpenedV = HCData.readCode(dis, 4);
		firstEditedVersion = getVers(lastOpenedV);
		//System.out.println("lastOpenedVer:"+firstEditedVersion);
		
		/*int checksum =*/ HCData.readCode(dis, 4);
		//System.out.println("checksum:"+checksum);
		/*String tygers41Str =*/ HCData.readStr(dis, 4);
		//System.out.println("tygers41Str:"+tygers41Str);
		windowRect = new Rectangle();
		windowRect.x = HCData.readCode(dis, 2);
		windowRect.y = HCData.readCode(dis, 2);
		windowRect.width = HCData.readCode(dis, 2) - windowRect.x;
		windowRect.height = HCData.readCode(dis, 2) - windowRect.y;
		screenRect = new Rectangle();
		screenRect.x = HCData.readCode(dis, 2);
		screenRect.y = HCData.readCode(dis, 2);
		screenRect.width = HCData.readCode(dis, 2) - screenRect.x;
		screenRect.height = HCData.readCode(dis, 2) - screenRect.y;
		scroll = new Point();
		scroll.x = HCData.readCode(dis, 2);
		scroll.y = HCData.readCode(dis, 2);
		/*String tygers5Str =*/ HCData.readStr(dis, 292);
		//System.out.println("tygers5Str:"+tygers5Str);
		fontTableID = HCData.readCode(dis, 4);
		//System.out.println("fontTableId:"+fontTableID);
		styleTableID = HCData.readCode(dis, 4);
		//System.out.println("styleTableId:"+styleTableID);
		height = HCData.readCode(dis, 2);
		//System.out.println("height:"+height);
		width = HCData.readCode(dis, 2);
		//System.out.println("width:"+width);
		/*String tygers6Str =*/ HCData.readStr(dis, 260);
		//System.out.println("tygers6Str:"+tygers6Str);
		Pattern = HCData.readPatterns(dis, new File(this.path).getParent());
		//System.out.println("Patterns ok");
		/*String tygers7Str =*/ HCData.readStr(dis, 512);
		//System.out.println("tygers7Str:"+tygers7Str);
		int remainLength1 = blockSize - ((1538));
		resultStr result = HCData.readTextToZero(stack, dis, remainLength1);
		if(result.length_in_src<=1){
			result = HCData.readTextToZero(stack, dis, remainLength1);
		}
		String scriptStr = result.str;
		////System.out.println("scriptStr:"+scriptStr);
		int remainLength = blockSize - ((1538)+(result.length_in_src));
		//System.out.println("remainLength:"+remainLength);
		if(remainLength>0){
			/*String padding =*/ HCData.readStr(dis, remainLength);
			//System.out.println("padding:"+padding);
		}
		/*if((result.length_in_src+1)%2 != 0){
			String padding = HCData.readStr(dis, 1);
			//System.out.println("padding:"+padding);
		}*/
		
		//スクリプト
		String[] scriptAry = scriptStr.split("\n");
		for(int i=0; i<scriptAry.length; i++)
		{
			scriptList.add(scriptAry[i]);
		}
		
		return true;
	}
	
	
	private String getVers(int ver){
		String str;
		str = ""+(0xFF&(ver>>24));
		if((0xFF&(ver>>16))/16>0){
			str += "."+((0xFF&(ver>>16))/16+"."+(0xFF&(ver>>16))%16);
		}else{
			str += "."+((0xFF&(ver>>16))%16);
		}
		if((0xFF&(ver>>8)) == 0x20) str += "d" ;
		if((0xFF&(ver>>8)) == 0x40) str += "a";
		if((0xFF&(ver>>8)) == 0x60) str += "b";
		if((0xFF&(ver>>0))/16>0){
			str += "."+((0xFF&(ver>>0))/16+""+(0xFF&(ver>>0))%16);
		}else if(((0xFF&(ver>>0))%16)>0){
			str += "."+((0xFF&(ver>>0))%16);
		}
		return str;
	}
	

	public boolean readStyleBlock(DataInputStream dis, int blockSize){
		//System.out.println("readStyleBlock");

		if(blockSize>200000 || blockSize<24){
			return false;
		}
		
		int offset = 24;
		
		//ブロックのデータを順次読み込み
		/*int blockId =*/ HCData.readCode(dis, 4);
		//System.out.println("blockId:"+blockId);
		/*int filler =*/ HCData.readCode(dis, 4);
		//System.out.println("filler:"+filler);
		int styleCount = HCData.readCode(dis, 4);
		//System.out.println("styleCount:"+styleCount);
		nextStyleID = HCData.readCode(dis, 4);
		//System.out.println("nextStyleID:"+nextStyleID);
		
		for(int i=0; i<styleCount; i++){
			int styleId = HCData.readCode(dis, 4);
			//System.out.println("styleId:"+styleId);
			/*int something1 =*/ HCData.readCode(dis, 4);
			//System.out.println("something1:"+something1);
			/*int something2 =*/ HCData.readCode(dis, 4);
			//System.out.println("something2:"+something2);
			int textFontId = HCData.readCode(dis, 2);
			//System.out.println("textFontId:"+textFontId);
			int textStyle = HCData.readCode(dis, 1);
			//System.out.println("textStyle:"+textStyle);
			int textStyleChanged = HCData.readCode(dis, 1);
			//System.out.println("textStyleChanged:"+textStyleChanged);
			int textSize = HCData.readCode(dis, 2);
			//System.out.println("textSize:"+textSize);
			/*String filler2 =*/ HCData.readStr(dis, 6);
			//System.out.println("filler2:"+filler2);
			offset += 24;
			
			String idStr = Integer.toString(styleId);
			String fontStr = Integer.toString(textFontId);
			String styleStr = "";
			if(textStyleChanged==255){ //style unchange
				styleStr = "";
			}
			else{
				if(textStyle==0){
					styleStr = "plain";
				}
				else{
					if((textStyle&1)>0) styleStr += "bold ";
					if((textStyle&2)>0) styleStr += "italic ";
					if((textStyle&4)>0) styleStr += "underline ";
					if((textStyle&8)>0) styleStr += "outline ";
					if((textStyle&16)>0) styleStr += "shadow ";
					if((textStyle&32)>0) styleStr += "condensed ";
					if((textStyle&64)>0) styleStr += "extend ";
					if((textStyle&128)>0) styleStr += "group ";
				}
			}
			String sizeStr = Integer.toString(textSize);
    		styleList.add(new styleClass(idStr, styleStr, fontStr, sizeStr));
		}
		int remainLength = blockSize - offset;
		/*String padding =*/ HCData.readStr(dis, remainLength);
		//System.out.println("padding:"+padding);
		
		return true;
	}
	

	public boolean readFontBlock(OStack stack, DataInputStream dis, int blockSize){
		//System.out.println("readFontBlock");

		if(blockSize>200000 || blockSize<24){
			return false;
		}
		//ブロックのデータを順次読み込み
		/*int blockId =*/ HCData.readCode(dis, 4);
		//System.out.println("blockId:"+blockId);
		/*String tygersStr =*/ HCData.readStr(dis, 6);
		//System.out.println("tygersStr:"+tygersStr);
		int numOfFonts = HCData.readCode(dis, 2);
		//System.out.println("numOfFonts:"+numOfFonts);
		/*String tygers2Str =*/ HCData.readStr(dis, 4);
		//System.out.println("tygers2Str:"+tygers2Str);
		int offset = 24;
		
		for(int i=0; i<numOfFonts; i++){
			int fontId = HCData.readCode(dis, 2);
			offset+=2;
			//System.out.println("fontId:"+fontId);
			int nameLen;// = HCData.readCode(dis, 1);
			//offset+=1;
			//System.out.println("nameLen:"+nameLen);
			//if(offset+nameLen>blockSize){
				//break;
				nameLen = blockSize - offset;
				//if(nameLen<0)break;
			//}
			resultStr nameResult = HCData.readTextToZero(stack, dis, nameLen);
			//System.out.println("nameResult.str:"+nameResult.str);
			offset+=nameResult.length_in_src;
			if((nameResult.length_in_src+1)%2==0){
				HCData.readCode(dis, 1);
				offset+=1;
			}
			
			//フォントIDと名前を登録
			fontList.add(new fontClass(fontId, nameResult.str));
		}
		
		int remainLength = blockSize - offset;
		/*String padding =*/ HCData.readStr(dis, remainLength);
		//System.out.println("padding:"+padding);
		
		return true;
	}
	

	private int pageIdList[];
	private int pageEntryCountList[];
	private int pageEntrySize;
	
	boolean readListBlock(DataInputStream dis, int blockSize){
		//System.out.println("readListBlock");

		if(blockSize>200000 || blockSize<12){
			return false;
		}
		
		//ブロックのデータを順次読み込み
		listId = HCData.readCode(dis, 4);
		//System.out.println("listId:"+listId);
		/*int filler =*/ HCData.readCode(dis, 4);
		//System.out.println("filler:"+filler);
		int pageCount = HCData.readCode(dis, 4);
		//System.out.println("pageCount:"+pageCount);
		/*int pageSize =*/ HCData.readCode(dis, 4);
		//System.out.println("pageSize:"+pageSize);
		/*int pageEntryTotal =*/ HCData.readCode(dis, 4);
		//System.out.println("pageEntryTotal:"+pageEntryTotal);
		pageEntrySize = HCData.readCode(dis, 2);
		HCStackDebug.debuginfo("\n pageEntrySize:"+pageEntrySize);
		/*int filler2 =*/ HCData.readCode(dis, 10);
		//System.out.println("filler2:"+filler2);
		/*int pageEntryTotal2 =*/ HCData.readCode(dis, 4);
		//System.out.println("pageEntryTotal2:"+pageEntryTotal2);
		/*int filler3 =*/ HCData.readCode(dis, 4);
		//System.out.println("filler3:"+filler3);
		
		pageIdList = new int[pageCount];
		pageEntryCountList = new int[pageCount];
		for(int i=0; i<pageCount; i++){
			pageIdList[i] = HCData.readCode(dis, 4);
			HCStackDebug.debuginfo("\n pageIdList["+i+"]:"+pageEntryCountList[i]);
			//System.out.println("pageId:"+pageIdList[i]);
			pageEntryCountList[i] = HCData.readCode(dis, 2);
			HCStackDebug.debuginfo(" pageEntryCountList["+i+"]:"+pageEntryCountList[i]);
			//System.out.println("pageEntryCount:"+pageEntryCountList[i]);
		}
		
		int remainLength = blockSize-(48+pageCount*6);
		if(remainLength>0){
			/*String padding =*/ HCData.readStr(dis, remainLength);
			//System.out.println("padding:"+padding);
		}
		
		return true;
	}
	

	public boolean readPageBlock(DataInputStream dis, int blockSize, OStack stack){
		//System.out.println("readPageBlock");

		HCStackDebug.write(" readPageBlock blockSize:"+blockSize);
		if(blockSize>200000 || blockSize<12){
			return false;
		}

		HCStackDebug.debuginfo(" pageIdList:"+pageIdList);
		HCStackDebug.debuginfo(" pageEntryCountList:"+pageEntryCountList);
		if(pageIdList==null || pageEntryCountList==null){
			//return false;
		}
		
		int offset = 24;
		
		//ブロックのデータを順次読み込み
		int pageId = HCData.readCode(dis, 4);
		HCStackDebug.debuginfo(" pageId:"+pageId);
		//System.out.println("pageId:"+pageId);
		/*int filler =*/ HCData.readCode(dis, 4);
		//System.out.println("filler:"+filler);
		int listId = HCData.readCode(dis, 4);
		HCStackDebug.debuginfo(" listId:"+listId);
		//System.out.println("listId:"+listId);
		/*int filler2 =*/ HCData.readCode(dis, 4);
		//System.out.println("filler2:"+filler2);

		int pageEntryCount = 0;
		if(pageIdList!=null&&pageEntryCountList!=null){
			for(int i=0; i<pageIdList.length; i++){
				if(pageIdList[i] == pageId){
					pageEntryCount = pageEntryCountList[i];
					break;
				}
			}
		}
		else{
			pageEntrySize = 8;
			pageEntryCount = (blockSize-offset)/pageEntrySize;
		}
		
		int[] intAry = new int[(blockSize-24)/4];
		for(;offset<blockSize;offset+=4){
			intAry[(offset-24)/4] = HCData.readCode(dis, 4);
		}

		//うまくpageEntrySizeがとれてない場合の対策として、それっぽく読めるまで4ずつ増やす
		for(int size=pageEntrySize; size<128; size+=4){
			boolean errFlag = false;
			HCStackDebug.debuginfo("\n--------------");
			HCStackDebug.debuginfo(" size:"+size);
			if(size!=pageEntrySize){
				pageEntryCount = (blockSize-24)/pageEntrySize;
			}
			for(int i=0; i<pageEntryCount; i++){
				int cardId = intAry[i*size/4];
				HCStackDebug.debuginfo(" cardId:"+cardId);
				if( cardId<0 || cardId>10000000){
					errFlag = true;
					break;
				}
				if( cardId==0){
					continue;
				}
				if(GetCardbyId(cardId)==null){
					cardIdList.add(cardId); //cardのidリストに追加
					cardMarkedList.add(false);
				}
				if(size>4){
					int flags = intAry[i*size/4+1];
					if((flags & 0x10000000)!=0){
						cardMarkedList.remove(cardMarkedList.size()-1);
						cardMarkedList.add(true);
					}
				}
			}
			if(!errFlag)break;
		}
		
		/*
		for(int i=0; i<pageEntryCount; i++){
			int cardId = HCData.readCode(dis, 4);
			offset+=4;
			//System.out.println("cardId:"+cardId);
			HCStackDebug.debuginfo(" cardId:"+cardId);
			if(cardId<=0){
				continue;
			}
			if(GetCardbyId(cardId)==null){
				cardIdList.add(cardId); //cardのidリストに追加
				cardMarkedList.add(false);
			}
			if(pageEntrySize>4){
				int flags = HCData.readCode(dis, 4);
				if((flags & 0x10000000)!=0){
					cardMarkedList.remove(cardMarkedList.size()-1);
					cardMarkedList.add(true);
				}
				if(pageEntrySize-8 > 0){
					HCData.readStr(dis, pageEntrySize-8);
				}
				offset+=pageEntrySize-4;
				//System.out.println("something:"+something);
			}
		}*/
		
		int remainLength = blockSize-offset;
		if(remainLength>0){
			/*String padding =*/ HCData.readStr(dis, remainLength);
			//System.out.println("padding:"+padding);
		}
		
		return true;
	}

	

	public boolean readNullBlock(DataInputStream dis, int blockSize){
		//System.out.println("readNullBlock");

		if(blockSize>200000 || blockSize<12){
			return false;
		}
		//ブロックのデータを順次読み込み
		/*int blockId =*/ HCData.readCode(dis, 4);
		//System.out.println("blockId:"+blockId);
		int remainLength = blockSize - 12;
		/*String padding =*/ HCData.readStr(dis, remainLength);
		//System.out.println("padding:"+padding);
		
		return true;
	}
	

	//-------------------
	// Utility function
	//-------------------
	public String GetCardbyId(int cardId) {
		for(int i=0; i<cardIdList.size(); i++){
			if(cardIdList.get(i)==cardId)
			{
				return "";//OCard.getOCard(this, cardId, true);
			}
		}
		return null;
	}
	
	public void AddNewBg(OBackground bg) {

		for(int i=0 ;i<bgCacheList.size(); i++){
			if(bgCacheList.get(i).id == bg.id){
				System.out.println("!");
			}
		}
		bgCacheList.add(bg);
	}

	public OBackground GetBackgroundbyId(int bgId) {
		/*for(int i=0; i<cardIdList.size(); i++){
			OCard cd = GetCardbyId(cardIdList.get(i));
			if(cd!=null && cd.bgid==bgId)
			{
				return OBackground.getOBackground(this, cd, bgId, true);
			}
		}
		return null;*/

		for(int i=0 ;i<bgCacheList.size(); i++){
			if(bgCacheList.get(i).id == bgId){
				return bgCacheList.get(i);
			}
		}
		return null;
	}
}



class OCardBase extends OObject {
	OStack stack;
	Boolean showPict = true;
	String bitmapName="";
	
	//ボタン、フィールド情報
	ArrayList<OObject> partsList;
	ArrayList<OButton> btnList;
	ArrayList<OField> fldList;
	
	public OCardBase(OStack st){
		stack = st;
	}

	public OButton GetBgBtnbyId(int btnId) {
		OBackground bg = getBg();
		for(int i=0; i<bg.btnList.size(); i++){
			if(btnId==bg.btnList.get(i).id)
				return bg.btnList.get(i);
		}
		return null;
	}
	OBackground getBg(){
		OBackground bg = null;
		if(this.objectType.equals("background")) bg = (OBackground)this;
		else if(this.objectType.equals("card")) {
			OCard cd = (OCard)this;
			if(cd.bg != null) {bg = cd.bg;}
			else { bg = cd.stack.GetBackgroundbyId(cd.bgid); }
		}
		return bg;
	}
}


class OBackground extends OCardBase {
	//プロパティ
	Boolean cantDelete=false;
	Boolean cantModify=false;
	Boolean dontSearch=false;
	//number (スタックの情報から求める)
	
	//追加プロパティ
	//OCard viewCard;
	
		
	/*OBackground(OStack st, OCard cd, int bgId, boolean dataonly) {
		super(st);
    	objectType="background";
		parent = st;
		//viewCard = cd;
		this.btnList = new ArrayList<OButton>();
		this.fldList = new ArrayList<OField>();
		this.partsList = new ArrayList<OObject>();
		this.scriptList = new ArrayList<String>();

		id=bgId;
	}*/
	
	
	
	public OBackground(OStack st){
		super(st);
		
		objectType="background";
		parent = st;
		this.btnList = new ArrayList<OButton>();
		this.fldList = new ArrayList<OField>();
		this.partsList = new ArrayList<OObject>();
		this.scriptList = new ArrayList<String>();
	}
	
	
	
	public void writeXML(XMLStreamWriter writer) throws XMLStreamException {
        writer.writeStartElement("background");

        writer.writeAttribute("id",Integer.toString(id));
        writer.writeAttribute("bitmap",bitmapName);
        writer.writeAttribute("cantDelete",cantDelete.toString());
        writer.writeAttribute("showPict",showPict.toString());
        writer.writeAttribute("dontSearch",dontSearch.toString());
        writer.writeAttribute("name",name);
        
        writer.writeStartElement("script");
        for(int i=0; i<scriptList.size(); i++){
        	writer.writeCharacters(scriptList.get(i));
        	if(i<scriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();

        writer.writeStartElement("ejavascript");
        for(int i=0; i<javascriptList.size(); i++){
        	writer.writeCharacters(javascriptList.get(i));
        	if(i<javascriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();
        
        
        for(int i=0; i<partsList.size(); i++){
            OObject part = partsList.get(i);
            if(part.getClass()==OButton.class){
            	((OButton)part).writeXML(writer);
            }
            else if(part.getClass()==OField.class){
            	((OField)part).writeXML(writer);
            }
        }

        for(int i=0; i<partsList.size(); i++){
            OObject part = partsList.get(i);
        	if(part.text.length()>0){
                writer.writeStartElement("content");
                {
                    writer.writeAttribute("layer","background");
                    writer.writeAttribute("id",Integer.toString(part.id));
                    writer.writeStartElement("text");
                    {
                    	String[] strary = part.text.replaceAll("\r","\n").split("\n");
                        for(int j=0; j<strary.length; j++){
                        	writer.writeCharacters(strary[j]);
                        	if(j<strary.length-1){
                        		writer.writeCharacters("\n");
                        	}
                		}
                    }
                    writer.writeEndElement();       
                    
                    if(part.objectType.equals("field") && 
                    	((OField)part).styleList!=null)
                    {
                    	for(int j=0; j<((OField)part).styleList.size(); j++){
	                        writer.writeStartElement("stylerun");
	                        writer.writeAttribute("offset",Integer.toString(((OField)part).styleList.get(j).textPosition));
	                        writer.writeAttribute("id",Integer.toString(((OField)part).styleList.get(j).styleId));
	                        writer.writeEndElement();
                    	}
                    }
                }
                writer.writeEndElement();
        	}
        }

        writer.writeEndElement();
	}

	
	public boolean readBackgroundBlock(DataInputStream dis, int blockSize){
		//System.out.println("====readBackgroundBlock====");

		if(blockSize>2000000 || blockSize<50){
			return false;
		}
		
		int offset = 50;
		
		//ブロックのデータを順次読み込み
		id = HCData.readCode(dis, 4);
		HCStackDebug.debuginfo("bkgndId:"+Integer.toString(id));
		//System.out.println("id:"+id);
		if(id<0 || id >= 2265535){
			//System.out.println("!");
		}
		/*String tygersStr =*/ HCData.readStr(dis, 4);
		//System.out.println("tygersStr:"+tygersStr);
		int bitmapId = HCData.readCode(dis, 4);
		//System.out.println("bitmapId:"+bitmapId);
		if(bitmapId>0){
			bitmapName = "BMAP_"+bitmapId+".png";
		}
		int flags = HCData.readCode(dis, 2);
		//System.out.println("flags:"+flags);
		dontSearch = ((flags>>11)&0x01)!=0;
		showPict = !( ((flags>>13)&0x01)!=0);
		cantDelete = ((flags>>14)&0x01)!=0;
		/*String tygers2Str =*/ HCData.readStr(dis, 6);
		//System.out.println("tygers2Str:"+tygers2Str);
		/*int nextBkgndId =*/ HCData.readCode(dis, 4);
		//System.out.println("nextBkgndId:"+nextBkgndId);
		/*int prevBkgndId =*/ HCData.readCode(dis, 4);
		//System.out.println("prevBkgndId:"+prevBkgndId);
		int numofParts = HCData.readCode(dis, 2);
		//System.out.println("numofParts:"+numofParts);
		/*String tygers3Str =*/ HCData.readStr(dis, 6);
		//System.out.println("tygers3Str:"+tygers3Str);
		int numofContents = HCData.readCode(dis, 2);
		//System.out.println("numofContents:"+numofContents);
		/*int scriptType =*/ HCData.readCode(dis, 4);
		//System.out.println("scriptType:"+scriptType);
		
		for(int i=0; i<numofParts; i++){
			//System.out.println("==part "+i+"==");
			int dataLen = HCData.readCode(dis, 2);
			//System.out.println("dataLen:"+dataLen);
			if(dataLen<30){
				System.out.println("!");
				/*if(dataLen>=0){
					dataLen = (dataLen<<8) + HCData.readCode(dis, 1);
				}*/
			}
			offset += dataLen;
			int pid = HCData.readCode(dis, 2);
			//System.out.println("part id:"+pid);
			if((pid<0 || pid >= 32768) && pid < 6500){
				System.out.println("!");
			}
			int partType = HCData.readCode(dis, 1);
			//System.out.println("partType:"+partType);
			if(partType==1){
				OButton btn = new OButton(this, pid);
				btn.readButtonBlock(dis, dataLen);
				btnList.add(btn);
				partsList.add(btn);
			}
			else if(partType==2){
				OField fld = new OField(this, pid);
				fld.readFieldBlock(dis, dataLen);
				fldList.add(fld);
				partsList.add(fld);
			}
			else return false;
			
			//System.out.println("==end of part==");
		}

		for(int i=0; i<numofContents; i++){
			//System.out.println("==content "+i+"==");
			
			int pid;
			{//アライメント調整
				pid = HCData.readCode(dis, 1);
				while(pid<=i){
					pid = (pid<<8) + HCData.readCode(dis, 1);
				}
			}
			//{
			//	pid = HCData.readCode(dis, 2);
			//}
			//System.out.println("pid:"+pid);
			int contLen = HCData.readCode(dis, 2);
			int orgcontLen = contLen;
			//System.out.println("contLen:"+contLen);
			//offset += contLen+4;
			if(pid >= 32768){
				/*String padding =*/ HCData.readStr(dis, contLen);
				continue;
			}
			int isStyledText = (int)(0x0000FF&HCData.readCode(dis, 1));
			if(isStyledText<128){
				offset += contLen+5;
				contLen-=1;
			}
			else if(isStyledText>=128){
				int formattingLength = (int)((0x007F&isStyledText)<<8)+HCData.readCode(dis, 1);
				//offset += 2;
				//System.out.println("formattingLength:"+formattingLength);
				if(formattingLength>100){
					//System.out.println("!");
				}
				for(int j=0; j<formattingLength/4; j++){
					styleClass styleC = new styleClass();
					styleC.textPosition = HCData.readCode(dis, 2);
					styleC.styleId = HCData.readCode(dis, 2);
					for(int k=0; k<partsList.size(); k++){
						if(partsList.get(k).id == pid){
							if(partsList.get(k).objectType.equals("field")){
								OField fld = (OField)partsList.get(k);
								if(fld.styleList==null) fld.styleList = new ArrayList<styleClass>();
								fld.styleList.add(styleC);
								break;
							}
						}
					}
				}
				offset += contLen+4;
				contLen -= formattingLength;
			}

			//テキスト
			resultStr contentResult;
			if(orgcontLen%2==1){
				//System.out.println("readText(contLen+1="+(contLen+1)+")");
				contentResult = HCData.readText(dis, contLen+1, stack);
			}
			else
			if(contLen>0){
				//System.out.println("readText(contLen="+(contLen)+")");
				contentResult = HCData.readText(dis, contLen, stack);
			}else{
				contentResult = new resultStr();
				contentResult.str = "";
				contentResult.length_in_src = 0;
			}
			//System.out.println("contentResult:"+contentResult.str);
			//HCStackDebug.debuginfo("contentResult:"+contentResult.str);
			for(int k=0; k<partsList.size(); k++){
				if(partsList.get(k).id == pid){
					partsList.get(k).text = contentResult.str;
					break;
				}
			}

			int remainLength = contLen - ((contentResult.length_in_src));
			//System.out.println("content-remainLength:"+remainLength);
			if(remainLength<0 || remainLength > 16){
				//System.out.println("!");
			}
			if(remainLength-1>0){
				/*String padding =*/ HCData.readStr(dis, remainLength-1);
				//System.out.println("padding:"+padding);
			}
		}

		resultStr nameResult = HCData.readTextToZero(stack, dis, blockSize-offset);
		name = nameResult.str;
		//System.out.println("name:"+name);
		
		resultStr scriptResult = HCData.readTextToZero(stack, dis, blockSize-offset-nameResult.length_in_src);
		String scriptStr = scriptResult.str;
		//System.out.println("scriptStr:"+scriptStr);
		
		int remainLength = blockSize - (offset+(nameResult.length_in_src)+(scriptResult.length_in_src));
		//System.out.println("remainLength:"+remainLength);
		if(remainLength > 100){
			//System.out.println("!");
		}
		if(remainLength<0){
			//System.out.println("!");
		}
		if(remainLength-1>0){
			if(remainLength-1>30 && nameResult.length_in_src == 0){
				resultStr scriptResult2 = HCData.readText(dis, remainLength-1, stack);
				scriptStr = scriptResult2.str;
			}else{
				/*String padding =*/ HCData.readStr(dis, remainLength-1);
				//System.out.println("padding:"+padding);
			}
			if(nameResult.length_in_src == 0 && scriptResult.length_in_src<200){
				name = scriptResult.str;
			}
		}
		/*if((nameResult.length_in_src+1+scriptResult.length_in_src+1)%2 != 0){
			String padding = HCData.readStr(dis, 1);
			System.out.println("padding:"+padding);
		}*/
		
		//スクリプト
		String[] scriptAry = scriptStr.split("\n");
		for(int i=0; i<scriptAry.length; i++)
		{
			scriptList.add(scriptAry[i]);
		}
		
		return true;
	}
	
	
}



class OBgButtonData {

	OCardBase card;
	OButton btn;
	boolean check_hilite = false; //ハイライト情報をカードごとに持つ
	int id;
	

	public OBgButtonData(OCardBase cd, int btnId) {
		card = cd;
		
		id=btnId;
	}
	
	public OBgButtonData(OCardBase cd, String data, int btnId) {
		card = cd;
		
		readButtonData(data);
		id=btnId;
	}
	
	public void readButtonData(String indata) {
		String[] data = indata.split("\n");
		boolean hilite=false;
		
		for(int line=0; line<data.length; line++){
			String str=data[line];
		
			if(str.length()>=2 && str.charAt(0)=='#' && str.charAt(1)!='#') {
				String istr;
				
				istr="#hilite:";
				if(str.startsWith(istr)) {
					String tmpstr=str.substring(istr.length());
					hilite=(tmpstr.compareTo("true")==0);
					check_hilite = hilite;
				}
			}
		}
	}
}


class OBgFieldData {

	OCardBase card;
	OField fld;
	String text;
	int id;
	ArrayList<styleClass> styleList;
	
	public OBgFieldData(OCardBase cd, String data, int fldId) {
		card = cd;
		text="";
		
		readFieldData(data);
		id=fldId;
	}
	public OBgFieldData(OCardBase cd, int fldId) {
		card = cd;
		text="";
		
		id=fldId;
	}
	
	public void readFieldData(String indata) {
		String[] data = indata.split("\n");
		int isText = 0;
		
		for(int line=0; line<data.length; line++){
			String str=data[line];

			if(str.length()>=2 && str.charAt(0)=='#' && str.charAt(1)!='#') {
				isText = 0;
				String istr;
				
				istr="#text:";
				if(str.startsWith(istr)) {
					str=str.substring(istr.length());
					isText=1;
				}
			}
			
			if(isText>=1) {
				if(isText==2) text+="\r\n";
				text+=str;
				isText=2;
			}
		}
	}
}





class OCard extends OCardBase {
	OBackground bg = null;
	int bgid;

	ArrayList<OBgButtonData> bgbtnList;
	ArrayList<OBgFieldData> bgfldList;
	
	//プロパティ
	Boolean cantDelete=false;
	Boolean cantModify=false;
	Boolean dontSearch=false;
	Boolean marked=false;
		
	private OCard(OStack st, int cardId, boolean dataonly) {
		super(st);
		
		id = cardId;
    	objectType="card";
		this.btnList = new ArrayList<OButton>();
		this.fldList = new ArrayList<OField>();
		this.partsList = new ArrayList<OObject>();
		this.scriptList = new ArrayList<String>();
		
		this.bgbtnList = new ArrayList<OBgButtonData>();
		this.bgfldList = new ArrayList<OBgFieldData>();
		
	}
	
	
	public OCard(OStack st){
		super(st);
		
    	objectType="card";
		this.btnList = new ArrayList<OButton>();
		this.fldList = new ArrayList<OField>();
		this.partsList = new ArrayList<OObject>();
		this.scriptList = new ArrayList<String>();
		
		this.bgbtnList = new ArrayList<OBgButtonData>();
		this.bgfldList = new ArrayList<OBgFieldData>();
	}
	
	static OCard getOCard(OStack st, int cardId, boolean dataonly) {
		for(int i=0; i<st.cdCacheList.size(); i++){
			OCard cd = st.cdCacheList.get(i);
			if(st==cd.stack && cardId==cd.id){
				if(dataonly) return cd;
				else System.out.println("error getOCard");
			}
		}
		return null;
	}
	
	void writeXML(XMLStreamWriter writer) throws XMLStreamException {
        writer.writeStartElement("card");

        writer.writeAttribute("id",Integer.toString(id));
        writer.writeAttribute("bitmap",bitmapName);
        writer.writeAttribute("cantDelete",cantDelete.toString());
        writer.writeAttribute("showPict",showPict.toString());
        writer.writeAttribute("dontSearch",dontSearch.toString());
        writer.writeAttribute("marked",marked.toString());
        writer.writeAttribute("background",Integer.toString(bgid));
        writer.writeAttribute("name",name);
        
        writer.writeStartElement("script");
        for(int i=0; i<scriptList.size(); i++){
        	writer.writeCharacters(scriptList.get(i).replaceAll("\u001b",""));
        	if(i<scriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();

        writer.writeStartElement("ejavascript");
        for(int i=0; i<javascriptList.size(); i++){
        	writer.writeCharacters(javascriptList.get(i).replaceAll("\u001b",""));
        	if(i<javascriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();
        
        for(int i=0; i<partsList.size(); i++){
            OObject part = partsList.get(i);
            if(part.getClass()==OButton.class){
            	((OButton)part).writeXML(writer);
            }
            else if(part.getClass()==OField.class){
            	((OField)part).writeXML(writer);
            }
        }

        for(int i=0; i<partsList.size(); i++){
            OObject part = partsList.get(i);
        	if(part.text.length()>0){
                writer.writeStartElement("content");
                {
                    writer.writeAttribute("layer","card");
                    writer.writeAttribute("id",Integer.toString(part.id));
                    writer.writeStartElement("text");
                    {
                    	String[] strary = part.text.replaceAll("\r","\n").split("\n");
                        for(int j=0; j<strary.length; j++){
                        	writer.writeCharacters(strary[j]);
                        	if(j<strary.length-1){
                        		writer.writeCharacters("\n");
                        	}
                		}
                    }
                    writer.writeEndElement();
                    
                    if(part.objectType.equals("field") && 
                    	((OField)part).styleList!=null)
                    {
                    	for(int j=0; j<((OField)part).styleList.size(); j++){
	                        writer.writeStartElement("stylerun");
	                        writer.writeAttribute("offset",Integer.toString(((OField)part).styleList.get(j).textPosition));
	                        writer.writeAttribute("id",Integer.toString(((OField)part).styleList.get(j).styleId));
	                        writer.writeEndElement();
                    	}
                    }
                }
                writer.writeEndElement();
        	}
        }

        for(int i=0; i<bgfldList.size(); i++){
            OBgFieldData part = bgfldList.get(i);
        	if(part.text.length()>0){
                writer.writeStartElement("content");
                {
                    writer.writeAttribute("layer","background");
                    writer.writeAttribute("id",Integer.toString(part.id));
                    writer.writeStartElement("text");
                    {
                    	String[] strary = part.text.replaceAll("\r","\n").split("\n");
                        for(int j=0; j<strary.length; j++){
                        	writer.writeCharacters(strary[j]);
                        	if(j<strary.length-1){
                        		writer.writeCharacters("\n");
                        	}
                		}
                    }
                    writer.writeEndElement();
                    
                    if(part.styleList!=null)
                    {
                    	for(int j=0; j<part.styleList.size(); j++){
	                        writer.writeStartElement("stylerun");
	                        writer.writeAttribute("offset",Integer.toString(part.styleList.get(j).textPosition));
	                        writer.writeAttribute("id",Integer.toString(part.styleList.get(j).styleId));
	                        writer.writeEndElement();
                    	}
                    }
                }
                writer.writeEndElement();
        	}
        }

        for(int i=0; i<bgbtnList.size(); i++){
            OBgButtonData part = bgbtnList.get(i);
        	if(GetBgBtnbyId(part.id).sharedHilite==false){
                writer.writeStartElement("content");
                {
                    writer.writeAttribute("layer","background");
                    writer.writeAttribute("id",Integer.toString(part.id));
                    writer.writeAttribute("hilite",Boolean.toString(part.check_hilite));
                }
                writer.writeEndElement();
        	}
        }

        writer.writeEndElement();
	}


	//HCのスタックを変換
	public boolean readCardBlock(DataInputStream dis, int blockSize){
		//System.out.println("====readCardBlock====");

		if(blockSize>2000000 || blockSize<50){
			return false;
		}
		
		int offset = 54;
		
		//ブロックのデータを順次読み込み
		id = HCData.readCode(dis, 4);
		HCStackDebug.debuginfo("id:"+Integer.toString(id));
		//System.out.println("id:"+id);
		if(id<0 || id >= 2265535){
			//System.out.println("!");
		}
		/*String tygersStr =*/ HCData.readStr(dis, 4);
		//HCStackDebug.debuginfo("tygersStr:"+tygersStr);
		//System.out.println("tygersStr:"+tygersStr);
		int bitmapId = HCData.readCode(dis, 4);
		//HCStackDebug.debuginfo("bitmapId:"+Integer.toString(bitmapId));
		//System.out.println("bitmapId:"+bitmapId);
		if(bitmapId>0){
			bitmapName = "BMAP_"+bitmapId+".png";
		}
		int flags = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("flags:0x"+Integer.toHexString(flags));
		//System.out.println("flags:"+flags);
		dontSearch = ((flags>>11)&0x01)!=0;
		showPict = !( ((flags>>13)&0x01)!=0);
		cantDelete = ((flags>>14)&0x01)!=0;
		/*String tygers2Str =*/ HCData.readStr(dis, 10);
		//System.out.println("tygers2Str:"+tygers2Str);
		/*int pageId =*/ HCData.readCode(dis, 4);
		//HCStackDebug.debuginfo("pageId:"+Integer.toString(pageId));
		//System.out.println("pageId:"+pageId);
		bgid = HCData.readCode(dis, 4);
		//HCStackDebug.debuginfo("bgid:"+Integer.toString(bgid));
		//System.out.println("bgid:"+bgid);
		int numofParts = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("numofParts:"+Integer.toString(numofParts));
		//System.out.println("numofParts:"+numofParts);
		/*String tygers3Str =*/ HCData.readStr(dis, 6);
		//System.out.println("tygers3Str:"+tygers3Str);
		int numofContents = HCData.readCode(dis, 2);
		//HCStackDebug.debuginfo("numofContents:"+Integer.toString(numofContents));
		//System.out.println("numofContents:"+numofContents);
		/*int scriptType =*/ HCData.readCode(dis, 4);
		//System.out.println("scriptType:"+scriptType);
		
		for(int i=0; i<numofParts; i++){
			//System.out.println("==part "+i+"==");
			//HCStackDebug.debuginfo("==part "+i+"==");
			int dataLen = HCData.readCode(dis, 2);
			//System.out.println("dataLen:"+dataLen);
			//HCStackDebug.debuginfo("dataLen:"+Integer.toString(dataLen));
			if(dataLen<30){
				//System.out.println("!");
				/*if(dataLen>=0){
					dataLen = (dataLen<<8) + HCData.readCode(dis, 1);
				}*/
			}
			int pid = HCData.readCode(dis, 2);
			//System.out.println("part id:"+pid);
			//HCStackDebug.debuginfo("partid:"+Integer.toString(pid));
			offset += dataLen;
			if(offset > blockSize){
				//System.out.println("!");
			}
			if(pid<0 || pid >= 32768){
				//System.out.println("!");
			}
			int partType = HCData.readCode(dis, 1);
			//System.out.println("partType:"+partType);
			//HCStackDebug.debuginfo("partType:"+Integer.toString(partType));
			if(partType==1){
				OButton btn = new OButton(this, pid);
				btn.readButtonBlock(dis, dataLen);
				btnList.add(btn);
				partsList.add(btn);
			}
			else if(partType==2){
				OField fld = new OField(this, pid);
				fld.readFieldBlock(dis, dataLen);
				fldList.add(fld);
				partsList.add(fld);
			}
			else return false;
			
			//System.out.println("==end of part==");
		}

		for(int i=0; i<numofContents; i++){
			if(blockSize - offset<0){
				break;
			}
			//System.out.println("==cd content "+i+"==");
			//HCStackDebug.debuginfo("==cd content "+i+"==");
			
			int pid;
			/*{//アライメント調整
				pid = HCData.readCode(dis, 1);
				while(pid<=0 || (pid==255 && i<255) || (pid==254 && i<255)){
					pid = (pid<<8) + HCData.readCode(dis, 1);
				}
			}*/
			{
				pid = (int)(0x0000FFFF&HCData.readCode(dis, 2));
			}
			//System.out.println("pid:"+pid);
			//HCStackDebug.debuginfo("partid:"+Integer.toString(pid));
			if((pid<0 || pid >= 32768) && pid < 6500){
				//System.out.println("!");
			}
			OBgFieldData bgfld = null;
			if(pid<32768){
				//bg part
				bgfld = new OBgFieldData(this, pid);
			}
			int contLen = (int)(0x0000FFFF & HCData.readCode(dis, 2));
			int orgcontLen = contLen;
			//System.out.println("contLen:"+contLen);
			//HCStackDebug.debuginfo("contLen:"+Integer.toString(contLen));
			if(offset+contLen+4 > blockSize){
				//HCStackDebug.debuginfo("!!!");
				//HCStackDebug.debuginfo("(offset:"+Integer.toString(offset));
				//HCStackDebug.debuginfo("+contLen:"+Integer.toString(contLen));
				//HCStackDebug.debuginfo(">blockSize):"+Integer.toString(blockSize));
				//System.out.println("!");
				contLen=blockSize-offset-4-2;
				if(contLen<0) contLen = 0;
				//break;
			}
			int isStyledText = (int)(0x0000FF&HCData.readCode(dis, 1));
			if(isStyledText<128){
				offset += contLen+5;
				contLen-=1;
			}
			else if(isStyledText>=128){
				int formattingLength = (int)((0x007F&isStyledText)<<8)+HCData.readCode(dis, 1);
				//System.out.println("formattingLength:"+formattingLength);
				//HCStackDebug.debuginfo("formattingLength:"+Integer.toString(formattingLength));
				if(formattingLength>100){
					System.out.println("!");
				}
				for(int j=0; j<formattingLength/4; j++){
					styleClass styleC = new styleClass();
					styleC.textPosition = HCData.readCode(dis, 2);
					styleC.styleId = HCData.readCode(dis, 2);
					if(pid>32768){
						//cd part
						int inpid = 65536-pid;
						for(int k=0; k<partsList.size(); k++){
							if(partsList.get(k).id == inpid){
								if(partsList.get(k).objectType.equals("field")){
									OField fld = (OField)partsList.get(k);
									if(fld.styleList==null) fld.styleList = new ArrayList<styleClass>();
									fld.styleList.add(styleC);
									break;
								}
							}
						}
					}
					else{
						//bg part
						if(bgfld.styleList==null) bgfld.styleList = new ArrayList<styleClass>();
						bgfld.styleList.add(styleC);
					}
				}
				offset += contLen+4;
				contLen -= formattingLength;
			}
			
			//テキスト
			resultStr contentResult;
			if(orgcontLen%2==1){
				//System.out.println("readText(contLen+1="+(contLen+1)+")");
				contentResult = HCData.readText(dis, contLen+1, stack);
			}
			else
			if(contLen>0){
				//System.out.println("readText(contLen="+(contLen)+")");
				contentResult = HCData.readText(dis, contLen, stack);
			}else{
				contentResult = new resultStr();
				contentResult.str = "";
				contentResult.length_in_src = 0;
			}
			//System.out.println("contentResult:"+contentResult.str);
			//HCStackDebug.debuginfo("contentResult:"+contentResult.str);
			if(pid>=32768){
				//cd part
				pid = 65536-pid;
				boolean isFound = false;
				for(int k=0; k<partsList.size(); k++){
					if(partsList.get(k).id == pid){
						partsList.get(k).text=contentResult.str;
						isFound = true;
						break;
					}
				}
				if(!isFound){
					//System.out.println("cd part "+pid+" not found.");
				}
			}
			else{
    			bgfld.text = contentResult.str;
    			bgfldList.add(bgfld);
			}

			int remainLength = contLen - ((contentResult.length_in_src));
			//System.out.println("contentResult.length_in_src:"+contentResult.length_in_src);
			//System.out.println("content-remainLength:"+remainLength);
			//HCStackDebug.debuginfo("content-remainLength:"+remainLength);
			if(remainLength<0 || remainLength > 32){
				//System.out.println("!");
			}
			if(remainLength-1>0){
				/*String padding =*/ HCData.readStr(dis, remainLength-1);
				//System.out.println("padding:"+padding);
				//HCStackDebug.debuginfo("padding:"+padding);
			}
		}

		/*if(offset%2==0){
			String paddingx = HCData.readStr(dis, 1);
			offset++;
			System.out.println("paddingx:"+paddingx);
			HCStackDebug.debuginfo("paddingx:"+paddingx);
		}*/
		
		resultStr nameResult = HCData.readTextToZero(stack, dis, blockSize-offset);
		name = nameResult.str;
		if(id==12332&&name.equals("")){
			name = "DATAX"; //秘密結社ゲーム対策(暫定)
		}
		//System.out.println("name:"+name);
		HCStackDebug.debuginfo("name:"+name);
		
		resultStr scriptResult = HCData.readTextToZero(stack, dis, blockSize-offset-nameResult.length_in_src);
		String scriptStr = scriptResult.str;
		//System.out.println("scriptStr:"+scriptStr);
		//HCStackDebug.debuginfo("scriptStr:"+scriptStr);
		
		int remainLength = blockSize - (offset+(nameResult.length_in_src)+(scriptResult.length_in_src));
		//System.out.println("remainLength:"+remainLength);
		//HCStackDebug.debuginfo("remainLength:"+remainLength);
		if(remainLength > 100){
			//System.out.println("!");
		}
		if(remainLength<0){
			//System.out.println("!");
		}
		if(blockSize==800){
			//System.out.println("!");
		}
		if(remainLength-1>0){
			if(remainLength-1>30 && nameResult.length_in_src == 0){
				resultStr scriptResult2 = HCData.readText(dis, remainLength-1, stack);
				scriptStr = scriptResult2.str;
				//HCStackDebug.debuginfo("set to script.");
			}else{
				/*String padding =*/ HCData.readStr(dis, remainLength-1);
				//System.out.println("padding:"+padding);
				//HCStackDebug.debuginfo("padding:"+padding);
			}
			if(nameResult.length_in_src == 0 && scriptResult.length_in_src<100){
				name = scriptResult.str;
			}
		}
		
		//スクリプト
		String[] scriptAry = scriptStr.split("\n");
		for(int i=0; i<scriptAry.length; i++)
		{
			scriptList.add(scriptAry[i]);
		}
		
		return true;
	}
	
	
	
	static BufferedImage makeAlphaImage(BufferedImage src, BufferedImage mask) {
		int width = src.getWidth();
		int height = src.getHeight();
		
		if(mask.getWidth() != width) return null;
		if(mask.getHeight() != height) return null;
		
		BufferedImage dst = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
	
		DataBuffer srcb = src.getRaster().getDataBuffer();
		DataBuffer maskb = mask.getRaster().getDataBuffer();
		DataBuffer dstb = dst.getRaster().getDataBuffer();
		
		for(int y=0; y<height; y++) {
			for(int x=0; x<width; x++) {
				int a = maskb.getElem(0, y * width + x);
				int rgb = srcb.getElem(0, y * width + x);
				dstb.setElem(0, y * width + x, rgb | (a << 24));
			}
		}
		
		return dst;
	}
	
}





class OButton extends OObject {
	//OCardBase card = null;
	//OBackground bkgd = null;
	
	//プロパティ
	//Boolean autoHilite=true;
	//Color color=Color.BLACK;
	//Color bgColor=Color.WHITE;
	int group=0;
	//Boolean check_hilite=false;//他のカードからの参照用
	private boolean autoHilite=true;//作成時のみ参照
	private boolean hilite=false;//作成時のみ参照
	int icon=0;
	//URI iconURI;
	//number (カードの情報から求める)
	Boolean sharedHilite=false;
	Boolean showName=true;
	int style=0;//0標準 1透明 2不透明 3長方形 4シャドウ 5丸みのある長方形 6省略時設定 7楕円 8ポップアップ 9チェックボックス 10ラジオ
	int textAlign=1;//0左 1中 2右
	String textFont="";
	int textHeight=16;
	int textSize=12;
	int textStyle=0;//
	int titleWidth=0;
	private int selectedLine=0;
	//private boolean scaleIcon = false;
	//int blendMode;
	//int blendLevel = 100;
	
	
	public OButton(OCardBase cd, int btnId){
    	objectType="button";
		//card = cd;
		parent = cd;
		scriptList = new ArrayList<String>();

		width=64; height=20;
		id=btnId;
	}
	
	
	public void writeXML(XMLStreamWriter writer) throws XMLStreamException {
        writer.writeStartElement("part");

        writer.writeAttribute("id",Integer.toString(id));
        writer.writeAttribute("type","button");
        writer.writeAttribute("visible",Boolean.toString(visible));
        writer.writeAttribute("enabled",Boolean.toString(enabled));

        String styleStr = "";
        switch(style){
        case 0: styleStr = "standard";break;
        case 1: styleStr = "transparent";break;
        case 2: styleStr = "opaque";break;
        case 3: styleStr = "rectangle";break;
        case 4: styleStr = "shadow";break;
        case 5: styleStr = "roundrect";break;
        case 6: styleStr = "default";break;
        case 7: styleStr = "oval";break;
        case 8: styleStr = "popup";break;
        case 9: styleStr = "checkbox";break;
        case 10: styleStr = "radio";break;
        }
        writer.writeAttribute("style",styleStr);

        writer.writeAttribute("showName",Boolean.toString(showName));
        writer.writeAttribute("hilite",Boolean.toString(hilite));
        writer.writeAttribute("autoHilite",Boolean.toString(autoHilite));
        writer.writeAttribute("family",Integer.toString(group));
        writer.writeAttribute("titleWidth",Integer.toString(titleWidth));

        if(parent.getClass()==OBackground.class){
            writer.writeAttribute("sharedHilite",Boolean.toString(sharedHilite));
        }

        if(style==8){
            writer.writeAttribute("selectedLines",Integer.toString(selectedLine));
        }
        else{
            writer.writeAttribute("icon",Integer.toString(icon));
        }

        String textAlignStr = "";
        switch(textAlign){
        case 0: textAlignStr="left";break;
        case 1: textAlignStr="center";break;
        case 2: textAlignStr="right";break;
        }
        writer.writeAttribute("textAlign",textAlignStr);

        int textFontID = 0;
        for(int i=0; i<((OCardBase)parent).stack.fontList.size(); i++){
        	OStack.fontClass fontinfo = ((OCardBase)parent).stack.fontList.get(i);
        	if(fontinfo.name.equals(textFont)){
        		textFontID = fontinfo.id;
        		break;
        	}
        }
        writer.writeAttribute("textFontID",Integer.toString(textFontID));

        writer.writeAttribute("textSize",Integer.toString(textSize));

        writer.writeAttribute("textStyle",Integer.toString(textStyle));
        writer.writeAttribute("textHeight",Integer.toString(textHeight));
        writer.writeAttribute("name",name);

        {
            writer.writeAttribute("left",Integer.toString(left));
            writer.writeAttribute("top",Integer.toString(top));
            writer.writeAttribute("width",Integer.toString(width));
            writer.writeAttribute("height",Integer.toString(height));
        }

        writer.writeStartElement("script");
        for(int i=0; i<scriptList.size(); i++){
        	writer.writeCharacters(scriptList.get(i));
        	if(i<scriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();

        writer.writeStartElement("ejavascript");
        for(int i=0; i<javascriptList.size(); i++){
        	writer.writeCharacters(javascriptList.get(i));
        	if(i<javascriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();

        writer.writeEndElement();
	}
	

	//HCのスタックを変換
	public boolean readButtonBlock(DataInputStream dis, int partSize){
		OStack stack = ((OCardBase)this.parent).stack;
		//System.out.println("====readButtonBlock====");
		//ブロックのデータを順次読み込み
		int flags = HCData.readCode(dis, 1);
		//System.out.println("flags:"+flags);
		visible = (((flags>>7)&0x01)==0);
		//dontWrap = !( ((flags>>5)&0x01)!=0);
		//dontSearch = ((flags>>4)&0x01)!=0;
		//sharedText = ((flags>>3)&0x01)!=0;
		//fixedLineHeight = ! (((flags>>2)&0x01)!=0);
		//autoTab = ((flags>>1)&0x01)!=0;
		enabled = ! (((flags>>0)&0x01)!=0);
		top = HCData.readCode(dis, 2);
		//System.out.println("top:"+top);
		left = HCData.readCode(dis, 2);
		//System.out.println("left:"+left);
		int bottom = HCData.readCode(dis, 2);
		//System.out.println("bottom:"+bottom);
		height = bottom - top;
		int right = HCData.readCode(dis, 2);
		//System.out.println("right:"+right);
		width = right - left;
		int flags2 = HCData.readCode(dis, 1);
		showName = ((flags2>>7)&0x01)!=0;
		hilite = ((flags2>>6)&0x01)!=0;
		autoHilite = ((flags2>>5)&0x01)!=0;
		sharedHilite = !(((flags2>>4)&0x01)!=0);
		group = (flags2)&0x0F;
		int style = HCData.readCode(dis, 1);
		//0標準 1透明 2不透明 3長方形 4シャドウ 5丸みのある長方形 6省略時設定 7楕円 8ポップアップ 9チェックボックス 10ラジオ
		switch(style){
		case 0: this.style = 1; break;//transparent
		case 1: this.style = 2; break;//opaque
		case 2: this.style = 3; break;//rectangle
		case 3: this.style = 5; break;//roundRect
		case 4: this.style = 4; break;//shadow
		case 5: this.style = 9; break;//checkBox
		case 6: this.style = 10; break;//radioButton
		//case 7: this.style = 0; break;//scrolling
		case 8: this.style = 0; break;//standard
		case 9: this.style = 6; break;//default
		case 10: this.style = 7; break;//oval
		case 11: this.style = 8; break;//popup
		}
		titleWidth = HCData.readCode(dis, 2);
		//System.out.println("titleWidth:"+titleWidth);
		if(this.style == 8){
			selectedLine = HCData.readCode(dis, 2);
			//System.out.println("selectedLine:"+selectedLine);
		}
		else{
			icon = HCData.readCode(dis, 2);
			//System.out.println("icon:"+icon);
		}
		int inTextAlign = HCData.readCode(dis, 2);
		switch(inTextAlign){
		case 0: textAlign = 0; break;
		case 1: textAlign = 1; break;
		case -1: textAlign = 2; break;
		}
		//System.out.println("inTextAlign:"+inTextAlign);
		int textFontID = HCData.readCode(dis, 2);
		//System.out.println("textFontID:"+textFontID);
		textSize = HCData.readCode(dis, 2);
		//System.out.println("textSize:"+textSize);
		textStyle = HCData.readCode(dis, 1);
		//System.out.println("textStyle:"+textStyle);
		/*int filler =*/ HCData.readCode(dis, 1);
		//System.out.println("filler:"+filler);
		textHeight = HCData.readCode(dis, 2);
		//System.out.println("textHeight:"+textHeight);
		resultStr nameResult = HCData.readTextToZero(stack, dis, partSize - 30);
		name = nameResult.str;
		//HCStackDebug.debuginfo("name:"+name);
		//System.out.println("name:"+name);
		/*int filler2 =*/// HCData.readCode(dis, 1);
		//System.out.println("filler2:"+filler2);
		resultStr scriptResult = HCData.readText(dis, partSize - 30 - nameResult.length_in_src, stack);
		String scriptStr = scriptResult.str;
		//System.out.println("scriptStr:"+scriptStr);

		//フォント名をテーブルから検索
		for(int i=0; i<stack.fontList.size();i++){
			if(stack.fontList.get(i).id ==textFontID){
				textFont = stack.fontList.get(i).name;
				break;
			}
		}

		int remainLength = partSize - (30+(nameResult.length_in_src)+(scriptResult.length_in_src));
		//System.out.println("remainLength:"+remainLength);
		//HCStackDebug.debuginfo("remainLength:"+remainLength);
		if(remainLength<0 || remainLength > 1000){
			//System.out.println("!");
		}
		if(remainLength>0){
			/*String padding =*/ HCData.readStr(dis, remainLength);
			//System.out.println("padding:"+padding);
			//HCStackDebug.debuginfo("padding:"+padding);
		}
		/*if((nameResult.length_in_src+1+scriptResult.length_in_src+1)%2 != 0){
			String padding = HCData.readStr(dis, 1);
			System.out.println("padding:"+padding);
		}*/

		//スクリプト
		String[] scriptAry = scriptStr.split("\n");
		for(int i=0; i<scriptAry.length; i++)
		{
			scriptList.add(scriptAry[i]);
		}
		
		return true;
	}
}



class OField extends OObject {
	//OCardBase card = null;
	//OBackground bkgd = null;
	//MyTextArea fld = null;
	//MyScrollPane scrollPane = null;
	//BufferedImage fontPict2;
	
	//プロパティ
	Boolean autoTab=false;
	Boolean autoSelect=false;
	Boolean dontSearch=false;
	Boolean dontWrap=false;
	//Color color=Color.BLACK;
	//Color bgColor=Color.WHITE;
	//Color selectColor=Color.ORANGE;
	//Color textColor=Color.BLACK;
	Boolean fixedLineHeight=false;
	// lockTextはenabledで代用
	//number (カードの情報から求める)
	int scroll=0;
	Boolean sharedText=false;
	Boolean showLines=false;
	int style=0;//(0標準) 1透明 2不透明 3長方形 4シャドウ 5スクロール
	int textAlign=0;//0左 1中 2右
	String textFont="";
	int textHeight=16;
	int textSize=12;
	int textStyle=0;//0 plain
	boolean wideMargins=false;
	int selectedLine=0;
	int selectedStart=0;
	int selectedEnd=0;
	boolean multipleLines;
	boolean hilite=false;//
	
	ArrayList<styleClass> styleList;
	
	

	public OField(OCardBase cd, int fldId) {
    	objectType="field";
		//card = cd;
		parent = cd;
		scriptList = new ArrayList<String>();

		width=64; height=64;
		id=fldId;
	}
	


	
	public void writeXML(XMLStreamWriter writer) throws XMLStreamException {
        writer.writeStartElement("part");

        writer.writeAttribute("id",Integer.toString(id));
        writer.writeAttribute("type","field");
        writer.writeAttribute("visible",Boolean.toString(visible));
        writer.writeAttribute("dontWrap",Boolean.toString(dontWrap));
        writer.writeAttribute("dontSearch",Boolean.toString(dontSearch));
        writer.writeAttribute("sharedText",Boolean.toString(sharedText));
        writer.writeAttribute("fixedLineHeight",Boolean.toString(fixedLineHeight));
        writer.writeAttribute("autoTab",Boolean.toString(autoTab));
        writer.writeAttribute("lockText",Boolean.toString(enabled));
        writer.writeAttribute("autoSelect",Boolean.toString(autoSelect));
        writer.writeAttribute("showLines",Boolean.toString(showLines));
        writer.writeAttribute("wideMargins",Boolean.toString(wideMargins));
        writer.writeAttribute("multipleLines",Boolean.toString(multipleLines));

        String styleStr = "";
        switch(style){
        case 0: styleStr = "standard";break;
        case 1: styleStr = "transparent";break;
        case 2: styleStr = "opaque";break;
        case 3: styleStr = "rectangle";break;
        case 4: styleStr = "shadow";break;
        case 5: styleStr = "scrolling";break;
        }
        writer.writeAttribute("style",styleStr);

        String textAlignStr = "";
        switch(textAlign){
        case 0: textAlignStr="left";break;
        case 1: textAlignStr="center";break;
        case 2: textAlignStr="right";break;
        }
        writer.writeAttribute("textAlign",textAlignStr);

        writer.writeAttribute("selectedLines",Integer.toString(selectedLine));
        writer.writeAttribute("textSize",Integer.toString(textSize));

        int textFontID = 0;
        for(int i=0; i<((OCardBase)parent).stack.fontList.size(); i++){
        	OStack.fontClass fontinfo = ((OCardBase)parent).stack.fontList.get(i);
        	if(fontinfo.name.equals(textFont)){
        		textFontID = fontinfo.id;
        		break;
        	}
        }
        writer.writeAttribute("textFontID",Integer.toString(textFontID));
        writer.writeAttribute("textStyle",Integer.toString(textStyle));
        writer.writeAttribute("textHeight",Integer.toString(textHeight));
        writer.writeAttribute("name",name);

        {
            writer.writeAttribute("left",Integer.toString(left));
            writer.writeAttribute("top",Integer.toString(top));
            writer.writeAttribute("width",Integer.toString(width));
            writer.writeAttribute("height",Integer.toString(height));
        }

        writer.writeStartElement("script");
        for(int i=0; i<scriptList.size(); i++){
        	writer.writeCharacters(scriptList.get(i));
        	if(i<scriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();

        writer.writeStartElement("ejavascript");
        for(int i=0; i<javascriptList.size(); i++){
        	writer.writeCharacters(javascriptList.get(i));
        	if(i<javascriptList.size()-1){
        		writer.writeCharacters("\n");
        	}
		}
        writer.writeEndElement();

        writer.writeEndElement();
	}

	
	//HCのスタックを変換
	public boolean readFieldBlock(DataInputStream dis, int partSize){
		OStack stack = ((OCardBase)this.parent).stack;
		//System.out.println("====readFieldBlock====");
		//ブロックのデータを順次読み込み
		int flags = HCData.readCode(dis, 1);
		//System.out.println("flags:"+flags);
		visible = (((flags>>7)&0x01)==0);
		dontWrap = ((flags>>5)&0x01)!=0;
		dontSearch = ((flags>>4)&0x01)!=0;
		sharedText = ((flags>>3)&0x01)!=0;
		fixedLineHeight = ! (((flags>>2)&0x01)!=0);
		autoTab = ((flags>>1)&0x01)!=0;
		enabled = (((flags>>0)&0x01)!=0);
		top = HCData.readCode(dis, 2);
		//System.out.println("top:"+top);
		left = HCData.readCode(dis, 2);
		//System.out.println("left:"+left);
		int bottom = HCData.readCode(dis, 2);
		//System.out.println("bottom:"+bottom);
		height = bottom - top;
		int right = HCData.readCode(dis, 2);
		//System.out.println("right:"+right);
		width = right - left;
		int flags2 = HCData.readCode(dis, 1);
		autoSelect = ((flags2>>7)&0x01)!=0;
		showLines = ((flags2>>6)&0x01)!=0;
		wideMargins = ((flags2>>5)&0x01)!=0;
		multipleLines = ((flags2>>4)&0x01)!=0;
		//group = (flags2)&0x0F;
		int style = HCData.readCode(dis, 1);
		//0標準 1透明 2不透明 3長方形 4シャドウ 5丸みのある長方形 6省略時設定 7楕円 8ポップアップ 9チェックボックス 10ラジオ
		switch(style){
		case 0: this.style = 1; break;//transparent
		case 1: this.style = 2; break;//opaque
		case 2: this.style = 3; break;//rectangle
		//case 3: this.style = 5; break;//roundRect
		case 4: this.style = 4; break;//shadow
		//case 5: this.style = 9; break;//checkBox
		//case 6: this.style = 10; break;//radioButton
		case 7: this.style = 5; break;//scrolling
		//case 8: this.style = 0; break;//standard
		//case 9: this.style = 6; break;//default
		//case 10: this.style = 7; break;//oval
		//case 11: this.style = 8; break;//popup
		}
		selectedEnd = HCData.readCode(dis, 2);
		//System.out.println("selectedEnd:"+selectedEnd);
		selectedStart = HCData.readCode(dis, 2);
		//System.out.println("selectedStart:"+selectedStart);
		selectedLine = selectedStart;
		int inTextAlign = HCData.readCode(dis, 2);
		switch(inTextAlign){
		case 0: textAlign = 0; break;
		case 1: textAlign = 1; break;
		case -1: textAlign = 2; break;
		}
		//System.out.println("inTextAlign:"+inTextAlign);
		int textFontID = HCData.readCode(dis, 2);
		//System.out.println("textFontID:"+textFontID);
		textSize = HCData.readCode(dis, 2);
		//System.out.println("textSize:"+textSize);
		textStyle = HCData.readCode(dis, 1);
		//System.out.println("textStyle:"+textStyle);
		/*int filler =*/ HCData.readCode(dis, 1);
		//System.out.println("filler:"+filler);
		textHeight = HCData.readCode(dis, 2);
		//System.out.println("textHeight:"+textHeight);
		resultStr nameResult = HCData.readTextToZero(stack, dis, partSize - 30);
		name = nameResult.str;
		//System.out.println("name:"+name);
		//HCStackDebug.debuginfo("name:"+name);
		/*int filler2 =*/ //HCData.readCode(dis, 1);
		//System.out.println("filler2:"+filler2);
		resultStr scriptResult = HCData.readText(dis, partSize - 30 - nameResult.length_in_src, stack);
		String scriptStr = scriptResult.str;
		//System.out.println("scriptStr:"+scriptStr);

		//フォント名をテーブルから検索
		for(int i=0; i<stack.fontList.size();i++){
			if(stack.fontList.get(i).id ==textFontID){
				textFont = stack.fontList.get(i).name;
				break;
			}
		}

		int remainLength = partSize - (30+(nameResult.length_in_src)+(scriptResult.length_in_src));
		//System.out.println("remainLength:"+remainLength);
		//HCStackDebug.debuginfo("remainLength:"+remainLength);
		if(remainLength<0 || remainLength > 10){
			//System.out.println("!");
		}
		if(remainLength>0){
			/*String padding =*/ HCData.readStr(dis, remainLength);
			//System.out.println("padding:"+padding);
			//HCStackDebug.debuginfo("padding:"+padding);
		}
		/*if((nameResult.length_in_src+1+scriptResult.length_in_src+1)%2 != 0){
			String padding = HCData.readStr(dis, 1);
			System.out.println("padding:"+padding);
		}*/

		//スクリプト
		String[] scriptAry = scriptStr.split("\n");
		for(int i=0; i<scriptAry.length; i++)
		{
			scriptList.add(scriptAry[i]);
		}
		
		return true;
	}	
}


class styleClass{
	int textPosition;
	int styleId;
}




class Stack2json {
	boolean loadStack(String path, OStack stack)
	{ 
		//リソースフォーク無し前提。(MacOSで動かすんじゃないしリソースフォーク読めない)

		DataInputStream dis = null;
		try {
			FileInputStream fis = new FileInputStream(path);
			dis = new DataInputStream(fis);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}

		//データフォーク読み込み
		if(dis==null || !new HCData().readDataFork(dis, stack)){
			System.out.println("Error occured at reading data from file.");
			return false;
		}
		else{
			//リソースフォークっぽい名前のファイルがあればリソースフォーク読み込み
			//1.AppleDoubleHeaderの解凍時のファイル
			String searchPath = new File(path).getParent()+File.separatorChar+"._"+new File(path).getName();
			File rsrcFile = new File(searchPath);
			if(!rsrcFile.exists()){
				searchPath = new File(path).getParent()+File.separatorChar+"__MACOSX"+File.separatorChar+"._"+new File(path).getName();
				rsrcFile = new File(searchPath);
			}
			if(rsrcFile.exists()){
				DataInputStream rsrc_dis = null;
				try {
					rsrc_dis = new DataInputStream(new FileInputStream(rsrcFile));
				} catch (FileNotFoundException e) {
					e.printStackTrace();
				}

				//AppleDoubleのヘッダファイルとして読み込み
				new HCResource().readAppleDoubleHeader(rsrc_dis, stack);
			}
			else{
				System.out.println("Resource file is not found.");
			}
			//リソースファイルがなくても成功
			return true;
		}
	}
	

	boolean saveJson(OStack stack)
	{
		String fname = stack.path;
		boolean result = true;

		if(stack.width==0){
			//Homeスタックの大きさが0になる対策
			stack.width=stack.cdCacheList.get(0).width;
			stack.height=stack.cdCacheList.get(0).height;
			if(stack.width==0){
				stack.width=512;
				stack.height=342;
			}
		}

		XMLOutputFactory factory = XMLOutputFactory.newInstance();
		 
        StringWriter stringWriter = new StringWriter();
        try {
        	XMLStreamWriter writer = factory.createXMLStreamWriter(stringWriter);
        	
			writer.writeStartDocument("utf-8", "1.0");
			//writer.writeDTD("<!DOCTYPE stackfile PUBLIC \"-//Apple, Inc.//DTD stackfile V 2.0//EN\" \"\" >");
	        writer.writeStartElement("stackfile");

	        stack.writeXML(writer);
	        stack.writeFontXML(writer);
	        stack.writeStyleXML(writer);
			for(int i=0 ;i<stack.bgCacheList.size(); i++){
				stack.bgCacheList.get(i).writeXML(writer);
			}
			/*for(int i=0 ;i<stack.cdCacheList.size(); i++){
				stack.cdCacheList.get(i).writeXML(writer);
			}*/ //これでは順番が狂う
			for(int i=0 ;i<stack.cardIdList.size(); i++){
				int id = stack.cardIdList.get(i);
				for(int j=0 ;j<stack.cdCacheList.size(); j++){
					if(stack.cdCacheList.get(j).id == id){
						stack.cdCacheList.get(j).writeXML(writer);
						break;
					}
				}
			}
	        stack.rsrc.writeXML(writer);
	        stack.rsrc.writePLTEXML(writer);
	        stack.rsrc.writeAddColorXML(writer);
	        stack.rsrc.writeXcmdXML(writer);
	 
	        writer.writeEndDocument();
	 
	        writer.close();

	        //XML文字列をファイルに保存
			File xmlfile = new File(stack.path);
			if(!stack.path.substring(fname.length()-4).equals(".xml")){
				xmlfile = new File(new File(stack.path).getParent()+File.separatorChar+"_stack.xml");
			}
			if(!xmlfile.exists() || xmlfile.canWrite()){
				try {
					FileOutputStream stream = new FileOutputStream(xmlfile);
					stream.write(stringWriter.toString().getBytes("utf-8"));
					stream.close();
				} catch (IOException e) {
					e.printStackTrace();
					result = false;
				}
			}

			//XMLからJSONに変換
	        DocumentBuilderFactory bfactory = DocumentBuilderFactory.newInstance();
	        DocumentBuilder builder = null;
	        try{
	        	builder = bfactory.newDocumentBuilder(); 
	        } 
            catch (javax.xml.parsers.ParserConfigurationException ex) { 
            } 
            if(builder==null) return false;
	        Document doc = builder.parse(xmlfile);
	        String jsonStr = JSON.encode(doc);
	        
	        //boolean値を"true"からtrueに変換
	        jsonStr = jsonStr.replaceAll(":\"true\"",":true");
	        jsonStr = jsonStr.replaceAll(":\"false\"",":false");
	        
	        //JSON文字列をファイルに保存
			File file = new File(stack.path);
			if(!stack.path.substring(fname.length()-5).equals(".json")){
				file = new File(new File(stack.path).getParent()+File.separatorChar+"_stack.json");
			}
			if(!file.exists() || file.canWrite()){
				try {
					FileOutputStream stream = new FileOutputStream(file);
					stream.write(jsonStr.getBytes("utf-8"));
					stream.close();
				} catch (IOException e) {
					e.printStackTrace();
					result = false;
				}
			}
	        
			//xmapStr
			String xmapStr = "";
			xmapStr += "width:" + stack.width + "\n";
			xmapStr += "height:" + stack.height + "\n";
			xmapStr += "convertFromHC:true\n";
			xmapStr += "status:private\n";
			xmapStr += "createdate:"+new Date().toString()+"\n";
			
	        //_stackinfo.xmapを作成
			File xmapfile = new File(new File(stack.path).getParent()+File.separatorChar+"_stackinfo.xmap");
			//System.out.println("! "+xmapfile);

			if(!xmapfile.exists() || xmapfile.canWrite()){
				//System.out.println("1");
				try {
					FileOutputStream stream = new FileOutputStream(xmapfile);
					//System.out.println("2");
					stream.write(xmapStr.getBytes("utf-8"));
					stream.close();
					//System.out.println("3");
				} catch (IOException e) {
					e.printStackTrace();
					result = false;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			result = false;
		}
		return result;
	}
}


