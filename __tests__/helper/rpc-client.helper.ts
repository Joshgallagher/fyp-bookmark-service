import caller from 'grpc-caller';
import { resolve } from 'path';

const PROTO_PATH = resolve(__dirname, '../../src/proto/bookmarks.proto');
const PROTO_SERVICE = 'BookmarksService';

export const rpcClient = async (serverPort: number) => {
    return await caller(`${process.env.HOST}:${serverPort}`, PROTO_PATH, PROTO_SERVICE);
};
