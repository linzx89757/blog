# 网页授权机制

本文只分享项目实战开发中踩过的坑，以及实际的解决方案（非第三方开发解决方案）  
[请参考微信公众平台开发者文档](https://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html)

> 第一步 了解openid和unionid

1. openid可以唯一标识用户，每个用户针对每个公众号会产生一个安全的openid
2. unionid可以在多个公众号、移动应用做用户共通

> 第二步 了解授权机制

1. 需要在公众平台配置授权回调域名
2. 两种授权类型：静默授权获取用户openid、授权登录获取用户基本信息（实质都是跳转到授权链接进行授权然后又跳转回配置的回调页面链接，此时回调页面链接会带上code字段，可以通过code字段的值进行下一步业务，获取openid或者用户基本信息）
3. 静默授权机制：当跳转到静默授权链接进行授权后自动跳转回调页面，该行为用户无明显感知，只看到加载进度条发生了两次加载
4. 授权登录机制：当跳转到授权登录链接时需要用户决定是否同意登录，该行为如果发生在用户从公众号的会话或者菜单进入授权，则行为和静默授权一样
5. 注意事项：
   - 通过code换取的access_token，和基础支持获取的access_token不一样，后者用于调用JSSDK接口与公众号开发
   - 授权登录获取用户基本信息，和用户管理类接口中的“获取用户基本信息接口”不一样，后者是用户必须关注了公众号才会调用成功拿到数据

> 第三步 了解授权后如何通过code字段进行下一步业务

1. 静默授权：通过code获取openid
2. 授权登录：通过code获取openid和access_token，从而获取用户基本信息
3. 以上业务需要在服务器端执行

> 第四步 项目实战（附上代码）  
> *后台需要做的配合：配合静默授权提供一个用户查重接口、配合授权登录提供一个新增用户接口*

1. 在前端处理用户登录的公共脚本userLogin.js，以openid唯一标识用户
   - $userLogin(function(openid) {});
   - 使用说明：在页面中引入该脚本，传入回调函数统一处理openid，并且执行顺序优先于页面所有业务逻辑，也就是说传入的回调函数是页面业务逻辑的执行入口
   - 引入cookie机制：将openid缓存到cookie进行标识用户登录状态，如果检测到cookie有openid，开始执行从页面的业务逻辑，如果检测到cookie不存在openid，开始授权流程
   - 授权流程：先静默授权拿openid，根据openid进行用户查重，如果用户存在说明cookie被清，则将openid重新缓存到cookie；如果用户不存在说明该用户首次访问，进行授权登录，拿用户的个人信息，保存到数据库，并且将openid重新缓存到cookie；由于授权后回调url会带上code字段，针对这种情况在openid缓存进cookie后跳转回页面干净的url

	(function(window) {
		"use strict";

	    var appid, // 微信公众平台的应用ID
	    	openid = store.get("openid"), // 使用store.js
	    	code = getUrlParam("code"), // 用于判断用户是否开始授权
	        state = getUrlParam("state"), // 用于区分静默授权还是授权登录状态
	        pageURL = url(); // 回调页(拿到页面干净的url地址，不包括code等字段)

	    window.$userLogin = function(call) {
            if(openid){
                // alert("检测cookie有openid，开始执行业务"); // --->>>debug
                call && call(openid);
            }else{
                if(!code) {
                    // alert("检测cookie没有openid，开始授权，先进行静默授权"); // --->>>debug
                    location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
                        "appid=" + appid +
                        "&redirect_uri=" + encodeURI(pageURL) +
                        "&response_type=code&scope=snsapi_base&state=heyQScopeBase#wechat_redirect"; // 将state配置为heyQScopeBase标识为静默授权状态
                }else{
                    if(state === "heyQScopeBase") {
                        // alert("通过静默授权，开始用户查重"); // --->>>debug
                        checkDB(function() { // 用户不存在，进行授权登录
                            location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
                                "appid=" + appid +
                                "&redirect_uri=" + encodeURI(pageURL) +
                                "&response_type=code&scope=snsapi_userinfo&state=heyQScopeUserinfo#wechat_redirect"; // 将state配置为heyQScopeUserinfo标识为授权登录状态
                        }, function(openid) { // 用户存在，缓存openid到cookie并开始执行业务
                            store.set("heyQ" + appid, openid);
                            location.href = pageURL;
                        });
                    }else if(state === "heyQScopeUserinfo") {
                        // alert("首次登陆，需要保存您的微信个人资料"); // --->>>debug
                        saveDB(function(openid) { // 个人资料保存成功，缓存openid到cookie并开始执行业务
                            store.set("heyQ" + appid, openid);
                            location.href = pageURL;
                        });
                    }
                }
            }
	    };

	    // 静默授权，拿到openid，检查数据库是否存在该用户
	    function checkDB(not_existCall, existCall) {
	        $.get($WX_API.wxWebToken, {code: code, state: state}, function(openid) {
	    		$ajax.post({ // 自己封装zepto的ajax
	    			url: "check_userExist",
	    			data: {
	    				"openid": openid,
	    			},
	                modal: false // 关闭加载动画，不让用户感知
	    		}).then(function(r) {
	    			if(r.msg === "0") {
	    				not_existCall && not_existCall();
	                }else if(r.msg === "1") {
	                    existCall && existCall(openid);
	    			}
	    		}, function(r) {
	    			console.log(r);
	    		});
	        });
	    }
	    // 获取用户的个人信息，保存到数据库
	    function saveDB(callback) {
	        $.get($WX_API.wxWebToken, {code: code, state: state}, function(r) {
	            var data = JSON.parse(r);
	            $ajax.post({
	                url: "add_or_update_userData",
	                data: {
	                    "openid": data.openid,
	                    "nickname": data.nickname,
	                    "sex": data.sex,
	                    "city": data.city,
	                    "country": data.country,
	                    "province": data.province,
	                    "language": data.language,
	                    "headimgurl": data.headimgurl,
	                    "unionid": data.unionid,
	                    "privilege": data.privilege
	                },
	                modal: false // 关闭加载动画，不让用户感知
	            }).then(function(r) {
	                callback && callback(data.openid);
	            }, function(r) {
	                console.log(r);
	            });
	        });
	    }

		/**
		 * 当前url指定查询字段的值，没有则返回null
		 * @param name 查询字段名
		 * @returns {string}
		 */
		function getUrlParam(name) {
		    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'),
		        r = location.search.substr(1).match(reg);
		    if(r !== null) {
		        return unescape(r[2]);
		    }
		    return null;
		}
		/**
		 * 清除进行授权后url地址附带的code字段等，获取干净的url
		 * @returns {string}
		 */
		function url() {
		    var url = location.href, // 获取当前页面的url地址
		        i = url.indexOf("code"); // 获取code查询字段的起始位置
		    if(i !== -1) {
		        return url.replace(url.substr(i-1), ""); // 从code查询字段位置开始，包括code查询字段前面的“&”字符也去掉
		    }
		    return url;
		}
	})(window);

2. 在服务器端执行获取openid或者用户基本信息的php脚本