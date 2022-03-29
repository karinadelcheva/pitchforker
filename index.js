const axios = require('axios').default;
const htmlToText = require('html-to-text');

var genres = ['electronic', 'experimental', 'folk', 'global', 'jazz', 'metal', 'pop', 'rap', 'rock'];
const baseUrl = 'https://pitchfork.com/api/v2';

function apiSearchQuery(genre, start, size, sort) {
    return new Promise((resolve, reject) => {
        var url = `${baseUrl}search/?types=reviews&hierarchy=channels%2Freviews%2Falbums&sort=rating%20${sort}%2Cposition%20asc&rating_from=0.0`;
        
        try {
            const response = await axios.get(url, {
                params: {
                'genre': genre,
                'size': size, 
                'start=': start
            }});
            resolve(response);
        }
        catch {
            reject(e);

        }
        
    });
}

function apiReviewQuery(url) {
    return new Promise((resolve, reject) => {

        try {
            const response = await axios.get(`${baseUrl}${url}`);
            resolve(htmlToText.fromString(JSON.parse(data).results[0].body.en, { wordwrap: false }));

        }
        catch (e) {
                reject(e);
            }
    });
}

function runSearchQuery(genre, start, size, sort, verbose) {
    return new Promise((resolve, reject) => {
        var SearchQueryList = [];
        var ReviewQueryList = [];
        var reviews = [];
        var reviewText = [];
        while (size > 0) {
            var sizeQuery = size < 200 ? size : 200;
            SearchQueryList.push(apiSearchQuery(genre, start, sizeQuery, sort))
            start += 200;
            size -= 200;
        }

        Promise.all(SearchQueryList)
            .then(res => {
                reviews = parseUrls(res, verbose);
                reviews.forEach(review => {
                    ReviewQueryList.push(apiReviewQuery(review.url));
                })

                Promise.all(ReviewQueryList)
                    .then(res => {
                        if (verbose) {
                            for (var i = 0; i < reviews.length; i++) {
                                reviews[i].review = res[i];
                            }
                            resolve(reviews);
                        } else {
                            resolve(res);
                        }
                    })
            })
            .catch(err => reject(err));
    });
}

function parseUrls(data, verbose) {
    let reviews = [];
    data.forEach(query => {
        var maxRating = query.results.list[query.results.list.length - 1].tombstone.albums[0].rating.display_rating;
        query.results.list.forEach(review => {
            var rating = review.tombstone.albums[0].rating.display_rating;
            if (rating <= maxRating) {
                if (verbose) {
                    reviews.push({ rating: rating, url: review.url });
                } else {
                    reviews.push({ url: review.url });
                }
            }
        })
    });
    return reviews;
}

module.exports.query = function query(options, callback) {
    let genre = '', start = 0, size = 1, sort = 'asc', verbose = false;
    if ('genre' in options) {
        if (genres.includes(options.genre)) {
            genre = options.genre;
        } else {
            callback(new Error(`Genre is invalid. Select one of the following genres: ${genres}`))
            return;
        }
    }
    if ('start' in options && !isNaN(options.start)) {
        start = options.start;
    }
    if ('size' in options && !isNaN(options.size)) {
        size = options.size;
    }
    if ('sort' in options) {
        if (sort != 'asc' && sort != 'desc') {
            callback(new Error('Sort must be string: "asc" or "desc".'))
            return;
        } else {
            sort = options.sort;
        }
    }
    if ('verbose' in options) {
        if (typeof options.verbose === "boolean") {
            verbose = options.verbose;
        } else {
            callback(new Error('Verbose must be a boolean.'));
            return;
        }
    }

    runSearchQuery(genre, start, size, sort, verbose)
        .then((res) => callback(null, res))
        .catch((err) => callback(err));
}