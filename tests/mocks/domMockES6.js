/**
 * Simple mock for testing DOM manipulations
 */
import * as sinon from 'sinon';

/**
 * Internal lists with elements created using appendChild.
 */
const appendedElements = [];

/**
 * Internal lists with elements created using createElement
 */
const createdElements = [];

/**
 * Internal lists with elements created using insertBefore
 */
const insertedElements = [];

/**
 * Mockup class for HTML elements.
 */
class HTMLElementMock {
  constructor(tagName, parentNode) {
    this.tagName = tagName;
    this.parentNode = parentNode;
    this.childNodes = [];
  }
  appendChild(el) {
    appendedElements.push(el);
    this.childNodes.push(el);
    el.parentNode = this;
  }
  insertBefore(el) {
    insertedElements.push(el);
  }
}

/**
 * Window object mock.
 */
export const window = {

  getLastAppendedElement: () => appendedElements[appendedElements.length - 1],

  getLastCreatedElement: () => createdElements[createdElements.length - 1],

  getLastInsertedElement: () => insertedElements[insertedElements.length - 1],

  location: {
    href: '',
    search: '',
    path: '',
  },

  navigator: {
    userAgent: 'My Fake Useragent; version 9.12345; looks like an orange but might be a banana in disguise; WinMappleNix 11.27',
  },

  document: {
    createElement: (tagName) => {
      const element = new HTMLElementMock(tagName, null);
      console.log(element);
      createdElements.push(element);
      return element;
    },

    getElementsByTagName: (tagName) => {
      [createdElements.map((obj) => obj.tagName === tagName)]
    }

  },
};

export default window;
