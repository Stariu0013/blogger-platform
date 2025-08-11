import express from 'express';
import request from 'supertest';
import {setupApp} from "../../src/setupApp";
import {APP_ROUTES} from "../../src/core/routes";
import {BlogInputModel} from "../../src/blogs/types/blogs.input-dto";
import {HttpStatuses} from "../../src/core/types/http-statuses";
import {generateBasicAuthToken} from "../utils/generateBasicAuthToken";
import runDB from "../../src/core/db/mongo.db";
import {Settings} from "../../src/core/settings/settings";
import {clearDb} from "../utils/clearDb";

describe('Blogs API', () => {
    const app = express();
    setupApp(app);

    beforeAll(async () => {
        await runDB(Settings.MONGO_URL);
        await clearDb(app);
    })

    const testBlog: BlogInputModel = {
        name: 'Blog 1',
        description: 'Blog 1 description',
        websiteUrl: 'https://blog1.com',
    };

    const authToken = generateBasicAuthToken();

    it(`get auth error on delete blog`, async () => {
        const createdBlog = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);

        const createdBlogId = createdBlog.body.id;

        await request(app).delete(`${APP_ROUTES.BLOGS}/${createdBlogId}`).expect(HttpStatuses.UNAUTHORIZED);
    });
    it(`get auth error on update blog`, async () => {
        const createdBlog = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);

        const createdBlogId = createdBlog.body.id;

        await request(app).put(`${APP_ROUTES.BLOGS}/${createdBlogId}`).send(testBlog).expect(HttpStatuses.UNAUTHORIZED);
    });
    it(`get auth error on create blog`, async () => {
        await request(app).post(APP_ROUTES.BLOGS).send(testBlog).expect(HttpStatuses.UNAUTHORIZED);
    });

    it(`should create and return blog`, async () => {
        const createdBlog = await request(app).post(APP_ROUTES.BLOGS).set(
            'Authorization', authToken
        ).send(testBlog);

        expect(createdBlog.status).toBe(HttpStatuses.CREATED);
        const targetId = createdBlog.body.id;

        const res = await request(app).get(`${APP_ROUTES.BLOGS}/${targetId}`);

        expect(res.body).toEqual({
            ...testBlog,
            id: expect.any(String),
        });
        expect(res.status).toBe(HttpStatuses.OK);
    });
    it(`should delete first blog`, async () => {
        const firstCreatedBlog = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);
        await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send({
                ...testBlog,
                name: 'Blog 2',
            })
            .expect(HttpStatuses.CREATED);

        const idToDelete = firstCreatedBlog.body.id;

        await request(app).delete(`${APP_ROUTES.BLOGS}/${idToDelete}`).set('Authorization', authToken).expect(HttpStatuses.NO_CONTENT);
    });
    it(`should update blog`, async () => {
        const firstCreatedBlog = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);

        await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send({
                ...testBlog,
                name: 'Blog 2',
            })
            .expect(HttpStatuses.CREATED);

        const targetId = firstCreatedBlog.body.id;
        const newBlogInfo = {
            name: 'New blog name',
            description: 'New blog description',
            websiteUrl: 'https://new-blog.com'
        };

        await request(app).put(`${APP_ROUTES.BLOGS}/${targetId}`)
            .set('Authorization', authToken)
            .send(newBlogInfo)
            .expect(HttpStatuses.NO_CONTENT);

        const targetBlog = await request(app).get(`${APP_ROUTES.BLOGS}/${targetId}`);

        expect(targetBlog.body).toEqual({
            ...newBlogInfo,
            id: expect.any(String),
        });
        expect(targetBlog.status).toBe(HttpStatuses.OK);
    });

    it(`should return validation errors with spaces`, async () => {
        const res = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send({
                name: '     ',
                description: '     ',
                websiteUrl: '     ',
            });

        expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
        expect(res.body.errorsMessages.length).toEqual(3);
    });
    it(`should return validation errors for huge text`, async () => {
        const hugeDescription = 'a'.repeat(501);
        const hugeName = 'a'.repeat(16);
        const hugeWebsiteUrl = 'a'.repeat(101);

        const res = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send({
                name: hugeName,
                description: hugeDescription,
                websiteUrl: hugeWebsiteUrl,
            }).expect(HttpStatuses.BAD_REQUEST);

        expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
        expect(res.body.errorsMessages.length).toEqual(3);
    });
    it(`should return validation error for websiteUrl(wrong protocol)`, async () => {
        const res = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send({
                ...testBlog,
                websiteUrl: 'http://blog1.com',
            }).expect(HttpStatuses.BAD_REQUEST);

        expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
        expect(res.body.errorsMessages.length).toEqual(1);
    });
    it(`should return validation error for websiteUrl(huge string)`, async () => {
        const res = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send({
                ...testBlog,
                websiteUrl: 'dklsahdh asjkdh jkasdjk hasjk dhkjas hdkjsa',
            }).expect(HttpStatuses.BAD_REQUEST);

        expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
        expect(res.body.errorsMessages.length).toEqual(1);
    });
});