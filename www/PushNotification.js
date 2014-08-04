var cordova = require('cordova');
var exec = require('cordova/exec');
var base64 = require('./Base64');

/**
 * The PushNotification class is exposed to the programmer. It offers a methods to
 * enable the push or receive an incoming push message.
 *
 * @author Sam Verschueren <sam.verschueren@endare.com>
 * @since  31 Jan. 2014
 */
var PushNotification = (function() {

    var pushOptions = {};
    var pushService = null;
    var pushCallback = null;
    var preferences = null;

    var hasBeenInForeground = false;

    function PushNotification() {
        _this.loadPreferences();
    };

    /**
     * Returns a boolean indicating if the push service is enabled or not. It is
     * implemented as a callback because we want the same implementation as UrbanAirship.
     *
     * @param  Function callback The method that is called when the result is determined.
     */
    PushNotification.prototype.isPushEnabled = function(callback) {
        callback(!!pushService);
    };

    /**
     * This method enables push for the application on the device.
     */
    PushNotification.prototype.enablePush = function() {
        // Initialize the pushservice
        _this.initialize(function(service) {
            // Create a channel that will return a push token
            service.createChannel(function(result, token) {
                if(result == blackberry.push.PushService.SUCCESS) {
                    // Subscribe to the invoked listener if the channel was created succesfully
                    blackberry.event.addEventListener('invoked', _this.onInvoke);

                    service.launchApplicationOnPush(true);

                    // Register the token with Urban Airship
                    _this.register(token);
                }
            });
        });
    };

    /**
     * This method registers a callback that will be called when the user opens a notification
     * in the HUB.
     *
     * @param  Function callback The callback that should be called when a notification is opened.
     */
    PushNotification.prototype.getIncoming = function(callback) {
        pushCallback = callback;
    };

    // private methods
    var _this = {
        /**
         * This method initializes the PushNotification object by creating a new PushService if
         * necessary and setting the correct values regarding the hasBeenInForeground stuff.
         *
         * @param  Function callback The callback that should be called when the pushService is initialized.
         */
        initialize: function(callback) {
            if(blackberry.app.windowState == 'fullscreen') {
                // If the window is fullscreen, the app is in the foreground and we should not close it on push received
                hasBeenInForeground = true;
            }

            // Listen for the resume action
            document.addEventListener('resume', _this.onResume);

            // Only create a new pushservice object if we do not have it yet
            if(!pushService) {
                // Create a new PushService object
                blackberry.push.PushService.create(pushOptions, onSuccess, onError, onSimChanged, onPushTransportReady);

                // Function that is called when the pushservice is succesfully created
                function onSuccess(service) {
                    pushService = service;
                    callback(service);
                }

                function onError(result) {
                    if (result == blackberry.push.PushService.INTERNAL_ERROR) {
                        alert("Error: An internal error occurred while calling blackberry.push.PushService.create. Try restarting the application.");
                    }
                    else if (result == blackberry.push.PushService.INVALID_PROVIDER_APPLICATION_ID) {
                        // This error only applies to consumer applications that use
                        // a public/BIS PPG
                        alert("Error: Called blackberry.push.PushService.create with a missing or invalid appId value. It usually means a programming error.");
                    }
                    else if (result == blackberry.push.PushService.MISSING_INVOKE_TARGET_ID) {
                        alert("Error: Called blackberry.push.PushService.create with a missing invokeTargetId value. It usually means a programming error.");
                    }
                    else if (result == blackberry.push.PushService.SESSION_ALREADY_EXISTS) {
                        alert("Error: Called blackberry.push.PushService.create with an appId or invokeTargetId value that matches another application. It usually means a programming error.");
                    } else {
                        alert("Error: Received error code (" + result + ") after calling blackberry.push.PushService.create.");
                    }
                }

                function onSimChanged() { }

                function onPushTransportReady() { }

                return;
            }

            // If we already have a pushservice, call the callback
            callback(pushService);
        },
        /**
         * This method will register the token provided with Urban Airship. We have to make sure
         * that Urban Airship knows of our existence before it can send push messages to our device.
         *
         * @param  string token The token that should be registered with Urban Airship.
         */
        register: function(token) {
            // Create the basic authentication token
            var auth = base64.encode(preferences.appKey + ':' + preferences.appSecret);

            // Create a request object to communicate with the Urban Airship server
            var request = new XMLHttpRequest();

            // Set up the headers and the configuration
            request.open('PUT', 'https://go.urbanairship.com/api/device_pins/' + token, true);
            request.setRequestHeader('Authorization', 'Basic ' + auth);

            // Send the request
            request.send();
        },
        /**
         * This method will retrieve the payload from an InvokeRequest object.
         *
         * @param  Object   invokeRequest The request where we want to extract the payload of.
         * @param  Function callback      The callback that should be triggered when the payload is extracted.
         */
        retrievePayload: function(invokeRequest, callback) {
            // Extract the push payload
            var payload = pushService.extractPushPayload(invokeRequest);

            if(payload.isAcknowledeRequired) {
                // If an acknowledgement to the server is required, acknowledge the push.
                payload.acknowledge(true);
            }

            // Create a new reader object to transform an ArrayBuffer to a string.
            var reader = new FileReader();

            // Subscribe to the onload event that is fired when the reader is ready.
            reader.onload = function(evt) {
                // Trigger the callback and return the payload object.
                callback(JSON.parse(evt.target.result));
            };

            // Start reading the payload data as utf8
            reader.readAsText(payload.data, 'UTF-8');
        },
        /**
         * This method is called when a push is received or when the user presses the open action
         * in the push notification.
         *
         * @param  Object invokeRequest The request regarding the invoke action.
         */
        onInvoke: function(invokeRequest) {
            if(invokeRequest.action != null && invokeRequest.action == 'bb.action.PUSH') {
                // Extract the payload out of the request
                _this.retrievePayload(invokeRequest, function(payload) {
                    var title = blackberry.app.name;
                    var options = {
                        body: payload.message,
                        payload: base64.encode(JSON.stringify(payload))
                    };

                    // Create a new notification in the hub with a title and some other options.
                    new Notification(title, options);

                    // If the application has not been in the foreground yet, it means it launched on push received
                    // and we should close it again.
                    if(!hasBeenInForeground) {
                        // Exit the application.
                        _this.exitApplication();
                    }
                });
            }
            else if(invokeRequest.action != null && invokeRequest.action == 'bb.action.OPEN') {
                if(pushCallback) {
                    // If a callback was found, pass the data to the listener
                    pushCallback(JSON.parse(base64.decode(invokeRequest.data)));
                }
            }
        },
        /**
         * If the application is being resumed, we should set the hasBeenInForeground property to true
         * in order to not close the application when the notification is opened.
         */
        onResume: function() {
            hasBeenInForeground = true;
        },
        /**
         * This method will exit the application if necessarry. This means that if the application
         * has not been in the foreground, the app should be closed again. This is done because
         * when a push message is received, the application is automatically opened. We don't want this
         * so if the application has not been in the foreground yet, we close it again.
         */
        exitApplication: function() {
            setTimeout(function() {
                // Check again that the application has not been
                // brought to the foreground in the second before
                // we exit
                if (!hasBeenInForeground) {
                    blackberry.app.exit();
                }
            }, 1000);
        },
        /**
         * This method will load the necessary preferences that we need from the config.xml file.
         */
        loadPreferences: function() {
            // Save the preferences to a variable and update the pushOptions
            var success = function(result) {
                preferences = result;

                // Set the correct pushOptions regarding of the preferences in the config.xml file
                pushOptions.appId = result.appId;
                pushOptions.ppgUrl = result.ppgUrl;
                pushOptions.invokeTargetId = result.invokeTargetId;
            };

            // Do nothing on failure. The channel will not be created
            var fail = function() { };

            // Retrieve the preferences from the native side
            exec(success, fail, 'PushNotification', 'getPreferences', []);
        }
    };

    return PushNotification;
})();

// Expose the object to the outside world
module.exports = new PushNotification();
