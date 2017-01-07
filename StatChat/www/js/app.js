angular.module('statchat', ['ionic', 'ngResource', 'statchat.user-controller',
    'statchat.session', 'statchat.patient-controller', 'statchat.message-controller',
    'statchat.team-controller', 'statchat.services', 'ionic-datepicker', 'ui.mask', 'ngLetterAvatar', 'nzToggle'])

    .run(function($ionicPlatform, $cordovaDevice, $rootScope, $state, $ionicPopup, $window,
        $ionicHistory, $cordovaAppVersion, TouchIdService, SecureStorageService, PushService) {
        $ionicPlatform.ready(function() {

            PushService.start();
            SecureStorageService.start();
            TouchIdService.start();

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                cordova.plugins.Keyboard.disableScroll(true);
            }

            if (window.StatusBar) {
                StatusBar.styleLightContent();
                if (ionic.Platform.isAndroid()) {
                    StatusBar.backgroundColorByHexString('#367bb2');
                }
            }

            goBackHandler($rootScope, $ionicPopup, $ionicPlatform, $ionicHistory, $window, $state);

            var entireApp;
            entireApp = document.querySelector('body');

            ionic.on('tap', resetInactivityTimer, entireApp);
            ionic.on('hold', resetInactivityTimer, entireApp);
            ionic.on('dragstart', resetInactivityTimer, entireApp);
            ionic.on('dragend', resetInactivityTimer, entireApp);
            ionic.on('swipe', resetInactivityTimer, entireApp);
            ionic.on('transform', resetInactivityTimer, entireApp);
            ionic.on('pinch', resetInactivityTimer, entireApp);

            function resetInactivityTimer() {
                resetTimer($rootScope, $state, $ionicPopup, $ionicHistory);
            }

        });
    })
    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $ionicConfigProvider.views.swipeBackEnabled(false);

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })
            .state('tab.login', {
                url: '/login',
                cache: false,
                views: {
                    'tab-login': {
                        templateUrl: 'templates/tab-login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })
            .state('tab.password', {
                url: '/password',
                cache: false,
                views: {
                    'tab-login': {
                        templateUrl: 'templates/tab-password.html',
                        controller: 'PasswordCtrl'
                    }
                }
            })
            .state('tab.reset', {
                url: '/reset',
                cache: false,
                views: {
                    'tab-login': {
                        templateUrl: 'templates/tab-reset.html',
                        controller: 'ResetCtrl'
                    }
                }
            })
            .state('tab.timeline', {
                url: '/timeline/:tabName',
                cache: false,
                views: {
                    'tab-timeline': {
                        templateUrl: 'templates/user/tab-timeline.html',
                        params: { 'tabName': null },
                        controller: 'TimeLineCtrl'
                    }
                }
            })
            .state('tab.tabpatients', {
                url: '/tabpatients/:authToken',
                cache: false,
                views: {
                    'tab-tabpatients': {
                        templateUrl: 'templates/patients/tab-patient.html',
                        params: { 'authToken': null },
                        controller: 'PatientCtrl'
                    }
                }
            })
            .state('tab.tabteams', {
                url: '/tabteams/:authToken',
                cache: false,
                views: {
                    'tab-tabteams': {
                        templateUrl: 'templates/teams/tab-team.html',
                        params: { 'authToken': null },
                        controller: 'TeamCtrl'
                    }
                }
            })
            .state('tab.tabmessages', {
                url: '/tabmessages/:authToken',
                cache: false,
                views: {
                    'tab-tabmessages': {
                        templateUrl: 'templates/messages/tab-message.html',
                        params: { 'authToken': null },
                        controller: 'MessageCtrl',
                        controllerAs: 'msg'
                    }
                }
            })
            .state('tab.profile', {
                url: '/profile/:authToken',
                cache: false,
                views: {
                    'tab-profile': {
                        templateUrl: 'templates/user/tab-profile.html',
                        params: { 'authToken': null },
                        controller: 'ProfileCtrl'
                    }
                }
            })
            .state('tab.one-to-one', {
                url: '/one-to-one-conv/:toUserId',
                cache: false,
                views: {
                    'tab-tabmessages': {
                        templateUrl: 'templates/messages/one-to-one-conv.html',
                        params: { 'toUserId': null },
                        controller: 'OneToOneConversationCtrl'
                    }
                }
            })
            .state('tab.add_patient', {
                url: '/add_patient',
                views: {
                    'tab-tabpatients': {
                        templateUrl: 'templates/user/add_patient.html',
                        params: { 'authToken': null },
                        controller: 'PopulateAddPatientCtrl'
                    }
                }
            })
            .state('tab.add_patient_save', {
                url: '/add_patient_save',
                views: {
                    'tab-tabpatients': {
                        templateUrl: 'templates/user/add_patient.html',
                        params: { 'authToken': null },
                        controller: 'SaveAddPatientCtrl'
                    }
                }
            })
            .state('tab.add_team_member', {
                url: '/add_team_member',
                views: {
                    'tab-tabteams': {
                        templateUrl: 'templates/user/add_team_member.html',
                        params: { 'authToken': null },
                        controller: 'PopulateAddTeamMemberCtrl'
                    }
                }
            })
            .state('tab.create-task', {
                url: '/create-task',
                views: {
                    'tab-timeline': {
                        templateUrl: 'templates/user/create-task.html',
                        controller: 'CreateTaskCtrl'
                    }
                }
            })
            .state('tab.add_team_member_save', {
                url: '/add_team_member_save',
                views: {
                    'tab-tabteams': {
                        templateUrl: 'templates/user/add_team_member.html',
                        params: { 'authToken': null },
                        controller: 'SaveAddTeamMemberCtrl'
                    }
                }
            })
            .state('tab.add_team', {
                url: '/add_team',
                views: {
                    'tab-tabteams': {
                        templateUrl: 'templates/user/add_team.html',
                        params: { 'authToken': null },
                        controller: 'PopulateAddTeamCtrl'
                    }
                }
            })
            .state('tab.add_team_save', {
                url: '/add_team_save',
                views: {
                    'tab-tabteams': {
                        templateUrl: 'templates/user/add_team.html',
                        params: { 'authToken': null },
                        controller: 'SaveAddTeamCtrl'
                    }
                }
            })
            .state('tab.patientshome', {
                url: '/patients_home/:authToken',
                cache: false,
                views: {
                    'tab-tabpatients': {
                        templateUrl: 'templates/patients/patients_home.html',
                        params: { 'patientId': null },
                        controller: 'PatientLandingCtrl',
                        controllerAs: 'ptnLnd'
                    }
                }
            })
            .state('tab.teamshome', {
                url: '/teams_home/:authToken',
                cache: false,
                views: {
                    'tab-tabteams': {
                        templateUrl: 'templates/teams/teams_home.html',
                        params: { 'teamId': null },
                        controller: 'TeamLandingCtrl',
                        controllerAs: 'teamLnd'
                    }
                }
            })
            .state('tab.searchForUser', {
                url: '/search_for_users/:authToken',
                cache: false,
                views: {
                    'tab-tabpatients': {
                        templateUrl: 'templates/patients/search_for_users.html',
                        controller: 'PatientCtrl',
                        controllerAs: 'ptn'
                    }
                }
            })
            .state('tab.inviteUser', {
                url: '/invite_user/:authToken',
                cache: false,
                views: {
                    'tab-tabpatients': {
                        templateUrl: 'templates/patients/invite_user.html',
                    }
                }
            })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/login');
        $ionicConfigProvider.navBar.alignTitle('center');
    });
