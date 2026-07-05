"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetCities = exports.handleGetStates = exports.handleGetCountries = void 0;
const data_1 = require("../../data");
const handleGetCountries = (req, res) => {
    const countries = Object.keys(data_1.countryData);
    res.status(200).send({ data: countries });
};
exports.handleGetCountries = handleGetCountries;
const handleGetStates = (req, res) => {
    const { country } = req.query;
    const states = Object.keys(data_1.countryData[country]);
    res.status(200).send({ data: states });
};
exports.handleGetStates = handleGetStates;
const handleGetCities = (req, res) => {
    const { state, country } = req.query;
    const cities = data_1.countryData[country][state];
    res.status(200).send({ data: cities });
};
exports.handleGetCities = handleGetCities;
