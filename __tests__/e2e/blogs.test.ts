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
            isMembership: expect.any(Boolean),
            createdAt: expect.any(String),
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
                isMembership: expect.any(Boolean),
                createdAt: expect.any(String),
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
                isMembership: expect.any(Boolean),
                createdAt: expect.any(String),
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
            isMembership: expect.any(Boolean),
            createdAt: expect.any(String),
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

    it('GET /:id/posts - should fetch posts by blog id', async () => {
        const createdBlog = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);

        const blogId = createdBlog.body.id;

        const res = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${blogId}/posts`)
            .expect(HttpStatuses.OK);

        expect(res.body.items).toEqual([]);
    });

    const testPost = {
        title: "Sample Post",
        shortDescription: "Sample Short Description",
        content: "Sample Post Content"
    };

    it('POST /:id/posts - should create a post for a specific blog', async () => {
        const createdBlog = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);

        const blogId = createdBlog.body.id;

        const postResponse = await request(app)
            .post(`${APP_ROUTES.BLOGS}/${blogId}/posts`)
            .set('Authorization', authToken)
            .send({
                ...testPost,
                blogId: blogId
            })
            .expect(HttpStatuses.CREATED);

        expect(postResponse.body).toEqual({
            id: expect.any(String),
            title: testPost.title,
            blogName: expect.any(String),
            shortDescription: testPost.shortDescription,
            content: testPost.content,
            blogId: blogId,
            createdAt: expect.any(String),
        });

        const postsResponse = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${blogId}/posts`)
            .expect(HttpStatuses.OK);

        expect(postsResponse.body.items.length).toBe(1);
        expect(postsResponse.body.items[0]).toEqual({
            id: expect.any(String),
            title: testPost.title,
            blogName: expect.any(String),
            shortDescription: testPost.shortDescription,
            content: testPost.content,
            blogId: blogId,
            createdAt: expect.any(String),
        });
    });

    it('POST /:id/posts - should return validation errors for invalid input', async () => {
        const createdBlog = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);

        const blogId = createdBlog.body.id;

        const invalidPostResponse = await request(app)
            .post(`${APP_ROUTES.BLOGS}/${blogId}/posts`)
            .set('Authorization', authToken)
            .send({
                title: "",
                shortDescription: "",
                content: ""
            })
            .expect(HttpStatuses.BAD_REQUEST);

        expect(invalidPostResponse.body.errorsMessages.length).toBeGreaterThanOrEqual(3);
        expect(invalidPostResponse.body.errorsMessages).toContainEqual(
            expect.objectContaining({ message: expect.stringContaining("must") })
        );
    });

    it('POST /:id/posts - should return 404 for invalid blog id', async () => {
        const invalidBlogId = "000000000000000000000000";

        const res = await request(app)
            .post(`${APP_ROUTES.BLOGS}/${invalidBlogId}/posts`)
            .set('Authorization', authToken)
            .send(testPost)
            .expect(HttpStatuses.NOT_FOUND);

        expect(res.body).toEqual({});
    });

});