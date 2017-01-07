
function setROOT_OBJECTS(UserControllerService, MessageControllerService, $scope, $rootScope, $ionicPopup, $state) {
    if ($rootScope.FIRSTCALL != undefined && !$rootScope.FIRSTCALL) {
        return;
    }
    setAppStatus($rootScope, true);
    $rootScope.SESSION_VALID_IN = true;
    setTabNavigation($rootScope, $state);
    setNoOfUnReadTaskInRootScope($scope, UserControllerService, $rootScope);
    setUserTeamMembersROOT(UserControllerService, $scope, $rootScope, $ionicPopup);
    setUserPatientROOT(UserControllerService, $scope, $rootScope, $ionicPopup);
    setNoOfUnReadMessageInRootScope($scope, MessageControllerService, $rootScope);
}

function setUserTeamMembersROOT(UserControllerService, $scope, $rootScope, $ionicPopup) {
    UserControllerService.getAllTeamMembersOfUserTeam($rootScope.userProfile.emailAddress[0]).then(function(response) {
        if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
        $rootScope.rootAoUserTeamMembers = response.data;
        $scope.aoMember = $rootScope.rootAoUserTeamMembers;

        if ($scope.aoMember != undefined && $scope.aoMember != null) {
            for (var i = 0; i < $scope.aoMember.length; i++) {
                if (!$rootScope.SESSION_VALID_IN) return;
                if ($scope.aoMember[i].userid == $rootScope.userProfile.userid) {
                    $scope.aoMember.splice(i, 1);
                    break;
                }
            }
        }
    });
}

function setUserPatientROOT(UserControllerService, $scope, $rootScope, $ionicPopup) {

    UserControllerService.patientList($rootScope.userProfile.emailAddress[0]).then(function(response) {
        if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
        $rootScope.rootAoPatient = response.data;
        $rootScope.USER_PATIENT_MRN_ARRAY = getPatientNameArray($rootScope.rootAoPatient);
    });
}

function setNoOfUnReadTaskInRootScope($scope, UserControllerService, $rootScope) {
    UserControllerService.getNoOfUnReadTask($rootScope.userProfile.userid).then(function(response) {
        var noOfTask = response.data;
        $rootScope.taskUnRead = noOfTask;
    });
}

function setNoOfUnReadMessageInRootScope($scope, MessageControllerService, $rootScope) {
    MessageControllerService.getNoOfUnReadMessage($rootScope.userProfile.userid).then(function(response) {
        if (response.data != undefined && response.data != null && response.data != "")
            $rootScope.messageUnRead = response.data;
    });
}

function addPatientToROOT($rootScope, patient) {
    if ($rootScope.rootAoPatient == undefined || $rootScope.rootAoPatient == null)
        $rootScope.rootAoPatient = [];
    $rootScope.rootAoPatient[$rootScope.rootAoPatient.length] = patient;
    $rootScope.USER_PATIENT_MRN_ARRAY = getPatientNameArray($rootScope.rootAoPatient);
}

function removePatientFrmROOT($rootScope, patient) {
    $rootScope.rootAoPatient = removePatientById($rootScope.rootAoPatient, patient.patientid);
    $rootScope.USER_PATIENT_MRN_ARRAY = getPatientNameArray($rootScope.rootAoPatient);
}


function setUserProfileInROOT(response, $rootScope) {

    if (response == null || response.data == null || response.data == undefined || response.data.userDetails == undefined) {
        $rootScope.userProfile = null;
        return;
    }

    var isExternal = false;
    if (response.data.userDetails.roles != undefined && response.data.userDetails.roles != null && response.data.userDetails.roles.length > 0) {
        if (response.data.userDetails.roles[0].userRole == "ROLE_EXTERNAL_USER") {
            isExternal = true;
        }
    }

    $rootScope.userProfile = {
        "userid": response.data.userDetails.userid,
        "userName": response.data.userDetails.userName,
        "username": response.data.userDetails.userName, // Unfortunate fix due to some cases expecting lowercase n, we should consolidate
        "lastName": response.data.userDetails.lastName,
        "status": response.data.userDetails.status,
        "jobTitle": response.data.userDetails.jobTitle,
        "emailAddress": response.data.userDetails.emailAddress,
        "useravitar": response.data.userDetails.base64Image,
        "phoneNumber": response.data.userDetails.phoneNumber,
        "accessToken": response.data.accessToken,
        "tokenExpirationTime": response.data.tokenExpirationTime,
        "isExternal": isExternal
    }

    markCleanPhoneNumber($rootScope.userProfile);
}

function getMemberByEmailIdROOT(emailAddress, $rootScope) {
    if (emailAddress != null) {
        var caseEmailAddress = emailAddress.toUpperCase();
        if ($rootScope.rootAoUserTeamMembers == null || $rootScope.rootAoUserTeamMembers.length == 0) return;
        for (var i = 0; i < $rootScope.rootAoUserTeamMembers.length; i++) {
            if ($rootScope.rootAoUserTeamMembers[i].emailAddress.toUpperCase() == caseEmailAddress) {
                return $rootScope.rootAoUserTeamMembers[i];
            }
        }
        if ($rootScope.userProfile.emailAddress[0].toUpperCase() == caseEmailAddress) {
            return $rootScope.userProfile;
        }
    }
    return null;
}

function setStyleByTaskStatus($rootScope) {
    $rootScope.ROOT_TASK_STYLE = function(pTaskStatus) {
        if (pTaskStatus == "NOT_INITIATED") return "ion-android-radio-button-off";
        else if (pTaskStatus == "INITIATED") return "ion-contrast";
        else if (pTaskStatus == "COMPLETED") return "ion-record";
        else "";
    }
}

function getUserImage($rootScope, emailAddress) {
    var caseEmailAddress = emailAddress.toUpperCase();
    if ($rootScope.userProfile != undefined && $rootScope.userProfile != null
        && $rootScope.userProfile.emailAddress[0].toUpperCase() == caseEmailAddress) {
        return $rootScope.userProfile.useravitar;
    }
    if ($rootScope.rootAoUserTeamMembers != null) {
        for (var i = 0; i < $rootScope.rootAoUserTeamMembers.length; i++) {
            if ($rootScope.rootAoUserTeamMembers[i].emailAddress.toUpperCase() == caseEmailAddress) {
                return $rootScope.rootAoUserTeamMembers[i].useravitar;
            }
        }
    }
    return null;
}

function getUserImageByUserId($rootScope, userId) {
    if ($rootScope.userProfile != undefined && $rootScope.userProfile != null
        && $rootScope.userProfile.userid == userId) {
        return $rootScope.userProfile.useravitar;
    }
    for (var i = 0; $rootScope.rootAoUserTeamMembers != undefined && i < $rootScope.rootAoUserTeamMembers.length; i++) {
        if ($rootScope.rootAoUserTeamMembers[i].userid == userId) {
            return $rootScope.rootAoUserTeamMembers[i].useravitar;
        }
    }
    return null;
}

function getUserByUserId($rootScope, userId) {
    if ($rootScope.userProfile != undefined && $rootScope.userProfile != null
        && $rootScope.userProfile.userid == userId) {
        return $rootScope.userProfile;
    }
    for (var i = 0; $rootScope.rootAoUserTeamMembers != undefined && i < $rootScope.rootAoUserTeamMembers.length; i++) {
        if ($rootScope.rootAoUserTeamMembers[i].userid == userId) {
            return $rootScope.rootAoUserTeamMembers[i];
        }
    }
    return null;
}



function getUserInfo($rootScope, $window) {
    if ($rootScope != null && $rootScope.userProfile != undefined && $rootScope.userProfile != null)
        return $rootScope.userProfile;
    return JSON.parse($window.localStorage['USER__PROFILE']);
}

function reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state) {
    if ($rootScope.userProfile == undefined)
        $rootScope.userProfile = JSON.parse($window.localStorage['USER__PROFILE']);
    if ($rootScope.tabNavUrl == undefined)
        setTabNavigation($rootScope, $state);
    if ($rootScope.rootAoUserTeamMembers == undefined)
        setUserTeamMembersROOT(UserControllerService, $scope, $rootScope, $ionicPopup);
    if ($rootScope.rootAoPatient == undefined)
        setUserPatientROOT(UserControllerService, $scope, $rootScope, $ionicPopup);
    if ($rootScope.taskUnRead == undefined)
        setNoOfUnReadTaskInRootScope($scope, UserControllerService, $rootScope);
    $rootScope.selectedTab = null;
    $rootScope.aoOneToOneConv = null;
    $rootScope.aoConversation = null;
    $rootScope.patient = null;
    $rootScope.patientTimeline = null;
    $rootScope.homeTimeline = null;
    $rootScope.firstPageBack = false;
}

function getRootSelectedTab($rootScope) {
    if ($rootScope.selectedTab != undefined && $rootScope.selectedTab != null) return $rootScope.selectedTab;
    return "";
}

function setTabNavigation($rootScope, $state) {
    $rootScope.tabNavUrl = function(tabName) {
        switch (tabName) {
            case "Chat": {
                $state.transitionTo('tab.tabmessages', {}, { reload: true });
                break;
            }
            case "Patients": {
                $state.transitionTo('tab.tabpatients', {}, { reload: true });
                break;
            }
            case "Teams": {
                $state.transitionTo('tab.tabteams', {}, { reload: true });
                break;
            }
            case "Profile": {
                $state.transitionTo('tab.profile', {}, { reload: true });
                break;
            }
            case "Home":
            default: {
                $state.transitionTo('tab.timeline', {}, { reload: true });
            }
        }
    }
}

function clearRootScope($rootScope) {
    if (promiseWebSocket) {
        $rootScope.stopWebSocketInterval();
    }
    $rootScope.userProfile = undefined;
    $rootScope.tabNavUrl = undefined;
    $rootScope.rootAoUserTeamMembers = undefined;
    $rootScope.rootAoPatient = undefined;
    $rootScope.taskUnRead = undefined;
    $rootScope.messageUnRead = undefined;
    $rootScope.oneToOneMember = undefined;
    $rootScope.selectedTab = undefined;
    $rootScope.aoOneToOneConv = undefined;
    $rootScope.aoConversation = undefined;
    $rootScope.ISACTIVE = undefined;
    $rootScope.SESSION_VALID_IN = undefined;
    $rootScope.logout = undefined;
    $rootScope.logoutPrompt = undefined;
    $rootScope.showPopup = undefined;
    $rootScope.errMsgActive = undefined;
    $rootScope.patient = undefined;
    $rootScope.patientTimeline = undefined;
    $rootScope.homeTimeline = undefined;
    $rootScope.firstPageBack = undefined;
    $rootScope.SOCKET_OPEN = undefined;
    $rootScope.goBackToLoginPopUp = undefined;
    $rootScope.goBackToLoginInactivePopUp = undefined;
}

function setMemberForOneToOneConv(member, $rootScope, $window) {
    $rootScope.oneToOneMember = member;
    $window.localStorage['ONE_TO_ONE_MEMBER'] = JSON.stringify(member);
    return $rootScope.oneToOneMember;
}

function filterUserByName(UserControllerService, $rootScope, $scope) {

    $scope.clearSearch = function() {
        $scope.clearChatUserName = null;
        $scope.messages.searchUser = '';
        $scope.resultAoMember = null;
        $scope.selectedTab = "MESSAGE-MYMESSAGE";
    };

    $scope.filterUserByName = function() {
        $scope.resultAoMember = null;
        var userName = $scope.messages.searchUser;
        if (userName == "") {
            $scope.clearSearch();
            return;
        }
        if (userName != "") {
            $scope.clearChatUserName = true;
        }
        $scope.selectedTab = "MESSAGE-SEARCH";
        userName = userName.toLowerCase();

        UserControllerService.searchUserByName(userName)
            .then(function searchUserByNameSuccess(usersResults) {
                $scope.resultAoMember = [];
                if (usersResults == undefined) {
                    return null;
                }

                for (var i = 0, j = 0; i < usersResults.length; i++) {
                    if (usersResults[i].username.toLowerCase().indexOf(userName) != -1) {
                        $scope.resultAoMember[j] = usersResults[i];
                        j++;
                    }
                }

                markCleanPhoneNumbers($scope.resultAoMember);
            })
            .catch(function searchUserByNameFailure(errorMessage) {
                console.log(errorMessage);
            });
    };
}

function setAppStatus($rootScope, isActive) {
    $rootScope.ISACTIVE = isActive;
}

function getAppStatus($rootScope) {
    return $rootScope.ISACTIVE;
}

function isPatientExistInRoot($rootScope, newPatient) {
    if ($rootScope.rootAoPatient != null) {
        for (var i = 0; i < $rootScope.rootAoPatient.length; i++) {
            if ($rootScope.rootAoPatient[i].mrn == newPatient.mrn) return i;
        }
    }
    return -1;
}

function addPatientToRoot($rootScope, newPatient) {
    if (isPatientExistInRoot($rootScope, newPatient) == -1) {
        $rootScope.rootAoPatient[$rootScope.rootAoPatient.length] = newPatient;
    }
}

function removePatientFromRoot($rootScope, newPatient) {
    var patientIndex = isPatientExistInRoot($rootScope, newPatient);
    if (patientIndex != -1) {
        $rootScope.rootAoPatient.splice(patientIndex, 1);
    }
}

function setSessionValidIn($rootScope, response) {
    //if(response.status != 400) return;
    if (isInValidSessionError(response, null)) {
        $rootScope.SESSION_VALID_IN = false;
    }


}

function isInValidSessionError(response, $scope) {
    if (response.data != null
        && response.data.message != undefined
        && response.data.message != null
        && response.data.message.indexOf("Please login again") != -1
        && ($scope == null || $scope.isLoginService == null || !$scope.isLoginService)) {
        return true;
    }
    return false;
}

function pauseHandler($rootScope) {

    setAppStatus($rootScope, false);
    socket = null;
    //socketMessage = null; THIS IS IS REQUIRED FOR IOS
    if ($rootScope.showPopup != undefined && $rootScope.showPopup != null && $rootScope.SESSION_VALID_IN) {
        $rootScope.showPopup.close();
    }
    if ($rootScope.popover != undefined && $rootScope.popover != null) {
        $rootScope.popover.hide();
    }
    if ($rootScope.modal != undefined && $rootScope.modal != null) {
        $rootScope.modal.hide();
        $rootScope.modal.remove();
    }

}

function resumeHandler($rootScope, $state, $ionicHistory) {

    var curTime = new Date();
    if (LOGGED_IN_TIME) {
        setAppStatus($rootScope, true);
    }
}

function goBackHandler($rootScope, $ionicPopup, $ionicPlatform, $ionicHistory, $window, $state) {

    $ionicPlatform.registerBackButtonAction(function(event) {
        var homeTabs = [
            "tab.timeline",
            "tab.tabpatients",
            "tab.tabteams",
            "tab.tabmessages",
            "tab.profile"
        ];

        // Close any modal popups first
        if ($rootScope.modal != undefined && $rootScope.modal != null && $rootScope.modal.isShown()) {
            $rootScope.modal.hide();
            $rootScope.modal.remove();
        }
        // Close any open cards
        else if (popupFlipped) {
            $(".ctcard-back-close").trigger("click");
        }
        // If on home page, ask if they want to logout
        else if (homeTabs.indexOf($ionicHistory.currentStateName()) >= 0) {
            event.preventDefault();
            if ($rootScope.firstPageBack == undefined || !$rootScope.firstPageBack) {
                goBackToLogin($rootScope, $ionicPopup, $ionicHistory);
            }
        }
        // If on the password page, make sure it doesn't redirect back to itself and then go back to the login page
        else if ($ionicHistory.currentStateName() == "tab.password") {
            $window.localStorage['TEMP_USER_NAME'] = null;
            $window.localStorage['DO_NOT_REDIRECT'] = "true";
            $ionicHistory.goBack(-1);
        }
        // If on the login page, close the app
        else if ($ionicHistory.currentStateName() == "tab.login") {
            ionic.Platform.exitApp();
        }
        // Otherwise, go back a page
        else {
            $ionicHistory.goBack(-1);
        }
    }, 900);

}

function goBackToLogin($rootScope, $ionicPopup, $ionicHistory) {
    $rootScope.showPopup = function() {
        $rootScope.firstPageBack = true;

        function logoutConfirmed(buttonIndex) {
            $rootScope.firstPageBack = false;
            if (buttonIndex == 1) {
                $rootScope.logout();
            }
        }

        if (navigator.notification != undefined) {
            navigator.notification.confirm(
                'You are about to be logged out of Caretrail. Please press Logout to logout or Cancel to return to the app.', // message
                logoutConfirmed,
                'Logout?',
                ['Logout', 'Cancel']
            );
        }
    }
    $rootScope.showPopup();
}

function goBackToLoginInactive($rootScope, $ionicPopup, $ionicHistory) {
    if ($rootScope.goBackToLoginPopUp == undefined) {
        $rootScope.firstPageBack = true;
        if (navigator.notification) {
            var onTapOK = function() {
                $rootScope.firstPageBack = false;
                if ($rootScope.logout() != undefined) {
                    $rootScope.logout();
                }
            }
            navigator.notification.alert(
                'For your security, your session has timed out due to inactivity.',
                onTapOK,
                'Inactivity Timeout',
                'OK'
            );
        }
        else {
            $rootScope.careTrailPopup = "GO-BACK-LOGIN-PAGE-INACTIVE";
            $rootScope.goBackToLoginInactivePopUp = $ionicPopup.show({
                templateUrl: 'templates/common/popup-caretrail.html',
                cssClass: 'unfollowPatientPopup',
                scope: $rootScope,
                buttons: [
                    {
                        text: 'Ok',
                        onTap: function() {
                            $rootScope.firstPageBack = false;
                            if ($rootScope.logout() != undefined) {
                                $rootScope.logout();
                            }
                        }
                    }
                ]
            });
        }
    }
}

var timeoutID = null;

function startTimer($rootScope, $state, $ionicPopup, $ionicHistory) {
    if (timeoutID) {
        window.clearTimeout(timeoutID);
    }
    timeoutID = window.setTimeout(function() {
        goInactive($rootScope, $state, $ionicPopup, $ionicHistory)
    }, 300000);
}

function resetTimer($rootScope, $state, $ionicPopup, $ionicHistory) {
    if (timeoutID != null) {
        window.clearTimeout(timeoutID);
        goActive($rootScope, $state, $ionicPopup, $ionicHistory);
    }
}

function goInactive($rootScope, $state, $ionicPopup, $ionicHistory) {
    console.log('App is inactive for 5 minutes');
    if (timeoutID) {
        timeoutID = null;
        goBackToLoginInactive($rootScope, $ionicPopup, $ionicHistory);
    }
}

function goActive($rootScope, $state, $ionicPopup, $ionicHistory) {
    // do something
    startTimer($rootScope, $state, $ionicPopup, $ionicHistory);
}


