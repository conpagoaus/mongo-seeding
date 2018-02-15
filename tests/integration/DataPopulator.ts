import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { removeSync } from 'fs-extra';

import {
  DeepPartial,
  AppConfig,
  getConfig,
  defaultConfig,
} from '../../src/common';
import { DataPopulator } from '../../src/data-processing';

const TEMP_DIRECTORY_PATH = __dirname + '/.temp-DataPopulator';

beforeEach(async () => {
  if (!existsSync(TEMP_DIRECTORY_PATH)) {
    mkdirSync(TEMP_DIRECTORY_PATH);
  }
});

afterEach(async () => {
  removeSync(TEMP_DIRECTORY_PATH);
});

describe('DataPopulator', () => {
  it('should fail when directory is not found', () => {
    const path = '/surely/not/existing/path';
    const dataPopulator = new DataPopulator(defaultConfig.supportedExtensions);

    expect(() => {
      dataPopulator.populate(path);
    }).toThrowError('ENOENT');
  });

  it('should treat object as document', () => {
    const dataPopulator = new DataPopulator(defaultConfig.supportedExtensions);
    const path = `${TEMP_DIRECTORY_PATH}/CollectionOne`;
    mkdirSync(path);
    writeFileSync(
      `${path}/test1.json`,
      JSON.stringify({
        number: 1,
        name: 'one',
      }),
    );

    const documents = dataPopulator.populateDocumentsContent(path);

    expect(documents).toContainEqual(
      expect.objectContaining({
        number: 1,
        name: 'one',
      }),
    );
  });

  it('should treat exported array of objects as separate documents', () => {
    const dataPopulator = new DataPopulator(defaultConfig.supportedExtensions);
    const path = `${TEMP_DIRECTORY_PATH}/CollectionTwo`;
    mkdirSync(path);
    writeFileSync(
      `${path}/test1.js`,
      `
          module.exports = [
            {
                number: 1,
                name: 'one',
            },
              {
                  number: 2,
                  name: 'two',
              }
          ]`,
    );

    const documents = dataPopulator.populateDocumentsContent(path);

    expect(documents).toContainEqual(
      expect.objectContaining({
        number: 2,
        name: 'two',
      }),
    );
    expect(documents).toContainEqual(
      expect.objectContaining({
        number: 1,
        name: 'one',
      }),
    );
  });

  it('should skip empty directories', () => {
    const dataPopulator = new DataPopulator(defaultConfig.supportedExtensions);
    const path1 = `${TEMP_DIRECTORY_PATH}/SkipEmptyDir1`;
    const path2 = `${TEMP_DIRECTORY_PATH}/SkipEmptyDir2`;
    mkdirSync(path1);
    mkdirSync(path2);

    const collections = dataPopulator.readCollections(
      ['SkipEmptyDir1', 'SkipEmptyDir2'],
      TEMP_DIRECTORY_PATH,
    );
    expect(collections).toHaveLength(0);
  });
});
