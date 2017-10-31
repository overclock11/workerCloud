var config = require('../config');

var mysql = require('mysql'),
//creamos la conexion a nuestra base de datos con los datos de acceso de cada uno
connection = mysql.createConnection(config.databases);

//creamos un objeto para ir almacenando todo lo que necesitemos
var VideoModel = {};

//obtenemos todos los videos
VideoModel.getVideoByCompetition = function(id,callback){
  console.log(id);
    if (connection)
    {
        var sql = 'SELECT * FROM video WHERE url_master is not null and show_home = 1 and state_id = 1 and notify = 1  and active=0 and competition_id='+connection.escape(id.id);+' order by createdAt desc;';
        connection.query(sql, function(error, row)
        {
            if(error)
            {
                callback(error, result);
            }
            else
            {
                callback(null, row);
            }
        });
    }
}
VideoModel.getVideoByCompetitionAdmin = function(id,callback){
  console.log(id);
    if (connection)
    {
        var sql = 'SELECT * FROM video WHERE competition_id='+connection.escape(id.id);+' order by createdAt desc;';
        connection.query(sql, function(error, row)
        {
            if(error)
            {
                callback(error, result);
            }
            else
            {
                callback(null, row);
            }
        });
    }
}
VideoModel.getVideoById = function(id,callback){
  console.log(id);
    if (connection)
    {
      var sql ="select v.name as nombreVideo,v.url_master as urlVideoConvertido,v.url as urlVideoOriginal,"+
                "v.id as idVideo, v.active as videoActivo, v.show_home as videoShowHome, v.createdAt as videoCreado,"+
                "v.description as videoDescripcion,"+
                "u.username as usuarioNombre, u.surname as usuarioApellido, u.email usuarioEmail, u.id as usuarioId"+
                " from video as v "+
                "join user as u "+
                "on(v.user_id=u.id) where v.id="+ connection.escape(id.id);
        connection.query(sql, function(error, row)
        {
            if(error)
            {
                callback(error, null);
            }
            else
            {
                callback(null, row);
            }
        });
    }
}
VideoModel.desactivarVideo = function(id,callback){
  console.log(id);
    if (connection)
    {
      var sql ="update video set active=1, show_home = 1 where id="+ connection.escape(id.id);
      console.log(sql);
        connection.query(sql, function(error, row)
        {
            if(error)
            {
                callback(error, null);
            }
            else
            {
                callback(null, row);
            }
        });
    }
}

VideoModel.insertVideo = function(videoData,callback){
    if (connection)
    {
      connection.query('INSERT INTO video SET ?', videoData, function(error, result) {
        if(error)
        {
            callback(error, null);
        }
        else
        {
            callback(null, result);
        }
      });
    }
}

//exportamos el objeto para tenerlo disponible en la zona de rutas
module.exports = VideoModel;
