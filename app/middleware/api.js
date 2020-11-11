module.exports = options => {
    return async function api(ctx, next) {
        //添加model
        
        let model = ctx.originalUrl.split('/')[2];
        model = model.charAt(0).toUpperCase() + model.slice(1);
        ctx.request.body.model = model;
        await next()
    };
  };