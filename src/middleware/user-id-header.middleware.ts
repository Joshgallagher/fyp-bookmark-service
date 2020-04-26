import { Context } from 'mali';
import bearer from '@malijs/bearer';
import { JWT, errors } from 'jose';
import RpcException from 'grpc-error';
import { status } from 'grpc';

const OPTIONS = { error: { message: 'NOT_AUTHORISED', code: status.PERMISSION_DENIED } };

export const userIdHeaderMiddleware = (): Function => {
    if (process.env.NODE_ENV == 'test') {
        return async (context: any, next: Function): Promise<void> => {
            context.req.subject = context.get('user') as string;

            await next();
        };
    }

    if (process.env.SKIP_USER_ID_HEADER_INJECTION == 'true') {
        return async (_context: any, next: Function): Promise<void> => await next();
    }

    return bearer(
        OPTIONS,
        async (token: string, context: Context, next: Function): Promise<void> => {
            try {
                const { sub } = JWT.decode(token) as Record<string, any>;

                context.req.subject = sub;
            } catch (e) {
                const error = e as any;
                const code = e.code.substring(4);

                if (
                    (e instanceof errors.JOSEError && error.code === 'ERR_JWT_CLAIM_INVALID') ||
                    (e instanceof errors.JOSEError && error.code === 'ERR_JWT_EXPIRED') ||
                    (e instanceof errors.JOSEError && error.code === 'ERR_JWT_MALFORMED')
                ) {
                    throw new RpcException(code, status.FAILED_PRECONDITION, {
                        error: e.message,
                    });
                }

                throw new RpcException(code, status.INTERNAL, {
                    error: e.message,
                });
            }

            await next();
        },
    );
};
