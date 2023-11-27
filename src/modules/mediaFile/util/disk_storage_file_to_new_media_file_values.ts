import { join } from 'path';

import { DiskStorageFile } from '@blazity/nest-file-fastify';

import { NewMediaFile } from '@entities/mediaFile.entity';

import { DIRECTORY_UPLOADS } from '../mediaFile.constant';

export const diskStorageFileToNewMediaFileValues = (
  file: DiskStorageFile,
): NewMediaFile => {
  return {
    fileName: file.filename,
    mimetype: file.mimetype,
    path: join(DIRECTORY_UPLOADS, file.filename),
  };
};
