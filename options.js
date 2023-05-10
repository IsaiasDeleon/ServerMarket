const mysql = require('mysql');
//Primera busqueda sin especificaciones
function read(pool, callback) {
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query("SELECT * FROM articulos", function (err, result) {
            if (err) throw err;
            callback(result);
            connection.release();
        })
    })
}
//Busqueda especifica
function readEspesifica(pool, data, callback) {
    let con = "";
    let articulos = "";
    let array = [];
    let Oferta = "";
    let Estado = "";
    if (data.Bad) {
        con = ` AND empresa = 'Badger'`;
    }
    if (data.Apl) {
        con = con + ` AND empresa = 'Aplintec'`;
    }
    if (data.Bad && data.Apl) {
        con = ` AND empresa in ('Badger','Aplintec')`;
    }
    if (data.Celular) {
        array.push("'Celular'");
    }
    if (data.Pantallas) {
        array.push("'Pantallas'");
    }
    if (data.Calzado) {
        array.push("'Calzado'");
    }
    if (data.Muebles) {
        array.push("'Muebles'");
    }
    if (data.Otros) {
        array.push("'Otros'")
    }

    if (array.length > 0) {
        articulos = array.toString();
        articulos = ` AND Categoria in (${articulos})`;
    }
    if(data.Oferta == 1){
        Oferta = `AND Oferta = 1`;
    }
    if(data.Estado == 1 || data.Estado == 2){
        Estado = `AND Estado = ${data.Estado}`;
    }
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`select * from articulos where Estatus = 1 ${con} ${articulos} AND monto between ${data.value[0]} and ${data.value[1]} ${Oferta} ${Estado}`, function (err, result) {
            if (err) throw err;
            callback(result);
            connection.release();
        })
    })
}
//Añadimos el articulo al carrito
function addCarrito(pool, data, callback) {
    const data2 = data.Num;
    const idU = data.idU;
    pool.getConnection(function (err, connection) {
        if (err) throw err;

        //Validamos que exista el usuario en el carrito
        connection.query(`SELECT id, count(id) as num, IdArticulos FROM carrito where idUsuario = ${idU}`, function (err, result) {
            // console.log(result[0].num)
            if (err) throw err;
            if (result[0].num == 0) {
                connection.query(`INSERT INTO carrito values(default, ${idU},${data2})`, function (err, result) {
                    if(err) throw err;
                    callback("Agregado");
                })
                
            }
            if (result[0].num == 1) {
                ///Si existe el carrito del usuario validaremos que no este el articulo ya registrado en su carrito
                let articulos = result[0].IdArticulos.split(',');
                let suma = 0;
                //Obtenemos los articulos ya registrados en la DB
                for (let i = 0; i < articulos.length; i++) {
                    //Validamos uno por uno para evr si ya se encuentra en su carrito
                    if (articulos[i] == `${data2}`) {
                        suma++;
                        //Una vez que lo encuentre sumaremos la variable suma para no coorrer el siguinte codigo ademas ponemos un retur para que ya no siga validando 
                        break;
                    }
                }

                if (suma == 0) {
                    //Seguimos utilizando el arreglo ya que es mas facil agregarlo con sus respectivas separaciones
                    articulos.push(`${data2}`);
                    let valuesArticulos = articulos.toString();
                    //Una ves ya teniendo los artivulos haremos una actualizacion en la DB
                    connection.query(`UPDATE carrito SET IdArticulos = '${valuesArticulos}' where id = ${result[0].id}`, function (err, result) {
                        if (err) throw err;
                        callback("Agregado");

                    })
                } else {
                    callback("Existe")
                }


                //INSERT INTO `carrito` (`id`, `idUsuario`, `IdArticulos`) VALUES (NULL, '1', '2');
            }

            connection.release();
        })
    })
}

//Obtenemos el numero de elementos en el carrito
function ElementsToCar(pool, data ,callback) {
    const id = data.id;
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT IdArticulos FROM carrito where idUsuario = ${id} `, function (err, result) {
            if (err) throw err;
            if(result[0]){
                let articulos = result[0]?.IdArticulos.split(',');
                let suma = 0;
                for (let i = 0; i < articulos.length; i++) {
                    //Validamos que sea mayor a 0 ya que si se encuentra vacio aqui lo podremos eliminar
                    if (articulos[i] > 0) {
                        suma++;
                    }
                }
                callback(suma);
                connection.release();
            }
        })
    })
}
//Obtenemos los articulos en el carrito
function readCarrito(pool, data, callback) {
    const id = data.idU;
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`select IdArticulos from carrito where idUsuario = ${id}`, function (err, result) {
            if (err) throw err;
            let articulos = result[0].IdArticulos.split(',');
            let newArr = [];

            for (let i = 0; i < articulos.length; i++) {
                //Validamos que sea mayor a 0 ya que si se encuentra vacio aqui lo podremos eliminar
                if (articulos[i] > 0) {

                    newArr.push(`${articulos[i]}`);
                }
            }

            if (newArr.length > 0) {

                let valuesArticulos = newArr.toString();
                connection.query(`Select * from articulos where id in (${valuesArticulos})`, function (err, result) {
                    if (err) throw err;
                    callback(result);
                    connection.release();
                })
            }

        })
    })
}
//Eliminamos el articulo seleccionado del carrtio
function deleteItem(pool, data, callback) {
    const iden = data.id;
    const idU = data.idU;
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`select IdArticulos From carrito where idUsuario = ${idU}`, function (err, result) {
            if (err) throw err;
            let articulos = result[0].IdArticulos.split(',');
            articulos = articulos.filter((item) => item !== `${iden}`)
            let newArr = [];
            for (let i = 0; i < articulos.length; i++) {
                //Validamos que sea mayor a 0 ya que si se encuentra vacio aqui lo podremos eliminar
                if (articulos[i] > 0) {
                    newArr.push(`${articulos[i]}`);
                }
            }

            if (newArr.length > 0) {
                // el update va aqui
                let valuesArticulos = newArr.toString();
                //Una ves ya teniendo los artivulos haremos una actualizacion en la DB
                connection.query(`UPDATE carrito SET IdArticulos = '${valuesArticulos}' where idUsuario = ${idU}`, function (err, result) {
                    if (err) throw err;
                    callback("Eliminado")
                })
            }

            connection.release();
        })
    })
}
//Funcion para obtener la lista de estados del pais
function getEstado(pool, callback){
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query("SELECT * FROM estados", function (err, result) {
            if (err) throw err;
            callback(result);
            connection.release();
        })
    })
}
//Funcion para obtener la lista de los muncipios del estado selecionado
function getMunicipio(pool, data, callback){
    const idEstado = data.Estado;
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`select * from municipios where id in (SELECT municipios_id FROM estados_municipios where estados_id = ${idEstado})`,function (err, result){
            if(err) throw err;
            callback(result);
            connection.release();
        })
        
    })
}
//Funcion para obtnerlo los datos generales del usuario logueado
function getDatosGenerales(pool, data, callback){
    const idUsuario = data.IdUsuario;
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`select dg.telefono, dg.pais, dg.estado, dg.municipio, dg.Direccion, dg.CP, dg.latitude, dg.longitude, u.Nombre, u.Correo, u.Password, u.img from datosgenerales dg, usuarios u where u.id = ${idUsuario} and dg.idusuario = ${idUsuario}`, function (err, result){
            if(err) throw err;
            callback(result);
            connection.release();
        })
    })
}
//Funcion para obtener el nombre del estado selecionado
function getNameEstado(pool, data, callback){
    const idEstado = data.idEstado;
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`select estado from estados where id = ${idEstado}`,function (err, result) {
            if(err) throw err;
            callback(result);
            connection.release();
        })
    })
}
//Funcion para obtner el nombre del municipio selecionado
function getNameMunicipio(pool, data, callback){
    const idMunicipio = data.idMunicipio;
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`select municipio from municipios where id = ${idMunicipio}`, function (err, result) {
            if(err) throw err;
            callback(result);
            connection.release();
        })
    })
}
function saveUbicacion(pool, data, callback){
    const latitude = data.latitude;
    const longitude = data.longitude;
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`UPDATE datosgenerales set latitude = '${latitude}', longitude = '${longitude}' where idusuario = 1`, function (err, result) {
            if(err) throw err;
            callback("Guardada");
            connection.release();
        })
    })
}
function getCompras(pool, data, callback){
    const idUsuario = data.idUsuario;
    let arrayCompras = [];
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`SELECT idArticulo, fechaCompra from compras where idUsuario = ${idUsuario}`, function (err, result) {
            if(err) throw err;          
            if(result[0] != undefined){
               for(let i = 0; i < result.length; i++){
                let idA = result[i].idArticulo;
                    connection.query(`SELECT nombre from articulos where id = ${idA}`, function (err, resultado) {
                        if(err) throw err;
                        arrayCompras.push({
                            "Name":resultado[0].nombre,
                            "Fecha":result[i].fechaCompra
                        })
                       let res = result.length - 1;
                       if(i == res){
                        callback(arrayCompras);
                        connection.release();
                       } 
                    })
               }
               
               
            }else{
                callback("0Elements");
                connection.release();
            }
           
        })
    })
}
function Loguear(pool, data, callback){
    const correo = data.user;
    const pass = data.pass;
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`SELECT id, Nombre, img, tipoUser from usuarios where Correo = '${correo}' and Password = '${pass}'`, function (err, result) {
            if(err) throw err;
            callback(result);
            connection.release();
        })
    })
}
function SaveDetailsUser(pool, data, callback){
    const idU = data.idU;
    const nombre = data.Nombre;
    const telefono = data.Telefono;
    const password = data.Password;
    const direccion = data.Direccion;
    const CP = data.CP;
    const estado = data.Estado;
    const municipio = data.Municipio;
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`UPDATE usuarios set Nombre = '${nombre}', Password = '${password}' where id = ${idU}`, function (err, result) {
            if(err) throw err;
            connection.query(`UPDATE datosgenerales set telefono = '${telefono}', Direccion = '${direccion}', CP = '${CP}', estado = '${estado}', municipio = '${municipio}' where idusuario = ${idU}`, function (err, result) {
                if(err) throw err;
                callback("Actualizado");
                connection.release();
            })
        })
    })
}
function RegistrarUsuario(pool, data, callback){
    const nombre = data.nombre;
    const correo = data.correo;
    const pass = data.pass;
    pool.getConnection(function (err, connection){
        if(err) throw err;
        connection.query(`insert into usuarios values (default,'${nombre}','${correo}','${pass}', null, default)`, function (err, result) {
            if(err) throw err;
            connection.query(`insert into datosgenerales values(default, ${result.insertId},null,null,null,null,null,null,null,null)`,function (err, result) {
                if(err) throw err;
                callback("RegistroUsuario");
                connection.release();
            })
        })
    })

}

//Añadimos el articulo al carrito
function addGustos(pool, data, callback) {
    const Nume = data.Num;
    const idU = data.idU;
    pool.getConnection(function (err, connection) {
        if (err) throw err;

        //Validamos que exista el usuario en el carrito
        connection.query(`SELECT id, count(id) as num, IdArticulos FROM gustosarticulos where idUsuario = ${idU}`, function (err, result) {
            // console.log(result[0].num)
            if (err) throw err;
            if (result[0].num == 0) {
                connection.query(`INSERT INTO gustosarticulos values(default, ${idU},${Nume})`, function (err, result) {
                    if(err) throw err;
                    callback("AgregadoGustos");
                })
                
            }
            if (result[0].num == 1) {
                ///Si existe el carrito del usuario validaremos que no este el articulo ya registrado en su carrito
                let articulos = result[0].IdArticulos.split(',');
                let suma = 0;
                //Obtenemos los articulos ya registrados en la DB
                for (let i = 0; i < articulos.length; i++) {
                    //Validamos uno por uno para evr si ya se encuentra en su carrito
                    if (articulos[i] == `${Nume}`) {
                        suma++;
                        //Una vez que lo encuentre sumaremos la variable suma para no coorrer el siguinte codigo ademas ponemos un retur para que ya no siga validando 
                        break;
                    }
                }

                if (suma == 0) {
                    //Seguimos utilizando el arreglo ya que es mas facil agregarlo con sus respectivas separaciones
                    articulos.push(`${Nume}`);
                    let valuesArticulos = articulos.toString();
                    //Una ves ya teniendo los artivulos haremos una actualizacion en la DB
                    connection.query(`UPDATE gustosarticulos SET IdArticulos = '${valuesArticulos}' where id = ${result[0].id}`, function (err, result) {
                        if (err) throw err;
                        callback("AgregadoGustos");

                    })
                } else {
                    callback("ExisteGustos")
                }
            }

            connection.release();
        })
    })
}

//Obtenemos el numero de elementos en el carrito
function ElementsToGustos(pool, data ,callback) {
    const id = data.id;
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT IdArticulos FROM gustosarticulos where idUsuario = ${id} `, function (err, result) {
            if (err) throw err;
            if(result[0]){
                let articulos = result[0]?.IdArticulos.split(',');
                let suma = 0;
                for (let i = 0; i < articulos.length; i++) {
                    //Validamos que sea mayor a 0 ya que si se encuentra vacio aqui lo podremos eliminar
                    if (articulos[i] > 0) {
                        suma++;
                    }
                }
                callback(suma);
                connection.release();
            }
        })
    })
}
//Obtenemos los articulos en el carrito
function GetElementsGustos(pool, data, callback) {
    const id = data.id;
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`select IdArticulos from gustosarticulos where idUsuario = ${id}`, function (err, result) {
            if (err) throw err;
            if(result[0]){
                let articulos = result[0]?.IdArticulos.split(',');
                let newArr = [];
    
                for (let i = 0; i < articulos.length; i++) {
                    //Validamos que sea mayor a 0 ya que si se encuentra vacio aqui lo podremos eliminar
                    if (articulos[i] > 0) {
    
                        newArr.push(`${articulos[i]}`);
                    }
                }
    
                if (newArr.length > 0) {
    
                    let valuesArticulos = newArr.toString();
                    connection.query(`Select * from articulos where id in (${valuesArticulos})`, function (err, result) {
                        if (err) throw err;
                        callback(result);
                        connection.release();
                    })
                }
            }
           

        })
    })
}
function deleteItemGustos(pool, data, callback){
    const iden = data.id;
    const idU = data.idU;
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`select IdArticulos From gustosarticulos where idUsuario = ${idU}`, function (err, result) {
            if (err) throw err;
            let articulos = result[0].IdArticulos.split(',');
            articulos = articulos.filter((item) => item !== `${iden}`)
            let newArr = [];
            for (let i = 0; i < articulos.length; i++) {
                //Validamos que sea mayor a 0 ya que si se encuentra vacio aqui lo podremos eliminar
                if (articulos[i] > 0) {
                    newArr.push(`${articulos[i]}`);
                }
            }

            if (newArr.length > 0) {
                // el update va aqui
                let valuesArticulos = newArr.toString();
                //Una ves ya teniendo los artivulos haremos una actualizacion en la DB
                connection.query(`UPDATE gustosarticulos SET IdArticulos = '${valuesArticulos}' where idUsuario = ${idU}`, function (err, result) {
                    if (err) throw err;
                    callback("EliminadoGusto")
                })
            }

            connection.release();
        })
    })
}
function GetProducto(pool, data, callback){
    const idProducto = data.idProduct;
    pool.getConnection(function (err, connection) {
        if(err) throw err;
        connection.query(`SELECT * from articulos where id = ${idProducto}`, function (err, result) {
            if(err) throw err;
            callback(result);
        })
    })
}
function getMyProducts(pool, data, callback){
    const idProv = data.idProv;
    let prove = "Badger";
    if(idProv == 12){
        prove = "Badger";
    }
    pool.getConnection(function (err, connection) {
        if(err) throw err;
        connection.query(`SELECT * FROM articulos where empresa = "${prove}"`, function (err, result) {
            if(err) throw err;
            callback(result);
        })
    })
}
function updateProducto(pool, data, callback){
    //Tenemos que separar los datos para poder insertar en la tabla
    const Categoria = data.Categoria;
    const Estado = data.Estado;
    const Estatus = data.Estatus;
    const Oferta = data.Oferta;
    const Stock = data.Stock;
    const descripcion = data.descripcion;
    const estrellas = data.estrellas;
    const id = data.id;
    const img = data.img;
    const monto = data.monto;
    const montoOferta = data.montoOferta;
    const nombre = data.nombre;
    const marca = data.marca;
    const codigo = data.codigo;
    const peso = data.peso;
    const tiempoEn = data.TiempoEn;
    const tiempoEnAg = data.TiempoEnAg;
    const pdf = data.PDF;

    pool.getConnection(function (err, connection) {
        if(err) throw err;
        connection.query(`UPDATE articulos set nombre = '${nombre}', descripcion = '${descripcion}', monto = ${monto}, montoOferta = ${montoOferta}, Categoria = '${Categoria}', Stock = ${Stock}, Estado = '${Estado}', Oferta = ${Oferta}, Marca = '${marca}', CodigoProveedor = '${codigo}', Peso = '${peso}',TempodeEntrega = '${tiempoEn}',TempoDdeEntregaAgotado = '${tiempoEnAg}', PDF = '${pdf}'  where id = ${id}`, function (err, result) {
            if(err) throw err;
            callback("Actualizado")
        })
    })
}
function updateProductos(pool, data, callback){
    pool.getConnection(function (err, connection) {
        if(err) throw err;
        let Elementos = data.length;
        let suma = 0;
        data.map((element) => {
            let query;
            if(element.PDF ==  1){
                query = `UPDATE articulos set nombre = '${element.Nombre}', descripcion = '${element.Descripcion}', monto = ${element.Precio}, montoOferta = ${element.PrecioOferta}, Categoria = '${element.Categoria}', Stock = ${element.Stock}, Estado = '${element.Estado}', Oferta = ${element.Oferta}, Marca ='${element.Marca}', CodigoProveedor = '${element.CodigoProveedor}', Peso = '${element.Peso}', TempodeEntrega='${element.TempodeEntrega}', TempoDdeEntregaAgotado = '${element.TempoDdeEntregaAgotado}' where id = ${element.id}`
            }else{
                query = `UPDATE articulos set nombre = '${element.Nombre}', descripcion = '${element.Descripcion}', monto = ${element.Precio}, montoOferta = ${element.PrecioOferta}, Categoria = '${element.Categoria}', Stock = ${element.Stock}, Estado = '${element.Estado}', Oferta = ${element.Oferta}, Marca ='${element.Marca}', CodigoProveedor = '${element.CodigoProveedor}', Peso = '${element.Peso}', TempodeEntrega='${element.TempodeEntrega}', TempoDdeEntregaAgotado = '${element.TempoDdeEntregaAgotado}', PDF = '${element.PDF}' where id = ${element.id}`
            }
            connection.query(query, function (err, result) {
                if(err) throw err;
                // console.log(result)
                suma++;
                if(Elementos == suma){
                    callback("ElementosActualizados")
                }
            })
        })
    })
}
function updatePro(pool, data, callback){
    console.log(data)

}
function InsertarProducto(pool, data, callback){
    let img = data.img;
    img = img.toString();

        pool.getConnection(function (err, connection) {
            if(err) throw err;
            connection.query(`insert into articulos values(default, '${img}','Badger','${data.nombre}','${data.descripcion}',${data.estrellas}, ${data.monto}, ${data.montoOferta}, '${data.Categoria}', ${data.Stock},'${data.Estatus}',NOW(),'${data.Estado}',${data.Oferta},'${data.marca}','${data.codigo}','${data.peso}', '${data.TiempoEn}','${data.TiempoEnAg}','${data.PDF}')`, function (err, result) { 
                if(err) throw err;
                console.log(result)
            })
        })
}
//Exportamos las funciones que utilizaremos para la comunicacion con el front 
module.exports = { read, readEspesifica, addCarrito, ElementsToCar, readCarrito, deleteItem, getEstado, getMunicipio, getDatosGenerales, getNameEstado, getNameMunicipio, saveUbicacion, getCompras, Loguear, SaveDetailsUser, RegistrarUsuario, addGustos, ElementsToGustos, GetElementsGustos, deleteItemGustos, GetProducto, getMyProducts, updateProducto, updateProductos, updatePro, InsertarProducto }