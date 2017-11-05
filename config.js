var config = {};

config = {
    databases: {
        host: 'cloud.cjjsg0nztt5v.us-west-2.rds.amazonaws.com',
        user: 'root',
        password: 'administrador',
        database: 'cloud',
        port:3306
    },pathVideo: {
        path: 'http://balanceador008-1848884438.us-west-2.elb.amazonaws.com:3001/public/videos/',//35.163.86.10
        pathRender: 'http://balanceador008-1848884438.us-west-2.elb.amazonaws.com:3001/public/videos-render/',
        pathS3: 'http://d2zsdt0a19wk6b.cloudfront.net/videos/',//35.163.86.10
        pathRenderS3: 'http://d2zsdt0a19wk6b.cloudfront.net/videos-render/',
        pathLogic: '/app/public/videos/',
        pathLogicOrigin: '/app/public/videos/',
        pathLogicConvert: '/app/public/videos-render/',
        pathLogicOriginS3: 'videos/',
        pathLogicConvertS3: 'videos-render/'

    },configMail: {
        service: 'Gmail',
        auth: {
            user: 'captuayonovoafredy@gmail.com',
            pass: 'sadsad'
        }
    },configMailFrom: {
        from: 'jlian92@gmail.com',
        subject: '¡Tu video ya se encuentra en el home!',
        text: 'Ya puedes ir a la página principal del concurso y ver tu video en la lista.',
    },configSqs:{
        "auth":{
            "accessKeyId": "AKIAJLQEV2Q7CTCX6UQQ",
            "secretAccessKey": "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"
        },
        "url":"https://sqs.us-west-2.amazonaws.com/347718399261/Proyecto3.fifo",
        "redisport":"6379"
    }, awsSES:{
      host: 'email-smtp.us-west-2.amazonaws.com',
      port: 465,
      secure: true, // use TLS
      auth: {
          user: 'AKIAJHJZGAOLDE377F2Q',
          pass: 'AqXF2gbx+XwUI7yNSsgRAPhWtq6iHoiEg7lxPYkzUyZk'
      }
    }
};

module.exports = config;
