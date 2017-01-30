// Simple mock for testing DOM manipulations
//
// Use like:
// - assert.isDefined(window.createdEl)
// - assert.equals(window.appendedEl.src, "someurltotestfor")
// - assert.equals(window.insertedEl.src, "someotherurl")

var window = {

  // the last created HTMLElement by using document.createElement
  createdEl: null,

  // the last appended Element using getElementsByTagName(...)[0].appendChild
  appendedEl: null,

  // the last inserted Element using getElementsByTagName(...)[0].parentNode.insertBefore
  insertedEl: null,

  location: {
    href: "",
    search: "",
    path: ""
  },

  navigator : {
    userAgent: "My Fake Useragent; version 9.12345; looks like an orange but might be a banana in disguise; WinMappleNix 11.27"
  },

  document: {

    createElement: function (tagName) {
      window.createdEl = {
        tagName: tagName,
        src: ""
      };
      return window.createdEl;
    },

    getElementsByTagName: function () {
      return [
        {
          appendChild: function (el) {
            window.appendedEl = el;
          },
          parentNode: {
            insertBefore: function (el, parent) {
              window.insertedEl = el;
            }
          }
        }
      ]
    }

  }
}

module.exports = window;