import { startServer } from '../../src/core/server.core';
import { rpcClient } from '../helper/rpc-client.helper';
// import { status as rpcStatus, Metadata } from 'grpc';
// import faker from 'faker';

describe('A user can be registered, authenticated and thier details can be retrieved', () => {
    let rpcServer: any;
    let rpcCaller: any;

    beforeAll(async () => {
        rpcServer = await startServer(true);
        rpcCaller = await rpcClient(rpcServer.ports[0]);
    });

    afterEach(async () => null); // Clear entity, e.g. await User.clear()
    afterAll(async () => await rpcServer.close());

    describe('...', () => {
        // test('...', async () => { });
    });
});
