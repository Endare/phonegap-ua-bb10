# phonegap-ua-bb10

A PhoneGap plugin for using Urban Airship on the awesome BlackBerry 10 platform

## IMPORTANT

In a cordova BlackBerry 10 plugin, it is not possible to read custom config properties from the config.xml file. Because we really need this and cordova does not provide it, we should make a change in the global setup of BlackBerry 10.

NOTE: The next description of how to fix the issue is only valid for cordova 3.3.0 projects, other cordova 3.x versions can probably be fixed with the same piece of extra JavaScript code but the linenumbers can be different.

Navigate to the cordova installation folder at ~/.cordova/lib/blackberry10/cordova/3.3.0/bin/templates/project/cordova/lib and open the config-parser.js file. This file reads and parses the config.xml file but only exposes certain predefined preferences to the plugins. We want ALL the preferences!

The method we need to change is processCordovaPreferences at line 539. At the end of the method, inside the if statement at line 589, add the following lines.

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

First, we delete all the properties that are already parsed by the previous lines. We don't want to overwrite cordova logic. At the end, we iterate over the rest of the preferences and add them to the widgetConfig object.
