const lernaRun = require('@lerna/run');
const lernaVersion = require('@lerna/version');
const lernaPublish = require('@lerna/publish');

/**
 * Define a static set of versions that are supported. This means that only new
 * binaries for thesse versions will be released.
 */
const supportedVersions = [
    '10.23.0',
    '11.18.0',
    '12.13.0',
    '13.9.0',
    '14.6.0',
    '15.1.0',
];

/**
 * Accept a particular affix that should appended to the version number. The
 * affix will be automatically prefixed with `-`
 */
const affix = process.argv[2] ? `-${process.argv[2]}` : '';

/**
 * Main executor function
 */
async function main() {
    // Loop through each supported version
    for await (let pgVersion of supportedVersions) {
        // Create version number from pgVersion and affix
        const version = `${pgVersion}${affix}`;
        const [major, minor, patch] = pgVersion.split('.');

        // Log start
        console.log(`🔄 Processing v${version}...`);

        // Determine which packages should be ignored
        const ignore = major < 14 ? '@embedded-postgres/darwin-arm64' : '';

        // Download the new versions in all repositories
        await lernaRun({
            cwd: process.cwd(),
            script: 'download',
            '--': [pgVersion],
            ignore,
        });

        // Release the newly downloaded releases
        await lernaVersion({
            cwd: process.cwd(),
            bump: version,
            yes: true,
            forcePublish: true,
            ignore,
        });

        // Publish the packages
        await lernaPublish({
            cwd: process.cwd(),
            bump: 'from-package',
            yes: true,
            ignore,
        });
        
        // Log success
        console.log(`✅ Processing v${version} complete.`)
    }
}

main();
