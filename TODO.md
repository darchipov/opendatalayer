# TODOs / Issues (while missing an issue tracker)

## mandatory
- remove ODL.collectIdentityDataFromCookies and add ODL.addData to be able to set identity data from outside the core
- add some sort of initialize callback that can be handled via method queue (hmm, how does the concept of callbacks works with the MQP?)
- stabilize builder
- move builder to dedicated module 'opendatalayer-builder'
- test real-world usecase of builder (i.e. when included as npm dependency)
- improve functional tests
- port all functional tests from DAL to ODL

## nice-to-have
- port ODL core to Promise-driven API
