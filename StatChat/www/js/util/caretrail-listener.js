
var promiseUnReadTask;
var promiseUnReadMessage;

function initCARETRAILListener($scope, $rootScope, UserControllerService, MessageControllerService, $window, $interval, $ionicPopup) {
    if ($rootScope.FIRSTCALL != undefined && !$rootScope.FIRSTCALL) {
        return;
    }
    startListener($window);
    initUnReadTaskListener($scope, $rootScope, UserControllerService, $window, $interval);
    initUnReadMessageListener($scope, $rootScope, MessageControllerService, $window, $interval);
}



function startListener($window) {
    $window.localStorage['START_LISTENER'] = "STARTED";
}

function checkListernerStatus($window) {
    return $window.localStorage['START_LISTENER'];
}

function stopListener($window, $scope) {
    $window.localStorage['START_LISTENER'] = null;
    if ($scope != undefined && $scope != null) {
        $scope.stopUnReadTaskInterval();
        $scope.stopUnReadMessageInterval();
    }
}

function renameKey(json, fromName, toName) {
    var keys = Object.keys(json);
    for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = json[key];
        delete json[key];
        key = key.replace(fromName, toName);
        json[key] = value;
    }
    return json;
}

function initUnReadTaskListener($scope, $rootScope, UserControllerService, $window, $interval) {

    promiseUnReadTask = $interval(function () {
        if (!checkListernerStatus($window) || !getAppStatus($rootScope)) {
            return;
        }
        UserControllerService.getNoOfUnReadTask($rootScope.userProfile.userid).then(function (response) {
            if (isErrorInListener($scope, $window, response)) {
                return;
            }
            var noOfTask = response.data;
            if (noOfTask && $.isNumeric(noOfTask) && parseInt(noOfTask) > 0) {
                $rootScope.taskUnRead = noOfTask;
            }
            else {
                delete $rootScope.taskUnRead;
            }
        });
    }, 60000); //1min - 60000

    $scope.stopUnReadTaskInterval = function () {
        $interval.cancel(promiseUnReadTask);
        promiseUnReadTask = undefined;
    };
}

function initUnReadMessageListener($scope, $rootScope, MessageControllerService, $window, $interval) {

    promiseUnReadMessage = $interval(function () {
        if (!checkListernerStatus($window) || !getAppStatus($rootScope)) {
            return;
        }
        MessageControllerService.getNoOfUnReadMessage($rootScope.userProfile.userid).then(function (response) {
            if (isErrorInListener($scope, $window, response)) {
                return;
            }
            var noOfMessage = response.data;
            if (noOfMessage && $.isNumeric(noOfMessage) && parseInt(noOfMessage) > 0) {
                $rootScope.messageUnRead = noOfMessage;
            }
            else {
                delete $rootScope.messageUnRead
            }
        });
    }, 60000); //1min - 60000

    $scope.stopUnReadMessageInterval = function () {
        $interval.cancel(promiseUnReadMessage);
        promiseUnReadMessage = undefined;
    };
}

function isErrorInListener($scope, $window, response) {
    if (response.status == 500) {
        return;
    }
    if (response == "SyntaxError: JSON Parse error: Unable to parse JSON string" || (response.status >= 400 && response.status <= 404)) {
        stopListener($window, $scope);
        return true;
    }
    return false;
}
