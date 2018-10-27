package javabeans;

import java.util.Comparator;

public class sortComparator implements Comparator<Object>{
	public int compare(Object o1, Object o2){
		return (((sortList)o2).date > ((sortList)o1).date)?1:-1;
	}
}