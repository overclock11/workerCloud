var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var modelo = new Schema(
    {
        administrador:{
           username: { type: String },
           name: { type: String },
           surname: { type: String },
           email: { type: String },
           password : { type: String },
           manager: { type: Number },
           active: { type: Number },
           id: { type: String },
           createdAt: { type: Date, default: Date.now },
           updatedAt: { type: Date, default: Date.now },
           competition:[
               {
                   name: { type: String },
                   company: { type: String },
                   url: { type: String },
                   image: { type: String },
                   description: { type: String },
                   active: { type: Number },
                   id: { type: String },
                   createdAt: { type: Date ,default: Date.now  },
                   updatedAt: { type: Date ,default: Date.now  },
                   url_image_banner: { type: String },
                   date_start: { type: Date },
                   date_end: { type: Date },
                   show_home: { type: Number },
                   usuario:[
                       {
                           username: { type: String },
                           name: { type: String },
                           surname: { type: String },
                           email: { type: String },
                           manager: { type: Number },
                           active: { type: Number },
                           id: { type: String },
                           createdAt: { type: Date, default: Date.now },
                           updatedAt: { type: Date, default: Date.now },
                           video:[
                               {
                                   name: { type: String },
                                   url: { type: String },
                                   description: { type: String },
                                   notify: { type: Number },
                                   active: { type: Number },
                                   id: { type: String },
                                   createdAt: { type: Date, default: Date.now },
                                   updatedAt: { type: Date, default: Date.now },
                                   url_master: { type: String },
                                   show_home: { type: Number },
                                   state_id: { type: Number }
                               }
                           ]                        
                       }
                   ]
               }
           ]
       }
    }
);
module.exports = mongoose.model('Modelo', modelo);