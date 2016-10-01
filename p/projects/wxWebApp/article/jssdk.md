# 部署微信jssdk开发环境

> 项目文件结构

	api-
	 wx_get_access_token.php
	 wx_get_jsapi_ticket.php
	 cache-
	  access_token.txt
	  access_tokenTime.txt
	  jsapi_ticket.txt
	  jsapi_ticketTime.txt
	script-
	 zepto.min.js
	 sha1.js
	 wxJSSDK.js

[zepto.min.js获取地址](http://zeptojs.com/)

1. index.html

	```html
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>测试js-sdk</title>
	</head>
	<body>
	<h1>加载的js文件：</h1>
	<ul>
		<li>jweixin-1.0.0.js</li>
		<li>zepto.min.js</li>
		<li>sha1.js</li>
		<li>wxJSSDK.js</li>
	</ul>
	    <!-- 引入微信接口js文件 -->
		<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
		<!-- 引入移动web开发js框架 -->
		<script src="script/zepto.min.js"></script>
		<!-- 引入字段加密js文件 -->
		<script src="script/sha1.js"></script>
		<!-- 所有使用微信接口的页面必须先初始化微信jssdk -->
		<script src="script/wxJSSDK.js"></script>
	</body>
	</html>
	```

2. wxJSSDK.js

    ```javascript
	/*
	 * create by amen2020 in April 24, 2016
	 * 程序目的：
	 *  1.调用wx.config接口以初始化微信jssdk
	 *  2.第一步获取令牌access_token
	 *  3.第二步获取票据jsapi_ticket
	 *  4.第三步生成签名signature
	 *  5.第四步配置config接口参数并执行wx.config()进行初始化
	 *  6.详细说明请阅读微信开发者文档
	 *   （https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1445241432&token=&lang=zh_CN）
	 *
	 * 代码编写说明：
	 *  7.对于access_token与jsapi_ticket采用服务器端文本文件缓存
	 *  8.页面加载便访问服务器获取access_token与jsapi_ticket
	 *  9.遵循一个模块执行一个功能的原则
	 *  10.声明全局变量，防止污染js环境
	 */

	var wxJSSDK = {
		appName: 'weclient.hey-q.com', // 应用jssdk的项目
		version: '1.0.0', // 微信jssdk的版本
		access_token: '',
		jsapi_ticket: '',
		readySuccessCall: [], // 初始化成功后调用的接口列表
		config: {
			debug: true,
			appId: 'wxe259f1f58695b35e',
			timestamp: Math.ceil(new Date().getTime() / 1000).toString(),
			nonceStr: 'heyQ_wxJSSDK',
			signature: '',
			jsApiList: ['onMenuShareTimeline'] // 本页面需要调用的接口列表
		},
		// 向服务器获取access_token，传入call_j回调函数执行下一步操作获取jsapi_ticket
		get_access_token: function(call_j) {
			$.get('/api/wx_get_access_token.php', function(res_a) {
				call_j && call_j(res_a);
			});
		},
		// 向服务器获取jsapi_ticket，传入call_s回调函数执行下一步操作生成签名signature
		get_jsapi_ticket: function(call_s) {
			$.get('/api/wx_get_jsapi_ticket.php', {access_token: this.access_token}, function(res_j) {
	            call_s && call_s(res_j);
			});
		},
		// 进行签名算法并配置config的signature字段，传入call_c回调函数执行wx.config()开始初始化
		get_signature: function(call_c) {
			var signatureStr =  'jsapi_ticket=' + this.jsapi_ticket
			    + '&noncestr=' + this.config.nonceStr
			    + '&timestamp=' + this.config.timestamp
			    + '&url=' + window.location.href;
			this.config.signature = hex_sha1(signatureStr);
			call_c && call_c();
		},
		// 初始化
		init: function() {
			if(!wx) { // 验证是否存在wx对象
				console.log('请检查是否引入微信JSSDK');
				return;
			}
			var that = this;
			// 初始化第一步开始
			this.get_access_token(function(res_a) { // 我是call_j回调函数
				that.access_token = JSON.parse(res_a).access_token;
				// 得到access_token后开始下一步
				that.get_jsapi_ticket(function(res_j) { // 我是call_s回调函数
					that.jsapi_ticket = JSON.parse(res_j).ticket;
					// 得到jsapi_ticket后开始下一步
					that.get_signature(function() { // 我是call_c回调函数
						// 开始初始化
						wx.config(that.config);
						// 若成功会执行ready方法，可以开始调用微信jssdk各接口
						wx.ready(function() {
							// 执行初始化完毕后开始调用readySuccessCall接口列表
							if(that.readySuccessCall.length > 0) {
								$.each(that.readySuccessCall, function(index, interface) {
									interface();
								});
							}
						});
						// 若失败会执行error方法，可以通过返回的res参数查看错误信息
						wx.error(function(res_e) {
							console.log(res_e);
						});
					});
				});
			});
		}
	};

	// 执行初始化
	wxJSSDK.init();
	```

3. wx_get_access_token.php

	```php
	<?php
	/*
	 * create by amen2020 in April 24, 2016
	 * 程序目的：
	 *  1.在服务器端向微信获取access_token并保存（./api/cache/access_token.txt）
	 *  2.防止多次调用获取access_token的接口
	 *  3.响应前端页面请求并返回access_token
	 *  4.php相关语法请自行google
	 */

	// 读取access_token
	$access_tokenFileValue = fopen("./cache/access_token.txt", "r");
	$access_token = fread($access_tokenFileValue, 1023);
	$access_tokenFileTime = fopen("./cache/access_tokenTime.txt", "r");
	$access_tokenTime = intval(fread($access_tokenFileTime, 1023));

	// 根据时间戳计算access_token已成效的时间
	$timeInterval = time() - $access_tokenTime;

	// access_token有效期expires_in目前是7200，即2小时
	// 当access_token保存时间大于1小时，重新获取access_token
	if($timeInterval >= 3600) {
		$res = file_get_contents("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxe259f1f58695b35e&secret=452c19b3acda7fac9ea6293eec5b948f");
		$res = json_decode($res, true);
		$access_token = $res["access_token"];

		// 更新并写入access_token
		if(is_writable("./cache/access_token.txt") && is_writable("./cache/access_tokenTime.txt")) {
			file_put_contents("./cache/access_token.txt", $access_token);
			file_put_contents("./cache/access_tokenTime.txt", time());

			// 直接返回调用微信接口所返回的json数据
			echo json_encode($res);
		}else{ // 为防止没有权限写入文件，不写入服务器直接返回
		    echo json_encode($res);
		}
	}else{
		// 以json格式返回access_token
		echo '{"access_token":"'.$access_token.'"}';
	}

	?>
	```

4. wx_get_jsapi_ticket.php

	```php
	<?php
	/*
	 * create by amen2020 in April 24, 2016
	 * 程序目的：
	 *  1.在服务器端根据access_token向微信获取jsapi_ticket并保存（./api/cache/jsapi_ticket.txt）
	 *  2.响应前端页面请求拿到access_token
	 *  3.向微信请求jsapi_ticket并返回前端页面
	 *  4.程序结构类似wx_get_access_token.php
	 */

	$jsapi_ticketFile = fopen("./cache/jsapi_ticket.txt", "r");
	$jsapi_ticket = fread($jsapi_ticketFile, 1023);
	$jsapi_ticketFileTime = fopen("./cache/jsapi_ticketTime.txt", "r");
	$jsapi_ticketTime = intval(fread($jsapi_ticketFileTime, 1023));

	$timeInterval = time() - $jsapi_ticketTime;

	if($timeInterval >= 3600) {
		// 拿到前端页面请求传入的access_token
		$access_token = $_GET["access_token"];

		$wx_api_url = sprintf("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi",
			$access_token);
		$res = file_get_contents($wx_api_url);
		$res = json_decode($res, true);
		$jsapi_ticket = $res["ticket"];

		if(is_writable("./cache/jsapi_ticket.txt") && is_writable("./cache/jsapi_ticketTime.txt")) {
			file_put_contents("./cache/jsapi_ticket.txt", $jsapi_ticket);
			file_put_contents("./cache/jsapi_ticketTime.txt", $time());
			
			echo json_encode($res);
		}else{
			echo json_encode($res);
		}
	}else{
		echo '{"ticket":"'.$jsapi_ticket.'"}';
	}

	?>
	```

5. sha1.js

	```javascript
	/*
	 * create by amen2020 in April 24, 2016
	 * 程序目的：
	 *  1.用于前端js签名算法
	 */

	var sha1 = {
	  hexcase: 0, // hex output format. 0 - lowercase; 1 - uppercase 
	  chrsz: 8, // bits per input character. 8 - ASCII; 16 - Unicode 
	  hex_sha1: function(s) {
	    var that = this;
	    return this.binb2hex(that.core_sha1(that.str2binb(s), s.length * chrsz));
	  },
	  binb2hex: function(binarray) { // Convert an array of big-endian words to a hex string
	    var str,
	        hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	    for(var i = 0; i < binarray.length * 4; i++){
	      str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
	          hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
	    }
	    return str;
	  },
	  core_sha1: function(x, len) { // Calculate the SHA-1 of an array of big-endian words, and a bit length
	    var w = Array(80),
	        a =  1732584193,
	        b = -271733879,
	        c = -1732584194,
	        d =  271733878,
	        e = -1009589776;

	    // append padding
	    x[len >> 5] |= 0x80 << (24 - len % 32);
	    x[((len + 64 >> 9) << 4) + 15] = len;

	    for(var i = 0; i < x.length; i += 16){
	      var olda = a,
	          oldb = b,
	          oldc = c,
	          oldd = d,
	          olde = e,
	          t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
	          safe_add(safe_add(e, w[j]), sha1_kt(j)));

	      for(var j = 0; j < 80; j++){
	        if(j < 16) {
	          w[j] = x[i + j];
	        }else{
	          w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
	        }
	        e = d;
	        d = c;
	        c = rol(b, 30);
	        b = a;
	        a = t;
	      }

	      a = safe_add(a, olda);
	      b = safe_add(b, oldb);
	      c = safe_add(c, oldc);
	      d = safe_add(d, oldd);
	      e = safe_add(e, olde);
	    }
	    return Array(a, b, c, d, e);
	  },
	  // Bitwise rotate a 32-bit number to the left
	  rol: function(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	  },
	  // Add integers, wrapping at 2^32. This uses 16-bit operations internally to work around bugs in some JS interpreters
	  safe_add: function(x, y) {
	    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
	        msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	    return (msw << 16) | (lsw & 0xFFFF);
	  },
	  // Perform the appropriate triplet combination function for the current iteration
	  sha1_ft: function(t, b, c, d) {
	    if(t < 20) {
	      return (b & c) | ((~b) & d);
	    }else if(t < 40) {
	      return b ^ c ^ d;
	    }else if(t < 60) {
	      return (b & c) | (b & d) | (c & d);
	    }
	    return b ^ c ^ d;
	  },
	  // Determine the appropriate additive constant for the current iteration
	  sha1_kt: function(t) {
	    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 : (t < 60) ? -1894007588 : -899497514;
	  },
	  // Convert an 8-bit or 16-bit string to an array of big-endian words In 8-bit function, characters >255 have their hi-byte silently ignored.
	  str2binb: function(str) {
	    var bin = Array();
	    var mask = (1 << chrsz) - 1;
	    for(var i = 0; i < str.length * chrsz; i += chrsz) {
	      bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
	    }
	    return bin;
	  }
	};
	```