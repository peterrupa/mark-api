import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import expressValidator from 'express-validator';
import cors from 'cors';

import * as passportLocalStrategy from './passport/local';
import routes from './routes/index';
import { log } from './util/logger';

const app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(expressValidator());
app.use(cookieParser());

// supply origin header if it is empty
app.use((req, res, next) => {
    req.headers.origin = req.headers.origin || req.headers.host;

    next();
});

app.use(
    cors({
        credentials: true,
        origin: (origin, cb) => {
            // allow everyone
            cb(null, true);
        }
    })
);
app.use(
    session({
        secret: 'nova_romania_system_321',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

passportLocalStrategy.init();

app.use(express.static(__dirname + '/public'));

app.use(routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    // prettier-ignore
    app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
        if (typeof err.status === 'undefined' || err.status >= 500) {
            log('Error', err);
        }

        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
// prettier-ignore
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err.status === 'undefined' && err.status >= 500) {
        log('Error', err);
    }

    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});

export default app;
