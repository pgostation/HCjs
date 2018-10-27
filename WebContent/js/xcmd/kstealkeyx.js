"use strict";

function kstealkeyx(x){
	var keyAry = {};

	var keycode_return = 13;
	var keycode_au = 38;
	var keycode_ad = 40;
	var keycode_al = 37;
	var keycode_ar = 39;
	var keycode_ctrl = 17;
	var keycode_caps = 20;
	var keycode_backspace = 8;
	var keycode_delete = 46;
	var keycode_esc = 27;

	var ret = "";
	for(var i=0; i<x.length; i++){
		var c = x.charAt(i);
		if(c=='^' && i+2<x.length){
			var key = x.substring(i,i+3);
			i+=2;
			var n=null;
			if(key=="^au") n = keycode_au;
			if(key=="^ad") n = keycode_ad;
			if(key=="^al") n = keycode_al;
			if(key=="^ar") n = keycode_ar;
			if(key=="^re") n = keycode_return;
			if(key=="^sh") n = keycode_shift;
			if(key=="^sf") n = keycode_shift;
			if(key=="^op") n = keycode_alt;
			if(key=="^ct") n = keycode_ctrl;
			if(key=="^cm") n = keycode_meta;
			if(key=="^ca") n = keycode_caps;
			if(key=="^de") n = keycode_backspace;
			if(key=="^dl") n = keycode_delete;
			if(key=="^es") n = keycode_esc;
			if(key=="^t0") n = 96;
			if(key=="^t1") n = 97;
			if(key=="^t2") n = 98;
			if(key=="^t3") n = 99;
			if(key=="^t4") n = 100;
			if(key=="^t5") n = 101;
			if(key=="^t6") n = 102;
			if(key=="^t7") n = 103;
			if(key=="^t8") n = 104;
			if(key=="^t9") n = 105;
			if(n!=null){
				ret += (keys[n])?"1":"0";
				keyAry[n] = true;
			}
		}else{
			var n = c.charCodeAt(0);
			if(n>=32 && n < 128){
				if(n>='0'.charCodeAt(0)&&n<='9'.charCodeAt(0)){//数字キーはテンキーも合わせて読む
					ret += (keys[n]||keys[96+n-'0'.charCodeAt(0)])?"1":"0";
				}else{
					ret += (keys[n])?"1":"0";
				}
				keyAry[n] = true;
			}
		}
	}

	postMessage({cmd:"VirtualPadInstall", keys:keyAry});

	system._result = "";
	return ret;
}