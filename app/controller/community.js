'use strict';
const Controller = require('egg').Controller;
class Instance extends Controller {
    async getList_get(){
        const {ctx} = this;
        let data = await this.service.baseService.findList()
        ctx.body = data
    }
    async update_post(){
        const {ctx} = this;
        let data = await this.service.baseService.update()
        ctx.body = data
    }
    async delete_post(){
        const {ctx} = this;
        let data = await this.service.baseService.delete()
        ctx.body = data
    }
}

module.exports = Instance;
