import { Context } from 'mali';
import bearer from '@malijs/bearer';
import { JWT } from 'jose';
import { status } from 'grpc';

const OPTIONS = { error: { message: 'NOT_AUTHORISED', code: status.PERMISSION_DENIED } };

export const userIdHeaderMiddleware = (): Function => {
    if (process.env.SKIP_USER_ID_HEADER_INJECTION == 'true') {
        return async (_context: any, next: Function): Promise<void> => await next();
    }

    return bearer(
        OPTIONS,
        async (token: string, context: Context, next: Function): Promise<void> => {
            try {
                const { sub } = JWT.decode(token) as Record<any, any>;

                context.req.subject = sub;
            } catch (e) {
                //
            }

            await next();
        },
    );
};
