# Thanos (minecraft-node-thanos)

Thanos is NodeJS port of [eponymous PHP library](https://github.com/aternosorg/thanos), but unlike mentioned library - it removes unused chunks in-place, without need to copy any files. It also can reduce file size of a Minecraft world by more than 50%.

This library also do use inhabited time instead of blocklists, chunks generated by software that doesn't support that (like [flying-squid](https://github.com/PrismarineJS/flying-squid) server) will be ignored.

Currently, only the Minecraft Anvil world format (Java Edition) is supported.

## CLI

```
Usage: cli.js [path]

Options:
      --help                Show help                        [boolean]
      --version             Show version number              [boolean]
  -i, --inhabitedtime       Minimum InhabitedTime for chunk to be
                            keeped, in ticks     [number] [default: 0]
      --keepbackups, --bak  Keep backups of modified regions as .bak files
                                             [boolean] [default: true]

```

To disable backups, add `--no-keepbackups` or `--no-bak` option

## API

See `index.d.ts` file for class description