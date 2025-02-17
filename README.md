# THIS API IS NO LONGER SUPPORTED AND WON'T WORK ON NEW WEBSITE FRONTEND.

# Pitchfork API

Unofficial Pitchfork API for scraping review text. Hugely influenced by the `pitchfork-api`, it's essentially an update on that. Many thanks to the great developers before us.


## Install

`npm install pitchforker`
`npm i pitchforker`


## API

require the module in your Node.js application

`const pitchfork = require('pitchforker');`

to query using the API, define options as follows:

```javascript
const options = {
    genre: 'jazz',
    start: 0,
    size: 500,
    sort: 'asc',
    verbose: false
}
```

by default the values are:

`genre = '', start = 0, size = 1, sort = 'asc', verbose = false;`

genres options are:

`electronic, experimental, folk, global, jazz, metal, pop, rap, rock];`

query using a callback function provided by the api as follows:

```javascript
pitchfork.query(options, (err, res) => {
    console.log(res);
});
```

### Return Types

The api returns an array of two different types, `verbose = false` returns an array of review text:

```
[
    "This album is ...",
    "This is another review ..."
]
```

`verbose = true` returns an array of objects with the following properties:

```
[
    {
        rating: '1.0',
        url: '/reviews/albums/an-album/',
        review: "this is a review ..."
    },
    {
        rating: '2.6',
        url: '/reviews/albums/another-album/',
        review: "this is another review ..."
    }
]
```
