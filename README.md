# Open Data Layer
The Open Data Layer (ODL) is a concept designed to standardize common data communication
between the frontend space (i.e. a website's frontend markup) and any third parties
(e.g. analytics or affiliate tools). It's ultimate goal is to *make third-party integration
on websites less painful and more standardized* while keeping the developers in full
control of their frontend code.

The system has been developed for the [online shop of Galeria Kaufhof](http://www.kaufhof.de),
the leading german warehouse company and part of the HBC group, and is in use for almost three years
now. And, since we are all convinced that this is a good approach, we decided to open-source it.
[Read more about reasoning and benefits](#) in the associated blog article.

It is important to note that *ODL is no tag manager* in a classical way. However, it *can* (and
*should*) be used as a replacement for external tag management systems.

* [General concept](#general-concept)
* [Implementation](#implementation)
* [Usage](#usage)
* [Plugins](#plugins)
* [Events](#events)
* [Datatypes](#datatypes)

-----------------------

## General concept
Usually you would expect a Quickstart section at this point? Agreed, but it is absolutely
mandatory to understand the basic concept of the ODL before moving to the [Usage](#usage)
and [Implementation](#implementation) details.

### What is the problem?
What is the problem with common tag managagement systems? Any third-party vendor recommends me to
use one and I don't have to care for all that marketing stuff.

#### Short answer
Unless you manage the tags yourself, you - the developer - are completely overruled
when it comes to code execution within the client space of your website. If you manage the tags
then you have application code split up into some 3rd party GUI somewhere on an external server.

#### Long answer
It highly depends on the size of your team and business. If you have a
website that is run by three people, including developers, then you might be well-suited
with an external tag management system (even though ODL would still be the best option, if
used as a base for the 3rd party tagmanager). But starting with a medium-sized business and a dedicated
online marketing department you might end up in a common situation: marketing asks for adding yet
another "pixel" for the next best marketing tool and some junior dev (or even a marketeer himself,
with support from an external agency) adds it to the tagmanager. Welcome to hell. You, the
developer, are completely overruled when it comes to code execution within the client space of
your website.

If you combine this with modern onsite marketing and A/B testing tools, you simply don't matter
any more.

### How does ODL fit in there?
...

### How does ODL work?
The backend applications then render specific markup that gets analyzed and aggregated by the ODL.
External plugins (econda, tag managers, affiliates, ..) can be integrated using a modularized
architecture and can then access the data in the ODL.

The idea as such is quite common for tag managagement systems but any vendor uses his/her own
implementation, based on more or less flexible data models.

TODO: more details here, maybe some pics

-----------------------

## Implementation
TODO: Describe general flow of data, events etc.

### Pass data to the ODL
The default way of passing data to the ODL is completely free of scripting and happens right from
within a website's markup. You provide special `<meta>`-tags with the `name` attribute set to `odl:data`.
The `content` attribute then contains a JSON-formatted object with any information to be supplied, based
on the defined [ODL model](#data-types).

As a minimum requirement each page has to define a metatag with an [ODLGlobalData](model/ODLGlobalData.avdl)
object, as illustrated in the following example:

```html
<meta name="odl:data" content='{
  "site":{
    "id":"dev"
  },
  "page":{
    "type":"homepage",
    "name":"Startseite"
  },
  "user":{
    "id":"1234-5555-12-abcde"
  }
}' />
```

### Pass events to the ODL
Passing events works in the same way as passing data.

TODO ...

### Disabling the ODL within tests
You might want to disable the ODL on a page level, e.g. within the context of UATs or testing in general.
You can use the following metatag for that, which completely stops the initialization of the ODL:

```html
<meta name="odl:disable" content="true" />
```

-----------------------

## Usage
The following steps should give a brief and easy-to-understand summary of the integration of ODL
into your website. More detailed topics are covered in the other parts of the documentation.
In almost any project you will completely abstract and automize the following steps inside your
frontend build pipeline. The main reason to change the configuration after the inital setup is
when you add or remove plugins.

### 1. Install the module
The easiest way to get started is by installing the ODL package via npm:

```
npm install opendatalayer --save
```

### 2. Configure and build the ODL script
ODL comes bundled with its own build tool. You can use it to create your personal ODL build by passing
in your individual configuration (read more about the [plugin configuration](#plugin-configuration) and
[ODL builder options](#) in the respective sections). In most cases you would include the
following code somewhere within your application's build process (e.g. gruntfile or
gulpfile):

```javascript
var odlBuilder = require('odl/builder');

// add plugin list, including configuration for individual plugins
odlBuilder.addConfig({
  'odl/plugins/myglobalplugin': {
    rule: true,
    config: {
      accountId: '12345abcde'
    }
  },
  'odl/plugins/myhomepageplugin': {
    rule: (data) -> (data.page.type === 'homepage'),
    config: {
      partnerCode: 'FOOBAR'
    }
  }
});

// execute build and generate output
odlBuilder.buildPackage({
  metaPrefix: 'mysite:odl:',  // optional, can be used to create custom namespaces
  targetDir: 'build/mywebsite-odl.1.123.js'
});
```

As you can see ODL relies entirely on compile-time configuration to keep developers in
full control over things happening in the client space. We at Galeria Kaufhof strongly
believe in test-driven workflows and developer involvement. That's one reason we moved away from
marketing-controlled tag management systems - and dont't regret it.
However, it is still possible to dynamically load plugins through ODL's script API. That means
one could even build a classical, UI-driven tag management system on top of the ODL standard.

### 3. Include ODL in your website
You can directly include ODL via script tag and then access the API through a global array:

```html
<script src="/some/path/to/mywebsite-odl.1.123.js" type="text/javascript" async></script>
<script>
(function() {
  window._odl = window._odl || [];
  window._odl.push(['load', function (odl) {
    odl.broadcast('foo', 'bar');
  }]);
}());
</script>
```

If you use an AMD-loader (like e.g. [requirejs](http://requirejs.org)) you can easily import
the module using asynchronous module definition syntax. Then you can directly access the API
via the module's exported methods:

```javascript
require(['/some/path/to/mywebsite-odl.1.123.js'], function (odl) {
  odl.broadcast('foo', 'bar');
});
```
It is important to mention that - under normal circumstances - there should be no need to
directly access the ODL via it's script API, unless you have some very special requirements.
ODL is designed to be completely accessible via `data-odl-*` attributes (as described in
detail in the [Events documentation](#simplified-markup-notation)). Also the call to
`odl.init` is intentionally left out here. When using odl-builder the ODL is automatically
initialized behind the scenes.

All [API methods](#) are available either through the AMD module or the global `window._odl`
object. In case of the window global you simply define an array with the function name followed
by the function parameters. Then you push it to the global array. By extending the
`push` method, ODL will execute the function as soon as it becomes available. The following two
calls will the same effect:

```javascript
// global object API
window._odl.push(['broadcast', { foo: 'bar' }]);

// AMD style
require(['opendatalayer'], function (odl) {
  odl.broadcast({ foo: 'bar' });
})
```


-----------------------

## Plugins
The ODL provides a modular architecture where any additional logic is encapsulated
in plugins. Plugins can access the global data aggregated by the ODL and also send
and - more importantly - receive events.

### ODL data flow ###
Whenever the ODL receives an event to be broadcasted it adds it to the internal queue
and sends it to all currently loaded plugins. When a plugin is newly loaded *it will receive
all events that happened until that point* - this has been a very clear design decision. We
want to avoid situations where plugins are loaded late (e.g. through asynchronous loading)
and then miss important information that happended earlier in the page's lifecycle.

### Plugin configuration
TODO ...

### Overriding plugin configurations on page-level
The ODL offers the possibility to provide dedicated configurations to plugins on a by-page-basis.
This might be used to e.g. override URLs of a third-party system within integration tests. To
achieve that you would simply define an `odl:config`-metatag, that can be used to override
configuration within a plugin. Of course, the plugin has to actively support configuration
overrides for this to work.

#### Example for overriding a plugin configuration from within the markup

```html
<meta name="odl:config" content='{
  "odl/plugins/richrelevance":{
    "baseUrl": "mymockupserver",
    "forceDevMode": true
  }
}' />
```

-----------------------

## Events
The ODL provides two different types of events: rendertime and runtime
events. Using these events the ODL can receive data from either the
page's markup or, asynchronously, from a script during the runtime of the page.

### Rendertime Events
The rendertime events provide data for the ODL via a metatag that
is already available when the page is delivered from the backend
application. This data gets then aggregated by the ODL and is passed
to the plugin's `ìnitialize` method.

#### Example of a global "pageload" event for a search result page

```html
<meta name="odl:event" content='{
  "pageload": {
    "site":{
      "id":"dev"
    },
    "page":{
      "type":"search-result",
      "name":"Search Results"
    },
    "user":{
      "id":"1234-5555-12-abcde"
    }
  }
}' />
```

#### Supplying a 404 error using [ODLErrorData](model/ODLErrorData.avdl)

```html
<meta name="odl:data" content='{
  "error": {
    "type": "404",
    "source": "/url/where/error/occured?foo=bar",
    "message": ""
  }
}' />
```

### Runtime Events
In addition to the rendertime events the ODL provides runtime events
which get broadcasted during runtime (e.g. z.B. Teaser-Click,
Teaser-View, AddToCart, ...). These events are dispatched using a dedicated
clientside API, based on Javascript. The following examples illustrate
the different possibilities when using the client-side API.

#### Broadcasting the click on a teaser
The following snippet might be executed when the user clicks a teaser. It broadcasts a
"teaser-click" event thorugh the ODL, directly passing the teaser id as event data.
The event is then dispatched to all loaded plugins, which can react in any way
(e.g. by sending the info to a third-party tracking tool of choice).

```javascript
require(['odl/ODL'], (odl) {
  odl.broadcast({
    name: 'teaser-click',
    data: $teaserElement.attr('data-teaser-id'),
  });
});
```

#### Broadcasting an "addtocart" event with additional product data
The following code sends a "product-addtocart" event to the ODL and passes a
([ODLCartProductData](#odlcartproductdata)) as event data. Interested plugins
could e.g. take this data and hand them over to affiliate pixels which then
use it to optimize their conversion rate.

```javascript
require(['odl/ODL'], (odl) {
  odl.broadcast({
    name: 'product-addtocart',
    data:
      id: '12344321',
      aonr: '123456789',
      ean: '41294791274912',
      name: 'Bunte Hose',
      quantity: 1,
      price: 29.95,
      vat: 4.23,
      discount: 4.94,
  });
});
```

### Simplified markup notation
To remove the need of creating a dedicated script controller for
any single event one might want to broadcast, the ODL offers a simpler,
attribute-based way of broadcasting events. Using the `data-odl-event-*`
attributes you can directly connect HTML elements to ODL events, without
using Javascript. The following examples illustrate this feature:

#### Broadcasting the click on a teaser

```html
<button data-odl-event-click='{"name": "newsletter-subscribe", "data": {"location": "homepage"}}'>
  Subscribe to our newsletter
</button>
```

#### Broadcasting the appearance of an element in the viewport

```html
<div data-odl-event-view='{"name": "teaser-view", "data": {"location": "homepage"}}'>
  ...
</div>
```

### Media tracking
The media tracking through the ODL is based on a dedicated data type
[ODLMediaData](#odlmediadata). This data is supplied only during runtime,
through the mediaplayer's script API. The ODL then automatically initializes
the required tracking functionality (e.g. econda, rumba, ..), completely
transparent for the user of the mediatracking API.

The communication between embedded player and ODL is done via runtime events,
too. The player implementation has to handle various player events and then
the according ODL events in return.

Event name           |        Data            | Event
-------------------- | ----------------------------------------------------------------- | ----------------------------------
media-init           | [ODLMediaData](#odlmediadata)                    | player initialization complete ("ready" event), passes info object with media data
media-played-25      | [ODLMediaPositionData](#odlmediapositiondata)    | media has been played 25% from the beginning
media-played-50      | [ODLMediaPositionData](#odlmediapositiondata)    | media has been played 50% from the beginning
media-played-75      | [ODLMediaPositionData](#odlmediapositiondata)    | media has been played 75% from the beginning
media-played-95      | [ODLMediaPositionData](#odlmediapositiondata)    | media has been played from the beginning "to the end", this is also given when not exactly 100% have been played (95% at least)

#### Sending a media-init event to the ODL (e.g. triggered when embedded player is ready)

```javascript
odl.broadcast('media-init', {
  type: 'video',
  id: '20151212_Video_Startseite_Weihnachtsfilm',
  url: 'http://youtube.de/meinVideoShortcode',
  duration: 240
});
```

#### Sending a media-played-75 event to the ODL (for a previously initialized video with given ID)

```javascript
odl.broadcast('media-played-75', {
  id: '20151212_Video_Startseite_Weihnachtsfilm',
  position: 180
});
```

-----------------------

## Datatypes
This section describes the data types used within the ODL application. Because of the non-statically-typed nature
of Javascript and JSON the ODL implements several virtual data types used as a "contract" between any
embedding applications and the ODL. The contained information is based on context (e.g. page, user, search, ...)
and not on any business domain.

The ODL datamodel is described using the [AVRO description language](https://avro.apache.org/docs/current/),
this allows for machine processing and automation of validation processes. The full list of type definitions is
now located under the `model` directory in this repositoy. Please point any external links to type definitions
to the respective file in that repository.

### Available data types
* [model/ODLGlobalData.avdl](model/ODLGlobalData.avdl)
* [model/ODLSiteData.avdl](model/ODLSiteData.avdl)
* [model/ODLPageData.avdl](model/ODLPageData.avdl)
* [model/ODLUserData.avdl](model/ODLUserData.avdl)
* [model/ODLBrandData.avdl](model/ODLBrandData.avdl)
* [model/ODLErrorData.avdl](model/ODLErrorData.avdl)
* [model/ODLLoginData.avdl](model/ODLLoginData.avdl)
* [model/ODLRegistrationData.avdl](model/ODLRegistrationData.avdl)
* [model/ODLPriceData.avdl](model/ODLPriceData.avdl)
* [model/ODLCategoryData.avdl](model/ODLCategoryData.avdl)
* [model/ODLNavigationData.avdl](model/ODLNavigationData.avdl)
* [model/ODLSearchData.avdl](model/ODLSearchData.avdl)
* [model/ODLProductData.avdl](model/ODLProductData.avdl)
* [model/ODLCartData.avdl](model/ODLCartData.avdl)
* [ODLCartProductData](#odlcartproductdata)
* [model/ODLOrderData.avdl](model/ODLOrderData.avdl)
* [model/ODLAddressData.avdl](model/ODLAddressData.avdl)
* [model/ODLCustomerData.avdl](model/ODLCustomerData.avdl)
* [ODLMediaData](#odlmediadata)
* [ODLMediaPositionData](#odlmediapositiondata)
* [model/ODLNewsletterData.avdl](model/ODLNewsletterData.avdl)
* [model/ODLPromotionData.avdl](model/ODLPromotionData.avdl)

*TODO: move following parts into Avro model files*

### ODLCartProductData
Describes a single prduct within a shopping basket. Inherits all properties from [ODLProductData](model/ODLProductData.avdl)
and adds a `quantity` attribute.

    ODLCartProductData = extend(ODLProductData, {
      /**
        * Anzahl dieses Artikels im zugehörigen Warenkorb.
        */
      "quantity" : {
        "type" : "int",
        "mandatory" : true
      }
    })

### ODLMediaData
Describes a media item (video, audio).

    ODLMediaData = {
      /**
        * Typ des Medienobjektes (video|audio).
        */
      "type" : {
        "type" : "String",
        "mandatory" : true
      },
      /**
        * Name oder ID des Medienobjektes (einmalig(!); sonst frei wählbar, z.B. Dateiname).
        */
      "id" : {
        "type" : "String",
        "mandatory" : true
      },
      /**
        * Vollständige URL zu Mediadatei.
        */
      "url" : {
        "type" : "String",
        "mandatory" : true
      },
      /**
        * Abspieldauer in Sekunden.
        */
      "duration" : {
        "type" : "int",
        "mandatory" : true
      },
    }

### ODLMediaPositionData
Describes a certain position withina media object and is used e.g. for this position
tracking of video and audio data.


    ODLMediaPositionData = {
      /**
        * ID des Medienobjektes, das dieses Event auslöst.
        */
      "id" : {
        "type" : "String",
        "mandatory" : true
      },
      /**
        * Zu übermittelnde Position im Medienobjekt.
        */
      "position" : {
        "type" : "int",
        "mandatory" : true
      }
    }



-----------------------

## Road to 1.0
- cleanup data model: strip deprecated fields, remove inheritance
- create builder tool (based on systemjs-builder?)
- Refactor ODL core implementation to a Promise-driven approach
- Support dynamic bundling in ODL builder to split the package into smaller
  files (e.g. one global file, one for article detail page, one for order completion page) to
  save ressources

## Future plans
- Create a crawler tool that scans an entire website's markup and validates the included
  ODL metatags against the associated Avro model files
- Provide a gulp-opendatalayer plugin
- Provide a grunt-opendatalayer plugin
- Currently ODL is heavily focused on e-commerce websites, we should add more universal types to
  support more content-driven websites, as we have some more real use cases and/or feedback