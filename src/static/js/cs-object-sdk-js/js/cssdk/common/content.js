(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/common/content', [], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Content = factory();
    }
}(window.CSSDK||(window.CSSDK={}), function () {
    var uploadStatus = "";
    var chunkSize = 5;
    var extendOption = {};
    var protocol = "http";
    var isNeedCancelCallback = false;

    return {
        HOSTS: {
            PREPRODUCTION: {host: "betacs.101.com", uc: "https://ucbetapi.101.com/v0.93/"},              // 预生产环境
            PRODUCTION: {host: "cs.101.com", uc: "https://aqapi.101.com/v0.93/"},                        // 生产环境
            DEBUG: {host: "sdpcs.debug.web.nd", uc: "http://101uccenter.debug.web.nd/v0.93/"},           // 测试环境
            DEV: {host: "sdpcs.dev.web.nd", uc: "https://ucbetapi.101.com/v0.93/"},                      // 开发环境
            AWS: {host: "awscs.101.com", uc: "https://awsuc.101.com/v0.93/"},                            // AWS环境-新加坡
            AWSUS: {host: "cs-awsca.101.com", uc: "https://awsuc.101.com/v0.93/"},                       // AWS环境-加利福尼亚
            DYEJIA: {host: "cs.dyejia.cn", uc: "https://uc.dyejia.cn/v0.93/"}                            // 党员E家环境
        },
        VERSION: "/v0.1",
        JSONTYPE: 'application/json',                //默认请求Content_type
        PROTOCOL: "http://",
        HOST_EXPIRES: 3600,                          //host 缓存时间 默认3600s
        MAXFILESIZE: '5120M',                        //最大支持上传的文件大小  5G
        CALMD5CHUNK:10,                               //计算md5 读取的分块大小
        RETRYTIMES: 3,                               //sdk重试次数设置
        HOST: "cs.101.com",                          //默认cs地址
        UCHOST: "https://aqapi.101.com/v0.93/",      //默认uc地址
        ENV: "PRODUCTION",                           //默认环境
        THUMB_SIZE: [80, 120, 160, 240, 320, 480, 640, 960, 1080, 1200],           //允许下载的缩略图尺寸

        TOKENTYPE: {                                 //请求token的接口枚举
            UPLOAD_NORMAL: "UPLOAD_NORMAL",
            UPLOAD_DIRECT: "UPLOAD_DIRECT",
            STATUS: "STATUS",
            QUICK: "QUICK",
            DOWNLOAD_ID: "DOWNLOAD_ID",
            DOWNLOAD_PATH: "DOWNLOAD_PATH",
            DOWNLOAD_STATIC: "DOWNLOAD_STATIC",
            UPDATE: "UPDATE",
            LIST_ID: "LIST_ID",
            LIST_PATH: "LIST_PATH",
            DELETE_ID: "DELETE_ID",
            DELETE_PATH: "DELETE_PATH",
            READ_ID: "READ_ID",
            READ_PATH: "READ_PATH",
            VALID: "VALID"
        },


        /**
         * @param option    ajax配置
         * @param onNotifyProgress  进度方法
         * @param onNotifySuccess      成功处理方法
         * @param onNotifyFail      失败处理方法
         */
        send: function (option, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            if (typeof onNotifyFail === "undefined") {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = onNotifyProgress;
                onNotifyProgress = null;
            }
            option.url = this.urlProcess(option.url);
            var retryTimes = this.RETRYTIMES;
            var callbackConfig = {
                success: function (data, status, xhr) {
                    data = data || {};
                    if (xhr.getResponseHeader("ETag")) {
                        data.etag = xhr.getResponseHeader("ETag");
                    }
                    //避免回调出错情况  400错误码不重试
                    if (data.status > 400) {
                        onNotifySuccess = null;
                        if (retryTimes-- >= 0) {
                            $.ajax($.extend(option, callbackConfig));
                        } else {
                            onNotifyFail(data);
                        }
                    } else {
                        if (typeof (onNotifySuccess) == "function") {
                            onNotifySuccess(data);
                        }
                    }
                },
                error: function (error) {
                    //避免回调出错情况
                    if (error.status === 200 || error.status === 201) {
                        onNotifySuccess(error);
                    } else {
                        if (error && error.status < 400 && error.status >= 500 && retryTimes-- >= 0) {
                            $.ajax($.extend(option, callbackConfig));
                        } else {
                            //如果没有传入错误处理方法，则采用默认处理方式
                            if (typeof (onNotifyFail) == "function") {
                                onNotifyFail(error);
                            }
                        }
                    }
                },
                xhr: function () {
                    var that = this;
                    var xhr = $.ajaxSettings.xhr();
                    //上传进度回调
                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function (e) {
                            //取消上传
                            if (uploadStatus === "stop") {
                                //用户主动终止 设置标志
                                that.isAbort = true;
                                xhr.abort();
                            }
                            if (typeof onNotifyProgress === "function") {
                                onNotifyProgress(e);
                            }
                        }, false);
                    }
                    return xhr;
                },
                async: true
            };
            option = $.extend(option, callbackConfig);

            //用户自定义ajax扩展
            if (Object.getOwnPropertyNames(extendOption).length > 0) {
                option = $.extend(extendOption, option);
            }
            $.ajax(option);
        },

        //设置当前上传状态
        setUploadStatus: function (status) {
            uploadStatus = status;
        },

        getUploadStatus: function () {
            return uploadStatus;
        },

        //设置协议 支持https
        setProtocol:function (newProtocol) {
            if(newProtocol !== "http" && newProtocol != "https"){
                throw new Error("only receive http or https");
            }
            protocol = newProtocol;
        },

        //设置分开大小
        setChunkSize: function (chunk) {
            chunkSize = parseInt(chunk, 10);
            if(chunkSize < 1){
                chunkSize = 1;
            }
            if(chunkSize > 10){
                chunkSize = 10;
            }
        },

        //设置是否需要主动终止上传回调
        setCancelCallback:function(flag){
            isNeedCancelCallback = flag;
        },

        //设置是否需要主动终止上传回调
        getCancelCallback:function(){
           return isNeedCancelCallback;
        },

        getChunkSize: function () {
            return chunkSize;
        },

        /**
         * url预处理
         * @param url
         */
        urlProcess: function (url) {
            var urlParams = url.split("://");
            var uri;
            if (urlParams.length <= 1) {
                uri = urlParams[0].replace("//", "/");
            } else {
                uri = urlParams[1].replace("//", "/");
            }
            //将所有空格转成+
            url = (protocol+"://" + uri).replace(/\s+/g, "+").replace(/#/g, "%23");

            //生产环境不打印请求URL
            if (this.ENV !== "PRODUCTION") {
                console.log("request url:" + url);
            }
            return url;
        },

        /**
         * 设置用户自定义option
         * @param options
         */
        setAjaxOption: function (options) {
            if (typeof options === "object") {
                extendOption = options;
            }
        },

        /**
         * @param name       缓存名称
         * @param value      缓存值
         * @param type       类型  session-sessionStorage
         */
        setStorage: function (name, value, type) {

            var storage;
            if (type === "session") {
                if (window.sessionStorage) {
                    storage = window.sessionStorage;
                }
            } else {
                if (window.localStorage) {
                    storage = window.localStorage;
                }
            }
            //浏览器不支持sessionStorage或者localStorage
            if (!storage) {
                return;
            }

            if (typeof value !== "string") {
                value = JSON.stringify(value);
            }
            value.replace("%2F", "/");

            try {
                if (value) {
                    storage.setItem(name.trim(), value);
                } else {
                    storage.removeItem(name.trim());
                }
            } catch (e) {
                //容量超出本地存储限制
                storage.clear();
                storage.setItem(name.trim(), value);
            }
        },
        /**
         * @param name      cookie名称
         * @param type
         */
        getStorage: function (name, type) {

            var storage;
            if (type === "session") {
                if (window.sessionStorage) {
                    storage = window.sessionStorage;
                }
            } else {
                if (window.localStorage) {
                    storage = window.localStorage;
                }
            }
            //浏览器不支持sessionStorage或者localStorage
            if (!storage) {
                return "";
            }

            return storage.getItem(name.trim());

        },
        /**
         * 设置全局host
         * @param env
         */
        setEnv: function (env) {
            this.HOST = this.HOSTS[env].host;
            this.UCHOST = this.HOSTS[env].uc;
            this.ENV = env;
        }
    };
}));

