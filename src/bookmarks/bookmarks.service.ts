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

    try {
        const { id } = await getRepository(Bookmark).findOneOrFail({ where: { userId, articleId } });

        await getRepository(Bookmark).delete(id);
    } catch (e) {
        throw new RpcException('BOOKMARK_NOT_FOUND', status.NOT_FOUND, {
            error: 'Bookmark can not be removed as it does not exist',
        });
    }

    return true;
};
