var VideoModel = require('../models/video');
var EmailController = require('../controllers/EmailController');
var ffmpeg = require('ffmpeg');
var config = require('../config');
var S3FS = require('s3fs');
var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    Q = require('q');

var AWS = require('aws-sdk');
//AWS.config.loadFromPath('../s3_config.json');
AWS.config.update({region:'us-west-2'});
var s3 = new AWS.S3({params: {Bucket: 'cloud-proyecto3/videos-render'}});
var mongoose = require('mongoose');
var Modelo = mongoose.model('Modelo');

// ffmpeg convert function
exports.convertVideoToMp4 = function (message, email) {
    //notify se actualizar en convertVideo VideoController
    console.log("entro al convert");
    urlOrigin = message.url.replace(config.pathVideo.pathS3, '');
    descargarVideo(urlOrigin, message, email);
    console.log("salio al convert");
};
function _convertVideoToMp4(message, email){
    //notify se actualizar en convertVideo VideoController
    console.log("entro al convert _convertVideoToMp4");
    urlOrigin = message.url.replace(config.pathVideo.pathS3, '');
    descargarVideo(urlOrigin, message, email).then(()=>{
        console.log("function descargarVideo exitosa");
        console.log("salio al convert");
    },(err)=>{
        console.log("function descargarVideo fallida",err);
        console.log("salio al convert");
    })    
}

function descargarVideo(urlOrigin, message, email) {
    return new Promise ((resolve,reject)=>{
        console.log("entro ala descarga");
        var params = {Bucket: 'cloud-proyecto3/videos', Key: urlOrigin};
        var filepath = config.pathVideo.pathLogic + urlOrigin;
        console.log("function descargarVideo: filepath ->",filepath);
        var fileStream = fs.createWriteStream(filepath);
        fileStream.on('open', function () {
            http.get(message.url, function (res) {
                res.on('error', function (err) {
                    reject(err);
                });
                res.pipe(fileStream);
            });
        }).on('error', function (err) {
            revertirNotify(message);
            console.log("function descargarVideo ",err);
            reject(err);
        }).on('finish', function () {
            console.log("entro al envio");
            convertVideo(urlOrigin, message, email);
            resolve(filepath)
        });
    })
};

function revertirNotify(message) {
    console.log(message.id);
    Modelo.find({"administrador.competition.usuario.video.id": message.id}, function (err, datos) {
        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else {
            //url_master is null and show_home = 0 and state_id = 1 and notify = 0
            let tam = datos[0].administrador.competition;
            let email = "";
            let competitionId = datos[0].administrador.competition[0].id;
            for (var i = 0; i < tam.length; i++) {
                for (var j = 0; j < datos[0].administrador.competition[i].usuario.length; j++) {
                    for (var k = 0; k < datos[0].administrador.competition[i].usuario[j].video.length; k++) {
                        if (datos[0].administrador.competition[i].usuario[j].video[k].id === message.id &&
                            datos[0].administrador.competition[i].usuario[j].video[k].url_master === null &&
                            datos[0].administrador.competition[i].usuario[j].video[k].show_home === 0 &&
                            datos[0].administrador.competition[i].usuario[j].video[k].state_id === 1 &&
                            datos[0].administrador.competition[i].usuario[j].video[k].notify === 0) {
                            datos[0].administrador.competition[i].usuario[j].video[k].notify = 0;
                        }
                    }
                }

            }
            Modelo.update({"_id": datos[0]._id}, datos[0], function (err, datos) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    // se modifica funcion porque heroku no la encuebntra
                    //FfmpegController.convertVideoToMp4(message, email);
                    _convertVideoToMp4(message, email);
                }
            });
        }
    });
}

// ffmpeg convert function
function convertVideo(urlOrigin, message, emailUser) {
    if (urlOrigin.indexOf(".mp4") > 0) {
        console.log("va a convertir el video" + urlOrigin);
        try {
            var process = new ffmpeg(config.pathVideo.pathLogicOrigin + urlOrigin);
            process.then(function (video) {
                video
                    .save(config.pathVideo.pathLogicConvert + urlOrigin, function (error, file) {
                        console.log(error);
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log('Video file: ' + file);
                            console.log("Video a convertido");
                            uploadToS3(urlOrigin, urlOrigin, function (err, data) {
                                if (err) {
                                    console.error(err);
                                }
                                console.error("File uploaded to S3: ");
                                console.error(urlOrigin);
                                //actualizar url y todfo lotro
                                actualizarUrlMaster(message, config.pathVideo.pathRenderS3 + urlOrigin).then(() => {
                                    EmailController.sendEmail(emailUser, config.pathVideo.pathRender + urlOrigin);
                                }, (err) => {
                                    res.status(500).json(err);
                                });

                            });

//                            uploadToS3(file, urlOrigin, function (err, data) {
//                                if (err) {
//                                    console.error(err);
//                                }
//                                console.error("File uploaded to S3: ");
//                                EmailController.sendEmail(emailUser, config.pathVideo.pathRender + urlOrigin);
//                            });


                        }
                    });
            }, function (err) {
                console.log('Error: ' + err);
            });
        } catch (e) {
            revertirNotify(message);
            console.log(e.code);
            console.log(e.msg);
        }
    } else {
        try {
            console.log("va a convertir el video no mp4" + urlOrigin);
            var process = new ffmpeg(config.pathVideo.pathLogicOrigin + urlOrigin);
            process.then(function (video) {
                urlOrigin = urlOrigin.replace('.avi', '.mp4');
                urlOrigin = urlOrigin.replace('.mov', '.mp4');
                urlOrigin = urlOrigin.replace('.AVI', '.mp4');
                urlOrigin = urlOrigin.replace('.MOV', '.mp4');
                video
                    .setVideoFormat('mp4')
                    .save(config.pathVideo.pathLogicConvert + urlOrigin, function (error, file) {
                        console.log(error);
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log('Video file: ' + file);
                            console.log("Video a convertido");
                            uploadToS3(urlOrigin, urlOrigin, function (err, data) {
                                if (err) {
                                    console.error(err);
                                }
                                console.error("File uploaded to S3: ");
                                console.error(urlOrigin);
                                //actualizar url y todfo lotro
                                actualizarUrlMaster(message, config.pathVideo.pathRenderS3 + urlOrigin).then(() => {
                                    EmailController.sendEmail(emailUser, config.pathVideo.pathRender + urlOrigin);
                                }, (err) => {
                                    res.status(500).json(err);
                                });

                            });
                        }
                    });
            }, function (err) {
                console.log('Error: ' + err);
            });
        } catch (e) {
            revertirNotify(message);
            console.log(e.code);
            console.log(e.msg);
        }
    }

};

/**
 * funcion que actualiza el registro en mongo para agregar la url master-
 *  queda asi -> url_master show_home = 1 and state_id = 0 and notify = 1
 * @param {Object} message datos del objeto tomado de la cola sqs
 * @param {String} urlOrigin url que quedara en el campo url_master
 * @return Promise
 */
function actualizarUrlMaster(message, urlOrigin) {
    return new Promise((resolve, reject) => {
        Modelo.find({"administrador.competition.usuario.video.id": message.id}, function (err, datos) {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                //url_master is null and show_home = 0 and state_id = 1 and notify = 0
                let tam = datos[0].administrador.competition;
                let email = "";
                for (var i = 0; i < tam.length; i++) {
                    for (var j = 0; j < datos[0].administrador.competition[i].usuario.length; j++) {
                        for (var k = 0; k < datos[0].administrador.competition[i].usuario[j].video.length; k++) {
                            if (datos[0].administrador.competition[i].usuario[j].video[k].id === message.id)
                            {
                                console.log("si entro al if del update");
                                console.log(urlOrigin);
                                datos[0].administrador.competition[i].usuario[j].video[k].url_master = urlOrigin;
                                datos[0].administrador.competition[i].usuario[j].video[k].show_home = 1;
                                datos[0].administrador.competition[i].usuario[j].video[k].state_id = 0;
                                datos[0].administrador.competition[i].usuario[j].video[k].notify = 1;

                                
                            } else  {
                                console.log("no entro al if del update");
                                }
                        }
                    }

                }
                Modelo.update({"_id": datos[0]._id}, datos[0], function (err, datos) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(datos);
                    }
                });
            }
        });
    })
}

function uploadToS3(urlOrigin, destFileName, callback) {
    s3
        .upload({
            ACL: 'public-read',
            Body: fs.createReadStream(config.pathVideo.pathLogicConvert + urlOrigin),
            Key: destFileName.toString(),
            ContentType: 'application/octet-stream' // force download if it's accessed as a top location
        })
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#httpUploadProgress-event
        .on('httpUploadProgress', function (evt) {
            console.log(evt);
        })
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#send-property
        .send(callback);
}