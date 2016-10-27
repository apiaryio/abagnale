import abagnale from '../src/abagnale';
import assert from 'assert';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

describe('Bad refract input data', () => {
  it('should handle member missing a value', () => {
    const input = [{
      element: 'object',
      content: [
        {
          element: 'member',
          content: {
            key: {
              element: 'string',
            },
          },
        },
      ],
    }];

    // This test will pass so long as no errors are thrown.
    abagnale.forge(input, {
      separator: '.',
    });
  });

  it('should handle missing element', () => {
    const input = [{
      element: 'array',
      content: [
        {
          element: 'string',
        },
        {
          content: 'missing-element',
        },
      ],
    }];

    // This test will pass so long as no errors are thrown.
    abagnale.forge(input, {
      separator: '.',
    });
  });

  it('should handle non-string in classes', () => {
    const input = [{
      element: 'string',
      meta: {
        classes: [null],
      },
    }];

    // This test will pass so long as no errors are thrown.
    abagnale.forge(input, {
      separator: '.',
    });
  });

  it('should handle non-string in element name', () => {
    const input = [{
      element: null,
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

      assert.deepEqual(generated, output);
    });
  });
});
