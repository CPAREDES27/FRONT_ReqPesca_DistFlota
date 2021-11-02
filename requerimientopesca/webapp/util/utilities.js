sap.ui.define([
	"./utilities",
	"com/sap/minsur/GestCom/Constante"
], function (util, Constantes) {
	"use strict";

	// class providing static utility methods to retrieve entity default values.

	return {

		loadComboStd2: function (table, filterKey, filterAtt, filterVal, option) {
			var filterOpt = '';
			var filtro_pn = '?$filter=' + filterKey + '%20ne%20%27X%27';
			var oJsonModel = new sap.ui.model.json.JSONModel();

			if (!this.estaVacio(filterAtt)) filterOpt = ' and ' + filterAtt + '%20eq%20%27' + filterVal + '%27';
			var xsodata = this.getServiceInstance();
			var urlQuery = '/xshana/syscom/services/' + xsodata + '/' + table + filtro_pn + filterOpt + '&$format=json';

			var aData = jQuery.ajax({
				method: 'GET',
				async: false,
				cache: false,
				url: urlQuery
			}).then(
				function successCallback(response) {
					oJsonModel.setData({
						results: response.d.results
					});
					oJsonModel.setSizeLimit(500);
				},
				function errorCallback(response) {
					var a = response;
				});

			return oJsonModel;

		},

		loadComboStd3: function (idCombo, table, filterKey, filterAtt, filterVal, option) {
			var oView = this.getView();
			var filterOpt = '';
			var filtro_pn = '?$filter=' + filterKey + '%20ne%20%27X%27';

			if (!util.estaVacio(filterAtt)) filterOpt = ' and ' + filterAtt + '%20eq%20%27' + filterVal + '%27';
			var xsodata = this.getServiceInstance();
			var urlQuery = '/xshana/syscom/services/' + xsodata + '/' + table + filtro_pn + filterOpt + '&$format=json';

			var results;

			var aData = jQuery.ajax({
				method: 'GET',
				async: false,
				cache: false,
				url: urlQuery
			}).then(
				function successCallback(response) {
					var oJsonModel = new sap.ui.model.json.JSONModel();
					results = response.d.results;
					oJsonModel.setData({
						results: response.d.results
					});
					oJsonModel.setSizeLimit(500);
					oView.byId(idCombo).setModel(oJsonModel);
					return oJsonModel;
				},
				function errorCallback(response) {
					var a = response;
				});

			return results;

		},

		loadComboStd: function (self, idCombo, table, filterKey, filterAtt, filterVal, option) {
			var filterOpt = '';
			var filtro_pn = '?$filter=' + filterKey + '%20ne%20%27X%27';
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var that = this;

			if (!that.estaVacio(filterAtt)) filterOpt = ' and ' + filterAtt + '%20eq%20%27' + filterVal + '%27';
			var xsodata = that.getServiceInstance();
			var urlQuery = '/xshana/syscom/services/' + xsodata + '/' + table + filtro_pn + filterOpt + '&$format=json';
			var results;

			var aData = jQuery.ajax({
				method: 'GET',
				async: false,
				cache: false,
				url: urlQuery
			}).then(
				function successCallback(response) {
					results = response.d.results;
					oJsonModel.setData({
						results: response.d.results
					});
					oJsonModel.setSizeLimit(500);
					if (!that.estaVacio(idCombo)) {
						var object = that.asignarObject(self, idCombo);
						if (object) object.setModel(oJsonModel);
					}
				},
				function errorCallback(response) {
					var a = response;
				}
			);

			return oJsonModel;

		},

		msToTime: function (s) {
			var ms = s % 1000;
			s = (s - ms) / 1000;
			var secs = s % 60;
			s = (s - secs) / 60;
			var mins = s % 60;
			var hrs = (s - mins) / 60;
			if (hrs.toString().length == 1) hrs = "0" + hrs;
			if (mins.toString().length == 1) mins = "0" + mins;
			if (secs.toString().length == 1) secs = "0" + secs;

			return hrs + ':' + mins + ':' + secs;
		},

		formatDate: function (date) {
			if (date) {
				var dia = date.getDay();
				var mes = date.getMonth() + 1;
				var anio = date.getFullYear();
				if (dia.toString().length == 1) dia = "0" + dia;
				if (mes.toString().length == 1) mes = "0" + mes;

				return dia + '/' + mes + '/' + anio;
			} else {
				return "";
			}
		},

		estaVacio: function (inputStr) {

			var flag = false;
			if (inputStr === '') {
				flag = true;
			}
			if (inputStr === null) {
				flag = true;
			}
			if (inputStr === undefined) {
				flag = true;
			}
			if (inputStr === null) {
				flag = true;
			}

			return flag;
		},

		asignarObject: function (self, id) {
			return self.getView().byId(id);
		},

		formatDateBackend: function (date) {
			if (date.substr(2, 1) === "/") date = date.substr(6, 4) + "/" + date.substr(3, 2) + "/" + date.substr(0, 2);
			date = new Date(date).getTime();
			date = "/Date(" + date + ")/";
			return date;
		},
		
		formatTimeBackend: function (time){
			if (time.substr(2, 1) === ":") time = "PT" + time.substr(0, 2) + "H" + time.substr(3, 2) + "M" + time.substr(6, 2) + "S";
			return time;
		},

		getHoraActual: function () {
			var now = new Date();
			var horas = now.getHours().toString();
			if (horas.length === 1) horas = "0" + horas;
			var minutos = now.getMinutes().toString();
			if (minutos.length === 1) minutos = "0" + minutos;
			var segundos = now.getSeconds().toString();
			if (segundos.length === 1) segundos = "0" + segundos;
			var horaActual = "PT" + horas + "H" + minutos + "M" + segundos + "S";
			return horaActual;
		},

		getServiceInstance: function () {
			var urlInstance = window.location.origin;
			var serviceHana = Constantes.xsodata.DEV;
			if (urlInstance.indexOf(Constantes.instancia.DEV) !== -1) {
				serviceHana = Constantes.xsodata.DEV;
			} else if (urlInstance.indexOf(Constantes.instancia.QAS) !== -1) {
				serviceHana = Constantes.xsodata.QAS;
			} else if (urlInstance.indexOf(Constantes.instancia.PRD) !== -1) {
				serviceHana = Constantes.xsodata.PRD;
			}
			return serviceHana;
		}

	};
});