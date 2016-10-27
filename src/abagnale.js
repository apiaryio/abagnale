// A safe way to slugify values. If the input is null, undefined, or
// some other error happens downstream, we simply return `unknown`.
function safeSlug(value = 'unknown') {
  return encodeURIComponent(value)
  .toLowerCase()
  .replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16)}`) // RFC 3986 & https://developer.mozilla.org/cs/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  .replace(/%20|%2520/g, '-'); // Swap (encoded) spaces for hyphens
}

class Abagnale {
  constructor(options) {
    this.options = options;

    if (this.options === undefined) {
      this.options = {};
    }

    if (this.options.separator === undefined) {
      this.options.separator = '.';
    }

    if (this.options.uriSeparator === undefined) {
      this.options.uriSeparator = '/';
    }

    this.cache = {};
  }

  /*
    Get a unique ID, given an input ID as a base. If it has already been used,
    then a number (starting at `2`) is appended until an unused ID is found.
    Returns the first available ID.
  */
  getUnique(id) {
    let number = 2;

    if (this.cache[id] === undefined) {
      this.cache[id] = true;
      return id;
    }

    let name = `${id}-${number}`;
    while (this.cache[name]) {
      number++;
      name = `${id}-${number}`;
    }

    this.cache[name] = true;
    return name;
  }

  /*
    Get a key for an array element or object member. The key can either be
    the index, element name, member key value, element title, or element
    class name depending on what makes the most sense. This can be used to
    give paths like `api.parts.frob.get-a-frob.httptransaction.httpresponse`,
    which is nicer than `category.0.0.0.0.0` when just using array indexes.
    The selected slugified key is returned.
  */
  keyForArray(index, refract) {
    let key;

    switch (refract.element) {
    case 'boolean': case 'string': case 'number': case 'array':
    case 'enum': case 'object':
      // Basic types just default to the index value.
      key = index;
      break;
    default:
      // Non-basic types default to the element name, e.g. `resource`.
      key = safeSlug(refract.element);
    }

    // If this is a member and the key is a string, use the key value.
    if (refract.content && refract.content.key &&
        refract.content.key.element === 'string') {
      key = safeSlug(refract.content.key.content);
    }

    // If there is a title or a *single* class name, use that instead as it
    // should contain more specific and relevant information.
    if (refract.meta) {
      if (refract.meta.title) {
        key = safeSlug(refract.meta.title);
      } else if (refract.meta.classes && refract.meta.classes.length === 1) {
        key = safeSlug(refract.meta.classes[0]);
      }
    }

    return key;
  }

  /*
    Get an ID for an element, based on the current path, any existing ID,
    and any element class name. An existing ID will trump other values and
    resets the path. Returns the unique ID to use.
  */
  idForElement(path, refract) {
    let newPath = path;

    if (refract.meta) {
      if (refract.meta.id) {
        newPath = [refract.meta.id];
      } else if (path.length === 0 && refract.meta.classes &&
                 refract.meta.classes.length === 1) {
        // This is the first item, and it has a class name, so we use that.
        newPath = [refract.meta.classes[0]];
      }
    }

    let id = newPath.join(this.options.separator);

    if (!id) {
      id = refract.element;
    }

    return this.getUnique(id);
  }

  /*
    Forge an ID for a single refract structure and any children in-place.
  */
  forgeOne(path, refract) {
    if (!refract) {
      return refract;
    }

    if (!refract.meta) {
      refract.meta = {};
    }

    refract.meta.id = this.idForElement(path, refract);

    if (!refract.meta.links) {
      refract.meta.links = [];
    }

    if (refract.meta.id && refract.meta.id.split) {
      refract.meta.links.push({
        element: 'link',
        content: {
          relation: 'uri-fragment',
          href: refract.meta.id.split(this.options.separator)
                               .map((item) => safeSlug(item))
                               .join(this.options.uriSeparator),
        },
      });
    }

    // Array like content containing elements?
    if (refract.content && refract.content.length && refract.content[0].element) {
      for (let i = 0; i < refract.content.length; i++) {
        const item = refract.content[i];
        const key = this.keyForArray(i, item);
        const newPath = [refract.meta.id, key].join(this.options.separator);

        switch (item.element) {
        case 'ref':
          // Skip includes as the included object will have its own
          // ID already.
          continue;
        case 'member':
          // Probably object members
          this.forgeOne([`${newPath}-member`], item);
          this.forgeOne([`${newPath}-key`], item.content.key);
          this.forgeOne([newPath], item.content.value);
          break;
        default:
          // Probably array or enum items
          this.forgeOne([newPath], item);
        }
      }
    }

    return refract;
  }

  /*
    Forge IDs for an array of refract structures.
  */
  forge(structures) {
    for (let i = 0; i < structures.length; i++) {
      this.forgeOne([], structures[i]);
    }

    return structures;
  }
}

module.exports = {
  Abagnale,
  forge(structures, options) {
    const abagnale = new Abagnale(options);
    return abagnale.forge(structures);
  },
};
