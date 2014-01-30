var push;
 
push = new JNEXT.Push();
 
JNEXT.Push = function () {
    var self = this,
        hasInstance = false;


    self.getId = function() {
        return self.m_id;
    };
 
    self.init = function () {
        if (!JNEXT.require("libUrbanAirshipBB10")) {
            return false;
        }
 
        self.m_id = JNEXT.createObject("libUrbanAirshipBB10.PushUA");
 
        if (self.m_id === "") {
            return false;
        }
 
        JNEXT.registerEvents(self);
    };

    // ************************
    // The methods of the plugin
    // ************************
    self.echo = function (text) {
        return JNEXT.invoke(self.m_id, "echo " + text);
    };
    // ************************
    // End of the methods of the plugin
    // ************************
 
    self.m_id = "";
 
    self.getInstance = function () {
        if (!hasInstance) {
            self.init();
            hasInstance = true;
        }
        return self;
    };
};

module.exports = {
    echo: function (success, fail, args, env) {
        var result = new PluginResult(args, env),
        data = JSON.parse(decodeURIComponent(args.data)),
        response = push.getInstance().echo(data);
        result.ok(response, false);
    }
};