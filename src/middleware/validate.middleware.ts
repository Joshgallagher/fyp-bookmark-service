import { Context } from 'mali';
import { validateOrReject } from 'class-validator';
import RpcException from 'grpc-error';
import { status } from 'grpc';
import { Bookmark } from '../bookmarks/bookmark.entity';

export const validateMiddleware = (): Function => {
    return async function validate(context: Context, next: Function): Promise<void> {
        const bookmark = Bookmark.create(context.request.req);

        try {
            await validateOrReject(bookmark, { skipMissingProperties: true });
        } catch ([{ property, constraints }]) {
            throw new RpcException('VALIDATION_ERROR', status.FAILED_PRECONDITION, {
                field: property,
                error: constraints[Object.keys(constraints)[0]],
            });
        }

        await next();
    };
};
