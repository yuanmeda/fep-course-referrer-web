(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/common/httpclient', ['./content'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('./content'));
    } else {
        root.CSHttpClient = factory(root.Content);
    }
}(window.CSSDK||(window.CSSDK={}), function (Content) {
    return {
        /**
         * 执行GET请求
         * @param url
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doGetRequest: function (url, onNotifySuccess, onNotifyFail) {
            Content.send({
                url: url,
                type: "GET",
                dataType: 'json'
            }, onNotifySuccess, onNotifyFail);
        },
        /**
         * 执行POST请求
         * @param url
         * @param body
         * @param headers
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doPostRequest: function (url, body, headers, onNotifySuccess, onNotifyFail) {
            if ('function' === typeof headers) {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = headers;
                headers = {};
            }
            var datatype = headers.dataType || 'json';
            var contentType = headers.contentType || Content.JSONTYPE;
            delete headers.contentType;
            delete headers.dataType;
            Content.send({
                url: url,
                type: "POST",
                dataType: datatype,
                headers: headers,
                contentType: contentType,
                data: body
            }, onNotifySuccess, onNotifyFail);
        },

        /**
         * 执行POST请求
         * @param url
         * @param method
         * @param headers
         * @param body
         * @param onNotifyProgress
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doUploadRequest: function (url, method, headers, body, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            var contentType = headers.contentType || false;
            delete headers.contentType;
            var dataType = body instanceof Blob ? "xml" : "json";
            Content.send({
                url: url,
                type: method,
                headers: headers,
                contentType: contentType,
                dataType: dataType,
                processData: false,
                data: body
            }, onNotifyProgress, onNotifySuccess, onNotifyFail);
        },

        /**
         * 执行PUT请求
         * @param url
         * @param body
         * @param headers
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doPutRequest: function (url, body, headers, onNotifySuccess, onNotifyFail) {
            if ('function' === typeof headers) {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = headers;
                headers = {};
            }
            Content.send({
                url: url,
                type: "PUT",
                data: body,
                dataType: 'json',
                contentType: Content.JSONTYPE,
                headers: headers,
                processData: false
            }, onNotifySuccess, onNotifyFail);
        },
        /**
         * 执行DELETE请求
         * @param url
         * @param headers
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doDeleteRequest: function (url, headers, onNotifySuccess, onNotifyFail) {
            if ('function' === typeof headers) {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = headers;
                headers = {};
            }
            Content.send({
                url: url,
                type: "DELETE",
                dataType: 'json',
                headers: headers,
                contentType: Content.JSONTYPE
            }, onNotifySuccess, onNotifyFail);
        },
        /**
         * 执行PATCH请求
         * @param url
         * @param body
         * @param headers
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doPatchRequest: function (url, body, headers, onNotifySuccess, onNotifyFail) {
            if ('function' === typeof headers) {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = headers;
                headers = {};
            }
            Content.send({
                url: url,
                type: "PATCH",
                dataType: "json",
                headers: headers,
                contentType: Content.JSONTYPE,
                data: body
            }, onNotifySuccess, onNotifyFail);
        }
    };
}));
