(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('./cssdk/common/utils', ['../lib/spark-md5','../common/content'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS之类的
        module.exports = factory(
            require('../lib/spark-md5'),
            require('./content')
        );
    } else {
        // 浏览器全局变量(root 即 window)
        root.CSUtils = factory(root.SparkMD5,root.Content);
    }
}(window.CSSDK||(window.CSSDK={}), function (SparkMD5,Content) {

    var hasError = false;
    var errorInfo = [];
    var paramsData = {};
    paramsData.params = [];

    paramsData.addParam = function (rule, name, value) {
        paramsData.params.push({rule: rule, name: name, value: value});
        return this;
    };

    return {
        params: paramsData,

        //对象深度拷贝 避免变量污染
        deepCopy: function (source) {
            var result = {};
            for (var key in source) {
                result[key] = typeof source[key] === "object" ? this.deepCopy(source[key]) : source[key];
            }
            return result;
        },

        objToFormdata: function (obj) {
            var formData = new FormData();
            for (var prop in obj) {
                if (typeof(obj[prop]) == "function") {
                    obj[prop]();
                } else {
                    formData.append(prop, obj[prop]);
                }
            }
            return formData;
        },

        randomString: function (length) {
            length = length || 32;
            var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
            /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
            var maxPos = chars.length;
            var randomStr = '';
            for (var i = 0; i < length; i++) {
                randomStr += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return randomStr;
        },

        hashCode: function (file) {
            var input = file.name + file.size + file.type + file.lastModifiedDate;

            var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
            var hash = 5381;
            var i = input.length - 1;

            if (typeof input == 'string') {
                for (; i > -1; i--) {
                    hash += (hash << 5) + input.charCodeAt(i);
                }
            } else {
                for (; i > -1; i--) {
                    hash += (hash << 5) + input[i];
                }
            }
            var value = hash & 0x7FFFFFFF;
            var retValue = '';
            do {
                retValue += I64BIT_TABLE[value & 0x3F];
            } while (value >>= 6);
            return retValue;
        },


        //计算文件md5
        calMd5: function (file, onNotifyProgress,onNotifySuccess,onNotifyFail) {

            //大文件算md5 优化进度显示 md5计算占总进度的5%
            var progress = {
                file_hash: file.hash,
                total: file.size
            };

            var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                chunkSize = Content.CALMD5CHUNK * 1024 *1024, // read in chunks of 2MB
                chunks = Math.ceil(file.size / chunkSize),
                currentChunk = 0,
                spark = new SparkMD5.ArrayBuffer(),
                frOnload = function (e) {
                    spark.append(e.target.result); // append array buffer
                    currentChunk++;
                    if (currentChunk < chunks){

                        //不能算文件实际上传大小
                        progress.loaded = currentChunk * chunkSize * 0.1;
                        if (Content.getUploadStatus() === "stop") {
                            onNotifyFail("upload cancelled");
                            return;
                        }

                        if(typeof onNotifyProgress === "function"){
                            onNotifyProgress(progress);
                        }
                        loadNext();
                    }
                    else{
                        onNotifySuccess(spark.end());
                    }
                },
                frOnerror = function () {
                    throw new Error("\noops, something went wrong.");
                };

            function loadNext() {
                var fileReader = new FileReader();
                fileReader.onload = frOnload;
                fileReader.onerror = frOnerror;
                var start = currentChunk * chunkSize,
                    end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
            }

            loadNext();
        },


        /**
         * 检查是否为数字
         * @param  str
         * @return {Boolean} true：数字，false:<b>不是</b>数字;
         */
        isNum: function (str) {
            if (typeof(str) == "number") return true;
            var patt = new RegExp("^[0-9]+$");
            return patt.test(str);
        },

        /**
         * 检查字符不为空
         *
         * @param  str
         * @return {Boolean} <b>字符为空</b>返回true,否则为false;
         */
        isEmpty: function (str) {
            return !(typeof(str) === "string" && str !== "");
        },

        /**
         * 检查是否为对象
         *
         * @param  obj
         * @return {Boolean} <b>字符为空</b>返回true,否则为false;
         */
        isObject: function (obj) {
            return obj !== null && typeof(obj) === "object";
        },

        /**
         * 检查字符不为空(去除空格后)
         *
         * @param  str
         * @return {Boolean} <b>字符为空</b>返回true,否则为false;
         */
        isBlank: function (str) {
            return !(typeof(str) === "string" && str.trim() !== "");
        },


        /**
         * 检查字符不为空(去除空格后)
         *
         * @param  str
         * @return {Boolean} <b>字符为空</b>返回false,否则为true;
         */
        isNotBlank: function (str) {
            return typeof(str) === "string" && str.trim() !== "";
        },


        /**
         * 检查数值是否在给定范围以内,为空,不做检查<br>
         *
         * @param  str_num
         *
         * @return {Boolean} <b>小于最小数值或者大于最大数值</b>数字返回false 否则返回true;
         * @param min
         * @param max
         */
        isRangeNum: function (str_num, min, max) {
            // 检查是否为数字
            if (isNum(str_num)) {
                if (str_num >= min && str_num <= max)
                    return true;
            }
            return false;
        },

        /**
         * 检查字符串是否在给定长度范围以内(中文字符以2个字节计算),字符为空,不做检查<br>
         *
         * @param  str 检查的字符
         * @param  lessLen 应该大于或者等于的长度
         * @param  moreLen 应该小于或者等于的长度
         *
         * @return {Boolean} <b>小于最小长度或者大于最大长度</b>数字返回false;
         */
        isRange: function (str, lessLen, moreLen) {
            if (typeof(str) !== "string") return false;
            var strLen = str.length;
            if (lessLen != -1 && strLen < lessLen)
                return false;
            if (moreLen != -1 && strLen > moreLen)
                return false;

            return true;
        },

        /**
         * 检查字符串是否小于给定长度范围(中文字符以2个字节计算)<br>
         *
         * @param  str 字符串
         * @param  lessLen 小于或等于长度
         *
         * @return {Boolean} <b>小于给定长度</b>数字返回false;
         */
        isLess: function (str, lessLen) {
            return this.isRange(str, lessLen, -1);
        },

        /**
         * 检查字符串是否大于给定长度范围(中文字符以2个字节计算)<br>
         *
         * @param  str 字符串
         * @param  moreLen 小于或等于长度
         *
         * @return {Boolean} <b>大于给定长度</b>数字返回false;
         */
        isMore: function (str, moreLen) {
            return this.isRange(str, -1, moreLen);
        },

        //验证是否为md5码
        isMd5: function (str) {
            var patt = new RegExp("[0-9a-zA-Z]{32}");
            return patt.test(str);
        },

        isName: function (str) {
            var patt = new RegExp("^[^\\\\/:*?\"<>|]+$");
            return patt.test(str);
        },


        //验证字符是否只由字母、数字、破折号、下划线组成
        isDash: function (str) {
            var patt = new RegExp("^[\\w]+$");
            return patt.test(str);
        },

        //验证字符串是否是路径
        isPath: function (str) {
            var patt = new RegExp("^/|(/[^\\\\:*?\"<>|]+)+$");
            return patt.test(str);
        },

        //验证字符串是否是Uuid
        isUuid: function (str) {
            var patt = new RegExp("[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}");
            return patt.test(str);
        },

        //验证字符串是否是密码（由字母与数字组成，长度6-16）
        isPassword: function (str) {
            var patt = new RegExp("^[a-zA-Z0-9]{6,16}$");
            return patt.test(str);
        },

        //验证是否为空
        isNull: function (obj) {
            return obj === null;
        },

        addResult: function (resultInfo) {
            hasError = true;
            errorInfo.push(resultInfo);
        },

        valid: function (params) {
            for (var param in params) {
                switch (param.rule) {
                    case "string":
                        if (this.isBlank(param.value))
                            this.addResult(param.name + " Must be a non empty string");
                        break;
                    case "num":
                        if (!this.isNum(param.value))
                            this.addResult(param.name + " value:" + param.value + " Must be numeric");
                        break;
                    case "password":
                        if (!this.isPassword(param.value))
                            this.addResult(param.name + " value:" + param.value + " Must be composed of numbers and letters for 6-16 bits");
                        break;
                    case "uuid":
                        if (!this.isUuid(param.value))
                            this.addResult(param.name + " value:" + param.value + " Must be UUID");
                        break;
                    case "path":
                        if (!this.isPath(param.value))
                            this.addResult(param.name + " Must be path format");
                        break;
                    case "null":
                        if (this.isNull(param.value))
                            this.addResult(param.name + " As required");
                        break;
                }
            }
            if (hasError) {
                throw new Error("params error:" + errorInfo);
            }
        }
    };
}));

