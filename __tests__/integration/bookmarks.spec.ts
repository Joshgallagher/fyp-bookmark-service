import { startServer } from '../../src/core/server.core';
import { rpcClient } from '../helper/rpc-client.helper';
import { Bookmark } from '../../src/bookmarks/bookmark.entity';
import { status as rpcStatus, Metadata } from 'grpc';
import { getRepository } from 'typeorm';
import faker from 'faker';

describe('A user can create, find all and delete bookmarks', () => {
    let rpcServer: any;
    let rpcCaller: any;

    beforeAll(async () => {
        rpcServer = await startServer(true);
        rpcCaller = await rpcClient(rpcServer.ports[0]);
    });

    afterEach(async () => await Bookmark.clear());
    afterAll(async () => await rpcServer.close());

    describe('A user can bookmark an article', () => {
        test('Article successfully bookmarked', async () => {
            expect.assertions(3);

            const bookmark = {
                userId: faker.random.uuid(),
                articleId: faker.random.number(),
            };

            const rpcResponse = await rpcCaller.createBookmark(
                { articleId: bookmark.articleId },
                { user: bookmark.userId },
            );

            expect(rpcResponse).toHaveProperty('bookmarked');
            expect(rpcResponse).toMatchObject({ bookmarked: true });

            const newBookmark = await Bookmark.find({
                where: { userId: bookmark.userId, articleId: bookmark.articleId },
            });

            expect(newBookmark).toHaveLength(1);
        });

        test('A user can not bookmark an article more than once', async () => {
            const bookmark = {
                userId: faker.random.uuid(),
                articleId: faker.random.number(),
            };

            await getRepository(Bookmark)
                .create(bookmark)
                .save();

            try {
                await new rpcCaller.Request('createBookmark', { articleId: bookmark.articleId })
                    .withMetadata({ user: bookmark.userId })
                    .withResponseMetadata(true)
                    .withResponseStatus(true)
                    .exec();
            } catch ({ code, details, metadata }) {
                const responseMetadata = metadata as Metadata;

                expect(code).toEqual(rpcStatus.ALREADY_EXISTS);
                expect(details).toEqual('BOOKMARK_EXISTS');
                expect(responseMetadata.get('error')).toContain('You have already bookmarked this article');

                expect.assertions(3);
            }
        });
    });

    describe('A user can see all their bookmarks', () => {
        test('All bookmarks', async () => {
            expect.assertions(1);

            const bookmark = {
                userId: faker.random.uuid(),
                articleId: faker.random.number(),
            };

            await Bookmark.create(bookmark).save();

            const rpcResponse = await rpcCaller.findAllBookmarks({}, { user: bookmark.userId });

            expect(rpcResponse).toMatchObject({ bookmarks: [{ articleId: bookmark.articleId }] });
        });

        test('User has no bookmarks', async () => {
            expect.assertions(1);

            const userId: string = faker.random.uuid();

            const rpcResponse = await rpcCaller.findAllBookmarks({}, { user: userId });

            expect(rpcResponse).toMatchObject({});
        });
    });

    describe('A user can delete their bookmarks', () => {
        test('Successful bookmark deletion', async () => {
            expect.assertions(3);

            const bookmark = {
                userId: faker.random.uuid(),
                articleId: faker.random.number(),
            };

            await Bookmark.create(bookmark).save();

            const rpcResponse = await rpcCaller.deleteBookmark(
                { articleId: bookmark.articleId },
                { user: bookmark.userId },
            );

            expect(rpcResponse).toHaveProperty('removed');
            expect(rpcResponse).toMatchObject({ removed: true });

            const newBookmark = await Bookmark.find({
                where: { userId: bookmark.userId, articleId: bookmark.articleId },
            });

            expect(newBookmark).toHaveLength(0);
        });

        test('A bookmark must exist to be deleted', async () => {
            const userId: string = faker.random.uuid();
            const articleId: number = faker.random.number();

            try {
                await new rpcCaller.Request('deleteBookmark', { articleId })
                    .withMetadata({ user: userId })
                    .withResponseMetadata(true)
                    .withResponseStatus(true)
                    .exec();
            } catch ({ code, details, metadata }) {
                const responseMetadata = metadata as Metadata;

                expect(code).toEqual(rpcStatus.NOT_FOUND);
                expect(details).toEqual('BOOKMARK_NOT_FOUND');
                expect(responseMetadata.get('error')).toContain('Bookmark can not be removed as it does not exist');

                expect.assertions(3);
            }
        });
    });
});
