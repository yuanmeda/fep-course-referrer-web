/**
 * ceph s3 sdk
 * Created by Administrator on 2016/2/4.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/third-platform-sdk/ceph-s3-sdk', [
            '../common/content',
            '../common/httpclient'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('../common/content'),
            require('../common/httpclient')
        );
    } else {
        root.CephS3 = factory(root.Content, root.CSHttpClient);
    }
}(window.CSSDK||(window.CSSDK={}), function (Content, CSResfulClient) {
    return {
        putObject: function (file, uploadData, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            /** @namespace uploadData.upload_url */
            var url = uploadData.upload_url;
            var headers = {};

            var contentType = file.type;
            if (!contentType) {
                contentType = "application/octet-stream";
            }
            headers.contentType = contentType;
            headers.Authorization = uploadData.upload_token;
            if (uploadData.nds_cb_url) {
                headers["nds-cb-url"] = uploadData.nds_cb_url;
            }
            headers["x-amz-date"] = uploadData.upload_date;
            CSResfulClient.doUploadRequest(url, "PUT", headers, file, onNotifyProgress, onNotifySuccess, onNotifyFail);
        },

        getTokenParams: function (type) {
            /*type：文件上传类型
             0 - 一次性上传
             1 - 初始化分块上传
             2 - 分块上传第N块文件
             3 - 完成分块上传*/
            type = parseInt(type);
            var map = {};
            map.xAmzDate = "1";
            switch (type) {
                case 2:
                    map.uploadId = 1;
                    map.objectName = 1;
                    map.chunkNum = 1;
                    break;
                case 3:
                    map.uploadId = 1;
                    map.objectName = 1;
                    break;
                default:
                    break;
            }
            return map;
        },

        initiateMultipartUpload: function (uploadData, onNotifySuccess) {
            var url = uploadData.upload_url;
            var headers = {};
            /** @namespace uploadData.upload_token */
            headers.Authorization = uploadData.upload_token;
            /** @namespace uploadData.upload_date */
            headers["x-amz-date"] = uploadData.upload_date;
            headers.contentType = uploadData.contentType;
            headers.dataType = "xml";
            var body = {};
            CSResfulClient.doPostRequest(url, body, headers, function (data) {
                onNotifySuccess(data.documentElement.childNodes);
            }, function (data) {
                throw new Error("initiateMultipartUpload failed! " + JSON.stringify(data));
            });
        },

        multipartUploadPartByStream: function (uploadData, uploadId, file, onNotifyProgress, onNotifySuccess) {
            /** @namespace uploadData.upload_url */
            var url = uploadData.upload_url;
            var headers = {};
            headers.Authorization = uploadData.upload_token;
            headers["x-amz-date"] = uploadData.upload_date;
            headers.contentType = Content.JSONTYPE;
            CSResfulClient.doUploadRequest(url, "PUT", headers, file, onNotifyProgress, function (data) {
                onNotifySuccess(data.etag);
            }, function (data) {
                onNotifySuccess(data.etag);
            });
        },

        completeMultipartUpload: function (uploadData, uploadId, etags, onNotifySuccess) {
            var url = uploadData.upload_url;
            var headers = {};
            headers.Authorization = uploadData.upload_token;
            headers["x-amz-date"] = uploadData.upload_date;
            if (uploadData.nds_cb_url) {
                headers["nds-cb-url"] = uploadData.nds_cb_url;
            }
            headers.contentType = Content.JSONTYPE;
            headers.dataType = "xml";
            var body = "<?xml version=\"1.0\"?><CompleteMultipartUpload>";
            for (var i = 1; i <= etags.length; i++) {
                body += "<Part><PartNumber>" + i + "</PartNumber><ETag>" + etags[i - 1] + "</ETag></Part>";
            }
            body += "</CompleteMultipartUpload>";
            CSResfulClient.doPostRequest(url, body, headers, onNotifySuccess, function (data) {
                onNotifySuccess(data);
            }, function (data) {
                throw new Error("completeMultipartUpload failed ! " + JSON.stringify(data));
            });
        }
    };
}));







