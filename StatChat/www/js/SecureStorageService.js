(function () {

    angular.module('statchat')
        .factory('SecureStorageService', ['$ionicPlatform', SecureStorageService])

    function SecureStorageService($ionicPlatform) {

        var secureStorage = '';

        var _init = function () {
            if (window.cordova && window.cordova.plugins) {
                secureStorage = new cordova.plugins.SecureStorage(initSuccess, initError, 'CaretrailApp');
            }
            function initSuccess() {
            };
            function initError(error) {
            };
        };

        var setInfo = function (setKey, setValue) {
            $ionicPlatform.ready(function () {
                if (secureStorage != '') {
                    secureStorage.set(setSuccess, setError, setKey, setValue);
                }
            })
            function setSuccess(key) {
            };
            function setError(error) {
            };
        };

        var getInfo = function (key, successCallback, errorCallback) {
            $ionicPlatform.ready(function () {
                if (secureStorage != '') {
                    secureStorage.get(getSuccess, getError, key);
                }
            });

            function getSuccess(returnedInfo) {
                successCallback(returnedInfo);
            };

            function getError(error) {
                errorCallback(error);
            };
        };

        var start = function () {
            _init();
        };

        return {
            start: start,
            setInfo: setInfo,
            getInfo: getInfo
        }

    }

})();