const fs = require("fs");

class Contenedor {
  constructor(fileName, keys) {
    this._filename = fileName;
    this._keys = [...keys, "id"];
  }
  
  _validateKeysExist(newData) {
    console.log(newData)
    
    const objectKeys = Object.keys(newData);
    console.log(objectKeys)
    let exists = true;
    
    objectKeys.forEach((key) => {
      console.log('corte')
      console.log(this._keys)
      if(!this._keys.includes(key)) {
        exists = false;
        
      }
    })
    return exists;
    
  }


  async getById(id) {
    id = Number(id);
    try {
      const data = await this.getData();
      const parsedData = JSON.parse(data);
      return parsedData.find((producto) => producto.id === id);
    } catch (error) {
      console.log(
        `Error Code: ${error.code} | Ocurrió un error al intentar obtener un elemento por su ID (${id})`
      );
    }
  }

  async deleteById(id) {
    try {
      id = Number(id);
      const data = await this.getData();
      const parsedData = JSON.parse(data);
      const objectIdToBeRemoved = parsedData.find(
        (producto) => producto.id === id
      );

      if (objectIdToBeRemoved) {
        const index = parsedData.indexOf(objectIdToBeRemoved);
        parsedData.splice(index, 1);
        await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
        return true;
      } else {
        console.log(`ID ${id} no existe en el archivo`);
        return null;
      }
    } catch (error) {
      console.log(
        `Error Code: ${error.code} | Ocurrió un error al intentar eliminar un elemento por ID (${id})`
      );
    }
  }

  async updateById(id, newData) {
    if(this._validateKeysExist(newData)){
      try {
        id = Number(id);
        const data = await this.getData();
        const parsedData = JSON.parse(data);
        const objectIdToBeUpdated = parsedData.find(
          (producto) => producto.id === id
        );

        if (objectIdToBeUpdated) {
          const index = parsedData.indexOf(objectIdToBeUpdated);
          Object.keys(objectIdToBeUpdated).forEach( (key) => {
            parsedData[index][key] = newData[key];
          })
    
          await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
          return true;
        } else {
          console.log(`ID ${id} no existe en el archivo`);
          return null;
        }
  
      } catch (error) {
        `Error Code: ${error.code} | Ocurrió un error al intentar actualizar un elemento por ID (${id})`
        console.log('error')
      }
    } else {
      console.log('false')
      return false;
    }
  
    
  }
  
  async addToArrayById(id, objectToAdd) {
    if(this._validateKeysExist(objectToAdd)) {
    try {
      id = Number(id);
      const data = await this.getData();
      const parsedData = JSON.parse(data);
      const objectIdToBeUpdated = parsedData.find(
        (producto) => producto.id === id
      );
      if (objectIdToBeUpdated) {      
        const index = parsedData.indexOf(objectIdToBeUpdated);
        const valorActual = parsedData[index];
        const currentProducts = valorActual['products']
        currentProducts.push(objectToAdd.products)
        
        await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
        return true;
      } else {
        console.log(`ID ${id} no existe en el archivo`);
        return false;
      }

    } catch (error) {
      `Error Code: ${error.code} | Ocurrió un error al intentar actualizar un elemento por ID (${id})`
    }
    } else {
      return false;
    }
  }

  async removeFromArrayById(id, objectToRemoveId, keyName) {
    try {
      id = Number(id);
      const data = await this.getData();
      const parsedData = JSON.parse(data); 
      
      const objectIdToBeUpdated = parsedData.find(
        (producto) => producto.id === id              
      );
      const index = parsedData.indexOf(objectIdToBeUpdated);
      const valorActual = parsedData[index][keyName]; 
      if (Number(valorActual[0].id) == Number(objectToRemoveId)) {
        let indexToBeRemoved = -1;
        valorActual.forEach((element, indexE) => {
          if(element.id == objectToRemoveId) {
            indexToBeRemoved = indexE
          }
        })
        const newArray = [...valorActual];
        
        if (indexToBeRemoved>-1) {
          newArray.splice(indexToBeRemoved,1)
        }
    
        parsedData[index][keyName] = newArray;
        await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
        return true;
      } else {
        console.log(`ID ${id} no existe en el archivo`);
        return false;
      }

    } catch (error) {
      `Error Code: ${error.code} | Ocurrió un error al intentar actualizar un elemento por ID (${id})`
    }
  
  }

  async save(object) {    
    if(this._validateKeysExist(object)) {
      try {
        const allData = await this.getData();
        const parsedData = JSON.parse(allData);
  
        object.id = parsedData.length > 0 ? parsedData[parsedData.length-1].id +1 : 1;
        parsedData.push(object);
  
        await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
        return object.id;
      } catch (error) {
        console.log(
          `Error Code: ${error.code} | Ocurrió un error al tratar de guardar un elemento`
        );
      }
    } else {
      return false;
    }
    
  }

  async deleteAll() {
    try {
      await this._createEmptyFile();
    } catch (error) {
      console.log(
        `Ocurrió un error (${error.code}) al tratar de eliminar todos los objetos`
      );
    }
  }

  async getData() {
    const data = await fs.promises.readFile(this._filename, "utf-8");
    return data;
  }

  async getAll() {
    const data = await this.getData();
    return JSON.parse(data);
  }
}

module.exports = Contenedor;