function handleUserChatBox($scope, UserControllerService, $ionicPopup, $ionicPopover, $window, $cordovaCamera, $ionicModal, $rootScope, $ionicScrollDelegate) {
    if ($scope.selectedTab == "TIMELINE-HOME") buildPatientListPopOverForChat($scope, UserControllerService, $ionicPopup, $ionicPopover, $window);
    postMessageToTimeline($scope, UserControllerService, $ionicPopup, $window, $rootScope);
    handlePostButton($scope);
    autoExpandChatBox($scope);
    handleImagePopover($scope, $ionicModal, $rootScope);
    captureImageScope($scope, $cordovaCamera, $ionicPopup, $rootScope);
    if ($scope.selectedTab == "TIMELINE-HOME") setTimelineChatBox($scope, $rootScope, $ionicScrollDelegate);
}

function handleChatBoxDisplayFields($scope) {
    markHighImportance($scope);
    if ($scope.selectedTab == "TIMELINE-HOME") selectAndUnSelectPatient($scope);
    clearChatBox($scope);
    return '';
}

function markHighImportance($scope) {
    var highImportance = false;
    $scope.highImportance = "button-dark";
    $scope.setEmergencyAlert = function() {
        if (highImportance) $scope.highImportance = "button-dark";
        else $scope.highImportance = "button-assertive";
        highImportance = !highImportance;
    }
}

function buildPatientListPopOverForChat($scope, UserControllerService, $ionicPopup, $ionicPopover, $window) {
    $ionicPopover.fromTemplateUrl('templates/user/timeline_footer_users.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.footerUsersPopOver = popover;
    });
    $scope.showPatient = function() {
        $scope.footerUsersPopOver.show();
    }
}

function selectAndUnSelectPatient($scope) {
    $scope.showCloseIcon = false;
    $scope.setPatient = function(patient) {
        $scope.footerUsersPopOver.hide();
        $scope.patient = patient;
        $scope.showCloseIcon = true;
        $scope.showPostButton();
    }
    $scope.removePatient = function($event) {
        $scope.patient = null;
        $scope.showCloseIcon = false;
        $scope.showPostButton();
    }
}

function clearChatBox($scope) {
    $scope.showCloseIcon = false;
    $scope.userMessage = "";
    $scope.highImportance = "button-dark";
    $scope.imagePopup = false;
    $scope.postButton = false;
    if ($scope.selectedTab != "PATIENT-TIMELINE") $scope.patient = null;
    if ($scope.selectedTab == "TIMELINE-HOME") {
        $scope.userMessage = "@";
    } else if ($scope.selectedTab == "TIMELINE-MYTASK") {
        $scope.taskMember = null;
        document.getElementById('taskDesc').value = "";
        $scope.showMember = false;
    } else if ($scope.selectedTab == "MESSAGE-MYMESSAGE") {
        $scope.taskMember = null;
        $scope.showMember = false;
    }
}

function handlePostButton($scope) {
    $scope.postButton = false;
    $scope.showPostButton = function() {
        if ($scope.selectedTab == "PATIENT-TIMELINE") {
            if (document.getElementById("userMessage").value.trim() != "@") $scope.postButton = true;
            else $scope.postButton = false;
            return;
        }
        if ($scope.patient != null && (($scope.userMessage != null && $scope.userMessage.trim() != "@") || $scope.base64images[0] != null)) $scope.postButton = true;
        else $scope.postButton = false;
    }
}

function getPatientMessage($scope) {
    if ($scope.selectedTab == "PATIENT-TIMELINE") {
        return document.getElementById("userMessage").value;
    }

    var patientMsg = "";
    if (document.getElementById("userMessage") != undefined) {
        patientMsg = document.getElementById("userMessage").value;
    }

    var patientName = '@';
    if ($scope.patient != undefined && $scope.patient != null) {
        if ($scope.patient.lastName != null) {
            patientName += $scope.patient.firstName + " " + $scope.patient.lastName;
        } else {
            patientName += $scope.patient.firstName;
        }
    }

    if ($scope.patient == undefined || $scope.patient == null || patientMsg.indexOf(patientName) == -1) {
        return null;
    }

    var onlyMsg = patientMsg.substring(patientName.length + 1, patientMsg.length).trim();
    if (onlyMsg == "") {
        return null;
    }

    return onlyMsg;
}

//This for the Done button keyboard fix
function keyboardHideHandler(e) {
    $('.send').hide();
    $('.patients-post-message').hide();
}

function keyboardShowHandler(e) {
    $('.send').show();
    $('.patients-post-message').show();
}
window.addEventListener('native.keyboardhide', keyboardHideHandler);
window.addEventListener('native.keyboardshow', keyboardShowHandler);

function postMessageToTimeline($scope, UserControllerService, $ionicPopup, $window, $rootScope) {
    $scope.postUserMessage = function() {
        var message = getPatientMessage($scope);

        if ($scope.patient == null) {
            return;
        }

        // There must be a message or an image or both, not neither        
        if ((message == null || message == "") && ($scope.base64images[0] == undefined || $scope.base64images[0] == "")) {
            return;
        }

        var curDate = new Date();
        var messagedata = {
            messageType: "timeline",
            messageId: null,
            message: message, // required
            image: $scope.base64images[0],
            channelName: $scope.patient.mrn, // required
            priority: ($scope.highImportance == "button-dark") ? "0" : "1",
            createdTimestamp: curDate.getTime(),
            patient: {
                mrn: $scope.patient.mrn,
                firstName: $scope.patient.firstName,
                lastName: $scope.patient.lastName,
            },
            fromUser: {
                emailAddress: $rootScope.userProfile.emailAddress[0], // required
                username: $rootScope.userProfile.userName,
                lastName: $rootScope.userProfile.lastName
            }
        };

        if ($scope.selectedTab == 'TIMELINE-HOME-PATIENT-SEARCH') {
            $scope.selectedTab = "TIMELINE-HOME";
        }

        $scope.base64images = [];

        clearChatBox($scope);
        UserControllerService.timeLinePostMessageList(messagedata).then(function(response) {
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
            $scope.showMember == false;
        });
    }
}

function postOneToOneConv($scope, MessageControllerService, $ionicPopup, $window, $rootScope, $ionicLoading, $ionicScrollDelegate) {
    $scope.base64images = [];

    $scope.postOneToOneConv = function() {
        var message = document.getElementById("userMessage").value;
        if (message != null) {
            message = message.trim();
        }
        if (message == "" && $scope.base64images.length <= 0) {
            return;
        }
        $scope.isLoading = true;
        var curDate = new Date();
        var messageJSON = {
            messageType: "chat",
            conversationid: $rootScope.oneToOneMember.conversationid,
            fromUser: {
                emailAddress: $rootScope.userProfile.emailAddress[0],
                userid: $rootScope.userProfile.userid,
                username: $rootScope.userProfile.userName
            },
            toUser: {
                emailAddress: $rootScope.oneToOneMember.emailAddress,
                userid: $rootScope.oneToOneMember.userid
            },
            convHist: [{
                fromUser: {
                    emailAddress: $rootScope.userProfile.emailAddress[0]
                },
                createdTimestamp: curDate.getTime(),
                text: message,
                image: $scope.base64images.length > 0 ? $scope.base64images[0] : ''
            }]
        };
        MessageControllerService.postOneToOneChatMessages(messageJSON).then(function(response) {
            $scope.isLoading = false;
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) {
                return;
            } else {
                $scope.base64images = [];

                $ionicScrollDelegate.scrollBottom();

                // Mark the message as read for the current user
                var messageInfo = {
                    "conversation": {
                        "conversationid": response.data
                    },
                    "participant": {
                        "userid": $rootScope.userProfile.userid
                    },
                    "read": "true"
                }
                MessageControllerService.markMessageAsRead(messageInfo).then(function(response) {
                    if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
                });
            }
        });
        document.getElementById("userMessage").value = "";
    }
}

function autoExpandChatBox($scope) {
    $scope.autoExpandChatBox = function() {
        var element = document.getElementById("userMessage");
        element.style.height = element.scrollHeight + "px";
    }
}

function captureImageScope($scope, $cordovaCamera, $ionicPopup, $rootScope) {
    $scope.base64images = [];

    $scope.addImage = function() {
        $scope.base64images = [];
        if (window.Camera != undefined) {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 2048,
                targetHeight: 1536,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation: true
            };
            $cordovaCamera.getPicture(options).then(function(imageData) {
                $scope.base64images.push(imageData);
            }, function(err) {
                console.log(err);
            });
        }
        else {
            console.log("Camera not supported on this device.");
        }
    }

    $scope.addImagePopup = function() {
        $scope.imagePopup = false;
        if ($scope.selectedTab != 'TIMELINE-MYTASK') {
            $scope.imagePopup = true;
        }
        $scope.addImage();
    }

    $scope.removeImage = function() {
        $scope.base64images = [];
    }
}

function handleImagePopover($scope, $ionicModal, $rootScope) {
    $scope.showImage = function(popoverImage) {
        $scope.popoverImage = popoverImage;
        $ionicModal.fromTemplateUrl('templates/common/popover-image.html', {
            scope: $scope,
            animation: 'scale-in'
        }).then(function(modal) {
            $rootScope.modal = modal;
            $rootScope.modal.show();
        });
    }
    // Close the modal
    $scope.closeModal = function() {
        $rootScope.modal.hide();
        $rootScope.modal.remove();
    }
}

function handleTaskPanel($scope, UserControllerService, $ionicPopup, $ionicPopover, $window, $state, $ionicModal, $rootScope) {
    $scope.boldFont = "text-bold";
    $scope.noClass = "";
    updateTaskStatus($scope, UserControllerService, $ionicPopup, $rootScope);
    setMarkTaskAsRead($scope, UserControllerService, $ionicPopup, $rootScope);
    handleImagePopover($scope, $ionicModal, $rootScope);
    $scope.showCreateTask = function() {
        $state.transitionTo('tab.create-task');
    };
}

function handleCreateTask($scope, UserControllerService, $ionicPopup, $window, $cordovaCamera, $state, $rootScope, $ionicLoading, $ionicModal) {
    $scope.goBackToTask = function() {
        $rootScope.notificationFor = "TASK";
        $state.go('tab.timeline', {}, {
            reload: false
        });
    }
    createTask($scope, UserControllerService, $ionicPopup, $window, $state, $rootScope, $ionicLoading);
    captureImageScope($scope, $cordovaCamera, $ionicPopup, $rootScope);
    handleImagePopover($scope, $ionicModal, $rootScope);
    $scope.base64images = [];

    $scope.showPatientDropDown = false;
    $scope.searchingPatients = false;
    $scope.aoPatients = null;

    $scope.showMemberDropDown = false;
    $scope.searchingMembers = false;
    $scope.aoMembers = null;
    $scope.isCreateTask = false;
    var boolPriority = false;

    $scope.searchPatientByName = function(task) {
        $scope.searchingPatients = true;
        UserControllerService.searchPatientByName(task.patientSearch)
            .then(function(response) {
                $scope.searchingPatients = false;
                if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) return;
                if (response.data == null || response.data.length == 0) {
                    $scope.aoPatients = [];
                }
                else {
                    $scope.showPatientDropDown = true;
                    $scope.aoPatients = markMyPatient($scope.aoPatients, response.data);
                    $scope.showPatientErrMsg = "";
                    setIsCreateTask($scope, task, true);
                }
            });
    };

    $scope.managePatientBlur = function() {
        if ($scope.showPatientDropDown) {
            $scope.showPatientDropDown = false;
        }
    }

    $scope.selectPatient = function(patient, task) {
        if (patient.lastName != null) {
            task.patientSearch = patient.firstName + " " + patient.lastName;
        } else {
            task.patientSearch = patient.firstName;
        }
        task.memberSearch = "";
        $scope.memberPlaceHolder = "";
        $scope.showPatientDropDown = false;
        $scope.taskPatient = patient;
        $scope.taskMember = null;
        setIsCreateTask($scope, task, false);
    };

    $scope.searchMemberByName = function(task) {
        $scope.searchingMembers = true;
        UserControllerService.searchUserByName(task.memberSearch)
            .then(function(response) {
                $scope.searchingMembers = false;
                $scope.aoMembers = response;
                if ($scope.aoMembers.length) {
                    markCleanPhoneNumbers($scope.aoMembers);
                    $scope.showMemberDropDown = true;

                    setIsCreateTask($scope, task, true);
                }
                else {
                    $scope.showMemberDropDown = false;
                }
            });
    };

    $scope.manageMemberBlur = function() {
        if ($scope.showMemberDropDown) {
            $scope.showMemberDropDown = false;
        }
    }

    $scope.selectMember = function(member, task) {
        var name = member.username;
        if (member.lastName != null) {
            name = name + " " + member.lastName;
        }
        task.memberSearch = name;
        $scope.showMemberDropDown = false;
        $scope.taskMember = member;
        setIsCreateTask($scope, task, false);
    };

    $scope.setIsCreateTask = function(task) {
        setIsCreateTask($scope, task, false);
    };
}

function setIsCreateTask($scope, task, isKnownCause) {
    if (isKnownCause) {
        $scope.isCreateTask = false;
        return;
    }
    if (task.patientSearch != undefined && task.memberSearch != undefined && task.taskDesc != undefined && task.patientSearch != "" && task.memberSearch != "" && task.taskDesc != "" && $scope.taskPatient != undefined && $scope.taskPatient != null && $scope.taskPatient.firstName != null && $scope.taskMember != undefined && $scope.taskMember != null && $scope.taskMember.username != null) {
        $scope.isCreateTask = true;
    } else {
        $scope.isCreateTask = false;
    }
}

function createTask($scope, UserControllerService, $ionicPopup, $window, $state, $rootScope, $ionicLoading) {
    $scope.isSubmitting = false;
    $scope.createTask = function(task) {
        $scope.isSubmitting = true;
        $scope.isCreateTask = false;
        if (task == undefined) {
            $scope.isSubmitting = false;
            return;
        }
        var priority = 'NORMAL';
        if (task.prioritySearch) {
            priority = "HIGH";
        }
        var taskData = {
            taskdetails: task.taskDesc,
            image: $scope.base64images[0],
            created_by: $rootScope.userProfile.emailAddress[0],
            priority: priority,
            taskStatus: [{
                status: "NOT_INITIATED"
            }],
            patient: {
                mrn: $scope.taskPatient.mrn
            },
            user: {
                emailAddress: $scope.taskMember.emailAddress
            }
        };
        UserControllerService.createTask(taskData).then(function(response) {
            $scope.isSubmitting = false;
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, $ionicLoading)) {
                return;
            }
            $rootScope.notificationFor = "TASK";
            $rootScope.taskUnRead++;
            $state.go('tab.timeline', {
                "tabName": "TASK"
            }, {
                    reload: true
                });
        });
    }
}

function updateTaskStatus($scope, UserControllerService, $ionicPopup, $rootScope) {
    $scope.updateTaskStatus = function(task) {
        var taskInfo = {
            "taskId": task.taskId,
            "taskStatus": [{
                "status": (task.status[0].status == 'NOT_INITIATED') ? "INITIATED" : "COMPLETED"
            }]
        };
        UserControllerService.updateTaskStatus(taskInfo).then(function(response) {
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
            var holdAoTask = [];
            UserControllerService.getTaskById(task.taskId).then(function(response) {
                for (var i = 0; i < $scope.aoTask.length; i++) {
                    if ($scope.aoTask[i].taskId != task.taskId) holdAoTask[i] = $scope.aoTask[i];
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
}

function setMarkMessageAsRead($scope, MessageControllerService, $ionicPopup, $rootScope) {
    $scope.markMessageAsRead = function(message) {
        if (message.read) return;
        var messageInfo = {
            "conversation": {
                "conversationid": message.conversationid
            },
            "participant": {
                "userid": $rootScope.userProfile.userid
            },
            "read": "true"
        }
        MessageControllerService.markMessageAsRead(messageInfo).then(function(response) {
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
            message.read = messageInfo.read;
            if (message.read) $rootScope.messageUnRead--;
            else $rootScope.messageUnRead++;
        });
    }
}

function setMarkTaskAsRead($scope, UserControllerService, $ionicPopup, $rootScope) {
    $scope.markTaskAsRead = function(task) {
        if (task.read) return;
        var taskInfo = {
            "taskId": task.taskId,
            "read": !task.read
        };
        task.read = taskInfo.read;
        UserControllerService.markTaskAsRead(taskInfo).then(function(response) {
            if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
            task.read = taskInfo.read;
            if (task.read) {
                if ($rootScope.taskUnRead > 0) $rootScope.taskUnRead--;
            } else $rootScope.taskUnRead++;
        });
    }
}

function handleMessagingPanel($scope, UserControllerService, MessageControllerService, $ionicPopup, $ionicPopover, $window, $cordovaCamera, $ionicModal, $rootScope, $state, $ionicLoading) {
    $scope.boldFont = "text-bold";
    $scope.noClass = "";
    $scope.showSearchResult = false;
    setPaginationByUserConversationInScope($scope, MessageControllerService, $ionicPopup, $rootScope, $ionicLoading);
    $scope.showConversationDetailsAndMarkAsRead = function(conversation) {
        $scope.markMessageAsRead(conversation);
        $scope.showConversationDetails(conversation.to_user, conversation.conversationid);
    }
    $scope.showConversationDetails = function(member, conversationid) {
        member.conversationid = conversationid;
        setMemberForOneToOneConv(member, $rootScope, $window);
        $state.transitionTo('tab.one-to-one', {}, {
            reload: true
        });
    }
    setMarkMessageAsRead($scope, UserControllerService, $ionicPopup, $rootScope)
}

function setTimelineChatBox($scope, $rootScope, $ionicScrollDelegate) {
    function keyboardHideHandler(e) {
        var userMessageFld = document.getElementById("userMessage");
        if (userMessageFld && (!userMessageFld.value || !userMessageFld.value.trim())) {
            userMessageFld.value = '@';
        }
        if (userMessageFld && userMessageFld.value && userMessageFld.value.trim().length > 1) {
            if ($scope.patient) {
                userMessageFld.focus();
            }
            var patientName = userMessageFld.value.substr(userMessageFld.value.indexOf("@") + 1, userMessageFld.value.length).trim();
            $scope.aoPatient = searchPatientByName(patientName, $rootScope.rootAoPatient);
        }
        $scope.showSearchOnFocus = false;
    }
    $scope.searchFieldBlur = function() {
        $scope.showSearchOnFocus = true;
        $scope.isFirstCall = true;
        if ($scope.patient) {
            document.getElementById('userMessage').focus();
        }
    };
    $scope.showTimeLineFrmSearch = function() {
        $scope.selectedTab = 'TIMELINE-HOME';
        $scope.isFirstCall = true;
        $scope.showSearchOnFocus = true;
        window.removeEventListener('native.keyboardhide', keyboardHideHandler);
    };
    $scope.isFirstCall = true;
    $scope.showSearchOnFocus = true;
    document.getElementById("userMessage").value = "@";
    $scope.userMessage = "@";
    $scope.searchPatientByName = function() {
        var userMessageFld = document.getElementById("userMessage");
        var enteredValue = userMessageFld.value;
        var inputPatientName = enteredValue.substr(enteredValue.indexOf("@") + 1, enteredValue.length).trim();
        if (patientName == "" || enteredValue.indexOf("@") == -1) {
            $scope.aoPatient = $rootScope.rootAoPatient;
            $scope.selectedTab = 'TIMELINE-HOME-PATIENT-SEARCH';
            $ionicScrollDelegate.scrollTop();
            $scope.postButton = false;
            $scope.patient = undefined;
            return;
        }
        var patientName = '';
        if ($scope.patient != undefined && $scope.patient != null) {
            if ($scope.patient.lastName != null) {
                patientName = $scope.patient.firstName + " " + $scope.patient.lastName;
            } else {
                patientName = $scope.patient.firstName;
            }
        }
        if ($scope.patient != undefined && $scope.patient != null && inputPatientName.indexOf(patientName) != -1) {
            $scope.isFirstCall = true;
            window.removeEventListener('native.keyboardhide', keyboardHideHandler);
            if (getPatientMessage($scope) != null) {
                $scope.postButton = true;
            } else {
                $scope.postButton = false;
            }
            $ionicScrollDelegate.scrollTop();
            return;
        }
        $scope.selectedTab = 'TIMELINE-HOME-PATIENT-SEARCH';
        $scope.aoPatient = [];
        $scope.patient = null;
        $scope.aoPatient = searchPatientByName(inputPatientName, $rootScope.rootAoPatient);
        $scope.manageResults();
        $scope.postButton = false;
        $ionicScrollDelegate.scrollTop();
    };
    $scope.assignPatient = function(patient) {
        $scope.patient = patient;
        window.removeEventListener('native.keyboardhide', keyboardHideHandler);
        $scope.selectedTab = 'TIMELINE-HOME';
        var patientName = '';
        if (patient != undefined && patient != null) {
            if (patient.lastName != null) {
                patientName = patient.firstName + " " + patient.lastName;
            } else {
                patientName = patient.firstName;
            }
        }
        document.getElementById("userMessage").value = "@" + patientName + " ";
        $scope.postButton = false;
    };
    $scope.manageResults = function() {
        if ($scope.aoPatient != null && $scope.aoPatient.length > 0) {
            if ($scope.isFirstCall) {
                window.addEventListener('native.keyboardhide', keyboardHideHandler);
                $scope.isFirstCall = false;
            }
            $scope.showSearchResult = true;
        } else {
            $scope.showSearchResult = false;
        }
    };
    $scope.showAllPatient = function() {
        if ($scope.patient != null || !$scope.showSearchOnFocus) {
            return;
        }
        var userMessageFld = document.getElementById("userMessage");
        if (userMessageFld.value && userMessageFld.value.trim() === '@') {
            userMessageFld.value = '';
            userMessageFld.focus();
            userMessageFld.value = '@';
        }
        $scope.aoPatient = $rootScope.rootAoPatient;
        $scope.selectedTab = 'TIMELINE-HOME-PATIENT-SEARCH';
        $ionicScrollDelegate.scrollTop();
        $scope.manageResults();
    };
    $scope.searchPatientByNamePopUp = function() {
        var patientName = document.getElementById("patientName").value;
        if (patientName == "") return;
        $scope.aoPatient = searchPatientByName(patientName, $rootScope.rootAoPatient);
        if ($scope.aoPatient.length > 0) {
            $scope.showPatientDropDown = true;
        } else {
            $scope.showPatientDropDown = false;
        }
    };
    $scope.assignPatientPopUp = function(patient) {
        $scope.patient = patient;
        $scope.showPatientDropDown = false;
        var patientName = '';
        if (patient != undefined && patient != null) {
            if (patient.lastName != null) {
                patientName = patient.firstName + " " + patient.lastName;
            } else {
                patientName = patient.firstName;
            }
        }
        document.getElementById("patientName").value = patientName;
    };
}