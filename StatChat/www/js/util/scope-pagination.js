
function setPaginationByUserTimeLineInScope($scope, UserControllerService, $ionicPopup, $rootScope, $ionicLoading) {
    $scope.userTimelinePageNo = 0;
    $scope.loadUserTimeLine = true;
    $scope.firstCall = true;

    $scope.paginateUserTimeline = function() {
        if ($scope.userTimelinePageNo === 0 && !$scope.isRefresh) {
            $scope.isLoading = true;
        }

        UserControllerService.timeLineList($rootScope.userProfile.emailAddress[0], $scope.userTimelinePageNo).then(function(response) {
            if ($scope.selectedTab == 'TIMELINE-HOME') {
                $scope.isLoading = false;
            }
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                return;
            }
            var homeTimeline = response.data;
            if ($scope.userTimelinePageNo == 0) {
                $scope.homeTimeline = [];
            }
            $scope.userTimelinePageNo++;
            if (homeTimeline != undefined && homeTimeline != null && homeTimeline.length > 0) {
                var allHomeTimeline = $scope.homeTimeline;
                if (allHomeTimeline == undefined) {
                    allHomeTimeline = [];
                }
                var j = allHomeTimeline.length;
                for (var i = 0; i < homeTimeline.length; i++) {
                    if (homeTimeline[i].fromUser.useravitar == null) {
                        homeTimeline[i].fromUser.useravitar = getUserImageByUserId($rootScope, homeTimeline[i].fromUser.userid);
                    }
                    allHomeTimeline[j] = homeTimeline[i];
                    if (!allHomeTimeline[j].message) {
                        allHomeTimeline[j].message = "";
                    }
                    allHomeTimeline[j].message = formatText(allHomeTimeline[j].message);
                    j++;
                }

                $rootScope.homeTimeline = allHomeTimeline;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            else {
                $scope.loadUserTimeLine = false;
            }
        });
    };
}

function setPaginationByUserConversationInScope($scope, MessageControllerService, $ionicPopup, $rootScope, $ionicLoading) {
    $scope.userConvPageNo = 0;
    $scope.loadUserConversation = true;

    $scope.paginateAllConversation = function() {
        if ($scope.userConvPageNo === 0) {
            $scope.isLoading = true;
        }

        MessageControllerService.getAllChatConversation($rootScope.userProfile.userid, $scope.userConvPageNo).then(function(response) {
            if (response.status == undefined || response.status == 404) return;
            $scope.isLoading = false;
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                return;
            }
            var aoConversation = response.data;
            if ($scope.userConvPageNo == 0) $rootScope.aoConversation = [];
            $scope.userConvPageNo++;
            if (aoConversation != undefined && aoConversation != null && aoConversation.length > 0) {
                if ($rootScope.aoConversation == undefined) $rootScope.aoConversation = [];
                var j = $rootScope.aoConversation.length;
                for (var i = 0; i < aoConversation.length; i++) {
                    if (aoConversation[i].to_user.userid == $rootScope.userProfile.userid) {
                        // If the "to_user" is the logged-in user, then set them to from_user and vice versa.
                        // This is because, if we don't do this, then in the chat list it will appear as if
                        // they are talking to themselves, since the template relies on the "to_user" data
                        // to display the name/avatar/etc.
                        var cachedToUser = aoConversation[i].to_user;
                        aoConversation[i].to_user = aoConversation[i].from_user;
                        aoConversation[i].from_user = cachedToUser;
                    }

                    if ($rootScope.openedConversationId != -1 &&
                        aoConversation[i].conversationid == $rootScope.openedConversationId &&
                        aoConversation[i].convHist[0].text == $rootScope.newMsgtext) {
                        aoConversation[i].read = true;
                        $rootScope.openedConversationId = -1;
                        $rootScope.newMsgtext = '';
                    }

                    $rootScope.aoConversation[j] = aoConversation[i];
                    j++;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            } else $scope.loadUserConversation = false;
        });
    };
}

function setPaginationByOneToOneConvInScope($scope, MessageControllerService, $ionicPopup, $rootScope, $ionicLoading, $timeout) {
    $scope.oneToOnePageNo = 0;
    $scope.isOneToOneLoaded = false;

    $scope.paginateOneToOneConv = function() {

        if (!$scope.isOneToOneLoaded) {
            $scope.isLoading = true;
        }

        $scope.isOneToOneLoaded = true;

        if ($scope.oneToOnePageNo == 0) $rootScope.aoOneToOneConv = [];

        return MessageControllerService.getOneToOneConversationByUserId($scope.oneToOneMember.userid, $rootScope.userProfile.userid, $scope.oneToOnePageNo)
            .then(function(response) {
                $scope.isLoading = false;
                $scope.oneToOneMember.conversationid = response.data.conversationid;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) {
                    return;
                }
                var conversation = response.data;
                var aoOneToOneConv = conversation.convHist;
                aoOneToOneConv = handleDuplicateOneToOneConv(aoOneToOneConv, $rootScope);
                $scope.oneToOnePageNo++;
                if (aoOneToOneConv != undefined && aoOneToOneConv != null && aoOneToOneConv.length > 0) {
                    if ($rootScope.aoOneToOneConv == undefined) $rootScope.aoOneToOneConv = [];
                    var aoAllOneToOne = [];
                    var nowUnixMSTIme = Date.now();
                    for (var i = aoOneToOneConv.length - 1, j = 0; i > -1; i-- , j++) {
                        aoOneToOneConv[i].isSameUser = (aoOneToOneConv[i].fromUser.userid == $rootScope.userProfile.userid) ? true : false;
                        aoOneToOneConv[i].fromUser = (aoOneToOneConv[i].isSameUser) ? $rootScope.userProfile : $scope.oneToOneMember;
                        aoAllOneToOne[j] = aoOneToOneConv[i];
                        if (j != 0) {
                            aoAllOneToOne[j].withinNextDateRange = false;
                        }
                        aoAllOneToOne[j].withinPriorDateRange = false;
                        aoAllOneToOne[j].isRecent = false;

                        // Mark this message as recent if it's less than an hour old, so we can show a different timestamp
                        if (nowUnixMSTIme - aoAllOneToOne[j].created_timestmp <= 3600000) {
                            aoAllOneToOne[j].isRecent = true;
                        }

                        // If the previous message is by the same user and within 60 seconds, mark it so we can do special UI stuff
                        if (j >= 1) {
                            var curItem = aoAllOneToOne[j];
                            var prevItem = aoAllOneToOne[j - 1];
                            if (prevItem.fromUser.userid == curItem.fromUser.userid && curItem.created_timestmp - prevItem.created_timestmp <= 60000) {
                                aoAllOneToOne[j - 1].withinNextDateRange = true;
                                aoAllOneToOne[j].withinPriorDateRange = true;
                            }
                        }
                    }

                    for (var i = 0, j = aoAllOneToOne.length; i < $rootScope.aoOneToOneConv.length; i++ , j++) {
                        aoAllOneToOne[j] = $rootScope.aoOneToOneConv[i];
                        if (j != 0) {
                            aoAllOneToOne[j].withinNextDateRange = false;
                        }
                        aoAllOneToOne[j].withinPriorDateRange = false;
                        aoAllOneToOne[j].isRecent = false;

                        // Mark this message as recent if it's less than an hour old, so we can show a different timestamp
                        if (nowUnixMSTIme - aoAllOneToOne[j].created_timestmp <= 3600000) {
                            aoAllOneToOne[j].isRecent = true;
                        }

                        // If the previous message is by the same user and within 60 seconds, mark it so we can do special UI stuff
                        if (j >= 1) {
                            var curItem = aoAllOneToOne[j];
                            var prevItem = aoAllOneToOne[j - 1];
                            if (prevItem.fromUser.userid == curItem.userid && curItem.fromUser.created_timestmp - prevItem.created_timestmp <= 60000) {
                                aoAllOneToOne[j - 1].withinNextDateRange = true;
                                aoAllOneToOne[j].withinPriorDateRange = true;
                            }
                        }
                    }
                    $rootScope.aoOneToOneConv = aoAllOneToOne;
                }

                $rootScope.$broadcast('scroll.refreshComplete');
            });
    };
}

function handleDuplicateOneToOneConv(aoOneToOneConv, $rootScope) {
    var aoHoldOneToOne = [];
    var k = 0;
    for (var i = 0; aoOneToOneConv != null && i < aoOneToOneConv.length; i++) {
        if (isConvHistExist($rootScope.aoOneToOneConv, aoOneToOneConv[i].conv_Histid)) {
            continue;
        }
        aoHoldOneToOne[k] = aoOneToOneConv[i];
        k++;
    }
    return aoHoldOneToOne;
}

function isConvHistExist(aoOneToOneConv, convHistId) {
    if (aoOneToOneConv == undefined || aoOneToOneConv == null) return false;
    for (var i = 0; i < aoOneToOneConv.length; i++) {
        if (aoOneToOneConv[i].conv_Histid == convHistId)
            return true;
    }
    return false;
}

function setPaginationByUserTaskInScope($scope, UserControllerService, $ionicPopup, $rootScope, $ionicLoading) {
    $scope.userTaskPageNo = 0;
    $scope.loadUserTask = true;

    $scope.toggleTaskMessage = function(taskMsg) {
        if (taskMsg.fullMessage == undefined) {
            return;
        }
        var flag = taskMsg.isLargeMsg;
        taskMsg.isLargeMsg = !taskMsg.isLargeMsg;
        taskMsg.taskdetails = (flag) ? taskMsg.fullMessage : taskMsg.shortMessage;
    };

    $scope.paginateUserTask = function(incrementPageNo) {

        if ($scope.userTaskPageNo === 0 && !$scope.isRefreshTask) {
            $scope.isLoading = true;

            $scope.isRefresh = false;
            $scope.userTimelinePageNo = 0;
        }

        return UserControllerService.getUserTaskList($rootScope.userProfile.emailAddress[0], $scope.userTaskPageNo).then(function(response) {
            if ($scope.selectedTab == 'TIMELINE-MYTASK') {
                $scope.isLoading = false;
            }
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                return;
            }

            var aoTask = response.data;
            if ($scope.userTaskPageNo == 0) {
                $scope.aoTask = [];
            }

            if (incrementPageNo) {
                // Only increment for the scroll down ("infinite scoll") event.
                $scope.userTaskPageNo++;
            }

            if (aoTask != undefined && aoTask != null && aoTask.length > 0) {
                if ($scope.aoTask == undefined) {
                    $scope.aoTask = [];
                }
                var j = $scope.aoTask.length;
                if (!incrementPageNo) {
                    // If we're not going to the next page, then make sure to only update the last 10 results.
                    // And if we have less than 10, set it to 0 to make sure we don't go into negative numbers.
                    j = j - 10;
                    if (j < 0) {
                        j = 0;
                    }
                }
                else if ($scope.aoTask.length < 10) {
                    // If we are going to the next page, but we have less than 10 results right now, 
                    // then assume that we won't get any new results and set j to 0, so we just update the previous data.
                    j = 0;
                }

                for (var i = 0; i < aoTask.length; i++) {
                    var task = aoTask[i];
                    task.created_by = getMemberByEmailIdROOT(task.created_by, $rootScope);
                    if (task.taskdetails == null) {
                        task.taskdetails = "";
                    }
                    $scope.aoTask[j] = task;
                    j++;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            else {
                $scope.loadUserTask = false;
            }
        });
    };
}

function setPaginationByPatientTimeLineInScope($scope, PatientControllerService, $ionicPopup, $rootScope, $ionicLoading) {

    $scope.patientTimeLinePageNo = 0;
    $scope.loadPatientTimeLine = true;

    $scope.toggleMessage = function(timeline) {
        if (timeline.fullMessage == undefined) return;
        var flag = timeline.isLargeMsg;
        timeline.isLargeMsg = !timeline.isLargeMsg;
        timeline.message = (flag) ? timeline.fullMessage : timeline.shortMessage;
    };

    $scope.paginatePatientTimeLine = function() {
        if ($scope.patientTimeLinePageNo === 0) {
            $scope.isLoading = true;
        }
        PatientControllerService.getPatientTimeline($scope.patient.mrn, $scope.patientTimeLinePageNo).then(function(response) {
            if ($scope.selectedTab == 'PATIENT-TIMELINE') {
                $scope.isLoading = false;
            }
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                return;
            }
            var patientTimeline = response.data;
            $scope.patientTimeLinePageNo++;
            var allPatientTimeline = $scope.patientTimeline;
            if (patientTimeline != undefined && patientTimeline != null && patientTimeline.length > 0) {
                if (allPatientTimeline == undefined) {
                    allPatientTimeline = [];
                }
                var j = allPatientTimeline.length;
                for (var i = 0; i < patientTimeline.length; i++) {
                    if (patientTimeline[i].fromUser.useravitar == null) {
                        patientTimeline[i].fromUser.useravitar = getUserImageByUserId($rootScope, patientTimeline[i].fromUser.userid);
                    }
                    allPatientTimeline[j] = patientTimeline[i];
                    if (allPatientTimeline[j].message == null) {
                        allPatientTimeline[j].message = "";
                    }
                    j++;
                }
                $rootScope.patientTimeline = allPatientTimeline;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            else {
                $scope.loadPatientTimeLine = false;
            }
        });
    };
}

function setPaginationByTeamTimeLineInScope($scope, TeamControllerService, $ionicPopup, $rootScope, $ionicLoading) {

    $scope.teamTimeLinePageNo = 0;
    $scope.loadTeamTimeLine = true;

    $scope.paginateTeamTimeLine = function() {

        if ($scope.teamTimeLinePageNo === 0 && !$scope.isRefreshTeamTimeline) {
            $scope.isLoading = true;
        }

        TeamControllerService.getTeamTimeline($scope.team.teamName.replace(" ", "%20"), $scope.teamTimeLinePageNo).then(function(response) {
            if ($scope.selectedTab == "TEAM-TIMELINE") {
                $scope.isLoading = false;
            }
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                return;
            }

            var teamTimeline = response.data;
            $scope.teamTimeLinePageNo++;
            if (teamTimeline != undefined && teamTimeline != null && teamTimeline.length > 0) {
                if ($scope.teamTimeline == undefined) {
                    $scope.teamTimeline = [];
                }
                var j = $scope.teamTimeline.length;
                for (var i = 0; i < teamTimeline.length; i++) {
                    var task = teamTimeline[i];
                    task.created_by = getMemberByEmailIdROOT(task.created_by, $rootScope);
                    $scope.teamTimeline[j] = task;
                    j++;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            else {
                $scope.loadTeamTimeLine = false;
            }
        });
    };
}

function doRefresh($rootScope, $scope) {
    //Function to refresh user timeline
    $rootScope.getLatestData = function() {

        // TIMELINE TAB //
        if ($scope.selectedTab == 'TIMELINE-HOME') {
            $scope.userTimelinePageNo = 0;
            $scope.isRefresh = true;
            $scope.paginateUserTimeline();
        }
        else if ($scope.selectedTab == 'TIMELINE-MYTASK') {
            $scope.isRefreshTask = true;
            $scope.userTaskPageNo = 0;
            $scope.showTask();
        }
        // MESSAGE TAB //
        else if ($scope.selectedTab == 'MESSAGE-MYMESSAGE') {
            $scope.userTimelinePageNo = 0;
            $scope.paginateAllConversation();
        }
        // PATIENT TABS //
        else if ($scope.selectedTab == 'PATIENT-CURRENT') {
            $scope.showPatientList();
        }
        else if ($scope.selectedTab == 'PATIENT-TIMELINE') {
            $scope.patientTimeLinePageNo = 0;
            $scope.paginatePatientTimeline();
        }
        else if ($scope.selectedTab == 'PATIENT-FOLLOWERS') {
            $scope.showFollowers();
        }
        else if ($scope.selectedTab == 'PATIENT-ON-CALL') {
            $scope.showFollowersOnCall();
        }
        // TEAM TABS //
        else if ($scope.selectedTab == 'TEAMS_MYTEAM') {
            $scope.showTeamList();
        }
        else if ($scope.selectedTab == 'TEAM-TIMELINE') {
            $scope.isRefreshTeamTimeline = true;
            $scope.teamTimeLinePageNo = 0;
            $scope.paginateTeamTimeLine();
        }
        else if ($scope.selectedTab == 'TEAM-PATIENT') {
            $scope.showPatients();
        }
        else if ($scope.selectedTab == 'TEAM-MEMBER') {
            $scope.showMembers();
        }

        $rootScope.$broadcast('scroll.refreshComplete');

    }
}

function formatText(text) {
    //var pattern = /(HTTP:\/\/|HTTPS:\/\/)([a-zA-Z0-9.\/&?_=!*,\(\)+-]+)/i;
    //var replace = "<a href=\"$1$2\">$1$2</a>";

    var regex = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
    var replace = "<a href=\"tel:$&\">$&</a>";
    return text.replace(regex, replace);
    //return text.replace(pattern , replace);
}

function fixAvatar($scope, $timeout) {
    $scope.rearrangeAvatar = function() {
        $(function() {
            $timeout(function() {
                $('ion-item.avatar > img:not(.avatar-image)')
                    .addClass('avatar-image')
                    .addClass('center-image');
            }, 50);
        });
        return true;
    };
}
