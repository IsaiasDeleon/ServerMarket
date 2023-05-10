const mysql = require('mysql');
const pdf = require('html-pdf');

function GeneratePDF(pool, data, callback) {
    const idProducto = data.idProduct;
    const idUser = data.idUser;
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT  articulos.img, articulos.descripcion,articulos.monto, articulos.Oferta, articulos.montoOferta, usuarios.Nombre, usuarios.Correo, datosgenerales.telefono, datosgenerales.estado, datosgenerales.municipio, estados.estado as nameEsta, municipios.municipio as nameMuni, datosgenerales.Direccion, datosgenerales.CP FROM articulos, usuarios, datosgenerales, estados, municipios where articulos.id = ${idProducto} and usuarios.id = ${idUser} and datosgenerales.idusuario = 1 and estados.id = datosgenerales.estado and municipios.id = datosgenerales.municipio`, function (err, result) {
            if (err) throw err;
            const today = new Date();
            const day = today.getDate();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            let mes = "";
            switch (month) {
                case 1:
                    mes = "enero";
                    break;
                case 2:
                    mes = "febrero";
                    break;
                case 3:
                    mes = "marzo";
                    break;
                case 4:
                    mes = "abril";
                    break;
                case 5:
                    mes = "mayo";
                    break;
                case 6:
                    mes = "junio";
                    break;
                case 7:
                    mes = "julio";
                    break;
                case 8:
                    mes = "agosto";
                    break;
                case 9:
                    mes = "septiembre";
                    break;
                case 10:
                    mes = "octubre";
                    break;
                case 11:
                    mes = "noviembre";
                    break;
                case 12:
                    mes = "diciembre";
                    break;
            }
            let Fecha = day + " de " + mes + " de " + year;
            let html = `<html>
        <style>
            html, body {
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            }
            p{
                margin:2px
            }
            .contendorDatos{
                margin:20px 40px;
            }
            .ImgCard2 {
                width:120px;
                filter: drop-shadow(2px 5px 2px rgba(68, 68, 68, .8))
                }

        </style>
        <body>
        <table>
                <tr>
                    <td style="width:80%">
                        <img src="https://badgerautomation.com/wp-content/uploads/2019/02/logo-retina-badger-1.png" alt="IMGCompra" style="margin:20px 40px; width:220px" />
                    </td>
                    <td>
                        <p> ${Fecha} </p>
                    </td>
                </tr>
            </table>
            
            <table>
                <tr style="">
                    <td style="width:50%; ">
                        <div style="margin:20px 15px 20px 40px">
                            <h3 style="color: rgb(241, 196, 15)">Provedor:</h3>
                            <b>Badger Automation.</b>
                            <p>ARENAL #6, Int: 15, Industrial Mexicana, 78309 San Luis, S.L.P.</p>
                            <p>Tel: +52 444 459 9207.</p>
                            <p>E-mail:<a href="contact@badgerautomation.com"> contact@badgerautomation.com</a></p>
                            <p>Página: <a href="badgerautomation.com">badgerautomation.com</a></p>
                        </div>
                    </td>
                    <td style="width:50%; ">
                        <div style="margin:20px 40px 15px 20px">
                            <h3 style="color: rgb(41, 128, 185)" >Cliente:</h3>
                            <b>${result[0].Nombre}</b>
                            <p>${result[0].Direccion}, 
                            ${result[0].nameMuni}, ${result[0].nameEsta}, México C.P. ${result[0].CP}.</p>
                            <p>Tel: +52 ${result[0].telefono}.</p>
                            <p>E-mail:<a href="${result[0].Correo}"> ${result[0].Correo}</a></p>
                        </div>
                    </td>
                </tr>
            </table>
            <div class="contendorDatos">
                <h5>Cotización por producto unitario</h5>
                <table style="border:1px solid #000; text-align: center;">
                    <tr style="border:1px solid #000; margin:0">
                        <td style="border:1px solid #000; margin:0">IMG</td>
                        <td style="border:1px solid #000; margin:0">Cant.</td>
                        <td style="border:1px solid #000; margin:0">P.Unitario</td>
                        <td style="border:1px solid #000; margin:0">Concepto</td>
                        <td style="border:1px solid #000; margin:0">Subtotal</td>
                    </tr>
                    <tr style="border:1px solid #000; margin:0">
                        <td style="border:1px solid #000; margin:0"> <img src="https://isc.isaiasdeleon.robo-tics-slp.net/resources/Art${result[0].img}.png" class="ImgCard2"/> </td>
                        <td style="border:1px solid #000; margin:0">1</td>
                        <td style="border:1px solid #000; margin:0">$${result[0].Oferta == 1? result[0].montoOferta :result[0].monto} MXN</td>
                        <td style="border:1px solid #000; margin:0; width:60%">${result[0].descripcion}</td>
                        `;
                        if(result[0].Oferta == 1){
                            html += `<td style="border:1px solid #000; margin:0; width:20%">$${result[0].montoOferta} MXN</td>`
                        }else{
                            html += `<td style="border:1px solid #000; margin:0; width:20%">$${result[0].monto} MXN</td>`
                        }
                        html += `
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; margin:0; text-align: right;" colspan="4">Subtotal (MXN)  </td>
                        <td style="border:1px solid #000; margin:0">$${result[0].Oferta == 1 ? result[0].montoOferta : result[0].monto} MXN</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; margin:0; text-align: right;" colspan="4">IVA (MXN)  </td>
                        <td style="border:1px solid #000; margin:0">$${result[0].Oferta == 1 ? (result[0].montoOferta / 100) * 16 : (result[0].monto / 100) * 16} MXN</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; margin:0; text-align: right;" colspan="4">Total (MXN)  </td>
                        <td style="border:1px solid #000; margin:0">$${result[0].Oferta == 1 ? ((result[0].montoOferta / 100) * 16) + result[0].montoOferta :((result[0].monto / 100) * 16) + result[0].monto} MXN</td>
                    </tr>
                </table>
            </div>
            <p style="position:absolute; bottom:10px; text-align:center; width:100%"><b>Badger automation</b> <br/>
            Calzada Robledo Industrial 460, Col. Huertas del Colorado, Mexicali, BC 21384, MX    <br/>
            <a href="contact@badgerautomation.com">contact@badgerautomation.com</a>  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <a href="badgerautomation.com">badgerautomation.com</a></p>
        </body>
        </html>`;
            const options = { format: 'Letter' };
            const uniquePDF = Date.now() + '-' + Math.round(Math.random() * 1e9);
            //../client//Cotizacion.pdf
            pdf.create(html, options).toFile(`./CotizacionesUnitarias/Cotizacion-${uniquePDF}.pdf`, function (err, res) {
                if (err) return callback("ErrorPDF");
                callback(`Cotizacion-${uniquePDF}.pdf`);
            });
        })
    })


}
function GeneratePDFArticulos(pool, data, callback) {
    const idProductos = data.idProduct;
    const cantidades = data.cantidades;
    const idUser= data.idUser;
    console.log(cantidades.toString());
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT  articulos.img, articulos.descripcion,articulos.monto, articulos.montoOferta, articulos.Oferta, usuarios.Nombre, usuarios.Correo, datosgenerales.telefono, datosgenerales.estado, datosgenerales.municipio, estados.estado as nameEsta, municipios.municipio as nameMuni, datosgenerales.Direccion, datosgenerales.CP FROM articulos, usuarios, datosgenerales, estados, municipios where articulos.id in(${idProductos.toString()}) and usuarios.id = ${idUser} and datosgenerales.idusuario = 1 and estados.id = datosgenerales.estado and municipios.id = datosgenerales.municipio`, function (err, result) {
            if (err) throw err;
            const today = new Date();
            const day = today.getDate();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            let mes = "";
            switch (month) {
                case 1:
                    mes = "enero";
                    break;
                case 2:
                    mes = "febrero";
                    break;
                case 3:
                    mes = "marzo";
                    break;
                case 4:
                    mes = "abril";
                    break;
                case 5:
                    mes = "mayo";
                    break;
                case 6:
                    mes = "junio";
                    break;
                case 7:
                    mes = "julio";
                    break;
                case 8:
                    mes = "agosto";
                    break;
                case 9:
                    mes = "septiembre";
                    break;
                case 10:
                    mes = "octubre";
                    break;
                case 11:
                    mes = "noviembre";
                    break;
                case 12:
                    mes = "diciembre";
                    break;
            }
            let Fecha = day + " de " + mes + " de " + year;
            let i = 0, subtotal = 0;
            let html = `<html>
        <style>
            html, body {
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            }
            p,h3{
                margin:2px
            }
            .contendorDatos{
                margin:20px 40px;
            }
            .ImgCard2 {
                width:120px;
                filter: drop-shadow(2px 5px 2px rgba(68, 68, 68, .8))
                }

        </style>
        <body>
        <table>
                <tr>
                    <td style="width:80%">
                        <img src="https://badgerautomation.com/wp-content/uploads/2019/02/logo-retina-badger-1.png" alt="IMGCompra" style="margin:20px 40px; width:220px" />
                    </td>
                    <td>
                        <p> ${Fecha} </p>
                    </td>
                </tr>
            </table>
            
            <table>
                <tr style="">
                    <td style="width:50%; ">
                        <div style="margin:20px 15px 20px 40px">
                            <h3 style="color: rgb(241, 196, 15)">Provedor:</h3>
                            <b>Badger Automation.</b>
                            <p>ARENAL #6, Int: 15, Industrial Mexicana, 78309 San Luis, S.L.P.</p>
                            <p>Tel: +52 444 459 9207.</p>
                            <p>E-mail:<a href="contact@badgerautomation.com"> contact@badgerautomation.com</a></p>
                            <p>Página: <a href="badgerautomation.com">badgerautomation.com</a></p>
                        </div>
                    </td>
                    <td style="width:50%; ">
                        <div style="margin:20px 40px 15px 20px">
                            <h3 style="color: rgb(41, 128, 185)">Cliente:</h3>
                            <b>${result[0].Nombre}</b>
                            <p>${result[0].Direccion}, 
                            ${result[0].nameMuni}, ${result[0].nameEsta}, México C.P. ${result[0].CP}.</p>
                            <p>Tel: +52 ${result[0].telefono}.</p>
                            <p>E-mail:<a href="${result[0].Correo}"> ${result[0].Correo}</a></p>
                        </div>
                    </td>
                </tr>
            </table>
            <div class="contendorDatos">
               
                <table style="border:1px solid #000; text-align: center;">
                    <tr style="border:1px solid #000; margin:0">
                        <td style="border:1px solid #000; margin:0">IMG</td>
                        <td style="border:1px solid #000; margin:0">Cant.</td>
                        <td style="border:1px solid #000; margin:0">P.Unitario</td>
                        <td style="border:1px solid #000; margin:0">Concepto</td>
                        <td style="border:1px solid #000; margin:0">Subtotal</td>
                    </tr>`;
            
            idProductos.forEach(element => {
                html = html + `
                    <tr style="border:1px solid #000; margin:0">
                        <td style="border:1px solid #000; margin:0"> <img src="https://isc.isaiasdeleon.robo-tics-slp.net/resources/Art${result[i].img}.png" class="ImgCard2"/> </td>
                        <td style="border:1px solid #000; margin:0">${cantidades[i]}</td>
                        <td style="border:1px solid #000; margin:0">$${result[i].Oferta == 1 ? result[i].montoOferta : result[i].monto}MXN</td>
                        <td style="border:1px solid #000; margin:0; width:60%">${result[i].descripcion}</td>
                        <td style="border:1px solid #000; margin:0; width:20%">$${result[i].Oferta == 1 ? result[i].montoOferta * cantidades[i] : result[i].monto * cantidades[i]} MXN</td>
                    </tr>`
                    let can = 0;
                    if(result[i].Oferta == 1){
                        can = result[i].montoOferta * cantidades[i];
                    }else{
                        can = result[i].monto * cantidades[i];
                    }
                    
                    subtotal = subtotal + can;
                i++;
            });
            html = html + `
                    
                    <tr>
                        <td style="border:1px solid #000; margin:0; text-align: right;" colspan="4">Subtotal (MXN)  </td>
                        <td style="border:1px solid #000; margin:0">$${subtotal} MXN</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; margin:0; text-align: right;" colspan="4">IVA (MXN)  </td>
                        <td style="border:1px solid #000; margin:0">$${(subtotal / 100) * 16} MXN</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000; margin:0; text-align: right;" colspan="4">Total (MXN)  </td>
                        <td style="border:1px solid #000; margin:0">$${((subtotal / 100) * 16) + subtotal} MXN</td>
                    </tr>
                </table>
            </div>
            <div id="pageFooter">
            <p style=" bottom:10px; text-align:center; width:100%"><b>Badger automation</b> <br/>
            Calzada Robledo Industrial 460, Col. Huertas del Colorado, Mexicali, BC 21384, MX    <br/>
            <a href="contact@badgerautomation.com">contact@badgerautomation.com</a>  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <a href="badgerautomation.com">badgerautomation.com</a></p>
            </div>
           
        </body>
        </html>`;
        const options = { format: 'Letter' };
        const uniquePDF = Date.now() + '-' + Math.round(Math.random() * 1e9);
        //../client//Cotizacion.pdf
        pdf.create(html, options).toFile(`./CotizacionesUnitarias/CotizacionCarrito-${uniquePDF}.pdf`, function (err, res) {
            if (err) return callback("ErrorPDF");
            callback(`CotizacionCarrito-${uniquePDF}.pdf`);
        });
        })
    })
}
//Exportamos las funciones que utilizaremos para la comunicacion con el front 
module.exports = { GeneratePDF, GeneratePDFArticulos }