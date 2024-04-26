'use strict'

const asyncHandler = fn => {
    return (req, res, next) => {
      // Make sure to `.catch()` any errors and pass them along to the `next()`
        fn(req, res, next).catch(next);
    }
}


module.exports = {
    asyncHandler
}