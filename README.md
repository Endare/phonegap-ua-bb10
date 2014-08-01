# phonegap-ua-bb10

A PhoneGap plugin for using Urban Airship on the awesome BlackBerry 10 platform

## IMPORTANT

In a cordova BlackBerry 10 plugin, it is not possible to read custom config properties from the config.xml file. Because we really need this and cordova does not provide it, we should make a change in the global setup of BlackBerry 10.

NOTE: The next description of how to fix the issue is only valid for cordova 3.3.0 and 3.4.0 projects, other cordova 3.x versions can probably be fixed with the same piece of extra JavaScript code but the linenumbers can be different. At the bottom you can find the fixes for Cordova 3.3.0 and 3.4.0.

Navigate to the cordova installation folder at ~/.cordova/lib/blackberry10/cordova/3.x.0/bin/templates/project/cordova/lib and open the config-parser.js file. This file reads and parses the config.xml file but only exposes certain predefined preferences to the plugins. We want ALL the preferences!

The method we need to change is processCordovaPreferences.

### Cordova 3.3.0
At line 589
```javascript
var pref = JSON.parse(JSON.stringify(processParamObj(data.preference)));

delete pref.backgroundcolor;
delete pref.childbrowser;
delete pref.hidekeyboardformaccessorybar;
delete pref.popupblocker;
delete pref.orientation;
delete pref.theme;
delete pref.websecurity;

for(var key in pref) {
    if(!widgetConfig[key]) {
        widgetConfig[key] = pref[key];
    }
}
```

### Cordova 3.4.0

At line 593
```javascript
var pref = JSON.parse(JSON.stringify(processParamObj(data.preference)));

delete pref.backgroundcolor;
delete pref.childbrowser;
delete pref.hidekeyboardformaccessorybar;
delete pref.popupblocker;
delete pref.orientation;
delete pref.theme;
delete pref.websecurity;
delete pref.diskcache;

for(var key in pref) {
    if(!widgetConfig[key]) {
        widgetConfig[key] = pref[key];
    }
}
```
