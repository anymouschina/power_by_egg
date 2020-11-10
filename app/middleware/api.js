module.exports = options => {
    return async function api(ctx, next) {
        //添加model
        ctx.request.body.model = ctx.originalUrl.split('/')[1];
        await next()
    };
  };