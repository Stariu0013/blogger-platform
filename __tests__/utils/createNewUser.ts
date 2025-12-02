import {generateBasicAuthToken} from "./generateBasicAuthToken";
import {Express} from "express";
import request from "supertest";
import {APP_ROUTES} from "../../src/core/routes";
import {HttpStatuses} from "../../src/core/types/http-statuses";

const authToken = generateBasicAuthToken();
const testUserData = {
    email: 'test@gmail.com',
    login: 'username1',
    password: 'Password'
};

export async function createNewUserAndReturnAccessToken(app: Express) {
    const res = await request(app).post(`${APP_ROUTES.USERS}`).set({
        authorization: authToken
    }).send(testUserData);

    expect(res.status).toBe(HttpStatuses.CREATED);

    const loginResponse = await request(app).post(`${APP_ROUTES.LOGIN}/login`).send({
        loginOrEmail: testUserData.login,
        password: testUserData.password
    });

    const accessToken = loginResponse.body.accessToken;

    await request(app).get(`${APP_ROUTES.LOGIN}/me`).set({
        authorization: `Bearer ${accessToken}`
    });

    return accessToken;
}