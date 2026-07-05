"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = masterRoutes;
const handlers_1 = require("./handlers");
function masterRoutes(app) {
    app.get("/countries", handlers_1.handleGetCountries);
    app.get("/states", handlers_1.handleGetStates);
    app.get("/cities", handlers_1.handleGetCities);
}
