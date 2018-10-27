package javabeans;

import java.util.Date;

public class log {
	public static String make(String url, String query, String userId, String ip, String sid){
		StringBuilder builder = new StringBuilder();
		Date d = new Date(System.currentTimeMillis());
		builder.append(d);
		builder.append(" url:");
		builder.append(url);
		builder.append("?");
		builder.append(query);
		builder.append("  userId|");
		builder.append(userId);
		builder.append("|  ip:");
		builder.append(ip);
		builder.append("  sid[");
		builder.append(sid);
		builder.append("]");
		return builder.toString();
	}
}