'use strict'

// This helper function will wrap each route handler in a try/catch block so that we can catch any errors that are thrown and pass them to Express's default error handler (which will return a 500 status code and the error message). 
const asyncHandler = fn => {
    return (req, res, next) => {
      // Make sure to `.catch()` any errors and pass them along to the `next()`
        fn(req, res, next).catch(next);
    }
}


module.exports = {
    asyncHandler
}