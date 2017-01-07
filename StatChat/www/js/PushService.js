(function () {

	angular.module('statchat')
		.factory('PushService', ['$ionicPlatform', PushService]);

	function PushService($rootScope) {
		var tokenSuccess = null;

		//========================================//
		//						Public functions  					//
		//========================================//

		//Public function to initialize firebase plugin
		var start = function () {
			_init();
		}

		//plubic function to set user ID
		var setUserId = function (userId) {
			_setUserIdValue(userId);
		}

		var subscribeToTopic = function (topic) {
			_subscribeToTopic(topic);
		}

		//========================================//
		//						Private functions  					//
		//========================================//

		//Private function to initialize firebase plugin
		var _init = function () {
			if (window.cordova && window.cordova.plugins) {
				window.FirebasePlugin.onTokenRefresh(getTokenSuccessCallback, getTokenErrorCallback);
			}
		}

		function getTokenSuccessCallback(token) {
			tokenSuccess = token;
			console.log("token", tokenSuccess);
		};

		function getTokenErrorCallback(error) {
			console.log('Error getting token ' + error);
		};

		function GetToken() {
			return tokenSuccess;
		}

		//Private function to set user ID
		var _setUserIdValue = function (userIdValue) {
			window.FirebasePlugin.setUserId(userIdValue, setIdSuccess, setIdError);
		}

		function setIdSuccess() {
			console.log('User Id set succesfully');
		}

		function setIdError(error) {
			console.log('There was an error setting the user id ' + error);
		}

		//Private function used to subscribe to a specific topic
		var _subscribeToTopic = function (topicName) {
			window.FirebasePlugin.subscribe(topicName, subscribeSuccess, subscribeError);
		}

		function subscribeSuccess() {
			console.log('Subscribed to topic successfully!');
		}

		function subscribeError(error) {
			console.log('Error subscribing to topic. ' + error);
		}

		var _onNotificationOpen = function () {
			window.FirebasePlugin.onNotificationOpen(successOnOpen, errorOnOpen);
		}

		function successOnOpen(notification) {
			console.log('Notification was opened ' + notification);
		}

		function errorOnOpen(error) {
			console.log('Error opening notification ' + error);
		}

		var _setBadgeNumber = function () {
			window.FirebasePlugin.setBadgeNumber(3);
		}

		var _getBadgeNumber = function () {
			window.FirebasePlugin.getBadgeNumber(function (n) {
				console.log(n);
			});
		}

		return {
			start: start,
			setUserId: setUserId,
			subscribeToTopic: subscribeToTopic,
			GetToken: GetToken
		}
	}
})();