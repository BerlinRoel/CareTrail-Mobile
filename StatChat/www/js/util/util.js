
function getCARETRAILHeader($window) {
    if ($window.localStorage['USER__PROFILE'] == undefined
        || $window.localStorage['USER__PROFILE'] == null
        || $window.localStorage['USER__PROFILE'] == "") return null;

    var userProfile = JSON.parse($window.localStorage['USER__PROFILE']);
    var careTrailHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': userProfile.accessToken,
        'From': userProfile.emailAddress
    };
    return careTrailHeader;
}


function setDateOfBirth($scope) {
    //dob starts test
    var numberOfYears = (new Date()).getFullYear();

    var yyyy = [];
    var startingYear = numberOfYears - 105;
    for (var i = startingYear; i <= numberOfYears; i++) {
        yyyy.push(i);
    }
    var mmm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dd = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    //for(var i=1;i<32;i++) {
    //	  dd.push(i);
    // }
    var isLeapYear = function () {
        var yyyy = (document.getElementById('selectedYear').value).split(':')[1] || 0;
        return ((yyyy % 400 === 0 || yyyy % 100 !== 0) && (yyyy % 4 === 0)) ? 1 : 0;
    }

    var getNumberOfDaysInMonth = function () {
        //alert($scope.SelectedMonth)

        var selectedMonth = (document.getElementById('SelectedMonth').value).split(':')[1] || 0;
        // alert(selectedMonth)
        if (selectedMonth == 'Jan') { selectedMonth = 1 }; if (selectedMonth == 'Feb') { selectedMonth = 2 };
        if (selectedMonth == 'Mar') { selectedMonth = 3 }; if (selectedMonth == 'Apr') { selectedMonth = 4 };
        if (selectedMonth == 'May') { selectedMonth = 5 }; if (selectedMonth == 'Jun') { selectedMonth = 6 };
        if (selectedMonth == 'Jul') { selectedMonth = 7 }; if (selectedMonth == 'Aug') { selectedMonth = 8 };
        if (selectedMonth == 'Sep') { selectedMonth = 9 }; if (selectedMonth == 'Oct') { selectedMonth = 10 };
        if (selectedMonth == 'Nov') { selectedMonth = 11 }; if (selectedMonth == 'Dec') { selectedMonth = 12 };
        //alert(selectedMonth);
        return 31 - ((selectedMonth === 2) ? (3 - isLeapYear()) : ((selectedMonth - 1) % 7 % 2));
    }
    var getMonth = function () {
        //alert($scope.SelectedMonth)

        var selectedMonth = (document.getElementById('SelectedMonth').value).split(':')[1] || 0;
        // alert(selectedMonth)
        if (selectedMonth == 'Jan') { selectedMonth = 0 }; if (selectedMonth == 'Feb') { selectedMonth = 1 };
        if (selectedMonth == 'Mar') { selectedMonth = 2 }; if (selectedMonth == 'Apr') { selectedMonth = 3 };
        if (selectedMonth == 'May') { selectedMonth = 4 }; if (selectedMonth == 'Jun') { selectedMonth = 5 };
        if (selectedMonth == 'Jul') { selectedMonth = 6 }; if (selectedMonth == 'Aug') { selectedMonth = 7 };
        if (selectedMonth == 'Sep') { selectedMonth = 8 }; if (selectedMonth == 'Oct') { selectedMonth = 9 };
        if (selectedMonth == 'Nov') { selectedMonth = 10 }; if (selectedMonth == 'Dec') { selectedMonth = 11 };
        //alert(selectedMonth);
        return selectedMonth;
    }

    $scope.UpdateNumberOfDays = function () {
        //alert(getNumberOfDaysInMonth())
        $scope.NumberOfDays = getNumberOfDaysInMonth();
        //$scope.SelectedDay=$scope.dd[0];
        $scope.SelectedMonth = (document.getElementById('SelectedMonth').value).split(':')[1];
        $scope.SelectedYear = (document.getElementById('selectedYear').value).split(':')[1];

        $scope.calculatedAge = function () { // birthday is a date
            //alert($scope.SelectedYear +''+$scope.yyyy);
            //alert();
            //debugger;
            //var birthday = new Date((document.getElementById('selectedYear').value).split(':')[1],getMonth(),(document.getElementById('SelectedDay').value).split(':')[1]);
            var birthday = new Date((document.getElementById('selectedYear').value).split(':')[1], 0, 31);
            //(document.getElementById('SelectedMonth').value).split(':')[1],31);
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            return Math.abs(ageDate.getFullYear() - 1970);
        }
    }

    $scope.NumberOfDays = 31;
    $scope.yyyy = yyyy;
    $scope.dd = dd;
    $scope.mmm = mmm;
    $scope.SelectedDay = $scope.dd[0];
    $scope.SelectedMonth = $scope.mmm[0];
    $scope.SelectedYear = $scope.yyyy[0];


    //dob ends


    $scope.calculatedAge = function () { // birthday is a date
        var birthday = new Date((document.getElementById('selectedYear').value).split(':')[1], 0, 31);

        //var birthday = new Date((document.getElementById('selectedYear').value).split(':')[1],getMonth(),(document.getElementById('SelectedDay').value).split(':')[1]);
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
}

function prepareJoinTeamJSON(userDetails, team, $scope, $rootScope) {
    var teamJSON = {
        "username": userDetails.userName,
        "lastName": userDetails.lastName,
        "emailAddress": angular.isArray(userDetails.emailAddress) ? userDetails.emailAddress[0] : userDetails.emailAddress,
        "useravitar": ($scope.selectedTab != undefined && $scope.selectedTab == "TEAM-MEMBER"
            && userDetails.emailAddress != $rootScope.userProfile.emailAddress[0]) ? "SEND_PUSH_NOTIFICATION" : null,
        "team": [
            {
                "teamName": team.teamName,
                "teamId": team.teamid

            }
        ]
    }
    return teamJSON;
}

function getPatientNameArray(aoPatient) {
    if (aoPatient == null || aoPatient.length == 0) return "";
    var patientArrStr = "";
    for (var i = 0; i < aoPatient.length; i++)
        patientArrStr += aoPatient[i].mrn + ",";
    return patientArrStr;
}

function prepareFollowPatientJSON(userDetails, patient) {
    return {
        "emailAddress": angular.isArray(userDetails.emailAddress) ? userDetails.emailAddress[0] : userDetails.emailAddress,
        "patient": [{
            "mrn": patient.mrn,
            "patientid": patient.patientid
        }]
    }
}

function removeTeamById(aoTeam, teamId) {
    if (aoTeam == null || aoTeam.length == 0) return aoTeam;
    var selectedTeamId = findTeamById(aoTeam, teamId);
    if (selectedTeamId != -1) aoTeam.splice(selectedTeamId, 1);
    return aoTeam;
}

function removePatientById(aoPatient, patientId) {
    if (aoPatient == null || aoPatient.length == 0) return aoPatient;
    var selectedPatientId = findPatientById(aoPatient, patientId);
    if (selectedPatientId != -1) aoPatient.splice(selectedPatientId, 1);
    return aoPatient;
}
function removeFollowersById(aoFollowers, userid) {
    if (aoFollowers == null || aoFollowers.length == 0) return aoFollowers;
    var selectedFollowersId = findFollowersById(aoFollowers, userid);
    if (selectedFollowersId != -1) aoFollowers.splice(selectedFollowersId, 1);
    return aoFollowers;
}

function findTeamById(aoTeam, teamId) {
    if (aoTeam == null || aoTeam.length == 0) return -1;
    for (var i = 0; i < aoTeam.length; i++) {
        if (aoTeam[i].teamid == teamId) return i;
    }
    return -1;
}

function findPatientById(aoPatient, patientId) {
    if (aoPatient == null || aoPatient.length == 0) return -1;
    for (var i = 0; i < aoPatient.length; i++) {
        if (aoPatient[i].patientid == patientId) return i;
    }
    return -1;
}
function findFollowersById(aoFollowers, userid) {
    if (aoFollowers == null || aoFollowers.length == 0) return -1;
    for (var i = 0; i < aoFollowers.length; i++) {
        if (aoFollowers[i].userid == userid) return i;
    }
    return -1;
}
function markMyTeam(aoUserTeam, aoAllTeam) {

    if (aoAllTeam == null || aoAllTeam.length == 0) return aoAllTeam;

    if (aoUserTeam == null || aoUserTeam.length == 0) {
        for (var i = 0; i < aoAllTeam.length; i++) {
            aoAllTeam[i].isMyTeam = false;
        }
        return aoAllTeam;
    }

    for (var i = 0; i < aoAllTeam.length; i++)
        aoAllTeam[i].isMyTeam = (findTeamById(aoUserTeam, aoAllTeam[i].teamid) >= 0) ? true : false;

    return aoAllTeam;

}

function markMyPatient(aoUserPatient, aoAllPatient) {
    if (aoAllPatient == null || aoAllPatient.length == 0) return aoAllPatient;

    if (aoUserPatient == null || aoUserPatient.length == 0) {
        for (var i = 0; i < aoAllPatient.length; i++)
            aoAllPatient[i].isMyPatient = false;
        return aoAllPatient;
    }

    for (var i = 0; i < aoAllPatient.length; i++)
        aoAllPatient[i].isMyPatient = (findPatientById(aoUserPatient, aoAllPatient[i].patientid) >= 0) ? true : false;

    return aoAllPatient;

}

function checkOnCallStatus(aoFollowers, aoOnCallFollowers) {
    var newCollection = [];
    if (aoFollowers != null && aoOnCallFollowers != null) {
        for (var i = 0; i < aoFollowers.length; i++) {

            for (var j = 0; j < aoOnCallFollowers.length; j++) {
                if (aoFollowers[i].emailAddress == aoOnCallFollowers[j].onCallUser.emailAddress) {
                    aoFollowers[i].isOnCall = true;
                    newCollection.push(aoFollowers[i]);
                }
            }
        }
    }
    return aoFollowers;
}


function setBack($scope, $ionicHistory) {
    $scope.goBack = function () {
        $ionicHistory.goBack(-1);
    };

    $scope.goBackByPageNo = function (pageNo) {
        event.preventDefault();
        $ionicHistory.goBack(pageNo);
    };

}


function clearSearch($scope) {
    $scope.clearSearch = function (searchValue) {
        if (searchValue) {
            $scope.teamInfo.teamSearch = "";
        }
    };
}

//Function to automatically reset a list item after being swiped left.
function resetSwipedLeftItem() {
    var listItem = document.querySelectorAll(".item-right-editable .item-content");
    for (i = 0; i < listItem.length; i++) {
        if (listItem[i].style.webkitTransform != "translate3d(0px, 0px, 0px)") {
            listItem[i].style.webkitTransform = "translate3d(0px, 0px, 0px)";
        }
    }
}

function updateTaskStatus(aoTask, task) {
    for (var i = 0; i < aoTask.length; i++) {
        if (aoTask[i].taskId == task.taskId) {
            aoTask[i].read = task.read;
        }
    }
}

function markUserPatient(aoUserPatient, aoAllPatient) {
    for (var i = 0; i < aoAllPatient.length; i++) {
        aoAllPatient[i].isMyPatient = isUserPatient(aoUserPatient, aoAllPatient[i]);
        aoAllPatient[i].userPatientStyle = aoAllPatient[i].isMyPatient ? 'selected-patient-bg' : '';
    }
}

function isUserPatient(aoUserPatient, patient) {
    for (var i = 0; i < aoUserPatient.length; i++) {
        if (aoUserPatient[i].mrn == patient.mrn) {
            return true;
        }
    }
    return false;
}

function markCleanPhoneNumbers(users) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].phoneNumber != null && users[i].phoneNumber != '') {
            markCleanPhoneNumber(users[i]);
        }
    }
}

function markCleanPhoneNumber(user) {
    if (user.phoneNumber != null && user.phoneNumber != '') {
        user.displayPhoneNumber = getDisplayPhoneNumber(user.phoneNumber);
        user.phoneNumber = getCleanPhoneNumber(user.phoneNumber);
    }
}

// Converts phone number to a standard format: (xxx) xxx-xxxx
// Note: Only parses phone numbers that don't have dashes, since the dashes could be anywhere
function getDisplayPhoneNumber(phoneNumber) {
    if (phoneNumber.indexOf('-') == -1) {
        if (phoneNumber.length == 7) { // eg: 4567890 
            return phoneNumber.replace(/(\d{3})(\d{4})/, '$1-$2');
        }
        else if (phoneNumber.length == 10) { // eg: 1234567890
            return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        else if (phoneNumber.length == 11 && phoneNumber.charAt(0) == '1') { // eg: 11234567890, aka 1 123-456-7890
            newNumber = phoneNumber.substr(1);
            return newNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        else if (phoneNumber.length == 15 && phoneNumber.substring(0, 5) == 'tel:+') { // eg: tel:+1234567890, aka tel:+ 123-456-7890
            newNumber = phoneNumber.substr(5);
            return newNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }

        else if (phoneNumber.length == 16 && phoneNumber.substring(0, 6) == 'tel:+1') { // eg: tel:+11234567890, aka tel: +1 123-456-7890
            newNumber = phoneNumber.substr(6);
            return newNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        else {
            return phoneNumber;
        }
    }
    else {
        return phoneNumber;
    }
}

// Removes the "tel:+" from the start of the phone number
function getCleanPhoneNumber(phoneNumber) {
    if (phoneNumber.substring(0, 5) == 'tel:+') { // eg: tel:+1234567890, aka tel:+ 123-456-7890
        return phoneNumber.substr(5);
    }
    else {
        return phoneNumber;
    }
}