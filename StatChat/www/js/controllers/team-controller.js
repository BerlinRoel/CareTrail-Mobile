angular.module('statchat.team-controller', ['ngResource', 'ionic'])
    .constant('ApiEndpoint', {
    })
    .controller('TeamCtrl', function($rootScope, $scope, $window, $stateParams, $state, TeamControllerService,
        UserControllerService, $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup, $timeout) {
        reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state);

        $rootScope.rootCheckPatient = false;
        $scope.selectedSubTabDiv = "selectedSubTabDiv";
        $scope.noClass = "";
        $scope.teamInfo = {
            careTrailFilter: '',
            teamSearch: '',
            isSearching: false
        };
        $scope.isLoading = false;

        leaveTeam($scope, TeamControllerService, $ionicPopup, $state, $rootScope);

        $scope.teamsListLoaded = false;
        $scope.showTeamList = function() {
            $scope.selectedTab = "TEAMS_MYTEAM";
            if (!$scope.teamsListLoaded) {
                $scope.isLoading = true;
                $scope.teamsListLoaded = true;
            }
            UserControllerService.userTeamList($rootScope.userProfile.emailAddress[0])
                .then(function(response) {
                    if ($scope.selectedTab == "TEAMS_MYTEAM") {
                        $scope.isLoading = false;
                    }
                    if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) return;
                    $scope.aoTeam = response.data;
                    // Need to mark each team member as isMyTeam=true
                    $scope.aoTeam = markMyTeam($scope.aoTeam, response.data);
                });

            setDefaults("TEAMS", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup, UserControllerService, $window, $rootScope);
        };

        $scope.showTeamList();

        $scope.onHoldAddTeam = function() {
            if (window.plugins && window.plugins.toast) {
                window.plugins.toast.showWithOptions(
                    {
                        message: "Create Team",
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -40
                    }
                );
            }
        }

        $scope.goToAddTeam = function() {
            $state.transitionTo('tab.add_team');
        }

        $scope.showTeamListSearch = function($event) {
            $scope.selectedTab = "TEAMS_SEARCH";
            searchAllTeamByName($scope, UserControllerService, TeamControllerService, $rootScope.userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout);
            setDefaults("TEAMS", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup, UserControllerService, $window, $rootScope);
        };

        $scope.$watch('teamInfo.teamSearch', function(newVal) {
            if (!newVal) {
                searchAllTeamByName($scope, UserControllerService, TeamControllerService, $rootScope.userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout);
            }
        });

        $scope.onTeamListSwipeDown = function() {
            $scope.isTeamListSwipedDown = true;
        };

        $scope.$on('scroll.refreshComplete', function() {
            $scope.isTeamListSwipedDown = true;
        });

        setTeamNavInScope($scope, $state, $window);
        document.getElementById('teamsDiv').style.display = 'block';
    })

    .controller('TeamLandingCtrl', function($scope, $stateParams, $state, UserControllerService, TeamControllerService, MessageControllerService,
        $ionicPopup, $window, $ionicPopover, $ionicHistory, $ionicLoading, $rootScope, $ionicModal,
        $timeout, $cordovaCamera, PatientControllerService) {

        joinATeam($scope, UserControllerService, $rootScope.userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout);
        leaveATeam($scope, TeamControllerService, $rootScope.userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout);

        handleMessagingPanel($scope, UserControllerService, MessageControllerService, $ionicPopup, $ionicPopover, $window, $cordovaCamera, $ionicModal, $rootScope, $state, $ionicLoading);
        handleImagePopover($scope, $ionicModal, $rootScope);

        var teamLnd = this;

        reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state);

        $scope.team = JSON.parse($window.localStorage['SELECTED_TEAM']);

        setBack($scope, $ionicHistory);
        setLogout($scope, $ionicLoading, $ionicHistory, $state, $window, UserControllerService, $rootScope, $ionicPopup);

        $scope.selectedTab = "TEAM-TIMELINE";
        $scope.selectedSubTabDiv = "selectedSubTabDiv";
        $scope.noClass = "";

        $scope.selectedItemState = { selectedItemType: '', selectedItemSubType: '', selectedItem: null };

        leaveTeam($scope, TeamControllerService, $ionicPopup, $state, $rootScope);

        $scope.onHoldJoinTeam = function() {
            if (window.plugins && window.plugins.toast) {
                var joinOrLeave = $scope.team.isMyTeam ? "Leave" : "Join";
                window.plugins.toast.showWithOptions(
                    {
                        message: joinOrLeave + " This Team",
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -40
                    }
                );
            }
        }

        $scope.joinLeaveTeam = function() {
            if ($scope.team.isMyTeam) {
                $scope.leaveATeam($scope.team);
            }
            else {
                $scope.joinATeam($scope.team);
            }
        }

        $scope.onHoldAddUserToTeam = function() {
            if (window.plugins && window.plugins.toast) {
                window.plugins.toast.showWithOptions(
                    {
                        message: "Add User to Team",
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -40
                    }
                );
            }
        }

        $scope.goToAddUserToTeam = function() {
            $state.transitionTo('tab.add_team_member');
        }

        $scope.cardButton1Callback = function(data) {
            if (data != null) {
                switch ($scope.selectedItemState.selectedItemType) {
                    case "task": {
                        if (data.userId != $rootScope.userProfile.userid) {
                            $scope.showConversationDetails(data, 0)
                        }
                        break;
                    }
                    case "patient": {
                        if (data.isMyPatient) {
                            $scope.unFollowPatientPopup(data, $rootScope.userProfile);
                        }
                        else {
                            $scope.followPatientPopup(data);
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
                switch ($scope.selectedItemState.selectedItemType) {
                    case "task": {
                        if (data != null) {
                            $window.localStorage['SELECTED_PATIENT'] = JSON.stringify(data);
                            $state.transitionTo('tab.patientshome', { 'patientId': data.mrn }, { reload: true });
                        }
                        break;
                    }
                    case "patient": {
                        if (data != null) {
                            $window.localStorage['SELECTED_PATIENT'] = JSON.stringify(data);
                            $state.transitionTo('tab.patientshome', { 'patientId': data.mrn }, { reload: true });
                        }
                        break;
                    }
                    case "user": {
                        if (data.userId != $rootScope.userProfile.userid) {
                            $scope.showConversationDetails(data, 0)
                        }
                        break;
                    }
                }
            }
        }

        $scope.cardOpenImage = function(image) {
            if (image != null) {
                $scope.showImage(image);
            }
        }

        //Toggle functionality for follower contact info panel
        teamLnd.hideContactInfoOnLoad = function() {
            var listItems = document.querySelectorAll(".contact-info-panel");

            for (var i = 0; i < listItems.length; i++) {
                hidePanel(listItems[i]);
            }
        }

        teamLnd.showContactInfo = function(nodeListIndex) {
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

        $scope.teams = {
            careTrailFilter: '',
            timeLineSwipedDown: false,
            patientSwipedDown: false,
            memberSwipedDown: false
        };

        $scope.showTimeline = function() {
            $scope.selectedTab = "TEAM-TIMELINE";
            $scope.selectedItemState.selectedItemType = 'task';
            $scope.selectedItemState.selectedItemSubType = 'team-task';
            handleChatBoxDisplayFields($scope);
            $scope.teams.careTrailFilter = '';
            $scope.isRefreshTeamTimeline = false;
            $scope.$on('scroll.infiniteScrollComplete', function() {
                fixAvatar($scope, $timeout);
            });
            $scope.paginateTeamTimeLine();
            fixAvatar($scope, $timeout);
        };

        setPaginationByTeamTimeLineInScope($scope, TeamControllerService, $ionicPopup, $rootScope, $ionicLoading);
        $scope.showTimeline();

        $scope.patientsLoaded = false;
        $scope.showPatients = function() {
            $scope.selectedTab = "TEAM-PATIENT";
            $scope.selectedItemState.selectedItemType = 'patient';
            $scope.selectedItemState.selectedItemSubType = '';
            if (!$scope.patientsLoaded) {
                $scope.isLoading = true;
                $scope.patientsLoaded = true;
            }
            TeamControllerService.getTeamPatientList($scope.team.teamName.replace(" ", "%20")).then(function(response) {
                if ($scope.selectedTab == "TEAM-PATIENT") {
                    $scope.isLoading = false;
                }
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) {
                    return;
                }
                $scope.aoPatient = response.data;
                markUserPatient($rootScope.rootAoPatient, $scope.aoPatient);
                if ($scope.aoPatient != null) {
                    setPatientNavInScope($scope, $state, $window);
                }
            }).then(function() {
                $scope.$on('scroll.infiniteScrollComplete', function() {
                    fixAvatar($scope, $timeout);
                });
                fixAvatar($scope, $timeout);
            });
            $scope.teams.careTrailFilter = '';

            followRUnFollowPatient($scope, UserControllerService, PatientControllerService, $state, $ionicPopup,
                $ionicLoading, $rootScope, $timeout);

            $scope.successPopup = function(followPatientName) {
                if (navigator.notification) {
                    var onTapOK = function() {
                        $scope.showPatients();
                    }
                    navigator.notification.alert(
                        'You are now following ' + followPatientName + '.',
                        onTapOK,
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
                            {
                                text: 'OK',
                                onTap: function() {
                                    $scope.showPatients();
                                }
                            }
                        ]
                    })
                }
            };
        };

        $scope.membersLoaded = false;

        $scope.showMembers = function() {
            $scope.selectedTab = "TEAM-MEMBER";
            $scope.selectedItemState.selectedItemType = 'user';
            $scope.selectedItemState.selectedItemSubType = '';
            teamLnd.onCallToggle = false;

            if (!$scope.membersLoaded) {
                $scope.isLoading = true;
                $scope.membersLoaded = true;
            }

            //Get team members on call
            TeamControllerService.getTeamMembersOnCall($scope.team.teamid)
                .then(function(response) {
                    teamLnd.membersOnCall = response.data.onCallUsersMap.Day;
                })
                .catch(function(message) {
                    console.log(message);
                });

            //Get list of team members
            TeamControllerService.getTeamTeamMemberList($scope.team.teamName.replace(" ", "%20")).then(function(response) {
                if ($scope.selectedTab == "TEAM-MEMBER") {
                    $scope.isLoading = false;
                }
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) {
                    return;
                }
                var teamMembersData = response.data;
                markCleanPhoneNumbers(teamMembersData);
                teamLnd.aoMembers = checkOnCallStatus(teamMembersData, teamLnd.membersOnCall);
            }).then(function() {
                $scope.$on('scroll.infiniteScrollComplete', function() {
                    fixAvatar($scope, $timeout);
                });
                fixAvatar($scope, $timeout);
            });
            $scope.teams.careTrailFilter = '';
        };

        $scope.onTeamSwipeDown = function() {
            if ($scope.selectedTab == "TEAM-TIMELINE") $scope.teams.timeLineSwipedDown = true;
            else if ($scope.selectedTab == "TEAM-PATIENT") $scope.teams.patientSwipedDown = true;
            else if ($scope.selectedTab == "TEAM-MEMBER") $scope.teams.memberSwipedDown = true;
        };

        $scope.showPatientHomePage = function(patient) {
            $window.localStorage['SELECTED_PATIENT'] = JSON.stringify(patient);
            $state.transitionTo('tab.patientshome', { 'patientId': patient.mrn }, { reload: true });
        };

        $scope.$on('scroll.refreshComplete', $scope.onTeamSwipeDown);
    })
    .controller('PopulateAddTeamMemberCtrl', function($rootScope, $scope, $stateParams, $window, $state, UserControllerService, $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup) {
        $scope.modelOptions = {
            updateOn: 'default blur',
            debounce: {
                default: 400,
                blur: 0
            }
        };

        $scope.team = JSON.parse($window.localStorage['SELECTED_TEAM']);
    })
    .controller('SaveAddTeamMemberCtrl', function($rootScope, $scope, $stateParams, $window, $state, UserControllerService,
        $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup) {

        setBack($scope, $ionicHistory);

        UserControllerService.getAllTeamList().then(function(response) {
            $scope.teamdetailvalues = response.data;
        });
        $scope.canceltotimeline = function() {
            //$state.go('tab.timeline', {authToken: $window.localStorage['privateKey']}, {reload: true});
            $scope.goBackByPageNo(-1);
        };
        $scope.teamMemberInfo = {
            "memberSearch": "",
            "isMemberRequired": "",
            "isMemberNotFound": "",
            "teamname": "",
            "isTeamRequired": "",
            "isSearching": false,
        };
        searchAllMemberByName($scope, UserControllerService);
        $scope.submitted = false;
        $scope.isSubmitting = false;
        setAddTeamMemberSuccessPopup($scope, $ionicPopup, $rootScope);

        $scope.addTeamMember = function(form, team) {
            $scope.isSubmitting = true;

            $scope.submitted = true;
            var isErr = false;
            $scope.hasError = false;
            $scope.hasSearchError = false;
            $scope.hasTeamError = false;
            $scope.teamMemberInfo.isMemberRequired = false;
            $scope.teamMemberInfo.isMemberNotFound = false;
            $scope.teamMemberInfo.isTeamRequired = false;
            if ($scope.teamMemberInfo.memberSearch == undefined || $scope.teamMemberInfo.memberSearch == null
                || $scope.teamMemberInfo.memberSearch == "") {
                isErr = true;
                $scope.teamMemberInfo.isMemberRequired = true;
                $scope.hasSearchError = true;
            }
            else if ($scope.teamMemberInfo.selected == undefined
                || $scope.teamMemberInfo.selected.username == undefined || $scope.teamMemberInfo.selected.username == null
                || $scope.teamMemberInfo.selected.username == "") {
                isErr = true;
                $scope.teamMemberInfo.isMemberNotFound = true;
                $scope.hasSearchError = true;
            }
            if (team == undefined || team == null || team.teamname == "") {
                isErr = true;
                $scope.teamMemberInfo.isTeamRequired = true;
                $scope.hasTeamError = true;
            }
            if (isErr) {
                $scope.hasError = true;
                $scope.isSubmitting = false;
                return;
            }

            var teamMemberInfo = filterAddTeamMemberJSON($scope.teamMemberInfo, team, $rootScope.userProfile);
            UserControllerService.joinTeam(teamMemberInfo).then(function(response) {
                $scope.isSubmitting = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                } else {
                    $scope.addTeamMemberSuccessPopup(teamMemberInfo);
                }
            });
        };

        $scope.teamSelectionVisible = false;

        $scope.clearSearch = function() {
            $scope.teamMemberInfo.memberSearch = '';
            $scope.aoMembers = [];
        };
    })
    .controller('PopulateAddTeamCtrl', function($rootScope, $scope, $stateParams, $window, $state, UserControllerService,
        $ionicPopover, $ionicLoading, $ionicHistory, $ionicPopup) {


    })
    .controller('SaveAddTeamCtrl', function($rootScope, $scope, $stateParams, $window, $state, UserControllerService, $ionicPopover,
        $ionicLoading, $ionicHistory, $ionicPopup) {
        $scope.isSubmitting = false;
        $scope.submitted = false;
        setBack($scope, $ionicHistory);

        $scope.addTeam = function(form) {
            $scope.isSubmitting = true;

            $scope.submitted = true;
            if (!form.$valid) {
                $scope.isSubmitting = false;
                return;
            }

            setSaveTeamSuccessPopup($scope, $ionicPopup, $rootScope);
            var teamInfo = filterAddTeamJSON($scope.teamInfo, $rootScope.userProfile);
            UserControllerService.addTeam(teamInfo).then(function(response) {
                $scope.isSubmitting = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                } else {
                    $scope.saveTeamSuccessPopup(teamInfo);
                }
            });
        };

        $scope.resetSubmit = function() {
            $scope.submitted = false;
        }

        $scope.canceltotimeline = function() {
            $scope.goBackByPageNo(-1);
        };

    })

function leaveTeam($scope, TeamControllerService, $ionicPopup, $state, $rootScope) {
    setLeaveTeamPopup($scope, $ionicPopup, $rootScope);

    $scope.leaveTeam = function(team, teamMember) {

        var teamUserInfo = prepareJoinTeamJSON(teamMember, team, $scope, $rootScope);
        TeamControllerService.leaveTeam(teamUserInfo).then(function(response) {
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
            if ($scope.selectedTab == "TEAM-MEMBER") {
                if ($scope.aoMembers != undefined && $scope.aoMembers != null) {
                    $scope.aoMembers = removeFollowersById($scope.aoMembers, teamMember.userid);
                    $scope.leaveTeamSuccessPopup(team);
                    return;
                }
            }
            if ($scope.aoTeam != undefined && $scope.aoTeam != null) {
                $scope.aoTeam = removeTeamById($scope.aoTeam, team.teamid);
                $scope.leaveTeamSuccessPopup(team);
            } else $state.go('tab.tabteams');
        });
    }
}

function setLeaveTeamPopup($scope, $ionicPopup, $rootScope) {
    setLeaveTeamSuccessPopup($scope, $ionicPopup, $rootScope);

    $scope.leaveTeamPopup = function(team, teamMember) {
        resetSwipedLeftItem();
        var teamMemberName = teamMember.firstName;
        if (teamMember.lastName != null) {
            teamMemberName += " " + teamMember.lastName;
        }

        if (navigator.notification) {
            var onConfirm = function(buttonIndex) {
                if (buttonIndex == 1) {
                    $scope.leaveTeam(team, teamMember);
                }
            }

            var title = "Remove User From Team?";
            var description = "Do you want to remove " + teamMemberName + " from the team " + team.teamName + "?";
            var buttonName = "Remove";
            if (teamMember.emailAddress == $rootScope.userProfile.emailAddress[0]) {
                title = "Leave Team?";
                description = "Do you want to leave the team " + team.teamName + "?";
                buttonName = "Leave";
            }
            navigator.notification.confirm(
                description,
                onConfirm,
                title,
                [buttonName, 'Cancel']
            );
        }
        else {
            if (teamMember.emailAddress == $rootScope.userProfile.emailAddress[0]) {
                $scope.careTrailPopup = "LEAVE-TEAM";
            }
            else {
                $scope.careTrailPopup = "LEAVE-USER-TEAM";
            }
            $scope.selectedTeam = team;
            $scope.teamUser = teamMemberName;
            $rootScope.showPopup = $ionicPopup.show({
                templateUrl: 'templates/common/popup-caretrail.html',
                cssClass: 'team-popup',
                scope: $scope,
                buttons: [
                    {
                        text: 'Leave',
                        onTap: function() {
                            $scope.leaveTeam(team, teamMember);
                        }
                    },
                    {
                        text: "Cancel",
                    }
                ]
            });
        }
    }
}

function setSaveTeamSuccessPopup($scope, $ionicPopup, $rootScope) {

    $scope.saveTeamSuccessPopup = function(team) {
        if (navigator.notification) {
            var onTapOK = function() {
                $scope.goBackByPageNo(-1);
            }
            navigator.notification.alert(
                'You have successfully created the team ' + team.teamName + '.',
                onTapOK,
                'Create Team Successful',
                'OK'
            );
        }
        else {
            $scope.careTrailPopup = "CREATE-TEAM-SUCCESSFUL";
            $scope.selectedTeam = team;
            $scope.showPopup = $ionicPopup.alert({
                scope: $scope,
                templateUrl: 'templates/common/popup-caretrail.html',
                cssClass: 'success-popup',
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

function setLeaveTeamSuccessPopup($scope, $ionicPopup, $rootScope) {

    $scope.leaveTeamSuccessPopup = function(team) {
        if (navigator.notification) {
            navigator.notification.alert(
                'You have left the team ' + team.teamName + '.',
                null,
                'Leave Team Successful',
                'OK'
            );
        }
        else {
            $scope.careTrailPopup = "LEAVE-TEAM-SUCCESSFUL";
            $scope.selectedTeam = team;
            $scope.showPopup = $ionicPopup.alert({
                scope: $scope,
                templateUrl: 'templates/common/popup-caretrail.html',
                cssClass: 'success-popup',
                buttons: [
                    { text: 'OK' }
                ]
            });
        }
    }
}

function setAddTeamMemberSuccessPopup($scope, $ionicPopup, $rootScope) {

    $scope.addTeamMemberSuccessPopup = function(teamMemberInfo) {

        var name = teamMemberInfo.username;
        if (teamMemberInfo.lastName != null) {
            name = name + " " + teamMemberInfo.lastName;
        }

        if (navigator.notification) {
            var onTapOK = function() {
                $scope.goBackByPageNo(-1);
            }
            navigator.notification.alert(
                name + ' has been added to the team ' + teamMemberInfo.team[0].teamName + '.',
                onTapOK,
                'Add Team Member Successful',
                'OK'
            );
        }
        else {
            $scope.careTrailPopup = "ADD-TEAM-MEMBER";
            $scope.teamUser = name;
            $scope.selectedTeam = teamMemberInfo;
            $scope.showPopup = $ionicPopup.alert({
                templateUrl: 'templates/common/popup-caretrail.html',
                scope: $scope,
                cssClass: 'success-popup',
                buttons: [
                    {
                        text: 'OK',
                        onTap: function() {
                            $scope.showPopup.close();
                            $scope.goBackByPageNo(-1);
                        }
                    }
                ]

            });
            return $scope.showPopup;
        }
    }
}
