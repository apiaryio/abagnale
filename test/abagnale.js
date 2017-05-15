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

describe('Creating element IDs', () => {
  it('should leave existing unrefracted ID unmodified', () => {
    const input = [{
      element: 'annotation',
      meta: {
        id: 'exampleID'
      },
      content: 'There is some problem.'
    }];

    const output = abagnale.forge(input);

    assert.deepEqual(output, [{
      element: 'annotation',
      meta: {
        id: {
          element: 'string',
          content: 'exampleID'
        },
        links: [
          {
            element: 'link',
            content: {
              href: 'exampleid',
              relation: 'uri-fragment'
            }
          }
        ]
      },
      content: 'There is some problem.'
    }]);
  });

  it('should leave existing refracted ID unmodified', () => {
    const input = [{
      element: 'annotation',
      meta: {
        id: {
          element: 'string',
          attributes: {
            attr: {
              element: 'string',
              content: 'Example'
            }
          },
          content: 'exampleID'
        }
      },
      content: 'There is some problem.'
    }];

    const output = abagnale.forge(input);

    assert.deepEqual(output, [{
      element: 'annotation',
      meta: {
        id: {
          element: 'string',
          attributes: {
            attr: {
              element: 'string',
              content: 'Example'
            }
          },
          content: 'exampleID'
        },
        links: [
          {
            element: 'link',
            content: {
              href: 'exampleid',
              relation: 'uri-fragment'
            }
          }
        ]
      },
      content: 'There is some problem.'
    }]);
  });

  it('should generate ID from element name', () => {
    const input = [{
      element: 'annotation',
      content: 'There is some problem.'
    }];

    const output = abagnale.forge(input);

    assert.deepEqual(output, [{
      element: 'annotation',
      meta: {
        id: {
          element: 'string',
          content: 'annotation'
        },
        links: [
          {
            element: 'link',
            content: {
              href: 'annotation',
              relation: 'uri-fragment'
            }
          }
        ]
      },
      content: 'There is some problem.'
    }]);
  });

  it('should generate ID from first unrefracted class', () => {
    const input = [{
      element: 'annotation',
      meta: {
        classes: [
          'warning'
        ]
      },
      content: 'There is some problem.'
    }];

    const output = abagnale.forge(input);

    assert.deepEqual(output, [{
      element: 'annotation',
      meta: {
        id: {
          element: 'string',
          content: 'warning'
        },
        classes: [
          'warning'
        ],
        links: [
          {
            element: 'link',
            content: {
              href: 'warning',
              relation: 'uri-fragment'
            }
          }
        ]
      },
      content: 'There is some problem.'
    }]);
  });

  it('should generate ID from first refracted class', () => {
    const input = [{
      element: 'annotation',
      meta: {
        classes: {
          element: 'array',
          content: [
            {
              element: 'string',
              content: 'warning'
            }
          ]
        }
      },
      content: 'There is some problem.'
    }];

    const output = abagnale.forge(input);

    assert.deepEqual(output, [{
      element: 'annotation',
      meta: {
        id: {
          element: 'string',
          content: 'warning'
        },
        classes: {
          element: 'array',
          content: [
            {
              element: 'string',
              content: 'warning'
            }
          ]
        },
        links: [
          {
            element: 'link',
            content: {
              href: 'warning',
              relation: 'uri-fragment'
            }
          }
        ]
      },
      content: 'There is some problem.'
    }]);
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
