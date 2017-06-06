# 本地调试

> 工具：ngrock内网穿透，phpstudy执行php脚本

### 准备步骤：

- 下载安装ngrock，解压在workplace目录下便于找到：（[知乎问答](https://www.zhihu.com/question/25456655)，[解决方案](http://ngrok.2bdata.com/)，[下载地址](https://pan.baidu.com/s/1i4QYcnV)）
- 下载安装phpstudy，选择phpstudy lite版下载同样安装在workplace目录下：（[phpstudy官网](http://www.phpstudy.net/)，[下载入口](http://www.phpstudy.net/a.php/208.html)）
- 在ngrock的解压目录打开cmd，输入ngrok -config=ngrok.cfg -subdomain xxx 80（其中xxx需要设置为外网域名的前缀，比如在这里我们设置为test，那么外网域名为test.tunnel.2bdata.com）
- 运行phpstudy，只需要启动Apache，需要进行设置：第一步，其他选项菜单--phpstudy设置--网站目录(改成自己存放项目的目录地址)。第二步，其他选项菜单--站点域名管理--网站目录(改成自己存放项目的目录地址)--网站域名(test.tunnel.2bdata.com)
- 本地项目仓库需要做一些更改：本地仓库也需要跟服务器端配置的./api/cache目录，其中heyQ.php保存测试服务号的开发者ID，outpath.php保存正式跨域接口域名，api_access_token.php和jsapi_ticket.php不用改（DataManipulation.php中的httpGet方法报错，好像是需要开启openssl或者是curl，目前的解决方案是改一下这个方法）
