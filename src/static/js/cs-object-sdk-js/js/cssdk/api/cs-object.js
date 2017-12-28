/**
 * 文件上传下载
 */

(function (root, factory) {
    var a = '../common/httpclient';
    var b = '../third-platform-adapter/ceph-s3-adapter';
    var c = '../common/utils';
    var d = '../common/content';
    var e = '../common/uploader';
    if (typeof define === 'function' && define.amd) {
      console.log(root)
        // AMD
        define('./cssdk/api/cs-object', [a, b, c, d, e], factory);
    } else if (typeof exports === 'object') {
        console.log(root)
        // Node, CommonJS
        module.exports = factory(
            require(a), require(b), require(c), require(d), require(e)
        );
    } else {
        // console.log(root)
        // 浏览器全局变量
        root.CSClient = factory(root.CSHttpClient, root.CephS3Adapter, root.CSUtils, root.Content, root.CSUploader);
    }
}(window.CSSDK||(window.CSSDK={}), function (CSHttpClient, CephS3Adapter, CSUtils, Content, CSUploader) {
//标示当前是否有文件在上传

    var status = {
        WAITING: "waiting",
        UPLOADING: "uploading"
    };
    //上传任务列表
    var uploadTasks = [];
    var uploadStatus = status.WAITING;

    //添加上传任务时触发
    var taskAdded = function (newTask) {
        uploadTasks.push(newTask);
        /**
         * 任务完成后处理流程
         */
        var taskComplete = function () {
            //删除已完成任务
            uploadTasks.splice(0, 1);

            //判断任务是否已经全部完成
            if (uploadTasks.length > 0) {
                taskHandle(uploadTasks[0]);
            } else {
                uploadStatus = status.WAITING;
            }
        };

        var taskHandle = function (task) {
            (function (task) {
                var file = task.file;
                var uploadData = task.uploadData;
                var listenner = task.listenner;
                var token = task.token;
                var session = task.session;

                //标识正在上传的文件
                Content.uploadingFile = file;
                uploadStatus = "uploading";
                Content.setUploadStatus("");

                uploadFile(file, uploadData, listenner.onNotifyProgress, function (dentry) {
                    listenner.onNotifySuccess(dentry);
                    taskComplete();
                }, function (error) {
                    //用户主动终止，不回调失败信息
                    if (Content.getUploadStatus() !== "stop" || Content.getCancelCallback()) {
                        listenner.onNotifyFail(error);
                    }
                    taskComplete(error);
                }, token, session);
            })(task);
        };
        //如果此时没有任务在处理 开始上传文件
        if (uploadStatus === status.WAITING) {
            taskHandle(uploadTasks[0]);
        }
    };

    //选择上传适配器
    var chooseAdapter = function (platform) {
        var adapter;
        switch (platform) {
            case "s3":
                adapter = CephS3Adapter;
                break;
            case "aws":
                break;
            case "aliyun":
                break;
            case "cs":
                adapter = CSUploader;
                break;
            default :
                throw new Error("platform invalid");
        }
        return adapter;
    };

    //获取服务信息
    var getServiceInfo = function (serviceName, onNotifySuccess) {
        if (!serviceName) {
            onNotifySuccess({});
            return;
        }
        var serviceCache = Content.getStorage(Content.ENV + "_" + serviceName, "session");
        if (!serviceCache) {
            var url = Content.HOST + Content.VERSION + "/services/serviceName/" + serviceName;
            CSHttpClient.doGetRequest(url, function (service) {
                //缓存服务信息
                var serviceCache = {};
                serviceCache.platform = service.platform;
                var expires = 86400;
                if (service.strategies) {
                    /** @namespace service.strategies.direct */
                    var directStrategy = service.strategies.direct;
                    if (directStrategy) {
                        //只缓存旁路策略
                        serviceCache.strategies = {};
                        serviceCache.strategies.direct = directStrategy;
                        /** @namespace directStrategy.expires */
                        expires = directStrategy.expires;
                    }
                }
                Content.setStorage(Content.ENV + "_" + serviceName, JSON.stringify(serviceCache), "session");
                onNotifySuccess(service);
            }, function () {
                onNotifySuccess({});
            });
        } else {
            onNotifySuccess(JSON.parse(serviceCache));
        }
    };

    //上传文件
    var uploadFile = function (file, uploadData, onNotifyProgress, onNotifySuccess, onNotifyFail, token, session) {
        if (!file) {
            throw new Error("please select file!");
        }
        if (!session && !token) {
            throw new Error("token or session must select one");
        }
        //通过服务配置判断是否走普通上传还是旁路上传
        getServiceInfo(uploadData.serviceName, function (service) {
            var platform = "cs";
            if (service.strategies) {
                var direct = service.strategies.direct;
                /** @namespace direct.uploadDirect */
                if (direct && direct.uploadDirect && direct.uploadDirect.toString() === "1") {
                    platform = service.platform;
                }
            }
            //选择上传适配器
            var uploadAdapter = chooseAdapter(platform);
            uploadAdapter.upload(file, uploadData, token, session, function (progress) {
                progress.file_hash = file.hash;
                onNotifyProgress(progress);
            }, onNotifySuccess, onNotifyFail);
        });
    };

    //打开下载链接
    var openDownloadLink = function (url, callback) {
        var res = window.open(Content.urlProcess(url));
        console.log(res);
        if (!res) {
            var result = {};
            result.status = "forbidden";
            result.error = "forbidden to open the browser window";
            callback(result);
        }
    };

    //下载参数检查
    var checkDownloadParams = function (downloadType, serviceName, downloadKey, size) {

        var result = {};
        if (!serviceName) {
            result.status = "failed";
            result.error = "require serviceName";
            return result;
        }

        if (downloadType === "dentryId") {
            if (!downloadKey) {
                result.status = "failed";
                result.error = "require dentryId";
                return result;
            }
            if (!CSUtils.isUuid(downloadKey)) {
                result.status = "failed";
                result.error = "dentryId is invalid";
                return result;
            }
        } else {
            if (!downloadKey) {
                result.status = "failed";
                result.error = "require remootePath";
                return result;
            }
            if (!CSUtils.isPath(downloadKey)) {
                result.status = "failed";
                result.error = "remotePath is invalid";
                return result;
            }
        }

        if (size && Content.THUMB_SIZE.indexOf(parseInt(size)) === -1) {
            result.status = "failed";
            result.error = "size is invalid";
        }
        return result;
    };

    return {

        /**
         * 尝试秒传
         * @param serviceName        服务名
         * @param md5                文件特征码
         * @param remoteDstPath      文件在服务器端的存放路径
         * @param scope              公开/私密
         * @param token              token鉴权模块
         * @param session            session鉴权模块
         * @param onNotifySuccess    成功回调
         * @param onNotifyFail       失败回调
         */
        tryQuickUploadByMd5: function (serviceName, md5, remoteDstPath, scope, token, session, onNotifySuccess, onNotifyFail) {
            if (!serviceName) {
                throw new Error("require serviceName");
            }

            if (!CSUtils.isPath(remoteDstPath)) {
                throw new Error("remoteDstPath is invalid");
            }
            var params = {};
            params.md5 = md5;
            var index = remoteDstPath.lastIndexOf("/");
            params.path = remoteDstPath.substring(0, index);
            params.name = remoteDstPath.substring(index + 1, remoteDstPath.length);
            params.scope = scope;

            if (token) {
                token.getToken(Content.TOKENTYPE.QUICK, remoteDstPath, null, null, function (tokenInfo) {
                    if (tokenInfo.token) {
                        var url = Content.HOST + Content.VERSION + "/dentries/actions/quick?token=" + tokenInfo.token + "&policy=" +
                            tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                        CSHttpClient.doPostRequest(url, JSON.stringify(params), onNotifySuccess, onNotifyFail);
                    } else {
                        onNotifyFail(tokenInfo);
                    }
                });
            } else {
                session.getSession(function (session) {
                    var url = Content.HOST + Content.VERSION + "/dentries/actions/quick?serviceName=" + serviceName + "&session=" + session;
                    CSHttpClient.doPostRequest(url, JSON.stringify(params), onNotifySuccess, onNotifyFail);
                });
            }
        },


        /**
         * 文件上传
         * @param serviceName       服务名
         * @param file              文件内容
         * @param remotePath        服务器远端路径
         * @param scope             公开/私密
         * @param listenner         上传监听
         * @param token             token鉴权模块
         * @param session           session鉴权模块
         */
        upload: function (serviceName, file, remotePath, scope, listenner, token, session) {

            if (!serviceName) {
                throw new Error("require serviceName");
            }

            if (!remotePath) {
                throw new Error("require remotePath");
            }
            if (!CSUtils.isPath(remotePath)) {
                throw new Error(" remotePath is invalid");
            }

            //检查listenner模块是否正确
            if (typeof listenner === "object") {
                if (typeof listenner.onNotifySuccess !== "function") {
                    throw new Error("require success callback");
                }
                if (typeof listenner.onNotifyFail !== "function") {
                    throw new Error("require failure callback");
                }
                if (typeof listenner.onNotifyProgress !== "function") {
                    throw new Error("require progress callback");
                }
            } else {
                throw new Error("require listenner");
            }

            var uploadData = {};
            var index = remotePath.lastIndexOf("/");
            uploadData.path = remotePath.substring(0, index);
            uploadData.name = remotePath.substring(index + 1, remotePath.length);
            uploadData.scope = scope;
            uploadData.serviceName = serviceName;

            if (!CSUtils.isName(uploadData.name)) {
                throw new Error("name is invalid!");
            }

            //文件特征码 在进度展示和取消上传时起作用
            if (!file.hash) {
                file.hash = CSUtils.hashCode(file);
            }

            var taskInfo = {
                file: file,
                uploadData: uploadData,
                listenner: listenner,
                token: token,
                session: session
            };
            //添加上传任务
            taskAdded(taskInfo);
        },


        /**
         * 文件覆盖上传
         * @param serviceName       服务名
         * @param file              文件内容
         * @param dentryId          被覆盖的文件id
         * @param scope             公开/私密
         * @param listenner         上传监听
         * @param token             token鉴权模块
         * @param session           session鉴权模块
         */
        uploadCover: function (serviceName, file, dentryId, scope, listenner, token, session) {
            if (!serviceName) {
                throw new Error("require serviceName");
            }

            if (!dentryId) {
                throw new Error("require dentryId");
            }
            if (!CSUtils.isUuid(dentryId)) {
                throw new Error(" dentryId is invalid");
            }

            //检查listenner模块是否正确
            if (typeof listenner === "object") {
                if (typeof listenner.onNotifySuccess !== "function") {
                    throw new Error("require success callback");
                }
                if (typeof listenner.onNotifyFail !== "function") {
                    throw new Error("require failure callback");
                }
                if (typeof listenner.onNotifyProgress !== "function") {
                    throw new Error("require progress callback");
                }
            } else {
                throw new Error("require listenner");
            }
            var uploadData = {};

            uploadData.dentryId = dentryId;
            uploadData.scope = scope;
            uploadData.serviceName = serviceName;

            if (!file.hash) {
                file.hash = CSUtils.hashCode(file);
            }
            var taskInfo = {
                file: file,
                uploadData: uploadData,
                listenner: listenner,
                token: token,
                session: session
            };
            taskAdded(taskInfo);
        },


        /**
         * 通过路径下载
         * @param serviceName      服务名
         * @param remotePath       服务器远端路径
         * @param size             缩略图尺寸
         * @param attachment       是否需要附件下载
         * @param name             指定附件下载时的名称
         * @param token            token鉴权模块
         * @param session          session鉴权模块
         * @param callback         失败回调
         */

        downloadByPath: function (serviceName, remotePath, size, attachment, name, token, session, callback) {

            //name没传
            if (typeof session === "function") {
                callback = session;
                session = token;
                token = name;
                name = null;
            }
            //attachment和name都没传
            if (typeof token === "function") {
                callback = token;
                session = name;
                token = attachment;
                attachment = false;
                name = null;
            }

            var result = checkDownloadParams("path", serviceName, remotePath, size, attachment, name);
            if (result.status === "failed") {
                callback(result);
                return;
            }

            var params = "serviceName=" + serviceName;
            if (size) {
                params += "&size=" + size;
            }
            var encodeParams = params;
            if (attachment && attachment === "true") {
                params += "&attachment=" + attachment;
                encodeParams = params;
                if (name) {
                    encodeParams += "&name=" + encodeURIComponent(name);
                    params += "&name=" + name;
                }
            }
            if (token) {
                token.getToken(Content.TOKENTYPE.DOWNLOAD_PATH, remotePath, null, params, function (tokenInfo) {
                    if (tokenInfo.token) {
                        var url = Content.HOST + Content.VERSION + "/download/actions/direct?path=" + encodeURIComponent(remotePath) + "&" + encodeParams + "&token=" +
                            tokenInfo.token + "&policy=" + tokenInfo.policy + "&expireAt=" + tokenInfo.expire_at;
                        openDownloadLink(url, callback);
                    } else {
                        throw new Error("get token error");
                    }
                });
            } else if (session) {
                session.getSession(function (session) {
                    var url = Content.HOST + Content.VERSION + "/download/actions/direct?path=" + encodeURIComponent(remotePath) + "&" + params + "&session=" + session;
                    openDownloadLink(url, callback);
                });
            } else {
                var url = Content.HOST + Content.VERSION + "/download/actions/direct?path=" + encodeURIComponent(remotePath) + "&" + params;
                openDownloadLink(url, callback);
            }
        },

        /**
         * 通过dentryId获取下载地址
         * @param serviceName      服务名
         * @param dentryId         下载的文件id
         * @param size             缩略图尺寸
         * @param attachment       是否需要附件下载
         * @param name             指定附件下载时的名称
         * @param token            token鉴权模块
         * @param session          session鉴权模块
         * @param callback         回调下载地址
         */
        getDownloadUrlByDentryId: function (serviceName, dentryId, size, attachment, name, token, session, callback) {

            //name没传
            if (typeof session === "function") {
                callback = session;
                session = token;
                token = name;
                name = null;
            }
            //attachment和name都没传
            if (typeof token === "function") {
                callback = token;
                session = name;
                token = attachment;
                attachment = false;
                name = null;
            }

            var result = checkDownloadParams("dentryId", serviceName, dentryId, size, attachment, name);
            if (result.status === "failed") {
                callback(result);
                return;
            }

            var params = "serviceName=" + serviceName;
            if (size) {
                params += "&size=" + size;
            }
            var encodeParams = params;
            if (attachment && attachment === "true") {
                params += "&attachment=" + attachment;
                encodeParams = params;
                if (name) {
                    encodeParams += "&name=" + encodeURIComponent(name);
                    params += "&name=" + name;
                }
            }
            if (token) {
                token.getToken(Content.TOKENTYPE.DOWNLOAD_ID, null, dentryId, params, function (tokenInfo) {
                    if (tokenInfo.token) {
                        var url = Content.HOST + Content.VERSION + "/download/actions/direct?dentryId=" + dentryId + "&" + encodeParams + "&token=" + tokenInfo.token + "&policy=" + tokenInfo.policy + "&expireAt=" + tokenInfo.expire_at;
                        result.status = "succeed";
                        result.url = Content.urlProcess(url);
                    } else {
                        result.status = "failed";
                        result.error = "get token error";
                    }
                    callback(result);
                });
            } else if (session) {
                session.getSession(function (session) {
                    var url = Content.HOST + Content.VERSION + "/download/actions/direct?dentryId=" + dentryId + "&session=" + session + "&" + params;
                    result.status = "succeed";
                    result.url = Content.urlProcess(url);
                    callback(result);
                });
            } else {
                var url = Content.HOST + Content.VERSION + "/download/actions/direct?dentryId=" + dentryId + "&" + params;
                result.status = "succeed";
                result.url = Content.urlProcess(url);
                callback(result);
            }
        },

        /**
         * 通过id下载
         * @param serviceName      服务名
         * @param dentryId         下载的文件id
         * @param size             缩略图尺寸
         * @param attachment       是否需要附件下载
         * @param name             指定附件下载时的名称
         * @param token            token鉴权模块
         * @param session          session鉴权模块
         * @param callback         失败回调
         */
        downloadById: function (serviceName, dentryId, size, attachment, name, token, session, callback) {

            //name没传
            if (typeof session === "function") {
                callback = session;
                session = token;
                token = name;
                name = null;
            }
            //attachment和name都没传
            if (typeof token === "function") {
                callback = token;
                session = name;
                token = attachment;
                attachment = false;
                name = null;
            }

            var result = checkDownloadParams("dentryId", serviceName, dentryId, size, attachment, name);
            if (result.status === "failed") {
                callback(result);
                return;
            }
            this.getDownloadUrlByDentryId(serviceName, dentryId, size, attachment, name, token, session, function (data) {
                openDownloadLink(data.url, callback);
            });
        },


        /**
         * 取消上传
         * @param file
         */
        stop: function (file) {
            if (!file) {
                return;
            }
            if (!uploadTasks || uploadTasks.length <= 0) {
                return;
            }
            var hash = file.hash;
            if (!hash) {
                hash = CSUtils.hashCode(file);
            }

            //停止正在上传的文件
            if (Content.uploadingFile && hash === Content.uploadingFile.hash) {
                Content.setUploadStatus("stop");
                return;
            }
            //移除还没开始上传的文件
            for (var i = 0; i < uploadTasks.length; i++) {
                if (uploadTasks[i].file.hash == hash) {
                    uploadTasks.splice(i, 1);
                    break;
                }
            }
        }
    };
}));

