
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://emilypardo201111_db_user:emily2511@emily.bjaboxd.mongodb.net/';
const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('Faweb');

        console.log('La conexión a la Base de Datos fue Exitosa!!!');

        return db;
    } catch (error) {
        console.error('Uff ha ocurrido un error ', error);
        throw error;
    }
}

const getDb = () => db;

module.exports = {
    connectDB,
    getDb,
    ObjectId
};
