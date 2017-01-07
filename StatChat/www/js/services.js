angular.module('statchat.services', ['ngResource'])
    .factory('Post', function($resource) {
        return null;

    })
    .factory('UserControllerService', function($http, $interval, $timeout, $window, $q) {
        return {
            verifyEmail: function(email) {
                // Required parameters
                if (email === 'undefined' || !email || email == '') {
                    return null;
                }

                var requestData = {
                    "userid": email
                }

                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'auth/verifyEmail',
                    data: requestData
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            login: function(email, password, optPlatform, optPushChannel) {
                // Required parameters
                if (email === 'undefined' || !email || email == '') {
                    return null;
                }
                if (password === 'undefined' || !password || password == '') {
                    return null;
                }

                // Optional parameters
                optPlatform = (typeof optPlatform === 'undefined') ? '' : optPlatform;
                optPushChannel = (typeof optPushChannel === 'undefined') ? '' : optPushChannel;

                var requestData = {
                    "userid": email,
                    "password": password,
                    "supportedModalities": ["Messaging"],
                    "platform": optPlatform,
                    "pushChannel": optPushChannel
                }

                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'auth/authenticate',
                    data: requestData
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            logOut: function(userProfile) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'auth/logout',
                    data: userProfile,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            timeLinePostMessageList: function(postdata) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'messages/sendMessage',
                    data: postdata,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            timeLineList: function(emailAddress, pageNo) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/timeline/' + emailAddress + '/' + pageNo,
                    headers: getCARETRAILHeader($window),
                    timeout: 50000,
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            patientList: function(emailAddress) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/myPatients/' + emailAddress + '/',
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            userTeamList: function(userEmailId) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/myTeams/' + userEmailId + '/',
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getAllTeamList: function(token, userEmailId) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'team/getAllTeam',
                    data: token,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            searchTeamByName: function(token, teamName) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + '/team/getTeamByName/' + teamName,
                    data: token,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            searchPatientByName: function(patientName) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + '/patient/getPatientByName/' + patientName,
                    data: patientName,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            followPatient: function(patientNUserInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + '/people/followPatient',
                    data: patientNUserInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            joinTeam: function(teamNUserInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + '/people/joinTeam',
                    data: teamNUserInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }).catch(function errorCallback(response) {
                    return response;
                });
            },
            addPatient: function(patientInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'people/createPatient',
                    data: patientInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            searchTeamMember: function(teaminfo) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + "people/search?userid=" + teaminfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            addTeamMember: function(teamMemberInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'team/addUserToTeam',
                    data: teamMemberInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            addTeam: function(teamInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'team/createTeam',
                    data: teamInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            watchMessages: function(patientMrnArray) {
                return $http({
                    method: 'GET',
                    timeout: 2500,
                    url: CARETRAIL_ENDPOINT + '/messages/receive/' + patientMrnArray,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            changeStatus: function(statusInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'people/updateStatusAndNote',
                    data: statusInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            createTask: function(taskInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + '/task/create',
                    data: taskInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getTaskById: function(taskId) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + '/task/get/' + taskId,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            updateTaskStatus: function(taskInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + '/task/update',
                    data: taskInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            markTaskAsRead: function(taskInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + '/task/markAsRead',
                    data: taskInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            markMessageAsRead: function(messageInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'messages/markConvAsRead',
                    data: messageInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getUserTaskList: function(userEmailAddress, pageNo) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/myTask/' + userEmailAddress + '/' + pageNo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getNoOfUnReadTask: function(userId) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'task/unread/' + userId,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getAllTeamMembersOfUserTeam: function(userEmailAddress) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/myTeamMembers/' + userEmailAddress + '/',
                    timeout: 50000,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getPatientsNFollowers: function(userEmailAddress) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/myPatientsAndFollowers/' + userEmailAddress + '/',
                    timeout: 50000,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            searchUserByName: function(username) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/searchInCareTrail?userid=' + username,
                    headers: getCARETRAILHeader($window)
                }).then(function searchUserByNameSuccess(response) {
                    return response.data;
                }).catch(function searchUserByNameFalure(response) {
                    return $q.reject('Error finding user. (HTTP status: ' + response.status + ')');
                });
            },
            inviteUser: function(followerInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'registration/user/registration',
                    data: followerInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function inviteUserSuccess(response) {
                    return response;
                }).catch(function inviteUserFailure(response) {
                    return response;
                });
            },
            inviteUserViaSMS: function(followerInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'sms/send',
                    data: followerInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function inviteUserViaSMSSuccess(response) {
                    return response;
                }).catch(function inviteUserViaSMSFailure(response) {
                    return response;
                });
            }
        }
    })
    .factory('PatientControllerService', function($http, $window) {
        return {
            getPatientDetails: function(patientInfomrn) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'patient/getPatient/' + patientInfomrn,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getPatientTimeline: function(patientMRN, pageNo) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'patient/timeline/' + patientMRN + '/' + pageNo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getPatientFollowers: function(patientMRN) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'patient/followers/' + patientMRN + '/',
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getPatientOnCallFollowers: function(patientID) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'oncall/getOnCallSchedule/patient/' + patientID + '/',
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }).catch(function errorCallback(response) {
                    return response;
                });
            },
            getPatientAudits: function(patientMRN) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'audit/patient/task/' + patientMRN + '/',
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            unFollowPatient: function(patientUserInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'people/unfollowPatient',
                    data: patientUserInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            }
        }
    })
    .factory('TeamControllerService', function($http, $window) {
        return {
            getTeamDetails: function(teamname) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + encodeURI(teamname),
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getTeamTimeline: function(teamName, pageNo) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'team/getTeamTask/' + teamName + '/' + pageNo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getTeamPatientList: function(teamName) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'team/getPatients/' + teamName,
                    data: teamName,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            leaveTeam: function(userTeamInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'people/leaveTeam',
                    data: userTeamInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getTeamTeamMemberList: function(teamName) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'team/getMembers/' + teamName,
                    data: teamName,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getTeamMembersOnCall: function(teamID) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'oncall/getOnCallSchedule/team/' + teamID,
                    data: teamID,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }).catch(function errorCallback(response) {
                    return response;
                });
            }

        }
    })
    .factory('MessageControllerService', function($http, $window) {
        return {
            getAllChatConversation: function(userId, pageNo) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'messages/allChatConv/' + userId + '/' + pageNo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getOneToOneConversationByUserId: function(fromUserId, toUserId, pageNo) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'messages/chatHist/' + fromUserId + '/' + toUserId + '/' + pageNo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            postOneToOneChatMessages: function(postdata) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'messages/sendChatMessages',
                    data: postdata,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getMessagesTimeline: function(emailAddress, pageNo) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/chattimeline/' + emailAddress + '/' + pageNo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            markMessageAsRead: function(messageInfo) {
                return $http({
                    method: 'POST',
                    url: CARETRAIL_ENDPOINT + 'messages/markConvAsRead',
                    data: messageInfo,
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            },
            getNoOfUnReadMessage: function(userId) {
                return $http({
                    method: 'GET',
                    url: CARETRAIL_ENDPOINT + 'people/chattimeline/unread/' + userId + '/',
                    headers: getCARETRAILHeader($window)
                }).then(function successCallback(response, data) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
            }
        }
    });
