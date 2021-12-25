import type { Event,NodeClient } from '@amplitude/node'
import { AMPLITUDE_KEY } from '../config.json'

const IS_PROD = process.env.NODE_ENV === 'production'

let client: NodeClient
const getAmplitude = async() => {
	if(!client) {
		const { init } = await import("@amplitude/node")
		client = init(AMPLITUDE_KEY, { })
	}

	return client
}

export const logEvent = async(event: Event) => {
	if(!IS_PROD) {
		return
	}
	
	const client = await getAmplitude()
	await client.logEvent(event)
}

export default getAmplitude