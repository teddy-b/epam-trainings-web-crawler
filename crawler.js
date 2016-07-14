/**
 * Created by Teodora_Boneva on 7/7/2016.
 */

const express = require('express'),
    fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio'),
    app = express();

app.get('/scrape', (req, res) => {
    'use strict';

    const baseUrl = 'https://www.youtube.com';

    let initialId = '/watch?v=_bAPg1YYLsE',
        url = baseUrl + initialId,
        playlist = [],
        $,
        title,
        nextId,
        nextUrl;

    const recursive = url => {
        let html = '<ol>';

        const getNextSong = url => {
            return new Promise((resolve, reject) => {
                request(url, (err, response, html) => {
                    if (err) {
                        console.log(`Error: ${err}`);
                    }

                    console.log(`Visiting page: ${url}`);

                    if (response.statusCode === 200) {
                        console.log(`Status code: ${response.statusCode}`);
                        $ = cheerio.load(html);
                        title = $('#eow-title').html().trim();
                        console.log(`Title: ${title}\nUrl: ${url}`);

                        if (playlist.map(song => song.url)
                                .indexOf(url) === -1) {
                            playlist.push({
                                title: title,
                                url: url
                            });

                            console.log('Song added to playlist!');
                        } else {
                            console.log('Song already exists in the playlist!');
                        }

                        nextId = $('#watch7-sidebar-modules .autoplay-bar a')
                            .attr('href');
                        nextUrl = baseUrl + nextId;
                        console.log(`Next: ${nextUrl}`);
                        resolve(nextUrl);
                    } else {
                        reject(`Error: Status code: ${response.statusCode}`);
                    }
                });
            });
        };

        if (playlist.length > 9) {
            fs.writeFile('playlist.json', JSON.stringify(playlist), err => {
                if (err) {
                    console.log(`Error: ${err}`);
                }

                console.log('File successfully written!');
            });

            playlist.forEach(song => {
                html += `<li><a href=${song.url}>${song.title}</a></li>`;
            });

            html += '</ol>';
            res.send(html);

            return;
        }

        getNextSong(url)
            .then(nextUrl => recursive(nextUrl),
                reason => console.log(reason));
    };

    recursive(url);
});

app.listen('8080');
console.log('Listening on port 8080');

exports = module.exports = app;
