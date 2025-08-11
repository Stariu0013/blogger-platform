import express from 'express';
import request from 'supertest';
import {setupApp} from "../../src/setupApp";
import {APP_ROUTES} from "../../src/core/routes";
import {BlogInputModel} from "../../src/blogs/types/blogs.input-dto";
import {HttpStatuses} from "../../src/core/types/http-statuses";
import {generateBasicAuthToken} from "../utils/generateBasicAuthToken";
import {PostInputModel} from "../../src/posts/types/post-input.model";
import {clearDb} from "../utils/clearDb";
import runDB from "../../src/core/db/mongo.db";
import {Settings} from "../../src/core/settings/settings";

describe('Posts API', () => {
    const app = express();
    setupApp(app);

    const testBlog: BlogInputModel = {
        name: 'Blog 1',
        description: 'Blog 1 description',
        websiteUrl: 'https://blog1.com',
    };

    let testPost: PostInputModel = {
        content: 'test content TEST',
        shortDescription: 'test description',
        title: 'test title',
    };

    const authToken = generateBasicAuthToken();

    beforeAll(async () => {
        await runDB(Settings.MONGO_URL);
        await clearDb(app);
    });

    beforeEach(async () => {
        await request(app).delete(APP_ROUTES.TESTING + '/all-data').expect(HttpStatuses.NO_CONTENT);
    });

    it(`get auth error on delete post`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS)
            .set('Authorization', authToken)
            .send(testPost)
            .expect(HttpStatuses.CREATED);

        const createdBlogId = createdPost.body.id;

        await request(app).delete(`${APP_ROUTES.POSTS}/${createdBlogId}`).expect(HttpStatuses.UNAUTHORIZED);
    });
    it(`get auth error on update post`, async () => {
        const createdBlog = await request(app).post(APP_ROUTES.POSTS)
            .set('Authorization', authToken)
            .send(testPost)
            .expect(HttpStatuses.CREATED);

        const createdBlogId = createdBlog.body.id;

        await request(app).put(`${APP_ROUTES.POSTS}/${createdBlogId}`).send(testBlog).expect(HttpStatuses.UNAUTHORIZED);
    });
    it(`get auth error on create post`, async () => {
        await request(app).post(APP_ROUTES.POSTS).send(testPost).expect(HttpStatuses.UNAUTHORIZED);
    });

    it(`should create and return post`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = createdPost.body.id;

        const res = await request(app).get(`${APP_ROUTES.POSTS}/${targetId}`);
        expect(res.body).toEqual({
            ...testPost,
            id: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.any(String),
        });
        expect(res.status).toBe(HttpStatuses.OK);
    });
    it(`should create and return error for incorrect id`, async () => {
        const INCORRECT_ID = "63189b06003380064c4193be";
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);

        const res = await request(app).delete(`${APP_ROUTES.POSTS}/${INCORRECT_ID}`).set(
            'Authorization', authToken
        );
        expect(res.status).toBe(HttpStatuses.NOT_FOUND);
    });
    it(`should get error while updating not existing post`, async () => {
        const INCORRECT_ID = "63189b06003380064c4193be";

        const newPostInfo: PostInputModel = {
            ...testPost,
            title: 'title dhas dggsa'
        };

        const res = await request(app).put(`${APP_ROUTES.POSTS}/${INCORRECT_ID}`).set(
            'Authorization', authToken
        ).send(newPostInfo);
        expect(res.status).toBe(HttpStatuses.NOT_FOUND);
    });
    it(`should delete first blog`, async () => {
        const firstCreatedBlog = await request(app).post(APP_ROUTES.POSTS)
            .set('Authorization', authToken)
            .send(testPost)
            .expect(HttpStatuses.CREATED);
        await request(app).post(APP_ROUTES.POSTS)
            .set('Authorization', authToken)
            .send({
                ...testPost,
                title: 'test title 2'
            })
            .expect(HttpStatuses.CREATED);

        const idToDelete = firstCreatedBlog.body.id;

        await request(app).delete(`${APP_ROUTES.POSTS}/${idToDelete}`).set('Authorization', authToken).expect(HttpStatuses.NO_CONTENT);
    });
    it(`should update post`, async () => {
        const firstCreatedPost = await request(app).post(APP_ROUTES.POSTS)
            .set('Authorization', authToken)
            .send(testPost)
            .expect(HttpStatuses.CREATED);

        await request(app).post(APP_ROUTES.POSTS)
            .set('Authorization', authToken)
            .send({
                ...testPost,
                title: 'test title 2'
            })
            .expect(HttpStatuses.CREATED);

        const targetId = firstCreatedPost.body.id;
        const newPostInfo: PostInputModel = {
            ...testPost,
            title: 'title dhas dggsa'
        };

        await request(app).put(`${APP_ROUTES.POSTS}/${targetId}`)
            .set('Authorization', authToken)
            .send(newPostInfo)
            .expect(HttpStatuses.NO_CONTENT);

        const targetPost = await request(app).get(`${APP_ROUTES.POSTS}/${targetId}`);

        expect(targetPost.body).toEqual({
            ...newPostInfo,
            blogName: expect.any(String),
            id: expect.any(String),
            createdAt: expect.any(String),
        });
        expect(targetPost.status).toBe(HttpStatuses.OK);
    });

    // it(`should return validation errors with spaces`, async () => {
    //     const res = await request(app).post(APP_ROUTES.BLOGS)
    //         .set('Authorization', authToken)
    //         .send({
    //             name: '     ',
    //             description: '     ',
    //             websiteUrl: '     ',
    //         });
    //
    //     expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
    //     expect(res.body.errorMessages.length).toEqual(3);
    // });
    // it(`should return validation errors for huge text`, async () => {
    //     const hugeDescription = 'a'.repeat(501);
    //     const hugeName = 'a'.repeat(16);
    //     const hugeWebsiteUrl = 'a'.repeat(101);
    //
    //     const res = await request(app).post(APP_ROUTES.BLOGS)
    //         .set('Authorization', authToken)
    //         .send({
    //             name: hugeName,
    //             description: hugeDescription,
    //             websiteUrl: hugeWebsiteUrl,
    //         }).expect(HttpStatuses.BAD_REQUEST);
    //
    //     expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
    //     expect(res.body.errorMessages.length).toEqual(3);
    // });
    // it(`should return validation error for websiteUrl`, async () => {
    //     const res = await request(app).post(APP_ROUTES.BLOGS)
    //         .set('Authorization', authToken)
    //         .send({
    //             ...testBlog,
    //             websiteUrl: 'http://blog1.com',
    //         }).expect(HttpStatuses.BAD_REQUEST);
    //
    //     expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
    //     expect(res.body.errorMessages.length).toEqual(1);
    // });
    // it(`should return validation error for websiteUrl`, async () => {
    //     const res = await request(app).post(APP_ROUTES.BLOGS)
    //         .set('Authorization', authToken)
    //         .send({
    //             ...testBlog,
    //             websiteUrl: 'dklsahdh asjkdh jkasdjk hasjk dhkjas hdkjsa',
    //         }).expect(HttpStatuses.BAD_REQUEST);
    //
    //     expect(res.status).toBe(HttpStatuses.BAD_REQUEST);
    //     expect(res.body.errorMessages.length).toEqual(1);
    // });
});