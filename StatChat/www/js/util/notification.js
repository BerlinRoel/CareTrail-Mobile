
function registerForPushNotifications($cordovaDevice, $rootScope, $state) {
    var pushRegistration = PushNotification.init({ 
        android: {
            "senderID": '900487716050'
        }, 
        ios: {
            alert: 'true',
            badge: 'true',
            sound: 'true'
        }
    });
    $rootScope.deviceInfo = {};
    pushRegistration.on('registration', function (data) {
        $rootScope.deviceInfo.pushChannel = data.registrationId;
    });

    pushRegistration.on('notification', function (data, d2) {
    	if($rootScope != undefined && $rootScope.userProfile != undefined && $rootScope.userProfile != null
    			&& $rootScope.ISACTIVE != undefined && !$rootScope.ISACTIVE){
	        if(data.additionalData != undefined && data.additionalData.tabName != undefined && data.additionalData.tabName != ""){
	        	if(data.additionalData.tabName == 'tab.timeline') $rootScope.notificationFor = "TASK";
	        	$state.go(data.additionalData.tabName,{},  {reload: true}); 
	        }
    	}
        	
    });

    $rootScope.deviceInfo.platform = $cordovaDevice.getPlatform();
        
}

function registerForNotifications($cordovaDevice, $rootScope, $cordovaPush) {
	$rootScope.deviceInfo = {};
    $rootScope.deviceInfo.platform = $cordovaDevice.getPlatform();
    if($rootScope.deviceInfo.platform == "Android")registerAndroid($rootScope, $cordovaPush);
    else if ($rootScope.deviceInfo.platform == "iOS")registerIOS($rootScope, $cordovaPush);
	
}
function registerIOS($rootScope, $cordovaPush) {

	  var iosConfig = {
	    "badge": true,
	    "sound": true,
	    "alert": true,
	  };

	    $cordovaPush.register(iosConfig).then(function(deviceToken) {
	      // Success -- send deviceToken to server, and store for future use
	      $rootScope.deviceInfo.pushChannel = deviceToken;
	    }, function(err) {
	      alert("Registration error: " + err);
	    });


	    $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
	     /* if (notification.alert) {
	        navigator.notification.alert(notification.alert);
	      }

	      if (notification.sound) {
	        var snd = new Media(event.sound);
	        snd.play();
	      }

	      if (notification.badge) {
	        $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
	          // Success!
	        }, function(err) {
	          // An error occurred. Show a message to the user
	        });
	      }*/
	    });

/*	    // WARNING! dangerous to unregister (results in loss of tokenID)
	    $cordovaPush.unregister(options).then(function(result) {
	      // Success!
	    }, function(err) {
	      // Error
	    });
*/
}

function registerAndroid($rootScope, $cordovaPush){
	var androidConfig = {
	    "senderID": "634885890591",
	  };
	$cordovaPush.register(androidConfig).then(function(deviceToken) {
			$rootScope.deviceInfo.pushChannel = deviceToken;
		
	    }, function(err) {
	      // Error
	    });
	    
	$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {   
	});
}