//Librerias
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const multer = require('multer');
const fs = require('fs');
const mysql = require('mysql');
const cors = require('cors');
//Obtenemos los variables globales para no ponerlos en codigo
require('dotenv').config();
//Archivo donde hacemos las peticiones a la DB
const { read, readEspesifica, addCarrito, ElementsToCar, readCarrito, deleteItem, getEstado, getMunicipio, getDatosGenerales, getNameEstado, getNameMunicipio, saveUbicacion, getCompras, Loguear, SaveDetailsUser, RegistrarUsuario, addGustos, ElementsToGustos, GetElementsGustos, deleteItemGustos, GetProducto, getMyProducts, updateProducto, updateProductos, updatePro, InsertarProducto } = require("./options")
const { GeneratePDF, GeneratePDFArticulos } = require("./PDF");
const { mailNode } = require("./mail");
//Politicas cross
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
//Verificamos la conectividad
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
})

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos')
})
//preparamos el pool donde van a caer todas las consultas
const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
})
///Verificamos si el servidor esta funcionando
app.get('/', (req, res) => {
    res.send("Levantando un servidor")
});
//Url de la busqueda sin esqpecificaciones
app.get('/read', (req, res) => {
    read(pool, (result) => {
        res.json(result)
    })
})
//Url de la busqueda con espcificaciones
app.post('/PruebasBusqueda', (req, res) => {
    readEspesifica(pool, req.body, (result) => {
        res.json(result)
    })

})
//Url para actualizar el carrito
app.post('/carrito', (req, res) => {
    addCarrito(pool, req.body, (result) => {
        res.json(result)
    })
})
//Url para obtener cuantos articulos se encuentran en el carrito de compras
app.post('/GetNumCarrito', (req, res) => {
    ElementsToCar(pool, req.body, (result) => {
        res.json(result)
    })
})
//Url para obtener cuantos articulos se encuentran en los gustos
app.post('/GetNumGustos', (req, res) => {
    ElementsToGustos(pool, req.body, (result) => {
        res.json(result)
    })
})
//Url para obtener los elementos del carrito
app.post('/readCarrito', (req, res) => {
    readCarrito(pool, req.body, (result) => {
        res.json(result)
    })
})
//Url para eliminar el item que el usuario ya no quiere en su carrito
app.post('/deleteItem', (req, res) => {
    deleteItem(pool, req.body, (result) => {
        res.json(result)
    })
})
//Url para obtener la lista de los estados
app.get('/getEstado', (req, res) => {
    getEstado(pool, (result) => {
        res.json(result)
    })
})
//Url para obtener la lista de los municipios por estado
app.post('/getMunicipio', (req, res) => {
    getMunicipio(pool, req.body, (result) => {
        res.json(result)
    })
})
//Url para obtener los datos generales
app.post('/getDatosGenerales', (req, res) => {
    getDatosGenerales(pool, req.body, (result) => {
        res.json(result)
    })
})
//Url para obtener el nombre del estado seleccionado
app.post('/getNameEstado', (req, res) => {
    getNameEstado(pool, req.body, (result) => {
        res.json(result);
    })
})
//Url para obtener el nombre del municipio seleccionado
app.post('/getNameMunicipio', (req, res) => {
    getNameMunicipio(pool, req.body, (result) => {
        res.json(result);
    })
})
//Url para guardar la ubicacion del cliente
app.post('/saveUbicacion', (req, res) => {
    saveUbicacion(pool, req.body, (result) => {
        res.json(result);
    })
})
//Url para obtener el historico de compras
app.post('/getCompras', (req, res) => {
    getCompras(pool, req.body, (result) => {
        res.json(result);
    })
})
//Url para login
app.post('/Login', (req, res) => {
    Loguear(pool, req.body, (result) => {
        res.json(result);
    })
})
//Guardar detalles del usuario 
app.post('/SaveDetailsUser', (req, res) => {
    SaveDetailsUser(pool, req.body, (result) => {
        res.json(result);
    })
})
//Registrar un nuevo usuario
app.post('/Registrar', (req, res) => {
    RegistrarUsuario(pool, req.body, (result) => {
        res.json(result);
    })
})
//Url para actualizar los gustos
app.post('/gustos', (req, res) => {
    addGustos(pool, req.body, (result) => {
        res.json(result)
    })
})
//Url para obtener los elementos en la tabla de gustos
app.post('/GetElementsGustos', (req, res) => {
    GetElementsGustos(pool, req.body, (result) => {
        res.json(result);
    })
})
//Url para eliminar el item que el usuario ya no quiere en su guardados
app.post('/deleteItemGustos', (req, res) => {
    deleteItemGustos(pool, req.body, (result) => {
        res.json(result)
    })
})
//OBTENEMOS LOS DATOS DEL PRODUCTO
app.post('/GetProducto', (req, res) => {
    GetProducto(pool, req.body, (result) => {
        res.json(result)
    })
})
//GENERATE PDF
app.post('/GeneratePDF', (req, res) => {
    GeneratePDF(pool, req.body, (result) => {
        res.json(result)
    })
})
//GENERATE PDF CAR
app.post('/GeneratePDFArticulos', (req, res) => {
    GeneratePDFArticulos(pool, req.body, (result) => {
        res.json(result)
    })
})
//GENERATE MAIL
app.post('/mailNode', (req, res) => {
    mailNode(pool, req.body, (result) => {
        res.json(result)
    })
})
//GET ALL PRODUCTS OF PROVEEDOR
app.post('/getMyProducts', (req, res) => {
    getMyProducts(pool, req.body, (result) => {
        res.json(result)
    })
})
// ACTUALIZAR PRODUCTO INDIVIDUAL
app.post('/updateProducto', (req, res) => {
    updateProducto(pool, req.body, (result) => {
        res.json(result)
    })
})
// ACTUALIZAR PRODUCTOS GLOBAL
app.post('/updateProductos', (req, res) => {
    updateProductos(pool, req.body, (result) => {
        res.json(result)
    })
})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
});
const upload = multer({ storage: storage });

app.post('/updatePro', upload.single('file'), (req, res) => {
    const filePath = req.file.filename;
    res.send({ filePath: filePath });
});

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
    }
});
const upload2 = multer({ storage: storage2 });

app.post('/Images', upload2.single('file'), (req, res) => {
    const filePath = req.file.filename;
    res.send({ filePath: filePath });
});


//DESCARGAR PDF
app.post('/download', function (req, res) {
    let enlace = req.body?.pdf;
    if (enlace !== undefined) {
        const filePath = `./uploads/${enlace}`;
        const fileName = 'archivo.pdf';

        fs.readFile(filePath, function (err, data) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al leer el archivo');
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);

            return res.send(data);
        });
    }
});

//DESCARGAR PDF COTIZACION
app.post('/CotizacionUnitaria', function (req, res) {
    let enlace = req.body?.pdf;
    console.log(enlace)
    if (enlace !== undefined) {
        const filePath = `./CotizacionesUnitarias/${enlace}`;
        const fileName = 'archivo.pdf';

        fs.readFile(filePath, function (err, data) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al leer el archivo');
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);

            return res.send(data);
        });
    }
});
app.post('/InsertarProducto', (req, res) => {
    InsertarProducto(pool, req.body, (result) => {
        res.json(result)
    })
})
//Levantamos el servidor en el puesto que necesitemos
app.listen(3020, () => {
    console.log("servidor en puerto 3020");
})