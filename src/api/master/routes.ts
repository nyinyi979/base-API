import { FastifyInstance } from "fastify";
import {
  handleGetCities,
  handleGetCountries,
  handleGetStates,
} from "./handlers";

export default function masterRoutes(app: FastifyInstance) {
  app.get("/countries", handleGetCountries);
  app.get("/states", handleGetStates);
  app.get("/cities", handleGetCities);
}
