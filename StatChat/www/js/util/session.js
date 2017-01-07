'use strict';

(function(angular) {

    var module = angular.module('statchat.session', ['ionic', 'ngResource', 'statchat.services']);

    module.factory('SessionTimeoutInterceptor', ['$rootScope', '$q', SessionTimeoutInterceptor]);

    function SessionTimeoutInterceptor($rootScope, $q) {
        var SESSION_LOGOUT_TEXT = 'token is invalid. Please login again';
        var responseError = function(response) {
            if (response.status === 500 && response.data && response.data.indexOf(SESSION_LOGOUT_TEXT) > -1) {
                $rootScope.$broadcast('ct:sessionLogout');
            }
            return $q.reject(response);
        };

        return {
            responseError: responseError
        };
    }

    module.run(['$state', '$rootScope', '$ionicPopup', '$ionicLoading', '$ionicHistory',
        '$window', 'UserControllerService', setupSessionLogoutHandler]);

    function setupSessionLogoutHandler($state, $rootScope, $ionicPopup, $ionicLoading, $ionicHistory, $window, UserControllerService) {
        $rootScope.$on('$ionicView.loaded', function(e, data) {
            if (data && data.stateName === 'tab.login') {
                $rootScope.sessionLogoutMsg = false;
            }
        });
        setLogout($rootScope, $ionicLoading, $ionicHistory, $state, $window, UserControllerService, $rootScope, $ionicPopup);
        $rootScope.$on('ct:sessionLogout', function() {
            console.log('You are currently logged in on another device.')
            if ($rootScope.sessionLogoutMsg || $rootScope.goBackToLoginInactivePopUp != undefined) {
                return;
            }
            window.clearTimeout(timeoutID);
            timeoutID = null;
            $rootScope.sessionLogoutMsg = true;
            $rootScope.goBackToLoginPopUp = true;
            if (navigator.notification) {
                var onTapOK = function() {
                    window.clearTimeout(timeoutID);
                    timeoutID = null;
                    $rootScope.logout();
                }
                navigator.notification.alert(
                    'You are currently logged-in on another device.',
                    onTapOK,
                    'Sign-In Detected',
                    'OK'
                );
            }
            else {
                $rootScope.errMsg = 'You are currently logged-in on another device.';
                $ionicPopup.alert({
                    cssClass: 'error-popup',
                    title: 'Sign-In Detected',
                    templateUrl: 'templates/common/popup-error.html',
                    scope: $rootScope,
                    buttons: [
                        {
                            text: 'OK',
                            onTap: function() {
                                window.clearTimeout(timeoutID);
                                timeoutID = null;
                                $rootScope.logout();
                            }
                        }
                    ]
                });
            }
        });
    }

    module.config(['$httpProvider',
        function($httpProvider) {
            $httpProvider.interceptors.push('SessionTimeoutInterceptor');
        }
    ]);

})(angular);
