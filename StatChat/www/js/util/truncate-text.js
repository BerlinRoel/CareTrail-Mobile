'use strict';

angular.module('statchat').directive('ctTruncateText', [ '$timeout',
    function($timeout) {
        return {
            restrict: 'A',
            scope: {
                message: '=ctTruncateText',
                numberOfLines: '@?',
                expandable: '=ctTruncateTextExpandable'
            },
            link: function(scope, element) {
                var $textDiv = $(element);
                var numberOfLines = angular.isDefined(scope.numberOfLines) ? parseInt(scope.numberOfLines) : 2;
                var expandable = angular.isDefined(scope.expandable) ? scope.expandable : true;
                var divOriginalHeight = 0;
                var pixelStrToFloat = function(pixStr) {
                    return parseFloat(pixStr.replace('px', ''));
                };
                var lineHeight = pixelStrToFloat($textDiv.css('line-height'));
                var collapseMessage = function() {
                    $textDiv.animate({
                        maxHeight: (lineHeight * numberOfLines)
                    }, function() {
                        $(this).addClass('timeline-message-text');
                    });
                };
                var expandMessage = function() {
                    $textDiv.removeClass('timeline-message-text');
                    $textDiv.animate({
                        maxHeight: divOriginalHeight
                    });
                };
                var normalizeMessage = function(msg) {
                    return msg.trim().replace(/(?:\r\n|\r|\n)/g, ' ').replace(/\ {2}/g, ' ');
                };
                $timeout(function() {
                    divOriginalHeight = $textDiv.height();
                    var collapsedHeight = lineHeight * numberOfLines;
                    var divWidth = $textDiv.width();
                    if (numberOfLines > 1) {
                        divWidth = ($textDiv.width() * (numberOfLines - 1)) + ($textDiv.width() * 0.75);
                    }
                    var textMetrics = calculateSize(normalizeMessage(scope.message), {
                        font: $textDiv.css('font-family').replace(/"/g, ''),
                        fontSize: $textDiv.css('font-size')
                    });
                    var collapse = false;
                    if (divOriginalHeight > collapsedHeight) { // multiline message
                        collapse = true;
                    }
                    else if (textMetrics.width > divWidth) { // single line message
                        collapse = true;
                    }
                    /*else if ((divOriginalHeight == collapsedHeight) && ((textMetrics.width + ($textDiv.width() * 0.25)) >= divWidth)) {
                        collapse = true;
                    }*/
                    if (collapse) {
                        $textDiv.addClass('timeline-message-text').css('max-height', collapsedHeight + 'px');
                        if (expandable) {
                            $(element).click(function(e) {
                                e.stopPropagation();
                                if ($(this).hasClass('timeline-message-text')) {
                                    expandMessage();
                                }
                                else {
                                    collapseMessage();
                                }
                            });
                        }
                    }
                });
            }
        };
    }
]);