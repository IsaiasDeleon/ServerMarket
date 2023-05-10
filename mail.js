const mysql = require('mysql');
const nodemailer = require('nodemailer');


function mailNode(pool, data, callback){
    const idProducto = data.idProduct;
    const idUsuario = data.idUser;
    const oferta = data.Oferta;
    pool.getConnection(function ( err, connection) {
        if (err) throw err;
        connection.query(`SELECT articulos.img, articulos.descripcion, articulos.monto, articulos.montoOferta, articulos.Oferta, usuarios.Nombre, usuarios.Correo from articulos, usuarios where articulos.id = ${idProducto} and usuarios.id= ${idUsuario}`, function (err, result) {
            if(err) throw err;
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: "isaiasdeleonsalazar@gmail.com",
                    pass: "ffkpwptjzakksjmq"
                }
            });

            const mailOptions = {
                from: 'isaiasdeleonsalazar@gmail.com',
                to: 'deleonsalazaru@gmail.com',
                subject: 'Venta de producto MARKETPLACE',
                html: `
                <html>
                <head>
                    <style>
                        .conetenedor{
                            width: 80%;
                            margin-left:10%;
                            height:60%
                        }
                        h1{
                            width:100%; text-align:center; background:#221e1d; color:#fff
                        }
                        body{
                            background:#000;
                        }
                        .texto{
                            font-weight:400; width:80%; margin-left:10%; color:#000
                        }
                        .tdImagen{
                            width:40%; text-align:right;
                        }
                        .tdTexto{
                            padding-top: 10px;
                            padding-left: 10px;
                            width:57%;
                        }
                        .acomodo{
                            display: flex;
                        }
                        
                        @media (max-width: 1024px) {
                            .conetenedor{
                                width: 100%;
                            }
                            .texto{
                                width:90%;  font-size:18px
                            }
                            .tdImagen{
                                width:100%; text-align:center
                            }
                            .tdTexto{
                                width:100%
                            }
                            .acomodo{
                                display: block;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div style="width:100%;">
                        <div class="conetenedor">
                            <h1 >Market place <b style="color:#F1C40F">B</b><b style="color:#2980B9">A</b></h1>
                            <h2 class="texto"> Buen día proveedor <b>BADGER AUTOMATION</b> tiene una nueva oferta del usuario: <b> ${result[0].Nombre} </b> sobre el producto <b> ${result[0].descripcion} </b> </h2>
                            <div class="acomodo">
                                <div class="tdImagen">
                                    <img src="https://isc.isaiasdeleon.robo-tics-slp.net/resources/Art${result[0].img}.png"style="width:220px;"/>
                                </div>
                                <div class="tdTexto">
                                    <h3>Precio inicial: <b style="color:#2980B9">$${result[0].Oferta == 1 ? result[0].montoOferta : result[0].monto} MXN</b></h3>
                                    <h3>Precio ofertado: <b style="color:#27AE60">$${oferta} MXN </b></h3>
                                    <a style="padding:10px; font-size:18px; margin:5px; background:#212529; color:#fff; border:none; border-radius:5px; text-decoration:none" href="https://badgerautomation.com/"> Aceptar oferta</a>
                                    <a style="padding:10px; font-size:18px; margin:5px; background:#565e64; color:#fff; border:none; border-radius:5px; text-decoration:none"> Hacer contra oferta </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
                `
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    callback("errorCorreo");
                } else {
                    callback('CorreoEnviado');
                }
            });
        })
    })

}
//Exportamos las funciones que utilizaremos para la comunicacion con el front
module.exports = { mailNode }