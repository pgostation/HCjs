package javabeans;

public class environment{
	public static long getUserDiskSpace(String userId){
		if(userId.startsWith("_guest")){
			return 5000000L; //5.0MB
		}
		return 50000000L; //50.0MB
	}
}