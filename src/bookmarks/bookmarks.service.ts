import { getRepository } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import RpcException from 'grpc-error';
import { status } from 'grpc';

export const create = async (data: Record<string, any>): Promise<any> => {
    const { subject: userId, articleId } = data;

    if (!!(await getRepository(Bookmark).findOne({ where: { userId, articleId } }))) {
        throw new RpcException('BOOKMARK_EXISTS', status.ALREADY_EXISTS, {
            error: 'You have already bookmarked this article',
        });
    }

    try {
        await Bookmark.create({ userId, articleId }).save();
    } catch (e) {
        throw new RpcException('INTERNAL_ERROR', status.INTERNAL, {
            error: 'Something went wrong when attempting to save your bookmark',
        });
    }

    return true;
};

export const findAll = async (userId: string): Promise<any> => {
    return await getRepository(Bookmark).find({ select: ['articleId'], where: { userId }, order: { id: 'DESC' } });
};

export const remove = async (data: Record<string, any>): Promise<any> => {
    const { subject: userId, articleId } = data;

    const bookmark = await getRepository(Bookmark).findOne({ where: { userId, articleId } });

    if (bookmark === undefined) {
        throw new RpcException('BOOKMARK_NOT_FOUND', status.NOT_FOUND, {
            error: 'Bookmark does not exist to be removed',
        });
    }

    const { affected } = (await getRepository(Bookmark).delete(bookmark.id)) as Record<string, any>;

    return affected > 0 ? true : false;
};
