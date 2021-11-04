declare module 'minecraft-node-thanos' {
	export class AnvilThanos {
		minInhabitedTime: number
		directory: string
		name: string
		version: string
		isInitialized: boolean
		private anvil: any

		constructor (directory: string)
		// You should call this method before doing anything else
		// This will read name and version for provided world
		init (): Promise<void>
	
		private regionIterator (anvil: any): AsyncIterator<any, void>
		private chunkIterator (oldRegion, newRegion): AsyncIterator<AnvilThanosChunk, void>
		private thanosIterator (keepBackups?: boolean): AsyncIterator<AnvilThanosChunk, void>
		snap (keepBackups?: boolean): Promise<{ removedChunks: number, totalChunks: number }>
	}

	export class AnvilThanosChunk {
		x: number
		z: number
		isSaved: boolean
		private chunkData: any
		private newRegion: any
		constructor (x: number, z: number, chunkData: any, newRegion: any)
		getInhabitedTime (): number
		save (): Promise<void>
	}
}
