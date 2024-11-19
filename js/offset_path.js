/**
 * @description CSS offset-path url()/inset()/circle()/ellipse()/polygon() pilyfill
 * @author zhangxinxu(.com) 2020-08-08
 * @docs https://www.zhangxinxu.com/wordpress/?p=9443
 * @base https://github.com/convertSvg/convertPath/blob/master/lib/filter/convertShapeToPath.js
 * @license MIT 作者和出處保留
 */

(function () {
    // 是否支援url()函數和基本圖形函數的判斷
    var isSupportUrl = CSS.supports('offset-path', 'url(#xxx)');
    var isSupportBasicShape = CSS.supports('offset-path', 'circle()');

    window.convertPathData = function (node) {
      // 匹配路徑中數值的正規表達式
      var regNumber = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

      if (!node.tagName) return
      var tagName = String(node.tagName).toLowerCase()

      switch (tagName) {
        case 'path':
            var path = node.getAttribute('d');
            break;
        case 'rect':
          var x = Number(node.getAttribute('x'))
          var y = Number(node.getAttribute('y'))
          var width = Number(node.getAttribute('width'))
          var height = Number(node.getAttribute('height'))
          /*
           * rx 和 ry 的規則是：
           * 1. 如果其中一個設定為 0 則圓角不生效
           * 2. 如果有一個沒有設定則取值為另一個
           * 3.rx 的最大值為 width 的一半, ry 的最大值為 height 的一半
           */
          var rx = Number(node.getAttribute('rx')) || Number(node.getAttribute('ry')) || 0
          var ry = Number(node.getAttribute('ry')) || Number(node.getAttribute('rx')) || 0

          // 非數值單位計算，如當寬度像100%則移除
          // if (isNaN(x - y + width - height + rx - ry)) return;

          rx = rx > width / 2 ? width / 2 : rx
          ry = ry > height / 2 ? height / 2 : ry

          // 如果其中一個設定為 0 則圓角不生效
          if (rx == 0 || ry == 0) {
            // var path =
            //     'M' + x + ' ' + y +
            //     'H' + (x + width) +
            //     'V' + (y + height) +
            //     'H' + x +
            //     'z';
            var path =
              'M' + x + ' ' + y + 'h' + width + 'v' + height + 'h' + -width + 'z'
          } else {
            var path =
              'M' +
              x +
              ' ' +
              (y + ry) +
              'a' +
              rx +
              ' ' +
              ry +
              ' 0 0 1 ' +
              rx +
              ' ' +
              -ry +
              'h' +
              (width - rx - rx) +
              'a' +
              rx +
              ' ' +
              ry +
              ' 0 0 1 ' +
              rx +
              ' ' +
              ry +
              'v' +
              (height - ry - ry) +
              'a' +
              rx +
              ' ' +
              ry +
              ' 0 0 1 ' +
              -rx +
              ' ' +
              ry +
              'h' +
              (rx + rx - width) +
              'a' +
              rx +
              ' ' +
              ry +
              ' 0 0 1 ' +
              -rx +
              ' ' +
              -ry +
              'z'
          }

          break

        case 'circle':
          var cx = node.getAttribute('cx')
          var cy = node.getAttribute('cy')
          var r = node.getAttribute('r')
          var path =
            'M' +
            (cx - r) +
            ' ' +
            cy +
            'a' +
            r +
            ' ' +
            r +
            ' 0 1 0 ' +
            2 * r +
            ' 0' +
            'a' +
            r +
            ' ' +
            r +
            ' 0 1 0 ' +
            -2 * r +
            ' 0' +
            'z'

          break

        case 'ellipse':
          var cx = node.getAttribute('cx') * 1
          var cy = node.getAttribute('cy') * 1
          var rx = node.getAttribute('rx') * 1
          var ry = node.getAttribute('ry') * 1

          if (isNaN(cx - cy + rx - ry)) return
          var path =
            'M' +
            (cx - rx) +
            ' ' +
            cy +
            'a' +
            rx +
            ' ' +
            ry +
            ' 0 1 0 ' +
            2 * rx +
            ' 0' +
            'a' +
            rx +
            ' ' +
            ry +
            ' 0 1 0 ' +
            -2 * rx +
            ' 0' +
            'z'

          break

        case 'line':
          var x1 = node.getAttribute('x1')
          var y1 = node.getAttribute('y1')
          var x2 = node.getAttribute('x2')
          var y2 = node.getAttribute('y2')
          if (isNaN(x1 - y1 + (x2 - y2))) {
            return
          }

          var path = 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2

          break

        case 'polygon':
        case 'polyline': // ploygon與polyline是一樣的,polygon多邊形，polyline折線
          var points = (node.getAttribute('points').match(regNumber) || []).map(
            Number
          )
          if (points.length < 4) {
            return
          }
          var path =
            'M' +
            points.slice(0, 2).join(' ') +
            'L' +
            points.slice(2).join(' ') +
            (tagName === 'polygon' ? 'z' : '')

          break
      }
      return path || '';
    }

    var funAutoInitAndWatching = function () {
        var selector = '[is-offset-path]';

        if (!NodeList.prototype.forEach) {
            NodeList.prototype.forEach = Array.prototype.forEach;
        }
        
        var funSetOffsetPath = function (node) {
            if (node.nodeType != 1) {
                return;
            }

            var cssVarValueOffsetPath = node.originOffsetPath || window.getComputedStyle(node).getPropertyValue('--offset-path');

            // 如果沒有設定--offset-path自訂屬性值，則不處理
            if (!cssVarValueOffsetPath) {
                return;
            }

            // 過濾前後的空格
            cssVarValueOffsetPath = cssVarValueOffsetPath.trim();
            // 記住原始的自訂屬性值
            node.originOffsetPath = cssVarValueOffsetPath;

            var paramOffsetPath = cssVarValueOffsetPath.replace(/[a-z]+\(([\w\W]*?)\).*/, '$1').replace(/(?:'|")/g, '').replace('\\#', '#');
            // 說明不是函數值語法不處理
            if (/\(/.test(paramOffsetPath)) {
                return;
            }

            var path = '';
            // 如果是url()函數
            if (/^url\(/i.test(cssVarValueOffsetPath)) {
                // 尋找匹配的SVG元素
                var eleSvgShape = document.querySelector(paramOffsetPath);

                if (!eleSvgShape || isSupportUrl) {
                    return;
                }

                path = convertPathData(eleSvgShape);
            } else if (!isSupportBasicShape) {
                // 需要元素的尺寸，以便進行百分比值轉換成固定的像素值
                // 預設是border-box類型，所以
                var width = node.offsetWidth;
                var height = node.offsetHeight;

                // 如果有設定盒子類型
                var boxSizing = cssVarValueOffsetPath.split(') ')[1];
                if (boxSizing) {
                    boxSizing = boxSizing.trim();
                }
                var objStyle = window.getComputedStyle(node);

                if (boxSizing == 'margin-box') {
                    width = width + (parseFloat(objStyle.marginLeft) || 0) + (parseFloat(objStyle.marginRight) || 0);
                    height = height + (parseFloat(objStyle.marginTop) || 0) + (parseFloat(objStyle.marginBottom) || 0);
                } else if (boxSizing == 'padding-box') {
                    width = node.clientWidth;
                    height = node.clientHeight;
                } else if (boxSizing == 'content-box') {
                    width = node.clientWidth - (parseFloat(objStyle.paddingLeft) || 0) + (parseFloat(objStyle.paddingRight) || 0);
                    height = node.clientHeight - (parseFloat(objStyle.paddingTop) || 0) + (parseFloat(objStyle.paddingBottom) || 0);
                }               

                if (/^inset\(/i.test(cssVarValueOffsetPath)) {
                    // 圓角矩形
                    // 語法：
                    // inset(<length-percentage>{1,4} round <'border-radius'>);
                    // <rect x="10" y="20" width="120" height="90" rx="50" ry="10"></rect>
                    // 語法的圓角部分可能會對應不上
                    var eleRect = document.createElement('rect');
                    var sizeRect = paramOffsetPath.split('round')[0].trim();
                    var sizeRadius = (paramOffsetPath.split('round')[1] || 0).trim();

                    // 一些坐標參數值
                    var x = 0;
                    var y = 0;
                    var rx = 0;
                    var ry = 0;

                    // 1-4個值處理
                    var arrOffset = sizeRect.split(/\s+/);

                    if (arrOffset.length == 0) {
                        arrOffset = [0, 0, 0, 0];
                    } else if (arrOffset.length == 1) {
                        arrOffset = [arrOffset[0], arrOffset[0], arrOffset[0], arrOffset[0]];
                    } else if (arrOffset.length == 2) {
                        arrOffset = [arrOffset[0], arrOffset[1], arrOffset[0], arrOffset[1]];
                    } else if (arrOffset.length == 3) {
                        arrOffset = [arrOffset[0], arrOffset[1], arrOffset[2], arrOffset[1]];
                    }
                    // 百分比值轉換成固定的長度值
                    arrOffset = arrOffset.map(function (offset, index) {
                        if (/%$/.test(offset)) {
                            return [height, width, height, width][index] * parseFloat(offset) / 100;
                        }
                        return parseFloat(offset) || 0;
                    });

                    // 圓角的處理
                    var arrRadius = sizeRadius.split('/');

                    rx = (function () {
                        var radius = arrRadius[0];
                        if (/%$/.test(radius)) {
                            return width * parseFloat(radius) / 100;
                        }
                        return parseFloat(radius) || 0;
                    })();
                    ry = (function () {
                        var radius = arrRadius[1];

                        if (!radius) {
                            return cx;
                        }
                        if (/%$/.test(radius)) {
                            return height * parseFloat(radius) / 100;
                        }
                        return parseFloat(radius) || 0;
                    })();

                    // 設定尺寸
                    x = arrOffset[3];
                    y = arrOffset[0];

                    var w = width - arrOffset[3] - arrOffset[1];
                    var h = height - arrOffset[0] - arrOffset[2];

                    eleRect.setAttribute('x', x);
                    eleRect.setAttribute('y', y);
                    eleRect.setAttribute('width', w);
                    eleRect.setAttribute('height', h);
                    eleRect.setAttribute('rx', rx);
                    eleRect.setAttribute('ry', ry);

                    path = convertPathData(eleRect);
                } else if (/^circle\(/i.test(cssVarValueOffsetPath)) {
                    var eleCircle = document.createElement('circle');
                    var cx, cy, r;
                    // 圓語法變成路徑語法
                    r = paramOffsetPath.split('at')[0].trim() || '50%';

                    if (/%$/.test(r)) {
                        r = Math.min(width, height) * parseFloat(r) / 100;
                    } else {
                        r = parseFloat(r);
                    }

                    var cxCy = paramOffsetPath.split('at')[1] || '50% 50%';
                    cxCy = cxCy.trim().split(/\s+/);
                    if (cxCy.length == 1) {
                        cxCy = cxCy.push(cxCy[0]);
                    }
                    cxCy = cxCy.map(function (xy, index) {
                        if (/%$/.test(xy)) {
                            return [width, height][index] * parseFloat(xy) / 100;
                        }
                        return parseFloat(xy) || 0;                    
                    });

                    cx = cxCy[0];
                    cy = cxCy[1];

                    eleCircle.setAttribute('cx', cx);
                    eleCircle.setAttribute('cy', cy);
                    eleCircle.setAttribute('r', r);

                    path = convertPathData(eleCircle);
                } else if (/^ellipse\(/i.test(cssVarValueOffsetPath)) {
                    // ellipse( [ <shape-radius>{2} ]? [ at <position> ]? )
                    // <ellipse cx="50" cy="50" rx="40" ry="20"></ellipse>
                    var eleEllipse = document.createElement('ellipse');
                    var cx, cy, rx, ry;
                    // 圓語法變成路徑語法
                    rxRy = paramOffsetPath.split('at')[0].trim() || '50% 50%';

                    rxRy = rxRy.split(/\s+/);
                    if (rxRy.length == 1) {
                        rxRy = rxRy.push(rxRy[0]);
                    }
                    rxRy = rxRy.map(function (xy, index) {
                        if (/%$/.test(xy)) {
                            return [width, height][index] * parseFloat(xy) / 100;
                        }
                        return parseFloat(xy) || 0;                    
                    });

                    var cxCy = paramOffsetPath.split('at')[1] || '50% 50%';
                    cxCy = cxCy.trim().split(/\s+/);
                    if (cxCy.length == 1) {
                        cxCy = cxCy.push(cxCy[0]);
                    }
                    cxCy = cxCy.map(function (xy, index) {
                        if (/%$/.test(xy)) {
                            return [width, height][index] * parseFloat(xy) / 100;
                        }
                        return parseFloat(xy) || 0;                    
                    });

                    rx = rxRy[0];
                    ry = rxRy[1];

                    cx = cxCy[0];
                    cy = cxCy[1];



                    eleEllipse.setAttribute('cx', cx);
                    eleEllipse.setAttribute('cy', cy);
                    eleEllipse.setAttribute('rx', rx);
                    eleEllipse.setAttribute('ry', ry);

                    path = convertPathData(eleEllipse);
                } else if (/^polygon\(/i.test(cssVarValueOffsetPath)) {
                    // 多邊形的處理
                    var arrPoints = paramOffsetPath.split(/,\s*/);
                    // 變成百分比值變成固定值
                    arrPoints = arrPoints.map(function (strXy) {
                        return strXy.split(/\s+/).map(function (xy, index) {
                            if (/%$/.test(xy)) {
                                return [width, height][index] * parseFloat(xy) / 100;
                            }
                            return parseFloat(xy) || 0;
                        }).join(' ');
                    });

                    path = 'M' + arrPoints.join('L') + 'Z';
                }
            }

            if (path) {
                node.style.setProperty('--offset-path', 'path("'+ path +'")');
            }
        };

        // DOM Insert自動初始化
        if (window.MutationObserver) {
            var observerSelect = new MutationObserver(function (mutationsList) {
                mutationsList.forEach(function (mutation) {
                    var nodeAdded = mutation.addedNodes;

                    if (nodeAdded.length) {
                        nodeAdded.forEach(function (eleAdd) {
                            funSetOffsetPath(eleAdd);
                        });
                    }
                });
            });

            observerSelect.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // 如果沒有開啟自動初始化，則回傳
        document.querySelectorAll(selector).forEach(function (ele) {
            funSetOffsetPath(ele);
        });
    };

    if (document.readyState != 'loading') {
        funAutoInitAndWatching();
    } else {
        window.addEventListener('DOMContentLoaded', funAutoInitAndWatching);
    }
})();
