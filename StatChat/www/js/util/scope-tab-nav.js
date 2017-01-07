function setLogout($scope, $ionicLoading, $ionicHistory, $state, $window, UserControllerService, $rootScope, $ionicPopup) {
    $scope.onHoldLogout = function () {
        if (window.plugins && window.plugins.toast) {
            window.plugins.toast.showWithOptions(
                {
                    message: "Logout",
                    duration: "short",
                    position: "bottom",
                    addPixelsY: -40
                }
            );
        }
    }

    if ($rootScope.logout) {
        return;
    }
    $rootScope.logout = function () {
        $ionicLoading.show({ template: SPINNER_ICON });

        var userId = $window.localStorage['USER_NAME'] || null;
        var userProfile = $window.localStorage['USER__PROFILE'] || null;

        stopListener($window);
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        disconnectCareTrailWebSocket();
        clearRootScope($rootScope);
        LOGGED_IN_TIME = null;
        VALID_SESSION_DURATION = null;
        window.clearTimeout(timeoutID);
        timeoutID = null;
        UserControllerService.logOut(userProfile).then(function () {
            $window.localStorage.clear();
            $window.localStorage['USER_NAME'] = userId;
            $window.localStorage['DEVICE_SUPPORTED'] = $scope.deviceSupported;
            $state.transitionTo('tab.login', {}, { reload: true });
        }).finally($ionicLoading.hide);
    };

    if ($rootScope.logoutPrompt) {
        return;
    }
    $rootScope.logoutPrompt = function () {
        if (navigator.notification) {
            var onConfirm = function (buttonIndex) {
                if (buttonIndex == 1) {
                    $rootScope.logout();
                }
            }
            navigator.notification.confirm(
                'You are about to be logged out of Caretrail. Press Logout to continue or Cancel to return to the app.',
                onConfirm,
                'Logout Now?',
                ['Logout', 'Cancel']
            );
        }
        else {
            $rootScope.careTrailPopup = "LOGOUT";
            var confirmPopup = $ionicPopup.confirm({
                templateUrl: 'templates/common/popup-caretrail.html',
                scope: $rootScope,
                title: 'Logout Now?',
                okText: 'Logout',
                cancelText: 'Cancel'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $rootScope.logout();
                }
            });
        }
    }
}

function setPatientNavInScope($scope, $state, $window) {
    $scope.showPatientHomePage = function (patient) {
        $window.localStorage['SELECTED_PATIENT'] = JSON.stringify(patient);
        $state.transitionTo('tab.patientshome', { 'patientId': patient.mrn }, { reload: true });
    }
}

function setTeamNavInScope($scope, $state, $window) {

    $scope.showTeamHomePage = function (team) {
        $window.localStorage['SELECTED_TEAM'] = JSON.stringify(team);
        $state.transitionTo('tab.teamshome', { 'teamName': team.teamName }, { reload: true });
    }
}

function setDefaults(tabName, $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup,
    UserControllerService, $window, $rootScope) {

    setLogout($scope, $ionicLoading, $ionicHistory, $state, $window, UserControllerService, $rootScope, $ionicPopup);
    setStatusPopup($scope, $ionicPopup, UserControllerService, $window, $rootScope);
    setBack($scope, $ionicHistory);
    $scope.onSwipeDown = function () {
        $scope.isSwipedDown = true;
        $('#TimelineList > div').css('bottom', '0');
    }

    $scope.onSwipeUp = function () {
        $scope.isSwipedDown = false;
        $('#TimelineList > div').css('bottom', '50px');
    }
}

function setStatusPopup($scope, $ionicPopup, UserControllerService, $window, $rootScope) {
    if ($rootScope.userProfile != undefined &&
        $rootScope.userProfile.status != undefined) setUserStatusIcon($rootScope, $rootScope.userProfile.status);
    else return;

    $scope.showStatusPopup = function () {
        var confirmPopup = $ionicPopup.prompt({
            title: 'Change Status',
            cssClass: 'timelinepopup',
            scope: $scope,
            templateUrl: 'templates/user/popup-status.html',
            buttons: [{
                text: 'Ok', type: 'button button-default ',
                onTap: function (e) {
                    var statusMsg = document.getElementById('statusMsg').value;
                    var statusJson = {
                        "availability": statusMsg,   //"DoNotDisturb",//statusMsg,
                        "message": statusMsg//"some message given here by user"  
                    }

                    setUserStatusIcon($rootScope, statusJson.message);
                    $rootScope.userProfile.statusMsg = statusMsg;
                    $window.localStorage['USER__PROFILE'] = JSON.stringify($rootScope.userProfile);

                    UserControllerService.changeStatus(addUserInfoToService($rootScope.userProfile, statusJson))
                        .then(function (response) {
                            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
                        });
                }
            }, { text: 'Cancel', type: 'button-positive' }]
        });
    };
}

function setUserStatusIcon($rootScope, userStatus) {
    $rootScope.userProfile.iconstatus = 'redicon';
    if (userStatus == 'Online') {
        $rootScope.userProfile.iconstatus = 'onlineicon';
        $rootScope.userProfile.status = 'Online'
    } else if (userStatus == 'DoNotDisturb') {
        $rootScope.userProfile.iconstatus = 'ion-minus-circled redicon';
        $rootScope.userProfile.status = 'DoNotDisturb'
    } else if (userStatus == 'BeRightBack') {
        $rootScope.userProfile.iconstatus = 'berightbackicon';
        $rootScope.userProfile.status = 'BeRightBack'
    } else if (userStatus == 'Away') {
        $rootScope.userProfile.iconstatus = 'awayicon';
        $rootScope.userProfile.status = 'Away';
    }

}

function splitString(splitStr, splitBy) {
    if (splitStr == null || splitStr.trim() == "") return splitStr;
    if (splitStr.indexOf("invalid_grant") != -1) return "Invalid Credentials.";
    var splitStrArr = splitStr.split(splitBy);
    if (splitStrArr.length > 1) return splitStrArr[1];
    else return splitStrArr[0];

}
function showErrowMsg(response, $scope, $ionicPopup, errMsg, $rootScope, $ionicLoading) {
    var systemErrFlag = false;

    if (response.data != null && response.data.message != undefined) {
        errMsg = splitString(response.data.message, ":");
        systemErrFlag = true;
    }
    if (!systemErrFlag
        && ($scope.isLoginService == null || !$scope.isLoginService)
        && ($rootScope.ISACTIVE == undefined || !$rootScope.ISACTIVE)
        && ($rootScope.SESSION_VALID_IN == undefined || !$rootScope.SESSION_VALID_IN)) {
        if (response.status == 0 || response.status == 500 || response.status == 504) {
            return true; // TERMINATE WITHOUT MESSAGE
        }

    }
    if (!systemErrFlag) {
        if (response.status == 0)
            errMsg = "CareTrail is currently down.";
        else if (response.status == 500)
            errMsg = "We are currently experiencing problems."; // Internal Server Error.
        else if (response.status == 504)
            errMsg = "Unable to connect to the CareTrail servers."; // Internal Server Error.

        if (errMsg != null)
            errMsg += " Please try again later.";
    }

    if (errMsg == null) {
        return false;
    }
    if ($rootScope.errMsgActive != undefined && $rootScope.errMsgActive != null && $rootScope.errMsgActive) {
        return false;
    }

    setSessionValidIn($rootScope, response);
    $rootScope.errMsgActive = true;
    if (navigator.notification) {
        var onTapOK = function () {
            $rootScope.errMsgActive = false;
            if (isInValidSessionError(response, $scope)) {
                $scope.logout();
            }
        }
        navigator.notification.alert(
            errMsg,
            onTapOK,
            'Error',
            'OK'
        );
    }
    else {
        $scope.errMsg = errMsg;
        $rootScope.showPopup = $ionicPopup.alert({
            cssClass: 'error-popup',
            templateUrl: 'templates/common/popup-error.html',
            title: 'Error',
            scope: $scope,
            buttons: [
                {
                    text: 'OK',
                    onTap: function (e) {
                        $rootScope.errMsgActive = false;
                        if (isInValidSessionError(response, $scope)) {
                            $scope.logout();
                        }
                    }
                }]
        });
    }

    return true;
}

function filterAddPatientJSON(allAddPatientObject, userProfile) {

    var patientInfo = {
        username: userProfile.username,
        lastName: userProfile.lastName,
        emailAddress: userProfile.emailAddress[0],
        patient: [{
            firstName: allAddPatientObject.firstName,
            lastName: allAddPatientObject.lastName,
            dob: (allAddPatientObject.dobMonth == undefined
                || allAddPatientObject.dobDay == undefined
                || allAddPatientObject.dobYear == undefined
            ) ? '' : allAddPatientObject.dobMonth + '/' + allAddPatientObject.dobDay + '/' + allAddPatientObject.dobYear,
            location: allAddPatientObject.location,
            mrn: allAddPatientObject.mrn,
            sex: allAddPatientObject.sex,
            primarydx: allAddPatientObject.primarydx
        }]

    }
    return patientInfo;
}

function filterAddTeamMemberJSON(allAddTeamMemberObject, team, userProfile) {
    var teamMemberInfo = {
        "username": allAddTeamMemberObject.selected.username,
        "lastName": allAddTeamMemberObject.selected.lastName,
        "emailAddress": allAddTeamMemberObject.selected.emailAddress,
        "team": [{
            "teamName": team.teamName,
        }]
    }

    return teamMemberInfo;
}

function filterAddTeamJSON(allAddTeamObject, userProfile) {

    var teamInfo = {
        teamName: allAddTeamObject.fullName,
        location: allAddTeamObject.location,
        user: [
            {
                userid: userProfile.userid
            }
        ]
    }
    return teamInfo;
}


function addUserInfoToService(userProfile, infoObj) {
    infoObj.userid = userProfile.emailAddress[0];
    return infoObj;
}



