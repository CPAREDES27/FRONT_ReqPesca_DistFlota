sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/export/library',
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/library",
    "sap/m/Token",
    "tasa/com/requerimientopesca/util/formatter",
    "sap/ui/core/Item",
    "sap/ui/core/BusyIndicator",
    "tasa/com/requerimientopesca/util/sessionService",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageBox, MessageToast, Filter, FilterOperator,
        JSONModel, exportLibrary, Spreadsheet, CoreLibrary, Token, formatter, Item, BusyIndicator, sessionService) {
        "use strict";
        const HOST = sessionService.getHostService(); //"https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
        var EdmType = exportLibrary.EdmType;
        var ValueState = CoreLibrary.ValueState;
        var usuario="";
        return BaseController.extend("tasa.com.requerimientopesca.controller.Main", {

            formatter: formatter,
            dataTableKeys: [
                'NRREQ',
                'FHREQ',
                'WERKS',
                'DESCR',
                'MANDT',
                'CNPRQ',
                'ESREG',
                'FHCRN',
                'HRCRN',
                'ATCRN',
                'HRMOD',
                'FHMOD',
                'ATMOD'
            ],

            onInit: function () {
                this.getView().getModel("modelReqPesca").setProperty("/Search", {});
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta", {});
                this.getView().getModel("modelReqPesca").setProperty("/NewReg", {});
                this.getView().getModel("modelReqPesca").setProperty("/ListUnidadMedida", {});
                this.getView().getModel("modelReqPesca").setProperty("/Search/Numfilas", 200);
                this.searchUnidadMedida();

                var oViewModel,
                    fnSetAppNotBusy,
                    iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

                oViewModel = new JSONModel({
                    busy: true,
                    delay: 0,
                    layout: "OneColumn",
                    previousLayout: "",
                    actionButtonsInfo: {
                        midColumn: {
                            fullScreen: false
                        }
                    }
                });

                this.searchCentroReqPesca();

                var oInput = this.byId("centroInput");
                oInput.setSuggestionRowValidator(this.suggestionRowValidator);
                /*
                
                            var that = this;
                
                            if (!this._oResponsivePopover) {
                                this._oResponsivePopover = sap.ui.xmlfragment("tasa.com.requerimientopesca.view.DlgHeaderTable", this);
                                this._oResponsivePopover.setModel(this.getView().getModel());
                            }
                
                            var oTable = this.getView().byId("tbl_reqpesca");
                            oTable.addEventDelegate({
                                onAfterRendering: function() {
                                    var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
                                    for (var i = 0; i < oHeader.length; i++) {
                                    var oID = oHeader[i].id;
                                    that.onClick(oID);
                                    }
                                }
                            }, oTable);
                
                            var oView = this.getView();
                            var oMultiInput1 = oView.byId("multiInput1");
                                oMultiInput1.setTokens([
                                new Token({text: "", key: "0001"})
                            ]);
                            var fnValidator = function(args){
                                var text = args.text;
                                return new Token({key: text, text: text});
                            };
                            oMultiInput1.addValidator(fnValidator);
                */
                //this.setModel(oViewModel, "appView");
                //this._getListaMaestros(oViewModel);
                //this.getLogonUser();
                console.log('inicio');

                /*
                var dateFrom = new Date();
                var	dateTo = new Date();
                var oModel = new JSONModel();
    
                dateFrom.setUTCDate();
                dateFrom.setUTCMonth();
                dateFrom.setUTCFullYear();
    
                dateTo.setUTCDate();
                dateTo.setUTCMonth();
                dateTo.setUTCFullYear();
    
                oModel.setData({
                    delimiterDRS1: "-",
                    dateValueDRS1: dateFrom,
                    secondDateValueDRS1: dateTo,
                    dateFormatDRS1: "dd/MM/yyyy"
                });
                this.getView().setModel(oModel); 
                this._iEvent = 0;
                */
            },
            onAfterRendering: function () {

            this._getCurrentUser();    

            },
            _getCurrentUser: async function(){
                let oUshell = sap.ushell,
                oUser={};
                if(oUshell){
                    let  oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");
                    let sEmail = oUserInfo.getEmail().toUpperCase(),
                    sName = sEmail.split("@")[0],
                    sDominio= sEmail.split("@")[1];
                    if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
                    oUser = {
                        name:sName
                    }
                }else{
                    oUser = {
                        name: "FGARCIA"
                    }
                }
    
                this.usuario=oUser.name;
                console.log(this.usuario);
            },

            suggestionRowValidator: function (oColumnListItem) {
                var aCells = oColumnListItem.getCells();

                return new Item({
                    key: aCells[1].getText(),
                    text: aCells[2].getText()
                });
            },

            /*suggestionRowValidatorNew: function (oColumnListItem) {
                var aCells = oColumnListItem.getCells();
    
                return new Item({
                    key: aCells[2].getText(),
                    text: aCells[1].getText()
                });
            },*/

            /*
            onSuggestionCentroItemSelected: function () {
                var sKey = this.byId("centroInput").getSelectedKey();
                this.byId('selectedKeyCentro').setText(sKey);
            }, */

            onClick: function (oID) {
                var that = this;
                $('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
                    var oTarget = oEvent.currentTarget; //Get hold of Header Element
                    var oLabelText = oTarget.childNodes[0].textContent; //Get Column Header text
                    var oIndex = oTarget.id.slice(-1); //Get the column Index
                    var oView = that.getView();
                    //var oTable = oView.byId("tbl_reqpesca");
                    //var oModel = oTable.getModel().getProperty("/ListReqPesca"); //Get Hold of Table Model Values
                    var oModel = that.getView().getModel("modelReqPesca").getProperty("/ListReqPesca"); //Get Hold of Table Model Values
                    var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
                    //oView.getModel().setProperty("/bindingValue", oKeys[oIndex]); //Save the key value to property
                    that._oResponsivePopover.openBy(oTarget);
                });
            },

            _getListaMaestros: function (oViewModel) {
                let oModel = this.getModel(),
                    that = this,
                    iOriginalBusyDelay = this.getView().getBusyIndicatorDelay(),
                    sUrl = this.onLocation() + "General/AppMaestros/",
                    oParams = {
                        "p_app": "",
                        "p_rol": "ADMINISTRADOR_SISTEMA"
                    };

                fetch(sUrl, {
                    method: 'POST',
                    body: JSON.stringify(oParams)
                })
                    .then(res => res.json())
                    .then(data => {
                        let aApps = data.t_tabapp,
                            aFields = data.t_tabfield,
                            aServices = data.t_tabservice,
                            aFieldsApp = [],
                            aServicesApp = [];
                        aApps.forEach(oApp => {
                            aFieldsApp = aFields.filter(oField => oApp.IDAPP === oField.IDAPP);
                            aServicesApp = aServices.filter(oService => oApp.IDAPP === oService.IDAPP);
                            oApp.fields = aFieldsApp;
                            oApp.services = aServicesApp;
                        });
                        oModel.setProperty("/listaMaestros", aApps);
                        oViewModel.setProperty("/busy", false);
                        oViewModel.setProperty("/delay", iOriginalBusyDelay);
                    })
                    .catch(error => {
                        this.getMessageDialog("Error", `Se presento un error: ${error}`);
                        oViewModel.setProperty("/busy", false);
                        oViewModel.setProperty("/delay", iOriginalBusyDelay);
                    })
            },

            _getSessionUser: function (oViewModel) {
                fetch("/user-api/currentUser")
                    .then(res => res.json)
                    .then(data => {
                        oViewModel.setProperty("/user", data);
                        this._getListaMaestros(oViewModel);
                    })
                    .then(err => console.log(err));
            },

            _onButtonPress: function () {
                this.searchReqPesca();
            },

            ejecutarReadTable: function (table, options, user, numfilas, model, property, callBack) {

                var self = this;
                //var urlNodeJS = sessionService.getHostService(); //"https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";


                var objectRT = {
                    "delimitador": "|",
                    "fields": [],
                    "no_data": "",
                    "option": [],
                    "options": options,
                    "order": "",
                    "p_user": user,
                    "rowcount": numfilas,
                    "rowskips": 0,
                    "tabla": table
                };

                var urlPost = this.onLocation() + "General/Read_Table/";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        if (callBack) {
                            callBack(data.data);
                        } else {
                            self.getView().getModel(model).setProperty(property, data.data);
                        }
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },

            handleChange: function (oEvent) {
                var self = this;
                var sFrom = oEvent.getParameter("from"),
                    sTo = oEvent.getParameter("to"),
                    bValid = oEvent.getParameter("valid"),
                    oEventSource = oEvent.getSource();

                this._iEvent++;

                if (bValid) {
                    oEventSource.setValueState(ValueState.None);
                } else {
                    oEventSource.setValueState(ValueState.Error);
                }
                self.getView().getModel("modelReqPesca").setProperty("/Search/FHREQ1", sFrom);
                self.getView().getModel("modelReqPesca").setProperty("/Search/FHREQ2", sTo);
            },

            searchReqPesca: function () {
                BusyIndicator.show(0);
                var self = this;
                var oView = this.getView();
                var dayIni;
                var dayFin;
                var nrreq = self.getView().getModel("modelReqPesca").getProperty("/Search").NRREQ;
                var fhreq1 = self.getView().getModel("modelReqPesca").getProperty("/Search").FHREQ1;
                if (fhreq1) {
                    if (fhreq1.getDate() < 10) dayIni = "0" + fhreq1.getDate().toString();
                    if (fhreq1.getDate() > 10) dayIni = fhreq1.getDate().toString();
                    fhreq1 = fhreq1.getFullYear().toString() + (fhreq1.getMonth() + 1).toString() + dayIni;
                }

                var fhreq2 = self.getView().getModel("modelReqPesca").getProperty("/Search").FHREQ2;
                if (fhreq2) {
                    if (fhreq2.getDate() < 10) dayFin = "0" + fhreq2.getDate().toString();
                    if (fhreq2.getDate() > 10) dayFin = fhreq2.getDate().toString();
                    fhreq2 = fhreq2.getFullYear().toString() + (fhreq2.getMonth() + 1).toString() + dayFin;
                }

                //var werks = self.getView().getModel("modelReqPesca").getProperty("/Search").WERKS;
                var werks = this.getView().byId("centroInput").getSelectedKey();
                var numfilas = self.getView().getModel("modelReqPesca").getProperty("/Search").Numfilas;
                var nrreq1 = self.getView().getModel("modelReqPesca").getProperty("/Search").NRREQ1;
                var nrreq2 = self.getView().getModel("modelReqPesca").getProperty("/Search").NRREQ2;

                if (!numfilas) numfilas = 200;

                var table = "ZV_FLRP";
                var user = this.getUsuarioLogueado();
                var model = "modelReqPesca";
                var property = "/ListReqPesca";
                var meinsAux = this.getMeins();

                var options = [];
                if (nrreq1 || nrreq2) options.push({ cantidad: "40", control: "MULTIINPUT", "key": "NRREQ", valueHigh: nrreq2 ? nrreq2 : "", valueLow: nrreq1 });
                if (werks) options.push({ cantidad: "40", control: "INPUT", "key": "WERKS", valueHigh: "", valueLow: werks.toUpperCase() });
                if (fhreq2 && fhreq1) options.push({ cantidad: "40", control: "MULTIINPUT", "key": "FHREQ", valueHigh: fhreq2, valueLow: fhreq1 });

                self.ejecutarReadTable(table, options, user, numfilas, model, property, function (callBack) {
                    callBack.forEach(function (item) {
                        item.MEINS = meinsAux;
                    });
                    self.getView().getModel(model).setProperty(property, callBack);
                    BusyIndicator.hide();
                });

            },

            getMeins: function () {

                var meins = "";
                var listaMeins = this.getView().getModel("modelReqPesca").getProperty("/ListUnidadMedida");
                meins = listaMeins.length > 0 ? listaMeins[0].MEINS : "";
                return meins;
            },

            searchUnidadMedida: function () {

                var self = this;
                var oView = this.getView();

                var table = "ZFLCDL";
                var user = this.getUsuarioLogueado();
                var model = "modelReqPesca";
                var numfilas = 50;
                // 009
                var options = [];

                self.ejecutarReadTable(table, options, user, numfilas, model, "", function (callBack) {
                    var property = "/ListUnidadMedida";
                    var cdumd = callBack[0].CDUPL;
                    table = "ZFLUMD";
                    if (cdumd) options.push({ cantidad: "40", control: "INPUT", "key": "CDUMD", valueHigh: "", valueLow: cdumd });
                    self.ejecutarReadTable(table, options, user, numfilas, model, property);
                });

            },

            searchCentroReqPesca: function () {
                BusyIndicator.show(0);
                var self = this;
                var werks = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").WERKS;
                var cdpta = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").CDPTA;
                var descr = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").DESCR;
                var stcd1 = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").STCD1;
                var name1 = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").NAME1;
                var cdpto = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").CDPTO;
                var dspto = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").DSPTO;
                var inprp = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").INPRP;

                var numfilas = self.getView().getModel("modelReqPesca").getProperty("/SearchPlanta").Numfilas;
                if (!numfilas) numfilas = 50;

                var table = "ZV_FLPL";
                var user = this.getUsuarioLogueado();
                var model = "modelReqPesca";
                var property = "/ListCentroReqPesca";
                var options = [];

                if (werks) options.push({ cantidad: "40", control: "INPUT", "key": "WERKS", valueHigh: "", valueLow: werks.toUpperCase() });
                if (cdpta) options.push({ cantidad: "40", control: "INPUT", "key": "CDPTA", valueHigh: "", valueLow: cdpta.toUpperCase() });
                if (descr) options.push({ cantidad: "40", control: "INPUT", "key": "DESCR", valueHigh: "", valueLow: descr.toUpperCase() });
                if (stcd1) options.push({ cantidad: "40", control: "INPUT", "key": "STCD1", valueHigh: "", valueLow: stcd1.toUpperCase() });
                if (name1) options.push({ cantidad: "40", control: "INPUT", "key": "NAME1", valueHigh: "", valueLow: name1.toUpperCase() });
                if (cdpto) options.push({ cantidad: "40", control: "INPUT", "key": "CDPTO", valueHigh: "", valueLow: cdpto.toUpperCase() });
                if (dspto) options.push({ cantidad: "40", control: "INPUT", "key": "DSPTO", valueHigh: "", valueLow: dspto.toUpperCase() });
                if (inprp) options.push({ cantidad: "40", control: "COMBOBOX", "key": "INPRP", valueHigh: "", valueLow: inprp.toUpperCase() });

                self.ejecutarReadTable(table, options, user, numfilas, model, property, function (callBack) {
                    BusyIndicator.hide();
                });

            },

            /*
            createColumnConfig: function () {
                    var aCols = [];
                    const title = [];
                    const table = this.byId('tableData');
                    let tableColumns = table.getColumns();
                    const dataTable = table.getBinding('rows').oList;
    
                	
                    //Obtener solo las opciones que se exportarán
                	
                    for (let i = 0; i < tableColumns.length; i++) {
                        let header = tableColumns[i].getAggregation('template');
                        if (header) {
                            let headerColId = header.getId();
                            let headerCol = sap.ui.getCore().byId(headerColId);
                            let headerColValue = headerCol.getText();
    
                            title.push(headerColValue);
                        }
    
                    }
                
                    title.splice(title.length - 2, 1);
                    title.pop();
    
                	
                    //Combinar los títulos y los campos de la cabecera
                     
                    const properties = title.map((t, i) => {
                        return {
                            column: t,
                            key: this.dataTableKeys[i]
                        }
                    });
    
                    properties.forEach(p => {
                        const typeValue = typeof dataTable[0][p.key];
                        let propCol = {
                            label: p.column,
                            property: p.key
                        };
    
                        switch (typeValue) {
                            case 'number':
                                propCol.type = EdmType.Number;
                                propCol.scale = 0;
                                break;
                            case 'string':
                                propCol.type = EdmType.String;
                                propCol.wrap = true;
                                break;
                        }
    
                        aCols.push(propCol);
                    });
    
                    return aCols;
                },
    
                exportarExcel: function (event) {
                    var aCols, oRowBinding, oSettings, oSheet, oTable;
    
                    if (!this._oTable) {
                        this._oTable = this.byId('tableData');
                    }
    
                    oTable = this._oTable;
                    oRowBinding = oTable.getBinding('rows');
                    aCols = this.createColumnConfig();
    
                    oSettings = {
                        workbook: { 
                            columns: aCols,
                            context: {
                                sheetName: "CONSULTA DE DESCARGAS"
                            } 
                        },
                        dataSource: oRowBinding,
                        fileName: 'Consulta de pesca descargada.xlsx',
                        worker: false // We need to disable worker because we are using a Mockserver as OData Service
                    };
    
                    oSheet = new Spreadsheet(oSettings);
                    oSheet.build().finally(function () {
                        oSheet.destroy();
                    });
                }, 
            */

            onExportar: function (oEvent) {

                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('tbl_reqpesca');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('rows');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: { columns: aCols },
                    dataSource: oRowBinding,
                    fileName: 'RequerimientoPesca.xlsx',
                    worker: false
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });

            },

            createColumnConfig: function () {
                var aCols = [];
                const title = [];
                const table = this.byId('tbl_reqpesca');
                let tableColumns = table.getColumns();
                const dataTable = table.getBinding('rows').oList;
                /**
             * Obtener solo las opciones que se exportarán
        	
            for (let i = 0; i < tableColumns.length; i++) {
                let header = tableColumns[i].getAggregation('header');
                if (header) {
                    let headerColId = tableColumns[i].getAggregation('header').getId();
                    let headerCol = sap.ui.getCore().byId(headerColId);
                    let headerColValue = headerCol.getText();
                        title.push(headerColValue);
                }
            }
*/
                for (let i = 0; i < tableColumns.length; i++) {
                    let header = tableColumns[i].getAggregation('template');
                    if (header) {
                        let headerColId = header.getId();
                        let headerCol = sap.ui.getCore().byId(headerColId);
                        let headerColValue = headerCol.getText();
                        title.push(headerColValue);
                    }
                }

                //title.splice(title.length - 2, 1);
                title.pop();
                /**
             * Combinar los títulos y los campos de la cabecera
             */
                const properties = title.map((t, i) => {
                    return {
                        column: t,
                        key: this.dataTableKeys[i]
                    }
                })
                properties.forEach(p => {
                    const typeValue = typeof dataTable[0][p.key];
                    let propCol = {
                        label: p.column,
                        property: p.key
                    };
                    switch (typeValue) {
                        case 'number':
                            propCol.type = EdmType.Number;
                            propCol.scale = 0;                            
                            break;
                        case 'string':
                            propCol.type = EdmType.String;
                            propCol.wrap = true;
                            break;
                    }
                    aCols.push(propCol);
                });
                return aCols;
            },
            /*createColumnsExport:function(aFields){
                let aColumnsExport = aFields.map(oCol=>{
                    return {
                        label:oCol.NAMEFIELD,
                        property:oCol.IDFIELD
                    }
                });
                return aColumnsExport;
            },*/

            _onpress_centrolinkreqpesca: function (oEvent) {
                var self = this;
                let mod = oEvent.getSource().getBindingContext("modelReqPesca");
                let data = mod.getObject();
                var viewCall = self.getView().getModel("modelReqPesca").getProperty("/ViewCall");
                var cdpta = data.CDPTA;
                var werks = data.WERKS;
                var descr = data.DESCR;

                if (viewCall === "NewReq") {
                    self.getView().getModel("modelReqPesca").setProperty("/NewReg/CDPTA", cdpta);
                    self.getView().getModel("modelReqPesca").setProperty("/NewReg/WERKS", werks);
                } else {
                    self.getView().getModel("modelReqPesca").setProperty("/Search/WERKS", werks);
                    self.getView().getModel("modelReqPesca").setProperty("/Search/DESCR", descr);
                }

                this._onCloseDialogCentro();

            },

            handleLiveChangesw: function (oEvent) {
                var aFilter = [];
                var filter;
                //var sQuery = oEvent.getParameter("query");
                var sQuery = oEvent.getParameters().newValue;



                if (sQuery) {
                    aFilter.push(new Filter("NRREQ", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("FHREQ", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("WERKS", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("DESCR", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("MEINS", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("CNPRQ", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("DESC_ESREG", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("FHCRN", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("HRCRN", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("ATCRN", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("HRMOD", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("FHMOD", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("ATMOD", FilterOperator.Contains, sQuery));
                }

                filter = new Filter({
                    filters: [
                        aFilter
                    ],
                    and: false,
                });

                // filter binding
                var oList = this.getView().byId("tbl_reqpesca");
                var oBinding = oList.getBinding("items");
                oBinding.filter(filter);

            },

            handleLiveChange: function (oEvent) {

                let sQuery = oEvent.getSource().getValue();
                var table = this.byId("tbl_reqpesca");
                var tableItemsBinding = table.getBinding('rows');
                //var oBinding = oList.getBinding("items");
                var dataTable = tableItemsBinding.oList;
                let filters = [];

                this.dataTableKeys.forEach(k => {
                    var typeValue = typeof dataTable[0][k];
                    let vOperator = null;

                    switch (typeValue) {
                        case 'string':
                            vOperator = FilterOperator.Contains;
                            break;
                        case 'number':
                            vOperator = FilterOperator.EQ;
                            break;
                    }

                    var filter = new Filter(k, vOperator, sQuery);
                    filters.push(filter);
                });
                var oFilters = new Filter({
                    filters: filters
                });
                tableItemsBinding.filter(oFilters, "Application");
            },

            handleLiveChanges: function (oEvent) {

                var aFilter = [];
                var sQuery = oEvent.getParameters().newValue;

                if (sQuery) {
                    aFilter.push(new Filter("NRREQ", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("FHREQ", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("WERKS", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("DESCR", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("MEINS", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("CNPRQ", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("DESC_ESREG", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("FHCRN", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("HRCRN", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("ATCRN", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("HRMOD", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("FHMOD", FilterOperator.Contains, sQuery));
                    aFilter.push(new Filter("ATMOD", FilterOperator.Contains, sQuery));
                }



                var filter = new Filter({
                    filters: [
                        aFilter
                    ],
                    and: false,
                });

                var oList = this.getView().byId("tbl_reqpesca");
                var oBinding = oList.getBinding("items");

                oBinding.filter([

                    filter

                ]);


            },

            _onBuscarButtonPress: function () {
                this.searchCentroReqPesca();
            },

            _onOpenDialogCentro: function () {
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/WERKS", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/CDPTA", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/STCD1", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/CDPTO", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/INPRP", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/DESCR", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/NAME1", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/DSPTO", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/Numfilas", "5");
                this.getView().getModel("modelReqPesca").setProperty("/ListCentroReqPesca", []);
                this.OpenDialogCentro("SearchReq");
            },

            OpenDialogCentro: function (viewCall) {
                this.getView().getModel("modelReqPesca").setProperty("/ViewCall", viewCall);
                this._getDialogCentro().open();
            },

            _onOpenDialogCentroNewReq: function () {
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/WERKS", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/CDPTA", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/STCD1", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/CDPTO", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/INPRP", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/DESCR", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/NAME1", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/DSPTO", "");
                this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta/Numfilas", "5");
                this.getView().getModel("modelReqPesca").setProperty("/ListCentroReqPesca", []);
                this.OpenDialogCentro("NewReq");
            },

            _onAceptarButtonPress: function () {
                if (this.validarReqPesca()) this.registrarReqPesca();
            },

            validarReqPesca: function () {
                var self = this;
                var valido = true;

                var cdpta = self.getView().getModel("modelReqPesca").getProperty("/NewReg").CDPTA;
                var fhreq = self.getView().getModel("modelReqPesca").getProperty("/NewReg").FHREQ;
                var cnprq = self.getView().getModel("modelReqPesca").getProperty("/NewReg").CNPRQ;
                var esreg = self.getView().getModel("modelReqPesca").getProperty("/NewReg").ESREG;

                if (cdpta === "" || !cdpta) valido = false;
                if (fhreq === "" || !fhreq) valido = false;
                if (cnprq === "" || !cnprq) valido = false;
                if (esreg === "" || !esreg) valido = false;

                if (!valido) MessageBox.warning("Faltan llenar datos!");
                return valido;
            },

            registrarReqPesca: function () {

                var date = new Date();
                var day;
                if (date.getDate() < 10) day = "0" + date.getDate().toString();
                if (date.getDate() >= 10) day = date.getDate().toString();
                var month;
                if (date.getMonth() < 10) month = "0" + (date.getMonth() + 1).toString();
                if (date.getMonth() >= 10) month = (date.getMonth() + 1).toString();
                var today = date.getFullYear().toString() + month + day;

                var hours = date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString();

               // var urlNodeJS = sessionService.getHostService(); //"https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                var validar = true;
                var nrreq = self.getView().getModel("modelReqPesca").getProperty("/NewReg").NRREQ;
                var cdpta = self.getView().getModel("modelReqPesca").getProperty("/NewReg").CDPTA;
                var fhreq = self.getView().getModel("modelReqPesca").getProperty("/NewReg").FHREQ;

                var DD = fhreq.substring(0, 2);
                var mm = fhreq.substring(2, 4);
                var YYYY = fhreq.substring(4, 8);
                fhreq = YYYY + mm + DD;

                var cnprq = self.getView().getModel("modelReqPesca").getProperty("/NewReg").CNPRQ;
                if (parseInt(cnprq) < 1000000000) cnprq;
                if (parseInt(cnprq) > 1000000000) {
                    MessageBox.warning("Colocar un Numero de filas menor al propuesto");
                    validar = false;
                }
                var esreg = self.getView().getModel("modelReqPesca").getProperty("/NewReg").ESREG;
                var atmod = "", atcrn = "", hrmod = "", hrcrn = "", fhmod = "", fhcrn = "";
                var p_case = this.getView().getModel('modelReqPesca').getProperty("/p_case");
                if (validar) {
                    if (p_case === "E") {
                        fhmod = today;
                        hrmod = hours;
                        atmod = this.getUsuarioLogueado();
                        fhcrn = self.getView().getModel("modelReqPesca").getProperty("/NewReg").FHCRN;
                        atcrn = self.getView().getModel("modelReqPesca").getProperty("/NewReg").ATCRN;
                        hrcrn = self.getView().getModel("modelReqPesca").getProperty("/NewReg").HRCRN;
                    } else {
                        fhcrn = today;
                        atcrn = self.getView().getModel("modelReqPesca").getProperty("/NewReg").ATCRN;
                        hrcrn = hours;
                    }

                    if (!nrreq) nrreq = "";
                    var data = "|" + nrreq + "|" + cdpta + "|" + fhreq + "|" + hours + "|" + cnprq + "|" + "0.000" + "|" + esreg + "|" + fhcrn + "|" + hrcrn + "|" + atcrn + "|" + fhmod + "|" + hrmod + "|" + atmod + "|";
                    var objectRT = {
                        "data": data,
                        "flag": "X",
                        "p_case": p_case,
                        "p_user": this.getUsuarioLogueado(),
                        "tabla": "ZFLRPS"
                    };


                    var urlPost = this.onLocation() + "General/Update_Table/";

                    $.ajax({
                        url: urlPost,
                        type: 'POST',
                        cache: false,
                        async: false,
                        dataType: 'json',
                        data: JSON.stringify(objectRT),
                        success: function (data, textStatus, jqXHR) {
                            var concatenar = "";
                            for (let i = 0; i < data.t_mensaje.length; i++) {
                                concatenar = data.t_mensaje[i].DSMIN + " " + concatenar;
                            }

                            if (data.CDMIN == "Error") {
                                MessageBox.error(concatenar);
                            } else {
                                MessageBox.success(concatenar);
                            }
                            self._onButtonPress();
                            self._onCloseDialogNewReg();
                            console.log(data);
                        },
                        error: function (xhr, readyState) {
                            console.log(xhr);
                        }
                    });
                }

            },

            getUsuarioLogueado: function () {
                return this.usuario; //sessionService.getCurrentUser()
            },

            _onButtonEditarPress: function (oEvent) {
                this._buttoneditarReqPesca(oEvent);
            },

            _buttoneditarReqPesca: function (oEvent) {
                BusyIndicator.show(0);
                var self = this;
                var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelReqPesca.sPath;
                var nrReqSelected = this.getView().getModel('modelReqPesca').getProperty(path);
                this.getView().getModel('modelReqPesca').setProperty("/p_case", "E");

                var cdpta = nrReqSelected.CDPTA;
                var werks = nrReqSelected.WERKS;
                var atcrn = nrReqSelected.ATCRN;
                var cnpcm = nrReqSelected.CNPCM;
                var cnprq = nrReqSelected.CNPRQ;
                //var descr = nrReqSelected.DESCR;
                var esreg = nrReqSelected.ESREG;
                var fhcrn = nrReqSelected.FHCRN;
                var fhmod = nrReqSelected.FHMOD;
                var fhreq = nrReqSelected.FHREQ;
                var hrcrn = nrReqSelected.HRCRN;
                var hrmod = nrReqSelected.HRMOD;
                var hrreq = nrReqSelected.HRREQ;
                var nrreq = nrReqSelected.NRREQ;
                var atmod = nrReqSelected.ATMOD;

                if (fhcrn) {
                    var arrFhcrn = fhcrn.split("/");
                    fhcrn = arrFhcrn[2] + arrFhcrn[1] + arrFhcrn[0];
                }

                if (hrcrn) {
                    var arrHrcrn = hrcrn.split(":");
                    hrcrn = arrHrcrn[0] + arrHrcrn[1] + "00"
                }

                self.getView().getModel("modelReqPesca").setProperty("/NewReg/NRREQ", nrreq);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/FHREQ", fhreq);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/CDPTA", cdpta);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/WERKS", werks);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/CNPRQ", cnprq);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/ESREG", esreg);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/FHMOD", fhmod);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/FHCRN", fhcrn);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/ATCRN", atcrn);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/ATMOD", atmod);
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/HRCRN", hrcrn);

                this.getView().getModel("modelReqPesca").setProperty("/VisibleAuditoria", true);

                this._getDialogNewReg().open();
                this.searchCentroReqPesca();
                //var oInputNew = this.byId("centroInput");
                //oInputNew.setSuggestionRowValidator(this.suggestionRowValidator);
            },

            getLogonUser: function () {
                var userID = "DEFAULT_USER",
                    userInfo;

                if (sap.ushell) {
                    userInfo = sap.ushell.Container.getService("UserInfo").getUser;
                    if (userInfo) {
                        userID = userInfo.getId();
                    }
                }
                return userID;
            },

            _onButtonPressLimpiar: function () {
                this._onButtonLimpiar();
            },

            _onButtonLimpiar: function () {
                var self = this;
                this.getView().byId("DRS1").setValue("");
                self.getView().getModel("modelReqPesca").setProperty("/Search/NRREQ1", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/NRREQ2", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/FHREQ", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/WERKS", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/DESCR", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/Numfilas", "200");
                self.getView().getModel("modelReqPesca").setProperty("/ListReqPesca", {});
                self.getView().getModel("modelReqPesca").setProperty("/Search/searchField", "");
            },

            _onLimpiarCentro: function () {
                var self = this;
                this.getView().byId("DRS1").setValue("");
                self.getView().getModel("modelReqPesca").setProperty("/Search/NRREQ1", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/NRREQ2", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/FHREQ", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/WERKS", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/DESCR", "");
                self.getView().getModel("modelReqPesca").setProperty("/Search/Numfilas", "200");
                self.getView().getModel("modelReqPesca").setProperty("/ListReqPesca", {});
            },

            _onCloseDialogCentro: function () {
                this._getDialogCentro().close();
            },

            _getDialogCentro: function () {
                if (!this._oDialogCentro) {
                    this._oDialogCentro = sap.ui.xmlfragment("tasa.com.requerimientopesca.view.DlgCentro", this.getView().getController());
                    this.getView().addDependent(this._oDialogCentro);
                }
                return this._oDialogCentro;
            },

            _OpenNewReg: function () {
                this._onOpenDialogNewReg();
            },

            _onOpenDialogNewReg: function () {
                this.getView().getModel('modelReqPesca').setProperty("/p_case", "N");
                this.getView().getModel("modelReqPesca").setProperty("/NewReg", {});
                this.getView().getModel('modelReqPesca').setProperty("/ProcessNewReg", true);
                this.getView().getModel('modelReqPesca').setProperty("/NewReg/ATCRN", this.getUsuarioLogueado());
                this.getView().getModel("modelReqPesca").setProperty("/VisibleAuditoria", false);
                this._getDialogNewReg().open();
                //var oInputNew = this.getView().byId("NewcentroInput");
                //oInputNew.setSuggestionRowValidator(this.suggestionRowValidatorNew);
            },

            _onCloseDialogNewReg: function () {
                this._getDialogNewReg().close();
            },

            _getDialogNewReg: function () {
                if (!this._oDialogNewReg) {
                    this._oDialogNewReg = sap.ui.xmlfragment("tasa.com.requerimientopesca.view.DlgNewReg", this.getView().getController());
                    this.getView().addDependent(this._oDialogNewReg);
                }
                return this._oDialogNewReg;
            }

        });
    });
