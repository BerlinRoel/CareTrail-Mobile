'use strict';

angular.module('statchat')
	.directive('ctCard', function () {
		return {
			restrict: 'E',
			scope: {
				item: '=item',
				selectedItem: '=?selectedItem',
				onClickHandler: '&?onClickHandler'
			},
			link: function (scope, element, attrs) {
				scope.isPatientTimeline = false;
				if (attrs.subType != undefined && attrs.subType == "patient-timeline") {
					scope.isPatientTimeline = true;
				}

				scope.isTeamTask = false;
				if (attrs.subType != undefined && attrs.subType == "team-task") {
					scope.isTeamTask = true;
				}

				scope.setClickedItem = function () {
					scope.selectedItem = scope.item;
					if (scope.onClickHandler) {
						scope.onClickHandler({ item: scope.item });
					}
				}
			},
			templateUrl: function (elem, attr) {
				switch (attr.type) {
					case 'timeline': {
						return 'templates/cards/timeline-card.html';
					}
					case 'task': {
						return 'templates/cards/task-card.html';
					}
					case 'chat': {
						return 'templates/cards/chat-card.html';
					}
					case 'team': {
						return 'templates/cards/team-card.html';
					}
					case 'patient': {
						return 'templates/cards/patient-card.html';
					}
					case 'user': {
						return 'templates/cards/user-card.html';
					}
					default: {
						console.log("Missing type for card")
					}
				}
			}
		};
	})
	.directive('ctCardPopup', function ($http, $templateCache, $compile, $rootScope) {
		return {
			restrict: 'E',
			scope: {
				selectedItem: '=',
				imageClickHandler: '&?imageClickHandler',
				onStatusToggleHandler: '&?onStatusToggleHandler',
				button1Callback: '&?button1Callback',
				button2Callback: '&?button2Callback'
			},
			link: function (scope, element, attrs) {
				scope.loggedInUserID = $rootScope.userProfile.userid;
				var firstToggle = true;
				// Watch the 'type' attribute for changes to display the proper template.
				attrs.$observe('type', function () {
					firstToggle = true;
					var templateUrl = '';
					switch (attrs.type) {
						case 'timeline': {
							templateUrl = 'templates/cardpopups/timeline-popup.html';
							break;
						}
						case 'task': {
							templateUrl = 'templates/cardpopups/task-popup.html';
							break;
						}
						case 'patient': {
							templateUrl = 'templates/cardpopups/patient-popup.html';
							break;
						}
						case 'user': {
							templateUrl = 'templates/cardpopups/user-popup.html';
							break;
						}
					}

					if (templateUrl == '') {
						console.log("Missing card popup template for type " + attrs.type);
					}
					else {
						$http.get(templateUrl, { cache: $templateCache }).success(function (tplContent) {
							$compile($(element).html(tplContent).contents())(scope);

							// Some templates are shared but require minor differences.
							// We differentiate between them here so we can adjust the UI accordingly.
							scope.isPatientTimeline = false;
							if (attrs.subType != undefined && attrs.subType == "patient-timeline") {
								scope.isPatientTimeline = true;
							}

							scope.isTeamTask = false;
							if (attrs.subType != undefined && attrs.subType == "team-task") {
								scope.isTeamTask = true;
							}
						});
					}
				});

				scope.showImage = function () {
					if (scope.imageClickHandler) {
						scope.imageClickHandler({ image: scope.selectedItem.image });
					}
				}
				scope.onStatusToggle = function () {
					// onStatusToggle gets called when nz-toggle is initialized, so ignore the first toggle callback
					if (firstToggle) {
						firstToggle = false;
						return;
					}

					if (scope.onStatusToggleHandler) {
						scope.onStatusToggleHandler({ taskId: scope.selectedItem.taskId, status: scope.selectedItem.status[0].status });
					}
				}

				scope.button1Click = function () {
					if (scope.button1Callback) {
						switch (attrs.type) {
							case "timeline": {
								scope.button1Callback({ data: scope.selectedItem.fromUser });
								break;
							}
							case "task": {
								if (attrs.subType == "team-task") {
									// For the teams timeline page, we want to message the person the task is assigned to
									scope.button1Callback({ data: scope.selectedItem.assignedTo });
								}
								else {
									// For my timeline page, we want to message the person who created the task
									scope.button1Callback({ data: scope.selectedItem.created_by });
								}
								break;
							}
							case "patient": {
								scope.button1Callback({ data: scope.selectedItem });
								break;
							}
							case "user": {
								scope.button1Callback({ data: scope.selectedItem });
								break;
							}
							default: {
								console.log("Missing button 1 callback for type " + attrs.type);
							}
						}
					}
					else {
						console.log("No callback specified for button 1");
					}
				}

				scope.button2Click = function () {
					if (scope.button2Callback) {
						switch (attrs.type) {
							case "timeline": {
								scope.button2Callback({ data: scope.selectedItem.toPatient });
								break;
							}
							case "task": {
								scope.button2Callback({ data: scope.selectedItem.patient });
								break;
							}
							case "patient": {
								scope.button2Callback({ data: scope.selectedItem });
								break;
							}
							case "user": {
								scope.button2Callback({ data: scope.selectedItem });
								break;
							}
							default: {
								console.log("Missing button 2 callback for type " + attrs.type);
							}
						}
					}
					else {
						console.log("No callback specified for button 2");
					}
				}

				scope.button3Click = function () {
					if (scope.button2Callback) {
						switch (attrs.type) {
							default: {
								console.log("Missing button 3 callback for type " + attrs.type);
							}
						}
					}
					else {
						console.log("No callback specified for button 3");
					}
				}

				scope.onClosePopup = function () {
					firstToggle = true;
				}
			}
		};
	});