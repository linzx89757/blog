/*
author:amen2020
date:2016.03.25
note:refence form (https://github.com/fritx/silent)
*/

(function () {
/*
var mainPage=?
（如http://www.baidu.com/web?id=5）
1.location.search
返回?id=5
2.location.search.slice(1)
返回id=5
*/
//3.location.search.slice(1).replace(/&.*/, '')
//返回经过除去&.*的字符串
//
  var pageBase = 'blog/p/';
  var pageExt = 'md';
  var mainPage = location.search.slice(1)
    .replace(/&.*/, '') || 'aboutme';
  var mainTitle = '';


  function config() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    });
  }

  function render(data, options, callback) {
    marked(data, options, callback);
  }
/*
1.url->blog/p/[page].md
*/
  function load(sel, page, isMain, options, callback) {
    isMain = isMain || false;
    var url = pageBase + page + '.' + pageExt;
    $.ajax({
      url: url,
      error: onNotFound,
      success: function (data) {
        render(data, options, function (err, html) {
          if (err && callback) return callback(err);
          var $el = $(sel);
          $el.hide().html(html);

          $el.find('[src]').each(function () {
            var $el = $(this);
            $el.attr('src', function (x, old) {
              if (isAbsolute(old)) {
                return old;
              }
              return url.replace(
                new RegExp('[^\\/]*$', 'g'), ''
              ) + old;
            });
          });

          $el.find('[href]').each(function () {
            var $el = $(this);
            $el.attr('href', function (x, old) {
              if (isAbsolute(old)) {
                $el.attr('target', '_blank');
                return old;
              }
              var prefixed = url.replace(
                new RegExp('^' + pageBase + '|[^\\/]*$', 'g'), ''
              ) + old;
              var regExt = new RegExp('\\.' + pageExt + '$');
              if (!regExt.test(old)) {
                if (!/(^\.|\/\.?|\.html?)$/.test(old)) {
                  $el.attr('target', '_blank');
                }
                return prefixed;
              }
              return '?' + prefixed.replace(regExt, '');
            });
          });

          if (isMain) {
            mainTitle = $el.find('h1:first').text();
            $('title').text(function (x, old) {
              return mainTitle + ' - ' + old;
            });
          }

          $el.show();
          if (callback) callback();
        });
      }
    });
  }

  function onNotFound() {
    location.href = '.';
  }

  function start() {
    load('#sidebar-page', 'sidebar');
    load('#main-page', mainPage, true);
  }

  function isAbsolute(url) {
    return !url.indexOf('//') || !!~url.indexOf('://');
  }


  config();
  start();
/*
程序执行过程：
加载首页index.html时执行start()，加载sidebar.md和projects/index.md
->load()
*/
})();
