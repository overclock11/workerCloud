var VideoModel = require('../models/video');
var FfmpegController = require('../controllers/FfmpegController');
var config = require('../config');
var multer = require('multer')
var ip = require("ip");
var cron = require('node-cron');
var ffmpeg = require('ffmpeg');
var aws = require('aws-sdk');
var fs = require('fs');
var mongoose = require('mongoose');
var Modelo = mongoose.model('Modelo');


//aws.config.loadFromPath("../sqsconfig.json");

var receipt = "";

cron.schedule('*/1 * * * *', function () {
    console.log("cron ejecutandose");

    var sqs = new aws.SQS();

    var params = {
        QueueUrl: config.configSqs.url,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20
    };

    sqs.receiveMessage(params, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            if (data.Messages) {
                // Get the first message (should be the only one since we said to only get one above)
                var message = data.Messages[0];
                body = JSON.parse(message.Body);
                // Now this is where you'd do something with this message
                convertVideo(body);  // whatever you wanna do
                // Clean up after yourself... delete this message from the queue, so it's not executed again
                removeFromQueue(message);  // We'll do this in a second
            }
        }
    });
});

var convertVideo = function (message) {
    console.log(message.id);
    Modelo.find({"administrador.competition.usuario.video.id": message.id}, function (err, datos) {
        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else {

            //url_master is null and show_home = 0 and state_id = 1 and notify = 0

            let datosFormateados = [];
            let tam = datos[0].administrador.competition;
            let email="";
            let competitionId = datos[0].administrador.competition[0].id;
            for (var i = 0; i < tam.length; i++) {
                for (var j = 0; j < datos[0].administrador.competition[i].usuario.length; j++) {
                    for (var k = 0; k < datos[0].administrador.competition[i].usuario[j].video.length; k++) {
                        if (datos[0].administrador.competition[i].usuario[j].video[k].id === message.id &&
                            datos[0].administrador.competition[i].usuario[j].video[k].url_master === null &&
                            datos[0].administrador.competition[i].usuario[j].video[k].show_home === 0 &&
                            datos[0].administrador.competition[i].usuario[j].video[k].state_id===1 &&
                            datos[0].administrador.competition[i].usuario[j].video[k].notify===0)
                        {
                            datos[0].administrador.competition[i].usuario[j].video[k].notify=1;
                            email = datos[0].administrador.competition[i].usuario[j].email;
                        }
                    }
                }

            }
            if (email!=="") {
                Modelo.update({"_id":datos[0]._id}, datos[0],function(err,datos){
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        FfmpegController.convertVideoToMp4(message,email);
                    }
                });
            }
        }
    });

};

var removeFromQueue = function (message) {
    var sqs = new aws.SQS();

    var params = {
        QueueUrl: config.configSqs.url,
        ReceiptHandle: message.ReceiptHandle
    };

    sqs.deleteMessage(params, function (err, data) {
        if (err) {
            console.log(err)
        }
        else {
            console.log(data)
        }
    });
};



