var socket = null;
var heartBeatCount = 0;
var promiseWebSocket = null;

function connectCareTrailWebSocket($rootScope, $interval) {
	if ($rootScope.SOCKET_OPEN == undefined) {
		$rootScope.SOCKET_OPEN = false;
	}
	var socketURL = CARETRAIL_ENDPOINT + 'group?email=' + $rootScope.userProfile.emailAddress[0] + '&access_token=' + $rootScope.userProfile.accessToken;

	openSocketConnection($rootScope, socketURL);

	if (promiseWebSocket == null) {
		promiseWebSocket = $interval(function () {
			if ($rootScope.SESSION_VALID_IN == true && $rootScope.SOCKET_OPEN == false) {
				openSocketConnection($rootScope, socketURL);
			}
		}, 10000, 0, true, [$rootScope, socket, socketURL]);

		$rootScope.stopWebSocketInterval = function () {
			$interval.cancel(promiseWebSocket);
			promiseWebSocket = undefined;
		};
	}
}

function openSocketConnection($rootScope, socketURL) {
	if ($rootScope.SOCKET_OPEN) return;

	socket = new SockJS(socketURL);
	stompClient = Stomp.over(socket);
	stompClient.debug = null;

	stompClient.connect({}, function (frame) {
		$rootScope.SOCKET_OPEN = true;
		stompClient.subscribe('/user/' + $rootScope.userProfile.emailAddress[0] + "/message", function (event) {
			var newMsg = JSON.parse(event.body);
			processWebSocketMessages($rootScope, newMsg);
		});
	});

	socket.onclose = function () {
		$rootScope.SOCKET_OPEN = false;
	}
}

function processWebSocketMessages($rootScope, newMsg) {
	var currentTab = getRootSelectedTab($rootScope);
	if ((currentTab == "TIMELINE-HOME" || currentTab == "PATIENT-TIMELINE") &&
		(newMsg.messageType == "timeline" || newMsg.messageType == "timelineprivate" || newMsg.patient != null)) {
		processUserNPatientTimelineMessage($rootScope, newMsg, currentTab);
	} else if ((currentTab == "MESSAGE-MYMESSAGE" || currentTab == "MESSAGE-ONETOONECONV") &&
		(newMsg.messageType == "chat" || newMsg.toUser != null)) {
		processOneToOneMessage($rootScope, newMsg, currentTab);
	}
}

function disconnectCareTrailWebSocket() {
	if (socket != null) socket.close();
	socket = null;
}

function processUserNPatientTimelineMessage($rootScope, newMsg, currentTab) {

	newMsg.date = newMsg.createdTimestamp;
	newMsg = renameKey(newMsg, "patient", "toPatient");
	newMsg.fromUser.useravitar = getUserImage($rootScope, newMsg.fromUser.emailAddress);

	if (currentTab == "TIMELINE-HOME") {
		if ($rootScope.homeTimeline == null || $rootScope.homeTimeline.length == 0) {
			$rootScope.homeTimeline = [];
			$rootScope.homeTimeline[0] = newMsg;
		}
		else {
			$rootScope.homeTimeline.splice(0, 0, newMsg);
		}
		return;
	}

	if (currentTab == "PATIENT-TIMELINE" && $rootScope.patient.mrn != newMsg.toPatient.mrn) {
		return;
	}

	if (currentTab == "PATIENT-TIMELINE") {
		if ($rootScope.patientTimeline == null || $rootScope.patientTimeline.length == 0) {
			$rootScope.patientTimeline = [];
			$rootScope.patientTimeline[0] = newMsg;
		}
		else {
			$rootScope.patientTimeline.splice(0, 0, newMsg);
			console.log($rootScope.patientTimeline);
		}
	}

}

function processOneToOneMessage($rootScope, newMsg, currentTab) {

	$rootScope.openedConversationId = -1; //default value of -1 means no conversationionid in process
	$rootScope.newMsgtext = '';

	newMsg.date = newMsg.createdTimestamp;

	if (currentTab == "MESSAGE-MYMESSAGE") {
		var isFound = false;
		for (var i = 0; i < $rootScope.aoConversation.length; i++) {
			if ($rootScope.aoConversation[i].conversationid == newMsg.conversationid && newMsg.conversationid > 0) {
				newMsg.updated_timestmp = new Date();
				$rootScope.aoConversation[i].convHist[0] = newMsg.convHist[0];
				$rootScope.aoConversation[i].read = false;
				isFound = true;
			}
			else if ($rootScope.aoConversation[i].conversationid == newMsg.conversationid && newMsg.conversationid == 0
				&& $rootScope.aoConversation[i].fromUser.userid == newMsg.fromUser.userid
				&& $rootScope.aoConversation[i].toUser.userid == newMsg.toUser.userid) {
				newMsg.updated_timestmp = new Date();
				$rootScope.aoConversation[i].convHist[0] = newMsg.convHist[0];
				$rootScope.aoConversation[i].read = false;
				isFound = true;
			}
		}

		if (!isFound) {
			// If we get a message without a conversationid, ignore it, 
			// since we can't interact with it anyway without a refresh
		}
	}
	else if (currentTab == "MESSAGE-ONETOONECONV" &&
		(newMsg.fromUser.userid == $rootScope.oneToOneMember.userid || newMsg.toUser.userid == $rootScope.oneToOneMember.userid)) {
		newMsg.convHist[0].isSameUser = (newMsg.convHist[0].fromUser.emailAddress == $rootScope.userProfile.emailAddress[0]) ? true : false;
		newMsg.convHist[0].fromUser.userid = newMsg.fromUser.userid;
		newMsg.convHist[0].fromUser.useravitar = getUserImage($rootScope, newMsg.convHist[0].fromUser.emailAddress);
		newMsg.convHist[0].fromUser.userName = newMsg.fromUser.username;
		newMsg.convHist[0].fromUser.lastName = newMsg.fromUser.lastName;
		newMsg.convHist[0].created_timestmp = newMsg.convHist[0].createdTimestamp;
		var curDate = new Date();

		$rootScope.openedConversationId = newMsg.conversationid;
		$rootScope.newMsgtext = newMsg.convHist[0].text;

		newMsg.convHist[0].conv_Histid = curDate.getTime();
		$rootScope.aoOneToOneConv[$rootScope.aoOneToOneConv.length] = newMsg.convHist[0];
		$rootScope.aoOneToOneConv[$rootScope.aoOneToOneConv.length - 1].isRecent = true;

		// If the previous message is by the same user and within 60 seconds, mark it so we can do special UI stuff
		if ($rootScope.aoOneToOneConv.length > 1) {
			var curItem = $rootScope.aoOneToOneConv[$rootScope.aoOneToOneConv.length - 1];
			var prevItem = $rootScope.aoOneToOneConv[$rootScope.aoOneToOneConv.length - 2];
			if (prevItem.fromUser.userid == curItem.fromUser.userid && curItem.created_timestmp - prevItem.created_timestmp <= 60000) {
				$rootScope.aoOneToOneConv[$rootScope.aoOneToOneConv.length - 2].withinNextDateRange = true;
				$rootScope.aoOneToOneConv[$rootScope.aoOneToOneConv.length - 1].withinPriorDateRange = true;
			}
		}
	}

	$rootScope.$apply();
}



