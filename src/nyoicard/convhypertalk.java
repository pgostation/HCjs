package nyoicard;

import java.util.ArrayList;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class convhypertalk {
	private class NestLine {
		ArrayList<Nest> nest;
		String commentStr;
		NestLine(){
			nest = new ArrayList<Nest>();
		}
	}

	private class Nest {
		ArrayList<String> strLst;
		ArrayList<wordType> typeLst;
		Nest(){
			strLst = new ArrayList<String>();
			typeLst = new ArrayList<wordType>();
		}
	}
	
	//HyperTalkの文字列をJavaScriptに変換して返す
	@SuppressWarnings("unchecked")
	public String convertHTStr2JS(String htStr, String xfcnStr){
		String[] scriptAry = htStr.split("\n");
		ArrayList<String>[] stringList = new ArrayList[scriptAry.length];
		ArrayList<wordType>[] typeList = new ArrayList[scriptAry.length];
		StringBuilder handler = new StringBuilder("");
		TreeSet<String> varSet = new TreeSet<String>();
		TreeSet<String> globalSet = new TreeSet<String>();
		
		//行の連結
		for(int i=scriptAry.length-2; i>=0; i--){
			if(scriptAry[i].length()==0) continue;
			char c = scriptAry[i].charAt(scriptAry[i].length()-1);
			if(c=='~' || c=='ﾂ'){
				scriptAry[i] = scriptAry[i].substring(0,scriptAry[i].length()-1) +" "+ scriptAry[i+1];
				for(int j=i+1; j<scriptAry.length-1; j++){
					scriptAry[j] = scriptAry[j+1];
				}
				scriptAry[scriptAry.length-1]="";
			}
		}

		TreeSet<String> xfcnSet = new TreeSet<String>();
		xfcnStr += ",shareddata,htmlutil,httpget,browsercheck,kstealkeyx,kstealkeyx2,uxanswer,uxgetinkey,uxback,addcolor,colorizehc,terazza,terazza2,pgcolorx,getmem,qtmovie,getmonitor,setmonitor";
		String[] xfcnAry = xfcnStr.split(",");
		for(String s:xfcnAry){
			xfcnSet.add(s.toLowerCase());
		}

		for(int i=0; i<scriptAry.length; i++){
			stringList[i] = new ArrayList<String>();
			typeList[i]  = new ArrayList<wordType>();
			checkWordsLine(scriptAry[i], stringList[i], typeList[i]/*, true, true*/,xfcnSet);
			checkWordsLine2(scriptAry[i], stringList[i], typeList[i], /*true,*/ handler, varSet, globalSet, xfcnSet, null);
		}
		
		NestLine nestAry[] = new NestLine[scriptAry.length];
		checkNests(stringList,typeList,varSet,globalSet,nestAry);

		OObject obj = new OObject();
		convscript(nestAry, obj/*, null*/);
		
		StringBuilder jsStr = new StringBuilder();
		for(int i=0; i<obj.javascriptList.size(); i++){
			jsStr.append(obj.javascriptList.get(i));
			jsStr.append("\n");
		}
		
		return jsStr.toString();
	}

	//スタック内のすべてのスクリプトを変換する
	public void HyperTalk2EasyJS(OStack stack){
		convObj(stack, stack); //スタック
		convAllCds(stack.bgCacheList, stack); //各バックグラウンドとそのボタン、フィールド
		convAllCds(stack.cdCacheList, stack); //各カードとそのボタン、フィールド
	}
	
	@SuppressWarnings("rawtypes")
	private void convAllCds(ArrayList cds, OStack stack){
		for(int i=0; i<cds.size(); i++){
			OCardBase cd = (OCardBase)cds.get(i);
			convObj(cd, stack);
			for(int j=0; j<cd.partsList.size(); j++){
				OObject obj = cd.partsList.get(j);
				convObj(obj, stack);
			}
		}
	}

	@SuppressWarnings("unchecked")
	private void convObj(OObject obj, OStack stack){
		String[] scriptAry = obj.scriptList.toArray(new String[0]);
		ArrayList<String>[] stringList = new ArrayList[scriptAry.length];
		ArrayList<wordType>[] typeList = new ArrayList[scriptAry.length];
		StringBuilder handler = new StringBuilder("");
		TreeSet<String> varSet = new TreeSet<String>();
		TreeSet<String> globalSet = new TreeSet<String>();
		
		//行の連結
		for(int i=scriptAry.length-2; i>=0; i--){
			if(scriptAry[i].length()==0) continue;
			char c = scriptAry[i].charAt(scriptAry[i].length()-1);
			if(c=='~' || c=='ﾂ'){
				scriptAry[i] = scriptAry[i].substring(0,scriptAry[i].length()-1) +" "+ scriptAry[i+1];
				for(int j=i+1; j<scriptAry.length-1; j++){
					scriptAry[j] = scriptAry[j+1];
				}
				scriptAry[scriptAry.length-1]="";
			}
		}

		TreeSet<String> xfcnSet = stack.rsrc.getXcmds();

		String xfcnStr = "shareddata,htmlutil,httpget,browsercheck,kstealkeyx,kstealkeyx2,uxanswer,uxgetinkey,uxback,addcolor,colorizehc,terazza,terazza2,pgcolorx,getmem,qtmovie,getmonitor,setmonitor";
		String[] xfcnAry = xfcnStr.split(",");
		for(String s:xfcnAry){
			xfcnSet.add(s.toLowerCase());
		}

		for(int i=0; i<scriptAry.length; i++){
			stringList[i] = new ArrayList<String>();
			typeList[i]  = new ArrayList<wordType>();
			checkWordsLine(scriptAry[i], stringList[i], typeList[i]/*, true, true*/,xfcnSet);
			checkWordsLine2(scriptAry[i], stringList[i], typeList[i], /*true,*/ handler, varSet, globalSet, xfcnSet, null);
		}
		
		NestLine nestAry[] = new NestLine[scriptAry.length];
		checkNests(stringList,typeList,varSet,globalSet,nestAry);

		convscript(nestAry, obj/*, null*/);
		/*TreeSet<String> xfcnSet = new TreeSet<String>();
		for(int i=0; i<stack.rsrc.getRsrcCount("function"); i++){
			Rsrc.rsrcClass r = stack.rsrc.getRsrcByIndex("function",i);
			xfcnSet.add(r.name.toLowerCase());
		}

		//スクリプトを解析する
		String[] scriptAry = obj.scriptList.toArray(new String[0]);

		ArrayList<String>[] stringList = new ArrayList[scriptAry.length];
		ArrayList<wordType>[] typeList = new ArrayList[scriptAry.length];
		TreeSet<String> varSet = new TreeSet<String>();
		TreeSet<String> globalSet = new TreeSet<String>();
		{
			StringBuilder handler = new StringBuilder("");
			
			//行の連結
			for(int i=scriptAry.length-2; i>=0; i--){
				if(scriptAry[i].length()==0) continue;
				char c = scriptAry[i].charAt(scriptAry[i].length()-1);
				if(c=='~' || c=='ﾂ'){
					scriptAry[i] = scriptAry[i].substring(0,scriptAry[i].length()-1) +" "+ scriptAry[i+1];
					scriptAry[i+1] = "";
				}
			}
			
			//全ての行を解析
			for(int i=0; i<scriptAry.length; i++){
				stringList[i] = new ArrayList<String>();
				typeList[i]  = new ArrayList<wordType>();
				checkWordsLine(scriptAry[i], stringList[i], typeList[i],xfcnSet);
				checkWordsLine2(scriptAry[i], stringList[i], typeList[i], handler, varSet, globalSet, xfcnSet, null);//stack);
			}
		}
		
		NestLine nestAry[] = new NestLine[scriptAry.length];
		checkNests(stringList,typeList,varSet,globalSet,nestAry);

		//スクリプトを変換する
		convscript(nestAry, obj);*/
	}

	enum wordType { 
		X, VALUE,
		VARIABLE,
		GLOBAL,
		OBJECT,
		STRING, NUMSTRING,
		CONST,
		CHUNK,
		PROPERTY,
		CMD, CMD_SUB, USER_CMD, XCMD,
		FUNC, USER_FUNC,
		OPERATOR, QUOTE,
		LBRACKET, RBRACKET,
		LFUNC, RFUNC,
		COMMA, COMMA_FUNC,
		OF_FUNC, OF_PROP, OF_OBJ, OF_CHUNK,
		ON_HAND, END_HAND, ON_FUNC/*, END_FUNC*/, EXIT, PASS, RETURN, EXIT_TO_HC,
		IF, ELSE, THEN, ENDIF,
		REPEAT, END_REPEAT, EXIT_REP, NEXT_REP, REPEAT_SUB,
		THE_FUNC,
		COMMENT,
		NOP, OPERATOR_SUB}

	private TreeSet<String> operatorSet; //高速化のためのツリー
	private TreeSet<String> constantSet; //高速化のためのツリー
	private TreeSet<String> commandSet; //
	private TreeSet<String> funcSet; //
	private TreeSet<String> propertySet; //
	
	private TreeSet<String> jsKeyWord; //JavaScript予約語
	
	convhypertalk() {
		operatorSet = new TreeSet<String>();
		operatorSet.add("div");
		operatorSet.add("mod");
		operatorSet.add("not");
		operatorSet.add("and");
		operatorSet.add("or");
		operatorSet.add("contains");
		operatorSet.add("within");
		operatorSet.add("there");
		operatorSet.add("is");
		operatorSet.add("<");
		operatorSet.add(">");

		constantSet = new TreeSet<String>();
		constantSet.add("down");
		constantSet.add("empty");
		constantSet.add("false");
		constantSet.add("formfeed");
		constantSet.add("linefeed");
		constantSet.add("pi");
		constantSet.add("quote");
		constantSet.add("comma");
		constantSet.add("return");
		constantSet.add("space");
		constantSet.add("tab");
		constantSet.add("true");
		constantSet.add("up");
		constantSet.add("zero");
		constantSet.add("one");
		constantSet.add("two");
		constantSet.add("three");
		constantSet.add("four");
		constantSet.add("five");
		constantSet.add("six");
		constantSet.add("seven");
		constantSet.add("eight");
		constantSet.add("nine");
		constantSet.add("carriagereturn");
		
		commandSet = new TreeSet<String>();
		commandSet.add("add");
		commandSet.add("answer");
		commandSet.add("arrowkey");
		commandSet.add("ask");
		commandSet.add("beep");
		commandSet.add("choose");
		commandSet.add("click");
		commandSet.add("close");
		commandSet.add("commandkeydown");
		commandSet.add("controlkey");
		commandSet.add("convert");
		commandSet.add("copy");
		commandSet.add("create");
		commandSet.add("debug");
		commandSet.add("delete");
		commandSet.add("dial");
		commandSet.add("disable");
		commandSet.add("divide");
		commandSet.add("do");
		commandSet.add("domenu");
		commandSet.add("drag");
		commandSet.add("edit");
		commandSet.add("enable");
		commandSet.add("enterinfield");
		commandSet.add("enterkey");
		commandSet.add("export");
		commandSet.add("find");
		commandSet.add("get");
		//commandSet.add("global");//特別扱い
		commandSet.add("go");
		commandSet.add("help");
		commandSet.add("hide");
		commandSet.add("import");
		commandSet.add("keydown");
		commandSet.add("lock");
		commandSet.add("mark");
		commandSet.add("multiply");
		commandSet.add("open");
		commandSet.add("palette"); //xcmdだけど特別扱い
		commandSet.add("picture"); //xcmdだけど特別扱い
		commandSet.add("play");
		commandSet.add("pop");
		commandSet.add("print");
		commandSet.add("push");
		commandSet.add("put");
		commandSet.add("read");
		commandSet.add("reply");
		commandSet.add("request");
		commandSet.add("reset");
		commandSet.add("returninfield");
		commandSet.add("returnkey");
		commandSet.add("save");
		commandSet.add("select");
		commandSet.add("send");
		commandSet.add("set");
		commandSet.add("show");
		commandSet.add("sort");
		commandSet.add("start");
		commandSet.add("stop");
		commandSet.add("subtract");
		commandSet.add("tabkey");
		commandSet.add("type");
		commandSet.add("unlock");
		commandSet.add("unmark");
		commandSet.add("visual");
		commandSet.add("wait");
		commandSet.add("write");
		
		commandSet.add("flash");//add
		//commandSet.add("about");//add

		funcSet = new TreeSet<String>();
		funcSet.add("abs");//
		funcSet.add("annuity");//
		funcSet.add("atan");//
		funcSet.add("average");//
		funcSet.add("chartonum");//
		funcSet.add("clickchunk");
		funcSet.add("clickh");//
		funcSet.add("clickline");//
		funcSet.add("clickloc");//
		funcSet.add("clicktext");
		funcSet.add("clickv");//
		funcSet.add("cmdkey");//
		funcSet.add("commandkey");//
		funcSet.add("compound");//
		funcSet.add("cos");//
		funcSet.add("date");//
		funcSet.add("diskspace");//
		funcSet.add("exp");//
		funcSet.add("exp1");//
		funcSet.add("exp2");//
		funcSet.add("foundchunk");//
		funcSet.add("foundfield");//
		funcSet.add("foundline");//
		funcSet.add("foundtext");//
		funcSet.add("heapspace");//
		funcSet.add("length");//
		funcSet.add("ln");//
		funcSet.add("ln1");//
		funcSet.add("log2");//
		funcSet.add("max");//
		funcSet.add("menus");//
		funcSet.add("min");//
		funcSet.add("mouse");//
		funcSet.add("mouseclick");//
		funcSet.add("mouseh");//
		funcSet.add("mouseloc");//
		funcSet.add("mousev");//
		funcSet.add("number");
		funcSet.add("numtochar");//
		funcSet.add("offset");//
		funcSet.add("optionkey");//
		funcSet.add("param");//
		funcSet.add("paramcount");//
		funcSet.add("params");//
		funcSet.add("programs");
		funcSet.add("random");//
		funcSet.add("result");//
		funcSet.add("round");//
		funcSet.add("screenrect");//
		funcSet.add("seconds");//
		funcSet.add("secs");//
		funcSet.add("selectedbutton");
		funcSet.add("selectedchunk");
		funcSet.add("selectedfield");//
		funcSet.add("selectedline");//
		funcSet.add("selectedloc");
		funcSet.add("selectedtext");//
		funcSet.add("selection");
		funcSet.add("shiftkey");//
		funcSet.add("sin");//
		funcSet.add("sound");//
		funcSet.add("sqrt");//
		funcSet.add("stacks");//
		funcSet.add("stackspace");//
		funcSet.add("sum");//
		funcSet.add("systemversion");//
		funcSet.add("tan");//
		funcSet.add("target");//
		funcSet.add("ticks");//
		funcSet.add("time");//
		funcSet.add("tool");//
		funcSet.add("trunc");//
		funcSet.add("value");//
		funcSet.add("version");//
		funcSet.add("windows");//
		
		//funcSet.add("systemname");//add
		funcSet.add("controlkey");//add
		
		propertySet = new TreeSet<String>();
		propertySet.add("address");
		propertySet.add("autohilite");
		propertySet.add("autoselect");
		propertySet.add("autotab");
		propertySet.add("blindtyping");
		propertySet.add("botright");
		propertySet.add("bottom");//set
		propertySet.add("bottomright");
		propertySet.add("brush");
		propertySet.add("cantabort");//set
		propertySet.add("cantdelete");//set
		propertySet.add("cantmodify");//set
		propertySet.add("cantpeek");//set
		propertySet.add("centered");
		propertySet.add("checkmark");
		propertySet.add("cmdchar");
		propertySet.add("commandchar");
		propertySet.add("cursor");//set
		propertySet.add("debugger");
		propertySet.add("dialingtime");
		propertySet.add("dialingvolume");
		propertySet.add("dontsearch");
		propertySet.add("dontwrap");
		propertySet.add("dragspeed");
		propertySet.add("editbkgnd");
		propertySet.add("enabled");//set
		propertySet.add("environment");
		propertySet.add("family");
		propertySet.add("filled");
		propertySet.add("fixedlineheight");
		propertySet.add("freesize");
		propertySet.add("grid");
		propertySet.add("height");//set
		propertySet.add("highlight");//set
		propertySet.add("hilight");//set
		propertySet.add("hilite");//set
		propertySet.add("highlite");//set
		propertySet.add("icon");//set
		propertySet.add("id");
		propertySet.add("itemdelimiter");//set
		propertySet.add("language");
		propertySet.add("left");//set
		propertySet.add("linesize");
		propertySet.add("loc");//set
		propertySet.add("location");//set
		propertySet.add("lockerrordialogs");//set
		propertySet.add("lockmessages");//set
		propertySet.add("lockrecent");//set
		propertySet.add("lockscreen");//set
		propertySet.add("locktext");
		propertySet.add("longwindowtitles");
		propertySet.add("markchar");
		propertySet.add("marked");
		propertySet.add("menumessage");
		propertySet.add("menumsg");
		propertySet.add("messagewatcher");
		propertySet.add("multiple");
		propertySet.add("multiplelines");
		propertySet.add("multispace");
		propertySet.add("name");//set
		propertySet.add("numberformat");
		propertySet.add("owner");
		propertySet.add("partnumber");
		propertySet.add("pattern");
		propertySet.add("polysides");
		propertySet.add("powerkeys");
		propertySet.add("printmargins");
		propertySet.add("printtextalign");
		propertySet.add("printtextfont");
		propertySet.add("printtextheight");
		propertySet.add("printtextsize");
		propertySet.add("printtextstyle");
		propertySet.add("rect");//set
		propertySet.add("rectangle");//set
		propertySet.add("reporttemplates");
		propertySet.add("right");//set
		propertySet.add("script");//set
		propertySet.add("scripteditor");
		propertySet.add("scriptinglanguage");
		propertySet.add("scripttextfont");//get,set
		propertySet.add("scripttextsize");//get,set
		propertySet.add("scroll");//set
		propertySet.add("selectedline");
		propertySet.add("selectedtext");
		propertySet.add("sharedhilite");
		propertySet.add("sharedtext");
		propertySet.add("showlines");
		propertySet.add("showname");
		propertySet.add("showpict");//set
		propertySet.add("size");
		propertySet.add("soundchannel");
		propertySet.add("stacksinuse");
		propertySet.add("style");
		propertySet.add("suspended");
		propertySet.add("textalign");
		propertySet.add("textarrows");
		propertySet.add("textfont");//set
		propertySet.add("textheight");//set
		propertySet.add("textsize");//set
		propertySet.add("textstyle");//set
		propertySet.add("titlewidth");
		propertySet.add("top");//set
		propertySet.add("topleft");//set
		propertySet.add("tracedelay");
		propertySet.add("userlevel");//set
		propertySet.add("usermodify");
		propertySet.add("variablewatcher");
		propertySet.add("version");
		propertySet.add("visible");//set
		propertySet.add("widemargins");
		propertySet.add("width");//set
		propertySet.add("zoomed");//set

		propertySet.add("text");//(add) set
		//propertySet.add("systemlang");//add get
		//propertySet.add("blendingmode");//add set
		//propertySet.add("blendinglevel");//add set
		//propertySet.add("color");//add set
		//propertySet.add("backcolor");//add set
		propertySet.add("iconscaling");//add set
		propertySet.add("opacity");//add set
		propertySet.add("vertically");//add set
		propertySet.add("shownavigator");//add set
		
		propertySet.add("rate");//movie window
		
		propertySet.add("audiolevel");//xcmd set
		propertySet.add("currtime");//xcmd set
		propertySet.add("scale");//xcmd set

		
		jsKeyWord = new TreeSet<String>();
		jsKeyWord.add("abstract");
		jsKeyWord.add("boolean");
		jsKeyWord.add("break");
		jsKeyWord.add("byte");
		jsKeyWord.add("case");
		jsKeyWord.add("catch");
		jsKeyWord.add("char");
		jsKeyWord.add("class");
		jsKeyWord.add("const");
		jsKeyWord.add("continue");
		jsKeyWord.add("default");
		jsKeyWord.add("do");
		jsKeyWord.add("double");
		jsKeyWord.add("else");
		jsKeyWord.add("enum");
		jsKeyWord.add("extends");
		//jsKeyWord.add("false");
		jsKeyWord.add("final");
		jsKeyWord.add("finally");
		jsKeyWord.add("float");
		jsKeyWord.add("for");
		jsKeyWord.add("function");
		jsKeyWord.add("goto");
		jsKeyWord.add("if");
		jsKeyWord.add("implements");
		jsKeyWord.add("import");
		jsKeyWord.add("in");
		jsKeyWord.add("instanceof");
		jsKeyWord.add("int");
		jsKeyWord.add("interface");
		jsKeyWord.add("long");
		jsKeyWord.add("native");
		jsKeyWord.add("new");
		jsKeyWord.add("null");
		jsKeyWord.add("package");
		jsKeyWord.add("private");
		jsKeyWord.add("protected");
		jsKeyWord.add("prototype");
		jsKeyWord.add("public");
		jsKeyWord.add("return");
		jsKeyWord.add("short");
		jsKeyWord.add("static");
		jsKeyWord.add("super");
		jsKeyWord.add("switch");
		jsKeyWord.add("synchronized");
		jsKeyWord.add("this");
		jsKeyWord.add("throw");
		jsKeyWord.add("throws");
		jsKeyWord.add("transient");
		//jsKeyWord.add("true");
		jsKeyWord.add("try");
		jsKeyWord.add("var");
		jsKeyWord.add("void");
		jsKeyWord.add("while");
		jsKeyWord.add("with");
		
		jsKeyWord.add("eval");//

		jsKeyWord.add("window");//
		jsKeyWord.add("document");//
		jsKeyWord.add("self");//
		jsKeyWord.add("parent");//
		jsKeyWord.add("print");//
	}
	
	private String convPropertyName(String str){
		str = str.intern();
		if(str=="autohilite") return "autoHilite";
		if(str=="autoselect") return "autoSelect";
		if(str=="autotab") return "autoTab";
		if(str=="blindtyping") return "blindTyping";
		if(str=="botright") return "bottomRight";
		if(str=="bottomright") return "bottomRight";
		if(str=="cantabort") return "cantAbort";
		if(str=="cantdelete") return "cantDelete";
		if(str=="cantmodify") return "cantModify";
		if(str=="cantpeek") return "cantPeek";
		if(str=="checkmark") return "checkMark";
		if(str=="cmdchar") return "commandChar";
		if(str=="commandchar") return "commandChar";
		if(str=="dialingtime") return "dialingTime";
		if(str=="dialingvolume") return "dialingVolume";
		if(str=="dontsearch") return "dontSearch";
		if(str=="dontwrap") return "dontWrap";
		if(str=="dragspeed") return "dragSpeed";
		if(str=="editbkgnd") return "editBkgnd";
		if(str=="fixedlineheight") return "fixedLineHeight";
		if(str=="freesize") return "freeSize";
		if(str=="highlight") return "hilite";
		if(str=="hilight") return "hilite";
		if(str=="highlite") return "hilite";
		if(str=="itemdelimiter") return "itemDelimiter";
		if(str=="linesize") return "lineSize";
		if(str=="location") return "loc";
		if(str=="lockerrordialogs") return "lockErrorDialogs";
		if(str=="lockmessages") return "lockMessages";
		if(str=="lockrecent") return "lockRecent";
		if(str=="lockscreen") return "lockScreen";
		if(str=="locktext") return "lockText";
		if(str=="longwindowtitles") return "longWindowTitles";
		if(str=="markchar") return "markChar";
		if(str=="menumessage") return "menuMessage";
		if(str=="menumsg") return "menuMessage";
		if(str=="messagewatcher") return "messageWatcher";
		if(str=="multiplelines") return "multipleLines";
		if(str=="multispace") return "multiSpace";
		if(str=="numberformat") return "numberFormat";
		if(str=="partnumber") return "partNumber";
		if(str=="polysides") return "polySides";
		if(str=="powerkeys") return "powerKeys";
		if(str=="printmargins") return "printMargins";
		if(str=="printtextalign") return "printTextAlign";
		if(str=="printtextfont") return "printTextFont";
		if(str=="printtextheight") return "printTextHeight";
		if(str=="printtextsize") return "printTextSize";
		if(str=="printtextstyle") return "printTextStyle";
		if(str=="rectangle") return "rect";
		if(str=="reporttemplates") return "reportTemplates";
		if(str=="scripteditor") return "scriptEditor";
		if(str=="scriptinglanguage") return "scriptingLanguage";
		if(str=="scripttextfont") return "scriptTextFont";
		if(str=="scripttextsize") return "scriptTextSize";
		if(str=="selectedline") return "selectedLine";
		if(str=="selectedtext") return "selectedText";
		if(str=="sharedhilite") return "sharedHilite";
		if(str=="sharedtext") return "sharedText";
		if(str=="showlines") return "showLines";
		if(str=="showname") return "showName";
		if(str=="showpict") return "showPict";
		if(str=="soundchannel") return "soundChannel";
		if(str=="stacksinuse") return "stacksInUse";
		if(str=="textalign") return "textAlign";
		if(str=="textarrows") return "textArrows";
		if(str=="textfont") return "textFont";
		if(str=="textheight") return "textHeight";
		if(str=="textsize") return "textSize";
		if(str=="textstyle") return "textStyle";
		if(str=="titlewidth") return "titleWidth";
		if(str=="topleft") return "topLeft";
		if(str=="tracedelay") return "traceDelay";
		if(str=="userlevel") return "userLevel";
		if(str=="usermodify") return "userModify";
		if(str=="variablewatcher") return "variableWatcher";
		if(str=="widemargins") return "wideMargins";

		if(str=="systemlang") return "systemLang";
		if(str=="blendingmode") return "blendingMode";
		if(str=="blendinglevel") return "blendingMevel";
		if(str=="backcolor") return "backColor";
		if(str=="iconscaling") return "iconScaling";
		if(str=="shownavigator") return "showNavigator";
		
		return str;
	}

	private void checkWordsLine(String script, ArrayList<String> stringList, ArrayList<wordType> typeList/*, boolean isCmd, boolean isEditor*/,TreeSet<String> xfcnSet)
	{
		StringBuilder str = new StringBuilder(16);
		boolean inFunc = false;
		ArrayList<wordType> Brackets = new ArrayList<wordType>();
		
		//単語分割する。演算子、括弧、コメント、文字列の分別。
		for(int i=0; i<script.length(); i++) {
			char code = script.charAt(i);
			if(!(code>='0'&&code<='9'||code>='a'&&code<='z'||code>='A'&&code<='Z'||code=='_'||code==' '||code=='('||code==')'||code=='\"'||code=='.'||code==',')) {
				//記号の場合
				boolean isComment=false;
				if(code=='-' && i>0 && script.codePointAt(i-1)=='-')
				{
					isComment = true;
				}
				if(isComment){
					//コメント
					typeList.remove(typeList.size()-1);
					stringList.remove(stringList.size()-1);
					//行の終わりまでコメント
					typeList.add(wordType.COMMENT);
					stringList.add(script.substring(i-1));
					break;
				}
				//記号の前までを単語と認識
				if(str.length()>0) {
					if(Character.isDigit(str.charAt(0))||str.charAt(0)=='.') typeList.add(wordType.NUMSTRING);
					else typeList.add(wordType.X);
					stringList.add(str.toString().toLowerCase().intern());
					str.setLength(0);
				}
				if(code=='+' || code=='-' || code=='*' || code=='/' || code=='^' || code=='&'
						|| code=='=' || code=='<' || code=='>' )
				{
					//演算子
					typeList.add(wordType.OPERATOR);
					stringList.add(String.valueOf((char)code).intern());
				}
				else if(code=='≠' || code=='≤' || code=='≥')
				{
					//演算子2
					typeList.add(wordType.OPERATOR);
					typeList.add(wordType.OPERATOR);
					if(code=='≠') stringList.add("!");
					else if(code=='≤') stringList.add("<");
					else if(code=='≥') stringList.add(">");
					stringList.add("=");
				}
				else{
					//不明な記号は文字列扱い
					typeList.add(wordType.STRING);
					stringList.add(String.valueOf((char)code).intern());
					
					/*//不明な記号はコメント扱い
					if(typeList.size()>0){
						typeList.remove(typeList.size()-1);
						stringList.remove(stringList.size()-1);
					}
					//行の終わりまでコメント
					typeList.add(wordType.COMMENT);
					stringList.add("//"+script.substring(i));
					break;*/
				}
			} else if(code=='(') {
				if(str.length()>0 || typeList.size()>0 && typeList.get(typeList.size()-1) == wordType.X) {
					if(str.length()>0){
						if(Character.isDigit(str.charAt(0))||str.charAt(0)=='.') typeList.add(wordType.NUMSTRING);
						else typeList.add(wordType.X);
						stringList.add(str.toString().toLowerCase().intern());
						str.setLength(0);
					}
					String funcstr = stringList.get(stringList.size()-1);
					if(funcstr=="cd" || funcstr=="card" || 
							funcstr=="bg" || funcstr=="bkgnd" ||funcstr=="background" ||
							funcstr=="btn" || funcstr=="button" ||
							funcstr=="fld" || funcstr=="field" ||
							funcstr=="stack"||
							funcstr=="char" || funcstr=="character"||
							funcstr=="item" || funcstr=="word" ||
							funcstr=="line" ||
							funcstr=="window" ||
							funcstr=="menu" || funcstr=="menuitem" ||
							funcstr=="id" ||
							funcstr=="or" || funcstr=="and" || funcstr=="not" ||
							funcstr=="div" || funcstr=="mod" || funcstr=="is" || funcstr=="in" || funcstr=="within" || funcstr=="a" || funcstr=="an" ||
							funcstr=="to" || funcstr=="into" )
					{
						typeList.add(wordType.LBRACKET);
					}
					else if(funcstr=="of" && stringList.size() >= 2 && (
							/*stringList.get(stringList.size()-2).matches("^[0-9]*$") ||
							stringList.get(stringList.size()-2)=="char" ||
							stringList.get(stringList.size()-2)=="character" ||
							stringList.get(stringList.size()-2)=="item" ||
							stringList.get(stringList.size()-2)=="word" ||
							stringList.get(stringList.size()-2)=="line" ||*/
							!funcSet.contains(stringList.get(stringList.size()-2)) &&
							!xfcnSet.contains(stringList.get(stringList.size()-2))) )
					{
						typeList.add(wordType.LBRACKET);
						Brackets.add(wordType.LBRACKET);
						inFunc = false;
					}
					else if(/*isCmd &&*/ stringList.size()==1 || stringList.size()-2>=0 && (stringList.get(typeList.size()-2)=="else" || stringList.get(typeList.size()-2)=="then"))
					{
						//左側がコマンドとして認識される場合
						typeList.add(wordType.LBRACKET);
						Brackets.add(wordType.LBRACKET);
						inFunc = false;
					}
					else {
						typeList.add(wordType.LFUNC);
						Brackets.add(wordType.LFUNC);
						inFunc = true;
					}
					stringList.add("(");
				}
				else {
					typeList.add(wordType.LBRACKET);
					stringList.add("(");
				}
			} else if(code==')') {
				if(str.length()>0) {
					if(Character.isDigit(str.charAt(0))||str.charAt(0)=='.') typeList.add(wordType.NUMSTRING);
					else typeList.add(wordType.X);
					stringList.add(str.toString().toLowerCase().intern());
					str.setLength(0);
				}
				if(Brackets.size()==0 || Brackets.get(Brackets.size()-1)==wordType.LBRACKET){
					typeList.add(wordType.RBRACKET);
					if(Brackets.size()>=1) Brackets.remove(Brackets.size()-1);
				}
				else if(Brackets.get(Brackets.size()-1)==wordType.LFUNC){
					typeList.add(wordType.RFUNC);
					if(Brackets.size()>=1) Brackets.remove(Brackets.size()-1);
				}
				if(Brackets.size()==0 || Brackets.get(Brackets.size()-1)==wordType.LBRACKET){
					inFunc = false;
				}
				else{
					inFunc = true;
				}
				stringList.add(")");
			} else if(code==',') {
				if(str.length()>0) {
					if(Character.isDigit(str.charAt(0))||str.charAt(0)=='.') typeList.add(wordType.NUMSTRING);
					else typeList.add(wordType.X);
					stringList.add(str.toString().toLowerCase().intern());
					str.setLength(0);
				}
				if(inFunc){
					typeList.add(wordType.COMMA_FUNC);//関数の引数指定
				}
				else{
					typeList.add(wordType.COMMA);//loc/rectあるいはglobal、はたまたハンドラの引数
				}
				stringList.add(",");
			} else if(code=='"') {
				if(str.length()>0) {
					typeList.add(wordType.X);
					stringList.add(str.toString().toLowerCase().intern());
					str.setLength(0);
				}
				i++;
				while(i<script.length()) {
					code = script.charAt(i);
					if(code=='"') break;
					str.append(code);
					i++;
				}
				/*if(isEditor){
					typeList.add(wordType.QUOTE);
					stringList.add("\"");
				}*/
				
				typeList.add(wordType.STRING);
				stringList.add(str.toString());
				str.setLength(0);

				/*if(isEditor){
					typeList.add(wordType.QUOTE);
					stringList.add("\"");
				}*/
			} else if (code==' ' || code=='\t') {
				if(str.length()>0) {
					if(Character.isDigit(str.charAt(0))||str.charAt(0)=='.'){
						typeList.add(wordType.NUMSTRING);
						for(int numi=2; numi<str.length(); numi++){
							if( !Character.isDigit(str.charAt(numi)) && str.charAt(numi)!='.'){
								//数値で始まって途中で英字になるのはおかしい
								typeList.remove(typeList.size()-1);
								typeList.add(wordType.NUMSTRING);
								stringList.add(str.substring(0,numi-1).toLowerCase().intern());
								typeList.add(wordType.X);
								str = new StringBuilder(str.substring(numi-1));
								break;
							}
						}
					}
					else typeList.add(wordType.X);
					stringList.add(str.toString().toLowerCase().intern());
					str.setLength(0);
				}
			}
			else if(i==script.length()-1) {
				str.append(code);
				if(str.length()>0) {
					if(Character.isDigit(str.charAt(0))||str.charAt(0)=='.'){
						boolean flag=true;
						for(int j=1; j<str.length(); j++){
							if(!Character.isDigit(str.charAt(j)) && str.charAt(j)!='.'){
								//数値で始まって途中で英字になるのはおかしい
								typeList.add(wordType.NUMSTRING);
								stringList.add(str.substring(0,j));
								typeList.add(wordType.X);
								str = new StringBuilder(str.substring(j));
								flag = false;
								break;
							}
						}
						if(flag){
							typeList.add(wordType.NUMSTRING);
						}
					}
					else typeList.add(wordType.X);
					stringList.add(str.toString().toLowerCase().intern());
					str.setLength(0);
				}
			} else {
				str.append(code);
			}
		}
	}

	private void checkWordsLine2(String script, ArrayList<String> stringList, ArrayList<wordType> typeList, /*boolean isCmd,*/ StringBuilder handler, TreeSet<String> varSet, TreeSet<String> globalSet, TreeSet<String> xfcnSet, OStack stack)
	{
		String command = "";

		//演算子を特定
		for(int i=0; i<typeList.size(); i++){
			wordType theType = typeList.get(i);
			
			if((theType==wordType.X || theType==wordType.OPERATOR) &&
				operatorSet.contains(stringList.get(i)/*.toLowerCase()*/)) {
				if(stringList.get(i)=="div") typeList.set(i,wordType.OPERATOR);
				else if(stringList.get(i)=="mod") typeList.set(i,wordType.OPERATOR);
				else if(stringList.get(i)=="not") typeList.set(i,wordType.OPERATOR);
				else if(stringList.get(i)=="and") typeList.set(i,wordType.OPERATOR);
				else if(stringList.get(i)=="or") typeList.set(i,wordType.OPERATOR);
				else if(stringList.get(i)=="contains") typeList.set(i,wordType.OPERATOR);
				else if(stringList.get(i)=="within") typeList.set(i,wordType.OPERATOR);
				else if(stringList.get(i)=="there") {
					if(i<=typeList.size()-1 && stringList.get(i+1)=="is") {
						if(i<=typeList.size()-2 && (stringList.get(i+2)=="a" || stringList.get(i+2)=="an")) {
							typeList.set(i,wordType.OPERATOR);
							typeList.set(i+1,wordType.OPERATOR_SUB);
							typeList.set(i+2,wordType.OPERATOR_SUB);
						}
						else if(i<=typeList.size()-3 && 0==stringList.get(i+2).compareToIgnoreCase("not")) {
							if(0==stringList.get(i+3).compareToIgnoreCase("a") || 0==stringList.get(i+3).compareToIgnoreCase("an")) {
								typeList.set(i,wordType.OPERATOR);
								typeList.set(i+1,wordType.OPERATOR_SUB);
								typeList.set(i+2,wordType.OPERATOR_SUB);
								typeList.set(i+3,wordType.OPERATOR_SUB);
							}
							//else throw new Exception("there is notの後にa/anが必要です");
						}
						//else throw new Exception("there isの後にa/anが必要です");
					}
				}
				else if(stringList.get(i)=="is") {
					if(i<stringList.size()-1 && (stringList.get(i+1)=="in" || stringList.get(i+1)=="a" || stringList.get(i+1)=="an")) {
						if(i+2<stringList.size() && (stringList.get(i+2)=="then" || stringList.get(i+2)==")")){
							//LUTIA救済策(予備)
							typeList.set(i,wordType.OPERATOR);
							typeList.set(i+1,wordType.VARIABLE);
						}else{
							typeList.set(i,wordType.OPERATOR);
							typeList.set(i+1,wordType.OPERATOR_SUB);
						}
					}
					else if(i<=typeList.size()-2 && stringList.get(i+1)=="not" ) {
						if(0==stringList.get(i+2).compareToIgnoreCase("in") || 0==stringList.get(i+2).compareToIgnoreCase("a") || 0==stringList.get(i+2).compareToIgnoreCase("an")) {
							if(i+3<stringList.size() && (stringList.get(i+3)=="then" || stringList.get(i+3)==")")){
								//LUTIA救済策
								typeList.set(i,wordType.OPERATOR);
								typeList.set(i+1,wordType.OPERATOR_SUB);
								typeList.set(i+2,wordType.VARIABLE);
							}else{
								typeList.set(i,wordType.OPERATOR);
								typeList.set(i+1,wordType.OPERATOR_SUB);
								typeList.set(i+2,wordType.OPERATOR_SUB);
							}
						}
						else { //is not
							typeList.set(i,wordType.OPERATOR);
							typeList.set(i+1,wordType.OPERATOR_SUB);
						}
					}
					else typeList.set(i,wordType.OPERATOR);
				}
				else if(stringList.get(i)=="<") {
					if(i<typeList.size()-1 && (stringList.get(i+1)=="=" || stringList.get(i+1)==">") ) {
						typeList.set(i,wordType.OPERATOR);
						typeList.set(i+1,wordType.OPERATOR_SUB);
					}
				}
				else if(stringList.get(i)==">") {
					if(i<typeList.size()-1 && stringList.get(i+1)=="=" ) {
						typeList.set(i,wordType.OPERATOR);
						typeList.set(i+1,wordType.OPERATOR_SUB);
					}
				}
			}
			/*else if(theType==wordType.LFUNC) {
				if(i>=start+1 && (typeAry[i-1]==wordType.OPERATOR ||
						stringList.get(i-1)=="to"))
					typeAry[i]=wordType.LBRACKET;
			}*/
		}
		
		//各単語の分別
		boolean firstFlag = false;
		int nest=0;
		for(int i=0; i<typeList.size(); i++){
			wordType type = typeList.get(i);
			String str = stringList.get(i);
			if(type==wordType.LBRACKET||type==wordType.LFUNC){
				nest++;
			}
			if(type==wordType.RBRACKET||type==wordType.RFUNC){
				nest--;
			}
			if(type==wordType.X || str=="and" || str=="of"){
				if(i==0 /*&& isCmd*/){
					//行の最初の単語
					if(str=="repeat"){
						typeList.set(i, wordType.REPEAT);
						command = "repeat";
						continue;
					}
					else if(str=="if"){
						typeList.set(i, wordType.IF);
						continue;
					}
					else if(str=="else"){
						typeList.set(i, wordType.ELSE);
						continue;
					}
					else if(str=="end"){
						if(typeList.size()>i+1){
							if(stringList.get(i+1)=="if"){
								typeList.set(i, wordType.ENDIF);
								i++;
								typeList.set(i, wordType.ENDIF);
								continue;
							}
							else if(stringList.get(i+1)=="repeat"){
								typeList.set(i, wordType.END_REPEAT);
								i++;
								typeList.set(i, wordType.END_REPEAT);
								continue;
							}
							else if(stringList.get(i+1).equalsIgnoreCase(handler.toString())){
								typeList.set(i, wordType.END_HAND);
								i++;
								typeList.set(i, wordType.END_HAND);
								varSet.clear();
								handler.delete(0, handler.length());
								continue;
							}
						}
					}
					else if(str=="on"){
						if(typeList.size()>i+1){
							typeList.set(i, wordType.ON_HAND);
							i++;
							typeList.set(i, wordType.ON_HAND);
							handler.append(stringList.get(i));
							continue;
						}
					}
					else if(str=="function"){
						if(typeList.size()>i+1){
							typeList.set(i, wordType.ON_FUNC);
							i++;
							typeList.set(i, wordType.ON_FUNC);
							handler.append(stringList.get(i));
							continue;
						}
					}
				}
				if((i==0 /*&& isCmd*/) || i>=1 && (typeList.get(i-1)==wordType.THEN || typeList.get(i-1)==wordType.ELSE)){
					//コマンドをかけるところの最初の単語
					firstFlag = false;
					/*if(stack!=null && stack.rsrc!=null && stack.rsrc.getxcmdId(str, "command")>0){
						typeList.set(i, wordType.XCMD);
					}
					else*/ if(str=="global"){
						typeList.set(i, wordType.GLOBAL);
						continue;
					}
					else if(xfcnSet.contains(str)){
						typeList.set(i, wordType.XCMD);
						continue;
					}
					else if(commandSet.contains(str)){
						typeList.set(i, wordType.CMD);
						command = str;
						continue;
					}
					else if(str=="return"){
						typeList.set(i, wordType.RETURN);
						continue;
					}
					else if(str=="pass"){
						if(typeList.size()>i+1 && stringList.get(i+1).equalsIgnoreCase(handler.toString())){
							typeList.set(i, wordType.PASS);
							i++;
							typeList.set(i, wordType.PASS);
							continue;
						}
					}
					else if(str=="exit"){
						if(typeList.size()>i+1 && stringList.get(i+1).equalsIgnoreCase(handler.toString())){
							typeList.set(i, wordType.EXIT);
							i++;
							typeList.set(i, wordType.EXIT);
							continue;
						}
						else if(typeList.size()>i+2 && stringList.get(i+1).equalsIgnoreCase("to") && stringList.get(i+2).equalsIgnoreCase("hypercard")){
							typeList.set(i, wordType.EXIT_TO_HC);
							i++;
							typeList.set(i, wordType.EXIT_TO_HC);
							i++;
							typeList.set(i, wordType.EXIT_TO_HC);
							continue;
						}
						else if(typeList.size()>i+1 && stringList.get(i+1).equalsIgnoreCase("repeat")){
							typeList.set(i, wordType.EXIT_REP);
							i++;
							typeList.set(i, wordType.EXIT_REP);
							continue;
						}
					}
					else if(str=="next"){
						if(typeList.size()>i+1 && stringList.get(i+1).equalsIgnoreCase("repeat")){
							typeList.set(i, wordType.NEXT_REP);
							i++;
							typeList.set(i, wordType.NEXT_REP);
							continue;
						}
					}
					else if(str=="if"){
						typeList.set(i, wordType.IF);
						continue;
					}
					else if(str=="else"){
						typeList.set(i, wordType.ELSE);
						continue;
					}
					else if(str=="then"){
						typeList.set(i, wordType.THEN);
						continue;
					}
					else{
						typeList.set(i, wordType.USER_CMD);
					}
				}
				else{
					//コマンドが書けないところ
					if(str=="else"){
						typeList.set(i, wordType.ELSE);
						continue;
					}
					else if(str=="then"){
						typeList.set(i, wordType.THEN);
						continue;
					}
					/*else if(stack!=null && stack.rsrc!=null&&stack.rsrc.getxcmdId(str, "function")>0){
						typeList.set(i, wordType.XFCN);
						continue;
					}*/
					else if(xfcnSet.contains(str)){
						typeList.set(i, wordType.XCMD);
						continue;
					}
					else if(typeList.get(0)==wordType.ON_HAND ||
							typeList.get(0)==wordType.ON_FUNC)
					{
						//引数
						typeList.set(i, wordType.VARIABLE);
						if(jsKeyWord.contains(str)){
							str += "_";
							stringList.set(i, str);
						}
						varSet.add(str);
						continue;
					}
					else if(str=="it" || (i>0 && stringList.get(i-1)!="the")&&(varSet!=null&&(varSet.contains(str)||varSet.contains(str+"_"))))
					{
						typeList.set(i, wordType.VARIABLE);
						continue;
					}
					else if(constantSet.contains(str) && (typeList.get(0)!=wordType.REPEAT||str!="down")){
						typeList.set(i, wordType.CONST);
						continue;
					}
					else if(command=="disable" && (str=="menu" || str=="menuitem" || (str=="of"&&stringList.size()>i+1&&stringList.get(i+1)=="menu"))){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="enable" && (str=="menu" || str=="menuitem" || (str=="of"&&stringList.size()>i+1&&stringList.get(i+1)=="menu"))){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="edit" && (str=="script" || str=="of")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="sort" && str=="of" && (stringList.get(i-1)=="items"||stringList.get(i-1)=="lines")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(str=="of" && i>=1/* && (command!="disable"&&command!="enable"&&command!="edit"&&command!="sort")*/)
					{
						if(typeList.get(i-1)==wordType.OBJECT){
							typeList.set(i, wordType.OF_OBJ);
							continue;
						}
						else if(typeList.get(i-1)==wordType.CHUNK){
							typeList.set(i, wordType.OF_CHUNK);
							continue;
						}
						else if(typeList.get(i-1)==wordType.FUNC){
							typeList.set(i, wordType.OF_FUNC);
							continue;
						}
						else if(typeList.get(i-1)==wordType.PROPERTY){
							typeList.set(i, wordType.OF_PROP);
							continue;
						}
						if(i>=2){
							if(typeList.get(i-2)==wordType.OBJECT){
								typeList.set(i, wordType.OF_OBJ);
								continue;
							}
							else if(typeList.get(i-2)==wordType.CHUNK){
								typeList.set(i, wordType.OF_CHUNK);
								continue;
							}
						}
					}
					else if(typeList.get(0)==wordType.GLOBAL)
					{
						//グローバル変数
						typeList.set(i, wordType.VARIABLE);
						if(jsKeyWord.contains(str)){
							str += "_";
							stringList.set(i, str);
						}
						globalSet.add(str);
						varSet.add(str);
						continue;
					}
					else if(i>=1 && typeList.get(i-1)==wordType.REPEAT && (str=="with" || str=="until" || str=="while" || str=="forever" || str=="for")){
						typeList.set(i, wordType.REPEAT_SUB);
						continue;
					}
					else if(i>=1 && typeList.get(0)==wordType.REPEAT && i==stringList.size()-1 && (str=="times")){
						typeList.set(i, wordType.REPEAT_SUB);
						continue;
					}
					else if(i>=1 && typeList.get(0)==wordType.REPEAT && i<stringList.size()-1 && (str=="down" && stringList.get(i+1)=="to")){
						typeList.set(i, wordType.REPEAT_SUB);
						typeList.set(i+1, wordType.REPEAT_SUB);
						continue;
					}
					else if(i>=1 && typeList.get(0)==wordType.REPEAT && stringList.get(1)=="with" && (str=="to")){
						typeList.set(i, wordType.REPEAT_SUB);
						typeList.set(i+1, wordType.REPEAT_SUB);
						continue;
					}
					else if(i==2 && typeList.get(0)==wordType.REPEAT && stringList.get(1)=="with"){
						typeList.set(i, wordType.VARIABLE);
						if(jsKeyWord.contains(str)){
							str += "_";
							stringList.set(i, str);
						}
						varSet.add(str);
						continue;
					}
					else if(i>=1 && typeList.get(i-1)==wordType.REPEAT && stringList.get(i-1)=="with"){
						//repeat変数
						typeList.set(i, wordType.VARIABLE);
						if(jsKeyWord.contains(str)){
							str += "_";
							stringList.set(i, str);
						}
						varSet.add(str);
						continue;
					}
					else if(command=="put" && (str=="into" || str=="after" || str=="before")){
						typeList.set(i, wordType.CMD_SUB);
						if(i+1==stringList.size()-1 &&
								(stringList.get(i+1)=="cd"||stringList.get(i+1)=="card"||
								stringList.get(i+1)=="bg"||stringList.get(i+1)=="bkgnd"||stringList.get(i+1)=="background"||
								stringList.get(i+1)=="stack"||stringList.get(i+1)=="window")){
							typeList.set(i+1, wordType.VARIABLE); //put 1 into cdとかしたときの対策
						}
						if(i+1==stringList.size()-1){
							if(typeList.get(i+1) == wordType.STRING){
								typeList.set(i+1, wordType.X);
							}
						}
						continue;
					}
					else if(command=="add" && str=="to"){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="subtract" && str=="from"){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="divide" && str=="by"){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="multiply" && str=="by"){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="show" && (str=="at" || str=="cards" || str=="groups")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="hide" && (str=="groups")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="answer" && (str=="with" || str=="or")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="answer" && (stringList.get(i-1)=="answer"&&str=="file")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="answer" && (stringList.get(i-1)=="of" && str=="type")){
						typeList.set(i-1, wordType.CMD_SUB);
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="ask" && (str=="with" || str=="password")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="ask" && (stringList.get(i-1)=="ask"&&str=="file")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="set" && str=="to" && firstFlag==false){
						firstFlag = true;
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="send" && str=="to" && firstFlag==false){
						firstFlag = true;
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="visual" && str=="effect"){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="play" && str=="stop"){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="pop" && (str=="card"||str=="cd")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="push" && (str=="card"||str=="cd")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="drag" && (str=="from" || str=="to" || str=="with")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="click" && (str=="at" || str=="with")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="create" && (str=="menu")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if((command=="lock" || command=="unlock") &&
							(str=="screen" || str=="with" || str=="messages" || str=="recent" || str=="errordialogs")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="wait" && stringList.get(i-1)!="the" && (stringList.size()<=i+1 || stringList.get(i+1)!="(")
							&& (str=="ticks" || str=="seconds" || str=="secs")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="wait" && (str=="until" || str=="while" || str=="tick" || str=="second" || str=="sec")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="wait" && str=="ticks"){
						if(stringList.get(i-1)=="the" || stringList.size()>i+1 && stringList.get(i+1)=="("){
							typeList.set(i, wordType.PROPERTY);
						}
						else{
							typeList.set(i, wordType.CMD_SUB);
						}
						continue;
					}
					else if(command=="convert" && (str=="to" || str=="and")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="convert" && (str=="seconds" || str=="secs")){
						typeList.set(i, wordType.STRING);
						continue;
					}
					else if(command=="close" && (str=="file")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="open" && (str=="file")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="read" && (str=="from" || str=="file" || str=="at" || str=="for" || str=="until")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="write" && (str=="to" || str=="file" || str=="at")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="start" && (str=="using" || str=="stack")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="stop" && (str=="using" || str=="stack")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="go" && stringList.get(i-1)=="go" && str=="to"){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="go" && i>=3 && (str=="in" || str=="a" || str=="new" || str=="window")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="choose" && str=="tool"){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="choose" && (str=="field" || str=="button")){
						typeList.set(i, wordType.STRING);
						continue;
					}
					else if(command=="drag" && (str=="cmdkey" || str=="commandkey" || str=="optionkey" || str=="ctrlkey" || str=="controlkey" || str=="shiftkey")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(i<stringList.size()-1 && (str=="in" && (stringList.get(i+1)=="cd" || stringList.get(i+1)=="card" || stringList.get(i+1)=="bg" || stringList.get(i+1)=="bkgnd"))){
						stringList.set(i, "of");
						typeList.set(i, wordType.OF_OBJ);
						continue;
					}
					else if(command=="select" && (str=="after" || str=="before")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="select" && (str=="char" || str=="item" || str=="word" || str=="line") && nest==0){
						typeList.set(i, wordType.CMD_SUB);
						String str1 = stringList.get(i-1);
						if(str1=="first"||str1=="second"||str1=="third"||str1=="last"){
							stringList.set(i-1,str);
							typeList.set(i-1,wordType.CMD_SUB);
							if(str1=="first"){
								stringList.set(i,"1");
							}
							else if(str1=="second"){
								stringList.set(i,"2");
							}
							else if(str1=="third"){
								stringList.set(i,"3");
							}
							else if(str1=="last"){
								stringList.set(i,"-1");
							}
							typeList.set(i,wordType.NUMSTRING);
						}
						continue;
					}
					else if(command=="edit" && (str=="script")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="delete" && (str=="menu" || str=="from")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="reset" && (str=="menubar" || str=="paint" || str=="printing")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="find" && (str=="string" || str=="chars" || str=="text" || str=="whole" || str=="word" || str=="in")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="sort" && (str=="by" || str=="items" || str=="lines" || str=="ascending" || str=="descending" || str=="text" || str=="numeric" || str=="datetime" || str=="international")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(command=="debug" && (str=="sound"||str=="checkpoint"||str=="hintbits"||str=="maxmem"||str=="purequickdraw"||str=="maxwindows")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if((command=="mark"||command=="unmark") && i+1<stringList.size() && str=="all"){
						typeList.set(i, wordType.CMD_SUB);
						typeList.set(i+1, wordType.CMD_SUB);
						continue;
					}
					else if(command=="do" && (str=="as"||str=="applescript")){
						typeList.set(i, wordType.CMD_SUB);
						continue;
					}
					else if(str=="cd" || str=="card"
						|| str=="bg" || str=="bkgnd" || str=="background"
						|| str=="btn" || str=="button"
						|| str=="fld" || str=="field"
						|| str=="stack"
						|| str=="window"
						|| str=="menu" || str=="menuitem"
						|| str=="menubar" || str=="titlebar" || str=="msg" || str=="message"
						|| str=="hypercard"
						|| str=="me"|| str=="target"
						|| (str=="id" && i+1<stringList.size() && stringList.get(i+1)!="of"))
					{
						typeList.set(i, wordType.OBJECT);
						continue;
					}
					else if(str=="char" || str=="character"
						|| str=="item" || str=="word"
						|| str=="line")
					{
						typeList.set(i, wordType.CHUNK);
						continue;
					}
					else if(i>=1 && typeList.get(i-1)==wordType.CMD_SUB &&
							(command=="put" || command=="add" || command=="subtract" || command=="divide" || command=="multiply") )
					{
						//代入先は変数
						typeList.set(i, wordType.VARIABLE);
						if(jsKeyWord.contains(str)){
							str += "_";
							stringList.set(i, str);
						}
						varSet.add(str);
						continue;
					}
					else if((i==typeList.size()-1||i==typeList.size()-2&&typeList.get(i+1)==wordType.COMMENT) &&
							typeList.get(i-1)==wordType.OF_CHUNK &&
							(command=="put" || command=="add" || command=="subtract" || command=="divide" || command=="multiply") )
					{
						//代入先は変数
						typeList.set(i, wordType.VARIABLE);
						if(jsKeyWord.contains(str)){
							str += "_";
							stringList.set(i, str);
						}
						varSet.add(str);
						continue;
					}
					else if(propertySet.contains(str) ||
							str=="long" || str=="short")
					{
						if((i>=1 && stringList.get(i-1)=="the") ||
								(i>=1 && stringList.get(i-1)=="set") ||
								(i+1<stringList.size() && stringList.get(i+1)=="of"))
						{
							typeList.set(i, wordType.PROPERTY);
							continue;
						}
					}
					if(!varSet.contains(str)&&funcSet.contains(str)){
						if(str=="number" && i+2<stringList.size() && stringList.get(i+1)=="of" &&
								!stringList.get(i+2).matches("s$")){
							//number of xxsは関数だが、そうでない場合はプロパティ
							typeList.set(i, wordType.PROPERTY);
							continue;
						}
						else if(str=="number" && i+3<stringList.size() && stringList.get(i+1)=="of" &&
								(stringList.get(i+2)=="cd"||stringList.get(i+2)=="card"||stringList.get(i+2)=="bg"||stringList.get(i+2)=="bkgnd"||stringList.get(i+2)=="background") &&
								!stringList.get(i+3).matches("s$")){
							//number of xxsは関数だが、そうでない場合はプロパティ
							typeList.set(i, wordType.PROPERTY);
							continue;
						}
						else if(str=="number" && i-1>0 && stringList.get(i-1)=="a"){
							typeList.set(i, wordType.X);
							continue;
						}
						else if(str=="menus" && i-2>0 && stringList.get(i-2)=="number" && stringList.get(i-1)=="of"){
							typeList.set(i, wordType.X);
							continue;
						}
						else if(i-1>0 && typeList.get(i-1)!=wordType.OBJECT){
							typeList.set(i, wordType.FUNC);
							continue;
						}
					}
					else if(i+1<stringList.size() && stringList.get(i)!="of" && typeList.get(i+1)==wordType.LFUNC){
						typeList.set(i, wordType.USER_FUNC);
						continue;
					}
				}
			}
		}

		for(int i=0; i<typeList.size(); i++){
			wordType type = typeList.get(i);
			if(type==wordType.X){
				String str = stringList.get(i);
				if((str=="first"||str=="last"||str=="prev"||str=="previous"||str=="next") && i+1<stringList.size() && typeList.get(i+1)==wordType.OBJECT){
					typeList.set(i, wordType.OBJECT);
				}
				if((str=="first"||str=="last"||str=="middle"||str=="any") && i+1<stringList.size() && typeList.get(i+1)==wordType.CHUNK){
					typeList.set(i, wordType.CHUNK);
				}
			}
		}
		
		for(int i=0; i<typeList.size(); i++){
			wordType type = typeList.get(i);
			if(type==wordType.X){
				String str = stringList.get(i);
				if(str=="the" && i+1<stringList.size() && typeList.get(i+1)==wordType.FUNC && (i+2>=stringList.size() || stringList.get(i+2)!="of")){
					typeList.set(i, wordType.THE_FUNC);
				}
				if(str=="the" && i+1<stringList.size() && typeList.get(i+1)==wordType.PROPERTY){
					typeList.set(i, wordType.PROPERTY);
				}
				if(str=="this" && i+1<stringList.size() && typeList.get(i+1)==wordType.OBJECT){
					typeList.set(i, wordType.OBJECT);
				}
			}
		}
	}

	@SuppressWarnings("unchecked")
	private void checkNests(ArrayList<String>[] stringListA, ArrayList<wordType>[] typeListA, TreeSet<String> varSet, TreeSet<String> globalSet, NestLine[] nestAry){
		//ディープコピー
		ArrayList<String>[] stringListA2 = stringListA.clone();
		for(int i=0; i<stringListA.length; i++){
			stringListA2[i] = (ArrayList<String>) stringListA[i].clone();
		}
		//ディープコピー
		ArrayList<wordType>[] typeListA2 = typeListA.clone();
		for(int i=0; i<typeListA.length; i++){
			typeListA2[i] = (ArrayList<wordType>) typeListA[i].clone();
		}
		
		for(int line=0; line<stringListA2.length; line++){
			try{
				checkNestsLine(stringListA2, typeListA2, varSet, globalSet, nestAry, line);
			}
			catch(Exception e){
				e.printStackTrace();
				System.out.println("Exception:" + e.getMessage() +" line:"+line);
			}
		}
	}

	private void checkNestsLine(ArrayList<String>[] stringListA, ArrayList<wordType>[] typeListA, TreeSet<String> varSet, TreeSet<String> globalSet, NestLine[] nestAry, int line) throws Exception{
		ArrayList<String> stringList = stringListA[line];
		ArrayList<wordType> typeList = typeListA[line];
		NestLine nestLine = nestAry[line] = new NestLine();

		//まず制御構文を分ける。そのelseはどれに対応しているのか？
		//次にコマンドと評価値部分を分ける
		//評価値の中は演算子の優先順位で分ける
		
		//文字列と数値の型
		//ユーザ定義関数は文字列を返すものと思っておく。
		
		if(stringList.size()==0){
			return;
		}

		if(typeList.get(typeList.size()-1)==wordType.COMMENT){
			nestLine.commentStr = "//"+stringList.get(stringList.size()-1).substring(2);
		}
		
		int next = 0;

		wordType firstType = typeList.get(next);
		{
			Nest nest;
			switch(firstType){
			case ON_HAND:
			case ON_FUNC:
				nest = new Nest();
				nest.strLst.add(stringList.get(next+1));
				nest.typeLst.add(firstType);
				next+=2;
				while(typeList.size()>next && typeList.get(next)==wordType.VARIABLE){
					nest.strLst.add(stringList.get(next));
					nest.typeLst.add(wordType.VARIABLE);
					next++;
					if(typeList.size()>next && typeList.get(next)==wordType.COMMA){
						next++;
					}
				}
				nestLine.nest.add(nest);
				return;
			case END_HAND:
				nest = new Nest();
				nest.strLst.add(stringList.get(next+1));
				nest.typeLst.add(wordType.END_HAND);
				nestLine.nest.add(nest);
				next+=2;
				return;
			case GLOBAL:
				nest = new Nest();
				nest.strLst.add(stringList.get(next+1));
				nest.typeLst.add(firstType);
				next++;
				while(typeList.size()>next && typeList.get(next)==wordType.VARIABLE){
					nest.strLst.add(getValue(stringList, typeList, varSet, globalSet, next));
					nest.typeLst.add(wordType.VARIABLE);
					next++;
					if(typeList.size()>next && typeList.get(next)==wordType.COMMA){
						next++;
					}
				}
				nestLine.nest.add(nest);
				return;
			case IF:
				nest = new Nest();
				nest.strLst.add(stringList.get(next)+"_"+line+"_"+next);
				nest.typeLst.add(firstType);
				nestLine.nest.add(nest);
				next+=1;
				break;
			case ELSE:
				//頭に来るelseは3通りのパターン
				//1.前の行の最初にあるif/elseifに続く
				{
					String hint = "";
					int l=line-1;
					ArrayList<wordType> typeBack = typeListA[l];
					int n=0;
					if(typeBack.size()>n && typeBack.get(n)==wordType.IF && typeBack.get(typeBack.size()-1)!=wordType.THEN && (typeBack.get(typeBack.size()-1)!=wordType.COMMENT || typeBack.get(typeBack.size()-2)!=wordType.THEN)){
						hint = "_"+l+"_"+n;
					}
					else if(typeBack.size()>n && typeBack.get(n)==wordType.ELSE){
						if(typeBack.size()>n+1 && typeBack.get(n+1)==wordType.IF){
							hint = "_1";
						}
					}
					if(hint.equals("")){
						//2.1つ前の行の最初にあるthenに続く
						l=line-1;
						if(l>=0){
							typeBack = typeListA[l];
							if(typeBack.size()>0 && typeBack.get(0)==wordType.THEN){
								hint = "_3";
							}
						}
					}
					if(hint.equals("")){
						//3.1つ以上前の最後にあるthen/elseに続く(ネストも考慮する)
						int nesting = 0;
						for(l=line-2; l>=0; l--){
							typeBack = typeListA[l];
							n=typeBack.size()-1;
							if(typeBack.size()>0 && typeBack.get(0)==wordType.ENDIF){
								nesting++;
							}
							if(n>=0 && typeBack.get(n)==wordType.COMMENT){
								n--;
							}
							if(n>=0 && (typeBack.get(n)==wordType.THEN || typeBack.get(n)==wordType.ELSE)){
								if(nesting>0){
									nesting--;
								}
								else{
									hint = "_2";
									break;
								}
							}
						}
					}
					nest = new Nest();
					nest.strLst.add(stringList.get(next)+hint);
					nest.typeLst.add(firstType);
					nestLine.nest.add(nest);
					next++;
				}
				break;
			case THEN:
				//頭に来るthenは1通りのパターン
				//1.前の行の直近のifに続く
				{
					/*String hint = "";
					int l=line-1;
					ArrayList<wordType> typeBack = typeListA[l];
					int n=typeBack.size()-1;
					for(;n>=0;n--){
						if(typeBack.get(n)==wordType.IF){
							hint = "_"+l+"_"+n;
							break;
						}
					}*/
					nest = new Nest();
					nest.strLst.add(stringList.get(next)/*+hint*/);
					nest.typeLst.add(firstType);
					nestLine.nest.add(nest);
					next++;
				}
				break;
			case ENDIF:
				//頭に来るend ifは1通りのパターン
				//1.直近の行の最後にあるthen/elseに続く(ネストも考慮する)
				{
					/*int nesting = 0;
					String hint = "";
					for(int l=line-1; l>=0; l--){
						ArrayList<wordType> typeBack = typeListA[l];
						int n=typeBack.size()-1;
						if(typeBack.size()>0 && typeBack.get(0)==wordType.ENDIF){
							nesting++;
						}
						if(n>=0 && typeBack.get(n)==wordType.COMMENT){
							n--;
						}
						if(n>=0 && typeBack.get(n)==wordType.THEN || typeBack.get(n)==wordType.ELSE){
							if(nesting>0){
								nesting--;
							}
							else{
								hint = "_"+l+"_"+n;
								break;
							}
						}
					}*/
					nest = new Nest();
					nest.strLst.add(stringList.get(next)/*+hint*/);
					nest.typeLst.add(firstType);
					nestLine.nest.add(nest);
					next+=2;
				}
				return;
			case REPEAT:
				nest = new Nest();
				nest.strLst.add(stringList.get(next)+"_"+line);
				nest.typeLst.add(firstType);
				nestLine.nest.add(nest);
				next+=1;
				break;
			case COMMENT:
				return;
			default:
				break;
			}
		}

		if(stringList.size()<=next){
			return;
		}

		//制御構文をある程度片したので、残りはif,else,repeat,コマンド、そしてそれらに使う評価値(演算子/文字列/変数/関数/プロパティ/オブジェクト)
		//評価値は入れ子になるので関数にする
		//コマンドもif文の場合に一行に複数になるので関数にする

		int end = stringList.size()-1;
		if(typeList.get(typeList.size()-1)==wordType.COMMENT) end--;

		//文途中のif,else,then
		if(firstType==wordType.IF || firstType==wordType.ELSE || firstType==wordType.THEN)
		{
			Nest nest;
			boolean valueFlag = false;
			if(firstType==wordType.IF){
				valueFlag = true;
			}
			int i = next;
			for(;next<=end+1;next++){
				wordType nextType=null;
				if(next<=end) nextType = typeList.get(next);
				//直前までの式をネスト構造に入れる
				if(next==end+1 || nextType==wordType.IF || nextType==wordType.ELSE || nextType==wordType.THEN){
					if(i<next){
						if(valueFlag){
							String valueStr = checkValueNest(i, next-1, stringList, typeList, varSet, globalSet);
							nest = new Nest();
							nest.strLst.add(valueStr);
							nest.typeLst.add(wordType.X);
							nestLine.nest.add(nest);
							i = next+1;
						}
						else{
							checkCmdNest(i, next-1, stringListA, typeListA, varSet, globalSet, nestLine, line);
							i = next+1;
						}
					}
				}
				if(next<=end){
					//if/else/thenをネスト構造に入れる
					switch(nextType){
					case IF:
						if(i==next){
							i++;
						}
						nest = new Nest();
						nest.strLst.add(stringList.get(next)+"_"+line+"_"+next);
						nest.typeLst.add(nextType);
						nestLine.nest.add(nest);
						valueFlag = true;
						break;
					case ELSE:
					case THEN:
						/*String hint = "";
						for(int n=next-1; n>=0; n--){
							if(typeList.get(n)==wordType.IF){
								hint = "_"+line+"_"+n;
							}
						}*/
						nest = new Nest();
						nest.strLst.add(stringList.get(next)/*+hint*/);
						nest.typeLst.add(nextType);
						nestLine.nest.add(nest);
						valueFlag = false;
						break;
					default:
						break;
					}
				}
			}
		}
		else if(firstType==wordType.REPEAT){
			//(forever)
			//* (times)
			//with * = * (down) to *
			//until,while
			
			//これらの単語に挟まれた部分をネスト構造に入れる
			int i = next;
			Nest nest = new Nest();
			for(;next<=end+1;next++){
				wordType nextType=null;
				if(next<end+1){
					nextType = typeList.get(next);
					if(stringList.get(1)=="with" && stringList.get(next)=="="){
						nextType=wordType.REPEAT_SUB; //repeat withの = は特別
					}
					if(stringList.get(1)=="with" && next==2){
						nest.strLst.add(stringList.get(next));
						nest.typeLst.add(wordType.VARIABLE);
						continue;
					}
				}
				if(next==end+1 || (nextType==wordType.REPEAT_SUB && stringList.get(next)!="(")){
					if(i<next){
						String valueStr = checkValueNest(i, next-1, stringList, typeList, varSet, globalSet);
						nest.strLst.add(valueStr);
						nest.typeLst.add(wordType.X);
					}
					if(next<end){
						nest.strLst.add(stringList.get(next));
						nest.typeLst.add(nextType);
						i = next+1;
					}
				}
			}
			nestLine.nest.add(nest);
		}
		else {
			checkCmdNest(0, end, stringListA, typeListA, varSet, globalSet, nestLine, line);
		}
	}
	
	private void checkCmdNest(int start, int end, ArrayList<String>[] stringListA, ArrayList<wordType>[] typeListA,
			TreeSet<String> varSet, TreeSet<String> globalSet, NestLine nestLine, int line) throws Exception{
		ArrayList<String> stringList = stringListA[line];
		ArrayList<wordType> typeList = typeListA[line];
		int next = start;

		if(next>=typeList.size()) return;
		
		//System.out.println("checkCmdNest:"+stringList.get(next));
		
		//コマンド系
		{
			wordType cmdType = typeList.get(next);
			Nest nest;
			switch(cmdType){
			case CMD:
				//CMD_SUBで切り離して、各部分をネストに入れる
				nest = new Nest();
				nest.strLst.add(stringList.get(next));
				nest.typeLst.add(cmdType);
				if(stringList.get(next)=="set" && stringList.get(next+1)=="the"){
					next++;
				}
				next++;
				int i = next;
				for(;next<=end+1;next++){
					wordType nextType=null;
					if(next<end+1){
						nextType = typeList.get(next);
					}
					if(next==end+1 || nextType==wordType.CMD_SUB){
						if(i<next){
							String valueStr = checkValueNest(i, next-1, stringList, typeList, varSet, globalSet);
							nest.strLst.add(valueStr);
							nest.typeLst.add(wordType.X);
						}
						if(next<=end){
							nest.strLst.add(stringList.get(next));
							nest.typeLst.add(nextType);
							i = next+1;
						}
					}
				}
				nestLine.nest.add(nest);
				return;
			case USER_CMD:
			case XCMD:
				//COMMAで切り離して、各部分をネストに入れる
				nest = new Nest();
				String cmdStr = stringList.get(next);
				if(jsKeyWord.contains(cmdStr)){
					cmdStr += "_";
				}
				nest.strLst.add(cmdStr);
				nest.typeLst.add(cmdType);
				next++;
				int j = next;
				int nesting = 0;
				for(;next<=end+1;next++){
					wordType nextType=null;
					if(next<end+1){
						nextType = typeList.get(next);
					}
					if(nextType==wordType.LFUNC || nextType==wordType.LBRACKET){
						nesting++;
					}
					if(nextType==wordType.RFUNC || nextType==wordType.RBRACKET){
						nesting--;
					}
					if(next==end+1 || nesting==0&&(nextType==wordType.COMMA || nextType==wordType.COMMA_FUNC)){
						if(j<next){
							String valueStr = checkValueNest(j, next-1, stringList, typeList, varSet, globalSet);
							nest.strLst.add(valueStr);
							nest.typeLst.add(wordType.X);
						}
						if(next<end){
							nest.strLst.add(stringList.get(next));
							nest.typeLst.add(nextType);
							j = next+1;
						}
					}
				}
				nestLine.nest.add(nest);
				return;
			case END_REPEAT:
			case EXIT_REP:
			case NEXT_REP:
				{
					//直前のrepeatを探す(ネストを考慮)
					/*int nesting = 0;
					String hint = "";
					for(int l=line-1; l>=0; l--){
						ArrayList<wordType> typeBack = typeListA[l];
						if(typeBack.size()>0 && typeBack.get(0)==wordType.END_REPEAT){
							nesting++;
						}
						if(typeBack.size()>0 && typeBack.get(0)==wordType.REPEAT){
							if(nesting>0){
								nesting--;
							}
							else{
								hint = "_"+l;
								break;
							}
						}
					}*/
					nest = new Nest();
					nest.strLst.add(stringList.get(next)/*+hint*/);
					nest.typeLst.add(cmdType);
					nestLine.nest.add(nest);
					next+=2;
				}
				return;
			case EXIT:
			case PASS:
				nest = new Nest();
				nest.strLst.add(stringList.get(next+1));
				nest.typeLst.add(cmdType);
				nestLine.nest.add(nest);
				next+=2;
				return;
			case RETURN:
				nest = new Nest();
				nest.strLst.add(stringList.get(next));
				nest.typeLst.add(cmdType);
				next+=1;
				if(next<=end)
				{
					String valueStr = checkValueNest(next, end, stringList, typeList, varSet, globalSet);
					nest.strLst.add(valueStr);
					nest.typeLst.add(wordType.X);
					next = end+1;
				}
				nestLine.nest.add(nest);
				return;
			case EXIT_TO_HC:
				nest = new Nest();
				nest.strLst.add(stringList.get(next));
				nest.typeLst.add(cmdType);
				nestLine.nest.add(nest);
				next+=3;
				return;
			default:
				nest = new Nest();
				String str = "";
				for(;next<=end;next++){
					str += stringList.get(next);
				}
				nest.strLst.add(str);
				nest.typeLst.add(wordType.COMMENT);
				nestLine.nest.add(nest);
				return;
			}
		}
	}

	private String checkValueNest(int start, int end, ArrayList<String> stringList, ArrayList<wordType> typeList, TreeSet<String> varSet, TreeSet<String> globalSet) throws Exception{
		return checkValueNest(start,end,stringList,typeList,varSet,globalSet,false);
	}

	private String checkValueNest(int start, int end, ArrayList<String> stringList, ArrayList<wordType> typeList, TreeSet<String> varSet, TreeSet<String> globalSet, boolean isFunc) throws Exception{
		//((演算子の優先順位でネストに入れる))
		//ここはHyperZebraの考え方で作ってるので、stringListとtypeListを破壊していく。

		/*for(int i=start; i<=end; i++){
			if("value"==stringList.get(i)){
				System.out.println("value");
			}
		}*/
		
		/*if(typeList.get(start)==wordType.LFUNC&&typeList.get(end)==wordType.RFUNC){
			typeList.set(start,wordType.LBRACKET);
			typeList.set(end,wordType.RBRACKET);
		}*/
		/*if(stringList.get(start)=="(" && stringList.get(end-1)==")"){
			start++;
			end--;
		}*/

		for(int i=start; i<=end-1; i++){
			if(typeList.get(i+1)==wordType.CHUNK||typeList.get(i+1)==wordType.OBJECT){
				String str = stringList.get(i);
				if(str=="first"||str=="second"||str=="third"||str=="last"){
					if(stringList.get(i+1)=="cd"||stringList.get(i+1)=="card"){
						continue;
					}
					wordType type = typeList.get(i+1);
					stringList.set(i,stringList.get(i+1));
					typeList.set(i+1,wordType.NUMSTRING);
					if(str=="first"){
						stringList.set(i+1,"1");
					}else if(str=="second"){
						stringList.set(i+1,"2");
					}else if(str=="third"){
						stringList.set(i+1,"3");
					}else if(str=="last"){
						typeList.set(i+1,wordType.STRING);
						stringList.set(i+1,"last");
					}
					typeList.set(i,type);
					if(i-1>=start && stringList.get(i-1)=="the"){
						stringList.set(i-1,"");
						typeList.set(i-1,wordType.NOP);
					}
				}
			}
		}

		//1.括弧
		//括弧付きでの関数コール
		for(int i=start; i<=end; i++){
			if(typeList.get(i)==wordType.LBRACKET){
				int nesting = 0;
				for(int j=i+1; j<=end; j++){
					if(typeList.get(j)==wordType.LBRACKET || typeList.get(j)==wordType.LFUNC){
						nesting++;
					}
					else if(typeList.get(j)==wordType.RBRACKET || typeList.get(j)==wordType.RFUNC){
						if(nesting>0){
							nesting--;
						}
						else{
							String valStr = checkValueNest(i+1, j-1, stringList, typeList, varSet, globalSet);
							stringList.set(i,"("+valStr+")");
							typeList.set(i,wordType.VALUE);
							for(int k=i+1;k<=j;k++){
								typeList.set(k,wordType.NOP);
							}
							break;
						}
					}
				}
			}
			else if(typeList.get(i)==wordType.LFUNC){
				int nesting = 0;
				for(int j=i+1; j<=end; j++){
					if(typeList.get(j)==wordType.LBRACKET || typeList.get(j)==wordType.LFUNC){
						nesting++;
					}
					else if(typeList.get(j)==wordType.RBRACKET || typeList.get(j)==wordType.RFUNC){
						if(nesting>0){
							nesting--;
						}
						else{
							String valStr = "";
							if(i+1<=j-1){
								valStr = checkValueNest(i+1, j-1, stringList, typeList, varSet, globalSet, true);
							}
							String funcStr = stringList.get(i-1);
							boolean systemFunc = false;
							if(i-1>=start && stringList.get(i-1)=="of"){
								systemFunc = true;
								i--;
								funcStr = stringList.get(i-1);
								if(i-2>=start && stringList.get(i-2)=="the"){
									i--;
								}
							}
							if(systemFunc || funcSet.contains(funcStr)){
								stringList.set(i-1,CallSystemFunction(funcStr,valStr.split(",")));
							}
							else{
								//ユーザ関数,XFCN
								if(jsKeyWord.contains(funcStr)){
									funcStr += "_";
								}
								if(valStr.length()>0){
									while(valStr.charAt(valStr.length()-1)==','){
										valStr = valStr.substring(0,valStr.length()-1);
									}
									while(valStr.indexOf(",,")!=-1){
										valStr = valStr.replace(",,",",\"\",");
									}
									if(typeList.get(i-1)==wordType.XCMD){
										stringList.set(i-1,funcStr+"("+valStr+")");
									}else{
										stringList.set(i-1,"callFunc(\""+funcStr+"\","+valStr+")");
									}
								}else{
									if(typeList.get(i-1)==wordType.XCMD){
										stringList.set(i-1,funcStr+"()");
									}else{
										stringList.set(i-1,"callFunc(\""+funcStr+"\")");
									}
								}
							}
							typeList.set(i-1,wordType.VALUE);
							for(int k=i;k<=j;k++){
								typeList.set(k,wordType.NOP);
							}
							break;
						}
					}
				}
			}
		}
		
		//(HyperTalk定数
		for(int i=start; i<=end; i++){
			if(typeList.get(i)==wordType.CONST){
				String str = stringList.get(i);
				if(0==str.compareTo("down")) {
					stringList.set(i,"down");
					typeList.set(i,wordType.STRING);
				}
				else if(0==str.compareTo("empty")) {
					stringList.set(i,"");
					typeList.set(i,wordType.STRING);
				}
				else if(0==str.compareTo("false")) {
					stringList.set(i,"false");
					typeList.set(i,wordType.VARIABLE);
				}
				else if(0==str.compareTo("formfeed")) {
					stringList.set(i,"formfeed");
					typeList.set(i,wordType.VARIABLE);
				}
				else if(0==str.compareTo("carriagereturn")) { //追加
					stringList.set(i,"carriagereturn");
					typeList.set(i,wordType.VARIABLE);
				}
				else if(0==str.compareTo("linefeed")) {
					stringList.set(i,"linefeed");
					typeList.set(i,wordType.VARIABLE);
				}
				else if(0==str.compareTo("pi")) {
					stringList.set(i,"Math.PI");
					typeList.set(i,wordType.VARIABLE);
				}
				else if(0==str.compareTo("quote")) {
					stringList.set(i,"quote");
					typeList.set(i,wordType.VARIABLE);
				}
				else if(0==str.compareTo("return")) { //改行コードを変更
					stringList.set(i,"\\n");
					typeList.set(i,wordType.STRING);
				}
				else if(0==str.compareTo("space")) {
					stringList.set(i," ");
					typeList.set(i,wordType.STRING);
				}
				else if(0==str.compareTo("tab")) {
					stringList.set(i,"\t");
					typeList.set(i,wordType.STRING);
				}
				else if(0==str.compareTo("comma")) {
					stringList.set(i,",");
					typeList.set(i,wordType.STRING);
				}
				else if(0==str.compareTo("true")) {
					stringList.set(i,"true");
					typeList.set(i,wordType.VARIABLE);
				}
				else if(0==str.compareTo("up")) {
					stringList.set(i,"up");
					typeList.set(i,wordType.STRING);
				}
				else if(0==str.compareTo("zero")) {
					stringList.set(i,"0");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("one")) {
					stringList.set(i,"1");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("two")) {
					stringList.set(i,"2");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("three")) {
					stringList.set(i,"3");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("four")) {
					stringList.set(i,"4");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("five")) {
					stringList.set(i,"5");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("six")) {
					stringList.set(i,"6");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("seven")) {
					stringList.set(i,"7");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("eight")) {
					stringList.set(i,"8");
					typeList.set(i,wordType.NUMSTRING);
				}
				else if(0==str.compareTo("nine")) {
					stringList.set(i,"9");
					typeList.set(i,wordType.NUMSTRING);
				}
			}
		}
		
		//変数
		for(int i=start; i<=end; i++){
			if(typeList.get(i)==wordType.VARIABLE){
				if(globalSet.contains(stringList.get(i))||globalSet.contains(stringList.get(i)+"_")){
					String str = stringList.get(i);
					if(jsKeyWord.contains(str)){
						str += "_";
					}
					stringList.set(i,"global."+str);
				}
				else{
					stringList.set(i,/*"vmVar."+*/stringList.get(i));
				}
				typeList.set(i,wordType.VALUE);
			}
		}

		//プロパティ
		for(int i=end; i>=start; i--){ //後ろから見る
			if(typeList.get(i)==wordType.PROPERTY){
				if(stringList.get(i)=="the" && 
					(
						(i+1<=end && 0!=stringList.get(i+1).compareToIgnoreCase("target")) &&
						(i+2>end || 0!=stringList.get(i+2).compareToIgnoreCase("of")) &&
						(
							(
								(0==stringList.get(i+1).compareToIgnoreCase("short") ||
								0==stringList.get(i+1).compareToIgnoreCase("long")) &&
								(i+3>end || 0!=stringList.get(i+3).compareToIgnoreCase("of"))
							)||
							(
								(0!=stringList.get(i+1).compareToIgnoreCase("short") &&
								0!=stringList.get(i+1).compareToIgnoreCase("long")) &&
								(i+3>end || 0!=stringList.get(i+3).compareToIgnoreCase("of"))
							)
						)
					))
				{
					if(i>end-1) throw new Exception("theの後にプロパティ名がありません");
					String str=stringList.get(i+1);
					if(str.equalsIgnoreCase("short") || str.equalsIgnoreCase("long")){
						str += stringList.get(i+2);
						typeList.set(i+2,wordType.NOP);
					}
					stringList.set(i,CallSystemFunction(str,null));
					typeList.set(i,wordType.VALUE);
					typeList.set(i+1,wordType.NOP);
				}
				else if(i<=end-1 && stringList.get(i+1)=="of" && (typeList.get(i+1)==wordType.X || typeList.get(i+1)==wordType.CHUNK || typeList.get(i+1)==wordType.OBJECT || typeList.get(i+1)==wordType.OF_PROP) &&
						/*stringList.get(i)!="number" &&*/ stringList.get(i)!="chars" &&
						stringList.get(i)!="characters" && stringList.get(i)!="items"&&
						stringList.get(i)!="words" && stringList.get(i)!="lines" &&
						stringList.get(i)!="menus" && stringList.get(i)!="menuitems" &&stringList.get(i)!="windows" &&
						stringList.get(i)!="cds" && stringList.get(i)!="cards" &&
						stringList.get(i)!="bgs" && stringList.get(i)!="bkgnds" && stringList.get(i)!="backgrounds" &&
						stringList.get(i)!="btns" && stringList.get(i)!="buttons" &&
						stringList.get(i)!="flds" && stringList.get(i)!="fields" &&
						(i+3>=stringList.size() || stringList.get(i+3)!="btns" && stringList.get(i+3)!="buttons" &&
						stringList.get(i+3)!="flds" && stringList.get(i+3)!="fields") &&
						(stringList.get(i)=="textstyle" || stringList.get(i)!="char" && stringList.get(i)!="character" &&
						stringList.get(i)!="item" && stringList.get(i)!="word" &&
						stringList.get(i)!="line")
						) 
				{
					if(i+1>end-1) throw new Exception("ofの後にオブジェクト名がありません");
					String str=stringList.get(i);
					if(stringList.get(i)=="textstyle"){
						int k;
						for(k=i+2; k<=end; k++) {
							if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.OBJECT && typeList.get(k)!=wordType.X && typeList.get(k)!=wordType.CHUNK && typeList.get(k)!=wordType.OF_CHUNK)
							{
								k--;
								break;
							}
						}
						if(k>end) k=end;
						String value = checkValueNest(i+2, k, stringList, typeList, varSet, globalSet);
						
						if(i>start && 0==stringList.get(i-1).compareToIgnoreCase("the")){
							i--;
						}
						
						if(value.matches(".*\\.text.*")){
							value = value.replace(".text",".textstyle");
							stringList.set(i,value);
						}else{
							stringList.set(i,value+".textstyle");
						}
						typeList.set(i,wordType.VALUE);
						for(int j=i+1; j<=k && j<=end; j++){
							typeList.set(j,wordType.NOP);
						}
					}
					else{
						ObjResult objres=null;
						try{objres = getObjectfromList(stringList, typeList, i+2, varSet, globalSet);}
						catch(Exception e){}
						if(objres!=null && objres.obj!=null){
							int offset = 0;
							if(i>start && (0==stringList.get(i-1).compareToIgnoreCase("short") || 0==stringList.get(i-1).compareToIgnoreCase("long"))){
								str = stringList.get(i-1)+str;
								i--;
								offset++;
							}
							if(i>start && 0==stringList.get(i-1).compareToIgnoreCase("the")){
								i--;
								offset++;
							}
							stringList.set(i,objres.obj+"."+convPropertyName(str));
							typeList.set(i,wordType.VALUE);
							for(int j=i+1; j<=i+1+offset+objres.cnt && j<=end; j++){
								typeList.set(j,wordType.NOP);
							}
						}
					}
				}
			}
		}

		//theでコールする関数
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.THE_FUNC) {
				if(i>end-1) throw new Exception("theの後に関数名がありません");
				String str=stringList.get(i+1);
				stringList.set(i,CallSystemFunction(str,null));
				typeList.set(i,wordType.VALUE);
				typeList.set(i+1,wordType.NOP);
			}
		}
		
		//チャンク式
		//チャンク式2(any,last)
		for(int i=end; i>=start; i--) {
			if(typeList.get(i)==wordType.CHUNK) {
				String str=stringList.get(i);
				if(str=="char" || str=="character" ||
					str=="item" || str=="word" ||
					str=="line" )
				{
					if(i-1>=start &&
						(
						0==stringList.get(i-1).compareTo("any") || 
						0==stringList.get(i-1).compareTo("last") ||
						0==stringList.get(i-1).compareTo("first")
						))
					{
						//any,first,last
						int k;
						for(k=i+2; k<=end; k++) {
							if(typeList.get(k)==wordType.X && typeList.get(k-1)==wordType.OBJECT){
								continue;
							}
							if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.OF_CHUNK && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.CHUNK && typeList.get(k)!=wordType.OBJECT /*&& typeList.get(k)!=wordType.X*/)
							{
								k--;
								break;
							}
						}
						if(k>end) k=end;
						String value = checkValueNest(i+2, k, stringList, typeList, varSet, globalSet);
						if(0==stringList.get(i-1).compareTo("last")){
							stringList.set(i-1,getChunk(str, "\"last\"", "", value));
						}else if(0==stringList.get(i-1).compareTo("first")){
							stringList.set(i-1,getChunk(str, "1", "", value));
						}else if(0==stringList.get(i-1).compareTo("any")){
							stringList.set(i-1,getChunk(str, "\"any\"", "", value));
						}

						if(i-2>=start && stringList.get(i-2)=="the"){
							stringList.set(i-2,stringList.get(i-1));
							i--;
						}

						typeList.set(i-1,wordType.VALUE);
						for(int m=i; m<=k; m++) {
							typeList.set(m,wordType.NOP);
						}
					}
					else{
						//any,first,last以外
						String chunkStart="";
						String chunkEnd=null;
						int j;
						for(j=i+2; j<end; j++) {
							if(typeList.get(j)==wordType.NOP) continue;
							String str2=stringList.get(j);
							if(0==str2.compareToIgnoreCase("to")) {
								chunkStart = checkValueNest(i+1, j-1, stringList, typeList, varSet, globalSet);
								for(int k=j+1; k<end; k++) {
									str2=stringList.get(k);
									if(0==str2.compareToIgnoreCase("of")&&typeList.get(k)!=wordType.NOP) {
										chunkEnd = checkValueNest(j+1, k-1, stringList, typeList, varSet, globalSet);
										j=k;
										break;
									}
								}
								break;
							}
							else if(0==str2.compareToIgnoreCase("of")) {
								chunkStart = checkValueNest(i+1, j-1, stringList, typeList, varSet, globalSet);
								break;
							}
						}
						int k;
						for(k=j+2; k<=end; k++) {
							if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.X && typeList.get(k)!=wordType.OBJECT && typeList.get(k)!=wordType.OF_OBJ)
							{
								k--;
								break;
							}
						}
						if(k>end) k=end;
						if(j+1>end) j=end-1;
						if(j<=i) break;//####
						String value = checkValueNest(j+1, k, stringList, typeList, varSet, globalSet);
						stringList.set(i,getChunk(str, chunkStart, chunkEnd, value));
						typeList.set(i,wordType.VALUE);
						for(int m=i+1; m<=k; m++) {
							typeList.set(m,wordType.NOP);
						}
					}
				}
			}
		}

		//チャンク式3(number of xxxs)
		for(int i=end; i>=start+2; i--) {
			if(typeList.get(i)==wordType.X) {
				String str=stringList.get(i);
				if(str=="chars" || str=="characters" ||
					str=="items" || str=="words" ||
					str=="lines" )
				{
					if(0==stringList.get(i-1).compareToIgnoreCase("of")&&
						0==stringList.get(i-2).compareToIgnoreCase("number") &&
						i+1<=end && 
						(0==stringList.get(i+1).compareToIgnoreCase("of") ||
						0==stringList.get(i+1).compareToIgnoreCase("in")))
					{
						int k;
						for(k=i+2; k<=end; k++) {
							if(typeList.get(k)==wordType.X && typeList.get(k-1)==wordType.OBJECT){
								continue;
							}
							if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.OF_OBJ && typeList.get(k)!=wordType.OF_CHUNK && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.CHUNK && typeList.get(k)!=wordType.OBJECT /*&& typeList.get(k)!=wordType.X*/)
							{
								k--;
								break;
							}
						}
						if(k>end) k=end;
						String value = checkValueNest(i+2, k, stringList, typeList, varSet, globalSet);
						if(i-3>=start && stringList.get(i-3).equalsIgnoreCase("the")){
							i--;
						}
						stringList.set(i-2,"system.numberOf"+str.substring(0,1).toUpperCase() + str.substring(1)+"("+value+")");
						typeList.set(i-2,wordType.VALUE);
						for(int m=i-1; m<=k; m++) {
							typeList.set(m,wordType.NOP);
						}
					}
				}
				else if(str=="btns" || str=="buttons" ||
					str=="flds" || str=="fields" ||
					str=="cds" || str=="cards" ||
					str=="bgs" || str=="bkgnds" || str=="backgrounds" ||
					str=="menus" || str=="menuitems" || str=="windows")
				{
					int offset = 0;
					String optStr = "";
					//boolean bg_flag = false;
					if(0==stringList.get(i-1).compareToIgnoreCase("cd") || 0==stringList.get(i-1).compareToIgnoreCase("card")){
						offset = 1;
						optStr = "Cd";
					}
					else if(0==stringList.get(i-1).compareToIgnoreCase("bg")||0==stringList.get(i-1).compareToIgnoreCase("bkgnd")||0==stringList.get(i-1).compareToIgnoreCase("background"))
					{
						//bg_flag = true;
						offset = 1;
						optStr = "Bg";
					}
					if(i-2-offset>=start&&
						0==stringList.get(i-1-offset).compareToIgnoreCase("of")&&
						0==stringList.get(i-2-offset).compareToIgnoreCase("number"))
					{
						//parent
						//OObject parent = PCARD.pc.stack.curCard;
						String parent = "thisCard()";
						if(optStr.equals("Bg") || optStr.equals("")&&(str.equals("fields")||str.equals("flds"))){
							parent = "thisBg()";
						}
						if(str=="cds"||str=="cards"||
							str=="bgs"||str=="bkgnds"||str=="backgrounds"||
							str=="menus"||str=="menuitems"||str=="windows"
						){
							parent = "system";
						}
						int endoff = 0;
						if(stringList.size()>i+1-offset && 
							(
								0==stringList.get(i+1-offset).compareToIgnoreCase("of") ||
								0==stringList.get(i+1-offset).compareToIgnoreCase("in")
							))
						{
							ObjResult oResult = getObjectfromList(stringList, typeList, (i+1-offset)+1, varSet, globalSet);
							parent = oResult.obj;
							endoff = oResult.cnt+1;
						}
						{
							if(str=="cds") str="cards";
							if(str=="bkgnds"||str=="backgrounds") str="bgs";
							if(str=="buttons") str="btns";
							if(str=="fields") str="flds";
							str = Character.toUpperCase(str.charAt(0)) + str.substring(1);
							stringList.set(i-2-offset,parent+".numberOf"+str+"()");
							typeList.set(i-2-offset,wordType.VALUE);
							for(int m=i-2-offset+1; m<=i+endoff; m++) {
								typeList.set(m,wordType.NOP);
							}
						}
					}
				}
			}
		}
		
		//ofでコールする関数(number of **s)
		for(int i=end; i>=start; i--) {
			if(typeList.get(i)==wordType.FUNC) {
				// ofを使用したnumber of/関数呼び出し
				char c = ' ';
				if(i+2<=end){
					c = stringList.get(i+2).charAt(stringList.get(i+2).length()-1);
				}
				if(stringList.get(i)=="number" &&
					stringList.get(i+1)=="of" &&
					(c=='s' || c=='S') && (i+2>end || stringList.get(i+2)!="chars" &&
							stringList.get(i+2)!="characters" && stringList.get(i+2)!="items" && stringList.get(i+2)!="words" && stringList.get(i+2)!="lines")
					){
					//number of xxxs
					ObjResult objres2=null;
					int next=i+2;
					if(i+4>end-1){
						objres2 = new ObjResult();
						objres2.obj = "thisCard()";
						objres2.cnt = 0;
					}
					else {
						next=i+3;
						if(0!=stringList.get(next).compareToIgnoreCase("of") && 0!=stringList.get(next).compareToIgnoreCase("in")) next++;
						objres2 = getObjectfromList(stringList, typeList, next+1, varSet, globalSet);
						if(objres2.obj==null){
							objres2.obj = "thisCard()";
							objres2.cnt = 0;
							next = i+2;
						}
					}
					String str=stringList.get(i+2);
					if(str=="cd" || str=="card" || str=="bg" || str=="bkgnd" || str=="background"){
						str+= Character.toUpperCase(stringList.get(i+3).charAt(0)) + stringList.get(i+3).substring(1);
					}
					str = Character.toUpperCase(str.charAt(0)) + str.substring(1);
					stringList.set(i,objres2.obj+".numberOf"+str);
					typeList.set(i,wordType.VALUE);
					int cnt=0;
					if(objres2!=null) cnt += objres2.cnt;
					for(int j=i+1; j<=next+cnt && j<=end; j++){
						typeList.set(j,wordType.NOP);
					}
				}
				else if(end>=i+2 && 
						stringList.get(i)!="number" &&
						stringList.get(i)!="char"&&stringList.get(i)!="character"&&
						stringList.get(i)!="item"&&stringList.get(i)!="word"&&
						stringList.get(i)!="line"&&
						stringList.get(i)!="short"&&
						stringList.get(i)!="long"){
					//関数呼び出し
					String[] paramAry = new String[1];
					paramAry[0] = stringList.get(i+2);
					String funcres = CallSystemFunction(stringList.get(i), paramAry);
					int offset=0;
					if(funcres!=null && funcres!=null) {
						if(i-1 >= start && stringList.get(i-1).equalsIgnoreCase("the")){
							i--;
							offset++;
						}
						stringList.set(i,funcres);
						typeList.set(i,wordType.VALUE);
					}
					else throw new Exception("この関数が分かりません");
					for(int j=i+1; j<=i+2+offset && j<=end; j++){
						typeList.set(j,wordType.NOP);
					}
				}
			}
		}

		//2a.there is a
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				if(stringList.get(i)=="there" &&
						i+1 <= end && typeList.get(i+1)==wordType.OPERATOR_SUB &&
						0==stringList.get(i+1).compareToIgnoreCase("is") &&
						i+2 <= end && typeList.get(i+2)==wordType.OPERATOR_SUB &&
						0==stringList.get(i+2).compareToIgnoreCase("a") )
				{
					int j=i;
					ObjResult objres=null;
					try{objres = getObjectfromList(stringList, typeList, i+3, varSet, globalSet);} catch(Exception e){}
					if(objres!=null && objres.obj!=null){
						stringList.set(j,objres.obj+"!=null");
						typeList.set(j,wordType.VALUE);
						for(int k=j+1;k<j+3+objres.cnt; k++){
							typeList.set(k,wordType.NOP);
						}
					}
					else{
						throw new Exception("there is aで指定されているオブジェクトが分かりません");
					}
				}
				else if(stringList.get(i)=="there" &&
						i+1 <= end && typeList.get(i+1)==wordType.OPERATOR_SUB &&
						0==stringList.get(i+1).compareToIgnoreCase("is") &&
						i+2 <= end && typeList.get(i+2)==wordType.OPERATOR_SUB &&
						0==stringList.get(i+2).compareToIgnoreCase("not") &&
						i+3 <= end && typeList.get(i+3)==wordType.OPERATOR_SUB &&
						0==stringList.get(i+3).compareToIgnoreCase("a") )
				{
					int j=i;
					ObjResult objres=null;
					try{objres = getObjectfromList(stringList, typeList, i+4, varSet, globalSet);} catch(Exception e){}
					if(objres!=null && objres.obj!=null){
						stringList.set(j,objres.obj+"==null");
						typeList.set(j,wordType.VALUE);
						for(int k=j+1;k<j+4+objres.cnt; k++){
							typeList.set(k,wordType.NOP);
						}
					}else{
						throw new Exception("there is not aで指定されているオブジェクトが分かりません");
					}
				}
			}
		}

		//コンテナ
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OBJECT && (i<=end-1 && (typeList.get(i+1)==wordType.X || typeList.get(i+1)==wordType.STRING || typeList.get(i+1)==wordType.NUMSTRING || typeList.get(i+1)==wordType.OBJECT || typeList.get(i+1)==wordType.OF_OBJ || typeList.get(i+1)==wordType.VALUE) ||
					stringList.get(i)=="me" ||
					stringList.get(i)=="target" ||
					stringList.get(i)=="msg" ||
					stringList.get(i)=="message" ||
					stringList.get(i)=="target")) {
				ObjResult objres=null;
				objres = getObjectfromList(stringList, typeList, i, varSet, globalSet);
				if(objres!=null && objres.obj!=null){
					if(i+1 <= end && stringList.get(i).equalsIgnoreCase("the") && stringList.get(i+1).equalsIgnoreCase("target") ){
						//targetの場合はオブジェクト名
						stringList.set(i,objres.obj+".text");
						typeList.set(i,wordType.VALUE);
						for(int j=i+1; j<i+objres.cnt && j<=end; j++){
							typeList.set(j,wordType.NOP);
						}
					}
					else {
						stringList.set(i,objres.obj+".text");
						typeList.set(i,wordType.VALUE);
						for(int j=i+1; j<i+objres.cnt && j<=end; j++){
							typeList.set(j,wordType.NOP);
						}
					}
				}
			}
		}

		//2b.負の記号(withinはここじゃない？)
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				if(stringList.get(i)=="-") {
					if(i==start || typeList.get(i-1)==wordType.OPERATOR || typeList.get(i-1)==wordType.OPERATOR_SUB || typeList.get(i-1)==wordType.COMMA){
						stringList.set(i,"-"+getValue(stringList,typeList, varSet, globalSet, i+1));
						typeList.set(i,wordType.VALUE);
						typeList.set(i+1,wordType.NOP);
					}
				}
				else if(stringList.get(i)=="not") {
					stringList.set(i,"!"+getValue(stringList,typeList, varSet, globalSet, i+1));
					typeList.set(i,wordType.VALUE);
					typeList.set(i+1,wordType.NOP);
				}
			}
		}

		//3.べき乗
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				if(stringList.get(i)=="^") {
					for(int j=i-1;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							stringList.set(j,"Math.pow("+getValue(stringList,typeList, varSet,globalSet,j)+","+getValue(stringList,typeList, varSet, globalSet, i+1)+")");
							typeList.set(j,wordType.VALUE);
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
							break;
						}
					}
				}
			}
		}

		//4.数の乗除
		//5.数の加減
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				String opeStr = stringList.get(i);
				if(opeStr=="*" || opeStr=="/" || opeStr=="mod" ||
						opeStr=="+" || opeStr=="-")
				{
					if(opeStr=="mod"){
						opeStr = "%";
					}
					int j=i-1;
					for(;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							if(opeStr=="+"){
								stringList.set(j,"(+"+getValue(stringList,typeList, varSet,globalSet,j)+")"+opeStr+"(+"+getValue(stringList,typeList, varSet, globalSet, i+1)+")");
							}
							else{
								stringList.set(j,getValue(stringList,typeList, varSet,globalSet,j)+opeStr+getValue(stringList,typeList, varSet, globalSet, i+1));
							}
							typeList.set(j,wordType.VALUE);
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
							break;
						}
					}
					//同じスコープ内に文字列の結合があれば、括弧を付ける
					for(int k=start; k<=end; k++){
						if(typeList.get(k)==wordType.OPERATOR && (stringList.get(k)=="&"||stringList.get(k)=="&&")) {
							stringList.set(j,"("+stringList.get(j)+")");
							break;
						}
					}
				}
				else if(opeStr=="div") {
					for(int j=i-1;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							stringList.set(j,"("+getValue(stringList,typeList, varSet,globalSet,j)+"/"+getValue(stringList,typeList, varSet, globalSet, i+1)+"|0)");
							typeList.set(j,wordType.VALUE);
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
							break;
						}
					}
				}
			}
		}

		//6..テキストの連結
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				if(stringList.get(i)=="&" || stringList.get(i)=="&&")
				{
					String opeStr = stringList.get(i);
					if(opeStr=="&"){
						opeStr = "+";
						if(typeList.get(i+1)==wordType.OPERATOR && stringList.get(i+1)=="&"){
							opeStr = "+\" \"+";
							stringList.set(i+1,stringList.get(i+2));
							typeList.set(i+1,typeList.get(i+2));
							typeList.set(i+2,wordType.NOP);
						}
					}
					for(int j=i-1;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							stringList.set(j,getValue(stringList,typeList, varSet,globalSet,j)+opeStr+getValue(stringList,typeList, varSet, globalSet, i+1));
							typeList.set(j,wordType.VALUE);
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
							break;
						}
					}
				}
			}
		}

		//within
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				if(stringList.get(i)=="is" &&
						i+1 <= end && typeList.get(i+1)==wordType.OPERATOR &&
						stringList.get(i+1)=="within" )
				{
					int j=i-1;
					for(;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							stringList.set(j,"point("+getValue(stringList,typeList, varSet,globalSet,j)+").within("+getValue(stringList,typeList, varSet, globalSet, i+2)+")");
							typeList.set(j,wordType.VALUE);
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
							typeList.set(i+2,wordType.NOP);
							break;
						}
					}
				}
				else if(stringList.get(i)=="is" &&
						i+1 <= end && typeList.get(i+1)==wordType.OPERATOR_SUB &&
						0==stringList.get(i+1).compareToIgnoreCase("not")&&
						i+2 <= end && typeList.get(i+2)==wordType.OPERATOR &&
						0==stringList.get(i+2).compareToIgnoreCase("within") )
				{
					int j=i-1;
					for(;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP && (j-1<start || typeList.get(j-1)==wordType.OPERATOR)){
							stringList.set(j,"!point("+getValue(stringList,typeList, varSet,globalSet,j)+").within("+getValue(stringList,typeList, varSet, globalSet, i+3)+")");
							typeList.set(j,wordType.VALUE);
							for(int k=j+1; k<i; k++){
								typeList.set(k,wordType.NOP);
							}
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
							typeList.set(i+2,wordType.NOP);
							typeList.set(i+3,wordType.NOP);
							break;
						}
					}
				}
			}
		}
		
		//7.数またはテキストの比較
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				String opr = stringList.get(i);
				if( opr=="<" ||
					opr==">" ||
					opr=="≤" ||
					opr=="≥" ) {
					if(i>end-1) {
						throw new Exception("比較演算子が不正です");
					}
					//String str1="";
					int j=i-1;
					for(;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
							break;
						}
					}
					if(typeList.get(i+1)==wordType.OPERATOR_SUB) {
						if(i+1>end-1) throw new Exception("比較演算子が不正です");
						if(opr=="<"&&stringList.get(i+1)==">") continue;
						opr = opr+stringList.get(i+1);
						typeList.set(i,wordType.NOP);
						i++;
					}
					//String str2 = Evalution(stringList, typeAry, i+1, i+1, memData, object, target);
					{
						stringList.set(j,getValue(stringList,typeList, varSet,globalSet,j)+opr+getValue(stringList,typeList, varSet, globalSet, i+1));
						typeList.set(j,wordType.VALUE);
						typeList.set(i,wordType.NOP);
						typeList.set(i+1,wordType.NOP);
					}
				}
				else if( opr=="is" ) {
					if(i>end-1) continue;
					if( 0==stringList.get(i+1).compareToIgnoreCase("in") ) {
						if(i+1>end-1) throw new Exception("is in演算子が不正です");
						//String str1="";
						int j=i-1;
						for(;j>=start;j--){
							if(typeList.get(j)!=wordType.NOP){
								//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
								break;
							}
						}
						//String str2 = Evalution(stringList, typeAry, i+2, i+2, memData, object, target);
						//Boolean value=false;
						//value=str2.toLowerCase().contains(str1.toLowerCase());
						stringList.set(j,getValue(stringList,typeList, varSet,globalSet,i+2)+".indexOf("+getValue(stringList,typeList, varSet, globalSet, j)+")>=0");
						typeList.set(j,wordType.VALUE);
						typeList.set(i,wordType.NOP);
						typeList.set(i+1,wordType.NOP);
						typeList.set(i+2,wordType.NOP);
					}
					else if( typeList.get(i+1) != wordType.STRING && typeList.get(i+1) != wordType.VALUE &&
							(0==stringList.get(i+1).compareToIgnoreCase("a") ||
								0==stringList.get(i+1).compareToIgnoreCase("an") ||
								0==stringList.get(i+1).compareToIgnoreCase("number") ||
								0==stringList.get(i+1).compareToIgnoreCase("integer") ||
								0==stringList.get(i+1).compareToIgnoreCase("point") ||
								0==stringList.get(i+1).compareToIgnoreCase("rect") || 0==stringList.get(i+1).compareToIgnoreCase("rectangle") ||
								0==stringList.get(i+1).compareToIgnoreCase("date") ||
								0==stringList.get(i+1).compareToIgnoreCase("logical")) ) {
						//is a
						int m = i+1;
						if(0==stringList.get(i+1).compareToIgnoreCase("a")||0==stringList.get(i+1).compareToIgnoreCase("an")){
							m = i+2;
						}
						if(m>end) throw new Exception("is a演算子が不正です");
						//String str1="";
						int j=i-1;
						for(;j>=start;j--){
							if(typeList.get(j)!=wordType.NOP){
								//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
								break;
							}
						}
						//boolean value = false;
						if(stringList.get(m).equalsIgnoreCase("number")){
							//value = str1.matches("^[-]{0,1}[0-9]{1,99}[\\.]{0,1}[0-9]{0,99}$");
							stringList.set(j,getValue(stringList,typeList, varSet, globalSet, j)+".match(/^(-|)[0-9]*[\\.]{0,1}[0-9]*$/)");
						}
						else if(stringList.get(m).equalsIgnoreCase("integer")){
							//value = str1.matches("^[-]{0,1}[0-9]{1,99}$");
							stringList.set(j,getValue(stringList,typeList, varSet, globalSet, j)+".match(/^(-|)[0-9]+$/)");
						}
						else if(stringList.get(m).equalsIgnoreCase("point")){
							//value = str1.matches("^[-]{0,1}[0-9]{1,99},[-]{0,1}[0-9]{1,99}$");
							stringList.set(j,getValue(stringList,typeList, varSet, globalSet, j)+".match(/^(-|)[.0-9]+,(-|)[.0-9]+$/)");
						}
						else if(stringList.get(m).equalsIgnoreCase("rect")||stringList.get(m).equalsIgnoreCase("rectangle")){
							//value = str1.matches("^[-]{0,1}[0-9]{1,99},[-]{0,1}[0-9]{1,99},[-]{0,1}[0-9]{1,99},[-]{0,1}[0-9]{1,99}$");
							stringList.set(j,getValue(stringList,typeList, varSet, globalSet, j)+".match(/^(-|)[.0-9]+,(-|)[.0-9]+,(-|)[.0-9]+,(-|)[.0-9]+$/)");
						}
						else if(stringList.get(m).equalsIgnoreCase("date")){
							//value = true;//**
							stringList.set(j,getValue(stringList,typeList, varSet, globalSet, j)+".hasOwnProperty(\"getTime\")");
						}
						else if(stringList.get(m).equalsIgnoreCase("logical")){
							//value = (str1.equalsIgnoreCase("true")||str1.equalsIgnoreCase("false"));
							stringList.set(j,"typeof("+getValue(stringList,typeList, varSet, globalSet, j)+")==\"boolean\"");
						}
						else throw new Exception(stringList.get(m)+"をis a演算子に使えません");
						typeList.set(j,wordType.VALUE);
						typeList.set(i,wordType.NOP);
						typeList.set(i+1,wordType.NOP);
						typeList.set(i+2,wordType.NOP);
					}
					else if( 0==stringList.get(i+1).compareToIgnoreCase("not") ) {
						if(i>end-2) continue;
						if( 0==stringList.get(i+2).compareToIgnoreCase("in") ) {
							if(i+2>end-1) throw new Exception("is not in演算子が不正です");
							//String str1="";
							int j=i-1;
							for(;j>=start;j--){
								if(typeList.get(j)!=wordType.NOP){
									//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
									break;
								}
							}
							stringList.set(j,getValue(stringList,typeList, varSet,globalSet,i+3)+".indexOf("+getValue(stringList,typeList, varSet, globalSet, j)+")==-1");
							typeList.set(j,wordType.VALUE);
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
							typeList.set(i+2,wordType.NOP);
							typeList.set(i+3,wordType.NOP);
						}else{
							if(i>end-2) continue;
							if( typeList.get(i+2) == wordType.OPERATOR_SUB &&(
								0==stringList.get(i+2).compareToIgnoreCase("a") ||
								0==stringList.get(i+2).compareToIgnoreCase("an")) ) {
								//is not a/an
								if(i+2>end) throw new Exception("is not a演算子が不正です");
								//String str1="";
								int j=i-1;
								for(;j>=start;j--){
									if(typeList.get(j)!=wordType.NOP){
										//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
										break;
									}
								}
								//boolean value = false;
								if(stringList.get(i+3).equalsIgnoreCase("number")){
									//value = str1.matches("^[-]{0,1}[0-9]{1,99}[\\.]{0,1}[0-9]{0,99}$");
									stringList.set(j,"typeof("+getValue(stringList,typeList, varSet, globalSet, j)+")!=\"number\"");
								}
								else if(stringList.get(i+3).equalsIgnoreCase("integer")){
									//value = str1.matches("^[-]{0,1}[0-9]{1,99}$");
									stringList.set(j,"!"+getValue(stringList,typeList, varSet, globalSet, j)+".match(/(-|)[0-9]$/)");
								}
								else if(stringList.get(i+3).equalsIgnoreCase("point")){
									//value = str1.matches("^[-]{0,1}[0-9]{1,99},[-]{0,1}[0-9]{1,99}$");
									stringList.set(j,"!"+getValue(stringList,typeList, varSet, globalSet, j)+".match(/^(-|)[.0-9]+,(-|)[.0-9]+$/)");
								}
								else if(stringList.get(i+3).equalsIgnoreCase("rect")||stringList.get(i+2).equalsIgnoreCase("rectangle")){
									//value = str1.matches("^[-]{0,1}[0-9]{1,99},[-]{0,1}[0-9]{1,99},[-]{0,1}[0-9]{1,99},[-]{0,1}[0-9]{1,99}$");
									stringList.set(j,"!"+getValue(stringList,typeList, varSet, globalSet, j)+".match(/^(-|)[.0-9]+,(-|)[.0-9]+,(-|)[.0-9]+,(-|)[.0-9]+$/)");
								}
								else if(stringList.get(i+3).equalsIgnoreCase("date")){
									//value = true;//**
									stringList.set(j,"!"+getValue(stringList,typeList, varSet, globalSet, j)+".hasOwnProperty(\"getTime\")");
								}
								else if(stringList.get(i+3).equalsIgnoreCase("logical")){
									//value = (str1.equalsIgnoreCase("true")||str1.equalsIgnoreCase("false"));
									stringList.set(j,"typeof("+getValue(stringList,typeList, varSet, globalSet, j)+")!=\"boolean\"");
								}
								else throw new Exception(stringList.get(i+3)+"をis not a演算子に使えません");
								typeList.set(j,wordType.VALUE);
								typeList.set(i,wordType.NOP);
								typeList.set(i+1,wordType.NOP);
								typeList.set(i+2,wordType.NOP);
								typeList.set(i+3,wordType.NOP);
							}
						}
					}
				}
				else if( opr=="contains" ) {
					if(i+1>end) throw new Exception("contains演算子が不正です");
					//String str1="";
					int j=i-1;
					for(;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
							break;
						}
					}
					//String str2 = Evalution(stringList, typeAry, i+1, i+1, memData, object, target);
					//Boolean value=false;
					//value=str1.toLowerCase().contains(str2.toLowerCase());
					stringList.set(j,getValue(stringList,typeList, varSet,globalSet,j)+".indexOf("+getValue(stringList,typeList, varSet, globalSet, i+1)+")>=0");
					typeList.set(j,wordType.VALUE);
					typeList.set(i,wordType.NOP);
					typeList.set(i+1,wordType.NOP);
				}
			}
		}

		//8.数またはテキストの比較
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				String opr = stringList.get(i);
				if( opr=="≠" ) {
					if(i>end-1) throw new Exception("比較演算子が不正です");
					//String str1="";
					int j=i-1;
					for(;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
							break;
						}	
					}
					/*String str2 = Evalution(stringList, typeAry, i+1, i+1, memData, object, target);
					Boolean value=false;
					try {
						value=Double.valueOf(str1) != Double.valueOf(str2);
					}catch (Exception err){
						value=(0!=str1.compareToIgnoreCase(str2));
					}
					value=(0!=str1.compareToIgnoreCase(str2));*/
					stringList.set(j,getValue(stringList,typeList, varSet,globalSet,j)+"!="+getValue(stringList,typeList, varSet, globalSet, i+1));
					typeList.set(j,wordType.VALUE);
					typeList.set(i,wordType.NOP);
					typeList.set(i+1,wordType.NOP);
				}
				else if( opr=="is" && 
					stringList.get(i+1)=="not" ||
					opr=="<" && 
					stringList.get(i+1)==">" )
				{
					if(i+1>end-1) throw new Exception("比較演算子が不正です");
					//String str1="";
					int j=i-1;
					for(;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
							break;
						}	
					}
					//String str2 = Evalution(stringList, typeAry, i+2, i+2, memData, object, target);
					//Boolean value=false;
					/*try {
						value=(0!=Double.compare(Double.valueOf(str1), Double.valueOf(str2)));
					}catch (Exception err){
						value=(0!=str1.compareToIgnoreCase(str2));
					}*/
					stringList.set(j,"("+getValue(stringList,typeList, varSet,globalSet,j)+"+\"\").toLowerCase()!=("+getValue(stringList,typeList, varSet, globalSet, i+2)+"+\"\").toLowerCase()");
					typeList.set(j,wordType.VALUE);
					typeList.set(i,wordType.NOP);
					typeList.set(i+1,wordType.NOP);
					typeList.set(i+2,wordType.NOP);
				}
				else if( opr=="=" ||
						opr=="is" ) {
					if(i>end-1) {
						for(int j=0; j<=end; j++) {
							System.out.println(j+":"+stringList.get(j));
						}
						throw new Exception("比較演算子が不正です");
					}
					//String str1="";
					int j=i-1;
					for(;j>=start;j--){
						if(typeList.get(j)!=wordType.NOP){
							//str1 = Evalution(stringList, typeAry, j, j, memData, object, target);
							break;
						}
					}
					//String str2 = Evalution(stringList, typeAry, i+1, i+1, memData, object, target);
					{
						/*Boolean value=false;
						try {
							value=(0==Double.compare(Double.valueOf(str1), Double.valueOf(str2)));
						}catch (Exception err){
							value=(0==str1.compareToIgnoreCase(str2));
						}*/
						String strA1 = getValue(stringList,typeList, varSet, globalSet, j);
						if(!Character.isDigit(strA1.charAt(0))) strA1 = "("+strA1+"+\"\").toLowerCase()";
						String strA2 = getValue(stringList,typeList, varSet, globalSet, i+1);
						if(!Character.isDigit(strA2.charAt(0))) strA2 = "("+strA2+"+\"\").toLowerCase()";
						stringList.set(j,strA1+"=="+strA2);
						typeList.set(j,wordType.VALUE);
						typeList.set(i,wordType.NOP);
						typeList.set(i+1,wordType.NOP);
					}
				}
			}
		}

		//9.and演算子
		//10.or演算子
		for(int i=start; i<=end; i++) {
			if(typeList.get(i)==wordType.OPERATOR) {
				if(stringList.get(i)=="and" || stringList.get(i)=="or") {
					String ope=null;
					if(stringList.get(i)=="and") ope=" && ";
					else if(stringList.get(i)=="or") ope=" || ";
					for(int j=i-1;j>=start;j--){
						/*if(typeList.get(j)!=wordType.NOP){
							stringList.set(j,getValue(stringList,typeList, varSet,globalSet,j)+ope+getValue(stringList,typeList, varSet, globalSet, i+1));
							typeList.set(j,wordType.VALUE);
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
							break;
						}*/
						if(typeList.get(j)!=wordType.NOP && (j-1<start || typeList.get(j-1)==wordType.OPERATOR)){
							stringList.set(j,getValue(stringList,typeList, varSet,globalSet,j)+ope+getValue(stringList,typeList, varSet, globalSet, i+1));
							typeList.set(j,wordType.VALUE);
							for(int k=j+1; k<i; k++){
								typeList.set(k,wordType.NOP);
							}
							typeList.set(i,wordType.NOP);
							typeList.set(i+1,wordType.NOP);
						}
					}
				}
			}
		}

		//コンマ
		for(int i=start+1; i<=end-1; i++) {
			if(typeList.get(i)==wordType.COMMA || typeList.get(i)==wordType.COMMA_FUNC) {
				for(int j=i-1;j>=start;j--){
					if(typeList.get(j)!=wordType.NOP){
						String leftVal = getValue(stringList,typeList, varSet, globalSet, j);
						String rightVal = getValue(stringList,typeList, varSet, globalSet, i+1);
						if(leftVal==","){
							leftVal = ",\"\"";
						}
						if(rightVal==","){
							rightVal = "\"\",";
						}
						stringList.set(j,leftVal+","+rightVal);
						typeList.set(j,wordType.VALUE);
						typeList.set(i,wordType.NOP);
						typeList.set(i+1,wordType.NOP);
						break;
					}
				}
			}
		}

		//文字列を連結
		for(int i=start+1; i<=end; i++) {
			if(typeList.get(i)!=wordType.NOP){
				if((typeList.get(start)==wordType.STRING || typeList.get(start)==wordType.X) &&
					(typeList.get(i)==wordType.STRING || typeList.get(i)==wordType.X))
				{
					stringList.set(start, stringList.get(start)+" "+stringList.get(i));
				}
				else if(typeList.get(start)==wordType.STRING && typeList.get(i)==wordType.VALUE){
					stringList.set(start, "\""+stringList.get(start)+"\"+"+stringList.get(i));
					typeList.set(start,wordType.VALUE);
				}
				else if(typeList.get(start)==wordType.VALUE && typeList.get(i)==wordType.STRING){
					stringList.set(start, stringList.get(start)+"+\""+stringList.get(i)+"\"");
					typeList.set(start,wordType.VALUE);
				}
				else{
					stringList.set(start, stringList.get(start)+" "+stringList.get(i));
				}
			}
		}

		//System.out.println("ret:"+stringList.get(start)+"  type:"+typeList.get(start));
		
		return getValue(stringList,typeList, varSet, globalSet, start);
	}

	private String CallSystemFunction(String funcName, String[] args){
		String str = null;
		
		if(funcName=="trunc"){
			str = "system.trunc(";
		}
		else if(funcName=="abs"){
			str = "Math.abs(";
		}
		else if(funcName=="acos"){
			str = "Math.acos(";
		}
		else if(funcName=="asin"){
			str = "Math.asin(";
		}
		else if(funcName=="atan"){
			str = "Math.atan(";
		}
		else if(funcName=="atan2"){
			str = "Math.atan2(";
		}
		else if(funcName=="cos"){
			str = "Math.cos(";
		}
		else if(funcName=="exp"){
			str = "Math.exp(";
		}
		else if(funcName=="log"){
			str = "Math.log(";
		}
		else if(funcName=="sin"){
			str = "Math.sin(";
		}
		else if(funcName=="sqrt"){
			str = "Math.sqrt(";
		}
		else if(funcName=="tan"){
			str = "Math.tan(";
		}
		else if(funcName=="round"){
			str = "Math.round(";
		}
		else if(funcName=="random"){
			if(args!=null && 0<args.length){
				String argStr = "";
				for(int i=0; args!=null && i<args.length; i++){
					if(i>0) argStr += ",";
					argStr += args[i];
				}
				str = "(Math.random()*"+argStr+"+1|0)";
				return str;
			}
		}
		else if(funcName=="mouseh"){
			return "mouse.mouseH()";
		}
		else if(funcName=="mousev"){
			return "mouse.mouseV()";
		}
		else if(funcName=="clickh"){
			return "mouse.clickH()";
		}
		else if(funcName=="clickv"){
			return "mouse.clickV()";
		}
		else if(funcName=="mouse"){
			return "mouse.button";
		}
		else if(funcName=="mouseloc"){
			return "mouse.mouseLoc()";
		}
		else if(funcName=="clickline"){
			return "mouse.clickLine()";
		}
		else if(funcName=="clickloc"){
			return "mouse.clickLoc()";
		}
		else if(funcName=="clickchunk"){
			return "mouse.clickChunk()";
		}
		else if(funcName=="clicktext"){
			return "mouse.clickText()";
		}
		else if(funcName=="mouseclick"){
			return "mouse.click()";
		}
		else if(funcName=="selectedfield"){
			return "system.selectedField()";
		}
		else if(funcName=="selectedline"){
			return "system.selectedLine()";
		}
		else if(funcName=="selectedtext"){
			return "system.selectedText()";
		}
		else if(funcName=="min"){
			str = "system.min(";
		}
		else if(funcName=="max"){
			str = "system.max(";
		}
		else if(funcName=="param"){
			return "arguments["+(args[0])+"-1]";
		}
		else if(funcName=="paramcount"){
			return "arguments.length";
		}
		else if(propertySet.contains(funcName)){
			return "system."+convPropertyName(funcName); //プロパティ
		}
		else{
			str = "system."+funcName+"(";
		}
		
		for(int i=0; args!=null && i<args.length; i++){
			if(i>0) str += ",";
			str += args[i];
		}
		
		return str+")";
	}

	private class ObjResult {
		int cnt;
		String obj;
	}
	
	private ObjResult getObjectfromList(ArrayList<String> stringList, ArrayList<wordType> typeList, int start, TreeSet<String> varSet, TreeSet<String> globalSet) throws Exception {
		ObjResult objres = new ObjResult();

		objres.cnt=0;
		objres.obj=null;
		
		int next = start;
		
		if(next>=stringList.size()) return null;//throw new Exception("オブジェクトが分かりません");
		String str=stringList.get(next);
		if(typeList.get(next)!=wordType.STRING && 0==str.compareToIgnoreCase("HyperCard")) {
			objres.cnt = 1;
			objres.obj = "system";
			return objres;
		}
		if(typeList.get(next)!=wordType.STRING && 0==str.compareToIgnoreCase("me")) {
			objres.cnt = 1;
			objres.obj = "me";
			return objres;
		}
		if(typeList.get(next)!=wordType.STRING && 0==str.compareToIgnoreCase("target")) {
			objres.cnt = 1;
			objres.obj = "target()";
			return objres;
		}
		if(0==str.compareToIgnoreCase("menubar")) {
			objres.cnt = 1;
			objres.obj = "menubar()";
			return objres;
		}
		if(0==str.compareToIgnoreCase("titlebar")) {
			objres.cnt = 1;
			objres.obj = "titlebar()";
			return objres;
		}
		if(0==str.compareToIgnoreCase("msg") || 0==str.compareToIgnoreCase("message")) {
			if(stringList.size()>next+1 && stringList.get(next+1)=="window"){
				objres.cnt = 2;
			}else{
				objres.cnt = 1;
			}
			objres.obj = "message()";
			return objres;
		}
		next++;
		if(next>=stringList.size()) return null;//throw new Exception("オブジェクトが分かりません");
		String str2=stringList.get(next);
		if(0==str.compareToIgnoreCase("the") && 0==str2.compareToIgnoreCase("target")) {
			objres.cnt = 2;
			objres.obj = "target()";
			return objres;
		}
		if(0==str.compareToIgnoreCase("this")){
			if(0==str2.compareToIgnoreCase("cd") || 0==str2.compareToIgnoreCase("card"))
			{
				objres.cnt = 2;
				objres.obj = "thisCard()";
				return objres;
			}
			if(0==str2.compareToIgnoreCase("bg") || 0==str2.compareToIgnoreCase("bkgnd") || 0==str2.compareToIgnoreCase("background"))
			{
				objres.cnt = 2;
				objres.obj = "thisBg()";
				return objres;
			}
			if(0==str2.compareToIgnoreCase("stack")) {
				objres.cnt = 2;
				objres.obj = "thisStack()";
				return objres;
			}
		}
		if(0==str.compareToIgnoreCase("next")){
			if(0==str2.compareToIgnoreCase("cd") || 0==str2.compareToIgnoreCase("card"))
			{
				if(next+1<stringList.size() && stringList.get(next+1)=="of"){
					int k;
					next+=2;
					for(k=next; k<stringList.size(); k++) {
						if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.OF_CHUNK && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.CHUNK && typeList.get(k)!=wordType.OBJECT && typeList.get(k)!=wordType.X)
						{
							k--;
							break;
						}
					}
					if(k>=stringList.size()) k=stringList.size()-1;
					String value = checkValueNest(next, k, stringList, typeList, varSet, globalSet);
					next = k;

					if(value.endsWith(".text")){
						value = value.substring(0,value.length()-5);
					}
					//
					objres.cnt = next-start;
					objres.obj = value+".nextCard()";
					return objres;
				}
				else{
					objres.cnt = 2;
					objres.obj = "nextCard()";
					return objres;
				}
			}
		}
		if(0==str.compareToIgnoreCase("first")){
			if(0==str2.compareToIgnoreCase("cd") || 0==str2.compareToIgnoreCase("card"))
			{
				objres.cnt = 2;
				objres.obj = "card(1)";
				return objres;
			}
		}
		if(0==str.compareToIgnoreCase("last")){
			if(0==str2.compareToIgnoreCase("cd") || 0==str2.compareToIgnoreCase("card"))
			{
				objres.cnt = 2;
				objres.obj = "card(system.numberOfCards())";
				return objres;
			}
		}
		if(0==str.compareToIgnoreCase("prev") || 0==str.compareToIgnoreCase("previous")){
			if(0==str2.compareToIgnoreCase("cd") || 0==str2.compareToIgnoreCase("card"))
			{
				if(next+1<stringList.size() && stringList.get(next+1)=="of"){
					int k;
					next+=2;
					for(k=next; k<stringList.size(); k++) {
						if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.OF_CHUNK && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.CHUNK && typeList.get(k)!=wordType.OBJECT && typeList.get(k)!=wordType.X)
						{
							k--;
							break;
						}
					}
					if(k>=stringList.size()) k=stringList.size()-1;
					String value = checkValueNest(next, k, stringList, typeList, varSet, globalSet);
					next = k;

					if(value.endsWith(".text")){
						value = value.substring(0,value.length()-5);
					}
					//
					objres.cnt = next-start;
					objres.obj = value+".prevCard()";
					return objres;
				}
				else{
					objres.cnt = 2;
					objres.obj = "prevCard()";
					return objres;
				}
			}
		}
		if(0==str.compareToIgnoreCase("marked")){
			if(0==str2.compareToIgnoreCase("cd") || 0==str2.compareToIgnoreCase("card"))
			{
				if(next+1<stringList.size()){
					objres.cnt = 3;
					objres.obj = "markedCard("+stringList.get(next+1)+")";
					return objres;
				}
			}
		}
		if(0==str.compareToIgnoreCase("window")) {
			if(str2.equalsIgnoreCase("message") || str2.equalsIgnoreCase("msg")){
				objres.cnt = 2;
				objres.obj = "message()";
			}
			else{
				objres.cnt = 2;
				objres.obj = "palette("+getValue(stringList,typeList, varSet, globalSet, next)+")";
			}
			return objres;
		}
		else if(0==str2.compareToIgnoreCase("window")) {
			if(0==str.compareToIgnoreCase("cd") || 0==str.compareToIgnoreCase("card")){
				objres.cnt = 2;
				objres.obj = "cardWindow()";
			}else if(0==str.compareToIgnoreCase("msg") || 0==str.compareToIgnoreCase("message")){
				objres.cnt = 2;
				objres.obj = "message()";
			}
			return objres;
		}
		else if(0==str.compareToIgnoreCase("menu")) {
			objres.cnt = 2;
			objres.obj = "menu("+getValue(stringList,typeList, varSet, globalSet, next)+")";
			return objres;
		}
		else if(0==str.compareToIgnoreCase("menuitem")) {
			int k;
			next++;
			for(k=next; k<stringList.size(); k++) {
				if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.OF_CHUNK && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.CHUNK && typeList.get(k)!=wordType.OBJECT && typeList.get(k)!=wordType.X)
				{
					k--;
					break;
				}
			}
			if(k>=stringList.size()) k=stringList.size()-1;
			String value = checkValueNest(next, k, stringList, typeList, varSet, globalSet);
			next = k;

			//
			objres.cnt = next-start;
			objres.obj = "menuitem("+value+")";

			//メニュー指定
			int next2 = k;
			next2++;
			if(next2+1<stringList.size() && (stringList.get(next2)=="of" || stringList.get(next2)=="in")){
				next2++;
				ObjResult objres2;
				objres2 = getObjectfromList(stringList, typeList, next2, varSet, globalSet);
				if(objres2.obj != null){
					next2 += objres2.cnt;
					objres.cnt = next2-start;
					objres.obj = objres2.obj+".menuitem("+value+")";
				}
			}

			return objres;
		}
		else if(0==str.compareToIgnoreCase("folder")) {
			String path = "";
			path = getValue(stringList,typeList, varSet, globalSet, next).replace(':', '/');
			objres.cnt = 2;
			objres.obj = "folder("+path+")";
			return objres;
		}
		else if(0==str.compareToIgnoreCase("stack")) {
			String stackName = getValue(stringList,typeList, varSet, globalSet, next);
			objres.cnt = 2;
			objres.obj = "stack("+stackName+")";
			return objres;
		}

		if(0==str.compareToIgnoreCase("cd") || 0==str.compareToIgnoreCase("card")) {
			if(typeList.get(next)!=wordType.STRING &&
				(str2.equalsIgnoreCase("pict") || str2.equalsIgnoreCase("picture")))
			{
				objres.cnt = 2;
				objres.obj = "cardPicture()";
				return objres;
			}
		}
		else if(0==str.compareToIgnoreCase("bg") || 0==str.compareToIgnoreCase("bkgnd") || 0==str.compareToIgnoreCase("background")) {
			if(typeList.get(next)!=wordType.STRING &&
				(str2.equalsIgnoreCase("pict") || str2.equalsIgnoreCase("picture")))
			{
				objres.cnt = 2;
				objres.obj = "bgPicture()";
				return objres;
			}
		}

		for(int i=start; i<stringList.size()-1; i++){
			if(stringList.get(i).equalsIgnoreCase("first"))
			{
				if( stringList.get(i+1).equalsIgnoreCase("card") ||
					stringList.get(i+1).equalsIgnoreCase("background") ||
					stringList.get(i+1).equalsIgnoreCase("button") ||
					stringList.get(i+1).equalsIgnoreCase("field") )
				{
					String s = "";
					if(stringList.get(i).equalsIgnoreCase("first")){
						stringList.set(i,"");
						typeList.set(i,wordType.NOP);
						stringList.set(i+1,stringList.get(i+1)+"(1)");
					}
					else{
						stringList.set(i,stringList.get(i+1));
						stringList.set(i+1,s);
					}
				}
			}
		}
		
		//button
		if(typeList.get(next-1)!=wordType.STRING && (0==str.compareToIgnoreCase("btn") || 0==str.compareToIgnoreCase("button")) ||
				typeList.get(next)!=wordType.STRING && (0==str2.compareToIgnoreCase("btn") || 0==str2.compareToIgnoreCase("button")) )
		{
			boolean bg=false;
			//今いるカードではなく、オブジェクトの存在するカードが必要な場合もあるが基準が分からんpart1
			String cdbase;
			cdbase=null;
			if(0==str.compareToIgnoreCase("cd") || 0==str.compareToIgnoreCase("card")) {
				//cdbase=PCARD.pc.stack.curCard;
				next++;
			}
			else if(0==str.compareToIgnoreCase("bg") || 0==str.compareToIgnoreCase("bkgnd") || 0==str.compareToIgnoreCase("background")) {
				bg=true;
				//cdbase="thisBg()";
				//cdbase=PCARD.pc.stack.curCard;
				next++;
			}
			if(next>=stringList.size()) throw new Exception("ボタンが分かりません");
			String str3=stringList.get(next);
			boolean id=false;
			if(0==str3.compareToIgnoreCase("id")) {
				next++;
				id = true;
			}

			int k;
			for(k=next; k<stringList.size(); k++) {
				if(typeList.get(k)==wordType.X && typeList.get(k-1)==wordType.OBJECT){
					continue;
				}
				if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.OF_CHUNK && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.CHUNK && typeList.get(k)!=wordType.OBJECT /*&& typeList.get(k)!=wordType.X*/)
				{
					k--;
					break;
				}
			}
			if(k>=stringList.size()) k=stringList.size()-1;
			String value = checkValueNest(next, k, stringList, typeList, varSet, globalSet);
			next = k;

			//他のカードのオブジェクト指定
			next++;
			int next2 = next;
			while(next2<stringList.size() && typeList.get(next2)==wordType.NOP){
				next2++;
			}
			if(next2<stringList.size()){
				String str5=stringList.get(next2);
				if(0==str5.compareToIgnoreCase("of")||0==str5.compareToIgnoreCase("in")) {
					next2++;
					if(next2>=stringList.size()) throw new Exception("オブジェクトが分かりません");
					ObjResult objres2;
					objres2 = getObjectfromList(stringList, typeList, next2, varSet, globalSet);
					next2 += objres2.cnt/*-1*/;
					next = next2;
					if(objres2.obj==null) throw new Exception("オブジェクトが分かりません");
					//if(0!=objres2.obj.objectType.compareTo("card") && 0!=objres2.obj.objectType.compareTo("background"))
					//	throw new Exception("ここにはカードまたはバックグラウンドを指定してください");
					cdbase = objres2.obj;
					/*if(bg == true && 0==cdbase.objectType.compareTo("card")) {
						if(((OCard)cdbase).bg != null) {
							cdbase = (OCardBase) ((OCard)cdbase).bg;
						} else {
							cdbase = (OCardBase) new OBackground(cdbase.stack, (OCard)cdbase, ((OCard)cdbase).bgid, true);
						}
						if(cdbase == null) throw new Exception("バックグラウンドがありません");
					}*/
				}
			}
			if(id) {
				objres.cnt = next-start;
				objres.obj = cdbase==null?"":(cdbase+".");
				objres.obj += bg?"bgBtnById(":"cdBtnById(";
				objres.obj += value+")";
				return objres;
			}
			else {
				objres.cnt = next-start;
				objres.obj = cdbase==null?"":(cdbase+".");
				objres.obj += bg?"bgBtn(":"cdBtn(";
				objres.obj += value+")";
				return objres;
			}
		}
		//field
		if(typeList.get(next-1)!=wordType.STRING && (0==str.compareToIgnoreCase("fld") || 0==str.compareToIgnoreCase("field")) ||
				typeList.get(next)!=wordType.STRING && (0==str2.compareToIgnoreCase("fld") || 0==str2.compareToIgnoreCase("field")) )
		{
			boolean cd=false;
			String cdbase=null;
			if(0==str.compareToIgnoreCase("cd") || 0==str.compareToIgnoreCase("card")) {
				//cdbase=PCARD.pc.stack.curCard;
				cd=true;
				next++;
			}
			else if(0==str.compareToIgnoreCase("bg") || 0==str.compareToIgnoreCase("bkgnd") || 0==str.compareToIgnoreCase("background")) {
				//cdbase=PCARD.pc.stack.curCard.bg;
				//cdbase=PCARD.pc.stack.curCard;
				next++;
			}
			if(next>=stringList.size()) throw new Exception("フィールドが分かりません");
			String str3=stringList.get(next);
			boolean id=false;
			if(0==str3.compareToIgnoreCase("id")) {
				next++;
				id = true;
			}

			int k;
			for(k=next; k<stringList.size(); k++) {
				if(typeList.get(k)==wordType.X && typeList.get(k-1)==wordType.OBJECT){
					continue;
				}
				if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.OF_CHUNK && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.CHUNK && typeList.get(k)!=wordType.OBJECT 
						/*&& typeList.get(k)!=wordType.X*/ //このコメントを外すとcd fld ("a"+"b") of cd "c"が扱えない
				)
				{
					k--;
					break;
				}
			}
			if(k>=stringList.size()) k=stringList.size()-1;
			String value = checkValueNest(next, k, stringList, typeList, varSet, globalSet);
			next = k;

			//他のカードのオブジェクト指定
			next++;
			int next2 = next;
			while(next2<stringList.size() && typeList.get(next2)==wordType.NOP){
				next2++;
			}
			if(next2<stringList.size()){
				String str5=stringList.get(next2);
				if(0==str5.compareToIgnoreCase("of")||0==str5.compareToIgnoreCase("in")) {
					next2++;
					if(next2>=stringList.size()) throw new Exception("オブジェクトが分かりません");
					ObjResult objres2;
					objres2 = getObjectfromList(stringList, typeList, next2, varSet, globalSet);
					next2 += objres2.cnt/*-1*/;
					next = next2;
					if(objres2.obj==null) throw new Exception("オブジェクトが分かりません");
					//if(0!=objres2.obj.objectType.compareTo("card") && 0!=objres2.obj.objectType.compareTo("background"))
					//	throw new Exception("ここにはカードまたはバックグラウンドを指定してください");
					cdbase = objres2.obj;
				}
			}

			//cdからbgを得る(こうしないとカードごとに内容の違うフィールドの内容が取れない)
			//メモリにbgを展開していなかった時代の方法
			/*if(bg == true && 0==cdbase.objectType.compareTo("card")) {
				if(((OCard)cdbase).bg != null) {
					cdbase = (OCardBase) ((OCard)cdbase).bg;
				} else {
					cdbase = (OCardBase) new OBackground(cdbase.stack, (OCard)cdbase, ((OCard)cdbase).bgid, true);
				}
				if(cdbase == null) throw new Exception("バックグラウンドがありません");
			}*/

			//cdからbgを得る(こうしないとカードごとに内容の違うフィールドの内容が取れない)
			/*if(bg == true && 0==cdbase.objectType.compareTo("card")) {
				OCard ocd  = (OCard)cdbase;
				cdbase = ocd.getBg();
			}*/

			if(id) {
				objres.cnt = next-start;
				objres.obj = cdbase==null?"":(cdbase+".");
				objres.obj += cd?"cdFldById(":"bgFldById(";
				objres.obj += value+")";
				return objres;
			}
			else {
				objres.cnt = next-start;
				objres.obj = cdbase==null?"":(cdbase+".");
				objres.obj += cd?"cdFld(":"bgFld(";
				objres.obj += value+")";
				return objres;
			}
		}
		//cd
		if(0==str.compareToIgnoreCase("cd") || 0==str.compareToIgnoreCase("card"))
		{
			String str3=stringList.get(next);
			String id=null;
			String name=null;
			if(0==str3.compareToIgnoreCase("id")) {
				next++;
				String str4=stringList.get(next);
				id = str4;
			}
			else {
				int k;
				for(k=next; k<stringList.size(); k++) {
					if(typeList.get(k)!=wordType.NOP && typeList.get(k)!=wordType.OF_CHUNK && typeList.get(k)!=wordType.VALUE && typeList.get(k)!=wordType.STRING && typeList.get(k)!=wordType.NUMSTRING && typeList.get(k)!=wordType.CHUNK && /*typeList.get(k)!=wordType.OBJECT &&*/ typeList.get(k)!=wordType.X)
					{
						k--;
						break;
					}
				}
				if(k>=stringList.size()) k=stringList.size()-1;
				name = checkValueNest(next, k, stringList, typeList, varSet, globalSet);
				next = k;
			}
			//of bg xx
			String bgStr = "";
			if(stringList.size()>next+3 && stringList.get(next+1)=="of" && (stringList.get(next+2)=="bg"||stringList.get(next+2)=="bkgnd"||stringList.get(next+2)=="background") ){
				bgStr = "bg("+stringList.get(next+3)+").";
				next+=3;
			}
			else if(stringList.size()>next+3 && stringList.get(next+1)=="of"&& stringList.get(next+2)=="this" && (stringList.get(next+3)=="bg"||stringList.get(next+3)=="bkgnd"||stringList.get(next+3)=="background") ){
				bgStr = "thisBg().";
				next+=3;
			}
			//of stack xx
			String stackStr = "";
			if(stringList.size()>next+3 && stringList.get(next+1)=="of" && stringList.get(next+2)=="stack" ){
				stackStr = "stack("+stringList.get(next+3)+").";
				next+=3;
			}
			//id/number/nameでさがす
			if(id!=null) {
				objres.cnt = next-start+1;
				objres.obj = stackStr+bgStr+"cardById("+id+")";
				return objres;
			}
			else if(name!=null) {
				objres.cnt = next-start+1;
				objres.obj = stackStr+bgStr+"card("+name+")";
				return objres;
			}
		}
		//bg
		if(0==str.compareToIgnoreCase("bg") || 0==str.compareToIgnoreCase("bkgnd") || 0==str.compareToIgnoreCase("background"))
		{
			String str3=stringList.get(next);
			String id=null;
			String name=null;
			if(0==str3.compareToIgnoreCase("id")) {
				next++;
				String str4=stringList.get(next);
				id = str4;
			}
			else {
				name = getValue(stringList,typeList, varSet, globalSet, next);
			}
			//of stack xx
			String stackStr = "";
			if(stringList.size()>next+3 && stringList.get(next+1)=="of" && stringList.get(next+2)=="stack" ){
				stackStr = "stack("+stringList.get(next+3)+").";
				next+=3;
			}
			//id/number/nameでさがす
			if(id!=null) {
				objres.cnt = next-start+1;
				objres.obj = stackStr+"bgById("+id+")";
				return objres;
			}
			else if(name!=null) {
				objres.cnt = next-start+1;
				objres.obj = stackStr+"bg("+name+")";
				return objres;
			}
		}
		
		/*String errstr="";
		for(int i=start; i<start+objres.cnt; i++){
			errstr+=stringList.get(i);
		}*/

		return objres;
	}

	private String getChunk(String mode, String chunkStart, String chunkEnd, String source) {
		//charはともかく、lineあたりはStringのメソッドにしちゃうほうが良さげ
		if(chunkEnd!=null && !chunkEnd.equals("")){
			/*if(mode=="char"){
				return source+".substring("+chunkStart+"-1,"+chunkEnd+")";
			}
			if(mode=="line"){
				return source+".split(\"\\n\").slice("+chunkStart+"-1,"+chunkEnd+").join(\"\\n\")";
			}
			if(mode=="item"){
				return source+".split(itemDelimiter).slice("+chunkStart+"-1,"+chunkEnd+").join(itemDelimiter)";
			}
			if(mode=="word"){
				return source+".split(\" \").slice("+chunkStart+"-1,"+chunkEnd+").join(\" \")";
			}*/
			return mode+"("+source+","+chunkStart+","+chunkEnd+")";
		}
		else{
			/*if(mode=="char"){
				return source+".charAt("+chunkStart+"-1)";
			}
			if(mode=="line"){
				return source+".split(\"\\n\")["+chunkStart+"-1]";
			}
			if(mode=="item"){
				return source+".split(itemDelimiter)["+chunkStart+"-1]";
			}
			if(mode=="word"){
				return source+".split(\" \")["+chunkStart+"-1]";
			}*/
			return mode+"("+source+","+chunkStart+")";
		}
	}

	private String getValue(ArrayList<String> stringList, ArrayList<wordType> typeList, TreeSet<String> varSet, TreeSet<String> globalSet,  int i) throws Exception {
		if(typeList.get(i)==wordType.LBRACKET){
			/*int nest = 1;
			for(int j=i+1; j<stringList.size(); j++){
				if(stringList.get(j)=="(") nest++;
				if(stringList.get(j)==")") nest--;
				if(stringList.get(j)==")" && nest==0){
					for(int k=i; k<j-1; k++){
						stringList.set(k, stringList.get(k+1));
						typeList.set(k, typeList.get(k+1));
					}
					stringList.set(j-1, "");
					typeList.set(j-1, wordType.NOP);
					stringList.set(j, "");
					typeList.set(j, wordType.NOP);
					return getValue(stringList, typeList, varSet, globalSet, i);
				}
			}*/
			int nest = 1;
			for(int j=i+1; j<stringList.size(); j++){
				if(stringList.get(j)=="(") nest++;
				if(stringList.get(j)==")") nest--;
				if(stringList.get(j)==")" && nest==0){
			        String str = "("+checkValueNest(i+1,j-1,stringList,typeList,varSet,globalSet)+")";
					for(int k=i; k<j; k++){
						stringList.set(k, "");
						typeList.set(k, wordType.NOP);
					}
			        return str;
				}
			}
		}
		if(typeList.get(i)==wordType.OBJECT){
			ObjResult objres = null;
			try{objres = getObjectfromList(stringList, typeList, i, varSet, globalSet);}
			catch(Exception e){}
			if(objres!=null && objres.obj!=null){
				return objres.obj;
			}
		}
		if(typeList.get(i)==wordType.STRING || typeList.get(i)==wordType.X || (typeList.get(i)==wordType.OBJECT&&!varSet.contains(stringList.get(i)))){
			return "\""+stringList.get(i)+"\"";
		}else{
			String value = stringList.get(i);
			if(jsKeyWord.contains(value)){
				value += "_";
			}
			if(globalSet.contains(stringList.get(i))){
				return "global."+value;
			}
			return value;
		}
	}
	
	/*enum wordType { 
		X,
		VARIABLE,
		GLOBAL,
		OBJECT,
		STRING, NUMSTRING,
		CONST,
		CHUNK,
		PROPERTY,
		CMD, CMD_SUB, USER_CMD, XCMD,
		FUNC, USER_FUNC, XFCN,
		OPERATOR, QUOTE,
		LBRACKET, RBRACKET,
		LFUNC, RFUNC,
		COMMA, COMMA_FUNC,
		OF_FUNC, OF_PROP, OF_OBJ, OF_CHUNK,
		ON_HAND, END_HAND, ON_FUNC,(END_FUNC) EXIT, PASS, RETURN, EXIT_TO_HC,
		IF, ELSE, THEN, ENDIF,
		REPEAT, END_REPEAT, EXIT_REP, NEXT_REP, REPEAT_SUB,
		THE_FUNC,
		COMMENT,
		NOP, OPERATOR_SUB}*/

	private void convscript(NestLine[] nestAry, OObject object/*, OStack stack*/){
		object.javascriptList = new ArrayList<String>();
		int start=-1, end;
		
		//行頭をサーチして、各ハンドラに分解。それ以外はコメントとする
		for(int i=0; i<nestAry.length; i++){
			ArrayList<Nest> nests = nestAry[i].nest;
			if(nests.size()==0 || nests.get(0).typeLst.size()==0){
				if(start<0){
					//ハンドラ外にあるのでコメント
					if(nestAry[i].commentStr!=null){
						object.javascriptList.add(nestAry[i].commentStr);
					}else{
						object.javascriptList.add("");
					}
				}
				continue; 
			}
			if(wordType.ON_HAND==nests.get(0).typeLst.get(0) || wordType.ON_FUNC==nests.get(0).typeLst.get(0)){
				start = i;
			}
			else if(start>=0 && wordType.END_HAND==nests.get(0).typeLst.get(0)){
				end = i;
				convHandler(start, end, nestAry, object/*, stack*/);
				start = -1;
			}
			else if(start<0){
				//ハンドラ外にあるのでコメント
				String str = nests.get(0).strLst.get(0);
				if(str.startsWith("--")){
					str = str.substring(2);
				}
				if(nestAry[i].commentStr!=null){
					str += nestAry[i].commentStr;
				}
				//JavaScriptに追加
				object.javascriptList.add("//"+str);
			}
		}
	}

	private void convHandler(int start, int end, NestLine[] nestAry, OObject object/*, OStack stack*/){
		TreeSet<String> varSet = new TreeSet<String>(); //これまでに変数が出現したかを見て、"var"を付ける
		TreeSet<String> globalSet = new TreeSet<String>();
		//int listcnt = object.javascriptList.size();
		
		//if文以外は、行を取り出して変換すればOK
		for(int i=start;i<=end;i++){
			convLine(nestAry[i], object, /*stack, */i, varSet, globalSet);
		}
		
		//変数を宣言
		if(varSet.size()>0){
			String str = "";
			for(String s : varSet){
				if(str.length()>0) str += ",";
				/*if(s.matches("vmVar\\..*")){
					str += "\""+s.substring(6)+"\"";
				}else*/{
					str += "\""+s+"\"";
				}
			}
			//str = "varSet("+str+");";
			//object.javascriptList.add(listcnt+1, str);
		}
	}

	private void convLine(NestLine nestline, OObject object, /*OStack stack,*/ int line, TreeSet<String> varSet, TreeSet<String> globalSet){
		ArrayList<Nest> nests = nestline.nest;
		String commentStr = nestline.commentStr;
		if(nests.size()==0 || nests.get(0).typeLst.size()==0){ 
			//System.out.println("convLine");
			if(commentStr==null){
				commentStr = "";
			}
			object.javascriptList.add(commentStr);
			return;
		}

		if(commentStr==null){
			commentStr = "";
		}
		else{
			commentStr = " "+commentStr;
		}

		//System.out.println("convLine:"+nests.get(0).strLst.get(0));

		//最初の単語は制御文かコマンド
		wordType firstType = nests.get(0).typeLst.get(0);
		if(wordType.ON_HAND==firstType || wordType.ON_FUNC==firstType){
			String str = convHandler(nests, object, varSet);
			object.javascriptList.add(str + commentStr);
		}
		else if(wordType.END_HAND==firstType){
			object.javascriptList.add("}"+commentStr);
		}
		else if(wordType.GLOBAL==firstType){
			String str = "";
			for(int i=1; i<nests.get(0).strLst.size();i++){
				varSet.add(nests.get(0).strLst.get(i));
				globalSet.add(nests.get(0).strLst.get(i));
			}
			object.javascriptList.add(str+commentStr);
		}
		else if(wordType.IF==firstType){
			String str = convIf(0, nests, varSet, globalSet);
			object.javascriptList.add(str + commentStr);
		}
		else if(wordType.ELSE==firstType){
			String elseStr = "";
			if(nests.get(0).strLst.get(0).equals("else_2")){
				elseStr = "} ";
			}
			if(nests.size()>1 && wordType.IF==nests.get(1).typeLst.get(0)){
				String str = convIf(1, nests, varSet, globalSet);
				object.javascriptList.add(elseStr+"else "+str+commentStr);
			}else if(nests.size()>1){
				String str = convCommand(1, nests, varSet, globalSet);
				object.javascriptList.add(elseStr+"else "+str+commentStr);
			}else{
				object.javascriptList.add(elseStr+"else {"+commentStr);
			}
		}
		else if(wordType.THEN==firstType){
			if(nests.size()>1){
				String str = convCommand(1, nests, varSet, globalSet);
				object.javascriptList.add(str+commentStr);
			}else{
				object.javascriptList.add("{"+commentStr);
			}
		}
		else if(wordType.ENDIF==firstType){
			object.javascriptList.add("}"+commentStr);
		}
		else if(wordType.REPEAT==firstType){
			String str = convRepeat(nests, object, varSet, globalSet);
			object.javascriptList.add(str + commentStr);
		}
		else if(wordType.END_REPEAT==firstType){
			object.javascriptList.add("}"+commentStr);
		}
		else{
			String str = convCommand(0, nests, varSet, globalSet);
			object.javascriptList.add(str + commentStr);
		}
	}

	private String convHandler(ArrayList<Nest> nests, OObject object, TreeSet<String> varSet){
		String handlerName = nests.get(0).strLst.get(0);
		if(jsKeyWord.contains(handlerName)){
			handlerName += "_";
		}
		
		String str = "function "+handlerName+"(";

		for(int i=1; i<nests.get(0).strLst.size(); i++){
			if(i>=2){ str += ","; }
			str += nests.get(0).strLst.get(i);
			varSet.add(nests.get(0).strLst.get(i));
		}
		return str+"){";
	}

	private String convIf(int start, ArrayList<Nest> nests, TreeSet<String> varSet, TreeSet<String> globalSet){
		if(nests.size()<=start+1){
			System.out.println("convIf Error:");
			return "convIf Error";
		}
		String valStr = nests.get(start+1).strLst.get(0);
		if(varSet.contains(valStr)){
			valStr = "("+valStr+"+\"\").toLowerCase()==\"true\"";
		}
		String str = "if(";
		str += valStr;
		str += ")";
		
		for(int i=start+2; i<nests.size(); i++){
			wordType nextType = nests.get(i).typeLst.get(0);
			if(nextType==wordType.THEN){
				if(i+1>=nests.size()){
					str += "{";
				}
				else{
					str += " ";
				}
			}
			else if(nextType==wordType.IF){
				str += convIf(i, nests, varSet, globalSet);
				break;//ifの評価値も見たので進める
			}
			else if(nextType==wordType.ELSE){
				if(i+1>=nests.size()){
					str += "else {";
				}
				else{
					str += "else ";
				}
			}
			else{
				str += convCommand(i, nests, varSet, globalSet);
			}
		}
		
		return str;
	}

	enum repeatMode { FOREVER, TIMES, WHILE, UNTIL, WITHUP, WITHDOWN };
	
	private String convRepeat(ArrayList<Nest> nests, OObject object, TreeSet<String> varSet, TreeSet<String> globalSet){
		String repeatStr = "";
		repeatMode mode = repeatMode.FOREVER;

		//モード判定
		for(int i=0; nests.size()>1 && i<nests.get(1).typeLst.size(); i++){
			wordType nextType = nests.get(1).typeLst.get(i);
			if(nextType==wordType.REPEAT_SUB) {
				String str = nests.get(1).strLst.get(i);
				if(str.equals("forever")){
					mode = repeatMode.FOREVER;
				}
				else if(str.equals("for")){
					mode = repeatMode.TIMES;
				}
				else if(str.equals("times")){
					mode = repeatMode.TIMES;
				}
				else if(str.equals("with")){
					mode = repeatMode.WITHUP;
				}
				else if(str.equals("until")){
					mode = repeatMode.UNTIL;
				}
				else if(str.equals("while")){
					mode = repeatMode.WHILE;
				}
				else if(str.equals("down")){
					mode = repeatMode.WITHDOWN;
				}
			}
			else{
				if(mode==repeatMode.FOREVER){
					mode = repeatMode.TIMES;
				}
			}
		}

		if(mode == repeatMode.FOREVER){
			return "while(true){";
		}
		if(mode == repeatMode.UNTIL){
			String str = nests.get(1).strLst.get(1);
			repeatStr = "while(!(";
			repeatStr += str;
			repeatStr += ")){";
			return repeatStr;
		}
		if(mode == repeatMode.WHILE){
			String str = nests.get(1).strLst.get(1);
			repeatStr = "while(";
			repeatStr += str;
			repeatStr += "){";
			return repeatStr;
		}
		if(mode == repeatMode.TIMES){
			String var = /*"vmVar."+*/nests.get(0).strLst.get(0);
			String str = nests.get(1).strLst.get(0);
			if(str=="forever"){
				return "while(true){";
			}
			else{
				if(str.equals("for")){ str = nests.get(1).strLst.get(1);}
				repeatStr = "for(var "+var+"=0;"+var+"<"+str+";"+var+"++){";
				return repeatStr;
			}
		}
		if(mode == repeatMode.WITHUP){
			if(nests.get(1).strLst.size()<=5){
				return "Error: repeat WITHUP";
			}
			String var = /*"vmVar."+*/nests.get(1).strLst.get(1);
			if(globalSet.contains(var)){
				repeatStr = "for(global.";
			}
			else if(varSet.contains(var)){
				repeatStr = "for(";
			}
			else{
				varSet.add(var);
				repeatStr = "for(var ";
			}
			String start = nests.get(1).strLst.get(4);
			String end = nests.get(1).strLst.get(6);
			repeatStr += var+"="+start+";"+var+"<="+end+";"+var+"++){";
			return repeatStr;
		}
		if(mode == repeatMode.WITHDOWN){
			if(nests.get(1).strLst.size()<=6){
				return "Error: repeat WITHDOWN";
			}
			String var = /*"vmVar."+*/nests.get(1).strLst.get(1);
			if(globalSet.contains(var)){
				repeatStr = "for(global.";
			}
			else if(varSet.contains(var)){
				repeatStr = "for(";
			}
			else{
				varSet.add(var);
				repeatStr = "for(var ";
			}
			String start = nests.get(1).strLst.get(4);
			String end = nests.get(1).strLst.get(7);
			repeatStr += var+"="+start+";"+var+">="+end+";"+var+"--){";
			return repeatStr;
		}
		
		System.out.println("Error: repeat");
		return null;
	}

	private String convCommand(int start, ArrayList<Nest> nests, TreeSet<String> varSet, TreeSet<String> globalSet){
		wordType firstType = nests.get(start).typeLst.get(0);
		
		//System.out.println("convCommand:"+nests.get(start).strLst.get(0));
		//for(int i=1; i<nests.get(start).strLst.size(); i++){
		//	System.out.println("convCommand:"+nests.get(start).strLst.get(i));
		//}
		
		if(wordType.CMD==firstType){
			StringBuilder commandStr = new StringBuilder();
			String cmdName = nests.get(start).strLst.get(0);
			commandStr.append(cmdName);
			//コマンド名を生成
			for(int i=1; i<nests.get(start).strLst.size(); i++){
				wordType nextType = nests.get(start).typeLst.get(i);
				if(nextType==wordType.ELSE) {
					break;
				}
				if(nextType==wordType.CMD_SUB) {
					String str = nests.get(start).strLst.get(i);
					commandStr.append(Character.toUpperCase(str.charAt(0)));
					commandStr.append(str.substring(1));
				}
			}

			//引数を生成
			ArrayList<String> argAry = new ArrayList<String>();
			for(int i=1; i<nests.get(start).strLst.size(); i++){
				wordType nextType = nests.get(start).typeLst.get(i);
				if(nextType==wordType.ELSE) {
					break;
				}
				if(nextType!=wordType.CMD_SUB) {
					String str = nests.get(start).strLst.get(i);
					argAry.add(str);
				}
			}
			
			//文字列にして返す
			commandStr.append("(");
			for(int i=0; i<argAry.size(); i++){
				if(i>0){ commandStr.append(","); }
				commandStr.append(argAry.get(i));
			}
			commandStr.append(");");
			
			String str = commandStr.toString();
			
			if(cmdName.equals("go") || cmdName.equals("put") || cmdName.equals("set") || cmdName.equals("get") || 
					cmdName.equals("show") || cmdName.equals("hide") || cmdName.equals("send") ||
					cmdName.equals("answer") || cmdName.equals("create") || cmdName.equals("delete") ||
					cmdName.equals("add") || cmdName.equals("subtract") || cmdName.equals("multiply") || cmdName.equals("divide") ||
					cmdName.equals("disable") || cmdName.equals("enable") || cmdName.equals("edit") || cmdName.equals("palette") ||
					cmdName.equals("close") || cmdName.equals("select") || cmdName.equals("sort"))
			{
				//置き換え
				str = replaceCommand(cmdName, str, varSet, globalSet);
			}
			else if(cmdName.equals("wait")){
				/*if(start>0){
					str = "{ "+str+" }";
				}
				else str += " ";*/
				//置き換え
				str = replaceCommand(cmdName, str, varSet, globalSet);
			}
			else if(cmdName.equals("do")){
				str = str.replace("do","doScript");
			}
			else if(cmdName.equals("visual")){
				str = str.replace("visual(","visualEffect(");
			}
			if(cmdName.equals("delete")){
				str = str.replace("delete(","delete_(");
			}
			
			return str;
		}
		else if(wordType.XCMD==firstType){
			String str = nests.get(start).strLst.get(0)+"(";
			for(int i=1; i<nests.get(start).typeLst.size();i++){
				wordType nextType = nests.get(start).typeLst.get(i);
				if(nextType==wordType.ELSE) {
					break;
				}
				if(i>1){
					if(nextType==wordType.COMMA && nests.get(start).typeLst.get(i-1)==wordType.COMMA) {
						str += "\"\"";
					}
				}
				str += nests.get(start).strLst.get(i);
			}
			str+=");";
			return str;
		}
		else if(wordType.USER_CMD==firstType){
			String str = "sendCommand(me,\""+nests.get(start).strLst.get(0)+"\"";
			if(nests.get(start).typeLst.size()>1){
				str += ",";
			}
			for(int i=1; i<nests.get(start).typeLst.size();i++){
				wordType nextType = nests.get(start).typeLst.get(i);
				if(nextType==wordType.ELSE) {
					break;
				}
				if(i>1){
					if(nextType==wordType.COMMA && nests.get(start).typeLst.get(i-1)==wordType.COMMA) {
						str += "\"\"";
					}
				}
				str += nests.get(start).strLst.get(i);
			}
			str+=");";
			return str;
		}
		else if(wordType.EXIT==firstType){
			return "return;";
		}
		else if(wordType.EXIT_TO_HC==firstType){
			return "throw \"exit to system\";";
		}
		else if(wordType.PASS==firstType){
			if(start>0){
				return "{pass();return;}";
			}
			else return "pass();return;";
		}
		else if(wordType.RETURN==firstType){
			String str = "return";
			for(int i=1; i<nests.get(0).strLst.size();i++){
				str += " "+nests.get(0).strLst.get(i);
			}
			str += ";";
			return str;
		}
		else if(wordType.EXIT_REP==firstType){
			return "break;";
		}
		else if(wordType.NEXT_REP==firstType){
			return "continue;";
		}
		else{
			return "// convCommand ???";
		}
	}
	
	private String replaceCommand(String cmdName, String inStr, TreeSet<String> varSet, TreeSet<String> globalSet){
		String str = inStr;

		if(cmdName.equals("go")){
			if(str.matches("goTo\\(.*")){
				str = str.replaceFirst("goTo\\(", "go(");
			}
			if(str.matches("go\\(\"next\"\\);")){
				str = str.replaceFirst("go\\(\"next\"\\);", "go(nextCard());");
			}
			else if(str.matches("go\\(\"prev\"\\);")){
				str = str.replaceFirst("go\\(\"prev\"\\);", "go(prevCard());");
			}
			else if(str.matches("go\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("show")){
			if(str.matches("show\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
			else if(str.matches("showAt\\((.*)\\.text,.*\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("close")){
			if(str.matches("close\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("hide")){
			if(str.matches("hide\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("send")){
			if(str.matches(".*\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("create")){
			if(str.matches("create\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("edit")){
			if(str.matches("editScriptOf\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("answer")){
			str = str.replaceAll("\\|\\|", ",");
		}
		else if(cmdName.equals("get")){
			{
		        Pattern pattern = Pattern.compile("get\\((.*)\\);");
		        Matcher matcher = pattern.matcher(str);
				if(matcher.matches()){
					if(!varSet.contains("it")){
						//str = "var ";
						str = "";
						varSet.add("it");
					}
					else str = "";
					str += /*"vmVar.*/"it = "+matcher.group(1)+";";
				}
			}
		}
		else if(cmdName.equals("put")){
			{
				//put msg
				Pattern pattern = Pattern.compile("put\\((.*)\\);");
		        Matcher matcher = pattern.matcher(str);
				if(matcher.matches()){
					str = "message().text = "+matcher.group(1)+";";
				}
			}

			{
				//put into/before/after
				Pattern pattern = Pattern.compile("^(putInto|putBefore|putAfter)\\((.*)\\);$");
		        Matcher matcher = pattern.matcher(str);
		        boolean match = matcher.matches();
				if(match){
					Object[] args1 = getArgumentsFromStr(matcher.group(2));
					String[] args = new String[args1.length];
					for(int i=0;i<args1.length;i++){
						args[i] = (String) args1[i];
					}
					
					Pattern pattern3 = Pattern.compile("^(char|line|item|word)\\((char|line|item|word)\\((.*)\\),(.*)\\)$");
			        Matcher matcher3 = pattern3.matcher(args.length>=2?args[1]:"");
					if(matcher3.matches()){
						//2重のチャンク形式
						//例) put Count into item N of line 2 of DATA
						//例) putInto(count,  item(line(data,2),n)  );
						//チャンク形式
						Object[] args31 = getArgumentsFromStr(matcher3.group(3));
						String[] args3 = new String[args31.length];
						for(int i=0;i<args31.length;i++){
							args3[i] = (String) args31[i];
						}
						if(args3.length>=2){
							str = "";
							if(!varSet.contains(args3[0])&&args3[0].indexOf(".")==-1){
								str = "var ";
								varSet.add(args3[0]);
							}
							if(matcher.group(1).equals("putInto")){
								str += args3[0] +" = set"+matcher3.group(2)+"("+ //setline(
										args3[0]+",set"+matcher3.group(1)+"("+matcher3.group(2)+ //data,setitem(line
										"("+args3[0]+","+args3[1]+"),"+ //(data,2),
										args[0]+","+matcher3.group(4)+"),"+args3[1]+ //count,n),2
										");";
							}
							//matcher3.group(1):item
							//matcher3.group(2):line
							//matcher3.group(3):data,2
							//matcher3.group(4):n
							//args3[0]:data
							//args3[1]:2
							//args[0]:count
							
							//data = setline(data,setitem(line(data,2),count,n),2);
							return str;
						}
					}

					Pattern pattern2 = Pattern.compile("^(char|line|item|word)\\((.*)\\)$");
			        Matcher matcher2 = pattern2.matcher(args.length>=2?args[1]:"");
					if(matcher2.matches()){
						//チャンク形式
						Object[] args21 = getArgumentsFromStr(matcher2.group(2));
						String[] args2 = new String[args21.length];
						for(int i=0;i<args21.length;i++){
							args2[i] = (String) args21[i];
						}
						if(args2.length>=2){
							str = "";
							if(!varSet.contains(args2[0])&&args2[0].indexOf(".")==-1){
								if(matcher.group(1).equals("putAfter")){
									str = "var "+args2[0]+"=initVar("+args2[0]+"); ";
								}else{
									str = "var ";
								}
								varSet.add(args2[0]);
							}
							if(matcher.group(1).equals("putInto")){
								str += args2[0] +" = set"+matcher2.group(1)+"("+ args2[0]+","+args[0]+","+args2[1]+");";
							}else if(matcher.group(1).equals("putAfter")){
								str += args2[0] +" = set"+matcher2.group(1)+"("+ args2[0]+","+args2[0]+"+"+args[0]+","+args2[1]+");";
							}else{
								str += args2[0] +" = set"+matcher2.group(1)+"("+ args2[0]+","+args[0]+"+"+args2[0]+","+args2[1]+");";
							}
						}
					}else if(args.length>=2){
						str = "";
						if(!varSet.contains(args[1])&&args[1].indexOf(".")==-1){
							if(matcher.group(1).equals("putAfter")){
								str = "var "+args[1]+"=initVar("+args[1]+"); ";
							}else{
								str = "var ";
							}
							varSet.add(args[1]);
						}
						if(matcher.group(1).equals("putInto")){
							str += args[1] +" = "+ args[0]+";";
						}else if(matcher.group(1).equals("putAfter")){
							str += args[1] +" += "+ args[0]+";";
						}else{
							str += args[1] +" = "+ args[0] +"+"+ args[1]+";";
						}
					}
				}
			}
		}
		else if(cmdName.equals("delete")){
			if(str.matches("delete\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
			{
				//delete_ chunk
				// delete_(it.char(1));
				Pattern pattern = Pattern.compile("delete\\((char|item|word|line)\\(([^,]*),(.*)\\)\\);");
		        Matcher matcher = pattern.matcher(str);
				if(matcher.matches()){
					//単純なチャンク形式の場合
					str = matcher.group(2)+" = ";
					str += "set"+matcher.group(1)+"("+matcher.group(2)+",";
					str += "\"\""+","+matcher.group(3)+");";
				}
			}
		}
		else if(cmdName.equals("disable") || cmdName.equals("enable")){
			if(str.matches("(disable|enable)\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("set")){
			{
				//rect
		        Pattern pattern = Pattern.compile("setTo\\((.*).rect,(.*),(.*),(.*),(.*)\\);");
		        Matcher matcher = pattern.matcher(str);
				if(matcher.matches()){
					str = matcher.group(1)+".rect = rect("+matcher.group(2)+","+matcher.group(3)+","+matcher.group(4)+","+matcher.group(5)+");";
					return str;
				}
				//point
		        pattern = Pattern.compile("setTo\\((.*)(.loc|.location|.topLeft),(.*),(.*)\\);");
		        matcher = pattern.matcher(str);
				if(matcher.matches()){
					str = matcher.group(1)+matcher.group(2)+" = point("+matcher.group(3)+","+matcher.group(4)+");";
					return str;
				}
				else{
					//set to
			        pattern = Pattern.compile("setTo\\((([^\",]*\"[^\"]*\")*[^\",]*),(([^()]*\\([^()]*\\))*[^()]*)\\);");
			        matcher = pattern.matcher(str);
					if(matcher.matches()){
						if(propertySet.contains(matcher.group(1))){
							str = "system."+convPropertyName(matcher.group(1))+" = "+matcher.group(3)+";";
						}
						else{
							str = matcher.group(1)+" = "+matcher.group(3)+";";
						}
						pattern = Pattern.compile("(.*) = (.*);");
				        matcher = pattern.matcher(str);
						if(matcher.matches()){
							str = str.replaceAll(",","+");
						}
					}
					else{
						//コンマの位置を探す
						int commaIndex = -1;
						int bnest = 0;
						boolean qnest = false;
						for(int i=0; i<str.length(); i++){
							switch(str.charAt(i)){
							case ',':
								if(!qnest && bnest==1){
									commaIndex = i;
								}
								break;
							case '\"':
								qnest = !qnest;
								break;
							case '(':
								if(!qnest){
									bnest++;
								}
								break;
							case ')':
								if(!qnest){
									bnest--;
								}
								break;
							}
							if(commaIndex!=-1) break;
						}
						if(commaIndex!=-1){
							str = str.substring(6,commaIndex) +" = "+ str.substring(commaIndex+1,str.length()-2) +";";
						}
					}
				}
			}
		}
		else if(cmdName.equals("add")||cmdName.equals("subtract")||cmdName.equals("multiply")||cmdName.equals("divide")){
			{
				//put into/before/after
				Pattern pattern = Pattern.compile("^(addTo|subtractFrom|multiplyBy|divideBy)\\((.*)\\);$");
		        Matcher matcher = pattern.matcher(str);
		        boolean match = matcher.matches();
				if(match){
					Object[] args1 = getArgumentsFromStr(matcher.group(2));
					String[] args = new String[args1.length];
					for(int i=0;i<args1.length;i++){
						args[i] = (String) args1[i];
					}
					
					Pattern pattern3 = Pattern.compile("^(char|line|item|word)\\((char|line|item|word)\\((.*)\\),(.*)\\)$");
			        Matcher matcher3 = pattern3.matcher(args.length>=2?args[1]:"");
					if(matcher3.matches()){
						//2重のチャンク形式
						//例) put Count into item N of line 2 of DATA
						//例) putInto(count,  item(line(data,2),n)  );
						//チャンク形式
						Object[] args31 = getArgumentsFromStr(matcher3.group(3));
						String[] args3 = new String[args31.length];
						for(int i=0;i<args31.length;i++){
							args3[i] = (String) args31[i];
						}
						if(args3.length>=2){
							str = "";
							if(!varSet.contains(args3[0])&&args3[0].indexOf(".")==-1){
								str = "var "+args3[0]+";";
								varSet.add(args3[0]);
							}
							if(matcher.group(1).equals("addTo")){
								str += args3[0] +" = set"+matcher3.group(2)+"("+ //setline(
										args3[0]+",add"+matcher3.group(1)+"("+matcher3.group(2)+ //data,setitem(line
										"("+args3[0]+","+args3[1]+"),"+ //(data,2),
										args[0]+","+matcher3.group(4)+"),"+args3[1]+ //count,n),2
										");";
							}
							//matcher3.group(1):item
							//matcher3.group(2):line
							//matcher3.group(3):data,2
							//matcher3.group(4):n
							//args3[0]:data
							//args3[1]:2
							//args[0]:count
							
							//data = setline(data,setitem(line(data,2),count,n),2);
							return str;
						}
					}

					Pattern pattern2 = Pattern.compile("^(char|line|item|word)\\((.*)\\)$");
			        Matcher matcher2 = pattern2.matcher(args.length>=2?args[1]:"");
					if(matcher2.matches()){
						//チャンク形式
						Object[] args21 = getArgumentsFromStr(matcher2.group(2));
						String[] args2 = new String[args21.length];
						for(int i=0;i<args21.length;i++){
							args2[i] = (String) args21[i];
						}
						if(args2.length>=2){
							str = "";
							if(!varSet.contains(args2[0])&&args2[0].indexOf(".")==-1){
								str = "var "+args2[0]+";";
								varSet.add(args2[0]);
							}
							if(matcher.group(1).equals("addTo")){
								str += args2[0] +" = add"+matcher2.group(1)+"("+ args2[0]+","+args[0]+","+args2[1]+");";
							}else if(matcher.group(1).equals("subtractFrom")){
								str += args2[0] +" = subtract"+matcher2.group(1)+"("+ args2[0]+","+args2[0]+"+"+args[0]+","+args2[1]+");";
							}else if(matcher.group(1).equals("multiplyBy")){
								str += args2[0] +" = multiply"+matcher2.group(1)+"("+ args2[0]+","+args[0]+"+"+args2[0]+","+args2[1]+");";
							}else{
								str += args2[0] +" = divide"+matcher2.group(1)+"("+ args2[0]+","+args[0]+"+"+args2[0]+","+args2[1]+");";
							}
						}
					}else{
						//チャンクなしの場合
						//コンマの位置を探す
						int commaIndex = -1;
						int bnest = 0;
						boolean qnest = false;
						for(int i=0; i<str.length(); i++){
							switch(str.charAt(i)){
							case ',':
								if(!qnest && bnest==1){
									commaIndex = i;
								}
								break;
							case '\"':
								qnest = !qnest;
								break;
							case '(':
								if(!qnest){
									bnest++;
								}
								break;
							case ')':
								if(!qnest){
									bnest--;
								}
								break;
							}
							if(commaIndex!=-1) break;
						}
						if(commaIndex!=-1){
							String varStr = "";
							String memStr = "";
							if(cmdName.equals("add")||cmdName.equals("subtract")){
								memStr = str.substring(commaIndex+1,str.length()-2);
							}else{
								memStr = str.substring(11,commaIndex);
							}
							if(!varSet.contains(memStr)&&memStr.indexOf(".")==-1){
								varStr = "var ";
								varSet.add(memStr);
							}
							if(!cmdName.equals("add")&&!varStr.equals("")){
								varStr = "var "+memStr+";";
							}
							if(cmdName.equals("add")){
								str = varStr + memStr +" = (+"+ memStr +")+(+"+ str.substring(6,commaIndex) +");"; //addto
							}
							else if(cmdName.equals("subtract")){
								str = varStr + memStr +" -= "+ str.substring(13,commaIndex) +";"; //subtractfrom
							}
							else if(cmdName.equals("multiply")){
								str = varStr + memStr +" *= "+ str.substring(commaIndex+1,str.length()-2) +";"; //multiplyby
							}
							else if(cmdName.equals("divide")){
								str = varStr + memStr +" /= "+ str.substring(commaIndex+1,str.length()-2) +";"; //divideby
							}
						}
					}
				}
			}
		}
		else if(cmdName.equals("wait")){
			if(str.matches("waitUntil\\((.*)\\);")){
				str = "while(!(" + str.replaceFirst("waitUntil", "").substring(1,str.length()-10) + "){wait(0);}";
			}
		}
		else if(cmdName.equals("palette")){
			str = str.replaceFirst("palette", "paletteCmd");
		}
		else if(cmdName.equals("select")){
			//2チャンク
			// selectItemLine((line(it,2)) of,ln of cdFld("CHARSDATA2").text);
			Pattern pattern2 = Pattern.compile("([^(]*)\\((.*) of,(.*) of (.*).text\\);");
			Matcher matcher2 = pattern2.matcher(str);
			if(matcher2.matches()){
				str = matcher2.group(1)+"("+matcher2.group(4)+","+matcher2.group(2)+","+matcher2.group(3)+");";
			}
			else{
				//1チャンク
				Pattern pattern = Pattern.compile("([^(]*)\\((.*) of (.*).text\\);");
				Matcher matcher = pattern.matcher(str);
				if(matcher.matches()){
					str = matcher.group(1)+"("+matcher.group(3)+","+matcher.group(2)+");";
				}
			}
		}
		else if(cmdName.equals("send")){
			if(str.matches("(sendTo)\\((.*)\\.text\\);")){
				str = str.replaceFirst(".text\\);", "\\);");
			}
		}
		else if(cmdName.equals("sort")){
			Pattern pattern = Pattern.compile("^([^(]*)\\((.*)\\);");
			Matcher matcher = pattern.matcher(str);
			if(matcher.matches()){
				System.out.println(str);
				if(matcher.group(1).endsWith("By")){
					//sort*Byの場合
					Pattern pattern2 = Pattern.compile("^([^(]*)\\(([^,]*),(.*)\\);");
					Matcher matcher2 = pattern2.matcher(str);
					if(matcher2.matches()){
						matcher = matcher2;
					}
				}
				String strCmd = matcher.group(1);
				String optStr = "";
				
				if(strCmd.indexOf("ItemsOf")!=-1){
					strCmd = strCmd.replaceFirst("ItemsOf", "");
					optStr += ",\"items\"";
				}
				else if(strCmd.indexOf("LinesOf")!=-1){
					strCmd = strCmd.replaceFirst("LinesOf", "");
					optStr += ",\"lines\"";
				}
				
				if(strCmd.indexOf("Ascending")!=-1){
					strCmd = strCmd.replaceFirst("Ascending", "");
					optStr += ",\"ascending\"";
				}
				else if(strCmd.indexOf("Descending")!=-1){
					strCmd = strCmd.replaceFirst("Descending", "");
					optStr += ",\"descending\"";
				}
				
				if(strCmd.indexOf("Text")!=-1){
					strCmd = strCmd.replaceFirst("Text", "");
					optStr += ",\"text\"";
				}
				else if(strCmd.indexOf("Numeric")!=-1){
					strCmd = strCmd.replaceFirst("Numeric", "");
					optStr += ",\"numeric\"";
				}
				else if(strCmd.indexOf("Datetime")!=-1){
					strCmd = strCmd.replaceFirst("Datetime", "");
					optStr += ",\"datetime\"";
				}
				else if(strCmd.indexOf("International")!=-1){
					strCmd = strCmd.replaceFirst("International", "");
					optStr += ",\"international\"";
				}

				if(matcher.group(1).endsWith("By")){
					//sort*Byの場合
					if(matcher.group(2).indexOf(".text")!=-1){
						str = strCmd + "("+matcher.group(2).replaceFirst(".text", "") + optStr +","+ matcher.group(3) + ");";
					}else{
						str = matcher.group(2) +" = "+ strCmd + "("+matcher.group(2) + optStr +","+ matcher.group(3) + ");";
					}
				}else{
					//sort*Byでない場合
					if(matcher.group(2).indexOf(".text")!=-1){
						str = strCmd + "("+matcher.group(2).replaceFirst(".text", "") + optStr + ");";
					}else{
						str = matcher.group(2) +" = "+ strCmd + "("+matcher.group(2) + optStr + ");";
					}
				}
			}
		}
		
		return str;
	}
	
	private Object[] getArgumentsFromStr(String script){
		// "x,x,x" の解析を行う
		//0から引数が入る
		ArrayList<String> ret = new ArrayList<String>();
		StringBuilder str = new StringBuilder();
		script += ",";

		int nest=0;
		boolean quote=false;
		for(int i=0; i<script.length(); i++) {
			char code = script.charAt(i);
			if(code=='('&&!quote){
				nest++;
			}
			else if(code==')'&&!quote){
				nest--;
			}
			if(code=='\"'){
				quote = !quote;
			}
			else if(code=='\\'){
				str.append(code);
				i++;
				code = script.charAt(i);
			}
			if(code==','&&nest==0&&!quote){
				ret.add(str.toString());
				str.setLength(0);
				continue;
			}
			str.append(code);
		}
		
		return ret.toArray();
	}
}

