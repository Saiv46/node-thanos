#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { AnvilThanos } = require('.')

const args = yargs(hideBin(process.argv))
	.usage('Usage: $0 [path]')
	.option('inhabitedtime', {
		alias: 'i',
		type: 'number',
		default: 0,
		description: 'Minimum InhabitedTime for chunk to be keeped, in ticks'
	})
	.option('keepbackups', {
		alias: 'bak',
		type: 'boolean',
		default: true,
		description: 'Keep backups of modified regions as .bak files'
	})
	.demandCommand(1, 'No path specified')
	.argv

async function main() {
	const instance = new AnvilThanos(args._[0])
	instance.minInhabitedTime = args.inhabitedtime
	await instance.init()
	console.log('Processing world "%s" on version %s', instance.name, instance.version)
	const { removedChunks, totalChunks } = await instance.snap(args.keepbackups)
	const percent = Math.round(removedChunks / totalChunks * 100)
	console.log('Done, reduced %d chunks to atoms (-%d%%)', removedChunks, percent)
}

main()
