var config = require('../../lib/config.js');

module.exports = {
    getPreferences: function(success, fail, args, env) {
        var result = new PluginResult(args, env);

        var inProduction = config['com.urbanairship.in_production'] == 'true';

        var preferences = {
            appKey: (inProduction ? config['com.urbanairship.production_app_key'] : config['com.urbanairship.development_app_key']),
            appSecret: (inProduction ? config['com.urbanairship.production_app_secret'] : config['com.urbanairship.development_app_secret']),
            appId: config['com.urbanairship.blackberry_app_id'],
            ppgUrl: (inProduction && config['com.urbanairship.blackberry_cpid'] ? 'http://cp' + config['com.urbanairship.blackberry_cpid'] + '.pushapi.eval.blackberry.com' : 'http://pushapi.eval.blackberry.com')
        };

        result.ok(preferences);
    }
};