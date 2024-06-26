import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}


const connection : ConnectionObject = {

}

async function dbConnect():Promise<void> {
    if(connection.isConnected) {
        console.log("db connection already done");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URL || "");

        connection.isConnected = db.connections[0].readyState;
        console.log("db connection done");


    } catch (error:any){
        console.log("Database connection failed", error);
        process.exit(1)
        
    }

}

export default dbConnect;