/*global QUnit*/

sap.ui.define([
	"tasacom./distribucionflota/controller/DistribucionFlota.controller"
], function (Controller) {
	"use strict";

	QUnit.module("DistribucionFlota Controller");

	QUnit.test("I should test the DistribucionFlota controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
