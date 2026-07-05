import { FastifyReply, FastifyRequest } from "fastify";
import { countryData } from "../../data";

export const handleGetCountries = (req: FastifyRequest, res: FastifyReply) => {
  const countries = Object.keys(countryData);
  res.status(200).send({ data: countries });
};

export const handleGetStates = (req: FastifyRequest, res: FastifyReply) => {
  const { country } = req.query as { country: string };
  const states = Object.keys(countryData[country]);
  res.status(200).send({ data: states });
};

export const handleGetCities = (req: FastifyRequest, res: FastifyReply) => {
  const { state, country } = req.query as { state: string; country: string };
  const cities = countryData[country][state];
  res.status(200).send({ data: cities });
};