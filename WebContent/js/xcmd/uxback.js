"use strict";

function uxback(mode,opt1,opt2){
//UxBack "Black"
//UxBack 65535*MIN((the ticks - TIMEX)/120,1)
//UxBack "ICON",1010+N,2
//UxBack "ppat","裏"
//UxBack close
	extractQueue();//強制停止のため
	if(vmStopFlag)return;
	postMessage({cmd:"uxback", mode:mode, opt1:opt1, opt2:opt2});
}