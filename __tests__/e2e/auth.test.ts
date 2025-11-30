import express from "express";
import {setupApp} from "../../src/setupApp";
import { runDB } from "../../src/core/db/mongo.db";
import {Settings} from "../../src/core/settings/settings";
import {clearDb} from "../utils/clearDb";
import request from "supertest";
import {APP_ROUTES} from "../../src/core/routes";
import {generateBasicAuthToken} from "../utils/generateBasicAuthToken";
import {HttpStatuses} from "../../src/core/types/http-statuses";

describe('auth', () => {
    const app = express();
    setupApp(app);

    const authToken = generateBasicAuthToken();
    let accessToken = '';

    beforeAll(async () => {
        await runDB(Settings.MONGO_URL);
        await clearDb(app);
    });

    const testUserData = {
        email: 'test@gmail.com',
        login: 'username1',
        password: 'Password'
    };

    it('should create user and return accessToken', async () => {
        const res = await request(app).post(`${APP_ROUTES.USERS}`).set({
            authorization: authToken
        }).send(testUserData);

        expect(res.status).toBe(HttpStatuses.CREATED);

        const loginResponse = await request(app).post(`${APP_ROUTES.LOGIN}/login`).send({
            loginOrEmail: testUserData.login,
            password: testUserData.password
        });

        accessToken = loginResponse.body.accessToken;

        expect(loginResponse.status).toBe(HttpStatuses.OK);
        expect(accessToken).toBeDefined();
    });

    it('/me should set user to request', async () => {
        const res = await request(app).get(`${APP_ROUTES.LOGIN}/me`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(res.status).toBe(HttpStatuses.OK);
        expect(res.body).toEqual({
            login: testUserData.login,
            email: testUserData.email,
            userId: expect.any(String)
        });
    });
    it('/me should throw error for no token provided', async () => {
        const res = await request(app).get(`${APP_ROUTES.LOGIN}/me`)

        expect(res.status).toBe(HttpStatuses.UNAUTHORIZED);
    });

    it('should throw error on incorrect token', async () => {
        const res = await request(app).get(`${APP_ROUTES.LOGIN}/me`).set({
            authorization: `Bearer bla bla`
        });

        expect(res.status).toBe(HttpStatuses.UNAUTHORIZED);
    });
    it('should return error on login for empty data', async () => {
        const res = await request(app).post(`${APP_ROUTES.LOGIN}/login`).send({
            loginOrEmail: '',
            password: ''
        });

        expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
        expect(res.body.errorsMessages.length).toBe(2);
    });
    it('should return error on login for incorrect data', async () => {
        const res = await request(app).post(`${APP_ROUTES.LOGIN}/login`).send({
            loginOrEmail: 'login',
            password: 'password'
        });

        expect(res.status).toBe(HttpStatuses.UNAUTHORIZED);
    });
})