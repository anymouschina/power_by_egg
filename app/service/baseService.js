const Service = require('egg').Service;
class baseService extends Service{
    async findList(){
        const {ctx,app} = this;
        console.log(ctx.request.body,ctx.originalUrl)
        const params = {}
        Object.keys(ctx.request.body).map(key=>{
            if(key !== 'model')params[key] = ctx.request.body[key];
        })
        Object.keys(ctx.query).map(key=>{
            params[key] = ctx.query[key];
        })
        ctx.model[ctx.request.body.model].findAll({raw:true,
         where:params
        })
        return []
    }
    async update(){
        const {ctx,app} = this;
        let data = await ctx.model[ctx.request.body.model].bulkCreate([ctx.request.body])
        return data
    }
    async delete(){
        const {ctx,app} = this;
        let data = await ctx.model[ctx.request.body.model].destroy({
            where:{id:ctx.request.body.id}
        })
        return data
    }
}
module.exports = baseService