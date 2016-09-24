# 9*9乘法表的扩展

> 封装一个测试类，命名为MTExpand，下面会用到这个MTExpand类

```java
public class MTExpand {
	//在类中定义一个方法，用while循环执行功能，命名为whileTest
	public void whileTest() {
		int i = 1;
		while(i <= 9) {
			int j = 1;
			while(j <= i) {
				int c = i * j;
				System.out.print(i + "*" + j + "=" + c + "\t");
				j++;
			}
			System.out.println();
			i++;
		}
	}
	//在类中定义另一个方法，用for循环执行功能，命名为forTest
	public void forTest() {
		for(int i = 1; i <= 9; i++) {
			for(int j = 1; j<= i; j++) {
				int c = i * j;
				System.out.print(i + "*" + j + "=" + c + "\t");
			}
			System.out.println();
		}
	}
	
	public static void main(String[] args) {
		//定义一个MTExpand类型的变量，test
		MTExpand test;
		//把类初始化，赋值给test变量
		test = new MTExpand();
		//调用类中定义的whileTest方法
		test.whileTest();
		System.out.println("=======================两个乘法表的分割线=======================");
		//调用类中定义的forTest方法
		test.forTest();
	}
}
```