angular.module('statchat.user-controller', ['ngResource', 'ionic', 'ngCordova', 'statchat', 'angularMoment'])
    .constant('ApiEndpoint', {})

    .controller('ResetCtrl', function($scope, $rootScope, $stateParams, $state, SecureStorageService,
        TouchIdService, UserControllerService, $ionicPlatform, $ionicPopup, $window,
        $ionicLoading, $cordovaDevice, $timeout, $cordovaStatusbar, $interval, $ionicHistory) {

        $scope.backToLogin = function() {
            // Clear temp username, mark DO_NOT_REDIRECT so we aren't forced back to the password page immediatelly, go back to login
            $window.localStorage['TEMP_USER_NAME'] = null;
            $window.localStorage['DO_NOT_REDIRECT'] = "true";
            $state.go('tab.login', {}, { reload: true });
        }

        $scope.enableGo = function() {
            if (/@hfhs.org\s*$/.test($('#fld-email').val()) || /@henryford.com\s*$/.test($('#fld-email').val())) {
                $('#btn-go').removeAttr('disabled').attr("onclick", "window.open('http://www.henryfordconnect.com/','_system', 'location=yes')");
            } else if ($('#fld-email').val() == '') {
                $('#btn-go').addAttr('disabled');
            } else {
                $('#btn-go').removeAttr('disabled').attr("onclick", "window.open('https://login.caretrail.io/password','_system', 'location=yes')");
            }
        }

        $scope.goToSite = function() {
            window.open('http://www.henryfordconnect.com/', '_system');
        }

    })

    .controller('LoginCtrl', function($scope, $rootScope, $stateParams, $state, SecureStorageService, TouchIdService, UserControllerService, $ionicPlatform, $ionicPopup, $window,
        $ionicLoading, $cordovaDevice, $timeout, $cordovaStatusbar, $interval, $ionicHistory) {

        $scope.troubleLogin = function() {
            $state.go('tab.reset', {}, { reload: true });
        };

        // 'keyboard-open' class is added to any element with the hide-on-keyboard-open class. 
        // However, it happens 400ms after the keyboard has been opened, so we force it to happen immediately below.
        // https://ionicframework.com/docs/api/page/keyboard/
        window.addEventListener('native.keyboardshow', function() {
            document.body.classList.add('keyboard-open');
        });
        window.addEventListener('native.keyboardhide', function() {
            document.body.classList.remove('keyboard-open');
        });

        $rootScope.hideTabs = true;

        $scope.loginData = {};
        $scope.isLoggingIn = false;

        if (window.StatusBar) {
            StatusBar.styleLightContent();
            if (ionic.Platform.isAndroid()) {
                StatusBar.backgroundColorByHexString('#367bb2');
            }
        }

        if ($ionicHistory.backView() != null) {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
        }

        $scope.sessionData = {};
        if ($window.localStorage['USER_NAME'] != undefined && $window.localStorage['USER_NAME'] != null && $window.localStorage['USER_NAME'] != "null") {
            $scope.sessionData.userId = $window.localStorage['USER_NAME'];
            $scope.sessionData.rememberMe = true;

            // If the username exists in local storage, automatically go to the password page, except for when we specifically don't want it to
            var doNotRedirect = false;
            if ($window.localStorage['DO_NOT_REDIRECT'] != undefined && $window.localStorage['DO_NOT_REDIRECT'] != null && $window.localStorage['DO_NOT_REDIRECT'] != "null") {
                if ($window.localStorage['DO_NOT_REDIRECT'] == "true") {
                    doNotRedirect = true;
                }
            }

            if (!doNotRedirect) {
                $window.localStorage['TEMP_USER_NAME'] = $scope.loginData.userid;

                $state.go('tab.password', {}, { reload: true });
            }
        }

        $scope.doLogin = function() {
            $scope.isLoggingIn = true;

            if ($scope.loginData.rememberMe) {
                $window.localStorage['USER_NAME'] = $scope.loginData.userid;
            } else {
                $window.localStorage['USER_NAME'] = null;
            }

            // Need to save temp username to local storage for password page
            $window.localStorage['TEMP_USER_NAME'] = $scope.loginData.userid;

            //TODO: Delete below two lines when the verifyEmail service is ready            
            $scope.isLoggingIn = false;
            $state.go('tab.password', {}, { reload: true });

            //TODO: The below needs to be uncommented and the above deleted when the verifyEmail service is ready            
            /*UserControllerService.verifyEmail($scope.loginData.userid).then(function(response) {
                $scope.isLoggingIn = false;
                $scope.isLoginService = true;
                $scope.SERVICENAME = 'doLogin-UserControllerService.verifyEmail';
            
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                }
                
                $window.localStorage['TEMP_USER_NAME'] = $scope.loginData.userid;

                $state.go('tab.password', {}, { reload: true });
            });*/
        };
    })
    .controller('PasswordCtrl', function($scope, $rootScope, $stateParams, $state, SecureStorageService, TouchIdService, UserControllerService, $ionicPlatform, $ionicPopup, $window,
        $ionicLoading, $cordovaDevice, $timeout, $cordovaStatusbar, $interval, $ionicHistory, PushService) {

        $scope.troubleLogin = function() {
            $state.go('tab.reset', {}, { reload: true });
        };

        // 'keyboard-open' class is added to any element with the hide-on-keyboard-open class. 
        // However, it happens 400ms after the keyboard has been opened, so we force it to happen immediately below.
        // https://ionicframework.com/docs/api/page/keyboard/
        window.addEventListener('native.keyboardshow', function() {
            document.body.classList.add('keyboard-open');
        });
        window.addEventListener('native.keyboardhide', function() {
            document.body.classList.remove('keyboard-open');
        });

        $rootScope.hideTabs = true;

        // Clear the DO_NOT_REDIRECT flag
        $window.localStorage['DO_NOT_REDIRECT'] = "false";

        $scope.loginData = {};

        // If the user came directly from the login page, or their username was saved because the remember me checkbox was checked, get the username
        if ($window.localStorage['TEMP_USER_NAME'] != undefined && $window.localStorage['TEMP_USER_NAME'] != "undefined" && $window.localStorage['TEMP_USER_NAME'] != null && $window.localStorage['TEMP_USER_NAME'] != "null") {
            // Retrieve username from login page if it exists
            $scope.loginData.userid = $window.localStorage['TEMP_USER_NAME'];
        }
        else if ($window.localStorage['USER_NAME'] != undefined && $window.localStorage['USER_NAME'] != "undefined" && $window.localStorage['USER_NAME'] != null && $window.localStorage['USER_NAME'] != "null") {
            // Or retrieve username from remember me local storage if it exists
            $scope.loginData.userid = $window.localStorage['USER_NAME'];
        }
        else {
            // Otherwise go back to the login page
            $window.localStorage['DO_NOT_REDIRECT'] = "true";
            $state.go('tab.login', {}, { reload: true });
            return;
        }

        $scope.doLogin = function() {
            $ionicLoading.show({ template: SPINNER_ICON });
            var pushChannel = PushService.GetToken();
            var platform = null;
            if (window.cordova != undefined && window.cordova != null) {
                platform = cordova.platformId
            }

            console.log("pushChannel", pushChannel);
            console.log("platform", platform);

            UserControllerService.login($scope.loginData.userid, $scope.loginData.password, platform, pushChannel).then(function(response) {
                $ionicLoading.hide();
                $scope.isLoginService = true;
                $scope.SERVICENAME = 'doLogin-UserControllerService.login';

                SecureStorageService.setInfo('CaretrailLogin', $scope.loginData.password);

                $window.localStorage['DEVICE_SUPPORTED'] = $scope.deviceSupported;

                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                }

                $window.localStorage['TEMP_USER_NAME'] = null;

                if (window.StatusBar) {
                    StatusBar.styleDefault();
                    if (ionic.Platform.isAndroid()) {
                        StatusBar.backgroundColorByHexString('#bebebe');
                    }
                }

                LOGGED_IN_TIME = new Date();
                VALID_SESSION_DURATION = response.data.expiresIn;
                setUserProfileInROOT(response, $rootScope);
                $window.localStorage['USER__PROFILE'] = JSON.stringify($rootScope.userProfile);
                $rootScope.FIRSTCALL = true;
                $state.go('tab.timeline', { authToken: $scope.privateKey }, { reload: true });
                $rootScope.hideTabs = false;

                startTimer($rootScope, $state, $ionicPopup, $ionicHistory);
            });
        };

        $scope.backToLogin = function() {
            // Clear temp username, mark DO_NOT_REDIRECT so we aren't forced back to the password page immediatelly, go back to login
            $window.localStorage['TEMP_USER_NAME'] = null;
            $window.localStorage['DO_NOT_REDIRECT'] = "true";
            $state.go('tab.login', {}, { reload: true });
        }

        //=================================================//
        //                 Touch ID Login                  //
        //=================================================//

        $scope.showFingerprint = false;

        var loginValue = $scope.loginData.userid;

        $scope.successCallback = function(password) {
            var hasStoredPassword = (password != undefined && password != null && password != '');
            var isSupported = $window.localStorage['DEVICE_SUPPORTED'] != 'true' ? false : true;

            // Used to determine whether or not to show touch ID button
            $scope.showFingerprint = (loginValue && hasStoredPassword && isSupported) ? true : false;

            $ionicPlatform.ready(function() {
                if ($scope.showFingerprint) {
                    TouchIdService.authUsingTouchId(successCallback);
                }
            });
        }

        $scope.errorCallback = function(error) {
            console.log("PasswordCtrl GetInfo Password error", error);
        }

        var storedPassword = SecureStorageService.getInfo('CaretrailLogin', $scope.successCallback, $scope.errorCallback);

        // Function displays touch ID dialog
        $scope.fingerprintLogin = function() {
            TouchIdService.authUsingTouchId(successCallback);
        }

        function successCallback() {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

            var userid = $window.localStorage['USER_NAME'];
            var userPassword = '';
            SecureStorageService.getInfo('CaretrailLogin', storageSuccessCallback, storageErrorCallback);

            function storageSuccessCallback(password) {
                userPassword = password;

                var pushChannel = PushService.GetToken();
                var platform = null;
                if (window.cordova != undefined && window.cordova != null) {
                    platform = cordova.platformId
                }

                console.log("pushChannel", pushChannel);
                console.log("platform", platform);

                UserControllerService.login(userid, password, platform, pushChannel)
                    .then(loginSuccess)
                    .catch(loginError);
            }

            function storageErrorCallback(error) {
                console.log("TouchIdService GetInfo Password error", error);
            }

            function loginSuccess(response) {
                $ionicLoading.hide();
                $scope.isLoginService = true;
                $scope.SERVICENAME = 'doLogin-UserControllerService.login';

                SecureStorageService.setInfo('CaretrailLogin', userPassword);

                $window.localStorage['DEVICE_SUPPORTED'] = $scope.deviceSupported;

                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                }

                $window.localStorage['TEMP_USER_NAME'] = null;

                if (window.StatusBar) {
                    StatusBar.styleDefault();
                    if (ionic.Platform.isAndroid()) {
                        StatusBar.backgroundColorByHexString('#bebebe');
                    }
                }

                LOGGED_IN_TIME = new Date();
                VALID_SESSION_DURATION = response.data.expiresIn;
                setUserProfileInROOT(response, $rootScope);
                $window.localStorage['USER__PROFILE'] = JSON.stringify($rootScope.userProfile);
                $rootScope.FIRSTCALL = true;
                $state.go('tab.timeline', { authToken: $scope.privateKey }, { reload: true });
                $rootScope.hideTabs = false;

                startTimer($rootScope, $state, $ionicPopup, $ionicHistory);
            };

            function loginError(message) {
                console.log('TROUBLE LOGGING IN. ' + message);
            };
        }

        // function getCredentials() {
        //     showCredsPopup();
        //     console.log('GETTING CRENDENTIALS!!');
        // };

        // function alertDismissed() {
        //     console.log('Dismissing Alert!!');
        // }

        // function showCredsPopup() {
        //     navigator.notification.alert(
        //         'Authenticate using email and password and every subsequent 
        //         login you can authenticate using a fingerprint',
        //         alertDismissed,
        //         'Fingerprint Authentication Available',
        //         'OK'
        //     );
        // }

        if (window.StatusBar) {
            StatusBar.styleLightContent();
            if (ionic.Platform.isAndroid()) {
                StatusBar.backgroundColorByHexString('#367bb2');
            }
        }
    })
    .controller('TimeLineCtrl', function($rootScope, $scope, $stateParams, $state, $window, UserControllerService, MessageControllerService,
        $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup, $interval, $cordovaCamera, $ionicModal, $timeout, $ionicScrollDelegate) {
        reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state);
        handleMessagingPanel($scope, UserControllerService, MessageControllerService, $ionicPopup, $ionicPopover, $window, $cordovaCamera, $ionicModal, $rootScope, $state, $ionicLoading);


        $scope.selectedSubTabDiv = "selectedSubTabDiv";
        $rootScope.rootCheckPatient = false;
        $scope.noClass = "";

        $scope.timeline = {
            careTrailFilter: ''
        };

        $scope.onSwipeDown = function() {
            $scope.isSwipedDown = true;
        };

        setROOT_OBJECTS(UserControllerService, MessageControllerService, $scope, $rootScope, $ionicPopup, $state);

        $scope.showStatusIcon = 'true';

        $scope.selectedItemState = { selectedItemType: '', selectedItem: null };

        doRefresh($rootScope, $scope);
        setPaginationByUserTimeLineInScope($scope, UserControllerService, $ionicPopup, $rootScope, $ionicLoading, $timeout);

        setPaginationByUserTaskInScope($scope, UserControllerService, $ionicPopup, $rootScope, $ionicLoading);

        $scope.showTask = function() {
            $rootScope.notificationFor = null;
            $scope.selectedTab = "TIMELINE-MYTASK";
            $scope.selectedItemState.selectedItemType = 'task';
            $scope.isRefreshTask = false;
            $rootScope.selectedTab = $scope.selectedTab;
            handleTaskPanel($scope, UserControllerService, $ionicPopup, $ionicPopover, $window, $state, $ionicModal, $rootScope);
            $scope.showTab = function() {
                $rootScope.hideTabs = false;
            };
            $scope.userTaskPageNo = 0;
            setDefaults("TIMELINE", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup,
                UserControllerService, $window, $rootScope);

            $scope.isSwipedDown = false;

            $scope.timeline.careTrailFilter = '';
            $scope.paginateUserTask(false).then(function() {
                fixAvatar($scope, $timeout);
            });
        };

        $scope.showTimeLine = function() {
            $scope.selectedTab = "TIMELINE-HOME";
            $scope.selectedItemState.selectedItemType = 'timeline';
            $scope.isRefresh = false;
            $rootScope.selectedTab = $scope.selectedTab;
            handleChatBoxDisplayFields($scope);
            connectCareTrailWebSocket($rootScope, $interval);
            setPatientNavInScope($scope, $state, $window);
            $scope.userTimelinePageNo = 0;
            handleUserChatBox($scope, UserControllerService, $ionicPopup, $ionicPopover, $window, $cordovaCamera, $ionicModal, $rootScope, $ionicScrollDelegate);
            setDefaults("TIMELINE", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup,
                UserControllerService, $window, $rootScope);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.isSwipedDown = false;
            $scope.timeline.careTrailFilter = '';
            fixAvatar($scope, $timeout);
            $(function() {
                $scope.clamp = function() {
                    $timeout(function() {
                        $clamp($('.formatTextSpace')[0], { clamp: 2 });
                    }, 300);
                };
            });
            $scope.userTimelinePageNo = 0;
            $scope.paginateUserTimeline();
        };

        $scope.onTaskOpen = function(item) {
            $scope.markTaskAsRead(item);
        }

        $scope.onStatusToggleHandler = function(taskId, status) {
            $scope.updateTaskStatusSpecific(taskId, status);
        }

        $scope.cardOpenImage = function(image) {
            if (image != null) {
                $scope.showImage(image);
            }
        }

        $scope.cardButton1Callback = function(data) {
            if (data != null) {
                if (data.userId != $rootScope.userProfile.userid) {
                    $scope.showConversationDetails(data, 0)
                }
            }
        }

        $scope.cardButton2Callback = function(data) {
            if (data != null) {
                $window.localStorage['SELECTED_PATIENT'] = JSON.stringify(data);
                $state.transitionTo('tab.patientshome', { 'patientId': data.mrn }, { reload: true });
            }
        }

        if (($rootScope.notificationFor != undefined && $rootScope.notificationFor != null && $rootScope.notificationFor == "TASK")
            || ($stateParams.tabName != undefined && $stateParams.tabName != null && $stateParams.tabName == "TASK")) {
            $scope.showTask();
        }
        else {
            $scope.showTimeLine();
        }

        $scope.updateTaskStatusSpecific = function(taskId, status) {
            var taskInfo = {
                "taskId": taskId,
                "taskStatus": [{
                    "status": status
                }]
            };
            UserControllerService.updateTaskStatus(taskInfo).then(function(response) {
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
                var holdAoTask = [];

                UserControllerService.getTaskById(taskId).then(function(response) {
                    for (var i = 0; i < $scope.aoTask.length; i++) {
                        if ($scope.aoTask[i].taskId != taskId)
                            holdAoTask[i] = $scope.aoTask[i];
                        else {
                            holdAoTask[i] = response.data;
                            holdAoTask[i].created_by = getMemberByEmailIdROOT(holdAoTask[i].created_by, $rootScope);
                        }
                    }

                    if (holdAoTask.length == $scope.aoTask.length) {
                        $scope.aoTask = holdAoTask;
                    }
                });

            });
        }

        initCARETRAILListener($scope, $rootScope, UserControllerService, MessageControllerService, $window, $interval, $ionicPopup);
        if ($rootScope.FIRSTCALL || $rootScope.FIRSTCALL == undefined) $rootScope.FIRSTCALL = false;

        $scope.$on('scroll.refreshComplete', function() {
            $scope.isSwipedDown = true;
        });
    })
    .controller('CreateTaskCtrl', function($rootScope, $scope, $stateParams, $window, $state, UserControllerService, $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup, $cordovaCamera, $ionicModal) {

        $scope.task = {
            patientSearch: '',
            memberSearch: '',
            prioritySearch: false,
            taskDesc: ''
        };

        setBack($scope, $ionicHistory);
        handleCreateTask($scope, UserControllerService, $ionicPopup, $window, $cordovaCamera, $state, $rootScope, $ionicLoading, $ionicModal);
    })
    .controller('ProfileCtrl', function($rootScope, $scope, $stateParams, $state, $window, UserControllerService, MessageControllerService,
        $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup, $interval, $cordovaCamera, $ionicModal, $timeout, $ionicScrollDelegate) {
        reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state);

        doRefresh($rootScope, $scope);

        setDefaults("PROFILE", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup, UserControllerService, $window, $rootScope);
    });
