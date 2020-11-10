const Service = require('egg').Service;
class UserService extends Service {
    //每个问题为统计基础,分别统计个人，分校，全校区评价占比
    async statistic_group_by_question(){
        const {ctx,app,service} = this
        let {type} = ctx.query //type 0:个人 1:分校 2:全校
        let titleList = await service.driving.titleList()
        let list = []
        titleList = JSON.parse(JSON.stringify(titleList))
        // for(let key in titleList){
        //     let {dataValues:item} = titleList[key]
        //     item.answer = await new Promise((resolve,reject)=>{
        //         app.model.query(`SELECT DISTINCT result FROM vote_result WHERE title_no=${item.id}`).then(project=>{
        //             resolve(project[0])
        //         })
        //     })
        //     list.push(item)
        // }
        list = await Promise.all(titleList.map(item=>{
            return new Promise((resolve,reject)=>{
                app.model.query(`SELECT DISTINCT result FROM vote_result WHERE title_no=${item.id}`).then(project=>{
                    resolve({...item,answer:project[0]})
                })
            })
        }))
        let data = []
        if(type === '0'){
            data = await service.drivingStatistics.get_by_0()
        }else if(type === '1'){
            data = await service.drivingStatistics.get_by_1()
        }else{
            data = await service.drivingStatistics.get_by_2()
        }
        ctx.body = {data,column:list,status:200}
    }
    async get_by_driver(list){
        const {ctx,service} = this
        let rows = await this.service.driving.get_all_driver();
        for(let item in rows){
            // await rows[item]
                let column = {}
                let count = await ctx.model.Records.count({
                    where:{driver_id:rows[item].id}
                })
                await Promise.all(list.map(async question=>{
                        column[`title_${question.id}`] = await Promise.all(question.answer.map(async result=>{
                            let curItem = await ctx.model.Vote.count({
                                where:{
                                    title_no:question.id,
                                    driver_id:rows[item].id,
                                    result:result.result
                                }
                            })
                            
                            return parseFloat(curItem/count).toFixed(4)*100 +'%'
                            // return `${curItem} ${count}`
                        }))
                }))
                rows[item].total = count
                rows[item].count = column
        }
        return rows
    }
    async get_by_0(list){
        const {ctx,service,app} = this
        const {pageSize,pageNo,location,name,startTime,endTime} = ctx.query,query = {where:{}};
        // let rows = await this.service.driving.get_all_driver();
        if(pageNo&&pageSize){
            query.offset = parseInt(pageSize*(pageNo-1))
            query.limit = parseInt(pageSize);
        }
        if(name){
            query.where.name = name
        }
        if(location){
            query.where.location = location
        }
        const column = await app.model.query(`SELECT DISTINCT result FROM vote_result`);
        const Driver = await ctx.model.Driver.findAll({
            ...query,
            raw:true,
            attributes:['id']
        })
        let rows = await Promise.all(Driver.map(async item=>{
            return await ctx.model.Driver.findOne({
                where:{id:item.id},
                attributes:{
                  include:[
                     [
                            app.Sequelize.literal(`(SELECT count(created) FROM vote_record as a  where a.driver_id = Driver.id)`),'total'
                        ]
                ]  
                },
                include: [{
                    model: ctx.model.Question,
                    attributes:{
                        include:[...column[0].map(item=>{
                            let str = `(SELECT count(result) FROM vote_result as a  where questions.id = a.title_no and a.driver_id = Driver.id and a.result  LIKE '${item.result}' )`
                            if(startTime&&endTime){
                                str = `(SELECT count(result) FROM vote_result as a  where  questions.id = a.title_no and a.driver_id = Driver.id and a.result  LIKE '${item.result}' and a.created in (SELECT created FROM vote_record as c WHERE c.created_time > '${startTime}' and c.created_time < '${endTime}'))`
                            }
                            return [app.Sequelize.literal(str),`total_${item.result}`]
                        })],
                        exclude:['title','DriverQuestion','tag']
                    },
                    through: {
                      attributes: ['id']
                    }
                  }]
            }) 
        }))
        return rows
    }    
    async get_driver_grade(){
        const {ctx,service,app} = this
        let rows = app.Sequelize.literal(`SELECT title FROM question_choose as a where 'questions'.'id' = a.question_id`)
        console.log(rows,'??')
        return rows
    }
    async get_by_1(){
        const {ctx,service,app} = this
        let query =`(SELECT count(created) FROM vote_record as a  where (SELECT location from Driver_user as b where a.driver_id = b.id) = Driver.location )`,{startTime,endTime} = ctx.query
        // let rows = await this.service.driving.get_all_driver();
        const column = await app.model.query(`SELECT DISTINCT result FROM vote_result`);
        const row = await app.model.query(`SELECT DISTINCT location FROM Driver_user`);
        if(startTime&&endTime){
            query = `(SELECT count(created) FROM vote_record as a  where (SELECT location from Driver_user as b where a.driver_id = b.id) = Driver.location and a.created_time>='${startTime}' and a.created_time<='${endTime}')`
        }
        let rows = row
        // await Promise.all(row[0].map(async item=>{
        //     return await ctx.model.Driver.findAll({
        //         where:{location:item.location},
        //         group:['location'],
        //         // having:['COUNT(?)>?', 'name', 1],
        //         attributes:{
        //              include:[
        //             [app.Sequelize.fn('AVG', app.Sequelize.col('grade')), 'grade']],
        //             [ app.Sequelize.literal(`(SELECT count(created) FROM vote_record as a  where a.driver_id in (SELECT id from `Driver_user` as d where d.location like '%${item.location}%' ))`),'total']
        //         }
               
        //     })
        // }))
        // await Promise.all(row[0].map(async item=>{
        //     return await ctx.model.Driver.findOne({
        //     // group:['location','questions.id'],
        //     // having:['COUNT(?)>?', 'location', 1],
        //     where:{
        //         location:item.location
        //     },
        //     attributes:{
        //         exclude:['name'],
        //         include:[
        //             [
        //                 app.Sequelize.literal(query),'total'
        //             ]
        //         ]
        //     },
        //     include: [{
        //         model: ctx.model.Question,
        //         required: true,
        //         include:[{
        //             model:ctx.model.QuestionChoose
        //         }],
        //         attributes:{
        //             include:[...column[0].map(item=>{
        //                 let str = `(SELECT count(result) FROM vote_result as a  where questions.id = a.title_no and (SELECT location from Driver_user as b where a.driver_id = b.id) = Driver.location and a.result  LIKE '${item.result}')`
        //                     if(startTime&&endTime){
        //                         str = `(SELECT count(result) FROM vote_result as a  where questions.id = a.title_no and (SELECT location from Driver_user as b where a.driver_id = b.id) = Driver.location and a.result  LIKE '${item.result}' and a.created in (SELECT created FROM vote_record as c WHERE c.created_time > '${startTime}' and c.created_time < '${endTime}'))`
        //                     }
        //                 return [app.Sequelize.literal(str),`total_${item.result}`]
        //             }),(()=>{
        //                  let str = `(SELECT count(result) FROM vote_result as a  where questions.id = a.title_no and (SELECT location from Driver_user as b where a.driver_id = b.id) = Driver.location)`
        //                     if(startTime&&endTime){
        //                         str = `(SELECT count(result) FROM vote_result as a  where questions.id = a.title_no and (SELECT location from Driver_user as b where a.driver_id = b.id) = Driver.location and a.created in (SELECT created FROM vote_record as c WHERE c.created_time > '${startTime}' and c.created_time < '${endTime}'))`
        //                     }
        //                 return [app.Sequelize.literal(str),`total`]
        //             })()],
        //             exclude:['title','DriverQuestion','tag']
        //         },
        //         through: {
        //           attributes: ['id']
        //         }
        //       }]
        // })
        // }))
        // rows = JSON.parse(JSON.stringify(rows))
        // rows = Array.prototype.map.call(rows,item=>{
        //     item.questions = item.questions.map(item1=>{
        //         if(item1.question_chooses.length>0){  
        //             let obj = {},max = 0
        //             item1.question_chooses.map(item2=>{
        //                 obj[item2.title] = item2.number
        //                 if(item2.number>max) max = item2.number
        //             })
        //             let get_num = Object.keys(item1).filter(key=>{
        //                 return key.indexOf('total_')>-1
        //             }).reduce((lat,cur)=>{
        //                 let key = cur.split('_')[1];
        //                 return lat + (obj[key]||0) * item1[cur]
        //             },0),max_num = max * item1.total;
        //             return {
        //                 ...item1,
        //                 grade:parseFloat(get_num/max_num).toFixed(4)
        //             }
        //         }else{
        //             return {...item1,grade:0}
        //         }
        //     })
        //     return item
        // })
        // if(ctx.query.location)rows = rows.filter(item=>{return item.location === ctx.query.location})
        return rows
    }
    async  get_by_2(){
        const {ctx,service,app} = this
        let {startTime,endTime} = ctx.query,query = `(SELECT count(created) FROM vote_record)`
        // let rows = await this.service.driving.get_all_driver();
        const column = await app.model.query(`SELECT DISTINCT result FROM vote_result`)
        if(startTime&&endTime){
            query = `(SELECT count(created) FROM vote_record as a  where a.created_time>='${startTime}' and a.created_time<='${endTime}')`
        }
        let rows = await ctx.model.Driver.findOne({
            // group:['questions.id'],
            // having:['COUNT(?)>?', 'location', 1],
            // plain:true,
            attributes:{
                exclude:['name','location'],
                include:[
                    [
                        app.Sequelize.literal(query),'total'
                    ]
                ]
            },
            include: [{
                model: ctx.model.Question,
                attributes:{
                    include:column[0].map(item=>{
                         let str = `(SELECT count(result) FROM vote_result as a  where questions.id = a.title_no and a.result  LIKE '${item.result}' )`
                            if(startTime&&endTime){
                                str = `(SELECT count(result) FROM vote_result as a  where questions.id = a.title_no and a.result  LIKE '${item.result}'and a.created in (SELECT created FROM vote_record as c WHERE c.created_time > '${startTime}' and c.created_time < '${endTime}'))`
                            }
                        return [app.Sequelize.literal(str),`total_${item.result}`]
                    }),
                    exclude:['title','DriverQuestion','tag']
                },
                through: {
                  attributes: ['id']
                }
              }]
        })
        return rows
    }
    async updateMapTable(){
        const {ctx, app} = this
        let Driver = await ctx.model.Driver.findAll({raw:true})
        let data = await Promise.all(Driver.map(async item=>{
            let arr = (new Array(20).fill(0)).map((sitem,index)=>{
                return {
                    driver_id:item.id,
                    question_id:index+1
                }
            })
            return await ctx.model.DriverQuestion.bulkCreate(arr)
        }))
        ctx.body = {
            status:200,
            data
        }
    }
    //每个校区单月，年度参与调查人数 使用老接口
    
    //学院报名来源渠道的各项占比
      
    //教练个人详细数据统计展示
}
module.exports = UserService;