/**
 * @description CSS 自訂的keyword()方法的支援和使用
 * @author zhangxinxu(.com) 2020-08-11
 * @docs https://www.zhangxinxu.com/wordpress/?p=9537
 * @license MIT 作者和出處保留
 */

(function () {
    if (!window.CSS) {
        return;
    }

    if (!NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }


    // 獲得頁面中所有的CSS自訂屬性
    var isSameDomain = function (styleSheet) {
        if (!styleSheet.href) {
            return true;
        }

        return styleSheet.href.indexOf(window.location.origin) === 0;
    };

    var isStyleRule = function (rule) {
        return rule.type === 1;
    };

    var arrCSSCustomProps = (function () {
        return [].slice.call(document.styleSheets).filter(isSameDomain).reduce(function (finalArr, sheet) {
            return finalArr.concat([].slice.call(sheet.cssRules).filter(isStyleRule).reduce(function (propValArr, rule) {
                var props = [].slice.call(rule.style).map(function (propName) {
                    return [
                        propName.trim(),
                        rule.style.getPropertyValue(propName).trim()
                    ];
                }).filter(function ([propName]) {
                    return propName.indexOf('--') === 0;
                });

                return [].concat(propValArr, props);
            }, []));
        }, []);
    })();

    // 使用了keyword()語法的CSS自訂屬性名
    var arrCssPropsValueIsKeyword = arrCSSCustomProps.filter(function (arrPropVal) {
        return /keyword\([\w\W]+\)/i.test(arrPropVal[1]);
    });

    // 設定自訂屬性值的方法
    var funKeywordColor2Rgba = function (node) {
        if (node.nodeType != 1 || ['script', 'style', 'meta', 'title', 'head'].includes(node.nodeName.toLowerCase())) {
            return;
        }

        // 當前節點的所有樣式對象
        var objStyle = window.getComputedStyle(node);

        // 所有設定了keyword()的自訂屬性的走訪處理
        arrCssPropsValueIsKeyword.forEach(function (arr) {
            var cssProp = arr[0];

            // 判斷當前元素是否設定了當前自訂屬性
            var cssVarValueKeyword = objStyle.getPropertyValue(cssProp);

            if (!cssVarValueKeyword || !cssVarValueKeyword.trim() || !/keyword\([\w\W]+\)/i.test(cssVarValueKeyword)) {
                return;
            }

            cssVarValueKeyword = arr[1];

            // 解析與處理
            var keyColorAndOpacity = cssVarValueKeyword.replace(/\w+\(([\w\W]+)\)/, '$1');

            var arrKeyColorAndOpacity = keyColorAndOpacity.split(/\s+/);

            if (/,/.test(keyColorAndOpacity)) {
                arrKeyColorAndOpacity = keyColorAndOpacity.split(',');
            } else if (/\//.test(keyColorAndOpacity)) {
                arrKeyColorAndOpacity = keyColorAndOpacity.split(',');
            }

            if (arrKeyColorAndOpacity.length != 2) {
                return;
            }

            // 分出顏色和透明度
            var keyColor = arrKeyColorAndOpacity[0].trim();
            var opacity = (arrKeyColorAndOpacity[1] || '1').trim();

            // keyColor轉rgb
            document.head.style.backgroundColor = keyColor;
            var rgbColor = window.getComputedStyle(document.head).backgroundColor;

            // 應用的顏色
            var applyColor = '';
            // 透明度替換
            if (/^rgba/.test(rgbColor)) {
                applyColor = rgbColor.replace('1)', opacity + ')');
            } else {
                applyColor = rgbColor.replace(')', ', ' + opacity + ')');
            }

            node.style.setProperty(cssProp, applyColor);
        });
    };


    var funAutoInitAndWatching = function () {
        // DOM Insert自動初始化
        if (window.MutationObserver) {
            var observerSelect = new MutationObserver(function (mutationsList) {
                mutationsList.forEach(function (mutation) {
                    var nodeAdded = mutation.addedNodes;
                    // 新增元素
                    nodeAdded.forEach(function (eleAdd) {
                        funKeywordColor2Rgba(eleAdd);
                    });
                });
            });

            observerSelect.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // 如果沒有開啟自動初始化，則回傳
        document.querySelectorAll('*').forEach(function (ele) {
            funKeywordColor2Rgba(ele);
        });
    };

    if (document.readyState != 'loading') {
        funAutoInitAndWatching();
    } else {
        window.addEventListener('DOMContentLoaded', funAutoInitAndWatching);
    }
})();