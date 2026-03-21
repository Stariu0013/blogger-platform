import express from "express";
import {setupApp} from "../../src/setupApp";
import {runDB, stopDb} from "../../src/core/db/mongo.db";
import {MongoMemoryServer} from "mongodb-memory-server";
import {clearDb} from "../utils/clearDb";
import request from "supertest";
import {APP_ROUTES} from "../../src/core/routes";
import {generateBasicAuthToken} from "../utils/generateBasicAuthToken";
import {HttpStatuses} from "../../src/core/types/http-statuses";

describe('security devices', () => {
    const app = express()
    setupApp(app)

    const adminToken = generateBasicAuthToken()

    const userA = {email: 'userA@gmail.com', login: 'userA', password: 'Password1'}
    const userB = {email: 'userB@gmail.com', login: 'userB', password: 'Password2'}

    const login = async (loginOrEmail: string, password: string) => {
        const res = await request(app)
            .post(`${APP_ROUTES.LOGIN}/login`)
            .send({loginOrEmail, password})
        return {
            accessToken: res.body.accessToken as string,
            refreshToken: res.headers['set-cookie']?.[0] as string,
            status: res.status,
        }
    }

    let mongoServer: MongoMemoryServer

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        await runDB(mongoServer.getUri())
        await clearDb(app)

        await request(app).post(APP_ROUTES.USERS).set({authorization: adminToken}).send(userA)
        await request(app).post(APP_ROUTES.USERS).set({authorization: adminToken}).send(userB)
    }, 120000)

    afterAll(async () => {
        await stopDb()
        await mongoServer.stop()
    })

    afterEach(async () => {
        await clearDb(app)
        await request(app).post(APP_ROUTES.USERS).set({authorization: adminToken}).send(userA)
        await request(app).post(APP_ROUTES.USERS).set({authorization: adminToken}).send(userB)
    })

    describe('GET /security/devices', () => {
        it('should return 1 session after login', async () => {
            const {refreshToken} = await login(userA.login, userA.password)

            const res = await request(app)
                .get(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', refreshToken)

            expect(res.status).toBe(HttpStatuses.OK)
            expect(res.body).toHaveLength(1)
            expect(res.body[0]).toEqual({
                ip: expect.any(String),
                title: expect.any(String),
                lastActiveDate: expect.any(String),
                deviceId: expect.any(String),
            })
        })

        it('should return 2 sessions after two logins', async () => {
            await login(userA.login, userA.password)
            const {refreshToken} = await login(userA.login, userA.password)

            const res = await request(app)
                .get(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', refreshToken)

            expect(res.status).toBe(HttpStatuses.OK)
            expect(res.body).toHaveLength(2)
        })

        it('should return 401 without refresh token cookie', async () => {
            const res = await request(app).get(`${APP_ROUTES.SECURITY}/devices`)

            expect(res.status).toBe(HttpStatuses.UNAUTHORIZED)
        })
    })

    describe('DELETE /security/devices', () => {
        it('should delete all sessions except current', async () => {
            await login(userA.login, userA.password)
            await login(userA.login, userA.password)
            const {refreshToken} = await login(userA.login, userA.password)

            const deleteRes = await request(app)
                .delete(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', refreshToken)

            expect(deleteRes.status).toBe(HttpStatuses.NO_CONTENT)

            const getRes = await request(app)
                .get(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', refreshToken)

            expect(getRes.status).toBe(HttpStatuses.OK)
            expect(getRes.body).toHaveLength(1)
        })

        it('should return 401 without refresh token cookie', async () => {
            const res = await request(app).delete(`${APP_ROUTES.SECURITY}/devices`)

            expect(res.status).toBe(HttpStatuses.UNAUTHORIZED)
        })
    })

    describe('DELETE /security/devices/:deviceId', () => {
        it('should delete specific session and return 204', async () => {
            const {refreshToken: rtA} = await login(userA.login, userA.password)
            const {refreshToken: rtB} = await login(userA.login, userA.password)

            const listRes = await request(app)
                .get(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', rtB)

            const deviceIdToDelete = listRes.body[0].deviceId

            const deleteRes = await request(app)
                .delete(`${APP_ROUTES.SECURITY}/devices/${deviceIdToDelete}`)
                .set('Cookie', rtB)

            expect(deleteRes.status).toBe(HttpStatuses.NO_CONTENT)

            const afterRes = await request(app)
                .get(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', rtB)

            expect(afterRes.body).toHaveLength(1)
            expect(afterRes.body[0].deviceId).not.toBe(deviceIdToDelete)
        })

        it('should return 403 when deleting another user\'s session', async () => {
            const {refreshToken: rtA} = await login(userA.login, userA.password)
            const {refreshToken: rtB} = await login(userB.login, userB.password)

            const listRes = await request(app)
                .get(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', rtA)

            const userADeviceId = listRes.body[0].deviceId

            const deleteRes = await request(app)
                .delete(`${APP_ROUTES.SECURITY}/devices/${userADeviceId}`)
                .set('Cookie', rtB)

            expect(deleteRes.status).toBe(HttpStatuses.FORBIDDEN)
        })

        it('should return 404 for non-existent deviceId', async () => {
            const {refreshToken} = await login(userA.login, userA.password)

            const res = await request(app)
                .delete(`${APP_ROUTES.SECURITY}/devices/non-existent-device-id`)
                .set('Cookie', refreshToken)

            expect(res.status).toBe(HttpStatuses.NOT_FOUND)
        })

        it('should return 401 without refresh token cookie', async () => {
            const res = await request(app).delete(`${APP_ROUTES.SECURITY}/devices/some-id`)

            expect(res.status).toBe(HttpStatuses.UNAUTHORIZED)
        })
    })

    describe('session invalidation', () => {
        it('old refresh token should be rejected after logout', async () => {
            const {refreshToken} = await login(userA.login, userA.password)

            await request(app)
                .post(`${APP_ROUTES.LOGIN}/logout`)
                .set('Cookie', refreshToken)

            const res = await request(app)
                .get(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', refreshToken)

            expect(res.status).toBe(HttpStatuses.UNAUTHORIZED)
        })

        it('terminated sessions\' refresh tokens should be rejected after delete-all', async () => {
            const {refreshToken: rtOld} = await login(userA.login, userA.password)
            const {refreshToken: rtCurrent} = await login(userA.login, userA.password)

            await request(app)
                .delete(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', rtCurrent)

            const res = await request(app)
                .get(`${APP_ROUTES.SECURITY}/devices`)
                .set('Cookie', rtOld)

            expect(res.status).toBe(HttpStatuses.UNAUTHORIZED)
        })
    })
})
