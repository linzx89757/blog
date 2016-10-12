# JSSDK初始化与调用

[请参考微信公众平台开发者文档](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN)  
[demo体验](http://demo.open.weixin.qq.com/jssdk)

## 第一步 了解JSSDK

1. 微信JS-SDK是微信公众平台面向网页开发者提供的基于微信内的网页开发工具包，说白了就是微信开放了一些接口允许我们通过编写js来调用
2. 通过调用JSSDK接口，网页开发者可借助微信高效地使用拍照、选图、语音、位置等手机系统的能力，同时可以直接使用微信分享、扫一扫、卡券、支付等微信特有的能力，为微信用户提供更优质的网页体验
3. 您应该登录公众平台在开发者中心查看一下您的公众号已获得的接口权限和某些接口的调用频次限制


## 第二步 了解如何使用JSSDK

1. 需要在公众平台配置JS接口安全域名，在需要调用JS接口的页面引入一个JS文件
2. 调用JS接口前需要初始化，初始化是通过config接口注入配置参数验证接口权限
3. 可以在config接口中打开调试模式，在开发测试阶段进行debug
4. 其他接口必须在config接口验证完成后，才能进行调用，一旦config接口验证完成，将自动执行ready函数，此时可以把一些在页面加载并且不需要用户触发就需要调用的接口可以放在ready函数中。如果config接口验证失败会自动执行error函数，反馈给我们一些错误信息，帮助我们调试(errMsg在调试状态会提示，客户端alert、pc端console)
5. 所有接口基于wx对象，例如wx.config()将会调用config接口，并且每个接口除了需要特定传的参数外，有几个通用的回调函数：success、fail等，这些回调函数都会回传一个r对象，r对象有一个通用属性errMsg，告诉我们接口的调用状态
6. 关于JSSDK各类接口的调用说明请参考开发者文档或者通过demo体验


## 第三步 了解如何初始化JSSDK(附上代码)

1. 需要在服务器端配置config参数包，其中配置签名字段需要涉及到三个东西
   - 本页面的url(单页面url变化时需要重新初始化，同一个url只需初始化一次)
   - 接口调用临时票据[jsapi_ticket](https://mp.weixin.qq.com/wiki?action=doc&id=mp1421141115&t=0.6831531645703521&token=&lang=zh_CN#fl1)(具有调用次数限制和有效期，需要在服务器端缓存)，jsapi_ticket需要通过access_token来用http的get请求获得
   - 接口调用凭证[access_token](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183&token=&lang=zh_CN)(和jsapi_ticket一样具有调用次数限制和有效期，需要在服务器端缓存)，access_token需要通过公众号的应用ID和应用秘钥来http的get请求获得

    ```php
    /**
     * 程序说明：
     *  1.一个微信jssdk接口调用凭证access_token的类，命名为ApiAccess_token
     *  2.提供一个公共方法，getApiAccessToken()
     **/
    <?php
    require_once "DataManipulation.php";
    
    class ApiAccess_token extends DataManipulation{
        private $appId;
        private $appSecret;
        private $apiAccessTokenFile;
    
        public function __construct($appId, $appSecret, $apiAccessTokenFile) {
            $this->appId = $appId;
            $this->appSecret = $appSecret;
            $this->apiAccessTokenFile = $apiAccessTokenFile;
        }
    
        public function getApiAccessToken() {
    
            $data = json_decode($this->getPhpFile($this->apiAccessTokenFile));
    
            if ($data->expire_time < time()) { // 本地保存与更新access_token
                // 如果是企业号用以下URL获取access_token
                // $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=$this->appId&corpsecret=$this->appSecret";
                $url = "https://api.weixin.qq.com/cgi-bin/token?".
                       "grant_type=client_credential&".
                       "appid=$this->appId&secret=$this->appSecret";
                $res = $this->httpGet($url);
                $resObj = json_decode($res);
    
                $access_token = $resObj->access_token;
                $expire_time = $resObj->expires_in;
    
                if ($access_token) {
    
                    $data->expire_time = time() + ($expire_time - 200);
                    $data->access_token = $access_token;
                    $this->setPhpFile($this->apiAccessTokenFile, json_encode($data));
                }
            } else {
                $access_token = $data->access_token;
            }
            
            return $access_token;
        }
    }
    ?>
    ```

    ```php
    /**
     * 程序说明：
     *  1.一个微信jssdk接口初始化配置的类，命名为JSSDK_config
     *  2.提供一个公共方法，getConfigPackage()
     **/
    <?php
    require_once "ApiAccess_token.php";
    
    class JSSDK_config extends ApiAccess_token{
        private $appId;
        private $access_token;
        private $jsapiTicketFile;
        private $pageURL;
    
        public function __construct($appId, $access_token, $jsapiTicketFile, $pageURL) {
            $this->appId = $appId;
            $this->access_token = $access_token;
            $this->jsapiTicketFile = $jsapiTicketFile;
            $this->pageURL = $pageURL;
        }
    
        public function getConfigPackage() {
    
            $jsapiTicket = $this->getJsapiTicket();
            $nonceStr = $this->createNonceStr();
            $timestamp = time();
    
            $string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$this->pageURL";
            $signature = sha1($string);
    
            $configPackage = array(
                "appId"     => $this->appId,
                "nonceStr"  => $nonceStr,
                "timestamp" => $timestamp,
                "signature" => $signature,
                "pageURL"   => $this->pageURL, // 对调试有用
                "rawString" => $string // 对调试有用
            );
    
            return json_encode($configPackage);
        }
    
        private function createNonceStr($length = 16) {
    
            $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            $str = "";
    
            for ($i = 0; $i < $length; $i++) {
                $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
            }
    
            return $str;
        }
    
        private function getJsapiTicket() {
    
            $data = json_decode($this->getPhpFile($this->jsapiTicketFile));
    
            if ($data->expire_time < time()) { // 本地保存与更新jsapi_ticket
                // 如果是企业号用以下 URL 获取 ticket
                // $url = "https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=$accessToken";
                $url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?".
                       "access_token=$this->access_token".
                       "&type=jsapi";
                $res = $this->httpGet($url);
                $resObj = json_decode($res);
    
                $jsapi_ticket = $resObj->ticket;
                $expire_time = $resObj->expires_in;
    
                if ($jsapi_ticket) {
    
                    $data->expire_time = time() + ($expire_time - 200);
                    $data->jsapi_ticket = $jsapi_ticket;
                    $this->setPhpFile($this->jsapiTicketFile, json_encode($data));
                }
            } else {
                $jsapi_ticket = $data->jsapi_ticket;
            }
    
            return $jsapi_ticket;
        }
    
    }
    ?>
    ```

2. 响应前端返回config参数包的接口
   - 以json数据格式返回config参数包
   - pageURL为需要初始化JSSDK的页面url

    ```php
    <?php
    require_once "class/JSSDK_config.php";
    
    $pageURL = isset($_GET['pageURL'])?$_GET['pageURL']:null;
    
    $heyQStr = trim(substr(file_get_contents("cache/heyQ.php"), 15));
    $heyQ = json_decode($heyQStr);
    
    $appId = $heyQ->appId;
    $appSecret = $heyQ->appSecret;
    $apiAccessTokenFile = "cache/api_access_token.php";
    $jsapiTicketFile = "cache/jsapi_ticket.php";
    
    $apiAccess_token = new ApiAccess_token($appId, $appSecret, $apiAccessTokenFile);
    $access_token = $apiAccess_token->getApiAccessToken();
    
    $config = new JSSDK_config($appId, $access_token, $jsapiTicketFile, $pageURL);
    
    echo $config->getConfigPackage();
    ?>
    ```

3. 前端编写js调用config接口
   - 在开发测试阶段应该打开调试模式进行debug，在生产环境应该关闭调试模式
   - config是一个客户端的异步操作，所以$wxJSSDK()应该在页面的头部就执行，保证页面加载的同时进行初始化JSSDK

    ```javascript
    /**
     * @method
     * $wxJSSDK({
     *     isDebug: true, // 是否开启调试模式，默认开启
     *     jsApiList: ['checkJsApi'], // 必须，初始化需要调用的接口列表
     *     successCall: function() { // 初始化成功执行的回调函数
     *         // 调用基础接口checkJsApi，检测当前客户端是否支持指定的接口
     *         // 目前用于调试，后面是否需要为继续调用接口做一个判断？？
     *         wx.checkJsApi({
     *             jsApiList: ['chooseImage'],
     *             success: function(res) {
     *                 console.log(res);
     *             }
     *         });
     *     },
     *     failCall: function(errMsg) { // 初始化失败执行的回调函数，errMsg为错误信息
     *         // 对于SPA可以在这里更新签名
     *     }
     * });
     **/
    (function(window) {
        "use strict";
    
        var pageURL = location.href.split('#')[0], // 当前html页面不包括(#)后面的完整url
            config = {
                debug: false, // 默认关闭调试模式
                appId: '',
                timestamp: 0,
                nonceStr: '',
                signature: '',
                jsApiList: []
            };
    
        window.$wxJSSDK = function(defaults) { // 传入配置信息，用defaults对象接收
    
            // 完成config参数的配置，然后开始调用wx.config接口
            fillConfig(defaults.isDebug, defaults.jsApiList, function() {
                wx.config(config);
    
                wx.ready(function() { // 初始化成功马上调用wx.ready接口，执行successCall函数
                    defaults.successCall && defaults.successCall();
                });
    
                wx.error(function(res) { // 初始化失败时调用wx.error接口，执行failCall函数
                    defaults.failCall && defaults.failCall(res);
                });
            });
        };
        
        function fillConfig(isDebug, jsApiList, initCall) {
            if (isDebug === true) {
                config.debug = true;
            }
            for(var i = 0; i < jsApiList.length; i++) {
                config.jsApiList.push(jsApiList[i]);
            }
            $.get($WX_API.wxConfig, {pageURL: encodeURI(pageURL)}, function(res) {
                var data = JSON.parse(res);
                config.appId = data.appId;
                config.timestamp = data.timestamp;
                config.nonceStr = data.nonceStr;
                config.signature = data.signature;
                
                initCall && initCall();
            });
        }
    
    })(window);
    ```