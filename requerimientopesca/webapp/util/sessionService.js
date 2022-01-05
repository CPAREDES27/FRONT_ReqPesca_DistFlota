sap.ui.define([
    "sap/ui/base/ManagedObject"
], function (
    ManagedObject
) {
    "use strict";

    return {
        getHostService: function () {
            var urlIntance = window.location.origin,
                servicioNode;

            if (urlIntance.indexOf('tasaqas') !== -1) {
                servicioNode = 'qas'; // aputando a QAS
            } else if (urlIntance.indexOf('tasaprd') !== -1) {
                servicioNode = 'prd'; // apuntando a PRD
            } else if (urlIntance.indexOf('localhost') !== -1) {
                servicioNode = 'cheerful-bat-js'; // apuntando a DEV
            } else {
                servicioNode = 'cheerful-bat-js'; // apuntando a DEV
            }

            return `https://cf-nodejs-${servicioNode}.cfapps.us10.hana.ondemand.com`;
        },
        getCurrentUser: async function () {

            const oUserInfo = await this.getUserInfoService();

            const sUserEmail = oUserInfo.getEmail(); //fgarcia@tasa.com.pe

            var usuario = sUserEmail.split("@")[0].toUpperCase();

            return usuario;

        },
        getUserInfoService: function () {

            return new Promise(resolve => sap.ui.require([

                "sap/ushell/library"

            ], oSapUshellLib => {

                const oContainer = oSapUshellLib.Container;

                const pService = oContainer.getServiceAsync("UserInfo"); // .getService is deprecated!

                resolve(pService);

            }));

        }
    }
});