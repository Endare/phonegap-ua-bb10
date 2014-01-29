var service = "eu.endare.push";
exec = cordova.require("cordova/exec");
 
module.exports = {
    echo: function (data, success, fail) {
        exec(success, fail, service, "echo", { data: data });
    }
};