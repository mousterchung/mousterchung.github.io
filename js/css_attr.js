/**
 * @description CSS attr()方法的支援和使用
 * @author zhangxinxu(.com) 2020-08-11
 * @docs https://www.zhangxinxu.com/wordpress/?p=9443
 * @license MIT 作者和出處保留
 */

(function () {
    if (!window.CSS) {
        return;
    }

    if (CSS.supports('color: attr(color color)')) {
        return;
    }


    if (!NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }

    // 觀察的元素選擇器
    var watchSelector = window.watchSelector || '*';

    // 取得頁面中所有的CSS自定義屬性
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

    // 使用了keyword()語法的CSS自定義屬性名
    var arrCssPropsValueIsAttr = arrCSSCustomProps.filter(function (arrPropVal) {
        return /attr\([\w\W]+\)/i.test(arrPropVal[1]);
    });

    // attr()語法的解析
    // 回傳對應的<attr-name> <type-or-unit> 和 <attr-fallback>
    var funParseAttr = function (valueVar) {
        var attrName, typeOrUnit, attrFallback;
        if (valueVar) {

            valueVar = valueVar.replace(/attr\(([\w\W]*)\)/i, '$1');
            // fallback取得
            var arrValueVar = valueVar.split(',');
            // 這是備用樣式，如果沒有對應的屬性，則使用這個值
            if (arrValueVar.length > 1) {
                attrFallback = arrValueVar[1].trim();
            }

            // 前面的屬性和單位
            var arrFirstPart = arrValueVar[0].trim().split(/\s+/);
            attrName = arrFirstPart[0];
            typeOrUnit = arrFirstPart[1] || 'string';
        }

        return {
            attrName: attrName,
            typeOrUnit: typeOrUnit,
            attrFallback: attrFallback
        };
    };

    // attr()語法轉換成目前CSS變數可識別的语法
    var funAttrVar2NormalVar = function (objParseAttr, valueAttr) {
        // attr()語法 attr( <attr-name> <type-or-unit>? [, <attr-fallback> ]? )
        // valueVar範例：attr(bgcolor color, deeppink)
        // valueAttr範例： 'deepskyblue'或者null

        var attrName = objParseAttr.attrName;
        var typeOrUnit = objParseAttr.typeOrUnit;

        // typeOrUnit值包括：
        // string | color | url | integer | number | length | angle | time | frequency | cap | ch | em | ex | ic | lh | rlh | rem | vb | vi | vw | vh | vmin | vmax | mm | Q | cm | in | pt | pc | px | deg | grad | rad | turn | ms | s | Hz | kHz | %

        var arrUnits = ['ch', 'em', 'ex', 'ic', 'lh', 'rlh', 'rem', 'vb', 'vi', 'vw', 'vh', 'vmin', 'vmax', 'mm', 'cm', 'in', 'pt', 'pc', 'px', 'deg', 'grad', 'rad', 'turn', 'ms', 's', 'Hz', 'kHz', '%'];

        var valueVarNormal = valueAttr;
        // 如果是string類型
        switch (typeOrUnit) {
            case 'string': {
                valueVarNormal = '"' + valueAttr + '"';
                break;
            }
            case 'url': {
                if (/^url\(/i.test(valueAttr) == false) {
                    valueVarNormal = 'url(' + valueAttr + ')';
                }
                break;
            }
        }

        // 數值變單位的處理
        if (arrUnits.includes(typeOrUnit) && valueAttr.indexOf(typeOrUnit) == -1 && parseFloat(valueAttr) == valueAttr) {
            valueVarNormal = parseFloat(valueAttr) + typeOrUnit;
        }

        return valueVarNormal;
    };

    // 設定自定義屬性值的方法
    var funSetAttr = function (node) {
        if (node.nodeType != 1 || node.matches(watchSelector) == false) {
            return;
        }

        // 通配符匹配時候有些元素忽略
        if (watchSelector == '*' && ['script', 'style', 'meta', 'title', 'head'].includes(node.nodeName.toLowerCase())) {
            return;
        }

        var objStyle = window.getComputedStyle(node);

        // 當前節點的所有樣式對象
        var objStyle = window.getComputedStyle(node);

        // 所有設定了keyword()的自定義屬性的遍歷處理
        arrCssPropsValueIsAttr.forEach(function (arr) {
            var cssProp = arr[0];
            var cssValue = node['originCssValue' + cssProp] || arr[1];

            // 判斷當前節點有沒有設定對應的自定義屬性
            var cssVarValueAttr = objStyle.getPropertyValue(cssProp);

            if (!cssVarValueAttr || !cssVarValueAttr.trim() || (!/attr\(([\w\W]*)\)/i.test(cssVarValueAttr) && !node['originCssValue' + cssProp])) {
                return;
            }

            // 這個是HTML屬性改變時用的
            if (!node['originCssValue' + cssProp]) {
                node['originCssValue' + cssProp] = cssValue;
            }            

            // 總是使用初始取得的自定義屬性值
            cssVarValueAttr = cssValue;

            var objParseAttr = funParseAttr(cssVarValueAttr);

            // 取得屬性對應的值
            if (!objParseAttr.attrName) {
                return;
            }

            // attr()屬性名
            var attrName = objParseAttr.attrName;

            // 取得此時節點這些屬性目前對應的值
            // 如果沒有值，則使用備用值
            var strHtmlAttr = node.getAttribute(attrName) || objParseAttr.attrFallback;
            if (!strHtmlAttr) {
                // 設定為空
                node.style.setProperty(cssProp, '');
                return;
            }

            // 標示需要觀察的HTML屬性
            node.attrNeedWatch = node.attrNeedWatch || [];
            if (node.attrNeedWatch.includes(attrName) == false) {
                node.attrNeedWatch.push(attrName);
            }

            // 核心方法
            // 瀏覽器不支持的attr()語法轉變成支持的語法
            var valueVarNormal = funAttrVar2NormalVar(objParseAttr, strHtmlAttr);

            console.log(valueVarNormal);
            // 設定
            node.style.setProperty(cssProp, valueVarNormal);
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
                        funSetAttr(eleAdd);
                    });
                    // 如果是屬性發生變化
                    var attributeName = mutation.attributeName;

                    if (mutation.target && mutation.target.attrNeedWatch && mutation.target.attrNeedWatch.includes(attributeName)) {
                        funSetAttr(mutation.target);
                    }
                });
            });

            observerSelect.observe(document.body, {
                childList: true,
                attributes: true,
                subtree: true
            });
        }

        // 如果沒有開啟自動初始化，則返回
        document.querySelectorAll(watchSelector).forEach(function (ele) {
            funSetAttr(ele);
        });
    };

    if (document.readyState != 'loading') {
        funAutoInitAndWatching();
    } else {
        window.addEventListener('DOMContentLoaded', funAutoInitAndWatching);
    }
})();