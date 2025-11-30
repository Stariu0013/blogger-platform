import express from 'express';
import request from 'supertest';
import {setupApp} from "../../src/setupApp";
import {APP_ROUTES} from "../../src/core/routes";
import {BlogInputModel} from "../../src/blogs/types/blogs.input-dto";
import {HttpStatuses} from "../../src/core/types/http-statuses";
import {generateBasicAuthToken} from "../utils/generateBasicAuthToken";
import { runDB } from "../../src/core/db/mongo.db";
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

    it(`should create and return blog with pagination`, async () => {
        await request(app).post(APP_ROUTES.BLOGS).set(
            'Authorization', authToken
        ).send(testBlog);
        await request(app).post(APP_ROUTES.BLOGS).set(
            'Authorization', authToken
        ).send(testBlog);
        await request(app).post(APP_ROUTES.BLOGS).set(
            'Authorization', authToken
        ).send(testBlog);
        await request(app).post(APP_ROUTES.BLOGS).set(
            'Authorization', authToken
        ).send(testBlog);

        // pageSize
        const res = await request(app).get(`${APP_ROUTES.BLOGS}?pageNumber=1&sortDirection=asc`).set(
            'Authorization', authToken
        );
    });

    describe('Page size parameter', () => {
        it('should return 5 items with pageSize=5', async () => {
            const response = await request(app)
                .get(`${APP_ROUTES.BLOGS}?pageSize=5`)
                .expect(HttpStatuses.OK);

            expect(response.body.pageSize).toBe(5);
            expect(response.body.items).toHaveLength(5);
        });

        it('should return 15 items with pageSize=15', async () => {
            const response = await request(app)
                .get(`${APP_ROUTES.BLOGS}?pageSize=15`)
                .expect(HttpStatuses.OK);

            expect(response.body.pageSize).toBe(15);
        });

        it('should return all items with large pageSize', async () => {
            const response = await request(app)
                .get(`${APP_ROUTES.BLOGS}?pageSize=100`)
                .expect(HttpStatuses.OK);

            expect(response.body.pagesCount).toBe(1);
        });
    });
});

describe('GET /:id/posts - Pagination tests', () => {
    const app = express();
    setupApp(app);

    beforeAll(async () => {
        await runDB(Settings.MONGO_URL);
        await clearDb(app);
    });
    const testBlog: BlogInputModel = {
        name: 'Blog 1',
        description: 'Blog 1 description',
        websiteUrl: 'https://blog1.com',
    };

    const authToken = generateBasicAuthToken();

    let createdBlogId: string;

    beforeAll(async () => {
        // Create a blog for testing posts
        const createdBlog = await request(app).post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);

        createdBlogId = createdBlog.body.id;

        // Create 12 posts for pagination testing
        for (let i = 1; i <= 12; i++) {
            await request(app)
                .post(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts`)
                .set('Authorization', authToken)
                .send({
                    title: `${3290 + i}post title`,
                    shortDescription: "description",
                    content: "new post content"
                })
                .expect(HttpStatuses.CREATED);
        }
    });

    it('should return correct pagination metadata for first page', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=1&pageSize=3`)
            .expect(HttpStatuses.OK);

        expect(response.body.pagesCount).toBe(4);
        expect(response.body.page).toBe(1); // Should be number, not string
        expect(response.body.pageSize).toBe(3);
        expect(response.body.totalCount).toBe(12);
        expect(response.body.items).toHaveLength(3);
    });

    it('should return correct pagination metadata for second page', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=2&pageSize=3`)
            .expect(HttpStatuses.OK);

        expect(response.body.pagesCount).toBe(4);
        expect(response.body.page).toBe(2);
        expect(response.body.pageSize).toBe(3);
        expect(response.body.totalCount).toBe(12);
        expect(response.body.items).toHaveLength(3);
    });

    it('should return correct pagination metadata for last page', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=4&pageSize=3`)
            .expect(HttpStatuses.OK);

        expect(response.body.pagesCount).toBe(4);
        expect(response.body.page).toBe(4);
        expect(response.body.pageSize).toBe(3);
        expect(response.body.totalCount).toBe(12);
        expect(response.body.items).toHaveLength(3);
    });

    it('should return empty items for page beyond last page', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=5&pageSize=3`)
            .expect(HttpStatuses.OK);

        expect(response.body.pagesCount).toBe(4);
        expect(response.body.page).toBe(5);
        expect(response.body.pageSize).toBe(3);
        expect(response.body.totalCount).toBe(12);
        expect(response.body.items).toHaveLength(0);
    });

    it('should handle different page sizes correctly', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=1&pageSize=5`)
            .expect(HttpStatuses.OK);

        expect(response.body.pagesCount).toBe(3); // ceil(12/5) = 3
        expect(response.body.page).toBe(1);
        expect(response.body.pageSize).toBe(5);
        expect(response.body.totalCount).toBe(12);
        expect(response.body.items).toHaveLength(5);
    });

    it('should handle page size larger than total items', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=1&pageSize=20`)
            .expect(HttpStatuses.OK);

        expect(response.body.pagesCount).toBe(1);
        expect(response.body.page).toBe(1);
        expect(response.body.pageSize).toBe(20);
        expect(response.body.totalCount).toBe(12);
        expect(response.body.items).toHaveLength(12);
    });

    it('should use default pagination when no parameters provided', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts`)
            .expect(HttpStatuses.OK);

        expect(response.body.page).toBe(1);
        expect(response.body.pageSize).toBe(10); // Default page size
        expect(response.body.totalCount).toBe(12);
        expect(response.body.pagesCount).toBe(2); // ceil(12/10) = 2
        expect(response.body.items).toHaveLength(10);
    });

    it('should validate invalid pageNumber parameter', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=0`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should validate invalid pageSize parameter', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageSize=0`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should validate pageSize exceeding maximum', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageSize=101`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 404 for non-existent blog', async () => {
        const nonExistentId = "000000000000000000000000";

        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${nonExistentId}/posts?pageNumber=1&pageSize=3`)
            .expect(HttpStatuses.NOT_FOUND);
    });

    it('should return correct post structure in paginated response', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=1&pageSize=1`)
            .expect(HttpStatuses.OK);

        expect(response.body.items[0]).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            shortDescription: expect.any(String),
            content: expect.any(String),
            blogId: createdBlogId,
            blogName: expect.any(String),
            createdAt: expect.any(String),
        });
    });

    it('should maintain correct sorting with pagination', async () => {
        const response = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=1&pageSize=3&sortDirection=desc`)
            .expect(HttpStatuses.OK);

        const firstPageItems = response.body.items;

        const response2 = await request(app)
            .get(`${APP_ROUTES.BLOGS}/${createdBlogId}/posts?pageNumber=2&pageSize=3&sortDirection=desc`)
            .expect(HttpStatuses.OK);

        const secondPageItems = response2.body.items;

        // Check that first page has newer posts than second page (desc order)
        if (firstPageItems.length > 0 && secondPageItems.length > 0) {
            expect(new Date(firstPageItems[0].createdAt).getTime())
                .toBeGreaterThan(new Date(secondPageItems[0].createdAt).getTime());
        }
    });
});

describe('GET /:blogId/posts - 400 Error Tests', () => {
    const app = express();
    setupApp(app);

    beforeAll(async () => {
        await runDB(Settings.MONGO_URL);
        await clearDb(app);
    });

    const testBlog: BlogInputModel = {
        name: 'Test Blog',
        description: 'Test Blog Description',
        websiteUrl: 'https://testblog.com',
    };

    const authToken = generateBasicAuthToken();
    let validBlogId: string;

    beforeAll(async () => {
        // Create a valid blog for testing
        const createdBlog = await request(app)
            .post(APP_ROUTES.BLOGS)
            .set('Authorization', authToken)
            .send(testBlog)
            .expect(HttpStatuses.CREATED);

        validBlogId = createdBlog.body.id;
    });

    it('should return 400 for invalid pageNumber (zero)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageNumber=0`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid pageNumber (negative)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageNumber=-1`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid pageNumber (non-integer)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageNumber=abc`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid pageNumber (decimal)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageNumber=1.5`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid pageSize (zero)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageSize=0`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid pageSize (negative)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageSize=-5`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid pageSize (exceeds maximum)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageSize=101`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid pageSize (non-integer)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageSize=invalid`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid pageSize (decimal)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageSize=10.5`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid sortDirection', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?sortDirection=invalid`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid sortBy field', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?sortBy=invalidField`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for multiple invalid parameters', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageNumber=0&pageSize=-1&sortDirection=invalid`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for invalid blogId format', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/invalid-id/posts`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for blogId that is too short', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/123/posts`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 for blogId with invalid characters', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/invalid-blog-id-format/posts`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 when pageSize is exactly at boundary (101)', async () => {
        await request(app)
            .get(`${APP_ROUTES.BLOGS}/${validBlogId}/posts?pageSize=101`)
            .expect(HttpStatuses.BAD_REQUEST);
    });

    it('should return 400 when all data passed', async () => {
        //?pageSize=&pageNumber=&sortDirection=&sortBy=
        const res = await request(app)
            .get(`${APP_ROUTES.BLOGS}/&pageSize=2`)
            .expect(HttpStatuses.OK);

        console.log(res.body);
    });
});