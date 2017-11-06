var VideoModel = require('../models/video');
var nodemailer = require('nodemailer');
var config = require('../config');


let api_key = process.env.MAILGUN_API_KEY;
let domain = process.env.MAILGUN_DOMAIN;
let mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});


// email sender function
exports.sendEmail = function(emailUser, url_master){

    var data = {
        from: config.configMailFrom.from,
        to: emailUser,
        subject:config.configMailFrom.subject,
        text: config.configMailFrom.text
    };

    mailgun.messages().send(data, function (error, body) {
        console.log(body);
    });

/*    console.log("va a enviar correo a " + emailUser);
    // Definimos el transporter
        var transporter = nodemailer.createTransport(config.awsSES);
    // Definimos el email
    var mailOptions = {
        from: config.configMailFrom.from ,
        to: emailUser,
        subject: config.configMailFrom.subject,
        text: config.configMailFrom.text
    };

    // Enviamos el email
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
        } else {
            console.log("Email sent");
        }
    });*/
};
