angular.module('statchat.message-controller', ['ngResource', 'ionic'])
    .constant('ApiEndpoint', {

    })

    .controller('MessageCtrl', function($rootScope, $scope, $window, $stateParams, $state, UserControllerService,
        MessageControllerService, $ionicPopover, $ionicLoading, $ionicHistory,
        $ionicPopup, $cordovaCamera, $ionicModal, $interval, $timeout) {

        var msg = this;
        msg.searchValue = '';
        var resultsCollection = [];
        msg.aoSearchResults = [];

        $scope.isLoading = false;
        $scope.searchInput = false;

        msg.hideContactInfoOnLoad = function() {
            var listItems = document.querySelectorAll(".contact-info-panel");
            for (var i = 0; i < listItems.length; i++) {
                hidePanel(listItems[i]);
            }
        }

        msg.showContactInfo = function(nodeListIndex) {
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

        if (msg.searchValue.length = 0) {
            msg.aoSearchResults = '';
        }

        //Functionality to search for user.
        msg.searchForUser = function(searchValue) {
            $scope.isLoading = true;
            $scope.selectedTab = "MESSAGE-SEARCH";
            UserControllerService.searchUserByName(searchValue)
                .then(function searchUserByNameSuccess(usersResults) {
                    $scope.isLoading = false;
                    resultsCollection = usersResults;
                    msg.aoSearchResults = resultsCollection.sort(CompareForSort);

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

                    markCleanPhoneNumbers(msg.aoSearchResults);
                })
                .catch(function searchUserByNameFailure(errorMessage) {
                    $scope.isLoading = false;
                    console.log(errorMessage);
                });
        }

        reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state);

        $scope.selectedTab = "MESSAGE-MYMESSAGE";

        $scope.showMessages = function($event) {
            $scope.selectedTab = "MESSAGE-MYMESSAGE";
            $rootScope.selectedTab = $scope.selectedTab;
            handleMessagingPanel($scope, UserControllerService, MessageControllerService, $ionicPopup, $ionicPopover, $window, $cordovaCamera, $ionicModal, $rootScope, $state, $ionicLoading);
            fixAvatar($scope, $timeout);
        };

        $scope.onHoldSearchToggle = function() {
            if (window.plugins && window.plugins.toast) {
                window.plugins.toast.showWithOptions(
                    {
                        message: "Start New Chat",
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -40
                    }
                );
            }
        }

        $scope.showMessages();
        $scope.toggleSearchInput = function() {
            msg.searchTerm = '';
            $scope.searchInput = !$scope.searchInput;
        };

        setDefaults("MESSAGES", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup, UserControllerService, $window, $rootScope);

    })
    .controller('OneToOneConversationCtrl', function($rootScope, $scope, $window, $stateParams, $state, UserControllerService,
        MessageControllerService, $ionicPopover, $ionicLoading, $ionicHistory,
        $ionicPopup, $cordovaCamera, $ionicModal, $interval, $timeout, $ionicScrollDelegate) {
        reFillRootScopeObject(UserControllerService, $scope, $rootScope, $ionicPopup, $window, $state);
        autoExpandChatBox($scope);
        handleImagePopover($scope, $ionicModal, $rootScope);
        captureImageScope($scope, $cordovaCamera, $ionicPopup, $rootScope);

        $scope.selectedTab = "MESSAGE-ONETOONECONV";

        if ($rootScope.oneToOneMember == undefined || $rootScope.oneToOneMember == null) {
            if (JSON.parse($window.localStorage['ONE_TO_ONE_MEMBER'] != undefined)) {
                $rootScope.oneToOneMember = JSON.parse($window.localStorage["ONE_TO_ONE_MEMBER"]);
            }
        }
        $scope.oneToOneMember = $rootScope.oneToOneMember;
        setPaginationByOneToOneConvInScope($scope, MessageControllerService, $ionicPopup, $rootScope, $ionicLoading, $timeout);

        $scope.showOneToOneConv = function($event) {
            $scope.selectedTab = "MESSAGE-ONETOONECONV";
            $rootScope.selectedTab = $scope.selectedTab;
            $scope.paginateOneToOneConv().then(function() {
                fixAvatar($scope, $timeout);
                $ionicScrollDelegate.scrollBottom();
                $scope.$on('scroll.refreshComplete', $scope.rearrangeAvatar);
            });
            postOneToOneConv($scope, MessageControllerService, $ionicPopup, $window, $rootScope, $ionicLoading, $ionicScrollDelegate);
        };

        $scope.showOneToOneConv();

        setDefaults("MESSAGES", $scope, $ionicLoading, $ionicHistory, $state, $ionicPopover, $ionicPopup,
            UserControllerService, $window, $rootScope);

        $scope.$on('$locationChangeStart', function(event, next, current) {
            if (current.match("\/one-to-one-conv")) {
                var messageInfo = {
                    "conversation": {
                        "conversationid": $rootScope.oneToOneMember.conversationid
                    },
                    "participant": {
                        "userid": $rootScope.userProfile.userid
                    },
                    "read": "true"
                }

                if (messageInfo.conversation.conversationid != null) {
                    MessageControllerService.markMessageAsRead(messageInfo).then(function(response) {
                        if (showErrowMsg(response, $scope, $ionicPopup, null, $rootScope, null)) return;
                    });
                }
            }
        });
    });
