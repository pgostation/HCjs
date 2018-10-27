function uxgetinkey(mode){
	extractQueue();//キー入力を更新
	for(var k in keys){
		if(keys[k]==true){
			if(mode=="c"||mode=="C"){
				return String.fromCharCode(k);
			}else{
				return k;
			}
		}
	}
	return "";
}