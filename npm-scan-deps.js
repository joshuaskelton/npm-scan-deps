// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";

var ls = require("npm-remote-ls").ls;
var parseArgs = require("minimist");
var argv = parseArgs(process.argv.slice(2), {alias: {v: "version", h: "help"}});
var securityHoldingPackages = require("./securityHoldingPackages.json").packages;

if (argv.version) {
    var version = require("./package.json").version;
    console.log(version);
    process.exit(0);
}

var showUsage = function() {
        console.log(
`Usage: npm-scan-deps <package>

Options:
  -h, --help
  -v, --version
`
    );
};

if (argv.help || argv._.length === 0) {
    showUsage();
    process.exit(0);
}

var npmPackageRegex = /([\w-]+)(?:@(.*))?/;
var matches = npmPackageRegex.exec(argv._[0]);
var packageName = matches[1];
var packageVersion = matches[2] || "latest";
var foundPackages = [];

ls(packageName, packageVersion, true, function(dependencies) {
    dependencies.forEach(function(dependencyName) {
        var matches = npmPackageRegex.exec(dependencyName);
        var name = matches[1];

        if (securityHoldingPackages.indexOf(name) >= 0) {
            if (foundPackages.indexOf(name) === -1) {
                foundPackages.push(name);
            }
        }
    });

    console.log(`Scanned: ${dependencies.length} dependencies`);
    console.log(`Found: ${foundPackages.length} issue(s)`);

    foundPackages.forEach(function(packageName) {
        console.log(`  ${foundPackages.indexOf(packageName) + 1}. ${packageName}`);
    });

    console.log("");
});
