const Service = require('egg').Service;
class baseService extends Service{
    async findList(){
        const {ctx,app} = this;
        const params = {}
        Object.keys(ctx.request.body).map(key=>{
            if(key !== 'model')params[key] = ctx.request.body[key];
        })
        Object.keys(ctx.query).map(key=>{
            params[key] = ctx.query[key];
        })
        let model = ctx.request.body.model;
        model = model.charAt(0).toUpperCase() + model.slice(1)
        const data = await ctx.model[model].findAll({raw:true,
         where:params
        })
        return data
    }
    async update(){
        const {ctx,app} = this;
        let model = ctx.request.body.model;
        model = model.charAt(0).toUpperCase() + model.slice(1)
        let data = await ctx.model[model].bulkCreate([ctx.request.body])
        return data
    }
    async delete(){
        const {ctx,app} = this;
        let model = ctx.request.body.model;
        model = model.charAt(0).toUpperCase() + model.slice(1)
        let data = await ctx.model[model].destroy({
            where:{id:ctx.request.body.id}
        })
        return data
    }
}
module.exports = baseService