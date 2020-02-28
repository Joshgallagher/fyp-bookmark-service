import './config.core';
import Mali from 'mali';
import { resolve } from 'path';
import { createBookmark, findAllBookmarks, removeBookmark } from '../bookmarks/bookmarks.controller';
import { createConnection } from './connection.core';
import { verifyJwtMiddleware } from '../middleware/verify-jwt.middleware';
import { userIdHeaderMiddleware } from '../middleware/user-id-header.middleware';
// import { validateMiddleware } from '../middleware/validate.middleware';

const PROTO_PATH = resolve(__dirname, '../proto/bookmarks.proto');
const PROTO_SERVICE = 'BookmarksService';

let appInstance: Mali;

export const startServer = async (randomPort = false): Promise<Mali> => {
    await createConnection();

    appInstance = new Mali(PROTO_PATH, PROTO_SERVICE);

    appInstance.use(verifyJwtMiddleware());
    appInstance.use(userIdHeaderMiddleware());
    appInstance.use({
        [PROTO_SERVICE]: {
            createBookmark: [createBookmark],
            findAllBookmarks: [findAllBookmarks],
            deleteBookmark: [removeBookmark],
        },
    });

    if (randomPort) {
        appInstance.start(`${process.env.HOST}:0`);

        return appInstance;
    }

    appInstance.start(`${process.env.HOST}:${process.env.PORT}`);

    return appInstance;
};

export const shutdownServer = async (): Promise<void> => {
    await appInstance.close();

    process.exit();
};
