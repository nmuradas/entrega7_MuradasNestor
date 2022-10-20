const { json } = require('express');
const express = require('express');
const app = express();
const Contenedor = require('./contenedor')
const contenedor = new Contenedor("productos.json", ["timestamp", "title", "price", "description", "code", "image", "stock"]);
const carrito = new Contenedor("carrito.json", ["timestamp", "products"])


app.use(express.json());
app.use(express.urlencoded({extended:true}));

const authMiddleware = (req, res, next) => {
    if(req.headers.rol == "admin"){
        next()
    }else{
        res.json({"error": "unauthorized"})}
}

const routerProducts = express.Router();
const routerCart = express.Router();

app.use('/api/productos', routerProducts);
app.use('/api/carrito', routerCart);
app.use('*', (req, res) => {
    const id = req.params[0]
    res.status(404).json({"error":"Ruta no implementada", "ruta":id , "metodo": "GET"})});

/* ------------------------ Productos ------------------------ */

routerProducts.get('/', async (req, res) => {
    const products = await contenedor.getAll();
    res.status(200).json(products);
})


routerProducts.get('/:id', async (req, res) => {
    const { id } = req.params;
    const product = await contenedor.getById(id);
    
    product
        ? res.status(200).json(product)
        : res.status(400).json({"error": "Producto no encontrado"})
})


routerProducts.post('/',authMiddleware, async (req,res, next) => {
    const {body} = req;
    
    body.timestamp = Date.now();
    
    const newProductId = await contenedor.save(body);
    
    newProductId
        ? res.status(200).json({"success" : "Se ha agredado el producto con el ID: "+newProductId})
        : res.status(400).json({"error": "Key inválida, compuebe la información"})
})


routerProducts.put('/:id', authMiddleware ,async (req, res, next) => {
    const {id} = req.params;
    const {body} = req;
    const wasUpdated = await contenedor.updateById(id,body);
    
    wasUpdated
        ? res.status(200).json({"success" : "Producto actualizado"})
        : res.status(404).json({"error": "Producto no encontrado"})
})


routerProducts.delete('/:id', authMiddleware, async (req, res, next) => {
    const {id} = req.params;
    const wasDeleted = await contenedor.deleteById(id);
    
    wasDeleted 
        ? res.status(200).json({"success": "Producto exitosamente eliminando"})
        : res.status(404).json({"error": "Producto no encontrado"})
})

/* ------------------------ Carrito ------------------------ */



routerCart.post('/', async(req, res) => {
    const {body} = req;
    
    body.timestamp = Date.now();
    body.products = [];
    const newCartId = await carrito.save(body);
    
    newCartId
        ? res.status(200).json({"success" : "Se ha agregado el carrito con el ID: "+newCartId})
        : res.status(400).json({"error": "Key inválida, compuebe la información"})
    
})


routerCart.delete('/:id', async (req, res) => {
    const {id} = req.params;
    const wasDeleted = await carrito.deleteById(id);
    
    wasDeleted 
        ? res.status(200).json({"success": "Carrito exitosamente eliminado"})
        : res.status(404).json({"error": "Carrito no encontrado"})
})


routerCart.post('/:id/productos', async(req,res) => {
    const {id} = req.params;
    const { body } = req;
    
    const product = await contenedor.getById(body['id']);
    
    if (product) {
        const cartExist = await carrito.addToArrayById(id, {"products": product});
        cartExist
            ? res.status(200).json({"success" : "Producto añadido"})
            : res.status(404).json({"error": "Carrito no encontrado"})
    } else {
        res.status(404).json({"error": "Producto no encontrado, verifique el ID."})
    }
})


routerCart.get('/:id/productos', async(req, res) => {
    const { id } = req.params;
    const cart = await carrito.getById(id)
    
    cart
        ? res.status(200).json(cart.products)
        : res.status(404).json({"error": "Carrito no enontrado"})
})


routerCart.delete('/:id/productos/:id_prod', async(req, res) => {
    const {id, id_prod } = req.params;
    const productExists = await carrito.getById(id);
    if (productExists) {
        const cartExists = await carrito.removeFromArrayById(id, id_prod, 'products')
        cartExists
            ? res.status(200).json({"success" : "Producto eliminado"})
            : res.status(404).json({"error": "Producto no encontrado"})
    } else {
        res.status(404).json({"error": "Carrito no encontrado"})
    }
})

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
console.log(` Server running http://localhost:${PORT}`)
})

server.on('error', (err) => console.log(err));