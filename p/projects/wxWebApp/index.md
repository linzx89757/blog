# 微信网页开发

> 文章只分享项目实战开发中踩过的坑，以及实际的解决方案（非第三方开发解决方案）

## 首先分享我对微信网页开发的理解：

基于微信公众平台的网页开发，和一般的web开发没有什么太大的不一样，同样需要根据自己的业务架设服务器和数据库，设计用户交互界面。而不同之处在于，微信是一个app，利用微信公众平台开放的JS-SDK网页开发工具包，我们可以在网页上通过javascript调用JSSDK接口来使用微信原生功能，实现webapp的应用模式   
同时可以利用网页授权机制帮助我们唯一标识用户和获取用户个人资料，从而免去了让用户注册和登录这一步操作，而且微信提供了一个UI库[weui](https://weui.io/)，在网页上使用这个UI库，让用户浏览网页像在使用微信的东西一样那么自然  
其中需要在公众号和在自己的服务器上进行一些配置  
为帮助开发者更方便、更安全地开发和调试基于微信的网页，微信推出了[微信web开发者工具](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1455784140&token=&lang=zh_CN)

## [网页授权机制](article/webtoken.md)

## [JSSDK初始化与调用](article/jssdk.md)

## [本地调试](article/jssdk.md)

> 项目文件结构  
> *服务器环境为php环境*

	api-
	  wxWebToken.php // 响应前端网页授权的接口
	  wxConfig.php // 响应前端调用JSSDK初始化的接口
	  cache-
	    heyQ.php
	    api_access_token.php
	    jsapi_ticket.php
	  class-
	    DataManipulation.php
	    WebToken.php // 处理网页授权的类
	    ApiAccess_token.php // 获取全局接口调用唯一凭证access_token的类
	    JSSDK_config.php // 处理JSSDK初始化config参数包的类
	script-
	  userLogin.js
	  wxJSSDK.js
    
    heyQ.php->服务器端保存公众号的开发者应用ID和秘钥
    <?php exit();?>
    {"appId":"应用ID","appSecret":"应用秘钥"}
    
    api_access_token.php->服务器端缓存access_token
    <?php exit();?>
    {"access_token":"","expire_time":}
    
    jsapi_ticket.php->服务器端缓存jsapi_ticket
    <?php exit();?>
    {"jsapi_ticket":"","expire_time":}

    DataManipulation.php->封装一个数据操作的公共类，包括http get请求和服务器本地文本文件缓存数据的读写
    <?php
    class DataManipulation {
    	public function httpGet($url) {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_TIMEOUT, 500);
            // 为保证第三方服务器与微信服务器之间数据传输的安全性，所有微信接口采用https方式调用，必须使用下面2行代码打开ssl安全校验。
            // 如果在部署过程中代码在此处验证失败，请到 http://curl.haxx.se/ca/cacert.pem 下载新的证书判别文件。
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, true);
            curl_setopt($curl, CURLOPT_URL, $url);
            $res = curl_exec($curl);
            curl_close($curl);
            return $res;
        }
        public function getPhpFile($fileName) {
            return trim(substr(file_get_contents($fileName), 15));
        }
        public function setPhpFile($fileName, $content) {
            file_put_contents($fileName, "<?php exit();?>".$content) or die("unable to write");
        }
    }
    ?>
