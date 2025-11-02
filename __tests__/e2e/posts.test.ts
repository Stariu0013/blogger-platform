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
import {createNewUserAndReturnAccessToken} from "../utils/createNewUser";

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
    const testComment = {
        content: 'lorem ipsum lorem ipsum lorem ipsum',
    }

    const authToken = generateBasicAuthToken();
    let accessToken = '';

    beforeAll(async () => {
        await runDB(Settings.MONGO_URL);
        await clearDb(app);
    });

    beforeEach(async () => {
        await clearDb(app);

        accessToken = await createNewUserAndReturnAccessToken(app);
    });

    afterAll(async () => {
        await clearDb(app);
    })

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

    it(`should create new post and return empty array of comments`, async () => {
        const createdPost = await request(app).post(`${APP_ROUTES.POSTS}`).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = createdPost.body.id;

        const commentsRes = await request(app).get(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(commentsRes.body).toEqual(
            {
                "items": [],
                "page": 1,
                "pageSize": 10,
                "pagesCount": 0,
                "totalCount": 0
            }
        );
        expect(commentsRes.status).toBe(HttpStatuses.OK);
    });

    it(`should create new post and return error for incorrect postId on get all comments`, async () => {
        const createdPost = await request(app).post(`${APP_ROUTES.POSTS}`).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = "63189b06003380064c4193be";

        const commentsRes = await request(app).get(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(commentsRes.status).toBe(HttpStatuses.NOT_FOUND);
    });

    it(`should create new post and comment`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = createdPost.body.id;

        const createCommentRes = await request(app).post(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        }).send(testComment);

        expect(createCommentRes.status).toBe(HttpStatuses.CREATED);

        const getCommentsRes = await request(app).get(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(getCommentsRes.status).toBe(HttpStatuses.OK);
        expect(getCommentsRes.body.items.length).toBe(1);
    });

    it(`should create new post with comment and return comment by id`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = createdPost.body.id;

        const createCommentRes = await request(app).post(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        }).send(testComment);

        expect(createCommentRes.status).toBe(HttpStatuses.CREATED)

        const commentId = createCommentRes.body.id;

        const getCommentResponse = await request(app).get(`${APP_ROUTES.COMMENTS}/${commentId}`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(getCommentResponse.status).toBe(HttpStatuses.OK);
        expect(getCommentResponse.body).toEqual({
            ...createCommentRes.body
        });
    });

    it(`should create new post with comment and delete comment by id`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = createdPost.body.id;

        const createCommentRes = await request(app).post(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        }).send(testComment);

        expect(createCommentRes.status).toBe(HttpStatuses.CREATED)

        const commentId = createCommentRes.body.id;

        const deleteCommentResponse = await request(app).delete(`${APP_ROUTES.COMMENTS}/${commentId}`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(deleteCommentResponse.status).toBe(HttpStatuses.NO_CONTENT);

        const getCommentResponse = await request(app).get(`${APP_ROUTES.COMMENTS}/${commentId}`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(getCommentResponse.status).toBe(HttpStatuses.NOT_FOUND);
    });

    it(`should create new post with comment and update comment by id`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = createdPost.body.id;

        const createCommentRes = await request(app).post(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        }).send(testComment);

        expect(createCommentRes.status).toBe(HttpStatuses.CREATED)

        const commentId = createCommentRes.body.id;
        const newContent = 'new content lorem ipsumipsumipsumipsum';

        const updateCommentResponse = await request(app).put(`${APP_ROUTES.COMMENTS}/${commentId}`).set({
            authorization: `Bearer ${accessToken}`
        }).send({
            content: newContent
        });

        expect(updateCommentResponse.status).toBe(HttpStatuses.NO_CONTENT);

        const getCommentResponse = await request(app).get(`${APP_ROUTES.COMMENTS}/${commentId}`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(getCommentResponse.status).toBe(HttpStatuses.OK);
        expect(getCommentResponse.body).toEqual({
            ...createCommentRes.body,
            content: newContent
        });
    });

    it(`should create new post and return error on incorrect comment id`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = createdPost.body.id;

        const createCommentRes = await request(app).post(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        }).send(testComment);

        expect(createCommentRes.status).toBe(HttpStatuses.CREATED)

        const getCommentResponse = await request(app).get(`${APP_ROUTES.COMMENTS}/${targetId}`).set({
            authorization: `Bearer ${accessToken}`
        });

        expect(getCommentResponse.status).toBe(HttpStatuses.NOT_FOUND);
    });

    it(`should return error on incorrect comment data`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = createdPost.body.id;

        const createCommentRes = await request(app).post(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        }).send({
            content: ''
        });

        expect(createCommentRes.status).toBe(HttpStatuses.BAD_REQUEST);

        const createdCommentLargeDataRes = await request(app).post(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        }).send({
            content: 'a'.repeat(301)
        });

        expect(createdCommentLargeDataRes.status).toBe(HttpStatuses.BAD_REQUEST);
    });


    it(`should return error on incorrect postId`, async () => {
        const createdPost = await request(app).post(APP_ROUTES.POSTS).set(
            'Authorization', authToken
        ).send(testPost);

        expect(createdPost.status).toBe(HttpStatuses.CREATED);
        const targetId = '63189b06003380064c4193be';

        const createCommentRes = await request(app).post(`${APP_ROUTES.POSTS}/${targetId}/comments`).set({
            authorization: `Bearer ${accessToken}`
        }).send(testComment);

        expect(createCommentRes.status).toBe(HttpStatuses.NOT_FOUND);
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
});
describe('Posts with pagination', () => {
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

    it('should return posts with pagination and default sorting (desc by createdAt)', async () => {
        // Create multiple blogs first
        const blogs = [];
        for (let i = 0; i < 12; i++) {
            const blog = await request(app)
                .post(APP_ROUTES.BLOGS)
                .set('Authorization', authToken)
                .send({
                    name: `blog title`,
                    description: `description`,
                    websiteUrl: 'https://blog.com'
                })
                .expect(HttpStatuses.CREATED);
            blogs.push(blog.body);
        }

        // Create posts for each blog
        for (let i = 0; i < 12; i++) {
            await request(app)
                .post(APP_ROUTES.POSTS)
                .set('Authorization', authToken)
                .send({
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: blogs[i].id
                })
                .expect(HttpStatuses.CREATED);
        }

        const res = await request(app)
            .get(APP_ROUTES.POSTS)
            .expect(HttpStatuses.OK);

        expect(res.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 12,
            items: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: expect.any(String),
                    blogName: expect.any(String),
                    createdAt: expect.any(String)
                })
            ])
        });

        expect(res.body.items).toHaveLength(10);

        // Check that posts are sorted by createdAt in descending order (newest first)
        const dates = res.body.items.map((post: any) => new Date(post.createdAt));
        for (let i = 1; i < dates.length; i++) {
            expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
        }
    });

    it('should return posts sorted in ascending order by createdAt', async () => {
        // Create multiple blogs first
        const blogs = [];
        for (let i = 0; i < 12; i++) {
            const blog = await request(app)
                .post(APP_ROUTES.BLOGS)
                .set('Authorization', authToken)
                .send({
                    name: `blog title`,
                    description: `description`,
                    websiteUrl: 'https://blog.com'
                })
                .expect(HttpStatuses.CREATED);
            blogs.push(blog.body);
        }

        // Create posts for each blog with slight delays to ensure different timestamps
        for (let i = 0; i < 12; i++) {
            await request(app)
                .post(APP_ROUTES.POSTS)
                .set('Authorization', authToken)
                .send({
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: blogs[i].id
                })
                .expect(HttpStatuses.CREATED);

            // Small delay to ensure different createdAt timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const res = await request(app)
            .get(`${APP_ROUTES.POSTS}?sortDirection=asc`)
            .expect(HttpStatuses.OK);

        expect(res.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 12,
            items: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: expect.any(String),
                    blogName: expect.any(String),
                    createdAt: expect.any(String)
                })
            ])
        });

        expect(res.body.items).toHaveLength(10);

        // Check that posts are sorted by createdAt in ascending order (oldest first)
        const dates = res.body.items.map((post: any) => new Date(post.createdAt));
        for (let i = 1; i < dates.length; i++) {
            expect(dates[i - 1].getTime()).toBeLessThanOrEqual(dates[i].getTime());
        }
    });

    it('should return posts sorted in ascending order by createdAt', async () => {
        // Create multiple blogs first
        const blogs = [];
        for (let i = 0; i < 12; i++) {
            const blog = await request(app)
                .post(APP_ROUTES.BLOGS)
                .set('Authorization', authToken)
                .send({
                    name: `blog title`,
                    description: `description`,
                    websiteUrl: 'https://blog.com'
                })
                .expect(HttpStatuses.CREATED);
            blogs.push(blog.body);
        }

        // Create posts for each blog with slight delays to ensure different timestamps
        for (let i = 0; i < 12; i++) {
            await request(app)
                .post(APP_ROUTES.POSTS)
                .set('Authorization', authToken)
                .send({
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: blogs[i].id
                })
                .expect(HttpStatuses.CREATED);

            // Small delay to ensure different createdAt timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const res = await request(app)
            .get(`${APP_ROUTES.POSTS}?sortDirection=asc`)
            .expect(HttpStatuses.OK);

        expect(res.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 12,
            items: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: expect.any(String),
                    blogName: expect.any(String),
                    createdAt: expect.any(String)
                })
            ])
        });

        expect(res.body.items).toHaveLength(10);

        // Check that posts are sorted by createdAt in ascending order (oldest first)
        const dates = res.body.items.map((post: any) => new Date(post.createdAt));
        for (let i = 1; i < dates.length; i++) {
            expect(dates[i - 1].getTime()).toBeLessThanOrEqual(dates[i].getTime());
        }
    });

    it('should return second page of posts', async () => {
        // Create multiple blogs first
        const blogs = [];
        for (let i = 0; i < 12; i++) {
            const blog = await request(app)
                .post(APP_ROUTES.BLOGS)
                .set('Authorization', authToken)
                .send({
                    name: `blog title`,
                    description: `description`,
                    websiteUrl: 'https://blog.com'
                })
                .expect(HttpStatuses.CREATED);
            blogs.push(blog.body);
        }

        // Create posts for each blog
        for (let i = 0; i < 12; i++) {
            await request(app)
                .post(APP_ROUTES.POSTS)
                .set('Authorization', authToken)
                .send({
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: blogs[i].id
                })
                .expect(HttpStatuses.CREATED);
        }

        const res = await request(app)
            .get(`${APP_ROUTES.POSTS}?pageNumber=2`)
            .expect(HttpStatuses.OK);

        expect(res.body).toEqual({
            pagesCount: 2,
            page: 2,
            pageSize: 10,
            totalCount: 12,
            items: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: expect.any(String),
                    blogName: expect.any(String),
                    createdAt: expect.any(String)
                })
            ])
        });

        expect(res.body.items).toHaveLength(2); // Should have 2 remaining posts
    });

    it('should return posts with custom page size', async () => {
        // Create multiple blogs first
        const blogs = [];
        for (let i = 0; i < 6; i++) {
            const blog = await request(app)
                .post(APP_ROUTES.BLOGS)
                .set('Authorization', authToken)
                .send({
                    name: `blog title`,
                    description: `description`,
                    websiteUrl: 'https://blog.com'
                })
                .expect(HttpStatuses.CREATED);
            blogs.push(blog.body);
        }

        // Create posts for each blog
        for (let i = 0; i < 6; i++) {
            await request(app)
                .post(APP_ROUTES.POSTS)
                .set('Authorization', authToken)
                .send({
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: blogs[i].id
                })
                .expect(HttpStatuses.CREATED);
        }

        const res = await request(app)
            .get(`${APP_ROUTES.POSTS}?pageSize=3`)
            .expect(HttpStatuses.OK);

        expect(res.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 3,
            totalCount: 6,
            items: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    title: 'post title',
                    shortDescription: 'description',
                    content: 'new post content',
                    blogId: expect.any(String),
                    blogName: expect.any(String),
                    createdAt: expect.any(String)
                })
            ])
        });

        expect(res.body.items).toHaveLength(3);
    });
});