sap.ui.define([
    "sap/ui/core/mvc/Controller",
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
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageBox, MessageToast, Filter, FilterOperator, JSONModel, exportLibrary, Spreadsheet, CoreLibrary, Token, formatter) {
        "use strict";
        const HOST = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
        var EdmType = exportLibrary.EdmType;
        var ValueState = CoreLibrary.ValueState;

		return Controller.extend("tasa.com.requerimientopesca.controller.Main", {
    
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
            this.searchUnidadMedida();

			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy : true,
				delay : 0,
				layout : "OneColumn",
				previousLayout : "",
				actionButtonsInfo : {
					midColumn : {
						fullScreen : false
					}
				}
            });
/*
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
        },

        _getListaMaestros:function(oViewModel){
            let oModel = this.getModel(),
            that = this,
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay(),
            sUrl = HOST+"/api/General/AppMaestros/",
            oParams = {
                "p_app": "",
                "p_rol": "ADMINISTRADOR_SISTEMA"
            };

            fetch(sUrl,{
                method:'POST',
                body:JSON.stringify(oParams)
            })
            .then(res=>res.json())
            .then(data=>{
                let aApps = data.t_tabapp,
                aFields = data.t_tabfield,
                aServices = data.t_tabservice,
                aFieldsApp=[],
                aServicesApp=[];
                aApps.forEach(oApp=>{
                    aFieldsApp=aFields.filter(oField=>oApp.IDAPP===oField.IDAPP);
                    aServicesApp=aServices.filter(oService=>oApp.IDAPP===oService.IDAPP);
                    oApp.fields=aFieldsApp;
                    oApp.services=aServicesApp;  
                });
                oModel.setProperty("/listaMaestros",aApps);
                oViewModel.setProperty("/busy",false);
                oViewModel.setProperty("/delay",iOriginalBusyDelay);
            })
            .catch(error=>{
                this.getMessageDialog("Error", `Se presento un error: ${error}`);
                oViewModel.setProperty("/busy",false);
                oViewModel.setProperty("/delay",iOriginalBusyDelay);
            })
        },

        _getSessionUser:function(oViewModel){
            fetch("/user-api/currentUser")
            .then(res=>res.json)
            .then(data=>{
                oViewModel.setProperty("/user",data);
                this._getListaMaestros(oViewModel);
            })
            .then(err=>console.log(err));
        },

        _onButtonPress: function () {
            this.searchReqPesca();
        },

        ejecutarReadTable: function (table, options, user, numfilas, model, property, callBack) {

            var self = this;
            var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";


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

            var urlPost = urlNodeJS + "/api/General/Read_Table/";

            $.ajax({
                url: urlPost,
                type: 'POST',
                cache: false,
                async: false,
                dataType: 'json',
                data: JSON.stringify(objectRT),
                success: function (data, textStatus, jqXHR) {
                    if (callBack){
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

            var self = this;
            var oView = this.getView();
            var nrreq = self.getView().getModel("modelReqPesca").getProperty("/Search").NRREQ;
            var fhreq1 = self.getView().getModel("modelReqPesca").getProperty("/Search").FHREQ1;
            var fhreq2 = self.getView().getModel("modelReqPesca").getProperty("/Search").FHREQ2;
            var werks = self.getView().getModel("modelReqPesca").getProperty("/Search").WERKS;
            var numfilas = self.getView().getModel("modelReqPesca").getProperty("/Search").Numfilas;
            var nrreq1 = self.getView().getModel("modelReqPesca").getProperty("/Search").NRREQ1;
            var nrreq2 = self.getView().getModel("modelReqPesca").getProperty("/Search").NRREQ2;

            if (!numfilas) numfilas = 50;
                        
            var table = "ZV_FLRP";
            var user = "FGARCIA";
            var model = "modelReqPesca";
            var property = "/ListReqPesca";
            var meinsAux = self.getView().getModel(model).getProperty("/ListUnidadMedida")[0].MEINS;

            var options = [];
            if (nrreq1 || nrreq2) options.push({ cantidad: "40", control: "MULTIINPUT", "key": "NRREQ", valueHigh: nrreq2 ? nrreq2 : "", valueLow: nrreq1 }); 
			if (werks) options.push({ cantidad: "40", control: "INPUT", "key": "WERKS", valueHigh: "", valueLow: werks.toUpperCase() }); 
            if (fhreq2 && fhreq1) options.push({ cantidad: "40", control: "MULTIINPUT", "key": "FHREQ", valueHigh: fhreq2, valueLow: fhreq1 }); 
            
            
            self.ejecutarReadTable(table, options, user, numfilas, model, property, function(callBack){
                callBack.forEach( function(item){
                    item.MEINS = meinsAux;
                });
                self.getView().getModel(model).setProperty(property, callBack);
                
            });

        },

        searchUnidadMedida: function () {

            var self = this;
            var oView = this.getView();
                        
            var table = "ZFLCDL";
            var user = "FGARCIA";
            var model = "modelReqPesca";
            var numfilas = 50;

            var options = [];
            
            self.ejecutarReadTable(table, options, user, numfilas, model, "", function(callBack){
                var property = "/ListUnidadMedida";
                var cdumd = callBack[0].CDUPL;
                table = "ZFLUMD";
                if (cdumd) options.push({ cantidad: "40", control: "INPUT", "key": "CDUMD", valueHigh: "", valueLow: cdumd }); 
                self.ejecutarReadTable(table, options, user, numfilas, model, property);
            });

        },        

        searchCentroReqPesca: function () {

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
            var user = "FGARCIA";
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

            self.ejecutarReadTable(table, options, user, numfilas, model, property);
            
        },

        onExportar:function(oEvent){

            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
                this._oTable = this.byId('tbl_reqpesca');
            }

            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: { columns: aCols },
                dataSource: oRowBinding,
                fileName: 'RequerimientoPesca.xlsx',
                worker: false // We need to disable worker because we are using a Mockserver as OData Service
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
			const dataTable = table.getBinding('items').oList;
				/**
			 * Obtener solo las opciones que se exportarán
			 */
			for (let i = 0; i < tableColumns.length; i++) {
				let header = tableColumns[i].getAggregation('header');
				if (header) {
					let headerColId = tableColumns[i].getAggregation('header').getId();
					let headerCol = sap.ui.getCore().byId(headerColId);
					let headerColValue = headerCol.getText();
						title.push(headerColValue);
				}
			}
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
        createColumnsExport:function(aFields){
            let aColumnsExport = aFields.map(oCol=>{
                return {
                    label:oCol.NAMEFIELD,
                    property:oCol.IDFIELD
                }
            });
            return aColumnsExport;
        },        

        _onpress_centrolinkreqpesca: function (oEvent) {
            var self = this;
            let mod = oEvent.getSource().getBindingContext("modelReqPesca");
            let data  =mod.getObject();
            var viewCall = self.getView().getModel("modelReqPesca").getProperty("/ViewCall");
            var cdpta = data.CDPTA;
            var werks = data.WERKS;
            var descr = data.DESCR;

            if (viewCall === "NewReq") {
                self.getView().getModel("modelReqPesca").setProperty("/NewReg/CDPTA",cdpta);
            } else {
                self.getView().getModel("modelReqPesca").setProperty("/Search/WERKS",werks);
                self.getView().getModel("modelReqPesca").setProperty("/Search/DESCR",descr);
            } 
            
            this._onCloseDialogCentro();    

        },

        handleLiveChange : function(oEvent){
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("NRREQ", FilterOperator.Contains, sQuery));
			}

			    // filter binding
			var oList = this.getView().byId("tbl_reqpesca");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

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
            this.OpenDialogCentro("SearchReq");
        },

        OpenDialogCentro: function(viewCall) {
            this.getView().getModel("modelReqPesca").setProperty("/ViewCall", viewCall);
            this._getDialogCentro().open();
        },

         _onOpenDialogCentroNewReq: function () {
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
            var today = date.getDate() + '/' + ( date.getMonth() + 1 ) + '/' + date.getFullYear();

            var dd = today.substring(0, 2);
            var MM = today.substring(3, 5);
            var yyyy = today.substring(6, 10);
            today = yyyy + MM + dd;

            var hours = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            hours = hours.split(":");

            var hr = hours[0];
            hr = hr.toString()
            if (hr.length === 1) hr = "0" + hr
            var min = hours[1];
            min = min.toString()
            if (min.length === 1) min = "0" + min
            var seg = hours[2];
            seg = seg.toString()
            if (seg.length === 1) seg = "0" + seg
            hours = hr + min + seg;

            /*
            if (hours.substring().length >= 7){
                var hr = hours.substring(0, 1);
                var min = hours.substring(2, 4);
                var seg = hours.substring(5, 7);
                hours = "0" + hr + min + seg;
            };

            if (hours.substring().length === 8){
                var hr = hours.substring(0, 2);
                var min = hours.substring(3, 5);
                var seg = hours.substring(6, 8);
                hours = hr + min + seg;
            };
            */

            var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
            var self = this;
            var nrreq = self.getView().getModel("modelReqPesca").getProperty("/NewReg").NRREQ;
            var cdpta = self.getView().getModel("modelReqPesca").getProperty("/NewReg").CDPTA;
            var fhreq = self.getView().getModel("modelReqPesca").getProperty("/NewReg").FHREQ;

            var DD = fhreq.substring(0, 2);
            var mm = fhreq.substring(2, 4);
            var YYYY = fhreq.substring(4, 8);
            fhreq = YYYY + mm + DD;

            var cnprq = self.getView().getModel("modelReqPesca").getProperty("/NewReg").CNPRQ;
            //var cnpcm = self.getView().getModel("modelReqPesca").getProperty("/NewReg").CNPCM;
            var esreg = self.getView().getModel("modelReqPesca").getProperty("/NewReg").ESREG;
            var atmod = "", atcrn = "", hrmod = "", hrcrn = "",  fhmod = "", fhcrn = "";                     
            var p_case = this.getView().getModel('modelReqPesca').getProperty("/p_case");
            if (p_case === "E") {
                fhmod = today;
                hrmod = hours;
                atmod = self.getView().getModel("modelReqPesca").getProperty("/NewReg").ATMOD;
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
                    "p_user": "FGARCIA",
                    "tabla": "ZFLRPS"
                    };
   
            var urlPost = urlNodeJS + "/api/General/Update_Table/";

            $.ajax({
                url: urlPost,
                type: 'POST',
                cache: false,
                async: false,
                dataType: 'json',
                data: JSON.stringify(objectRT),
                success: function (data, textStatus, jqXHR) {
                    if (data.cmin == "Error") {
                         MessageBox.error(data.dsmin);
                    //    MessageBox.error("NO SE PUDO INSERTAR, CLAVES DUPLICADAS");
                    } else {
                         MessageBox.success(data.dsmin);
                    }
                    self._onButtonPress();
                    self._onCloseDialogNewReg();
                    console.log(data);
                },
                error: function (xhr, readyState) {
                    console.log(xhr);
                }
            });

        },
        
        _onButtonEditarPress: function (oEvent) {
            this._buttoneditarReqPesca(oEvent);
        },

        _buttoneditarReqPesca: function (oEvent) {
            var self = this;
            var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelReqPesca.sPath;
            var nrReqSelected = this.getView().getModel('modelReqPesca').getProperty(path);
            this.getView().getModel('modelReqPesca').setProperty("/p_case", "E");

            var cdpta = nrReqSelected.CDPTA;
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

            self.getView().getModel("modelReqPesca").setProperty("/NewReg/NRREQ",nrreq);
            self.getView().getModel("modelReqPesca").setProperty("/NewReg/FHREQ",fhreq);
            self.getView().getModel("modelReqPesca").setProperty("/NewReg/CDPTA",cdpta);
            self.getView().getModel("modelReqPesca").setProperty("/NewReg/CNPRQ",cnprq);
            self.getView().getModel("modelReqPesca").setProperty("/NewReg/ESREG",esreg);
            self.getView().getModel("modelReqPesca").setProperty("/NewReg/FHMOD",fhmod);
            self.getView().getModel("modelReqPesca").setProperty("/NewReg/FHCRN",fhcrn);
            self.getView().getModel("modelReqPesca").setProperty("/NewReg/ATCRN",atcrn);
            self.getView().getModel("modelReqPesca").setProperty("/NewReg/ATMOD",atmod);
            
            this.getView().getModel("modelReqPesca").setProperty("/VisibleAuditoria", true);

            this._getDialogNewReg().open();
        },

        getLogonUser: function () {
	    var userID = "DEFAULT_USER",
		userInfo;
		
            if (sap.ushell){
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

        _onButtonLimpiar: function() {
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

        _onCloseDialogCentro: function() {
            this._getDialogCentro().close();
        },        

        _getDialogCentro : function () {
            if (!this._oDialogCentro) {
                this._oDialogCentro = sap.ui.xmlfragment("tasa.com.requerimientopesca.view.DlgCentro", this.getView().getController());
                this.getView().addDependent(this._oDialogCentro);
            }
            return this._oDialogCentro;
        },

        _OpenNewReg: function() {
            this._onOpenDialogNewReg();
        },

        _onOpenDialogNewReg : function () {
            this.getView().getModel('modelReqPesca').setProperty("/p_case", "N");
            this.getView().getModel("modelReqPesca").setProperty("/NewReg", {});
            this.getView().getModel('modelReqPesca').setProperty("/ProcessNewReg", true);
            this.getView().getModel('modelReqPesca').setProperty("/NewReg/ATCRN", "FGARCIA");
            this.getView().getModel("modelReqPesca").setProperty("/VisibleAuditoria", false);
            this._getDialogNewReg().open();
        },

        _onCloseDialogNewReg: function() {
            this._getDialogNewReg().close();
        },

        _getDialogNewReg : function () {
            if (!this._oDialogNewReg) {
                this._oDialogNewReg = sap.ui.xmlfragment("tasa.com.requerimientopesca.view.DlgNewReg", this.getView().getController());
                this.getView().addDependent(this._oDialogNewReg);
            }
            return this._oDialogNewReg;
        }

		});
	});