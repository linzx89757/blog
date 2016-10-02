# 微信公众平台网页开发

> 项目文件结构

	api-
	  wxWebToken.php
	  wxConfig.php
	  cache-
	    heyQ.php
	    api_access_token.php
	    jsapi_ticket.php
	  class-
	    DataManipulation.php
	    WebToken.php
	    ApiAccess_token.php
	    JSSDK_config.php
	script-
	  userLogin.js
	  wxJSSDK.js
    
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
    
    heyQ.php->服务器端保存公众平台的开发者应用ID和秘钥
    <?php exit();?>
    {"appId":"微信公众平台的应用ID","appSecret":"微信公众平台的应用秘钥"}
    
    api_access_token.php->服务器端缓存access_token
    <?php exit();?>
    {"access_token":"","expire_time":}
    
    jsapi_ticket.php->服务器端缓存jsapi_ticket
    <?php exit();?>
    {"jsapi_ticket":"","expire_time":}

## [网页授权机制](article/webtoken.md)

## [公众号开发](article/weclient.md)

## [JSSDK初始化与调用](article/jssdk.md)