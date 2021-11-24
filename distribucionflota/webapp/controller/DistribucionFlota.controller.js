sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/table/RowSettings",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/CustomData",
    "tasa/com/distribucionflota/util/formatter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, RowSettings, MessageBox, MessageToast, JSONModel, CustomData, formatter) {
		"use strict";

		return Controller.extend("tasa.com.distribucionflota.controller.DistribucionFlota", {

            formatter: formatter,
			onInit: function () {
                this.getView().getModel("modelDistFlota").setProperty("/ListDistFlota", {});
                this.getView().getModel("modelDistFlota").setProperty("/MoverEmbarcacion", {});
                this.getView().getModel("modelDistFlota").setProperty("/EmbarcacionesSelectas", {});
                this.getView().getModel("modelDistFlota").setProperty("/listPropios", {});
                this.getView().getModel("modelDistFlota").setProperty("/listTerceros", {});
                this.getView().getModel("modelDistFlota").setProperty("/listTotal", {});
                this.getView().getModel("modelDistFlota").setProperty("/listDescargas", {});
                this.getView().getModel("modelDistFlota").setProperty("/ListPlantaCbo", {});
                this.getView().getModel("modelDistFlota").setProperty("/Search", {});
                this.getView().getModel("modelDistFlota").setProperty("/SearchCabecera", {});
                this.objMTable = [];
                this.arrHBox = [];
                this.mTable = {};
                this.moverInit = false;
                this.totDeclTodosAux;
                this.getView().byId("cbo_filter_indprp").setSelectedKey("0");
                this.getView().byId("cbo_filter_motMarea").setSelectedKey("2");
                this.getView().byId("cbo_filter_ZonaArea").setSelectedKey("0");
                this.getView().byId("cbo_filter_Tipemb").setSelectedKey("001");
                
                this.tablesDistribucion(false);
                this.ObtenerZonaArea();
                this.ObtenerTipoEmba();
                this.CargaMovEmba();
                this.CargarIndPropiedad();
                this.CargaTipoMarea();
            },

            onAfterRendering: function () {

                for (var i=0; i<this.objMTable.length; i++){  
                    let oTable = this.objMTable[i].table;
                    let oHBox = this.objMTable[i].hbox;

                    var aItems = oTable.getItems();

                    if (aItems.length > 0){
                        const COLORS={
                            BADVALUE_MEDIUM:"BADVALUE_MEDIUM",
                            CRITICALVALUE_LIGHT:"CRITICALVALUE_LIGHT",
                            KEY_MEDIUM:"KEY_MEDIUM",
                            POSITIVE:"POSITIVE",
                        }

                        const COLOR_DEFAULT = "SinColor";
                        let sColor,Path;
                        aItems.forEach(oItem=>{
                            Path = this.getView().getModel("modelDistFlota").getProperty(oItem.getBindingContextPath());
                            sColor = Path.color;
                            oItem.addStyleClass( COLORS[sColor] || COLOR_DEFAULT);
                            oItem.addStyleClass("sapMTextEMB");
                        })
                        oHBox.setVisible(true);
                    } else {
                        oHBox.setVisible(false);
                    }

                }
            },

            ObtenerZonaArea: function () {
                var table = "ZFLZAR";
                var fields = '"ZCDZAR", "ZDSZAR"';
                var property = "/ListZonaArea";
                var options = [];
                options.push({ cantidad: "40",
                               control: "COMBOBOX",
                               key: "ZESZAR",
                               valueHigh: "",
                               valueLow: "S"}); 
                this.EjecutarReadTable(table, fields, options, property);
            },

            ObtenerTipoEmba: function () {
                var table = "ZFLTEM";
                var fields = '"CDTEM", "DESCR"';
                var property = "/ListTipoEmba";
                var options = [];
                options.push({ cantidad: "40",
                               control: "COMBOBOX",
                               key: "ESREG",
                               valueHigh: "",
                               valueLow: "S"}); 
                this.EjecutarReadTable(table, fields, options, property);
            },

            CargaMovEmba: function () {

                var table = "ZFLPTA";
                var fields = '"CDPTA", "DESCR"';
                var property = "/ListMovEmba";
                var options = [];
                options.push({ cantidad: "40",
                               control: "COMBOBOX",
                               key: "ESREG",
                               valueHigh: "",
                               valueLow: "S"},
                               { cantidad: "40",
                               control: "COMBOBOX",
                               key: "WERKS",
                               valueHigh: "",
                               valueLow: " "}); 
                this.EjecutarReadTable(table, fields, options, property);
            
            },

            EjecutarReadTable: function (table, fields, options, property) {

                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                
                
                var objectRT = {
                    "delimitador": "|",
                    "fields": [],
                    "no_data": "",
                    "option": [],
                    "options": options,
                    "order": "",
                    "p_user": "FGARCIA",
                    "rowcount": 50,
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
                        var datos = data.data;

                        if (property === "/ListZonaArea") datos.push({MANDT: "600", ZCDZAR:"0", ZDSZAR:"TODOS", ZESZAR: "S"});
                        self.getView().getModel("modelDistFlota").setProperty(property, datos);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },

            CargarIndPropiedad: function () {
                var domname = "ZINPRP";
                var property = "/ListIndPropiedad";
                this.EjecutarDominios(domname, property);
            },

            CargaTipoMarea: function () {

                var domname = "ZDO_TIPOMAREA";
                var property = "/ListTipoMarea";
                this.EjecutarDominios(domname, property);
            },

            EjecutarDominios: function (domname, property) {

                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                
                
                var objectRT = {
                        "dominios": [
                            {
                            "domname": domname,
                            "status": "A"
                            }
                        ]
                        };

    
                var urlPost = urlNodeJS + "/api/dominios/Listar";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        var datos = data.data[0].data;
                        datos.push({"id":"0", "descripcion":"Todos"});
                        self.getView().getModel("modelDistFlota").setProperty(property, datos);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },

            MoverEmbarcacion: function () {

                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                var dataEmba = [];

                var embarcacionesSelectas = self.getView().getModel("modelDistFlota").getProperty("/EmbarcacionesSelectas");
                var cdpta = sap.ui.getCore().byId("cbo_planta_aux").getSelectedKey();
                if (!cdpta) {
                    MessageBox.error("Debe seleccionar la embarcación");
                } else {
                    
                    var descr = sap.ui.getCore().byId("cbo_planta_aux").getValue();

                    for (var j = 0; j < embarcacionesSelectas.length; j++){

                        var itemSelected = embarcacionesSelectas[j];
                                    
                                var nrmar = itemSelected.numMarea;
                                var cdemb = itemSelected.codEmba;
                                var nmemb = itemSelected.descEmba;
                                var cppms = itemSelected.cbodEmba;
                                var inprp = itemSelected.indicador;
                                var cnpdc = itemSelected.pescDecl;
                                dataEmba.push({ NRMAR: nrmar,
                                        CDEMB: cdemb,
                                        NMEMB: nmemb,
                                        CPPMS: cppms,
                                        INPRP: inprp,
                                        CDPTA: cdpta,
                                        DESCR: descr,
                                        CNPDC: cnpdc});
                    } 

                    var objectRT = {
                            "data": dataEmba,
                            "p_cdtpa": cdpta,
                            "p_user": "FGARCIA"
                            };

                    var urlPost = urlNodeJS + "/api/embarcacion/MoverEmbarcacion/";
                    
                    $.ajax({
                        url: urlPost,
                        type: 'POST',
                        cache: false,
                        async: false,
                        dataType: 'json',
                        data: JSON.stringify(objectRT),
                        success: function (data, textStatus, jqXHR) {
                            self.getView().getModel("modelDistFlota").setProperty("/EmbarcacionesSelectas", []);
                            self.tablesDistribucion(true);
                            MessageBox.success(data.dsmin);
                            console.log(data);
                            self._getDialogMovEmbarcacion().close();
                        },
                        error: function (xhr, readyState) {
                            console.log(xhr);
                        }
                    });
                    
                }
                    
            },

            Distribucion: function () {
                
                var zflrps = [];
                    var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                    var self = this;
                    var modelDistFlota = self.getView().getModel("modelDistFlota").getData();
                    var oSelectedItem = self.getView().byId("__table0-sapUiTableGridCnt").getSelectedItems(); 

                        for (var i = 0; i < oSelectedItem.length; i++) {
                            
                            var planta = oSelectedItem[i].getCells()[0].getText();

                                for (var j = 0; j < modelDistFlota.ListReqPesca.length; j++){

                                    var itemSelected = modelDistFlota.ListReqPesca[j];
                                    
                                    if(planta === itemSelected.zdszar){

                                        var nrreq = itemSelected.nrreq;
                                        var cdpta = itemSelected.cdpta;
                                        var zdszar = itemSelected.zdszar;
                                        var fhreq = itemSelected.fhreq;
                                        var hrreq = itemSelected.hrreq;
                                        var cnprq = itemSelected.cnprq;
                                        var cnpcm = itemSelected.cnpcm;
                                        var aufnr = itemSelected.aufnr;
                                        zflrps.push({ NRREQ: nrreq,
                                                    CDPTA: cdpta,
                                                    ZADSZAR: zdszar,
                                                    FHREQ: fhreq,
                                                    HRREQ: hrreq,
                                                    CNPRQ: cnprq,
                                                    CNPRCM: cnpcm,
                                                    AUFNR: aufnr});
                                    }
                                }   
                        }
            },

            tablesDistribucion: function (update) {

                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;

                var cdtem = self.getView().getModel("modelDistFlota").getProperty("/Search").tipoEmba;
                var inprp = self.getView().getModel("modelDistFlota").getProperty("/Search").indProp;
                var inubc = self.getView().getModel("modelDistFlota").getProperty("/Search").motMarea;
                var numfl = self.getView().getModel("modelDistFlota").getProperty("/Search").numfilas;
                var cdplt = self.getView().getModel("modelDistFlota").getProperty("/Search").cdplta;

                if(!cdtem || cdtem === "0") cdtem = "";
                if(!inprp || inprp === "0") inprp = "";
                if(!inubc || inubc === "0") inubc = "";
                if(!numfl || numfl === "0") numfl = "";
                if(!cdplt || cdplt === "0") cdplt = "";

                var objectRT = {
                        "p_cdtem": cdtem,
                        "p_codPlanta": cdplt,
                        "p_inprp": inprp,
                        "p_inubc": inubc,
                        "p_numFilas": numfl,
                        "p_user": "FGARCIA"
                        }

                var urlPost = urlNodeJS + "/api/distribucionflota/listar";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {

                        self.getView().getModel("modelDistFlota").setProperty("/ListDistFlota", data.listaZonas);
                        
                        for (var i = 2; i < data.listaZonas.length + 2; i++) {
        
                            var zonaIndex = i - 2;

                            var ZonaDistribucion = self.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex+ "/zonaName");
                            var NumPlantasDistribucion = self.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas").length;
                            var NumZonasDistri = self.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex+ "/zonaName").length;

                            for (var j = 2; j < NumPlantasDistribucion + 2; j++) {
                            
                                var plantaIndex = j - 2;
                                var ListPlantas = self.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" +
                                 zonaIndex + "/listaPlantas/" + plantaIndex);
                                var ListEmbarcaciones = self.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" +
                                 zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones");                        
                                ListPlantas.tot_PescaReq = parseInt(ListPlantas.tot_PescaReq);
                                
                                for (var k = 0; k < ListEmbarcaciones.length; k++) {
                                    ListEmbarcaciones[k].cbodEmba = parseInt(ListEmbarcaciones[k].cbodEmba);
                                    ListEmbarcaciones[k].horaArribo = ListEmbarcaciones[k].horaArribo.substring(0, 5);
                                    ListEmbarcaciones[k].pescDecl = parseInt(ListEmbarcaciones[k].pescDecl);
                                }
                                

                            }
                        }

                        
                        self.getView().getModel("modelDistFlota").setProperty("/listDescargas", data.listaDescargas);
                        self.getView().getModel("modelDistFlota").setProperty("/listPropios", data.listaPropios);
                        self.getView().getModel("modelDistFlota").setProperty("/listTerceros", data.listaTerceros);
                        self.getView().getModel("modelDistFlota").setProperty("/listTotal", data.listaTotal);

                        var totCbodTodos = 0;
                        var totDeclTodos = 0;
                        var totEPTodos = 0;
                        var totPorcTodos = 0;
                        var totDifTodos = 0;

                        var totCbodProp = 0;
                        var totDeclProp = 0;
                        var totEPProp = 0;
                        var totPorcProp = 0;
                        var totDifProp = 0;

                        var totCbodTerc = 0;
                        var totDeclTerc = 0;
                        var totEPTerc = 0;
                        var totPorcTerc = 0;
                        var totDifTerc = 0;

                        var totCbodDesc = 0;
                        var totDeclDesc = 0;
                        var totEPDesc = 0;
                        var totPorcDesc = 0;
                        var totDifDesc = 0; 
                        
                        var PorcTodos= 0;
                        var totDeclTodosAux = 0;
                        
                        for (var i=0; i<data.listaTotal.length; i++){
                            totDeclTodosAux = totDeclTodosAux + parseInt(data.listaTotal[i].pescDeclProp);
                        }

                        for (var i=0; i<data.listaTotal.length; i++){
                            totCbodTodos = totCbodTodos + parseInt(data.listaTotal[i].cbodProp);
                            totDeclTodos = totDeclTodos + parseInt(data.listaTotal[i].pescDeclProp);
                            totEPTodos = totEPTodos + parseInt(data.listaTotal[i].embaPescProp);
                            data.listaTotal[i].porcTodos = Math.round(parseFloat((parseFloat(data.listaTotal[i].pescDeclProp) / parseFloat(totDeclTodosAux)) * 100));
                            totPorcTodos = totPorcTodos + parseFloat(data.listaTotal[i].porcTodos);
                            totDifTodos = "0";
                        }

                        var totDeclPropiosAux = 0;
                        
                        for (var i=0; i<data.listaPropios.length; i++){
                            totDeclPropiosAux = totDeclPropiosAux + parseInt(data.listaPropios[i].pescDeclProp);
                        }                        

                        for (var i=0; i<data.listaPropios.length; i++){
                            totCbodProp = totCbodProp + parseInt(data.listaPropios[i].cbodProp);
                            totDeclProp = totDeclProp + parseInt(data.listaPropios[i].pescDeclProp);
                            totEPProp = totEPProp + parseInt(data.listaPropios[i].embaPescProp);
                            data.listaPropios[i].porcPropios = Math.round(parseFloat((parseFloat(data.listaPropios[i].pescDeclProp) / parseFloat(totDeclPropiosAux)) * 100));
                            totPorcProp = totPorcProp + parseFloat(data.listaPropios[i].porcPropios);
                            totDifProp = "0";
                        }

                        var totDeclTercerosAux = 0;
                        
                        for (var i=0; i<data.listaTerceros.length; i++){
                            totDeclTercerosAux = totDeclTercerosAux + parseInt(data.listaTerceros[i].pescDeclProp);
                        }                           

                        for (var i=0; i<data.listaTerceros.length; i++){
                            totCbodTerc = totCbodTerc + parseInt(data.listaTerceros[i].cbodProp);
                            totDeclTerc = totDeclTerc + parseInt(data.listaTerceros[i].pescDeclProp);
                            totEPTerc = totEPTerc + parseInt(data.listaTerceros[i].embaPescProp);
                            data.listaTerceros[i].porcTerceros = Math.round(parseFloat((parseFloat(data.listaTerceros[i].pescDeclProp) / parseFloat(totDeclTercerosAux)) * 100));
                            totPorcTerc = totPorcTerc + parseFloat(data.listaTerceros[i].porcTerceros);
                            totDifTerc = "0";
                        }
                        
                        for (var i=0; i<data.listaDescargas.length; i++){
                            totCbodDesc = totCbodDesc + parseInt(data.listaTerceros[i].cbodProp);
                            totDeclDesc = totDeclDesc + parseInt(data.listaTerceros[i].pescDeclProp);
                            totEPDesc = totEPDesc + parseInt(data.listaTerceros[i].embaPescProp);
                            totPorcDesc = "0";
                            totDifDesc = "0";
                        }

                        self.getView().getModel("modelDistFlota").setProperty("/totCbodTodos", totCbodTodos);
                        self.getView().getModel("modelDistFlota").setProperty("/totDeclTodos", totDeclTodos);
                        self.getView().getModel("modelDistFlota").setProperty("/totEPTodos", totEPTodos);
                        self.getView().getModel("modelDistFlota").setProperty("/totPorcTodos", totPorcTodos);
                        self.getView().getModel("modelDistFlota").setProperty("/totDifTodos", totDifTodos);

                        self.getView().getModel("modelDistFlota").setProperty("/totCbodProp", totCbodProp);
                        self.getView().getModel("modelDistFlota").setProperty("/totDeclProp", totDeclProp);
                        self.getView().getModel("modelDistFlota").setProperty("/totEPProp", totEPProp);
                        self.getView().getModel("modelDistFlota").setProperty("/totPorcProp", totPorcProp);
                        self.getView().getModel("modelDistFlota").setProperty("/totDifProp", totDifProp);
                        
                        self.getView().getModel("modelDistFlota").setProperty("/totCbodTerc", totCbodTerc);
                        self.getView().getModel("modelDistFlota").setProperty("/totDeclTerc", totDeclTerc);
                        self.getView().getModel("modelDistFlota").setProperty("/totEPTerc", totEPTerc);
                        self.getView().getModel("modelDistFlota").setProperty("/totPorcTerc", totPorcTerc);
                        self.getView().getModel("modelDistFlota").setProperty("/totDifTerc", totDifTerc);
                        
                        self.getView().getModel("modelDistFlota").setProperty("/totCbodDesc", totCbodDesc);
                        self.getView().getModel("modelDistFlota").setProperty("/totDeclDesc", totDeclDesc);
                        self.getView().getModel("modelDistFlota").setProperty("/totEPDesc", totEPDesc);
                        self.getView().getModel("modelDistFlota").setProperty("/totPorcDesc", totPorcDesc);
                        self.getView().getModel("modelDistFlota").setProperty("/totDifDesc", totDifDesc);

                        self.generarPlantasDinamicas(self);
                        self.onAfterRendering();

                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
                
            },

            BuscarTable: function () {
                var table = this.mTable["mitabla"];
                var table2 = this.getView().byId("idRandomDataTableTableDsF3");
                console.log(table);
            },

            BuscarEmbarcacion: function (oEvent) {

                console.log(oEvent);
                if (oEvent.getParameters().clearButtonPressed) return;
                var NumZonasDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota").length;
                var zonaIndex = 0;
                var plantaIndex = 0;
                var existe = false;

                for (var i = 2; i < NumZonasDistribucion + 2; i++) {
                    
                    zonaIndex = i - 2;

                    var ZonaDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex+ "/zonaName");
                    var NumPlantasDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas").length; 
                    var PlantaDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/plantaName");

                    for (var j = 2; j < NumPlantasDistribucion + 2; j++) {
                    
                        plantaIndex = j - 2;
                        var NumEmbarcacionDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones").length;
                        var Search = this.getView().getModel("modelDistFlota").getProperty("/Search/Embarcacion").trim().toUpperCase();
                        var NumEmbarcacion = 0;

                        for (var m = 0; m < NumEmbarcacionDistribucion; m++) {

                            NumEmbarcacion = m;
                            var Embarcacion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones/" + NumEmbarcacion + "/descEmba");

                            if(Embarcacion === Search){
                                
                                existe = true;
                                MessageBox.success("La embarcación se encuentra en la zona " + ZonaDistribucion + " y la planta " + PlantaDistribucion);
                                return;

                            }
                        }
                    }
                }

                if (!existe){

                    MessageBox.error("No se encontro la embarcación");
                                
                }
            },

            handleSelectionChange: function(oEvent) {

                var changedItems = oEvent.getParameter("changedItems") || [oEvent.getParameter("changedItem")];
                var isSelected = oEvent.getParameter("selected");
                var isSelectAllTriggered = oEvent.getParameter("selectAll");
                var state = isSelected ? "Selected" : "Deselected";
                var Id = oEvent.getParameters().changedItem.mProperties.key

                if(Id === "T"){

                    this.getView().getModel("modelDistFlota").setProperty("/ShowTdc", isSelected);

                } else if (Id === "ZP") {

                    this.getView().getModel("modelDistFlota").setProperty("/ShowZonP", isSelected);

                } else {

                    this.getView().getModel("modelDistFlota").setProperty("/ShowEstSisFrio", isSelected);

                }
            },

            onSelectionFilter: function() {
                
                this.tablesDistribucion(true);
                MessageBox.success("La actualización se realizo satisfactoriamente");
                               
            },

            rowcount: function () {

                var numfilas = this.getView().getModel("modelDistFlota").getProperty("/Search").Numfilas;
                var codPlanta = this.getView().getModel("modelDistFlota").getProperty("/Search").CodPlanta;
                var table;

                for (var i = 0; i < this.objMTable.length; i++){

                    table = this.objMTable[i].sId
                    var includes = table.includes(codPlanta);

                    if (includes){

                        this.objMTable[i].setGrowing(true);
                        this.objMTable[i].setGrowingThreshold(1);
                        break;
                        
                    }

                }

                

            },
            
            onRowCountFilter: function() {

                this.rowcount();

            },

            formatDate: function (date) {
                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();
                let hour = date.getHours();
                let minute = date.getMinutes();
                let second = date.getSeconds();
                let dateFormatted = '';

                if (day < 10) day = '0' + day;
                if (month < 10) month = '0' + month;
                if (hour < 10) hour = '0' + hour;
                if (minute < 10) minute = '0' + minute;
                if (second < 10) second = '0' + second;

                dateFormatted = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;

                return dateFormatted;
            }, 

            generarPlantasDinamicas: function (self, numfilas, codPlanta) {

                var NumZonasDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota").length;
                var zonaIndex = 0;
                var plantaIndex = 0;
                var listPlantas = [];
                sap.ui.getCore().byId("__bar1").destroyContent();
                var now = this.formatDate(new Date());
                now = now.substring(0, 16);

                this.getView().getModel("modelDistFlota").setProperty("/Now", now);
                this.getView().getModel("modelDistFlota").setProperty("/ShowTdc", false);
                this.getView().getModel("modelDistFlota").setProperty("/ShowEstSisFrio", false);
                this.getView().getModel("modelDistFlota").setProperty("/ShowZonP", false);

                for (var i = 2; i < NumZonasDistribucion + 2; i++) {
   
                    zonaIndex = i - 2;

                    var ZonaDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex+ "/zonaName");
                    var NumPlantasDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas").length;
                    var NumZonasDistri = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex+ "/zonaName").length;

                    
                    if(zonaIndex % 2 === 0){
                        var oHBoxDistribucion = new sap.m.HBox({
                                width: "100%",
                                //Id: this.getView.byId("container-distribucionflota---DistribucionFlota--hBoxContent1")
                        });
                    }

                    var TabBarZonaPlanta = new sap.m.IconTabBar({
                        expanded: true
                    });

                    for (var j = 2; j < NumPlantasDistribucion + 2; j++) {
                    
                        plantaIndex = j - 2;
                        
                        var idTableAux = "Table_DF1";
                        var PlantaDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/plantaName");
                        var idPlantaDistribucion = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/codPlanta");
                        listPlantas.push({"codPlanta": idPlantaDistribucion, "descPlanta": PlantaDistribucion});
                        
                        var rowstable = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones");
                        var rowstableDistribucion = "modelDistFlota>/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones";
                        if (rowstable.length > 0) {

                            this.getView().getModel("modelDistFlota").setProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/plantaTableId", idTableAux + plantaIndex);
                            var NumvisibleRowCount = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones").length;
                            var totalesTable = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex)

                            var tot_Est = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_Est");
                            var tot_PescaReq = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_PescaReq");
                            var tot_bod = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_bod");
                            var tot_decl = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_decl");
                            var tot_emb = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_emb");
                                                                                                                                                                4
                            var IdTable = "Tbl" + PlantaDistribucion + zonaIndex + plantaIndex;
                            var Row = this.getView().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones/0/cbodEmba");
    
                            var oHBoxDistribucionPlanta = new sap.m.HBox({
                                renderType: "Bare",
                                class: "sapUiNoMargin",
                                width: "58%"
                            });

                            var oPanelDistribucionPlanta = new sap.m.Panel({
                                expandable: true,
                                headerText: ZonaDistribucion,
                                width: "auto",
                                class: "sapUiNoMargin",
                                expanded: true
                            });

                            var oHBoxPlantaBase = new sap.m.HBox({
                                width: "100%",
                                class: "sapUiNoMargin"
                            });

                            var oHBoxPlanta = new sap.m.HBox({
                                renderType: "Bare",
                                class: "sapUiNoMargin",
                                width: "100%"
                            });

                            var oPanelPlanta = new sap.m.Panel({
                                expandable: true,
                                class: "sapUiNoMargin",
                                headerText: "Req. Pesca Declarada " + tot_PescaReq + " Tn",
                                width: "auto",
                                expanded: true
                            });

                            var iconTabFilterPlanta = new sap.m.IconTabFilter({
                                expanded: true,
                                class: "sapUiNoMargin",
                                text: PlantaDistribucion
                            });

                            var oTable = new sap.m.Table("idRandomDataTable" + IdTable, {
                            width: "auto",
                            class: "sapUiNoMargin",
                            mode: sap.m.ListMode.MultiSelect,
                            selectionChange: function (oEvent) {
                                    var sPath = oEvent.getParameters().listItem.oBindingContexts.modelDistFlota.sPath;
                                    var rowSelected = this.getView().getModel('modelDistFlota').getProperty(sPath);
                                    if (oEvent.getParameters().selected){
                                        var depositoTemporal = [];
                                        if (this.moverInit) depositoTemporal = this.getView().getModel("modelDistFlota").getProperty("/EmbarcacionesSelectas");
                                        depositoTemporal.push(rowSelected);
                                        this.getView().getModel("modelDistFlota").setProperty("/EmbarcacionesSelectas", depositoTemporal);
                                        this.moverInit = true;
                                    } else {
                                        var embarcacionesSelectas = this.getView().getModel("modelDistFlota").getProperty("/EmbarcacionesSelectas");
                                        for (var i=0; i<embarcacionesSelectas.length; i++){
                                            if (embarcacionesSelectas[i].codEmba === rowSelected.codEmba) 
                                                this.getView().getModel("modelDistFlota").getProperty("/EmbarcacionesSelectas").splice(i);
                                        }
                                    }
                                }.bind(this),
                            columns : [ 
                                new sap.m.Column({
                                width: "10%",
                                visible: false,
                                header : new sap.m.Label({
                                    text : "FlagEmba"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : ""
                                })
                            }), new sap.m.Column({
                                width: "30%",
                                header : new sap.m.Label({
                                    text : "Embarcación"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : "EP: " + tot_emb
                                })
                            }), new sap.m.Column({
                                width: "18%",
                                factory: '_resultColumnFactory',
                                header : new sap.m.Label({
                                    text : "Cbod"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : tot_bod
                                })
                            }), new sap.m.Column({
                                width: "18%",
                                header : new sap.m.Label({
                                    text : "Decl"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : tot_decl
                                })
                            }), new sap.m.Column({
                                width: "20%",
                                
                                header : new sap.m.Label({
                                    text : "Est"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : tot_Est
                                })
                            }), new sap.m.Column({
                                width: "18%",
                                header : new sap.m.Label({
                                    text : "Arr"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : ""
                                })
                            }), new sap.m.Column({
                                width: "10%",
                                header : new sap.m.Label({
                                    text : "DA"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : ""
                                })
                            }), new sap.m.Column({
                                width: "70px",
                                visible: '{modelDistFlota>/ShowTdc}',
                                header : new sap.m.Label({
                                    text : "Tdc"
                                })
                            }), new sap.m.Column({
                                width: "120px",
                                visible: '{modelDistFlota>/ShowZonP}',
                                header : new sap.m.Label({
                                    text : "ZonP"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : ""
                                })
                            }), new sap.m.Column({
                                width: "70px",
                                visible: '{modelDistFlota>/ShowEstSisFrio}',
                                header : new sap.m.Label({
                                    text : "SisFrio"
                                })
                            }), new sap.m.Column({
                                width: "10%",
                                visible: false,
                                header : new sap.m.Label({
                                    text : "Semaforo"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : ""
                                })
                            }) ]
                        });
                        
                        var columnListItem = new sap.m.ColumnListItem({
                            cells : [ new sap.m.Text({
                                text : "{modelDistFlota>FlagEmba}",
                                class : ".sapMTextEMB"
                            }), new sap.m.Text({
                                text : "{modelDistFlota>descEmba}"
                            }), new sap.m.Text({
                                text : "{ parts: [ {path: 'modelDistFlota>cbodEmba'}], formatter : '.formatter.formatoEnteros'}"
                            }), new sap.m.Text({
                                text : "{ parts: [ {path: 'modelDistFlota>pescDecl'}], formatter : '.formatter.formatoEnteros'}"
                            }), new sap.m.Text({
                                text : "{modelDistFlota>estado}"
                            }), new sap.m.Text({
                                text : "{ parts: [ {path: 'modelDistFlota>horaArribo'}], formatter : '.formatter.formatoHoraPlanta'}"
                            }), new sap.ui.core.Icon({
                                src : "sap-icon://color-fill",
                                color: "#FF122A"
                            }), new sap.m.Text({
                                text : "{modelDistFlota>tdc}"
                            }), new sap.m.Text({
                                text : "{modelDistFlota>descZonaCala}"
                            }), new sap.m.Text({
                                text : "{modelDistFlota>estSisFrio}"
                            }), new sap.m.Text({
                                text : "{modelDistFlota>zonP}"
                            }), new sap.m.Text({
                                text : "{modelDistFlota>semaforo}",
                            }), ]
                        });


                        oTable.bindAggregation("items", { path:rowstableDistribucion, template:columnListItem });

                            this.objMTable.push({table:oTable, hbox:oHBoxDistribucionPlanta});
                            //this.arrHBox.push(oHBoxDistribucion);


                            oHBoxDistribucion.addItem(oHBoxDistribucionPlanta);

                            oHBoxDistribucionPlanta.addItem(oPanelDistribucionPlanta);

                            oPanelDistribucionPlanta.addContent(TabBarZonaPlanta);

                            TabBarZonaPlanta.addItem(iconTabFilterPlanta);

                            iconTabFilterPlanta.addContent(oHBoxPlantaBase);

                            oHBoxPlantaBase.addItem(oHBoxPlanta);

                            oHBoxPlanta.addItem(oPanelPlanta);

                            oPanelPlanta.addContent(oTable);

                            oHBoxDistribucion.placeAt("__bar1");
                        }
                    }
                }
                listPlantas.push({"codPlanta": "0", "descPlanta": "TODOS"});
                self.getView().getModel("modelDistFlota").setProperty("/ListPlantaCbo", listPlantas);
            },

            _onOpenDialogMovEmbarcacion: function() { //_onOpenDialogCentro
                    this.CargaMovEmba();
                    this._getDialogMovEmbarcacion().open();
            },

            _onCloseDialogMovEmbarcacion: function() {
                    this._getDialogMovEmbarcacion().close();
            },

            _PressMoverEmbarcacion: function() {
                    this.MoverEmbarcacion();
            },

            _getDialogMovEmbarcacion : function () {
                    if (!this._oDialogMoverEmbarcacion) { 
                        this._oDialogMoverEmbarcacion = sap.ui.xmlfragment("tasa.com.distribucionflota.view.DlgMoverEmbarcacion", this.getView().getController());
                        this.getView().addDependent(this._oDialogMoverEmbarcacion);
                    }
                    return this._oDialogMoverEmbarcacion;
            }   

        });
    });
