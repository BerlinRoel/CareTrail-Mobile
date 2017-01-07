
function searchAllMemberByName($scope, UserControllerService) {

    $scope.selectMemberFrmSearchResult = function(obj) {
        var name = obj.username;
        if (obj.lastName != null) {
            name = name + " " + obj.lastName;
        }
        $scope.teamMemberInfo.memberSearch = name;
        $scope.teamMemberInfo.selected = obj;
        $scope.memberSearchDropDown = false;
    };

    $scope.searchMemberByName = function() {
        $scope.teamMemberInfo.isSearching = true;
        $scope.teamMemberInfo.isMemberRequired = false;
        $scope.teamMemberInfo.isMemberNotFound = false;
        $scope.showMemberErr = false;
        UserControllerService.searchUserByName($scope.teamMemberInfo.memberSearch)
            .then(function(response) {
                $scope.teamMemberInfo.isSearching = false;
                $scope.aoMembers = response;
                if ($scope.aoMembers.length) {
                    markCleanPhoneNumbers($scope.aoMembers);
                    $scope.memberSearchDropDown = true;
                } else {
                    $scope.showMemberErr = true;
                    $scope.memberSearchDropDown = false;
                }
            });
    };

}

function searchAllTeamByName($scope, UserControllerService, TeamControllerService, userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout) {
    $scope.teamInfo = {}
    $scope.aoSearchTeam = null;
    $scope.showTeamErr = false;
    $scope.showTeamErrMsg = "";
    $scope.searchTeamByName = function() {
        $scope.teamInfo.isSearching = true;
        if ($scope.teamInfo.teamSearch == "") {
            $scope.showTeamErr = false;
            $scope.showTeamErrMsg = "";
            $scope.aoSearchTeam = [];
            $scope.teamInfo.isSearching = false;
            return;
        }
        UserControllerService.searchTeamByName($scope.teamInfo.teamSearch, $scope.teamInfo.teamSearch)
            .then(function(response) {
                $scope.teamInfo.isSearching = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
                if (response.data == null || response.data.length == 0) {
                    $scope.showTeamErr = true;
                    $scope.aoSearchTeam = [];
                    $scope.showTeamErrMsg = "No teams matched your search query!";
                } else {
                    $scope.aoSearchTeam = markMyTeam($scope.aoTeam, response.data);
                    $scope.showTeamErr = false;
                    $scope.showTeamErrMsg = "";
                }
            });
    };

    joinATeam($scope, UserControllerService, userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout);
    leaveATeam($scope, TeamControllerService, userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout);
}

function joinATeam($scope, UserControllerService, userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout) {

    $scope.joinATeam = function(team) {
        team.isJoining = true;
        var teamUserJson = prepareJoinTeamJSON(userProfile, team, $scope, $rootScope);
        UserControllerService.joinTeam(teamUserJson)
            .then(function(response) {
                team.isJoining = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                }

                team.isMyTeam = true;

                var teamFollowingName = teamUserJson.team[0].teamName;


                if (navigator.notification) {
                    navigator.notification.alert(
                        'You have joined the team ' + teamFollowingName + '.',
                        null,
                        'Join Successful',
                        'OK'
                    );
                }
                else {
                    $scope.careTrailPopup = "JOIN-TEAM-SUCCESS";
                    $scope.teamName = teamFollowingName;
                    $rootScope.showPopup = $ionicPopup.alert({
                        templateUrl: 'templates/common/popup-caretrail.html',
                        cssClass: 'success-popup',
                        scope: $scope,
                        buttons: [
                            {
                                text: 'OK'
                            }
                        ]

                    });
                }
            });
    };
}

function leaveATeam($scope, TeamControllerService, userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout) {

    $scope.leaveATeam = function(team) {
        team.isJoining = true;
        var teamUserJson = prepareJoinTeamJSON(userProfile, team, $scope, $rootScope);
        TeamControllerService.leaveTeam(teamUserJson)
            .then(function(response) {
                team.isJoining = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                }

                team.isMyTeam = false;
            });
    };
}

function searchAllPatientByName($scope, UserControllerService, userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout, $state) {
    $scope.patientInfo = {}
    $scope.showPatientErr = false;
    $scope.aoSearchPatient = [];
    $scope.searchPatientByName = function() {
        $scope.showPatientErr = false;
        $scope.showPatientErrMsg = "";
        console.log($scope.patientInfo.patientSearch);
        if ($scope.patientInfo.patientSearch == "") {
            $scope.aoSearchPatient = [];
            return;
        }
        $scope.patientInfo.isSearching = true;
        UserControllerService.searchPatientByName($scope.patientInfo.patientSearch)
            .then(function(response) {
                $scope.patientInfo.isSearching = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) return;
                if (response.data == null || response.data.length == 0) {
                    $scope.showPatientErr = true;
                    $scope.aoSearchPatient = [];
                    $scope.showPatientErrMsg = "No patients matched your search query!";
                }
                else {
                    $scope.showPatientErr = false;
                    $scope.aoSearchPatient = markMyPatient($scope.aoPatient, response.data);
                    $scope.showPatientErrMsg = "";
                }
            });
    };

    followPatient($scope, UserControllerService, userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout, $state);

}

function followPatient($scope, UserControllerService, userProfile, $ionicPopup, $ionicLoading, $rootScope, $timeout, $state) {


    $scope.followPatient = function(patient) {
        $scope.isFollowingOrUnfollowing = true;
        var patientUserJson = prepareFollowPatientJSON(userProfile, patient);
        UserControllerService.followPatient(patientUserJson)
            .then(function(response) {
                $scope.isFollowingOrUnfollowing = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                    return;
                }
                addPatientToRoot($rootScope, patient);
                if ($scope.selectedTab == 'PATIENT-TIMELINE'
                    || $scope.selectedTab == 'PATIENT-FOLLOWERS'
                    || $scope.selectedTab == 'PATIENT-ON-CALL') {
                    $scope.patient.isMyPatient = true;
                }

                if ($scope.selectedItemState != null && $scope.selectedItemState.selectedItem != null) {
                    if ($scope.selectedItemState.selectedItem.patientId == patient.patientId) {
                        $scope.selectedItemState.selectedItem.isMyPatient = true;
                    }
                }
            }).then(function() {
                var patientName;
                if (patient.lastName != null) {
                    patientName = patient.firstName + " " + patient.lastName;
                }
                else {
                    patientName = patient.firstName;
                }
                $scope.successPopup(patientName);
            });
    };
}




