const jwt  = require('jsonwebtoken');
const secret = 'GG';
const whiteRouter = ['/role/login','/driving/commit','/driving/login','/driving/titleList']
// /driving/drivingStat /n
// /driving/schoolType /n
// /driving/fromBy /n
// /driving/driver /n
// /driving/commit /n
// /driving/updateMapTable /n
// /driving/login /n
// /driving/titleList /n
// /driving/titleModify /n
// /driving/export /n
// /driving/distinctGet /n
// /driving/get /n
// /driving/voteList /n
// /role/login /n
module.exports = options => {
  return async function gzip(ctx, next) {
      if(whiteRouter.indexOf(ctx.originalUrl)>-1)await next()
      else{
          console.log(ctx.header.token,ctx.header.token==='[object Object]','???')
          if(!ctx.header.token||ctx.header.token==='[object Object]')return await next();
              let result =await new Promise((resolve,reject)=>{
            try {
                let obj = jwt.verify(ctx.header.token,secret)
                  resolve({
                      status:200,
                      data:obj
                  })
                } catch (error) {
                    reject({
                        status:503,
                        message:error})
                }
        })
        if(result.status!==200){
          ctx.body = {
              status:403,
              message:'请重新登录'
          }    
            }
        ctx.query.role_id = result.data.role_id
        let role = await ctx.model.Role.findOne({
            where:{
                id:result.data.role_id
            },
            include:[{
                    model: ctx.model.Access,
                    through: {
                      attributes: ['id','role_id','access_id']
                    }
                  }],
            // raw:true
        })
        ctx.request.body.accesses = JSON.parse(JSON.stringify(role.accesses));
        await next();
      }
  };
};