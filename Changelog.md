# Master

## Bug Fixes

- Support generating an element ID from a Refracted classes.
- Element IDs will *always* be Refracted elements.

# 1.1.3 - 2017-03-17

## Bug Fixes

- Adds support for Refracted meta IDs.

  ```json
  {
    "element": "string",
    "meta": {
      "id": {
        "element": "string",
        "content": "Hello World"
      }
    }
  }
  ```

# 1.1.2 - 2016-10-27

- Remove `slug` dependency and replace it with `encodeURIComponent`. `slug` was including whole Unicode into final build.

# 1.1.1 - 2016-04-20

- Prevent crashing due to some bad inputs that could not be sluggified.

# 1.1.0 - 2016-03-10

- Revert slugifying existing element IDs as this breaks dereferencing. Instead, we now produce a new link relation called `uri-fragment` with each element that is safe to use in a URL and is based on the element's ID. Note: going from a URI fragment to an element ID requires either a search through all element link relations or a pre-built mapping of URI fragments to elements.

# 1.0.1 - 2016-03-09

- Slugify existing element ID to prevent spaces and invalid characters in paths.
- Fix module main location.

# 1.0.0 - 2016-02-23

- Initial release.
