import mongoose, { connect } from 'mongoose'
import { appEnv } from './constants'

const MONGO_URI = `mongodb+srv://${ process.env.MONGO_USER }:${ process.env.MONGO_PASS }@horses-mouth-sls.mq2xq.mongodb.net/${ process.env.MONGO_DBNAME }?retryWrites=true&w=majority`

export let cachedDb: typeof mongoose

const connectToDatabase = async(): Promise<typeof mongoose> => {
	if( cachedDb )
		return cachedDb

	return await connect(process.env.NODE_ENV === appEnv.prod ?
		MONGO_URI : process.env.SLS_MONGODB_URI!)
}

export default connectToDatabase
