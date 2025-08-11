import request from "supertest";
import {Express} from "express";
import {APP_ROUTES} from "../../src/core/routes";
import {HttpStatuses} from "../../src/core/types/http-statuses";

export async function clearDb(app: Express) {
    await request(app).delete(`${APP_ROUTES.TESTING}/all-data`).expect(HttpStatuses.NO_CONTENT);
}