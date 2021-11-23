sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "tasa/com/requerimientopescaxplanta/util/formatter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageBox, formatter) {
		"use strict";

		return Controller.extend("tasa.com.requerimientopescaxplanta.controller.Main", {
            formatter: formatter,
			onInit: function () {
                this.getView().getModel("modelReqPescaxPlanta").setProperty("/SearchTemporada", {});
                this.getView().getModel("modelReqPescaxPlanta").setProperty("/SearchListar", {});
                
            },    

            _onBuscarButtonPress: function () {
                this.searchTemporada();
            },

            _onButtonPressLimpiar: function () {
                this._onButtonLimpiar();
            },

            _onButtonLimpiar: function() {
                var self = this;
                self.getView().getModel("modelReqPescaxPlanta").setProperty("/SearchTemporada/FHITM", "");
                self.getView().getModel("modelReqPescaxPlanta").setProperty("/SearchTemporada/FHFTM", "");
                self.getView().getModel("modelReqPescaxPlanta").setProperty("/SearchTemporada/CDPCN", "");
                self.getView().getModel("modelReqPescaxPlanta").setProperty("/ListReqPlanta", {});
            },              

            ejecutarReadTable: function (table, options, user, numfilas, model, property) {

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
                        self.getView().getModel(model).setProperty(property, data.data);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },

            handleLiveChange : function(oEvent){
                var aFilter = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery) {
                    aFilter.push(new Filter("zdszar", FilterOperator.Contains, sQuery));
                }

                    // filter binding
                var oList = this.getView().byId("tbl_reqpescaxplanta");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilter);

            },         
            
            onExportar:function(oEvent){
                let oMaster=oEvent.getSource().getBindingContext().getObject(),
                aFields = oMaster.fields.filter(oField=>oField.CONTROLTABLE),
                aColumns=this.createColumnsExport(aFields),
                oTable=this.getView().byId("tbl_reqpescaxplanta"),
                aItems = oTable.getModel("modelReqPescaxPlanta").getProperty("/ListReqPlanta");
                if(!aItems){
                    let sMessage = "No hay datos para exportar",
                    sTypeDialog="Warning"
                    this.getController().getMessageDialog(sTypeDialog,sMessage);
                    return;
                }
                // oRowBinding=oTable.getBinding('items'),
                let oSettings = {
                    workbook: { columns: aColumns },
                    dataSource: aItems,
                    fileName: 'Tabla.xlsx',
                    worker: false 
                },
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },            

            searchTemporada: function () {

                var self = this;
                var cdpcn = self.getView().getModel("modelReqPescaxPlanta").getProperty("/SearchTemporada").CDPCN;
                var dspcn = self.getView().getModel("modelReqPescaxPlanta").getProperty("/SearchTemporada").DSPCN;
                var fhitm = self.getView().getModel("modelReqPescaxPlanta").getProperty("/SearchTemporada").FHITM;
                var fhftm = self.getView().getModel("modelReqPescaxPlanta").getProperty("/SearchTemporada").FHFTM;

                var numfilas = self.getView().getModel("modelReqPescaxPlanta").getProperty("/SearchTemporada").Numfilas;
                
                if (!numfilas) numfilas = 50;
                            
                var table = "ZV_FLTZ";
                var user = "FGARCIA";
                var model = "modelReqPescaxPlanta";
                var property = "/ListTemporada";
                var options = [];
                if (cdpcn) options.push({ cantidad: "40", control: "INPUT", "key": "CDPCN", valueHigh: "", valueLow: cdpcn }); 
                if (dspcn) options.push({ cantidad: "40", control: "INPUT", "key": "DSPCN", valueHigh: "", valueLow: dspcn }); 
                if (fhitm) options.push({ cantidad: "40", control: "INPUT", "key": "FHITM", valueHigh: "", valueLow: fhitm }); 
                if (fhftm) options.push({ cantidad: "40", control: "INPUT", "key": "FHFTM", valueHigh: "", valueLow: fhftm }); 
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property);                
            
            },

            _onpress_centrolinkreqpesca: function (oEvent) {
                let mod = oEvent.getSource().getBindingContext("modelReqPescaxPlanta");
                let data  =mod.getObject();

                var cdpcn = data.CDPCN;
                var fhitm = data.FHITM;
                var fhftm = data.FHFTM;
                var zcdzar = data.ZCDZAR;
                var self = this;

                self.getView().getModel('modelReqPescaxPlanta').setProperty("/SearchTemporada/CDPCN",cdpcn);
                self.getView().getModel('modelReqPescaxPlanta').setProperty("/SearchTemporada/FHITM",fhitm);
                self.getView().getModel('modelReqPescaxPlanta').setProperty("/SearchTemporada/FHFTM",fhftm);
                self.getView().getModel('modelReqPescaxPlanta').setProperty("/SearchTemporada/ZCDZAR",zcdzar);
                self._onCloseDialogTemporada();
            },
                
            _onSearchReqButton: function () {
                this.searchReqPesca();
            },
  
            _onCargaReqButton: function () {
                this.cargarReqPesca();
            },

            searchReqPesca: function () {
                this.admReqPesca("L");
            },

            cargarReqPesca: function () {
                this.admReqPesca("C");
                //MessageBox.success("Registro grabado satisfactoriamente");
            },

            admReqPesca: function(tpope) {
                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                var validar = true;
                var fhitm = self.getView().getModel("modelReqPescaxPlanta").getProperty("/SearchTemporada").FHITM;
                var fhftm = self.getView().getModel("modelReqPescaxPlanta").getProperty("/SearchTemporada").FHFTM;
                var zcdzar = self.getView().getModel("modelReqPescaxPlanta").getProperty("/SearchTemporada").ZCDZAR;

                if(tpope === "L"){

                    if ((fhitm && fhitm) || zcdzar) {

                            var objectRT = {
                                "fieldReqPesca": [],
                                "ip_ffint": fhftm,
                                "ip_finit": fhitm,
                                "ip_tpope": "L",
                                "ip_zona": zcdzar,
                                "it_zflrps": [
                                    {
                                    "NRREQ": "",                                    
                                    "CDPTA": "",
                                    "ZDSZAR": "",
                                    "FHREQ": "",
                                    "HRREQ": "",
                                    "CNPRQ": "",
                                    "CNPCM": "",
                                    "AUFNR": ""         
                                    }
                                ]
                            };
                            var urlPost = urlNodeJS + "/api/requerimientopesca/listar";
                            validar = true
                    } else {
                        validar = false;
                        MessageBox.error("Faltan datos a seleccionar.");
                        //break;
                    }
                }
                
                if(tpope === "C"){
                    
                    if (validar) {
                    
                        var zflrps = [];
                        var modelReqPescaxPlanta = self.getView().getModel("modelReqPescaxPlanta").getData();
                        var oSelectedItem = self.byId("tbl_reqpescaxplanta").getSelectedIndices(); 
                        if (oSelectedItem > 0) {

                            for (var i = 0; i < oSelectedItem.length; i++) {
                                
                                var indice = oSelectedItem[i];

                                    var itemSelected = modelReqPescaxPlanta.ListReqPlanta[indice];

                                    var nrreq = itemSelected.nrreq;
                                    var cdpta = itemSelected.cdpta;
                                    var zdszar = itemSelected.zdszar;
                                    var fhreq = itemSelected.fhreq;
                                    var hrreq = itemSelected.hrreq;
                                    var cnprq = itemSelected.cnprq;
                                    var cnpcm = itemSelected.cnpcm;
                                    var aufnr = itemSelected.aufnr;

                                    fhreq = fhreq.replaceAll("-", "");
                                    hrreq = hrreq.replaceAll(":", "");

                                    zflrps.push({ NRREQ: nrreq,
                                                CDPTA: cdpta,
                                                ZDSZAR: zdszar,
                                                FHREQ: fhreq,
                                                HRREQ: hrreq,
                                                CNPRQ: cnprq,
                                                CNPCM: cnpcm,
                                                AUFNR: aufnr});
                            }

                            var objectRT ={ 
                                "fieldReqPesca": [],
                                "ip_ffint": fhftm,
                                "ip_finit": fhitm,
                                "ip_tpope": "C",
                                "ip_zona": zcdzar,
                                "it_zflrps": zflrps
                            }
                
                            var urlPost = urlNodeJS + "/api/requerimientopesca/registrar";
                            
                            validar = true;
                        } else {
                            validar = false;
                            MessageBox.error("No se selecciono ninguna planta.");
                        }
                    }
                }

                if (validar) {
                    $.ajax({
                        url: urlPost,
                        type: 'POST',
                        cache: false,
                        async: false,
                        dataType: 'json',
                        data: JSON.stringify(objectRT),
                        success: function (data, textStatus, jqXHR) {
                            if (tpope === 'C') {
                                MessageBox.success("Registro grabado satisfactoriamente.");
                            } else {
                                self.getView().getModel("modelReqPescaxPlanta").setProperty("/ListReqPlanta", data.s_reqpesca);
                                self.getView().getModel("modelReqPescaxPlanta").setProperty("/RowListReqPlanta", data.s_reqpesca.length);
                            }
                            console.log(data);
                        },
                        error: function (xhr, readyState) {
                            console.log(xhr);
                        }
                    });
                }
            },

            _onOpenDialogTemporada: function() {
            this._getDialogTemporada().open();
            },

            _onCloseDialogTemporada: function() {
                this._getDialogTemporada().close();
            },

            _getDialogTemporada : function () {
                if (!this._oDialogTemporada) {
                    this._oDialogTemporada = sap.ui.xmlfragment("tasa.com.requerimientopescaxplanta.view.DlgTemporada", this.getView().getController());
                    this.getView().addDependent(this._oDialogTemporada);
                }
                return this._oDialogTemporada;
            }
		});
	});