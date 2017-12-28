(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/common/uploader',['./httpclient', '../common/content', '../common/utils'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('./httpclient'),
            require('./content'),
            require('./utils')
        );
    } else {
        root.CSUploader = factory(root.CSHttpClient, root.Content, root.CSUtils);
    }
}(window.CSSDK||(window.CSSDK={}), function (CSHttpClient, Content, CSUtils) {

    //选择鉴权方式 token/session
    var selectAuthMode = function (uploadData, session, token, callback) {
        if (token) {
            var path;
            var dentryId;
            if (uploadData.path && uploadData.name) {
                path = uploadData.path + "/" + uploadData.name;
            } else {
                dentryId = uploadData.dentryId;
            }
            token.getToken(Content.TOKENTYPE.UPLOAD_NORMAL, path, dentryId, null, function (tokenInfo) {
                if (tokenInfo.token) {
                    var url = Content.HOST + Content.VERSION + "/upload?token=" + tokenInfo.token + "&policy=" + tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                    callback(url);
                } else {
                    callback(tokenInfo);
                }
            });
        } else {
            session.getSession(function (session) {
                var url = Content.HOST + Content.VERSION + "/upload?serviceName=" + uploadData.serviceName + "&session=" + session;
                callback(url);
            });
        }
    };

    //获取分块状态
    var uploadStatus = function (parentId, path, name, chunks, session, token, onNotifySuccess, onNotifyFail) {

        var param = "name=" + name + "&chunks=" + chunks;
        param += path ? "&path=" + encodeURIComponent(path) : "&parentId=" + parentId;

        if (token) {
            var uri = Content.VERSION + "/upload/actions/status?" + param;
            token.getToken(Content.TOKENTYPE.STATUS, path, parentId, param, function (tokenInfo) {
                if (tokenInfo.token) {
                    var url = Content.HOST + uri + "&token=" + tokenInfo.token + "&policy=" + tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                    CSHttpClient.doGetRequest(url, onNotifySuccess, onNotifyFail);
                } else {
                    onNotifyFail(tokenInfo);
                }
            });
        } else {
            session.getSession(function (session) {
                var url = Content.HOST + Content.VERSION + "/upload/actions/status?" + param + "&session=" + session;
                CSHttpClient.doGetRequest(url, onNotifySuccess, onNotifyFail);
            });
        }
    };

    //继续上传分块（支持断点续传）
    var uploadChunks = function (uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail) {

        var chunkSize = Content.getChunkSize() * 1024 * 1024;   //5M

        var chunk = uploadData.chunk;
        var chunks = uploadData.chunks;

        uploadData.size = file.size;

        //回调文件正在开始上传
        var progress = {
            file_hash: file.hash,
            loaded: chunk * chunkSize,
            total: file.size
        };
        onNotifyProgress(progress);

        //上传第N个分块
        var uploadNchunk = function (chunk) {
            var start = chunk * chunkSize;
            var end = chunk < chunks - 1 ? start + chunkSize : file.size;
            //设置缓存key的格式
            var cacheKey;
            if (uploadData.path && uploadData.name) {
                cacheKey = uploadData.path + "_" + uploadData.name + "_" + file.hash + "_" + chunks;
            } else {
                cacheKey = uploadData.dentryId + "_" + file.hash + "_" + chunks;
            }

            //分块上传第N块文件
            (function (chunk, start, end) {
                uploadData.chunk = chunk;
                uploadData.pos = chunk * chunkSize;
                var formData = CSUtils.objToFormdata(uploadData);
                formData.append("file", file.source.slice(start, end));

                //上传分块成功
                var uploadChunkSuccess = function (data) {
                    if (chunk < chunks - 1) {
                        //上传分块成功 更新缓存
                        Content.setStorage(cacheKey, String(chunk));
                        uploadNchunk(++chunk);
                    } else {
                        //上传文件成功 删除缓存
                        Content.setStorage(cacheKey, "");
                        onNotifySuccess(data);
                    }
                };

                //上传分块失败
                var uploadChunkFailed = function (data) {
                    //上传分块失败 记录当前成功上传的分块位置
                    if (chunk >= 1) {
                        Content.setStorage(cacheKey, chunk - 1);
                    }
                    onNotifyFail(data);
                };

                //获取进度
                var uploadProgress = function (progress) {
                    var realProgress = CSUtils.deepCopy(progress);
                    //进度事件
                    realProgress.loaded = chunk * chunkSize + realProgress.loaded;
                    realProgress.total = file.size;
                    onNotifyProgress(realProgress);
                };

                selectAuthMode(uploadData, session, token, function (url) {
                    //获取token或session失败
                    if (typeof url === "object") {
                        onNotifyFail(url);
                    } else {
                        CSHttpClient.doUploadRequest(url, "POST", {}, formData, uploadProgress, uploadChunkSuccess, uploadChunkFailed);
                    }
                });
            })(chunk, start, end);
        };
        uploadNchunk(chunk);
    };

    return {
        upload: function (file, uploadData, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            if (!file) {
                throw new Error("Please select file！");
            }
            //如果是通过pluploader选择的文件 会经过一层封装 file.getNative()获取文件实际内容
            /** @namespace file.getNative */
            if (typeof file.getNative === "function") {
                file.source = file.getNative();
            } else {
                file.source = file;
            }

            //用于上传文件夹时指定当前文件的父目录
            uploadData.path = file.path || uploadData.path;
            //一次性上传
            var chunkSize = Content.getChunkSize() * 1024 * 1024;
            if (file.size <= chunkSize) {
                var progress = {
                    file_hash: file.hash,
                    loaded: 0,
                    total: file.size
                };
                onNotifyProgress(progress);

                var formData = CSUtils.objToFormdata(uploadData);
                formData.append("file", file.source);
                selectAuthMode(uploadData, session, token, function (url) {
                    CSHttpClient.doUploadRequest(url, "POST", {}, formData, onNotifyProgress, onNotifySuccess, onNotifyFail);
                });
            } else {
                var chunks = Math.ceil(file.size / chunkSize);
                uploadData.chunks = chunks;

                //从cookie中读取
                var cacheKey;
                if (uploadData.path && uploadData.name) {
                    cacheKey = uploadData.path + "_" + uploadData.name + "_" + file.hash + "_" + chunks;
                } else {
                    cacheKey = uploadData.dentryId + "_" + file.hash + "_" + chunks;
                }
                var chunkCache = Content.getStorage(cacheKey);
                //断点续传
                if (!chunkCache) {
                    //覆盖上传没有parentId和path
                    /** @namespace uploadData.parentId */
                    if (uploadData.parentId || uploadData.path) {
                        uploadStatus(uploadData.parentId, uploadData.path, uploadData.name, chunks, session, token, function (data) {
                            uploadData.chunk = Object.getOwnPropertyNames(data).length - 1;
                            uploadChunks(uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail);
                        }, function () {
                            uploadData.chunk = 0;
                            uploadChunks(uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail);
                        });
                    } else {
                        uploadData.chunk = 0;
                        uploadChunks(uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail);
                    }
                } else {
                    uploadData.chunk = chunkCache;
                    uploadChunks(uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail);
                }
            }
        }
    };
}));
