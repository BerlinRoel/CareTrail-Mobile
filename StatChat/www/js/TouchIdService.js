(function () {

    angular.module('statchat')
        .factory('TouchIdService',
        ['$cordovaTouchID',
            '$ionicHistory',
            '$ionicLoading',
            '$ionicPopup',
            '$ionicPlatform',
            '$rootScope',
            'SecureStorageService',
            '$state',
            'UserControllerService',
            '$window',
            TouchIdService])

    function TouchIdService(
        $cordovaTouchID,
        $ionicHistory,
        $ionicLoading,
        $ionicPopup,
        $ionicPlatform,
        $rootScope,
        SecureStorageService,
        $state,
        UserControllerService,
        $window) {

        var touchIDSuccessCallback = null;

        var osType = '';
        if (window.cordova) {
            osType = cordova.platformId;
        }

        var _init = function (operatingSystemType) {
            switch (operatingSystemType) {
                case "android":
                    _initAndroid();
                    break;
                case "ios":
                    _initIOS();
                    break;
            };
        };

        var authWithTouch = function (operatingSystemType) {
            switch (operatingSystemType) {
                case "android":
                    androidTouchAuth();
                    break;
                case "ios":
                    iosTouchAuth();
                    break;
            };
        };

        //========================================//
        //	Functions for android touchID plugin  //
        //========================================//
        var _initAndroid = function () {
            FingerprintAuth.isAvailable(_isAvailable, _notAvailable);
        };

        function _isAvailable(result) {
            if (result.isAvailable) {
                if (result.hasEnrolledFingerprints) {
                    console.log('Fingerprint authentication is available');
                    $rootScope.deviceSupported = true;
                } else {
                    alert('Fingerprint authentication is available but there are no fingerprints registed on this device.');
                    $rootScope.deviceSupported = false;
                    console.log($rootScope);
                }
            };
        };

        function _notAvailable(message) {
            console.log('Error with fingerprint authentication!! :' + message);
            $rootScope.deviceSupported = false;
        };

        var androidTouchAuth = function () {
            FingerprintAuth.show({
                //arbitrary value not used for anything just can't be blank for plugin to work
                clientId: 'client_id',
                //arbitrary value not used for anything just can't be blank for plugin to work
                clientSecret: 'client_secret'
            }, successCallback, errorCallback);
        }


        //====================================//
        //	Functions for iOS touchID plugin  //
        //====================================//
        var _initIOS = function () {
            $cordovaTouchID.checkSupport()
                .then(isSupported)
                .catch(notSupported);
        };

        function isSupported() {
            $rootScope.deviceSupported = true;
        };

        function notSupported(error) {
            $rootScope.deviceSupported = false;
            console.log(JSON.stringify(error));
        };

        var iosTouchAuth = function () {
            $cordovaTouchID.authenticate('Authenticate using fingerprint')
                .then(successCallback)
                .catch(errorCallback);
        }


        //====================================//
        //	    Shared callback functions     //
        //====================================//
        function successCallback() {
            if (touchIDSuccessCallback != null) {
                touchIDSuccessCallback();
            }
        };

        function errorCallback(message) {
            console.log('ERROR CALLBACK FUNCTION RUNNING: ' + message);
        };

        //Wrapper function to initialize respective plugin
        var start = function () {
            _init(osType);
        };

        //Wrapper function to authenticate using touch ID on respective device
        var authUsingTouchId = function (callback) {
            touchIDSuccessCallback = callback;

            // A saved password is required for auth to work
            SecureStorageService.getInfo('CaretrailLogin', successCallback, errorCallback);

            function successCallback(password) {
                if (password != undefined && password != null && password != '') {
                    authWithTouch(osType);
                }
            }

            function errorCallback(error) {
                console.log("authUsingTouchId() GetInfo Password error", error);
            }
        }

        return {
            start: start,
            authUsingTouchId: authUsingTouchId
        }
    }
})();