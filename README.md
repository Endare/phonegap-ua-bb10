# phonegap-ua-bb10

A PhoneGap plugin for using Urban Airship on the awesome BlackBerry 10 platform.

## Config.xml
You should add the following preferences and invoke targets to the config.xml file.

```xml
<preference name="com.urbanairship.blackberry_app_id" value="" />
<preference name="com.urbanairship.blackberry_cpid" value="" />
<preference name="invokeTargetId" value="com.endare.myapp.push">
<rim:invoke-target id="com.endare.myapp.push">
    <type>APPLICATION</type>
    <filter>
        <action>bb.action.PUSH</action>
        <mime-type>application/vnd.push</mime-type>
    </filter>
</rim:invoke-target>

<rim:invoke-target id="com.endare.myapp.open">
    <type>APPLICATION</type>
    <filter>
        <action>bb.action.OPEN</action>
        <mime-type>text/plain</mime-type>
    </filter>
</rim:invoke-target>
```

The value of the first line is the application ID that is provided by BlackBerry. The second value is the Content Provider ID, also provided by blackberry. The following lines are used to handle the push notification. The invokeTargetId
specified on line 3 should be the same as the invoke-target id of line 4. This is really important. The last invoke-target id is not that important. Although both invoke-targets should be unique in the entire BlackBerry World, so pick
them with care. Best practice is to use you company domain joined with the app name and then either push or open.

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

## Contributors
* Sam Verschueren   [sam.verschueren@gmail.com]
