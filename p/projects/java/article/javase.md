# 配置Java环境&安装eclipse

> 工欲善其事，必先利其器

## 安装与配置java环境

> jdk是执行java程序必须的环境

1. jdk下载与安装
   - 下载地址`http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html`根据自己电脑系统的位数选择32位或64位
   - 或者[点我进入下载页面](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
   - 安装过程：一直点下一步，默认安装即可（需要记住你的安装目录）

2. 配置环境变量
   - 在桌面找到计算机图标-右击选择属性-选择高级系统设置-选择环境变量-选择系统变量
   - 为环境变量path添加路径（找到安装目录jdk下的bin子目录的路径，放在path的最前，并添加英文分号;结尾）
   - 新建环境变量JAVA_HOME（找到安装目录jdk的路径）
   - 新建环境变量CLASSPATH（找到安装目录jdk下的lib子目录的路径，并在路径前面加上.;）

3. 测试安装是否成功
   - windows+R进入命令行，英文状态下输入java或者javac，回车
   - 弹出配置信息则说明安装成功

4. 编写HelloWorld.java程序并执行
   - 使用记事本编写代码-保存为HelloWorld.java-在存放HelloWorld.java的目录下按住shift并右击-选择打开命令行-英文状态下输入
   - javac HelloWorld.java
   - java HelloWorld

   ```java
   public class HelloWorld{
     public static void main(String[] args){
       System.out.println("hello world!");
     }
   }
   ```

## 安装eclipse集成开发环境

> IDE集程序开发环境和程序调试与一体的开发工具包

1. 下载并解压
   - 下载地址`http://www.eclipse.org/downloads/`根据自己电脑系统的位数选择32位或64位
   - 或者[点我进入下载页面](http://www.eclipse.org/downloads/)
   - 解压缩之后直接可以打开使用了
   ![](../image/eclipse.png)

2. 使用eclipse编写java程序
   - 创建java project
   - 新建java package
   - 新建java class
   - 编写程序并运行

3. 使用eclipse调试程序
   - 在可能出现问题的代码行设置断点，按debug按钮，开始调试
   - 按F6（step over）在断点处开始一步一步，一行一行往下执行代码

## 学习建议

- 多练
- 多问
- 自己动手打代码，调试错误
- 复习和总结
- 学虽容易，学好不易，且学且珍惜