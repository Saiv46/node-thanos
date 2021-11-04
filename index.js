const { Anvil } = require('prismarine-provider-anvil')
const RegionFile = require('prismarine-provider-anvil/src/region')
const NBT = require('prismarine-nbt')
const fsPromises = require('fs/promises')
const path = require('path')

class AnvilThanos {
	constructor (directory) {
		this.minInhabitedTime = 0
		this.isInitialized = false
		this.directory = directory
		this.name = ''
		this.version = ''
		this.anvil = null
	}
	async init () {
		if (this.isInitialized) return
		const levelDat = await fsPromises.readFile(path.join(this.directory, 'level.dat'))
		const { parsed } = await NBT.parse(levelDat)
		const { Data: { LevelName, Version } } = NBT.simplify(parsed)
		this.name = LevelName
		this.version = Version.Name
		if (!this.version) {
			throw new Error('Cannot get version from world')
		}
		this.anvil = new (Anvil(this.version))(path.join(this.directory, 'region'))
		this.isInitialized = true
	}

	async* regionIterator (anvil) {
		const regions = await fsPromises.readdir(anvil.path)
		for (const regionName of regions) {
			if (!(regionName.startsWith('r.') && regionName.endsWith('.mca'))) continue
			const [regionX, regionZ] = regionName.split('.').slice(1, -1).map(Number)
			yield await anvil.getRegion(regionX * 32, regionZ * 32)
		}
	}

	async* chunkIterator (oldRegion, newRegion) {
		for (let x = 0; x < 32; x++) {
			for (let z = 0; x < 32; x++) {
				if (!oldRegion.hasChunk(x, z)) continue
				yield new AnvilThanosChunk(x, z, await oldRegion.read(x, z), newRegion)
			}
		}
	}

	async* thanosIterator (keepBackups = true) {
		await this.init()
		for await (const oldRegion of this.regionIterator(this.anvil)) {
			const regionPath = oldRegion.fileName
			const newRegion = new RegionFile(regionPath + '~')
			await newRegion.initialize()
			for await (const chunk of this.chunkIterator(oldRegion, newRegion)) {
				yield chunk
			}
			await oldRegion.q
			await newRegion.q
			if (oldRegion.file) await oldRegion.close()
			if (newRegion.file) await newRegion.close()
			if (keepBackups) {
				await fsPromises.rename(regionPath, regionPath + '.bak')
			}
			await fsPromises.rename(regionPath + '~', regionPath)
		}
	}

	// async *entries () {}
	// async *keys () {}
	// async *values () {}
	// [Symbol.asyncIterator] () { return this.values() }

	async snap (keepBackups = true) {
		if (this.minInhabitedTime < 0) {
			throw new Error('minInhabitedTime must be a non-negative number')
		}
		let removedChunks = 0
		let totalChunks = 0
		for await (const chunk of this.thanosIterator(keepBackups)) {
			totalChunks++
			if (chunk.getInhabitedTime() > this.minInhabitedTime) {
				await chunk.save()
			} else {
				removedChunks++
			}
		}
		return { removedChunks, totalChunks }
	}
}

class AnvilThanosChunk {
	constructor (x, z, chunkData, newRegion) {
		this.x = x
		this.z = z
		this.chunkData = chunkData
		this.newRegion = newRegion
		this.isSaved = false
	}

	getInhabitedTime () {
		const nbt = NBT.simplify(this.chunkData)
		return nbt.Level.InhabitedTime ?? Number.POSITIVE_INFINITY
	}

	async save () {
		if (this.isSaved) return
		this.newRegion.write(this.x, this.z, this.chunkData)
		this.isSaved = true
	}
}

module.exports = { AnvilThanos, AnvilThanosChunk }
