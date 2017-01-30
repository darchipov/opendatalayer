/**
 * Fake mini-service to test service integration.
 */
export default class ODLPluginMock {
  constructor(odl, data, config) {
    this.__type__ = 'Mock';
    this.odl = odl;
    this.data = data;
    this.config = config;
    this.events = {};
  }

  handleEvent(eventName, eventData) {
    //console.log(`handleEvent "${eventName}"`, eventData);
    if (typeof eventName === 'string') {
      this.events[eventName] = eventData;
    } else {
      //console.log('Object: ', eventName);
      this.events[eventName.name] = eventName.data;
    }
    //console.log('events:', this.events);
  }

  /**
   * Required for testing "broadcast later" feature
   */
  getEvents(eventName) {
    return this.events[eventName];
  }
}
