/**
 * ceph s3 sdk adapter
 * Created by Administrator on 2016/4/6.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/third-platform-adapter/ceph-s3-adapter', [
            "../third-platform-sdk/ceph-s3-sdk",
            "../common/httpclient",
            "../common/content",
            "../common/utils"], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('../third-platform-sdk/ceph-s3-sdk'),
            require('../common/httpclient'),
            require('../common/content'),
            require('../common/utils')
        );
    } else {
        root.CephS3Adapter = factory(root.CephS3, root.CSHttpClient, root.Content, root.CSUtils);
    }
}(window.CSSDK||(window.CSSDK={}), function (CephS3, CSHttpClient, Content, CSUtils) {

    var cacheKey = function (file, uploadData) {
        var key;
        if (uploadData.path && uploadData.name) {
            key = uploadData.path + "_" + uploadData.name + "_" + file.hash;
        } else {
            key = uploadData.dentryId + "_" + file.hash;
        }
        return key;
    };

    //更新目录项状态
    var valid = function (dentryId, path, token, session, onNotifySuccess, onNotifyFail) {
        if (CSUtils.isBlank(dentryId) && CSUtils.isBlank(path)) {
            throw new Error("dentryId or path must select one");
        }

        var params = "";
        if (dentryId) {
            params += "dentryId=" + dentryId;
        } else {
            params += "path=" + path;
        }
        if (token) {
            token.getToken(Content.TOKENTYPE.VALID, path, dentryId, params, function (tokenInfo) {
                if (tokenInfo.token) {
                    params = encodeURIComponent(params).replace(/%2F/g, "/").replace(/%3D/g, "=");
                    var url = Content.HOST + Content.VERSION + "/dentries/actions/valid?" + params + "&token=" + tokenInfo.token + "&policy=" + tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                    CSHttpClient.doPutRequest(url, JSON.stringify({}), onNotifySuccess, onNotifyFail);
                } else {
                    onNotifyFail(tokenInfo);
                }
            });
        } else {
            session.getSession(function (session) {
                params = encodeURIComponent(params).replace(/%2F/g, "/").replace(/%3D/g, "=");
                var url = Content.HOST + Content.VERSION + "/dentries/actions/valid?" + params + "&session=" + session;
                CSHttpClient.doPutRequest(url, JSON.stringify({}), onNotifySuccess, onNotifyFail);
            });
        }
    };

    //获取上传token
    var getUploadToken = function (file, dentry, tokenParams, token, session,onNotifyProgress,onNotifySuccess, onNotifyFail) {

        //进度回调方法兼容处理
        if(!onNotifyFail){
            onNotifyFail = onNotifySuccess;
            onNotifySuccess = onNotifyProgress;
            onNotifyProgress = null;
        }

        var doRequest = function (file, tokenParams, dentry, url) {
            dentry.tokenParams = JSON.stringify(tokenParams);
            if (file && file.path) {
                dentry.path = file.path;
            }

            var formData = CSUtils.objToFormdata(dentry);
            CSHttpClient.doUploadRequest(url, "POST", {}, formData, null, function (response) {
                dentry = {};
                /** @namespace response.upload_params */
                //秒传成功
                if (response.type === 2 && response.valid !== -1) {
                    delete response.upload_params;
                    onNotifySuccess(response);
                } else {
                    var uploadParams = response.upload_params;
                    uploadParams.path = response.path;
                    onNotifySuccess(uploadParams);
                }
            }, function (data) {
                onNotifyFail("Get uploadParameter falied!" + JSON.stringify(data));
            });
        };

        //没传file说明是上传第N分块，不需要设置md5 size 和contentType
        var requestPreparation = function (file, tokenParams, dentry, url) {
            if (file) {
                tokenParams.contentType = file.type;
                if (!tokenParams.contentType) {
                    tokenParams.contentType = "application/octet-stream";
                }
                CSUtils.calMd5(file.source,onNotifyProgress,function (md5) {
                    dentry.md5 = md5;
                    dentry.size = file.size || 0;
                    doRequest(file, tokenParams, dentry, url);
                },onNotifyFail);
            } else {
                //设置默认default
                tokenParams.contentType = Content.JSONTYPE;
                doRequest(file, tokenParams, dentry, url);
            }
        };
        if (token) {
            var path;
            var dentryId;
            if (dentry.path && dentry.name) {
                path = dentry.path + "/" + dentry.name;
            } else {
                dentryId = dentry.dentryId;
            }
            token.getToken(Content.TOKENTYPE.UPLOAD_DIRECT, path, dentryId, null, function (tokenInfo) {
                if (tokenInfo.token) {
                    var url = Content.HOST + Content.VERSION + "/upload/actions/direct?token=" + tokenInfo.token + "&policy=" +
                        tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                    requestPreparation(file, tokenParams, dentry, url);
                } else {
                    onNotifyFail(tokenInfo);
                }
            });
        } else {
            session.getSession(function (session) {
                var url = Content.HOST + Content.VERSION + "/upload/actions/direct?serviceName=" + dentry.serviceName + "&session=" + session;
                requestPreparation(file, tokenParams, dentry, url);
            });
        }
    };

    //解析xml
    var parseXmlNode = function (responseText, node) {

        for(var i = 0;i< responseText.length;i++){
            if(responseText[i].nodeName === node){
                return responseText[i].textContent;
            }
        }
        return "";
        //return responseText.slice(responseText.indexOf("<" + node + ">"), responseText.indexOf("</" + node + ">")).replace("<" + node + ">", "");
    };

    //初始化分块上传
    var initiateMultipartUpload = function (file, dentry, token, session,onNotifyProgress, onNotifySuccess, onNotifyFail) {
        var tokenParams = CephS3.getTokenParams(1);
        (function (file, dentry, tokenParams) {
            dentry.chunkType = 1;
            getUploadToken(file, dentry, tokenParams, token, session, onNotifyProgress, function (uploadParams) {
                /** @namespace uploadParams.dentry_id */
                if (uploadParams.dentry_id) {
                    onNotifySuccess(uploadParams);
                } else {
                    uploadParams.contentType = tokenParams.contentType;
                    CephS3.initiateMultipartUpload(uploadParams, function (responseText) {
                        var data = {};
                        data.UploadId = parseXmlNode(responseText, "UploadId");
                        data.objectName = parseXmlNode(responseText, "Key");
                        data.path = uploadParams.path;
                        onNotifySuccess(data);
                    }, onNotifyFail);
                }
            }, onNotifyFail);
        })(file, dentry, tokenParams);
    };

    //分块上传文件
    var multipartUpload = function (uploadId, objectName, file, dentry, etags, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail) {
        if (!etags) {
            etags = [];
        }
        var chunkSize = Content.getChunkSize() * 1024 * 1024;   //5M
        var chunks = Math.ceil(file.size / chunkSize);
        //计算需要上传的分块
        var chunkNumArr = [];

        if (etags && etags.length > 0) {
            if (etags.length === chunks) {
                onNotifySuccess(etags);
                return;
            }
            for (var i = 0; i < chunks; i++) {
                if (!etags[i]) {
                    chunkNumArr.push(i + 1);
                }
            }
        } else {
            for (var m = 1; m <= chunks; m++) {
                chunkNumArr.push(m);
            }
        }

        //文件大于5M 加上计算md5花费的进度
        var md5Cost = 0;
        var rate = 1;
        if(file.size > Content.CALMD5CHUNK * 1024 *1024){
            md5Cost = file.size * 0.1;
            rate = 0.9;
        }

        //回调文件正在开始上传
        var progress = {
            file_hash: file.hash,
            loaded: etags.length * chunkSize * rate + md5Cost,
            total: file.size
        };

        onNotifyProgress(progress);

        var cache = {};
        cache.UploadId = uploadId;
        cache.objectName = objectName;
        cache.etags = etags;
        cache.fullPath = dentry.fullPath;

        var n = 0;
        var uploadNChunk = function (n) {
            var chunkNum = chunkNumArr[n];
            var start = (chunkNum - 1) * chunkSize;
            var end = file.size;
            if (chunkNum !== chunks) {
                end = start + chunkSize;
            }
            //分块上传第N块文件
            (function (chunkNum, start, end) {
                var tokenParams = CephS3.getTokenParams(2);
                tokenParams.uploadId = uploadId;
                tokenParams.objectName = objectName;
                tokenParams.chunkNum = chunkNum;
                dentry.chunkType = 2;
                getUploadToken(null, dentry, tokenParams, token, session, function (uploadParams) {
                    var chunkContent = file.source.slice(start, end);
                    CephS3.multipartUploadPartByStream(uploadParams, uploadId, chunkContent, function (curProgress) {
                        progress = {
                            file_hash: file.hash,
                            loaded: (etags.length * chunkSize + curProgress.loaded) * rate  + md5Cost,
                            total: file.size
                        };
                        onNotifyProgress(progress);
                    }, function (etag) {
                        if (etag) {
                            etag = etag.substring(1, (etag.length - 1));
                            etags[chunkNum - 1] = etag;
                            Content.setStorage(cacheKey(file, dentry), JSON.stringify(cache));
                        } else {
                            onNotifyFail("upload part falid ! uploadId=" + uploadId + " partNumber=" + n);
                            return;
                        }
                        if (etags.length < chunks) {
                            uploadNChunk(++n);
                        } else {
                            onNotifySuccess(etags);
                        }
                    });
                }, onNotifyFail);
            })(chunkNum, start, end);
        };
        uploadNChunk(n);
    };

    //完成分块上传
    var completeMultipartUpload = function (uploadId, objectName, dentry, etags, token, session, onNotifySuccess, onNotifyFail) {
        var tokenParams = CephS3.getTokenParams(3);
        dentry.chunkType = 3;
        tokenParams.uploadId = uploadId;
        tokenParams.objectName = objectName;
        getUploadToken(null, dentry, tokenParams, token, session, function (uploadParams) {
            CephS3.completeMultipartUpload(uploadParams, uploadId, etags, onNotifySuccess);
        }, onNotifyFail);
    };

    ////更新目录项有效状态
    var updateValid = function (path, token, session, onNotifySuccess, onNotifyFail, file, onNotifyProgress) {
        valid(null, path, token, session, function (res) {
            onNotifySuccess(res);
            var progress = {
                loaded: file.size,
                total: file.size
            };
            onNotifyProgress(progress);
        }, function (res) {
            onNotifyFail("update dentry valid failed!" + JSON.stringify(res));
        });
    };

    var uploadFileByPart = function (file, dentry, cache, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail) {
        var retryTimes = Content.RETRYTIMES;
        var uploadPartStart = function (data) {
            var uploadId = data.UploadId;
            var objectName = data.objectName;
            var path = data.fullPath;

            //用于修改valid
            dentry.fullPath = path;
            multipartUpload(uploadId, objectName, file, dentry, data.etags, token, session, onNotifyProgress, function (etags) {
                for (var i = 0; i < etags.length; i++) {
                    if (!etags[i]) {
                        //失败重试 并且断点续传
                        if (retryTimes-- >= 0) {
                            uploadFileByPart(file, dentry, cache);
                        } else {
                            onNotifyFail("multipartUpload file failed!");
                        }
                    }
                }
                //完成分块上传
                completeMultipartUpload(uploadId, objectName, dentry, etags, token, session, function () {
                    //移除分块记录缓存
                    Content.setStorage(cacheKey(file, dentry), "");
                    //更新目录项有效状态
                    updateValid(path, token, session, onNotifySuccess, onNotifyFail, file, onNotifyProgress);
                }, onNotifyFail);
            }, onNotifyFail);
        };
        //断点续传
        if (cache) {
            var cacheData = JSON.parse(cache);
            uploadPartStart(cacheData);
        } else {
            //分块上传初始化
            initiateMultipartUpload(file, dentry, token, session,onNotifyProgress,function (uploadParams) {
                if (uploadParams.dentry_id) {
                    onNotifySuccess(uploadParams);
                    var progress = {
                        loaded: file.size,
                        total: file.size
                    };
                    onNotifyProgress(progress);
                } else {
                    uploadParams.fullPath = uploadParams.path;
                    uploadPartStart(uploadParams);
                }
            }, onNotifyFail);
        }
    };

    return {
        upload: function (file, dentry, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            if (!file) {
                throw new Error("Please select files！");
            }
            if (typeof file.getNative === "function") {
                file.source = file.getNative();
            } else {
                file.source = file;
            }
            //一次性上传
            if (file.size <= Content.getChunkSize() * 1024 * 1024) {
                var progress = {
                    file_hash: file.hash,
                    loaded: 0,
                    total: file.size
                };
                onNotifyProgress(progress);

                var tokenParams = CephS3.getTokenParams(0);
                getUploadToken(file, dentry, tokenParams, token, session, function (uploadParams) {
                    if (uploadParams.type === 2 && uploadParams.valid !== -1) {
                        //秒传成功
                        delete uploadParams.upload_params;
                        var progress = {
                            loaded: file.size,
                            total: file.size
                        };
                        onNotifyProgress(progress);
                        onNotifyProgress(progress);
                        onNotifySuccess(uploadParams);
                    } else {
                        CephS3.putObject(file.source, uploadParams, function (progress) {
                            //避免直接到100%
                            progress.loaded -= 1;
                            onNotifyProgress(progress);
                        }, function () {
                            updateValid(uploadParams.path, token, session, onNotifySuccess, onNotifyFail, file, onNotifyProgress);
                        }, onNotifyFail);
                    }
                }, onNotifyFail);
            } else {
                //根据文件名、文件大小、文件最后更新时间计算hash值
                var cache = Content.getStorage(cacheKey(file, dentry));
                uploadFileByPart(file, dentry, cache, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail);
            }
        }
    };
}));
