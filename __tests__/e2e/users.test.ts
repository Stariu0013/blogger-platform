import express from "express";
import {setupApp} from "../../src/setupApp";
import request from "supertest";
import {APP_ROUTES} from "../../src/core/routes";
import {HttpStatuses} from "../../src/core/types/http-statuses";
import runDB from "../../src/core/db/mongo.db";
import {Settings} from "../../src/core/settings/settings";
import {clearDb} from "../utils/clearDb";
import {generateBasicAuthToken} from "../utils/generateBasicAuthToken";

describe('Users API', () => {
    const app = express();
    const authToken = generateBasicAuthToken();
    const testUser = {
        login: 'test',
        email: 'test@gmail.com',
        password: 'test'
    };

    setupApp(app);

    beforeEach(async () => {
        await request(app).delete(APP_ROUTES.TESTING + '/all-data').expect(HttpStatuses.NO_CONTENT);
    });

    beforeAll(async () => {
        await runDB(Settings.MONGO_URL);
        await clearDb(app);
    })

    it('should return empty array', async () => {
        const res = await request(app).get(APP_ROUTES.USERS);

        expect(res.body).toEqual({
            items: [],
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0
        });
        expect(res.status).toBe(HttpStatuses.OK);
    });
    it('should create user and return it', async () => {
        const res = await request(app).post(APP_ROUTES.USERS).set({
            authorization: authToken
        }).send(testUser);

        expect(res.status).toBe(HttpStatuses.CREATED);
        expect(res.body).toEqual({
            id: expect.any(String),
            login: testUser.login,
            email: testUser.email,
            createdAt: expect.any(String)
        })
    });
    it('should create and delete user', async () => {
        const createdUserResponse = await request(app).post(APP_ROUTES.USERS).set({
            authorization: authToken
        }).send(testUser);
        const createdUserId = createdUserResponse.body.id;

        expect(createdUserResponse.status).toBe(HttpStatuses.CREATED);
        expect(createdUserResponse.body).toEqual({
            id: expect.any(String),
            login: testUser.login,
            email: testUser.email,
            createdAt: expect.any(String)
        });

        const deleteUserResponse = await request(app).delete(`${APP_ROUTES.USERS}/${createdUserId}`).set({
            authorization: authToken
        });

        expect(deleteUserResponse.status).toBe(HttpStatuses.NO_CONTENT);
        expect(deleteUserResponse.body).toEqual({});

        const res = await request(app).get(APP_ROUTES.USERS);

        expect(res.body).toEqual({
            items: [],
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0
        });
        expect(res.status).toBe(HttpStatuses.OK);
    });

    it('should return error if user not authorized', async () => {
        const res = await request(app).post(APP_ROUTES.USERS).send(testUser);

        expect(res.status).toBe(HttpStatuses.UNAUTHORIZED);
    });
    it('should return error if empty fields', async () => {
        const res = await request(app).post(APP_ROUTES.USERS).set({
            authorization: authToken
        }).send({
            login: '     ',
            email: '     ',
            password: '     '
        });

        expect(res.body.errorsMessages.length).toBe(3);
    });
    it('should return error if user already exists', async () => {
        await request(app).post(APP_ROUTES.USERS).set({
            authorization: authToken
        }).send(testUser);

        const res = await request(app).post(APP_ROUTES.USERS).set({
            authorization: authToken
        }).send(testUser);

        expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
    })
})