# 双金字塔的打印

```java
public class doubleTriangle {
    public void xinxin(int a) {
    	for(int j = 1; j <= a; j++) {
    		System.out.print(" ");
    	}
    	for(int i = 1; i <= (7 - 2 * a); i++) {
    		System.out.print("*");
    	}
    	System.out.println();
    }
	public static void main(String[] args) {
		doubleTriangle test = new doubleTriangle();
		int a = 0;
		for(int i = 1; i <= 7; i++) {
			if(i <= 4) {
				a = i - 1;
				test.xinxin(a);
			}else if(i <= 7) {
				a--;
				test.xinxin(a);
			}
		}
	}
}
```