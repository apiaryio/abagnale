import abagnale from '../src/abagnale';
import assert from 'assert';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

describe('Bad refract input data', () => {
  it('should not crash', () => {
    const input = [{
      element: 'array',
      content: [
        {
          element: 'member',
          content: {
            key: {
              element: 'string',
            },
          },
        },
        {
          content: 'missing-element',
        },
        {
          element: 'string',
          meta: {
            classes: [null],
          },
        },
      ],
    }];

    // This test will pass so long as no errors are thrown.
    abagnale.forge(input, {
      separator: '.',
    });
  });
});

describe('Test fixtures match expected output', () => {
  glob.sync('./test/input/*.json').forEach((filename) => {
    it(path.basename(filename, '.json'), () => {
      const input = JSON.parse(fs.readFileSync(filename, 'utf8'));
      const outname = filename.replace('input', 'output');
      const generated = abagnale.forge(input, {
        separator: '.',
      });
      let output = JSON.parse(fs.readFileSync(outname, 'utf8'));

      if (process.env.GENERATE) {
        fs.writeFileSync(outname, JSON.stringify(generated, null, 2) + '\n', 'utf8');
        output = generated;
      }

      assert.deepEqual(output, generated);
    });
  });
});
