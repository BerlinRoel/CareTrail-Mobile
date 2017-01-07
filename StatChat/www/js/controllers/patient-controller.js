angular.module('statchat.patient-controller', ['ngResource', 'ionic', 'ngCordova'])
    .constant('ApiEndpoint', {
    })
    //TODO create global variable for 'SELECTED_PATIENT' constant that all controllers can use
    //Custom filter to search allUsers for user
    //TODO add this function to it's own file
    .filter('searchUserByNameFilter', function() {
        return function(someArray, searchTerm) {
            var myCollection = [];
            var matchSearchTerm = new RegExp(searchTerm, 'i');
            for (var i = 0; i < someArray.length; i++) {
                var arrayItem = someArray[i];
                if (matchSearchTerm.test(arrayItem.username.substring(0, 3))) {
                    myCollection.push(arrayItem);
                }
            }
            return myCollection;
        };
    })

    .controller('PatientCtrl', function($filter, $rootScope, $scope, $stateParams, $state, $window, UserControllerService, PatientControllerService, $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup, $timeout, $log, $q) {
        reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state);

        var ptn = this;
        ptn.searchForUser = '';
        ptn.userCollection = null;
        ptn.searchingInProgress = false;
        ptn.currentPatient = '';
        ptn.goToInviteUserForm = '';
        ptn.newUser = {};
        ptn.submitFollower = '';
        ptn.followPatient = '';
        ptn.successFollowPopup = '';
        ptn.popupFollowerName = '';
        ptn.popupPatientName = '';
        ptn.submittingInvite = false;

        $scope.isPatientListSwipedDown = false;
        $scope.redirectToPatient = false;
        $rootScope.rootCheckPatient = false;
        $rootScope.goToShowFollowers = false;

        $scope.selectedTab = "PATIENT-CURRENT";
        $scope.selectedSubTabDiv = "selectedSubTabDiv";
        $scope.noClass = "";
        $scope.isLoading = false;
        $scope.patientInfo = {
            patientSearch: '',
            isSearching: false
        };

        $scope.selectedItemState = { selectedItem: null };

        $scope.isPatientListLoaded = false;

        followRUnFollowPatient($scope, UserControllerService, PatientControllerService, $state, $ionicPopup, $ionicLoading, $rootScope, $timeout);

        $scope.showPatientList = function() {
            $scope.selectedTab = "PATIENT-CURRENT";

            if (!$scope.isPatientListLoaded) {
                $scope.isLoading = true;
                $scope.isPatientListLoaded = true;
            }

            UserControllerService.patientList($rootScope.userProfile.emailAddress[0]).then(function(response) {
                if ($scope.selectedTab == "PATIENT-CURRENT") {
                    $scope.isLoading = false;
                }
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                }
                $scope.aoPatient = response.data;
                $scope.aoPatient = markMyPatient($scope.aoPatient, response.data);
            });
            $scope.$on('scroll.refreshComplete', function() {
                $scope.showPatientSearch = true;
            });
            $scope.showPatientSearch = false;
        };
        $scope.showPatientList();
        doRefresh($rootScope, $scope);

        $scope.onHoldAddPatient = function() {
            if (window.plugins && window.plugins.toast) {
                window.plugins.toast.showWithOptions(
                    {
                        message: "Add New Patient",
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -40
                    }
                );
            }
        }

        $scope.goToAddPatient = function() {
            $state.transitionTo('tab.add_patient');
        }

        $scope.cardButton1Callback = function(data) {
            if (data.isMyPatient) {
                $scope.unFollowPatientPopup(data, $rootScope.userProfile);
            }
            else {
                $scope.followPatientPopup(data);
            }
        }

        $scope.cardButton2Callback = function(data) {
            if (data != null) {
                $window.localStorage['SELECTED_PATIENT'] = JSON.stringify(data);
                $state.transitionTo('tab.patientshome', { 'patientId': data.mrn }, { reload: true });
            }
        }

        $scope.successPopup = function(followPatientName) {
            if (navigator.notification) {
                navigator.notification.alert(
                    'You are now following ' + followPatientName + '.',
                    null,
                    'Follow Successful',
                    'OK'
                );
            }
            else {
                $scope.careTrailPopup = "FOLLOW-PATIENT-SUCCESSFUL";
                $scope.patientName = followPatientName;
                $rootScope.showPopup = $ionicPopup.alert({
                    templateUrl: 'templates/common/popup-caretrail.html',
                    cssClass: 'success-popup',
                    scope: $scope,
                    buttons: [
                        { text: 'OK' }
                    ]
                });
            }
        };

        $scope.showPatientListSearch = function($event) {
            $scope.isPatientListLoaded = false;
            $scope.selectedTab = "PATIENT-SEARCH";
            searchAllPatientByName($scope, UserControllerService, $rootScope.userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout, $state);
            clearSearch($scope);
            $scope.patientInfo.patientSearch = '';
            $scope.showPatientSearch = true;
        };

        setDefaults("PATIENTS", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup, UserControllerService, $window, $rootScope);
        $scope.onSwipeDown = function() {
            $scope.isPatientListSwipedDown = true;
        };

        setPatientNavInScope($scope, $state, $window);

        $scope.clearSearchField = function() {
            $scope.patientInfo.patientSearch = '';
            if ($scope.selectedTab === 'PATIENT-SEARCH') {
                searchAllPatientByName($scope, UserControllerService, $rootScope.userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout, $state);
            }
        };

        //******* MOVE ALL CODE ASSOCIATED WITH USER || USERS TO USER CONTROLLER *******//
        //search for user to add to patient followers
        ptn.searchForUser = function(searchTerm) {
            if (searchTerm == null || searchTerm == '') {
                return;
            }
            ptn.userCollection = null;
            ptn.searchingInProgress = true;

            UserControllerService.searchUserByName(searchTerm)
                .then(function searchUserByNameSuccess(usersResults) {
                    ptn.userCollection = usersResults.sort(CompareForSort);
                    ptn.searchingInProgress = false;
                    return ptn.userCollection;
                })
                .catch(function searchUserByNameFailure(errorMessage) {
                    ptn.searchingInProgress = false;
                    console.log(errorMessage);
                });
        }

        function CompareForSort(first, second) {
            var userA = first.username.toLowerCase();
            var userB = second.username.toLowerCase();

            if (userA.lastName != null) {
                userA = userA + " " + first.lastName.toLowerCase()
            }

            if (userB.lastName != null) {
                userB = userB + " " + second.lastName.toLowerCase()
            }

            if (userA < userB)
                return -1;
            if (userA > userB)
                return 1;
            else
                return 0;
        }

        var ptnMRN;

        if (JSON.parse($window.localStorage['SELECTED_PATIENT'] != undefined)) {
            ptn.currentPatient = JSON.parse($window.localStorage['SELECTED_PATIENT']);
            ptnMRN = ptn.currentPatient["mrn"];
        } else {
            ptnMRN = null;
        }

        //Code for inviting user through form
        ptn.goToInviteUserForm = function() {
            $state.go('tab.inviteUser');
        }

        var patientInfo;

        if (JSON.parse($window.localStorage['SELECTED_PATIENT'] != undefined)) {
            patientInfo = JSON.parse($window.localStorage["SELECTED_PATIENT"]);
            if (patientInfo["lastName"] != null && patientInfo["lastName"] != '') {
                ptn.currentPatientName = patientInfo["firstName"] + " " + patientInfo["lastName"];
            }
            else {
                ptn.currentPatientName = patientInfo["firstName"];
            }
        } else {
            ptn.currentPatient = "undefined";
        }

        //Custom form validation erros for invite user form
        ptn.checkNameValidation = function(inputValue1, inputValue2) {
            var nameFields = document.getElementById('nameField');
            var userNameIcon = document.getElementsByClassName('ion-ios-person-outline')[0];
            var nameWarningIcon = document.getElementsByClassName('ion-alert-circled')[0];
            if (inputValue1 && inputValue2) {
                nameFields.style.borderColor = '';
                userNameIcon.style.color = '';
                nameWarningIcon.style.opacity = '0';
            }
            else {
                nameFields.style.borderColor = 'red';
                userNameIcon.style.color = 'red';
                nameWarningIcon.style.opacity = '1';
            }
        }

        ptn.checkEmailValidation = function(inputValue) {
            var emailRegEx = /\S+@\S+\.\S+/;
            var myBoolean = emailRegEx.test(inputValue);
            var emailDiv = document.getElementById('emailDiv');
            var emailIcon = document.getElementsByClassName('ion-ios-email-outline')[0];
            var emailWarningIcon = document.getElementsByClassName('ion-alert-circled')[1];

            if (inputValue == undefined || inputValue == null || inputValue == '') {
                myBoolean = true;
            }

            if (myBoolean) {
                emailDiv.style.borderColor = '';
                emailIcon.style.color = '';
                emailWarningIcon.style.opacity = '0';
            }
            else {
                emailDiv.style.borderColor = 'red';
                emailIcon.style.color = 'red';
                emailWarningIcon.style.opacity = '1';
            }
        }

        ptn.checkPhoneValidation = function(inputValue) {
            var phoneDiv = document.getElementById('phoneDiv');
            var phoneIcon = document.getElementsByClassName('ion-ios-telephone-outline')[0];
            var phoneWarningIcon = document.getElementsByClassName('ion-alert-circled')[2];
            phoneDiv.style.borderColor = '';
            phoneIcon.style.color = '';
            phoneWarningIcon.style.opacity = '0';
        }
        //End of custom form validation errors

        //Function to submit invite user form information
        ptn.submitFollower = function(followerInfo) {
            ptn.submittingInvite = true;

            if ((followerInfo.email == undefined || followerInfo.email == null || followerInfo.email == '') &&
                (followerInfo.phoneNumber == undefined || followerInfo.phoneNumber == null || followerInfo.phoneNumber == '')) {
                ptn.submittingInvite = false;

                var emailDiv = document.getElementById('emailDiv');
                var emailIcon = document.getElementsByClassName('ion-ios-email-outline')[0];
                var emailWarningIcon = document.getElementsByClassName('ion-alert-circled')[1];
                emailDiv.style.borderColor = 'red';
                emailIcon.style.color = 'red';
                emailWarningIcon.style.opacity = '1';

                var phoneDiv = document.getElementById('phoneDiv');
                var phoneIcon = document.getElementsByClassName('ion-ios-telephone-outline')[0];
                var phoneWarningIcon = document.getElementsByClassName('ion-alert-circled')[2];
                phoneDiv.style.borderColor = 'red';
                phoneIcon.style.color = 'red';
                phoneWarningIcon.style.opacity = '1';
            }

            var followerUserName;
            if (followerInfo.lastName != null) {
                followerUserName = followerInfo.firstName + " " + followerInfo.lastName;
            }
            else {
                followerUserName = followerInfo.firstName;
            }

            var inviteJSON = {
                firstName: followerInfo.firstName,
                lastName: followerInfo.lastName,
                email: followerInfo.email,
                phoneNumber: followerInfo.phoneNumber
            }

            if (followerInfo.email != undefined && followerInfo.email != null && followerInfo.email != '') {
                UserControllerService.inviteUser(inviteJSON)
                    .then(function inviteUserSuccess(response) {
                        $scope.redirectToPatient = true;

                        var followerJSON = {
                            username: followerUserName,
                            emailAddress: followerInfo.email,

                            patient: [{
                                mrn: ptnMRN
                            }]
                        };

                        ptn.followPatient(followerJSON, function() {
                            ptn.submittingInvite = false;

                            var followerName = followerJSON.username;
                            if (followerJSON.lastName != null) {
                                followerName = followerName + " " + followerJSON.lastName;
                            }

                            console.log(followerName + " is now following " + ptn.currentPatientName);
                        }, function() {
                            ptn.submittingInvite = false;
                        });
                    })
                    .catch(function inviteUserFailure(errorResponse) {
                        ptn.submittingInvite = false;
                        $log.error("Error adding follower. Status Code: " + errorResponse.status);

                        $scope.redirectToPatient = false;
                    });
            }
            else if (followerInfo.phoneNumber != undefined && followerInfo.phoneNumber != null && followerInfo.phoneNumber != '') {
                UserControllerService.inviteUserViaSMS(inviteJSON)
                    .then(function inviteUserViaSMSSuccess(response) {
                        $scope.redirectToPatient = true;

                        console.log("inviteUserViaSMSSuccess", response);

                        var followerJSON = {
                            username: followerUserName,
                            emailAddress: response.data.emailAddress, // pass in email retrieved

                            patient: [{
                                mrn: ptnMRN
                            }]
                        };

                        ptn.followPatient(followerJSON, function() {
                            ptn.submittingInvite = false;

                            var followerName = followerJSON.username;
                            if (followerJSON.lastName != null) {
                                followerName = followerName + " " + followerJSON.lastName;
                            }

                            console.log(followerName + " is now following " + ptn.currentPatientName);
                        }, function() {
                            ptn.submittingInvite = false;
                        });
                    })
                    .catch(function inviteUserViaSMSFailure(errorResponse) {
                        ptn.submittingInvite = false;
                        $log.error("Error adding follower via SMS. Status Code: " + errorResponse.status);

                        $scope.redirectToPatient = false;
                    });
            }
        };

        ptn.followPatient = function(user, successCallback, errorCallback) {
            user.attemptingToFollow = true;
            //JSON object to be passed to our follow patient Service
            var followerInformation = {
                username: user.username,
                lastName: user.lastName,
                emailAddress: user.emailAddress,

                patient: [{
                    mrn: ptnMRN
                }]
            };

            if (user.isFollowing != null && user.isFollowing == true) {
                PatientControllerService.unFollowPatient(prepareFollowPatientJSON(user, ptn.currentPatient)).then(function(response) {
                    if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                        user.attemptingToFollow = false;
                        if (errorCallback != null) {
                            errorCallback();
                        }
                        return;
                    }
                    if (successCallback != null) {
                        successCallback();
                    }
                    user.isFollowing = false;
                    user.attemptingToFollow = false;
                });
            }
            else {
                //followPatient Service
                UserControllerService.followPatient(followerInformation)
                    .then(function followPatientSuccess() {
                        var patientName;
                        if (ptn.currentPatient.lastName != null) {
                            patientName = ptn.currentPatient.firstName + " " + ptn.currentPatient.lastName;
                        }
                        else {
                            patientName = ptn.currentPatient.firstName;
                        }

                        var followerName;
                        if (followerInformation.lastName != null) {
                            followerName = followerInformation.username + " " + followerInformation.lastName;
                        }
                        else {
                            followerName = followerInformation.username;
                        }
                        if (successCallback != null) {
                            successCallback();
                        }
                        user.isFollowing = true;
                        user.attemptingToFollow = false;
                        $scope.successEUFollowPopup(followerName, patientName);
                    })
                    .catch(function followPatientError(errorMessage) {
                        console.log(errorMessage);
                        user.attemptingToFollow = false;
                        if (errorCallback != null) {
                            errorCallback();
                        }
                        $scope.errorEUFollowPopup();
                    })
            }
        }

        $scope.successEUFollowPopup = function(followerName, patientName) {
            if (navigator.notification) {
                var onTapOK = function() {
                    if ($scope.redirectToPatient == true) {
                        $rootScope.goToShowFollowers = true;
                        $scope.goBackByPageNo(-2);
                    }
                }
                navigator.notification.alert(
                    'You have added ' + followerName + ' as a follower of ' + patientName + '.',
                    onTapOK,
                    'Follow Successful',
                    'OK'
                );
            }
            else {
                $scope.careTrailPopup = "EU-FOLLOW-PATIENT-SUCCESSFUL";
                $scope.followerName = followerName;
                $scope.patientName = patientName;
                $rootScope.showPopup = $ionicPopup.alert({
                    templateUrl: 'templates/common/popup-caretrail.html',
                    cssClass: 'success-popup',
                    scope: $scope,
                    buttons: [
                        {
                            text: 'OK',
                            onTap: function() {
                                $rootScope.showPopup.close();
                                if ($scope.redirectToPatient == true) {
                                    $rootScope.goToShowFollowers = true;
                                    $scope.goBackByPageNo(-2);
                                }
                            }
                        }
                    ]
                });
            }

            return $rootScope.showPopup;
        };

        $scope.errorEUFollowPopup = function() {
            if (navigator.notification) {
                var onTapOK = function() {
                    $rootScope.showPopup.close();
                }
                navigator.notification.alert(
                    'An error has occurred while attempting to follow the patient.',
                    onTapOK,
                    'Follow Error',
                    'OK'
                );
            }
            else {
                $scope.careTrailPopup = "EU-FOLLOW-PATIENT-ERROR";
                $rootScope.showPopup = $ionicPopup.show({
                    templateUrl: 'templates/common/popup-error.html',
                    cssClass: 'success-popup',
                    scope: $scope,
                    buttons: [
                        {
                            text: 'OK',
                            onTap: function() {
                                $rootScope.showPopup.close();
                            }
                        }
                    ]
                });
            }
        };

    })

    .controller('PatientLandingCtrl', function($scope, $rootScope, $stateParams, $state, PatientControllerService, UserControllerService,
        $ionicPopup, $window, $ionicPopover, $ionicHistory, $ionicLoading, $cordovaCamera, MessageControllerService,
        $ionicModal, $interval, $timeout) {
        reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state, $timeout);

        var ptnLnd = this;
        var data = '';
        ptnLnd.goSearchFollowers = '';
        ptnLnd.showContactInfo = '';
        ptnLnd.hideContactInfoOnLoad = '';

        $scope.selectedItemState = { selectedItemType: '', selectedItemSubType: '', selectedItem: null };

        $scope.patient = JSON.parse($window.localStorage['SELECTED_PATIENT']);
        $scope.patient.isMyPatient = isPatientExistInRoot($rootScope, $scope.patient) != -1;
        $scope.patient.careTrailFilter = '';
        $rootScope.patient = $scope.patient;

        $scope.selectedSubTabDiv = "selectedSubTabDiv";
        $scope.noClass = "";
        $scope.TimeLineMessageAlertType = "button-dark";
        setStyleByTaskStatus($rootScope);

        $scope.showTimeline = function() {
            $rootScope.rootCheckPatient = true;
            $scope.selectedTab = "PATIENT-TIMELINE";
            $rootScope.selectedTab = $scope.selectedTab;
            $scope.selectedItemState.selectedItemType = 'timeline';
            $scope.selectedItemState.selectedItemSubType = 'patient-timeline';
            $scope.patient.careTrailFilter = '';
            handleChatBoxDisplayFields($scope);
            fixAvatar($scope, $timeout);
        };

        ptnLnd.goSearchFollowers = function() {
            $state.go('tab.searchForUser');
        }

        handleUserChatBox($scope, UserControllerService, $ionicPopup, $ionicPopover, $window, $cordovaCamera, $ionicModal, $rootScope);
        handleMessagingPanel($scope, UserControllerService, MessageControllerService, $ionicPopup, $ionicPopover, $window, $cordovaCamera, $ionicModal, $rootScope, $state, $ionicLoading);

        $scope.loadedPatientFollowers = false;

        $scope.showFollowers = function() {
            $rootScope.rootCheckPatient = false;
            $scope.selectedTab = "PATIENT-FOLLOWERS";
            $scope.selectedItemState.selectedItemType = 'user';
            $scope.selectedItemState.selectedItemSubType = '';
            $scope.patient.careTrailFilter = '';
            if (!$scope.loadedPatientFollowers) {
                $scope.isLoading = true;
                $scope.loadedPatientFollowers = true;
            }

            PatientControllerService.getPatientFollowers($scope.patient.mrn)
                .then(function(response) {
                    if ($scope.selectedTab == "PATIENT-FOLLOWERS") {
                        $scope.isLoading = false;
                    }
                    if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                        return;
                    }
                    var onCallData = response.data;
                    markCleanPhoneNumbers(onCallData);
                    $scope.aoFollowers = checkOnCallStatus(onCallData, ptnLnd.onCallFollowers);
                });

            unFollowPatient($scope, PatientControllerService, $ionicPopup, $state, $rootScope, $ionicLoading);
            fixAvatar($scope, $timeout);
        };

        $scope.loadedPatientOnCall = false;

        $scope.showFollowersOnCall = function() {
            $rootScope.rootCheckPatient = false;
            $scope.selectedTab = "PATIENT-ON-CALL";
            $scope.selectedItemState.selectedItemType = 'user';
            $scope.selectedItemState.selectedItemSubType = '';
            if (!$scope.loadedPatientOnCall) {
                $scope.isLoading = true;
                $scope.loadedPatientOnCall = true;
            }
            fixAvatar($scope, $timeout);

            if (!ptnLnd.onCallFollowers) {
                PatientControllerService.getPatientOnCallFollowers($scope.patient.patientid)
                    .then(function(response) {
                        var followersOnCall = response.data.onCallUsersMap.Day;
                        ptnLnd.onCallFollowers = followersOnCall;

                        if (ptnLnd.onCallFollowers != null) {
                            for (var i = 0; i < ptnLnd.onCallFollowers.length; i++) {
                                if (ptnLnd.onCallFollowers[i] != null && ptnLnd.onCallFollowers[i].onCallUser != null) {
                                    // The isOnCall variable is used in various templates, so we force it to true here
                                    ptnLnd.onCallFollowers[i].onCallUser.isOnCall = true;
                                }
                            }
                        }

                        if ($scope.selectedTab == "PATIENT-ON-CALL") {
                            $scope.isLoading = false;
                        }

                        return ptnLnd.onCallFollowers;
                    })
                    .catch(function(message) {
                        if ($scope.selectedTab == "PATIENT-ON-CALL") {
                            $scope.isLoading = false;
                        }
                        console.log(message);
                    });
            }
            else {
                if ($scope.selectedTab == "PATIENT-ON-CALL") {
                    $scope.isLoading = false;
                }
                return ptnLnd.onCallFollowers;
            }
        };

        if ($rootScope.goToShowFollowers == true) {
            $rootScope.goToShowFollowers = false;
            $scope.showFollowers();
        }
        else {
            $scope.showTimeline();
        }
        setPaginationByPatientTimeLineInScope($scope, PatientControllerService, $ionicPopup, $rootScope, $ionicLoading);

        $scope.cardButton1Callback = function(data) {
            if (data != null) {
                switch ($scope.selectedItemState.selectedItemType) {
                    case "timeline": {
                        if (data.userId != $rootScope.userProfile.userid) {
                            $scope.showConversationDetails(data, 0)
                        }
                        break;
                    }
                    case "user": {
                        document.location.href = "tel:" + data.phoneNumber;
                        break;
                    }
                }
            }
        }

        $scope.cardButton2Callback = function(data) {
            if (data != null) {
                if (data.userId != $rootScope.userProfile.userid) {
                    $scope.showConversationDetails(data, 0)
                }
            }
        }

        $scope.cardOpenImage = function(image) {
            if (image != null) {
                $scope.showImage(image);
            }
        }

        //Toggle functionality for follower contact info panel
        ptnLnd.hideContactInfoOnLoad = function() {
            var listItems = document.querySelectorAll(".contact-info-panel");

            for (var i = 0; i < listItems.length; i++) {
                hidePanel(listItems[i]);
            }
        }

        ptnLnd.showContactInfo = function(nodeListIndex) {
            var listItems = document.querySelectorAll(".contact-info-panel");
            var selectedListItem = listItems.item(nodeListIndex);
            for (var i = 0; i < listItems.length; i++) {
                if (selectedListItem === listItems[i] && selectedListItem.style.height === "0px") {
                    showPanel(listItems[i]);
                } else {
                    hidePanel(listItems[i]);
                }
            }
        }

        ptnLnd.onCallHideContactInfoOnLoad = function() {
            var listItems = document.querySelectorAll(".on-call-contact-info-panel");
            for (var i = 0; i < listItems.length; i++) {
                hidePanel(listItems[i]);
            }
        }

        ptnLnd.onCallShowContactInfo = function(nodeListIndex) {
            var listItems = document.querySelectorAll(".on-call-contact-info-panel");
            var selectedListItem = listItems.item(nodeListIndex);
            for (var i = 0; i < listItems.length; i++) {
                if (selectedListItem === listItems[i] && selectedListItem.style.height === "0px") {
                    showPanel(listItems[i]);
                } else {
                    hidePanel(listItems[i]);
                }
            }
        }

        function showPanel(element) {
            element.style.height = "inherit";
            element.style.padding = "6px";
            element.style.borderTop = "1px solid #e0e0e0";
        }
        function hidePanel(element) {
            element.style.height = "0px";
            element.style.padding = "0px";
            element.style.borderTop = "0px";
        }
        //End of toggle functionality


        followRUnFollowPatient($scope, UserControllerService, PatientControllerService, $state, $ionicPopup, $ionicLoading, $rootScope, $timeout);

        $scope.onPatientSwipeDown = function() {
            if ($scope.selectedTab == "PATIENT-TIMELINE") {
                $scope.isTimeLineSwipedDown = true;
            }
            else if ($scope.selectedTab == "PATIENT-FOLLOWERS") {
                $scope.isFollowerSwipedDown = true;
            }
            else if ($scope.selectedTab == "PATIENT-ON-CALL") {
                $scope.isAuditTrailSwipedDown = true;
            }
        };

        setDefaults("PATIENTS", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup, UserControllerService, $window, $rootScope);

        $scope.successPopup = function(followPatientName) {
            if (navigator.notification) {
                navigator.notification.alert(
                    'You are now following ' + followPatientName + '.',
                    null,
                    'Follow Successful',
                    'OK'
                );
            }
            else {
                $scope.careTrailPopup = "FOLLOW-PATIENT-SUCCESSFUL";
                $scope.patientName = followPatientName;
                $rootScope.showPopup = $ionicPopup.alert({
                    templateUrl: 'templates/common/popup-caretrail.html',
                    cssClass: 'success-popup',
                    scope: $scope,
                    buttons: [
                        { text: 'OK' }
                    ]
                });
            }
        };

        $scope.$on('scroll.refreshComplete', $scope.onPatientSwipeDown);

    })
    .controller('PopulateAddPatientCtrl', function($rootScope, $scope, $stateParams, $window, $state, UserControllerService, $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup) {


    })
    .controller('SaveAddPatientCtrl', function($rootScope, $scope, $stateParams, $window, $state, UserControllerService, $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup) {

        $scope.addpatientdata2 = '';
        $scope.addpatientdata = {};
        $scope.submitted = false;
        $scope.isSubmitting = false;

        setDateOfBirth($scope);
        setSavePatientSuccessPopup($scope, $ionicPopup, $rootScope);
        setBack($scope, $ionicHistory);

        $scope.addPatientSubmit = function(form) {
            $scope.isSubmitting = true;
            $scope.submitted = true;

            if (!form.$valid) {
                $scope.isSubmitting = false;
                return;
            }

            if ($scope.addpatientdata.patientDob && $scope.addpatientdata.patientDob !== '') {
                var dob = $scope.addpatientdata.patientDob;
                $scope.addpatientdata.dobMonth = ("0" + (dob.getMonth() + 1)).slice(-2); // Make sure we have a leading 0
                $scope.addpatientdata.dobDay = ("0" + dob.getDate()).slice(-2); // Make sure we have a leading 0
                $scope.addpatientdata.dobYear = dob.getFullYear();
            }

            var patientInfo = filterAddPatientJSON($scope.addpatientdata, $rootScope.userProfile);

            UserControllerService.addPatient(patientInfo).then(function(response) {
                $scope.isSubmitting = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                } else {
                    $scope.savePatientSuccessPopup(patientInfo);
                    setUserPatientROOT(UserControllerService, $scope, $rootScope, $ionicPopup);
                }
            });
        };

        $scope.addpatientdata.patientDobDisplay = '';
        $scope.addpatientdata.patientDob = '';
        $scope.currentDate = new Date();
        $scope.PatientDobCallback = function(dateSelected) {
            if (dateSelected) {
                $scope.addpatientdata.patientDob = dateSelected;

                var month = dateSelected.getMonth() + 1;
                var date = dateSelected.getDate();
                var year = dateSelected.getFullYear();

                if (month.toString().length < 2) {
                    month = '0' + month.toString();
                }

                if (date.toString().length < 2) {
                    date = '0' + date.toString();
                }

                $scope.addpatientdata.patientDobDisplay = month + '' + date + '' + year;
            }
        };



        $scope.isFutureDate = function(inputDob) {
            var today = $scope.currentDate;

            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);

            var dateNow = $scope.getDateInMsecs(today);
            var bornDate = $scope.getDateInMsecs(inputDob);

            if (bornDate > dateNow) {
                return true
            }
        }

        $scope.getDateInMsecs = function(dateEntered) {

            var dateInMsec = Date.parse(dateEntered);
            return dateInMsec;
        };



        $scope.canceltotimeline = function() {
            $scope.goBackByPageNo(-1);
        };

        $scope.formatDate = function(month, date, year) {
            return (month <= 9 ? '0' + month : month) + (date <= 9 ? '0' + date : date) + year;
        }

        $scope.setDob = function() {
            var dob = $scope.addpatientdata.patientDobDisplay;
            if (dob) {
                var month = parseInt(dob.substring(0, 2));
                var date = parseInt(dob.substring(2, 4));
                var year = parseInt(dob.substring(4, 8));
                $scope.addpatientdata.patientDob = new Date(year, month - 1, date);
            }
        }

        window.addEventListener('native.keyboardshow', keyboardShowHandler);

        function keyboardShowHandler(e) {
            if (document.activeElement.tagName.toLowerCase() == 'body') {
                $('#fld-date').focus();
                document.activeElement.blur();
            }
        }

        $scope.clickOutSide = function($event) {
            $scope.addpatientdata.isDropDownVisible = false;
        };

        $scope.selectValue = function($event) {
            if (ionic.Platform.isIOS()) {
                if (!$scope.addpatientdata.isDropDownVisible) {
                    $scope.addpatientdata.sex = $scope.addpatientdata.oldSex;
                    $('#fld-sex').val($scope.addpatientdata.oldSex);
                    $event.preventDefault();
                    $event.stopPropagation();

                } else {
                    $scope.addpatientdata.oldSex = $scope.addpatientdata.sex;
                }

                $scope.addpatientdata.isDropDownVisible = false;
            }
        };


        $scope.activateDropDown = function() {
            if (ionic.Platform.isIOS()) {
                $scope.addpatientdata.isDropDownVisible = true;
            }
        };

    })

function unFollowPatient($scope, PatientControllerService, $ionicPopup, $state, $rootScope, $ionicLoading) {
    setUnFollowPatientPopup($scope, $ionicPopup, $rootScope);

    $scope.unFollowPatient = function(patient, followers) {
        $scope.isFollowingOrUnfollowing = true;
        PatientControllerService.unFollowPatient(prepareFollowPatientJSON(followers, patient)).then(function(response) {
            $scope.isFollowingOrUnfollowing = false;
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                return;
            }
            removePatientFromRoot($rootScope, patient);
            if ($scope.selectedItemState != null && $scope.selectedItemState.selectedItem != null) {
                if ($scope.selectedItemState.selectedItem.patientId == patient.patientId) {
                    $scope.selectedItemState.selectedItem.isMyPatient = false;
                }
            }

            if ($scope.aoPatient != undefined && $scope.aoPatient != null) {
                $scope.aoPatient = removePatientById($scope.aoPatient, patient.patientid);
                $scope.unfollowPatientSuccessPopup(patient);
            } else {
                $scope.goBackByPageNo(-1);
            }
        });
    }
}

function setUnFollowPatientPopup($scope, $ionicPopup, $rootScope) {

    setUnfollowPatientSuccessPopup($scope, $ionicPopup, $rootScope);

    $scope.unFollowPatientPopup = function(patient, followers) {
        resetSwipedLeftItem();
        var patientName = patient.firstName;
        if (patient.lastName != null) {
            patientName += " " + patient.lastName;
        }

        if (navigator.notification) {
            var onConfirm = function(buttonIndex) {
                if (buttonIndex == 1) {
                    $scope.unFollowPatient(patient, followers);
                }
            }
            navigator.notification.confirm(
                'Would you like to unfollow ' + patientName + '?',
                onConfirm,
                'Unfollow Patient?',
                ['Unfollow', 'Cancel']
            );
        }
        else {
            $scope.careTrailPopup = "UNFOLLOW-PATIENT";
            $scope.patientName = patientName;
            $rootScope.showPopup = $ionicPopup.show({
                templateUrl: 'templates/common/popup-caretrail.html',
                cssClass: 'success-popup',
                scope: $scope,
                buttons: [
                    {
                        text: 'Unfollow',
                        onTap: function() {
                            $scope.unFollowPatient(patient, followers);
                            $scope.patientName = null;
                        }
                    },
                    {
                        text: "Cancel",
                        onTap: function() {
                            $scope.patientName = null;
                            $rootScope.showPopup.close();
                        }
                    }
                ]
            });
        }
    }
}

function followRUnFollowPatient($scope, UserControllerService, PatientControllerService, $state, $ionicPopup, $ionicLoading, $rootScope, $timeout) {

    setFollowPatient($scope, UserControllerService, $ionicPopup, $ionicLoading, $rootScope, $timeout, $state);
    unFollowPatient($scope, PatientControllerService, $ionicPopup, $state, $rootScope, $ionicLoading);

    $scope.followRUnFollowPatient = function(patient) {
        if (patient.isMyPatient) {
            $scope.unFollowPatientPopup(patient, $rootScope.userProfile);
        }
        else {
            $scope.followPatientPopup(patient);
        }
    }
}

function setFollowPatient($scope, UserControllerService, $ionicPopup, $ionicLoading, $rootScope, $timeout, $state) {

    followPatient($scope, UserControllerService, $rootScope.userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout, $state);

    $scope.followPatientPopup = function(patient) {
        var patientName = patient.firstName;
        if (patient.lastName != null) {
            patientName += " " + patient.lastName;
        }
        if (navigator.notification) {
            var onConfirm = function(buttonIndex) {
                if (buttonIndex == 1) {
                    $scope.followPatient(patient);
                }
            }
            navigator.notification.confirm(
                'Would you like to follow ' + patientName + '?',
                onConfirm,
                'Follow Patient?',
                ['Follow', 'Cancel']
            );
        }
        else {
            $scope.careTrailPopup = "FOLLOW-PATIENT";
            $scope.patientName = patientName;
            $rootScope.showPopup = $ionicPopup.show({
                templateUrl: 'templates/common/popup-caretrail.html',
                cssClass: 'patient-popup',
                scope: $scope,
                buttons: [
                    {
                        text: 'Follow',
                        onTap: function() {
                            $scope.followPatient(patient);
                            $scope.patientName = null;
                        }
                    },
                    {
                        text: "Cancel",
                        onTap: function() {
                            $scope.patientName = null;
                            $rootScope.showPopup.close();
                        }
                    }
                ]
            });
        }
    }
}
function setSavePatientSuccessPopup($scope, $ionicPopup, $rootScope) {

    $scope.savePatientSuccessPopup = function(patient) {
        var patientName = patient.patient[0].firstName;
        if (patient.patient[0].lastName != null) {
            patientName += " " + patient.patient[0].lastName;
        }

        if (navigator.notification) {
            var onTapOK = function() {
                $scope.goBackByPageNo(-1);
            }
            navigator.notification.alert(
                'You have created a new patient: ' + patientName + '.',
                onTapOK,
                'New Patient Successful',
                'OK'
            );
        }
        else {
            $scope.careTrailPopup = "SAVE-PATIENT-SUCCESS";
            $scope.patientName = patientName;
            $rootScope.showPopup = $ionicPopup.alert({
                templateUrl: 'templates/common/popup-caretrail.html',
                cssClass: 'success-popup',
                scope: $scope,
                buttons: [
                    {
                        text: 'OK',
                        onTap: function() {
                            $scope.goBackByPageNo(-1);
                        }
                    }
                ]

            });
        }
    }
}

function setUnfollowPatientSuccessPopup($scope, $ionicPopup, $rootScope) {

    $scope.unfollowPatientSuccessPopup = function(patient) {
        var patientName = patient.firstName;
        if (patient.lastName != null) {
            patientName += " " + patient.lastName;
        }

        if (navigator.notification) {
            navigator.notification.alert(
                'You have unfollowed ' + patientName + '.',
                null,
                'Unfollow Successful',
                'OK'
            );
        }
        else {
            $scope.careTrailPopup = "UNFOLLOW-PATIENT-SUCCESSFUL";
            $scope.patientName = patientName;
            $rootScope.showPopup = $ionicPopup.alert({
                templateUrl: 'templates/common/popup-caretrail.html',
                cssClass: 'success-popup',
                scope: $scope,
                buttons: [
                    { text: 'OK' }
                ]

            });
        }
    }
}


function searchPatientByName(patientName, aoPatient) {
    patientName = patientName.trim();
    if (patientName == "") {
        return;
    }
    patientName = patientName.toUpperCase();

    var aoResultPatient = [];
    if (aoPatient == null || patientName == "") {
        return aoResultPatient;
    }

    for (var i = 0, j = 0; i < aoPatient.length; i++) {
        var name = '';
        if (aoPatient[i].lastName != null) {
            name = aoPatient[i].firstName + " " + aoPatient[i].lastName;
        }
        else {
            name = aoPatient[i].firstName;
        }

        if (name.toUpperCase().indexOf(patientName) != -1) {
            aoResultPatient[j] = aoPatient[i];
            j++;
        }
    }

    return aoResultPatient;
}
